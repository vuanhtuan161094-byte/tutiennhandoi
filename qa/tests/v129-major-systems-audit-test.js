import assert from 'node:assert/strict';
import { SeededRng } from '../../dist/core/rng.js';
import { rollBirthOriginBundle, createBloodlineRoll, createPhysiqueRoll, recomputeBloodlineEffects, bloodlineDefinition, bloodlineIds, physiqueDefinition, physiqueIds } from '../../dist/core/birth-origins-v101.js';
import { writeBirthModifiersToOrigins, applyBirthCombatOrigins } from '../../dist/core/birth-randomness.js';
import { createBuildFoundationV113, DAO_NATURE_TIER_IDS_V125 } from '../../dist/core/build-foundation-v113.js';
import { DAO_NATURE_BRANCHES_V125, resolveDaoNatureBonusesV125 } from '../../dist/core/specialization-skill-progression-v125.js';
import { battleDaoV2Passives } from '../../dist/content/battle-dao-v2-catalog.js';
import { ensureSkillHeartProgressionV12317, resolveHeartMethodStatsV12317, HEART_METHOD_STATIC_STAT_SCALE_V129 } from '../../dist/core/skill-heart-method-v12317.js';
import { reincarnationTreeNodesV136, nodeModifierValue } from '../../dist/core/reincarnation-progression-v1102.js';
import { applyReincarnationCombatTalents } from '../../dist/core/reincarnation-talents.js';

let passed=0;
function test(name,fn){fn();passed++;console.log(`✓ ${name}`)}
const baseEntity={id:'v129.audit',name:'V129 Audit',tags:[],triggers:[],stats:{attack:100,defense:100,physique:100,maxHp:2000,maxSpirit:1000,accuracy:100,mobility:100,actionSpeed:1,critChancePct:0,critDamagePct:150,armorPenPct:0,damageReductionPct:0,dodgeChancePct:0}};
function originEntity({bloodlineId,physiqueId}){
  const bundle=rollBirthOriginBundle(new SeededRng(1292901),9,0);
  if(bloodlineId){let b=createBloodlineRoll(bloodlineId,'NATIVE','Phá');b.purity=100;b=recomputeBloodlineEffects(b);bundle.bloodline=b;}
  if(physiqueId) bundle.physique=createPhysiqueRoll(physiqueId,'Viên Mãn');
  const origins={}; writeBirthModifiersToOrigins(origins,{originsV101:bundle,birthTalents:[]});
  return {entity:applyBirthCombatOrigins(baseEntity,origins),origins,bundle};
}

test('V129 Huyết Mạch max remains a major build-defining system with real runtime consumers',()=>{
  const defs=bloodlineIds().map(bloodlineDefinition).filter(Boolean);
  assert(defs.length>=30,'expected broad bloodline catalog');
  const breakDefs=defs.filter(x=>x.band==='BREAK');
  assert(breakDefs.length>=6,'expected authored BREAK bloodlines');
  assert(breakDefs.every(x=>Math.max(...Object.values(x.effects).map(Number))>=30),'every BREAK bloodline needs a clearly major endpoint');
  const war=originEntity({bloodlineId:'bloodline.v101.primordial_wargod'}).entity;
  assert(war.stats.attack>=154.9 && war.stats.armorPenPct>=19.9 && war.stats.critDamagePct>=179.9,'Primordial Wargod max stats must materially alter offense');
  assert(war.triggers.some(x=>x.id.includes('Thái Sơ Sát Thần')),'BREAK bloodline identity trigger must reach CombatKernel entity');
  const tank=originEntity({bloodlineId:'bloodline.v101.tribulation_undying'}).entity;
  assert(tank.stats.maxHp>=3399 && tank.stats.defense>=124.9 && tank.stats.damageReductionPct>=11.9,'Undying bloodline max must materially alter survival');
  assert(tank.triggers.some(x=>x.id.includes('Vạn Kiếp Bất Diệt')),'tank bloodline trigger must be live');
});

test('V129 Thể Chất max remains major and identity-weighted instead of a cosmetic few percent',()=>{
  const defs=physiqueIds().map(physiqueDefinition).filter(Boolean), breaks=defs.filter(x=>x.band==='BREAK');
  assert(breaks.length>=3,'expected BREAK physiques');
  assert(breaks.every(x=>Object.values(x.effects).map(Number).reduce((a,b)=>a+Math.max(0,b),0)>=70),'BREAK physique total authored budget must remain substantial');
  const tank=originEntity({physiqueId:'physique.reincarnation_undying'}).entity;
  assert(tank.stats.maxHp>=2799 && tank.stats.defense>=125.9 && tank.stats.damageReductionPct>=8.9,'Reincarnation Undying Body max must be visibly tank-defining');
  assert(tank.tags.includes('BirthTrait:ReincarnationBodyLastStand'),'max identity capstone must reach runtime tags');
  const offense=originEntity({physiqueId:'physique.devour_dao'}).entity;
  assert(offense.stats.attack>=131.9 && offense.stats.maxHp>=2439 && offense.stats.armorPenPct>=11.9,'Devour Dao Body max must be a real bruiser package');
  assert(offense.triggers.some(x=>x.id.includes('Thôn Thiên Phệ Đạo')),'offensive physique mechanic must reach runtime');
});

test('V129 Đạo Tính full branches are major progression and preserve distinct offense/defense/hybrid identities',()=>{
  const endpoints=[];
  for(const [nature,branches] of Object.entries(DAO_NATURE_BRANCHES_V125)) for(const branch of branches){
    const f=createBuildFoundationV113('root.fire'),p=f.progressionV125;p.daoNatureId=nature;p.daoNatureCommitted=true;
    for(const tier of DAO_NATURE_TIER_IDS_V125){const t=p.daoNatureTiers[tier];t.earnedPoints=20;t.allocatedByBranch[branch]=20;t.majorBranchChoice=branch;}
    const b=resolveDaoNatureBonusesV125(f); endpoints.push({nature,branch,...b});
    assert(Object.values(b).every(Number.isFinite),`${branch} endpoint must be finite`);
    assert(Math.max(b.attackPct,b.maxHpPct,b.defensePct)>=60,`${branch} must have a major primary-axis endpoint`);
  }
  assert(endpoints.find(x=>x.branch==='demonic.demon_art').attackPct>110,'Ma Công must remain apex offense');
  assert(endpoints.find(x=>x.branch==='orthodox.guard').defensePct>160,'Hộ Đạo must remain apex defense');
  const hybrid=endpoints.find(x=>x.branch==='rogue.myriad_art');
  assert(hybrid.attackPct>55&&hybrid.maxHpPct>55&&hybrid.defensePct>60,'Vạn Pháp must remain a true hybrid endpoint');
});

test('V129 Tâm Pháp keeps 100% main/secondary passive ownership while generic core-stat package stays bounded but meaningful',()=>{
  assert.equal(HEART_METHOD_STATIC_STAT_SCALE_V129,0.25);
  const daos=['sword','fist','body','spell','poison','artifact','formation','mind'];
  const rows=[];
  for(const dao of daos){
    const f=createBuildFoundationV113('root.fire');f.battleDao.mainDaoId=dao;f.battleDao.committed=true;f.progressionV125.daoNatureCommitted=true;
    const ids=battleDaoV2Passives(dao).map(x=>x.id);f.learnedDaoPassiveIdsV118=[...ids];const p=ensureSkillHeartProgressionV12317(f.progressionV125);
    for(const id of ids){p.passiveLevels[id]=20;p.heartMethodGradesV12317[id]='breaker';}
    const b=resolveHeartMethodStatsV12317(f);rows.push({dao,...b});
    assert(Math.max(b.attackPct,b.physiquePct,b.defensePct)>=23,`${dao} max 8-passive static package should still feel meaningful`);
    assert(Math.max(b.attackPct,b.physiquePct,b.defensePct)<=40,`${dao} generic static package must not replace authored passive mechanics`);
  }
  const f=createBuildFoundationV113('root.fire');f.battleDao.mainDaoId='sword';f.battleDao.secondaryDaoId='body';f.battleDao.committed=true;f.progressionV125.daoNatureCommitted=true;
  const ids=[...battleDaoV2Passives('sword'),...battleDaoV2Passives('body')].map(x=>x.id);f.learnedDaoPassiveIdsV118=ids;const p=ensureSkillHeartProgressionV12317(f.progressionV125);
  for(const id of ids){p.passiveLevels[id]=20;p.heartMethodGradesV12317[id]='breaker';}
  const both=resolveHeartMethodStatsV12317(f), sword=rows.find(x=>x.dao==='sword'), body=rows.find(x=>x.dao==='body');
  assert(Math.abs(both.attackPct-(sword.attackPct+body.attackPct))<1e-9 && Math.abs(both.physiquePct-(sword.physiquePct+body.physiquePct))<1e-9,'secondary Tâm Pháp generic package must resolve at full authored strength, not 60%');
});

test('Luân Hồi Tu Luyện R3 has 12 independent 20-rank nodes with the approved ownership and caps',()=>{
  const cultivation=reincarnationTreeNodesV136.filter(x=>x.treeId==='cultivation');
  const manual=reincarnationTreeNodesV136.filter(x=>x.treeId==='manual');
  assert.equal(cultivation.length,12); assert.equal(manual.length,13);
  assert(cultivation.every(x=>x.maxRank===20)); assert(cultivation.every(x=>(x.prerequisites??[]).length===0),'Tu Luyện nodes must be freely learnable');
  const max={ranks:Object.fromEntries(reincarnationTreeNodesV136.map(x=>[x.id,x.maxRank]))};
  assert.equal(nodeModifierValue(max,'cultivation.baseGainPct'),25);
  assert.equal(nodeModifierValue(max,'cultivation.majorBreakthroughRequirementReductionPct'),5);
  assert.equal(nodeModifierValue(max,'cultivation.skipOldStageChancePct'),5);
  assert.equal(nodeModifierValue(max,'cultivation.newRecordGainPct'),20);
  assert.equal(nodeModifierValue(max,'cultivation.perfectStageGainPct'),40);
  for(const retired of ['cultivation.retreatGainPct','cultivation.protectorEffectPct','cultivation.tribulationSuccessPct','cultivation.cultivationPillGainPct','cultivation.lifePotentialGainPct','cultivation.permanentPotentialBonusPct','cultivation.lifespanPct','cultivation.daoDecayRateReductionPct','cultivation.offlineRewardPct','cultivation.offlineCapHoursBonus','cultivation.injuryRecoveryPct','cultivation.injuryGainReductionPct','cultivation.reincarnationEnergyCostReductionPct']) assert.equal(nodeModifierValue(max,retired),0,retired+' must be retired from Tu Luyện tree');
});

test('V129 Luân Hồi combat memories use real CombatEntity consumers without hidden global total-damage scalar',()=>{
  const origins={'talent.combat.active_skill':5,'talent.combat.flow':5,'major.war_immortal':1};
  const out=applyReincarnationCombatTalents(baseEntity,origins);
  assert(out.stats.actionSpeed>baseEntity.stats.actionSpeed,'combat flow must alter real action speed');
  const proc=out.triggers.find(x=>x.id.includes('combat.active_skill'));
  assert(proc && proc.effects[0].type==='damage' && proc.effects[0].coefficient>0,'active-skill memory must be a real proc');
  assert.equal(out.stats.attack,baseEntity.stats.attack,'reincarnation combat talent must not smuggle a generic attack/total-damage multiplier');
});

console.log(`\nV129 MAJOR SYSTEMS AUDIT — ${passed}/${passed} PASS`);
