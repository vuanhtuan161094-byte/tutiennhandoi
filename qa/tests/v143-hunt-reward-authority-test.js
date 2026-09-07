import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { RESOURCE_PVE_DUNGEONS_V12329 } from '../../dist/core/resource-pve-v12329.js';
import { equipmentResourceSourceCoverageV143 } from '../../dist/core/loot-economy-v122.js';

const sessionSource = await readFile(new URL('../../dist/core/session.js', import.meta.url), 'utf8');
const fightStart = sessionSource.indexOf('    fightEndlessFloor(options = {}) {');
const fightEnd = sessionSource.indexOf('    equipmentCombatImpact(itemId) {', fightStart);
assert.ok(fightStart >= 0 && fightEnd > fightStart, 'must isolate canonical Hunt reward method');
const fight = sessionSource.slice(fightStart, fightEnd);

// Dedicated-system progression resources must not be minted by Hunt anymore.
for (const token of [
  'resource.enhancement_protection_talisman',
  'resource.enhancement_transfer_gem',
  'BLOODLINE_ESSENCE_RESOURCE_ID',
  'BODY_ESSENCE_RESOURCE_ID',
  'BLOODLINE_PROTECTION_RESOURCE_ID',
  'specialEquipmentDrops',
  'bloodlineEssenceDrops',
  'bodyEssenceDrops',
  'bloodlineProtectionDrops',
]) {
  assert.ok(!fight.includes(token), `Hunt must not own dedicated-system reward ${token}`);
}

// Intentional Hunt lanes stay live until their replacement/source authority is explicitly closed.
for (const token of [
  'settleRealHuntEquipmentFragmentsV142',
  'trueBloodResourceId',
  'TECHNIQUE_INSIGHT_RESOURCE_ID',
  'rootQualityMaterialDropsFromHuntV131',
]) {
  assert.ok(fight.includes(token), `intentional Hunt reward lane missing: ${token}`);
}

// The resources removed from Hunt still have concrete dedicated production sources.
const bloodline = RESOURCE_PVE_DUNGEONS_V12329.find(x => x.category === 'bloodline');
const physique = RESOURCE_PVE_DUNGEONS_V12329.find(x => x.category === 'physique');
assert.ok(bloodline, 'bloodline resource dungeon must remain live');
assert.ok(physique, 'physique resource dungeon must remain live');
assert.equal(bloodline.name, 'Thái Cổ Huyết Uyên');
assert.equal(physique.name, 'Luyện Thể Cổ Cảnh');

const equipmentSources = equipmentResourceSourceCoverageV143();
assert.equal(equipmentSources.enhancementEssence, true);
assert.equal(equipmentSources.affixFamilyChange, true);
assert.equal(equipmentSources.antiDowngrade, true);
assert.equal(equipmentSources.enhancementTransfer, true);

console.log('V143 Hunt reward authority cleanup PASS');
