// src/styles/index.js
// Style and look loader: exposes getLook(style, emotion, size).
// Adding a new emotion only requires dropping a new <emotion>.js file into the style folder.

const fs = require('fs');
const path = require('path');

function getLook(style = 'official-sticker', emotion = 'happy', size = 'large') {
  const safeStyle = String(style).replace(/[^a-zA-Z0-9_-]/g, '');
  const safeEmotion = String(emotion).replace(/[^a-zA-Z0-9_-]/g, '');
  const styleDir = path.join(__dirname, safeStyle);

  let lookModule = null;
  const emotionFile = path.join(styleDir, `${safeEmotion}.js`);

  if (fs.existsSync(emotionFile)) {
    try {
      lookModule = require(emotionFile);
    } catch (err) {
      console.error(`Failed to load emotion look "${safeEmotion}":`, err);
    }
  }

  // Fallback to happy.js if requested emotion file is not found
  if (!lookModule) {
    const fallbackFile = path.join(styleDir, 'happy.js');
    if (fs.existsSync(fallbackFile)) {
      try {
        lookModule = require(fallbackFile);
      } catch (err) {
        console.error('Failed to load fallback emotion look:', err);
      }
    }
  }

  if (!lookModule) {
    return {
      style: safeStyle,
      emotion: safeEmotion,
      size,
      frameDelayMs: 500,
      frames: [' (•ᴥ•) \n[bamboo]']
    };
  }

  // Select size; fallback to large if requested size is not yet defined
  const sizeData = (lookModule.sizes && (lookModule.sizes[size] || lookModule.sizes.large)) || {
    frameDelayMs: 400,
    frames: []
  };

  const frames = (sizeData.frames && sizeData.frames.length > 0)
    ? sizeData.frames
    : (lookModule.sizes?.large?.frames || []);

  return {
    style: safeStyle,
    emotion: lookModule.emotion || safeEmotion,
    status: lookModule.status || 'final',
    cssClass: lookModule.cssClass || '',
    size,
    frameDelayMs: sizeData.frameDelayMs || 400,
    loopFromFrame: sizeData.loopFromFrame != null ? sizeData.loopFromFrame : null,
    frames
  };
}

function getAvailableEmotions(style = 'official-sticker') {
  const safeStyle = String(style).replace(/[^a-zA-Z0-9_-]/g, '');
  const styleDir = path.join(__dirname, safeStyle);
  if (!fs.existsSync(styleDir)) return [];

  return fs.readdirSync(styleDir)
    .filter((file) => file.endsWith('.js') && file !== 'index.js' && file !== 'rig.js')
    .map((file) => path.basename(file, '.js'));
}

function getAvailableStyles() {
  return [
    {
      id: 'official-sticker',
      name: 'PANDU',
      desc: 'Official hand-drawn chibi panda with lush sprite animations, mossy cushion, bamboo, and expressive reactions.'
    },
    {
      id: 'soft-ascii',
      name: 'Soft ASCII',
      desc: 'Cute monospaced rounded ASCII panda holding green bamboo. Lightweight and retro.'
    },
    {
      id: 'cute-anime',
      name: 'Cute Anime',
      desc: 'Adorable pastel chibi anime panda with sparkly eyes, soft blush, and bamboo snacks.'
    },
    {
      id: 'chunky-robot',
      name: 'Chunky Robot',
      desc: 'Boxy cyber panda-bot with glowing neon LED visor, rotating antenna, and fuel cell.'
    }
  ];
}

module.exports = {
  getLook,
  getAvailableEmotions,
  getAvailableStyles
};
