// src/styles/chunky-robot/neglected.js
const { generateRobotSvg } = require('./rig');

module.exports = {
  emotion: 'neglected',
  sizes: {
    large: {
      frameDelayMs: 350,
      frames: [
        generateRobotSvg({ size: 'large', ledColor: '#ff4757', eye: 'glitch', mouth: 'sawtooth', antennaAngle: -25, antennaLedColor: '#747d8c', fuelRod: 'none', lowPower: true, buzzShake: true }),
        generateRobotSvg({ size: 'large', ledColor: '#57606f', eye: 'glitch', mouth: 'flat', antennaAngle: -20, antennaLedColor: '#2f3542', fuelRod: 'none', lowPower: true, buzzShake: false })
      ]
    },
    medium: {
      frameDelayMs: 350,
      frames: [
        generateRobotSvg({ size: 'medium', ledColor: '#ff4757', eye: 'glitch', mouth: 'sawtooth', antennaAngle: -25, fuelRod: 'none', lowPower: true, buzzShake: true }),
        generateRobotSvg({ size: 'medium', ledColor: '#57606f', eye: 'glitch', mouth: 'flat', antennaAngle: -20, fuelRod: 'none', lowPower: true, buzzShake: false })
      ]
    },
    tiny: {
      frameDelayMs: 350,
      frames: [
        generateRobotSvg({ size: 'tiny', ledColor: '#ff4757', eye: 'glitch', mouth: 'sawtooth', lowPower: true }),
        generateRobotSvg({ size: 'tiny', ledColor: '#57606f', eye: 'glitch', mouth: 'flat', lowPower: true })
      ]
    }
  }
};
