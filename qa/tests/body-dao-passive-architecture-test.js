import assert from 'node:assert/strict';
import {
  BODY_DAO_RUNTIME_PRODUCTION_SCHEMA_V1,
  battleDaoV2IncomingDamageMultiplier,
  battleDaoV2OutgoingMultiplier,
  createBattleDaoRuntimeStateV2,
  onBattleDaoV2HpDamageTaken,
  onBattleDaoV2Mitigation,
  v2ResourceProjection,
} from '../../dist/core/battle-dao-v2-runtime.js';

function bodyEntity(){
  return {
    id:'P',name:'Body QA',
    combatBuildV117:{
      battleDaoV2Enabled:true,
      mainDaoId:'body',
      secondaryDaoId:undefined,
      learnedDaoPassiveIdsV118:Array.from({length:8},(_,i)=>`passive.v2.body.p${i+1}`),
      passiveLevelsV125:Object.fromEntries(Array.from({length:8},(_,i)=>[`passive.v2.body.p${i+1}`,20])),
    },
  };
}

const e=bodyEntity();
e.battleDaoStateV2=createBattleDaoRuntimeStateV2(e,0);
assert.ok(e.battleDaoStateV2?.body?.core,'Main Body must still own Phản Thế core');
assert.equal(e.battleDaoStateV2.body.stack,undefined,'legacy Huyết Khí get-hit stack must not be created for Main Body');
assert.equal(e.battleDaoStateV2.body.core.productionAuthorityV1,BODY_DAO_RUNTIME_PRODUCTION_SCHEMA_V1);

const hpLossGain=onBattleDaoV2HpDamageTaken(e,100,0,()=>true);
assert.equal(hpLossGain,0,'raw HP loss must not mint a second Body passive stack/resource');
assert.equal(e.battleDaoStateV2.body.stack,undefined);

const before=e.battleDaoStateV2.body.core.counterForce;
const mitigationGain=onBattleDaoV2Mitigation(e,1,1,1);
const after=e.battleDaoStateV2.body.core.counterForce;
assert.ok(mitigationGain>0,'real mitigation must generate Phản Thế');
assert.ok(after>before,'Phản Thế must increase from successful mitigation');
assert.equal(e.battleDaoStateV2.body.core.bodyMitigationEvents,1,'production runtime must expose successful mitigation identity count');
assert.ok(e.battleDaoStateV2.body.core.bodyGuardWindowUntil>1,'successful mitigation must open an authored counter/guard window');

// Holding resource alone must not recreate the legacy free +damage/+DR lane.
const target={id:'T',hp:100,baseStats:{maxHp:100}};
e.battleDaoStateV2.body.core.bodyGuardWindowUntil=0;
e.battleDaoStateV2.body.core.bodyCycleWindowUntil=0;
e.battleDaoStateV2.body.core.counterForce=0;
const damageAtZero=battleDaoV2OutgoingMultiplier(e,target,99,'ActiveHit','skill.dao.body.basic');
const incomingAtZero=battleDaoV2IncomingDamageMultiplier(e,99);
e.battleDaoStateV2.body.core.counterForce=80;
const damageAtEighty=battleDaoV2OutgoingMultiplier(e,target,99,'ActiveHit','skill.dao.body.basic');
const incomingAtEighty=battleDaoV2IncomingDamageMultiplier(e,99);
assert.ok(Math.abs(damageAtZero-damageAtEighty)<1e-12,'holding Phản Thế must not grant free direct damage');
assert.ok(Math.abs(incomingAtZero-incomingAtEighty)<1e-12,'holding Phản Thế must not grant free damage reduction');

const projection=v2ResourceProjection(e,99);
assert.equal(projection.bodyProductionAuthorityV1,BODY_DAO_RUNTIME_PRODUCTION_SCHEMA_V1);
assert.equal(projection.bodyPassiveStack,undefined,'player-facing projection must not expose retired Main-Body Huyết Khí stack');
assert.equal(projection.bodyPassiveStackCap,undefined);
assert.equal(projection.counterForce,80,'compatible counterForce storage remains the Phản Thế projection');
assert.ok(Number.isFinite(projection.bodyMitigationEvents));
assert.ok(Number.isFinite(projection.bodyCashoutEvents));

console.log('BODY DAO B2 PASSIVE ARCHITECTURE PASS');
