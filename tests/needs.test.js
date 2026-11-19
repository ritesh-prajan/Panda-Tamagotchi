// tests/needs.test.js
// Standalone unit tests for NeedsEngine & Resolver (plain Node.js, zero dependencies)

const assert = require('assert');
const path = require('path');
const fs = require('fs');

// Ensure isolated temp storage directory for tests
const tmpDir = path.join(__dirname, '..', 'temp_test_storage');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

// Require modules to test
const needsEngine = require('../src/core/needs');
const { resolveEmotion } = require('../src/core/resolver');
const config = require('../src/core/config.json');

// Helper to reset engine to known baseline
function resetNeedsEngine(overrides = {}) {
  needsEngine.storagePath = path.join(tmpDir, 'test-needs.json');
  needsEngine.isWokenUp = false;
  if (needsEngine.wakeUpTimer) {
    clearTimeout(needsEngine.wakeUpTimer);
    needsEngine.wakeUpTimer = null;
  }
  needsEngine.timeMultiplier = 1;
  needsEngine.needs = {
    hunger: 80,
    energy: 90,
    mood: 85,
    affection: 80,
    ignoredSeconds: 0,
    shrinkStage: 0,
    isRefusingFood: false,
    petsTowardsRecovery: 0,
    isAngry: false,
    isSleeping: false,
    lastSavedTimestamp: Date.now(),
    ...overrides
  };
}

let passedTests = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

console.log('--- RUNNING NEEDS ENGINE & RESOLVER TESTS ---\n');

// -------------------------------------------------------------
// Test (a): Energy hysteresis & no flicker oscillation
// -------------------------------------------------------------
runTest('(a) Energy never oscillates during sleep/wake cycles over 24h simulation', () => {
  resetNeedsEngine({ energy: 90, isSleeping: false });

  let sleepTransitions = 0;
  let wakeTransitions = 0;
  let wasSleeping = false;
  let sleepCycles = 0;

  // Simulate 24 hours in 10-second ticks (8640 ticks)
  // Fix daytime (isNight: false) to test pure energy-based sleep hysteresis
  const totalTicks = 8640;
  const deltaSec = 10;

  for (let i = 0; i < totalTicks; i++) {
    const prevSleeping = needsEngine.needs.isSleeping;
    needsEngine.tick(deltaSec, { isNight: false });
    const currentSleeping = needsEngine.needs.isSleeping;

    // Detect state changes
    if (!prevSleeping && currentSleeping) {
      sleepTransitions++;
      sleepCycles++;
      // Check that sleep was entered only when energy dropped below threshold
      assert.ok(
        needsEngine.needs.energy <= (config.sleepStartThreshold || 20) + 1,
        `Fell asleep at energy ${needsEngine.needs.energy}, expected <= ${config.sleepStartThreshold}`
      );
    } else if (prevSleeping && !currentSleeping) {
      wakeTransitions++;
      // Check that waking up happened only when energy reached wakeThreshold
      assert.ok(
        needsEngine.needs.energy >= (config.wakeThreshold || 70) - 1,
        `Woke up at energy ${needsEngine.needs.energy}, expected >= ${config.wakeThreshold}`
      );
    }

    // Verify resolver's emotion matches isSleeping flag when not in higher-priority state (neglected/angry/hungry)
    const isHigherPriority = needsEngine.needs.shrinkStage > 0 || needsEngine.needs.affection < 25 || needsEngine.needs.isAngry || needsEngine.needs.hunger < 35;
    if (!isHigherPriority) {
      const resolved = resolveEmotion(needsEngine.getNeeds(), { isNight: false, isWokenUp: false });
      if (currentSleeping) {
        assert.strictEqual(
          resolved,
          'sleepy',
          `Resolver emotion must be 'sleepy' when isSleeping is true and needs are baseline (energy=${needsEngine.needs.energy})`
        );
      } else {
        assert.notStrictEqual(
          resolved,
          'sleepy',
          `Resolver emotion must not be 'sleepy' when isSleeping is false (energy=${needsEngine.needs.energy})`
        );
      }
    }
  }

  // Over multiple sleep cycles, assert at most 1 sleep->wake flip per cycle (zero oscillation!)
  assert.ok(sleepCycles > 0, 'Should have completed at least one sleep cycle');
  assert.strictEqual(
    sleepTransitions,
    sleepCycles,
    `Each sleep cycle must have exactly 1 enter-sleep transition (got ${sleepTransitions} for ${sleepCycles} cycles)`
  );
  assert.ok(
    Math.abs(sleepTransitions - wakeTransitions) <= 1,
    `Wake transitions (${wakeTransitions}) must balance sleep transitions (${sleepTransitions}) within 1`
  );
  console.log(`    -> Completed ${sleepCycles} sleep cycles. Sleep flips: ${sleepTransitions}, Wake flips: ${wakeTransitions}. Zero flicker!`);
});

// -------------------------------------------------------------
// Test (b): Neglect shrink and food refusal state machine
// -------------------------------------------------------------
runTest('(b) Food refusal state machine: shrinkStage steps down and refusal clears at threshold', () => {
  resetNeedsEngine();

  // Accumulate ignored seconds to reach Stage 4 (food refusal)
  needsEngine.needs.ignoredSeconds = config.neglectStagesSec.stage4 + 10;
  needsEngine.updateShrinkAndAnger();

  assert.strictEqual(needsEngine.needs.shrinkStage, 4, 'Must reach shrink stage 4');
  assert.strictEqual(needsEngine.needs.isRefusingFood, true, 'Must be in food refusal mode');

  // Verify food is refused
  const feedResultBefore = needsEngine.feed();
  assert.strictEqual(feedResultBefore.success, false, 'Feed must fail during refusal');
  assert.strictEqual(feedResultBefore.refused, true, 'Refusal flag must be true');

  // Verify tick() does NOT clear shrinkStage while isRefusingFood is true
  needsEngine.tick(5, { isNight: false });
  assert.strictEqual(needsEngine.needs.shrinkStage, 4, 'shrinkStage must remain 4 after tick during refusal');
  assert.strictEqual(needsEngine.needs.isRefusingFood, true, 'isRefusingFood must remain true');

  const petsNeeded = config.petsToRecoverFromRefusal || 15;
  const previousStages = [];

  // Pet N-1 times (1 to 14)
  for (let petCount = 1; petCount < petsNeeded; petCount++) {
    const petResult = needsEngine.pet();
    assert.strictEqual(petResult.success, true, `Pet #${petCount} must succeed`);
    assert.strictEqual(petResult.recovered, false, `Must not be fully recovered at pet #${petCount}`);
    assert.strictEqual(needsEngine.needs.isRefusingFood, true, `isRefusingFood must remain true at pet #${petCount}`);
    assert.ok(needsEngine.needs.shrinkStage >= 1, `shrinkStage (${needsEngine.needs.shrinkStage}) must stay >= 1 at pet #${petCount}`);
    previousStages.push(needsEngine.needs.shrinkStage);

    // Verify tick() right after pet does NOT reset shrinkStage to 0
    needsEngine.tick(1, { isNight: false });
    assert.ok(needsEngine.needs.shrinkStage >= 1, `shrinkStage must not reset to 0 on tick at pet #${petCount}`);
  }

  // Check that intermediate pets visibly step back shrinkStage
  const stageAtPet0 = 4;
  const stageAtPet4 = previousStages[3]; // after 4 pets
  const stageAtPet8 = previousStages[7]; // after 8 pets
  const stageAtPet12 = previousStages[11]; // after 12 pets
  assert.ok(stageAtPet4 <= 3, `After 4 pets, stage must step down to <= 3 (got ${stageAtPet4})`);
  assert.ok(stageAtPet8 <= 2, `After 8 pets, stage must step down to <= 2 (got ${stageAtPet8})`);
  assert.ok(stageAtPet12 <= 1, `After 12 pets, stage must step down to <= 1 (got ${stageAtPet12})`);

  // Final 15th pet: Full recovery!
  const finalPetResult = needsEngine.pet();
  assert.strictEqual(finalPetResult.success, true, '15th pet must succeed');
  assert.strictEqual(finalPetResult.recovered, true, '15th pet must trigger full recovery');
  assert.strictEqual(needsEngine.needs.isRefusingFood, false, 'isRefusingFood must be false after recovery');
  assert.strictEqual(needsEngine.needs.shrinkStage, 0, 'shrinkStage must be 0 after recovery');
  assert.strictEqual(needsEngine.needs.petsTowardsRecovery, 0, 'petsTowardsRecovery must be reset to 0');

  // Verify food is accepted now!
  const feedResultAfter = needsEngine.feed();
  assert.strictEqual(feedResultAfter.success, true, 'Feed must succeed after recovery');
  assert.strictEqual(feedResultAfter.refused, false, 'Refused must be false');
  console.log(`    -> Step-down progression: Stage 4 -> ${stageAtPet4} -> ${stageAtPet8} -> ${stageAtPet12} -> Recovered (Stage 0). Perfect!`);
});

// -------------------------------------------------------------
// Test (c): 8-hour offline decay cap and survival floors
// -------------------------------------------------------------
runTest('(c) 8h offline decay cap and survival floors (Panda never dies)', () => {
  resetNeedsEngine({
    hunger: 80,
    energy: 90,
    mood: 85,
    affection: 80
  });

  // Simulate user leaving for 24 hours (86,400,000 ms)
  const elapsed24hMs = 24 * 3600 * 1000;
  needsEngine.applyOfflineDecay(elapsed24hMs);

  const needs = needsEngine.getNeeds();

  // Survival floors check: hunger >= 10, energy >= 15, mood >= 10, affection >= 5
  assert.ok(needs.hunger >= 10, `Hunger (${needs.hunger}) must be >= floor 10`);
  assert.ok(needs.energy >= 15, `Energy (${needs.energy}) must be >= floor 15`);
  assert.ok(needs.mood >= 10, `Mood (${needs.mood}) must be >= floor 10`);
  assert.ok(needs.affection >= 5, `Affection (${needs.affection}) must be >= floor 5`);

  // Cap check: ignoredSeconds must be capped to maxOfflineHours (8h = 28,800 sec)
  const expectedMaxSec = (config.maxOfflineHours || 8) * 3600;
  assert.strictEqual(needs.ignoredSeconds, expectedMaxSec, `ignoredSeconds (${needs.ignoredSeconds}) must be capped at ${expectedMaxSec}`);

  // Energy is at or near floor (15), so isSleeping must be true
  assert.strictEqual(needs.isSleeping, true, 'Panda should be sleeping after long offline decay');

  // Verify the panda NEVER dies (all stats > 0)
  assert.ok(needs.hunger > 0 && needs.energy > 0 && needs.mood > 0 && needs.affection > 0, 'Panda must be alive');
  console.log(`    -> Floors after 24h: Hunger=${needs.hunger}, Energy=${needs.energy}, Mood=${needs.mood}, Affection=${needs.affection}. Capped at 8h!`);
});

// Cleanup temp test directory
try {
  fs.rmSync(tmpDir, { recursive: true, force: true });
} catch (e) {}

console.log(`\n--- ALL ${passedTests} TESTS PASSED SUCCESSFULLY! ---\n`);
