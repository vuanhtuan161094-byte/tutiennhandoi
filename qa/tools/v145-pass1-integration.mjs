import fs from 'node:fs';

function read(p){ return fs.readFileSync(p,'utf8'); }
function write(p,s){ fs.writeFileSync(p,s); }
function once(s, oldText, newText, label){
  const n=s.split(oldText).length-1;
  if(n!==1) throw new Error(`${label}: expected 1, got ${n}`);
  return s.replace(oldText,newText);
}
function regexOnce(s,re,repl,label){
  const m=[...s.matchAll(new RegExp(re.source,re.flags.includes('g')?re.flags:re.flags+'g'))];
  if(m.length!==1) throw new Error(`${label}: expected 1, got ${m.length}`);
  return s.replace(re,repl);
}

// Core hardening: fresh Lv1 = zero bonus; bounded economy/utility lanes; reusable resolver.
{
  const p='dist/core/spiritual-root-v145.js'; let s=read(p);
  s=once(s,"  const lv = Math.max(1, safeInt(level, 1));\n  // Rough anchors: Lv100~10%, 1k~46%, 10k~102%, 100k~162%, 1m~223% before build bonuses.\n  const base = 60.885 * Math.log10(1 + lv / 216.95);","  const lv = Math.max(1, safeInt(level, 1));\n  const progress = Math.max(0, lv - 1);\n  // Rough anchors remain ~10/46/102/162/223%; fresh Lv1 contributes exactly zero.\n  const base = 60.885 * Math.log10(1 + progress / 216.95);",'cultivation baseline');
  s=once(s,"  const lv = Math.max(1, safeInt(level, 1));\n  // Rough anchors: Lv100~3.3%, 1k~15.7%, 10k~36.3%, 100k~58.6%, 1m~81%.\n  return Math.max(0, 22.479 * Math.log10(1 + lv / 248.91));","  const lv = Math.max(1, safeInt(level, 1));\n  const progress = Math.max(0, lv - 1);\n  // Rough anchors remain ~3/16/36/59/81%; fresh Lv1 contributes exactly zero.\n  return Math.max(0, 22.479 * Math.log10(1 + progress / 248.91));",'combat baseline');
  s=once(s,'    tendonDropBonusPct: 2.2 * Math.sqrt(g),','    tendonDropBonusPct: diminishingUtility(g, 24, 40),','bounded Linh Tuy');
  s=once(s,'    maxSpiritPct: 1.5 * Math.sqrt(l),','    maxSpiritPct: diminishingUtility(l, 24, 36),','bounded max spirit');
  s=once(s,'    maxSpiritPct: meridian.maxSpiritPct + insight.maxSpiritPct,','    maxSpiritPct: Math.min(60, meridian.maxSpiritPct + insight.maxSpiritPct),','combined max spirit cap');
  s += `\n\nexport function resolveSpiritualRootStateV145(character) {\n  if (character?.spiritualRootV145?.schema === SPIRITUAL_ROOT_SCHEMA_V145) return cloneSpiritualRootStateV145(character.spiritualRootV145);\n  return migrateLegacySpiritualRootV145(character?.buildFoundation);\n}\n`;
  write(p,s);
}

// Test numerical soft caps as bounded <= ceilings, plus new bounded lanes and Lv1 zero.
{
  const p='qa/tests/v145-spiritual-root-redesign-test.js'; let s=read(p);
  for(const [a,b] of [['m.retreatBonusPct < 18','m.retreatBonusPct <= 18'],['m.breakEffectPct < 14','m.breakEffectPct <= 14'],['m.critDamagePct < 24','m.critDamagePct <= 24'],['m.healingReceivedPct < 18','m.healingReceivedPct <= 18'],['m.damageReductionPct < 8','m.damageReductionPct <= 8'],['m.spiritRegenPct < 24','m.spiritRegenPct <= 24'],['m.spiritEfficiencyPct < 12','m.spiritEfficiencyPct <= 12'],['m.cooldownReductionPct < 8','m.cooldownReductionPct <= 8'],['insights.maxSpiritPct < 48','insights.maxSpiritPct <= 48']]) s=once(s,a,b,`test ${a}`);
  s=once(s,"assert.ok(root.spiritualRootCultivationBonusPctV145(1000) > 44 && root.spiritualRootCultivationBonusPctV145(1000) < 48);","assert.equal(root.spiritualRootCultivationBonusPctV145(1), 0);\nassert.equal(root.spiritualRootCoreCombatBonusPctV145(1), 0);\nassert.ok(root.spiritualRootCultivationBonusPctV145(1000) > 44 && root.spiritualRootCultivationBonusPctV145(1000) < 48);",'Lv1 zero test');
  s=once(s,'assert.ok(m.cooldownReductionPct <= 8);','assert.ok(m.cooldownReductionPct <= 8);\nassert.ok(m.tendonDropBonusPct <= 40);\nassert.ok(m.maxSpiritPct <= 36);','new bounded tests');
  write(p,s);
}

// Cultivation: V145 is an explicit additive provenance source; Tụ Linh also improves retreat boundedly.
{
  const p='dist/core/cultivation-v140.js'; let s=read(p);
  s=once(s,"import { additiveSelfCultivationPctR3, cloneCultivationRuntimeR3, effectiveMajorRequirementR3 } from './reincarnation-progression-v1102.js';","import { additiveSelfCultivationPctR3, cloneCultivationRuntimeR3, effectiveMajorRequirementR3 } from './reincarnation-progression-v1102.js';\nimport { resolveSpiritualRootStateV145, spiritualRootCultivationTotalBonusPctV145, spiritualRootMeridianBonusesV145 } from './spiritual-root-v145.js';",'cultivation import');
  s=once(s,"  const fatePct=Math.max(0,Number(state?.character?.fateModifiersV4?.selfCultivationPct)||0);\n  const pct=configuredPct+birthPct+reincarnationPct+fatePct;","  const fatePct=Math.max(0,Number(state?.character?.fateModifiersV4?.selfCultivationPct)||0);\n  const spiritualRootPct=spiritualRootCultivationTotalBonusPctV145(resolveSpiritualRootStateV145(state?.character));\n  const pct=configuredPct+birthPct+reincarnationPct+fatePct+spiritualRootPct;",'cultivation pct');
  s=once(s,"...(fatePct?[{id:'fate-v4',label:'Mệnh Cách',kind:'percent',value:fatePct}]:[])]};","...(fatePct?[{id:'fate-v4',label:'Mệnh Cách',kind:'percent',value:fatePct}]:[]),...(spiritualRootPct?[{id:'spiritual-root-v145',label:'Linh Căn',kind:'percent',value:spiritualRootPct}]:[])]};",'cultivation provenance');
  s=once(s,"  const fateRetreatPct=Math.max(0,Number(state?.character?.fateModifiersV4?.retreatPct)||0);\n  const rawPerHour=row.requiredTuVi*perHourPct/100*(1+fateRetreatPct/100);","  const fateRetreatPct=Math.max(0,Number(state?.character?.fateModifiersV4?.retreatPct)||0);\n  const rootRetreatPct=spiritualRootMeridianBonusesV145(resolveSpiritualRootStateV145(state?.character)).retreatBonusPct;\n  const rawPerHour=row.requiredTuVi*perHourPct/100*(1+(fateRetreatPct+rootRetreatPct)/100);",'retreat V145');
  write(p,s);
}

// Character: retire old five-root combat power and apply one V145 root package.
{
  const p='dist/core/character.js'; let s=read(p);
  s=once(s,"import { cloneBuildFoundationV113, createBuildFoundationV113, elementQualityMultiplier, rootEffectivenessPct } from './build-foundation-v113.js';","import { cloneBuildFoundationV113, createBuildFoundationV113 } from './build-foundation-v113.js';",'character old root import');
  s=once(s,"import { activeRootOriginIdsFromFoundationV132, applyActiveRootOriginStatsV132 } from './root-origin-combat-v132.js';\n",'', 'character origin import');
  s=once(s,"import { resolveAuthorizedSkillRootBindingsV133 } from './element-seal-v133.js';\n",'', 'character seal import');
  s=once(s,"import { combineStatPctV129 } from './combat-rules.js';","import { combineBoundedPct, combineStatPctV129 } from './combat-rules.js';\nimport { createSpiritualRootStateV145, cloneSpiritualRootStateV145, migrateLegacySpiritualRootV145, resolveSpiritualRootStateV145, spiritualRootCombatBonusesV145 } from './spiritual-root-v145.js';",'character V145 import');
  const helper=`\nfunction applySpiritualRootStatsV145(stats, rootState) {\n    const b = spiritualRootCombatBonusesV145(rootState);\n    let physique = stats.physique;\n    let maxHp = stats.maxHp;\n    if (Number.isFinite(physique)) { physique *= 1 + b.maxHpPct / 100; maxHp = physique * 20; }\n    else maxHp = Math.max(1, Number(maxHp) || 1) * (1 + b.maxHpPct / 100);\n    const regen = Number(stats.spiritRegenStandardPctPerSecond) || 0;\n    return { ...stats,\n        attack: Math.max(0, Number(stats.attack) || 0) * (1 + b.attackPct / 100),\n        defense: Math.max(0, Number(stats.defense) || 0) * (1 + b.defensePct / 100),\n        physique, maxHp,\n        maxSpirit: Math.max(0, Number(stats.maxSpirit) || 0) * (1 + b.maxSpiritPct / 100),\n        breakEffectPct: (Number(stats.breakEffectPct) || 0) + b.breakEffectPct,\n        critDamagePct: (Number(stats.critDamagePct) || 150) + b.critDamagePct,\n        healingReceivedPct: (Number(stats.healingReceivedPct) || 0) + b.healingReceivedPct,\n        damageReductionPct: combineStatPctV129('damageReductionPct', stats.damageReductionPct ?? 0, b.damageReductionPct),\n        spiritEfficiencyPct: combineStatPctV129('spiritEfficiencyPct', stats.spiritEfficiencyPct ?? 0, b.spiritEfficiencyPct),\n        cooldownReductionPct: combineBoundedPct(stats.cooldownReductionPct ?? 0, b.cooldownReductionPct, 50),\n        spiritRegenStandardPctPerSecond: regen * (1 + b.spiritRegenPct / 100),\n    };\n}\n`;
  s=once(s,'export function applyCharacterToEntity(entity, state, registry, techniquePassiveMultiplier = 1, suppressLegacyBirthOrigins = false) {',helper+'\nexport function applyCharacterToEntity(entity, state, registry, techniquePassiveMultiplier = 1, suppressLegacyBirthOrigins = false) {','character helper');
  s=regexOnce(s,/    const root = registry\.spiritualRoot\(state\.spiritualRootId\);\n    const modifiers = \{\};\n    const tags = new Set\(entity\.tags\);\n    const triggers = \[\.\.\.\(entity\.triggers \?\? \[\]\)\];\n    for \(const tag of root\.tags\)\n        tags\.add\(tag\);\n    if \(!suppressLegacyBirthOrigins\)\n        combineCombat\(modifiers, root\.combat\);/,"    const modifiers = {};\n    const tags = new Set(entity.tags);\n    const triggers = [...(entity.triggers ?? [])];\n    const spiritualRootV145 = resolveSpiritualRootStateV145(state);\n    state.spiritualRootV145 = spiritualRootV145;",'character birth root block');
  s=once(s,"    const daoNatureApplied = applyDaoNatureStatsV125(finalStats, foundation);\n    finalStats = daoNatureApplied.stats;","    const daoNatureApplied = applyDaoNatureStatsV125(finalStats, foundation);\n    finalStats = daoNatureApplied.stats;\n    finalStats = applySpiritualRootStatsV145(finalStats, spiritualRootV145);",'character apply V145');
  s=regexOnce(s,/    \/\/ v1\.32 Căn Nguyên static package[\s\S]*?    finalStats\.elementalAffinities = rootAffinities;\n/,"    // V145: legacy five-root Căn Nguyên/Chất Hành no longer contributes character power.\n",'remove old root power');
  s=once(s,"    const authorizedRootBindingsV133 = resolveAuthorizedSkillRootBindingsV133(state, id => registry.technique(id), id => registry.skill(id));\n",'', 'remove authorized bindings');
  s=regexOnce(s,/        rootUnlocked: \{[\s\S]*?        activeRootOriginIdsV132: activeRootOriginIdsFromFoundationV132\(foundation\),\n/,"        // V145 deliberately exposes no Linh Căn elemental authority to CombatKernel.\n",'remove combat root fields');
  s=once(s,"        skillRootBindingsV118: { ...(entity.combatBuildV117?.skillRootBindingsV118 ?? {}), ...authorizedRootBindingsV133, ...techniqueRuntimeV119.fixedRootBindings },","        skillRootBindingsV118: {},",'bindings inert');
  s=once(s,"        fateModifiersV4: { ...(state.fateModifiersV4 ?? {}) },\n        buildFoundation:","        fateModifiersV4: { ...(state.fateModifiersV4 ?? {}) },\n        spiritualRootV145: cloneSpiritualRootStateV145(state.spiritualRootV145 ?? migrateLegacySpiritualRootV145(state.buildFoundation)),\n        buildFoundation:",'clone root state');
  s=once(s,"        fateModifiersV4: {},\n        buildFoundation:","        fateModifiersV4: {},\n        spiritualRootV145: createSpiritualRootStateV145(),\n        buildFoundation:",'create root state');
  // Provenance: old birth root and origins become zero-delta; V145 is the real source.
  s=regexOnce(s,/    const root = registry\.spiritualRoot\(state\.spiritualRootId\);\n    \/\/ Linh Căn bẩm sinh[\s\S]*?    push\('character\.spiritual_root',[\s\S]*?\);\n/,"    const legacyRoot = registry.spiritualRoot(state.spiritualRootId);\n    push('character.spiritual_root_legacy', 'Linh Căn bẩm sinh legacy · đã nghỉ', current.stats, { sourceId: state.spiritualRootId, retired: true });\n    const v145State = resolveSpiritualRootStateV145(state);\n    push('character.spiritual_root_v145', 'Linh Căn', applySpiritualRootStatsV145(current.stats, v145State), { level: v145State.level, ascensions: v145State.ascensions });\n",'provenance V145');
  s=regexOnce(s,/    let rootOriginStats = applyActiveRootOriginStatsV132\(current\.stats, foundation\);[\s\S]*?    push\('character\.root_origin',[\s\S]*?\);\n/,"    push('character.root_origin_legacy', 'Căn Nguyên · Chất Hành legacy · đã nghỉ', current.stats, { retired: true });\n",'provenance old origin');
  write(p,s);
}

// Internal elemental skill resources stay live for now, but are no longer powered/unlocked by Linh Căn V131-V133.
{
  const p='dist/core/five-element-combat-v117.js'; let s=read(p);
  s=once(s,"import { applyRootOriginActionV132, rootOriginCastRecoveryMultiplierV132, rootOriginGenerateMultiplierV132, rootOriginSpiritCostPctV132 } from './root-origin-combat-v132.js';\n",'', 'five element origin import');
  s=once(s,"import { rootMilestoneActionBonusV133, rootMilestoneCastRecoveryMultiplierV133, rootMilestoneFireExtremeRequirementPctV133, rootMilestoneGenerateMultiplierV133, rootMilestonePayoffMultiplierV133, rootMilestoneResourceCapV133, rootMilestoneSpiritCostPctV133, rootMilestoneWoodHarvestRequirementPctV133 } from './spiritual-root-milestones-v133.js';\n",'', 'five element milestone import');
  s=regexOnce(s,/export function rootUnlockedV117\(entity, root\) \{[\s\S]*?export function rootPayoffMultiplierV117\(entity, root\) \{[\s\S]*?\n\}/,"export function rootUnlockedV117(_entity, _root) { return true; }\nexport function rootEffectivenessPctV117(_entity, _root) { return 0; }\nexport function rootGenerateMultiplierV117(_entity, _root) { return 1; }\nexport function rootPayoffMultiplierV117(_entity, _root) { return 1; }",'neutral root multipliers');
  s=once(s,'    return rootMilestoneResourceCapV133(entity, resource, base);','    return base;','resource cap');
  s=once(s,'    let amount = baseAmount * rootGenerateMultiplierV117(entity, root) * rootOriginGenerateMultiplierV132(entity, root, resource) * generateSetMultiplier(entity, resource, now);','    let amount = baseAmount * generateSetMultiplier(entity, resource, now);','resource generation');
  s=once(s,"    return Math.min(rootMilestoneFireExtremeRequirementPctV133(entity), Math.max(0, Math.min(100, param(setMechanicV117(entity, 'fire_early_extreme_heat'), 'minimumRequirementPct', 100))));","    return Math.max(0, Math.min(100, param(setMechanicV117(entity, 'fire_early_extreme_heat'), 'minimumRequirementPct', 100)));",'fire requirement');
  s=once(s,"    return Math.min(rootMilestoneWoodHarvestRequirementPctV133(entity), Math.max(0, Math.min(100, param(setMechanicV117(entity, 'wood_early_harvest'), 'minimumMaturityPct', 100))));","    return Math.max(0, Math.min(100, param(setMechanicV117(entity, 'wood_early_harvest'), 'minimumMaturityPct', 100)));",'wood requirement');
  s=once(s,"    mul *= Math.max(.05, 1 + (rootOriginSpiritCostPctV132(entity, skill) + rootMilestoneSpiritCostPctV133(entity, skill)) / 100);\n",'', 'root cost modifiers');
  s=once(s,"    mul *= rootOriginCastRecoveryMultiplierV132(entity, skill) * rootMilestoneCastRecoveryMultiplierV133(entity, skill);\n",'', 'root tempo modifiers');
  // Any action-only old root hooks that survived lower in file are neutralized explicitly.
  s=s.replace(/\s*rootMilestoneActionBonusV133\(entity, skill, action\);/g,'');
  s=s.replace(/\s*applyRootOriginActionV132\(entity, skill, action[^;]*\);/g,'');
  write(p,s);
}

// Hunt deterministic evaluator must not include retired V131-V133 root bonuses.
{
  const p='dist/core/hunt-real-combat-v130.js'; let s=read(p);
  s=once(s,"import { rootOriginHuntSkillTuningV132 } from './root-origin-combat-v132.js';\n",'', 'hunt origin import');
  s=once(s,"import { rootMilestoneHuntSkillTuningV133 } from './spiritual-root-milestones-v133.js';\n",'', 'hunt milestone import');
  s=regexOnce(s,/    const milestone = rootMilestoneHuntSkillTuningV133\(entity, skill\);[\s\S]*?    control \*= 1 \+ \(origin\.controlPct \?\? 0\) \/ 100;\n/,"    // V145: Linh Căn no longer modifies authored elemental skill packages.\n",'hunt old root tuning');
  write(p,s);
}

console.log('V145 pass1 integration applied');
