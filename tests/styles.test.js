// tests/styles.test.js
// Plain Node test verifying that for every style, emotion, and size:
// 1. getLook returns >= 1 frame
// 2. For sticker styles, every referenced image file exists on disk
// 3. Status and metadata are properly populated

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { getLook, getAvailableStyles, getAvailableEmotions } = require('../src/styles');

console.log('🧪 Starting Styles & Sprite Pipeline Tests...\n');

let totalChecks = 0;
let passedChecks = 0;
const SIZES = ['large', 'medium', 'tiny'];
const styles = getAvailableStyles();

assert(styles.length >= 4, `Expected at least 4 styles, found ${styles.length}`);

styles.forEach((s) => {
  const styleId = s.id;
  const emotions = getAvailableEmotions(styleId);
  console.log(`Checking style: [${styleId}] (${s.name}) - ${emotions.length} emotions`);

  assert(emotions.length > 0, `Style ${styleId} should have at least 1 emotion`);

  emotions.forEach((emo) => {
    SIZES.forEach((size) => {
      totalChecks++;
      const look = getLook(styleId, emo, size);

      // 1. Must return valid structure
      assert(look, `getLook(${styleId}, ${emo}, ${size}) returned null/undefined`);
      assert(Array.isArray(look.frames), `look.frames should be an array for ${styleId}:${emo}:${size}`);
      assert(look.frames.length >= 1, `look.frames should have >= 1 frame for ${styleId}:${emo}:${size}`);
      assert(typeof look.frameDelayMs === 'number' && look.frameDelayMs > 0, `frameDelayMs should be > 0 for ${styleId}:${emo}:${size}`);

      // 2. Sticker specific descriptor checks
      if (styleId === 'official-sticker') {
        assert(look.status === 'final' || look.status === 'placeholder', `Invalid status "${look.status}" for ${emo}`);

        look.frames.forEach((frame, fIdx) => {
          assert(typeof frame === 'object' && frame !== null, `Frame ${fIdx} must be a descriptor object for ${emo}`);
          assert.strictEqual(frame.type, 'image', `Frame ${fIdx} type must be 'image'`);
          assert(typeof frame.src === 'string' && frame.src.length > 0, `Frame ${fIdx} src must be non-empty string`);
          assert(typeof frame.w === 'number' && frame.w > 0, `Frame ${fIdx} w must be > 0`);
          assert(typeof frame.h === 'number' && frame.h > 0, `Frame ${fIdx} h must be > 0`);
          assert(typeof frame.scale === 'number' && frame.scale > 0, `Frame ${fIdx} scale must be > 0`);

          // Verify disk existence: frame.src is relative to src/renderer/ or src/control/
          // e.g. "../assets/official-chibi-opt/idle_0.png"
          const resolvedPath = path.resolve(__dirname, '../src/renderer', frame.src);
          assert(
            fs.existsSync(resolvedPath),
            `Referenced sprite file does NOT exist on disk: ${frame.src} (resolved: ${resolvedPath})`
          );
        });
      } else {
        // ASCII or SVG styles: frames are strings
        look.frames.forEach((frame, fIdx) => {
          assert(typeof frame === 'string' && frame.length > 0, `Frame ${fIdx} must be a non-empty string for ${styleId}:${emo}:${size}`);
        });
      }

      passedChecks++;
    });
  });
});

console.log(`\n✅ All styles passed! Checked ${totalChecks} combinations across 4 styles and 3 sizes.`);
console.log('🎉 styles.test.js PASSED without errors.\n');
