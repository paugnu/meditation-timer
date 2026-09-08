import assert from 'node:assert/strict';
import test from 'node:test';
import { finishSession, formatMeditated, restoreActiveSession, restoreHistory } from '../src/history';
import { idleTimer, transition } from '../src/timer';
import { restoreSettings } from '../src/settings';
const session = { id: 'session-1', startedAt: 1000 };

test('journal excludes paused time and records an early finish', () => {
  const running = transition(idleTimer(1), { type: 'start', now: 1000 });
  const paused = transition(running, { type: 'pause', now: 11000 });
  const resumed = transition(paused, { type: 'start', now: 100000 });
  const records = finishSession([], session, resumed, 105000);
  assert.equal(records[0].durationMs, 15000);
  assert.equal(records[0].completed, false);
  assert.equal(records[0].endedAt, 105000);
});
test('expired session records its deadline even when reopened hours later', () => {
  const running = transition(idleTimer(1), { type: 'start', now: 1000 });
  const records = finishSession([], session, running, 999999);
  assert.equal(records[0].durationMs, 60000);
  assert.equal(records[0].endedAt, 61000);
  assert.equal(records[0].completed, true);
  assert.equal(finishSession(records, session, running, 1000000), records);
});
test('finishing while paused does not count the pause', () => {
  const running = transition(idleTimer(1), { type: 'start', now: 1000 });
  const paused = transition(running, { type: 'pause', now: 21000 });
  assert.equal(finishSession([], session, paused, 999999)[0].durationMs, 20000);
});
test('idle, missing metadata, and accidental subsecond sessions are not logged', () => {
  const running = transition(idleTimer(1), { type: 'start', now: 1000 });
  assert.deepEqual(finishSession([], session, idleTimer(1), 2000), []);
  assert.deepEqual(finishSession([], null, running, 2000), []);
  assert.deepEqual(finishSession([], session, running, 1500), []);
});
test('restoration rejects corrupt records and removes duplicate ids', () => {
  const running = transition(idleTimer(1), { type: 'start', now: 1000 });
  const [record] = finishSession([], session, running, 61000);
  assert.deepEqual(restoreHistory([null, {}, record, record, { ...record, id: 'bad', durationMs: Infinity }]), [record]);
  assert.equal(restoreActiveSession({ id: 'bad', startedAt: NaN }), null);
  assert.equal(restoreActiveSession({ id: 'bad', startedAt: 9e15 }), null);
});
test('totals include hours, minutes, seconds without rounding up meditation time', () => {
  assert.equal(formatMeditated(0), '0 min');
  assert.equal(formatMeditated(59999), '59 s');
  assert.equal(formatMeditated(3661000), '1 h 1 min 1 s');
});
test('old final-gong setting is preserved with independent start-gong setting', () => {
  assert.equal(restoreSettings({ gong: false }).gong, false);
  assert.equal(restoreSettings({ gong: false }).gongStart, false);
  assert.equal(restoreSettings({ gong: false, gongStart: true }).gongStart, true);
});
