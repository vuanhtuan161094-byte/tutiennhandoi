/**
 * V129 power-equivalence budget helpers.
 * Raw percentages are intentionally not compared 1:1: bounded/high-leverage
 * stats (DR, Lifesteal, Crit, CDR, Xuyên) carry larger equivalence weights.
 */
export const MAJOR_SYSTEM_BANDS_V129 = Object.freeze({
  setThreshold2: Object.freeze({ min: 13, max: 20 }),
  setThreshold4: Object.freeze({ min: 20, max: 31 }),
  setThreshold6: Object.freeze({ min: 27, max: 42 }),
  setFull: Object.freeze({ min: 64, max: 86 }),
  rootOriginChoice: Object.freeze({ min: 10, max: 70 }),
  rootOriginPeak: Object.freeze({ min: 30, max: 70 }),
});

const WEIGHTS = Object.freeze({
  attackPct: 1,
  maxHpPct: .8,
  physiquePct: .8,
  defensePct: .8,
  armorPenPct: 1.8,
  breakBonusPct: 1,
  damageBonusPct: 1,
  dotDamagePct: 1,
  counterDamagePct: 1,
  healingPct: 1,
  healingReceivedPct: .75,
  lifeStealPct: 3.5,
  spiritRegenPct: .9,
  spiritEfficiencyPct: 1.4,
  cooldownReductionPct: 1.8,
  critChancePct: 2.2,
  critDamagePct: .75,
  damageReductionPct: 3,
  dodgePct: 2.6,
  maxSpiritPct: .65,
  actionSpeedPct: 1.6,
  controlDurationPct: .6,
  resourceGenerationPct: .55,
  effectPct: .8,
  breakPct: .8,
  healPct: .7,
  shieldPct: .7,
  controlPct: .55,
});

export function inPowerBandV129(value, band) {
  return Number.isFinite(value) && value >= band.min - 1e-9 && value <= band.max + 1e-9;
}

export function powerEquivalentPackageV129(pkg = {}) {
  let score = 0;
  for (const [key, raw] of Object.entries(pkg || {})) {
    const value = Number(raw);
    if (!Number.isFinite(value) || value === 0) continue;
    if (key === 'costPct') {
      // Negative cost = upside; positive cost = authored downside.
      score += (-value) * .9;
      continue;
    }
    if (key === 'cyclePct') {
      score += (-value) * 1.0;
      continue;
    }
    const weight = WEIGHTS[key] ?? .5;
    score += Math.max(0, value) * weight;
  }
  return score;
}

export function rootOriginPowerEquivalentV129(def) {
  if (!def) return 0;
  return powerEquivalentPackageV129(def.static) + powerEquivalentPackageV129(def.hunt);
}
