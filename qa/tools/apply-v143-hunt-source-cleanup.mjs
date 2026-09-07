import { readFile, writeFile } from 'node:fs/promises';

const SESSION = new URL('../../dist/core/session.js', import.meta.url);
let source = await readFile(SESSION, 'utf8');

function requireOnce(label, needle) {
  const first = source.indexOf(needle);
  if (first < 0) throw new Error(`[v143 hunt cleanup] missing ${label}`);
  if (source.indexOf(needle, first + needle.length) >= 0) throw new Error(`[v143 hunt cleanup] duplicate ${label}`);
  return first;
}
function replaceOnce(label, needle, replacement) {
  requireOnce(label, needle);
  source = source.replace(needle, replacement);
}

// V143 authority: system-specific progression resources belong to their dedicated dungeons.
// Hunt keeps broad economy, pills, ranked equipment fragments, rare true-blood, and Linh Căn rewards.
replaceOnce(
  'legacy Hunt reward locals',
  ', learnedTechniqueId, learnedTechniqueName, bloodlineEssenceDrops = 0, bodyEssenceDrops = 0, bloodlineProtectionDrops = 0, trueBloodDropId, equipmentDropId, equipmentDropName, jackpotHit = false, jackpotChancePctApplied = 0;',
  ', learnedTechniqueId, learnedTechniqueName, trueBloodDropId, equipmentDropId, equipmentDropName, jackpotHit = false, jackpotChancePctApplied = 0;',
);
replaceOnce('special equipment drop accumulator', '        const specialEquipmentDrops = [];\n', '');

const duplicatedStart = "            if (result.monster.grade === 'boss' && rng.chance(Math.min(55, (12 + map.zone * 4) * farmReward.multiplier))) {";
const trueBloodStart = "            if (result.monster.grade === 'boss' && rng.chance(Math.min(12, (1 + map.zone * 1.15) * farmReward.multiplier))) {";
const start = requireOnce('duplicated system-resource reward block start', duplicatedStart);
const end = requireOnce('rare true-blood Hunt block', trueBloodStart);
if (end <= start) throw new Error('[v143 hunt cleanup] invalid source ordering');
source = source.slice(0, start) + source.slice(end);

for (const [label, needle] of [
  ['event special equipment text', "${specialEquipmentDrops.length ? `, tài nguyên ${specialEquipmentDrops.join(' + ')}` : ''}"],
  ['event bloodline essence text', "${bloodlineEssenceDrops ? `, Huyết Tinh +${bloodlineEssenceDrops}` : ''}"],
  ['event body essence text', "${bodyEssenceDrops ? `, Thể Phách Tinh Hoa +${bodyEssenceDrops}` : ''}"],
  ['event bloodline protection text', "${bloodlineProtectionDrops ? `, Hộ Huyết Phù +${bloodlineProtectionDrops}` : ''}"],
]) replaceOnce(label, needle, '');

replaceOnce(
  'summary special equipment line',
  "...(specialEquipmentDrops.length ? [`Tài nguyên cường hóa: ${specialEquipmentDrops.join(' + ')}.`] : []), ",
  '',
);

const originSummaryStart = '...((bloodlineEssenceDrops || bodyEssenceDrops || bloodlineProtectionDrops || trueBloodDropId) ? [';
const originStart = requireOnce('legacy Hunt origin summary', originSummaryStart);
const originEndMarker = '] : []), ...(techniqueFragmentDrops ?';
const originEnd = source.indexOf(originEndMarker, originStart);
if (originEnd < 0) throw new Error('[v143 hunt cleanup] missing Hunt origin summary end');
source = source.slice(0, originStart)
  + "...(trueBloodDropId ? [`Căn nguyên hiếm: Bản Mệnh Tinh Huyết +1.`] : []), ...(techniqueFragmentDrops ?"
  + source.slice(originEnd + originEndMarker.length);

// Hard source-level closure: the fight method must no longer mint resources owned by specialized dungeons.
const fightStart = source.indexOf('    fightEndlessFloor(options = {}) {');
const fightEnd = source.indexOf('    equipmentCombatImpact(itemId) {', fightStart);
if (fightStart < 0 || fightEnd < 0) throw new Error('[v143 hunt cleanup] cannot isolate fightEndlessFloor');
const fight = source.slice(fightStart, fightEnd);
const forbidden = [
  'resource.enhancement_protection_talisman',
  'resource.enhancement_transfer_gem',
  'BLOODLINE_ESSENCE_RESOURCE_ID',
  'BODY_ESSENCE_RESOURCE_ID',
  'BLOODLINE_PROTECTION_RESOURCE_ID',
  'specialEquipmentDrops',
  'bloodlineEssenceDrops',
  'bodyEssenceDrops',
  'bloodlineProtectionDrops',
];
for (const token of forbidden) {
  if (fight.includes(token)) throw new Error(`[v143 hunt cleanup] forbidden Hunt reward survived: ${token}`);
}
for (const required of ['trueBloodResourceId', 'rootQualityMaterialDropsFromHuntV131', 'settleRealHuntEquipmentFragmentsV142']) {
  if (!fight.includes(required)) throw new Error(`[v143 hunt cleanup] intentional Hunt reward lost: ${required}`);
}

await writeFile(SESSION, source, 'utf8');
console.log('V143 Hunt source cleanup applied');
