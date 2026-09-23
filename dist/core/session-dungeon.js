import { cloneBuildFoundationV113 } from './build-foundation-v113.js';
import { daoNatureTierForRealmV125, gainBattleDaoPracticeFromCastCountsV125, grantDaoNaturePointV125, practiceContentEfficiencyForGapV125 } from './specialization-skill-progression-v125.js';
import { lockLootItem } from './inventory.js';
import { recordActiveArtifactBattle, recordArtifactOwnershipYears } from './artifact.js';
import { buildDungeonGuardian, canChallengeDungeonFloor, grantDungeonGuardianLoot, guardianMechanicForFloor, highestClearedDungeonFloor, markDungeonFloorCleared } from './dungeon.js';
import { analyzeBattle, topDamageSkill } from './combat-analytics.js';
import { V125_DAO_NATURE_DUNGEON_ID } from '../content/dungeons.js';
import { compareCombatPower } from './personal-power.js';
import { compileCombatEncounterV1, runCompiledCombatEncounterV3 } from './combat-encounter-compiler.js';
import { applyCombatSettlementPolicyV1, dungeonDefeatPolicyV1 } from './combat-settlement-policy.js';
import { ensureCollectionProgressStateV12316 } from './collection-progression-v12316.js';
import { grantResourcePveRewardsV12329, isResourcePveDungeonV12329, resourcePveVirtualBreakIdV12329, resourcePveVirtualMaterialIdV12329 } from './resource-pve-v12329.js';
import { recordEconomyActivityV89, recordFirstClearBoundJadeV89 } from './economy-activity-v89.js';

function mixSeed(rootSeed, index) {
    let x = (rootSeed ^ Math.imul(index + 1, 0x9e3779b1)) | 0;
    x ^= x >>> 16;
    x = Math.imul(x, 0x7feb352d);
    x ^= x >>> 15;
    x = Math.imul(x, 0x846ca68b);
    x ^= x >>> 16;
    return x >>> 0;
}

// V141: dungeon challenge orchestration is isolated from the central session container.
export function challengeSessionDungeonFloorV141(dungeonId, floor = 1) {
        if (!this.stateValue.alive)
            throw new Error('Current life has ended');
        const dungeon = this.world.dungeons[dungeonId];
        if (!dungeon)
            throw new Error(`Unknown dungeon: ${dungeonId}`);
        if (dungeonId === V125_DAO_NATURE_DUNGEON_ID && !cloneBuildFoundationV113(this.stateValue.character.buildFoundation, this.stateValue.character.spiritualRootId).progressionV125?.daoNatureCommitted)
            throw new Error('Phải chọn Đạo Tính tại Trúc Cơ trước khi khiêu chiến Vấn Đạo Đài.');
        const gate = canChallengeDungeonFloor(this.stateValue.dungeons, dungeon, floor);
        if (!gate.ok)
            throw new Error(`Cannot challenge ${dungeonId} floor ${floor}: ${gate.reason}`);
        const spec = dungeon.floors.find(candidate => candidate.floor === floor);
        if (this.stateValue.realm.maxRealmOrder < spec.requiredRealmOrder) {
            throw new Error(`Realm order ${this.stateValue.realm.maxRealmOrder} is too low for ${dungeon.name} floor ${floor}; requires ${spec.requiredRealmOrder}`);
        }
        const guardianBase = this.entityDefinitions[spec.guardianEntityId];
        if (!guardianBase)
            throw new Error(`Unknown dungeon guardian entity: ${spec.guardianEntityId}`);
        const seed = mixSeed(this.rootSeed ^ 0x4d595df4, this.actionIndexValue);
        const playerCombat = { ...this.personalCombatEntityForState(this.stateValue), id: `${this.profile.combatEntity.id}.dungeon.challenge` };
        const guardian = buildDungeonGuardian(guardianBase, dungeon, floor);
        const readiness = compareCombatPower(playerCombat, guardian);
        const mechanic = guardianMechanicForFloor(dungeon, floor);
        const encounter = compileCombatEncounterV1({
            encounterId: `dungeon.${dungeonId}.${floor}.${seed}`,
            activity: 'dungeon',
            seed,
            entities: [playerCombat, guardian],
            mode: 'realtime',
            maxDuration: 120,
            applyPacing: true,
            metadata: { dungeonId, floor, guardianId: guardian.id },
        });
        const kernel = runCompiledCombatEncounterV3(encounter, this.registry);
        const battle = kernel.battle;
        const analytics = analyzeBattle(battle);
        const playerAnalytics = analytics.combatants[playerCombat.id];
        const guardianAnalytics = analytics.combatants[guardian.id];
        const signature = topDamageSkill(analytics, playerCombat.id);
        const phaseTransitions = battle.logs
            .filter(log => log.type === 'phase' && log.actorId === guardian.id)
            .map(log => ({ id: String(log.data?.phaseId ?? ''), name: String(log.data?.phaseName ?? 'Phase'), time: log.time, hpPct: Number(log.data?.hpPct ?? 0) }));
        const counterWindowName = new Map((guardian.phases ?? []).flatMap(phase => phase.counterWindow ? [[phase.counterWindow.id, phase.counterWindow.name]] : []));
        const counterWindowSuccesses = battle.logs
            .filter(log => log.type === 'counterWindow' && log.targetId === guardian.id && log.data?.success === true)
            .map(log => { const id = String(log.data?.counterWindowId ?? ''); return { id, name: String(log.data?.counterWindowName ?? counterWindowName.get(id) ?? id), time: log.time, skillId: log.skillId }; });
        const counterWindowFailures = battle.logs
            .filter(log => log.type === 'counterWindow' && log.actorId === guardian.id && log.data?.failure === true)
            .map(log => { const id = String(log.data?.counterWindowId ?? ''); return { id, name: String(log.data?.counterWindowName ?? counterWindowName.get(id) ?? id), time: log.time }; });
        const combatTimeline = battle.logs
            .filter(log => ['battleStart', 'castStart', 'damage', 'heal', 'dodge', 'shieldBreak', 'phase', 'counterWindow', 'status', 'death', 'battleEnd'].includes(log.type))
            .filter(log => log.type !== 'counterWindow' || log.data?.success === true || log.data?.opens === true || log.data?.failure === true)
            .slice(0, 96)
            .map(log => ({ time: log.time, type: log.type, message: log.message }));
        const castCounts = {
            ...(kernel.combatResult.summary.castCountsByActor[playerCombat.id] ?? {}),
        };
        const skillPractice = gainBattleDaoPracticeFromCastCountsV125(this.stateValue.character, castCounts, [...this.registry.skills.values()], practiceContentEfficiencyForGapV125(this.stateValue.realm.maxRealmOrder - spec.requiredRealmOrder));
        const won = battle.winnerId === playerCombat.id;
        const firstClear = won && floor > highestClearedDungeonFloor(this.stateValue.dungeons, dungeonId);
        const upsetVictory = won && readiness.ratio < 0.88;
        const extremeUpset = won && readiness.ratio < 0.67;
        const elapsedYears = Math.min(this.remainingLifeYears(), 0.02);
        this.stateValue.worldTimeYears += elapsedYears;
        this.stateValue.ageYears += elapsedYears;
        const challengeWorldEvents = this.syncWorldState(this.stateValue, seed ^ 0x6a09e667);
        this.historyValue.appendMany(challengeWorldEvents);
        recordArtifactOwnershipYears(this.stateValue.artifacts, elapsedYears);
        recordActiveArtifactBattle(this.stateValue.artifacts, won, this.stateValue.worldTimeYears, guardian.name);
        let rewards = {};
        let equipmentDropIds = [];
        let equipmentFragmentDrops = [];
        let artifactDropIds = [];
        let battleInsightGain = 0;
        let daoNaturePointGain = 0;
        let daoNatureXpGain = 0;
        let milestoneLootProtected = false;
        let resourcePve;
        let economyAwards = [];
        let combatSettlement;
        if (won) {
            if (firstClear)
                markDungeonFloorCleared(this.stateValue.dungeons, dungeonId, floor);
            const beforeEquipmentIds = new Set(this.stateValue.equipment.items.map(item => item.id));
            const beforeArtifactIds = new Set(this.stateValue.artifacts.items.map(item => item.id));
            const loot = grantDungeonGuardianLoot(this.stateValue, dungeon, floor, this.registry, seed ^ 0xa5a5a5a5, firstClear, this.currentLifeValue.lifeId);
            rewards = loot.rewards;
            equipmentDropIds = loot.equipmentDrops.map(item => item.id);
            equipmentFragmentDrops = loot.equipmentFragmentDrops ?? [];
            artifactDropIds = loot.artifactDrops.map(item => item.id);
            if (isResourcePveDungeonV12329(dungeonId)) {
                const collectionState = ensureCollectionProgressStateV12316(this.stateValue);
                resourcePve = grantResourcePveRewardsV12329(collectionState, this.stateValue.inventory, dungeonId, floor, firstClear, seed);
                if (resourcePve) {
                    rewards = { ...rewards, [resourcePveVirtualMaterialIdV12329(resourcePve.category)]: resourcePve.material };
                    if (resourcePve.breakthrough > 0)
                        rewards[resourcePveVirtualBreakIdV12329(resourcePve.category)] = resourcePve.breakthrough;
                }
            }
            const collectionStateV89 = ensureCollectionProgressStateV12316(this.stateValue);
            economyAwards.push(...recordEconomyActivityV89(collectionStateV89, isResourcePveDungeonV12329(dungeonId) ? 'resourceClears' : 'bossWins', 1).awards);
            if (firstClear) {
                const first = recordFirstClearBoundJadeV89(collectionStateV89, `${dungeonId}.${floor}`);
                if (first.awarded)
                    economyAwards.push({ id: `first-clear.${dungeonId}.${floor}`, label: 'Thưởng công phá lần đầu', boundJade: first.boundJade });
            }
            // First-clear loot in the vertical slice is a milestone trophy. Protect it from auto-loot
            // so the player gets a chance to inspect/equip it before any cleanup policy can act.
            if (firstClear && dungeon.tier <= 2 && floor <= 2 && (equipmentDropIds.length > 0 || artifactDropIds.length > 0)) {
                for (const id of [...equipmentDropIds, ...artifactDropIds])
                    lockLootItem(this.stateValue.lootManagement, id);
                milestoneLootProtected = true;
            }
            const processed = this.processNewLoot(this.stateValue, beforeEquipmentIds, beforeArtifactIds);
            this.appendLootPolicyEvent(processed, `loot.dungeon.challenge.${seed}`);
            if (dungeonId === V125_DAO_NATURE_DUNGEON_ID) {
                const tierId = daoNatureTierForRealmV125(spec.requiredRealmOrder);
                if (firstClear && tierId)
                    daoNaturePointGain += grantDaoNaturePointV125(this.stateValue.character, tierId, 4);
                const converted = this.consumeDaoNatureCultivationInventoryV125();
                daoNatureXpGain += converted.xp;
                daoNaturePointGain += converted.points;
            }
        }
        else {
            combatSettlement = applyCombatSettlementPolicyV1({
                state: this.stateValue,
                policy: dungeonDefeatPolicyV1(dungeonId, floor),
                applyCanonicalDeathPenalty: context => this.applyCombatDeathPenalty(context),
            });
            // V144: defeat never advances retired V103/V119 technique mastery.
        }
        // V144: phase reading still feeds combat review/skill practice elsewhere; legacy manual mastery is inert.
        const equipmentFragmentText = equipmentFragmentDrops.length ? ` Thu ${equipmentFragmentDrops.map(drop => drop.kind === 'setFragmentV142' ? `Tàn Ấn ${drop.setName} +${drop.amount}` : `Mảnh Trang Bị ${drop.rankName} +${drop.amount}`).join(' · ')}.` : '';
        const event = {
            id: `dungeon.challenge.${seed}.${dungeonId}.${floor}`,
            worldTimeYears: this.stateValue.worldTimeYears,
            ageYears: this.stateValue.ageYears,
            type: 'dungeon',
            significance: won ? (firstClear ? Math.min(65, 22 + floor * 6 + dungeon.tier * 4) : 10 + floor * 2) + (extremeUpset ? 16 : upsetVictory ? 8 : 0) : 18 + floor * 2,
            message: won
                ? `${firstClear ? 'Lần đầu công phá' : 'Tái chiến'} ${dungeon.name} tầng ${floor}; đánh bại ${guardianBase.name} sau ${battle.duration.toFixed(1)}s.${equipmentFragmentText}${resourcePve ? ` Thu ${resourcePve.material} ${resourcePve.materialName}${resourcePve.breakthrough > 0 ? ` và ${resourcePve.breakthrough} ${resourcePve.breakthroughName}` : ''}; không rơi Mảnh Riêng.` : ''}${upsetVictory ? ` Nghịch phạt đối thủ có Chiến Lực cao hơn (${readiness.ratio.toFixed(2)}×).` : ''}${economyAwards.length ? ` ${economyAwards.map(x => `${x.label}: Tiên Ngọc Khóa +${x.boundJade}`).join(' · ')}.` : ''}`
                : `Khiêu chiến ${dungeon.name} tầng ${floor} thất bại trước ${guardianBase.name}.`,
            locationId: this.stateValue.locationId,
            actorId: playerCombat.id,
            targetId: guardianBase.id,
            tags: ['Dungeon', 'Challenge', won ? 'Victory' : 'Defeat', ...(firstClear ? ['FirstClear'] : []), ...(upsetVictory ? ['NghịchMệnh', 'PersonalUpset'] : []), ...(extremeUpset ? ['Record'] : []), `Floor${floor}`, ...dungeon.tags],
            data: {
                dungeonId, floor, guardianId: guardianBase.id, battleSeed: seed, duration: battle.duration,
                firstClear, playerDamage: playerAnalytics.damageDealt, playerHealing: playerAnalytics.healingDone,
                playerDodges: playerAnalytics.dodges, guardianDamage: guardianAnalytics.damageDealt,
                signatureSkillId: signature.skillId ?? '', signatureSkillDamage: signature.damage, readinessRatio: readiness.ratio, personalUpset: upsetVictory,
                equipmentDrops: equipmentDropIds.length, equipmentFragmentDrops: equipmentFragmentDrops.reduce((sum, drop) => sum + Number(drop.amount ?? 0), 0), artifactDrops: artifactDropIds.length, battleInsightGain, skillPracticeXp: skillPractice.reduce((a, x) => a + x.xpGain, 0), daoNaturePointGain, daoNatureXpGain, milestoneLootProtected, resourcePveCategory: resourcePve?.category ?? '', resourcePveMaterial: resourcePve?.material ?? 0, resourcePveBreakthrough: resourcePve?.breakthrough ?? 0, boundJadeAward: economyAwards.reduce((a, x) => a + x.boundJade, 0), guardianMechanicId: mechanic?.id ?? '', phaseTransitions: phaseTransitions.length, counterWindowSuccesses: counterWindowSuccesses.length, counterWindowFailures: counterWindowFailures.length,
            },
        };
        this.historyValue.append(event);
        this.ensureArtifactOwnerLife(this.stateValue.artifacts);
        this.applyNaturalDeathToState(seed);
        this.actionIndexValue += 1;
        return {
            seed, dungeonId, floor, guardianId: guardianBase.id, guardianName: guardianBase.name,
            won, firstClear, elapsedYears, battleDuration: battle.duration, rewards,
            equipmentDropIds, equipmentFragmentDrops, artifactDropIds, signatureSkillId: signature.skillId, battleInsightGain, skillPractice, daoNaturePointGain, daoNatureXpGain, milestoneLootProtected, readiness, mechanic, phaseTransitions, counterWindowSuccesses, counterWindowFailures, combatTimeline, combatResult: kernel.combatResult, combatSettlement, resourcePve, economyAwards, event,
            state: this.state,
        };
    
}
