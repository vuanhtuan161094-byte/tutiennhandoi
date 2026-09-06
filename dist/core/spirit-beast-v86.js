export const SPIRIT_BEAST_SCHEMA_V86 = 'spirit-beast.v86';
export const SPIRIT_BEAST_MAX_BLOODLINE_V86 = 5;
const dmg = (coefficient, breakDamagePct = 0, element) => ({ type: 'damage', coefficient, sourceTag: 'Summon', canCrit: false, canDodge: true, canHeart: false, procCoefficient: 0, breakDamagePct, elementalCoefficients: element ? { [element]: 1 } : undefined });
const dot = (coefficientPerTick, ticks, element = 'Poison') => ({ type: 'damageOverTime', coefficientPerTick, ticks, interval: 1, procCoefficient: 0, element });
const shield = (attackCoefficient, maxHpPct = 0) => ({ type: 'shield', capacity: 0, stability: 0, duration: 6, attackCoefficient, maxHpPct, overflowDamageRatio: .15 });
const status = (statusId, duration, target = 'target') => ({ type: 'applyStatus', statusId, duration, target });
export const SPIRIT_BEAST_SPECIES_V86 = [
    { id: 'pet.1', name: 'Xích Viêm Sư', grade: 'heaven', role: 'DPS', roleLabel: 'Bạo phát đơn mục tiêu', description: 'Linh thú hỏa hệ chuyên ép Boss và khuếch đại cửa sổ bạo phát.', asset: '/assets/huntv2/beasts/light-lion.png', base: { hp: 1050, attack: 118, defense: 72 }, growth: { hp: .058, attack: .068, defense: .048 }, passive: { id: 'pet.1.passive', name: 'Viêm Tâm', kind: 'passive', unlockBloodline: 0, description: 'Kỹ năng Xích Viêm Sư gây thêm sát thương; Huyết Mạch III/V tăng hiệu lực Nội Tại.', modifiers: { skillDamagePct: 12 } }, actives: [
            { id: 'pet.1.skill1', name: 'Viêm Trảo', kind: 'active', unlockBloodline: 0, cooldown: 5, trigger: 'OnHit', description: 'Trợ kích hỏa trảo đơn mục tiêu.', effects: [dmg(.38, 5, 'Fire')] },
            { id: 'pet.1.skill2', name: 'Liệt Diễm Phệ', kind: 'active', unlockBloodline: 2, cooldown: 9, trigger: 'OnHit', description: 'Đốt mục tiêu trong vài nhịp.', effects: [dot(.10, 4, 'Fire')] },
            { id: 'pet.1.skill3', name: 'Sư Vương Nộ', kind: 'active', unlockBloodline: 4, cooldown: 15, trigger: 'OnHit', description: 'Bạo phát lớn và phá phòng mục tiêu.', effects: [dmg(.72, 16, 'Fire'), status('status.armor_fracture', 4)] },
        ] },
    { id: 'pet.2', name: 'Huyền Giáp Quy', grade: 'earth', role: 'TANK', roleLabel: 'Hộ chủ · Khiên', description: 'Linh thú phòng thủ, giúp chủ nhân chịu được các nhịp sát thương lớn.', asset: '/assets/huntv2/beasts/ice-tortoise.png', base: { hp: 1420, attack: 70, defense: 124 }, growth: { hp: .071, attack: .043, defense: .071 }, passive: { id: 'pet.2.passive', name: 'Huyền Giáp', kind: 'passive', unlockBloodline: 0, description: 'Khiên do Huyền Giáp Quy tạo ra mạnh hơn; Huyết Mạch III/V tăng hiệu lực Nội Tại.', modifiers: { shieldPct: 18 } }, actives: [
            { id: 'pet.2.skill1', name: 'Quy Giáp Chấn', kind: 'active', unlockBloodline: 0, cooldown: 6, trigger: 'OnHit', description: 'Chấn kích và tạo khiên nhỏ.', effects: [dmg(.24, 8, 'Earth'), shield(.08, 2)] },
            { id: 'pet.2.skill2', name: 'Trấn Nhạc', kind: 'active', unlockBloodline: 2, cooldown: 10, trigger: 'OnDamageTaken', description: 'Khi chủ nhân chịu đòn, dựng khiên hộ chủ.', effects: [shield(.16, 5)] },
            { id: 'pet.2.skill3', name: 'Huyền Giáp Phản Chấn', kind: 'active', unlockBloodline: 4, cooldown: 16, trigger: 'OnDamageTaken', description: 'Phản chấn mạnh khi chịu sát thương.', effects: [dmg(.48, 18, 'Earth'), shield(.10, 3)] },
        ] },
    { id: 'pet.3', name: 'Mộng Linh Hồ', grade: 'heaven', role: 'CONTROL', roleLabel: 'Khống chế · Giải buff', description: 'Linh hồ thiên về làm chậm nhịp đối thủ và mở cơ hội cho build chính.', asset: '/assets/huntv2/beasts/dark-fox.png', base: { hp: 980, attack: 96, defense: 76 }, growth: { hp: .052, attack: .059, defense: .051 }, passive: { id: 'pet.3.passive', name: 'Mộng Ảnh', kind: 'passive', unlockBloodline: 0, description: 'Khống chế của Mộng Linh Hồ kéo dài hơn; Huyết Mạch III/V tăng hiệu lực Nội Tại.', modifiers: { controlDurationPct: 20 } }, actives: [
            { id: 'pet.3.skill1', name: 'Mộng Hỏa', kind: 'active', unlockBloodline: 0, cooldown: 6, trigger: 'OnHit', description: 'Niệm hỏa gây sát thương linh hồn.', effects: [dmg(.30, 4, 'Soul')] },
            { id: 'pet.3.skill2', name: 'Mị Tâm', kind: 'active', unlockBloodline: 2, cooldown: 11, trigger: 'OnHit', description: 'Gây sát thương và làm choáng ngắn.', effects: [dmg(.24, 4, 'Soul'), status('status.stun', 1.1)] },
            { id: 'pet.3.skill3', name: 'Phá Mộng', kind: 'active', unlockBloodline: 4, cooldown: 16, trigger: 'OnHit', description: 'Xé trạng thái phòng thủ và làm mục tiêu suy yếu.', effects: [dmg(.44, 10, 'Soul'), status('status.soul_exposed', 4)] },
        ] },
    { id: 'pet.4', name: 'Thanh Vân Hạc', grade: 'mystic', role: 'SUPPORT', roleLabel: 'Hỗ trợ · Nhịp chiến', description: 'Linh hạc hỗ trợ nhịp kỹ năng và bảo vệ chủ nhân thay vì chạy theo raw DPS.', asset: '/assets/huntv2/beasts/wind-phoenix.png', base: { hp: 990, attack: 88, defense: 80 }, growth: { hp: .054, attack: .052, defense: .054 }, passive: { id: 'pet.4.passive', name: 'Thanh Phong Linh Tức', kind: 'passive', unlockBloodline: 0, description: 'Kỹ năng trợ chiến hồi nhanh hơn; Huyết Mạch III/V tăng hiệu lực Nội Tại.', modifiers: { cooldownPct: 12 } }, actives: [
            { id: 'pet.4.skill1', name: 'Phong Vũ', kind: 'active', unlockBloodline: 0, cooldown: 6, trigger: 'OnHit', description: 'Phong nhận trợ kích.', effects: [dmg(.27, 4, 'Wind')] },
            { id: 'pet.4.skill2', name: 'Tường Vân Hộ Chủ', kind: 'active', unlockBloodline: 2, cooldown: 11, trigger: 'OnDamageTaken', description: 'Tạo khiên nhẹ khi chủ nhân chịu đòn.', effects: [shield(.10, 3)] },
            { id: 'pet.4.skill3', name: 'Thanh Phong Gia Trì', kind: 'active', unlockBloodline: 4, cooldown: 17, trigger: 'OnHit', description: 'Gia trì tốc độ hành động trong thời gian ngắn.', effects: [status('status.wind_step', 5, 'self')] },
        ] },
    { id: 'pet.5', name: 'Lôi Ảnh Lang', grade: 'earth', role: 'DPS', roleLabel: 'Liên kích · Tốc chiến', description: 'Linh lang tốc độ cao, nhiều lần trợ kích và gây Phá Thế ổn định.', asset: '/assets/huntv2/beasts/thunder-wolf.png', base: { hp: 1040, attack: 108, defense: 78 }, growth: { hp: .056, attack: .064, defense: .050 }, passive: { id: 'pet.5.passive', name: 'Lôi Bộ', kind: 'passive', unlockBloodline: 0, description: 'Kỹ năng trợ kích hồi nhanh hơn; Huyết Mạch III/V tăng hiệu lực Nội Tại.', modifiers: { cooldownPct: 15 } }, actives: [
            { id: 'pet.5.skill1', name: 'Lôi Nha', kind: 'active', unlockBloodline: 0, cooldown: 4.5, trigger: 'OnHit', description: 'Lôi kích nhanh.', effects: [dmg(.29, 7, 'Lightning')] },
            { id: 'pet.5.skill2', name: 'Truy Ảnh', kind: 'active', unlockBloodline: 2, cooldown: 8, trigger: 'OnHit', description: 'Hai nhịp lôi kích liên tiếp.', effects: [dmg(.22, 5, 'Lightning'), dmg(.22, 5, 'Lightning')] },
            { id: 'pet.5.skill3', name: 'Thiên Lôi Phác Sát', kind: 'active', unlockBloodline: 4, cooldown: 14, trigger: 'OnHit', description: 'Đòn lôi sát mạnh thiên về Phá Thế.', effects: [dmg(.58, 22, 'Lightning')] },
        ] },
    { id: 'pet.6', name: 'Bích Linh Lộc', grade: 'mystic', role: 'SUPPORT', roleLabel: 'Thanh tẩy · Hộ chủ', description: 'Linh lộc bảo hộ, giải trạng thái xấu và tạo lớp phòng vệ vừa phải.', asset: '/assets/huntv2/beasts/wood-stag.png', base: { hp: 1160, attack: 78, defense: 94 }, growth: { hp: .062, attack: .047, defense: .060 }, passive: { id: 'pet.6.passive', name: 'Bích Mộc Sinh Cơ', kind: 'passive', unlockBloodline: 0, description: 'Khiên hộ chủ mạnh hơn; Huyết Mạch III/V tăng hiệu lực Nội Tại.', modifiers: { shieldPct: 20 } }, actives: [
            { id: 'pet.6.skill1', name: 'Lộc Ảnh', kind: 'active', unlockBloodline: 0, cooldown: 6, trigger: 'OnHit', description: 'Mộc linh trợ kích.', effects: [dmg(.25, 3, 'Wood')] },
            { id: 'pet.6.skill2', name: 'Thanh Tâm', kind: 'active', unlockBloodline: 2, cooldown: 12, trigger: 'OnDamageTaken', description: 'Gỡ một nhóm trạng thái bất lợi và tạo khiên.', effects: [{ type: 'removeStatus', groups: ['Debuff', 'BodyControl', 'SpiritControl'], target: 'self' }, shield(.08, 2)] },
            { id: 'pet.6.skill3', name: 'Vạn Mộc Hộ Thể', kind: 'active', unlockBloodline: 4, cooldown: 18, trigger: 'OnDamageTaken', description: 'Dựng khiên lớn bảo hộ chủ nhân.', effects: [shield(.18, 6)] },
        ] },
    { id: 'pet.7', name: 'U Minh Xà', grade: 'immortal', role: 'DOT', roleLabel: 'Độc · Suy yếu', description: 'Linh xà tích độc và kéo dài áp lực trên mục tiêu lâu sống.', asset: '/assets/huntv2/beasts/water-dragon.png', base: { hp: 1010, attack: 110, defense: 72 }, growth: { hp: .054, attack: .066, defense: .047 }, passive: { id: 'pet.7.passive', name: 'U Minh Độc Tức', kind: 'passive', unlockBloodline: 0, description: 'Độc thương theo thời gian mạnh hơn; Huyết Mạch III/V tăng hiệu lực Nội Tại.', modifiers: { dotDamagePct: 20 } }, actives: [
            { id: 'pet.7.skill1', name: 'Độc Nha', kind: 'active', unlockBloodline: 0, cooldown: 5.5, trigger: 'OnHit', description: 'Cắn độc và để lại DoT.', effects: [dmg(.22, 3, 'Poison'), dot(.07, 4, 'Poison')] },
            { id: 'pet.7.skill2', name: 'U Minh Thực Cốt', kind: 'active', unlockBloodline: 2, cooldown: 10, trigger: 'OnHit', description: 'Làm mục tiêu suy yếu trước độc.', effects: [status('status.poison_weakened', 5), dot(.09, 5, 'Poison')] },
            { id: 'pet.7.skill3', name: 'Vạn Độc Phệ Tâm', kind: 'active', unlockBloodline: 4, cooldown: 16, trigger: 'OnHit', description: 'Đại độc thuật kéo dài.', effects: [dmg(.34, 8, 'Poison'), dot(.12, 6, 'Poison')] },
        ] },
    { id: 'pet.8', name: 'Sơn Nhạc Hùng', grade: 'earth', role: 'BRUISER', roleLabel: 'Phá Thế · Cận chiến', description: 'Linh hùng nặng, bền và đặc biệt hữu dụng trước Boss có cơ chế Phá Thế.', asset: '/assets/huntv2/beasts/earth-qilin.png', base: { hp: 1280, attack: 96, defense: 108 }, growth: { hp: .066, attack: .057, defense: .066 }, passive: { id: 'pet.8.passive', name: 'Sơn Nhạc Thể', kind: 'passive', unlockBloodline: 0, description: 'Đòn Linh Thú gây Phá Thế mạnh hơn; Huyết Mạch III/V tăng hiệu lực Nội Tại.', modifiers: { breakPct: 25 } }, actives: [
            { id: 'pet.8.skill1', name: 'Chấn Sơn Chưởng', kind: 'active', unlockBloodline: 0, cooldown: 6, trigger: 'OnHit', description: 'Đòn nặng gây Phá Thế.', effects: [dmg(.30, 14, 'Earth')] },
            { id: 'pet.8.skill2', name: 'Hùng Bão', kind: 'active', unlockBloodline: 2, cooldown: 10, trigger: 'OnHit', description: 'Đánh mạnh làm mục tiêu mất thăng bằng.', effects: [dmg(.38, 14, 'Earth'), status('status.predator_off_balance', 3)] },
            { id: 'pet.8.skill3', name: 'Sơn Băng Địa Liệt', kind: 'active', unlockBloodline: 4, cooldown: 16, trigger: 'OnHit', description: 'Đại kích có Phá Thế rất cao.', effects: [dmg(.62, 30, 'Earth')] },
        ] },
];
const BY_ID = new Map(SPIRIT_BEAST_SPECIES_V86.map(x => [x.id, x]));
export function spiritBeastSpeciesV86(id) { return BY_ID.get(id); }
export function spiritBeastLevelCapV86(state) { const lv = Math.max(1, Math.floor(state.cave?.facilities?.find(x => x.id === 'beast')?.level ?? 1)); return Math.min(50, 10 + lv * 5); }
export function spiritBeastStatsV86(species, p) { const level = Math.max(1, Math.min(50, Math.floor(p.level || 1))), bloodline = Math.max(0, Math.min(SPIRIT_BEAST_MAX_BLOODLINE_V86, Math.floor(p.advance || 0))); const hm = 1 + bloodline * .12; return { hp: Math.round(species.base.hp * (1 + (level - 1) * species.growth.hp) * hm), attack: Math.round(species.base.attack * (1 + (level - 1) * species.growth.attack) * hm), defense: Math.round(species.base.defense * (1 + (level - 1) * species.growth.defense) * hm) }; }
export const SPIRIT_BEAST_BOND_MAX_BUDGET_V129 = Object.freeze({
    'pet.1': { powerPct: 5.6, bodyPct: 2.6, defensePct: 2.3 },
    'pet.2': { powerPct: 2.6, bodyPct: 5.5, defensePct: 5.2 },
    'pet.3': { powerPct: 3.8, bodyPct: 3.0, defensePct: 3.0 },
    'pet.4': { powerPct: 3.2, bodyPct: 3.6, defensePct: 3.4 },
    'pet.5': { powerPct: 5.1, bodyPct: 3.0, defensePct: 2.7 },
    'pet.6': { powerPct: 2.8, bodyPct: 4.6, defensePct: 4.2 },
    'pet.7': { powerPct: 5.3, bodyPct: 3.1, defensePct: 2.5 },
    'pet.8': { powerPct: 3.6, bodyPct: 4.6, defensePct: 4.5 },
});
export function spiritBeastBondContributionV86(species, p) {
    const max = SPIRIT_BEAST_BOND_MAX_BUDGET_V129[species.id] ?? { powerPct: 0, bodyPct: 0, defensePct: 0 };
    const level = Math.max(1, Math.min(50, Math.floor(p.level || 1)));
    const bloodline = Math.max(0, Math.min(5, Math.floor(p.advance || 0)));
    const levelFactor = 0.20 + 0.80 * ((level - 1) / 49);
    const bloodlineFactor = 0.65 + 0.35 * (bloodline / 5);
    const factor = levelFactor * bloodlineFactor;
    return {
        powerPct: Number((max.powerPct * factor).toFixed(3)),
        bodyPct: Number((max.bodyPct * factor).toFixed(3)),
        defensePct: Number((max.defensePct * factor).toFixed(3)),
    };
}
export function spiritBeastBondSummaryV86(state) { let powerPct = 0, bodyPct = 0, defensePct = 0, owned = 0; const rows = []; for (const species of SPIRIT_BEAST_SPECIES_V86) {
    const p = state.items?.[species.id];
    if (!p?.owned)
        continue;
    owned++;
    const stats = spiritBeastStatsV86(species, p), bond = spiritBeastBondContributionV86(species, p);
    powerPct += bond.powerPct;
    bodyPct += bond.bodyPct;
    defensePct += bond.defensePct;
    rows.push({ id: species.id, name: species.name, stats, bond, level: p.level, bloodline: p.advance });
} return { schema: SPIRIT_BEAST_SCHEMA_V86, owned, total: SPIRIT_BEAST_SPECIES_V86.length, powerPct: Number(powerPct.toFixed(3)), bodyPct: Number(bodyPct.toFixed(3)), defensePct: Number(defensePct.toFixed(3)), rows }; }
function passiveStrengthV86(bloodline) { return bloodline >= 5 ? 1.5 : bloodline >= 3 ? 1.25 : 1; }
function effectScale(e, scale, passive, passiveStrength, statusDurationScale = 1) { const pct = (v = 0) => 1 + v * passiveStrength / 100; if (e.type === 'damage')
    return { ...e, coefficient: e.coefficient * scale * pct(passive.skillDamagePct), breakDamagePct: (e.breakDamagePct ?? 0) * pct(passive.breakPct) }; if (e.type === 'damageOverTime')
    return { ...e, coefficientPerTick: e.coefficientPerTick * scale * pct(passive.dotDamagePct) }; if (e.type === 'shield')
    return { ...e, capacity: e.capacity * scale * pct(passive.shieldPct), attackCoefficient: (e.attackCoefficient ?? 0) * scale * pct(passive.shieldPct), maxHpPct: (e.maxHpPct ?? 0) * pct(passive.shieldPct) }; if (e.type === 'applyStatus')
    return { ...e, duration: e.duration * (e.statusId === 'status.stun' ? pct(passive.controlDurationPct) : 1) * statusDurationScale }; return { ...e }; }
export function spiritBeastCombatTriggersV86(state) { if (!state?.activePetId)
    return []; const species = spiritBeastSpeciesV86(state.activePetId), p = state.items?.[state.activePetId]; if (!species || !p?.owned)
    return []; const stats = spiritBeastStatsV86(species, p), tune = SPIRIT_BEAST_COMBAT_TUNING_V108[species.id] ?? { powerScale: 1, statusDurationScale: 1, cooldownScale: 1 }, baseScale = Math.max(.75, Math.min(2.1, stats.attack / 220)) * tune.powerScale, bloodline = Math.max(0, Math.min(5, Math.floor(p.advance || 0))), passive = species.passive.modifiers ?? {}, passiveStrength = passiveStrengthV86(bloodline), cooldownMul = Math.max(.6, 1 - (passive.cooldownPct ?? 0) * passiveStrength / 100); return species.actives.filter(skill => bloodline >= skill.unlockBloodline).map((skill, index) => ({ id: `spirit-beast.v86.${species.id}.${skill.id}`, event: skill.trigger || 'OnHit', chancePct: 100, sourceTags: skill.trigger === 'OnHit' ? ['ActiveHit'] : undefined, cooldown: Math.max(2, (skill.cooldown ?? 6) * cooldownMul * (bloodline >= 5 ? .9 : 1) * tune.cooldownScale), effects: (skill.effects || []).map(e => effectScale(e, baseScale * (1 + index * .05), passive, passiveStrength, tune.statusDurationScale)) })); }
export function spiritBeastViewV86(state, speciesId) { const species = spiritBeastSpeciesV86(speciesId), p = state.items?.[speciesId]; if (!species)
    return undefined; const progress = p ?? { owned: false, level: 1, advance: 0, specificFragments: 0 }; const stats = spiritBeastStatsV86(species, progress), bond = progress.owned ? spiritBeastBondContributionV86(species, progress) : { powerPct: 0, bodyPct: 0, defensePct: 0 }; const bloodline = Math.max(0, Math.min(5, Math.floor(progress.advance || 0))); return { schema: SPIRIT_BEAST_SCHEMA_V86, speciesId: species.id, name: species.name, role: species.role, roleLabel: species.roleLabel, asset: species.asset, stats, bond, levelCap: spiritBeastLevelCapV86(state), bloodline, maxBloodline: SPIRIT_BEAST_MAX_BLOODLINE_V86, passive: { ...species.passive, unlocked: true }, actives: species.actives.map(x => ({ ...x, unlocked: bloodline >= x.unlockBloodline })), active: state.activePetId === speciesId }; }
export const SPIRIT_BEAST_COMBAT_TUNING_V108 = Object.freeze({
    'pet.1': { powerScale: 1, statusDurationScale: 1, cooldownScale: 1 },
    'pet.2': { powerScale: .95, statusDurationScale: 1, cooldownScale: 1.05 },
    'pet.3': { powerScale: .90, statusDurationScale: .78, cooldownScale: 1.08 },
    'pet.4': { powerScale: 1.18, statusDurationScale: 1.05, cooldownScale: .92 },
    'pet.5': { powerScale: .95, statusDurationScale: 1, cooldownScale: 1.03 },
    'pet.6': { powerScale: 1, statusDurationScale: 1, cooldownScale: 1 },
    'pet.7': { powerScale: 1.28, statusDurationScale: 1.05, cooldownScale: .88 },
    'pet.8': { powerScale: 1, statusDurationScale: 1, cooldownScale: 1 },
});
const LEGACY_SPECIES_TO_V86 = ['pet.3', 'pet.1', 'pet.2', 'pet.4', 'pet.6', 'pet.5', 'pet.5', 'pet.8', 'pet.4', 'pet.7'];
function oldPetTargetId(id) { const m = /^pet\.(\d+)$/.exec(String(id)); if (!m)
    return undefined; const n = Math.max(1, Number(m[1])); const oldSpeciesIndex = Math.floor((n - 1) / 6); return LEGACY_SPECIES_TO_V86[oldSpeciesIndex] ?? SPIRIT_BEAST_SPECIES_V86[(oldSpeciesIndex % SPIRIT_BEAST_SPECIES_V86.length)]?.id; }
export function migrateSpiritBeastsV86(state) {
    if (state.spiritBeastV86Migrated)
        return { migrated: false, refund: 0 };
    const snapshot = Object.entries(state.items || {}).filter(([id]) => /^pet\.\d+$/.test(id));
    if (snapshot.some(([id]) => Number(id.split('.')[1]) > 8)) {
        const merged = new Map();
        for (const [id, p] of snapshot) {
            const target = oldPetTargetId(id);
            if (!target)
                continue;
            const row = merged.get(target) ?? { owned: false, level: 1, advance: 0, specificFragments: 0 };
            row.owned = Boolean(row.owned || p.owned);
            row.level = Math.max(row.level, Math.max(1, Math.floor(p.level || 1)));
            row.advance = Math.max(row.advance, Math.max(0, Math.min(5, Math.floor(p.advance || 0))));
            row.specificFragments += Math.max(0, Math.floor(p.specificFragments || 0));
            merged.set(target, row);
        }
        for (const [id] of snapshot)
            delete state.items[id];
        for (const [id, p] of merged)
            state.items[id] = p;
        state.activePetId = oldPetTargetId(state.activePetId || '');
    }
    let refund = 0;
    const gear = state.workshopV12328?.petGear || {};
    for (const g of Object.values(gear)) {
        for (const slot of ['claw', 'armor', 'charm']) {
            const level = Math.max(0, Math.floor(Number(g?.[slot]) || 0));
            for (let i = 0; i < level; i++)
                refund += 12 + i * 6;
        }
    }
    if (refund > 0)
        state.genericFragments.pet = (state.genericFragments.pet || 0) + refund;
    if (state.workshopV12328)
        state.workshopV12328.petGear = {};
    state.spiritBeastV86Migrated = true;
    state.spiritBeastV86GearRefund = Math.max(0, Math.floor(refund));
    return { migrated: true, refund };
}
//# sourceMappingURL=spirit-beast-v86.js.map