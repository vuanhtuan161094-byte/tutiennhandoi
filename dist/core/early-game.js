import { highestClearedDungeonFloor } from './dungeon.js';
import { FIRST_LIFE_START_AGE_V84, milestoneAgeBandV84 } from './progression-pacing-v84.js';
import { cultivationProgressV140 } from './cultivation-v140.js';
const stageInfo = [
    { id: 'mortal', min: 0, max: 0, name: 'Phàm Nhân · Khai Mạch', targetRealmOrder: 1 },
    { id: 'qi', min: 1, max: 9, name: 'Luyện Khí · Dựng Build', targetRealmOrder: 10 },
    { id: 'foundation', min: 10, max: 13, name: 'Trúc Cơ · Định Nền', targetRealmOrder: 14 },
    { id: 'purplePalace', min: 14, max: 17, name: 'Tử Phủ · Nội Cảnh', targetRealmOrder: 18 },
    { id: 'goldenCore', min: 18, max: 21, name: 'Kim Đan · Vertical Slice', targetRealmOrder: 22 },
    { id: 'postSlice', min: 22, max: 999, name: 'Sau Vertical Slice', targetRealmOrder: 22 },
];
function stageFor(order) { return stageInfo.find(stage => order >= stage.min && order <= stage.max) ?? stageInfo[stageInfo.length - 1]; }
function pct(value, min, max) { if (max <= min)
    return value >= max ? 100 : 0; return Math.max(0, Math.min(100, (value - min) / (max - min) * 100)); }
export function evaluateEarlyGameSlice(state, life, world, availableEvents) {
    const order = state.realm.maxRealmOrder;
    const stage = stageFor(order);
    const firstClear = highestClearedDungeonFloor(state.dungeons, 'dungeon.spirit_gathering_cave') >= 1 || Math.max(0, state.endlessHunt?.totalBossKills ?? 0) >= 1;
    const professionBest = Math.max(...Object.values(state.professions.tracks).map(track => track.mastery));
    const completedEvents = state.flow?.contentEvents.completedEventIds.length ?? 0;
    const buildSkillCount = state.character.activeSkillIds.length;
    const checkpoints = [
        { id: 'qi', label: 'Bước vào Luyện Khí', complete: order >= 1, reason: 'Mở vòng tu luyện thực sự.' },
        { id: 'firstClear', label: 'Công phá đầu tiên', complete: firstClear, reason: 'Cần hạ ít nhất một Boss Săn Yêu hoặc công phá một tầng Phó Bản, thay vì chỉ bế quan.' },
        { id: 'path', label: 'Chọn đường đời', complete: life.lifeNumber > 1 || Boolean(state.flow?.firstLifeStory.path), reason: 'Tông môn hoặc tán tu đều là đường chính.' },
        { id: 'build', label: 'Build có hình', complete: buildSkillCount >= 3, reason: 'Ít nhất 3 skill đang mang để matchup có ý nghĩa.' },
        { id: 'profession', label: 'Có một nghề phụ trợ', complete: professionBest >= 12, reason: 'Một nghề đủ mastery để tạo lựa chọn tài nguyên.' },
        { id: 'foundation', label: 'Trúc Cơ', complete: order >= 10, reason: 'Mốc Luân Hồi/Tọa Hóa và pháp bảo bắt đầu có trọng lượng.' },
        { id: 'purple', label: 'Tử Phủ', complete: order >= 14, reason: 'Nối Trúc Cơ với Kim Đan bằng nội cảnh và content mid-early.' },
        { id: 'golden', label: 'Kim Đan', complete: order >= 18, reason: 'Hoàn thành mục tiêu vertical slice đầu tiên.' },
    ];
    const completed = checkpoints.filter(x => x.complete).length;
    const progressPct = Math.max(order >= 18 ? 100 : 0, pct(completed, 0, checkpoints.length));
    const age = Math.max(0, state.ageYears);
    const startAge = FIRST_LIFE_START_AGE_V84;
    const ageBand = milestoneAgeBandV84(stage.targetRealmOrder, startAge);
    const targetAge = ageBand.targetAge;
    let pace = 'onPace';
    let paceReason = 'Nhịp cảnh giới và tuổi đang trong dải V84 giữa Tự Tu và Bế Quan.';
    if (stage.id !== 'postSlice' && life.lifeNumber === 1) {
        if (age < ageBand.toleranceMinAge) {
            pace = 'ahead';
            paceReason = 'Tiến cảnh giới nhanh hơn dải đời đầu; nên xen boss, build và event thay vì chỉ đẩy Tu Vi.';
        }
        else if (age > ageBand.toleranceMaxAge * 1.25) {
            pace = 'stalled';
            paceReason = 'Đang chậm rõ rệt so với dải V84; kiểm tra build, hoạt động và nguồn Tu Vi thay vì Bế Quan lặp.';
        }
        else if (age > ageBand.toleranceMaxAge) {
            pace = 'slow';
            paceReason = 'Hơi chậm so với dải V84; ưu tiên nguồn Tu Vi và tài nguyên đúng nút thắt.';
        }
    }
    const availableDecisionCount = availableEvents.reduce((sum, event) => sum + Math.max(1, event.choices.length), 0);
    const decisionDensity = availableDecisionCount >= 5 ? 'rich' : availableDecisionCount >= 2 ? 'healthy' : 'thin';
    const recommendedActions = [];
    if (!firstClear && order >= 1)
        recommendedActions.push('Hạ Boss Săn Yêu đầu tiên hoặc công phá Tụ Linh Động tầng 1 để mở vòng build/boss.');
    if (buildSkillCount < 3 && order >= 2)
        recommendedActions.push('Lĩnh ngộ/trang bị thêm skill; đừng chỉ tăng CP thô.');
    if (professionBest < 12 && order >= 4)
        recommendedActions.push('Đẩy ít nhất một nghề lên mastery 12+ để economy có nhánh lựa chọn.');
    if (decisionDensity === 'thin' && order < 18)
        recommendedActions.push('Di chuyển/khám phá hoặc hoàn thành điều kiện event hiện có trước khi bế quan dài.');
    if (cultivationProgressV140(state, order).progressPct >= 92)
        recommendedActions.push('Tu Vi gần đầy: chuẩn bị Thăng Cảnh hoặc Thiên Kiếp ở mốc lớn.');
    if (order >= 18)
        recommendedActions.push('Vertical slice đã đạt Kim Đan: đánh giá đời này, boss/build và quyết định tiếp tục hay chuẩn bị Luân Hồi.');
    return { stage: stage.id, stageName: stage.name, age, targetAge, target: 'Phàm Nhân → Luyện Khí → Trúc Cơ → Tử Phủ → Kim Đan', progressPct, pace, paceReason, checkpoints, availableDecisionCount, decisionDensity, recommendedActions: recommendedActions.slice(0, 5) };
}
//# sourceMappingURL=early-game.js.map