// src/styles/chunky-robot/happy.js
const { generateRobotSvg } = require('./rig');

module.exports = {
  emotion: 'happy',
  sizes: {
    large: {
      frameDelayMs: 450,
      frames: [
        generateRobotSvg({ size: 'large', ledColor: '#2ed573', eye: 'smile', mouth: 'pixel-smile', antennaAngle: -15, antennaLedColor: '#2ed573', fuelRod: 'active' }),
        generateRobotSvg({ size: 'large', ledColor: '#2ed573', eye: 'blocks', mouth: 'pixel-smile', antennaAngle: 0, antennaLedColor: '#7bed9f', fuelRod: 'active' }),
        generateRobotSvg({ size: 'large', ledColor: '#2ed573', eye: 'smile', mouth: 'pixel-smile', antennaAngle: 15, antennaLedColor: '#2ed573', fuelRod: 'active' }),
        generateRobotSvg({ size: 'large', ledColor: '#2ed573', eye: 'blocks', mouth: 'pixel-smile', antennaAngle: 0, antennaLedColor: '#7bed9f', fuelRod: 'active' })
      ]
    },
    medium: {
      frameDelayMs: 450,
      frames: [
        generateRobotSvg({ size: 'medium', ledColor: '#2ed573', eye: 'smile', mouth: 'pixel-smile', antennaAngle: -15, fuelRod: 'active' }),
        generateRobotSvg({ size: 'medium', ledColor: '#2ed573', eye: 'blocks', mouth: 'pixel-smile', antennaAngle: 15, fuelRod: 'active' })
      ]
    },
    tiny: {
      frameDelayMs: 450,
      frames: [
        generateRobotSvg({ size: 'tiny', ledColor: '#2ed573', eye: 'smile', mouth: 'pixel-smile', antennaLedColor: '#2ed573' }),
        generateRobotSvg({ size: 'tiny', ledColor: '#2ed573', eye: 'blocks', mouth: 'pixel-smile', antennaLedColor: '#7bed9f' })
      ]
    }
  }
};
