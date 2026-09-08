import fs from 'node:fs';
fs.writeFileSync('qa/tests/v145-spiritual-root-runtime-test.js', `import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as root from '../../dist/core/spiritual-root-v145.js';

const legacyCharacter = { buildFoundation: { roots: {
  metal:{level:300,knownOriginIds:['origin.metal.geng','origin.metal.xin']},
  wood:{level:200,knownOriginIds:['origin.wood.azure']}, water:{level:100,knownOriginIds:[]}, fire:{level:50,knownOriginIds:[]}, earth:{level:10,knownOriginIds:[]},
} } };
const inventory = {
  'resource.root.metal.quality.spirit': 3,
  'resource.root.wood.quality.spirit': '2',
  [root.SPIRITUAL_ROOT_TENDON_RESOURCE_V145]:'0',
  [root.SPIRITUAL_ROOT_ORIGIN_RESOURCE_V145]:'0',
};
const migration = root.settleLegacySpiritualRootMigrationV145(legacyCharacter, inventory);
assert.equal(migration.state.legacyRefunded, true);
assert.equal(inventory['resource.root.metal.quality.spirit'], '0');
assert.equal(inventory['resource.root.wood.quality.spirit'], '0');
assert.equal(migration.refundedTendon, '2500');
assert.equal(migration.refundedOrigin, '3');
const second = root.settleLegacySpiritualRootMigrationV145(legacyCharacter, inventory);
assert.equal(second.refundedTendon, '0');
assert.equal(second.refundedOrigin, '0');

const beforeTendon = BigInt(inventory[root.SPIRITUAL_ROOT_TENDON_RESOURCE_V145]);
let virtual = root.settleSpiritualRootHuntV145(legacyCharacter, inventory, {kills:499,countForOriginMeter:true,majorRealmIndex:1,zone:1});
assert.equal(virtual.origin,0); assert.equal(virtual.originProgress,499); assert.ok(BigInt(virtual.tendon)>0n);
virtual = root.settleSpiritualRootHuntV145(legacyCharacter, inventory, {kills:1,countForOriginMeter:true,majorRealmIndex:1,zone:1});
assert.equal(virtual.origin,1); assert.equal(virtual.originProgress,0);
assert.ok(BigInt(inventory[root.SPIRITUAL_ROOT_TENDON_RESOURCE_V145]) > beforeTendon);
const originBefore = BigInt(inventory[root.SPIRITUAL_ROOT_ORIGIN_RESOURCE_V145]);
const boss = root.settleSpiritualRootHuntV145(legacyCharacter, inventory, {kills:1,firstClear:true,countForOriginMeter:false,majorRealmIndex:1,zone:1});
assert.equal(boss.origin,1); assert.equal(BigInt(inventory[root.SPIRITUAL_ROOT_ORIGIN_RESOURCE_V145]), originBefore+1n);

const session = fs.readFileSync('dist/core/session.js','utf8');
const gameplay = fs.readFileSync('dist/core/gameplay.js','utf8');
const api = fs.readFileSync('dist/core/game-api.js','utf8');
for (const token of ['rootQualityMaterialDropsFromHuntV131','rollTargetRootOriginV131','setRootFocusStateV131','setRootOriginTargetStateV131','breakthroughRootQualityV131']) assert.ok(!session.includes(token), 'session still owns V131: '+token);
for (const token of ['spiritualRootsV131','setRootFocusV131','setRootOriginTargetV131','activateRootOriginV131','breakthroughRootQualityV131']) {
  assert.ok(!gameplay.includes(token), 'gameplay still exposes V131: '+token);
  assert.ok(!api.includes(token), 'api still exposes V131: '+token);
}
for (const token of ['getSpiritualRootV145','nourishSpiritualRootV145','ascendSpiritualRootV145','allocateSpiritualRootMeridianV145','chooseSpiritualRootInsightV145']) assert.ok(api.includes(token), 'missing V145 API '+token);
assert.ok(session.includes('settleSpiritualRootHuntV145'), 'Hunt source not wired');
assert.ok(session.includes('countForOriginMeter: true'), 'virtual Hunt pity source missing');
assert.ok(session.includes('firstClear: Boolean(result.bossCleared)'), 'Boss first-clear origin source missing');
console.log('V145 Spiritual Root runtime/source-sink PASS');
`);
console.log('V145 pass2 runtime test written');
