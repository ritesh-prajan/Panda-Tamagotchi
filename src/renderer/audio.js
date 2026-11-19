// src/renderer/audio.js
// Synthesizes cute sound effects with zero external audio assets using Web Audio API.
// Features complete per-style sound parameter profiles (Soft ASCII, Cute Anime, Chunky Robot).

(() => {
let audioCtx = null;
let isMuted = false;
let currentStyle = 'soft-ascii';

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function setMuted(muted) {
  isMuted = Boolean(muted);
}

function getMuted() {
  return isMuted;
}

function setStyle(style) {
  if (style) {
    currentStyle = style;
  }
}

function getStyle() {
  return currentStyle;
}

// ---------------- Chew / Feed Sound ----------------
function playChew() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  if (currentStyle === 'cute-anime') {
    // Soft cute bubble-pop munch sounds (bright sine/triangle chirps)
    [
      { freq: 880, endFreq: 1100, time: 0, dur: 0.07, type: 'sine', gain: 0.14 },
      { freq: 1046, endFreq: 1318, time: 0.08, dur: 0.08, type: 'triangle', gain: 0.16 },
      { freq: 1318, endFreq: 987, time: 0.18, dur: 0.09, type: 'sine', gain: 0.12 }
    ].forEach(({ freq, endFreq, time, dur, type, gain }) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now + time);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + time + dur);
      g.gain.setValueAtTime(gain, now + time);
      g.gain.exponentialRampToValueAtTime(0.001, now + time + dur);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now + time);
      osc.stop(now + time + dur);
    });
  } else if (currentStyle === 'chunky-robot') {
    // Digital power rod insertion / servo click chirp
    [
      { freq: 220, endFreq: 440, time: 0, dur: 0.06, type: 'square', gain: 0.1 },
      { freq: 587, endFreq: 880, time: 0.07, dur: 0.08, type: 'sawtooth', gain: 0.12 }
    ].forEach(({ freq, endFreq, time, dur, type, gain }) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now + time);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + time + dur);
      g.gain.setValueAtTime(gain, now + time);
      g.gain.exponentialRampToValueAtTime(0.001, now + time + dur);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now + time);
      osc.stop(now + time + dur);
    });
  } else {
    // Soft ASCII: crunchy double blips
    [
      { freq: 280, time: 0, dur: 0.08, type: 'triangle' },
      { freq: 210, time: 0.1, dur: 0.09, type: 'triangle' }
    ].forEach(({ freq, time, dur, type }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now + time);
      osc.frequency.exponentialRampToValueAtTime(140, now + time + dur);
      gain.gain.setValueAtTime(0.18, now + time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + time);
      osc.stop(now + time + dur);
    });
  }
}

// ---------------- Pet Sound ----------------
function playPet() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  if (currentStyle === 'cute-anime') {
    // Magical twinkling fairy chime (sparkling high pentatonic notes)
    const notes = [1046.50, 1318.51, 1567.98, 2093.00]; // C6, E6, G6, C7
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      gain.gain.setValueAtTime(0.12, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.22);
    });
  } else if (currentStyle === 'chunky-robot') {
    // 8-bit positive retro arpeggio / robot blip-blop
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + idx * 0.045);
      gain.gain.setValueAtTime(0.08, now + idx * 0.045);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.045 + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.045);
      osc.stop(now + idx * 0.045 + 0.14);
    });
  } else {
    // Soft ASCII: warm rising chime (C5 -> E5 -> G5)
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      gain.gain.setValueAtTime(0.12, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.15);
    });
  }
}

// ---------------- Happy Sound ----------------
function playHappy() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  if (currentStyle === 'cute-anime') {
    // Bright sparkling magical girl fan-fare
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      gain.gain.setValueAtTime(0.11, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.28);
    });
  } else if (currentStyle === 'chunky-robot') {
    // 8-bit gameboy victory blip
    const notes = [587.33, 739.99, 880, 1174.66];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      gain.gain.setValueAtTime(0.08, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.18);
    });
  } else {
    // Soft ASCII: gentle rising arpeggio
    const notes = [392.00, 523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.12, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.2);
    });
  }
}

// ---------------- Grumble / Angry Sound ----------------
function playGrumble() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  if (currentStyle === 'cute-anime') {
    // Cute pout squeak ("mweeh")
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.linearRampToValueAtTime(260, now + 0.18);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  } else if (currentStyle === 'chunky-robot') {
    // Low 8-bit error buzz
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(95, now);
    osc.frequency.linearRampToValueAtTime(65, now + 0.25);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  } else {
    // Soft ASCII: raspy growl
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(115, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.22);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }
}

// ---------------- Sleep Sound ----------------
function playSleep() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  if (currentStyle === 'cute-anime') {
    // Music-box lullaby bell tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(659.25, now);
    osc.frequency.exponentialRampToValueAtTime(587.33, now + 0.5);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  } else if (currentStyle === 'chunky-robot') {
    // Power down descending servo whine
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.45);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.45);
  } else {
    // Soft ASCII: breathing hum
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.4);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }
}

// ---------------- Refuse Sound ----------------
function playRefuse() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  if (currentStyle === 'chunky-robot') {
    // Double 8-bit reject buzzer
    [
      { freq: 140, time: 0, dur: 0.08 },
      { freq: 110, time: 0.1, dur: 0.12 }
    ].forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + time);
      gain.gain.setValueAtTime(0.1, now + time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + time);
      osc.stop(now + time + dur);
    });
  } else {
    // Cute downward double buzz
    [
      { freq: 300, time: 0, dur: 0.1 },
      { freq: 230, time: 0.12, dur: 0.15 }
    ].forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = currentStyle === 'cute-anime' ? 'triangle' : 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + time);
      osc.frequency.linearRampToValueAtTime(freq - 60, now + time + dur);
      gain.gain.setValueAtTime(0.12, now + time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + time);
      osc.stop(now + time + dur);
    });
  }
}

// ---------------- Task Done Sound ----------------
function playTaskDone() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  if (currentStyle === 'cute-anime') {
    // Sparkling anime level-up fanfare (D5 -> A5 -> D6)
    [
      { freq: 587.33, time: 0, dur: 0.1 },
      { freq: 880.00, time: 0.09, dur: 0.12 },
      { freq: 1174.66, time: 0.2, dur: 0.35 }
    ].forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);
      gain.gain.setValueAtTime(0.15, now + time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + time);
      osc.stop(now + time + dur);
    });
  } else if (currentStyle === 'chunky-robot') {
    // Digital confirmation sync chime (two clean 8-bit blips)
    [
      { freq: 880.00, time: 0, dur: 0.08 },
      { freq: 1760.00, time: 0.09, dur: 0.22 }
    ].forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + time);
      gain.gain.setValueAtTime(0.1, now + time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + time);
      osc.stop(now + time + dur);
    });
  } else {
    // Soft ASCII: cheerful D5 -> A5 chime
    [
      { freq: 587.33, time: 0, dur: 0.12 },
      { freq: 880.00, time: 0.12, dur: 0.28 }
    ].forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + time);
      gain.gain.setValueAtTime(0.14, now + time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + time);
      osc.stop(now + time + dur);
    });
  }
}

// ---------------- Break Reminder Sound ----------------
function playBreakReminder() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  if (currentStyle === 'cute-anime') {
    // Soothing gentle dream-pop harp chime
    [
      { freq: 523.25, time: 0, dur: 0.25 },
      { freq: 659.25, time: 0.2, dur: 0.3 },
      { freq: 783.99, time: 0.42, dur: 0.35 },
      { freq: 1046.50, time: 0.65, dur: 0.6 }
    ].forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);
      gain.gain.setValueAtTime(0.13, now + time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + time);
      osc.stop(now + time + dur);
    });
  } else if (currentStyle === 'chunky-robot') {
    // Friendly two-tone station intercom alert (600Hz -> 900Hz)
    [
      { freq: 587.33, time: 0, dur: 0.2 },
      { freq: 880.00, time: 0.22, dur: 0.45 }
    ].forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + time);
      gain.gain.setValueAtTime(0.12, now + time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + time);
      osc.stop(now + time + dur);
    });
  } else {
    // Soft ASCII: 3-bell chime
    [
      { freq: 523.25, time: 0, dur: 0.18 },
      { freq: 659.25, time: 0.16, dur: 0.22 },
      { freq: 783.99, time: 0.34, dur: 0.45 }
    ].forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);
      gain.gain.setValueAtTime(0.12, now + time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + time);
      osc.stop(now + time + dur);
    });
  }
}

window.pandaAudio = {
  setMuted,
  getMuted,
  setStyle,
  getStyle,
  playChew,
  playPet,
  playHappy,
  playGrumble,
  playSleep,
  playRefuse,
  playTaskDone,
  playBreakReminder
};
})();
