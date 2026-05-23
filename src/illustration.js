// Garry — kawaii / chibi anime aesthetic.
// Key style targets, mined from the reference moodboard:
//   * Oversized round anime eyes with multiple sparkle highlights.
//   * Soft pastel coloring with white belly + warm tabby accent.
//   * Tiny pink "ω" mouth, button nose, blush cheek circles.
//   * Fluffy outline (subtle fur tufts on body + chest).
//   * Sparkles scattered around the canvas for the kawaii feel.

export const COLORS = {
  outline: '#2a2218',
  bodyTop: '#f1ecea',      // off-white fur top (kawaii cats are usually lighter)
  bodyShade: '#d7d1cd',
  body: '#eae3df',
  belly: '#ffffff',
  bellyShade: '#efe7e0',
  earInner: '#f6c7d1',
  earTip: '#f4a8b6',
  nose: '#f6a3b0',
  noseHi: '#ffd2db',
  mouth: '#3a2622',
  eyeOuter: '#1b1612',
  iris: '#7fbf52',
  irisShade: '#4e8a2c',
  irisHi: '#d6f0a4',
  catchlight: '#ffffff',
  blush: '#fbb7c5',
  tongue: '#f59aae',
  tieRed: '#cc3a40',
  tieRedShade: '#8e2126',
  tieWhite: '#fdebe9',
  sparkleY: '#ffe16a',
  sparkleP: '#f6b7d4',
  sparkleC: '#a8e0ff',
  zzz: '#83cce8',
  shadow: 'rgba(20,15,10,0.22)',
  stripe: '#bdb2ad',
};

export const VIEWBOX = { w: 480, h: 540 };
export const CENTER = { x: 240, y: 280 };

// ---------- Silhouette paths ----------
export const PATHS = {
  // Fluffy tail — single S-curve emerging from body right, tip wrapping forward.
  tail: `
    M 332 440
    C 376 442 416 432 430 396
    C 442 364 432 332 410 326
    C 388 324 372 348 386 366
    C 396 380 414 380 418 372
    C 416 396 392 414 360 416
    C 344 416 336 422 332 440
    Z
  `,

  // Combined head + ears silhouette as one continuous path so the outline
  // doesn't cut across ear bases. Traces:
  // bottom-left → left side up → left ear base → ear tip → ear base inner →
  // top of head → right ear base → tip → right ear base outer → down right
  // side → bottom right → back to start.
  head: `
    M 88 218
    C 88 296 144 332 240 332
    C 336 332 392 296 392 218
    C 392 178 374 144 344 122
    L 358 48
    L 280 118
    C 268 116 254 114 240 114
    C 226 114 212 116 200 118
    L 122 48
    L 136 122
    C 106 144 88 178 88 218
    Z
  `,

  // Small chibi body — narrower than head so head reads as dominant.
  body: `
    M 174 312
    C 154 332 130 376 136 422
    C 142 470 178 498 240 498
    C 302 498 338 470 344 422
    C 350 376 326 332 306 312
    Z
  `,

  // Ears now part of head silhouette. These ear paths are kept only for
  // inner blush shapes — outer stroke is handled by the head path itself.
  earL: null,
  earR: null,
  earInnerL: `
    M 148 116
    L 130 70
    L 200 116
    Z
  `,
  earInnerR: `
    M 332 116
    L 350 70
    L 280 116
    Z
  `,
  // Soft fluff tufts at base of ears.
  earFluffL: `
    M 158 116 C 150 110 144 110 138 116 C 144 124 154 126 162 122
  `,
  earFluffR: `
    M 322 116 C 330 110 336 110 342 116 C 336 124 326 126 318 122
  `,

  // White chest/belly (overlaid on body).
  belly: `
    M 240 340
    C 198 340 182 374 182 416
    C 182 462 208 490 240 490
    C 272 490 298 462 298 416
    C 298 374 282 340 240 340
    Z
  `,

  // Front paws — small ovals with pink toe beans.
  pawL: `
    M 188 478
    C 174 478 168 488 168 496
    C 168 504 176 510 192 510
    L 224 510
    C 234 510 240 504 240 494
    C 240 484 232 478 222 478
    Z
  `,
  pawR: `
    M 258 478
    C 248 478 240 484 240 494
    C 240 504 246 510 256 510
    L 288 510
    C 304 510 312 504 312 496
    C 312 488 306 478 292 478
    Z
  `,

  // Toe bean dots (pink) — three per paw.
  toeBeans: [
    { cx: 184, cy: 494, r: 4 }, { cx: 198, cy: 492, r: 4 }, { cx: 212, cy: 494, r: 4 },
    { cx: 268, cy: 494, r: 4 }, { cx: 282, cy: 492, r: 4 }, { cx: 296, cy: 494, r: 4 },
  ],

  // Tabby stripes — just three subtle tabs at top of head for cat-ness.
  headStripes: `
    M 200 96 C 208 110 210 130 204 142
    M 240 90 C 244 108 244 130 240 144
    M 280 96 C 272 110 270 130 276 142
  `,

  // Faint body fur tufts for soft fluffy look.
  bodyTufts: `
    M 150 408 q -6 6 -8 16
    M 152 442 q -8 8 -12 18
    M 330 408 q 6 6 8 16
    M 328 442 q 8 8 12 18
  `,

  // Whiskers — gentle curves, slight droop at tip for soft fluffy feel.
  whiskersL: `
    M 158 232 C 116 224 72 224 26 234
    M 158 246 C 108 246 60 254 18 266
    M 158 260 C 110 270 70 286 32 304
  `,
  whiskersR: `
    M 322 232 C 364 224 408 224 454 234
    M 322 246 C 372 246 420 254 462 266
    M 322 260 C 370 270 410 286 448 304
  `,
};

// ---------- Eyes ----------
// Anime-style: huge round shape (rx≈28, ry≈34), iris with two highlights
// for the signature sparkle. We split into open / happy / sad / closed
// variants and emit each as a complete <g>.
const EYE_GEOM = {
  cxL: 196, cxR: 284, cy: 218,
};

export const EYES = {
  open: () => {
    const eye = (cx) => `
      <ellipse cx="${cx}" cy="${EYE_GEOM.cy}" rx="32" ry="38" fill="${COLORS.bodyTop}" stroke="${COLORS.outline}" stroke-width="4"/>
      <ellipse cx="${cx}" cy="${EYE_GEOM.cy}" rx="22" ry="30" fill="${COLORS.eyeOuter}"/>
      <ellipse cx="${cx}" cy="${EYE_GEOM.cy + 4}" rx="18" ry="26" fill="${COLORS.iris}"/>
      <ellipse cx="${cx}" cy="${EYE_GEOM.cy + 10}" rx="14" ry="20" fill="${COLORS.irisShade}"/>
      <ellipse cx="${cx}" cy="${EYE_GEOM.cy}" rx="6" ry="26" fill="${COLORS.eyeOuter}"/>
      <ellipse cx="${cx - 8}" cy="${EYE_GEOM.cy - 10}" rx="6" ry="9" fill="${COLORS.catchlight}"/>
      <ellipse cx="${cx + 8}" cy="${EYE_GEOM.cy + 8}" rx="3" ry="4" fill="${COLORS.catchlight}"/>
      <ellipse cx="${cx - 10}" cy="${EYE_GEOM.cy + 16}" rx="2.4" ry="3" fill="${COLORS.catchlight}"/>
    `;
    return `<g>${eye(EYE_GEOM.cxL)}${eye(EYE_GEOM.cxR)}</g>`;
  },
  closed: () => {
    const lash = (cx) => `
      <path d="M ${cx - 22} ${EYE_GEOM.cy + 4} Q ${cx} ${EYE_GEOM.cy - 18} ${cx + 22} ${EYE_GEOM.cy + 4}" stroke="${COLORS.outline}" stroke-width="6" fill="none" stroke-linecap="round"/>
    `;
    return `<g>${lash(EYE_GEOM.cxL)}${lash(EYE_GEOM.cxR)}</g>`;
  },
  happy: () => {
    // Classic ^ ^ but with extra-thick stroke for kawaii.
    const arch = (cx) => `
      <path d="M ${cx - 22} ${EYE_GEOM.cy + 10} Q ${cx} ${EYE_GEOM.cy - 22} ${cx + 22} ${EYE_GEOM.cy + 10}" stroke="${COLORS.outline}" stroke-width="7" fill="none" stroke-linecap="round"/>
    `;
    return `<g>${arch(EYE_GEOM.cxL)}${arch(EYE_GEOM.cxR)}</g>`;
  },
  sad: () => {
    const eye = (cx) => `
      <ellipse cx="${cx}" cy="${EYE_GEOM.cy + 6}" rx="28" ry="20" fill="${COLORS.bodyTop}" stroke="${COLORS.outline}" stroke-width="4"/>
      <ellipse cx="${cx}" cy="${EYE_GEOM.cy + 12}" rx="18" ry="13" fill="${COLORS.iris}"/>
      <ellipse cx="${cx}" cy="${EYE_GEOM.cy + 14}" rx="5" ry="9" fill="${COLORS.eyeOuter}"/>
      <ellipse cx="${cx - 6}" cy="${EYE_GEOM.cy + 4}" rx="3" ry="4" fill="${COLORS.catchlight}"/>
      <path d="M ${cx - 28} ${EYE_GEOM.cy - 4} Q ${cx} ${EYE_GEOM.cy + 6} ${cx + 28} ${EYE_GEOM.cy - 4}" stroke="${COLORS.outline}" stroke-width="6" fill="none" stroke-linecap="round"/>
    `;
    return `<g>${eye(EYE_GEOM.cxL)}${eye(EYE_GEOM.cxR)}</g>`;
  },
  grumpy: () => {
    // > <  vibe — angled eyebrows + small eyes.
    const eye = (cx, brow) => `
      <ellipse cx="${cx}" cy="${EYE_GEOM.cy + 4}" rx="14" ry="10" fill="${COLORS.eyeOuter}"/>
      <path d="${brow}" stroke="${COLORS.outline}" stroke-width="7" fill="none" stroke-linecap="round"/>
    `;
    return `<g>
      ${eye(EYE_GEOM.cxL, `M ${EYE_GEOM.cxL - 24} ${EYE_GEOM.cy - 22} L ${EYE_GEOM.cxL + 18} ${EYE_GEOM.cy - 8}`)}
      ${eye(EYE_GEOM.cxR, `M ${EYE_GEOM.cxR - 18} ${EYE_GEOM.cy - 8} L ${EYE_GEOM.cxR + 24} ${EYE_GEOM.cy - 22}`)}
    </g>`;
  },
};

// ---------- Face details ----------
export const NOSE = `
  M 232 252
  Q 240 246 248 252
  Q 244 264 240 266
  Q 236 264 232 252
  Z
`;

export const NOSE_HI = `<ellipse cx="237" cy="254" rx="2.5" ry="1.5" fill="${COLORS.noseHi}"/>`;

export const MOUTHS = {
  // Tiny "ω" mouth (chibi default) — larger, more readable.
  omega: `
    M 226 272 Q 232 286 240 278 Q 248 286 254 272
  `,
  smile: `
    M 220 270 Q 232 292 240 280 Q 248 292 260 270
  `,
  open: `
    M 226 272 Q 240 296 254 272 L 250 288 Q 240 300 230 288 Z
  `,
  tongueOut: `
    M 224 270 Q 240 286 256 270
    M 232 282 Q 240 304 248 282 Z
  `,
};

// Blush cheek circles.
export function blushSpots() {
  return `
    <ellipse cx="132" cy="252" rx="20" ry="11" fill="${COLORS.blush}" opacity="0.75"/>
    <ellipse cx="348" cy="252" rx="20" ry="11" fill="${COLORS.blush}" opacity="0.75"/>
  `;
}

// ---------- Tie ----------
export function tieGroup() {
  const knotPath = "M 218 308 L 262 308 L 256 336 L 224 336 Z";
  const bodyPath = "M 224 336 L 256 336 L 270 408 L 240 438 L 210 408 Z";
  const stripes = [];
  for (let i = -7; i <= 14; i++) {
    const x = 200 + i * 12;
    stripes.push(`<line x1="${x}" y1="320" x2="${x + 50}" y2="450" stroke="${COLORS.tieWhite}" stroke-width="5" stroke-linecap="round"/>`);
  }
  return `
    <defs>
      <clipPath id="tieClip">
        <path d="${bodyPath} ${knotPath}"/>
      </clipPath>
    </defs>
    <path d="${knotPath}" fill="${COLORS.tieRed}"/>
    <path d="${bodyPath}" fill="${COLORS.tieRed}"/>
    <g clip-path="url(#tieClip)">${stripes.join('')}</g>
    <path d="${bodyPath}" fill="none" stroke="${COLORS.outline}" stroke-width="4" stroke-linejoin="round"/>
    <path d="${knotPath}" fill="none" stroke="${COLORS.outline}" stroke-width="4" stroke-linejoin="round"/>
  `;
}

// ---------- Sparkle accent shapes ----------
function fourPointStar(cx, cy, r, color) {
  const small = r * 0.32;
  return `<path d="M ${cx} ${cy - r} L ${cx + small} ${cy - small} L ${cx + r} ${cy} L ${cx + small} ${cy + small} L ${cx} ${cy + r} L ${cx - small} ${cy + small} L ${cx - r} ${cy} L ${cx - small} ${cy - small} Z" fill="${color}"/>`;
}

export function sparkleField(seed = 1) {
  const spots = [
    [70, 110, 14, COLORS.sparkleP],
    [410, 90, 11, COLORS.sparkleY],
    [50, 270, 9, COLORS.sparkleC],
    [430, 250, 10, COLORS.sparkleP],
    [80, 420, 8, COLORS.sparkleY],
    [420, 410, 13, COLORS.sparkleC],
    [40, 180, 6, COLORS.sparkleY],
    [440, 350, 7, COLORS.sparkleP],
  ];
  return `<g opacity="0.95">${spots.map(([x, y, r, c]) => fourPointStar(x, y, r, c)).join('')}</g>`;
}

export const ZZZ = `
  <g fill="${COLORS.zzz}" stroke="${COLORS.outline}" stroke-width="2" font-family="ui-rounded, system-ui, sans-serif" font-weight="900">
    <text x="370" y="100" font-size="28">z</text>
    <text x="400" y="140" font-size="36">Z</text>
    <text x="440" y="170" font-size="46">Z</text>
  </g>
`;
