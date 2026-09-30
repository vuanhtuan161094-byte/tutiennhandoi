import assert from 'node:assert/strict';
import { craftRankedEquipmentV142, engraveRankedEquipmentSetV142 } from '../../dist/core/equipment-crafting-v142.js';
import { grantEquipmentFragmentRankV142 } from '../../dist/core/equipment-fragments-v142.js';
import { EQUIPMENT_SET_CATALOG_V142, equipmentSetDefinitionV142 } from '../../dist/core/equipment-v142.js';
import { equipmentSetFragmentBalanceV142, grantEquipmentSetFragmentV142 } from '../../dist/core/equipment-set-fragments-v142.js';

assert.deepEqual(EQUIPMENT_SET_CATALOG_V142,[],'no V142 Set may remain live');
const retiredSetId='set.v142.attire.fire';
assert.equal(equipmentSetDefinitionV142(retiredSetId)?.retired,true,'retired Set id remains readable as metadata');

const state = {};
const equipment = { items: [], equipped: {}, unlockedSetIds: [] };
grantEquipmentFragmentRankV142(state, 5, 100, 'qa');
const weapon = craftRankedEquipmentV142(state, equipment, { slot: 'weapon', rankIndex: 5, seed: 1 }).item;

const grant=grantEquipmentSetFragmentV142(state, retiredSetId, 50, 'qa');
assert.equal(grant.ignored,true);
assert.equal(grant.retired,true);
assert.equal(equipmentSetFragmentBalanceV142(state, retiredSetId),0);
assert.throws(()=>engraveRankedEquipmentSetV142(state,equipment,weapon.id,retiredSetId),/retire/i);
assert.equal(weapon.setId,undefined,'failed retired engraving must not mutate the item');
assert.equal(weapon.tags.some(tag=>String(tag).startsWith('SetV142:')),false);

console.log('V142 equipment Set engraving retirement PASS');
