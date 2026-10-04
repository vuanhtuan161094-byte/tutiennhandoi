import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {buildRegistry} from '../../dist/content/registry.js';
import {battleDaoV2Catalog} from '../../dist/content/battle-dao-v2-catalog.js';
import {battleDaoAutoRotationV127} from '../../dist/core/battle-dao-rotation-v127.js';
import {runCombatKernelV3} from '../../dist/core/combat-kernel-v2.js';
import {CombatEngine} from '../../dist/core/combat.js';
import {createPoisonP4Player,createPoisonP4Target,POISON_P4_SEEDS} from './poison-dao-p4-benchmark.js';
export const FORMATION_P4_SEEDS=POISON_P4_SEEDS;
export function formationSourceDigest(){const h=createHash('sha256');for(const p of ['dist/content/formation-dao-v2.js','dist/content/battle-dao-skill-pack-v118.js','dist/core/battle-dao-v2-contract.js','dist/core/combat.js','dist/core/battle-dao-v2-runtime-base.js','dist/core/battle-dao-combat-v118.js','dist/core/ai.js','dist/core/battle-dao-rotation-v127.js','dist/core/battle-dao-skill-growth-v126.js','qa/benchmarks/formation-dao-p4-benchmark.js'])h.update(p+'\n'+fs.readFileSync(new URL('../../'+p,import.meta.url),'utf8').replaceAll('\r\n','\n'));return h.digest('hex');}
export const FORMATION_P4_PROFILES=[
 {id:'full',label:'Toàn Kích',allocation:{power:145,body:25,agility:15,spirit:55,sense:60},actives:['deploy','nourish','fortify','seal','full_activate'],band:[100,100]},
 {id:'nourish',label:'Dưỡng Trận',allocation:{power:95,body:25,agility:25,spirit:85,sense:70},actives:['deploy','nourish','fortify','seal','small_activate'],band:[90,97]},
 {id:'guard',label:'Hộ Trận',allocation:{power:65,body:100,agility:20,spirit:60,sense:55},actives:['deploy','nourish','fortify','convert','small_activate'],band:[82,90]},
];
export function createFormationP4Player(p){
 const base=createPoisonP4Player({...p,activeSkillIds:[]}),cat=battleDaoV2Catalog('formation');
 const all=[cat.basicSkillId,...cat.tree.map(x=>x.activeSkillId),cat.ultimateSkillId];
 base.id='qa.formation.'+p.id;base.name=p.label;base.tags=['Human','Cultivator','Formation','Benchmark'];
 base.skillIds=[cat.basicSkillId,...p.actives.map(x=>'skill.dao.formation.'+x),cat.ultimateSkillId];
 base.aiProfile=battleDaoAutoRotationV127('formation',base.skillIds);
 Object.assign(base.combatBuildV117,{mainDaoId:'formation',learnedDaoPassiveIdsV118:cat.passives.map(x=>x.id),passiveLevelsV125:Object.fromEntries(cat.passives.map(x=>[x.id,20])),skillPracticeTierV125:Object.fromEntries(all.map(x=>[x,1000]))});
 return base;
}
export const createFormationP4Target=createPoisonP4Target;
const sum=xs=>xs.reduce((a,b)=>a+b,0),mean=xs=>sum(xs)/xs.length;
export function runFormationP4Benchmark({seeds=FORMATION_P4_SEEDS,duration=180}={}){
 const registry=buildRegistry(),runs=[];
 for(const p of FORMATION_P4_PROFILES)for(const seed of seeds){
  const player=createFormationP4Player(p),target=createFormationP4Target();
  const exposure={deployedSeconds:0,time70:0,time100:0,integrityIntegral:0,minimumIntegrity:100,stackSeconds:0,stackCapSeconds:0};
  const original=CombatEngine.prototype.updateContinuousState;
  CombatEngine.prototype.updateContinuousState=function(e,now){
   const dt=Math.max(0,now-e.lastContinuousUpdateAt),c=e.battleDaoStateV2?.formation?.core,st=e.battleDaoStateV2?.formation?.stack;
   if(e.id===player.id&&dt>0&&c?.deployed){exposure.deployedSeconds+=dt;exposure.integrityIntegral+=dt*c.integrity;exposure.minimumIntegrity=Math.min(exposure.minimumIntegrity,c.integrity);if(c.nurture>=70)exposure.time70+=dt;if(c.nurture===100)exposure.time100+=dt;if(st?.stacks>0)exposure.stackSeconds+=dt;if(st?.stacks>=st?.cap)exposure.stackCapSeconds+=dt;}
   return original.call(this,e,now);
  };
  let kernel;try{kernel=runCombatKernelV3({registry,seed,entities:[player,target],maxDuration:duration,mode:'simulation'});}finally{CombatEngine.prototype.updateContinuousState=original;}
  const logs=kernel.battle.logs.filter(x=>x.actorId===player.id),tx=logs.filter(x=>x.data?.formationTransaction).map(x=>x.data.formationTransaction),count=k=>tx.filter(x=>x.kind===k).length;
  const damage=kernel.combatResult.summary.damageByActor[player.id]??0;
  const starts=logs.filter(x=>x.type==='channel'&&x.skillId==='skill.dao.formation.nourish'&&x.data?.hits),unfinished=starts.filter(x=>x.time+x.data.duration>kernel.combatResult.duration);
  const r={profileId:p.id,seed,duration:kernel.combatResult.duration,dps:damage/kernel.combatResult.duration,damage,casts:kernel.combatResult.summary.castCountsByActor[player.id],...exposure,
   averageIntegrity:exposure.deployedSeconds?exposure.integrityIntegral/exposure.deployedSeconds:0,deploys:count('deploy'),small:count('small_activate'),full:count('full_activate'),grandFull:tx.filter(x=>x.kind==='full_activate'&&x.grand).length,grandEntries:tx.filter(x=>x.before.nurture<100&&x.after.nurture===100).length,
   fortify:count('fortify'),convert:count('convert'),intentionalBreak:count('break'),collapses:tx.filter(x=>x.before.deployed&&!x.after.deployed&&x.kind!=='break').length,nourishCompleted:count('nourish'),ultimate:count('ultimate'),ultimateStates:tx.filter(x=>x.kind==='ultimate').map(x=>x.before.nurture),
   channelStarted:starts.length,channelUnfinished:unfinished.length,channelInterrupted:Math.max(0,starts.length-count('nourish')-unfinished.length),damageBySkill:kernel.combatResult.summary.damageBySkillByActor[player.id],
   nurtureGenerated:sum(tx.map(x=>x.nurtureGenerated)),nurtureSpent:sum(tx.map(x=>x.nurtureSpent)),nurtureWaste:sum(tx.map(x=>x.nurtureWaste)),integrityGenerated:sum(tx.map(x=>x.integrityGenerated)),integritySpent:sum(tx.map(x=>x.integritySpent)),cnRecovered:sum(tx.map(x=>x.recovered)),cnSpent:sum(logs.map(x=>x.data?.spiritCost??0)),diverseRoots:tx.filter((x,i)=>i===0||tx[i-1].kind!==x.kind).length,duplicates:tx.length-new Set(tx.map(x=>x.rootActionId)).size};
  r.identityValid=r.duration===duration&&r.deploys>0&&r.nourishCompleted>0&&r.nurtureSpent>0&&r.duplicates===0&&(p.id!=='full'||r.grandFull>0&&r.grandEntries>0)&&(p.id!=='nourish'||r.small>0)&&(p.id!=='guard'||r.fortify>0&&r.convert>0);
  runs.push(r);
 }
 const aggregates=FORMATION_P4_PROFILES.map(p=>{const rows=runs.filter(x=>x.profileId===p.id),out={id:p.id,label:p.label,validRuns:rows.filter(x=>x.identityValid).length,dpsMin:Math.min(...rows.map(x=>x.dps)),dpsMax:Math.max(...rows.map(x=>x.dps))};for(const k of Object.keys(rows[0]))if(typeof rows[0][k]==='number'&&k!=='seed')out[k]=mean(rows.map(x=>x[k]));return out;});
 aggregates.forEach((r,i)=>{r.relativeDps=r.dps/aggregates[0].dps*100;r.withinBand=r.relativeDps>=FORMATION_P4_PROFILES[i].band[0]&&r.relativeDps<=FORMATION_P4_PROFILES[i].band[1];});
 const [full,nourish,guard]=aggregates;
 const comparativeIdentity=nourish.small>full.full&&nourish.nurtureGenerated>=full.nurtureGenerated*.95&&guard.averageIntegrity>=Math.max(full.averageIntegrity,nourish.averageIntegrity)&&guard.minimumIntegrity>=Math.max(full.minimumIntegrity,nourish.minimumIntegrity)&&guard.convert>Math.max(full.convert,nourish.convert)&&guard.fortify>=Math.max(full.fortify,nourish.fortify);
 return{schema:'formation-p4.v1',sourceDigest:formationSourceDigest(),seeds:[...seeds],duration,comparativeIdentity,identityValid:runs.every(r=>r.identityValid)&&comparativeIdentity,passed:runs.every(r=>r.identityValid)&&comparativeIdentity&&aggregates.every(x=>x.withinBand),aggregates,runs};
}
if(process.argv[1]?.endsWith('formation-dao-p4-benchmark.js')){const result=runFormationP4Benchmark(),out=process.argv.find(x=>x.startsWith('--out='))?.slice(6)??'qa/output/formation-p4.json';fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({passed:result.passed,comparativeIdentity:result.comparativeIdentity,aggregates:result.aggregates},null,2));if(!result.passed)process.exitCode=1;}
