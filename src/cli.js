// Garry CLI — used by GitHub Actions and locally.
//
// Usage:
//   node src/cli.js tick                          # apply decay, refresh render
//   node src/cli.js render                        # re-render only
//   node src/cli.js act <action> [user] [payload] # apply action
//
// Environment:
//   GARRY_REPO=user/repo   used to build issue links in README

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderSVG } from './render.js';
import { applyDecay, applyAction, seedState, moodToPose } from './engine.js';
import { injectBlock, statusBlock } from './readme.js';

const ROOT = process.cwd();
const STATE_FILE = resolve(ROOT, 'state.json');
const SVG_FILE = resolve(ROOT, 'garry.svg');
const README_FILE = resolve(ROOT, 'README.md');

function loadState() {
  if (!existsSync(STATE_FILE)) return seedState();
  return JSON.parse(readFileSync(STATE_FILE, 'utf8'));
}

function saveState(state) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n');
}

function renderAll(state) {
  const pose = moodToPose(state.mood);
  const svg = renderSVG({ mood: pose, state, animated: true });
  writeFileSync(SVG_FILE, svg);
  if (existsSync(README_FILE)) {
    const readme = readFileSync(README_FILE, 'utf8');
    const block = statusBlock(state, { repo: process.env.GARRY_REPO, svgPath: 'garry.svg' });
    writeFileSync(README_FILE, injectBlock(readme, block));
  }
}

function main() {
  const [, , cmd, ...args] = process.argv;
  let state = loadState();

  switch (cmd) {
    case 'tick': {
      state = applyDecay(state);
      saveState(state);
      renderAll(state);
      console.log(`[garry] tick — mood=${state.mood} stats=${JSON.stringify(state.stats)}`);
      break;
    }
    case 'render': {
      renderAll(state);
      console.log(`[garry] rendered mood=${state.mood}`);
      break;
    }
    case 'act': {
      const [action, user, ...rest] = args;
      if (!action) throw new Error('act requires <action>');
      state = applyDecay(state);
      state = applyAction(state, { action, user, payload: rest.join(' ') || null });
      saveState(state);
      renderAll(state);
      console.log(`[garry] ${user || 'anon'} → ${action} · mood=${state.mood}`);
      break;
    }
    case 'seed': {
      state = seedState();
      saveState(state);
      renderAll(state);
      console.log('[garry] seeded fresh state');
      break;
    }
    default:
      console.error('usage: cli.js <tick|render|act|seed> [...]');
      process.exit(1);
  }
}

main();
