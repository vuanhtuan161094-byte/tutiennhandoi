import { adjustedCastTime, effectiveStats } from './stats.js';
import { chooseSkill } from './ai.js';
import { prepareSkillActionRuntimeV117, skillCastTimeMultiplierFromRuntimeV117, skillSpiritCostMultiplierFromRuntimeV117 } from './five-element-combat-v117.js';
import { skillDomainsV117, skillRuntimeV117, skillSlotClassV117 } from './skill-runtime-v117.js';
import { daoCastTimeMultiplierV118, daoSpiritCostMultiplierV118, prepareBattleDaoActionV118 } from './battle-dao-combat-v118.js';
import { skillPracticeProfileFromTierV125 } from './specialization-skill-progression-v125.js';
import { battleDaoSkillGrowthProfileV126 } from './battle-dao-skill-growth-v126.js';
import { skillProgressEffectBonusFromRuntimeV12317, skillSecondaryEffectBonusPctV12317 } from './skill-heart-method-v12317.js';
import { battleDaoV2Enabled, battleDaoV2SpiritCostMultiplier, createRootActionV2, fistV2ActionTuning, prepareFistCoreActionV2, prepareRemainingDaoCoreActionV2, prepareSwordCoreActionV2, swordQiSpendBeforeActionV2, swordV2ActionTuning } from './battle-dao-v2-runtime.js';
import { prepareMindMasteryActionV2 } from './mind-dao-v2-runtime.js';
import { techniqueBloodSacrificeCapPctV119, techniqueBreakLimitExtraPctV119, techniqueBurnBloodEfficiencyV119, techniqueCastMultiplierV119, techniqueCooldownReturnInternalSecondsV119, techniqueCooldownReturnPctV119, techniqueCooldownReturnSpiritCostPctV119, techniqueEquippedMasteryV119, techniqueGuidingReturnInternalSecondsV119, techniqueGuidingReturnRestoreStandardPctV119, techniqueShieldConsumeEffectBonusPctV119, techniqueShieldConsumePctV119, techniqueSpiritCostMultiplierV119 } from './technique-runtime-v119.js';
import { bossDangerMetaV81 } from './boss-gameplay-v2.js';
import { combatMaxHp, combatSpiritStandard, skillTrueEssenceCost } from './combat-rules.js';

// V141: combat action selection/payment/preparation is isolated from the engine shell.
export function handleCombatDecisionV141(actor, target, now) {
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
        const runtimeSpiritMultiplier = Math.max(.60, rawRuntimeSpiritMultiplier);
        let spiritCost = skillTrueEssenceCost(skill, stats, this.activeSpiritCostMultiplier(actor, now) * runtimeSpiritMultiplier);
        let techniquePreEffectBonusPct = 0;
        let techniquePreRecoveryMultiplier = 1;
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
            prepareSwordCoreActionV2(actor, skill, prepared.action, now, target);
            const swordSpent = swordQiSpendBeforeActionV2(actor, skill, target, now);
            if (swordSpent > 0) {
                prepared.action.battleDaoV2.swordQiSpent = swordSpent;
                this.log(now, 'resource', `${actor.name} vận ${skill.name}, tiêu ${swordSpent} Kiếm Khí.`, actor.id, actor.id, skill.id, { swordQiSpent: swordSpent, swordQi: actor.battleDaoStateV2?.sword?.core?.swordQi ?? 0, swordQiCap: actor.battleDaoStateV2?.sword?.core?.swordQiCap ?? 5 });
            }
            const swordTuning = swordV2ActionTuning(actor, skill, target, prepared.action);
            prepared.action.effectBonusPct += swordTuning.extraEffectBonusPct;
            prepared.action.breakBonusPct += swordTuning.extraBreakBonusPct;
            prepared.action.armorPenBonusPct = (prepared.action.armorPenBonusPct ?? 0) + swordTuning.extraArmorPenPct;
            prepared.action.critHeartDamageBonusPct = (prepared.action.critHeartDamageBonusPct ?? 0) + swordTuning.extraCritHeartDamagePct;
            prepared.action.critHeartPowerMultiplier = Math.max(prepared.action.critHeartPowerMultiplier ?? 1, swordTuning.critHeartPowerMultiplier ?? 1);
            prepared.action.castTimeMultiplier *= swordTuning.castMultiplier;
            prepared.action.recoveryMultiplier *= swordTuning.recoveryMultiplier;
            prepareFistCoreActionV2(actor, target, skill, prepared.action, now);
            const fistTuning = fistV2ActionTuning(actor, skill, target, prepared.action);
            prepared.action.effectBonusPct += fistTuning.extraEffectBonusPct;
            prepared.action.breakBonusPct += fistTuning.extraBreakBonusPct;
            prepared.action.armorPenBonusPct = (prepared.action.armorPenBonusPct ?? 0) + fistTuning.extraArmorPenPct;
            prepared.action.critHeartPowerMultiplier = Math.max(prepared.action.critHeartPowerMultiplier ?? 1, fistTuning.critHeartPowerMultiplier ?? 1);
            prepared.action.castTimeMultiplier *= fistTuning.castMultiplier;
            prepared.action.recoveryMultiplier *= fistTuning.recoveryMultiplier;
            prepareRemainingDaoCoreActionV2(actor, target, skill, prepared.action, now);
            prepareMindMasteryActionV2(actor, target, skill, prepared.action, now);
        }
        const spentElement = Object.values(prepared.action.spentResources ?? {}).reduce((sum, value) => sum + Math.max(0, Number(value ?? 0)), 0);
        if (spentElement > 0 && (techniqueEquippedMasteryV119(actor, 'technique.v119.secret.steal_heaven') >= 40 || techniqueEquippedMasteryV119(actor, 'technique.v119.secret.hidden_edge') >= 40))
            actor.pendingSetFlagsV117['techniqueAfterDaoSpendUntil'] = Math.max(actor.pendingSetFlagsV117['techniqueAfterDaoSpendUntil'] ?? 0, now + 4);
        const cooldown = this.cooldownFor(actor, skill, now);
        const swordTuningForCooldown = swordV2ActionTuning(actor, skill, target, prepared.action);
        if (swordTuningForCooldown.cooldownOverride !== undefined)
            cooldown.actualCooldown = Math.max(skill.minimumCooldown ?? 0, swordTuningForCooldown.cooldownOverride);
        const fistTuningForCooldown = fistV2ActionTuning(actor, skill, target, prepared.action);
        if (fistTuningForCooldown.cooldownOverride !== undefined)
            cooldown.actualCooldown = Math.max(skill.minimumCooldown ?? 0, fistTuningForCooldown.cooldownOverride);
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
