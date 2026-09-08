import test from 'node:test';
import assert from 'node:assert/strict';
import { createReviewRequester } from '../src/reviewPolicy';

test('review requires five completions and public availability, then attempts once across requesters', async () => {
  let marker: string | null = null, calls = 0, available = false;
  const deps = { available: async () => available, readAttempt: async () => marker,
    markAttempt: async () => { marker = 'attempted'; }, request: async () => { calls++; } };
  const ask = createReviewRequester(deps);
  await ask(5, true); assert.equal(marker, null);
  available = true;
  await ask(5, false); await ask(4, true); await ask(5, true, () => false);
  assert.equal(calls, 0);
  await Promise.all([ask(5, true), ask(5, true)]);
  assert.equal(calls, 1);
  await createReviewRequester(deps)(6, true);
  assert.equal(calls, 1);
});
test('failed persistence prevents a request; failed native request is not retried', async () => {
  let calls = 0;
  await createReviewRequester({ available: async () => true, readAttempt: async () => null,
    markAttempt: async () => { throw Error('disk'); }, request: async () => { calls++; } })(5, true);
  assert.equal(calls, 0);
  let marker: string | null = null;
  const ask = createReviewRequester({ available: async () => true, readAttempt: async () => marker,
    markAttempt: async () => { marker = 'yes'; }, request: async () => { calls++; throw Error('store'); } });
  await ask(5, true); await ask(6, true); assert.equal(calls, 1);
});
