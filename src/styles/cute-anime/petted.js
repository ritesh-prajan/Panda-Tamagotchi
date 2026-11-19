// src/styles/cute-anime/petted.js
const { generateAnimeSvg } = require('./rig');

module.exports = {
  emotion: 'petted',
  sizes: {
    large: {
      frameDelayMs: 250,
      frames: [
        generateAnimeSvg({ size: 'large', eye: 'heart', mouth: 'open-happy', blush: 'heavy', bamboo: 'none', paws: 'petted-hug', sparkles: true, headY: -4 }),
        generateAnimeSvg({ size: 'large', eye: 'closed-happy', mouth: 'smile', blush: 'heavy', bamboo: 'none', paws: 'petted-hug', sparkles: true, headY: 0 })
      ]
    },
    medium: {
      frameDelayMs: 250,
      frames: [
        generateAnimeSvg({ size: 'medium', eye: 'heart', mouth: 'open-happy', blush: 'heavy', bamboo: 'none', paws: 'petted-hug', sparkles: true }),
        generateAnimeSvg({ size: 'medium', eye: 'closed-happy', mouth: 'smile', blush: 'heavy', bamboo: 'none', paws: 'petted-hug', sparkles: true })
      ]
    },
    tiny: {
      frameDelayMs: 250,
      frames: [
        generateAnimeSvg({ size: 'tiny', eye: 'heart', mouth: 'smile', blush: 'heavy' }),
        generateAnimeSvg({ size: 'tiny', eye: 'closed-happy', mouth: 'smile', blush: 'heavy' })
      ]
    }
  }
};
