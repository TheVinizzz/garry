import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyDecay, applyAction, seedState, resolveMood, clamp } from '../src/engine.js';

test('clamp keeps stats in [0,100]', () => {
  assert.equal(clamp(150), 100);
  assert.equal(clamp(-20), 0);
  assert.equal(clamp(73.6), 74);
});

test('decay reduces stats proportionally to elapsed ticks', () => {
  const t0 = new Date('2026-05-23T00:00:00Z');
  const t1 = new Date('2026-05-23T01:00:00Z'); // 2 ticks (30 min each)
  const s = seedState(t0);
  const s1 = applyDecay(s, t1);
  // All stats should drop strictly between t0 and t1.
  assert.ok(s1.stats.hunger < s.stats.hunger);
  assert.ok(s1.stats.energy < s.stats.energy);
  assert.ok(s1.stats.happiness < s.stats.happiness);
  assert.ok(s1.stats.affection < s.stats.affection);
  // lastTick advances.
  assert.equal(new Date(s1.lastTick).getTime(), t1.getTime());
});

test('pet bumps affection and happiness', () => {
  const s = seedState();
  const s1 = applyAction(s, { action: 'pet', user: 'alice' });
  assert.ok(s1.stats.affection > s.stats.affection);
  assert.ok(s1.stats.happiness > s.stats.happiness);
  assert.equal(s1.lastAction.action, 'pet');
  assert.equal(s1.lastAction.user, 'alice');
  assert.equal(s1.history.length, 1);
});

test('unknown action throws', () => {
  const s = seedState();
  assert.throws(() => applyAction(s, { action: 'yeet', user: 'x' }));
});

test('low energy → sleep mood', () => {
  const s = seedState();
  s.stats.energy = 10;
  assert.equal(resolveMood(s), 'sleep');
});

test('low hunger → hungry mood', () => {
  const s = seedState();
  s.stats.energy = 80;
  s.stats.hunger = 15;
  assert.equal(resolveMood(s), 'hungry');
});

test('history is capped at 30 entries', () => {
  let s = seedState();
  for (let i = 0; i < 40; i++) {
    s = applyAction(s, { action: 'pet', user: `u${i}` });
  }
  assert.equal(s.history.length, 30);
  assert.equal(s.history[0].user, 'u39');
});
