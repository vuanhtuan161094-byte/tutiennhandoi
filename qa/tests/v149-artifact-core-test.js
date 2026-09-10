import assert from 'node:assert/strict';
import {
  ARTIFACTS_V88,
  ARTIFACT_SCHEMA_V149,
  ARTIFACT_RAW_PROFILES_V149,
  artifactBaoHonRankV149,
  artifactBaoHonUnlockedV149,
  artifactFortuneSummaryV88,
  artifactCombatRuntimeV88,
  artifactRawSummaryV149,
  artifactViewV88,
  applyArtifactsV88ToEntity,
  migrateArtifactProgressV149,
  refineArtifactBaoHonV149,
} from '../../dist/core/artifact-v88.js';

let pass=0;
const check=(value,message)=>{assert.ok(value,message);pass++;console.log(`✓ ${message}`)};
const equal=(actual,expected,message)=>{assert.deepEqual(actual,expected,message);pass++;console.log(`✓ ${message}`)};

function item(overrides={}){
  return {owned:true,level:100,advance:4,specificFragments:0,...overrides};
}
function stateFor(activeIds=[],overrides={}){
  const items=Object.fromEntries(ARTIFACTS_V88.map(d=>[d.id,item()]));
  return {
    schema:'collection-progression.v12316',
    genericFragments:{manual:0,artifact:10_000_000,pet:0,companion:0},
    items,
    activeArtifactIds:[...activeIds],
    cave:{level:1,facilities:[{id:'artifact',level:10}]},
    economyV12325:{relicV88Migrated:true,extraItems:{},activeRelicId:undefined},
    artifactV88Migrated:true,
    ...overrides,
  };
}
function pctProjection(f){
  return {artifactPowerPct:f.artifactPowerPct,baoQiGainPct:f.baoQiGainPct,cooldownRecoveryPct:f.cooldownRecoveryPct,relicPowerPct:f.relicPowerPct};
}
function triggerProjection(runtime){
  return runtime.triggers.map(t=>({id:t.id,cooldown:t.cooldown,effects:t.effects}));
}

check(ARTIFACTS_V88.length===12,'V149 preserves exactly 12 authored production Pháp Bảo');
check(Object.keys(ARTIFACT_RAW_PROFILES_V149).length===12&&ARTIFACTS_V88.every(d=>ARTIFACT_RAW_PROFILES_V149[d.id]),'V149 authors one explicit raw profile for every Pháp Bảo');
check(Object.values(ARTIFACT_RAW_PROFILES_V149).every(p=>['attack','physique','defense'].every(k=>Number.isFinite(p[k])&&p[k]>=0)),'V149 raw profiles use only non-negative Công Lực/Thể Phách/Phòng Ngự values');
check(Object.values(ARTIFACT_RAW_PROFILES_V149).every(p=>Object.keys(p).every(k=>['attack','physique','defense'].includes(k))),'V149 raw profiles contain no percentage or multiplier axis');

const migrated={owned:true,level:100,advance:4,specificFragments:0};
migrateArtifactProgressV149(migrated);
equal(migrated.artifactV149,{schema:ARTIFACT_SCHEMA_V149,baoHonRank:0},'V149 migration initializes pre-V149 save progress at Bảo Hồn 0');
migrated.artifactV149.baoHonRank=-99;
migrateArtifactProgressV149(migrated);
check(artifactBaoHonRankV149(migrated)===0,'V149 migration clamps invalid negative Bảo Hồn rank to 0');
migrated.artifactV149.baoHonRank=Number.POSITIVE_INFINITY;
migrateArtifactProgressV149(migrated);
check(artifactBaoHonRankV149(migrated)===0,'V149 migration clamps non-finite Bảo Hồn rank to 0');
check(!artifactBaoHonUnlockedV149(item({level:99}))&&!artifactBaoHonUnlockedV149(item({advance:3}))&&artifactBaoHonUnlockedV149(item()),'Bảo Hồn unlocks only at Luyện Hóa 100 + Bảo Giai V');

const sword=ARTIFACTS_V88.find(x=>x.id==='artifact.thunder_punishment_sword');
const support=ARTIFACTS_V88.find(x=>x.id==='artifact.soul_nourishing_lotus');
const state=stateFor([sword.id]);
const fortuneBefore=pctProjection(artifactFortuneSummaryV88(state));
const triggerBefore=triggerProjection(artifactCombatRuntimeV88(state));
const materialBefore=state.genericFragments.artifact;
const r1=refineArtifactBaoHonV149(state,sword.id,1,10);
check(r1.ranks===1&&artifactBaoHonRankV149(state.items[sword.id])===1,'Bảo Hồn spends one infinite progression rank on canonical artifact progress');
check(state.genericFragments.artifact<materialBefore&&r1.cost===materialBefore-state.genericFragments.artifact,'Bảo Hồn consumes existing Luyện Bảo Tinh Hoa source/sink ledger');
check(!('currency' in r1)&&Object.keys(state.genericFragments).every(k=>['manual','artifact','pet','companion'].includes(k)),'Bảo Hồn introduces no new currency/material ledger');
const oneRaw=artifactRawSummaryV149(state);
equal({attack:oneRaw.attack,physique:oneRaw.physique,defense:oneRaw.defense},ARTIFACT_RAW_PROFILES_V149[sword.id],'One Bảo Hồn rank adds exactly the authored raw profile');
check(oneRaw.sources.length===1&&oneRaw.sources[0].id===sword.id&&oneRaw.sources[0].baoHonRank===1,'V149 exposes raw stat provenance by equipped Pháp Bảo');

state.items[sword.id].artifactV149.baoHonRank=1_000_000;
const highRaw=artifactRawSummaryV149(state);
const p=ARTIFACT_RAW_PROFILES_V149[sword.id];
equal({attack:highRaw.attack,physique:highRaw.physique,defense:highRaw.defense},{attack:p.attack*1_000_000,physique:p.physique*1_000_000,defense:p.defense*1_000_000},'Bảo Hồn supports arbitrarily high additive raw rank without a percentage multiplier');
equal(pctProjection(artifactFortuneSummaryV88(state)),fortuneBefore,'Bảo Hồn rank does not increase bounded all-owned Bảo Vận percentages');
equal(triggerProjection(artifactCombatRuntimeV88(state)),triggerBefore,'Bảo Hồn rank does not scale Pháp Kỹ coefficients/cooldowns or create a second mechanic multiplier');
const caps=artifactFortuneSummaryV88(state).caps;
check(caps.artifactPowerPct===12&&caps.baoQiGainPct===10&&caps.cooldownRecoveryPct===6&&caps.relicPowerPct===8,'V149 keeps all Artifact Fortune percentage caps explicit and finite');

state.items[support.id].artifactV149={schema:ARTIFACT_SCHEMA_V149,baoHonRank:250};
const stillOne=artifactRawSummaryV149(state);
check(stillOne.sources.length===1&&!stillOne.sources.some(x=>x.id===support.id),'Unequipped Bảo Hồn rank is preserved but contributes zero raw combat stats');
state.activeArtifactIds.push(support.id);
const two=artifactRawSummaryV149(state);
check(two.sources.length===2&&two.physique===ARTIFACT_RAW_PROFILES_V149[support.id].physique*250,'Equipping a progressed defensive Pháp Bảo activates its authored raw contribution');

const base={id:'P',name:'V149 Tester',tags:[],stats:{attack:1000,physique:1000,defense:1000},triggers:[],skillIds:[],aiProfile:{name:'idle',rules:[]}};
const entity=applyArtifactsV88ToEntity(base,state);
check(entity.stats.attack===1000+two.attack&&entity.stats.physique===1000+two.physique&&entity.stats.defense===1000+two.defense,'V149 applies Bảo Hồn as direct additive combat base stats');
check(entity.combatBuildV117?.artifactV88?.v149Schema===ARTIFACT_SCHEMA_V149&&entity.combatBuildV117.artifactV88.raw.attack===two.attack,'CombatEntity carries inspectable V149 raw provenance inside existing V88 runtime contract');
check(entity.triggers.some(t=>t.runtimeV88?.kind==='artifactSkill'),'V149 still injects Pháp Kỹ as shared CombatEngine runtimeV88 triggers');

const view=artifactViewV88(state,sword.id);
check(view.v149?.schema===ARTIFACT_SCHEMA_V149&&view.v149.percentGrowth===false&&view.v149.baoHonRank===1_000_000,'Artifact read-model exposes Bảo Hồn rank/raw and explicitly declares no percent growth');
check(view.v149.rawCurrent.attack===p.attack*1_000_000&&view.v149.material==='Luyện Bảo Tinh Hoa','Artifact read-model exposes current raw contribution and real existing sink material');

console.log(`\nV149 ARTIFACT CORE: ${pass}/${pass} PASS`);
