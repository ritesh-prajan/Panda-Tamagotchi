// src/styles/cute-anime/typing.js
const { generateAnimeSvg } = require('./rig');

module.exports = {
  emotion: 'typing',
  sizes: {
    large: {
      frameDelayMs: 140,
      frames: [
        generateAnimeSvg({ size: 'large', eye: 'looking-down', mouth: 'smile', blush: true, bamboo: 'none', paws: 'typing-1', headY: 1 }),
        generateAnimeSvg({ size: 'large', eye: 'looking-down', mouth: 'open-happy', blush: true, bamboo: 'none', paws: 'typing-2', headY: -1 })
      ]
    },
    medium: {
      frameDelayMs: 140,
      frames: [
        generateAnimeSvg({ size: 'medium', eye: 'looking-down', mouth: 'smile', blush: true, bamboo: 'none', paws: 'typing-1' }),
        generateAnimeSvg({ size: 'medium', eye: 'looking-down', mouth: 'open-happy', blush: true, bamboo: 'none', paws: 'typing-2' })
      ]
    },
    tiny: {
      frameDelayMs: 140,
      frames: [
        generateAnimeSvg({ size: 'tiny', eye: 'looking-down', mouth: 'smile', blush: true }),
        generateAnimeSvg({ size: 'tiny', eye: 'sparkle', mouth: 'smile', blush: true })
      ]
    }
  }
};
