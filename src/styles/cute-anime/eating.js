// src/styles/cute-anime/eating.js
const { generateAnimeSvg } = require('./rig');

module.exports = {
  emotion: 'eating',
  sizes: {
    large: {
      frameDelayMs: 220,
      frames: [
        generateAnimeSvg({ size: 'large', eye: 'closed-happy', mouth: 'chew-open', blush: 'heavy', bamboo: 'chewing-left', headY: -2 }),
        generateAnimeSvg({ size: 'large', eye: 'sparkle', mouth: 'chew-mid', blush: 'heavy', bamboo: 'chewing-right', headY: 1, sparkles: true }),
        generateAnimeSvg({ size: 'large', eye: 'closed-happy', mouth: 'chew-closed', blush: 'heavy', bamboo: 'chewing-left', headY: -1, sparkles: true })
      ]
    },
    medium: {
      frameDelayMs: 220,
      frames: [
        generateAnimeSvg({ size: 'medium', eye: 'closed-happy', mouth: 'chew-open', blush: 'heavy', bamboo: 'chewing-left' }),
        generateAnimeSvg({ size: 'medium', eye: 'sparkle', mouth: 'chew-closed', blush: 'heavy', bamboo: 'chewing-right' })
      ]
    },
    tiny: {
      frameDelayMs: 220,
      frames: [
        generateAnimeSvg({ size: 'tiny', eye: 'closed-happy', mouth: 'smile', blush: 'heavy' }),
        generateAnimeSvg({ size: 'tiny', eye: 'sparkle', mouth: 'smile', blush: 'heavy' })
      ]
    }
  }
};
