import fs from 'node:fs';
function mustReplace(s,a,b,label,expected=1){const n=s.split(a).length-1;if(n!==expected)throw new Error(`${label}: expected ${expected} got ${n}`);return s.replaceAll(a,b)}

// Every mutation response must report realm-aware Bản Nguyên state, not default to locked realm 0.
{
 const p='dist/core/session.js'; let s=fs.readFileSync(p,'utf8');
 s=mustReplace(s,"spiritualRootSummaryV145(result.state, this.stateValue.inventory)","spiritualRootSummaryV145(result.state, this.stateValue.inventory, majorRealmIndexForRealmOrder(this.stateValue.realm.maxRealmOrder))",'mutation result summaries',2);
 s=mustReplace(s,"return spiritualRootSummaryV145(state, this.stateValue.inventory);","return spiritualRootSummaryV145(state, this.stateValue.inventory, majorRealmIndexForRealmOrder(this.stateValue.realm.maxRealmOrder));",'allocate summary',1);
 fs.writeFileSync(p,s);
}

// Final player-experience read path must consume V145 directly; no compatibility wrapper keeps V131 alive.
{
 const p='dist/core/gameplay.js'; let s=fs.readFileSync(p,'utf8');
 s=mustReplace(s,"        const roots = this.session.spiritualRootSummaryV131();","        const roots = this.session.spiritualRootSummaryV145();",'playerExperience root read');
 fs.writeFileSync(p,s);
}

// V143 regression must guard the replacement authority, not require the retired elemental V131 lane.
{
 const p='qa/tests/v143-hunt-reward-authority-test.js'; let s=fs.readFileSync(p,'utf8');
 s=mustReplace(s,"  'battleDaoTechniqueFragmentTargetsV125',\n]) {","  'battleDaoTechniqueFragmentTargetsV125',\n  'rootQualityMaterialDropsFromHuntV131',\n  'rollTargetRootOriginV131',\n]) {",'retired root lane assertions');
 s=mustReplace(s,"  'trueBloodResourceId',\n  'rootQualityMaterialDropsFromHuntV131',","  'trueBloodResourceId',\n  'settleSpiritualRootHuntV145',",'intentional V145 hunt authority');
 s=s.replace('// Intentional Hunt lanes stay live until their replacement/source authority is explicitly closed.','// Intentional Hunt lanes stay live; V145 replaces the retired elemental Linh Căn reward authority.');
 fs.writeFileSync(p,s);
}
console.log('V145 regression authority aligned');
