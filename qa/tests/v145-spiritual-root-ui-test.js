import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as root from '../../dist/core/spiritual-root-v145.js';

const inventory={
  [root.SPIRITUAL_ROOT_TENDON_RESOURCE_V145]:'999999',
  [root.spiritualRootOriginResourceIdV145(1)]:'6',
  [root.spiritualRootOriginResourceIdV145(2)]:'1',
};
const state=root.createSpiritualRootStateV145();
const summary=root.spiritualRootSummaryV145(state,inventory,1);
assert.equal(summary.schema,'spiritual-root.v145');
assert.deepEqual(summary.meridianPointsSpent,{gathering:0,battle:0,body:0,spirit:0});
assert.ok(summary.meridianBonuses && typeof summary.meridianBonuses==='object');
assert.equal(summary.originTiers.length,28);
assert.equal(summary.originTiers[0].owned,'6');
assert.equal(summary.originTiers[0].naturalDropUnlocked,true);
assert.equal(summary.originTiers[1].naturalDropUnlocked,false);

const client=fs.readFileSync('dist/core/client-shell.js','utf8');
assert.ok(client.includes("roots: (api) => ({ spiritualRoot: api.getSpiritualRootV145() })"),'roots patch must expose singular V145 authority');
assert.ok(client.includes('character: api.getCharacter(), spiritualRoot: api.getSpiritualRootV145()'),'character sheet must receive V145 authority');
assert.ok(!client.includes('spiritualRoots: api.getSpiritualRootV145()'),'plural compatibility field survived');
assert.ok(!client.includes("roots: (api) => ({ character: api.getCharacterRootV129()"),'roots view still fetches legacy character root');

const runtime=fs.readFileSync('standalone-runtime.js','utf8');
for(const token of ['spiritualRootNourishV145','spiritualRootAscendV145','spiritualRootMeridianV145','spiritualRootInsightV145','spiritualRootCombineOriginV145']) assert.ok(runtime.includes(`case'${token}'`),`missing runtime action ${token}`);
for(const token of ['rootFocusV131','rootOriginTargetV131','rootOriginActivateV131','rootQualityBreakthroughV131','elementSealV133']) assert.ok(!runtime.includes(`case'${token}'`),`retired runtime action survived ${token}`);

const app=fs.readFileSync('app.js','utf8');
for(const token of ['data-root-nourish','data-root-ascend','data-root-meridian','data-root-insight','data-root-combine']) assert.ok(app.includes(token),`missing V145 UI control ${token}`);
for(const token of ['rootFocusV131','rootOriginTargetV131','rootOriginActivateV131','rootQualityBreakthroughV131','data-element-seal','model.spiritualRoots']) assert.ok(!app.includes(token),`retired Linh Căn UI survived ${token}`);
assert.ok(app.includes('Một Linh Căn duy nhất, tiến cấp vô hạn'),'single-root product contract missing');
assert.ok(app.includes('ghép chính xác 3:1'),'3:1 combine UI missing');
assert.ok(app.includes('không thể vượt gate cảnh giới'),'realm-gate explanation missing');
assert.ok(app.includes("model.spiritualRoot?.grade?.name"),'character hero does not use V145 root');

console.log('V145 Spiritual Root UI/transport PASS');
