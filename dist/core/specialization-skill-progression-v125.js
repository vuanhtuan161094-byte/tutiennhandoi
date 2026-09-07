import { battleDaoSkillGrowthMilestonesV126, battleDaoSkillGrowthProfileV126 } from './battle-dao-skill-growth-v126.js';
import { SKILL_COST_STANDARD_PCT_V117 } from './skill-runtime-v117.js';
import { BATTLE_DAO_IDS, BATTLE_DAO_NAMES, DAO_NATURE_TIER_IDS_V125, SKILL_MASTERY_MAX_V113, SKILL_PRACTICE_XP_MAX_V125, SKILL_PRACTICE_XP_PER_TIER_V125, cloneBuildFoundationV113, createSpecializationSkillProgressionV125, gainBattleDaoHanhV113, learnDaoPassiveV118, } from './build-foundation-v113.js';
import { sectManualSummaryV12310 } from './sect-manual-v12310.js';
import { ensureSkillHeartProgressionV12317, SKILL_GRADE_ORDER_V12317 } from './skill-heart-method-v12317.js';
import { battleDaoV2ActiveRealmGate, battleDaoV2ActiveSlotsUnlocked, battleDaoV2StarterPackage, battleDaoV2UnlockedRows, isBattleDaoV2ActiveSkill, } from '../content/battle-dao-v2-catalog.js';
import { combineStatPctV129 } from './combat-rules.js';
export const TRUC_CO_REALM_ORDER_V125 = 10;
export const SECONDARY_DAO_REALM_ORDER_V125 = 46;
export const BATTLE_DAO_ULTIMATE_REALM_ORDER_V125 = 10;
export const BATTLE_DAO_ACTIVE_REALM_GATES_V125 = [10, 18, 34, 46, 62, 74, 90, 102];
export const SKILL_PRACTICE_STAGE_TIERS_V125 = [100, 250, 500, 750, 1000];
export const SKILL_PRACTICE_STAGE_NAMES_V125 = { 100: 'Tiểu Thành', 250: 'Đại Thành', 500: 'Hóa Cảnh', 750: 'Viên Mãn', 1000: 'Cực Ý' };
export const PASSIVE_LEVEL_MAX_V125 = 20;
export const BATTLE_DAO_ACTIVE_LOADOUT_SLOTS_V125 = 5;
export const DAO_NATURE_NAMES_V125 = { orthodox: 'Chính Tu', demonic: 'Ma Tu', rogue: 'Tán Tu' };
export const DAO_NATURE_TIER_NAMES_V125 = { mundane: 'Phàm', spirit: 'Linh', mystic: 'Huyền', earth: 'Địa', heaven: 'Thiên', immortal: 'Tiên', extreme: 'Cực', breaker: 'Phá' };
export const DAO_NATURE_BRANCHES_V125 = {
    orthodox: ['orthodox.guard', 'orthodox.golden_body', 'orthodox.righteous_art'],
    demonic: ['demonic.demon_art', 'demonic.break_demon', 'demonic.demon_body'],
    rogue: ['rogue.solitary', 'rogue.hundred_refine', 'rogue.myriad_art'],
};
export const DAO_NATURE_BRANCH_NAMES_V125 = {
    'orthodox.guard': 'Hộ Đạo', 'orthodox.golden_body': 'Kim Thân', 'orthodox.righteous_art': 'Chính Pháp',
    'demonic.demon_art': 'Ma Công', 'demonic.break_demon': 'Phá Ma', 'demonic.demon_body': 'Ma Thể',
    'rogue.solitary': 'Độc Hành', 'rogue.hundred_refine': 'Bách Luyện', 'rogue.myriad_art': 'Vạn Pháp',
};
const DAO_NATURE_TIER_REALM_GATES = { mundane: 10, spirit: 18, mystic: 34, earth: 46, heaven: 62, immortal: 74, extreme: 90, breaker: 102 };
const DAO_NATURE_POINT_BASE_PCT = { mundane: .12, spirit: .15, mystic: .18, earth: .20, heaven: .23, immortal: .26, extreme: .32, breaker: .40 };
const MANUAL_RESTORE_FRAGMENTS = { mundane: 15, spirit: 25, mystic: 40, earth: 65, heaven: 100, immortal: 150, extreme: 230, breaker: 340 };
const SKILL_LEARN_COSTS = [1, 2, 3, 4, 5, 6, 8, 10];
const BATTLE_DAO_GAMEPLAY_GUIDES_V12311 = {
    sword: { dao: 'sword', daoName: 'Kiếm', loopCode: 'KHÍ → Ý → TRẢM', headline: 'Dựng Kiếm Khí, nuôi Kiếm Ý rồi bộc phát', summary: 'Chủ Kiếm dùng Core Kiếm Khí 0–5 để biến đổi nhịp Active. Passive Kiếm Ý tích lâu dài qua root damaging actions, tăng Bạo Kích/Hội Tâm/Xuyên và không reset khi hạ quái.', resources: [{ name: 'Kiếm Khí', range: '0–5', detail: 'Core chỉ Chủ Đạo. Basic/skill Kiếm dựng Kiếm Khí; đạt đỉnh mở payoff Kiếm Khí Trảm rồi dựng lại.', kind: 'self' }, { name: 'Kiếm Ý', range: '0–20+', detail: 'Passive-stack. Mỗi 3 root damaging actions nhận tầng; root có Hội Tâm được thêm nhịp tích. Giết quái không reset.', kind: 'self' }], steps: [{ key: 'generate', label: 'KHÍ', detail: 'Dựng Kiếm Khí bằng Basic và Active Kiếm.' }, { key: 'stack', label: 'Ý', detail: 'Giữ nhịp gây sát thương để Kiếm Ý tăng dần và nuôi build.' }, { key: 'finish', label: 'TRẢM', detail: 'Dùng Active/Tuyệt Kỹ đúng lúc Kiếm Khí và cửa sổ Phá Thế đạt payoff cao.' }], beginnerTip: 'Kiếm Khí là Core của Chủ Kiếm; Kiếm Ý là passive-stack và Phụ Kiếm vẫn có thể hưởng Kiếm Ý nếu đã chọn Kiếm làm Phụ Đạo.', ultimateRule: 'Tuyệt Kỹ dùng Thanh Tuyệt Kỹ 100; không lấy Chân Nguyên làm cost chính và vẫn chịu provenance/followUpBudget canonical.' },
    fist: { dao: 'fist', daoName: 'Quyền', loopCode: 'THẾ → KÌNH → TRỌNG', headline: 'Dựng Quyền Thế, giữ Liên Kình rồi đánh Trọng Thế', summary: 'Chủ Quyền tích Quyền Thế 0–5 từ root action Quyền gây sát thương. Mỗi tầng tăng damage/Phá Thế; 5 tầng mở Trọng Thế. Passive Liên Kình khiến càng đánh liên tục càng lì và càng mạnh.', resources: [{ name: 'Quyền Thế', range: '0–5', detail: 'Core chỉ Chủ Đạo. Mỗi root action Quyền gây sát thương +1; mỗi tầng +3% damage Skill Quyền và +4% Phá Thế. 5 tầng cho Active Quyền kế +35% damage/+35% Phá rồi tiêu 3.', kind: 'self' }, { name: 'Liên Kình', range: '0–20+', detail: 'Passive-stack. Root damaging action nối tiếp +1 tầng; stack tăng HP/Phòng, mở bonus Phá Thế và damage ở các mốc.', kind: 'self' }], steps: [{ key: 'generate', label: 'THẾ', detail: 'Duy trì đòn Quyền gây sát thương để dựng 5 Quyền Thế.' }, { key: 'stack', label: 'KÌNH', detail: 'Giữ chuỗi root damaging actions để Liên Kình tăng và refresh thời gian.' }, { key: 'finish', label: 'TRỌNG', detail: 'Ở 5 Quyền Thế, Active gây sát thương kế nhận Trọng Thế rồi tiêu 3 tầng.' }], beginnerTip: 'Đừng hiểu Liên Kình là resource phải tiêu. Nó là passive-stack nuôi sức bền; Quyền Thế mới là Core Chủ Quyền dùng để mở Trọng Thế.', ultimateRule: 'Tuyệt Kỹ tận dụng trạng thái Quyền hiện tại nhưng không được tạo proc lặp ngoài followUpBudget.' },
    body: { dao: 'body', daoName: 'Thể', loopCode: 'CHỊU → THẾ → CHÂN', headline: 'Chịu đòn có kiểm soát để dựng Chân Thân', summary: 'Chủ Thể nhận Phản Thế từ sát thương thực sự được giảm/đỡ. Mỗi 20 Phản Thế tăng damage Skill Thể và giảm thương; 100 mở Chân Thân Viên Mãn. Passive Huyết Khí tích khi root action thực sự làm mất HP.', resources: [{ name: 'Phản Thế', range: '0–100', detail: 'Core chỉ Chủ Đạo. Sinh từ mitigation thật; mỗi 20 tầng +3% damage Skill Thể và +2% giảm thương. 100 có thể tiêu 40 để Active Thể kế +40% hiệu quả.', kind: 'self' }, { name: 'Huyết Khí', range: '0–20+', detail: 'Passive-stack. Mỗi incoming root action thực sự làm mất HP +1; tăng hiệu quả Hồi/Khiên, Phòng và giảm thương theo mốc.', kind: 'self' }], steps: [{ key: 'generate', label: 'CHỊU', detail: 'Dùng Khiên/mitigation để nhận áp lực mà không tự sát.' }, { key: 'stack', label: 'THẾ', detail: 'Mitigation thật dựng Phản Thế; mất HP thật dựng Huyết Khí.' }, { key: 'finish', label: 'CHÂN', detail: 'Đạt 100 Phản Thế để Active Thể kế bùng hiệu quả Chân Thân.' }], beginnerTip: 'Cởi giáp để ăn raw damage không farm được Phản Thế; Core chỉ ghi nhận phần sát thương thật sự đã được giảm/đỡ.', ultimateRule: 'Tuyệt Kỹ thiên phòng thủ-phản công; không trao bất tử tuyệt đối.' },
    spell: { dao: 'spell', daoName: 'Pháp', loopCode: 'XOAY → Ý → DIỄN', headline: 'Xoay đủ ba pháp thức để mở Diễn Pháp', summary: 'Chủ Pháp dùng Pháp Luân gồm Tốc Pháp/Cast/Dẫn Pháp. Hoàn tất loại mới lấp một ô; đủ 3 thì Active Pháp gây sát thương kế vào Diễn Pháp. Passive Pháp Ý tăng khi root action có tiêu Chân Nguyên.', resources: [{ name: 'Pháp Luân', range: '0–3 pháp thức', detail: 'Core chỉ Chủ Đạo. Mỗi ô +6% damage Skill Pháp và +5% hiệu suất Chân Nguyên. Đủ 3: Active Pháp damage kế +35% damage/+20% Phá, rồi xóa 2 ô.', kind: 'state' }, { name: 'Pháp Ý', range: '0–20+', detail: 'Passive-stack. Root action có tiêu Chân Nguyên +1 tầng; tăng Skill damage/hồi CN, rồi mở giảm cost và CDR theo mốc.', kind: 'self' }], steps: [{ key: 'generate', label: 'XOAY', detail: 'Luân phiên Tốc Pháp, Cast và Dẫn Pháp để lấp Pháp Luân.' }, { key: 'stack', label: 'Ý', detail: 'Tiêu Chân Nguyên đều đặn để Pháp Ý tăng mà không cần dùng Active Pháp khi Pháp là Phụ Đạo.' }, { key: 'finish', label: 'DIỄN', detail: 'Đủ 3 ô Pháp Luân thì Active Pháp gây sát thương kế nhận Diễn Pháp.' }], beginnerTip: 'Pháp Luân là Core Chủ Pháp; Pháp Ý là passive-stack generic. Vì vậy Phụ Pháp vẫn tích Pháp Ý từ skill Chủ Đạo có tiêu Chân Nguyên.', ultimateRule: 'Tuyệt Kỹ dùng Thanh Tuyệt Kỹ 100; quản Chân Nguyên vẫn quan trọng cho nhịp Active thường.' },
    poison: { dao: 'poison', daoName: 'Độc', loopCode: 'GIEO → ĂN MÒN → CÔNG TÂM', headline: 'Nuôi Độc Chủng trên một mục tiêu rồi dẫn bạo', summary: 'Chủ Độc gieo Độc Chủng stage 0–4 lên mục tiêu hiện tại. Mỗi stage làm mục tiêu dễ bị xuyên phá hơn và tăng DoT Độc; stage 4 là Công Tâm. Passive Độc Tức tích theo nhịp root damaging actions.', resources: [{ name: 'Độc Chủng', range: 'stage 0–4', detail: 'Core chỉ Chủ Đạo, gắn với mục tiêu hiện tại. Mỗi stage -3% Phòng và +8% hiệu quả DoT Độc; stage 4 làm Consume Độc kế +50% payoff rồi hạ về stage 1.', kind: 'target' }, { name: 'Độc Tức', range: '0–20+', detail: 'Passive-stack. Mỗi 3 root damaging actions +1 tầng; tăng giảm Phòng mục tiêu đối với người chơi, damage và Xuyên theo mốc.', kind: 'self' }], steps: [{ key: 'generate', label: 'GIEO', detail: 'Dùng skill Build Độc để tăng stage Độc Chủng.' }, { key: 'stack', label: 'ĂN MÒN', detail: 'Giữ nhịp gây sát thương để Độc Tức tăng và mục tiêu bị ăn mòn dần.' }, { key: 'finish', label: 'CÔNG TÂM', detail: 'Ở stage 4, dùng Consume để nhận +50% payoff rồi giữ lại stage 1.' }], beginnerTip: 'Độc V2 là 1v1 ăn mòn mục tiêu; không có mechanic lan giả. Đổi mục tiêu sẽ bắt đầu Độc Chủng mới.', ultimateRule: 'Tuyệt Kỹ/Consume dùng payoff Độc Chủng; stage 4 Công Tâm được thưởng lớn rồi giữ lại nền stage để tiếp tục vòng.' },
    artifact: { dao: 'artifact', daoName: 'Ngự Khí', loopCode: 'PHÂN → CẢM → HỢP', headline: 'Điều khiển nhiều Nguồn Pháp Bảo bằng một Khí Linh', summary: 'Chủ Ngự Khí có 1–3 Nguồn Pháp Bảo. Nguồn phụ tăng hiệu quả Artifact Command và Khiên, rồi tạo một generated follow-up chung. Passive Khí Cảm nuôi Nộ, tốc hành động và payoff dài hạn.', resources: [{ name: 'Nguồn Pháp Bảo', range: '1–3', detail: 'Core chỉ Chủ Đạo. Mỗi nguồn phụ tăng hiệu quả Artifact Command; follow-up của nhiều nguồn được gộp và chỉ dùng 1 followUpBudget.', kind: 'state' }, { name: 'Khí Cảm', range: '0–20+', detail: 'Passive-stack. Mỗi 3 root actions +1 tầng; tăng Nộ gain/Action Speed và mở damage/Khiên/CDR theo mốc.', kind: 'self' }], steps: [{ key: 'generate', label: 'PHÂN', detail: 'Triển khai thêm Nguồn Pháp Bảo trong cap 3.' }, { key: 'stack', label: 'CẢM', detail: 'Duy trì root actions để Khí Cảm tăng và cải thiện nhịp điều khiển.' }, { key: 'finish', label: 'HỢP', detail: 'Ra lệnh hoặc Hợp/Thu nguồn để đổi số nguồn lấy payoff phù hợp.' }], beginnerTip: 'Ba nguồn không có nghĩa mọi proc nhân ba. Các nguồn phụ chỉ tạo một follow-up nhóm hữu hạn theo provenance/followUpBudget.', ultimateRule: 'Tuyệt Kỹ cho các nguồn hợp lực trong một chu kỳ đại kích, không tạo chuỗi proc vô hạn.' },
    formation: { dao: 'formation', daoName: 'Trận', loopCode: 'BỐ → VĂN → KÍCH', headline: 'Dựng một Chủ Trận, dưỡng đủ rồi kích', summary: 'Chủ Trận có Dưỡng Độ và Độ Bền. Dưỡng Độ tăng damage/Phá Thế của Skill Trận; đạt 100 mở Đại Thành. Passive Trận Văn thưởng rotation đa skill thay vì spam một nút.', resources: [{ name: 'Dưỡng Độ', range: '0–100', detail: 'Core Chủ Trận. Mỗi 20 Dưỡng +5% damage/+5% Phá Thế Skill Trận; Kích Trận tiêu Dưỡng.', kind: 'state' }, { name: 'Độ Bền', range: '0–100', detail: 'Sức bền của Chủ Trận. Đại Thành/Kích lớn có thể hao Độ Bền; Hộ Nhãn/Chuyển Nhãn phục hồi.', kind: 'state' }, { name: 'Trận Văn', range: '0–20+', detail: 'Passive-stack. Dùng root skill khác skill ngay trước +1 tầng; tăng Phòng/Phá Thế và mở damage/CDR theo mốc.', kind: 'self' }], steps: [{ key: 'generate', label: 'BỐ', detail: 'Bố Trận Khai Môn để dựng Chủ Trận duy nhất.' }, { key: 'stack', label: 'VĂN', detail: 'Luân phiên skill khác nhau để khắc Trận Văn và đồng thời dưỡng trận.' }, { key: 'finish', label: 'KÍCH', detail: 'Đạt Dưỡng cao để Kích; tại 100 Dưỡng, Kích kế +50% hiệu quả và hao thêm Độ Bền.' }], beginnerTip: 'Trận V2 không có lớp giảm thương ẩn từ Chủ Trận; phòng thủ phải đến từ passive/skill hiển thị rõ.', ultimateRule: 'Tuyệt Kỹ đẩy một Chủ Trận tới đại kích; không dựng Trận thứ hai.' },
    mind: { dao: 'mind', daoName: 'Thần Niệm', loopCode: 'LƯU → NIỆM → ẢNH', headline: 'Lưu snapshot sạch rồi phát Niệm Ảnh hữu hạn', summary: 'Chủ Thần Niệm lưu snapshot whitelist của Active hợp lệ. Sau mỗi 3 Active, phát Niệm Ảnh sau 0,6s với 35% payload được phép. Passive Niệm Lực tích từ Active root action và tăng Skill damage/Hội Tâm/Xuyên.', resources: [{ name: 'Niệm Ảnh', range: 'mỗi 3 Active', detail: 'Core chỉ Chủ Đạo. Echo snapshot whitelist; không charge CN, không sinh Nộ/Ultimate, không summon/channel và tuyệt đối không tự echo tiếp.', kind: 'state' }, { name: 'Niệm Lực', range: '0–20+', detail: 'Passive-stack. Active root action thành công +1; Ultimate +2. Tăng Skill damage/Hội Tâm và mở Crit/Xuyên theo mốc.', kind: 'self' }], steps: [{ key: 'generate', label: 'LƯU', detail: 'Active Thần Niệm hợp lệ cập nhật snapshot sạch gần nhất.' }, { key: 'stack', label: 'NIỆM', detail: 'Active root action nuôi Niệm Lực; Ultimate cho 2 tầng.' }, { key: 'finish', label: 'ẢNH', detail: 'Sau mỗi 3 Active hợp lệ, Niệm Ảnh phát payload 35% sau 0,6s.' }], beginnerTip: 'Niệm Ảnh không recast nguyên skill. Nó chỉ replay payload whitelist nên không thể tạo summon/channel/echo đệ quy.', ultimateRule: 'Ultimate không bị echo và không tạo snapshot mới; mọi echo đều procDepth khóa recursion.' },
};
export function battleDaoGameplayGuideV12311(dao) { return BATTLE_DAO_GAMEPLAY_GUIDES_V12311[dao]; }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
export function isBattleDaoSkillV125(skill) { return Boolean(skill.tags.includes('BattleDaoV118') && skill.runtimeV117?.daoBinding); }
export function battleDaoOfSkillV125(skill) { const d = skill.runtimeV117?.daoBinding; return d && BATTLE_DAO_IDS.includes(d) ? d : undefined; }
export function isCurrentDaoEligibleV125(foundation, dao) { if (!dao)
    return true; return foundation.battleDao.mainDaoId === dao || foundation.battleDao.secondaryDaoId === dao; }
function daoSkillPartsV125(id) { const m = /^skill\.dao\.(sword|fist|body|spell|poison|artifact|formation|mind)\.([a-z0-9_]+)$/.exec(String(id || '')); return m ? { dao: m[1], suffix: m[2] } : {}; }
export function canonicalBattleDaoLoadoutV125(state, candidateIds = state.activeSkillIds, activeSlotLimit = BATTLE_DAO_ACTIVE_LOADOUT_SLOTS_V125) {
    const f = cloneBuildFoundationV113(state.buildFoundation, state.spiritualRootId);
    state.buildFoundation = f;
    const main = f.battleDao.mainDaoId;
    const committed = Boolean(main && f.battleDao.committed && f.progressionV125?.daoNatureCommitted);
    const unique = [...new Set(candidateIds)].filter(id => state.knownSkillIds.includes(id));
    if (!committed) {
        return { activeSkillIds: unique.slice(0, 6), combinedSkillIds: unique.slice(0, 6) };
    }
    // V2: combat skill authority belongs only to Chủ Đạo. Phụ Đạo grants passive access only.
    const allowed = new Set([main]);
    const mainBasic = `skill.dao.${main}.basic`;
    if (!state.knownSkillIds.includes(mainBasic))
        state.knownSkillIds.push(mainBasic);
    const eligible = unique.filter(id => {
        if (id === 'skill.basic_strike')
            return false;
        const parts = daoSkillPartsV125(id);
        return !parts.dao || allowed.has(parts.dao);
    });
    const actives = [];
    let ultimateSkillId;
    for (const id of eligible) {
        if (id === mainBasic)
            continue;
        const parts = daoSkillPartsV125(id);
        if (parts.suffix === 'basic')
            continue;
        if (parts.suffix === 'ultimate') {
            if (!ultimateSkillId)
                ultimateSkillId = id;
            continue;
        }
        if (actives.length < Math.max(1, Math.min(BATTLE_DAO_ACTIVE_LOADOUT_SLOTS_V125, Math.floor(activeSlotLimit))))
            actives.push(id);
    }
    const combined = [mainBasic, ...actives, ...(ultimateSkillId ? [ultimateSkillId] : [])];
    f.skillLoadout.basicSkillId = mainBasic;
    f.skillLoadout.activeSkillIds = [...actives];
    f.skillLoadout.ultimateSkillId = ultimateSkillId;
    return { basicSkillId: mainBasic, activeSkillIds: actives, ultimateSkillId, combinedSkillIds: combined };
}
export function syncCanonicalBattleDaoLoadoutV125(state, candidateIds = state.activeSkillIds, activeSlotLimit = BATTLE_DAO_ACTIVE_LOADOUT_SLOTS_V125) {
    const loadout = canonicalBattleDaoLoadoutV125(state, candidateIds, activeSlotLimit);
    state.activeSkillIds = [...loadout.combinedSkillIds];
    return loadout;
}
export function battleDaoOfPassiveV125(passiveId) { const m = /^passive\.(?:dao|v2)\.(sword|fist|body|spell|poison|artifact|formation|mind)\./.exec(String(passiveId || '')); return m ? m[1] : undefined; }
export function ensureProgressionV125(state) { const f = cloneBuildFoundationV113(state.buildFoundation, state.spiritualRootId); state.buildFoundation = f; return f.progressionV125 ?? (f.progressionV125 = createSpecializationSkillProgressionV125()); }
export function skillPracticeTierV125(xp) { return clamp(Math.floor(Math.max(0, xp) / SKILL_PRACTICE_XP_PER_TIER_V125), 0, SKILL_MASTERY_MAX_V113); }
export function skillPracticeStageV125(tier) { const t = clamp(Math.floor(tier), 0, 1000); if (t >= 1000)
    return 'Cực Ý'; if (t >= 750)
    return 'Viên Mãn'; if (t >= 500)
    return 'Hóa Cảnh'; if (t >= 250)
    return 'Đại Thành'; if (t >= 100)
    return 'Tiểu Thành'; return t > 0 ? 'Sơ Luyện' : 'Chưa Luyện'; }
export function skillPracticeProfileFromTierV125(rawTier, xp = rawTier * SKILL_PRACTICE_XP_PER_TIER_V125) {
    const tier = clamp(Math.floor(rawTier), 0, SKILL_MASTERY_MAX_V113);
    // Long-tail mastery: +1% eligible main effect every 20 tiers (=50% at 1000), plus visible stage payoffs.
    let effect = Math.floor(tier / 20);
    if (tier >= 100)
        effect += 2;
    if (tier >= 250)
        effect += 3;
    if (tier >= 500)
        effect += 4;
    if (tier >= 750)
        effect += 5;
    if (tier >= 1000)
        effect += 6; // total +70% at Cực Ý.
    const spiritCostReductionPct = (tier >= 500 ? 5 : 0) + (tier >= 1000 ? 3 : 0);
    const cooldownReductionPct = (tier >= 750 ? 5 : 0) + (tier >= 1000 ? 3 : 0);
    const next = SKILL_PRACTICE_STAGE_TIERS_V125.find(x => x > tier);
    return { xp: clamp(xp, 0, SKILL_PRACTICE_XP_MAX_V125), tier, stage: skillPracticeStageV125(tier), effectBonusPct: effect, spiritCostReductionPct, cooldownReductionPct, nextStageTier: next, nextStageName: next ? SKILL_PRACTICE_STAGE_NAMES_V125[next] : undefined };
}
export function skillPracticeProfileV125(foundation, skillId) {
    const p = foundation.progressionV125 ?? createSpecializationSkillProgressionV125();
    const xp = clamp(p.skillPracticeXp[skillId] ?? (foundation.skillMastery[skillId] ?? 0) * 1000, 0, SKILL_PRACTICE_XP_MAX_V125);
    return skillPracticeProfileFromTierV125(skillPracticeTierV125(xp), xp);
}
export function practiceGainPerCastV125(skill) {
    const slot = skill.runtimeV117?.slotClass;
    if (slot === 'ultimate')
        return 8;
    if (slot === 'basic')
        return 1;
    // Normalize slow skills upward so mastery mostly measures active use-time, not only low cooldown spam.
    const cycle = Math.max(1, skill.cooldown + skill.castTime + (skill.recoveryTime ?? .2));
    return clamp(Math.ceil(cycle / 5), 1, 4);
}
/** Mastery farm protection is intentionally stronger than ordinary loot-floor efficiency. */
export function practiceContentEfficiencyForGapV125(progressGap) {
    const gap = Math.max(0, Math.floor(progressGap));
    if (gap <= 20)
        return 1;
    if (gap <= 60)
        return .70;
    if (gap <= 120)
        return .40;
    if (gap <= 240)
        return .18;
    return .05;
}
/**
 * Săn Yêu uses a strategic power model instead of the full event CombatEngine, so skill casts are estimated
 * deterministically from the real battle duration. The total action budget prevents five cooldown skills from
 * each claiming impossible simultaneous spam. Dungeon/boss CombatEngine fights use exact castStart logs instead.
 */
export function estimateBattleDaoCastCountsV125(activeSkillIds, battleSeconds, allSkills) {
    const seconds = Math.max(0, battleSeconds);
    if (seconds <= 0)
        return {};
    const byId = new Map(allSkills.map(s => [s.id, s]));
    const eligible = [...new Set(activeSkillIds)].map(id => byId.get(id)).filter((s) => Boolean(s && isBattleDaoSkillV125(s)));
    if (!eligible.length)
        return {};
    const desired = eligible.map(skill => {
        const slot = skill.runtimeV117?.slotClass;
        if (slot === 'ultimate')
            return { skill, casts: Math.max(0, Math.floor(seconds / 55)) };
        const cycle = Math.max(.65, skill.cooldown + skill.castTime + (skill.recoveryTime ?? .2));
        return { skill, casts: Math.max(slot === 'basic' ? 1 : 0, Math.floor(seconds / cycle)) };
    });
    const desiredTotal = desired.reduce((a, x) => a + x.casts, 0);
    const actionBudget = Math.max(1, Math.floor(seconds / .78));
    const scale = desiredTotal > actionBudget ? actionBudget / desiredTotal : 1;
    const out = {};
    for (const x of desired) {
        const count = Math.max(0, Math.floor(x.casts * scale));
        if (count > 0)
            out[x.skill.id] = count;
    }
    // A short fight should still train the first real action instead of rounding every skill to zero.
    if (Object.keys(out).length === 0) {
        const first = eligible.find(s => s.runtimeV117?.slotClass !== 'ultimate') ?? eligible[0];
        out[first.id] = 1;
    }
    return out;
}
export function gainBattleDaoPracticeFromCastCountsV125(state, castCounts, allSkills, contentEfficiency = 1) {
    const byId = new Map(allSkills.map(s => [s.id, s]));
    const reports = [];
    const foundation = cloneBuildFoundationV113(state.buildFoundation, state.spiritualRootId);
    state.buildFoundation = foundation;
    const eligibleDaoCasts = new Map();
    for (const [skillId, rawCasts] of Object.entries(castCounts)) {
        const skill = byId.get(skillId);
        if (!skill || !isBattleDaoSkillV125(skill))
            continue;
        const dao = battleDaoOfSkillV125(skill);
        if (!foundation.battleDao.committed || !foundation.progressionV125?.daoNatureCommitted || !isCurrentDaoEligibleV125(foundation, dao) || !state.knownSkillIds.includes(skillId))
            continue;
        const casts = Math.max(0, Math.floor(rawCasts));
        if (casts <= 0)
            continue;
        const r = gainSkillPracticeV125(state, skill, casts, contentEfficiency);
        if (r.xpGain > 0)
            reports.push({ skillId, casts, ...r });
        if (dao)
            eligibleDaoCasts.set(dao, (eligibleDaoCasts.get(dao) ?? 0) + casts);
    }
    // Đạo Hạnh is current-life combat familiarity, not a separate farm currency.
    // It advances from real/estimated canonical Bản Đạo casts and is capped per battle so
    // long timeout fights cannot become the optimal progression strategy. Chủ Đạo receives
    // full gain; Phụ Đạo is automatically scaled by gainBattleDaoHanhV113.
    const finalFoundation = cloneBuildFoundationV113(state.buildFoundation, state.spiritualRootId);
    const efficiency = clamp(contentEfficiency, 0, 1);
    for (const [dao, casts] of eligibleDaoCasts) {
        const baseGain = Math.min(1, Math.max(0, casts) * .02 * efficiency);
        if (baseGain > 0)
            gainBattleDaoHanhV113(finalFoundation, dao, baseGain);
    }
    state.buildFoundation = finalFoundation;
    return reports;
}
export function gainSkillPracticeV125(state, skill, casts = 1, contentEfficiency = 1) {
    if (!isBattleDaoSkillV125(skill))
        return { xpGain: 0, beforeTier: 0, afterTier: 0, skillPointGain: 0, newStages: [] };
    const foundation = cloneBuildFoundationV113(state.buildFoundation, state.spiritualRootId);
    state.buildFoundation = foundation;
    const p = foundation.progressionV125 ?? (foundation.progressionV125 = createSpecializationSkillProgressionV125());
    const beforeXp = clamp(p.skillPracticeXp[skill.id] ?? (foundation.skillMastery[skill.id] ?? 0) * 1000, 0, SKILL_PRACTICE_XP_MAX_V125);
    const beforeTier = skillPracticeTierV125(beforeXp);
    const gain = Math.max(0, Math.floor(practiceGainPerCastV125(skill) * Math.max(0, casts) * clamp(contentEfficiency, 0, 1)));
    const afterXp = Math.min(SKILL_PRACTICE_XP_MAX_V125, beforeXp + gain);
    p.skillPracticeXp[skill.id] = afterXp;
    const afterTier = skillPracticeTierV125(afterXp);
    foundation.skillMastery[skill.id] = afterTier;
    const claimed = new Set((p.skillPracticeMilestonesClaimed[skill.id] ?? []).map(x => Math.floor(x)));
    const newStages = [];
    for (const m of SKILL_PRACTICE_STAGE_TIERS_V125)
        if (afterTier >= m && !claimed.has(m)) {
            claimed.add(m);
            newStages.push(m);
        }
    p.skillPracticeMilestonesClaimed[skill.id] = [...claimed].sort((a, b) => a - b);
    const skillPointGain = newStages.length;
    p.skillPoints += skillPointGain;
    return { xpGain: afterXp - beforeXp, beforeTier, afterTier, skillPointGain, newStages };
}
export function passiveLevelScalarV125(level) {
    const lv = clamp(Math.floor(level ?? 1), 1, PASSIVE_LEVEL_MAX_V125);
    // Existing authored passive values are the Lv10 baseline. New passives start at Lv1; migrated learned passives default Lv10.
    if (lv <= 5)
        return .50 + (lv - 1) * (.25 / 4);
    if (lv <= 10)
        return .75 + (lv - 5) * (.25 / 5);
    if (lv <= 15)
        return 1 + (lv - 10) * (.25 / 5);
    return 1.25 + (lv - 15) * (.25 / 5);
}
export function passiveLevelV125(foundation, passiveId) { return clamp(Math.floor(foundation.progressionV125?.passiveLevels?.[passiveId] ?? 1), 1, 20); }
const PASSIVE_EFFECT_LABEL_V126 = {
    generatePct: 'Sinh tài nguyên', breakPct: 'Phá Thế', spendEffectPct: 'Hiệu quả xả', counterEffectPct: 'Hiệu quả phản kích', gaugeGainFlat: 'Thanh Tuyệt Kỹ',
    counterGeneratePct: 'Sinh tài nguyên khi phản kích', mitigationGeneratePct: 'Sinh Phản Thế từ giảm thương', defenseEffectPct: 'Hiệu quả phòng thủ', recoveryReductionPct: 'Giảm Thu Chiêu',
    costReductionPct: 'Giảm Chân Nguyên', dotEffectPct: 'Hiệu quả DoT', markGeneratePct: 'Sinh Ấn/Tầng', commandEffectPct: 'Hiệu quả mệnh lệnh', sourceScalingPct: 'Hiệu quả mỗi nguồn',
    integrityGeneratePct: 'Sinh Độ Bền Trận', recoverySpiritPct: 'Hồi Chân Nguyên', markEffectPct: 'Hiệu quả Ấn', interferePct: 'Hiệu quả Nhiễu',
};
function displayPassiveValueV126(key, value) { const rounded = Math.abs(value - Math.round(value)) < 1e-9 ? String(Math.round(value)) : value.toFixed(1).replace(/\.0$/, ''); return key === 'gaugeGainFlat' ? `+${rounded}` : `+${rounded}%`; }
export function passiveEffectSummaryV126(passive, level) {
    const scalar = passiveLevelScalarV125(level);
    return Object.entries(passive.effect).map(([key, base]) => `${PASSIVE_EFFECT_LABEL_V126[key] ?? key} ${displayPassiveValueV126(key, Math.max(0, Number(base || 0)) * scalar)}`).join(' · ');
}
export function passiveUnlockRequirementV126(passiveId, techniques) {
    const matches = [];
    for (const technique of techniques)
        for (const milestone of technique.contentV119?.milestones ?? [])
            if (milestone.unlockPassiveIds?.includes(passiveId))
                matches.push({ at: milestone.at, id: technique.id });
    if (!matches.length)
        return undefined;
    const sourceMastery = Math.min(...matches.map(x => x.at));
    return { sourceMastery, realmGate: battleDaoPassiveRealmGateV125(sourceMastery), sourceTechniqueIds: [...new Set(matches.filter(x => x.at === sourceMastery).map(x => x.id))] };
}
export function passiveFragmentCostV125(level, grade) {
    const lv = clamp(Math.floor(level), 1, 19);
    const gradeIndex = ['mundane', 'spirit', 'mystic', 'earth', 'heaven', 'immortal', 'extreme', 'breaker'].indexOf(grade);
    const curve = Math.ceil(5 + lv * 1.8 + Math.pow(lv, 1.45) * .75);
    return Math.max(1, Math.ceil(curve * (1 + Math.max(0, gradeIndex) * .22)));
}
export function techniqueRestoreFragmentRequirementV125(def) { return MANUAL_RESTORE_FRAGMENTS[def.grade ?? 'mundane']; }
export function isV119BattleDaoTechniqueV125(def) { return Boolean(def.id.startsWith('technique.v119.') && def.contentV119?.daoBindings?.some(x => BATTLE_DAO_IDS.includes(x))); }
export function techniqueDaoEligibleV125(foundation, def) {
    const daos = (def.contentV119?.daoBindings ?? []).filter(x => BATTLE_DAO_IDS.includes(x));
    return daos.length === 0 || daos.some(d => isCurrentDaoEligibleV125(foundation, d));
}
export function addTechniqueFragmentsV125(state, techniqueId, amount) { const p = ensureProgressionV125(state); const gain = Math.max(0, Math.floor(amount)); p.techniqueFragments[techniqueId] = (p.techniqueFragments[techniqueId] ?? 0) + gain; return gain; }
export function restoreTechniqueManualV125(state, def) {
    const foundation = cloneBuildFoundationV113(state.buildFoundation, state.spiritualRootId);
    state.buildFoundation = foundation;
    const p = foundation.progressionV125 ?? (foundation.progressionV125 = createSpecializationSkillProgressionV125());
    if (!techniqueDaoEligibleV125(foundation, def))
        throw new Error('Công Pháp này không thuộc Chủ Đạo/Phụ Đạo của đời hiện tại.');
    const required = techniqueRestoreFragmentRequirementV125(def);
    const before = Math.max(0, Math.floor(p.techniqueFragments[def.id] ?? 0));
    if (p.restoredTechniqueIds.includes(def.id))
        return { required, before, after: before, restored: true };
    if (before < required)
        throw new Error(`Chưa đủ mảnh ${def.name}: ${before}/${required}.`);
    p.techniqueFragments[def.id] = before - required;
    p.restoredTechniqueIds.push(def.id);
    return { required, before, after: before - required, restored: true };
}
export function isTechniqueRestoredV125(foundation, techniqueId) { return Boolean(foundation.progressionV125?.restoredTechniqueIds?.includes(techniqueId)); }
export function passiveSourceTechniquesV125(passiveId, techniques) { return techniques.filter(t => t.contentV119?.milestones.some(m => m.unlockPassiveIds?.includes(passiveId))); }
const PASSIVE_REALM_GATE_BY_MANUAL_MILESTONE_V125 = { 20: 10, 40: 18, 60: 26, 80: 34, 100: 46 };
export function battleDaoPassiveRealmGateV125(sourceMilestone) {
    if (sourceMilestone >= 100)
        return PASSIVE_REALM_GATE_BY_MANUAL_MILESTONE_V125[100];
    if (sourceMilestone >= 80)
        return PASSIVE_REALM_GATE_BY_MANUAL_MILESTONE_V125[80];
    if (sourceMilestone >= 60)
        return PASSIVE_REALM_GATE_BY_MANUAL_MILESTONE_V125[60];
    if (sourceMilestone >= 40)
        return PASSIVE_REALM_GATE_BY_MANUAL_MILESTONE_V125[40];
    return PASSIVE_REALM_GATE_BY_MANUAL_MILESTONE_V125[20];
}
export function syncBattleDaoPassiveUnlocksV125(state, realmOrder, techniques) {
    const foundation = cloneBuildFoundationV113(state.buildFoundation, state.spiritualRootId);
    state.buildFoundation = foundation;
    const p = foundation.progressionV125 ?? (foundation.progressionV125 = createSpecializationSkillProgressionV125());
    if (!p.daoNatureCommitted || !foundation.battleDao.committed)
        return [];
    const learned = [];
    for (const def of techniques) {
        if (!isV119BattleDaoTechniqueV125(def) || !state.knownTechniqueIds.includes(def.id) || !isTechniqueRestoredV125(foundation, def.id) || !techniqueDaoEligibleV125(foundation, def))
            continue;
        const mastery = Math.max(0, Math.min(100, state.techniqueMastery[def.id] ?? 0));
        for (const milestone of def.contentV119?.milestones ?? []) {
            if (mastery + 1e-9 < milestone.at || realmOrder < battleDaoPassiveRealmGateV125(milestone.at))
                continue;
            for (const passiveId of milestone.unlockPassiveIds ?? []) {
                if (!passiveId.startsWith('passive.dao.'))
                    continue;
                const passiveDao = battleDaoOfPassiveV125(passiveId);
                if (!passiveDao || !isCurrentDaoEligibleV125(foundation, passiveDao))
                    continue;
                const hp = ensureSkillHeartProgressionV12317(p), rawSourceGrade = (def.grade ?? 'mundane'), currentGrade = (hp.heartMethodGradesV12317?.[passiveId] ?? 'mundane');
                // Alpha.23.25: Công Pháp truyền thừa cho lĩnh ngộ/đặt nền Tâm Pháp, nhưng bậc cao từ Thiên trở lên thuộc progression gacha + mảnh riêng.
                const sourceGrade = SKILL_GRADE_ORDER_V12317[Math.min(SKILL_GRADE_ORDER_V12317.indexOf(rawSourceGrade), SKILL_GRADE_ORDER_V12317.indexOf('earth'))];
                if (SKILL_GRADE_ORDER_V12317.indexOf(sourceGrade) > SKILL_GRADE_ORDER_V12317.indexOf(currentGrade))
                    hp.heartMethodGradesV12317[passiveId] = sourceGrade;
                if ((foundation.learnedDaoPassiveIdsV118 ?? []).includes(passiveId))
                    continue;
                learnDaoPassiveV118(foundation, passiveId);
                if (p.passiveLevels[passiveId] === undefined)
                    p.passiveLevels[passiveId] = 1;
                learned.push(passiveId);
            }
        }
    }
    return learned;
}
export function syncBattleDaoV2ProgressionV78(state, realmOrder) {
    const f = cloneBuildFoundationV113(state.buildFoundation, state.spiritualRootId);
    state.buildFoundation = f;
    const p = f.progressionV125 ?? (f.progressionV125 = createSpecializationSkillProgressionV125());
    const report = { grantedSkillIds: [], grantedPassiveIds: [], retiredLegacyPassiveIds: [], activeSlotsUnlocked: battleDaoV2ActiveSlotsUnlocked(realmOrder, BATTLE_DAO_ACTIVE_LOADOUT_SLOTS_V125) };
    if (!p.daoNatureCommitted || !f.battleDao.committed || !f.battleDao.mainDaoId)
        return report;
    const main = f.battleDao.mainDaoId;
    const starter = battleDaoV2StarterPackage(main);
    const heart = ensureSkillHeartProgressionV12317(p);
    if (realmOrder >= TRUC_CO_REALM_ORDER_V125) {
        for (const id of [starter.basicSkillId, starter.activeSkillId, starter.ultimateSkillId]) {
            if (!state.knownSkillIds.includes(id)) {
                state.knownSkillIds.push(id);
                report.grantedSkillIds.push(id);
            }
            heart.skillLevelsV12317[id] = heart.skillLevelsV12317[id] ?? 1;
        }
    }
    // V2 passives are realm unlocks rather than legacy Công Pháp unlocks. Main + chosen secondary receive only the passive rows their realm has reached.
    const passiveDaos = [main, ...(f.battleDao.secondaryDaoId ? [f.battleDao.secondaryDaoId] : [])];
    for (const dao of passiveDaos)
        for (const row of battleDaoV2UnlockedRows(dao, realmOrder)) {
            if (!(f.learnedDaoPassiveIdsV118 ?? []).includes(row.passiveId)) {
                learnDaoPassiveV118(f, row.passiveId);
                report.grantedPassiveIds.push(row.passiveId);
            }
            if (p.passiveLevels[row.passiveId] === undefined)
                p.passiveLevels[row.passiveId] = 1;
        }
    // Retire current-life legacy V1.18 passive mechanics so V2 is the only authoritative passive layer; keep their level records for save compatibility/audit.
    const eligible = new Set(passiveDaos);
    const learned = f.learnedDaoPassiveIdsV118 ?? [];
    const kept = [];
    for (const id of learned) {
        const dao = battleDaoOfPassiveV125(id);
        if (id.startsWith('passive.dao.') && dao && eligible.has(dao)) {
            report.retiredLegacyPassiveIds.push(id);
            continue;
        }
        kept.push(id);
    }
    f.learnedDaoPassiveIdsV118 = kept;
    f.skillLoadout.buildPassiveIds = (f.skillLoadout.buildPassiveIds ?? []).filter(id => !report.retiredLegacyPassiveIds.includes(id));
    // Preserve an existing valid main-Dao loadout, but guarantee the V2 starter loop on migrated saves.
    const candidate = [starter.basicSkillId, starter.activeSkillId, starter.ultimateSkillId, ...state.activeSkillIds];
    syncCanonicalBattleDaoLoadoutV125(state, candidate, report.activeSlotsUnlocked);
    return report;
}
export function skillSourceTechniquesV125(skillId, techniques) { return techniques.filter(t => t.contentV119?.milestones.some(m => m.unlockSkillIds?.includes(skillId))); }
export function techniqueUnlockMasteryForSkillV125(def, skillId) { return def.contentV119?.milestones.find(m => m.unlockSkillIds?.includes(skillId))?.at; }
export function battleDaoSkillLearnCostV125(_skill, _allSkills) { return 0; }
export function battleDaoSkillRealmGateV125(skill, allSkills) {
    if (!isBattleDaoSkillV125(skill))
        return 0;
    const slot = skill.runtimeV117?.slotClass;
    if (slot === 'basic')
        return TRUC_CO_REALM_ORDER_V125;
    if (slot === 'ultimate')
        return BATTLE_DAO_ULTIMATE_REALM_ORDER_V125;
    const dao = battleDaoOfSkillV125(skill);
    if (dao) {
        const v2Gate = battleDaoV2ActiveRealmGate(dao, skill.id);
        if (v2Gate !== undefined)
            return v2Gate;
    }
    const ordered = allSkills.filter(s => battleDaoOfSkillV125(s) === dao && s.runtimeV117?.slotClass === 'active');
    const index = Math.max(0, ordered.findIndex(s => s.id === skill.id));
    return BATTLE_DAO_ACTIVE_REALM_GATES_V125[Math.min(BATTLE_DAO_ACTIVE_REALM_GATES_V125.length - 1, index)];
}
const COMBAT_RESOURCE_LABEL_V125 = {
    swordIntent: 'Kiếm Ý', fistChain: 'Liên Quyền', bodyCounter: 'Phản Thế', spellSeal: 'Pháp Ấn', artifactSources: 'Nguồn Pháp Bảo', formationNurture: 'Dưỡng Độ', formationIntegrity: 'Độ Bền',
};
const COMBAT_SIGNATURE_LABEL_V125 = {
    swordBreak: 'Tạo cửa sổ Phá Thế', swordFinisher: 'Kết Liễu bằng Kiếm Ý', swordGuard: 'Phản kích/Hộ Kiếm',
    fistHeavy: 'Trọng Kình theo Liên Quyền', fistCounter: 'Phản Quyền', fistFinisher: 'Kết Liễu tiêu Liên Quyền',
    bodyDefense: 'Hóa lực tích Phản Thế', bodyCounter: 'Xả Phản Thế phản công', bodyRecovery: 'Xả Phản Thế hồi phục',
    spellComplete: 'Hoàn tất pháp thức để tạo Pháp Ấn', spellSealSpend: 'Tiêu Pháp Ấn cường hóa pháp thức', spellRecovery: 'Hồi nguyên Pháp Đạo',
    poisonBuild: 'Tích Độc Tầng trên mục tiêu', poisonConsume: 'Tiêu Độc Tầng để bộc phát', poisonDefend: 'Dùng thế Độc để phòng thủ',
    artifactDeploy: 'Triển khai Nguồn Pháp Bảo', artifactCommand: 'Ra lệnh Pháp Bảo', artifactRecall: 'Thu hồi Nguồn Pháp Bảo', artifactMerge: 'Hợp nhất nhiều Nguồn Pháp Bảo',
    formationDeploy: 'Dựng Chủ Trận', formationNourish: 'Tăng Dưỡng Độ', formationFortify: 'Khôi phục Độ Bền', formationActivate: 'Kích Trận tiêu Dưỡng Độ', formationBreak: 'Phá trận/Phá Thế',
    mindBuild: 'Tích Thần Ấn trên mục tiêu', mindBurst: 'Tiêu Thần Ấn để Bạo Ấn', mindInterfere: 'Tiêu Thần Ấn để Nhiễu', mindDefense: 'Hộ Thức',
};
function combatResourceLabelV125(id) { return COMBAT_RESOURCE_LABEL_V125[id] ?? id.replace(/([a-z])([A-Z])/g, '$1 $2'); }
function combatMarkLabelV125(id) { return id.replace(/^mark[.:_-]?/i, '').replace(/[._-]+/g, ' ') || 'Ấn'; }
// V79 production presentation: Bản Đạo V2 no longer exposes the v1.18 self/target-resource loop.
// Legacy effects remain in the authored base SkillDefinition as compatibility packets, but CombatKernel V2
// intercepts/sanitizes them. The skill screen must therefore explain the V2 mechanic, not the old packet.
const V2_SKILL_DESCRIPTION_OVERRIDES_V79 = {
    'skill.dao.sword.basic': 'Kiếm thức cơ bản dựng nhịp Kiếm Khí; đồng thời duy trì chuỗi root action để nuôi Kiếm Ý passive.',
    'skill.dao.sword.flow_slash': 'Kiếm thức nhanh để xoay Active và dựng Kiếm Khí; phù hợp làm nhịp mở đầu ở Trúc Cơ.',
    'skill.dao.sword.nurture': 'Tàng phong đổi nhịp tấn công lấy lượng Kiếm Khí lớn và chuẩn bị payoff của Core Chủ Kiếm.',
    'skill.dao.sword.break_mark': 'Kiếm ấn thiên Phá Thế; dùng để mở cửa sổ burst trong khi vẫn nuôi Core Kiếm Khí.',
    'skill.dao.sword.counter': 'Phản kiếm đúng cửa sổ; thành công dựng mạnh Core Kiếm Khí mà không tạo resource phụ mới.',
    'skill.dao.sword.sever': 'Đòn Phá Thế nặng tương tác Core Kiếm Khí; không còn tiêu Kiếm Ý như resource Chủ Đạo V1.',
    'skill.dao.sword.finisher': 'Kết Liễu Kiếm nhận payoff tốt nhất khi Core/cửa sổ Phá Thế đã được chuẩn bị.',
    'skill.dao.fist.basic': 'Quyền thức cơ bản; root action Quyền gây sát thương dựng Quyền Thế, còn Liên Kình được nuôi như passive-stack.',
    'skill.dao.fist.triple': 'Ba quyền liên tục trong một root action; dựng Quyền Thế và có các mốc Mastery thêm hit hữu hạn.',
    'skill.dao.fist.shock': 'Quyền kình thiên Phá Thế; tiếp tục dựng Quyền Thế và mở payoff khi phá được mục tiêu.',
    'skill.dao.fist.nurture': 'Tụ kình để dựng nhanh Quyền Thế; Mastery cao có thể đưa trạng thái thấp lên thẳng đỉnh.',
    'skill.dao.fist.heavy': 'Trọng quyền ăn payoff từ Quyền Thế; tại 5 tầng có thể kích Trọng Thế của Core.',
    'skill.dao.fist.counter': 'Phản quyền đúng cửa sổ, hồi phục/dựng Quyền Thế theo Mastery; Liên Kình không bị tiêu.',
    'skill.dao.fist.chain_heavy': 'Liên hoàn quyền nhiều hit, hưởng Quyền Thế và Mastery; vẫn chỉ là một root action cho proc budget.',
    'skill.dao.fist.finisher': 'Kết Liễu nặng theo trạng thái Quyền Thế; không tiêu Liên Kình passive-stack.',
    'skill.dao.fist.ultimate': 'Tuyệt quyền bộc phát theo trạng thái Quyền; Mastery cao mở Quyền Vực nhưng vẫn khóa follow-up hữu hạn.',
    'skill.dao.spell.channel': 'Dẫn Pháp nhiều nhịp; hoàn tất một loại pháp thức sẽ lấp Pháp Luân nếu loại đó chưa có trong vòng.',
    'skill.dao.spell.seal': 'Pháp thức Cast dùng để xoay Pháp Luân và chuẩn bị Diễn Pháp.',
    'skill.dao.spell.transform': 'Pháp thức utility trong vòng Pháp Luân; đủ ba loại mới mở Diễn Pháp cho Active gây sát thương kế.',
    'skill.dao.spell.break': 'Pháp thức thiên Phá Thế; hoàn tất vẫn tham gia vòng Pháp Luân theo loại cast hiện tại.',
    'skill.dao.poison.basic': 'Đòn cơ bản duy trì damage/DoT; Core Độc Chủng chỉ tăng stage qua các skill Build Độc được whitelist.',
    'skill.dao.poison.bone': 'Skill Build Độc: gieo/nuôi Độc Chủng và đặt DoT nền lên mục tiêu hiện tại.',
    'skill.dao.poison.heart': 'Skill Build Độc thiên DoT dài; nuôi Độc Chủng tới Công Tâm để chuẩn bị Consume.',
    'skill.dao.poison.insects': 'Dẫn độc nhiều nhịp trong một root action; nuôi Độc Chủng theo contract V2 và không nhân proc theo số hit.',
    'skill.dao.poison.mist': 'Triển khai độc vụ theo combat-state để nuôi Độc Chủng/DoT trên mục tiêu hiện tại.',
    'skill.dao.poison.transform': 'Skill Consume Độc: dẫn bạo payoff của Độc Chủng; stage 4 Công Tâm được +50% hiệu quả rồi giữ lại stage 1.',
    'skill.dao.poison.consume': 'Finisher Consume Độc: đổi stage Độc Chủng thành payoff tức thời theo contract V2.',
    'skill.dao.poison.calamity': 'Đại pháp Build Độc chi phí cao để đẩy nhanh Độc Chủng và DoT trong một root action.',
    'skill.dao.poison.ultimate': 'Tuyệt Kỹ Consume Độc; nhận payoff Công Tâm của Độc Chủng rồi giữ lại nền stage để tiếp tục vòng ăn mòn.',
    'skill.dao.formation.deploy': 'Dựng một Chủ Trận V2 duy nhất với Dưỡng Độ/Độ Bền; không tồn tại lớp giảm thương ẩn của V1.',
    'skill.dao.mind.basic': 'Niệm châm cơ bản gây damage; Niệm Lực là passive-stack, còn Niệm Ảnh chỉ snapshot Active hợp lệ.',
    'skill.dao.mind.mark': 'Active Thần Niệm nhanh, cập nhật snapshot whitelist gần nhất cho Niệm Ảnh.',
    'skill.dao.mind.split': 'Active nhiều hit trong một root action; cập nhật một snapshot sạch và vẫn chịu event budget canonical.',
    'skill.dao.mind.interfere': 'Active utility gây Nhiễu theo contract V2; boss vẫn chịu cap khống chế mềm canonical.',
    'skill.dao.mind.chase': 'Active truy kích được ưu tiên làm snapshot ở Mastery cao; dùng để chuẩn bị Niệm Ảnh kế.',
    'skill.dao.mind.burst': 'Finisher Thần Niệm tạo damage packet đã sanitize; Niệm Ảnh không được echo Consume hay recurse.',
    'skill.dao.mind.observe': 'Dẫn niệm nhiều nhịp; hoàn tất có thể nuôi Niệm Lực/kích Niệm Ảnh theo Mastery, nhưng channel không bị snapshot nguyên trạng.',
    'skill.dao.mind.flow': 'Mở trạng thái phân lưu để tăng nhịp Niệm Ảnh hữu hạn; mọi echo vẫn dùng chung cooldown/budget và khóa recursion.',
    'skill.dao.mind.ultimate': 'Tuyệt Kỹ Thần Niệm không bị echo và không tạo snapshot mới; Mastery có thể phát thêm một echo snapshot hợp lệ.'
};
export function battleDaoV2SkillDescriptionV79(skill) { return V2_SKILL_DESCRIPTION_OVERRIDES_V79[skill.id] ?? skill.description; }
function isLegacyDaoV1ExplanationV79(text) { return /(Liên Quyền|Pháp Ấn|Độc Tầng|Thần Ấn|fistChain|spellSeal|bodyCounter|artifactSources|formationNurture|formationIntegrity)/i.test(text); }
function skillEffectSummaryV2V79(skill) { return skillEffectSummaryV125(skill).filter(x => !isLegacyDaoV1ExplanationV79(x)); }
function daoResourceSummaryV2V79(skill, dao) {
    const sig = skill.daoRuntimeV118?.signature;
    const out = [];
    if (dao === 'sword')
        out.push('V2: Skill Kiếm tương tác Core Kiếm Khí; Kiếm Ý là passive-stack riêng, không phải resource tiêu của skill.');
    else if (dao === 'fist')
        out.push('V2: root action Quyền gây sát thương +1 Quyền Thế; 5 tầng mở Trọng Thế cho Active damage kế. Liên Kình không bị tiêu.');
    else if (dao === 'body')
        out.push('V2: Phản Thế sinh từ mitigation thật; ở 100 Phản Thế, Active Thể kế có thể tiêu 40 để +40% hiệu quả.');
    else if (dao === 'spell')
        out.push('V2: hoàn tất Tốc Pháp/Cast/Dẫn Pháp khác loại để lấp Pháp Luân; đủ 3 mở Diễn Pháp cho Active damage kế.');
    else if (dao === 'poison')
        out.push(sig === 'poisonConsume' ? 'V2: Consume Độc dùng Độc Chủng; stage 4 Công Tâm +50% payoff rồi giữ lại stage 1.' : 'V2: Build Độc nuôi Độc Chủng stage 0–4 trên mục tiêu hiện tại; mỗi stage tăng áp lực ăn mòn và DoT.');
    else if (dao === 'artifact')
        out.push(sig === 'artifactDeploy' ? 'V2: Triển khai tăng Nguồn Pháp Bảo, tối đa 3.' : sig === 'artifactRecall' ? 'V2: Thu hồi giảm Nguồn Pháp Bảo để đổi nhịp/phòng thủ.' : sig === 'artifactMerge' ? 'V2: Hợp nguồn về 1 để đổi setup lấy payoff.' : 'V2: Artifact Command hưởng số Nguồn Pháp Bảo; nguồn phụ chỉ tạo một follow-up nhóm trong budget.');
    else if (dao === 'formation')
        out.push(sig === 'formationDeploy' ? 'V2: Dựng Chủ Trận duy nhất với Dưỡng Độ/Độ Bền.' : sig === 'formationNourish' ? 'V2: Nuôi Chủ Trận để tăng Dưỡng Độ.' : sig === 'formationFortify' ? 'V2: Gia cố Độ Bền Chủ Trận.' : sig === 'formationActivate' ? 'V2: Kích Trận dùng Dưỡng Độ; tại 100 Dưỡng, Kích kế +50% hiệu quả và hao thêm Độ Bền.' : 'V2: Phá/thu Chủ Trận theo contract hiện tại.');
    else if (dao === 'mind')
        out.push('V2: Active Thần Niệm cập nhật snapshot whitelist; mỗi 3 Active hợp lệ phát Niệm Ảnh 35% sau 0,6s, procDepth khóa recursion.');
    return out;
}
export function skillEffectSummaryV125(skill) {
    const out = [];
    for (const effect of skill.effects) {
        if (effect.type === 'damage') {
            const hp = (effect.targetMaxHpPct ?? 0) > 0 ? ` + ${effect.targetMaxHpPct}% HP tối đa mục tiêu (tối đa ${Math.round((effect.targetMaxHpAttackCapCoefficient ?? 0) * 100)}% Công Lực)` : '';
            out.push(`Sát thương ${Math.round(effect.coefficient * 100)}% Công Lực${hp}${(effect.breakDamagePct ?? effect.stabilityDamage ?? 0) > 0 ? ` · Phá Thế ${effect.breakDamagePct ?? effect.stabilityDamage}%` : ''}`);
        }
        else if (effect.type === 'damageOverTime')
            out.push(`Duy trì ${Math.round(effect.coefficientPerTick * 100)}% Công Lực × ${effect.ticks} nhịp/${effect.interval}s${(effect.breakDamagePctPerTick ?? effect.stabilityDamagePerTick ?? 0) > 0 ? ` · Phá Thế ${effect.breakDamagePctPerTick ?? effect.stabilityDamagePerTick}%/nhịp` : ''}`);
        else if (effect.type === 'heal')
            out.push(`Hồi phục${effect.attackCoefficient ? ` ${Math.round(effect.attackCoefficient * 100)}% Công Lực` : ''}${effect.maxHpPct ? ` +${effect.maxHpPct}% Sinh Mệnh tối đa` : ''}${effect.flat ? ` +${effect.flat}` : ''}`);
        else if (effect.type === 'shield')
            out.push(`Khiên ${effect.capacity}${effect.attackCoefficient ? ` +${Math.round(effect.attackCoefficient * 100)}% Công Lực` : ''}${effect.maxHpPct ? ` +${effect.maxHpPct}% Sinh Mệnh tối đa` : ''} · ${effect.duration}s`);
        else if (effect.type === 'drain')
            out.push(`Hút ${Math.round(effect.coefficient * 100)}% Công Lực · hồi ${Math.round(effect.healRatio * 100)}% sát thương`);
        else if (effect.type === 'restoreSpirit')
            out.push(`Hồi ${effect.flat ?? 0} Chân Nguyên`);
        else if (effect.type === 'applyStatus')
            out.push(`Áp ${effect.statusId} ${effect.duration}s${effect.stacks ? ` ×${effect.stacks}` : ''}`);
        else if (effect.type === 'addMark')
            out.push(`Tích ${combatMarkLabelV125(effect.mark)} +${effect.stacks} tầng (tối đa ${effect.maxStacks})`);
        else if (effect.type === 'consumeMarkDamage')
            out.push(`Nổ ${combatMarkLabelV125(effect.mark)}: tiêu tối đa ${effect.maxConsume} tầng · ${Math.round(effect.baseCoefficient * 100)}% Công Lực + ${Math.round(effect.coefficientPerStack * 100)}% Công Lực mỗi tầng${(effect.breakDamagePctPerStack ?? effect.stabilityDamagePerStack ?? 0) > 0 ? ` · Phá Thế +${effect.breakDamagePctPerStack ?? effect.stabilityDamagePerStack}%/tầng` : ''}`);
    }
    if (skill.channel?.baseHits && skill.channel.effects?.length) {
        const hits = Math.max(1, Math.floor(skill.channel.baseHits));
        for (const effect of skill.channel.effects) {
            if (effect.type === 'damage') {
                const per = Math.round(effect.coefficient * 100), total = Math.round(effect.coefficient * 100 * hits), breakPer = effect.breakDamagePct ?? effect.stabilityDamage ?? 0;
                out.push(`Dẫn Pháp ${hits} nhịp × ${per}% Công Lực = ${total}% nếu hoàn tất${breakPer > 0 ? ` · Phá Thế ${breakPer}%/nhịp (${Math.round(breakPer * hits)}% tổng)` : ''}`);
            }
            else if (effect.type === 'restoreSpirit')
                out.push(`Dẫn Pháp ${hits} nhịp × hồi ${effect.flat ?? 0} Chân Nguyên nếu hoàn tất`);
        }
    }
    return out;
}
export function daoResourceSummaryV125(skill) {
    const out = [];
    const d = skill.daoRuntimeV118;
    for (const x of d?.spend ?? [])
        out.push(`Tiêu ${combatResourceLabelV125(x.resource)}: ${x.amount === 'all' ? 'toàn bộ' : x.amount}${x.minimum ? ` (cần ít nhất ${x.minimum})` : ''}`);
    for (const x of d?.generate ?? [])
        out.push(`Sinh ${combatResourceLabelV125(x.resource)}: +${x.amount}`);
    if (d?.signature && COMBAT_SIGNATURE_LABEL_V125[d.signature])
        out.push(`Cơ chế: ${COMBAT_SIGNATURE_LABEL_V125[d.signature]}`);
    return out;
}
export function skillCombatExplanationV125(skill) { const dao = battleDaoOfSkillV125(skill); return dao ? [...skillEffectSummaryV2V79(skill), ...daoResourceSummaryV2V79(skill, dao)] : [...skillEffectSummaryV125(skill), ...daoResourceSummaryV125(skill)]; }
export function battleDaoSkillPreviewV125(dao, allSkills) {
    return allSkills.filter(s => battleDaoOfSkillV125(s) === dao).map(skill => {
        const slot = (skill.runtimeV117?.slotClass ?? 'active');
        const costClass = skill.runtimeV117?.costClass ?? 'zero';
        const channelHits = Math.max(0, Math.floor(skill.channel?.baseHits ?? 0));
        const channelDamage = (skill.channel?.effects ?? []).reduce((sum, e) => sum + (e.type === 'damage' ? e.coefficient * 100 : e.type === 'drain' ? e.coefficient * 100 : 0), 0) * channelHits;
        const channelBreak = (skill.channel?.effects ?? []).reduce((sum, e) => sum + (e.type === 'damage' ? (e.breakDamagePct ?? e.stabilityDamage ?? 0) : e.type === 'drain' ? (e.breakDamagePct ?? e.stabilityDamage ?? 0) : 0), 0) * channelHits;
        const damageCoefficientPct = skill.effects.reduce((sum, e) => sum + (e.type === 'damage' ? e.coefficient * 100 : e.type === 'drain' ? e.coefficient * 100 : 0), 0) + channelDamage;
        const breakDamagePct = skill.effects.reduce((sum, e) => sum + (e.type === 'damage' ? (e.breakDamagePct ?? e.stabilityDamage ?? 0) : e.type === 'drain' ? (e.breakDamagePct ?? e.stabilityDamage ?? 0) : 0), 0) + channelBreak;
        const growth = battleDaoSkillGrowthProfileV126(skill, 0);
        return { id: skill.id, name: skill.name, description: battleDaoV2SkillDescriptionV79(skill), dao, slot, realmGate: battleDaoSkillRealmGateV125(skill, allSkills), learnCost: battleDaoSkillLearnCostV125(skill, allSkills), form: skill.runtimeV117?.form ?? 'instant', spiritCostClass: costClass, spiritCostStandardPct: SKILL_COST_STANDARD_PCT_V117[costClass], cooldown: skill.cooldown, castTime: skill.castTime, recoveryTime: skill.recoveryTime ?? .2, domains: [...(skill.runtimeV117?.domains ?? [])], damageCoefficientPct, breakDamagePct, effectSummary: skillEffectSummaryV2V79(skill), daoResourceSummary: daoResourceSummaryV2V79(skill, dao), practiceRoleV126: growth?.roleName, practiceMilestonesV126: battleDaoSkillGrowthMilestonesV126(skill) };
    }).sort((a, b) => a.realmGate - b.realmGate || (a.slot === 'basic' ? -1 : b.slot === 'basic' ? 1 : a.slot === 'ultimate' ? 1 : b.slot === 'ultimate' ? -1 : 0));
}
export function battleDaoTechniqueFragmentTargetsV125(state, realmOrder, techniques) {
    const foundation = cloneBuildFoundationV113(state.buildFoundation, state.spiritualRootId);
    if (!foundation.battleDao.committed || !foundation.battleDao.mainDaoId || !foundation.progressionV125?.daoNatureCommitted)
        return [];
    return techniques.filter(def => isV119BattleDaoTechniqueV125(def) && techniqueDaoEligibleV125(foundation, def) && (def.requiredRealmOrder ?? 0) <= realmOrder);
}
export function canLearnBattleDaoSkillV125(state, skill, realmOrder, allSkills, allTechniques) {
    if (!isBattleDaoSkillV125(skill))
        return { ok: true, cost: 0, requiredRealmOrder: 0 };
    const foundation = cloneBuildFoundationV113(state.buildFoundation, state.spiritualRootId);
    const p = foundation.progressionV125 ?? createSpecializationSkillProgressionV125();
    const dao = battleDaoOfSkillV125(skill);
    const cost = battleDaoSkillLearnCostV125(skill, allSkills);
    const requiredRealmOrder = battleDaoSkillRealmGateV125(skill, allSkills);
    if (!foundation.battleDao.committed || !p.daoNatureCommitted)
        return { ok: false, reason: 'Phải Định Đạo tại Trúc Cơ trước khi học kỹ năng Bản Đạo.', cost, requiredRealmOrder };
    if (dao !== foundation.battleDao.mainDaoId)
        return { ok: false, reason: `Kỹ năng Chủ Động/Cơ Bản/Tuyệt Kỹ của ${dao ? BATTLE_DAO_NAMES[dao] : ''} chỉ dùng được khi đó là Chủ Đạo. Phụ Đạo chỉ mở Tâm Pháp.`, cost, requiredRealmOrder };
    if (realmOrder < requiredRealmOrder)
        return { ok: false, reason: `Kỹ năng yêu cầu cảnh giới order ${requiredRealmOrder}; hiện tại ${realmOrder}.`, cost, requiredRealmOrder };
    if (skill.runtimeV117?.slotClass === 'basic' || skill.runtimeV117?.slotClass === 'ultimate' || (dao && isBattleDaoV2ActiveSkill(dao, skill.id)))
        return { ok: true, cost: 0, requiredRealmOrder };
    const sources = skillSourceTechniquesV125(skill.id, allTechniques).filter(def => state.knownTechniqueIds.includes(def.id) && isTechniqueRestoredV125(foundation, def.id));
    let qualifying, sourceMasteryRequired;
    for (const def of sources) {
        const req = techniqueUnlockMasteryForSkillV125(def, skill.id) ?? 0;
        if ((state.techniqueMastery[def.id] ?? 0) + 1e-9 >= req) {
            qualifying = def;
            sourceMasteryRequired = req;
            break;
        }
    }
    if (!qualifying)
        return { ok: false, reason: 'Chưa phục nguyên và lĩnh ngộ đủ Công Pháp truyền thừa của kỹ năng này.', cost, requiredRealmOrder };
    return { ok: true, cost, requiredRealmOrder, sourceTechniqueId: qualifying.id, sourceMasteryRequired };
}
export function spendSkillPointsToLearnV125(state, skill, _cost, activeSlotLimit = BATTLE_DAO_ACTIVE_LOADOUT_SLOTS_V125) { ensureProgressionV125(state); if (!state.knownSkillIds.includes(skill.id))
    state.knownSkillIds.push(skill.id); const f = state.buildFoundation; if (f?.battleDao?.committed && f.progressionV125?.daoNatureCommitted && battleDaoOfSkillV125(skill) === f.battleDao.mainDaoId) {
    const current = canonicalBattleDaoLoadoutV125(state, state.activeSkillIds, activeSlotLimit);
    const slot = skill.runtimeV117?.slotClass;
    if (slot === 'ultimate' && !current.ultimateSkillId)
        syncCanonicalBattleDaoLoadoutV125(state, [...current.combinedSkillIds, skill.id], activeSlotLimit);
    else if (slot === 'active' && current.activeSkillIds.length < Math.max(1, Math.min(BATTLE_DAO_ACTIVE_LOADOUT_SLOTS_V125, Math.floor(activeSlotLimit))))
        syncCanonicalBattleDaoLoadoutV125(state, [...current.combinedSkillIds, skill.id], activeSlotLimit);
} }
export function commitSpecializationV125(state, realmOrder, nature, mainDao) {
    if (realmOrder < TRUC_CO_REALM_ORDER_V125)
        throw new Error('Chỉ được Định Đạo khi bước vào Trúc Cơ.');
    const f = cloneBuildFoundationV113(state.buildFoundation, state.spiritualRootId);
    state.buildFoundation = f;
    const p = f.progressionV125 ?? (f.progressionV125 = createSpecializationSkillProgressionV125());
    if (p.daoNatureCommitted)
        throw new Error('Đời hiện tại đã chọn Đạo Tính; chỉ Luân Hồi mới được chọn lại.');
    // Legacy v1.18-v1.24 saves may already have a locked Chủ Đạo. Preserve it instead of silently rerolling the current life.
    if (f.battleDao.committed && f.battleDao.mainDaoId && f.battleDao.mainDaoId !== mainDao)
        throw new Error(`Đời hiện tại đã khóa Chủ Đạo ${BATTLE_DAO_NAMES[f.battleDao.mainDaoId]}; hãy chọn đúng Chủ Đạo cũ hoặc Luân Hồi.`);
    p.daoNatureId = nature;
    p.daoNatureCommitted = true;
    p.daoNatureCommittedRealmOrder = realmOrder;
    f.battleDao.mainDaoId = f.battleDao.mainDaoId ?? mainDao;
    f.battleDao.committed = true;
    f.battleDao.natureTags = [`ĐạoTính:${DAO_NATURE_NAMES_V125[nature]}`];
    const chosen = f.battleDao.mainDaoId;
    const starter = battleDaoV2StarterPackage(chosen);
    for (const id of [starter.basicSkillId, starter.activeSkillId, starter.ultimateSkillId])
        if (!state.knownSkillIds.includes(id))
            state.knownSkillIds.push(id);
    learnDaoPassiveV118(f, starter.passiveId);
    if (p.passiveLevels[starter.passiveId] === undefined)
        p.passiveLevels[starter.passiveId] = 1;
    const heart = ensureSkillHeartProgressionV12317(p);
    for (const id of [starter.basicSkillId, starter.activeSkillId, starter.ultimateSkillId])
        heart.skillLevelsV12317[id] = heart.skillLevelsV12317[id] ?? 1;
    // Trúc Cơ V2 starts complete: Basic + Active I + Passive I + Core + Ultimate. Later Active rows are learned when their realm gate opens.
    syncCanonicalBattleDaoLoadoutV125(state, [starter.basicSkillId, starter.activeSkillId, starter.ultimateSkillId, ...state.activeSkillIds], battleDaoV2ActiveSlotsUnlocked(realmOrder, BATTLE_DAO_ACTIVE_LOADOUT_SLOTS_V125));
}
export function chooseSecondaryDaoV125(state, realmOrder, secondary) {
    if (realmOrder < SECONDARY_DAO_REALM_ORDER_V125)
        throw new Error('Phụ Đạo chỉ mở từ Tiên.');
    const f = cloneBuildFoundationV113(state.buildFoundation, state.spiritualRootId);
    state.buildFoundation = f;
    if (!f.battleDao.committed || !f.battleDao.mainDaoId || !f.progressionV125?.daoNatureCommitted)
        throw new Error('Chưa hoàn tất Định Đạo (Đạo Tính + Chủ Đạo).');
    if (f.battleDao.secondaryDaoId)
        throw new Error('Đời hiện tại đã chọn Phụ Đạo.');
    if (f.battleDao.mainDaoId === secondary)
        throw new Error('Phụ Đạo phải khác Chủ Đạo.');
    f.battleDao.secondaryDaoId = secondary;
    // V2 secondary Dao is passive-only. Never grant Basic/Active/Ultimate/Core here.
}
export function validateBattleDaoSkillUseV125(state, skill, realmOrder, allSkills) {
    if (!isBattleDaoSkillV125(skill))
        return;
    const f = cloneBuildFoundationV113(state.buildFoundation, state.spiritualRootId);
    const dao = battleDaoOfSkillV125(skill);
    if (!f.battleDao.committed || !f.progressionV125?.daoNatureCommitted || dao !== f.battleDao.mainDaoId)
        throw new Error(`Không thể sử dụng kỹ năng ${skill.name}: kỹ năng chiến đấu Bản Đạo chỉ thuộc Chủ Đạo; Phụ Đạo chỉ mở Tâm Pháp.`);
    const gate = battleDaoSkillRealmGateV125(skill, allSkills);
    if (realmOrder < gate)
        throw new Error(`Kỹ năng ${skill.name} yêu cầu cảnh giới order ${gate}; hiện tại ${realmOrder}.`);
    if (!state.knownSkillIds.includes(skill.id))
        throw new Error(`Chưa học kỹ năng ${skill.name}.`);
}
export function rewardSkillPointsForRealmV125(state, newRealmOrder) {
    const p = ensureProgressionV125(state);
    const order = Math.max(1, Math.floor(newRealmOrder));
    if (p.rewardedRealmOrders.includes(order))
        return 0;
    let gain = 1;
    if (BATTLE_DAO_ACTIVE_REALM_GATES_V125.includes(order))
        gain += 1;
    if (order >= 46 && order % 4 === 2)
        gain += 1;
    if (order >= 90)
        gain += 1;
    p.rewardedRealmOrders.push(order);
    p.skillPoints += gain;
    return gain;
}
export function retroactiveSkillPointsForRealmV125(state, currentRealmOrder) { let gain = 0; for (let order = 2; order <= Math.max(1, Math.floor(currentRealmOrder)); order++)
    gain += rewardSkillPointsForRealmV125(state, order); return gain; }
export function passiveUpgradeV125(state, passiveId, source) {
    const f = cloneBuildFoundationV113(state.buildFoundation, state.spiritualRootId);
    state.buildFoundation = f;
    const p = f.progressionV125 ?? (f.progressionV125 = createSpecializationSkillProgressionV125());
    if (!f.battleDao.committed || !p.daoNatureCommitted)
        throw new Error('Chưa hoàn tất Định Đạo; không thể nâng Tâm Pháp Bản Đạo.');
    const passiveDao = battleDaoOfPassiveV125(passiveId);
    if (passiveDao && !isCurrentDaoEligibleV125(f, passiveDao))
        throw new Error('Tâm Pháp không thuộc Chủ Đạo/Phụ Đạo hiện tại.');
    if (!(f.learnedDaoPassiveIdsV118 ?? []).includes(passiveId))
        throw new Error('Chưa lĩnh ngộ Tâm Pháp này.');
    if (!source.contentV119?.milestones.some(m => m.unlockPassiveIds?.includes(passiveId)))
        throw new Error('Bí Phổ này không truyền thừa Tâm Pháp đã chọn.');
    if (!isTechniqueRestoredV125(f, source.id))
        throw new Error('Công Pháp nguồn chưa được phục nguyên.');
    const before = passiveLevelV125(f, passiveId);
    if (before >= 20)
        throw new Error('Tâm Pháp đã Viên Mãn Lv20.');
    const cost = passiveFragmentCostV125(before, source.grade ?? 'mundane');
    const have = Math.floor(p.techniqueFragments[source.id] ?? 0);
    if (have < cost)
        throw new Error(`Thiếu mảnh ${source.name}: cần ${cost}, hiện có ${have}.`);
    p.techniqueFragments[source.id] = have - cost;
    p.passiveLevels[passiveId] = before + 1;
    return { before, after: before + 1, spentFragments: cost };
}
function addBonus(target, partial) { for (const [k, v] of Object.entries(partial))
    target[k] += v; }
const DAO_NATURE_COMMON_MILESTONES_V125 = {
    demonic: {
        mundane: [{ attackPct: .5 }, { critDamagePct: 1 }, { breakPct: .5 }], spirit: [{ attackPct: .7 }, { critDamagePct: 1 }, { breakPct: .7 }], mystic: [{ attackPct: .9 }, { critDamagePct: 1.5 }, { breakPct: .9 }], earth: [{ attackPct: 1.2 }, { critDamagePct: 1.5 }, { breakPct: 1.2 }],
        heaven: [{ attackPct: 1.5 }, { critDamagePct: 2 }, { breakPct: 1.5 }], immortal: [{ attackPct: 2 }, { critDamagePct: 2.5 }, { breakPct: 2 }], extreme: [{ attackPct: 2.5 }, { critDamagePct: 3 }, { breakPct: 2.5 }], breaker: [{ attackPct: 3 }, { critDamagePct: 4 }, { breakPct: 3 }],
    },
    orthodox: {
        mundane: [{ defensePct: 1 }, { maxHpPct: .5 }, { defensePct: .8 }], spirit: [{ defensePct: 1.3 }, { maxHpPct: .7 }, { defensePct: 1 }], mystic: [{ defensePct: 1.6 }, { maxHpPct: .9 }, { defensePct: 1.2 }], earth: [{ defensePct: 2 }, { maxHpPct: 1.2 }, { defensePct: 1.5 }],
        heaven: [{ defensePct: 2.5 }, { maxHpPct: 1.5 }, { defensePct: 2 }], immortal: [{ defensePct: 3 }, { maxHpPct: 2 }, { defensePct: 2.5 }], extreme: [{ defensePct: 4 }, { maxHpPct: 2.5 }, { defensePct: 3 }], breaker: [{ defensePct: 5 }, { maxHpPct: 3 }, { defensePct: 4 }],
    },
    rogue: {
        mundane: [{ attackPct: .3, maxHpPct: .3, defensePct: .3 }, { attackPct: .25, maxHpPct: .25, defensePct: .25 }, { attackPct: .25, maxHpPct: .25, defensePct: .25 }],
        spirit: [{ attackPct: .4, maxHpPct: .4, defensePct: .4 }, { attackPct: .3, maxHpPct: .3, defensePct: .3 }, { attackPct: .3, maxHpPct: .3, defensePct: .3 }],
        mystic: [{ attackPct: .5, maxHpPct: .5, defensePct: .5 }, { attackPct: .4, maxHpPct: .4, defensePct: .4 }, { attackPct: .4, maxHpPct: .4, defensePct: .4 }],
        earth: [{ attackPct: .6, maxHpPct: .6, defensePct: .6 }, { attackPct: .5, maxHpPct: .5, defensePct: .5 }, { attackPct: .5, maxHpPct: .5, defensePct: .5 }],
        heaven: [{ attackPct: .8, maxHpPct: .8, defensePct: .8 }, { attackPct: .6, maxHpPct: .6, defensePct: .6 }, { attackPct: .6, maxHpPct: .6, defensePct: .6 }],
        immortal: [{ attackPct: 1, maxHpPct: 1, defensePct: 1 }, { attackPct: .8, maxHpPct: .8, defensePct: .8 }, { attackPct: .8, maxHpPct: .8, defensePct: .8 }],
        extreme: [{ attackPct: 1.3, maxHpPct: 1.3, defensePct: 1.3 }, { attackPct: 1.1, maxHpPct: 1.1, defensePct: 1.1 }, { attackPct: 1.1, maxHpPct: 1.1, defensePct: 1.1 }],
        breaker: [{ attackPct: 1.8, maxHpPct: 1.8, defensePct: 1.8 }, { attackPct: 1.5, maxHpPct: 1.5, defensePct: 1.5 }, { attackPct: 1.5, maxHpPct: 1.5, defensePct: 1.5 }],
    },
};
const EARLY_MAJOR_V125 = {
    'demonic.demon_art': [{ attackPct: 3 }, { attackPct: 4 }, { attackPct: 5 }, { attackPct: 6 }, { attackPct: 7 }, { attackPct: 9 }],
    'demonic.break_demon': [{ attackPct: 2, breakPct: 2.5 }, { attackPct: 2.5, breakPct: 3 }, { attackPct: 3, breakPct: 4 }, { attackPct: 3.5, breakPct: 5 }, { attackPct: 4, breakPct: 6 }, { attackPct: 5, breakPct: 8 }],
    'demonic.demon_body': [{ attackPct: 2, maxHpPct: 4 }, { attackPct: 2.5, maxHpPct: 5 }, { attackPct: 3, maxHpPct: 6 }, { attackPct: 3.5, maxHpPct: 7 }, { attackPct: 4, maxHpPct: 8 }, { attackPct: 5, maxHpPct: 10 }],
    'orthodox.guard': [{ defensePct: 4 }, { defensePct: 5 }, { defensePct: 6 }, { defensePct: 7 }, { defensePct: 9 }, { defensePct: 11 }],
    'orthodox.golden_body': [{ maxHpPct: 4 }, { maxHpPct: 5 }, { maxHpPct: 6 }, { maxHpPct: 7 }, { maxHpPct: 8 }, { maxHpPct: 10 }],
    'orthodox.righteous_art': [{ attackPct: 1.5, defensePct: 2 }, { attackPct: 2, defensePct: 2.5 }, { attackPct: 2.5, defensePct: 3 }, { attackPct: 3, defensePct: 4 }, { attackPct: 4, defensePct: 5 }, { attackPct: 5, defensePct: 6 }],
    'rogue.solitary': [{ attackPct: 2 }, { attackPct: 2.5 }, { attackPct: 3 }, { attackPct: 4 }, { attackPct: 5 }, { attackPct: 6 }],
    'rogue.hundred_refine': [{ maxHpPct: 2, defensePct: 2.5 }, { maxHpPct: 2.5, defensePct: 3 }, { maxHpPct: 3, defensePct: 4 }, { maxHpPct: 3.5, defensePct: 5 }, { maxHpPct: 4.5, defensePct: 6 }, { maxHpPct: 5.5, defensePct: 7.5 }],
    'rogue.myriad_art': [{ attackPct: 1, maxHpPct: 1, defensePct: 1 }, { attackPct: 1.5, maxHpPct: 1.5, defensePct: 1.5 }, { attackPct: 2, maxHpPct: 2, defensePct: 2 }, { attackPct: 2.5, maxHpPct: 2.5, defensePct: 2.5 }, { attackPct: 3, maxHpPct: 3, defensePct: 3 }, { attackPct: 4, maxHpPct: 4, defensePct: 4 }],
};
const CAPSTONE_MAJOR_V125 = {
    'demonic.demon_art': { extreme: { attackPct: 14, critDamagePct: 8, defensePct: -6 }, breaker: { attackPct: 25, critDamagePct: 15, defensePct: -12 } },
    'demonic.break_demon': { extreme: { attackPct: 10, breakPct: 10, maxHpPct: -6 }, breaker: { attackPct: 18, breakPct: 15, maxHpPct: -10 } },
    'demonic.demon_body': { extreme: { attackPct: 8, maxHpPct: 12, defensePct: -5 }, breaker: { attackPct: 14, maxHpPct: 20, defensePct: -10 } },
    'orthodox.guard': { extreme: { defensePct: 18, damageReductionPct: 5 }, breaker: { defensePct: 30, damageReductionPct: 8 } },
    'orthodox.golden_body': { extreme: { maxHpPct: 16, shieldEffectPct: 8 }, breaker: { maxHpPct: 28, shieldEffectPct: 15 } },
    'orthodox.righteous_art': { extreme: { attackPct: 8, defensePct: 10 }, breaker: { attackPct: 14, defensePct: 18 } },
    'rogue.solitary': { extreme: { attackPct: 10 }, breaker: { attackPct: 16 } },
    'rogue.hundred_refine': { extreme: { maxHpPct: 10, defensePct: 13 }, breaker: { maxHpPct: 15, defensePct: 20 } },
    'rogue.myriad_art': { extreme: { attackPct: 6, maxHpPct: 6, defensePct: 6 }, breaker: { attackPct: 10, maxHpPct: 10, defensePct: 10 } },
};
export function resolveDaoNatureBonusesV125(foundation) {
    const out = { attackPct: 0, maxHpPct: 0, defensePct: 0, critDamagePct: 0, breakPct: 0, damageReductionPct: 0, shieldEffectPct: 0 };
    const p = foundation.progressionV125;
    if (!p?.daoNatureCommitted || !p.daoNatureId)
        return out;
    const nature = p.daoNatureId;
    for (const tierId of DAO_NATURE_TIER_IDS_V125) {
        const t = p.daoNatureTiers[tierId];
        if (!t)
            continue;
        const base = DAO_NATURE_POINT_BASE_PCT[tierId];
        for (const [branch, raw] of Object.entries(t.allocatedByBranch)) {
            const points = clamp(raw ?? 0, 0, 20);
            if (branch === 'demonic.demon_art')
                addBonus(out, { attackPct: points * base });
            else if (branch === 'demonic.break_demon')
                addBonus(out, { attackPct: points * base * .60, breakPct: points * base * .50 });
            else if (branch === 'demonic.demon_body')
                addBonus(out, { attackPct: points * base * .45, maxHpPct: points * base * .65 });
            else if (branch === 'orthodox.guard')
                addBonus(out, { defensePct: points * base * 1.30 });
            else if (branch === 'orthodox.golden_body')
                addBonus(out, { maxHpPct: points * base });
            else if (branch === 'orthodox.righteous_art')
                addBonus(out, { attackPct: points * base * .55, defensePct: points * base * .80 });
            else if (branch === 'rogue.solitary')
                addBonus(out, { attackPct: points * base * .80, maxHpPct: points * base * .25 });
            else if (branch === 'rogue.hundred_refine')
                addBonus(out, { maxHpPct: points * base * .40, defensePct: points * base * .55 });
            else if (branch === 'rogue.myriad_art')
                addBonus(out, { attackPct: points * base * .35, maxHpPct: points * base * .35, defensePct: points * base * .45 });
        }
        const spent = Object.values(t.allocatedByBranch).reduce((a, b) => a + Math.max(0, b ?? 0), 0);
        for (const [i, threshold] of [5, 10, 15].entries())
            if (spent >= threshold)
                addBonus(out, DAO_NATURE_COMMON_MILESTONES_V125[nature][tierId][i] ?? {});
        if (spent >= 20 && t.majorBranchChoice) {
            const b = t.majorBranchChoice;
            const idx = DAO_NATURE_TIER_IDS_V125.indexOf(tierId);
            if (idx < 6)
                addBonus(out, EARLY_MAJOR_V125[b][idx] ?? {});
            else
                addBonus(out, CAPSTONE_MAJOR_V125[b][tierId === 'breaker' ? 'breaker' : 'extreme']);
        }
    }
    return out;
}
export function applyDaoNatureStatsV125(stats, foundation) { const b = resolveDaoNatureBonusesV125(foundation); const next = { ...stats, maxHp: stats.maxHp * (1 + b.maxHpPct / 100), attack: stats.attack * (1 + b.attackPct / 100), defense: stats.defense * (1 + b.defensePct / 100), critDamagePct: (stats.critDamagePct ?? (100 + (stats.critPowerPerLayer ?? .5) * 100)) + b.critDamagePct, damageReductionPct: combineStatPctV129('damageReductionPct', stats.damageReductionPct ?? 0, b.damageReductionPct) }; return { stats: next, breakPct: b.breakPct, shieldEffectPct: b.shieldEffectPct }; }
export function daoNatureTierForRealmV125(realmOrder) { let found; for (const id of DAO_NATURE_TIER_IDS_V125)
    if (realmOrder >= DAO_NATURE_TIER_REALM_GATES[id])
        found = id; return found; }
export function daoNatureUnlockedTiersV125(realmOrder) { return DAO_NATURE_TIER_IDS_V125.filter(id => realmOrder >= DAO_NATURE_TIER_REALM_GATES[id]); }
export function grantDaoNaturePointV125(state, tierId, amount = 1) { const p = ensureProgressionV125(state); if (!p.daoNatureCommitted)
    throw new Error('Chưa chọn Đạo Tính.'); const t = p.daoNatureTiers[tierId]; const before = t.earnedPoints; t.earnedPoints = Math.min(20, before + Math.max(0, Math.floor(amount))); return t.earnedPoints - before; }
export function syncDaoNatureTierUnlocksV125(state, realmOrder) {
    const p = ensureProgressionV125(state);
    if (!p.daoNatureCommitted)
        return 0;
    let granted = 0;
    for (const tierId of daoNatureUnlockedTiersV125(realmOrder)) {
        const t = p.daoNatureTiers[tierId];
        if (t.earnedPoints < 4) {
            granted += 4 - t.earnedPoints;
            t.earnedPoints = 4;
        }
    }
    return granted;
}
export function addDaoNatureCultivationXpV125(state, tierId, xp, maxEarnedPoints = 20) { const p = ensureProgressionV125(state); const t = p.daoNatureTiers[tierId]; const input = Math.max(0, xp); t.cultivationXp = Math.max(0, t.cultivationXp + input); let pointGain = 0; const cap = Math.max(0, Math.min(20, Math.floor(maxEarnedPoints))); while (t.earnedPoints < cap) {
    const farmed = Math.max(0, t.earnedPoints - 8);
    const required = 100 * (1 + farmed * .18) * (1 + DAO_NATURE_TIER_IDS_V125.indexOf(tierId) * .45);
    if (t.cultivationXp + 1e-9 < required)
        break;
    t.cultivationXp -= required;
    t.earnedPoints++;
    pointGain++;
} return { xpGain: input, pointGain }; }
export function allocateDaoNaturePointV125(state, tierId, branch, points = 1) { const p = ensureProgressionV125(state); if (!p.daoNatureId || !DAO_NATURE_BRANCHES_V125[p.daoNatureId].includes(branch))
    throw new Error('Nhánh không thuộc Đạo Tính hiện tại.'); const t = p.daoNatureTiers[tierId]; const spent = Object.values(t.allocatedByBranch).reduce((a, b) => a + Math.max(0, b ?? 0), 0); const add = Math.min(Math.max(0, Math.floor(points)), Math.max(0, t.earnedPoints - spent)); if (add <= 0)
    throw new Error('Không còn Điểm Đạo Tính chưa phân bổ ở tầng này.'); t.allocatedByBranch[branch] = (t.allocatedByBranch[branch] ?? 0) + add; return add; }
export function chooseDaoNatureMajorBranchV125(state, tierId, branch) { const p = ensureProgressionV125(state); if (!p.daoNatureId || !DAO_NATURE_BRANCHES_V125[p.daoNatureId].includes(branch))
    throw new Error('Đại Thiên Phú không thuộc Đạo Tính hiện tại.'); const t = p.daoNatureTiers[tierId]; const spent = Object.values(t.allocatedByBranch).reduce((a, b) => a + Math.max(0, b ?? 0), 0); if (spent < 20)
    throw new Error('Phải phân đủ 20 điểm tầng này mới chọn Đại Thiên Phú.'); if ((t.allocatedByBranch[branch] ?? 0) < 10)
    throw new Error('Cần ít nhất 10 điểm trong nhánh để chọn Đại Thiên Phú của nhánh đó.'); if (t.majorBranchChoice && t.majorBranchChoice !== branch)
    throw new Error('Đại Thiên Phú tầng này đã khóa.'); if (tierId === 'extreme') {
    const prior = DAO_NATURE_TIER_IDS_V125.slice(0, 6).filter(id => p.daoNatureTiers[id].majorBranchChoice === branch).length;
    if (prior < 3)
        throw new Error('Đại Thiên Phú Cực yêu cầu đã chọn nhánh này ít nhất 3 tầng trước đó.');
} if (tierId === 'breaker' && p.daoNatureTiers.extreme.majorBranchChoice !== branch)
    throw new Error('Đại Thiên Phú Phá phải nối tiếp đúng nhánh đã kết tinh ở Cực.'); t.majorBranchChoice = branch; }
export function v125SpecializationSummary(state, realmOrder) { const f = cloneBuildFoundationV113(state.buildFoundation, state.spiritualRootId); const p = f.progressionV125 ?? createSpecializationSkillProgressionV125(); const bonuses = resolveDaoNatureBonusesV125(f); return { schema: 'specialization-skill.v125', daoNatureId: p.daoNatureId, daoNatureName: p.daoNatureId ? DAO_NATURE_NAMES_V125[p.daoNatureId] : undefined, mainDaoId: f.battleDao.mainDaoId, mainDaoName: f.battleDao.mainDaoId ? BATTLE_DAO_NAMES[f.battleDao.mainDaoId] : undefined, gameplayGuide: f.battleDao.mainDaoId ? battleDaoGameplayGuideV12311(f.battleDao.mainDaoId) : undefined, secondaryDaoId: f.battleDao.secondaryDaoId, secondaryDaoName: f.battleDao.secondaryDaoId ? BATTLE_DAO_NAMES[f.battleDao.secondaryDaoId] : undefined, secondaryUnlocked: realmOrder >= SECONDARY_DAO_REALM_ORDER_V125, skillPoints: p.skillPoints, bonuses, sectManual: sectManualSummaryV12310(f), tiers: DAO_NATURE_TIER_IDS_V125.map(id => ({ id, name: DAO_NATURE_TIER_NAMES_V125[id], realmGate: DAO_NATURE_TIER_REALM_GATES[id], unlocked: realmOrder >= DAO_NATURE_TIER_REALM_GATES[id], ...p.daoNatureTiers[id] })), passiveLevels: { ...p.passiveLevels } }; }
//# sourceMappingURL=specialization-skill-progression-v125.js.map