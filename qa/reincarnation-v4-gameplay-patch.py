from pathlib import Path
import re

ROOT=Path('.')

def read(p): return (ROOT/p).read_text()
def write(p,s): (ROOT/p).write_text(s)
def rep(s,old,new,label):
    if old not in s: raise SystemExit(f'missing anchor: {label}')
    return s.replace(old,new,1)

# 1) Reincarnation core: fate helpers, RP formula, records, potential scaling.
p='dist/core/reincarnation-progression-v1102.js'; s=read(p)
s=rep(s,
"export function activeFateBuildModifiersV4(state){ return { ...activeFateBuildV4(state).modifiers }; }",
"""export function activeFateBuildModifiersV4(state){ return { ...activeFateBuildV4(state).modifiers }; }
export function fateBuildModifiersForIdV4(id){ return { ...fateBuildDefinitionV4(id).modifiers }; }
export function applyFateSpiritStoneGainV4(amount,modifiers={}){ const base=Math.max(0,Math.floor(Number(amount)||0)),pct=Math.max(0,Number(modifiers?.spiritStoneGainPct)||0); return Math.max(0,Math.round(base*(1+pct/100))); }""",'fate helpers')

s=rep(s,
"export function createReincarnationProgressStateV1102(nowUnixMs=0){ return { energy:{current:REINCARNATION_ENERGY_CAP,lastUpdatedUnixMs:nowUnixMs}, permanentPotential:{unspent:0,lifetimeEarned:0,allocations:emptyAllocation()}, alchemyPermanentStats:emptyAllocation(), alchemyLegacy:{highestRank:1,highestTurn:1,bestMasteryByRecipe:{},knownRecipeIds:[]}, tree:{lifetimePointsEarned:0,sharedSpentPoints:0,ranks:{},highestAchievementTierByTree:{},cultivationR3:true}, fateBuild:createFateBuildStateV4(), rewardHistory:[] }; }",
"export function createReincarnationProgressStateV1102(nowUnixMs=0){ return { energy:{current:REINCARNATION_ENERGY_CAP,lastUpdatedUnixMs:nowUnixMs}, permanentPotential:{unspent:0,lifetimeEarned:0,allocations:emptyAllocation()}, alchemyPermanentStats:emptyAllocation(), alchemyLegacy:{highestRank:1,highestTurn:1,bestMasteryByRecipe:{},knownRecipeIds:[]}, tree:{lifetimePointsEarned:0,sharedSpentPoints:0,ranks:{},highestAchievementTierByTree:{},cultivationR3:true}, fateBuild:createFateBuildStateV4(), highestRealmOrderV4:0, bestCombatPowerByRealmOrderV4:{}, rewardHistory:[] }; }",'progress create records')

old="return { energy:{current:clamp(Number(value?.energy?.current??base.energy.current)||0,0,REINCARNATION_ENERGY_CAP),lastUpdatedUnixMs:Math.max(0,Math.floor(Number(value?.energy?.lastUpdatedUnixMs??nowUnixMs)))}, permanentPotential:{unspent:Math.max(0,Math.floor(Number(value?.permanentPotential?.unspent)||Math.max(0,earned-spent))),lifetimeEarned:earned,allocations:p}, alchemyPermanentStats:{...emptyAllocation(),...(value?.alchemyPermanentStats??{})}, alchemyLegacy:{highestRank:Math.max(1,Math.min(9,Math.floor(Number(value?.alchemyLegacy?.highestRank)||1))),highestTurn:Math.max(1,Math.min(9,Math.floor(Number(value?.alchemyLegacy?.highestTurn)||1))),bestMasteryByRecipe:{...(value?.alchemyLegacy?.bestMasteryByRecipe??{})},knownRecipeIds:[...new Set(value?.alchemyLegacy?.knownRecipeIds??[])]}, tree:{lifetimePointsEarned:Math.max(0,Math.floor(Number(value?.tree?.lifetimePointsEarned)||0)),sharedSpentPoints:Math.max(0,Math.floor(Number(value?.tree?.sharedSpentPoints)||0)),ranks,highestAchievementTierByTree:{...(value?.tree?.highestAchievementTierByTree??{})},cultivationR3:true}, fateBuild:cloneFateBuildStateV4(value?.fateBuild??base.fateBuild), rewardHistory:(value?.rewardHistory??[]).map(x=>({...x})) };"
new="return { energy:{current:clamp(Number(value?.energy?.current??base.energy.current)||0,0,REINCARNATION_ENERGY_CAP),lastUpdatedUnixMs:Math.max(0,Math.floor(Number(value?.energy?.lastUpdatedUnixMs??nowUnixMs)))}, permanentPotential:{unspent:Math.max(0,Math.floor(Number(value?.permanentPotential?.unspent)||Math.max(0,earned-spent))),lifetimeEarned:earned,allocations:p}, alchemyPermanentStats:{...emptyAllocation(),...(value?.alchemyPermanentStats??{})}, alchemyLegacy:{highestRank:Math.max(1,Math.min(9,Math.floor(Number(value?.alchemyLegacy?.highestRank)||1))),highestTurn:Math.max(1,Math.min(9,Math.floor(Number(value?.alchemyLegacy?.highestTurn)||1))),bestMasteryByRecipe:{...(value?.alchemyLegacy?.bestMasteryByRecipe??{})},knownRecipeIds:[...new Set(value?.alchemyLegacy?.knownRecipeIds??[])]}, tree:{lifetimePointsEarned:Math.max(0,Math.floor(Number(value?.tree?.lifetimePointsEarned)||0)),sharedSpentPoints:Math.max(0,Math.floor(Number(value?.tree?.sharedSpentPoints)||0)),ranks,highestAchievementTierByTree:{...(value?.tree?.highestAchievementTierByTree??{})},cultivationR3:true}, fateBuild:cloneFateBuildStateV4(value?.fateBuild??base.fateBuild), highestRealmOrderV4:clamp(Math.floor(Number(value?.highestRealmOrderV4)||0),0,117), bestCombatPowerByRealmOrderV4:Object.fromEntries(Object.entries(value?.bestCombatPowerByRealmOrderV4??{}).map(([k,v])=>[String(clamp(Math.floor(Number(k)||0),0,117)),Math.max(0,Number(v)||0)])), rewardHistory:(value?.rewardHistory??[]).map(x=>({...x})) };"
s=rep(s,old,new,'progress clone records')

old="export function applyCorePotentialStats(stats,runtime){ if(!runtime) return {...stats}; const life=cloneLifeCorePotentialState(runtime.life).allocations, permanent={...emptyAllocation(),...(runtime.permanent??{})}; const power=life.power+Math.max(0,permanent.power||0),body=life.body+Math.max(0,permanent.body||0),defense=life.defense+Math.max(0,permanent.defense||0); const basePhysique=Number.isFinite(stats.physique)?Math.max(0,stats.physique):Math.max(0,stats.maxHp/20); const physique=basePhysique+body; return {...stats,attack:stats.attack+power,defense:stats.defense+defense*3,physique,maxHp:physique*20}; }"
new="""export const CORE_POTENTIAL_SOFT_CAP_MAX_PCT_V4=35;
export const CORE_POTENTIAL_HALF_SATURATION_V4=1500;
export function corePotentialPercentBonusV4(points){ const p=Math.max(0,Number(points)||0); return CORE_POTENTIAL_SOFT_CAP_MAX_PCT_V4*p/(p+CORE_POTENTIAL_HALF_SATURATION_V4); }
export function applyCorePotentialStats(stats,runtime){
  if(!runtime) return {...stats};
  const life=cloneLifeCorePotentialState(runtime.life).allocations, permanent={...emptyAllocation(),...(runtime.permanent??{})};
  const power=life.power+Math.max(0,permanent.power||0),body=life.body+Math.max(0,permanent.body||0),defense=life.defense+Math.max(0,permanent.defense||0);
  const attackFlat=Math.max(0,(Number(stats.attack)||0)+power), attack=attackFlat*(1+corePotentialPercentBonusV4(power)/100);
  const defenseFlat=Math.max(0,(Number(stats.defense)||0)+defense*3), finalDefense=defenseFlat*(1+corePotentialPercentBonusV4(defense)/100);
  const basePhysique=Number.isFinite(stats.physique)?Math.max(0,stats.physique):Math.max(0,(Number(stats.maxHp)||0)/20);
  const physiqueFlat=basePhysique+body, physique=physiqueFlat*(1+corePotentialPercentBonusV4(body)/100);
  return {...stats,attack,defense:finalDefense,physique,maxHp:physique*20};
}"""
s=rep(s,old,new,'potential scaling')

pattern=re.compile(r"export function lifeAchievementBonusPctV4\(totalScore\)\{.*?\n\}\n\nfunction baseRankCost",re.S)
m=pattern.search(s)
if not m: raise SystemExit('missing reward formula block')
new_reward="""export const REINCARNATION_REALM_RECORD_BONUS_PCT_V4=15;
export function reincarnationStageFactorV4(realmOrder){ const info=depthInfoForRealmOrder(realmOrder),span=Math.max(0,info.endOrder-info.startOrder); return span<=0?1:1+0.30*(Math.max(0,Math.min(span,Math.floor(Number(realmOrder)||0)-info.startOrder))/span); }
export function reincarnationPowerBonusPctV4(power,benchmark){ const b=Math.max(0,Number(benchmark)||0); if(b<=0)return 0; const ratio=Math.max(0,Number(power)||0)/b; return ratio>=5?50:ratio>=3?40:ratio>=2?30:ratio>=1.5?20:ratio>=1.25?10:0; }
export function previewReincarnationV2Reward(args){
  const realmOrder=clamp(Math.floor(Number(args.realmOrder)||0),0,117),info=depthInfoForRealmOrder(realmOrder),cfg=REINCARNATION_DEPTH_CONFIG[info.tierIndex];
  const lifePotential=Math.max(0,Math.floor(Number(args.lifePotentialEarned)||lifePotentialMilestonesThroughRealmOrder(realmOrder).reduce((sum,x)=>sum+x.amount,0)));
  const conversionPct=clamp(Number(args.permanentPotentialConversionPct)||REINCARNATION_PERMANENT_POTENTIAL_BASE_PCT_V127,REINCARNATION_PERMANENT_POTENTIAL_BASE_PCT_V127,REINCARNATION_PERMANENT_POTENTIAL_MAX_PCT_V127);
  const permanentBase=Math.max(0,Math.round(lifePotential*conversionPct/100));
  const energyReduction=clamp(Number(args.energyCostReductionPct)||0,0,25), energyCost=Math.max(1,Math.ceil(cfg.energyCost*(1-energyReduction/100)));
  const rpGainPct=clamp(Number(args.reincarnationPointsGainPct)||0,0,25),stageFactor=reincarnationStageFactorV4(realmOrder);
  const combatPower=Math.max(0,Number(args.combatPower)||0),combatPowerBenchmark=Math.max(0,Number(args.combatPowerBenchmark)||0),powerRatio=combatPowerBenchmark>0?combatPower/combatPowerBenchmark:1;
  const powerBonusPct=reincarnationPowerBonusPctV4(combatPower,combatPowerBenchmark),recordBonusPct=args.isNewRealmRecord?REINCARNATION_REALM_RECORD_BONUS_PCT_V4:0;
  const earned=Math.round(cfg.reincarnationPoints*stageFactor*(1+(powerBonusPct+recordBonusPct)/100)*(1+rpGainPct/100));
  return {lifeId:args.lifeId,realmOrder,depthTier:info.tierId,depthTierIndex:info.tierIndex,depthStage:info.stage,stageFactor,stageProgressPct:Math.round((stageFactor-1)/0.30*1000)/10,reincarnationPoints:earned,reincarnationPointsBase:cfg.reincarnationPoints,combatPower,combatPowerBenchmark,powerRatio,powerBonusPct,recordBonusPct,reincarnationPointsGainPct:rpGainPct,permanentPotentialBase:permanentBase,permanentPotentialConversionPct:conversionPct,permanentPotentialGain:permanentBase,energyCost,energyCostBase:cfg.energyCost,finalizedAtUnixMs:args.nowUnixMs??Date.now()};
}

function baseRankCost"""
s=s[:m.start()]+new_reward+s[m.end():]
write(p,s)

# 2) Character: persist fate modifiers, apply combat/body stats and expose boss damage to kernel.
p='dist/core/character.js'; s=read(p)
anchor="""function applyCombatModifiers(stats, modifiers) {
    return {
        maxHp: stats.maxHp * mul(modifiers.maxHpMultiplier),"""
if anchor not in s: raise SystemExit('missing character apply combat anchor')
# Insert helper after complete applyCombatModifiers function by anchor immediately before applyCharacterToEntity.
marker="""export function applyCharacterToEntity(entity, state, registry, techniquePassiveMultiplier = 1, suppressLegacyBirthOrigins = false) {"""
helper="""function applyFateBuildStatsV4(stats, modifiers = {}) {
    const damagePct = Math.max(0, Number(modifiers.damagePct) || 0);
    const maxHpPct = Math.max(0, Number(modifiers.maxHpPct) || 0);
    const defensePct = Math.max(0, Number(modifiers.defensePct) || 0);
    const damageReductionPct = Math.max(0, Number(modifiers.damageReductionPct) || 0);
    let physique = stats.physique;
    let maxHp = stats.maxHp;
    if (maxHpPct > 0) {
        if (Number.isFinite(physique)) { physique = physique * (1 + maxHpPct / 100); maxHp = physique * 20; }
        else maxHp = Math.max(1, Number(maxHp) || 1) * (1 + maxHpPct / 100);
    }
    return { ...stats, attack: Math.max(0, Number(stats.attack) || 0) * (1 + damagePct / 100), defense: Math.max(0, Number(stats.defense) || 0) * (1 + defensePct / 100), physique, maxHp, damageReductionPct: combineStatPctV129('damageReductionPct', stats.damageReductionPct ?? 0, damageReductionPct) };
}
"""
s=rep(s,marker,helper+marker,'character fate helper')
s=rep(s,
"    let finalStats = applyCorePotentialStats(legacyPotentialStats, state.corePotential);\n    const daoNatureApplied = applyDaoNatureStatsV125(finalStats, foundation);",
"    let finalStats = applyCorePotentialStats(legacyPotentialStats, state.corePotential);\n    finalStats = applyFateBuildStatsV4(finalStats, state.fateModifiersV4);\n    const daoNatureApplied = applyDaoNatureStatsV125(finalStats, foundation);",'apply fate stats live')
s=rep(s,
"        daoNatureShieldEffectPctV125: daoNatureApplied.shieldEffectPct,\n    };",
"        daoNatureShieldEffectPctV125: daoNatureApplied.shieldEffectPct,\n        fateV4: { ...(state.fateModifiersV4 ?? {}) },\n    };",'combat build fate metadata')
s=rep(s,
"    push('character.potential', 'Tiềm Năng · Chỉ số Gốc', potentialStats, {\n        life: { ...(state.corePotential?.life?.allocations ?? {}) },\n        permanent: { ...(state.corePotential?.permanent ?? {}) },\n    });\n\n    // These stages mirror applyCharacterToEntity() exactly after Potential.",
"    push('character.potential', 'Tiềm Năng · Chỉ số Gốc', potentialStats, {\n        life: { ...(state.corePotential?.life?.allocations ?? {}) },\n        permanent: { ...(state.corePotential?.permanent ?? {}) },\n    });\n    push('character.fate_v4', 'Mệnh Cách', applyFateBuildStatsV4(current.stats, state.fateModifiersV4), { modifiers: { ...(state.fateModifiersV4 ?? {}) } });\n\n    // These stages mirror applyCharacterToEntity() exactly after Potential.",'provenance fate stage')
s=rep(s,
"        corePotential: state.corePotential ? { life: cloneLifeCorePotentialState(state.corePotential.life), permanent: { ...state.corePotential.permanent } } : { life: createLifeCorePotentialState(), permanent: { power: 0, body: 0, defense: 0 } },\n        buildFoundation:",
"        corePotential: state.corePotential ? { life: cloneLifeCorePotentialState(state.corePotential.life), permanent: { ...state.corePotential.permanent } } : { life: createLifeCorePotentialState(), permanent: { power: 0, body: 0, defense: 0 } },\n        fateModifiersV4: { ...(state.fateModifiersV4 ?? {}) },\n        buildFoundation:",'clone fate modifiers')
s=rep(s,
"        corePotential: { life: createLifeCorePotentialState(), permanent: { power: 0, body: 0, defense: 0 } },\n        buildFoundation:",
"        corePotential: { life: createLifeCorePotentialState(), permanent: { power: 0, body: 0, defense: 0 } },\n        fateModifiersV4: {},\n        buildFoundation:",'create fate modifiers')
write(p,s)

# 3) Cultivation: Tu Mệnh applies to self-cultivation. Keep pure V140 provenance.
p='dist/core/cultivation-v140.js'; s=read(p)
s=rep(s,
"  const reincarnationPct=additiveSelfCultivationPctR3(state,row.order,CULTIVATION_REALMS_V140,perfectStage);\n  const pct=configuredPct+birthPct+reincarnationPct;",
"  const reincarnationPct=additiveSelfCultivationPctR3(state,row.order,CULTIVATION_REALMS_V140,perfectStage);\n  const fatePct=Math.max(0,Number(state?.character?.fateModifiersV4?.selfCultivationPct)||0);\n  const pct=configuredPct+birthPct+reincarnationPct+fatePct;",'cultivation fate pct')
s=rep(s,
"...(reincarnationPct?[{id:'reincarnation-cultivation-r3',label:'Cây Luân Hồi · Tu Luyện',kind:'percent',value:reincarnationPct}]:[])]};",
"...(reincarnationPct?[{id:'reincarnation-cultivation-r3',label:'Cây Luân Hồi · Tu Luyện',kind:'percent',value:reincarnationPct}]:[]),...(fatePct?[{id:'fate-v4',label:'Mệnh Cách',kind:'percent',value:fatePct}]:[])]};",'cultivation provenance fate')
s=rep(s,
"  const rawPerHour=row.requiredTuVi*perHourPct/100;",
"  const fateRetreatPct=Math.max(0,Number(state?.character?.fateModifiersV4?.retreatPct)||0);\n  const rawPerHour=row.requiredTuVi*perHourPct/100*(1+fateRetreatPct/100);",'core retreat fate')
write(p,s)

# 4) CombatKernel path: boss bonus is applied inside canonical combat damage, not in Hunt/PvP wrappers.
p='dist/core/combat.js'; s=read(p)
s=rep(s,
"function simpleSetParamV12318(entity, mechanic, key) {\n    return setMechanicV117(entity, mechanic)?.params[key] ?? 0;\n}",
"function simpleSetParamV12318(entity, mechanic, key) {\n    return setMechanicV117(entity, mechanic)?.params[key] ?? 0;\n}\nfunction fateBossDamageMultiplierV4(source,target){ const pct=Math.max(0,Number(source?.combatBuildV117?.fateV4?.bossDamagePct)||0); const boss=target?.tags?.some(tag=>['boss','dungeonguardian','bosslike'].includes(String(tag).toLowerCase())); return boss?1+pct/100:1; }",'combat fate boss helper')
s=rep(s,
"                passiveLevelsV125: { ...(def.combatBuildV117.passiveLevelsV125 ?? {}) },\n                skillLevelsV12317:",
"                passiveLevelsV125: { ...(def.combatBuildV117.passiveLevelsV125 ?? {}) },\n                fateV4: { ...(def.combatBuildV117.fateV4 ?? {}) },\n                skillLevelsV12317:",'combat instantiate fate clone')
s=rep(s,
"        raw *= battleDaoV2OutgoingMultiplier(source, target, now, ctx.sourceTag);",
"        raw *= battleDaoV2OutgoingMultiplier(source, target, now, ctx.sourceTag);\n        raw *= fateBossDamageMultiplierV4(source,target);",'direct boss damage')
s=rep(s,
"        let damage = Math.max(0, rawAmount) * defenseFactor(srcStats.attack, dstStats.defense, srcStats.armorPenPct ?? 0);",
"        let damage = Math.max(0, rawAmount) * fateBossDamageMultiplierV4(source,target) * defenseFactor(srcStats.attack, dstStats.defense, srcStats.armorPenPct ?? 0);",'converted boss damage')
write(p,s)

# 5) Session: sync chosen Fate to character runtime, Bế Quan/offline/Tài Mệnh, and new RP inputs.
p='dist/core/session.js'; s=read(p)
s=rep(s,
"import { FATE_BUILD_TOTAL_UNLOCK_COST_V4, activeFateBuildV4, cloneFateBuildStateV4, fateBuildUnlockPreviewV4, selectActiveFateBuildV4 as selectActiveFateBuildStateV4, unlockFateBuildV4 as unlockFateBuildStateV4 } from './reincarnation-progression-v1102.js';",
"import { FATE_BUILD_TOTAL_UNLOCK_COST_V4, activeFateBuildV4, cloneFateBuildStateV4, fateBuildDefinitionV4, applyFateSpiritStoneGainV4, fateBuildUnlockPreviewV4, selectActiveFateBuildV4 as selectActiveFateBuildStateV4, unlockFateBuildV4 as unlockFateBuildStateV4 } from './reincarnation-progression-v1102.js';",'session fate imports')
s=rep(s,
"        if (!this.currentLifeValue.activeFateId) this.currentLifeValue.activeFateId = this.metaValue.reincarnationProgress.fateBuild.activeFateId;\n        const rp = this.metaValue.reincarnationProgress;",
"        if (!this.currentLifeValue.activeFateId) this.currentLifeValue.activeFateId = this.metaValue.reincarnationProgress.fateBuild.activeFateId;\n        this.syncCurrentLifeFateRuntimeV4();\n        const rp = this.metaValue.reincarnationProgress;",'constructor fate sync')
s=rep(s,
"            fateRuntime: createFateRuntimeState(),\n        };\n        this.metaValue.reincarnation.totalReincarnations += 1;",
"            fateRuntime: createFateRuntimeState(),\n        };\n        this.syncCurrentLifeFateRuntimeV4();\n        this.metaValue.reincarnation.totalReincarnations += 1;",'rebirth fate sync')

# Add helper methods before fateBuildSummaryV4.
marker="    fateBuildSummaryV4() {"
helpers="""    syncCurrentLifeFateRuntimeV4() {
        let id=this.currentLifeValue?.activeFateId;
        let def;
        try { def=fateBuildDefinitionV4(id); }
        catch { id=this.metaValue.reincarnationProgress.fateBuild.activeFateId; this.currentLifeValue.activeFateId=id; def=fateBuildDefinitionV4(id); }
        this.stateValue.character.fateModifiersV4={...def.modifiers};
        return def;
    }
    fateSpiritStoneGainV4(amount,state=this.stateValue) { return applyFateSpiritStoneGainV4(amount,state?.character?.fateModifiersV4); }
    reincarnationRewardArgsV4(nowUnixMs=Date.now()) {
        const rp=this.metaValue.reincarnationProgress, realmOrder=this.stateValue.realm.maxRealmOrder;
        const combatPower=Math.max(0,Number(this.personalPowerSummary().score)||0);
        const prior=Number(rp.bestCombatPowerByRealmOrderV4?.[String(realmOrder)]??0);
        return { lifeId:this.currentLifeValue.lifeId, realmOrder, lifePotentialEarned:this.stateValue.character.corePotential?.life?.lifetimeEarned??0, permanentPotentialConversionPct:permanentPotentialConversionPctV127(rp.tree), energyCostReductionPct:reincarnationEnergyCostReductionPctV127(rp.tree), reincarnationPointsGainPct:reincarnationPointsGainPctV4(rp.tree), combatPower, combatPowerBenchmark:prior>0?prior:combatPower, isNewRealmRecord:realmOrder>Math.max(0,Number(rp.highestRealmOrderV4)||0), nowUnixMs };
    }
"""
s=rep(s,marker,helpers+marker,'session fate/reward helpers')

# RP preview calls: remove lifeScore dependency.
s=s.replace("        const lifeScore = this.previewCurrentLifeSettlement().totalScore;\n        const currentDepthReward = previewReincarnationV2Reward({ lifeId: this.currentLifeValue.lifeId, realmOrder: this.stateValue.realm.maxRealmOrder, lifePotentialEarned: this.stateValue.character.corePotential?.life?.lifetimeEarned ?? 0, permanentPotentialConversionPct: permanentPotentialConversionPctV127(rp.tree), energyCostReductionPct: reincarnationEnergyCostReductionPctV127(rp.tree), reincarnationPointsGainPct: reincarnationPointsGainPctV4(rp.tree), lifeScore, nowUnixMs });",
"        const currentDepthReward = previewReincarnationV2Reward(this.reincarnationRewardArgsV4(nowUnixMs));")
s=s.replace("const preview=previewReincarnationV2Reward({lifeId:this.currentLifeValue.lifeId,realmOrder:this.stateValue.realm.maxRealmOrder,lifePotentialEarned:this.stateValue.character.corePotential?.life?.lifetimeEarned??0,permanentPotentialConversionPct:permanentPotentialConversionPctV127(rp.tree),energyCostReductionPct:reincarnationEnergyCostReductionPctV127(rp.tree),reincarnationPointsGainPct:reincarnationPointsGainPctV4(rp.tree),lifeScore:this.previewCurrentLifeSettlement().totalScore,nowUnixMs});",
"const preview=previewReincarnationV2Reward(this.reincarnationRewardArgsV4(nowUnixMs));")
s=s.replace("        const settlement=this.previewCurrentLifeSettlement(), rp=this.metaValue.reincarnationProgress;\n        return previewReincarnationV2Reward({lifeId:this.currentLifeValue.lifeId,realmOrder:this.stateValue.realm.maxRealmOrder,lifePotentialEarned:this.stateValue.character.corePotential?.life?.lifetimeEarned??0,permanentPotentialConversionPct:permanentPotentialConversionPctV127(rp.tree),energyCostReductionPct:reincarnationEnergyCostReductionPctV127(rp.tree),reincarnationPointsGainPct:reincarnationPointsGainPctV4(rp.tree),lifeScore:settlement.totalScore,nowUnixMs});",
"        return previewReincarnationV2Reward(this.reincarnationRewardArgsV4(nowUnixMs));")
s=s.replace("        const reward=previewReincarnationV2Reward({lifeId:this.currentLifeValue.lifeId,realmOrder:this.stateValue.realm.maxRealmOrder,lifePotentialEarned:this.stateValue.character.corePotential?.life?.lifetimeEarned??0,permanentPotentialConversionPct:permanentPotentialConversionPctV127(rp.tree),energyCostReductionPct:reincarnationEnergyCostReductionPctV127(rp.tree),reincarnationPointsGainPct:reincarnationPointsGainPctV4(rp.tree),lifeScore:settlement.totalScore,nowUnixMs});",
"        const reward=previewReincarnationV2Reward(this.reincarnationRewardArgsV4(nowUnixMs));")
if 'lifeScore:this.previewCurrentLifeSettlement' in s or 'lifeScore:settlement.totalScore' in s: raise SystemExit('lifeScore reward dependency remains')
s=rep(s,
"        rp.tree.lifetimePointsEarned+=reward.reincarnationPoints;",
"        rp.tree.lifetimePointsEarned+=reward.reincarnationPoints;\n        rp.highestRealmOrderV4=Math.max(Math.max(0,Number(rp.highestRealmOrderV4)||0),reward.realmOrder);\n        rp.bestCombatPowerByRealmOrderV4??={}; rp.bestCombatPowerByRealmOrderV4[String(reward.realmOrder)]=Math.max(Number(rp.bestCombatPowerByRealmOrderV4[String(reward.realmOrder)]||0),reward.combatPower);",'record finalize')

# Bế Quan Fate modifier.
s=rep(s,
"        const basePerHour=required*(row.retreat3hProgressPct/3)/100*injuryMultiplier*(1+retreatTalentPct/100);",
"        const fateRetreatPct=Math.max(0,Number(this.stateValue.character?.fateModifiersV4?.retreatPct)||0);\n        const basePerHour=required*(row.retreat3hProgressPct/3)/100*injuryMultiplier*(1+retreatTalentPct/100)*(1+fateRetreatPct/100);",'session retreat fate')

# Offline Fate modifier only in offline settlement; online self-cultivation already gets Tu Mệnh through cultivationRateV140.
s=rep(s,"    advanceRealtimeCultivationV140(realSeconds) {","    advanceRealtimeCultivationV140(realSeconds, extraSelfCultivationPctV4 = 0) {",'offline signature')
s=rep(s,
"            const rate=cultivationRateV140(this.stateValue,order).finalTuViPer15s; if(rate<=0)break;",
"            const baseRate=cultivationRateV140(this.stateValue,order).finalTuViPer15s; const rate=Math.max(0,Math.round(baseRate*(1+Math.max(0,Number(extraSelfCultivationPctV4)||0)/100))); if(rate<=0)break;",'offline rate')
s=rep(s,
"        const beforeTuVi = this.stateValue.cultivation.tuVi;\n        if (rewardSeconds > 0) this.advanceRealtimeCultivationV140(rewardSeconds);",
"        const beforeTuVi = this.stateValue.cultivation.tuVi;\n        const fateOfflineBonusPct=Math.max(0,Number(this.stateValue.character?.fateModifiersV4?.offlineSelfCultivationPct)||0)+Math.max(0,Number(this.stateValue.character?.fateModifiersV4?.offlineRewardPct)||0);\n        if (rewardSeconds > 0) this.advanceRealtimeCultivationV140(rewardSeconds,fateOfflineBonusPct);",'offline call')
s=rep(s,
"return { schema:'offline-return.v140', elapsedRealHours:elapsedSeconds/3600, processedRealHours:rewardSeconds/3600, capRealHours:capHours, cultivationGain:rewardCultivationGain,",
"return { schema:'offline-return.v140', elapsedRealHours:elapsedSeconds/3600, processedRealHours:rewardSeconds/3600, capRealHours:capHours, fateOfflineBonusPct, cultivationGain:rewardCultivationGain,",'offline dto')

# Tài Mệnh — direct player Linh Thạch gains in Session.
# Hunt farm: wrap deterministic amount while keeping returned reward consistent.
s=re.sub(r"const spiritStones = (deterministicJitteredTotalV77\([^;]+\));",r"const spiritStones = this.fateSpiritStoneGainV4(\1);",s,count=1)
# Live hunt win and loss.
s=s.replace("            spiritStones = Math.max(0, Math.round(result.spiritStones * map.rewardDepthMultiplier * economyBandScale(map.majorRealmIndex) * fateMods.rewardMultiplier * fateEvent.rewardMultiplier * farmReward.multiplier * huntRewardMultiplier)) + fateEvent.spiritStoneDelta;",
"            spiritStones = this.fateSpiritStoneGainV4(Math.max(0, Math.round(result.spiritStones * map.rewardDepthMultiplier * economyBandScale(map.majorRealmIndex) * fateMods.rewardMultiplier * fateEvent.rewardMultiplier * farmReward.multiplier * huntRewardMultiplier)) + fateEvent.spiritStoneDelta);")
s=s.replace("                spiritStones = fateEvent.spiritStoneDelta;","                spiritStones = this.fateSpiritStoneGainV4(fateEvent.spiritStoneDelta);")
# Fixed/tutorial and simple player grants.
s=s.replace("+ 6;","+ this.fateSpiritStoneGainV4(6);",1)
s=s.replace("+ 10;","+ this.fateSpiritStoneGainV4(10);",1)
s=s.replace("+ 8;","+ this.fateSpiritStoneGainV4(8);",1)
# Market sell.
s=s.replace("+ transaction.totalSpiritStones;\n        return this.finishMarketTrade('sell', transaction);","+ this.fateSpiritStoneGainV4(transaction.totalSpiritStones);\n        return this.finishMarketTrade('sell', { ...transaction, totalSpiritStones:this.fateSpiritStoneGainV4(transaction.totalSpiritStones) });")
# World opportunity claim/share keep DTO consistent.
s=s.replace("            this.stateValue.inventory['resource.spirit_stone'] = (this.stateValue.inventory['resource.spirit_stone'] ?? 0) + baseStones;\n            this.grantTuViV140(baseTuVi, 'world-opportunity');\n            rewards['resource.spirit_stone'] = baseStones;",
"            const awardedStones=this.fateSpiritStoneGainV4(baseStones);\n            this.stateValue.inventory['resource.spirit_stone'] = (this.stateValue.inventory['resource.spirit_stone'] ?? 0) + awardedStones;\n            this.grantTuViV140(baseTuVi, 'world-opportunity');\n            rewards['resource.spirit_stone'] = awardedStones;")
s=s.replace("            const stones = Math.max(1, Math.round(baseStones * 0.45));","            const stones = this.fateSpiritStoneGainV4(Math.max(1, Math.round(baseStones * 0.45)));")
# World simulator event reward.
s=s.replace("state.inventory['resource.spirit_stone'] = (state.inventory['resource.spirit_stone'] ?? 0) + spiritStones;","state.inventory['resource.spirit_stone'] = (state.inventory['resource.spirit_stone'] ?? 0) + this.fateSpiritStoneGainV4(spiritStones,state);",1)
# Economy material sale: add only the Fate bonus on top of the canonical base transaction.
old="""        const major = majorRealmIndexForRealmOrder(this.stateValue.realm.maxRealmOrder);
        const result = sellEconomyMaterial({ container: this.stateValue.economy, inventory: this.stateValue.inventory, resourceId, quantity, majorRealmIndex: major });
        this.actionIndexValue += 1;"""
new="""        const major = majorRealmIndexForRealmOrder(this.stateValue.realm.maxRealmOrder);
        const beforeStones=Math.max(0,Number(this.stateValue.inventory['resource.spirit_stone'])||0);
        const result = sellEconomyMaterial({ container: this.stateValue.economy, inventory: this.stateValue.inventory, resourceId, quantity, majorRealmIndex: major });
        const baseGain=Math.max(0,(Number(this.stateValue.inventory['resource.spirit_stone'])||0)-beforeStones), adjustedGain=this.fateSpiritStoneGainV4(baseGain);
        if(adjustedGain>baseGain)this.stateValue.inventory['resource.spirit_stone']+=adjustedGain-baseGain;
        result.fateBonusSpiritStones=Math.max(0,adjustedGain-baseGain);
        this.actionIndexValue += 1;"""
s=rep(s,old,new,'economy material sale fate')
write(p,s)

# 6) Dedicated gameplay + balance simulation gate.
test=r'''import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildRegistry } from '../../dist/content/registry.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { adventureEnemies, heavySwordCultivator, playableMortalCultivator } from '../../dist/content/entities.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { SimulationSession } from '../../dist/core/session.js';
import { combatMaxHp } from '../../dist/core/combat-rules.js';
import { runCombatKernelV2 } from '../../dist/core/combat-kernel-v2.js';
import { cultivationRateV140 } from '../../dist/core/cultivation-v140.js';
import {
  FATE_BUILD_TOTAL_UNLOCK_COST_V4, REINCARNATION_PERMANENT_POTENTIAL_BASE_PCT_V127, REINCARNATION_PERMANENT_POTENTIAL_MAX_PCT_V127,
  REINCARNATION_DEPTH_CONFIG, applyCorePotentialStats, applyFateSpiritStoneGainV4, corePotentialPercentBonusV4,
  lifePotentialMilestonesThroughRealmOrder, previewReincarnationV2Reward, reincarnationPowerBonusPctV4, reincarnationStageFactorV4,
  totalTreeMaxCostV127,
} from '../../dist/core/reincarnation-progression-v1102.js';

const registry=buildRegistry();
const make=(seed=441001)=>new SimulationSession(registry,thanhHaWorld,adventureEnemies,playablePlayerProfile,seed,createPlayableAdventureState());
let passed=0; const test=(name,fn)=>{fn();passed++;console.log(`✓ ${name}`)};

test('Tiềm Năng Vĩnh Viễn conversion is canonical 3% → 10%',()=>{
  assert.equal(REINCARNATION_PERMANENT_POTENTIAL_BASE_PCT_V127,3);
  assert.equal(REINCARNATION_PERMANENT_POTENTIAL_MAX_PCT_V127,10);
});

test('Tu Mệnh changes real V140 Tự Tu rate and Bế Quan payout',()=>{
  const base=make(441002), fate=make(441002);
  base.stateValue.realm.maxRealmOrder=fate.stateValue.realm.maxRealmOrder=18;
  base.stateValue.realm.realmId=fate.stateValue.realm.realmId='realm.golden_core.early';
  base.stateValue.character.fateModifiersV4={}; fate.stateValue.character.fateModifiersV4={selfCultivationPct:22,retreatPct:15};
  const a=cultivationRateV140(base.stateValue,18).finalTuViPer15s,b=cultivationRateV140(fate.stateValue,18).finalTuViPer15s;
  assert(b>a,`${a} -> ${b}`);
  const now=1_800_000_000_000; base.stateValue.cultivation.retreatBankHours=fate.stateValue.cultivation.retreatBankHours=3;
  const ar=base.instantRetreatV140(1,now), br=fate.instantRetreatV140(1,now);
  assert(br.gained>ar.gained,`${ar.gained} -> ${br.gained}`);
});

test('Chiến/Thể Mệnh materialize into the canonical personal CombatEntity',()=>{
  const ss=make(441003); ss.stateValue.character.fateModifiersV4={}; const a=ss.personalCombatEntity();
  ss.stateValue.character.fateModifiersV4={damagePct:20,bossDamagePct:12,maxHpPct:28,defensePct:10,damageReductionPct:6}; const b=ss.personalCombatEntity();
  assert(b.stats.attack>a.stats.attack*1.19); assert(combatMaxHp(b.stats)>combatMaxHp(a.stats)*1.27); assert(b.stats.defense>a.stats.defense*1.09); assert((b.stats.damageReductionPct??0)>(a.stats.damageReductionPct??0));
  assert.equal(b.combatBuildV117.fateV4.bossDamagePct,12);
});

test('Boss Damage của Chiến Mệnh is consumed inside CombatKernel V2',()=>{
  const player={...structuredClone(playableMortalCultivator),id:'p',stats:{...playableMortalCultivator.stats,attack:500},combatBuildV117:{fateV4:{bossDamagePct:0}}};
  const boosted=structuredClone(player); boosted.combatBuildV117.fateV4.bossDamagePct=12;
  const boss={...structuredClone(heavySwordCultivator),id:'b',tags:[...(heavySwordCultivator.tags??[]),'Boss'],stats:{...heavySwordCultivator.stats,maxHp:20000,physique:1000}};
  const a=runCombatKernelV2({mode:'realtime',registry,seed:9191,entities:[player,boss],maxDuration:8}).battle;
  const b=runCombatKernelV2({mode:'realtime',registry,seed:9191,entities:[boosted,boss],maxDuration:8}).battle;
  assert(b.finalState.b.hp<a.finalState.b.hp,`${a.finalState.b.hp} -> ${b.finalState.b.hp}`);
});

test('Tài Mệnh scales actual Linh Thạch gain helper and never scales costs',()=>{
  assert.equal(applyFateSpiritStoneGainV4(1000,{spiritStoneGainPct:25}),1250);
  assert.equal(applyFateSpiritStoneGainV4(1000,{}),1000);
  const session=fs.readFileSync(new URL('../../dist/core/session.js',import.meta.url),'utf8');
  assert(session.includes('fateSpiritStoneGainV4(transaction.totalSpiritStones)'));
  assert(!session.includes("stones - this.fateSpiritStoneGainV4"));
});

test('Nhàn Mệnh changes real offline V140 cultivation settlement',()=>{
  const a=make(441004),b=make(441004); for(const ss of [a,b]){ss.stateValue.realm.maxRealmOrder=18;ss.stateValue.realm.realmId='realm.golden_core.early';ss.stateValue.cultivation.tuVi=0;ss.stateValue.cultivation.commitRemainderSeconds=0;}
  a.stateValue.character.fateModifiersV4={}; b.stateValue.character.fateModifiersV4={offlineRewardPct:25};
  const t=1_800_000_000_000,ra=a.resolveRealtimeOffline({},t,t+3600_000),rb=b.resolveRealtimeOffline({},t,t+3600_000);
  assert(rb.cultivationGain>ra.cultivationGain*1.20,`${ra.cultivationGain} -> ${rb.cultivationGain}`); assert.equal(rb.fateOfflineBonusPct,25);
});

test('RP V4 ignores lifeScore and uses stage + same-realm power + record',()=>{
  const common={lifeId:'x',realmOrder:21,lifePotentialEarned:72,permanentPotentialConversionPct:3,combatPower:150,combatPowerBenchmark:100,isNewRealmRecord:true,reincarnationPointsGainPct:0,energyCostReductionPct:0,nowUnixMs:1};
  const a=previewReincarnationV2Reward({...common,lifeScore:0}),b=previewReincarnationV2Reward({...common,lifeScore:999999}); assert.equal(a.reincarnationPoints,b.reincarnationPoints);
  assert.equal(Number(reincarnationStageFactorV4(21).toFixed(2)),1.30); assert.equal(reincarnationPowerBonusPctV4(150,100),20); assert.equal(a.powerBonusPct,20); assert.equal(a.recordBonusPct,15);
});

test('RP same-realm benchmark is persisted and session preview uses it without mutating save',()=>{
  const ss=make(441005); ss.stateValue.realm.maxRealmOrder=18;ss.stateValue.realm.realmId='realm.golden_core.early';
  const power=ss.personalPowerSummary().score; ss.metaValue.reincarnationProgress.highestRealmOrderV4=18; ss.metaValue.reincarnationProgress.bestCombatPowerByRealmOrderV4['18']=power/2;
  const before=JSON.stringify(ss.state); const r=ss.previewReincarnationV2Reward(1_800_000_000_000); const after=JSON.stringify(ss.state);
  assert.equal(r.powerBonusPct,30); assert.equal(r.recordBonusPct,0); assert.equal(before,after);
});

test('Current Phase-1 tree cannot be full in 2–3 Sáng Thế lives even at extreme power',()=>{
  const sink=totalTreeMaxCostV127()+FATE_BUILD_TOTAL_UNLOCK_COST_V4,order=117;
  const max=previewReincarnationV2Reward({lifeId:'sim',realmOrder:order,lifePotentialEarned:1739,permanentPotentialConversionPct:10,combatPower:500,combatPowerBenchmark:100,isNewRealmRecord:false,reincarnationPointsGainPct:25,energyCostReductionPct:25,nowUnixMs:1});
  const lives=Math.ceil(sink/max.reincarnationPoints); assert(lives>=10,`sink=${sink} maxRP=${max.reincarnationPoints} lives=${lives}`);
});

test('Tiềm Năng soft-cap remains meaningful at 1/10/50/100 late-game reincarnations without runaway',()=>{
  const baseLife=lifePotentialMilestonesThroughRealmOrder(117).reduce((s,x)=>s+x.amount,0);
  const maxLife=lifePotentialMilestonesThroughRealmOrder(117).reduce((s,x)=>s+Math.round(x.amount*1.25),0);
  const perLife3=Math.round(baseLife*.03),perLife10=Math.round(maxLife*.10);
  const rows=[];
  for(const lives of [1,10,50,100]){
    const balanced3=Math.floor(perLife3*lives/3),balanced10=Math.floor(perLife10*lives/3);
    const p3=corePotentialPercentBonusV4(balanced3),p10=corePotentialPercentBonusV4(balanced10);
    rows.push({lives,permanent3:perLife3*lives,balancedBonus3Pct:Number(p3.toFixed(2)),permanent10:perLife10*lives,balancedBonus10Pct:Number(p10.toFixed(2))});
    assert(p10>p3); assert(p10<35);
  }
  const sample=applyCorePotentialStats({attack:1_000_000,defense:800_000,physique:50_000,maxHp:1_000_000},{life:{unspent:0,lifetimeEarned:0,allocations:{power:0,body:0,defense:0},awardedMilestones:[]},permanent:{power:Math.floor(perLife10*10/3),body:Math.floor(perLife10*10/3),defense:Math.floor(perLife10*10/3)}});
  assert(sample.attack>1_000_000*1.05); assert(sample.defense>800_000*1.05); assert(sample.maxHp>1_000_000*1.05);
  console.log('POTENTIAL SIM',rows);
});

const sink=totalTreeMaxCostV127()+FATE_BUILD_TOTAL_UNLOCK_COST_V4;
console.log('RP SIM');
for(const cfg of REINCARNATION_DEPTH_CONFIG){
  const order=cfg.endOrder,base=previewReincarnationV2Reward({lifeId:'sim',realmOrder:order,combatPower:100,combatPowerBenchmark:100,isNewRealmRecord:false,reincarnationPointsGainPct:0,nowUnixMs:1}),maxTree=previewReincarnationV2Reward({lifeId:'sim',realmOrder:order,combatPower:150,combatPowerBenchmark:100,isNewRealmRecord:false,reincarnationPointsGainPct:25,nowUnixMs:1});
  console.log(`${cfg.name}\torder=${order}\tRP=${base.reincarnationPoints}\tRP+tree+1.5x=${maxTree.reincarnationPoints}\tlivesToCurrentSink=${Math.ceil(sink/maxTree.reincarnationPoints)}`);
}
console.log(`REINCARNATION V4 GAMEPLAY + BALANCE — ${passed}/${passed} PASS`);
'''
write('qa/tests/reincarnation-v4-gameplay-balance-test.js',test)

# Update lifecycle contract from old lifeScore assertion to new RP contract.
p='qa/tests/reincarnation-v4-lifecycle-contract-test.js'; s=read(p)
s=s.replace("  lifeAchievementBonusPctV4,\n","")
s=s.replace("assert.equal(lifeAchievementBonusPctV4(0),0);\nassert(lifeAchievementBonusPctV4(2500)>lifeAchievementBonusPctV4(100));\nconst low=previewReincarnationV2Reward({lifeId:'x',realmOrder:18,lifeScore:0,lifePotentialEarned:20});\nconst high=previewReincarnationV2Reward({lifeId:'x',realmOrder:18,lifeScore:2500,lifePotentialEarned:20});\nassert(high.reincarnationPoints>low.reincarnationPoints,'Thành tựu thật trong đời phải tăng RP.');\nassert.equal(high.trialBonusPct,undefined,'Reward V4 không được phụ thuộc Thí Luyện giả.');",
"const low=previewReincarnationV2Reward({lifeId:'x',realmOrder:18,combatPower:100,combatPowerBenchmark:100,isNewRealmRecord:false,lifePotentialEarned:20});\nconst high=previewReincarnationV2Reward({lifeId:'x',realmOrder:21,combatPower:200,combatPowerBenchmark:100,isNewRealmRecord:true,lifePotentialEarned:20});\nassert(high.reincarnationPoints>low.reincarnationPoints,'Realm + stage + Lực Chiến + record phải tăng RP.');\nassert.equal(high.trialBonusPct,undefined,'Reward V4 không được phụ thuộc Thí Luyện giả.');\nassert.equal(high.achievementBonusPct,undefined,'Reward V4 không được phụ thuộc lifeScore cũ.');")
write(p,s)

print('PATCHED: Reincarnation V4 gameplay, RP and potential balance')
