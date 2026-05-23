#!/usr/bin/env node
// Local playtest server.
//
// Spins up a tiny HTTP server that serves the rendered SVG and routes each
// "click" (pet/feed/play/treat/sleep) through the engine so you can play the
// whole game in your browser without pushing to GitHub.
//
// Usage:
//   node bin/playtest.js                # opens on http://localhost:3737
//   PORT=4000 node bin/playtest.js
//
// While running:
//   - http://localhost:3737/         → game page (auto-refreshing card)
//   - http://localhost:3737/garry.svg → rendered SVG
//   - http://localhost:3737/state    → state JSON
//   - http://localhost:3737/act/pet  → applies action and redirects to /
//   - http://localhost:3737/reset    → reseeds fresh state

import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderSVG } from '../src/render.js';
import { applyDecay, applyAction, seedState, moodToPose, ACTION_NAMES } from '../src/engine.js';

const PORT = Number(process.env.PORT) || 3737;
const ROOT = process.cwd();
const STATE_FILE = resolve(ROOT, 'state.json');

function loadState() {
  if (!existsSync(STATE_FILE)) return seedState();
  try { return JSON.parse(readFileSync(STATE_FILE, 'utf8')); }
  catch { return seedState(); }
}

function saveState(s) {
  writeFileSync(STATE_FILE, JSON.stringify(s, null, 2) + '\n');
}

function svgFor(state, { embedAllMoods = false } = {}) {
  return renderSVG({
    mood: moodToPose(state.mood),
    state,
    animated: true,
    baseUrl: `http://localhost:${PORT}`,
    embedAllMoods,
  });
}

// Stat metadata mirrored from render.js — used by the client JS payload.
const STAT_META = {
  hunger: { color: '#f59a3a', warn: '#ff4a4a', label: 'HUNGER' },
  happiness: { color: '#ef6c8c', warn: '#ff4a4a', label: 'JOY' },
  energy: { color: '#7fc7ea', warn: '#ff4a4a', label: 'ENERGY' },
  affection: { color: '#b78bff', warn: '#ff4a4a', label: 'AFFECT' },
};

function htmlPage(state, svg) {
  const stats = state.stats;
  // Inline the SVG so internal <a xlink:href> links fire normally (an <img>
  // tag would render the SVG but block link clicks). No meta-refresh, so SMIL
  // animations run uninterrupted until the user actually clicks an action.
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Garry — playtest</title>
  <style>
    body { background: #0d0a08; color: #f6e4b2; font-family: ui-monospace, monospace; margin: 0; padding: 24px; display: flex; flex-direction: column; align-items: center; gap: 16px; }
    h1 { font-size: 22px; letter-spacing: 4px; color: #ffd84a; margin: 0; }
    .hint { color: #c9b89a; font-size: 13px; opacity: 0.85; }
    .card { background: #1a1410; padding: 16px; border-radius: 16px; border: 2px solid #2c2520; max-width: 520px; }
    .card svg { display: block; max-width: 100%; height: auto; }
    .toolbar { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
    .toolbar a, .toolbar form button {
      color: #ffd84a; background: transparent; text-decoration: none;
      padding: 8px 14px; border: 1px solid #ffd84a; border-radius: 6px;
      font: inherit; cursor: pointer;
    }
    .toolbar a:hover, .toolbar form button:hover { background: #2c2520; }
    code { color: #9bd1ff; }
    .row { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
    .row a { padding: 6px 10px; border-radius: 6px; color: #1f1814; font-weight: 800; text-decoration: none; letter-spacing: 1px; font-size: 12px; }
    .pet { background: #ff7eb4; }
    .feed { background: #f59a3a; }
    .play { background: #b78bff; }
    .treat { background: #ffd84a; }
    .sleep { background: #7fc7ea; }
  </style>
</head>
<body>
  <h1>★ GARRY · PLAYTEST</h1>
  <div class="hint">click Garry or any button — animations keep running (no refresh)</div>
  <div class="card">
    ${svg}
  </div>
  <!-- HTML button row (redundant with in-SVG buttons; works even if browser blocks SVG internal links) -->
  <div class="row">
    <a class="pet"   href="/act/pet">🤚 PET</a>
    <a class="feed"  href="/act/feed">🍣 FEED</a>
    <a class="play"  href="/act/play">🧶 PLAY</a>
    <a class="treat" href="/act/treat">🍪 TREAT</a>
    <a class="sleep" href="/act/sleep">💤 SLEEP</a>
  </div>
  <div class="toolbar">
    <a href="/state">state.json</a>
    <a href="/reset">reset</a>
    <a href="/tick">force tick</a>
  </div>
  <div class="hint">
    mood <code data-status="mood">${state.mood}</code>  ·
    hunger <code data-status="hunger">${stats.hunger}</code>  ·
    joy <code data-status="happiness">${stats.happiness}</code>  ·
    energy <code data-status="energy">${stats.energy}</code>  ·
    affect <code data-status="affection">${stats.affection}</code>
  </div>
  <script>
    // === SENIOR-GRADE FLUID UI ===
    // Intercept all action links so the page never reloads. We POST to
    // /api/act/<name>, receive new state JSON, then patch the SVG/HUD in place.
    // SMIL animations keep running uninterrupted across actions.

    const STAT_META = ${JSON.stringify(STAT_META)};

    document.addEventListener('click', async (event) => {
      const a = event.target.closest('a');
      if (!a) return;
      const href = a.getAttribute('href') || a.getAttribute('xlink:href');
      if (!href) return;
      const m = href.match(/\\/act\\/([a-z]+)/);
      if (!m) return;
      event.preventDefault();
      try {
        const res = await fetch('/api/act/' + m[1], { method: 'POST' });
        if (!res.ok) throw new Error('action failed ' + res.status);
        const state = await res.json();
        applyState(state);
      } catch (e) {
        console.error('[garry]', e);
      }
    });

    function applyState(state) {
      // Toggle sprite frame — show only current mood's <image>
      const moodFrame = moodToPose(state.mood);
      document.querySelectorAll('.garry-frame').forEach(img => {
        img.setAttribute('visibility',
          img.getAttribute('data-mood') === moodFrame ? 'visible' : 'hidden');
      });

      // Update HUD mood badge + banner
      const moodLabel = document.querySelector('[data-garry="mood-label"]');
      if (moodLabel) moodLabel.textContent = 'MOOD · ' + state.mood.toUpperCase();
      const banner = document.querySelector('[data-garry="banner"]');
      if (banner && state.lastAction) {
        const verb = verbFor(state.lastAction.action);
        banner.textContent = '▸ ' + (state.lastAction.user || 'you') + ' ' + verb + ' you · just now';
      }

      // Update bottom hint pills
      for (const k of ['mood','hunger','happiness','energy','affection']) {
        const el = document.querySelector('[data-status="' + k + '"]');
        if (!el) continue;
        el.textContent = k === 'mood' ? state.mood : state.stats[k];
      }

      // Update each stat row (segments + value)
      for (const key of ['hunger','happiness','energy','affection']) {
        const v = Math.max(0, Math.min(100, state.stats[key]));
        const filled = Math.round((v / 100) * 12);
        const meta = STAT_META[key];
        const isLow = v <= 25;
        const fillColor = isLow ? meta.warn : meta.color;

        document.querySelectorAll('[data-garry-seg="' + key + '"]').forEach(seg => {
          const i = Number(seg.getAttribute('data-seg-index'));
          const active = i < filled;
          seg.setAttribute('fill', active ? fillColor : '#3a302a');
          seg.setAttribute('stroke', active ? fillColor : '#2a221d');
        });
        const vTxt = document.querySelector('[data-garry="stat-value"][data-stat-key="' + key + '"]');
        if (vTxt) {
          vTxt.textContent = String(v).padStart(3, '0');
          vTxt.setAttribute('fill', fillColor);
        }
      }
    }

    function moodToPose(mood) {
      return ({ content: 'idle' })[mood] || mood;
    }
    function verbFor(action) {
      return ({ pet: 'petted', feed: 'fed', play: 'played with',
                sleep: 'tucked in', treat: 'treated', born: 'awoke' })[action] || action;
    }
  </script>
</body>
</html>`;
}

function send(res, code, body, type = 'text/html; charset=utf-8') {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-cache, no-store, must-revalidate' });
  res.end(body);
}

function redirect(res, to) {
  res.writeHead(302, { Location: to });
  res.end();
}

createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let state = loadState();

  if (url.pathname === '/') {
    return send(res, 200, htmlPage(state, svgFor(state, { embedAllMoods: true })));
  }

  if (url.pathname.startsWith('/api/act/')) {
    const action = url.pathname.slice('/api/act/'.length).replace(/[^a-z]/g, '');
    if (!ACTION_NAMES.includes(action)) {
      return send(res, 400, JSON.stringify({ error: 'unknown action: ' + action }), 'application/json');
    }
    let s = loadState();
    s = applyDecay(s);
    s = applyAction(s, { action, user: url.searchParams.get('user') || 'you' });
    saveState(s);
    return send(res, 200, JSON.stringify(s), 'application/json');
  }

  if (url.pathname === '/garry.svg') {
    return send(res, 200, svgFor(state), 'image/svg+xml; charset=utf-8');
  }

  if (url.pathname === '/state') {
    return send(res, 200, JSON.stringify(state, null, 2), 'application/json');
  }

  if (url.pathname === '/reset') {
    state = seedState();
    saveState(state);
    return redirect(res, '/');
  }

  if (url.pathname === '/tick') {
    state = applyDecay(state);
    saveState(state);
    return redirect(res, '/');
  }

  if (url.pathname.startsWith('/act/')) {
    const action = url.pathname.slice('/act/'.length).replace(/[^a-z]/g, '');
    if (!ACTION_NAMES.includes(action)) {
      return send(res, 400, `unknown action: ${action}`);
    }
    state = applyDecay(state);
    state = applyAction(state, { action, user: url.searchParams.get('user') || 'you' });
    saveState(state);
    return redirect(res, '/');
  }

  send(res, 404, 'not found');
}).listen(PORT, () => {
  console.log(`[playtest] http://localhost:${PORT}`);
  console.log(`[playtest]   click Garry / buttons inside SVG → fires real actions`);
  console.log(`[playtest]   /reset · /tick · /state`);
});
