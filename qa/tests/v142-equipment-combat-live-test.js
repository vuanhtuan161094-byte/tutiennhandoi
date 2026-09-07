import assert from 'node:assert/strict';
import { CombatEngine } from '../../dist/core/combat.js';
import { applyEquipmentToEntity, attemptEquipmentEnhancement } from '../../dist/core/equipment.js';
import {
  EQUIPMENT_ATTIRE_SLOTS_V142,
  EQUIPMENT_JEWELRY_SLOTS_V142,
  EQUIPMENT_SET_CATALOG_V142,
} from '../../dist/core/equipment-v142.js';

const baseStats = {
  maxHp: 100000,
  maxSpirit: 100,
  attack: 100,
  defense: 0,
  mobility: 1,
  accuracy: 1,
  resolve: 1,
  controlPower: 1,
  actionSpeed: 1,
  critChancePct: 0,
  critDamagePct: 150,
  critPowerPerLayer: 0.5,
  heartChancePct: 0,
  dodgeChancePct: 0,
  armorPenPct: 0,
  damageReductionPct: 0,
  spiritEfficiencyPct: 0,
  cooldownReductionPct: 0,
};
function baseEntity(id) {
  return {
    id,
    combatModel: 'locked-v1',
    name: id,
    tags: [],
    stats: { ...baseStats },
    skillIds: [],
    triggers: [],
    aiProfile: { name: 'QA', rules: [] },
    phases: [],
  };
}
function equipmentForSet(set) {
  const slots = set.category === 'attire' ? EQUIPMENT_ATTIRE_SLOTS_V142 : EQUIPMENT_JEWELRY_SLOTS_V142;
  const items = [];
  const equipped = {};
  for (const slot of slots) {
    const item = {
      id: `qa.${set.key}.${slot}`,
      schema: 'equipment.v142',
      slot,
      setId: set.id,
      stats: {},
      affixes: [],
      traitIds: [],
      gemSockets: [],
      enhancementLevel: 0,
      grade: 'mundane',
      tier: 0,
      quality: 'mid',
      source: { seed: 1 },
    };
    items.push(item);
    equipped[slot] = item.id;
  }
  return { items, equipped, unlockedSetIds: [] };
}
function entityWithSet(set) {
  return applyEquipmentToEntity(baseEntity('source'), equipmentForSet(set), new Map());
}
function setByKey(key) {
  const set = EQUIPMENT_SET_CATALOG_V142.find(candidate => candidate.key === key);
  assert.ok(set, `missing V142 set ${key}`);
  return set;
}

const metal = entityWithSet(setByKey('metal'));
assert.equal(metal.stats.breakEffectPct, 18, 'Kim 4 món phải đi vào Phá Thế thật.');
assert.equal(metal.stats.brokenTargetDamagePct, 30, 'Kim 6 món phải tăng damage lên mục tiêu Thất Thế thật.');
assert.equal(metal.stats.breakPowerPct, undefined, 'Không giữ stat breakPowerPct giả/không có consumer.');

const wood = entityWithSet(setByKey('wood'));
assert.equal(wood.stats.dotDamagePct, 18);
assert.equal(wood.stats.healingEffectivenessPct, 25);
const water = entityWithSet(setByKey('water'));
assert.equal(water.stats.trueEssenceScalingPct, 20);
assert.equal(water.stats.shieldEffectPct, 30);
const earth = entityWithSet(setByKey('earth'));
assert.equal(earth.stats.counterDamagePct, 30);
const fire = entityWithSet(setByKey('fire'));
assert.equal(fire.stats.critChancePct, 12);
assert.equal(fire.stats.critDamagePct, 180);
const huyenNguyen = entityWithSet(setByKey('huyen_nguyen'));
assert.equal(huyenNguyen.stats.spiritEfficiencyPct, 8);
assert.equal(huyenNguyen.stats.cooldownReductionPct, 10);

const registry = {
  status() { throw new Error('QA combat should not request a status definition'); },
  skill() { throw new Error('QA combat should not request a skill definition'); },
  elementalReactions: new Map(),
};
const damageContext = sourceTag => ({
  sourceTag,
  coefficient: 1,
  targetMaxHpPct: 0,
  targetMaxHpAttackCapCoefficient: 0,
  breakDamagePct: 0,
  canCrit: false,
  canDodge: false,
  canHeart: false,
  unavoidable: true,
  trueDamage: false,
  procCoefficient: 0,
  skillId: undefined,
  elementalCoefficients: undefined,
  primaryElement: undefined,
  cooldownDamageBonusPct: 0,
  runtimeEffectBonusPct: 0,
  runtimeBreakBonusPct: 0,
});
function hitWith(sourceDef, sourceTag = 'ActiveHit', { broken = false, spirit = 100, breakDamagePct = 0 } = {}) {
  const targetDef = baseEntity('target');
  const engine = new CombatEngine(registry, 142, [structuredClone(sourceDef), targetDef]);
  const source = engine.entities.get(sourceDef.id);
  const target = engine.entities.get('target');
  source.spirit = spirit;
  if (broken) target.breakDebuffUntil = 5;
  const ctx = { ...damageContext(sourceTag), breakDamagePct };
  const outcome = engine.applyDamage(source, target, ctx, 0);
  return { engine, source, target, outcome };
}

const plain = hitWith(baseEntity('source')).outcome.hpDamage;
const dot = hitWith(wood, 'DoT').outcome.hpDamage;
assert.ok(Math.abs(dot / plain - 1.18) < 1e-9, `Mộc DoT phải +18%, got ${dot / plain}`);
const counter = hitWith(earth, 'Counter').outcome.hpDamage;
assert.ok(Math.abs(counter / plain - 1.30) < 1e-9, `Thổ Counter phải +30%, got ${counter / plain}`);
const metalNormal = hitWith(metal, 'ActiveHit').outcome.hpDamage;
const brokenMetal = hitWith(metal, 'ActiveHit', { broken: true }).outcome.hpDamage;
assert.ok(Math.abs(brokenMetal / metalNormal - 1.30) < 1e-9, `Kim 6 món phải +30% riêng khi mục tiêu Thất Thế, got ${brokenMetal / metalNormal}`);
const waterFull = hitWith(water, 'ActiveHit', { spirit: water.stats.maxSpirit }).outcome.hpDamage;
const waterHalf = hitWith(water, 'ActiveHit', { spirit: water.stats.maxSpirit / 2 }).outcome.hpDamage;
assert.ok(Math.abs(waterFull / plain - 1.20) < 1e-9, `Thủy đầy Chân Nguyên phải +20%, got ${waterFull / plain}`);
assert.ok(Math.abs(waterHalf / plain - 1.10) < 1e-9, `Thủy 50% Chân Nguyên phải +10%, got ${waterHalf / plain}`);
const breakHit = hitWith(metal, 'ActiveHit', { breakDamagePct: 10 });
assert.ok(Math.abs(breakHit.target.poise - 88.2) < 1e-9, `Kim Phá Thế 18% phải biến 10 thành 11.8, poise=${breakHit.target.poise}`);

{
  const engine = new CombatEngine(registry, 143, [structuredClone(huyenNguyen), baseEntity('target')]);
  const source = engine.entities.get('source');
  const profile = engine.cooldownFor(source, { id: 'skill.qa', tags: [], cooldown: 10, spiritCost: 0 }, 0);
  assert.ok(Math.abs(profile.actualCooldown - 9) < 1e-9, `Huyền Nguyên CDR 10% phải cho cooldown 9s, got ${profile.actualCooldown}`);
}

assert.throws(
  () => attemptEquipmentEnhancement({ items: [{ id: 'v142-cap', schema: 'equipment.v142', enhancementLevel: 15, grade: 'mundane', tier: 0 }] }, 'v142-cap', 0, 0, false, {}),
  /\+15/,
  'Core enhancement phải tự khóa V142 ở +15, không chỉ session wrapper.',
);

console.log('V142 equipment combat live effects PASS');
