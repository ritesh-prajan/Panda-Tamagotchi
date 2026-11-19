// src/styles/chunky-robot/angry.js
const { generateRobotSvg } = require('./rig');

module.exports = {
  emotion: 'angry',
  sizes: {
    large: {
      frameDelayMs: 280,
      frames: [
        generateRobotSvg({ size: 'large', ledColor: '#ff4757', eye: 'x-eyes', mouth: 'sawtooth', antennaAngle: -20, antennaLedColor: '#ff4757', fuelRod: 'none', buzzShake: false }),
        generateRobotSvg({ size: 'large', ledColor: '#ff6b81', eye: 'x-eyes', mouth: 'sawtooth', antennaAngle: 20, antennaLedColor: '#ff6b81', fuelRod: 'none', buzzShake: true })
      ]
    },
    medium: {
      frameDelayMs: 280,
      frames: [
        generateRobotSvg({ size: 'medium', ledColor: '#ff4757', eye: 'x-eyes', mouth: 'sawtooth', antennaAngle: -20, buzzShake: false }),
        generateRobotSvg({ size: 'medium', ledColor: '#ff6b81', eye: 'x-eyes', mouth: 'sawtooth', antennaAngle: 20, buzzShake: true })
      ]
    },
    tiny: {
      frameDelayMs: 280,
      frames: [
        generateRobotSvg({ size: 'tiny', ledColor: '#ff4757', eye: 'x-eyes', mouth: 'sawtooth', antennaLedColor: '#ff4757' }),
        generateRobotSvg({ size: 'tiny', ledColor: '#ff6b81', eye: 'x-eyes', mouth: 'sawtooth', antennaLedColor: '#ff6b81' })
      ]
    }
  }
};
