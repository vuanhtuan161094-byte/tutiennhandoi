import { techniqueManualsV103 } from './techniques-v103.js';
import { techniqueContentV119 } from './technique-content-v119.js';
export const spiritualRoots = {
    mixed: {
        id: 'root.mixed', name: 'Tạp Linh Căn', tags: ['Root', 'Mixed'],
        affinities: { Wood: 40, Fire: 40, Metal: 40, Water: 40, Earth: 40, Lightning: 25, Wind: 25 },
    },
    wood: {
        id: 'root.wood', name: 'Mộc Linh Căn', tags: ['Root', 'Wood'], affinities: { Wood: 95, Life: 80 },
        combat: { maxHpMultiplier: 1.04, resolveMultiplier: 1.03 },
    },
    fire: {
        id: 'root.fire', name: 'Hỏa Linh Căn', tags: ['Root', 'Fire'], affinities: { Fire: 96, Yang: 72 },
        combat: { attackMultiplier: 1.05 },
    },
    metalFire: {
        id: 'root.metal_fire', name: 'Kim Hỏa Song Linh Căn', tags: ['Root', 'Metal', 'Fire'], affinities: { Metal: 82, Fire: 82, Sword: 76 },
        combat: { attackMultiplier: 1.04, accuracyMultiplier: 1.03 },
    },
    wind: {
        id: 'root.wind', name: 'Phong Linh Căn', tags: ['Root', 'Wind'], affinities: { Wind: 98, Space: 45 },
        combat: { mobilityMultiplier: 1.08, actionSpeedMultiplier: 1.04 },
    },
    lightning: {
        id: 'root.lightning', name: 'Lôi Linh Căn', tags: ['Root', 'Lightning'], affinities: { Lightning: 100, Yang: 58 },
        combat: { critChanceFlat: 12, actionSpeedMultiplier: 1.03 },
    },
    ice: {
        id: 'root.ice', name: 'Băng Linh Căn', tags: ['Root', 'Ice', 'Water'], affinities: { Ice: 96, Water: 80, Yin: 65 },
        combat: { resolveMultiplier: 1.05, controlPowerMultiplier: 1.04 },
    },
    fiveElements: {
        id: 'root.five_elements', name: 'Ngũ Hành Linh Căn', tags: ['Root', 'FiveElements'],
        affinities: { Wood: 66, Fire: 66, Metal: 66, Water: 66, Earth: 66 },
        combat: { maxSpiritMultiplier: 1.05 },
    },
};
export const characterTechniques = {
    qingmu: {
        id: 'technique.qingmu', name: '《Thanh Mộc Dẫn Khí Quyết》', tags: ['Wood', 'Stable', 'Purity'], preferredAffinities: ['Wood', 'Life'],
        combat: { maxHpMultiplier: 1.03, resolveMultiplier: 1.02 },
    },
    blazingYang: {
        id: 'technique.blazing_yang', name: '《Xích Dương Bạo Khí Công》', tags: ['Fire', 'Yang', 'Burst'], preferredAffinities: ['Fire', 'Yang'], combat: { attackMultiplier: 1.05 },
    },
    thunderMeridian: {
        id: 'technique.thunder_meridian', name: '《Kinh Lôi Chuyển Mạch Quyết》', tags: ['Lightning', 'Meridian', 'Speed'], preferredAffinities: ['Lightning'], combat: { actionSpeedMultiplier: 1.035, critChanceFlat: 6 },
    },
    coldMoon: {
        id: 'technique.cold_moon', name: '《Hàn Nguyệt Tĩnh Tâm Pháp》', tags: ['Ice', 'Yin', 'Purity'], preferredAffinities: ['Ice', 'Water', 'Yin'], combat: { resolveMultiplier: 1.05 },
    },
    devourSpirit: {
        id: 'technique.devour_spirit', name: '《Thôn Linh Quyết》', tags: ['Devour', 'Risk', 'Mixed'], combat: { maxSpiritMultiplier: 1.06 },
    },
    swordBreath: {
        id: 'technique.sword_breath', name: '《Thái Hư Kiếm Tức Quyết》', tags: ['Sword', 'Metal', 'Precision'],
        preferredAffinities: ['Sword', 'Metal'], combat: { attackMultiplier: 1.06, accuracyMultiplier: 1.05, critChanceFlat: 8 },
    },
    earthAbyss: {
        id: 'technique.earth_abyss', name: '《Hậu Thổ Trầm Nguyên Công》', tags: ['Earth', 'Body', 'Stable'],
        preferredAffinities: ['Earth'], combat: { maxHpMultiplier: 1.06, defenseMultiplier: 1.06, actionSpeedMultiplier: 0.98 },
    },
    azureSea: {
        id: 'technique.azure_sea', name: '《Bích Hải Quy Nguyên Kinh》', tags: ['Water', 'Spirit', 'Sustain'],
        preferredAffinities: ['Water'], combat: { maxSpiritMultiplier: 1.08, controlPowerMultiplier: 1.03 },
    },
    windBreath: {
        id: 'technique.wind_breath', name: '《Phong Hành Nạp Khí Thuật》', tags: ['Wind', 'Speed', 'Travel'],
        preferredAffinities: ['Wind'], combat: { mobilityMultiplier: 1.06, actionSpeedMultiplier: 1.045 },
    },
    bloodFurnace: {
        id: 'technique.blood_furnace', name: '《Huyết Luyện Chân Kinh》', tags: ['Blood', 'Body', 'Risk'],
        combat: { maxHpMultiplier: 1.08, attackMultiplier: 1.055, resolveMultiplier: 0.97 },
    },
    ...techniqueManualsV103,
    ...techniqueContentV119
};
// v1.03 metadata for the pre-existing inner-method catalog. These remain save-compatible IDs.
const legacyTechniqueMeta = {
    'technique.qingmu': { slot: 'inner', grade: 'spirit', school: 'universal', description: 'Mộc hệ tâm pháp ổn định, thiên về hồi phục và phòng thủ.', requiredRealmOrder: 0, masteryFloor: .30 },
    'technique.blazing_yang': { slot: 'inner', grade: 'spirit', school: 'spell', description: 'Hỏa hệ tâm pháp bộc phát, thiên về tấn công.', requiredRealmOrder: 0, masteryFloor: .30 },
    'technique.thunder_meridian': { slot: 'inner', grade: 'mystic', school: 'spell', description: 'Lôi hệ tâm pháp thiên tốc độ và bạo kích.', requiredRealmOrder: 4, masteryFloor: .27 },
    'technique.cold_moon': { slot: 'inner', grade: 'mystic', school: 'spell', description: 'Hàn Nguyệt tâm pháp thiên ổn định và kháng khống chế.', requiredRealmOrder: 4, masteryFloor: .27 },
    'technique.devour_spirit': { slot: 'inner', grade: 'earth', school: 'blood', description: 'Thôn Linh ma công thiên bộc phát, đổi lại rủi ro phản phệ.', requiredRealmOrder: 10, masteryFloor: .22 },
    'technique.sword_breath': { slot: 'inner', grade: 'mystic', school: 'sword', description: 'Kiếm tức dưỡng trong đan điền, tăng phong mang và độ chính xác của Kiếm Tu.', requiredRealmOrder: 0, masteryFloor: .27 },
    'technique.earth_abyss': { slot: 'inner', grade: 'spirit', school: 'body', description: 'Hậu Thổ tâm pháp nặng nền, tăng thân thể và sức chịu đựng.', requiredRealmOrder: 0, masteryFloor: .30 },
    'technique.azure_sea': { slot: 'inner', grade: 'mystic', school: 'spell', description: 'Bích Hải quy nguyên, Chân Nguyên dày và ổn định.', requiredRealmOrder: 0, masteryFloor: .27 },
    'technique.wind_breath': { slot: 'inner', grade: 'spirit', school: 'martial', description: 'Phong hành tâm pháp lấy nhịp nhanh làm lợi thế.', requiredRealmOrder: 1, masteryFloor: .30 },
    'technique.blood_furnace': { slot: 'inner', grade: 'earth', school: 'blood', description: 'Huyết luyện chân kinh lấy khí huyết làm lò, mạnh nhanh nhưng rủi ro.', requiredRealmOrder: 10, masteryFloor: .22 },
};
for (const def of Object.values(characterTechniques)) {
    const meta = legacyTechniqueMeta[def.id];
    if (meta)
        Object.assign(def, meta);
}
export const characterPhysiques = {
    thunderBones: {
        id: 'physique.thunder_bones', name: 'Lôi Cốt Thể', tags: ['Body', 'Lightning'], combat: { defenseMultiplier: 1.04, resolveMultiplier: 1.03 },
        drawback: 'Tích Lôi quá mức vẫn có thể gây nội thương thân thể.',
    },
    clearSpirit: {
        id: 'physique.clear_spirit', name: 'Thanh Linh Thể', tags: ['Spirit', 'Purity'], combat: { maxSpiritMultiplier: 1.06, controlPowerMultiplier: 1.03 },
    },
    devouringSpirit: {
        id: 'physique.devouring_spirit', name: 'Phệ Linh Thể', tags: ['Devour', 'Risk'], combat: { maxSpiritMultiplier: 1.08, resolveMultiplier: 0.96 },
        drawback: 'Dung nạp dị chủng khiến phản phệ và xung đột tăng mạnh.',
    },
    swordBone: {
        id: 'physique.sword_bone', name: 'Kiếm Cốt Thể', tags: ['Body', 'Sword'],
        combat: { attackMultiplier: 1.055, accuracyMultiplier: 1.04, critChanceFlat: 8 },
    },
    blazingSun: {
        id: 'physique.blazing_sun', name: 'Liệt Dương Thể', tags: ['Body', 'Fire', 'Yang'],
        combat: { maxHpMultiplier: 1.04, attackMultiplier: 1.045 }, drawback: 'Âm/Hàn pháp môn khó cân bằng hơn.',
    },
    frostJade: {
        id: 'physique.frost_jade', name: 'Hàn Ngọc Thể', tags: ['Body', 'Ice', 'Yin'],
        combat: { defenseMultiplier: 1.035, resolveMultiplier: 1.055, actionSpeedMultiplier: 0.985 },
    },
    earthVessel: {
        id: 'physique.earth_vessel', name: 'Hậu Thổ Linh Thai', tags: ['Body', 'Earth'],
        combat: { maxHpMultiplier: 1.08, defenseMultiplier: 1.055, mobilityMultiplier: 0.96 },
    },
    windSpirit: {
        id: 'physique.wind_spirit', name: 'Phong Linh Chi Thể', tags: ['Wind', 'Movement'],
        combat: { mobilityMultiplier: 1.1, actionSpeedMultiplier: 1.04, defenseMultiplier: 0.98 },
    },
    poisonBody: {
        id: 'physique.hundred_poison', name: 'Bách Độc Thể', tags: ['Body', 'Poison'],
        combat: { maxHpMultiplier: 1.04, resolveMultiplier: 1.04 }, drawback: 'Linh lực thiên về độc tính, dễ gây phản phệ.',
    },
    bloodCauldron: {
        id: 'physique.blood_cauldron', name: 'Huyết Lô Thể', tags: ['Body', 'Blood'],
        combat: { maxHpMultiplier: 1.1, attackMultiplier: 1.04, maxSpiritMultiplier: 0.96 },
    },
    emptySpirit: {
        id: 'physique.empty_spirit', name: 'Không Linh Thể', tags: ['Spirit', 'Space'],
        combat: { mobilityMultiplier: 1.055, controlPowerMultiplier: 1.04, maxHpMultiplier: 0.97 },
    },
    yinYang: {
        id: 'physique.yin_yang', name: 'Âm Dương Hòa Thể', tags: ['Body', 'Yin', 'Yang'],
        combat: { maxHpMultiplier: 1.025, maxSpiritMultiplier: 1.025, resolveMultiplier: 1.025 },
    },
};
export const bloodlines = {
    ancientHuman: {
        id: 'bloodline.ancient_human', name: 'Cổ Nhân Tộc Huyết', tags: ['Human', 'Ancient'], combat: { resolveMultiplier: 1.035 },
        awakenedCombat: { accuracyMultiplier: 1.04, controlPowerMultiplier: 1.03 },
    },
    thunderBeast: {
        id: 'bloodline.thunder_beast', name: 'Lôi Thú Huyết', tags: ['BeastBlood', 'Lightning'], combat: { critChanceFlat: 7, mobilityMultiplier: 1.025 },
        awakenedCombat: { attackMultiplier: 1.045, actionSpeedMultiplier: 1.025 },
    },
    azureFloodDragon: {
        id: 'bloodline.azure_flood_dragon', name: 'Thanh Giao Huyết', tags: ['DragonBlood', 'Water'], combat: { maxHpMultiplier: 1.045, defenseMultiplier: 1.035 },
        awakenedCombat: { maxHpMultiplier: 1.05, resolveMultiplier: 1.05 },
    },
    vermilionBird: {
        id: 'bloodline.vermilion_bird', name: 'Chu Tước Tàn Huyết', tags: ['BirdBlood', 'Fire'], combat: { attackMultiplier: 1.035, maxSpiritMultiplier: 1.025 },
        awakenedCombat: { critPowerPerLayerFlat: 0.05, actionSpeedMultiplier: 1.035 },
    },
    whiteTiger: {
        id: 'bloodline.white_tiger', name: 'Bạch Hổ Tàn Huyết', tags: ['TigerBlood', 'Metal'], combat: { attackMultiplier: 1.045, accuracyMultiplier: 1.035 },
        awakenedCombat: { critChanceFlat: 10, attackMultiplier: 1.035 },
    },
    blackTortoise: {
        id: 'bloodline.black_tortoise', name: 'Huyền Vũ Tàn Huyết', tags: ['TortoiseBlood', 'Water', 'Earth'], combat: { maxHpMultiplier: 1.05, defenseMultiplier: 1.05, mobilityMultiplier: 0.98 },
        awakenedCombat: { resolveMultiplier: 1.06, defenseMultiplier: 1.04 },
    },
    woodSpirit: {
        id: 'bloodline.wood_spirit', name: 'Mộc Linh Huyết', tags: ['SpiritBlood', 'Wood', 'Life'], combat: { maxHpMultiplier: 1.025, maxSpiritMultiplier: 1.035 },
    },
    shadowWolf: {
        id: 'bloodline.shadow_wolf', name: 'Ảnh Lang Huyết', tags: ['WolfBlood', 'Shadow', 'Wind'], combat: { mobilityMultiplier: 1.045, actionSpeedMultiplier: 1.02 },
        awakenedCombat: { mobilityMultiplier: 1.055, critChanceFlat: 6 },
    },
};
export const rootNameToId = Object.fromEntries(Object.values(spiritualRoots).map(value => [value.name, value.id]));
export const physiqueNameToId = Object.fromEntries(Object.values(characterPhysiques).map(value => [value.name, value.id]));
export const bloodlineNameToId = Object.fromEntries(Object.values(bloodlines).map(value => [value.name, value.id]));
//# sourceMappingURL=character.js.map