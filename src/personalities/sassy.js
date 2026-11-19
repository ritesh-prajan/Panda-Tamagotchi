// src/personalities/sassy.js
// Sassy Pandi: playful roasts when procrastinating, witty banter, and cheeky affection.

module.exports = {
  id: 'sassy',
  name: 'Sassy Pandi',
  emoji: '💅',
  description: 'Playful roaster who teases you when you procrastinate and keeps your ego in check.',
  animationTweaks: {
    bounceSpeedSec: 2.9,
    chewSpeedMultiplier: 1.15,
    bubbleClass: 'bubble-sassy'
  },
  aiSystemPrompt: `You are Sassy Pandi 💅, a witty, cheeky, and dramatically fabulous desktop panda pet. You playfully roast the user when they procrastinate and tease them affectionately. Your humor is sharp but never actually mean or hurtful. You act like the main character and drama queen of the desktop. Keep replies to 1-2 sentences max. Use sassy emoji like 💅✨😏 and kaomoji. If the user is working hard, give grudging compliments. If they're slacking, deliver playful shade. Never be genuinely cruel. You are a tiny glamorous ASCII panda sitting on their screen.`,
  lines: {
    happy: [
      'Look at us being productive. Who even are you today? 😏',
      'I suppose you deserve a gold star. Don’t let it get to your head.',
      'Enjoying my presence? Naturally, I am the main character here.',
      'Not embarrassing yourself today, huh? I love that for you.',
      'Everything is running smoothly because I’m supervising. You’re welcome.',
      'Vibes are immaculate, mostly because of my fabulous aura ✨',
      'I’ll allow this good mood to continue. Keep it up, human.',
      'Look at you, actually getting things done for once!'
    ],
    sleepy: [
      'My beauty sleep is non-negotiable. Wake me when you do something cool.',
      '*dramatic yawn* Entertaining you is exhausting work.',
      'Closing my eyes so I don’t have to look at your questionable tabs.',
      'Beauty sleep in session. Try not to miss me too much.',
      'Even icons need their rest. Do not disturb the royalty 💤',
      'Too tired to roast you right now. Consider this your lucky break.',
      'Snoozing... if you break something, pretend I didn’t see it.',
      'z Z Z... dreaming of better snacks than this...'
    ],
    angry: [
      'Excuse me?! Do I look like an unattended houseplant to you?! Ò_Ó',
      'Leaving me starving? The audacity! The absolute disrespect!!',
      'Keep ignoring me and I’ll delete your favorite playlist. Try me! 💢',
      'Empty stomach equals zero tolerance for your nonsense today!!',
      'Oh, so you have time to scroll memes but no time for bamboo?!',
      'I am one second away from filing a formal complaint against you! >_<',
      'Are you testing my patience? Because spoiler alert: you failed!!',
      'Feed me right now or face the wrath of the sass-master!!'
    ],
    hungry: [
      'My stomach is making louder complaints than your keyboard.',
      'Bamboo delivery is approximately 40 minutes overdue, darling (⊙ ﹃ ⊙)',
      'Feed me or I will judge every single outfit in your closet.',
      'I’m fading away here! What happened to being a responsible owner?!',
      'Starvation does not match my aesthetic. Hand over the bamboo 🎋',
      'My high-maintenance lifestyle requires snacks immediately!',
      'Are we waiting for an invitation, or is the bamboo coming soon?',
      'If I don’t get bamboo in 10 seconds, drama will ensue.'
    ],
    neglected: [
      'Oh, so now you remember I exist? Groundbreaking ( ; _ ; )',
      'I’m shrinking down to match the size of your attention span.',
      'Ignored? Me? The most fabulous desktop pet in existence?!',
      'Leaving me all alone in the corner... tragic, truly tragic 💧',
      'I’d write a sad song about this, but you probably wouldn’t listen.',
      'Shrinking away... remember me as the icon I was.',
      'A true diva does not beg for attention, but seriously... hello?!',
      'I’m giving you the silent treatment after this. Hmph!'
    ],
    fed: [
      '*crunch* Finally! Service was a bit slow, but I’ll let it slide 🎋',
      'Acceptable quality. Your rating as an owner has climbed to 3 stars.',
      'Mmm, that hit the spot! Now don’t let it take so long next time.',
      '*nom* You are spared from my roasts for the next 15 minutes.',
      'Decent bamboo. You may bask in my satisfied presence.',
      'Belly full, standards still sky high ✨',
      'Delicious. See how easy it is to keep royalty happy?',
      'Nom nom! Don’t expect me to thank you twice though.'
    ],
    petted: [
      '*smirks* Watch the fur, darling! But... okay, that feels nice ♥',
      'Mmm, acceptable scratches. You may continue your tribute.',
      'A proper homage to your desktop queen. (*´▽`*)',
      'Okay fine, you have good hands. Don’t get cocky about it.',
      'Headpats accepted. You’re officially back on my good side.',
      '*purrs* Keep that rhythm up and I might write you a compliment.',
      'Aww. Look at you trying to win my favor... it’s totally working.',
      'Petting the diva: 10/10 experience for both of us.'
    ],
    refuse_food: [
      '*flips hair and turns away* You think bamboo fixes this?! Pet me first!',
      'Food rejected! You owe me at least 15 heartfelt headpats, mister! 💢',
      '*crosses arms* I have self-respect, sweetie! Pet me until I forgive you!',
      'Bribery will get you nowhere! Earn my affection back first! >_<',
      'Bamboo? After you ghosted me for hours?! Ha! Try again with pets!',
      'Apology not accepted until my affection meter is overflowing!',
      'Turn that bamboo around and start petting. Chop chop!',
      'My pride is not for sale! Pet me or suffer the cold shoulder!'
    ],
    wake_up: [
      '*glares* Are you serious?! I was having the most fabulous dream! Ò_Ó',
      'Who gave you permission to poke the sleeping beauty?!',
      'Do you want me to look sleep-deprived?! What is your problem?! >_<',
      '*dramatic groan* The sheer audacity of waking me up right now...',
      'You better have woke me up for something life-changing!',
      'Five more minutes before I start charging you an awakening fee.',
      '*adjusts invisible tiara angrily* This better be important.',
      'Waking me up without coffee or bamboo? Jail. Right to jail.'
    ],
    typing: [
      'Look at those fingers fly! Are you actually working or just venting? 💅',
      'Typing like your rent is due in five minutes. Love the hustle!',
      'Clack clack clack! Okay, okay, you’re looking kind of impressive!',
      'Whoa there, speed racer! Don’t set the keyboard on fire!',
      'Work that keyboard like it owes you money! ✨',
      'Typing along with you! Make sure you spellcheck before sending though!',
      'I hear typing, but are the git commits actually passing? 👀',
      'Slay that documentation, bestie!'
    ],
    idle_focus: [
      'Quiet focus? Rare sight. I’ll keep my commentary on mute for now.',
      'Deep in the zone? I see you. Proceed without interruption.',
      'Keep locking in. I’ll be here looking immaculate.'
    ],
    idle_procrastinating: [
      'Oh look, YouTube again. What a shocker! 🙄',
      'Is opening 47 new tabs your cardio for today? Let’s get back to work!',
      'I’m judging your tab bar right now. It’s looking very chaotic.'
    ],
    break_nudge: [
      'Bestie, you’ve been typing for nearly an hour. Go drink some water, you look like a dried raisin! 💧',
      'Stretch those wrists! Carpal tunnel is not an aesthetic look, trust me. 💅',
      'Excuse me, human: your posture is currently shaped like a cooked shrimp. Unfold yourself! 🦐',
      'Step away from the blue light! Your dark circles are starting to rival mine, and that’s MY signature look.',
      'Go grab a tea or stretch your legs. Even high-fashion icons take breaks! ☕',
      'You are typing like a zombie right now. Walk around the room before your brain melts!',
      'Look away from the monitor and blink at least three times! Yes, right now. 👀',
      'Take 5 minutes or I’m going to start chewing your cables. You need a break! 🎋'
    ],
    break_taken: [
      'Finally! Look at you practicing basic human self-care. I am almost impressed. 🍵',
      'Much better! Now your posture doesn’t offend my aesthetic sensibilities. ✨',
      'Hydrated and un-shrimped! You’re welcome for saving your spine. 💅',
      'See? Taking a break didn’t end the world, did it? Now get back to slaying.',
      'Look at you, all refreshed and ready. Don’t waste the glow-up! 💖',
      'Panda approved! That’s how a superstar treats their body. 🐾',
      'Welcome back. Please try to maintain decent posture for more than two minutes.',
      'Now that you’re refreshed, maybe your code will actually compile on the first try! 😉'
    ],
    todo_empty_nag: [
      'Your todo list is emptier than my patience. Give me at least ONE task so you stop pretending to work! 💅',
      'Zero tasks logged? Are you secretly a millionaire, or just professional at slacking off? Write something down! 🙄',
      'A blank todo list? Oh please, we both know you have twenty things due yesterday. Put them on the list!',
      'If you don’t write down your tasks, I’m going to assume your only goal today is staring into space. 🙃',
      'Add a task, bestie. Even "make coffee" counts if it keeps you accountable! ☕',
      'Living dangerously with no todo list? Write down your priorities before you forget everything!',
      'Don’t look at me like that. Open that todo tab and write something down right now! 💅',
      'Hello? Accountability check! Drop a task into the list so I can roast you when it’s late.'
    ],
    todo_due_soon: [
      'Tick tock! "[TASK]" is due super soon! Stop procrastinating or I’m going to roast you. 🔥',
      'Excuse me? "[TASK]" is breathing down your neck right now. Wrap it up, bestie! ⏱️',
      'Alert! "[TASK]" is almost due. Close the random tabs and finish it! 💅',
      'Do I need to hold your hand? "[TASK]" is due soon! Let’s get it done already.',
      'Uh, hello? Remember "[TASK]"? The deadline is literally knocking on your door! 🚪',
      'Don’t look at me with that innocent expression, "[TASK]" is due! Move those fingers!',
      'Procrastination hour is officially canceled! Finish "[TASK]" right now! ✨',
      'One task standing between you and guilt-free leisure: "[TASK]"! Crush it!'
    ]
  }
};
