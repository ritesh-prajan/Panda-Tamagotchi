// src/styles/chunky-robot/rig.js
// Master SVG character rig for the "Chunky Robot" style.
// Generates parameterized retro-futuristic mecha panda SVGs with glowing LED visors and fuel cells.

function generateRobotSvg(params = {}) {
  const {
    size = 'large',
    ledColor = '#2ed573',
    eye = 'blocks',
    mouth = 'pixel-smile',
    antennaAngle = 0,
    antennaLedColor = '#2ed573',
    fuelRod = 'active',
    buzzShake = false,
    lowPower = false,
    paws = 'resting'
  } = params;

  let vbWidth = 200;
  let vbHeight = 200;
  let isTiny = size === 'tiny';
  let isMedium = size === 'medium';

  if (isTiny) {
    vbWidth = 140;
    vbHeight = 120;
  } else if (isMedium) {
    vbWidth = 180;
    vbHeight = 180;
  }

  const shakeOffset = buzzShake ? 'transform="translate(2, 0)"' : '';
  const opacityDim = lowPower ? '0.45' : '1.0';

  // --- Visor Screen & LED Eyes ---
  function renderVisorLeds() {
    let content = '';

    if (eye === 'smile') {
      // Curved glowing LED bars (^^)
      content = `
        <!-- Left eye smile -->
        <path d="M 66 94 Q 75 84 84 94" fill="none" stroke="${ledColor}" stroke-width="4.5" stroke-linecap="round" />
        <circle cx="75" cy="85" r="2" fill="${ledColor}" />
        <!-- Right eye smile -->
        <path d="M 116 94 Q 125 84 134 94" fill="none" stroke="${ledColor}" stroke-width="4.5" stroke-linecap="round" />
        <circle cx="125" cy="85" r="2" fill="${ledColor}" />
      `;
    } else if (eye === 'blocks') {
      // Classic square LED pixel eyes
      content = `
        <rect x="67" y="86" width="16" height="16" rx="3" fill="${ledColor}" />
        <rect x="71" y="90" width="8" height="8" fill="#ffffff" opacity="0.75" />
        <rect x="117" y="86" width="16" height="16" rx="3" fill="${ledColor}" />
        <rect x="121" y="90" width="8" height="8" fill="#ffffff" opacity="0.75" />
      `;
    } else if (eye === 'half-dim') {
      // Sleepy half-powered down LEDs
      content = `
        <rect x="67" y="94" width="16" height="8" rx="2" fill="${ledColor}" opacity="0.6" />
        <rect x="117" y="94" width="16" height="8" rx="2" fill="${ledColor}" opacity="0.6" />
      `;
    } else if (eye === 'x-eyes') {
      // Red alert angry cross LEDs (> <)
      content = `
        <g stroke="${ledColor}" stroke-width="4" stroke-linecap="round">
          <line x1="68" y1="86" x2="82" y2="100" />
          <line x1="82" y1="86" x2="68" y2="100" />
          <line x1="118" y1="86" x2="132" y2="100" />
          <line x1="132" y1="86" x2="118" y2="100" />
        </g>
      `;
    } else if (eye === 'battery') {
      // Low battery blinking gauge inside eyes
      content = `
        <!-- Left eye battery -->
        <rect x="64" y="88" width="20" height="12" rx="2" fill="none" stroke="${ledColor}" stroke-width="2" />
        <rect x="84" y="92" width="2.5" height="4" fill="${ledColor}" />
        <rect x="67" y="91" width="5" height="6" fill="${ledColor}" />
        <!-- Right eye battery -->
        <rect x="114" y="88" width="20" height="12" rx="2" fill="none" stroke="${ledColor}" stroke-width="2" />
        <rect x="134" y="92" width="2.5" height="4" fill="${ledColor}" />
        <rect x="117" y="91" width="5" height="6" fill="${ledColor}" />
      `;
    } else if (eye === 'glitch') {
      // Broken flickering pixel fragments
      content = `
        <rect x="66" y="88" width="12" height="4" fill="${ledColor}" opacity="0.8" />
        <rect x="74" y="94" width="10" height="4" fill="${ledColor}" opacity="0.5" />
        <rect x="68" y="98" width="8" height="3" fill="${ledColor}" opacity="0.9" />
        <rect x="116" y="90" width="14" height="4" fill="${ledColor}" opacity="0.9" />
        <rect x="122" y="96" width="10" height="3" fill="${ledColor}" opacity="0.4" />
      `;
    } else if (eye === 'heart') {
      // Pixel LED hearts for petted/love
      content = `
        <path d="M 75 101 A 3.5 3.5 0 0 1 68 94 A 3.5 3.5 0 0 1 75 88 A 3.5 3.5 0 0 1 82 94 Z" fill="${ledColor}" />
        <path d="M 125 101 A 3.5 3.5 0 0 1 118 94 A 3.5 3.5 0 0 1 125 88 A 3.5 3.5 0 0 1 132 94 Z" fill="${ledColor}" />
      `;
    } else if (eye === 'sweep-bars') {
      // High-speed radar / data processing sweep bars (typing)
      content = `
        <rect x="64" y="87" width="22" height="3" fill="${ledColor}" />
        <rect x="67" y="93" width="16" height="3" fill="${ledColor}" opacity="0.8" />
        <rect x="70" y="99" width="10" height="3" fill="${ledColor}" opacity="0.6" />
        <rect x="114" y="87" width="22" height="3" fill="${ledColor}" />
        <rect x="117" y="93" width="16" height="3" fill="${ledColor}" opacity="0.8" />
        <rect x="120" y="99" width="10" height="3" fill="${ledColor}" opacity="0.6" />
      `;
    } else if (eye === 'blink') {
      // Thin line
      content = `
        <line x1="66" y1="94" x2="84" y2="94" stroke="${ledColor}" stroke-width="3" stroke-linecap="round" />
        <line x1="116" y1="94" x2="134" y2="94" stroke="${ledColor}" stroke-width="3" stroke-linecap="round" />
      `;
    }

    return content;
  }

  // --- LED Mouth Generation ---
  function renderMouthLeds() {
    if (mouth === 'fuel-intake') {
      return `
        <!-- Fuel intake slot with charging LED bar -->
        <rect x="88" y="114" width="24" height="6" rx="2" fill="#080e14" stroke="${ledColor}" stroke-width="1.2" />
        <rect x="91" y="116" width="18" height="2" fill="${ledColor}" />
      `;
    } else if (mouth === 'sawtooth') {
      return `
        <!-- Angry red oscilloscope waveform -->
        <path d="M 86 116 L 91 111 L 96 120 L 101 111 L 106 120 L 111 111 L 114 116" fill="none" stroke="${ledColor}" stroke-width="2.5" stroke-linecap="round" />
      `;
    } else if (mouth === 'battery-low') {
      return `
        <!-- Low power warning dashes -->
        <line x1="88" y1="116" x2="94" y2="116" stroke="${ledColor}" stroke-width="3" />
        <line x1="97" y1="116" x2="103" y2="116" stroke="${ledColor}" stroke-width="3" />
        <line x1="106" y1="116" x2="112" y2="116" stroke="${ledColor}" stroke-width="3" />
      `;
    } else if (mouth === 'o-beep') {
      return `
        <!-- Speaker buzzer grille -->
        <circle cx="100" cy="116" r="4.5" fill="none" stroke="${ledColor}" stroke-width="2" />
        <circle cx="100" cy="116" r="1.5" fill="${ledColor}" />
      `;
    } else if (mouth === 'flat') {
      return `
        <line x1="90" y1="116" x2="110" y2="116" stroke="${ledColor}" stroke-width="2.5" stroke-linecap="round" />
      `;
    } else {
      // Default: Stepped pixel smile
      return `
        <path d="M 88 113 L 94 118 L 106 118 L 112 113" fill="none" stroke="${ledColor}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="bevel" />
      `;
    }
  }

  // --- Fuel Rod (Bamboo Energy Cell) ---
  let fuelRodMarkup = '';
  if (fuelRod === 'active') {
    fuelRodMarkup = `
      <!-- Glowing green bamboo energy cell -->
      <g transform="translate(100, 150) rotate(-10)">
        <rect x="-8" y="-26" width="16" height="42" rx="4" fill="#0f172a" stroke="#475569" stroke-width="1.8" />
        <!-- Neon plasma cylinder -->
        <rect x="-5" y="-22" width="10" height="34" rx="2" fill="#2ed573" />
        <line x1="-5" y1="-10" x2="5" y2="-10" stroke="#10ac84" stroke-width="1.5" />
        <line x1="-5" y1="2" x2="5" y2="2" stroke="#10ac84" stroke-width="1.5" />
        <!-- Energy cap -->
        <rect x="-9" y="-28" width="18" height="4" rx="1.5" fill="#94a3b8" />
        <rect x="-9" y="14" width="18" height="4" rx="1.5" fill="#94a3b8" />
      </g>
    `;
  } else if (fuelRod === 'charging-1') {
    fuelRodMarkup = `
      <g transform="translate(90, 128) rotate(-35)">
        <rect x="-6" y="-14" width="12" height="32" rx="3" fill="#0f172a" stroke="#475569" stroke-width="1.5" />
        <rect x="-4" y="-8" width="8" height="22" rx="2" fill="#00f0ff" />
        <circle cx="0" cy="-4" r="2.5" fill="#ffffff" />
      </g>
    `;
  } else if (fuelRod === 'charging-2') {
    fuelRodMarkup = `
      <g transform="translate(110, 128) rotate(35)">
        <rect x="-6" y="-14" width="12" height="32" rx="3" fill="#0f172a" stroke="#475569" stroke-width="1.5" />
        <rect x="-4" y="-11" width="8" height="26" rx="2" fill="#2ed573" />
        <circle cx="0" cy="-6" r="3" fill="#ffffff" />
      </g>
    `;
  } else if (fuelRod === 'empty') {
    fuelRodMarkup = `
      <g transform="translate(100, 150) rotate(-10)">
        <rect x="-8" y="-26" width="16" height="42" rx="4" fill="#0f172a" stroke="#ff4757" stroke-width="1.8" />
        <rect x="-5" y="6" width="10" height="6" rx="1" fill="#ff4757" />
        <line x1="-5" y1="-5" x2="5" y2="5" stroke="#ff4757" stroke-width="1.5" stroke-dasharray="3,2" />
      </g>
    `;
  }

  // --- Robot Paws / Keyboard ---
  let pawsMarkup = '';
  if (paws === 'typing-1') {
    pawsMarkup = `
      <!-- Cyber Holographic Keyboard Deck -->
      <polygon points="62,168 138,168 144,152 56,152" fill="#0a1420" stroke="#00f0ff" stroke-width="1.5" />
      <line x1="68" y1="158" x2="132" y2="158" stroke="#00f0ff" stroke-width="1.5" stroke-dasharray="4,2" />
      <line x1="65" y1="163" x2="135" y2="163" stroke="#00f0ff" stroke-width="1.5" stroke-dasharray="4,2" />
      <!-- Left claw down, right claw up -->
      <rect x="70" y="146" width="16" height="12" rx="4" fill="#334155" stroke="#64748b" stroke-width="1.2" />
      <rect x="114" y="138" width="16" height="12" rx="4" fill="#334155" stroke="#64748b" stroke-width="1.2" />
    `;
  } else if (paws === 'typing-2') {
    pawsMarkup = `
      <polygon points="62,168 138,168 144,152 56,152" fill="#0a1420" stroke="#2ed573" stroke-width="1.5" />
      <line x1="68" y1="158" x2="132" y2="158" stroke="#2ed573" stroke-width="1.5" stroke-dasharray="4,2" />
      <line x1="65" y1="163" x2="135" y2="163" stroke="#2ed573" stroke-width="1.5" stroke-dasharray="4,2" />
      <!-- Left claw up, right claw down -->
      <rect x="70" y="138" width="16" height="12" rx="4" fill="#334155" stroke="#64748b" stroke-width="1.2" />
      <rect x="114" y="146" width="16" height="12" rx="4" fill="#334155" stroke="#64748b" stroke-width="1.2" />
    `;
  } else if (paws === 'petted-wiggle') {
    pawsMarkup = `
      <!-- Paws raised with sparkling cyber brackets -->
      <rect x="52" y="130" width="15" height="12" rx="3" fill="#334155" stroke="#2ed573" stroke-width="1.2" transform="rotate(-25 52 130)" />
      <rect x="133" y="130" width="15" height="12" rx="3" fill="#334155" stroke="#2ed573" stroke-width="1.2" transform="rotate(25 133 130)" />
    `;
  } else {
    // Resting claws
    pawsMarkup = `
      <rect x="66" y="146" width="16" height="12" rx="4" fill="#1e293b" stroke="#475569" stroke-width="1.2" />
      <rect x="118" y="146" width="16" height="12" rx="4" fill="#1e293b" stroke="#475569" stroke-width="1.2" />
    `;
  }

  // --- Antenna ---
  const antennaX = 100;
  const antennaBaseY = 46;
  const antennaMarkup = `
    <!-- Antenna base and swivel stem -->
    <rect x="94" y="44" width="12" height="6" rx="2" fill="#475569" />
    <g transform="rotate(${antennaAngle} 100 46)">
      <line x1="100" y1="44" x2="100" y2="24" stroke="#94a3b8" stroke-width="3" stroke-linecap="round" />
      <!-- Glowing Antenna LED bulb -->
      <circle cx="100" cy="22" r="6" fill="${antennaLedColor}" />
      <circle cx="100" cy="22" r="3" fill="#ffffff" opacity="0.8" />
      <circle cx="100" cy="22" r="9" fill="${antennaLedColor}" opacity="0.25" />
    </g>
  `;

  // --- Tiny Peek Mode Layout ---
  if (isTiny) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 120" width="140" height="120" style="display:block; overflow:visible;">
      <defs>
        <filter id="robot-glow-t">
          <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="${ledColor}" flood-opacity="0.6" />
        </filter>
      </defs>
      <!-- Ears -->
      <rect x="22" y="36" width="22" height="22" rx="4" fill="#1e293b" stroke="#475569" stroke-width="2" />
      <rect x="96" y="36" width="22" height="22" rx="4" fill="#1e293b" stroke="#475569" stroke-width="2" />
      <!-- Head Chassis -->
      <rect x="20" y="46" width="100" height="64" rx="10" fill="#334155" stroke="#64748b" stroke-width="2.5" />
      <!-- Visor screen -->
      <rect x="28" y="54" width="84" height="48" rx="6" fill="#0b1118" stroke="#1e293b" stroke-width="1.8" />
      <!-- Antenna -->
      <line x1="70" y1="46" x2="70" y2="30" stroke="#94a3b8" stroke-width="2.5" />
      <circle cx="70" cy="28" r="4.5" fill="${antennaLedColor}" />
      <!-- Centered LEDs -->
      <g transform="translate(-30, -32)" filter="url(#robot-glow-t)">
        ${renderVisorLeds()}
        ${renderMouthLeds()}
      </g>
    </svg>`;
  }

  // --- Standard Layout (Large & Medium) ---
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="${vbWidth}" height="${vbHeight}" style="display:block; overflow:visible;" ${shakeOffset}>
    <defs>
      <linearGradient id="armor-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#475569" />
        <stop offset="100%" stop-color="#1e293b" />
      </linearGradient>
      <linearGradient id="body-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#334155" />
        <stop offset="100%" stop-color="#0f172a" />
      </linearGradient>
      <filter id="robot-led-glow">
        <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="${ledColor}" flood-opacity="0.75" />
      </filter>
      <filter id="robot-shadow">
        <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#000" flood-opacity="0.4" />
      </filter>
    </defs>

    <g filter="url(#robot-shadow)" opacity="${opacityDim}">
      <!-- Antenna -->
      ${antennaMarkup}

      <!-- Ears (Boxy mechanical audio receivers) -->
      <rect x="42" y="38" width="28" height="28" rx="6" fill="#0f172a" stroke="#64748b" stroke-width="2.2" />
      <line x1="48" y1="46" x2="64" y2="46" stroke="#475569" stroke-width="1.5" />
      <line x1="48" y1="52" x2="64" y2="52" stroke="#475569" stroke-width="1.5" />
      <rect x="130" y="38" width="28" height="28" rx="6" fill="#0f172a" stroke="#64748b" stroke-width="2.2" />
      <line x1="136" y1="46" x2="152" y2="46" stroke="#475569" stroke-width="1.5" />
      <line x1="136" y1="52" x2="152" y2="52" stroke="#475569" stroke-width="1.5" />

      <!-- Lower Body & Rivets -->
      <rect x="60" y="140" width="80" height="42" rx="10" fill="url(#body-grad)" stroke="#475569" stroke-width="2" />
      <!-- Rivet bolts -->
      <circle cx="66" cy="146" r="1.8" fill="#94a3b8" />
      <circle cx="134" cy="146" r="1.8" fill="#94a3b8" />
      <circle cx="66" cy="176" r="1.8" fill="#94a3b8" />
      <circle cx="134" cy="176" r="1.8" fill="#94a3b8" />

      <!-- Boxy Panda-Robot Head Chassis -->
      <rect x="38" y="48" width="124" height="96" rx="16" fill="url(#armor-grad)" stroke="#64748b" stroke-width="2.8" />
      <!-- Corner Rivets on Head -->
      <circle cx="46" cy="56" r="2" fill="#94a3b8" />
      <circle cx="154" cy="56" r="2" fill="#94a3b8" />
      <circle cx="46" cy="136" r="2" fill="#94a3b8" />
      <circle cx="154" cy="136" r="2" fill="#94a3b8" />

      <!-- Smoked Glass Dark Visor Screen -->
      <rect x="48" y="66" width="104" height="64" rx="10" fill="#090d14" stroke="#1e293b" stroke-width="2.2" />
      <!-- Subtle scanlines overlay inside visor -->
      <line x1="50" y1="78" x2="150" y2="78" stroke="#1e293b" stroke-width="0.7" opacity="0.4" />
      <line x1="50" y1="92" x2="150" y2="92" stroke="#1e293b" stroke-width="0.7" opacity="0.4" />
      <line x1="50" y1="106" x2="150" y2="106" stroke="#1e293b" stroke-width="0.7" opacity="0.4" />
      <line x1="50" y1="120" x2="150" y2="120" stroke="#1e293b" stroke-width="0.7" opacity="0.4" />

      <!-- Glowing LED Eyes & Mouth -->
      <g filter="url(#robot-led-glow)">
        ${renderVisorLeds()}
        ${renderMouthLeds()}
      </g>

      <!-- Fuel Rod / Energy Bamboo -->
      ${fuelRodMarkup}

      <!-- Mechanical Claws / Keyboard -->
      ${pawsMarkup}
    </g>
  </svg>`;
}

module.exports = {
  generateRobotSvg
};
