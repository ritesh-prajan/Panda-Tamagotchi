// src/core/personality-engine.js
// Manages the 5 Pandu personalities, manual lock timers, and anti-flicker auto-switch heuristics.

const fs = require('fs');
const path = require('path');
const { getPersonality, getAllPersonalities } = require('../personalities');

class PersonalityEngine {
  constructor() {
    this.storagePath = null;
    this.currentPersonalityId = 'scholar';
    this.isManualLock = false;
    this.manualLockUntil = 0;
    this.isAutoSwitchEnabled = true;
    this.lastSwitchTime = Date.now();
    this.lastSwitchReason = 'Default starter companion: Scholar Panda.';

    // 2 hours manual lock by default, 15 min anti-flicker minimum duration
    this.manualLockDurationMs = 2 * 60 * 60 * 1000;
    this.minAutoDurationMs = 15 * 60 * 1000;
  }

  init(storageDir) {
    this.storagePath = path.join(storageDir, 'pandu-settings.json');
    this.load();
  }

  getCurrentPersonality() {
    return getPersonality(this.currentPersonalityId);
  }

  getStatus() {
    const now = Date.now();
    const isLocked = this.isManualLock && now < this.manualLockUntil;
    let lockRemainingMinutes = 0;
    if (isLocked) {
      lockRemainingMinutes = Math.max(1, Math.round((this.manualLockUntil - now) / 60000));
    }

    return {
      currentPersonalityId: this.currentPersonalityId,
      currentPersonality: this.getCurrentPersonality(),
      isManualLock: isLocked,
      manualLockRemainingMinutes: lockRemainingMinutes,
      isAutoSwitchEnabled: !isLocked,
      lastSwitchReason: this.lastSwitchReason,
      availablePersonalities: getAllPersonalities()
    };
  }

  setManualPersonality(id, lockHours = 2) {
    const personality = getPersonality(id);
    this.currentPersonalityId = personality.id;
    this.isManualLock = true;
    this.manualLockUntil = Date.now() + lockHours * 60 * 60 * 1000;
    this.lastSwitchTime = Date.now();
    this.lastSwitchReason = `Manually selected: ${personality.name} (locked for ${lockHours}h).`;
    this.save();
    return this.getStatus();
  }

  resumeAutoSwitch() {
    this.isManualLock = false;
    this.manualLockUntil = 0;
    this.lastSwitchReason = 'Auto-switch resumed by user.';
    this.save();
    return this.getStatus();
  }

  evaluateAutoSwitch(context = {}) {
    const now = Date.now();

    // Check if manual lock is active
    if (this.isManualLock) {
      if (now < this.manualLockUntil) {
        return false; // Still locked
      }
      this.isManualLock = false; // Lock expired
    }

    // Anti-flicker cooldown check (e.g. 15 mins, or 30s in fast time)
    const effectiveMinDuration = context.isFastTime ? 30000 : this.minAutoDurationMs;
    if (now - this.lastSwitchTime < effectiveMinDuration) {
      return false;
    }

    const hour = context.hour !== undefined ? context.hour : new Date().getHours();
    const kpm = context.kpm || 0;
    const sessionMinutes = context.sessionMinutes || 0;
    const ignoredSeconds = context.ignoredSeconds || 0;

    let targetId = this.currentPersonalityId;
    let reason = this.lastSwitchReason;

    // 1. Late Night (11 PM - 6 AM): Sleepy Bao
    if (hour >= 23 || hour < 6) {
      targetId = 'sleepy';
      reason = 'Late-night hours: Sleepy Bao is here for cozy winding-down.';
    }
    // 2. High Sustained Typing (>70 KPM or >15m session): Coach Bamboo
    else if (kpm >= 70 || sessionMinutes >= 15) {
      targetId = 'coach';
      reason = 'High sustained typing intensity! Coach Bamboo is hyping you up!';
    }
    // 3. Procrastination / Long Idle (>10m ignored during day): Sassy Pandi
    else if (ignoredSeconds >= 600 || (sessionMinutes === 0 && hour >= 10 && hour <= 19 && kpm === 0)) {
      targetId = 'sassy';
      reason = 'Inactivity detected during work hours. Sassy Pandi is here with tough love.';
    }
    // 4. Maximum Speed Bursts (>120 KPM): Hyper Mochi
    else if (kpm >= 120) {
      targetId = 'hyper';
      reason = 'Ultra-fast typing burst! Hyper Mochi is matching your energy!';
    }
    // 5. Morning Focus Hours (7 AM - 11 AM): Scholar Panda
    else if (hour >= 7 && hour < 12) {
      targetId = 'scholar';
      reason = 'Morning study block: Scholar Panda is ready for deep learning.';
    }

    if (targetId !== this.currentPersonalityId) {
      const targetPersonality = getPersonality(targetId);
      this.currentPersonalityId = targetPersonality.id;
      this.lastSwitchTime = now;
      this.lastSwitchReason = reason;
      this.save();
      return true; // Switched!
    }

    return false;
  }

  getLine(category, force = false) {
    const personality = this.getCurrentPersonality();
    const categoryLines = personality.lines[category] || personality.lines.happy;
    if (!categoryLines || categoryLines.length === 0) {
      return null;
    }
    const idx = Math.floor(Math.random() * categoryLines.length);
    return categoryLines[idx];
  }

  load() {
    if (!this.storagePath || !fs.existsSync(this.storagePath)) {
      return;
    }
    try {
      const raw = fs.readFileSync(this.storagePath, 'utf-8');
      const data = JSON.parse(raw);
      if (data.currentPersonalityId) {
        this.currentPersonalityId = data.currentPersonalityId;
        this.isManualLock = Boolean(data.isManualLock);
        this.manualLockUntil = Number(data.manualLockUntil) || 0;
        this.lastSwitchReason = data.lastSwitchReason || this.lastSwitchReason;
      }
    } catch (err) {
      console.error('Failed to load personality settings:', err);
    }
  }

  save() {
    if (!this.storagePath) return;
    try {
      let existing = {};
      if (fs.existsSync(this.storagePath)) {
        try {
          existing = JSON.parse(fs.readFileSync(this.storagePath, 'utf-8'));
        } catch (e) {}
      }

      const toSave = {
        ...existing,
        currentPersonalityId: this.currentPersonalityId,
        isManualLock: this.isManualLock,
        manualLockUntil: this.manualLockUntil,
        lastSwitchReason: this.lastSwitchReason
      };

      fs.writeFileSync(this.storagePath, JSON.stringify(toSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save personality settings:', err);
    }
  }
}

module.exports = new PersonalityEngine();
