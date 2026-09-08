import { Language, validLanguage } from './i18n';
import { clampMinutes } from './timer';
export const COLORS = [
  { name: 'Terracota', value: '#85471E' }, { name: 'Azul', value: '#6579FF' },
  { name: 'Verde', value: '#4FBA9A' }, { name: 'Rosa', value: '#DF7A9D' },
] as const;
export type Settings = { language: Language; minutes: number; theme: 'dark' | 'light'; color: string; gong: boolean; gongStart: boolean; volume: number; keepAwake: boolean; dnd: boolean };
export const defaults: Settings = { language: 'es', minutes: 20, theme: 'dark', color: COLORS[0].value, gong: true, gongStart: false, volume: 0.7, keepAwake: true, dnd: false };
export function restoreSettings(value: unknown): Settings {
  const s = (value && typeof value === 'object' ? value : {}) as Partial<Settings>;
  return {
    language: validLanguage(s.language),
    minutes: clampMinutes(typeof s.minutes === 'number' ? s.minutes : defaults.minutes),
    theme: s.theme === 'light' ? 'light' : 'dark',
    color: COLORS.some(c => c.value === s.color) ? s.color! : defaults.color,
    gongStart: typeof s.gongStart === 'boolean' ? s.gongStart : defaults.gongStart,
    gong: typeof s.gong === 'boolean' ? s.gong : defaults.gong,
    volume: typeof s.volume === 'number' && Number.isFinite(s.volume) ? Math.max(0, Math.min(1, s.volume)) : defaults.volume,
    keepAwake: typeof s.keepAwake === 'boolean' ? s.keepAwake : defaults.keepAwake,
    dnd: typeof s.dnd === 'boolean' ? s.dnd : defaults.dnd,
  };
}
