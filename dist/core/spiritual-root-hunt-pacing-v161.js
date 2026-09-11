import {
  SPIRITUAL_ROOT_ASCENSION_INTERVAL_V145,
  SPIRITUAL_ROOT_MAX_REALM_TIER_V145,
  SPIRITUAL_ROOT_ORIGIN_RESOURCE_V145,
  SPIRITUAL_ROOT_TENDON_RESOURCE_V145,
  SPIRITUAL_ROOT_VIRTUAL_ORIGIN_PITY_KILLS_V145,
  ascendSpiritualRootV145,
  createSpiritualRootStateV145,
  nourishSpiritualRootV145,
  settleSpiritualRootHuntV145,
  spiritualRootCultivationTotalBonusPctV145,
  spiritualRootOriginCostV145,
  spiritualRootOriginTierForAscensionV145,
} from './spiritual-root-v145.js';
import {
  HUNT_VIRTUAL_FARM_MIN_SECONDS_PER_KILL_V77,
  HUNT_VIRTUAL_FARM_MAX_SECONDS_PER_KILL_V77,
} from './hunt-virtual-farm-v77.js';

export const SPIRITUAL_ROOT_HUNT_PACING_V161_SCHEMA='spiritual-root-hunt-pacing.v161';
export const V161_ROOT_TARGET_LEVELS=Object.freeze([100,1000,2800,10000]);
export const V161_ROOT_VIRTUAL_BATCH_KILLS=SPIRITUAL_ROOT_VIRTUAL_ORIGIN_PITY_KILLS_V145;
export const V161_ROOT_KILL_SPEED_SCENARIOS=Object.freeze([
  Object.freeze({id:'hardFloorCap',label:'Săn Ảo chạm hard floor',secondsPerKill:HUNT_VIRTUAL_FARM_MIN_SECONDS_PER_KILL_V77}),
  Object.freeze({id:'oneSecond',label:'1 giây / kill',secondsPerKill:1}),
  Object.freeze({id:'fiveSeconds',label:'5 giây / kill',secondsPerKill:5}),
]);

const round=(value,digits=3)=>Number(Number(value||0).toFixed(digits));
const inventoryBigInt=(inventory,id)=>{
  const value=inventory?.[id];
  if(typeof value==='bigint')return value;
  if(typeof value==='number'&&Number.isFinite(value))return BigInt(Math.max(0,Math.floor(value)));
  if(typeof value==='string'&&/^\d+$/.test(value))return BigInt(value);
  return 0n;
};

function requiredAscensionsToReachLevel(targetLevel){
  const target=Math.max(1,Math.floor(Number(targetLevel)||1));
  return Math.floor((target-1)/SPIRITUAL_ROOT_ASCENSION_INTERVAL_V145);
}

function expectedOriginSpendToReachLevel(targetLevel){
  const ascensions=requiredAscensionsToReachLevel(targetLevel);
  let total=0n;
  for(let index=1;index<=ascensions;index++)total+=spiritualRootOriginCostV145(index*SPIRITUAL_ROOT_ASCENSION_INTERVAL_V145);
  return total;
}

function speedConversions(totalKills){
  return V161_ROOT_KILL_SPEED_SCENARIOS.map(scenario=>{
    const seconds=Math.max(0,Number(totalKills)||0)*scenario.secondsPerKill;
    return {
      ...scenario,
      killsPerHour:round(3600/scenario.secondsPerKill,3),
      farmHours:round(seconds/3600,3),
      farmDays24h:round(seconds/86400,3),
    };
  });
}

function freshRootCharacter(){
  const root=createSpiritualRootStateV145();
  root.legacyRefunded=true;
  return {spiritualRootV145:root};
}

function maybeGrantFirstClear(character,inventory,tier,zone,creditedTiers,counters){
  if(creditedTiers.has(tier))return;
  const result=settleSpiritualRootHuntV145(character,inventory,{
    kills:1,
    firstClear:true,
    countForOriginMeter:false,
    majorRealmIndex:tier,
    currentMajorRealmIndex:tier,
    zone,
  });
  creditedTiers.add(tier);
  counters.totalKills+=1;
  counters.firstClearKills+=1;
  counters.firstClearOrigins+=Math.max(0,Number(result.origin)||0);
  counters.tendonGenerated+=BigInt(result.tendon||0);
}

export function simulateSpiritualRootHuntPacingV161(targetLevel,{includeFirstClear=false,zone=1,batchKills=V161_ROOT_VIRTUAL_BATCH_KILLS}={}){
  const target=Math.max(1,Math.floor(Number(targetLevel)||1));
  const farmZone=Math.max(1,Math.floor(Number(zone)||1));
  const batch=Math.max(1,Math.floor(Number(batchKills)||1));
  const character=freshRootCharacter();
  const inventory={
    [SPIRITUAL_ROOT_TENDON_RESOURCE_V145]:'0',
    [SPIRITUAL_ROOT_ORIGIN_RESOURCE_V145]:'0',
  };
  const creditedFirstClearTiers=new Set();
  const counters={
    totalKills:0,
    virtualKills:0,
    firstClearKills:0,
    firstClearOrigins:0,
    virtualOrigins:0,
    tendonGenerated:0n,
    tendonSpent:0n,
    originSpent:0n,
    virtualBatches:0,
    realmTierUnlocks:0,
  };
  let currentMajorRealmIndex=1;
  let safety=0;

  while(Number(character.spiritualRootV145.level)<target){
    if(++safety>2_000_000)throw new Error(`V161 Spiritual Root pacing safety exceeded at Lv${character.spiritualRootV145.level}.`);
    const state=character.spiritualRootV145;
    const remaining=target-Number(state.level);
    if(remaining<=0)break;

    const nourishment=nourishSpiritualRootV145(state,inventory,Math.min(1000,remaining));
    character.spiritualRootV145=nourishment.state;
    counters.tendonSpent+=BigInt(nourishment.spentTendon||0);
    if(Number(character.spiritualRootV145.level)>=target)break;

    const atGate=Number(character.spiritualRootV145.level)>=100
      && Number(character.spiritualRootV145.level)%SPIRITUAL_ROOT_ASCENSION_INTERVAL_V145===0
      && Number(character.spiritualRootV145.ascensions)<Math.floor(Number(character.spiritualRootV145.level)/SPIRITUAL_ROOT_ASCENSION_INTERVAL_V145);

    if(atGate){
      const requiredTier=spiritualRootOriginTierForAscensionV145(character.spiritualRootV145.level);
      if(currentMajorRealmIndex<requiredTier){
        currentMajorRealmIndex=requiredTier;
        counters.realmTierUnlocks+=1;
      }
      if(includeFirstClear)maybeGrantFirstClear(character,inventory,currentMajorRealmIndex,farmZone,creditedFirstClearTiers,counters);
      try{
        const ascended=ascendSpiritualRootV145(character.spiritualRootV145,inventory,currentMajorRealmIndex);
        character.spiritualRootV145=ascended.state;
        counters.originSpent+=BigInt(ascended.cost||0);
        continue;
      }catch(error){
        if(!/Thiếu Bản Nguyên Linh Căn/.test(String(error?.message||error)))throw error;
      }
    }else{
      const nextGate=Math.max(100,(Math.floor(Number(character.spiritualRootV145.level)/100)+1)*100);
      const nextTier=spiritualRootOriginTierForAscensionV145(nextGate);
      if(currentMajorRealmIndex<nextTier){
        currentMajorRealmIndex=nextTier;
        counters.realmTierUnlocks+=1;
      }
      if(includeFirstClear)maybeGrantFirstClear(character,inventory,currentMajorRealmIndex,farmZone,creditedFirstClearTiers,counters);
    }

    const farm=settleSpiritualRootHuntV145(character,inventory,{
      kills:batch,
      firstClear:false,
      countForOriginMeter:true,
      majorRealmIndex:currentMajorRealmIndex,
      currentMajorRealmIndex,
      zone:farmZone,
    });
    counters.totalKills+=batch;
    counters.virtualKills+=batch;
    counters.virtualBatches+=1;
    counters.virtualOrigins+=Math.max(0,Number(farm.origin)||0);
    counters.tendonGenerated+=BigInt(farm.tendon||0);
  }

  const finalState=character.spiritualRootV145;
  const expectedAscensions=requiredAscensionsToReachLevel(target);
  const expectedOriginSpend=expectedOriginSpendToReachLevel(target);
  const originInventory=Object.entries(inventory)
    .filter(([id])=>id.startsWith('resource.spiritual_root.origin.v145.realm.'))
    .map(([id,value])=>({id,owned:inventoryBigInt(inventory,id).toString()}))
    .filter(row=>BigInt(row.owned)>0n);

  return {
    schema:SPIRITUAL_ROOT_HUNT_PACING_V161_SCHEMA,
    targetLevel:target,
    reachedLevel:Number(finalState.level),
    ascensions:Number(finalState.ascensions),
    expectedAscensions,
    currentMajorRealmIndex,
    maxOriginRealmTier:SPIRITUAL_ROOT_MAX_REALM_TIER_V145,
    includeFirstClear:Boolean(includeFirstClear),
    firstClearPolicy:includeFirstClear?'one first-clear Bản Nguyên credit when the model first enters each required realm tier':'no first-clear credit; virtual-Hunt pity only',
    zone:farmZone,
    batchKills:batch,
    originPityKills:SPIRITUAL_ROOT_VIRTUAL_ORIGIN_PITY_KILLS_V145,
    huntHardFloorSecondsPerKill:HUNT_VIRTUAL_FARM_MIN_SECONDS_PER_KILL_V77,
    huntMaxSecondsPerKill:HUNT_VIRTUAL_FARM_MAX_SECONDS_PER_KILL_V77,
    totalKills:counters.totalKills,
    virtualKills:counters.virtualKills,
    firstClearKills:counters.firstClearKills,
    virtualBatches:counters.virtualBatches,
    origins:{
      virtualGenerated:counters.virtualOrigins,
      firstClearGenerated:counters.firstClearOrigins,
      spent:counters.originSpent.toString(),
      expectedSpend:expectedOriginSpend.toString(),
      leftoverByTier:originInventory,
    },
    tendon:{
      generated:counters.tendonGenerated.toString(),
      spent:counters.tendonSpent.toString(),
      remaining:inventoryBigInt(inventory,SPIRITUAL_ROOT_TENDON_RESOURCE_V145).toString(),
    },
    cultivationBonusPct:round(spiritualRootCultivationTotalBonusPctV145(finalState),3),
    speedConversions:speedConversions(counters.totalKills),
    interpretation:'Production-authority farm simulation. Every virtual batch passes through settleSpiritualRootHuntV145; level spending uses nourishSpiritualRootV145 and each 100-Lv gate uses ascendSpiritualRootV145. Realm progression time itself is excluded; currentMajorRealmIndex only advances when the next Linh Căn gate requires that realm tier.',
  };
}

export function buildSpiritualRootHuntPacingAuditV161(){
  const rows=[];
  for(const targetLevel of V161_ROOT_TARGET_LEVELS){
    rows.push(simulateSpiritualRootHuntPacingV161(targetLevel,{includeFirstClear:false}));
    rows.push(simulateSpiritualRootHuntPacingV161(targetLevel,{includeFirstClear:true}));
  }
  return {
    schema:SPIRITUAL_ROOT_HUNT_PACING_V161_SCHEMA,
    targets:[...V161_ROOT_TARGET_LEVELS],
    originPityKills:SPIRITUAL_ROOT_VIRTUAL_ORIGIN_PITY_KILLS_V145,
    virtualBatchKills:V161_ROOT_VIRTUAL_BATCH_KILLS,
    speedScenarios:V161_ROOT_KILL_SPEED_SCENARIOS,
    rows,
    note:'The pity-only row is the conservative source envelope. The first-clear row gives exactly one production first-clear credit per realm tier entered; it does not assume a number of zones/bosses beyond that single credit.',
  };
}
