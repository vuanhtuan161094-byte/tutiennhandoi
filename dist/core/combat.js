import { CombatEngine as CombatEngineBaseM1 } from './combat-m1-base.js';
import {
    claimDamagingFollowUpV2,
    finishRemainingDaoActionV2,
    recordDamageOutcomeV2,
    v2ResourceProjection,
} from './battle-dao-v2-runtime.js';
import {
    MIND_V2_MARK,
    MIND_V2_MARK_CAP,
    addMindMarksV2,
    captureMindDamagePacketV2,
    captureMindHealPacketV2,
    captureMindShieldPacketV2,
    finishMindRootV2,
    gainMindPassiveStackV2,
    mindMarkCountV2,
    mindObserveProgressV2,
    resolveMindConsumeDamageV2,
    resolveMindInterfereV2,
} from './mind-dao-v2-runtime.js';
import { skillRuntimeV117 } from './skill-runtime-v117.js';
import { effectiveStats } from './stats.js';
import { combatMaxHp } from './combat-rules.js';

const MIND_CONTACT_GENERATORS = new Set([
    'skill.dao.mind.basic',
    'skill.dao.mind.mark',
    'skill.dao.mind.split',
    'skill.dao.mind.chase',
]);

function isMainMindSkillV2(source, skill) {
    return Boolean(skill)
        && source?.combatBuildV117?.battleDaoV2Enabled === true
        && source?.combatBuildV117?.mainDaoId === 'mind'
        && skillRuntimeV117(skill).daoBinding === 'mind';
}

function isCanonicalMindMarkV2(source, effect, skill) {
    return isMainMindSkillV2(source, skill) && effect?.mark === MIND_V2_MARK;
}

/**
 * M1 Thần Niệm seam wrapper.
 *
 * combat-m1-base.js is the frozen V141 engine snapshot. This class overrides
 * only Mind authority seams so Sword/Fist and unrelated combat paths remain
 * byte-for-byte owned by the previous engine implementation.
 */
export class CombatEngine extends CombatEngineBaseM1 {
    damageContextFromEffect(source, effect, defaultSourceTag, skill, skillId, cooldownDamageBonusPct, runtimeAction) {
        const ctx = super.damageContextFromEffect(source, effect, defaultSourceTag, skill, skillId, cooldownDamageBonusPct, runtimeAction);
        captureMindDamagePacketV2(source, skill, runtimeAction, ctx);
        return ctx;
    }

    commitMindInterferenceV2(source, target, skill, runtimeAction, now) {
        if (!isMainMindSkillV2(source, skill) || skill.daoRuntimeV118?.signature !== 'mindInterfere' || !runtimeAction?.battleDaoV2)
            return undefined;
        const v2 = runtimeAction.battleDaoV2;
        if (v2.mindInterfereCommitted)
            return v2.mindInterfereResult;
        v2.mindInterfereCommitted = true;
        const result = resolveMindInterfereV2(source, target, skill, runtimeAction, now);
        v2.mindInterfereResult = { ...result };
        if (result.consumed <= 0) {
            v2.mindInvalidSpend = true;
            this.log(now, 'info', `${source.name} không thể phát ${skill.name}: mục tiêu không có Thần Ấn.`, source.id, target.id, skill.id, {
                mindV2: true,
                invalidMindSpend: true,
                mindMarks: mindMarkCountV2(target),
            });
            return result;
        }
        this.log(now, 'mark', `${source.name} tiêu hao ${result.consumed} tầng ${MIND_V2_MARK}.`, source.id, target.id, skill.id, {
            consumed: result.consumed,
            mindMarks: mindMarkCountV2(target),
            mindV2: true,
        });
        this.applyDaoMindDelay(target, result.targetCastDelaySeconds, now);
        if (result.mentalStaggerSeconds > 0)
            this.applyStatus(source, target, 'status.mind.interference_stagger', result.mentalStaggerSeconds, 1, now, skill.id);
        return result;
    }

    resolveEffectDamageV141(source, target, effect, defaultSourceTag, now, skillId, cooldownDamageBonusPct, runtimeAction, skill, runtimeEffectMultiplier, runtimeBreakMultiplier) {
        const interference = this.commitMindInterferenceV2(source, target, skill, runtimeAction, now);
        if (skill?.daoRuntimeV118?.signature === 'mindInterfere' && isMainMindSkillV2(source, skill) && (interference?.consumed ?? 0) <= 0)
            return;
        return super.resolveEffectDamageV141(source, target, effect, defaultSourceTag, now, skillId, cooldownDamageBonusPct, runtimeAction, skill, runtimeEffectMultiplier, runtimeBreakMultiplier);
    }

    resolveEffectAddMarkV141(source, target, effect, defaultSourceTag, now, skillId, cooldownDamageBonusPct, runtimeAction, skill, runtimeEffectMultiplier, runtimeBreakMultiplier) {
        if (!isCanonicalMindMarkV2(source, effect, skill))
            return super.resolveEffectAddMarkV141(source, target, effect, defaultSourceTag, now, skillId, cooldownDamageBonusPct, runtimeAction, skill, runtimeEffectMultiplier, runtimeBreakMultiplier);

        // Observe earns +3 only from resolved channel progress, never up front.
        if (skill.id === 'skill.dao.mind.observe') {
            this.log(now, 'info', `${source.name} bắt đầu Tịch Niệm; Thần Ấn chờ tiến độ Duy Trì.`, source.id, target.id, skillId, {
                mindV2: true,
                mindSealDeferredToChannel: true,
            });
            return;
        }

        // Contact generators award their mark only after at least one authored
        // direct hit actually lands. Flow is a Deploy and awards on resolution.
        if (MIND_CONTACT_GENERATORS.has(skill.id) && (runtimeAction?.battleDaoV2?.directDamagingHitCount ?? 0) <= 0) {
            this.log(now, 'info', `${source.name} không tạo Thần Ấn vì ${skill.name} không chạm mục tiêu.`, source.id, target.id, skillId, {
                mindV2: true,
                mindMarkSuppressedNoContact: true,
            });
            return;
        }

        const before = mindMarkCountV2(target);
        const gained = addMindMarksV2(source, target, effect.stacks);
        const after = mindMarkCountV2(target);
        this.log(now, 'mark', `${target.name} nhận ${MIND_V2_MARK}: ${after}/${MIND_V2_MARK_CAP}.`, source.id, target.id, skillId, {
            stacks: after,
            mindSealBefore: before,
            mindSealGain: gained,
            mindSealAfter: after,
            mindSealCap: MIND_V2_MARK_CAP,
            mindV2: true,
        });
    }

    resolveEffectConsumeMarkDamageV141(source, target, effect, defaultSourceTag, now, skillId, cooldownDamageBonusPct, runtimeAction, skill, runtimeEffectMultiplier, runtimeBreakMultiplier) {
        if (!isCanonicalMindMarkV2(source, effect, skill))
            return super.resolveEffectConsumeMarkDamageV141(source, target, effect, defaultSourceTag, now, skillId, cooldownDamageBonusPct, runtimeAction, skill, runtimeEffectMultiplier, runtimeBreakMultiplier);

        const tx = resolveMindConsumeDamageV2(source, target, skill, effect, runtimeAction);
        if (!tx)
            return;
        if (skill.id === 'skill.dao.mind.burst' && tx.consumed <= 0) {
            if (runtimeAction?.battleDaoV2)
                runtimeAction.battleDaoV2.mindInvalidSpend = true;
            this.log(now, 'info', `${source.name} không thể phát ${skill.name}: mục tiêu không có Thần Ấn.`, source.id, target.id, skillId, {
                mindV2: true,
                invalidMindSpend: true,
            });
            return;
        }

        this.log(now, 'mark', `${source.name} tiêu hao ${tx.consumed} tầng ${MIND_V2_MARK}.`, source.id, target.id, skillId, {
            consumed: tx.consumed,
            mindSealBefore: tx.before,
            mindSealAfter: tx.after,
            mindSealCap: MIND_V2_MARK_CAP,
            mindV2: true,
        });

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
        };
        captureMindDamagePacketV2(source, skill, runtimeAction, ctx);
        const outcome = this.applyDamage(source, target, ctx, now);
        recordDamageOutcomeV2(runtimeAction, effect.sourceTag ?? defaultSourceTag, outcome);
        if (outcome.hpDamage > 0)
            this.generateBloodBreath(source, outcome.hpDamage, effect.sourceTag ?? defaultSourceTag, now);
    }

    resolveEffectShieldV141(source, target, effect, defaultSourceTag, now, skillId, cooldownDamageBonusPct, runtimeAction, skill, runtimeEffectMultiplier, runtimeBreakMultiplier) {
        captureMindShieldPacketV2(source, skill, runtimeAction, effect, runtimeEffectMultiplier);
        return super.resolveEffectShieldV141(source, target, effect, defaultSourceTag, now, skillId, cooldownDamageBonusPct, runtimeAction, skill, runtimeEffectMultiplier, runtimeBreakMultiplier);
    }

    resolveEffectHealV141(source, target, effect, defaultSourceTag, now, skillId, cooldownDamageBonusPct, runtimeAction, skill, runtimeEffectMultiplier, runtimeBreakMultiplier) {
        captureMindHealPacketV2(source, skill, runtimeAction, effect, runtimeEffectMultiplier);
        return super.resolveEffectHealV141(source, target, effect, defaultSourceTag, now, skillId, cooldownDamageBonusPct, runtimeAction, skill, runtimeEffectMultiplier, runtimeBreakMultiplier);
    }

    handleChannelTick(actor, target, skillId, token, spiritCost, now) {
        const channel = actor.channeling;
        const observe = channel?.token === token && channel.skillId === skillId && skillId === 'skill.dao.mind.observe';
        const beforeTicks = channel?.resolvedHits ?? 0;
        super.handleChannelTick(actor, target, skillId, token, spiritCost, now);
        if (!observe || !channel || (channel.resolvedHits ?? 0) <= beforeTicks)
            return;
        const skill = this.registry.skill(skillId);
        const gained = mindObserveProgressV2(actor, target, skill, channel.runtimeV117, channel.resolvedHits, channel.totalHits);
        if (gained > 0)
            this.log(now, 'mark', `${actor.name} Quan Tâm tích +${gained} ${MIND_V2_MARK} (${mindMarkCountV2(target)}/${MIND_V2_MARK_CAP}).`, actor.id, target.id, skill.id, {
                mindObserveMarkGain: gained,
                mindMarks: mindMarkCountV2(target),
                resolvedTicks: channel.resolvedHits,
                totalTicks: channel.totalHits,
                mindV2: true,
            });
    }

    finishBattleDaoV2Action(actor, target, skill, action, now) {
        if (!isMainMindSkillV2(actor, skill))
            return super.finishBattleDaoV2Action(actor, target, skill, action, now);
        const v2 = action?.battleDaoV2;
        if (!v2)
            return;

        // Preserve Secondary Dao passive observation without invoking the old
        // Main-Mind core branch that derived echo damage from hpDamage.
        const originalMain = actor.combatBuildV117.mainDaoId;
        actor.combatBuildV117.mainDaoId = '__mind_m1_passive_observer__';
        try {
            const secondary = finishRemainingDaoActionV2(actor, target, skill, action, now, pct => this.rng.chance(pct));
            for (const notice of secondary.notices)
                this.log(now, 'resource', notice.message, actor.id, actor.id, skill.id, notice.data);
        }
        finally {
            actor.combatBuildV117.mainDaoId = originalMain;
        }

        if (!v2.mindInvalidSpend) {
            const gainedNiệmLực = gainMindPassiveStackV2(actor, skill, now, pct => this.rng.chance(pct));
            if (gainedNiệmLực > 0)
                this.log(now, 'resource', `${actor.name} tích +${gainedNiệmLực} Niệm Lực.`, actor.id, actor.id, skill.id, {
                    mindPassiveStackGain: gainedNiệmLực,
                    mindPassiveStack: actor.battleDaoStateV2?.mind?.stack?.stacks ?? 0,
                    mindV2: true,
                });
        }

        const mind = finishMindRootV2(actor, target, skill, action, now);
        for (const notice of mind.notices)
            this.log(now, 'resource', notice.message, actor.id, actor.id, skill.id, notice.data);
        if (mind.flowBonusMarkGain > 0)
            this.log(now, 'mark', `${actor.name} Phân Lưu bồi +${mind.flowBonusMarkGain} ${MIND_V2_MARK}.`, actor.id, target.id, skill.id, {
                mindFlowBonusMarkGain: mind.flowBonusMarkGain,
                mindMarks: mindMarkCountV2(target),
                mindV2: true,
            });

        const projection = v2ResourceProjection(actor, now);
        delete projection.mindEchoCounter;
        const flowUntil = actor.battleDaoStateV2?.mind?.core?.flowUntil ?? 0;
        if (flowUntil > now)
            projection.mindFlowUntil = flowUntil;
        if (Object.keys(projection).length > 0)
            this.log(now, 'resource', `${actor.name} cập nhật Bản Đạo V2.`, actor.id, actor.id, skill.id, { v2DaoProjection: true, ...projection });

        if (mind.echo && target.alive) {
            const claim = claimDamagingFollowUpV2(action, { kind: 'intrinsic', id: 'intrinsic.v2.mind.echo' });
            if (!claim) {
                this.log(now, 'resource', `${actor.name} không thể phát Niệm Ảnh vì follow-up budget đã dùng.`, actor.id, target.id, skill.id, {
                    mindEchoSuppressed: true,
                    payloadId: mind.echo.payloadId,
                    mindV2: true,
                });
                return;
            }
            this.schedule({
                time: now + mind.echo.delay,
                kind: 'v2FollowUp',
                actorId: actor.id,
                targetId: target.id,
                skillId: skill.id,
                v2FollowUp: {
                    kind: 'mindSnapshot',
                    sourceSkillId: mind.echo.sourceSkillId,
                    targetId: mind.echo.targetId,
                    label: 'Niệm Ảnh',
                    coefficient: mind.echo.coefficient,
                    payloadId: mind.echo.payloadId,
                    payload: mind.echo.packets,
                    claim,
                },
            });
        }
    }

    handleV2FollowUp(actor, target, follow, now) {
        if (follow?.kind !== 'mindSnapshot')
            return super.handleV2FollowUp(actor, target, follow, now);
        if (!actor.alive || !target.alive || (follow.targetId && follow.targetId !== target.id))
            return;
        const sourceSkill = this.registry.skill(follow.sourceSkillId);
        const echoCoefficient = Math.max(0, Math.min(.70, Number(follow.coefficient ?? 0)));
        let damage = 0;
        let shield = 0;
        let heal = 0;
        for (const packet of follow.payload ?? []) {
            if (!actor.alive || !target.alive)
                break;
            if (packet?.type === 'damage') {
                const outcome = this.applyDamage(actor, target, {
                    sourceTag: 'ProcHit',
                    coefficient: Math.max(0, Number(packet.coefficient ?? 0)) * echoCoefficient,
                    breakDamagePct: Math.max(0, Number(packet.breakDamagePct ?? 0)) * echoCoefficient,
                    canCrit: packet.canCrit !== false,
                    canDodge: packet.canDodge !== false,
                    canHeart: packet.canHeart !== false,
                    unavoidable: false,
                    trueDamage: false,
                    procCoefficient: 0,
                    skillId: follow.sourceSkillId,
                    elementalCoefficients: undefined,
                    primaryElement: undefined,
                    cooldownDamageBonusPct: 0,
                    runtimeEffectBonusPct: 0,
                    runtimeBreakBonusPct: 0,
                    fiveStatScalingV5: sourceSkill?.fiveStatScalingV5,
                    fiveStatBaselineCoefficientV5: sourceSkill?.fiveStatBaselineCoefficientV5,
                }, now);
                damage += outcome.hpDamage;
            }
            else if (packet?.type === 'shield') {
                const before = this.totalShield(actor, now);
                this.applyDirectShield(actor, actor, {
                    type: 'shield',
                    capacity: Math.max(0, Number(packet.capacity ?? 0)) * echoCoefficient,
                    maxHpPct: Math.max(0, Number(packet.maxHpPct ?? 0)) * echoCoefficient,
                    attackCoefficient: Math.max(0, Number(packet.attackCoefficient ?? 0)) * echoCoefficient,
                    stability: Math.max(0, Number(packet.stability ?? 100)),
                    duration: Math.max(0, Number(packet.duration ?? 0)),
                }, now, follow.sourceSkillId);
                shield += Math.max(0, this.totalShield(actor, now) - before);
            }
            else if (packet?.type === 'heal') {
                const healTarget = packet.target === 'target' ? target : actor;
                const srcStats = effectiveStats(actor, this.registry, now);
                const maxHp = combatMaxHp(healTarget.baseStats);
                const amount = (
                    Math.max(0, Number(packet.flat ?? 0))
                    + maxHp * Math.max(0, Number(packet.maxHpPct ?? 0)) / 100
                    + srcStats.attack * Math.max(0, Number(packet.attackCoefficient ?? 0))
                ) * echoCoefficient;
                heal += this.applyHeal(actor, healTarget, amount, now, follow.sourceSkillId);
            }
        }
        this.log(now, 'resource', `${actor.name} phát ${follow.label}.`, actor.id, target.id, follow.sourceSkillId, {
            ...follow.claim,
            damage,
            heal,
            shield,
            v2FollowUp: true,
            mindSnapshot: true,
            payloadId: follow.payloadId ?? '',
            mindV2: true,
        });
    }
}
//# sourceMappingURL=combat.js.map
