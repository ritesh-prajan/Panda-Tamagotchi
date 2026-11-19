// src/styles/chunky-robot/blinking.js
const { generateRobotSvg } = require('./rig');

module.exports = {
  emotion: 'blinking',
  sizes: {
    large: {
      frameDelayMs: 250,
      frames: [
        generateRobotSvg({ size: 'large', ledColor: '#2ed573', eye: 'blocks', mouth: 'pixel-smile', antennaAngle: 0, fuelRod: 'active' }),
        generateRobotSvg({ size: 'large', ledColor: '#2ed573', eye: 'blink', mouth: 'pixel-smile', antennaAngle: 0, fuelRod: 'active' }),
        generateRobotSvg({ size: 'large', ledColor: '#2ed573', eye: 'blocks', mouth: 'pixel-smile', antennaAngle: 0, fuelRod: 'active' })
      ]
    },
    medium: {
      frameDelayMs: 250,
      frames: [
        generateRobotSvg({ size: 'medium', ledColor: '#2ed573', eye: 'blocks', mouth: 'pixel-smile', antennaAngle: 0, fuelRod: 'active' }),
        generateRobotSvg({ size: 'medium', ledColor: '#2ed573', eye: 'blink', mouth: 'pixel-smile', antennaAngle: 0, fuelRod: 'active' })
      ]
    },
    tiny: {
      frameDelayMs: 250,
      frames: [
        generateRobotSvg({ size: 'tiny', ledColor: '#2ed573', eye: 'blocks', mouth: 'pixel-smile' }),
        generateRobotSvg({ size: 'tiny', ledColor: '#2ed573', eye: 'blink', mouth: 'pixel-smile' })
      ]
    }
  }
};
