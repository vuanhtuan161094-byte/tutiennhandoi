import assert from 'node:assert/strict';
import {
  MIND_SEAL_CAP_V2,
  MIND_SEAL_MARK_V2,
  addMindSealV2,
  consumeMindSealV2,
  mindSealCountV2,
} from '../../dist/core/mind-dao-v2-seal-runtime.js';

function source(mainDaoId='mind', enabled=true) {
  return { combatBuildV117: { battleDaoV2Enabled: enabled, mainDaoId } };
}
function target(stacks=0) {
  return { marks: { [MIND_SEAL_MARK_V2]: stacks } };
}

assert.equal(MIND_SEAL_CAP_V2,5,'Thần Ấn production cap is fixed at 5');

{
  const t=target(4);
  const tx=addMindSealV2(source(),t,3);
  assert.deepEqual(tx,{before:4,gained:1,after:5,cap:5});
  assert.equal(mindSealCountV2(t),5,'gain must clamp at canonical cap');
}

{
  const t=target(5);
  const first=consumeMindSealV2(source(),t,3);
  const second=consumeMindSealV2(source(),t,3);
  const third=consumeMindSealV2(source(),t,3);
  assert.deepEqual(first,{before:5,consumed:3,after:2,cap:5});
  assert.deepEqual(second,{before:2,consumed:2,after:0,cap:5});
  assert.deepEqual(third,{before:0,consumed:0,after:0,cap:5});
  assert.equal(mindSealCountV2(t),0,'a resolved spend cannot consume the same marks twice');
}

{
  const t=target(2);
  const tx=addMindSealV2(source('sword'),t,2);
  assert.equal(tx.gained,0,'Secondary/non-Main Mind may not create Core Thần Ấn');
  assert.equal(mindSealCountV2(t),2);
  const spent=consumeMindSealV2(source('sword'),t,2);
  assert.equal(spent.consumed,0,'Secondary/non-Main Mind may not spend Core Thần Ấn');
  assert.equal(mindSealCountV2(t),2);
}

{
  const t=target(2);
  assert.equal(addMindSealV2(source('mind',false),t,2).gained,0,'V2-disabled actors must not mutate the V2 Core store');
  assert.equal(consumeMindSealV2(source('mind',false),t,2).consumed,0);
  assert.equal(mindSealCountV2(t),2);
}

{
  const t=target(99);
  assert.equal(mindSealCountV2(t),5,'reads normalize stale/oversized compatibility values without expanding the cap');
  const tx=consumeMindSealV2(source(),t,5);
  assert.deepEqual(tx,{before:5,consumed:5,after:0,cap:5});
}

console.log('MIND DAO M1 THẦN ẤN TRANSACTIONS: PASS');
