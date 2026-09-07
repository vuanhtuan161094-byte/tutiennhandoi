import fs from 'node:fs';

function replaceOnce(text, pattern, replacement, label) {
  if (typeof pattern === 'string') {
    const count = text.split(pattern).length - 1;
    if (count !== 1) throw new Error(`${label}: expected exactly 1 string match, got ${count}`);
    return text.replace(pattern, replacement);
  }
  const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
  const matches = [...text.matchAll(new RegExp(pattern.source, flags))];
  if (matches.length !== 1) throw new Error(`${label}: expected exactly 1 regex match, got ${matches.length}`);
  return text.replace(pattern, replacement);
}

function patchDungeon() {
  const path = 'dist/core/dungeon.js';
  let text = fs.readFileSync(path, 'utf8');
  if (!text.includes("from './equipment-dungeon-v142.js'")) {
    text = replaceOnce(
      text,
      "import { SeededRng } from './rng.js';",
      "import { SeededRng } from './rng.js';\nimport { settleDungeonEquipmentEventsV142 } from './equipment-dungeon-v142.js';",
      'dungeon import',
    );
  }

  if (!text.includes('const equipmentFragmentDrops = [];')) {
    text = text.replace('    const equipmentDrops = [];\n    const artifactDrops = [];', '    const equipmentDrops = [];\n    const equipmentFragmentDrops = [];\n    const artifactDrops = [];');
    text = text.replace('        const equipmentDrops = [];\n        const artifactDrops = [];', '        const equipmentDrops = [];\n        const equipmentFragmentDrops = [];\n        const artifactDrops = [];');
  }

  if (!text.includes("source: `dungeon.guardian.${dungeon.id}.${floor}`")) {
    const guardianGearBlock = /    for \(let guaranteedIndex = 0; guaranteedIndex < rolledEquipmentRules\.length; guaranteedIndex\+\+\) \{[\s\S]*?    \}\n    const artifactRules =/;
    const replacement = `    if (rolledEquipmentRules.length > 0) {\n        const settlement = settleDungeonEquipmentEventsV142(state, {\n            dungeonId: dungeon.id, floor, requiredRealmOrder: spec.requiredRealmOrder,\n            equipmentEvents: rolledEquipmentRules.length, firstClear,\n            source: \`dungeon.guardian.\${dungeon.id}.\${floor}\`,\n        });\n        equipmentFragmentDrops.push(...settlement.drops);\n    }\n    const artifactRules =`;
    text = replaceOnce(text, guardianGearBlock, replacement, 'guardian equipment conversion');
  }

  if (!text.includes("source: `dungeon.worker.${dungeon.id}.${floor}`")) {
    const workerGearBlock = /        if \(registry && dungeon\.equipmentLoot && dungeon\.equipmentLoot\.length > 0 && safeYears > 0\) \{[\s\S]*?        \}\n        if \(registry && dungeon\.artifactLoot/;
    const replacement = `        if (dungeon.equipmentLoot && dungeon.equipmentLoot.length > 0 && safeYears > 0) {\n            const workerRate = Math.max(0, dungeon.workerEquipmentRatePerYear ?? 0);\n            let equipmentEvents = 0;\n            if (workerRate > 0) {\n                const expected = safeYears * Math.max(0, safeEfficiency) * workerRate;\n                const whole = Math.floor(expected);\n                equipmentEvents = whole + (rng.chance(Math.max(0, Math.min(1, expected - whole)) * 100) ? 1 : 0);\n            }\n            else {\n                const opportunities = Math.min(5, Math.max(1, Math.ceil(Math.log2(1 + safeYears * Math.max(0.2, safeEfficiency)))));\n                for (let i = 0; i < opportunities; i++) {\n                    const chance = Math.min(0.95, floorSpec.equipmentDropChance * Math.min(1, safeEfficiency));\n                    if (rng.chance(chance * 100)) equipmentEvents += 1;\n                }\n            }\n            if (equipmentEvents > 0) {\n                const settlement = settleDungeonEquipmentEventsV142(state, {\n                    dungeonId: dungeon.id, floor, requiredRealmOrder: floorSpec.requiredRealmOrder,\n                    equipmentEvents, firstClear: false, source: \`dungeon.worker.\${dungeon.id}.\${floor}\`,\n                });\n                equipmentFragmentDrops.push(...settlement.drops);\n            }\n        }\n        if (registry && dungeon.artifactLoot`;
    text = replaceOnce(text, workerGearBlock, replacement, 'worker equipment conversion');
  }

  text = text.replaceAll('return { rewards, equipmentDrops, artifactDrops };', 'return { rewards, equipmentDrops, equipmentFragmentDrops, artifactDrops };');

  if (text.includes('Trang bị đáng chú ý: ${equipmentDrops.map')) {
    text = replaceOnce(
      text,
      /^\s*\.\.\.\(equipmentDrops\.length > 0 \? \[\`Trang bị đáng chú ý: .*$/m,
      "                ...(equipmentFragmentDrops.length > 0 ? [`Mảnh trang bị: ${equipmentFragmentDrops.map(drop => drop.kind === 'setFragmentV142' ? `Tàn Ấn ${drop.setName} +${drop.amount}` : `${drop.rankName} +${drop.amount}`).join(', ')}.`] : []),",
      'dungeon summary',
    );
  }

  if (!text.includes('equipmentFragmentDrops,\n            artifactDrops,')) {
    text = replaceOnce(
      text,
      '            rewards,\n            equipmentDrops,\n            artifactDrops,',
      '            rewards,\n            equipmentDrops,\n            equipmentFragmentDrops,\n            artifactDrops,',
      'dungeon run return',
    );
  }

  fs.writeFileSync(path, text);
}

function patchSessionDungeon() {
  const path = 'dist/core/session-dungeon.js';
  let text = fs.readFileSync(path, 'utf8');
  if (!text.includes('let equipmentFragmentDrops = [];')) {
    text = replaceOnce(text, '        let equipmentDropIds = [];\n        let artifactDropIds = [];', '        let equipmentDropIds = [];\n        let equipmentFragmentDrops = [];\n        let artifactDropIds = [];', 'session dungeon fragment variable');
  }
  if (!text.includes('equipmentFragmentDrops = loot.equipmentFragmentDrops')) {
    text = replaceOnce(text, '            equipmentDropIds = loot.equipmentDrops.map(item => item.id);\n            artifactDropIds = loot.artifactDrops.map(item => item.id);', '            equipmentDropIds = loot.equipmentDrops.map(item => item.id);\n            equipmentFragmentDrops = loot.equipmentFragmentDrops ?? [];\n            artifactDropIds = loot.artifactDrops.map(item => item.id);', 'session dungeon loot result');
  }
  if (!text.includes('const equipmentFragmentText = equipmentFragmentDrops.length')) {
    text = replaceOnce(
      text,
      '        const event = {',
      "        const equipmentFragmentText = equipmentFragmentDrops.length ? ` Thu ${equipmentFragmentDrops.map(drop => drop.kind === 'setFragmentV142' ? `Tàn Ấn ${drop.setName} +${drop.amount}` : `Mảnh Trang Bị ${drop.rankName} +${drop.amount}`).join(' · ')}.` : '';\n        const event = {",
      'session dungeon fragment text',
    );
  }
  if (!text.includes("${equipmentFragmentText}${resourcePve ?")) {
    text = text.replace("sau ${battle.duration.toFixed(1)}s.${resourcePve ?", "sau ${battle.duration.toFixed(1)}s.${equipmentFragmentText}${resourcePve ?");
  }
  text = text.replace('equipmentDrops: equipmentDropIds.length, artifactDrops: artifactDropIds.length,', 'equipmentDrops: equipmentDropIds.length, equipmentFragmentDrops: equipmentFragmentDrops.reduce((sum, drop) => sum + Number(drop.amount ?? 0), 0), artifactDrops: artifactDropIds.length,');
  if (!text.includes('equipmentDropIds, equipmentFragmentDrops, artifactDropIds')) {
    text = replaceOnce(text, '            equipmentDropIds, artifactDropIds, signatureSkillId:', '            equipmentDropIds, equipmentFragmentDrops, artifactDropIds, signatureSkillId:', 'session dungeon return');
  }
  fs.writeFileSync(path, text);
}

function patchSessionSetEngraving() {
  const path = 'dist/core/session.js';
  let text = fs.readFileSync(path, 'utf8');
  if (!text.includes('engraveRankedEquipmentSetV142')) {
    text = replaceOnce(
      text,
      "import { craftRankedEquipmentV142, equipmentCraftingSummaryV142, mergeRankedEquipmentV142, refineRankedEquipmentFragmentsV142 } from './equipment-crafting-v142.js';",
      "import { craftRankedEquipmentV142, engraveRankedEquipmentSetV142, equipmentCraftingSummaryV142, mergeRankedEquipmentV142, refineRankedEquipmentFragmentsV142 } from './equipment-crafting-v142.js';",
      'session engraving import',
    );
  }
  if (!text.includes('engraveEquipmentSetV142(itemId, setId) {')) {
    const marker = '    craftEquipmentSetV116(input) {';
    const method = `    engraveEquipmentSetV142(itemId, setId) {\n        if (!this.stateValue.alive) throw new Error('Đời hiện tại đã kết thúc.');\n        const result = engraveRankedEquipmentSetV142(this.stateValue, this.stateValue.equipment, itemId, setId);\n        this.actionIndexValue += 1;\n        return result;\n    }\n`;
    text = replaceOnce(text, marker, `${method}${marker}`, 'session engraving method');
  }
  fs.writeFileSync(path, text);
}

patchDungeon();
patchSessionDungeon();
patchSessionSetEngraving();
console.log('V142 dungeon fragment patch applied');
