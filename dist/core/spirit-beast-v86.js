import {
  SPIRIT_BEAST_SCHEMA_V147,
  SPIRIT_BEAST_SPECIES_V147,
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

// V147 is canonical. These V86 symbols are compatibility aliases so old imports
// continue to work without preserving a second gameplay authority.
export const SPIRIT_BEAST_SCHEMA_V86 = SPIRIT_BEAST_SCHEMA_V147;
export const SPIRIT_BEAST_MAX_BLOODLINE_V86 = 5;
export const SPIRIT_BEAST_SPECIES_V86 = SPIRIT_BEAST_SPECIES_V147;
export const SPIRIT_BEAST_BOND_MAX_BUDGET_V129 = SPIRIT_BEAST_BOND_MAX_BUDGET_V147;
export const SPIRIT_BEAST_COMBAT_TUNING_V108 = SPIRIT_BEAST_COMBAT_TUNING;

export const spiritBeastSpeciesV86 = spiritBeastSpeciesV147;
export const spiritBeastStatsV86 = spiritBeastStatsV147;
export const spiritBeastBondContributionV86 = spiritBeastBondContributionV147;
export const spiritBeastBondSummaryV86 = spiritBeastBondSummaryV147;
export const spiritBeastCombatTriggersV86 = spiritBeastCombatTriggersV147;
export const migrateSpiritBeastsV86 = migrateSpiritBeastsV147;

// Legacy collection code asks for one pet cap before it passes the item id.
// Return the highest currently unlocked cap; V147 stat/view logic still clamps
// each individual beast to its own star-derived cap.
export function spiritBeastLevelCapV86(state){
  const pets=SPIRIT_BEAST_SPECIES_V147.map(x=>state?.items?.[x.id]).filter(x=>x?.owned);
  return pets.length?Math.max(...pets.map(spiritBeastLevelCapV147)):spiritBeastLevelCapV147(0);
}

export function spiritBeastViewV86(state,speciesId){
  const view=spiritBeastViewV147(state,speciesId);
  if(!view)return view;
  return {...view,bloodline:view.stars,maxBloodline:Math.max(5,view.stars)};
}
