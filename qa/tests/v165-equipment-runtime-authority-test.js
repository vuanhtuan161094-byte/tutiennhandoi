import assert from 'node:assert/strict';
import fs from 'node:fs';
import { normalizeCanonicalEquipmentAfterRestore } from '../../dist/core/session-restore.js';
import {
  EQUIPMENT_MAX_ENHANCEMENT_V142,
  EQUIPMENT_V142_SCHEMA,
  equipmentSetDefinitionV142,
  equipmentSetPowerV142,
} from '../../dist/core/equipment-v142.js';

const session = fs.readFileSync('dist/core/session.js', 'utf8');
const combatFactory = fs.readFileSync('dist/core/combat-kernel-v2.js', 'utf8');
const crafting = fs.readFileSync('dist/core/equipment-crafting-v142.js', 'utf8');
const equipment = fs.readFileSync('dist/core/equipment.js', 'utf8');

// State authority: V142 progression lives inside the single canonical state.equipment channel.
assert.match(session, /craftRankedEquipmentV142\(this\.stateValue, this\.stateValue\.equipment/);
assert.match(session, /equipmentCraftingSummaryV142\(this\.stateValue, this\.stateValue\.equipment\)/);
assert.match(session, /buildPlayerCombatEntityV1/);
assert.match(combatFactory, /applyEquipmentToEntity\(character, state\.equipment, registry\.equipmentSets\)/);
assert.equal((combatFactory.match(/applyEquipmentToEntity\(/g) ?? []).length, 1, 'canonical player factory must compose equipment exactly once');

// Save/load authority: restore must enforce the +15 cap and keep retired Set identity as read-only compatibility metadata.
const restoreFixture = {
  equipment: {
    items: [
      {
        id: 'v142-overcap', schema: EQUIPMENT_V142_SCHEMA, enhancementLevel: 20,
        tier: 9, grade: 'breaker', quality: 'perfect', traitIds: ['trait.crit_focus'],
        daoInscription: { id: 'dao.v128.heavenly_craft' }, gemSockets: [{ element: 'fire', level: 5 }],
        setId: 'set.v116.attire.taibach_canhkim', setResonanceLevelV143: 99,
      },
      { id: 'legacy20', schema: 'equipment.v1', enhancementLevel: 20, grade: 'breaker' },
      { id: 'v142-negative', schema: EQUIPMENT_V142_SCHEMA, enhancementLevel: -7 },
      { id: 'v142-valid-set', schema: EQUIPMENT_V142_SCHEMA, enhancementLevel: 7, setId: 'set.v142.attire.metal', setResonanceLevelV143: 4 },
    ],
  },
};
normalizeCanonicalEquipmentAfterRestore(restoreFixture);
const sanitized = restoreFixture.equipment.items[0];
assert.equal(sanitized.enhancementLevel, EQUIPMENT_MAX_ENHANCEMENT_V142);
assert.equal(sanitized.tier, 0);
assert.equal(sanitized.grade, 'mundane');
assert.equal(sanitized.quality, 'mid');
assert.deepEqual(sanitized.traitIds, []);
assert.equal(sanitized.daoInscription, undefined);
assert.deepEqual(sanitized.gemSockets, []);
assert.equal(sanitized.setId, undefined, 'legacy V116 set cannot survive on a canonical V142 item');
assert.equal(sanitized.setResonanceLevelV143, 0);
assert.equal(restoreFixture.equipment.items[1].enhancementLevel, 20, 'legacy equipment keeps its independent +20 compatibility cap');
assert.equal(restoreFixture.equipment.items[1].grade, 'breaker', 'legacy equipment semantics are not rewritten by V165');
assert.equal(restoreFixture.equipment.items[2].enhancementLevel, 0);
assert.equal(restoreFixture.equipment.items[3].setId, 'set.v142.attire.metal', 'retired V142 Set identity must remain readable');
assert.equal(restoreFixture.equipment.items[3].setResonanceLevelV143, 4, 'retired resonance metadata may remain readable but inert');

const retiredSetDefinition = equipmentSetDefinitionV142('set.v142.attire.metal');
assert.equal(retiredSetDefinition?.id, 'set.v142.attire.metal');
assert.equal(retiredSetDefinition?.retired, true);
assert.deepEqual(retiredSetDefinition?.bonuses, [], 'retired Set metadata must not expose gameplay bonuses');

// Canonical V142 crafting cannot silently resurrect retired Grade/Gem/Dao-Wen progression.
assert.match(crafting, /gemSockets: \[\]/);
assert.match(crafting, /equipmentCompatGradeForRankV142/);
for (const method of ['engraveDaoInscriptionV115', 'socketEquipmentGemV128', 'upgradeEquipmentGemV128', 'unsocketEquipmentGemV128']) {
  const start = session.indexOf(`    ${method}(`);
  assert.ok(start >= 0, `missing ${method}`);
  const end = session.indexOf('\n    }', start);
  const block = session.slice(start, end);
  assert.ok(block.includes("item.schema === 'equipment.v142'"), `${method} must reject V142 items`);
}

// Retired Set authority: legacy V142 Set ids may remain readable, but Set power is always inert.
const setState = {
  items: [
    { id: 'weapon', schema: EQUIPMENT_V142_SCHEMA, slot: 'weapon', setId: 'set.v142.attire.metal' },
    { id: 'head', schema: EQUIPMENT_V142_SCHEMA, slot: 'head', setId: 'set.v142.attire.metal' },
  ],
  equipped: { weapon: 'weapon', head: 'head' },
};
assert.deepEqual(
  equipmentSetPowerV142(setState),
  { flatStats: {}, statMultipliers: {}, activeSets: [] },
  'retired V142 Set ids must contribute zero gameplay power',
);

// Combat adapter keeps one final V142 Set composition seam; the retirement facade above makes it inert.
assert.match(equipment, /const v142SetPower = equipmentSetPowerV142\(state\)/);
assert.match(equipment, /activeSets\.push\(\.\.\.v142SetPower\.activeSets\)/);

console.log('V165 Equipment runtime authority B1 PASS');
