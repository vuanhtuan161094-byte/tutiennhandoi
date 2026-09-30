import assert from 'node:assert/strict';
import {
  EQUIPMENT_ATTIRE_SLOTS_V142,
  EQUIPMENT_JEWELRY_SLOTS_V142,
  EQUIPMENT_REALM_NAMES_V142,
  EQUIPMENT_SET_CATALOG_V142,
  EQUIPMENT_SLOTS_V142,
  EQUIPMENT_SANG_THE_INDEX_V142,
  equipmentSetDefinitionV142,
  equipmentSetPowerV142,
} from '../../dist/core/equipment-v142.js';

assert.equal(EQUIPMENT_REALM_NAMES_V142.length, 29, 'Phàm + 28 đại cảnh.');
assert.equal(EQUIPMENT_SANG_THE_INDEX_V142, 28);
assert.equal(EQUIPMENT_ATTIRE_SLOTS_V142.length, 6);
assert.equal(EQUIPMENT_JEWELRY_SLOTS_V142.length, 4);
assert.equal(EQUIPMENT_SLOTS_V142.length, 10);

// Ngũ Hành equipment Set gameplay is retired. Historical ids remain readable only as inert metadata.
assert.deepEqual(EQUIPMENT_SET_CATALOG_V142, []);
const legacySet = equipmentSetDefinitionV142('set.v142.attire.fire');
assert.equal(legacySet?.retired, true);
assert.equal(legacySet?.category, 'attire');
assert.deepEqual(legacySet?.bonuses, []);

const legacyItems = [{ id:'legacy.weapon', schema:'equipment.v142', slot:'weapon', setId:'set.v142.attire.fire' }];
const power = equipmentSetPowerV142({ items:legacyItems, equipped:{weapon:'legacy.weapon'} });
assert.deepEqual(power, { flatStats:{}, statMultipliers:{}, activeSets:[] });

console.log('V142 equipment core retirement PASS');
