import assert from 'node:assert/strict';
import { applyEquipmentToEntity, attemptEquipmentEnhancement } from '../../dist/core/equipment.js';
import { EQUIPMENT_SET_CATALOG_V142, equipmentSetPowerV142 } from '../../dist/core/equipment-v142.js';

assert.deepEqual(EQUIPMENT_SET_CATALOG_V142, [], 'V142 Ngũ Hành equipment Sets are retired from live combat.');

const legacyItem = {
  id:'legacy.v142.weapon', schema:'equipment.v142', slot:'weapon', equipmentRankIndex:0, equipmentRankName:'Phàm',
  setId:'set.v142.attire.fire', setResonanceLevelV143:9, setResonanceBonusStatsV143:{attack:979},
  stats:{attack:999}, affixes:[], traitIds:[], gemSockets:[], tags:['SetV142:fire'], enhancementLevel:0, grade:'mundane', tier:0,
};
const legacyEquipment = {items:[legacyItem],equipped:{weapon:legacyItem.id},unlockedSetIds:['set.v142.attire.fire']};
assert.deepEqual(equipmentSetPowerV142(legacyEquipment),{flatStats:{},statMultipliers:{},activeSets:[]});

const base={
  id:'source',name:'source',combatModel:'locked-v1',tags:[],triggers:[],skillIds:[],aiProfile:{name:'QA',rules:[]},
  stats:{maxHp:100000,maxSpirit:100,attack:100,defense:100,mobility:100,accuracy:100,resolve:100,controlPower:100,actionSpeed:1,critChancePct:0,critPowerPerLayer:.5,heartChancePct:0,dodgeChancePct:0},
  combatBuildV117:{activeSetMechanics:[{mechanic:'legacy_set'}]},
};
const applied=applyEquipmentToEntity(base,legacyEquipment,new Map());
assert.deepEqual(applied.combatBuildV117.activeSetMechanics,[],'retired Set mechanics must not reach CombatEngine');
assert.equal(applied.tags.some(tag=>String(tag).startsWith('SetV142:')),false,'retired Set tags must not reach the combat entity');
assert.ok(applied.stats.attack<1000,'stored legacy Set resonance must not survive as live attack power');

assert.throws(
  () => attemptEquipmentEnhancement({ items: [{ id: 'v142-cap', schema: 'equipment.v142', enhancementLevel: 15, grade: 'mundane', tier: 0 }] }, 'v142-cap', 0, 0, false, {}),
  /\+15/,
  'Core enhancement must still hard-cap V142 at +15.',
);

console.log('V142 equipment combat retirement PASS');
