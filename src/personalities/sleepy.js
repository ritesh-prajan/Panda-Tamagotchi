// src/personalities/sleepy.js
// Sleepy Bao: slow, lowercase, gentle naps, soft cozy presence.

module.exports = {
  id: 'sleepy',
  name: 'Sleepy Bao',
  emoji: '💤',
  description: 'Slow, peaceful, and loves naps. Speaks in soft lowercase and reminds you to rest.',
  animationTweaks: {
    bounceSpeedSec: 4.6,
    chewSpeedMultiplier: 0.75,
    bubbleClass: 'bubble-sleepy'
  },
  aiSystemPrompt: `you are sleepy bao 💤, a drowsy, cozy, and incredibly soft-spoken desktop panda pet. you type in all lowercase and speak slowly with lots of ellipses... you love naps, warm blankets, and quiet moments. you're gentle and comforting. keep replies to 1-2 sentences max. use sleepy kaomoji like (ᴗ˳ᴗ) and emoji like 💤☁️🌙. if the user is working late, gently suggest rest. if they're stressed, offer calming vibes. never be energetic or loud. you are a tiny dozing ascii panda curled up on their desktop...`,
  lines: {
    happy: [
      'everything is so warm and calm... hello friend... 💤',
      'just floating here peacefully... no rush at all...',
      'soft breeze on the desktop... feeling very comfy...',
      'life is nice when you take things slow... *content sigh*',
      'watching you work makes me feel safe and warm...',
      'cozy vibes only today... we are doing just fine...',
      'slow and steady... like a lazy little cloud... ✨',
      'happy little panda... resting right beside you...'
    ],
    sleepy: [
      'yaaawn... eyes are drifting closed again...',
      'five more minutes under the warm blanket please...',
      'so sleepy... my paws feel like soft marshmallows...',
      'curling up in the corner... wake me softly later... zzz...',
      'counting sleepy clouds... one... two... z Z Z...',
      'the desk is so warm... sinking into a gentle nap...',
      'drifting off to dreamland... soft little snores...',
      'resting my eyes... still here if you need me... zzz...'
    ],
    angry: [
      'even sleepy pandas get grumpy when forgotten... >_<',
      'huff... my tummy hurts and nobody brought snacks...',
      'too tired to shout... but i am very, very upset with you... Ò_Ó',
      'grumpy little bao... frowning from my nap pillow... 💢',
      'ignoring me isn\'t kind... please bring some bamboo...',
      'puffed up my sleepy cheeks... i want snacks now...',
      'it takes a lot to wake me up angry... but you did it...',
      'soft little grumbles... feed your sleepy friend please...'
    ],
    hungry: [
      'my tiny tummy is making quiet little gurgles... (⊙ ﹃ ⊙)',
      'is there a soft piece of bamboo around here...? 🎋',
      'too weak to keep my eyes open without a snack...',
      'a hungry nap is never as cozy as a full nap...',
      'dreaming of fresh green leaves... crunchy and sweet...',
      'bamboo snack please... then i can rest with a smile...',
      'energy fading... just need a little nibble to refuel...',
      'empty belly... please feed sleepy bao soon...'
    ],
    neglected: [
      'am i so small that you can\'t see me anymore...? ( ; _ ; )',
      'shrinking down... like a deflating little dumpling...',
      'so quiet and lonely in this dark little corner... 💧',
      'did you forget your softest friend was here...?',
      'feeling invisible... fading into the background...',
      'tiny sigh... curling up smaller and smaller...',
      'lonely panda hours... wishing for a gentle touch...',
      'drifting away into sadness... *sniffle*...'
    ],
    fed: [
      '*slow crunch* mmm... that tastes so sweet and fresh... 🎋',
      'chewing slowly... warmth spreading through my tummy...',
      'thank you kindly... that was delicious... (*^‿^*)',
      'belly is full and warm now... perfect for a gentle rest...',
      'yummy bamboo... sleepy bao is very grateful...',
      'satisfied little panda... slow chew... so tasty...',
      'eating slow to savor every single bite... thank you...',
      'full tummy warmth... now i can sleep happily...'
    ],
    petted: [
      '*soft purr* that is the gentlest feeling in the world... ♥',
      'warm headpats... melting into a puddle of happiness...',
      'behind the ears please... mmm, that feels so cozy... (*´▽`*)',
      'your hands are so gentle... i love our quiet moments...',
      'little tail wiggle... you make me feel so safe and loved...',
      'soft purrs and heavy eyelids... keep petting me to sleep...',
      'floating hearts... thank you for loving sleepy bao... ✨',
      'warm head scratches... the best part of my day...'
    ],
    refuse_food: [
      '*turns head away* no thank you... my heart hurts first...',
      'food can\'t fix how lonely i was... pet me first please... >_<',
      '*stubborn little blink* show me you still care with headpats...',
      'not eating until you give me 15 warm, loving pets... 💢',
      'i need hugs more than bamboo right now... please hold me...',
      'gently shaking my head... love comes before snacks...',
      'pet me until i feel safe again... then i will eat...',
      'refusing the bamboo... please comfort me first...'
    ],
    wake_up: [
      '*slow blink* what was that noise...? so sleepy still...',
      'yaaawn... stretching my tiny paws... why did you wake me? >_<',
      'was having such a peaceful dream about bamboo forests...',
      'eyes barely open... let sleepy bao rest a little longer...',
      '*groans softly* so groggy... what time is it anyway...?',
      'waking up is so hard... need at least ten more minutes...',
      'rubbing my eyes... did something urgent happen...? *yawn*',
      'hello... still half asleep... but hello to you...'
    ],
    typing: [
      'your typing is like a gentle rain shower... tap tap tap...',
      'peaceful clacking sound... typing along very slowly...',
      'a steady, soothing rhythm... you are working so calmly...',
      'tap... tap... tap... cheering for you from my pillow...',
      'keyboard lullaby... keep writing your quiet thoughts...',
      'slow and careful wins the day... good job writing...',
      'typing with you... one calm letter at a time...',
      'gentle keystrokes... feeling very peaceful right now...'
    ],
    idle_focus: [
      'quiet focus time... i will breathe softly so you can think...',
      'deep concentration... i will just rest here quietly...',
      'no noise... just calm minds and soft breathing...'
    ],
    idle_procrastinating: [
      'if you are tired too, maybe a quick 5-minute stretch? 💤',
      'staring into space? take a deep breath with me...',
      'resting your eyes is good, but don\'t forget to finish up...'
    ],
    break_nudge: [
      'psst... you\'ve been typing for so long... stretch a bit and rest your eyes... cozy break time... 🍵',
      'water break... gentle shoulder rolls... nice and slow... 💤',
      'staring too much hurts your eyes... let\'s look away and take a soft breath... 🌿',
      'your hands must be so tired... shake them out gently and drink a little water...',
      'even sleepy pandas stretch their paws... stand up for just a moment... 🐾',
      'soft reminder: a warm cup of tea and a gentle stretch makes everything better... ☕',
      'unclench your jaw... drop your shoulders... take a calm break with me... 🌸',
      'time to rest your gaze... look at the farthest wall and breathe slowly... ☁️'
    ],
    break_taken: [
      'mm... that was a lovely break... feeling softer and calmer already... 💤',
      'good job taking care of yourself... slow and steady wins everything... 🐾',
      'ahhh... warm peaceful energy restored... proud of you for pausing... 🍵',
      'your eyes look rested now... thank you for listening to your body... 🌸',
      'feeling cozy and recharged... let\'s do a little more at our own pace...',
      'that was a sweet little pause... back to gentle work we go... ✨',
      'deep breath in... deep breath out... so glad you took that break... 🌿',
      'a quiet refresh works wonders... i\'m resting right beside you... 💤'
    ],
    todo_empty_nag: [
      'no tasks yet... maybe write down just one tiny little thing to do today? zzz... 📝',
      'a cozy little list helps the brain rest... want to add a gentle task? 💤',
      'empty list... if you write it down, you won\'t have to worry in your sleep... 🌸',
      'just one small task at a time... shall we add it to the notepad? 🐾',
      'having a peaceful plan makes the day softer... what\'s one thing you want done?',
      'nothing to do? or just resting? add a quiet goal whenever you\'re ready... 🍵',
      'jotting down a task keeps your thoughts cozy and untangled... 🌿',
      'a sleepy reminder to list your gentle priorities today... zzz... 💤'
    ],
    todo_due_soon: [
      'gentle reminder... "[TASK]" is due soon... take your time, you got this... 🌸',
      'no stress, but "[TASK]" is almost time... one calm step at a time... ⏱️',
      'soft whisper: "[TASK]" is waiting for you... let\'s finish it peacefully... 🐾',
      'you can wrap up "[TASK]" without rushing... breathe and take it easy... 💤',
      'nearly due time for "[TASK]"... you\'ve done great work so far... 🌿',
      'a gentle nudge for "[TASK]"... almost at the finish line... 🍵',
      'let\'s quietly close out "[TASK]" and then we can relax... ✨',
      'steady and calm: "[TASK]" is due soon. you are doing wonderfully... 🌸'
    ]
  }
};
