import { SeededRng } from './rng.js';
import { adjustedCastTime, adjustedRecoveryTime, critLayers, critMultiplier, effectiveStats, evadeChancePct } from './stats.js';
import { chooseSkill } from './ai.js';
import { tacticalIdentity } from './combat-roles.js';
import { addResourceV117, createFiveElementCombatStateV117, finishSkillActionRuntimeV117, onMitigationEventV117, prepareSkillActionRuntimeV117, rootUnlockedV117, setMechanicV117, skillCastTimeMultiplierFromRuntimeV117, skillSpiritCostMultiplierFromRuntimeV117, updateElementTimersV117, } from './five-element-combat-v117.js';
import { skillDomainsV117, skillRuntimeV117, skillSlotClassV117 } from './skill-runtime-v117.js';
import { adjustDaoDotV118, adjustDaoMarkStacksV118, createBattleDaoCombatStateV118, daoCastTimeMultiplierV118, daoMarkCapV118, daoRecoveryMultiplierForTargetV118, daoSpiritCostMultiplierV118, effectiveSkillRootV118, finishBattleDaoActionV118, onBattleDaoInterruptedV120, onMitigationEventV118, formationFieldGuardV133, prepareBattleDaoActionV118, updateBattleDaoTimersV120, } from './battle-dao-combat-v118.js';
import { skillPracticeProfileFromTierV125 } from './specialization-skill-progression-v125.js';
import { elementSealDamageCoefficientV133 } from './element-seal-v133.js';
import { battleDaoSkillGrowthProfileV126 } from './battle-dao-skill-growth-v126.js';
import { skillProgressEffectBonusFromRuntimeV12317, skillSecondaryEffectBonusPctV12317 } from './skill-heart-method-v12317.js';
import { addPoisonSeedStageV2, battleDaoV2BreakMultiplier, battleDaoV2Enabled, battleDaoV2HealShieldMultiplier, battleDaoV2IncomingDamageMultiplier, battleDaoV2OutgoingMultiplier, battleDaoV2SpiritCostMultiplier, consumePoisonSeedStageV2, createBattleDaoRuntimeStateV2, createRootActionV2, claimDamagingFollowUpV2, finishRemainingDaoActionV2, onBattleDaoV2HpDamageTaken, onBattleDaoV2Mitigation, prepareRemainingDaoCoreActionV2, v2ResourceProjection, prepareSwordCoreActionV2, recordDamageOutcomeV2, resolveSwordIntentAfterRootV2, swordIntentBonusesV2, swordQiGenerateAfterActionV2, swordQiSpendBeforeActionV2, swordV2ActionTuning, swordV2ChannelProfile, swordV2CritHeartBonusPct, swordV2DirectDamageMultiplier, swordV2EffectsForSkill, syncBattleDaoV2Timers, } from './battle-dao-v2-runtime.js';
import { cloneTechniqueCombatRuntimeV119, initializeTechniqueCombatStateV119, techniqueBloodSacrificeCapPctV119, techniqueBreakLimitExtraPctV119, techniqueBurnBloodEfficiencyV119, techniqueCastMultiplierV119, techniqueCooldownReductionPctV119, techniqueCooldownReturnInternalSecondsV119, techniqueCooldownReturnPctV119, techniqueCooldownReturnSpiritCostPctV119, techniqueDamageReductionAdjustmentPctV119, techniqueDeferredDamagePctV119, techniqueEquippedMasteryV119, techniqueGuidingReturnInternalSecondsV119, techniqueGuidingReturnRestoreStandardPctV119, techniqueHealingReceivedMultiplierV119, techniqueInterruptResistPctV119, techniqueRecoveryMultiplierV119, techniqueShieldConsumeEffectBonusPctV119, techniqueShieldConsumePctV119, techniqueSpiritCostMultiplierV119, techniqueSpiritOverflowToGaugePctV119, techniqueSpiritRegenMultiplierV119 } from './technique-runtime-v119.js';
import { bossDangerMetaV81 } from './boss-gameplay-v2.js';
import { COMBAT_RULES, actionSpeedMultiplier, combatMaxHp, combatSpiritStandard, combineBoundedPct, combinedHeartCritMultiplier, controlDurationReductionPct, cooldownProfile, critLayerName, critProfile, defenseFactor, dodgeProfile, effectiveControlDuration, elementAffinity, elementResistanceMultiplier, fiveElementBreakMultiplier, fiveElementCounter, fiveElementDamageMultiplier, heartProfile, rawElementalDamage, skillTrueEssenceCost, totalDamageReductionPct, } from './combat-rules.js';
function simpleSetParamV12318(entity, mechanic, key) {
    return setMechanicV117(entity, mechanic)?.params[key] ?? 0;
}
export class CombatEngine {
    registry;
    seed;
    rng;
    logs = [];
    entities = new Map();
    queue = [];
    order = 0;
    castToken = 0;
    channelToken = 0;
    constructor(registry, seed, entityDefinitions) {
        this.registry = registry;
        this.seed = seed;
        this.rng = new SeededRng(seed);
        for (const def of entityDefinitions) {
            this.entities.set(def.id, this.instantiate(def));
        }
    }
    instantiate(def) {
        const maxHp = combatMaxHp(def.stats);
        const entity = {
            id: def.id,
            combatModel: def.combatModel ?? 'legacy',
            name: def.name,
            tags: [...def.tags],
            baseStats: { ...def.stats, maxHp },
            hp: maxHp,
            spirit: def.stats.maxSpirit,
            skillIds: [...def.skillIds],
            cooldownUntil: {},
            statuses: [],
            shields: [],
            marks: {},
            triggers: [...(def.triggers ?? [])],
            triggerState: {},
            aiProfile: {
                name: def.aiProfile.name,
                rules: def.aiProfile.rules.map(rule => ({ ...rule, conditions: rule.conditions.map(condition => ({ ...condition })) })),
            },
            phases: [...(def.phases ?? [])]
                .sort((a, b) => b.hpBelowPct - a.hpBelowPct)
                .map(phase => ({
                ...phase,
                aiProfile: phase.aiProfile ? {
                    name: phase.aiProfile.name,
                    rules: phase.aiProfile.rules.map(rule => ({ ...rule, conditions: rule.conditions.map(condition => ({ ...condition })) })),
                } : undefined,
                onEnterEffects: phase.onEnterEffects?.map(effect => ({ ...effect })),
                counterWindow: phase.counterWindow ? {
                    ...phase.counterWindow,
                    trigger: { ...phase.counterWindow.trigger, ...(phase.counterWindow.trigger.type === 'skillRole' ? { roles: [...phase.counterWindow.trigger.roles] } : {}) },
                    onSuccessEffects: phase.counterWindow.onSuccessEffects?.map(effect => ({ ...effect })),
                    onFailureEffects: phase.counterWindow.onFailureEffects?.map(effect => ({ ...effect })),
                } : undefined,
            })),
            enteredPhaseIds: [],
            activeCounterWindow: undefined,
            dodgePressure: 0,
            controlPressure: {},
            poise: 100,
            lastBreakDamageAt: -Infinity,
            breakDebuffUntil: 0,
            breakRecoveryStartedAt: 0,
            breakRecoveryEndsAt: 0,
            stableUntil: 0,
            controlChainSeconds: 0,
            controlChainUntil: 0,
            controlChainLastEndedAt: -Infinity,
            controlImmunityUntil: 0,
            controlChainToken: 0,
            bloodBreath: 0,
            lastContinuousUpdateAt: 0,
            channelHitRemainders: {},
            fiveElementsV117: def.initialFiveElementsV117 ? { ...createFiveElementCombatStateV117(), ...def.initialFiveElementsV117 } : createFiveElementCombatStateV117(),
            daoStateV118: def.initialDaoStateV118 ? { ...createBattleDaoCombatStateV118(), ...def.initialDaoStateV118 } : createBattleDaoCombatStateV118(),
            battleDaoStateV2: def.initialBattleDaoStateV2 ? structuredClone(def.initialBattleDaoStateV2) : undefined,
            ultimateGaugeV117: Math.max(0, Math.min(100, def.initialUltimateGaugeV117 ?? 0)),
            combatBuildV117: def.combatBuildV117 ? {
                ...def.combatBuildV117,
                rootUnlocked: { ...(def.combatBuildV117.rootUnlocked ?? {}) },
                rootEffectivenessPct: { ...(def.combatBuildV117.rootEffectivenessPct ?? {}) },
                rootLevelsV133: { ...(def.combatBuildV117.rootLevelsV133 ?? {}) },
                activeRootOriginIdsV132: { ...(def.combatBuildV117.activeRootOriginIdsV132 ?? {}) },
                activeSetMechanics: (def.combatBuildV117.activeSetMechanics ?? []).map(x => ({ ...x, eligibleDomains: [...x.eligibleDomains], params: { ...x.params } })),
                skillRootBindingsV118: { ...(def.combatBuildV117.skillRootBindingsV118 ?? {}) },
                learnedDaoPassiveIdsV118: [...(def.combatBuildV117.learnedDaoPassiveIdsV118 ?? [])],
                activeVariantIdsV118: [...(def.combatBuildV117.activeVariantIdsV118 ?? [])],
                techniqueRuntimeV119: cloneTechniqueCombatRuntimeV119(def.combatBuildV117.techniqueRuntimeV119),
                skillPracticeTierV125: { ...(def.combatBuildV117.skillPracticeTierV125 ?? {}) },
                passiveLevelsV125: { ...(def.combatBuildV117.passiveLevelsV125 ?? {}) },
                skillLevelsV12317: { ...(def.combatBuildV117.skillLevelsV12317 ?? {}) },
                skillGradesV12317: { ...(def.combatBuildV117.skillGradesV12317 ?? {}) },
            } : undefined,
            lastResolvedActiveSkillIdsV117: [],
            waterSpellChainStacksV117: 0,
            waterSpellChainLastSkillIdV117: undefined,
            setLockoutsV117: {},
            pendingSetFlagsV117: {},
            alive: true,
        };
        if (battleDaoV2Enabled(entity) && !entity.battleDaoStateV2)
            entity.battleDaoStateV2 = createBattleDaoRuntimeStateV2(entity, 0);
        syncBattleDaoV2Timers(entity, 0);
        initializeTechniqueCombatStateV119(entity, 0);
        return entity;
    }
    run(maxDuration = 120) {
        const [a, b] = [...this.entities.values()];
        if (!a || !b)
            throw new Error('Prototype CombatEngine currently requires exactly 2 entities');
        this.log(0, 'battleStart', `${a.name} giao chiến với ${b.name}.`);
        this.fireTriggers(a, b, 'OnBattleStart', 'Environment', 0);
        this.fireTriggers(b, a, 'OnBattleStart', 'Environment', 0);
        this.schedule({ time: 0, kind: 'decide', actorId: a.id, targetId: b.id });
        this.schedule({ time: 0, kind: 'decide', actorId: b.id, targetId: a.id });
        let now = 0;
        while (this.queue.length > 0 && now <= maxDuration && this.livingCount() > 1) {
            const event = this.queue.shift();
            now = event.time;
            this.cleanup(now);
            if (this.livingCount() <= 1)
                break;
            const actor = this.entities.get(event.actorId);
            const target = this.entities.get(event.targetId);
            if (!actor.alive || !target.alive)
                continue;
            if (event.kind === 'decide')
                this.handleDecision(actor, target, now);
            else if (event.kind === 'resolveSkill')
                this.handleSkillResolve(actor, target, event.skillId, event.castToken, now);
            else if (event.kind === 'dotTick')
                this.handleDotTick(actor, target, event.skillId, event.dot, now);
            else if (event.kind === 'channelTick')
                this.handleChannelTick(actor, target, event.skillId, event.channelToken, event.channelSpiritCost ?? 0, now);
            else if (event.kind === 'channelEnd')
                this.handleChannelEnd(actor, target, event.skillId, event.channelToken, now);
            else if (event.kind === 'v2FollowUp')
                this.handleV2FollowUp(actor, target, event.v2FollowUp, now);
            else if (event.kind === 'counterWindowExpire')
                this.handleCounterWindowExpire(actor, target, event.counterPhaseId, event.counterWindowId, now);
            else
                this.handleControlBreak(actor, target, event.controlToken, now);
        }
        for (const entity of this.entities.values())
            this.updateContinuousState(entity, now);
        // Combat-local delayed costs may never disappear just because the last enemy died early.
        for (const entity of this.entities.values()) {
            const debt = entity.pendingSetFlagsV117['techniqueDeferredDamageDebt'] ?? 0;
            if (debt > 0 && entity.alive) {
                entity.pendingSetFlagsV117['techniqueDeferredDamageDebt'] = 0;
                entity.hp = Math.max(0, entity.hp - debt);
                this.log(now, 'damage', `${entity.name} thanh toán ${debt.toFixed(0)} Nợ Thương còn lại khi chiến đấu kết thúc.`, entity.id, entity.id, undefined, { deferredDebtSettled: debt });
                if (entity.hp <= 0) {
                    entity.alive = false;
                    entity.casting = undefined;
                    entity.channeling = undefined;
                    this.log(now, 'death', `${entity.name} bị Nợ Thương phát tác đánh bại.`, entity.id, entity.id);
                }
            }
            const demonLoss = entity.pendingSetFlagsV117['techniqueDemonHpLossPendingPct'] ?? 0;
            if (demonLoss > 0 && entity.alive) {
                const loss = entity.hp * demonLoss / 100;
                entity.hp = Math.max(1, entity.hp - loss);
                delete entity.pendingSetFlagsV117['techniqueDemonHpLossPendingPct'];
                this.log(now, 'resource', `${entity.name} chịu phản phệ Giải Thể khi chiến đấu kết thúc, hao ${loss.toFixed(0)} Sinh Mệnh.`, entity.id, entity.id, undefined, { healthLoss: loss });
            }
        }
        const living = [...this.entities.values()].filter(e => e.alive);
        const draw = living.length !== 1;
        const winner = living.length === 1 ? living[0] : undefined;
        const loser = winner ? [...this.entities.values()].find(e => e.id !== winner.id) : undefined;
        this.log(now, 'battleEnd', draw ? 'Trận chiến kết thúc bất phân thắng bại.' : `${winner.name} chiến thắng.`);
        return {
            seed: this.seed,
            duration: now,
            winnerId: winner?.id,
            loserId: loser?.id,
            draw,
            logs: this.logs,
            finalState: Object.fromEntries([...this.entities.values()].map(e => [e.id, {
                    hp: e.hp,
                    spirit: e.spirit,
                    poise: e.poise,
                    bloodBreath: e.bloodBreath,
                    alive: e.alive,
                    marks: { ...e.marks },
                    ultimateGaugeV117: e.ultimateGaugeV117,
                    fiveElementsV117: { ...e.fiveElementsV117 },
                    daoStateV118: { ...e.daoStateV118 },
                    battleDaoStateV2: e.battleDaoStateV2 ? structuredClone(e.battleDaoStateV2) : undefined,
                }])),
        };
    }
    activeStatusDefinitions(entity, now) {
        return entity.statuses
            .filter(active => active.expiresAt > now)
            .map(active => this.registry.status(active.id));
    }
    activeSpiritCostMultiplier(entity, now) {
        return this.activeStatusDefinitions(entity, now)
            .reduce((multiplier, status) => multiplier * (status.spiritCostMultiplier ?? 1), 1);
    }
    cooldownFor(actor, skill, now) {
        const stats = effectiveStats(actor, this.registry, now);
        const practiceTier = actor.combatBuildV117?.skillPracticeTierV125?.[skill.id] ?? 0;
        const practice = skillPracticeProfileFromTierV125(practiceTier);
        const authoredGrowth = battleDaoSkillGrowthProfileV126(skill, practiceTier);
        const reductionSources = [
            stats.cooldownReductionBySkillPct?.[skill.id] ?? 0,
            techniqueCooldownReductionPctV119(actor, skill, now),
            practice.cooldownReductionPct,
            authoredGrowth?.cooldownReductionPct ?? 0,
            simpleSetParamV12318(actor, 'simple_water_cooldown', 'cooldownReductionPct'),
            ...skill.tags.map(tag => stats.cooldownReductionByTagPct?.[tag] ?? 0),
        ];
        let cooldownIncrease = 0;
        let allowsOvercap = false;
        for (const status of this.activeStatusDefinitions(actor, now)) {
            reductionSources.push(status.cooldownReductionPctAllSkills ?? 0);
            cooldownIncrease += status.cooldownIncreasePct ?? 0;
            allowsOvercap ||= status.allowsCooldownOvercap ?? false;
        }
        const reductionCap = allowsOvercap ? 99.9 : COMBAT_RULES.cooldownNormalCapPct;
        let effectiveReduction = 0;
        for (const source of reductionSources)
            effectiveReduction = combineBoundedPct(effectiveReduction, source, reductionCap);
        return cooldownProfile(skill, effectiveReduction, cooldownIncrease, allowsOvercap);
    }
    handleDecision(actor, target, now) {
        if (actor.casting || actor.channeling)
            return;
        const skill = chooseSkill(actor, target, this.registry, now);
        if (!skill) {
            this.schedule({ time: now + 0.25, kind: 'decide', actorId: actor.id, targetId: target.id });
            return;
        }
        const stats = effectiveStats(actor, this.registry, now);
        const spiritPctBefore = actor.spirit / Math.max(1, actor.baseStats.maxSpirit) * 100;
        const practiceTier = actor.combatBuildV117?.skillPracticeTierV125?.[skill.id] ?? 0;
        const practice = skillPracticeProfileFromTierV125(practiceTier);
        const authoredGrowth = battleDaoSkillGrowthProfileV126(skill, practiceTier);
        const rawRuntimeSpiritMultiplier = skillSpiritCostMultiplierFromRuntimeV117(actor, skill, now) * daoSpiritCostMultiplierV118(actor, skill) * battleDaoV2SpiritCostMultiplier(actor, skill, now) * techniqueSpiritCostMultiplierV119(actor, skill, now) * (1 - practice.spiritCostReductionPct / 100) * (1 - (authoredGrowth?.spiritCostReductionPct ?? 0) / 100);
        // Công Pháp V1: ordinary build reductions may not push a skill below 60% of its authored Chân Nguyên cost.
        const runtimeSpiritMultiplier = Math.max(.60, rawRuntimeSpiritMultiplier);
        let spiritCost = skillTrueEssenceCost(skill, stats, this.activeSpiritCostMultiplier(actor, now) * runtimeSpiritMultiplier);
        let techniquePreEffectBonusPct = 0;
        let techniquePreRecoveryMultiplier = 1;
        // Phá Cực Nhiên Nguyên: an equipped high-cost rule deliberately spends extra Chân Nguyên for a narrow payoff.
        const breakLimitPct = skillRuntimeV117(skill).costClass === 'high' ? techniqueBreakLimitExtraPctV119(actor) : 0;
        if (breakLimitPct > 0 && spiritCost > 0 && actor.spirit > spiritCost) {
            const maxExtra = spiritCost * breakLimitPct / 100;
            const paidExtra = Math.min(maxExtra, Math.max(0, actor.spirit - spiritCost));
            if (paidExtra > 0) {
                const actualPct = paidExtra / spiritCost * 100;
                spiritCost += paidExtra;
                techniquePreEffectBonusPct += actualPct * .70;
                techniquePreRecoveryMultiplier *= 1 + actualPct * .50 / 100;
                this.log(now, 'resource', `${actor.name} vận Phá Cực, tiêu thêm ${paidExtra.toFixed(0)} Chân Nguyên.`, actor.id, actor.id, skill.id, { extraSpirit: paidExtra, effectBonusPct: actualPct * .70 });
            }
        }
        // Bí Thuật may fund an otherwise unaffordable action, but the transaction is atomic: no HP is lost if it still cannot pay.
        if (actor.spirit + 1e-9 < spiritCost) {
            const missing = spiritCost - actor.spirit;
            const standard = Math.max(1, combatSpiritStandard(stats));
            const maxHp = Math.max(1, combatMaxHp(actor.baseStats));
            const sacrificeCap = techniqueBloodSacrificeCapPctV119(actor);
            if (sacrificeCap > 0) {
                const maxSacrifice = Math.min(Math.max(0, actor.hp - 1), actor.hp * sacrificeCap / 100);
                const hpNeeded = maxHp * (missing / standard);
                if (hpNeeded <= maxSacrifice + 1e-9) {
                    actor.hp -= hpNeeded;
                    actor.spirit += missing;
                    this.log(now, 'resource', `${actor.name} Huyết Tế ${hpNeeded.toFixed(0)} Sinh Mệnh đổi lấy ${missing.toFixed(0)} Chân Nguyên.`, actor.id, actor.id, skill.id, { healthCost: hpNeeded, spiritRestored: missing });
                }
            }
            else {
                const burnEfficiency = techniqueBurnBloodEfficiencyV119(actor);
                if (burnEfficiency > 0) {
                    const hpNeeded = maxHp * (missing / standard) / burnEfficiency;
                    if (hpNeeded <= Math.max(0, actor.hp - 1) + 1e-9) {
                        actor.hp -= hpNeeded;
                        actor.spirit += missing;
                        if (techniqueEquippedMasteryV119(actor, 'technique.v119.secret.burn_blood_qi') >= 100)
                            actor.pendingSetFlagsV117['techniqueBurnBloodHealPenaltyUntil'] = now + 4;
                        this.log(now, 'resource', `${actor.name} Thiêu Huyết bù ${missing.toFixed(0)} Chân Nguyên, hao ${hpNeeded.toFixed(0)} Sinh Mệnh.`, actor.id, actor.id, skill.id, { healthCost: hpNeeded, spiritFunded: missing });
                    }
                }
            }
        }
        if (actor.spirit + 1e-9 < spiritCost) {
            this.schedule({ time: now + 0.25, kind: 'decide', actorId: actor.id, targetId: target.id });
            return;
        }
        actor.spirit = Math.max(0, actor.spirit - spiritCost);
        // Quy Nguyên Chân Ý: crossing below 20% after paying a real skill cost grants one bounded emergency pulse.
        const guidingRestorePct = techniqueGuidingReturnRestoreStandardPctV119(actor);
        if (guidingRestorePct > 0 && spiritCost > 0 && spiritPctBefore >= 20 && actor.spirit / Math.max(1, actor.baseStats.maxSpirit) * 100 < 20) {
            const readyAt = actor.pendingSetFlagsV117['techniqueGuidingReturnReadyAt'] ?? 0;
            if (readyAt <= now) {
                const restored = Math.min(actor.baseStats.maxSpirit - actor.spirit, combatSpiritStandard(stats) * guidingRestorePct / 100);
                if (restored > 0) {
                    actor.spirit += restored;
                    actor.pendingSetFlagsV117['techniqueGuidingReturnReadyAt'] = now + techniqueGuidingReturnInternalSecondsV119(actor);
                    this.log(now, 'resource', `${actor.name} vận Quy Nguyên Chân Ý, hồi ${restored.toFixed(0)} Chân Nguyên khi gần cạn.`, actor.id, actor.id, skill.id, { spiritRestored: restored, internalCooldown: techniqueGuidingReturnInternalSecondsV119(actor) });
                }
            }
        }
        // Phản Bản Quy Nguyên Cấm Pháp uses the already-existing Basic slot as its explicit trigger: no hidden extra skill slot.
        if (skillSlotClassV117(skill) === 'basic') {
            const pct = techniqueCooldownReturnPctV119(actor);
            const readyAt = actor.pendingSetFlagsV117['techniqueCooldownReturnReadyAt'] ?? 0;
            if (pct > 0 && readyAt <= now) {
                let chosenId;
                let chosenUntil = now;
                for (const [id, until] of Object.entries(actor.cooldownUntil)) {
                    if (until <= chosenUntil + 1e-9)
                        continue;
                    let other;
                    try {
                        other = this.registry.skill(id);
                    }
                    catch {
                        continue;
                    }
                    const slot = skillSlotClassV117(other);
                    if (slot === 'basic' || slot === 'ultimate')
                        continue;
                    chosenId = id;
                    chosenUntil = until;
                }
                if (chosenId) {
                    const extraCost = combatSpiritStandard(stats) * techniqueCooldownReturnSpiritCostPctV119(actor) / 100;
                    if (actor.spirit + 1e-9 >= extraCost) {
                        actor.spirit -= extraCost;
                        const remaining = Math.max(0, chosenUntil - now);
                        const reduced = remaining * pct / 100;
                        actor.cooldownUntil[chosenId] = Math.max(now + .1, chosenUntil - reduced);
                        actor.pendingSetFlagsV117['techniqueCooldownReturnReadyAt'] = now + techniqueCooldownReturnInternalSecondsV119(actor);
                        this.log(now, 'resource', `${actor.name} vận Phản Bản Quy Nguyên, tiêu ${extraCost.toFixed(0)} Chân Nguyên rút ${reduced.toFixed(2)}s Hồi Chiêu của ${this.registry.skill(chosenId).name}.`, actor.id, actor.id, skill.id, { spiritCost: extraCost, cooldownReducedSeconds: reduced, internalCooldown: techniqueCooldownReturnInternalSecondsV119(actor) });
                    }
                }
            }
        }
        if (actor.combatModel === 'locked-v1') {
            const maxHp = combatMaxHp(actor.baseStats);
            const healthCost = actor.hp * Math.max(0, skill.healthCostCurrentPct ?? 0) / 100
                + maxHp * Math.max(0, skill.healthCostMaxPct ?? 0) / 100;
            if (healthCost > 0) {
                const paid = Math.min(Math.max(0, actor.hp - 1), healthCost);
                actor.hp -= paid;
                this.log(now, 'resource', `${actor.name} tiêu hao ${paid.toFixed(0)} Sinh Mệnh để vận công.`, actor.id, actor.id, skill.id, { healthCost: paid });
            }
        }
        const prepared = prepareSkillActionRuntimeV117(actor, skill, now);
        const skillLevelV12317 = Math.max(1, Math.floor(actor.combatBuildV117?.skillLevelsV12317?.[skill.id] ?? 1));
        const skillGradeV12317 = actor.combatBuildV117?.skillGradesV12317?.[skill.id] ?? 'mundane';
        const skillProgressBonusV12317 = skillProgressEffectBonusFromRuntimeV12317(skillLevelV12317, skillGradeV12317);
        const secondaryScalingBonusV12317 = skillSecondaryEffectBonusPctV12317(stats, skill);
        prepared.action.effectBonusPct += techniquePreEffectBonusPct + practice.effectBonusPct + (authoredGrowth?.effectBonusPct ?? 0) + skillProgressBonusV12317 + secondaryScalingBonusV12317;
        prepared.action.breakBonusPct += Math.max(0, actor.combatBuildV117?.daoNatureBreakBonusPctV125 ?? 0) + (authoredGrowth?.breakBonusPct ?? 0);
        prepared.action.castTimeMultiplier *= Math.max(.4, 1 - (authoredGrowth?.castTimeReductionPct ?? 0) / 100);
        prepared.action.recoveryMultiplier *= techniquePreRecoveryMultiplier * Math.max(.4, 1 - (authoredGrowth?.recoveryReductionPct ?? 0) / 100);
        if (techniqueEquippedMasteryV119(actor, 'technique.v119.secret.reverse_breath') >= 100 && spiritPctBefore < 30)
            prepared.action.suppressGaugeGenerate = true;
        // Phệ Thuẫn consumes pre-existing shield before this action resolves, so a shield created by this same skill can never feed itself.
        const shieldConsumePct = techniqueShieldConsumePctV119(actor);
        const domains = new Set(skillDomainsV117(skill));
        if (shieldConsumePct > 0 && domains.has('Damage') && skillSlotClassV117(skill) !== 'basic') {
            const totalBefore = this.totalShield(actor, now);
            const requested = totalBefore * shieldConsumePct / 100;
            let left = requested;
            for (const shield of actor.shields) {
                if (left <= 0)
                    break;
                if (shield.expiresAt <= now || shield.capacity <= 0)
                    continue;
                const used = Math.min(shield.capacity, left);
                shield.capacity -= used;
                left -= used;
            }
            const consumed = requested - left;
            if (consumed > 0) {
                prepared.action.effectBonusPct += techniqueShieldConsumeEffectBonusPctV119(actor);
                this.log(now, 'resource', `${actor.name} Phệ Thuẫn ${consumed.toFixed(0)} Khiên để cường hóa ${skill.name}.`, actor.id, actor.id, skill.id, { shieldConsumed: consumed, effectBonusPct: techniqueShieldConsumeEffectBonusPctV119(actor) });
            }
        }
        for (const notice of prepared.notices)
            this.log(now, 'resource', notice.message, actor.id, actor.id, skill.id, notice.data);
        for (const notice of prepareBattleDaoActionV118(actor, target, skill, prepared.action, now))
            this.log(now, 'resource', notice.message, actor.id, actor.id, skill.id, notice.data);
        if (battleDaoV2Enabled(actor)) {
            prepared.action.battleDaoV2 = createRootActionV2(actor, skill, this.castToken + 1);
            prepareSwordCoreActionV2(actor, skill, prepared.action, now);
            const swordSpent = swordQiSpendBeforeActionV2(actor, skill, target, now);
            if (swordSpent > 0) {
                prepared.action.battleDaoV2.swordQiSpent = swordSpent;
                this.log(now, 'resource', `${actor.name} vận ${skill.name}, tiêu ${swordSpent} Kiếm Khí.`, actor.id, actor.id, skill.id, { swordQiSpent: swordSpent, swordQi: actor.battleDaoStateV2?.sword?.core?.swordQi ?? 0, swordQiCap: actor.battleDaoStateV2?.sword?.core?.swordQiCap ?? 5 });
            }
            const swordTuning = swordV2ActionTuning(actor, skill);
            prepared.action.effectBonusPct += swordTuning.extraEffectBonusPct;
            prepared.action.breakBonusPct += swordTuning.extraBreakBonusPct;
            prepared.action.castTimeMultiplier *= swordTuning.castMultiplier;
            prepared.action.recoveryMultiplier *= swordTuning.recoveryMultiplier;
            prepareRemainingDaoCoreActionV2(actor, target, skill, prepared.action, now);
        }
        const spentElement = Object.values(prepared.action.spentResources ?? {}).reduce((sum, value) => sum + Math.max(0, Number(value ?? 0)), 0);
        if (spentElement > 0 && (techniqueEquippedMasteryV119(actor, 'technique.v119.secret.steal_heaven') >= 40 || techniqueEquippedMasteryV119(actor, 'technique.v119.secret.hidden_edge') >= 40))
            actor.pendingSetFlagsV117['techniqueAfterDaoSpendUntil'] = Math.max(actor.pendingSetFlagsV117['techniqueAfterDaoSpendUntil'] ?? 0, now + 4);
        const cooldown = this.cooldownFor(actor, skill, now);
        const swordTuningForCooldown = swordV2ActionTuning(actor, skill);
        if (swordTuningForCooldown.cooldownOverride !== undefined)
            cooldown.actualCooldown = Math.max(skill.minimumCooldown ?? 0, swordTuningForCooldown.cooldownOverride);
        // Locked: cooldown begins when the skill starts, not when channel/recovery ends.
        actor.cooldownUntil[skill.id] = now + cooldown.actualCooldown;
        const castTime = adjustedCastTime(skill.castTime * skillCastTimeMultiplierFromRuntimeV117(actor, skill) * daoCastTimeMultiplierV118(actor, skill) * techniqueCastMultiplierV119(actor, skill, now) * prepared.action.castTimeMultiplier, stats.actionSpeed);
        const token = ++this.castToken;
        actor.casting = {
            skillId: skill.id,
            startedAt: now,
            resolvesAt: now + castTime,
            token,
            cooldownDamageBonusPct: cooldown.overflowSkillDamagePct,
            runtimeV117: prepared.action,
        };
        const bossTelegraph = bossDangerMetaV81(actor, skill, castTime);
        this.log(now, 'castStart', `${actor.name} vận chiêu ${skill.name}.`, actor.id, target.id, skill.id, {
            castTime,
            spiritCost,
            cooldown: cooldown.actualCooldown,
            cooldownReductionPct: cooldown.appliedReductionPct,
            cooldownOverflowDamagePct: cooldown.overflowSkillDamagePct,
            runtimeSpiritCostMultiplier: runtimeSpiritMultiplier,
            ultimateGauge: actor.ultimateGaugeV117,
            ...(bossTelegraph ?? {}),
        });
        this.schedule({
            time: now + castTime,
            kind: 'resolveSkill',
            actorId: actor.id,
            targetId: target.id,
            skillId: skill.id,
            castToken: token,
        });
    }
    handleSkillResolve(actor, target, skillId, castToken, now) {
        if (!actor.casting || actor.casting.token !== castToken)
            return;
        const cooldownDamageBonusPct = actor.casting.cooldownDamageBonusPct;
        const runtimeAction = actor.casting.runtimeV117;
        actor.casting = undefined;
        const skill = this.registry.skill(skillId);
        this.log(now, 'skillResolve', `${skill.name} phát động.`, actor.id, target.id, skill.id);
        const artifactV88 = actor.combatBuildV117?.artifactV88;
        if (artifactV88 && artifactV88.equippedCount > 0) {
            const sources = Math.max(1, actor.battleDaoStateV2?.artifact?.core?.artifactSources ?? actor.daoStateV118.artifactSources ?? 1);
            const daoGainMultiplier = actor.combatBuildV117?.mainDaoId === 'artifact' ? 1 + .12 * Math.max(0, sources - 1) : 1;
            const gain = Math.max(0, artifactV88.baseGainPerAction * (1 + artifactV88.baoQiGainPct / 100) * daoGainMultiplier);
            const key = '__artifact_v88_bao_qi', before = Math.max(0, actor.marks[key] ?? 0), after = Math.min(artifactV88.baoQiMax, before + gain);
            actor.marks[key] = after;
            if (after > before + 1e-9)
                this.log(now, 'resource', `${actor.name} tích Bảo Khí ${after.toFixed(0)}/${artifactV88.baoQiMax}.`, actor.id, actor.id, skill.id, { artifactRuntime: 'artifact.v88', artifactEvent: 'baoQi', baoQi: after, baoQiMax: artifactV88.baoQiMax, baoQiGain: after - before, artifactSources: sources });
        }
        const resolvedEffects = swordV2EffectsForSkill(actor, skill, runtimeAction, pct => this.rng.chance(pct));
        this.resolveEffects(actor, target, resolvedEffects, 'ActiveHit', now, skill.id, cooldownDamageBonusPct, runtimeAction);
        this.registerCounterAction(actor, target, 'skillRole', now, skill.id);
        if (skill.channel && skill.channel.duration > 0 && skill.channel.baseHits > 0 && actor.alive && target.alive) {
            const speed = actionSpeedMultiplier(effectiveStats(actor, this.registry, now).actionSpeed);
            const carry = actor.channelHitRemainders[skill.id] ?? 0;
            const swordChannel = swordV2ChannelProfile(actor, skill, runtimeAction);
            const rawHits = (swordChannel.hitCountOverride ?? skill.channel.baseHits) * speed + carry;
            const totalHits = Math.max(1, Math.floor(rawHits));
            actor.channelHitRemainders[skill.id] = rawHits - totalHits;
            const token = ++this.channelToken;
            const channelDuration = skill.channel.duration * Math.max(.1, runtimeAction?.channelDurationMultiplierV118 ?? 1) * swordChannel.durationMultiplier;
            actor.channeling = {
                skillId: skill.id,
                startedAt: now,
                endsAt: now + channelDuration,
                token,
                totalHits,
                cooldownDamageBonusPct,
                runtimeV117: runtimeAction,
            };
            const stats = effectiveStats(actor, this.registry, now);
            const totalChannelCost = combatSpiritStandard(stats) * Math.max(0, skill.channel.spiritCostStandardPctPerSecond ?? 0) / 100 * channelDuration
                + Math.max(0, skill.channel.spiritCostFlatPerSecond ?? 0) * channelDuration;
            const costPerTick = totalChannelCost / totalHits;
            for (let i = 1; i <= totalHits; i += 1) {
                this.schedule({
                    time: now + channelDuration * (i / totalHits),
                    kind: 'channelTick',
                    actorId: actor.id,
                    targetId: target.id,
                    skillId: skill.id,
                    channelToken: token,
                    channelSpiritCost: costPerTick,
                });
            }
            this.schedule({
                time: now + channelDuration,
                kind: 'channelEnd',
                actorId: actor.id,
                targetId: target.id,
                skillId: skill.id,
                channelToken: token,
            });
            this.log(now, 'channel', `${actor.name} duy trì ${skill.name} trong ${channelDuration.toFixed(2)}s với ${totalHits} nhịp.`, actor.id, target.id, skill.id, {
                duration: channelDuration,
                hits: totalHits,
            });
            return;
        }
        if (runtimeAction) {
            for (const notice of finishSkillActionRuntimeV117(actor, skill, runtimeAction, now))
                this.log(now, 'resource', notice.message, actor.id, actor.id, skill.id, notice.data);
            const daoFinish = finishBattleDaoActionV118(actor, target, skill, runtimeAction, now);
            for (const notice of daoFinish.notices)
                this.log(now, 'resource', notice.message, actor.id, actor.id, skill.id, notice.data);
            this.applyDaoMindDelay(target, daoFinish.targetCastDelaySeconds, now);
            this.finishBattleDaoV2Action(actor, target, skill, runtimeAction, now);
        }
        if (!actor.alive || !target.alive)
            return;
        this.scheduleNextActionAfterRecovery(actor, target, skill, now, runtimeAction);
    }
    handleChannelTick(actor, target, skillId, token, spiritCost, now) {
        const channel = actor.channeling;
        if (!channel || channel.token !== token || channel.skillId !== skillId)
            return;
        const skill = this.registry.skill(skillId);
        if (!skill.channel)
            return;
        if (spiritCost > 0) {
            if (actor.spirit + 1e-9 < spiritCost) {
                this.log(now, 'resource', `${actor.name} cạn Chân Nguyên, ${skill.name} kết thúc sớm.`, actor.id, target.id, skill.id);
                actor.channeling = undefined;
                this.scheduleNextActionAfterRecovery(actor, target, skill, now, channel.runtimeV117);
                return;
            }
            actor.spirit = Math.max(0, actor.spirit - spiritCost);
        }
        this.resolveEffects(actor, target, skill.channel.effects, 'ActiveHit', now, skill.id, channel.cooldownDamageBonusPct, channel.runtimeV117);
    }
    handleChannelEnd(actor, target, skillId, token, now) {
        const channel = actor.channeling;
        if (!channel || channel.token !== token || channel.skillId !== skillId)
            return;
        const runtimeAction = channel.runtimeV117;
        actor.channeling = undefined;
        const skill = this.registry.skill(skillId);
        this.log(now, 'channel', `${actor.name} kết thúc duy trì ${skill.name}.`, actor.id, target.id, skill.id);
        if (runtimeAction) {
            for (const notice of finishSkillActionRuntimeV117(actor, skill, runtimeAction, now))
                this.log(now, 'resource', notice.message, actor.id, actor.id, skill.id, notice.data);
            const daoFinish = finishBattleDaoActionV118(actor, target, skill, runtimeAction, now);
            for (const notice of daoFinish.notices)
                this.log(now, 'resource', notice.message, actor.id, actor.id, skill.id, notice.data);
            this.applyDaoMindDelay(target, daoFinish.targetCastDelaySeconds, now);
            this.finishBattleDaoV2Action(actor, target, skill, runtimeAction, now);
        }
        if (actor.alive && target.alive)
            this.scheduleNextActionAfterRecovery(actor, target, skill, now, runtimeAction);
    }
    finishBattleDaoV2Action(actor, target, skill, action, now) {
        const v2 = action.battleDaoV2;
        if (!v2 || !battleDaoV2Enabled(actor))
            return;
        const remaining = finishRemainingDaoActionV2(actor, target, skill, action, now, pct => this.rng.chance(pct));
        for (const notice of remaining.notices)
            this.log(now, 'resource', notice.message, actor.id, actor.id, skill.id, notice.data);
        const v2Projection = v2ResourceProjection(actor, now);
        if (Object.keys(v2Projection).length > 0)
            this.log(now, 'resource', `${actor.name} cập nhật Bản Đạo V2.`, actor.id, actor.id, skill.id, { v2DaoProjection: true, ...v2Projection });
        if (remaining.followUp && target.alive) {
            this.schedule({ time: now + remaining.followUp.delay, kind: 'v2FollowUp', actorId: actor.id, targetId: target.id, skillId: skill.id, v2FollowUp: { coefficient: remaining.followUp.coefficient, breakDamagePct: remaining.followUp.breakDamagePct, sourceSkillId: skill.id, label: remaining.followUp.label, claim: remaining.followUp.claim } });
        }
        const intent = resolveSwordIntentAfterRootV2(actor, action, now, pct => this.rng.chance(pct));
        if (intent.gained > 0) {
            const intentState = actor.battleDaoStateV2?.sword?.intent;
            const intentBonus = swordIntentBonusesV2(actor, now);
            this.log(now, 'resource', `${actor.name} lĩnh ngộ +${intent.gained} Kiếm Ý (${intent.stacks}).`, actor.id, actor.id, skill.id, { swordIntentGain: intent.gained, swordIntent: intent.stacks, swordIntentCap: intentState?.cap ?? 20, swordIntentDurationSeconds: intentState?.durationSeconds ?? 12, swordIntentCritChancePct: intentBonus.critChancePct, swordIntentHeartChancePct: intentBonus.heartChancePct, swordIntentArmorPenPct: intentBonus.armorPenPct, swordIntentDirectDamagePct: intentBonus.directDamagePct, swordIntentCritHeartDamagePct: intentBonus.critHeartDamagePct, swordIntentGaugeGainPct: intentBonus.gaugeGainPct, rootActionId: v2.rootActionId });
        }
        if (actor.combatBuildV117?.mainDaoId !== 'sword' || skillRuntimeV117(skill).daoBinding !== 'sword')
            return;
        const sword = actor.battleDaoStateV2?.sword;
        const core = sword?.core;
        if (!sword || !core)
            return;
        const tier = actor.combatBuildV117?.skillPracticeTierV125?.[skill.id] ?? 0;
        if (skill.id === 'skill.dao.sword.basic' && tier >= 750 && v2.heartHitCount > 0)
            action.recoveryMultiplier *= Math.max(.1, 1 - .15 / Math.max(.2, skill.recoveryTime ?? 1));
        if (skill.id === 'skill.dao.sword.nurture' && tier >= 500) {
            sword.swordDamageBuffPct = 15;
            sword.swordDamageBuffUntil = Math.max(sword.swordDamageBuffUntil, now + 4);
        }
        if (skill.id === 'skill.dao.sword.break_mark' && tier >= 500 && target.breakDebuffUntil > now) {
            target.pendingSetFlagsV117['swordV2BreakMarkUntil'] = Math.max(target.pendingSetFlagsV117['swordV2BreakMarkUntil'] ?? 0, now + 4);
            target.pendingSetFlagsV117['swordV2BreakMarkPct'] = tier >= 1000 ? 20 : 10;
        }
        if (skill.id === 'skill.dao.sword.counter' && v2.damagingHitCount > 0) {
            if (tier >= 250)
                this.applyHeal(actor, actor, combatMaxHp(actor.baseStats) * .05, now, skill.id);
            if (tier >= 1000 && actor.hp / combatMaxHp(actor.baseStats) <= .30)
                this.applyDirectShield(actor, actor, { type: 'shield', capacity: 0, stability: 100, maxHpPct: 12, duration: 3 }, now, skill.id);
        }
        // Kiếm Thế Viên Mãn: only a normal Active that did not already spend Kiếm Khí may consume the core follow-up budget.
        if (v2.swordFullPayoffEligible && v2.directDamagingHitCount > 0 && (v2.swordQiSpent ?? 0) <= 0 && target.alive && core.swordQi >= core.swordQiCap) {
            const followUp = claimDamagingFollowUpV2(action, { kind: 'intrinsic', id: 'intrinsic.v2.sword.sword_qi' });
            if (followUp) {
                const before = core.swordQi;
                core.swordQi = Math.max(0, core.swordQi - 2);
                // Generated damage is ProcHit with procCoefficient=0: it may crit/heart for presentation and damage,
                // but it cannot recursively open ordinary OnHit/OnCrit proc chains.
                const outcome = this.applyDamage(actor, target, { sourceTag: 'ProcHit', coefficient: .40, breakDamagePct: 0, canCrit: true, canDodge: true, canHeart: true, unavoidable: false, trueDamage: false, procCoefficient: 0, skillId: skill.id, elementalCoefficients: undefined, primaryElement: undefined, cooldownDamageBonusPct: 0, runtimeEffectBonusPct: 0, runtimeBreakBonusPct: 0 }, now);
                this.log(now, 'resource', `${actor.name} phóng Kiếm Khí Trảm từ Kiếm Thế Viên Mãn.`, actor.id, target.id, skill.id, { rootActionId: followUp.rootActionId, sourceActionId: followUp.sourceActionId, sourceTag: followUp.sourceTag, originIntrinsicId: followUp.originIntrinsicId ?? '', generatedByEventId: followUp.generatedByEventId, procDepth: followUp.procDepth, swordQiBefore: before, swordQi: core.swordQi, swordQiCap: core.swordQiCap, followUpsUsed: followUp.followUpsUsed, followUpBudget: followUp.followUpBudget, damage: outcome.hpDamage });
            }
        }
        const generated = swordQiGenerateAfterActionV2(actor, skill, action);
        if (generated > 0) {
            v2.swordQiGenerated = generated;
            this.log(now, 'resource', `${actor.name} ngưng tụ +${generated} Kiếm Khí (${core.swordQi}/${core.swordQiCap}).`, actor.id, actor.id, skill.id, { swordQiGenerated: generated, swordQi: core.swordQi, swordQiCap: core.swordQiCap, rootActionId: v2.rootActionId });
        }
        if (skill.id === 'skill.dao.sword.ultimate' && tier >= 1000) {
            sword.swordDomainUntil = now + 4;
            core.swordQiCap = 7;
            this.log(now, 'resource', `${actor.name} mở Thái Hư Kiếm Vực trong 4 giây.`, actor.id, actor.id, skill.id, { swordDomainUntil: sword.swordDomainUntil, swordQiCap: 7 });
        }
    }
    handleV2FollowUp(actor, target, follow, now) {
        if (!actor.alive || !target.alive)
            return;
        const outcome = this.applyDamage(actor, target, { sourceTag: 'ProcHit', coefficient: Math.max(0, follow.coefficient), breakDamagePct: Math.max(0, follow.breakDamagePct), canCrit: true, canDodge: true, canHeart: true, unavoidable: false, trueDamage: false, procCoefficient: 0, skillId: follow.sourceSkillId, elementalCoefficients: undefined, primaryElement: undefined, cooldownDamageBonusPct: 0, runtimeEffectBonusPct: 0, runtimeBreakBonusPct: 0 }, now);
        this.log(now, 'resource', `${actor.name} phát ${follow.label}.`, actor.id, target.id, follow.sourceSkillId, { ...follow.claim, damage: outcome.hpDamage, v2FollowUp: true });
    }
    scheduleNextActionAfterRecovery(actor, target, skill, now, runtimeAction) {
        const recovery = adjustedRecoveryTime((skill.recoveryTime ?? 0.2) * Math.max(.1, runtimeAction?.recoveryMultiplier ?? 1) * daoRecoveryMultiplierForTargetV118(actor, now) * techniqueRecoveryMultiplierV119(actor, skill, now), effectiveStats(actor, this.registry, now).actionSpeed);
        this.schedule({ time: now + recovery, kind: 'decide', actorId: actor.id, targetId: target.id });
    }
    applyDaoMindDelay(target, delaySeconds, now) {
        let delay = Math.max(0, delaySeconds);
        if (delay <= 0 || !target.alive)
            return;
        if (target.casting && target.casting.resolvesAt > now) {
            const activeSkill = this.registry.skill(target.casting.skillId);
            const stability = techniqueInterruptResistPctV119(target, activeSkill, now);
            delay *= 1 - stability / 100;
            if (delay <= 1e-9)
                return;
            const old = target.casting;
            const token = ++this.castToken;
            const resolvesAt = old.resolvesAt + delay;
            target.casting = { ...old, token, resolvesAt };
            this.schedule({ time: resolvesAt, kind: 'resolveSkill', actorId: target.id, targetId: [...this.entities.keys()].find(id => id !== target.id) ?? target.id, skillId: old.skillId, castToken: token });
            this.log(now, 'info', `${target.name} bị Nhiễu, thời gian Thi Triển kéo dài ${delay.toFixed(2)}s.`, target.id, target.id, old.skillId, { delaySeconds: delay });
        }
    }
    handleDotTick(source, target, skillId, dot, now) {
        if (!source.alive || !target.alive)
            return;
        if (dot.poisonTracked) {
            const epochKey = `poisonDotEpoch:${source.id}`;
            if ((target.pendingSetFlagsV117[epochKey] ?? 0) !== (dot.poisonEpoch ?? 0))
                return;
            const poolKey = `poisonDotPool:${source.id}`;
            target.pendingSetFlagsV117[poolKey] = Math.max(0, (target.pendingSetFlagsV117[poolKey] ?? 0) - dot.coefficient);
        }
        const elementalCoefficients = dot.elementalCoefficientsV133 ?? (dot.element ? { [dot.element]: dot.coefficient } : undefined);
        const outcome = this.applyDamage(source, target, {
            sourceTag: 'DoT',
            coefficient: dot.element ? 0 : dot.coefficient,
            breakDamagePct: dot.breakDamagePct,
            canCrit: false,
            canDodge: false,
            canHeart: false,
            unavoidable: true,
            trueDamage: dot.trueDamage,
            procCoefficient: dot.procCoefficient,
            skillId,
            elementalCoefficients,
            primaryElement: dot.primaryElementV133 ?? dot.element,
            cooldownDamageBonusPct: dot.cooldownDamageBonusPct,
            runtimeEffectBonusPct: 0,
            runtimeBreakBonusPct: 0,
        }, now);
        if (outcome.hpDamage > 0)
            this.generateBloodBreath(source, outcome.hpDamage, 'DoT', now);
        if (dot.poisonTracked && skillId) {
            const poisonSkill = this.registry.skill(skillId);
            const hybrid = setMechanicV117(source, 'wood_poison_tick_growth');
            if (hybrid && effectiveSkillRootV118(source, poisonSkill) === 'wood') {
                const lastKey = `woodPoisonTickLast:${target.id}`;
                const last = source.pendingSetFlagsV117[lastKey] ?? -999;
                if (now - last >= 1 - 1e-9) {
                    const pct = hybrid.params['standardWoodGenerateContributionPct'] ?? 0;
                    const grown = addResourceV117(source, 'woodSeed', 18 * pct / 100, now);
                    if (grown > 0)
                        source.pendingSetFlagsV117[lastKey] = now;
                }
            }
        }
        if (source.alive && target.alive && dot.remainingTicks > 1) {
            this.schedule({
                time: now + dot.interval,
                kind: 'dotTick',
                actorId: source.id,
                targetId: target.id,
                skillId,
                dot: { ...dot, remainingTicks: dot.remainingTicks - 1 },
            });
        }
    }
    resolveEffects(source, target, effects, defaultSourceTag, now, skillId, cooldownDamageBonusPct = 0, runtimeAction) {
        const skill = skillId ? this.registry.skill(skillId) : undefined;
        const runtimeEffectMultiplier = 1 + Math.max(0, runtimeAction?.effectBonusPct ?? 0) / 100;
        const runtimeBreakMultiplier = 1 + Math.max(0, runtimeAction?.breakBonusPct ?? 0) / 100;
        for (const effect of effects) {
            if (!source.alive || !target.alive)
                break;
            switch (effect.type) {
                case 'damage': {
                    const outcome = this.applyDamage(source, target, this.damageContextFromEffect(source, effect, defaultSourceTag, skill, skillId, cooldownDamageBonusPct, runtimeAction), now);
                    recordDamageOutcomeV2(runtimeAction, effect.sourceTag ?? defaultSourceTag, outcome);
                    if (outcome.hpDamage > 0)
                        this.generateBloodBreath(source, outcome.hpDamage, effect.sourceTag ?? defaultSourceTag, now);
                    break;
                }
                case 'damageOverTime': {
                    if (effect.ticks > 0 && effect.interval > 0) {
                        const daoDot = skill ? adjustDaoDotV118(source, skill, effect.coefficientPerTick, effect.ticks) : { coefficientPerTick: effect.coefficientPerTick, ticks: effect.ticks };
                        const poisonTracked = Boolean(skill && skillRuntimeV117(skill).daoBinding === 'poison');
                        const poisonEpoch = poisonTracked ? (target.pendingSetFlagsV117[`poisonDotEpoch:${source.id}`] ?? 0) : undefined;
                        const trackedCoefficient = daoDot.coefficientPerTick * runtimeEffectMultiplier;
                        if (poisonTracked)
                            target.pendingSetFlagsV117[`poisonDotPool:${source.id}`] = (target.pendingSetFlagsV117[`poisonDotPool:${source.id}`] ?? 0) + trackedCoefficient * daoDot.ticks;
                        const sealV133 = this.elementalContextV133(source, skill, effect.element ? { [effect.element]: trackedCoefficient } : undefined, runtimeAction, Math.max(1, daoDot.ticks));
                        this.schedule({
                            time: now + effect.interval,
                            kind: 'dotTick',
                            actorId: source.id,
                            targetId: target.id,
                            skillId,
                            dot: {
                                coefficient: trackedCoefficient,
                                breakDamagePct: (effect.breakDamagePctPerTick ?? effect.stabilityDamagePerTick ?? 0) * runtimeBreakMultiplier,
                                remainingTicks: daoDot.ticks,
                                interval: effect.interval,
                                procCoefficient: effect.procCoefficient ?? 0,
                                element: effect.element,
                                elementalCoefficientsV133: sealV133.elementalCoefficients,
                                primaryElementV133: sealV133.primaryElement,
                                trueDamage: effect.trueDamage ?? false,
                                cooldownDamageBonusPct,
                                poisonTracked, poisonEpoch,
                            },
                        });
                    }
                    break;
                }
                case 'heal': {
                    const healTarget = effect.target === 'target' ? target : source;
                    const srcStats = effectiveStats(source, this.registry, now);
                    const maxHp = combatMaxHp(healTarget.baseStats);
                    const base = ((effect.flat ?? 0) + maxHp * ((effect.maxHpPct ?? 0) / 100) + srcStats.attack * (effect.attackCoefficient ?? 0)) * runtimeEffectMultiplier;
                    this.applyHeal(source, healTarget, base, now, skillId);
                    break;
                }
                case 'drain': {
                    const sealV133 = this.elementalContextV133(source, skill, skill?.elementalCoefficients, runtimeAction);
                    const outcome = this.applyDamage(source, target, {
                        sourceTag: defaultSourceTag,
                        coefficient: effect.coefficient,
                        breakDamagePct: effect.breakDamagePct ?? effect.stabilityDamage ?? 0,
                        canCrit: effect.canCrit ?? true,
                        canDodge: effect.canDodge ?? true,
                        canHeart: true,
                        unavoidable: skill?.unavoidable ?? false,
                        trueDamage: false,
                        procCoefficient: effect.procCoefficient ?? 1,
                        skillId,
                        elementalCoefficients: sealV133.elementalCoefficients,
                        primaryElement: sealV133.primaryElement,
                        cooldownDamageBonusPct,
                        runtimeEffectBonusPct: Math.max(0, runtimeAction?.effectBonusPct ?? 0),
                        runtimeBreakBonusPct: Math.max(0, runtimeAction?.breakBonusPct ?? 0),
                    }, now);
                    recordDamageOutcomeV2(runtimeAction, defaultSourceTag, outcome);
                    if (outcome.hpDamage > 0) {
                        if (this.usesLockedCombat(source, target))
                            this.generateBloodBreath(source, outcome.hpDamage, defaultSourceTag, now, Math.max(0, effect.healRatio));
                        else
                            this.applyHeal(source, source, outcome.hpDamage * Math.max(0, effect.healRatio), now, skillId);
                    }
                    break;
                }
                case 'removeStatus': {
                    const statusTarget = effect.target === 'target' ? target : source;
                    const before = statusTarget.statuses.length;
                    statusTarget.statuses = statusTarget.statuses.filter(active => {
                        if (effect.statusIds?.includes(active.id))
                            return false;
                        if (effect.groups?.includes(this.registry.status(active.id).group))
                            return false;
                        return true;
                    });
                    const removed = before - statusTarget.statuses.length;
                    this.log(now, 'info', `${statusTarget.name} giải trừ ${removed} trạng thái.`, source.id, statusTarget.id, skillId, { removed });
                    break;
                }
                case 'shield': {
                    const shieldRuntimeMultiplier = runtimeEffectMultiplier * (1 + Math.max(0, source.combatBuildV117?.daoNatureShieldEffectPctV125 ?? 0) / 100) * battleDaoV2HealShieldMultiplier(source, now);
                    const scaled = { ...effect, capacity: effect.capacity * shieldRuntimeMultiplier, maxHpPct: (effect.maxHpPct ?? 0) * shieldRuntimeMultiplier, attackCoefficient: (effect.attackCoefficient ?? 0) * shieldRuntimeMultiplier };
                    this.applyDirectShield(source, target, scaled, now, skillId);
                    break;
                }
                case 'applyStatus': {
                    const statusTarget = effect.target === 'self' ? source : target;
                    this.applyStatus(source, statusTarget, effect.statusId, effect.duration, effect.stacks ?? 1, now, skillId);
                    break;
                }
                case 'addMark': {
                    const dao = skill ? skillRuntimeV117(skill).daoBinding : undefined;
                    if (battleDaoV2Enabled(source) && dao === 'poison' && effect.mark === 'Độc Tầng') {
                        const gained = addPoisonSeedStageV2(source, target.id, effect.stacks, now);
                        const stage = source.battleDaoStateV2?.poison?.core?.poisonSeedStage ?? 0;
                        if (gained > 0)
                            this.log(now, 'mark', `${target.name} bị gieo Độc Chủng: ${stage}/4.`, source.id, target.id, skillId, { poisonSeedGain: gained, poisonSeedStage: stage });
                        break;
                    }
                    if (battleDaoV2Enabled(source) && dao === 'mind' && effect.mark === 'Thần Ấn') {
                        this.log(now, 'info', `${source.name} vận Thần Niệm V2; Thần Ấn V1 không còn được tạo.`, source.id, target.id, skillId, { mindV2: true });
                        break;
                    }
                    const before = target.marks[effect.mark] ?? 0;
                    const stacks = skill ? adjustDaoMarkStacksV118(source, skill, effect.mark, effect.stacks, now) : effect.stacks;
                    const cap = skill ? daoMarkCapV118(source, skill, effect.mark, effect.maxStacks) : effect.maxStacks;
                    target.marks[effect.mark] = Math.min(cap, before + stacks);
                    this.log(now, 'mark', `${target.name} nhận ${effect.mark}: ${target.marks[effect.mark]}/${effect.maxStacks}.`, source.id, target.id, skillId, { stacks: target.marks[effect.mark] });
                    break;
                }
                case 'consumeMarkDamage': {
                    const current = target.marks[effect.mark] ?? 0;
                    const dao = skill ? skillRuntimeV117(skill).daoBinding : undefined;
                    const sig = skill?.daoRuntimeV118?.signature;
                    if (battleDaoV2Enabled(source) && dao === 'poison' && effect.mark === 'Độc Tầng') {
                        const consumedV2 = consumePoisonSeedStageV2(source, target.id, Math.min(4, effect.maxConsume), 1);
                        let coefficient = effect.baseCoefficient + consumedV2.consumed * effect.coefficientPerStack;
                        if (consumedV2.heart)
                            coefficient *= 1.5;
                        this.log(now, 'mark', `${source.name} dẫn bạo Độc Chủng ${consumedV2.stageBefore}/4, tiêu ${consumedV2.consumed}.`, source.id, target.id, skillId, { poisonSeedConsumed: consumedV2.consumed, poisonSeedStageBefore: consumedV2.stageBefore, poisonHeart: consumedV2.heart, poisonSeedStage: source.battleDaoStateV2?.poison?.core?.poisonSeedStage ?? 0 });
                        const sealV2 = this.elementalContextV133(source, skill, skill?.elementalCoefficients, runtimeAction);
                        const outcome = this.applyDamage(source, target, { sourceTag: effect.sourceTag ?? defaultSourceTag, coefficient, breakDamagePct: consumedV2.consumed * (effect.breakDamagePctPerStack ?? effect.stabilityDamagePerStack ?? 0), canCrit: true, canDodge: true, canHeart: true, unavoidable: skill?.unavoidable ?? false, trueDamage: false, procCoefficient: 1, skillId, elementalCoefficients: sealV2.elementalCoefficients, primaryElement: sealV2.primaryElement, cooldownDamageBonusPct, runtimeEffectBonusPct: Math.max(0, runtimeAction?.effectBonusPct ?? 0), runtimeBreakBonusPct: Math.max(0, runtimeAction?.breakBonusPct ?? 0) }, now);
                        recordDamageOutcomeV2(runtimeAction, effect.sourceTag ?? defaultSourceTag, outcome);
                        if (outcome.hpDamage > 0)
                            this.generateBloodBreath(source, outcome.hpDamage, effect.sourceTag ?? defaultSourceTag, now);
                        break;
                    }
                    if (battleDaoV2Enabled(source) && dao === 'mind' && effect.mark === 'Thần Ấn') {
                        const sealV2 = this.elementalContextV133(source, skill, skill?.elementalCoefficients, runtimeAction);
                        const outcome = this.applyDamage(source, target, { sourceTag: effect.sourceTag ?? defaultSourceTag, coefficient: effect.baseCoefficient, breakDamagePct: 0, canCrit: true, canDodge: true, canHeart: true, unavoidable: skill?.unavoidable ?? false, trueDamage: false, procCoefficient: 1, skillId, elementalCoefficients: sealV2.elementalCoefficients, primaryElement: sealV2.primaryElement, cooldownDamageBonusPct, runtimeEffectBonusPct: Math.max(0, runtimeAction?.effectBonusPct ?? 0), runtimeBreakBonusPct: Math.max(0, runtimeAction?.breakBonusPct ?? 0) }, now);
                        recordDamageOutcomeV2(runtimeAction, effect.sourceTag ?? defaultSourceTag, outcome);
                        break;
                    }
                    const poisonFull = dao === 'poison' && sig === 'poisonConsume' && Boolean(setMechanicV117(source, 'poison_full_consume_burst'));
                    const mindFull = dao === 'mind' && sig === 'mindBurst' && Boolean(setMechanicV117(source, 'mind_consume_all_disrupt'));
                    const consumed = Math.min(current, (poisonFull || mindFull) ? current : effect.maxConsume);
                    let retained = 0;
                    if (dao === 'poison' && sig === 'poisonConsume') {
                        const set = setMechanicV117(source, 'poison_consume_retention');
                        const pct = set?.params['retainedBasePct'] ?? 0;
                        const carry = source.pendingSetFlagsV117['poisonRetainCarry'] ?? 0;
                        const total = consumed * pct / 100 + carry;
                        retained = Math.floor(total + 1e-9);
                        source.pendingSetFlagsV117['poisonRetainCarry'] = total - retained;
                    }
                    target.marks[effect.mark] = Math.max(0, current - consumed + retained);
                    let coefficient = effect.baseCoefficient + consumed * effect.coefficientPerStack;
                    if (poisonFull) {
                        const full = setMechanicV117(source, 'poison_full_consume_burst');
                        const poolKey = `poisonDotPool:${source.id}`;
                        const pool = Math.max(0, target.pendingSetFlagsV117[poolKey] ?? 0);
                        coefficient += pool * (full.params['remainingDotConversionPct'] ?? 0) / 100;
                        target.pendingSetFlagsV117[poolKey] = 0;
                        const epochKey = `poisonDotEpoch:${source.id}`;
                        target.pendingSetFlagsV117[epochKey] = (target.pendingSetFlagsV117[epochKey] ?? 0) + 1;
                        source.pendingSetFlagsV117['poisonBuildPenaltyUntil'] = now + (full.params['penaltySeconds'] ?? 4);
                        source.pendingSetFlagsV117['poisonBuildPenaltyPct'] = full.params['postConsumeGeneratePenaltyPct'] ?? 40;
                    }
                    if (dao === 'mind' && sig === 'mindBurst' && consumed > 0)
                        source.pendingSetFlagsV117['lastConsumedMindMarksV120'] = consumed;
                    this.log(now, 'mark', `${source.name} tiêu hao ${consumed} tầng ${effect.mark}${retained > 0 ? `, giữ lại ${retained}` : ''}.`, source.id, target.id, skillId, { consumed, retained });
                    const sealV133 = this.elementalContextV133(source, skill, skill?.elementalCoefficients, runtimeAction);
                    const outcome = this.applyDamage(source, target, {
                        sourceTag: effect.sourceTag ?? defaultSourceTag,
                        coefficient,
                        breakDamagePct: consumed * (effect.breakDamagePctPerStack ?? effect.stabilityDamagePerStack ?? 0),
                        canCrit: true,
                        canDodge: true,
                        canHeart: true,
                        unavoidable: skill?.unavoidable ?? false,
                        trueDamage: false,
                        procCoefficient: 1,
                        skillId,
                        elementalCoefficients: sealV133.elementalCoefficients,
                        primaryElement: sealV133.primaryElement,
                        cooldownDamageBonusPct,
                        runtimeEffectBonusPct: Math.max(0, runtimeAction?.effectBonusPct ?? 0),
                        runtimeBreakBonusPct: Math.max(0, runtimeAction?.breakBonusPct ?? 0),
                    }, now);
                    recordDamageOutcomeV2(runtimeAction, effect.sourceTag ?? defaultSourceTag, outcome);
                    if (outcome.hpDamage > 0)
                        this.generateBloodBreath(source, outcome.hpDamage, effect.sourceTag ?? defaultSourceTag, now);
                    break;
                }
                case 'restoreSpirit': {
                    const before = source.spirit;
                    const requested = Math.max(0, effect.flat);
                    source.spirit = Math.min(source.baseStats.maxSpirit, source.spirit + requested);
                    const restored = source.spirit - before;
                    const overflow = Math.max(0, requested - restored);
                    if (skill && overflow > 0 && source.ultimateGaugeV117 < 80) {
                        const pct = techniqueSpiritOverflowToGaugePctV119(source, skill, now);
                        const standard = Math.max(1, combatSpiritStandard(effectiveStats(source, this.registry, now)));
                        const gauge = Math.min(5, overflow / standard * 100 * pct / 100);
                        if (gauge > 0)
                            source.ultimateGaugeV117 = Math.min(100, source.ultimateGaugeV117 + gauge);
                    }
                    this.log(now, 'resource', `${source.name} hồi ${restored.toFixed(0)} Chân Nguyên.`, source.id, source.id, skillId);
                    break;
                }
            }
        }
    }
    elementalContextV133(source, skill, authored, runtimeAction, spread = 1) {
        const coefficients = { ...(authored ?? {}) };
        let primaryElement = skill?.primaryElement;
        if (skill && runtimeAction && !runtimeAction.elementSealBudgetUsedV133) {
            const seal = elementSealDamageCoefficientV133(source, skill);
            if (seal) {
                coefficients[seal.element] = (coefficients[seal.element] ?? 0) + seal.coefficient / Math.max(1, spread);
                primaryElement = primaryElement ?? seal.element;
                runtimeAction.elementSealBudgetUsedV133 = true;
            }
        }
        return { elementalCoefficients: Object.keys(coefficients).length ? coefficients : undefined, primaryElement };
    }
    damageContextFromEffect(source, effect, defaultSourceTag, skill, skillId, cooldownDamageBonusPct, runtimeAction) {
        const sealV133 = this.elementalContextV133(source, skill, effect.elementalCoefficients ?? skill?.elementalCoefficients, runtimeAction);
        return {
            sourceTag: effect.sourceTag ?? defaultSourceTag,
            coefficient: effect.coefficient,
            targetMaxHpPct: effect.targetMaxHpPct,
            targetMaxHpAttackCapCoefficient: effect.targetMaxHpAttackCapCoefficient,
            breakDamagePct: effect.breakDamagePct ?? effect.stabilityDamage ?? 0,
            canCrit: effect.canCrit ?? !effect.trueDamage,
            canDodge: effect.canDodge ?? true,
            canHeart: effect.canHeart ?? true,
            unavoidable: effect.unavoidable ?? skill?.unavoidable ?? false,
            trueDamage: effect.trueDamage ?? false,
            procCoefficient: effect.procCoefficient ?? 1,
            skillId,
            elementalCoefficients: sealV133.elementalCoefficients,
            primaryElement: sealV133.primaryElement,
            cooldownDamageBonusPct,
            runtimeEffectBonusPct: Math.max(0, runtimeAction?.effectBonusPct ?? 0),
            runtimeBreakBonusPct: Math.max(0, runtimeAction?.breakBonusPct ?? 0),
        };
    }
    rollHit(source, target, ctx, now) {
        const srcStats = effectiveStats(source, this.registry, now);
        const dstStats = effectiveStats(target, this.registry, now);
        const heart = heartProfile(srcStats);
        const dodge = dodgeProfile(dstStats);
        const standGround = (target.pendingSetFlagsV117['earthBodyStandUntil'] ?? 0) > now;
        const effectiveDodgeChance = standGround ? 0 : dodge.chancePct;
        // V129: Hội Tâm is an authored precision event. It is rolled even on Tất Trúng skills;
        // Tất Trúng only skips the Dodge check, never Crit/Hội Tâm.
        if (ctx.canHeart && this.rng.chance(heart.chancePct)) {
            this.log(now, 'heart', `${source.name} đánh ra Hội Tâm, bỏ qua Né Tránh.`, source.id, target.id, ctx.skillId, { chancePct: heart.chancePct, damagePct: heart.damagePct });
            return { hit: true, heart: true, failedDodge: false };
        }
        if (ctx.unavoidable || !ctx.canDodge)
            return { hit: true, heart: false, failedDodge: false };
        if (this.rng.chance(effectiveDodgeChance)) {
            this.log(now, 'dodge', `${target.name} Né Tránh công kích (${effectiveDodgeChance.toFixed(1)}%).`, source.id, target.id, ctx.skillId, { dodgeChancePct: effectiveDodgeChance });
            target.pendingSetFlagsV117['techniqueAfterDodgeUntil'] = now + 3;
            this.fireTriggers(target, source, 'OnDodge', ctx.sourceTag, now, ctx.procCoefficient);
            this.fireTriggers(source, target, 'OnTargetDodge', ctx.sourceTag, now, ctx.procCoefficient);
            return { hit: false, heart: false, failedDodge: false };
        }
        return { hit: true, heart: false, failedDodge: true };
    }
    usesLockedCombat(source, target) {
        return source.combatModel === 'locked-v1' && target.combatModel === 'locked-v1';
    }
    applyDamageLegacy(source, target, ctx, now) {
        const srcStats = effectiveStats(source, this.registry, now);
        const dstStats = effectiveStats(target, this.registry, now);
        if (ctx.canDodge) {
            const evade = evadeChancePct(dstStats.mobility, srcStats.accuracy, target.dodgePressure);
            if (this.rng.chance(evade)) {
                target.dodgePressure += 1;
                this.log(now, 'dodge', `${target.name} né tránh công kích (${evade.toFixed(1)}%).`, source.id, target.id, ctx.skillId, { evadeChancePct: evade });
                target.pendingSetFlagsV117['techniqueAfterDodgeUntil'] = now + 3;
                this.fireTriggers(target, source, 'OnDodge', ctx.sourceTag, now, ctx.procCoefficient);
                this.fireTriggers(source, target, 'OnTargetDodge', ctx.sourceTag, now, ctx.procCoefficient);
                return { hit: false, hpDamage: 0, shieldDamage: 0, heart: false, crit: false };
            }
            target.dodgePressure = Math.max(0, target.dodgePressure - 0.65);
        }
        const hpPart = Math.min(combatMaxHp(target.baseStats) * Math.max(0, ctx.targetMaxHpPct ?? 0) / 100, srcStats.attack * Math.max(0, ctx.targetMaxHpAttackCapCoefficient ?? 0));
        const raw = srcStats.attack * ctx.coefficient + hpPart;
        let damage = raw * defenseFactor(srcStats.attack, dstStats.defense, 0);
        let layers = 0;
        if (ctx.canCrit) {
            layers = critLayers(srcStats.critChancePct, this.rng.next());
            if (layers > 0) {
                damage *= critMultiplier(layers, srcStats.critPowerPerLayer);
                this.log(now, 'crit', `${source.name} bạo kích tầng ${layers}.`, source.id, target.id, ctx.skillId, { layers });
            }
        }
        let remaining = damage;
        let shieldDamage = 0;
        for (const shield of target.shields) {
            if (remaining <= 0)
                break;
            if (shield.expiresAt <= now || shield.capacity <= 0 || shield.stability <= 0)
                continue;
            const absorbed = Math.min(shield.capacity, remaining);
            shield.capacity -= absorbed;
            remaining -= absorbed;
            shieldDamage += absorbed;
            shield.stability -= ctx.breakDamagePct;
            this.log(now, 'shield', `${target.name} hộ thuẫn hấp thu ${absorbed.toFixed(0)} sát thương.`, source.id, target.id, ctx.skillId, { absorbed, remainingCapacity: Math.max(0, shield.capacity), remainingStability: Math.max(0, shield.stability) });
            if (shield.capacity <= 0 || shield.stability <= 0) {
                shield.capacity = Math.max(0, shield.capacity);
                shield.stability = Math.max(0, shield.stability);
                this.log(now, 'shieldBreak', `Hộ thuẫn của ${target.name} vỡ.`, source.id, target.id, ctx.skillId);
                this.fireTriggers(source, target, 'OnShieldBreak', ctx.sourceTag, now);
                this.registerCounterAction(source, target, 'shieldBreak', now, ctx.skillId);
            }
        }
        const hpDamage = Math.min(target.hp, Math.max(0, remaining));
        if (hpDamage > 0) {
            target.hp = Math.max(0, target.hp - hpDamage);
            const bloodGain = onBattleDaoV2HpDamageTaken(target, hpDamage, now, pct => this.rng.chance(pct));
            if (bloodGain > 0)
                this.log(now, 'resource', `${target.name} dâng +${bloodGain} Huyết Khí.`, target.id, target.id, ctx.skillId, { bodyPassiveStackGain: bloodGain, bodyPassiveStack: target.battleDaoStateV2?.body?.stack?.stacks ?? 0 });
            this.log(now, 'damage', `${source.name} gây ${hpDamage.toFixed(0)} sát thương lên ${target.name}.`, source.id, target.id, ctx.skillId, {
                damage: hpDamage,
                coefficient: ctx.coefficient,
                sourceTag: ctx.sourceTag,
                critLayers: layers,
            });
            this.fireTriggers(source, target, 'OnHit', ctx.sourceTag, now, ctx.procCoefficient);
            if (layers > 0)
                this.fireTriggers(source, target, 'OnCrit', ctx.sourceTag, now, ctx.procCoefficient);
            this.fireTriggers(target, source, 'OnDamageTaken', ctx.sourceTag, now, ctx.procCoefficient);
            if (target.hp <= 0)
                this.kill(target, source, now);
            else
                this.checkPhaseTransitions(target, source, now);
        }
        return { hit: true, hpDamage, shieldDamage, heart: false, crit: layers > 0 };
    }
    applyDamage(source, target, ctx, now) {
        if (!this.usesLockedCombat(source, target))
            return this.applyDamageLegacy(source, target, ctx, now);
        const hitRoll = this.rollHit(source, target, ctx, now);
        if (!hitRoll.hit)
            return { hit: false, hpDamage: 0, shieldDamage: 0, heart: false, crit: false };
        const srcStats = effectiveStats(source, this.registry, now);
        const dstStats = effectiveStats(target, this.registry, now);
        const heart = heartProfile(srcStats);
        const crit = critProfile(srcStats);
        const critLayerCount = ctx.canCrit
            ? crit.guaranteedLayers + (this.rng.chance(crit.nextLayerChancePct) ? 1 : 0)
            : 0;
        const didCrit = critLayerCount > 0;
        if (didCrit)
            this.log(now, 'crit', `${source.name} ${critLayerName(critLayerCount)}.`, source.id, target.id, ctx.skillId, { rawCritPct: crit.rawPct, guaranteedLayers: crit.guaranteedLayers, nextLayerChancePct: crit.nextLayerChancePct, critLayers: critLayerCount, damagePctPerLayer: crit.damagePctPerLayer });
        const hpPart = Math.min(combatMaxHp(target.baseStats) * Math.max(0, ctx.targetMaxHpPct ?? 0) / 100, srcStats.attack * Math.max(0, ctx.targetMaxHpAttackCapCoefficient ?? 0));
        let raw = srcStats.attack * Math.max(0, ctx.coefficient) + hpPart;
        const elemental = ctx.elementalCoefficients ?? {};
        for (const [elementKey, coefficientValue] of Object.entries(elemental)) {
            const element = elementKey;
            const coefficient = coefficientValue ?? 0;
            if (coefficient <= 0)
                continue;
            const affinity = elementAffinity(srcStats, element);
            let component = rawElementalDamage(srcStats.attack, coefficient, affinity);
            const counter = ctx.primaryElement === element && fiveElementCounter(element, dstStats.dominantElement);
            component *= fiveElementDamageMultiplier(counter);
            const resistance = dstStats.elementalResistancesPct?.[element] ?? 0;
            component *= elementResistanceMultiplier(resistance);
            raw += component;
        }
        // Alpha.23.18: readable Ngũ Hành Set bonuses. They are global build stats and do not require an elemental meter.
        raw *= 1 + simpleSetParamV12318(source, 'simple_fire_damage', 'damageBonusPct') / 100;
        if (ctx.sourceTag === 'DoT')
            raw *= 1 + simpleSetParamV12318(source, 'simple_wood_dot_damage', 'dotDamagePct') / 100;
        if (ctx.sourceTag === 'Counter')
            raw *= 1 + simpleSetParamV12318(source, 'simple_earth_counter_damage', 'counterDamagePct') / 100;
        if (target.breakDebuffUntil > now)
            raw *= 1 + simpleSetParamV12318(source, 'simple_metal_broken_damage', 'damageBonusPct') / 100;
        raw *= 1 + Math.max(0, ctx.runtimeEffectBonusPct) / 100;
        raw *= 1 + Math.max(0, ctx.cooldownDamageBonusPct) / 100;
        raw *= battleDaoV2OutgoingMultiplier(source, target, now, ctx.sourceTag);
        if (ctx.sourceTag === 'ActiveHit' || ctx.sourceTag === 'Counter')
            raw *= swordV2DirectDamageMultiplier(source, now);
        const breakMarkUntil = target.pendingSetFlagsV117['swordV2BreakMarkUntil'] ?? 0;
        if (breakMarkUntil > now)
            raw *= 1 + (target.pendingSetFlagsV117['swordV2BreakMarkPct'] ?? 0) / 100;
        const swordCritHeartBonus = swordV2CritHeartBonusPct(source, now);
        raw *= combinedHeartCritMultiplier(hitRoll.heart, critLayerCount, heart.damagePct + (hitRoll.heart ? swordCritHeartBonus : 0), crit.damagePctPerLayer + (didCrit ? swordCritHeartBonus : 0));
        let damage = raw;
        if (!ctx.trueDamage) {
            damage *= defenseFactor(srcStats.attack, dstStats.defense, srcStats.armorPenPct ?? 0);
            const techniqueDr = techniqueDamageReductionAdjustmentPctV119(target, now);
            const adjustedReduction = Math.max(-80, Math.min(80, totalDamageReductionPct(dstStats) + techniqueDr));
            damage *= adjustedReduction >= 0 ? 1 - adjustedReduction / 100 : 1 + (-adjustedReduction) / 100;
            // Trọng Thế grants at most +10% mitigation from the first 100 points; overcap is spend storage only.
            if (rootUnlockedV117(target, 'earth'))
                damage *= 1 - Math.min(100, target.fiveElementsV117.earthWeight) / 1000;
            damage *= battleDaoV2IncomingDamageMultiplier(target, now);
        }
        damage = Math.max(0, damage);
        if (!ctx.trueDamage && damage > 0) {
            const formationGuard = formationFieldGuardV133(target, Math.max(ctx.coefficient, ...Object.values(ctx.elementalCoefficients ?? {}).map(x => x ?? 0)));
            if (formationGuard.mitigationPct > 0) {
                const prevented = damage * formationGuard.mitigationPct / 100;
                damage = Math.max(0, damage - prevented);
                this.log(now, 'resource', `${target.name} dùng Chủ Trận hóa giải ${prevented.toFixed(0)} sát thương.`, target.id, target.id, ctx.skillId, { formationMitigationPct: formationGuard.mitigationPct, formationIntegritySpent: formationGuard.integritySpent, formationIntegrity: target.daoStateV118.formationIntegrity });
            }
        }
        const shieldDamage = this.absorbWithShields(source, target, damage, now, ctx.skillId, ctx.sourceTag);
        let remaining = Math.max(0, damage - shieldDamage);
        const deferPct = techniqueDeferredDamagePctV119(target);
        if (deferPct > 0 && remaining > 0) {
            const deferred = remaining * deferPct / 100;
            remaining -= deferred;
            target.pendingSetFlagsV117['techniqueDeferredDamageDebt'] = (target.pendingSetFlagsV117['techniqueDeferredDamageDebt'] ?? 0) + deferred;
            target.pendingSetFlagsV117['techniqueDeferredDamageDueUntil'] = Math.max(target.pendingSetFlagsV117['techniqueDeferredDamageDueUntil'] ?? 0, now + 5);
            this.log(now, 'info', `${target.name} Tàng Thương ${deferred.toFixed(0)} sát thương để trả dần.`, target.id, target.id, ctx.skillId, { deferredDamage: deferred, debt: target.pendingSetFlagsV117['techniqueDeferredDamageDebt'] ?? 0 });
        }
        if (!ctx.trueDamage && (ctx.sourceTag === 'ActiveHit' || ctx.sourceTag === 'Counter') && (source.pendingSetFlagsV117['mitigationEventBudgetUsed'] ?? 0) <= 0 && raw > 1e-9) {
            const dominantCoefficient = Math.max(ctx.coefficient, ...Object.values(ctx.elementalCoefficients ?? {}).map(x => x ?? 0));
            const eventBudget = dominantCoefficient > 1.5 ? 25 : dominantCoefficient > .75 ? 18 : 12;
            const mitigatedRatio = Math.max(0, Math.min(1, 1 - remaining / raw));
            if (mitigatedRatio > 0) {
                source.pendingSetFlagsV117['mitigationEventBudgetUsed'] = 1;
                for (const notice of onMitigationEventV117(target, eventBudget, mitigatedRatio, now))
                    this.log(now, 'resource', notice.message, target.id, target.id, ctx.skillId, notice.data);
                for (const notice of onMitigationEventV118(target, eventBudget, mitigatedRatio, now))
                    this.log(now, 'resource', notice.message, target.id, target.id, ctx.skillId, notice.data);
                const v2Gain = onBattleDaoV2Mitigation(target, eventBudget, mitigatedRatio, now);
                if (v2Gain > 0)
                    this.log(now, 'resource', `${target.name} tích ${v2Gain.toFixed(1)} Phản Thế từ giảm thương thật.`, target.id, target.id, ctx.skillId, { counterForceGain: v2Gain, counterForce: target.battleDaoStateV2?.body?.core?.counterForce ?? 0 });
            }
        }
        const hpDamage = Math.min(target.hp, remaining);
        if (hpDamage > 0) {
            target.hp = Math.max(0, target.hp - hpDamage);
            const bloodGain = onBattleDaoV2HpDamageTaken(target, hpDamage, now, pct => this.rng.chance(pct));
            if (bloodGain > 0)
                this.log(now, 'resource', `${target.name} dâng +${bloodGain} Huyết Khí.`, target.id, target.id, ctx.skillId, { bodyPassiveStackGain: bloodGain, bodyPassiveStack: target.battleDaoStateV2?.body?.stack?.stacks ?? 0 });
            this.log(now, 'damage', `${source.name} gây ${hpDamage.toFixed(0)} sát thương lên ${target.name}.`, source.id, target.id, ctx.skillId, {
                damage: hpDamage,
                coefficient: ctx.coefficient,
                sourceTag: ctx.sourceTag,
                heart: hitRoll.heart,
                crit: didCrit,
                trueDamage: ctx.trueDamage,
            });
        }
        for (const [elementKey, coefficient] of Object.entries(elemental)) {
            if ((coefficient ?? 0) > 0)
                this.triggerElementalReactions(source, target, elementKey, ctx.sourceTag, now, ctx.skillId);
        }
        this.applyBreakDamage(source, target, ctx.breakDamagePct * (1 + Math.max(-90, srcStats.breakEffectPct ?? 0) / 100) * (1 + Math.max(0, ctx.runtimeBreakBonusPct) / 100) * (1 + simpleSetParamV12318(source, 'simple_metal_break', 'breakBonusPct') / 100) * battleDaoV2BreakMultiplier(source, now), ctx.primaryElement, now, ctx.skillId);
        this.fireTriggers(source, target, 'OnHit', ctx.sourceTag, now, ctx.procCoefficient);
        if (didCrit)
            this.fireTriggers(source, target, 'OnCrit', ctx.sourceTag, now, ctx.procCoefficient);
        if (hpDamage > 0)
            this.fireTriggers(target, source, 'OnDamageTaken', ctx.sourceTag, now, ctx.procCoefficient);
        if (target.hp <= 0)
            this.kill(target, source, now);
        else if (hpDamage > 0)
            this.checkPhaseTransitions(target, source, now);
        return { hit: true, hpDamage, shieldDamage, heart: hitRoll.heart, crit: didCrit };
    }
    absorbWithShields(source, target, incoming, now, skillId, sourceTag = 'Environment') {
        let remaining = incoming;
        let absorbedTotal = 0;
        for (const shield of target.shields) {
            if (remaining <= 0)
                break;
            if (shield.expiresAt <= now || shield.capacity <= 0)
                continue;
            const absorbed = Math.min(shield.capacity, remaining);
            shield.capacity -= absorbed;
            remaining -= absorbed;
            absorbedTotal += absorbed;
            this.log(now, 'shield', `${target.name} hộ thuẫn hấp thu ${absorbed.toFixed(0)} sát thương.`, source.id, target.id, skillId, { absorbed, remainingCapacity: Math.max(0, shield.capacity) });
            if (shield.capacity <= 0) {
                shield.capacity = 0;
                this.log(now, 'shieldBreak', `Hộ thuẫn của ${target.name} vỡ.`, source.id, target.id, skillId);
                this.fireTriggers(source, target, 'OnShieldBreak', sourceTag, now);
                this.registerCounterAction(source, target, 'shieldBreak', now, skillId);
            }
        }
        return absorbedTotal;
    }
    totalShield(entity, now) {
        return entity.shields.filter(shield => shield.expiresAt > now && shield.capacity > 0).reduce((sum, shield) => sum + shield.capacity, 0);
    }
    overhealShield(entity, now) {
        return entity.shields.filter(shield => shield.source === 'overheal' && shield.expiresAt > now && shield.capacity > 0).reduce((sum, shield) => sum + shield.capacity, 0);
    }
    applyDirectShield(source, target, effect, now, skillId) {
        if (source.combatModel !== 'locked-v1') {
            source.shields.push({ capacity: effect.capacity, stability: effect.stability, expiresAt: now + effect.duration, sourceSkillId: skillId ?? 'trigger', source: 'direct' });
            this.log(now, 'shield', `${source.name} nhận hộ thuẫn ${effect.capacity.toFixed(0)} / ổn định ${effect.stability.toFixed(0)}.`, source.id, source.id, skillId);
            return;
        }
        const stats = effectiveStats(source, this.registry, now);
        const maxHp = combatMaxHp(source.baseStats);
        const shieldEffectMultiplier = 1 + Math.max(-90, stats.shieldEffectPct ?? 0) / 100;
        const requested = Math.max(0, effect.capacity + maxHp * Math.max(0, effect.maxHpPct ?? 0) / 100 + stats.attack * Math.max(0, effect.attackCoefficient ?? 0)) * shieldEffectMultiplier;
        const totalCap = maxHp * Math.max(0, source.baseStats.shieldCapMaxHpPct ?? COMBAT_RULES.defaultShieldCapMaxHpPct) / 100;
        const existingSame = source.shields.find(shield => shield.source === 'direct' && shield.sourceSkillId === (skillId ?? 'trigger') && shield.expiresAt > now);
        const currentOther = Math.max(0, this.totalShield(source, now) - (existingSame?.capacity ?? 0));
        const maxForSource = Math.max(0, totalCap - currentOther);
        const applied = Math.min(requested, maxForSource);
        const overflow = Math.max(0, requested - applied);
        if (existingSame) {
            existingSame.capacity = Math.max(existingSame.capacity, applied);
            existingSame.expiresAt = now + effect.duration;
            existingSame.stability = Math.max(existingSame.stability, effect.stability);
        }
        else if (applied > 0) {
            source.shields.push({ capacity: applied, stability: effect.stability, expiresAt: now + effect.duration, sourceSkillId: skillId ?? 'trigger', source: 'direct' });
        }
        if (applied > 0)
            this.log(now, 'shield', `${source.name} nhận ${applied.toFixed(0)} Khiên.`, source.id, source.id, skillId, { shield: applied, totalShield: this.totalShield(source, now) });
        if (overflow > 0 && target.alive) {
            const ratio = Math.max(0, effect.overflowDamageRatio ?? COMBAT_RULES.directShieldOverflowDamageRatio);
            const overflowDamage = overflow * ratio;
            if (overflowDamage > 0) {
                this.log(now, 'info', `${source.name} chuyển Khiên dư thành sát thương.`, source.id, target.id, skillId, { shieldOverflow: overflow, overflowDamage });
                this.applyFlatNormalDamage(source, target, overflowDamage, now, skillId);
            }
        }
    }
    applyOverhealShield(source, target, overheal, now, skillId) {
        if (overheal <= 0)
            return 0;
        const maxHp = combatMaxHp(target.baseStats);
        const totalCap = maxHp * Math.max(0, target.baseStats.shieldCapMaxHpPct ?? COMBAT_RULES.defaultShieldCapMaxHpPct) / 100;
        const overhealCap = maxHp * Math.max(0, target.baseStats.overhealShieldCapMaxHpPct ?? COMBAT_RULES.defaultOverhealShieldCapMaxHpPct) / 100;
        const available = Math.max(0, Math.min(totalCap - this.totalShield(target, now), overhealCap - this.overhealShield(target, now)));
        const applied = Math.min(overheal, available);
        if (applied <= 0)
            return 0;
        const existing = target.shields.find(shield => shield.source === 'overheal' && shield.expiresAt > now);
        if (existing) {
            existing.capacity += applied;
            existing.expiresAt = Math.max(existing.expiresAt, now + 8);
        }
        else {
            target.shields.push({ capacity: applied, stability: Number.POSITIVE_INFINITY, expiresAt: now + 8, sourceSkillId: skillId ?? 'overheal', source: 'overheal' });
        }
        this.log(now, 'shield', `${target.name} chuyển ${applied.toFixed(0)} Hồi Phục dư thành Khiên.`, source.id, target.id, skillId, { overhealShield: applied });
        return applied;
    }
    applyFlatNormalDamage(source, target, rawAmount, now, skillId) {
        const srcStats = effectiveStats(source, this.registry, now);
        const dstStats = effectiveStats(target, this.registry, now);
        let damage = Math.max(0, rawAmount) * defenseFactor(srcStats.attack, dstStats.defense, srcStats.armorPenPct ?? 0);
        const adjustedReduction = Math.max(-80, Math.min(80, totalDamageReductionPct(dstStats) + techniqueDamageReductionAdjustmentPctV119(target, now)));
        damage *= adjustedReduction >= 0 ? 1 - adjustedReduction / 100 : 1 + (-adjustedReduction) / 100;
        const shieldDamage = this.absorbWithShields(source, target, damage, now, skillId, 'ProcHit');
        const hpDamage = Math.min(target.hp, Math.max(0, damage - shieldDamage));
        if (hpDamage > 0) {
            target.hp -= hpDamage;
            this.log(now, 'damage', `${source.name} gây ${hpDamage.toFixed(0)} sát thương chuyển hóa lên ${target.name}.`, source.id, target.id, skillId, { damage: hpDamage, conversion: 'shieldOverflow' });
            if (target.hp <= 0)
                this.kill(target, source, now);
            else
                this.checkPhaseTransitions(target, source, now);
        }
        return hpDamage;
    }
    applyHeal(source, target, amount, now, skillId) {
        if (target.combatModel !== 'locked-v1') {
            let multiplier = 1;
            for (const active of target.statuses) {
                if (active.expiresAt <= now)
                    continue;
                multiplier *= this.registry.status(active.id).healingReceivedMultiplier ?? 1;
            }
            const actual = Math.max(0, Math.min(target.baseStats.maxHp - target.hp, amount * multiplier));
            if (actual <= 0)
                return 0;
            target.hp += actual;
            this.log(now, 'heal', `${target.name} hồi ${actual.toFixed(0)} sinh mệnh.`, source.id, target.id, skillId, { heal: actual, multiplier });
            const enemy = [...this.entities.values()].find(entity => entity.id !== target.id && entity.alive);
            if (enemy)
                this.fireTriggers(enemy, target, 'OnEnemyHeal', 'Environment', now, 1);
            return actual;
        }
        const sourceStats = effectiveStats(source, this.registry, now);
        const targetStats = effectiveStats(target, this.registry, now);
        const statuses = this.activeStatusDefinitions(target, now);
        if (statuses.some(status => status.forbidHealing)) {
            this.log(now, 'heal', `${target.name} đang Cấm Sinh, không thể hồi Sinh Mệnh.`, source.id, target.id, skillId, { heal: 0, forbidden: true });
            return 0;
        }
        const sourceMultiplier = Math.max(0, 1 + (sourceStats.healingEffectivenessPct ?? 0) / 100);
        const targetBaseMultiplier = Math.max(0, 1 + (targetStats.healingReceivedPct ?? 0) / 100);
        const statusMultiplier = statuses.reduce((multiplier, status) => multiplier * Math.max(0, status.healingReceivedMultiplier ?? 1), 1);
        const techniqueHealMultiplier = techniqueHealingReceivedMultiplierV119(target) * (((target.pendingSetFlagsV117['techniqueBurnBloodHealPenaltyUntil'] ?? 0) > now) ? 0.8 : 1);
        const modified = Math.max(0, amount * sourceMultiplier * targetBaseMultiplier * statusMultiplier * techniqueHealMultiplier * battleDaoV2HealShieldMultiplier(source, now));
        const maxHp = combatMaxHp(target.baseStats);
        const missing = Math.max(0, maxHp - target.hp);
        const actual = Math.min(missing, modified);
        const overheal = Math.max(0, modified - actual);
        if (actual > 0) {
            target.hp += actual;
            this.log(now, 'heal', `${target.name} hồi ${actual.toFixed(0)} Sinh Mệnh.`, source.id, target.id, skillId, { heal: actual, sourceMultiplier, targetMultiplier: targetBaseMultiplier * statusMultiplier });
            const enemy = [...this.entities.values()].find(entity => entity.id !== target.id && entity.alive);
            if (enemy)
                this.fireTriggers(enemy, target, 'OnEnemyHeal', 'Environment', now, 1);
        }
        if (overheal > 0)
            this.applyOverhealShield(source, target, overheal, now, skillId);
        return actual;
    }
    generateBloodBreath(source, hpDamage, sourceTag, now, explicitRatio) {
        if (hpDamage <= 0)
            return;
        const stats = effectiveStats(source, this.registry, now);
        const ratio = explicitRatio ?? Math.max(0, (stats.lifeStealPct ?? 0) / 100);
        if (ratio <= 0)
            return;
        const efficiency = sourceTag === 'DoT' ? COMBAT_RULES.dotLifestealEfficiency : 1;
        const generated = hpDamage * ratio * efficiency;
        if (generated <= 0)
            return;
        const cap = combatMaxHp(source.baseStats) * Math.max(0, stats.bloodBreathCapacityPct ?? COMBAT_RULES.defaultBloodBreathCapacityPct) / 100;
        const before = source.bloodBreath;
        source.bloodBreath = Math.min(cap, source.bloodBreath + generated);
        const stored = source.bloodBreath - before;
        if (stored > 0)
            this.log(now, 'resource', `${source.name} tích ${stored.toFixed(0)} Huyết Tức.`, source.id, source.id, undefined, { bloodBreath: source.bloodBreath, generated: stored, efficiency });
    }
    triggerElementalReactions(source, target, incomingElement, sourceTag, now, skillId) {
        for (const reaction of this.registry.elementalReactions.values()) {
            if (reaction.incomingElement !== incomingElement)
                continue;
            if (reaction.sourceTags && !reaction.sourceTags.includes(sourceTag))
                continue;
            if (!reaction.requiredStatusIds.every(statusId => target.statuses.some(active => active.id === statusId && active.expiresAt > now)))
                continue;
            if (reaction.consumeStatusIds?.length) {
                target.statuses = target.statuses.filter(active => !reaction.consumeStatusIds.includes(active.id));
            }
            this.log(now, 'reaction', `${reaction.name} kích hoạt.`, source.id, target.id, skillId, { reactionId: reaction.id, element: incomingElement });
            this.resolveEffects(source, target, reaction.effects, 'ProcHit', now, skillId);
        }
    }
    applyBreakDamage(source, target, basePct, primaryElement, now, skillId) {
        if (basePct <= 0 || now < target.stableUntil)
            return;
        const srcStats = effectiveStats(source, this.registry, now);
        const dstStats = effectiveStats(target, this.registry, now);
        const counter = fiveElementCounter(primaryElement, dstStats.dominantElement);
        let amount = basePct * fiveElementBreakMultiplier(counter) * Math.max(0, dstStats.breakDamageTakenMultiplier ?? 1);
        for (const status of this.activeStatusDefinitions(target, now))
            amount *= Math.max(0, status.breakDamageTakenMultiplier ?? 1);
        if (amount <= 0)
            return;
        target.poise = Math.max(0, target.poise - amount);
        target.lastBreakDamageAt = now;
        this.log(now, 'break', `${source.name} gây ${amount.toFixed(1)}% Phá Thế lên ${target.name}.`, source.id, target.id, skillId, { breakDamagePct: amount, poise: target.poise, counter });
        if (target.poise <= 0)
            this.triggerBreak(source, target, now, skillId);
    }
    triggerBreak(source, target, now, skillId) {
        target.poise = 0;
        target.breakDebuffUntil = now + COMBAT_RULES.breakDebuffSeconds;
        target.breakRecoveryStartedAt = now;
        target.breakRecoveryEndsAt = now + COMBAT_RULES.breakDebuffSeconds;
        target.stableUntil = target.breakRecoveryEndsAt + COMBAT_RULES.breakStableSeconds;
        const wasActing = Boolean(target.casting || target.channeling);
        this.interruptAction(target, source, now, 'Thất Thế', skillId);
        // Thất Thế is a defense vulnerability, not a hidden hard-stun. If it interrupted an action,
        // the victim must re-enter the decision timeline instead of being frozen for the rest of combat.
        if (wasActing)
            this.schedule({ time: now + .10, kind: 'decide', actorId: target.id, targetId: source.id });
        const defenseReduction = COMBAT_RULES.breakDefenseReductionPct * (target.tags.includes('Boss') ? COMBAT_RULES.bossBreakDebuffEffectiveness : 1);
        this.log(now, 'break', `${target.name} Thất Thế: Phòng Ngự -${defenseReduction.toFixed(0)}% trong 5s, sau đó Ổn Thế 3s.`, source.id, target.id, skillId, {
            broken: true,
            defenseReductionPct: defenseReduction,
            breakDebuffSeconds: COMBAT_RULES.breakDebuffSeconds,
            stableSeconds: COMBAT_RULES.breakStableSeconds,
        });
    }
    isControlStatus(def) {
        return def.controlKind !== undefined || def.group === 'BodyControl' || def.group === 'SpiritControl';
    }
    applyStatus(source, target, statusId, baseDuration, stacks, now, skillId) {
        const def = this.registry.status(statusId);
        if (target.combatModel !== 'locked-v1') {
            let duration = baseDuration;
            if (def.group === 'BodyControl' || def.group === 'SpiritControl') {
                const src = effectiveStats(source, this.registry, now);
                const dst = effectiveStats(target, this.registry, now);
                const pressure = target.controlPressure[def.group] ?? 0;
                const contest = src.controlPower / Math.max(1, src.controlPower + dst.resolve * (1 + pressure * 0.35));
                duration *= 0.35 + 1.3 * contest;
                target.controlPressure[def.group] = pressure + 1;
                if (def.disablesActions && target.casting) {
                    this.log(now, 'info', `${target.name} bị ngắt thi pháp ${this.registry.skill(target.casting.skillId).name}.`, source.id, target.id, skillId);
                    target.casting = undefined;
                    this.schedule({ time: now + duration, kind: 'decide', actorId: target.id, targetId: source.id });
                }
            }
            const existingLegacy = target.statuses.find(status => status.id === statusId && status.expiresAt > now);
            if (existingLegacy) {
                existingLegacy.expiresAt = Math.max(existingLegacy.expiresAt, now + duration);
                existingLegacy.stacks += stacks;
            }
            else
                target.statuses.push({ id: statusId, expiresAt: now + duration, stacks });
            this.log(now, 'status', `${target.name} chịu ${def.name} trong ${duration.toFixed(2)}s.`, source.id, target.id, skillId, { duration });
            if ((def.healingReceivedMultiplier ?? 1) < 0.8)
                this.registerCounterAction(source, target, 'antiHeal', now, skillId);
            return;
        }
        let duration = Math.max(0, baseDuration);
        const isControl = this.isControlStatus(def);
        if (isControl) {
            const immune = target.controlImmunityUntil > now || this.activeStatusDefinitions(target, now).some(status => status.controlImmunity);
            if (immune) {
                this.log(now, 'status', `${target.name} đang Bất Khuất, miễn ${def.name}.`, source.id, target.id, skillId, { immune: true });
                return;
            }
            const reduction = controlDurationReductionPct(effectiveStats(target, this.registry, now));
            duration = effectiveControlDuration(duration, reduction);
        }
        if (duration <= 0)
            return;
        const existing = target.statuses.find(s => s.id === statusId && s.expiresAt > now);
        const previousEnd = existing?.expiresAt ?? now;
        const newEnd = Math.max(previousEnd, now + duration);
        if (existing) {
            existing.expiresAt = newEnd;
            existing.stacks += stacks;
        }
        else {
            target.statuses.push({ id: statusId, expiresAt: newEnd, stacks });
        }
        if (isControl)
            this.recordControlCoverage(target, source, now, previousEnd, newEnd);
        if (def.disablesActions) {
            this.interruptAction(target, source, now, def.name, skillId);
            this.schedule({ time: newEnd, kind: 'decide', actorId: target.id, targetId: source.id });
        }
        else if (def.disablesTaggedSkills?.length && target.casting) {
            const activeSkill = this.registry.skill(target.casting.skillId);
            if (def.disablesTaggedSkills.some(tag => activeSkill.tags.includes(tag)))
                this.interruptAction(target, source, now, def.name, skillId, true);
        }
        this.log(now, 'status', `${target.name} chịu ${def.name} trong ${duration.toFixed(2)}s.`, source.id, target.id, skillId, { duration, stacks });
        if ((def.healingReceivedMultiplier ?? 1) < 0.8)
            this.registerCounterAction(source, target, 'antiHeal', now, skillId);
    }
    recordControlCoverage(target, source, now, previousEnd, newEnd) {
        if (target.controlChainUntil <= now && now - target.controlChainLastEndedAt >= COMBAT_RULES.controlChainResetGapSeconds) {
            target.controlChainSeconds = 0;
        }
        const coveredBefore = Math.max(now, Math.max(target.controlChainUntil, previousEnd));
        const added = Math.max(0, newEnd - coveredBefore);
        const before = target.controlChainSeconds;
        target.controlChainSeconds += added;
        target.controlChainUntil = Math.max(target.controlChainUntil, newEnd);
        target.controlChainLastEndedAt = target.controlChainUntil;
        if (before < COMBAT_RULES.controlChainLimitSeconds && target.controlChainSeconds >= COMBAT_RULES.controlChainLimitSeconds) {
            const delay = COMBAT_RULES.controlChainLimitSeconds - before;
            const token = ++target.controlChainToken;
            this.schedule({ time: now + Math.max(0, delay), kind: 'controlBreak', actorId: target.id, targetId: source.id, controlToken: token });
        }
    }
    handleControlBreak(target, source, token, now) {
        if (token !== target.controlChainToken)
            return;
        const hasControl = target.statuses.some(active => active.expiresAt > now && this.isControlStatus(this.registry.status(active.id)));
        if (!hasControl)
            return;
        target.statuses = target.statuses.filter(active => !this.isControlStatus(this.registry.status(active.id)));
        target.controlImmunityUntil = now + COMBAT_RULES.controlImmunitySeconds;
        target.controlChainSeconds = 0;
        target.controlChainUntil = now;
        target.controlChainLastEndedAt = now;
        this.log(now, 'status', `${target.name} chịu Khống Chế liên tục 5s, phá khống chế và Bất Khuất 3s.`, target.id, source.id, undefined, { controlImmunitySeconds: COMBAT_RULES.controlImmunitySeconds });
        this.schedule({ time: now + 0.01, kind: 'decide', actorId: target.id, targetId: source.id });
    }
    interruptAction(target, source, now, reason, skillId, resistible = false) {
        if (resistible) {
            const activeId = target.casting?.skillId ?? target.channeling?.skillId;
            if (activeId) {
                const activeSkill = this.registry.skill(activeId);
                const resist = techniqueInterruptResistPctV119(target, activeSkill, now);
                if (resist > 0 && this.rng.chance(resist)) {
                    this.log(now, 'info', `${target.name} ổn định công pháp, chống được gián đoạn ${reason}.`, target.id, target.id, activeId, { interruptResistPct: resist });
                    return;
                }
            }
        }
        const hadAction = Boolean(target.casting || target.channeling);
        if (target.casting) {
            this.log(now, 'info', `${target.name} bị ${reason} ngắt Vận Chiêu ${this.registry.skill(target.casting.skillId).name}.`, source.id, target.id, skillId);
            target.casting = undefined;
        }
        if (target.channeling) {
            this.log(now, 'info', `${target.name} bị ${reason} ngắt Duy Trì ${this.registry.skill(target.channeling.skillId).name}.`, source.id, target.id, skillId);
            target.channeling = undefined;
        }
        if (hadAction)
            onBattleDaoInterruptedV120(target, now);
        target.pendingSetFlagsV117['techniqueAfterInterruptUntil'] = now + 4;
    }
    registerCounterAction(source, target, action, now, skillId) {
        const active = target.activeCounterWindow;
        if (!active || active.succeeded)
            return;
        if (now > active.expiresAt) {
            target.activeCounterWindow = undefined;
            return;
        }
        const phase = target.phases.find(candidate => candidate.id === active.phaseId);
        const window = phase?.counterWindow;
        if (!window || window.trigger.type !== action)
            return;
        if (action === 'skillRole') {
            if (!skillId)
                return;
            const skill = this.registry.skill(skillId);
            const roles = tacticalIdentity(skill, this.registry).roles;
            const required = window.trigger.type === 'skillRole' ? window.trigger.roles : [];
            if (!required.some(role => roles.includes(role)))
                return;
            active.progress += 1;
            const needed = window.trigger.type === 'skillRole' ? Math.max(1, window.trigger.requiredActions ?? 1) : 1;
            this.log(now, 'counterWindow', `${source.name} đáp đúng ${window.name}: ${active.progress}/${needed}.`, source.id, target.id, skillId, { counterWindowId: window.id, counterWindowName: window.name, progress: active.progress, required: needed });
            if (active.progress < needed)
                return;
        }
        else {
            active.progress = 1;
        }
        active.succeeded = true;
        this.log(now, 'counterWindow', window.successText, source.id, target.id, skillId, { counterWindowId: window.id, counterWindowName: window.name, success: true });
        if (window.onSuccessEffects?.length)
            this.resolveEffects(source, target, window.onSuccessEffects, 'Counter', now, skillId);
    }
    handleCounterWindowExpire(owner, opponent, phaseId, windowId, now) {
        const active = owner.activeCounterWindow;
        if (!active || active.succeeded || active.phaseId !== phaseId || active.id !== windowId)
            return;
        const phase = owner.phases.find(candidate => candidate.id === phaseId);
        const window = phase?.counterWindow;
        if (!window)
            return;
        owner.activeCounterWindow = undefined;
        const failureText = window.failureText ?? `${window.name} khép lại; Boss giữ được nhịp cơ chế.`;
        this.log(now, 'counterWindow', failureText, owner.id, opponent.id, undefined, { counterWindowId: window.id, counterWindowName: window.name, failure: true, expired: true });
        if (window.onFailureEffects?.length)
            this.resolveEffects(owner, opponent, window.onFailureEffects, 'Environment', now);
    }
    checkPhaseTransitions(owner, opponent, now) {
        if (!owner.alive || owner.phases.length === 0)
            return;
        const hpPct = owner.hp / Math.max(1, combatMaxHp(owner.baseStats)) * 100;
        for (const phase of owner.phases) {
            if (owner.enteredPhaseIds.includes(phase.id))
                continue;
            if (hpPct > phase.hpBelowPct)
                continue;
            owner.enteredPhaseIds.push(phase.id);
            if (phase.interruptCasting && (owner.casting || owner.channeling)) {
                this.interruptAction(owner, opponent, now, 'chuyển thế');
            }
            if (phase.aiProfile) {
                owner.aiProfile = {
                    name: phase.aiProfile.name,
                    rules: phase.aiProfile.rules.map(rule => ({ ...rule, conditions: rule.conditions.map(condition => ({ ...condition })) })),
                };
            }
            this.log(now, 'phase', `${owner.name} bước vào ${phase.name}: ${phase.description}`, owner.id, opponent.id, undefined, {
                phaseId: phase.id,
                phaseName: phase.name,
                hpPct: Number(hpPct.toFixed(2)),
                thresholdPct: phase.hpBelowPct,
            });
            if (phase.onEnterEffects?.length)
                this.resolveEffects(owner, opponent, phase.onEnterEffects, 'Environment', now);
            if (phase.counterWindow) {
                owner.activeCounterWindow = {
                    phaseId: phase.id, id: phase.counterWindow.id, name: phase.counterWindow.name,
                    expiresAt: now + Math.max(0.1, phase.counterWindow.duration), progress: 0, succeeded: false,
                };
                this.log(now, 'counterWindow', `Cửa sổ phản công: ${phase.counterWindow.name} — ${phase.counterWindow.description}`, owner.id, opponent.id, undefined, {
                    counterWindowId: phase.counterWindow.id, counterWindowName: phase.counterWindow.name, duration: phase.counterWindow.duration, opens: true,
                });
                this.schedule({ time: now + Math.max(.1, phase.counterWindow.duration), kind: 'counterWindowExpire', actorId: owner.id, targetId: opponent.id, counterPhaseId: phase.id, counterWindowId: phase.counterWindow.id });
            }
            if (!owner.alive || !opponent.alive)
                return;
            if (phase.interruptCasting && !owner.casting && !owner.channeling) {
                this.schedule({ time: now + 0.05, kind: 'decide', actorId: owner.id, targetId: opponent.id });
            }
        }
    }
    fireTriggers(owner, target, event, sourceTag, now, procCoefficient = 1) {
        for (const trigger of owner.triggers) {
            if (trigger.event !== event)
                continue;
            if (trigger.sourceTags && !trigger.sourceTags.includes(sourceTag))
                continue;
            const runtime = trigger.runtimeV87, runtime88 = trigger.runtimeV88;
            // V87/V88 danger gates and once-per-battle rules share triggerState; a new EntityState resets them naturally.
            if ((runtime?.oncePerBattle || runtime88?.oncePerBattle) && owner.triggerState[trigger.id])
                continue;
            const hpBelow = runtime?.hpBelowPct ?? runtime88?.hpBelowPct;
            if (hpBelow !== undefined) {
                const hpPct = owner.hp / Math.max(1, combatMaxHp(owner.baseStats)) * 100;
                if (hpPct > hpBelow)
                    continue;
            }
            if (runtime88?.spiritBelowPct !== undefined) {
                const spiritPct = owner.spirit / Math.max(1, owner.baseStats.maxSpirit) * 100;
                if (spiritPct > runtime88.spiritBelowPct)
                    continue;
            }
            if (runtime88?.targetHpBelowPct !== undefined) {
                const targetPct = target.hp / Math.max(1, combatMaxHp(target.baseStats)) * 100;
                if (targetPct > runtime88.targetHpBelowPct)
                    continue;
            }
            let artifactCost = 0, artifactBaoQi = 0, artifactBaoQiMax = owner.combatBuildV117?.artifactV88?.baoQiMax ?? 100;
            if (runtime88) {
                const art = owner.combatBuildV117?.artifactV88;
                const sources = Math.max(1, owner.battleDaoStateV2?.artifact?.core?.artifactSources ?? owner.daoStateV118.artifactSources ?? 1);
                const daoReduction = owner.combatBuildV117?.mainDaoId === 'artifact' ? Math.min(.24, .08 * Math.max(0, sources - 1)) : 0;
                artifactCost = Math.max(0, Math.round((runtime88.baoQiCost ?? 0) * (1 - (art?.baoQiCostReductionPct ?? 0) / 100) * (1 - daoReduction)));
                artifactBaoQi = Math.max(0, owner.marks['__artifact_v88_bao_qi'] ?? 0);
                if (artifactBaoQi + 1e-9 < artifactCost)
                    continue;
            }
            const last = owner.triggerState[trigger.id]?.lastTriggeredAt ?? -Infinity;
            if (trigger.cooldown && now - last < trigger.cooldown)
                continue;
            const effectiveChance = trigger.chancePct * Math.max(0, procCoefficient);
            if (effectiveChance <= 0 || !this.rng.chance(effectiveChance))
                continue;
            owner.triggerState[trigger.id] = { lastTriggeredAt: now };
            if (runtime88) {
                const art = owner.combatBuildV117?.artifactV88;
                const gain = Math.max(0, (runtime88.baoQiGain ?? 0) * (1 + (art?.baoQiGainPct ?? 0) / 100));
                artifactBaoQi = Math.min(artifactBaoQiMax, Math.max(0, artifactBaoQi - artifactCost) + gain);
                owner.marks['__artifact_v88_bao_qi'] = artifactBaoQi;
            }
            const message = runtime ? `${runtime.label} · ${runtime.confidantName}: ${runtime.abilityName}.` : runtime88 ? `${runtime88.label} · ${runtime88.itemName}: ${runtime88.abilityName}.` : `${owner.name} kích phát ${trigger.id}.`;
            const data = { event, sourceTag, procCoefficient, effectiveChance };
            if (runtime) {
                data.confidantRuntime = 'confidant.v87';
                data.confidantEvent = runtime.kind;
                data.confidantId = runtime.confidantId;
                data.abilityName = runtime.abilityName;
                data.oncePerBattle = Boolean(runtime.oncePerBattle);
            }
            if (runtime88) {
                data.artifactRuntime = 'artifact.v88';
                data.artifactEvent = runtime88.kind;
                data.artifactId = runtime88.itemId;
                data.abilityName = runtime88.abilityName;
                data.baoQi = artifactBaoQi;
                data.baoQiCost = artifactCost;
                data.baoQiMax = artifactBaoQiMax;
                data.oncePerBattle = Boolean(runtime88.oncePerBattle);
            }
            this.log(now, 'trigger', message, owner.id, target.id, undefined, data);
            this.resolveEffects(owner, target, trigger.effects, 'ProcHit', now);
        }
    }
    kill(target, source, now) {
        if (!target.alive)
            return;
        // All origin anti-death/revive sources share one per-battle charge so they cannot stack into extra lives.
        const antiDeathUsed = (target.marks['__birth_antideath_used'] ?? 0) > 0;
        if (!antiDeathUsed) {
            const maxHp = Math.max(1, combatMaxHp(target.baseStats));
            if (target.tags.includes('ArtifactV88:Relic:ReincarnationMirror')) {
                target.marks['__birth_antideath_used'] = 1;
                target.alive = true;
                target.casting = undefined;
                target.channeling = undefined;
                target.hp = 1;
                target.shields.push({ capacity: maxHp * .12, stability: Infinity, expiresAt: now + 6, sourceSkillId: 'artifact.v88.relic.reincarnation_mirror', source: 'direct' });
                this.log(now, 'trigger', 'CHÍ BẢO · Luân Hồi Kính: Luân Hồi Phản Chiếu — giữ lại 1 HP và dựng hộ thuẫn.', target.id, source.id, undefined, { artifactRuntime: 'artifact.v88', artifactEvent: 'relicRule', artifactId: 'relic.2', abilityName: 'Luân Hồi Phản Chiếu', oncePerBattle: true });
                return;
            }
            const activate = (message, hp, spirit, shieldPct) => {
                target.marks['__birth_antideath_used'] = 1;
                target.alive = true;
                target.casting = undefined;
                target.channeling = undefined;
                target.hp = Math.max(1, Math.min(maxHp, hp));
                if (spirit !== undefined)
                    target.spirit = Math.max(0, Math.min(target.baseStats.maxSpirit, spirit));
                if (shieldPct && shieldPct > 0)
                    target.shields.push({ capacity: maxHp * shieldPct / 100, stability: Infinity, expiresAt: now + 8, sourceSkillId: 'origin.birth_antideath', source: 'direct' });
                this.log(now, 'trigger', message, target.id, source.id, undefined, { originAntiDeath: true });
            };
            if (target.tags.includes('BirthTrait:PrimordialPhoenixNirvana40')) {
                activate(`[Huyết Mạch · Nguyên Phượng] Nguyên Phượng Niết Bàn: hồi sinh với 40% HP + 30% Chân Nguyên.`, maxHp * .40, target.baseStats.maxSpirit * .30, undefined);
                return;
            }
            if (target.tags.includes('BirthTrait:PhoenixNirvana25')) {
                activate(`[Huyết Mạch · Phượng Hoàng] Niết Bàn: tránh tử kiếp và phục hồi 25% HP.`, maxHp * .25, undefined, undefined);
                return;
            }
            if (target.tags.includes('BirthTrait:UndyingBloodLastStand')) {
                activate(`[Huyết Mạch · Vạn Kiếp Bất Diệt] Vạn Kiếp Nan Diệt: khóa sinh mệnh ở 1 HP và nhận hộ thuẫn 20% Max HP.`, 1, undefined, 20);
                return;
            }
            if (target.tags.includes('BirthTrait:ReincarnationBodyLastStand')) {
                activate(`[Thể Chất · Luân Hồi Bất Diệt Thể] Bất Diệt: khóa sinh mệnh ở 1 HP và nhận hộ thuẫn 15% Max HP.`, 1, undefined, 15);
                return;
            }
        }
        target.alive = false;
        target.casting = undefined;
        target.channeling = undefined;
        this.log(now, 'death', `${target.name} bị ${source.name} đánh bại.`, source.id, target.id);
    }
    updateContinuousState(entity, now) {
        const dt = Math.max(0, now - entity.lastContinuousUpdateAt);
        if (dt <= 0)
            return;
        const stats = effectiveStats(entity, this.registry, now);
        // Chân Nguyên recovery is based on Chân Nguyên Chuẩn, never maxSpirit.
        let spiritRegenMultiplier = 1;
        for (const status of this.activeStatusDefinitions(entity, now))
            spiritRegenMultiplier *= status.spiritRegenMultiplier ?? 1;
        const standardSpirit = combatSpiritStandard(stats);
        spiritRegenMultiplier *= techniqueSpiritRegenMultiplierV119(entity, now);
        spiritRegenMultiplier *= 1 + simpleSetParamV12318(entity, 'simple_water_spirit_regen', 'spiritRegenPct') / 100;
        const regenPerSecond = standardSpirit * Math.max(0, stats.spiritRegenStandardPctPerSecond ?? 0) / 100 * Math.max(0, spiritRegenMultiplier);
        if (regenPerSecond > 0 && entity.spirit < entity.baseStats.maxSpirit) {
            entity.spirit = Math.min(entity.baseStats.maxSpirit, entity.spirit + regenPerSecond * dt);
        }
        const drainStatuses = entity.statuses.filter(active => active.expiresAt > now && (this.registry.status(active.id).spiritDrainStandardPctPerSecond ?? 0) > 0);
        if (drainStatuses.length > 0 && entity.spirit > 0) {
            const drainPerSecond = drainStatuses.reduce((sum, active) => sum + standardSpirit * Math.max(0, this.registry.status(active.id).spiritDrainStandardPctPerSecond ?? 0) / 100, 0);
            entity.spirit = Math.max(0, entity.spirit - drainPerSecond * dt);
            if (entity.spirit <= 0) {
                const endingIds = new Set(drainStatuses.filter(active => this.registry.status(active.id).endsWhenSpiritDepleted).map(active => active.id));
                if (endingIds.size > 0)
                    entity.statuses = entity.statuses.filter(active => !endingIds.has(active.id));
            }
        }
        const deferredDebt = entity.pendingSetFlagsV117['techniqueDeferredDamageDebt'] ?? 0;
        if (deferredDebt > 0 && entity.alive) {
            const due = entity.pendingSetFlagsV117['techniqueDeferredDamageDueUntil'] ?? now;
            const previous = Math.max(entity.lastContinuousUpdateAt, now - dt);
            const remainingWindow = Math.max(1e-6, due - previous);
            const paid = now >= due ? deferredDebt : Math.min(deferredDebt, deferredDebt * dt / remainingWindow);
            if (paid > 0) {
                entity.pendingSetFlagsV117['techniqueDeferredDamageDebt'] = Math.max(0, deferredDebt - paid);
                entity.hp = Math.max(0, entity.hp - paid);
                this.log(now, 'damage', `${entity.name} trả ${paid.toFixed(0)} Nợ Thương.`, entity.id, entity.id, undefined, { deferredDebt: entity.pendingSetFlagsV117['techniqueDeferredDamageDebt'] ?? 0 });
                if (entity.hp <= 0) {
                    entity.alive = false;
                    entity.casting = undefined;
                    entity.channeling = undefined;
                    this.log(now, 'death', `${entity.name} bị Nợ Thương phát tác đánh bại.`, entity.id, entity.id);
                }
            }
        }
        const pendingDemonLoss = entity.pendingSetFlagsV117['techniqueDemonHpLossPendingPct'] ?? 0;
        const burstUntil = entity.pendingSetFlagsV117['techniqueSecretBurstUntil'] ?? 0;
        if (pendingDemonLoss > 0 && now >= burstUntil && entity.alive) {
            const loss = Math.min(Math.max(0, entity.hp - 1), entity.hp * pendingDemonLoss / 100);
            entity.hp -= loss;
            delete entity.pendingSetFlagsV117['techniqueDemonHpLossPendingPct'];
            this.log(now, 'resource', `${entity.name} chịu phản phệ Giải Thể, hao ${loss.toFixed(0)} Sinh Mệnh.`, entity.id, entity.id, undefined, { healthLoss: loss });
        }
        // Huyết Tức never turns into shield: it waits at full HP and heals only missing HP over time.
        if (entity.bloodBreath > 0 && entity.hp < combatMaxHp(entity.baseStats)) {
            const ratePct = Math.max(0, stats.bloodBreathAbsorbPctPerSecond ?? COMBAT_RULES.defaultBloodBreathAbsorbPctPerSecond);
            const throughput = combatMaxHp(entity.baseStats) * ratePct / 100 * dt;
            const absorbed = Math.min(entity.bloodBreath, throughput, combatMaxHp(entity.baseStats) - entity.hp);
            entity.bloodBreath -= absorbed;
            entity.hp += absorbed;
            if (absorbed > 0)
                this.log(now, 'heal', `${entity.name} hấp thu ${absorbed.toFixed(0)} Huyết Tức.`, entity.id, entity.id, undefined, { heal: absorbed, bloodBreath: entity.bloodBreath });
        }
        // During the 5-second Thất Thế window, Thế recovers linearly from 0 to 100.
        if (entity.breakRecoveryEndsAt > entity.breakRecoveryStartedAt && now > entity.breakRecoveryStartedAt) {
            if (now >= entity.breakRecoveryEndsAt)
                entity.poise = 100;
            else {
                const progress = (now - entity.breakRecoveryStartedAt) / (entity.breakRecoveryEndsAt - entity.breakRecoveryStartedAt);
                entity.poise = Math.max(entity.poise, Math.min(100, progress * 100));
            }
        }
        entity.lastContinuousUpdateAt = now;
    }
    cleanup(now) {
        for (const entity of this.entities.values()) {
            this.updateContinuousState(entity, now);
            for (const notice of updateElementTimersV117(entity, now))
                this.log(now, 'resource', notice.message, entity.id, entity.id, undefined, notice.data);
            for (const notice of updateBattleDaoTimersV120(entity, now))
                this.log(now, 'resource', notice.message, entity.id, entity.id, undefined, notice.data);
            syncBattleDaoV2Timers(entity, now);
            entity.statuses = entity.statuses.filter(status => status.expiresAt > now);
            entity.shields = entity.shields.filter(shield => shield.expiresAt > now && shield.capacity > 0);
            if (entity.controlChainUntil <= now && now - entity.controlChainLastEndedAt >= COMBAT_RULES.controlChainResetGapSeconds) {
                entity.controlChainSeconds = 0;
            }
        }
    }
    livingCount() {
        return [...this.entities.values()].filter(e => e.alive).length;
    }
    schedule(event) {
        this.queue.push({ ...event, order: ++this.order });
        this.queue.sort((a, b) => a.time - b.time || a.order - b.order);
    }
    log(time, type, message, actorId, targetId, skillId, data) {
        this.logs.push({ time, type, actorId, targetId, skillId, message, data });
    }
}
//# sourceMappingURL=combat.js.map