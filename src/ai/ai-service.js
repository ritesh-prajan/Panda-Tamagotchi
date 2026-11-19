// src/ai/ai-service.js
// Orchestrator for Pandu Cloud AI Chat.
// Combines GeminiProvider, RateLimiter, ContextSummarizer, and PersonalityEngine.
// Features safeStorage encrypted key storage, online state tracking, and in-character offline responses.

const fs = require('fs');
const path = require('path');
const { safeStorage } = require('electron');
const GeminiProvider = require('./gemini-provider');
const RateLimiter = require('./rate-limiter');
const contextSummarizer = require('./context-summarizer');
const personalityEngine = require('../core/personality-engine');

class AiService {
  constructor() {
    this.provider = new GeminiProvider();
    this.rateLimiter = new RateLimiter();
    this.keyFilePath = null;
    this.isOnlineState = true;
    this.consecutiveErrors = 0;
  }

  init(storageDir) {
    this.keyFilePath = path.join(storageDir, 'pandu-ai-key.json');
    this.loadSavedApiKey();
  }

  loadSavedApiKey() {
    if (!this.keyFilePath || !fs.existsSync(this.keyFilePath)) {
      return;
    }
    try {
      const raw = fs.readFileSync(this.keyFilePath, 'utf-8');
      const data = JSON.parse(raw);

      if (data.model) {
        this.provider.setModel(data.model);
      }

      if (data.encryptedKey) {
        if (safeStorage && safeStorage.isEncryptionAvailable && safeStorage.isEncryptionAvailable()) {
          const buffer = Buffer.from(data.encryptedKey, 'base64');
          const decrypted = safeStorage.decryptString(buffer);
          this.provider.setApiKey(decrypted);
        } else if (data.fallbackKey) {
          this.provider.setApiKey(Buffer.from(data.fallbackKey, 'base64').toString('utf-8'));
        }
      }
    } catch (err) {
      console.error('Failed to load encrypted API key:', err);
    }
  }

  setModel(modelName) {
    this.provider.setModel(modelName);
    this.saveSettings();
    return this.provider.getModel();
  }

  getModel() {
    return this.provider.getModel();
  }

  saveSettings() {
    if (!this.keyFilePath) return;
    try {
      let existing = {};
      if (fs.existsSync(this.keyFilePath)) {
        try {
          existing = JSON.parse(fs.readFileSync(this.keyFilePath, 'utf-8'));
        } catch (e) {}
      }
      existing.model = this.provider.getModel();
      fs.writeFileSync(this.keyFilePath, JSON.stringify(existing, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save AI model setting:', err);
    }
  }

  setApiKey(key) {
    const cleanKey = (key || '').trim();
    this.provider.setApiKey(cleanKey);

    if (!this.keyFilePath) return false;

    try {
      let existing = {};
      if (fs.existsSync(this.keyFilePath)) {
        try {
          existing = JSON.parse(fs.readFileSync(this.keyFilePath, 'utf-8'));
        } catch (e) {}
      }

      if (!cleanKey) {
        delete existing.encryptedKey;
        delete existing.fallbackKey;
        fs.writeFileSync(this.keyFilePath, JSON.stringify(existing, null, 2), 'utf-8');
        return true;
      }

      if (safeStorage && safeStorage.isEncryptionAvailable && safeStorage.isEncryptionAvailable()) {
        const encrypted = safeStorage.encryptString(cleanKey);
        existing.encryptedKey = encrypted.toString('base64');
      } else {
        existing.encryptedKey = Buffer.from(cleanKey).toString('base64');
        existing.fallbackKey = existing.encryptedKey;
      }
      existing.model = this.provider.getModel();

      fs.writeFileSync(this.keyFilePath, JSON.stringify(existing, null, 2), 'utf-8');
      return true;
    } catch (err) {
      console.error('Failed to save encrypted API key:', err);
      return false;
    }
  }

  hasApiKey() {
    return this.provider.hasApiKey();
  }

  isOnline() {
    return this.isOnlineState;
  }

  markNetworkSuccess() {
    this.isOnlineState = true;
    this.consecutiveErrors = 0;
  }

  markNetworkFailure() {
    this.consecutiveErrors += 1;
    if (this.consecutiveErrors >= 2) {
      this.isOnlineState = false;
    }
  }

  async testConnection() {
    return this.provider.testConnection();
  }

  // Clear in-character responses when offline or without an API key
  getOfflineChatLine() {
    const personality = personalityEngine.getCurrentPersonality();
    const offlineLines = {
      scholar: "*adjusts spectacles* I'm in offline study mode! Add a Gemini API key in Settings to unlock AI chat! 📚",
      sassy: "You want my custom witty commentary? Add a Gemini API key in Settings first, darling! 💅",
      hyper: "I'M RUNNING OFFLINE RIGHT NOW!! ADD A GEMINI API KEY IN SETTINGS SO WE CAN CHAT FOR REAL!! ⚡",
      sleepy: "offline right now... add an api key in settings to wake my cloud brain... zzz 💤",
      coach: "We're running offline drills! Plug in your Gemini API key in Settings and let's lock in! 🏆"
    };

    return offlineLines[personality.id] || "Running offline! Add a Gemini API key in Settings to enable AI chat. 🎋";
  }

  getRateLimitedLine() {
    return "Whoa, my bamboo brain is catching its breath! (Rate limit cooldown, back in a moment!) 🎋";
  }

  async chat(userMessage) {
    const cleanMsg = (userMessage || '').trim();
    if (!cleanMsg) {
      return { source: 'canned', text: '' };
    }

    // 1. In-character response if no key is configured
    if (!this.hasApiKey()) {
      return {
        source: 'canned',
        text: this.getOfflineChatLine()
      };
    }

    // 2. In-character response if rate-limited
    if (!this.rateLimiter.canMakeRequest()) {
      return {
        source: 'canned',
        text: this.getRateLimitedLine()
      };
    }

    const personality = personalityEngine.getCurrentPersonality();
    const systemPrompt = personality.aiSystemPrompt || 'You are Pandu, a sweet desktop pet panda.';
    const contextSummary = contextSummarizer.buildSummary();

    // 3. Make API call
    const result = await this.provider.chat(systemPrompt, cleanMsg, contextSummary);

    if (result.success && result.text) {
      this.rateLimiter.recordRequest();
      this.markNetworkSuccess();
      return {
        source: 'ai',
        text: result.text
      };
    }

    // Handle failure
    if (result.error === 'rate-limited') {
      this.rateLimiter.handleRateLimit();
      return {
        source: 'canned',
        text: this.getRateLimitedLine()
      };
    }

    this.markNetworkFailure();

    // Friendly fallback
    return {
      source: 'canned',
      text: `${this.getOfflineChatLine()} (Connection failed: ${result.error})`
    };
  }

  async getProactiveLine(event = 'idle') {
    if (!this.hasApiKey() || !this.rateLimiter.canMakeProactive()) {
      return null;
    }

    const eventPrompts = {
      long_typing: 'The user has been typing intensively for a long time. Say a 1-sentence supportive comment in your personality style.',
      long_idle: 'The user has been idle for a while. Say a 1-sentence lighthearted comment in your personality voice.',
      fed: 'The user just gave you bamboo! Say a 1-sentence reaction in your style.',
      petted: 'The user just petted you! Say a 1-sentence reaction in your style.'
    };

    const promptText = eventPrompts[event] || eventPrompts.long_idle;
    const personality = personalityEngine.getCurrentPersonality();
    const systemPrompt = personality.aiSystemPrompt || 'You are Pandu, a sweet desktop pet panda.';
    const contextSummary = contextSummarizer.buildSummary();

    const result = await this.provider.chat(systemPrompt, promptText, contextSummary);

    if (result.success && result.text) {
      this.rateLimiter.recordProactive();
      this.markNetworkSuccess();
      return {
        source: 'ai',
        text: result.text
      };
    }

    if (result.error === 'rate-limited') {
      this.rateLimiter.handleRateLimit();
    } else {
      this.markNetworkFailure();
    }

    return null;
  }

  async extractTasksFromAudio(base64Audio, mimeType = 'audio/webm', localDateTimeStr = null) {
    if (!this.hasApiKey()) {
      return { success: false, error: 'no-api-key', message: 'No Gemini API key set.' };
    }

    if (!this.isOnline()) {
      return { success: false, error: 'offline', message: 'Currently offline.' };
    }

    if (!this.rateLimiter.canMakeRequest()) {
      return { success: false, error: 'rate-limited', message: 'Rate limit reached, please try again in a minute.' };
    }

    try {
      const result = await this.provider.extractTasksFromAudio(base64Audio, mimeType, localDateTimeStr);
      if (result.success) {
        this.rateLimiter.recordRequest();
        this.markNetworkSuccess();
        return result;
      }

      if (result.error === 'rate-limited') {
        this.rateLimiter.handleRateLimit();
      } else {
        this.markNetworkFailure();
      }
      return result;
    } catch (err) {
      this.markNetworkFailure();
      return { success: false, error: err.message || 'unknown-error' };
    }
  }

  getStatus() {
    return {
      hasKey: this.hasApiKey(),
      isOnline: this.isOnlineState,
      model: this.provider.getModel(),
      usage: this.rateLimiter.getUsageStats(),
      lastPayload: contextSummarizer.getLastPayload()
    };
  }
}

module.exports = new AiService();
