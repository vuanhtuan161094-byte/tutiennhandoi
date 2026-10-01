// Body Dao production authority (B1/B6).
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
    // Body B5: this is a production reaction to a real target cast/channel,
    // not an encounter-scripted counterWindow action.
    runtimeV117: Object.freeze({ requiresCounterWindow: false }),
    fiveStatScalingV5: Object.freeze({ body: 1.20, agility: 0.80, sense: 0.80 }),
    fiveStatBaselineCoefficientV5: 2.80,
  }),
  'skill.dao.body.immovable': Object.freeze({
    effects: Object.freeze([shieldPct(18, 3)]),
  }),
  'skill.dao.body.counter': Object.freeze({
    // Auto eligibility is targetIsCasting + Phản Thế. Do not require the
    // separate Boss encounter counterWindow contract as a second hidden gate.
    runtimeV117: Object.freeze({ requiresCounterWindow: false }),
    fiveStatScalingV5: Object.freeze({ power: 1.20, body: 1.20, sense: 0.80 }),
    fiveStatBaselineCoefficientV5: 3.20,
  }),
  'skill.dao.body.elephant': Object.freeze({
    // B6 keeps the historical id for save/loadout compatibility but replaces
    // the redundant independent heavy strike with an intentional Huyết–Công activation.
    name: 'Nhiên Huyết Chấn Thân',
    description: 'Chủ động hao 10% Max HP để mở Huyết Bạo 6 giây, tăng damage skill Thể; Sinh Mệnh tự trả không sinh Phản Thế.',
    cooldown: 12,
    castTime: 0,
    recoveryTime: .7,
    effects: Object.freeze([]),
    daoRuntimeV118: Object.freeze({ signature: 'bodyBloodRush', elementRole: 'signature' }),
    runtimeV117: Object.freeze({
      form: 'instant',
      domains: Object.freeze(['Dao:body', 'NormalActive', 'Utility', 'BodyBloodRush']),
    }),
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
    daoRuntimeV118: patch.daoRuntimeV118 ? { ...(skill.daoRuntimeV118 ?? {}), ...patch.daoRuntimeV118 } : skill.daoRuntimeV118,
    runtimeV117: patch.runtimeV117 ? {
      ...(skill.runtimeV117 ?? {}),
      ...patch.runtimeV117,
      domains: patch.runtimeV117.domains ? [...patch.runtimeV117.domains] : [...(skill.runtimeV117?.domains ?? [])],
    } : skill.runtimeV117,
    fiveStatScalingV5: patch.fiveStatScalingV5 ? { ...patch.fiveStatScalingV5 } : skill.fiveStatScalingV5,
  };
}

export function bodyDaoProductionSkillsV1(skills) {
  return skills.map(bodyDaoProductionSkillV1);
}
