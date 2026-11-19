// src/styles/cute-anime/rig.js
// Master SVG character rig for the "Cute Anime" style.
// Generates parameterized chibi panda SVGs with smooth visual presets.

function generateAnimeSvg(params = {}) {
  const {
    size = 'large',
    eye = 'sparkle',
    mouth = 'smile',
    blush = true,
    bamboo = 'held',
    steam = false,
    sparkles = false,
    sweatDrop = false,
    tears = false,
    paws = 'resting',
    sleepZ = false,
    headTilt = 0, // degrees
    headY = 0 // px
  } = params;

  // Viewbox & dimensions by size
  let vbWidth = 200;
  let vbHeight = 200;
  let scale = 1;
  let isTiny = size === 'tiny';
  let isMedium = size === 'medium';

  if (isTiny) {
    vbWidth = 140;
    vbHeight = 120;
    scale = 0.85;
  } else if (isMedium) {
    vbWidth = 180;
    vbHeight = 180;
    scale = 0.95;
  }

  // --- Eyes Generation ---
  function renderEye(isRight = false) {
    const cx = isRight ? 132 : 68;
    const cy = 94;
    const patchRotate = isRight ? -14 : 14;

    // Dark eye patch behind
    let patch = `<ellipse cx="${cx}" cy="${cy + 2}" rx="${isTiny ? 18 : 22}" ry="${isTiny ? 17 : 20}" fill="#242831" transform="rotate(${patchRotate} ${cx} ${cy + 2})" />`;

    let eyeContent = '';

    if (eye === 'sparkle') {
      // Big shiny anime eye
      eyeContent = `
        <ellipse cx="${cx}" cy="${cy + 1}" rx="12" ry="14" fill="#0f141d" />
        <ellipse cx="${cx}" cy="${cy + 3}" rx="10" ry="10" fill="#2d3748" />
        <ellipse cx="${cx}" cy="${cy + 6}" rx="8" ry="6" fill="#4a5568" />
        <!-- Big highlight -->
        <circle cx="${cx - 4}" cy="${cy - 3}" r="4.5" fill="#ffffff" />
        <!-- Secondary sparkles -->
        <circle cx="${cx + 4}" cy="${cy + 5}" r="2.2" fill="#ffffff" />
        <circle cx="${cx - 2}" cy="${cy + 7}" r="1.2" fill="#ffffff" />
      `;
    } else if (eye === 'closed-happy' || eye === 'petted') {
      // Curved smiling eye arcs (^^)
      eyeContent = `
        <path d="M ${cx - 10} ${cy + 2} Q ${cx} ${cy - 8} ${cx + 10} ${cy + 2}" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" />
        <path d="M ${cx + 7} ${cy - 1} L ${cx + 12} ${cy - 5}" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
      `;
    } else if (eye === 'closed-sleepy') {
      // Gentle droopy closed horizontal eye line
      eyeContent = `
        <path d="M ${cx - 10} ${cy + 3} Q ${cx} ${cy + 8} ${cx + 10} ${cy + 3}" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" />
      `;
    } else if (eye === 'angry') {
      // Slanted fierce chibi eyes (> <)
      const slantY1 = isRight ? cy - 3 : cy + 3;
      const slantY2 = isRight ? cy + 3 : cy - 3;
      eyeContent = `
        <path d="M ${cx - 9} ${slantY1} L ${cx + 9} ${slantY2}" stroke="#ffffff" stroke-width="4" stroke-linecap="round" />
        <circle cx="${cx}" cy="${cy + 2}" r="3" fill="#ff4757" />
      `;
    } else if (eye === 'watery' || eye === 'teary') {
      // Glistening huge teary eyes
      eyeContent = `
        <ellipse cx="${cx}" cy="${cy}" rx="13" ry="14" fill="#1a202c" />
        <ellipse cx="${cx}" cy="${cy + 3}" rx="11" ry="9" fill="#00b4d8" opacity="0.8" />
        <circle cx="${cx - 4}" cy="${cy - 4}" r="5" fill="#ffffff" />
        <circle cx="${cx + 4}" cy="${cy + 5}" r="3" fill="#ffffff" />
        <circle cx="${cx - 1}" cy="${cy + 7}" r="1.5" fill="#ffffff" />
      `;
    } else if (eye === 'blink') {
      // Flat blink line with cute lashes
      eyeContent = `
        <path d="M ${cx - 10} ${cy + 2} L ${cx + 10} ${cy + 2}" stroke="#ffffff" stroke-width="3" stroke-linecap="round" />
      `;
    } else if (eye === 'heart') {
      // Heart pupils for love/petted
      eyeContent = `
        <ellipse cx="${cx}" cy="${cy + 1}" rx="12" ry="13" fill="#1e1e24" />
        <path d="M ${cx} ${cy + 7} A 4 4 0 0 1 ${cx - 7} ${cy - 1} A 4 4 0 0 1 ${cx} ${cy - 4} A 4 4 0 0 1 ${cx + 7} ${cy - 1} Z" fill="#ff4757" />
        <circle cx="${cx - 3}" cy="${cy - 3}" r="2" fill="#ffffff" />
      `;
    } else if (eye === 'looking-down') {
      // Anime gaze angled downwards (typing)
      eyeContent = `
        <ellipse cx="${cx}" cy="${cy + 2}" rx="11" ry="12" fill="#0f141d" />
        <ellipse cx="${cx}" cy="${cy + 6}" rx="9" ry="7" fill="#2d3748" />
        <circle cx="${cx - 3}" cy="${cy}" r="3.5" fill="#ffffff" />
        <circle cx="${cx + 4}" cy="${cy + 6}" r="1.8" fill="#ffffff" />
      `;
    }

    return patch + eyeContent;
  }

  // --- Mouth Generation ---
  function renderMouth() {
    const mx = 100;
    const my = 120;

    if (mouth === 'chew-open') {
      return `
        <!-- Cute open chewing mouth with pink tongue -->
        <path d="M 92 118 Q 100 114 108 118 Q 100 130 92 118 Z" fill="#c0392b" stroke="#242831" stroke-width="1.8" />
        <path d="M 95 124 Q 100 120 105 124" fill="#ff7675" />
      `;
    } else if (mouth === 'chew-mid' || mouth === 'chew-closed') {
      return `
        <!-- Wavy kitty/anime mouth :3 -->
        <path d="M 91 117 Q 95 122 100 119 Q 105 122 109 117" fill="none" stroke="#242831" stroke-width="2.5" stroke-linecap="round" />
      `;
    } else if (mouth === 'pout') {
      return `
        <!-- Anime pout zigzag -->
        <path d="M 93 121 Q 97 116 100 119 Q 103 116 107 121" fill="none" stroke="#242831" stroke-width="2.5" stroke-linecap="round" />
      `;
    } else if (mouth === 'open-happy') {
      return `
        <!-- Big cheerful D-shaped smile -->
        <path d="M 90 117 Q 100 115 110 117 Q 100 132 90 117 Z" fill="#c0392b" stroke="#242831" stroke-width="1.8" />
        <ellipse cx="100" cy="125" rx="6" ry="3.5" fill="#ff7675" />
      `;
    } else if (mouth === 'wavy') {
      return `
        <!-- Sad trembling mouth -->
        <path d="M 92 121 Q 96 117 100 121 Q 104 125 108 121" fill="none" stroke="#242831" stroke-width="2" stroke-linecap="round" />
      `;
    } else if (mouth === 'drool') {
      return `
        <ellipse cx="100" cy="120" rx="5" ry="6" fill="#c0392b" />
        <!-- Shiny drool drop -->
        <path d="M 103 123 Q 105 128 104 130 A 2 2 0 0 1 101 130 Q 102 125 103 123 Z" fill="#70d6ff" />
      `;
    } else {
      // Default cute smile
      return `
        <path d="M 93 118 Q 100 124 107 118" fill="none" stroke="#242831" stroke-width="2.2" stroke-linecap="round" />
      `;
    }
  }

  // --- Blush Generation ---
  let blushMarkup = '';
  if (blush) {
    const opacity = blush === 'heavy' ? '0.75' : '0.55';
    blushMarkup = `
      <!-- Soft anime blush ovals -->
      <ellipse cx="56" cy="116" rx="12" ry="7" fill="#ff7675" opacity="${opacity}" />
      <ellipse cx="144" cy="116" rx="12" ry="7" fill="#ff7675" opacity="${opacity}" />
      <!-- Blush hash marks -->
      <line x1="52" y1="114" x2="55" y2="119" stroke="#ff4757" stroke-width="1.2" opacity="0.6" />
      <line x1="57" y1="113" x2="60" y2="118" stroke="#ff4757" stroke-width="1.2" opacity="0.6" />
      <line x1="140" y1="114" x2="143" y2="119" stroke="#ff4757" stroke-width="1.2" opacity="0.6" />
      <line x1="145" y1="113" x2="148" y2="118" stroke="#ff4757" stroke-width="1.2" opacity="0.6" />
    `;
  }

  // --- Bamboo Stalk Generation ---
  let bambooMarkup = '';
  if (bamboo === 'held') {
    bambooMarkup = `
      <!-- Bamboo stalk in front -->
      <g transform="translate(100, 150) rotate(-15)">
        <rect x="-8" y="-30" width="16" height="48" rx="4" fill="#2ed573" stroke="#242831" stroke-width="2" />
        <line x1="-8" y1="-14" x2="8" y2="-14" stroke="#10ac84" stroke-width="2" />
        <line x1="-8" y1="4" x2="8" y2="4" stroke="#10ac84" stroke-width="2" />
        <!-- Leaf -->
        <path d="M 6 -14 Q 22 -22 28 -12 Q 18 -6 6 -12 Z" fill="#7bed9f" stroke="#242831" stroke-width="1.5" />
      </g>
    `;
  } else if (bamboo === 'chewing-left') {
    bambooMarkup = `
      <g transform="translate(85, 122) rotate(-35)">
        <rect x="-5" y="-12" width="10" height="34" rx="3" fill="#2ed573" stroke="#242831" stroke-width="1.8" />
        <line x1="-5" y1="2" x2="5" y2="2" stroke="#10ac84" stroke-width="1.8" />
        <path d="M 5 2 Q 18 -4 22 4 Q 14 8 5 4 Z" fill="#7bed9f" stroke="#242831" stroke-width="1.2" />
      </g>
      <!-- Snack crumbs -->
      <circle cx="78" cy="118" r="1.5" fill="#7bed9f" />
      <circle cx="82" cy="132" r="1.2" fill="#2ed573" />
    `;
  } else if (bamboo === 'chewing-right') {
    bambooMarkup = `
      <g transform="translate(115, 122) rotate(35)">
        <rect x="-5" y="-12" width="10" height="34" rx="3" fill="#2ed573" stroke="#242831" stroke-width="1.8" />
        <line x1="-5" y1="2" x2="5" y2="2" stroke="#10ac84" stroke-width="1.8" />
        <path d="M -5 2 Q -18 -4 -22 4 Q -14 8 -5 4 Z" fill="#7bed9f" stroke="#242831" stroke-width="1.2" />
      </g>
      <!-- Snack crumbs -->
      <circle cx="122" cy="118" r="1.5" fill="#7bed9f" />
      <circle cx="118" cy="132" r="1.2" fill="#2ed573" />
    `;
  }

  // --- Accessories: Tears, Steam, Sparkles, SweatDrop, SleepZ ---
  let fxMarkup = '';
  if (tears === 'streaming' || tears === true) {
    fxMarkup += `
      <!-- Animated anime streaming tears -->
      <path d="M 58 108 Q 50 125 52 145 Q 54 150 50 152 Q 46 142 48 116 Z" fill="#70d6ff" opacity="0.85" />
      <path d="M 142 108 Q 150 125 148 145 Q 146 150 150 152 Q 154 142 152 116 Z" fill="#70d6ff" opacity="0.85" />
      <circle cx="48" cy="154" r="3" fill="#00b4d8" />
      <circle cx="152" cy="154" r="3" fill="#00b4d8" />
    `;
  }

  if (steam) {
    fxMarkup += `
      <!-- Anime anger steam puffs -->
      <g opacity="0.9">
        <circle cx="32" cy="52" r="8" fill="#ffffff" stroke="#ff4757" stroke-width="1.5" />
        <circle cx="22" cy="42" r="11" fill="#ffffff" stroke="#ff4757" stroke-width="1.5" />
        <path d="M 28 58 L 32 68 L 38 62 Z" fill="#ffffff" />
        <circle cx="168" cy="52" r="8" fill="#ffffff" stroke="#ff4757" stroke-width="1.5" />
        <circle cx="178" cy="42" r="11" fill="#ffffff" stroke="#ff4757" stroke-width="1.5" />
        <path d="M 172 58 L 168 68 L 162 62 Z" fill="#ffffff" />
      </g>
    `;
  }

  if (sparkles) {
    fxMarkup += `
      <!-- Golden sparkle stars -->
      <g fill="#ffd32a" stroke="#ffa801" stroke-width="0.8">
        <!-- Top left sparkle -->
        <path d="M 34 38 Q 34 46 26 46 Q 34 46 34 54 Q 34 46 42 46 Q 34 46 34 38 Z" />
        <!-- Top right sparkle -->
        <path d="M 166 38 Q 166 46 158 46 Q 166 46 166 54 Q 166 46 174 46 Q 166 46 166 38 Z" />
        <!-- Tiny twinkle -->
        <circle cx="42" cy="30" r="2.5" fill="#fff" />
        <circle cx="160" cy="28" r="2.5" fill="#fff" />
      </g>
    `;
  }

  if (sweatDrop) {
    fxMarkup += `
      <!-- Big anime sweat drop on temple -->
      <path d="M 152 64 C 146 54 162 46 158 56 C 158 60 156 64 152 64 Z" fill="#70d6ff" stroke="#0077b6" stroke-width="1.2" />
    `;
  }

  if (sleepZ) {
    fxMarkup += `
      <!-- Floating z Z Z sleep letters -->
      <text x="146" y="50" font-family="'Comic Sans MS', sans-serif" font-size="16" font-weight="bold" fill="#70a1ff" opacity="0.9">Z</text>
      <text x="160" y="38" font-family="'Comic Sans MS', sans-serif" font-size="12" font-weight="bold" fill="#a29bfe" opacity="0.75">z</text>
      <text x="170" y="28" font-family="'Comic Sans MS', sans-serif" font-size="9" font-weight="bold" fill="#dfe6e9" opacity="0.6">z</text>
    `;
  }

  // --- Paws / Typing Generation ---
  let pawsMarkup = '';
  if (paws === 'typing-1') {
    pawsMarkup = `
      <!-- Miniature keyboard -->
      <rect x="68" y="152" width="64" height="22" rx="4" fill="#2d3436" stroke="#636e72" stroke-width="1.5" />
      <line x1="74" y1="160" x2="126" y2="160" stroke="#74b9ff" stroke-width="2" stroke-dasharray="3,2" />
      <line x1="74" y1="166" x2="126" y2="166" stroke="#74b9ff" stroke-width="2" stroke-dasharray="3,2" />
      <!-- Left paw down, right paw up -->
      <ellipse cx="80" cy="150" rx="10" ry="8" fill="#242831" />
      <ellipse cx="120" cy="142" rx="10" ry="8" fill="#242831" />
    `;
  } else if (paws === 'typing-2') {
    pawsMarkup = `
      <rect x="68" y="152" width="64" height="22" rx="4" fill="#2d3436" stroke="#636e72" stroke-width="1.5" />
      <line x1="74" y1="160" x2="126" y2="160" stroke="#a29bfe" stroke-width="2" stroke-dasharray="3,2" />
      <line x1="74" y1="166" x2="126" y2="166" stroke="#a29bfe" stroke-width="2" stroke-dasharray="3,2" />
      <!-- Left paw up, right paw down -->
      <ellipse cx="80" cy="142" rx="10" ry="8" fill="#242831" />
      <ellipse cx="120" cy="150" rx="10" ry="8" fill="#242831" />
    `;
  } else if (paws === 'petted-hug') {
    pawsMarkup = `
      <!-- Paws raised cheerfully in happiness -->
      <ellipse cx="62" cy="135" rx="10" ry="12" fill="#242831" transform="rotate(-30 62 135)" />
      <ellipse cx="138" cy="135" rx="10" ry="12" fill="#242831" transform="rotate(30 138 135)" />
    `;
  } else {
    // Resting paws
    pawsMarkup = `
      <ellipse cx="72" cy="148" rx="11" ry="9" fill="#242831" />
      <ellipse cx="128" cy="148" rx="11" ry="9" fill="#242831" />
    `;
  }

  // --- Tiny Peek Mode Layout ---
  if (isTiny) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 120" width="140" height="120" style="display:block; overflow:visible;">
      <defs>
        <radialGradient id="anime-fur-t" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="#f1f2f6" />
        </radialGradient>
      </defs>
      <!-- Ears -->
      <circle cx="36" cy="42" r="20" fill="#242831" />
      <circle cx="36" cy="42" r="10" fill="#ffb4c6" opacity="0.6" />
      <circle cx="104" cy="42" r="20" fill="#242831" />
      <circle cx="104" cy="42" r="10" fill="#ffb4c6" opacity="0.6" />
      <!-- Head Base -->
      <path d="M 22 75 C 22 45, 118 45, 118 75 C 118 105, 22 105, 22 75 Z" fill="url(#anime-fur-t)" stroke="#242831" stroke-width="2.5" />
      <!-- Eyes & Face centered in 140 width -->
      <g transform="translate(-30, -18)">
        ${renderEye(false)}
        ${renderEye(true)}
        <!-- Tiny nose -->
        <ellipse cx="100" cy="108" rx="4" ry="3" fill="#242831" />
        ${renderMouth()}
        ${blushMarkup}
      </g>
      ${fxMarkup}
    </svg>`;
  }

  // --- Standard / Full Layout (Large & Medium) ---
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="${vbWidth}" height="${vbHeight}" style="display:block; overflow:visible;">
    <defs>
      <radialGradient id="anime-fur" cx="50%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="85%" stop-color="#f5f6fa" />
        <stop offset="100%" stop-color="#e4e7eb" />
      </radialGradient>
      <filter id="anime-shadow" x="-10%" y="-10%" width="120%" height="125%">
        <feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#000" flood-opacity="0.3" />
      </filter>
    </defs>

    <g filter="url(#anime-shadow)" transform="translate(0, ${headY}) rotate(${headTilt} 100 100)">
      <!-- Back Body & Limbs -->
      <ellipse cx="100" cy="150" rx="52" ry="38" fill="#242831" />
      <ellipse cx="100" cy="148" rx="36" ry="26" fill="url(#anime-fur)" />

      <!-- Ears -->
      <circle cx="48" cy="48" r="24" fill="#242831" stroke="#1e2229" stroke-width="2" />
      <circle cx="48" cy="48" r="12" fill="#ffb4c6" opacity="0.65" />
      <circle cx="152" cy="48" r="24" fill="#242831" stroke="#1e2229" stroke-width="2" />
      <circle cx="152" cy="48" r="12" fill="#ffb4c6" opacity="0.65" />

      <!-- Cute Chibi Head -->
      <ellipse cx="100" cy="98" rx="66" ry="54" fill="url(#anime-fur)" stroke="#242831" stroke-width="3" />

      <!-- Face Details -->
      ${renderEye(false)}
      ${renderEye(true)}

      <!-- Cute black nose -->
      <ellipse cx="100" cy="111" rx="5" ry="3.5" fill="#242831" />

      <!-- Mouth -->
      ${renderMouth()}

      <!-- Cheeks Blush -->
      ${blushMarkup}

      <!-- Bamboo Stalk -->
      ${bambooMarkup}

      <!-- Paws -->
      ${pawsMarkup}

      <!-- Visual Effects (steam, tears, sparkles) -->
      ${fxMarkup}
    </g>
  </svg>`;
}

module.exports = {
  generateAnimeSvg
};
