import assert from 'node:assert/strict';
import {
  DAO_SUY_TRIBULATION_MAX_SUCCESSES_PER_MAJOR_V127,
  daoSuyStatusV127,
  resolveDaoSuyTribulationV127,
} from '../../dist/core/dao-suy-v127.js';
import { createImmortalState, cloneImmortalState } from '../../dist/core/immortal.js';

const immortal=createImmortalState();
for(let i=0;i<DAO_SUY_TRIBULATION_MAX_SUCCESSES_PER_MAJOR_V127;i++){
  immortal.daoSuy=80;
  const out=resolveDaoSuyTribulationV127(immortal,true,{},46);
  assert.equal(out.successesThisMajor,i+1);
}
immortal.daoSuy=80;
let status=daoSuyStatusV127(immortal,46,{});
assert.equal(status.tribulationSuccessesThisMajor,5);
assert.equal(status.tribulationRescuesRemainingThisMajor,0);
assert.equal(status.tribulationRescueExhausted,true);
assert.equal(status.canChallengeSuyKiep,false);
assert.throws(()=>resolveDaoSuyTribulationV127(immortal,true,{},46),/dùng hết 5 lần Suy Kiếp/);

// A new Immortal major realm gets a new finite rescue quota; old quota is retained for save/audit.
immortal.daoSuy=80;
status=daoSuyStatusV127(immortal,50,{});
assert.equal(status.tribulationSuccessesThisMajor,0);
assert.equal(status.tribulationRescuesRemainingThisMajor,5);
assert.equal(status.canChallengeSuyKiep,true);
resolveDaoSuyTribulationV127(immortal,true,{},50);
assert.equal(daoSuyStatusV127(immortal,50,{}).tribulationSuccessesThisMajor,1);
assert.equal(daoSuyStatusV127(immortal,46,{}).tribulationSuccessesThisMajor,5);

const cloned=cloneImmortalState(immortal);
assert.deepEqual(cloned.daoSuyTribulationsPassedByMajor,immortal.daoSuyTribulationsPassedByMajor);
cloned.daoSuyTribulationsPassedByMajor['46']=0;
assert.equal(immortal.daoSuyTribulationsPassedByMajor['46'],5,'clone must deep-copy per-major rescue quota');

console.log('V127 ĐẠO SUY FINITE RESCUE — PASS');
console.log(JSON.stringify({maxSuccessesPerMajor:DAO_SUY_TRIBULATION_MAX_SUCCESSES_PER_MAJOR_V127,major46Exhausted:true,major50FreshQuota:true},null,2));
