// src/styles/chunky-robot/hungry.js
const { generateRobotSvg } = require('./rig');

module.exports = {
  emotion: 'hungry',
  sizes: {
    large: {
      frameDelayMs: 400,
      frames: [
        generateRobotSvg({ size: 'large', ledColor: '#ffa502', eye: 'battery', mouth: 'battery-low', antennaAngle: -10, antennaLedColor: '#ffa502', fuelRod: 'empty' }),
        generateRobotSvg({ size: 'large', ledColor: '#ff7f50', eye: 'battery', mouth: 'fuel-intake', antennaAngle: 10, antennaLedColor: '#ff6348', fuelRod: 'empty' })
      ]
    },
    medium: {
      frameDelayMs: 400,
      frames: [
        generateRobotSvg({ size: 'medium', ledColor: '#ffa502', eye: 'battery', mouth: 'battery-low', antennaAngle: -10, fuelRod: 'empty' }),
        generateRobotSvg({ size: 'medium', ledColor: '#ff7f50', eye: 'battery', mouth: 'fuel-intake', antennaAngle: 10, fuelRod: 'empty' })
      ]
    },
    tiny: {
      frameDelayMs: 400,
      frames: [
        generateRobotSvg({ size: 'tiny', ledColor: '#ffa502', eye: 'battery', mouth: 'battery-low' }),
        generateRobotSvg({ size: 'tiny', ledColor: '#ff7f50', eye: 'battery', mouth: 'battery-low' })
      ]
    }
  }
};
