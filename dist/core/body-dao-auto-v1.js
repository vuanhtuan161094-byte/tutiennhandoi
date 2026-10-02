export const BODY_DAO_AUTO_SCHEMA_V1 = 'body-dao.auto.v1';
export const BODY_DAO_AUTO_DEFAULT_PRESET_V1 = 'balanced';
export const BODY_DAO_AUTO_PRESETS_V1 = Object.freeze([
  Object.freeze({ id: 'cautious', label: 'Thận trọng', minHpPct: 85, description: 'Chỉ Nhiên Huyết khi Khí Huyết còn rất cao.' }),
  Object.freeze({ id: 'balanced', label: 'Cân bằng', minHpPct: 75, description: 'Mặc định: giữ nhịp công thủ cân bằng.' }),
  Object.freeze({ id: 'aggressive', label: 'Liều mạng', minHpPct: 65, description: 'Chấp nhận hao máu sớm hơn để giữ Huyết Bạo, nhưng không đốt máu vô ích khi áp lực đã cao.' }),
]);

const BODY_BLOOD_RUSH_SKILL_ID = 'skill.dao.body.elephant';
const BODY_BREAK_SKILL_ID = 'skill.dao.body.break';
const BODY_BLOOD_RUSH_AUTO_PRIORITY_V1 = 136;
const BODY_BLOOD_RUSH_PAYOFF_PRIORITY_V1 = 135;
const BODY_BLOOD_RUSH_COUNTER_FORCE_GATE_V1 = 20;
const PRESET_BY_ID = new Map(BODY_DAO_AUTO_PRESETS_V1.map(row => [row.id, row]));
const NAME_TOKEN = '|body-auto:';

export function normalizeBodyDaoAutoPresetV1(value) {
  const id = String(value ?? '').trim().toLowerCase();
  return PRESET_BY_ID.has(id) ? id : BODY_DAO_AUTO_DEFAULT_PRESET_V1;
}

export function bodyDaoAutoPresetDefinitionV1(value) {
  return PRESET_BY_ID.get(normalizeBodyDaoAutoPresetV1(value));
}

export function bodyDaoAutoMinHpPctV1(value) {
  return bodyDaoAutoPresetDefinitionV1(value)?.minHpPct ?? 75;
}

export function bodyDaoAutoCounterForceMinV1(profile) {
  const rule = profile?.rules?.find?.(row => row?.skillId === BODY_BLOOD_RUSH_SKILL_ID);
  const condition = rule?.conditions?.find?.(row =>
    row?.type === 'bodyBloodRushPayoffReady'
    || (row?.type === 'selfDaoV2ResourceAtLeast' && row?.resource === 'counterForce')
  );
  const value = Number(condition?.value);
  return Number.isFinite(value) ? Math.max(0, value) : BODY_BLOOD_RUSH_COUNTER_FORCE_GATE_V1;
}

function presetFromName(name) {
  const text = String(name ?? '');
  const index = text.lastIndexOf(NAME_TOKEN);
  if (index < 0) return undefined;
  const id = text.slice(index + NAME_TOKEN.length).split('|')[0].trim().toLowerCase();
  return PRESET_BY_ID.has(id) ? id : undefined;
}

function presetFromBloodRushRule(profile) {
  const rule = profile?.rules?.find?.(row => row?.skillId === BODY_BLOOD_RUSH_SKILL_ID);
  const hp = rule?.conditions?.find?.(condition => condition?.type === 'selfHpAbove');
  const pct = Number(hp?.pct);
  if (!Number.isFinite(pct)) return undefined;
  let best;
  let distance = Infinity;
  for (const row of BODY_DAO_AUTO_PRESETS_V1) {
    const delta = Math.abs(row.minHpPct - pct);
    if (delta < distance) {
      best = row.id;
      distance = delta;
    }
  }
  return best;
}

export function bodyDaoAutoPresetFromProfileV1(profile) {
  const explicit = String(profile?.bodyAutoPresetV1 ?? '').trim().toLowerCase();
  if (PRESET_BY_ID.has(explicit)) return explicit;
  return presetFromName(profile?.name) ?? presetFromBloodRushRule(profile) ?? BODY_DAO_AUTO_DEFAULT_PRESET_V1;
}

function stripPresetToken(name) {
  const text = String(name ?? 'battle-dao.auto.v127:body');
  const index = text.lastIndexOf(NAME_TOKEN);
  return index < 0 ? text : text.slice(0, index);
}

export function applyBodyDaoAutoPresetV1(profile, presetId) {
  const id = normalizeBodyDaoAutoPresetV1(presetId);
  const minHpPct = bodyDaoAutoMinHpPctV1(id);
  const sourceRules = Array.isArray(profile?.rules) ? profile.rules : [];
  const hasBloodRush = sourceRules.some(rule => rule?.skillId === BODY_BLOOD_RUSH_SKILL_ID);
  const rules = sourceRules.map(rule => {
    const next = { ...rule, conditions: (rule?.conditions ?? []).map(condition => ({ ...condition })) };
    // When Huyết–Công is equipped, routine Break becomes the payoff after Huyết Bạo opens.
    // Guard/Bất Động remain above both lanes; only this Break cash-out is staged behind Nhiên Huyết.
    if (hasBloodRush && next.skillId === BODY_BREAK_SKILL_ID) next.priority = BODY_BLOOD_RUSH_PAYOFF_PRIORITY_V1;
    if (next.skillId !== BODY_BLOOD_RUSH_SKILL_ID) return next;
    next.priority = BODY_BLOOD_RUSH_AUTO_PRIORITY_V1;
    let hpFound = false;
    let payoffFound = false;
    next.conditions = next.conditions.map(condition => {
      if (condition.type === 'selfHpAbove') {
        hpFound = true;
        return { ...condition, pct: minHpPct };
      }
      if (condition.type === 'bodyBloodRushPayoffReady'
          || (condition.type === 'selfDaoV2ResourceAtLeast' && condition.resource === 'counterForce')) {
        payoffFound = true;
        return { type: 'bodyBloodRushPayoffReady', resource: 'counterForce', value: BODY_BLOOD_RUSH_COUNTER_FORCE_GATE_V1 };
      }
      return condition;
    });
    if (!hpFound) next.conditions.push({ type: 'selfHpAbove', pct: minHpPct });
    if (!payoffFound) next.conditions.push({ type: 'bodyBloodRushPayoffReady', resource: 'counterForce', value: BODY_BLOOD_RUSH_COUNTER_FORCE_GATE_V1 });
    return next;
  });
  return {
    ...(profile ?? {}),
    schema: BODY_DAO_AUTO_SCHEMA_V1,
    name: `${stripPresetToken(profile?.name)}${NAME_TOKEN}${id}`,
    bodyAutoPresetV1: id,
    rules,
  };
}

export function bodyDaoAutoUiV1(profile, available = true) {
  const currentPresetId = bodyDaoAutoPresetFromProfileV1(profile);
  const current = bodyDaoAutoPresetDefinitionV1(currentPresetId);
  return {
    schema: BODY_DAO_AUTO_SCHEMA_V1,
    available: Boolean(available),
    currentPresetId,
    currentLabel: current?.label ?? 'Cân bằng',
    hardSafetyMinHpPct: 35,
    presets: BODY_DAO_AUTO_PRESETS_V1.map(row => ({ ...row })),
  };
}
