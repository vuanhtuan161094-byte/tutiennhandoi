import assert from 'node:assert/strict';
import fs from 'node:fs';
import { battleDaoSkillsV118 } from '../../dist/content/battle-dao-skill-pack-v118.js';
import { mindSkillMasteryV2 } from '../../dist/content/mind-dao-v2.js';
import { createMindCoreStateV2 } from '../../dist/core/battle-dao-v2-contract.js';
import {
  MIND_M5_BURST_SNAPSHOT_RETENTION,
  captureMindDamagePacketV2,
  finishMindRootV2,
  mindEchoResolvedV2,
  mindGuardShieldBreakV2,
  mindMasteryBasicFollowUpV2,
  mindMasteryEchoBreakBonusPctV2,
  mindMasteryExtraDirectHitsV2,
  mindMasteryShieldMultiplierV2,
  prepareMindMasteryActionV2,
  resolveMindConsumeDamageV2,
  resolveMindInterfereV2,
  resolveMindUltimateInterferenceV2,
} from '../../dist/core/mind-dao-v2-runtime.js';
import { backendFeatureClosureManifest } from '../runners/feature-closure-manifest.js';

const skills=Object.fromEntries(battleDaoSkillsV118.filter(x=>x.runtimeV117?.daoBinding==='mind').map(x=>[x.id,x]));
const masteryIds=mindSkillMasteryV2.map(x=>x.skillId);
assert.equal(masteryIds.length,10,'M2C keeps exactly one mastery row per Mind skill');
for(const row of mindSkillMasteryV2)
  assert.deepEqual(Object.keys(row.milestones).map(Number),[100,250,500,750,1000],`${row.skillId} must own all five production milestones`);

function source(tiers={}, {p1=true}={}){
  const passiveIds=p1?['passive.v2.mind.p1']:[];
  return {
    name:'Mind M2C',
    combatBuildV117:{
      battleDaoV2Enabled:true,mainDaoId:'mind',secondaryDaoId:'sword',
      skillPracticeTierV125:{...tiers},
      learnedDaoPassiveIdsV118:passiveIds,
      passiveLevelsV125:{'passive.v2.mind.p1':20},
    },
    battleDaoStateV2:{mind:{core:createMindCoreStateV2(),...(p1?{stack:{stacks:0,cap:20,durationSeconds:12,decayEverySeconds:1,expiresAt:0}}:{})}},
    pendingSetFlagsV117:{},
  };
}
function target(marks=0){ return {id:'target',name:'Target',marks:{'Thần Ấn':marks},tags:[],pendingSetFlagsV117:{},breakDebuffUntil:0}; }
function action(id='root'){ return {effectBonusPct:0,breakBonusPct:0,castTimeMultiplier:1,recoveryMultiplier:1,battleDaoV2:{rootActionId:id,procDepth:0,followUpBudget:1,followUpsUsed:0,directDamagingHitCount:1,mindSnapshotPackets:[]}}; }
function packetSnapshot(skillId='skill.dao.mind.mark'){
  return {sourceSkillId:skillId,targetId:'target',createdAt:1,payloadId:`${skillId}:snapshot`,procDepth:0,packets:[{type:'damage',coefficient:1,breakDamagePct:10,canCrit:true,canDodge:true,canHeart:true}]};
}

{
  const e=source({'skill.dao.mind.basic':750,'skill.dao.mind.mark':1000,'skill.dao.mind.chase':750,'skill.dao.mind.observe':1000,'skill.dao.mind.flow':750,'skill.dao.mind.ultimate':750});
  let a=action('basic'); prepareMindMasteryActionV2(e,target(),skills['skill.dao.mind.basic'],a,0); assert.equal(Number(a.recoveryMultiplier.toFixed(6)),Number((.95/1.10).toFixed(6)));
  a=action('mark'); prepareMindMasteryActionV2(e,target(),skills['skill.dao.mind.mark'],a,0); assert.equal(a.effectBonusPct,15); assert.equal(Number(a.recoveryMultiplier.toFixed(6)),Number((.55/.75).toFixed(6)));
  a=action('chase'); prepareMindMasteryActionV2(e,target(),skills['skill.dao.mind.chase'],a,0); assert.equal(Number(a.castTimeMultiplier.toFixed(6)),Number((.65/.80).toFixed(6))); assert.equal(Number(a.recoveryMultiplier.toFixed(6)),Number((.55/.75).toFixed(6)));
  a=action('observe'); prepareMindMasteryActionV2(e,target(),skills['skill.dao.mind.observe'],a,0); assert.equal(Number(a.channelDurationMultiplierV118.toFixed(6)),Number((2.2/2.5).toFixed(6))); assert.equal(Number(a.recoveryMultiplier.toFixed(6)),Number((.70/.90).toFixed(6)));
  a=action('flow'); prepareMindMasteryActionV2(e,target(),skills['skill.dao.mind.flow'],a,0); assert.equal(Number(a.castTimeMultiplier.toFixed(6)),Number((.60/.80).toFixed(6)));
  a=action('ultimate'); prepareMindMasteryActionV2(e,target(),skills['skill.dao.mind.ultimate'],a,0); assert.equal(Number(a.recoveryMultiplier.toFixed(6)),Number((1.15/1.50).toFixed(6)));
}

{
  let e=source({'skill.dao.mind.split':250});
  let a=action('split250');
  assert.deepEqual(mindMasteryExtraDirectHitsV2(e,skills['skill.dao.mind.split'],a).map(x=>x.coefficient),[.45]);
  assert.deepEqual(mindMasteryExtraDirectHitsV2(e,skills['skill.dao.mind.split'],a),[],'extra package is issued once per root');
  e=source({'skill.dao.mind.split':1000}); a=action('split1000');
  assert.deepEqual(mindMasteryExtraDirectHitsV2(e,skills['skill.dao.mind.split'],a).map(x=>x.coefficient),[.55,.55]);
  e=source({'skill.dao.mind.mark':1000}); a=action('mark1000');
  assert.deepEqual(mindMasteryExtraDirectHitsV2(e,skills['skill.dao.mind.mark'],a).map(x=>x.coefficient),[.70]);
  e=source({'skill.dao.mind.chase':1000}); a=action('chase1000');
  assert.deepEqual(mindMasteryExtraDirectHitsV2(e,skills['skill.dao.mind.chase'],a).map(x=>x.coefficient),[.80]);
}

{
  assert.equal(mindMasteryShieldMultiplierV2(source({'skill.dao.mind.guard':99}),skills['skill.dao.mind.guard']),1);
  assert.equal(mindMasteryShieldMultiplierV2(source({'skill.dao.mind.guard':100}),skills['skill.dao.mind.guard']),1.20);
  assert.equal(mindMasteryShieldMultiplierV2(source({'skill.dao.mind.guard':1000}),skills['skill.dao.mind.guard']),1.45);
  const e=source({'skill.dao.mind.guard':250});
  assert.equal(mindGuardShieldBreakV2(e,5),1); assert.equal(e.battleDaoStateV2.mind.stack.stacks,1);
  const empowered=source({'skill.dao.mind.guard':500}); empowered.battleDaoStateV2.mind.core.guardEmpowerUntil=4;
  const next=action('guard-next'); prepareMindMasteryActionV2(empowered,target(),skills['skill.dao.mind.mark'],next,1);
  assert.equal(next.effectBonusPct,10,'Guard 500 empowers the next eligible Mind Active once inside the 4s window');
  assert.equal(next.battleDaoV2.mindConsumeGuardEmpower,true);
}

{
  const e=source({'skill.dao.mind.interfere':1000});
  const t=target(3); t.casting={skillId:'dummy',resolvesAt:10};
  const a=action('interfere');
  const out=resolveMindInterfereV2(e,t,skills['skill.dao.mind.interfere'],a,1);
  assert.equal(out.consumed,3); assert.equal(out.mentalStaggerSeconds,.50); assert.equal(out.masteryStackGain,1);
  assert.equal(e.battleDaoStateV2.mind.stack.stacks,1);
}
{
  const e=source({'skill.dao.mind.interfere':500}); const t=target();
  t.pendingSetFlagsV117.mindRecoveryPenaltyPct=10;
  assert.equal(mindMasteryEchoBreakBonusPctV2(e,t,'skill.dao.mind.mark'),20,'Interfere 500 buffs any Niệm Ảnh hitting a currently Nhiễu target, not only an Interfere-sourced snapshot');
}

{
  let e=source({'skill.dao.mind.burst':100}); let t=target(5); let a=action('burst100');
  const burstEffect=skills['skill.dao.mind.burst'].effects.find(x=>x.type==='consumeMarkDamage');
  let out=resolveMindConsumeDamageV2(e,t,skills['skill.dao.mind.burst'],burstEffect,a);
  assert.equal(out.consumed,5); assert.equal(Number(out.coefficient.toFixed(6)),3.8,'1.00 + five*(.48+.08)');

  e=source({'skill.dao.mind.burst':1000}); t=target(5); a=action('burst1000');
  out=resolveMindConsumeDamageV2(e,t,skills['skill.dao.mind.burst'],burstEffect,a);
  assert.equal(Number(out.coefficient.toFixed(6)),5.32); assert.equal(Number(out.breakDamagePct.toFixed(6)),32.5);

  e=source({'skill.dao.mind.ultimate':100}); t=target(5); a=action('ult100');
  const ultEffect=skills['skill.dao.mind.ultimate'].effects.find(x=>x.type==='consumeMarkDamage');
  out=resolveMindConsumeDamageV2(e,t,skills['skill.dao.mind.ultimate'],ultEffect,a);
  assert.equal(Number(out.coefficient.toFixed(6)),Number((2.1*1.15+5*.62).toFixed(6)),'Ultimate 100 amplifies the base packet only');
}

{
  const e=source({'skill.dao.mind.ultimate':1000});
  let t=target(); let out=resolveMindUltimateInterferenceV2(e,t,skills['skill.dao.mind.ultimate'],{consumed:3},1);
  assert(out.targetCastDelaySeconds>0); assert.equal(out.mentalPulseSeconds,0);
  t=target(); out=resolveMindUltimateInterferenceV2(e,t,skills['skill.dao.mind.ultimate'],{consumed:5},1);
  assert.equal(out.mentalPulseSeconds,.60); assert(t.pendingSetFlagsV117.mindRecoveryPenaltyPct>0);
}

{
  const e=source({'skill.dao.mind.mark':250}); const a=action('mark-snapshot');
  captureMindDamagePacketV2(e,skills['skill.dao.mind.mark'],a,{coefficient:.70,breakDamagePct:2,runtimeEffectBonusPct:0,runtimeBreakBonusPct:0});
  assert.equal(Number(a.battleDaoV2.mindSnapshotPackets[0].coefficient.toFixed(6)),.77);
  const b=source({'skill.dao.mind.burst':1000}); const ba=action('burst-snapshot');
  captureMindDamagePacketV2(b,skills['skill.dao.mind.burst'],ba,{coefficient:5.32,breakDamagePct:32.5,runtimeEffectBonusPct:0,runtimeBreakBonusPct:0});
  assert.equal(MIND_M5_BURST_SNAPSHOT_RETENTION,1.30,'M5-3 refines only the existing Burst sanitized snapshot multiplier');
  assert.equal(Number(ba.battleDaoV2.mindSnapshotPackets[0].coefficient.toFixed(6)),Number((5.32*MIND_M5_BURST_SNAPSHOT_RETENTION).toFixed(6)));
  assert.equal(Number(ba.battleDaoV2.mindSnapshotPackets[0].breakDamagePct.toFixed(6)),Number((32.5*MIND_M5_BURST_SNAPSHOT_RETENTION).toFixed(6)));
}

{
  const e=source({'skill.dao.mind.basic':250}); const a=action('basic-proc');
  const out=mindMasteryBasicFollowUpV2(e,skills['skill.dao.mind.basic'],a,()=>true);
  assert(out); assert.equal(out.coefficient,.50); assert.equal(out.gaugeGain,1);
  e.battleDaoStateV2.mind.core.nextBasicDamageBonusReady=false;
  mindEchoResolvedV2(e);
  assert.equal(e.battleDaoStateV2.mind.core.nextBasicDamageBonusReady,false,'Basic 500 is not armed below its mastery threshold');

  const b=source({'skill.dao.mind.basic':500});
  mindEchoResolvedV2(b); assert.equal(b.battleDaoStateV2.mind.core.nextBasicDamageBonusReady,true);
  const boosted=action('basic500'); prepareMindMasteryActionV2(b,target(),skills['skill.dao.mind.basic'],boosted,2);
  assert.equal(boosted.effectBonusPct,20); finishMindRootV2(b,target(),skills['skill.dao.mind.basic'],boosted,2);
  assert.equal(b.battleDaoStateV2.mind.core.nextBasicDamageBonusReady,false,'Basic 500 boost is consumed by the next Basic root');
}

{
  const e=source({'skill.dao.mind.chase':250});
  e.battleDaoStateV2.mind.core.snapshot=packetSnapshot('skill.dao.mind.mark');
  const a=action('chase250'); a.battleDaoV2.mindSnapshotPackets=[{type:'damage',coefficient:1.2,breakDamagePct:5}];
  finishMindRootV2(e,target(),skills['skill.dao.mind.chase'],a,2);
  assert.equal(e.battleDaoStateV2.mind.core.snapshot.sourceSkillId,'skill.dao.mind.chase','Chase 250 remains the latest eligible snapshot source inside the bounded cadence window');
}

{
  const e=source({'skill.dao.mind.observe':1000});
  e.battleDaoStateV2.mind.core.snapshot=packetSnapshot('skill.dao.mind.chase');
  const a=action('observe'); prepareMindMasteryActionV2(e,target(),skills['skill.dao.mind.observe'],a,0);
  a.battleDaoV2.mindObserveCompleted=true;
  const out=finishMindRootV2(e,target(),skills['skill.dao.mind.observe'],a,3);
  assert.equal(out.masteryStackGain,2); assert(out.echo); assert.equal(out.echo.delay,0);
}
{
  const e=source({'skill.dao.mind.flow':1000}); const t=target();
  const open=action('flow'); open.battleDaoV2.mindSnapshotPackets=[{type:'damage',coefficient:1,breakDamagePct:0}];
  finishMindRootV2(e,t,skills['skill.dao.mind.flow'],open,10);
  assert.equal(e.battleDaoStateV2.mind.core.flowUntil,16,'Flow 100 extends state to 6s');
  const mark=skills['skill.dao.mind.mark'];
  let a=action('f1'); a.battleDaoV2.mindSnapshotPackets=[{type:'damage',coefficient:1,breakDamagePct:0}]; finishMindRootV2(e,t,mark,a,11);
  a=action('f2'); a.battleDaoV2.mindSnapshotPackets=[{type:'damage',coefficient:1,breakDamagePct:0}]; const second=finishMindRootV2(e,t,mark,a,12);
  assert(second.echo,'ordinary every-third cadence wins the shared budget when it coincides with Flow extreme cadence');
  assert.equal(Number(second.echo.coefficient.toFixed(6)),.45,'ordinary 35% echo receives the authored +10-point in-state mastery');
  a=action('f3'); a.battleDaoV2.mindSnapshotPackets=[{type:'damage',coefficient:1,breakDamagePct:0}]; const third=finishMindRootV2(e,t,mark,a,13);
  assert.equal(third.flowBonusMarkGain,1); assert.equal(third.flowBonusStackGain,1);
  a=action('f4'); a.battleDaoV2.mindSnapshotPackets=[{type:'damage',coefficient:1,breakDamagePct:0}]; const fourth=finishMindRootV2(e,t,mark,a,14);
  assert(fourth.echo,'Flow 1000 creates its bounded every-second-active echo when ordinary cadence does not already own the budget');
  assert.equal(Number(fourth.echo.coefficient.toFixed(6)),.35,'25% Flow echo receives the authored +10-point in-state mastery');
}
{
  const e=source({'skill.dao.mind.ultimate':1000}); e.battleDaoStateV2.mind.core.snapshot=packetSnapshot('skill.dao.mind.chase');
  const a=action('ultimate'); prepareMindMasteryActionV2(e,target(),skills['skill.dao.mind.ultimate'],a,20);
  const out=finishMindRootV2(e,target(),skills['skill.dao.mind.ultimate'],a,21);
  assert(out.echo); assert.equal(out.echo.coefficient,.70); assert.equal(Number(out.echo.delay.toFixed(6)),.60,'Ultimate domain improves cadence interval, not the fixed 0.6s echo delay');
  assert.equal(e.battleDaoStateV2.mind.core.ultimateDomainUntil,26);

  const mark=skills['skill.dao.mind.mark']; const t=target();
  let r=action('u1'); r.battleDaoV2.mindSnapshotPackets=[{type:'damage',coefficient:1,breakDamagePct:0}]; assert.equal(finishMindRootV2(e,t,mark,r,22).echo,undefined);
  r=action('u2'); r.battleDaoV2.mindSnapshotPackets=[{type:'damage',coefficient:1,breakDamagePct:0}]; assert.equal(finishMindRootV2(e,t,mark,r,23).echo,undefined);
  r=action('u3'); r.battleDaoV2.mindSnapshotPackets=[{type:'damage',coefficient:1,breakDamagePct:0}]; assert(finishMindRootV2(e,t,mark,r,24).echo,'75% cadence interval produces the first domain echo on the third Active and keeps fractional cadence credit');
  assert.equal(Number(e.battleDaoStateV2.mind.core.eligibleActiveCount.toFixed(6)),.75);
  r=action('u4'); r.battleDaoV2.mindSnapshotPackets=[{type:'damage',coefficient:1,breakDamagePct:0}]; assert.equal(finishMindRootV2(e,t,mark,r,25).echo,undefined);
  r=action('u5'); r.battleDaoV2.mindSnapshotPackets=[{type:'damage',coefficient:1,breakDamagePct:0}]; assert(finishMindRootV2(e,t,mark,r,25.5).echo,'fractional cadence credit makes the second domain echo arrive after two more Actives');
}

const combat=fs.readFileSync(new URL('../../dist/core/combat.js',import.meta.url),'utf8');
const combatM2B=fs.readFileSync(new URL('../../dist/core/combat-m2b-base.js',import.meta.url),'utf8');
const decision=fs.readFileSync(new URL('../../dist/core/combat-decision.js',import.meta.url),'utf8');
assert(combat.includes("CombatEngineBaseM2B"));
assert(combat.includes('mindMasteryExtraDirectHitsV2'));
assert(combat.includes("status.mind.interference_stagger"));
assert(combat.includes("kind === 'mindSnapshot'"));
assert(combatM2B.includes('finishMindRootV2(actor, target, skill, action, now)'),'closed M1/M2B core stays in the base seam');
assert(decision.includes('prepareMindMasteryActionV2(actor, target, skill, prepared.action, now)'));
const manifest=backendFeatureClosureManifest('dao-mind');
assert.equal(manifest.closureReady,false,'M2C does not authorize whole-feature closure/tuning');
assert(manifest.gates.includes('mind-dao-m2-mastery-architecture-test.js'));

console.log('MIND DAO M2C MASTERY ARCHITECTURE: PASS');
