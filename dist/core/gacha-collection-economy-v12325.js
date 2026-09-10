// V151 public economy adapter.
// V149 Bảo Hồn progression remains canonical; V150 removes Bảo Khí; V151 exposes one-slot Chí Bảo combat identities.
// The full V12325/V147/V148 implementation is preserved in the base module.
export * from './gacha-collection-economy-v12325-base.js';

import * as base from './gacha-collection-economy-v12325-base.js';
import {
  ARTIFACT_SCHEMA_V149,
  ARTIFACT_RESOURCE_SCHEMA_V150,
  ARTIFACT_RESOURCE_MODE_V150,
  RELIC_SCHEMA_V151,
  artifactComboSummaryV149,
  artifactRawSummaryV149,
  artifactResourceSummaryV150,
  relicSummaryV151,
  refineArtifactBaoHonV149,
} from './artifact-v88.js';

function artifactFacilityLevelV149(state) {
  return Math.max(1, Math.floor(state?.cave?.facilities?.find(x => x.id === 'artifact')?.level ?? 1));
}

function fortuneWithoutRemovedResourceV150(fortune = {}) {
  const out = { ...fortune };
  delete out.baoQiGainPct;
  if (out.caps) {
    out.caps = { ...out.caps };
    delete out.caps.baoQiGainPct;
  }
  out.resourceMode = ARTIFACT_RESOURCE_MODE_V150;
  out.v150Rule = 'Pháp Bảo dùng trigger + hồi chiêu + điều kiện combat; không dùng thanh tài nguyên riêng.';
  return out;
}

/**
 * Existing public strengthening command remains the single mutation authority.
 * Before Lv100 it is ordinary Luyện Hóa. At Lv100 + Bảo Giai V it becomes Bảo Hồn ∞ for Pháp Bảo only.
 * Chí Bảo remain finite at Lv100 + Bảo Giai V.
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
 * Production read model: Pháp Bảo keep V149 progression and V150 trigger/cooldown activation.
 * Chí Bảo expose V151 identity, one-slot authority and finite progression/source-sink provenance.
 */
export function collectionEconomySummaryV12325(state, foundation, now = Date.now(), realmOrder = 10) {
  const out = base.collectionEconomySummaryV12325(state, foundation, now, realmOrder);
  const artifactCategory = out.categories?.find(x => x.category === 'artifact');
  if (artifactCategory) {
    artifactCategory.genericFragmentName = 'Luyện Bảo Tinh Hoa';
    artifactCategory.artifactFortune = fortuneWithoutRemovedResourceV150(artifactCategory.artifactFortune);
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
        resourceV150: item.artifact?.resourceV150 ?? artifactResourceSummaryV150(),
      };
    });
  }

  const relicCategory = out.categories?.find(x => x.category === 'relic');
  if (relicCategory) {
    relicCategory.activeLimit = 1;
    relicCategory.progression = 'Luyện Hóa Lv1–100 + Bảo Giai I–V';
    relicCategory.items = relicCategory.items.map(item => ({
      ...item,
      relicV151: item.relic?.v151,
      combatIdentity: item.relic?.v151?.identity,
      combatPattern: item.relic?.v151?.pattern,
    }));
  }

  const raw = artifactRawSummaryV149(state);
  const combo = artifactComboSummaryV149(state);
  const resource = artifactResourceSummaryV150();
  const relicV151 = relicSummaryV151(state);
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
  out.artifactV150 = {
    schema: ARTIFACT_RESOURCE_SCHEMA_V150,
    resource,
    activation: 'trigger + cooldown + condition',
    combo: 'event / state / mark; no hard set lock',
  };
  out.relicV151 = {
    ...relicV151,
    schema: RELIC_SCHEMA_V151,
  };
  if (out.artifactV88) {
    out.artifactV88 = {
      ...out.artifactV88,
      fortune: fortuneWithoutRemovedResourceV150(out.artifactV88.fortune),
      v149: artifactV149,
      comboV149: combo,
      resourceV150: resource,
      relicV151,
    };
  }
  return out;
}
