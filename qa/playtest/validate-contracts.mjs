import { readFile } from 'node:fs/promises';

const readJson = async path => JSON.parse(await readFile(path, 'utf8'));
const fail = message => { throw new Error(message); };

const scenarios = await readJson('qa/playtest/scenarios.json');
if (scenarios.schema !== 'tutien-ai-playtest.scenarios.v1') fail('Unexpected playtest scenario schema');
if (!Array.isArray(scenarios.scenarios) || scenarios.scenarios.length < 4) fail('Expected at least four playtest scenarios');
const ids = new Set();
for (const scenario of scenarios.scenarios) {
  if (!scenario.id || ids.has(scenario.id)) fail(`Invalid/duplicate scenario id: ${scenario.id}`);
  ids.add(scenario.id);
  if (!scenario.tab || !scenario.expectedScreen) fail(`${scenario.id}: tab/expectedScreen required`);
  if (!Array.isArray(scenario.requiredSelectors) || !scenario.requiredSelectors.length) fail(`${scenario.id}: requiredSelectors required`);
}

const registry = await readJson('assets/_pipeline/registry.json');
if (registry.schema !== 'tutien-asset-pipeline.registry.v1') fail('Unexpected asset registry schema');
if (!Array.isArray(registry.assets)) fail('Asset registry assets[] required');
const allowed = new Set(['draft','candidate','approved','integrated','locked','retired']);
for (const asset of registry.assets) {
  if (!asset.id || !allowed.has(asset.status)) fail(`Invalid asset registry entry: ${asset.id || '<missing id>'}`);
  if (['approved','integrated','locked'].includes(asset.status) && !asset.approvedByUser) {
    fail(`${asset.id}: ${asset.status} requires approvedByUser=true`);
  }
}

const schema = await readJson('assets/_pipeline/brief.schema.json');
if (schema.$id !== 'tutien-asset-brief.v1') fail('Unexpected asset brief schema');
console.log(`AI PIPELINE CONTRACT PASS · scenarios=${scenarios.scenarios.length} · assets=${registry.assets.length}`);
