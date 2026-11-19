// src/core/lines-manager.js
// Manages canned speech lines sourced from the active personality with spam cooldowns.

const personalityEngine = require('./personality-engine');
const config = require('./config.json');

class LinesManager {
  constructor() {
    this.lastSpeechTime = 0;
    // Default 90s cooldown to keep Pandu calm and not talk too much
    this.cooldownMs = (config.speechCooldownSec || 90) * 1000;
    // Stagger first idle speech to 90s - 150s from startup
    this.nextIdleSpeechTime = Date.now() + this.cooldownMs + (Math.random() * 60000);
    this.activeDurationMs = 0;
  }

  // Record that a line was spoken (e.g. chat, feed, pet), pushing back idle chatter
  recordSpeech(durationMs = 4000) {
    const now = Date.now();
    this.lastSpeechTime = now;
    this.activeDurationMs = durationMs;
    // Push next idle line back by at least 90s + random jitter
    this.nextIdleSpeechTime = now + this.cooldownMs + (Math.random() * 60000);
  }

  getLine(category, force = false) {
    const now = Date.now();

    if (!force) {
      // Respect cooldown and randomized idle schedule
      if (now < this.nextIdleSpeechTime) {
        return null;
      }
    }

    const line = personalityEngine.getLine(category);
    if (!line) return null;

    this.recordSpeech(3500);
    return line;
  }

  getEventLine(category) {
    return this.getLine(category, true);
  }
}

module.exports = new LinesManager();
