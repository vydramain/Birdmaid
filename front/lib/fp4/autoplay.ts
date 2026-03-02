/**
 * FP4 autoplay policy — when blocked, show "Press Play".
 */

export function shouldShowPressPlay(autoplayBlocked: boolean): boolean {
  return autoplayBlocked;
}
