import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildRegistry } from '../../dist/content/registry.js';
import { battleDaoAutoRotationV127 } from '../../dist/core/battle-dao-rotation-v127.js';
import {
  BODY_BLOOD_RUSH_DAMAGE_BONUS_PCT_V1,
  BODY_BLOOD_RUSH_DURATION_SECONDS_V1,
  BODY_BLOOD_RUSH_HP_COST_PCT_V1,
  BODY_BLOOD_RUSH_MIN_HP_PCT_V1,
  BODY_BLOOD_RUSH_SKILL_ID_V1,
  BODY_IMMOVABLE_CHANNEL_DR_PCT_V1,
  battleDaoV2IncomingDamageMultiplier,
  battleDaoV2OutgoingMultiplier,
  createBattleDaoRuntimeStateV2,
  prepareRemainingDaoCoreActionV2,
  v2ResourceProjection,
} from '../../dist/core/battle-dao-v2-runtime.js';

const registry=buildRegistry();
const bloodSkill=registry.skills.get(BODY_BLOOD_RUSH_SKILL_ID_V1);
assert(bloodSkill,'B6 blood-rush skill must remain registered under the stable Body skill id');
assert.equal(bloodSkill.name,'Nhiên Huyết Chấn Thân');
assert.equal(bloodSkill.cooldown,12);
assert.equal(bloodSkill.castTime,0);
assert.equal(bloodSkill.recoveryTime,.7);
assert.equal(bloodSkill.effects.length,0,'Nhiên Huyết activation must not keep the old direct-damage packet');
assert.equal(bloodSkill.daoRuntimeV118?.signature,'bodyBloodRush');
assert.equal(BODY_BLOOD_RUSH_HP_COST_PCT_V1,10);
assert.equal(BODY_BLOOD_RUSH_MIN_HP_PCT_V1,35);
assert.equal(BODY_BLOOD_RUSH_DURATION_SECONDS_V1,6);
assert.equal(BODY_BLOOD_RUSH_DAMAGE_BONUS_PCT_V1,20);
assert.equal(BODY_IMMOVABLE_CHANNEL_DR_PCT_V1,25);

function entity({hp=10000,maxHp=10000,force=50}={}){
  const e={
    id:'P',name:'Body B6 QA',alive:true,
    hp,spirit:100,
    baseStats:{
      maxHp,maxHpAuthorityV168:'materialized',maxSpirit:100,spiritStandard:100,
      attack:100,physique:100,defense:100,mobility:100,accuracy:100,controlPower:100,resolve:100,
      primaryStatsV5:{power:100,body:100,agility:100,spirit:100,sense:100},
    },
    cooldownUntil:{},statuses:[],shields:[],marks:{},pendingSetFlagsV117:{},
    combatBuildV117:{
      battleDaoV2Enabled:true,
      mainDaoId:'body',
      learnedDaoPassiveIdsV118:[],
      passiveLevelsV125:{},
      rootUnlocked:{},rootEffectivenessPct:{},activeSetMechanics:[],activeVariantIdsV118:[],
    },
  };
  e.battleDaoStateV2=createBattleDaoRuntimeStateV2(e,0);
  e.battleDaoStateV2.body.core.counterForce=force;
  return e;
}
function action(){return{battleDaoV2:{daoData:{}},effectBonusPct:0,breakBonusPct:0,recoveryMultiplier:1};}

// Successful Nhiên Huyết is a direct HP payment, not incoming damage or Phản Thế generation.
{
  const e=entity({hp:10000,maxHp:10000,force:50});
  const core=e.battleDaoStateV2.body.core;
  const mitigationBefore=core.bodyMitigationEvents;
  const forceBefore=core.counterForce;
  const a=action();
  prepareRemainingDaoCoreActionV2(e,{id:'T'},bloodSkill,a,1);
  assert.equal(e.hp,9000,'Nhiên Huyết must pay exactly 10% Max HP at full health');
  assert.equal(core.counterForce,forceBefore,'self-paid HP must not generate or spend Phản Thế');
  assert.equal(core.bodyMitigationEvents,mitigationBefore,'self-paid HP must not fake a mitigation event');
  assert.equal(a.battleDaoV2.daoData.bodyBloodRushActivated,true);
  assert.equal(a.battleDaoV2.daoData.bodyBloodRushHpPaid,1000);
  assert.equal(core.bodyBloodRushActivations,1);
  assert.equal(core.bodyBloodRushHpPaid,1000);
  assert.equal(core.bodyBloodRushUntil,7);
  const projection=v2ResourceProjection(e,1.1);
  assert.equal(projection.bodyBloodRushActive,true);
  assert.ok(projection.bodyBloodRushRemainingSeconds>5.8&&projection.bodyBloodRushRemainingSeconds<=5.9);

  const active=battleDaoV2OutgoingMultiplier(e,{id:'T'},1.1,'ActiveHit','skill.dao.body.break');
  const expired=battleDaoV2OutgoingMultiplier(e,{id:'T'},7.1,'ActiveHit','skill.dao.body.break');
  assert.ok(Math.abs(active/expired-1.2)<1e-9,'Huyết Bạo must add exactly +20% Body-skill damage during its window');
}

// Low HP suppresses the activation entirely: no payment, no window, no fake resource event.
{
  const e=entity({hp:3400,maxHp:10000,force:37});
  const core=e.battleDaoStateV2.body.core;
  const a=action();
  prepareRemainingDaoCoreActionV2(e,{id:'T'},bloodSkill,a,2);
  assert.equal(e.hp,3400);
  assert.equal(core.counterForce,37);
  assert.equal(core.bodyBloodRushActivations,0);
  assert.equal(core.bodyBloodRushHpPaid,0);
  assert.equal(a.battleDaoV2.daoData.bodyBloodRushActivated,false);
  assert.equal(a.battleDaoV2.daoData.bodyBloodRushSuppressedLowHp,true);
  assert.equal(v2ResourceProjection(e,2).bodyBloodRushActive,false);
}

// Bất Động is real defense only while the channel is live, not an always-on DR source.
{
  const e=entity({hp:10000,maxHp:10000,force:0});
  const baseline=battleDaoV2IncomingDamageMultiplier(e,3);
  e.channeling={skillId:'skill.dao.body.immovable',token:1};
  const channel=battleDaoV2IncomingDamageMultiplier(e,3);
  assert.ok(Math.abs(channel/baseline-.75)<1e-9,'Bất Động channel must reduce incoming damage by exactly 25%');
  e.channeling=undefined;
  const after=battleDaoV2IncomingDamageMultiplier(e,3.1);
  assert.ok(Math.abs(after-baseline)<1e-9,'Bất Động DR must end with the channel');
}

// Auto contract: Nhiên Huyết has one explicit high-HP rule and no unconditional Body rule.
{
  const ids=['skill.dao.body.basic',BODY_BLOOD_RUSH_SKILL_ID_V1,'skill.dao.body.guard'];
  const rotation=battleDaoAutoRotationV127('body',ids);
  const bloodRules=rotation.rules.filter(x=>x.skillId===BODY_BLOOD_RUSH_SKILL_ID_V1);
  assert.equal(bloodRules.length,1);
  assert.equal(bloodRules[0].priority,149);
  assert.deepEqual(bloodRules[0].conditions,[{type:'selfHpAbove',pct:75}]);

  const aiSource=fs.readFileSync(new URL('../../dist/core/ai.js',import.meta.url),'utf8');
  assert(aiSource.includes("case 'selfHpAbove'"),'AI must support the high-HP Blood Rush condition');
  assert(aiSource.includes('BODY_BLOOD_RUSH_MIN_HP_PCT_V1'),'manual/explicit use must retain the 35% hard safety floor');
  assert(aiSource.includes('BODY_BLOOD_RUSH_AUTO_MIN_HP_PCT_V1 = 75'),'generic Auto fallback must retain the 75% safety floor');
  assert(aiSource.includes('projection.bodyBloodRushActive'),'generic fallback must not re-open an already active Blood Rush window');
}

console.log('BODY DAO B6 BLOOD/IMMOVABLE CORRECTNESS PASS');
