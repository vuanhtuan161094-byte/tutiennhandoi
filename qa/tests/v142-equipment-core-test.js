import assert from 'node:assert/strict';
import {
  EQUIPMENT_ATTIRE_SLOTS_V142,
  EQUIPMENT_JEWELRY_SLOTS_V142,
  EQUIPMENT_REALM_NAMES_V142,
  EQUIPMENT_SET_CATALOG_V142,
  EQUIPMENT_SLOTS_V142,
  EQUIPMENT_SANG_THE_INDEX_V142,
  equipmentSetPowerV142,
} from '../../dist/core/equipment-v142.js';

assert.equal(EQUIPMENT_REALM_NAMES_V142.length, 29, 'Phàm + 28 đại cảnh.');
assert.equal(EQUIPMENT_SANG_THE_INDEX_V142, 28);
assert.equal(EQUIPMENT_ATTIRE_SLOTS_V142.length, 6);
assert.equal(EQUIPMENT_JEWELRY_SLOTS_V142.length, 4);
assert.equal(EQUIPMENT_SLOTS_V142.length, 10);
assert.equal(EQUIPMENT_SET_CATALOG_V142.filter(x => x.category === 'attire').length, 5);
assert.equal(EQUIPMENT_SET_CATALOG_V142.filter(x => x.category === 'jewelry').length, 4);

for (const set of EQUIPMENT_SET_CATALOG_V142.filter(x => x.category === 'attire')) {
  assert.ok(set.bonuses.some(x => x.pieces === 6), `${set.name} phải có mốc 6 món.`);
}
for (const set of EQUIPMENT_SET_CATALOG_V142.filter(x => x.category === 'jewelry')) {
  assert.ok(set.bonuses.some(x => x.pieces === 4), `${set.name} phải có mốc 4 món.`);
}

const attireSet = EQUIPMENT_SET_CATALOG_V142.find(x => x.category === 'attire');
const jewelrySet = EQUIPMENT_SET_CATALOG_V142.find(x => x.category === 'jewelry');
const items = [];
const equipped = {};
for (const slot of EQUIPMENT_ATTIRE_SLOTS_V142) {
  const item = { id: `i.${slot}`, schema: 'equipment.v142', slot, setId: attireSet.id };
  items.push(item); equipped[slot] = item.id;
}
for (const slot of EQUIPMENT_JEWELRY_SLOTS_V142) {
  const item = { id: `j.${slot}`, schema: 'equipment.v142', slot, setId: jewelrySet.id };
  items.push(item); equipped[slot] = item.id;
}
const power = equipmentSetPowerV142({ items, equipped });
assert.ok(power.activeSets.some(x => x.setId === attireSet.id && x.pieces === 6));
assert.ok(power.activeSets.some(x => x.setId === jewelrySet.id && x.pieces === 4));

console.log('V142 equipment core PASS');
