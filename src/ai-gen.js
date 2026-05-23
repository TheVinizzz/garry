// OpenAI gpt-image-2 wrapper for generating Garry mood frames.
//
// Workflow:
//   1. generateBase() — generates the canonical Garry concept (silver tabby
//      chonky kawaii anime cat with red striped tie). Saved as concept.png.
//   2. generateMood(mood) — uses concept.png as reference via /v1/images/edits
//      endpoint with a mood-specific prompt. Saves to assets/frames/<mood>.png.
//
// All requests go directly to OpenAI HTTPS API (no SDK dependency).

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { Buffer } from 'node:buffer';

// Minimal .env loader (project-local only).
function loadDotEnv() {
  const p = resolve(process.cwd(), '.env');
  if (!existsSync(p)) return;
  for (const raw of readFileSync(p, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const k = line.slice(0, eq).trim();
    let v = line.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (process.env[k] === undefined) process.env[k] = v;
  }
}
loadDotEnv();

const API_BASE = 'https://api.openai.com/v1';
const MODEL = process.env.GARRY_MODEL || 'gpt-image-1';
const SIZE = process.env.GARRY_IMG_SIZE || '1024x1024';
const QUALITY = process.env.GARRY_IMG_QUALITY || 'high';

const ROOT = process.cwd();
const FRAMES_DIR = resolve(ROOT, 'assets/frames');
const FRAMES_OPT_DIR = resolve(ROOT, 'assets/frames-opt');
const CONCEPT_PATH = resolve(ROOT, 'assets/concept.png');

// Shared visual identity Garry must always carry. Keep tight and explicit so
// each render preserves the character.
const CHARACTER_BIBLE = `
A single character named Garry: a chonky silver-tabby cat with a fluffy round head,
big round anime-style eyes (chartreuse-green iris, vertical-slit pupils, glossy
white catchlights), tiny pink nose, soft pink blush spots on cheeks, white belly
and chest, white paws with three pink toe beans each, a curled fluffy tail, and
his signature accessory: a red-and-white candy-striped silk neck tie hanging in
the center of his chest. Style is chibi kawaii anime, soft cel-shaded with clean
black outlines, pastel rose-pink background, soft sparkles floating around.
Centered front-facing sitting pose. Studio-Ghibli-meets-Pixiv aesthetic.
`.trim();

const BASE_PROMPT = `
${CHARACTER_BIBLE}

Produce a clean, character-sheet style portrait of Garry sitting facing forward.
Neutral, content expression — eyes open and big, soft closed-lip smile. Painted
in chibi kawaii anime style with smooth gradient shading. Isolated character on a
fully TRANSPARENT background — no scenery, no backdrop, no sparkles, no shadows,
no decorative elements behind or around the cat. Just the character with clean
alpha-channel cutout edges. No text, no borders, no watermark.
`.trim();

const MOOD_PROMPTS = {
  idle: 'Big round anime eyes wide open, tiny content smile, gentle alert pose.',
  happy: 'Closed happy upturned-arc eyes (^_^), wide open-mouth smile, slightly tilted ears.',
  ecstatic: 'Closed happy eyes (^_^), open beaming smile — a small handful of yellow and pink sparkles ONLY ATTACHED to him (around his head, near his paws) — no large background sparkles. Keep the rest of the canvas transparent.',
  hungry: 'Sad droopy half-closed eyes with a small glistening tear at the corner, slightly open worried mouth, paw raised slightly. NO food bowl or other objects in the scene — character only.',
  sleep: 'Both eyes closed gently, peaceful sleeping face, soft sleepy smile, three light-blue "Z" letters floating up to the right above his head.',
  lick: 'Both eyes closed in concentration, small pink tongue sticking out doing a self-grooming lick, one front paw raised toward his face.',
  grumpy: 'Angry > < eyebrows, small narrow eyes, mouth in a small frown, slight pout — looks miffed but still cute.',
  blink: 'Both eyes shut in a single mid-blink frame, neutral mouth — exactly like the idle pose but eyes briefly closed.',
};

const ISOLATION_RULE = `
HARD RULE: render the character on a FULLY TRANSPARENT background. No backdrop,
no scenery, no floor shadow, no scattered background sparkles, no decorative
clouds, no gradient sky, no rectangle border. ONLY the cat (and any items
explicitly attached to him in the description) — every other pixel must be
fully transparent.
`.trim();

function envApiKey() {
  const key = process.env.API_KEY || process.env.OPENAI_API_KEY;
  if (!key) throw new Error('API_KEY (or OPENAI_API_KEY) env var is required. Add to .env');
  return key;
}

// Rough cost estimate per image at standard 1024x1024 (USD).
// Source: OpenAI gpt-image-2 pricing as of 2026-05.
const COST_PER_IMG = { low: 0.011, medium: 0.042, high: 0.167, auto: 0.167 };
function estimateCost(n) {
  return n * (COST_PER_IMG[QUALITY] ?? 0.07);
}

function ensureDir(p) {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

async function postJson(endpoint, body) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${envApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI ${endpoint} ${res.status}: ${err}`);
  }
  return res.json();
}

async function postForm(endpoint, form) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${envApiKey()}` },
    body: form,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI ${endpoint} ${res.status}: ${err}`);
  }
  return res.json();
}

function writeBase64Png(b64, outPath) {
  ensureDir(dirname(outPath));
  writeFileSync(outPath, Buffer.from(b64, 'base64'));
}

export async function generateBase({ overwrite = false } = {}) {
  if (existsSync(CONCEPT_PATH) && !overwrite) {
    console.log(`[ai-gen] concept exists at ${CONCEPT_PATH} — skipping (use --force to regen)`);
    return CONCEPT_PATH;
  }
  console.log(`[ai-gen] generating Garry concept (base) — model=${MODEL} quality=${QUALITY} size=${SIZE} est=$${(COST_PER_IMG[QUALITY] ?? 0.07).toFixed(2)}`);
  const data = await postJson('/images/generations', {
    model: MODEL,
    prompt: `${BASE_PROMPT}\n\n${ISOLATION_RULE}`,
    size: SIZE,
    quality: QUALITY,
    background: 'transparent',
    output_format: 'png',
    n: 1,
  });
  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) throw new Error(`No image in response: ${JSON.stringify(data).slice(0, 400)}`);
  writeBase64Png(b64, CONCEPT_PATH);
  console.log(`[ai-gen] wrote ${CONCEPT_PATH}`);
  return CONCEPT_PATH;
}

export async function generateMood(mood, { overwrite = false, quality = process.env.GARRY_MOOD_QUALITY || 'medium', referencePath = CONCEPT_PATH } = {}) {
  if (!MOOD_PROMPTS[mood]) {
    throw new Error(`Unknown mood: ${mood}. Known: ${Object.keys(MOOD_PROMPTS).join(', ')}`);
  }
  if (!existsSync(referencePath)) {
    if (referencePath === CONCEPT_PATH) await generateBase();
    else throw new Error(`Reference image not found: ${referencePath}`);
  }
  const outPath = resolve(FRAMES_DIR, `${mood}.png`);
  if (existsSync(outPath) && !overwrite) {
    console.log(`[ai-gen] ${mood}.png exists — skipping`);
    return outPath;
  }
  console.log(`[ai-gen] generating mood ${mood} (quality=${quality}, ref=${referencePath.split('/').slice(-2).join('/')})…`);

  // /v1/images/edits — pass reference for character identity preservation.
  const form = new FormData();
  form.append('model', MODEL);
  form.append('prompt', `${CHARACTER_BIBLE}

Keep the exact same character (Garry — silver tabby, red and white striped tie, big green anime eyes, same chibi proportions, same body shape). Only change pose and expression to:

${MOOD_PROMPTS[mood]}

${ISOLATION_RULE}

Maintain the kawaii anime chibi style. Centered front-facing pose. No text, no borders.`);
  form.append('size', SIZE);
  form.append('quality', quality);
  form.append('background', 'transparent');
  form.append('output_format', 'png');
  form.append('input_fidelity', 'high');
  const refBytes = readFileSync(referencePath);
  const refName = referencePath.split('/').pop();
  form.append('image', new Blob([refBytes], { type: 'image/png' }), refName);

  const data = await postForm('/images/edits', form);
  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) throw new Error(`No image in response: ${JSON.stringify(data).slice(0, 400)}`);
  writeBase64Png(b64, outPath);
  console.log(`[ai-gen] wrote ${outPath}`);
  return outPath;
}

export async function generateAll({ overwrite = false, budgetUsd = 1.0, moodQuality = process.env.GARRY_MOOD_QUALITY || 'medium' } = {}) {
  let spent = 0;
  if (!existsSync(CONCEPT_PATH) || overwrite) {
    const cost = COST_PER_IMG[QUALITY] ?? 0.07;
    if (spent + cost > budgetUsd) throw new Error(`budget guard: concept would exceed $${budgetUsd}`);
    await generateBase({ overwrite });
    spent += cost;
  } else {
    console.log(`[ai-gen] reusing existing concept (no spend).`);
  }
  const moodCost = COST_PER_IMG[moodQuality] ?? 0.04;
  const moods = Object.keys(MOOD_PROMPTS);
  for (const m of moods) {
    if (spent + moodCost > budgetUsd) {
      console.warn(`[ai-gen] budget guard hit at $${spent.toFixed(2)}/${budgetUsd} — stopping before ${m}`);
      break;
    }
    try {
      const before = Date.now();
      await generateMood(m, { overwrite, quality: moodQuality });
      spent += moodCost;
      console.log(`[ai-gen] ${m} ok — ${(Date.now() - before) / 1000}s · spent ~$${spent.toFixed(2)}`);
    } catch (e) {
      console.error(`[ai-gen] ${m} failed: ${e.message}`);
    }
  }
  console.log(`[ai-gen] done. est spend ~$${spent.toFixed(2)}.`);
}

// Prefer compact WebP (alpha preserved) for SVG embedding. Falls back to
// optimized PNG, then HD PNG, then JPEG.
export function framePath(mood) {
  const candidates = [
    resolve(FRAMES_OPT_DIR, `${mood}.webp`),
    resolve(FRAMES_OPT_DIR, `${mood}.png`),
    resolve(FRAMES_DIR, `${mood}.png`),
    resolve(FRAMES_OPT_DIR, `${mood}.jpg`),
  ];
  return candidates.find(p => existsSync(p)) ?? candidates[0];
}

export function hasFrame(mood) {
  return existsSync(framePath(mood));
}

export function readFrameDataUri(mood) {
  const p = framePath(mood);
  if (!existsSync(p)) return null;
  const bytes = readFileSync(p);
  const mime = p.endsWith('.webp') ? 'image/webp'
    : p.endsWith('.jpg') ? 'image/jpeg'
    : 'image/png';
  return `data:${mime};base64,${bytes.toString('base64')}`;
}
