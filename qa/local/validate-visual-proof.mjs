import fs from 'node:fs';
import path from 'node:path';

const args = new Map();
for (let i = 2; i < process.argv.length; i += 2) args.set(process.argv[i], process.argv[i + 1]);
const root = path.resolve(args.get('--root') || 'artifacts/ui-visual');

const mustFile = file => {
  const full = path.resolve(root, file);
  if (!fs.existsSync(full) || fs.statSync(full).size <= 0) throw new Error(`Missing visual proof: ${full}`);
  return full;
};
const readJson = file => JSON.parse(fs.readFileSync(mustFile(file), 'utf8'));

for (const file of [
  'home-hud-390x844.png',
  'home-hud-412x915.png',
  'character-baseline-390x844.png',
  'manifest.json',
]) mustFile(file);

const manifest = readJson('manifest.json');
if (manifest.mockOrReconstruction !== false || manifest.screens?.length !== 3) {
  throw new Error('Runtime visual manifest is not canonical real-runtime proof');
}

const targets = [
  ['', '390x844'],
  ['compact', '360x800'],
  ['portrait-412', '412x915'],
  ['portrait-430', '430x932'],
];

for (const [subdir, viewport] of targets) {
  const prefix = subdir ? `${subdir}/` : '';
  for (const file of [
    `combat-runtime-${viewport}.png`,
    `combat-runtime-stress-${viewport}.png`,
    `combat-runtime-action-${viewport}.png`,
    'combat-runtime-metrics.json',
    'combat-runtime-stress-metrics.json',
    `combat-showcase-${viewport}-metrics.json`,
    'combat-shake-metrics.json',
  ]) mustFile(`${prefix}${file}`);

  for (const scene of ['01-clean', '02-status-stress', '04-damage-stress', '06-full-chaos']) {
    mustFile(`${prefix}${scene}-${viewport}.png`);
  }
  mustFile(`${prefix}04-damage-stress-normal-${viewport}.png`);
  for (const skill of ['01', '02', '03', '04', '05', '06', '07']) {
    mustFile(`${prefix}03-skill-cast-${skill}-cast-${viewport}.png`);
    mustFile(`${prefix}03-skill-cast-${skill}-impact-${viewport}.png`);
  }
  for (const state of ['near-break', 'broken', 'recovery']) mustFile(`${prefix}05-boss-break-${state}-${viewport}.png`);
  for (const kind of ['light', 'heavy', 'critical', 'ultimate', 'boss']) {
    for (const phase of ['before', 'impact', 'peak', 'settled']) mustFile(`${prefix}screen-shake-${kind}-${phase}-${viewport}.png`);
  }

  const base = readJson(`${prefix}combat-runtime-metrics.json`);
  const layout = base.combatLayout || {};
  if (!base.hasCombat || !base.hasPlayerHud || !base.hasEnemyHud || !base.hasEnemyContext || base.hasHorizontalOverflow || base.skillCount !== 7 || base.visibleText?.length > 0 || layout.supportCount !== 3 || layout.supportYSpread > 14 || layout.playerHudTop >= 310) {
    throw new Error(`${viewport} combat layout/legibility failed`);
  }

  const stress = readJson(`${prefix}combat-runtime-stress-metrics.json`);
  const status = stress.statusStress || {};
  if (stress.hasHorizontalOverflow || status.player?.visible < 4 || status.enemy?.visible < 4 || !status.player?.more || !status.enemy?.more || !String(status.enemy?.mark || '').includes('6/6')) {
    throw new Error(`${viewport} status stress failed`);
  }

  const showcase = readJson(`${prefix}combat-showcase-${viewport}-metrics.json`);
  if (showcase.mockOrReconstruction !== false || showcase.scenes?.length !== 6 || showcase.skills?.length !== 7 || showcase.shake?.length !== 5) {
    throw new Error(`${viewport} showcase manifest incomplete`);
  }
  if (!showcase.shake.every(frame => frame.neutral && ['before', 'impact', 'peak', 'settled'].every(phase => frame[phase]?.file))) {
    throw new Error(`${viewport} shake frame manifest incomplete`);
  }
  if (!showcase.shake.every(frame => Math.max(
    Math.abs(frame.impact?.state?.cameraX || 0),
    Math.abs(frame.impact?.state?.cameraY || 0),
    Math.abs(frame.peak?.state?.cameraX || 0),
    Math.abs(frame.peak?.state?.cameraY || 0),
  ) > 0.05)) throw new Error(`${viewport} shake camera impulse missing`);

  console.log(`PASS · ${viewport} Combat visual proof · skills=${showcase.skills.length} · scenes=${showcase.scenes.length} · shake=${showcase.shake.length}`);
}

console.log(`LOCAL VISUAL PROOF PASS · ${root}`);
