import assert from 'node:assert/strict';
import {
  SPIRIT_BEAST_SPECIES_V147,
  SPIRIT_BEAST_FRAGMENT_PER_STAR_V147,
  SPIRIT_BEAST_GACHA_FRAGMENT_ROLL_V147,
  SPIRIT_BEAST_DUPLICATE_FRAGMENT_V147,
  spiritBeastEffectiveLevelV147,
  spiritBeastLevelCapV147,
  spiritBeastStarRawMultiplierV147,
  spiritBeastStatsV147,
  spiritBeastBondSummaryV147,
  spiritBeastCombatTriggersV147,
  spiritBeastStarUpV147,
  migrateSpiritBeastsV147,
} from '../../dist/core/spirit-beast-v147.js';

let passed=0;
function test(name,fn){fn();passed++;console.log(`✓ ${name}`);}
function pet(id,{level=1,stars=0,fragments=0}={}){return {owned:true,level,stars,specificFragments:fragments,advance:5,spiritBeastV147Migrated:true};}

test('V147 keeps exactly eight authored spirit beast species',()=>{
  assert.equal(SPIRIT_BEAST_SPECIES_V147.length,8);
  assert.equal(new Set(SPIRIT_BEAST_SPECIES_V147.map(x=>x.id)).size,8);
  assert.deepEqual(SPIRIT_BEAST_SPECIES_V147.map(x=>x.id),['pet.1','pet.2','pet.3','pet.4','pet.5','pet.6','pet.7','pet.8']);
});

test('V147 star economy is fixed at 10 exact fragments per star with normalized gacha targets',()=>{
  assert.equal(SPIRIT_BEAST_FRAGMENT_PER_STAR_V147,10);
  assert.equal(SPIRIT_BEAST_GACHA_FRAGMENT_ROLL_V147,5);
  assert.equal(SPIRIT_BEAST_DUPLICATE_FRAGMENT_V147,10);
  const p=pet('pet.1',{stars:20,fragments:35});
  const r=spiritBeastStarUpV147(p,99);
  assert.equal(r.starsAdded,3);assert.equal(p.stars,23);assert.equal(p.specificFragments,5);assert.equal(r.levelCap,1250);
});

test('V147 level cap expands indefinitely by 50 levels per star',()=>{
  assert.equal(spiritBeastLevelCapV147(0),100);
  assert.equal(spiritBeastLevelCapV147(20),1100);
  assert.equal(spiritBeastLevelCapV147(100),5100);
  assert.equal(spiritBeastLevelCapV147(1000),50100);
});

test('V147 raw growth sharply diminishes after level 100/500/1000',()=>{
  assert.equal(spiritBeastEffectiveLevelV147(100),100);
  assert.equal(spiritBeastEffectiveLevelV147(500),180);
  assert.equal(spiritBeastEffectiveLevelV147(1000),220);
  assert(Math.abs(spiritBeastEffectiveLevelV147(5100)-301.98)<1e-9);
  assert.equal(spiritBeastStarRawMultiplierV147(20),1.6);
  assert.equal(spiritBeastStarRawMultiplierV147(1000),1.6,'stars above 20 must not create uncapped direct multipliers');
});

test('V147 bond percent budget caps at Lv1000 + 20 stars and cannot scale infinitely',()=>{
  const maxState={items:Object.fromEntries(SPIRIT_BEAST_SPECIES_V147.map(x=>[x.id,pet(x.id,{level:1000,stars:20})]))};
  const overState={items:Object.fromEntries(SPIRIT_BEAST_SPECIES_V147.map(x=>[x.id,pet(x.id,{level:50100,stars:1000})]))};
  const max=spiritBeastBondSummaryV147(maxState),over=spiritBeastBondSummaryV147(overState);
  assert.equal(max.powerPct,32);assert.equal(max.bodyPct,30);assert.equal(max.defensePct,27.8);
  assert.deepEqual({p:over.powerPct,b:over.bodyPct,d:over.defensePct},{p:32,b:30,d:27.8});
});

test('V147 old Huyết Mạch I-V migrates exactly to 4/8/12/16/20 stars and is idempotent',()=>{
  for(let hm=0;hm<=5;hm++){
    const state={items:{'pet.1':{owned:true,level:1,advance:hm,specificFragments:0}},genericFragments:{pet:0}};
    const first=migrateSpiritBeastsV147(state);assert.equal(state.items['pet.1'].stars,hm*4);assert.equal(state.items['pet.1'].advance,5);assert(first.migrated||hm===0);
    const snapshot=JSON.stringify(state);migrateSpiritBeastsV147(state);assert.equal(JSON.stringify(state),snapshot);
  }
});

test('V147 skill gates move from Huyết Mạch to star milestones 0/8/16 and 20-star cooldown capstone',()=>{
  const state={activePetId:'pet.1',items:{'pet.1':pet('pet.1',{level:100,stars:0})}};
  assert.equal(spiritBeastCombatTriggersV147(state).length,1);
  state.items['pet.1'].stars=8;assert.equal(spiritBeastCombatTriggersV147(state).length,2);
  state.items['pet.1'].stars=16;const s16=spiritBeastCombatTriggersV147(state);assert.equal(s16.length,3);
  state.items['pet.1'].stars=20;const s20=spiritBeastCombatTriggersV147(state);assert.equal(s20.length,3);assert(s20[0].cooldown<s16[0].cooldown);
});

test('V147 only the selected active beast injects CombatKernel triggers',()=>{
  const state={activePetId:'pet.2',items:{'pet.1':pet('pet.1',{stars:20}), 'pet.2':pet('pet.2',{stars:20})}};
  const triggers=spiritBeastCombatTriggersV147(state);assert(triggers.length>0);assert(triggers.every(x=>x.id.includes('pet.2')));
});

test('V147 raw stat consumer respects each beast own star-derived cap',()=>{
  const species=SPIRIT_BEAST_SPECIES_V147[0];
  const atCap=spiritBeastStatsV147(species,pet(species.id,{level:100,stars:0}));
  const over=spiritBeastStatsV147(species,pet(species.id,{level:999999,stars:0}));
  assert.deepEqual(over,atCap,'stored over-level must never generate power above the beast personal cap');
});

console.log(`V147 Spirit Beast Progression: ${passed}/${passed} PASS`);
