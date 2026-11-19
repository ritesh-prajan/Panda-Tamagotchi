// src/renderer/renderer.js
// Handles ASCII frame animation, petting/feeding interactions, speech bubbles,
// personality animation tweaks, Web Audio SFX, and real-time debug monitors.

const pandaContainer = document.getElementById('panda-container');
const pandaArt = document.getElementById('panda-art');
const emotionNameEl = document.getElementById('emotion-name');
const heartsContainer = document.getElementById('hearts-container');
const speechBubble = document.getElementById('speech-bubble');
const speechText = document.getElementById('speech-text');

// Action buttons
const feedBtn = document.getElementById('feed-btn');
const petBtn = document.getElementById('pet-btn');
const chatToggleBtn = document.getElementById('chat-toggle-btn');
const voiceBtn = document.getElementById('voice-btn');
const quickTodoBtn = document.getElementById('quick-todo-btn');

// Productivity & Voice elements (Sprint 7)
const modalBackdrop = document.getElementById('modal-backdrop');
const breakBanner = document.getElementById('break-banner');
const btnTakeBreak = document.getElementById('btn-take-break');
const btnSnoozeBreak = document.getElementById('btn-snooze-break');

const voiceModal = document.getElementById('voice-modal');
const btnStopRecording = document.getElementById('btn-stop-recording');
const voiceStatusText = document.getElementById('voice-status-text');
const voiceTimerEl = document.getElementById('voice-timer');

const taskDraftCard = document.getElementById('task-draft-card');
const draftTitleInput = document.getElementById('draft-title');
const draftDueInput = document.getElementById('draft-due');
const draftPrioritySelect = document.getElementById('draft-priority');
const draftAddBtn = document.getElementById('draft-add-btn');
const draftDiscardBtn = document.getElementById('draft-discard-btn');
const draftCloseBtn = document.getElementById('draft-close-btn');

const quickTodoModal = document.getElementById('quick-todo-modal');
const quickTodoTitle = document.getElementById('quick-todo-title');
const quickTodoDue = document.getElementById('quick-todo-due');
const quickTodoPriority = document.getElementById('quick-todo-priority');
const quickTodoSaveBtn = document.getElementById('quick-todo-save');
const quickTodoCancelBtn = document.getElementById('quick-todo-cancel');
const quickTodoCloseBtn = document.getElementById('quick-todo-close');

let isRecordingVoice = false;
let mediaRecorder = null;
let audioChunks = [];
let recordingTimer = null;
let recordingSeconds = 0;

// Chat elements
const chatContainer = document.getElementById('chat-container');
const chatInput = document.getElementById('chat-input');
const chatSendBtn = document.getElementById('chat-send-btn');
let isChatOpen = false;
let isSendingChat = false;

// Debug elements
const debugPanel = document.getElementById('debug-panel');
const dbgNeedsEl = document.getElementById('dbg-needs');
const dbgIgnoredEl = document.getElementById('dbg-ignored');
const dbgRefusalEl = null; // removed in Sprint 6 HTML — handled via ignored row
const dbgTypingEl = null;  // removed in Sprint 6 HTML — typing shown in dbg-app
const dbgAppEl = document.getElementById('dbg-app');
const dbgFastTimeBtn = document.getElementById('dbg-fast-time-btn');
const dbgMuteBtn = document.getElementById('dbg-mute-btn');
const dbgPosModeEl = document.getElementById('dbg-pos-mode');
const dbgBoundsEl = document.getElementById('dbg-bounds');
const dbgGeomBtn = document.getElementById('dbg-geom-btn');

// Geometry HUD elements
const geomHud = document.getElementById('geom-hud');
const hudAppEl = document.getElementById('hud-app');
const hudBoundsEl = document.getElementById('hud-bounds');
const hudStateEl = document.getElementById('hud-state');
const hudZonesEl = document.getElementById('hud-zones');
const hudGraceEl = document.getElementById('hud-grace');
let isGeomHudOpen = false;

let currentStyle = 'official-sticker';
let currentEmotion = 'happy';
let currentSize = 'large';
let currentShrinkStage = 0;
let currentPersonality = null;
let isPeeking = false; // set true when position engine is in peek state

let animationTimer = null;
let currentFrameIndex = 0;
let currentLook = null;
let isDebugOpen = false;
let speechBubbleTimer = null;
let lastPlayedEmotion = null;

// Mood glow timer
let moodGlowTimer = null;

// Debug emotion override keymap
const DEBUG_OVERRIDE_KEYS = {
  '1': 'happy',
  '2': 'sleepy',
  '3': 'angry',
  '4': 'hungry',
  '5': 'neglected',
  '6': 'blinking'
};

// ---------------- Click-Through Management ----------------
let isHoveringInteractive = false;
let isDragging = false;

function updateMouseIgnoreState() {
  const isAnyModalOpen = isChatOpen || isRecordingVoice ||
    (breakBanner && !breakBanner.classList.contains('hidden')) ||
    (taskDraftCard && !taskDraftCard.classList.contains('hidden')) ||
    (quickTodoModal && !quickTodoModal.classList.contains('hidden')) ||
    (modalBackdrop && !modalBackdrop.classList.contains('hidden'));

  if (isDragging || isHoveringInteractive || isAnyModalOpen) {
    window.pandaApi.setIgnoreMouseEvents(false);
  } else {
    window.pandaApi.setIgnoreMouseEvents(true, true);
  }
}

function handleMouseEnter() {
  isHoveringInteractive = true;
  updateMouseIgnoreState();
}

function handleMouseLeave() {
  isHoveringInteractive = false;
  if (!isDragging) {
    updateMouseIgnoreState();
  }
}

[
  pandaContainer,
  debugPanel,
  speechBubble,
  chatContainer,
  breakBanner,
  voiceModal,
  taskDraftCard,
  quickTodoModal,
  modalBackdrop
].forEach((el) => {
  if (el) {
    el.addEventListener('mouseenter', handleMouseEnter);
    el.addEventListener('mouseleave', handleMouseLeave);
  }
});

// ---------------- Petting & Dragging Implementation ----------------
let startScreenX = 0;
let startScreenY = 0;
let hasMoved = false;
let petHoldTimer = null;

function createFloatingHeart(x = null, y = null) {
  const heart = document.createElement('div');
  heart.className = 'floating-heart';
  heart.textContent = '♥';

  const containerRect = pandaContainer.getBoundingClientRect();
  const posX = x !== null ? x : containerRect.left + containerRect.width / 2 + (Math.random() * 20 - 10);
  const posY = y !== null ? y : containerRect.top + 20;

  heart.style.left = `${posX}px`;
  heart.style.top = `${posY}px`;

  heartsContainer.appendChild(heart);
  setTimeout(() => {
    if (heart.parentNode) heart.parentNode.removeChild(heart);
  }, 1400);
}

async function triggerPet() {
  createFloatingHeart();
  if (window.pandaAudio) {
    window.pandaAudio.playPet();
  }

  recordUserInteraction();

  const result = await window.pandaApi.pet();

  if (result && result.recovered) {
    triggerTemporaryEmotion('celebration', "I forgive you! Let's be friends again! 🎉🎋", 5500);
    if (window.pandaAudio) window.pandaAudio.playHappy();
    return result;
  }

  // Visual reaction: 5-second petting
  triggerTemporaryEmotion('petted', 'so fluffy... 🐾', 5000);
  return result;
}

async function triggerFeed() {
  const result = await window.pandaApi.feed();
  if (result && result.refused) {
    if (window.pandaAudio) window.pandaAudio.playRefuse();
    pandaContainer.classList.add('shake-refuse');
    setTimeout(() => {
      pandaContainer.classList.remove('shake-refuse');
    }, 450);
  } else if (result && result.success) {
    if (window.pandaAudio) window.pandaAudio.playChew();
    recordUserInteraction();
    // Visual reaction: 5-second eating
    triggerTemporaryEmotion('eating', '*munch munch munch* 🎋', 5000);
  }
  return result;
}

// Prevent button clicks from triggering pandaContainer dragging or pointer capture
[feedBtn, petBtn, chatToggleBtn, voiceBtn, quickTodoBtn].forEach((btn) => {
  if (btn) {
    btn.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
    });
  }
});

feedBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  triggerFeed();
});

petBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  triggerPet();
});

pandaContainer.addEventListener('dblclick', (e) => {
  e.stopPropagation();
  triggerPet();
});

pandaContainer.addEventListener('pointerdown', (e) => {
  if (e.button !== 0) return;
  isDragging = true;
  hasMoved = false;
  startScreenX = e.screenX;
  startScreenY = e.screenY;

  // Record any touch/click on Pandu as an interaction
  recordUserInteraction();

  pandaContainer.setPointerCapture(e.pointerId);
  pandaContainer.classList.add('dragging');
  updateMouseIgnoreState();

  if (petHoldTimer) clearTimeout(petHoldTimer);
  petHoldTimer = setTimeout(() => {
    if (isDragging && !hasMoved) {
      triggerPet();
    }
  }, 350);
});

pandaContainer.addEventListener('pointermove', (e) => {
  if (!isDragging) return;

  const dx = e.screenX - startScreenX;
  const dy = e.screenY - startScreenY;

  if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
    hasMoved = true;
    if (petHoldTimer) {
      clearTimeout(petHoldTimer);
      petHoldTimer = null;
    }
    startScreenX = e.screenX;
    startScreenY = e.screenY;
    window.pandaApi.moveWindowBy(dx, dy);
  }
});

function endDrag(e) {
  if (!isDragging) return;
  if (petHoldTimer) {
    clearTimeout(petHoldTimer);
    petHoldTimer = null;
  }

  isDragging = false;
  pandaContainer.classList.remove('dragging');

  try {
    pandaContainer.releasePointerCapture(e.pointerId);
  } catch (err) {}

  if (hasMoved) {
    window.pandaApi.saveCurrentPosition();
  }

  updateMouseIgnoreState();
}

pandaContainer.addEventListener('pointerup', endDrag);
pandaContainer.addEventListener('pointercancel', endDrag);

// ---------------- Unattended Auto-Sleep & Mood Glow ----------------
const AUTO_SLEEP_DELAY_MS = 25000;
let autoSleepTimer = null;
let isAutoSleeping = false;

// Mood glow colours keyed by emotion
const MOOD_GLOW_CLASSES = [
  'mood-glow-happy', 'mood-glow-sleepy', 'mood-glow-hungry', 'mood-glow-angry',
  'mood-glow-petted', 'mood-glow-eating', 'mood-glow-neglected', 'mood-glow-listening',
  'mood-glow-typing', 'mood-glow-celebration', 'mood-glow-checklist', 'mood-glow-tea'
];

function activateMoodGlow() {
  if (!pandaContainer) return;
  MOOD_GLOW_CLASSES.forEach(c => pandaContainer.classList.remove(c));
  const glowClass = `mood-glow-${currentEmotion}`;
  pandaContainer.classList.add('has-mood-glow', glowClass);
}

function deactivateMoodGlow() {
  if (!pandaContainer) return;
  pandaContainer.classList.remove('has-mood-glow');
  MOOD_GLOW_CLASSES.forEach(c => pandaContainer.classList.remove(c));
}

function resetAutoSleepTimer() {
  if (autoSleepTimer) {
    clearTimeout(autoSleepTimer);
    autoSleepTimer = null;
  }

  // If Pandu was sleeping, any click, drag, or typing wakes him immediately and restores happy!
  if (isAutoSleeping || currentEmotion === 'sleepy') {
    isAutoSleeping = false;
    currentEmotion = 'happy';
    startAnimation();
    if (window.pandaAudio) window.pandaAudio.playHappy();
  }

  // Clicking or interacting always deactivates the glow
  deactivateMoodGlow();

  // Restart 25s unattended timer
  autoSleepTimer = setTimeout(() => {
    const isModalOpen = isChatOpen || isRecordingVoice || isAnyModalVisible() ||
      (breakBanner && !breakBanner.classList.contains('hidden'));

    if (!isModalOpen && currentEmotion !== 'angry' && currentEmotion !== 'neglected') {
      isAutoSleeping = true;
      currentEmotion = 'sleepy';
      startAnimation();
    }
  }, AUTO_SLEEP_DELAY_MS);
}

function recordUserInteraction() {
  resetAutoSleepTimer();
}

function showSpeechBubble(text, durationMs = 10000) {
  if (!text) return;
  speechText.textContent = text;
  speechBubble.classList.remove('hidden');
  deactivateMoodGlow();

  if (speechBubbleTimer) {
    clearTimeout(speechBubbleTimer);
  }

  speechBubbleTimer = setTimeout(() => {
    speechBubble.classList.add('hidden');
    speechBubbleTimer = null;
    // After bubble hides, dissolve into ambient mood glow
    if (moodGlowTimer) clearTimeout(moodGlowTimer);
    moodGlowTimer = setTimeout(() => {
      activateMoodGlow();
      moodGlowTimer = null;
    }, 400);
  }, durationMs);
}

function toggleChat(forceState = null) {
  isChatOpen = forceState !== null ? forceState : !isChatOpen;

  if (isChatOpen) {
    chatContainer.classList.remove('hidden');
    window.pandaApi.setIgnoreMouseEvents(false);
    if (window.pandaApi.focusWindow) {
      window.pandaApi.focusWindow();
    }
    setTimeout(() => {
      chatInput.focus();
      chatInput.select();
    }, 60);
    isHoveringInteractive = true;
    updateMouseIgnoreState();
  } else {
    chatContainer.classList.add('hidden');
    chatInput.blur();
    isHoveringInteractive = false;
    updateMouseIgnoreState();
  }
}

// Close chat when clicking outside chat container
document.addEventListener('pointerdown', (e) => {
  if (isChatOpen && !chatContainer.contains(e.target) && (!chatToggleBtn || !chatToggleBtn.contains(e.target))) {
    toggleChat(false);
  }
});

async function sendChatMessage() {
  const text = (chatInput.value || '').trim();
  if (!text || isSendingChat) return;

  isSendingChat = true;
  chatSendBtn.disabled = true;
  chatSendBtn.textContent = '…';
  showSpeechBubble('Thinking... 💭', 8000);

  try {
    const result = await window.pandaApi.sendChat(text);
    chatInput.value = '';

    // Show AI or in-character response
    if (result && result.text) {
      showSpeechBubble(result.text, 6000);
      if (window.pandaAudio) window.pandaAudio.playHappy();
    }
  } catch (err) {
    console.error('Chat error:', err);
    showSpeechBubble('Oops, my connection hiccuped! (Check Settings/Console)', 4000);
  } finally {
    isSendingChat = false;
    chatSendBtn.disabled = false;
    chatSendBtn.textContent = '↵';
    chatInput.focus();
  }
}

if (chatToggleBtn) {
  chatToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleChat();
  });
}

if (chatSendBtn) {
  chatSendBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    sendChatMessage();
  });
}

if (chatInput) {
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendChatMessage();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      toggleChat(false);
    }
  });
}

// ---------------- Animation Engine & Personality Tweaks ----------------
function applyPersonalityTweaks(personality) {
  if (!personality) return;
  currentPersonality = personality;

  const tweaks = personality.animationTweaks || {};
  const bounceSec = tweaks.bounceSpeedSec || 3.2;

  document.documentElement.style.setProperty('--idle-bounce-duration', `${bounceSec}s`);

  // Update speech bubble styling classes
  speechBubble.className = '';
  if (tweaks.bubbleClass) {
    speechBubble.classList.add(tweaks.bubbleClass);
  }
}

// ---------------- Sprite Preloading & Animation Engine ----------------
const imagePreloadCache = new Map();

function preloadImage(src) {
  if (!src) return Promise.resolve(null);
  if (imagePreloadCache.has(src)) {
    return imagePreloadCache.get(src);
  }
  const p = new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
  imagePreloadCache.set(src, p);
  return p;
}

function preloadLookFrames(look) {
  if (!look || !look.frames) return;
  for (const f of look.frames) {
    if (f && typeof f === 'object' && f.src) {
      preloadImage(f.src);
    }
  }
}

let idlePreloadScheduled = false;
function scheduleIdlePreload() {
  if (idlePreloadScheduled) return;
  idlePreloadScheduled = true;
  const idleFn = window.requestIdleCallback || ((cb) => setTimeout(cb, 1200));
  idleFn(() => {
    const emotions = [
      'happy', 'blinking', 'typing', 'eating', 'angry',
      'hungry', 'neglected', 'petted', 'sleepy', 'celebration',
      'listening', 'checklist', 'tea'
    ];
    let idx = 0;
    function loadNext() {
      if (idx >= emotions.length) return;
      const emo = emotions[idx++];
      try {
        const look = window.pandaApi.getLook('official-sticker', emo, currentSize);
        preloadLookFrames(look);
      } catch (e) {}
      setTimeout(loadNext, 180);
    }
    loadNext();
  });
}

let persistentStickerImg = null;

function renderCurrentFrame() {
  if (!currentLook || !currentLook.frames || currentLook.frames.length === 0) {
    return;
  }
  const frame = currentLook.frames[currentFrameIndex % currentLook.frames.length];
  const isDescriptor = frame && typeof frame === 'object' && frame.type === 'image';
  const isSvg = typeof frame === 'string' && frame.trim().startsWith('<svg');

  if (isDescriptor) {
    // Persistent <img> swapped without innerHTML re-parsing
    if (!persistentStickerImg) {
      persistentStickerImg = document.createElement('img');
      persistentStickerImg.className = 'sticker-img';
      persistentStickerImg.alt = 'Pandu';
    }

    if (persistentStickerImg.parentNode !== pandaArt) {
      pandaArt.textContent = '';
      pandaArt.appendChild(persistentStickerImg);
    }

    pandaArt.classList.add('is-sticker');
    pandaArt.classList.remove('is-svg');

    // Emotion CSS classes (bob for typing, sadness filter for neglected)
    pandaArt.classList.remove('panda-typing-bob', 'panda-neglected-sadness');
    const cssClass = frame.cssClass || (currentLook && currentLook.cssClass);
    if (cssClass) {
      pandaArt.classList.add(cssClass);
    }

    if (persistentStickerImg.getAttribute('src') !== frame.src) {
      persistentStickerImg.src = frame.src;
    }

    persistentStickerImg.style.width = (frame.w || 185) + 'px';
    persistentStickerImg.style.height = (frame.h || 185) + 'px';
    persistentStickerImg.style.objectFit = 'contain';

    const scale = frame.scale || 1.0;
    const offX = frame.offsetX || 0;
    const offY = frame.offsetY || 0;
    persistentStickerImg.style.transform = `translate(${offX}px, ${offY}px) scale(${scale})`;
  } else {
    // Non-sticker (ASCII or SVG)
    if (persistentStickerImg && persistentStickerImg.parentNode === pandaArt) {
      pandaArt.removeChild(persistentStickerImg);
    }
    pandaArt.classList.remove('is-sticker', 'panda-typing-bob', 'panda-neglected-sadness');

    if (isSvg) {
      pandaArt.innerHTML = frame;
      pandaArt.classList.add('is-svg');
    } else {
      pandaArt.textContent = frame;
      pandaArt.classList.remove('is-svg');
    }
  }
}

let temporaryEmotionTimer = null;

async function restoreStateEmotion() {
  if (temporaryEmotionTimer) {
    clearTimeout(temporaryEmotionTimer);
    temporaryEmotionTimer = null;
  }
  try {
    const s = await window.pandaApi.getState();
    if (s && s.currentEmotion) {
      currentEmotion = s.currentEmotion;
      startAnimation();
    }
  } catch (e) {}
}

function triggerTemporaryEmotion(emotion, text = null, durationMs = 4000) {
  if (temporaryEmotionTimer) {
    clearTimeout(temporaryEmotionTimer);
    temporaryEmotionTimer = null;
  }
  currentEmotion = emotion;
  startAnimation();
  if (text) {
    showSpeechBubble(text, durationMs);
  }
  temporaryEmotionTimer = setTimeout(() => {
    temporaryEmotionTimer = null;
    restoreStateEmotion();
  }, durationMs);
}

function updateStyleClass(style) {
  if (!style) return;
  pandaContainer.classList.remove('style-soft-ascii', 'style-cute-anime', 'style-chunky-robot', 'style-official-sticker');
  pandaContainer.classList.add(`style-${style}`);

  if (speechBubble) {
    speechBubble.classList.remove('bubble-style-soft-ascii', 'bubble-style-cute-anime', 'bubble-style-chunky-robot', 'bubble-style-official-sticker');
    speechBubble.classList.add(`bubble-style-${style}`);
  }

  if (style === 'official-sticker') {
    scheduleIdlePreload();
  }
}

function startAnimation(overrideDelayMs = null) {
  if (animationTimer) {
    clearInterval(animationTimer);
    animationTimer = null;
  }

  currentLook = window.pandaApi.getLook(currentStyle, currentEmotion, currentSize);
  preloadLookFrames(currentLook);

  const loopFrom = (currentLook.loopFromFrame != null) ? currentLook.loopFromFrame : 0;
  // If already sleeping and cycling between z, zz, zzz, preserve loop position so it doesn't jump to frame 0!
  if (currentEmotion === 'sleepy' && currentFrameIndex >= loopFrom && currentLook.frames && currentLook.frames.length > loopFrom) {
    currentFrameIndex = loopFrom + ((currentFrameIndex - loopFrom) % (currentLook.frames.length - loopFrom));
  } else {
    currentFrameIndex = 0;
  }

  // Update container emotion class so sleepy pauses bounce
  if (pandaContainer) {
    pandaContainer.classList.toggle('emotion-sleepy', currentEmotion === 'sleepy');
  }

  renderCurrentFrame();

  if (emotionNameEl) {
    const pEmoji = currentPersonality?.emoji || '';
    emotionNameEl.textContent = `${pEmoji} ${currentEmotion}`;
  }

  if (currentLook && currentLook.frames && currentLook.frames.length > 1) {
    let delay = overrideDelayMs || currentLook.frameDelayMs || 450;
    // Personality chew speed multiplier
    const chewMult = currentPersonality?.animationTweaks?.chewSpeedMultiplier || 1.0;
    delay = Math.round(delay / chewMult);

    const totalFrames = currentLook.frames.length;

    animationTimer = setInterval(() => {
      currentFrameIndex++;
      // Once we've played all frames once, loop back to loopFromFrame instead of 0
      if (currentFrameIndex >= totalFrames) {
        currentFrameIndex = loopFrom;
      }
      renderCurrentFrame();
    }, Math.max(70, delay));
  }
}

function updateShrinkStageClass(stage) {
  currentShrinkStage = stage;
  pandaContainer.classList.remove(
    'shrink-stage-0',
    'shrink-stage-1',
    'shrink-stage-2',
    'shrink-stage-3',
    'shrink-stage-4'
  );
  pandaContainer.classList.add(`shrink-stage-${Math.min(4, Math.max(0, stage))}`);
}

// ---------------- Size Variant Management ----------------
function updateSizeClass(size) {
  if (!size || size === currentSize) return;
  currentSize = size;
  pandaContainer.classList.remove('size-large', 'size-medium', 'size-tiny');
  pandaContainer.classList.add(`size-${size}`);
  startAnimation(); // reload art for new size
}

// ---------------- Geometry HUD & Window Sizing ----------------
function updateOverlayWindowDimensions() {
  const isExpanded = isDebugOpen || isGeomHudOpen || isRecordingVoice ||
    (breakBanner && !breakBanner.classList.contains('hidden')) ||
    (taskDraftCard && !taskDraftCard.classList.contains('hidden')) ||
    (quickTodoModal && !quickTodoModal.classList.contains('hidden'));

  if (isExpanded) {
    window.pandaApi.setWindowSize(330, 480);
  } else {
    const defaultSizes = {
      large: { width: 330, height: 340 },
      medium: { width: 260, height: 260 },
      tiny: { width: 180, height: 160 }
    };
    const cur = defaultSizes[currentSize] || defaultSizes.large;
    window.pandaApi.setWindowSize(cur.width, cur.height);
  }
}

function toggleGeomHud() {
  isGeomHudOpen = !isGeomHudOpen;
  if (isGeomHudOpen) {
    geomHud.classList.remove('hidden');
  } else {
    geomHud.classList.add('hidden');
  }
  updateOverlayWindowDimensions();
  updateMouseIgnoreState();
}

if (dbgGeomBtn) {
  dbgGeomBtn.addEventListener('click', toggleGeomHud);
}

// Listen to position debug data from main process
if (window.pandaApi.onPositionDebug) {
  window.pandaApi.onPositionDebug((data) => {
    if (!data) return;
    const geom = data.geom || data;
    const dbg = data.debug || data;
    const appName = geom.appName || data.appName || 'None';
    const bounds = geom.bounds || data.bounds || null;
    const mode = dbg.mode || data.mode || 'off';
    const dodging = dbg.isDodging !== undefined ? dbg.isDodging : data.isDodging;
    const peeking = dbg.isPeeking !== undefined ? dbg.isPeeking : data.isPeeking;
    const freeCorners = dbg.freeZones || data.freeCorners || [];
    const graceSec = dbg.lastManualDragRemainingSec !== undefined ? dbg.lastManualDragRemainingSec : (data.manualGraceMs ? Math.round(data.manualGraceMs / 1000) : 0);

    if (hudAppEl) hudAppEl.textContent = appName;
    if (hudBoundsEl && bounds) {
      hudBoundsEl.textContent = `[${bounds.x}, ${bounds.y}, ${bounds.width}×${bounds.height}]`;
    }
    if (hudStateEl) {
      const st = dodging ? 'Dodging' : peeking ? 'Peeking' : 'Normal';
      hudStateEl.textContent = `${st} (${mode})`;
    }
    if (hudZonesEl && freeCorners) {
      hudZonesEl.textContent = freeCorners.join(', ') || 'None';
    }
    if (hudGraceEl) {
      hudGraceEl.textContent = graceSec > 0 ? `${graceSec}s` : 'Off';
    }
    // Update debug panel rows
    if (dbgPosModeEl) dbgPosModeEl.textContent = mode;
    if (dbgBoundsEl && bounds) {
      dbgBoundsEl.textContent = `${bounds.width}×${bounds.height} @ (${bounds.x},${bounds.y})`;
    }
    // Track peeking state for hover notifications
    isPeeking = !!peeking;
  });
}

// Listen to size changes from main process
if (window.pandaApi.onSizeChanged) {
  window.pandaApi.onSizeChanged((size) => {
    updateSizeClass(size);
  });
}

// ---------------- Peek Hover Notifications ----------------
// When position engine is in peek mode, hovering panda pops it out
pandaContainer.addEventListener('mouseenter', () => {
  if (isPeeking && window.pandaApi.notifyPeekHover) {
    window.pandaApi.notifyPeekHover(true);
  }
});

pandaContainer.addEventListener('mouseleave', () => {
  if (isPeeking && window.pandaApi.notifyPeekHover) {
    window.pandaApi.notifyPeekHover(false);
  }
});

// ---------------- Typing Reaction Logic ----------------
const STRONG_EMOTIONS = ['angry', 'sleepy', 'neglected', 'hungry'];
let isCurrentlyTypingReaction = false;
let savedEmotionBeforeTyping = null;

function handleTypingActivity(data) {
  const { kpm, isTyping } = data;

  if (dbgTypingEl) {
    dbgTypingEl.textContent = isTyping ? `Yes (${kpm} KPM)` : `No (${kpm} KPM)`;
    dbgTypingEl.style.color = isTyping ? '#2ed573' : '#a4b0be';
  }

  if (isTyping) {
    // Typing counts as user activity – reset idle/sleep timer & wake if sleeping
    recordUserInteraction();
  }

  const isStrong = STRONG_EMOTIONS.includes(currentEmotion);

  if (isTyping && !isStrong) {
    if (!isCurrentlyTypingReaction) {
      isCurrentlyTypingReaction = true;
      savedEmotionBeforeTyping = currentEmotion;
      currentEmotion = 'typing';
      startAnimation();
    }
  } else if (!isTyping && isCurrentlyTypingReaction) {
    isCurrentlyTypingReaction = false;
    currentEmotion = savedEmotionBeforeTyping || 'happy';
    startAnimation();
  }
}

// ---------------- Active App Awareness ----------------
function handleActiveAppChanged(data) {
  if (dbgAppEl) {
    dbgAppEl.textContent = data.appName || 'Unknown';
  }
}

// ---------------- Debug Panel Toggle ----------------
function toggleDebugPanel() {
  isDebugOpen = !isDebugOpen;
  if (isDebugOpen) {
    debugPanel.classList.remove('hidden');
  } else {
    debugPanel.classList.add('hidden');
  }
  updateOverlayWindowDimensions();
  updateMouseIgnoreState();
}

// ---------------- Keyboard Debug & Chat Listeners ----------------
window.addEventListener('keydown', (e) => {
  recordUserInteraction();

  // If typing in the chat input, ignore hotkeys
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
    return;
  }

  const key = e.key.toLowerCase();

  if (key === 'c' && !e.ctrlKey) {
    toggleChat();
    return;
  }

  if (key === 'd' && !e.ctrlKey) {
    toggleDebugPanel();
    return;
  }

  if (key === 'g' && !e.ctrlKey) {
    toggleGeomHud();
    return;
  }

  if (key === 'v' && !e.ctrlKey) {
    if (isRecordingVoice) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
    return;
  }

  if (key === 't' && !e.ctrlKey) {
    toggleFastTime();
    return;
  }

  if (e.key === '0') {
    window.pandaApi.setDebugOverride(null);
    return;
  }

  if (e.shiftKey && DEBUG_OVERRIDE_KEYS[e.key]) {
    const targetEmotion = DEBUG_OVERRIDE_KEYS[e.key];
    window.pandaApi.setDebugOverride(targetEmotion);
  }
});

// ---------------- Productivity & Reminders (Sprint 7) ----------------
function showBreakBanner(data) {
  if (!breakBanner) return;
  const mins = Math.round(data?.continuousTypingMinutes || 50);
  const subEl = document.getElementById('break-sub');
  if (subEl) subEl.textContent = `Continuous typing: ${mins}m!`;
  breakBanner.classList.remove('hidden');
  updateOverlayWindowDimensions();
  updateMouseIgnoreState();
  currentEmotion = 'tea';
  startAnimation();
  if (window.pandaAudio) {
    window.pandaAudio.playBreakReminder();
  }
}

function hideBreakBanner() {
  if (!breakBanner) return;
  breakBanner.classList.add('hidden');
  updateOverlayWindowDimensions();
  updateMouseIgnoreState();
  restoreStateEmotion();
}

if (btnTakeBreak) {
  btnTakeBreak.addEventListener('click', async (e) => {
    e.stopPropagation();
    hideBreakBanner();
    createFloatingHeart();
    createFloatingHeart();
    if (window.pandaAudio) window.pandaAudio.playHappy();
    triggerTemporaryEmotion('tea', 'Ahhh, warm bamboo tea... nice break! 🍵🎋', 5000);
    await window.pandaApi.takeBreak();
  });
}

if (btnSnoozeBreak) {
  btnSnoozeBreak.addEventListener('click', async (e) => {
    e.stopPropagation();
    hideBreakBanner();
    await window.pandaApi.snoozeBreak(5);
  });
}

// ---------------- Voice Task Creation (Sprint 7) ----------------
async function startVoiceRecording() {
  try {
    const aiStatus = await window.pandaApi.getAiStatus();
    if (!aiStatus || !aiStatus.hasKey || !aiStatus.isOnline) {
      showSpeechBubble("I can't hear you right now (offline / no API key) 🎋", 4000);
      openQuickTodoModal();
      return;
    }
  } catch (err) {
    showSpeechBubble("I can't hear you right now (offline / no API key) 🎋", 4000);
    openQuickTodoModal();
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks = [];
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        audioChunks.push(e.data);
      }
    };

    mediaRecorder.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());
      if (recordingTimer) clearInterval(recordingTimer);

      if (audioChunks.length === 0) {
        closeVoiceModal();
        return;
      }

      voiceStatusText.textContent = 'Extracting task with Gemini... ⏳';
      btnStopRecording.disabled = true;

      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result.split(',')[1];
        try {
          const res = await window.pandaApi.extractVoiceTask({
            base64Audio: base64Data,
            mimeType: 'audio/webm'
          });

          closeVoiceModal();

          if (res && res.success && res.tasks && res.tasks.length > 0) {
            openDraftCard(res.tasks[0]);
          } else {
            showSpeechBubble("Couldn't extract task. Let's type it! 📝", 3500);
            openQuickTodoModal();
          }
        } catch (err) {
          closeVoiceModal();
          showSpeechBubble("Voice extraction error. Let's type it! 📝", 3500);
          openQuickTodoModal();
        }
      };
      reader.readAsDataURL(audioBlob);
    };

    mediaRecorder.start();
    isRecordingVoice = true;
    currentEmotion = 'listening';
    startAnimation();
    voiceModal.classList.remove('hidden');
    showModalBackdrop();
    voiceStatusText.textContent = 'Listening... Speak your task!';
    btnStopRecording.disabled = false;
    btnStopRecording.textContent = '⏹️ Done Speaking';

    recordingSeconds = 0;
    voiceTimerEl.textContent = '0:00';
    recordingTimer = setInterval(() => {
      recordingSeconds++;
      const m = Math.floor(recordingSeconds / 60);
      const s = recordingSeconds % 60;
      voiceTimerEl.textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
      if (recordingSeconds >= 15) {
        stopVoiceRecording();
      }
    }, 1000);

    updateOverlayWindowDimensions();
    updateMouseIgnoreState();
  } catch (err) {
    console.error('Microphone access failed:', err);
    showSpeechBubble("Pandu can't access microphone! Check permissions 🐾", 4500);
    openQuickTodoModal();
  }
}

function stopVoiceRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  isRecordingVoice = false;
}

// ---------------- Modal Backdrop Helpers ----------------
function showModalBackdrop() {
  if (modalBackdrop) modalBackdrop.classList.remove('hidden');
  updateMouseIgnoreState();
}

function hideModalBackdrop() {
  if (modalBackdrop) modalBackdrop.classList.add('hidden');
}

function isAnyModalVisible() {
  return (voiceModal && !voiceModal.classList.contains('hidden')) ||
         (taskDraftCard && !taskDraftCard.classList.contains('hidden')) ||
         (quickTodoModal && !quickTodoModal.classList.contains('hidden'));
}

// Clicking the backdrop closes whichever modal is open
if (modalBackdrop) {
  modalBackdrop.addEventListener('click', () => {
    closeVoiceModal();
    closeDraftCard();
    closeQuickTodoModal();
  });
}

function closeVoiceModal() {
  if (voiceModal) voiceModal.classList.add('hidden');
  isRecordingVoice = false;
  if (recordingTimer) clearInterval(recordingTimer);
  hideModalBackdrop();
  updateOverlayWindowDimensions();
  updateMouseIgnoreState();
  restoreStateEmotion();
}

if (btnStopRecording) {
  btnStopRecording.addEventListener('click', (e) => {
    e.stopPropagation();
    stopVoiceRecording();
  });
}

// ---------------- Task Draft Confirmation Card ----------------
function openDraftCard(task) {
  const t = task || { title: '', due: null, priority: 'medium' };
  draftTitleInput.value = t.title || '';

  if (t.due) {
    try {
      const d = new Date(t.due);
      const pad = n => String(n).padStart(2, '0');
      draftDueInput.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch (e) {
      draftDueInput.value = '';
    }
  } else {
    draftDueInput.value = '';
  }

  draftPrioritySelect.value = (t.priority || 'medium').toLowerCase();
  taskDraftCard.classList.remove('hidden');
  currentEmotion = 'checklist';
  startAnimation();
  showModalBackdrop();
  updateOverlayWindowDimensions();
  updateMouseIgnoreState();
  setTimeout(() => draftTitleInput.focus(), 60);
}

function closeDraftCard() {
  taskDraftCard.classList.add('hidden');
  if (!isAnyModalVisible()) hideModalBackdrop();
  updateOverlayWindowDimensions();
  updateMouseIgnoreState();
  restoreStateEmotion();
}

if (draftAddBtn) {
  draftAddBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    const title = draftTitleInput ? draftTitleInput.value.trim() : '';
    if (!title) {
      if (draftTitleInput) {
        draftTitleInput.style.borderColor = '#ff4757';
        draftTitleInput.focus();
        setTimeout(() => { if (draftTitleInput) draftTitleInput.style.borderColor = ''; }, 1500);
      }
      return;
    }

    let dueDate = null;
    if (draftDueInput && draftDueInput.value) {
      const d = new Date(draftDueInput.value);
      if (!isNaN(d.getTime())) {
        dueDate = d.toISOString();
      }
    }
    const priority = (draftPrioritySelect && draftPrioritySelect.value) || 'medium';

    try {
      await window.pandaApi.addTodo({ title, dueDate, priority });
      closeDraftCard();

      if (window.pandaAudio) window.pandaAudio.playTaskDone();
      createFloatingHeart();
      showSpeechBubble(`Task added: "${title}"! 📝`, 3500);
    } catch (err) {
      console.error('Failed to add draft todo:', err);
    }
  });
}

if (draftDiscardBtn) {
  draftDiscardBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeDraftCard();
    showSpeechBubble('Draft discarded! 🗑️', 2000);
  });
}

if (draftCloseBtn) {
  draftCloseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeDraftCard();
  });
}

// ---------------- Quick Typed Todo Modal ----------------
function openQuickTodoModal() {
  quickTodoTitle.value = '';
  quickTodoDue.value = '';
  quickTodoPriority.value = 'medium';
  quickTodoModal.classList.remove('hidden');
  currentEmotion = 'checklist';
  startAnimation();
  showModalBackdrop();
  updateOverlayWindowDimensions();
  updateMouseIgnoreState();
  setTimeout(() => quickTodoTitle.focus(), 60);
}

function closeQuickTodoModal() {
  quickTodoModal.classList.add('hidden');
  if (!isAnyModalVisible()) hideModalBackdrop();
  updateOverlayWindowDimensions();
  updateMouseIgnoreState();
  restoreStateEmotion();
}

if (quickTodoSaveBtn) {
  quickTodoSaveBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    const title = quickTodoTitle ? quickTodoTitle.value.trim() : '';
    if (!title) {
      if (quickTodoTitle) {
        quickTodoTitle.style.borderColor = '#ff4757';
        quickTodoTitle.focus();
        setTimeout(() => { if (quickTodoTitle) quickTodoTitle.style.borderColor = ''; }, 1500);
      }
      return;
    }

    let dueDate = null;
    if (quickTodoDue && quickTodoDue.value) {
      const d = new Date(quickTodoDue.value);
      if (!isNaN(d.getTime())) {
        dueDate = d.toISOString();
      }
    }
    const priority = (quickTodoPriority && quickTodoPriority.value) || 'medium';

    try {
      await window.pandaApi.addTodo({ title, dueDate, priority });
      closeQuickTodoModal();

      if (window.pandaAudio) window.pandaAudio.playTaskDone();
      createFloatingHeart();
      showSpeechBubble(`Task added: "${title}"! 📝`, 3500);
    } catch (err) {
      console.error('Failed to add todo:', err);
    }
  });
}

if (quickTodoCancelBtn) {
  quickTodoCancelBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeQuickTodoModal();
  });
}

if (quickTodoCloseBtn) {
  quickTodoCloseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeQuickTodoModal();
  });
}

if (quickTodoTitle) {
  quickTodoTitle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      quickTodoSaveBtn.click();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeQuickTodoModal();
    }
  });
}

if (quickTodoDue) {
  quickTodoDue.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      quickTodoSaveBtn.click();
    }
  });
}

if (voiceBtn) {
  voiceBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isRecordingVoice) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  });
}

if (quickTodoBtn) {
  quickTodoBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    window.pandaApi.openControlWindow('todo');
  });
}

// Fast Time Toggle
let isFastTime = false;
async function toggleFastTime() {
  isFastTime = !isFastTime;
  const mult = isFastTime ? 60 : 1;
  await window.pandaApi.setTimeMultiplier(mult);
  if (dbgFastTimeBtn) {
    dbgFastTimeBtn.textContent = isFastTime ? 'Fast Time (x60) [ON]' : 'Fast Time (x60)';
    dbgFastTimeBtn.style.color = isFastTime ? '#2ed573' : '#f1f2f6';
  }
}

if (dbgFastTimeBtn) {
  dbgFastTimeBtn.addEventListener('click', toggleFastTime);
}

if (dbgMuteBtn) {
  dbgMuteBtn.addEventListener('click', async () => {
    const muted = await window.pandaApi.toggleMute();
    dbgMuteBtn.textContent = muted ? 'Muted' : 'Mute';
    if (window.pandaAudio) window.pandaAudio.setMuted(muted);
  });
}

// ---------------- Initialize & Subscribe ----------------
async function init() {
  try {
    const initialState = await window.pandaApi.getState();
    if (initialState) {
      currentStyle = initialState.style || currentStyle;
      currentEmotion = initialState.currentEmotion || currentEmotion;
      currentSize = initialState.size || currentSize;
      currentShrinkStage = initialState.shrinkStage || 0;
      updateShrinkStageClass(currentShrinkStage);
      updateStyleClass(currentStyle);

      if (initialState.personality) {
        applyPersonalityTweaks(initialState.personality);
      }

      if (window.pandaAudio) {
        window.pandaAudio.setMuted(initialState.isMuted);
        window.pandaAudio.setStyle(currentStyle);
      }
    }
  } catch (err) {
    console.error('Failed to get initial state:', err);
  }

  // State Change Listener
  window.pandaApi.onStateChange((newState) => {
    if (!newState) return;

    if (newState.style && newState.style !== currentStyle) {
      currentStyle = newState.style;
      updateStyleClass(currentStyle);
      if (window.pandaAudio) {
        window.pandaAudio.setStyle(currentStyle);
      }
      startAnimation();
    }

    if (newState.isMuted !== undefined && window.pandaAudio) {
      window.pandaAudio.setMuted(newState.isMuted);
      if (dbgMuteBtn) dbgMuteBtn.textContent = newState.isMuted ? 'Muted' : 'Mute';
    }

    if (newState.personality) {
      applyPersonalityTweaks(newState.personality);
    }

    if (newState.shrinkStage !== undefined && newState.shrinkStage !== currentShrinkStage) {
      updateShrinkStageClass(newState.shrinkStage);
    }

    if (newState.currentEmotion && newState.currentEmotion !== currentEmotion) {
      currentEmotion = newState.currentEmotion;
      startAnimation();

      // If glow is already active, refresh it to reflect new emotion
      if (pandaContainer.classList.contains('has-mood-glow')) {
        activateMoodGlow();
      }

      if (currentEmotion !== lastPlayedEmotion && window.pandaAudio) {
        lastPlayedEmotion = currentEmotion;
        if (currentEmotion === 'angry') window.pandaAudio.playGrumble();
        else if (currentEmotion === 'sleepy') window.pandaAudio.playSleep();
        else if (currentEmotion === 'happy') window.pandaAudio.playHappy();
      }
    }

    if (newState.needs) {
      const n = newState.needs;
      if (dbgNeedsEl) {
        dbgNeedsEl.textContent = `H:${Math.round(n.hunger)} E:${Math.round(n.energy)} M:${Math.round(n.mood)} A:${Math.round(n.affection)}`;
      }
      if (dbgIgnoredEl) {
        dbgIgnoredEl.textContent = `${Math.round(n.ignoredSeconds)}s (Stage ${n.shrinkStage})`;
      }
      if (dbgRefusalEl) {
        dbgRefusalEl.textContent = n.isRefusingFood ? `YES (Need ${15 - (n.petsTowardsRecovery || 0)} pets)` : 'No';
        dbgRefusalEl.style.color = n.isRefusingFood ? '#ff4757' : '#2ed573';
      }
    }
  });

  // Personality Changed Listener
  window.pandaApi.onPersonalityChange((personalityStatus) => {
    if (personalityStatus && personalityStatus.currentPersonality) {
      applyPersonalityTweaks(personalityStatus.currentPersonality);
      startAnimation();
    }
  });

  // Speech Lines Listener
  window.pandaApi.onSpeechLine(({ text, durationMs }) => {
    showSpeechBubble(text, durationMs);
    if (text && (
      text.toLowerCase().includes('todo') ||
      text.toLowerCase().includes('task') ||
      text.toLowerCase().includes('empty list') ||
      text.toLowerCase().includes('list is empty') ||
      text.toLowerCase().includes('checklist')
    )) {
      triggerTemporaryEmotion('checklist', text, durationMs || 5000);
    }
  });

  // Todo completed celebration listener
  if (window.pandaApi.onTodoCompleted) {
    window.pandaApi.onTodoCompleted((todo) => {
      const title = todo?.title ? `"${todo.title}"` : 'Task';
      triggerTemporaryEmotion('celebration', `Great job finishing ${title}! 🎉✨`, 4500);
      if (window.pandaAudio) window.pandaAudio.playTaskDone();
    });
  }

  // Typing & Window Awareness
  window.pandaApi.onTypingActivity(handleTypingActivity);
  window.pandaApi.onActiveAppChanged(handleActiveAppChanged);

  // Productivity & Reminders (Sprint 7)
  if (window.pandaApi.onBreakPrompt) {
    window.pandaApi.onBreakPrompt((data) => {
      showBreakBanner(data);
    });
  }

  if (window.pandaApi.onBreakResolved) {
    window.pandaApi.onBreakResolved(() => {
      hideBreakBanner();
    });
  }

  if (window.pandaApi.onTriggerVoiceTask) {
    window.pandaApi.onTriggerVoiceTask(() => {
      startVoiceRecording();
    });
  }

  if (window.pandaApi.onTriggerAddTodo) {
    window.pandaApi.onTriggerAddTodo(() => {
      openQuickTodoModal();
    });
  }

  resetAutoSleepTimer();
  scheduleIdlePreload();
  startAnimation();
  updateMouseIgnoreState();
}

init();
