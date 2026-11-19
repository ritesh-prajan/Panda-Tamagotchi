// src/main/main.js
// Main Electron process: overlay window, control center window, complete tray menu with submenus,
// personality engine with auto-switching & manual lock, and needs engine integration.

const { app, BrowserWindow, Tray, Menu, screen, ipcMain, session } = require('electron');
const path = require('path');
const fs = require('fs');

const { generatePandaTrayIcon } = require('./create-tray-icon');
const typingMonitor = require('./typing-monitor');
const windowMonitor = require('./window-monitor');
const needsEngine = require('../core/needs');
const { resolveEmotion } = require('../core/resolver');
const linesManager = require('../core/lines-manager');
const personalityEngine = require('../core/personality-engine');
const state = require('../core/state');
const aiService = require('../ai/ai-service');
const contextSummarizer = require('../ai/context-summarizer');
const positionEngine = require('../core/position-engine');
const todoManager = require('../core/todo-manager');
const productivityEngine = require('../core/productivity-engine');

// Ensure single instance
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

let mainWindow = null;
let controlWindow = null;
let tray = null;
let isQuitting = false;
let needsTickTimer = null;
let needsSaveTimer = null;
let productivityTimer = null;

// Idle speech cooldown: only send one unsolicited idle line per 3 minutes at most
let lastIdleSpeechTime = 0;
const IDLE_SPEECH_COOLDOWN_MS = 3 * 60 * 1000;

let currentKpm = 0;
let currentSessionMinutes = 0;

const OVERLAY_WIDTH = 330;
const OVERLAY_HEIGHT = 340;
const CONTROL_WIDTH = 640;
const CONTROL_HEIGHT = 580;

function getPositionFilePath() {
  return path.join(app.getPath('userData'), 'pandu-position.json');
}

function loadSavedPosition() {
  try {
    const filePath = getPositionFilePath();
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (typeof data.x === 'number' && typeof data.y === 'number') {
        const displays = screen.getAllDisplays();
        const isOnScreen = displays.some((d) => {
          const { x, y, width, height } = d.bounds;
          return data.x >= x - 50 && data.x <= x + width - 50 &&
                 data.y >= y - 50 && data.y <= y + height - 50;
        });
        if (isOnScreen) {
          return { x: Math.round(data.x), y: Math.round(data.y) };
        }
      }
    }
  } catch (err) {
    console.error('Failed to load saved position:', err);
  }
  return null;
}

function getDefaultPosition() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { workArea } = primaryDisplay;
  return {
    x: Math.round(workArea.x + workArea.width - OVERLAY_WIDTH - 24),
    y: Math.round(workArea.y + workArea.height - OVERLAY_HEIGHT - 24)
  };
}

function saveWindowPosition() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  try {
    const [x, y] = mainWindow.getPosition();
    const filePath = getPositionFilePath();
    fs.writeFileSync(filePath, JSON.stringify({ x, y }, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save window position:', err);
  }
}

// ---------------- Smooth Window Movement & Sizing (Sprint 6) ----------------
let slideAnimationTimer = null;
const SIZES = {
  large: { width: 330, height: 340 },
  medium: { width: 260, height: 260 },
  tiny: { width: 180, height: 160 }
};

function applyOverlaySize(size) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  const target = SIZES[size] || SIZES.large;
  mainWindow.setSize(target.width, target.height);
  state.setState({ size });
  mainWindow.webContents.send('size:changed', size);
  broadcastState();
}

function slideWindowTo(targetX, targetY, durationMs = 380, callback = null) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (slideAnimationTimer) {
    clearInterval(slideAnimationTimer);
    slideAnimationTimer = null;
  }

  const [startX, startY] = mainWindow.getPosition();
  const deltaX = Math.round(targetX - startX);
  const deltaY = Math.round(targetY - startY);

  if (Math.abs(deltaX) <= 2 && Math.abs(deltaY) <= 2) {
    mainWindow.setPosition(Math.round(targetX), Math.round(targetY));
    if (callback) callback();
    return;
  }

  const startTime = Date.now();
  const frameIntervalMs = 16;

  slideAnimationTimer = setInterval(() => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      clearInterval(slideAnimationTimer);
      slideAnimationTimer = null;
      return;
    }

    const elapsed = Date.now() - startTime;
    const progress = Math.min(1, elapsed / durationMs);
    const ease = 1 - Math.pow(1 - progress, 3); // cubic ease-out

    const curX = Math.round(startX + deltaX * ease);
    const curY = Math.round(startY + deltaY * ease);
    mainWindow.setPosition(curX, curY);

    if (progress >= 1) {
      clearInterval(slideAnimationTimer);
      slideAnimationTimer = null;
      mainWindow.setPosition(Math.round(targetX), Math.round(targetY));
      saveWindowPosition();
      if (callback) callback();
    }
  }, frameIntervalMs);
}

function isAutoLaunchEnabled() {
  return app.getLoginItemSettings().openAtLogin;
}

function setAutoLaunch(enable) {
  app.setLoginItemSettings({
    openAtLogin: enable,
    path: process.execPath,
    args: []
  });
  state.setState({ startWithWindows: enable });
  broadcastState();
}

function createOverlayWindow() {
  const initialPos = loadSavedPosition() || getDefaultPosition();

  mainWindow = new BrowserWindow({
    width: OVERLAY_WIDTH,
    height: OVERLAY_HEIGHT,
    x: initialPos.x,
    y: initialPos.y,
    transparent: true,
    frame: false,
    hasShadow: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    console.log(`[Renderer Log ${level}] ${message} (${sourceId}:${line})`);
  });
  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    console.error(`[Renderer Load Error] ${errorCode}: ${errorDescription}`);
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      updateTrayMenu();
    }
  });

  mainWindow.on('moved', () => {
    saveWindowPosition();
  });
}

function createControlWindow() {
  controlWindow = new BrowserWindow({
    width: CONTROL_WIDTH,
    height: CONTROL_HEIGHT,
    show: false,
    resizable: false,
    autoHideMenuBar: true,
    title: 'Pandu - Pet Control Center',
    backgroundColor: '#0f141c',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  controlWindow.loadFile(path.join(__dirname, '../control/index.html'));

  controlWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      controlWindow.hide();
    }
  });
}

function openControlWindow(targetTab = null) {
  const isNew = !controlWindow || controlWindow.isDestroyed();
  if (isNew) {
    createControlWindow();
  }
  controlWindow.show();
  controlWindow.focus();
  if (targetTab && controlWindow.webContents) {
    const sendTab = () => {
      if (controlWindow && !controlWindow.isDestroyed()) {
        controlWindow.webContents.send('tab:navigate', targetTab);
      }
    };
    if (controlWindow.webContents.isLoading()) {
      controlWindow.webContents.once('did-finish-load', () => {
        setTimeout(sendTab, 60);
      });
    } else {
      setTimeout(sendTab, 60);
    }
  }
}

function hideControlWindow() {
  if (controlWindow && !controlWindow.isDestroyed()) {
    controlWindow.hide();
  }
}

function toggleOverlayPanda() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    mainWindow.show();
    mainWindow.focus();
  }
  updateTrayMenu();
}

function broadcastState() {
  const curState = state.getState();
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('state:changed', curState);
  }
  if (controlWindow && !controlWindow.isDestroyed()) {
    controlWindow.webContents.send('state:changed', curState);
  }
}

function broadcastPersonality() {
  const pStatus = personalityEngine.getStatus();
  state.setState({ personality: pStatus.currentPersonality });
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('personality:changed', pStatus);
  }
  if (controlWindow && !controlWindow.isDestroyed()) {
    controlWindow.webContents.send('personality:changed', pStatus);
  }
  updateTrayMenu();
}

function sendSpeechLine(text, durationMs = 3500) {
  // Suppress speech in focus mode
  if (state.getState().isFocusMode) return;

  // Record speech to suppress idle chatter
  linesManager.recordSpeech(durationMs);

  if (mainWindow && !mainWindow.isDestroyed() && text) {
    mainWindow.webContents.send('speech:line', { text, durationMs });
  }
}

function handleFeed() {
  const result = needsEngine.feed();
  const line = linesManager.getEventLine(result.lineCategory);
  if (line) {
    sendSpeechLine(line);
  }

  // Occasional proactive AI comment on feed (gated by 5m cooldown)
  if (aiService.hasApiKey() && aiService.rateLimiter.canMakeProactive()) {
    aiService.getProactiveLine('fed').then(res => {
      if (res && res.text) sendSpeechLine(res.text, 4500);
    });
  }

  needsEngine.isWokenUp = true;
  updatePetEngineTick();

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('interaction:feed-result', result);
  }
  return result;
}

function handlePet() {
  const result = needsEngine.pet();
  const line = linesManager.getEventLine(result.lineCategory);
  if (line) {
    sendSpeechLine(line);
  }

  updatePetEngineTick();

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('interaction:pet-result', result);
  }
  return result;
}

function updatePetEngineTick() {
  const needs = needsEngine.getNeeds();
  const currentState = state.getState();

  const context = {
    isNight: needsEngine.isNightTime(),
    isWokenUp: needsEngine.isWokenUp,
    isSleeping: needsEngine.needs.isSleeping,
    debugOverride: currentState.debugOverride
  };

  const resolvedEmotion = resolveEmotion(needs, context);

  // Update privacy context summarizer
  contextSummarizer.updateNeeds(needs);
  contextSummarizer.updateEmotion(resolvedEmotion);

  state.setState({
    currentEmotion: resolvedEmotion,
    shrinkStage: needs.shrinkStage,
    needs
  });

  // Evaluate auto-switch
  const didSwitch = personalityEngine.evaluateAutoSwitch({
    hour: new Date().getHours(),
    kpm: currentKpm,
    sessionMinutes: currentSessionMinutes,
    ignoredSeconds: needs.ignoredSeconds,
    isFastTime: currentState.timeMultiplier > 1
  });

  if (didSwitch) {
    broadcastPersonality();
  }

  broadcastState();

  // Occasional random idle speech — rate-limited to once per 3 minutes
  const now = Date.now();
  if (now - lastIdleSpeechTime >= IDLE_SPEECH_COOLDOWN_MS) {
    const idleLine = linesManager.getLine(resolvedEmotion, false);
    if (idleLine) {
      lastIdleSpeechTime = now;
      sendSpeechLine(idleLine);
    } else if (aiService.hasApiKey() && aiService.rateLimiter.canMakeProactive()) {
      // Check if long typing or long idle event triggers proactive AI line
      if (currentSessionMinutes >= 20 && currentKpm >= 30) {
        aiService.getProactiveLine('long_typing').then(res => {
          if (res && res.text) { lastIdleSpeechTime = Date.now(); sendSpeechLine(res.text, 4500); }
        });
      } else if (needs.ignoredSeconds >= 600) {
        aiService.getProactiveLine('long_idle').then(res => {
          if (res && res.text) { lastIdleSpeechTime = Date.now(); sendSpeechLine(res.text, 4500); }
        });
      }
    }
  }
}

function updateTrayMenu() {
  if (!tray || tray.isDestroyed()) return;
  const isOverlayVisible = mainWindow && !mainWindow.isDestroyed() && mainWindow.isVisible();
  const currentState = state.getState();
  const pStatus = personalityEngine.getStatus();

  // Personalities submenu
  const personalityMenuItems = [
    {
      label: 'Auto-Switch Personalities',
      type: 'checkbox',
      checked: pStatus.isAutoSwitchEnabled,
      click: () => {
        if (!pStatus.isAutoSwitchEnabled) {
          personalityEngine.resumeAutoSwitch();
        } else {
          personalityEngine.setManualPersonality(pStatus.currentPersonalityId, 2);
        }
        broadcastPersonality();
      }
    },
    { type: 'separator' }
  ];

  const personalityList = [
    { id: 'scholar', label: 'Scholar Panda 🎓' },
    { id: 'sassy', label: 'Sassy Pandi 💅' },
    { id: 'hyper', label: 'Hyper Mochi ⚡' },
    { id: 'sleepy', label: 'Sleepy Bao 💤' },
    { id: 'coach', label: 'Coach Bamboo 🏆' }
  ];

  personalityList.forEach((item) => {
    personalityMenuItems.push({
      label: item.label,
      type: 'checkbox',
      checked: pStatus.currentPersonalityId === item.id,
      click: () => {
        personalityEngine.setManualPersonality(item.id, 2);
        broadcastPersonality();
      }
    });
  });

  // Styles submenu (Sprint 8)
  const availableStyles = [
    { id: 'official-sticker', label: 'PANDU 🎋 (Official Stickers)' },
    { id: 'soft-ascii', label: 'Soft ASCII' },
    { id: 'cute-anime', label: 'Cute Anime ✨' },
    { id: 'chunky-robot', label: 'Chunky Robot 🤖' }
  ];

  const styleMenuItems = availableStyles.map((st) => ({
    label: st.label,
    type: 'checkbox',
    checked: currentState.style === st.id,
    click: () => {
      setAppStyle(st.id);
    }
  }));

  // Positioning submenu (Sprint 6)
  const positionModes = [
    { id: 'smart', label: 'Smart Mode (Dodge + Peek) 🌟' },
    { id: 'dodge', label: 'Dodge Mode (Corner Jump) 🏃' },
    { id: 'peek', label: 'Peek Mode (Edge Tuck) 👀' },
    { id: 'off', label: 'Off (Stay in Place) 📌' }
  ];

  const positionMenuItems = positionModes.map(item => ({
    label: item.label,
    type: 'checkbox',
    checked: positionEngine.mode === item.id,
    click: () => {
      positionEngine.setMode(item.id);
      state.setState({ positioningMode: item.id });
      broadcastState();
      updateTrayMenu();
    }
  }));

  positionMenuItems.push({ type: 'separator' });
  positionMenuItems.push({
    label: `Remember Spot for [${state.getState().activeAppName || 'Active App'}]`,
    click: () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        const [x, y] = mainWindow.getPosition();
        positionEngine.rememberSpotForApp(state.getState().activeAppName, x, y);
        state.setState({ perAppSpots: positionEngine.getPerAppSpots() });
        broadcastState();
      }
    }
  });
  positionMenuItems.push({
    label: 'Hide when Fullscreen',
    type: 'checkbox',
    checked: positionEngine.hideOnFullscreen,
    click: (item) => {
      positionEngine.setHideOnFullscreen(item.checked);
      state.setState({ hideOnFullscreen: item.checked });
      broadcastState();
      updateTrayMenu();
    }
  });

  const contextMenu = Menu.buildFromTemplate([
    {
      label: isOverlayVisible ? 'Hide Panda' : 'Show Panda',
      click: () => toggleOverlayPanda()
    },
    {
      label: 'Feed Bamboo 🎋',
      click: () => handleFeed()
    },
    {
      label: 'Pet Panda 🐾',
      click: () => handlePet()
    },
    { type: 'separator' },
    {
      label: 'Todo & Tasks 📋',
      submenu: [
        {
          label: 'Quick Add Task... ✍️',
          click: () => {
            openControlWindow('todo');
            if (controlWindow && !controlWindow.isDestroyed()) {
              controlWindow.webContents.send('action:trigger-add-todo');
            }
          }
        },
        {
          label: 'Voice Task 🎤',
          click: () => {
            if (mainWindow && !mainWindow.isDestroyed() && mainWindow.isVisible()) {
              mainWindow.webContents.send('action:trigger-voice-task');
            } else {
              openControlWindow('todo');
              if (controlWindow && !controlWindow.isDestroyed()) {
                controlWindow.webContents.send('action:trigger-voice-task');
              }
            }
          }
        },
        { type: 'separator' },
        {
          label: 'View Todo List 📋',
          click: () => openControlWindow('todo')
        }
      ]
    },
    {
      label: 'Smart Positioning',
      submenu: positionMenuItems
    },
    {
      label: 'Switch Personality',
      submenu: personalityMenuItems
    },
    {
      label: 'Switch Style',
      submenu: styleMenuItems
    },
    { type: 'separator' },
    {
      label: 'Mute Sounds',
      type: 'checkbox',
      checked: currentState.isMuted,
      click: (item) => {
        state.setState({ isMuted: item.checked });
        broadcastState();
        updateTrayMenu();
      }
    },
    {
      label: 'Focus Mode (Go Quiet)',
      type: 'checkbox',
      checked: currentState.isFocusMode,
      click: (item) => {
        state.setState({ isFocusMode: item.checked });
        broadcastState();
        updateTrayMenu();
      }
    },
    {
      label: 'Open Control Window',
      click: () => openControlWindow()
    },
    { type: 'separator' },
    {
      label: 'Start with Windows',
      type: 'checkbox',
      checked: isAutoLaunchEnabled(),
      click: (item) => {
        setAutoLaunch(item.checked);
        updateTrayMenu();
      }
    },
    { type: 'separator' },
    {
      label: 'Quit Pandu',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
}

function createTray() {
  const iconPath = path.join(app.getAppPath(), 'assets', 'tray-icon.png');
  generatePandaTrayIcon(iconPath);

  tray = new Tray(iconPath);
  tray.setToolTip('Pandu - Desktop Pet (Left-click for Control Window)');

  // Left-click opens Control Window (locked decision)
  tray.on('click', () => {
    openControlWindow();
  });

  updateTrayMenu();
}

// ---------------- IPC Event Handlers ----------------
ipcMain.handle('state:get', () => {
  return state.getState();
});

ipcMain.handle('needs:get', () => {
  return needsEngine.getNeeds();
});

ipcMain.handle('personality:get-status', () => {
  return personalityEngine.getStatus();
});

ipcMain.handle('personality:set', (_event, { id, hours }) => {
  const updated = personalityEngine.setManualPersonality(id, hours || 2);
  broadcastPersonality();
  return updated;
});

ipcMain.handle('personality:resume-auto', () => {
  const updated = personalityEngine.resumeAutoSwitch();
  broadcastPersonality();
  return updated;
});

ipcMain.handle('interaction:pet', () => {
  return handlePet();
});

ipcMain.handle('interaction:feed', () => {
  return handleFeed();
});

ipcMain.handle('settings:toggle-mute', (_event, muted) => {
  const newMuted = muted !== undefined ? Boolean(muted) : !state.getState().isMuted;
  state.setState({ isMuted: newMuted });
  broadcastState();
  updateTrayMenu();
  return newMuted;
});

ipcMain.handle('settings:toggle-focus', (_event, focused) => {
  const newFocus = focused !== undefined ? Boolean(focused) : !state.getState().isFocusMode;
  state.setState({ isFocusMode: newFocus });
  broadcastState();
  updateTrayMenu();
  return newFocus;
});

ipcMain.handle('settings:set-time-multiplier', (_event, multiplier) => {
  const mult = Number(multiplier) || 1;
  needsEngine.setTimeMultiplier(mult);
  state.setState({ timeMultiplier: mult });
  broadcastState();
  return mult;
});

ipcMain.handle('settings:set-autolaunch', (_event, enabled) => {
  setAutoLaunch(Boolean(enabled));
  return isAutoLaunchEnabled();
});

ipcMain.handle('debug:set-override', (_event, emotion) => {
  state.setState({ debugOverride: emotion || null });
  updatePetEngineTick();
  return emotion;
});

// ---------------- Style System IPC Handlers (Sprint 8) ----------------
function saveAppStyle(style) {
  try {
    const settingsPath = path.join(app.getPath('userData'), 'pandu-settings.json');
    let data = {};
    if (fs.existsSync(settingsPath)) {
      data = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    }
    data.style = style;
    fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save style to pandu-settings.json:', err);
  }
}

function loadAppStyle() {
  try {
    const settingsPath = path.join(app.getPath('userData'), 'pandu-settings.json');
    if (fs.existsSync(settingsPath)) {
      const data = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      if (data && data.style && ['official-sticker', 'soft-ascii', 'cute-anime', 'chunky-robot'].includes(data.style)) {
        return data.style;
      }
    }
  } catch (err) {
    // quiet fail
  }
  return 'official-sticker';
}

function setAppStyle(newStyle) {
  const validStyles = ['official-sticker', 'soft-ascii', 'cute-anime', 'chunky-robot'];
  if (!validStyles.includes(newStyle)) return state.getState().style;
  state.setState({ style: newStyle });
  saveAppStyle(newStyle);
  broadcastState();
  updateTrayMenu();
  return newStyle;
}

ipcMain.handle('style:set', (_event, newStyle) => {
  return setAppStyle(newStyle);
});

// ---------------- Cloud AI IPC Handlers (Sprint 5) ----------------
ipcMain.handle('ai:chat', async (_event, message) => {
  const result = await aiService.chat(message);
  if (result && result.text) {
    sendSpeechLine(result.text, 5000);
  }
  return result;
});

ipcMain.handle('ai:set-key', (_event, key) => {
  return aiService.setApiKey(key);
});

ipcMain.handle('ai:set-model', (_event, modelName) => {
  return aiService.setModel(modelName);
});

ipcMain.handle('ai:test-connection', async () => {
  return aiService.testConnection();
});

ipcMain.handle('ai:get-status', () => {
  return aiService.getStatus();
});

ipcMain.handle('ai:get-payload', () => {
  return contextSummarizer.getLastPayload();
});

// ---------------- Smart Positioning IPC Handlers (Sprint 6) ----------------
ipcMain.handle('position:get-status', () => {
  return {
    mode: positionEngine.mode,
    followActiveMonitor: positionEngine.followActiveMonitor,
    hideOnFullscreen: positionEngine.hideOnFullscreen,
    perAppSpots: positionEngine.getPerAppSpots(),
    activeAppName: state.getState().activeAppName || 'Unknown',
    debug: positionEngine.getDebugData()
  };
});

ipcMain.handle('position:set-mode', (_event, mode) => {
  const newMode = positionEngine.setMode(mode);
  state.setState({ positioningMode: newMode });
  broadcastState();
  updateTrayMenu();
  return newMode;
});

ipcMain.handle('position:set-follow-monitor', (_event, enable) => {
  const follow = positionEngine.setFollowActiveMonitor(enable);
  state.setState({ followActiveMonitor: follow });
  broadcastState();
  return follow;
});

ipcMain.handle('position:set-hide-fullscreen', (_event, enable) => {
  const hide = positionEngine.setHideOnFullscreen(enable);
  state.setState({ hideOnFullscreen: hide });
  broadcastState();
  updateTrayMenu();
  return hide;
});

ipcMain.handle('position:remember-app-spot', () => {
  if (!mainWindow || mainWindow.isDestroyed()) return false;
  const [x, y] = mainWindow.getPosition();
  const appName = state.getState().activeAppName || 'Unknown';
  const success = positionEngine.rememberSpotForApp(appName, x, y);
  state.setState({ perAppSpots: positionEngine.getPerAppSpots() });
  broadcastState();
  return success;
});

ipcMain.handle('position:forget-app-spot', (_event, appName) => {
  const success = positionEngine.forgetSpotForApp(appName);
  state.setState({ perAppSpots: positionEngine.getPerAppSpots() });
  broadcastState();
  return success;
});

ipcMain.on('position:peek-hover', (_event, isHovering) => {
  positionEngine.setPeekHover(isHovering);
  if (!mainWindow || mainWindow.isDestroyed()) return;
  const [curX, curY] = mainWindow.getPosition();
  const [curW, curH] = mainWindow.getSize();
  const currentDisplay = screen.getDisplayNearestPoint({ x: curX, y: curY });
  const geom = windowMonitor.lastBounds ? { bounds: windowMonitor.lastBounds, appName: windowMonitor.lastAppName } : null;
  const decision = positionEngine.evaluatePosition({
    activeWindow: geom,
    display: currentDisplay,
    currentPandaBounds: { x: curX, y: curY, width: curW, height: curH },
    pandaDimensions: SIZES
  });
  if (decision && decision.targetX !== undefined) {
    slideWindowTo(decision.targetX, decision.targetY, 220);
  }
});

function broadcastTodos() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('todos:changed');
  }
  if (controlWindow && !controlWindow.isDestroyed()) {
    controlWindow.webContents.send('todos:changed');
  }
}

// ---------------- Productivity & Todo IPC Handlers (Sprint 7) ----------------
ipcMain.handle('todos:get', (_event, filter) => {
  return todoManager.getTodos(filter);
});

ipcMain.handle('todos:add', (_event, todoData) => {
  const result = todoManager.addTodo(todoData);
  broadcastTodos();
  return result;
});

ipcMain.handle('todos:update', (_event, { id, updates }) => {
  const result = todoManager.updateTodo(id, updates);
  broadcastTodos();
  return result;
});

ipcMain.handle('todos:toggle', (_event, id) => {
  const result = todoManager.toggleTodo(id);
  broadcastTodos();
  if (result && result.completed) {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('todo:completed', result);
    }
  }
  return result;
});

ipcMain.handle('todos:delete', (_event, id) => {
  const result = todoManager.deleteTodo(id);
  broadcastTodos();
  return result;
});

ipcMain.handle('todos:get-stats', () => {
  return todoManager.getStats();
});

ipcMain.handle('productivity:get-status', () => {
  return productivityEngine.getStatus();
});

ipcMain.handle('productivity:take-break', () => {
  const result = productivityEngine.takeBreak(needsEngine);
  updatePetEngineTick();
  broadcastState();
  return result;
});

ipcMain.handle('productivity:snooze-break', (_event, minutes) => {
  return productivityEngine.snoozeBreak(minutes);
});

ipcMain.handle('productivity:set-threshold', (_event, minutes) => {
  return productivityEngine.setBreakThreshold(minutes);
});

ipcMain.handle('productivity:set-shorten-timers', (_event, enable) => {
  return productivityEngine.setShortenTimers(enable);
});

ipcMain.handle('voice:extract-task', async (_event, { base64Audio, mimeType }) => {
  const now = new Date();
  const localDateTimeStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  const result = await aiService.extractTasksFromAudio(base64Audio, mimeType, localDateTimeStr);
  return result;
});

ipcMain.on('control:open', (_event, targetTab = null) => {
  openControlWindow(targetTab);
});

ipcMain.on('control:hide', () => {
  hideControlWindow();
});

ipcMain.on('window:move-by', (_event, { dx, dy }) => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  const [curX, curY] = mainWindow.getPosition();
  mainWindow.setPosition(Math.round(curX + dx), Math.round(curY + dy));

  if (needsEngine.needs.isSleeping || needsEngine.isNightTime()) {
    if (!needsEngine.isWokenUp) {
      needsEngine.wakeUpGrumpily();
      const line = linesManager.getEventLine('wake_up');
      sendSpeechLine(line);
      updatePetEngineTick();
    }
  }
});

ipcMain.on('window:save-position', () => {
  saveWindowPosition();
  if (mainWindow && !mainWindow.isDestroyed()) {
    const [curX, curY] = mainWindow.getPosition();
    positionEngine.recordManualDrag(curX, curY);
  }
});

ipcMain.on('window:focus', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.focus();
  }
});

ipcMain.on('window:set-ignore-mouse-events', (_event, { ignore, forward }) => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.setIgnoreMouseEvents(Boolean(ignore), { forward: Boolean(forward) });
});

ipcMain.on('window:set-size', (_event, { width, height }) => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.setSize(Math.round(width), Math.round(height));
});

// ---------------- App Lifecycle ----------------
app.whenReady().then(() => {
  const storageDir = app.getPath('userData');
  needsEngine.init(storageDir);
  personalityEngine.init(storageDir);
  aiService.init(storageDir);
  positionEngine.init(storageDir);
  todoManager.init(storageDir);
  productivityEngine.init(storageDir);

  // Restore saved visual style (Sprint 8)
  const savedStyle = loadAppStyle();
  state.setState({ style: savedStyle });

  // Audio / Mic permissions for voice tasks
  if (session && session.defaultSession) {
    session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
      if (permission === 'media') {
        callback(true);
      } else {
        callback(false);
      }
    });
    session.defaultSession.setPermissionCheckHandler((_webContents, permission) => {
      if (permission === 'media') return true;
      return false;
    });
  }

  // Productivity break notifications & speech lines
  productivityEngine.on('break-prompt', (data) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('productivity:break-prompt', data);
    }
    if (controlWindow && !controlWindow.isDestroyed()) {
      controlWindow.webContents.send('productivity:break-prompt', data);
    }
    const nudgeLine = linesManager.getEventLine('break_nudge');
    if (nudgeLine) {
      sendSpeechLine(nudgeLine, 5500);
    }
  });

  productivityEngine.on('break-resolved', (data) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('productivity:break-resolved', data);
    }
    if (controlWindow && !controlWindow.isDestroyed()) {
      controlWindow.webContents.send('productivity:break-resolved', data);
    }
    if (data.action === 'taken') {
      const takenLine = linesManager.getEventLine('break_taken');
      if (takenLine) {
        sendSpeechLine(takenLine, 4500);
      }
    }
  });

  createOverlayWindow();
  createControlWindow();
  createTray();

  const [initialX, initialY] = mainWindow.getPosition();
  if (!positionEngine.homePosition) {
    positionEngine.setHomePosition(initialX, initialY);
  }

  state.setState({
    personality: personalityEngine.getCurrentPersonality(),
    startWithWindows: isAutoLaunchEnabled(),
    positioningMode: positionEngine.mode,
    followActiveMonitor: positionEngine.followActiveMonitor,
    hideOnFullscreen: positionEngine.hideOnFullscreen,
    perAppSpots: positionEngine.getPerAppSpots()
  });

  // Periodic Needs & Personality Tick (1 second)
  needsTickTimer = setInterval(() => {
    needsEngine.tick(1);
    updatePetEngineTick();
  }, 1000);

  // Auto-Save Needs (1 minute)
  needsSaveTimer = setInterval(() => {
    needsEngine.save();
    personalityEngine.save();
  }, 60000);

  // Productivity Reminders & Nagging Timer (every 30 seconds)
  productivityTimer = setInterval(() => {
    productivityEngine.evaluateReminders({
      todoManager,
      personalityEngine,
      isFocusMode: state.getState().isFocusMode,
      sendSpeechLine
    });
  }, 30000);

  updatePetEngineTick();

  // Global Typing Monitor
  typingMonitor.on('typing-activity', (data) => {
    currentKpm = data.kpm;
    currentSessionMinutes = data.sessionMinutes;

    contextSummarizer.updateTyping(data.kpm, data.sessionMinutes);
    productivityEngine.onTypingActivity(data, state.getState().isFocusMode);

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('typing-activity', data);
    }
  });
  typingMonitor.start();

  // Active Window Monitor & Geometry Tracking (Sprint 6)
  windowMonitor.on('active-app-changed', (data) => {
    contextSummarizer.updateApp(data.appName);
    state.setState({ activeAppName: data.appName });

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('active-app-changed', data);
    }
  });

  windowMonitor.on('active-window-geometry', (geom) => {
    state.setState({ activeAppName: geom.appName });

    // 1. Fullscreen auto-hide handling
    if (geom.isFullscreen && positionEngine.hideOnFullscreen) {
      if (mainWindow && !mainWindow.isDestroyed() && mainWindow.isVisible()) {
        mainWindow.hide();
      }
      return;
    } else {
      if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.isVisible()) {
        mainWindow.show();
      }
    }

    if (!mainWindow || mainWindow.isDestroyed()) return;

    // 2. Determine target display
    const [curX, curY] = mainWindow.getPosition();
    const [curW, curH] = mainWindow.getSize();
    let currentDisplay = screen.getDisplayNearestPoint({ x: curX, y: curY });

    if (positionEngine.followActiveMonitor && geom.displayId) {
      const match = screen.getAllDisplays().find(d => d.id === geom.displayId);
      if (match) currentDisplay = match;
    }

    // 3. Evaluate positioning
    const decision = positionEngine.evaluatePosition({
      activeWindow: geom,
      display: currentDisplay,
      currentPandaBounds: { x: curX, y: curY, width: curW, height: curH },
      pandaDimensions: SIZES
    });

    if (decision) {
      if (decision.shouldHide) {
        mainWindow.hide();
        return;
      }

      if (decision.size && decision.size !== state.getState().size) {
        applyOverlaySize(decision.size);
      }

      if (decision.targetX !== undefined && decision.targetY !== undefined) {
        slideWindowTo(decision.targetX, decision.targetY, 360);
      }
    }

    // Broadcast geometry debug
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('position:debug-data', {
        geom,
        debug: positionEngine.getDebugData(),
        decision
      });
    }
  });

  windowMonitor.start(400); // 400ms polling for responsive geometry tracking

  app.on('second-instance', () => {
    openControlWindow();
  });
});

app.on('before-quit', () => {
  isQuitting = true;
  if (needsTickTimer) clearInterval(needsTickTimer);
  if (needsSaveTimer) clearInterval(needsSaveTimer);
  if (productivityTimer) clearInterval(productivityTimer);
  needsEngine.save();
  personalityEngine.save();
  todoManager.save();
  productivityEngine.save();
  typingMonitor.stop();
  windowMonitor.stop();
  saveWindowPosition();
});

app.on('window-all-closed', () => {
  // Stay running in tray
});
