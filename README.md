# Pandu - Desktop Tamagotchi Pet for Windows

Pandu is an adorable, offline-first desktop panda pet that floats above all apps on Windows. Built with Electron and vanilla JavaScript (no TypeScript, no UI frameworks).

---

## 🔒 Privacy Guarantees (Locked Decision)

Pandu is built with privacy as a foundational constraint:

### 1. Keystroke Privacy
- **What is collected**: Raw keystroke **counts** and timestamps only.
- **What is NEVER collected**: Key codes, characters, letters, symbols, words, or passwords.
- **Zero Logging**: Pandu never logs, stores, or transmits what you type. The typing monitor strictly measures typing pace (Keys Per Minute / KPM) so Pandu can animate paws and chew bamboo along with your work rhythm.

### 2. Window Awareness Privacy
- **What is queried**: The currently focused application name (e.g. `Code.exe`, `chrome.exe`) and window title.
- **In-Memory Only**: Window info is held temporarily in volatile memory in the main process to determine pet context.
- **Zero Disk Storage**: Window titles are never saved to disk, never cached in JSON files, and never sent across the network.
- **Zero Raw Data Sent to AI**: The AI service maps process names to broad coarse categories (e.g. `coding`, `browsing`, `writing`, `media`). Window titles, document paths, and file names are **100% discarded** before building the AI payload. You can verify this anytime using the **What the AI Sees (Privacy Inspector)** in the Control Center Settings!

### 3. Cloud AI & Key Storage Privacy (Sprint 5)
- **Encrypted at Rest**: Your Gemini API key is encrypted using Windows DPAPI via Electron's `safeStorage`. It is never stored in plain text or committed to git.
- **Silent Fallback**: When offline or if rate limits are reached, Pandu quietly falls back to pre-written canned lines. No crash or error banner.
- **Rate-Limited**: Token-bucket limit (10 requests/minute, 100/day) prevents accidental quota drain.

### 4. Network & Device Privacy
- **No Analytics / Telemetry**: Pandu makes zero telemetry or analytics calls.
- **No Audio Files / Recording**: Audio is generated entirely on-the-fly via synthesized Web Audio blips. No microphone access.
- **Offline First**: All tamagotchi core behaviors work 100% offline.

---

## Features (Sprint 1 through Sprint 5)

### 🤖 Cloud AI Chat & Privacy Inspector (New in Sprint 5)
- **Real Conversations**: Press `C` or click `💬 Chat` on the overlay to open a chat bubble. Pandu responds in 1-2 sentences in the active personality's distinct voice!
- **Powered by Gemini 2.0 Flash**: Free-tier Google Gemini integration with strict 8-second timeout.
- **Offline & Silent Fallback**: If offline, Wi-Fi drops, no key is set, or rate limits are hit, Pandu seamlessly answers with canned lines without throwing errors.
- **Privacy Inspector**: Control Center Settings tab shows **"What the AI Sees"** in real time, proving that only coarse activities (`coding`, `browsing`), duration, and pet need levels are transmitted.
- **SafeStorage Key Security**: API keys are securely encrypted at rest using Windows DPAPI.

### 🎛️ Control Window (Sprint 4)
- Left-click the system tray icon to open the **Pet Control Center** (or choose "Open Control Window" in tray menu).
- Closing the window safely hides it to the tray without stopping Pandu.
- **Tabs**:
  1. **Home**: Live progress bars for Hunger, Energy, Mood, and Affection; current emotion & personality badge; quick Feed/Pet buttons; neglect stage status.
  2. **Personality**: Interactive cards for all 5 personalities; "Why this personality?" explanation line; manual 2-hour lock toggle; "Resume Auto" button.
  3. **Style**: Visual themes preview (Soft ASCII active, Anime & Robot coming in Sprint 6).
  4. **Settings**: Start with Windows toggle, Mute sounds toggle, Focus Mode (Go Quiet), Fast Time (x60).

### 🎭 5 Distinct Personalities (New in Sprint 4)
Every personality features unique dialogue tones, animation pacing (bounce speed & chewing rate), and speech bubble styles:
1. **🎓 Scholar Panda**: Calm, intellectual study buddy. Gives gentle exam nudges and encourages deep work.
2. **💅 Sassy Pandi**: Playful roaster who teases you when you procrastinate. Tough love with a witty flair.
3. **⚡ Hyper Mochi**: ALL CAPS, ultra-bouncy, enthusiastic cheerleader! Bounces fast and hypes you up to 1000%!
4. **💤 Sleepy Bao**: Slow, lowercase, gentle naps, and comfy vibes. Reminds you to take breaks and rest.
5. **🏆 Coach Bamboo**: Motivating athletic trainer energy! Pushes you to lock in, stay disciplined, and celebrate wins.

### 🔄 Smart Auto-Switching & Anti-Flicker
- Context-driven heuristics:
  - **Late Night (11 PM - 6 AM)**: Switches to *Sleepy Bao* for cozy winding-down.
  - **High Sustained Typing (>70 KPM / >15m)**: Switches to *Coach Bamboo* to lock in.
  - **Inactivity / Procrastination (>10m idle)**: Switches to *Sassy Pandi* for playful tough love.
  - **Ultra-Fast Typing Burst (>120 KPM)**: Switches to *Hyper Mochi* to match your speed.
  - **Morning Focus (7 AM - 11 AM)**: Switches to *Scholar Panda* for structured learning.
- **Anti-Flicker Protection**: Minimum 15-minute cooldown between auto-switches.
- **Manual Lock**: Selecting any personality manually locks it for 2 hours before auto-switching resumes.

### 🐾 Living Needs Engine & Neglect Mechanic
- **Core Needs (0–100)**: Hunger, Energy, Mood, Affection, and an Ignored timer.
- **Capped Offline Decay**: Time away capped at 8 hours with survival floors (Pandu **never dies**).
- **Emotion Priority**: `neglected > angry > hungry > sleepy > happy`.
- **4-Stage Neglect**: If ignored, Pandu shrinks across 4 visual stages (`scale: 1.0 -> 0.88 -> 0.76 -> 0.65 -> 0.55`).
- **Food Refusal**: In Stage 4, Pandu shakes its head and **refuses bamboo** until ~15 pets restore trust!

### 🎋 Feeding, Petting & Web Audio
- **Petting**: Click-hold (>350ms), double-click, or click `🐾 Pet` (emits floating hearts, plays chime, restores affection).
- **Feeding**: Click `🎋 Feed` or use tray menu (plays crunchy chew SFX, restores fullness).
- **Web Audio SFX**: Synthesized blips with mute control in tray and settings.

---

## Quick Start

```bash
# Install dependencies
npm install

# Start Pandu
npm start
```

### Controls & Shortcuts
| Action / Key | Function |
| --- | --- |
| **Tray Left-Click** | Open / Focus Pet Control Center |
| **Tray Right-Click** | Full context menu (Feed, Pet, Switch Personality, Switch Style, Mute, Focus, Control Window, Quit) |
| **Click-Hold / Dbl-Click** | Pet Pandu (shows hearts & raises affection) |
| `🎋 Feed` button | Feed bamboo to Pandu |
| `🐾 Pet` button | Pet Pandu |
| `💬 Chat` / `C` | Toggle chat box to talk with Pandu |
| `Enter` (in chat) | Send message to Pandu |
| `Esc` (in chat) | Close chat box |
| `D` | Toggle Real-time Tamagotchi Debug Panel on overlay |
| `T` | Toggle Fast Time (x60) for instant testing |
| `Shift + 1-6` | Debug emotion override (1=Happy, 2=Sleepy, 3=Angry, 4=Hungry, 5=Neglected, 6=Blinking) |
| `0` | Clear debug emotion override (returns to resolver) |
