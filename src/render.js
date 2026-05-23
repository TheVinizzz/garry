// Render a kawaii / chibi anime cartoon SVG of Garry.
//
// Style cues from the moodboard:
//   * Oversized round anime eyes with multi-layer iris + sparkles.
//   * Soft pastel coloring, white belly, warm blush on cheeks.
//   * Tiny ω mouth, button nose.
//   * Fluffy outline (subtle fur tufts on body).
//   * Sparkle accents floating around the canvas for the "stickerly" kawaii feel.
//
// Mood-driven composition + breathing/blink animations via SMIL.

import {
  COLORS, VIEWBOX, PATHS, EYES, NOSE, NOSE_HI, MOUTHS,
  blushSpots, tieGroup, sparkleField, ZZZ,
} from './illustration.js';
import { hasFrame, readFrameDataUri } from './ai-gen.js';

const STATS_H = 320;          // extra room for action-buttons row inside SVG

export function renderSVG({ mood = 'idle', state = null, animated = true, repo = process.env.GARRY_REPO, baseUrl = process.env.GARRY_BASE_URL, embedAllMoods = false } = {}) {
  const { w, h } = VIEWBOX;
  const totalH = h + STATS_H;

  // baseUrl wins (playtest mode → http://localhost:PORT/act/<action>).
  // Otherwise build GitHub Issue Form links from repo.
  const issuesBase = baseUrl
    ? `${baseUrl.replace(/\/$/, '')}/act/`
    : (repo
        ? `https://github.com/${repo}/issues/new?template=`
        : 'https://github.com/garry-cat/garry/issues/new?template=');
  const linkSuffix = baseUrl ? '' : '.yml';

  // Two render modes:
  //   embedAllMoods=true (playtest)  — stack all 8 frames, only current visible.
  //                                    Client JS toggles visibility on action,
  //                                    SMIL animations never reset.
  //   embedAllMoods=false (GitHub)   — embed only the current frame to keep
  //                                    file size small. Each page load restarts
  //                                    SMIL but that's acceptable on GitHub.
  const aiUri = hasFrame(mood) ? readFrameDataUri(mood) : null;
  const allFrames = embedAllMoods
    ? Object.fromEntries(
        ['idle', 'happy', 'ecstatic', 'hungry', 'sleep', 'lick', 'grumpy', 'blink']
          .filter(m => hasFrame(m))
          .map(m => [m, readFrameDataUri(m)]))
    : null;
  const pose = aiUri
    ? composeAiPose(aiUri, animated, null, mood, { allFrames, currentMood: mood })
    : composePose(mood);
  const stats = state ? renderStats(state, w, h) : '';
  const buttons = renderActionButtons(w, h + STATS_H, issuesBase, linkSuffix);

  // Outer breathing only when not using AI raster pose (the AI branch wraps
  // its own breathing inside composeAiPose).
  const breathe = (animated && !aiUri) ? `
    <animateTransform attributeName="transform" type="translate" values="0 0; 0 -4; 0 0" dur="3s" repeatCount="indefinite" additive="sum"/>
    <animateTransform attributeName="transform" type="scale" values="1 1; 1 1.015; 1 1" dur="3s" repeatCount="indefinite" additive="sum"/>
  ` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${w} ${totalH}" width="${w}" height="${totalH}" font-family="ui-rounded, 'SF Pro Rounded', system-ui, sans-serif">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="80%">
      <stop offset="0%" stop-color="#ffe6f0"/>
      <stop offset="55%" stop-color="#ffd5d9"/>
      <stop offset="100%" stop-color="#fbb8c2"/>
    </radialGradient>
    <radialGradient id="halo" cx="50%" cy="42%" r="55%">
      <stop offset="0%" stop-color="rgba(255,242,225,0.55)"/>
      <stop offset="100%" stop-color="rgba(255,200,210,0)"/>
    </radialGradient>
    <radialGradient id="clickGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(255,228,150,0.0)"/>
      <stop offset="60%" stop-color="rgba(255,228,150,0.0)"/>
      <stop offset="80%" stop-color="rgba(255,200,120,0.45)"/>
      <stop offset="100%" stop-color="rgba(255,160,80,0.0)"/>
    </radialGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(255,170,200,0)"/>
      <stop offset="100%" stop-color="rgba(255,160,200,0.5)"/>
    </linearGradient>
  </defs>

  <!-- STATIC backdrop -->
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect y="${h - 120}" width="${w}" height="${120}" fill="url(#floor)"/>
  <rect width="${w}" height="${h}" fill="url(#halo)"/>

  <!-- Background sparkle field (twinkles only — no transforms) -->
  ${twinkleSparkles(animated)}

  <!-- Pulsing CLICK glow behind cat to telegraph interactivity -->
  ${animated ? `<circle cx="${w / 2}" cy="${h - 200}" r="180" fill="url(#clickGlow)">
    <animate attributeName="r" values="170;200;170" dur="2.6s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.55;0.95;0.55" dur="2.6s" repeatCount="indefinite"/>
  </circle>` : ''}

  <!-- Animated floor shadow (sync with breath) -->
  <ellipse cx="${w / 2}" cy="${h - 14}" rx="160" ry="16" fill="${COLORS.shadow}">
    ${animated ? `<animate attributeName="rx" values="160; 152; 160" dur="3.4s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.95; 0.75; 0.95" dur="3.4s" repeatCount="indefinite"/>` : ''}
  </ellipse>

  <!-- Garry layer wrapped in an internal SVG link so clicking the cat anywhere
       opens the pet Issue Form. Works both when SVG is opened directly and when
       embedded via <img> inside markdown (in the latter case the outer markdown
       <a> wrapper handles the click). -->
  <a xlink:href="${issuesBase}pet${linkSuffix}" target="_top">
    ${aiUri ? pose : `<g transform-origin="${w / 2} ${h - 30}"><g>${breathe}${pose}</g></g>`}
    <!-- Invisible click-catcher rect so the whole sprite area is clickable -->
    <rect x="0" y="0" width="${w}" height="${h}" fill="rgba(0,0,0,0)" style="cursor: pointer;"/>
  </a>

  <!-- Click-me ribbon: floating tag near top, also a hot link -->
  ${animated ? renderClickRibbon(w, issuesBase, linkSuffix) : ''}

  ${stats}
  ${buttons}
</svg>`;
}

function renderClickRibbon(w, issuesBase, linkSuffix = '.yml') {
  const cx = w / 2;
  const cy = 36;
  return `
    <a xlink:href="${issuesBase}pet${linkSuffix}" target="_top">
      <g style="cursor: pointer;">
        <animateTransform attributeName="transform" type="translate"
          values="0 0; 0 -4; 0 0" keyTimes="0;0.5;1"
          dur="1.4s" repeatCount="indefinite"/>
        <rect x="${cx - 96}" y="${cy - 16}" width="192" height="32" rx="16" fill="#2c2520" stroke="#ffd84a" stroke-width="2"/>
        <text x="${cx}" y="${cy + 5}" text-anchor="middle" font-size="14" fill="#ffd84a" font-weight="900" letter-spacing="3" font-family="ui-monospace, 'SF Mono', monospace">▸ CLICK GARRY ◂</text>
        <animate attributeName="opacity" values="0.85;1;0.85" dur="1.4s" repeatCount="indefinite"/>
      </g>
    </a>
  `;
}

// Five action buttons rendered inside the SVG — each is a proper <a> link so
// they're clickable when the SVG is opened directly. (When the SVG is embedded
// via <img> in markdown, the README's outer <a> handles the catch-all click.)
function renderActionButtons(svgW, ySvg, issuesBase, linkSuffix = '.yml') {
  const buttons = [
    { key: 'pet',   label: 'PET',   emoji: '🤚', color: '#ff7eb4' },
    { key: 'feed',  label: 'FEED',  emoji: '🍣', color: '#f59a3a' },
    { key: 'play',  label: 'PLAY',  emoji: '🧶', color: '#b78bff' },
    { key: 'treat', label: 'TREAT', emoji: '🍪', color: '#ffd84a' },
    { key: 'sleep', label: 'SLEEP', emoji: '💤', color: '#7fc7ea' },
  ];
  const padX = 22;
  const rowY = ySvg - 70;
  const gap = 8;
  const btnW = (svgW - padX * 2 - gap * (buttons.length - 1)) / buttons.length;
  const btnH = 50;

  return `<g id="actions">
    ${buttons.map((b, i) => {
      const x = padX + i * (btnW + gap);
      return `
        <a xlink:href="${issuesBase}${b.key}${linkSuffix}" target="_top">
          <g style="cursor: pointer;">
            <rect x="${x}" y="${rowY}" width="${btnW}" height="${btnH}" rx="10"
                  fill="${b.color}" stroke="#1f1814" stroke-width="2"/>
            <rect x="${x + 3}" y="${rowY + 3}" width="${btnW - 6}" height="${btnH - 6}" rx="8"
                  fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1.5"/>
            <text x="${x + btnW / 2}" y="${rowY + 24}" text-anchor="middle"
                  font-size="18" fill="#1f1814">${b.emoji}</text>
            <text x="${x + btnW / 2}" y="${rowY + 41}" text-anchor="middle"
                  font-size="11" fill="#1f1814" font-weight="900" letter-spacing="2" font-family="ui-monospace, monospace">${b.label}</text>
          </g>
        </a>`;
    }).join('')}
  </g>`;
}

function twinkleSparkles(animated) {
  const spots = [
    { x: 60, y: 80, r: 8, color: '#ffe16a', delay: 0 },
    { x: 410, y: 110, r: 7, color: '#f4a8b6', delay: 0.6 },
    { x: 40, y: 280, r: 6, color: '#a8d8ff', delay: 1.2 },
    { x: 440, y: 300, r: 8, color: '#ffe16a', delay: 1.8 },
    { x: 90, y: 420, r: 5, color: '#f4a8b6', delay: 2.4 },
    { x: 400, y: 440, r: 9, color: '#a8d8ff', delay: 3.0 },
    { x: 200, y: 60, r: 5, color: '#fdfff7', delay: 1.5 },
    { x: 320, y: 480, r: 6, color: '#fdfff7', delay: 2.7 },
  ];
  return spots.map(s => `
    <path d="M ${s.x} ${s.y - s.r} L ${s.x + s.r * 0.3} ${s.y - s.r * 0.3} L ${s.x + s.r} ${s.y} L ${s.x + s.r * 0.3} ${s.y + s.r * 0.3} L ${s.x} ${s.y + s.r} L ${s.x - s.r * 0.3} ${s.y + s.r * 0.3} L ${s.x - s.r} ${s.y} L ${s.x - s.r * 0.3} ${s.y - s.r * 0.3} Z" fill="${s.color}" opacity="0.85">
      ${animated ? `<animate attributeName="opacity" values="0.2;0.95;0.5;0.95;0.2" keyTimes="0;0.25;0.5;0.75;1" dur="4.2s" begin="${s.delay}s" repeatCount="indefinite"/>` : ''}
    </path>
  `).join('');
}

// Garry sprite layer — TRANSPARENT PNG character on top of the static SVG bg.
// Only this group receives motion transforms. The bg + sparkles + stats stay
// fixed so the whole image doesn't shrink/grow together.
//
// We nest groups to "park" the transform pivot at floor center: outer group
// translates TO the pivot, inner animation runs at origin (so scale/rotate
// effectively pivot at that point), innermost group translates back so the
// image draws in its original world position.
function composeAiPose(dataUri, animated, _blinkUri, mood, { allFrames = null, currentMood = mood } = {}) {
  const w = VIEWBOX.w;
  const h = VIEWBOX.h;
  const pivotX = w / 2;
  const pivotY = h - 20;

  const spriteSize = Math.min(w, h) - 30;
  const spriteX = (w - spriteSize) / 2;
  const spriteY = pivotY - spriteSize + 6;

  const breath = animated ? `
    <animateTransform attributeName="transform" type="scale"
      values="1 1; 1.025 1.045; 1 1"
      keyTimes="0;0.5;1"
      dur="2.8s" repeatCount="indefinite" additive="sum"/>
    <animateTransform attributeName="transform" type="translate"
      values="0 0; 0 -6; 0 0"
      keyTimes="0;0.5;1"
      dur="2.8s" repeatCount="indefinite" additive="sum"/>
  ` : '';

  const sway = animated ? `
    <animateTransform attributeName="transform" type="rotate"
      values="-1.6; 1.6; -1.6"
      keyTimes="0;0.5;1"
      dur="5.6s" repeatCount="indefinite" additive="sum"/>
  ` : '';

  const hop = animated ? `
    <animateTransform attributeName="transform" type="translate"
      values="0 0; 0 0; 0 -14; 0 0; 0 0; 0 0; 0 0"
      keyTimes="0; 0.20; 0.24; 0.28; 0.32; 0.6; 1"
      dur="9s" repeatCount="indefinite" additive="sum"/>
  ` : '';

  // When allFrames is provided (playtest mode), stack every mood frame and
  // mark them with data-mood + visibility — client JS toggles which one is
  // visible without unmounting the SVG, so SMIL never resets.
  let images;
  if (allFrames) {
    images = Object.entries(allFrames).map(([m, uri]) => `
      <image href="${uri}"
             data-mood="${m}"
             class="garry-frame"
             x="${spriteX}" y="${spriteY}"
             width="${spriteSize}" height="${spriteSize}"
             preserveAspectRatio="xMidYMax meet"
             visibility="${m === currentMood ? 'visible' : 'hidden'}"/>
    `).join('');
  } else {
    images = `<image href="${dataUri}"
                     x="${spriteX}" y="${spriteY}"
                     width="${spriteSize}" height="${spriteSize}"
                     preserveAspectRatio="xMidYMax meet"/>`;
  }

  return `
    <g transform="translate(${pivotX} ${pivotY})">
      ${breath}
      ${sway}
      ${hop}
      <g transform="translate(${-pivotX} ${-pivotY})">
        ${images}
      </g>
    </g>
  `;
}

function composePose(mood) {
  const STROKE = `stroke="${COLORS.outline}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
  const THIN = `stroke="${COLORS.outline}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"`;
  const WHISKER = `stroke="${COLORS.outline}" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.55"`;
  const STRIPE = `stroke="${COLORS.stripe}" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.55"`;
  const TUFT = `stroke="${COLORS.outline}" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.55"`;

  // Layers, back-to-front:
  const tail = `<path d="${PATHS.tail}" fill="${COLORS.body}" ${STROKE}/>`;
  const body = `<path d="${PATHS.body}" fill="${COLORS.body}" ${STROKE}/>`;
  const belly = `<path d="${PATHS.belly}" fill="${COLORS.belly}" ${THIN}/>`;
  const bodyTufts = `<path d="${PATHS.bodyTufts}" ${TUFT}/>`;

  const paws = `
    <path d="${PATHS.pawL}" fill="${COLORS.belly}" ${THIN}/>
    <path d="${PATHS.pawR}" fill="${COLORS.belly}" ${THIN}/>
    ${PATHS.toeBeans.map(b => `<circle cx="${b.cx}" cy="${b.cy}" r="${b.r}" fill="${COLORS.nose}"/>`).join('')}
  `;

  // Tie hangs in front of belly but behind head/face.
  const tie = tieGroup();

  // Head silhouette already includes ears (single continuous outline).
  const head = `<path d="${PATHS.head}" fill="${COLORS.body}" ${STROKE}/>`;
  const earInnerL = `<path d="${PATHS.earInnerL}" fill="${COLORS.earInner}"/>`;
  const earInnerR = `<path d="${PATHS.earInnerR}" fill="${COLORS.earInner}"/>`;
  const earFluffL = `<path d="${PATHS.earFluffL}" ${TUFT}/>`;
  const earFluffR = `<path d="${PATHS.earFluffR}" ${TUFT}/>`;

  // Head stripes (subtle).
  const headStripes = `<path d="${PATHS.headStripes}" ${STRIPE}/>`;

  // Whiskers.
  const whiskers = `
    <path d="${PATHS.whiskersL}" ${WHISKER}/>
    <path d="${PATHS.whiskersR}" ${WHISKER}/>
  `;

  // Face features (vary by mood).
  const blush = (mood === 'sleep' || mood === 'grumpy' || mood === 'hungry')
    ? '' : blushSpots();
  const face = composeFace(mood);

  // Mood-specific extras.
  let extras = '';
  if (mood === 'ecstatic') {
    extras += `
      <g opacity="0.95">
        ${spark(120, 130, 18, COLORS.sparkleY)}
        ${spark(380, 110, 16, COLORS.sparkleP)}
        ${spark(60, 320, 12, COLORS.sparkleC)}
        ${spark(420, 320, 14, COLORS.sparkleY)}
      </g>`;
  }
  if (mood === 'sleep') extras += ZZZ;

  return `
    ${tail}
    ${body}
    ${bodyTufts}
    ${belly}
    ${paws}
    ${tie}
    ${head}
    ${earInnerL}${earFluffL}
    ${earInnerR}${earFluffR}
    ${headStripes}
    ${whiskers}
    ${blush}
    ${face}
    ${extras}
  `;
}

function spark(cx, cy, r, color) {
  const s = r * 0.3;
  return `<path d="M ${cx} ${cy - r} L ${cx + s} ${cy - s} L ${cx + r} ${cy} L ${cx + s} ${cy + s} L ${cx} ${cy + r} L ${cx - s} ${cy + s} L ${cx - r} ${cy} L ${cx - s} ${cy - s} Z" fill="${color}"/>`;
}

function composeFace(mood) {
  const stroke = `stroke="${COLORS.outline}" stroke-width="5" stroke-linecap="round" fill="none"`;
  const nose = `<path d="${NOSE}" fill="${COLORS.nose}" stroke="${COLORS.outline}" stroke-width="3" stroke-linejoin="round"/>${NOSE_HI}`;

  let eyes = '';
  let mouth = '';

  switch (mood) {
    case 'idle':
    case 'content':
      eyes = EYES.open();
      mouth = `<path d="${MOUTHS.omega}" ${stroke}/>`;
      break;
    case 'happy':
      eyes = EYES.happy();
      mouth = `<path d="${MOUTHS.smile}" ${stroke}/>`;
      break;
    case 'ecstatic':
      eyes = EYES.happy();
      mouth = `<path d="${MOUTHS.smile}" ${stroke}/>`;
      break;
    case 'hungry':
      eyes = EYES.sad();
      mouth = `<path d="${MOUTHS.open}" fill="${COLORS.mouth}" stroke="${COLORS.outline}" stroke-width="5" stroke-linejoin="round"/>`;
      break;
    case 'sleep':
    case 'blink':
      eyes = EYES.closed();
      mouth = `<path d="${MOUTHS.omega}" ${stroke}/>`;
      break;
    case 'lick':
      eyes = EYES.closed();
      mouth = `<path d="${MOUTHS.tongueOut}" fill="${COLORS.tongue}" stroke="${COLORS.outline}" stroke-width="5" stroke-linejoin="round"/>`;
      break;
    case 'grumpy':
      eyes = EYES.grumpy();
      mouth = `<path d="${MOUTHS.omega}" ${stroke}/>`;
      break;
    default:
      eyes = EYES.open();
      mouth = `<path d="${MOUTHS.omega}" ${stroke}/>`;
  }

  return `${eyes}${nose}${mouth}`;
}

function renderStats(state, w, h) {
  const padX = 22;
  const cardY = h;
  const moodLabel = (state.mood || 'content').toUpperCase();
  const last = state.lastAction || { user: null, action: 'born' };
  const lastTs = new Date(last.ts || state.lastTick || Date.now());
  const ago = relativeTime(lastTs);
  const banner = last.user
    ? `▸ ${shortName(last.user)} ${verbFor(last.action)} you · ${ago}`
    : `▸ click me to interact — no one for ${ago}`;

  // Header row — data-* attrs let client JS swap values without re-rendering.
  const header = `
    <rect x="0" y="${cardY}" width="${w}" height="${STATS_H}" fill="#211a16"/>
    <rect x="0" y="${cardY}" width="${w}" height="40" fill="#2c2520"/>
    <text x="${padX}" y="${cardY + 27}" font-size="22" fill="#ffd84a" font-weight="900" letter-spacing="4" font-family="ui-monospace, 'SF Mono', monospace">★ GARRY</text>
    <text data-garry="mood-label" x="${w - padX}" y="${cardY + 27}" font-size="13" fill="#9bd1ff" font-weight="800" text-anchor="end" letter-spacing="3" font-family="ui-monospace, 'SF Mono', monospace">MOOD · ${moodLabel}</text>
    <text data-garry="banner" x="${padX}" y="${cardY + 60}" font-size="13" fill="#f6e4b2" font-weight="700" font-family="ui-monospace, 'SF Mono', monospace">${escapeXml(banner)}</text>
  `;

  // Stat rows — 4 stats, each: icon + label + segmented bar + value
  const stats = [
    { key: 'hunger', label: 'HUNGER', icon: '🍣', color: '#f59a3a', warnColor: '#ff4a4a' },
    { key: 'happiness', label: 'JOY', icon: '❤', color: '#ef6c8c', warnColor: '#ff4a4a' },
    { key: 'energy', label: 'ENERGY', icon: '⚡', color: '#7fc7ea', warnColor: '#ff4a4a' },
    { key: 'affection', label: 'AFFECT', icon: '✦', color: '#b78bff', warnColor: '#ff4a4a' },
  ];

  const rowY0 = cardY + 78;
  const rowH = 36;
  const rowEls = stats.map((s, i) => {
    const v = Math.max(0, Math.min(100, state.stats?.[s.key] ?? 0));
    const isLow = v <= 25;
    const fillColor = isLow ? s.warnColor : s.color;
    const y = rowY0 + i * rowH;
    return renderStatRow(s, v, padX, y, w - padX * 2, fillColor, isLow);
  }).join('');

  return `
    <g id="hud">
      ${header}
      ${rowEls}
    </g>
  `;
}

function renderStatRow(stat, value, x, y, totalW, fillColor, isLow) {
  const iconW = 22;
  const labelW = 80;
  const valueW = 38;
  const barX = x + iconW + labelW + 6;
  const barW = totalW - iconW - labelW - valueW - 12;
  const segments = 12;
  const segGap = 2;
  const segW = (barW - segGap * (segments - 1)) / segments;
  const filled = Math.round((value / 100) * segments);

  // Tag each segment with data attrs so client JS can repaint without rerender.
  const segs = [];
  for (let i = 0; i < segments; i++) {
    const sx = barX + i * (segW + segGap);
    const active = i < filled;
    const pulse = active && isLow
      ? `><animate attributeName="opacity" values="0.5;1;0.5" dur="0.8s" repeatCount="indefinite"/></rect>`
      : '/>';
    segs.push(`<rect data-garry-seg="${stat.key}" data-seg-index="${i}" data-active-color="${stat.color}" data-warn-color="${stat.warnColor}" x="${sx}" y="${y + 6}" width="${segW}" height="14" rx="2" fill="${active ? fillColor : '#3a302a'}" stroke="${active ? fillColor : '#2a221d'}" stroke-width="1"${pulse}`);
  }

  return `
    <text x="${x + 2}" y="${y + 19}" font-size="18" fill="#f6e4b2" font-family="ui-monospace, monospace">${stat.icon}</text>
    <text x="${x + iconW + 4}" y="${y + 19}" font-size="12" fill="#cdb98a" font-weight="800" letter-spacing="2" font-family="ui-monospace, monospace">${stat.label}</text>
    ${segs.join('')}
    <text data-garry="stat-value" data-stat-key="${stat.key}" x="${x + totalW - 2}" y="${y + 19}" font-size="13" fill="${fillColor}" font-weight="900" text-anchor="end" font-family="ui-monospace, monospace">${value.toString().padStart(3, '0')}</text>
  `;
}

function relativeTime(date) {
  const diff = Date.now() - date.getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const hr = Math.floor(m / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

function verbFor(action) {
  return {
    pet: 'petted', feed: 'fed', play: 'played with',
    sleep: 'tucked in', treat: 'treated', born: 'awoke',
  }[action] || action;
}

function shortName(name) {
  const s = String(name || 'someone');
  return s.length > 14 ? s.slice(0, 13) + '…' : s;
}

function escapeXml(s) {
  return String(s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
}
