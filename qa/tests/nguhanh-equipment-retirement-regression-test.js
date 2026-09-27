import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseWebClientSave } from '../../dist/core/web-save.js';
import {
  V128_EQUIPMENT_GEMS, equipmentGemSocketCountV128, equipmentGemEffectV128,
  socketEquipmentGemV128, upgradeEquipmentGemV128, unsocketEquipmentGemV128,
} from '../../dist/core/equipment-inscription-gem-v128.js';
import {
  LIVE_EQUIPMENT_SET_CATALOG_V12310, activeEquipmentSetMechanicsV116, isLiveEquipmentSetV12310,
} from '../../dist/core/equipment-set-v116.js';
import {
  EQUIPMENT_SET_CATALOG_V142, equipmentSetPowerV142, grantEquipmentSetFragmentsV142,
  rollElementSetFragmentFromHuntV142, engraveEquipmentSetV142, craftEquipmentFromFragmentsV142,
} from '../../dist/core/equipment-v142.js';
import {
  EQUIPMENT_AFFIX_DEFINITIONS_V114, equipmentAffixPowerV114,
} from '../../dist/core/equipment-affix-v114.js';
import { addEquipment, applyEquipmentToEntity, cloneEquipmentState, equipmentPower } from '../../dist/core/equipment.js';

const legacyItem = {
  id: 'legacy.nguhanh.item', templateId: 'legacy.template', name: 'Legacy', slot: 'weapon', tier: 1, grade: 'mystic', quality: 'mid',
  enhancementLevel: 0, traitIds: ['trait.element.fire'], affixes: [{ id: 'affix.element.fire.affinity', family: 'element', exclusiveGroup: 'element.Fire.affinity', value: 99, rollPct: 100, buildAffix: true }],
  gemSockets: [{ element: 'fire', level: 5, spentBlanks: 11 }], setId: 'set.v142.attire.fire', stats: { attack: 10 }, tags: ['SetV142:fire'], source: {}, acquiredWorldYear: 0,
};
const legacyEquipment = { items: [legacyItem], equipped: { weapon: legacyItem.id }, unlockedSetIds: ['set.v116.attire.dainhat_phanthien'] };
const legacySave = parseWebClientSave({ clientSaveVersion: 1, client: 'tutien-web', savedAtUnixMs: 1, game: { equipment: legacyEquipment, resources: { gemBlanks: 77 } } });
assert.equal(legacySave.game.equipment.items[0].gemSockets[0].element, 'fire');
assert.equal(legacySave.game.equipment.items[0].setId, 'set.v142.attire.fire');
assert.equal(legacySave.game.resources.gemBlanks, 77);
const cloned = cloneEquipmentState(legacyEquipment);
assert.equal(cloned.items[0].gemSockets[0].level, 5, 'legacy gem field remains readable');
assert.equal(cloned.items[0].setId, 'set.v142.attire.fire', 'legacy set field remains readable');

assert.deepEqual(V128_EQUIPMENT_GEMS, []);
assert.equal(equipmentGemSocketCountV128(legacyItem), 0);
assert.equal(equipmentGemEffectV128(legacyItem.gemSockets[0]), undefined);
for (const mutate of [socketEquipmentGemV128, upgradeEquipmentGemV128, unsocketEquipmentGemV128]) assert.throws(() => mutate(legacyItem, 0, 'fire', {}), /retire/i);
assert.deepEqual(LIVE_EQUIPMENT_SET_CATALOG_V12310, []);
assert.equal(isLiveEquipmentSetV12310('set.v116.attire.dainhat_phanthien'), false);
assert.deepEqual(activeEquipmentSetMechanicsV116(legacyEquipment), []);
assert.deepEqual(EQUIPMENT_SET_CATALOG_V142, []);
assert.deepEqual(equipmentSetPowerV142(legacyEquipment), { flatStats: {}, statMultipliers: {}, activeSets: [] });
assert.equal(rollElementSetFragmentFromHuntV142(['Fire'], 'boss', true, 0), undefined);
const setWalletState = { equipmentProgressionV142: { setFragments: { legacy: '50' } } };
const beforeWallet = structuredClone(setWalletState);
assert.equal(grantEquipmentSetFragmentsV142(setWalletState, 'set.v142.attire.fire', 5, 'qa').ignored, true);
assert.deepEqual(setWalletState, beforeWallet, 'retired set grant must not mutate legacy wallet');
assert.throws(() => engraveEquipmentSetV142({}, legacyEquipment, legacyItem.id, legacyItem.setId), /retire/i);

assert.equal(EQUIPMENT_AFFIX_DEFINITIONS_V114.some(def => def.family === 'element'), false);
const oldAffixPower = equipmentAffixPowerV114(legacyItem, 0);
assert.deepEqual(oldAffixPower.elementalAffinities, {});
assert.deepEqual(oldAffixPower.elementalResistancesPct, {});
const fakeSetCatalog = new Map([[legacyItem.setId, { name: 'Legacy Set', bonuses: [{ pieces: 1, name: 'Must stay inert', flatStats: { attack: 999 } }] }]]);
const oldEquipmentPower = equipmentPower(legacyEquipment, fakeSetCatalog);
assert.deepEqual(oldEquipmentPower.elementalAffinities, {});
assert.deepEqual(oldEquipmentPower.elementalResistancesPct, {});
assert.deepEqual(oldEquipmentPower.activeSets, []);
assert.deepEqual(oldEquipmentPower.activeSetMechanics, []);
assert.equal(oldEquipmentPower.grantedTags.some(tag => /^Equipment(Element|Gem):/.test(tag)), false);
assert.ok(Number(oldEquipmentPower.flatStats.attack || 0) < 999, 'legacy Set bonus must not enter flat power');
const rootBase = { stats: { attack: 100, elementalAffinities: { Fire: { pct: 25, evolutionMultiplier: 1 } }, elementalResistancesPct: { Fire: 5 } }, tags: [], triggers: [], combatBuildV117: { activeSetMechanics: [{ mechanic: 'legacy_set' }] } };
const applied = applyEquipmentToEntity(rootBase, legacyEquipment, fakeSetCatalog);
assert.deepEqual(applied.stats.elementalAffinities, rootBase.stats.elementalAffinities, 'Linh Căn/base affinity must be preserved');
assert.deepEqual(applied.stats.elementalResistancesPct, rootBase.stats.elementalResistancesPct, 'base resistance must be preserved');
assert.deepEqual(applied.combatBuildV117.activeSetMechanics, [], 'equipment Set mechanics must be removed');

const addTarget = { items: [], equipped: {}, unlockedSetIds: [] };
addEquipment(addTarget, legacyItem);
assert.equal(addTarget.items[0].setId, undefined);
assert.deepEqual(addTarget.items[0].gemSockets, []);
assert.equal(addTarget.items[0].affixes.some(affix => affix.family === 'element'), false);
assert.equal(addTarget.items[0].traitIds.some(id => id.startsWith('trait.element.')), false);

const newState = { equipmentProgressionV142: { fragments: '1000000' } };
const newEquipment = { items: [], equipped: {} };
const crafted = craftEquipmentFromFragmentsV142(newState, newEquipment, 'weapon', 0, 123, 0).item;
assert.equal(crafted.setId, undefined);
assert.equal((crafted.gemSockets ?? []).length, 0);
assert.equal((crafted.affixes ?? []).some(affix => affix.family === 'element'), false);

const entry = fs.readFileSync('standalone-entry.js', 'utf8');
const ui = fs.readFileSync('modules/nguhanh-equipment-retirement-ui.js', 'utf8');
assert.match(entry, /nguhanh-equipment-retirement-ui\.js/);
for (const token of ['data-gem-socket', 'data-gem-upgrade', 'data-gem-unsocket', 'data-v142-engrave', 'data-inventory-view="sets"', 'v138233-set-screen', 'v13819-element-detail']) assert.ok(ui.includes(token), `retired UI guard missing ${token}`);

console.log('NGUHANH EQUIPMENT RETIREMENT REGRESSION: PASS');
