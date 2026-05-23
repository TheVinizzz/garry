// Garry's pose definitions — procedural pixel art with hand-tuned primitives.

import { fillEllipse, strokeEllipse, fillRect, setPixel, line, getPixel } from './grid.js';

export const CANVAS = { w: 64, h: 64 };

const A = {
  bodyCx: 32, bodyCy: 47, bodyRx: 21, bodyRy: 13,
  chestCx: 32, chestCy: 48, chestRx: 9, chestRy: 9,
  headCx: 32, headCy: 26, headRx: 13, headRy: 11,
  eyeL: { x: 27, y: 26 }, eyeR: { x: 37, y: 26 },
  nose: { x: 32, y: 31 },
  tie: { x: 32, y: 39 },
  pawL: { x: 25, y: 59 }, pawR: { x: 39, y: 59 },
};

// ---------- BODY ----------

function drawBody(grid) {
  strokeEllipse(grid, A.bodyCx, A.bodyCy, A.bodyRx + 1, A.bodyRy + 1, 'K');
  fillEllipse(grid, A.bodyCx, A.bodyCy, A.bodyRx, A.bodyRy, 'M');
  // Lighter top
  fillEllipse(grid, A.bodyCx, A.bodyCy - 4, A.bodyRx - 3, A.bodyRy - 5, 'L');
  // Belly white
  fillEllipse(grid, A.chestCx, A.chestCy, A.chestRx, A.chestRy, 'W');
  fillEllipse(grid, A.chestCx, A.chestCy + 2, A.chestRx - 2, A.chestRy - 3, 'w');
  // Side stripes (vertical short tabs at flanks, not crossing belly)
  drawBodyStripes(grid);
}

function drawBodyStripes(grid) {
  // Vertical tabby stripes on flanks only (won't paint over belly white).
  const leftStripes = [[14, 42, 5], [17, 43, 5], [20, 42, 5]];
  const rightStripes = [[44, 42, 5], [47, 43, 5], [50, 42, 5]];
  for (const [x, y, len] of [...leftStripes, ...rightStripes]) {
    drawStripe(grid, x, y, len);
  }
  // Shoulder stripes (between head and body)
  for (const x of [27, 30, 33, 36]) {
    if (getPixel(grid, x, 38) === 'M' || getPixel(grid, x, 38) === 'L') setPixel(grid, x, 38, 'D');
    if (getPixel(grid, x, 39) === 'M' || getPixel(grid, x, 39) === 'L') setPixel(grid, x, 39, 'D');
  }
}

function drawStripe(grid, x, y, len) {
  for (let i = 0; i < len; i++) {
    const cur = getPixel(grid, x, y + i);
    if (cur === 'M' || cur === 'L') {
      setPixel(grid, x, y + i, 'D');
    }
  }
}

// ---------- TAIL ----------
function drawTail(grid) {
  // Curls along right side from body up.
  const pts = [
    [53, 50, 'M'], [54, 49, 'M'], [55, 47, 'M'], [55, 45, 'M'],
    [55, 43, 'M'], [54, 41, 'M'], [53, 39, 'M'], [52, 37, 'M'],
    [52, 35, 'M'], [53, 33, 'M'], [54, 32, 'L'],
  ];
  for (const [x, y, c] of pts) {
    // 3px-thick stroke around point
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        setPixel(grid, x + dx, y + dy, c);
      }
    }
  }
  // Outline pass (pixels on edge of run get K)
  for (const [x, y] of pts) {
    setPixel(grid, x - 2, y, 'K');
    setPixel(grid, x + 2, y, 'K');
  }
  // Tip dark
  setPixel(grid, 54, 31, 'K');
  setPixel(grid, 55, 32, 'K');
  // Tail rings (dark stripes)
  for (const [x, y] of [[55, 45], [53, 39], [52, 35]]) {
    setPixel(grid, x - 1, y, 'D');
    setPixel(grid, x, y, 'D');
    setPixel(grid, x + 1, y, 'D');
  }
}

// ---------- HEAD ----------
function drawHead(grid) {
  strokeEllipse(grid, A.headCx, A.headCy, A.headRx + 1, A.headRy + 1, 'K');
  fillEllipse(grid, A.headCx, A.headCy, A.headRx, A.headRy, 'M');
  fillEllipse(grid, A.headCx, A.headCy - 3, A.headRx - 4, A.headRy - 4, 'L');
  // White muzzle (smaller, around mouth/nose)
  fillEllipse(grid, A.headCx, A.headCy + 5, 6, 3, 'W');
  fillEllipse(grid, A.headCx, A.headCy + 6, 4, 1, 'w');
  drawForeheadM(grid);
  drawCheekStripes(grid);
}

function drawForeheadM(grid) {
  // Classic tabby M: two parallel arches descending to a central point.
  // Left arch (3 strokes side-by-side for thickness)
  const leftArch = [
    [25, 18], [25, 19], [26, 17], [26, 18], [27, 17], [28, 17], [28, 18], [29, 18], [29, 19],
  ];
  const rightArch = [
    [39, 18], [39, 19], [38, 17], [38, 18], [37, 17], [36, 17], [36, 18], [35, 18], [35, 19],
  ];
  // Inner V meeting at center
  const centerV = [
    [30, 19], [31, 20], [32, 21], [33, 20], [34, 19],
  ];
  for (const [x, y] of [...leftArch, ...rightArch, ...centerV]) {
    setPixel(grid, x, y, 'D');
  }
  // Darker shading on inner edges
  for (const [x, y] of [[26, 18], [38, 18], [32, 21]]) setPixel(grid, x, y, 'S');
  // Forehead lighter highlight between arches
  setPixel(grid, 32, 17, 'L');
  setPixel(grid, 32, 18, 'L');
}

function drawCheekStripes(grid) {
  for (const [x, y] of [[20, 26], [21, 26], [22, 26], [21, 27]]) setPixel(grid, x, y, 'D');
  for (const [x, y] of [[42, 26], [43, 26], [44, 26], [43, 27]]) setPixel(grid, x, y, 'D');
}

// ---------- EARS ----------
function drawEars(grid) {
  // Left ear: triangle with tip pointing up-left.
  drawEar(grid, { tipX: 19, tipY: 12, baseInnerX: 23, baseOuterX: 17, baseY: 19 });
  // Right ear
  drawEar(grid, { tipX: 45, tipY: 12, baseInnerX: 41, baseOuterX: 47, baseY: 19 });
}

function drawEar(grid, { tipX, tipY, baseInnerX, baseOuterX, baseY }) {
  // Fill triangle with mid-coat using scanline.
  const minX = Math.min(baseInnerX, baseOuterX, tipX);
  const maxX = Math.max(baseInnerX, baseOuterX, tipX);
  for (let y = tipY; y <= baseY; y++) {
    const t = (y - tipY) / (baseY - tipY);
    const xL = Math.round(tipX + (baseOuterX - tipX) * t);
    const xR = Math.round(tipX + (baseInnerX - tipX) * t);
    const lo = Math.min(xL, xR);
    const hi = Math.max(xL, xR);
    for (let x = lo; x <= hi; x++) setPixel(grid, x, y, 'M');
    setPixel(grid, lo, y, 'K');
    setPixel(grid, hi, y, 'K');
  }
  // Inner pink blush
  for (let y = tipY + 2; y <= baseY - 1; y++) {
    const t = (y - tipY) / (baseY - tipY);
    const xL = Math.round(tipX + (baseOuterX - tipX) * t);
    const xR = Math.round(tipX + (baseInnerX - tipX) * t);
    const lo = Math.min(xL, xR) + 1;
    const hi = Math.max(xL, xR) - 1;
    for (let x = lo; x <= hi; x++) setPixel(grid, x, y, 'i');
  }
  setPixel(grid, tipX, tipY, 'K');
}

// ---------- EYES ----------
function drawEyesOpen(grid) {
  for (const e of [A.eyeL, A.eyeR]) {
    // Eye socket — slightly rounded square
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        if (Math.abs(dx) + Math.abs(dy) <= 3) setPixel(grid, e.x + dx, e.y + dy, 'G');
      }
    }
    // Outline
    for (const [dx, dy] of [[-3,0],[3,0],[0,-3],[0,3],[-2,-2],[2,-2],[-2,2],[2,2]]) {
      setPixel(grid, e.x + dx, e.y + dy, 'K');
    }
    // Iris shade bottom
    for (let dx = -1; dx <= 1; dx++) setPixel(grid, e.x + dx, e.y + 1, 'g');
    // Top rim highlight
    for (let dx = -1; dx <= 1; dx++) setPixel(grid, e.x + dx, e.y - 2, 'E');
    // Vertical slit pupil
    setPixel(grid, e.x, e.y - 1, 'P');
    setPixel(grid, e.x, e.y, 'P');
    setPixel(grid, e.x, e.y + 1, 'P');
    // Catchlight
    setPixel(grid, e.x + 1, e.y - 1, 'W');
  }
}

function drawEyesClosed(grid) {
  for (const e of [A.eyeL, A.eyeR]) {
    // Closed-eye arch curve
    setPixel(grid, e.x - 3, e.y, 'K');
    setPixel(grid, e.x - 2, e.y - 1, 'K');
    setPixel(grid, e.x - 1, e.y - 1, 'K');
    setPixel(grid, e.x, e.y - 1, 'K');
    setPixel(grid, e.x + 1, e.y - 1, 'K');
    setPixel(grid, e.x + 2, e.y - 1, 'K');
    setPixel(grid, e.x + 3, e.y, 'K');
    // Lash hint
    setPixel(grid, e.x - 2, e.y, 'k');
    setPixel(grid, e.x + 2, e.y, 'k');
  }
}

function drawEyesHappy(grid) {
  for (const e of [A.eyeL, A.eyeR]) {
    // Upward-arc happy eyes ^_^
    setPixel(grid, e.x - 3, e.y + 1, 'K');
    setPixel(grid, e.x - 2, e.y, 'K');
    setPixel(grid, e.x - 1, e.y - 1, 'K');
    setPixel(grid, e.x, e.y - 2, 'K');
    setPixel(grid, e.x + 1, e.y - 1, 'K');
    setPixel(grid, e.x + 2, e.y, 'K');
    setPixel(grid, e.x + 3, e.y + 1, 'K');
    // Double-thick
    setPixel(grid, e.x - 1, e.y, 'K');
    setPixel(grid, e.x, e.y - 1, 'K');
    setPixel(grid, e.x + 1, e.y, 'K');
  }
}

function drawEyesSad(grid) {
  for (const e of [A.eyeL, A.eyeR]) {
    for (let dy = -1; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        if (Math.abs(dx) + Math.abs(dy) <= 2) setPixel(grid, e.x + dx, e.y + dy + 1, 'G');
      }
    }
    setPixel(grid, e.x, e.y, 'P');
    setPixel(grid, e.x, e.y + 1, 'P');
    // Droop lid
    for (let dx = -3; dx <= 3; dx++) setPixel(grid, e.x + dx, e.y - 1, 'k');
    for (let dx = -2; dx <= 2; dx++) setPixel(grid, e.x + dx, e.y, 'k');
  }
}

// ---------- NOSE / MOUTH ----------
function drawNose(grid) {
  const { x, y } = A.nose;
  setPixel(grid, x - 1, y, 'n');
  setPixel(grid, x, y, 'n');
  setPixel(grid, x + 1, y, 'n');
  setPixel(grid, x, y + 1, 'N');
  setPixel(grid, x - 1, y + 1, 'N');
  setPixel(grid, x + 1, y + 1, 'N');
}

function drawMouthNeutral(grid) {
  const { x, y } = A.nose;
  setPixel(grid, x, y + 2, 'm');
  setPixel(grid, x - 1, y + 3, 'm');
  setPixel(grid, x - 2, y + 3, 'm');
  setPixel(grid, x + 1, y + 3, 'm');
  setPixel(grid, x + 2, y + 3, 'm');
}

function drawMouthSmile(grid) {
  const { x, y } = A.nose;
  setPixel(grid, x, y + 2, 'm');
  for (const dx of [-1, -2, -3, 1, 2, 3]) setPixel(grid, x + dx, y + 3, 'm');
  setPixel(grid, x - 3, y + 2, 'm');
  setPixel(grid, x + 3, y + 2, 'm');
}

function drawMouthOpen(grid) {
  const { x, y } = A.nose;
  setPixel(grid, x, y + 2, 'm');
  for (let dx = -2; dx <= 2; dx++) setPixel(grid, x + dx, y + 3, 'm');
  for (let dx = -1; dx <= 1; dx++) setPixel(grid, x + dx, y + 4, 'N');
}

function drawTongue(grid) {
  const { x, y } = A.nose;
  setPixel(grid, x - 1, y + 4, 'n');
  setPixel(grid, x, y + 4, 'n');
  setPixel(grid, x + 1, y + 4, 'n');
  setPixel(grid, x, y + 5, 'N');
}

function drawWhiskers(grid) {
  // Left whiskers — three long strands
  for (const x of [16, 17, 18, 19, 20]) setPixel(grid, x, 30, 'h');
  for (const x of [14, 15, 16, 17, 18, 19]) setPixel(grid, x, 32, 'h');
  for (const x of [16, 17, 18, 19]) setPixel(grid, x, 34, 'h');
  // Right whiskers
  for (const x of [44, 45, 46, 47, 48]) setPixel(grid, x, 30, 'h');
  for (const x of [45, 46, 47, 48, 49, 50]) setPixel(grid, x, 32, 'h');
  for (const x of [45, 46, 47, 48]) setPixel(grid, x, 34, 'h');
}

// ---------- TIE ----------
function drawTie(grid) {
  const { x, y } = A.tie;
  // Knot — small rectangle at top
  for (let dy = -2; dy <= 0; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      setPixel(grid, x + dx, y + dy, 'R');
    }
  }
  // Knot outline
  for (const dx of [-3, 3]) for (let dy = -2; dy <= 0; dy++) setPixel(grid, x + dx, y + dy, 'K');
  for (let dx = -3; dx <= 3; dx++) setPixel(grid, x + dx, y - 3, 'K');
  // Body of tie — diamond stripes
  const shape = [
    [-3, 1, -3, 4],
    [-3, 2, -3, 5],
    [-3, 3, -3, 6],
    [-3, 4, -3, 7],
    [-3, 5, -3, 8],
    [-3, 6, -3, 9],
  ];
  // Just paint the tie body solidly and overlay diagonal stripes.
  const tieRows = [
    { dy: 1, half: 3 }, { dy: 2, half: 3 }, { dy: 3, half: 3 },
    { dy: 4, half: 3 }, { dy: 5, half: 3 }, { dy: 6, half: 3 },
    { dy: 7, half: 3 }, { dy: 8, half: 2 }, { dy: 9, half: 2 },
    { dy: 10, half: 1 }, { dy: 11, half: 1 },
  ];
  for (const { dy, half } of tieRows) {
    for (let dx = -half; dx <= half; dx++) setPixel(grid, x + dx, y + dy, 'R');
    setPixel(grid, x - half - 1, y + dy, 'K');
    setPixel(grid, x + half + 1, y + dy, 'K');
  }
  // Diagonal white stripes — every 3rd anti-diagonal becomes white
  for (const { dy, half } of tieRows) {
    for (let dx = -half; dx <= half; dx++) {
      if ((dx - dy + 90) % 3 === 0) setPixel(grid, x + dx, y + dy, 'F');
    }
  }
  // Tip
  setPixel(grid, x, y + 12, 'K');
}

// ---------- PAWS ----------
function drawPaws(grid, lickPose = false) {
  drawPaw(grid, A.pawL.x, A.pawL.y);
  if (lickPose) {
    drawPaw(grid, 30, 34); // raised toward face
  } else {
    drawPaw(grid, A.pawR.x, A.pawR.y);
  }
}

function drawPaw(grid, cx, cy) {
  // Soft mitten shape — rounded at corners, sits flush with body bottom.
  // Row -1: -2..2 white, no top outline (blends into body)
  // Row  0: -2..2 white
  // Row  1: -1..1 white (rounded bottom)
  // Outline only sides + bottom
  for (let dx = -2; dx <= 2; dx++) {
    setPixel(grid, cx + dx, cy - 1, 'W');
    setPixel(grid, cx + dx, cy, 'W');
  }
  for (let dx = -1; dx <= 1; dx++) setPixel(grid, cx + dx, cy + 1, 'W');
  // Bottom shading row
  for (let dx = -1; dx <= 1; dx++) setPixel(grid, cx + dx, cy, 'w');
  // Outline (sides + rounded bottom)
  setPixel(grid, cx - 3, cy - 1, 'K');
  setPixel(grid, cx - 3, cy, 'K');
  setPixel(grid, cx + 3, cy - 1, 'K');
  setPixel(grid, cx + 3, cy, 'K');
  setPixel(grid, cx - 2, cy + 1, 'K');
  setPixel(grid, cx + 2, cy + 1, 'K');
  for (let dx = -1; dx <= 1; dx++) setPixel(grid, cx + dx, cy + 2, 'K');
  // Faint toe lines on top
  setPixel(grid, cx - 1, cy - 1, 'w');
  setPixel(grid, cx + 1, cy - 1, 'w');
}

// ---------- SHADOW ----------
function drawShadow(grid) {
  for (let dx = -18; dx <= 18; dx++) {
    const a = Math.abs(dx);
    if (a < 12) setPixel(grid, 32 + dx, 62, 'k');
    else if (a < 16) setPixel(grid, 32 + dx, 62, 'K');
  }
}

// ---------- Accessories ----------
function drawSparkles(grid) {
  const spots = [[12, 16], [54, 18], [10, 38], [54, 50], [16, 56]];
  for (const [x, y] of spots) {
    setPixel(grid, x, y, 'Y');
    setPixel(grid, x - 1, y, 'Y');
    setPixel(grid, x + 1, y, 'Y');
    setPixel(grid, x, y - 1, 'Y');
    setPixel(grid, x, y + 1, 'Y');
  }
}

function drawZzz(grid) {
  const z = (x, y) => {
    setPixel(grid, x, y, 'B');
    setPixel(grid, x + 1, y, 'B');
    setPixel(grid, x + 2, y, 'B');
    setPixel(grid, x + 2, y + 1, 'B');
    setPixel(grid, x + 1, y + 2, 'B');
    setPixel(grid, x, y + 3, 'B');
    setPixel(grid, x + 1, y + 3, 'B');
    setPixel(grid, x + 2, y + 3, 'B');
  };
  z(50, 8);
  z(54, 12);
}

// ---------- POSES ----------
export const POSES = {
  idle(grid) {
    drawShadow(grid);
    drawTail(grid);
    drawBody(grid);
    drawTie(grid);
    drawPaws(grid);
    drawHead(grid);
    drawEars(grid);
    drawNose(grid);
    drawMouthNeutral(grid);
    drawEyesOpen(grid);
    drawWhiskers(grid);
  },
  blink(grid) {
    drawShadow(grid);
    drawTail(grid);
    drawBody(grid);
    drawTie(grid);
    drawPaws(grid);
    drawHead(grid);
    drawEars(grid);
    drawNose(grid);
    drawMouthNeutral(grid);
    drawEyesClosed(grid);
    drawWhiskers(grid);
  },
  happy(grid) {
    drawShadow(grid);
    drawTail(grid);
    drawBody(grid);
    drawTie(grid);
    drawPaws(grid);
    drawHead(grid);
    drawEars(grid);
    drawNose(grid);
    drawMouthSmile(grid);
    drawEyesHappy(grid);
    drawWhiskers(grid);
  },
  ecstatic(grid) {
    POSES.happy(grid);
    drawSparkles(grid);
  },
  hungry(grid) {
    drawShadow(grid);
    drawTail(grid);
    drawBody(grid);
    drawTie(grid);
    drawPaws(grid);
    drawHead(grid);
    drawEars(grid);
    drawNose(grid);
    drawMouthOpen(grid);
    drawEyesSad(grid);
    drawWhiskers(grid);
  },
  sleep(grid) {
    drawShadow(grid);
    drawTail(grid);
    drawBody(grid);
    drawTie(grid);
    drawPaws(grid);
    drawHead(grid);
    drawEars(grid);
    drawNose(grid);
    drawMouthNeutral(grid);
    drawEyesClosed(grid);
    drawWhiskers(grid);
    drawZzz(grid);
  },
  lick(grid) {
    drawShadow(grid);
    drawTail(grid);
    drawBody(grid);
    drawTie(grid);
    drawPaws(grid, true);
    drawHead(grid);
    drawEars(grid);
    drawNose(grid);
    drawTongue(grid);
    drawEyesClosed(grid);
    drawWhiskers(grid);
  },
  grumpy(grid) {
    drawShadow(grid);
    drawTail(grid);
    drawBody(grid);
    drawTie(grid);
    drawPaws(grid);
    drawHead(grid);
    drawEars(grid);
    drawNose(grid);
    drawMouthNeutral(grid);
    drawEyesSad(grid);
    drawWhiskers(grid);
  },
};
