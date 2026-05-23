// Garry's palette — silver tabby chonk + red striped tie.
// Kept small and harmonized; each value lives in one place so themes are easy.

export const PALETTE = {
  // Transparent / background
  '.': null,

  // Outline + shadows
  'K': '#1f1a17', // hard outline (near-black warm)
  'k': '#3a302a', // soft outline / deep shadow

  // Silver tabby coat
  'L': '#e6e6e6', // light highlight
  'M': '#c4c4c4', // mid base coat
  'D': '#8d8d8d', // dark stripe
  'S': '#5e5e5e', // deepest stripe / under-shadow

  // Belly / chest / paws — warm off-white
  'W': '#fafaf6',
  'w': '#e2ddd2',

  // Eyes — chartreuse green like reference
  'E': '#b9d469', // eye highlight rim
  'G': '#88b246', // eye iris
  'g': '#4f7224', // eye iris shadow
  'P': '#0d0d0d', // pupil

  // Nose + mouth
  'n': '#e5a3ad', // nose pink
  'N': '#b86978', // nose shadow
  'm': '#2a1f1c', // mouth/lip line

  // Inner ear blush
  'i': '#d99aa6',

  // Tie — red & white candy stripe
  'R': '#c4373d', // red stripe
  'r': '#a52a30', // red shadow
  'F': '#faeae8', // white stripe
  'f': '#d8c7c5', // white stripe shadow

  // Sparkle / accent (ecstatic mood, Zzz, etc.)
  'Y': '#ffe16a',
  'B': '#7ecbe8',

  // Whisker
  'h': '#fefefe',
};

// Resolve glyph -> hex (or null for transparent).
export function color(glyph) {
  return PALETTE[glyph] ?? null;
}
