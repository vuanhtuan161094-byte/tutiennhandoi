// V149 public GameplayFacade adapter.
// The pre-V149 implementation is preserved byte-for-byte in gameplay-v149-base.js.
export * from './gameplay-v149-base.js';

import { GameplayFacade as GameplayFacadeBase } from './gameplay-v149-base.js';
import { ARTIFACTS_V88, artifactViewV88, artifactRawSummaryV149 } from './artifact-v88.js';

export class GameplayFacade extends GameplayFacadeBase {
  overview() {
    const out = super.overview();
    const state = this.session.state;
    const canonical = state.collectionV12316;
    const activeArtifactIds = [...new Set(canonical?.activeArtifactIds ?? [])].filter(id => canonical?.items?.[id]?.owned);
    return {
      ...out,
      build: {
        ...out.build,
        activeArtifactCount: activeArtifactIds.length,
        artifactAuthority: 'collectionV12316.activeArtifactIds',
        activeRelicId: canonical?.economyV12325?.activeRelicId,
      },
    };
  }

  /**
   * Player-facing Pháp Bảo view is canonical V88/V149 only.
   * Legacy state.artifacts remains available internally to the reincarnation/world-relic loop,
   * but it is no longer presented as the combat loadout authority.
   */
  artifacts() {
    const state = this.session.state;
    const canonical = state.collectionV12316;
    if (!canonical?.items) return super.artifacts();
    const raw = artifactRawSummaryV149(canonical);
    const rawById = new Map(raw.sources.map(x => [x.id, x]));
    return ARTIFACTS_V88
      .map(def => ({ def, view: artifactViewV88(canonical, def.id) }))
      .filter(({ view }) => Boolean(view?.progress?.owned))
      .sort((a, b) => Number(b.view.active) - Number(a.view.active) || b.view.refinementLevel - a.view.refinementLevel || a.def.name.localeCompare(b.def.name))
      .map(({ def, view }, i) => {
        const source = rawById.get(def.id);
        return {
          index: i + 1,
          id: def.id,
          name: def.name,
          active: Boolean(view.active),
          tier: view.grade,
          quality: view.grade,
          nourishmentStage: `Luyện Hóa ${view.refinementLevel}/100 · Bảo Giai ${view.grade}`,
          spirit: view.skill?.name ?? 'Pháp Kỹ',
          yearsOwned: undefined,
          battles: undefined,
          resonance: undefined,
          authority: 'collectionV12316.activeArtifactIds',
          role: def.role,
          refinementLevel: view.refinementLevel,
          grade: view.grade,
          passive: view.passive,
          skill: view.skill,
          v149: view.v149,
          rawActive: source ? { ...source.raw } : { attack: 0, physique: 0, defense: 0 },
        };
      });
  }
}
