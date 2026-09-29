import assert from 'node:assert/strict';
import {
  MIND_V2_MARK,
  MIND_V2_MARK_CAP,
  addMindMarksV2,
  consumeMindMarksV2,
  finishMindRootV2,
  gainMindPassiveStackV2,
  mindMarkCountV2,
  mindObserveProgressV2,
} from '../../dist/core/mind-dao-v2-runtime.js';

function source(mainDaoId='mind', enabled=true) {
  return {
    combatBuildV117: {
      battleDaoV2Enabled: enabled,
      mainDaoId,
      learnedDaoPassiveIdsV118: [],
      passiveLevelsV125: {},
    },
    battleDaoStateV2: {
      mind: {
        core: {
          eligibleActiveCount: 0,
          echoEvery: 3,
          echoCoefficient: .35,
          snapshot: undefined,
          flowUntil: 0,
          flowEligibleActiveCount: 0,
        },
      },
    },
  };
}
function target(stacks=0) {
  return { id:'target', marks: { [MIND_V2_MARK]: stacks } };
}
function skill(id, slot='active', signature='mindBuild') {
  return { id, runtimeV117:{ daoBinding:'mind', slotClass:slot }, daoRuntimeV118:{ signature } };
}
function action(id='root') {
  return { battleDaoV2:{ rootActionId:id, procDepth:0, mindSnapshotPackets:[] } };
}

assert.equal(MIND_V2_MARK_CAP,5,'Thần Ấn production cap is fixed at 5');

{
  const s=source(), t=target(4);
  assert.equal(addMindMarksV2(s,t,3),1);
  assert.equal(mindMarkCountV2(t),5,'gain must clamp at canonical cap');
}

{
  const s=source(), t=target(5);
  assert.deepEqual(consumeMindMarksV2(s,t,3),{before:5,consumed:3,after:2});
  assert.deepEqual(consumeMindMarksV2(s,t,3),{before:2,consumed:2,after:0});
  assert.deepEqual(consumeMindMarksV2(s,t,3),{before:0,consumed:0,after:0});
  assert.equal(mindMarkCountV2(t),0,'resolved spend cannot consume the same marks twice');
}

{
  const s=source('sword'), t=target(2);
  assert.equal(addMindMarksV2(s,t,2),0,'non-Main Mind may not create Core Thần Ấn');
  assert.equal(consumeMindMarksV2(s,t,2).consumed,0,'non-Main Mind may not spend Core Thần Ấn');
  assert.equal(mindMarkCountV2(t),2);
}

{
  const s=source('mind',false), t=target(2);
  assert.equal(addMindMarksV2(s,t,2),0,'V2-disabled actors must not mutate the V2 Core store');
  assert.equal(consumeMindMarksV2(s,t,2).consumed,0);
  assert.equal(mindMarkCountV2(t),2);
}

{
  const s=source(), t=target(99);
  assert.equal(mindMarkCountV2(t),5,'reads normalize stale/oversized compatibility values without expanding cap');
  assert.deepEqual(consumeMindMarksV2(s,t,5),{before:5,consumed:5,after:0});
}

{
  const s=source(), t=target(0), sk=skill('skill.dao.mind.observe'), a=action('observe');
  assert.equal(mindObserveProgressV2(s,t,sk,a,1,5),0);
  assert.equal(mindObserveProgressV2(s,t,sk,a,2,5),1);
  assert.equal(mindObserveProgressV2(s,t,sk,a,3,5),0);
  assert.equal(mindObserveProgressV2(s,t,sk,a,4,5),1);
  assert.equal(mindObserveProgressV2(s,t,sk,a,5,5),1);
  assert.equal(mindMarkCountV2(t),3,'Observe must earn 3 marks only through completed tick progress');
}

{
  const s=source(), t=target(0);
  const flow=skill('skill.dao.mind.flow');
  const opened=finishMindRootV2(s,t,flow,action('flow'),10);
  assert.equal(opened.flowBonusMarkGain,0);
  assert.equal(s.battleDaoStateV2.mind.core.flowEligibleActiveCount,0,'Deploy root must not count itself toward Phân Lưu cadence');
  assert.equal(s.battleDaoStateV2.mind.core.flowUntil,15);

  for (let i=1;i<=2;i++) {
    const a=action(`after-flow-${i}`);
    a.battleDaoV2.mindSnapshotPackets=[{type:'damage',coefficient:1,breakDamagePct:0}];
    const out=finishMindRootV2(s,t,skill(`skill.dao.mind.mark.${i}`),a,10+i);
    assert.equal(out.flowBonusMarkGain,0);
  }
  const third=action('after-flow-3');
  third.battleDaoV2.mindSnapshotPackets=[{type:'damage',coefficient:1,breakDamagePct:0}];
  const out=finishMindRootV2(s,t,skill('skill.dao.mind.mark.3'),third,13);
  assert.equal(out.flowBonusMarkGain,1,'every third eligible Active after Deploy gains one bonus mark');
  assert.equal(mindMarkCountV2(t),1);
}

{
  const s=source(), t=target(0);
  s.combatBuildV117.learnedDaoPassiveIdsV118=['passive.v2.mind.p1','passive.v2.mind.p8'];
  s.combatBuildV117.passiveLevelsV125={'passive.v2.mind.p8':20};
  s.battleDaoStateV2.mind.stack={stacks:20,cap:20,durationSeconds:12,expiresAt:0,decayEverySeconds:1};
  const gained=gainMindPassiveStackV2(s,skill('skill.dao.mind.mark'),20,()=>false);
  assert.equal(gained,0,'at-cap p8 refresh is event-owned and does not fake stack gain');
  assert.equal(s.battleDaoStateV2.mind.stack.expiresAt,22,'eligible Active refreshes p8 peak hold by the authored 2s at level 20');
}

console.log('MIND DAO M1 CANONICAL RUNTIME HELPERS: PASS');
