// src/ai/rate-limiter.js
// Token-bucket style rate limiter for free-tier Gemini API usage.
// Enforces per-minute limit, daily cap, proactive line cooldown, and 429 backoff.

class RateLimiter {
  constructor(config = {}) {
    this.maxPerMinute = config.maxPerMinute || 10;
    this.maxPerDay = config.maxPerDay || 100;
    this.proactiveCooldownMs = config.proactiveCooldownMs || (5 * 60 * 1000); // 5 minutes

    this.requestTimestamps = [];
    this.dailyCount = 0;
    this.dailyResetDate = new Date().toDateString();

    this.lastProactiveTime = 0;
    this.backoffUntil = 0;
  }

  _checkDailyRollover() {
    const today = new Date().toDateString();
    if (this.dailyResetDate !== today) {
      this.dailyResetDate = today;
      this.dailyCount = 0;
    }
  }

  _cleanupOldTimestamps(now) {
    const oneMinuteAgo = now - 60000;
    this.requestTimestamps = this.requestTimestamps.filter(t => t > oneMinuteAgo);
  }

  canMakeRequest() {
    const now = Date.now();
    this._checkDailyRollover();
    this._cleanupOldTimestamps(now);

    if (now < this.backoffUntil) {
      return false;
    }

    if (this.dailyCount >= this.maxPerDay) {
      return false;
    }

    if (this.requestTimestamps.length >= this.maxPerMinute) {
      return false;
    }

    return true;
  }

  canMakeProactive() {
    if (!this.canMakeRequest()) return false;
    const now = Date.now();
    return (now - this.lastProactiveTime) >= this.proactiveCooldownMs;
  }

  recordRequest() {
    const now = Date.now();
    this._checkDailyRollover();
    this.requestTimestamps.push(now);
    this.dailyCount += 1;
  }

  recordProactive() {
    this.lastProactiveTime = Date.now();
    this.recordRequest();
  }

  handleRateLimit() {
    // Back off for 60 seconds on HTTP 429
    this.backoffUntil = Date.now() + 60000;
  }

  getUsageStats() {
    const now = Date.now();
    this._checkDailyRollover();
    this._cleanupOldTimestamps(now);

    const isBackingOff = now < this.backoffUntil;
    const proactiveMsRemaining = Math.max(0, (this.lastProactiveTime + this.proactiveCooldownMs) - now);

    return {
      requestsThisMinute: this.requestTimestamps.length,
      maxPerMinute: this.maxPerMinute,
      requestsToday: this.dailyCount,
      dailyLimit: this.maxPerDay,
      isBackingOff,
      backoffSecondsRemaining: isBackingOff ? Math.ceil((this.backoffUntil - now) / 1000) : 0,
      nextProactiveAvailableInSec: Math.ceil(proactiveMsRemaining / 1000)
    };
  }
}

module.exports = RateLimiter;
