// src/main/typing-monitor.js
// Global keystroke counter using uiohook-napi.
// PRIVACY: Counts keystroke frequency only. Never reads, logs, stores, or transmits key codes.

const { uIOhook } = require('uiohook-napi');
const EventEmitter = require('events');

class TypingMonitor extends EventEmitter {
  constructor() {
    super();
    this.totalKeystrokes = 0;
    this.timestamps = [];
    this.sessionStartTime = null;
    this.lastKeystrokeTime = null;
    this.idleTimeoutMs = 5000; // 5 seconds of inactivity = idle
    this.intervalTimer = null;
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;

    try {
      uIOhook.on('keydown', () => {
        this.recordKeystroke();
      });

      uIOhook.start();
      this.isRunning = true;

      // Emit stats every 1 second
      this.intervalTimer = setInterval(() => {
        this.tick();
      }, 1000);
    } catch (err) {
      console.error('Failed to start uIOhook typing monitor:', err);
    }
  }

  recordKeystroke() {
    const now = Date.now();
    this.totalKeystrokes++;
    this.timestamps.push(now);

    // If new session or after idle timeout
    if (!this.lastKeystrokeTime || now - this.lastKeystrokeTime > this.idleTimeoutMs) {
      this.sessionStartTime = now;
    }
    this.lastKeystrokeTime = now;
  }

  tick() {
    const now = Date.now();

    // Rolling window: keep timestamps within the last 10 seconds
    this.timestamps = this.timestamps.filter((t) => now - t <= 10000);

    // Calculate rolling keys per minute (KPM)
    const kpm = Math.round((this.timestamps.length / 10) * 60);

    const isTyping = Boolean(
      this.lastKeystrokeTime && now - this.lastKeystrokeTime <= this.idleTimeoutMs
    );

    let sessionMinutes = 0;
    if (isTyping && this.sessionStartTime) {
      sessionMinutes = Number(((now - this.sessionStartTime) / 60000).toFixed(1));
    }

    this.emit('typing-activity', {
      kpm,
      sessionMinutes,
      isTyping,
      totalKeystrokes: this.totalKeystrokes
    });
  }

  stop() {
    if (!this.isRunning) return;
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
    try {
      uIOhook.stop();
    } catch (err) {
      console.error('Failed to stop uIOhook:', err);
    }
    this.isRunning = false;
  }
}

module.exports = new TypingMonitor();
