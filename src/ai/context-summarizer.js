// src/ai/context-summarizer.js
// Privacy-first context summarizer for Pandu.
// PRIVACY GUARANTEE: Never transmits raw window titles, file names, or keystrokes.
// Only coarse categories, rounded typing metrics, and tamagotchi need states are summarized.

const APP_CATEGORIES = {
  // Coding / Development
  'code.exe': 'coding',
  'code - insiders.exe': 'coding',
  'devenv.exe': 'coding',
  'idea64.exe': 'coding',
  'pycharm64.exe': 'coding',
  'webstorm64.exe': 'coding',
  'sublime_text.exe': 'coding',
  'atom.exe': 'coding',
  'windowsterminal.exe': 'coding',
  'powershell.exe': 'coding',
  'cmd.exe': 'coding',
  'git-bash.exe': 'coding',

  // Browsing / Web
  'chrome.exe': 'browsing',
  'msedge.exe': 'browsing',
  'firefox.exe': 'browsing',
  'brave.exe': 'browsing',
  'opera.exe': 'browsing',
  'vivaldi.exe': 'browsing',

  // Writing / Notes
  'notepad.exe': 'writing',
  'notepad++.exe': 'writing',
  'winword.exe': 'writing',
  'obsidian.exe': 'writing',
  'notion.exe': 'writing',

  // Communication
  'discord.exe': 'communication',
  'slack.exe': 'communication',
  'teams.exe': 'communication',
  'telegram.exe': 'communication',
  'whatsapp.exe': 'communication',

  // Media & Entertainment
  'spotify.exe': 'media',
  'vlc.exe': 'media',
  'netflix.exe': 'media',

  // System & Files
  'explorer.exe': 'organizing files'
};

class ContextSummarizer {
  constructor() {
    this.currentCategory = 'general desktop';
    this.categoryStartTime = Date.now();
    this.typingKpm = 0;
    this.typingSessionMinutes = 0;
    this.emotion = 'happy';
    this.needsSnapshot = {
      hunger: 80,
      energy: 90,
      mood: 85,
      affection: 80
    };
    this.lastPayload = null;
  }

  // Update active app name and map strictly to a coarse category (discarding title)
  updateApp(appName) {
    if (!appName) return;
    const cleanName = String(appName).trim().toLowerCase();
    const mapped = APP_CATEGORIES[cleanName] || 'general desktop';

    if (mapped !== this.currentCategory) {
      this.currentCategory = mapped;
      this.categoryStartTime = Date.now();
    }
  }

  updateTyping(kpm, sessionMinutes) {
    this.typingKpm = Math.max(0, Math.round(kpm || 0));
    this.typingSessionMinutes = Math.max(0, Math.round(sessionMinutes || 0));
  }

  updateNeeds(needs) {
    if (!needs) return;
    this.needsSnapshot = {
      hunger: Math.round(needs.hunger ?? 80),
      energy: Math.round(needs.energy ?? 90),
      mood: Math.round(needs.mood ?? 85),
      affection: Math.round(needs.affection ?? 80)
    };
  }

  updateEmotion(emotion) {
    if (emotion) this.emotion = emotion;
  }

  getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour >= 23 || hour < 6) return 'late night';
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    return 'evening';
  }

  // Pure summary object. Safe to transmit.
  buildSummary() {
    const activeMins = Math.max(1, Math.round((Date.now() - this.categoryStartTime) / 60000));

    const payload = {
      activity: this.currentCategory,
      activityDurationMins: activeMins,
      typingSessionMins: this.typingSessionMinutes,
      typingPace: this.typingKpm > 80 ? 'fast' : (this.typingKpm > 20 ? 'moderate' : 'idle'),
      timeOfDay: this.getTimeOfDay(),
      petEmotion: this.emotion,
      needs: {
        hunger: this.needsSnapshot.hunger,
        energy: this.needsSnapshot.energy,
        mood: this.needsSnapshot.mood,
        affection: this.needsSnapshot.affection
      }
    };

    this.lastPayload = payload;
    return payload;
  }

  getLastPayload() {
    return this.lastPayload || this.buildSummary();
  }
}

module.exports = new ContextSummarizer();
