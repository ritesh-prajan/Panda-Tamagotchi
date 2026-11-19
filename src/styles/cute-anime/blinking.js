// src/styles/cute-anime/blinking.js
const { generateAnimeSvg } = require('./rig');

module.exports = {
  emotion: 'blinking',
  sizes: {
    large: {
      frameDelayMs: 250,
      frames: [
        generateAnimeSvg({ size: 'large', eye: 'sparkle', mouth: 'smile', blush: true, bamboo: 'held' }),
        generateAnimeSvg({ size: 'large', eye: 'blink', mouth: 'smile', blush: true, bamboo: 'held' }),
        generateAnimeSvg({ size: 'large', eye: 'sparkle', mouth: 'smile', blush: true, bamboo: 'held' })
      ]
    },
    medium: {
      frameDelayMs: 250,
      frames: [
        generateAnimeSvg({ size: 'medium', eye: 'sparkle', mouth: 'smile', blush: true, bamboo: 'held' }),
        generateAnimeSvg({ size: 'medium', eye: 'blink', mouth: 'smile', blush: true, bamboo: 'held' })
      ]
    },
    tiny: {
      frameDelayMs: 250,
      frames: [
        generateAnimeSvg({ size: 'tiny', eye: 'sparkle', mouth: 'smile', blush: true }),
        generateAnimeSvg({ size: 'tiny', eye: 'blink', mouth: 'smile', blush: true })
      ]
    }
  }
};
