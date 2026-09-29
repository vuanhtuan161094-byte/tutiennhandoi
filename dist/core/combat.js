import { CombatEngine as CombatEngineBaseM1 } from './combat-m1-base.js';
import { recordDamageOutcomeV2 } from './battle-dao-v2-runtime.js';
import {
    MIND_SEAL_CAP_V2,
    MIND_SEAL_MARK_V2,
    addMindSealV2,
    consumeMindSealV2,
} from './mind-dao-v2-seal-runtime.js';
import { skillRuntimeV117 } from './skill-runtime-v117.js';

function isCanonicalMindSealV2(source, effect, skill) {
    return Boolean(skill)
        && source?.combatBuildV117?.battleDaoV2Enabled === true
        && source?.combatBuildV117?.mainDaoId === 'mind'
        && skillRuntimeV117(skill).daoBinding === 'mind'
        && effect?.mark === MIND_SEAL_MARK_V2;
}

/**
 * M1 Thần Niệm seam wrapper.
 *
 * The V141 engine remains byte-for-byte preserved in combat-m1-base.js. Only
 * the two Thần Ấn effect seams are overridden here so M1 can establish V2
 * ownership without reopening unrelated locked Dao mechanics.
 */
export class CombatEngine extends CombatEngineBaseM1 {
    resolveEffectAddMarkV141(source, target, effect, defaultSourceTag, now, skillId, cooldownDamageBonusPct, runtimeAction, skill, runtimeEffectMultiplier, runtimeBreakMultiplier) {
        if (!isCanonicalMindSealV2(source, effect, skill))
            return super.resolveEffectAddMarkV141(source, target, effect, defaultSourceTag, now, skillId, cooldownDamageBonusPct, runtimeAction, skill, runtimeEffectMultiplier, runtimeBreakMultiplier);

        // Tịch Niệm Quan Tâm earns its +3 through resolved channel progress.
        // The authored root addMark packet is deliberately deferred here;
        // handleChannelTick owns the progressive award in the next M1 slice.
        if (skill.id === 'skill.dao.mind.observe') {
            this.log(now, 'info', `${source.name} bắt đầu Tịch Niệm; Thần Ấn chờ tiến độ Duy Trì.`, source.id, target.id, skillId, {
                mindV2: true,
                mindSealDeferredToChannel: true,
            });
            return;
        }

        const tx = addMindSealV2(source, target, effect.stacks);
        this.log(now, 'mark', `${target.name} nhận ${MIND_SEAL_MARK_V2}: ${tx.after}/${tx.cap}.`, source.id, target.id, skillId, {
            stacks: tx.after,
            mindSealBefore: tx.before,
            mindSealGain: tx.gained,
            mindSealAfter: tx.after,
            mindSealCap: tx.cap,
            mindV2: true,
        });
    }

    resolveEffectConsumeMarkDamageV141(source, target, effect, defaultSourceTag, now, skillId, cooldownDamageBonusPct, runtimeAction, skill, runtimeEffectMultiplier, runtimeBreakMultiplier) {
        if (!isCanonicalMindSealV2(source, effect, skill))
            return super.resolveEffectConsumeMarkDamageV141(source, target, effect, defaultSourceTag, now, skillId, cooldownDamageBonusPct, runtimeAction, skill, runtimeEffectMultiplier, runtimeBreakMultiplier);

        const maxConsume = Math.min(MIND_SEAL_CAP_V2, Math.max(0, Math.floor(Number(effect.maxConsume ?? MIND_SEAL_CAP_V2) || 0)));
        const tx = consumeMindSealV2(source, target, maxConsume);
        const coefficient = Math.max(0, Number(effect.baseCoefficient ?? 0))
            + tx.consumed * Math.max(0, Number(effect.coefficientPerStack ?? 0));
        const breakDamagePct = tx.consumed
            * Math.max(0, Number(effect.breakDamagePctPerStack ?? effect.stabilityDamagePerStack ?? 0));

        this.log(now, 'mark', `${source.name} tiêu hao ${tx.consumed} tầng ${MIND_SEAL_MARK_V2}.`, source.id, target.id, skillId, {
            consumed: tx.consumed,
            mindSealBefore: tx.before,
            mindSealAfter: tx.after,
            mindSealCap: tx.cap,
            mindV2: true,
        });

        const sealV2 = this.elementalContextV133(source, skill, skill.elementalCoefficients, runtimeAction);
        const outcome = this.applyDamage(source, target, {
            sourceTag: effect.sourceTag ?? defaultSourceTag,
            coefficient,
            breakDamagePct,
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
        }, now);
        recordDamageOutcomeV2(runtimeAction, effect.sourceTag ?? defaultSourceTag, outcome);
        if (outcome.hpDamage > 0)
            this.generateBloodBreath(source, outcome.hpDamage, effect.sourceTag ?? defaultSourceTag, now);
    }
}
//# sourceMappingURL=combat.js.map
