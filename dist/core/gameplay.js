import { artifactQualityName, artifactTierName } from './artifact.js';
import { ARTIFACTS_V88, RELICS_V88, artifactGradeLabelV88 } from './artifact-v88.js';
import { CANONICAL_EQUIPMENT_SLOTS, EQUIPMENT_SLOT_LABELS, EQUIPMENT_ANTI_DOWNGRADE_RESOURCE, EQUIPMENT_ENHANCE_ESSENCE_RESOURCE, EQUIPMENT_MAX_ENHANCEMENT, EQUIPMENT_TRANSFER_GEM_RESOURCE, effectiveEquipmentStats, enhancementBonusPct, enhancementDowngradeChancePct, enhancementEssenceCost, enhancementSuccessChancePct, equipmentAffixLinesV114, equipmentGradeIndex, equipmentGradeName, equipmentPower, equipmentQualityName, equipmentSlotGroup, equipmentTierName, equipmentTraitName, equippedItems } from './equipment.js';
import { EQUIPMENT_ATTIRE_SLOTS_V142, EQUIPMENT_JEWELRY_SLOTS_V142, EQUIPMENT_MAX_ENHANCEMENT_V142, EQUIPMENT_SET_CATALOG_V142, EQUIPMENT_SLOT_LABELS_V142, EQUIPMENT_SLOTS_V142, equipmentRankIndexFromRealmOrderV142, equipmentRankNameV142, equipmentSetDefinitionV142 } from './equipment-v142.js';
const EQUIPMENT_FRAGMENT_CRAFT_COST_UI_V142 = 50;
const EQUIPMENT_FRAGMENT_REFINE_RATIO_UI_V142 = 3;
const EQUIPMENT_SET_ENGRAVE_COST_UI_V142 = 50;
import { LIVE_EQUIPMENT_SET_CATALOG_V12310, equipmentSetCatalogEntryV116, equipmentSetSlotsV116, isEquipmentSetUnlockedV116, isLiveEquipmentSetV12310 } from './equipment-set-v116.js';
import { EQUIPMENT_AFFIX_DEFINITIONS_V114, EQUIPMENT_AFFIX_MAX_ROLL_PCT_V114, equipmentAffixDefinitionV114, formatEquipmentAffixV114 } from './equipment-affix-v114.js';
import { AFFIX_FAMILY_CHANGE_RESOURCE_NAME_V115, AFFIX_FAMILY_CHANGE_RESOURCE_V115, DAO_INSCRIPTION_FRAGMENT_RESOURCE_NAME_V115, DAO_INSCRIPTION_FRAGMENT_RESOURCE_V115, daoEngraveCostV115, reforgeAffixCostV115, refineAffixCostV115 } from './equipment-reforge-v115.js';
import { EQUIPMENT_GEM_BLANK_RESOURCE_NAME_V128, EQUIPMENT_GEM_BLANK_RESOURCE_V128, V128_DAO_INSCRIPTIONS, V128_EQUIPMENT_GEMS, daoInscriptionDefinitionV128, equipmentGemEffectV128, equipmentGemSocketCountV128, equipmentGemUpgradeCostV128 } from './equipment-inscription-gem-v128.js';
import { highestClearedDungeonFloor } from './dungeon.js';
import { V122_FORGE_DUNGEON_ID, V122_TARGET_SET_DUNGEONS } from './loot-economy-v122.js';
import { categoryDisplayName, reincarnationCost } from './life.js';
import { availableOrientations } from './reincarnation.js';
import { normalizeGuidanceAutomationPolicy } from './guidance.js';
import { evaluateEarlyGameSlice } from './early-game.js';
import { projectLifeLegacy } from './reincarnation-loop.js';
import { analyzePlaytestTelemetry } from './playtest-telemetry.js';
import { lifeArchetypeProfile } from './reincarnation-diversity.js';
import { auditAdventureState } from './save-stability.js';
import { tacticalIdentity } from './combat-roles.js';
import { birthFamilyDefinitions } from './birth-randomness.js';
import './realtime-balance.js';
import { bloodlineDefinition, bloodlineIds, bundleSummaryLines } from './birth-origins-v101.js';
import { economyMaterialDefinition, heavenlyTreasureDefinitions } from './economy-v111.js';
import { BATTLE_DAO_IDS, BATTLE_DAO_NAMES } from './build-foundation-v113.js';
import { battleDaoV2SkillDescriptionV79, skillCombatExplanationV125 } from './specialization-skill-progression-v125.js';
import { resourcePveDefinitionV12329, resourcePveFloorRewardPreviewV12329, resourcePveFarmRewardPreviewV109 } from './resource-pve-v12329.js';
import { buildBuildOverviewV105, buildGameplayClarityV102, buildProgressionGuideV103, buildSessionLoopV104 } from './player-experience-v105.js';
import { globalBuildBalanceSummaryV108 } from './global-build-balance-v108.js';
import { mortalProgressionSummaryV113 } from './progression-closure-v113.js';
import { immortalProgressionSummaryV114 } from './immortal-progression-v114.js';
import { buildProgressionSummaryV115 } from './build-progression-v115.js';
import { lateGameEconomySummaryV140 } from './late-game-economy-v140.js';
import { contentLoopSummaryV117 } from './content-loop-v117.js';
import { pveProgressionSummaryV118 } from './pve-progression-v118.js';
import { pvpProductionSummaryV119 } from './pvp-production-v119.js';
import { dispatchGameplayCommand } from './gameplay-dispatch.js';
import { buildGameplayFlow, buildMyriadLivesV141 } from './gameplay-flow.js';

const deadLifePlanningCommandTypes = new Set([
    'equip', 'activateArtifact', 'deactivateArtifact', 'setSkillActive', 'setLoadout', 'applyLoadoutPreset', 'saveCombatLoadout', 'applySavedCombatLoadout', 'cloneCombatLoadout',
    'setManifestations', 'setDaoDomain',
    'guidanceEnabled', 'configureAutomation', 'setOfflineRoutine', 'offlineReturn',
    'settleLife', 'reincarnate', 'spendReincarnationTalent', 'setMajorTalents',
]);
const resourceLabels = {
    'resource.spirit_stone': 'Hạ Phẩm Linh Thạch',
    'resource.spirit_herb': 'Tụ Linh Thảo',
    'resource.black_iron_ore': 'Huyền Thiết Khoáng',
    'resource.cultivation_essence': 'Tu Vi Tinh Hoa',
    'resource.alchemy_essence': 'Dược Tính Tinh Hoa',
    'resource.forging_essence': 'Khí Luyện Tinh Hoa',
    'resource.enhancement_protection_talisman': 'Bùa Chống Tụt',
    'resource.enhancement_transfer_gem': 'Ngọc Chuyển Cường Hóa',
    'resource.affix_family_change_core': 'Chuyển Tính Thạch',
    'resource.dao_inscription_fragment': 'Tàn Văn',
    'resource.artifact_dust': 'Bảo Khí Tàn Tinh',
    'resource.beast_essence': 'Yêu Thú Tinh Hoa',
    'resource.talisman_essence': 'Phù Văn Tinh Hoa',
    'resource.soul_essence': 'Thần Hồn Tinh Hoa',
    'resource.void_crystal': 'Hư Không Tinh',
    'resource.space_mark_fragment': 'Không Gian Tắc Phiến',
    'resource.integration_essence': 'Hợp Nguyên Tinh Hoa',
    'resource.unity_fragment': 'Tam Nguyên Đồng Văn',
    'resource.civilization_insight': 'Nhận Thức Văn Minh',
    'resource.immortal_tribute_seal': 'Tiên Vực Cống Ấn',
    'resource.pill.cultivation': 'Tu Vi Đan',
    'resource.bloodline_essence': 'Huyết Tinh',
    'resource.body_essence': 'Thể Phách Tinh Hoa',
    'resource.bloodline_protection': 'Hộ Huyết',
    'resource.technique_insight': 'Bí Thuật Tàn Trang',
};
function resourceName(id) {
    const economy = economyMaterialDefinition(id);
    if (economy)
        return economy.name;
    const treasure = heavenlyTreasureDefinitions[id];
    if (treasure)
        return treasure.name;
    return resourceLabels[id] ?? id.replace(/^resource\./, '').replaceAll('_', ' ');
}
const EQUIPMENT_AFFIX_FAMILY_LABELS_V13821 = {
    core: 'Cốt Lõi', combat: 'Chiến Đấu', element: 'Ngũ Hành', dao: 'Bản Đạo', rootOrigin: 'Căn Nguyên', skill: 'Kỹ Năng', mechanic: 'Cơ Chế',
};
const LIVE_EQUIPMENT_AFFIX_FAMILIES_V13821 = [...new Set(EQUIPMENT_AFFIX_DEFINITIONS_V114.filter(x => x.live).map(x => x.family))];
function availableReforgeFamiliesV13821(item, index) {
    const affixes = item.affixes ?? [];
    const current = affixes[index];
    if (!current)
        return [];
    const usedGroups = new Set(affixes.filter((_, i) => i !== index).map(x => x.exclusiveGroup));
    const buildCount = affixes.filter((x, i) => i !== index && x.buildAffix).length;
    const maxBuild = item.setId?.startsWith('set.v116.') ? 2 : 3;
    return LIVE_EQUIPMENT_AFFIX_FAMILIES_V13821.filter(family => EQUIPMENT_AFFIX_DEFINITIONS_V114.some(def => def.live && def.family === family && def.id !== current.id && !usedGroups.has(def.exclusiveGroup) && (!def.buildAffix || buildCount < maxBuild)));
}
export class GameplayFacade {
    session;
    registry;
    world;
    lastCombatReviewValue;
    constructor(session, registry, world) {
        this.session = session;
        this.registry = registry;
        this.world = world;
    }
    dashboard() {
        const state = this.session.state;
        const realm = this.registry.realm(state.realm.realmId);
        const location = this.world.locations[state.locationId];
        const technique = this.registry.technique(state.character.activeTechniqueId);
        const power = this.session.personalPowerSummary();
        const cultivation = this.session.cultivationSummaryV140();
        const hints = [];
        if (cultivation.transition === 'ascend' && cultivation.ready) hints.push(`Tu Vi đã viên mãn; có thể Thăng Cảnh tới ${cultivation.nextRealm}.`);
        else if (cultivation.transition === 'tribulation' && cultivation.ready) hints.push('Tu Vi đã viên mãn; cửa Thiên Kiếp đang chờ.');
        else hints.push(`Tự Tu +${cultivation.finalTuViPer15s.toLocaleString('vi-VN')} Tu Vi / 15s.`);
        if (cultivation.retreat.bankHours > 0) hints.push(`Bế Quan còn ${cultivation.retreat.bankHours.toFixed(1)}h trong ngân hàng.`);
        if ((state.injury ?? 0) > 20) hints.push(`Thương Thế ${Number(state.injury).toFixed(0)}/100; Trị Thương Đan hoặc thời gian sẽ hồi phục.`);
        return {
            title: `${this.session.currentLife.lifeId} · ${this.session.currentLife.birth.family}`,
            worldYear: state.worldTimeYears, ageYears: state.ageYears, lifespanYears: state.lifespanYears, alive: state.alive,
            location: location?.name ?? state.locationId, realm: realm.name, realmOrder: state.realm.maxRealmOrder,
            cultivation, injury: Math.max(0, Number(state.injury)||0), activityHints: hints.slice(0,4),
            majorEvents: this.session.notableHistory(4).map(event=>event.message), activeTechnique: technique.name,
            activeSkills: state.character.activeSkillIds.map(id=>this.registry.skill(id).name), guidance:{enabled:state.guidance.enabled,risk:state.guidance.risk},
            personalPower:{score:power.score,identity:power.identity,bottleneck:power.bottleneckAxis},
        };
    }

    overview() {
        const state = this.session.state;
        const life = this.session.currentLife;
        const dashboard = this.dashboard();
        const cultivation = dashboard.cultivation;
        const power = this.session.personalPowerSummary();
        const hunt = this.session.endlessHuntSummary();
        const actions = [];
        if (!state.alive) {
            const settled = Boolean(this.settlement());
            actions.push({ key:settled?'reincarnate':'settle', label:settled?'Chuẩn bị Luân Hồi':'Kết toán đời này', command:settled?'luanhoian':'kettoan', priority:'primary' });
        } else if (cultivation.ready && cultivation.transition === 'tribulation') {
            actions.push({key:'tribulation',label:'Dẫn Thiên Kiếp',command:'thienkiep 1',priority:'primary',reason:'Tu Vi đã viên mãn tại cửa Thiên Kiếp.'});
        } else if (cultivation.ready && cultivation.transition === 'ascend') {
            actions.push({key:'ascend',label:`Thăng Cảnh ${cultivation.nextRealm}`,command:'thangcanh',priority:'primary',reason:'Tu Vi đã viên mãn.'});
        } else {
            actions.push({key:'retreat',label:'Bế Quan',command:'bequan 3',priority:'primary',reason:`Tu Vi ${cultivation.progressPct.toFixed(1)}%.`});
        }
        if (state.realm.maxRealmOrder >= 1) actions.push({key:'huntFloor',label:`Săn Yêu · ${hunt.currentMap.zoneName} tầng ${hunt.currentZoneFloor}`,command:'san',priority:'normal'});
        if (state.realm.maxRealmOrder >= 1) actions.push({key:'build',label:'Kiểm tra Build',command:'build',priority:'normal',reason:`Nút thắt: ${power.bottleneckAxis}.`});
        return { schema:'player-overview.v140', life:{lifeNumber:life.lifeNumber,lifeId:life.lifeId,realm:dashboard.realm,realmOrder:dashboard.realmOrder,ageYears:dashboard.ageYears,lifespanYears:dashboard.lifespanYears,alive:dashboard.alive,location:dashboard.location,worldYear:dashboard.worldYear}, cultivation, injury:dashboard.injury,
          build:{score:power.score,identity:power.identity,strongestAxis:power.strongestAxis,bottleneckAxis:power.bottleneckAxis,aiProfile:state.character.combatAiProfile?.name??'AI mặc định',activeSkillCount:state.character.activeSkillIds.filter(id=>!id.startsWith('skill.class.')).length,activeArtifactCount:state.artifacts.activeIds.length},
          endlessHunt:{selectedFloor:hunt.selectedFloor,highestUnlockedFloor:hunt.highestUnlockedFloor,highestClearedFloor:hunt.highestClearedFloor,playerPower:hunt.playerPower,monsterName:hunt.monster.name,monsterGrade:hunt.monster.grade,monsterPower:hunt.monster.power},
          potential:{unspent:this.session.lifePotentialSummary().unspent,earned:this.session.lifePotentialSummary().lifetimeEarned}, actions:actions.slice(0,5), navigation:[...(state.realm.maxRealmOrder>=1?[{key:'build',label:'Build',command:'build'}]:[]),{key:'flow',label:'Hành động',command:'menu'}] };
    }

    bossIntel(dungeonId, floor) {
        const report = this.session.dungeonReadiness(dungeonId, floor);
        const dungeonName = this.world.dungeons[dungeonId]?.name ?? dungeonId;
        const signalNames = { evasive: 'né/cướp nhịp', shielding: 'khiên', healing: 'hồi phục', control: 'khống chế', burst: 'burst', multiHit: 'multi-hit' };
        const signals = Object.entries(report.matchup.signals).filter(([, active]) => active).map(([id]) => signalNames[id] ?? id);
        const authoredById = new Map(report.phases.map(phase => [phase.id, phase]));
        return {
            schema: 'boss-intel.v1', dungeonId, dungeonName, floor, guardianName: report.guardianName,
            readiness: { bandLabel: report.bandLabel, ratio: report.ratio, playerScore: report.player.score, enemyScore: report.enemy.score },
            mechanic: report.mechanic ? { name: report.mechanic.name, description: report.mechanic.description, counterHint: report.mechanic.counterHint } : undefined,
            signals,
            currentLoadout: { coveragePct: report.matchup.currentLoadoutCoverage.scorePct, covered: [...report.matchup.currentLoadoutCoverage.covered], missing: [...report.matchup.currentLoadoutCoverage.missing] },
            recommendedPreset: { name: report.matchup.recommendedPreset.name, style: report.matchup.recommendedPreset.style, coveragePct: report.matchup.recommendedPreset.coveragePct, reason: report.matchup.recommendedPreset.reason },
            phases: report.matchup.phasePlans.map(plan => {
                const authored = authoredById.get(plan.id);
                return { index: plan.phaseIndex, id: plan.id, name: plan.name, hpBelowPct: plan.hpBelowPct, description: authored?.description, counterHint: authored?.counterHint, currentCoveragePct: plan.currentLoadoutCoverage.scorePct, missing: [...plan.currentLoadoutCoverage.missing], recommendedPreset: plan.recommendedPreset.name, recommendedCoveragePct: plan.recommendedPreset.coveragePct, counterWindow: plan.counterWindow ? { ...plan.counterWindow } : undefined };
            }),
            skills: report.matchup.skillRecommendations.map(item => ({ id: item.id, name: item.name, active: item.active, reason: item.reason })),
            artifacts: report.matchup.artifactRecommendations.map(item => ({ id: item.id, name: item.name, active: item.active, reason: item.reason })),
            diagnosis: report.diagnosis, recommendations: [...report.recommendations],
        };
    }
    buildSheet() {
        const state = this.session.state;
        const power = this.session.personalPowerSummary();
        const skills = state.character.activeSkillIds.map(id => {
            const definition = this.registry.skill(id);
            const identity = tacticalIdentity(definition, this.registry);
            return { id, name: definition.name, roles: identity.roles, setupMarks: identity.setupMarks, finisherMarks: identity.finisherMarks };
        });
        const roleCoverage = [...new Set(skills.flatMap(skill => skill.roles))];
        const equipped = this.equipmentEquippedV129().map(item => ({ slot: item.slot, id: item.id, name: item.name, tier: item.tier, quality: item.quality, role: item.role }));
        const collection = state.collectionV12316;
        const artifactDefs = new Map(ARTIFACTS_V88.map(item => [item.id, item]));
        const relicDefs = new Map(RELICS_V88.map(item => [item.id, item]));
        const activeArtifacts = (collection?.activeArtifactIds ?? []).map(id => {
            const def = artifactDefs.get(id), progress = collection?.items?.[id];
            return def && progress?.owned ? { id, name: def.name, role: def.role, refinementLevel: Math.max(1, Math.min(100, progress.level ?? 1)), grade: artifactGradeLabelV88(progress), skill: def.skill.name } : undefined;
        }).filter(Boolean);
        const activeRelicId = collection?.economyV12325?.activeRelicId;
        const activeRelicDef = activeRelicId ? relicDefs.get(activeRelicId) : undefined;
        const activeRelicProgress = activeRelicId ? collection?.economyV12325?.extraItems?.[activeRelicId] : undefined;
        const activeRelic = activeRelicDef && activeRelicProgress?.owned ? { id: activeRelicId, name: activeRelicDef.name, role: activeRelicDef.role, grade: artifactGradeLabelV88(activeRelicProgress), ruleName: activeRelicDef.ruleName } : undefined;
        const aiName = state.character.combatAiProfile?.name ?? 'AI mặc định';
        return {
            schema: 'build-sheet.v1', v107: { schema: 'build-sheet.v107', artifactRuntime: 'artifact.production.v88', canonicalArtifactState: 'collectionV12316.activeArtifactIds', canonicalRelicState: 'collectionV12316.economyV12325.activeRelicId' }, score: power.score, identity: power.identity, strongestAxis: power.strongestAxis, bottleneckAxis: power.bottleneckAxis,
            axes: { offense: power.breakdown.offense, survival: power.breakdown.survival, resource: power.breakdown.resource, tempo: power.breakdown.tempo, control: power.breakdown.resource, mobility: power.breakdown.tempo },
            aiProfile: aiName, skills, roleCoverage,
            equipment: equipped, artifacts: activeArtifacts, relic: activeRelic, artifactRuntime: 'artifact.production.v88',
            tacticalPresets: this.loadoutPresets().map(preset => ({ id: preset.id, name: preset.name, style: preset.style, selected: preset.aiProfile.name === aiName, strengths: [...preset.strengths], tradeoff: preset.tradeoff, skillNames: preset.skillIds.map(id => this.registry.skill(id).name) })),
            savedLoadouts: this.savedLoadouts().map(loadout => ({ id: loadout.id, name: loadout.name, skillCount: loadout.skillIds.length, artifactCount: loadout.artifactIds.length, hasRelic: Boolean(loadout.relicId), equipmentCount: Object.keys(loadout.equipmentIds).length })),
        };
    }

    playerExperienceV105(nowUnixMs = Date.now()) {
        const state = this.session.state;
        const overview = this.overview();
        const power = this.session.personalPowerSummary();
        const build = this.buildSheet();
        const character = this.character();
        const specialization = this.session.specializationSkillSummaryV125();
        const roots = this.session.spiritualRootSummaryV131();
        const collection = this.session.collectionSummaryV12316(nowUnixMs);
        const potential = this.session.lifePotentialSummary();
        const soul = this.soul();
        const battleDao = state.character.buildFoundation?.battleDao;
        const canonicalDaoId = battleDao?.committed && battleDao.mainDaoId ? `dao.${battleDao.mainDaoId}` : undefined;
        const daoProgress = canonicalDaoId ? state.dao?.known?.[canonicalDaoId] : undefined;
        const dao = { awakened: Boolean(state.dao?.awakened), mainDaoId: canonicalDaoId, mainDaoName: canonicalDaoId ? this.registry.dao(canonicalDaoId)?.name : undefined, selected: daoProgress ? { ...structuredClone(daoProgress) } : undefined, domain: { ...structuredClone(state.dao?.domain ?? {}) } };
        let pvp;
        if (state.realm.maxRealmOrder >= 18) {
            try { pvp = this.pvpV91(nowUnixMs); } catch { pvp = undefined; }
        }
        const base = { order: state.realm.maxRealmOrder, alive: state.alive, overview, power, build, character, specialization, roots, collection, potential, soul, dao, pvp };
        const buildOverview = buildBuildOverviewV105({ ...base, entity: this.session.personalCombatEntity() });
        const integration = this.session.integrationSummary();
        const greatVehicle = this.session.greatVehicleSummary();
        const v113 = mortalProgressionSummaryV113(state, state.dungeons, integration, greatVehicle);
        const v114 = immortalProgressionSummaryV114(state, state.dungeons);
        const v115 = buildProgressionSummaryV115({ state, buildOverview, integration, greatVehicle });
        const v140LateEconomy = lateGameEconomySummaryV140(state);
        const v117 = contentLoopSummaryV117(state);
        const v118 = pveProgressionSummaryV118(state, this.world.dungeons, (dungeonId, floor) => this.session.dungeonReadiness(dungeonId, floor));
        const v119 = pvpProductionSummaryV119(pvp);
        const shared = { ...base, buildOverview, progressionClosure: v113, immortalProgression: v114, lateGameEconomy: v140LateEconomy, contentLoop: v117, pveProgression: v118 };
        const clarity = buildGameplayClarityV102(shared);
        const progression = buildProgressionGuideV103({ order: state.realm.maxRealmOrder, currentRealmName: this.registry.realm(state.realm.realmId).name, realmNameAtOrder: (order) => [...this.registry.realms.values()].find(r => r.order === order)?.name });
        const sessionLoop = buildSessionLoopV104(shared);
        return { schema: 'player-experience.v105', revision: 'alpha.23.75', clarity, progression, sessionLoop, buildOverview, v108: globalBuildBalanceSummaryV108(), v113, v114, v115, v116: v140LateEconomy, v117, v118, v119 };
    }
    earlyGameSlice() {
        const report = evaluateEarlyGameSlice(this.session.state, this.session.currentLife, this.world, this.session.availableContentEvents(8));
        return {
            schema: 'early-game-slice.v1',
            stage: { id: report.stage, name: report.stageName, targetAge: report.targetAge, age: report.age, pace: report.pace },
            progressPct: report.progressPct,
            decisionDensity: report.decisionDensity,
            checkpoints: report.checkpoints.map(item => ({ id: item.id, label: item.label, complete: item.complete, note: item.reason })),
            recommendations: [...report.recommendedActions],
        };
    }
    automationPolicy() {
        const guidance = this.session.guidanceState();
        const policy = normalizeGuidanceAutomationPolicy(guidance.automationPolicy);
        const dungeonNames = policy.blockedDungeonIds.map(id => this.world.dungeons[id]?.name ?? id);
        return {
            schema: 'automation-policy.v1', enabled: guidance.enabled,
            allowedActivities: [...policy.allowedActivityTypes], blockedDungeons: dungeonNames,
            thresholds: { maxInjury: policy.maxInjury, maxConsecutiveSameAction: policy.maxConsecutiveSameAction },
            wake: { contentEvent: policy.wakeOnContentEvent, beforeBoss: policy.wakeBeforeBoss },
            strategyRules: policy.strategyRules.map(rule => ({ id: rule.id, enabled: rule.enabled, metric: rule.metric, op: rule.op, value: rule.value, when: `${rule.metric} ${rule.op} ${rule.value}`, prefer: rule.prefer, priorityBoost: rule.priorityBoost })),
            explanation: [
                'Automation chỉ thi hành chiến lược đã đặt; không tự đổi build, tiêu CP hay chọn Luân Hồi.',
                policy.wakeBeforeBoss ? 'First Clear/boss mới sẽ đánh thức người chơi trước khi chiến đấu.' : 'Automation được phép tự thử boss mới nếu planner đánh giá phù hợp.',
                policy.wakeOnContentEvent ? 'Cơ duyên lớn sẽ dừng automation để người chơi tự chọn.' : 'Automation không dừng chỉ vì có event lớn; event vẫn không tự được chọn nếu không có rule riêng.',
            ],
        };
    }
    playtestTelemetry() {
        const projection = this.session.previewCurrentLifeSettlement();
        return analyzePlaytestTelemetry(this.session.state, this.session.currentLife, this.session.history(), projection);
    }
    saveIntegrity() {
        return auditAdventureState(this.session.state, this.session.history(), this.world, this.registry);
    }
    lifePotentialV2() { return this.session.lifePotentialSummary(); }
    spendLifePotentialV2(id, points = 1) { return this.session.spendLifePotential(id, points); }
    permanentPotentialV2() { return this.session.permanentPotentialSummary(); }
    spendPermanentPotentialV2(id, points = 1) { return this.session.spendPermanentPotential(id, points); }
    reincarnationProgressV2(nowUnixMs = Date.now()) { return this.session.reincarnationProgressSummary(nowUnixMs); }
    daoSuyV127() { return this.session.daoSuySummaryV127(); }
    challengeDaoSuyTribulationV127() { return this.session.attemptDaoSuyTribulationV127(); }
    runReincarnationTrialV2(kind, nowUnixMs = Date.now()) { return this.session.runReincarnationTrial(kind, nowUnixMs); }
    previewReincarnationRewardV2(nowUnixMs = Date.now()) { return this.session.previewReincarnationV2Reward(nowUnixMs); }
    finalizeReincarnationRewardsV2(confirmedBuildReady, nowUnixMs = Date.now()) { return this.session.finalizeReincarnationRewards(confirmedBuildReady, nowUnixMs); }
    spendReincarnationTreeNodeV2(nodeId, ranks = 1) { return this.session.spendReincarnationTreeNode(nodeId, ranks); }
    resetReincarnationTreeV2() { return this.session.resetReincarnationTree(); }
    reincarnationPlanner() {
        const reincarnation = this.reincarnation();
        const talents = this.talents();
        const relationState = this.session.state.worldSimulation.playerRelationships;
        const karmaCandidates = Object.values(relationState)
            .filter(relation => relation.lifeId === this.session.currentLife.lifeId && relation.met && relation.karmaDepth > 0)
            .sort((a, b) => b.karmaDepth - a.karmaDepth)
            .slice(0, 12)
            .map(relation => ({ npcId: relation.npcId, trust: relation.trust, respect: relation.respect, debt: relation.debt, grudge: relation.grudge, karmaDepth: relation.karmaDepth }));
        const nodeNames = new Map(talents.nodes.map(node => [node.id, node.name]));
        return {
            schema: 'reincarnation-planner.v1',
            cpAvailable: this.session.meta.currentCp,
            aptitudeFloors: [{ value: 0, label: 'Mệnh Thai chỉ đổi Thiên Tư · Mệnh Cách · Xuất Thân' }],
            birthCandidates: reincarnation.birthCandidates.map(candidate => { const b = candidate.originsV101; return { index: candidate.candidate, aptitude: candidate.aptitude, luck: candidate.luck, family: candidate.family, familyRarity: candidate.familyRarity, fate: candidate.fate, spiritualRootId: candidate.spiritualRootId, physiqueId: candidate.physiqueId, bloodlineId: candidate.bloodlineId, birthTalents: (candidate.birthTalents ?? []).map(x => ({ ...x })), divineAbility: candidate.divineAbility ? { ...candidate.divineAbility } : undefined, originLines: b ? [`Thiên Tư: ${b.talent.name}`, `Mệnh Cách: ${b.fate.name} · ${b.fate.polarity}`, `Xuất Thân: ${b.background.name}`] : [], lifeTraits: b ? { talent: b.talent.name, fate: `${b.fate.name} · ${b.fate.polarity}`, background: b.background.name } : undefined, persistent: b ? { spiritualRoot: b.spiritualRoot.name, bloodline: `${b.bloodline.name}${b.bloodline.band === 'NONE' ? '' : ` · ${b.bloodline.grade} ${b.bloodline.purity}%`}`, physique: `${b.physique.name}${b.physique.band === 'NONE' ? '' : ` · ${b.physique.stage}`}` } : undefined }; }),
            orientations: reincarnation.orientations.map(item => ({ ...item })),
            fateLocks: { slots: 0, roots: [], physiques: [], bloodlines: [], families: [], fates: [] },
            daoSeeds: reincarnation.daoSeeds.map(item => ({ ...item })),
            memories: reincarnation.memories.map(item => ({ ...item })),
            karmaCandidates,
            relics: [...new Map([
                    ...this.session.state.artifacts.items.map(item => [item.id, { id: item.id, name: item.name, sourceLifeId: this.session.currentLife.lifeId, lostLocationId: this.session.state.locationId }]),
                    ...reincarnation.recoverableRelics.map(item => [item.id, { id: item.id, name: item.name, sourceLifeId: item.sourceLifeId, lostLocationId: item.lostLocationId }]),
                ]).values()],
            major: {
                slots: talents.majorSlots, activeIds: [...talents.activeMajorIds], pendingIds: [...talents.pendingMajorIds],
                options: talents.majors.map(major => ({ id: major.id, name: major.name, description: major.description, effect: major.effect, qualified: major.qualified, selected: talents.pendingMajorIds.includes(major.id), requirements: major.requirements.map(req => `${nodeNames.get(req.id) ?? req.id} bậc ${req.rank}`) })),
            },
            talentTree: talents.nodes.map(node => ({ id: node.id, name: node.name, domain: node.domain, description: node.description, rank: node.rank, maxRank: node.maxRank, nextCost: node.nextCost, unlocked: node.unlocked, effectPerRank: node.effectPerRank })),
        };
    }
    reincarnationPlanPreview(plan = {}) {
        const errors = [];
        const notes = [];
        let trace = { aptitudeFloor: plan.aptitudeFloor ?? 0, aptitudeFloorCost: 0, birthCandidate: plan.birthCandidate ?? 1, orientationCost: 0, fateLockCount: 0, fateLockCost: 0, daoSeedCost: 0, memoryCost: 0, karmaCost: 0, relicCost: 0, totalCpCost: 0 };
        try {
            // Alpha.23.24: exact-origin Fate Locks are unnecessary for persistent Linh Căn/Huyết Mạch/Thể Chất.
            const knownRelics = new Set(this.reincarnationPlanner().relics.map(x => x.id));
            for (const id of plan.bindRelicArtifactIds ?? [])
                if (!knownRelics.has(id))
                    errors.push(`Không có Di Vật khả dụng: ${id}`);
            trace = reincarnationCost(plan, this.session.meta.reincarnation);
        }
        catch (error) {
            errors.push(error instanceof Error ? error.message : String(error));
        }
        const cp = this.session.meta.currentCp;
        if (trace.totalCpCost > cp)
            notes.push(`Thiếu ${trace.totalCpCost - cp} CP cho kế hoạch này.`);
        if ((plan.inheritKarmaNpcIds ?? []).length > 0)
            notes.push('Nhân Quả chỉ mang một phần độ sâu sang đời mới; nợ và oán không tự biến mất.');
        if ((plan.bindRelicArtifactIds ?? []).length > 0)
            notes.push('Di Vật được neo vào thế giới đời sau, không xuất hiện thẳng trong túi đồ.');
        return { schema: 'reincarnation-plan-preview.v1', valid: errors.length === 0, affordable: errors.length === 0 && trace.totalCpCost <= cp, cpAvailable: cp, totalCpCost: trace.totalCpCost, cost: { ...trace }, errors, notes };
    }
    reincarnationHub() {
        const reincarnation = this.reincarnation();
        const fate = this.fateEmbryo();
        const talents = this.talents();
        const majorNames = new Map(talents.majors.map(major => [major.id, major.name]));
        const recommendations = [];
        if (talents.pointsAvailable > 0)
            recommendations.push(`Còn ${talents.pointsAvailable} Điểm Thiên Phú chưa dùng; chỉ tiêu vào nhánh phục vụ lối chơi muốn giữ qua nhiều đời.`);
        if (talents.majorSlots > 0 && talents.pendingMajorIds.length < talents.majorSlots)
            recommendations.push(`Đời kế còn ${talents.majorSlots - talents.pendingMajorIds.length} slot Major Talent trống.`);
        recommendations.push(...reincarnation.aiRecommendation.reasonTrace.slice(0, 3));
        if (fate.limitingUtilizationPct >= 80)
            recommendations.push(`${fate.limitingDomain} đã dùng ${fate.limitingUtilizationPct.toFixed(0)}% dung lượng Mệnh Thai; Luân Hồi sẽ có giá trị nếu muốn phá trần hướng này.`);
        const projection = projectLifeLegacy(this.session.previewCurrentLifeSettlement(), this.session.meta.archives.filter(archive => archive.lifeId !== this.session.currentLife.lifeId));
        const categoryNames = { cultivation: 'Tu Hành', combat: 'Chiến Đấu', exploration: 'Khám Phá', profession: 'Nghề/Năng Lực', relationships: 'Quan Hệ', fate: 'Nghịch Mệnh' };
        const archetype = lifeArchetypeProfile(this.session.meta.talents);
        const passing = this.session.voluntaryPassingEligibility();
        const alive = this.session.state.alive;
        return {
            schema: 'reincarnation-hub.v1', lifeNumber: this.session.currentLife.lifeNumber, cp: reincarnation.cp, mingJi: reincarnation.mingJi,
            lifeEnd: { alive, canEnd: alive ? passing.ok : false, mode: alive ? (this.session.state.realm.maxRealmOrder >= 110 ? 'eternal' : 'meditative') : 'dead', reason: passing.reason, minimumAge: passing.minimumAge, minimumRealmOrder: passing.minimumRealmOrder, firstClears: passing.firstClears },
            seal: { level: reincarnation.sealLevel, name: reincarnation.sealName, xp: reincarnation.xp, nextSealXp: reincarnation.nextSealXp },
            talents: { available: talents.pointsAvailable, earned: talents.lifetimePointsEarned, spent: talents.lifetimePointsSpent },
            major: { slots: talents.majorSlots, active: talents.activeMajorIds.map(id => majorNames.get(id) ?? id), pending: talents.pendingMajorIds.map(id => majorNames.get(id) ?? id) },
            lifeArchetype: { id: archetype.id, name: archetype.name, openingBoon: [...archetype.openingBoon], priorities: [...archetype.priorities], tradeoffs: [...archetype.tradeoffs] },
            fateEmbryo: { grade: fate.grade, orientationId: fate.orientationId, basePotential: fate.basePotential, limitingDomain: fate.limitingDomain, limitingUtilizationPct: fate.limitingUtilizationPct, manifestationBonusSlots: fate.manifestationBonusSlots },
            inheritance: { fateLockSlots: reincarnation.fateLockSlots, karmaSlots: reincarnation.karmaSlots, relicSlots: reincarnation.relicSlots, daoSeedCount: reincarnation.daoSeeds.length, memoryCount: reincarnation.memories.length },
            daoInheritance: (() => { const battleDao = this.session.state.character.buildFoundation?.battleDao; return BATTLE_DAO_IDS.map(id => { const currentLife = Math.max(0, Number(battleDao?.currentLifeDaoHanh?.[id] ?? 0)); const bestEver = Math.max(0, Number(battleDao?.bestDaoHanhEver?.[id] ?? 0)); return { id, name: BATTLE_DAO_NAMES[id], currentLife, bestEver, nextLifeStart: Math.min(20, bestEver * .20) }; }).filter(x => x.currentLife > 0 || x.bestEver > 0); })(),
            projectedLife: { score: projection.score, grade: projection.grade, cp: projection.cp, talentPoints: projection.talentPoints, reincarnationXp: projection.reincarnationXp, mingJi: projection.mingJi, effective: projection.effective, readiness: projection.readiness, strongestCategory: categoryNames[projection.strongestCategory.id] ?? projection.strongestCategory.id, weakestCategory: categoryNames[projection.weakestCategory.id] ?? projection.weakestCategory.id, versusBestCpPct: projection.versusBestCp !== undefined ? projection.versusBestCp * 100 : undefined, recommendations: [...projection.recommendations] },
            recommendations,
        };
    }
    buildCombatReview(report) {
        const dungeonName = this.world.dungeons[report.dungeonId]?.name ?? report.dungeonId;
        const equipmentNames = new Map(this.session.state.equipment.items.map(item => [item.id, item.name]));
        const artifactNames = new Map(this.session.state.artifacts.items.map(item => [item.id, item.name]));
        const lessons = [];
        if (report.counterWindowSuccesses.length > 0)
            lessons.push(`Đã phản đúng ${report.counterWindowSuccesses.length} cửa sổ mechanic; build đang thực sự khai thác matchup.`);
        else if (report.mechanic || report.phaseTransitions.length > 0)
            lessons.push('Không kích hoạt cửa phản nào; xem lại Boss Intel và role của skill/pháp bảo trước lần tái chiến.');
        if (!report.won)
            lessons.push(...report.readiness.recommendations.slice(0, 2));
        else if (report.firstClear)
            lessons.push('First Clear đã mở mốc farm mới; kiểm tra loot được khóa trước khi dọn kho.');
        if (report.phaseTransitions.length > 0 && report.battleInsightGain > 0)
            lessons.push(`Đọc phase mang lại ${report.battleInsightGain.toFixed(2)} mastery quy đổi.`);
        return {
            schema: 'combat-review.v1', dungeonId: report.dungeonId, dungeonName, floor: report.floor, guardianName: report.guardianName, won: report.won, firstClear: report.firstClear, battleDuration: report.battleDuration,
            readiness: { bandLabel: report.readiness.bandLabel, ratio: report.readiness.ratio, playerScore: report.readiness.player.score, enemyScore: report.readiness.enemy.score },
            signatureSkill: report.signatureSkillId ? this.registry.skill(report.signatureSkillId).name : undefined,
            phaseTransitions: report.phaseTransitions.map(x => ({ name: x.name, time: x.time, hpPct: x.hpPct })),
            counters: report.counterWindowSuccesses.map(x => ({ name: x.name, time: x.time, skillName: x.skillId ? this.registry.skill(x.skillId).name : undefined })),
            timeline: report.combatTimeline.map(x => ({ ...x })),
            rewards: Object.entries(report.rewards).filter(([, amount]) => amount > 0).map(([id, amount]) => ({ id, name: resourceName(id), amount })),
            equipmentDrops: report.equipmentDropIds.map(id => equipmentNames.get(id) ?? id), artifactDrops: report.artifactDropIds.map(id => artifactNames.get(id) ?? id), battleInsightGain: report.battleInsightGain, milestoneLootProtected: report.milestoneLootProtected, lessons,
        };
    }
    combatReview() { return this.lastCombatReviewValue ? structuredClone(this.lastCombatReviewValue) : undefined; }
    clientKnownSkillsV129() {
        const state = this.session.state;
        return state.character.knownSkillIds.filter(id => !id.startsWith('skill.class.')).map(id => {
            const skill = this.registry.skill(id);
            return { id, resolvedId: id, name: skill.name, baseName: skill.name, description: battleDaoV2SkillDescriptionV79(skill), tags: [...skill.tags], behaviorType: skill.behaviorType, spiritCost: skill.spiritCost, cooldown: skill.cooldown, castTime: skill.castTime, mechanics: skillCombatExplanationV125(skill), slot: skill.runtimeV117?.slotClass ?? 'active', dao: skill.runtimeV117?.daoBinding, active: state.character.activeSkillIds.includes(id), variant: false };
        });
    }
    characterSkillsV129() {
        const manuals = this.session.techniqueManualSummary();
        const { catalog: _catalog, ...techniqueManuals } = manuals;
        return { schema: 'character-skills.v129', knownSkills: this.clientKnownSkillsV129(), techniqueManuals };
    }
    characterCultivationV140() {
        return { schema:'character-cultivation.v140', ...this.session.cultivationSummaryV140(), injury:Math.max(0,Number(this.session.state.injury)||0) };
    }

    characterHuntV129() {
        const state = this.session.state;
        const combatEntity = this.session.personalCombatEntity();
        return { schema: 'character-hunt.v129', knownSkills: this.clientKnownSkillsV129(), combatStats: { ...combatEntity.stats }, potential: { unspent: Math.max(0, Number(state.character?.corePotential?.life?.unspent ?? 0)) } };
    }
    characterOverviewV129() {
        const state = this.session.state;
        const origins = this.session.currentLife.birth.originsV101;
        const legacyRoot = this.registry.spiritualRoot(state.character.spiritualRootId);
        return {
            schema: 'character-overview.v129',
            birth: { family: this.session.currentLife.birth.family, familyRarity: this.session.currentLife.birth.familyRarity, fate: this.session.currentLife.birth.fate, aptitude: this.session.currentLife.birth.aptitude, luck: this.session.currentLife.birth.luck, talents: (this.session.currentLife.birth.birthTalents ?? []).map(x => ({ ...x })), divineAbility: this.session.currentLife.birth.divineAbility ? { ...this.session.currentLife.birth.divineAbility } : undefined },
            root: origins?.spiritualRoot.name ?? legacyRoot.name,
        };
    }
    characterRootV129() {
        const origins = this.session.currentLife.birth.originsV101;
        return { schema: 'character-root.v129', originDetails: origins ? { spiritualRoot: { ...origins.spiritualRoot, elements: [...origins.spiritualRoot.elements], effects: { ...origins.spiritualRoot.effects } } } : undefined };
    }
    characterDongfuV129() { return { schema: 'character-dongfu.v129', originProgression: this.session.originProgressionSummary() }; }
    clientCoreV140() {
        const state=this.session.state, life=this.session.currentLife, meta=this.session.meta, combatEntity=this.session.personalCombatEntity();
        const realm=this.registry.realm(state.realm.realmId), location=this.world.locations[state.locationId], cultivation=this.session.cultivationSummaryV140();
        return { schema:'client-core.v140', overview:{schema:'player-overview-lite.v140',life:{lifeNumber:life.lifeNumber,lifeId:life.lifeId,realm:realm.name,realmOrder:state.realm.maxRealmOrder,ageYears:state.ageYears,lifespanYears:state.lifespanYears,alive:state.alive,location:location?.name??state.locationId},cultivation,injury:Math.max(0,Number(state.injury)||0)}, shell:{schema:'client-shell.v140',canonicalPower:Number(combatEntity?.stats?.attack??0),potentialUnspent:Math.max(0,Number(state.character?.corePotential?.life?.unspent??0)),reincarnationCp:Math.max(0,Number(meta?.currentCp??0))} };
    }

    clientShellV140() { return this.clientCoreV140().shell; }
    clientOverviewLiteV140() { return this.clientCoreV140().overview; }
    character() {
        const state = this.session.state;
        const legacyRoot = this.registry.spiritualRoot(state.character.spiritualRootId);
        const origins = this.session.currentLife.birth.originsV101;
        const physiqueNames = origins
            ? (origins.physique.band === 'NONE' ? [] : [origins.physique.name])
            : state.character.physiqueIds.map(id => this.registry.characterPhysique(id).name);
        const bloodlines = origins
            ? (origins.bloodline.band === 'NONE' ? [] : [{ id: origins.bloodline.id, purity: origins.bloodline.purity, awakened: false, name: origins.bloodline.name, grade: origins.bloodline.grade, tierLabel: origins.bloodline.tierLabel }])
            : state.character.bloodlines.map(lineage => ({ ...lineage, name: this.registry.bloodline(lineage.id).name }));
        const combatEntity = this.session.personalCombatEntity();
        const coreBody = Number.isFinite(combatEntity.stats.physique) ? Math.max(0, combatEntity.stats.physique ?? 0) : Math.max(0, combatEntity.stats.maxHp / 20);
        const activeTechnique = this.registry.technique(state.character.activeTechniqueId);
        return {
            ...this.dashboard(),
            birth: { family: this.session.currentLife.birth.family, familyRarity: this.session.currentLife.birth.familyRarity, fate: this.session.currentLife.birth.fate, aptitude: this.session.currentLife.birth.aptitude, luck: this.session.currentLife.birth.luck, talents: (this.session.currentLife.birth.birthTalents ?? []).map(x => ({ ...x })), divineAbility: this.session.currentLife.birth.divineAbility ? { ...this.session.currentLife.birth.divineAbility } : undefined, originLines: bundleSummaryLines(origins) },
            root: origins?.spiritualRoot.name ?? legacyRoot.name,
            rootTags: origins ? [...origins.spiritualRoot.elements, origins.spiritualRoot.grade, origins.spiritualRoot.tierLabel] : [...legacyRoot.tags],
            originDetails: origins ? {
                spiritualRoot: { ...origins.spiritualRoot, elements: [...origins.spiritualRoot.elements], effects: { ...origins.spiritualRoot.effects } },
                bloodline: { ...origins.bloodline, effects: { ...origins.bloodline.effects } },
                physique: { ...origins.physique, effects: { ...origins.physique.effects } },
                talent: { ...origins.talent, effects: { ...origins.talent.effects } },
                fate: { ...origins.fate, effects: { ...origins.fate.effects } },
                background: { ...origins.background, effects: { ...origins.background.effects } },
            } : undefined,
            physiques: physiqueNames,
            bloodlines,
            cultivation: this.session.cultivationSummaryV140(),
            injury: Math.max(0, Number(state.injury) || 0),
            inheritedOrigins: { ...state.inheritedOrigins },
            coreStats: { power: combatEntity.stats.attack, body: coreBody, defense: combatEntity.stats.defense },
            combatStats: { ...combatEntity.stats },
            activeTechniqueDetail: { id: activeTechnique.id, name: activeTechnique.name, tags: [...activeTechnique.tags], mastery: state.character.techniqueMastery[activeTechnique.id] ?? 0 },
            knownTechniques: state.character.knownTechniqueIds.map(id => { const t = this.registry.technique(id); return ({ id, name: t.name, tags: [...t.tags], mastery: state.character.techniqueMastery[id] ?? 0, active: id === state.character.activeTechniqueId }); }),
            knownSkills: state.character.knownSkillIds.filter(id => !id.startsWith('skill.class.')).map(id => { const skill = this.registry.skill(id); return ({ id, resolvedId: id, name: skill.name, baseName: skill.name, description: battleDaoV2SkillDescriptionV79(skill), tags: [...skill.tags], behaviorType: skill.behaviorType, spiritCost: skill.spiritCost, cooldown: skill.cooldown, castTime: skill.castTime, mechanics: skillCombatExplanationV125(skill), slot: skill.runtimeV117?.slotClass ?? 'active', dao: skill.runtimeV117?.daoBinding, active: state.character.activeSkillIds.includes(id), variant: false }); }),
            equipmentSlots: CANONICAL_EQUIPMENT_SLOTS.map((id, index) => ({ id, label: EQUIPMENT_SLOT_LABELS[id], index })),
            originProgression: this.session.originProgressionSummary(),
            bloodlineCatalog: bloodlineIds().filter(id => id !== 'bloodline.v101.none').map(id => { const d = bloodlineDefinition(id); return { id: d.id, name: d.name, tierLabel: d.tierLabel, band: d.band, description: d.description }; }),
            potential: this.session.lifePotentialSummary(),
            techniqueManuals: this.session.techniqueManualSummary(),
        };
    }
    /** Compatibility action used by the current client; v1.10.2 routes it to the authoritative three-stat Potential pool. */
    spendPotential(id, points = 1) { return this.session.spendLifePotential(id, points); }





    setSkillActive(skillId, active) { return this.session.setCombatSkillActive(skillId, active); }


    equipTechniqueManual(techniqueId) { return this.session.equipTechniqueManual(techniqueId); }
    studyTechniqueManual(techniqueId, batches = 1) { return this.session.studyTechniqueManual(techniqueId, batches); }
    setTechniqueVariantsV119(variantIds) { return this.session.setTechniqueVariantsV119(variantIds); }
    techniqueManuals() { return this.session.techniqueManualSummary(); }
    collectionV12316(nowUnixMs = Date.now()) { return this.session.collectionSummaryV12316(nowUnixMs); }
    collectionEconomyV12325(nowUnixMs = Date.now()) { return this.session.collectionEconomyV12325(nowUnixMs); }
    collectionEconomyV12326(nowUnixMs = Date.now()) { return this.session.collectionEconomyV12326(nowUnixMs); }
    economyActivityV89(nowUnixMs = Date.now()) { return this.session.economyActivityV89(nowUnixMs); }
    economyProductionV111(nowUnixMs = Date.now()) { return this.session.economyProductionV111(nowUnixMs); }
    pvpV91(nowUnixMs = Date.now()) { return this.session.pvpV91(nowUnixMs); }
    joinPvpV91(nowUnixMs = Date.now()) { return this.session.joinPvpV91(nowUnixMs); }
    refreshPvpDefenseV91(nowUnixMs = Date.now()) { return this.session.refreshPvpDefenseV91(nowUnixMs); }
    setPvpTacticalV94(presetId, nowUnixMs = Date.now()) { return this.session.setPvpTacticalV94(presetId, nowUnixMs); }
    challengePvpV91(opponentId, nowUnixMs = Date.now()) { return this.session.challengePvpV91(opponentId, nowUnixMs); }
    settlePvpSeasonV94(nowUnixMs = Date.now()) { return this.session.settlePvpSeasonV94(nowUnixMs); }
    replayPvpV91(fightId) { return this.session.replayPvpV91(fightId); }
    buyEconomyOfferV89(offerId, nowUnixMs = Date.now()) { return this.session.buyEconomyOfferV89(offerId, nowUnixMs); }
    talismanWorkshopV128() {
        const state = this.session.state;
        const track = state.professions.tracks.talisman;
        const qualityNames = { low: 'Hạ Phẩm', mid: 'Trung Phẩm', high: 'Thượng Phẩm', supreme: 'Cực Phẩm', perfect: 'Hoàn Mỹ' };
        const recipes = [...this.registry.professionRecipes.values()].filter(recipe => recipe.professionId === 'talisman').map(recipe => {
            const known = track.knownRecipeIds.includes(recipe.id);
            const ingredients = recipe.ingredients.map(req => ({ id: req.id, name: req.name, options: req.options.map(option => ({ ...option, name: resourceName(option.resourceId), available: state.inventory[option.resourceId] ?? 0 })) }));
            const canIngredients = recipe.ingredients.every(req => req.options.some(option => (state.inventory[option.resourceId] ?? 0) >= option.quantity));
            const product = recipe.output.kind === 'stack' ? this.registry.craftedProduct(recipe.output.productId) : undefined;
            return { id: recipe.id, name: recipe.name, description: recipe.description, difficulty: recipe.difficulty, masteryRequired: recipe.masteryRequired, mastery: track.mastery, known, canCraft: known && track.mastery + 1e-9 >= recipe.masteryRequired && canIngredients, ingredients, output: product ? { productId: product.id, name: product.name, description: product.description, quantity: recipe.output.quantity } : undefined };
        });
        const stock = state.professions.stock.filter(entry => {
            try { return this.registry.craftedProduct(entry.productId).professionId === 'talisman' && entry.quantity > 0; } catch { return false; }
        }).map(entry => { const product = this.registry.craftedProduct(entry.productId); return { ...entry, qualityName: qualityNames[entry.quality] ?? entry.quality, name: product.name, description: product.description, useEffectType: product.useEffect.type }; });
        return {
            schema: 'talisman-workshop.v128', title: 'Phù Trận Các', professionId: 'talisman', mastery: track.mastery, knownRecipeIds: [...track.knownRecipeIds], recipes, stock,
            resources: { talismanPaper: state.inventory['resource.talisman_paper'] ?? 0, runeInsight: state.inventory['resource.rune_insight'] ?? 0, spiritStones: state.inventory['resource.spirit_stone'] ?? 0 },
            sourceGuide: [
                { id: 'resource.talisman_paper', name: 'Linh Phù Chỉ', source: 'Phó Bản/guardian/farm Phù–Trận đang tồn tại.' },
                { id: 'resource.rune_insight', name: 'Phù Văn Cảm Ngộ', source: 'Phó Bản/guardian/opportunity đang tồn tại.' },
            ],
        };
    }
    forgingV12328(nowUnixMs = Date.now()) { return { ...this.session.forgingV12328Summary(nowUnixMs), talismanWorkshop: this.talismanWorkshopV128() }; }
    syncForgingV12328(nowUnixMs = Date.now()) { return this.session.syncForgingV12328(nowUnixMs); }
    startForgingV12328(recipeId, nowUnixMs = Date.now()) { return this.session.startForgingV12328(recipeId, nowUnixMs); }
    setManualGachaRealmV127(realmStageIndex) { return this.session.setManualGachaRealmV127(realmStageIndex); }
    setManualGachaOrientationV127(manualId) { return this.session.setManualGachaOrientationV127(manualId); }
    collectionGachaV12326(bannerId, count = 1, usePremium = false) { return this.session.collectionGachaV12326(bannerId, count, usePremium); }
    composeCollectionV12326(itemId) { return this.session.composeCollectionV12326(itemId); }
    activateOriginCollectionV12326(category, itemId) { return this.session.activateOriginCollectionV12326(category, itemId); }
    collectionDailyV12326(dungeonId, nowUnixMs = Date.now()) { return this.session.clearCollectionDailyV12326(dungeonId, nowUnixMs); }
    collectionGachaSimV12326(category, pulls = 10000) { return this.session.simulateCollectionGachaV12326(category, pulls); }
    devCollectionGrantV12326() { return this.session.devCollectionGrantV12326(); }
    petGearUpgradeV12328(petId, slot) { return this.session.upgradePetGearV12328(petId, slot); }
    collectionGachaV12325(bannerId, count = 1, usePremium = false) { return this.session.collectionGachaV12325(bannerId, count, usePremium); }
    collectionStrengthenV12325(itemId, levels = 1) { return this.session.strengthenCollectionV12325(itemId, levels); }
    collectionAdvanceV12325(itemId) { return this.session.advanceCollectionV12325(itemId); }
    collectionEquipV12325(itemId, artifactSlotIndex) { return this.session.equipCollectionV12325(itemId, artifactSlotIndex); }
    collectionUnequipV12325(itemId) { return this.session.unequipCollectionV12325(itemId); }
    heartMethodStrengthenV12325(passiveId) { return this.session.strengthenHeartMethodV12325(passiveId); }
    heartMethodAdvanceV12325(passiveId) { return this.session.advanceHeartMethodV12325(passiveId); }
    collectionDailyV12325(dungeonId, nowUnixMs = Date.now()) { return this.session.clearCollectionDailyV12325(dungeonId, nowUnixMs); }
    collectionGachaSimV12325(bannerId, pulls = 10000) { return this.session.simulateCollectionGachaV12325(bannerId, pulls); }
    devCollectionGrantV12325() { return this.session.devCollectionGrantV12325(); }
    collectionGachaV12316(category, count = 1, usePremium = false) { return this.session.collectionGachaV12316(category, count, usePremium); }
    collectionStrengthenV12316(itemId, levels = 1) { return this.session.strengthenCollectionV12316(itemId, levels); }
    collectionAdvanceV12316(itemId) { return this.session.advanceCollectionV12316(itemId); }
    collectionEquipV12316(itemId) { return this.session.equipCollectionV12316(itemId); }
    collectionUnequipV12316(itemId) { return this.session.unequipCollectionV12316(itemId); }
    collectionDailyV12316(dungeonId, nowUnixMs = Date.now()) { return this.session.clearCollectionDailyV12316(dungeonId, nowUnixMs); }
    caveUpgradeV12316(facilityId) { return this.session.upgradeCaveFacilityV12316(facilityId); }
    specializationPreviewV125() { return this.session.specializationSkillPreviewV125(); }
    specializationV125() { return this.session.specializationSkillSummaryV125(); }
    commitSpecializationV125(nature, mainDao) { return this.session.commitSpecializationV125(nature, mainDao); }
    chooseSecondaryDaoV125(dao) { return this.session.chooseSecondaryDaoV125(dao); }
    allocateDaoNaturePointV125(tierId, branch, points = 1) { return this.session.allocateDaoNaturePointV125(tierId, branch, points); }
    chooseDaoNatureMajorBranchV125(tierId, branch) { return this.session.chooseDaoNatureMajorBranchV125(tierId, branch); }
    restoreTechniqueManualV125(techniqueId) { return this.session.restoreTechniqueManualV125(techniqueId); }
    upgradeDaoPassiveV125(passiveId, sourceTechniqueId) { return this.session.upgradeDaoPassiveV125(passiveId, sourceTechniqueId); }
    upgradeBattleDaoSkillV12317(skillId) { return this.session.upgradeBattleDaoSkillV12317(skillId); }
    advanceBattleDaoSkillV12317(skillId) { return this.session.advanceBattleDaoSkillV12317(skillId); }
    spiritualRootsV131() { return this.session.spiritualRootSummaryV131(); }
    setRootFocusV131(root) { return this.session.setRootFocusV131(root); }
    setRootOriginTargetV131(root, originId) { return this.session.setRootOriginTargetV131(root, originId); }
    activateRootOriginV131(root, originId) { return this.session.activateRootOriginV131(root, originId); }
    elementSealsV133() { return this.session.elementSealSummaryV133(); }
    setSkillElementSealV133(skillId, root) { return this.session.setSkillElementSealV133(skillId, root); }
    breakthroughRootQualityV131(root) { return this.session.breakthroughRootQualityV131(root); }
    dungeons() {
        const state = this.session.state;
        const orderedDungeons = Object.values(this.world.dungeons).sort((a, b) => Number(a.tags?.includes('V122') ?? false) - Number(b.tags?.includes('V122') ?? false));
        return orderedDungeons.map((dungeon, i) => {
            const highest = highestClearedDungeonFloor(state.dungeons, dungeon.id);
            const next = dungeon.floors.find(floor => floor.floor === highest + 1);
            const worker = Object.entries(state.dungeons.assignments).find(([, assignment]) => assignment.dungeonId === dungeon.id)?.[0];
            const unlocked = state.dungeons.unlockedDungeonIds.includes(dungeon.id);
            let readiness;
            if (unlocked && next?.guardianEntityId && state.realm.maxRealmOrder >= next.requiredRealmOrder) {
                try {
                    const r = this.session.dungeonReadiness(dungeon.id, next.floor);
                    readiness = { bandLabel: r.bandLabel, ratio: r.ratio, playerScore: r.player.score, enemyScore: r.enemy.score };
                }
                catch { }
            }
            const resourceDef = resourcePveDefinitionV12329(dungeon.id);
            let resourcePve;
            if (resourceDef) {
                const nextReady = Boolean(next && state.realm.maxRealmOrder >= next.requiredRealmOrder);
                const targetFloor = nextReady ? next.floor : Math.max(1, highest || 1);
                const targetSpec = dungeon.floors.find(f => f.floor === targetFloor);
                const reward = nextReady ? resourcePveFloorRewardPreviewV12329(resourceDef.category, targetFloor) : resourcePveFarmRewardPreviewV109(resourceDef.category, targetFloor, 1, 1);
                resourcePve = { category: resourceDef.category, description: resourceDef.description, targetFloor, targetMode: nextReady ? 'progress' : 'farm', canChallenge: unlocked && state.realm.maxRealmOrder >= targetSpec.requiredRealmOrder, canFarm: unlocked && highest >= targetFloor && state.realm.maxRealmOrder >= targetSpec.requiredRealmOrder, requiredRealmOrder: targetSpec.requiredRealmOrder, materialName: reward.materialName, material: nextReady ? reward.material : Math.floor(reward.expectedMaterial), materialPerYear: nextReady ? undefined : reward.materialPerYear, breakthroughName: reward.breakthroughName, breakthroughChancePct: nextReady ? reward.breakthroughChancePct : undefined, breakthroughPerYear: nextReady ? undefined : reward.breakthroughPerYear, firstClearBreakthrough: nextReady ? reward.firstClearBreakthrough : undefined, v109: { schema: 'resource-dungeon-production.v109', firstClearMode: 'CombatKernelV2', farmMode: 'time-based-dungeon', repeatGuardianMaterialReward: false, specificFragments: 'gacha-only', oldDailyWorkshopWrite: 'retired-production' } };
            }
            return {
                index: i + 1,
                id: dungeon.id,
                name: dungeon.name,
                purpose: dungeon.purpose,
                unlocked,
                highestClearedFloor: highest,
                maxFloor: dungeon.floors.length,
                nextFloor: next ? { floor: next.floor, guardianName: next.guardianEntityId ?? 'Thủ vệ chưa rõ', recommendedRealmOrder: next.requiredRealmOrder } : undefined,
                worker,
                readiness,
                resourcePve,
            };
        });
    }
    endlessHunt() { return this.session.endlessHuntSummary(); }
    selectEndlessFloor(floor) { return this.session.selectEndlessFloor(floor); }
    fightEndlessFloor(options = {}) { return this.session.fightEndlessFloor(options); }
    setEndlessAutoAdvance(enabled) { return this.session.setEndlessAutoAdvance(enabled); }

    useCultivationPill() { return this.session.useCultivationPill(); }








    cultivationV140() { return this.session.cultivationSummaryV140(); }
    retreatV140(hours = 3) { return this.session.instantRetreatV140(hours); }
    ascendRealmV140() { return this.session.ascendRealmV140(); }
    economyV111() { return this.session.economyV111Summary(); }
    refreshPhuongThiV111() { return this.session.refreshPhuongThiV111(); }
    buyPhuongThiV111(slotId, quantity = 1) { return this.session.buyPhuongThiV111(slotId, quantity); }
    sellEconomyMaterialV111(resourceId, quantity = 1) { return this.session.sellEconomyMaterialV111(resourceId, quantity); }
    convertEconomyMaterialV111(resourceId, batches = 1) { return this.session.convertEconomyMaterialV111(resourceId, batches); }
    alchemyV112() { return this.session.alchemyV112Summary(); }
    startAlchemyV112(family, realmTier, batchSize, furnaceIndex = 0) { return this.session.startAlchemyV112(family, realmTier, batchSize, furnaceIndex); }
    promoteAlchemyV112() { return this.session.promoteAlchemyV112(); }
    useAlchemyPillV112(resourceId) { return this.session.useAlchemyPillV112(resourceId); }
    learnAlchemyRecipeV85(recipeId) { return this.session.learnAlchemyRecipeV85(recipeId); }
    plantAlchemyGardenV85(variant, realmTier, slot) { return this.session.plantAlchemyGardenV85(variant, realmTier, slot); }
    harvestAlchemyGardenV85(slot) { return this.session.harvestAlchemyGardenV85(slot); }
    personalPower() { return this.session.personalPowerSummary(); }
    dungeonReadiness(dungeonId, floor) { return this.session.dungeonReadiness(dungeonId, floor); }
    loadoutPresets() { return this.session.tacticalLoadoutPresets(); }
    savedLoadouts() { return this.session.savedCombatLoadouts(); }
    skillName(skillId) { return this.registry.skill(skillId).name; }
    equipmentBuildIntelligence(itemId) { return this.session.equipmentBuildIntelligence(itemId); }
    setLootItemLocked(itemId, locked) { if (locked)
        this.session.lockLoot(itemId);
    else
        this.session.unlockLoot(itemId); return { itemId, locked }; }
    equipmentItemReadModelV129(item, index = 0, includeHeavy = true, includeImpact = true, readContext = undefined) {
        const state = readContext?.state ?? this.session.state;
        const setNames = this.registry.equipmentSets;
        const roleScores = {
            'Sát thương': (item.stats.attack ?? 0) * 1.5 + (item.stats.critChancePct ?? 0) * 0.9,
            'Sinh tồn': (item.stats.maxHp ?? 0) * 0.12 + (item.stats.defense ?? 0) * 2 + (item.stats.resolve ?? 0) * 1.2,
            'Thần niệm': (item.stats.maxSpirit ?? 0) * 0.22 + (item.stats.controlPower ?? 0) * 1.7,
            'Cơ động': (item.stats.mobility ?? 0) * 1.6 + (item.stats.accuracy ?? 0) * 1.25 + (item.stats.actionSpeed ?? 0) * 90,
        };
        const role = Object.entries(roleScores).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Cân bằng';
        const v142Item = item.schema === 'equipment.v142';
        const v142Set = v142Item ? equipmentSetDefinitionV142(item.setId) : undefined;
        const maxEnhancementLevel = v142Item ? EQUIPMENT_MAX_ENHANCEMENT_V142 : EQUIPMENT_MAX_ENHANCEMENT;
        const liveSet = isLiveEquipmentSetV12310(item.setId);
        const base = {
            index: index + 1,
            id: item.id,
            name: item.name,
            slot: item.slot,
            slotLabel: v142Item ? (EQUIPMENT_SLOT_LABELS_V142[item.slot] ?? item.slot) : (EQUIPMENT_SLOT_LABELS[item.slot] ?? item.slot),
            slotGroup: equipmentSlotGroup(item.slot),
            equipped: state.equipment.equipped[item.slot] === item.id,
            tier: equipmentTierName(item.tier),
            quality: equipmentQualityName(item.quality),
            grade: equipmentGradeName(item.grade),
            enhancementLevel: item.enhancementLevel ?? 0,
            maxEnhancementLevel,
            isV142: v142Item,
            rankIndex: v142Item ? item.equipmentRankIndex : undefined,
            rankName: v142Item ? item.equipmentRankName : undefined,
            enhancementBonusPct: enhancementBonusPct(item.enhancementLevel ?? 0),
            itemLevel: item.itemLevel,
            setId: v142Set?.id ?? (liveSet ? item.setId : undefined),
            setName: v142Set?.name ?? (liveSet ? setNames.get(item.setId)?.name : undefined),
            setCategory: v142Set?.category ?? (liveSet ? 'attire' : undefined),
            locked: readContext?.lockedIds ? readContext.lockedIds.has(item.id) : state.lootManagement.lockedItemIds.includes(item.id),
            role,
            gemSocketCount: equipmentGemSocketCountV128(item),
            gemSockets: Array.from({ length: equipmentGemSocketCountV128(item) }, (_, socketIndex) => {
                const gem = item.gemSockets?.[socketIndex] ?? null;
                return { socketIndex, empty: !gem, ...(gem ? { gem: { ...gem } } : {}) };
            }),
        };
        if (!includeHeavy)
            return base;
        const impact = includeImpact ? this.session.equipmentCombatImpact(item.id) : null;
        const affixDetails = (item.affixes ?? []).map((roll, affixIndex) => {
            const def = equipmentAffixDefinitionV114(roll.id);
            const availableFamilies = availableReforgeFamiliesV13821(item, affixIndex);
            const sameCost = reforgeAffixCostV115(item, affixIndex);
            const familyChangeCosts = {};
            for (const family of availableFamilies) {
                if (family === roll.family)
                    continue;
                const cost = reforgeAffixCostV115(item, affixIndex, family);
                familyChangeCosts[family] = { spiritStones: cost.spiritStones, essenceResourceId: cost.essenceResourceId, equipmentEssence: cost.equipmentEssence, familyChangeMaterial: cost.familyChangeMaterial ?? 0 };
            }
            const maxRoll = roll.rollPct >= EQUIPMENT_AFFIX_MAX_ROLL_PCT_V114 - 1e-9;
            const refineCost = maxRoll ? undefined : refineAffixCostV115(item, affixIndex);
            return {
                index: affixIndex, id: roll.id, name: def?.name ?? roll.id, family: roll.family, familyLabel: EQUIPMENT_AFFIX_FAMILY_LABELS_V13821[roll.family], value: roll.value, rollPct: roll.rollPct, formatted: formatEquipmentAffixV114(roll), buildAffix: roll.buildAffix, availableFamilies,
                reforgeCost: { spiritStones: sameCost.spiritStones, essenceResourceId: sameCost.essenceResourceId, equipmentEssence: sameCost.equipmentEssence }, familyChangeCosts,
                ...(refineCost ? { refineCost: { spiritStones: refineCost.spiritStones, essenceResourceId: refineCost.essenceResourceId, equipmentEssence: refineCost.equipmentEssence } } : {}), maxRoll,
            };
        });
        const engraveCost = daoEngraveCostV115(item);
        return {
            ...base,
            nextEnhanceChancePct: (item.enhancementLevel ?? 0) < maxEnhancementLevel ? enhancementSuccessChancePct((item.enhancementLevel ?? 0) + 1) : undefined,
            nextEnhanceDowngradeChancePct: (item.enhancementLevel ?? 0) < maxEnhancementLevel ? enhancementDowngradeChancePct((item.enhancementLevel ?? 0) + 1) : undefined,
            nextEnhanceBonusPct: (item.enhancementLevel ?? 0) < maxEnhancementLevel ? enhancementBonusPct((item.enhancementLevel ?? 0) + 1) : undefined,
            nextEnhanceCost: (item.enhancementLevel ?? 0) < maxEnhancementLevel ? enhancementEssenceCost(item, (item.enhancementLevel ?? 0) + 1) : undefined,
            traits: (item.affixes?.length ?? 0) > 0 ? [] : (item.traitIds ?? []).map(equipmentTraitName),
            affixes: equipmentAffixLinesV114(item), affixDetails,
            daoInscription: item.daoInscription?.id,
            daoInscriptionDetail: item.daoInscription ? (() => { const def = daoInscriptionDefinitionV128(item.daoInscription.id); return def ? { id: def.id, name: def.name, description: def.description, runtimeLive: true } : { id: item.daoInscription.id, name: item.daoInscription.id, description: 'Đạo Văn legacy được giữ dữ liệu nhưng không có consumer V128.', runtimeLive: false }; })() : undefined,
            daoInscriptionRuntimeLive: Boolean(daoInscriptionDefinitionV128(item.daoInscription?.id)),
            gemSockets: Array.from({ length: equipmentGemSocketCountV128(item) }, (_, socketIndex) => { const gem = item.gemSockets?.[socketIndex] ?? null; const effect = gem ? equipmentGemEffectV128(gem) : undefined; return { socketIndex, empty: !gem, ...(gem ? { gem: { ...gem }, effect, nextUpgradeCost: (gem.level ?? 1) < 5 ? equipmentGemUpgradeCostV128((gem.level ?? 1) + 1) : undefined } : {}) }; }),
            daoEngraveCost: { spiritStones: engraveCost.spiritStones, essenceResourceId: engraveCost.essenceResourceId, equipmentEssence: engraveCost.equipmentEssence, daoFragments: engraveCost.daoFragments ?? 0 },
            reforgeCount: Math.max(0, Math.floor(item.reforgeCount ?? 0)),
            ...(impact ? { powerDeltaPct: impact.deltaPct, powerAfter: impact.scoreAfter } : { powerImpactDeferredV129: true }),
            stats: { ...item.stats }, effectiveStats: { ...effectiveEquipmentStats(item) },
            transferEligibleTargetIds: (item.enhancementLevel ?? 0) > 0 ? state.equipment.items.filter(candidate => candidate.id !== item.id && candidate.slot === item.slot && (candidate.enhancementLevel ?? 0) < (item.enhancementLevel ?? 0) && (candidate.schema !== 'equipment.v142' || (item.enhancementLevel ?? 0) <= EQUIPMENT_MAX_ENHANCEMENT_V142)).map(candidate => candidate.id) : [],
            source: item.source.kind === 'field' ? (item.source.dungeonId === 'endless.hunt' ? `Vô Tận Tháp · tầng ${item.source.floor}` : 'Săn yêu dã ngoại') : item.source.kind === 'dungeon' ? 'Phó bản/Boss' : item.source.kind === 'craft' ? 'Luyện khí' : 'Tông môn',
        };
    }
    equipmentInventoryV129(selectedItemId) {
        const state = this.session.state;
        const sorted = [...state.equipment.items].sort((a, b) => b.itemLevel - a.itemLevel || a.name.localeCompare(b.name));
        const selected = sorted.find(item => item.id === selectedItemId) ?? sorted.find(item => state.equipment.equipped[item.slot] !== item.id) ?? sorted[0];
        const detailIds = new Set(Object.values(state.equipment.equipped).filter(Boolean));
        if (selected?.id)
            detailIds.add(selected.id);
        const readContext = { state, lockedIds: new Set(state.lootManagement.lockedItemIds) };
        return sorted.map((item, index) => this.equipmentItemReadModelV129(item, index, detailIds.has(item.id), false, readContext));
    }
    equipmentEquippedV129() {
        const state = this.session.state;
        const equippedIds = new Set(Object.values(state.equipment.equipped).filter(Boolean));
        const readContext = { state, lockedIds: new Set(state.lootManagement.lockedItemIds) };
        return [...state.equipment.items].filter(item => equippedIds.has(item.id)).sort((a, b) => a.slot.localeCompare(b.slot)).map((item, index) => this.equipmentItemReadModelV129(item, index, true, false, readContext));
    }
    equipment() {
        const state = this.session.state;
        const readContext = { state, lockedIds: new Set(state.lootManagement.lockedItemIds) };
        return [...state.equipment.items].sort((a, b) => b.itemLevel - a.itemLevel || a.name.localeCompare(b.name)).map((item, index) => this.equipmentItemReadModelV129(item, index, true, true, readContext));
    }
    equipmentSystem() {
        const state = this.session.state;
        const equipped = equippedItems(state.equipment);
        const power = equipmentPower(state.equipment, this.registry.equipmentSets);
        const v142FragmentWallet = { ...(state.equipmentFragmentsV142?.byRank ?? {}) };
        const v142SetFragmentWallet = { ...(state.equipmentSetFragmentsV142?.bySetId ?? {}) };
        const v142MaxRankIndex = equipmentRankIndexFromRealmOrderV142(state.realm.maxRealmOrder);
        const mechanicsBySet = new Map();
        for (const mechanic of power.activeSetMechanics) {
            const list = mechanicsBySet.get(mechanic.setId) ?? [];
            list.push(mechanic);
            mechanicsBySet.set(mechanic.setId, list);
        }
        const setIds = [...new Set(equipped.map(item => item.setId).filter((id) => Boolean(id && isLiveEquipmentSetV12310(id))))];
        const sets = setIds.map(setId => {
            const items = equipped.filter(item => item.setId === setId);
            const catalog = equipmentSetCatalogEntryV116(setId);
            if (catalog) {
                const active = mechanicsBySet.get(setId) ?? [];
                return {
                    setId, setName: catalog.name, category: catalog.category, equippedPieces: items.length, maxPieces: equipmentSetSlotsV116(catalog.category).length,
                    thresholds: catalog.mechanics.map(def => { const live = active.find(x => x.mechanicId === def.id); return { pieces: def.pieces, active: Boolean(live), name: def.name, summary: live?.summary ?? def.description, ...(live ? { effectiveGrade: equipmentGradeName(live.effectiveGrade) } : {}), ...(def.constraint ? { constraint: def.constraint } : {}) }; }),
                    pieces: equipmentSetSlotsV116(catalog.category).map(slot => { const item = items.find(x => x.slot === slot); return { slot, slotLabel: EQUIPMENT_SLOT_LABELS[slot] ?? slot, ...(item ? { itemId: item.id, itemName: item.name, grade: equipmentGradeName(item.grade), enhancementLevel: item.enhancementLevel ?? 0 } : {}) }; }),
                };
            }
            const legacy = this.registry.equipmentSets.get(setId);
            return {
                setId, setName: legacy?.name ?? setId, category: 'legacy', equippedPieces: items.length, maxPieces: Math.max(items.length, ...(legacy?.bonuses.map(x => x.pieces) ?? [items.length])),
                thresholds: (legacy?.bonuses ?? []).map(def => ({ pieces: def.pieces, active: items.length >= def.pieces, name: def.name, summary: def.description })),
                pieces: items.map(item => ({ slot: item.slot, slotLabel: EQUIPMENT_SLOT_LABELS[item.slot] ?? item.slot, itemId: item.id, itemName: item.name, grade: equipmentGradeName(item.grade), enhancementLevel: item.enhancementLevel ?? 0 })),
            };
        }).sort((a, b) => a.category.localeCompare(b.category) || a.setName.localeCompare(b.setName));
        const setCatalog = LIVE_EQUIPMENT_SET_CATALOG_V12310.map(set => {
            const owned = state.equipment.items.filter(item => item.setId === set.id);
            const equippedCount = owned.filter(item => state.equipment.equipped[item.slot] === item.id).length;
            const canonicalSlots = equipmentSetSlotsV116(set.category);
            const ownedSlots = canonicalSlots.flatMap(slot => {
                const matches = owned.filter(item => item.slot === slot);
                if (!matches.length)
                    return [];
                const best = [...matches].sort((a, b) => equipmentGradeIndex(b.grade ?? 'mundane') - equipmentGradeIndex(a.grade ?? 'mundane') || (b.itemLevel ?? 0) - (a.itemLevel ?? 0))[0];
                return [{ slot, slotLabel: EQUIPMENT_SLOT_LABELS[slot] ?? slot, itemCount: matches.length, bestGrade: equipmentGradeName(best.grade), bestItemLevel: best.itemLevel }];
            });
            const ownedSlotIds = new Set(ownedSlots.map(x => x.slot));
            const missingSlots = canonicalSlots.filter(slot => !ownedSlotIds.has(slot)).map(slot => ({ slot, slotLabel: EQUIPMENT_SLOT_LABELS[slot] ?? slot }));
            const targetPool = LIVE_EQUIPMENT_SET_CATALOG_V12310;
            const targetFloor = Math.max(1, targetPool.findIndex(candidate => candidate.id === set.id) + 1);
            const targetDungeon = { id: V122_TARGET_SET_DUNGEONS.elementAttire, name: 'Ngũ Hành Đạo Khố' };
            return {
                setId: set.id, setName: set.name, category: set.category, identity: set.identity, tags: [...set.tags], description: set.description,
                unlocked: isEquipmentSetUnlockedV116(state.equipment, set.id), ownedPieces: owned.length, ownedSlotCount: ownedSlots.length, ownedSlots, missingSlots, duplicatePieces: Math.max(0, owned.length - ownedSlots.length), equippedPieces: equippedCount, maxPieces: canonicalSlots.length,
                thresholds: set.mechanics.map(def => ({ pieces: def.pieces, name: def.name, description: def.description, ...(def.constraint ? { constraint: def.constraint } : {}) })),
                acquisition: { targetDungeonId: targetDungeon.id, targetDungeonName: targetDungeon.name, targetFloor, firstClearUnlocksCraft: true, repeatTargetDrops: true },
            };
        });
        const v142SetRows = EQUIPMENT_SET_CATALOG_V142.map(set => {
            const canonicalSlots = set.category === 'attire' ? EQUIPMENT_ATTIRE_SLOTS_V142 : EQUIPMENT_JEWELRY_SLOTS_V142;
            const owned = state.equipment.items.filter(item => item.schema === 'equipment.v142' && item.setId === set.id);
            const equippedPieces = owned.filter(item => state.equipment.equipped[item.slot] === item.id).length;
            const ownedSlotIds = new Set(owned.map(item => item.slot));
            const fragmentBalance = Math.max(0, Number(v142SetFragmentWallet[set.id] ?? 0));
            return {
                setId:set.id,setName:set.name,category:set.category,identity:set.element ? `Ngũ Hành · ${set.element}` : 'Trang Sức',tags:['EquipmentV142',set.element ?? 'Jewelry'],description:`Bộ V142 · ${set.category === 'attire' ? '6 Y Trang' : '4 Trang Sức'} · Khắc bằng Tàn Ấn.`,
                unlocked:fragmentBalance>0||owned.length>0,ownedPieces:owned.length,ownedSlotCount:ownedSlotIds.size,equippedPieces,maxPieces:canonicalSlots.length,duplicatePieces:Math.max(0,owned.length-ownedSlotIds.size),
                ownedSlots:canonicalSlots.filter(slot=>ownedSlotIds.has(slot)).map(slot=>({slot,slotLabel:EQUIPMENT_SLOT_LABELS_V142[slot]??slot,itemCount:owned.filter(item=>item.slot===slot).length})),
                missingSlots:canonicalSlots.filter(slot=>!ownedSlotIds.has(slot)).map(slot=>({slot,slotLabel:EQUIPMENT_SLOT_LABELS_V142[slot]??slot})),
                thresholds:set.bonuses.map(def=>({pieces:def.pieces,name:def.name,description:def.name,active:equippedPieces>=def.pieces})),
                fragmentBalance,engraveCost:EQUIPMENT_SET_ENGRAVE_COST_UI_V142,
                acquisition:{targetDungeonName:set.category==='attire'?'Ngũ Hành Đạo Khố':'Linh Bội Bảo Khố',repeatTargetDrops:true,firstClearUnlocksCraft:false},
            };
        });
        const v142ActiveSets = v142SetRows.filter(set=>set.equippedPieces>0).map(set=>({setId:set.setId,setName:set.setName,category:set.category,equippedPieces:set.equippedPieces,maxPieces:set.maxPieces,thresholds:set.thresholds,pieces:[]}));
        return {
            schema: 'equipment-system.v106', v106: { schema: 'equipment-production.v106', canonicalRuntime: 'equipment-set.v116 + equipment-affix.v114', canonicalSlotCount: 10, liveElementSetCount: LIVE_EQUIPMENT_SET_CATALOG_V12310.length, liveSetMechanicCount: LIVE_EQUIPMENT_SET_CATALOG_V12310.reduce((sum, set) => sum + set.mechanics.length, 0), combatEngine: 'CombatKernel V2', legacyDaoHybridSetsRetired: true, daoInscriptionFoundationPreserved: true, daoInscriptionProductionWriteRetired: true }, canonicalSlotCount: 10,
            slots: CANONICAL_EQUIPMENT_SLOTS.map((id, index) => ({ index, id, label: EQUIPMENT_SLOT_LABELS[id], group: equipmentSlotGroup(id), ...(state.equipment.equipped[id] ? { equippedItemId: state.equipment.equipped[id] } : {}) })),
            equippedCount: equipped.length,
            groups: { attire: { label: 'Trang Phục Ngũ Hành', slotCount: 6, thresholds: [2, 4, 6] }, jewelry: { label: 'Phụ Kiện', slotCount: 4, thresholds: [] } },
            resources: {
                forgingEssence: state.inventory[EQUIPMENT_ENHANCE_ESSENCE_RESOURCE] ?? 0,
                protectionTalismans: state.inventory[EQUIPMENT_ANTI_DOWNGRADE_RESOURCE] ?? 0,
                transferGems: state.inventory[EQUIPMENT_TRANSFER_GEM_RESOURCE] ?? 0,
                spiritStones: state.inventory['resource.spirit_stone'] ?? 0,
                familyChangeCores: state.inventory[AFFIX_FAMILY_CHANGE_RESOURCE_V115] ?? 0,
                daoFragments: state.inventory[DAO_INSCRIPTION_FRAGMENT_RESOURCE_V115] ?? 0,
                familyChangeResourceName: AFFIX_FAMILY_CHANGE_RESOURCE_NAME_V115,
                daoFragmentResourceName: DAO_INSCRIPTION_FRAGMENT_RESOURCE_NAME_V115,
            },
            enhancement: { maxLevel: 20, breakpoints: [10, 15, 20].map(level => ({ level: level, bonusPct: enhancementBonusPct(level), successChancePct: enhancementSuccessChancePct(level), downgradeChancePct: enhancementDowngradeChancePct(level) })) },
            affixFamilies: Object.entries(EQUIPMENT_AFFIX_FAMILY_LABELS_V13821).map(([id, label]) => ({ id, label, live: LIVE_EQUIPMENT_AFFIX_FAMILIES_V13821.includes(id) })),
            capabilities: { enhancement: true, enhancementTransfer: true, affixReforge: true, affixRefine: true, daoInscription: true, daoInscriptionRuntimeLive: true, daoInscriptionLegacyDataPreserved: true, socketGems: true },
            daoInscriptionCatalog: V128_DAO_INSCRIPTIONS.map(x => ({ id: x.id, name: x.name, description: x.description })),
            gemCatalog: V128_EQUIPMENT_GEMS.map(x => ({ ...x, levels: [1,2,3,4,5].map(level => ({ level, effect: equipmentGemEffectV128({ element: x.id, level }).detail, cost: equipmentGemUpgradeCostV128(level) })) })),
            v128Resources: { daoFragments: { id: DAO_INSCRIPTION_FRAGMENT_RESOURCE_V115, name: DAO_INSCRIPTION_FRAGMENT_RESOURCE_NAME_V115, quantity: state.inventory[DAO_INSCRIPTION_FRAGMENT_RESOURCE_V115] ?? 0 }, gemBlanks: { id: EQUIPMENT_GEM_BLANK_RESOURCE_V128, name: EQUIPMENT_GEM_BLANK_RESOURCE_NAME_V128, quantity: state.inventory[EQUIPMENT_GEM_BLANK_RESOURCE_V128] ?? 0 } },
            sourceGuide: {
                broadLoot: { id: 'hunt', name: 'Săn Yêu', description: 'Nguồn loot rộng online/offline; phù hợp tìm nâng cấp chung, phẩm/cấp cao hơn và tài nguyên.' },
                setDungeons: [
                    { id: V122_TARGET_SET_DUNGEONS.elementAttire, name: 'Ngũ Hành Đạo Khố', category: 'elementAttire', description: '5 tầng; mỗi tầng ứng đúng một bộ Trang Phục Kim/Mộc/Thủy/Hỏa/Thổ.' },
                ],
                accessoryDungeon: { id: V122_TARGET_SET_DUNGEONS.jewelry, name: 'Linh Bội Bảo Khố', description: '4 tầng; nguồn nhắm đích cho Ngọc Bội, Nhẫn, Vòng và Hộ Phù thường. Phụ kiện không có Set riêng.' },
                manualTrial: { id: V122_TARGET_SET_DUNGEONS.daoAttire, name: 'Bát Đạo Chân Điện', description: 'Thử luyện 8 Bản Đạo. Không rơi Set Bản Đạo; Bí Tịch Trấn Phái đi theo Chủ Đạo và mở sâu bằng Đạo Hạnh từ chiến đấu thật.' },
                forgeDungeon: { id: V122_FORGE_DUNGEON_ID, name: 'Thiên Công Luyện Vực', description: '8 tầng Phàm→Phá; nguồn nhắm đích cho vật liệu Luyện Đồ gồm Tinh Hoa, Tinh Khoáng, Chuyển Tính Thạch, Bùa Chống Tụt và Ngọc Chuyển Cường Hóa.' },
            },
            v142: { schema:'equipment-ui.v142', craftCostPerItem:EQUIPMENT_FRAGMENT_CRAFT_COST_UI_V142, refineRatio:EQUIPMENT_FRAGMENT_REFINE_RATIO_UI_V142, setEngraveCostPerItem:EQUIPMENT_SET_ENGRAVE_COST_UI_V142, maxEnhancementLevel:EQUIPMENT_MAX_ENHANCEMENT_V142, maxRankIndex:v142MaxRankIndex, slots:EQUIPMENT_SLOTS_V142.map(slot=>({id:slot,label:EQUIPMENT_SLOT_LABELS_V142[slot]??slot,group:EQUIPMENT_ATTIRE_SLOTS_V142.includes(slot)?'attire':'jewelry'})), fragmentRows:Array.from({length:v142MaxRankIndex+1},(_,rankIndex)=>({rankIndex,rankName:equipmentRankNameV142(rankIndex),balance:Math.max(0,Number(v142FragmentWallet[rankIndex]??0)),craftCost:EQUIPMENT_FRAGMENT_CRAFT_COST_UI_V142,craftable:Math.max(0,Number(v142FragmentWallet[rankIndex]??0))>=EQUIPMENT_FRAGMENT_CRAFT_COST_UI_V142,refinable:rankIndex<v142MaxRankIndex&&Math.max(0,Number(v142FragmentWallet[rankIndex]??0))>=EQUIPMENT_FRAGMENT_REFINE_RATIO_UI_V142})), setRows:v142SetRows, itemCount:state.equipment.items.filter(item=>item.schema==='equipment.v142').length },
            sets:[...sets,...v142ActiveSets], setCatalog:[...setCatalog,...v142SetRows],
        };
    }
    artifacts() {
        const state = this.session.state;
        const resonanceNames = this.registry.artifactResonances;
        return [...state.artifacts.items]
            .sort((a, b) => b.itemLevel - a.itemLevel || a.name.localeCompare(b.name))
            .map((item, i) => ({
            index: i + 1,
            id: item.id,
            name: item.name,
            active: state.artifacts.activeIds.includes(item.id),
            tier: artifactTierName(item.tier),
            quality: artifactQualityName(item.quality),
            nourishmentStage: item.nourishmentStage,
            spirit: item.spirit.state === 'awakened' ? (item.spirit.name ?? 'Khí Linh') : item.spirit.state,
            yearsOwned: item.history.yearsOwned,
            battles: item.history.battles,
            resonance: item.resonanceId ? resonanceNames.get(item.resonanceId)?.name : undefined,
        }));
    }
    guidance() {
        const state = this.session.guidanceState();
        const decision = this.session.previewGuidance();
        return {
            enabled: state.enabled,
            risk: state.risk,
            goals: state.goals.map(goal => ({ ...goal })),
            preview: decision.candidates.slice(0, 8).map(candidate => ({
                score: candidate.score,
                summary: candidate.summary,
                blocked: candidate.blockers.length > 0,
                trace: candidate.blockers.length ? candidate.blockers.join(' ') : candidate.reasons.join(' · '),
            })),
            recentDecisions: state.decisionHistory.slice(-8).map(entry => ({ worldYear: entry.worldYear, summary: entry.summary, reasons: [...entry.reasons] })),
            automation: normalizeGuidanceAutomationPolicy(state.automationPolicy),
        };
    }
    journal(limit = 12) {
        return this.session.notableHistory(limit).map(event => ({
            worldYear: event.worldTimeYears,
            ageYears: event.ageYears,
            significance: event.significance,
            message: event.message,
            tags: [...event.tags],
        }));
    }
    worldHistory(limit = 12) {
        return this.session.worldHistory(limit).map(event => ({
            worldYear: event.worldTimeYears,
            significance: event.significance,
            message: event.message,
            tags: [...event.tags],
        }));
    }
    locations() {
        const state = this.session.state;
        const known = new Set(state.knownLocationIds);
        const visibleIds = new Set(state.knownLocationIds);
        const current = this.world.locations[state.locationId];
        for (const neighbor of current?.neighbors ?? [])
            visibleIds.add(neighbor);
        return [...visibleIds]
            .map(id => this.world.locations[id])
            .filter((location) => Boolean(location))
            .sort((a, b) => Number(b.id === state.locationId) - Number(a.id === state.locationId) || a.name.localeCompare(b.name))
            .map((location, i) => ({
            index: i + 1,
            id: location.id,
            name: location.name,
            known: known.has(location.id),
            current: location.id === state.locationId,
            danger: location.danger,
            planeId: location.planeId,
            requiredRealmOrder: location.requiredRealmOrder,
            spatialDistance: location.spatialDistance,
            neighbors: location.neighbors.map(id => this.world.locations[id]?.name ?? id),
            resources: location.resources.map(node => node.name),
        }));
    }
    inventory() {
        return Object.entries(this.session.state.inventory)
            .filter(([, quantity]) => quantity > 0)
            .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
            .map(([id, quantity]) => ({ id, name: resourceName(id), quantity }));
    }
    myriadLives() {
        return buildMyriadLivesV141.call(this);
    }
    settlement() {
        const archive = this.session.meta.archives.find(item => item.lifeId === this.session.currentLife.lifeId);
        if (!archive)
            return undefined;
        return {
            lifeId: archive.lifeId,
            grade: archive.grade,
            totalScore: archive.totalScore,
            cpEarned: archive.cpEarned,
            causeOfDeath: archive.causeOfDeath,
            categories: Object.values(archive.categories).map(category => ({
                name: categoryDisplayName(category.category), score: category.score, reasons: [...category.reasons],
            })),
            origins: archive.originGains.map(origin => ({ name: origin.name, value: origin.value, reason: origin.reason })),
            mingJiGain: archive.mingJiGain ?? 0,
            mingJiDomainGains: { ...(archive.mingJiDomainGains ?? {}) },
            chronicle: archive.chronicle.map(entry => ({ ageYears: entry.ageYears, text: entry.text })),
            legacy: archive.legacy?.summary,
            reincarnationXpGain: archive.reincarnationLegacy?.xp ?? 0,
            talentPointGain: archive.talentPointGain ?? 0,
        };
    }
    fateEmbryo() {
        const summary = this.session.fateEmbryoSummary();
        return { ...summary, mingJi: this.session.meta.mingJi ?? 0, mingJiDomains: { ...(this.session.meta.mingJiDomains ?? {}) } };
    }
    talents() {
        const summary = this.session.reincarnationTalentSummary();
        const seal = this.session.reincarnationSummary().sealLevel;
        return {
            ...summary,
            sealLevel: seal,
            nodes: summary.nodes.map(node => ({
                ...node,
                unlocked: seal >= node.requiredSeal && (!node.prerequisite || summary.nodes.find(candidate => candidate.id === node.prerequisite.id).rank >= node.prerequisite.rank),
            })),
        };
    }
    reincarnation() {
        const summary = this.session.reincarnationSummary();
        const meta = this.session.meta;
        const state = this.session.state;
        const orientations = availableOrientations(summary.sealLevel).map(x => ({ id: x.id, name: x.name, description: x.description, cpCost: x.cpCost, requiredSeal: x.requiredSeal }));
        const unlocked = new Set(orientations.map(x => x.id));
        const reasonTrace = [];
        let recommendedOrientation = 'balanced';
        if (unlocked.has('creation_embryo') && (state.immortal.creationSource >= 45 || state.immortal.genesisAuthority >= 45)) {
            recommendedOrientation = 'creation_embryo';
            reasonTrace.push('Sáng Thế tích lũy cao: ưu tiên khuôn có dung lượng Creation lớn.');
        }
        else if (unlocked.has('chaos_embryo') && (state.immortal.chaosAffinity >= 55 || state.immortal.chaosBody >= 55)) {
            recommendedOrientation = 'chaos_embryo';
            reasonTrace.push('Hỗn Độn tương thích đã thành sở trường: giữ hướng phát triển hậu kỳ này.');
        }
        else if (unlocked.has('dao_embryo') && state.dao.mainDaoId) {
            recommendedOrientation = 'dao_embryo';
            reasonTrace.push(`Đời hiện tại đã có Chủ Đạo ${state.dao.mainDaoId}: Đạo Thai giúp tái lĩnh ngộ sớm hơn nhưng không bê depth cũ sang.`);
        }
        else if (unlocked.has('pure_soul') && state.soul.awakened && state.soul.strength >= 80) {
            recommendedOrientation = 'pure_soul';
            reasonTrace.push('Thần Hồn là thành tựu nổi bật của đời này: ưu tiên Hồn Thai để tiếp tục chuyên sâu.');
        }
        else if (unlocked.has('myriad_arts') && Object.keys(state.character.techniqueMastery ?? {}).length >= 2) {
            recommendedOrientation = 'myriad_arts';
            reasonTrace.push('Đã tích nhiều Công Pháp: Vạn Pháp Thai hợp lối chơi breadth/Active Manifestation.');
        }
        else if (unlocked.has('battle_body')) {
            recommendedOrientation = 'battle_body';
            reasonTrace.push('Chưa có hướng hậu kỳ áp đảo: Chiến Thể là lựa chọn chuyên Nhục Thân/Huyết Mạch rõ ràng.');
        }
        else
            reasonTrace.push('Ấn hiện tại chưa mở định hướng chuyên sâu; giữ Balanced để không hy sinh dung lượng nào.');
        const suggestedLocks = [];
        if (summary.fateLockSlots > 0 && this.session.currentLife.birth.spiritualRootId)
            suggestedLocks.push(`root=${this.session.currentLife.birth.spiritualRootId}`);
        if (summary.fateLockSlots > suggestedLocks.length && this.session.currentLife.birth.physiqueId)
            suggestedLocks.push(`physique=${this.session.currentLife.birth.physiqueId}`);
        if (summary.fateLockSlots > suggestedLocks.length && this.session.currentLife.birth.bloodlineId)
            suggestedLocks.push(`bloodline=${this.session.currentLife.birth.bloodlineId}`);
        if (suggestedLocks.length)
            reasonTrace.push('Fate Lock gợi ý giữ những Tiên Thiên đã chứng minh hiệu quả ở đời hiện tại; đây chỉ là đề xuất, không tự tiêu CP.');
        return {
            ...summary, cp: meta.currentCp, mingJi: meta.mingJi ?? 0, talents: this.talents(),
            birthCandidates: this.session.previewReincarnationBirths(),
            orientations,
            aiRecommendation: { orientationId: recommendedOrientation, suggestedLocks, reasonTrace },
            fateLockOptions: {
                roots: [...this.registry.spiritualRoots.values()].map(x => ({ id: x.id, name: x.name })),
                physiques: [...this.registry.characterPhysiques.values()].map(x => ({ id: x.id, name: x.name })),
                bloodlines: [...this.registry.bloodlines.values()].map(x => ({ id: x.id, name: x.name })),
                families: birthFamilyDefinitions.filter(x => x.requiredSeal <= summary.sealLevel).map(x => x.name),
                fates: ['Bình Mệnh', 'Kiếm Duyên', 'Phong Lôi Tương Phùng', 'Loạn Thế Chi Mệnh', 'Ẩn Mệnh'],
            },
            recoverableRelics: this.session.recoverableArtifactRelics().map((r, index) => ({ index: index + 1, id: r.artifact.id, name: r.artifact.name, sourceLifeId: r.sourceLifeId, lostLocationId: r.lostLocationId })),
        };
    }
    soul() {
        const summary = this.session.soulSummary();
        const state = this.session.state;
        const assignments = state.dungeons.assignments;
        const assignableTargets = state.dungeons.unlockedDungeonIds.flatMap(dungeonId => {
            const maxFloor = highestClearedDungeonFloor(state.dungeons, dungeonId);
            if (maxFloor <= 0)
                return [];
            const dungeon = this.world.dungeons[dungeonId];
            return Array.from({ length: maxFloor }, (_, i) => ({ dungeonId, dungeonName: dungeon?.name ?? dungeonId, floor: i + 1, purpose: dungeon?.purpose ?? 'general' }));
        });
        const recommendedTargets = state.dungeons.unlockedDungeonIds.flatMap(dungeonId => {
            const maxFloor = highestClearedDungeonFloor(state.dungeons, dungeonId);
            if (maxFloor <= 0)
                return [];
            const dungeon = this.world.dungeons[dungeonId];
            return [{ dungeonId, dungeonName: dungeon?.name ?? dungeonId, floor: maxFloor, purpose: dungeon?.purpose ?? 'general' }];
        });
        const midgame = this.session.nascentMidgameV112();
        return {
            awakened: summary.soul.awakened,
            unlockRealmOrder: 22,
            strength: summary.soul.strength, purity: summary.soul.purity, stability: summary.soul.stability, insight: summary.soul.insight,
            loadCapacity: summary.soul.loadCapacity, totalLoad: summary.totalLoad, pressureMultiplier: summary.pressureMultiplier,
            parallelCapacity: state.dungeons.parallelWorkerCapacity,
            cloneAuthorityCapacity: summary.authority.capacity,
            cloneAuthorityMax: summary.authority.maxCapacity,
            activeCloneCount: summary.authority.activeOwned,
            sealedCloneCount: summary.authority.sealedOwned,
            nextCloneAuthorityMilestone: summary.authority.nextMilestone,
            canCreateClone: summary.soul.clones.length < summary.authority.capacity,
            legacyParallelWorkerCapacityIsNotAuthority: true,
            resources: { soulDew: state.inventory['resource.soul_dew'] ?? 0, soulEssence: state.inventory['resource.soul_essence'] ?? 0 },
            nourishCostPerBatch: { soulDew: 4, soulEssence: 1 },
            nextCloneCost: { soulDew: 18 + summary.soul.clones.length * 8, soulEssence: 6 + summary.soul.clones.length * 3 },
            sixDao: summary.sixDao.map(x => ({ ...x })),
            nextCloneDao: summary.sixDao[summary.soul.clones.length] ? { ...summary.sixDao[summary.soul.clones.length] } : undefined,
            specializationRuleV127: 'Lục Đạo cố định theo thứ tự; đúng chuyên môn tăng từ ×1.20 tới ×1.30 theo Đạo Hạnh/Ấn, ngoài chuyên môn ×1.00; không chọn specialization khi tạo.',
            assignableTargets,
            recommendedTargets,
            midgame,
            clones: summary.soul.clones.map((clone, index) => ({
                index: index + 1, ...clone, authorityUnlocked: index < summary.authority.capacity, sealedByV127Migration: index >= summary.authority.capacity, assignment: index < summary.authority.capacity && assignments[clone.id] ? { ...assignments[clone.id] } : undefined,
                assignmentRecommendations: [...recommendedTargets].sort((a, b) => {
                    const aMatch = clone.specialization === a.purpose || (clone.specializationPurposes ?? []).includes(a.purpose) ? 1 : 0;
                    const bMatch = clone.specialization === b.purpose || (clone.specializationPurposes ?? []).includes(b.purpose) ? 1 : 0;
                    return bMatch - aMatch || b.floor - a.floor || a.dungeonName.localeCompare(b.dungeonName, 'vi');
                }).slice(0, 8),
            })),
        };
    }
    faction() {
        const state = this.session.state;
        const membership = this.session.factionMembership();
        const rankNames = { outerDisciple: 'Ngoại Môn Đệ Tử', innerDisciple: 'Nội Môn Đệ Tử', coreDisciple: 'Chân Truyền Đệ Tử', elder: 'Trưởng Lão', leader: 'Tông Chủ' };
        const promotionRequirements = [
            { rank: 'outerDisciple', minMerit: 0, minRealmOrder: 0 }, { rank: 'innerDisciple', minMerit: 40, minRealmOrder: 3 },
            { rank: 'coreDisciple', minMerit: 140, minRealmOrder: 9 }, { rank: 'elder', minMerit: 420, minRealmOrder: 14 }, { rank: 'leader', minMerit: Number.POSITIVE_INFINITY, minRealmOrder: 18 },
        ];
        const rankIndex = membership ? promotionRequirements.findIndex(item => item.rank === membership.rank) : -1;
        const nextPromotion = membership && rankIndex >= 0 && rankIndex + 1 < promotionRequirements.length ? promotionRequirements[rankIndex + 1] : undefined;
        const factions = Object.values(state.factions.factions).map((faction, index) => {
            const activeMembers = Object.values(faction.members).filter(member => member.active);
            return {
                index: index + 1, id: faction.id, name: faction.name, locationId: faction.locationId, locationName: this.world.locations[faction.locationId]?.name ?? faction.locationId,
                doctrineTags: [...faction.doctrineTags], prestige: faction.prestige, stability: faction.stability, treasury: { ...faction.treasury }, facilities: { ...faction.facilities }, archive: { techniqueIds: [...faction.archive.techniqueIds], skillIds: [...faction.archive.skillIds], recipeIds: [...faction.archive.recipeIds] },
                members: activeMembers.map(member => ({ ...member, name: member.memberType === 'npc' ? (this.world.npcs?.[member.memberId]?.name ?? member.memberId) : 'Người Chơi' })),
                memberCount: activeMembers.length, current: membership?.factionId === faction.id, canJoin: !membership && state.locationId === faction.locationId,
            };
        });
        const currentFaction = membership ? factions.find(item => item.id === membership.factionId) : undefined;
        const canManageMembers = Boolean(membership && (membership.rank === 'elder' || membership.rank === 'leader'));
        const occupiedNpcIds = new Set(Object.values(state.factions.factions).flatMap(faction => Object.values(faction.members).filter(member => member.active && member.memberType === 'npc').map(member => member.memberId)));
        const recruitCandidates = canManageMembers ? Object.entries(state.worldSimulation.npcs).filter(([npcId, npc]) => {
            if (!npc.alive || npc.locationId !== state.locationId || occupiedNpcIds.has(npcId))
                return false;
            const relation = this.session.npcRelationship(npcId);
            return Boolean(relation?.met && relation.trust >= 28 && relation.respect >= 20 && relation.grudge <= 20);
        }).map(([npcId, npc]) => ({ id: npcId, name: this.world.npcs?.[npcId]?.name ?? npcId, realmOrder: npc.realmOrder })) : [];
        const contributableKnowledge = membership ? [
            ...state.character.knownTechniqueIds.filter(id => !currentFaction?.archive.techniqueIds.includes(id)).map(id => ({ kind: 'technique', id, name: this.registry.technique(id)?.name ?? id })),
            ...state.character.knownSkillIds.filter(id => !currentFaction?.archive.skillIds.includes(id)).map(id => ({ kind: 'skill', id, name: this.registry.skill(id)?.name ?? id })),
        ].slice(0, 12) : [];
        return {
            currentLocationId: state.locationId, currentLocationName: this.world.locations[state.locationId]?.name ?? state.locationId,
            membership: membership ? { ...membership, rankName: rankNames[membership.rank] ?? membership.rank } : undefined,
            nextPromotion: nextPromotion ? { ...nextPromotion, name: rankNames[nextPromotion.rank], canPromote: membership.merit >= nextPromotion.minMerit && state.realm.maxRealmOrder >= nextPromotion.minRealmOrder } : undefined,
            canFound: !membership && state.realm.maxRealmOrder >= 14 && (state.inventory['resource.spirit_stone'] ?? 0) >= 300,
            canManageMembers, recruitCandidates, contributableKnowledge,
            foundCostSpiritStones: 300, spiritStones: state.inventory['resource.spirit_stone'] ?? 0, factions,
            history: this.session.factionHistory(10).map(event => ({ worldYear: event.worldTimeYears, significance: event.significance, message: event.message, tags: [...event.tags] })),
        };
    }
    social() {
        const state = this.session.state;
        const bonds = this.session.socialBonds();
        const bondByNpc = new Map(bonds.map(bond => [bond.npcId, bond]));
        const actionDefinitions = [
            { id: 'greet', name: 'Kết Giao' }, { id: 'assist', name: 'Tương Trợ', spiritStoneCost: 5 }, { id: 'daoDiscussion', name: 'Luận Đạo' }, { id: 'gift', name: 'Tặng Lễ', spiritStoneCost: 10 }, { id: 'provoke', name: 'Khiêu Khích' },
        ];
        const npcs = Object.entries(state.worldSimulation.npcs).filter(([, npc]) => npc.alive && npc.locationId === state.locationId).map(([npcId, npc], index) => {
            const def = this.world.npcs?.[npcId];
            const relation = this.session.npcRelationship(npcId) ?? { met: false, trust: 0, respect: 0, debt: 0, grudge: 0, karmaDepth: 0, flags: [] };
            const activeRole = bondByNpc.get(npcId)?.role;
            const rolePreviews = ['master', 'disciple', 'daoPartner'].map(role => this.session.npcSocialRolePreviewV128(npcId, role));
            const roleById = Object.fromEntries(rolePreviews.map(item => [item.role, item]));
            return {
                index: index + 1, id: npcId, name: def?.name ?? npcId, realmOrder: npc.realmOrder, met: Boolean(relation.met),
                relation: { trust: relation.trust ?? 0, respect: relation.respect ?? 0, debt: relation.debt ?? 0, grudge: relation.grudge ?? 0, karmaDepth: relation.karmaDepth ?? 0, flags: [...(relation.flags ?? [])] },
                activeRole,
                actions: actionDefinitions.map(action => ({ ...action, ...this.session.npcInteractionPreviewV128(npcId, action.id) })),
                roles: rolePreviews,
                eligibility: { master: roleById.master?.available ?? false, disciple: roleById.disciple?.available ?? false, daoPartner: roleById.daoPartner?.available ?? false },
            };
        });
        return {
            currentLocationId: state.locationId, currentLocationName: this.world.locations[state.locationId]?.name ?? state.locationId,
            spiritStones: Number(state.inventory['resource.spirit_stone'] ?? 0),
            interactionCooldownYears: 0.2,
            actions: actionDefinitions,
            npcs, bonds: bonds.map(bond => ({ ...bond, npcName: this.world.npcs?.[bond.npcId]?.name ?? bond.npcId })),
            family: this.session.familyMembers().map(member => ({ ...member })),
            history: this.session.socialHistory(10).map(event => ({ worldYear: event.worldTimeYears, significance: event.significance, message: event.message, tags: [...event.tags] })),
        };
    }
    dao() {
        const state = this.session.daoSummary();
        const battleDao = this.session.state.character.buildFoundation?.battleDao;
        const battleDaoId = battleDao?.committed ? battleDao.mainDaoId : undefined;
        const canonicalDaoId = battleDaoId ? `dao.${battleDaoId}` : undefined;
        const canonicalDefinition = canonicalDaoId ? this.registry.dao(canonicalDaoId) : undefined;
        const progress = canonicalDaoId ? state.known[canonicalDaoId] : undefined;
        const interpretation = progress && canonicalDefinition ? canonicalDefinition.interpretations.find(item => item.id === progress.interpretationId) : undefined;
        const legacyMainDaoId = state.mainDaoId && this.registry.dao(state.mainDaoId).legacy ? state.mainDaoId : undefined;
        let contemplationPreview;
        if (state.awakened && canonicalDaoId)
            contemplationPreview = this.session.previewDaoContemplation(canonicalDaoId, 1);
        return {
            awakened: state.awakened, unlockRealmOrder: 26, lockedToBattleDao: true, battleDaoId, canonicalDaoId, canonicalDaoName: canonicalDefinition?.name, legacyMainDaoId,
            mainDaoId: canonicalDaoId ?? state.mainDaoId, mainDaoName: canonicalDefinition?.name ?? (state.mainDaoId ? this.registry.dao(state.mainDaoId).name : undefined),
            domain: { ...state.domain, available: Boolean(progress?.interpretationId && progress.depth >= 60) }, totalInsight: state.totalInsight, contemplationPreview,
            selected: progress && canonicalDefinition ? { ...progress, name: canonicalDefinition.name, stage: progress.depth < 20 ? 'Cảm Đạo' : progress.depth < 40 ? 'Đạo Ý' : progress.depth < 60 ? 'Đạo Thế' : progress.depth < 80 ? 'Sơ Thành Đạo Vực' : 'Đạo Vực Viên Dung', interpretation: interpretation?.name, interpretations: canonicalDefinition.interpretations.map(item => ({ id: item.id, name: item.name })) } : undefined,
            known: Object.values(state.known).map((knownProgress, index) => {
                const definition = this.registry.dao(knownProgress.daoId);
                const selectedInterpretation = definition.interpretations.find(item => item.id === knownProgress.interpretationId);
                return { index: index + 1, ...knownProgress, name: definition.name, legacy: Boolean(definition.legacy), interpretation: selectedInterpretation?.name };
            }),
            available: [...this.registry.daos.values()].filter(definition => !definition.legacy).map((definition, index) => ({ index: index + 1, id: definition.id, battleDaoId: definition.battleDaoId, name: definition.name, selected: definition.id === canonicalDaoId, known: Boolean(state.known[definition.id]) })),
        };
    }
    flow() {
        return buildGameplayFlow.call(this);
    }
    describeRoutine(plan) {
        const request = plan.request;
        if (request.type === 'gather')
            return `Thu Thập · ${plan.yearsPerRealHour} năm/giờ thực`;
        if (request.type === 'hunt')
            return `Săn Yêu · ${plan.yearsPerRealHour} năm/giờ thực`;
        if (request.type === 'dungeon')
            return `${this.world.dungeons[request.dungeonId]?.name ?? request.dungeonId} tầng ${request.floor ?? 1} · ${plan.yearsPerRealHour} năm/giờ thực`;
        return 'Du Hành';
    }
    query(view) {
        switch (view) {
            case 'dashboard': return this.dashboard();
            case 'character': return this.character();
            case 'dungeons': return this.dungeons();
            case 'equipment': return this.equipment();
            case 'artifacts': return this.artifacts();
            case 'guidance': return this.guidance();
            case 'journal': return this.journal();
            case 'world': return this.worldHistory();
            case 'inventory': return this.inventory();
            case 'locations': return this.locations();
            case 'flow': return this.flow();
            case 'settlement': return this.settlement();
            case 'soul': return this.soul();
            case 'dao': return this.dao();
            case 'fateEmbryo': return this.fateEmbryo();
            case 'reincarnation': return this.reincarnation();
            case 'talents': return this.talents();
            case 'myriadLives': return this.myriadLives();
            case 'guide': return this.playerExperienceV105();
            case 'orthodoxy': return this.orthodoxy();
            case 'genesisWorlds': return this.genesisWorlds();
            case 'ascendants': return this.ascendants();
            case 'power': return this.personalPower();
            case 'overview': return this.overview();
            case 'build': return this.buildSheet();
            case 'combatReview': return this.combatReview();
            case 'reincarnationHub': return this.reincarnationHub();
            case 'earlyGameSlice': return this.earlyGameSlice();
            case 'automation': return this.automationPolicy();
            case 'telemetry': return this.playtestTelemetry();
            case 'saveIntegrity': return this.saveIntegrity();
        }
    }
    orthodoxy() {
        const state = this.session.orthodoxyState();
        const membership = this.session.factionMembership();
        return { membership, own: membership ? state.orthodoxies[membership.factionId] : undefined, economy: this.session.orthodoxyEconomy(), orthodoxies: Object.values(state.orthodoxies).map((o, index) => ({ index: index + 1, ...o })), wars: Object.values(state.wars).map((w, index) => ({ index: index + 1, ...w })), relations: Object.values(state.relations).map((r, index) => ({ index: index + 1, ...r })), leagues: Object.values(state.leagues).map((l, index) => ({ index: index + 1, ...l })), territoryOwnerByLocation: { ...state.territoryOwnerByLocation } };
    }
    ascendants() { const state = this.session.outerAscendantState(); return Object.values(state.actors).sort((a, b) => b.power - a.power).map((a, index) => ({ index: index + 1, ...a, deeds: [...a.deeds] })); }
    genesisWorlds() {
        const state = this.session.genesisWorldState();
        return Object.values(state.worlds).map((w, index) => ({ index: index + 1, ...w, laws: { ...w.laws }, chronicle: w.chronicle.map(e => ({ ...e })) }));
    }
    dispatch(command) {
        return dispatchGameplayCommand.call(this, command);
    }
    snapshot() {
        return this.session.snapshot();
    }
    result(type, beforeYear, summaryLines, data, wakeReason) {
        return { ok: true, type, summaryLines, changedWorldYears: this.session.state.worldTimeYears - beforeYear, data, wakeReason };
    }
}
//# sourceMappingURL=gameplay.js.map