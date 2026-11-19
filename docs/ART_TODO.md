# Pandu - Art & Sprite Asset Roadmap (`docs/ART_TODO.md`)

This document catalogs every placeholder emotion sprite in the **Official Sticker (Chibi)** style, the exact frames required to replace the temporary mappings, and copy-paste prompts formatted for Midjourney / Flux / Stable Diffusion to generate consistent final art.

---

## 🎨 Global Art Style Guidelines
To maintain seamless visual coherence with existing final sprites (`angry`/tantrum, `tea`, `petting`, `checklist`, `celebration`):
- **Character**: Cute kawaii chibi giant panda, chunky round proportions, dark charcoal-black ears, eye patches, and paws, creamy white head and tummy, soft blush on cheeks.
- **Render Style**: 2D vector-chibi sticker aesthetic, bold smooth outlines (clean charcoal stroke), soft cell shading with subtle warm ambient occlusion, vibrant accent colors.
- **Canvas / Export**:
  - Transparent PNG background (`.png`).
  - Square canvas 512×512 or 384×384 (run `node scripts/optimize-sprites.js` after adding new sprites to auto-generate the 384px web assets).
  - Subject anchored to **bottom-center baseline** with 12–15px padding from the bottom edge so height normalizes across animation cycles.

---

## 📋 Emotion Status Summary

| Emotion | Current Status | Current Temp Mapping | Target Frames Needed |
| :--- | :--- | :--- | :--- |
| **happy** | ⚠️ Placeholder | `idle_0,1,2,3,1` | 4 frames (joyful bounce / waving paws) |
| **typing** | ✅ Final | `typing_0..3` | Complete (Four-panel typing celebration) |
| **eating** | ⚠️ Placeholder | `idle_*` (fast chew) | 6 frames (crunching fresh bamboo stalk) |
| **hungry** | ⚠️ Placeholder | `sleepy_1,0` (droopy) | 4 frames (tummy rumbles, empty bowl) |
| **neglected** | ⚠️ Placeholder | `sleepy_*` + CSS sadness filter | 4 frames (curled up, weeping/drooping ears) |
| **blinking** | ✅ Final | `idle_0,1,2,1` | Complete |
| **angry** | ✅ Final | `tantrum_0..5` | Complete |
| **petted** | ✅ Final | `petting_0,1,3,4,5` (skips washed-out f2) | Complete |
| **sleepy** | ✅ Final | `sleepy_0..4` (cycle z, zz, zzz) | Complete |
| **celebration**| ✅ Final | `celebration_0..5` | Complete |
| **listening** | ✅ Final | `listening_0..3` | Complete |
| **checklist** | ✅ Final | `checklist_0..3` | Complete |
| **tea** | ✅ Final | `tea_0..3` | Complete |

---

## 🖼️ Placeholder Breakdown & Image Generation Prompts

### 1. `happy` (Joyful Bounce & Wave)
- **Goal**: Distinct, expressive joyful stance with sparkly happy eyes, open smiling mouth, and cheerful waving paws.
- **Frames Needed**: 4 frames
  - Frame 0: Standing happy, paws together at chest, slight smile.
  - Frame 1: Little upward hop, arms spreading outward with joy, closed happy curve eyes (`^ ^`).
  - Frame 2: Peak bounce, paws raised in cheer, happy open mouth with pink tongue.
  - Frame 3: Landing back softly, warm smile.
- **Prompt**:
  > `kawaii chibi giant panda character sticker, joyful and energetic happy expression, eyes curved closed in happiness, tiny paws up in excitement, pink blush cheeks, clean bold sticker outline, simple cell shading, bright vibrant lighting, transparent background, isolated, vector illustration style, character sheet frame, game asset --no background, complex gradients, photorealistic`

---

### 2. `typing` (Working on Tiny Laptop / Keyboard)
- **Goal**: Replaces idle bobbing with dedicated focus work art showing Pandu typing on a small keyboard or cute miniature laptop.
- **Frames Needed**: 4 frames
  - Frame 0: Seated facing forward-right, left paw pressing a key on tiny green pastel laptop.
  - Frame 1: Right paw pressing down, focused determined little eyes.
  - Frame 2: Both paws tapping rapidly, small sweat drop or focus sparkle.
  - Frame 3: Alternate paw tap, rhythmic typing loop.
- **Prompt**:
  > `kawaii chibi giant panda character sticker, sitting and typing vigorously on a cute miniature mint-green laptop, focused studious expression, tiny paws tapping keys, pink blush cheeks, clean bold sticker outline, crisp cell shading, transparent background, isolated, vector game asset style --no background, realism, blur`

---

### 3. `eating` (Munching Bamboo Stalk)
- **Goal**: Replaces reused idle chewing with full bamboo-munching sequence.
- **Frames Needed**: 6 frames
  - Frame 0: Holding a vibrant green bamboo stalk with two paws, mouth open ready for a bite.
  - Frame 1: Taking a big bite from the bamboo, happy closed eyes.
  - Frame 2: Munching with cheeks puffed, bamboo leaf sticking out.
  - Frame 3: Chewing happily, crumbs / tiny green leaf bits floating.
  - Frame 4: Swallowing with content smile, bamboo stalk shorter.
  - Frame 5: Licking lips, ready for another bite.
- **Prompt**:
  > `kawaii chibi giant panda character sticker, holding and enthusiastically munching on a green bamboo stalk, puffed cheeks chewing food, closed happy eyes, crumbs and tiny leaf floating, clean bold sticker outline, soft cell shading, transparent background, isolated, cute game asset --no realism, human elements`

---

### 4. `hungry` (Rumbling Tummy & Pout)
- **Goal**: Replaces sleepy droop with distinct hungry pout.
- **Frames Needed**: 4 frames
  - Frame 0: Standing pouting, one paw rubbing tummy, looking down wistfully.
  - Frame 1: Tummy rumbling line / empty thought bubble, droopy sad eyes.
  - Frame 2: Holding a tiny empty wooden bamboo bowl upside down with a pleading look.
  - Frame 3: Big watery pleading puppy eyes looking up at user.
- **Prompt**:
  > `kawaii chibi giant panda character sticker, hungry and sad expression, clutching tummy with paws, big watery pleading eyes, cute pouting mouth, empty wooden bamboo bowl beside it, clean bold sticker outline, flat cell shading, transparent background, isolated game asset --no background, anger`

---

### 5. `neglected` (Lonely & Withdrawn)
- **Goal**: Replaces CSS filter hack with genuine sad/lonely art without confusing it with angry or sleepy.
- **Frames Needed**: 4 frames
  - Frame 0: Slumped sitting position, head tilted down, drooping ears, small tear welling in eye.
  - Frame 1: Slow sad sway to left, paws hugging knees, lonely expression.
  - Frame 2: Curling into a soft round ball, looking back over shoulder with wistful eyes.
  - Frame 3: Slow sad sway to right, sighing tiny breath bubble.
- **Prompt**:
  > `kawaii chibi giant panda character sticker, lonely and neglected expression, curled up slightly, drooping ears, teary sad eyes looking for a friend, hugging knees with tiny paws, muted gentle palette, clean bold sticker outline, soft cell shading, transparent background, isolated game asset --no aggressive lines, background scenery`

---

## 🛠️ How to Drop In New Frames
1. Save the exported PNGs into `src/assets/official-chibi/` with matching names:
   - `happy_0.png`, `happy_1.png`, etc.
   - `typing_0.png` ...
   - `eating_0.png` ...
   - `hungry_0.png` ...
   - `neglected_0.png` ...
2. Run sprite optimizer:
   ```bash
   node scripts/optimize-sprites.js
   ```
3. Update `src/styles/official-sticker/manifest.json`:
   - Point the emotion's `frames` array to the new filenames.
   - Change `"status": "placeholder"` to `"status": "final"`.
   - Remove temporary CSS filters (`cssClass`) if no longer needed.
4. Run style test to verify all frames load:
   ```bash
   node tests/styles.test.js
   ```
