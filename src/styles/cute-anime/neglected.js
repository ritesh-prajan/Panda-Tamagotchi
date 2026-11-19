// src/styles/cute-anime/neglected.js
const { generateAnimeSvg } = require('./rig');

module.exports = {
  emotion: 'neglected',
  sizes: {
    large: {
      frameDelayMs: 400,
      frames: [
        generateAnimeSvg({ size: 'large', eye: 'teary', mouth: 'wavy', blush: false, bamboo: 'none', tears: 'streaming', headY: 3, headTilt: -2 }),
        generateAnimeSvg({ size: 'large', eye: 'teary', mouth: 'wavy', blush: false, bamboo: 'none', tears: 'streaming', headY: 5, headTilt: 2 })
      ]
    },
    medium: {
      frameDelayMs: 400,
      frames: [
        generateAnimeSvg({ size: 'medium', eye: 'teary', mouth: 'wavy', blush: false, bamboo: 'none', tears: 'streaming', headTilt: -1 }),
        generateAnimeSvg({ size: 'medium', eye: 'teary', mouth: 'wavy', blush: false, bamboo: 'none', tears: 'streaming', headTilt: 1 })
      ]
    },
    tiny: {
      frameDelayMs: 400,
      frames: [
        generateAnimeSvg({ size: 'tiny', eye: 'teary', mouth: 'wavy', blush: false, tears: true }),
        generateAnimeSvg({ size: 'tiny', eye: 'teary', mouth: 'wavy', blush: false, tears: false })
      ]
    }
  }
};
