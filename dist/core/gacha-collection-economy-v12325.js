// V149 public adapter.
// The full V12325/V147/V148 implementation is preserved byte-for-byte in the base module.
// Explicit exports below shadow the matching star exports without changing any unrelated economy path.
export * from './gacha-collection-economy-v12325-base.js';

import * as base from './gacha-collection-economy-v12325-base.js';
import {
  ARTIFACT_SCHEMA_V149,
  artifactComboSummaryV149,
  artifactRawSummaryV149,
  refineArtifactBaoHonV149,
} from './artifact-v88.js';

function artifactFacilityLevelV149(state) {
  return Math.max(1, Math.floor(state?.cave?.facilities?.find(x => x.id === 'artifact')?.level ?? 1));
}

/**
 * V149 keeps the existing public strengthening command as the single mutation authority.
 * Before Lv100 it is ordinary Luyện Hóa. At Lv100 + Bảo Giai V it becomes Bảo Hồn ∞.
 * Chí Bảo and every non-artifact category stay on the exact V12325/V147/V148 implementation.
 */
export function strengthenCollectionEconomyV12325(state, itemId, levels = 1) {
  const definition = base.collectionDefinitionV12325(itemId);
  const progress = definition?.category === 'artifact' ? state?.items?.[itemId] : undefined;
  if (definition?.category === 'artifact' && progress?.owned && Math.max(1, Math.floor(Number(progress.level) || 1)) >= 100) {
    const facilityLevel = artifactFacilityLevelV149(state);
    const result = refineArtifactBaoHonV149(state, itemId, levels, facilityLevel);
    return {
      ...result,
      definition,
      mode: 'baoHon',
      levels: result.ranks,
      baoHonRanks: result.ranks,
      strengthenLabel: 'Bảo Hồn',
    };
  }
  return base.strengthenCollectionEconomyV12325(state, itemId, levels);
}

/**
 * Production read-model override: expose the infinite raw lane and combo grammar through
 * the same collection DTO. Percentage mechanics remain owned by bounded V88 Fortune.
 */
export function collectionEconomySummaryV12325(state, foundation, now = Date.now(), realmOrder = 10) {
  const out = base.collectionEconomySummaryV12325(state, foundation, now, realmOrder);
  const artifactCategory = out.categories?.find(x => x.category === 'artifact');
  if (artifactCategory) {
    artifactCategory.genericFragmentName = 'Luyện Bảo Tinh Hoa';
    artifactCategory.items = artifactCategory.items.map(item => {
      const v149 = item.artifact?.v149;
      if (!v149) return item;
      const progress = item.progress ?? {};
      const level = Math.max(1, Math.floor(Number(progress.level) || 1));
      const advance = Math.max(0, Math.floor(Number(progress.advance) || 0));
      const owned = Boolean(progress.owned);
      let strengthenCost = item.strengthenCost;
      let strengthenMode = level < 100 ? 'refinement' : undefined;
      let strengthenLabel = level < 100 ? 'Luyện Hóa' : undefined;
      let strengthenBlockedReason;
      if (owned && level >= 100 && advance >= 4) {
        strengthenCost = v149.nextCost;
        strengthenMode = 'baoHon';
        strengthenLabel = 'Bảo Hồn';
      } else if (owned && level >= 100) {
        strengthenCost = undefined;
        strengthenBlockedReason = 'Cần Bảo Giai V để mở Bảo Hồn.';
      }
      return {
        ...item,
        strengthenCost,
        strengthenMode,
        strengthenLabel,
        strengthenBlockedReason,
        v149,
        comboV149: item.artifact?.comboV149 ?? v149.combo,
      };
    });
  }
  const raw = artifactRawSummaryV149(state);
  const combo = artifactComboSummaryV149(state);
  const artifactV149 = {
    schema: ARTIFACT_SCHEMA_V149,
    mode: 'Bảo Hồn ∞',
    infinite: true,
    rawOnly: true,
    percentageGrowth: false,
    material: 'Luyện Bảo Tinh Hoa',
    activeRaw: {
      attack: raw.attack,
      physique: raw.physique,
      defense: raw.defense,
    },
    sources: raw.sources.map(x => ({
      id: x.id,
      name: x.name,
      baoHonRank: x.baoHonRank,
      raw: { ...x.raw },
    })),
    combo,
  };
  out.artifactV149 = artifactV149;
  if (out.artifactV88) out.artifactV88 = { ...out.artifactV88, v149: artifactV149, comboV149: combo };
  return out;
}
