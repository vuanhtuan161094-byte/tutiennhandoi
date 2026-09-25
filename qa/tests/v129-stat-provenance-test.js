import assert from 'node:assert/strict';
import { buildRegistry } from '../../dist/content/registry.js';
import { thanhHaWorld } from '../../dist/content/world.js';
import { adventureEnemies } from '../../dist/content/entities.js';
import { createPlayableAdventureState, playablePlayerProfile } from '../../dist/content/adventure.js';
import { SimulationSession } from '../../dist/core/session.js';
import { GameplayFacade } from '../../dist/core/gameplay.js';
import { combatMaxHp } from '../../dist/core/combat-rules.js';

const registry = buildRegistry();
let passed = 0;
const test = (name, fn) => {
  try { fn(); passed += 1; console.log(`✓ [${passed}] ${name}`); }
  catch (error) { console.error(`✗ ${name}`); throw error; }
};
const json = value => JSON.stringify(value);
const session = () => new SimulationSession(registry, thanhHaWorld, adventureEnemies, playablePlayerProfile, 1292901, createPlayableAdventureState());
const stat = (summary, key) => summary.statProvenance.stats.find(x => x.key === key);

test('Stat provenance uses V129 schema and explicit player-facing terminology', () => {
  const s=session(), g=new GameplayFacade(s,registry,thanhHaWorld); const p=g.personalPower();
  assert.equal(p.statProvenance.schema,'stat-provenance.v129');
  for (const key of ['rootStat','baseValue','flat','percentagePoint','multiplier','realized']) assert(p.statProvenance.terminology[key]);
});

test('Character provenance exposes real authored stages instead of one opaque Nhân vật bucket', () => {
  const s=session(), g=new GameplayFacade(s,registry,thanhHaWorld); const p=g.personalPower();
  const ids=new Set(p.statProvenance.stats.flatMap(x=>x.sources.map(y=>y.id)));
  assert(ids.has('character.potential'),'canonical core Potential must be traceable');
  assert(!ids.has('character.legacy_potential'),'retired legacy Potential must never be invented');
  assert(!ids.has('character.techniques'),'retired V103/V119 Công Pháp combat source must not survive in provenance');
});

test('Effective HP provenance uses combatMaxHp and never double-counts physique conversion', () => {
  const s=session(), g=new GameplayFacade(s,registry,thanhHaWorld); const p=g.personalPower(); const entity=s.personalCombatEntity();
  const hp=stat(p,'maxHp');
  assert.equal(hp.finalValue,combatMaxHp(entity.stats));
  assert.equal(hp.sources.some(x=>x.id==='character.potential'),false,'Potential that merely materializes equivalent physique must not fake extra HP');
});

test('Equipment source exposes +flat and +% multiplier separately plus realized runtime delta', () => {
  const s=session();
  const item={
    id:'equipment.v129.provenance.weapon',templateId:'equipment.v129.provenance.weapon',name:'V129 Provenance Weapon',slot:'weapon',tier:1,quality:'high',grade:'heaven',
    enhancementLevel:0,traitIds:[],affixes:[],reforgeCount:0,gemSockets:[null,null],itemLevel:100,
    stats:{attack:100},tags:[],daoInscription:{id:'dao.v128.heavenly_craft'},source:{kind:'test',seed:129},acquiredWorldYear:0,
  };
  s.stateValue.equipment.items=[item]; s.stateValue.equipment.equipped.weapon=item.id;
  const before=json(s.snapshot()); const p=s.personalPowerSummary(); const after=json(s.snapshot());
  assert.equal(after,before,'provenance read must not mutate save');
  const attack=stat(p,'attack'); const eq=attack.sources.find(x=>x.id==='equipment');
  assert(eq,'equipment must appear when it changes attack');
  assert.equal(eq.flatInput,100);
  assert.equal(eq.multiplierPctInput,1.5);
  assert(eq.realizedDelta>100,'realized delta must reflect (before + flat) × multiplier ordering');
});

test('Provenance explains additive Crit versus remaining-space bounded percentages', () => {
  const s=session(), p=s.personalPowerSummary();
  const crit=stat(p,'critChancePct'), dodge=stat(p,'dodgeChancePct'), dr=stat(p,'damageReductionPct');
  assert.equal(crit.stackingRule?.id,'additive_unbounded');
  assert.equal(dodge.stackingRule?.id,'remaining_space'); assert.equal(dr.stackingRule?.id,'remaining_space');
  assert.match(p.statProvenance.terminology.percentagePoint,/phần hiệu lực còn lại/);
});

test('Final provenance values match the real personal CombatEntity for key stats', () => {
  const s=session(), p=s.personalPowerSummary(), entity=s.personalCombatEntity();
  for (const key of ['attack','physique','defense','maxSpirit','critChancePct','critDamagePct','heartChancePct','dodgeChancePct','armorPenPct','damageReductionPct','actionSpeed']) {
    const row=stat(p,key); const expected=key==='maxHp'?combatMaxHp(entity.stats):(Number(entity.stats[key])||0);
    assert(Math.abs(row.finalValue-expected)<1e-5,`${key}: provenance ${row.finalValue} != combat ${expected}`);
  }
});

test('Each listed source forms one ordered before→after chain and zero-delta sources are omitted', () => {
  const s=session(), p=s.personalPowerSummary();
  for (const row of p.statProvenance.stats) {
    let value=row.baseValue;
    for (const source of row.sources) {
      assert(Math.abs(source.before-value)<1e-5,`${row.key}/${source.id} chain discontinuity`);
      assert(Math.abs(source.after-source.before)>1e-9,`${row.key}/${source.id} must not expose fake +0 source`);
      value=source.after;
    }
    assert(Math.abs(value-row.finalValue)<1e-5,`${row.key} chain does not reconstruct final value`);
  }
});

test('Five root stats expose Life + Reincarnation allocations and authored per-point conversion', () => {
  const s=session();
  s.stateValue.character.corePotential.life={
    axisVersion:5,
    unspent:0,
    lifetimeEarned:25,
    allocations:{power:7,body:5,agility:4,spirit:3,sense:6},
    awardedMilestones:[],
  };
  s.stateValue.character.corePotential.permanent={power:2,body:1,agility:3,spirit:4,sense:5};
  const p=s.personalPowerSummary(), roots=Object.fromEntries(p.statProvenance.rootStats.map(x=>[x.id,x]));
  assert.deepEqual(Object.keys(roots),['power','body','agility','spirit','sense']);
  assert.equal(roots.power.totalPoints,9); assert.equal(roots.power.combatContribution,9);
  assert.equal(roots.body.totalPoints,6); assert.match(roots.body.perPointText,/\+20 Khí Huyết.*\+1 Phòng/);
  assert.equal(roots.agility.totalPoints,7); assert.match(roots.agility.perPointText,/Mobility/);
  assert.equal(roots.spirit.totalPoints,7); assert.match(roots.spirit.perPointText,/Max Chân Nguyên/);
  assert.equal(roots.sense.totalPoints,11); assert.match(roots.sense.perPointText,/Chính Xác.*Khống Chế.*Định Lực/);
});

console.log(`V129 STAT PROVENANCE: ${passed}/${passed} PASS`);
