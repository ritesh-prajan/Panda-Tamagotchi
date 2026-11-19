// src/styles/cute-anime/happy.js
const { generateAnimeSvg } = require('./rig');

module.exports = {
  emotion: 'happy',
  sizes: {
    large: {
      frameDelayMs: 450,
      frames: [
        generateAnimeSvg({ size: 'large', eye: 'sparkle', mouth: 'chew-open', blush: true, bamboo: 'held', headY: 0 }),
        generateAnimeSvg({ size: 'large', eye: 'closed-happy', mouth: 'chew-mid', blush: true, bamboo: 'chewing-left', headY: -3, sparkles: true }),
        generateAnimeSvg({ size: 'large', eye: 'sparkle', mouth: 'chew-closed', blush: true, bamboo: 'held', headY: 0 }),
        generateAnimeSvg({ size: 'large', eye: 'closed-happy', mouth: 'chew-mid', blush: true, bamboo: 'chewing-right', headY: -3, sparkles: true })
      ]
    },
    medium: {
      frameDelayMs: 450,
      frames: [
        generateAnimeSvg({ size: 'medium', eye: 'sparkle', mouth: 'chew-open', blush: true, bamboo: 'held', headY: 0 }),
        generateAnimeSvg({ size: 'medium', eye: 'closed-happy', mouth: 'chew-mid', blush: true, bamboo: 'chewing-left', headY: -2 }),
        generateAnimeSvg({ size: 'medium', eye: 'sparkle', mouth: 'chew-closed', blush: true, bamboo: 'held', headY: 0 }),
        generateAnimeSvg({ size: 'medium', eye: 'closed-happy', mouth: 'chew-mid', blush: true, bamboo: 'chewing-right', headY: -2 })
      ]
    },
    tiny: {
      frameDelayMs: 450,
      frames: [
        generateAnimeSvg({ size: 'tiny', eye: 'sparkle', mouth: 'smile', blush: true }),
        generateAnimeSvg({ size: 'tiny', eye: 'closed-happy', mouth: 'smile', blush: true }),
        generateAnimeSvg({ size: 'tiny', eye: 'sparkle', mouth: 'smile', blush: true }),
        generateAnimeSvg({ size: 'tiny', eye: 'closed-happy', mouth: 'smile', blush: true })
      ]
    }
  }
};
