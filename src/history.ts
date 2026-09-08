import { Language, translator } from './i18n';
import { remaining, TimerState } from './timer';

export type ActiveSession = { id: string; startedAt: number };
export type MeditationRecord = ActiveSession & {
  endedAt: number;
  durationMs: number;
  plannedDurationMs: number;
  completed: boolean;
};
export function newSession(now: number): ActiveSession {
  return { id: `${now}-${Math.random().toString(36).slice(2, 10)}`, startedAt: now };
}
export function restoreActiveSession(value: unknown): ActiveSession | null {
  if (!value || typeof value !== 'object') return null;
  const s = value as ActiveSession;
  return typeof s.id === 'string' && s.id.length > 0 && s.id.length < 150
    && Number.isFinite(s.startedAt) && s.startedAt > 0 && s.startedAt <= 8.64e15
    ? { id: s.id, startedAt: s.startedAt } : null;
}
export function restoreHistory(value: unknown): MeditationRecord[] {
  if (!Array.isArray(value)) return [];
  const ids = new Set<string>();
  return value.filter((r): r is MeditationRecord => {
    const session = restoreActiveSession(r);
    if (!session || ids.has(session.id) || !Number.isFinite(r.endedAt) || r.endedAt < session.startedAt
      || r.endedAt > 8.64e15 || !Number.isFinite(r.durationMs) || r.durationMs < 1000
      || !Number.isFinite(r.plannedDurationMs) || r.plannedDurationMs < 60000 || r.plannedDurationMs > 10800000
      || r.durationMs > r.plannedDurationMs || typeof r.completed !== 'boolean'
      || (r.completed && r.durationMs !== r.plannedDurationMs)) return false;
    ids.add(session.id); return true;
  }).sort((a, b) => b.endedAt - a.endedAt);
}
/** Use timer progress, never wall-clock session length: paused time does not count. */
export function finishSession(history: MeditationRecord[], session: ActiveSession | null, timer: TimerState, now: number): MeditationRecord[] {
  if (!session || timer.status === 'idle' || history.some(r => r.id === session.id)) return history;
  const left = remaining(timer, now);
  const durationMs = timer.durationMs - left;
  if (durationMs < 1000) return history;
  const endedAt = left === 0 && timer.endsAt !== null ? timer.endsAt : now;
  return [{ ...session, endedAt: Math.max(session.startedAt, endedAt), durationMs,
    plannedDurationMs: timer.durationMs, completed: left === 0 }, ...history];
}
export function formatMeditated(ms: number, language: Language = 'es'): string {
  const t = translator(language);
  const seconds = Math.floor(ms / 1000);
  const h = Math.floor(seconds / 3600), m = Math.floor(seconds % 3600 / 60), s = seconds % 60;
  return [h ? `${h} ${t('h')}` : '', m ? `${m} ${t('min')}` : '', s ? `${s} ${t('s')}` : ''].filter(Boolean).join(' ') || `0 ${t('min')}`;
}
