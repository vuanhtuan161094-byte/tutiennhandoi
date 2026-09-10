import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildRegistry } from '../../dist/content/registry.js';
import { runCombatKernelV2 } from '../../dist/core/combat-kernel-v2.js';
import { buildBalanceEntityV120, thematicAttireSetIdV120 } from '../simulations/balance-lab-v120.js';
import {
  ARTIFACTS_V88,
  RELICS_V88,
  ARTIFACT_RESOURCE_SCHEMA_V150,
  ARTIFACT_RESOURCE_MODE_V150,
  artifactResourceSummaryV150,
  artifactComboSummaryV149,
  artifactCombatRuntimeV88,
  applyArtifactsV88ToEntity,
  artifactViewV88,
  relicViewV88,
} from '../../dist/core/artifact-v88.js';

let pass=0;
const check=(value,message)=>{assert.ok(value,message);pass++;console.log(`✓ ${message}`)};

const LOADOUT=[
  'artifact.thunder_guiding_mirror',
  'artifact.thunder_punishment_sword',
  'artifact.purple_mansion_lamp',
  'artifact.starfall_sword_box',
];
const item=()=>({owned:true,level:100,advance:4,specificFragments:0,artifactV149:{schema:'artifact.production.v149',baoHonRank:5}});
function stateFor(relicId){
  const extraItems={};
  if(relicId)extraItems[relicId]={owned:true,level:100,advance:4,specificFragments:0};
  return {
    schema:'collection-progression.v12316',
    genericFragments:{manual:0,artifact:0,pet:0,companion:0},
    items:Object.fromEntries(ARTIFACTS_V88.map(d=>[d.id,item()])),
    activeArtifactIds:[...LOADOUT],
    cave:{level:1,facilities:[{id:'artifact',level:10}]},
    economyV12325:{relicV88Migrated:true,extraItems,activeRelicId:relicId},
    artifactV88Migrated:true,
  };
}

const resource=artifactResourceSummaryV150();
check(resource.schema===ARTIFACT_RESOURCE_SCHEMA_V150&&resource.mode===ARTIFACT_RESOURCE_MODE_V150&&resource.baoQiEnabled===false,'V150 canonical resource contract disables the separate artifact resource');
check(ARTIFACTS_V88.length===12&&RELICS_V88.length===8,'V150 preserves the 12 Pháp Bảo / 8 Chí Bảo roster');
check(!JSON.stringify(ARTIFACTS_V88).includes('Bảo Khí'),'Player-facing Pháp Bảo definitions contain no obsolete Bảo Khí wording');
check(!JSON.stringify(RELICS_V88).includes('Bảo Khí'),'Player-facing Chí Bảo definitions contain no obsolete Bảo Khí wording');
check(ARTIFACTS_V88.every(d=>!('baoQiGainPct' in (d.passive??{}))&&!('costReductionPct' in (d.passive??{}))&&!('baoQiCost' in (d.skill??{}))&&!('baoQiGain' in (d.skill??{}))),'No production Pháp Bảo definition carries an activation-resource stat or cost');
check(RELICS_V88.every(d=>!('costReductionPct' in d)&&!('baoQiGainPct' in d)&&!('baoQiMaxBonus' in d)&&!('baoQiCost' in (d.trigger??{}))&&!('baoQiGain' in (d.trigger??{}))),'No production Chí Bảo definition carries an activation-resource stat or cost');

const state=stateFor(undefined);
const combo=artifactComboSummaryV149(state);
check(combo.sharedBaoQi===false&&combo.resourceMode===ARTIFACT_RESOURCE_MODE_V150&&combo.baoQiRemovedV150===true,'Cross-artifact combo is now governed by trigger/cooldown/state only');
const runtime=artifactCombatRuntimeV88(state);
check(runtime.baoQiMax===0&&runtime.baseGainPerAction===0&&runtime.baoQiGainPct===0&&runtime.baoQiCostReductionPct===0,'Compatibility resource scalars are hard-zeroed so the old engine branch is inert');
const artifactTriggers=runtime.triggers.filter(t=>t.runtimeV88?.kind==='artifactSkill');
check(artifactTriggers.length===LOADOUT.length,'Every equipped Pháp Bảo still receives one live shared-engine trigger');
check(artifactTriggers.every(t=>t.runtimeV88?.resourceMode===ARTIFACT_RESOURCE_MODE_V150&&t.runtimeV88?.baoQiRemovedV150===true&&!('baoQiCost' in t.runtimeV88)&&!('baoQiGain' in t.runtimeV88)),'Live Pháp Kỹ triggers have no resource gate or resource refund');
check(artifactTriggers.some(t=>t.runtimeV88?.itemId==='artifact.thunder_punishment_sword'&&t.effects.some(e=>e.type==='consumeMarkDamage'&&e.mark==='Lôi Ấn')),'Lôi Ấn combo survives resource removal');

const redesigned=[];
for(const relicId of ['relic.4','relic.5','relic.6']){
  const s=stateFor(relicId),r=artifactCombatRuntimeV88(s);
  const trigger=r.triggers.find(t=>t.runtimeV88?.kind==='relicRule'&&t.runtimeV88.itemId===relicId);
  check(Boolean(trigger)&&trigger.effects.length>0&&trigger.runtimeV88.resourceMode===ARTIFACT_RESOURCE_MODE_V150,`${relicId} has a real replacement combat rule instead of a dead resource passive`);
  redesigned.push({id:relicId,event:trigger.event,ability:trigger.runtimeV88.abilityName});
}
check(new Set(redesigned.map(x=>x.ability)).size===3,'The three former resource-only Chí Bảo now have distinct authored combat rules');

const base={id:'P',name:'V150 Tester',tags:[],stats:{attack:1000,physique:1000,defense:1000},triggers:[],skillIds:[],aiProfile:{name:'idle',rules:[]}};
const entity=applyArtifactsV88ToEntity(base,state);
check(entity.combatBuildV117?.artifactV88?.resourceV150?.baoQiEnabled===false&&entity.combatBuildV117.artifactV88.baseGainPerAction===0,'CombatEntity carries the resource-free V150 contract into the shared CombatEngine');
check(entity.triggers.filter(t=>t.runtimeV88?.kind==='artifactSkill').length===LOADOUT.length,'Entity composition does not duplicate artifact triggers after V150 normalization');
const thunderView=artifactViewV88(state,'artifact.thunder_punishment_sword');
check(thunderView?.resourceV150?.baoQiEnabled===false&&!('baoQiCost' in thunderView.skill)&&!String(thunderView.skill.description).includes('Bảo Khí'),'Artifact detail view exposes cooldown/trigger behavior with no removed-resource cost');
const relicView=relicViewV88(stateFor('relic.4'),'relic.4');
check(relicView?.resourceV150?.baoQiEnabled===false&&relicView?.ruleName==='Thái Hư Xuyên Giới','Chí Bảo detail view exposes the replacement V150 combat rule');

const registry=buildRegistry();
const IDLE='skill.v150.artifact.no-resource.idle';
if(!registry.skills.has(IDLE))registry.registerSkill({id:IDLE,name:'Mộc Nhân Tĩnh Tọa',description:'Không gây sát thương.',tags:['BalanceSimV150'],spiritCost:0,cooldown:0,castTime:0,recoveryTime:1,effects:[]});
const spec={id:'sword-metal',label:'Kiếm–Kim',dao:'sword',root:'metal',totalPotential:1000,potential:{power:.65,body:.20,defense:.15},daoHanh:70,attirePieces:4,grade:'immortal'};
spec.attireSetId=thematicAttireSetIdV120(spec.dao,spec.root);
let player=buildBalanceEntityV120(spec);
player=applyArtifactsV88ToEntity({...player,id:'P',name:'V150 Player'},state);
const axis=1000;
const target={id:'E',combatModel:'locked-v1',name:'Mộc Nhân V150',tags:['BalanceSimV150'],stats:{maxHp:axis*20*1500,physique:axis*1500,maxSpirit:1000,spiritStandard:1000,spiritRegenStandardPctPerSecond:0,attack:1,defense:axis,mobility:1,accuracy:1,critChancePct:0,critPowerPerLayer:.5,heartChancePct:0,dodgeChancePct:0,controlPower:1,resolve:100,actionSpeed:1,elementalAffinities:{},elementalResistancesPct:{},dominantElement:'Earth'},skillIds:[IDLE],aiProfile:{name:'idle',rules:[{skillId:IDLE,priority:1,conditions:[{type:'always'}]}]}};
const battle=runCombatKernelV2({registry,seed:150001,entities:[player,target],maxDuration:60,mode:'simulation'}).battle;
const removedResourceLogs=battle.logs.filter(x=>x.type==='resource'&&x.data?.artifactRuntime==='artifact.v88'&&x.data?.artifactEvent==='baoQi');
const liveArtifactLogs=battle.logs.filter(x=>x.type==='trigger'&&x.actorId==='P'&&x.data?.artifactRuntime==='artifact.v88'&&x.data?.artifactEvent==='artifactSkill');
const thunderLogs=liveArtifactLogs.filter(x=>x.data?.artifactId==='artifact.thunder_punishment_sword');
check(removedResourceLogs.length===0,'60s real CombatKernel run produces no removed-resource accumulation events');
check(liveArtifactLogs.length>=4&&liveArtifactLogs.length<80,'Resource-free Pháp Bảo proc repeatedly but remain cooldown-bounded in a real 60s fight');
check(thunderLogs.length>=1,'High-impact Lôi Phạt Kiếm can fire without waiting for a hidden resource threshold');

const hud=fs.readFileSync('./modules/artifact-presentation-v88.js','utf8');
check(!hud.includes('Bảo Khí')&&!hud.includes('data-artifact-v88-baoqi')&&hud.includes('Trigger + hồi chiêu'),'Combat presentation removes the obsolete resource bar and explains the new activation model');

console.log(`\nV150 ARTIFACT NO-BAO-QI: ${pass}/${pass} PASS`);
