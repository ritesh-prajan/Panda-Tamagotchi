// src/styles/chunky-robot/typing.js
const { generateRobotSvg } = require('./rig');

module.exports = {
  emotion: 'typing',
  sizes: {
    large: {
      frameDelayMs: 140,
      frames: [
        generateRobotSvg({ size: 'large', ledColor: '#00f0ff', eye: 'sweep-bars', mouth: 'fuel-intake', antennaAngle: -8, antennaLedColor: '#00f0ff', fuelRod: 'active', paws: 'typing-1' }),
        generateRobotSvg({ size: 'large', ledColor: '#2ed573', eye: 'sweep-bars', mouth: 'fuel-intake', antennaAngle: 8, antennaLedColor: '#2ed573', fuelRod: 'active', paws: 'typing-2' })
      ]
    },
    medium: {
      frameDelayMs: 140,
      frames: [
        generateRobotSvg({ size: 'medium', ledColor: '#00f0ff', eye: 'sweep-bars', mouth: 'fuel-intake', paws: 'typing-1' }),
        generateRobotSvg({ size: 'medium', ledColor: '#2ed573', eye: 'sweep-bars', mouth: 'fuel-intake', paws: 'typing-2' })
      ]
    },
    tiny: {
      frameDelayMs: 140,
      frames: [
        generateRobotSvg({ size: 'tiny', ledColor: '#00f0ff', eye: 'sweep-bars', mouth: 'fuel-intake' }),
        generateRobotSvg({ size: 'tiny', ledColor: '#2ed573', eye: 'sweep-bars', mouth: 'fuel-intake' })
      ]
    }
  }
};
