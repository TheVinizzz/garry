// Pixel grid primitives. All operations are integer-aligned for crisp pixel art.

export function createGrid(w, h) {
  const cells = new Array(h);
  for (let y = 0; y < h; y++) cells[y] = new Array(w).fill('.');
  return { w, h, cells };
}

export function inBounds(grid, x, y) {
  return x >= 0 && x < grid.w && y >= 0 && y < grid.h;
}

export function setPixel(grid, x, y, glyph) {
  if (inBounds(grid, x, y)) grid.cells[y][x] = glyph;
}

export function getPixel(grid, x, y) {
  return inBounds(grid, x, y) ? grid.cells[y][x] : '.';
}

export function fillRect(grid, x, y, w, h, glyph) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      setPixel(grid, x + dx, y + dy, glyph);
    }
  }
}

// Bresenham-ish filled ellipse.
export function fillEllipse(grid, cx, cy, rx, ry, glyph) {
  if (rx < 1 || ry < 1) return;
  const rx2 = rx * rx;
  const ry2 = ry * ry;
  for (let y = -ry; y <= ry; y++) {
    const xRange = Math.floor(Math.sqrt(rx2 * (1 - (y * y) / ry2)));
    for (let x = -xRange; x <= xRange; x++) {
      setPixel(grid, cx + x, cy + y, glyph);
    }
  }
}

// Hollow ellipse: 1px outline.
export function strokeEllipse(grid, cx, cy, rx, ry, glyph) {
  if (rx < 1 || ry < 1) return;
  const rx2 = rx * rx;
  const ry2 = ry * ry;
  for (let y = -ry; y <= ry; y++) {
    const inner = Math.floor(Math.sqrt(Math.max(0, (rx - 1) * (rx - 1) * (1 - (y * y) / ry2))));
    const outer = Math.floor(Math.sqrt(Math.max(0, rx2 * (1 - (y * y) / ry2))));
    setPixel(grid, cx - outer, cy + y, glyph);
    setPixel(grid, cx + outer, cy + y, glyph);
    if (y === -ry || y === ry) {
      for (let x = -outer; x <= outer; x++) setPixel(grid, cx + x, cy + y, glyph);
    }
  }
}

// Bresenham line.
export function line(grid, x0, y0, x1, y1, glyph) {
  let dx = Math.abs(x1 - x0);
  let dy = -Math.abs(y1 - y0);
  let sx = x0 < x1 ? 1 : -1;
  let sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  while (true) {
    setPixel(grid, x0, y0, glyph);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}

// Stamp a sub-grid (string array) at (x, y), skipping '.' cells.
export function stamp(grid, x, y, stampGrid) {
  for (let dy = 0; dy < stampGrid.length; dy++) {
    const row = stampGrid[dy];
    for (let dx = 0; dx < row.length; dx++) {
      const ch = row[dx];
      if (ch !== '.') setPixel(grid, x + dx, y + dy, ch);
    }
  }
}

// Run-length encode rows for compact SVG output:
// returns [{ x, y, w, glyph }] horizontal spans of same color.
export function toSpans(grid) {
  const spans = [];
  for (let y = 0; y < grid.h; y++) {
    let runStart = -1;
    let runGlyph = '.';
    for (let x = 0; x < grid.w; x++) {
      const ch = grid.cells[y][x];
      if (ch === runGlyph) continue;
      if (runStart >= 0 && runGlyph !== '.') {
        spans.push({ x: runStart, y, w: x - runStart, glyph: runGlyph });
      }
      runStart = x;
      runGlyph = ch;
    }
    if (runStart >= 0 && runGlyph !== '.') {
      spans.push({ x: runStart, y, w: grid.w - runStart, glyph: runGlyph });
    }
  }
  return spans;
}
