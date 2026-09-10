// V150 Pháp Bảo/Chí Bảo combat adapter.
// V149 finite progression + Bảo Hồn remain in artifact-v149-base.js.
// V150 removes Bảo Khí as a gameplay resource: Pháp Bảo now run only on trigger + cooldown + state/mark combo.
export * from './artifact-v149-base.js';

import {
  ARTIFACTS_V88 as BASE_ARTIFACTS_V88,
  RELICS_V88 as BASE_RELICS_V88,
  artifactCombatRuntimeV88 as artifactCombatRuntimeBase,
  applyArtifactsV88ToEntity as applyArtifactsBase,
  artifactViewV88 as artifactViewBase,
  relicViewV88 as relicViewBase,
  artifactGradeIndexV88,
  artifactFortuneSummaryV88,
} from './artifact-v149-base.js';

export const ARTIFACT_RESOURCE_SCHEMA_V150 = 'artifact.resource.v150';
export const ARTIFACT_RESOURCE_MODE_V150 = 'trigger-cooldown';
export const ARTIFACT_NO_RESOURCE_COOLDOWN_MULTIPLIER_V150 = 1.05;
export const ARTIFACT_COMBO_SCHEMA_V149 = 'artifact.combo.v149';

const ARTIFACT_TEXT_V150 = Object.freeze({
  'artifact.spirit_suppressing_bell': {
    skillDescription: 'Khi chịu sát thương và HP thấp, theo hồi chiêu dựng hộ thuẫn.',
  },
  'artifact.thunder_guiding_mirror': {
    passiveName: 'Dẫn Lôi',
    passiveDescription: 'Chuyên tạo Lôi Ấn để mở combo cho Pháp Bảo tương thích.',
  },
  'artifact.thunder_punishment_sword': {
    skillDescription: 'Sau nhịp công kích, theo hồi chiêu gọi thiên lôi đánh mục tiêu.',
  },
  'artifact.blood_severing_gourd': {
    skillDescription: 'Khi địch hồi phục, theo hồi chiêu áp anti-heal và huyết phệ.',
  },
  'artifact.purple_mansion_lamp': {
    role: 'Hồi Chân Nguyên / sustain',
    description: 'Minh đăng dưỡng thần, giữ nhịp kỹ năng và hộ thân trong trường chiến.',
    passiveName: 'Minh Hỏa Dưỡng Thần',
    passiveDescription: 'Thiên về hồi Chân Nguyên và ổn định nhịp chiến đấu.',
    skillDescription: 'Định kỳ theo đòn chủ động, hồi Chân Nguyên và mở hiệu ứng tiến giai.',
  },
  'artifact.golden_core_cauldron': {
    skillDescription: 'Theo hồi chiêu phóng Đan Hỏa gây sát thương và thiêu đốt.',
  },
  'artifact.starfall_sword_box': {
    skillDescription: 'Sau bạo kích, theo hồi chiêu phóng chuỗi tinh kiếm truy kích.',
  },
  'artifact.soul_nourishing_lotus': {
    passiveName: 'Liên Tâm',
    passiveDescription: 'Thiên về thanh tẩy, hộ hồn và giữ Chân Nguyên khi bị ép máu.',
  },
  'artifact.nascent_soul_banner': {
    skillDescription: 'Theo hồi chiêu tạo hai ảnh hồn nối đòn từ công kích chủ động.',
  },
  'artifact.green_spirit_gourd': {
    passiveName: 'Hồi Linh',
    passiveDescription: 'Ưu tiên cứu Chân Nguyên khi tài nguyên xuống thấp.',
    skillDescription: 'Khi Chân Nguyên thấp, theo hồi chiêu hồi Chân Nguyên chuẩn.',
  },
});

function artifactDefinitionV150(def) {
  const patch = ARTIFACT_TEXT_V150[def.id] ?? {};
  const passive = { ...(def.passive ?? {}) };
  const skill = { ...(def.skill ?? {}) };
  delete passive.baoQiGainPct;
  delete passive.costReductionPct;
  delete skill.baoQiCost;
  delete skill.baoQiGain;
  if (patch.passiveName) passive.name = patch.passiveName;
  if (patch.passiveDescription) passive.description = patch.passiveDescription;
  if (patch.skillDescription) skill.description = patch.skillDescription;
  return Object.freeze({
    ...def,
    role: patch.role ?? def.role,
    description: patch.description ?? def.description,
    passive: Object.freeze(passive),
    skill: Object.freeze(skill),
  });
}

const v150Damage = (coefficient, extra = {}) => ({ type: 'damage', coefficient, sourceTag: 'Summon', canCrit: false, canDodge: true, procCoefficient: 0, ...extra });
const v150Shield = (maxHpPct, duration = 5) => ({ type: 'shield', capacity: 0, stability: Infinity, duration, maxHpPct, overflowDamageRatio: .25 });

const RELIC_OVERRIDES_V150 = Object.freeze({
  'relic.1': {
    ruleDescription: 'Một lần/trận khi HP dưới 35%, triển khai Sơn Hà Giới và tạo khiên lớn.',
    trigger: { name: 'Sơn Hà Giới', description: 'Một lần/trận khi HP dưới 35%, tạo hộ thuẫn lớn.', event: 'OnDamageTaken', cooldown: 999, hpBelowPct: 35, oncePerBattle: true, effects: [v150Shield(18, 6)] },
  },
  'relic.3': {
    trigger: { name: 'Trảm Tiên', description: 'Địch dưới 20% HP sẽ bị Chí Bảo trảm kích.', event: 'OnHit', sourceTags: ['ActiveHit'], cooldown: 9, targetHpBelowPct: 20, effects: [v150Damage(.85, { canDodge: false, trueDamage: true })] },
  },
  'relic.4': {
    role: 'Không gian / đổi nhịp',
    description: 'Xuyên qua khe hư không để nối một nhịp công kích và hồi Chân Nguyên.',
    ruleName: 'Thái Hư Xuyên Giới',
    ruleDescription: 'Theo chu kỳ sau đòn chủ động, xuyên kích không thể né và hồi một phần Chân Nguyên.',
    trigger: { name: 'Thái Hư Xuyên Giới', description: 'Theo chu kỳ sau đòn chủ động, xuyên kích và hồi Chân Nguyên.', event: 'OnHit', sourceTags: ['ActiveHit'], cooldown: 12, effects: [v150Damage(.38, { canDodge: false, unavoidable: true }), { type: 'restoreSpirit', flat: 10 }] },
  },
  'relic.5': {
    role: 'Cộng hưởng Pháp Bảo',
    description: 'Lắng nghe Pháp Kỹ đã kích phát rồi đánh thêm một nhịp đạo âm.',
    ruleName: 'Vạn Pháp Cộng Minh',
    ruleDescription: 'Khi một ProcHit xuất hiện, theo hồi chiêu phát đạo âm truy kích; không khóa theo bộ Pháp Bảo.',
    trigger: { name: 'Vạn Pháp Cộng Minh', description: 'Pháp Kỹ tạo ProcHit sẽ gọi thêm một nhịp đạo âm.', event: 'OnHit', sourceTags: ['ProcHit'], cooldown: 7.5, effects: [v150Damage(.32, { canDodge: false })] },
  },
  'relic.6': {
    role: 'Luyện hóa áp lực',
    description: 'Dùng Hỗn Độn lực đổi một phần nhịp nguy hiểm thành hộ thuẫn và Chân Nguyên.',
    ruleName: 'Hỗn Độn Dung Lô',
    ruleDescription: 'Khi chịu đòn lúc HP dưới 70%, theo hồi chiêu dựng khiên và hồi Chân Nguyên.',
    trigger: { name: 'Hỗn Độn Dung Lô', description: 'HP dưới 70%: dựng khiên và hồi Chân Nguyên.', event: 'OnDamageTaken', cooldown: 10, hpBelowPct: 70, effects: [v150Shield(8, 5), { type: 'restoreSpirit', flat: 8 }] },
  },
  'relic.7': {
    ruleDescription: 'Khi mục tiêu né, phản kích không thể né theo hồi chiêu.',
    trigger: { name: 'Định Càn Khôn', description: 'Khi mục tiêu né, phản kích không thể né.', event: 'OnTargetDodge', sourceTags: ['ActiveHit'], cooldown: 8, effects: [v150Damage(.58, { canDodge: false, unavoidable: true })] },
  },
  'relic.8': {
    trigger: { name: 'Tịnh Thế', description: 'HP thấp: thanh tẩy khống chế và hộ thân.', event: 'OnDamageTaken', cooldown: 14, hpBelowPct: 45, effects: [{ type: 'removeStatus', groups: ['BodyControl', 'SpiritControl'], target: 'self' }, v150Shield(9, 5)] },
  },
});

function relicDefinitionV150(def) {
  const patch = RELIC_OVERRIDES_V150[def.id] ?? {};
  const out = { ...def, ...patch };
  delete out.costReductionPct;
  delete out.baoQiGainPct;
  delete out.baoQiMaxBonus;
  if (out.trigger) {
    out.trigger = { ...out.trigger };
    delete out.trigger.baoQiCost;
    delete out.trigger.baoQiGain;
    out.trigger.effects = (out.trigger.effects ?? []).map(e => ({ ...e }));
  }
  return Object.freeze(out);
}

export const ARTIFACTS_V88 = Object.freeze(BASE_ARTIFACTS_V88.map(artifactDefinitionV150));
export const RELICS_V88 = Object.freeze(BASE_RELICS_V88.map(relicDefinitionV150));

const ARTIFACT_BY_ID_V150 = new Map(ARTIFACTS_V88.map(x => [x.id, x]));
const RELIC_BY_ID_V150 = new Map(RELICS_V88.map(x => [x.id, x]));

export function artifactDefinitionV88(id) { return ARTIFACT_BY_ID_V150.get(id); }
export function relicDefinitionV88(id) { return RELIC_BY_ID_V150.get(id); }

export const ARTIFACT_COMBO_RULES_V149 = Object.freeze({
  'artifact.spirit_suppressing_bell': { kind: 'reactive', listens: ['LowHP','OnDamageTaken'], note: 'Hộ chủ khi thấp máu; hưởng lợi từ mọi nguồn kéo dài thời gian sống.' },
  'artifact.thunder_guiding_mirror': { kind: 'setup', produces: ['Lôi Ấn'], tags: ['Lightning','Mark'], note: 'Tạo Lôi Ấn cho bất kỳ finisher tương thích; không khóa theo bộ.' },
  'artifact.thunder_punishment_sword': { kind: 'finisher', consumes: [{ mark: 'Lôi Ấn', max: 3 }], tags: ['Lightning','Burst'], note: 'Tiêu tối đa 3 Lôi Ấn để cộng sát thương; dấu ấn có thể đến từ bất kỳ hệ thống nào.' },
  'artifact.true_sight_mirror': { kind: 'setup-reactive', listens: ['OnTargetDodge'], produces: ['Phá Vọng'], tags: ['AntiDodge','Mark'], note: 'Giai V tạo Phá Vọng để follow-up tương thích tận dụng.' },
  'artifact.mountain_breaking_seal': { kind: 'reactive', listens: ['OnShieldBreak'], produces: ['Sơn Chấn'], tags: ['Break'], note: 'Kích hoạt từ mọi nguồn phá khiên, không cần cùng bộ.' },
  'artifact.blood_severing_gourd': { kind: 'reactive', listens: ['OnEnemyHeal'], tags: ['AntiHeal','DoT'], note: 'Phản ứng với hồi phục của địch từ toàn combat.' },
  'artifact.purple_mansion_lamp': { kind: 'engine-reactive', listens: ['OnHit'], provides: ['Chân Nguyên'], tags: ['Spirit','Sustain'], note: 'Hồi Chân Nguyên theo nhịp để giữ chu kỳ kỹ năng; không còn tài nguyên Bảo Khí.' },
  'artifact.golden_core_cauldron': { kind: 'setup-damage', produces: ['Đan Hỏa'], tags: ['Fire','DoT','Mark'], note: 'Tạo áp lực Đan Hỏa cho các tương tác dấu ấn về sau.' },
  'artifact.starfall_sword_box': { kind: 'finisher-reactive', listens: ['OnCrit'], consumes: [{ mark: 'Phá Vọng', max: 1 }], tags: ['FollowUp','Crit'], note: 'Bạo kích kích hoạt kiếm hạp; nếu có Phá Vọng sẽ tiêu 1 tầng để tăng truy kích.' },
  'artifact.soul_nourishing_lotus': { kind: 'reactive', listens: ['LowHP','OnDamageTaken'], tags: ['Cleanse','Sustain'], note: 'Kích hoạt độc lập khi bị ép máu thấp.' },
  'artifact.nascent_soul_banner': { kind: 'follow-up', listens: ['OnHit'], tags: ['Echo'], note: 'Nối đòn từ hit chủ động; không khóa nguồn tạo nhịp.' },
  'artifact.green_spirit_gourd': { kind: 'engine-reactive', listens: ['LowSpirit','OnHit'], provides: ['Chân Nguyên'], tags: ['Spirit','Sustain'], note: 'Cứu Chân Nguyên khi thấp để giữ chu kỳ kỹ năng.' },
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

function noBaoQiTriggerV150(trigger) {
  if (!['artifactSkill','relicRule'].includes(trigger?.runtimeV88?.kind)) return trigger;
  const { baoQiCost: _cost, baoQiGain: _gain, ...runtime } = trigger.runtimeV88;
  const cooldown = runtime.kind === 'artifactSkill'
    ? Number((Math.max(0, Number(trigger.cooldown) || 0) * ARTIFACT_NO_RESOURCE_COOLDOWN_MULTIPLIER_V150).toFixed(2))
    : trigger.cooldown;
  return {
    ...trigger,
    cooldown,
    runtimeV88: {
      ...runtime,
      resourceMode: ARTIFACT_RESOURCE_MODE_V150,
      baoQiRemovedV150: true,
    },
  };
}

function scaleEffectV150(effect, multiplier) {
  const x = { ...effect };
  if (x.type === 'damage') {
    x.coefficient = Number((Number(x.coefficient ?? 0) * multiplier).toFixed(6));
    if (x.attackCoefficient !== undefined) x.attackCoefficient = Number((Number(x.attackCoefficient) * multiplier).toFixed(6));
  } else if (x.type === 'damageOverTime') {
    x.coefficientPerTick = Number((Number(x.coefficientPerTick ?? 0) * multiplier).toFixed(6));
  } else if (x.type === 'heal') {
    if (x.flat !== undefined) x.flat = Number((Number(x.flat) * multiplier).toFixed(6));
    if (x.maxHpPct !== undefined) x.maxHpPct = Number((Number(x.maxHpPct) * multiplier).toFixed(6));
    if (x.attackCoefficient !== undefined) x.attackCoefficient = Number((Number(x.attackCoefficient) * multiplier).toFixed(6));
  } else if (x.type === 'shield') {
    if (x.capacity !== undefined) x.capacity = Number((Number(x.capacity) * multiplier).toFixed(6));
    if (x.maxHpPct !== undefined) x.maxHpPct = Number((Number(x.maxHpPct) * multiplier).toFixed(6));
    if (x.attackCoefficient !== undefined) x.attackCoefficient = Number((Number(x.attackCoefficient) * multiplier).toFixed(6));
  }
  return x;
}

function relicTriggerV150(state, relic) {
  if (!relic?.trigger) return undefined;
  const p = state?.economyV12325?.extraItems?.[relic.id] ?? { owned: true, level: 1, advance: 0, specificFragments: 0 };
  const level = Math.max(1, Math.min(100, Math.floor(Number(p.level) || 1)));
  const scale = (.9 + level * .0045) * (1 + artifactGradeIndexV88(p) * .06) * (1 + artifactFortuneSummaryV88(state).relicPowerPct / 100);
  return noBaoQiTriggerV150({
    id: `artifact.v150.relic.${relic.id}`,
    event: relic.trigger.event,
    chancePct: 100,
    sourceTags: relic.trigger.sourceTags,
    effects: (relic.trigger.effects ?? []).map(e => scaleEffectV150(e, scale)),
    cooldown: relic.trigger.cooldown,
    runtimeV88: {
      kind: 'relicRule',
      itemId: relic.id,
      itemName: relic.name,
      abilityName: relic.ruleName,
      label: 'CHÍ BẢO',
      hpBelowPct: relic.trigger.hpBelowPct,
      spiritBelowPct: relic.trigger.spiritBelowPct,
      targetHpBelowPct: relic.trigger.targetHpBelowPct,
      oncePerBattle: relic.trigger.oncePerBattle,
    },
  });
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
    sharedBaoQi: false,
    resourceMode: ARTIFACT_RESOURCE_MODE_V150,
    baoQiRemovedV150: true,
    activeCount: active.length,
    active,
    marksProduced,
    marksConsumed,
    matchedMarks,
    rule: 'Combo theo trigger/hồi chiêu/event/trạng thái/mark; khác bộ vẫn combo nếu điều kiện khớp.',
  };
}

export function artifactResourceSummaryV150() {
  return {
    schema: ARTIFACT_RESOURCE_SCHEMA_V150,
    mode: ARTIFACT_RESOURCE_MODE_V150,
    baoQiEnabled: false,
    cooldownMultiplier: ARTIFACT_NO_RESOURCE_COOLDOWN_MULTIPLIER_V150,
    rule: 'Pháp Bảo không dùng thanh tài nguyên riêng; mỗi món được điều tiết bằng trigger, hồi chiêu và điều kiện combat.',
  };
}

export function artifactCombatRuntimeV88(state) {
  const base = artifactCombatRuntimeBase(state);
  let triggers = (base.triggers ?? []).map(augmentArtifactTriggerV149).map(noBaoQiTriggerV150);
  const activeRelicId = state?.economyV12325?.activeRelicId;
  if (['relic.4','relic.5','relic.6'].includes(activeRelicId)) {
    const relic = RELIC_BY_ID_V150.get(activeRelicId);
    const injected = relicTriggerV150(state, relic);
    if (injected) triggers = [...triggers.filter(t => t.runtimeV88?.itemId !== activeRelicId), injected];
  }
  return {
    ...base,
    triggers,
    // Compatibility zeros keep the old CombatEngine resource branch inert until that legacy branch is physically removed.
    baoQiMax: 0,
    baseGainPerAction: 0,
    baoQiGainPct: 0,
    baoQiCostReductionPct: 0,
    comboV149: artifactComboSummaryV149(state),
    resourceV150: artifactResourceSummaryV150(),
  };
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
        baoQiMax: 0,
        baseGainPerAction: 0,
        baoQiGainPct: 0,
        baoQiCostReductionPct: 0,
        comboV149: runtime.comboV149,
        resourceV150: runtime.resourceV150,
      },
    },
  };
}

export function artifactViewV88(state, id) {
  const view = artifactViewBase(state, id);
  if (!view) return view;
  const def = ARTIFACT_BY_ID_V150.get(id);
  const comboV149 = comboRuleFor(id);
  return {
    ...view,
    name: def?.name ?? view.name,
    role: def?.role ?? view.role,
    description: def?.description ?? view.description,
    passive: def?.passive ?? view.passive,
    skill: def?.skill ?? view.skill,
    comboV149,
    resourceV150: artifactResourceSummaryV150(),
    v149: { ...(view.v149 ?? {}), combo: comboV149, hardSetLock: false, resourceMode: ARTIFACT_RESOURCE_MODE_V150, baoQiRemovedV150: true },
  };
}

export function relicViewV88(state, id) {
  const view = relicViewBase(state, id);
  if (!view) return view;
  const def = RELIC_BY_ID_V150.get(id);
  return {
    ...view,
    ...def,
    progress: view.progress,
    refinementLevel: view.refinementLevel,
    gradeLabel: view.gradeLabel,
    gradeIndex: view.gradeIndex,
    active: view.active,
    resourceV150: artifactResourceSummaryV150(),
  };
}
