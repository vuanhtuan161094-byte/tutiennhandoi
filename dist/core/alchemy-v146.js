import { majorRealmNameForIndex, huntMajorRealmPowerScaleV142 } from '../content/realm-maps.js';
import { PILL_QUALITY_MULTIPLIER } from './recovery.js';

export const ALCHEMY_V146_SCHEMA = 'alchemy.v146';
export const ALCHEMY_V146_MAJOR_REALM_COUNT = 28;
export const ALCHEMY_V146_PERMANENT_PILL_CAP_PER_FAMILY_MAJOR_LIFE = 3;
export const ALCHEMY_V146_CULTIVATION_PILL_CAP_PER_MAJOR_REALM = 10;

export const ALCHEMY_V146_QUALITY_NAMES = Object.freeze({
  low: 'Hạ phẩm',
  mid: 'Trung phẩm',
  high: 'Thượng phẩm',
  supreme: 'Cực phẩm',
});

// V146 deliberately keeps the ingredient language tiny: cỏ trồng, Yêu Đan săn.
export const ALCHEMY_V146_INGREDIENT_FAMILIES = Object.freeze(['herb', 'demonCore']);

export const ALCHEMY_V146_FAMILIES = Object.freeze({
  cultivation: Object.freeze({ name: 'Tu Vi Đan', role: 'cultivation', permanent: false, herb: 5, demonCore: 0 }),
  injury: Object.freeze({ name: 'Trị Thương Đan', role: 'recovery', permanent: false, herb: 5, demonCore: 1 }),
  lifePower: Object.freeze({ name: 'Công Lực Đan', role: 'permanentAttack', permanent: true, herb: 5, demonCore: 1 }),
  lifeBody: Object.freeze({ name: 'Khí Huyết Đan', role: 'permanentHp', permanent: true, herb: 6, demonCore: 1 }),
  lifeDefense: Object.freeze({ name: 'Hộ Thể Đan', role: 'permanentDefense', permanent: true, herb: 5, demonCore: 2 }),
  buffPower: Object.freeze({ name: 'Chiến Ý Đan', role: 'combatAttack', permanent: false, herb: 6, demonCore: 2 }),
  buffGuard: Object.freeze({ name: 'Kim Cương Đan', role: 'combatGuard', permanent: false, herb: 7, demonCore: 2 }),
  buffSpirit: Object.freeze({ name: 'Tụ Nguyên Đan', role: 'combatSpirit', permanent: false, herb: 7, demonCore: 3 }),
  forbidden: Object.freeze({ name: 'Bạo Huyết Cấm Đan', role: 'forbiddenCombat', permanent: false, herb: 15, demonCore: 6 }),
  lifespan: Object.freeze({ name: 'Thọ Nguyên Đan', role: 'lifespan', permanent: false, herb: 15, demonCore: 5 }),
  daoSuy: Object.freeze({ name: 'Tĩnh Suy Đan', role: 'daoSuy', permanent: false, herb: 12, demonCore: 4 }),
});

export const ALCHEMY_V146_LIVE_FAMILY_IDS = Object.freeze(Object.keys(ALCHEMY_V146_FAMILIES));
export const ALCHEMY_V146_PERMANENT_FAMILY_IDS = Object.freeze(['lifePower', 'lifeBody', 'lifeDefense']);
export const ALCHEMY_V146_RETIRED_FAMILY_IDS = Object.freeze(['daoPower', 'daoBody', 'daoDefense']);

const clampMajor = (value, allowMortal = false) => {
  const floor = Math.floor(Number(value) || 0);
  return Math.max(allowMortal ? 0 : 1, Math.min(ALCHEMY_V146_MAJOR_REALM_COUNT, floor));
};

export function alchemyHerbResourceIdV146(majorRealmIndex = 0) {
  return `resource.alchemy.v146.herb.realm.${clampMajor(majorRealmIndex, true)}`;
}

export function alchemyDemonCoreResourceIdV146(majorRealmIndex) {
  const major = Math.floor(Number(majorRealmIndex) || 0);
  if (major < 1 || major > ALCHEMY_V146_MAJOR_REALM_COUNT)
    throw new Error('Yêu Đan V146 chỉ tồn tại cho 28 đại cảnh Săn Yêu, từ Luyện Khí trở lên.');
  return `resource.alchemy.v146.demon_core.realm.${major}`;
}

export function alchemyIngredientNameV146(resourceId) {
  const herb = /^resource\.alchemy\.v146\.herb\.realm\.(\d+)$/.exec(String(resourceId));
  if (herb) {
    const major = clampMajor(Number(herb[1]), true);
    return major === 0 ? 'Linh Thảo · Phàm Nhân' : `Linh Thảo · ${majorRealmNameForIndex(major)}`;
  }
  const core = /^resource\.alchemy\.v146\.demon_core\.realm\.(\d+)$/.exec(String(resourceId));
  if (core) return `Yêu Đan · ${majorRealmNameForIndex(clampMajor(Number(core[1])))}`;
  return undefined;
}

export function alchemyPillResourceIdV146(family, majorRealmIndex, quality) {
  if (!ALCHEMY_V146_FAMILIES[family]) throw new Error(`Họ Đan V146 không tồn tại: ${family}`);
  if (!ALCHEMY_V146_QUALITY_NAMES[quality]) throw new Error(`Phẩm Đan V146 không tồn tại: ${quality}`);
  const major = clampMajor(majorRealmIndex, true);
  return `resource.pill.alchemy.v146.${family}.m${major}.${quality}`;
}

export function parseAlchemyPillResourceIdV146(resourceId) {
  const match = /^resource\.pill\.alchemy\.v146\.([A-Za-z]+)\.m(\d+)\.(low|mid|high|supreme)$/.exec(String(resourceId));
  if (!match || !ALCHEMY_V146_FAMILIES[match[1]]) return undefined;
  const majorRealmIndex = Number(match[2]);
  if (!Number.isInteger(majorRealmIndex) || majorRealmIndex < 0 || majorRealmIndex > ALCHEMY_V146_MAJOR_REALM_COUNT) return undefined;
  return { family: match[1], majorRealmIndex, realmTier: majorRealmIndex, quality: match[3], schema: ALCHEMY_V146_SCHEMA };
}

export function alchemyPillNameV146(family, majorRealmIndex, quality) {
  const def = ALCHEMY_V146_FAMILIES[family];
  if (!def) throw new Error(`Họ Đan V146 không tồn tại: ${family}`);
  const major = clampMajor(majorRealmIndex, true);
  const realmName = major === 0 ? 'Phàm Nhân' : majorRealmNameForIndex(major);
  return `${def.name} · ${realmName} · ${ALCHEMY_V146_QUALITY_NAMES[quality] ?? quality}`;
}

export function alchemyRecipeIngredientsV146(family, majorRealmIndex) {
  const def = ALCHEMY_V146_FAMILIES[family];
  if (!def) throw new Error(`Họ Đan V146 không tồn tại: ${family}`);
  const major = clampMajor(majorRealmIndex, true);
  if (major === 0 && def.demonCore > 0)
    throw new Error(`${def.name} từ Luyện Khí trở lên mới dùng Yêu Đan.`);
  const rows = [];
  if (def.herb > 0) rows.push({ resourceId: alchemyHerbResourceIdV146(major), quantity: def.herb, family: 'herb' });
  if (def.demonCore > 0) rows.push({ resourceId: alchemyDemonCoreResourceIdV146(major), quantity: def.demonCore, family: 'demonCore' });
  return rows;
}

export function alchemyRecipeCatalogueV146() {
  const rows = [];
  // Phàm Nhân is deliberately herb-only: no fake “Phàm Yêu” resource is invented.
  for (const family of ['cultivation']) {
    rows.push({ id: `alchemy.v146.${family}.m0`, family, majorRealmIndex: 0, name: alchemyPillNameV146(family, 0, 'low').replace(` · ${ALCHEMY_V146_QUALITY_NAMES.low}`, ''), ingredients: alchemyRecipeIngredientsV146(family, 0) });
  }
  for (let major = 1; major <= ALCHEMY_V146_MAJOR_REALM_COUNT; major++) {
    for (const family of ALCHEMY_V146_LIVE_FAMILY_IDS) {
      rows.push({ id: `alchemy.v146.${family}.m${major}`, family, majorRealmIndex: major, name: alchemyPillNameV146(family, major, 'low').replace(` · ${ALCHEMY_V146_QUALITY_NAMES.low}`, ''), ingredients: alchemyRecipeIngredientsV146(family, major) });
    }
  }
  return rows;
}

export function alchemyPermanentFamilyStatV146(family) {
  if (family === 'lifePower') return 'attack';
  if (family === 'lifeBody') return 'maxHp';
  if (family === 'lifeDefense') return 'defense';
  return undefined;
}

// Raw stat, not % of the current character. The major-realm x3 backbone is the same one used by Hunt/Equipment.
// This makes a pill's written number stable forever even after the character becomes much stronger.
const PERMANENT_LOW_BASE = Object.freeze({ attack: 0.45, maxHp: 7, defense: 0.36 });
export function alchemyPermanentRawGainV146(family, majorRealmIndex, quality) {
  const stat = alchemyPermanentFamilyStatV146(family);
  if (!stat) throw new Error(`${family} không phải Đan bồi dưỡng vĩnh viễn V146.`);
  const major = clampMajor(majorRealmIndex);
  const scale = huntMajorRealmPowerScaleV142(major);
  const qualityMultiplier = Math.max(0, Number(PILL_QUALITY_MULTIPLIER[quality]) || 0);
  return Math.max(1, Math.round(PERMANENT_LOW_BASE[stat] * scale * qualityMultiplier));
}

export function alchemyPermanentQuotaKeyV146(family, majorRealmIndex) {
  if (!alchemyPermanentFamilyStatV146(family)) throw new Error(`${family} không có quota permanent V146.`);
  return `v146.${family}.major.${clampMajor(majorRealmIndex)}`;
}

// 10 Cực phẩm in one major realm target the following total shortcut. Early pills matter;
// late pills remain support and can never replace canonical Tu Luyện.
export function alchemyCultivationPillTotalSupremePctV146(majorRealmIndex) {
  const major = clampMajor(majorRealmIndex);
  if (major >= 28) return 3;
  return Math.max(3, 12 - Math.floor((major - 1) / 3));
}

export function alchemyCultivationPillPctV146(majorRealmIndex, quality) {
  const supremeMultiplier = Math.max(1e-9, Number(PILL_QUALITY_MULTIPLIER.supreme) || 1);
  const qualityMultiplier = Math.max(0, Number(PILL_QUALITY_MULTIPLIER[quality]) || 0);
  return alchemyCultivationPillTotalSupremePctV146(majorRealmIndex)
    / ALCHEMY_V146_CULTIVATION_PILL_CAP_PER_MAJOR_REALM
    * qualityMultiplier / supremeMultiplier;
}

export function alchemyCultivationPillRawGainV146(requiredTuVi, majorRealmIndex, quality, externalGainPct = 0) {
  const required = Math.max(1, Number(requiredTuVi) || 1);
  const pct = alchemyCultivationPillPctV146(majorRealmIndex, quality);
  return required * pct / 100 * (1 + Math.max(0, Number(externalGainPct) || 0) / 100);
}

export const ALCHEMY_V146_VIRTUAL_CORE_KILLS_PER_DROP_BY_ZONE = Object.freeze([40, 38, 35, 32, 30, 27, 24, 20]);

export function settleAlchemyVirtualDemonCoresV146({ kills = 0, zone = 1, progress = 0 } = {}) {
  const z = Math.max(1, Math.min(8, Math.floor(Number(zone) || 1)));
  const denominator = ALCHEMY_V146_VIRTUAL_CORE_KILLS_PER_DROP_BY_ZONE[z - 1];
  const total = Math.max(0, Number(progress) || 0) + Math.max(0, Math.floor(Number(kills) || 0));
  const amount = Math.floor(total / denominator);
  return { amount, progress: total - amount * denominator, killsPerDrop: denominator, zone: z };
}

export function alchemyBossFirstClearDemonCoresCumulativeV146(localFloor) {
  const floor = Math.max(0, Math.min(800, Math.floor(Number(localFloor) || 0)));
  return Math.floor(floor / 5) + Math.floor(floor / 100) * 10;
}

export function alchemyBossFirstClearDemonCoreDeltaV146(previousHighestLocalFloor, newHighestLocalFloor) {
  return Math.max(0, alchemyBossFirstClearDemonCoresCumulativeV146(newHighestLocalFloor) - alchemyBossFirstClearDemonCoresCumulativeV146(previousHighestLocalFloor));
}

export function alchemyV146SourceSinkContract() {
  return {
    schema: ALCHEMY_V146_SCHEMA,
    ingredients: [
      { family: 'herb', source: 'Dược Viên', sink: 'mọi Đan Phương V146' },
      { family: 'demonCore', source: 'Săn Yêu/Săn Ảo', sink: 'Đan Phương từ Luyện Khí trở lên' },
    ],
    permanentFamilies: [...ALCHEMY_V146_PERMANENT_FAMILY_IDS],
    retiredFamilies: [...ALCHEMY_V146_RETIRED_FAMILY_IDS],
    rules: {
      noSocketDanCot: true,
      noMedicineResistance: true,
      permanentRawStats: true,
      permanentStatsSurviveReincarnation: true,
      perLifeQuotaResetsOnReincarnation: true,
      onlyTwoIngredientFamilies: true,
      huntMajorRealmCoreTiers: ALCHEMY_V146_MAJOR_REALM_COUNT,
    },
  };
}
