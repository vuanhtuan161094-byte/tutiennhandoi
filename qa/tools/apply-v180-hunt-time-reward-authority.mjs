import fs from 'node:fs';

const file = 'dist/core/session.js';
let source = fs.readFileSync(file, 'utf8');

const fail = message => { throw new Error(`[V180 migration] ${message}`); };
const once = (text, needle, label) => {
  const first = text.indexOf(needle);
  if (first < 0) fail(`missing ${label}`);
  if (text.indexOf(needle, first + needle.length) >= 0) fail(`ambiguous ${label}`);
  return first;
};

const fightStart = once(source, '    fightEndlessFloor(options = {}) {', 'fightEndlessFloor start');
const fightEnd = source.indexOf('    equipmentCombatImpact(itemId) {', fightStart);
if (fightEnd <= fightStart) fail('fightEndlessFloor end');
let fight = source.slice(fightStart, fightEnd);

const rewardStart = fight.indexOf('        const mapRewards = realmMapRewardProfile(');
const rewardEnd = fight.indexOf('        recordHuntEconomyTelemetry', rewardStart);
if (rewardStart < 0 || rewardEnd <= rewardStart) fail('direct reward block');
const progressionOnly = `        // V180: Boss thật chỉ là progression gate. Mọi tài nguyên Hunt được kết toán\n        // qua Săn Ảo theo thời gian; trận Boss không mint loot/economy/first-clear reward.\n        if (result.won) {\n            cultivationGain = 0;\n            if (fateEvent.injuryDelta > 0)\n                this.stateValue.injury = Math.min(100, this.stateValue.injury + fateEvent.injuryDelta);\n            fateNotes.push(...fateOnHuntResult(this.currentLifeValue.birth.originsV101?.fate, fateRuntime, true, result.monster.grade === 'elite' || result.monster.grade === 'boss'));\n            recordActiveArtifactBattle(this.stateValue.artifacts, true, this.stateValue.worldTimeYears, result.monster.name);\n        }\n        else {\n            this.stateValue.injury = Math.min(100, this.stateValue.injury + result.injuryGain + fateEvent.injuryDelta);\n            fateNotes.push(...fateOnHuntResult(this.currentLifeValue.birth.originsV101?.fate, fateRuntime, false, result.monster.grade === 'elite' || result.monster.grade === 'boss'));\n            recordActiveArtifactBattle(this.stateValue.artifacts, false, this.stateValue.worldTimeYears, result.monster.name);\n        }\n`;
fight = fight.slice(0, rewardStart) + progressionOnly + fight.slice(rewardEnd);

const eventStart = fight.indexOf('        const event = { id: `endless.hunt.');
const awardsStart = fight.indexOf('        const economyAwards =', eventStart);
if (eventStart < 0 || awardsStart <= eventStart) fail('event/awards block');
const eventOnly = `        const farmOpenedText = result.bossCleared ? \`; bãi Săn Ảo tầng \${map.zoneFloor} đã mở\` : '';\n        const event = { id: \`endless.hunt.\${seed}.\${result.monster.floor}.\${result.monster.grade}\`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: result.won ? 'combat' : 'injury', significance, message: result.won ? \`\${result.monster.gradeName} · \${map.zoneName} tầng \${map.zoneFloor}: hạ \${result.monster.name}\${openedText}\${farmOpenedText}.\${fateNotes.length ? \` \${fateNotes.join(' ')}\` : ''}\` : \`Thất bại trước \${result.monster.name} · \${map.zoneName} tầng \${map.zoneFloor}; thương thế +\${result.injuryGain}.\${fateNotes.length ? \` \${fateNotes.join(' ')}\` : ''}\`, locationId: this.stateValue.locationId, tags: ['EndlessHunt', result.won ? 'Victory' : 'Defeat', result.monster.grade, map.zoneGradeId, ...result.monster.elements.map(x => \`Element:\${x}\`), ...(result.bossCleared ? ['FloorBoss', 'FirstClear', 'FirstClearLike'] : [])], data: { floor: result.monster.floor, localFloor: map.localFloor, zoneFloor: map.zoneFloor, zone: map.zone, majorRealmIndex: map.majorRealmIndex, grade: result.monster.grade, monsterName: result.monster.name, playerPowerLog10: result.playerPowerLog10, enemyPowerLog10: result.enemyPowerLog10, powerRatio: result.powerRatio, cultivationGain: 0, spiritStones: 0, equipmentDropId: '', economyMaterialDropsJson: '{}', economyRareDropsJson: '{}', bossCleared: result.bossCleared, unlockedFloor: result.unlockedFloor ?? 0, trainingPowerLogGain: result.trainingPowerLogGain, farmRewardEfficiencyPct: farmReward.pct, bossMechanicId: bossMechanic?.id ?? '', bossMechanicCoveragePct: bossMechanic?.coveragePct ?? 0, skillPracticeXp: skillPractice.reduce((a, x) => a + x.xpGain, 0), spiritualRootRewardsV145Json: '{}' } };\n`;
fight = fight.slice(0, eventStart) + eventOnly + fight.slice(awardsStart);

const awardsNow = fight.indexOf('        const economyAwards =');
const historyStart = fight.indexOf('        if (options.recordHistory !== false)', awardsNow);
if (awardsNow < 0 || historyStart <= awardsNow) fail('economyAwards span');
fight = fight.slice(0, awardsNow) + '        const economyAwards = [];\n' + fight.slice(historyStart);

const summaryStart = fight.indexOf('        const bossRetryLine =');
const returnStart = fight.indexOf('        return { seed, won:', summaryStart);
if (summaryStart < 0 || returnStart <= summaryStart) fail('summary span');
const summaryOnly = `        const bossRetryLine = !result.won && result.monster.grade === 'boss' ? 'Khiêu chiến Boss thất bại: Boss tầng này vẫn còn, có thể thử lại bất cứ lúc nào; bãi farm đã mở trước đó không bị mất.' : undefined;\n        const summaryLines = result.won ? [\n            \`Hạ \${result.monster.name} [\${result.monster.gradeName}] · \${map.zoneName} tầng \${map.zoneFloor} trong \${result.battleSeconds.toFixed(1)}s · HP còn \${result.playerHpRemainingPct.toFixed(0)}%.\`,\n            'Boss chỉ mở tiến độ; tài nguyên Săn Yêu được kết toán qua Săn Ảo theo thời gian. Tu Luyện vẫn chạy độc lập 100%.',\n            ...(bossMechanic ? [\`Cơ chế Boss: \${bossMechanic.name} · đối sách \${bossMechanic.coveragePct}% · \${bossMechanic.counterHint}\`] : []),\n            ...(result.monster.elements.length ? [\`Ngũ Hành: \${result.monster.elements.join(' + ')} · \${elementMatchup.label}.\`] : []),\n            ...fateNotes,\n            ...(result.bossCleared ? [\`Bãi Săn Ảo tầng \${map.zoneFloor} đã mở; reward bắt đầu tích theo thời gian ở bãi farm.\`] : []),\n            ...(result.bossCleared && result.unlockedFloor ? [\`Đã mở \${realmMapDefinitionForFloor(result.unlockedFloor).zoneName} tầng \${zoneFloorForMapFloor(result.unlockedFloor)} để tiếp tục khiêu chiến.\`] : []),\n        ] : [\n            \`\${result.outcome === 'timeout' ? 'Hết thời gian giao tranh' : 'Bị đánh bại'} trước \${result.monster.name}; HP ngươi còn \${result.playerHpRemainingPct.toFixed(0)}% · HP mục tiêu còn \${result.enemyHpRemainingPct.toFixed(0)}%.\`,\n            \`Thương thế +\${result.injuryGain}; Chiến Lực chỉ còn là chỉ báo, thắng/thua do HP thực quyết định.\`,\n            ...(bossRetryLine ? [bossRetryLine] : []),\n            ...realCombat.diagnosis,\n            ...fateNotes,\n        ];\n`;
fight = fight.slice(0, summaryStart) + summaryOnly + fight.slice(returnStart);

const oldReturn = "        return { seed, won: result.won, rewardContext: options.rewardContext ?? 'online',";
const returnPos = fight.indexOf(oldReturn);
if (returnPos < 0) fail('return rewardContext');
fight = fight.replace(oldReturn, "        return { seed, won: result.won, rewardContext: 'progression-only', directBossLoot: false,");

// The current read model historically advertised per-Boss loot. Keep the shape
// compatible, but make the authority explicit so no UI can mistake it for a real drop lane.
const rewardModel = /rewards: \{ cultivationPct: 0, spiritStonesHint: `~\$\{stoneHint\.toLocaleString\('vi-VN'\)\}`, materialChancePct: economyChances\.materialChancePct, equipmentChancePct: economyChances\.equipmentChancePct, rareChancePct: economyChances\.rareChancePct, cultivationPillChancePct: Math\.min\(100, rewards\.cultivationPillChancePct \* effectiveLoot\), injuryPillChancePct: Math\.min\(55, \(monster\.grade === 'boss' \? 30 : monster\.grade === 'elite' \? 6 : monster\.grade === 'enhanced' \? 1\.5 : \.25\) \* effectiveLoot\) \}/;
const rewardMatches = source.match(rewardModel);
if (!rewardMatches) fail('Boss reward preview model');
source = source.replace(rewardModel, "rewards: { cultivationPct: 0, mode: 'time-farm-only', directBossLoot: false, spiritStonesHint: 'Săn Ảo theo thời gian', materialChancePct: 0, equipmentChancePct: 0, rareChancePct: 0, cultivationPillChancePct: 0, injuryPillChancePct: 0 }");

source = source.slice(0, fightStart) + fight + source.slice(fightEnd);

// Postconditions: real Boss fight cannot own any Hunt loot mint lane.
const patchedFightEnd = source.indexOf('    equipmentCombatImpact(itemId) {', fightStart);
const patchedFight = source.slice(fightStart, patchedFightEnd);
for (const forbidden of [
  'settleRealHuntEquipmentFragmentsV142(',
  'applyEconomyResourceDrops(',
  'applyHeavenlyTreasureDrops(',
  'settleSpiritualRootHuntV145(',
  'recordFirstClearBoundJadeV89(',
  "inventory['resource.spirit_stone']",
]) {
  if (patchedFight.includes(forbidden)) fail(`real Boss fight still contains ${forbidden}`);
}
for (const required of [
  "rewardContext: 'progression-only'",
  'directBossLoot: false',
  'Boss chỉ mở tiến độ',
  'Bãi Săn Ảo tầng',
]) {
  if (!patchedFight.includes(required)) fail(`missing postcondition ${required}`);
}

fs.writeFileSync(file, source);
console.log('V180 Hunt time-reward authority migration applied');
