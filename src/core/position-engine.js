// src/core/position-engine.js
// Smart positioning engine for Pandu: Dodge, Peek, Smart modes, anti-jitter, and per-app safe zones.

const fs = require('fs');
const path = require('path');

class PositionEngine {
  constructor() {
    this.storagePath = null;
    this.mode = 'smart'; // 'off', 'dodge', 'peek', 'smart'
    this.followActiveMonitor = false;
    this.hideOnFullscreen = false;

    this.homePosition = null; // { x, y }
    this.currentPosition = { x: 0, y: 0 };
    this.currentSize = 'large'; // 'large', 'medium', 'tiny'

    this.perAppSpots = {}; // { [appName]: { x, y, displayId } }

    this.lastManualDragTime = 0;
    this.manualDragGraceMs = 30000; // Manual drag wins for 30s
    this.lastAutoMoveTime = 0;
    this.minAutoIntervalMs = 1200; // Anti-jitter interval

    this.isDodging = false;
    this.isPeeking = false;
    this.isHoveringPeek = false;
    this.lastComputedFreeZones = [];
    this.lastActiveWindowBounds = null;
  }

  init(storageDir) {
    this.storagePath = path.join(storageDir, 'pandu-settings.json');
    this.load();
  }

  setMode(mode) {
    const validModes = ['off', 'dodge', 'peek', 'smart'];
    if (validModes.includes(mode)) {
      this.mode = mode;
      this.save();
    }
    return this.mode;
  }

  setFollowActiveMonitor(enable) {
    this.followActiveMonitor = Boolean(enable);
    this.save();
    return this.followActiveMonitor;
  }

  setHideOnFullscreen(enable) {
    this.hideOnFullscreen = Boolean(enable);
    this.save();
    return this.hideOnFullscreen;
  }

  recordManualDrag(x, y) {
    this.lastManualDragTime = Date.now();
    this.currentPosition = { x: Math.round(x), y: Math.round(y) };
    this.homePosition = { ...this.currentPosition };
    this.isDodging = false;
    this.isPeeking = false;
    this.save();
  }

  setHomePosition(x, y) {
    this.homePosition = { x: Math.round(x), y: Math.round(y) };
    this.save();
  }

  rememberSpotForApp(appName, x, y, displayId = null) {
    if (!appName) return false;
    const cleanApp = String(appName).trim().toLowerCase();
    this.perAppSpots[cleanApp] = {
      x: Math.round(x),
      y: Math.round(y),
      displayId
    };
    this.save();
    return true;
  }

  forgetSpotForApp(appName) {
    if (!appName) return false;
    const cleanApp = String(appName).trim().toLowerCase();
    if (this.perAppSpots[cleanApp]) {
      delete this.perAppSpots[cleanApp];
      this.save();
      return true;
    }
    return false;
  }

  getPerAppSpots() {
    return { ...this.perAppSpots };
  }

  setPeekHover(isHovering) {
    this.isHoveringPeek = Boolean(isHovering);
  }

  // Check 2D bounding rectangle intersection with hysteresis margin
  intersects(r1, r2, margin = 12) {
    return !(
      r1.x + r1.width - margin <= r2.x ||
      r1.x + margin >= r2.x + r2.width ||
      r1.y + r1.height - margin <= r2.y ||
      r1.y + margin >= r2.y + r2.height
    );
  }

  // Calculate free corner zones on a display's workArea that don't collide with windowRect
  computeFreeCorners(workArea, pandaW, pandaH, windowRect) {
    const pad = 18;
    const corners = [
      { name: 'bottom-right', x: workArea.x + workArea.width - pandaW - pad, y: workArea.y + workArea.height - pandaH - pad },
      { name: 'bottom-left', x: workArea.x + pad, y: workArea.y + workArea.height - pandaH - pad },
      { name: 'top-right', x: workArea.x + workArea.width - pandaW - pad, y: workArea.y + pad },
      { name: 'top-left', x: workArea.x + pad, y: workArea.y + pad }
    ];

    const freeZones = [];
    corners.forEach(corner => {
      const rect = { x: corner.x, y: corner.y, width: pandaW, height: pandaH };
      const collides = windowRect && this.intersects(rect, windowRect, 10);
      freeZones.push({
        ...corner,
        width: pandaW,
        height: pandaH,
        isFree: !collides
      });
    });

    this.lastComputedFreeZones = freeZones;
    return freeZones;
  }

  evaluatePosition({
    activeWindow,
    display,
    currentPandaBounds,
    pandaDimensions = { large: { width: 330, height: 340 }, medium: { width: 260, height: 260 }, tiny: { width: 180, height: 160 } }
  }) {
    const now = Date.now();

    // 0. Off Mode: no auto-positioning
    if (this.mode === 'off') {
      return null;
    }

    // 1. Manual Drag Grace Period (User drag always wins for 30s)
    if (now - this.lastManualDragTime < this.manualDragGraceMs) {
      return null;
    }

    // 2. Anti-jitter cooldown
    if (now - this.lastAutoMoveTime < this.minAutoIntervalMs) {
      return null;
    }

    const workArea = (display && display.workArea) || (display && display.bounds) || display || { x: 0, y: 0, width: 1920, height: 1080 };

    // Default home fallback
    const home = this.homePosition || {
      x: workArea.x + workArea.width - pandaDimensions.large.width - 24,
      y: workArea.y + workArea.height - pandaDimensions.large.height - 24
    };

    if (!activeWindow || activeWindow.isMinimized) {
      // No active window interfering: return home at large size
      if (this.isDodging || this.isPeeking) {
        this.isDodging = false;
        this.isPeeking = false;
        this.lastAutoMoveTime = now;
        return {
          targetX: home.x,
          targetY: home.y,
          size: 'large',
          action: 'return-home'
        };
      }
      return null;
    }

    // 3. Fullscreen check
    if (activeWindow.isFullscreen) {
      if (this.hideOnFullscreen) {
        return { shouldHide: true, action: 'hide-fullscreen' };
      }
    }

    // 4. Per-App Safe Zone: if user remembered a spot for this app, prioritize it
    const cleanAppName = (activeWindow.appName || '').trim().toLowerCase();
    if (this.perAppSpots[cleanAppName]) {
      const appSpot = this.perAppSpots[cleanAppName];
      const isAlreadyThere = Math.abs(currentPandaBounds.x - appSpot.x) < 8 && Math.abs(currentPandaBounds.y - appSpot.y) < 8;
      if (!isAlreadyThere) {
        this.lastAutoMoveTime = now;
        return {
          targetX: appSpot.x,
          targetY: appSpot.y,
          size: 'large',
          action: 'per-app-safe-zone'
        };
      }
      return null;
    }

    const winBounds = activeWindow.bounds;
    this.lastActiveWindowBounds = winBounds;

    // Check overlap with current panda bounds
    const isOverlapping = this.intersects(currentPandaBounds, winBounds, 16);

    // 5. PEEK MODE
    if (this.mode === 'peek') {
      if (isOverlapping || activeWindow.isMaximized) {
        // Tuck to right edge of screen
        const tinyW = pandaDimensions.tiny.width;
        const tinyH = pandaDimensions.tiny.height;
        const peekX = this.isHoveringPeek
          ? workArea.x + workArea.width - tinyW - 8
          : workArea.x + workArea.width - 60; // Tuck showing tiny head
        const peekY = Math.min(workArea.y + workArea.height - tinyH - 24, Math.max(workArea.y + 24, currentPandaBounds.y));

        this.isPeeking = true;
        this.isDodging = false;
        this.lastAutoMoveTime = now;
        return {
          targetX: peekX,
          targetY: peekY,
          size: 'tiny',
          action: this.isHoveringPeek ? 'peek-expand' : 'peek-tuck'
        };
      } else if (this.isPeeking) {
        // Un-peek when overlap ends
        this.isPeeking = false;
        this.lastAutoMoveTime = now;
        return {
          targetX: home.x,
          targetY: home.y,
          size: 'large',
          action: 'unpeek'
        };
      }
      return null;
    }

    // 6. DODGE MODE
    if (this.mode === 'dodge') {
      if (isOverlapping) {
        const freeCorners = this.computeFreeCorners(workArea, pandaDimensions.large.width, pandaDimensions.large.height, winBounds);
        const freeOnes = freeCorners.filter(c => c.isFree);

        if (freeOnes.length > 0) {
          // Sort by distance to home to pick the most natural spot
          freeOnes.sort((a, b) => {
            const distA = Math.hypot(a.x - home.x, a.y - home.y);
            const distB = Math.hypot(b.x - home.x, b.y - home.y);
            return distA - distB;
          });

          const best = freeOnes[0];
          this.isDodging = true;
          this.lastAutoMoveTime = now;
          return {
            targetX: best.x,
            targetY: best.y,
            size: 'large',
            action: 'dodge-corner'
          };
        } else {
          // No full large corner free: dodge to medium size in best spot
          const medCorners = this.computeFreeCorners(workArea, pandaDimensions.medium.width, pandaDimensions.medium.height, winBounds);
          const medFree = medCorners.filter(c => c.isFree);
          if (medFree.length > 0) {
            const bestMed = medFree[0];
            this.isDodging = true;
            this.lastAutoMoveTime = now;
            return {
              targetX: bestMed.x,
              targetY: bestMed.y,
              size: 'medium',
              action: 'dodge-medium'
            };
          }
        }
      } else if (this.isDodging) {
        // Free of overlap: return home
        this.isDodging = false;
        this.lastAutoMoveTime = now;
        return {
          targetX: home.x,
          targetY: home.y,
          size: 'large',
          action: 'return-home'
        };
      }
      return null;
    }

    // 7. SMART MODE (Combines Dodge + Peek)
    if (this.mode === 'smart') {
      if (activeWindow.isMaximized || (winBounds.width >= workArea.width * 0.8 && winBounds.height >= workArea.height * 0.8)) {
        // Window covers almost the entire screen: PEEK at the edge
        const tinyW = pandaDimensions.tiny.width;
        const tinyH = pandaDimensions.tiny.height;
        const peekX = this.isHoveringPeek
          ? workArea.x + workArea.width - tinyW - 8
          : workArea.x + workArea.width - 60;
        const peekY = workArea.y + workArea.height - tinyH - 30;

        this.isPeeking = true;
        this.isDodging = false;
        this.lastAutoMoveTime = now;
        return {
          targetX: peekX,
          targetY: peekY,
          size: 'tiny',
          action: this.isHoveringPeek ? 'smart-peek-expand' : 'smart-peek-tuck'
        };
      }

      if (isOverlapping) {
        // Try Dodge to free corner first
        const freeCorners = this.computeFreeCorners(workArea, pandaDimensions.large.width, pandaDimensions.large.height, winBounds);
        const freeOnes = freeCorners.filter(c => c.isFree);

        if (freeOnes.length > 0) {
          freeOnes.sort((a, b) => Math.hypot(a.x - home.x, a.y - home.y) - Math.hypot(b.x - home.x, b.y - home.y));
          this.isDodging = true;
          this.isPeeking = false;
          this.lastAutoMoveTime = now;
          return {
            targetX: freeOnes[0].x,
            targetY: freeOnes[0].y,
            size: 'large',
            action: 'smart-dodge-large'
          };
        }

        // Try Medium size
        const medCorners = this.computeFreeCorners(workArea, pandaDimensions.medium.width, pandaDimensions.medium.height, winBounds);
        const medFree = medCorners.filter(c => c.isFree);
        if (medFree.length > 0) {
          this.isDodging = true;
          this.isPeeking = false;
          this.lastAutoMoveTime = now;
          return {
            targetX: medFree[0].x,
            targetY: medFree[0].y,
            size: 'medium',
            action: 'smart-dodge-medium'
          };
        }

        // If no corner is free at all: fall back to Peek
        const tinyW = pandaDimensions.tiny.width;
        const tinyH = pandaDimensions.tiny.height;
        const peekX = this.isHoveringPeek ? workArea.x + workArea.width - tinyW - 8 : workArea.x + workArea.width - 60;
        const peekY = workArea.y + workArea.height - tinyH - 30;

        this.isPeeking = true;
        this.isDodging = false;
        this.lastAutoMoveTime = now;
        return {
          targetX: peekX,
          targetY: peekY,
          size: 'tiny',
          action: 'smart-fallback-peek'
        };
      }

      // No overlap: return home
      if (this.isDodging || this.isPeeking) {
        this.isDodging = false;
        this.isPeeking = false;
        this.lastAutoMoveTime = now;
        return {
          targetX: home.x,
          targetY: home.y,
          size: 'large',
          action: 'smart-return-home'
        };
      }
    }

    return null;
  }

  load() {
    if (!this.storagePath || !fs.existsSync(this.storagePath)) return;
    try {
      const raw = fs.readFileSync(this.storagePath, 'utf-8');
      const data = JSON.parse(raw);
      if (data.positioningMode) this.mode = data.positioningMode;
      if (data.followActiveMonitor !== undefined) this.followActiveMonitor = Boolean(data.followActiveMonitor);
      if (data.hideOnFullscreen !== undefined) this.hideOnFullscreen = Boolean(data.hideOnFullscreen);
      if (data.perAppSpots) this.perAppSpots = data.perAppSpots;
      if (data.homePosition) this.homePosition = data.homePosition;
    } catch (err) {
      console.error('Failed to load position engine settings:', err);
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

      existing.positioningMode = this.mode;
      existing.followActiveMonitor = this.followActiveMonitor;
      existing.hideOnFullscreen = this.hideOnFullscreen;
      existing.perAppSpots = this.perAppSpots;
      if (this.homePosition) existing.homePosition = this.homePosition;

      fs.writeFileSync(this.storagePath, JSON.stringify(existing, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save position engine settings:', err);
    }
  }

  getDebugData() {
    return {
      mode: this.mode,
      isDodging: this.isDodging,
      isPeeking: this.isPeeking,
      isHoveringPeek: this.isHoveringPeek,
      lastManualDragRemainingSec: Math.max(0, Math.ceil((this.lastManualDragTime + this.manualDragGraceMs - Date.now()) / 1000)),
      freeZones: this.lastComputedFreeZones,
      activeWindowBounds: this.lastActiveWindowBounds
    };
  }
}

module.exports = new PositionEngine();
