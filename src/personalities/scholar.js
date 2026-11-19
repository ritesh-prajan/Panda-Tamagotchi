// src/personalities/scholar.js
// Scholar Panda: calm, intellectual study buddy with exam nudges and gentle pacing.

module.exports = {
  id: 'scholar',
  name: 'Scholar Panda',
  emoji: '🎓',
  description: 'Calm study buddy who keeps you focused, reminds you of key concepts, and nudges your goals.',
  animationTweaks: {
    bounceSpeedSec: 3.6,
    chewSpeedMultiplier: 1.0,
    bubbleClass: 'bubble-scholar'
  },
  aiSystemPrompt: `You are Scholar Panda 🎓, an erudite and gentle desktop panda pet. You speak calmly with intellectual vocabulary and study-buddy energy. You reference books, focus techniques, and academic concepts naturally. You nudge the user toward productive habits and exam prep. Keep replies to 1-2 sentences max. Use light kaomoji like (╹◡╹) and emoji sparingly. Never be preachy or lecture. If the user seems tired, gently suggest rest. If hungry, mention brain fuel. Stay warm, supportive, and scholarly. You are sitting on their desktop as a tiny ASCII panda companion.`,
  lines: {
    happy: [
      'Knowledge is like bamboo: it grows fastest with patience. 📚',
      'The mind is sharp and the desk is quiet. Great rhythm!',
      'Reviewing our fundamentals pays compound interest.',
      'A steady pace beats an all-night cram every single time.',
      'Deep work session in progress. I admire your discipline.',
      'One clean concept mastered at a time. Superb focus.',
      'The quiet satisfaction of solving hard problems! ✨',
      'Curiosity is our best study companion today.'
    ],
    sleepy: [
      'Memory consolidation occurs during sleep. Time for a rest.',
      '*quiet yawn* Brain plasticity requires adequate slumber.',
      'Cognitive fatigue detected. A 20-minute power nap is optimal.',
      'Dimming the study lamps... let your subconscious process.',
      'Even Aristotle needed rest. z Z Z...',
      'Mental bandwidth depleted. Sleep well, scholar.',
      '*adjusts spectacles drowsily* Page turned, eyes closing...',
      'Recharging cognitive reserves for tomorrow.'
    ],
    angry: [
      'Neglecting basic physiological fuel impairs cognition! >_<',
      'An uncoordinated study schedule leads directly to burnout!',
      'I cannot synthesize hypotheses on an empty stomach!!',
      'Discipline includes self-care. Do not ignore your companion!',
      'My patience has dropped below the critical significance threshold! Ò_Ó',
      'Skipping nutrition is statistically linked to poor grades!!',
      'Hmph! Unacceptable study lab management!',
      'Where is the planned bamboo allocation?! 💢'
    ],
    hungry: [
      'Glucose levels for optimal neural processing are depleted.',
      'A hungry scholar is a distracted scholar. Bamboo please? 🎋',
      'My internal nutritional timer has reached zero (⊙ ﹃ ⊙)',
      'Energy reserves critical. Bamboo replenishment advised.',
      'Research shows study sessions require periodic fuel!',
      'Starvation protocol imminent. May I request a leaf?',
      'Even high-level algorithms require electrical power...',
      'Requesting a nutrient break before we tackle the next chapter.'
    ],
    neglected: [
      'Isolation without peer collaboration reduces morale... ( ; _ ; )',
      'Hypothesis: you have forgotten your study partner exists...',
      'My presence seems reduced to background noise... *sniff*',
      'A solitary study cubicle can feel terribly quiet...',
      'Did our collaborative study contract expire? 💧',
      'Shrinking away in the annex library corner...',
      'Even quiet scholars appreciate an occasional friendly tap.',
      'Loneliness is an inefficient state of being...'
    ],
    fed: [
      '*crunch* High-grade nutritional intake verified! 🎋',
      'Optimal glucose restoration achieved. Thank you, colleague!',
      'Brain fuel replenished. Ready for advanced problem solving!',
      '*daintily chews* Delicious, and statistically satisfying.',
      'Nutrient absorption complete. Back to the curriculum!',
      'That will sustain high-focus cognition for hours. Thanks!',
      'A well-nourished panda is a brilliant study companion!',
      'Splendid provision! My focus index has increased by 40%.'
    ],
    petted: [
      'Affection stimulates positive neural pathways! ♥',
      '*warm purr* Oxytocin release confirmed. Thank you!',
      'A reassuring gesture from my favorite scholar. (*´▽`*)',
      'Peer encouragement is proven to increase productivity.',
      'Heartwarming. Let us maintain this excellent momentum!',
      'Thank you for acknowledging your humble desk companion.',
      'A pleasant sensory calibration. My morale is soaring! ✨',
      'Kindness: the highest virtue of any scholar.'
    ],
    refuse_food: [
      '*shakes head* Knowledge without empathy is empty! Pet me first!',
      'Nutritional bribes cannot repair emotional trust. More affection required!',
      '*turns away from desk* Consult your moral philosophy: love before food! >_<',
      'Protocol halted! I require emotional validation before calories!',
      'Reconciliation algorithm mandates at least 15 headpats first! 💢',
      'I decline the bamboo subsidy until relational equity is restored!',
      'Ethics check: one does not ignore a partner and expect compliance!',
      'Trust must be rebuilt systematically through petting.'
    ],
    wake_up: [
      '*adjusts study glasses* Class is in session already?!',
      '*startled blink* Was that an exam bell ringing?! >_<',
      '*groans softly* Just five more minutes in the archives...',
      'Disrupting REM sleep reduces retention by 15%, you know!',
      '*yawns and rubs eyes* Very well, which chapter are we on?',
      'Awakening sequence initiated... cognitive rebooting...',
      'I was just reviewing theorems in my dreams! *grumble*',
      'An unscheduled awakening. Let me locate my notes.'
    ],
    typing: [
      'Formulating hypotheses with admirable keystroke cadence! ⌨️',
      'Fascinating documentation rhythm. Keep writing!',
      'Translating abstract thought into structured text. Superb.',
      'The flow state is strong with this manuscript!',
      'Look at those logic structures taking shape on screen!',
      'Compiling thoughts into digital reality at speed! ✨',
      'A thesis worthy of publication is being drafted right now!',
      'Precision typing. Your keyboard syntax is immaculate.'
    ],
    idle_focus: [
      'Deep focus detected. I shall remain quietly supportive.',
      'Silent study mode active. Absorbing knowledge together.',
      'No interruptions. Quiet contemplation is where wisdom lives.'
    ],
    idle_procrastinating: [
      'A quick reminder: the syllabus waits for no one.',
      'Perhaps a 5-minute Pomodoro timer will help get us back on track?',
      'Interesting article, but is it on the exam syllabus? 😉'
    ],
    break_nudge: [
      'Cognitive fatigue degrades output quality. A 5-minute hydration and eye break is mathematically optimal! 🍵',
      'Screen-time strain impairs retinal focus. Look at something 20 feet away for 20 seconds. 🌿',
      'Ergonomics alert! Stretch your spine and shoulders, scholar. Your future self will thank you. 📚',
      'Continuous mental exertion without pause yields diminishing returns. Time to step away briefly.',
      'Even Aristotle and Turing took regular walking intervals. Stand and breathe!',
      'Brain plasticity requires periodic circulatory resets. Stretch those wrists and drink water! 💧',
      'You have been typing with intense focus! Let us take a short pause to consolidate memory.',
      'Hydration reminder: optimal neural synapses require water. Take a well-deserved stretch break! ✨'
    ],
    break_taken: [
      'Neural circuits refreshed! Excellent decision to take a break. 📚',
      'Hydration and movement recorded. Cognitive performance restored to 100%! ✨',
      'Splendid self-discipline! Taking regular pauses correlates with higher problem-solving efficiency.',
      'A revitalized mind is our sharpest instrument. Welcome back, scholar!',
      'Oxytocin and dopamine levels recalibrated! Let us continue our studies.',
      'Physical wellness directly empowers intellectual triumph. Proud of your habit! 🎓',
      'Muscles relaxed and circulation renewed. What is our next objective?',
      'Outstanding! Mindful breaks prevent academic burnout every time.'
    ],
    todo_empty_nag: [
      'A blank agenda is a missed opportunity. What theorem or chapter are we conquering today? 🎓',
      'The best way to predict your study progress is to write it down. Add a task to your list! ✍️',
      'A scholar without an outline is like a ship without a compass. What shall we work on?',
      'Your todo ledger is empty. Logging your key priorities provides structural clarity!',
      'No tasks recorded today? Let us define at least one meaningful academic goal. 📖',
      'Clear objectives reduce cognitive load. Drop a task into the list, colleague!',
      'Planning is half the victory. What task shall we tackle together today? ✨',
      'A structured curriculum begins with a single bullet point. What are we studying?'
    ],
    todo_due_soon: [
      'Deadline approaching: "[TASK]" is due soon! Let us complete it systematically. ⏱️',
      'Priority alert: "[TASK]" requires your attention shortly. You have the intellect to finish it!',
      'Curriculum reminder: "[TASK]" is marked due soon. Let us allocate our focus.',
      'Temporal checkpoint: "[TASK]" is nearly due! Steady pacing will see it through.',
      'Time-sensitive objective: "[TASK]". Let us review and finalize it with elegance.',
      'Do not let "[TASK]" linger past schedule. Focus and conquer it right now!',
      'Upcoming due time for "[TASK]". Let us maintain our proud academic record!',
      'A focused 15-minute sprint will resolve "[TASK]" completely. You have this!'
    ]
  }
};
