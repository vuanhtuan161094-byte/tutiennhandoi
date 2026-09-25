/**
 * V127 compatibility shell.
 *
 * Production Potential authority moved to reincarnation-progression-v1102 and is now five-axis.
 * Keep these legacy exports for old callers/tests, but delegate state mutation to the canonical
 * CL/TP/TPH/LL/TT implementation so this module cannot reintroduce three-axis truth.
 */
import {
  CORE_POTENTIAL_AXIS_VERSION_V5,
  cloneLifeCorePotentialState,
  corePotentialDefinitions,
  createLifeCorePotentialState,
  grantLifeCorePotential,
  spendLifeCorePotential,
} from './reincarnation-progression-v1102.js';

export const potentialAttributeDefinitions = corePotentialDefinitions.map(def => ({ ...def, perPoint:[...def.perPoint] }));

export function createPotentialState(){
  return { ...createLifeCorePotentialState(), legacyRetiredV127:true };
}
export function clonePotentialState(input){
  return { ...cloneLifeCorePotentialState(input), legacyRetiredV127:true };
}
export function potentialGainForBreakthrough(){ return 0; }
export function grantPotential(state,amount){
  return { ...grantLifeCorePotential(state,amount), legacyRetiredV127:true };
}
export function spendPotential(state,id,points=1){
  return { ...spendLifeCorePotential(state,id,points), legacyRetiredV127:true };
}
export function potentialCombatMultipliers(){ return {maxHp:1,maxSpirit:1,attack:1,defense:1,mobility:1,accuracy:1,critFlat:0,control:1,resolve:1,actionSpeed:1}; }
export function potentialCultivationMultipliers(){ return {absorption:1,throughput:1,refinement:1,meridianResilience:1,masteryGain:1}; }
export function retroactivePotentialForRealmPath(){ return 0; }
export function applyPotentialStats(stats){ return {...stats}; }

/**
 * Legacy V126 migration payload.
 * F policy is a full refund: lifetimeEarned is the sole budget authority and no old axis is auto-mapped.
 * The old scalar fields are retained as zero-valued compatibility keys for callers that still deserialize them.
 */
export function legacyPotentialMigrationPayloadV127(input){
  const lifetimeEarned=Math.max(0,Math.floor(Number(input?.lifetimeEarned)||0));
  return {
    axisVersion:CORE_POTENTIAL_AXIS_VERSION_V5,
    power:0,
    body:0,
    defense:0,
    agility:0,
    spirit:0,
    sense:0,
    refundedUnspent:lifetimeEarned,
    migratedTotal:lifetimeEarned,
  };
}
