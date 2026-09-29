import fs from 'node:fs';

function read(path){ return fs.readFileSync(path,'utf8').replace(/\r\n/g,'\n'); }
function write(path,text){ fs.writeFileSync(path,text); }
function once(text,label,before,after){
  const count=text.split(before).length-1;
  if(count!==1) throw new Error(`${label}: expected once, found ${count}`);
  return text.replace(before,after);
}

// 1) Author all ten Mind five-stat families with neutral baselines.
const packPath='dist/content/battle-dao-skill-pack-v118.js';
let pack=read(packPath);
const rows=[
  ['basic','{power:2.00,sense:.55}','2.55'],
  ['mark','{power:1.15,sense:1.20}','2.35'],
  ['split','{power:.95,agility:1.05,sense:1.00}','3.00'],
  ['interfere','{power:.65,sense:1.30}','1.95'],
  ['guard','{body:.75,sense:1.55}','2.30'],
  ['chase','{power:1.20,agility:.80,sense:1.15}','3.15'],
  ['burst','{power:2.35,sense:1.15}','3.50'],
  ['observe','{power:.80,sense:2.10}','2.90'],
  ['flow','{power:.95,agility:.75,sense:1.60}','3.30'],
  ['ultimate','{power:2.10,sense:1.90}','4.00'],
];
for(const [suffix,scaling,baseline] of rows){
  const id=`skill.dao.mind.${suffix}`;
  pack=once(pack,`five-stat ${id}`,`skill({ id: '${id}'`,`skill({ fiveStatScalingV5:${scaling}, fiveStatBaselineCoefficientV5:${baseline}, id: '${id}'`);
}
write(packPath,pack);

// 2) Add a pure TP+TT effect-family multiplier for Tâm Kính.
const mindPath='dist/core/mind-dao-v2-runtime.js';
let mind=read(mindPath);
const guardMarker=`function mindPassiveLevel(entity, n) {\n    return clampLevel(entity?.combatBuildV117?.passiveLevelsV125?.[mindPassiveId(n)] ?? 1);\n}\n`;
const guardHelper=`function mindPassiveLevel(entity, n) {\n    return clampLevel(entity?.combatBuildV117?.passiveLevelsV125?.[mindPassiveId(n)] ?? 1);\n}\n\nexport function mindGuardFiveStatMultiplierV2(stats, skill) {\n    if (skill?.id !== 'skill.dao.mind.guard' || !skill?.fiveStatScalingV5)\n        return 1;\n    const primary = stats?.primaryStatsV5;\n    if (!primary)\n        return 1;\n    const scaling = skill.fiveStatScalingV5;\n    const weighted = Math.max(0, Number(primary.body) || 0) * Math.max(0, Number(scaling.body) || 0)\n        + Math.max(0, Number(primary.sense) || 0) * Math.max(0, Number(scaling.sense) || 0);\n    const normalized = weighted / Math.max(0.0001, Number(skill.fiveStatBaselineCoefficientV5) || 1);\n    const powerAnchor = Math.max(0.0001, Number(primary.power) || 0);\n    return Math.max(0, normalized / powerAnchor);\n}\n`;
mind=once(mind,'Tâm Kính five-stat helper',guardMarker,guardHelper);
write(mindPath,mind);

// 3) Make the wrapper consume five-stat metadata for manual consume packets and shield effects.
const combatPath='dist/core/combat.js';
let combat=read(combatPath);
combat=once(combat,'import Tâm Kính five-stat helper',`    mindMarkCountV2,\n    mindObserveProgressV2,`,`    mindMarkCountV2,\n    mindGuardFiveStatMultiplierV2,\n    mindObserveProgressV2,`);
const classMarker=`export class CombatEngine extends CombatEngineBaseM1 {\n    damageContextFromEffect(source, effect, defaultSourceTag, skill, skillId, cooldownDamageBonusPct, runtimeAction) {`;
const classReplacement=`export class CombatEngine extends CombatEngineBaseM1 {\n    applyDamage(source, target, ctx, now) {\n        let authored = ctx;\n        if (source?.combatBuildV117?.battleDaoV2Enabled === true && source?.combatBuildV117?.mainDaoId === 'mind' && ctx?.skillId && ctx.fiveStatScalingV5 === undefined) {\n            const skill = this.registry.skill(ctx.skillId);\n            if (skillRuntimeV117(skill).daoBinding === 'mind' && skill.fiveStatScalingV5) {\n                authored = {\n                    ...ctx,\n                    fiveStatScalingV5: skill.fiveStatScalingV5,\n                    fiveStatBaselineCoefficientV5: skill.fiveStatBaselineCoefficientV5,\n                };\n            }\n        }\n        return super.applyDamage(source, target, authored, now);\n    }\n\n    damageContextFromEffect(source, effect, defaultSourceTag, skill, skillId, cooldownDamageBonusPct, runtimeAction) {`;
combat=once(combat,'Mind applyDamage five-stat bridge',classMarker,classReplacement);
const shieldBefore=`    resolveEffectShieldV141(source, target, effect, defaultSourceTag, now, skillId, cooldownDamageBonusPct, runtimeAction, skill, runtimeEffectMultiplier, runtimeBreakMultiplier) {\n        captureMindShieldPacketV2(source, skill, runtimeAction, effect, runtimeEffectMultiplier);\n        return super.resolveEffectShieldV141(source, target, effect, defaultSourceTag, now, skillId, cooldownDamageBonusPct, runtimeAction, skill, runtimeEffectMultiplier, runtimeBreakMultiplier);\n    }`;
const shieldAfter=`    resolveEffectShieldV141(source, target, effect, defaultSourceTag, now, skillId, cooldownDamageBonusPct, runtimeAction, skill, runtimeEffectMultiplier, runtimeBreakMultiplier) {\n        let authored = effect;\n        if (isMainMindSkillV2(source, skill) && skill.id === 'skill.dao.mind.guard' && skill.fiveStatScalingV5) {\n            const fiveStatMultiplier = mindGuardFiveStatMultiplierV2(effectiveStats(source, this.registry, now), skill);\n            authored = {\n                ...effect,\n                capacity: Math.max(0, Number(effect.capacity ?? 0)) * fiveStatMultiplier,\n                maxHpPct: Math.max(0, Number(effect.maxHpPct ?? 0)) * fiveStatMultiplier,\n                attackCoefficient: Math.max(0, Number(effect.attackCoefficient ?? 0)) * fiveStatMultiplier,\n            };\n        }\n        captureMindShieldPacketV2(source, skill, runtimeAction, authored, runtimeEffectMultiplier);\n        return super.resolveEffectShieldV141(source, target, authored, defaultSourceTag, now, skillId, cooldownDamageBonusPct, runtimeAction, skill, runtimeEffectMultiplier, runtimeBreakMultiplier);\n    }`;
combat=once(combat,'Tâm Kính effect-family bridge',shieldBefore,shieldAfter);
write(combatPath,combat);

// 4) Move the opening contract/test status from M1 to M2A without authorizing tuning.
const contractPath='docs/runtime/MIND_DAO_PRODUCTION_CONTRACT_20260929.md';
let contract=read(contractPath);
contract=once(contract,'contract M2A status','Status: **M0 / M1A OPEN — SCOPE + RUNTIME SEAM AUDIT LOCKED; PRODUCTION TUNING NOT AUTHORIZED**','Status: **M1 CLOSED / M2A OPEN — FIVE-STAT MIGRATION IN IMPLEMENTATION; PRODUCTION TUNING NOT AUTHORIZED**');
write(contractPath,contract);

const contractTestPath='qa/tests/mind-dao-production-contract-test.js';
let contractTest=read(contractTestPath);
contractTest=once(contractTest,'contract test five-stat guard',`assert(mindSkills.every(skill=>skill.fiveStatScalingV5===undefined),'M0 Thần Niệm must not gain five-stat coefficients before M1 runtime correctness is complete');`,`assert(mindSkills.every(skill=>skill.fiveStatScalingV5!==undefined),'M2A requires explicit five-stat families on all ten Mind skills');`);
contractTest=once(contractTest,'contract test M2A status','assert.match(contract,/M0 \\/ M1A OPEN/);','assert.match(contract,/M1 CLOSED \\/ M2A OPEN/);');
write(contractTestPath,contractTest);

console.log('MIND M2A FIVE-STAT GUARDED PATCH: APPLIED');
