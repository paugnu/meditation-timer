import test from 'node:test';
import assert from 'node:assert/strict';
import { brightnessController, BrightnessDriver } from '../src/brightness';
import { defaults, restoreSettings } from '../src/settings';

function device(level = .8) {
  const writes: number[] = [], restored: number[] = [];
  let failures = 0;
  const driver: BrightnessDriver = {
    capture: async () => ({ level, system: true }),
    set: async value => { writes.push(value); },
    restore: async snapshot => { restored.push(snapshot.level); },
  };
  return { driver, writes, restored, failed: () => { failures++; }, failures: () => failures };
}
test('dimming is opt-in and corrupt or old preferences stay safe', () => {
  assert.equal(defaults.dimScreen, false);
  for (const dimScreen of [undefined, null, 'true', 1, {}]) assert.equal(restoreSettings({ dimScreen }).dimScreen, false);
  assert.equal(restoreSettings({ dimScreen: true }).dimScreen, true);
});
test('dimming restores the captured brightness once and never brightens a dark screen', async () => {
  for (const level of [.8, .05, 0]) {
    const d = device(level), change = brightnessController(d.driver, d.failed);
    await change(true); await change(true); await change(false); await change(false);
    assert.deepEqual(d.writes, [Math.min(level, .12)]);
    assert.deepEqual(d.restored, [level]);
  }
});
test('a wake during capture cancels the stale dim before it can touch brightness', async () => {
  const d = device(); let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  d.driver.capture = async () => { await gate; return { level: .7, system: false }; };
  const change = brightnessController(d.driver, d.failed);
  const dim = change(true); await Promise.resolve();
  const wake = change(false); release(); await Promise.all([dim, wake]);
  assert.deepEqual(d.writes, []); assert.deepEqual(d.restored, []);
});
test('a pause during a native dim write restores only after that write lands', async () => {
  const d = device(); let release!: () => void, started!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const writing = new Promise<void>(resolve => { started = resolve; });
  const calls: string[] = [];
  d.driver.set = async () => { started(); await gate; calls.push('dim'); };
  d.driver.restore = async () => { calls.push('restore'); };
  const change = brightnessController(d.driver, d.failed);
  const dim = change(true); await writing;
  const pause = change(false); release(); await Promise.all([dim, pause]);
  assert.deepEqual(calls, ['dim', 'restore']);
});
test('brightness failures surface and a failed restoration can be retried', async () => {
  const d = device(), change = brightnessController(d.driver, d.failed);
  await change(true);
  d.driver.restore = async () => { throw new Error('Unavailable'); };
  await change(false); assert.equal(d.failures(), 1);
  d.driver.restore = async snapshot => { d.restored.push(snapshot.level); };
  await change(false); assert.deepEqual(d.restored, [.8]);
  d.driver.capture = async () => ({ level: NaN, system: false });
  await change(true); assert.equal(d.failures(), 2);
  assert.deepEqual(d.writes, [.12]);
});
