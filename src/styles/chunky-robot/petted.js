// src/styles/chunky-robot/petted.js
const { generateRobotSvg } = require('./rig');

module.exports = {
  emotion: 'petted',
  sizes: {
    large: {
      frameDelayMs: 250,
      frames: [
        generateRobotSvg({ size: 'large', ledColor: '#ff4757', eye: 'heart', mouth: 'pixel-smile', antennaAngle: -20, antennaLedColor: '#ff4757', paws: 'petted-wiggle', fuelRod: 'active' }),
        generateRobotSvg({ size: 'large', ledColor: '#ff6b81', eye: 'smile', mouth: 'pixel-smile', antennaAngle: 20, antennaLedColor: '#ff6b81', paws: 'petted-wiggle', fuelRod: 'active' })
      ]
    },
    medium: {
      frameDelayMs: 250,
      frames: [
        generateRobotSvg({ size: 'medium', ledColor: '#ff4757', eye: 'heart', mouth: 'pixel-smile', antennaAngle: -20, paws: 'petted-wiggle' }),
        generateRobotSvg({ size: 'medium', ledColor: '#ff6b81', eye: 'smile', mouth: 'pixel-smile', antennaAngle: 20, paws: 'petted-wiggle' })
      ]
    },
    tiny: {
      frameDelayMs: 250,
      frames: [
        generateRobotSvg({ size: 'tiny', ledColor: '#ff4757', eye: 'heart', mouth: 'pixel-smile' }),
        generateRobotSvg({ size: 'tiny', ledColor: '#ff6b81', eye: 'smile', mouth: 'pixel-smile' })
      ]
    }
  }
};
