// src/main/window-monitor.js
// Active window polling using active-win (dynamically imported ESM).
// Geometry tracking: extracts bounds, handles maximized/minimized/fullscreen states and multi-monitor setups.
// PRIVACY: App name, title, and bounds are processed in memory only; never stored to disk or transmitted.

const EventEmitter = require('events');
let electronScreen = null;

try {
  electronScreen = require('electron').screen;
} catch (e) {
  // Headless test fallback
}

class WindowMonitor extends EventEmitter {
  constructor() {
    super();
    this.activeWinFn = null;
    this.pollTimer = null;
    this.lastAppName = '';
    this.lastTitle = '';
    this.lastBounds = { x: 0, y: 0, width: 0, height: 0 };
    this.isRunning = false;
  }

  async init() {
    if (this.activeWinFn) return;
    try {
      const activeWinModule = await import('active-win');
      this.activeWinFn = activeWinModule.default;
    } catch (err) {
      console.error('Failed to dynamically import active-win:', err);
    }
  }

  async start(intervalMs = 400) {
    if (this.isRunning) return;
    await this.init();

    if (!this.activeWinFn) {
      console.warn('active-win not available; window monitoring skipped.');
      return;
    }

    this.isRunning = true;
    this.pollTimer = setInterval(() => {
      this.checkActiveWindow();
    }, intervalMs);

    // Initial check
    this.checkActiveWindow();
  }

  async checkActiveWindow() {
    if (!this.activeWinFn) return;
    try {
      const win = await this.activeWinFn();
      if (!win) return;

      const appName = win.owner?.name || win.name || 'Unknown';
      const title = win.title || '';
      const b = win.bounds || { x: 0, y: 0, width: 0, height: 0 };

      // Filter out Pandu's own window or transparent overlay from triggering self-dodges
      const lowerApp = appName.toLowerCase();
      if (lowerApp.includes('pandu') || lowerApp.includes('electron')) {
        return;
      }

      // Detect minimized windows (Windows sets coordinates to -32000, -32000)
      const isMinimized = b.width <= 0 || b.height <= 0 || b.x <= -10000 || b.y <= -10000;

      let isMaximized = false;
      let isFullscreen = false;
      let displayId = null;

      if (!isMinimized && electronScreen) {
        try {
          const matchingDisplay = electronScreen.getDisplayMatching(b);
          if (matchingDisplay) {
            displayId = matchingDisplay.id;
            const { workArea, bounds: dbBounds } = matchingDisplay;

            // Maximized check: fills the work area (accounting for title bar borders)
            isMaximized = (b.width >= workArea.width - 24 && b.height >= workArea.height - 24);

            // Fullscreen check: covers the entire display bounds including taskbar
            isFullscreen = (b.width >= dbBounds.width - 4 && b.height >= dbBounds.height - 4);
          }
        } catch (e) {}
      }

      const appChanged = appName !== this.lastAppName || title !== this.lastTitle;
      const boundsChanged = Math.abs(b.x - this.lastBounds.x) > 6 ||
                            Math.abs(b.y - this.lastBounds.y) > 6 ||
                            Math.abs(b.width - this.lastBounds.width) > 6 ||
                            Math.abs(b.height - this.lastBounds.height) > 6;

      if (appChanged) {
        this.lastAppName = appName;
        this.lastTitle = title;
        this.emit('active-app-changed', {
          appName,
          title
        });
      }

      if (appChanged || boundsChanged) {
        this.lastBounds = { x: b.x, y: b.y, width: b.width, height: b.height };
        this.emit('active-window-geometry', {
          appName,
          title,
          bounds: { ...this.lastBounds },
          isMinimized,
          isMaximized,
          isFullscreen,
          displayId
        });
      }
    } catch (err) {
      // Quiet fail if OS window query fails on lockscreen or protected window
    }
  }

  stop() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    this.isRunning = false;
  }
}

module.exports = new WindowMonitor();
