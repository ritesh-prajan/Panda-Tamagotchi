// src/core/state.js
// Tiny central state holding current look, style, needs, personality, and settings.

const state = {
  currentEmotion: 'happy',
  style: 'official-sticker',
  size: 'large',
  shrinkStage: 0,
  isMuted: false,
  isFocusMode: false,
  startWithWindows: false,
  timeMultiplier: 1,
  debugOverride: null,
  positioningMode: 'smart',
  followActiveMonitor: false,
  hideOnFullscreen: false,
  isDodging: false,
  isPeeking: false,
  activeAppName: 'Unknown',
  perAppSpots: {},
  personality: {
    id: 'scholar',
    name: 'Scholar Panda',
    emoji: '🎓'
  },
  needs: {
    hunger: 80,
    energy: 90,
    mood: 85,
    affection: 80,
    ignoredSeconds: 0,
    shrinkStage: 0,
    isRefusingFood: false
  }
};

const listeners = new Set();

function getState() {
  return { ...state };
}

function setState(updates) {
  Object.assign(state, updates);
  for (const listener of listeners) {
    try {
      listener({ ...state });
    } catch (err) {
      console.error('State listener error:', err);
    }
  }
  return { ...state };
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

module.exports = {
  getState,
  setState,
  subscribe
};
