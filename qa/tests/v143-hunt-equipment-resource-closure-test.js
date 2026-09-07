import assert from 'node:assert/strict';
import {
  EQUIPMENT_ANTI_DOWNGRADE_RESOURCE,
  EQUIPMENT_ENHANCE_ESSENCE_RESOURCE,
  EQUIPMENT_TRANSFER_GEM_RESOURCE,
} from '../../dist/core/equipment.js';
import {
  AFFIX_FAMILY_CHANGE_RESOURCE_V115,
  equipmentEssenceResourceForItemV143,
  reforgeCostV115,
  refineAffixCostV115,
} from '../../dist/core/equipment-reforge-v115.js';
import {
  V122_ALL_DUNGEON_IDS,
  V122_FORGE_DUNGEON_ID,
  V122_FORGE_FLOORS,
  V122_TARGET_SET_DUNGEONS,
  equipmentResourceSourceCoverageV143,
  lootDungeonIdsForRealmV122,
} from '../../dist/core/loot-economy-v122.js';
import {
  EQUIPMENT_FRAGMENT_CRAFT_COST_V142,
  EQUIPMENT_FRAGMENT_UPGRADE_RATIO_V142,
  huntEquipmentFragmentDropTableV142,
} from '../../dist/core/equipment-fragments-v142.js';
import {
  EQUIPMENT_SET_FRAGMENT_ENGRAVE_COST_V142,
  targetSetForDungeonFloorV142,
} from '../../dist/core/equipment-set-fragments-v142.js';
import { EQUIPMENT_SET_CATALOG_V142, EQUIPMENT_V142_SCHEMA } from '../../dist/core/equipment-v142.js';
import { huntBossMechanicsV123 } from '../../dist/core/pve-progression-v123.js';
import { buildEndlessHuntKernelEnemyV2 } from '../../dist/core/endless-hunt-combat-kernel-v2.js';

// Ranked-item creation loop is complete: drops -> fragments -> 50/item -> 3:1 upward refinement.
assert.equal(EQUIPMENT_FRAGMENT_CRAFT_COST_V142, 50);
assert.equal(EQUIPMENT_FRAGMENT_UPGRADE_RATIO_V142, 3);
for (const currentRank of [1, 5, 11, 20, 28]) {
  const table = huntEquipmentFragmentDropTableV142(currentRank, 8);
  assert.ok(table.some(row => row.rankIndex === currentRank && row.chancePct > 0), `rank ${currentRank} Hunt must drop its own fragment at a rare rate`);
  assert.ok(table.some(row => row.rankIndex < currentRank && row.chancePct > 0), `rank ${currentRank} Hunt must also drop lower fragments`);
  assert.ok(table.every(row => row.rankIndex <= currentRank), `rank ${currentRank} Hunt cannot drop above current realm`);
}

// Every live per-item sink has a concrete dedicated material source.
const coverage = equipmentResourceSourceCoverageV143();
assert.equal(coverage.enhancementEssence, true, 'Cường Hóa must have Khí Luyện Tinh Hoa source');
assert.equal(coverage.affixFamilyChange, true, 'Tái Luyện family change must have Chuyển Tính Thạch source');
assert.equal(coverage.antiDowngrade, true, 'Bùa Chống Tụt must have source');
assert.equal(coverage.enhancementTransfer, true, 'Ngọc Chuyển Cường Hóa must have source');
const sourceIds = new Set(coverage.sourceIds);
for (const id of [EQUIPMENT_ENHANCE_ESSENCE_RESOURCE, AFFIX_FAMILY_CHANGE_RESOURCE_V115, EQUIPMENT_ANTI_DOWNGRADE_RESOURCE, EQUIPMENT_TRANSFER_GEM_RESOURCE]) {
  assert.ok(sourceIds.has(id), `missing dedicated source for ${id}`);
}
assert.equal(V122_FORGE_FLOORS.length, 8);
assert.ok(V122_FORGE_FLOORS.every(floor => floor.guardianResources.some(row => row.resourceId === EQUIPMENT_ENHANCE_ESSENCE_RESOURCE && ((row.chancePct ?? 0) > 0 || row.firstClearGuaranteed))), 'every forge checkpoint must source canonical enhancement/reforge essence');

// V142 Tái Luyện/Tinh Luyện must not stay silently on old Phàm-grade costs.
const low = { schema: EQUIPMENT_V142_SCHEMA, equipmentRankIndex: 1, grade: 'mundane', reforgeCount: 0, affixes: [{ id: 'dummy', family: 'offense', rollPct: 80, value: 1 }] };
const high = { ...low, equipmentRankIndex: 20, affixes: low.affixes.map(x => ({ ...x })) };
assert.equal(equipmentEssenceResourceForItemV143(low), EQUIPMENT_ENHANCE_ESSENCE_RESOURCE);
assert.equal(reforgeCostV115(low).essenceResourceId, EQUIPMENT_ENHANCE_ESSENCE_RESOURCE);
assert.equal(refineAffixCostV115(low, 0).essenceResourceId, EQUIPMENT_ENHANCE_ESSENCE_RESOURCE);
assert.ok(reforgeCostV115(high).spiritStones > reforgeCostV115(low).spiritStones, 'V142 Tái Luyện cost must scale with equipment rank');
assert.ok(refineAffixCostV115(high, 0).equipmentEssence > refineAffixCostV115(low, 0).equipmentEssence, 'V142 Tinh Luyện essence cost must scale with equipment rank');

// Live Set identity has a concrete targeted source. Old Bát Đạo Set lane is no longer surfaced.
assert.equal(EQUIPMENT_SET_FRAGMENT_ENGRAVE_COST_V142, 50);
assert.ok(V122_ALL_DUNGEON_IDS.includes(V122_TARGET_SET_DUNGEONS.daoAttire), 'historic dungeon ID remains known for migration');
const liveAtEndgame = lootDungeonIdsForRealmV122(118);
assert.ok(liveAtEndgame.includes(V122_FORGE_DUNGEON_ID));
assert.ok(liveAtEndgame.includes(V122_TARGET_SET_DUNGEONS.elementAttire));
assert.ok(liveAtEndgame.includes(V122_TARGET_SET_DUNGEONS.jewelry));
assert.ok(!liveAtEndgame.includes(V122_TARGET_SET_DUNGEONS.daoAttire), 'retired Dao-attire Set dungeon must not remain a live V142 source');
const targeted = new Set();
for (let floor = 1; floor <= 5; floor++) targeted.add(targetSetForDungeonFloorV142(V122_TARGET_SET_DUNGEONS.elementAttire, floor)?.id);
for (let floor = 1; floor <= 4; floor++) targeted.add(targetSetForDungeonFloorV142(V122_TARGET_SET_DUNGEONS.jewelry, floor)?.id);
targeted.delete(undefined);
assert.deepEqual([...targeted].sort(), EQUIPMENT_SET_CATALOG_V142.map(set => set.id).sort(), 'dedicated Set dungeons must cover every live V142 Set identity');

// Five Boss families each carry three actual registered-style runtime skill templates, including <=30% HP ultimate phase.
assert.deepEqual(Object.keys(huntBossMechanicsV123).sort(), ['Earth', 'Fire', 'Metal', 'Water', 'Wood']);
for (const [element, boss] of Object.entries(huntBossMechanicsV123)) {
  assert.equal(boss.element, element);
  assert.equal(boss.skills.length, 3, `${element} Boss must expose three authored skills`);
  assert.ok(boss.skills.every(skill => skill.id && skill.name && skill.role && skill.effect && skill.runtimeSkillId), `${element} Boss skill package incomplete`);
  assert.equal(boss.enrageHpPct, 30);
  assert.equal(boss.counterGroups.length, 2, `${element} Boss must keep two build-counter groups`);
  const fakeRegistry = { skills: new Map(boss.skills.map(skill => [skill.runtimeSkillId, { id: skill.runtimeSkillId }])) };
  const enemy = buildEndlessHuntKernelEnemyV2({
    registry: fakeRegistry,
    monster: { id: `boss.${element}`, name: `Boss ${element}`, grade: 'boss', hpLog10: 4, attackLog10: 2, defenseLog10: 2, tags: [], elements: [element] },
    enemyStatMultiplier: 1,
    bossMechanic: { ...boss, verdict: 'none' },
  });
  for (const skill of boss.skills) assert.ok(enemy.skillIds.includes(skill.runtimeSkillId), `${element} runtime missing ${skill.runtimeSkillId}`);
  const ultimate = enemy.aiProfile.rules.find(rule => rule.skillId === 'skill.boss.v81.cataclysm');
  assert.deepEqual(ultimate?.conditions, [{ type: 'selfHpBelow', pct: 30 }], `${element} ultimate must be final-30%-HP phase gated`);
}

console.log('V143 Hunt/Equipment resource-source and Boss-skill closure PASS');
