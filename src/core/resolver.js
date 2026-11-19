// src/core/resolver.js
// Pure function resolving current pet emotion from needs and context.
// Priority order: neglected > angry > hungry > sleepy > happy.

function resolveEmotion(needs, context = {}) {
  // Debug manual override takes precedence if explicitly set
  if (context.debugOverride) {
    return context.debugOverride;
  }

  if (!needs) {
    return 'happy';
  }

  // 1. Neglected: triggered if shrunk due to lack of interaction or critical low affection
  if (needs.shrinkStage > 0 || needs.affection < 25) {
    return 'neglected';
  }

  // 2. Angry: triggered if neglected/ignored while hungry
  const isHungryAndIgnored = needs.hunger < 30 && (needs.ignoredSeconds >= (context.ignoredAngerThresholdSec || 600));
  if (needs.isAngry || isHungryAndIgnored) {
    return 'angry';
  }

  // 3. Hungry: tummy rumbling
  if (needs.hunger < 35) {
    return 'hungry';
  }

  // 4. Sleepy: persistent isSleeping flag or night sleep (unless temporarily woken up)
  const isSleeping = Boolean(needs.isSleeping || context.isSleeping || (context.isNight && !context.isWokenUp));
  if (isSleeping && !context.isWokenUp) {
    return 'sleepy';
  }

  // 5. Default happy state
  return 'happy';
}

module.exports = {
  resolveEmotion
};
