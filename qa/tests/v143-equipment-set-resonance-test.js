import assert from 'node:assert/strict';
import { cloneEquipmentState } from '../../dist/core/equipment.js';
import { craftRankedEquipmentV142, engraveRankedEquipmentSetV142 } from '../../dist/core/equipment-crafting-v142.js';
import { grantEquipmentFragmentRankV142 } from '../../dist/core/equipment-fragments-v142.js';
import {
  EQUIPMENT_SET_CATALOG_V142,
  equipmentSetDefinitionV142,
} from '../../dist/core/equipment-v142.js';
import {
  equipmentSetFragmentBalanceV142,
  equipmentSetHasFullIdentityV143,
  equipmentSetResonanceBonusForItemV143,
  equipmentSetResonanceLevelV143,
  grantEquipmentSetFragmentV142,
  settleEquipmentSetResonanceV143,
  syncEquipmentSetResonanceItemsV143,
} from '../../dist/core/equipment-set-fragments-v142.js';

assert.deepEqual(EQUIPMENT_SET_CATALOG_V142,[],'V143 Set Resonance cannot remain live after Ngũ Hành retirement');
const setId='set.v142.attire.metal';
assert.equal(equipmentSetDefinitionV142(setId)?.retired,true,'historical Set identity remains readable only as metadata');

const state={equipmentSetFragmentsV142:{schema:'equipment.set-fragments.v143',bySetId:{[setId]:150},resonanceBySetId:{[setId]:3},resonanceUnlockedSetIds:[setId],totalDrops:0,totalEngraved:0,totalResonanceLevels:3}};
const equipment={items:[{id:'legacy.v143',schema:'equipment.v142',slot:'weapon',equipmentRankIndex:5,setId,setResonanceLevelV143:3,setResonanceBonusStatsV143:{attack:999},stats:{attack:1234}}],equipped:{weapon:'legacy.v143'}};

assert.equal(equipmentSetHasFullIdentityV143(equipment,setId),false);
assert.deepEqual(equipmentSetResonanceBonusForItemV143(equipment.items[0],setId,999),{});
assert.equal(syncEquipmentSetResonanceItemsV143(equipment,setId,999),0);
const settlement=settleEquipmentSetResonanceV143(state,equipment,setId);
assert.equal(settlement.retired,true);
assert.equal(settlement.unlocked,false);
assert.equal(settlement.fullNow,false);
assert.equal(settlement.gainedLevels,0);
assert.equal(equipmentSetResonanceLevelV143(state,setId),3,'legacy resonance level remains readable for compatibility');
assert.equal(equipmentSetFragmentBalanceV142(state,setId),150,'legacy wallet remains readable without auto-spend');
const before=structuredClone(state);
const grant=grantEquipmentSetFragmentV142(state,setId,100,'qa');
assert.equal(grant.ignored,true);
assert.equal(grant.retired,true);
assert.deepEqual(state,before,'retired Tàn Ấn grant must not mutate compatibility state');

// Generic ranked equipment crafting stays live, but any attempt to create new Set identity is blocked.
const liveState={};
const liveEquipment={items:[],equipped:{},unlockedSetIds:[]};
grantEquipmentFragmentRankV142(liveState,5,100,'qa');
const weapon=craftRankedEquipmentV142(liveState,liveEquipment,{slot:'weapon',rankIndex:5,seed:8100}).item;
assert.throws(()=>engraveRankedEquipmentSetV142(liveState,liveEquipment,weapon.id,setId),/retire/i);
assert.equal(weapon.setId,undefined);

// Legacy resonance metadata survives clone transport but remains data only, not a live bonus owner.
const cloned=cloneEquipmentState(equipment);
assert.equal(cloned.items[0].setId,setId);
assert.equal(cloned.items[0].setResonanceLevelV143,3);
assert.deepEqual(cloned.items[0].setResonanceBonusStatsV143,{attack:999});

console.log('V143 Set Resonance retirement PASS');
