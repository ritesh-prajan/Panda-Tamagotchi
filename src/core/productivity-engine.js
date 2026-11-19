// src/core/productivity-engine.js
// Handles typing-session break reminders, break rewards, due-soon task alerts, and in-character nagging.

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

class ProductivityEngine extends EventEmitter {
  constructor() {
    super();
    this.storagePath = null;

    // Break settings
    this.breakThresholdMinutes = 50; // default 50 mins
    this.shortenTimers = false; // debug fast testing flag (1.5 mins)

    // Continuous typing tracking
    this.continuousTypingMinutes = 0;
    this.sessionStartTime = null;
    this.lastKeystrokeTime = null;
    this.maxIdleGapMs = 180 * 1000; // 3 minutes of zero typing resets the continuous session

    this.isBreakPromptActive = false;
    this.snoozeUntil = 0;

    // Nagging & due-soon trackers
    this.lastNagTime = 0;
    this.nagCooldownMs = 25 * 60 * 1000; // 25 mins between empty/untouched nags
  }

  init(storageDir) {
    this.storagePath = path.join(storageDir, 'pandu-settings.json');
    this.load();
  }

  load() {
    if (!this.storagePath || !fs.existsSync(this.storagePath)) return;
    try {
      const data = fs.readFileSync(this.storagePath, 'utf-8');
      const settings = JSON.parse(data);
      if (settings.breakThresholdMinutes !== undefined) {
        this.breakThresholdMinutes = Number(settings.breakThresholdMinutes);
      }
      if (settings.shortenTimers !== undefined) {
        this.shortenTimers = Boolean(settings.shortenTimers);
      }
    } catch (err) {
      console.error('Failed to load productivity settings:', err);
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
      existing.breakThresholdMinutes = this.breakThresholdMinutes;
      existing.shortenTimers = this.shortenTimers;
      fs.writeFileSync(this.storagePath, JSON.stringify(existing, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save productivity settings:', err);
    }
  }

  getEffectiveThresholdMinutes() {
    return this.shortenTimers ? 1.5 : this.breakThresholdMinutes;
  }

  onTypingActivity(data, isFocusMode = false) {
    const now = Date.now();

    if (data.isTyping) {
      if (!this.lastKeystrokeTime || (now - this.lastKeystrokeTime > this.maxIdleGapMs)) {
        // Start or restart continuous session
        this.sessionStartTime = now;
      }
      this.lastKeystrokeTime = now;
    } else {
      // Check if idle gap exceeded to reset
      if (this.lastKeystrokeTime && (now - this.lastKeystrokeTime > this.maxIdleGapMs)) {
        this.sessionStartTime = null;
        this.continuousTypingMinutes = 0;
      }
    }

    if (this.sessionStartTime) {
      this.continuousTypingMinutes = Number(((now - this.sessionStartTime) / 60000).toFixed(1));
    } else {
      this.continuousTypingMinutes = 0;
    }

    // Check if break should trigger
    const threshold = this.getEffectiveThresholdMinutes();
    if (!isFocusMode &&
        this.continuousTypingMinutes >= threshold &&
        !this.isBreakPromptActive &&
        now >= this.snoozeUntil) {
      this.triggerBreakPrompt();
    }
  }

  triggerBreakPrompt() {
    this.isBreakPromptActive = true;
    this.emit('break-prompt', {
      continuousTypingMinutes: this.continuousTypingMinutes,
      thresholdMinutes: this.getEffectiveThresholdMinutes()
    });
  }

  takeBreak(needsEngine) {
    const now = Date.now();
    this.sessionStartTime = now;
    this.continuousTypingMinutes = 0;
    this.isBreakPromptActive = false;
    this.snoozeUntil = 0;

    // Award tamagotchi happiness
    if (needsEngine && needsEngine.needs) {
      needsEngine.needs.mood = Math.min(100, Math.round(needsEngine.needs.mood + 15));
      needsEngine.needs.affection = Math.min(100, Math.round(needsEngine.needs.affection + 10));
      needsEngine.needs.ignoredSeconds = 0;
      needsEngine.save();
    }

    this.emit('break-resolved', { action: 'taken' });
    return { success: true, moodGain: 15, affectionGain: 10 };
  }

  snoozeBreak(minutes = 5) {
    const snoozeMs = this.shortenTimers ? (30 * 1000) : (minutes * 60 * 1000);
    this.snoozeUntil = Date.now() + snoozeMs;
    this.isBreakPromptActive = false;
    this.emit('break-resolved', { action: 'snoozed', snoozeUntil: this.snoozeUntil });
    return { success: true, snoozeUntil: this.snoozeUntil };
  }

  setBreakThreshold(minutes) {
    const parsed = Number(minutes);
    if (!isNaN(parsed) && parsed >= 5 && parsed <= 120) {
      this.breakThresholdMinutes = parsed;
      this.save();
    }
    return this.breakThresholdMinutes;
  }

  setShortenTimers(enable) {
    this.shortenTimers = Boolean(enable);
    this.save();
    return this.shortenTimers;
  }

  getStatus() {
    return {
      continuousTypingMinutes: this.continuousTypingMinutes,
      breakThresholdMinutes: this.breakThresholdMinutes,
      effectiveThresholdMinutes: this.getEffectiveThresholdMinutes(),
      shortenTimers: this.shortenTimers,
      isBreakPromptActive: this.isBreakPromptActive,
      isSnoozed: Date.now() < this.snoozeUntil,
      snoozeRemainingSeconds: Math.max(0, Math.ceil((this.snoozeUntil - Date.now()) / 1000))
    };
  }

  // Periodic check (every 30-40s) for due tasks and empty/untouched nags
  evaluateReminders({ todoManager, personalityEngine, isFocusMode, sendSpeechLine }) {
    if (isFocusMode || !todoManager || !personalityEngine) return;

    const now = Date.now();

    // 1. Due soon tasks check (tasks due within next 30 minutes)
    const dueSoon = todoManager.getTasksDueSoon(30);
    if (dueSoon && dueSoon.length > 0) {
      for (const task of dueSoon) {
        let line = personalityEngine.getLine('todo_due_soon');
        if (line) {
          line = line.replace('[TASK]', task.title);
          sendSpeechLine(line, 4500);
          return; // Send one reminder at a time to prevent spam
        }
      }
    }

    // 2. Nagging for empty or untouched list disabled per user request:
    // (User requested no constant nagging/reminders to open todo list)
    /*
    const nagCooldown = this.shortenTimers ? (60 * 1000) : this.nagCooldownMs;
    if (now - this.lastNagTime >= nagCooldown) {
      if (todoManager.isEmpty() || todoManager.hasUntouchedTasks(2)) {
        const nagLine = personalityEngine.getLine('todo_empty_nag');
        if (nagLine) {
          this.lastNagTime = now;
          sendSpeechLine(nagLine, 4500);
        }
      }
    }
    */
  }
}

module.exports = new ProductivityEngine();
