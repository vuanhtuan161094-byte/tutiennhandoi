import { CombatEngine as CombatEngineBaseM2B } from './combat-m2b-base.js';
import { claimDamagingFollowUpV2, recordDamageOutcomeV2 } from './battle-dao-v2-runtime.js';
import {
    MIND_V2_MARK,
    MIND_V2_MARK_CAP,
    captureMindDamagePacketV2,
    mindEchoResolvedV2,
    mindGuardShieldBreakV2,
    mindMasteryBasicFollowUpV2,
    mindMasteryEchoBreakBonusPctV2,
    mindMasteryExtraDirectHitsV2,
    mindMasteryShieldMultiplierV2,
    mindMasteryTierV2,
    resolveMindConsumeDamageV2,
    resolveMindUltimateInterferenceV2,
} from './mind-dao-v2-runtime.js';
import { skillRuntimeV117, skillSlotClassV117 } from './skill-runtime-v117.js';

function isMainMindSkillV2(source, skill) {
    return Boolean(skill)
        && source?.combatBuildV117?.battleDaoV2Enabled === true
        && source?.combatBuildV117?.mainDaoId === 'mind'
        && skillRuntimeV117(skill).daoBinding === 'mind';
}

/**
 * M2C Thần Niệm mastery seam.
 *
 * combat-m2b-base.js is the closed M1/M2A/M2B owner. This wrapper adds only
 * authored Mind mastery behavior and one proven M1 Ultimate-control repair.
 */
export class CombatEngine extends CombatEngineBaseM2B {
    damageContextFromEffect(source, effect, defaultSourceTag, skill, skillId, cooldownDamageBonusPct, runtimeAction) {
        const ctx = super.damageContextFromEffect(source, effect, defaultSourceTag, skill, skillId, cooldownDamageBonusPct, runtimeAction);
        const masteryArmorPen = Math.max(0, Number(effect?.mindMasteryArmorPenBonusPct ?? 0));
        if (masteryArmorPen > 0)
            ctx.runtimeArmorPenBonusPct = Math.max(0, Number(ctx.runtimeArmorPenBonusPct ?? 0)) + masteryArmorPen;
        return ctx;
    }

    resolveEffectDamageV141(source, target, effect, defaultSourceTag, now, skillId, cooldownDamageBonusPct, runtimeAction, skill, runtimeEffectMultiplier, runtimeBreakMultiplier) {
        const result = super.resolveEffectDamageV141(source, target, effect, defaultSourceTag, now, skillId, cooldownDamageBonusPct, runtimeAction, skill, runtimeEffectMultiplier, runtimeBreakMultiplier);
        if (!target.alive || !isMainMindSkillV2(source, skill) || defaultSourceTag !== 'ActiveHit' || (runtimeAction?.battleDaoV2?.procDepth ?? 0) !== 0)
            return result;
        for (const packet of mindMasteryExtraDirectHitsV2(source, skill, runtimeAction)) {
            if (!source.alive || !target.alive)
                break;
            const extraEffect = {
                ...effect,
                coefficient: Math.max(0, Number(packet.coefficient ?? 0)),
                breakDamagePct: Math.max(0, Number(packet.breakDamagePct ?? 0)),
                mindMasteryArmorPenBonusPct: Math.max(0, Number(packet.armorPenBonusPct ?? 0)),
            };
            super.resolveEffectDamageV141(source, target, extraEffect, defaultSourceTag, now, skillId, cooldownDamageBonusPct, runtimeAction, skill, runtimeEffectMultiplier, runtimeBreakMultiplier);
        }
        return result;
    }

    resolveEffectConsumeMarkDamageV141(source, target, effect, defaultSourceTag, now, skillId, cooldownDamageBonusPct, runtimeAction, skill, runtimeEffectMultiplier, runtimeBreakMultiplier) {
        if (!isMainMindSkillV2(source, skill) || skill.id !== 'skill.dao.mind.ultimate' || effect?.mark !== MIND_V2_MARK)
            return super.resolveEffectConsumeMarkDamageV141(source, target, effect, defaultSourceTag, now, skillId, cooldownDamageBonusPct, runtimeAction, skill, runtimeEffectMultiplier, runtimeBreakMultiplier);

        const tx = resolveMindConsumeDamageV2(source, target, skill, effect, runtimeAction);
        if (!tx)
            return;
        this.log(now, 'mark', `${source.name} tiêu hao ${tx.consumed} tầng ${MIND_V2_MARK}.`, source.id, target.id, skillId, {
            consumed: tx.consumed,
            mindSealBefore: tx.before,
            mindSealAfter: tx.after,
            mindSealCap: MIND_V2_MARK_CAP,
            mindV2: true,
        });

        const interference = resolveMindUltimateInterferenceV2(source, target, skill, tx, now);
        if (interference.targetCastDelaySeconds > 0)
            this.applyDaoMindDelay(target, interference.targetCastDelaySeconds, now);
        if (interference.mentalPulseSeconds > 0)
            this.applyStatus(source, target, 'status.mind.interference_stagger', interference.mentalPulseSeconds, 1, now, skill.id);

        const sealV2 = this.elementalContextV133(source, skill, skill.elementalCoefficients, runtimeAction);
        const ctx = {
            sourceTag: effect.sourceTag ?? defaultSourceTag,
            coefficient: tx.coefficient,
            breakDamagePct: tx.breakDamagePct,
            canCrit: true,
            canDodge: true,
            canHeart: true,
            unavoidable: skill.unavoidable ?? false,
            trueDamage: false,
            procCoefficient: 1,
            skillId,
            elementalCoefficients: sealV2.elementalCoefficients,
            primaryElement: sealV2.primaryElement,
            cooldownDamageBonusPct,
            runtimeEffectBonusPct: Math.max(0, runtimeAction?.effectBonusPct ?? 0),
            runtimeBreakBonusPct: Math.max(0, runtimeAction?.breakBonusPct ?? 0),
            mindRootActionV2: runtimeAction,
        };
        captureMindDamagePacketV2(source, skill, runtimeAction, ctx);
        const outcome = this.applyDamage(source, target, ctx, now);
        recordDamageOutcomeV2(runtimeAction, effect.sourceTag ?? defaultSourceTag, outcome);
        if (outcome.hpDamage > 0)
            this.generateBloodBreath(source, outcome.hpDamage, effect.sourceTag ?? defaultSourceTag, now);
    }

    resolveEffectShieldV141(source, target, effect, defaultSourceTag, now, skillId, cooldownDamageBonusPct, runtimeAction, skill, runtimeEffectMultiplier, runtimeBreakMultiplier) {
        if (!isMainMindSkillV2(source, skill) || skill.id !== 'skill.dao.mind.guard')
            return super.resolveEffectShieldV141(source, target, effect, defaultSourceTag, now, skillId, cooldownDamageBonusPct, runtimeAction, skill, runtimeEffectMultiplier, runtimeBreakMultiplier);
        const multiplier = mindMasteryShieldMultiplierV2(source, skill);
        const authored = multiplier === 1 ? effect : {
            ...effect,
            capacity: Math.max(0, Number(effect.capacity ?? 0)) * multiplier,
            maxHpPct: Math.max(0, Number(effect.maxHpPct ?? 0)) * multiplier,
            attackCoefficient: Math.max(0, Number(effect.attackCoefficient ?? 0)) * multiplier,
        };
        const before = source.shields.length;
        const result = super.resolveEffectShieldV141(source, target, authored, defaultSourceTag, now, skillId, cooldownDamageBonusPct, runtimeAction, skill, runtimeEffectMultiplier, runtimeBreakMultiplier);
        if (mindMasteryTierV2(source, skill) >= 250) {
            for (const shield of source.shields.slice(before))
                shield.mindGuardMasteryRootEligible = true;
        }
        return result;
    }

    absorbWithShields(source, target, incoming, now, skillId, sourceTag = 'Environment') {
        const candidates = target.shields.filter(shield => shield.mindGuardMasteryRootEligible === true && shield.capacity > 0 && shield.expiresAt > now);
        const absorbed = super.absorbWithShields(source, target, incoming, now, skillId, sourceTag);
        for (const shield of candidates) {
            if (shield.capacity > 0 || shield.mindGuardMasteryRewarded)
                continue;
            shield.mindGuardMasteryRewarded = true;
            const gained = mindGuardShieldBreakV2(target, now);
            if (gained > 0)
                this.log(now, 'resource', `${target.name} hộ thức vỡ, tích +${gained} Niệm Lực.`, target.id, target.id, shield.sourceSkillId, {
                    mindGuardMasteryStackGain: gained,
                    mindPassiveStack: target.battleDaoStateV2?.mind?.stack?.stacks ?? 0,
                    mindV2: true,
                });
        }
        return absorbed;
    }

    handleChannelEnd(actor, target, skillId, token, now) {
        const channel = actor.channeling;
        if (channel?.token === token && channel.skillId === skillId && skillId === 'skill.dao.mind.observe') {
            const skill = this.registry.skill(skillId);
            const complete = (channel.resolvedHits ?? 0) >= (channel.totalHits ?? 0) && (channel.totalHits ?? 0) > 0;
            if (complete && channel.runtimeV117?.battleDaoV2) {
                channel.runtimeV117.battleDaoV2.mindObserveCompleted = true;
                if (mindMasteryTierV2(actor, skill) >= 1000 && !channel.runtimeV117.battleDaoV2.mindObserveExtremeExtraHitIssued) {
                    channel.runtimeV117.battleDaoV2.mindObserveExtremeExtraHitIssued = true;
                    this.resolveEffects(actor, target, skill.channel?.effects ?? [], 'ActiveHit', now, skill.id, channel.cooldownDamageBonusPct, channel.runtimeV117);
                }
            }
        }
        return super.handleChannelEnd(actor, target, skillId, token, now);
    }

    finishBattleDaoV2Action(actor, target, skill, action, now) {
        const beforeFollowUps = Math.max(0, Number(action?.battleDaoV2?.followUpsUsed ?? 0));
        const result = super.finishBattleDaoV2Action(actor, target, skill, action, now);
        if (!isMainMindSkillV2(actor, skill) || !action?.battleDaoV2)
            return result;

        const masteryStackGain = Math.max(0, Number(action.battleDaoV2.mindMasteryStackGainResolved ?? 0));
        if (masteryStackGain > 0)
            this.log(now, 'resource', `${actor.name} nhận thêm +${masteryStackGain} Niệm Lực từ Thuần Thục.`, actor.id, actor.id, skill.id, {
                mindMasteryStackGain: masteryStackGain,
                mindPassiveStack: actor.battleDaoStateV2?.mind?.stack?.stacks ?? 0,
                mindV2: true,
            });

        if (skillSlotClassV117(skill) !== 'basic') {
            const afterFollowUps = Math.max(0, Number(action.battleDaoV2.followUpsUsed ?? 0));
            if (afterFollowUps > beforeFollowUps) {
                const core = actor.battleDaoStateV2?.mind?.core;
                if (core)
                    core.nextEchoBonusPct = 0;
            }
            return result;
        }

        if (!target.alive)
            return result;
        const follow = mindMasteryBasicFollowUpV2(actor, skill, action, pct => this.rng.chance(pct));
        if (!follow)
            return result;
        const claim = claimDamagingFollowUpV2(action, { kind: 'intrinsic', id: 'intrinsic.v2.mind.mastery.basic_needle' });
        if (!claim)
            return result;
        this.schedule({
            time: now + follow.delay,
            kind: 'v2FollowUp',
            actorId: actor.id,
            targetId: target.id,
            skillId: skill.id,
            v2FollowUp: {
                kind: 'mindMasteryBasic',
                sourceSkillId: skill.id,
                targetId: target.id,
                label: 'Niệm Châm bồi',
                coefficient: follow.coefficient,
                breakDamagePct: follow.breakDamagePct,
                gaugeGain: follow.gaugeGain,
                claim,
            },
        });
        return result;
    }

    handleV2FollowUp(actor, target, follow, now) {
        if (follow?.kind === 'mindMasteryBasic') {
            if (!actor.alive || !target.alive || (follow.targetId && follow.targetId !== target.id))
                return;
            const outcome = this.applyDamage(actor, target, {
                sourceTag: 'ProcHit',
                coefficient: Math.max(0, Number(follow.coefficient ?? 0)),
                breakDamagePct: Math.max(0, Number(follow.breakDamagePct ?? 0)),
                canCrit: true,
                canDodge: true,
                canHeart: true,
                unavoidable: false,
                trueDamage: false,
                procCoefficient: 0,
                skillId: follow.sourceSkillId,
                elementalCoefficients: undefined,
                primaryElement: undefined,
                cooldownDamageBonusPct: 0,
                runtimeEffectBonusPct: 0,
                runtimeBreakBonusPct: 0,
            }, now);
            let gaugeGain = 0;
            if (outcome.hit && Math.max(0, Number(follow.gaugeGain ?? 0)) > 0) {
                const before = Math.max(0, Number(actor.ultimateGaugeV117 ?? 0));
                actor.ultimateGaugeV117 = Math.min(100, before + Math.max(0, Number(follow.gaugeGain ?? 0)));
                gaugeGain = actor.ultimateGaugeV117 - before;
            }
            this.log(now, 'resource', `${actor.name} phát ${follow.label}.`, actor.id, target.id, follow.sourceSkillId, {
                ...follow.claim,
                damage: outcome.hpDamage,
                gaugeGain,
                v2FollowUp: true,
                mindMastery: true,
                mindV2: true,
            });
            return;
        }

        if (follow?.kind === 'mindSnapshot') {
            const masteryBreakPct = mindMasteryEchoBreakBonusPctV2(actor, target, follow.sourceSkillId);
            const authored = masteryBreakPct > 0 ? {
                ...follow,
                payload: (follow.payload ?? []).map(packet => packet?.type === 'damage'
                    ? { ...packet, breakDamagePct: Math.max(0, Number(packet.breakDamagePct ?? 0)) * (1 + masteryBreakPct / 100) }
                    : packet),
            } : follow;
            const valid = actor.alive && target.alive && (!follow.targetId || follow.targetId === target.id);
            const result = super.handleV2FollowUp(actor, target, authored, now);
            if (valid)
                mindEchoResolvedV2(actor);
            return result;
        }

        return super.handleV2FollowUp(actor, target, follow, now);
    }
}
