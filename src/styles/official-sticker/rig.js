// src/styles/official-sticker/rig.js
// Descriptor-based frame generator reading from manifest.json.
// Generates lightweight frame descriptors { type: 'image', src, w, h, scale, offsetX, offsetY }
// without any base64 string allocations.

const path = require('path');
const manifest = require('./manifest.json');

const SIZES = manifest.sizes || {
  large: { w: 185, h: 185 },
  medium: { w: 145, h: 145 },
  tiny: { w: 100, h: 100 }
};

function getFrameDescriptor(filename, size = 'large', emotion = 'happy') {
  const emoConfig = manifest.emotions[emotion] || {};
  const profileKey = emoConfig.profile || (filename.startsWith('idle_') ? 'idle' : filename.startsWith('listening_') ? 'listening' : filename.startsWith('celebration_') ? 'celebration' : 'standard');
  const norm = manifest.normalization[profileKey] || manifest.normalization.standard;

  const targetDim = SIZES[size] || SIZES.large;
  const isTall = norm.baseW < norm.baseH;
  const w = isTall ? Math.round(targetDim.w * (norm.baseW / norm.baseH)) : targetDim.w;
  const h = targetDim.h;

  return {
    type: 'image',
    src: `../assets/official-chibi-opt/${filename}`,
    filename,
    w,
    h,
    scale: norm.scale || 1.0,
    offsetX: norm.offsetX || 0,
    offsetY: norm.offsetY || 0,
    cssClass: emoConfig.cssClass || ''
  };
}

function getEmotionModule(emotionName) {
  const cfg = manifest.emotions[emotionName];
  if (!cfg) {
    throw new Error(`Emotion "${emotionName}" not found in official-sticker/manifest.json`);
  }

  // Filter out any frames marked in skipFrames
  const rawFrames = cfg.frames || [];
  const skipList = cfg.skipFrames || [];
  const filteredFrames = rawFrames.filter((_, idx) => !skipList.includes(idx));

  return {
    emotion: emotionName,
    status: cfg.status || 'final',
    cssClass: cfg.cssClass || '',
    note: cfg.note || '',
    sizes: {
      large: {
        frameDelayMs: cfg.frameDelayMs || 400,
        loopFromFrame: cfg.loopFromFrame != null ? cfg.loopFromFrame : null,
        frames: filteredFrames.map(f => getFrameDescriptor(f, 'large', emotionName))
      },
      medium: {
        frameDelayMs: cfg.frameDelayMs || 400,
        loopFromFrame: cfg.loopFromFrame != null ? cfg.loopFromFrame : null,
        frames: filteredFrames.map(f => getFrameDescriptor(f, 'medium', emotionName))
      },
      tiny: {
        frameDelayMs: cfg.frameDelayMs || 400,
        loopFromFrame: cfg.loopFromFrame != null ? cfg.loopFromFrame : null,
        frames: filteredFrames.map(f => getFrameDescriptor(f, 'tiny', emotionName))
      }
    }
  };
}

module.exports = {
  manifest,
  getFrameDescriptor,
  getEmotionModule
};
