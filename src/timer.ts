export type TimerState = {
  status: 'idle' | 'running' | 'paused' | 'completed';
  durationMs: number;
  remainingMs: number;
  endsAt: number | null;
};
export type TimerAction =
  | { type: 'start'; now: number }
  | { type: 'pause'; now: number }
  | { type: 'tick'; now: number }
  | { type: 'reset'; minutes: number };
export const clampMinutes = (n: number) => Math.max(1, Math.min(180, Math.round(Number.isFinite(n) ? n : 20)));
export function idleTimer(minutes: number): TimerState {
  const durationMs = clampMinutes(minutes) * 60_000;
  return { status: 'idle', durationMs, remainingMs: durationMs, endsAt: null };
}
export function remaining(state: TimerState, now: number): number {
  return state.status === 'running' && state.endsAt !== null
    ? Math.max(0, Math.min(state.durationMs, state.endsAt - now)) : state.remainingMs;
}
export function transition(state: TimerState, action: TimerAction): TimerState {
  if (action.type === 'reset') return idleTimer(action.minutes);
  if (action.type === 'start') {
    if (state.status === 'running') return state;
    const ms = state.status === 'completed' ? state.durationMs : state.remainingMs;
    return { ...state, status: 'running', remainingMs: ms, endsAt: action.now + ms };
  }
  if (state.status !== 'running') return state;
  const ms = remaining(state, action.now);
  if (ms === 0) return { ...state, status: 'completed', remainingMs: 0, endsAt: null };
  if (action.type === 'pause') return { ...state, status: 'paused', remainingMs: ms, endsAt: null };
  return state;
}
export function restoreTimer(value: unknown, minutes: number, now: number): TimerState {
  if (!value || typeof value !== 'object') return idleTimer(minutes);
  const s = value as TimerState;
  if (!['idle', 'running', 'paused', 'completed'].includes(s.status)
    || !Number.isFinite(s.durationMs) || s.durationMs < 60_000 || s.durationMs > 10_800_000
    || !Number.isFinite(s.remainingMs) || s.remainingMs < 0 || s.remainingMs > s.durationMs
    || (s.status === 'running' && (typeof s.endsAt !== 'number' || !Number.isFinite(s.endsAt)))
    || (s.status !== 'running' && s.endsAt !== null)) return idleTimer(minutes);
  if (s.status === 'idle') return idleTimer(minutes);
  if (s.status === 'completed') return { ...s, remainingMs: 0 };
  if (s.status === 'paused' && s.remainingMs === 0) return { ...s, status: 'completed' };
  return transition(s, { type: 'tick', now });
}
export function formatTime(ms: number): string {
  const seconds = Math.ceil(Math.max(0, ms) / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
