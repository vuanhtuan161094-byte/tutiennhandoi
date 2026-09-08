import { ActivityEngine } from './activity.js';
import { EventHistory } from './history.js';
import { restoreSimulationSession } from './session-restore.js';
import { fiveElementCounter } from './combat-rules.js';
import { cloneAdventureState } from './world.js';
import { applyCharacterToEntity, awakenBloodline, characterStatSourceStagesV129, cloneCharacterSystemState, learnSkill as learnCombatSkill, learnTechnique, setActiveTechnique, setCombatLoadout } from './character.js';
import { cloneBuildFoundationV113, setSkillVariantsV118 } from './build-foundation-v113.js';
import { BATTLE_DAO_ACTIVE_LOADOUT_SLOTS_V125, addDaoNatureCultivationXpV125, allocateDaoNaturePointV125, battleDaoOfSkillV125, battleDaoSkillPreviewV125, battleDaoGameplayGuideV12311, canLearnBattleDaoSkillV125, chooseDaoNatureMajorBranchV125, chooseSecondaryDaoV125, commitSpecializationV125, estimateBattleDaoCastCountsV125, gainBattleDaoPracticeFromCastCountsV125, isBattleDaoSkillV125, isCurrentDaoEligibleV125, isV119BattleDaoTechniqueV125, passiveUpgradeV125, practiceContentEfficiencyForGapV125, retroactiveSkillPointsForRealmV125, rewardSkillPointsForRealmV125, skillPracticeProfileV125, spendSkillPointsToLearnV125, syncBattleDaoV2ProgressionV78, syncCanonicalBattleDaoLoadoutV125, syncDaoNatureTierUnlocksV125, techniqueDaoEligibleV125, validateBattleDaoSkillUseV125, v125SpecializationSummary } from './specialization-skill-progression-v125.js';
import { BATTLE_DAO_V2_REALM_ORDER, battleDaoV2ActiveSlotsUnlocked, battleDaoV2Catalog, battleDaoV2Passives } from '../content/battle-dao-v2-catalog.js';
import { battleDaoSkillGrowthCurrentSummaryV126, battleDaoSkillGrowthProfileV126 } from './battle-dao-skill-growth-v126.js';
import { advanceSkillGradeV12317, ensureSkillHeartProgressionV12317, heartMethodGradeV12317, heartMethodStatSummaryV12317, skillAdvanceCostV12317, skillGradeV12317, skillLevelCostV12317, skillLevelV12317, skillScalingSummaryV12317, SKILL_GRADE_LABEL_V12317, SKILL_GRADE_ORDER_V12317, upgradeSkillLevelV12317 } from './skill-heart-method-v12317.js';
import { allocateSpiritualRootMeridianPointV145, ascendSpiritualRootV145 as ascendSpiritualRootStateV145, chooseSpiritualRootInsightV145 as chooseSpiritualRootInsightStateV145, combineSpiritualRootOriginV145 as combineSpiritualRootOriginStateV145, nourishSpiritualRootV145 as nourishSpiritualRootStateV145, settleLegacySpiritualRootMigrationV145, settleSpiritualRootHuntV145, spiritualRootSummaryV145 } from './spiritual-root-v145.js';
import { battleDaoAutoRotationV127, isBattleDaoSkillIdV127 } from './battle-dao-rotation-v127.js';
import { elementSealSummaryV133, setSkillElementSealV133 as setSkillElementSealStateV133 } from './element-seal-v133.js';
import './potential.js';
import { advanceDaoSuyByWorldYearsV127, daoSuyStatusV127, relieveDaoSuyOnMajorAscensionV140, resolveDaoSuyTribulationV127 } from './dao-suy-v127.js';
import { effectiveMortalLifespanCapV127 } from './lifespan-v127.js';
import { OFFLINE_CAP_REAL_HOURS, WORLD_YEARS_PER_REAL_HOUR, WORLD_YEARS_PER_REAL_SECOND } from './realtime-balance.js';
import { CULTIVATION_TICK_SECONDS_V140, RETREAT_BANK_CAP_HOURS_V140, RETREAT_DAILY_BANK_HOURS_V140, cleanCultivationStateV140, cultivationProgressV140, cultivationRateV140, cultivationRealmV140, commitRetreatBankV140, previewRetreatBankV140, isTribulationGateV140, isMajorRealmGateV140, effectiveCultivationRequiredTuViV140, CULTIVATION_REALMS_V140 } from './cultivation-v140.js';
import { cultivationR3Rank, ensureCultivationRuntimeR3, heavenRewardProfileR3, isOldRealmSkipEligibleR3, retreatInsightProfileR3, retreatRefundProfileR3, rollLingGuangMultiplierR3, rollRetreatInsightMultiplierR3 } from './reincarnation-progression-v1102.js';
import { realSecondsUntilNaturalDeath } from './offline.js';
import { availableRealmMaps, majorRealmIndexForMapFloor, majorRealmIndexForRealmOrder, mapFloorForRealmZone, mapStartFloorForRealm, realmMapDefinition, realmMapDefinitionForFloor, realmMapRewardProfile, zoneFloorForMapFloor } from '../content/realm-maps.js';
import { addEquipment, applyEquipmentToEntity, attemptEquipmentEnhancement, buildEquipmentInstance, equipItem, equipmentPower, transferEquipmentEnhancement } from './equipment.js';
import { craftEquipmentCostV115, engraveDaoInscriptionExactV115, ensureCraftPreferredAffixFamilyV115, reforgeEquipmentAffixEconomyV115, refineEquipmentAffixV115, spendEquipmentEconomyCostV115 } from './equipment-reforge-v115.js';
import { socketEquipmentGemV128, upgradeEquipmentGemV128, unsocketEquipmentGemV128 } from './equipment-inscription-gem-v128.js';
import { activeEquipmentSetMechanicsV116, equipmentSetTemplateIdV116, requireUnlockedSetCraftV116, isLiveEquipmentSetV12310 } from './equipment-set-v116.js';
import { claimOfflineLootCache, cloneInventoryManagementState, explainLootItem, lockLootItem, offlineLootCacheState, processLootBatch, unlockLootItem } from './inventory.js';
import { activateArtifact, deactivateArtifact, artifactLegacyScore, artifactPower, awakenArtifactSpirit, cloneArtifactInstance, markArtifactLost, markArtifactRecovered, nourishArtifact, recordActiveArtifactBattle, recordArtifactOwnershipYears } from './artifact.js';
import { DungeonEngine, addDungeonWorker, buildDungeonGuardian, guardianMechanicForFloor, highestClearedDungeonFloor, isDungeonFloorCleared, assignDungeonWorker, clearDungeonWorker } from './dungeon.js';
import { LifeSettlementEngine, applySettlement, birthSummary, buildReincarnatedState, cloneCurrentLifeMeta, carryPersistentBirthOrigins, cloneMetaProgressState, createInitialLifeMetaForCharacter, createMetaProgressState, rollBirth } from './life.js';
import { applyCombatPacingV124 } from './combat-pacing-v124.js';
import { analyzeBattle, topDamageSkill } from './combat-analytics.js';
import { analyzeCombatMatchup } from './combat-matchup.js';
import { buildTacticalLoadoutPresets } from './combat-loadout-presets.js';
import { adjustPlayerNpcRelationship, pastLifeKarmaForNpc, playerNpcRelationship, WorldSimulator, worldChronicle } from './npc.js';
import { ProfessionEngine, craftedStock, productQualityNames, unlockEligibleProfessionRecipes, useCraftedProduct } from './profession.js';
import { createChildForLife, ensureParentsForLife, establishSocialBond, socialBond, socialChronicle, syncSocialState } from './social.js';
import { contributeFactionKnowledge, contributeFactionResource, deactivateFactionMembership, factionChronicle, factionRankNames, foundPlayerFaction, joinFaction, playerFactionMembership, promoteFactionMembership, rankArchiveAccess, syncFactionState, upgradeFactionFacility } from './faction.js';
import { buyFromMarket, cloneEconomyState, factionServiceDefinitions, marketQuotes, marketsAtLocation, sellToMarket, syncEconomyState } from './economy.js';
import { applyEconomyResourceDrops, applyHeavenlyTreasureDrops, buyPhuongThiResource, cloneEconomyV111State, convertEconomyMaterial, createEconomyV111State, economyBandScale, economyMaterialDefinition, economyMaterialResourceId, economyTierForMajorRealmIndex, ensureEconomyV111State, heavenlyTreasureDefinitions, heavenlyTreasureQuantity, huntEconomyDropChances, isHeavenlyTreasureResourceId, manualRefreshPhuongThi, phuongThiManualRefreshCost, recordHuntEconomyTelemetry, rollHuntEconomyLoot, sellEconomyMaterial, syncPhuongThi, } from './economy-v111.js';
import { HUNT_OFFLINE_SPECIAL_OPPORTUNITY_FACTOR_V135, huntJackpotChanceV135, rewardLoopSummaryV135, settleHuntJackpotV135 } from './economy-reward-loop-v135.js';
import { lootDungeonIdsForRealmV122 } from './loot-economy-v122.js';
import { V125_DAO_NATURE_DUNGEON_ID, V125_DAO_NATURE_TIER_RESOURCE_IDS } from '../content/dungeons.js';
import { ALCHEMY_BUFF_DURATION_REAL_MINUTES, ALCHEMY_BUFF_PILL_DAILY_CAP, ALCHEMY_CULTIVATION_PILL_CAP_PER_MAJOR_REALM, ALCHEMY_DAO_SUY_PILL_CAP_PER_MAJOR_REALM, ALCHEMY_LIFESPAN_PILL_CAP_PCT, ALCHEMY_RANK_NAMES, ALCHEMY_TEMP_STAT_PILL_CAP_PER_TIER, ALCHEMY_TURN_NAMES, activeAlchemyBuff, alchemyCraftSnapshot, alchemyGardenHerbResourceIdV85, alchemyGardenPlotStatusV85, alchemyGardenSlotCountV85, alchemyTurnExpRequirement, alchemyFurnaceCount, alchemyIngredientAvailability, alchemyPillName, alchemyPillRealmEfficiency, alchemyPillResourceId, alchemyQualityWeights, alchemyVietnamDayKey, alchemyPromotionRequirements, alchemyRecipeCatalogue, alchemyRecipeDefinition, alchemyRecipeResearchCost, applyAlchemyStatBonuses, archiveAlchemyLegacy, cloneAlchemyLegacy, cloneAlchemyV112State, createAlchemyV112State, emptyAlchemyAllocation, ensureAlchemyV112State, harvestAlchemyGardenV85, learnAlchemyRecipeV85, lifePillStat, parseAlchemyPillResourceId, permanentPillCap, plantAlchemyGardenV85, promoteAlchemyRank, startAlchemyCraft, syncAlchemyV112 } from './alchemy-v112.js';
import { applyNaturalInjuryRecovery, rollPillQuality } from './recovery.js';
import { cloneGuidanceState, normalizeGuidanceAutomationPolicy, planGuidance } from './guidance.js';
import { clonePlayerFlowState, completeFirstLifeBeat, createPlayerFlowState, hasFirstLifeBeat } from './player-flow.js';
import { inspectContentEventChoice, isContentEventAvailable } from './content-event-director.js';
import { V127_SIX_DAO_CLONES, cloneProgressionProfileV128, cloneSoulState, createSoulClone as createSoulCloneState, dismissSoulClone as dismissSoulCloneState, nourishSoul as nourishSoulState, recordSoulCloneYears, setSoulCloneProtectorV127 as setSoulCloneProtectorStateV127, soulCloneAuthorityCapacityV127, soulCloneAuthorityProfileV127, soulPressureMultiplier, soulProtectorCultivationBonusPctV127, syncSoulDungeonWorkers, synchronizeSoulForRealm, totalSoulLoad, trainSoulCloneDaoHanhV128 as trainSoulCloneDaoHanhStateV128, upgradeSoulCloneSealV128 as upgradeSoulCloneSealStateV128 } from './soul.js';
import { buildNascentMidgameV112 } from './nascent-midgame-v112.js';
import { tribulationMilestoneBlockersV113 } from './progression-closure-v113.js';
import { applyDaoToEntity, chooseDaoInterpretation, cloneDaoState, contemplateDao as contemplateDaoState, discoverDao, previewDaoContemplation as previewDaoContemplationState, setDaoDomainActive, setMainDao, synchronizeDaoForRealm } from './dao.js';
import { applyIntegrationToEntity, integrationSummary as deriveIntegrationSummary } from './integration.js';
import { applyGreatVehicleToEntity, greatVehicleSummary as deriveGreatVehicleSummary } from './great-vehicle.js';
import { TribulationEngine, cloneTribulationState, createTribulationState } from './tribulation.js';
import { applyImmortalToEntity, breakExtremityLayer as breakExtremityLayerState, createGenesisEpoch as createGenesisEpochState, cloneImmortalState, refineApexImmortal as refineApexImmortalState, refineImmortalEssence as refineImmortalEssenceState, refineEarthImmortal as refineEarthImmortalState, refineHeavenImmortal as refineHeavenImmortalState, refineTrueImmortal as refineTrueImmortalState, setActiveManifestations as setActiveManifestationsState, synchronizeImmortalForRealm } from './immortal.js';
import { birthPreviewCountForSeal, boundRelicSlotsForSeal, buildMemoryFragments, karmaInheritanceSlotsForSeal, nextSealXp, reincarnationSealLevel, reincarnationSealName } from './reincarnation.js';
import { applyReincarnationArtifactTalents, applyReincarnationCombatTalents, cultivationTalentBonuses, daoContemplationInsightMultiplier, majorTalentDefinitions, majorTalentSlots, parallelDungeonEfficiencyMultiplier, professionTalentModifiers, queueMajorTalents, reincarnationTalentDefinitions, socialPositiveRelationshipMultiplier, spendReincarnationTalentPoints, syncReincarnationTalentsToOrigins, talentRank, techniquePassiveStrengthMultiplier } from './reincarnation-talents.js';
import { claimOrthodoxyTerritory, cloneOrthodoxyState, createOrthodoxyState, declareOrthodoxyWar, dissolveOrthodoxyPact, elevateOrthodoxy, establishOrthodoxyVassalage, formOrthodoxyAlliance, formOrthodoxyLeague, mobilizeOrthodoxyTreasury, orthodoxyEconomicSummary, orthodoxyTerritoryCapacity, resolveOrthodoxyCampaign, syncOrthodoxyState, withdrawOrthodoxyTribute } from './orthodoxy.js';
import { cloneGenesisWorldState, createGenesisWorld, createGenesisWorldState, evolveGenesisWorld, genesisWorldCapacity, harvestGenesisInsight, syncGenesisWorlds } from './genesis-world.js';
import { alignOuterAscendant, befriendOuterAscendant, cloneOuterAscendantState, createOuterAscendantState, materializeGenesisAscendants, syncOuterAscendants } from './ascendant.js';
import { combatPowerBreakdown, compareCombatPower, statProvenanceV129, summarizePersonalPower } from './personal-power.js';
import './save-stability.js';
import { applyBirthCombatOrigins, birthLuckFlatFromOrigins, birthLootMultiplierFromOrigins, writeBirthModifiersToOrigins } from './birth-randomness.js';
import { applyEndlessLifeLegacy, bestEndlessHuntFarmFloors, bossReady, cloneEndlessHuntState, createEndlessHuntState, endlessHuntDisplay, endlessHuntFloorEfficiency, ensureEndlessHuntMonster, ensureMajorHuntMapUnlocked, generateEndlessHuntMonster, highestUnlockedLocalFloor, isEndlessHuntFloorCleared, isEndlessHuntFloorUnlocked, recordEndlessHuntFloorStats, resolveEndlessHuntFight, selectEndlessHuntFloor } from './endless-hunt.js';
import { buildHuntCombatProfileV130 } from './hunt-real-combat-v130.js';
import { resolveEndlessHuntWithCombatKernelV2 } from './endless-hunt-combat-kernel-v2.js';
import { deterministicBinomialV77, deterministicJitteredTotalV77, huntVirtualFarmPlayerDpsLog10V77, huntVirtualFarmProfileV77 } from './hunt-virtual-farm-v77.js';
import { runCombatKernelV2 } from './combat-kernel-v2.js';
import { challengePvpV91, joinPvpV91, pvpViewV91, refreshPvpDefenseV91, replayPvpV91, setPvpTacticalV94, settlePvpSeasonV94, recordPvpRewardIntegrityV94, recordPvpSeasonRewardIntegrityV94 } from './pvp-v91.js';
import { endlessHuntFarmRecommendationsV123, evaluateHuntBossMechanicV123, huntFarmRewardEfficiencyV123 } from './pve-progression-v123.js';
import { buildHuntProductionV110 } from './hunt-production-v110.js';
import { huntEquipmentFragmentPreviewV142, settleRealHuntEquipmentFragmentsV142, settleVirtualHuntEquipmentFragmentsV142 } from './equipment-hunt-v142.js';
import { craftRankedEquipmentV142, engraveRankedEquipmentSetV142, equipmentCraftingSummaryV142, mergeRankedEquipmentV142, refineRankedEquipmentFragmentsV142 } from './equipment-crafting-v142.js';
import { buildEndlessHuntCombatStreamFromKernelV2 } from './hunt-combat-stream.js';
import { formatLogMagnitude } from './endless-number.js';
import { SeededRng } from './rng.js';
import { advanceBloodlineGrade, bloodlineProgressSummary, BODY_ESSENCE_RESOURCE_ID, BLOODLINE_ESSENCE_RESOURCE_ID, BLOODLINE_PROTECTION_RESOURCE_ID, implantBloodline, physiqueProgressSummary, progressPhysique, purifyBloodline, swapBloodline, trueBloodResourceId } from './origin-progression-v102.js';
import { bloodlineIds } from './birth-origins-v101.js';
import { cloneFateRuntimeState, createFateRuntimeState, fateHuntModifiers, fateOnHuntResult, fateResolveHuntEvent } from './fate-runtime-v102.js';
import { collectionConfidantV87Summary, collectionDefinitionV12316, syncCollectionManualTreeV127, collectionSummaryV12316 as deriveCollectionSummaryV12316, cloneCollectionProgressStateV12316, ensureCollectionProgressStateV12316, gachaCollectionV12316 as rollCollectionGachaV12316, strengthenCollectionItemV12316 as strengthenCollectionProgressV12316, advanceCollectionItemV12316 as advanceCollectionProgressV12316, equipCollectionItemV12316 as equipCollectionProgressV12316, unequipCollectionItemV12316 as unequipCollectionProgressV12316, clearDailyDungeonV12316 as clearCollectionDailyV12316, upgradeCaveFacilityV12316 as upgradeCollectionCaveV12316, caveFacilityCostMultiplierV99, caveFacilityDiscountPctV99, caveFacilityLevelV99 } from './collection-progression-v12316.js';
import { artifactSlotCapacityV88 } from './artifact-v88.js';
import { applyCollectionEconomyToEntityV12325, collectionEconomySummaryV12325 as deriveCollectionEconomyV12325, gachaCollectionEconomyV12325 as rollCollectionEconomyV12325, strengthenCollectionEconomyV12325 as strengthenCollectionEconomyProgressV12325, advanceCollectionEconomyV12325 as advanceCollectionEconomyProgressV12325, equipCollectionEconomyV12325 as equipCollectionEconomyProgressV12325, unequipCollectionEconomyV12325 as unequipCollectionEconomyProgressV12325, strengthenHeartMethodV12325 as strengthenHeartMethodProgressV12325, advanceHeartMethodV12325 as advanceHeartMethodProgressV12325, clearDailyEconomyDungeonV12325 as clearDailyEconomyV12325, simulateGachaEconomyV12325, ensureCollectionEconomyV12325, devMaxCollectionEconomyV12325 } from './gacha-collection-economy-v12325.js';
import { activateOriginCollectionV12326, clearDailyWorkshopV12326, collectionWorkshopSummaryV12326 as deriveCollectionWorkshopV12326, composeCollectionItemV12326, devMaxWorkshopV12326, gachaCollectionV12326 as rollCollectionWorkshopGachaV12326, simulateGachaV12326, syncOriginCollectionV12326, setManualGachaRealmV127 as setManualGachaRealmStateV127, setManualGachaOrientationV127 as setManualGachaOrientationStateV127 } from './collection-workshop-gacha-v12326.js';
import { ensureWorkshopProductionV12328, readyForgeQueuesV12328, removeForgeQueueV12328, reserveForgeQueueV12328, upgradePetGearV12328 } from './workshop-production-v12328.js';
import { RESOURCE_PVE_DUNGEONS_V12329 } from './resource-pve-v12329.js';
import { buyEconomyOfferV89, economyActivitySummaryV89, recordBoundJadeSpendV89, recordEconomyActivityV89, recordFirstClearBoundJadeV89, recordProgressionBoundJadeV89, recordPvpWinBoundJadeV91, recordPvpSeasonBoundJadeV94 } from './economy-activity-v89.js';
import { buildEconomyProductionV111 } from './economy-production-v111.js';
import { REINCARNATION_TREE_TIER_INVESTMENT, availableTreePoints, cloneReincarnationProgressStateV1102, corePotentialDefinitions, depthInfoForRealmOrder, ensureLifePotentialForRealm, nodeModifierValue, permanentPotentialConversionPctV127, previewReincarnationV2Reward, rankCost, rechargeReincarnationEnergy, reincarnationEnergyCostReductionPctV127, reincarnationPointsGainPctV4, reincarnationTreeRuntimeModifierV136, resetReincarnationTreeRanks, spendLifeCorePotential, spendPermanentCorePotential, spendReincarnationTreeRank, starterReincarnationTreeNodes, syncReincarnationTreeRuntimeOriginsV136, totalTreeMaxCostV127, totalTreeSpentPoints } from './reincarnation-progression-v1102.js';
import { FATE_BUILD_TOTAL_UNLOCK_COST_V4, activeFateBuildV4, cloneFateBuildStateV4, fateBuildDefinitionV4, applyFateSpiritStoneGainV4, fateBuildUnlockPreviewV4, selectActiveFateBuildV4 as selectActiveFateBuildStateV4, unlockFateBuildV4 as unlockFateBuildStateV4 } from './reincarnation-progression-v1102.js';
import { runSessionGuidanceV141 } from './session-guidance.js';
import { challengeSessionDungeonFloorV141 } from './session-dungeon.js';
import { useSessionAlchemyPillV141 } from './session-alchemy-pill.js';
import { applySessionContentEventEffectV141 } from './session-content-effect.js';
function manualTreeModifiersV127(tree) {
    return {
        cultivationGainPct: nodeModifierValue(tree, 'manual.cultivationGainPct'),
        offenseBaseEffectPct: nodeModifierValue(tree, 'manual.offenseBaseEffectPct'),
        defenseBaseEffectPct: nodeModifierValue(tree, 'manual.defenseBaseEffectPct'),
        offenseSecondaryEffectPct: nodeModifierValue(tree, 'manual.offenseSecondaryEffectPct'),
        defenseSecondaryEffectPct: nodeModifierValue(tree, 'manual.defenseSecondaryEffectPct'),
        milestoneBonusEffectPct: nodeModifierValue(tree, 'manual.milestoneBonusEffectPct'),
        grandCompletionMultiplierBonus: nodeModifierValue(tree, 'manual.grandCompletionMultiplierBonus'),
        nineUnityBonusPct: nodeModifierValue(tree, 'manual.nineUnityBonusPct'),
        completedRealmCultivationBonusPct: nodeModifierValue(tree, 'manual.completedRealmCultivationBonusPct'),
        materialCostReductionPct: nodeModifierValue(tree, 'manual.materialCostReductionPct'),
        currencyCostReductionPct: nodeModifierValue(tree, 'manual.currencyCostReductionPct'),
        dungeonMaterialGainPct: nodeModifierValue(tree, 'manual.dungeonMaterialGainPct'),
        retrainSpeedPct: nodeModifierValue(tree, 'manual.retrainSpeedPct'),
    };
}
function offlineRewardPctV127(state) {
    return Math.max(0, Math.min(50, reincarnationTreeRuntimeModifierV136(state?.inheritedOrigins ?? {}, 'cultivation.offlineRewardPct')));
}
function offlineSpecialOpportunityFactorV127(state) {
    const progress = offlineRewardPctV127(state) / 50;
    return HUNT_OFFLINE_SPECIAL_OPPORTUNITY_FACTOR_V135 + (1 - HUNT_OFFLINE_SPECIAL_OPPORTUNITY_FACTOR_V135) * Math.max(0, Math.min(1, progress));
}
function syncV127TreeDerivedState(state, meta) {
    const rp = meta.reincarnationProgress ?? meta;
    const tree = rp?.tree ?? { ranks:{} };
    syncReincarnationTreeRuntimeOriginsV136(state.inheritedOrigins, tree);
    const historical = Math.max(0, ...(meta.archives ?? []).map(x => Math.max(0, Number(x.maxRealmOrder ?? x.notableStats?.maxRealmOrder ?? 0) || 0)));
    state.inheritedOrigins['reincarnation.v127.historicalRealmOrder'] = historical;
    syncCollectionManualTreeV127(state.collectionV12316, { ...manualTreeModifiersV127(tree), historicalRealmOrder: historical });
}
export const SIMULATION_SAVE_VERSION = 45;
const SECRET_REALM_FIVE_ELEMENTS = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
function secretRealmPlayerElement(entity) {
    const dominant = entity.stats.dominantElement;
    if (dominant && SECRET_REALM_FIVE_ELEMENTS.includes(dominant))
        return dominant;
    let best;
    let bestPct = 0;
    for (const element of SECRET_REALM_FIVE_ELEMENTS) {
        const pct = entity.stats.elementalAffinities?.[element]?.pct ?? 0;
        if (pct > bestPct) {
            bestPct = pct;
            best = element;
        }
    }
    return bestPct > 0 ? best : undefined;
}
function secretRealmElementMatchup(entity, enemyElements) {
    const playerElement = secretRealmPlayerElement(entity);
    if (!playerElement || enemyElements.length === 0)
        return { playerElement, enemyPowerMultiplier: 1, label: 'Trung tính' };
    const countersEnemy = enemyElements.some(element => fiveElementCounter(playerElement, element));
    const enemyCounters = enemyElements.some(element => fiveElementCounter(element, playerElement));
    if (countersEnemy && !enemyCounters)
        return { playerElement, enemyPowerMultiplier: .88, label: 'Khắc chế · địch -12% chiến lực' };
    if (enemyCounters && !countersEnemy)
        return { playerElement, enemyPowerMultiplier: 1.25, label: 'Bị khắc · địch +25% chiến lực' };
    if (countersEnemy && enemyCounters)
        return { playerElement, enemyPowerMultiplier: 1.08, label: 'Ngũ Hành giao thoa · địch +8%' };
    return { playerElement, enemyPowerMultiplier: 1, label: 'Trung tính' };
}
function mixSeed(rootSeed, index) {
    let x = (rootSeed ^ Math.imul(index + 1, 0x9e3779b1)) | 0;
    x ^= x >>> 16;
    x = Math.imul(x, 0x7feb352d);
    x ^= x >>> 15;
    x = Math.imul(x, 0x846ca68b);
    x ^= x >>> 16;
    return x >>> 0;
}
const CONTENT_FACTION_RANK_ORDER = {
    outerDisciple: 0, innerDisciple: 1, coreDisciple: 2, elder: 3, leader: 4,
};
export class SimulationSession {
    registry;
    world;
    entityDefinitions;
    profile;
    rootSeed;
    stateValue;
    actionIndexValue;
    historyValue = new EventHistory();
    dungeonEngine = new DungeonEngine();
    tribulationEngine = new TribulationEngine();
    settlementEngine = new LifeSettlementEngine();
    professionEngine = new ProfessionEngine();
    metaValue;
    currentLifeValue;
    constructor(registry, world, entityDefinitions, profile, rootSeed, initialState, actionIndex = 0, history = [], meta = createMetaProgressState(), currentLife) {
        this.registry = registry;
        this.world = world;
        this.entityDefinitions = entityDefinitions;
        this.profile = profile;
        this.rootSeed = rootSeed;
        this.stateValue = cloneAdventureState(initialState);
        this.stateValue.cultivation = cleanCultivationStateV140(this.stateValue.cultivation);
        this.stateValue.realm = { realmId:this.stateValue.realm.realmId, maxRealmOrder:this.stateValue.realm.maxRealmOrder };
        // V88 save migration is part of session load, not a read-side effect. This keeps snapshots/read DTOs immutable.
        const collectionV88 = ensureCollectionProgressStateV12316(this.stateValue);
        ensureCollectionEconomyV12325(collectionV88);
        this.actionIndexValue = actionIndex;
        this.historyValue.appendMany(history);
        this.metaValue = cloneMetaProgressState(meta);
        this.metaValue.reincarnationProgress = cloneReincarnationProgressStateV1102(this.metaValue.reincarnationProgress);
        this.metaValue.reincarnation.xp = this.metaValue.reincarnationProgress.tree.lifetimePointsEarned;
        this.metaValue.reincarnation.sealLevel = reincarnationSealLevel(this.metaValue.reincarnationProgress.tree.lifetimePointsEarned);
        ensureAlchemyV112State(this.stateValue.economy);
        this.metaValue.reincarnationProgress.alchemyPermanentStats = { ...emptyAlchemyAllocation(), ...(this.metaValue.reincarnationProgress.alchemyPermanentStats ?? {}) };
        this.metaValue.reincarnationProgress.alchemyLegacy = cloneAlchemyLegacy(this.metaValue.reincarnationProgress.alchemyLegacy);
        syncReincarnationTalentsToOrigins(this.stateValue.inheritedOrigins, this.metaValue.talents);
        syncV127TreeDerivedState(this.stateValue, this.metaValue);
        if (this.stateValue.realm.maxRealmOrder < 46) {
            const alchemyLife = ensureAlchemyV112State(this.stateValue.economy).life;
            const canonicalCap = effectiveMortalLifespanCapV127(this.stateValue.realm.maxRealmOrder, this.stateValue.inheritedOrigins);
            this.stateValue.lifespanYears = Math.max(this.stateValue.ageYears, canonicalCap + Math.max(0, Number(alchemyLife?.lifespanPillBonusYears) || 0));
        }
        this.currentLifeValue = cloneCurrentLifeMeta(currentLife ?? createInitialLifeMetaForCharacter(rootSeed, this.stateValue, registry));
        if (!this.currentLifeValue.activeFateId) this.currentLifeValue.activeFateId = this.metaValue.reincarnationProgress.fateBuild.activeFateId;
        this.syncCurrentLifeFateRuntimeV4();
        const rp = this.metaValue.reincarnationProgress;
        const lifePotentialPct = nodeModifierValue(rp.tree, 'cultivation.lifePotentialGainPct');
        const core = this.stateValue.character.corePotential ?? { life: undefined, permanent: { power: 0, body: 0, defense: 0 } };
        this.stateValue.character.corePotential = { life: ensureLifePotentialForRealm(core.life, this.stateValue.realm.maxRealmOrder, lifePotentialPct), permanent: { ...rp.permanentPotential.allocations } };
        // V144 compatibility: preserve migrated raw save fields, but legacy Công Pháp/manual restoration is inert; only V127 manuals are live progression.
        const v125Foundation = cloneBuildFoundationV113(this.stateValue.character.buildFoundation, this.stateValue.character.spiritualRootId);
        this.stateValue.character.buildFoundation = v125Foundation;
        // V145 migration is committed at session load so reads stay side-effect free afterward.
        settleLegacySpiritualRootMigrationV145(this.stateValue.character, this.stateValue.inventory);
        const v125Progression = v125Foundation.progressionV125;
        retroactiveSkillPointsForRealmV125(this.stateValue.character, this.stateValue.realm.maxRealmOrder);
        syncDaoNatureTierUnlocksV125(this.stateValue.character, this.stateValue.realm.maxRealmOrder);
        writeBirthModifiersToOrigins(this.stateValue.inheritedOrigins, this.currentLifeValue.birth);
        this.stateValue.endlessHunt = cloneEndlessHuntState(this.stateValue.endlessHunt ?? createEndlessHuntState());
        if (this.stateValue.realm.maxRealmOrder >= 1) {
            const currentMajor = majorRealmIndexForRealmOrder(this.stateValue.realm.maxRealmOrder);
            ensureMajorHuntMapUnlocked(this.stateValue.endlessHunt, currentMajor);
            if (majorRealmIndexForMapFloor(this.stateValue.endlessHunt.selectedFloor) > currentMajor || !isEndlessHuntFloorUnlocked(this.stateValue.endlessHunt, this.stateValue.endlessHunt.selectedFloor))
                this.stateValue.endlessHunt.selectedFloor = mapStartFloorForRealm(this.stateValue.realm.maxRealmOrder);
        }
        const initialHuntMap = realmMapDefinitionForFloor(this.stateValue.endlessHunt.selectedFloor);
        ensureEndlessHuntMonster(this.stateValue.endlessHunt, mixSeed(this.rootSeed ^ 0x1b873593, this.actionIndexValue + 1), Math.max(0, this.currentLifeValue.birth.luck + birthLuckFlatFromOrigins(this.stateValue.inheritedOrigins)), birthLootMultiplierFromOrigins(this.stateValue.inheritedOrigins), initialHuntMap.gradeWeights, initialHuntMap.localFloor, initialHuntMap.elementPool, initialHuntMap.maxMonsterElements);
        this.stateValue.orthodoxy = cloneOrthodoxyState(this.stateValue.orthodoxy ?? createOrthodoxyState(this.stateValue.worldTimeYears));
        this.stateValue.genesisWorlds = cloneGenesisWorldState(this.stateValue.genesisWorlds ?? createGenesisWorldState(this.stateValue.worldTimeYears));
        this.stateValue.ascendants = cloneOuterAscendantState(this.stateValue.ascendants ?? createOuterAscendantState(this.stateValue.worldTimeYears));
        for (const definition of Object.values(this.world.factions ?? {})) {
            if (!definition.doctrineTags.includes('ImmortalOrthodoxy'))
                continue;
            const runtime = this.stateValue.factions.factions[definition.id];
            if (!runtime)
                continue;
            const authority = Math.max(55, Math.min(100, runtime.prestige / 12));
            elevateOrthodoxy(this.stateValue.orthodoxy, this.stateValue.factions, definition.id, this.stateValue.worldTimeYears, authority, authority);
        }
        this.ensureCombatLoadout();
        unlockEligibleProfessionRecipes(this.stateValue.professions, this.registry);
        this.ensureLifeParents();
        this.stateValue.flow = clonePlayerFlowState(this.stateValue.flow);
        synchronizeDaoForRealm(this.stateValue.dao, this.stateValue.realm.maxRealmOrder);
        synchronizeImmortalForRealm(this.stateValue.immortal, this.stateValue.realm.maxRealmOrder, 0);
        this.syncLootDungeonUnlocksV122();
        this.syncResourcePveUnlocksV12329();
        this.syncSpecializationProgressionV125();
        this.syncReincarnationMemories();
    }
    syncLootDungeonUnlocksV122() {
        for (const dungeonId of lootDungeonIdsForRealmV122(this.stateValue.realm.maxRealmOrder)) {
            if (!this.stateValue.dungeons.unlockedDungeonIds.includes(dungeonId))
                this.stateValue.dungeons.unlockedDungeonIds.push(dungeonId);
        }
    }
    syncResourcePveUnlocksV12329() {
        for (const def of RESOURCE_PVE_DUNGEONS_V12329) {
            if (this.world.dungeons[def.id] && !this.stateValue.dungeons.unlockedDungeonIds.includes(def.id))
                this.stateValue.dungeons.unlockedDungeonIds.push(def.id);
        }
    }
    syncSpecializationProgressionV125() {
        if (this.stateValue.realm.maxRealmOrder >= 10 && this.world.dungeons[V125_DAO_NATURE_DUNGEON_ID] && !this.stateValue.dungeons.unlockedDungeonIds.includes(V125_DAO_NATURE_DUNGEON_ID))
            this.stateValue.dungeons.unlockedDungeonIds.push(V125_DAO_NATURE_DUNGEON_ID);
        syncDaoNatureTierUnlocksV125(this.stateValue.character, this.stateValue.realm.maxRealmOrder);
        syncBattleDaoV2ProgressionV78(this.stateValue.character, this.stateValue.realm.maxRealmOrder);
        // v1.25 compatibility: stale save/loadout IDs may remember skills from another Dao. They remain knowledge but are dormant this life.
        const allSkills = [...this.registry.skills.values()];
        const allowed = new Set(this.stateValue.character.activeSkillIds.filter(id => {
            if (id.startsWith('skill.class.') || !this.registry.skills.has(id))
                return false;
            const skill = this.registry.skill(id);
            if (!isBattleDaoSkillV125(skill))
                return true;
            try {
                validateBattleDaoSkillUseV125(this.stateValue.character, skill, this.stateValue.realm.maxRealmOrder, allSkills);
                return true;
            }
            catch {
                return false;
            }
        }));
        this.stateValue.character.activeSkillIds = this.stateValue.character.activeSkillIds.filter(id => allowed.has(id));
        if (this.stateValue.character.buildFoundation?.battleDao?.committed && this.stateValue.character.buildFoundation?.progressionV125?.daoNatureCommitted)
            syncCanonicalBattleDaoLoadoutV125(this.stateValue.character, this.stateValue.character.activeSkillIds);
        if (this.stateValue.character.combatAiProfile)
            this.stateValue.character.combatAiProfile = { ...this.stateValue.character.combatAiProfile, rules: this.stateValue.character.combatAiProfile.rules.filter(rule => allowed.has(rule.skillId)) };
        this.consumeDaoNatureCultivationInventoryV125();
    }
    consumeDaoNatureCultivationInventoryV125() {
        const foundation = cloneBuildFoundationV113(this.stateValue.character.buildFoundation, this.stateValue.character.spiritualRootId);
        if (!foundation.progressionV125?.daoNatureCommitted)
            return { xp: 0, points: 0 };
        let xp = 0, points = 0;
        for (const [tierId, resourceId] of Object.entries(V125_DAO_NATURE_TIER_RESOURCE_IDS)) {
            const amount = Math.max(0, this.stateValue.inventory[resourceId] ?? 0);
            if (amount <= 0)
                continue;
            this.stateValue.inventory[resourceId] = 0;
            const tierIndex = Object.keys(V125_DAO_NATURE_TIER_RESOURCE_IDS).indexOf(tierId);
            const firstClearDone = tierIndex >= 0 && isDungeonFloorCleared(this.stateValue.dungeons, V125_DAO_NATURE_DUNGEON_ID, tierIndex + 1);
            const r = addDaoNatureCultivationXpV125(this.stateValue.character, tierId, amount, firstClearDone ? 20 : 16);
            xp += r.xpGain;
            points += r.pointGain;
        }
        return { xp, points };
    }
    get state() {
        return cloneAdventureState(this.stateValue);
    }
    /** V127 standalone/live commit authority. Never mutate `session.state`: that getter is a clone. */

    get actionIndex() {
        return this.actionIndexValue;
    }
    get meta() {
        return cloneMetaProgressState(this.metaValue);
    }
    get currentLife() {
        return cloneCurrentLifeMeta(this.currentLifeValue);
    }
    integrationSummary() {
        return deriveIntegrationSummary(this.stateValue.realm, this.stateValue.cultivation, this.stateValue.soul, this.stateValue.dao, this.stateValue.artifacts);
    }
    fateEmbryoSummary() {
        return { schema: 'fate-embryo.retired.v4', retired: true, message: 'Mệnh Thai đã được loại khỏi gameplay Luân Hồi V4.' };
    }
    syncReincarnationMemories() {
        const inheritance = this.currentLifeValue.reincarnation;
        if (!inheritance)
            return [];
        const unlocked = [];
        const selectedSeed = inheritance.selectedDaoSeedId ? this.metaValue.reincarnation.daoSeeds.find(x => x.id === inheritance.selectedDaoSeedId) : undefined;
        for (const fragment of inheritance.memoryFragments) {
            if (fragment.unlocked || this.stateValue.realm.maxRealmOrder < fragment.unlockRealmOrder)
                continue;
            if (fragment.type === 'technique' && fragment.payloadId) {
                try {
                    this.registry.technique(fragment.payloadId);
                    learnTechnique(this.stateValue.character, fragment.payloadId, 12 + Math.min(18, this.metaValue.reincarnation.sealLevel * 2));
                }
                catch {
                    continue;
                }
            }
            else if (fragment.type === 'dao' && fragment.payloadId) {
                if (!this.stateValue.dao.awakened)
                    continue;
                try {
                    const def = this.registry.dao(fragment.payloadId);
                    const strength = selectedSeed?.daoId === fragment.payloadId ? selectedSeed.strength : 20;
                    discoverDao(this.stateValue.dao, def, Math.max(8, strength * 0.45));
                }
                catch {
                    continue;
                }
            }
            else if (fragment.type === 'karma' && fragment.payloadId) {
                const relation = playerNpcRelationship(this.stateValue.worldSimulation, this.currentLifeValue.lifeId, fragment.payloadId, this.stateValue.worldTimeYears);
                relation.karmaDepth = Math.max(relation.karmaDepth, 6 + this.metaValue.reincarnation.sealLevel);
                if (!relation.flags.includes('MemoryAwakened'))
                    relation.flags.push('MemoryAwakened');
            }
            fragment.unlocked = true;
            const event = { id: `reincarnation.memory.${this.currentLifeValue.lifeId}.${fragment.id}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'system', significance: 18 + fragment.unlockRealmOrder, message: `Ký ức tiền kiếp thức tỉnh: ${fragment.title}.`, locationId: this.stateValue.locationId, tags: ['Reincarnation', 'PastLifeMemory', fragment.type], data: { unlockRealmOrder: fragment.unlockRealmOrder, payloadId: fragment.payloadId ?? '' } };
            this.historyValue.append(event);
            unlocked.push(event);
        }
        return unlocked;
    }
    reincarnationBirthSeed(nextLifeNumber, candidate) {
        // Deliberately independent of actionIndex: reopening the preview cannot reroll fate for free.
        return mixSeed(this.rootSeed ^ 0x5f3759df, nextLifeNumber * 1009 + Math.max(1, Math.floor(candidate)) * 65537);
    }
    previewReincarnationBirths() {
        const count = birthPreviewCountForSeal(this.metaValue.reincarnation.sealLevel);
        const nextLifeNumber = this.currentLifeValue.lifeNumber + 1;
        return Array.from({ length: count }, (_, index) => {
            const candidate = index + 1;
            const seed = this.reincarnationBirthSeed(nextLifeNumber, candidate);
            return { candidate, ...carryPersistentBirthOrigins(rollBirth(seed, 0, {}, this.metaValue.reincarnation.sealLevel, talentRank(this.metaValue.talents, 'birth.resonance')), this.currentLifeValue.birth) };
        });
    }
    syncModernBirthOrigins() {
        const birth = this.currentLifeValue.birth;
        const bundle = birth.originsV101;
        if (bundle) {
            birth.spiritualRoot = bundle.spiritualRoot.name;
            birth.spiritualRootId = bundle.spiritualRoot.legacyRootId;
            birth.physique = bundle.physique.band === 'NONE' ? undefined : bundle.physique.name;
            birth.physiqueId = bundle.physique.legacyPhysiqueId;
            birth.bloodline = bundle.bloodline.band === 'NONE' ? undefined : bundle.bloodline.name;
            birth.bloodlineId = bundle.bloodline.legacyBloodlineId;
            birth.bloodlinePurity = bundle.bloodline.band === 'NONE' ? undefined : bundle.bloodline.purity;
            this.stateValue.character.spiritualRootId = birth.spiritualRootId;
            this.stateValue.character.physiqueIds = birth.physiqueId ? [birth.physiqueId] : [];
            this.stateValue.character.bloodlines = birth.bloodlineId ? [{ id: birth.bloodlineId, purity: birth.bloodlinePurity ?? 0, awakened: false }] : [];
        }
        writeBirthModifiersToOrigins(this.stateValue.inheritedOrigins, birth);
    }
    originProgressionSummary() {
        const bundle = this.currentLifeValue.birth.originsV101;
        if (!bundle)
            return undefined;
        const bloodlineFacilityLevel = caveFacilityLevelV99(this.stateValue.collectionV12316, 'bloodline'), physiqueFacilityLevel = caveFacilityLevelV99(this.stateValue.collectionV12316, 'physique');
        const bloodlineCostMultiplier = caveFacilityCostMultiplierV99(this.stateValue.collectionV12316, 'bloodline'), physiqueCostMultiplier = caveFacilityCostMultiplierV99(this.stateValue.collectionV12316, 'physique');
        return {
            bloodline: { ...bloodlineProgressSummary(bundle, this.stateValue.realm.maxRealmOrder, this.stateValue.inventory, bloodlineCostMultiplier), facilityLevel: bloodlineFacilityLevel, facilityDiscountPct: caveFacilityDiscountPctV99(this.stateValue.collectionV12316, 'bloodline') },
            physique: { ...physiqueProgressSummary(bundle, this.stateValue.realm.maxRealmOrder, this.stateValue.inventory, physiqueCostMultiplier), facilityLevel: physiqueFacilityLevel, facilityDiscountPct: caveFacilityDiscountPctV99(this.stateValue.collectionV12316, 'physique') },
            resources: { bloodlineEssence: this.stateValue.inventory[BLOODLINE_ESSENCE_RESOURCE_ID] ?? 0, bodyEssence: this.stateValue.inventory[BODY_ESSENCE_RESOURCE_ID] ?? 0, protection: this.stateValue.inventory[BLOODLINE_PROTECTION_RESOURCE_ID] ?? 0 },
            fate: cloneFateRuntimeState(this.currentLifeValue.fateRuntime),
        };
    }
    nourishBloodline(points = 10) {
        if (!this.stateValue.alive)
            throw new Error('Đời hiện tại đã kết thúc; chỉ được chỉnh build để chuẩn bị Luân Hồi.');
        const bundle = this.currentLifeValue.birth.originsV101;
        if (!bundle)
            throw new Error('Save cũ chưa có hệ Huyết Mạch v1.02.');
        const report = purifyBloodline(bundle, this.stateValue.inventory, points, caveFacilityCostMultiplierV99(this.stateValue.collectionV12316, 'bloodline'));
        syncOriginCollectionV12326(ensureCollectionProgressStateV12316(this.stateValue), bundle);
        this.syncModernBirthOrigins();
        this.actionIndexValue += 1;
        return { ...report, summary: `[Huyết Mạch · ${bundle.bloodline.name}] Độ Thuần +${report.points}% → ${report.purity}%${report.incompatibilityPct > 0 ? ` · Dị Huyết Bất Dung -${report.incompatibilityPct.toFixed(0)}%` : ''}.` };
    }
    advanceBloodline(useProtection = false) {
        if (!this.stateValue.alive)
            throw new Error('Đời hiện tại đã kết thúc; không thể tiếp tục tiến triển Huyết Mạch.');
        const bundle = this.currentLifeValue.birth.originsV101;
        if (!bundle)
            throw new Error('Save cũ chưa có hệ Huyết Mạch v1.02.');
        const rng = new SeededRng(mixSeed(this.rootSeed ^ 0x73a91f2d, this.actionIndexValue + 1));
        const report = advanceBloodlineGrade(bundle, this.stateValue.realm.maxRealmOrder, this.stateValue.inventory, this.stateValue, rng, useProtection, caveFacilityCostMultiplierV99(this.stateValue.collectionV12316, 'bloodline'));
        syncOriginCollectionV12326(ensureCollectionProgressStateV12316(this.stateValue), bundle);
        this.syncModernBirthOrigins();
        this.actionIndexValue += 1;
        const line = `[Huyết Mạch · ${bundle.bloodline.name}] Thăng phẩm → ${report.grade}${report.backlash ? ' · PHẢN PHỆ!' : ' · ổn định'}${report.protectionCost ? ` · bảo hộ ${report.protectionCost}` : ''}.`;
        this.historyValue.append({ id: `bloodline.advance.${this.currentLifeValue.lifeId}.${this.actionIndexValue}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'system', significance: report.grade === 'Cực' || report.grade === 'Phá' ? 30 : 14, message: line, locationId: this.stateValue.locationId, tags: ['Bloodline', 'Advance', report.grade, report.backlash ? 'Backlash' : 'Stable'], data: { grade: report.grade, backlash: report.backlash, backlashChancePct: report.backlashChancePct } });
        return { ...report, summary: line };
    }
    advancePhysique() {
        if (!this.stateValue.alive)
            throw new Error('Đời hiện tại đã kết thúc; không thể tiếp tục tiến triển Thể Chất.');
        const bundle = this.currentLifeValue.birth.originsV101;
        if (!bundle)
            throw new Error('Save cũ chưa có hệ Thể Chất v1.02.');
        const report = progressPhysique(bundle, this.stateValue.realm.maxRealmOrder, this.stateValue.inventory, caveFacilityCostMultiplierV99(this.stateValue.collectionV12316, 'physique'));
        syncOriginCollectionV12326(ensureCollectionProgressStateV12316(this.stateValue), bundle);
        this.syncModernBirthOrigins();
        this.actionIndexValue += 1;
        const line = `[Thể Chất · ${bundle.physique.name}] ${report.stage} · tiêu hao ${report.cost} Thể Phách Tinh Hoa.`;
        this.historyValue.append({ id: `physique.advance.${this.currentLifeValue.lifeId}.${this.actionIndexValue}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'system', significance: report.stage === 'Viên Mãn' ? 28 : 12, message: line, locationId: this.stateValue.locationId, tags: ['Physique', 'Advance', report.stage] });
        return { ...report, summary: line };
    }
    swapCurrentBloodline(targetId) { if (!this.stateValue.alive)
        throw new Error('Đời hiện tại đã kết thúc; không thể Hoán Huyết sau khi tử vong.'); const bundle = this.currentLifeValue.birth.originsV101; if (!bundle)
        throw new Error('Save cũ chưa có Huyết Mạch hiện đại.'); const result = swapBloodline(bundle, targetId, this.stateValue.inventory); syncOriginCollectionV12326(ensureCollectionProgressStateV12316(this.stateValue), bundle); this.currentLifeValue.birth.bloodline = result.name; this.currentLifeValue.birth.bloodlineId = result.legacyBloodlineId; this.currentLifeValue.birth.bloodlinePurity = 0; this.syncModernBirthOrigins(); this.actionIndexValue += 1; return { bloodline: structuredClone(result), summary: `[Huyết Mạch · Hoán Huyết] ${result.name} · ${result.grade} 0% · Dị Huyết Bất Dung -35%.` }; }
    implantCurrentBloodline(targetId) { if (!this.stateValue.alive)
        throw new Error('Đời hiện tại đã kết thúc; không thể Tạo Huyết sau khi tử vong.'); const bundle = this.currentLifeValue.birth.originsV101; if (!bundle)
        throw new Error('Save cũ chưa có Huyết Mạch hiện đại.'); const result = implantBloodline(bundle, targetId, this.stateValue.inventory); syncOriginCollectionV12326(ensureCollectionProgressStateV12316(this.stateValue), bundle); this.currentLifeValue.birth.bloodline = result.name; this.currentLifeValue.birth.bloodlineId = result.legacyBloodlineId; this.currentLifeValue.birth.bloodlinePurity = 0; this.syncModernBirthOrigins(); this.actionIndexValue += 1; return { bloodline: structuredClone(result), summary: `[Huyết Mạch · Tạo Huyết] ${result.name} · Phàm 0% · Nghịch Huyết Bất Dung -50%.` }; }
    potentialSummary() { return { ...this.lifePotentialSummary(), schema: 'potential.v127', legacySixAxisRetired: true }; }
    spendPotential(id, points = 1) { return this.spendLifePotential(id, points); }
    lifePotentialSummary() {
        const core = this.stateValue.character.corePotential;
        return {
            schema: 'life-potential.v1102', ...structuredClone(core.life), earned: core.life.lifetimeEarned,
            definitions: corePotentialDefinitions.map(x => ({ ...x, perPoint: [...x.perPoint] })),
            permanentApplied: { ...core.permanent }, statRule: '1 điểm = +1 Công Lực / +1 Thể Phách / +3 Phòng Ngự',
        };
    }
    spendLifePotential(id, points = 1) {
        const core = this.stateValue.character.corePotential;
        core.life = spendLifeCorePotential(core.life, id, points);
        this.actionIndexValue += 1;
        return this.lifePotentialSummary();
    }
    permanentPotentialSummary() {
        const rp = this.metaValue.reincarnationProgress;
        return { schema: 'reincarnation-permanent-potential.v1102', ...structuredClone(rp.permanentPotential), statRule: '1 điểm = +1 Công Lực / +1 Thể Phách / +3 Phòng Ngự' };
    }
    spendPermanentPotential(id, points = 1) {
        const rp = this.metaValue.reincarnationProgress;
        rp.permanentPotential = spendPermanentCorePotential(rp.permanentPotential, id, points);
        this.stateValue.character.corePotential.permanent = { ...rp.permanentPotential.allocations };
        this.actionIndexValue += 1;
        return this.permanentPotentialSummary();
    }
    reincarnationProgressSummary(nowUnixMs = Date.now()) {
        const rp = this.metaValue.reincarnationProgress;
        const energy = rechargeReincarnationEnergy(rp.energy, nowUnixMs);
        const depth = depthInfoForRealmOrder(this.stateValue.realm.maxRealmOrder);
        const availablePoints = availableTreePoints(rp.tree);
        const nodes = starterReincarnationTreeNodes.map(x => {
            const rank = Math.max(0, Math.floor(rp.tree.ranks[x.id] ?? 0));
            const nextCost = rank >= x.maxRank ? undefined : rankCost(rank + 1, x.costClass, x.id);
            const requiredInvestment = REINCARNATION_TREE_TIER_INVESTMENT[Math.min(x.tier, REINCARNATION_TREE_TIER_INVESTMENT.length - 1)] ?? 0;
            const treeInvestment = totalTreeSpentPoints(rp.tree, x.treeId);
            const missingPrerequisites = (x.prerequisites ?? []).filter(req => (rp.tree.ranks[req.nodeId] ?? 0) < req.minRank).map(req => ({ ...req }));
            const structuralUnlocked = missingPrerequisites.length === 0;
            const lockReason = rank >= x.maxRank ? 'Đã đạt tối đa' : missingPrerequisites.length ? `Thiếu điều kiện ${missingPrerequisites.map(req => `${req.nodeId} ${req.minRank}/50`).join(', ')}` : undefined;
            return { ...x, rank, nextCost, structuralUnlocked, affordable: nextCost !== undefined && availablePoints >= nextCost, lockReason, milestoneBonus: { ...(x.milestoneBonus ?? {}) }, prerequisites: (x.prerequisites ?? []).map(y => ({ ...y })) };
        });
        const currentDepthReward = previewReincarnationV2Reward(this.reincarnationRewardArgsV4(nowUnixMs));
        return { schema: 'reincarnation-progression.v4', depth, currentDepthReward, energy: { ...energy, cap: 300, rechargePer24h: 100 }, tree: { lifetimePointsEarned: rp.tree.lifetimePointsEarned, sharedSpentPoints:rp.tree.sharedSpentPoints??0, availablePoints, maxAllPoints: totalTreeMaxCostV127()+FATE_BUILD_TOTAL_UNLOCK_COST_V4, ranks: { ...rp.tree.ranks }, highestAchievementTierByTree: { ...rp.tree.highestAchievementTierByTree }, nodes }, fateBuild:this.fateBuildSummaryV4(), permanentPotential: this.permanentPotentialSummary() };
    }
    spendReincarnationTreeNode(nodeId, ranks = 1) {
        if (this.stateValue.alive)
            throw new Error('Cây Luân Hồi chỉ được phân phối lại sau khi đời đã kết thúc, trước khi sang đời mới.');
        const rp = this.metaValue.reincarnationProgress;
        rp.tree = spendReincarnationTreeRank(rp.tree, nodeId, ranks);
        syncV127TreeDerivedState(this.stateValue, this.metaValue);
        this.actionIndexValue += 1;
        return this.reincarnationProgressSummary();
    }
    resetReincarnationTree() {
        if (this.stateValue.alive)
            throw new Error('Chỉ được reset Cây Luân Hồi giữa hai đời.');
        const rp = this.metaValue.reincarnationProgress;
        rp.tree = resetReincarnationTreeRanks(rp.tree);
        syncV127TreeDerivedState(this.stateValue, this.metaValue);
        this.actionIndexValue += 1;
        return this.reincarnationProgressSummary();
    }
    cultivationSummaryV140(nowUnixMs = Date.now()) {
        const order = this.stateValue.realm.maxRealmOrder;
        const realm = this.registry.realm(this.stateValue.realm.realmId);
        const row = cultivationRealmV140(order);
        const progress = cultivationProgressV140(this.stateValue, order);
        const rate = cultivationRateV140(this.stateValue, order);
        const bank = previewRetreatBankV140(this.stateValue.cultivation, nowUnixMs);
        const next = realm.nextRealmId ? this.registry.realm(realm.nextRealmId) : undefined;
        return {
            schema: 'cultivation.v140', realmId: realm.id, realm: realm.name, realmOrder: order, nextRealmId: next?.id, nextRealm: next?.name,
            tuVi: progress.tuVi, requiredTuVi: progress.requiredTuVi, progressPct: progress.progressPct,
            baseTuViPer15s: rate.baseTuViPer15s, finalTuViPer15s: rate.finalTuViPer15s, sources: rate.sources.map(x=>({...x})),
            etaRealSeconds: progress.ready || rate.finalTuViPer15s <= 0 ? 0 : Math.ceil((progress.requiredTuVi-progress.tuVi)/rate.finalTuViPer15s)*CULTIVATION_TICK_SECONDS_V140,
            ready: progress.ready, transition: !next ? 'complete' : isTribulationGateV140(order) ? 'tribulation' : isMajorRealmGateV140(order) ? 'ascend' : 'auto',
            injury: Math.max(0,Math.min(100,Number(this.stateValue.injury)||0)),
            retreat: { bankHours: bank.bankHours, capHours: RETREAT_BANK_CAP_HOURS_V140, dailyAccrualHours: RETREAT_DAILY_BANK_HOURS_V140, rewardPct3h: row.retreat3hProgressPct, rewardPctPerHour: row.retreat3hProgressPct/3 },
        };
    }
    applyRealmTransitionV140(nextRealmId, source = 'cultivation') {
        const current = this.registry.realm(this.stateValue.realm.realmId);
        const next = this.registry.realm(nextRealmId);
        const prevMajor = majorRealmIndexForRealmOrder(current.order);
        const nextMajor = majorRealmIndexForRealmOrder(next.order);
        this.stateValue.realm = { realmId: next.id, maxRealmOrder: next.order };
        this.stateValue.cultivation.tuVi = 0;
        const oldMajor=cultivationRealmV140(current.order).majorRealmIndex,newMajor=cultivationRealmV140(next.order).majorRealmIndex;
        if(newMajor>oldMajor){const momentum=Math.max(0,Math.min(20,reincarnationTreeRuntimeModifierV136(this.stateValue.inheritedOrigins,'cultivation.majorMomentumPct')));if(momentum>0){const nextRequired=effectiveCultivationRequiredTuViV140(this.stateValue,next.order);this.stateValue.cultivation.tuVi=Math.min(nextRequired,nextRequired*momentum/100);}}
        if (next.order < 46) {
            const alchemyLife = ensureAlchemyV112State(this.stateValue.economy).life;
            const nextCap = effectiveMortalLifespanCapV127(next.order, this.stateValue.inheritedOrigins) + Math.max(0, Number(alchemyLife?.lifespanPillBonusYears) || 0);
            this.stateValue.lifespanYears = Math.max(this.stateValue.lifespanYears, nextCap);
        }
        if (nextMajor > prevMajor) {
            relieveDaoSuyOnMajorAscensionV140(this.stateValue.immortal, current.order, next.order);
            recordProgressionBoundJadeV89(ensureCollectionProgressStateV12316(this.stateValue), `major-realm.${next.id}`, 60, `Thăng đại cảnh giới ${next.name}`);
        }
        const prevSlots = current.capabilities?.parallelDungeonSlots ?? 0;
        const nextSlots = next.capabilities?.parallelDungeonSlots ?? prevSlots;
        this.stateValue.dungeons.parallelWorkerCapacity += Math.max(0, nextSlots - prevSlots);
        for (const id of next.capabilities?.unlockDungeonIds ?? []) this.unlockDungeon(id);
        if (next.capabilities?.artifactSlots) this.stateValue.artifacts.activeCapacity = Math.max(this.stateValue.artifacts.activeCapacity, next.capabilities.artifactSlots);
        const hunt = this.stateValue.endlessHunt ?? (this.stateValue.endlessHunt = createEndlessHuntState());
        hunt.highestUnlockedFloor = Math.max(hunt.highestUnlockedFloor, mapFloorForRealmZone(next.order, 1));
        synchronizeSoulForRealm(this.stateValue.soul, next.order, this.stateValue.dungeons.parallelWorkerCapacity);
        synchronizeDaoForRealm(this.stateValue.dao, next.order);
        synchronizeImmortalForRealm(this.stateValue.immortal, next.order, 0);
        syncSoulDungeonWorkers(this.stateValue.soul, this.stateValue.dungeons, soulCloneAuthorityCapacityV127(next.order));
        rewardSkillPointsForRealmV125(this.stateValue.character, next.order);
        this.syncSpecializationProgressionV125();
        this.syncLootDungeonUnlocksV122();
        this.syncResourcePveUnlocksV12329();
        this.syncReincarnationMemories();
        const gainPct = nodeModifierValue(this.metaValue.reincarnationProgress.tree, 'cultivation.lifePotentialGainPct');
        const core = this.stateValue.character.corePotential ?? { life: undefined, permanent: { ...this.metaValue.reincarnationProgress.permanentPotential.allocations } };
        this.stateValue.character.corePotential = { life: ensureLifePotentialForRealm(core.life, next.order, gainPct), permanent: { ...this.metaValue.reincarnationProgress.permanentPotential.allocations } };
        const event = { id:`realm.advance.v140.${this.currentLifeValue.lifeId}.${this.actionIndexValue}.${next.order}`, worldTimeYears:this.stateValue.worldTimeYears, ageYears:this.stateValue.ageYears, type:'system', significance: nextMajor>prevMajor?38:18, message:`${source==='tribulation'?'Vượt kiếp':'Thăng cảnh'}: ${current.name} → ${next.name}.`, locationId:this.stateValue.locationId, tags:['RealmAdvance','CultivationV140',nextMajor>prevMajor?'MajorRealm':'MinorRealm'], data:{fromRealmId:current.id,toRealmId:next.id,source} };
        this.historyValue.append(event);
        return { current, next, event };
    }
    grantTuViV140(amount, source = 'reward') {
        let remaining = Math.max(0, Number(amount) || 0), gained = 0, transitions = [];
        while (remaining > 1e-9 && this.stateValue.alive) {
            const order = this.stateValue.realm.maxRealmOrder;
            const row = cultivationRealmV140(order);
            const required = effectiveCultivationRequiredTuViV140(this.stateValue, order);
            if (required <= 0) break;
            const before = Math.max(0, Number(this.stateValue.cultivation.tuVi) || 0);
            const missing = Math.max(0, required - before);
            if (missing > 0) { const add = Math.min(missing, remaining); this.stateValue.cultivation.tuVi = before + add; remaining -= add; gained += add; }
            if (this.stateValue.cultivation.tuVi + 1e-9 < required) break;
            const realm = this.registry.realm(this.stateValue.realm.realmId);
            if (!realm.nextRealmId || isTribulationGateV140(order) || isMajorRealmGateV140(order)) break;
            transitions.push(this.applyRealmTransitionV140(realm.nextRealmId, source));
            if(source==='self-cultivation'){
                const rt=ensureCultivationRuntimeR3(this.stateValue.cultivation);
                const chance=Math.max(0,Math.min(5,reincarnationTreeRuntimeModifierV136(this.stateValue.inheritedOrigins,'cultivation.skipOldStageChancePct')));
                const nowOrder=this.stateValue.realm.maxRealmOrder;
                if(chance>0 && isOldRealmSkipEligibleR3(this.stateValue,nowOrder,CULTIVATION_REALMS_V140)){
                    rt.skipRolls+=1; const rng=new SeededRng(mixSeed(this.rootSeed ^ 0x6137ac91,rt.skipRolls*131+rt.selfTicks));
                    if(rng.chance(chance)){ const nowRealm=this.registry.realm(this.stateValue.realm.realmId); if(nowRealm.nextRealmId){transitions.push(this.applyRealmTransitionV140(nowRealm.nextRealmId,'reincarnation-skip-old-stage'));} }
                }
            }
        }
        return { gained, unused: remaining, transitions, summary: this.cultivationSummaryV140() };
    }
    advanceRealtimeCultivationV140(realSeconds, extraSelfCultivationPctV4 = 0) {
        if (!this.stateValue.alive) return { realSeconds:0, gained:0, ticks:0, transitions:[], summary:this.cultivationSummaryV140() };
        const seconds = Math.max(0, Number(realSeconds) || 0);
        const total = Math.max(0, Number(this.stateValue.cultivation.commitRemainderSeconds)||0) + seconds;
        let ticks = Math.floor(total / CULTIVATION_TICK_SECONDS_V140);
        this.stateValue.cultivation.commitRemainderSeconds = total - ticks * CULTIVATION_TICK_SECONDS_V140;
        let gained=0,usedTicks=0; const transitions=[]; const rt=ensureCultivationRuntimeR3(this.stateValue.cultivation);
        while(ticks>0&&this.stateValue.alive){
            const order=this.stateValue.realm.maxRealmOrder,required=effectiveCultivationRequiredTuViV140(this.stateValue,order);
            if(required<=0)break;
            if((Number(this.stateValue.cultivation.tuVi)||0)+1e-9>=required && (isTribulationGateV140(order)||isMajorRealmGateV140(order)))break;
            const baseRate=cultivationRateV140(this.stateValue,order).finalTuViPer15s; const rate=Math.max(0,Math.round(baseRate*(1+Math.max(0,Number(extraSelfCultivationPctV4)||0)/100))); if(rate<=0)break;
            rt.selfTicks+=1; rt.heavenRewardProgressTicks+=1;
            const lingRank=cultivationR3Rank(this.stateValue,'cultivation.lingGuangRank');
            const rng=new SeededRng(mixSeed(this.rootSeed ^ 0x1a91f00d,rt.selfTicks*131+order*17));
            const ling=rollLingGuangMultiplierR3(lingRank,rng);
            if(ling>1){rt.lastLingGuangMultiplier=ling;rt.lastLingGuangTick=rt.selfTicks;}
            let tickGain=rate*ling;
            const heaven=heavenRewardProfileR3(cultivationR3Rank(this.stateValue,'cultivation.heavenRewardRank'));
            if(Number.isFinite(heaven.thresholdTicks)&&rt.heavenRewardProgressTicks>=heaven.thresholdTicks){rt.heavenRewardProgressTicks-=heaven.thresholdTicks;tickGain+=rate*heaven.bonusTicks;}
            const grant=this.grantTuViV140(tickGain,'self-cultivation'); gained+=grant.gained; transitions.push(...grant.transitions);
            ticks-=1; usedTicks+=1;
            const afterOrder=this.stateValue.realm.maxRealmOrder,afterReq=effectiveCultivationRequiredTuViV140(this.stateValue,afterOrder);
            if(afterReq>0&&(Number(this.stateValue.cultivation.tuVi)||0)+1e-9>=afterReq&&(isTribulationGateV140(afterOrder)||isMajorRealmGateV140(afterOrder)))break;
        }
        const worldYears = seconds * WORLD_YEARS_PER_REAL_SECOND;
        if (worldYears > 0) {
            this.stateValue.worldTimeYears += worldYears; this.stateValue.ageYears += worldYears;
            advanceDaoSuyByWorldYearsV127(this.stateValue.immortal, this.stateValue.realm.maxRealmOrder, worldYears, this.stateValue.inheritedOrigins);
            const cultivationTalents = cultivationTalentBonuses(this.stateValue.inheritedOrigins);
            applyNaturalInjuryRecovery(this.stateValue, seconds, cultivationTalents.injuryRecoveryPct);
            this.applyNaturalDeathToState(mixSeed(this.rootSeed ^ 0x140140, this.actionIndexValue));
        }
        if (seconds>0) this.actionIndexValue += 1;
        return { realSeconds:seconds, worldYears, gained, ticks:usedTicks, transitions:transitions.map(x=>({from:x.current.name,to:x.next.name})), lingGuang:{lastMultiplier:rt.lastLingGuangMultiplier,lastTick:rt.lastLingGuangTick}, summary:this.cultivationSummaryV140() };
    }
    instantRetreatV140(realHours = 3, nowUnixMs = Date.now()) {
        if (!this.stateValue.alive) throw new Error('Đời hiện tại đã kết thúc.');
        const bank=commitRetreatBankV140(this.stateValue.cultivation, nowUnixMs);
        const order=this.stateValue.realm.maxRealmOrder,row=cultivationRealmV140(order),required=effectiveCultivationRequiredTuViV140(this.stateValue,order);
        if(required<=0) throw new Error('Cảnh giới đã viên mãn cuối cùng.');
        const requested=Math.max(0,Math.min(Number(realHours)||0,this.stateValue.cultivation.retreatBankHours)); if(requested<=0)throw new Error('Không còn giờ Bế Quan khả dụng.');
        const injury=Math.max(0,Math.min(100,Number(this.stateValue.injury)||0)); if(injury>60)throw new Error('Thương Thế trên 60/100: cần trị thương trước khi Bế Quan.');
        const injuryMultiplier=injury>40?0.75:injury>20?0.90:1; const retreatTalentPct=cultivationTalentBonuses(this.stateValue.inheritedOrigins).retreatGainPct;
        const fateRetreatPct=Math.max(0,Number(this.stateValue.character?.fateModifiersV4?.retreatPct)||0);
        const basePerHour=required*(row.retreat3hProgressPct/3)/100*injuryMultiplier*(1+retreatTalentPct/100)*(1+fateRetreatPct/100);
        const rt=ensureCultivationRuntimeR3(this.stateValue.cultivation),dayKey=bank.dayKey; if(rt.retreatRefundDayKey!==dayKey){rt.retreatRefundDayKey=dayKey;rt.retreatRefundedHours=0;}
        const insightRank=cultivationR3Rank(this.stateValue,'cultivation.retreatInsightRank'),refundRank=cultivationR3Rank(this.stateValue,'cultivation.retreatRefundRank');
        let remaining=requested,hoursUsed=0,totalGain=0,refunded=0; const insights=[];
        while(remaining>1e-9){let slice=Math.min(1,remaining);const seedBase=Math.floor(rt.selfTicks+this.actionIndexValue*97+hoursUsed*1000),rng=new SeededRng(mixSeed(this.rootSeed ^ 0x8e71a251,seedBase));const mult=rollRetreatInsightMultiplierR3(insightRank,rng);const before=Number(this.stateValue.cultivation.tuVi)||0,missing=Math.max(0,effectiveCultivationRequiredTuViV140(this.stateValue,this.stateValue.realm.maxRealmOrder)-before);if(missing<=1e-9)break;slice=Math.min(slice,basePerHour*mult>0?missing/(basePerHour*mult):0);if(slice<=1e-9)break;const grant=this.grantTuViV140(Math.min(missing,basePerHour*slice*mult),'retreat');totalGain+=grant.gained;hoursUsed+=slice;remaining-=slice;if(mult>1)insights.push(mult);if(this.stateValue.realm.maxRealmOrder!==order)break;const rp=retreatRefundProfileR3(refundRank),rr=new SeededRng(mixSeed(this.rootSeed ^ 0x41ef75a3,seedBase+31));if(rt.retreatRefundedHours<1&&rr.chance(rp.chancePct*slice)){const add=Math.min(rp.hours,1-rt.retreatRefundedHours);refunded+=add;rt.retreatRefundedHours+=add;}}
        this.stateValue.cultivation.retreatBankHours=Math.max(0,Math.min(RETREAT_BANK_CAP_HOURS_V140,this.stateValue.cultivation.retreatBankHours-hoursUsed+refunded));
        const event={id:`retreat.v140.${this.currentLifeValue.lifeId}.${this.actionIndexValue}`,worldTimeYears:this.stateValue.worldTimeYears,ageYears:this.stateValue.ageYears,type:'cultivation',significance:8,message:`Bế Quan ${hoursUsed.toFixed(2)}h · Tu Vi +${totalGain.toFixed(0)}${insights.length?` · Ngộ Đạo ×${Math.max(...insights).toFixed(2)}`:""}${refunded?` · hoàn ${Math.round(refunded*60)} phút`:""}.`,locationId:this.stateValue.locationId,tags:['Retreat','CultivationV140','ReincarnationCultivationR3'],data:{hoursUsed,gain:totalGain,refundedHours:refunded,insights,bankHoursAfter:this.stateValue.cultivation.retreatBankHours}};
        this.historyValue.append(event);this.actionIndexValue+=1;
        return {hoursUsed,gained:totalGain,refundedHours:refunded,insights,bankHoursAfter:this.stateValue.cultivation.retreatBankHours,event,summary:this.cultivationSummaryV140()};
    }
    ascendRealmV140() {
        if (!this.stateValue.alive) throw new Error('Đời hiện tại đã kết thúc.');
        const current=this.registry.realm(this.stateValue.realm.realmId), row=cultivationRealmV140(current.order);
        if (!current.nextRealmId) throw new Error('Đã đạt cảnh giới cuối cùng.');
        if (isTribulationGateV140(current.order)) throw new Error('Cửa này phải vượt Thiên Kiếp.');
        if (!isMajorRealmGateV140(current.order)) throw new Error('Tiểu cảnh được tự động thăng khi Tu Vi đầy.');
        const required=effectiveCultivationRequiredTuViV140(this.stateValue,current.order);
        if ((Number(this.stateValue.cultivation.tuVi)||0)+1e-9 < required) throw new Error(`Tu Vi chưa đủ: cần ${required.toFixed(0)}.`);
        if ((Number(this.stateValue.injury)||0) > 60) throw new Error('Thương Thế trên 60/100: cần trị thương trước khi Thăng Cảnh.');
        const result=this.applyRealmTransitionV140(current.nextRealmId,'ascend'); this.actionIndexValue+=1;
        return {fromRealmId:result.current.id,toRealmId:result.next.id,event:result.event,summary:this.cultivationSummaryV140()};
    }
    setCombatSkillActive(skillId, active) {
        if (skillId.startsWith('skill.class.'))
            throw new Error('Kỹ năng Tu Hệ cũ đã bị V19/V31 retire khỏi loadout.');
        if (!this.stateValue.character.knownSkillIds.includes(skillId))
            throw new Error('Chưa lĩnh ngộ kỹ năng này.');
        const skill = this.registry.skill(skillId);
        validateBattleDaoSkillUseV125(this.stateValue.character, skill, this.stateValue.realm.maxRealmOrder, [...this.registry.skills.values()]);
        const foundation = cloneBuildFoundationV113(this.stateValue.character.buildFoundation, this.stateValue.character.spiritualRootId);
        const committed = Boolean(foundation.battleDao.mainDaoId && foundation.battleDao.committed && foundation.progressionV125?.daoNatureCommitted);
        if (committed) {
            const activeSlotLimit = battleDaoV2ActiveSlotsUnlocked(this.stateValue.realm.maxRealmOrder, BATTLE_DAO_ACTIVE_LOADOUT_SLOTS_V125);
            const current = syncCanonicalBattleDaoLoadoutV125(this.stateValue.character, this.stateValue.character.activeSkillIds, activeSlotLimit);
            const mainBasic = `skill.dao.${foundation.battleDao.mainDaoId}.basic`;
            const slot = skill.runtimeV117?.slotClass ?? 'active';
            const has = current.combinedSkillIds.includes(skillId);
            if (slot === 'basic') {
                if (skillId !== mainBasic)
                    throw new Error('Ô Đánh Thường được khóa theo Chủ Đạo hiện tại; Basic của Phụ Đạo không chiếm ô này.');
                if (!active)
                    throw new Error('Đánh Thường Chủ Đạo luôn phải được giữ trong bộ chiến đấu.');
                return { activeSkillIds: [...current.combinedSkillIds], activeCount: current.combinedSkillIds.length, basicSkillId: current.basicSkillId, activeSlotCount: current.activeSkillIds.length, ultimateSkillId: current.ultimateSkillId };
            }
            if (active === has)
                return { activeSkillIds: [...current.combinedSkillIds], activeCount: current.combinedSkillIds.length, basicSkillId: current.basicSkillId, activeSlotCount: current.activeSkillIds.length, ultimateSkillId: current.ultimateSkillId };
            let candidate = [...current.combinedSkillIds];
            if (active) {
                if (slot === 'ultimate') {
                    candidate = candidate.filter(id => this.registry.skill(id).runtimeV117?.slotClass !== 'ultimate');
                    candidate.push(skillId);
                }
                else {
                    if (current.activeSkillIds.length >= activeSlotLimit)
                        throw new Error(`Cảnh giới hiện tại mới mở ${activeSlotLimit} ô Chủ Động; hãy tháo một kỹ năng trước.`);
                    candidate.push(skillId);
                }
            }
            else
                candidate = candidate.filter(id => id !== skillId);
            const next = syncCanonicalBattleDaoLoadoutV125(this.stateValue.character, candidate, activeSlotLimit);
            const auto = battleDaoAutoRotationV127(foundation.battleDao.mainDaoId, next.combinedSkillIds, foundation.battleDao.secondaryDaoId);
            setCombatLoadout(this.stateValue.character, next.combinedSkillIds, auto);
            this.actionIndexValue += 1;
            return { activeSkillIds: [...next.combinedSkillIds], activeCount: next.combinedSkillIds.length, basicSkillId: next.basicSkillId, activeSlotCount: next.activeSkillIds.length, ultimateSkillId: next.ultimateSkillId, aiProfile: this.stateValue.character.combatAiProfile?.name };
        }
        const current = [...this.stateValue.character.activeSkillIds];
        const has = current.includes(skillId);
        if (active === has)
            return { activeSkillIds: current, activeCount: current.length };
        let next = current;
        let rules = (this.stateValue.character.combatAiProfile?.rules ?? []).filter(rule => rule.skillId !== skillId && current.includes(rule.skillId));
        if (active) {
            if (current.length >= 6)
                throw new Error('Bộ chiến đấu trước Định Đạo tối đa 6 kỹ năng; hãy tháo một kỹ năng trước.');
            next = [...current, skillId];
            const tags = new Set(skill.tags);
            let priority = 65;
            let conditions = [{ type: 'always' }];
            if (tags.has('Defensive') || tags.has('Shield')) {
                priority = 104;
                conditions = [{ type: 'selfHpBelow', pct: 68 }];
            }
            else if (tags.has('Finisher')) {
                priority = 94;
                const mark = tags.has('Sword') ? 'Kiếm Ý' : tags.has('Martial') ? 'Liên Thế' : tags.has('Spell') ? 'Pháp Ấn' : undefined;
                conditions = mark ? [{ type: 'targetMarkAtLeast', mark, stacks: 3 }] : [{ type: 'always' }];
            }
            else if (tags.has('Setup'))
                priority = 82;
            rules.push({ skillId, priority, conditions });
        }
        else {
            next = current.filter(id => id !== skillId);
            if (next.length === 0)
                throw new Error('Phải giữ ít nhất một kỹ năng chiến đấu.');
            rules = rules.filter(rule => next.includes(rule.skillId));
        }
        setCombatLoadout(this.stateValue.character, next, { name: 'manual.skill.loadout', rules });
        this.actionIndexValue += 1;
        return { activeSkillIds: [...this.stateValue.character.activeSkillIds], activeCount: this.stateValue.character.activeSkillIds.length, aiProfile: this.stateValue.character.combatAiProfile?.name };
    }
    applyBattleDaoAutoRotationV127() {
        const foundation = cloneBuildFoundationV113(this.stateValue.character.buildFoundation, this.stateValue.character.spiritualRootId);
        const main = foundation.battleDao.mainDaoId;
        if (!main)
            throw new Error('Chưa Định Chủ Đạo nên chưa thể dựng rotation Bản Đạo tự động.');
        const active = [...this.stateValue.character.activeSkillIds];
        if (!active.some(isBattleDaoSkillIdV127))
            throw new Error('Loadout hiện tại chưa gắn kỹ năng Bản Đạo.');
        const profile = battleDaoAutoRotationV127(main, active, foundation.battleDao.secondaryDaoId);
        this.setCombatLoadout(active, profile);
        this.actionIndexValue += 1;
        return { name: profile.name, ruleCount: profile.rules.length, activeSkillIds: active };
    }
    reincarnationSummary() {
        const r = this.metaValue.reincarnation;
        const lifetimeRp = Math.max(0, this.metaValue.reincarnationProgress?.tree?.lifetimePointsEarned ?? 0);
        const sealLevel = reincarnationSealLevel(lifetimeRp);
        r.xp = lifetimeRp; r.sealLevel = sealLevel;
        return { sealLevel, sealName: reincarnationSealName(sealLevel), lifetimeRp, nextSealLifetimeRp: nextSealXp(sealLevel), effectiveLives: r.effectiveLives, totalReincarnations: r.totalReincarnations, birthPreviewCount: birthPreviewCountForSeal(sealLevel), fateLockSlots: 0, karmaSlots: karmaInheritanceSlotsForSeal(sealLevel), relicSlots: boundRelicSlotsForSeal(sealLevel), daoSeeds: r.daoSeeds.map(x => ({ id: x.id, daoId: x.daoId, strength: x.strength })), memories: r.memoryArchives.map(x => ({ id: x.id, title: x.title, maxRealmOrder: x.maxRealmOrder })), current: this.currentLifeValue.reincarnation ? structuredClone(this.currentLifeValue.reincarnation) : undefined };
    }
    syncCurrentLifeFateRuntimeV4() {
        let id=this.currentLifeValue?.activeFateId;
        let def;
        try { def=fateBuildDefinitionV4(id); }
        catch { id=this.metaValue.reincarnationProgress.fateBuild.activeFateId; this.currentLifeValue.activeFateId=id; def=fateBuildDefinitionV4(id); }
        this.stateValue.character.fateModifiersV4={...def.modifiers};
        return def;
    }
    fateSpiritStoneGainV4(amount,state=this.stateValue) { return applyFateSpiritStoneGainV4(amount,state?.character?.fateModifiersV4); }
    reincarnationRewardArgsV4(nowUnixMs=Date.now()) {
        const rp=this.metaValue.reincarnationProgress, realmOrder=this.stateValue.realm.maxRealmOrder;
        const combatPower=Math.max(0,Number(this.personalPowerSummary().score)||0);
        const prior=Number(rp.bestCombatPowerByRealmOrderV4?.[String(realmOrder)]??0);
        return { lifeId:this.currentLifeValue.lifeId, realmOrder, lifePotentialEarned:this.stateValue.character.corePotential?.life?.lifetimeEarned??0, permanentPotentialConversionPct:permanentPotentialConversionPctV127(rp.tree), energyCostReductionPct:reincarnationEnergyCostReductionPctV127(rp.tree), reincarnationPointsGainPct:reincarnationPointsGainPctV4(rp.tree), combatPower, combatPowerBenchmark:prior>0?prior:combatPower, isNewRealmRecord:realmOrder>Math.max(0,Number(rp.highestRealmOrderV4)||0), nowUnixMs };
    }
    fateBuildSummaryV4() {
        const rp=this.metaValue.reincarnationProgress, state=cloneFateBuildStateV4(rp.fateBuild), availableRp=availableTreePoints(rp.tree);
        return { schema:'reincarnation-fate-build.v4', activeThisLifeId:this.currentLifeValue.activeFateId, selectedNextLifeId:state.activeFateId, active:activeFateBuildV4(state), availableRp, totalUnlockCostRp:FATE_BUILD_TOTAL_UNLOCK_COST_V4, paths: ['cultivation','combat','body','wealth','idle'].map(pathId=>({pathId,nodes:[...state.unlockedIds].length>=0?undefined:undefined})), unlockedIds:[...state.unlockedIds] };
    }
    unlockFateBuildV4(id) {
        if (this.stateValue.alive) throw new Error('Chỉ mở Mệnh Cách giữa hai đời để không đổi build giữa kiếp.');
        const rp=this.metaValue.reincarnationProgress, available=availableTreePoints(rp.tree);
        const result=unlockFateBuildStateV4(rp.fateBuild,id,available);
        rp.fateBuild=result.state; rp.tree.sharedSpentPoints=Math.max(0,Math.floor(Number(rp.tree.sharedSpentPoints)||0))+result.spentRp;
        this.actionIndexValue+=1; return {spentRp:result.spentRp,availableRp:availableTreePoints(rp.tree),state:cloneFateBuildStateV4(rp.fateBuild)};
    }
    selectFateBuildV4(id) {
        if (this.stateValue.alive) throw new Error('Mệnh Cách của đời hiện tại đã định; chỉ đổi lựa chọn giữa hai đời.');
        this.metaValue.reincarnationProgress.fateBuild=selectActiveFateBuildStateV4(this.metaValue.reincarnationProgress.fateBuild,id);
        this.actionIndexValue+=1; return this.fateBuildSummaryV4();
    }
    reincarnationTalentSummary() {
        const state = this.metaValue.talents;
        const seal = this.metaValue.reincarnation.sealLevel;
        return {
            pointsAvailable: state.pointsAvailable,
            lifetimePointsEarned: state.lifetimePointsEarned,
            lifetimePointsSpent: state.lifetimePointsSpent,
            majorSlots: majorTalentSlots(seal),
            activeMajorIds: [...(state.activeMajorIds ?? [])],
            pendingMajorIds: [...(state.pendingMajorIds ?? state.activeMajorIds ?? [])],
            majors: Object.values(majorTalentDefinitions).map(definition => ({
                ...definition,
                qualified: definition.requirements.every(req => Math.max(0, Math.floor(state.ranks[req.id] ?? 0)) >= req.rank),
            })),
            nodes: ['technique.insight', 'technique.passive', 'combat.active_skill', 'combat.flow', 'profession.alchemy', 'profession.forging', 'profession.talisman', 'gather.herbalism', 'gather.instinct', 'artifact.attunement', 'artifact.spirit', 'dungeon.expedition', 'dungeon.phase_insight', 'dao.contemplation', 'social.karma_sense', 'automation.cycle', 'cultivation.cycle', 'cultivation.stability', 'clone.parallel', 'birth.resonance'].map(id => reincarnationTalentDefinitions[id]).map(definition => ({
                ...definition,
                rank: Math.max(0, Math.floor(state.ranks[definition.id] ?? 0)),
                nextCost: (state.ranks[definition.id] ?? 0) >= definition.maxRank ? undefined : definition.rankCosts[Math.max(0, Math.floor(state.ranks[definition.id] ?? 0))],
            })),
        };
    }
    queueMajorTalentFocus(ids) {
        if (!this.metaValue.talents)
            this.metaValue.talents = { pointsAvailable: 0, lifetimePointsEarned: 0, lifetimePointsSpent: 0, ranks: {}, activeMajorIds: [], pendingMajorIds: [] };
        const selected = queueMajorTalents(this.metaValue.talents, this.metaValue.reincarnation.sealLevel, ids);
        this.actionIndexValue += 1;
        return { selected, slots: majorTalentSlots(this.metaValue.reincarnation.sealLevel), activates: 'nextLife' };
    }
    spendReincarnationTalent(id, ranks = 1) {
        if (!this.metaValue.talents)
            this.metaValue.talents = { pointsAvailable: 0, lifetimePointsEarned: 0, lifetimePointsSpent: 0, ranks: {} };
        const result = spendReincarnationTalentPoints(this.metaValue.talents, this.metaValue.reincarnation.sealLevel, id, ranks);
        syncReincarnationTalentsToOrigins(this.stateValue.inheritedOrigins, this.metaValue.talents);
        this.actionIndexValue += 1;
        return result;
    }
    greatVehicleSummary() {
        const integration = this.integrationSummary();
        return deriveGreatVehicleSummary(this.stateValue.realm, integration, this.stateValue.dao, this.stateValue.factions, this.currentLifeValue.lifeId);
    }
    /** Build the exact final combat entity from a cloned/current AdventureState. Kept single-source so item previews cannot drift from live combat. */
    personalCombatEntityForState(state) {
        const character = applyCharacterToEntity(this.profile.combatEntity, state.character, this.registry, techniquePassiveStrengthMultiplier(state.inheritedOrigins), Boolean(state.inheritedOrigins['birth.v101.authoritative']));
        const equipped = applyEquipmentToEntity(character, state.equipment, this.registry.equipmentSets);
        const artifacts = equipped; // V88: legacy ArtifactState is compatibility/history only; collection V88 owns production power.
        const collected = applyCollectionEconomyToEntityV12325(artifacts, state.collectionV12316);
        const artifactTalents = applyReincarnationArtifactTalents(collected, state.inheritedOrigins);
        const dao = applyDaoToEntity(artifactTalents, state.dao, this.registry);
        const integration = deriveIntegrationSummary(state.realm, state.cultivation, state.soul, state.dao, state.artifacts);
        const integrated = applyIntegrationToEntity(dao, integration);
        const great = applyGreatVehicleToEntity(integrated, deriveGreatVehicleSummary(state.realm, integration, state.dao, state.factions, this.currentLifeValue.lifeId));
        const immortal = applyImmortalToEntity(great, state.immortal, state.realm, state.immortal.manifestationCapacity);
        const born = applyBirthCombatOrigins(applyReincarnationCombatTalents(immortal, state.inheritedOrigins), state.inheritedOrigins);
        const alchemy = ensureAlchemyV112State(state.economy);
        const lifeBonus = { ...emptyAlchemyAllocation(), power: Math.max(0, alchemy.life.lifeStatBonus?.power ?? 0), body: Math.max(0, alchemy.life.lifeStatBonus?.body ?? 0), defense: Math.max(0, alchemy.life.lifeStatBonus?.defense ?? 0) };
        const permanent = { ...emptyAlchemyAllocation(), ...(this.metaValue.reincarnationProgress?.alchemyPermanentStats ?? {}) };
        const buff = activeAlchemyBuff(alchemy, state.worldTimeYears);
        return applyAlchemyStatBonuses(born, lifeBonus, permanent, buff);
    }
    /** Final player combat entity after every personal system has been applied. Strategic systems are never required here. */
    personalCombatEntity() { return this.personalCombatEntityForState(this.stateValue); }
    /** V77 virtual farm throughput. This is derived from sustained offensive stats, never from the generic Power Score. */
    endlessHuntFarmViewV77(floor, playerOverride) {
        const hunt = this.stateValue.endlessHunt ?? (this.stateValue.endlessHunt = createEndlessHuntState());
        const requested = Math.floor(Number(floor ?? hunt.farmFloor ?? hunt.highestClearedFloor) || 0);
        const farmFloor = requested > 0 ? requested : Math.max(0, hunt.highestClearedFloor);
        if (farmFloor < 1 || !isEndlessHuntFloorCleared(hunt, farmFloor)) {
            return { available: false, floor: Math.max(0, farmFloor), floorName: 'Chưa mở bãi săn', zoneName: '—', mobName: 'Yêu thú', mobLevel: 0, mobHp: '—', mobElements: [], mobTags: [], playerDpsLog10: 0, mobHpLog10: 0, secondsPerKill: 0, killsPerHour: 0, eliteChancePct: 0, elitePerHour: 0, capped: false, spiritStonesPerKill: 0, spiritStonesPerHour: 0, demonCoreChancePct: 0, demonCoresPerHour: 0, equipmentChancePct: 0, equipmentRollsPerHour: 0 };
        }
        const map = realmMapDefinitionForFloor(farmFloor);
        const shadow = cloneEndlessHuntState(hunt);
        shadow.selectedFloor = farmFloor;
        shadow.activeMonster = undefined;
        const mob = generateEndlessHuntMonster(shadow, mixSeed(this.rootSeed ^ 0x77f41a9d, farmFloor * 131), 0, 1, { common: 100, enhanced: 0, elite: 0 }, map.localFloor, map.elementPool, map.maxMonsterElements, false);
        const player = playerOverride ?? this.personalCombatEntity();
        const matchup = secretRealmElementMatchup(player, mob.elements);
        const mobHpLog10 = mob.hpLog10 + Math.log10(Math.max(.05, (map.powerByGrade.common ?? map.powerMultiplier) * matchup.enemyPowerMultiplier));
        const playerDpsLog10 = huntVirtualFarmPlayerDpsLog10V77(player);
        const eliteChancePct = Math.min(4.5, 1.25 + map.zone * .28 + Math.log10(1 + map.localFloor) * .22);
        const base = huntVirtualFarmProfileV77({ floor: farmFloor, playerDpsLog10, mobHpLog10, eliteChancePct });
        const spiritStonesPerKill = Math.max(1, Math.round((1.8 + Math.pow(Math.max(1, map.localFloor), .56) * .42) * map.rewardDepthMultiplier * economyBandScale(map.majorRealmIndex)));
        const demonCoreChancePct = Math.min(36, 9 + map.zone * 1.35 + Math.log10(1 + map.localFloor) * 1.2);
        const loot = birthLootMultiplierFromOrigins(this.stateValue.inheritedOrigins);
        const equipmentChancePct = Math.min(7.5, huntEconomyDropChances('common', loot).equipmentChancePct * .32 * (1 + map.zone * .035));
        const equipmentRollsPerHour = base.killsPerHour * equipmentChancePct / 100;
        const fragmentPreviewV142 = huntEquipmentFragmentPreviewV142({ majorRealmIndex: map.majorRealmIndex, zone: map.zone, equipmentEventsPerHour: equipmentRollsPerHour });
        return { ...base, available: true, floorName: `Tầng ${map.zoneFloor}`, zoneName: map.zoneName, mobName: mob.name, mobLevel: mob.level, mobHp: formatLogMagnitude({ log10: mobHpLog10 }), mobElements: [...mob.elements], mobTags: [...mob.tags], spiritStonesPerKill, spiritStonesPerHour: base.killsPerHour * spiritStonesPerKill, demonCoreChancePct, demonCoresPerHour: base.killsPerHour * demonCoreChancePct / 100 + base.elitePerHour * 1.5, equipmentChancePct, equipmentRollsPerHour, equipmentFragmentPreviewV142: fragmentPreviewV142 };
    }
    /**
     * V129 farm resolver: batch/offline delta only. One representative ordinary monster is resolved
     * through CombatKernel V2 to establish TTK; rewards are then aggregated without per-kill encounters.
     */
    resolveEndlessHuntFarmBatchV77(realSeconds, options = {}) {
        if (!this.stateValue.alive)
            throw new Error('Đời hiện tại đã kết thúc.');
        const daoSuy = daoSuyStatusV127(this.stateValue.immortal, this.stateValue.realm.maxRealmOrder, this.stateValue.inheritedOrigins);
        if (daoSuy.longActivityLocked)
            throw new Error('Đạo Suy đã đạt 100: Săn Ảo dài hạn bị khóa cho tới khi xử lý Suy Kiếp.');
        const hunt = this.stateValue.endlessHunt ?? (this.stateValue.endlessHunt = createEndlessHuntState());
        const farm = this.endlessHuntFarmViewV77();
        const seconds = Math.max(0, Number(realSeconds) || 0);
        const regularRewardMultiplier = Math.max(1, Math.min(1.5, Number(options.regularRewardMultiplier) || 1));
        if (!farm.available || seconds <= 0) {
            return { schema: 'endless-hunt-farm-batch.v77', floor: farm.floor, realSeconds: seconds, kills: 0, eliteKills: 0, spiritStones: 0, demonCores: 0, demonCoreResourceId: '', equipmentRolls: 0, equipmentDropIds: [], equipmentDropNames: [], overflowEquipmentRolls: 0, farm, summaryLines: [farm.available ? 'Chưa đủ thời gian tạo một lượt săn.' : 'Hạ Boss tầng đầu tiên để mở bãi farm ảo.'] };
        }
        // V129 parity: offline/virtual farming derives throughput from one representative ordinary
        // monster resolved by the same CombatKernel V2 used by live Hunt/PvP. The batch remains O(1):
        // one deterministic representative encounter establishes TTK, then rewards are aggregated.
        const map = realmMapDefinitionForFloor(farm.floor);
        const shadow = cloneEndlessHuntState(hunt);
        shadow.selectedFloor = farm.floor;
        shadow.activeMonster = undefined;
        const representativeMob = generateEndlessHuntMonster(shadow, mixSeed(this.rootSeed ^ 0x12977f41, farm.floor * 131), 0, 1, { common: 100, enhanced: 0, elite: 0 }, map.localFloor, map.elementPool, map.maxMonsterElements, false);
        const representativePlayer = this.personalCombatEntity();
        const representativeMatchup = secretRealmElementMatchup(representativePlayer, representativeMob.elements);
        const representativeCombat = resolveEndlessHuntWithCombatKernelV2({
            registry: this.registry,
            player: representativePlayer,
            monster: representativeMob,
            enemyStatMultiplier: (map.powerByGrade.common ?? map.powerMultiplier) * representativeMatchup.enemyPowerMultiplier,
            seed: mixSeed(this.rootSeed ^ 0x129ba7c1, farm.floor * 8191),
            mode: 'simulation',
        });
        const secondsPerKillV129 = representativeCombat.won ? Math.max(.25, representativeCombat.battleSeconds) : Number.POSITIVE_INFINITY;
        const killFloat = Number.isFinite(secondsPerKillV129)
            ? Math.max(0, hunt.farmKillProgress) + seconds / secondsPerKillV129
            : Math.max(0, hunt.farmKillProgress);
        const kills = Math.max(0, Math.floor(killFloat));
        hunt.farmKillProgress = Math.max(0, Math.min(.999999, killFloat - kills));
        if (kills <= 0) {
            return { schema: 'endless-hunt-farm-batch.v77', floor: farm.floor, realSeconds: seconds, kills: 0, eliteKills: 0, spiritStones: 0, demonCores: 0, demonCoreResourceId: economyMaterialResourceId('beastCore', realmMapDefinitionForFloor(farm.floor).zone, 'beast'), equipmentRolls: 0, equipmentDropIds: [], equipmentDropNames: [], overflowEquipmentRolls: 0, farm, summaryLines: [`Bãi săn tầng ${realmMapDefinitionForFloor(farm.floor).zoneFloor}: đang truy kích yêu thú.`] };
        }
        hunt.farmBatchIndex = Math.max(0, hunt.farmBatchIndex) + 1;
        hunt.farmTotalVirtualKills = Math.max(0, hunt.farmTotalVirtualKills) + kills;
        hunt.totalKills = Math.max(0, hunt.totalKills) + kills;
        const rng = new SeededRng(mixSeed(this.rootSeed ^ 0x77ba7c11, hunt.farmBatchIndex + farm.floor * 8191));
        const eliteKills = deterministicBinomialV77(kills, farm.eliteChancePct / 100, rng);
        hunt.farmTotalEliteKills = Math.max(0, hunt.farmTotalEliteKills) + eliteKills;
        const confidant = collectionConfidantV87Summary(this.stateValue.collectionV12316), specialty = confidant.activeSpecialty, huntRewardPct = confidant.fortune.huntRewardPct + (specialty?.unlocked && specialty.id === 'hunt' ? specialty.strengthPct : 0), huntRewardMultiplier = 1 + huntRewardPct / 100;
        const spiritStones = this.fateSpiritStoneGainV4(deterministicJitteredTotalV77((kills * farm.spiritStonesPerKill + eliteKills * farm.spiritStonesPerKill * 2.5) * huntRewardMultiplier * regularRewardMultiplier, rng, .075));
        this.stateValue.inventory['resource.spirit_stone'] = (this.stateValue.inventory['resource.spirit_stone'] ?? 0) + spiritStones;
        const demonCoreResourceId = economyMaterialResourceId('beastCore', map.zone, 'beast');
        const demonCores = Math.max(0, Math.round((deterministicBinomialV77(kills, farm.demonCoreChancePct / 100, rng) + eliteKills * 2) * huntRewardMultiplier * regularRewardMultiplier));
        if (demonCores > 0)
            this.stateValue.inventory[demonCoreResourceId] = (this.stateValue.inventory[demonCoreResourceId] ?? 0) + demonCores;
        const equipmentRolls = deterministicBinomialV77(kills, farm.equipmentChancePct / 100, rng) + deterministicBinomialV77(eliteKills, .12, rng);
        const fragmentSettlementV142 = settleVirtualHuntEquipmentFragmentsV142(this.stateValue, {
            majorRealmIndex: map.majorRealmIndex, zone: map.zone, equipmentEvents: equipmentRolls,
            seed: rng.nextUint32(), source: `hunt.virtual.${farm.floor}`,
        });
        const overflowEquipmentRolls = 0;
        const equipmentDropIds = fragmentSettlementV142.drops.map(drop => drop.resourceId);
        const equipmentDropNames = fragmentSettlementV142.drops.map(drop => `${drop.rankName} +${drop.amount}`);
        const economyAwards = recordEconomyActivityV89(ensureCollectionProgressStateV12316(this.stateValue), 'huntKills', kills).awards;
        const spiritualRootRewardsV145 = settleSpiritualRootHuntV145(this.stateValue.character, this.stateValue.inventory, { kills, firstClear: false, countForOriginMeter: true, majorRealmIndex: map.majorRealmIndex, currentMajorRealmIndex: majorRealmIndexForRealmOrder(this.stateValue.realm.maxRealmOrder), zone: map.zone });
        this.actionIndexValue += 1;
        const summaryLines = [`Săn ảo tầng ${map.zoneFloor}: ${kills.toLocaleString('vi-VN')} yêu thú${eliteKills ? ` · ${eliteKills.toLocaleString('vi-VN')} Tinh Anh` : ''}.`, `Linh Thạch +${spiritStones.toLocaleString('vi-VN')} · Yêu Đan +${demonCores.toLocaleString('vi-VN')} · Mảnh Trang Bị +${fragmentSettlementV142.totalFragments.toLocaleString('vi-VN')}.`, `Linh Căn: Linh Tủy +${spiritualRootRewardsV145.tendon}${spiritualRootRewardsV145.origin ? ` · Bản Nguyên +${spiritualRootRewardsV145.origin}` : ''} · tiến độ Bản Nguyên ${spiritualRootRewardsV145.originProgress}/${spiritualRootRewardsV145.originPityKills}.`, ...equipmentDropNames.slice(0, 5).map(name => `Mảnh: ${name}.`), ...economyAwards.map(x => `${x.label}: Tiên Ngọc Khóa +${x.boundJade}.`)];
        return { schema: 'endless-hunt-farm-batch.v77', floor: farm.floor, realSeconds: seconds, kills, eliteKills, spiritStones, demonCores, demonCoreResourceId, equipmentRolls, equipmentDropIds, equipmentDropNames, overflowEquipmentRolls, fragmentSettlementV142, spiritualRootRewardsV145, farm, summaryLines, economyAwards };
    }
    endlessHuntSummary() {
        const hunt = cloneEndlessHuntState(this.stateValue.endlessHunt ?? createEndlessHuntState());
        const currentRealmOrder = Math.max(0, this.stateValue.realm.maxRealmOrder);
        const currentMajor = currentRealmOrder >= 1 ? majorRealmIndexForRealmOrder(currentRealmOrder) : 0;
        if (currentMajor >= 1) {
            ensureMajorHuntMapUnlocked(hunt, currentMajor);
            if (majorRealmIndexForMapFloor(hunt.selectedFloor) > currentMajor || !isEndlessHuntFloorUnlocked(hunt, hunt.selectedFloor))
                hunt.selectedFloor = mapStartFloorForRealm(currentRealmOrder);
        }
        const personalEntity = this.personalCombatEntity();
        const baseScore = Math.max(1, combatPowerBreakdown(personalEntity).score);
        const legacy = Math.max(0, this.metaValue.endless?.legacyPowerLog10 ?? 0);
        const canonicalSkills = this.canonicalActiveSkillIds();
        const huntSkillMultiplier = 1 + Math.min(.5, Math.max(0, canonicalSkills.filter(id => id !== 'skill.basic_strike').length) * .10);
        const playerPowerLog10 = Math.log10(baseScore * huntSkillMultiplier); // v1.10.4: no hidden kill/legacy Hunt combat power
        const luck = Math.max(0, this.currentLifeValue.birth.luck + birthLuckFlatFromOrigins(this.stateValue.inheritedOrigins));
        const loot = birthLootMultiplierFromOrigins(this.stateValue.inheritedOrigins);
        const map = realmMapDefinitionForFloor(hunt.selectedFloor);
        const monster = ensureEndlessHuntMonster(hunt, mixSeed(this.rootSeed ^ 0x517cc1b7, this.actionIndexValue + 991), luck, loot, map.gradeWeights, map.localFloor, map.elementPool, map.maxMonsterElements, true);
        const elementMatchup = secretRealmElementMatchup(personalEntity, monster.elements);
        const bossMechanic = monster.grade === 'boss' ? evaluateHuntBossMechanicV123(map.primaryElement, canonicalSkills, this.registry) : undefined;
        const mapPowerLog = Math.log10(Math.max(.05, (map.powerByGrade[monster.grade] ?? map.powerMultiplier) * elementMatchup.enemyPowerMultiplier)); // v1.30 Boss mechanic acts through HP/DPS/DEF resolver, not scalar display power
        const display = endlessHuntDisplay({ ...monster, powerLog10: monster.powerLog10 + mapPowerLog, hpLog10: monster.hpLog10 + mapPowerLog, attackLog10: monster.attackLog10 + mapPowerLog, defenseLog10: monster.defenseLog10 + mapPowerLog });
        const rewards = realmMapRewardProfile(monster.grade, map.zone, map.zoneFloor);
        const farmReward = huntFarmRewardEfficiencyV123(map.localFloor, highestUnlockedLocalFloor(hunt, map.majorRealmIndex));
        const effectiveLoot = loot * (1 + monster.fortuneBonusPct / 100) * farmReward.multiplier;
        const economyChances = huntEconomyDropChances(monster.grade, effectiveLoot);
        const stoneDepth = Math.pow(Math.max(1, map.localFloor), .72);
        const stoneHint = Math.max(1, Math.round((4 + stoneDepth * 1.2) * monster.spiritStoneMultiplier * loot * (1 + monster.fortuneBonusPct / 140) * map.rewardDepthMultiplier * farmReward.multiplier));
        const allMaps = currentRealmOrder >= 1 ? availableRealmMaps(currentRealmOrder, order => [...this.registry.realms.values()].find(r => r.order === order)?.name ?? `Cảnh ${order}`) : [];
        const visibleMaps = allMaps.map(candidate => {
            const major = candidate.majorRealmIndex;
            const localUnlocked = highestUnlockedLocalFloor(hunt, major);
            const zoneStart = (candidate.zone - 1) * 100 + 1;
            const zoneEnd = candidate.zone * 100;
            const progressFloor = Math.max(0, Math.min(100, localUnlocked - (zoneStart - 1)));
            const unlocked = major <= currentMajor && progressFloor >= 1;
            const discovered = unlocked;
            const target = unlocked ? realmMapDefinition(candidate.realmOrder, candidate.realmName, candidate.zone, progressFloor) : {
                ...candidate, zoneName: '???', biomeName: '???', name: 'Vực chưa biết', description: 'Vực này chưa được khám phá. Hạ Boss tầng 100 của vực trước để biết nơi tiếp theo.', rewardMultiplier: 0, rewardDepthMultiplier: 0, elementPool: [], primaryElement: undefined, maxMonsterElements: 0, powerMultiplier: 0, powerByGrade: { common: 0, enhanced: 0, elite: 0, boss: 0 }, gradeWeights: { common: 0, enhanced: 0, elite: 0 },
            };
            return { ...target, selected: candidate.majorRealmIndex === map.majorRealmIndex && candidate.zone === map.zone, unlocked, discovered, progressFloor, completed: (hunt.highestClearedByMajor[String(major)] ?? 0) >= zoneEnd };
        });
        const canFight = this.stateValue.injury < 85;
        const fightBlocker = canFight ? undefined : 'Thương thế quá nặng (≥85). Hãy trị Thương Thế hoặc chờ hồi phục trước khi tiếp tục Bí Cảnh.';
        const currentFloorStats = endlessHuntFloorEfficiency(hunt.selectedFloor, hunt.floorStats[String(hunt.selectedFloor)]);
        const farmSuggestions = bestEndlessHuntFarmFloors(hunt, Math.max(1, map.majorRealmIndex), 5);
        const farmRecommendations = endlessHuntFarmRecommendationsV123(hunt, Math.max(1, map.majorRealmIndex));
        const farm = this.endlessHuntFarmViewV77(undefined, personalEntity);
        const highestCleared = Math.max(0, hunt.highestClearedFloor);
        const candidateFloors = [...new Set([farm.floor, highestCleared, Math.max(1, highestCleared - 5), Math.max(1, highestCleared - 20), Math.max(1, highestCleared - 60)].filter(floor => floor > 0 && isEndlessHuntFloorCleared(hunt, floor)))];
        const farmCandidates = candidateFloors.map(floor => this.endlessHuntFarmViewV77(floor, personalEntity));
        const productionV110 = buildHuntProductionV110({ bossReady: bossReady(hunt), canFight, injury: this.stateValue.injury, currentFloor: hunt.selectedFloor, highestClearedFloor: hunt.highestClearedFloor, playerPowerLog10, enemyPowerLog10: monster.powerLog10 + mapPowerLog, bossMechanic, map, farm, currentFarmCandidates: farmCandidates });
        return { schema: 'endless-hunt.v2', selectedFloor: hunt.selectedFloor, highestUnlockedFloor: hunt.highestUnlockedFloor, highestClearedFloor: hunt.highestClearedFloor, kills: 0, killsRequired: 0, bossReady: bossReady(hunt), bossChallengeAvailable: bossReady(hunt), farm, productionV110, totalKills: hunt.totalKills, totalBossKills: hunt.totalBossKills, autoAdvance: hunt.autoAdvance, playerPowerLog10, playerPower: formatLogMagnitude({ log10: playerPowerLog10 }), playerInjury: this.stateValue.injury, canFight, fightBlocker, trainingMultiplier: '×1.00', legacyMultiplier: '×1.00', accountBestFloor: Math.max(this.metaValue.endless?.bestFloorEver ?? 0, hunt.highestClearedFloor), currentMajorRealmIndex: map.majorRealmIndex, currentMajorRealmName: map.realmName, currentMapLocalFloor: map.localFloor, currentZoneFloor: map.zoneFloor, currentMap: map, availableMaps: visibleMaps, currentFloorStats, farmSuggestions, farmRecommendations, farmRewardEfficiency: { pct: farmReward.pct, gap: farmReward.gap, label: farmReward.label, reason: farmReward.reason }, monster: { id: monster.id, name: monster.name, grade: monster.gradeName, gradeId: monster.grade, floor: monster.floor, level: monster.level, tags: [...monster.tags], elements: [...monster.elements], playerElement: elementMatchup.playerElement, elementMatchup: elementMatchup.label, elementPowerModifierPct: (elementMatchup.enemyPowerMultiplier - 1) * 100, bossMechanic, power: display.power, hp: display.hp, attack: display.attack, defense: display.defense, powerLog10: monster.powerLog10 + mapPowerLog, fortuneBonusPct: monster.fortuneBonusPct, rewards: { cultivationPct: 0, spiritStonesHint: `~${stoneHint.toLocaleString('vi-VN')}`, materialChancePct: economyChances.materialChancePct, equipmentChancePct: economyChances.equipmentChancePct, rareChancePct: economyChances.rareChancePct, cultivationPillChancePct: Math.min(100, rewards.cultivationPillChancePct * effectiveLoot), injuryPillChancePct: Math.min(55, (monster.grade === 'boss' ? 30 : monster.grade === 'elite' ? 6 : monster.grade === 'enhanced' ? 1.5 : .25) * effectiveLoot) } } };
    }
    selectEndlessFloor(floor) {
        if (!this.stateValue.alive)
            throw new Error('Đời hiện tại đã kết thúc.');
        if (this.stateValue.realm.maxRealmOrder < 1)
            throw new Error('Bí Cảnh mở khi bước vào Luyện Khí.');
        const currentMajor = majorRealmIndexForRealmOrder(this.stateValue.realm.maxRealmOrder);
        const targetMajor = majorRealmIndexForMapFloor(floor);
        if (targetMajor > currentMajor)
            throw new Error('Đại cảnh giới hiện tại chưa đủ để tiến vào Bí Cảnh này.');
        const hunt = this.stateValue.endlessHunt ?? (this.stateValue.endlessHunt = createEndlessHuntState());
        ensureMajorHuntMapUnlocked(hunt, currentMajor);
        if (!isEndlessHuntFloorUnlocked(hunt, floor))
            throw new Error('Tầng này chưa mở: cần vượt Boss của tầng trước trong cùng Bí Cảnh.');
        const seed = mixSeed(this.rootSeed ^ 0x243f6a88, this.actionIndexValue + Math.floor(floor) * 17);
        const luck = Math.max(0, this.currentLifeValue.birth.luck + birthLuckFlatFromOrigins(this.stateValue.inheritedOrigins));
        const map = realmMapDefinitionForFloor(floor);
        selectEndlessHuntFloor(hunt, floor, seed, luck, birthLootMultiplierFromOrigins(this.stateValue.inheritedOrigins), map.gradeWeights, map.localFloor, map.elementPool, map.maxMonsterElements);
        // V77: selecting an already-cleared Boss floor explicitly makes it the virtual farm floor.
        if (isEndlessHuntFloorCleared(hunt, floor)) {
            hunt.farmFloor = Math.floor(floor);
            hunt.farmKillProgress = 0;
        }
        this.actionIndexValue += 1;
        return this.endlessHuntSummary();
    }
    setEndlessAutoAdvance(enabled) { const hunt = this.stateValue.endlessHunt ?? (this.stateValue.endlessHunt = createEndlessHuntState()); hunt.autoAdvance = Boolean(enabled); this.actionIndexValue += 1; return this.endlessHuntSummary(); }
    fightEndlessFloor(options = {}) {
        if (!this.stateValue.alive)
            throw new Error('Đời hiện tại đã kết thúc.');
        if (this.stateValue.realm.maxRealmOrder < 1)
            throw new Error('Bí Cảnh mở khi bước vào Luyện Khí.');
        if (this.stateValue.injury >= 85)
            throw new Error('Thương thế quá nặng. Hãy trị Thương Thế hoặc chờ hồi phục trước khi tiếp tục Bí Cảnh.');
        const hunt = this.stateValue.endlessHunt ?? (this.stateValue.endlessHunt = createEndlessHuntState());
        const currentMajor = majorRealmIndexForRealmOrder(this.stateValue.realm.maxRealmOrder);
        ensureMajorHuntMapUnlocked(hunt, currentMajor);
        if (majorRealmIndexForMapFloor(hunt.selectedFloor) > currentMajor || !isEndlessHuntFloorUnlocked(hunt, hunt.selectedFloor))
            hunt.selectedFloor = mapStartFloorForRealm(this.stateValue.realm.maxRealmOrder);
        const seed = mixSeed(this.rootSeed ^ 0x9e3779b9, this.actionIndexValue + 1);
        const luck = Math.max(0, this.currentLifeValue.birth.luck + birthLuckFlatFromOrigins(this.stateValue.inheritedOrigins));
        if (isEndlessHuntFloorCleared(hunt, hunt.selectedFloor))
            throw new Error('Tầng này đã hạ Boss. Hãy chọn tầng Boss chưa vượt hoặc tiếp tục Săn Ảo ở tầng đã mở.');
        const challengeBoss = true;
        if (!bossReady(hunt))
            throw new Error('Boss tầng này chưa thể khiêu chiến.');
        // V19/V31: legacy Đạo Lộ/Tu Hệ no longer modifies live loot.
        const loot = birthLootMultiplierFromOrigins(this.stateValue.inheritedOrigins);
        const personalEntityBase = this.personalCombatEntity();
        const baseScore = Math.max(1, combatPowerBreakdown(personalEntityBase).score);
        const legacy = Math.max(0, this.metaValue.endless?.legacyPowerLog10 ?? 0);
        const canonicalSkills = this.canonicalActiveSkillIds();
        const huntSkillMultiplier = 1 + Math.min(.5, Math.max(0, canonicalSkills.filter(id => id !== 'skill.basic_strike').length) * .10);
        const playerPowerLog10 = Math.log10(baseScore * huntSkillMultiplier); // telemetry only; CombatKernel V2 declares the actual winner
        const map = realmMapDefinitionForFloor(hunt.selectedFloor);
        const mapRealm = [...this.registry.realms.values()].find(r => r.order === map.realmOrder) ?? this.registry.realm(this.stateValue.realm.realmId);
        const farmReward = huntFarmRewardEfficiencyV123(map.localFloor, highestUnlockedLocalFloor(hunt, map.majorRealmIndex));
        const activeMonster = ensureEndlessHuntMonster(hunt, seed ^ 0x6d2b79f5, luck, loot, map.gradeWeights, map.localFloor, map.elementPool, map.maxMonsterElements, challengeBoss);
        const elementMatchup = secretRealmElementMatchup(personalEntityBase, activeMonster.elements);
        const bossMechanic = activeMonster.grade === 'boss' ? evaluateHuntBossMechanicV123(map.primaryElement, canonicalSkills, this.registry) : undefined;
        // K2: Endless Hunt/Bí Cảnh now resolves through the same deterministic CombatKernel as realtime/headless/simulation.
        const huntRuntime = this.stateValue.huntCombatRuntimeV117;
        const personalEntity = { ...personalEntityBase,
            initialFiveElementsV117: huntRuntime?.fiveElements ? { ...huntRuntime.fiveElements } : personalEntityBase.initialFiveElementsV117,
            initialDaoStateV118: huntRuntime?.daoStateV118 ? structuredClone(huntRuntime.daoStateV118) : personalEntityBase.initialDaoStateV118,
            initialUltimateGaugeV117: huntRuntime?.ultimateGauge ?? personalEntityBase.initialUltimateGaugeV117,
            initialBattleDaoStateV2: huntRuntime?.battleDaoStateV2 ? structuredClone(huntRuntime.battleDaoStateV2) : personalEntityBase.initialBattleDaoStateV2,
        };
        const mapPowerMultiplier = (map.powerByGrade[activeMonster.grade] ?? map.powerMultiplier) * elementMatchup.enemyPowerMultiplier;
        const kernelCombat = resolveEndlessHuntWithCombatKernelV2({ registry: this.registry, player: personalEntity, monster: activeMonster, enemyStatMultiplier: mapPowerMultiplier, seed, bossMechanic });
        const realCombat = { won: kernelCombat.won, outcome: kernelCombat.outcome, battleSeconds: kernelCombat.battleSeconds, playerHpRemainingPct: kernelCombat.playerHpRemainingPct, enemyHpRemainingPct: kernelCombat.enemyHpRemainingPct, playerDamageLog10: kernelCombat.playerDamageLog10, enemyDamageLog10: kernelCombat.enemyDamageLog10, playerDpsLog10: kernelCombat.playerDpsLog10, enemyDpsLog10: kernelCombat.enemyDpsLog10, enemyHpLog10: kernelCombat.enemyHpLog10, playerHpLog10: kernelCombat.playerHpLog10, breakPressurePctPerSecond: kernelCombat.breakPressurePctPerSecond, diagnosis: kernelCombat.diagnosis };
        const result = resolveEndlessHuntFight(hunt, playerPowerLog10, seed, luck, loot, mapPowerMultiplier, map.gradeWeights, map.localFloor, map.elementPool, map.maxMonsterElements, realCombat, challengeBoss);
        // V77 has no real ordinary-monster chain. Every floor action is one Boss, so no combat carry state survives the encounter.
        this.stateValue.huntCombatRuntimeV117 = undefined;
        const practiceCastCounts = estimateBattleDaoCastCountsV125(canonicalSkills, result.battleSeconds, [...this.registry.skills.values()]);
        const skillPractice = gainBattleDaoPracticeFromCastCountsV125(this.stateValue.character, practiceCastCounts, [...this.registry.skills.values()], practiceContentEfficiencyForGapV125(this.stateValue.realm.maxRealmOrder - map.realmOrder));
        const fateRuntime = this.currentLifeValue.fateRuntime ?? (this.currentLifeValue.fateRuntime = createFateRuntimeState());
        const fateMods = result.won ? fateHuntModifiers(this.currentLifeValue.birth.originsV101?.fate, fateRuntime) : { rewardMultiplier: 1, equipmentChanceBonusPct: 0, notes: [], consumeOpportunityBoost: false };
        const fateEvent = fateResolveHuntEvent(this.currentLifeValue.birth.originsV101?.fate, new SeededRng((seed ^ 0x51ed270b) >>> 0), result.won, result.monster.grade === 'elite' || result.monster.grade === 'boss');
        let cultivationGain = 0, spiritStones = 0, cultivationPillDrops = 0, injuryPillDropId, injuryPillDropName, trueBloodDropId, equipmentDropId, equipmentDropName, jackpotHit = false, jackpotChancePctApplied = 0;
        const economyMaterialDrops = {}, economyRareDrops = {};
        let spiritualRootRewardsV145;
        const fateNotes = [...fateMods.notes, ...fateEvent.notes];
        const mapRewards = realmMapRewardProfile(result.monster.grade, map.zone, map.zoneFloor);
        if (result.won) {
            // V77 canonical: Săn Yêu (including Boss first-clear) never grants direct Tu Vi.
            // The independent Tu Luyện stream keeps running at 100% while the player hunts.
            cultivationGain = 0;
            const confidant = collectionConfidantV87Summary(this.stateValue.collectionV12316), specialty = confidant.activeSpecialty, huntRewardPct = confidant.fortune.huntRewardPct + (specialty?.unlocked && specialty.id === 'hunt' ? specialty.strengthPct : 0), huntRewardMultiplier = 1 + huntRewardPct / 100;
            spiritStones = this.fateSpiritStoneGainV4(Math.max(0, Math.round(result.spiritStones * map.rewardDepthMultiplier * economyBandScale(map.majorRealmIndex) * fateMods.rewardMultiplier * fateEvent.rewardMultiplier * farmReward.multiplier * huntRewardMultiplier)) + fateEvent.spiritStoneDelta);
            this.stateValue.inventory['resource.spirit_stone'] = (this.stateValue.inventory['resource.spirit_stone'] ?? 0) + spiritStones;
            const rng = new SeededRng((seed ^ 0x7f4a7c15) >>> 0);
            // V129: Hunt's pill tier follows the same 8-band economy mapping as Alchemy.
            // Using raw majorRealmIndex here made Nhân Tiên+ clamp straight to T8, bypassing tier progression.
            const huntAlchemyTier = economyTierForMajorRealmIndex(map.majorRealmIndex);
            const effectiveLoot = loot * (1 + result.monster.fortuneBonusPct / 100) * farmReward.multiplier * huntRewardMultiplier;
            const rewardContext = options.rewardContext ?? 'online';
            const baseJackpotChance = huntEconomyDropChances(result.monster.grade, effectiveLoot).rareChancePct;
            const jackpotChance = huntJackpotChanceV135(this.stateValue.economy, baseJackpotChance, rewardContext, offlineSpecialOpportunityFactorV127(this.stateValue));
            const economyLoot = rollHuntEconomyLoot({ seed, grade: result.monster.grade, realmTier: map.zone, primaryElement: map.primaryElement, monsterTags: result.monster.tags, lootMultiplier: effectiveLoot, bossKillNumber: result.monster.grade === 'boss' ? hunt.totalBossKills : undefined, rareChancePctOverride: jackpotChance.effectiveChancePct });
            const randomNamedTreasure = Boolean(economyLoot.rareRollSucceeded && Object.keys(economyLoot.rareTreasureDrops).some(id => isHeavenlyTreasureResourceId(id)));
            settleHuntJackpotV135(this.stateValue.economy, result.monster.grade, rewardContext, economyLoot.rareRollSucceeded, randomNamedTreasure);
            jackpotHit = economyLoot.rareRollSucceeded;
            jackpotChancePctApplied = jackpotChance.effectiveChancePct;
            Object.assign(economyMaterialDrops, economyLoot.materialDrops);
            Object.assign(economyRareDrops, economyLoot.rareTreasureDrops);
            applyEconomyResourceDrops(this.stateValue.inventory, economyMaterialDrops);
            applyHeavenlyTreasureDrops(this.stateValue.economy, economyRareDrops);
            const equipmentChancePct = Math.min(100, economyLoot.equipmentChancePct + fateMods.equipmentChanceBonusPct);
            const equipmentEventV142 = rng.chance(equipmentChancePct);
            const fragmentSettlementV142 = settleRealHuntEquipmentFragmentsV142(this.stateValue, {
                majorRealmIndex: map.majorRealmIndex, zone: map.zone, monsterGrade: result.monster.grade,
                firstClear: Boolean(result.bossCleared), equipmentEvent: equipmentEventV142, rankRoll01: rng.next(),
                source: `hunt.real.${result.monster.floor}`,
            });
            if (fragmentSettlementV142.totalFragments > 0) {
                const drop = fragmentSettlementV142.drops[0];
                equipmentDropId = drop.resourceId;
                equipmentDropName = `Mảnh Trang Bị · ${drop.rankName} +${drop.amount}`;
            }
            // V85: new PvE drops use the canonical Alchemy pill families. Legacy resource.pill.* remains compatibility-only.
            if (rng.chance(Math.min(100, mapRewards.cultivationPillChancePct * effectiveLoot))) {
                const quality = rollPillQuality(rng.next()), id = alchemyPillResourceId('cultivation', huntAlchemyTier, quality);
                cultivationPillDrops = 1;
                this.stateValue.inventory[id] = (this.stateValue.inventory[id] ?? 0) + 1;
            }
            const injuryPillChancePct = result.monster.grade === 'boss' ? 30 : result.monster.grade === 'elite' ? 6 : result.monster.grade === 'enhanced' ? 1.5 : .25;
            if (rng.chance(Math.min(55, injuryPillChancePct * effectiveLoot))) {
                const quality = rollPillQuality(rng.next());
                injuryPillDropId = alchemyPillResourceId('injury', huntAlchemyTier, quality);
                injuryPillDropName = alchemyPillName('injury', huntAlchemyTier, quality);
                this.stateValue.inventory[injuryPillDropId] = (this.stateValue.inventory[injuryPillDropId] ?? 0) + 1;
            }
            if (result.monster.grade === 'boss' && rng.chance(Math.min(12, (1 + map.zone * 1.15) * farmReward.multiplier))) {
                const ids = bloodlineIds();
                const id = ids[Math.floor(rng.next() * ids.length)];
                trueBloodDropId = trueBloodResourceId(id);
                this.stateValue.inventory[trueBloodDropId] = (this.stateValue.inventory[trueBloodDropId] ?? 0) + 1;
            }
            // V145: Linh Căn Hunt rewards are generic; no elemental target/material lane survives.
            spiritualRootRewardsV145 = settleSpiritualRootHuntV145(this.stateValue.character, this.stateValue.inventory, { kills: 1, firstClear: Boolean(result.bossCleared), countForOriginMeter: false, majorRealmIndex: map.majorRealmIndex, currentMajorRealmIndex: majorRealmIndexForRealmOrder(this.stateValue.realm.maxRealmOrder), zone: map.zone });
            if (fateEvent.injuryDelta > 0)
                this.stateValue.injury = Math.min(100, this.stateValue.injury + fateEvent.injuryDelta);
            fateNotes.push(...fateOnHuntResult(this.currentLifeValue.birth.originsV101?.fate, fateRuntime, true, result.monster.grade === 'elite' || result.monster.grade === 'boss'));
            recordActiveArtifactBattle(this.stateValue.artifacts, true, this.stateValue.worldTimeYears, result.monster.name);
        }
        else {
            if (fateEvent.spiritStoneDelta > 0) {
                spiritStones = this.fateSpiritStoneGainV4(fateEvent.spiritStoneDelta);
                this.stateValue.inventory['resource.spirit_stone'] = (this.stateValue.inventory['resource.spirit_stone'] ?? 0) + spiritStones;
            }
            this.stateValue.injury = Math.min(100, this.stateValue.injury + result.injuryGain + fateEvent.injuryDelta);
            fateNotes.push(...fateOnHuntResult(this.currentLifeValue.birth.originsV101?.fate, fateRuntime, false, result.monster.grade === 'elite' || result.monster.grade === 'boss'));
            recordActiveArtifactBattle(this.stateValue.artifacts, false, this.stateValue.worldTimeYears, result.monster.name);
        }
        recordHuntEconomyTelemetry(this.stateValue.economy, { won: result.won, boss: result.monster.grade === 'boss', spiritStones, materialDrops: economyMaterialDrops, rareDrops: economyRareDrops });
        recordEndlessHuntFloorStats(hunt, result.monster.floor, { won: result.won, battleSeconds: result.battleSeconds, cultivationGain, spiritStones, equipmentDrops: equipmentDropId ? 1 : 0, pillDrops: cultivationPillDrops + (injuryPillDropId ? 1 : 0), bossWin: result.won && result.monster.grade === 'boss' });
        const combatEvents = options.emitCombatEvents === false ? [] : buildEndlessHuntCombatStreamFromKernelV2({ registry: this.registry, battle: kernelCombat.battle, result, playerId: kernelCombat.playerEntity.id, enemyId: kernelCombat.enemyEntity.id, bossMechanic });
        const significance = result.won ? (result.monster.grade === 'boss' ? 34 : result.monster.grade === 'elite' ? 18 : result.monster.grade === 'enhanced' ? 11 : 6) : 18;
        const openedText = result.bossCleared && result.unlockedFloor ? `; mở tầng ${zoneFloorForMapFloor(result.unlockedFloor)} ${realmMapDefinitionForFloor(result.unlockedFloor).zoneName}` : '';
        const event = { id: `endless.hunt.${seed}.${result.monster.floor}.${result.monster.grade}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: result.won ? 'combat' : 'injury', significance, message: result.won ? `${result.monster.gradeName} · ${map.zoneName} tầng ${map.zoneFloor}: hạ ${result.monster.name}; Linh Thạch +${spiritStones}${equipmentDropName ? `, rơi ${equipmentDropName}` : ''}${cultivationPillDrops ? `, Tu Vi Đan +${cultivationPillDrops}` : ''}${injuryPillDropName ? `, ${injuryPillDropName} +1` : ''}${trueBloodDropId ? `, Bản Mệnh Tinh Huyết +1` : ''}${openedText}.${fateNotes.length ? ` ${fateNotes.join(' ')}` : ''}` : `Thất bại trước ${result.monster.name} · ${map.zoneName} tầng ${map.zoneFloor}; thương thế +${result.injuryGain}.${fateNotes.length ? ` ${fateNotes.join(' ')}` : ''}`, locationId: this.stateValue.locationId, tags: ['EndlessHunt', result.won ? 'Victory' : 'Defeat', result.monster.grade, map.zoneGradeId, ...result.monster.elements.map(x => `Element:${x}`), ...(result.bossCleared ? ['FloorBoss', 'FirstClear', 'FirstClearLike'] : []), ...(jackpotHit ? ['Jackpot'] : [])], data: { floor: result.monster.floor, localFloor: map.localFloor, zoneFloor: map.zoneFloor, zone: map.zone, majorRealmIndex: map.majorRealmIndex, grade: result.monster.grade, monsterName: result.monster.name, playerPowerLog10: result.playerPowerLog10, enemyPowerLog10: result.enemyPowerLog10, powerRatio: result.powerRatio, cultivationGain, spiritStones, equipmentDropId: equipmentDropId ?? '', economyMaterialDropsJson: JSON.stringify(economyMaterialDrops), economyRareDropsJson: JSON.stringify(economyRareDrops), bossCleared: result.bossCleared, unlockedFloor: result.unlockedFloor ?? 0, trainingPowerLogGain: result.trainingPowerLogGain, farmRewardEfficiencyPct: farmReward.pct, bossMechanicId: bossMechanic?.id ?? '', bossMechanicCoveragePct: bossMechanic?.coveragePct ?? 0, skillPracticeXp: skillPractice.reduce((a, x) => a + x.xpGain, 0), spiritualRootRewardsV145Json: JSON.stringify(spiritualRootRewardsV145 ?? {}) } };
        const economyAwards = options.recordHistory !== false && result.won && result.monster.grade === 'boss'
            ? [...recordEconomyActivityV89(ensureCollectionProgressStateV12316(this.stateValue), 'huntBossWins', 1).awards, ...(result.bossCleared ? (() => { const x = recordFirstClearBoundJadeV89(ensureCollectionProgressStateV12316(this.stateValue), `hunt.${result.monster.floor}`); return x.awarded ? [{ id: `first-clear.hunt.${result.monster.floor}`, label: 'Thưởng công phá tầng đầu', boundJade: x.boundJade }] : []; })() : [])]
            : [];
        if (options.recordHistory !== false)
            this.historyValue.append(event);
        this.actionIndexValue += 1;
        const bossRetryLine = !result.won && result.monster.grade === 'boss' ? 'Khiêu chiến Boss thất bại: Boss tầng này vẫn còn, có thể thử lại bất cứ lúc nào; bãi farm đã mở trước đó không bị mất.' : undefined;
        const summaryLines = result.won ? [`Hạ ${result.monster.name} [${result.monster.gradeName}] · ${map.zoneName} tầng ${map.zoneFloor} trong ${result.battleSeconds.toFixed(1)}s · HP còn ${result.playerHpRemainingPct.toFixed(0)}%.`, `Sát thương thực gây ra ${formatLogMagnitude({ log10: result.effectiveDamageLog10 })} · Linh Thạch +${spiritStones}. Tu Luyện vẫn chạy độc lập 100%.`, ...(farmReward.pct < 100 ? [`Hiệu suất farm tầng thấp: ${farmReward.pct}% (${farmReward.reason})`] : []), ...(bossMechanic ? [`Cơ chế Boss: ${bossMechanic.name} · đối sách ${bossMechanic.coveragePct}% · ${bossMechanic.counterHint}`] : []), ...(result.monster.elements.length ? [`Ngũ Hành: ${result.monster.elements.join(' + ')} · ${elementMatchup.label}.`] : []), ...(equipmentDropName ? [`Rơi: ${equipmentDropName}.`] : []), ...(Object.keys(economyMaterialDrops).length ? [`Nguyên liệu: ${Object.entries(economyMaterialDrops).map(([id, n]) => `${economyMaterialDefinition(id)?.name ?? id} +${n}`).join(' · ')}.`] : []), ...(Object.keys(economyRareDrops).length ? [`Bảo vật: ${Object.entries(economyRareDrops).map(([id, n]) => `${heavenlyTreasureDefinitions[id]?.name ?? id} +${n}`).join(' · ')}.`] : []), ...((cultivationPillDrops || injuryPillDropName) ? [`Đan dược: ${cultivationPillDrops ? `Tu Vi Đan +${cultivationPillDrops}` : ''}${cultivationPillDrops && injuryPillDropName ? ' · ' : ''}${injuryPillDropName ? `${injuryPillDropName} +1` : ''}.`] : []), ...(trueBloodDropId ? [`Căn nguyên hiếm: Bản Mệnh Tinh Huyết +1.`] : []), ...(spiritualRootRewardsV145 && (spiritualRootRewardsV145.tendon !== '0' || spiritualRootRewardsV145.origin > 0) ? [`Linh Căn: Linh Tủy +${spiritualRootRewardsV145.tendon}${spiritualRootRewardsV145.origin ? ` · Bản Nguyên +${spiritualRootRewardsV145.origin}` : ''}.`] : []), ...(jackpotHit ? [`Dị tượng chiến lợi phẩm: vận may hiếm đã kích hoạt.`] : []), ...fateNotes, ...(result.bossCleared && result.unlockedFloor ? [`Boss tầng bị hạ: đã mở ${realmMapDefinitionForFloor(result.unlockedFloor).zoneName} tầng ${zoneFloorForMapFloor(result.unlockedFloor)}.`] : [])] : [`${result.outcome === 'timeout' ? 'Hết thời gian giao tranh' : 'Bị đánh bại'} trước ${result.monster.name}; HP ngươi còn ${result.playerHpRemainingPct.toFixed(0)}% · HP mục tiêu còn ${result.enemyHpRemainingPct.toFixed(0)}%.`, `Thương thế +${result.injuryGain}; Chiến Lực chỉ còn là chỉ báo, thắng/thua do HP thực quyết định.`, ...(bossRetryLine ? [bossRetryLine] : []), ...realCombat.diagnosis, ...fateNotes];
        summaryLines.push(...economyAwards.map(x => `${x.label}: Tiên Ngọc Khóa +${x.boundJade}.`));
        return { seed, won: result.won, rewardContext: options.rewardContext ?? 'online', jackpotHit, jackpotChancePctApplied, floor: result.monster.floor, monsterId: result.monster.id, monsterName: result.monster.name, grade: result.monster.gradeName, battleSeconds: result.battleSeconds, damage: formatLogMagnitude({ log10: result.effectiveDamageLog10 }), powerRatio: result.powerRatio, cultivationGain, spiritStones, cultivationPillDrops, injuryPillDropId, injuryPillDropName, economyMaterialDrops: { ...economyMaterialDrops }, economyRareDrops: { ...economyRareDrops }, skillPractice, equipmentDropId, equipmentDropName, spiritualRootRewardsV145, injuryGain: result.injuryGain, bossCleared: result.bossCleared, unlockedFloor: result.unlockedFloor, farmRewardEfficiencyPct: farmReward.pct, bossMechanic, combatEvents, summaryLines, economyAwards, event, state: options.cloneState === false ? this.stateValue : this.state };
    }
    equipmentCombatImpact(itemId) {
        const snapshot = this.state;
        const item = snapshot.equipment.items.find(candidate => candidate.id === itemId);
        if (!item)
            throw new Error(`Unknown equipment item: ${itemId}`);
        const replacedItemId = snapshot.equipment.equipped[item.slot];
        const before = combatPowerBreakdown(this.personalCombatEntity()).score;
        equipItem(snapshot.equipment, itemId);
        // Alpha.22 keeps Alpha.18 parity fix but routes both sides through the single canonical entity builder.
        const after = combatPowerBreakdown(this.personalCombatEntityForState(snapshot)).score;
        const deltaPct = before > 0 ? (after / before - 1) * 100 : 0;
        return { scoreBefore: before, scoreAfter: after, deltaPct: Number(deltaPct.toFixed(2)), replacedItemId };
    }
    /**
     * Alpha.22 on-demand build intelligence. This intentionally does NOT run for every inventory row.
     * It equips the candidate only on a cloned state and runs CombatKernel V2 against two fixed
     * 45s benchmarks so the UI can explain trade-offs without inventing a single "Power Score" verdict.
     */
    equipmentBuildIntelligence(itemId) {
        const beforeState = this.state;
        const item = beforeState.equipment.items.find(candidate => candidate.id === itemId);
        if (!item)
            throw new Error(`Unknown equipment item: ${itemId}`);
        const replacedItemId = beforeState.equipment.equipped[item.slot];
        const beforeEntity = this.personalCombatEntityForState(beforeState);
        const afterState = this.state;
        equipItem(afterState.equipment, itemId);
        const afterEntity = this.personalCombatEntityForState(afterState);
        const durationSeconds = 45;
        const seedBase = mixSeed(this.rootSeed ^ 0x13822022, this.actionIndexValue + Math.max(1, item.itemLevel ?? 1));
        const benchmark = (entity, reference, seed) => {
            const offenseId = `${entity.id}.a22.offense`;
            const dummy = { id: 'entity.alpha22.training_dummy', name: 'Mộc Nhân Chuẩn', tags: ['TrainingDummy', 'Alpha22'], combatModel: 'locked-v1', stats: { maxHp: 1e200, maxSpirit: 1, attack: 1, defense: Math.max(1, reference.stats.defense), mobility: 0, accuracy: 0, critChancePct: 0, critPowerPerLayer: .5, controlPower: 0, resolve: 1e9, actionSpeed: .25, damageReductionPct: 0, controlDurationReductionPct: 100 }, skillIds: [], aiProfile: { name: 'Bất động', rules: [] } };
            const offensePlayer = { ...entity, id: offenseId };
            const offenseBattle = runCombatKernelV2({ registry: this.registry, seed, entities: [offensePlayer, dummy], maxDuration: durationSeconds, mode: 'simulation' }).battle;
            const offenseAnalytics = analyzeBattle(offenseBattle);
            const oa = offenseAnalytics.combatants[offenseId];
            const dps = Math.max(0, oa?.damageDealt ?? 0) / Math.max(1, Math.min(durationSeconds, offenseBattle.duration));
            const breakTotal = offenseBattle.logs.reduce((sum, log) => sum + (log.type === 'break' && log.actorId === offenseId ? Math.max(0, Number(log.data?.breakDamagePct ?? 0)) : 0), 0);
            const breakPressure = breakTotal / Math.max(1, Math.min(durationSeconds, offenseBattle.duration));
            const pressureId = 'entity.alpha22.standard_pressure';
            const pressure = { id: pressureId, name: 'Áp Lực Chuẩn', tags: ['TrainingPressure', 'Alpha22'], combatModel: 'locked-v1', stats: { maxHp: 1e200, maxSpirit: 1e9, attack: Math.max(1, reference.stats.attack * 2.25), defense: 1e200, mobility: 0, accuracy: 1e9, critChancePct: 0, critPowerPerLayer: .5, controlPower: 0, resolve: 1e9, actionSpeed: 1.05, damageReductionPct: 80, controlDurationReductionPct: 100 }, skillIds: ['skill.basic_strike'], aiProfile: { name: 'Áp lực chuẩn', rules: [{ skillId: 'skill.basic_strike', priority: 10, conditions: [{ type: 'always' }] }] } };
            const survivalId = `${entity.id}.a22.survival`;
            const defender = { ...entity, id: survivalId };
            const survivalBattle = runCombatKernelV2({ registry: this.registry, seed: seed ^ 0x6a09e667, entities: [defender, pressure], maxDuration: durationSeconds, mode: 'simulation' }).battle;
            const final = survivalBattle.finalState[survivalId];
            const maxHp = Math.max(1, buildHuntCombatProfileV130(entity, this.registry).maxHp);
            const hpPct = Math.max(0, Math.min(100, (final?.hp ?? 0) / maxHp * 100));
            const survivalSeconds = final?.alive === true ? durationSeconds : Math.min(durationSeconds, survivalBattle.duration);
            // Same benchmark for before/after. Remaining HP is a tie-breaker, not a global character score.
            const survivalScore = survivalSeconds + (final?.alive === true ? hpPct * .15 : 0);
            const profile = buildHuntCombatProfileV130(entity, this.registry);
            return { dps, breakPressure, survivalSeconds, survivalHpPct: hpPct, survivalScore, spiritSustainPct: profile.spiritSustain * 100, controlPressure: profile.controlPressure, healPerSecond: profile.healPerSecond, shieldPerSecond: profile.shieldPerSecond };
        };
        const before = benchmark(beforeEntity, beforeEntity, seedBase), after = benchmark(afterEntity, beforeEntity, seedBase);
        const pct = (a, b) => Math.abs(b) > 1e-9 ? (a / b - 1) * 100 : 0;
        const metric = (a, b) => ({ before: Number(a.toFixed(4)), after: Number(b.toFixed(4)), deltaPct: Number(pct(b, a).toFixed(2)) });
        const beforeSet = activeEquipmentSetMechanicsV116(beforeState.equipment), afterSet = activeEquipmentSetMechanicsV116(afterState.equipment);
        const beforeMap = new Map(beforeSet.map(x => [x.mechanicId, x])), afterMap = new Map(afterSet.map(x => [x.mechanicId, x]));
        const setChanges = [];
        for (const [id, x] of afterMap) {
            const old = beforeMap.get(id);
            if (!old)
                setChanges.push({ type: 'activated', mechanicId: id, setName: x.setName, pieces: x.pieces, name: x.name, summary: x.summary, eligibleDomains: [...x.eligibleDomains], ...(x.constraint ? { constraint: x.constraint } : {}) });
            else if (old.summary !== x.summary || old.effectiveGrade !== x.effectiveGrade)
                setChanges.push({ type: 'changed', mechanicId: id, setName: x.setName, pieces: x.pieces, name: x.name, summary: x.summary, eligibleDomains: [...x.eligibleDomains], ...(x.constraint ? { constraint: x.constraint } : {}) });
        }
        for (const [id, x] of beforeMap)
            if (!afterMap.has(id))
                setChanges.push({ type: 'deactivated', mechanicId: id, setName: x.setName, pieces: x.pieces, name: x.name, summary: x.summary, eligibleDomains: [...x.eligibleDomains], ...(x.constraint ? { constraint: x.constraint } : {}) });
        const skills = beforeState.character.activeSkillIds.filter(id => !id.startsWith('skill.class.') && this.registry.skills.has(id)).map(id => this.registry.skill(id));
        const domains = [...new Set(skills.flatMap(skill => [...(skill.runtimeV117?.domains ?? []), ...skill.tags]))];
        const daoBindings = [...new Set(skills.map(skill => skill.runtimeV117?.daoBinding).filter((x) => Boolean(x)))];
        const primaryRoots = [...new Set(skills.map(skill => skill.runtimeV117?.primaryRoot).filter((x) => Boolean(x)))];
        const markNames = [...new Set(skills.flatMap(skill => [...skill.effects, ...(skill.channel?.effects ?? [])].flatMap(effect => effect.type === 'addMark' || effect.type === 'consumeMarkDamage' ? [effect.mark] : [])))];
        const domainSet = new Set(domains);
        const matchedSetChanges = setChanges.filter(change => change.eligibleDomains.some(domain => domainSet.has(domain)));
        const daoLabel = { sword: 'Kiếm Đạo', fist: 'Quyền Đạo', body: 'Thể Đạo', spell: 'Pháp Đạo', poison: 'Độc Đạo', artifact: 'Ngự Khí Đạo', formation: 'Trận Đạo', mind: 'Thần Niệm Đạo' };
        const rootLabel = { metal: 'Kim', wood: 'Mộc', water: 'Thủy', fire: 'Hỏa', earth: 'Thổ' };
        const dpsDelta = pct(after.dps, before.dps), survivalDelta = pct(after.survivalScore, before.survivalScore), breakDelta = pct(after.breakPressure, before.breakPressure), spiritPoints = after.spiritSustainPct - before.spiritSustainPct;
        const verdicts = [];
        if (Math.abs(dpsDelta) >= .5)
            verdicts.push({ tone: dpsDelta > 0 ? 'up' : 'down', label: `DPS ${dpsDelta > 0 ? '↑' : '↓'} ${Math.abs(dpsDelta).toFixed(1)}%`, detail: 'Đo bằng CombatKernel V2 trong 45s với rotation hiện tại.' });
        if (Math.abs(survivalDelta) >= .5)
            verdicts.push({ tone: survivalDelta > 0 ? 'up' : 'down', label: `Sống sót ${survivalDelta > 0 ? '↑' : '↓'} ${Math.abs(survivalDelta).toFixed(1)}%`, detail: `Áp lực chuẩn: ${after.survivalSeconds.toFixed(1)}s · HP cuối ${after.survivalHpPct.toFixed(0)}%.` });
        if (Math.abs(breakDelta) >= 1)
            verdicts.push({ tone: breakDelta > 0 ? 'up' : 'down', label: `Phá Thế ${breakDelta > 0 ? '↑' : '↓'} ${Math.abs(breakDelta).toFixed(1)}%`, detail: 'Tổng % Phá Thế thực tạo trong benchmark rotation.' });
        if (Math.abs(spiritPoints) >= 1)
            verdicts.push({ tone: spiritPoints > 0 ? 'up' : 'down', label: `Chân Nguyên ${spiritPoints > 0 ? '↑' : '↓'} ${Math.abs(spiritPoints).toFixed(1)} điểm %`, detail: `Sustain rotation ${before.spiritSustainPct.toFixed(0)}% → ${after.spiritSustainPct.toFixed(0)}%.` });
        for (const change of matchedSetChanges.slice(0, 2))
            verdicts.push({ tone: change.type === 'deactivated' ? 'down' : 'synergy', label: `${change.type === 'deactivated' ? 'Mất' : 'Kích'} ${change.setName} ${change.pieces} món`, detail: change.summary });
        if (!verdicts.length)
            verdicts.push({ tone: 'neutral', label: 'Build gần như ngang', detail: 'Benchmark không thấy khác biệt đủ lớn; xem delta stat và Set để chọn theo mục tiêu build.' });
        return {
            schema: 'equipment-build-intelligence.v1', candidateItemId: item.id, replacedItemId, alreadyEquipped: replacedItemId === item.id,
            benchmark: { engine: 'CombatKernel V2', durationSeconds, offenseTarget: 'Mộc Nhân Chuẩn', survivalTarget: 'Áp Lực Chuẩn', note: 'Benchmark cố định để so cùng build; không phải dự đoán một Boss cụ thể.' },
            build: { daoBindings: daoBindings.map(id => ({ id, label: daoLabel[id] ?? id })), primaryRoots: primaryRoots.map(id => ({ id, label: rootLabel[id] ?? id })), markNames, domains: domains.slice(0, 24) },
            metrics: { dps: metric(before.dps, after.dps), survival: metric(before.survivalScore, after.survivalScore), breakPressure: metric(before.breakPressure, after.breakPressure), controlPressure: metric(before.controlPressure, after.controlPressure), spiritSustain: { beforePct: Number(before.spiritSustainPct.toFixed(2)), afterPct: Number(after.spiritSustainPct.toFixed(2)), deltaPoints: Number(spiritPoints.toFixed(2)) }, survivalDetail: { beforeSeconds: Number(before.survivalSeconds.toFixed(2)), afterSeconds: Number(after.survivalSeconds.toFixed(2)), beforeHpPct: Number(before.survivalHpPct.toFixed(2)), afterHpPct: Number(after.survivalHpPct.toFixed(2)) } },
            setChanges, matchedSetChanges: matchedSetChanges.map(x => x.mechanicId), verdicts: verdicts.slice(0, 6),
        };
    }
    personalPowerSummary() {
        const base = this.profile.combatEntity;
        const passiveMultiplier = techniquePassiveStrengthMultiplier(this.stateValue.inheritedOrigins);
        const suppressLegacyBirthOrigins = Boolean(this.stateValue.inheritedOrigins['birth.v101.authoritative']);

        // V129 provenance is read-only: clone mutable character/collection/alchemy state before any normalizer/helper touches it.
        const characterState = cloneCharacterSystemState(this.stateValue.character);
        const character = applyCharacterToEntity(base, characterState, this.registry, passiveMultiplier, suppressLegacyBirthOrigins);
        const characterSourceStages = characterStatSourceStagesV129(base, cloneCharacterSystemState(this.stateValue.character), this.registry, passiveMultiplier, suppressLegacyBirthOrigins);

        const equipmentDetails = equipmentPower(this.stateValue.equipment, this.registry.equipmentSets);
        const equipped = applyEquipmentToEntity(character, this.stateValue.equipment, this.registry.equipmentSets);

        const collectionBase = cloneCollectionProgressStateV12316(this.stateValue.collectionV12316);
        const filteredCollection = (allowedCategories) => {
            const allowed = new Set(allowedCategories);
            const state = cloneCollectionProgressStateV12316(collectionBase);
            for (const [id, progress] of Object.entries(state.items ?? {})) {
                let category;
                try { category = collectionDefinitionV12316(id).category; } catch { category = undefined; }
                if (category && !allowed.has(category))
                    progress.owned = false;
            }
            if (!allowed.has('artifact'))
                state.activeArtifactIds = [];
            if (!allowed.has('pet'))
                state.activePetId = undefined;
            if (!allowed.has('companion'))
                state.activeCompanionId = undefined;
            return state;
        };
        const manualEntity = applyCollectionEconomyToEntityV12325(equipped, filteredCollection(['manual']));
        const artifactEntity = applyCollectionEconomyToEntityV12325(equipped, filteredCollection(['manual', 'artifact']));
        const petEntity = applyCollectionEconomyToEntityV12325(equipped, filteredCollection(['manual', 'artifact', 'pet']));
        const collected = applyCollectionEconomyToEntityV12325(equipped, filteredCollection(['manual', 'artifact', 'pet', 'companion']));

        const artifactTalents = applyReincarnationArtifactTalents(collected, this.stateValue.inheritedOrigins);
        const dao = applyDaoToEntity(artifactTalents, this.stateValue.dao, this.registry);
        const integration = deriveIntegrationSummary(this.stateValue.realm, this.stateValue.cultivation, this.stateValue.soul, this.stateValue.dao, this.stateValue.artifacts);
        const integrated = applyIntegrationToEntity(dao, integration);
        const great = applyGreatVehicleToEntity(integrated, deriveGreatVehicleSummary(this.stateValue.realm, integration, this.stateValue.dao, this.stateValue.factions, this.currentLifeValue.lifeId));
        const capacity = this.stateValue.immortal.manifestationCapacity;
        const immortalNoFactionState = { ...this.stateValue.immortal, activeManifestationIds: this.stateValue.immortal.activeManifestationIds.filter(id => id !== 'faction') };
        const immortalNoFaction = applyImmortalToEntity(great, immortalNoFactionState, this.stateValue.realm, capacity);
        const immortal = applyImmortalToEntity(great, this.stateValue.immortal, this.stateValue.realm, capacity);
        const talents = applyReincarnationCombatTalents(immortal, this.stateValue.inheritedOrigins);
        const birth = applyBirthCombatOrigins(talents, this.stateValue.inheritedOrigins);

        const alchemyState = cloneAlchemyV112State(this.stateValue.economy?.v112Alchemy) ?? createAlchemyV112State();
        const lifeBonus = { ...emptyAlchemyAllocation(), power: Math.max(0, alchemyState.life.lifeStatBonus?.power ?? 0), body: Math.max(0, alchemyState.life.lifeStatBonus?.body ?? 0), defense: Math.max(0, alchemyState.life.lifeStatBonus?.defense ?? 0) };
        const permanent = { ...emptyAlchemyAllocation(), ...(this.metaValue.reincarnationProgress?.alchemyPermanentStats ?? {}) };
        const buff = activeAlchemyBuff(alchemyState, this.stateValue.worldTimeYears);
        const finalEntity = applyAlchemyStatBonuses(birth, lifeBonus, permanent, buff);

        const realmName = this.registry.realm(this.stateValue.realm.realmId).name;
        const broadStages = [
            { id: 'base', name: 'Giá trị Nền CombatEntity', entity: base },
            { id: 'character', name: 'Nhân vật · Chỉ số Gốc', entity: character },
            { id: 'equipment', name: 'Trang Bị · Set · Đạo Văn · Ngọc', entity: equipped },
            { id: 'collection', name: 'Công Pháp · Pháp Bảo · Linh Thú · Tri Kỷ', entity: collected },
            { id: 'artifact_talent', name: 'Luân Hồi · Pháp Bảo', entity: artifactTalents },
            { id: 'dao', name: 'Chủ Đạo / Đạo Vực', entity: dao },
            { id: 'integration', name: 'Thân · Hồn · Đạo hợp nhất', entity: integrated },
            { id: 'great_vehicle', name: 'Đại Thừa · Đạo Quyền cá nhân', entity: great },
            { id: 'immortal', name: 'Tiên đạo / Active Manifestation cá nhân', entity: immortalNoFaction },
            { id: 'faction_manifestation', name: 'Thế lực biểu hiện (tùy chọn)', entity: immortal, strategic: true },
            { id: 'reincarnation_talents', name: 'Thiên Phú Luân Hồi', entity: talents },
            { id: 'birth_roll', name: 'Thiên Phú / Thần Thông bẩm sinh đời này', entity: birth },
            { id: 'alchemy', name: 'Đan Dược · đời hiện tại / vĩnh viễn / buff', entity: finalEntity },
        ];
        const summary = summarizePersonalPower({
            finalEntity,
            realmOrder: this.stateValue.realm.maxRealmOrder,
            realmName,
            lifeNumber: this.currentLifeValue.lifeNumber,
            stages: broadStages,
        });
        const detailedStages = [
            { id: 'base', name: 'Giá trị Nền CombatEntity', entity: base },
            ...characterSourceStages,
            { id: 'equipment', name: 'Trang Bị · Set · Đạo Văn · Ngọc', entity: equipped, meta: { flatStats: equipmentDetails.flatStats, statMultipliers: equipmentDetails.statMultipliers } },
            { id: 'collection.manual', name: 'Công Pháp V127', entity: manualEntity },
            { id: 'collection.artifact', name: 'Pháp Bảo', entity: artifactEntity },
            { id: 'collection.pet', name: 'Linh Thú', entity: petEntity },
            { id: 'collection.companion', name: 'Tri Kỷ', entity: collected },
            { id: 'artifact_talent', name: 'Luân Hồi · Pháp Bảo', entity: artifactTalents },
            { id: 'dao', name: 'Chủ Đạo / Đạo Vực', entity: dao },
            { id: 'integration', name: 'Thân · Hồn · Đạo hợp nhất', entity: integrated },
            { id: 'great_vehicle', name: 'Đại Thừa · Đạo Quyền cá nhân', entity: great },
            { id: 'immortal', name: 'Tiên đạo cá nhân', entity: immortalNoFaction },
            { id: 'faction_manifestation', name: 'Thế lực biểu hiện', entity: immortal },
            { id: 'reincarnation_talents', name: 'Thiên Phú Luân Hồi', entity: talents },
            { id: 'birth_roll', name: 'Thiên Phú / Thần Thông bẩm sinh', entity: birth },
            { id: 'alchemy', name: 'Đan Dược', entity: finalEntity },
        ];
        return {
            ...summary,
            statProvenance: statProvenanceV129(detailedStages, finalEntity, { corePotential: characterState.corePotential }),
        };
    }
    dungeonReadiness(dungeonId, floor = 1) {
        const dungeon = this.world.dungeons[dungeonId];
        if (!dungeon)
            throw new Error(`Unknown dungeon: ${dungeonId}`);
        const spec = dungeon.floors.find(candidate => candidate.floor === floor);
        if (!spec?.guardianEntityId)
            throw new Error(`Dungeon floor has no guardian: ${dungeonId} floor ${floor}`);
        const guardianBase = this.entityDefinitions[spec.guardianEntityId];
        if (!guardianBase)
            throw new Error(`Unknown dungeon guardian entity: ${spec.guardianEntityId}`);
        const guardian = buildDungeonGuardian(guardianBase, dungeon, floor);
        const mechanic = guardianMechanicForFloor(dungeon, floor);
        const player = this.personalCombatEntity();
        const matchup = analyzeCombatMatchup(player, guardian, this.stateValue.character.knownSkillIds, this.stateValue.artifacts, this.registry);
        const phases = (guardian.phases ?? []).map(phase => ({ id: phase.id, name: phase.name, hpBelowPct: phase.hpBelowPct, description: phase.description, counterHint: phase.counterHint, counterWindow: phase.counterWindow ? { name: phase.counterWindow.name, duration: phase.counterWindow.duration, description: phase.counterWindow.description } : undefined }));
        return { dungeonId, floor, guardianName: guardianBase.name, mechanic, phases, matchup, ...compareCombatPower(player, guardian) };
    }
    tribulationState() { return cloneTribulationState(this.stateValue.tribulation); }
    immortalState() { return cloneImmortalState(this.stateValue.immortal); }
    history() {
        return this.historyValue.all();
    }
    notableHistory(limit = 12) {
        return this.historyValue.top(limit);
    }
    playerFlowState() {
        return clonePlayerFlowState(this.stateValue.flow);
    }
    availableContentEvents(limit = 4) {
        const definitions = Object.values(this.world.contentEvents ?? {});
        return definitions
            .filter(definition => this.contentEventAvailable(definition))
            .sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id))
            .slice(0, Math.max(0, limit))
            .map(definition => ({
            id: definition.id, packId: definition.packId, title: definition.title, teaser: definition.teaser,
            priority: definition.priority,
            choices: definition.choices.map(choice => ({ id: choice.id, label: choice.label, description: choice.description })),
        }));
    }
    resolveContentEvent(eventId, choiceId) {
        if (!this.stateValue.alive)
            throw new Error('Đời hiện tại đã kết thúc');
        const definition = this.world.contentEvents?.[eventId];
        if (!definition)
            throw new Error(`Unknown content event: ${eventId}`);
        if (!this.contentEventAvailable(definition))
            throw new Error(`Content event is not currently available: ${eventId}`);
        const choice = definition.choices.find(candidate => candidate.id === choiceId);
        if (!choice)
            throw new Error(`Unknown choice ${choiceId} for content event ${eventId}`);
        const flow = this.stateValue.flow ?? (this.stateValue.flow = createPlayerFlowState());
        const seed = mixSeed(this.rootSeed ^ 0x71b3c4d5, this.actionIndexValue);
        let wonCombat;
        let summary = choice.resultText;
        let completed = true;
        let combatData = {};
        if (choice.combat) {
            const enemyBase = this.entityDefinitions[choice.combat.entityId];
            if (!enemyBase)
                throw new Error(`Unknown content-event combat entity: ${choice.combat.entityId}`);
            const characterPlayer = applyCharacterToEntity(this.profile.combatEntity, this.stateValue.character, this.registry, techniquePassiveStrengthMultiplier(this.stateValue.inheritedOrigins), Boolean(this.stateValue.inheritedOrigins['birth.v101.authoritative']));
            const equippedPlayer = applyEquipmentToEntity(characterPlayer, this.stateValue.equipment, this.registry.equipmentSets);
            const artifactPlayer = equippedPlayer; // V88 canonical Pháp Bảo is applied below.
            const collectionPlayer = applyCollectionEconomyToEntityV12325(artifactPlayer, this.stateValue.collectionV12316);
            const artifactTalentPlayer = applyReincarnationArtifactTalents(collectionPlayer, this.stateValue.inheritedOrigins);
            const daoPlayer = applyDaoToEntity(artifactTalentPlayer, this.stateValue.dao, this.registry);
            const integration = deriveIntegrationSummary(this.stateValue.realm, this.stateValue.cultivation, this.stateValue.soul, this.stateValue.dao, this.stateValue.artifacts);
            const integratedPlayer = applyIntegrationToEntity(daoPlayer, integration);
            const greatPlayer = applyGreatVehicleToEntity(integratedPlayer, deriveGreatVehicleSummary(this.stateValue.realm, integration, this.stateValue.dao, this.stateValue.factions, this.currentLifeValue.lifeId));
            const immortalPlayer = applyImmortalToEntity(greatPlayer, this.stateValue.immortal, this.stateValue.realm, this.stateValue.immortal.manifestationCapacity);
            const talentedPlayer = applyReincarnationCombatTalents(immortalPlayer, this.stateValue.inheritedOrigins);
            const playerCombat = { ...talentedPlayer, id: `${this.profile.combatEntity.id}.content.${eventId}` };
            const enemy = { ...enemyBase, id: `${enemyBase.id}.content.${eventId}` };
            const battle = runCombatKernelV2({ registry: this.registry, seed, entities: [applyCombatPacingV124(playerCombat), applyCombatPacingV124(enemy)], mode: 'headless' }).battle;
            wonCombat = battle.winnerId === playerCombat.id;
            const analytics = analyzeBattle(battle);
            const playerAnalytics = analytics.combatants[playerCombat.id];
            const signature = topDamageSkill(analytics, playerCombat.id);
            combatData = { battleSeed: seed, duration: battle.duration, playerDamage: playerAnalytics.damageDealt, signatureSkillId: signature.skillId ?? '', wonCombat };
            const elapsedYears = Math.min(0.02, this.remainingLifeYears());
            this.stateValue.worldTimeYears += elapsedYears;
            this.stateValue.ageYears += elapsedYears;
            this.historyValue.appendMany(this.syncWorldState(this.stateValue, seed ^ 0x9e3779b9));
            recordArtifactOwnershipYears(this.stateValue.artifacts, elapsedYears);
            recordActiveArtifactBattle(this.stateValue.artifacts, wonCombat, this.stateValue.worldTimeYears, enemyBase.name);
            if (wonCombat) {
                this.applyContentEventEffect(choice.effects, definition, choice);
                this.applyContentEventEffect(choice.combat.onWin, definition, choice);
                summary = `${choice.resultText} Ngươi thắng ${enemyBase.name} sau ${battle.duration.toFixed(1)}s.`;
            }
            else {
                this.applyContentEventEffect(choice.combat.onLose, definition, choice);
                const deathPenalty = this.applyCombatDeathPenalty(`content:${eventId}`);
                summary = `${choice.combat.loseText ?? `${choice.resultText} Ngươi thất bại trước ${enemyBase.name}.`} ${deathPenalty.applied ? `Tử vong làm giảm 0,1% Thọ Nguyên tối đa (${deathPenalty.lostYears.toFixed(2)} năm).` : ''}`.trim();
                completed = choice.combat.completeOnLoss !== false;
            }
        }
        else {
            this.applyContentEventEffect(choice.effects, definition, choice);
        }
        if (completed) {
            if (!flow.contentEvents.completedEventIds.includes(eventId))
                flow.contentEvents.completedEventIds.push(eventId);
            flow.contentEvents.choicesByEventId[eventId] = choiceId;
        }
        const chronicleEvent = {
            id: `content.${eventId}.${choiceId}.${this.currentLifeValue.lifeId}.${this.actionIndexValue}`,
            worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears,
            type: choice.combat ? 'combat' : 'world',
            significance: choice.significance ?? (choice.combat ? 24 : 14),
            message: summary,
            actorId: this.profile.combatEntity.id,
            locationId: this.stateValue.locationId,
            tags: ['ContentEvent', definition.packId, ...definition.tags ?? [], ...choice.tags ?? [], ...(wonCombat === true ? ['Victory'] : wonCombat === false ? ['Defeat'] : [])],
            data: { eventId, choiceId, completed, ...combatData },
        };
        this.historyValue.append(chronicleEvent);
        this.recordPlayerWorldEvent(chronicleEvent);
        this.applyNaturalDeathToState(seed);
        this.actionIndexValue += 1;
        return { eventId, choiceId, completed, wonCombat, summary, chronicleEvent, state: this.state };
    }
    contentEventAvailable(definition) {
        return isContentEventAvailable(definition, this.stateValue, this.currentLifeValue, this.metaValue);
    }
    contentEventChoiceInsights(eventId) {
        const definition = this.world.contentEvents?.[eventId];
        if (!definition)
            throw new Error(`Unknown content event: ${eventId}`);
        return definition.choices.map(choice => inspectContentEventChoice(definition, choice));
    }
    applyContentEventEffect(effect, definition, choice) {
        return applySessionContentEventEffectV141.call(this, effect, definition, choice);
    }
    resolveFirstLifeStory(beatId, path) {
        if (!this.stateValue.alive)
            throw new Error('Đời hiện tại đã kết thúc');
        if (this.currentLifeValue.lifeNumber !== 1)
            throw new Error('Dẫn nhập này chỉ thuộc đời đầu');
        const flow = this.stateValue.flow ?? (this.stateValue.flow = createPlayerFlowState());
        if (hasFirstLifeBeat(flow, beatId))
            return { beatId, path: flow.firstLifeStory.path, summary: 'Mốc này đã hoàn thành.', state: this.state };
        let summary = '';
        let significance = 12;
        const tags = ['FirstLife', 'GuidedContent'];
        if (beatId === 'first.awakening') {
            this.stateValue.inventory['resource.spirit_herb'] = (this.stateValue.inventory['resource.spirit_herb'] ?? 0) + 5;
            if (!this.stateValue.knownLocationIds.includes('location.thanh_hu_mountain'))
                this.stateValue.knownLocationIds.push('location.thanh_hu_mountain');
            adjustPlayerNpcRelationship(this.stateValue.worldSimulation, this.currentLifeValue.lifeId, 'npc.qin_shouyi', this.stateValue.worldTimeYears, { trust: 3, respect: 2, karmaDepth: 1 }, ['FirstGuide']);
            summary = 'Tần Thủ Nhất xem căn cốt cho ngươi, đưa năm cây Tụ Linh Thảo và chỉ Thanh Hư Sơn là nơi thích hợp khai mạch.';
            significance = 16;
            tags.push('Mentor', 'Inheritance');
        }
        else if (beatId === 'first.qi_awakened') {
            if (this.stateValue.realm.maxRealmOrder < 1)
                throw new Error('Phải bước vào Luyện Khí trước');
            this.unlockDungeon('dungeon.spirit_gathering_cave');
            this.stateValue.inventory['resource.spirit_stone'] = (this.stateValue.inventory['resource.spirit_stone'] ?? 0) + this.fateSpiritStoneGainV4(6);
            summary = 'Sau khi cảm ứng linh khí thành công, ngươi nhận được một tấm lệnh bài vào Tụ Linh Động và sáu viên linh thạch để chuẩn bị lần công phá đầu.';
            significance = 20;
            tags.push('Cultivation', 'DungeonHint');
        }
        else if (beatId === 'first.first_clear') {
            if (highestClearedDungeonFloor(this.stateValue.dungeons, 'dungeon.spirit_gathering_cave') < 1)
                throw new Error('Hãy first-clear Tụ Linh Động tầng 1 trước');
            if (!this.stateValue.knownLocationIds.includes('location.thanh_hu_sect'))
                this.stateValue.knownLocationIds.push('location.thanh_hu_sect');
            this.stateValue.inventory['resource.spirit_stone'] = (this.stateValue.inventory['resource.spirit_stone'] ?? 0) + this.fateSpiritStoneGainV4(10);
            summary = 'Chiến tích tại Tụ Linh Động lọt vào mắt Thanh Hư Tông. Một phong thư dẫn nhập được gửi tới, kèm mười linh thạch.';
            significance = 28;
            tags.push('FirstClear', 'FactionInvitation');
        }
        else if (beatId === 'first.choose_path') {
            if (!hasFirstLifeBeat(flow, 'first.first_clear'))
                throw new Error('Chưa nhận được lời dẫn của Thanh Hư Tông');
            if (path !== 'sect' && path !== 'wanderer')
                throw new Error('Hãy chọn sect hoặc wanderer');
            flow.firstLifeStory.path = path;
            if (path === 'sect') {
                const faction = this.stateValue.factions.factions['faction.thanh_hu_sect'];
                if (this.stateValue.locationId !== faction?.locationId)
                    throw new Error('Muốn bái nhập phải tới Thanh Hư Tông trước');
                if (!playerFactionMembership(this.stateValue.factions, this.currentLifeValue.lifeId))
                    this.joinFaction('faction.thanh_hu_sect');
                summary = 'Ngươi chọn bái nhập Thanh Hư Tông. Từ đây đời đầu có một Đạo thống để dựa vào, nhưng con đường phía sau vẫn do chính ngươi chọn.';
                significance = 32;
                tags.push('Faction', 'Choice', 'SectPath');
            }
            else {
                if (!this.stateValue.knownLocationIds.includes('location.ancient_sword_cave'))
                    this.stateValue.knownLocationIds.push('location.ancient_sword_cave');
                this.stateValue.inventory['resource.spirit_stone'] = (this.stateValue.inventory['resource.spirit_stone'] ?? 0) + this.fateSpiritStoneGainV4(8);
                summary = 'Ngươi từ chối danh ngạch tông môn và tiếp tục làm tán tu. Một tin đồn về Cổ Kiếm Động được ghi lại làm đầu mối riêng.';
                significance = 32;
                tags.push('Choice', 'WandererPath', 'Exploration');
            }
        }
        else {
            throw new Error(`Unknown first-life story beat: ${beatId}`);
        }
        completeFirstLifeBeat(flow, beatId);
        const event = {
            id: `firstlife.${beatId}.${this.currentLifeValue.lifeId}.${this.actionIndexValue}`,
            worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears,
            type: beatId === 'first.choose_path' ? 'world' : 'system', significance, message: summary,
            actorId: this.profile.combatEntity.id, locationId: this.stateValue.locationId, tags,
            data: { beatId, path: path ?? '' },
        };
        this.historyValue.append(event);
        this.recordPlayerWorldEvent(event);
        this.actionIndexValue += 1;
        return { beatId, path: flow.firstLifeStory.path, summary, event, state: this.state };
    }
    configureOfflineRoutine(plan) {
        if (!plan) {
            const currentFlow = clonePlayerFlowState(this.stateValue.flow);
            delete currentFlow.offlineRoutine;
            this.stateValue.flow = currentFlow;
            return this.playerFlowState();
        }
        if (!this.stateValue.alive)
            throw new Error('Đời hiện tại đã kết thúc');
        const request = { ...plan.request };
        if (request.type === 'dungeon') {
            const floor = request.floor ?? 1;
            if (!isDungeonFloorCleared(this.stateValue.dungeons, request.dungeonId, floor)) {
                throw new Error('Phải công phá tầng phó bản trước khi đặt làm hoạt động treo');
            }
        }
        if (request.type === 'retreat') throw new Error('Bế Quan không còn là hoạt động offline; dùng Tự Tu hoặc Săn Ảo.');
        const currentFlow = clonePlayerFlowState(this.stateValue.flow);
        this.stateValue.flow = { ...currentFlow, offlineRoutine: {
                request,
                yearsPerRealHour: this.stateValue.timeModel === 'live-v1' ? WORLD_YEARS_PER_REAL_HOUR : Math.max(0, plan.yearsPerRealHour),
                maxOfflineYears: Math.max(0, plan.maxOfflineYears),
                huntFloor: plan.huntFloor,
                autoCombat: plan.autoCombat,
            } };
        return this.playerFlowState();
    }
    resolveConfiguredOffline(lastSeenUnixMs, nowUnixMs) {
        const routine = this.stateValue.flow?.offlineRoutine;
        if (!routine || !this.stateValue.alive)
            return undefined;
        return this.resolveOffline(routine, lastSeenUnixMs, nowUnixMs);
    }
    guidanceState() {
        return cloneGuidanceState(this.stateValue.guidance);
    }
    configureGuidance(patch) {
        const current = this.stateValue.guidance;
        this.stateValue.guidance = {
            ...current,
            ...patch,
            goals: patch.goals ? patch.goals.map(goal => ({ ...goal, priority: Math.max(0, Math.min(100, goal.priority)) })) : current.goals.map(goal => ({ ...goal })),
            resourcePolicy: { ...current.resourcePolicy, ...(patch.resourcePolicy ?? {}), reserveResources: { ...current.resourcePolicy.reserveResources, ...(patch.resourcePolicy?.reserveResources ?? {}) } },
            decisionHistory: current.decisionHistory.map(entry => ({ ...entry, reasons: [...entry.reasons] })),
            automationPolicy: normalizeGuidanceAutomationPolicy({ ...(current.automationPolicy ?? {}), ...(patch.automationPolicy ?? {}) }),
        };
        return this.guidanceState();
    }
    previewGuidance() {
        const requiredTuVi = cultivationRealmV140(this.stateValue.realm.maxRealmOrder).requiredTuVi;
        return planGuidance(this.stateValue, this.stateValue.guidance, this.world, this.registry, this.currentLifeValue.lifeId, requiredTuVi);
    }
    runGuidance(maxWorldYears = 20, maxDecisions = 20) {
        return runSessionGuidanceV141.call(this, maxWorldYears, maxDecisions);
    }
    npcState(npcId) {
        const npc = this.stateValue.worldSimulation.npcs[npcId];
        return npc ? { ...npc, claimedOpportunityIds: [...npc.claimedOpportunityIds] } : undefined;
    }
    worldHistory(limit = 20) {
        return [...worldChronicle(this.stateValue.worldSimulation, limit), ...socialChronicle(this.stateValue.social, limit), ...factionChronicle(this.stateValue.factions, limit)]
            .sort((a, b) => b.significance - a.significance || b.worldTimeYears - a.worldTimeYears)
            .slice(0, Math.max(0, limit))
            .sort((a, b) => a.worldTimeYears - b.worldTimeYears);
    }
    npcRelationship(npcId) {
        const key = `${this.currentLifeValue.lifeId}|${npcId}`;
        const relation = this.stateValue.worldSimulation.playerRelationships[key];
        return relation ? { ...relation, flags: [...relation.flags] } : undefined;
    }
    npcInteractionPreviewV128(npcId, action = 'greet') {
        const definition = this.world.npcs?.[npcId];
        const npc = this.stateValue.worldSimulation.npcs[npcId];
        const supported = ['greet', 'assist', 'daoDiscussion', 'gift', 'provoke'];
        const cost = action === 'assist' ? 5 : action === 'gift' ? 10 : 0;
        if (!supported.includes(action))
            return { action, available: false, disabledReason: 'Hành động Nhân Duyên không hợp lệ.', spiritStoneCost: cost, cooldownYearsRemaining: 0 };
        if (!this.stateValue.alive)
            return { action, available: false, disabledReason: 'Kiếp hiện tại đã kết thúc.', spiritStoneCost: cost, cooldownYearsRemaining: 0 };
        if (!definition || !npc)
            return { action, available: false, disabledReason: 'NPC không tồn tại trong thế giới hiện tại.', spiritStoneCost: cost, cooldownYearsRemaining: 0 };
        if (!npc.alive)
            return { action, available: false, disabledReason: `${definition.name} đã không còn tại thế.`, spiritStoneCost: cost, cooldownYearsRemaining: 0 };
        if (npc.locationId !== this.stateValue.locationId)
            return { action, available: false, disabledReason: `${definition.name} không ở địa điểm hiện tại.`, spiritStoneCost: cost, cooldownYearsRemaining: 0 };
        const relation = this.npcRelationship(npcId);
        const elapsed = relation?.met ? this.stateValue.worldTimeYears - Number(relation.lastInteractionWorldYear ?? -1e9) : Number.POSITIVE_INFINITY;
        const cooldownYearsRemaining = action === 'greet' || !relation?.met ? 0 : Math.max(0, 0.2 - elapsed);
        if (cooldownYearsRemaining > 1e-9)
            return { action, available: false, disabledReason: `Cần chờ thêm khoảng ${Math.ceil(cooldownYearsRemaining * 365)} ngày game trước khi tương tác tiếp.`, spiritStoneCost: cost, cooldownYearsRemaining };
        const stones = Number(this.stateValue.inventory['resource.spirit_stone'] ?? 0);
        if (stones < cost)
            return { action, available: false, disabledReason: `Cần ${cost} Linh Thạch; hiện có ${Math.floor(stones)}.`, spiritStoneCost: cost, cooldownYearsRemaining: 0 };
        return { action, available: true, disabledReason: '', spiritStoneCost: cost, cooldownYearsRemaining: 0 };
    }
    npcSocialRolePreviewV128(npcId, role) {
        const definition = this.world.npcs?.[npcId];
        const npc = this.stateValue.worldSimulation.npcs[npcId];
        const label = role === 'master' ? 'Bái Sư' : role === 'disciple' ? 'Thu Đồ' : 'Kết Đạo Lữ';
        if (!['master', 'disciple', 'daoPartner'].includes(role))
            return { role, label, available: false, disabledReason: 'Vai trò Nhân Duyên không hợp lệ.' };
        if (!this.stateValue.alive)
            return { role, label, available: false, disabledReason: 'Kiếp hiện tại đã kết thúc.' };
        if (!definition || !npc)
            return { role, label, available: false, disabledReason: 'NPC không tồn tại trong thế giới hiện tại.' };
        if (!npc.alive)
            return { role, label, available: false, disabledReason: `${definition.name} đã không còn tại thế.` };
        if (npc.locationId !== this.stateValue.locationId)
            return { role, label, available: false, disabledReason: `${definition.name} không ở địa điểm hiện tại.` };
        const relation = this.npcRelationship(npcId);
        if (!relation?.met)
            return { role, label, available: false, disabledReason: `Cần Kết Giao với ${definition.name} trước.` };
        const existingSame = this.stateValue.social.bonds.some(bond => bond.lifeId === this.currentLifeValue.lifeId && bond.npcId === npcId && bond.active && bond.role === role);
        if (existingSame)
            return { role, label, available: false, disabledReason: `Quan hệ ${label} với ${definition.name} đã được xác lập.` };
        const incompatible = this.stateValue.social.bonds.some(bond => bond.lifeId === this.currentLifeValue.lifeId && bond.npcId === npcId && bond.active && bond.role !== role);
        if (incompatible)
            return { role, label, available: false, disabledReason: `${definition.name} đã có một quan hệ trọng yếu khác trong đời này.` };
        if (role === 'master') {
            if (npc.realmOrder < this.stateValue.realm.maxRealmOrder + 2)
                return { role, label, available: false, disabledReason: 'Sư Phụ phải cao hơn người chơi ít nhất 2 bậc cảnh giới.' };
            if ((relation.respect ?? 0) < 12 || (relation.trust ?? 0) < 5)
                return { role, label, available: false, disabledReason: `Cần Kính ≥12 và Tin ≥5; hiện ${Number(relation.respect ?? 0).toFixed(1)}/${Number(relation.trust ?? 0).toFixed(1)}.` };
        }
        else if (role === 'disciple') {
            if (this.stateValue.realm.maxRealmOrder < npc.realmOrder + 2)
                return { role, label, available: false, disabledReason: 'Người chơi phải cao hơn NPC ít nhất 2 bậc cảnh giới.' };
            if ((relation.trust ?? 0) < 10 || (relation.respect ?? 0) < 5)
                return { role, label, available: false, disabledReason: `Cần Tin ≥10 và Kính ≥5; hiện ${Number(relation.trust ?? 0).toFixed(1)}/${Number(relation.respect ?? 0).toFixed(1)}.` };
        }
        else if ((relation.trust ?? 0) < 30 || (relation.karmaDepth ?? 0) < 20 || (relation.grudge ?? 0) > 15)
            return { role, label, available: false, disabledReason: `Cần Tin ≥30, Duyên ≥20, Oán ≤15; hiện ${Number(relation.trust ?? 0).toFixed(1)}/${Number(relation.karmaDepth ?? 0).toFixed(1)}/${Number(relation.grudge ?? 0).toFixed(1)}.` };
        return { role, label, available: true, disabledReason: '' };
    }
    socialBonds(role) {
        return this.stateValue.social.bonds
            .filter(bond => bond.lifeId === this.currentLifeValue.lifeId && bond.active && (!role || bond.role === role))
            .map(bond => ({ ...bond, transmittedKnowledgeIds: [...bond.transmittedKnowledgeIds] }));
    }
    familyMembers(sourceLifeId) {
        const lifeId = sourceLifeId ?? this.currentLifeValue.lifeId;
        return this.stateValue.social.familyMembers
            .filter(member => member.sourceLifeId === lifeId)
            .map(member => ({ ...member, bloodlines: member.bloodlines.map(lineage => ({ ...lineage })) }));
    }
    socialHistory(limit = 20) {
        return socialChronicle(this.stateValue.social, limit);
    }
    factionMembership() {
        const membership = playerFactionMembership(this.stateValue.factions, this.currentLifeValue.lifeId);
        return membership ? { ...membership } : undefined;
    }
    factionState(factionId) {
        const faction = this.stateValue.factions.factions[factionId];
        if (!faction)
            return undefined;
        return this.state.factions.factions[factionId];
    }
    factionHistory(limit = 20) {
        return factionChronicle(this.stateValue.factions, limit);
    }
    marketQuotesAtCurrentLocation() {
        const definitions = this.world.markets ?? {};
        return marketsAtLocation(this.stateValue.economy, this.stateValue.locationId)
            .flatMap(market => marketQuotes(this.stateValue.economy, definitions, market.id));
    }
    buyMarketResource(marketId, resourceId, quantity) {
        if (!this.stateValue.alive)
            throw new Error('Current life has ended');
        const market = this.stateValue.economy.markets[marketId];
        if (!market)
            throw new Error(`Unknown market: ${marketId}`);
        if (market.locationId !== this.stateValue.locationId)
            throw new Error(`Must be at ${market.name} to trade`);
        const definitions = this.world.markets ?? {};
        const previewState = cloneEconomyState(this.stateValue.economy);
        const preview = buyFromMarket(previewState, definitions, marketId, resourceId, quantity);
        const stones = this.stateValue.inventory['resource.spirit_stone'] ?? 0;
        if (stones + 1e-9 < preview.totalSpiritStones)
            throw new Error(`Insufficient spirit stones: ${stones}/${preview.totalSpiritStones}`);
        const transaction = buyFromMarket(this.stateValue.economy, definitions, marketId, resourceId, quantity);
        this.stateValue.inventory['resource.spirit_stone'] = stones - transaction.totalSpiritStones;
        this.stateValue.inventory[resourceId] = (this.stateValue.inventory[resourceId] ?? 0) + transaction.quantity;
        return this.finishMarketTrade('buy', transaction);
    }
    sellMarketResource(marketId, resourceId, quantity) {
        if (!this.stateValue.alive)
            throw new Error('Current life has ended');
        const market = this.stateValue.economy.markets[marketId];
        if (!market)
            throw new Error(`Unknown market: ${marketId}`);
        if (market.locationId !== this.stateValue.locationId)
            throw new Error(`Must be at ${market.name} to trade`);
        const units = Math.max(0, Math.floor(quantity));
        const available = this.stateValue.inventory[resourceId] ?? 0;
        if (units <= 0 || available + 1e-9 < units)
            throw new Error(`Insufficient ${resourceId}: ${available}/${units}`);
        const transaction = sellToMarket(this.stateValue.economy, this.world.markets ?? {}, marketId, resourceId, units);
        this.stateValue.inventory[resourceId] = available - units;
        this.stateValue.inventory['resource.spirit_stone'] = (this.stateValue.inventory['resource.spirit_stone'] ?? 0) + this.fateSpiritStoneGainV4(transaction.totalSpiritStones);
        return this.finishMarketTrade('sell', { ...transaction, totalSpiritStones:this.fateSpiritStoneGainV4(transaction.totalSpiritStones) });
    }
    /** v1.11 backend-first economy ledger + rotating Phường Thị. No frontend dependency. */
    alchemyTreeModifiers() {
        const tree = this.metaValue.reincarnationProgress?.tree;
        if (!tree)
            return {};
        return {
            yieldPct: nodeModifierValue(tree, 'alchemy.yieldPct'),
            timeReductionPct: nodeModifierValue(tree, 'alchemy.timeReductionPct'),
            materialEfficiencyPct: nodeModifierValue(tree, 'alchemy.materialEfficiencyPct'),
            qualityWeightBonus: nodeModifierValue(tree, 'alchemy.qualityWeightBonus'),
            masteryGainPct: nodeModifierValue(tree, 'alchemy.masteryGainPct'),
            expGainPct: nodeModifierValue(tree, 'alchemy.expGainPct'),
            permanentPillCapFlat: nodeModifierValue(tree, 'alchemy.permanentPillCapFlat'),
            masteryRetentionPct: nodeModifierValue(tree, 'alchemy.masteryRetentionPct'),
        };
    }
    alchemyFacilityProfileV85() {
        const collection = ensureCollectionProgressStateV12316(this.stateValue);
        const level = Math.max(1, Math.min(10, Math.floor(collection.cave.facilities.find(x => x.id === 'alchemy')?.level ?? 1)));
        const steps = Math.max(0, level - 1);
        const modifiers = {
            timeReductionPct: steps * 3,
            materialEfficiencyPct: steps,
            qualityWeightBonus: steps * 1.5,
            masteryGainPct: steps * 2,
            expGainPct: steps * 2,
        };
        return { level, modifiers };
    }
    alchemyProductionModifiersV85() {
        const tree = this.alchemyTreeModifiers(), facility = this.alchemyFacilityProfileV85().modifiers, talent = professionTalentModifiers(this.stateValue.inheritedOrigins, 'alchemy');
        const confidant = collectionConfidantV87Summary(this.stateValue.collectionV12316), specialty = confidant.activeSpecialty, alchemyPct = specialty?.unlocked && specialty.id === 'alchemy' ? specialty.strengthPct : 0, fortuneQuality = Math.max(0, confidant.fortune.craftQualityPct);
        const sum = (key) => (Number(tree[key] ?? 0) + Number(facility[key] ?? 0));
        return {
            yieldPct: sum('yieldPct') + alchemyPct * .5, timeReductionPct: sum('timeReductionPct'), materialEfficiencyPct: sum('materialEfficiencyPct') + alchemyPct * .35, qualityWeightBonus: sum('qualityWeightBonus') + Math.max(0, Number(talent.qualityScoreBonus ?? 0)) + alchemyPct + fortuneQuality,
            masteryGainPct: sum('masteryGainPct') + Math.max(0, (Number(talent.masteryGainMultiplier ?? 1) - 1) * 100) + alchemyPct * .5, expGainPct: sum('expGainPct'), permanentPillCapFlat: sum('permanentPillCapFlat'), masteryRetentionPct: sum('masteryRetentionPct'),
        };
    }
    currentAlchemyTier() {
        return economyTierForMajorRealmIndex(majorRealmIndexForRealmOrder(this.stateValue.realm.maxRealmOrder));
    }
    syncAlchemyRecipeKnowledgeV85() {
        const state = ensureAlchemyV112State(this.stateValue.economy), legacy = cloneAlchemyLegacy(this.metaValue.reincarnationProgress?.alchemyLegacy);
        state.knownRecipeIds = [...new Set([...state.knownRecipeIds, ...legacy.knownRecipeIds])];
        return state;
    }
    alchemyV112Summary() {
        // Read model must stay side-effect free. Resolve ready batches on a detached
        // Alchemy/inventory copy so the UI can preview the up-to-date state without
        // mutating the live save, history, daily quota or expired buff flags.
        const state = cloneAlchemyV112State(this.stateValue.economy.v112Alchemy) ?? createAlchemyV112State();
        const readInventory = { ...this.stateValue.inventory };
        const readContainer = { v112Alchemy: state };
        syncAlchemyV112({ container: readContainer, inventory: readInventory, worldYear: this.stateValue.worldTimeYears });
        const facility = this.alchemyFacilityProfileV85(), mods = this.alchemyProductionModifiersV85(), legacyKnowledge = cloneAlchemyLegacy(this.metaValue.reincarnationProgress?.alchemyLegacy), knownRecipeIds = [...new Set([...state.knownRecipeIds, ...legacyKnowledge.knownRecipeIds])], knownRecipeSet = new Set(knownRecipeIds);
        const promotion = alchemyPromotionRequirements(state);
        const recipes = alchemyRecipeCatalogue().filter(r => r.requiredAlchemyRank <= state.rank).map(recipe => {
            const progress = state.recipeProgress[recipe.id];
            const previewProgress = progress ?? { mastery: 0, specializationPoints: 0, specializationLevel: 0, batchesCompleted: 0, pillsCrafted: 0, highestQuality: 'low', qualityCounts: { low: 0, mid: 0, high: 0, supreme: 0 } };
            const snapshot = alchemyCraftSnapshot(state, previewProgress, mods);
            const availability = alchemyIngredientAvailability(this.stateValue.economy, readInventory, recipe.ingredients.map(x => ({ ...x, quantity: x.quantity * (recipe.allowedBatchSizes[0] ?? 1) })));
            const known = knownRecipeSet.has(recipe.id), researchCost = alchemyRecipeResearchCost(recipe), essence = Math.max(0, Math.floor(readInventory['resource.alchemy_essence'] ?? 0));
            return { id: recipe.id, family: recipe.family, realmTier: recipe.realmTier, name: recipe.name, requiredAlchemyRank: recipe.requiredAlchemyRank, baseCraftMinutes: recipe.baseCraftMinutes, allowedBatchSizes: [...recipe.allowedBatchSizes], known, researchCost, canResearch: !known && essence >= researchCost.alchemyEssence, ingredients: recipe.ingredients.map(x => ({ ...x, available: x.kind === 'treasure' && isHeavenlyTreasureResourceId(x.resourceId) ? heavenlyTreasureQuantity(this.stateValue.economy, readInventory, x.resourceId) : Math.max(0, readInventory[x.resourceId] ?? 0) })), progress: progress ? { ...progress, qualityCounts: { ...progress.qualityCounts } } : undefined, craftModifiers: snapshot, qualityWeights: alchemyQualityWeights(snapshot), canCraftBase: known && availability.every(x => x.missing <= 0) };
        });
        const currentPermanentCap = permanentPillCap(state.rank, state.turn, mods.permanentPillCapFlat ?? 0);
        const gardenSlots = alchemyGardenSlotCountV85(facility.level);
        const gardenPlots = state.garden.plots.map(plot => { const status = alchemyGardenPlotStatusV85(plot, this.stateValue.worldTimeYears), resourceId = alchemyGardenHerbResourceIdV85(plot.variant, plot.realmTier); return { ...plot, ...status, resourceId, name: economyMaterialDefinition(resourceId)?.name ?? resourceId, remainingRealSeconds: Math.max(0, (plot.maturesWorldYear - this.stateValue.worldTimeYears) / WORLD_YEARS_PER_REAL_HOUR * 3600) }; }).sort((a, b) => a.slot - b.slot);
        const gardenSeeds = ['qi', 'meridian', 'purity'].flatMap(variant => Array.from({ length: Math.min(8, this.currentAlchemyTier()) }, (_, i) => { const realmTier = i + 1, resourceId = alchemyGardenHerbResourceIdV85(variant, realmTier); return { variant, realmTier, resourceId, name: economyMaterialDefinition(resourceId)?.name ?? resourceId, available: Math.max(0, Math.floor(readInventory[resourceId] ?? 0)) }; })).filter(x => x.available > 0);
        const dayKey = alchemyVietnamDayKey(Date.now()), buffDaily = state.life.buffDaily.dayKey === dayKey ? { ...state.life.buffDaily } : { dayKey, used: 0 };
        const majorKey = String(majorRealmIndexForRealmOrder(this.stateValue.realm.maxRealmOrder));
        const storedBuff = state.life.activeBuff, currentBuff = storedBuff && storedBuff.expiresWorldYear > this.stateValue.worldTimeYears + 1e-9 ? storedBuff : undefined;
        const pills = Object.entries(readInventory).flatMap(([resourceId, quantity]) => { const desc = parseAlchemyPillResourceId(resourceId); const count = Math.max(0, Math.floor(Number(quantity) || 0)); if (!desc || count <= 0)
            return []; const lifeKey = `${desc.family}.t${desc.realmTier}`; return [{ resourceId, count, name: alchemyPillName(desc.family, desc.realmTier, desc.quality), family: desc.family, realmTier: desc.realmTier, quality: desc.quality, realmEfficiency: alchemyPillRealmEfficiency(this.currentAlchemyTier(), desc.realmTier), lifeStatUsed: lifePillStat(desc.family) ? Math.max(0, Math.floor(Math.max(state.life.temporaryStatPillsUsedByTier[lifeKey] ?? 0, state.life.temporaryStatPillsUsedByTier[String(desc.realmTier)] ?? 0))) : undefined }]; }).sort((a, b) => a.realmTier - b.realmTier || a.family.localeCompare(b.family) || a.quality.localeCompare(b.quality));
        return { schema: 'alchemy.v1.12', rank: state.rank, rankName: ALCHEMY_RANK_NAMES[state.rank - 1], turn: state.turn, turnName: ALCHEMY_TURN_NAMES[state.turn - 1], turnExp: state.turnExp, turnExpRequired: alchemyTurnExpRequirement(state.rank, state.turn), examReady: state.examReady, facility: { level: facility.level, modifiers: { ...facility.modifiers } }, garden: { slots: gardenSlots, plots: gardenPlots, seeds: gardenSeeds, telemetry: { planted: state.garden.planted, harvested: state.garden.harvested, herbsHarvested: state.garden.herbsHarvested }, rules: { spatialPacking: false, seedRarity: false, consumeOneHerbAsSeed: true, ageStages: ['mature', 'old', 'ancient'] } }, furnaces: { unlocked: alchemyFurnaceCount(state.rank), busy: state.queues.length, queues: state.queues.map(q => ({ ...q, ingredientsSpent: q.ingredientsSpent.map(x => ({ ...x })), snapshot: { ...q.snapshot } })) }, promotion, recipeKnowledge: { known: knownRecipeIds.length, availableEssence: Math.max(0, Math.floor(readInventory['resource.alchemy_essence'] ?? 0)), persistentAcrossReincarnation: true }, recipes, pills, life: { ...state.life, lifeStatBonus: { ...state.life.lifeStatBonus }, temporaryStatPillsUsedByTier: { ...state.life.temporaryStatPillsUsedByTier }, cultivationPillsUsedByMajorRealm: { ...state.life.cultivationPillsUsedByMajorRealm }, daoSuyPillsUsedByMajorRealm: { ...state.life.daoSuyPillsUsedByMajorRealm }, buffDaily, activeBuff: currentBuff ? { ...currentBuff, remainingRealSeconds: Math.max(0, (currentBuff.expiresWorldYear - this.stateValue.worldTimeYears) / WORLD_YEARS_PER_REAL_HOUR * 3600) } : undefined, permanentPillCap: currentPermanentCap, temporaryStatPillCapPerTier: ALCHEMY_TEMP_STAT_PILL_CAP_PER_TIER, cultivationPillCapPerMajorRealm: ALCHEMY_CULTIVATION_PILL_CAP_PER_MAJOR_REALM, cultivationPillsUsedCurrentMajorRealm: Math.max(0, Math.floor(state.life.cultivationPillsUsedByMajorRealm[majorKey] ?? 0)), daoSuyPillCapPerMajorRealm: ALCHEMY_DAO_SUY_PILL_CAP_PER_MAJOR_REALM, daoSuyPillsUsedCurrentMajorRealm: Math.max(0, Math.floor(state.life.daoSuyPillsUsedByMajorRealm[majorKey] ?? 0)), buffPillDailyCap: ALCHEMY_BUFF_PILL_DAILY_CAP, lifespanPillCapPct: ALCHEMY_LIFESPAN_PILL_CAP_PCT }, permanentStats: { ...emptyAlchemyAllocation(), ...(this.metaValue.reincarnationProgress?.alchemyPermanentStats ?? {}) }, legacy: cloneAlchemyLegacy(this.metaValue.reincarnationProgress?.alchemyLegacy), telemetry: { ...state.telemetry }, rules: { canonicalPillSystem: 'alchemy.v1.12/v85', noHpCnRecoveryPills: true, oneActiveBuff: true, buffDurationRealMinutes: ALCHEMY_BUFF_DURATION_REAL_MINUTES, yieldBasePct: 90, yieldCapPct: 120, timeReductionCapPct: 85, masteryMax: 1000, nextTierMasteryInheritancePct: 20, bigPillBatches: [1, 5, 10], qualityBase: { low: 65, mid: 27, high: 7, supreme: 1 } } };
    }
    startAlchemyV112(family, realmTier, batchSize, furnaceIndex = 0) {
        if (!this.stateValue.alive)
            throw new Error('Đời hiện tại đã kết thúc; không thể bắt đầu mẻ đan mới.');
        syncAlchemyV112({ container: this.stateValue.economy, inventory: this.stateValue.inventory, worldYear: this.stateValue.worldTimeYears });
        this.syncAlchemyRecipeKnowledgeV85();
        const seed = mixSeed(this.rootSeed ^ 0x12a1c4e9, this.actionIndexValue + Math.floor(realmTier) * 131 + furnaceIndex * 17 + batchSize);
        const job = startAlchemyCraft({ container: this.stateValue.economy, inventory: this.stateValue.inventory, worldYear: this.stateValue.worldTimeYears, worldYearsPerRealHour: WORLD_YEARS_PER_REAL_HOUR, family, realmTier, batchSize, furnaceIndex, seed, globalModifiers: this.alchemyProductionModifiersV85(), legacy: cloneAlchemyLegacy(this.metaValue.reincarnationProgress?.alchemyLegacy) });
        this.historyValue.append({ id: `alchemy.start.${job.id}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'resource', significance: 4, message: `Lò ${furnaceIndex + 1} bắt đầu ${alchemyRecipeDefinition(family, realmTier).name} ×${batchSize}; dự kiến ${(job.durationRealSeconds / 60).toFixed(1)} phút.`, locationId: this.stateValue.locationId, tags: ['Alchemy', 'CraftStart'], data: { recipeId: job.recipeId, batchSize, furnaceIndex, durationRealSeconds: job.durationRealSeconds } });
        const economyAwards = recordEconomyActivityV89(ensureCollectionProgressStateV12316(this.stateValue), 'craftActions', 1).awards;
        this.actionIndexValue += 1;
        return { job, state: this.state, alchemy: this.alchemyV112Summary(), economyAwards };
    }
    learnAlchemyRecipeV85(recipeId) {
        if (!this.stateValue.alive)
            throw new Error('Đời hiện tại đã kết thúc.');
        const state = this.syncAlchemyRecipeKnowledgeV85(), result = learnAlchemyRecipeV85({ state, inventory: this.stateValue.inventory, recipeId });
        const recipe = alchemyRecipeCatalogue().find(x => x.id === result.recipeId);
        this.metaValue.reincarnationProgress.alchemyLegacy = archiveAlchemyLegacy(cloneAlchemyLegacy(this.metaValue.reincarnationProgress.alchemyLegacy), state);
        this.historyValue.append({ id: `alchemy.recipe.learn.${this.actionIndexValue}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'system', significance: 8, message: `Lĩnh ngộ Đan Phương ${recipe.name}; tiêu ${result.cost.alchemyEssence} Dược Tính Tinh Hoa.`, locationId: this.stateValue.locationId, tags: ['Alchemy', 'Recipe', 'Knowledge'], data: { recipeId: recipe.id, alchemyEssenceCost: result.cost.alchemyEssence } });
        this.actionIndexValue += 1;
        return { ...result, alchemy: this.alchemyV112Summary(), state: this.state };
    }
    plantAlchemyGardenV85(variant, realmTier, slot) {
        if (!this.stateValue.alive)
            throw new Error('Đời hiện tại đã kết thúc.');
        const state = ensureAlchemyV112State(this.stateValue.economy), facility = this.alchemyFacilityProfileV85();
        if (realmTier > this.currentAlchemyTier())
            throw new Error('Chưa thể trồng Linh Thực vượt tier cảnh giới hiện tại.');
        const plot = plantAlchemyGardenV85({ state, inventory: this.stateValue.inventory, worldYear: this.stateValue.worldTimeYears, worldYearsPerRealHour: WORLD_YEARS_PER_REAL_HOUR, facilityLevel: facility.level, slot, variant, realmTier });
        this.historyValue.append({ id: `alchemy.garden.plant.${this.actionIndexValue}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'resource', significance: 3, message: `Dược Viên ô ${plot.slot + 1}: gieo ${economyMaterialDefinition(alchemyGardenHerbResourceIdV85(plot.variant, plot.realmTier))?.name ?? plot.variant} T${plot.realmTier}.`, locationId: this.stateValue.locationId, tags: ['Alchemy', 'Garden', 'Plant'], data: { ...plot } });
        this.actionIndexValue += 1;
        return { plot, alchemy: this.alchemyV112Summary(), state: this.state };
    }
    harvestAlchemyGardenV85(slot) {
        if (!this.stateValue.alive)
            throw new Error('Đời hiện tại đã kết thúc.');
        const state = ensureAlchemyV112State(this.stateValue.economy), facility = this.alchemyFacilityProfileV85(), result = harvestAlchemyGardenV85({ state, inventory: this.stateValue.inventory, worldYear: this.stateValue.worldTimeYears, facilityLevel: facility.level, slot });
        const confidant = collectionConfidantV87Summary(this.stateValue.collectionV12316), specialty = confidant.activeSpecialty, gardenPct = specialty?.unlocked && specialty.id === 'garden' ? specialty.strengthPct : 0, bonusYield = Math.max(0, Math.floor(result.yield * gardenPct / 100)), totalYield = result.yield + bonusYield;
        if (bonusYield > 0) {
            this.stateValue.inventory[result.resourceId] = (this.stateValue.inventory[result.resourceId] ?? 0) + bonusYield;
            state.garden.herbsHarvested += bonusYield;
        }
        const name = economyMaterialDefinition(result.resourceId)?.name ?? result.resourceId;
        this.historyValue.append({ id: `alchemy.garden.harvest.${this.actionIndexValue}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'resource', significance: result.stage === 'ancient' ? 10 : result.stage === 'old' ? 6 : 3, message: `Dược Viên thu ${totalYield} ${name}${bonusYield ? ` · Tri Kỷ +${bonusYield}` : ''} · ${result.stage === 'ancient' ? 'Cổ Linh' : result.stage === 'old' ? 'Lâu Năm' : 'Thành Thục'}.`, locationId: this.stateValue.locationId, tags: ['Alchemy', 'Garden', 'Harvest', result.stage, ...(bonusYield ? ['ConfidantV87'] : [])], data: { slot, stage: result.stage, yield: totalYield, baseYield: result.yield, confidantBonusYield: bonusYield, resourceId: result.resourceId, realmTier: result.plot.realmTier, variant: result.plot.variant } });
        this.actionIndexValue += 1;
        return { ...result, yield: totalYield, baseYield: result.yield, confidantBonusYield: bonusYield, alchemy: this.alchemyV112Summary(), state: this.state };
    }
    promoteAlchemyV112() {
        if (!this.stateValue.alive)
            throw new Error('Đời hiện tại đã kết thúc.');
        const state = ensureAlchemyV112State(this.stateValue.economy), result = promoteAlchemyRank(state);
        const tree = this.metaValue.reincarnationProgress.tree;
        tree.highestAchievementTierByTree.alchemy = Math.max(tree.highestAchievementTierByTree.alchemy ?? 0, result.to - 1);
        this.historyValue.append({ id: `alchemy.promote.${this.currentLifeValue.lifeId}.${this.actionIndexValue}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'system', significance: 20 + result.to * 3, message: `Đan Đạo đột phá: ${ALCHEMY_RANK_NAMES[result.from - 1]} → ${ALCHEMY_RANK_NAMES[result.to - 1]} · ${ALCHEMY_TURN_NAMES[0]}.`, locationId: this.stateValue.locationId, tags: ['Alchemy', 'Promotion', ALCHEMY_RANK_NAMES[result.to - 1]], data: { from: result.from, to: result.to } });
        this.actionIndexValue += 1;
        return { from: result.from, to: result.to, state: this.state, alchemy: this.alchemyV112Summary() };
    }
    useAlchemyPillV112(resourceId) {
        return useSessionAlchemyPillV141.call(this, resourceId);
    }
    economyProductionV111(nowUnixMs = Date.now()) {
        const activity = this.economyActivityV89(nowUnixMs);
        const economy = this.economyV111Summary();
        const collection = this.collectionSummaryV12316(nowUnixMs);
        const pvp = this.pvpV91(nowUnixMs);
        return buildEconomyProductionV111({ activity, economy, collection, pvp, nowUnixMs });
    }
    economyV111Summary() {
        const major = majorRealmIndexForRealmOrder(this.stateValue.realm.maxRealmOrder), tier = economyTierForMajorRealmIndex(major);
        // Read model must be pure: preview a naturally-refreshed shop on a cloned optional economy block.
        const previewContainer = { v111: cloneEconomyV111State(this.stateValue.economy.v111) ?? createEconomyV111State() };
        const shop = syncPhuongThi({ container: previewContainer, seed: this.rootSeed ^ 0x111ec0, worldYear: this.stateValue.worldTimeYears, majorRealmIndex: major, materialTier: tier, equipmentTemplateIds: [...this.registry.equipmentTemplates.values()].filter(t => !t.tags.includes('LegacySetV98') && (!t.tags.includes('SetV116') || isLiveEquipmentSetV12310(t.setId))).map(t => t.id) });
        const v = previewContainer.v111;
        const materials = Object.entries(this.stateValue.inventory).filter(([id, n]) => n > 0 && Boolean(economyMaterialDefinition(id))).map(([id, quantity]) => ({ id, quantity, definition: economyMaterialDefinition(id) })).sort((a, b) => a.definition.realmTier - b.definition.realmTier || a.definition.family.localeCompare(b.definition.family) || a.definition.name.localeCompare(b.definition.name));
        const treasures = Object.entries(heavenlyTreasureDefinitions).map(([id, definition]) => ({ id, name: definition.name, tags: [...definition.tags], quantity: heavenlyTreasureQuantity(previewContainer, this.stateValue.inventory, id) })).filter(x => x.quantity > 0);
        const specialStorage = v.specialStorage, usedSpecialSlots = Object.values(specialStorage.stacks).filter(n => Math.max(0, Math.floor(n ?? 0)) > 0).length;
        return { schema: 'economy.v1.11', majorRealmIndex: major, materialTier: tier, spiritStones: Math.max(0, this.stateValue.inventory['resource.spirit_stone'] ?? 0), ledger: { materials }, specialStorage: { capacity: specialStorage.capacity, usedSlots: usedSpecialSlots, protectedOverflow: specialStorage.protectedOverflow, treasures }, shop: { ...shop, slots: shop.slots.map(x => ({ ...x, tags: [...x.tags] })), manualRefreshCost: phuongThiManualRefreshCost(major, shop.manualRefreshCount) }, telemetry: { ...v.telemetry, materialDropsByFamily: { ...v.telemetry.materialDropsByFamily } }, rewardLoopV135: rewardLoopSummaryV135({ v135RewardLoop: this.stateValue.economy.v135RewardLoop }, offlineSpecialOpportunityFactorV127(this.stateValue)), rules: { materialUpgradeRatio: 10, shopRefreshHours: 6, targetDemandCoveragePct: 65, equipmentDirectSale: true, equipmentDisassembly: true, specialItemsUseStorage: true } };
    }
    refreshPhuongThiV111() {
        if (!this.stateValue.alive)
            throw new Error('Đời hiện tại đã kết thúc; không thể giao dịch Phường Thị.');
        const major = majorRealmIndexForRealmOrder(this.stateValue.realm.maxRealmOrder), tier = economyTierForMajorRealmIndex(major);
        const result = manualRefreshPhuongThi({ container: this.stateValue.economy, inventory: this.stateValue.inventory, seed: this.rootSeed ^ 0x111ec0, worldYear: this.stateValue.worldTimeYears, majorRealmIndex: major, materialTier: tier, equipmentTemplateIds: [...this.registry.equipmentTemplates.values()].filter(t => !t.tags.includes('LegacySetV98') && (!t.tags.includes('SetV116') || isLiveEquipmentSetV12310(t.setId))).map(t => t.id) });
        this.actionIndexValue += 1;
        return { cost: result.cost, shop: { ...result.shop, slots: result.shop.slots.map(x => ({ ...x, tags: [...x.tags] })) }, state: this.state };
    }
    buyPhuongThiV111(slotId, quantity = 1) {
        if (!this.stateValue.alive)
            throw new Error('Đời hiện tại đã kết thúc; không thể giao dịch Phường Thị.');
        const major = majorRealmIndexForRealmOrder(this.stateValue.realm.maxRealmOrder), tier = economyTierForMajorRealmIndex(major);
        const shop = syncPhuongThi({ container: this.stateValue.economy, seed: this.rootSeed ^ 0x111ec0, worldYear: this.stateValue.worldTimeYears, majorRealmIndex: major, materialTier: tier, equipmentTemplateIds: [...this.registry.equipmentTemplates.values()].filter(t => !t.tags.includes('LegacySetV98') && (!t.tags.includes('SetV116') || isLiveEquipmentSetV12310(t.setId))).map(t => t.id) });
        const slot = shop.slots.find(x => x.id === slotId);
        if (!slot)
            throw new Error('Không tìm thấy ô Phường Thị.');
        const confidant = collectionConfidantV87Summary(this.stateValue.collectionV12316), specialty = confidant.activeSpecialty, discountPct = specialty?.unlocked && specialty.id === 'market' ? specialty.strengthPct : 0, listPrice = slot.pricePerUnit, discountedPrice = Math.max(1, Math.ceil(listPrice * (1 - discountPct / 100)));
        if (slot.kind === 'resource') {
            slot.pricePerUnit = discountedPrice;
            try {
                const result = buyPhuongThiResource({ container: this.stateValue.economy, inventory: this.stateValue.inventory, shop, slotId, quantity });
                this.actionIndexValue += 1;
                return { kind: 'resource', ...result, listPricePerUnit: listPrice, discountPct, state: this.state };
            }
            finally {
                slot.pricePerUnit = listPrice;
            }
        }
        const qty = Math.max(1, Math.floor(quantity));
        if (qty !== 1 || slot.quantity < 1)
            throw new Error('Trang bị Phường Thị chỉ mua từng món và ô này đã hết hàng.');
        const cost = discountedPrice, stones = Math.max(0, Math.floor(this.stateValue.inventory['resource.spirit_stone'] ?? 0));
        if (stones < cost)
            throw new Error(`Không đủ Linh Thạch: cần ${cost}.`);
        if (!slot.equipmentTemplateId || !slot.equipmentQuality || !slot.equipmentGrade)
            throw new Error('Ô trang bị Phường Thị thiếu metadata.');
        this.stateValue.inventory['resource.spirit_stone'] = stones - cost;
        const template = this.registry.equipmentTemplate(slot.equipmentTemplateId);
        const item = buildEquipmentInstance(template, slot.equipmentTier ?? 0, slot.equipmentQuality, 1, { kind: 'field', dungeonId: 'market.phuong_thi', floor: 1, seed: slot.equipmentSeed ?? mixSeed(this.rootSeed, this.actionIndexValue) }, this.stateValue.worldTimeYears, slot.equipmentGrade);
        addEquipment(this.stateValue.equipment, item);
        slot.quantity = 0;
        const t = ensureEconomyV111State(this.stateValue.economy).telemetry;
        t.spiritStonesSpentShop += cost;
        t.shopPurchases += 1;
        this.actionIndexValue += 1;
        return { kind: 'equipment', slot: { ...slot, tags: [...slot.tags] }, cost, listPrice, discountPct, itemId: item.id, itemName: item.name, state: this.state };
    }
    sellEconomyMaterialV111(resourceId, quantity = 1) {
        if (!this.stateValue.alive)
            throw new Error('Đời hiện tại đã kết thúc; không thể giao dịch Phường Thị.');
        const major = majorRealmIndexForRealmOrder(this.stateValue.realm.maxRealmOrder);
        const beforeStones=Math.max(0,Number(this.stateValue.inventory['resource.spirit_stone'])||0);
        const result = sellEconomyMaterial({ container: this.stateValue.economy, inventory: this.stateValue.inventory, resourceId, quantity, majorRealmIndex: major });
        const baseGain=Math.max(0,(Number(this.stateValue.inventory['resource.spirit_stone'])||0)-beforeStones), adjustedGain=this.fateSpiritStoneGainV4(baseGain);
        if(adjustedGain>baseGain)this.stateValue.inventory['resource.spirit_stone']+=adjustedGain-baseGain;
        result.fateBonusSpiritStones=Math.max(0,adjustedGain-baseGain);
        this.actionIndexValue += 1;
        return { ...result, state: this.state };
    }
    convertEconomyMaterialV111(resourceId, batches = 1) {
        if (!this.stateValue.alive)
            throw new Error('Đời hiện tại đã kết thúc; không thể hợp thành nguyên liệu.');
        const result = convertEconomyMaterial(this.stateValue.inventory, resourceId, batches);
        ensureEconomyV111State(this.stateValue.economy).telemetry.materialConversions += result.received;
        this.actionIndexValue += 1;
        return { ...result, state: this.state };
    }
    useFactionService(serviceId) {
        if (!this.stateValue.alive)
            throw new Error('Current life has ended');
        const membership = playerFactionMembership(this.stateValue.factions, this.currentLifeValue.lifeId);
        if (!membership)
            throw new Error('Current life has no active faction membership');
        const faction = this.stateValue.factions.factions[membership.factionId];
        if (this.stateValue.locationId !== faction.locationId)
            throw new Error(`Must be at ${faction.name} to use faction services`);
        const service = factionServiceDefinitions[serviceId];
        const facilityLevel = faction.facilities[service.facility] ?? 0;
        if (facilityLevel < service.minFacilityLevel)
            throw new Error(`${service.name} requires ${service.facility} level ${service.minFacilityLevel}`);
        if (membership.merit < service.meritCost)
            throw new Error(`Insufficient faction merit: ${membership.merit}/${service.meritCost}`);
        const stones = this.stateValue.inventory['resource.spirit_stone'] ?? 0;
        if (stones < service.personalSpiritStoneCost)
            throw new Error(`Insufficient spirit stones: ${stones}/${service.personalSpiritStoneCost}`);
        for (const [resourceId, cost] of Object.entries(service.treasuryCosts)) {
            const available = faction.treasury[resourceId] ?? 0;
            if (available + 1e-9 < cost)
                throw new Error(`Faction treasury lacks ${resourceId}: ${available}/${cost}`);
        }
        membership.merit -= service.meritCost;
        this.stateValue.inventory['resource.spirit_stone'] = stones - service.personalSpiritStoneCost;
        for (const [resourceId, cost] of Object.entries(service.treasuryCosts))
            faction.treasury[resourceId] = (faction.treasury[resourceId] ?? 0) - cost;
        this.stateValue.economy.lifetime.meritSpent += service.meritCost;
        this.stateValue.economy.lifetime.spiritStonesSpent += service.personalSpiritStoneCost;
        this.stateValue.economy.lifetime.servicesUsed += 1;
        const seed = mixSeed(this.rootSeed ^ 0x6c8e9cf5, this.actionIndexValue);
        let summary = service.name;
        let equipmentId;
        if (service.output.kind === 'craftedProduct') {
            const output = service.output;
            let stock = this.stateValue.professions.stock.find(entry => entry.productId === output.productId && entry.quality === output.quality);
            if (!stock) {
                stock = { productId: output.productId, quality: output.quality, quantity: 0 };
                this.stateValue.professions.stock.push(stock);
            }
            stock.quantity += output.quantity;
            summary = `${service.name}: nhận ${output.quantity} ${productQualityNames[output.quality]} ${this.registry.craftedProduct(output.productId).name}.`;
        }
        else if (service.output.kind === 'injuryCare') {
            const reduction = Math.max(0, Number(service.output.injuryReduction) || 12) + facilityLevel;
            this.stateValue.injury = Math.max(0, this.stateValue.injury - reduction);
            summary = `${service.name}: Thương Thế giảm ${reduction.toFixed(0)}.`;
        }
        else {
            const template = this.registry.equipmentTemplate(service.output.templateId);
            const tier = Math.min(2, service.output.tier + Math.floor(Math.max(0, facilityLevel - service.minFacilityLevel) / 2));
            const quality = facilityLevel >= 4 ? 'supreme' : service.output.quality;
            const item = buildEquipmentInstance(template, tier, quality, 1, {
                kind: 'sectService', serviceId, factionId: faction.id, floor: 1, seed,
            }, this.stateValue.worldTimeYears);
            addEquipment(this.stateValue.equipment, item);
            equipmentId = item.id;
            summary = `${service.name}: ${item.name} đã nhập kho.`;
        }
        faction.prestige += 0.15;
        const elapsed = Math.min(0.01, this.remainingLifeYears());
        this.stateValue.worldTimeYears += elapsed;
        this.stateValue.ageYears += elapsed;
        const worldEvents = this.syncWorldState(this.stateValue, seed ^ 0x243f6a88);
        this.historyValue.appendMany(worldEvents);
        const event = {
            id: `economy.faction.service.${seed}.${serviceId}`,
            worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears,
            type: 'world', significance: service.output.kind === 'equipment' ? 13 : 8,
            message: summary, actorId: this.profile.combatEntity.id, locationId: faction.locationId,
            tags: ['Economy', 'FactionService', service.facility],
            data: { factionId: faction.id, serviceId, meritCost: service.meritCost, spiritStoneCost: service.personalSpiritStoneCost, equipmentId: equipmentId ?? '' },
        };
        this.historyValue.append(event);
        this.applyNaturalDeathToState(seed);
        this.actionIndexValue += 1;
        return { seed, serviceId, factionId: faction.id, meritCost: service.meritCost, spiritStoneCost: service.personalSpiritStoneCost, summary, equipmentId, event, state: this.state };
    }
    joinFaction(factionId) {
        if (!this.stateValue.alive)
            throw new Error('Current life has ended');
        const faction = this.stateValue.factions.factions[factionId];
        if (!faction)
            throw new Error(`Unknown faction: ${factionId}`);
        if (this.stateValue.locationId !== faction.locationId)
            throw new Error(`Must be at ${faction.name} to join`);
        const membership = joinFaction(this.stateValue.factions, factionId, this.currentLifeValue.lifeId, this.stateValue.worldTimeYears);
        const event = {
            id: `faction.join.${this.currentLifeValue.lifeId}.${factionId}.${this.actionIndexValue}`,
            worldTimeYears: this.stateValue.worldTimeYears,
            ageYears: this.stateValue.ageYears,
            type: 'world', significance: 16,
            message: `Ngươi bái nhập ${faction.name}, trở thành ${factionRankNames[membership.rank]}.`,
            actorId: this.profile.combatEntity.id,
            locationId: faction.locationId,
            tags: ['Faction', 'Relationship', 'FactionJoin'],
            data: { factionId, rank: membership.rank, playerLifeId: this.currentLifeValue.lifeId },
        };
        this.historyValue.append(event);
        this.recordFactionMajorEvent(event);
        this.actionIndexValue += 1;
        return { factionId, event, state: this.state };
    }
    leaveFaction() {
        const membership = playerFactionMembership(this.stateValue.factions, this.currentLifeValue.lifeId);
        if (!membership)
            throw new Error('Current life has no active faction membership');
        const faction = this.stateValue.factions.factions[membership.factionId];
        membership.active = false;
        const member = faction.members[`player:${this.currentLifeValue.lifeId}`];
        if (member)
            member.active = false;
        const event = {
            id: `faction.leave.${this.currentLifeValue.lifeId}.${this.actionIndexValue}`,
            worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears,
            type: 'world', significance: 20,
            message: `Ngươi rời ${faction.name}; danh phận tông môn của đời này kết thúc.`,
            actorId: this.profile.combatEntity.id, locationId: this.stateValue.locationId,
            tags: ['Faction', 'Relationship', 'FactionLeave'],
            data: { factionId: faction.id, playerLifeId: this.currentLifeValue.lifeId },
        };
        this.historyValue.append(event);
        this.recordFactionMajorEvent(event);
        this.actionIndexValue += 1;
        return { factionId: faction.id, event, state: this.state };
    }
    contributeToFaction(resourceId, quantity) {
        const membership = playerFactionMembership(this.stateValue.factions, this.currentLifeValue.lifeId);
        if (!membership)
            throw new Error('Current life has no active faction membership');
        const units = Math.max(0, Math.floor(quantity));
        const available = this.stateValue.inventory[resourceId] ?? 0;
        if (units <= 0 || available < units)
            throw new Error(`Insufficient resource ${resourceId}: ${available}/${units}`);
        this.stateValue.inventory[resourceId] = available - units;
        const result = contributeFactionResource(this.stateValue.factions, this.currentLifeValue.lifeId, resourceId, units);
        const faction = this.stateValue.factions.factions[membership.factionId];
        const event = {
            id: `faction.contribute.${this.currentLifeValue.lifeId}.${this.actionIndexValue}`,
            worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears,
            type: 'resource', significance: Math.min(24, 7 + Math.log2(1 + result.meritGained) * 3),
            message: `Ngươi cống hiến ${units} ${resourceId} cho ${faction.name}, nhận ${result.meritGained} công đức.`,
            actorId: this.profile.combatEntity.id, locationId: this.stateValue.locationId,
            tags: ['Faction', 'Relationship', 'FactionContribution'],
            data: { factionId: faction.id, resourceId, quantity: units, meritGained: result.meritGained, playerLifeId: this.currentLifeValue.lifeId },
        };
        this.historyValue.append(event);
        this.actionIndexValue += 1;
        return { factionId: faction.id, resourceId, quantity: units, meritGained: result.meritGained, event, state: this.state };
    }
    promoteInFaction() {
        const before = this.factionMembership();
        if (!before)
            throw new Error('Current life has no active faction membership');
        const membership = promoteFactionMembership(this.stateValue.factions, this.currentLifeValue.lifeId, this.stateValue.realm.maxRealmOrder);
        const faction = this.stateValue.factions.factions[membership.factionId];
        const event = {
            id: `faction.promote.${this.currentLifeValue.lifeId}.${this.actionIndexValue}`,
            worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears,
            type: 'world', significance: 18 + rankArchiveAccess(membership.rank) * 5,
            message: `Ngươi được ${faction.name} thăng làm ${factionRankNames[membership.rank]}.`,
            actorId: this.profile.combatEntity.id, locationId: faction.locationId,
            tags: ['Faction', 'Relationship', 'FactionPromotion'],
            data: { factionId: faction.id, fromRank: before.rank, toRank: membership.rank, playerLifeId: this.currentLifeValue.lifeId },
        };
        this.historyValue.append(event);
        this.recordFactionMajorEvent(event);
        this.actionIndexValue += 1;
        return { factionId: faction.id, event, state: this.state };
    }
    learnFromFaction(kind, knowledgeId) {
        const membership = playerFactionMembership(this.stateValue.factions, this.currentLifeValue.lifeId);
        if (!membership)
            throw new Error('Current life has no active faction membership');
        const faction = this.stateValue.factions.factions[membership.factionId];
        if (this.stateValue.locationId !== faction.locationId)
            throw new Error(`Must be at ${faction.name} to access its archive`);
        const list = kind === 'technique' ? faction.archive.techniqueIds : kind === 'skill' ? faction.archive.skillIds : faction.archive.recipeIds;
        const index = list.indexOf(knowledgeId);
        if (index < 0)
            throw new Error(`${knowledgeId} is not in ${faction.name} archive`);
        const requiredAccess = Math.min(3, index);
        if (rankArchiveAccess(membership.rank) < requiredAccess)
            throw new Error(`Faction rank too low for archive item ${knowledgeId}`);
        const meritCost = (kind === 'technique' ? 24 : kind === 'skill' ? 14 : 18) + index * 8;
        if (membership.merit < meritCost)
            throw new Error(`Insufficient faction merit: ${membership.merit}/${meritCost}`);
        membership.merit -= meritCost;
        if (kind === 'technique')
            this.learnTechnique(knowledgeId, 4 + faction.facilities.scriptureHall * 2);
        else if (kind === 'skill')
            this.learnSkill(knowledgeId);
        else {
            const recipe = this.registry.professionRecipe(knowledgeId);
            const track = this.stateValue.professions.tracks[recipe.professionId];
            if (!track)
                throw new Error(`Unknown profession track: ${recipe.professionId}`);
            if (!track.knownRecipeIds.includes(knowledgeId))
                track.knownRecipeIds.push(knowledgeId);
        }
        const event = {
            id: `faction.archive.learn.${this.currentLifeValue.lifeId}.${this.actionIndexValue}`,
            worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears,
            type: 'world', significance: 13 + requiredAccess * 3,
            message: `Ngươi dùng ${meritCost} công đức tại ${faction.name}, lĩnh hội ${knowledgeId}.`,
            actorId: this.profile.combatEntity.id, locationId: faction.locationId,
            tags: ['Faction', 'Relationship', 'Transmission', 'ArchiveLearning'],
            data: { factionId: faction.id, kind, knowledgeId, meritCost, playerLifeId: this.currentLifeValue.lifeId },
        };
        this.historyValue.append(event);
        this.actionIndexValue += 1;
        return { factionId: faction.id, kind, knowledgeId, meritChange: -meritCost, event, state: this.state };
    }
    contributeKnowledgeToFaction(kind, knowledgeId) {
        const membership = playerFactionMembership(this.stateValue.factions, this.currentLifeValue.lifeId);
        if (!membership)
            throw new Error('Current life has no active faction membership');
        if (kind === 'technique' && !this.stateValue.character.knownTechniqueIds.includes(knowledgeId))
            throw new Error(`Technique not known: ${knowledgeId}`);
        if (kind === 'skill' && !this.stateValue.character.knownSkillIds.includes(knowledgeId))
            throw new Error(`Skill not known: ${knowledgeId}`);
        if (kind === 'recipe' && !Object.values(this.stateValue.professions.tracks).some(track => track.knownRecipeIds.includes(knowledgeId)))
            throw new Error(`Recipe not known: ${knowledgeId}`);
        const result = contributeFactionKnowledge(this.stateValue.factions, this.currentLifeValue.lifeId, kind, knowledgeId);
        const faction = this.stateValue.factions.factions[membership.factionId];
        const event = {
            id: `faction.archive.contribute.${this.currentLifeValue.lifeId}.${this.actionIndexValue}`,
            worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears,
            type: 'world', significance: result.added ? 22 : 6,
            message: result.added ? `Ngươi đem ${knowledgeId} nhập vào truyền thừa ${faction.name}, nhận ${result.meritGained} công đức.` : `${knowledgeId} đã có trong truyền thừa ${faction.name}.`,
            actorId: this.profile.combatEntity.id, locationId: this.stateValue.locationId,
            tags: ['Faction', 'Relationship', 'Transmission', result.added ? 'NewInheritance' : 'KnownInheritance'],
            data: { factionId: faction.id, kind, knowledgeId, meritGained: result.meritGained, playerLifeId: this.currentLifeValue.lifeId },
        };
        this.historyValue.append(event);
        if (result.added)
            this.recordFactionMajorEvent(event);
        this.actionIndexValue += 1;
        return { factionId: faction.id, kind, knowledgeId, meritChange: result.meritGained, event, state: this.state };
    }
    inviteNpcToFaction(npcId) {
        const membership = playerFactionMembership(this.stateValue.factions, this.currentLifeValue.lifeId);
        if (!membership)
            throw new Error('Current life has no active faction membership');
        if (rankArchiveAccess(membership.rank) < rankArchiveAccess('elder'))
            throw new Error('Only elders or the leader may recruit members');
        const faction = this.stateValue.factions.factions[membership.factionId];
        const npc = this.stateValue.worldSimulation.npcs[npcId];
        const relation = this.npcRelationship(npcId);
        if (!npc?.alive)
            throw new Error(`NPC unavailable: ${npcId}`);
        if (!relation?.met || relation.trust < 28 || relation.respect < 20 || relation.grudge > 20)
            throw new Error(`Relationship with ${npcId} is insufficient for recruitment`);
        for (const other of Object.values(this.stateValue.factions.factions)) {
            if (other.members[`npc:${npcId}`]?.active)
                throw new Error(`${npcId} already belongs to ${other.name}`);
        }
        const rank = npc.realmOrder >= 14 ? 'elder' : npc.realmOrder >= 9 ? 'coreDisciple' : npc.realmOrder >= 4 ? 'innerDisciple' : 'outerDisciple';
        faction.members[`npc:${npcId}`] = { memberId: npcId, memberType: 'npc', rank, joinedWorldYear: this.stateValue.worldTimeYears, contribution: 0, active: true };
        const definition = this.world.npcs?.[npcId];
        const event = {
            id: `faction.recruit.${this.currentLifeValue.lifeId}.${npcId}.${this.actionIndexValue}`,
            worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears,
            type: 'world', significance: 20 + rankArchiveAccess(rank) * 3,
            message: `${definition?.name ?? npcId} nhận lời gia nhập ${faction.name} với thân phận ${factionRankNames[rank]}.`,
            actorId: this.profile.combatEntity.id, targetId: npcId, locationId: this.stateValue.locationId,
            tags: ['Faction', 'Relationship', 'Recruitment'],
            data: { factionId: faction.id, npcId, rank, playerLifeId: this.currentLifeValue.lifeId },
        };
        this.historyValue.append(event);
        this.recordFactionMajorEvent(event);
        this.actionIndexValue += 1;
        return { factionId: faction.id, event, state: this.state };
    }
    teachFactionMember(npcId, knowledgeId) {
        const membership = playerFactionMembership(this.stateValue.factions, this.currentLifeValue.lifeId);
        if (!membership)
            throw new Error('Current life has no active faction membership');
        if (rankArchiveAccess(membership.rank) < rankArchiveAccess('elder'))
            throw new Error('Only elders or the leader may formally transmit to faction members');
        const faction = this.stateValue.factions.factions[membership.factionId];
        const member = faction.members[`npc:${npcId}`];
        const npc = this.stateValue.worldSimulation.npcs[npcId];
        if (!member?.active || !npc?.alive)
            throw new Error(`${npcId} is not an active faction member`);
        const known = faction.archive.techniqueIds.includes(knowledgeId) || faction.archive.skillIds.includes(knowledgeId) || faction.archive.recipeIds.includes(knowledgeId);
        if (!known)
            throw new Error(`${knowledgeId} is not recorded in faction transmission`);
        const gain = 2.5 + faction.facilities.scriptureHall * 0.8;
        npc.cultivationProgress += gain;
        member.contribution += 2;
        adjustPlayerNpcRelationship(this.stateValue.worldSimulation, this.currentLifeValue.lifeId, npcId, this.stateValue.worldTimeYears, { trust: 2, respect: 3, debt: 1, karmaDepth: 1.5 }, ['FactionTeaching']);
        const definition = this.world.npcs?.[npcId];
        const event = {
            id: `faction.teach.${this.currentLifeValue.lifeId}.${npcId}.${this.actionIndexValue}`,
            worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears,
            type: 'world', significance: 15,
            message: `Ngươi tại ${faction.name} truyền ${knowledgeId} cho ${definition?.name ?? npcId}.`,
            actorId: this.profile.combatEntity.id, targetId: npcId, locationId: faction.locationId,
            tags: ['Faction', 'Relationship', 'Transmission', 'FactionTeaching'],
            data: { factionId: faction.id, npcId, knowledgeId, cultivationProgressGain: gain, playerLifeId: this.currentLifeValue.lifeId },
        };
        this.historyValue.append(event);
        this.actionIndexValue += 1;
        return { factionId: faction.id, event, state: this.state };
    }
    foundFaction(name, doctrineTags = []) {
        if (!this.stateValue.alive)
            throw new Error('Current life has ended');
        if (playerFactionMembership(this.stateValue.factions, this.currentLifeValue.lifeId))
            throw new Error('Leave the current faction before founding another');
        if (this.stateValue.realm.maxRealmOrder < 14)
            throw new Error('Founding a faction requires at least Tử Phủ');
        const cost = 300;
        const stones = this.stateValue.inventory['resource.spirit_stone'] ?? 0;
        if (stones < cost)
            throw new Error(`Founding a faction requires ${cost} spirit stones`);
        this.stateValue.inventory['resource.spirit_stone'] = stones - cost;
        const created = foundPlayerFaction(this.stateValue.factions, this.currentLifeValue.lifeId, this.stateValue.worldTimeYears, name, this.stateValue.locationId, doctrineTags);
        created.faction.treasury['resource.spirit_stone'] = cost;
        const event = {
            id: `faction.found.${this.currentLifeValue.lifeId}.${this.actionIndexValue}`,
            worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears,
            type: 'world', significance: 48,
            message: `Ngươi khai sơn lập phái, dựng nên ${created.faction.name}.`,
            actorId: this.profile.combatEntity.id, locationId: this.stateValue.locationId,
            tags: ['Faction', 'Relationship', 'FactionFounded', 'Legacy'],
            data: { factionId: created.faction.id, playerLifeId: this.currentLifeValue.lifeId },
        };
        this.historyValue.append(event);
        this.recordFactionMajorEvent(event);
        this.actionIndexValue += 1;
        return { factionId: created.faction.id, event, state: this.state };
    }
    upgradeFactionFacility(facilityId) {
        const membership = playerFactionMembership(this.stateValue.factions, this.currentLifeValue.lifeId);
        if (!membership)
            throw new Error('Current life has no active faction membership');
        const faction = this.stateValue.factions.factions[membership.factionId];
        const result = upgradeFactionFacility(this.stateValue.factions, this.currentLifeValue.lifeId, facilityId);
        const event = {
            id: `faction.facility.${faction.id}.${facilityId}.${this.actionIndexValue}`,
            worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears,
            type: 'world', significance: 24 + result.levelAfter * 2,
            message: `${faction.name} nâng ${facilityId} từ tầng ${result.levelBefore} lên tầng ${result.levelAfter}.`,
            actorId: this.profile.combatEntity.id, locationId: faction.locationId,
            tags: ['Faction', 'FactionFacility', 'Legacy'],
            data: { factionId: faction.id, facilityId, levelBefore: result.levelBefore, levelAfter: result.levelAfter, spiritStoneCost: result.spiritStoneCost, playerLifeId: this.currentLifeValue.lifeId },
        };
        this.historyValue.append(event);
        this.recordFactionMajorEvent(event);
        this.actionIndexValue += 1;
        return { factionId: faction.id, event, state: this.state };
    }
    orthodoxyState() {
        return cloneOrthodoxyState(this.stateValue.orthodoxy ?? createOrthodoxyState(this.stateValue.worldTimeYears));
    }
    establishImmortalOrthodoxy() {
        if (this.stateValue.realm.maxRealmOrder < 78)
            throw new Error('Cần Tiên Vương mới có thể dựng Đạo Thống Tiên Vực.');
        const membership = playerFactionMembership(this.stateValue.factions, this.currentLifeValue.lifeId);
        if (!membership)
            throw new Error('Cần có thế lực của đời hiện tại trước khi dựng Đạo Thống.');
        if (rankArchiveAccess(membership.rank) < rankArchiveAccess('elder'))
            throw new Error('Cần ít nhất thân phận Trưởng Lão/Tông Chủ để dựng Đạo Thống.');
        const faction = this.stateValue.factions.factions[membership.factionId];
        const need = 40;
        const have = this.stateValue.inventory['resource.king_domain_core'] ?? 0;
        if (have < need)
            throw new Error(`Dựng Đạo Thống cần ${need} Vương Vực Hạch.`);
        this.stateValue.inventory['resource.king_domain_core'] = have - need;
        const orth = this.stateValue.orthodoxy ?? (this.stateValue.orthodoxy = createOrthodoxyState(this.stateValue.worldTimeYears));
        const result = elevateOrthodoxy(orth, this.stateValue.factions, faction.id, this.stateValue.worldTimeYears, this.stateValue.immortal.kingDomainAuthority, this.stateValue.immortal.orthodoxyWeight);
        const daoName = this.stateValue.dao.mainDaoId ? this.registry.dao(this.stateValue.dao.mainDaoId).name : 'Vô Danh Đạo';
        if (this.stateValue.dao.mainDaoId && !result.doctrineTags.includes(this.stateValue.dao.mainDaoId))
            result.doctrineTags.push(this.stateValue.dao.mainDaoId);
        const msg = `${faction.name} lập Tiên Vực Đạo Thống cấp ${result.level}, lấy ${daoName} làm một trong các trụ truyền thừa; Đạo Quyền ${result.doctrineAuthority.toFixed(1)}.`;
        const event = { id: `orthodoxy.establish.${faction.id}.${this.actionIndexValue}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'world', significance: 92, message: msg, locationId: faction.locationId, tags: ['Orthodoxy', 'ImmortalDomain', 'Faction', 'Legacy'], data: { factionId: faction.id, level: result.level, authority: result.doctrineAuthority, playerLifeId: this.currentLifeValue.lifeId } };
        this.historyValue.append(event);
        this.recordFactionMajorEvent(event);
        this.recordPlayerWorldEvent(event);
        this.actionIndexValue += 1;
        return { factionId: faction.id, summary: msg, state: this.state };
    }
    claimImmortalTerritory(locationId) {
        const membership = playerFactionMembership(this.stateValue.factions, this.currentLifeValue.lifeId);
        if (!membership)
            throw new Error('Không có thế lực hiện tại.');
        const orth = this.stateValue.orthodoxy ?? (this.stateValue.orthodoxy = createOrthodoxyState(this.stateValue.worldTimeYears));
        const own = orth.orthodoxies[membership.factionId];
        if (!own)
            throw new Error('Thế lực chưa dựng Đạo Thống Tiên Vực.');
        const location = this.world.locations[locationId];
        if (!location)
            throw new Error(`Không rõ địa điểm: ${locationId}`);
        if (!this.stateValue.knownLocationIds.includes(locationId) && this.stateValue.locationId !== locationId)
            throw new Error('Cần biết/đặt chân tới vùng này trước khi sắc lập lãnh thổ.');
        if ((location.requiredRealmOrder ?? 0) > this.stateValue.realm.maxRealmOrder)
            throw new Error('Cảnh giới hiện tại không chịu nổi pháp tắc tại lãnh thổ này.');
        const cap = orthodoxyTerritoryCapacity(this.stateValue.immortal.kingDomainAuthority, this.stateValue.immortal.orthodoxyWeight, own.level);
        const result = claimOrthodoxyTerritory(orth, membership.factionId, locationId, cap);
        if (!result.claimed)
            return { factionId: membership.factionId, summary: `${location.name} đã thuộc Đạo Thống của ngươi.`, state: this.state };
        this.stateValue.immortal.orthodoxyWeight = Math.min(100, this.stateValue.immortal.orthodoxyWeight + 0.8);
        const msg = `${location.name} được sắc lập thành lãnh thổ Đạo Thống (${result.territoryCount}/${cap}); pháp tắc truyền thừa bắt đầu bén rễ.`;
        const event = { id: `orthodoxy.claim.${membership.factionId}.${locationId}.${this.actionIndexValue}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'world', significance: 64, message: msg, locationId, tags: ['Orthodoxy', 'Territory', 'ImmortalDomain'], data: { factionId: membership.factionId, locationId, territoryCount: result.territoryCount, capacity: cap } };
        this.historyValue.append(event);
        this.recordFactionMajorEvent(event);
        this.recordPlayerWorldEvent(event);
        this.actionIndexValue += 1;
        return { factionId: membership.factionId, summary: msg, state: this.state };
    }
    declareImmortalWar(targetFactionId, contestedLocationId) {
        if (this.stateValue.realm.maxRealmOrder < 78)
            throw new Error('Tiên Vương mới có tư cách phát động Tiên Vực chiến.');
        const membership = playerFactionMembership(this.stateValue.factions, this.currentLifeValue.lifeId);
        if (!membership)
            throw new Error('Không có thế lực hiện tại.');
        const orth = this.stateValue.orthodoxy ?? (this.stateValue.orthodoxy = createOrthodoxyState(this.stateValue.worldTimeYears));
        const own = orth.orthodoxies[membership.factionId];
        if (!own)
            throw new Error('Thế lực của ngươi chưa thành Đạo Thống.');
        const targetFaction = this.stateValue.factions.factions[targetFactionId];
        if (!targetFaction)
            throw new Error(`Không rõ thế lực: ${targetFactionId}`);
        let targetOrth = orth.orthodoxies[targetFactionId];
        if (!targetOrth) {
            const authority = Math.max(55, Math.min(100, targetFaction.prestige / 12));
            targetOrth = elevateOrthodoxy(orth, this.stateValue.factions, targetFactionId, this.stateValue.worldTimeYears, authority, authority);
        }
        const target = contestedLocationId ?? targetOrth.territoryIds[0];
        if (!target)
            throw new Error('Đối phương không có lãnh thổ để tranh đoạt.');
        const war = declareOrthodoxyWar(orth, membership.factionId, targetFactionId, target, this.stateValue.worldTimeYears);
        const place = this.world.locations[target]?.name ?? target;
        const msg = `${own.name} tuyên chiến ${targetOrth.name}, tranh ${place}. Tiên Vực chiến bắt đầu.`;
        const event = { id: `orthodoxy.war.start.${war.id}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'world', significance: 105, message: msg, locationId: target, tags: ['Orthodoxy', 'War', 'ImmortalWar'], data: { warId: war.id, attackerFactionId: war.attackerFactionId, defenderFactionId: war.defenderFactionId, locationId: target } };
        this.historyValue.append(event);
        this.recordFactionMajorEvent(event);
        this.recordPlayerWorldEvent(event);
        this.actionIndexValue += 1;
        return { warId: war.id, summary: msg, state: this.state };
    }
    fightImmortalWarCampaign(warId) {
        const membership = playerFactionMembership(this.stateValue.factions, this.currentLifeValue.lifeId);
        if (!membership)
            throw new Error('Không có thế lực hiện tại.');
        const orth = this.stateValue.orthodoxy ?? (this.stateValue.orthodoxy = createOrthodoxyState(this.stateValue.worldTimeYears));
        const integration = this.integrationSummary();
        const playerPower = this.stateValue.realm.maxRealmOrder * 7 + this.stateValue.immortal.kingDomainAuthority * 1.2 + this.stateValue.immortal.emperorMandate * 1.3 + this.stateValue.immortal.worldAuthority + integration.harmony * 0.8 + Math.max(0, ...Object.values(this.stateValue.dao.known).map(progress => progress.depth)) * 0.35;
        const seed = mixSeed(this.rootSeed ^ 0x7a11c0de, this.actionIndexValue);
        const roll = (seed % 1_000_000) / 1_000_000;
        const r = resolveOrthodoxyCampaign(orth, warId, membership.factionId, playerPower, roll);
        const war = orth.wars[warId];
        const place = this.world.locations[war.contestedLocationId]?.name ?? war.contestedLocationId;
        const playerWon = membership.factionId === war.attackerFactionId ? r.attackerWon : !r.attackerWon;
        if (playerWon) {
            this.stateValue.immortal.orthodoxyWeight = Math.min(100, this.stateValue.immortal.orthodoxyWeight + 0.55);
            this.stateValue.immortal.kingDomainAuthority = Math.min(100, this.stateValue.immortal.kingDomainAuthority + 0.35);
        }
        const msg = `Chiến dịch tại ${place}: ${playerWon ? 'THẮNG' : 'THUA'} · chiến cục ${war.score >= 0 ? '+' : ''}${war.score}. ${r.warEnded ? `Chiến tranh kết thúc, ${orth.orthodoxies[r.winnerFactionId]?.name ?? r.winnerFactionId} thắng.${r.territoryTransferred ? ' Lãnh thổ đổi chủ.' : ''}` : 'Hai bên tiếp tục giằng co.'}`;
        const event = { id: `orthodoxy.war.campaign.${warId}.${war.campaigns}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'combat', significance: r.warEnded ? 135 : 72, message: msg, locationId: war.contestedLocationId, tags: ['Orthodoxy', 'War', 'ImmortalWar', playerWon ? 'Victory' : 'Defeat'], data: { warId, score: war.score, playerWon, warEnded: r.warEnded, winnerFactionId: r.winnerFactionId ?? '' } };
        this.historyValue.append(event);
        this.recordFactionMajorEvent(event);
        this.recordPlayerWorldEvent(event);
        this.actionIndexValue += 1;
        return { warId, won: playerWon, ended: r.warEnded, summary: msg, state: this.state };
    }
    formImmortalAlliance(targetFactionId) {
        if (this.stateValue.realm.maxRealmOrder < 78)
            throw new Error('Tiên Vương mới có tư cách ký Tiên Minh.');
        const membership = playerFactionMembership(this.stateValue.factions, this.currentLifeValue.lifeId);
        if (!membership)
            throw new Error('Không có thế lực hiện tại.');
        const orth = this.stateValue.orthodoxy ?? (this.stateValue.orthodoxy = createOrthodoxyState(this.stateValue.worldTimeYears));
        if (!orth.orthodoxies[membership.factionId])
            throw new Error('Thế lực của ngươi chưa thành Đạo Thống.');
        const target = this.stateValue.factions.factions[targetFactionId];
        if (!target)
            throw new Error(`Không rõ thế lực: ${targetFactionId}`);
        if (!orth.orthodoxies[targetFactionId]) {
            const authority = Math.max(55, Math.min(100, target.prestige / 12));
            elevateOrthodoxy(orth, this.stateValue.factions, targetFactionId, this.stateValue.worldTimeYears, authority, authority);
        }
        const relation = formOrthodoxyAlliance(orth, membership.factionId, targetFactionId, this.stateValue.worldTimeYears);
        this.stateValue.immortal.orthodoxyWeight = Math.min(100, this.stateValue.immortal.orthodoxyWeight + 0.35);
        const msg = `${orth.orthodoxies[membership.factionId].name} và ${orth.orthodoxies[targetFactionId].name} kết Tiên Minh · tín nhiệm ${relation.trust.toFixed(1)} · căng thẳng ${relation.tension.toFixed(1)}.`;
        const event = { id: `orthodoxy.alliance.${membership.factionId}.${targetFactionId}.${this.actionIndexValue}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'world', significance: 78, message: msg, tags: ['Orthodoxy', 'Diplomacy', 'Alliance'], data: { factionId: membership.factionId, targetFactionId } };
        this.historyValue.append(event);
        this.recordFactionMajorEvent(event);
        this.recordPlayerWorldEvent(event);
        this.actionIndexValue += 1;
        return { targetFactionId, summary: msg, state: this.state };
    }
    establishImmortalVassal(targetFactionId) {
        if (this.stateValue.realm.maxRealmOrder < 82)
            throw new Error('Cần Tiên Đế mới đủ Đạo Quyền sắc lập chư hầu ổn định.');
        const membership = playerFactionMembership(this.stateValue.factions, this.currentLifeValue.lifeId);
        if (!membership)
            throw new Error('Không có thế lực hiện tại.');
        const orth = this.stateValue.orthodoxy ?? (this.stateValue.orthodoxy = createOrthodoxyState(this.stateValue.worldTimeYears));
        if (!orth.orthodoxies[membership.factionId])
            throw new Error('Thế lực của ngươi chưa thành Đạo Thống.');
        const target = this.stateValue.factions.factions[targetFactionId];
        if (!target)
            throw new Error(`Không rõ thế lực: ${targetFactionId}`);
        if (!orth.orthodoxies[targetFactionId]) {
            const authority = Math.max(55, Math.min(100, target.prestige / 12));
            elevateOrthodoxy(orth, this.stateValue.factions, targetFactionId, this.stateValue.worldTimeYears, authority, authority);
        }
        const relation = establishOrthodoxyVassalage(orth, membership.factionId, targetFactionId, this.stateValue.worldTimeYears);
        this.stateValue.immortal.orthodoxyWeight = Math.min(100, this.stateValue.immortal.orthodoxyWeight + 0.6);
        const msg = `${orth.orthodoxies[targetFactionId].name} trở thành chư hầu của ${orth.orthodoxies[membership.factionId].name}; cống suất ${(relation.tributeRate * 100).toFixed(0)}%.`;
        const event = { id: `orthodoxy.vassal.${membership.factionId}.${targetFactionId}.${this.actionIndexValue}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'world', significance: 92, message: msg, tags: ['Orthodoxy', 'Diplomacy', 'Vassal'], data: { factionId: membership.factionId, targetFactionId } };
        this.historyValue.append(event);
        this.recordFactionMajorEvent(event);
        this.recordPlayerWorldEvent(event);
        this.actionIndexValue += 1;
        return { targetFactionId, summary: msg, state: this.state };
    }
    dissolveImmortalDiplomacy(targetFactionId) {
        const membership = playerFactionMembership(this.stateValue.factions, this.currentLifeValue.lifeId);
        if (!membership)
            throw new Error('Không có thế lực hiện tại.');
        const orth = this.stateValue.orthodoxy ?? (this.stateValue.orthodoxy = createOrthodoxyState(this.stateValue.worldTimeYears));
        const relation = dissolveOrthodoxyPact(orth, membership.factionId, targetFactionId, this.stateValue.worldTimeYears);
        const msg = `${orth.orthodoxies[membership.factionId]?.name ?? membership.factionId} hủy minh ước/chư hầu với ${orth.orthodoxies[targetFactionId]?.name ?? targetFactionId}; quan hệ trở về trung lập, căng thẳng ${relation.tension.toFixed(1)}.`;
        const event = { id: `orthodoxy.diplomacy.dissolve.${membership.factionId}.${targetFactionId}.${this.actionIndexValue}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'world', significance: 54, message: msg, tags: ['Orthodoxy', 'Diplomacy', 'PactBroken'], data: { factionId: membership.factionId, targetFactionId } };
        this.historyValue.append(event);
        this.recordPlayerWorldEvent(event);
        this.actionIndexValue += 1;
        return { targetFactionId, summary: msg, state: this.state };
    }
    genesisWorldState() { return cloneGenesisWorldState(this.stateValue.genesisWorlds ?? createGenesisWorldState(this.stateValue.worldTimeYears)); }
    createPersonalGenesisWorld(name, laws) {
        if (this.stateValue.realm.maxRealmOrder < 114)
            throw new Error('Cần Sáng Thế Chủ mới có thể tạo thế giới độc lập.');
        const state = this.stateValue.genesisWorlds ?? (this.stateValue.genesisWorlds = createGenesisWorldState(this.stateValue.worldTimeYears));
        const cap = genesisWorldCapacity(this.stateValue.immortal.creationEpochs, this.stateValue.immortal.genesisAuthority);
        const count = Object.values(state.worlds).filter(w => !w.extinct).length;
        if (count >= cap)
            throw new Error(`Dung lượng Sáng Thế hiện tại ${count}/${cap}; cần Kỷ Nguyên/Quyền cao hơn để duy trì thêm thế giới.`);
        const cost = 12 + count * 6;
        const have = this.stateValue.inventory['resource.genesis_core'] ?? 0;
        if (have < cost)
            throw new Error(`Tạo thế giới cần ${cost} Sáng Thế Nguyên Hạch.`);
        this.stateValue.inventory['resource.genesis_core'] = have - cost;
        const lifePotential = Math.min(100, 25 + this.stateValue.immortal.worldLifePotential * 0.45 + this.stateValue.immortal.creationSource * 0.25);
        const w = createGenesisWorld(state, this.currentLifeValue.lifeId, this.stateValue.worldTimeYears, name, lifePotential, this.stateValue.immortal.genesisAuthority, laws);
        const msg = `${w.name} được khai sinh · ổn định ${w.stability.toFixed(1)} · tự chủ ${w.autonomy.toFixed(1)} · tiềm năng sinh mệnh ${w.lifePotential.toFixed(1)}. Không có văn minh nào được dựng sẵn.`;
        const event = { id: `genesis.world.create.${w.id}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'world', significance: 160, message: msg, locationId: this.stateValue.locationId, tags: ['CreationLord', 'GenesisWorld', 'WorldBirth'], data: { worldId: w.id, cost, capacity: cap } };
        this.historyValue.append(event);
        this.recordPlayerWorldEvent(event);
        this.actionIndexValue += 1;
        return { worldId: w.id, summary: msg, state: this.state };
    }
    evolvePersonalGenesisWorld(worldId, years, policy = 'observe') {
        const state = this.stateValue.genesisWorlds ?? (this.stateValue.genesisWorlds = createGenesisWorldState(this.stateValue.worldTimeYears));
        const w = state.worlds[worldId];
        if (!w)
            throw new Error(`Không rõ Sáng Thế Giới: ${worldId}`);
        const seed = mixSeed(this.rootSeed ^ 0x5a17e001, this.actionIndexValue);
        const r = evolveGenesisWorld(w, years, policy, (seed % 1_000_000) / 1_000_000);
        const outer = this.stateValue.ascendants ?? (this.stateValue.ascendants = createOuterAscendantState(this.stateValue.worldTimeYears));
        const emergence = materializeGenesisAscendants(outer, state, this.stateValue.worldTimeYears, this.ascendantEmergenceLocations());
        for (const e of emergence)
            this.historyValue.append({ id: `ascendant.emerge.${e.actorId}.${this.actionIndexValue}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'world', significance: e.significance, message: e.message, locationId: e.locationId, tags: ['GenesisWorld', 'Ascendant', 'OuterWorld'], data: { actorId: e.actorId } });
        const msg = `${w.name} trôi ${Math.round(r.years)} năm nội giới · ${w.civilizationStage} ${w.civilizationLevel.toFixed(1)}/100 · ổn định ${w.stability.toFixed(1)} · tự chủ ${w.autonomy.toFixed(1)} · nhận thức +${r.insightGained.toFixed(2)}${r.calamityTriggered ? ' · ĐẠI KIẾP' : ''}${r.extinct ? ' · TỊCH DIỆT' : ''}.`;
        const event = { id: `genesis.world.evolve.${w.id}.${this.actionIndexValue}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'world', significance: r.extinct ? 145 : r.calamityTriggered ? 92 : r.stageAfter !== r.stageBefore ? 74 : 24, message: msg, locationId: this.stateValue.locationId, tags: ['GenesisWorld', 'Civilization', policy, r.calamityTriggered ? 'Calamity' : 'Evolution'], data: { worldId, years: r.years, stage: w.civilizationStage, civilization: w.civilizationLevel, insight: r.insightGained } };
        this.historyValue.append(event);
        this.recordPlayerWorldEvent(event);
        this.actionIndexValue += 1;
        return { worldId, summary: msg, state: this.state };
    }
    harvestPersonalGenesisInsight(worldId, amount = Number.POSITIVE_INFINITY) {
        const state = this.stateValue.genesisWorlds ?? (this.stateValue.genesisWorlds = createGenesisWorldState(this.stateValue.worldTimeYears));
        const w = state.worlds[worldId];
        if (!w)
            throw new Error(`Không rõ Sáng Thế Giới: ${worldId}`);
        const taken = harvestGenesisInsight(w, Number.isFinite(amount) ? Math.max(0, amount) : w.insightStored);
        if (taken <= 0)
            throw new Error('Thế giới chưa tích đủ Nhận Thức Văn Minh.');
        this.stateValue.inventory['resource.civilization_insight'] = (this.stateValue.inventory['resource.civilization_insight'] ?? 0) + taken;
        const msg = `Thu nhận ${taken.toFixed(2)} Nhận Thức Văn Minh từ ${w.name}; chỉ quan sát kết quả tiến hóa, không hút sinh mệnh hay tài nguyên của chúng sinh.`;
        const event = { id: `genesis.world.insight.${w.id}.${this.actionIndexValue}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'system', significance: 38, message: msg, tags: ['GenesisWorld', 'CivilizationInsight'], data: { worldId, amount: taken } };
        this.historyValue.append(event);
        this.actionIndexValue += 1;
        return { worldId, amount: taken, summary: msg, state: this.state };
    }
    absorbCivilizationInsight(amount) {
        const take = Math.max(1, amount);
        const have = this.stateValue.inventory['resource.civilization_insight'] ?? 0;
        if (have < take)
            throw new Error(`Chỉ có ${have.toFixed(2)} Nhận Thức Văn Minh.`);
        this.stateValue.inventory['resource.civilization_insight'] = have - take;
        const authorityGain = Math.sqrt(take) * 0.85;
        const lifeGain = Math.sqrt(take) * 0.35;
        this.stateValue.immortal.creationEpochAuthority += authorityGain;
        this.stateValue.immortal.worldLifePotential = Math.min(100, this.stateValue.immortal.worldLifePotential + lifeGain);
        const msg = `Quan sát văn minh khác tự lựa chọn đường đi giúp ngươi hiểu Sáng Thế sâu hơn: Kỷ Nguyên Quyền +${authorityGain.toFixed(2)}, Chúng Sinh Tiềm Năng +${lifeGain.toFixed(2)}.`;
        const event = { id: `genesis.insight.absorb.${this.actionIndexValue}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'cultivation', significance: 42, message: msg, tags: ['GenesisWorld', 'CivilizationInsight', 'CreationLord'], data: { amount: take, authorityGain, lifeGain } };
        this.historyValue.append(event);
        this.actionIndexValue += 1;
        return { amount: take, summary: msg, state: this.state };
    }
    outerAscendantState() { return cloneOuterAscendantState(this.stateValue.ascendants ?? createOuterAscendantState(this.stateValue.worldTimeYears)); }
    befriendGenesisAscendant(actorId) {
        const outer = this.stateValue.ascendants ?? (this.stateValue.ascendants = createOuterAscendantState(this.stateValue.worldTimeYears));
        const actor = befriendOuterAscendant(outer, actorId);
        const msg = `Ngươi gặp lại ${actor.name}, thừa nhận con đường mà người này tự đi sau khi Siêu Thoát; quan hệ với Creator ${actor.creatorRelation.toFixed(0)}/100.`;
        this.historyValue.append({ id: `ascendant.befriend.${actor.id}.${this.actionIndexValue}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'world', significance: 62, message: msg, locationId: actor.locationId, tags: ['Ascendant', 'GenesisWorld', 'Relationship'], data: { actorId: actor.id, relation: actor.creatorRelation } });
        this.actionIndexValue += 1;
        return { actorId, summary: msg, state: this.state };
    }
    alignGenesisAscendant(actorId) {
        const membership = playerFactionMembership(this.stateValue.factions, this.currentLifeValue.lifeId);
        if (!membership)
            throw new Error('Cần có thế lực của đời hiện tại.');
        const outer = this.stateValue.ascendants ?? (this.stateValue.ascendants = createOuterAscendantState(this.stateValue.worldTimeYears));
        const orth = this.stateValue.orthodoxy ?? (this.stateValue.orthodoxy = createOrthodoxyState(this.stateValue.worldTimeYears));
        const actor = alignOuterAscendant(outer, orth, actorId, membership.factionId);
        const msg = `${actor.name} nhận lời làm khách khanh/tương trợ cho ${orth.orthodoxies[membership.factionId]?.name ?? membership.factionId}; đây là một người độc lập, không phải “pet” của Creator.`;
        this.historyValue.append({ id: `ascendant.align.${actor.id}.${this.actionIndexValue}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'world', significance: 88, message: msg, locationId: actor.locationId, tags: ['Ascendant', 'Orthodoxy', 'Alliance'], data: { actorId: actor.id, factionId: membership.factionId } });
        this.actionIndexValue += 1;
        return { actorId, summary: msg, state: this.state };
    }
    formImmortalLeague(memberFactionIds, name) {
        const membership = playerFactionMembership(this.stateValue.factions, this.currentLifeValue.lifeId);
        if (!membership)
            throw new Error('Cần có Đạo Thống của đời hiện tại.');
        const orth = this.stateValue.orthodoxy ?? (this.stateValue.orthodoxy = createOrthodoxyState(this.stateValue.worldTimeYears));
        if (!orth.orthodoxies[membership.factionId])
            throw new Error('Thế lực hiện tại chưa dựng Đạo Thống.');
        const league = formOrthodoxyLeague(orth, membership.factionId, memberFactionIds, name, this.stateValue.worldTimeYears);
        const msg = `${league.name} thành lập: ${league.memberFactionIds.map(id => orth.orthodoxies[id]?.name ?? id).join(' · ')}. Từ nay chiến tranh của thành viên có thể nhận viện lực liên vực.`;
        this.historyValue.append({ id: `orthodoxy.league.${league.id}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'world', significance: 108, message: msg, tags: ['Orthodoxy', 'League', 'Diplomacy'], data: { leagueId: league.id, members: league.memberFactionIds.join(',') } });
        this.actionIndexValue += 1;
        return { leagueId: league.id, summary: msg, state: this.state };
    }
    collectImmortalTribute(requested = Number.POSITIVE_INFINITY) {
        const membership = playerFactionMembership(this.stateValue.factions, this.currentLifeValue.lifeId);
        if (!membership)
            throw new Error('Cần có Đạo Thống của đời hiện tại.');
        const orth = this.stateValue.orthodoxy ?? (this.stateValue.orthodoxy = createOrthodoxyState(this.stateValue.worldTimeYears));
        const econ = orthodoxyEconomicSummary(orth, membership.factionId);
        const want = Number.isFinite(requested) ? Math.max(0, requested) : econ.treasury;
        const amount = withdrawOrthodoxyTribute(orth, membership.factionId, want);
        if (amount <= 0)
            throw new Error('Ngân khố chưa có phần cống có thể điều dụng.');
        this.stateValue.inventory['resource.immortal_tribute_seal'] = (this.stateValue.inventory['resource.immortal_tribute_seal'] ?? 0) + amount;
        const msg = `Điều dụng ${amount.toFixed(2)} Tiên Vực Cống Ấn từ ngân khố. Mỗi lần chỉ được rút tối đa 25% ngân khố để không biến Đạo Thống thành máy in tài nguyên.`;
        this.historyValue.append({ id: `orthodoxy.tribute.withdraw.${this.actionIndexValue}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'system', significance: 36, message: msg, tags: ['Orthodoxy', 'Economy', 'Tribute'], data: { amount } });
        this.actionIndexValue += 1;
        return { amount, summary: msg, state: this.state };
    }
    mobilizeImmortalTreasury(requested) {
        const membership = playerFactionMembership(this.stateValue.factions, this.currentLifeValue.lifeId);
        if (!membership)
            throw new Error('Cần có Đạo Thống của đời hiện tại.');
        const orth = this.stateValue.orthodoxy ?? (this.stateValue.orthodoxy = createOrthodoxyState(this.stateValue.worldTimeYears));
        const r = mobilizeOrthodoxyTreasury(orth, membership.factionId, Math.max(0, requested));
        if (r.spent <= 0)
            throw new Error('Ngân khố không đủ để huy động.');
        const msg = `Huy động ${r.spent.toFixed(1)} ngân khố: quân lực +${r.militaryGain.toFixed(1)}, hậu cần +${r.logisticsGain.toFixed(1)}.`;
        this.historyValue.append({ id: `orthodoxy.economy.mobilize.${this.actionIndexValue}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'world', significance: 48, message: msg, tags: ['Orthodoxy', 'Economy', 'Logistics'], data: { ...r } });
        this.actionIndexValue += 1;
        return { spent: r.spent, summary: msg, state: this.state };
    }
    orthodoxyEconomy() { const membership = playerFactionMembership(this.stateValue.factions, this.currentLifeValue.lifeId); if (!membership)
        return undefined; const orth = this.stateValue.orthodoxy ?? createOrthodoxyState(this.stateValue.worldTimeYears); if (!orth.orthodoxies[membership.factionId])
        return undefined; return orthodoxyEconomicSummary(orth, membership.factionId); }
    ascendantEmergenceLocations() { return ['location.ten_thousand_domain_king_court', 'location.nameless_boundary', 'location.supreme_dao_origin_sea'].filter(id => Boolean(this.world.locations[id])); }
    takeMaster(npcId) {
        return this.establishNpcSocialRole(npcId, 'master');
    }
    acceptDisciple(npcId) {
        return this.establishNpcSocialRole(npcId, 'disciple');
    }
    formDaoPartnership(npcId) {
        return this.establishNpcSocialRole(npcId, 'daoPartner');
    }
    receiveMasterTeaching(npcId) {
        if (!this.stateValue.alive)
            throw new Error('Current life has ended');
        const bond = socialBond(this.stateValue.social, this.currentLifeValue.lifeId, npcId, 'master');
        if (!bond)
            throw new Error(`${npcId} is not the current-life master`);
        const definition = this.world.npcs?.[npcId];
        const npc = this.stateValue.worldSimulation.npcs[npcId];
        if (!definition || !npc?.alive)
            throw new Error(`Master is unavailable: ${npcId}`);
        if (npc.locationId !== this.stateValue.locationId)
            throw new Error(`${definition.name} is not at the current location`);
        const seed = mixSeed(this.rootSeed ^ 0x73415211, this.actionIndexValue);
        const techniqueId = this.stateValue.character.activeTechniqueId;
        if (!techniqueId)
            throw new Error('No active technique to receive guidance on');
        const realmGap = Math.max(0, npc.realmOrder - this.stateValue.realm.maxRealmOrder);
        const masteryGain = Math.min(8, 2.4 + realmGap * 0.35 + bond.bondDepth * 0.018);
        this.stateValue.character.techniqueMastery[techniqueId] = Math.min(100, (this.stateValue.character.techniqueMastery[techniqueId] ?? 0) + masteryGain);
        const tuViGain = cultivationRealmV140(this.stateValue.realm.maxRealmOrder).requiredTuVi * Math.min(0.04, 0.025 + realmGap * 0.002);
        this.grantTuViV140(tuViGain, 'master-guidance');
        bond.teachingsReceived += 1;
        bond.bondDepth = Math.min(100, bond.bondDepth + 2.5);
        bond.lastMajorInteractionWorldYear = this.stateValue.worldTimeYears;
        adjustPlayerNpcRelationship(this.stateValue.worldSimulation, this.currentLifeValue.lifeId, npcId, this.stateValue.worldTimeYears, { trust: 2, respect: 4, karmaDepth: 2 }, ['MasterTeaching']);
        const event = this.advanceSocialActionTime(seed, 0.06, {
            id: `social.master.teach.${seed}.${npcId}`,
            type: 'cultivation', significance: 22,
            message: `${definition.name} chỉ điểm cho ngươi về ${this.registry.technique(techniqueId).name}; nhiều chỗ bế tắc bỗng sáng rõ.`,
            targetId: npcId, tags: ['Relationship', 'Master', 'Teaching', 'Inheritance'],
            data: { npcId, role: 'master', knowledgeId: techniqueId, masteryGain, tuViGain },
        });
        this.actionIndexValue += 1;
        return { seed, npcId, role: 'master', knowledgeId: techniqueId, amount: masteryGain, event, state: this.state };
    }
    teachDisciple(npcId, knowledgeId) {
        if (!this.stateValue.alive)
            throw new Error('Current life has ended');
        const bond = socialBond(this.stateValue.social, this.currentLifeValue.lifeId, npcId, 'disciple');
        if (!bond)
            throw new Error(`${npcId} is not the current-life disciple`);
        const definition = this.world.npcs?.[npcId];
        const npc = this.stateValue.worldSimulation.npcs[npcId];
        if (!definition || !npc?.alive)
            throw new Error(`Disciple is unavailable: ${npcId}`);
        if (npc.locationId !== this.stateValue.locationId)
            throw new Error(`${definition.name} is not at the current location`);
        const chosen = knowledgeId ?? this.stateValue.character.activeTechniqueId ?? this.stateValue.character.activeSkillIds[0];
        if (!chosen)
            throw new Error('No knowledge available to transmit');
        const known = this.stateValue.character.knownTechniqueIds.includes(chosen) || this.stateValue.character.knownSkillIds.includes(chosen);
        if (!known)
            throw new Error(`Cannot transmit unknown knowledge: ${chosen}`);
        const seed = mixSeed(this.rootSeed ^ 0x16a09e66, this.actionIndexValue);
        const amount = 1.4 + Math.max(0, this.stateValue.realm.maxRealmOrder - npc.realmOrder) * 0.16 + bond.bondDepth * 0.012;
        npc.cultivationProgress += amount;
        bond.teachingsGiven += 1;
        bond.bondDepth = Math.min(100, bond.bondDepth + 2);
        if (!bond.transmittedKnowledgeIds.includes(chosen))
            bond.transmittedKnowledgeIds.push(chosen);
        const activeTechnique = this.stateValue.character.activeTechniqueId;
        if (activeTechnique)
            this.stateValue.character.techniqueMastery[activeTechnique] = Math.min(100, (this.stateValue.character.techniqueMastery[activeTechnique] ?? 0) + 0.45);
        adjustPlayerNpcRelationship(this.stateValue.worldSimulation, this.currentLifeValue.lifeId, npcId, this.stateValue.worldTimeYears, { trust: 3, respect: 5, debt: 2, karmaDepth: 3 }, ['DiscipleTeaching']);
        const event = this.advanceSocialActionTime(seed, 0.05, {
            id: `social.disciple.teach.${seed}.${npcId}`,
            type: 'world', significance: 21,
            message: `Ngươi truyền cho ${definition.name} một phần sở học “${chosen}”; trong lúc giảng giải, chính ngươi cũng hiểu sâu thêm một tầng.`,
            targetId: npcId, tags: ['Relationship', 'Disciple', 'Teaching', 'Transmission'],
            data: { npcId, role: 'disciple', knowledgeId: chosen, cultivationProgressGain: amount },
        });
        this.actionIndexValue += 1;
        return { seed, npcId, role: 'disciple', knowledgeId: chosen, amount, event, state: this.state };
    }
    cultivateWithDaoPartner(npcId, years = 0.25) {
        if (!this.stateValue.alive)
            throw new Error('Current life has ended');
        const bond = socialBond(this.stateValue.social, this.currentLifeValue.lifeId, npcId, 'daoPartner');
        if (!bond)
            throw new Error(`${npcId} is not the current-life Dao partner`);
        const definition = this.world.npcs?.[npcId];
        const npc = this.stateValue.worldSimulation.npcs[npcId];
        if (!definition || !npc?.alive)
            throw new Error(`Dao partner is unavailable: ${npcId}`);
        if (npc.locationId !== this.stateValue.locationId)
            throw new Error(`${definition.name} is not at the current location`);
        const duration = Math.max(0.05, Math.min(2, years));
        const remainingLife = this.remainingLifeYears();
        const elapsed = Math.min(duration, remainingLife);
        if (elapsed <= 0)
            throw new Error('No lifespan remains for joint cultivation');
        const seed = mixSeed(this.rootSeed ^ 0x510e527f, this.actionIndexValue);
        const tuViGain = cultivationRealmV140(this.stateValue.realm.maxRealmOrder).requiredTuVi * Math.min(0.10, elapsed * (0.055 + bond.bondDepth * 0.00028));
        this.grantTuViV140(tuViGain, 'dao-partner');
        const techniqueId = this.stateValue.character.activeTechniqueId;
        if (techniqueId)
            this.stateValue.character.techniqueMastery[techniqueId] = Math.min(100, (this.stateValue.character.techniqueMastery[techniqueId] ?? 0) + elapsed * 1.4);
        npc.cultivationProgress += elapsed * (0.9 + bond.bondDepth / 120);
        bond.jointCultivations += 1;
        bond.bondDepth = Math.min(100, bond.bondDepth + Math.min(4, elapsed * 2));
        bond.lastMajorInteractionWorldYear = this.stateValue.worldTimeYears;
        adjustPlayerNpcRelationship(this.stateValue.worldSimulation, this.currentLifeValue.lifeId, npcId, this.stateValue.worldTimeYears, { trust: 2.5, respect: 1.5, karmaDepth: 2.5 }, ['JointCultivation']);
        const event = this.advanceSocialActionTime(seed, elapsed, {
            id: `social.dao_partner.cultivate.${seed}.${npcId}`,
            type: 'cultivation', significance: 19 + Math.min(8, bond.jointCultivations),
            message: `Ngươi cùng ${definition.name} đồng tu ${elapsed.toFixed(2)} năm; khí cơ tương ứng, đôi bên đều có sở đắc.`,
            targetId: npcId, tags: ['Relationship', 'DaoCompanion', 'JointCultivation'],
            data: { npcId, role: 'daoPartner', years: elapsed, tuViGain, bondDepth: bond.bondDepth },
        });
        this.actionIndexValue += 1;
        return { seed, npcId, years: elapsed, tuViGain, event, state: this.state };
    }
    haveChildWithDaoPartner(npcId) {
        if (!this.stateValue.alive)
            throw new Error('Current life has ended');
        const bond = socialBond(this.stateValue.social, this.currentLifeValue.lifeId, npcId, 'daoPartner');
        if (!bond)
            throw new Error(`${npcId} is not the current-life Dao partner`);
        const definition = this.world.npcs?.[npcId];
        const npc = this.stateValue.worldSimulation.npcs[npcId];
        if (!definition || !npc?.alive)
            throw new Error(`Dao partner is unavailable: ${npcId}`);
        if (npc.locationId !== this.stateValue.locationId)
            throw new Error(`${definition.name} is not at the current location`);
        const previousChildren = this.stateValue.social.familyMembers.filter(member => member.sourceLifeId === this.currentLifeValue.lifeId && member.relation === 'child' && member.parentNpcId === npcId);
        const latestBirth = previousChildren.reduce((max, member) => Math.max(max, member.bornWorldYear), -1e9);
        if (this.stateValue.worldTimeYears - latestBirth < 3)
            throw new Error('Family needs more time before another child can be born');
        const seed = mixSeed(this.rootSeed ^ 0x1f83d9ab, this.actionIndexValue);
        const remainingLife = this.remainingLifeYears();
        const elapsed = Math.min(0.75, remainingLife);
        if (elapsed <= 0)
            throw new Error('No lifespan remains');
        this.stateValue.worldTimeYears += elapsed;
        this.stateValue.ageYears += elapsed;
        const child = createChildForLife(this.stateValue.social, this.currentLifeValue.lifeId, definition, this.stateValue.character, this.stateValue.worldTimeYears, this.stateValue.locationId, seed, this.currentLifeValue.birth.aptitude);
        bond.bondDepth = Math.min(100, bond.bondDepth + 8);
        bond.lastMajorInteractionWorldYear = this.stateValue.worldTimeYears;
        adjustPlayerNpcRelationship(this.stateValue.worldSimulation, this.currentLifeValue.lifeId, npcId, this.stateValue.worldTimeYears, { trust: 6, debt: 2, karmaDepth: 10 }, ['Family', 'ChildBorn']);
        const worldEvents = this.syncWorldState(this.stateValue, seed ^ 0x243f6a88);
        this.historyValue.appendMany(worldEvents);
        const event = {
            id: `social.child.birth.${seed}.${child.id}`,
            worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears,
            type: 'world', significance: 38,
            message: `${definition.name} cùng ngươi có một hậu duệ: ${child.name}. Linh căn và huyết mạch của đứa trẻ đã bắt đầu mang dấu vết của hai bên.`,
            actorId: this.profile.combatEntity.id, targetId: child.id, locationId: this.stateValue.locationId,
            tags: ['Relationship', 'Family', 'DaoCompanion', 'ChildBirth'],
            data: { partnerNpcId: npcId, childId: child.id, potential: child.potential, spiritualRootId: child.spiritualRootId, bloodlineCount: child.bloodlines.length },
        };
        this.historyValue.append(event);
        this.recordPlayerWorldEvent(event);
        this.applyNaturalDeathToState(seed);
        this.actionIndexValue += 1;
        return { seed, partnerNpcId: npcId, child: { ...child, bloodlines: child.bloodlines.map(lineage => ({ ...lineage })) }, event, state: this.state };
    }
    receiveParentGuidance(parentId) {
        if (!this.stateValue.alive)
            throw new Error('Current life has ended');
        const parent = this.stateValue.social.familyMembers.find(member => member.id === parentId && member.sourceLifeId === this.currentLifeValue.lifeId && (member.relation === 'father' || member.relation === 'mother'));
        if (!parent)
            throw new Error(`Unknown current-life parent: ${parentId}`);
        if (!parent.alive)
            throw new Error(`${parent.name} is no longer alive`);
        if (parent.locationId !== this.stateValue.locationId)
            throw new Error(`${parent.name} is not at the current location`);
        const seed = mixSeed(this.rootSeed ^ 0x5be0cd19, this.actionIndexValue);
        const techniqueId = this.stateValue.character.activeTechniqueId;
        if (!techniqueId)
            throw new Error('No active technique to receive family guidance on');
        const masteryGain = Math.min(4.5, 1.2 + parent.potential * 0.018 + Math.max(0, parent.realmOrder - this.stateValue.realm.maxRealmOrder) * 0.15);
        this.stateValue.character.techniqueMastery[techniqueId] = Math.min(100, (this.stateValue.character.techniqueMastery[techniqueId] ?? 0) + masteryGain);
        parent.guidanceGiven += 1;
        const event = this.advanceSocialActionTime(seed, 0.04, {
            id: `social.parent.guidance.${seed}.${parent.id}`,
            type: 'cultivation', significance: parent.guidanceGiven === 1 ? 18 : 9,
            message: `${parent.name} truyền lại một phần kinh nghiệm tu hành trong nhà; kinh nghiệm vận công của ngươi nhờ đó tiến thêm.`,
            targetId: parent.id, tags: ['Relationship', 'Family', 'Parent', 'Inheritance', 'Teaching'],
            data: { parentId: parent.id, relation: parent.relation, techniqueId, masteryGain, guidanceCount: parent.guidanceGiven },
        });
        this.actionIndexValue += 1;
        return { seed, parentId, masteryGain, event, state: this.state };
    }
    interactNpc(npcId, action) {
        if (!this.stateValue.alive)
            throw new Error('Current life has ended');
        const definition = this.world.npcs?.[npcId];
        const npc = this.stateValue.worldSimulation.npcs[npcId];
        if (!definition || !npc)
            throw new Error(`Unknown NPC: ${npcId}`);
        if (!npc.alive)
            throw new Error(`${definition.name} is no longer alive`);
        if (npc.locationId !== this.stateValue.locationId)
            throw new Error(`${definition.name} is not at the current location`);
        const seed = mixSeed(this.rootSeed ^ 0x27d4eb2f, this.actionIndexValue);
        const current = playerNpcRelationship(this.stateValue.worldSimulation, this.currentLifeValue.lifeId, npcId, this.stateValue.worldTimeYears);
        const firstMeeting = !current.met;
        if (!firstMeeting && action !== 'greet' && this.stateValue.worldTimeYears - current.lastInteractionWorldYear < 0.2) {
            throw new Error('This relationship interaction needs time before it can be repeated');
        }
        let pastKarmaEcho = 0;
        if (firstMeeting) {
            const oldKarma = pastLifeKarmaForNpc(this.stateValue.worldSimulation, this.currentLifeValue.lifeId, npcId);
            if (oldKarma >= 20)
                pastKarmaEcho = Math.min(20, oldKarma * 0.25);
        }
        let delta = {};
        let significance = firstMeeting ? 11 : 6;
        let actionText = '';
        const flags = [];
        if (action === 'greet') {
            delta = { trust: firstMeeting ? 3 : 1, respect: firstMeeting ? 2 : 0, karmaDepth: 1 + pastKarmaEcho };
            actionText = firstMeeting ? `Ngươi lần đầu kết thức với ${definition.name}.` : `Ngươi ghé thăm ${definition.name}, hàn huyên đôi câu.`;
        }
        else if (action === 'assist') {
            const cost = 5;
            if ((this.stateValue.inventory['resource.spirit_stone'] ?? 0) < cost)
                throw new Error(`Need ${cost} spirit stones to assist this NPC`);
            this.stateValue.inventory['resource.spirit_stone'] -= cost;
            npc.cultivationProgress += 1.2;
            delta = { trust: 10, respect: 4, debt: 12, karmaDepth: 6 + pastKarmaEcho };
            significance = 18;
            actionText = `Ngươi bỏ ra ${cost} linh thạch giúp ${definition.name} vượt qua một đoạn khó khăn trong tu hành.`;
            flags.push('ReceivedAid');
        }
        else if (action === 'daoDiscussion') {
            npc.cultivationProgress += 0.7;
            const activeTechnique = this.stateValue.character.activeTechniqueId;
            if (activeTechnique)
                this.stateValue.character.techniqueMastery[activeTechnique] = Math.min(100, (this.stateValue.character.techniqueMastery[activeTechnique] ?? 0) + 1.25);
            delta = { trust: 3, respect: 7, karmaDepth: 4 + pastKarmaEcho };
            significance = 14;
            actionText = `Ngươi cùng ${definition.name} luận đạo một phen; đôi bên đều có chút sở ngộ.`;
            flags.push('DaoDiscussion');
        }
        else if (action === 'gift') {
            const cost = 10;
            if ((this.stateValue.inventory['resource.spirit_stone'] ?? 0) < cost)
                throw new Error(`Need ${cost} spirit stones for this gift`);
            this.stateValue.inventory['resource.spirit_stone'] -= cost;
            delta = { trust: 8, debt: 7, karmaDepth: 4 + pastKarmaEcho };
            significance = 13;
            actionText = `Ngươi tặng ${definition.name} ${cost} linh thạch, kết thêm một đoạn thiện duyên.`;
            flags.push('ReceivedGift');
        }
        else {
            delta = { respect: 2, grudge: 18, karmaDepth: 7 + pastKarmaEcho };
            significance = 17;
            actionText = `Ngươi công khai khiêu khích ${definition.name}; một đoạn oán duyên từ đây kết xuống.`;
            flags.push('Provoked');
        }
        const socialTalentMultiplier = socialPositiveRelationshipMultiplier(this.stateValue.inheritedOrigins);
        if (socialTalentMultiplier > 1) {
            for (const key of ['trust', 'respect', 'karmaDepth']) {
                const value = delta[key];
                if (value !== undefined && value > 0)
                    delta[key] = value * socialTalentMultiplier;
            }
        }
        const relationBefore = { trust: current.trust ?? 0, respect: current.respect ?? 0, debt: current.debt ?? 0, grudge: current.grudge ?? 0, karmaDepth: current.karmaDepth ?? 0 };
        const relation = adjustPlayerNpcRelationship(this.stateValue.worldSimulation, this.currentLifeValue.lifeId, npcId, this.stateValue.worldTimeYears, delta, flags);
        const relationDelta = {
            trust: (relation.trust ?? 0) - relationBefore.trust,
            respect: (relation.respect ?? 0) - relationBefore.respect,
            debt: (relation.debt ?? 0) - relationBefore.debt,
            grudge: (relation.grudge ?? 0) - relationBefore.grudge,
            karmaDepth: (relation.karmaDepth ?? 0) - relationBefore.karmaDepth,
        };
        const elapsedYears = Math.min(0.02, this.remainingLifeYears());
        this.stateValue.worldTimeYears += elapsedYears;
        this.stateValue.ageYears += elapsedYears;
        const worldEvents = this.syncWorldState(this.stateValue, seed ^ 0x9e3779b9);
        this.historyValue.appendMany(worldEvents);
        const echoText = pastKarmaEcho > 0 ? ' Vừa gặp, đôi bên đã mơ hồ cảm thấy một tia nhân quả quen thuộc từ kiếp trước.' : '';
        const event = {
            id: `relationship.${seed}.${npcId}.${action}`,
            worldTimeYears: this.stateValue.worldTimeYears,
            ageYears: this.stateValue.ageYears,
            type: 'world',
            significance: significance + (pastKarmaEcho > 0 ? 8 : 0),
            message: `${actionText}${echoText}`,
            actorId: this.profile.combatEntity.id,
            targetId: npcId,
            locationId: this.stateValue.locationId,
            tags: ['Relationship', 'NpcInteraction', action, ...(pastKarmaEcho > 0 ? ['PastLifeKarma'] : [])],
            data: {
                npcId, trust: relation.trust, respect: relation.respect, debt: relation.debt,
                grudge: relation.grudge, karmaDepth: relation.karmaDepth, pastKarmaEcho,
            },
        };
        this.historyValue.append(event);
        this.recordPlayerWorldEvent(event);
        this.applyNaturalDeathToState(seed);
        this.actionIndexValue += 1;
        return { seed, npcId, action, relation: { ...relation, flags: [...relation.flags] }, relationDelta, event, state: this.state };
    }
    resolveWorldOpportunity(opportunityId, choice, npcId) {
        if (!this.stateValue.alive)
            throw new Error('Current life has ended');
        const opportunity = this.world.opportunities?.[opportunityId];
        if (!opportunity)
            throw new Error(`Unknown world opportunity: ${opportunityId}`);
        if (this.stateValue.worldSimulation.claimedOpportunityIds.includes(opportunityId))
            throw new Error(`Opportunity already claimed: ${opportunityId}`);
        if (this.stateValue.worldTimeYears < opportunity.availableFromWorldYear)
            throw new Error(`Opportunity is not active yet: ${opportunityId}`);
        if (opportunity.expiresAtWorldYear !== undefined && this.stateValue.worldTimeYears > opportunity.expiresAtWorldYear)
            throw new Error(`Opportunity has expired: ${opportunityId}`);
        if (this.stateValue.locationId !== opportunity.locationId)
            throw new Error(`Player must be at ${opportunity.locationId} to resolve this opportunity`);
        let npcDefinition = npcId ? this.world.npcs?.[npcId] : undefined;
        let npcState = npcId ? this.stateValue.worldSimulation.npcs[npcId] : undefined;
        if (choice !== 'claim') {
            if (!npcId || !npcDefinition || !npcState?.alive)
                throw new Error(`${choice} requires a living target NPC`);
            if (npcState.locationId !== opportunity.locationId)
                throw new Error(`${npcDefinition.name} is not present at the opportunity`);
        }
        const seed = mixSeed(this.rootSeed ^ 0xc2b2ae35, this.actionIndexValue);
        const rewards = {};
        const baseStones = Math.max(2, Math.round(opportunity.value * 1.7));
        const baseTuVi = Math.max(1, Math.round(cultivationRealmV140(this.stateValue.realm.maxRealmOrder).requiredTuVi * Math.min(0.03, opportunity.value * 0.0006))); 
        const ws = this.stateValue.worldSimulation;
        ws.claimedOpportunityIds.push(opportunityId);
        let message;
        let significance = opportunity.value;
        const tags = ['Opportunity', 'PlayerChoice', ...opportunity.tags];
        if (choice === 'claim') {
            ws.opportunityClaims[opportunityId] = { opportunityId, claimantType: 'player', claimantId: this.currentLifeValue.lifeId, worldYear: this.stateValue.worldTimeYears };
            const awardedStones=this.fateSpiritStoneGainV4(baseStones);
            this.stateValue.inventory['resource.spirit_stone'] = (this.stateValue.inventory['resource.spirit_stone'] ?? 0) + awardedStones;
            this.grantTuViV140(baseTuVi, 'world-opportunity');
            rewards['resource.spirit_stone'] = awardedStones;
            rewards['cultivation.tuVi'] = baseTuVi;
            for (const definition of Object.values(this.world.npcs ?? {})) {
                const npc = ws.npcs[definition.id];
                if (!npc?.alive || npc.locationId !== opportunity.locationId)
                    continue;
                if (npcId && definition.id === npcId)
                    continue;
                const seeksOpportunity = definition.goals.some(goal => goal.type === 'seekOpportunity' && goal.priority >= 65);
                if (!seeksOpportunity)
                    continue;
                const grudge = 4 + Math.round((definition.personality.ambition + definition.personality.pride) / 25);
                adjustPlayerNpcRelationship(ws, this.currentLifeValue.lifeId, definition.id, this.stateValue.worldTimeYears, {
                    respect: Math.max(1, this.stateValue.realm.maxRealmOrder - npc.realmOrder), grudge, karmaDepth: 5,
                }, ['OpportunityRival']);
            }
            message = `Ngươi đoạt cơ duyên “${opportunity.name}”, tự mình nhận lấy phần tạo hóa trong đó.`;
            tags.push('Claimed');
        }
        else if (choice === 'share') {
            ws.opportunityClaims[opportunityId] = { opportunityId, claimantType: 'player', claimantId: this.currentLifeValue.lifeId, worldYear: this.stateValue.worldTimeYears };
            const stones = this.fateSpiritStoneGainV4(Math.max(1, Math.round(baseStones * 0.45)));
            const tuVi = Math.max(1, Math.round(baseTuVi * 0.45));
            this.stateValue.inventory['resource.spirit_stone'] = (this.stateValue.inventory['resource.spirit_stone'] ?? 0) + stones;
            this.grantTuViV140(tuVi, 'world-opportunity-share');
            rewards['resource.spirit_stone'] = stones;
            rewards['cultivation.tuVi'] = tuVi;
            npcState.claimedOpportunityIds.push(opportunityId);
            npcState.cultivationProgress += opportunity.realmProgressBonus ?? opportunity.value * 0.08;
            const relation = adjustPlayerNpcRelationship(ws, this.currentLifeValue.lifeId, npcId, this.stateValue.worldTimeYears, {
                trust: 14, respect: 8, debt: 8, karmaDepth: 12,
            }, ['SharedOpportunity']);
            message = `Ngươi cùng ${npcDefinition.name} chia sẻ cơ duyên “${opportunity.name}”; một đoạn đồng hành vì thế sâu thêm.`;
            significance += 8;
            tags.push('Shared', 'Relationship');
            rewards['relationship.karmaDepth'] = relation.karmaDepth;
        }
        else {
            ws.opportunityClaims[opportunityId] = { opportunityId, claimantType: 'npc', claimantId: npcId, worldYear: this.stateValue.worldTimeYears };
            npcState.claimedOpportunityIds.push(opportunityId);
            npcState.cultivationProgress += (opportunity.realmProgressBonus ?? opportunity.value * 0.08) * 1.15;
            const relation = adjustPlayerNpcRelationship(ws, this.currentLifeValue.lifeId, npcId, this.stateValue.worldTimeYears, {
                trust: 10, respect: 10, debt: 18, karmaDepth: 14,
            }, ['YieldedOpportunity']);
            message = `Ngươi chủ động nhường cơ duyên “${opportunity.name}” cho ${npcDefinition.name}; đối phương ghi nhớ phần nhân tình này.`;
            significance += 10;
            tags.push('Yielded', 'Relationship');
            rewards['relationship.karmaDepth'] = relation.karmaDepth;
        }
        const event = {
            id: `opportunity.player.${seed}.${opportunityId}`,
            worldTimeYears: this.stateValue.worldTimeYears,
            ageYears: this.stateValue.ageYears,
            type: 'exploration',
            significance: Math.min(85, significance),
            message,
            actorId: this.profile.combatEntity.id,
            targetId: npcId,
            locationId: opportunity.locationId,
            tags,
            data: { opportunityId, choice, npcId: npcId ?? '', value: opportunity.value, ...rewards },
        };
        this.historyValue.append(event);
        this.recordPlayerWorldEvent(event);
        this.actionIndexValue += 1;
        return { seed, opportunityId, choice, npcId, rewards, event, state: this.state };
    }
    canonicalBattleDaoProgressionId() {
        const battleDao = this.stateValue.character.buildFoundation?.battleDao;
        return battleDao?.committed && battleDao?.mainDaoId ? `dao.${battleDao.mainDaoId}` : undefined;
    }
    assertCanonicalDaoProgression(daoId) {
        const canonicalDaoId = this.canonicalBattleDaoProgressionId();
        if (canonicalDaoId && daoId !== canonicalDaoId)
            throw new Error(`Đạo Ý Hóa Thần phải kế thừa Chủ Đạo đã Định Đạo (${canonicalDaoId}); không thể chọn một Chủ Đạo thứ hai.`);
        return canonicalDaoId;
    }
    daoSummary() {
        synchronizeDaoForRealm(this.stateValue.dao, this.stateValue.realm.maxRealmOrder);
        return cloneDaoState(this.stateValue.dao);
    }
    discoverDao(daoId, startingInsight = 4) {
        synchronizeDaoForRealm(this.stateValue.dao, this.stateValue.realm.maxRealmOrder);
        this.assertCanonicalDaoProgression(daoId);
        const definition = this.registry.dao(daoId);
        const inherited = this.stateValue.inheritedOrigins[`origin.dao.${daoId}`] ?? 0;
        const progress = discoverDao(this.stateValue.dao, definition, startingInsight + inherited * 2.5);
        if (!this.stateValue.dao.mainDaoId || this.registry.dao(this.stateValue.dao.mainDaoId).legacy)
            this.stateValue.dao.mainDaoId = daoId;
        this.historyValue.append({ id: `dao.discover.${daoId}.${this.currentLifeValue.lifeId}.${this.actionIndexValue}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'cultivation', significance: 34, message: `Ngươi chính thức chạm vào ${definition.name}; ${progress.depth.toFixed(1)} độ sâu Đạo Ý.`, tags: ['Dao', 'Discovery', daoId], data: { daoId, depth: progress.depth } });
        this.actionIndexValue += 1;
        return this.daoSummary();
    }
    chooseMainDao(daoId) {
        this.assertCanonicalDaoProgression(daoId);
        setMainDao(this.stateValue.dao, daoId);
        this.actionIndexValue += 1;
        return this.daoSummary();
    }
    chooseDaoInterpretation(daoId, interpretationId) {
        this.assertCanonicalDaoProgression(daoId);
        chooseDaoInterpretation(this.stateValue.dao, this.registry.dao(daoId), interpretationId);
        this.historyValue.append({ id: `dao.interpret.${daoId}.${this.actionIndexValue}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'cultivation', significance: 28, message: `Ngươi xác lập một cách hiểu riêng đối với ${this.registry.dao(daoId).name}.`, tags: ['Dao', 'Interpretation', daoId, interpretationId], data: { daoId, interpretationId } });
        this.actionIndexValue += 1;
        return this.daoSummary();
    }
    daoContemplationContext(daoId, years = 1) {
        synchronizeDaoForRealm(this.stateValue.dao, this.stateValue.realm.maxRealmOrder);
        this.assertCanonicalDaoProgression(daoId);
        const tags = [];
        const root = this.registry.spiritualRoot(this.stateValue.character.spiritualRootId);
        tags.push(...root.tags);
        const technique = this.registry.technique(this.stateValue.character.activeTechniqueId);
        tags.push(...technique.tags);
        for (const skillId of this.stateValue.character.activeSkillIds)
            tags.push(...this.registry.skill(skillId).tags);
        tags.push(...(this.world.locations[this.stateValue.locationId]?.environment.affinities ?? []));
        const progress = this.stateValue.dao.known[daoId];
        const definition = this.registry.dao(daoId);
        return { definition, tags, years, progress };
    }
    previewDaoContemplation(daoId, years = 1) {
        const context = this.daoContemplationContext(daoId, years);
        return previewDaoContemplationState(context.definition, years, this.stateValue.soul.strength, context.tags, daoContemplationInsightMultiplier(this.stateValue.inheritedOrigins), context.progress?.insight ?? 0, context.progress?.depth ?? 0, context.progress?.marks ?? 0);
    }
    contemplateDao(daoId, years = 1) {
        if (!this.stateValue.alive)
            throw new Error('Current life has ended');
        const elapsed = Math.min(Math.max(0.1, years), this.remainingLifeYears());
        if (elapsed <= 0)
            throw new Error('Thọ nguyên đã tận.');
        const context = this.daoContemplationContext(daoId, elapsed);
        const report = contemplateDaoState(this.stateValue.dao, context.definition, elapsed, this.stateValue.soul.strength, context.tags, daoContemplationInsightMultiplier(this.stateValue.inheritedOrigins));
        if (!this.stateValue.dao.mainDaoId || this.registry.dao(this.stateValue.dao.mainDaoId).legacy)
            this.stateValue.dao.mainDaoId = daoId;
        this.stateValue.worldTimeYears += elapsed;
        this.stateValue.ageYears += elapsed;
        this.historyValue.appendMany(this.syncWorldState(this.stateValue, mixSeed(this.rootSeed ^ 0x3c6ef372, this.actionIndexValue)));
        recordArtifactOwnershipYears(this.stateValue.artifacts, elapsed);
        recordSoulCloneYears(this.stateValue.soul, elapsed);
        this.stateValue.dao.domain.manifestedYears += this.stateValue.dao.domain.active ? elapsed : 0;
        const definition = this.registry.dao(daoId);
        this.historyValue.append({ id: `dao.contemplate.${daoId}.${this.actionIndexValue}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'cultivation', significance: report.domainUnlocked ? 45 : 16, message: `Ngộ ${definition.name} ${elapsed.toFixed(1)} năm: Đạo Ý +${report.depthGain.toFixed(2)}, cảm ngộ +${report.insightGain.toFixed(1)}.${report.domainUnlocked ? ' Đạo Vực sơ khai đã có thể manifest.' : ''}`, tags: ['Dao', 'Contemplation', daoId, ...(report.domainUnlocked ? ['DomainUnlocked'] : [])], data: { ...report } });
        this.applyNaturalDeathToState(mixSeed(this.rootSeed, this.actionIndexValue));
        this.actionIndexValue += 1;
        return report;
    }
    setDaoDomain(active) {
        setDaoDomainActive(this.stateValue.dao, active);
        this.historyValue.append({ id: `dao.domain.${active ? 'on' : 'off'}.${this.actionIndexValue}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'cultivation', significance: active ? 38 : 8, message: active ? 'Ngươi khiến Chủ Đạo lan ra ngoài thân, Đạo Vực sơ khai thành hình.' : 'Ngươi thu Đạo Vực về trong thân.', tags: ['Dao', 'Domain', active ? 'Manifest' : 'Withdraw'], data: { active, daoId: this.stateValue.dao.mainDaoId ?? '' } });
        this.actionIndexValue += 1;
        return this.daoSummary();
    }
    soulSummary() {
        synchronizeSoulForRealm(this.stateValue.soul, this.stateValue.realm.maxRealmOrder, this.stateValue.dungeons.parallelWorkerCapacity);
        const authority = soulCloneAuthorityProfileV127(this.stateValue.realm.maxRealmOrder, this.stateValue.soul.clones.length);
        syncSoulDungeonWorkers(this.stateValue.soul, this.stateValue.dungeons, authority.capacity);
        const protectorTreePct = 0; // R3: Phân Thân bonus no longer belongs to the Tu Luyện tree.
        const soul = cloneSoulState(this.stateValue.soul);
        soul.clones = soul.clones.map((clone, index) => ({
            ...clone,
            progression: cloneProgressionProfileV128(clone),
            authorityUnlocked: index < authority.capacity,
        }));
        return { soul, totalLoad: totalSoulLoad(this.stateValue.soul, authority.capacity), pressureMultiplier: soulPressureMultiplier(this.stateValue.soul, authority.capacity), authority, sixDao: V127_SIX_DAO_CLONES.map(x=>({...x})), protector: { active: this.stateValue.soul.clones.slice(0,authority.capacity).filter(x=>x.role==='protector').length, maxActive:2, treeEffectPct:protectorTreePct, cultivationBonusPct:soulProtectorCultivationBonusPctV127(this.stateValue.soul,authority.capacity,protectorTreePct) } };
    }
    nascentMidgameV112() {
        synchronizeSoulForRealm(this.stateValue.soul, this.stateValue.realm.maxRealmOrder, this.stateValue.dungeons.parallelWorkerCapacity);
        syncSoulDungeonWorkers(this.stateValue.soul, this.stateValue.dungeons, soulCloneAuthorityCapacityV127(this.stateValue.realm.maxRealmOrder));
        return buildNascentMidgameV112(this.stateValue, this.world.dungeons);
    }
    createSoulClone(specialization = 'general') {
        if (!this.stateValue.alive)
            throw new Error('Current life has ended');
        synchronizeSoulForRealm(this.stateValue.soul, this.stateValue.realm.maxRealmOrder, this.stateValue.dungeons.parallelWorkerCapacity);
        const authorityCap = soulCloneAuthorityCapacityV127(this.stateValue.realm.maxRealmOrder);
        const report = createSoulCloneState(this.stateValue.soul, this.stateValue.dungeons, this.stateValue.inventory, { specialization, worldYear: this.stateValue.worldTimeYears, authorityCap });
        this.historyValue.append({
            id: `soul.clone.create.${this.currentLifeValue.lifeId}.${this.actionIndexValue}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears,
            type: 'cultivation', significance: 34, message: `Ngươi phân hóa ${report.clone.name} · ${report.clone.sixDaoName}; chuyên môn ${report.clone.specialization}, Thần Hồn tải ${report.loadAfter.toFixed(1)}/${this.stateValue.soul.loadCapacity.toFixed(1)}.`,
            tags: ['Soul', 'NascentSoul', 'Clone', report.clone.sixDaoId], data: { cloneId: report.clone.id, sixDaoId: report.clone.sixDaoId, specialization: report.clone.specialization, soulLoad: report.clone.soulLoad },
        });
        this.actionIndexValue += 1;
        return report;
    }
    trainSoulCloneDaoHanhV128(cloneId, levels = 1) {
        if (!this.stateValue.alive)
            throw new Error('Current life has ended');
        synchronizeSoulForRealm(this.stateValue.soul, this.stateValue.realm.maxRealmOrder, this.stateValue.dungeons.parallelWorkerCapacity);
        const authorityCap = soulCloneAuthorityCapacityV127(this.stateValue.realm.maxRealmOrder);
        const cloneIndex = this.stateValue.soul.clones.findIndex(item => item.id === cloneId);
        if (cloneIndex < 0)
            throw new Error(`Unknown soul clone: ${cloneId}`);
        if (cloneIndex >= authorityCap)
            throw new Error('Phân Thân này đang bị phong ấn bởi quyền Lục Đạo của cảnh giới hiện tại.');
        const report = trainSoulCloneDaoHanhStateV128(this.stateValue.soul, this.stateValue.inventory, cloneId, levels);
        syncSoulDungeonWorkers(this.stateValue.soul, this.stateValue.dungeons, authorityCap);
        this.historyValue.append({
            id: `soul.dao_hanh.${cloneId}.${this.actionIndexValue}`,
            worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears,
            type: 'cultivation', significance: 14 + Math.min(18, report.gainedLevels * 2),
            message: `${report.clone.name} bồi dưỡng Đạo Hạnh +${report.gainedLevels}, đạt Lv${report.progression.level} · ${report.progression.seal.name}.`,
            tags: ['Soul', 'SixDao', 'DaoHanh', report.clone.sixDaoId], data: { ...report },
        });
        this.actionIndexValue += 1;
        return report;
    }
    upgradeSoulCloneSealV128(cloneId) {
        if (!this.stateValue.alive)
            throw new Error('Current life has ended');
        synchronizeSoulForRealm(this.stateValue.soul, this.stateValue.realm.maxRealmOrder, this.stateValue.dungeons.parallelWorkerCapacity);
        const authorityCap = soulCloneAuthorityCapacityV127(this.stateValue.realm.maxRealmOrder);
        const cloneIndex = this.stateValue.soul.clones.findIndex(item => item.id === cloneId);
        if (cloneIndex < 0)
            throw new Error(`Unknown soul clone: ${cloneId}`);
        if (cloneIndex >= authorityCap)
            throw new Error('Phân Thân này đang bị phong ấn bởi quyền Lục Đạo của cảnh giới hiện tại.');
        const report = upgradeSoulCloneSealStateV128(this.stateValue.soul, this.stateValue.inventory, cloneId);
        syncSoulDungeonWorkers(this.stateValue.soul, this.stateValue.dungeons, authorityCap);
        this.historyValue.append({
            id: `soul.dao_seal.${cloneId}.${this.actionIndexValue}`,
            worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears,
            type: 'cultivation', significance: 32,
            message: `${report.clone.name} Thăng Ấn thành ${report.progression.seal.name}; Đạo Hạnh Lv${report.progression.level}.`,
            tags: ['Soul', 'SixDao', 'DaoSeal', report.clone.sixDaoId], data: { ...report },
        });
        this.actionIndexValue += 1;
        return report;
    }
    nourishSoul(batches = 1) {
        if (!this.stateValue.alive)
            throw new Error('Current life has ended');
        synchronizeSoulForRealm(this.stateValue.soul, this.stateValue.realm.maxRealmOrder, this.stateValue.dungeons.parallelWorkerCapacity);
        const report = nourishSoulState(this.stateValue.soul, this.stateValue.inventory, batches);
        syncSoulDungeonWorkers(this.stateValue.soul, this.stateValue.dungeons, soulCloneAuthorityCapacityV127(this.stateValue.realm.maxRealmOrder));
        this.historyValue.append({
            id: `soul.nourish.${this.currentLifeValue.lifeId}.${this.actionIndexValue}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears,
            type: 'cultivation', significance: 14 + Math.min(16, batches * 2), message: `Dưỡng luyện Thần Hồn: cường độ +${report.strengthGain.toFixed(1)}, tải tối đa +${report.loadCapacityGain.toFixed(1)}.`,
            tags: ['Soul', 'Nourish'], data: { batches, ...report },
        });
        this.actionIndexValue += 1;
        return report;
    }
    assignSoulClone(cloneId, dungeonId, floor = 1) {
        const cloneIndex = this.stateValue.soul.clones.findIndex(item => item.id === cloneId);
        if (cloneIndex < 0)
            throw new Error(`Unknown soul clone: ${cloneId}`);
        const authorityCap = soulCloneAuthorityCapacityV127(this.stateValue.realm.maxRealmOrder);
        if (cloneIndex >= authorityCap)
            throw new Error(`Phân Thân này chưa được quyền hoạt động ở cảnh giới hiện tại; V127 chỉ mở ${authorityCap}/6 quyền Phân Thân.`);
        syncSoulDungeonWorkers(this.stateValue.soul, this.stateValue.dungeons, authorityCap);
        this.assignDungeon(cloneId, dungeonId, floor);
    }
    setSoulCloneProtectorV127(cloneId, enabled = true) {
        if (!this.stateValue.alive) throw new Error('Current life has ended');
        const authorityCap = soulCloneAuthorityCapacityV127(this.stateValue.realm.maxRealmOrder);
        const clone = setSoulCloneProtectorStateV127(this.stateValue.soul, this.stateValue.dungeons, cloneId, Boolean(enabled), authorityCap);
        this.historyValue.append({ id: `soul.clone.protector.${cloneId}.${this.actionIndexValue}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'cultivation', significance: 12, message: clone.role === 'protector' ? `${clone.name} chuyển sang Hộ Pháp; ngừng farm để tăng Tu Vi Bản Thể.` : `${clone.name} rời Hộ Pháp và trở lại hàng Phân Thân farm.`, tags: ['Soul','Clone','Protector',clone.role], data: { cloneId, role: clone.role, sixDaoId: clone.sixDaoId } });
        this.actionIndexValue += 1;
        return this.soulSummary();
    }
    dismissSoulClone(cloneId) {
        const clone = dismissSoulCloneState(this.stateValue.soul, this.stateValue.dungeons, cloneId, soulCloneAuthorityCapacityV127(this.stateValue.realm.maxRealmOrder));
        this.historyValue.append({
            id: `soul.clone.dismiss.${this.currentLifeValue.lifeId}.${this.actionIndexValue}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears,
            type: 'cultivation', significance: 10, message: `Ngươi thu hồi ${clone.name}, giảm tải Thần Hồn.`, tags: ['Soul', 'Clone', 'Dismiss'], data: { cloneId },
        });
        this.actionIndexValue += 1;
        return clone;
    }
    unlockDungeon(dungeonId) {
        if (!this.world.dungeons[dungeonId])
            throw new Error(`Unknown dungeon: ${dungeonId}`);
        if (!this.stateValue.dungeons.unlockedDungeonIds.includes(dungeonId)) {
            this.stateValue.dungeons.unlockedDungeonIds.push(dungeonId);
        }
    }
    /** Progression hook: realm/clone systems increase capacity before a clone worker can be created. */
    grantDungeonWorkerCapacity(amount = 1) {
        this.stateValue.dungeons.parallelWorkerCapacity += Math.max(0, Math.floor(amount));
    }
    grantDungeonWorker(worker) {
        addDungeonWorker(this.stateValue.dungeons, worker);
    }
    assignDungeon(workerId, dungeonId, floor = 1) {
        const dungeon = this.world.dungeons[dungeonId];
        if (!dungeon)
            throw new Error(`Unknown dungeon: ${dungeonId}`);
        if (dungeonId === V125_DAO_NATURE_DUNGEON_ID && !cloneBuildFoundationV113(this.stateValue.character.buildFoundation, this.stateValue.character.spiritualRootId).progressionV125?.daoNatureCommitted)
            throw new Error('Phải chọn Đạo Tính tại Trúc Cơ trước khi treo Vấn Đạo Đài.');
        if (!isDungeonFloorCleared(this.stateValue.dungeons, dungeonId, floor)) {
            throw new Error(`Dungeon floor must be first-cleared before assigning a worker: ${dungeonId} floor ${floor}`);
        }
        assignDungeonWorker(this.stateValue.dungeons, workerId, dungeonId, floor);
    }
    challengeDungeonFloor(dungeonId, floor = 1) {
        return challengeSessionDungeonFloorV141.call(this, dungeonId, floor);
    }
    equip(itemId) {
        equipItem(this.stateValue.equipment, itemId);
    }
    enhanceEquipment(itemId, useProtection = false) {
        if (!this.stateValue.alive)
            throw new Error('Đời hiện tại đã kết thúc.');
        const targetV142 = this.stateValue.equipment.items.find(candidate => candidate.id === itemId);
        if (targetV142?.schema === 'equipment.v142' && Math.max(0, Math.floor(targetV142.enhancementLevel ?? 0)) >= 15)
            throw new Error('Trang bị V142 đã đạt +15.');
        const seed = mixSeed(this.rootSeed ^ 0x98e11a9d, this.actionIndexValue + 1);
        const rng = new SeededRng(seed);
        const result = attemptEquipmentEnhancement(this.stateValue.equipment, itemId, rng.next(), rng.next(), useProtection, this.stateValue.inventory);
        const item = this.stateValue.equipment.items.find(candidate => candidate.id === itemId);
        const summary = result.success
            ? `Cường hóa ${item.name} thành công: +${result.beforeLevel} → +${result.afterLevel}.`
            : result.downgraded
                ? `Cường hóa ${item.name} thất bại và tụt: +${result.beforeLevel} → +${result.afterLevel}.`
                : result.protectionUsed
                    ? `Cường hóa ${item.name} thất bại; Bùa Chống Tụt đã giữ +${result.beforeLevel}.`
                    : `Cường hóa ${item.name} thất bại; giữ nguyên +${result.beforeLevel}.`;
        this.historyValue.append({ id: `equipment.enhance.${seed}.${itemId}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'system', significance: result.success && result.afterLevel >= 15 ? 18 : 5, message: summary, locationId: this.stateValue.locationId, tags: ['Equipment', 'Enhancement', result.success ? 'Success' : 'Failure', ...(result.downgraded ? ['Downgrade'] : []), ...(result.protectionUsed ? ['Protected'] : [])], data: { itemId, beforeLevel: result.beforeLevel, afterLevel: result.afterLevel, targetLevel: result.targetLevel, successChancePct: result.successChancePct, essenceCost: result.essenceCost } });
        this.actionIndexValue += 1;
        return result;
    }
    transferEquipmentEnhancement(fromItemId, toItemId) {
        if (!this.stateValue.alive)
            throw new Error('Đời hiện tại đã kết thúc.');
        const result = transferEquipmentEnhancement(this.stateValue.equipment, fromItemId, toItemId, this.stateValue.inventory);
        const from = this.stateValue.equipment.items.find(item => item.id === fromItemId);
        const to = this.stateValue.equipment.items.find(item => item.id === toItemId);
        const seed = mixSeed(this.rootSeed ^ 0x71a98f03, this.actionIndexValue + 1);
        this.historyValue.append({ id: `equipment.transfer.${seed}.${toItemId}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'system', significance: 8, message: `Ngọc Chuyển Cường Hóa: chuyển +${result.transferredLevel} từ ${from.name} sang ${to.name}.`, locationId: this.stateValue.locationId, tags: ['Equipment', 'EnhancementTransfer'], data: { fromItemId, toItemId, level: result.transferredLevel } });
        this.actionIndexValue += 1;
        return result;
    }
    reforgeEquipmentAffixV115(itemId, index, targetFamily) {
        if (!this.stateValue.alive)
            throw new Error('Đời hiện tại đã kết thúc.');
        const item = this.stateValue.equipment.items.find(x => x.id === itemId);
        if (!item)
            throw new Error(`Unknown equipment instance: ${itemId}`);
        const seed = mixSeed(this.rootSeed ^ 0x115a771, this.actionIndexValue + 1);
        const result = reforgeEquipmentAffixEconomyV115(item, index, seed, this.stateValue.inventory, targetFamily);
        this.historyValue.append({ id: `equipment.reforge.v115.${seed}.${itemId}.${index}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'system', significance: 6, message: `Tái Luyện ${item.name}: ${result.before.id} → ${result.after.id}${result.familyChanged ? ' · đổi family' : ''}; lần #${result.reforgeCountAfter}.`, locationId: this.stateValue.locationId, tags: ['Equipment', 'ReforgeV115', result.familyChanged ? 'FamilyChange' : 'SameFamily'], data: { itemId, index, reforgeCount: result.reforgeCountAfter, spiritStones: result.cost.spiritStones, equipmentEssence: result.cost.equipmentEssence } });
        this.actionIndexValue += 1;
        return result;
    }
    refineEquipmentAffixV115(itemId, index) {
        if (!this.stateValue.alive)
            throw new Error('Đời hiện tại đã kết thúc.');
        const item = this.stateValue.equipment.items.find(x => x.id === itemId);
        if (!item)
            throw new Error(`Unknown equipment instance: ${itemId}`);
        const result = refineEquipmentAffixV115(item, index, this.stateValue.inventory);
        const seed = mixSeed(this.rootSeed ^ 0x115f1ae, this.actionIndexValue + 1);
        this.historyValue.append({ id: `equipment.refine.v115.${seed}.${itemId}.${index}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'system', significance: 4, message: `Tinh Luyện ${item.name}: ${result.before.rollPct.toFixed(2)}% → ${result.after.rollPct.toFixed(2)}%.`, locationId: this.stateValue.locationId, tags: ['Equipment', 'AffixRefineV115'], data: { itemId, index, rollPct: result.after.rollPct, spiritStones: result.cost.spiritStones, equipmentEssence: result.cost.equipmentEssence } });
        this.actionIndexValue += 1;
        return result;
    }
    engraveDaoInscriptionV115(itemId, inscriptionId) {
        if (!this.stateValue.alive)
            throw new Error('Đời hiện tại đã kết thúc.');
        const item = this.stateValue.equipment.items.find(x => x.id === itemId);
        if (!item)
            throw new Error(`Unknown equipment instance: ${itemId}`);
        if (item.schema === 'equipment.v142')
            throw new Error('Trang bị V142 không dùng Đạo Văn.');
        const result = engraveDaoInscriptionExactV115(item, inscriptionId, this.stateValue.inventory);
        const seed = mixSeed(this.rootSeed ^ 0x115da0, this.actionIndexValue + 1);
        this.historyValue.append({ id: `equipment.dao-engrave.v115.${seed}.${itemId}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'system', significance: 12, message: `Khắc Đạo Văn ${inscriptionId} lên ${item.name}.`, locationId: this.stateValue.locationId, tags: ['Equipment', 'DaoInscription', 'Deterministic'], data: { itemId, inscriptionId, spiritStones: result.cost.spiritStones, equipmentEssence: result.cost.equipmentEssence, daoFragments: result.cost.daoFragments ?? 0 } });
        this.actionIndexValue += 1;
        return result;
    }
    socketEquipmentGemV128(itemId, socketIndex, element) {
        if (!this.stateValue.alive)
            throw new Error('Đời hiện tại đã kết thúc.');
        const item = this.stateValue.equipment.items.find(x => x.id === itemId);
        if (!item)
            throw new Error(`Unknown equipment instance: ${itemId}`);
        if (item.schema === 'equipment.v142')
            throw new Error('Trang bị V142 không dùng Ngũ Hành Ngọc.');
        const result = socketEquipmentGemV128(item, socketIndex, element, this.stateValue.inventory);
        const seed = mixSeed(this.rootSeed ^ 0x1286e01, this.actionIndexValue + 1);
        this.historyValue.append({ id: `equipment.gem.socket.v128.${seed}.${itemId}.${socketIndex}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'system', significance: 7, message: `Khảm ${result.effect.name} Lv${result.effect.level} vào ${item.name} · ô ${result.socketIndex + 1}.`, locationId: this.stateValue.locationId, tags: ['Equipment', 'GemV128', 'Socket', result.gem.element], data: { itemId, socketIndex: result.socketIndex, element: result.gem.element, level: result.gem.level, spentBlanks: result.spentBlanks } });
        this.actionIndexValue += 1;
        return result;
    }
    upgradeEquipmentGemV128(itemId, socketIndex) {
        if (!this.stateValue.alive)
            throw new Error('Đời hiện tại đã kết thúc.');
        const item = this.stateValue.equipment.items.find(x => x.id === itemId);
        if (!item)
            throw new Error(`Unknown equipment instance: ${itemId}`);
        if (item.schema === 'equipment.v142')
            throw new Error('Trang bị V142 không dùng Ngũ Hành Ngọc.');
        const result = upgradeEquipmentGemV128(item, socketIndex, this.stateValue.inventory);
        const seed = mixSeed(this.rootSeed ^ 0x1286e02, this.actionIndexValue + 1);
        this.historyValue.append({ id: `equipment.gem.upgrade.v128.${seed}.${itemId}.${socketIndex}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'system', significance: 7 + result.gem.level, message: `Nâng ${result.effect.name} trên ${item.name} thành Lv${result.gem.level}.`, locationId: this.stateValue.locationId, tags: ['Equipment', 'GemV128', 'Upgrade', result.gem.element], data: { itemId, socketIndex: result.socketIndex, element: result.gem.element, level: result.gem.level, spentBlanks: result.spentBlanks } });
        this.actionIndexValue += 1;
        return result;
    }
    unsocketEquipmentGemV128(itemId, socketIndex) {
        if (!this.stateValue.alive)
            throw new Error('Đời hiện tại đã kết thúc.');
        const item = this.stateValue.equipment.items.find(x => x.id === itemId);
        if (!item)
            throw new Error(`Unknown equipment instance: ${itemId}`);
        if (item.schema === 'equipment.v142')
            throw new Error('Trang bị V142 không dùng Ngũ Hành Ngọc.');
        const result = unsocketEquipmentGemV128(item, socketIndex, this.stateValue.inventory);
        const seed = mixSeed(this.rootSeed ^ 0x1286e03, this.actionIndexValue + 1);
        this.historyValue.append({ id: `equipment.gem.unsocket.v128.${seed}.${itemId}.${socketIndex}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'system', significance: 3, message: `Tháo Ngũ Hành Ngọc khỏi ${item.name} · ô ${result.socketIndex + 1}; hoàn ${result.refundedBlanks} Ngũ Hành Ngọc Phôi.`, locationId: this.stateValue.locationId, tags: ['Equipment', 'GemV128', 'Unsocket'], data: { itemId, socketIndex: result.socketIndex, refundedBlanks: result.refundedBlanks } });
        this.actionIndexValue += 1;
        return result;
    }
    equipmentV142Summary() {
        return equipmentCraftingSummaryV142(this.stateValue, this.stateValue.equipment);
    }
    craftEquipmentV142(slot, rankIndex) {
        if (!this.stateValue.alive) throw new Error('Đời hiện tại đã kết thúc.');
        const rank = Math.max(0, Math.floor(Number(rankIndex) || 0));
        const maxRank = this.stateValue.realm.maxRealmOrder >= 1 ? majorRealmIndexForRealmOrder(this.stateValue.realm.maxRealmOrder) : 0;
        if (rank > maxRank) throw new Error(`Chưa thể luyện trang bị ${rank}: cảnh giới hiện tại chỉ mở tới bậc ${maxRank}.`);
        const seed = mixSeed(this.rootSeed ^ 0x142c0de, this.actionIndexValue + 1);
        const result = craftRankedEquipmentV142(this.stateValue, this.stateValue.equipment, { slot, rankIndex: rank, seed, acquiredWorldYear: this.stateValue.worldTimeYears });
        this.actionIndexValue += 1;
        return result;
    }
    refineEquipmentFragmentsV142(fromRank, batches = 1) {
        if (!this.stateValue.alive) throw new Error('Đời hiện tại đã kết thúc.');
        const result = refineRankedEquipmentFragmentsV142(this.stateValue, fromRank, batches);
        this.actionIndexValue += 1;
        return result;
    }
    mergeEquipmentV142(mainItemId, fodderItemAId, fodderItemBId) {
        if (!this.stateValue.alive) throw new Error('Đời hiện tại đã kết thúc.');
        const main = this.stateValue.equipment.items.find(item => item.id === mainItemId);
        if (!main || main.schema !== 'equipment.v142') throw new Error('Không tìm thấy trang bị V142 chính.');
        const maxRank = this.stateValue.realm.maxRealmOrder >= 1 ? majorRealmIndexForRealmOrder(this.stateValue.realm.maxRealmOrder) : 0;
        if ((main.equipmentRankIndex ?? 0) + 1 > maxRank) throw new Error('Không thể hợp trang bị vượt quá đại cảnh đã đạt.');
        const result = mergeRankedEquipmentV142(this.stateValue.equipment, mainItemId, fodderItemAId, fodderItemBId);
        this.actionIndexValue += 1;
        return result;
    }
    engraveEquipmentSetV142(itemId, setId) {
        if (!this.stateValue.alive) throw new Error('Đời hiện tại đã kết thúc.');
        const result = engraveRankedEquipmentSetV142(this.stateValue, this.stateValue.equipment, itemId, setId);
        this.actionIndexValue += 1;
        return result;
    }
    craftEquipmentSetV116(input) {
        if (!this.stateValue.alive)
            throw new Error('Đời hiện tại đã kết thúc.');
        const set = requireUnlockedSetCraftV116(this.stateValue.equipment, input.setId, input.slot);
        const templateId = equipmentSetTemplateIdV116(input.setId, input.slot);
        const template = this.registry.equipmentTemplate(templateId);
        if (template.setId !== input.setId || template.slot !== input.slot)
            throw new Error('Template Set không khớp identity/slot đã chọn.');
        const seed = mixSeed(this.rootSeed ^ 0x116c4f7, this.actionIndexValue + 1);
        const source = { kind: 'craft', recipeId: `set.v116:${input.setId}`, floor: 1, seed };
        const item = buildEquipmentInstance(template, Math.max(0, Math.floor(input.tier)), input.quality ?? 'high', 1, source, this.stateValue.worldTimeYears, input.grade);
        if (input.preferredFamily)
            ensureCraftPreferredAffixFamilyV115(item, input.preferredFamily, seed ^ 0x115c0de);
        const cost = craftEquipmentCostV115(input.grade);
        spendEquipmentEconomyCostV115(this.stateValue.inventory, cost);
        addEquipment(this.stateValue.equipment, item);
        this.historyValue.append({ id: `equipment.set-craft.v116.${seed}.${item.id}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'system', significance: 10, message: `Luyện thành ${item.name} [${set.name}] — đúng Set/slot/grade đã chọn.`, locationId: this.stateValue.locationId, tags: ['Equipment', 'SetV116', 'Craft', 'ExactSet'], data: { itemId: item.id, setId: input.setId, slot: input.slot, grade: input.grade, tier: item.tier, spiritStones: cost.spiritStones, equipmentEssence: cost.equipmentEssence, preferredFamily: input.preferredFamily ?? '' } });
        this.actionIndexValue += 1;
        return { item, cost };
    }
    legacyTechniqueRetiredV144(action = 'Công Pháp legacy') {
        throw new Error(`${action} đã nghỉ production ở V144. Công Pháp canonical dùng hệ V127 (Lv1000 / 10 lần tiến giai).`);
    }
    learnTechnique() { return this.legacyTechniqueRetiredV144('Học Công Pháp V103/V119'); }
    useTechnique() { return this.legacyTechniqueRetiredV144('Kích hoạt Tâm Pháp V103/V119'); }
    equipTechniqueManual() { return this.legacyTechniqueRetiredV144('Trang bị Công Pháp V103/V119'); }
    studyTechniqueManual() { return this.legacyTechniqueRetiredV144('Tham ngộ mastery V103/V119'); }
    setTechniqueVariantsV119() { return this.legacyTechniqueRetiredV144('Biến Thức phụ thuộc Công Pháp V119'); }
    techniqueManualSummary() {
        return { schema: 'technique-manuals.v144.retired', retired: true, canonicalSchema: 'manual-progression.v127.production', note: 'V103/V119 chỉ còn dữ liệu save tương thích; không tạo sức mạnh, loot hay progression.' };
    }
    collectionSummaryV12316(nowUnixMs = Date.now()) {
        return deriveCollectionSummaryV12316(this.stateValue, nowUnixMs);
    }
    collectionEconomyV12325(nowUnixMs = Date.now()) {
        const state = cloneCollectionProgressStateV12316(this.stateValue.collectionV12316);
        const foundation = cloneBuildFoundationV113(this.stateValue.character.buildFoundation, this.stateValue.character.spiritualRootId);
        return deriveCollectionEconomyV12325(state, foundation, nowUnixMs, this.stateValue.realm.maxRealmOrder);
    }
    collectionEconomyV12326(nowUnixMs = Date.now()) {
        const state = cloneCollectionProgressStateV12316(this.stateValue.collectionV12316);
        const foundation = cloneBuildFoundationV113(this.stateValue.character.buildFoundation, this.stateValue.character.spiritualRootId);
        return deriveCollectionWorkshopV12326(state, { ...this.stateValue.inventory }, foundation, this.currentLifeValue.birth.originsV101 ? structuredClone(this.currentLifeValue.birth.originsV101) : undefined, nowUnixMs, this.stateValue.realm.maxRealmOrder);
    }
    economyActivityV89(nowUnixMs = Date.now()) {
        const state = cloneCollectionProgressStateV12316(this.stateValue.collectionV12316);
        return economyActivitySummaryV89(state, { ...this.stateValue.inventory }, nowUnixMs);
    }
    pvpV91(nowUnixMs = Date.now()) {
        return pvpViewV91(this.stateValue, nowUnixMs);
    }
    joinPvpV91(nowUnixMs = Date.now()) {
        const result = joinPvpV91(this.stateValue, this.personalCombatEntity(), nowUnixMs);
        if (result.joined) this.actionIndexValue += 1;
        return result;
    }
    refreshPvpDefenseV91(nowUnixMs = Date.now()) {
        const result = refreshPvpDefenseV91(this.stateValue, this.personalCombatEntity(), this.registry, nowUnixMs);
        this.actionIndexValue += 1;
        return { ...result, pvp: this.pvpV91(nowUnixMs) };
    }
    setPvpTacticalV94(presetId, nowUnixMs = Date.now()) {
        const result = setPvpTacticalV94(this.stateValue, presetId, nowUnixMs);
        this.actionIndexValue += 1;
        return { ...result, pvp: this.pvpV91(nowUnixMs) };
    }
    challengePvpV91(opponentId, nowUnixMs = Date.now()) {
        const result = challengePvpV91(this.stateValue, this.personalCombatEntity(), this.registry, opponentId, nowUnixMs);
        let reward = { boundJade: 0 };
        if (result.won) {
            const economyHost = ensureCollectionProgressStateV12316(this.stateValue);
            reward = recordPvpWinBoundJadeV91(economyHost, nowUnixMs);
            result.rewardBoundJade = reward.boundJade;
            result.reward = reward;
        }
        recordPvpRewardIntegrityV94(this.stateValue, result.fightId, reward.boundJade ?? 0, nowUnixMs);
        this.actionIndexValue += 1;
        return { ...result, pvp: this.pvpV91(nowUnixMs) };
    }
    settlePvpSeasonV94(nowUnixMs = Date.now()) {
        const result = settlePvpSeasonV94(this.stateValue, this.personalCombatEntity(), this.registry, nowUnixMs);
        const economyHost = ensureCollectionProgressStateV12316(this.stateValue);
        const ledger = recordPvpSeasonBoundJadeV94(economyHost, result.summary.seasonId, result.reward.boundJade, result.reward.rank.id, nowUnixMs);
        result.reward = { ...result.reward, awarded: ledger.awarded, boundJade: ledger.boundJade };
        result.summary.rewardBoundJade = ledger.boundJade;
        recordPvpSeasonRewardIntegrityV94(this.stateValue, result.summary.seasonId, ledger.boundJade, nowUnixMs);
        this.actionIndexValue += 1;
        return { ...result, pvp: this.pvpV91(nowUnixMs) };
    }
    replayPvpV91(fightId) {
        return replayPvpV91(this.stateValue, this.registry, fightId);
    }
    buyEconomyOfferV89(offerId, nowUnixMs = Date.now()) {
        if (!this.stateValue.alive)
            throw new Error('Đời hiện tại đã kết thúc.');
        const state = ensureCollectionProgressStateV12316(this.stateValue);
        const result = buyEconomyOfferV89(state, this.stateValue.inventory, offerId, nowUnixMs);
        this.actionIndexValue += 1;
        return { ...result, economy: this.economyActivityV89(nowUnixMs), collection: this.collectionEconomyV12326(nowUnixMs) };
    }
    forgingTalentModifiersV87() { const talent = professionTalentModifiers(this.stateValue.inheritedOrigins, 'forging'), confidant = collectionConfidantV87Summary(this.stateValue.collectionV12316), specialty = confidant.activeSpecialty, forgingPct = specialty?.unlocked && specialty.id === 'forging' ? specialty.strengthPct : 0; return { ...talent, successChanceFlat: Math.max(0, Number(talent.successChanceFlat ?? 0)) + forgingPct / 100, qualityScoreBonus: Math.max(0, Number(talent.qualityScoreBonus ?? 0)) + forgingPct + Math.max(0, confidant.fortune.craftQualityPct), masteryGainMultiplier: Math.max(1, Number(talent.masteryGainMultiplier ?? 1)) + forgingPct / 200 }; }
    syncForgingV12328(nowUnixMs = Date.now()) { const live = this.stateValue.collectionV12316; if (!live?.workshopV12328?.forgeQueues?.length)
        return []; const state = ensureCollectionProgressStateV12316(this.stateValue), ready = readyForgeQueuesV12328(state, nowUnixMs), done = []; for (const job of ready) {
        for (const r of job.reserved)
            this.stateValue.inventory[r.resourceId] = (this.stateValue.inventory[r.resourceId] ?? 0) + r.quantity;
        let recipe;
        try {
            recipe = this.registry.professionRecipe(job.recipeId);
            const seed = mixSeed(this.rootSeed ^ 0x2328f011, this.actionIndexValue + Number(job.id.split('.').pop() || 0));
            const result = this.professionEngine.craft(this.stateValue, this.registry, recipe, 1, seed, job.selections, this.forgingTalentModifiersV87());
            removeForgeQueueV12328(state, job.id);
            const success = result.results.find(x => x.success), best = success?.quality, crafted = success?.equipment?.name;
            if (success?.equipment)
                success.equipment.acquiredWorldYear = this.stateValue.worldTimeYears;
            this.historyValue.append({ id: `forge.complete.${job.id}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'crafting', significance: best === 'perfect' ? 28 : best === 'supreme' ? 18 : 8, message: result.successes ? `${recipe.name} hoàn thành: ${crafted ?? 'Khí Đồ'} · ${best ? productQualityNames[best] : 'thành công'}.` : `${recipe.name} luyện chế thất bại.`, locationId: this.stateValue.locationId, tags: ['Forging', 'WorkshopV12328', best ? `Quality:${best}` : 'Failed'], data: { recipeId: recipe.id, quality: best ?? '', successes: result.successes } });
            done.push({ jobId: job.id, recipeId: recipe.id, successes: result.successes, quality: best, crafted });
        }
        catch (error) {
            removeForgeQueueV12328(state, job.id);
            const message = error instanceof Error ? error.message : String(error);
            this.historyValue.append({ id: `forge.invalid.${job.id}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'system', significance: 4, message: `Hàng chờ Luyện Khí lỗi; đã hoàn nguyên vật liệu: ${message}`, locationId: this.stateValue.locationId, tags: ['Forging', 'WorkshopV12328', 'QueueRecovery'], data: { recipeId: job.recipeId, error: message } });
            done.push({ jobId: job.id, recipeId: job.recipeId, successes: 0, error: message, refunded: true });
        }
    } return done; }
    forgingV12328Summary(nowUnixMs = Date.now()) { const state = cloneCollectionProgressStateV12316(this.stateValue.collectionV12316), w = ensureWorkshopProductionV12328(state), track = this.stateValue.professions.tracks.forging, facility = state.cave.facilities.find(x => x.id === 'forge'), lv = facility?.level ?? 1, timeReductionPct = Math.min(45, Math.max(0, lv - 1) * 5); const recipes = [...this.registry.professionRecipes.values()].filter(r => r.professionId === 'forging').map(recipe => { const remaining = { ...this.stateValue.inventory }; let bestQualityModifier = 0, canIngredients = true; const options = recipe.ingredients.map(req => { const view = { id: req.id, name: req.name, options: req.options.map(o => ({ ...o, available: this.stateValue.inventory[o.resourceId] ?? 0 })) }; const affordable = [...req.options].sort((a, b) => (b.qualityModifier ?? 0) - (a.qualityModifier ?? 0)).find(o => (remaining[o.resourceId] ?? 0) >= o.quantity); if (!affordable)
        canIngredients = false;
    else {
        remaining[affordable.resourceId] = (remaining[affordable.resourceId] ?? 0) - affordable.quantity;
        bestQualityModifier += affordable.qualityModifier ?? 0;
    } return view; }); const talent = this.forgingTalentModifiersV87(), successPct = canIngredients ? Math.max(8, Math.min(98, (.58 + track.mastery * .0042 + this.stateValue.realm.maxRealmOrder * .006 + bestQualityModifier * .035 - recipe.difficulty * .045 + Math.max(0, talent.successChanceFlat ?? 0)) * 100)) : 0; return { id: recipe.id, name: recipe.name, description: recipe.description, difficulty: recipe.difficulty, masteryRequired: recipe.masteryRequired, known: track.knownRecipeIds.includes(recipe.id), durationRealSeconds: recipe.timeYears / WORLD_YEARS_PER_REAL_HOUR * 3600 * (1 - timeReductionPct / 100), ingredients: options, canStart: track.knownRecipeIds.includes(recipe.id) && track.mastery + 1e-9 >= recipe.masteryRequired && canIngredients, successPct: Number(successPct.toFixed(1)), tags: [...recipe.tags] }; }); return { schema: 'forging-workshop.v12328', mastery: track.mastery, highestQuality: track.highestQuality ? productQualityNames[track.highestQuality] : undefined, facilityLevel: lv, timeReductionPct, queueCapacity: Math.min(4, 1 + Math.floor((lv - 1) / 3)), queues: w.forgeQueues.map(q => ({ ...q, remainingSeconds: Math.max(0, (q.completesAtUnixMs - nowUnixMs) / 1000) })), recipes, completed: [] }; }
    startForgingV12328(recipeId, nowUnixMs = Date.now()) { if (!this.stateValue.alive)
        throw new Error('Đời hiện tại đã kết thúc.'); this.syncForgingV12328(nowUnixMs); const state = ensureCollectionProgressStateV12316(this.stateValue), recipe = this.registry.professionRecipe(recipeId), track = this.stateValue.professions.tracks.forging; if (recipe.professionId !== 'forging')
        throw new Error('Recipe không thuộc Luyện Khí.'); if (!track.knownRecipeIds.includes(recipe.id))
        throw new Error('Chưa lĩnh ngộ khí đồ này.'); if (track.mastery + 1e-9 < recipe.masteryRequired)
        throw new Error(`Luyện Khí mastery chưa đủ: ${track.mastery.toFixed(0)}/${recipe.masteryRequired}.`); const lv = state.cave.facilities.find(x => x.id === 'forge')?.level ?? 1, timeReductionPct = Math.min(45, Math.max(0, lv - 1) * 5), seconds = recipe.timeYears / WORLD_YEARS_PER_REAL_HOUR * 3600 * (1 - timeReductionPct / 100); const job = reserveForgeQueueV12328(state, this.stateValue.inventory, recipe, seconds, nowUnixMs); const economyAwards = recordEconomyActivityV89(state, 'craftActions', 1, nowUnixMs).awards; this.actionIndexValue += 1; return { job, forging: this.forgingV12328Summary(nowUnixMs), economyAwards }; }
    setManualGachaRealmV127(realmStageIndex) {
        if (!this.stateValue.alive) throw new Error('Đời hiện tại đã kết thúc.');
        const state = ensureCollectionProgressStateV12316(this.stateValue);
        const banner = setManualGachaRealmStateV127(state, realmStageIndex, this.stateValue.realm.maxRealmOrder);
        this.actionIndexValue += 1;
        return { ...banner, summary: this.collectionEconomyV12326() };
    }
    setManualGachaOrientationV127(manualId) {
        if (!this.stateValue.alive) throw new Error('Đời hiện tại đã kết thúc.');
        const state = ensureCollectionProgressStateV12316(this.stateValue);
        const banner = setManualGachaOrientationStateV127(state, manualId, this.stateValue.realm.maxRealmOrder);
        this.actionIndexValue += 1;
        return { ...banner, summary: this.collectionEconomyV12326() };
    }
    collectionGachaV12326(bannerId, count = 1, usePremium = false) {
        if (!this.stateValue.alive)
            throw new Error('Đời hiện tại đã kết thúc.');
        const state = ensureCollectionProgressStateV12316(this.stateValue);
        const known = this.stateValue.character.buildFoundation?.learnedDaoPassiveIdsV118 ?? [];
        syncOriginCollectionV12326(state, this.currentLifeValue.birth.originsV101);
        const result = rollCollectionWorkshopGachaV12326(state, this.stateValue.inventory, bannerId, count, (this.rootSeed ^ this.actionIndexValue ^ 0x2326c011) >>> 0, usePremium, known, this.stateValue.realm.maxRealmOrder);
        if (!usePremium)
            recordBoundJadeSpendV89(state, `gacha.${bannerId}`, result.cost);
        this.actionIndexValue += 1;
        return { ...result, summary: this.collectionEconomyV12326(), economy: this.economyActivityV89() };
    }
    composeCollectionV12326(itemId) { const state = ensureCollectionProgressStateV12316(this.stateValue); const result = composeCollectionItemV12326(state, itemId, this.stateValue.realm.maxRealmOrder); this.actionIndexValue += 1; return { ...result, summary: this.collectionEconomyV12326() }; }
    activateOriginCollectionV12326(category, itemId) { const state = ensureCollectionProgressStateV12316(this.stateValue), bundle = this.currentLifeValue.birth.originsV101; if (!bundle)
        throw new Error('Save chưa có căn nguyên hiện đại.'); const result = activateOriginCollectionV12326(state, bundle, category, itemId); this.syncModernBirthOrigins(); this.actionIndexValue += 1; return { ...result, summary: this.collectionEconomyV12326() }; }
    clearCollectionDailyV12326(dungeonId, nowUnixMs = Date.now()) { if (!this.stateValue.alive)
        throw new Error('Đời hiện tại đã kết thúc.'); const state = ensureCollectionProgressStateV12316(this.stateValue); const result = clearDailyWorkshopV12326(state, this.stateValue.inventory, dungeonId, nowUnixMs); this.actionIndexValue += 1; return { ...result, summary: this.collectionEconomyV12326(nowUnixMs) }; }
    simulateCollectionGachaV12326(category, pulls = 10000) { return simulateGachaV12326(category, pulls, (this.rootSeed ^ 0x2326de01) >>> 0); }
    devCollectionGrantV12326() { const state = ensureCollectionProgressStateV12316(this.stateValue); devMaxWorkshopV12326(state, this.stateValue.inventory); syncOriginCollectionV12326(state, this.currentLifeValue.birth.originsV101); this.actionIndexValue += 1; return this.collectionEconomyV12326(); }
    upgradePetGearV12328(petId, slot) { if (!this.stateValue.alive)
        throw new Error('Đời hiện tại đã kết thúc.'); const state = ensureCollectionProgressStateV12316(this.stateValue); const result = upgradePetGearV12328(state, petId, slot); this.actionIndexValue += 1; return { ...result, summary: this.collectionEconomyV12326() }; }
    collectionGachaV12325(bannerId, count = 1, usePremium = false) {
        if (!this.stateValue.alive)
            throw new Error('Đời hiện tại đã kết thúc.');
        const state = ensureCollectionProgressStateV12316(this.stateValue);
        const known = this.stateValue.character.buildFoundation?.learnedDaoPassiveIdsV118 ?? [];
        const result = rollCollectionEconomyV12325(state, bannerId, count, (this.rootSeed ^ this.actionIndexValue ^ 0x2325c011) >>> 0, usePremium, known);
        if (!usePremium)
            recordBoundJadeSpendV89(state, `gacha.legacy25.${bannerId}`, result.cost);
        this.actionIndexValue += 1;
        return { ...result, summary: this.collectionEconomyV12325() };
    }
    strengthenCollectionV12325(itemId, levels = 1) { const state = ensureCollectionProgressStateV12316(this.stateValue); const result = strengthenCollectionEconomyProgressV12325(state, itemId, levels); this.actionIndexValue += 1; return { ...result, summary: this.collectionEconomyV12325() }; }
    advanceCollectionV12325(itemId) { const state = ensureCollectionProgressStateV12316(this.stateValue); const result = advanceCollectionEconomyProgressV12325(state, itemId); this.actionIndexValue += 1; return { ...result, summary: this.collectionEconomyV12325() }; }
    equipCollectionV12325(itemId, artifactSlotIndex) { const state = ensureCollectionProgressStateV12316(this.stateValue); const result = equipCollectionEconomyProgressV12325(state, itemId, artifactSlotCapacityV88(this.stateValue.realm.maxRealmOrder), artifactSlotIndex); this.actionIndexValue += 1; return { ...result, summary: this.collectionEconomyV12325() }; }
    unequipCollectionV12325(itemId) { const state = ensureCollectionProgressStateV12316(this.stateValue); unequipCollectionEconomyProgressV12325(state, itemId); this.actionIndexValue += 1; return this.collectionEconomyV12325(); }
    strengthenHeartMethodV12325(passiveId) { const state = ensureCollectionProgressStateV12316(this.stateValue); const foundation = cloneBuildFoundationV113(this.stateValue.character.buildFoundation, this.stateValue.character.spiritualRootId); ensureSkillHeartProgressionV12317(foundation.progressionV125); const result = strengthenHeartMethodProgressV12325(state, foundation, passiveId); this.stateValue.character.buildFoundation = foundation; this.actionIndexValue += 1; return { ...result, summary: this.specializationSkillSummaryV125(), economy: this.collectionEconomyV12325() }; }
    advanceHeartMethodV12325(passiveId) { const state = ensureCollectionProgressStateV12316(this.stateValue); const foundation = cloneBuildFoundationV113(this.stateValue.character.buildFoundation, this.stateValue.character.spiritualRootId); ensureSkillHeartProgressionV12317(foundation.progressionV125); const result = advanceHeartMethodProgressV12325(state, foundation, passiveId); this.stateValue.character.buildFoundation = foundation; this.actionIndexValue += 1; return { ...result, summary: this.specializationSkillSummaryV125(), economy: this.collectionEconomyV12325() }; }
    clearCollectionDailyV12325(dungeonId, nowUnixMs = Date.now()) { if (!this.stateValue.alive)
        throw new Error('Đời hiện tại đã kết thúc.'); const state = ensureCollectionProgressStateV12316(this.stateValue); const result = clearDailyEconomyV12325(state, dungeonId, (this.rootSeed ^ this.actionIndexValue ^ 0xda11e325) >>> 0, nowUnixMs); this.actionIndexValue += 1; return { ...result, summary: this.collectionEconomyV12325(nowUnixMs) }; }
    simulateCollectionGachaV12325(bannerId, pulls = 10000) { return simulateGachaEconomyV12325(bannerId, pulls, (this.rootSeed ^ 0x2325de01) >>> 0); }
    devCollectionGrantV12325() { const state = ensureCollectionProgressStateV12316(this.stateValue); devMaxCollectionEconomyV12325(state); this.actionIndexValue += 1; return this.collectionEconomyV12325(); }
    collectionGachaV12316(category, count = 1, usePremium = false) {
        if (!this.stateValue.alive)
            throw new Error('Đời hiện tại đã kết thúc.');
        const state = ensureCollectionProgressStateV12316(this.stateValue);
        const result = rollCollectionGachaV12316(state, category, count, (this.rootSeed ^ this.actionIndexValue ^ 0x2316c011) >>> 0, usePremium);
        if (!usePremium)
            recordBoundJadeSpendV89(state, `gacha.legacy16.${category}`, result.cost);
        this.actionIndexValue += 1;
        return { ...result, summary: deriveCollectionSummaryV12316(this.stateValue) };
    }
    strengthenCollectionV12316(itemId, levels = 1) { const state = ensureCollectionProgressStateV12316(this.stateValue); const result = strengthenCollectionProgressV12316(state, itemId, levels); this.actionIndexValue += 1; return { ...result, summary: deriveCollectionSummaryV12316(this.stateValue) }; }
    advanceCollectionV12316(itemId) { const state = ensureCollectionProgressStateV12316(this.stateValue); const result = advanceCollectionProgressV12316(state, itemId); this.actionIndexValue += 1; return { ...result, summary: deriveCollectionSummaryV12316(this.stateValue) }; }
    equipCollectionV12316(itemId) { const state = ensureCollectionProgressStateV12316(this.stateValue); equipCollectionProgressV12316(state, itemId); this.actionIndexValue += 1; return deriveCollectionSummaryV12316(this.stateValue); }
    unequipCollectionV12316(itemId) { const state = ensureCollectionProgressStateV12316(this.stateValue); unequipCollectionProgressV12316(state, itemId); this.actionIndexValue += 1; return deriveCollectionSummaryV12316(this.stateValue); }
    clearCollectionDailyV12316(dungeonId, nowUnixMs = Date.now()) { if (!this.stateValue.alive)
        throw new Error('Đời hiện tại đã kết thúc.'); const state = ensureCollectionProgressStateV12316(this.stateValue); const result = clearCollectionDailyV12316(state, dungeonId, (this.rootSeed ^ this.actionIndexValue ^ 0xda11e316) >>> 0, nowUnixMs); const e = ensureCollectionEconomyV12325(state); if (dungeonId === 'daily.all') {
        for (const c of ['manual', 'artifact', 'pet', 'companion'])
            e.ascensionEssence[c] += 1;
    }
    else {
        const c = result.dungeon.reward.genericCategory;
        e.ascensionEssence[c] += 1;
    } this.actionIndexValue += 1; return { ...result, ascensionEssence: dungeonId === 'daily.all' ? 4 : 1, summary: deriveCollectionSummaryV12316(this.stateValue, nowUnixMs), economy: this.collectionEconomyV12325(nowUnixMs) }; }
    upgradeCaveFacilityV12316(facilityId) { const state = ensureCollectionProgressStateV12316(this.stateValue); const result = upgradeCollectionCaveV12316(state, facilityId, this.stateValue.inventory); recordBoundJadeSpendV89(state, `cave.${facilityId}`, result.cost.boundJade); this.actionIndexValue += 1; return { ...result, summary: deriveCollectionSummaryV12316(this.stateValue), economy: this.economyActivityV89() }; }
    ensureSpiritualRootV145() {
        return settleLegacySpiritualRootMigrationV145(this.stateValue.character, this.stateValue.inventory).state;
    }
    spiritualRootSummaryV145() {
        const root = this.ensureSpiritualRootV145();
        return spiritualRootSummaryV145(root, this.stateValue.inventory, majorRealmIndexForRealmOrder(this.stateValue.realm.maxRealmOrder));
    }
    nourishSpiritualRootV145(levels = 1) {
        const result = nourishSpiritualRootStateV145(this.ensureSpiritualRootV145(), this.stateValue.inventory, levels);
        this.stateValue.character.spiritualRootV145 = result.state;
        this.actionIndexValue += 1;
        return { ...result, summary: spiritualRootSummaryV145(result.state, this.stateValue.inventory, majorRealmIndexForRealmOrder(this.stateValue.realm.maxRealmOrder)) };
    }
    ascendSpiritualRootV145() {
        const result = ascendSpiritualRootStateV145(this.ensureSpiritualRootV145(), this.stateValue.inventory, majorRealmIndexForRealmOrder(this.stateValue.realm.maxRealmOrder));
        this.stateValue.character.spiritualRootV145 = result.state;
        this.historyValue.append({ id: `root.ascend.v145.${this.actionIndexValue}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'breakthrough', significance: 24, message: `Linh Căn Tiến Cấp tại Lv${result.state.level}; nhận 1 Điểm Căn Mạch và mở lựa chọn Căn Ngộ.`, locationId: this.stateValue.locationId, tags: ['SpiritualRootV145','Ascension'], data: { level: result.state.level, cost: result.cost } });
        this.actionIndexValue += 1;
        return { ...result, summary: spiritualRootSummaryV145(result.state, this.stateValue.inventory, majorRealmIndexForRealmOrder(this.stateValue.realm.maxRealmOrder)) };
    }
    allocateSpiritualRootMeridianV145(branchId) {
        const state = allocateSpiritualRootMeridianPointV145(this.ensureSpiritualRootV145(), branchId);
        this.stateValue.character.spiritualRootV145 = state;
        this.actionIndexValue += 1;
        return spiritualRootSummaryV145(state, this.stateValue.inventory, majorRealmIndexForRealmOrder(this.stateValue.realm.maxRealmOrder));
    }
    chooseSpiritualRootInsightV145(insightId) {
        const state = chooseSpiritualRootInsightStateV145(this.ensureSpiritualRootV145(), insightId);
        this.stateValue.character.spiritualRootV145 = state;
        this.actionIndexValue += 1;
        return spiritualRootSummaryV145(state, this.stateValue.inventory, majorRealmIndexForRealmOrder(this.stateValue.realm.maxRealmOrder));
    }
    combineSpiritualRootOriginV145(fromRealmTier, batches = 1) {
        const result = combineSpiritualRootOriginStateV145(this.stateValue.inventory, fromRealmTier, batches, majorRealmIndexForRealmOrder(this.stateValue.realm.maxRealmOrder));
        this.actionIndexValue += 1;
        return { ...result, summary: this.spiritualRootSummaryV145() };
    }
    elementSealSummaryV133() {
        return elementSealSummaryV133(this.stateValue.character, id => this.registry.technique(id), id => this.registry.skill(id));
    }
    setSkillElementSealV133(skillId, root) {
        const foundation = cloneBuildFoundationV113(this.stateValue.character.buildFoundation, this.stateValue.character.spiritualRootId);
        setSkillElementSealStateV133(this.stateValue.character, foundation, skillId, root, id => this.registry.technique(id), id => this.registry.skill(id));
        this.stateValue.character.buildFoundation = foundation;
        const skill = this.registry.skill(skillId);
        this.historyValue.append({ id: `element.seal.v133.${this.actionIndexValue}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'system', significance: 5, message: root ? `Gắn Hành Ấn ${root} cho ${skill.name}.` : `Gỡ Hành Ấn tự chọn khỏi ${skill.name}.`, locationId: this.stateValue.locationId, tags: ['ElementSealV133', 'Technique'], data: { skillId, root: root ?? '', free: true, cost: 0 } });
        this.actionIndexValue += 1;
        return this.elementSealSummaryV133();
    }
    commitSpecializationV125(nature, mainDao) {
        commitSpecializationV125(this.stateValue.character, this.stateValue.realm.maxRealmOrder, nature, mainDao);
        this.syncSpecializationProgressionV125();
        this.actionIndexValue += 1;
        return this.specializationSkillSummaryV125();
    }
    chooseSecondaryDaoV125(dao) { chooseSecondaryDaoV125(this.stateValue.character, this.stateValue.realm.maxRealmOrder, dao); this.syncSpecializationProgressionV125(); this.actionIndexValue += 1; return this.specializationSkillSummaryV125(); }
    specializationSkillPreviewV125() {
        const allSkills = [...this.registry.skills.values()];
        return { schema: 'specialization-preview.v78', contentRevision: 'battle-dao-v2.production.v78', trialEnabled: false, note: 'Bản Đạo V2: Chủ Đạo dùng Core + Basic + Active + Ultimate; Phụ Đạo chỉ học Tâm Pháp và hưởng 100% hiệu lực. Kỹ năng mở theo cảnh giới, không còn bị Công Pháp legacy khóa.', daos: ['sword', 'fist', 'body', 'spell', 'poison', 'artifact', 'formation', 'mind'].map(dao => {
                const catalog = battleDaoV2Catalog(dao);
                return {
                    dao, guide: battleDaoGameplayGuideV12311(dao), core: { ...catalog.core, ownership: 'main-only' },
                    skills: battleDaoSkillPreviewV125(dao, allSkills).map(skill => ({ ...skill, ownership: 'main-only' })),
                    passives: battleDaoV2Passives(dao).map(def => ({ id: def.id, name: def.name, dao: def.dao, description: def.summary, realm: def.realm, realmGate: BATTLE_DAO_V2_REALM_ORDER[def.realm], sourceMastery: 0, sourceTechniqueNames: [], lv1Summary: def.lv1, lv10Summary: def.summary, lv20Summary: def.lv20, ownership: 'main-or-secondary', effectStrengthPct: 100 })).sort((a, b) => a.realmGate - b.realmGate || a.name.localeCompare(b.name)),
                };
            }) };
    }
    specializationSkillSummaryV125() {
        const realmOrder = this.stateValue.realm.maxRealmOrder;
        syncBattleDaoV2ProgressionV78(this.stateValue.character, realmOrder);
        const base = v125SpecializationSummary(this.stateValue.character, realmOrder);
        const f = cloneBuildFoundationV113(this.stateValue.character.buildFoundation, this.stateValue.character.spiritualRootId);
        const p = f.progressionV125;
        const skillProgV12317 = ensureSkillHeartProgressionV12317(p);
        const mainDao = f.battleDao.mainDaoId;
        const secondaryDao = f.battleDao.secondaryDaoId;
        const skills = this.stateValue.character.knownSkillIds.filter(id => this.registry.skills.has(id) && isBattleDaoSkillV125(this.registry.skill(id)) && battleDaoOfSkillV125(this.registry.skill(id)) === mainDao).map(id => { const skill = this.registry.skill(id); const practice = skillPracticeProfileV125(f, id); const growth = battleDaoSkillGrowthProfileV126(skill, practice.tier); const level = skillLevelV12317(f, id), grade = skillGradeV12317(f, id), specificFragments = skillProgV12317.skillSpecificFragmentsV12317?.[id] ?? 0; return { id, name: skill.name, dao: battleDaoOfSkillV125(skill), slot: skill.runtimeV117?.slotClass ?? 'active', realmGate: battleDaoSkillPreviewV125(mainDao, [...this.registry.skills.values()]).find(x => x.id === id)?.realmGate ?? 0, ...practice, levelV12317: level, gradeV12317: grade, gradeLabelV12317: SKILL_GRADE_LABEL_V12317[grade], levelCostV12317: level < 20 ? skillLevelCostV12317(level) : 0, specificFragmentsV12317: specificFragments, advanceCostV12317: level >= 20 ? skillAdvanceCostV12317(grade) : undefined, scalingSummaryV12317: skillScalingSummaryV12317(skill), growthRoleV126: growth?.roleName, growthSummaryV126: battleDaoSkillGrowthCurrentSummaryV126(skill, practice.tier) }; });
        const passiveDaos = [...(mainDao ? [mainDao] : []), ...(secondaryDao ? [secondaryDao] : [])];
        const learned = new Set(f.learnedDaoPassiveIdsV118 ?? []);
        const passives = passiveDaos.flatMap(dao => battleDaoV2Passives(dao)).filter(def => learned.has(def.id)).map(def => { const level = p.passiveLevels[def.id] ?? 1; const grade = heartMethodGradeV12317(f, def.id); return { id: def.id, name: def.name, dao: def.dao, description: def.summary, level, realm: def.realm, realmGate: BATTLE_DAO_V2_REALM_ORDER[def.realm], sourceRole: def.dao === mainDao ? 'main' : 'secondary', effectStrengthPct: 100, v2: true, upgradeEnabled: false, gradeV12317: grade, gradeLabelV12317: SKILL_GRADE_LABEL_V12317[grade], statSummaryV12317: heartMethodStatSummaryV12317(def.id, level, grade), effectSummaryV126: level >= 20 ? def.lv20 : def.lv1, lv10SummaryV126: def.summary, lv20SummaryV126: def.lv20, sources: [] }; }).sort((a, b) => a.realmGate - b.realmGate || a.name.localeCompare(b.name));
        const core = mainDao ? battleDaoV2Catalog(mainDao).core : undefined;
        return { ...base, v2: true, activeSlotsUnlocked: battleDaoV2ActiveSlotsUnlocked(realmOrder, BATTLE_DAO_ACTIVE_LOADOUT_SLOTS_V125), core: core ? { ...core, unlocked: realmOrder >= 10, ownership: 'main-only' } : undefined, skillSystemV12317: { schema: 'skill-heart-method.v2.production.v78', learnFirstFree: true, skillGenericFragments: skillProgV12317.skillGenericFragmentsV12317 ?? 0, gradeOrder: SKILL_GRADE_ORDER_V12317.map(id => ({ id, label: SKILL_GRADE_LABEL_V12317[id] })), notes: ['Trúc Cơ nhận ngay Basic + Active I + Passive I + Core + Ultimate của Chủ Đạo.', 'Active II–VIII mở theo cảnh giới 18/34/46/62/74/90/102 và học Lv1 miễn phí; Công Pháp legacy không còn khóa skill V2.', 'Phụ Đạo chỉ mở Tâm Pháp đúng Đạo phụ, hiệu lực 100%; không nhận Core/Basic/Active/Ultimate.'] }, skills, passives };
    }
    upgradeDaoPassiveV125() { return this.legacyTechniqueRetiredV144('Nâng Bị Động qua Công Pháp legacy'); }
    upgradeBattleDaoSkillV12317(skillId) { if (!this.stateValue.character.knownSkillIds.includes(skillId))
        throw new Error('Chưa học kỹ năng này.'); const skill = this.registry.skill(skillId); if (!isBattleDaoSkillV125(skill))
        throw new Error('Chỉ kỹ năng Bản Đạo dùng tiến trình Skill V23.17.'); const f = cloneBuildFoundationV113(this.stateValue.character.buildFoundation, this.stateValue.character.spiritualRootId); ensureSkillHeartProgressionV12317(f.progressionV125); const result = upgradeSkillLevelV12317(f, skillId); this.stateValue.character.buildFoundation = f; this.actionIndexValue += 1; return result; }
    advanceBattleDaoSkillV12317(skillId) { if (!this.stateValue.character.knownSkillIds.includes(skillId))
        throw new Error('Chưa học kỹ năng này.'); const f = cloneBuildFoundationV113(this.stateValue.character.buildFoundation, this.stateValue.character.spiritualRootId); ensureSkillHeartProgressionV12317(f.progressionV125); const result = advanceSkillGradeV12317(f, skillId); this.stateValue.character.buildFoundation = f; this.actionIndexValue += 1; return result; }
    allocateDaoNaturePointV125(tierId, branch, points = 1) { const result = allocateDaoNaturePointV125(this.stateValue.character, tierId, branch, points); this.actionIndexValue += 1; return result; }
    chooseDaoNatureMajorBranchV125(tierId, branch) { chooseDaoNatureMajorBranchV125(this.stateValue.character, tierId, branch); this.actionIndexValue += 1; return this.specializationSkillSummaryV125(); }
    learnSkill(skillId) {
        if (!this.stateValue.alive)
            throw new Error('Đời hiện tại đã kết thúc; không thể lĩnh ngộ kỹ năng mới sau khi tử vong.');
        if (skillId.startsWith('skill.class.'))
            throw new Error('Kỹ năng Tu Hệ cũ đã ngừng hoạt động theo V19/V31; hãy học kỹ năng Bản Đạo canonical.');
        const skill = this.registry.skill(skillId);
        if (this.stateValue.character.knownSkillIds.includes(skillId))
            return;
        if (isBattleDaoSkillV125(skill)) {
            const check = canLearnBattleDaoSkillV125(this.stateValue.character, skill, this.stateValue.realm.maxRealmOrder, [...this.registry.skills.values()], [...this.registry.techniques.values()]);
            if (!check.ok)
                throw new Error(check.reason ?? 'Chưa đủ điều kiện học kỹ năng Bản Đạo.');
            spendSkillPointsToLearnV125(this.stateValue.character, skill, 0, battleDaoV2ActiveSlotsUnlocked(this.stateValue.realm.maxRealmOrder, BATTLE_DAO_ACTIVE_LOADOUT_SLOTS_V125));
            const f = cloneBuildFoundationV113(this.stateValue.character.buildFoundation, this.stateValue.character.spiritualRootId);
            const p = ensureSkillHeartProgressionV12317(f.progressionV125);
            p.skillLevelsV12317[skill.id] = p.skillLevelsV12317[skill.id] ?? 1;
            if (check.sourceTechniqueId) {
                const source = this.registry.technique(check.sourceTechniqueId);
                const g = (source.grade ?? 'mundane');
                p.skillGradesV12317[skill.id] = p.skillGradesV12317[skill.id] ?? g;
            }
            this.stateValue.character.buildFoundation = f;
        }
        else
            learnCombatSkill(this.stateValue.character, skillId);
    }
    setCombatLoadout(skillIds, aiProfile) {
        const allSkills = [...this.registry.skills.values()];
        for (const skillId of skillIds) {
            if (skillId.startsWith('skill.class.'))
                throw new Error('Loadout Tu Hệ cũ đã bị V19/V31 retire.');
            const skill = this.registry.skill(skillId);
            validateBattleDaoSkillUseV125(this.stateValue.character, skill, this.stateValue.realm.maxRealmOrder, allSkills);
        }
        for (const rule of aiProfile.rules) {
            if (rule.skillId.startsWith('skill.class.'))
                throw new Error('AI Tu Hệ cũ đã bị V19/V31 retire.');
            const skill = this.registry.skill(rule.skillId);
            validateBattleDaoSkillUseV125(this.stateValue.character, skill, this.stateValue.realm.maxRealmOrder, allSkills);
        }
        const foundation = cloneBuildFoundationV113(this.stateValue.character.buildFoundation, this.stateValue.character.spiritualRootId);
        if (foundation.battleDao.mainDaoId && foundation.battleDao.committed && foundation.progressionV125?.daoNatureCommitted) {
            const normalized = syncCanonicalBattleDaoLoadoutV125(this.stateValue.character, skillIds, battleDaoV2ActiveSlotsUnlocked(this.stateValue.realm.maxRealmOrder, BATTLE_DAO_ACTIVE_LOADOUT_SLOTS_V125));
            const allowed = new Set(normalized.combinedSkillIds);
            const fallback = battleDaoAutoRotationV127(foundation.battleDao.mainDaoId, normalized.combinedSkillIds, foundation.battleDao.secondaryDaoId);
            const fallbackById = new Map(fallback.rules.map(rule => [rule.skillId, rule]));
            const rules = aiProfile.rules.filter(rule => allowed.has(rule.skillId));
            for (const id of normalized.combinedSkillIds)
                if (!rules.some(rule => rule.skillId === id)) {
                    const rule = fallbackById.get(id);
                    if (rule)
                        rules.push(rule);
                    else
                        rules.push({ skillId: id, priority: 30, conditions: [{ type: 'always' }] });
                }
            setCombatLoadout(this.stateValue.character, normalized.combinedSkillIds, { name: aiProfile.name, rules });
            return;
        }
        setCombatLoadout(this.stateValue.character, skillIds, aiProfile);
    }
    savedCombatLoadouts() {
        return (this.stateValue.character.savedCombatLoadouts ?? []).map(loadout => ({
            ...loadout, skillIds: [...loadout.skillIds], artifactIds: [...(loadout.artifactIds ?? [])], legacyArtifactIds: [...(loadout.legacyArtifactIds ?? [])], equipmentIds: { ...loadout.equipmentIds },
            aiProfile: { name: loadout.aiProfile.name, rules: loadout.aiProfile.rules.map(rule => ({ ...rule, conditions: rule.conditions.map(condition => ({ ...condition })) })) },
        }));
    }
    saveCombatLoadout(name) {
        const clean = name.trim();
        if (!clean)
            throw new Error('Tên loadout không được trống.');
        const slug = clean.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 36) || 'preset';
        const list = this.stateValue.character.savedCombatLoadouts ?? (this.stateValue.character.savedCombatLoadouts = []);
        const existing = list.find(loadout => loadout.id === `loadout.${slug}` || loadout.name.toLowerCase() === clean.toLowerCase());
        const aiProfile = this.stateValue.character.combatAiProfile ?? this.profile.combatEntity.aiProfile;
        const value = {
            id: existing?.id ?? `loadout.${slug}`, name: clean,
            skillIds: [...(this.stateValue.character.activeSkillIds.length ? this.stateValue.character.activeSkillIds : this.profile.combatEntity.skillIds)],
            aiProfile: { name: aiProfile.name, rules: aiProfile.rules.map(rule => ({ ...rule, conditions: rule.conditions.map(condition => ({ ...condition })) })) },
            artifactIds: [...(this.stateValue.collectionV12316?.activeArtifactIds ?? [])],
            relicId: this.stateValue.collectionV12316?.economyV12325?.activeRelicId,
            legacyArtifactIds: [...this.stateValue.artifacts.activeIds],
            equipmentIds: { ...this.stateValue.equipment.equipped },
        };
        if (existing)
            Object.assign(existing, value);
        else {
            if (list.length >= 10)
                throw new Error('Đã đạt giới hạn 10 loadout tự lưu.');
            list.push(value);
        }
        return this.savedCombatLoadouts().find(loadout => loadout.id === value.id);
    }
    cloneCombatLoadout(sourceId, newName) {
        const source = (this.stateValue.character.savedCombatLoadouts ?? []).find(loadout => loadout.id === sourceId || loadout.name.toLowerCase() === sourceId.toLowerCase());
        if (!source)
            throw new Error(`Không tìm thấy loadout đã lưu: ${sourceId}`);
        const currentSkills = [...this.stateValue.character.activeSkillIds];
        const currentAi = this.stateValue.character.combatAiProfile;
        const currentArtifacts = [...this.stateValue.artifacts.activeIds];
        const currentV88Artifacts = [...(this.stateValue.collectionV12316?.activeArtifactIds ?? [])];
        const currentV88Relic = this.stateValue.collectionV12316?.economyV12325?.activeRelicId;
        const currentEquipment = { ...this.stateValue.equipment.equipped };
        this.setCombatLoadout(source.skillIds, source.aiProfile);
        this.stateValue.collectionV12316.activeArtifactIds = [...(source.artifactIds ?? [])].filter(id => this.stateValue.collectionV12316.items?.[id]?.owned).slice(0, artifactSlotCapacityV88(this.stateValue.realm.maxRealmOrder));
        if (source.relicId && this.stateValue.collectionV12316.economyV12325?.extraItems?.[source.relicId]?.owned) this.stateValue.collectionV12316.economyV12325.activeRelicId = source.relicId;
        this.stateValue.artifacts.activeIds = [...(source.legacyArtifactIds ?? [])];
        this.stateValue.equipment.equipped = { ...source.equipmentIds };
        const result = this.saveCombatLoadout(newName);
        if (currentSkills.length && currentAi)
            this.setCombatLoadout(currentSkills, currentAi);
        this.stateValue.artifacts.activeIds = currentArtifacts;
        this.stateValue.collectionV12316.activeArtifactIds = currentV88Artifacts;
        if (this.stateValue.collectionV12316.economyV12325) this.stateValue.collectionV12316.economyV12325.activeRelicId = currentV88Relic;
        this.stateValue.equipment.equipped = currentEquipment;
        return result;
    }
    applySavedCombatLoadout(idOrName) {
        const loadout = (this.stateValue.character.savedCombatLoadouts ?? []).find(candidate => candidate.id === idOrName || candidate.name.toLowerCase() === idOrName.toLowerCase());
        if (!loadout)
            throw new Error(`Không tìm thấy loadout đã lưu: ${idOrName}`);
        this.setCombatLoadout(loadout.skillIds, loadout.aiProfile);
        const missingAssets = [];
        const collection = this.stateValue.collectionV12316;
        const ownedV88Artifacts = new Set(Object.entries(collection?.items ?? {}).filter(([, progress]) => progress?.owned).map(([id]) => id));
        const ownedLegacyArtifacts = new Set(this.stateValue.artifacts.items.map(item => item.id));
        const requestedArtifacts = [...(loadout.artifactIds ?? [])];
        const v88Artifacts = requestedArtifacts.filter(id => ownedV88Artifacts.has(id)).slice(0, artifactSlotCapacityV88(this.stateValue.realm.maxRealmOrder));
        const legacyFallback = [...(loadout.legacyArtifactIds ?? (v88Artifacts.length ? [] : requestedArtifacts))].filter(id => ownedLegacyArtifacts.has(id)).slice(0, this.stateValue.artifacts.activeCapacity);
        for (const id of requestedArtifacts)
            if (!ownedV88Artifacts.has(id) && !ownedLegacyArtifacts.has(id)) missingAssets.push(id);
        collection.activeArtifactIds = v88Artifacts;
        const relicId = loadout.relicId;
        if (relicId) {
            if (collection.economyV12325?.extraItems?.[relicId]?.owned) collection.economyV12325.activeRelicId = relicId;
            else missingAssets.push(relicId);
        } else if (collection.economyV12325) collection.economyV12325.activeRelicId = undefined;
        this.stateValue.artifacts.activeIds = legacyFallback;
        const ownedEquipment = new Set(this.stateValue.equipment.items.map(item => item.id));
        const equipped = {};
        for (const [slot, id] of Object.entries(loadout.equipmentIds)) {
            if (!ownedEquipment.has(id)) {
                missingAssets.push(id);
                continue;
            }
            equipped[slot] = id;
        }
        this.stateValue.equipment.equipped = equipped;
        return { loadout: this.savedCombatLoadouts().find(candidate => candidate.id === loadout.id), missingAssets };
    }
    tacticalLoadoutPresets() {
        return buildTacticalLoadoutPresets(this.stateValue.character.knownSkillIds, this.registry);
    }
    applyTacticalLoadoutPreset(presetId) {
        const preset = this.tacticalLoadoutPresets().find(candidate => candidate.id === presetId);
        if (!preset)
            throw new Error(`Unknown tactical loadout preset: ${presetId}`);
        this.setCombatLoadout(preset.skillIds, preset.aiProfile);
        return preset;
    }
    deactivateArtifact(artifactId) {
        deactivateArtifact(this.stateValue.artifacts, artifactId);
    }
    awakenBloodline(bloodlineId) {
        this.registry.bloodline(bloodlineId);
        return awakenBloodline(this.stateValue.character, bloodlineId);
    }
    rewardLoopSummaryV135() { return rewardLoopSummaryV135(this.stateValue.economy, offlineSpecialOpportunityFactorV127(this.stateValue)); }
    lootPolicy() {
        return cloneInventoryManagementState(this.stateValue.lootManagement).policy;
    }
    setLootPolicy(policy) {
        this.stateValue.lootManagement.policy = cloneInventoryManagementState({
            ...this.stateValue.lootManagement,
            policy,
        }).policy;
    }
    lockLoot(itemId) {
        const exists = this.stateValue.equipment.items.some(item => item.id === itemId)
            || this.stateValue.artifacts.items.some(item => item.id === itemId);
        if (!exists)
            throw new Error(`Unknown loot item: ${itemId}`);
        lockLootItem(this.stateValue.lootManagement, itemId);
    }
    unlockLoot(itemId) {
        unlockLootItem(this.stateValue.lootManagement, itemId);
    }
    explainLoot(itemId) {
        return explainLootItem(this.stateValue, itemId);
    }
    processStoredLoot() {
        const result = processLootBatch(this.stateValue);
        this.appendLootPolicyEvent(result, `loot.manual.${this.actionIndexValue}`);
        this.actionIndexValue += 1;
        return result;
    }
    equipmentSummary() {
        return equipmentPower(this.stateValue.equipment, this.registry.equipmentSets);
    }
    activateArtifact(artifactId) {
        activateArtifact(this.stateValue.artifacts, artifactId);
        const summary = this.artifactSummary();
        for (const resonance of summary.activeResonances) {
            if (!this.stateValue.artifacts.discoveredResonanceIds.includes(resonance.resonanceId)) {
                this.stateValue.artifacts.discoveredResonanceIds.push(resonance.resonanceId);
                this.historyValue.append({
                    id: `artifact.resonance.${this.actionIndexValue}.${resonance.resonanceId}`,
                    worldTimeYears: this.stateValue.worldTimeYears,
                    ageYears: this.stateValue.ageYears,
                    type: 'system', significance: resonance.hidden ? 26 : 14,
                    message: `Pháp bảo phát sinh cộng hưởng: ${resonance.resonanceName}.`,
                    locationId: this.stateValue.locationId,
                    tags: ['Artifact', 'Resonance', resonance.hidden ? 'Hidden' : 'Known'],
                    data: { resonanceId: resonance.resonanceId, pieces: resonance.pieces },
                });
            }
        }
    }
    artifactSummary() {
        return artifactPower(this.stateValue.artifacts, this.registry.artifactTemplates, this.registry.artifactResonances);
    }
    nourishArtifact(artifactId, essenceUnits) {
        const item = this.stateValue.artifacts.items.find(candidate => candidate.id === artifactId);
        if (!item)
            throw new Error(`Unknown artifact instance: ${artifactId}`);
        const units = Math.max(0, Math.floor(essenceUnits));
        const available = this.stateValue.inventory['resource.artifact_dust'] ?? 0;
        if (units <= 0 || available < units)
            throw new Error(`Insufficient Bảo Khí Tàn Tinh: ${available}/${units}`);
        this.stateValue.inventory['resource.artifact_dust'] = available - units;
        const result = nourishArtifact(item, units);
        if (result.afterStage > result.beforeStage) {
            this.historyValue.append({
                id: `artifact.nourish.${this.actionIndexValue}.${artifactId}.${result.afterStage}`,
                worldTimeYears: this.stateValue.worldTimeYears,
                ageYears: this.stateValue.ageYears,
                type: 'system', significance: 14 + result.afterStage * 2,
                message: `${item.name} được dưỡng tới tầng ${result.afterStage}; khí cơ càng thêm cô đọng.`,
                locationId: this.stateValue.locationId,
                tags: ['Artifact', 'Nourishment'],
                data: { artifactId, stage: result.afterStage, essenceUnits: units },
            });
        }
        return result;
    }
    awakenArtifactSpirit(artifactId, spiritName) {
        const item = this.stateValue.artifacts.items.find(candidate => candidate.id === artifactId);
        if (!item)
            throw new Error(`Unknown artifact instance: ${artifactId}`);
        awakenArtifactSpirit(item, this.stateValue.worldTimeYears, spiritName);
        this.historyValue.append({
            id: `artifact.spirit.${this.actionIndexValue}.${artifactId}`,
            worldTimeYears: this.stateValue.worldTimeYears,
            ageYears: this.stateValue.ageYears,
            type: 'system', significance: 34,
            message: `Khí Linh của ${item.name} chính thức thức tỉnh${item.spirit.name ? `: ${item.spirit.name}` : ''}.`,
            locationId: this.stateValue.locationId,
            tags: ['Artifact', 'ArtifactSpirit', 'Awakening'],
            data: { artifactId },
        });
    }
    recoverableArtifactRelics() {
        return (this.metaValue.artifactRelics ?? [])
            .filter(relic => !relic.currentHolderLifeId && relic.lostWorldYear <= this.stateValue.worldTimeYears && relic.lostLocationId === this.stateValue.locationId)
            .map(relic => ({ ...relic, artifact: cloneArtifactInstance(relic.artifact), recoveredByLifeIds: [...relic.recoveredByLifeIds] }));
    }
    recoverArtifactRelic(artifactId) {
        const relic = (this.metaValue.artifactRelics ?? []).find(candidate => candidate.artifact.id === artifactId);
        if (!relic)
            throw new Error(`Unknown artifact relic: ${artifactId}`);
        if (relic.currentHolderLifeId)
            throw new Error(`Artifact relic is already held by ${relic.currentHolderLifeId}`);
        if (relic.lostWorldYear > this.stateValue.worldTimeYears || relic.lostLocationId !== this.stateValue.locationId) {
            throw new Error(`Artifact relic is not recoverable at ${this.stateValue.locationId}`);
        }
        const recovered = cloneArtifactInstance(relic.artifact);
        markArtifactRecovered(recovered, this.stateValue.worldTimeYears, this.currentLifeValue.lifeId);
        if (!recovered.history.ownerLifeIds.includes(this.currentLifeValue.lifeId))
            recovered.history.ownerLifeIds.push(this.currentLifeValue.lifeId);
        recovered.source = { ...recovered.source, kind: 'legacy', sourceLifeId: relic.sourceLifeId };
        this.stateValue.artifacts.items.push(recovered);
        relic.artifact = cloneArtifactInstance(recovered);
        relic.currentHolderLifeId = this.currentLifeValue.lifeId;
        if (!relic.recoveredByLifeIds.includes(this.currentLifeValue.lifeId))
            relic.recoveredByLifeIds.push(this.currentLifeValue.lifeId);
        this.historyValue.append({
            id: `artifact.recovered.${this.currentLifeValue.lifeId}.${artifactId}`,
            worldTimeYears: this.stateValue.worldTimeYears,
            ageYears: this.stateValue.ageYears,
            type: 'system', significance: 42,
            message: `Ngươi tìm lại pháp bảo tiền kiếp: ${recovered.name}.`,
            locationId: this.stateValue.locationId,
            tags: ['Artifact', 'PastLifeLegacy', 'Recovered', 'Reincarnation'],
            data: { artifactId, sourceLifeId: relic.sourceLifeId },
        });
    }
    craftProfession(recipeId, quantity = 1, selections = []) {
        if (!this.stateValue.alive)
            throw new Error('Current life has ended');
        const recipe = this.registry.professionRecipe(recipeId);
        if (recipe.professionId === 'alchemy')
            throw new Error('Luyện Đan Profession V1 đã nghỉ production; hãy dùng Đan Phòng / Alchemy V85 canonical.');
        const remainingLife = this.remainingLifeYears();
        const maxAttemptsByLife = Math.floor((remainingLife + 1e-9) / recipe.timeYears);
        if (maxAttemptsByLife <= 0)
            throw new Error('Not enough lifespan remains to craft this recipe');
        const attempts = Math.min(Math.max(1, Math.floor(quantity)), maxAttemptsByLife);
        const seed = mixSeed(this.rootSeed ^ 0x2f6e2b1d, this.actionIndexValue);
        const talentModifiers = professionTalentModifiers(this.stateValue.inheritedOrigins, recipe.professionId);
        const result = this.professionEngine.craft(this.stateValue, this.registry, recipe, attempts, seed, selections, talentModifiers);
        if (result.attempts <= 0)
            throw new Error(`Could not craft ${recipe.name}`);
        this.stateValue.worldTimeYears += result.elapsedYears;
        this.stateValue.ageYears += result.elapsedYears;
        const worldEvents = this.syncWorldState(this.stateValue, seed ^ 0x31415926);
        this.historyValue.appendMany(worldEvents);
        recordArtifactOwnershipYears(this.stateValue.artifacts, result.elapsedYears);
        this.ensureArtifactOwnerLife(this.stateValue.artifacts);
        const beforeParallelEquipment = new Set(this.stateValue.equipment.items.map(item => item.id));
        const beforeParallelArtifacts = new Set(this.stateValue.artifacts.items.map(item => item.id));
        const parallel = this.dungeonEngine.resolveParallel(this.stateValue, this.world.dungeons, result.elapsedYears, (seed ^ 0x27182818) >>> 0, this.registry, parallelDungeonEfficiencyMultiplier(this.stateValue.inheritedOrigins));
        this.historyValue.appendMany(parallel.events);
        this.consumeDaoNatureCultivationInventoryV125();
        const parallelLoot = this.processNewLoot(this.stateValue, beforeParallelEquipment, beforeParallelArtifacts);
        this.appendLootPolicyEvent(parallelLoot, `loot.crafting.${seed}`);
        const qualityRank = { low: 0, mid: 1, high: 2, supreme: 3, perfect: 4 };
        const bestQuality = result.results
            .filter(entry => entry.success && entry.quality)
            .map(entry => entry.quality)
            .sort((a, b) => qualityRank[b] - qualityRank[a])[0];
        const craftedNames = result.results.filter(entry => entry.success).map(entry => {
            if (entry.equipment)
                return entry.equipment.name;
            if (entry.outputProductId)
                return this.registry.craftedProduct(entry.outputProductId).name;
            return recipe.name;
        });
        const significance = bestQuality === 'perfect' ? 38 : bestQuality === 'supreme' ? 26 : result.successes > 0 ? 10 : 6;
        const message = result.successes > 0
            ? `${recipe.name}: thành ${result.successes}/${result.attempts}; ${bestQuality ? `phẩm chất cao nhất ${productQualityNames[bestQuality]}` : 'luyện chế hoàn tất'}.`
            : `${recipe.name}: ${result.attempts} lần luyện chế đều thất bại.`;
        const event = {
            id: `craft.${seed}.${recipe.id}`,
            worldTimeYears: this.stateValue.worldTimeYears,
            ageYears: this.stateValue.ageYears,
            type: 'crafting',
            significance,
            message,
            locationId: this.stateValue.locationId,
            actorId: this.profile.combatEntity.id,
            tags: ['Profession', recipe.professionId, 'Crafting', ...recipe.tags, ...(talentModifiers.successChanceFlat > 0 ? ['ReincarnationTalent'] : []), ...(bestQuality ? [`Quality:${bestQuality}`] : [])],
            data: {
                recipeId: recipe.id,
                attempts: result.attempts,
                successes: result.successes,
                failures: result.failures,
                masteryBefore: result.masteryBefore,
                masteryAfter: result.masteryAfter,
                bestQuality: bestQuality ?? '',
                crafted: craftedNames.join(' | '),
                variants: [...new Set(result.results.flatMap(entry => entry.variantTags))].join(' | '),
                talentSuccessChanceFlat: talentModifiers.successChanceFlat,
                talentQualityScoreBonus: talentModifiers.qualityScoreBonus,
                talentMasteryGainMultiplier: talentModifiers.masteryGainMultiplier,
            },
        };
        this.historyValue.append(event);
        const economyAwards = recordEconomyActivityV89(ensureCollectionProgressStateV12316(this.stateValue), 'craftActions', 1).awards;
        this.applyNaturalDeathToState(seed ^ 0x55aa55aa);
        this.actionIndexValue += 1;
        return { seed, result, event, state: this.state, economyAwards };
    }
    useCraftedProduct(productId, quality) {
        if (!this.stateValue.alive)
            throw new Error('Current life has ended');
        const product = this.registry.craftedProduct(productId);
        const used = useCraftedProduct(this.stateValue, product, quality);
        const event = {
            id: `crafted.use.${this.actionIndexValue}.${this.currentLifeValue.lifeId}.${productId}.${quality}`,
            worldTimeYears: this.stateValue.worldTimeYears,
            ageYears: this.stateValue.ageYears,
            type: 'resource',
            significance: quality === 'perfect' ? 14 : 6,
            message: `Dùng ${productQualityNames[quality]} ${product.name}. ${used.summary}`,
            actorId: this.profile.combatEntity.id,
            locationId: this.stateValue.locationId,
            tags: ['Profession', product.professionId, 'CraftedProduct', 'Consumed', ...product.tags],
            data: { productId, quality, value: used.value, remaining: craftedStock(this.stateValue.professions, productId, quality) },
        };
        this.historyValue.append(event);
        this.actionIndexValue += 1;
        return { productId, quality, summary: used.summary, value: used.value, event, state: this.state };
    }
    clearDungeon(workerId) {
        clearDungeonWorker(this.stateValue.dungeons, workerId);
    }
    execute(request) {
        if (!this.stateValue.alive) throw new Error('Current life has ended');
        if (request.type === 'retreat') return this.instantRetreatV140(request.realHours ?? request.retreatRealHours ?? 3);
        if (request.type === 'dungeon') {
            const floor = request.floor ?? 1;
            if (!isDungeonFloorCleared(this.stateValue.dungeons, request.dungeonId, floor)) throw new Error(`Dungeon floor must be first-cleared before farming: ${request.dungeonId} floor ${floor}`);
        }
        const seed = mixSeed(this.rootSeed, this.actionIndexValue);
        const remainingLife = this.remainingLifeYears();
        if (remainingLife <= 0) throw new Error('No lifespan remains');
        const effectiveRequest = { ...request, durationYears: Math.min(Math.max(0, Number(request.durationYears) || 0), remainingLife) };
        const ownedArtifactIds = new Set(this.stateValue.artifacts.items.map(item => item.id));
        const previousEquipmentIds = new Set(this.stateValue.equipment.items.map(item => item.id));
        const previousArtifactIds = new Set(this.stateValue.artifacts.items.map(item => item.id));
        const engine = new ActivityEngine(this.registry, this.world, this.entityDefinitions, seed);
        const report = engine.run(this.stateValue, this.profile, effectiveRequest);
        this.appendWorldSimulationToReport(report, seed ^ 0x243f6a88);
        this.resolveParallelDungeons(report, seed ^ 0xd06e0a11);
        const lootBatch = this.processNewLoot(report.state, previousEquipmentIds, previousArtifactIds);
        if (lootBatch.processed > 0) {
            report.summaryLines.push(...lootBatch.summaryLines);
            const lootEvent = this.makeLootPolicyEvent(report.state, lootBatch, `loot.activity.${seed}`);
            if (lootEvent) report.events.push(lootEvent);
        }
        this.applyNaturalDeathIfNeeded(report, seed);
        recordArtifactOwnershipYears(report.state.artifacts, report.elapsedYears, ownedArtifactIds);
        this.ensureArtifactOwnerLife(report.state.artifacts);
        this.stateValue = report.state;
        this.stateValue.cultivation = cleanCultivationStateV140(this.stateValue.cultivation);
        this.historyValue.appendMany(report.events);
        this.actionIndexValue += 1;
        return report;
    }

    bestCanonicalAlchemyPillV85(family) {
        const qualityRank = { low: 0, mid: 1, high: 2, supreme: 3 };
        const currentTier = this.currentAlchemyTier();
        return Object.entries(this.stateValue.inventory).flatMap(([resourceId, quantity]) => { const d = parseAlchemyPillResourceId(resourceId); const count = Math.max(0, Math.floor(Number(quantity) || 0)); return d && d.family === family && count > 0 ? [{ resourceId, d, count, eff: alchemyPillRealmEfficiency(currentTier, d.realmTier) }] : []; }).filter(x => x.eff > 0).sort((a, b) => b.eff - a.eff || qualityRank[b.d.quality] - qualityRank[a.d.quality] || b.d.realmTier - a.d.realmTier)[0]?.resourceId;
    }
    useCultivationPill() {
        if (!this.stateValue.alive) throw new Error('Đời hiện tại đã kết thúc.');
        const canonical = this.bestCanonicalAlchemyPillV85('cultivation');
        if (!canonical) throw new Error('Không có Tu Vi Đan.');
        const used = this.useAlchemyPillV112(canonical);
        return { gain: Number(used.effect?.gain ?? 0), remaining: Number(used.remaining ?? 0), state: this.state };
    }


    attemptHeavenlyTribulation(intensity = 1) {
        if (!this.stateValue.alive) throw new Error('Current life has ended');
        const order = this.stateValue.realm.maxRealmOrder;
        if (!isTribulationGateV140(order)) throw new Error('Thiên Kiếp chỉ dùng tại năm cửa Độ Kiếp.');
        const blockers = tribulationMilestoneBlockersV113(this.stateValue, this.stateValue.dungeons);
        if (blockers.length > 0) throw new Error(`Chưa thể dẫn Thiên Kiếp. ${blockers.join(' · ')}`);
        const current = this.registry.realm(this.stateValue.realm.realmId);
        if (!current.nextRealmId) throw new Error('Không còn cảnh giới sau để độ kiếp.');
        const row = cultivationRealmV140(order);
        const required = effectiveCultivationRequiredTuViV140(this.stateValue, order);
        if ((Number(this.stateValue.cultivation.tuVi) || 0) + 1e-9 < required) throw new Error(`Tu Vi chưa đủ dẫn kiếp: cần ${required.toLocaleString('vi-VN')}.`);
        const seed = mixSeed(this.rootSeed ^ 0x5a17c9e3, this.actionIndexValue);
        const integration = this.integrationSummary();
        const tribulationSuccessPct = 0; // R3: Thiên Kiếp success is not a Tu Luyện tree node.
        const result = this.tribulationEngine.attempt({ realm: this.stateValue.realm, injury: this.stateValue.injury, soul: this.stateValue.soul, dao: this.stateValue.dao, integration, intensity, seed, worldYear: this.stateValue.worldTimeYears, nextRealmId: current.nextRealmId, successBonusPct: tribulationSuccessPct });
        const injuryGuardPct = 0; // R3: Thương Thế mitigation belongs outside this tree.
        result.injury = Math.max(0, result.injury * (1 - injuryGuardPct / 100));
        const cost = Math.min(this.stateValue.cultivation.tuVi, required * (result.tuViCostPct / 100));
        this.stateValue.cultivation.tuVi = Math.max(0, this.stateValue.cultivation.tuVi - cost);
        this.stateValue.injury = Math.min(100, this.stateValue.injury + result.injury);
        if (result.passed) { const rt=ensureCultivationRuntimeR3(this.stateValue.cultivation); rt.tribulationTemperStacks=Math.min(5,(rt.tribulationTemperStacks||0)+1); this.applyRealmTransitionV140(current.nextRealmId, 'heavenly-tribulation'); }
        this.stateValue.tribulation = this.stateValue.tribulation ?? createTribulationState();
        this.stateValue.tribulation.faced += 1;
        if (result.passed) this.stateValue.tribulation.passed += 1; else this.stateValue.tribulation.failed += 1;
        if (result.passed) {
            this.stateValue.inventory['resource.tribulation_essence'] = (this.stateValue.inventory['resource.tribulation_essence'] ?? 0) + result.rewardEssence;
            this.stateValue.tribulation.lightningRefined += result.rewardMarks;
        }
        const event = { id:`tribulation.v140.${this.actionIndexValue}`, worldTimeYears:this.stateValue.worldTimeYears, ageYears:this.stateValue.ageYears, type:'combat', significance: result.passed ? 90 : 55, message: result.passed ? `Thiên Kiếp ${result.kind} đã vượt qua.` : `Thiên Kiếp ${result.kind} thất bại; Thương Thế tăng.`, locationId:this.stateValue.locationId, tags:['Tribulation','CultivationV140',result.passed?'Victory':'Defeat'], data:{...result,tuViCost:cost} };
        this.historyValue.append(event);
        this.actionIndexValue += 1;
        return { ...result, tuViCost: cost, event, state: this.state };
    }

    daoSuySummaryV127() {
        return daoSuyStatusV127(this.stateValue.immortal, this.stateValue.realm.maxRealmOrder, this.stateValue.inheritedOrigins);
    }
    attemptDaoSuyTribulationV127() {
        if (!this.stateValue.alive)
            throw new Error('Current life has ended');
        const statusBefore = daoSuyStatusV127(this.stateValue.immortal, this.stateValue.realm.maxRealmOrder, this.stateValue.inheritedOrigins);
        if (!statusBefore.active)
            throw new Error('Suy Kiếp chỉ xuất hiện từ Nhân Tiên trở lên.');
        if (statusBefore.tribulationRescueExhausted)
            throw new Error(`Đại cảnh hiện tại đã dùng hết ${statusBefore.tribulationMaxSuccessesPerMajor} lần Suy Kiếp cứu mệnh; không thể trì hoãn Đạo Suy vô hạn.`);
        if (!statusBefore.canChallengeSuyKiep)
            throw new Error('Đạo Suy chưa đủ 80 để chủ động dẫn Suy Kiếp.');
        const order = this.stateValue.realm.maxRealmOrder;
        const candidates = [];
        for (const dungeon of Object.values(this.world.dungeons ?? {})) {
            for (const floor of dungeon.floors ?? []) {
                if ((floor.requiredRealmOrder ?? 0) <= order && this.entityDefinitions[floor.guardianEntityId])
                    candidates.push({ dungeon, floor });
            }
        }
        candidates.sort((a, b) => (b.floor.requiredRealmOrder ?? 0) - (a.floor.requiredRealmOrder ?? 0) || (b.floor.floor ?? 0) - (a.floor.floor ?? 0));
        const chosen = candidates[0];
        if (!chosen)
            throw new Error('Không tìm thấy guardian canonical để dựng Suy Kiếp.');
        const seed = mixSeed(this.rootSeed ^ 0x5d7a127, this.actionIndexValue);
        const player = { ...this.personalCombatEntityForState(this.stateValue), id: `${this.profile.combatEntity.id}.dao_suy` };
        const baseGuardian = buildDungeonGuardian(this.entityDefinitions[chosen.floor.guardianEntityId], chosen.dungeon, chosen.floor.floor);
        const pressure = 1.12 + statusBefore.value / 500 + Math.min(0.72, statusBefore.tribulationsPassed * 0.08);
        const guardian = {
            ...baseGuardian,
            id: `${baseGuardian.id}.dao_suy.${statusBefore.tribulationsPassed + statusBefore.tribulationsFailed + 1}`,
            name: `Suy Kiếp · ${baseGuardian.name}`,
            tags: [...new Set([...(baseGuardian.tags ?? []), 'DaoSuy', 'Tribulation'])],
            stats: {
                ...baseGuardian.stats,
                maxHp: Math.max(1, baseGuardian.stats.maxHp * pressure),
                attack: Math.max(1, baseGuardian.stats.attack * pressure),
                defense: Math.max(1, baseGuardian.stats.defense * pressure),
                controlPower: Math.max(0, (baseGuardian.stats.controlPower ?? 0) * Math.sqrt(pressure)),
                resolve: Math.max(0, (baseGuardian.stats.resolve ?? 0) * Math.sqrt(pressure)),
            },
        };
        const kernel = runCombatKernelV2({ registry: this.registry, seed, entities: [applyCombatPacingV124(player), applyCombatPacingV124(guardian)], mode: 'headless', maxDuration: 120 });
        const won = kernel.battle.winnerId === player.id;
        const resolution = resolveDaoSuyTribulationV127(this.stateValue.immortal, won, this.stateValue.inheritedOrigins, order);
        const elapsedYears = 0.03;
        this.stateValue.worldTimeYears += elapsedYears;
        this.stateValue.ageYears += elapsedYears;
        advanceDaoSuyByWorldYearsV127(this.stateValue.immortal, order, elapsedYears, this.stateValue.inheritedOrigins);
        if (!won)
            this.stateValue.injury = Math.min(100, this.stateValue.injury + 18);
        const statusAfter = daoSuyStatusV127(this.stateValue.immortal, order, this.stateValue.inheritedOrigins);
        const event = {
            id: `dao-suy.tribulation.${this.currentLifeValue.lifeId}.${this.actionIndexValue}`,
            worldTimeYears: this.stateValue.worldTimeYears,
            ageYears: this.stateValue.ageYears,
            type: 'combat',
            significance: won ? 72 : 58,
            message: won
                ? `Vượt Suy Kiếp, Đạo Suy ${resolution.before.toFixed(1)} → ${statusAfter.value.toFixed(1)}.`
                : `Suy Kiếp thất bại, Đạo Suy ${resolution.before.toFixed(1)} → ${statusAfter.value.toFixed(1)}; Thương Thế tăng.`,
            tags: ['DaoSuy', 'SuyKiep', 'CombatKernelV2', won ? 'Victory' : 'Defeat'],
            data: { won, daoSuyBefore: resolution.before, daoSuyAfter: statusAfter.value, guardianId: guardian.id, pressure, battleSeed: seed },
        };
        this.historyValue.append(event);
        this.actionIndexValue += 1;
        return { schema: 'dao-suy-tribulation.v127', won, pressure, resolution, status: statusAfter, battle: kernel.battle, event, state: this.state };
    }

    refineImmortalEssence(batches = 1) {
        if (!this.stateValue.immortal.awakened)
            throw new Error('Cần Nhân Tiên mới luyện hóa Tiên Nguyên.');
        const used = Math.max(1, Math.floor(batches));
        const need = used * 2;
        const have = this.stateValue.inventory['resource.immortal_qi'] ?? 0;
        if (have < need)
            throw new Error(`Cần ${need} Tiên Khí Tinh Túy.`);
        this.stateValue.inventory['resource.immortal_qi'] = have - need;
        const r = refineImmortalEssenceState(this.stateValue.immortal, used);
        const event = { id: `immortal.refine.${this.currentLifeValue.lifeId}.${this.actionIndexValue}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'cultivation', significance: 18 + Math.min(20, used * 2), message: `Luyện hóa ${need} Tiên Khí Tinh Túy; Tiên Nguyên ${r.essence.toFixed(0)}, độ thuần ${r.purity.toFixed(1)}.`, tags: ['Immortal', 'ImmortalEssence'], data: { batches: used, essence: r.essence, purity: r.purity, body: r.body, law: r.law } };
        this.historyValue.append(event);
        this.actionIndexValue += 1;
        return { summary: event.message, state: this.state };
    }
    refineEarthImmortal(batches = 1) {
        if (this.stateValue.realm.maxRealmOrder < 50)
            throw new Error('Cần Địa Tiên mới có thể luyện Địa Mạch Neo.');
        const used = Math.max(1, Math.floor(batches));
        const need = used * 2;
        const have = this.stateValue.inventory['resource.earth_immortal_essence'] ?? 0;
        if (have < need)
            throw new Error(`Cần ${need} Địa Tiên Mạch Tinh.`);
        this.stateValue.inventory['resource.earth_immortal_essence'] = have - need;
        const r = refineEarthImmortalState(this.stateValue.immortal, used);
        const msg = `Luyện Địa Mạch ${used} lần; neo ${r.anchor.toFixed(1)}, hòa hợp ${r.harmony.toFixed(1)}.`;
        this.historyValue.append({ id: `immortal.earth.${this.actionIndexValue}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'cultivation', significance: 24, message: msg, tags: ['Immortal', 'EarthImmortal'], data: { anchor: r.anchor, harmony: r.harmony } });
        this.actionIndexValue += 1;
        return { summary: msg, state: this.state };
    }
    refineHeavenImmortal(batches = 1) {
        if (this.stateValue.realm.maxRealmOrder < 54)
            throw new Error('Cần Thiên Tiên mới có thể luyện Thiên Luật Cộng Hưởng.');
        const used = Math.max(1, Math.floor(batches));
        const need = used * 2;
        const have = this.stateValue.inventory['resource.heaven_immortal_essence'] ?? 0;
        if (have < need)
            throw new Error(`Cần ${need} Thiên Luật Thanh Khí.`);
        this.stateValue.inventory['resource.heaven_immortal_essence'] = have - need;
        const r = refineHeavenImmortalState(this.stateValue.immortal, used);
        const msg = `Luyện Thiên Chu ${used} lần; cộng hưởng ${r.resonance.toFixed(1)}, chu thiên ${r.circulation.toFixed(1)}.`;
        this.historyValue.append({ id: `immortal.heaven.${this.actionIndexValue}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'cultivation', significance: 28, message: msg, tags: ['Immortal', 'HeavenImmortal'], data: { resonance: r.resonance, circulation: r.circulation } });
        this.actionIndexValue += 1;
        return { summary: msg, state: this.state };
    }
    refineTrueImmortal(batches = 1) {
        if (this.stateValue.realm.maxRealmOrder < 58)
            throw new Error('Cần Chân Tiên mới có thể luyện Chân Pháp Thân.');
        const used = Math.max(1, Math.floor(batches));
        const need = used * 2;
        const have = this.stateValue.inventory['resource.true_law_essence'] ?? 0;
        if (have < need)
            throw new Error(`Cần ${need} Chân Luật Tinh Tủy.`);
        this.stateValue.inventory['resource.true_law_essence'] = have - need;
        const r = refineTrueImmortalState(this.stateValue.immortal, used);
        const msg = `Luyện Chân Luật ${used} lần; Pháp Thân ${r.body.toFixed(1)}, Luật Quyền ${r.authority.toFixed(1)}.`;
        this.historyValue.append({ id: `immortal.true.${this.actionIndexValue}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'cultivation', significance: 32, message: msg, tags: ['Immortal', 'TrueImmortal'], data: { body: r.body, authority: r.authority } });
        this.actionIndexValue += 1;
        return { summary: msg, state: this.state };
    }
    refineApexImmortal(kind, batches = 1) {
        const cfg = {
            mystic: { min: 62, resource: 'resource.mystic_law_silk', name: 'Huyền Luật Tiên Ty', tag: 'MysticImmortal' },
            golden: { min: 66, resource: 'resource.golden_immortal_marrow', name: 'Bất Hoại Kim Tủy', tag: 'GoldenImmortal' },
            taiyi: { min: 70, resource: 'resource.taiyi_epoch_sand', name: 'Thái Ất Kỷ Sa', tag: 'TaiyiImmortal' },
            grand_luo: { min: 74, resource: 'resource.grand_luo_origin', name: 'Đại La Đạo Quả Nguyên', tag: 'GrandLuo' },
            king: { min: 78, resource: 'resource.king_domain_core', name: 'Vương Vực Hạch', tag: 'ImmortalKing' },
            emperor: { min: 82, resource: 'resource.emperor_mandate_fragment', name: 'Đế Mệnh Tàn Chương', tag: 'ImmortalEmperor' },
            extremity: { min: 86, resource: 'resource.extremity_shard', name: 'Phá Cực Tinh Phiến', tag: 'Extremity' },
            supreme_dao: { min: 90, resource: 'resource.supreme_dao_origin', name: 'Cực Đạo Nguyên Chất', tag: 'SupremeDao' },
            chaos: { min: 94, resource: 'resource.chaos_origin', name: 'Hỗn Độn Nguyên Chất', tag: 'Chaos' },
            hongmeng: { min: 98, resource: 'resource.hongmeng_purple_qi', name: 'Hồng Mông Tử Khí', tag: 'Hongmeng' },
            heaven_opening: { min: 102, resource: 'resource.heaven_opening_origin', name: 'Khai Thiên Bản Nguyên', tag: 'HeavenOpening' },
            world_lord: { min: 106, resource: 'resource.world_core_essence', name: 'Giới Tâm Tinh Tủy', tag: 'WorldLord' },
            eternity: { min: 110, resource: 'resource.eternity_mark', name: 'Vĩnh Sinh Ấn', tag: 'Eternal' },
            creation: { min: 114, resource: 'resource.genesis_core', name: 'Sáng Thế Nguyên Hạch', tag: 'CreationLord' },
        };
        const c = cfg[kind];
        if (this.stateValue.realm.maxRealmOrder < c.min)
            throw new Error(`Cần cảnh giới bậc ${c.min}+ mới luyện hệ ${kind}.`);
        const used = Math.max(1, Math.floor(batches));
        const need = used * 2;
        const have = this.stateValue.inventory[c.resource] ?? 0;
        if (have < need)
            throw new Error(`Cần ${need} ${c.name}.`);
        this.stateValue.inventory[c.resource] = have - need;
        const r = refineApexImmortalState(this.stateValue.immortal, kind, used);
        const fieldLabels = kind === 'king' ? { domain: 'Vương Vực Quyền', orthodoxy: 'Vương Đạo Trọng' } : {};
        const pairs = Object.entries(r).filter(([k]) => k !== 'used').map(([k, v]) => `${fieldLabels[k] ?? k} ${Number(v).toFixed(1)}`).join(' · ');
        const msg = `Luyện ${c.name} ${used} lần · ${pairs}.`;
        this.historyValue.append({ id: `immortal.apex.${kind}.${this.actionIndexValue}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'cultivation', significance: 34 + Math.min(24, Math.floor((c.min - 62) / 4) * 3), message: msg, tags: ['Immortal', c.tag, 'ApexRefinement'], data: { kind, ...r } });
        this.actionIndexValue += 1;
        return { summary: msg, state: this.state };
    }
    setActiveManifestations(ids) {
        if (this.stateValue.realm.maxRealmOrder < 62)
            throw new Error('Active Manifestation mở từ Huyền Tiên.');
        const available = new Set(['law']);
        if (this.stateValue.dao.mainDaoId)
            available.add('dao');
        if (this.stateValue.dao.domain.active)
            available.add('domain');
        if (this.stateValue.soul.awakened)
            available.add('soul');
        if (this.stateValue.artifacts.activeIds.length)
            available.add('artifact');
        if (this.stateValue.character.bloodlines.length)
            available.add('bloodline');
        if (this.stateValue.character.physiqueIds.length)
            available.add('physique');
        if (this.stateValue.character.activeTechniqueId)
            available.add('technique');
        if (playerFactionMembership(this.stateValue.factions, this.currentLifeValue.lifeId))
            available.add('faction');
        if (Object.keys(this.stateValue.inheritedOrigins).length)
            available.add('origin');
        const bad = ids.filter(id => !available.has(id));
        if (bad.length)
            throw new Error(`Chưa sở hữu/không thể biểu hiện: ${bad.join(', ')}.`);
        const cap = this.stateValue.immortal.manifestationCapacity;
        setActiveManifestationsState(this.stateValue.immortal, ids, cap);
        this.actionIndexValue += 1;
        return { summary: `Active Manifestation ${ids.length}/${cap}: ${ids.join(' · ') || 'không'}.`, state: this.state };
    }
    breakExtremity() {
        if (this.stateValue.realm.realmId !== 'realm.extremity.boundary')
            throw new Error('Chỉ tại Cực Hạn · Biên Giới mới có thể Phá Cực lặp vô hạn.');
        const cost = 12 + this.stateValue.immortal.extremityLayers * 2;
        const have = this.stateValue.inventory['resource.extremity_shard'] ?? 0;
        if (have < cost)
            throw new Error(`Phá Cực tầng kế cần ${cost} Phá Cực Tinh Phiến.`);
        this.stateValue.inventory['resource.extremity_shard'] = have - cost;
        const r = breakExtremityLayerState(this.stateValue.immortal);
        const msg = `Phá Cực thành công · lớp ${r.layer}. Biên giới cũ vỡ; Cực Hạn Quyền ${r.authority}, áp lực mới ${r.pressure}/100.`;
        this.historyValue.append({ id: `extremity.break.${this.currentLifeValue.lifeId}.${this.actionIndexValue}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'breakthrough', significance: 100 + Math.min(100, r.layer * 3), message: msg, tags: ['Extremity', 'BreakLimit', `Layer${r.layer}`], data: { layer: r.layer, authority: r.authority, cost } });
        this.actionIndexValue += 1;
        return { summary: msg, state: this.state };
    }
    createGenesisEpoch() {
        if (this.stateValue.realm.realmId !== 'realm.creation_lord.perfect')
            throw new Error('Chỉ Sáng Thế Chủ viên mãn mới có thể khai một Kỷ Nguyên Sáng Thế mới.');
        const cleared = highestClearedDungeonFloor(this.stateValue.dungeons, 'dungeon.genesis_source');
        if (cleared < 5)
            throw new Error(`Khai Kỷ Nguyên cần first-clear Sáng Thế Nguyên Hải tầng 5 (${cleared}/5).`);
        const cost = 20 + this.stateValue.immortal.creationEpochs * 5;
        const have = this.stateValue.inventory['resource.genesis_core'] ?? 0;
        const dawn = this.stateValue.inventory['resource.first_dawn_fragment'] ?? 0;
        if (have < cost)
            throw new Error(`Khai Kỷ Nguyên kế cần ${cost} Sáng Thế Nguyên Hạch.`);
        if (dawn < 1)
            throw new Error('Khai Kỷ Nguyên cần 1 Sơ Quang Tàn Phiến từ Sáng Thế Nguyên Hải.');
        this.stateValue.inventory['resource.genesis_core'] = have - cost;
        this.stateValue.inventory['resource.first_dawn_fragment'] = dawn - 1;
        const r = createGenesisEpochState(this.stateValue.immortal);
        const msg = `Kỷ Nguyên Sáng Thế thứ ${r.epoch} thành hình. Kỷ Nguyên Quyền ${r.authority}; nguồn sáng thế trở về ${r.source}/100 để bắt đầu chu kỳ sáng tạo mới.`;
        this.historyValue.append({ id: `genesis.epoch.${this.currentLifeValue.lifeId}.${r.epoch}`, worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears, type: 'breakthrough', significance: 180 + Math.min(220, r.epoch * 5), message: msg, tags: ['CreationLord', 'GenesisEpoch', `Epoch${r.epoch}`], data: { epoch: r.epoch, authority: r.authority, cost } });
        this.actionIndexValue += 1;
        return { summary: msg, state: this.state };
    }
    /** Luân Hồi V4: combat defeat is recoverable and can never end a life or reduce lifespan. */
    applyCombatDeathPenalty(context = 'combat') {
        const lifespanBefore=Math.max(0,Number(this.stateValue.lifespanYears)||0), injuryBefore=Math.max(0,Number(this.stateValue.injury)||0);
        this.stateValue.injury=Math.min(100,injuryBefore+15);
        const result={applied:true,lifeEnded:false,lostYears:0,lifespanBefore,lifespanAfter:lifespanBefore,injuryBefore,injuryAfter:this.stateValue.injury};
        const event={id:`combat.death.penalty.${this.currentLifeValue.lifeId}.${this.actionIndexValue}`,worldTimeYears:this.stateValue.worldTimeYears,ageYears:this.stateValue.ageYears,type:'injury',significance:28,message:`Chiến bại: Thương Thế ${injuryBefore.toFixed(0)} → ${this.stateValue.injury.toFixed(0)}. Thọ nguyên không giảm và đời hiện tại không kết thúc.`,actorId:this.profile.combatEntity.id,locationId:this.stateValue.locationId,tags:['CombatDeath','Injury','Revival'],data:{context,...result}};
        this.historyValue.append(event); this.actionIndexValue+=1; return result;
    }
    offlineLootCache() {
        const cache = offlineLootCacheState(this.stateValue);
        return { capacity: cache.capacity, count: cache.equipmentIds.length + cache.artifactIds.length, equipmentIds: [...cache.equipmentIds], artifactIds: [...cache.artifactIds], overflowSalvaged: cache.overflowSalvaged, protectedOverflow: cache.protectedOverflow };
    }
    claimOfflineLoot() {
        const claimed = claimOfflineLootCache(this.stateValue);
        this.actionIndexValue += 1;
        return { ...claimed, state: this.state };
    }
    /**
     * Canonical wall-clock offline resolver for the idle game loop.
     * Checkpoints flush a dynamic hunt batch; they do NOT stop Auto. Natural lifespan exhaustion
     * is the only hard-stop currently locked for ordinary offline simulation.
     */
    resolveRealtimeOffline(plan, lastSeenUnixMs, nowUnixMs) {
        if (!this.stateValue.alive) throw new Error('Current life has ended');
        const elapsedSeconds = Math.max(0, (Number(nowUnixMs) - Number(lastSeenUnixMs)) / 1000);
        const capHours = OFFLINE_CAP_REAL_HOURS; // R3: offline cap returns to the owner system; Luân Hồi does not own it.
        const rewardSeconds = Math.min(elapsedSeconds, capHours * 3600, realSecondsUntilNaturalDeath(this.stateValue));
        const beforeTuVi = this.stateValue.cultivation.tuVi;
        const fateOfflineBonusPct=Math.max(0,Number(this.stateValue.character?.fateModifiersV4?.offlineSelfCultivationPct)||0)+Math.max(0,Number(this.stateValue.character?.fateModifiersV4?.offlineRewardPct)||0);
        if (rewardSeconds > 0) this.advanceRealtimeCultivationV140(rewardSeconds,fateOfflineBonusPct);
        const rewardCultivationGain = Math.max(0, this.stateValue.cultivation.tuVi - beforeTuVi);
        const clockRemainder = Math.max(0, elapsedSeconds - rewardSeconds);
        if (clockRemainder > 0 && this.stateValue.alive) {
            const lifeSeconds = Math.min(clockRemainder, realSecondsUntilNaturalDeath(this.stateValue));
            const years = lifeSeconds * WORLD_YEARS_PER_REAL_SECOND;
            this.stateValue.worldTimeYears += years;
            this.stateValue.ageYears += years;
            advanceDaoSuyByWorldYearsV127(this.stateValue.immortal, this.stateValue.realm.maxRealmOrder, years, this.stateValue.inheritedOrigins);
            this.applyNaturalDeathToState(mixSeed(this.rootSeed, this.actionIndexValue));
        }
        const summaryLines = [`Offline ${(elapsedSeconds/3600).toFixed(2)} giờ · Tự Tu +${rewardCultivationGain.toLocaleString('vi-VN')} Tu Vi.`, `Cảnh hiện tại: ${this.cultivationSummaryV140(nowUnixMs).realm} · ${this.cultivationSummaryV140(nowUnixMs).progressPct.toFixed(1)}%.`];
        this.actionIndexValue += 1;
        return { schema:'offline-return.v140', elapsedRealHours:elapsedSeconds/3600, processedRealHours:rewardSeconds/3600, capRealHours:capHours, fateOfflineBonusPct, cultivationGain:rewardCultivationGain, lifeEnded:!this.stateValue.alive, summaryLines, state:this.state };
    }

    resolveOffline(plan, lastSeenUnixMs, nowUnixMs) {
        return this.resolveRealtimeOffline(plan, lastSeenUnixMs, nowUnixMs);
    }

    voluntaryPassingEligibility(nowUnixMs = Date.now()) {
        if (!this.stateValue.alive) return { ok:false, reason:'Đời hiện tại đã kết thúc.' };
        const rp=this.metaValue.reincarnationProgress;
        const energyState=rechargeReincarnationEnergy(rp.energy,nowUnixMs);
        const preview=previewReincarnationV2Reward(this.reincarnationRewardArgsV4(nowUnixMs));
        if(energyState.current+1e-9<preview.energyCost) return {ok:false,reason:`Không đủ Năng Lượng Luân Hồi: cần ${preview.energyCost}, hiện có ${energyState.current.toFixed(1)}/300.`,energyCost:preview.energyCost,energy:energyState.current};
        return {ok:true,energyCost:preview.energyCost,energy:energyState.current,projectedRp:preview.reincarnationPoints};
    }
    enterMeditativePassing(nowUnixMs = Date.now()) {
        const gate=this.voluntaryPassingEligibility(nowUnixMs); if(!gate.ok) throw new Error(gate.reason??'Chưa thể Tọa Hóa.');
        const realm=this.registry.realm(this.stateValue.realm.realmId);
        const event={id:`life.meditative-passing.${this.currentLifeValue.lifeId}.${this.actionIndexValue}`,worldTimeYears:this.stateValue.worldTimeYears,ageYears:this.stateValue.ageYears,type:'system',significance:70,message:`Ngươi chủ động Tọa Hóa tại ${realm.name}, khép lại đời ${this.currentLifeValue.lifeNumber} và đưa toàn bộ thành tựu thật sự vào Luân Hồi.`,locationId:this.stateValue.locationId,tags:['LifeEnd','VoluntaryPassing','MeditativePassing'],data:{realmOrder:this.stateValue.realm.maxRealmOrder,lifeNumber:this.currentLifeValue.lifeNumber,energyCost:gate.energyCost}};
        this.historyValue.append(event); this.stateValue.alive=false; this.actionIndexValue+=1; return {summary:event.message,event,state:this.state};
    }
    previewReincarnationV2Reward(nowUnixMs = Date.now()) {
        return previewReincarnationV2Reward(this.reincarnationRewardArgsV4(nowUnixMs));
    }
    finalizeReincarnationRewards(_confirmedBuildReady = true, nowUnixMs = Date.now()) {
        if(this.stateValue.alive) throw new Error('Đời hiện tại chưa kết thúc.');
        const rp=this.metaValue.reincarnationProgress;
        const existing=rp.rewardHistory.find(x=>x.lifeId===this.currentLifeValue.lifeId); if(existing) return {...existing};
        const settlement=this.settleCurrentLife();
        rp.energy=rechargeReincarnationEnergy(rp.energy,nowUnixMs);
        const reward=previewReincarnationV2Reward(this.reincarnationRewardArgsV4(nowUnixMs));
        const lifeEnd=[...this.historyValue.all()].reverse().find(e=>e.tags?.includes('LifeEnd'));
        const voluntary=Boolean(lifeEnd?.tags?.includes('VoluntaryPassing'));
        if(voluntary&&rp.energy.current+1e-9<reward.energyCost) throw new Error(`Không đủ Năng Lượng Luân Hồi: cần ${reward.energyCost}, hiện có ${rp.energy.current.toFixed(1)}/300.`);
        const energySpent=voluntary?reward.energyCost:0; if(energySpent>0) rp.energy.current=Math.max(0,rp.energy.current-energySpent);
        rp.tree.lifetimePointsEarned+=reward.reincarnationPoints;
        rp.highestRealmOrderV4=Math.max(Math.max(0,Number(rp.highestRealmOrderV4)||0),reward.realmOrder);
        rp.bestCombatPowerByRealmOrderV4??={}; rp.bestCombatPowerByRealmOrderV4[String(reward.realmOrder)]=Math.max(Number(rp.bestCombatPowerByRealmOrderV4[String(reward.realmOrder)]||0),reward.combatPower);
        const cultivationTier=depthInfoForRealmOrder(this.stateValue.realm.maxRealmOrder).tierIndex;
        rp.tree.highestAchievementTierByTree.cultivation=Math.max(rp.tree.highestAchievementTierByTree.cultivation??0,cultivationTier);
        rp.permanentPotential.unspent+=reward.permanentPotentialGain; rp.permanentPotential.lifetimeEarned+=reward.permanentPotentialGain;
        this.metaValue.reincarnation.xp=rp.tree.lifetimePointsEarned; this.metaValue.reincarnation.sealLevel=reincarnationSealLevel(rp.tree.lifetimePointsEarned);
        const finalized={...reward,energySpent,forcedPassing:!voluntary,grade:settlement.grade};
        rp.rewardHistory.push(finalized); if(rp.rewardHistory.length>200)rp.rewardHistory.splice(0,rp.rewardHistory.length-200);
        this.actionIndexValue+=1; return {...finalized};
    }
    previewCurrentLifeSettlement() {
        const previewState = cloneAdventureState(this.stateValue);
        previewState.alive = false;
        return this.settlementEngine.settle(previewState, this.historyValue.all(), this.profile, this.currentLifeValue, this.registry);
    }
    settleCurrentLife() {
        if (this.stateValue.alive)
            throw new Error('Current life is still alive');
        const existing = this.metaValue.archives.find(archive => archive.lifeId === this.currentLifeValue.lifeId);
        if (existing)
            return cloneMetaProgressState({ ...createMetaProgressState(), archives: [existing] }).archives[0];
        const rawSettlement = this.settlementEngine.settle(this.stateValue, this.historyValue.all(), this.profile, this.currentLifeValue, this.registry);
        // v1.10.4: Reincarnation V2 is authoritative. Legacy CP/Mệnh Cơ remain readable in old saves but are no longer minted.
        const settlement = this.metaValue.reincarnationProgress ? {
            ...rawSettlement, cpBase:0,cpBonus:0,cpEarned:0,mingJiGain:0,mingJiDomainGains:{},talentPointGain:0,reincarnationLegacy:rawSettlement.reincarnationLegacy?{...rawSettlement.reincarnationLegacy,xp:0,effective:false}:rawSettlement.reincarnationLegacy,
        } : rawSettlement;
        applySettlement(this.metaValue, settlement);
        applyEndlessLifeLegacy(this.metaValue.endless, this.stateValue.endlessHunt);
        return cloneMetaProgressState({ ...createMetaProgressState(), archives: [settlement] }).archives[0];
    }
    reincarnate(plan = {}) {
        if (this.stateValue.alive) this.enterMeditativePassing(plan.nowUnixMs ?? Date.now());
        const progressionReward = this.finalizeReincarnationRewards(true, plan.nowUnixMs ?? Date.now());
        const settlement = this.settleCurrentLife();
        const previousLife = cloneCurrentLifeMeta(this.currentLifeValue);
        const previousState = cloneAdventureState(this.stateValue);
        const previousAlchemy = ensureAlchemyV112State(previousState.economy);
        this.metaValue.reincarnationProgress.alchemyLegacy = archiveAlchemyLegacy(cloneAlchemyLegacy(this.metaValue.reincarnationProgress.alchemyLegacy), previousAlchemy);
        this.metaValue.reincarnationProgress.tree.highestAchievementTierByTree.alchemy = Math.max(this.metaValue.reincarnationProgress.tree.highestAchievementTierByTree.alchemy ?? 0, previousAlchemy.rank - 1);
        // Alpha.23.24: Mệnh Thai rerolls only current-life axes; Linh Căn, Huyết Mạch and Thể Chất are carried forward.
        const selectedRelicIds = [...new Set(plan.bindRelicArtifactIds ?? [])];
        for (const artifactId of selectedRelicIds) {
            const held = previousState.artifacts.items.some(a => a.id === artifactId);
            const oldRelic = this.metaValue.artifactRelics.some(r => r.artifact.id === artifactId);
            if (!held && !oldRelic)
                throw new Error(`Không tìm thấy Di Vật để neo Luân Hồi: ${artifactId}`);
        }
        const inheritedKarmaSnapshots = (plan.inheritKarmaNpcIds ?? []).map(npcId => {
            const rel = playerNpcRelationship(previousState.worldSimulation, previousLife.lifeId, npcId, previousState.worldTimeYears);
            return { npcId, trust: rel.trust, respect: rel.respect, debt: rel.debt, grudge: rel.grudge, karmaDepth: rel.karmaDepth };
        });
        const seal=this.metaValue.reincarnation.sealLevel;
        const birthCandidate=Math.max(1,Math.floor(Number(plan.birthCandidate)||1));
        if(birthCandidate>birthPreviewCountForSeal(seal)) throw new Error(`${reincarnationSealName(seal)} chỉ soi được ${birthPreviewCountForSeal(seal)} đời mới.`);
        if((plan.inheritKarmaNpcIds??[]).length>karmaInheritanceSlotsForSeal(seal)) throw new Error(`${reincarnationSealName(seal)} chưa đủ ô Nhân Quả.`);
        if((plan.bindRelicArtifactIds??[]).length>boundRelicSlotsForSeal(seal)) throw new Error(`${reincarnationSealName(seal)} chưa đủ ô Di Vật.`);
        if(plan.memoryArchiveId&&seal<2) throw new Error('Ký Ức Tiền Kiếp yêu cầu Luân Hồi Ấn II.');
        if(plan.daoSeedId&&seal<4) throw new Error('Đạo Chủng yêu cầu Luân Hồi Ấn IV.');
        const cpCost={totalCpCost:0,fateLockCount:0,retired:true};
        deactivateFactionMembership(this.stateValue.factions, previousLife.lifeId);
        this.preserveArtifactsAsWorldRelics(previousLife.lifeId);
        const nextLifeNumber = previousLife.lifeNumber + 1;
        const birthSeed = this.reincarnationBirthSeed(nextLifeNumber, plan.birthCandidate ?? 1);
        const birth = carryPersistentBirthOrigins(rollBirth(birthSeed, 0, plan, this.metaValue.reincarnation.sealLevel, talentRank(this.metaValue.talents, 'birth.resonance')), previousLife.birth);
        const gapRng = birthSeed % 13;
        const worldYearsUntilPlayable = 18 + 1 + gapRng;
        const memoryArchive = plan.memoryArchiveId ? this.metaValue.reincarnation.memoryArchives.find(x => x.id === plan.memoryArchiveId) : undefined;
        const selectedSeed = plan.daoSeedId ? this.metaValue.reincarnation.daoSeeds.find(x => x.id === plan.daoSeedId) : undefined;
        const memoryFragments = buildMemoryFragments(memoryArchive);
        if (selectedSeed && !memoryFragments.some(x => x.type === 'dao' && x.payloadId === selectedSeed.daoId))
            memoryFragments.push({ id: `memory.dao-seed.${selectedSeed.id}`, type: 'dao', title: `Đạo Chủng tiền kiếp · ${selectedSeed.daoId}`, unlockRealmOrder: 26, payloadId: selectedSeed.daoId, unlocked: false });
        const inheritance = { orientationId:'balanced', selectedDaoSeedId:selectedSeed?.id, inheritedKarmaNpcIds:[...new Set(plan.inheritKarmaNpcIds??[])], boundRelicArtifactIds:selectedRelicIds, memoryFragments, fateLocksUsed:0 };
        this.stateValue = buildReincarnatedState(this.stateValue, this.world, this.registry, this.metaValue, birth, worldYearsUntilPlayable, plan);
        syncReincarnationTalentsToOrigins(this.stateValue.inheritedOrigins, this.metaValue.talents);
        syncV127TreeDerivedState(this.stateValue, this.metaValue);
        if (this.stateValue.realm.maxRealmOrder < 46) {
            const alchemyLife = ensureAlchemyV112State(this.stateValue.economy).life;
            this.stateValue.lifespanYears = effectiveMortalLifespanCapV127(this.stateValue.realm.maxRealmOrder, this.stateValue.inheritedOrigins) + Math.max(0, Number(alchemyLife?.lifespanPillBonusYears) || 0);
        }
        this.currentLifeValue = {
            activeFateId: this.metaValue.reincarnationProgress.fateBuild.activeFateId,
            lifeId: `life.${nextLifeNumber}`,
            lifeNumber: nextLifeNumber,
            birth,
            previousLifeId: previousLife.lifeId,
            reincarnation: inheritance,
            fateRuntime: createFateRuntimeState(),
        };
        this.syncCurrentLifeFateRuntimeV4();
        this.metaValue.reincarnation.totalReincarnations += 1;
        this.metaValue.reincarnationProgress.pendingTrial = undefined;
        for (const old of inheritedKarmaSnapshots) {
            const rel = playerNpcRelationship(this.stateValue.worldSimulation, this.currentLifeValue.lifeId, old.npcId, this.stateValue.worldTimeYears);
            rel.met = false;
            rel.trust = Math.max(rel.trust, old.trust * 0.12);
            rel.respect = Math.max(rel.respect, old.respect * 0.10);
            rel.debt = Math.max(rel.debt, old.debt * 0.15);
            rel.grudge = Math.max(rel.grudge, old.grudge * 0.18);
            rel.karmaDepth = Math.max(rel.karmaDepth, Math.min(45, old.karmaDepth * 0.38 + 5));
            if (!rel.flags.includes('InheritedKarma'))
                rel.flags.push('InheritedKarma');
        }
        for (const artifactId of selectedRelicIds) {
            const relic = this.metaValue.artifactRelics.find(r => r.artifact.id === artifactId);
            if (!relic)
                continue;
            relic.lostLocationId = this.world.startLocationId;
            relic.lostWorldYear = this.stateValue.worldTimeYears;
            relic.currentHolderLifeId = undefined;
        }
        this.ensureLifeParents();
        const interlifeWorldEvents = this.syncWorldState(this.stateValue, birthSeed ^ 0xa54ff53a);
        this.ensureCombatLoadout();
        // EventHistory intentionally gets a fresh current-life chronicle; completed life is archived in meta.
        this.historyValue.clear();
        const startEvent = {
            id: `life.start.${this.currentLifeValue.lifeId}.${birthSeed}`,
            worldTimeYears: this.stateValue.worldTimeYears,
            ageYears: this.stateValue.ageYears,
            type: 'system',
            significance: 18,
            message: birthSummary(this.currentLifeValue),
            locationId: this.stateValue.locationId,
            tags: ['LifeStart', 'Reincarnation'],
            data: {
                lifeNumber: nextLifeNumber, aptitude: birth.aptitude, luck: birth.luck,
                previousLifeId:previousLife.lifeId,reincarnationSeal:this.metaValue.reincarnation.sealLevel,activeFateId:this.currentLifeValue.activeFateId,karmaThreads:inheritance.inheritedKarmaNpcIds.length,boundRelics:inheritance.boundRelicArtifactIds.length,
            },
        };
        this.historyValue.append(startEvent);
        if (inheritance.selectedDaoSeedId || inheritance.inheritedKarmaNpcIds.length || inheritance.boundRelicArtifactIds.length || inheritance.memoryFragments.length) {
  this.historyValue.append({id:`reincarnation.inheritance.${this.currentLifeValue.lifeId}`,worldTimeYears:this.stateValue.worldTimeYears,ageYears:this.stateValue.ageYears,type:'system',significance:24,message:`${reincarnationSealName(this.metaValue.reincarnation.sealLevel)} giữ lại ${inheritance.memoryFragments.length} ký ức · ${inheritance.inheritedKarmaNpcIds.length} nhân quả · ${inheritance.boundRelicArtifactIds.length} di vật.`,locationId:this.stateValue.locationId,tags:['Reincarnation','Inheritance','PastLifeMemory'],data:{seal:this.metaValue.reincarnation.sealLevel}});
        }
        this.syncReincarnationMemories();
        for (const worldEvent of interlifeWorldEvents
            .filter(event => event.significance >= 20)
            .sort((a, b) => b.significance - a.significance)
            .slice(0, 3)
            .sort((a, b) => a.worldTimeYears - b.worldTimeYears)) {
            this.historyValue.append({
                ...worldEvent,
                id: `interlife.${this.currentLifeValue.lifeId}.${worldEvent.id}`,
                ageYears: this.stateValue.ageYears,
                message: `Trong thời gian ngươi luân hồi: ${worldEvent.message}`,
                tags: [...worldEvent.tags, 'Interlife'],
            });
        }
        let legacyEvent;
        if (settlement.legacy) {
            legacyEvent = {
                id: `legacy.echo.${this.currentLifeValue.lifeId}`,
                worldTimeYears: this.stateValue.worldTimeYears,
                ageYears: this.stateValue.ageYears,
                type: 'system',
                significance: Math.min(45, Math.max(16, settlement.legacy.significance)),
                message: `Thanh Hà Vực vẫn lưu một dấu vết tiền kiếp: ${settlement.legacy.summary}`,
                locationId: this.stateValue.locationId,
                tags: ['PastLifeLegacy', 'Reincarnation'],
                data: { sourceLifeId: previousLife.lifeId, legacyId: settlement.legacy.id },
            };
            this.historyValue.append(legacyEvent);
        }
        this.actionIndexValue += 1;
        return {
            settlement, cpCost, previousLife, currentLife: this.currentLife, state: this.state, meta: this.meta, legacyEvent, progressionReward,
        };
    }
    snapshot() {
        return {
            schemaVersion: SIMULATION_SAVE_VERSION,
            rootSeed: this.rootSeed,
            actionIndex: this.actionIndexValue,
            profileId: this.profile.id,
            state: cloneAdventureState(this.stateValue),
            history: this.historyValue.all(),
            meta: cloneMetaProgressState(this.metaValue),
            currentLife: cloneCurrentLifeMeta(this.currentLifeValue),
        };
    }
    ensureLifeParents() {
        ensureParentsForLife(this.stateValue.social, this.currentLifeValue.lifeId, this.currentLifeValue.birth, this.stateValue.character, this.stateValue.worldTimeYears, this.world.startLocationId, mixSeed(this.rootSeed ^ 0xa4093822, this.currentLifeValue.lifeNumber * 131));
    }
    establishNpcSocialRole(npcId, role) {
        if (!this.stateValue.alive)
            throw new Error('Current life has ended');
        const definition = this.world.npcs?.[npcId];
        const npc = this.stateValue.worldSimulation.npcs[npcId];
        if (!definition || !npc)
            throw new Error(`Unknown NPC: ${npcId}`);
        if (!npc.alive)
            throw new Error(`${definition.name} is no longer alive`);
        if (npc.locationId !== this.stateValue.locationId)
            throw new Error(`${definition.name} is not at the current location`);
        const relation = this.npcRelationship(npcId);
        if (!relation?.met)
            throw new Error(`You must know ${definition.name} before establishing a social role`);
        if (socialBond(this.stateValue.social, this.currentLifeValue.lifeId, npcId, role))
            throw new Error(`${definition.name} already has role ${role}`);
        const incompatible = this.stateValue.social.bonds.some(bond => bond.lifeId === this.currentLifeValue.lifeId && bond.npcId === npcId && bond.active && bond.role !== role);
        if (incompatible)
            throw new Error(`${definition.name} already has another major social role in this life`);
        if (role === 'master') {
            if (npc.realmOrder < this.stateValue.realm.maxRealmOrder + 2)
                throw new Error('A master must currently stand clearly above the player realm');
            if (relation.respect < 12 || relation.trust < 5)
                throw new Error('Not enough respect/trust to request discipleship');
        }
        else if (role === 'disciple') {
            if (this.stateValue.realm.maxRealmOrder < npc.realmOrder + 2)
                throw new Error('Player must stand clearly above the NPC to accept them as disciple');
            if (relation.trust < 10 || relation.respect < 5)
                throw new Error('Not enough trust/respect to accept this NPC as disciple');
        }
        else {
            if (relation.trust < 30 || relation.karmaDepth < 20 || relation.grudge > 15)
                throw new Error('Dao partnership requires deep trust/karma and low grudge');
        }
        const seed = mixSeed(this.rootSeed ^ 0x299f31d0, this.actionIndexValue);
        const depth = role === 'daoPartner'
            ? (relation.trust + relation.karmaDepth + relation.respect) / 3
            : (relation.trust + relation.respect) / 2;
        const bond = establishSocialBond(this.stateValue.social, this.currentLifeValue.lifeId, npcId, role, this.stateValue.worldTimeYears, this.stateValue.ageYears, depth);
        const relationDelta = role === 'master'
            ? { trust: 4, respect: 7, karmaDepth: 6 }
            : role === 'disciple'
                ? { trust: 6, respect: 5, debt: 3, karmaDepth: 6 }
                : { trust: 8, respect: 5, karmaDepth: 10 };
        adjustPlayerNpcRelationship(this.stateValue.worldSimulation, this.currentLifeValue.lifeId, npcId, this.stateValue.worldTimeYears, relationDelta, [role]);
        const roleLabel = role === 'master' ? 'sư phụ' : role === 'disciple' ? 'đệ tử' : 'đạo lữ';
        const tags = role === 'master' ? ['Master'] : role === 'disciple' ? ['Disciple'] : ['DaoCompanion'];
        const event = this.advanceSocialActionTime(seed, 0.04, {
            id: `social.role.${seed}.${role}.${npcId}`,
            type: 'world', significance: role === 'daoPartner' ? 36 : 30,
            message: role === 'master'
                ? `Ngươi chính thức bái ${definition.name} làm sư phụ.`
                : role === 'disciple'
                    ? `${definition.name} hành lễ bái ngươi làm sư; từ đây trở thành đệ tử môn hạ.`
                    : `Ngươi cùng ${definition.name} kết thành đạo lữ, nguyện đồng hành trên con đường tu hành.`,
            targetId: npcId, tags: ['Relationship', 'SocialRole', roleLabel, ...tags],
            data: { npcId, role, bondDepth: bond.bondDepth },
        });
        this.actionIndexValue += 1;
        return { seed, npcId, role, bond: { ...bond, transmittedKnowledgeIds: [...bond.transmittedKnowledgeIds] }, event, state: this.state };
    }
    advanceSocialActionTime(seed, elapsedYears, template) {
        const elapsed = Math.min(Math.max(0, elapsedYears), this.remainingLifeYears());
        this.stateValue.worldTimeYears += elapsed;
        this.stateValue.ageYears += elapsed;
        const worldEvents = this.syncWorldState(this.stateValue, seed ^ 0x9e3779b9);
        this.historyValue.appendMany(worldEvents);
        const event = {
            ...template,
            worldTimeYears: this.stateValue.worldTimeYears,
            ageYears: this.stateValue.ageYears,
            actorId: this.profile.combatEntity.id,
            locationId: this.stateValue.locationId,
            tags: [...template.tags],
            data: template.data ? { ...template.data } : undefined,
        };
        this.historyValue.append(event);
        this.recordPlayerWorldEvent(event);
        this.applyNaturalDeathToState(seed);
        return event;
    }
    worldEventForCurrentLife(event, state) {
        const yearsAgo = Math.max(0, state.worldTimeYears - event.worldTimeYears);
        const personalConsequence = event.data?.playerLifeId === this.currentLifeValue.lifeId || event.data?.sourceLifeId === this.currentLifeValue.lifeId;
        return {
            id: `${personalConsequence ? 'relation' : 'news'}.${event.id}`,
            worldTimeYears: event.worldTimeYears,
            ageYears: Math.max(0, state.ageYears - yearsAgo),
            type: 'world',
            significance: event.significance,
            message: event.message,
            actorId: event.actorId,
            targetId: event.targetId,
            locationId: event.locationId,
            tags: personalConsequence
                ? [...event.tags.filter(tag => tag !== 'WorldSimulation'), 'RelationshipConsequence']
                : [...event.tags, 'WorldNews'],
            data: event.data ? { ...event.data } : undefined,
        };
    }
    recordFactionMajorEvent(event) {
        if (event.significance < 16)
            return;
        this.stateValue.factions.majorEvents.push({
            id: `faction.history.${event.id}`,
            worldTimeYears: event.worldTimeYears,
            significance: event.significance,
            message: event.message,
            actorId: event.actorId,
            targetId: event.targetId,
            locationId: event.locationId,
            tags: [...event.tags, 'FactionHistory'],
            data: event.data ? { ...event.data } : undefined,
        });
        if (this.stateValue.factions.majorEvents.length > 240)
            this.stateValue.factions.majorEvents.splice(0, this.stateValue.factions.majorEvents.length - 240);
    }
    profileWithFactionCultivationBonus(_state, _includeFaction = true) { return this.profile; }
    syncWorldState(state, seed) {
        const simulator = new WorldSimulator(this.world, this.registry);
        const result = simulator.sync(state.worldSimulation, state.worldTimeYears, seed >>> 0, {
            lifeId: this.currentLifeValue.lifeId,
            locationId: state.locationId,
        });
        const social = syncSocialState(state.social, state.worldTimeYears, seed ^ 0x3c6ef372, this.registry, this.world);
        const faction = syncFactionState(state.factions, state.worldTimeYears);
        const currentMembership = playerFactionMembership(state.factions, this.currentLifeValue.lifeId);
        const orthodoxyEvents = syncOrthodoxyState(state.orthodoxy ?? (state.orthodoxy = createOrthodoxyState(state.worldTimeYears)), state.worldTimeYears, seed ^ 0x6d2b79f5, currentMembership?.factionId);
        const genesisState = state.genesisWorlds ?? (state.genesisWorlds = createGenesisWorldState(state.worldTimeYears));
        const genesisEvents = syncGenesisWorlds(genesisState, state.worldTimeYears, seed ^ 0x1f123bb5);
        const ascendantState = state.ascendants ?? (state.ascendants = createOuterAscendantState(state.worldTimeYears));
        const ascendantEvents = [...materializeGenesisAscendants(ascendantState, genesisState, state.worldTimeYears, this.ascendantEmergenceLocations()), ...syncOuterAscendants(ascendantState, state.orthodoxy, state.worldTimeYears, seed ^ 0x52a9b17d, currentMembership?.factionId, this.ascendantEmergenceLocations())];
        syncEconomyState(state.economy, this.world.markets ?? {}, state.worldTimeYears);
        const alchemyCompletions = syncAlchemyV112({ container: state.economy, inventory: state.inventory, worldYear: state.worldTimeYears });
        const alchemyWorldEvents = alchemyCompletions.map((done, index) => ({
            id: `alchemy.sync.${Math.floor(state.worldTimeYears * 1000)}.${index}.${done.jobId}`, worldTimeYears: state.worldTimeYears, ageYears: state.ageYears, type: 'resource',
            significance: done.qualities.supreme > 0 ? 10 : 4, message: `Luyện đan hoàn tất: ${done.recipeName} ×${done.outputCount}, Cực phẩm ${done.qualities.supreme}.`, locationId: state.locationId,
            tags: ['Alchemy', 'CraftComplete'], data: { recipeId: done.recipeId, outputCount: done.outputCount, supreme: done.qualities.supreme, masteryAfter: done.masteryAfter, specializationAfter: done.specializationAfter, alchemyExpGained: done.alchemyExpGained },
        }));
        for (const event of result.events) {
            if (event.data?.playerLifeId !== this.currentLifeValue.lifeId)
                continue;
            const spiritStones = typeof event.data?.playerRewardSpiritStones === 'number' ? Math.max(0, event.data.playerRewardSpiritStones) : 0;
            if (spiritStones > 0)
                state.inventory['resource.spirit_stone'] = (state.inventory['resource.spirit_stone'] ?? 0) + this.fateSpiritStoneGainV4(spiritStones,state);
        }
        const genesisWorldEvents = genesisEvents.map((event, index) => ({
            id: `genesis.world.sync.${Math.floor(state.worldTimeYears * 1000)}.${index}`, worldTimeYears: state.worldTimeYears, ageYears: state.ageYears,
            type: 'world', significance: event.significance, message: event.message, locationId: state.locationId, tags: ['GenesisWorld', event.type], data: { internalWorldAge: event.worldAgeYears },
        }));
        const orthodoxyWorldEvents = orthodoxyEvents.map((event, index) => ({
            id: `orthodoxy.sync.${Math.floor(state.worldTimeYears * 1000)}.${index}`, worldTimeYears: state.worldTimeYears, ageYears: state.ageYears, type: 'world', significance: event.significance, message: event.message, locationId: event.locationId, tags: ['Orthodoxy', 'Diplomacy', event.type], data: { factionIds: event.factionIds.join(','), warId: event.warId ?? '' },
        }));
        const ascendantWorldEvents = ascendantEvents.map((event, index) => ({ id: `ascendant.sync.${Math.floor(state.worldTimeYears * 1000)}.${index}`, worldTimeYears: state.worldTimeYears, ageYears: state.ageYears, type: 'world', significance: event.significance, message: event.message, locationId: event.locationId ?? state.locationId, tags: ['Ascendant', 'GenesisWorld', event.type], data: { actorId: event.actorId, warId: event.warId ?? '', factionIds: (event.factionIds ?? []).join(',') } }));
        return [...result.events, ...social.events, ...faction.events, ...orthodoxyWorldEvents, ...genesisWorldEvents, ...ascendantWorldEvents, ...alchemyWorldEvents]
            .filter(event => event.significance >= 10)
            .map(event => this.worldEventForCurrentLife(event, state));
    }
    recordPlayerWorldEvent(event) {
        const state = this.stateValue.worldSimulation;
        if (event.significance < 10)
            return;
        state.majorEvents.push({
            id: `world.player.${event.id}`,
            worldTimeYears: event.worldTimeYears,
            significance: event.significance,
            message: event.message,
            actorId: event.actorId,
            targetId: event.targetId,
            locationId: event.locationId,
            tags: ['PlayerWorldAction', ...event.tags],
            data: event.data ? { ...event.data } : undefined,
        });
        if (state.majorEvents.length > 240)
            state.majorEvents.splice(0, state.majorEvents.length - 240);
    }
    appendWorldSimulationToReport(report, seed) {
        const worldEvents = this.syncWorldState(report.state, seed);
        if (worldEvents.length === 0)
            return;
        report.events.push(...worldEvents);
        const surfaced = [...worldEvents].sort((a, b) => b.significance - a.significance).slice(0, 3);
        report.summaryLines.push(`Thế giới phát sinh ${worldEvents.length} biến động đáng chú ý.`);
        report.summaryLines.push(...surfaced.map(event => `Thế giới: ${event.message}`));
    }
    finishMarketTrade(action, transaction) {
        const seed = mixSeed(this.rootSeed ^ 0x85ebca6b, this.actionIndexValue);
        const market = this.stateValue.economy.markets[transaction.marketId];
        const elapsed = Math.min(0.004, this.remainingLifeYears());
        this.stateValue.worldTimeYears += elapsed;
        this.stateValue.ageYears += elapsed;
        const worldEvents = this.syncWorldState(this.stateValue, seed ^ 0xc2b2ae35);
        this.historyValue.appendMany(worldEvents);
        const actionText = action === 'buy' ? 'mua' : 'bán';
        const event = {
            id: `economy.market.${action}.${seed}.${transaction.marketId}.${transaction.resourceId}`,
            worldTimeYears: this.stateValue.worldTimeYears, ageYears: this.stateValue.ageYears,
            type: 'world', significance: Math.min(9, 3 + Math.log2(1 + transaction.totalSpiritStones)),
            message: `Ngươi ${actionText} ${transaction.quantity} ${transaction.resourceId} tại ${market.name}, trị giá ${transaction.totalSpiritStones} linh thạch.`,
            actorId: this.profile.combatEntity.id, locationId: market.locationId,
            tags: ['Economy', action === 'buy' ? 'MarketPurchase' : 'MarketSale'],
            data: { ...transaction, action },
        };
        this.historyValue.append(event);
        this.applyNaturalDeathToState(seed);
        this.actionIndexValue += 1;
        return { seed, action, transaction, event, state: this.state };
    }
    canonicalActiveSkillIds(source = this.stateValue.character.activeSkillIds) {
        return [...new Set(source)].filter(id => !id.startsWith('skill.class.') && this.registry.skills.has(id));
    }
    ensureCombatLoadout() {
        const character = this.stateValue.character;
        if (!character.knownSkillIds)
            character.knownSkillIds = [];
        if (!character.activeSkillIds)
            character.activeSkillIds = [];
        // V19/V31 migration rule: legacy skill.class.* knowledge may remain in saves for history, but never enters a live loadout.
        if (character.knownSkillIds.length === 0) {
            for (const id of this.profile.combatEntity.skillIds) {
                this.registry.skill(id);
                if (!character.knownSkillIds.includes(id))
                    character.knownSkillIds.push(id);
            }
        }
        character.activeSkillIds = this.canonicalActiveSkillIds(character.activeSkillIds);
        if (character.activeSkillIds.length === 0) {
            character.activeSkillIds = this.canonicalActiveSkillIds(character.knownSkillIds);
            if (character.activeSkillIds.length === 0 && this.registry.skills.has('skill.basic_strike'))
                character.activeSkillIds = ['skill.basic_strike'];
        }
        for (const id of character.activeSkillIds) {
            this.registry.skill(id);
            if (!character.knownSkillIds.includes(id))
                character.knownSkillIds.push(id);
        }
        if (!character.combatAiProfile) {
            character.combatAiProfile = {
                name: this.profile.combatEntity.aiProfile.name,
                rules: this.profile.combatEntity.aiProfile.rules.map(rule => ({ ...rule, conditions: rule.conditions.map(condition => ({ ...condition })) })),
            };
        }
        const activeSet = new Set(character.activeSkillIds);
        character.combatAiProfile = { ...character.combatAiProfile, rules: character.combatAiProfile.rules.filter(rule => !rule.skillId.startsWith('skill.class.') && activeSet.has(rule.skillId)) };
        if (character.combatAiProfile.rules.length === 0 && character.activeSkillIds.length) {
            character.combatAiProfile = { name: 'Luân chuyển kỹ năng hiện tại', rules: character.activeSkillIds.map((skillId, index) => ({ skillId, priority: 100 - index, conditions: [{ type: 'always' }] })) };
        }
        const foundation = cloneBuildFoundationV113(character.buildFoundation, character.spiritualRootId);
        if (foundation.battleDao.mainDaoId && foundation.battleDao.committed && foundation.progressionV125?.daoNatureCommitted) {
            const normalized = syncCanonicalBattleDaoLoadoutV125(character, character.activeSkillIds);
            character.combatAiProfile = battleDaoAutoRotationV127(foundation.battleDao.mainDaoId, normalized.combinedSkillIds, foundation.battleDao.secondaryDaoId);
        }
    }
    ensureArtifactOwnerLife(state) {
        for (const item of state.items) {
            if (!item.history.ownerLifeIds.includes(this.currentLifeValue.lifeId))
                item.history.ownerLifeIds.push(this.currentLifeValue.lifeId);
        }
    }
    preserveArtifactsAsWorldRelics(sourceLifeId) {
        if (!this.metaValue.artifactRelics)
            this.metaValue.artifactRelics = [];
        for (const item of this.stateValue.artifacts.items) {
            const lost = cloneArtifactInstance(item);
            markArtifactLost(lost, this.stateValue.worldTimeYears);
            const existing = this.metaValue.artifactRelics.find(relic => relic.artifact.id === item.id);
            if (existing) {
                existing.artifact = lost;
                existing.sourceLifeId = sourceLifeId;
                existing.lostWorldYear = this.stateValue.worldTimeYears;
                existing.lostLocationId = this.stateValue.locationId;
                existing.currentHolderLifeId = undefined;
            }
            else {
                this.metaValue.artifactRelics.push({
                    artifact: lost,
                    sourceLifeId,
                    lostWorldYear: this.stateValue.worldTimeYears,
                    lostLocationId: this.stateValue.locationId,
                    recoveredByLifeIds: [],
                });
            }
        }
        this.metaValue.artifactRelics.sort((a, b) => artifactLegacyScore(b.artifact) - artifactLegacyScore(a.artifact));
    }
    resolveParallelDungeons(report, seed) {
        if (report.elapsedYears <= 0)
            return;
        synchronizeSoulForRealm(report.state.soul, report.state.realm.maxRealmOrder, report.state.dungeons.parallelWorkerCapacity);
        syncSoulDungeonWorkers(report.state.soul, report.state.dungeons, soulCloneAuthorityCapacityV127(report.state.realm.maxRealmOrder));
        recordSoulCloneYears(report.state.soul, report.elapsedYears);
        if (report.state.dungeons.workers.length === 0)
            return;
        const workBefore = Object.fromEntries(Object.entries(report.state.dungeons.assignments).map(([workerId, assignment]) => [workerId, { totalYears: Number(assignment.totalYears ?? 0), totalRuns: Number(assignment.totalRuns ?? 0) }]));
        const parallel = this.dungeonEngine.resolveParallel(report.state, this.world.dungeons, report.elapsedYears, seed >>> 0, this.registry, parallelDungeonEfficiencyMultiplier(report.state.inheritedOrigins));
        for (const clone of report.state.soul.clones) {
            const assignment = report.state.dungeons.assignments[clone.id];
            if (!assignment)
                continue;
            const before = workBefore[clone.id] ?? { totalYears: 0, totalRuns: 0 };
            clone.dungeonWorkYears = Math.max(0, Number(clone.dungeonWorkYears ?? 0)) + Math.max(0, Number(assignment.totalYears ?? 0) - before.totalYears);
            clone.dungeonWorkRuns = Math.max(0, Math.floor(Number(clone.dungeonWorkRuns ?? 0))) + Math.max(0, Math.floor(Number(assignment.totalRuns ?? 0)) - Math.floor(before.totalRuns));
        }
        report.events.push(...parallel.events);
        const offlineFoundation = cloneBuildFoundationV113(report.state.character.buildFoundation, report.state.character.spiritualRootId);
        report.state.character.buildFoundation = offlineFoundation;
        if (offlineFoundation.progressionV125?.daoNatureCommitted) {
            for (const [tierId, resourceId] of Object.entries(V125_DAO_NATURE_TIER_RESOURCE_IDS)) {
                const amount = Math.max(0, report.state.inventory[resourceId] ?? 0);
                if (amount <= 0)
                    continue;
                report.state.inventory[resourceId] = 0;
                const tierIndex = Object.keys(V125_DAO_NATURE_TIER_RESOURCE_IDS).indexOf(tierId);
                const cleared = tierIndex >= 0 && isDungeonFloorCleared(report.state.dungeons, V125_DAO_NATURE_DUNGEON_ID, tierIndex + 1);
                addDaoNatureCultivationXpV125(report.state.character, tierId, amount, cleared ? 20 : 16);
            }
        }
        if (parallel.summaryLines.length > 0) {
            report.summaryLines.push(`Phân thân/phụ trợ vận hành: ${parallel.summaryLines.length} phó bản.`);
            report.summaryLines.push(...parallel.summaryLines.slice(0, 3));
        }
    }
    processNewLoot(state, previousEquipmentIds, previousArtifactIds) {
        const newEquipmentIds = new Set(state.equipment.items.filter(item => !previousEquipmentIds.has(item.id)).map(item => item.id));
        const newArtifactIds = new Set(state.artifacts.items.filter(item => !previousArtifactIds.has(item.id)).map(item => item.id));
        return processLootBatch(state, newEquipmentIds, newArtifactIds);
    }
    makeLootPolicyEvent(state, result, id) {
        if (result.processed <= 0)
            return undefined;
        const destructive = result.sold + result.disassembled;
        return {
            id,
            worldTimeYears: state.worldTimeYears,
            ageYears: state.ageYears,
            type: 'resource',
            significance: destructive > 0 ? 5 : 2,
            message: `Tự xử lý loot: giữ ${result.kept}, bán ${result.sold}, phân giải ${result.disassembled}.`,
            locationId: state.locationId,
            tags: ['LootPolicy', 'Automation'],
            data: { processed: result.processed, kept: result.kept, sold: result.sold, disassembled: result.disassembled },
        };
    }
    appendLootPolicyEvent(result, id) {
        const event = this.makeLootPolicyEvent(this.stateValue, result, id);
        if (event)
            this.historyValue.append(event);
    }
    remainingLifeYears(state = this.stateValue) {
        return state.realm.maxRealmOrder >= 46
            ? Number.POSITIVE_INFINITY
            : Math.max(0, state.lifespanYears - state.ageYears);
    }
    applyNaturalDeathIfNeeded(report, seed) {
        if (report.state.realm.maxRealmOrder < 46 && report.state.alive && report.state.ageYears + 1e-9 >= report.state.lifespanYears) {
            report.state.alive = false;
            report.stopReason = 'lifespanEnd';
            report.summaryLines.push('Thọ nguyên đã tận; một đời kết thúc.');
            report.events.push({
                id: `life.end.${seed}`,
                worldTimeYears: report.state.worldTimeYears,
                ageYears: report.state.ageYears,
                type: 'system',
                significance: 100,
                message: `Thọ nguyên ${report.state.lifespanYears.toFixed(0)} năm đã tận; một đời kết thúc.`,
                tags: ['LifeEnd', 'NaturalDeath'],
                data: { lifespanYears: report.state.lifespanYears },
            });
        }
    }
    applyNaturalDeathToState(seed) {
        if (this.stateValue.realm.maxRealmOrder < 46 && this.stateValue.alive && this.stateValue.ageYears + 1e-9 >= this.stateValue.lifespanYears) {
            this.stateValue.alive = false;
            this.historyValue.append({
                id: `life.end.${seed}`,
                worldTimeYears: this.stateValue.worldTimeYears,
                ageYears: this.stateValue.ageYears,
                type: 'system',
                significance: 100,
                message: `Thọ nguyên ${this.stateValue.lifespanYears.toFixed(0)} năm đã tận; một đời kết thúc.`,
                tags: ['LifeEnd', 'NaturalDeath'],
                data: { lifespanYears: this.stateValue.lifespanYears },
            });
        }
    }
    static restore(registry, world, entityDefinitions, profile, save) {
        return restoreSimulationSession(SimulationSession, SIMULATION_SAVE_VERSION, registry, world, entityDefinitions, profile, save);
    }
}
//# sourceMappingURL=session.js.map