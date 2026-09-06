export const thanhHaFactions = {
    'faction.grand_luo_conclave': {
        id: 'faction.grand_luo_conclave', name: 'Đại La Luận Đạo Minh', locationId: 'location.grand_luo_fruit_heaven',
        doctrineTags: ['ImmortalOrthodoxy', 'Dao', 'GrandLuo', 'Council'], initialPrestige: 780, initialStability: 86,
        initialTreasury: { 'resource.spirit_stone': 250000, 'resource.grand_luo_origin': 180, 'resource.king_domain_core': 80 },
        facilities: { spiritVein: 9, scriptureHall: 10, alchemyHall: 7, forgeHall: 8, formationHall: 10 },
        archive: { techniqueIds: ['technique.sword_breath'], skillIds: ['skill.sword_step'], recipeIds: [] }, initialNpcMembers: [],
    },
    'faction.myriad_dao_court': {
        id: 'faction.myriad_dao_court', name: 'Vạn Đạo Vương Đình', locationId: 'location.ten_thousand_domain_king_court',
        doctrineTags: ['ImmortalOrthodoxy', 'Authority', 'Domain', 'King'], initialPrestige: 980, initialStability: 82,
        initialTreasury: { 'resource.spirit_stone': 420000, 'resource.king_domain_core': 240, 'resource.emperor_mandate_fragment': 70 },
        facilities: { spiritVein: 11, scriptureHall: 11, alchemyHall: 8, forgeHall: 10, formationHall: 12 },
        archive: { techniqueIds: ['technique.sword_breath'], skillIds: ['skill.triple_chain_sword'], recipeIds: [] }, initialNpcMembers: [],
    },
    'faction.celestial_mandate_palace': {
        id: 'faction.celestial_mandate_palace', name: 'Thiên Mệnh Đế Cung', locationId: 'location.emperor_mandate_palace',
        doctrineTags: ['ImmortalOrthodoxy', 'Mandate', 'Emperor', 'Order'], initialPrestige: 1320, initialStability: 91,
        initialTreasury: { 'resource.spirit_stone': 880000, 'resource.emperor_mandate_fragment': 260, 'resource.extremity_shard': 45 },
        facilities: { spiritVein: 13, scriptureHall: 13, alchemyHall: 10, forgeHall: 12, formationHall: 14 },
        archive: { techniqueIds: ['technique.sword_breath'], skillIds: ['skill.white_rainbow_slash'], recipeIds: [] }, initialNpcMembers: [],
    },
    'faction.thanh_hu_sect': {
        id: 'faction.thanh_hu_sect',
        name: 'Thanh Hư Tông',
        locationId: 'location.thanh_hu_sect',
        doctrineTags: ['Sword', 'Orthodox', 'Transmission'],
        initialTreasury: {
            'resource.spirit_stone': 860,
            'resource.spirit_herb': 120,
            'resource.black_iron_ore': 75,
        },
        facilities: {
            spiritVein: 3,
            scriptureHall: 3,
            alchemyHall: 1,
            forgeHall: 2,
            formationHall: 1,
        },
        archive: {
            techniqueIds: ['technique.qingmu', 'technique.sword_breath'],
            skillIds: ['skill.white_rainbow_slash', 'skill.triple_chain_sword', 'skill.sword_step'],
            recipeIds: ['recipe.forging.black_iron_blade', 'recipe.talisman.mind_guard'],
        },
        initialNpcMembers: [
            { npcId: 'npc.luo_qingyao', rank: 'coreDisciple' },
            { npcId: 'npc.mo_changfeng', rank: 'coreDisciple' },
            { npcId: 'npc.su_wanning', rank: 'innerDisciple' },
        ],
    },
};
//# sourceMappingURL=factions.js.map