import { MeditationRecord } from './history';

/** Group by local start date, consistently with the session list. */
export function localDayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function dailyMeditation(history: MeditationRecord[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const session of history) {
    const key = localDayKey(new Date(session.startedAt));
    totals.set(key, (totals.get(key) ?? 0) + session.durationMs);
  }
  return totals;
}
/** Monday-first calendar; noon avoids daylight-saving transitions near midnight. */
export function monthDays(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1, 12);
  const offset = (first.getDay() + 6) % 7;
  const count = new Date(year, month + 1, 0, 12).getDate();
  const cells: (Date | null)[] = Array.from({ length: offset }, () => null);
  for (let day = 1; day <= count; day++) cells.push(new Date(year, month, day, 12));
  while (cells.length % 7) cells.push(null);
  return cells;
}
export function dailyMinutes(ms: number, locale: string): string {
  if (ms <= 0) return '';
  if (ms < 60000) return '<1';
  // Whole minutes rounded down, matching the duration shown in the session list.
  return new Intl.NumberFormat(locale).format(Math.floor(ms / 60000));
}
