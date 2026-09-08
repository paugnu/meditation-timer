import assert from 'node:assert/strict';
import test from 'node:test';
import { formatTime, idleTimer, remaining, restoreTimer, transition } from '../src/timer';
import { defaults, restoreSettings } from '../src/settings';

test('counts against a deadline across delayed ticks and background suspension', () => {
  const timer = transition(idleTimer(20), { type: 'start', now: 1000 });
  assert.equal(remaining(timer, 101000), 1100000);
  assert.equal(remaining(timer, 1201001), 0);
  assert.equal(transition(timer, { type: 'tick', now: 1201001 }).status, 'completed');
});
test('pause keeps exact milliseconds, resume sets a fresh deadline', () => {
  const start = transition(idleTimer(1), { type: 'start', now: 1000 });
  const paused = transition(start, { type: 'pause', now: 25500 });
  assert.equal(paused.remainingMs, 35500);
  assert.equal(remaining(paused, 900000), 35500);
  const resumed = transition(paused, { type: 'start', now: 900000 });
  assert.equal(resumed.endsAt, 935500);
});
test('double start does not extend a running session', () => {
  const start = transition(idleTimer(1), { type: 'start', now: 1000 });
  assert.deepEqual(transition(start, { type: 'start', now: 2000 }), start);
});
test('reset cancels a running session and uses the selected duration', () => {
  const state = transition(idleTimer(1), { type: 'start', now: 0 });
  assert.deepEqual(transition(state, { type: 'reset', minutes: 30 }), idleTimer(30));
});
test('restore recovers future, paused, and expired sessions', () => {
  const running = transition(idleTimer(1), { type: 'start', now: 1000 });
  assert.equal(remaining(restoreTimer(running, 20, 31000), 31000), 30000);
  assert.equal(restoreTimer(running, 20, 61000).status, 'completed');
  const paused = transition(running, { type: 'pause', now: 3000 });
  assert.deepEqual(restoreTimer(paused, 20, 999999), paused);
});
test('corrupt or nonfinite persisted values fall back to a safe state', () => {
  for (const value of [null, {}, { status: 'running', durationMs: 60000, remainingMs: 1000, endsAt: NaN }, { ...idleTimer(1), durationMs: -1 }, { ...idleTimer(1), remainingMs: '100' }, { ...idleTimer(1), status: 'invalid' }]) {
    assert.deepEqual(restoreTimer(value, 20, 0), idleTimer(20));
  }
});
test('completion is idempotent and can be restarted', () => {
  const running = transition(idleTimer(1), { type: 'start', now: 1000 });
  const completed = transition(running, { type: 'tick', now: 70000 });
  assert.equal(transition(completed, { type: 'tick', now: 80000 }), completed);
  assert.equal(transition(completed, { type: 'start', now: 80000 }).endsAt, 140000);
});
test('pause at the deadline completes instead of creating a zero-time pause', () => {
  const running = transition(idleTimer(1), { type: 'start', now: 0 });
  assert.equal(transition(running, { type: 'pause', now: 60000 }).status, 'completed');
});
test('formatting rounds up so zero is only shown on completion', () => {
  assert.equal(formatTime(1), '00:01');
  assert.equal(formatTime(60000), '01:00');
  assert.equal(formatTime(10800000), '180:00');
  assert.equal(formatTime(-50), '00:00');
});
test('settings validate duration, colors, flags, and volume', () => {
  assert.deepEqual(restoreSettings(null), defaults);
  const settings = restoreSettings({ minutes: 999, volume: -5, color: 'red', theme: 'other', gong: 'false' });
  assert.equal(settings.minutes, 180); assert.equal(settings.volume, 0);
  assert.equal(settings.color, defaults.color); assert.equal(settings.gong, true);
  assert.equal(restoreSettings({ minutes: NaN, volume: Infinity }).minutes, 20);
});
