// src/styles/chunky-robot/eating.js
const { generateRobotSvg } = require('./rig');

module.exports = {
  emotion: 'eating',
  sizes: {
    large: {
      frameDelayMs: 240,
      frames: [
        generateRobotSvg({ size: 'large', ledColor: '#00f0ff', eye: 'blocks', mouth: 'fuel-intake', antennaAngle: -10, antennaLedColor: '#00f0ff', fuelRod: 'charging-1' }),
        generateRobotSvg({ size: 'large', ledColor: '#2ed573', eye: 'smile', mouth: 'fuel-intake', antennaAngle: 10, antennaLedColor: '#2ed573', fuelRod: 'charging-2' }),
        generateRobotSvg({ size: 'large', ledColor: '#00f0ff', eye: 'blocks', mouth: 'pixel-smile', antennaAngle: 0, antennaLedColor: '#7bed9f', fuelRod: 'active' })
      ]
    },
    medium: {
      frameDelayMs: 240,
      frames: [
        generateRobotSvg({ size: 'medium', ledColor: '#00f0ff', eye: 'blocks', mouth: 'fuel-intake', fuelRod: 'charging-1' }),
        generateRobotSvg({ size: 'medium', ledColor: '#2ed573', eye: 'smile', mouth: 'fuel-intake', fuelRod: 'charging-2' })
      ]
    },
    tiny: {
      frameDelayMs: 240,
      frames: [
        generateRobotSvg({ size: 'tiny', ledColor: '#00f0ff', eye: 'blocks', mouth: 'fuel-intake' }),
        generateRobotSvg({ size: 'tiny', ledColor: '#2ed573', eye: 'smile', mouth: 'fuel-intake' })
      ]
    }
  }
};
