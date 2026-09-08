/**
 * Store screenshots from the local Expo web build.
 *
 * These are web captures, not device captures: React Native Web draws its own switches and
 * scrollbars, and Settings shows the web wording for Do Not Disturb. Rendering happens at the
 * store's own pixel size through deviceScaleFactor, so nothing is upscaled after the fact.
 * History is left empty; no meditation records are invented.
 *
 *   npm run web            # in another terminal
 *   npx tsx scripts/capture-screenshots.ts
 */
import { chromium, devices } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const KEY = 'meditation-timer:v1';
const BASE = process.env.BASE_URL ?? 'http://localhost:8081';
const SETTINGS = JSON.stringify({ settings: { minutes: 20, theme: 'dark', ambience: 'waves' } });
const targets = [
  { dir: 'store/android-public/screenshots', prefix: 'phone', width: 360, height: 640, scale: 3 },
  { dir: 'store/ios-public/screenshots', prefix: 'phone', width: 414, height: 896, scale: 3 },
  { dir: 'store/ios-public/screenshots', prefix: 'tablet', width: 1024, height: 1366, scale: 2 },
];

async function capture(browser: Awaited<ReturnType<typeof chromium.launch>>, target: typeof targets[number]) {
  await mkdir(target.dir, { recursive: true });
  const context = await browser.newContext({
    ...devices['Desktop Chrome'],
    viewport: { width: target.width, height: target.height },
    deviceScaleFactor: target.scale,
    colorScheme: 'dark',
    locale: 'es-ES',
  });
  await context.addInitScript(([key, settings]) => localStorage.setItem(key, settings), [KEY, SETTINGS]);
  const page = await context.newPage();
  const shot = async (name: string) => {
    const path = `${target.dir}/${target.prefix}-${name}.png`;
    await page.screenshot({ path });
    console.log(`${path}  ${target.width * target.scale}×${target.height * target.scale}`);
  };
  await page.goto(BASE);
  await page.getByTestId('countdown').waitFor();
  await page.waitForTimeout(1500);  // Let the fonts land and the halo settle into its orbit.
  await shot('timer');
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await page.waitForTimeout(700);
  await shot('settings');
  await page.getByRole('tab', { name: 'Registro', exact: true }).click();
  await page.waitForTimeout(700);
  await shot('calendar');
  await context.close();
}

async function main() {
  const browser = await chromium.launch({ channel: 'chrome' });
  try {
    for (const target of targets) await capture(browser, target);
  } finally {
    await browser.close();
  }
}
void main();
