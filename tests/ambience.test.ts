import assert from 'node:assert/strict';
import test from 'node:test';
import { ambienceLabels, ambienceLeadMs, ambiences, stepAmbience, validAmbience } from '../src/ambience';
import { dictionaries, languages } from '../src/i18n';
import { restoreSettings, defaults } from '../src/settings';

test('the selector cycles in both directions and always returns to silence', () => {
  assert.equal(defaults.ambience, 'none');
  assert.equal(stepAmbience('none', 1), 'rain');
  assert.equal(stepAmbience('rain', 1), 'waves');
  assert.equal(stepAmbience('waves', 1), 'none', 'a single arrow must reach silence again');
  assert.equal(stepAmbience('none', -1), 'waves');
  assert.deepEqual(ambiences.map((_, index) => stepAmbience('none', index)), [...ambiences]);
  // Repeated swipes in one direction never leave the list.
  let id = validAmbience('none');
  for (let i = 0; i < 25; i++) { id = stepAmbience(id, 1); assert.ok(ambiences.includes(id)); }
});

test('unknown or corrupt ambience falls back to silence and never autoplays', () => {
  for (const value of [undefined, null, 'thunder', 42, {}, []]) assert.equal(validAmbience(value), 'none');
  assert.equal(restoreSettings({ ambience: 'thunder' }).ambience, 'none');
  assert.equal(restoreSettings({ ambience: 'waves' }).ambience, 'waves');
  assert.equal(restoreSettings({}).ambience, 'none');
});

test('every ambience has a label translated into all six languages', () => {
  for (const id of ambiences) {
    const label = ambienceLabels[id];
    assert.ok(label, id);
    for (const language of languages) {
      const messages: Record<string, string> = dictionaries[language.code];
      assert.ok(messages[label]?.trim(), `${language.code}: ${label}`);
    }
  }
});

test('the ambience waits for an opening gong and fades in under its decay', () => {
  // Starts 2.5 s before the gong ends, so the fade lands under the tail rather than on top.
  assert.equal(ambienceLeadMs(15.8), 13300);
  assert.equal(ambienceLeadMs(3), 500);
  // A gong shorter than the overlap means no waiting at all.
  assert.equal(ambienceLeadMs(2), 0);
  assert.equal(ambienceLeadMs(1.5), 0);
  // An unknown or absurd duration must never strand the meditation in silence.
  assert.equal(ambienceLeadMs(0), ambienceLeadMs(15.8));
  assert.equal(ambienceLeadMs(NaN), ambienceLeadMs(15.8));
  assert.equal(ambienceLeadMs(Infinity), ambienceLeadMs(15.8));
  assert.equal(ambienceLeadMs(600), 20000);
});
