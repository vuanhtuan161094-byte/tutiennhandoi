import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {buildRegistry} from '../../dist/content/registry.js';
import {battleDaoV2Catalog} from '../../dist/content/battle-dao-v2-catalog.js';
import {battleDaoAutoRotationV127} from '../../dist/core/battle-dao-rotation-v127.js';
import {runCombatKernelV3} from '../../dist/core/combat-kernel-v2.js';
import {CombatEngine} from '../../dist/core/combat.js';
import {artifactMerged} from '../../dist/core/battle-dao-v2-contract.js';
import {createPoisonP4Player,createPoisonP4Target,POISON_P4_SEEDS} from './poison-dao-p4-benchmark.js';
export const ARTIFACT_P4_SEEDS=POISON_P4_SEEDS;
export const ARTIFACT_P4_PROFILES=[
 {id:'merge',label:'Hợp Khí',allocation:{power:155,body:25,agility:15,spirit:35,sense:70},actives:['deploy','split','strike','merge','suppress'],band:[100,100]},
 {id:'triple',label:'Tam Ngự',allocation:{power:110,body:25,agility:15,spirit:70,sense:80},actives:['deploy','split','strike','sync','suppress'],band:[92,98]},
 {id:'guard',label:'Hộ Chủ',allocation:{power:60,body:95,agility:20,spirit:70,sense:55},actives:['deploy','split','guard','recall','sync'],band:[82,90]},
];
export function createArtifactP4Player(p){
 const base=createPoisonP4Player({...p,activeSkillIds:[]}),cat=battleDaoV2Catalog('artifact'),all=[cat.basicSkillId,...cat.tree.map(x=>x.activeSkillId),cat.ultimateSkillId];
 base.id='qa.artifact.'+p.id;base.name=p.label;base.tags=['Human','Cultivator','Artifact','Benchmark'];base.skillIds=[cat.basicSkillId,...p.actives.map(x=>'skill.dao.artifact.'+x),cat.ultimateSkillId];base.aiProfile=battleDaoAutoRotationV127('artifact',base.skillIds);
 Object.assign(base.combatBuildV117,{mainDaoId:'artifact',learnedDaoPassiveIdsV118:cat.passives.map(x=>x.id),passiveLevelsV125:Object.fromEntries(cat.passives.map(x=>[x.id,20])),skillPracticeTierV125:Object.fromEntries(all.map(x=>[x,1000]))});return base;
}
export function createArtifactP4Target(){const t=createPoisonP4Target();t.id='qa.artifact.target';t.name='Ngự Khí Chiến Khôi';t.stats.attack=45;t.stats.primaryStatsV5.power=45;return t;}
export function artifactSourceDigest(){const h=createHash('sha256');for(const p of ['dist/content/artifact-dao-v2.js','dist/content/battle-dao-skill-pack-v118.js','dist/core/battle-dao-v2-contract.js','dist/core/combat.js','dist/core/battle-dao-v2-runtime-base.js','dist/core/battle-dao-combat-v118.js','dist/core/ai.js','dist/core/battle-dao-rotation-v127.js','dist/core/battle-dao-skill-growth-v126.js','qa/benchmarks/artifact-dao-p4-benchmark.js'])h.update(p+'\n'+fs.readFileSync(new URL('../../'+p,import.meta.url),'utf8').replaceAll('\r\n','\n'));return h.digest('hex');}
const sum=xs=>xs.reduce((a,b)=>a+b,0),mean=xs=>xs.length?sum(xs)/xs.length:0;
export function runArtifactP4Benchmark({seeds=ARTIFACT_P4_SEEDS,duration=180}={}){
 const registry=buildRegistry(),runs=[];
 for(const p of ARTIFACT_P4_PROFILES)for(const seed of seeds){
  const player=createArtifactP4Player(p),target=createArtifactP4Target(),observed=new WeakSet(),exposure={source1Seconds:0,source2Seconds:0,source3Seconds:0,mergeSeconds:0,mergeCommandDamage:0,shieldGenerated:0,shieldSeconds:0,stackSeconds:0,stackCapSeconds:0,externalCollectionInteractions:0};
  const continuous=CombatEngine.prototype.updateContinuousState,damage=CombatEngine.prototype.applyDamage,shield=CombatEngine.prototype.resolveEffectShieldV141;
  CombatEngine.prototype.updateContinuousState=function(e,now){
   if(e.id===player.id&&!observed.has(e)){observed.add(e);for(const key of ['artifactCollection','collectionArtifacts','relicRuntime'])Object.defineProperty(e,key,{configurable:true,get(){exposure.externalCollectionInteractions++;return undefined;},set(){exposure.externalCollectionInteractions++;}});}
   const from=e.lastContinuousUpdateAt,dt=Math.max(0,now-from),c=e.battleDaoStateV2?.artifact?.core,st=e.battleDaoStateV2?.artifact?.stack;
   if(e.id===player.id&&dt>0&&c){exposure['source'+c.artifactSources+'Seconds']+=dt;exposure.mergeSeconds+=Math.max(0,Math.min(now,c.mergeUntil??0)-from);if(st?.stacks>0)exposure.stackSeconds+=dt;if(st?.stacks>=st?.cap)exposure.stackCapSeconds+=dt;const end=Math.max(0,...e.shields.filter(x=>x.capacity>0).map(x=>x.expiresAt));exposure.shieldSeconds+=Math.max(0,Math.min(now,end)-from);}return continuous.call(this,e,now);};
  CombatEngine.prototype.applyDamage=function(e,t,ctx,now){const window=e.id===player.id&&artifactMerged(e,now)&&ctx.sourceTag!=='ProcHit'&&['basic','strike','sync','suppress','ultimate'].some(k=>ctx.skillId==='skill.dao.artifact.'+k),out=damage.call(this,e,t,ctx,now);if(window)exposure.mergeCommandDamage+=out.hpDamage;return out;};
  CombatEngine.prototype.resolveEffectShieldV141=function(e,t,...args){const before=e.shields.length,out=shield.call(this,e,t,...args);if(e.id===player.id)exposure.shieldGenerated+=sum(e.shields.slice(before).map(x=>x.capacity));return out;};
  let kernel;try{kernel=runCombatKernelV3({registry,seed,entities:[player,target],maxDuration:duration,mode:'simulation'});}finally{CombatEngine.prototype.updateContinuousState=continuous;CombatEngine.prototype.applyDamage=damage;CombatEngine.prototype.resolveEffectShieldV141=shield;}
  const logs=kernel.battle.logs.filter(x=>x.actorId===player.id),tx=logs.filter(x=>x.data?.artifactTransaction).map(x=>x.data.artifactTransaction),scheduled=logs.filter(x=>x.data?.artifactFollowupScheduled),resolved=logs.filter(x=>x.data?.artifactFollowupResolved),count=k=>tx.filter(x=>x.kind===k).length,commands=tx.filter(x=>['basic','strike','sync','suppress','ultimate'].includes(x.kind));
  const total=kernel.combatResult.summary.damageByActor[player.id]??0,followDamage=sum(resolved.map(x=>x.data.artifactFollowupDamage));
  const r={profileId:p.id,seed,duration:kernel.combatResult.duration,damage:total,dps:total/kernel.combatResult.duration,...exposure,damageBySkill:kernel.combatResult.summary.damageBySkillByActor[player.id],casts:kernel.combatResult.summary.castCountsByActor[player.id],
   averageSources:(exposure.source1Seconds+2*exposure.source2Seconds+3*exposure.source3Seconds)/kernel.combatResult.duration,deploy:count('deploy'),split:count('split'),guard:count('guard'),recall:count('recall'),recalledSources:sum(tx.map(x=>x.recalled)),cnRecovered:sum(tx.map(x=>x.cnRecovered)),cnSpent:sum(logs.map(x=>x.data?.spiritCost??0)),merge:count('merge'),averageMergedFrom:mean(tx.filter(x=>x.kind==='merge').map(x=>x.mergedFrom)),mergeCommands:commands.filter(x=>x.window).length,multiCommands:commands.filter(x=>x.sourcesBefore>1).length,
   followupsScheduled:scheduled.length,followupsResolved:resolved.length,followupsSuppressed:logs.filter(x=>x.data?.artifactFollowupSuppressed).length,followupDamage:followDamage,followupDamagePct:total?followDamage/total*100:0,mergeDamagePct:total?exposure.mergeCommandDamage/total*100:0,duplicateTransactions:tx.length-new Set(tx.map(x=>x.rootActionId)).size,duplicateFollowups:scheduled.length-new Set(scheduled.map(x=>x.data.artifactFollowup.rootActionId)).size,recursiveFollowups:scheduled.filter(x=>x.data.artifactFollowup.procDepth!==1||x.data.artifactFollowup.followUpBudget!==0).length,
   sync:count('sync'),suppress:count('suppress'),ultimate:count('ultimate'),ultimateEffectiveCounts:tx.filter(x=>x.kind==='ultimate').map(x=>x.effectiveCount)};
  r.identityValid=r.duration===duration&&r.deploy>0&&r.split>0&&r.ultimate>0&&r.duplicateTransactions===0&&r.duplicateFollowups===0&&r.recursiveFollowups===0&&(p.id!=='merge'||r.merge>0&&r.averageMergedFrom>2&&r.mergeCommands>0&&r.mergeDamagePct>=15)&&(p.id!=='triple'||r.merge===0&&r.source3Seconds>100&&r.followupsResolved>0&&r.sync>0)&&(p.id!=='guard'||r.guard>0&&r.recall>0&&r.cnRecovered>0&&r.shieldGenerated>0&&r.deploy+r.split>2);runs.push(r);
 }
 const aggregates=ARTIFACT_P4_PROFILES.map(p=>{const rows=runs.filter(x=>x.profileId===p.id),out={id:p.id,label:p.label,validRuns:rows.filter(x=>x.identityValid).length,dpsMin:Math.min(...rows.map(x=>x.dps)),dpsMax:Math.max(...rows.map(x=>x.dps))};for(const k of Object.keys(rows[0]))if(typeof rows[0][k]==='number'&&k!=='seed')out[k]=mean(rows.map(x=>x[k]));return out;});
 aggregates.forEach((r,i)=>{r.relativeDps=r.dps/aggregates[0].dps*100;r.withinBand=r.relativeDps>=ARTIFACT_P4_PROFILES[i].band[0]&&r.relativeDps<=ARTIFACT_P4_PROFILES[i].band[1];});
 const[m,t,g]=aggregates,comparativeIdentity=t.source3Seconds>Math.max(m.source3Seconds,g.source3Seconds)&&t.followupsResolved>Math.max(m.followupsResolved,g.followupsResolved)&&t.followupDamage>Math.max(m.followupDamage,g.followupDamage)&&t.multiCommands>Math.max(m.multiCommands,g.multiCommands);
 return{schema:'artifact-p4.v1',sourceDigest:artifactSourceDigest(),seeds:[...seeds],duration,comparativeIdentity,identityValid:runs.every(x=>x.identityValid)&&comparativeIdentity,passed:runs.every(x=>x.identityValid)&&comparativeIdentity&&aggregates.every(x=>x.withinBand),aggregates,runs};
}
if(process.argv[1]?.endsWith('artifact-dao-p4-benchmark.js')){const r=runArtifactP4Benchmark(),out=process.argv.find(x=>x.startsWith('--out='))?.slice(6)??'qa/output/artifact-p4.json';fs.writeFileSync(out,JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify({passed:r.passed,identityValid:r.identityValid,aggregates:r.aggregates},null,2));if(!r.passed)process.exitCode=1;}
