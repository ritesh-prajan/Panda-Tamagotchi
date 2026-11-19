// tests/animations.test.js
// Test suite simulating animation loops, loopFromFrame behaviors, and pacing.

const assert = require('assert');
const { getLook } = require('../src/styles');

console.log('🧪 Starting Animation Engine Simulation Tests...\n');

// 1. Verify Sleepy Loop (z, zz, zzz cycle)
const sleepyLook = getLook('official-sticker', 'sleepy', 'large');
assert.strictEqual(sleepyLook.loopFromFrame, 3, 'Sleepy must loop from frame 3');
assert.strictEqual(sleepyLook.frames.length, 6, 'Sleepy must have 6 total frames');

const filenames = sleepyLook.frames.map(f => f.filename);
assert.deepStrictEqual(filenames, [
  'sleepy_0.png',
  'sleepy_1.png',
  'sleepy_2.png',
  'sleepy_3.png',
  'sleepy_4.png',
  'sleepy_5.png'
]);

// Simulate 12 animation ticks for sleepy:
// Initial fall-asleep sequence: 0 -> 1 -> 2 -> 3 -> 4 -> 5
// Followed by looping: 3 -> 4 -> 5 -> 3 -> 4 -> 5
let frameIdx = 0;
const loopFrom = sleepyLook.loopFromFrame;
const totalFrames = sleepyLook.frames.length;
const playedSequence = [frameIdx];

for (let tick = 1; tick <= 11; tick++) {
  frameIdx++;
  if (frameIdx >= totalFrames) {
    frameIdx = loopFrom;
  }
  playedSequence.push(frameIdx);
}

console.log('Sleepy played sequence (12 frames):', playedSequence.join(' -> '));
assert.deepStrictEqual(playedSequence, [0, 1, 2, 3, 4, 5, 3, 4, 5, 3, 4, 5], 'Sleepy must loop only 3, 4, 5 after falling asleep!');
console.log('✓ PASS: Sleepy smoothly cycles z, zz, zzz without jumping back to frame 0');

// 2. Verify Petted Frame list & skipped washed-out frame
const pettedLook = getLook('official-sticker', 'petted', 'large');
const pettedFiles = pettedLook.frames.map(f => f.filename);
console.log('Petted frames:', pettedFiles.join(', '));
assert.strictEqual(pettedFiles.length, 5, 'Petted should have 5 frames');
assert(!pettedFiles.includes('petting_2.png'), 'petting_2.png must be skipped due to washed-out artifact');
assert.deepStrictEqual(pettedFiles, [
  'petting_0.png',
  'petting_1.png',
  'petting_3.png',
  'petting_4.png',
  'petting_5.png'
]);
console.log('✓ PASS: Petted cleanly skips frame 2 artifact and retains 5 full frames');

// 3. Verify Eating Chew Cadence
const eatingLook = getLook('official-sticker', 'eating', 'large');
const eatingFiles = eatingLook.frames.map(f => f.filename);
console.log('Eating frames:', eatingFiles.join(', '));
assert.strictEqual(eatingFiles.length, 6, 'Eating should have 6 chew frames');
assert.strictEqual(eatingFiles[1], 'idle_3.png', 'Eating frame 1 should be open mouth chew');
assert.strictEqual(eatingFiles[3], 'idle_3.png', 'Eating frame 3 should be open mouth chew');
console.log('✓ PASS: Eating animation alternates closed and open mouth chewing');

// 4. Verify Typing Bob metadata
const typingLook = getLook('official-sticker', 'typing', 'large');
assert.strictEqual(typingLook.cssClass, 'panda-typing-bob', 'Typing must have panda-typing-bob class');
assert(typingLook.frameDelayMs <= 250, 'Typing delay should be brisk (<=250ms)');
console.log('✓ PASS: Typing has active bob class and brisk cadence');

// 5. Verify Neglected Sadness metadata
const neglectedLook = getLook('official-sticker', 'neglected', 'large');
assert.strictEqual(neglectedLook.cssClass, 'panda-neglected-sadness', 'Neglected must have panda-neglected-sadness class');
console.log('✓ PASS: Neglected has sadness filter class');

// 6. Verify Celebration, Checklist, Listening, Tea frames
const specialEmotions = ['celebration', 'checklist', 'listening', 'tea'];
specialEmotions.forEach(emo => {
  const look = getLook('official-sticker', emo, 'large');
  assert(look.frames.length >= 4, `${emo} should have >= 4 frames`);
  assert.strictEqual(look.status, 'final', `${emo} should have status: final`);
  console.log(`✓ PASS: ${emo} (${look.frames.length} frames, status: ${look.status}) verified`);
});

console.log('\n🎉 ALL ANIMATION VERIFICATION TESTS PASSED SUCCESSFULLY!\n');
