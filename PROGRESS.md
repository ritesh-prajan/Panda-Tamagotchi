# Pandu - Progress & Sprint Log

## Project Overview
Pandu is an offline-first Windows desktop pet tamagotchi (cute ASCII panda floating above all apps) built with Electron and vanilla JavaScript.

---

## Sprint 1: The Panda Comes Alive (DONE)
- Transparent frameless window with `alwaysOnTop` (`screen-saver` level), `skipTaskbar`, bottom-right default positioning.
- Draggable with position persistence in `app.getPath('userData')/pandu-position.json`.
- Dynamic style system (`getLook`) with plug-and-play emotion modules.
- Soft-ASCII panda with 6 emotions (happy, sleepy, angry, hungry, neglected, blinking) + idle bounce.
- Debug keys `1`–`6`.
- Auto-generated 32x32 tray icon with toggle and clean quit.
- Central state module `/src/core/state.js`.

---

## Sprint 2: Overlay Behavior (DONE)
- Click-through window via `setIgnoreMouseEvents(true, { forward: true })`, capturing mouse only over Pandu or debug panel.
- Global typing detection using `uiohook-napi`: raw keystroke counts only, rolling KPM, session duration.
- Typing reaction look (`typing.js`) with accelerated chewing at higher KPM and 5s idle relaxation.
- Active window awareness (`active-win`) with dynamic ESM import (in-memory only).
- Diagnostics debug panel toggled by `D`.
- "Start with Windows" toggle via `app.setLoginItemSettings` in tray menu.
- Comprehensive privacy guarantees in `README.md`.

---

## Sprint 3: The Tamagotchi Engine (Offline) (DONE)
- Needs Engine (`/src/core/needs.js`): Hunger, energy, mood, affection (0–100) and an `ignoredSeconds` timer.
- Tunable constants in `/src/core/config.json` with periodic auto-save and on-quit saving.
- 8-hour capped offline decay with survival floors guaranteeing Pandu never dies.
- Pure emotion resolver (`/src/core/resolver.js`): `neglected > angry > hungry > sleepy > happy`.
- Interactions: Petting (click-hold >350ms, double-click, or `🐾 Pet` button) and feeding (crunch SFX, hunger gain).
- 4-stage neglect shrinkage; in Stage 4, Pandu refuses bamboo until ~15 pets restore trust.
- Sleep & anger mechanics: naps when tired or at night (11 PM - 7 AM); wakes grumpily on drag or pet.
- Pure Web Audio synthesis (zero audio files) with tray mute and cooldown-protected speech bubbles.

---

## Sprint 4: Control App + Personalities (Offline) (DONE)

### Scope Delivered:
1. **Control Center Window (`/src/control/`)**:
   - Normal desktop window (not always-on-top, framed, clean dark/mint cute styling).
   - **Tabs**:
     - **Home**: Live progress bars for Hunger, Energy, Mood, Affection; pet mood & emotion; quick Feed/Pet buttons; neglect status.
     - **Personality**: Interactive cards for all 5 personalities; "Why this personality?" explanation card; manual lock badge with remaining time; "Resume Auto" button.
     - **Style**: Visual themes preview (Soft ASCII active, Anime & Robot coming in Sprint 6).
     - **Settings**: Start with Windows, Mute sounds, Focus Mode (Go Quiet), Fast Time (x60).
   - Closing the window hides it safely to the tray; left-clicking the tray icon reopens it.
2. **Complete System Tray Menu**:
   - Show/Hide Panda Overlay toggle.
   - Feed Bamboo 🎋 and Pet Panda 🐾 quick actions.
   - **Switch Personality** submenu: Auto-switch toggle + individual selection for all 5 personalities.
   - **Switch Style** submenu: Soft ASCII (active), Cute Anime (Sprint 6), Chunky Robot (Sprint 6).
   - Mute Sounds checkbox.
   - Focus Mode (Go Quiet) checkbox (silences speech bubbles and keeps Pandu quiet).
   - Open Control Window shortcut.
   - Start with Windows checkbox.
   - Clean Quit Pandu.
3. **5 Personalities as DATA Files (`/src/personalities/`)**:
   - **🎓 Scholar Panda**: Calm, intellectual study buddy with exam nudges.
   - **💅 Sassy Pandi**: Playful roaster who teases you when you procrastinate.
   - **⚡ Hyper Mochi**: ALL CAPS, ultra-bouncy, enthusiastic cheerleader!
   - **💤 Sleepy Bao**: Slow, lowercase, comfy naps, and warm cozy vibes.
   - **🏆 Coach Bamboo**: Motivating athletic trainer energy helping you lock in.
   - Each personality has ≥ 8 distinct, cute, never-mean canned lines per category/event, customized bounce speeds, chewing multipliers, and speech bubble CSS styles.
   - Includes system prompt placeholder for cloud AI chat in Sprint 5/7.
4. **Manual Switching & 2-Hour Lock**:
   - Selecting a personality manually from the tray or control window locks it for 2 hours before auto-switch resumes.
   - Control window displays remaining lock time in minutes with an instant "Resume Auto" option.
5. **Auto-Switch Heuristics v1 (`/src/core/personality-engine.js`)**:
   - **Late Night (11 PM - 6 AM)**: Switches to *Sleepy Bao*.
   - **High Sustained Typing (>70 KPM or >15m session)**: Switches to *Coach Bamboo*.
   - **Long Idle / Procrastination (>10m idle)**: Switches to *Sassy Pandi*.
   - **Ultra-Fast Typing Burst (>120 KPM)**: Switches to *Hyper Mochi*.
   - **Morning Study (7 AM - 11 AM)**: Switches to *Scholar Panda*.
   - **Anti-Flicker Protection**: Minimum 15-minute stay before auto-switching again.
   - Displays real-time "Why this personality?" explanation line in the control window.
6. **Settings Persistence**:
   - Settings, active personality, manual lock timers, and reasons saved to `pandu-settings.json` in `userData`.

---

## Sprint 5: Cloud AI Chat (Online) (DONE)

### Scope Delivered:
1. **AI Service Module (`/src/ai/`)**:
   - `gemini-provider.js`: Free-tier Gemini 2.0 Flash integration (`gemini-2.0-flash:generateContent`) with 8-second timeout, strict output limits (max 100 tokens), and native `https` client.
   - `rate-limiter.js`: Token-bucket limiter (10 requests/min, 100 daily limit, 5-minute proactive line cooldown, and 60-second backoff on HTTP 429).
   - `context-summarizer.js`: Strict privacy boundary mapping local app names into coarse categories (`coding`, `browsing`, `writing`, `media`, `communication`). Never touches raw titles, paths, or keys.
   - `ai-service.js`: Orchestrator managing secure API key storage, online/offline tracking, proactive commentary, and seamless silent fallback to canned lines.
2. **Encrypted Key Storage (`safeStorage`)**:
   - User API keys encrypted at rest using Windows DPAPI via Electron's `safeStorage`. Stored in `pandu-ai-key.json` in `userData`. Never logged or committed.
3. **Chat Overlay Interface**:
   - Open via `💬 Chat` button on overlay or hotkey `C`.
   - Sleek inline chat input box with auto-focus, click-through management, `Enter` to send, `Escape` to close.
   - Replies appear in speech bubble in the active personality's voice with matching bubble styling.
4. **5 Unique Personality System Prompts**:
   - Distinct multi-line instructions for Scholar, Sassy, Hyper, Sleepy, and Coach.
   - Strict prompt rules: 1–2 sentences max, kaomoji/emoji where fitting, never preachy, adapts to real-time tamagotchi state (hunger, fatigue, affection).
5. **Control Center AI & Privacy Tools**:
   - **Settings Tab**: Password-masked API key input with Save/Clear actions.
   - **Live Online / Offline Badge**: Dynamically tracks network status and API reachability (`AI: Online (Active)`, `AI: Offline (No Key)`, `AI: Disconnected`).
   - **Rate Limit Usage Tracker**: Live requests today, requests this minute, and proactive cooldown timer.
   - **"What the AI Sees" Inspector**: Real-time formatted JSON preview of the exact summary payload sent to Google Gemini, guaranteeing zero privacy leakage.
6. **Silent Fallback & Error Resilience**:
   - Zero error alerts or crashes if Wi-Fi is disconnected, key is invalid, or rate limits are reached; Pandu smoothly falls back to canned lines in character.
7. **Chat & Chatter Calibration Fixes**:
   - Idle speech cooldown increased to 90s–150s with random jitter; stopped the 20-second chatterbox spam.
   - Button `pointerdown` capture decoupled from window drag; clicks on `💬 Chat` now register cleanly.
   - Any chat message or user interaction now delays idle lines by at least 90s so random lines never overwrite chat responses.
   - Added a "Test" button in Settings to instantly verify Gemini connection.
   - Added default support for **Gemini 3.1 Flash-Lite** (`gemini-3.1-flash-lite`), with automatic multi-model fallback and custom model selector in Control Center Settings.

---

## Sprint 6: Smart Positioning (DONE)

### Scope Delivered:
1. **Window Geometry Tracking (`/src/main/window-monitor.js`)**:
   - Polling active window geometry every 400ms using `active-win` in main process (in-memory only, zero logs).
   - Accurate detection of maximized windows, minimized windows (bounds at `x=-32000`), fullscreen state, and monitor display ID.
   - Filters out Pandu's own Electron windows to prevent self-dodges.
   - >6px bounds change threshold to ignore minor render noise.
2. **Four Positioning Modes (`/src/core/position-engine.js`)**:
   - **🌟 Smart Mode**: Evaluates free space, dodging to available corners when windows overlap, and peeking when windows dominate the screen.
   - **🏃 Dodge Mode**: Smoothly slides with cubic ease-out (`slideWindowTo()`) to the nearest free screen corner (Bottom-Right, Top-Right, Bottom-Left, Top-Left) that doesn't intersect the active window; returns home when overlap clears.
   - **👀 Peek Mode**: Tucks Pandu to the right screen edge showing only a tiny head (`tiny` size); smoothly pops out to `medium` size when the cursor hovers near it.
   - **📌 Off**: Disables automated movement; Pandu remains strictly where manually positioned.
   - Selectable via System Tray ("Smart Positioning" submenu) and Control Center Settings tab.
3. **Anti-Jitter & Manual Drag Priority**:
   - **30-Second Manual Grace Period**: Whenever the user drags Pandu, manual placement takes absolute priority for 30 seconds; auto-dodging is paused.
   - **1200ms Minimum Interval**: Prevents rapid back-and-forth ping-ponging when windows are resizing or switching.
   - **16px Hysteresis Margins**: Generous collision padding prevents edge oscillation.
4. **Per-App Safe Zones**:
   - User can click "📍 Remember Spot" (via Tray or Control Center) while an app is active.
   - Coordinates stored per process name in `pandu-settings.json` in `userData`.
   - Automatically loads and positions Pandu whenever that application gains focus.
   - Manageable from Control Center Settings with individual "Forget" buttons.
5. **Auto-Resize & 3-Variant Soft ASCII Art (`/src/styles/soft-ascii/`)**:
   - Hand-crafted `medium` and `tiny` ASCII frames created for all 7 emotions (`happy`, `sleepy`, `angry`, `hungry`, `neglected`, `blinking`, `typing`).
   - Sizing profiles:
     - **Large (330×340px)**: Default desktop experience with interactive badges and chat box.
     - **Medium (260×260px)**: Compact footprint when docked or near busy window edges.
     - **Tiny (180×160px)**: Minimalist peek head tucked against the display bezel.
   - CSS sizing classes (`.size-large`, `.size-medium`, `.size-tiny`) with smooth font-size transitions.
6. **Multi-Monitor Awareness**:
   - Detects display geometries via Electron `screen` API.
   - "Follow Active Monitor" setting automatically teleports/slides Pandu to whichever monitor has the focused window.
7. **Fullscreen Application Handling**:
   - "Hide when Fullscreen" setting automatically hides Pandu's overlay when an active window enters exclusive/borderless fullscreen, restoring visibility when exited.
8. **Visual Geometry HUD (`G` Key)**:
   - Press `G` (or click `Geom (G)` in the debug panel) to toggle the on-screen Smart Positioning HUD.
   - Real-time diagnostics display: Active App, Window Bounds, Engine State (Normal/Dodging/Peeking), Computed Free Zones, and Manual Grace countdown.
   - Non-interactive (`pointer-events: none`) so clicks pass straight through to background applications.

---

## Sprint 7: Productivity Buddy (DONE)

### Scope Delivered:
1. **Local Todo Manager (`/src/core/todo-manager.js`)**:
   - Full CRUD operations: `addTodo`, `updateTodo`, `toggleTodo`, `deleteTodo`, `getTodos(filter)`.
   - Filters: `all`, `today`, `upcoming`, `done` — with priority sorting (high → medium → low).
   - `getTasksDueSoon(minutes)` and `hasUntouchedTasks(hours)` for the nag engine.
   - JSON persistence to `pandu-todos.json` in `userData`; `notifiedSoon` flag per task prevents nag spam.
2. **Productivity Engine (`/src/core/productivity-engine.js`)**:
   - Continuous typing session tracking with a 3-minute idle gap to reset.
   - `break-prompt` / `break-resolved` EventEmitter events wired to the renderer break banner.
   - Default break threshold: **50 minutes**. Debug `shortenTimers` mode: **1.5 minutes** threshold, **30s** snooze.
   - Snooze (5 minutes) and "I took a break" resolution. No breaks during Focus Mode.
   - `evaluateReminders()` runs every 30s: due-soon task nags (25min cooldown) and empty-list nags.
   - All timers survive restarts by computing elapsed time from stored timestamps.
3. **5 New Personality Line Categories**:
   - `break_nudge`, `break_taken`, `todo_empty_nag`, `todo_due_soon` — 8 unique lines each.
   - Added to all 5 personality files: Scholar, Sassy, Hyper, Sleepy, Coach.
   - `todo_due_soon` lines contain `[TASK]` placeholder replaced at runtime.
4. **Voice-to-Task via Gemini Audio (`/src/ai/gemini-provider.js`)**:
   - `extractTasksFromAudio(base64, mimeType, localDateTimeStr)` sends `audio/webm` inline data to Gemini.
   - JSON extraction prompt; response parsed with ` ``` ` stripping.
   - Local date/time anchors relative expressions like "tomorrow evening".
   - 12-second timeout with graceful failure.
5. **Break Banner & Voice UI (renderer overlay)**:
   - `#break-banner`: shows personality-voiced nudge with **"I took a break!"** and **"Snooze 5m"** buttons.
   - `#voice-modal`: pulsing mic animation with 15-second auto-stop timer and Done button.
   - `#task-draft-card`: confirm card (title / due / priority) — **nothing is saved until the user clicks "Add Task"**.
   - `#quick-todo-modal`: typed quick-add fallback for offline voice.
   - `V` hotkey and `🎤 Voice` / `📋 Todo` overlay buttons trigger flows.
6. **📋 Tasks Tab in Control Center**:
   - Filter pills: All / Today / Upcoming / Completed.
   - Dynamic task list with priority pills, due-date color coding (overdue/today/upcoming), checkbox, edit, delete.
   - Add/Edit modal with title, due date, priority dropdown.
   - Voice recording banner in-window with draft confirm card.
   - Break reminder threshold dropdown (20/30/45/50/60/90 min).
   - "Shorten Timers (Debug)" toggle for rapid testing.
7. **Tray Menu Additions**:
   - "Todo & Tasks 📋" submenu: **Quick Add Task…**, **Voice Task 🎤**, **View Todo List 📋**.
   - Quick Add opens the typed-add quick modal; Voice Task triggers microphone recording.
8. **Microphone Permissions (Electron)**:
   - `session.defaultSession.setPermissionRequestHandler` grants `media` permission — no OS permission dialog pop-up.
9. **Tab Navigation from Tray**:
   - `main.js` sends `tab:navigate` IPC with 100ms load delay; `control.js` calls `switchTab()` on receipt.
   - `preload.js` exposes `onTabNavigate` callback and `openControlWindow(tab)` with optional tab param.

---

## Roadmap

- [x] **Sprint 1: The Panda Comes Alive** (Window, Drag, Tray, ASCII looks, State)
- [x] **Sprint 2: Overlay Behavior** (Click-through, uiohook typing, active-win, auto-launch)
- [x] **Sprint 3: The Tamagotchi Engine** (Needs, decay, resolver, pet/feed, neglect shrink & refusal, audio, speech bubbles)
- [x] **Sprint 4: Control App + Personalities** (Control window with 4 tabs, 5 personalities, auto-switch & 2h lock, complete tray menu)
- [x] **Sprint 5: Cloud AI Chat (Online)** (Gemini 2.0 Flash / 3.1 Flash-Lite, safeStorage, chat bubble, privacy summarizer, silent fallback)
- [x] **Sprint 6: Smart Positioning** (Geometry tracking, Dodge/Peek/Smart modes, per-app spots, 3-size variants, multi-monitor, fullscreen hide, Geom HUD)
- [x] **Sprint 7: Productivity Buddy** (Todo list, break reminders, voice-to-task, in-character nags, offline fallback, debug shorten-timers)
- [x] **Sprint 8: Visual Themes** (Cute anime, chunky robot styles; Style tab preview in Control Center, runtime switching, per-style audio)

---

## Sprint 8: Anime + Robot Visual Styles (DONE)

### Scope Delivered:
1. **Official Hand-Drawn Sticker Visual Style (`official-sticker`)**:
   - Integrated all 8 official model sheets from `D:\Downloads\Pandu images` (46 total frames across 8 animation sets):
     - `Idle` (4 frames: bamboo chew, head tilt, happy eyes, ear wiggles)
     - `Listening` (4 frames: microphone in paws with pulsing sound waves)
     - `Tea Break` (6 frames: coffee cup, stretch yawn, sipping, steam puff, heart bliss)
     - `Checklist` (6 frames: notepad & pencil, winking, focused writing, checklist checkoff)
     - `Tantrum` (6 frames: pout, shivering tremble, stomping jump, ear steam, huffy arms crossed, stubborn look-away)
     - `Celebration` (8 frames: cushion clap, confetti jump, 360° spin with tail, landing squash)
     - `Sleepy` (6 frames: big yawn, droopy eyes, belly slump, inflating & deflating sleep bubble with Z's)
     - `Petting` (6 frames: blissful closed eyes, paw wiggle, sparkle eyes, floating hearts; human hand cleanly removed from all frames)
   - Extracted transparent PNGs into `src/assets/official-chibi/`.
   - Built parametric SVG frame loader in `src/styles/official-sticker/rig.js` with responsive viewBoxes and multi-size support (`large`, `medium`, `tiny`).
   - Mapped all 9 emotions plus listening into full animation sets.
2. **Parametric SVG Rig Architecture**:
   - **`Cute Anime` Rig (`src/styles/cute-anime/rig.js`)**: Parametric vector rig rendering a soft pastel chibi panda with sparkly anime pupils, soft cheek blush, green bamboo snack, crying tear droplets, steam anger puffs, floating sleep Z's, and typing keyboard.
   - **`Chunky Robot` Rig (`src/styles/chunky-robot/rig.js`)**: Parametric vector rig rendering a cyber boxy panda-bot with glowing multi-color LED visor expressions (smile, flat line, red angry pulse, battery empty blink, low power dim), rotating/spinning antenna, glowing neon fuel rod cell, mechanical claws, and holographic laser typing keys.
   - **Complete 9-Emotion Presets**: All 9 emotions (`happy`, `sleepy`, `angry`, `hungry`, `neglected`, `blinking`, `typing`, `eating`, `petted`) implemented across all 3 sizes (`large`, `medium`, `tiny`) with smooth multi-frame animation cycles.
   - Completed `eating.js` and `petted.js` in `soft-ascii` style so all 3 styles have the exact same 9-emotion matrix.
2. **Unified `getLook(style, emotion, size)` Interface**:
   - Drop-in style engine: `src/styles/index.js` dynamically resolves looks with zero logic changes to pet core systems.
   - Auto-discovers styles and emotions via `getAvailableStyles()` and `getAvailableEmotions(style)`.
   - SVG frames automatically detected and rendered with full CSS scaling and responsive bounding boxes.
3. **Mid-Animation Runtime Style Switching**:
   - Switch styles at any time from the System Tray or Control Center Style tab without restarting the app or interrupting ongoing behaviors.
   - `onStateChange` in `renderer.js` detects style updates, updates CSS theme classes (`style-{name}` on container, `bubble-style-{name}` on speech bubble), updates Web Audio synthesizer profiles, and immediately restarts frame animation.
   - Style selection is saved and persisted across app restarts via `pandu-settings.json`.
4. **Per-Style Web Audio Parameter Profiles (`src/renderer/audio.js`)**:
   - **Soft ASCII**: Retro crunchy chews, mellow chimes, warm purrs, and soft downward blips.
   - **Cute Anime**: Sparkly twinkle chimes, magical high-bell fanfares, fairy dust petting sounds, bubble-pop chewing, and high cute squeaks.
   - **Chunky Robot**: 8-bit square-wave bleeps, servo motor frequency sweeps, electronic confirm chirps, power-down glides, and digital alarm buzzes.
5. **Control Center Style Tab & Live Emotion Preview Grid**:
   - Dynamic style selector cards displaying name, description, visual badges, and "Apply" / "Preview Emotions" buttons.
   - Real-time **Emotion Preview Grid** showing all 9 emotions rendered in the inspected style.
   - **Size Selector Pills** (Large / Medium / Tiny) allowing instant inspection of all size scaling variants and peek/dodge adaptations.
6. **Zero Logic File Changes**:
   - `state.js`, `needs.js`, `resolver.js`, `personality-engine.js`, `position-engine.js`, `productivity-engine.js`, `todo-manager.js`, and `lines-manager.js` were completely preserved without modification.
   - Neglect-shrink, dodge, peek, and typing reactions work flawlessly across all three visual styles.

---

---

## Fix Pass A: Needs Engine Bugs + Tuning (DONE)

### Scope Delivered:
1. **Bug 1: Energy / Sleep Flicker Elimination via Hysteresis**:
   - Added persistent `isSleeping` state flag to `needsEngine.needs`.
   - **Hysteresis Thresholds in `config.json`**:
     - `sleepStartThreshold`: 20 (Pandu falls asleep when energy drops below 20).
     - `wakeThreshold`: 70 (Pandu continues sleeping and recovering at +3.0/min until energy reaches 70).
     - Completely eliminated oscillation around the old 25 threshold.
   - Updated pure emotion resolver (`src/core/resolver.js`): `isSleeping` check relies strictly on the persistent `needs.isSleeping` flag, eliminating duplicate energy threshold rules.
   - Preserved 20s temporary grumpy wake on user interaction (pet or window drag).
2. **Bug 2: Neglect Shrink & Food Refusal Desync Resolution**:
   - Documented explicit state machine at the top of `src/core/needs.js`.
   - Prevented `tick()` and `updateShrinkAndAnger()` from resetting `shrinkStage` to 0 while `isRefusingFood` remains true.
   - **Step-Down Visual Feedback**: Intermediate pets while refusing food now visibly decrease `shrinkStage` every ~4 pets (`4 -> 3 -> 2 -> 1`).
   - `isRefusingFood` and `shrinkStage` reset to 0 simultaneously and cleanly once `petsTowardsRecovery` reaches `petsToRecoverFromRefusal` (15 pets).
   - In normal non-refusal mode, feeding and petting continue to immediately reset `ignoredSeconds` and `shrinkStage` as expected.
3. **Unit Tests Suite (`tests/needs.test.js`)**:
   - Built standalone Node.js test suite with zero external dependencies covering:
     - (a) Energy hysteresis & 24h sleep cycle oscillation prevention (asserts at most 1 enter/exit transition per sleep cycle).
     - (b) Refusal recovery state machine, intermediate visual step-downs, and threshold recovery.
     - (c) 8-hour offline decay capping and survival floor maintenance (Pandu never dies).
   - Verified 100% test passage.
4. **Productivity Break Fix**:
   - Updated `productivityEngine.takeBreak(needsEngine)` to mutate `needsEngine.needs` directly rather than the shallow copy returned by `getNeeds()`.

---

## Fix Pass B: Sprite Pipeline & Emotion Mapping (Completed)

### Scope Delivered:
1. **Sprite Optimization Script (`scripts/optimize-sprites.js`)**:
   - Resized all 46 raw chibi PNGs from `src/assets/official-chibi/` to a standardized maximum 384px dimension, written to `src/assets/official-chibi-opt/`.
   - Originals kept 100% untouched; full alpha transparency preserved.
   - Reduced asset footprint by 77.9% (8.89 MB down to 1.97 MB).
2. **Descriptor-Based Frame Architecture (`src/styles/official-sticker/rig.js` & `src/styles/index.js`)**:
   - Replaced massive base64 SVG data URIs with lightweight frame descriptors: `{ type: 'image', src, w, h, scale, offsetX, offsetY, cssClass }`.
   - Preserved `getLook(style, emotion, size)` signature, keeping soft-ASCII and SVG anime/robot styles functioning identically.
3. **Flicker-Free Persistent DOM Image Swapping (`src/renderer/renderer.js` & `src/control/control.js`)**:
   - `renderer.js` maintains a single persistent `<img>` element inside `#panda-art`, swapping `.src` and applying CSS transforms without ever calling `innerHTML`.
   - Implemented `Image` object preloading cache (`imagePreloadCache`) for instant frame swaps.
   - Implemented idle background preloader (`scheduleIdlePreload` via `requestIdleCallback`) to lazily preload all remaining emotions.
   - Control window preview grid updated to render descriptors via `<img>` tags with normalization transforms.
   - Renderer sprite memory kept well under 15MB with zero frame flicker.
4. **Manifest-Driven Emotion Mapping & Baseline Normalization (`src/styles/official-sticker/manifest.json`)**:
   - Created central manifest mapping all 13 emotions, frame sequences, per-frame delays, loop points, and status tags (`"final"` or `"placeholder"`).
   - All 13 emotion modules in `src/styles/official-sticker/` simplified to clean one-liners calling `getEmotionModule()`.
   - Solved the idle framing jump (idle sprites at 543×724 vs standard 384×384) with per-profile scale (`1.33`) and baseline vertical offset (`offsetY: 8px`), anchoring all sprites to a consistent bottom-center cushion baseline.
5. **Emotion Wiring & Placeholder Art Handling**:
   - **`happy`**: Clean single 5-frame loop (`idle_0,1,2,3,1`).
   - **`blinking`**: 4 frames (`idle_0,1,2,1`).
   - **`typing`**: Upgraded from placeholder to **final official 4-panel animation** (`typing_0..3`) sliced from *"Pandu's Four-Panel Typing Celebration"*, with active typing paw movement and brisk 180ms cadence. Auto-restores to base emotion when typing stops.
   - **`eating`**: Fast chew delay loop.
   - **`angry`**: Full tantrum sequence (`tantrum_0..5`).
   - **`hungry`**: Droopy sleepy frames (`sleepy_1`, `sleepy_0` only; no angry frames).
   - **`neglected`**: Sleepy frames styled with soft desaturation, dimming, and slow sway (`panda-neglected-sadness`; no angry frames).
   - **`petted`**: Petting animation automatically skips washed-out frame 2 (`skipFrames: [2]`).
   - **`celebration`**: Triggered after full recovery from food refusal and when completing a todo task (`onTodoCompleted`).
   - **`listening`**: Triggered whenever the voice recording modal is open.
   - **`checklist`**: Triggered when the quick-add or task draft modal is open, or when speech nag mentions todos/tasks.
   - **`tea`**: Triggered during break reminders and after clicking "I took a break".
6. **Documentation & Tests**:
   - Generated `docs/ART_TODO.md` with complete frame requirements and Midjourney/Flux prompts for all 5 placeholder emotions (`happy`, `typing`, `eating`, `hungry`, `neglected`).
   - Created `tests/styles.test.js` validating all 120 style/emotion/size combinations and disk presence of every sprite.

7. **Animation Rework & Interaction Polish**:
   - **Unattended Auto-Sleep (25s)**: Transition to `sleepy` occurs after 25s of inactivity. Any click, drag, or typing activity wakes Pandu immediately and restores `happy`.
   - **Flicker-Free Sleep Loop**: When Pandu is asleep, he never restarts from the initial standing/nodding frame 0; he continuously and smoothly cycles between the sleeping `z`, `zz`, and `zzz` frames (frames 3, 4, 5).
   - **Cushion Sleep Immobility**: Added `.emotion-sleepy` rule to halt `.idle-bounce` during sleep so Pandu rests quietly on his cushion.
   - **Eating Pacing (5s)**: Eating plays alternating closed/open mouth chew frames (`idle_0, 3, 1, 3, 0, 3`) for a full 5-second sequence before restoring canonical state emotion.
   - **Petting Pacing (5s)**: Petting plays 5 full frames (omitting the washed-out frame 2 artifact) for 5 seconds with hearts and soft bubble.
   - **Typing Isolation**: Moved CSS keyframe bob (`panda-typing-bob`) to `#panda-art` container so it does not overwrite the inline transform/scale normalization matrix of the sprite `<img>`.
   - **Mood Glow Palette**: Expanded ambient underglow to cover all 12 emotions, including checklist (cyan) and tea (mint green).
   - **Test Suite (`tests/animations.test.js`)**: Validated animation loops, `loopFromFrame` progression, petted frame omission, and eating chew cadence.

---

## Current Known Issues / Notes
- **Web Audio Context on Startup**: Browser autoplay policies require a user interaction (clicking or dragging Pandu) before audio sounds play.
- **DirectX Exclusive Fullscreen**: Certain legacy games with exclusive hardware display control bypass desktop window managers; borderless fullscreen allows Pandu to remain floating on top.
- **Multi-Monitor Coordinate Scaling**: Displays with differing DPI scaling factors (e.g. 100% and 150%) rely on Windows Virtual Screen coordinates provided by Electron `screen.getDisplayNearestPoint()`.
- **Gemini Free-Tier Limits**: Internal token bucket defaults to 10 RPM / 100 RPD to guarantee zero quota surprises. Gemini 3.1 Flash-Lite is set as recommended default.
- **Voice Recording (MediaRecorder)**: Outputs `audio/webm;codecs=opus`. If Gemini changes its audio inlineData MIME handling, update `mimeType` in `gemini-provider.js → extractTasksFromAudio`.
- **Break Reminder Timing**: Typing activity from `uiohook-napi` global hook wires into `productivityEngine.onTypingActivity()`. If uiohook fails to start (permissions/antivirus), break reminders won't fire.
