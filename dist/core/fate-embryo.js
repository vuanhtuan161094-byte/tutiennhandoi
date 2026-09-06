import { reincarnationOrientations } from './reincarnation.js';
const DOMAINS = ['body', 'soul', 'dao', 'technique', 'bloodline', 'artifact', 'chaos', 'creation'];
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function round2(value) { return Math.round(value * 100) / 100; }
function fateHash(seed, salt) { let x = (seed ^ salt) >>> 0; x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return (x >>> 0) / 4294967296; }
function gradeForFate(base, capacities) {
    const avg = Object.values(capacities).reduce((a, b) => a + b, 0) / 8;
    const score = base * 0.45 + avg * 0.55;
    if (score >= 190)
        return 'Sáng Thế Thai';
    if (score >= 160)
        return 'Hỗn Độn Thai';
    if (score >= 135)
        return 'Tiên Thai';
    if (score >= 116)
        return 'Đạo Thai';
    if (score >= 103)
        return 'Linh Thai';
    return 'Phàm Thai';
}
const mutationNames = { twin_soul: 'Song Hồn Đồng Thai', reverse_meridian: 'Nghịch Mạch Thiên Thai', dao_echo: 'Tiên Thiên Đạo Hồi', blood_cauldron: 'Vạn Huyết Dung Lô', artifact_womb: 'Bản Mệnh Bảo Thai' };
export function emptyMingJiDomains() {
    return { body: 0, soul: 0, dao: 0, technique: 0, bloodline: 0, artifact: 0, chaos: 0, creation: 0 };
}
export function normalizeMingJiDomains(source) {
    const base = emptyMingJiDomains();
    for (const id of DOMAINS)
        base[id] = Math.max(0, Number(source?.[id] ?? 0) || 0);
    return base;
}
/**
 * Luật Mệnh Thai: Căn Nguyên/Mệnh Cơ cộng vào nền trước, rồi đặc tính đời hiện tại mới điều chỉnh.
 * Không dùng compounding theo số đời.
 */
export function createFateEmbryoState(meta = {}, birth = {}, generation = (meta.completedLives ?? 0) + 1, orientationId = 'balanced') {
    const domains = normalizeMingJiDomains(meta.mingJiDomains);
    const mingJi = Math.max(0, meta.mingJi ?? 0);
    const aptitude = clamp(birth.aptitude ?? 50, 0, 100);
    const luck = clamp(birth.luck ?? 50, 0, 100);
    const physique = birth.physiqueId ? 1 : 0;
    const bloodline = birth.bloodlineId ? 1 : 0;
    const purity = clamp(birth.bloodlinePurity ?? 0, 0, 100);
    // First-life-ish values sit around 100 so old balance is preserved. Permanent domain base then lifts the ceiling linearly.
    const common = mingJi * 0.018;
    const capacities = {
        body: 92 + aptitude * 0.12 + physique * 5 + domains.body * 0.55 + common,
        soul: 94 + aptitude * 0.07 + luck * 0.05 + domains.soul * 0.58 + common,
        dao: 92 + aptitude * 0.08 + luck * 0.04 + domains.dao * 0.62 + common,
        technique: 94 + aptitude * 0.10 + domains.technique * 0.55 + common,
        bloodline: 91 + aptitude * 0.05 + bloodline * (4 + purity * 0.045) + domains.bloodline * 0.58 + common,
        artifact: 96 + luck * 0.05 + domains.artifact * 0.52 + common,
        chaos: 82 + aptitude * 0.05 + domains.chaos * 0.70 + common,
        creation: 76 + luck * 0.04 + domains.creation * 0.78 + common,
    };
    const orientation = reincarnationOrientations[orientationId] ?? reincarnationOrientations.balanced;
    for (const id of DOMAINS)
        capacities[id] = round2(Math.max(55, capacities[id] + (orientation.capacityModifiers[id] ?? 0)));
    let mutationId;
    const seed = (birth.seed ?? generation * 2654435761) >>> 0;
    const mutationChance = Math.min(0.28, 0.018 + luck * 0.00045 + Math.log1p(mingJi) * 0.012);
    if (fateHash(seed, 0x9e3779b9) < mutationChance) {
        const ids = ['twin_soul', 'reverse_meridian', 'dao_echo', 'blood_cauldron', 'artifact_womb'];
        mutationId = ids[Math.floor(fateHash(seed, 0x85ebca6b) * ids.length)];
        if (mutationId === 'twin_soul') {
            capacities.soul += 18;
            capacities.dao += 8;
            capacities.body -= 6;
        }
        if (mutationId === 'reverse_meridian') {
            capacities.technique += 16;
            capacities.body += 5;
            capacities.soul -= 5;
        }
        if (mutationId === 'dao_echo') {
            capacities.dao += 20;
            capacities.technique += 8;
            capacities.bloodline -= 6;
        }
        if (mutationId === 'blood_cauldron') {
            capacities.bloodline += 22;
            capacities.body += 8;
            capacities.dao -= 7;
        }
        if (mutationId === 'artifact_womb') {
            capacities.artifact += 24;
            capacities.soul += 5;
            capacities.technique -= 6;
        }
    }
    for (const id of DOMAINS)
        capacities[id] = round2(Math.max(55, capacities[id]));
    const basePotential = round2(100 + mingJi * 0.10 + (aptitude - 50) * 0.05 + (orientation.basePotentialModifier ?? 0));
    const manifestationBonusSlots = Math.max(0, Math.floor((mingJi + domains.dao * 2 + domains.soul + domains.creation * 2) / 450) + (orientation.manifestationBonus ?? 0));
    const grade = gradeForFate(basePotential, capacities);
    return { generation, sourceMingJi: round2(mingJi), basePotential, capacities, manifestationBonusSlots, orientationId: orientation.id, grade, mutationId, mutationName: mutationId ? mutationNames[mutationId] : undefined };
}
export function cloneFateEmbryoState(state) {
    if (!state)
        return undefined;
    return { ...state, capacities: { ...state.capacities } };
}
export function summarizeFateEmbryo(state, development) {
    const raw = {
        body: (clamp(development.bodyCondition, 0, 100) * 0.80 + clamp(development.chaosDevelopment, 0, 100) * 0.20),
        soul: (clamp(development.soulStrength, 0, 100) + clamp(development.soulPurity, 0, 100)) / 2,
        dao: clamp(development.daoDepth, 0, 100),
        technique: clamp(development.techniqueMastery, 0, 100),
        bloodline: clamp(development.bloodlinePurity, 0, 100),
        artifact: clamp(development.artifactMaturity, 0, 100),
        chaos: clamp(development.chaosDevelopment, 0, 100),
        creation: clamp(development.creationDevelopment, 0, 100),
    };
    const utilizationPct = emptyMingJiDomains();
    for (const id of DOMAINS)
        utilizationPct[id] = round2(raw[id] / Math.max(1, state.capacities[id]) * 100);
    const limitingDomain = DOMAINS.slice().sort((a, b) => utilizationPct[b] - utilizationPct[a])[0];
    return { ...state, capacities: { ...state.capacities }, utilizationPct, limitingDomain, limitingUtilizationPct: utilizationPct[limitingDomain] };
}
/** Permanent base is expressed at equal realm, but is deliberately linear rather than compounded per life. */
export function applyFateEmbryoToEntity(entity, state, summary) {
    if (!state || state.sourceMingJi <= 0)
        return entity;
    const base = Math.max(0, state.basePotential - 100) / 100;
    const body = Math.max(0, state.capacities.body - 100) / 100;
    const soul = Math.max(0, state.capacities.soul - 100) / 100;
    const dao = Math.max(0, state.capacities.dao - 100) / 100;
    const technique = Math.max(0, state.capacities.technique - 100) / 100;
    const bloodline = Math.max(0, state.capacities.bloodline - 100) / 100;
    const over = (id) => clamp(((summary?.utilizationPct[id] ?? 0) - 100) / 100, 0, 0.75);
    // Vượt Mệnh Thai không xóa tiến độ đã luyện; nó làm phần sức mạnh vượt khuôn khó biểu hiện.
    // Vì vậy Vĩnh Sinh vẫn chơi tiếp được, nhưng đổi Mệnh Thai qua luân hồi sẽ giải phóng hiệu suất bị nghẽn.
    const bodyLimit = 1 - over('body') * 0.28, soulLimit = 1 - over('soul') * 0.24, daoLimit = 1 - over('dao') * 0.26;
    const techLimit = 1 - over('technique') * 0.20, bloodLimit = 1 - over('bloodline') * 0.18;
    const chaosLimit = 1 - over('chaos') * 0.12, creationLimit = 1 - over('creation') * 0.14;
    return { ...entity, tags: [...new Set([...entity.tags, 'MingTai', `MingTaiGen:${state.generation}`])], stats: { ...entity.stats,
            maxHp: entity.stats.maxHp * (1 + base * 0.42 + body * 0.30) * bodyLimit * chaosLimit,
            maxSpirit: entity.stats.maxSpirit * (1 + base * 0.38 + soul * 0.30) * soulLimit * creationLimit,
            attack: entity.stats.attack * (1 + base * 0.34 + dao * 0.20 + technique * 0.12 + bloodline * 0.08) * daoLimit * techLimit * bloodLimit * creationLimit,
            defense: entity.stats.defense * (1 + base * 0.34 + body * 0.25) * bodyLimit * chaosLimit,
            mobility: entity.stats.mobility * (1 + base * 0.12 + technique * 0.18 + bloodline * 0.06) * techLimit * bloodLimit,
            accuracy: entity.stats.accuracy * (1 + base * 0.12 + technique * 0.16 + dao * 0.08) * techLimit * daoLimit,
            controlPower: entity.stats.controlPower * (1 + base * 0.14 + soul * 0.16 + dao * 0.12) * soulLimit * daoLimit,
            resolve: entity.stats.resolve * (1 + base * 0.18 + body * 0.16 + soul * 0.12) * bodyLimit * soulLimit,
            actionSpeed: entity.stats.actionSpeed * (1 + base * 0.10 + technique * 0.12) * techLimit,
        } };
}
export function effectiveManifestationCapacity(baseCapacity, state) {
    return Math.max(0, baseCapacity + (state?.manifestationBonusSlots ?? 0));
}
//# sourceMappingURL=fate-embryo.js.map