// src/styles/cute-anime/hungry.js
const { generateAnimeSvg } = require('./rig');

module.exports = {
  emotion: 'hungry',
  sizes: {
    large: {
      frameDelayMs: 400,
      frames: [
        generateAnimeSvg({ size: 'large', eye: 'watery', mouth: 'wavy', blush: true, bamboo: 'none', sweatDrop: true, headY: 2 }),
        generateAnimeSvg({ size: 'large', eye: 'watery', mouth: 'drool', blush: true, bamboo: 'none', sweatDrop: true, headY: -1 })
      ]
    },
    medium: {
      frameDelayMs: 400,
      frames: [
        generateAnimeSvg({ size: 'medium', eye: 'watery', mouth: 'wavy', blush: true, bamboo: 'none', sweatDrop: true }),
        generateAnimeSvg({ size: 'medium', eye: 'watery', mouth: 'drool', blush: true, bamboo: 'none', sweatDrop: true })
      ]
    },
    tiny: {
      frameDelayMs: 400,
      frames: [
        generateAnimeSvg({ size: 'tiny', eye: 'watery', mouth: 'wavy', blush: true, sweatDrop: true }),
        generateAnimeSvg({ size: 'tiny', eye: 'watery', mouth: 'drool', blush: true, sweatDrop: true })
      ]
    }
  }
};
