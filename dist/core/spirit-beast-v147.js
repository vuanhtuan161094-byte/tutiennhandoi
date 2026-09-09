import { SPIRIT_BEAST_SPECIES_V147, SPIRIT_BEAST_COMBAT_TUNING_V147 } from './spirit-beast-data-v147.js';

export const SPIRIT_BEAST_SCHEMA_V147 = 'spirit-beast.v147';
export const SPIRIT_BEAST_FRAGMENT_PER_STAR_V147 = 10;
export const SPIRIT_BEAST_BASE_LEVEL_CAP_V147 = 100;
export const SPIRIT_BEAST_LEVELS_PER_STAR_V147 = 50;
export const SPIRIT_BEAST_BOND_LEVEL_CAP_V147 = 1000;
export const SPIRIT_BEAST_LEGACY_FULL_STAR_V147 = 20;
export const SPIRIT_BEAST_GACHA_FRAGMENT_ROLL_V147 = 5;
export const SPIRIT_BEAST_DUPLICATE_FRAGMENT_V147 = 10;
export const SPIRIT_BEAST_SPECIES = SPIRIT_BEAST_SPECIES_V147;
export const SPIRIT_BEAST_COMBAT_TUNING = SPIRIT_BEAST_COMBAT_TUNING_V147;

const BY_ID = new Map(SPIRIT_BEAST_SPECIES_V147.map(x => [x.id, x]));
const LEGACY_SPECIES_TO_V147 = ['pet.3','pet.1','pet.2','pet.4','pet.6','pet.5','pet.5','pet.8','pet.4','pet.7'];

export const SPIRIT_BEAST_BOND_MAX_BUDGET_V147 = Object.freeze({
  'pet.1':{powerPct:5.6,bodyPct:2.6,defensePct:2.3},
  'pet.2':{powerPct:2.6,bodyPct:5.5,defensePct:5.2},
  'pet.3':{powerPct:3.8,bodyPct:3.0,defensePct:3.0},
  'pet.4':{powerPct:3.2,bodyPct:3.6,defensePct:3.4},
  'pet.5':{powerPct:5.1,bodyPct:3.0,defensePct:2.7},
  'pet.6':{powerPct:2.8,bodyPct:4.6,defensePct:4.2},
  'pet.7':{powerPct:5.3,bodyPct:3.1,defensePct:2.5},
  'pet.8':{powerPct:3.6,bodyPct:4.6,defensePct:4.5}
});

export function spiritBeastSpeciesV147(id){ return BY_ID.get(id); }
export function spiritBeastStarsV147(progress){ return Math.max(0, Math.floor(Number(progress?.stars)||0)); }
export function spiritBeastLevelCapV147(progressOrStars=0){
  const stars = typeof progressOrStars === 'number' ? Math.max(0,Math.floor(progressOrStars)) : spiritBeastStarsV147(progressOrStars);
  return SPIRIT_BEAST_BASE_LEVEL_CAP_V147 + stars * SPIRIT_BEAST_LEVELS_PER_STAR_V147;
}
export function spiritBeastEffectiveLevelV147(level){
  const lv=Math.max(1,Math.floor(Number(level)||1)),x=lv-1;
  const a=Math.min(x,99);
  const b=Math.min(Math.max(x-99,0),400)*.20;
  const c=Math.min(Math.max(x-499,0),500)*.08;
  const d=Math.max(x-999,0)*.02;
  return 1+a+b+c+d;
}
export function spiritBeastStarRawMultiplierV147(stars){
  const legacyEq=Math.min(5,Math.max(0,Number(stars)||0)/4);
  return 1+legacyEq*.12;
}
export function spiritBeastStatsV147(species,progress){
  const stars=spiritBeastStarsV147(progress),level=Math.max(1,Math.min(spiritBeastLevelCapV147(stars),Math.floor(Number(progress?.level)||1)));
  const effective=spiritBeastEffectiveLevelV147(level),hm=spiritBeastStarRawMultiplierV147(stars);
  return {
    hp:Math.round(species.base.hp*(1+(effective-1)*species.growth.hp)*hm),
    attack:Math.round(species.base.attack*(1+(effective-1)*species.growth.attack)*hm),
    defense:Math.round(species.base.defense*(1+(effective-1)*species.growth.defense)*hm),
    effectiveLevel:Number(effective.toFixed(2))
  };
}
export function spiritBeastBondContributionV147(species,progress){
  const max=SPIRIT_BEAST_BOND_MAX_BUDGET_V147[species.id]??{powerPct:0,bodyPct:0,defensePct:0};
  const stars=spiritBeastStarsV147(progress),level=Math.max(1,Math.floor(Number(progress?.level)||1));
  const levelFactor=.20+.80*Math.min((level-1)/(SPIRIT_BEAST_BOND_LEVEL_CAP_V147-1),1);
  const starFactor=.65+.35*Math.min(stars/SPIRIT_BEAST_LEGACY_FULL_STAR_V147,1);
  const factor=levelFactor*starFactor;
  return {powerPct:Number((max.powerPct*factor).toFixed(3)),bodyPct:Number((max.bodyPct*factor).toFixed(3)),defensePct:Number((max.defensePct*factor).toFixed(3))};
}
export function spiritBeastBondSummaryV147(state){
  let powerPct=0,bodyPct=0,defensePct=0,owned=0; const rows=[];
  for(const species of SPIRIT_BEAST_SPECIES_V147){
    const p=state?.items?.[species.id]; if(!p?.owned)continue;
    owned++; const stats=spiritBeastStatsV147(species,p),bond=spiritBeastBondContributionV147(species,p);
    powerPct+=bond.powerPct;bodyPct+=bond.bodyPct;defensePct+=bond.defensePct;
    rows.push({id:species.id,name:species.name,stats,bond,level:p.level,stars:spiritBeastStarsV147(p),levelCap:spiritBeastLevelCapV147(p)});
  }
  return {schema:SPIRIT_BEAST_SCHEMA_V147,owned,total:SPIRIT_BEAST_SPECIES_V147.length,powerPct:Number(powerPct.toFixed(3)),bodyPct:Number(bodyPct.toFixed(3)),defensePct:Number(defensePct.toFixed(3)),rows};
}
function passiveStrengthV147(stars){ return stars>=20?1.5:stars>=12?1.25:1; }
function effectScale(e,scale,passive,passiveStrength,statusDurationScale=1){
  const pct=(v=0)=>1+v*passiveStrength/100;
  if(e.type==='damage')return {...e,coefficient:e.coefficient*scale*pct(passive.skillDamagePct),breakDamagePct:(e.breakDamagePct??0)*pct(passive.breakPct)};
  if(e.type==='damageOverTime')return {...e,coefficientPerTick:e.coefficientPerTick*scale*pct(passive.dotDamagePct)};
  if(e.type==='shield')return {...e,capacity:e.capacity*scale*pct(passive.shieldPct),attackCoefficient:(e.attackCoefficient??0)*scale*pct(passive.shieldPct),maxHpPct:(e.maxHpPct??0)*pct(passive.shieldPct)};
  if(e.type==='applyStatus')return {...e,duration:e.duration*(e.statusId==='status.stun'?pct(passive.controlDurationPct):1)*statusDurationScale};
  return {...e};
}
export function spiritBeastCombatTriggersV147(state){
  if(!state?.activePetId)return [];
  const species=spiritBeastSpeciesV147(state.activePetId),p=state.items?.[state.activePetId]; if(!species||!p?.owned)return [];
  const stats=spiritBeastStatsV147(species,p),tune=SPIRIT_BEAST_COMBAT_TUNING_V147[species.id]??{powerScale:1,statusDurationScale:1,cooldownScale:1};
  const stars=spiritBeastStarsV147(p),baseScale=Math.max(.75,Math.min(2.1,stats.attack/220))*tune.powerScale,passive=species.passive.modifiers??{},passiveStrength=passiveStrengthV147(stars),cooldownMul=Math.max(.6,1-(passive.cooldownPct??0)*passiveStrength/100);
  return species.actives.filter(skill=>stars>=(skill.unlockStars??0)).map((skill,index)=>({id:`spirit-beast.v147.${species.id}.${skill.id}`,event:skill.trigger||'OnHit',chancePct:100,sourceTags:skill.trigger==='OnHit'?['ActiveHit']:undefined,cooldown:Math.max(2,(skill.cooldown??6)*cooldownMul*(stars>=20?.9:1)*tune.cooldownScale),effects:(skill.effects||[]).map(e=>effectScale(e,baseScale*(1+index*.05),passive,passiveStrength,tune.statusDurationScale))}));
}
export function spiritBeastViewV147(state,speciesId){
  const species=spiritBeastSpeciesV147(speciesId),p=state?.items?.[speciesId]; if(!species)return undefined;
  const progress=p??{owned:false,level:1,stars:0,specificFragments:0},stars=spiritBeastStarsV147(progress),stats=spiritBeastStatsV147(species,progress),bond=progress.owned?spiritBeastBondContributionV147(species,progress):{powerPct:0,bodyPct:0,defensePct:0};
  return {schema:SPIRIT_BEAST_SCHEMA_V147,speciesId:species.id,name:species.name,role:species.role,roleLabel:species.roleLabel,asset:species.asset,stats,bond,levelCap:spiritBeastLevelCapV147(progress),stars,starUpCost:SPIRIT_BEAST_FRAGMENT_PER_STAR_V147,passive:{...species.passive,unlocked:true},actives:species.actives.map(x=>({...x,unlockBloodline:x.unlockStars,unlocked:stars>=(x.unlockStars??0)})),active:state?.activePetId===speciesId};
}
export function spiritBeastStarUpV147(progress,count=1){
  if(!progress?.owned)throw new Error('Chưa sở hữu Linh Thú.');
  const wanted=Math.max(1,Math.floor(Number(count)||1)),possible=Math.floor(Math.max(0,progress.specificFragments||0)/SPIRIT_BEAST_FRAGMENT_PER_STAR_V147),done=Math.min(wanted,possible);
  if(done<=0)throw new Error(`Thiếu mảnh riêng Linh Thú: cần ${SPIRIT_BEAST_FRAGMENT_PER_STAR_V147}.`);
  progress.specificFragments-=done*SPIRIT_BEAST_FRAGMENT_PER_STAR_V147; progress.stars=spiritBeastStarsV147(progress)+done;
  return {stars:progress.stars,starsAdded:done,cost:done*SPIRIT_BEAST_FRAGMENT_PER_STAR_V147,levelCap:spiritBeastLevelCapV147(progress)};
}
function oldPetTargetId(id){ const m=/^pet\.(\d+)$/.exec(String(id)); if(!m)return undefined; const n=Math.max(1,Number(m[1])),idx=Math.floor((n-1)/6); return LEGACY_SPECIES_TO_V147[idx]??SPIRIT_BEAST_SPECIES_V147[idx%SPIRIT_BEAST_SPECIES_V147.length]?.id; }
export function migrateSpiritBeastsV147(state){
  state.items??={};state.genericFragments??={manual:0,artifact:0,pet:0,companion:0};
  let migrated=false,refund=0,starsGranted=0;
  if(!state.spiritBeastV86Migrated){
    const snapshot=Object.entries(state.items).filter(([id])=>/^pet\.\d+$/.test(id));
    if(snapshot.some(([id])=>Number(id.split('.')[1])>8)){
      const merged=new Map();
      for(const [id,p] of snapshot){const target=oldPetTargetId(id);if(!target)continue;const row=merged.get(target)??{owned:false,level:1,advance:0,specificFragments:0};row.owned=Boolean(row.owned||p.owned);row.level=Math.max(row.level,Math.max(1,Math.floor(p.level||1)));row.advance=Math.max(row.advance,Math.max(0,Math.min(5,Math.floor(p.advance||0))));row.specificFragments+=Math.max(0,Math.floor(p.specificFragments||0));merged.set(target,row);}
      for(const [id] of snapshot)delete state.items[id];for(const [id,p] of merged)state.items[id]=p;state.activePetId=oldPetTargetId(state.activePetId||'');migrated=true;
    }
    const gear=state.workshopV12328?.petGear||{};for(const g of Object.values(gear))for(const slot of ['claw','armor','charm']){const level=Math.max(0,Math.floor(Number(g?.[slot])||0));for(let i=0;i<level;i++)refund+=12+i*6;}
    if(refund>0)state.genericFragments.pet=(state.genericFragments.pet||0)+refund;if(state.workshopV12328)state.workshopV12328.petGear={};state.spiritBeastV86Migrated=true;state.spiritBeastV86GearRefund=Math.max(0,Math.floor(refund));
  }
  for(const species of SPIRIT_BEAST_SPECIES_V147){
    const p=state.items[species.id];if(!p)continue;
    if(!p.spiritBeastV147Migrated){const legacy=Math.max(0,Math.min(5,Math.floor(Number(p.advance)||0)));p.stars=Math.max(spiritBeastStarsV147(p),legacy*4);starsGranted+=legacy*4;p.advance=5;p.spiritBeastV147Migrated=true;migrated=true;}
    p.stars=spiritBeastStarsV147(p);p.level=Math.max(1,Math.floor(Number(p.level)||1));p.specificFragments=Math.max(0,Math.floor(Number(p.specificFragments)||0));
    if(p.owned&&p.specificFragments>=SPIRIT_BEAST_FRAGMENT_PER_STAR_V147){const auto=Math.floor(p.specificFragments/SPIRIT_BEAST_FRAGMENT_PER_STAR_V147);p.specificFragments-=auto*SPIRIT_BEAST_FRAGMENT_PER_STAR_V147;p.stars+=auto;starsGranted+=auto;migrated=true;}
    const cap=spiritBeastLevelCapV147(p);if(p.level>cap){p.level=cap;migrated=true;}
    // Keep legacy advance path hard-locked. Stars is the sole V147 progression authority.
    if(p.owned)p.advance=5;
  }
  state.spiritBeastV147Migrated=true;state.spiritBeastV147MigrationVersion=1;
  return {migrated,refund,starsGranted};
}
