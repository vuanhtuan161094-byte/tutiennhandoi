// V149 public GameplayFacade adapter.
// The pre-V149 implementation is preserved byte-for-byte in gameplay-v149-base.js.
export * from './gameplay-v149-base.js';

import { GameplayFacade as GameplayFacadeBase } from './gameplay-v149-base.js';
import { ARTIFACTS_V88, artifactViewV88, artifactRawSummaryV149 } from './artifact-v88.js';

// V162 public-authority cleanup: V12326 is the only callable Collection/Gacha path.
for (const legacyMethod of ['collectionGachaV12316', 'collectionGachaV12325']) {
  if (Object.prototype.hasOwnProperty.call(GameplayFacadeBase.prototype, legacyMethod)) {
    delete GameplayFacadeBase.prototype[legacyMethod];
  }
}

export class GameplayFacade extends GameplayFacadeBase {
  // V162 B2: canonical collection progression names. The lower Session implementation
  // stays V12325 for save/engine compatibility until that implementation is separately migrated.
  collectionStrengthenV12326(itemId, levels = 1) {
    return this.session.strengthenCollectionV12325(itemId, levels);
  }
  collectionAdvanceV12326(itemId) {
    return this.session.advanceCollectionV12325(itemId);
  }
  collectionEquipV12326(itemId, artifactSlotIndex) {
    return this.session.equipCollectionV12325(itemId, artifactSlotIndex);
  }
  collectionUnequipV12326(itemId) {
    return this.session.unequipCollectionV12325(itemId);
  }

  // V162 B3: existing standalone/UI V12325 action labels are compatibility shims only.
  // They must route through the canonical V12326 public methods, never directly to Session.
  collectionStrengthenV12325(itemId, levels = 1) {
    return this.collectionStrengthenV12326(itemId, levels);
  }
  collectionAdvanceV12325(itemId) {
    return this.collectionAdvanceV12326(itemId);
  }
  collectionEquipV12325(itemId, artifactSlotIndex) {
    return this.collectionEquipV12326(itemId, artifactSlotIndex);
  }
  collectionUnequipV12325(itemId) {
    return this.collectionUnequipV12326(itemId);
  }

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

  /**
   * V159 keeps endgame mechanics on the existing Session authority but makes the three
   * meaningful late-game decisions reachable through the same public `perform` transport
   * as the rest of the web game. No second resolver or endgame state is introduced.
   */
  dispatch(command) {
    const type = String(command?.type ?? '');
    if (type === 'setActiveManifestationsV159') return this.session.setActiveManifestations(command.ids ?? []);
    if (type === 'breakExtremityLayerV159') return this.session.breakExtremityLayer();
    if (type === 'createGenesisEpochV159') return this.session.createGenesisEpoch();
    return super.dispatch(command);
  }
}
