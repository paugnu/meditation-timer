import { useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { defaults, restoreSettings, Settings } from '../settings';
import { idleTimer, remaining, restoreTimer, TimerState, transition } from '../timer';
import { readStored, writeStored } from '../services/storage';
import { cancelAlert, prepareAlerts, scheduleAlert } from '../services/alerts';
import { focus } from '../services/focus';
import { ActiveSession, MeditationRecord, finishSession, newSession, restoreActiveSession, restoreHistory } from '../history';

export function useMeditation() {
  const [sessionSequence, setSessionSequence] = useState(0);
  const [settings, setSettings] = useState(defaults);
  const [timer, setTimer] = useState(() => idleTimer(defaults.minutes));
  const [history, setHistory] = useState<MeditationRecord[]>([]);
  const journal = useRef<MeditationRecord[]>([]);
  const activeSession = useRef<ActiveSession | null>(null);
  const [now, setNow] = useState(Date.now());
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const finishRequestedAt = useRef<number | null>(null);
  const [notice, setNotice] = useState('');
  const state = useRef(timer);
  const prefs = useRef(settings);
  const lock = useRef(false);
  const player = useAudioPlayer(require('../../assets/gong.wav'), { downloadFirst: true });
  const mounted = useRef(true);

  const save = (next: TimerState, nextSettings = prefs.current) => {
    state.current = next; prefs.current = nextSettings;
    setTimer(next); setSettings(nextSettings); setHistory(journal.current);
    void writeStored({ settings: nextSettings, timer: next, history: journal.current, activeSession: activeSession.current }).catch(() => setNotice('No se ha podido guardar la sesión en este dispositivo.'));
  };
  const recordSession = (current: TimerState, time: number) => {
    journal.current = finishSession(journal.current, activeSession.current, current, time);
    activeSession.current = null;
  };
  const playGong = async () => {
    try {
      await setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' });
      const deadline = Date.now() + 5000;
      while (!player.isLoaded) {
        if (!mounted.current || Date.now() >= deadline) throw new Error('Gong loading timed out');
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      player.volume = prefs.current.volume;
      player.muted = false;
      player.pause();
      if (player.currentTime > 0) await player.seekTo(0);
      player.play();
      return true;
    } catch {
      setNotice('No se ha podido reproducir el gong. Comprueba el volumen del dispositivo.');
      return false;
    }
  };
  const cleanup = async () => {
    try { focus.end(); } catch { setNotice('Revisa No molestar en los ajustes del dispositivo. No se ha podido restaurar.'); }
    try { await cancelAlert(); } catch { setNotice('No se ha podido retirar el aviso del sistema.'); }
  };
  const complete = async (next: TimerState, sound: boolean) => {
    lock.current = true; setBusy(true);
    try {
      recordSession(state.current, Date.now());
      save(next);
      await cleanup();
      if (sound && prefs.current.gong && prefs.current.volume > 0) await playGong();
    } finally { lock.current = false; setBusy(false); }
  };

  useEffect(() => {
    mounted.current = true;
    void (async () => {
      try {
        const stored = await readStored();
        if (!mounted.current) return;
        const nextSettings = restoreSettings(stored.settings);
        const time = Date.now();
        const next = restoreTimer(stored.timer, nextSettings.minutes, time);
        journal.current = restoreHistory(stored.history);
        activeSession.current = restoreActiveSession(stored.activeSession);
        if (next.status === 'idle') activeSession.current = null;
        if (next.status === 'completed') {
          // Recover completion using the original deadline, not the time of reopening.
          const original = stored.timer as TimerState;
          recordSession(original?.status === 'running' ? original : next, time);
        } else if (!activeSession.current && (next.status === 'running' || next.status === 'paused')) {
          // Adopt a session from the previous version; older sessions had no journal metadata.
          const startedAt = next.endsAt !== null ? next.endsAt - next.durationMs : time - (next.durationMs - next.remainingMs);
          activeSession.current = newSession(Math.max(1, Math.min(time, startedAt)));
        }
        save(next, nextSettings);
        if (next.status !== 'running') await cleanup();
      } catch { setNotice('No se han podido cargar tus preferencias. Puedes iniciar una nueva sesión.'); }
      finally { if (mounted.current) setReady(true); }
    })();
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const tick = (allowSound: boolean) => {
      const time = Date.now(); setNow(time);
      if (lock.current) return;
      const next = transition(state.current, { type: 'tick', now: time });
      if (next.status === 'completed' && state.current.status === 'running') {
        // Never ring again when returning to a session that ended in the background.
        void complete(next, allowSound);
      }
    };
    const interval = setInterval(() => { if (AppState.currentState === 'active' || Platform.OS === 'web') tick(true); }, 200);
    const listener = AppState.addEventListener('change', value => {
      if (value === 'active') tick(false);
    });
    return () => { clearInterval(interval); listener.remove(); };
  }, [ready]);

  useEffect(() => {
    if (timer.status !== 'running' || !settings.keepAwake) return;
    let cancelled = false;
    void activateKeepAwakeAsync('meditation').then(() => {
      if (cancelled) void deactivateKeepAwake('meditation');
    }).catch(() => setNotice('No se ha podido mantener la pantalla encendida.'));
    return () => { cancelled = true; void deactivateKeepAwake('meditation'); };
  }, [timer.status, settings.keepAwake]);

  const run = async (task: () => Promise<void>) => {
    if (lock.current || !ready) return;
    lock.current = true; setBusy(true);
    try { await task(); }
    finally { lock.current = false; setBusy(false); }
  };
  const start = () => run(async () => {
    if (state.current.status === 'running') return;
    let alertsAllowed = false;
    try { alertsAllowed = await prepareAlerts(prefs.current.language); }
    catch { setNotice('No se ha podido preparar el aviso al bloquear la pantalla. Mantén la app abierta.'); }
    if (!alertsAllowed && Platform.OS !== 'web') setNotice('Sin permiso de notificaciones: mantén la app abierta para escuchar el gong.');
    const isNewSession = state.current.status !== 'paused';
    const startedAt = Date.now();
    const next = transition(state.current, { type: 'start', now: startedAt });
    if (isNewSession) {
      activeSession.current = newSession(startedAt);
      setSessionSequence(value => value + 1);
    }
    if (prefs.current.dnd && focus.available) {
      try { focus.begin(next.endsAt!); }
      catch { setNotice('No molestar no está activo. Comprueba sus permisos en Ajustes.'); }
    }
    if (alertsAllowed) {
      try { await scheduleAlert(next.endsAt!, prefs.current); }
      catch { setNotice('No se ha podido programar el aviso. Mantén la app abierta para escuchar el gong.'); }
    }
    setNow(Date.now()); save(next);
    if (isNewSession && prefs.current.gongStart && prefs.current.volume > 0) await playGong();
  });
  const pause = () => run(async () => {
    const next = transition(state.current, { type: 'pause', now: Date.now() });
    if (next.status === 'completed') recordSession(state.current, Date.now());
    save(next); await cleanup();
    if (next.status === 'completed' && prefs.current.gong) await playGong();
  });
  const requestFinish = () => run(async () => {
    const time = Date.now();
    const current = state.current;
    if (current.status === 'idle') return;
    setSessionSequence(value => value + 1);
    player.pause();
    const next = transition(current, { type: 'pause', now: time });
    if (next.status === 'completed') {
      recordSession(current, time);
      save(idleTimer(prefs.current.minutes));
    } else {
      // Freeze and persist before asking: decision time must not count as practice.
      save(next);
      finishRequestedAt.current = time;
      setConfirmFinish(true);
    }
    await cleanup();
  });
  const resolveFinish = (keep: boolean) => run(async () => {
    if (finishRequestedAt.current === null) return;
    if (keep) recordSession(state.current, finishRequestedAt.current);
    else activeSession.current = null;
    finishRequestedAt.current = null;
    save(idleTimer(prefs.current.minutes));
    setConfirmFinish(false);
  });
  const cancelFinish = () => {
    if (lock.current) return;
    finishRequestedAt.current = null;
    setConfirmFinish(false);
  };
  const deleteRecord = (id: string) => {
    if (!ready) return;
    journal.current = journal.current.filter(record => record.id !== id);
    save(state.current);
  };
  const updateSettings = (patch: Partial<Settings>) => {
    const next = restoreSettings({ ...prefs.current, ...patch });
    const current = state.current;
    save(current.status === 'idle' || current.status === 'completed' ? idleTimer(next.minutes) : current, next);
  };
  return { settings, timer, history, ready, busy, notice, sessionSequence, deleteRecord, clearNotice: () => setNotice(''), updateSettings, start, pause, requestFinish, resolveFinish, cancelFinish, confirmFinish, playGong,
    remainingMs: remaining(timer, now) };
}
