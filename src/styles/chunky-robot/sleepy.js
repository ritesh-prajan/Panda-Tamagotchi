// src/styles/chunky-robot/sleepy.js
const { generateRobotSvg } = require('./rig');

module.exports = {
  emotion: 'sleepy',
  sizes: {
    large: {
      frameDelayMs: 650,
      frames: [
        generateRobotSvg({ size: 'large', ledColor: '#70a1ff', eye: 'half-dim', mouth: 'flat', antennaAngle: 25, antennaLedColor: '#5352ed', fuelRod: 'none', lowPower: true }),
        generateRobotSvg({ size: 'large', ledColor: '#5352ed', eye: 'blink', mouth: 'flat', antennaAngle: 30, antennaLedColor: '#3742fa', fuelRod: 'none', lowPower: true })
      ]
    },
    medium: {
      frameDelayMs: 650,
      frames: [
        generateRobotSvg({ size: 'medium', ledColor: '#70a1ff', eye: 'half-dim', mouth: 'flat', antennaAngle: 25, fuelRod: 'none', lowPower: true }),
        generateRobotSvg({ size: 'medium', ledColor: '#5352ed', eye: 'blink', mouth: 'flat', antennaAngle: 30, fuelRod: 'none', lowPower: true })
      ]
    },
    tiny: {
      frameDelayMs: 650,
      frames: [
        generateRobotSvg({ size: 'tiny', ledColor: '#70a1ff', eye: 'half-dim', mouth: 'flat', lowPower: true }),
        generateRobotSvg({ size: 'tiny', ledColor: '#5352ed', eye: 'blink', mouth: 'flat', lowPower: true })
      ]
    }
  }
};
