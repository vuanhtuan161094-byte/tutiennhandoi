export const NASCENT_MIDGAME_V112 = Object.freeze({
  schema: 'nascent-midgame.v112',
  soulPoolDungeonId: 'dungeon.soul_nourishing_pool',
  huaShenOrder: 26,
  finalRealmOrder: 25,
  soulTargets: Object.freeze({ strength: 180, purity: 79, stability: 88 }),
  stageFloorTargets: Object.freeze({ 22: 2, 23: 4, 24: 5, 25: 6 }),
});

const PURPOSE_NAMES = Object.freeze({
  general: 'Toàn Năng', cultivation: 'Tu Luyện', alchemy: 'Luyện Đan', forging: 'Luyện Khí', artifact: 'Pháp Bảo',
  beast: 'Linh Thú', talisman: 'Phù Trận', soul: 'Thần Hồn', dao: 'Ngộ Đạo', space: 'Hư Không', integration: 'Hợp Thể',
  great_vehicle: 'Đại Thừa', tribulation: 'Độ Kiếp', immortal: 'Tiên Đạo', bloodline: 'Huyết Mạch', physique: 'Thể Chất', technique: 'Công Pháp',
});

function n(value) { return Number.isFinite(Number(value)) ? Number(value) : 0; }
function currentOrder(state) { return Math.max(0, Math.floor(n(state?.realm?.maxRealmOrder))); }
function highestFloor(state, dungeonId) { return Math.max(0, Math.floor(n(state?.dungeons?.highestClearedFloor?.[dungeonId]))); }
function cloneWork(clone, assignment) {
  return {
    years: Math.max(n(clone?.dungeonWorkYears), n(assignment?.totalYears)),
    runs: Math.max(Math.floor(n(clone?.dungeonWorkRuns)), Math.floor(n(assignment?.totalRuns))),
  };
}
function objective(id, name, complete, current, target, detail, route) {
  return { id, name, complete: Boolean(complete), current, target, detail, route };
}
function missingSummary(objectives) { return objectives.filter(x => !x.complete).map(x => x.name); }

export function buildNascentMidgameV112(state, worldDungeons = {}) {
  const order = currentOrder(state);
  const active = order >= 22 && order <= 25;
  const completed = order >= NASCENT_MIDGAME_V112.huaShenOrder;
  const soul = state?.soul ?? {};
  const assignments = state?.dungeons?.assignments ?? {};
  const clones = Array.isArray(soul.clones) ? soul.clones : [];
  const poolFloor = highestFloor(state, NASCENT_MIDGAME_V112.soulPoolDungeonId);
  const stageTargetFloor = NASCENT_MIDGAME_V112.stageFloorTargets[order] ?? (order < 22 ? 0 : 6);
  const targets = NASCENT_MIDGAME_V112.soulTargets;
  const soulReady = Boolean(soul.awakened) && n(soul.strength) >= targets.strength && n(soul.purity) >= targets.purity && n(soul.stability) >= targets.stability;
  const assignedClones = clones.filter(clone => Boolean(assignments[clone.id]));
  const workedClones = assignedClones.filter(clone => cloneWork(clone, assignments[clone.id]).runs >= 1);
  const cloneReady = clones.length >= 1 && assignedClones.length >= 1 && workedClones.length >= 1;
  const poolReady = poolFloor >= 6;
  const finalObjectives = [
    objective('soul-maturity', 'Ổn định Anh Thể', soulReady,
      `Cường ${n(soul.strength).toFixed(0)} · Thuần ${n(soul.purity).toFixed(0)} · Ổn ${n(soul.stability).toFixed(0)}`,
      `Cường ${targets.strength} · Thuần ${targets.purity} · Ổn ${targets.stability}`,
      'Dưỡng Hồn là đầu tư bắt buộc tối thiểu cho bước Hóa Thần; không cần max chỉ số.', 'soul'),
    objective('clone-operation', 'Vận hành Phân Thân', cloneReady,
      `${clones.length} Phân Thân · ${assignedClones.length} đang điều phối · ${workedClones.length} đã farm thật`,
      '≥1 Phân Thân đã được điều phối và hoàn thành ≥1 lượt farm song song',
      'Phân Thân chỉ farm tầng đã first-clear bằng DungeonEngine canonical; đúng chuyên môn Lục Đạo +20%, làm trái chuyên môn không bị phạt.', 'soul'),
    objective('soul-pool', 'Công phá Dưỡng Hồn Trì', poolReady, `Tầng ${poolFloor}/6`, 'First-clear Tầng 6',
      'Tầng 6 là bài kiểm tra combat cuối Nguyên Anh; first-clear dùng CombatKernel V2, sau đó mới trở thành điểm farm.', 'dungeons'),
  ];
  const readyForHuaShen = finalObjectives.every(x => x.complete);

  let nextAction = { route: 'cultivation', title: 'Tiếp tục Tu Luyện', detail: 'Tích Tu Vi song song với Nguyên Anh Tu Nghiệp.' };
  const dew = n(state?.inventory?.['resource.soul_dew']);
  const essence = n(state?.inventory?.['resource.soul_essence']);
  const nextCloneDew = 18 + clones.length * 8;
  const nextCloneEssence = 6 + clones.length * 3;
  if (active) {
    if (clones.length === 0) {
      if (dew >= nextCloneDew && essence >= nextCloneEssence) {
        nextAction = { route: 'soul', title: 'Tạo Phân Thân đầu tiên', detail: `Đủ ${nextCloneDew} Dưỡng Hồn Lộ + ${nextCloneEssence} Thần Hồn Tinh Hoa. Lục Đạo được mở theo thứ tự cố định; không chọn chuyên môn thủ công.` };
      } else {
        nextAction = { route: 'dungeons', title: 'Farm Dưỡng Hồn Trì', detail: `Còn thiếu nguyên liệu tạo Phân Thân. Hãy first-clear/farm Dưỡng Hồn Trì; không cần Gacha.` };
      }
    } else if (assignedClones.length === 0) {
      nextAction = { route: 'soul', title: 'Điều phối Phân Thân', detail: 'Giao Phân Thân vào một tầng Phó Bản đã first-clear; ưu tiên đúng purpose với chuyên môn.' };
    } else if (workedClones.length === 0) {
      nextAction = { route: 'soul', title: 'Cho Phân Thân vận hành thật', detail: 'Giữ assignment rồi Tu Luyện/Bế Quan/Săn Yêu; thời gian trôi sẽ chạy farm song song/offline.' };
    } else if (!soulReady) {
      if (dew >= 4 && essence >= 1) nextAction = { route: 'soul', title: 'Dưỡng Hồn', detail: `Mục tiêu Hóa Thần: Cường ${targets.strength} · Thuần ${targets.purity} · Ổn ${targets.stability}.` };
      else nextAction = { route: 'dungeons', title: 'Bổ sung nguyên liệu Dưỡng Hồn', detail: 'Farm Dưỡng Hồn Trì để lấy Dưỡng Hồn Lộ + Thần Hồn Tinh Hoa rồi quay lại Dưỡng Hồn.' };
    } else if (poolFloor < stageTargetFloor) {
      nextAction = { route: 'dungeons', title: `Công phá Dưỡng Hồn Trì Tầng ${poolFloor + 1}`, detail: `Mốc gameplay của cảnh hiện tại: tiến tới Tầng ${stageTargetFloor}.` };
    } else if (order === 25 && !poolReady) {
      nextAction = { route: 'dungeons', title: `Công phá Dưỡng Hồn Trì Tầng ${poolFloor + 1}`, detail: 'Hoàn tất Tầng 6 để chứng minh Anh Thể đủ ổn định trước Hóa Thần.' };
    } else if (order === 25 && readyForHuaShen) {
      nextAction = { route: 'cultivation', title: 'Chuẩn bị Hóa Thần', detail: 'Nguyên Anh Tu Nghiệp đã hoàn tất; khi đủ Tu Vi có thể Đột Phá Hóa Thần.' };
    }
  }

  const assignmentsView = assignedClones.map(clone => {
    const assignment = assignments[clone.id];
    const dungeon = worldDungeons?.[assignment.dungeonId];
    const purpose = dungeon?.purpose ?? 'general';
    const specialization = clone.specialization ?? 'general';
    const work = cloneWork(clone, assignment);
    const matched = specialization === 'general' || specialization === purpose;
    return {
      cloneId: clone.id, cloneName: clone.name, specialization, specializationName: PURPOSE_NAMES[specialization] ?? specialization,
      dungeonId: assignment.dungeonId, dungeonName: dungeon?.name ?? assignment.dungeonId, dungeonPurpose: purpose,
      floor: assignment.floor, matched, efficiencyRule: matched ? '×1.20' : '×1.00',
      workYears: work.years, workRuns: work.runs,
    };
  });

  return {
    schema: NASCENT_MIDGAME_V112.schema,
    revision: 'alpha.23.62',
    active,
    completed,
    order,
    title: 'Nguyên Anh Tu Nghiệp',
    role: 'Dùng Thần Hồn để mở farm song song thật, nuôi Anh Thể và vượt bài kiểm tra Dưỡng Hồn Trì trước Hóa Thần.',
    stage: {
      targetFloor: stageTargetFloor,
      currentFloor: poolFloor,
      headline: order === 22 ? 'Sơ kỳ · khai Phân Thân' : order === 23 ? 'Trung kỳ · mở rộng điều phối' : order === 24 ? 'Hậu kỳ · ổn định Anh Thể' : order === 25 ? 'Viên mãn · chứng đạo trước Hóa Thần' : completed ? 'Đã bước qua Nguyên Anh' : 'Chưa mở',
    },
    finalGate: {
      applies: order === NASCENT_MIDGAME_V112.finalRealmOrder,
      ready: readyForHuaShen,
      objectives: finalObjectives,
      missing: missingSummary(finalObjectives),
      reward: 'Hóa Thần mở Đạo Ý/Đạo Vực và Ngộ Đạo Đài; không tạo thêm một hệ Phân Thân mới.',
    },
    cloneOperation: {
      owned: clones.length,
      assigned: assignedClones.length,
      worked: workedClones.length,
      assignments: assignmentsView,
      rule: 'Phân Thân = worker Phó Bản song song/offline cho tầng đã first-clear; không thay Main Body để first-clear Boss.',
    },
    nextAction,
  };
}

export function nascentHuaShenBlockersV112(state, worldDungeons = {}) {
  const report = buildNascentMidgameV112(state, worldDungeons);
  if (report.order !== NASCENT_MIDGAME_V112.finalRealmOrder || report.finalGate.ready) return [];
  return report.finalGate.objectives.filter(x => !x.complete).map(x => `Nguyên Anh Tu Nghiệp · ${x.name}: ${x.current} → ${x.target}`);
}
