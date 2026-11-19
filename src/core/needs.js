// src/core/needs.js
// Tamagotchi Needs Engine: hunger, energy, mood, affection, decay, and neglect mechanics.
//
// State Machine & Neglect Recovery:
// 1. Normal State:
//    - ignoredSeconds increments when unattended.
//    - At stage thresholds (stage1: 15m, stage2: 30m, stage3: 1h, stage4: 2h), shrinkStage rises 0->1->2->3->4.
//    - At stage 4, isRefusingFood becomes true.
//    - In normal state, pet() or feed() resets ignoredSeconds = 0 and shrinkStage = 0.
// 2. Food Refusal State (isRefusingFood = true):
//    - Pandu rejects bamboo snacks (refused: true).
//    - Recovery requires accumulating petsTowardsRecovery up to petsToRecoverFromRefusal (15 pets).
//    - While refusing, shrinkStage visibly steps down every ~4 pets (4 -> 3 -> 2 -> 1).
//    - tick() does NOT reset shrinkStage to 0 while isRefusingFood is true.
//    - Once pets reach 15, isRefusingFood clears to false and shrinkStage resets to 0.
// 3. Sleep Hysteresis:
//    - Pandu starts sleeping when energy < sleepStartThreshold (20) or during night hours (23:00-07:00).
//    - Once asleep (isSleeping = true), energy recovers at +3.0/min.
//    - Pandu stays asleep until energy >= wakeThreshold (70). No flickering around low thresholds.
//    - Petting or dragging triggers a grumpy temporary wake-up (isWokenUp = true for 20s).

const fs = require('fs');
const path = require('path');
const config = require('./config.json');

function clamp(val, min = 0, max = 100) {
  return Math.min(max, Math.max(min, val));
}

class NeedsEngine {
  constructor() {
    this.storagePath = null;
    this.timeMultiplier = 1;
    this.isWokenUp = false;
    this.wakeUpTimer = null;

    this.needs = {
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
      lastSavedTimestamp: Date.now()
    };
  }

  init(storageDir) {
    this.storagePath = path.join(storageDir, 'pandu-needs.json');
    this.load();
    this.applyOfflineDecay();
  }

  getNeeds() {
    return { ...this.needs };
  }

  setTimeMultiplier(multiplier) {
    this.timeMultiplier = Math.max(1, multiplier);
  }

  getTimeMultiplier() {
    return this.timeMultiplier;
  }

  isNightTime(customHour = null) {
    const hour = customHour !== null ? customHour : new Date().getHours();
    return hour >= config.sleepNightStart || hour < config.sleepNightEnd;
  }

  load() {
    if (!this.storagePath || !fs.existsSync(this.storagePath)) {
      return;
    }

    try {
      const raw = fs.readFileSync(this.storagePath, 'utf-8');
      const data = JSON.parse(raw);
      if (typeof data.hunger === 'number') {
        this.needs = {
          ...this.needs,
          ...data
        };
      }
    } catch (err) {
      console.error('Failed to load needs file:', err);
    }
  }

  save() {
    if (!this.storagePath) return;
    try {
      this.needs.lastSavedTimestamp = Date.now();
      fs.writeFileSync(this.storagePath, JSON.stringify(this.needs, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save needs file:', err);
    }
  }

  applyOfflineDecay(customElapsedMs = null) {
    const now = Date.now();
    const elapsedMs = customElapsedMs !== null ? customElapsedMs : (now - (this.needs.lastSavedTimestamp || now));
    if (elapsedMs <= 1000) return;

    // Cap offline decay to maxOfflineHours (e.g. 8 hours)
    const maxMs = (config.maxOfflineHours || 8) * 3600 * 1000;
    const cappedMs = Math.min(elapsedMs, maxMs);
    const elapsedMinutes = cappedMs / 60000;
    const elapsedSeconds = Math.round(cappedMs / 1000);

    // Apply capped decay with survival floors (never dies!)
    this.needs.hunger = Math.max(10, clamp(this.needs.hunger - config.hungerDecayPerMin * elapsedMinutes));
    this.needs.energy = Math.max(15, clamp(this.needs.energy - config.energyDecayPerMin * elapsedMinutes));
    this.needs.mood = Math.max(10, clamp(this.needs.mood - config.moodDecayPerMin * elapsedMinutes));
    this.needs.affection = Math.max(5, clamp(this.needs.affection - config.affectionDecayPerMin * elapsedMinutes));

    this.needs.ignoredSeconds += elapsedSeconds;

    if (this.needs.energy < (config.sleepStartThreshold || 20)) {
      this.needs.isSleeping = true;
    }

    this.updateShrinkAndAnger();
    this.save();
  }

  updateShrinkAndAnger() {
    const stages = config.neglectStagesSec;

    if (this.needs.isRefusingFood) {
      // While in food refusal, shrinkStage must reflect recovery progress and not reset to 0
      const needed = config.petsToRecoverFromRefusal || 15;
      const pets = this.needs.petsTowardsRecovery || 0;
      if (pets >= needed) {
        this.needs.isRefusingFood = false;
        this.needs.shrinkStage = 0;
        this.needs.petsTowardsRecovery = 0;
      } else {
        // Step back one stage every ~4 pets (e.g. 0-3: stage 4, 4-7: stage 3, 8-11: stage 2, 12-14: stage 1)
        const step = Math.floor(needed / 4) || 4;
        this.needs.shrinkStage = Math.max(1, 4 - Math.floor(pets / step));
      }
    } else {
      const sec = this.needs.ignoredSeconds;
      if (sec >= stages.stage4) {
        this.needs.shrinkStage = 4;
        this.needs.isRefusingFood = true;
        this.needs.petsTowardsRecovery = 0;
      } else if (sec >= stages.stage3) {
        this.needs.shrinkStage = 3;
      } else if (sec >= stages.stage2) {
        this.needs.shrinkStage = 2;
      } else if (sec >= stages.stage1) {
        this.needs.shrinkStage = 1;
      } else {
        this.needs.shrinkStage = 0;
      }
    }

    // Anger triggers if neglected after being hungry
    if (this.needs.hunger < 30 && this.needs.ignoredSeconds >= config.ignoredAngerThresholdSec) {
      this.needs.isAngry = true;
    }
  }

  tick(deltaSeconds = 1, options = {}) {
    const effectiveSeconds = deltaSeconds * this.timeMultiplier;
    const deltaMin = effectiveSeconds / 60;

    // Hunger decays
    this.needs.hunger = clamp(this.needs.hunger - config.hungerDecayPerMin * deltaMin);

    // Sleep hysteresis
    const isNight = options.isNight !== undefined ? options.isNight : this.isNightTime();
    const sleepStart = config.sleepStartThreshold !== undefined ? config.sleepStartThreshold : 20;
    const wakeThreshold = config.wakeThreshold !== undefined ? config.wakeThreshold : 70;

    if (this.isWokenUp) {
      this.needs.isSleeping = false;
    } else if (this.needs.isSleeping) {
      // Keep sleeping until energy reaches wakeThreshold
      if (this.needs.energy >= wakeThreshold) {
        this.needs.isSleeping = false;
      }
    } else {
      // Start sleeping when energy drops below sleepStartThreshold or night hours when unattended
      if (this.needs.energy < sleepStart || (isNight && this.needs.ignoredSeconds >= 60)) {
        this.needs.isSleeping = true;
      }
    }

    if (this.needs.isSleeping && !this.isWokenUp) {
      this.needs.energy = clamp(this.needs.energy + config.energySleepRecoveryPerMin * deltaMin);
    } else {
      this.needs.energy = clamp(this.needs.energy - config.energyDecayPerMin * deltaMin);
    }

    // Mood & Affection decay
    this.needs.mood = clamp(this.needs.mood - config.moodDecayPerMin * deltaMin);
    this.needs.affection = clamp(this.needs.affection - config.affectionDecayPerMin * deltaMin);

    // Ignored timer increments
    this.needs.ignoredSeconds += effectiveSeconds;

    this.updateShrinkAndAnger();

    return this.getNeeds();
  }

  pet() {
    // If sleeping or night, wakes grumpily
    const isSleepingNow = Boolean(this.needs.isSleeping || (this.isNightTime() && !this.isWokenUp));
    let wasSleeping = false;
    if (isSleepingNow) {
      this.wakeUpGrumpily();
      wasSleeping = true;
    }

    // Petting calms anger and resets ignored timer
    this.needs.isAngry = false;
    this.needs.ignoredSeconds = 0;

    // If in food refusal stage, requires multiple pets to restore trust
    if (this.needs.isRefusingFood) {
      this.needs.petsTowardsRecovery++;
      const needed = config.petsToRecoverFromRefusal || 15;

      if (this.needs.petsTowardsRecovery >= needed) {
        // Fully recovered from neglect!
        this.needs.isRefusingFood = false;
        this.needs.shrinkStage = 0;
        this.needs.petsTowardsRecovery = 0;
        this.needs.affection = Math.max(75, this.needs.affection + 25);
        this.needs.mood = Math.max(70, this.needs.mood + 20);

        this.save();
        return {
          success: true,
          recovered: true,
          wokeUp: wasSleeping,
          lineCategory: wasSleeping ? 'wake_up' : 'petted',
          remainingPets: 0,
          needs: this.getNeeds()
        };
      }

      // Intermediate pet while refusing: step visual shrinkStage back
      const step = Math.floor(needed / 4) || 4;
      this.needs.shrinkStage = Math.max(1, 4 - Math.floor(this.needs.petsTowardsRecovery / step));
      this.needs.affection = clamp(this.needs.affection + 2);
      this.save();
      return {
        success: true,
        recovered: false,
        wokeUp: wasSleeping,
        lineCategory: wasSleeping ? 'wake_up' : 'petted',
        remainingPets: needed - this.needs.petsTowardsRecovery,
        needs: this.getNeeds()
      };
    }

    // Normal pet
    this.needs.shrinkStage = 0;
    this.needs.affection = clamp(this.needs.affection + config.petAffectionGain);
    this.needs.mood = clamp(this.needs.mood + config.petMoodGain);
    this.save();

    return {
      success: true,
      recovered: false,
      wokeUp: wasSleeping,
      lineCategory: wasSleeping ? 'wake_up' : 'petted',
      needs: this.getNeeds()
    };
  }

  feed() {
    // Check if panda is refusing food due to neglect
    if (this.needs.isRefusingFood) {
      return {
        success: false,
        refused: true,
        lineCategory: 'refuse_food',
        needs: this.getNeeds()
      };
    }

    this.needs.hunger = clamp(this.needs.hunger + config.feedHungerGain);
    this.needs.mood = clamp(this.needs.mood + config.feedMoodGain);
    this.needs.ignoredSeconds = 0;

    if (this.needs.hunger > 50) {
      this.needs.isAngry = false;
    }

    this.save();
    return {
      success: true,
      refused: false,
      lineCategory: 'fed',
      needs: this.getNeeds()
    };
  }

  wakeUpGrumpily() {
    this.isWokenUp = true;
    if (this.wakeUpTimer) {
      clearTimeout(this.wakeUpTimer);
    }
    // Stay awake for 20 seconds before dozing off again if still tired/night
    this.wakeUpTimer = setTimeout(() => {
      this.isWokenUp = false;
      this.wakeUpTimer = null;
    }, 20000);
  }
}

module.exports = new NeedsEngine();
