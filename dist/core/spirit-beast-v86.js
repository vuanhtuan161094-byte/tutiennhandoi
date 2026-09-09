import {
  SPIRIT_BEAST_SCHEMA_V147,
  SPIRIT_BEAST_SPECIES,
  SPIRIT_BEAST_COMBAT_TUNING,
  SPIRIT_BEAST_BOND_MAX_BUDGET_V147,
  spiritBeastSpeciesV147,
  spiritBeastLevelCapV147,
  spiritBeastStatsV147,
  spiritBeastBondContributionV147,
  spiritBeastBondSummaryV147,
  spiritBeastCombatTriggersV147,
  spiritBeastViewV147,
  migrateSpiritBeastsV147,
} from './spirit-beast-v147.js';

// V147 is canonical. These V86 symbols are compatibility aliases/read adapters so
// old imports and pre-migration fixtures continue to work without a second authority.
export const SPIRIT_BEAST_SCHEMA_V86 = SPIRIT_BEAST_SCHEMA_V147;
export const SPIRIT_BEAST_MAX_BLOODLINE_V86 = 5;
export const SPIRIT_BEAST_SPECIES_V86 = SPIRIT_BEAST_SPECIES;
export const SPIRIT_BEAST_BOND_MAX_BUDGET_V129 = SPIRIT_BEAST_BOND_MAX_BUDGET_V147;
export const SPIRIT_BEAST_COMBAT_TUNING_V108 = SPIRIT_BEAST_COMBAT_TUNING;

export const spiritBeastSpeciesV86 = spiritBeastSpeciesV147;
export const migrateSpiritBeastsV86 = migrateSpiritBeastsV147;

function legacyStarsV86(progress){
  if(Number.isFinite(Number(progress?.stars)))return Math.max(0,Math.floor(Number(progress.stars)));
  return Math.max(0,Math.min(5,Math.floor(Number(progress?.advance)||0)))*4;
}
function compatProgressV86(progress){return {...(progress??{}),stars:legacyStarsV86(progress)};}
function compatStateV86(state){
  if(!state?.items)return state;
  return {...state,items:Object.fromEntries(Object.entries(state.items).map(([id,p])=>[id,/^pet\.\d+$/.test(id)?compatProgressV86(p):p]))};
}

export function spiritBeastStatsV86(species,progress){return spiritBeastStatsV147(species,compatProgressV86(progress));}
export function spiritBeastBondContributionV86(species,progress){return spiritBeastBondContributionV147(species,compatProgressV86(progress));}
export function spiritBeastBondSummaryV86(state){return spiritBeastBondSummaryV147(compatStateV86(state));}
export function spiritBeastCombatTriggersV86(state){return spiritBeastCombatTriggersV147(compatStateV86(state));}

// Legacy collection code asks for one pet cap before it passes the item id.
// Return the highest currently unlocked cap; V147 stat/view logic still clamps
// each individual beast to its own star-derived cap.
export function spiritBeastLevelCapV86(state){
  const pets=SPIRIT_BEAST_SPECIES.map(x=>state?.items?.[x.id]).filter(x=>x?.owned);
  return pets.length?Math.max(...pets.map(p=>spiritBeastLevelCapV147(compatProgressV86(p)))):spiritBeastLevelCapV147(0);
}

export function spiritBeastViewV86(state,speciesId){
  const view=spiritBeastViewV147(compatStateV86(state),speciesId);
  if(!view)return view;
  return {...view,bloodline:view.stars,maxBloodline:Math.max(5,view.stars+1)};
}
