// Body Dao production authority (B1).
// Keeps historical skill ids stable while moving live registry values onto the five-stat model.

export const BODY_DAO_PRODUCTION_SCHEMA_V1 = 'body-dao.production.v1';

const shieldPct = (maxHpPct, duration) => ({
  type: 'shield', capacity: 0, maxHpPct, stability: 100, duration,
});
const healPct = maxHpPct => ({ type: 'heal', maxHpPct, target: 'self' });

export const BODY_DAO_PRODUCTION_PATCH_V1 = Object.freeze({
  'skill.dao.body.basic': Object.freeze({
    fiveStatScalingV5: Object.freeze({ power: 1.40, body: 1.40 }),
    fiveStatBaselineCoefficientV5: 2.80,
  }),
  'skill.dao.body.guard': Object.freeze({
    effects: Object.freeze([shieldPct(12, 3.5)]),
  }),
  'skill.dao.body.transform': Object.freeze({
    fiveStatScalingV5: Object.freeze({ body: 1.20, agility: 0.80, sense: 0.80 }),
    fiveStatBaselineCoefficientV5: 2.80,
  }),
  'skill.dao.body.immovable': Object.freeze({
    effects: Object.freeze([shieldPct(18, 3)]),
  }),
  'skill.dao.body.counter': Object.freeze({
    fiveStatScalingV5: Object.freeze({ power: 1.20, body: 1.20, sense: 0.80 }),
    fiveStatBaselineCoefficientV5: 3.20,
  }),
  'skill.dao.body.elephant': Object.freeze({
    fiveStatScalingV5: Object.freeze({ power: 1.50, body: 1.50 }),
    fiveStatBaselineCoefficientV5: 3.00,
  }),
  'skill.dao.body.break': Object.freeze({
    fiveStatScalingV5: Object.freeze({ power: 1.20, body: 0.80, sense: 1.20 }),
    fiveStatBaselineCoefficientV5: 3.20,
  }),
  'skill.dao.body.recover': Object.freeze({
    effects: Object.freeze([healPct(8), shieldPct(6, 4)]),
  }),
  'skill.dao.body.finisher': Object.freeze({
    fiveStatScalingV5: Object.freeze({ power: 1.40, body: 1.20, sense: 1.00 }),
    fiveStatBaselineCoefficientV5: 3.60,
  }),
  'skill.dao.body.ultimate': Object.freeze({
    effects: Object.freeze([shieldPct(28, 5), healPct(10)]),
  }),
});

export function bodyDaoProductionSkillV1(skill) {
  const patch = BODY_DAO_PRODUCTION_PATCH_V1[skill?.id];
  if (!patch) return skill;
  return {
    ...skill,
    ...patch,
    productionAuthorityV1: BODY_DAO_PRODUCTION_SCHEMA_V1,
    effects: patch.effects ? patch.effects.map(effect => ({ ...effect })) : (skill.effects ?? []).map(effect => ({ ...effect })),
    fiveStatScalingV5: patch.fiveStatScalingV5 ? { ...patch.fiveStatScalingV5 } : skill.fiveStatScalingV5,
  };
}

export function bodyDaoProductionSkillsV1(skills) {
  return skills.map(bodyDaoProductionSkillV1);
}
