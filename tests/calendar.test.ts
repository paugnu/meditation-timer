import assert from 'node:assert/strict';
import test from 'node:test';
import { dailyMeditation, dailyMinutes, localDayKey, monthDays } from '../src/calendar';
import { MeditationRecord } from '../src/history';
import { dictionaries, languages, translator } from '../src/i18n';
import { restoreSettings } from '../src/settings';

test('calendar sums actual session duration on local start day, including overnight sessions', () => {
  const start = new Date(2026, 8, 5, 23, 55).getTime();
  const records: MeditationRecord[] = [
    { id: 'one', startedAt: start, endedAt: start + 3600000, durationMs: 600000, plannedDurationMs: 1200000, completed: false },
    { id: 'two', startedAt: start - 3600000, endedAt: start - 1800000, durationMs: 1800000, plannedDurationMs: 1800000, completed: true },
  ];
  const totals = dailyMeditation(records);
  assert.equal(totals.get(localDayKey(new Date(start))), 2400000);
  assert.equal(totals.size, 1);
});
test('calendar aligns Monday first, handles leap years, and pads complete weeks', () => {
  const feb = monthDays(2024, 1);
  assert.equal(feb.filter(Boolean).length, 29);
  assert.equal(feb[0], null);
  assert.equal(feb[3]?.getDate(), 1);
  assert.equal(feb.length % 7, 0);
  assert.equal(monthDays(2025, 1).filter(Boolean).length, 28);
  assert.equal(monthDays(2026, 12).find(Boolean)?.getFullYear(), 2027);
});
test('daily labels never show zero and do not round practice time up', () => {
  assert.equal(dailyMinutes(0, 'es-ES'), '');
  assert.equal(dailyMinutes(1000, 'es-ES'), '<1');
  assert.equal(dailyMinutes(119999, 'es-ES'), '1');
  assert.equal(dailyMinutes(2700000, 'es-ES'), '45');
});
test('every language has complete translations and matching interpolation tokens', () => {
  for (const language of languages) {
    const messages = dictionaries[language.code];
    assert.deepEqual(Object.keys(messages).sort(), Object.keys(dictionaries.es).sort());
    for (const [key, value] of Object.entries(messages)) {
      assert.ok(value.trim(), `${language.code}: ${key}`);
      assert.deepEqual(value.match(/\{\w+\}/g)?.sort(), key.match(/\{\w+\}/g)?.sort(), `${language.code}: ${key}`);
    }
  }
  assert.equal(translator('en')('{n} minutos', { n: 45 }), '45 minutes');
  assert.equal(restoreSettings({ language: 'ru' }).language, 'ru');
  assert.equal(restoreSettings({ language: 'invalid' }).language, 'es');
  assert.equal(restoreSettings({ minutes: 45 }).language, 'es');
});
