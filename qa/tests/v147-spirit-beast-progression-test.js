import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  SPIRIT_BEAST_SPECIES,
  SPIRIT_BEAST_FRAGMENT_PER_STAR_V147,
  SPIRIT_BEAST_GACHA_FRAGMENT_ROLL_V147,
  SPIRIT_BEAST_DUPLICATE_FRAGMENT_V147,
  spiritBeastEffectiveLevelV147,
  spiritBeastLevelCapV147,
  spiritBeastStarRawMultiplierV147,
  spiritBeastStarEssenceCostV147,
  spiritBeastStatsV147,
  spiritBeastBondSummaryV147,
  spiritBeastCombatTriggersV147,
  spiritBeastStarUpV147,
  migrateSpiritBeastsV147,
} from '../../dist/core/spirit-beast-v147.js';
import { spiritBeastStrengthenCostV147 } from '../../dist/core/collection-progression-v12316.js';
import { advanceCollectionEconomyV12325, collectionEconomySummaryV12325, strengthenCollectionEconomyV12325 } from '../../dist/core/gacha-collection-economy-v12325.js';
import { gachaCollectionV12326 } from '../../dist/core/collection-workshop-gacha-v12326.js';

let passed=0;
function test(name,fn){fn();passed++;console.log(`✓ ${name}`);}
function pet(id,{level=1,stars=0,fragments=0}={}){return {owned:true,level,stars,specificFragments:fragments,advance:5,spiritBeastV147Migrated:true};}
function stateWith(items={},beastFacility=1){return {
  schema:'collection-progression.v12316',
  currencies:{immortalJade:999999,boundImmortalJade:999999},
  genericFragments:{manual:0,artifact:0,pet:999999,companion:0},
  items,
  activeArtifactIds:[],
  manualTreeV127:{},
  gacha:{manual:{pulls:0,pity:0},artifact:{pulls:0,pity:0},pet:{pulls:0,pity:0},companion:{pulls:0,pity:0}},
  cave:{level:1,facilities:[{id:'beast',level:beastFacility}]},
  daily:{dayKey:'',clearedIds:[]},
  spiritBeastV86Migrated:true,
  spiritBeastV147Migrated:true,
};}

test('V147 keeps exactly eight authored spirit beast species',()=>{
  assert.equal(SPIRIT_BEAST_SPECIES.length,8);
  assert.equal(new Set(SPIRIT_BEAST_SPECIES.map(x=>x.id)).size,8);
  assert.deepEqual(SPIRIT_BEAST_SPECIES.map(x=>x.id),['pet.1','pet.2','pet.3','pet.4','pet.5','pet.6','pet.7','pet.8']);
});

test('V147 star economy is fixed at 10 exact fragments per star with normalized gacha targets',()=>{
  assert.equal(SPIRIT_BEAST_FRAGMENT_PER_STAR_V147,10);
  assert.equal(SPIRIT_BEAST_GACHA_FRAGMENT_ROLL_V147,5);
  assert.equal(SPIRIT_BEAST_DUPLICATE_FRAGMENT_V147,10);
  const p=pet('pet.1',{stars:20,fragments:35});
  const r=spiritBeastStarUpV147(p,99);
  assert.equal(r.starsAdded,3);assert.equal(p.stars,23);assert.equal(p.specificFragments,5);assert.equal(r.levelCap,1250);
});

test('V147 milestone essence sink repeats the legacy 1/1/2/3/5 cadence every 20 stars',()=>{
  assert.equal(spiritBeastStarEssenceCostV147(0),0);
  assert.equal(spiritBeastStarEssenceCostV147(3),1);
  assert.equal(spiritBeastStarEssenceCostV147(7),1);
  assert.equal(spiritBeastStarEssenceCostV147(11),2);
  assert.equal(spiritBeastStarEssenceCostV147(15),3);
  assert.equal(spiritBeastStarEssenceCostV147(19),5);
  assert.equal(spiritBeastStarEssenceCostV147(23),1);
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
  const maxState={items:Object.fromEntries(SPIRIT_BEAST_SPECIES.map(x=>[x.id,pet(x.id,{level:1000,stars:20})]))};
  const overState={items:Object.fromEntries(SPIRIT_BEAST_SPECIES.map(x=>[x.id,pet(x.id,{level:50100,stars:1000})]))};
  const max=spiritBeastBondSummaryV147(maxState),over=spiritBeastBondSummaryV147(overState);
  assert.equal(max.powerPct,32);assert.equal(max.bodyPct,30);assert.equal(max.defensePct,27.8);
  assert.deepEqual({p:over.powerPct,b:over.bodyPct,d:over.defensePct},{p:32,b:30,d:27.8});
});

test('V147 old Huyết Mạch I-V migrates exactly to 4/8/12/16/20 stars and preserves unspent fragments',()=>{
  for(let hm=0;hm<=5;hm++){
    const state={items:{'pet.1':{owned:true,level:1,advance:hm,specificFragments:37}},genericFragments:{pet:0}};
    const first=migrateSpiritBeastsV147(state);assert.equal(state.items['pet.1'].stars,hm*4);assert.equal(state.items['pet.1'].advance,5);assert.equal(state.items['pet.1'].specificFragments,37);assert(first.migrated||hm===0);
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
  const species=SPIRIT_BEAST_SPECIES[0];
  const atCap=spiritBeastStatsV147(species,pet(species.id,{level:100,stars:0}));
  const over=spiritBeastStatsV147(species,pet(species.id,{level:999999,stars:0}));
  assert.deepEqual(over,atCap,'stored over-level must never generate power above the beast personal cap');
});

test('V147 canonical advance consumes 10 fragments and milestone pill atomically',()=>{
  const state=stateWith({'pet.1':pet('pet.1',{stars:3,fragments:10})});
  assert.throws(()=>advanceCollectionEconomyV12325(state,'pet.1'),/Linh Thú Đột Phá Đan/);
  assert.equal(state.items['pet.1'].stars,3);assert.equal(state.items['pet.1'].specificFragments,10,'failed milestone must not consume fragments');
  state.economyV12325.ascensionEssence.pet=1;
  const milestone=advanceCollectionEconomyV12325(state,'pet.1');
  assert.equal(milestone.stars,4);assert.equal(milestone.essenceCost,1);assert.equal(state.items['pet.1'].specificFragments,0);assert.equal(state.economyV12325.ascensionEssence.pet,0);
  state.items['pet.1'].specificFragments=10;
  const ordinary=advanceCollectionEconomyV12325(state,'pet.1');
  assert.equal(ordinary.stars,5);assert.equal(ordinary.essenceCost,0);
});

test('V147 nourish uses each pet personal star cap and Beast facility becomes a real discount consumer',()=>{
  const fresh=stateWith({'pet.1':pet('pet.1',{level:1,stars:0})},10);
  assert.equal(spiritBeastStrengthenCostV147(fresh,fresh.items['pet.1']),8,'Beast facility Lv10 should discount fresh nourish cost by 18%');
  const capped=stateWith({'pet.1':pet('pet.1',{level:100,stars:0})},10);
  assert.throws(()=>strengthenCollectionEconomyV12325(capped,'pet.1',1),/đã đạt Lv100/);
  capped.items['pet.1'].stars=1;
  const r=strengthenCollectionEconomyV12325(capped,'pet.1',1);
  assert.equal(r.progress.level,101);assert.equal(r.levelCap,150);
});

test('V147 economy read model exposes stars, exact next-star cost and milestone essence instead of legacy HM costs',()=>{
  const state=stateWith({'pet.1':pet('pet.1',{level:50,stars:3,fragments:10})});
  const summary=collectionEconomySummaryV12325(state,undefined,0,117);
  const item=summary.categories.find(x=>x.category==='pet').items.find(x=>x.id==='pet.1');
  assert.equal(item.progress.stars,3);assert.equal(item.progress.advance,3);assert.equal(item.spiritBeast.stars,3);assert.equal(item.spiritBeast.levelCap,250);
  assert.equal(item.advanceCost,10);assert.equal(item.ascensionCost,1);
});

test('V147 pet gacha normalizes every fragment roll to 5 and every duplicate item to 10 fragments',()=>{
  const items=Object.fromEntries(SPIRIT_BEAST_SPECIES.map(x=>[x.id,pet(x.id)]));
  const state=stateWith(items),inventory={};
  let fragmentPulls=0,itemPulls=0;
  for(let i=0;i<240;i++){
    const row=gachaCollectionV12326(state,inventory,'banner.pet',1,(147000+i*977)>>>0,false,[]).results[0];
    if(row.kind==='fragment'){fragmentPulls++;assert.equal(row.amount,5);assert.equal(row.fragments,5);}
    if(row.kind==='item'){itemPulls++;assert.equal(row.first,false);assert.equal(row.fragments,10);}
  }
  assert(fragmentPulls>0);assert(itemPulls>0);
  const total=SPIRIT_BEAST_SPECIES.reduce((s,x)=>s+state.items[x.id].specificFragments,0);
  assert.equal(total,fragmentPulls*5+itemPulls*10);
});

test('V147 browser bootstrap keeps V146 renderer isolated and applies scoped Spirit Beast copy migration',()=>{
  const app=readFileSync(new URL('../../app.js',import.meta.url),'utf8');
  const ui=readFileSync(new URL('../../modules/spirit-beast-ui-v147.js',import.meta.url),'utf8');
  assert(app.includes("./app-legacy-v146.js")&&app.includes("./modules/spirit-beast-ui-v147.js"));
  assert(ui.includes("PET_ASSET_MARKER='/assets/huntv2/beasts/'"));
  assert(ui.includes("Đột Phá Huyết Mạch")&&ui.includes("Tăng Sao"));
  assert(ui.includes("LINH THÚ V147"));
});

console.log(`V147 Spirit Beast Progression: ${passed}/${passed} PASS`);
