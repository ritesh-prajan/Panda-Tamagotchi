// src/main/preload.js
// Secure contextBridge isolating renderer and control windows from Node.js internals.

const { contextBridge, ipcRenderer } = require('electron');
const { getLook, getAvailableEmotions, getAvailableStyles } = require('../styles');

contextBridge.exposeInMainWorld('pandaApi', {
  // Looks & Styles
  getLook: (style, emotion, size) => getLook(style, emotion, size),
  getAvailableEmotions: (style) => getAvailableEmotions(style),
  getAvailableStyles: () => getAvailableStyles(),
  setStyle: (style) => ipcRenderer.invoke('style:set', style),

  // State & Needs
  getState: () => ipcRenderer.invoke('state:get'),
  getFullState: () => ipcRenderer.invoke('state:get'),
  getNeeds: () => ipcRenderer.invoke('needs:get'),
  onStateChange: (callback) => {
    const handler = (_event, newState) => callback(newState);
    ipcRenderer.on('state:changed', handler);
    return () => ipcRenderer.removeListener('state:changed', handler);
  },

  // Interactions (Petting & Feeding)
  pet: () => ipcRenderer.invoke('interaction:pet'),
  feed: () => ipcRenderer.invoke('interaction:feed'),
  onPetResult: (callback) => {
    const handler = (_event, result) => callback(result);
    ipcRenderer.on('interaction:pet-result', handler);
    return () => ipcRenderer.removeListener('interaction:pet-result', handler);
  },
  onFeedResult: (callback) => {
    const handler = (_event, result) => callback(result);
    ipcRenderer.on('interaction:feed-result', handler);
    return () => ipcRenderer.removeListener('interaction:feed-result', handler);
  },

  // Speech Bubbles
  onSpeechLine: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('speech:line', handler);
    return () => ipcRenderer.removeListener('speech:line', handler);
  },

  // Personality System
  getPersonalityStatus: () => ipcRenderer.invoke('personality:get-status'),
  setPersonality: (id, hours = 2) => ipcRenderer.invoke('personality:set', { id, hours }),
  resumeAutoSwitch: () => ipcRenderer.invoke('personality:resume-auto'),
  onPersonalityChange: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('personality:changed', handler);
    return () => ipcRenderer.removeListener('personality:changed', handler);
  },

  // Settings & Debug
  toggleMute: (muted) => ipcRenderer.invoke('settings:toggle-mute', muted),
  toggleFocusMode: (focused) => ipcRenderer.invoke('settings:toggle-focus', focused),
  setTimeMultiplier: (multiplier) => ipcRenderer.invoke('settings:set-time-multiplier', multiplier),
  setAutoLaunch: (enabled) => ipcRenderer.invoke('settings:set-autolaunch', enabled),
  setDebugOverride: (emotion) => ipcRenderer.invoke('debug:set-override', emotion),

  // Window Manipulation & Click-Through
  moveWindowBy: (dx, dy) => ipcRenderer.send('window:move-by', { dx, dy }),
  saveCurrentPosition: () => ipcRenderer.send('window:save-position'),
  focusWindow: () => ipcRenderer.send('window:focus'),
  setIgnoreMouseEvents: (ignore, forward = false) => {
    ipcRenderer.send('window:set-ignore-mouse-events', { ignore, forward });
  },
  setWindowSize: (width, height) => {
    ipcRenderer.send('window:set-size', { width, height });
  },
  hideControlWindow: () => ipcRenderer.send('control:hide'),
  openControlWindow: (tab = null) => ipcRenderer.send('control:open', tab),
  onTabNavigate: (callback) => {
    const handler = (_event, tab) => callback(tab);
    ipcRenderer.on('tab:navigate', handler);
    return () => ipcRenderer.removeListener('tab:navigate', handler);
  },

  // Typing & Window Awareness Events
  onTypingActivity: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('typing-activity', handler);
    return () => ipcRenderer.removeListener('typing-activity', handler);
  },
  onActiveAppChanged: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('active-app-changed', handler);
    return () => ipcRenderer.removeListener('active-app-changed', handler);
  },

  // Cloud AI Chat & Privacy Layer (Sprint 5)
  sendChat: (message) => ipcRenderer.invoke('ai:chat', message),
  setApiKey: (key) => ipcRenderer.invoke('ai:set-key', key),
  setAiModel: (model) => ipcRenderer.invoke('ai:set-model', model),
  testAiConnection: () => ipcRenderer.invoke('ai:test-connection'),
  getAiStatus: () => ipcRenderer.invoke('ai:get-status'),
  getLastAiPayload: () => ipcRenderer.invoke('ai:get-payload'),

  // Smart Positioning & Geometry Awareness (Sprint 6)
  getPositionStatus: () => ipcRenderer.invoke('position:get-status'),
  setPositionMode: (mode) => ipcRenderer.invoke('position:set-mode', mode),
  setFollowMonitor: (enable) => ipcRenderer.invoke('position:set-follow-monitor', enable),
  setHideFullscreen: (enable) => ipcRenderer.invoke('position:set-hide-fullscreen', enable),
  rememberCurrentAppSpot: () => ipcRenderer.invoke('position:remember-app-spot'),
  forgetAppSpot: (appName) => ipcRenderer.invoke('position:forget-app-spot', appName),
  notifyPeekHover: (isHovering) => ipcRenderer.send('position:peek-hover', isHovering),
  onPositionDebug: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('position:debug-data', handler);
    return () => ipcRenderer.removeListener('position:debug-data', handler);
  },
  onSizeChanged: (callback) => {
    const handler = (_event, size) => callback(size);
    ipcRenderer.on('size:changed', handler);
    return () => ipcRenderer.removeListener('size:changed', handler);
  },

  // Productivity Buddy & Reminders (Sprint 7)
  getTodos: (filter) => ipcRenderer.invoke('todos:get', filter),
  addTodo: (todo) => ipcRenderer.invoke('todos:add', todo),
  updateTodo: (id, updates) => ipcRenderer.invoke('todos:update', { id, updates }),
  toggleTodo: (id) => ipcRenderer.invoke('todos:toggle', id),
  deleteTodo: (id) => ipcRenderer.invoke('todos:delete', id),
  getTodoStats: () => ipcRenderer.invoke('todos:get-stats'),
  onTodosChanged: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('todos:changed', handler);
    return () => ipcRenderer.removeListener('todos:changed', handler);
  },
  onTodoCompleted: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('todo:completed', handler);
    return () => ipcRenderer.removeListener('todo:completed', handler);
  },

  getProductivityStatus: () => ipcRenderer.invoke('productivity:get-status'),
  takeBreak: () => ipcRenderer.invoke('productivity:take-break'),
  snoozeBreak: (minutes) => ipcRenderer.invoke('productivity:snooze-break', minutes),
  setBreakThreshold: (minutes) => ipcRenderer.invoke('productivity:set-threshold', minutes),
  setShortenTimers: (enable) => ipcRenderer.invoke('productivity:set-shorten-timers', enable),
  onBreakPrompt: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('productivity:break-prompt', handler);
    return () => ipcRenderer.removeListener('productivity:break-prompt', handler);
  },
  onBreakResolved: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('productivity:break-resolved', handler);
    return () => ipcRenderer.removeListener('productivity:break-resolved', handler);
  },

  extractVoiceTask: (audioData) => ipcRenderer.invoke('voice:extract-task', audioData),
  onTriggerVoiceTask: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('action:trigger-voice-task', handler);
    return () => ipcRenderer.removeListener('action:trigger-voice-task', handler);
  },
  onTriggerAddTodo: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('action:trigger-add-todo', handler);
    return () => ipcRenderer.removeListener('action:trigger-add-todo', handler);
  }
});
