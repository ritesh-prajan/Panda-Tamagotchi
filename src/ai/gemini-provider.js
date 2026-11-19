// src/ai/gemini-provider.js
// Direct Gemini API client with support for Gemini 3.1 Lite, 2.0 Flash-Lite, and auto-fallbacks.
// Uses Node.js native https module to avoid external dependencies.

const https = require('https');

class GeminiProvider {
  constructor() {
    this.apiKey = null;
    // Default to Gemini 3.5 Flash-Lite (fast & stable)
    this.model = 'gemini-3.5-flash-lite';
    this.timeoutMs = 8000;
  }

  setApiKey(key) {
    this.apiKey = (key || '').trim();
  }

  hasApiKey() {
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }

  setModel(modelName) {
    if (!modelName) return;
    let clean = modelName.trim().toLowerCase().replace(/\s+/g, '-');
    if (clean === 'gemini-3.1-lite') clean = 'gemini-3.1-flash-lite';
    if (clean === 'gemini-2.0-lite') clean = 'gemini-2.0-flash-lite';
    this.model = clean;
  }

  getModel() {
    return this.model;
  }

  async testConnection() {
    if (!this.hasApiKey()) {
      return { success: false, message: 'No API key provided.' };
    }
    const result = await this.chat('You are a test ping bot.', 'Hello! Respond with: pong', {});
    if (result.success) {
      return { success: true, message: `Connected to Gemini! (${result.modelUsed || this.model})` };
    }
    return { success: false, message: `Connection failed: ${result.error || 'Network error'}` };
  }

  async _request(modelName, systemPrompt, userMessage, contextSummary) {
    const endpoint = `/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(this.apiKey)}`;

    const contextStr = JSON.stringify(contextSummary);
    const combinedSystemInstruction = `${systemPrompt}\n\nReal-time pet context:\n${contextStr}\n\nStrict Rule: Answer in 1-2 short sentences. Stay cute and in character. Never be preachy.`;

    const requestBody = JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: userMessage }]
        }
      ],
      systemInstruction: {
        parts: [{ text: combinedSystemInstruction }]
      },
      generationConfig: {
        maxOutputTokens: 100,
        temperature: 0.85
      }
    });

    return new Promise((resolve) => {
      let isSettled = false;

      const finish = (result) => {
        if (!isSettled) {
          isSettled = true;
          resolve(result);
        }
      };

      const req = https.request(
        {
          hostname: 'generativelanguage.googleapis.com',
          port: 443,
          path: endpoint,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(requestBody),
            'x-goog-api-key': this.apiKey
          },
          timeout: this.timeoutMs
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            if (res.statusCode === 429) {
              console.warn('[Gemini API] Rate limit reached (429)');
              return finish({ success: false, text: '', error: 'rate-limited', statusCode: 429 });
            }

            if (res.statusCode < 200 || res.statusCode >= 300) {
              let errorMsg = `http-${res.statusCode}`;
              try {
                const parsedErr = JSON.parse(data);
                if (parsedErr?.error?.message) {
                  errorMsg = parsedErr.error.message;
                }
              } catch (e) {}
              console.warn(`[Gemini API Error] HTTP ${res.statusCode} on model ${modelName}: ${errorMsg}`);
              return finish({ success: false, text: '', error: errorMsg, statusCode: res.statusCode });
            }

            try {
              const parsed = JSON.parse(data);
              const reply = parsed?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

              if (!reply) {
                return finish({ success: false, text: '', error: 'empty-response', statusCode: res.statusCode });
              }

              finish({ success: true, text: reply, error: null, modelUsed: modelName });
            } catch (err) {
              finish({ success: false, text: '', error: 'invalid-json' });
            }
          });
        }
      );

      req.on('timeout', () => {
        req.destroy();
        finish({ success: false, text: '', error: 'timeout' });
      });

      req.on('error', (err) => {
        console.warn('[Gemini API Network Error]:', err.code || err.message);
        finish({ success: false, text: '', error: err.code || 'network-error' });
      });

      req.write(requestBody);
      req.end();
    });
  }

  async chat(systemPrompt, userMessage, contextSummary = {}) {
    if (!this.hasApiKey()) {
      return { success: false, text: '', error: 'no-api-key' };
    }

    // Candidate models starting with active choice, then fallback variants
    const candidates = [
      this.model,
      'gemini-3.5-flash-lite',
      'gemini-3.8-flash',
      'gemini-2.5-flash',
      'gemini-3.1-flash-lite',
      'gemini-3.1-lite',
      'gemini-2.0-flash-lite',
      'gemini-2.0-flash',
      'gemini-1.5-flash'
    ];
    const uniqueCandidates = [...new Set(candidates)];

    let lastResult = null;
    for (const m of uniqueCandidates) {
      lastResult = await this._request(m, systemPrompt, userMessage, contextSummary);
      if (lastResult.success) {
        return lastResult;
      }
      // Fall back if model returned 404 (not found), 503 (high demand/overloaded), 500, or connection reset
      const isRetryableError = lastResult.statusCode === 404 ||
                               lastResult.statusCode === 503 ||
                               lastResult.statusCode === 500 ||
                               lastResult.error === 'ECONNRESET' ||
                               lastResult.error === 'ETIMEDOUT';
      if (!isRetryableError) {
        return lastResult;
      }
      console.log(`[Gemini API] Model ${m} returned ${lastResult.statusCode || lastResult.error}, falling back to next model...`);
    }

    return lastResult || { success: false, text: '', error: 'all-models-failed' };
  }

  async _requestAudio(modelName, base64Audio, mimeType, localDateTimeStr) {
    const endpoint = `/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(this.apiKey)}`;

    const promptText = `You are Pandu's task extraction assistant. Listen carefully to the user's spoken voice command.
Current local date and time: ${localDateTimeStr || new Date().toLocaleString()}

Your job is to extract any tasks or reminders mentioned into a valid JSON array of objects matching this exact schema:
[
  {
    "title": "Clear imperative action phrase (e.g. 'Finish DMGT notes')",
    "due": "ISO 8601 string (e.g. '2026-11-19T18:00:00') or null if no time specified",
    "priority": "low" | "medium" | "high"
  }
]

Rules:
1. If the user mentions words like "tomorrow", "tonight", "this evening", "in 2 hours", "next Monday", calculate the exact ISO timestamp relative to the provided current local date and time.
2. If priority is mentioned (e.g. "urgent", "important", "high priority", "low priority"), assign accordingly. Default is "medium".
3. Return ONLY a valid JSON array. Do not include markdown ticks, explanation, or conversational text.`;

    const requestBody = JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: mimeType || 'audio/webm',
                data: base64Audio
              }
            },
            {
              text: promptText
            }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: 400,
        temperature: 0.1
      }
    });

    return new Promise((resolve) => {
      let isSettled = false;

      const finish = (result) => {
        if (!isSettled) {
          isSettled = true;
          resolve(result);
        }
      };

      const req = https.request(
        {
          hostname: 'generativelanguage.googleapis.com',
          port: 443,
          path: endpoint,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(requestBody),
            'x-goog-api-key': this.apiKey
          },
          timeout: 12000
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            if (res.statusCode < 200 || res.statusCode >= 300) {
              let errorMsg = `http-${res.statusCode}`;
              try {
                const parsedErr = JSON.parse(data);
                if (parsedErr?.error?.message) {
                  errorMsg = parsedErr.error.message;
                }
              } catch (e) {}
              return finish({ success: false, error: errorMsg, statusCode: res.statusCode });
            }

            try {
              const parsed = JSON.parse(data);
              const reply = parsed?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
              if (!reply) {
                return finish({ success: false, error: 'empty-response', statusCode: res.statusCode });
              }

              const cleanJson = reply.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
              const tasks = JSON.parse(cleanJson);
              const taskArray = Array.isArray(tasks) ? tasks : [tasks];

              finish({
                success: true,
                tasks: taskArray,
                modelUsed: modelName
              });
            } catch (err) {
              console.warn('[Gemini Audio Parse Error]:', err.message);
              finish({ success: false, error: 'invalid-json-output' });
            }
          });
        }
      );

      req.on('timeout', () => {
        req.destroy();
        finish({ success: false, error: 'timeout' });
      });

      req.on('error', (err) => {
        finish({ success: false, error: err.code || 'network-error' });
      });

      req.write(requestBody);
      req.end();
    });
  }

  async extractTasksFromAudio(base64Audio, mimeType = 'audio/webm', localDateTimeStr) {
    if (!this.hasApiKey()) {
      return { success: false, error: 'no-api-key' };
    }

    const candidates = [
      this.model,
      'gemini-3.5-flash-lite',
      'gemini-3.8-flash',
      'gemini-2.5-flash',
      'gemini-3.1-flash-lite',
      'gemini-2.0-flash-lite',
      'gemini-2.0-flash',
      'gemini-1.5-flash'
    ];
    const uniqueCandidates = [...new Set(candidates)];

    let lastResult = null;
    for (const m of uniqueCandidates) {
      lastResult = await this._requestAudio(m, base64Audio, mimeType, localDateTimeStr);
      if (lastResult.success) {
        return lastResult;
      }
      const isRetryable = lastResult.statusCode === 404 ||
                          lastResult.statusCode === 503 ||
                          lastResult.statusCode === 500 ||
                          lastResult.error === 'ECONNRESET' ||
                          lastResult.error === 'ETIMEDOUT';
      if (!isRetryable) {
        return lastResult;
      }
      console.log(`[Gemini API] Audio extraction on ${m} returned ${lastResult.statusCode || lastResult.error}, falling back to next candidate...`);
    }
    return lastResult || { success: false, error: 'all-models-failed' };
  }
}

module.exports = GeminiProvider;
