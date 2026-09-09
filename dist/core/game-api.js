export class LocalGameApplicationApi {
    apiVersion = 'game-api.v140';
    #game;
    constructor(game) { this.#game = game; }
    getOverview() { return this.#game.overview(); }
    getCharacter() { return this.#game.character(); }
    getClientCoreV140() { return this.#game.clientCoreV140(); }
    getClientShellV140() { return this.#game.clientShellV140(); }
    getClientOverviewLiteV140() { return this.#game.clientOverviewLiteV140(); }
    getCharacterSkillsV129() { return this.#game.characterSkillsV129(); }
    getCharacterCultivationV140() { return this.#game.characterCultivationV140(); }
    getCharacterHuntV129() { return this.#game.characterHuntV129(); }
    getCharacterOverviewV129() { return this.#game.characterOverviewV129(); }
    getCharacterRootV129() { return this.#game.characterRootV129(); }
    getCharacterDongfuV129() { return this.#game.characterDongfuV129(); }
    getInventory() { return this.#game.inventory(); }
    getEquipment() { return this.#game.equipment(); }
    getEquipmentInventoryV129(selectedItemId) { return this.#game.equipmentInventoryV129(selectedItemId); }
    getEquipmentEquippedV129() { return this.#game.equipmentEquippedV129(); }
    getEquipmentBuildIntelligence(itemId) { return this.#game.equipmentBuildIntelligence(itemId); }
    setLootItemLocked(itemId, locked) { return this.#game.setLootItemLocked(itemId, locked); }
    getEquipmentSystem() { return this.#game.equipmentSystem(); }
    getArtifacts() { return this.#game.artifacts(); }
    getFlow() { return this.#game.flow(); }
    getJournal() { return this.#game.journal(); }
    getWorldHistory() { return this.#game.worldHistory(); }
    getLocations() { return this.#game.locations(); }
    getPersonalPower() { return this.#game.personalPower(); }
    getSoul() { return this.#game.soul(); }
    getFaction() { return this.#game.faction(); }
    getSocial() { return this.#game.social(); }
    getDao() { return this.#game.dao(); }
    getMyriadLives() { return this.#game.myriadLives(); }
    getPlayerExperienceV105(nowUnixMs = Date.now()) { return this.#game.playerExperienceV105(nowUnixMs); }
    getDungeons() { return this.#game.dungeons(); }
    getEndlessHunt() { return this.#game.endlessHunt(); }
    getBuild() { return this.#game.buildSheet(); }
    getBossIntel(dungeonId, floor) { return this.#game.bossIntel(dungeonId, floor); }
    getCombatReview() { return this.#game.combatReview(); }
    getReincarnation() { return this.#game.reincarnationHub(); }
    getReincarnationPlanner() { return this.#game.reincarnationPlanner(); }
    previewReincarnationPlan(plan = {}) { return this.#game.reincarnationPlanPreview(plan); }
    getLifePotentialV2() { return this.#game.lifePotentialV2(); }
    spendLifePotentialV2(id, points = 1) { return this.#game.spendLifePotentialV2(id, points); }
    getPermanentPotentialV2() { return this.#game.permanentPotentialV2(); }
    spendPermanentPotentialV2(id, points = 1) { return this.#game.spendPermanentPotentialV2(id, points); }
    getReincarnationProgressV2(nowUnixMs = Date.now()) { return this.#game.reincarnationProgressV2(nowUnixMs); }
    getDaoSuyV127() { return this.#game.daoSuyV127(); }
    challengeDaoSuyTribulationV127() { return this.#game.challengeDaoSuyTribulationV127(); }
    runReincarnationTrialV2(kind, nowUnixMs = Date.now()) { return this.#game.runReincarnationTrialV2(kind, nowUnixMs); }
    previewReincarnationRewardV2(nowUnixMs = Date.now()) { return this.#game.previewReincarnationRewardV2(nowUnixMs); }
    finalizeReincarnationRewardsV2(confirmedBuildReady, nowUnixMs = Date.now()) { return this.#game.finalizeReincarnationRewardsV2(confirmedBuildReady, nowUnixMs); }
    spendReincarnationTreeNodeV2(nodeId, ranks = 1) { return this.#game.spendReincarnationTreeNodeV2(nodeId, ranks); }
    resetReincarnationTreeV2() { return this.#game.resetReincarnationTreeV2(); }
    getAutomation() { return this.#game.automationPolicy(); }
    getTelemetry() { return this.#game.playtestTelemetry(); }
    getEarlyGameSlice() { return this.#game.earlyGameSlice(); }
    getSaveIntegrity() { return this.#game.saveIntegrity(); }
    perform(command) { return this.#game.dispatch(command); }
    getCultivationV140() { return this.#game.cultivationV140(); }
    instantRetreat(realHours = 3) { return this.#game.retreatV140(realHours); }
    ascendRealm() { return this.#game.ascendRealmV140(); }
    huntEncounter(entityId, fortuneBonusPct = 0) { return this.perform({ type: 'activity', request: { type: 'hunt', durationYears: 0.25, maxEncounters: 1, forcedEntityId: entityId, advanceWorldTime: false, fortuneBonusPct, stopOnMajorEvent: false } }); }
    selectEndlessFloor(floor) { return this.#game.selectEndlessFloor(floor); }
    fightEndlessFloor(options = {}) { return this.#game.fightEndlessFloor(options); }
    setEndlessAutoAdvance(enabled) { return this.#game.setEndlessAutoAdvance(enabled); }
    useCultivationPill() { return this.#game.useCultivationPill(); }
    getEconomyV111() { return this.#game.economyV111(); }
    refreshPhuongThiV111() { return this.#game.refreshPhuongThiV111(); }
    buyPhuongThiV111(slotId, quantity = 1) { return this.#game.buyPhuongThiV111(slotId, quantity); }
    sellEconomyMaterialV111(resourceId, quantity = 1) { return this.#game.sellEconomyMaterialV111(resourceId, quantity); }
    convertEconomyMaterialV111(resourceId, batches = 1) { return this.#game.convertEconomyMaterialV111(resourceId, batches); }
    getAlchemyV112() { return this.#game.alchemyV112(); }
    startAlchemyV112(family, realmTier, batchSize, furnaceIndex = 0) { return this.#game.startAlchemyV112(family, realmTier, batchSize, furnaceIndex); }
    promoteAlchemyV112() { return this.#game.promoteAlchemyV112(); }
    useAlchemyPillV112(resourceId) { return this.#game.useAlchemyPillV112(resourceId); }
    learnAlchemyRecipeV85(recipeId) { return this.#game.learnAlchemyRecipeV85(recipeId); }
    plantAlchemyGardenV85(variant, realmTier, slot) { return this.#game.plantAlchemyGardenV85(variant, realmTier, slot); }
    harvestAlchemyGardenV85(slot) { return this.#game.harvestAlchemyGardenV85(slot); }
    spendPotential(id, points = 1) { return this.#game.spendPotential(id, points); }
    setSkillActive(skillId, active) { return this.#game.setSkillActive(skillId, active); }
    getCollectionV12316(nowUnixMs = Date.now()) { return this.#game.collectionV12316(nowUnixMs); }
    getCollectionEconomyV12325(nowUnixMs = Date.now()) { return this.#game.collectionEconomyV12325(nowUnixMs); }
    getCollectionEconomyV12326(nowUnixMs = Date.now()) { return this.#game.collectionEconomyV12326(nowUnixMs); }
    getEconomyActivityV89(nowUnixMs = Date.now()) { return this.#game.economyActivityV89(nowUnixMs); }
    getEconomyProductionV111(nowUnixMs = Date.now()) { return this.#game.economyProductionV111(nowUnixMs); }
    getPvpV91(nowUnixMs = Date.now()) { return this.#game.pvpV91(nowUnixMs); }
    joinPvpV91(nowUnixMs = Date.now()) { return this.#game.joinPvpV91(nowUnixMs); }
    refreshPvpDefenseV91(nowUnixMs = Date.now()) { return this.#game.refreshPvpDefenseV91(nowUnixMs); }
    setPvpTacticalV94(presetId, nowUnixMs = Date.now()) { return this.#game.setPvpTacticalV94(presetId, nowUnixMs); }
    challengePvpV91(opponentId, nowUnixMs = Date.now()) { return this.#game.challengePvpV91(opponentId, nowUnixMs); }
    settlePvpSeasonV94(nowUnixMs = Date.now()) { return this.#game.settlePvpSeasonV94(nowUnixMs); }
    replayPvpV91(fightId) { return this.#game.replayPvpV91(fightId); }
    buyEconomyOfferV89(offerId, nowUnixMs = Date.now()) { return this.#game.buyEconomyOfferV89(offerId, nowUnixMs); }
    getForgingV12328(nowUnixMs = Date.now()) { return this.#game.forgingV12328(nowUnixMs); }
    syncForgingV12328(nowUnixMs = Date.now()) { return this.#game.syncForgingV12328(nowUnixMs); }
    startForgingV12328(recipeId, nowUnixMs = Date.now()) { return this.#game.startForgingV12328(recipeId, nowUnixMs); }
    setManualGachaRealmV127(realmStageIndex) { return this.#game.setManualGachaRealmV127(realmStageIndex); }
    setManualGachaOrientationV127(manualId) { return this.#game.setManualGachaOrientationV127(manualId); }
    gachaCollectionV12326(bannerId, count = 1, usePremium = false) { return this.#game.collectionGachaV12326(bannerId, count, usePremium); }
    composeCollectionV12326(itemId) { return this.#game.composeCollectionV12326(itemId); }
    activateOriginCollectionV12326(category, itemId) { return this.#game.activateOriginCollectionV12326(category, itemId); }
    clearCollectionDailyV12326(dungeonId, nowUnixMs = Date.now()) { return this.#game.collectionDailyV12326(dungeonId, nowUnixMs); }
    simulateCollectionGachaV12326(category, pulls = 10000) { return this.#game.collectionGachaSimV12326(category, pulls); }
    devGrantCollectionV12326() { return this.#game.devCollectionGrantV12326(); }
    upgradePetGearV12328(petId, slot) { return this.#game.petGearUpgradeV12328(petId, slot); }
    gachaCollectionV12325(bannerId, count = 1, usePremium = false) { return this.#game.collectionGachaV12325(bannerId, count, usePremium); }
    strengthenCollectionV12325(itemId, levels = 1) { return this.#game.collectionStrengthenV12325(itemId, levels); }
    advanceCollectionV12325(itemId) { return this.#game.collectionAdvanceV12325(itemId); }
    spendConfidantHeartV148(itemId, branch) { return this.#game.confidantHeartV148(itemId, branch); }
    equipCollectionV12325(itemId, artifactSlotIndex) { return this.#game.collectionEquipV12325(itemId, artifactSlotIndex); }
    unequipCollectionV12325(itemId) { return this.#game.collectionUnequipV12325(itemId); }
    strengthenHeartMethodV12325(passiveId) { return this.#game.heartMethodStrengthenV12325(passiveId); }
    advanceHeartMethodV12325(passiveId) { return this.#game.heartMethodAdvanceV12325(passiveId); }
    clearCollectionDailyV12325(dungeonId, nowUnixMs = Date.now()) { return this.#game.collectionDailyV12325(dungeonId, nowUnixMs); }
    simulateCollectionGachaV12325(bannerId, pulls = 10000) { return this.#game.collectionGachaSimV12325(bannerId, pulls); }
    devGrantCollectionV12325() { return this.#game.devCollectionGrantV12325(); }
    gachaCollectionV12316(category, count = 1, usePremium = false) { return this.#game.collectionGachaV12316(category, count, usePremium); }
    strengthenCollectionV12316(itemId, levels = 1) { return this.#game.collectionStrengthenV12316(itemId, levels); }
    advanceCollectionV12316(itemId) { return this.#game.collectionAdvanceV12316(itemId); }
    equipCollectionV12316(itemId) { return this.#game.collectionEquipV12316(itemId); }
    unequipCollectionV12316(itemId) { return this.#game.collectionUnequipV12316(itemId); }
    clearCollectionDailyV12316(dungeonId, nowUnixMs = Date.now()) { return this.#game.collectionDailyV12316(dungeonId, nowUnixMs); }
    upgradeCaveFacilityV12316(facilityId) { return this.#game.caveUpgradeV12316(facilityId); }
    getSpecializationPreviewV125() { return this.#game.specializationPreviewV125(); }
    getSpecializationV125() { return this.#game.specializationV125(); }
    commitSpecializationV125(nature, mainDao) { return this.#game.commitSpecializationV125(nature, mainDao); }
    chooseSecondaryDaoV125(dao) { return this.#game.chooseSecondaryDaoV125(dao); }
    allocateDaoNaturePointV125(tierId, branch, points = 1) { return this.#game.allocateDaoNaturePointV125(tierId, branch, points); }
    chooseDaoNatureMajorBranchV125(tierId, branch) { return this.#game.chooseDaoNatureMajorBranchV125(tierId, branch); }
    upgradeBattleDaoSkillV12317(skillId) { return this.#game.upgradeBattleDaoSkillV12317(skillId); }
    advanceBattleDaoSkillV12317(skillId) { return this.#game.advanceBattleDaoSkillV12317(skillId); }
    getSpiritualRootV145() { return this.#game.spiritualRootV145(); }
    nourishSpiritualRootV145(levels = 1) { return this.#game.nourishSpiritualRootV145(levels); }
    ascendSpiritualRootV145() { return this.#game.ascendSpiritualRootV145(); }
    allocateSpiritualRootMeridianV145(branchId) { return this.#game.allocateSpiritualRootMeridianV145(branchId); }
    chooseSpiritualRootInsightV145(insightId) { return this.#game.chooseSpiritualRootInsightV145(insightId); }
    combineSpiritualRootOriginV145(fromRealmTier, batches = 1) { return this.#game.combineSpiritualRootOriginV145(fromRealmTier, batches); }
    challengeBoss(dungeonId, floor) { return this.perform({ type: 'challengeDungeon', dungeonId, floor }); }
    chooseEvent(eventId, choiceId) { return this.perform({ type: 'contentEvent', eventId, choiceId }); }
    applyLoadoutPreset(presetId) { return this.perform({ type: 'applyLoadoutPreset', presetId }); }
    applySavedLoadout(idOrName) { return this.perform({ type: 'applySavedCombatLoadout', idOrName }); }
    configureAutomation(patch) { return this.perform({ type: 'configureAutomation', patch }); }
    setMajorTalents(ids) { return this.perform({ type: 'setMajorTalents', ids }); }
    spendTalent(id, ranks = 1) { return this.perform({ type: 'spendReincarnationTalent', talentId: id, ranks }); }
    reincarnate(plan) { return this.perform({ type: 'reincarnate', plan }); }
    exportSave() { return this.#game.snapshot(); }
}
export function createGameApplicationApi(game) {
    return new LocalGameApplicationApi(game);
}
//# sourceMappingURL=game-api.js.map
