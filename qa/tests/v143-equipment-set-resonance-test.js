import assert from 'node:assert/strict';
import { cloneEquipmentState } from '../../dist/core/equipment.js';
import { boundedStatCapV129 } from '../../dist/core/combat-rules.js';
import { craftRankedEquipmentV142, engraveRankedEquipmentSetV142 } from '../../dist/core/equipment-crafting-v142.js';
import { grantEquipmentFragmentRankV142 } from '../../dist/core/equipment-fragments-v142.js';
import {
  EQUIPMENT_SET_CATALOG_V142,
  EQUIPMENT_ATTIRE_SLOTS_V142,
  equipmentBaseStatsForRankV142,
} from '../../dist/core/equipment-v142.js';
import {
  EQUIPMENT_SET_RESONANCE_RESERVE_V143,
  EQUIPMENT_SET_RESONANCE_STEP_COST_V143,
  equipmentSetFragmentBalanceV142,
  equipmentSetHasFullIdentityV143,
  equipmentSetResonanceBonusForItemV143,
  equipmentSetResonanceLevelV143,
  grantEquipmentSetFragmentV142,
} from '../../dist/core/equipment-set-fragments-v142.js';

assert.equal(EQUIPMENT_SET_RESONANCE_STEP_COST_V143, 50);
assert.equal(EQUIPMENT_SET_RESONANCE_RESERVE_V143, 50);

const set = EQUIPMENT_SET_CATALOG_V142.find(x => x.id === 'set.v142.attire.metal');
assert.ok(set);
const state = {};
const equipment = { items: [], equipped: {}, unlockedSetIds: [] };
const rank = 5;
grantEquipmentFragmentRankV142(state, rank, 300, 'qa');
for (let i = 0; i < EQUIPMENT_ATTIRE_SLOTS_V142.length; i++) {
  craftRankedEquipmentV142(state, equipment, { slot: EQUIPMENT_ATTIRE_SLOTS_V142[i], rankIndex: rank, seed: 8100 + i });
}

// Before the full six-piece identity exists, even a large Tàn Ấn stockpile remains spendable and never auto-burns.
grantEquipmentSetFragmentV142(state, set.id, 400, 'qa', equipment);
assert.equal(equipmentSetResonanceLevelV143(state, set.id), 0);
assert.equal(equipmentSetFragmentBalanceV142(state, set.id), 400);
assert.equal(equipmentSetHasFullIdentityV143(equipment, set.id), false);

// Engraving the sixth distinct slot completes the identity. Remaining excess converts automatically,
// while exactly one 50-fragment replacement reserve is kept.
for (const item of equipment.items) engraveRankedEquipmentSetV142(state, equipment, item.id, set.id);
assert.equal(equipmentSetHasFullIdentityV143(equipment, set.id), true);
assert.equal(equipmentSetResonanceLevelV143(state, set.id), 1);
assert.equal(equipmentSetFragmentBalanceV142(state, set.id), 50);
assert.ok(equipment.items.every(item => item.setResonanceLevelV143 === 1));

// Endless sink: every later 50 excess Tàn Ấn is meaningful forever. +100 gives two more levels, reserve stays 50.
grantEquipmentSetFragmentV142(state, set.id, 100, 'qa.endless', equipment);
assert.equal(equipmentSetResonanceLevelV143(state, set.id), 3);
assert.equal(equipmentSetFragmentBalanceV142(state, set.id), 50);
assert.ok(equipment.items.every(item => item.setResonanceLevelV143 === 3));

// Metal resonance grows raw Công and is idempotently rebuilt from canonical rank stats, not compounded on repeated sync.
const weapon = equipment.items.find(item => item.slot === 'weapon');
const baseWeapon = equipmentBaseStatsForRankV142('weapon', rank);
assert.ok(weapon.stats.attack > baseWeapon.attack);
assert.equal(weapon.stats.attack, baseWeapon.attack + weapon.setResonanceBonusStatsV143.attack);

// Resonance metadata survives normal equipment save/clone transport.
const cloned = cloneEquipmentState(equipment);
const clonedWeapon = cloned.items.find(item => item.id === weapon.id);
assert.equal(clonedWeapon.setResonanceLevelV143, 3);
assert.deepEqual(clonedWeapon.setResonanceBonusStatsV143, weapon.setResonanceBonusStatsV143);

// Jewelry resonance only targets bounded combat stats, so Lv∞ approaches hard caps instead of breaking them.
for (const jewelrySet of EQUIPMENT_SET_CATALOG_V142.filter(x => x.category === 'jewelry')) {
  const fake = { slot: 'ring', equipmentRankIndex: 10 };
  const bonus = equipmentSetResonanceBonusForItemV143(fake, jewelrySet.id, 1000);
  assert.ok(Object.keys(bonus).length > 0, `${jewelrySet.name} resonance must have a live effect`);
  for (const key of Object.keys(bonus)) assert.notEqual(boundedStatCapV129(key), undefined, `${jewelrySet.name} resonance stat ${key} must have a hard cap`);
}

console.log('V143 infinite Set Resonance PASS');
