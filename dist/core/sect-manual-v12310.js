import { EQUIPMENT_SET_CATALOG_V116, describeSetMechanicV116, evaluateSetMechanicParamsV116, } from './equipment-set-v116.js';
import { BATTLE_DAO_NAMES, daoStageNameV113, } from './build-foundation-v113.js';
const MANUAL_META = {
    sword: { id: 'manual.sect.sword.taixu', name: '《Thái Hư Kiếm Điển》', shortName: 'Thái Hư Kiếm Điển', description: 'Trấn phái Kiếm Đạo: dưỡng Kiếm Ý, ép Phá Thế rồi dốc Kết Liễu đúng cửa sổ.', legacyDaoSetId: 'set.v116.attire.thaihu_nhatkiem' },
    fist: { id: 'manual.sect.fist.bahuang', name: '《Bát Hoang Quyền Kinh》', shortName: 'Bát Hoang Quyền Kinh', description: 'Trấn phái Quyền Đạo: dựng Quyền Thế, nuôi Liên Kình và đổi nhịp phòng thủ lấy cửa sổ Trọng Thế bộc phát.', legacyDaoSetId: 'set.v116.attire.bathoang_quyen' },
    body: { id: 'manual.sect.body.budiet', name: '《Bất Diệt Kim Thân Quyết》', shortName: 'Bất Diệt Kim Thân Quyết', description: 'Trấn phái Thể Đạo: biến mitigation thật thành Phản Thế và Counter, không thưởng việc cố tình ăn raw damage.', legacyDaoSetId: 'set.v116.attire.batdiet_honnguyen' },
    spell: { id: 'manual.sect.spell.wanfa', name: '《Vạn Pháp Thiên Diễn Kinh》', shortName: 'Vạn Pháp Thiên Diễn Kinh', description: 'Trấn phái Pháp Đạo: quản Chân Nguyên, nối cast/channel và mở Overchannel có đánh đổi.', legacyDaoSetId: 'set.v116.attire.vanphap_thiendien' },
    poison: { id: 'manual.sect.poison.jiuyou', name: '《Cửu U Vạn Độc Kinh》', shortName: 'Cửu U Vạn Độc Kinh', description: 'Trấn phái Độc Đạo: tích Độc, giữ nền sau Phệ và có thể đổi DoT tương lai lấy burst tức thời.', legacyDaoSetId: 'set.v116.attire.cuuu_vandoc' },
    artifact: { id: 'manual.sect.artifact.wanbao', name: '《Vạn Bảo Ngự Khí Chân Điển》', shortName: 'Vạn Bảo Ngự Khí Chân Điển', description: 'Trấn phái Ngự Khí: điều phối nhiều pháp bảo, nối nhịp và Hợp Khí mà không nhân proc vô hạn.', legacyDaoSetId: 'set.v116.attire.vanbao_trieutong' },
    formation: { id: 'manual.sect.formation.zhoutian', name: '《Chu Thiên Tinh Đấu Trận Điển》', shortName: 'Chu Thiên Tinh Đấu Trận Điển', description: 'Trấn phái Trận Đạo: bố trận, dưỡng trận, nối tiến độ và đánh đổi Độ Bền để Kích sớm.', legacyDaoSetId: 'set.v116.attire.chuthien_tinhdau' },
    mind: { id: 'manual.sect.mind.taixu', name: '《Thái Hư Luyện Thần Kinh》', shortName: 'Thái Hư Luyện Thần Kinh', description: 'Trấn phái Thần Niệm: nuôi Niệm Lực, lưu snapshot sạch và phát Niệm Ảnh hữu hạn để phá nhịp rồi bộc phát.', legacyDaoSetId: 'set.v116.attire.thaihu_luyenthan' },
};
const CHAPTER_UNLOCK_DAO_HANH = { 1: 0, 2: 40, 3: 70 };
function sourceDaoSet(id) {
    const set = EQUIPMENT_SET_CATALOG_V116.find(x => x.id === id && x.identity === 'dao');
    if (!set)
        throw new Error(`Missing historical Bản Đạo Set for sect manual migration: ${id}`);
    return set;
}
export const SECT_MANUAL_CATALOG_V12310 = Object.keys(MANUAL_META).map(daoId => {
    const meta = MANUAL_META[daoId];
    const set = sourceDaoSet(meta.legacyDaoSetId);
    if (set.mechanics.length !== 3)
        throw new Error(`${set.id} must expose exactly 3 mechanics for manual migration.`);
    return {
        ...meta, daoId,
        chapters: set.mechanics.map((source, index) => ({ chapter: (index + 1), unlockDaoHanh: CHAPTER_UNLOCK_DAO_HANH[(index + 1)], source })),
    };
});
const MANUAL_BY_DAO = new Map(SECT_MANUAL_CATALOG_V12310.map(x => [x.daoId, x]));
export function sectManualForDaoV12310(daoId) { return daoId ? MANUAL_BY_DAO.get(daoId) : undefined; }
/** Same 8 authored bands formerly supplied by equipment grade, now supplied by real Đạo Hạnh. */
export function sectManualGradeFromDaoHanhV12310(raw) {
    const v = Math.max(0, Math.min(100, Number(raw) || 0));
    if (v >= 90)
        return 'breaker';
    if (v >= 70)
        return 'extreme';
    if (v >= 50)
        return 'immortal';
    if (v >= 40)
        return 'heaven';
    if (v >= 30)
        return 'earth';
    if (v >= 20)
        return 'mystic';
    if (v >= 10)
        return 'spirit';
    return 'mundane';
}
const GRADE_NAME = { mundane: 'Phàm', spirit: 'Linh', mystic: 'Huyền', earth: 'Địa', heaven: 'Thiên', immortal: 'Tiên', extreme: 'Cực', breaker: 'Phá' };
export function activeSectManualMechanicsV12310(foundation) {
    if (!foundation.battleDao.committed || !foundation.battleDao.mainDaoId)
        return [];
    const daoId = foundation.battleDao.mainDaoId;
    const manual = sectManualForDaoV12310(daoId);
    if (!manual)
        return [];
    const daoHanh = Math.max(0, Math.min(100, foundation.battleDao.currentLifeDaoHanh[daoId] ?? 0));
    const effectiveGrade = sectManualGradeFromDaoHanhV12310(daoHanh);
    const unlocked = manual.chapters.filter(ch => daoHanh + 1e-9 >= ch.unlockDaoHanh);
    const unlockedPieces = (unlocked.at(-1)?.source.pieces ?? 0);
    return unlocked.map(ch => {
        const def = ch.source;
        const params = evaluateSetMechanicParamsV116(def, effectiveGrade);
        return {
            setId: manual.id, setName: manual.name, category: 'manual', equippedPieces: unlockedPieces, pieces: def.pieces, effectiveGrade,
            mechanicId: `${manual.id}.chapter${ch.chapter}`, mechanic: def.mechanic, name: `Chương ${ch.chapter} · ${def.name}`,
            eligibleDomains: [...def.eligibleDomains], params, constraint: def.constraint, summary: describeSetMechanicV116(def.mechanic, params),
        };
    });
}
export function sectManualSummaryV12310(foundation) {
    const daoId = foundation.battleDao.committed ? foundation.battleDao.mainDaoId : undefined;
    if (!daoId)
        return { schema: 'sect-manual.v12310', active: false, rule: 'Bí Tịch Trấn Phái chỉ xuất hiện sau khi Định Đạo và luôn đi theo Chủ Đạo.' };
    const def = sectManualForDaoV12310(daoId);
    const daoHanh = Math.max(0, Math.min(100, foundation.battleDao.currentLifeDaoHanh[daoId] ?? 0));
    const grade = sectManualGradeFromDaoHanhV12310(daoHanh);
    const chapters = def.chapters.map(ch => {
        const params = evaluateSetMechanicParamsV116(ch.source, grade);
        const unlocked = daoHanh + 1e-9 >= ch.unlockDaoHanh;
        return { chapter: ch.chapter, unlockDaoHanh: ch.unlockDaoHanh, unlocked, name: ch.source.name, description: ch.source.description, summary: describeSetMechanicV116(ch.source.mechanic, params), ...(ch.source.constraint ? { constraint: ch.source.constraint } : {}) };
    });
    const activeChapter = Math.max(0, ...chapters.filter(x => x.unlocked).map(x => x.chapter));
    const next = chapters.find(x => !x.unlocked);
    return { schema: 'sect-manual.v12310', active: true, rule: 'Chỉ Bí Tịch của Chủ Đạo vận hành. Không chiếm ô đồ, không có Bí Tịch Phụ Đạo và không tạo thêm currency progression.', manual: { id: def.id, daoId, daoName: BATTLE_DAO_NAMES[daoId], name: def.name, shortName: def.shortName, description: def.description, daoHanh, daoStage: daoStageNameV113(daoHanh), effectiveGrade: grade, effectiveGradeName: GRADE_NAME[grade], activeChapter, ...(next ? { nextChapterDaoHanh: next.unlockDaoHanh } : {}), chapters } };
}
export function validateSectManualCatalogV12310() {
    const errors = [];
    if (SECT_MANUAL_CATALOG_V12310.length !== 8)
        errors.push(`Bí Tịch Trấn Phái phải có đúng 8 quyển; hiện có ${SECT_MANUAL_CATALOG_V12310.length}.`);
    const ids = new Set();
    for (const manual of SECT_MANUAL_CATALOG_V12310) {
        if (ids.has(manual.id))
            errors.push(`${manual.id}: duplicate manual id`);
        ids.add(manual.id);
        if (manual.chapters.length !== 3)
            errors.push(`${manual.id}: phải có đúng 3 chương`);
        if (JSON.stringify(manual.chapters.map(x => x.unlockDaoHanh)) !== JSON.stringify([0, 40, 70]))
            errors.push(`${manual.id}: mốc chương phải là 0/40/70 Đạo Hạnh`);
    }
    return errors;
}
//# sourceMappingURL=sect-manual-v12310.js.map