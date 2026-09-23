import { compileCombatEncounterV1, runCompiledCombatEncounterV2, runCompiledCombatEncounterV3 } from './combat-v3-runtime.js';

export const PVP_V91_SCHEMA = 'pvp.v91';
export const PVP_V94_FEATURE_VERSION = 'v94';
export const PVP_V91_MIN_REALM_ORDER = 18;
export const PVP_V91_INITIAL_RATING = 1000;
export const PVP_V91_HISTORY_CAP = 30;
export const PVP_V91_PROVIDER_CONTRACT = 'pvp-opponent-provider.v1';
export const PVP_V91_SEASON_ID = 'dao-phap-s1-local';
export const PVP_V92_SEASON_DAYS = 28;
export const PVP_V92_SEASON_MS = PVP_V92_SEASON_DAYS * 24 * 3600_000;
export const PVP_V94_INTEGRITY_EVENT_CAP = 200;

const BANDS = [
  { id: 'easy', label: 'Dễ', name: 'Đạo Ảnh · Hạ Vị', ratingOffset: -70, baseScale: 0.950, slopePerRating: 0.000275 },
  { id: 'even', label: 'Ngang', name: 'Đạo Ảnh · Đồng Giai', ratingOffset: 0, baseScale: 1.008, slopePerRating: 0.000205 },
  { id: 'hard', label: 'Khó', name: 'Đạo Ảnh · Thượng Vị', ratingOffset: 90, baseScale: 1.052, slopePerRating: 0.000190 },
];
const RANKS = [
  { min: 1750, id: 'peak', name: 'Vấn Đỉnh' },
  { min: 1550, id: 'dao_child', name: 'Đạo Tử' },
  { min: 1400, id: 'heaven_pride', name: 'Thiên Kiêu' },
  { min: 1250, id: 'true_disciple', name: 'Chân Truyền' },
  { min: 1100, id: 'elite', name: 'Tinh Anh' },
  { min: -Infinity, id: 'rookie', name: 'Tân Tú' },
];
const SEASON_REWARD_BY_RANK = { rookie: 0, elite: 40, true_disciple: 70, heaven_pride: 110, dao_child: 160, peak: 240 };
const DIMINISHING_FACTORS = [1, 0.80, 0.60, 0.45, 0.35];
const SCALE_LINEAR_KEYS = ['maxHp', 'attack', 'defense', 'controlPower', 'resolve'];
const SCALE_SQRT_KEYS = ['maxSpirit', 'mobility', 'accuracy', 'actionSpeed'];
const TACTICAL_PRESETS = [
  { id: 'balanced', name: 'Cân Bằng', short: 'Cân bằng', description: 'Giữ nguyên rotation canonical của build; không ép xả sớm hay giữ tài nguyên.' },
  { id: 'tempo', name: 'Dồn Nhịp', short: 'Dồn nhịp', description: 'Đẩy ưu tiên kỹ năng gây sát thương để tạo áp lực sớm; không thêm cast tay.' },
  { id: 'stack', name: 'Tích Thế', short: 'Tích thế', description: 'Ưu tiên Setup/tích tài nguyên trước, trì hoãn Burst/Finisher cho tới khi đối thủ suy yếu.' },
  { id: 'reserve', name: 'Giữ Chân Nguyên', short: 'Giữ CN', description: 'Ưu tiên kỹ năng rẻ và Đánh Thường; kỹ năng tốn Chân Nguyên chỉ xả ở cửa sổ có giá trị.' },
  { id: 'execute', name: 'Kết Liễu', short: 'Kết liễu', description: 'Nuôi nhịp trận rồi dồn Burst/Finisher khi mục tiêu vào vùng kết liễu.' },
];
const LEADERBOARD_SHADOWS = [
  ['Vô Cực Chân Nhân', 1880], ['Thiên Kiếm Tử', 1710], ['Huyền Đan Quân', 1580], ['Thanh Liên Khách', 1470],
  ['Xích Tiêu Đạo Nhân', 1380], ['Bắc Minh Tán Tu', 1290], ['Ngự Linh Sư', 1200], ['Trường Sinh Khách', 1120],
  ['Phong Lôi Tử', 1040], ['Vân Mộng Tán Nhân', 960], ['Hàn Sơn Khách', 880],
];

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function round(value, digits = 4) { const m = 10 ** digits; return Math.round(value * m) / m; }
function stableHash(text) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}
function hashHex(text) { return stableHash(String(text)).toString(16).padStart(8, '0'); }
function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;
  return JSON.stringify(value);
}
function vnDayKey(now = Date.now()) {
  const d = new Date(now + 7 * 3600_000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}
function cloneEntity(entity) { return structuredClone(entity); }
function normalizeEntityIdentity(entity, id, name) { return { ...entity, id, name }; }
function seasonId(number) { return `dao-phap-s${Math.max(1, Math.floor(Number(number) || 1))}-local`; }
function entityFingerprint(entity) { return entity ? hashHex(canonical(entity)) : '00000000'; }
function historyFingerprint(pvp) {
  const rows = (pvp?.history ?? []).slice(0, PVP_V91_HISTORY_CAP).map(x => ({ fightId: x.fightId, result: x.result, ratingBefore: x.ratingBefore, ratingAfter: x.ratingAfter, ratingDelta: x.ratingDelta, rewardBoundJade: x.rewardBoundJade ?? 0, ticketId: x.ticketId ?? '', seed: x.replay?.seed ?? 0 }));
  return hashHex(canonical(rows));
}
function integrityState(pvp) {
  return {
    rating: Math.round(Number(pvp?.rating ?? PVP_V91_INITIAL_RATING)), fightSeq: Math.max(0, Math.floor(Number(pvp?.fightSeq ?? 0))),
    seasonNumber: Math.max(1, Math.floor(Number(pvp?.seasonNumber ?? 1))), tacticalPresetId: pvp?.tacticalPresetId ?? 'balanced',
    anchor: entityFingerprint(pvp?.anchorEntity), defense: entityFingerprint(pvp?.defenseSnapshot?.entity), history: historyFingerprint(pvp),
  };
}
function integrityEventHash(prevHash, event) {
  const core = { seq: event.seq, type: event.type, atUnixMs: event.atUnixMs, payload: event.payload, state: event.state };
  return hashHex(`${prevHash}|${canonical(core)}`);
}
function ensureIntegrityForWrite(pvp, now = Date.now()) {
  if (pvp.integrityV94?.events) return pvp.integrityV94;
  const baseHash = hashHex(`pvp-v94|${pvp.joinedAtUnixMs ?? now}|${pvp.seasonId ?? PVP_V91_SEASON_ID}|${entityFingerprint(pvp.anchorEntity)}`);
  pvp.integrityV94 = { schema: 'pvp-integrity.v94', baseHash, lastHash: baseHash, nextSeq: 1, events: [] };
  appendIntegrityEvent(pvp, 'migration-or-join', { from: pvp.schema ?? PVP_V91_SCHEMA }, now);
  return pvp.integrityV94;
}
function appendIntegrityEvent(pvp, type, payload = {}, now = Date.now()) {
  const integrity = pvp.integrityV94;
  if (!integrity?.events) throw new Error('PvP integrity chưa khởi tạo.');
  const prevHash = integrity.lastHash || integrity.baseHash;
  const event = { seq: Math.max(1, Math.floor(Number(integrity.nextSeq ?? 1))), type, atUnixMs: now, payload: structuredClone(payload), state: integrityState(pvp), prevHash };
  event.hash = integrityEventHash(prevHash, event);
  integrity.events.push(event);
  integrity.lastHash = event.hash;
  integrity.nextSeq = event.seq + 1;
  if (integrity.events.length > PVP_V94_INTEGRITY_EVENT_CAP) {
    const removeCount = integrity.events.length - PVP_V94_INTEGRITY_EVENT_CAP;
    const removed = integrity.events.splice(0, removeCount);
    integrity.baseHash = removed[removed.length - 1].hash;
  }
  return event;
}

export function verifyPvpIntegrityV94(stateOrPvp) {
  const pvp = stateOrPvp?.pvpV91 ?? stateOrPvp;
  const integrity = pvp?.integrityV94;
  if (!pvp?.joinedAtUnixMs) return { ok: true, joined: false, legacy: false, events: 0 };
  if (!integrity?.events) return { ok: true, joined: true, legacy: true, events: 0 };
  let prev = integrity.baseHash;
  for (const event of integrity.events) {
    if (event.prevHash !== prev) return { ok: false, reason: `prev-hash mismatch at ${event.seq}`, events: integrity.events.length };
    const expected = integrityEventHash(prev, event);
    if (event.hash !== expected) return { ok: false, reason: `event-hash mismatch at ${event.seq}`, events: integrity.events.length };
    prev = event.hash;
  }
  if (integrity.lastHash !== prev) return { ok: false, reason: 'last-hash mismatch', events: integrity.events.length };
  const latest = integrity.events[integrity.events.length - 1];
  if (latest && canonical(latest.state) !== canonical(integrityState(pvp))) return { ok: false, reason: 'state fingerprint mismatch', events: integrity.events.length };
  return { ok: true, joined: true, legacy: false, events: integrity.events.length, lastHash: integrity.lastHash };
}
function assertPvpIntegrityForWrite(pvp) {
  const result = verifyPvpIntegrityV94(pvp);
  if (!result.ok) throw new Error(`PvP Integrity V94 không hợp lệ (${result.reason}). Hành động ghi đã bị chặn.`);
  return result;
}
function migratePvpForWrite(pvp, currentEntity, now) {
  pvp.schema ??= PVP_V91_SCHEMA;
  pvp.seasonNumber = Math.max(1, Math.floor(Number(pvp.seasonNumber ?? 1)));
  pvp.seasonId ??= seasonId(pvp.seasonNumber);
  pvp.seasonStartAtUnixMs ??= pvp.joinedAtUnixMs ?? now;
  pvp.seasonEndAtUnixMs ??= pvp.seasonStartAtUnixMs + PVP_V92_SEASON_MS;
  pvp.seasonHistory ??= [];
  pvp.tacticalPresetId = TACTICAL_PRESETS.some(x => x.id === pvp.tacticalPresetId) ? pvp.tacticalPresetId : 'balanced';
  pvp.matchmakingNonce = Math.max(0, Math.floor(Number(pvp.matchmakingNonce ?? pvp.fightSeq ?? 0)));
  pvp.bandSpamV94 ??= { band: null, streak: 0 };
  pvp.seasonFightCount = Math.max(0, Math.floor(Number(pvp.seasonFightCount ?? pvp.fightSeq ?? 0)));
  if (pvp.defenseSnapshot) pvp.defenseSnapshot.tacticalPresetId ??= 'balanced';
  if (!pvp.anchorEntity && currentEntity) pvp.anchorEntity = normalizeEntityIdentity(cloneEntity(currentEntity), 'pvp.anchor.player', currentEntity?.name ?? 'Tu Sĩ');
  ensureIntegrityForWrite(pvp, now);
  return pvp;
}
function requireSeasonActive(pvp, now) {
  if (now >= Number(pvp.seasonEndAtUnixMs ?? Infinity)) throw new Error('Mùa Đấu Pháp đã kết thúc. Hãy chốt mùa để nhận thưởng và soft reset rating.');
}

export function pvpRankV91(rating = PVP_V91_INITIAL_RATING) {
  const value = Math.max(0, Math.round(Number(rating) || PVP_V91_INITIAL_RATING));
  return { ...RANKS.find(rank => value >= rank.min), rating: value };
}
export function pvpSeasonRewardV92(rating = PVP_V91_INITIAL_RATING) {
  const rank = pvpRankV91(rating);
  return { rank, boundJade: SEASON_REWARD_BY_RANK[rank.id] ?? 0 };
}
export function pvpSoftResetRatingV92(rating = PVP_V91_INITIAL_RATING) {
  return clamp(Math.round(PVP_V91_INITIAL_RATING + (Number(rating) - PVP_V91_INITIAL_RATING) * 0.35), 800, 1500);
}
export function pvpTacticalPresetsV93() { return TACTICAL_PRESETS.map(x => ({ ...x })); }

export function pvpOpponentScaleV91(bandId, rating = PVP_V91_INITIAL_RATING) {
  const band = BANDS.find(x => x.id === bandId) ?? BANDS[1];
  const delta = Number(rating) - PVP_V91_INITIAL_RATING;
  return round(clamp(band.baseScale + delta * band.slopePerRating, 0.78, 1.60), 4);
}
export function scalePvpEntityV91(anchorEntity, scale, id, name) {
  const entity = cloneEntity(anchorEntity);
  const linear = Math.max(0.1, Number(scale) || 1);
  const sqrt = Math.sqrt(linear);
  const stats = entity.stats ?? (entity.stats = {});
  for (const key of SCALE_LINEAR_KEYS) if (Number.isFinite(Number(stats[key]))) stats[key] = Math.max(1, Number(stats[key]) * linear);
  for (const key of SCALE_SQRT_KEYS) if (Number.isFinite(Number(stats[key]))) stats[key] = Math.max(0.01, Number(stats[key]) * sqrt);
  if (Number.isFinite(Number(stats.spiritStandard))) stats.spiritStandard = Math.max(0.01, Number(stats.spiritStandard) * sqrt);
  return normalizeEntityIdentity(entity, id, name);
}

function skillMeta(registry, skillId) {
  try {
    const s = registry.skill(skillId);
    const tags = new Set(s.tags ?? []);
    const effects = s.effects ?? [];
    return {
      tags, isBasic: tags.has('Basic') || skillId.includes('basic'), isSetup: tags.has('Setup'), isBurst: tags.has('Burst') || tags.has('Finisher'),
      isDefensive: tags.has('Shield') || tags.has('Heal') || tags.has('Defense') || effects.some(e => e.type === 'shield' || (e.type === 'heal' && (e.target ?? 'self') === 'self')),
      isDamage: effects.some(e => ['damage', 'damageOverTime', 'drain', 'consumeMarkDamage'].includes(e.type)),
      cost: Math.max(0, Number(s.spiritCost ?? 0) || 0),
    };
  } catch { return { tags: new Set(), isBasic: skillId.includes('basic'), isSetup: false, isBurst: false, isDefensive: false, isDamage: true, cost: 0 }; }
}
function withTargetHpGate(conditions, pct) {
  const out = conditions.map(c => ({ ...c }));
  const idx = out.findIndex(c => c.type === 'targetHpBelow');
  if (idx >= 0) out[idx] = { type: 'targetHpBelow', pct };
  else if (out.length < 2) out.push({ type: 'targetHpBelow', pct });
  return out;
}
export function applyPvpTacticalPresetV93(entity, presetId, registry) {
  const preset = TACTICAL_PRESETS.find(x => x.id === presetId) ?? TACTICAL_PRESETS[0];
  const out = cloneEntity(entity);
  const baseRules = out.aiProfile?.rules ?? [];
  const costs = baseRules.map(r => skillMeta(registry, r.skillId).cost).filter(x => x > 0).sort((a, b) => a - b);
  const medianCost = costs.length ? costs[Math.floor(costs.length / 2)] : 0;
  const rules = baseRules.map(rule => {
    const meta = skillMeta(registry, rule.skillId);
    let priority = Number(rule.priority ?? 0);
    let conditions = (rule.conditions ?? []).map(c => ({ ...c }));
    if (preset.id === 'tempo') {
      if (meta.isDamage && !meta.isBasic) priority += meta.isBurst ? 34 : 20;
      if (meta.isSetup) priority -= 6;
    } else if (preset.id === 'stack') {
      if (meta.isSetup) priority += 42;
      if (meta.isBurst && meta.isDamage) { priority += 18; conditions = withTargetHpGate(conditions, 55); }
      if (meta.isBasic) priority += 6;
    } else if (preset.id === 'reserve') {
      if (meta.isBasic || meta.cost <= medianCost * 0.60) priority += 30;
      if (meta.isDamage && !meta.isDefensive && meta.cost > Math.max(1, medianCost)) { priority -= 12; conditions = withTargetHpGate(conditions, 45); }
    } else if (preset.id === 'execute') {
      if (meta.isSetup) priority += 18;
      if (meta.isBurst && meta.isDamage) { priority += 54; conditions = withTargetHpGate(conditions, 35); }
      else if (meta.isDamage && !meta.isBasic) priority += 8;
    }
    return { ...rule, priority, conditions: conditions.slice(0, 2) };
  });
  out.aiProfile = { name: `${out.aiProfile?.name ?? 'AI'} · PvP ${preset.name}`, rules };
  out.pvpTacticalV93 = { presetId: preset.id, presetName: preset.name, rulesFingerprint: hashHex(canonical(rules)) };
  return out;
}

function rewardStatusReadOnly(state, now = Date.now()) {
  const economyHost = state?.collectionV12316 ?? state;
  const daily = economyHost?.economyV89?.daily;
  const current = daily?.key === vnDayKey(now) ? daily : undefined;
  const wins = Math.max(0, Math.floor(Number(current?.pvpWins ?? 0)));
  const paidWins = Math.max(0, Math.min(5, Math.floor(Number(current?.pvpPaidWins ?? 0))));
  return { winsToday: wins, paidWinsToday: paidWins, paidWinCap: 5, rewardPerPaidWin: 8, remainingPaidWins: Math.max(0, 5 - paidWins) };
}
function ticketFor(pvp, band) {
  const rating = Math.max(0, Math.round(Number(pvp.rating ?? PVP_V91_INITIAL_RATING)));
  const nonce = Math.max(0, Math.floor(Number(pvp.matchmakingNonce ?? pvp.fightSeq ?? 0)));
  const seed = stableHash(`${pvp.seasonId}|ticket|${nonce}|${band.id}|${rating}`);
  const id = `pvp.ticket.${pvp.seasonNumber ?? 1}.${nonce}.${band.id}.${hashHex(seed)}`;
  return { id, seed, nonce, issuedForRating: rating };
}
function buildOpponents(pvp) {
  if (!pvp?.anchorEntity) return [];
  const rating = Number(pvp.rating ?? PVP_V91_INITIAL_RATING);
  return BANDS.map(band => {
    const opponentRating = Math.max(100, Math.round(rating + band.ratingOffset));
    const scale = pvpOpponentScaleV91(band.id, rating);
    const ticket = ticketFor(pvp, band);
    return {
      id: ticket.id, ticketId: ticket.id, ticketSeed: ticket.seed, ticketNonce: ticket.nonce, issuedForRating: ticket.issuedForRating,
      band: band.id, label: band.label, name: band.name, sourceType: 'local-shadow', remotePlayerId: null,
      providerContract: PVP_V91_PROVIDER_CONTRACT, rating: opponentRating, rank: pvpRankV91(opponentRating), scale,
      entity: scalePvpEntityV91(pvp.anchorEntity, scale, `pvp.shadow.${band.id}.${ticket.nonce}`, band.name),
    };
  });
}
function publicOpponent(opponent) { const { entity, ...safe } = opponent; return safe; }
function publicHistory(entry) {
  return {
    fightId: entry.fightId, atUnixMs: entry.atUnixMs, opponentId: entry.opponentId, opponentName: entry.opponentName,
    opponentBand: entry.opponentBand, result: entry.result, ratingBefore: entry.ratingBefore, ratingAfter: entry.ratingAfter,
    ratingDelta: entry.ratingDelta, baseRatingDelta: entry.baseRatingDelta ?? entry.ratingDelta, ratingFactor: entry.ratingFactor ?? 1,
    sameBandStreak: entry.sameBandStreak ?? 1, rewardBoundJade: entry.rewardBoundJade ?? 0, duration: entry.duration,
    ticketId: entry.ticketId, seed: entry.replay?.seed, replayable: Boolean(entry.replay?.playerEntity && entry.replay?.opponentEntity),
  };
}
function leaderboardV92(pvp) {
  const s = Math.max(1, Number(pvp?.seasonNumber ?? 1));
  const shadowRows = LEADERBOARD_SHADOWS.map(([name, base], i) => {
    const jitter = (stableHash(`${s}|${name}`) % 41) - 20;
    const rating = base + jitter;
    return { id: `shadow.${i}`, name, rating, rank: pvpRankV91(rating), isPlayer: false };
  });
  const player = { id: 'player', name: pvp?.anchorEntity?.name ?? 'Tu Sĩ', rating: Math.round(Number(pvp?.rating ?? PVP_V91_INITIAL_RATING)), rank: pvpRankV91(pvp?.rating), isPlayer: true };
  const all = [...shadowRows, player].sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name)).map((x, i) => ({ ...x, position: i + 1 }));
  const self = all.find(x => x.isPlayer);
  const top = all.slice(0, 10);
  return { schema: 'pvp-leaderboard.v92', provider: 'local-shadow', rows: top, self, population: all.length, selfAlwaysVisible: true };
}
function seasonViewV92(pvp, now) {
  if (!pvp?.joinedAtUnixMs) return { durationDays: PVP_V92_SEASON_DAYS, number: 1, id: PVP_V91_SEASON_ID, startedAtUnixMs: null, endsAtUnixMs: null, remainingMs: null, expired: false, rewardPreview: pvpSeasonRewardV92(PVP_V91_INITIAL_RATING), softResetPreview: PVP_V91_INITIAL_RATING };
  const start = Number(pvp.seasonStartAtUnixMs ?? pvp.joinedAtUnixMs);
  const end = Number(pvp.seasonEndAtUnixMs ?? (start + PVP_V92_SEASON_MS));
  const rating = Math.round(Number(pvp.rating ?? PVP_V91_INITIAL_RATING));
  return {
    durationDays: PVP_V92_SEASON_DAYS, number: Math.max(1, Number(pvp.seasonNumber ?? 1)), id: pvp.seasonId ?? PVP_V91_SEASON_ID,
    startedAtUnixMs: start, endsAtUnixMs: end, remainingMs: Math.max(0, end - now), expired: now >= end,
    rewardPreview: pvpSeasonRewardV92(rating), softResetPreview: pvpSoftResetRatingV92(rating), history: (pvp.seasonHistory ?? []).slice(0, 8).map(x => ({ ...x })),
  };
}

export function pvpViewV91(state, now = Date.now()) {
  const realmOrder = Number(state?.realm?.maxRealmOrder ?? 0);
  const unlocked = realmOrder >= PVP_V91_MIN_REALM_ORDER;
  const pvp = state?.pvpV91;
  const rating = Math.max(0, Math.round(Number(pvp?.rating ?? PVP_V91_INITIAL_RATING)));
  const reward = rewardStatusReadOnly(state, now);
  const integrity = verifyPvpIntegrityV94(pvp);
  const tacticalId = TACTICAL_PRESETS.some(x => x.id === pvp?.tacticalPresetId) ? pvp.tacticalPresetId : 'balanced';
  const tactical = TACTICAL_PRESETS.find(x => x.id === tacticalId) ?? TACTICAL_PRESETS[0];
  if (!pvp?.joinedAtUnixMs) {
    return {
      schema: PVP_V91_SCHEMA, featureVersion: PVP_V94_FEATURE_VERSION, unlocked, unlockedAtRealmOrder: PVP_V91_MIN_REALM_ORDER, joined: false,
      mode: 'async-1v1', automation: 'full-auto-tactical', manualCast: false, safety: { realDeath: false, injury: false, lifespanLoss: false },
      provider: { type: 'local-shadow', contract: PVP_V91_PROVIDER_CONTRACT, remoteReady: true }, seasonId: PVP_V91_SEASON_ID,
      rating, rank: pvpRankV91(rating), record: { wins: 0, losses: 0, draws: 0 }, reward, opponents: [], history: [], defense: null,
      season: seasonViewV92(null, now), leaderboard: { schema: 'pvp-leaderboard.v92', provider: 'local-shadow', rows: [], self: null, population: 0, selfAlwaysVisible: true },
      tactical: { selected: { ...TACTICAL_PRESETS[0] }, presets: pvpTacticalPresetsV93() }, integrity,
    };
  }
  return {
    schema: PVP_V91_SCHEMA, featureVersion: PVP_V94_FEATURE_VERSION, unlocked, unlockedAtRealmOrder: PVP_V91_MIN_REALM_ORDER, joined: true,
    mode: 'async-1v1', automation: 'full-auto-tactical', manualCast: false, safety: { realDeath: false, injury: false, lifespanLoss: false },
    provider: { type: pvp.provider ?? 'local-shadow', contract: PVP_V91_PROVIDER_CONTRACT, remoteReady: true }, seasonId: pvp.seasonId ?? PVP_V91_SEASON_ID,
    joinedAtUnixMs: pvp.joinedAtUnixMs, rating, peakRating: Math.max(rating, Number(pvp.peakRating ?? rating)), rank: pvpRankV91(rating),
    record: { wins: Number(pvp.wins ?? 0), losses: Number(pvp.losses ?? 0), draws: Number(pvp.draws ?? 0) },
    anchor: { rating: Number(pvp.anchorRating ?? PVP_V91_INITIAL_RATING), createdAtUnixMs: pvp.anchorCreatedAtUnixMs ?? pvp.joinedAtUnixMs, immutableThisSeason: true },
    defense: pvp.defenseSnapshot ? { createdAtUnixMs: pvp.defenseSnapshot.createdAtUnixMs, ratingAtSet: pvp.defenseSnapshot.ratingAtSet, source: 'player-build-snapshot', tacticalPresetId: pvp.defenseSnapshot.tacticalPresetId ?? 'balanced', entityFingerprint: entityFingerprint(pvp.defenseSnapshot.entity) } : null,
    reward, season: seasonViewV92(pvp, now), leaderboard: leaderboardV92(pvp),
    tactical: { selected: { ...tactical }, presets: pvpTacticalPresetsV93(), defensePresetId: pvp.defenseSnapshot?.tacticalPresetId ?? 'balanced' },
    integrity, antiReroll: { deterministicTickets: true, currentNonce: Math.max(0, Math.floor(Number(pvp.matchmakingNonce ?? pvp.fightSeq ?? 0))), refreshChangesTickets: false, ticketConsumedOnFight: true },
    diminishing: { sameBandStreak: Math.max(0, Number(pvp.bandSpamV94?.streak ?? 0)), band: pvp.bandSpamV94?.band ?? null, factors: [...DIMINISHING_FACTORS], floorFactor: DIMINISHING_FACTORS[DIMINISHING_FACTORS.length - 1] },
    opponents: buildOpponents(pvp).map(publicOpponent), history: (pvp.history ?? []).slice(0, PVP_V91_HISTORY_CAP).map(publicHistory),
  };
}

export function joinPvpV91(state, currentEntity, now = Date.now()) {
  const realmOrder = Number(state?.realm?.maxRealmOrder ?? 0);
  if (realmOrder < PVP_V91_MIN_REALM_ORDER) throw new Error('Đấu Pháp mở tại Kim Đan.');
  if (state.pvpV91?.joinedAtUnixMs) return { joined: false, alreadyJoined: true, view: pvpViewV91(state, now) };
  const anchor = normalizeEntityIdentity(cloneEntity(currentEntity), 'pvp.anchor.player', currentEntity?.name ?? 'Tu Sĩ');
  state.pvpV91 = {
    schema: PVP_V91_SCHEMA, seasonId: PVP_V91_SEASON_ID, seasonNumber: 1, seasonStartAtUnixMs: now, seasonEndAtUnixMs: now + PVP_V92_SEASON_MS, seasonHistory: [],
    provider: 'local-shadow', joinedAtUnixMs: now, rating: PVP_V91_INITIAL_RATING, peakRating: PVP_V91_INITIAL_RATING, wins: 0, losses: 0, draws: 0,
    fightSeq: 0, seasonFightCount: 0, matchmakingNonce: 0, tacticalPresetId: 'balanced', bandSpamV94: { band: null, streak: 0 },
    anchorRating: PVP_V91_INITIAL_RATING, anchorCreatedAtUnixMs: now, anchorEntity: anchor,
    defenseSnapshot: { createdAtUnixMs: now, ratingAtSet: PVP_V91_INITIAL_RATING, tacticalPresetId: 'balanced', entity: normalizeEntityIdentity(cloneEntity(currentEntity), 'pvp.defense.player', currentEntity?.name ?? 'Tu Sĩ') },
    history: [],
  };
  ensureIntegrityForWrite(state.pvpV91, now);
  return { joined: true, alreadyJoined: false, view: pvpViewV91(state, now) };
}

export function setPvpTacticalV94(state, presetId, now = Date.now()) {
  const pvp = state?.pvpV91;
  if (!pvp?.joinedAtUnixMs) throw new Error('Hãy Lập Trận Đấu Pháp trước.');
  migratePvpForWrite(pvp, null, now); assertPvpIntegrityForWrite(pvp); requireSeasonActive(pvp, now);
  const preset = TACTICAL_PRESETS.find(x => x.id === presetId);
  if (!preset) throw new Error('Preset chiến thuật Đấu Pháp không tồn tại.');
  const before = pvp.tacticalPresetId;
  pvp.tacticalPresetId = preset.id;
  appendIntegrityEvent(pvp, 'tactical-change', { before, after: preset.id }, now);
  return { changed: before !== preset.id, selected: { ...preset }, view: pvpViewV91(state, now) };
}

export function refreshPvpDefenseV91(state, currentEntity, registryOrNow, maybeNow) {
  const registry = typeof registryOrNow === 'number' || registryOrNow == null ? null : registryOrNow;
  const now = typeof registryOrNow === 'number' ? registryOrNow : (maybeNow ?? Date.now());
  const pvp = state?.pvpV91;
  if (!pvp?.joinedAtUnixMs) throw new Error('Hãy Lập Trận Đấu Pháp trước.');
  migratePvpForWrite(pvp, currentEntity, now); assertPvpIntegrityForWrite(pvp); requireSeasonActive(pvp, now);
  const entity = registry ? applyPvpTacticalPresetV93(currentEntity, pvp.tacticalPresetId, registry) : cloneEntity(currentEntity);
  pvp.defenseSnapshot = { createdAtUnixMs: now, ratingAtSet: pvp.rating, tacticalPresetId: pvp.tacticalPresetId, entity: normalizeEntityIdentity(entity, 'pvp.defense.player', currentEntity?.name ?? 'Tu Sĩ') };
  appendIntegrityEvent(pvp, 'defense-snapshot', { tacticalPresetId: pvp.tacticalPresetId, ratingAtSet: pvp.rating, entityFingerprint: entityFingerprint(pvp.defenseSnapshot.entity) }, now);
  return { refreshed: true, defense: pvpViewV91(state, now).defense };
}

function eloDelta(rating, opponentRating, score) {
  const expected = 1 / (1 + 10 ** ((opponentRating - rating) / 400));
  const raw = Math.round(32 * (score - expected));
  if (score === 1) return Math.max(1, raw);
  if (score === 0) return Math.min(-1, raw);
  return raw;
}
function diminishedDelta(baseDelta, streak) {
  const factor = DIMINISHING_FACTORS[Math.min(DIMINISHING_FACTORS.length - 1, Math.max(0, streak - 1))];
  if (!baseDelta) return { delta: 0, factor };
  const sign = Math.sign(baseDelta);
  return { delta: sign * Math.max(1, Math.round(Math.abs(baseDelta) * factor)), factor };
}

export function challengePvpV91(state, currentEntity, registry, opponentId, now = Date.now()) {
  const pvp = state?.pvpV91;
  if (!pvp?.joinedAtUnixMs) throw new Error('Hãy Lập Trận Đấu Pháp trước.');
  migratePvpForWrite(pvp, currentEntity, now); assertPvpIntegrityForWrite(pvp); requireSeasonActive(pvp, now);
  const opponent = buildOpponents(pvp).find(x => x.id === opponentId);
  if (!opponent) throw new Error('Vé đối thủ Đấu Pháp đã được tiêu thụ hoặc không còn hợp lệ. Hãy dùng danh sách hiện tại.');
  const seq = Math.max(0, Math.floor(Number(pvp.fightSeq ?? 0))) + 1;
  const playerId = `pvp.player.${seq}`;
  const opponentEntity = normalizeEntityIdentity(cloneEntity(opponent.entity), `pvp.opponent.${seq}`, opponent.name);
  const tacticalEntity = applyPvpTacticalPresetV93(currentEntity, pvp.tacticalPresetId, registry);
  const playerEntity = normalizeEntityIdentity(tacticalEntity, playerId, currentEntity?.name ?? 'Tu Sĩ');
  const seed = opponent.ticketSeed;
  const encounter = compileCombatEncounterV1({
    encounterId: `pvp.${seq}.${seed}`,
    activity: 'pvp',
    seed,
    entities: [playerEntity, opponentEntity],
    mode: 'offline',
    maxDuration: 120,
    applyPacing: false,
    metadata: { opponentId: opponent.id, ticketId: opponent.ticketId },
  });
  const kernel = runCompiledCombatEncounterV3(encounter, registry);
  const battle = kernel.battle;
  const won = !battle.draw && battle.winnerId === playerId;
  const lost = !battle.draw && battle.loserId === playerId;
  const score = battle.draw ? 0.5 : won ? 1 : 0;
  const ratingBefore = Math.max(0, Math.round(Number(pvp.rating ?? PVP_V91_INITIAL_RATING)));
  const previousBand = pvp.bandSpamV94?.band ?? null;
  const streak = previousBand === opponent.band ? Math.max(1, Number(pvp.bandSpamV94?.streak ?? 0) + 1) : 1;
  const baseRatingDelta = eloDelta(ratingBefore, opponent.rating, score);
  const diminished = diminishedDelta(baseRatingDelta, streak);
  const ratingDelta = diminished.delta;
  const ratingAfter = Math.max(0, ratingBefore + ratingDelta);
  pvp.fightSeq = seq; pvp.seasonFightCount = Math.max(0, Number(pvp.seasonFightCount ?? 0)) + 1; pvp.matchmakingNonce = Math.max(0, Number(pvp.matchmakingNonce ?? 0)) + 1;
  pvp.bandSpamV94 = { band: opponent.band, streak };
  pvp.rating = ratingAfter; pvp.peakRating = Math.max(Number(pvp.peakRating ?? ratingBefore), ratingAfter);
  if (won) pvp.wins = Number(pvp.wins ?? 0) + 1; else if (lost) pvp.losses = Number(pvp.losses ?? 0) + 1; else pvp.draws = Number(pvp.draws ?? 0) + 1;
  const fightId = `pvp.v91.${pvp.joinedAtUnixMs}.${seq}`;
  const entry = {
    fightId, atUnixMs: now, opponentId: opponent.id, ticketId: opponent.ticketId, opponentName: opponent.name, opponentBand: opponent.band,
    result: won ? 'win' : lost ? 'loss' : 'draw', ratingBefore, ratingAfter, ratingDelta, baseRatingDelta, ratingFactor: diminished.factor, sameBandStreak: streak, rewardBoundJade: 0,
    tacticalPresetId: pvp.tacticalPresetId, duration: Number(battle.duration ?? 0),
    replay: { engineVersion: 'combat.v3', seed, ticketId: opponent.ticketId, maxDuration: 120, playerEntity: cloneEntity(playerEntity), opponentEntity: cloneEntity(opponentEntity), winnerId: battle.winnerId, loserId: battle.loserId, draw: Boolean(battle.draw) },
  };
  pvp.history = [entry, ...(pvp.history ?? [])].slice(0, PVP_V91_HISTORY_CAP);
  appendIntegrityEvent(pvp, 'match', { fightId, ticketId: opponent.ticketId, seed, band: opponent.band, result: entry.result, ratingBefore, ratingAfter, ratingDelta, baseRatingDelta, ratingFactor: diminished.factor, sameBandStreak: streak, tacticalPresetId: pvp.tacticalPresetId }, now);
  return { schema: 'pvp-match-result.v94', fightId, won, lost, draw: Boolean(battle.draw), result: entry.result, ratingBefore, ratingAfter, ratingDelta, baseRatingDelta, ratingFactor: diminished.factor, sameBandStreak: streak, tacticalPresetId: pvp.tacticalPresetId, ticketId: opponent.ticketId, seed, opponent: publicOpponent(opponent), battle, combatResult: kernel.combatResult, rewardBoundJade: 0 };
}

export function attachPvpRewardV91(state, fightId, rewardBoundJade) {
  const entry = state?.pvpV91?.history?.find(x => x.fightId === fightId);
  if (entry) entry.rewardBoundJade = Math.max(0, Math.floor(Number(rewardBoundJade) || 0));
  return entry ? publicHistory(entry) : undefined;
}
export function recordPvpRewardIntegrityV94(state, fightId, rewardBoundJade, now = Date.now()) {
  const pvp = state?.pvpV91;
  if (!pvp?.joinedAtUnixMs || !pvp.integrityV94) return null;
  assertPvpIntegrityForWrite(pvp);
  const entry = pvp.history?.find(x => x.fightId === fightId);
  if (!entry) throw new Error('Không tìm thấy chiến báo để khóa reward integrity.');
  entry.rewardBoundJade = Math.max(0, Math.floor(Number(rewardBoundJade) || 0));
  appendIntegrityEvent(pvp, 'reward', { fightId, rewardBoundJade: entry.rewardBoundJade }, now);
  return verifyPvpIntegrityV94(pvp);
}

export function settlePvpSeasonV94(state, currentEntity, registry, now = Date.now()) {
  const pvp = state?.pvpV91;
  if (!pvp?.joinedAtUnixMs) throw new Error('Hãy Lập Trận Đấu Pháp trước.');
  migratePvpForWrite(pvp, currentEntity, now); assertPvpIntegrityForWrite(pvp);
  if (now < Number(pvp.seasonEndAtUnixMs ?? Infinity)) throw new Error('Mùa Đấu Pháp hiện tại chưa kết thúc.');
  const oldSeasonId = pvp.seasonId;
  const endingRating = Math.round(Number(pvp.rating ?? PVP_V91_INITIAL_RATING));
  const endingPeak = Math.round(Number(pvp.peakRating ?? endingRating));
  const reward = pvpSeasonRewardV92(endingRating);
  const nextRating = pvpSoftResetRatingV92(endingRating);
  const summary = { seasonId: oldSeasonId, seasonNumber: pvp.seasonNumber, endedAtUnixMs: now, rating: endingRating, peakRating: endingPeak, rank: reward.rank, rewardBoundJade: reward.boundJade, wins: Number(pvp.wins ?? 0), losses: Number(pvp.losses ?? 0), draws: Number(pvp.draws ?? 0), nextRating };
  pvp.seasonHistory = [summary, ...(pvp.seasonHistory ?? [])].slice(0, 8);
  pvp.seasonNumber = Math.max(1, Number(pvp.seasonNumber ?? 1)) + 1; pvp.seasonId = seasonId(pvp.seasonNumber);
  pvp.seasonStartAtUnixMs = now; pvp.seasonEndAtUnixMs = now + PVP_V92_SEASON_MS; pvp.seasonFightCount = 0;
  pvp.rating = nextRating; pvp.peakRating = nextRating; pvp.wins = 0; pvp.losses = 0; pvp.draws = 0; pvp.matchmakingNonce = 0; pvp.bandSpamV94 = { band: null, streak: 0 };
  const anchor = normalizeEntityIdentity(cloneEntity(currentEntity), 'pvp.anchor.player', currentEntity?.name ?? 'Tu Sĩ');
  pvp.anchorRating = nextRating; pvp.anchorCreatedAtUnixMs = now; pvp.anchorEntity = anchor;
  const defenseEntity = applyPvpTacticalPresetV93(currentEntity, pvp.tacticalPresetId, registry);
  pvp.defenseSnapshot = { createdAtUnixMs: now, ratingAtSet: nextRating, tacticalPresetId: pvp.tacticalPresetId, entity: normalizeEntityIdentity(defenseEntity, 'pvp.defense.player', currentEntity?.name ?? 'Tu Sĩ') };
  appendIntegrityEvent(pvp, 'season-settle', { oldSeasonId, endingRating, endingPeak, endingRankId: reward.rank.id, rewardBoundJade: reward.boundJade, nextSeasonId: pvp.seasonId, nextRating }, now);
  return { schema: 'pvp-season-settlement.v94', settled: true, summary, reward: { ...reward }, nextSeason: seasonViewV92(pvp, now), view: pvpViewV91(state, now) };
}
export function recordPvpSeasonRewardIntegrityV94(state, oldSeasonId, rewardBoundJade, now = Date.now()) {
  const pvp = state?.pvpV91;
  if (!pvp?.integrityV94) return null;
  assertPvpIntegrityForWrite(pvp);
  appendIntegrityEvent(pvp, 'season-reward', { seasonId: oldSeasonId, rewardBoundJade: Math.max(0, Math.floor(Number(rewardBoundJade) || 0)) }, now);
  return verifyPvpIntegrityV94(pvp);
}

export function replayPvpV91(state, registry, fightId) {
  const pvp = state?.pvpV91;
  const integrity = verifyPvpIntegrityV94(pvp);
  if (!integrity.ok) throw new Error(`PvP Integrity V94 không hợp lệ (${integrity.reason}). Replay bị chặn.`);
  const entry = pvp?.history?.find(x => x.fightId === fightId);
  if (!entry?.replay) throw new Error('Không tìm thấy chiến báo/replay Đấu Pháp.');
  const replay = entry.replay;
  const encounter = compileCombatEncounterV1({
    encounterId: `pvp.replay.${fightId}`,
    activity: 'pvp-replay',
    seed: replay.seed,
    entities: [cloneEntity(replay.playerEntity), cloneEntity(replay.opponentEntity)],
    mode: 'offline',
    maxDuration: replay.maxDuration ?? 120,
    applyPacing: false,
    metadata: { fightId, ticketId: replay.ticketId, engineVersion: replay.engineVersion ?? 'combat.v2' },
  });
  const engineVersion = replay.engineVersion ?? 'combat.v2';
  const kernel = engineVersion === 'combat.v3'
    ? runCompiledCombatEncounterV3(encounter, registry)
    : runCompiledCombatEncounterV2(encounter, registry);
  const verified = Boolean(kernel.battle.draw) === Boolean(replay.draw) && kernel.battle.winnerId === replay.winnerId && kernel.battle.loserId === replay.loserId;
  return { schema: 'pvp-replay.v94', fightId, verified, source: engineVersion === 'combat.v3' ? 'CombatKernelV3' : 'CombatKernelV2', engineVersion, ticketId: replay.ticketId, seed: replay.seed, integrity, battle: kernel.battle, combatResult: kernel.combatResult };
}
