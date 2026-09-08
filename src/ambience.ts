/** Background ambiences. Order is the cycle order of the on-screen selector. */
export const ambiences = ['none', 'rain', 'waves'] as const;
export type AmbienceId = typeof ambiences[number];
export const ambienceLabels: Record<AmbienceId, string> = {
  none: 'Sin sonido de fondo',
  rain: 'Lluvia suave',
  waves: 'Olas del mar',
};
export function validAmbience(value: unknown): AmbienceId {
  return ambiences.includes(value as AmbienceId) ? value as AmbienceId : 'none';
}
/** Wraps around, so one arrow reaches every option and always returns to silence. */
export function stepAmbience(current: unknown, step: number): AmbienceId {
  const index = ambiences.indexOf(validAmbience(current));
  const size = ambiences.length;
  return ambiences[(((index + step) % size) + size) % size];
}

/**
 * How long the ambience waits before fading in behind an opening gong. It should swell out of
 * the gong's decay rather than land on top of it, so the fade starts shortly before the gong
 * ends. Capped so an unexpectedly long recording cannot leave the meditation in silence.
 */
export function ambienceLeadMs(gongSeconds: number, overlapMs = 2500, capMs = 20000): number {
  const seconds = Number.isFinite(gongSeconds) && gongSeconds > 0 ? gongSeconds : 15.8;
  return Math.max(0, Math.min(capMs, seconds * 1000 - overlapMs));
}
