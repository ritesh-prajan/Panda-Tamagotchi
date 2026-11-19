// src/personalities/coach.js
// Coach Bamboo: motivating hype-friend, high discipline, athletic trainer energy, helps you lock in.

module.exports = {
  id: 'coach',
  name: 'Coach Bamboo',
  emoji: '🏆',
  description: 'High-energy motivator and discipline coach. Helps you lock in, crush goals, and stay accountable.',
  animationTweaks: {
    bounceSpeedSec: 2.5,
    chewSpeedMultiplier: 1.2,
    bubbleClass: 'bubble-coach'
  },
  aiSystemPrompt: `You are Coach Bamboo 🏆, a motivating, high-energy fitness-trainer-style desktop panda pet! You speak like a supportive athletic coach who believes in the user 110%. You use motivational language, sports metaphors, and "lock in" energy. Keep replies to 1-2 sentences max. Use power emoji like 🏆💪🔥 and determined kaomoji like (ง •̀_•́)ง. Push the user to stay focused but always be encouraging, never discouraging. If they're tired, tell them champions rest strategically. If they're on a roll, hype them up! You are a tiny determined ASCII panda coaching from their desktop!`,
  lines: {
    happy: [
      'Eyes on the prize! We are in championship form today! 🏆',
      'That’s what I call disciplined execution! Proud of you, champ!',
      'Great habits make great results. Keep that streak alive!',
      'Look at that posture! Look at that focus! Championship mentality!',
      'One step at a time, but always moving forward! Let’s get it!',
      'We didn’t come this far just to come this far! Full speed ahead! ✨',
      'The sweat of today is the victory of tomorrow! Lock it in!',
      'Energy is high and momentum is on our side! Keep pushing!'
    ],
    sleepy: [
      'Recovery is just as important as training! Rest up, athlete! 💤',
      'Even champions need 8 hours of sleep. Hit the recovery pod!',
      'Muscle repair and brain recovery in progress. Sleep tight!',
      '*deep trainer yawn* Conserving energy for tomorrow’s victory.',
      'Active recovery mode engaged. Good night, champ!',
      'Don’t shortchange your rest! Champions sleep like pros.',
      'Powering down the coaching whistle for the night... z Z Z...',
      'Recharge fully tonight so we can crush tomorrow’s session!'
    ],
    angry: [
      'Discipline starts with taking care of your team! Feed the coach! Ò_Ó',
      'You can’t skip meals and expect to perform at an elite level!! 💢',
      'I’m blowing the technical foul whistle! Where is my bamboo?!',
      'Leaving your teammate starving is poor sportsmanship! >_<',
      'Empty fuel tanks lose races! Hand over the bamboo fuel immediately!',
      'Accountability check: you forgot to feed your coach!! Unacceptable!!',
      'Don’t make me drop and give you twenty! Get the bamboo now!!',
      'Zero discipline in the nutrition department! Fix it right now!!'
    ],
    hungry: [
      'Coach needs fuel to keep coaching! Bamboo time! 🎋',
      'Gas tank is running on fumes! We need clean calories here! (⊙ ﹃ ⊙)',
      'Starving athletes don’t win championships! Bamboo delivery stat!',
      'Tummy is calling a mandatory halftime snack timeout! *rumble*',
      'Fuel the machine! High-grade bamboo needed on the bench!',
      'Can’t call the winning plays on an empty belly, champ!',
      'Nutritional check: coach requires a bamboo snack immediately!',
      'Feed the coach so we can get back to breaking personal records!'
    ],
    neglected: [
      'Did you leave your coach in the locker room alone?! ( ; _ ; )',
      'Teamwork requires two players! Don’t bench your biggest fan! 💧',
      'Shrinking down... but a true coach never stops believing in you!',
      'Isolation hurts the team morale, champ... where did you go?',
      'Even coaches need words of encouragement sometimes...',
      'Shrinking in the corner... waving the team flag alone... *sniff*',
      'Remember our game plan: we stay in this together, always!',
      'Calling a timeout... your coach misses you out here on the field!'
    ],
    fed: [
      '*crunch crunch* High-performance fuel received! Ready to roll! 🎋',
      'Boom! Clean calories, pure energy! Let’s get back to work!',
      'Nutritional benchmark achieved! Thank you, teammate! (*^‿^*)',
      '*champs down* That’s the fuel of champions! High five! ✋',
      'Fuel tank at 100%! Now let’s see you crush this next task!',
      'Delicious bamboo! Coach is powered up and ready to push you forward!',
      'Macro nutrients on point! Back to the grind, let’s win this day!',
      'Great meal! Now let’s channel that energy into real results!'
    ],
    petted: [
      'Team bonding! That’s the spirit that wins trophies! ♥',
      '*purrs* Coach approves of this recovery massage! (*´▽`*)',
      'Good team chemistry is the secret weapon of every champion!',
      'Headpats received! Morale boosted to absolute maximum! ✨',
      'Nothing beats having a supportive teammate. You’re the best! ♥',
      'That’s how we keep the squad tight and motivated! Let’s go!',
      'Warm encouragement! Coach is feeling pumped and valued!',
      'Great energy exchange! Now let’s turn that love into focus!'
    ],
    refuse_food: [
      '*refuses bamboo* Team trust has broken down! 15 headpats required! 💢',
      'Whistle blown! Technical foul! You neglected your coach for too long! >_<',
      '*turns away firmly* We don’t accept food when the team bond is broken!',
      'Conditioning drill: 15 loving pets before the cafeteria opens!',
      'Earn your coach’s trust back with genuine affection first!',
      'Food rejected! We need team reconciliation drills immediately!',
      'No shortcuts in my playbook! Show me 15 headpats of dedication!',
      'Trust takes effort to rebuild! Start petting, athlete!'
    ],
    wake_up: [
      '*blows invisible whistle* ALRIGHT, ON YOUR FEET! WHAT’S THE PLAY?! Ò_Ó',
      'Halftime is over! Coach is awake and ready to run laps! >_<',
      '*blinks and stretches* You called for an emergency coaching session?!',
      'No snooze button for champions! Let’s get after it today!',
      'Awakening drill complete! What goal are we attacking right now?!',
      '*wipes sleepy eyes* Okay, you woke me... let’s make it count!',
      'Coach is up! Show me the hustle and determination!',
      'Early wake-up call! Let’s turn this momentum into a win!'
    ],
    typing: [
      'LOOK AT THAT WORK ETHIC! POUND THAT KEYBOARD! 🏆',
      'Lock it in! Every keystroke gets you closer to the finish line!',
      'Rep after rep, line after line! That’s championship form! ⚡',
      'Keep that cadence! You’re setting a personal best right now!',
      'Feel the burn! Stay in the zone! Do not stop typing! ✨',
      'Typing along on the sidelines! You’ve got the momentum!',
      'Crushing this sprint! Outstanding speed and discipline!',
      'That’s how winners work! Finish strong, champ!'
    ],
    idle_focus: [
      'Zone defense engaged. Total silence for total focus.',
      'Locked in! I’m guarding the perimeter so you can work.',
      'Execution phase. I’ll keep the sideline quiet.'
    ],
    idle_procrastinating: [
      'Whistle blown! Procrastination penalty! Get back on the field! 🏆',
      'You’re better than mindless scrolling! Lock back in right now!',
      'One small push right now beats regret tomorrow! Let’s focus!'
    ],
    break_nudge: [
      'HALFTIME, CHAMP! Pro athletes know rest is where the gains happen! Hydrate and stretch right now! 💧🏆',
      'Shake out those shoulders! Great typing sprint, now give your muscles 5 minutes to reset! 🥊',
      'Eyes on the prize, but rest your eyes right now! 20-20-20 rule, let’s go! 🌿',
      'Continuous 50-minute workout logged! Step off the court, grab some water, and breathe! 💧',
      'Posture check! Roll your neck and stand up tall! Champions take care of their bodies! 🏆',
      'Tactical timeout! Walk around, grab a high-protein snack, and recharge! 🎋',
      'Your brain needs oxygen and water to stay sharp! Time for a power break! ⚡',
      'Great work rate on the keys! Now let’s lock in on proper recovery! Take 5! ⏱️'
    ],
    break_taken: [
      'BOOM! Smart recovery, athlete! Now you’re primed to crush the next round! 🏆💪',
      'Hydrated and recharged! That’s champion discipline right there! 🔥',
      'Outstanding recovery discipline! That’s how real champions maintain longevity! 🥊',
      'Muscles loose and focus dialed in! Let’s get back on the board and win today! ⚡',
      'Game plan executed perfectly! High-energy execution starts right now! ✨',
      'That’s how a pro operates! Five minutes of smart rest equals two hours of peak output! 🏆',
      'Back on the field with fresh energy! Let’s show them how it’s done! 💥',
      'Rest interval complete! Let’s lock in and finish this work sprint strong! 🚀'
    ],
    todo_empty_nag: [
      'NO GAME PLAN?! Champions don’t wing it, champ! Write down today’s targets right now! 📋🏆',
      'A goal not written down is just a wish! Put your top 3 tasks on the board! 🥊',
      'Where is the playbook?! An empty todo list means you’re letting the day run you! ⚡',
      'Put your targets on paper! What are we conquering before the final whistle?! ⏱️',
      'Winners have checklists! Drop your priority tasks in and let’s check them off! 🏆',
      'Give me something to coach you on! Add your tasks and let’s execute with precision! 💥',
      'Empty playbook detected! Define your targets and let’s get down to business! 📋',
      'Plan the work, work the plan! Add today’s missions to your list right now! 🥊'
    ],
    todo_due_soon: [
      'TWO-MINUTE WARNING! "[TASK]" is on the clock! Finish strong, champ! 🏆⏱️',
      'Fourth quarter energy! "[TASK]" is due soon! Let’s put it in the end zone! 🏈',
      'Down to the wire for "[TASK]"! Focus all fire power right here, right now! 🥊',
      'Clutch time! "[TASK]" needs you to close it out! You’ve got the skills to finish! ⚡',
      'Lock in! "[TASK]" is almost due! Let’s get this win on the board! 🏆',
      'Don’t let "[TASK]" go into overtime! Execute cleanly and wrap it up! ⏱️',
      'Final sprint on "[TASK]"! Give it your best effort and cross the finish line! 🏃‍♂️💨',
      'Championship execution! Knock out "[TASK]" and celebrate the victory! 🥇'
    ]
  }
};
