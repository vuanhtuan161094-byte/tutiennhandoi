import fs from 'node:fs';
{
 const p='qa/tests/v145-spiritual-root-runtime-test.js';
 let s=fs.readFileSync(p,'utf8');
 const old='majorRealmIndex:1,zone:1}';
 const n=s.split(old).length-1;
 if(n!==3) throw new Error('runtime realm context anchors expected 3 got '+n);
 s=s.replaceAll(old,'majorRealmIndex:1,currentMajorRealmIndex:1,zone:1}');
 fs.writeFileSync(p,s);
}
fs.writeFileSync('qa/tests/v145-spiritual-root-realm-origin-test.js', `import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as root from '../../dist/core/spiritual-root-v145.js';

assert.equal(root.SPIRITUAL_ROOT_MAX_REALM_TIER_V145, 28);
assert.equal(root.spiritualRootOriginResourceIdV145(1), 'resource.spiritual_root.origin.v145.realm.1');
assert.equal(root.spiritualRootOriginResourceIdV145(2), 'resource.spiritual_root.origin.v145.realm.2');
assert.equal(root.spiritualRootOriginTierForAscensionV145(100), 1);
assert.equal(root.spiritualRootOriginTierForAscensionV145(200), 2);
assert.equal(root.spiritualRootOriginTierForAscensionV145(2800), 28);
assert.equal(root.spiritualRootOriginTierForAscensionV145(1_000_000), 28);

// Exact 3:1 combine. High-tier pieces may be prepared early, but cannot bypass the character-realm gate.
const inv = {
  [root.spiritualRootOriginResourceIdV145(1)]: '9',
  [root.spiritualRootOriginResourceIdV145(2)]: '0',
  [root.SPIRITUAL_ROOT_TENDON_RESOURCE_V145]: '999999999999',
};
let combined = root.combineSpiritualRootOriginV145(inv, 1, 2);
assert.equal(combined.ratio, '3:1');
assert.equal(combined.spent, '6');
assert.equal(combined.gained, '2');
assert.equal(inv[root.spiritualRootOriginResourceIdV145(1)], '3');
assert.equal(inv[root.spiritualRootOriginResourceIdV145(2)], '2');
assert.throws(() => root.combineSpiritualRootOriginV145(inv, 28, 1));

const gate = root.createSpiritualRootStateV145(); gate.level=200; gate.ascensions=1;
assert.throws(() => root.ascendSpiritualRootV145(gate, inv, 1), /Cần lên đại cảnh bậc 2/);
const tier2Cost = root.spiritualRootOriginCostV145(200);
inv[root.spiritualRootOriginResourceIdV145(2)] = (tier2Cost + 10n).toString();
const ascended = root.ascendSpiritualRootV145(gate, inv, 2);
assert.equal(ascended.requiredRealmTier, 2);
assert.equal(ascended.originResourceId, root.spiritualRootOriginResourceIdV145(2));

// A realm's Bản Nguyên does not drop before the character reaches that realm.
const character = { spiritualRootV145: { ...root.createSpiritualRootStateV145(), legacyRefunded:true } };
const huntInv = {};
let locked = root.settleSpiritualRootHuntV145(character, huntInv, {kills:500,countForOriginMeter:true,majorRealmIndex:2,currentMajorRealmIndex:1,zone:1});
assert.equal(locked.originSourceUnlocked,false);
assert.equal(locked.origin,0);
assert.equal(BigInt(huntInv[root.spiritualRootOriginResourceIdV145(2)] ?? 0),0n);
let unlocked = root.settleSpiritualRootHuntV145(character, huntInv, {kills:500,countForOriginMeter:true,majorRealmIndex:2,currentMajorRealmIndex:2,zone:1});
assert.equal(unlocked.originSourceUnlocked,true);
assert.equal(unlocked.origin,1);
assert.equal(unlocked.originRealmTier,2);
assert.equal(BigInt(huntInv[root.spiritualRootOriginResourceIdV145(2)]),1n);
const boss = root.settleSpiritualRootHuntV145(character, huntInv, {kills:1,firstClear:true,countForOriginMeter:false,majorRealmIndex:3,currentMajorRealmIndex:3,zone:1});
assert.equal(boss.origin,1);
assert.equal(boss.originRealmTier,3);
assert.equal(BigInt(huntInv[root.spiritualRootOriginResourceIdV145(3)]),1n);

const session = fs.readFileSync('dist/core/session.js','utf8');
const gameplay = fs.readFileSync('dist/core/gameplay.js','utf8');
const api = fs.readFileSync('dist/core/game-api.js','utf8');
assert.ok(session.includes('currentMajorRealmIndex: majorRealmIndexForRealmOrder(this.stateValue.realm.maxRealmOrder)'));
assert.ok(session.includes('combineSpiritualRootOriginV145(fromRealmTier, batches = 1)'));
assert.ok(gameplay.includes('combineSpiritualRootOriginV145(fromRealmTier, batches = 1)'));
assert.ok(api.includes('combineSpiritualRootOriginV145(fromRealmTier, batches = 1)'));
console.log('V145 realm-gated Bản Nguyên + 3:1 combine PASS');
`);
console.log('V145 realm-origin tests staged');
