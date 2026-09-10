// V149 Pháp Bảo combat adapter.
// The finite V88 + Bảo Hồn V149 implementation is preserved byte-for-byte in artifact-v149-base.js.
// This layer adds cross-artifact combo grammar without creating a second combat resolver.
export * from './artifact-v149-base.js';

import {
  ARTIFACTS_V88,
  artifactCombatRuntimeV88 as artifactCombatRuntimeBase,
  applyArtifactsV88ToEntity as applyArtifactsBase,
  artifactViewV88 as artifactViewBase,
} from './artifact-v149-base.js';

export const ARTIFACT_COMBO_SCHEMA_V149 = 'artifact.combo.v149';
export const ARTIFACT_COMBO_RULES_V149 = Object.freeze({
  'artifact.spirit_suppressing_bell': { kind: 'reactive', listens: ['LowHP','OnDamageTaken'], note: 'Hộ chủ khi thấp máu; hưởng lợi từ mọi nguồn kéo dài thời gian sống.' },
  'artifact.thunder_guiding_mirror': { kind: 'setup', produces: ['Lôi Ấn'], tags: ['Lightning','Mark'], note: 'Tạo Lôi Ấn cho bất kỳ finisher tương thích; không khóa theo bộ.' },
  'artifact.thunder_punishment_sword': { kind: 'finisher', consumes: [{ mark: 'Lôi Ấn', max: 3 }], tags: ['Lightning','Burst'], note: 'Tiêu tối đa 3 Lôi Ấn để cộng sát thương; dấu ấn có thể đến từ bất kỳ hệ thống nào.' },
  'artifact.true_sight_mirror': { kind: 'setup-reactive', listens: ['OnTargetDodge'], produces: ['Phá Vọng'], tags: ['AntiDodge','Mark'], note: 'Giai V tạo Phá Vọng để follow-up tương thích tận dụng.' },
  'artifact.mountain_breaking_seal': { kind: 'reactive', listens: ['OnShieldBreak'], produces: ['Sơn Chấn'], tags: ['Break'], note: 'Kích hoạt từ mọi nguồn phá khiên, không cần cùng bộ.' },
  'artifact.blood_severing_gourd': { kind: 'reactive', listens: ['OnEnemyHeal'], tags: ['AntiHeal','DoT'], note: 'Phản ứng với hồi phục của địch từ toàn combat.' },
  'artifact.purple_mansion_lamp': { kind: 'engine', provides: ['Bảo Khí'], tags: ['Resource'], note: 'Nuôi bể Bảo Khí dùng chung cho toàn bộ Pháp Bảo.' },
  'artifact.golden_core_cauldron': { kind: 'setup-damage', produces: ['Đan Hỏa'], tags: ['Fire','DoT','Mark'], note: 'Tạo áp lực Đan Hỏa cho các tương tác dấu ấn về sau.' },
  'artifact.starfall_sword_box': { kind: 'finisher-reactive', listens: ['OnCrit'], consumes: [{ mark: 'Phá Vọng', max: 1 }], tags: ['FollowUp','Crit'], note: 'Bạo kích kích hoạt kiếm hạp; nếu có Phá Vọng sẽ tiêu 1 tầng để tăng truy kích.' },
  'artifact.soul_nourishing_lotus': { kind: 'reactive', listens: ['LowHP','OnDamageTaken'], tags: ['Cleanse','Sustain'], note: 'Kích hoạt độc lập khi bị ép máu thấp.' },
  'artifact.nascent_soul_banner': { kind: 'follow-up', listens: ['OnHit'], tags: ['Echo'], note: 'Nối đòn từ hit chủ động; không khóa nguồn tạo nhịp.' },
  'artifact.green_spirit_gourd': { kind: 'engine-reactive', listens: ['LowSpirit','OnHit'], provides: ['Chân Nguyên'], tags: ['Resource'], note: 'Cứu Chân Nguyên khi thấp để giữ chu kỳ kỹ năng và Bảo Khí.' },
});

const round6 = n => Number(Math.max(0, Number(n) || 0).toFixed(6));
function comboRuleFor(id) {
  const rule = ARTIFACT_COMBO_RULES_V149[id];
  return rule ? JSON.parse(JSON.stringify(rule)) : undefined;
}
function augmentArtifactTriggerV149(trigger) {
  if (trigger?.runtimeV88?.kind !== 'artifactSkill') return trigger;
  const itemId = trigger.runtimeV88.itemId;
  const rule = comboRuleFor(itemId);
  const effects = [...(trigger.effects ?? [])];
  if (itemId === 'artifact.thunder_punishment_sword' && !effects.some(e => e.type === 'consumeMarkDamage' && e.mark === 'Lôi Ấn')) {
    const main = effects.find(e => e.type === 'damage');
    effects.push({
      type: 'consumeMarkDamage', mark: 'Lôi Ấn', maxConsume: 3,
      baseCoefficient: 0, coefficientPerStack: round6((main?.coefficient ?? 0.9) * 0.20),
      breakDamagePctPerStack: 2, sourceTag: 'Summon',
    });
  }
  if (itemId === 'artifact.starfall_sword_box' && !effects.some(e => e.type === 'consumeMarkDamage' && e.mark === 'Phá Vọng')) {
    const main = effects.find(e => e.type === 'damage');
    effects.push({
      type: 'consumeMarkDamage', mark: 'Phá Vọng', maxConsume: 1,
      baseCoefficient: 0, coefficientPerStack: round6((main?.coefficient ?? 0.38) * 0.45),
      breakDamagePctPerStack: 0, sourceTag: 'Summon',
    });
  }
  return {
    ...trigger,
    effects,
    runtimeV88: { ...trigger.runtimeV88, comboV149: rule, hardSetLock: false },
  };
}

export function artifactComboSummaryV149(state) {
  const activeIds = [...new Set(state?.activeArtifactIds ?? [])].filter(id => ARTIFACTS_V88.some(x => x.id === id) && state?.items?.[id]?.owned);
  const active = activeIds.map(id => ({ id, name: ARTIFACTS_V88.find(x => x.id === id)?.name, rule: comboRuleFor(id) })).filter(x => x.rule);
  const marksProduced = [...new Set(active.flatMap(x => x.rule.produces ?? []))];
  const marksConsumed = [...new Set(active.flatMap(x => (x.rule.consumes ?? []).map(c => c.mark)))];
  const matchedMarks = marksProduced.filter(mark => marksConsumed.includes(mark));
  return {
    schema: ARTIFACT_COMBO_SCHEMA_V149,
    hardSetLock: false,
    sharedBaoQi: true,
    activeCount: active.length,
    active,
    marksProduced,
    marksConsumed,
    matchedMarks,
    rule: 'Combo theo event/trạng thái/mark; khác bộ vẫn combo nếu điều kiện khớp.',
  };
}

export function artifactCombatRuntimeV88(state) {
  const base = artifactCombatRuntimeBase(state);
  const triggers = (base.triggers ?? []).map(augmentArtifactTriggerV149);
  return { ...base, triggers, comboV149: artifactComboSummaryV149(state) };
}

export function applyArtifactsV88ToEntity(baseEntity, state) {
  const applied = applyArtifactsBase(baseEntity, state);
  const runtime = artifactCombatRuntimeV88(state);
  const nonArtifactRuntime = (applied.triggers ?? []).filter(t => !['artifactSkill','relicRule'].includes(t?.runtimeV88?.kind));
  return {
    ...applied,
    triggers: [...nonArtifactRuntime, ...runtime.triggers],
    combatBuildV117: {
      ...(applied.combatBuildV117 ?? {}),
      artifactV88: {
        ...(applied.combatBuildV117?.artifactV88 ?? {}),
        comboV149: runtime.comboV149,
      },
    },
  };
}

export function artifactViewV88(state, id) {
  const view = artifactViewBase(state, id);
  if (!view) return view;
  const comboV149 = comboRuleFor(id);
  return {
    ...view,
    comboV149,
    v149: { ...(view.v149 ?? {}), combo: comboV149, hardSetLock: false },
  };
}
