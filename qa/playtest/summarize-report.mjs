import { appendFile, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const reportPath = resolve(process.argv[2] || 'artifacts/ai-playtest/playtest-report.json');
let report;
try {
  report = JSON.parse(await readFile(reportPath, 'utf8'));
} catch (error) {
  console.error(`AI PLAYTEST SUMMARY FAIL · report unavailable: ${reportPath}`);
  console.error(error?.message || error);
  process.exit(1);
}

if (report.schema !== 'tutien-ai-playtest.report.v1') {
  console.error(`AI PLAYTEST SUMMARY FAIL · unsupported report schema: ${report.schema}`);
  process.exit(1);
}
if (report.mockOrReconstruction !== false) {
  console.error('AI PLAYTEST SUMMARY FAIL · proof must come from the actual runtime');
  process.exit(1);
}
if (!Array.isArray(report.scenarios) || report.scenarios.length < 4) {
  console.error('AI PLAYTEST SUMMARY FAIL · expected at least four scenarios');
  process.exit(1);
}

const failures = [];
const rows = [];
for (const scenario of report.scenarios) {
  const consoleErrors = Array.isArray(scenario.consoleErrors) ? scenario.consoleErrors : [];
  const networkFailures = (Array.isArray(scenario.networkFailures) ? scenario.networkFailures : [])
    .filter(item => !(item?.type === 'loadingFailed' && item?.canceled === true));
  const snapshots = [scenario.before, scenario.after].filter(Boolean);
  const overflowCount = snapshots.filter(item => item.hasHorizontalOverflow).length;
  const missingImages = snapshots.flatMap(item => Array.isArray(item.missingImages) ? item.missingImages : []);

  if (scenario.status !== 'PASS') failures.push(`${scenario.id}: scenario status=${scenario.status}`);
  if (scenario.error) failures.push(`${scenario.id}: ${scenario.error}`);
  if (overflowCount) failures.push(`${scenario.id}: horizontal overflow detected`);
  if (missingImages.length) failures.push(`${scenario.id}: missing images=${missingImages.length}`);
  if (consoleErrors.length) failures.push(`${scenario.id}: console/runtime errors=${consoleErrors.length}`);
  if (networkFailures.length) failures.push(`${scenario.id}: network failures=${networkFailures.length}`);

  rows.push({
    id: scenario.id,
    status: scenario.status,
    screen: scenario.before?.screen || '-',
    interaction: scenario.interaction?.type || '-',
    overflow: overflowCount,
    missingImages: missingImages.length,
    consoleErrors: consoleErrors.length,
    networkFailures: networkFailures.length,
    screenshots: Array.isArray(scenario.screenshots) ? scenario.screenshots.length : 0,
  });
}

const sha = process.env.TUTIEN_PLAYTEST_SHA || process.env.GITHUB_SHA || null;
const summary = {
  schema: 'tutien-ai-playtest.health-summary.v1',
  generatedAt: new Date().toISOString(),
  candidateSha: sha,
  sourceMode: report.sourceMode,
  chromeVersion: report.chromeVersion,
  scenarioCount: rows.length,
  passCount: rows.filter(row => row.status === 'PASS').length,
  strictFailureCount: failures.length,
  rows,
  failures,
};
await writeFile(resolve(dirname(reportPath), 'health-summary.json'), JSON.stringify(summary, null, 2));

const markdown = [
  '## AI Browser Playtest',
  '',
  `Candidate: \`${sha || 'unknown'}\``,
  '',
  '| Scenario | Status | Screen | Interaction | Overflow | Missing images | Console | Network | Screenshots |',
  '| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: |',
  ...rows.map(row => `| ${row.id} | ${row.status} | ${row.screen} | ${row.interaction} | ${row.overflow} | ${row.missingImages} | ${row.consoleErrors} | ${row.networkFailures} | ${row.screenshots} |`),
  '',
  failures.length ? `**STRICT FAIL · ${failures.length} issue(s)**` : `**STRICT PASS · ${rows.length}/${rows.length} journeys healthy**`,
  ...(failures.length ? ['', ...failures.map(item => `- ${item}`)] : []),
  '',
  'This gate proves deterministic runtime health. It does not replace explicit user visual approval for UI/UX closure.',
  '',
].join('\n');

if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, markdown);
console.log(failures.length
  ? `AI PLAYTEST STRICT FAIL · scenarios=${rows.length} · issues=${failures.length}`
  : `AI PLAYTEST STRICT PASS · scenarios=${rows.length} · runtimeErrors=0 · networkFailures=0 · missingImages=0 · overflow=0`);

if (failures.length) {
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
