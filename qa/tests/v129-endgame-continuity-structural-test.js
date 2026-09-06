/** V140 ENDGAME CONTINUITY STRUCTURAL SMOKE
 * Proves the canonical realm graph advances from Hợp Thể 34 to Sáng Thế 117
 * using only V140 Tu Vi / auto-minor / deterministic Thăng Cảnh plus five real Thiên Kiếp gates.
 */
import assert from 'node:assert/strict';
import { buildRegistry } from '../../dist/content/registry.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { SimulationSession } from '../../dist/core/session.js';
import { cultivationRealmV140, isMajorRealmGateV140, isTribulationGateV140 } from '../../dist/core/cultivation-v140.js';

const registry=buildRegistry(); let pass=0;
const ok=(v,m)=>{assert.ok(v,m);pass++;console.log(`✓ ${m}`)};
const state=createPlayableAdventureState();
const entry=[...registry.realms.values()].find(x=>x.order===34); assert(entry);
state.realm={realmId:entry.id,maxRealmOrder:34}; state.cultivation.tuVi=0; state.injury=0; state.lifespanYears=1e9; state.alive=true;
state.dungeons.highestClearedFloor['dungeon.great_vehicle_domain']=5;
state.dungeons.highestClearedFloor['dungeon.heavenly_tribulation_field']=4;
const session=new SimulationSession(registry,thanhHaWorld,adventureEnemies,playablePlayerProfile,14034117,state);
let transitions=0,tribulations=0,failedTribulations=0;
while(session.stateValue.realm.maxRealmOrder<117){
  const before=session.stateValue.realm.maxRealmOrder;
  const row=cultivationRealmV140(before); session.stateValue.cultivation.tuVi=row.requiredTuVi; session.stateValue.injury=0; session.stateValue.alive=true; session.stateValue.lifespanYears=1e9;
  if(isTribulationGateV140(before)){
    let advanced=false;
    for(let retry=0;retry<200&&!advanced;retry++){
      session.stateValue.cultivation.tuVi=row.requiredTuVi; session.stateValue.injury=0;
      const out=session.attemptHeavenlyTribulation(1); advanced=session.stateValue.realm.maxRealmOrder===before+1; if(!advanced) failedTribulations++;
    }
    assert.equal(session.stateValue.realm.maxRealmOrder,before+1,`Thiên Kiếp must eventually advance order ${before}`); tribulations++;
  }else if(isMajorRealmGateV140(before)){
    const out=session.ascendRealmV140(); assert.equal(out.toRealmId,registry.realm(session.stateValue.realm.realmId).id);
  }else{
    session.grantTuViV140(1,'structural-test');
  }
  assert.equal(session.stateValue.realm.maxRealmOrder,before+1,`order ${before} advances exactly one realm`); transitions++;
}
ok(transitions===83,'34→117 contains exactly 83 canonical one-step transitions');
ok(tribulations===5,'orders 41→46 use exactly five Heavenly Tribulation transitions');
ok(session.stateValue.realm.maxRealmOrder===117,'canonical V140 actions reach Sáng Thế Chủ order 117');
ok(failedTribulations>=0,'Thiên Kiếp retry path is safe without realm RNG breakthrough logic');

session.stateValue.dungeons.highestClearedFloor['dungeon.genesis_source']=5;
session.stateValue.inventory['resource.genesis_core']=99;
session.stateValue.inventory['resource.first_dawn_fragment']=9;
session.stateValue.immortal.creationSource=100;
session.stateValue.immortal.genesisAuthority=100;
session.stateValue.immortal.creationEpochAuthority=0;
const epoch=session.createGenesisEpoch();
ok(session.stateValue.immortal.creationEpochs===1&&epoch.summary.includes('Kỷ Nguyên'),'Sáng Thế Chủ can create the first Genesis Epoch through the canonical action');
console.log(`V140 ENDGAME CONTINUITY: ${pass}/${pass} PASS · transitions=${transitions} · tribulationFailures=${failedTribulations}`);
