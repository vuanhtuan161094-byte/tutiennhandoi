import { EQUIPMENT_SET_CATALOG_V116, LIVE_EQUIPMENT_SET_CATALOG_V12310 } from '../core/equipment-set-v116.js';
const legacyTemplates = [
    { id: 'equipment.qingfeng_sword', name: 'Thanh Phong Kiếm', slot: 'weapon', tags: ['Sword', 'Wind'], baseStats: { attack: 16, accuracy: 5 }, setId: 'set.qingfeng' },
    { id: 'equipment.qingfeng_boots', name: 'Thanh Phong Ngoa', slot: 'boots', tags: ['Wind', 'Movement'], baseStats: { mobility: 11, actionSpeed: 0.025 }, setId: 'set.qingfeng' },
    { id: 'equipment.qingfeng_head', name: 'Thanh Phong Quan', slot: 'head', tags: ['Wind', 'Sword'], baseStats: { accuracy: 8, critChancePct: 9 }, setId: 'set.qingfeng' },
    { id: 'equipment.thunder_robe', name: 'Lôi Văn Pháp Bào', slot: 'robe', tags: ['Lightning', 'Spirit'], baseStats: { maxHp: 72, defense: 8, maxSpirit: 12 }, setId: 'set.thunder_rune' },
    { id: 'equipment.thunder_ring', name: 'Lôi Văn Giới', slot: 'accessory', tags: ['Lightning', 'Spirit'], baseStats: { maxSpirit: 18, critChancePct: 12 }, setId: 'set.thunder_rune' },
    { id: 'equipment.stoneheart_talisman', name: 'Thạch Tâm Hộ Phù', slot: 'accessory', tags: ['Earth', 'Defense', 'EarlySidegrade'], baseStats: { maxHp: 58, defense: 6, resolve: 9 } },
    { id: 'equipment.cloudstep_token', name: 'Lưu Vân Bộ Lệnh', slot: 'accessory', tags: ['Wind', 'Movement', 'EarlySidegrade'], baseStats: { mobility: 8, accuracy: 7, actionSpeed: 0.018, controlPower: 3 } },
    { id: 'equipment.thunder_sword', name: 'Dẫn Lôi Kiếm', slot: 'weapon', tags: ['Sword', 'Lightning'], baseStats: { attack: 18, critChancePct: 7 }, setId: 'set.thunder_rune' },
    { id: 'equipment.thunder_boots', name: 'Thiểm Lôi Ngoa', slot: 'boots', tags: ['Lightning', 'Movement'], baseStats: { mobility: 9, actionSpeed: 0.03 }, setId: 'set.thunder_rune' },
    { id: 'equipment.black_iron_blade', name: 'Huyền Thiết Trọng Nhận', slot: 'weapon', tags: ['Forging', 'Heavy'], baseStats: { attack: 23, accuracy: -3 } },
    { id: 'equipment.black_iron_armor', name: 'Huyền Thiết Giáp', slot: 'robe', tags: ['Forging', 'Heavy'], baseStats: { maxHp: 105, defense: 15, mobility: -4 } },
    { id: 'equipment.herbalist_charm', name: 'Bách Thảo Dược Phù', slot: 'accessory', tags: ['Alchemy', 'Herb'], baseStats: { maxSpirit: 15, resolve: 8 } },
    { id: 'equipment.purple_mirror_robe', name: 'Tử Kính Huyền Bào', slot: 'robe', tags: ['PurplePalace', 'Mirror', 'Spirit'], baseStats: { maxHp: 128, defense: 18, maxSpirit: 20 }, setId: 'set.purple_mirror' },
    { id: 'equipment.purple_mirror_crown', name: 'Tử Kính Huyền Quan', slot: 'head', tags: ['PurplePalace', 'Mirror'], baseStats: { resolve: 16, controlPower: 11, accuracy: 8 }, setId: 'set.purple_mirror' },
    { id: 'equipment.purple_mirror_boots', name: 'Tử Hà Bộ Vân Ngoa', slot: 'boots', tags: ['PurplePalace', 'Movement'], baseStats: { mobility: 13, actionSpeed: 0.035 }, setId: 'set.purple_mirror' },
    { id: 'equipment.purple_mirror_ring', name: 'Tử Phủ Huyền Giới', slot: 'accessory', tags: ['PurplePalace', 'Spirit'], baseStats: { maxSpirit: 34, resolve: 9, critChancePct: 8 }, setId: 'set.purple_mirror' },
    { id: 'equipment.golden_core_blade', name: 'Kim Đan Liệt Dương Đao', slot: 'weapon', tags: ['GoldenCore', 'Fire', 'Heavy'], baseStats: { attack: 29, critChancePct: 8 }, setId: 'set.golden_core' },
    { id: 'equipment.golden_core_robe', name: 'Kim Văn Đạo Bào', slot: 'robe', tags: ['GoldenCore', 'Spirit'], baseStats: { maxHp: 142, defense: 17, maxSpirit: 22 }, setId: 'set.golden_core' },
    { id: 'equipment.golden_core_ring', name: 'Đan Văn Linh Giới', slot: 'accessory', tags: ['GoldenCore', 'Core'], baseStats: { maxSpirit: 42, critChancePct: 11, accuracy: 7 }, setId: 'set.golden_core' },
    { id: 'equipment.starfall_sword', name: 'Tinh Lạc Kiếm', slot: 'weapon', tags: ['Sword', 'Star', 'GoldenCore'], baseStats: { attack: 27, accuracy: 10, critChancePct: 9 } },
    { id: 'equipment.soul_crown', name: 'Dưỡng Hồn Quan', slot: 'head', tags: ['Soul', 'NascentSoul'], baseStats: { maxSpirit: 38, resolve: 18, controlPower: 11 }, setId: 'set.soul_nourishing' },
    { id: 'equipment.soul_robe', name: 'Dưỡng Hồn Huyền Bào', slot: 'robe', tags: ['Soul', 'NascentSoul'], baseStats: { maxHp: 158, defense: 18, maxSpirit: 44, resolve: 16 }, setId: 'set.soul_nourishing' },
    { id: 'equipment.soul_ring', name: 'Phân Hồn Linh Giới', slot: 'accessory', tags: ['Soul', 'Clone', 'NascentSoul'], baseStats: { maxSpirit: 52, controlPower: 16, accuracy: 9 }, setId: 'set.soul_nourishing' },
    { id: 'equipment.soul_boots', name: 'Xuất Khiếu Vân Ngoa', slot: 'boots', tags: ['Soul', 'Movement', 'NascentSoul'], baseStats: { mobility: 15, actionSpeed: 0.04, resolve: 8 }, setId: 'set.soul_nourishing' },
];
const legacySets = [
    { id: 'set.soul_nourishing', name: 'Dưỡng Hồn Phân Quang Bộ', category: 'legacy', description: 'Bộ Nguyên Anh thiên Thần Hồn và điều khiển.', bonuses: [{ pieces: 2, name: 'Hồn Quang Đồng Tức', description: 'Linh lực, Định Lực và Khống Chế cùng tăng.', statMultipliers: { maxSpirit: .14, resolve: .08, controlPower: .08 } }, { pieces: 4, name: 'Nguyên Anh Hộ Thần', description: 'Khai chiến kết hồn quang hộ thể.', statMultipliers: { actionSpeed: .05 }, grantedTags: ['Resonance:SoulNourishing'], triggers: [{ id: 'Nguyên Anh Hộ Thần [Trang Bị]', event: 'OnBattleStart', chancePct: 100, effects: [{ type: 'shield', capacity: 240, stability: 150, duration: 12 }] }] }] },
    { id: 'set.purple_mirror', name: 'Tử Kính Huyền Quang Bộ', category: 'legacy', description: 'Bộ Tử Phủ thiên thần niệm, định lực và hộ thể.', bonuses: [{ pieces: 2, name: 'Tử Phủ Tàng Quang', description: 'Linh lực và Định Lực tăng.', statMultipliers: { maxSpirit: .14 }, flatStats: { resolve: 14 } }, { pieces: 4, name: 'Huyền Kính Hộ Thể', description: 'Khai chiến tạo hộ thuẫn.', grantedTags: ['Resonance:PurpleMirror'], triggers: [{ id: 'Tử Kính Hộ Thể [Trang Bị]', event: 'OnBattleStart', chancePct: 100, effects: [{ type: 'shield', capacity: 180, stability: 110, duration: 10 }] }] }] },
    { id: 'set.golden_core', name: 'Kim Đan Văn Bộ', category: 'legacy', description: 'Bộ Kim Đan thiên bộc phát.', bonuses: [{ pieces: 2, name: 'Đan Văn Đồng Chấn', description: 'Công kích và Linh lực cùng tăng.', statMultipliers: { attack: .10, maxSpirit: .10 } }, { pieces: 3, name: 'Kim Đan Hồi Chuyển', description: 'Bạo kích ActiveHit có xác suất hồi Linh Lực.', grantedTags: ['Resonance:GoldenCore'], triggers: [{ id: 'Kim Đan Hồi Chuyển [Trang Bị]', event: 'OnCrit', chancePct: 24, sourceTags: ['ActiveHit'], cooldown: 1.2, effects: [{ type: 'restoreSpirit', flat: 9 }] }] }] },
    { id: 'set.qingfeng', name: 'Thanh Phong Kiếm Bộ', category: 'legacy', description: 'Bộ du kích Kiếm Tu.', bonuses: [{ pieces: 2, name: 'Phong Hành', description: 'Mệnh Trung và Thân Pháp tăng.', statMultipliers: { accuracy: .10, mobility: .08 } }, { pieces: 3, name: 'Kiếm Tùy Phong Chuyển', description: 'Nhịp hành động nhanh hơn.', statMultipliers: { actionSpeed: .06 }, grantedTags: ['Resonance:Qingfeng'] }] },
    { id: 'set.thunder_rune', name: 'Lôi Văn Bộ', category: 'legacy', description: 'Trang bị cùng hệ Lôi văn.', bonuses: [{ pieces: 2, name: 'Tụ Lôi', description: 'Linh lực +12%; bạo kích tăng nhẹ.', statMultipliers: { maxSpirit: .12 }, flatStats: { critChancePct: 12 } }, { pieces: 4, name: 'Lôi Minh Cộng Hưởng', description: 'Bạo kích ActiveHit có thể sinh Lôi Ấn.', grantedTags: ['Resonance:ThunderRune'], triggers: [{ id: 'Lôi Minh Cộng Hưởng [Trang Bị]', event: 'OnCrit', chancePct: 25, sourceTags: ['ActiveHit'], effects: [{ type: 'addMark', mark: 'Lôi Ấn', stacks: 1, maxStacks: 10 }], cooldown: .5 }] }] },
];
/** v0.98 generic set content stays registry-only for old saves. New random loot excludes LegacySetV98 templates. */
const legacyAttireSetThemesV98 = [
    { id: 'taithanh', name: 'Thái Thanh Kiếm Cốt', tag: 'Metal', style: 'offense' },
    { id: 'thanhlien', name: 'Thanh Liên Trường Sinh', tag: 'Wood', style: 'survival' },
    { id: 'huyenminh', name: 'Huyền Minh Băng Phách', tag: 'Water', style: 'spirit' },
    { id: 'lietduong', name: 'Liệt Dương Phần Thiên', tag: 'Fire', style: 'offense' },
    { id: 'hautho', name: 'Hậu Thổ Trấn Nhạc', tag: 'Earth', style: 'survival' },
    { id: 'cuutieu', name: 'Cửu Tiêu Lôi Đình', tag: 'Lightning', style: 'offense' },
    { id: 'truyphong', name: 'Vạn Lý Truy Phong', tag: 'Wind', style: 'speed' },
    { id: 'huyethai', name: 'Huyết Hải Chiến Thể', tag: 'Blood', style: 'survival' },
    { id: 'thaiam', name: 'Thái Âm U Minh', tag: 'Yin', style: 'spirit' },
    { id: 'thuanduong', name: 'Thuần Dương Vô Cực', tag: 'Yang', style: 'balanced' },
    { id: 'phanquang', name: 'Nguyên Thần Phân Quang', tag: 'Soul', style: 'spirit' },
    { id: 'tinhha', name: 'Tinh Hà Vạn Kiếm', tag: 'Metal', style: 'balanced' },
];
const legacyJewelrySetThemesV98 = [
    { id: 'nguhanh', name: 'Ngũ Hành Quy Nguyên', tag: 'Earth', style: 'balanced' },
    { id: 'thienco', name: 'Thiên Cơ Định Tâm', tag: 'Soul', style: 'spirit' },
    { id: 'tula', name: 'Tu La Huyết Ngọc', tag: 'Blood', style: 'offense' },
    { id: 'cuuchuyen', name: 'Cửu Chuyển Kim Đan', tag: 'Fire', style: 'survival' },
    { id: 'hukhong', name: 'Hư Không Tàng Giới', tag: 'Wind', style: 'speed' },
    { id: 'vanphap', name: 'Vạn Pháp Đạo Ấn', tag: 'Yang', style: 'spirit' },
    { id: 'amduong', name: 'Âm Dương Đồng Tâm', tag: 'Yin', style: 'balanced' },
    { id: 'hondon', name: 'Hỗn Độn Nguyên Châu', tag: 'Metal', style: 'balanced' },
];
const attireSlots = [
    { slot: 'weapon', suffix: 'weapon', label: 'Đạo Binh', baseStats: { attack: 18, critChancePct: 5 } },
    { slot: 'head', suffix: 'head', label: 'Đạo Quan', baseStats: { maxSpirit: 18, critChancePct: 4 } },
    { slot: 'robe', suffix: 'robe', label: 'Pháp Bào', baseStats: { maxHp: 92, defense: 10 } },
    { slot: 'belt', suffix: 'belt', label: 'Huyền Đái', baseStats: { maxHp: 58, defense: 6, maxSpirit: 10 } },
    { slot: 'gloves', suffix: 'gloves', label: 'Hộ Uyển', baseStats: { attack: 8, armorPenPct: 2.5 } },
    { slot: 'boots', suffix: 'boots', label: 'Vân Ngoa', baseStats: { actionSpeed: .02, dodgeChancePct: 3, mobility: 7 } },
];
const jewelrySlots = [
    { slot: 'necklace', suffix: 'necklace', label: 'Ngọc Bội', baseStats: { maxSpirit: 22, heartChancePct: 4 } },
    { slot: 'ring', suffix: 'ring', label: 'Đạo Giới', baseStats: { attack: 6, critChancePct: 8 } },
    { slot: 'bracelet', suffix: 'bracelet', label: 'Linh Trạc', baseStats: { maxHp: 44, defense: 5, damageReductionPct: 1.5 } },
    { slot: 'talisman', suffix: 'talisman', label: 'Hộ Phù', baseStats: { maxSpirit: 16, controlDurationReductionPct: 4 } },
];
/** Alpha.23.10: four accessory slots are stat/affix gear, not a second Set system. */
export const v12310AccessoryTemplates = [
    { id: 'equipment.v12310.accessory.lingyu_necklace', name: 'Thanh Linh Ngọc Bội', slot: 'necklace', tags: ['V12310', 'Accessory', 'TargetLoot'], baseStats: { maxSpirit: 24, heartChancePct: 4 } },
    { id: 'equipment.v12310.accessory.pojun_ring', name: 'Phá Quân Đạo Giới', slot: 'ring', tags: ['V12310', 'Accessory', 'TargetLoot'], baseStats: { attack: 7, critChancePct: 8 } },
    { id: 'equipment.v12310.accessory.xuanyu_bracelet', name: 'Huyền Ngọc Linh Trạc', slot: 'bracelet', tags: ['V12310', 'Accessory', 'TargetLoot'], baseStats: { maxHp: 48, defense: 6, damageReductionPct: 1.5 } },
    { id: 'equipment.v12310.accessory.dingshen_talisman', name: 'Định Thần Hộ Phù', slot: 'talisman', tags: ['V12310', 'Accessory', 'TargetLoot'], baseStats: { maxSpirit: 18, controlDurationReductionPct: 4 } },
];
function themeMultipliers(style) {
    if (style === 'offense')
        return { attack: .10 };
    if (style === 'survival')
        return { maxHp: .10, defense: .08 };
    if (style === 'spirit')
        return { maxSpirit: .12 };
    if (style === 'speed')
        return { actionSpeed: .045 };
    return { attack: .06, maxHp: .06, maxSpirit: .06 };
}
function makeLegacyAttireSetV98(theme) {
    const setId = `set.attire.${theme.id}`;
    const templates = attireSlots.map(part => ({ id: `equipment.attire.${theme.id}.${part.suffix}`, name: `${theme.name} · ${part.label}`, slot: part.slot, tags: ['LegacySetV98', 'AttireSet', theme.tag, ...(theme.id === 'tinhha' ? ['Sword', 'Star'] : [])], baseStats: { ...part.baseStats }, setId }));
    const set = { id: setId, name: `${theme.name} · Cựu Bộ`, category: 'legacy', description: 'Bộ v0.98 chỉ giữ để tương thích save cũ; không còn nằm trong pool set V1 mới.', bonuses: [
            { pieces: 2, name: 'Đồng Khí', description: 'Cộng hưởng legacy.', statMultipliers: themeMultipliers(theme.style) },
            { pieces: 4, name: 'Hợp Mạch', description: 'Cộng hưởng legacy.', statMultipliers: theme.style === 'offense' ? { attack: .08, maxSpirit: .06 } : theme.style === 'survival' ? { maxHp: .08, defense: .06 } : theme.style === 'speed' ? { actionSpeed: .035, dodgeChancePct: .05 } : { maxSpirit: .08, attack: .04 } },
            { pieces: 6, name: 'Viên Bộ', description: 'Cộng hưởng legacy.', statMultipliers: { attack: .06, maxHp: .06, maxSpirit: .06 }, grantedTags: [`LegacyResonance:Attire:${theme.id}`] },
        ] };
    return { set, templates };
}
function makeLegacyJewelrySetV98(theme) {
    const setId = `set.jewelry.${theme.id}`;
    const templates = jewelrySlots.map(part => ({ id: `equipment.jewelry.${theme.id}.${part.suffix}`, name: `${theme.name} · ${part.label}`, slot: part.slot, tags: ['LegacySetV98', 'JewelrySet', theme.tag], baseStats: { ...part.baseStats }, setId }));
    const set = { id: setId, name: `${theme.name} · Cựu Trang Sức`, category: 'legacy', description: 'Bộ v0.98 chỉ giữ để tương thích save cũ; không còn nằm trong pool set V1 mới.', bonuses: [
            { pieces: 2, name: 'Song Bảo Đồng Minh', description: 'Cộng hưởng legacy.', statMultipliers: themeMultipliers(theme.style) },
            { pieces: 4, name: 'Tứ Bảo Quy Nhất', description: 'Cộng hưởng legacy.', flatStats: theme.style === 'offense' ? { critChancePct: 14, armorPenPct: 7 } : theme.style === 'survival' ? { damageReductionPct: 7, healingReceivedPct: 10 } : theme.style === 'speed' ? { dodgeChancePct: 10, actionSpeed: .05 } : theme.style === 'spirit' ? { spiritEfficiencyPct: 10, controlDurationReductionPct: 12 } : { heartChancePct: 8, critChancePct: 8 }, grantedTags: [`LegacyResonance:Jewelry:${theme.id}`] },
        ] };
    return { set, templates };
}
function makeV116Set(entry) {
    const slots = entry.category === 'attire' ? attireSlots : jewelrySlots;
    const prefix = entry.category === 'attire' ? 'equipment.v116.attire' : 'equipment.v116.jewelry';
    const templates = slots.map(part => ({
        id: `${prefix}.${entry.key}.${part.suffix}`,
        name: `${entry.name} · ${part.label}`,
        slot: part.slot,
        tags: ['SetV116', entry.category === 'attire' ? 'AttireSet' : 'JewelrySet', ...entry.tags],
        baseStats: { ...part.baseStats },
        setId: entry.id,
    }));
    const set = {
        id: entry.id,
        name: entry.name,
        category: entry.category,
        description: entry.description,
        bonuses: entry.mechanics.map(mechanic => ({
            pieces: mechanic.pieces,
            name: mechanic.name,
            description: mechanic.description,
            grantedTags: [`SetV116Hook:${mechanic.mechanic}`],
        })),
    };
    return { set, templates };
}
const legacyGeneratedAttire = legacyAttireSetThemesV98.map(makeLegacyAttireSetV98);
const legacyGeneratedJewelry = legacyJewelrySetThemesV98.map(makeLegacyJewelrySetV98);
const generatedV116 = EQUIPMENT_SET_CATALOG_V116.map(makeV116Set);
/** Alpha.23.10 public equipment Sets: only 5 Ngũ Hành attire Sets remain live. Historical templates stay registered for save migration only. */
export const attireSetThemes = LIVE_EQUIPMENT_SET_CATALOG_V12310;
export const jewelrySetThemes = [];
export const equipmentTemplates = [
    ...legacyTemplates,
    ...v12310AccessoryTemplates,
    ...legacyGeneratedAttire.flatMap(x => x.templates),
    ...legacyGeneratedJewelry.flatMap(x => x.templates),
    ...generatedV116.flatMap(x => x.templates),
];
export const equipmentSets = [
    ...legacySets,
    ...legacyGeneratedAttire.map(x => x.set),
    ...legacyGeneratedJewelry.map(x => x.set),
    ...generatedV116.map(x => x.set),
];
//# sourceMappingURL=equipment.js.map