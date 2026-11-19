// src/styles/cute-anime/angry.js
const { generateAnimeSvg } = require('./rig');

module.exports = {
  emotion: 'angry',
  sizes: {
    large: {
      frameDelayMs: 320,
      frames: [
        generateAnimeSvg({ size: 'large', eye: 'angry', mouth: 'pout', blush: 'heavy', bamboo: 'none', steam: true, headY: -2, headTilt: -3 }),
        generateAnimeSvg({ size: 'large', eye: 'angry', mouth: 'pout', blush: 'heavy', bamboo: 'none', steam: true, headY: 0, headTilt: 3 })
      ]
    },
    medium: {
      frameDelayMs: 320,
      frames: [
        generateAnimeSvg({ size: 'medium', eye: 'angry', mouth: 'pout', blush: 'heavy', bamboo: 'none', steam: true, headTilt: -2 }),
        generateAnimeSvg({ size: 'medium', eye: 'angry', mouth: 'pout', blush: 'heavy', bamboo: 'none', steam: true, headTilt: 2 })
      ]
    },
    tiny: {
      frameDelayMs: 320,
      frames: [
        generateAnimeSvg({ size: 'tiny', eye: 'angry', mouth: 'pout', blush: 'heavy', steam: true }),
        generateAnimeSvg({ size: 'tiny', eye: 'angry', mouth: 'pout', blush: 'heavy', steam: false })
      ]
    }
  }
};
