import fs from 'node:fs';

function replaceOnce(text, before, after, label) {
  const count = text.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: expected 1 match, got ${count}`);
  return text.replace(before, after);
}

function patchEquipmentV142() {
  const path = 'dist/core/equipment-v142.js';
  let text = fs.readFileSync(path, 'utf8');
  text = text.replace(
    '- one universal Equipment Fragment currency. A Phàm item costs 50 fragments; every next rank costs x3.',
    '- one ranked fragment wallet: every item costs 50 fragments of its own rank; 3 lower-rank fragments refine into 1 next-rank fragment.',
  );
  text = text.replace(
    "{ pieces: 4, name: 'Kim · Phá Thế', flatStats: { breakPowerPct: 18 } }",
    "{ pieces: 4, name: 'Kim · Phá Thế', flatStats: { breakEffectPct: 18 } }",
  );
  fs.writeFileSync(path, text);
}

function patchEquipmentCore() {
  const path = 'dist/core/equipment.js';
  let text = fs.readFileSync(path, 'utf8');
  if (!text.includes('EQUIPMENT_MAX_ENHANCEMENT_V142')) {
    text = replaceOnce(
      text,
      "import { equipmentSetPowerV142 } from './equipment-v142.js';",
      "import { EQUIPMENT_MAX_ENHANCEMENT_V142, equipmentSetPowerV142 } from './equipment-v142.js';",
      'equipment V142 import',
    );
  }
  if (!text.includes("item.schema === 'equipment.v142' ? EQUIPMENT_MAX_ENHANCEMENT_V142")) {
    text = replaceOnce(
      text,
      "    const beforeLevel = clampEnhancement(item.enhancementLevel ?? 0);\n    if (beforeLevel >= EQUIPMENT_MAX_ENHANCEMENT)\n        throw new Error('Trang bị đã đạt +20.');",
      "    const beforeLevel = clampEnhancement(item.enhancementLevel ?? 0);\n    const maxEnhancement = item.schema === 'equipment.v142' ? EQUIPMENT_MAX_ENHANCEMENT_V142 : EQUIPMENT_MAX_ENHANCEMENT;\n    if (beforeLevel >= maxEnhancement)\n        throw new Error(`Trang bị đã đạt +${maxEnhancement}.`);",
      'equipment enhancement cap',
    );
  }
  fs.writeFileSync(path, text);
}

function patchCombat() {
  const path = 'dist/core/combat.js';
  let text = fs.readFileSync(path, 'utf8');
  if (!text.includes('stats.cooldownReductionPct ?? 0,')) {
    text = replaceOnce(
      text,
      "        const reductionSources = [\n            stats.cooldownReductionBySkillPct?.[skill.id] ?? 0,",
      "        const reductionSources = [\n            stats.cooldownReductionPct ?? 0,\n            stats.cooldownReductionBySkillPct?.[skill.id] ?? 0,",
      'global CDR consumer',
    );
  }
  if (!text.includes('srcStats.dotDamagePct ?? 0')) {
    text = replaceOnce(
      text,
      "        if (ctx.sourceTag === 'DoT')\n            raw *= 1 + simpleSetParamV12318(source, 'simple_wood_dot_damage', 'dotDamagePct') / 100;",
      "        if (ctx.sourceTag === 'DoT')\n            raw *= 1 + (simpleSetParamV12318(source, 'simple_wood_dot_damage', 'dotDamagePct') + Math.max(0, srcStats.dotDamagePct ?? 0)) / 100;",
      'DoT stat consumer',
    );
  }
  if (!text.includes('srcStats.counterDamagePct ?? 0')) {
    text = replaceOnce(
      text,
      "        if (ctx.sourceTag === 'Counter')\n            raw *= 1 + simpleSetParamV12318(source, 'simple_earth_counter_damage', 'counterDamagePct') / 100;",
      "        if (ctx.sourceTag === 'Counter')\n            raw *= 1 + (simpleSetParamV12318(source, 'simple_earth_counter_damage', 'counterDamagePct') + Math.max(0, srcStats.counterDamagePct ?? 0)) / 100;",
      'Counter stat consumer',
    );
  }
  if (!text.includes('srcStats.brokenTargetDamagePct ?? 0')) {
    text = replaceOnce(
      text,
      "        if (target.breakDebuffUntil > now)\n            raw *= 1 + simpleSetParamV12318(source, 'simple_metal_broken_damage', 'damageBonusPct') / 100;",
      "        if (target.breakDebuffUntil > now)\n            raw *= 1 + (simpleSetParamV12318(source, 'simple_metal_broken_damage', 'damageBonusPct') + Math.max(0, srcStats.brokenTargetDamagePct ?? 0)) / 100;",
      'broken target stat consumer',
    );
  }
  if (!text.includes('const trueEssenceScalingPct = Math.max(0, srcStats.trueEssenceScalingPct ?? 0);')) {
    text = replaceOnce(
      text,
      "        if (target.breakDebuffUntil > now)\n            raw *= 1 + (simpleSetParamV12318(source, 'simple_metal_broken_damage', 'damageBonusPct') + Math.max(0, srcStats.brokenTargetDamagePct ?? 0)) / 100;\n        raw *= 1 + Math.max(0, ctx.runtimeEffectBonusPct) / 100;",
      "        if (target.breakDebuffUntil > now)\n            raw *= 1 + (simpleSetParamV12318(source, 'simple_metal_broken_damage', 'damageBonusPct') + Math.max(0, srcStats.brokenTargetDamagePct ?? 0)) / 100;\n        const trueEssenceScalingPct = Math.max(0, srcStats.trueEssenceScalingPct ?? 0);\n        if (trueEssenceScalingPct > 0) {\n            const spiritStandard = Math.max(1, combatSpiritStandard(srcStats));\n            const spiritRatio = Math.max(0, Math.min(1, source.spirit / spiritStandard));\n            raw *= 1 + trueEssenceScalingPct * spiritRatio / 100;\n        }\n        raw *= 1 + Math.max(0, ctx.runtimeEffectBonusPct) / 100;",
      'true essence stat consumer',
    );
  }
  fs.writeFileSync(path, text);
}

patchEquipmentV142();
patchEquipmentCore();
patchCombat();
console.log('V142 combat live patch applied');
