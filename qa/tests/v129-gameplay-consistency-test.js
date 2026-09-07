import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildRegistry } from '../../dist/content/registry.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { SimulationSession } from '../../dist/core/session.js';
import { EventHistory } from '../../dist/core/history.js';
import { evaluateEarlyGameSlice } from '../../dist/core/early-game.js';
import { analyzePlaytestTelemetry } from '../../dist/core/playtest-telemetry.js';
import { createEndlessHuntState } from '../../dist/core/endless-hunt.js';
import { GameplayFacade } from '../../dist/core/gameplay.js';
import { LocalGameApplicationApi } from '../../dist/core/game-api.js';

let passed = 0;
function test(name, fn) { fn(); passed += 1; console.log(`✓ ${name}`); }
const registry = buildRegistry();

function readyState() {
  const state = createPlayableAdventureState();
  state.realm.realmId = 'realm.foundation.early';
  state.realm.maxRealmOrder = 10;
  state.ageYears = 60;
  state.lifespanYears = Math.max(240, state.lifespanYears ?? 0);
  return state;
}
function session(seed, state = readyState(), events = []) {
  return new SimulationSession(registry, thanhHaWorld, adventureEnemies, playablePlayerProfile, seed, state, 0, events);
}

test('EventHistory counts alternative semantic tags once per event', () => {
  const h = new EventHistory();
  h.append({ id:'a', worldTimeYears:1, ageYears:1, type:'combat', significance:1, message:'a', tags:['FirstClear','FirstClearLike'] });
  h.append({ id:'b', worldTimeYears:2, ageYears:2, type:'combat', significance:1, message:'b', tags:['FirstClearLike'] });
  assert.equal(h.countAnyTag('FirstClear','FirstClearLike'), 2);
});

test('legacy Săn Yêu FirstClearLike event is no longer a Tọa Hóa requirement', () => {
  const ev = { id:'legacy.hunt.first', worldTimeYears:20, ageYears:30, type:'combat', significance:34, message:'Boss cleared', tags:['EndlessHunt','Victory','FloorBoss','FirstClearLike'] };
  assert.equal(session(1299101, readyState(), [ev]).voluntaryPassingEligibility().ok, true);
  assert.equal(session(1299105, readyState(), []).voluntaryPassingEligibility().ok, true);
});

test('Săn Yêu clear state is independent from voluntary Tọa Hóa eligibility', () => {
  const state = readyState();
  state.endlessHunt = createEndlessHuntState();
  state.endlessHunt.totalBossKills = 1;
  state.endlessHunt.highestClearedFloor = 1;
  state.endlessHunt.highestClearedByMajor = { '1': 1 };
  const gate = session(1299102, state, []).voluntaryPassingEligibility();
  assert.equal(gate.ok, true);
  assert.equal(gate.firstClears, undefined);
});

test('Phó Bản clear state is independent from voluntary Tọa Hóa eligibility', () => {
  const state = readyState();
  state.dungeons.highestClearedFloor['dungeon.spirit_gathering_cave'] = 2;
  const gate = session(1299103, state, []).voluntaryPassingEligibility();
  assert.equal(gate.ok, true);
  assert.equal(gate.firstClears, undefined);
});

test('new Săn Yêu boss event is authored as canonical FirstClear while retaining legacy compatibility tag', () => {
  const src = fs.readFileSync(new URL('../../dist/core/session.js', import.meta.url), 'utf8');
  const needle = "result.bossCleared ? ['FloorBoss', 'FirstClear', 'FirstClearLike'] : []";
  assert.ok(src.includes(needle), 'hunt boss clear must carry canonical FirstClear');
});

test('early-game generic first-clear checkpoint accepts a Săn Yêu boss', () => {
  const state = createPlayableAdventureState();
  state.realm.maxRealmOrder = 10;
  state.endlessHunt = createEndlessHuntState();
  state.endlessHunt.totalBossKills = 1;
  const slice = evaluateEarlyGameSlice(state, { lifeNumber:1 }, thanhHaWorld, []);
  const cp = slice.checkpoints.find(x => x.id === 'firstClear');
  assert.equal(cp?.complete, true);
});

test('playtest telemetry counts canonical and legacy Săn Yêu first-clear tags', () => {
  const state = createPlayableAdventureState();
  const history = [
    { id:'life.start.1', worldTimeYears:0, ageYears:0, type:'system', significance:1, message:'start', tags:['LifeStart'], data:{} },
    { id:'hunt.1', worldTimeYears:1, ageYears:1, type:'combat', significance:34, message:'boss', tags:['EndlessHunt','Victory','FirstClearLike'], data:{} },
  ];
  const out = analyzePlaytestTelemetry(state, { lifeNumber:1 }, history, undefined);
  assert.equal(out.combat.firstClears, 1);
});

test('Tọa Hóa V4 has no age, realm or First Clear blocker when energy is sufficient', () => {
  const state=createPlayableAdventureState();
  state.ageYears=1; state.realm.maxRealmOrder=0; state.realm.realmId='realm.mortal';
  const gate=session(1299104,state,[]).voluntaryPassingEligibility();
  assert.equal(gate.ok,true);
  assert.equal(gate.reason,undefined);
  assert.ok(gate.energyCost>0);
});


test('all frontend direct actions have standalone runtime handlers', () => {
  const app = fs.readFileSync(new URL('../../app.js', import.meta.url), 'utf8');
  const modulesDir = new URL('../../modules/', import.meta.url);
  const modules = fs.readdirSync(modulesDir).filter(name => name.endsWith('.js')).map(name => fs.readFileSync(new URL(name, modulesDir), 'utf8')).join('\n');
  const client = `${app}\n${modules}`;
  const direct = new Set([...client.matchAll(/action\(\s*\{[^{}]{0,500}?\baction\s*:\s*['"]([^'"]+)/gs)].map(m => m[1]));
  const runtime = fs.readFileSync(new URL('../../standalone-runtime.js', import.meta.url), 'utf8');
  const cases = new Set([...runtime.matchAll(/case\s*['"]([^'"]+)['"]\s*:/g)].map(m => m[1]));
  const missing = [...direct].filter(name => !cases.has(name));
  assert.deepEqual(missing, [], `frontend direct actions missing runtime handlers: ${missing.join(', ')}`);
});

test('all frontend perform command types have GameplayFacade dispatch handlers', () => {
  const app = fs.readFileSync(new URL('../../app.js', import.meta.url), 'utf8');
  const modulesDir = new URL('../../modules/', import.meta.url);
  const modules = fs.readdirSync(modulesDir).filter(name => name.endsWith('.js')).map(name => fs.readFileSync(new URL(name, modulesDir), 'utf8')).join('\n');
  const client = `${app}\n${modules}`;
  const commands = new Set([...client.matchAll(/perform\(\s*\{[^{}]{0,500}?\btype\s*:\s*['"]([^'"]+)/gs)].map(m => m[1]));
  const gameplay = fs.readFileSync(new URL('../../dist/core/gameplay.js', import.meta.url), 'utf8');
  const dispatchAt = gameplay.indexOf('dispatch(command)');
  assert.ok(dispatchAt >= 0, 'GameplayFacade.dispatch missing');
  const dispatchModuleUrl = new URL('../../dist/core/gameplay-dispatch.js', import.meta.url);
  const dispatchModule = fs.existsSync(dispatchModuleUrl) ? fs.readFileSync(dispatchModuleUrl, 'utf8') : '';
  const dispatchSource = `${gameplay.slice(dispatchAt)}\n${dispatchModule}`;
  const cases = new Set([...dispatchSource.matchAll(/case\s+['"]([^'"]+)['"]\s*:/g)].map(m => m[1]));
  const missing = [...commands].filter(name => !cases.has(name));
  assert.deepEqual(missing, [], `frontend perform commands missing GameplayFacade handlers: ${missing.join(', ')}`);
});

test('frontend does not call runtime actions explicitly retired by current production contract', () => {
  const app = fs.readFileSync(new URL('../../app.js', import.meta.url), 'utf8');
  const modulesDir = new URL('../../modules/', import.meta.url);
  const modules = fs.readdirSync(modulesDir).filter(name => name.endsWith('.js')).map(name => fs.readFileSync(new URL(name, modulesDir), 'utf8')).join('\n');
  const client = `${app}\n${modules}`;
  const direct = new Set([...client.matchAll(/action\(\s*\{[^{}]{0,500}?\baction\s*:\s*['"]([^'"]+)/gs)].map(m => m[1]));
  const retired = new Set(['collectionDailyV12316','collectionDailyV12325','collectionDailyV12326','collectionGachaV12316','collectionGachaV12325','cultivationClassVariant','cultivationDaoFruit','cultivationPathNode','cultivationPathSelect']);
  const bad = [...direct].filter(name => retired.has(name));
  assert.deepEqual(bad, [], `frontend still emits retired runtime actions: ${bad.join(', ')}`);
});


test('Luân Hồi read-model exposes Tọa Hóa from energy, independent of First Clear', () => {
  const state = readyState();
  state.endlessHunt = createEndlessHuntState();
  state.endlessHunt.totalBossKills = 1;
  state.endlessHunt.highestClearedFloor = 1;
  state.endlessHunt.highestClearedByMajor = { '1': 1 };
  const ss = session(1299105, state, []);
  const hub = new GameplayFacade(ss, registry, thanhHaWorld).reincarnationHub();
  assert.equal(hub.lifeEnd.canEnd, true);
  assert.equal(hub.lifeEnd.firstClears, undefined);
});

test('player-facing perform path executes voluntary Tọa Hóa without a First Clear gate', () => {
  const state = readyState();
  state.endlessHunt = createEndlessHuntState();
  state.endlessHunt.totalBossKills = 1;
  state.endlessHunt.highestClearedFloor = 1;
  state.endlessHunt.highestClearedByMajor = { '1': 1 };
  const ss = session(1299106, state, []);
  const api = new LocalGameApplicationApi(new GameplayFacade(ss, registry, thanhHaWorld));
  const result = api.perform({ type:'meditativePassing' });
  assert.equal(result.ok, true);
  assert.equal(ss.stateValue.alive, false);
  assert.ok(result.data?.event?.tags?.includes('VoluntaryPassing'));
});


test('complete V4 flow is Tọa Hóa → Tổng Kết Nhất Kiếp → Chuyển Sinh without synthetic trials', () => {
  const state = readyState();
  state.endlessHunt = createEndlessHuntState();
  state.endlessHunt.totalBossKills = 1;
  state.endlessHunt.highestClearedFloor = 1;
  state.endlessHunt.highestClearedByMajor = { '1': 1 };
  const ss = session(1299107, state, []);
  const api = new LocalGameApplicationApi(new GameplayFacade(ss, registry, thanhHaWorld));
  const passing = api.perform({ type:'meditativePassing' });
  assert.equal(passing.ok, true);
  const reward = api.finalizeReincarnationRewardsV2(true, 3_000);
  assert.ok(reward.reincarnationPoints >= 0);
  const rebirth = api.reincarnate({});
  assert.equal(rebirth.ok, true);
  assert.equal(rebirth.data?.currentLife?.lifeNumber, 2);
  assert.equal(rebirth.data?.state?.alive, true);
  assert.equal(ss.currentLifeValue.lifeNumber, 2);
  assert.equal(ss.stateValue.alive, true);
  assert.equal(ss.stateValue.endlessHunt?.totalBossKills ?? 0, 0);
});

test('a new life can voluntarily Tọa Hóa without First Clear once Energy is sufficient', () => {
  const state = readyState();
  state.endlessHunt = createEndlessHuntState();
  state.endlessHunt.totalBossKills = 1;
  state.endlessHunt.highestClearedFloor = 1;
  state.endlessHunt.highestClearedByMajor = { '1': 1 };
  const ss = session(1299108, state, []);
  const api = new LocalGameApplicationApi(new GameplayFacade(ss, registry, thanhHaWorld));
  assert.equal(api.perform({ type:'meditativePassing' }).ok, true);
  api.finalizeReincarnationRewardsV2(true, 3_000);
  assert.equal(api.reincarnate({}).ok, true);
  // Energy remains the only voluntary Tọa Hóa gate in life 2.
  ss.metaValue.reincarnationProgress.energy.current = 300;
  const gate = ss.voluntaryPassingEligibility();
  assert.equal(gate.ok, true);
  assert.equal(gate.firstClears, undefined);
  assert.ok(gate.energyCost > 0);
});

console.log(`V129 GAMEPLAY CONSISTENCY: ${passed}/15 PASS`);
