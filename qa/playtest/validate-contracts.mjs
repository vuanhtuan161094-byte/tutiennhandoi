import { access, readFile, readdir } from 'node:fs/promises';

const readJson = async path => JSON.parse(await readFile(path, 'utf8'));
const fail = message => { throw new Error(message); };
const exists = async path => { try { await access(path); return true; } catch { return false; } };

const agentContract = await readFile('AGENTS.md', 'utf8');
for (const clause of [
  '## 0. NON-NEGOTIABLE WORKFLOW LOCK',
  'No exact-SHA evidence = no completion claim.',
  'Game CI',
  'Runtime Smoke',
  'explicit user visual approval',
]) {
  if (!agentContract.includes(clause)) fail(`AGENTS workflow lock missing required clause: ${clause}`);
}

const workflowNames = (await readdir('.github/workflows')).filter(name => /\.ya?ml$/i.test(name)).sort();
const expectedWorkflows = ['ci.yml','runner-diagnostics.yml'];
if (JSON.stringify(workflowNames) !== JSON.stringify(expectedWorkflows)) {
  fail(`Workflow set must stay lean: expected ${expectedWorkflows.join(', ')}, got ${workflowNames.join(', ')}`);
}

const workflow = await readFile('.github/workflows/ci.yml', 'utf8');
for (const clause of [
  'node qa/runners/v140-backend-gates.js fast',
  'node qa/runners/v140-frontend-gates.js fast',
  'node qa/playtest/run-scenarios.mjs',
  'node qa/runners/v140-backend-gates.js closure',
  'node qa/runners/v140-frontend-gates.js closure',
  'runtime-smoke-${{ github.sha }}',
  "contains(github.event.head_commit.message, '[closure]')",
]) {
  if (!workflow.includes(clause)) fail(`Game CI missing required clause: ${clause}`);
}
if (workflow.includes('capture-combat-runtime.mjs') || workflow.includes('capture-runtime-ui.mjs')) {
  fail('Normal Game CI must not run the heavyweight visual showcase');
}

const scenarios = await readJson('qa/playtest/scenarios.json');
if (scenarios.schema !== 'tutien-ai-playtest.scenarios.v1') fail('Unexpected playtest scenario schema');
if (!Array.isArray(scenarios.scenarios) || scenarios.scenarios.length !== 4) fail('Runtime smoke must stay at four representative journeys');
const ids = new Set();
for (const scenario of scenarios.scenarios) {
  if (!scenario.id || ids.has(scenario.id)) fail(`Invalid/duplicate scenario id: ${scenario.id}`);
  ids.add(scenario.id);
  if (!scenario.tab || !scenario.expectedScreen) fail(`${scenario.id}: tab/expectedScreen required`);
  if (!Array.isArray(scenario.requiredSelectors) || !scenario.requiredSelectors.length) fail(`${scenario.id}: requiredSelectors required`);
}
for (const id of ['home-navigation','character-equipment','combat-action','save-restore-smoke']) {
  if (!ids.has(id)) fail(`Required representative runtime journey missing: ${id}`);
}

const registry = await readJson('assets/_pipeline/registry.json');
if (registry.schema !== 'tutien-asset-pipeline.registry.v2') fail('Unexpected asset registry schema');
if (!Array.isArray(registry.assets)) fail('Asset registry assets[] required');
const allowed = new Set(['draft','candidate','approved','integrated','locked','retired']);
const assetIds = new Set();
const productionPaths = new Set();
for (const asset of registry.assets) {
  if (!asset.id || assetIds.has(asset.id)) fail(`Invalid/duplicate asset id: ${asset.id || '<missing id>'}`);
  assetIds.add(asset.id);
  if (!allowed.has(asset.status)) fail(`${asset.id}: invalid status ${asset.status}`);
  if (!asset.briefPath || !String(asset.briefPath).startsWith('assets/_pipeline/briefs/') || !String(asset.briefPath).endsWith('.json')) {
    fail(`${asset.id}: briefPath under assets/_pipeline/briefs/*.json required`);
  }
  if (!(await exists(asset.briefPath))) fail(`${asset.id}: brief not found at ${asset.briefPath}`);
  const brief = await readJson(asset.briefPath);
  if (brief.schema !== 'tutien-asset-brief.v2') fail(`${asset.id}: unexpected brief schema`);
  if (brief.id !== asset.id) fail(`${asset.id}: registry/brief id mismatch`);
  if (brief.status !== asset.status) fail(`${asset.id}: registry/brief status mismatch`);
  if (!Array.isArray(brief.acceptance) || !brief.acceptance.length) fail(`${asset.id}: acceptance criteria required`);

  const candidates = Array.isArray(brief.candidateRefs) ? brief.candidateRefs : [];
  if (['candidate','approved','integrated','locked'].includes(asset.status) && candidates.length < 1) {
    fail(`${asset.id}: ${asset.status} requires candidateRefs`);
  }
  if (['approved','integrated','locked'].includes(asset.status)) {
    if (!brief.approvedByUser) fail(`${asset.id}: ${asset.status} requires approvedByUser=true`);
    if (!brief.selectedCandidateRef || !candidates.includes(brief.selectedCandidateRef)) {
      fail(`${asset.id}: selectedCandidateRef must reference one of candidateRefs`);
    }
    if (!brief.approvalNote) fail(`${asset.id}: approvalNote required after user approval`);
  }
  if (['integrated','locked'].includes(asset.status)) {
    if (!brief.productionPath) fail(`${asset.id}: ${asset.status} requires productionPath`);
    if (!(await exists(brief.productionPath))) fail(`${asset.id}: productionPath not found: ${brief.productionPath}`);
    if (productionPaths.has(brief.productionPath)) fail(`${asset.id}: duplicate productionPath ${brief.productionPath}`);
    productionPaths.add(brief.productionPath);
  }
  if (asset.status === 'locked') {
    if (!/^[0-9a-f]{40}$/i.test(String(brief.runtimeProofSha || ''))) fail(`${asset.id}: locked requires runtimeProofSha`);
    if (!String(brief.runtimeProofRunId || '').trim()) fail(`${asset.id}: locked requires runtimeProofRunId`);
  }
}

const schema = await readJson('assets/_pipeline/brief.schema.json');
if (schema.$id !== 'tutien-asset-brief.v2') fail('Unexpected asset brief schema id');
console.log(`RUNTIME PIPELINE CONTRACT PASS · workflows=${workflowNames.length} · scenarios=${scenarios.scenarios.length} · assets=${registry.assets.length}`);
