/** Shared pill quality scale used by Alchemy. Recovery itself is unified under Thương Thế in V140. */
export const PILL_QUALITY_MULTIPLIER = Object.freeze({ low: 1, mid: 1.25, high: 1.6, supreme: 2.2 });
export const PILL_QUALITY_BASE_WEIGHTS = Object.freeze({ low: 65, mid: 27, high: 7, supreme: 1 });
export const PILL_QUALITY_LABEL = Object.freeze({ low: 'Hạ phẩm', mid: 'Trung phẩm', high: 'Thượng phẩm', supreme: 'Cực phẩm' });
export const INJURY_NATURAL_RECOVERY_PER_REAL_HOUR = 4;
export function applyNaturalInjuryRecovery(state, realSeconds, recoveryBonusPct = 0) {
  const seconds = Math.max(0, Number(realSeconds) || 0);
  const before = Math.max(0, Math.min(100, Number(state?.injury) || 0));
  if (seconds <= 0 || before <= 0) return 0;
  const multiplier = 1 + Math.max(0, Number(recoveryBonusPct) || 0) / 100;
  const recovered = Math.min(before, INJURY_NATURAL_RECOVERY_PER_REAL_HOUR * multiplier * seconds / 3600);
  state.injury = Math.max(0, before - recovered);
  return recovered;
}
export function injuryConditionSummary(state) {
  const injury = Math.max(0, Math.min(100, Number(state?.injury) || 0));
  return { injury, healthy: injury <= 20, naturalRecoveryPerRealHour: INJURY_NATURAL_RECOVERY_PER_REAL_HOUR };
}
export function rollPillQuality(roll01) {
  const roll = Math.max(0, Math.min(0.999999999, Number(roll01) || 0)) * 100;
  if (roll < PILL_QUALITY_BASE_WEIGHTS.low) return 'low';
  if (roll < PILL_QUALITY_BASE_WEIGHTS.low + PILL_QUALITY_BASE_WEIGHTS.mid) return 'mid';
  if (roll < PILL_QUALITY_BASE_WEIGHTS.low + PILL_QUALITY_BASE_WEIGHTS.mid + PILL_QUALITY_BASE_WEIGHTS.high) return 'high';
  return 'supreme';
}
