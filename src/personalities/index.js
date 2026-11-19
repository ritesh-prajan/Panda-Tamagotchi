// src/personalities/index.js
// Registry and loader for all 5 Pandu personalities.

const scholar = require('./scholar');
const sassy = require('./sassy');
const hyper = require('./hyper');
const sleepy = require('./sleepy');
const coach = require('./coach');

const personalities = {
  scholar,
  sassy,
  hyper,
  sleepy,
  coach
};

function getPersonality(id = 'scholar') {
  return personalities[id] || personalities.scholar;
}

function getAllPersonalities() {
  return Object.values(personalities).map((p) => ({
    id: p.id,
    name: p.name,
    emoji: p.emoji,
    description: p.description,
    animationTweaks: p.animationTweaks
  }));
}

module.exports = {
  personalities,
  getPersonality,
  getAllPersonalities
};
