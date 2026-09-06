function npc(id, name, homeLocationId, startingAgeYears, startingRealmOrder, lifespanYears, potential, personality, goals, tags = [], simulationTier = 'important') {
    return {
        id, name, tags, simulationTier, homeLocationId, startingAgeYears, startingRealmOrder, lifespanYears, potential,
        personality, goals,
    };
}
export const thanhHaNpcs = {
    'npc.luo_qingyao': npc('npc.luo_qingyao', 'Lạc Thanh Dao', 'location.thanh_hu_sect', 19, 4, 136, 91, { ambition: 78, caution: 55, curiosity: 74, loyalty: 82, pride: 67 }, [{ id: 'goal.luo.sword', type: 'cultivate', priority: 92 }, { id: 'goal.luo.opportunity', type: 'seekOpportunity', priority: 70 }], ['Human', 'Cultivator', 'Sword']),
    'npc.han_musheng': npc('npc.han_musheng', 'Hàn Mộc Sinh', 'location.herb_market', 31, 3, 142, 78, { ambition: 52, caution: 76, curiosity: 70, loyalty: 61, pride: 38 }, [{ id: 'goal.han.opportunity', type: 'seekOpportunity', priority: 74 }, { id: 'goal.han.cultivate', type: 'cultivate', priority: 62 }], ['Human', 'Cultivator', 'Alchemy']),
    'npc.mo_changfeng': npc('npc.mo_changfeng', 'Mặc Trường Phong', 'location.thanh_hu_sect', 24, 5, 150, 84, { ambition: 93, caution: 42, curiosity: 61, loyalty: 48, pride: 88 }, [{ id: 'goal.mo.opportunity', type: 'seekOpportunity', priority: 95 }, { id: 'goal.mo.cultivate', type: 'cultivate', priority: 82 }], ['Human', 'Cultivator', 'Sword']),
    'npc.su_wanning': npc('npc.su_wanning', 'Tô Vãn Ninh', 'location.cloud_sea_city', 27, 4, 145, 82, { ambition: 64, caution: 88, curiosity: 65, loyalty: 75, pride: 44 }, [{ id: 'goal.su.cultivate', type: 'cultivate', priority: 80 }, { id: 'goal.su.explore', type: 'explore', priority: 50 }], ['Human', 'Cultivator', 'Talisman']),
    'npc.qin_shouyi': npc('npc.qin_shouyi', 'Tần Thủ Nhất', 'location.thanh_ha_town', 46, 2, 96, 47, { ambition: 28, caution: 91, curiosity: 22, loyalty: 86, pride: 25 }, [{ id: 'goal.qin.guard', type: 'guardHome', priority: 94 }, { id: 'goal.qin.cultivate', type: 'cultivate', priority: 35 }], ['Human', 'Cultivator', 'Guard'], 'background'),
    'npc.jiang_yue': npc('npc.jiang_yue', 'Giang Nguyệt', 'location.spirit_field_plain', 17, 1, 116, 86, { ambition: 72, caution: 59, curiosity: 92, loyalty: 53, pride: 35 }, [{ id: 'goal.jiang.explore', type: 'explore', priority: 88 }, { id: 'goal.jiang.opportunity', type: 'seekOpportunity', priority: 81 }], ['Human', 'Cultivator', 'Explorer']),
    'npc.xue_he': npc('npc.xue_he', 'Huyết Hà Tán Nhân', 'location.blood_river_gorge', 82, 12, 330, 87, { ambition: 96, caution: 58, curiosity: 52, loyalty: 11, pride: 91 }, [{ id: 'goal.xue.opportunity', type: 'seekOpportunity', priority: 90 }, { id: 'goal.xue.cultivate', type: 'cultivate', priority: 86 }], ['Human', 'Cultivator', 'Blood']),
    'npc.bai_ling': npc('npc.bai_ling', 'Bạch Linh', 'location.black_wind_forest', 34, 6, 174, 73, { ambition: 61, caution: 69, curiosity: 83, loyalty: 45, pride: 57 }, [{ id: 'goal.bai.explore', type: 'explore', priority: 84 }, { id: 'goal.bai.cultivate', type: 'cultivate', priority: 71 }], ['SpiritBeast', 'Fox']),
    'npc.yan_qingshan': npc('npc.yan_qingshan', 'Yến Thanh Sơn', 'location.thunder_valley', 58, 8, 210, 69, { ambition: 75, caution: 37, curiosity: 66, loyalty: 49, pride: 79 }, [{ id: 'goal.yan.cultivate', type: 'cultivate', priority: 88 }, { id: 'goal.yan.opportunity', type: 'seekOpportunity', priority: 68 }], ['Human', 'Cultivator', 'Lightning']),
    'npc.ziyun_zhenren': npc('npc.ziyun_zhenren', 'Tử Vân Chân Nhân', 'location.purple_mirror_lake', 248, 15, 620, 89, { ambition: 58, caution: 83, curiosity: 76, loyalty: 64, pride: 52 }, [{ id: 'goal.ziyun.cultivate', type: 'cultivate', priority: 88 }, { id: 'goal.ziyun.opportunity', type: 'seekOpportunity', priority: 72 }], ['Human', 'Cultivator', 'PurplePalace', 'Formation']),
    'npc.danxia_zhenren': npc('npc.danxia_zhenren', 'Đan Hà Chân Nhân', 'location.core_fire_mountain', 386, 18, 1180, 93, { ambition: 71, caution: 80, curiosity: 91, loyalty: 59, pride: 66 }, [{ id: 'goal.danxia.cultivate', type: 'cultivate', priority: 86 }, { id: 'goal.danxia.opportunity', type: 'seekOpportunity', priority: 80 }], ['Human', 'Cultivator', 'GoldenCore', 'Alchemy', 'Fire']),
    'npc.xingluo_jianke': npc('npc.xingluo_jianke', 'Tinh Lạc Kiếm Khách', 'location.starfall_cliff', 312, 17, 780, 90, { ambition: 82, caution: 49, curiosity: 68, loyalty: 43, pride: 87 }, [{ id: 'goal.xingluo.cultivate', type: 'cultivate', priority: 92 }, { id: 'goal.xingluo.explore', type: 'explore', priority: 76 }], ['Human', 'Cultivator', 'Sword', 'Star']),
    'npc.mingluo_sanren': npc('npc.mingluo_sanren', 'Minh La Tán Nhân', 'location.purple_mist_marsh', 274, 16, 710, 84, { ambition: 88, caution: 61, curiosity: 57, loyalty: 22, pride: 74 }, [{ id: 'goal.mingluo.opportunity', type: 'seekOpportunity', priority: 92 }, { id: 'goal.mingluo.cultivate', type: 'cultivate', priority: 79 }], ['Human', 'Cultivator', 'Poison', 'Wanderer']),
    'npc.old_gu': npc('npc.old_gu', 'Cố Lão Đầu', 'location.herb_market', 76, 1, 88, 31, { ambition: 12, caution: 94, curiosity: 41, loyalty: 70, pride: 18 }, [{ id: 'goal.gu.guard', type: 'guardHome', priority: 90 }], ['Human', 'Herbalist'], 'background'),
};
export const thanhHaOpportunities = {
    'opportunity.purple_mirror_heart': {
        id: 'opportunity.purple_mirror_heart', name: 'Tử Kính Tâm Nhãn', locationId: 'location.purple_mirror_lake',
        availableFromWorldYear: 70, expiresAtWorldYear: 180, difficulty: 165, value: 82,
        tags: ['Opportunity', 'PurplePalace', 'Spirit', 'Rare'], realmProgressBonus: 18,
    },
    'opportunity.starfall_sword_seed': {
        id: 'opportunity.starfall_sword_seed', name: 'Tinh Lạc Kiếm Chủng', locationId: 'location.starfall_cliff',
        availableFromWorldYear: 90, expiresAtWorldYear: 230, difficulty: 188, value: 96,
        tags: ['Opportunity', 'Sword', 'Star', 'Hidden'], realmProgressBonus: 22,
    },
    'opportunity.golden_core_fire_vein': {
        id: 'opportunity.golden_core_fire_vein', name: 'Đan Hỏa Địa Mạch', locationId: 'location.core_fire_mountain',
        availableFromWorldYear: 110, expiresAtWorldYear: 280, difficulty: 215, value: 108,
        tags: ['Opportunity', 'GoldenCore', 'Fire', 'Alchemy'], realmProgressBonus: 25,
    },
    'opportunity.riverside_spirit_spring': {
        id: 'opportunity.riverside_spirit_spring', name: 'Hà Biên Tiểu Linh Tuyền', locationId: 'location.thanh_ha_town',
        availableFromWorldYear: 0, expiresAtWorldYear: 30, difficulty: 8, value: 10,
        tags: ['Opportunity', 'FirstLife', 'Cultivation', 'Relationship'], realmProgressBonus: 1.5,
    },
    'opportunity.qingxu_sword_wall': {
        id: 'opportunity.qingxu_sword_wall', name: 'Thanh Hư Kiếm Bích', locationId: 'location.thanh_hu_sect',
        availableFromWorldYear: 6, expiresAtWorldYear: 24, difficulty: 58, value: 28,
        tags: ['Opportunity', 'Sword', 'Inheritance'], realmProgressBonus: 5,
    },
    'opportunity.hundred_herb_spring': {
        id: 'opportunity.hundred_herb_spring', name: 'Bách Thảo Linh Tuyền', locationId: 'location.herb_market',
        availableFromWorldYear: 12, expiresAtWorldYear: 34, difficulty: 52, value: 24,
        tags: ['Opportunity', 'Alchemy', 'Resource'], realmProgressBonus: 4,
    },
    'opportunity.blood_river_manor': {
        id: 'opportunity.blood_river_manor', name: 'Huyết Hà Cổ Phủ', locationId: 'location.blood_river_gorge',
        availableFromWorldYear: 18, expiresAtWorldYear: 50, difficulty: 92, value: 44,
        tags: ['Opportunity', 'Blood', 'Ancient'], realmProgressBonus: 8,
    },
    'opportunity.ancient_sword_inheritance': {
        id: 'opportunity.ancient_sword_inheritance', name: 'Cổ Kiếm Tàn Truyền', locationId: 'location.ancient_sword_cave',
        availableFromWorldYear: 25, expiresAtWorldYear: 65, difficulty: 105, value: 57,
        tags: ['Opportunity', 'Sword', 'Hidden'], realmProgressBonus: 11,
    },
    'opportunity.thunder_marrow_tide': {
        id: 'opportunity.thunder_marrow_tide', name: 'Lôi Tủy Triều', locationId: 'location.thunder_valley',
        availableFromWorldYear: 32, expiresAtWorldYear: 72, difficulty: 118, value: 63,
        tags: ['Opportunity', 'Lightning', 'Rare'], realmProgressBonus: 13,
    },
};
//# sourceMappingURL=npcs.js.map