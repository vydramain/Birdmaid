/**
 * FP4 Media Player — timeline seek: map pointer x to time.
 * computeSeekTime(x, rect, duration) clamps to [0, duration].
 * isSeekDisabled(duration) => true when duration not finite.
 */

export function computeSeekTime(x: number, rect: DOMRect, duration: number): number {
  if (!Number.isFinite(duration) || duration <= 0) return 0;
  const w = rect.width;
  if (w <= 0) return 0;
  const frac = (x - rect.left) / w;
  const t = frac * duration;
  return Math.max(0, Math.min(duration, t));
}

export function isSeekDisabled(duration: number): boolean {
  return !Number.isFinite(duration) || duration <= 0;
}
