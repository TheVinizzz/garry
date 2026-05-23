// Garry's state engine. Pure functions over a State value.
// State shape:
//   { name, born, stats: { hunger, happiness, energy, affection },
//     mood, lastTick, lastAction: {user, action, ts}, history: [] }

const STAT_KEYS = ['hunger', 'happiness', 'energy', 'affection'];
const MAX = 100;
const MIN = 0;

// Per-tick decay (tick = 30 minutes via cron).
// Tuned so a healthy Garry takes ~24h to bottom out — gives profile visitors
// enough variation without making him die overnight.
const DECAY = {
  hunger: -2,
  happiness: -1,
  energy: -2,
  affection: -1,
};

// Per-action effects.
const ACTIONS = {
  pet:   { affection: +18, happiness: +10, energy: -1 },
  feed:  { hunger: +30, happiness: +6, energy: +4 },
  play:  { happiness: +20, affection: +8, energy: -12, hunger: -6 },
  sleep: { energy: +40, hunger: -5, happiness: +4 },
  treat: { hunger: +12, happiness: +14, affection: +6 },
};

export const ACTION_NAMES = Object.keys(ACTIONS);

export function clamp(v) {
  return Math.max(MIN, Math.min(MAX, Math.round(v)));
}

export function average(state) {
  const s = state.stats;
  return (s.hunger + s.happiness + s.energy + s.affection) / 4;
}

// Apply decay between lastTick and now. Idempotent — caller passes `now`.
export function applyDecay(state, now = new Date()) {
  const last = new Date(state.lastTick);
  const elapsedMs = now.getTime() - last.getTime();
  const tickMs = 30 * 60 * 1000;
  const ticks = Math.max(0, elapsedMs / tickMs);
  if (ticks === 0) return state;

  const next = structuredClone(state);
  for (const k of STAT_KEYS) {
    next.stats[k] = clamp(next.stats[k] + DECAY[k] * ticks);
  }
  next.lastTick = now.toISOString();
  next.mood = resolveMood(next);
  return next;
}

export function applyAction(state, { action, user, payload = {} }, now = new Date()) {
  if (!ACTIONS[action]) {
    throw new Error(`Unknown action: ${action}. Known: ${ACTION_NAMES.join(', ')}`);
  }
  const next = structuredClone(state);
  const effects = ACTIONS[action];
  for (const [k, dv] of Object.entries(effects)) {
    next.stats[k] = clamp(next.stats[k] + dv);
  }
  const entry = {
    user: user ?? null,
    action,
    payload,
    ts: now.toISOString(),
    statsAfter: { ...next.stats },
  };
  next.lastAction = entry;
  next.history = [entry, ...(next.history || [])].slice(0, 30);
  next.mood = resolveMood(next);
  return next;
}

// Mood resolution — priority lowest-stat wins, then averages.
export function resolveMood(state) {
  const s = state.stats;
  if (s.energy <= 15) return 'sleep';
  if (s.hunger <= 20) return 'hungry';
  if (s.happiness <= 20) return 'grumpy';
  if (s.affection <= 20) return 'grumpy';
  const avg = average(state);
  if (avg >= 90) return 'ecstatic';
  if (avg >= 75) return 'happy';
  // Occasional lick — biased by cleanliness-proxy (affection)
  if (s.affection >= 80 && Math.random() < 0.15) return 'lick';
  if (avg >= 55) return 'content';
  return 'grumpy';
}

// Map mood string → animation pose key (same in our case).
export function moodToPose(mood) {
  const map = {
    sleep: 'sleep',
    hungry: 'hungry',
    grumpy: 'grumpy',
    ecstatic: 'ecstatic',
    happy: 'happy',
    content: 'idle',
    lick: 'lick',
  };
  return map[mood] ?? 'idle';
}

export function seedState(now = new Date()) {
  return {
    name: 'Garry',
    born: now.toISOString(),
    stats: { hunger: 80, happiness: 85, energy: 90, affection: 75 },
    mood: 'content',
    lastTick: now.toISOString(),
    lastAction: { user: null, action: 'born', ts: now.toISOString() },
    history: [],
  };
}
