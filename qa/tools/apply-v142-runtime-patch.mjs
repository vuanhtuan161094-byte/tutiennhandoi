import fs from 'node:fs';

function replaceOnce(text, pattern, replacement, label) {
  if (typeof pattern === 'string') {
    const count = text.split(pattern).length - 1;
    if (count !== 1) throw new Error(`${label}: expected exactly 1 string match, got ${count}`);
    return text.replace(pattern, replacement);
  }
  const matches = [...text.matchAll(new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`))];
  if (matches.length !== 1) throw new Error(`${label}: expected exactly 1 regex match, got ${matches.length}`);
  return text.replace(pattern, replacement);
}

function patchSession() {
  const path = 'dist/core/session.js';
  let text = fs.readFileSync(path, 'utf8');
  if (!text.includes("from './equipment-hunt-v142.js'")) {
    text = replaceOnce(
      text,
      "import { buildHuntProductionV110 } from './hunt-production-v110.js';",
      "import { buildHuntProductionV110 } from './hunt-production-v110.js';\nimport { huntEquipmentFragmentPreviewV142, settleRealHuntEquipmentFragmentsV142, settleVirtualHuntEquipmentFragmentsV142 } from './equipment-hunt-v142.js';\nimport { craftRankedEquipmentV142, equipmentCraftingSummaryV142, mergeRankedEquipmentV142, refineRankedEquipmentFragmentsV142 } from './equipment-crafting-v142.js';",
      'session imports',
    );
  }

  if (!text.includes('equipmentFragmentPreviewV142: fragmentPreviewV142')) {
    const oldPreview = "        const equipmentChancePct = Math.min(7.5, huntEconomyDropChances('common', loot).equipmentChancePct * .32 * (1 + map.zone * .035));\n        return { ...base, available: true, floorName: `Tầng ${map.zoneFloor}`, zoneName: map.zoneName, mobName: mob.name, mobLevel: mob.level, mobHp: formatLogMagnitude({ log10: mobHpLog10 }), mobElements: [...mob.elements], mobTags: [...mob.tags], spiritStonesPerKill, spiritStonesPerHour: base.killsPerHour * spiritStonesPerKill, demonCoreChancePct, demonCoresPerHour: base.killsPerHour * demonCoreChancePct / 100 + base.elitePerHour * 1.5, equipmentChancePct, equipmentRollsPerHour: base.killsPerHour * equipmentChancePct / 100 };";
    const newPreview = "        const equipmentChancePct = Math.min(7.5, huntEconomyDropChances('common', loot).equipmentChancePct * .32 * (1 + map.zone * .035));\n        const equipmentRollsPerHour = base.killsPerHour * equipmentChancePct / 100;\n        const fragmentPreviewV142 = huntEquipmentFragmentPreviewV142({ majorRealmIndex: map.majorRealmIndex, zone: map.zone, equipmentEventsPerHour: equipmentRollsPerHour });\n        return { ...base, available: true, floorName: `Tầng ${map.zoneFloor}`, zoneName: map.zoneName, mobName: mob.name, mobLevel: mob.level, mobHp: formatLogMagnitude({ log10: mobHpLog10 }), mobElements: [...mob.elements], mobTags: [...mob.tags], spiritStonesPerKill, spiritStonesPerHour: base.killsPerHour * spiritStonesPerKill, demonCoreChancePct, demonCoresPerHour: base.killsPerHour * demonCoreChancePct / 100 + base.elitePerHour * 1.5, equipmentChancePct, equipmentRollsPerHour, equipmentFragmentPreviewV142: fragmentPreviewV142 };";
    text = replaceOnce(text, oldPreview, newPreview, 'virtual preview');
  }

  if (!text.includes("source: `hunt.virtual.${farm.floor}`")) {
    const virtualBlock = /        const equipmentRolls = deterministicBinomialV77\(kills, farm\.equipmentChancePct \/ 100, rng\) \+ deterministicBinomialV77\(eliteKills, \.12, rng\);[\s\S]*?        const economyAwards =/;
    const replacement = `        const equipmentRolls = deterministicBinomialV77(kills, farm.equipmentChancePct / 100, rng) + deterministicBinomialV77(eliteKills, .12, rng);\n        const fragmentSettlementV142 = settleVirtualHuntEquipmentFragmentsV142(this.stateValue, {\n            majorRealmIndex: map.majorRealmIndex, zone: map.zone, equipmentEvents: equipmentRolls,\n            seed: rng.nextUint32(), source: \`hunt.virtual.\${farm.floor}\`,\n        });\n        const overflowEquipmentRolls = 0;\n        const equipmentDropIds = fragmentSettlementV142.drops.map(drop => drop.resourceId);\n        const equipmentDropNames = fragmentSettlementV142.drops.map(drop => \`\${drop.rankName} +\${drop.amount}\`);\n        const economyAwards =`;
    text = replaceOnce(text, virtualBlock, replacement, 'virtual settlement');
  }

  if (text.includes('lượt trang bị${overflowEquipmentRolls')) {
    text = replaceOnce(
      text,
      /        const summaryLines = \[`Săn ảo tầng \$\{map\.zoneFloor\}:[^\n]+lượt trang bị\$\{overflowEquipmentRolls \? ` \(\$\{overflowEquipmentRolls\} lượt dư tự đổi Tinh Hoa\)` : ''\}\.`, \.\.\.\.economyAwards\.map\(x => `\$\{x\.label\}: Tiên Ngọc Khóa \+\$\{x\.boundJade\}\.\`\)\];/,
      "        const summaryLines = [`Săn ảo tầng ${map.zoneFloor}: ${kills.toLocaleString('vi-VN')} yêu thú${eliteKills ? ` · ${eliteKills.toLocaleString('vi-VN')} Tinh Anh` : ''}.`, `Linh Thạch +${spiritStones.toLocaleString('vi-VN')} · Yêu Đan +${demonCores.toLocaleString('vi-VN')} · Mảnh Trang Bị +${fragmentSettlementV142.totalFragments.toLocaleString('vi-VN')}.`, ...equipmentDropNames.slice(0, 5).map(name => `Mảnh: ${name}.`), ...economyAwards.map(x => `${x.label}: Tiên Ngọc Khóa +${x.boundJade}.`)];",
      'virtual summary',
    );
  }
  if (!text.includes('fragmentSettlementV142, farm, summaryLines')) {
    text = replaceOnce(
      text,
      'return { schema: \'endless-hunt-farm-batch.v77\', floor: farm.floor, realSeconds: seconds, kills, eliteKills, spiritStones, demonCores, demonCoreResourceId, equipmentRolls, equipmentDropIds, equipmentDropNames, overflowEquipmentRolls, farm, summaryLines, economyAwards };',
      'return { schema: \'endless-hunt-farm-batch.v77\', floor: farm.floor, realSeconds: seconds, kills, eliteKills, spiritStones, demonCores, demonCoreResourceId, equipmentRolls, equipmentDropIds, equipmentDropNames, overflowEquipmentRolls, fragmentSettlementV142, farm, summaryLines, economyAwards };',
      'virtual return',
    );
  }

  if (!text.includes("source: `hunt.real.${result.monster.floor}`")) {
    const realBlock = /            const equipmentChancePct = Math\.min\(100, economyLoot\.equipmentChancePct \+ fateMods\.equipmentChanceBonusPct\);[\s\S]*?            \/\/ V85: new PvE drops use the canonical Alchemy pill families\. Legacy resource\.pill\.\* remains compatibility-only\./;
    const replacement = `            const equipmentChancePct = Math.min(100, economyLoot.equipmentChancePct + fateMods.equipmentChanceBonusPct);\n            const equipmentEventV142 = rng.chance(equipmentChancePct);\n            const fragmentSettlementV142 = settleRealHuntEquipmentFragmentsV142(this.stateValue, {\n                majorRealmIndex: map.majorRealmIndex, zone: map.zone, monsterGrade: result.monster.grade,\n                firstClear: Boolean(result.bossCleared), equipmentEvent: equipmentEventV142, rankRoll01: rng.next(),\n                source: \`hunt.real.\${result.monster.floor}\`,\n            });\n            if (fragmentSettlementV142.totalFragments > 0) {\n                const drop = fragmentSettlementV142.drops[0];\n                equipmentDropId = drop.resourceId;\n                equipmentDropName = \`Mảnh Trang Bị · \${drop.rankName} +\${drop.amount}\`;\n            }\n            // V85: new PvE drops use the canonical Alchemy pill families. Legacy resource.pill.* remains compatibility-only.`;
    text = replaceOnce(text, realBlock, replacement, 'real Hunt settlement');
  }

  if (!text.includes('equipmentV142Summary() {')) {
    const marker = '    craftEquipmentSetV116(input) {';
    const methods = `    equipmentV142Summary() {\n        return equipmentCraftingSummaryV142(this.stateValue, this.stateValue.equipment);\n    }\n    craftEquipmentV142(slot, rankIndex) {\n        if (!this.stateValue.alive) throw new Error('Đời hiện tại đã kết thúc.');\n        const rank = Math.max(0, Math.floor(Number(rankIndex) || 0));\n        const maxRank = this.stateValue.realm.maxRealmOrder >= 1 ? majorRealmIndexForRealmOrder(this.stateValue.realm.maxRealmOrder) : 0;\n        if (rank > maxRank) throw new Error(\`Chưa thể luyện trang bị \${rank}: cảnh giới hiện tại chỉ mở tới bậc \${maxRank}.\`);\n        const seed = mixSeed(this.rootSeed ^ 0x142c0de, this.actionIndexValue + 1);\n        const result = craftRankedEquipmentV142(this.stateValue, this.stateValue.equipment, { slot, rankIndex: rank, seed, acquiredWorldYear: this.stateValue.worldTimeYears });\n        this.actionIndexValue += 1;\n        return result;\n    }\n    refineEquipmentFragmentsV142(fromRank, batches = 1) {\n        if (!this.stateValue.alive) throw new Error('Đời hiện tại đã kết thúc.');\n        const result = refineRankedEquipmentFragmentsV142(this.stateValue, fromRank, batches);\n        this.actionIndexValue += 1;\n        return result;\n    }\n    mergeEquipmentV142(mainItemId, fodderItemAId, fodderItemBId) {\n        if (!this.stateValue.alive) throw new Error('Đời hiện tại đã kết thúc.');\n        const main = this.stateValue.equipment.items.find(item => item.id === mainItemId);\n        if (!main || main.schema !== 'equipment.v142') throw new Error('Không tìm thấy trang bị V142 chính.');\n        const maxRank = this.stateValue.realm.maxRealmOrder >= 1 ? majorRealmIndexForRealmOrder(this.stateValue.realm.maxRealmOrder) : 0;\n        if ((main.equipmentRankIndex ?? 0) + 1 > maxRank) throw new Error('Không thể hợp trang bị vượt quá đại cảnh đã đạt.');\n        const result = mergeRankedEquipmentV142(this.stateValue.equipment, mainItemId, fodderItemAId, fodderItemBId);\n        this.actionIndexValue += 1;\n        return result;\n    }\n`;
    text = replaceOnce(text, marker, `${methods}${marker}`, 'session V142 methods');
  }

  if (!text.includes("Trang bị V142 đã đạt +15.")) {
    const marker = "        const seed = mixSeed(this.rootSeed ^ 0x98e11a9d, this.actionIndexValue + 1);";
    const replacement = "        const targetV142 = this.stateValue.equipment.items.find(candidate => candidate.id === itemId);\n        if (targetV142?.schema === 'equipment.v142' && Math.max(0, Math.floor(targetV142.enhancementLevel ?? 0)) >= 15)\n            throw new Error('Trang bị V142 đã đạt +15.');\n        const seed = mixSeed(this.rootSeed ^ 0x98e11a9d, this.actionIndexValue + 1);";
    text = replaceOnce(text, marker, replacement, 'V142 enhancement cap');
  }

  fs.writeFileSync(path, text);
}

function patchEquipment() {
  const path = 'dist/core/equipment.js';
  let text = fs.readFileSync(path, 'utf8');
  if (!text.includes("from './equipment-v142.js'")) {
    text = replaceOnce(
      text,
      "import { boundedStatCapV129, combineBoundedPct, combineStatPctV129 } from './combat-rules.js';",
      "import { boundedStatCapV129, combineBoundedPct, combineStatPctV129 } from './combat-rules.js';\nimport { equipmentSetPowerV142 } from './equipment-v142.js';",
      'equipment import',
    );
  }
  if (!text.includes('const v142SetPower = equipmentSetPowerV142(state);')) {
    const marker = '    grantedTags.push(...equipmentSetMechanicTagsV116(activeSetMechanics));\n    return { flatStats, statMultipliers, elementalAffinities, elementalResistancesPct, activeSets, activeSetMechanics, triggers, grantedTags: [...new Set(grantedTags)] };';
    const replacement = `    grantedTags.push(...equipmentSetMechanicTagsV116(activeSetMechanics));\n    const v142SetPower = equipmentSetPowerV142(state);\n    addPartialStats(flatStats, v142SetPower.flatStats);\n    for (const [key, value] of Object.entries(v142SetPower.statMultipliers))\n        statMultipliers[key] = (statMultipliers[key] ?? 0) + value;\n    activeSets.push(...v142SetPower.activeSets);\n    return { flatStats, statMultipliers, elementalAffinities, elementalResistancesPct, activeSets, activeSetMechanics, triggers, grantedTags: [...new Set(grantedTags)] };`;
    text = replaceOnce(text, marker, replacement, 'V142 set power');
  }
  fs.writeFileSync(path, text);
}

patchSession();
patchEquipment();
console.log('V142 runtime patch applied');
