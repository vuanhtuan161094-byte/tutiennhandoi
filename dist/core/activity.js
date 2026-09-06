import { runCombatKernelV2 } from './combat-kernel-v2.js';
import { applyCombatPacingV124 } from './combat-pacing-v124.js';
import { analyzeBattle, topDamageSkill } from './combat-analytics.js';
import { SeededRng } from './rng.js';
import { addTuViV140, requiredTuViV140 } from './cultivation-v140.js';
import { advanceDaoSuyByWorldYearsV127, daoSuyLongActivityLockedV127 } from './dao-suy-v127.js';
import { gatheringYieldMultiplier } from './reincarnation-talents.js';
import { birthLootMultiplierFromOrigins, applyBirthCombatOrigins } from './birth-randomness.js';
import { importanceOf } from './history.js';
import { cloneAdventureState, locationOf } from './world.js';
import { DungeonEngine, isDungeonFloorCleared } from './dungeon.js';
import { addEquipment, applyEquipmentToEntity, buildEquipmentInstance } from './equipment.js';
import { isLiveEquipmentSetV12310 } from './equipment-set-v116.js';
import { recordActiveArtifactBattle } from './artifact.js';
import { applyCollectionEconomyToEntityV12325 } from './gacha-collection-economy-v12325.js';
import { applyDaoToEntity } from './dao.js';
import { applyIntegrationToEntity, integrationSummary } from './integration.js';
import { carryFiveElementStateToNextMonsterV117, createFiveElementCombatStateV117 } from './five-element-combat-v117.js';
import { carryBattleDaoStateToNextMonsterV118, createBattleDaoCombatStateV118 } from './battle-dao-combat-v118.js';
import { carryBattleDaoV2StateToNextMonsterV2 } from './battle-dao-v2-runtime.js';
import { reincarnationTreeRuntimeModifierV136 } from './reincarnation-progression-v1102.js';
function weightedChoice(rng, entries) {
    const total = entries.reduce((sum, entry) => sum + Math.max(0, entry.weight), 0);
    if (total <= 0)
        return undefined;
    let roll = rng.next() * total;
    for (const entry of entries) {
        roll -= Math.max(0, entry.weight);
        if (roll <= 0)
            return entry;
    }
    return entries[entries.length - 1];
}
function duration(value) {
    return Math.max(0, value);
}
function eventId(seed, index) {
    return `event.${seed}.${index}`;
}
function formatNumber(value) {
    if (Math.abs(value) >= 1000)
        return value.toFixed(0);
    if (Math.abs(value) >= 100)
        return value.toFixed(1);
    return value.toFixed(2).replace(/\.00$/, '');
}
export class ActivityEngine {
    registry;
    world;
    entityDefinitions;
    seed;
    rng;
    dungeonEngine = new DungeonEngine();
    constructor(registry, world, entityDefinitions, seed) {
        this.registry = registry;
        this.world = world;
        this.entityDefinitions = entityDefinitions;
        this.seed = seed;
        this.rng = new SeededRng(seed);
    }
    run(initial, profile, request) {
        if (!initial.alive)
            throw new Error('Dead character cannot start an activity');
        const state = cloneAdventureState(initial);
        const events = [];
        const startTime = state.worldTimeYears;
        let stopReason = 'durationComplete';
        if (daoSuyLongActivityLockedV127(state.immortal, state.realm.maxRealmOrder)) {
            return { seed: this.seed, request, elapsedYears: 0, stopReason: 'daoSuyLocked', state, events, summaryLines: ['Đạo Suy đã chạm 100. Hoạt động dài hạn bị khóa; hãy vượt Suy Kiếp trước.'] };
        }
        // Leaving Hunt ends the current Hunt combat cycle and clears carried elemental/Gauge resources.
        if (request.type !== 'hunt')
            state.huntCombatRuntimeV117 = undefined;
        switch (request.type) {
            case 'gather':
                stopReason = this.runGather(state, profile, request, events);
                break;
            case 'hunt':
                stopReason = this.runHunt(state, profile, request, events);
                break;
            case 'explore':
                stopReason = this.runExplore(state, profile, request, events);
                break;
            case 'dungeon':
                stopReason = this.runDungeon(state, request, events);
                break;
        }
        const elapsedYears = state.worldTimeYears - startTime;
        return {
            seed: this.seed,
            request,
            elapsedYears,
            stopReason,
            state,
            events,
            summaryLines: this.buildSummary(initial, state, events, elapsedYears, stopReason),
        };
    }
    runGather(state, _profile, request, events) {
        const location = locationOf(this.world, state.locationId);
        const years = duration(request.durationYears);
        if (years <= 0 || location.resources.length === 0)
            return 'nothingToDo';
        const candidates = request.resourceId
            ? location.resources.filter(node => node.resourceId === request.resourceId)
            : location.resources;
        if (candidates.length === 0)
            return 'nothingToDo';
        this.advanceTime(state, years);
        for (const node of candidates) {
            const variance = 0.8 + this.rng.next() * 0.4;
            const rarityMultiplier = node.rarity === 'rare' ? 0.35 : node.rarity === 'uncommon' ? 0.65 : 1;
            const talentYield = gatheringYieldMultiplier(state.inheritedOrigins, node.resourceId);
            const amount = Math.max(0, Math.floor(node.baseYieldPerYear * years * variance * rarityMultiplier * talentYield));
            if (amount <= 0)
                continue;
            state.inventory[node.resourceId] = (state.inventory[node.resourceId] ?? 0) + amount;
            const significance = node.rarity === 'rare' ? 16 : node.rarity === 'uncommon' ? 8 : 3;
            events.push(this.makeEvent(state, events, 'resource', significance, `Thu thập ${node.name} ×${amount} tại ${location.name}.`, location.id, ['Gather', node.rarity, ...(talentYield > 1 ? ['ReincarnationTalent'] : [])], { resourceId: node.resourceId, amount, talentYieldMultiplier: talentYield }));
        }
        return this.shouldStopOnMajor(request, events) ? 'majorEvent' : 'durationComplete';
    }
    runHunt(state, profile, request, events) {
        const location = locationOf(this.world, state.locationId);
        if ((!request.forcedEntityId && location.encounters.length === 0) || request.durationYears <= 0)
            return 'nothingToDo';
        const encounterInterval = 0.25;
        const maxByDuration = Math.max(1, Math.floor(request.durationYears / encounterInterval));
        const attempts = Math.min(request.maxEncounters ?? maxByDuration, maxByDuration);
        if (attempts <= 0)
            return 'nothingToDo';
        for (let i = 0; i < attempts; i++) {
            if (request.advanceWorldTime !== false)
                this.advanceTime(state, encounterInterval);
            const picked = request.forcedEntityId ? { entityId: request.forcedEntityId, weight: 1 } : weightedChoice(this.rng, location.encounters);
            if (!picked)
                return 'nothingToDo';
            const enemy = this.entityDefinitions[picked.entityId];
            if (!enemy)
                throw new Error(`Unknown encounter entity: ${picked.entityId}`);
            const battleSeed = this.rng.nextUint32();
            const characterPlayer = applyCharacterToEntity(profile.combatEntity, state.character, this.registry, techniquePassiveStrengthMultiplier(state.inheritedOrigins), Boolean(state.inheritedOrigins['birth.v101.authoritative']));
            const equippedPlayer = applyEquipmentToEntity(characterPlayer, state.equipment, this.registry.equipmentSets);
            const artifactPlayer = equippedPlayer; // V88: legacy artifact state is compatibility-only.
            const collectionPlayer = applyCollectionEconomyToEntityV12325(artifactPlayer, state.collectionV12316);
            const daoPlayer = applyDaoToEntity(collectionPlayer, state.dao, this.registry);
            const integratedPlayer = applyIntegrationToEntity(daoPlayer, integrationSummary(state.realm, state.injury, state.soul, state.dao, state.artifacts));
            const talentedPlayer = applyBirthCombatOrigins(applyReincarnationCombatTalents(integratedPlayer, state.inheritedOrigins), state.inheritedOrigins);
            const huntRuntime = state.huntCombatRuntimeV117 ?? { fiveElements: createFiveElementCombatStateV117(), daoStateV118: createBattleDaoCombatStateV118(), ultimateGauge: 0, battleDaoStateV2: undefined };
            const playerCombat = {
                ...talentedPlayer,
                id: `${profile.combatEntity.id}.activity`,
                initialFiveElementsV117: { ...huntRuntime.fiveElements },
                initialDaoStateV118: huntRuntime.daoStateV118 ? { ...huntRuntime.daoStateV118 } : createBattleDaoCombatStateV118(),
                initialUltimateGaugeV117: huntRuntime.ultimateGauge,
                initialBattleDaoStateV2: huntRuntime.battleDaoStateV2 ? structuredClone(huntRuntime.battleDaoStateV2) : undefined,
            };
            const enemyCombat = { ...enemy, id: `${enemy.id}.activity.${i}` };
            const battle = runCombatKernelV2({ registry: this.registry, seed: battleSeed, entities: [applyCombatPacingV124(playerCombat), applyCombatPacingV124(enemyCombat)], mode: 'headless' }).battle;
            const analytics = analyzeBattle(battle);
            const playerAnalytics = analytics.combatants[playerCombat.id];
            const enemyAnalytics = analytics.combatants[enemyCombat.id];
            const signature = topDamageSkill(analytics, playerCombat.id);
            const won = battle.winnerId === playerCombat.id;
            const playerRuntimeFinal = battle.finalState[playerCombat.id];
            if (won && playerRuntimeFinal) {
                if (enemy.tags.includes('Boss')) {
                    // Boss closes the Hunt cycle: next cycle starts empty.
                    state.huntCombatRuntimeV117 = undefined;
                }
                else {
                    state.huntCombatRuntimeV117 = {
                        fiveElements: carryFiveElementStateToNextMonsterV117(playerRuntimeFinal.fiveElementsV117),
                        daoStateV118: carryBattleDaoStateToNextMonsterV118(playerRuntimeFinal.daoStateV118),
                        // Gauge is intentionally carried at full value through normal monsters; it is the save-for-boss resource.
                        ultimateGauge: Math.max(0, Math.min(100, playerRuntimeFinal.ultimateGaugeV117)),
                        // V2 passive stacks/core are rebased to the next battle clock; ordinary kills never reset them.
                        battleDaoStateV2: carryBattleDaoV2StateToNextMonsterV2(playerRuntimeFinal.battleDaoStateV2, battle.duration),
                    };
                }
            }
            else if (!won) {
                state.huntCombatRuntimeV117 = undefined;
            }
            recordActiveArtifactBattle(state.artifacts, won, state.worldTimeYears, enemy.name);
            if (won) {
                const isBoss = enemy.tags.includes('Boss') || enemy.tags.includes('Elite');
                const bossScale = enemy.tags.includes('Boss') ? 3 : enemy.tags.includes('Elite') ? 2 : 1;
                const fortuneBonusPct = Math.max(0, Math.min(150, Number(request.fortuneBonusPct ?? 0)));
                const birthLoot = birthLootMultiplierFromOrigins(state.inheritedOrigins);
                const spiritStones = Math.max(1, Math.round((2 + Math.floor(this.rng.next() * 5)) * bossScale * birthLoot * (1 + fortuneBonusPct / 200)));
                state.inventory['resource.spirit_stone'] = (state.inventory['resource.spirit_stone'] ?? 0) + spiritStones;
                const cultivationReward = requiredTuViV140(state.realm.maxRealmOrder) * (isBoss ? 0.005 : 0.0005);
                const cultivationGain = addTuViV140(state, cultivationReward, state.realm.maxRealmOrder).gained;
                let equipmentDropId;
                let equipmentDropName;
                const baseEquipmentChance = enemy.tags.includes('Boss') ? 60 : enemy.tags.includes('Elite') ? 35 : 0.8;
                const equipmentChance = Math.min(96, baseEquipmentChance * birthLoot * (1 + fortuneBonusPct / 100));
                if (this.registry.equipmentTemplates.size > 0 && this.rng.chance(equipmentChance)) {
                    const early = [...this.registry.equipmentTemplates.values()].filter(template => !template.tags.includes('LegacySetV98') && (!template.tags.includes('SetV116') || isLiveEquipmentSetV12310(template.setId)) && (!template.tags.some(tag => ['NascentSoul', 'PurplePalace', 'GoldenCore'].includes(tag)) || state.realm.maxRealmOrder >= 10));
                    const templates = early.length ? early : [...this.registry.equipmentTemplates.values()].filter(template => !template.tags.includes('LegacySetV98') && (!template.tags.includes('SetV116') || isLiveEquipmentSetV12310(template.setId)));
                    const template = templates[Math.floor(this.rng.next() * templates.length)];
                    const tier = Math.max(0, Math.min(20, Math.floor(state.realm.maxRealmOrder / 5)));
                    const roll = this.rng.next();
                    const quality = isBoss ? (roll > 0.86 ? 'supreme' : roll > 0.38 ? 'high' : 'mid') : (roll > 0.9 ? 'high' : roll > 0.38 ? 'mid' : 'low');
                    const itemSeed = (battleSeed ^ this.rng.nextUint32() ^ 0x7f4a7c15) >>> 0;
                    const item = buildEquipmentInstance(template, tier, quality, 1, { kind: 'field', dungeonId: 'field.hunt', floor: 1, seed: itemSeed }, state.worldTimeYears);
                    addEquipment(state.equipment, item);
                    equipmentDropId = item.id;
                    equipmentDropName = item.name;
                }
                events.push(this.makeEvent(state, events, 'combat', isBoss ? 20 : 8, `Săn yêu: đánh bại ${enemy.name} sau ${battle.duration.toFixed(1)}s; tu vi +${formatNumber(cultivationGain)}, Linh Thạch +${spiritStones}${equipmentDropName ? `, rơi ${equipmentDropName}` : ''}.`, location.id, ['Hunt', 'Victory', ...(isBoss ? ['FieldBoss'] : []), ...enemy.tags], {
                    battleSeed, duration: battle.duration, lootSpiritStone: spiritStones, cultivationGain, fortuneBonusPct, equipmentChancePct: equipmentChance, equipmentDropId: equipmentDropId ?? '', equipmentDropName: equipmentDropName ?? '', enemyId: enemy.id,
                    playerDamage: playerAnalytics.damageDealt, playerHealing: playerAnalytics.healingDone,
                    playerShieldAbsorbed: playerAnalytics.shieldAbsorbed, playerDodges: playerAnalytics.dodges,
                    enemyDamage: enemyAnalytics.damageDealt, signatureSkillId: signature.skillId ?? '', signatureSkillDamage: signature.damage,
                }));
            }
            else {
                const injury = 8 + Math.floor(this.rng.next() * 13);
                state.injury = Math.min(100, state.injury + injury);
                events.push(this.makeEvent(state, events, 'injury', 35, `Săn yêu thất bại trước ${enemy.name}; thương thế +${injury}.`, location.id, ['Hunt', 'Defeat', ...enemy.tags], {
                    battleSeed, injury, enemyId: enemy.id,
                    playerDamage: playerAnalytics.damageDealt, playerHealing: playerAnalytics.healingDone,
                    playerShieldAbsorbed: playerAnalytics.shieldAbsorbed, playerDodges: playerAnalytics.dodges,
                    enemyDamage: enemyAnalytics.damageDealt, signatureSkillId: signature.skillId ?? '', signatureSkillDamage: signature.damage,
                }));
                return 'combatDefeat';
            }
            if (this.shouldStopOnMajor(request, events))
                return 'majorEvent';
        }
        return 'durationComplete';
    }
    runExplore(state, _profile, request, events) {
        const current = locationOf(this.world, state.locationId);
        const years = duration(request.durationYears);
        if (years <= 0)
            return 'nothingToDo';
        if (request.targetLocationId) {
            if (!current.neighbors.includes(request.targetLocationId)) {
                throw new Error(`${request.targetLocationId} is not adjacent to ${current.id}`);
            }
            const destination = locationOf(this.world, request.targetLocationId);
            const realm = this.registry.realm(state.realm.realmId);
            if ((destination.requiredRealmOrder ?? 0) > realm.order) {
                throw new Error(`${destination.name} yêu cầu ít nhất cảnh giới bậc ${destination.requiredRealmOrder}.`);
            }
            const spatialDistance = Math.max(1, destination.spatialDistance ?? 1);
            let travelYears = years;
            let spatialFold = 1;
            if (spatialDistance > 1) {
                const tier = realm.capabilities?.spatialTravelTier ?? 0;
                const spaceDao = state.dao.known['dao.space'];
                const spaceDaoBonus = state.dao.mainDaoId === 'dao.space' && spaceDao ? Math.min(2.5, spaceDao.depth / 34) : 0;
                spatialFold = Math.max(1, 1 + tier * 1.35 + spaceDaoBonus);
                travelYears = Math.max(0.02, years * spatialDistance / spatialFold);
            }
            this.advanceTime(state, travelYears);
            state.locationId = destination.id;
            if (!state.knownLocationIds.includes(destination.id))
                state.knownLocationIds.push(destination.id);
            const spatialText = spatialDistance > 1 ? ` Chiết không gian ×${spatialFold.toFixed(2)}, mất ${travelYears.toFixed(2)} năm.` : '';
            events.push(this.makeEvent(state, events, 'travel', spatialDistance > 1 ? 22 : 12, `Rời ${current.name}, tới ${destination.name}.${spatialText}`, destination.id, ['Travel', 'Discovery', ...(spatialDistance > 1 ? ['SpatialTravel'] : [])], { from: current.id, to: destination.id, spatialDistance, spatialFold, travelYears }));
            return 'durationComplete';
        }
        const unknownNeighbors = current.neighbors.filter(id => !state.knownLocationIds.includes(id));
        this.advanceTime(state, years);
        if (unknownNeighbors.length > 0) {
            const discoveredId = unknownNeighbors[Math.floor(this.rng.next() * unknownNeighbors.length)];
            const discovered = locationOf(this.world, discoveredId);
            state.knownLocationIds.push(discoveredId);
            events.push(this.makeEvent(state, events, 'exploration', 18, `Thám hiểm quanh ${current.name}, phát hiện đường tới ${discovered.name}.`, current.id, ['Explore', 'Discovery'], { discoveredLocationId: discovered.id }));
            return this.shouldStopOnMajor(request, events) ? 'majorEvent' : 'durationComplete';
        }
        const resource = current.resources.length > 0
            ? current.resources[Math.floor(this.rng.next() * current.resources.length)]
            : undefined;
        if (resource && this.rng.chance(55)) {
            const talentYield = gatheringYieldMultiplier(state.inheritedOrigins, resource.resourceId);
            const amount = Math.max(1, Math.floor(resource.baseYieldPerYear * Math.max(0.25, years) * (0.2 + this.rng.next() * 0.4) * talentYield));
            state.inventory[resource.resourceId] = (state.inventory[resource.resourceId] ?? 0) + amount;
            events.push(this.makeEvent(state, events, 'exploration', resource.rarity === 'rare' ? 20 : 8, `Trong lúc thám hiểm, tìm được ${resource.name} ×${amount}.`, current.id, ['Explore', 'ResourceFind', resource.rarity, ...(talentYield > 1 ? ['ReincarnationTalent'] : [])], { resourceId: resource.resourceId, amount, talentYieldMultiplier: talentYield }));
        }
        else {
            events.push(this.makeEvent(state, events, 'exploration', 3, `Thám hiểm ${current.name} nhưng không phát hiện đại sự.`, current.id, ['Explore']));
        }
        return this.shouldStopOnMajor(request, events) ? 'majorEvent' : 'durationComplete';
    }
    runDungeon(state, request, events) {
        const years = duration(request.durationYears);
        if (years <= 0)
            return 'nothingToDo';
        const dungeon = this.world.dungeons[request.dungeonId];
        if (!dungeon)
            throw new Error(`Unknown dungeon: ${request.dungeonId}`);
        if (!state.dungeons.unlockedDungeonIds.includes(dungeon.id)) {
            throw new Error(`Dungeon is not unlocked: ${dungeon.id}`);
        }
        const floor = request.floor ?? 1;
        if (!isDungeonFloorCleared(state.dungeons, dungeon.id, floor)) {
            throw new Error(`Dungeon floor must be first-cleared before farming: ${dungeon.id} floor ${floor}`);
        }
        const occupiedByClone = Object.values(state.dungeons.assignments)
            .some(assignment => assignment.dungeonId === dungeon.id);
        if (occupiedByClone) {
            throw new Error(`Dungeon floor is already being operated by a clone/worker: ${dungeon.id} floor ${floor}`);
        }
        const result = this.dungeonEngine.run(state, dungeon, years, this.rng.nextUint32(), 1, floor, this.registry);
        this.advanceTime(state, years);
        const totalReward = Object.values(result.rewards).reduce((sum, amount) => sum + amount, 0);
        events.push(this.makeEvent(state, events, 'dungeon', dungeon.tier >= 2 ? 12 : 7, `Treo ${dungeon.name} tầng ${floor} ${formatNumber(years)} năm; thu hoạch ${formatNumber(totalReward)} đơn vị tài nguyên${result.equipmentDrops.length > 0 ? `, ${result.equipmentDrops.length} trang bị` : ''}${result.artifactDrops.length > 0 ? `, ${result.artifactDrops.length} pháp bảo` : ''} cho ${dungeon.purpose}.`, state.locationId, ['Dungeon', 'MainBody', dungeon.purpose, ...dungeon.tags], { dungeonId: dungeon.id, floor, years, totalReward, equipmentDrops: result.equipmentDrops.length, artifactDrops: result.artifactDrops.length }));
        return this.shouldStopOnMajor(request, events) ? 'majorEvent' : 'durationComplete';
    }
    advanceTime(state, years) {
        const safeYears = Math.max(0, years);
        state.worldTimeYears += safeYears;
        state.ageYears += safeYears;
        advanceDaoSuyByWorldYearsV127(state.immortal, state.realm.maxRealmOrder, safeYears, state.inheritedOrigins);
    }
    shouldStopOnMajor(request, events) {
        if (!request.stopOnMajorEvent)
            return false;
        const last = events[events.length - 1];
        return Boolean(last && (importanceOf(last.significance) === 'major' || importanceOf(last.significance) === 'critical'));
    }
    makeEvent(state, events, type, significance, message, locationId, tags, data) {
        return {
            id: eventId(this.seed, events.length),
            worldTimeYears: state.worldTimeYears,
            ageYears: state.ageYears,
            type,
            significance,
            message,
            locationId,
            tags,
            data,
        };
    }
    resourceDisplayName(resourceId) {
        for (const location of Object.values(this.world.locations)) {
            const node = location.resources.find(resource => resource.resourceId === resourceId);
            if (node)
                return node.name;
        }
        for (const dungeon of Object.values(this.world.dungeons)) {
            const reward = dungeon.rewards.find(entry => entry.resourceId === resourceId);
            if (reward)
                return reward.name;
        }
        if (resourceId === 'resource.spirit_stone')
            return 'Hạ Phẩm Linh Thạch';
        return resourceId;
    }
    buildSummary(before, after, events, elapsedYears, stopReason) {
        const lines = elapsedYears > 0.001 ? [`Đã trôi qua ${formatNumber(elapsedYears)} năm.`] : [];
        const energyGain = (after.cultivation.tuVi ?? 0) - (before.cultivation.tuVi ?? 0);
        if (Math.abs(energyGain) > 0.001)
            lines.push(`Tu vi ${energyGain >= 0 ? '+' : ''}${formatNumber(energyGain)}.`);
        const techniqueId = after.character.activeTechniqueId;
        const masteryGain = (after.character.techniqueMastery[techniqueId] ?? 0) - (before.character.techniqueMastery[techniqueId] ?? 0);
        if (masteryGain > 0.001)
            lines.push(`Công pháp thuần thục +${masteryGain.toFixed(2)}.`);
        const inventoryChanges = Object.entries(after.inventory)
            .map(([id, value]) => [id, value - (before.inventory[id] ?? 0)])
            .filter(([, delta]) => delta !== 0)
            .slice(0, 4);
        for (const [id, delta] of inventoryChanges)
            lines.push(`${this.resourceDisplayName(id)}: ${delta >= 0 ? '+' : ''}${formatNumber(delta)}.`);
        const notable = events.filter(event => event.significance >= 10);
        if (notable.length > 0)
            lines.push(`Đại/đáng chú ý: ${notable.length}.`);
        if (stopReason !== 'durationComplete')
            lines.push(`Tự dừng: ${stopReason}.`);
        return lines;
    }
}
export class OfflineResolver {
    activityEngineFactory;
    constructor(activityEngineFactory) {
        this.activityEngineFactory = activityEngineFactory;
    }
    resolve(initial, profile, plan, lastSeenUnixMs, nowUnixMs, seed) {
        const elapsedRealHours = Math.max(0, nowUnixMs - lastSeenUnixMs) / 3_600_000;
        const possibleYears = Math.min(plan.maxOfflineYears, elapsedRealHours * Math.max(0, plan.yearsPerRealHour));
        const resolvedWorldYears = Math.min(plan.request.durationYears, possibleYears);
        const request = { ...plan.request, durationYears: resolvedWorldYears };
        const report = this.activityEngineFactory(seed).run(initial, profile, request);
        return { elapsedRealHours, resolvedWorldYears: report.elapsedYears, report };
    }
}
//# sourceMappingURL=activity.js.map