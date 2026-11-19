// src/styles/cute-anime/sleepy.js
const { generateAnimeSvg } = require('./rig');

module.exports = {
  emotion: 'sleepy',
  sizes: {
    large: {
      frameDelayMs: 600,
      frames: [
        generateAnimeSvg({ size: 'large', eye: 'closed-sleepy', mouth: 'smile', blush: false, bamboo: 'none', sleepZ: true, headY: 2, headTilt: -2 }),
        generateAnimeSvg({ size: 'large', eye: 'closed-sleepy', mouth: 'drool', blush: false, bamboo: 'none', sleepZ: true, headY: 5, headTilt: 1 }),
        generateAnimeSvg({ size: 'large', eye: 'closed-sleepy', mouth: 'drool', blush: false, bamboo: 'none', sleepZ: true, headY: 3, headTilt: -1 })
      ]
    },
    medium: {
      frameDelayMs: 600,
      frames: [
        generateAnimeSvg({ size: 'medium', eye: 'closed-sleepy', mouth: 'smile', blush: false, bamboo: 'none', sleepZ: true, headY: 2 }),
        generateAnimeSvg({ size: 'medium', eye: 'closed-sleepy', mouth: 'drool', blush: false, bamboo: 'none', sleepZ: true, headY: 4 })
      ]
    },
    tiny: {
      frameDelayMs: 600,
      frames: [
        generateAnimeSvg({ size: 'tiny', eye: 'closed-sleepy', mouth: 'smile', blush: false, sleepZ: true }),
        generateAnimeSvg({ size: 'tiny', eye: 'closed-sleepy', mouth: 'drool', blush: false, sleepZ: true })
      ]
    }
  }
};
