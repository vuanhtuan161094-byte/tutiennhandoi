/** V127 compatibility shell. Canonical Potential lives in character.corePotential and has exactly three axes. */
export const potentialAttributeDefinitions = [
  { id:'power', name:'Công Lực', description:'Tăng trực tiếp Công Lực gốc.', perPoint:['Công Lực +1'] },
  { id:'body', name:'Thể Phách', description:'Tăng trực tiếp Thể Phách gốc.', perPoint:['Thể Phách +1','Sinh Mệnh chuẩn +20'] },
  { id:'defense', name:'Phòng Ngự', description:'Tăng trực tiếp Phòng Ngự gốc.', perPoint:['Phòng Ngự +3'] },
];
const ids=potentialAttributeDefinitions.map(x=>x.id);
export function createPotentialState(){ return {unspent:0,lifetimeEarned:0,allocations:{power:0,body:0,defense:0},legacyRetiredV127:true}; }
export function clonePotentialState(input){
  const out=createPotentialState(),a=input?.allocations??{};
  for(const id of ids) out.allocations[id]=Math.max(0,Math.floor(Number(a[id])||0));
  // Unknown V126 axes are not silently mapped; they are refunded during schema-44 migration in Session.restore.
  const spent=out.allocations.power+out.allocations.body+out.allocations.defense;
  out.lifetimeEarned=Math.max(spent,Math.floor(Number(input?.lifetimeEarned)||0));
  out.unspent=Math.max(0,Math.floor(Number(input?.unspent)||Math.max(0,out.lifetimeEarned-spent)));
  return out;
}
export function potentialGainForBreakthrough(){ return 0; }
export function grantPotential(state,amount){ const s=clonePotentialState(state),gain=Math.max(0,Math.floor(Number(amount)||0));s.unspent+=gain;s.lifetimeEarned+=gain;return s; }
export function spendPotential(state,id,points=1){ if(!ids.includes(id))throw new Error('Thuộc tính Tiềm Năng không hợp lệ.');const s=clonePotentialState(state),n=Math.max(1,Math.floor(points));if(s.unspent<n)throw new Error(`Không đủ Điểm Tiềm Năng: cần ${n}, hiện có ${s.unspent}.`);s.unspent-=n;s.allocations[id]+=n;return s; }
export function potentialCombatMultipliers(){ return {maxHp:1,maxSpirit:1,attack:1,defense:1,mobility:1,accuracy:1,critFlat:0,control:1,resolve:1,actionSpeed:1}; }
export function potentialCultivationMultipliers(){ return {absorption:1,throughput:1,refinement:1,meridianResilience:1,masteryGain:1}; }
export function retroactivePotentialForRealmPath(){ return 0; }
export function applyPotentialStats(stats){ return {...stats}; }
/** Returns the legacy V126 points that must be migrated/refunded into the canonical three-axis pool exactly once. */
export function legacyPotentialMigrationPayloadV127(input){
  const a=input?.allocations??{};
  const power=Math.max(0,Math.floor(Number(a.power)||0)),body=Math.max(0,Math.floor(Number(a.body)||0));
  const retired=['qiSea','insight','spiritSense','agility'].reduce((sum,k)=>sum+Math.max(0,Math.floor(Number(a[k])||0)),0);
  const unspent=Math.max(0,Math.floor(Number(input?.unspent)||0));
  return { power, body, defense:0, refundedUnspent:unspent+retired, migratedTotal:power+body+retired+unspent };
}
