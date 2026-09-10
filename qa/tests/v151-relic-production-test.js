import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildRegistry } from '../../dist/content/registry.js';
import { runCombatKernelV2 } from '../../dist/core/combat-kernel-v2.js';
import {
  ARTIFACTS_V88,
  RELICS_V88,
  RELIC_SCHEMA_V151,
  RELIC_SLOT_LIMIT_V151,
  RELIC_RULES_V151,
  artifactCombatRuntimeV88,
  applyArtifactsV88ToEntity,
  relicEffectScaleV151,
  relicSummaryV151,
  relicViewV88,
} from '../../dist/core/artifact-v88.js';

let pass=0;
const check=(value,message)=>{assert.ok(value,message);pass++;console.log(`✓ ${message}`)};
const equal=(a,b,message)=>{assert.deepEqual(a,b,message);pass++;console.log(`✓ ${message}`)};

const ART_LOADOUT=['artifact.thunder_guiding_mirror','artifact.thunder_punishment_sword'];
const artItem=()=>({owned:true,level:100,advance:4,specificFragments:0,artifactV149:{schema:'artifact.production.v149',baoHonRank:0}});
const relicItem=(level=100,advance=4,owned=true)=>({owned,level,advance,specificFragments:999});
function stateFor(activeRelicId,{level=100,advance=4,ownedAll=true,activeArtifacts=[]}={}){
  return {
    schema:'collection-progression.v12316',
    genericFragments:{manual:0,artifact:0,pet:0,companion:0},
    items:Object.fromEntries(ARTIFACTS_V88.map(d=>[d.id,artItem()])),
    activeArtifactIds:[...activeArtifacts],
    cave:{level:1,facilities:[{id:'artifact',level:10}]},
    economyV12325:{relicV88Migrated:true,extraItems:Object.fromEntries(RELICS_V88.map(d=>[d.id,relicItem(level,advance,ownedAll)])),activeRelicId},
    artifactV88Migrated:true,
  };
}

check(RELICS_V88.length===8,'V151 preserves exactly eight authored Chí Bảo');
check(RELIC_SLOT_LIMIT_V151===1,'V151 keeps exactly one active Chí Bảo slot');
check(Object.keys(RELIC_RULES_V151).length===8,'Every Chí Bảo has a V151 identity contract');
check(new Set(Object.values(RELIC_RULES_V151).map(x=>x.pattern)).size===8,'All eight Chí Bảo use distinct combat-law patterns');
check(RELICS_V88.every(x=>x.v151?.schema===RELIC_SCHEMA_V151&&x.v151.activeLimit===1),'Every player-facing Chí Bảo definition carries the V151 one-slot schema');
check(!JSON.stringify(RELICS_V88).includes('Bảo Khí'),'V151 Chí Bảo definitions do not restore the removed Bảo Khí resource');
check(RELICS_V88.every(x=>!('costReductionPct' in x)&&!('baoQiGainPct' in x)&&!('baoQiMaxBonus' in x)&&!('baoQiCost' in (x.trigger??{}))&&!('baoQiGain' in (x.trigger??{}))),'No V151 Chí Bảo carries obsolete resource stats/costs');
check(new Set(RELICS_V88.map(x=>x.ruleName)).size===8,'All eight Chí Bảo expose distinct named combat rules');

const mirror=RELICS_V88.find(x=>x.id==='relic.2');
check(mirror?.reincarnationMirror===true&&!mirror.trigger,'Luân Hồi Kính is a dedicated anti-death rule rather than a normal proc');
check(RELICS_V88.filter(x=>x.trigger).length===7,'The other seven Chí Bảo have explicit shared-engine combat triggers');
const chaos=RELICS_V88.find(x=>x.id==='relic.6');
check(['damage','shield','restoreSpirit'].every(type=>chaos?.trigger?.effects?.some(e=>e.type===type)),'Hỗn Độn Đỉnh is a counter-pressure rule with damage, small shield and spirit recovery');
const ruler=RELICS_V88.find(x=>x.id==='relic.7');
check(ruler?.trigger?.effects?.some(e=>e.type==='addMark'&&e.mark==='Phá Vọng'&&e.stacks===2),'Càn Khôn Xích creates two Phá Vọng stacks as a real cross-system combo bridge');
const bell=RELICS_V88.find(x=>x.id==='relic.5');
check(bell?.trigger?.sourceTags?.includes('Summon')&&bell.trigger.cooldown>=7,'Vạn Pháp Đạo Chung listens to real Pháp Bảo/triệu hồi hit traffic and is cooldown-bounded against recursion spam');

for(const relic of RELICS_V88){
  const state=stateFor(relic.id);
  const runtime=artifactCombatRuntimeV88(state);
  const live=runtime.triggers.filter(t=>t.runtimeV88?.kind==='relicRule');
  if(relic.id==='relic.2')check(live.length===0&&runtime.reincarnationMirror===true,'Luân Hồi Kính activates only through the existing shared anti-death path');
  else check(live.length===1&&live[0].runtimeV88?.itemId===relic.id,`${relic.name} injects exactly one active shared-engine relic rule`);
}

const corrupted=stateFor('relic.2',{ownedAll:false});
const corruptedRuntime=artifactCombatRuntimeV88(corrupted);
check(corruptedRuntime.reincarnationMirror===false&&!corruptedRuntime.triggers.some(t=>t.runtimeV88?.kind==='relicRule'),'An unowned activeRelicId cannot grant live Chí Bảo mechanics');
const minimalBase={id:'X',name:'Authority Test',tags:[],stats:{attack:100,physique:100,defense:100,maxSpirit:100},triggers:[],skillIds:[],aiProfile:{name:'idle',rules:[]}};
check(!applyArtifactsV88ToEntity(minimalBase,corrupted).tags.includes('ArtifactV88:Relic:ReincarnationMirror'),'Corrupted unowned Luân Hồi Kính cannot leak the anti-death tag through legacy composition');

const low=stateFor('relic.4',{level:1,advance:0});
const high=stateFor('relic.4',{level:100,advance:4});
const lowScale=relicEffectScaleV151(low,'relic.4'),highScale=relicEffectScaleV151(high,'relic.4');
check(highScale>lowScale&&lowScale>0,'Finite Lv1→Lv100 / Giai I→V progression increases Chí Bảo effect scale');
const lowTrig=artifactCombatRuntimeV88(low).triggers.find(t=>t.runtimeV88?.itemId==='relic.4');
const highTrig=artifactCombatRuntimeV88(high).triggers.find(t=>t.runtimeV88?.itemId==='relic.4');
check(highTrig.effects.find(e=>e.type==='damage').coefficient>lowTrig.effects.find(e=>e.type==='damage').coefficient&&highTrig.cooldown===lowTrig.cooldown,'Progression strengthens authored effects without silently accelerating the relic cooldown');
const summary=relicSummaryV151(high);
equal(summary.sourceSink,{summon:'Thiên Bảo',daily:'Chí Bảo Tàn Giới',strengthen:'Chí Bảo Linh Tinh',advance:'mảnh riêng + Thiên Tinh Tiến Giai'},'V151 exposes the real finite Chí Bảo source/sink loop');
check(summary.activeLimit===1&&summary.activeId==='relic.4'&&summary.progression.includes('Lv1–100'),'V151 summary exposes one-slot authority and finite progression');
const view=relicViewV88(high,'relic.4');
check(view?.v151?.schema===RELIC_SCHEMA_V151&&view.v151.active===true&&view.v151.effectScale===highScale,'Chí Bảo detail view exposes V151 identity, active state and effect scale');

const registry=buildRegistry();
const STRIKE='skill.v151.relic.strike';
const IDLE='skill.v151.relic.idle';
if(!registry.skills.has(STRIKE))registry.registerSkill({id:STRIKE,name:'V151 Thử Kích',description:'Đòn thử combat thật.',tags:['BalanceSimV151'],spiritCost:0,cooldown:0,castTime:0,recoveryTime:1,effects:[{type:'damage',coefficient:.16,sourceTag:'ActiveHit',canCrit:false,canDodge:true,procCoefficient:1}]});
if(!registry.skills.has(IDLE))registry.registerSkill({id:IDLE,name:'V151 Tĩnh Thủ',description:'Không gây sát thương.',tags:['BalanceSimV151'],spiritCost:0,cooldown:0,castTime:0,recoveryTime:1,effects:[]});
function stats({attack=500,physique=900,defense=500,dodge=0,mobility=1,accuracy=100}={}){return{maxHp:180000,attack,physique,defense,maxSpirit:100,spiritStandard:100,spiritRegenStandardPctPerSecond:0,mobility,accuracy,critChancePct:0,critPowerPerLayer:.5,heartChancePct:0,dodgeChancePct:dodge,controlPower:1,resolve:100,actionSpeed:1,elementalAffinities:{},elementalResistancesPct:{},dominantElement:'Earth'};}
function entity(id,name,skillId,overrides={}){return{id,combatModel:'locked-v1',name,tags:[],stats:stats(overrides),skillIds:[skillId],aiProfile:{name:`${id}-ai`,rules:[{skillId,priority:1,conditions:[{type:'always'}]}]}};}
function runWith(relicId,{activeArtifacts=[],playerStats={},enemyStats={},duration=45,seed=151001}={}){const state=stateFor(relicId,{activeArtifacts});const player=applyArtifactsV88ToEntity(entity('P','V151 Player',STRIKE,playerStats),state);const enemy=entity('E','V151 Enemy',STRIKE,enemyStats);return runCombatKernelV2({registry,seed,entities:[player,enemy],maxDuration:duration,mode:'simulation'}).battle;}
const relicLogs=(battle,id)=>battle.logs.filter(x=>x.type==='trigger'&&x.actorId==='P'&&x.data?.artifactRuntime==='artifact.v88'&&x.data?.artifactEvent==='relicRule'&&x.data?.artifactId===id);

const tempo=runWith('relic.4',{enemyStats:{attack:1,physique:5000,defense:1000},duration:45});
const tempoLogs=relicLogs(tempo,'relic.4');
check(tempoLogs.length>=2&&tempoLogs.length<=4,'Thái Hư Châu repeatedly participates in real combat but stays bounded by its 12s cooldown');

const resonance=runWith('relic.5',{activeArtifacts:ART_LOADOUT,enemyStats:{attack:1,physique:5000,defense:1000},duration:45,seed:151002});
const resonanceLogs=relicLogs(resonance,'relic.5');
check(resonanceLogs.length>=2&&resonanceLogs.length<=7,'Vạn Pháp Đạo Chung receives real Pháp Bảo/triệu hồi hit traffic without runaway recursion');

const counter=runWith('relic.6',{playerStats:{attack:20,physique:2400,defense:250},enemyStats:{attack:3000,physique:4000,defense:500},duration:50,seed:151003});
const counterLogs=relicLogs(counter,'relic.6');
check(counter.finalState.P.hp<2400*20*.70,'Hỗn Độn Đỉnh pressure fixture genuinely crosses the authored 70% HP gate');
check(counterLogs.length>=1&&counterLogs.length<=6,'Hỗn Độn Đỉnh actually counter-triggers under incoming combat pressure and remains cooldown-bounded');

const dodge=runWith('relic.7',{playerStats:{attack:100,physique:1000,defense:600,accuracy:1},enemyStats:{attack:1,physique:5000,defense:1000,dodge:90,mobility:200},duration:60,seed:151004});
const dodgeLogs=relicLogs(dodge,'relic.7');
check(dodgeLogs.length>=1,'Càn Khôn Xích actually fires from a real target-dodge event');
check(dodge.logs.some(x=>x.type==='mark'&&String(x.message??'').includes('Phá Vọng')),'Càn Khôn Xích produces Phá Vọng in the shared CombatEngine mark system');

const lethal=runWith('relic.2',{playerStats:{attack:1,physique:10,defense:1},enemyStats:{attack:100000,physique:5000,defense:500},duration:12,seed:151005});
check(lethal.logs.some(x=>x.type==='trigger'&&x.actorId==='P'&&x.data?.artifactId==='relic.2'&&String(x.message??'').includes('Luân Hồi Kính')),'Luân Hồi Kính intercepts a real lethal hit through the shared CombatEngine anti-death path');
check((lethal.finalState?.P?.marks?.['__birth_antideath_used']??0)===1,'Luân Hồi Kính consumes the shared one-per-battle anti-death charge');

const source=fs.readFileSync('./dist/core/artifact-v88.js','utf8');
check(!source.includes('new CombatEngine')&&!source.includes('class RelicCombat'),'V151 does not create a second Chí Bảo combat engine/resolver');
const hud=fs.readFileSync('./modules/artifact-presentation-v88.js','utf8');
check(hud.includes('data-relic-v151-identity')&&hud.includes('ArtifactV151'),'Combat HUD/call-in exposes the active Chí Bảo identity instead of only its item name');

console.log(`\nV151 RELIC PRODUCTION: ${pass}/${pass} PASS`);
