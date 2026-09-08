import { test, expect } from '@playwright/test';
import { localDayKey } from '../../src/calendar';
const key = 'meditation-timer:v1';
test('start, pause, resume, finish, and reload', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByTestId('countdown')).toHaveText('20:00');
  await page.getByRole('button', { name: 'Iniciar meditación', exact: true }).click();
  await expect(page.getByTestId('countdown')).not.toHaveText('20:00');
  await page.getByRole('button', { name: 'Pausar meditación', exact: true }).click();
  const paused = await page.getByTestId('countdown').textContent();
  await expect(page.getByText('EN PAUSA', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByTestId('countdown')).toHaveText(paused!);
  await page.getByRole('button', { name: 'Continuar meditación' }).click();
  await expect(page.getByRole('button', { name: 'Pausar meditación', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Pausar meditación', exact: true }).click();
  await page.getByRole('button', { name: 'Finalizar meditación' }).click();
  await page.getByRole('button', { name: 'Guardar meditación', exact: true }).click();
  await expect(page.getByTestId('countdown')).toHaveText('20:00');
  expect(errors).toEqual([]);
});
test('settings persist, validate duration, and render the day theme', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await page.getByRole('button', { name: '5 minutos', exact: true }).click();
  await page.getByRole('button', { name: 'Tema día' }).click();
  await page.getByRole('button', { name: 'Color Azul' }).click();
  await page.getByRole('textbox', { name: 'Duración en minutos' }).fill('0');
  await page.getByRole('tab', { name: 'Registro', exact: true }).click();
  await expect(page.getByText('Elige una duración entre 1 y 180 minutos.')).toBeVisible();
  await page.getByRole('textbox', { name: 'Duración en minutos' }).fill('7');
  await page.getByRole('button', { name: 'Cerrar ajustes' }).click();
  await expect(page.getByTestId('countdown')).toHaveText('07:00');
  await page.reload();
  await expect(page.getByTestId('countdown')).toHaveText('07:00');
  const data = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!), key);
  expect(data.settings.theme).toBe('light'); expect(data.settings.color).toBe('#6579FF');
});
test('finishes a session with no negative countdown and can start again', async ({ page }) => {
  await page.addInitScript(k => localStorage.setItem(k, JSON.stringify({
    settings: { minutes: 1, gong: false },
    timer: { status: 'running', durationMs: 60000, remainingMs: 2000, endsAt: Date.now() + 2000 },
  })), key);
  await page.goto('/');
  await expect(page.getByText('SESIÓN COMPLETADA', { exact: true })).toBeVisible();
  await expect(page.getByTestId('countdown')).toHaveText('00:00');
  await page.getByRole('button', { name: 'Meditar de nuevo' }).click();
  await expect(page.getByRole('button', { name: 'Pausar meditación', exact: true })).toBeVisible();
});
test('corrupt storage does not block startup', async ({ page }) => {
  await page.addInitScript(k => localStorage.setItem(k, '{bad JSON'), key);
  await page.goto('/');
  await expect(page.getByTestId('countdown')).toHaveText('20:00');
  await expect(page.getByRole('button', { name: 'Iniciar meditación', exact: true })).toBeEnabled();
});

test('independent start and end sound settings survive reopening', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await expect(page.getByRole('switch', { name: 'Gong al inicio' })).not.toBeChecked();
  await expect(page.getByRole('switch', { name: 'Gong al final' })).toBeChecked();
  await page.getByRole('switch', { name: 'Gong al inicio' }).click();
  await page.getByRole('switch', { name: 'Gong al final' }).click();
  await page.getByRole('button', { name: 'Cerrar ajustes' }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await expect(page.getByRole('switch', { name: 'Gong al inicio' })).toBeChecked();
  await expect(page.getByRole('switch', { name: 'Gong al final' })).not.toBeChecked();
  await expect(page.getByRole('button', { name: 'Escuchar gong' })).toBeVisible();
});

test('history saves actual time when ending a paused session, persists and does not duplicate', async ({ page }) => {
  await page.addInitScript(k => {
    if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify({
      settings: { minutes: 1, gong: false },
      timer: { status: 'paused', durationMs: 60000, remainingMs: 40000, endsAt: null },
      activeSession: { id: 'paused-practice', startedAt: Date.now() - 100000 },
    }));
  }, key);
  await page.goto('/');
  await page.getByRole('button', { name: 'Finalizar meditación' }).click();
  await page.getByRole('button', { name: 'Guardar meditación', exact: true }).click();
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await page.getByRole('tab', { name: 'Registro', exact: true }).click();
  await expect(page.getByTestId('history-total')).toHaveText('20 s');
  await expect(page.getByTestId('history-count')).toHaveText('Sesiones: 1');
  await expect(page.getByText('Finalizada antes de tiempo · Objetivo: 1 min')).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await page.getByRole('tab', { name: 'Registro', exact: true }).click();
  await expect(page.getByTestId('history-entry')).toHaveCount(1);
  await expect(page.getByTestId('history-total')).toHaveText('20 s');
});

test('recovering expired meditation adds it once with the correct deadline', async ({ page }) => {
  const endedAt = Date.now() - 3600000;
  await page.addInitScript(({ k, end }) => {
    if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify({
      settings: { minutes: 1, gong: false },
      timer: { status: 'running', durationMs: 60000, remainingMs: 60000, endsAt: end },
      activeSession: { id: 'expired-practice', startedAt: end - 60000 },
    }));
  }, { k: key, end: endedAt });
  await page.goto('/');
  await expect(page.getByText('SESIÓN COMPLETADA', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('SESIÓN COMPLETADA', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await page.getByRole('tab', { name: 'Registro', exact: true }).click();
  const sessionDate = new Date(endedAt - 60000);
  if (sessionDate.getMonth() !== new Date().getMonth()) await page.getByRole('button', { name: 'Mes anterior' }).click();
  await page.getByTestId(`calendar-day-${localDayKey(sessionDate)}`).click();
  await expect(page.getByTestId('history-entry')).toHaveCount(1);
  await expect(page.getByTestId('history-total')).toHaveText('1 min');
  const data = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!), key);
  expect(data.history[0].endedAt).toBe(endedAt);
  expect(data.activeSession).toBeNull();
});

test('an empty journal explains how to record the first meditation', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await page.getByRole('tab', { name: 'Registro', exact: true }).click();
  await expect(page.getByTestId('history-total')).toHaveText('0 min');
  await expect(page.getByText('Tu primera meditación empieza aquí')).toBeVisible();
  await page.getByRole('tab', { name: 'Configuración', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Duración en minutos' })).toBeVisible();
});

for (const gongStart of [false, true]) for (const gong of [false, true]) {
  test(`gong playback follows start=${gongStart}, end=${gong}, and does not repeat on resume`, async ({ page }) => {
    // Observe playback requests without producing sound in the test runner.
    await page.addInitScript(({ k, start, end }) => {
      localStorage.setItem(k, JSON.stringify({ settings: { minutes: 1, gongStart: start, gong: end } }));
      (window as any).__gongCalls = 0;
      HTMLMediaElement.prototype.play = function () { (window as any).__gongCalls++; return Promise.resolve(); };
    }, { k: key, start: gongStart, end: gong });
    await page.clock.install();
    await page.goto('/');
    await page.getByRole('button', { name: 'Iniciar meditación', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Pausar meditación', exact: true })).toBeEnabled();
    expect(await page.evaluate(() => (window as any).__gongCalls)).toBe(Number(gongStart));
    await page.getByRole('button', { name: 'Pausar meditación', exact: true }).click();
    await page.getByRole('button', { name: 'Continuar meditación', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Pausar meditación', exact: true })).toBeEnabled();
    expect(await page.evaluate(() => (window as any).__gongCalls)).toBe(Number(gongStart));
    await page.clock.fastForward(61000);
    await expect(page.getByText('SESIÓN COMPLETADA', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Meditar de nuevo' })).toBeEnabled();
    expect(await page.evaluate(() => (window as any).__gongCalls)).toBe(Number(gongStart) + Number(gong));
    await page.getByRole('button', { name: 'Abrir ajustes' }).click();
    await page.getByRole('tab', { name: 'Registro', exact: true }).click();
    await expect(page.getByTestId('history-total')).toHaveText('1 min');
    await expect(page.getByTestId('history-entry')).toHaveCount(1);
  });
}


test('settings can always close and offers 45 instead of 20 minutes', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await expect(page.getByRole('button', { name: '20 minutos', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: '45 minutos', exact: true }).click();
  await page.getByRole('button', { name: 'Cerrar ajustes' }).click();
  await expect(page.getByTestId('countdown')).toHaveText('45:00');
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await page.getByRole('textbox', { name: 'Duración en minutos' }).fill('');
  await page.getByRole('button', { name: 'Cerrar ajustes' }).click();
  await expect(page.getByRole('button', { name: 'Cerrar ajustes' })).toHaveCount(0);
  await expect(page.getByTestId('countdown')).toHaveText('45:00');
});

test('all six languages update settings and history, and the selected language persists', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  for (const [language, heading, history, config, calendar] of [
    ['Català / Valencià', 'Configuració', 'Registre', 'Configuració', 'CALENDARI'],
    ['English', 'Settings', 'History', 'Preferences', 'CALENDAR'],
    ['Nederlands', 'Instellingen', 'Overzicht', 'Voorkeuren', 'KALENDER'],
    ['Français', 'Réglages', 'Historique', 'Configuration', 'CALENDRIER'],
    ['Русский', 'Настройки', 'История', 'Параметры', 'КАЛЕНДАРЬ'],
  ]) {
    await page.getByRole('radio', { name: language, exact: true }).click();
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    await page.getByRole('tab', { name: history, exact: true }).click();
    await expect(page.getByText(calendar, { exact: true })).toBeVisible();
    await page.getByRole('tab', { name: config, exact: true }).click();
  }
  await page.reload();
  await page.getByRole('button', { name: 'Открыть настройки', exact: true }).click();
  await expect(page.getByRole('radio', { name: 'Русский', exact: true })).toBeChecked();
  await page.getByRole('radio', { name: 'Español', exact: true }).click();
  await page.getByRole('button', { name: 'Cerrar ajustes' }).click();
  await expect(page.getByRole('button', { name: 'Abrir ajustes' })).toBeVisible();
});

test('calendar selects today by default and filters sessions for selected days and months', async ({ page }) => {
  await page.clock.install({ time: new Date(2026, 8, 6, 12) });
  await page.addInitScript(k => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 2, 10).getTime();
    localStorage.setItem(k, JSON.stringify({ settings: { gong: false }, history: [
      { id: 'first', startedAt: start, endedAt: start + 900000, durationMs: 900000, plannedDurationMs: 900000, completed: true },
      { id: 'second', startedAt: start + 3600000, endedAt: start + 5400000, durationMs: 1800000, plannedDurationMs: 1800000, completed: true },
      { id: 'short', startedAt: start + 86400000, endedAt: start + 86420000, durationMs: 20000, plannedDurationMs: 60000, completed: false },
    ] }));
  }, key);
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await page.getByRole('tab', { name: 'Registro', exact: true }).click();
  await expect(page.getByTestId('calendar-minutes')).toHaveText(['45 min', '<1 min']);
  await expect(page.getByTestId('calendar-day-2026-09-06')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('history-entry')).toHaveCount(0);
  await page.getByTestId('calendar-day-2026-09-02').click();
  await expect(page.getByTestId('history-entry')).toHaveCount(2);
  await expect(page.getByTestId('selected-day-total')).toHaveText('45 min · Sesiones: 2');
  await page.getByTestId('calendar-day-2026-09-03').click();
  await expect(page.getByTestId('history-entry')).toHaveCount(1);
  await expect(page.getByTestId('selected-day-total')).toHaveText('20 s · Sesiones: 1');
  const month = await page.getByTestId('calendar-month').textContent();
  await page.getByRole('button', { name: 'Mes anterior' }).click();
  await expect(page.getByTestId('calendar-month')).not.toHaveText(month!);
  await expect(page.getByTestId('calendar-minutes')).toHaveCount(0);
  await expect(page.getByTestId('history-entry')).toHaveCount(0);
  await expect(page.getByText('No hay meditaciones este día', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Hoy', exact: true }).click();
  await expect(page.getByTestId('calendar-month')).toHaveText(month!);
  await expect(page.getByTestId('calendar-minutes')).toHaveCount(2);
  await expect(page.getByTestId('calendar-day-2026-09-06')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('history-entry')).toHaveCount(0);
});

for (const keep of [true, false]) test(`early finish asks and ${keep ? 'saves' : 'discards'} only after the decision`, async ({ page }) => {
  await page.addInitScript(k => {
    if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify({
      settings: { minutes: 1, gong: false },
      timer: { status: 'running', durationMs: 60000, remainingMs: 40000, endsAt: Date.now() + 40000 },
      activeSession: { id: 'decision-session', startedAt: Date.now() - 20000 },
    }));
  }, key);
  await page.clock.install();
  await page.goto('/');
  await page.getByRole('button', { name: 'Pausar meditación', exact: true }).click();
  await page.getByRole('button', { name: 'Finalizar meditación', exact: true }).click();
  await expect(page.getByRole('heading', { name: '¿Guardar esta meditación?' })).toBeVisible();
  const before = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!), key);
  expect(before.history).toHaveLength(0);
  expect(before.timer.status).toBe('paused');
  await page.clock.fastForward(120000);
  await page.getByRole('button', { name: keep ? 'Guardar meditación' : 'Finalizar sin guardar', exact: true }).click();
  await expect(page.getByTestId('countdown')).toHaveText('01:00');
  await page.reload();
  await expect(page.getByTestId('countdown')).toHaveText('01:00');
  const after = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!), key);
  expect(after.history).toHaveLength(keep ? 1 : 0);
  expect(after.activeSession).toBeNull();
  if (keep) expect(after.history[0].durationMs).toBe(before.timer.durationMs - before.timer.remainingMs);
});

test('cancel early finish keeps paused session and completion saves without asking', async ({ page }) => {
  await page.addInitScript(k => localStorage.setItem(k, JSON.stringify({settings: { minutes: 1, gong: false }})), key);
  await page.clock.install();
  await page.goto('/');
  await page.getByRole('button', { name: 'Iniciar meditación', exact: true }).click();
  await page.clock.fastForward(10000);
  await page.getByRole('button', { name: 'Pausar meditación', exact: true }).click();
  await page.getByRole('button', { name: 'Finalizar meditación', exact: true }).click();
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(page.getByText('EN PAUSA', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Continuar meditación', exact: true }).click();
  await page.clock.fastForward(61000);
  await expect(page.getByText('SESIÓN COMPLETADA', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: '¿Guardar esta meditación?' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Finalizar meditación', exact: true }).click();
  await expect(page.getByTestId('countdown')).toHaveText('01:00');
  const data = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!), key);
  expect(data.history).toHaveLength(1);
  expect(data.history[0].completed).toBe(true);
});

test('halo rotates during meditation and holds its position while paused', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const orbit = page.getByTestId('halo-orbit');
  const transform = () => orbit.evaluate(element => getComputedStyle(element).transform);
  await page.getByRole('button', { name: 'Iniciar meditación', exact: true }).click();
  const initial = await transform();
  await expect.poll(transform).not.toBe(initial);
  await page.getByRole('button', { name: 'Pausar meditación', exact: true }).click();
  await expect(page.getByText('EN PAUSA', { exact: true })).toBeVisible();
  await page.waitForTimeout(100);
  const paused = await transform();
  await page.waitForTimeout(500);
  expect(await transform()).toBe(paused);
  await page.getByRole('button', { name: 'Continuar meditación', exact: true }).click();
  await expect.poll(transform).not.toBe(paused);
});

test('a new meditation resets the orbit after finishing an earlier session', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const angle = () => page.getByTestId('halo-orbit').evaluate(element => {
    const matrix = new DOMMatrix(getComputedStyle(element).transform);
    return Math.atan2(matrix.b, matrix.a) * 180 / Math.PI;
  });
  await page.getByRole('button', { name: 'Iniciar meditación', exact: true }).click();
  await expect.poll(angle).toBeGreaterThan(25);
  await page.getByRole('button', { name: 'Pausar meditación', exact: true }).click();
  await page.getByRole('button', { name: 'Finalizar meditación', exact: true }).click();
  await expect(page.getByRole('heading', { name: '¿Guardar esta meditación?' })).toBeVisible();
  await expect.poll(angle).toBe(0);
  await expect(page.getByTestId('halo-tip')).toHaveAttribute('cx', '160');
  await expect(page.getByTestId('halo-tip')).toHaveAttribute('cy', '24');
  await page.getByRole('button', { name: 'Finalizar sin guardar', exact: true }).click();
  await page.getByRole('button', { name: 'Iniciar meditación', exact: true }).click();
  expect(await angle()).toBeLessThan(10);
  await expect.poll(angle).toBeGreaterThan(10);
});

test('halo and countdown stay in place when starting and pausing', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Iniciar meditación', exact: true })).toBeEnabled();
  const positions = async () => Promise.all(['meditation-halo', 'countdown'].map(id => page.getByTestId(id).boundingBox()));
  const idle = await positions();
  await page.getByRole('button', { name: 'Iniciar meditación', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pausar meditación', exact: true })).toBeEnabled();
  const active = await positions();
  await page.getByRole('button', { name: 'Pausar meditación', exact: true }).click();
  const paused = await positions();
  for (let i = 0; i < idle.length; i++) {
    expect(Math.abs(active[i]!.y - idle[i]!.y)).toBeLessThan(1);
    expect(Math.abs(paused[i]!.y - idle[i]!.y)).toBeLessThan(1);
    expect(active[i]!.height).toBe(idle[i]!.height);
  }
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await expect(page.getByRole('link', { name: 'Una app de YogaBond' })).toBeVisible();
});

test('deleting one journal entry requires confirmation, updates totals and persists', async ({ page }) => {
  await page.clock.install({ time: new Date(2026, 8, 6, 12) });
  await page.goto('/');
  await page.evaluate(k => {
    const start = new Date(2026, 8, 2, 10).getTime();
    localStorage.setItem(k, JSON.stringify({ settings: { gong: false }, history: [
      { id: 'keep', startedAt: start, endedAt: start + 900000, durationMs: 900000, plannedDurationMs: 900000, completed: true },
      { id: 'delete', startedAt: start + 3600000, endedAt: start + 5400000, durationMs: 1800000, plannedDurationMs: 1800000, completed: true },
      { id: 'other-day', startedAt: start + 86400000, endedAt: start + 86420000, durationMs: 20000, plannedDurationMs: 60000, completed: false },
    ] }));
  }, key);
  await page.reload();
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await page.getByRole('tab', { name: 'Registro', exact: true }).click();
  await page.getByTestId('calendar-day-2026-09-02').click();
  const row = page.getByTestId('history-entry').filter({ hasText: '11:00' });
  await row.getByRole('button', { name: 'Eliminar registro', exact: true }).click();
  await expect(page.getByTestId('history-count')).toHaveText('Sesiones: 3');
  await row.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(page.getByTestId('history-entry')).toHaveCount(2);
  await row.getByRole('button', { name: 'Eliminar registro', exact: true }).click();
  await row.getByRole('button', { name: 'Eliminar definitivamente', exact: true }).click();
  await expect(page.getByTestId('history-entry')).toHaveCount(1);
  await expect(page.getByTestId('history-total')).toHaveText('15 min 20 s');
  await expect(page.getByTestId('selected-day-total')).toHaveText('15 min · Sesiones: 1');
  await expect(page.getByTestId('calendar-minutes')).toHaveText(['15 min', '<1 min']);
  await expect(page.getByTestId('calendar-day-2026-09-02')).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => page.evaluate(k => JSON.parse(localStorage.getItem(k)!).history.map((r: { id: string }) => r.id), key)).toEqual(['other-day', 'keep']);
  await page.reload();
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await page.getByRole('tab', { name: 'Registro', exact: true }).click();
  await expect(page.getByTestId('history-count')).toHaveText('Sesiones: 2');
  await page.getByTestId('calendar-day-2026-09-02').click();
  await expect(page.getByTestId('history-entry')).toHaveCount(1);
  await page.getByRole('button', { name: 'Eliminar registro', exact: true }).click();
  await page.getByRole('button', { name: 'Eliminar definitivamente', exact: true }).click();
  await expect(page.getByText('No hay meditaciones este día', { exact: true })).toBeVisible();
  await expect(page.getByTestId('calendar-minutes')).toHaveText(['<1 min']);
  await expect(page.getByTestId('history-count')).toHaveText('Sesiones: 1');
});
test('background sound steps both ways, wraps around, and persists', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  // Record every playback attempt: choosing a sound must not make any.
  await page.addInitScript(() => {
    (window as unknown as { plays: string[] }).plays = [];
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      (window as unknown as { plays: string[] }).plays.push(this.src);
      return play.apply(this);
    };
  });
  await page.goto('/');
  const label = page.getByTestId('ambience-label');
  const next = page.getByTestId('ambience-forward');
  await expect(label).toHaveText('Sin sonido de fondo');
  await next.click();
  await expect(label).toHaveText('Lluvia suave');
  await next.click();
  await expect(label).toHaveText('Olas del mar');
  await next.click();
  await expect(label).toHaveText('Sin sonido de fondo');
  await page.getByTestId('ambience-back').click();
  await expect(label).toHaveText('Olas del mar');
  await page.reload();
  await expect(label).toHaveText('Olas del mar');
  const data = await page.evaluate(k => JSON.parse(localStorage.getItem(k)!), key);
  expect(data.settings.ambience).toBe('waves');
  await expect(page.getByTestId('countdown')).toHaveText('20:00');
  const plays = () => page.evaluate(() => (window as unknown as { plays: string[] }).plays.length);
  expect(await plays()).toBe(0);
  expect(errors).toEqual([]);
});
test('background sound plays only while the timer is running', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    (window as unknown as { plays: string[] }).plays = [];
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      (window as unknown as { plays: string[] }).plays.push(this.src);
      return play.apply(this);
    };
  });
  await page.goto('/');
  await page.getByTestId('ambience-forward').click();
  await expect(page.getByTestId('ambience-label')).toHaveText('Lluvia suave');
  const plays = () => page.evaluate(() => (window as unknown as { plays: string[] }).plays.length);
  expect(await plays()).toBe(0);
  await page.getByRole('button', { name: 'Iniciar meditación', exact: true }).click();
  await expect.poll(plays, { timeout: 4000 }).toBeGreaterThan(0);
  // Switching mid-session hands over without a second start of the outgoing track.
  await page.getByTestId('ambience-forward').click();
  await expect(page.getByTestId('ambience-label')).toHaveText('Olas del mar');
  await expect.poll(plays, { timeout: 4000 }).toBe(2);
  await page.waitForTimeout(2500);
  expect(await plays()).toBe(2);
  expect(errors).toEqual([]);
});
test('background sound uses the gong volume setting', async ({ page }) => {
  await page.addInitScript(k => {
    localStorage.setItem(k, JSON.stringify({ settings: { minutes: 20, ambience: 'rain', volume: .3, gong: false } }));
    const media: HTMLMediaElement[] = [];
    (window as unknown as { media: HTMLMediaElement[] }).media = media;
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () { media.push(this); return play.apply(this); };
  }, key);
  await page.goto('/');
  await expect(page.getByTestId('ambience-label')).toHaveText('Lluvia suave');
  await page.getByRole('button', { name: 'Iniciar meditación', exact: true }).click();
  const loudest = () => page.evaluate(() =>
    Math.max(0, ...(window as unknown as { media: HTMLMediaElement[] }).media.map(m => m.volume)));
  // Fades up to the configured level and stops there, rather than a level of its own.
  await expect.poll(loudest, { timeout: 4000 }).toBeGreaterThan(.28);
  await page.waitForTimeout(1200);
  expect(await loudest()).toBeLessThanOrEqual(.31);
});
test('a volume of zero keeps the background sound silent', async ({ page }) => {
  await page.addInitScript(k => {
    localStorage.setItem(k, JSON.stringify({ settings: { minutes: 20, ambience: 'waves', volume: 0, gong: false } }));
    (window as unknown as { plays: number }).plays = 0;
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () { (window as unknown as { plays: number }).plays++; return play.apply(this); };
  }, key);
  await page.goto('/');
  await page.getByRole('button', { name: 'Iniciar meditación', exact: true }).click();
  await page.waitForTimeout(2000);
  expect(await page.evaluate(() => (window as unknown as { plays: number }).plays)).toBe(0);
});
const spySources = () => {
  const spy = window as unknown as { sources: string[]; media: HTMLMediaElement[] };
  spy.sources = []; spy.media = [];
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () {
    spy.sources.push(this.src); spy.media.push(this);
    return play.apply(this);
  };
};
test('an opening gong holds the ambience back until it is nearly over', async ({ page }) => {
  await page.addInitScript(k => localStorage.setItem(k, JSON.stringify({
    settings: { minutes: 20, ambience: 'rain', volume: .5, gongStart: true, gong: false },
  })), key);
  await page.addInitScript(spySources);
  await page.goto('/');
  // Ambience keeps its asset path in the URL; the bundled gong is served from a blob.
  const started = (name: string) => page.evaluate(n =>
    (window as unknown as { sources: string[] }).sources.filter(s => s.includes(n)).length, name);
  const gongs = () => page.evaluate(() =>
    (window as unknown as { sources: string[] }).sources.filter(s => s.startsWith('blob:')).length);
  await page.getByRole('button', { name: 'Iniciar meditación', exact: true }).click();
  await expect.poll(gongs, { timeout: 5000 }).toBeGreaterThan(0);
  await page.waitForTimeout(3000);
  expect(await started('rain'), 'the ambience must not land on top of the gong').toBe(0);

});
test('without an opening gong the ambience starts at once', async ({ page }) => {
  await page.addInitScript(k => localStorage.setItem(k, JSON.stringify({
    settings: { minutes: 20, ambience: 'rain', volume: .5, gongStart: false, gong: false },
  })), key);
  await page.addInitScript(spySources);
  await page.goto('/');
  await page.getByRole('button', { name: 'Iniciar meditación', exact: true }).click();
  await expect.poll(() => page.evaluate(() =>
    (window as unknown as { sources: string[] }).sources.filter(s => s.includes('rain')).length),
    { timeout: 4000 }).toBeGreaterThan(0);
});
test('the ambience fades out as the closing gong rings', async ({ page }) => {
  await page.addInitScript(k => localStorage.setItem(k, JSON.stringify({
    settings: { minutes: 1, ambience: 'waves', volume: .5, gong: true, gongStart: false },
    timer: { status: 'running', durationMs: 60000, remainingMs: 4000, endsAt: Date.now() + 4000 },
  })), key);
  await page.addInitScript(spySources);
  await page.goto('/');
  const ambience = () => page.evaluate(() =>
    (window as unknown as { sources: string[] }).sources.filter(s => s.includes('waves')).length);
  const gongs = () => page.evaluate(() =>
    (window as unknown as { sources: string[] }).sources.filter(s => s.startsWith('blob:')).length);
  const loudest = () => page.evaluate(() => Math.max(0, ...(window as unknown as { media: HTMLMediaElement[] }).media
    .filter(m => m.src.includes('waves')).map(m => m.volume)));
  await expect.poll(ambience, { timeout: 5000 }).toBeGreaterThan(0);
  await expect.poll(loudest, { timeout: 5000 }).toBeGreaterThan(.1);
  await expect(page.getByText('SESIÓN COMPLETADA', { exact: true })).toBeVisible({ timeout: 15000 });
  await expect.poll(gongs, { timeout: 8000 }).toBeGreaterThan(0);
  // The closing gong rings over an ambience already on its way out, never over a full one.
  await expect.poll(loudest, { timeout: 5000 }).toBe(0);
});
test('an unknown stored ambience falls back to silence', async ({ page }) => {
  await page.addInitScript(k => localStorage.setItem(k, JSON.stringify({
    settings: { minutes: 20, ambience: 'thunder' },
  })), key);
  await page.goto('/');
  await expect(page.getByTestId('ambience-label')).toHaveText('Sin sonido de fondo');
});
test('a running session offers only pause, and finishing goes through it', async ({ page }) => {
  await page.addInitScript(k => localStorage.setItem(k, JSON.stringify({ settings: { minutes: 20, gong: false } })), key);
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Finalizar meditación' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Iniciar meditación', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pausar meditación', exact: true })).toBeVisible();
  // Ending a meditation is not a one-tap action taken with your eyes closed.
  await expect(page.getByRole('button', { name: 'Finalizar meditación' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Pausar meditación', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Finalizar meditación' })).toBeVisible();
});
test('landscape keeps the start button and the controls on screen', async ({ page }) => {
  await page.addInitScript(k => localStorage.setItem(k, JSON.stringify({ settings: { minutes: 20, gong: false } })), key);
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/');
  const viewport = page.viewportSize()!;
  // A short screen lays the halo beside the controls; nothing may fall below the fold.
  for (const name of ['Iniciar meditación', 'Abrir ajustes']) {
    const box = await page.getByRole('button', { name, exact: true }).boundingBox();
    expect(box, name).not.toBeNull();
    expect(box!.y + box!.height, `${name} is cut off`).toBeLessThanOrEqual(viewport.height);
  }
  const label = await page.getByTestId('ambience-label').boundingBox();
  expect(label!.y + label!.height).toBeLessThanOrEqual(viewport.height);
  // The halo must not sit under the readout: the two columns are side by side.
  const halo = await page.getByTestId('meditation-halo').boundingBox();
  const countdown = await page.getByTestId('countdown').boundingBox();
  expect(halo!.x + halo!.width, 'columns overlap').toBeLessThanOrEqual(countdown!.x);
});
