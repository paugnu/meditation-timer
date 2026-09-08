import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { AmbienceId } from '../ambience';

const sources: Partial<Record<AmbienceId, number>> = {
  rain: require('../../assets/ambience/rain.wav'),
  waves: require('../../assets/ambience/waves.wav'),
};
const FADE_MS = 1500, STEP_MS = 50;

/**
 * Crossfades looping background sound while a meditation is running: choosing a sound is
 * silent until the timer moves, and pausing or finishing fades it out. It shares the gong's
 * volume setting, so one slider governs everything the app plays.
 *
 * One engine drives every player from a single destination held in a ref, so a re-render can
 * never resurrect a track that is on its way out. Players are created on first use and kept,
 * which makes a switch a pure volume ramp. Silence is a destination like any other, which is
 * what lets 'none' fade instead of cut.
 */
export function useAmbience(id: AmbienceId, running: boolean, volume: number, holdUntil: number, onError: (message: string) => void) {
  const players = useRef(new Map<string, AudioPlayer>());
  const levels = useRef(new Map<string, number>());
  const pending = useRef(new Set<ReturnType<typeof setTimeout>>());
  const goal = useRef<AmbienceId | null>(null);
  const ticker = useRef<ReturnType<typeof setInterval> | null>(null);
  const configured = useRef(false);
  const [foreground, setForeground] = useState(AppState.currentState === 'active');
  const [, bump] = useState(0);
  const wasForeground = useRef(foreground);
  const level = useRef(volume);
  level.current = volume;

  // Reads refs only, so this closure is created once and stays valid for the component's life.
  const settle = useRef(() => {
    let moving = false;
    for (const [key, player] of players.current) {
      const target = key === goal.current ? level.current : 0;
      const current = levels.current.get(key) ?? 0;
      // Step from whichever end is louder, so a fade lasts FADE_MS at any volume setting.
      const step = Math.max(target, current, .1) * STEP_MS / FADE_MS;
      const next = current < target ? Math.min(target, current + step) : Math.max(target, current - step);
      if (next === current) continue;
      try {
        levels.current.set(key, next);
        player.volume = next;
        moving = true;
        if (current === 0) player.play();  // Leaving silence: start once, never on every tick.
        if (next === 0) {
          // Pausing a play() that has not landed yet rejects it, which is exactly what
          // stepping quickly through the list does. The track is already inaudible, so let
          // it run on and stop it once things have settled -- unless it is wanted again.
          const later = setTimeout(() => {
            pending.current.delete(later);
            if ((levels.current.get(key) ?? 0) === 0) { try { player.pause(); } catch { /* gone */ } }
          }, 2000);
          pending.current.add(later);
        }
      } catch { /* A player torn down mid-fade simply stops moving. */ }
    }
    if (!moving && ticker.current) { clearInterval(ticker.current); ticker.current = null; }
  }).current;

  // An opening gong holds the ambience back until it is nearly over. This is read during
  // render, not stored: set from an effect it would still be stale on the commit that starts
  // the session, and the ambience would slip in before the gong.
  const released = holdUntil <= Date.now();
  useEffect(() => {
    const wait = holdUntil - Date.now();
    if (wait <= 0) return;
    const timer = setTimeout(() => bump(value => value + 1), wait);
    return () => clearTimeout(timer);
  }, [holdUntil]);

  useEffect(() => {
    const listener = AppState.addEventListener('change', value => setForeground(value === 'active'));
    return () => {
      listener.remove();
      if (ticker.current) { clearInterval(ticker.current); ticker.current = null; }
      for (const later of pending.current) clearTimeout(later);
      pending.current.clear();
      for (const player of players.current.values()) { try { player.remove(); } catch { /* already gone */ } }
      players.current.clear(); levels.current.clear();
    };
  }, []);

  useEffect(() => {
    const wanted: AmbienceId | null = running && foreground && released && id !== 'none' ? id : null;
    goal.current = wanted;
    const returned = foreground && !wasForeground.current;
    wasForeground.current = foreground;
    if (wanted) {
      try {
        if (!players.current.has(wanted)) {
          const source = sources[wanted];
          if (source) {
            const player = createAudioPlayer(source);
            player.loop = true; player.volume = 0;
            players.current.set(wanted, player); levels.current.set(wanted, 0);
          }
        }
        // Leaving the app freezes the ramp and the system stops playback, so the stored level
        // no longer matches reality. Come back from silence and fade in again.
        const existing = players.current.get(wanted);
        if (returned && existing) { levels.current.set(wanted, 0); try { existing.volume = 0; } catch { /* gone */ } }
        if (!configured.current) {
          configured.current = true;
          // Mix rather than duck: the gong has to ring over the ambience, not replace it.
          void setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' }).catch(() => {});
        }
      } catch { onError('No se ha podido reproducir el sonido de fondo.'); return; }
    }
    if (!ticker.current) ticker.current = setInterval(settle, STEP_MS);
    settle();
  }, [id, running, volume, foreground, released, onError, settle]);
}
