import { skillDomainsV117, skillRuntimeV117, skillSlotClassV117, skillStandardCostPctV117 } from './skill-runtime-v117.js';
import { createArtifactCoreStateV2, createBodyCoreStateV2, createFistCoreStateV2, createFormationCoreStateV2, createMindCoreStateV2, createPoisonCoreStateV2, createSpellCoreStateV2 } from './battle-dao-v2-contract.js';
export const BATTLE_DAO_V2_RUNTIME_SCHEMA = 'battle-dao.runtime.v2';
export const SWORD_V2_PASSIVE_IDS = {
    intent: 'passive.v2.sword.intent',
    nourish: 'passive.v2.sword.nourish',
    endure: 'passive.v2.sword.endure',
    breakTruth: 'passive.v2.sword.break_truth',
    limitless: 'passive.v2.sword.limitless',
    majesty: 'passive.v2.sword.majesty',
    killingHeart: 'passive.v2.sword.killing_heart',
    undyingIntent: 'passive.v2.sword.undying_intent',
};
const clamp = (v, min, max) => Math.max(min, Math.min(max, Number.isFinite(v) ? v : min));
const lv = (entity, id) => clamp(Math.floor(entity.combatBuildV117?.passiveLevelsV125?.[id] ?? 1), 1, 20);
const scale = (level, a, b) => a + (b - a) * ((clamp(level, 1, 20) - 1) / 19);
export function battleDaoV2Enabled(entity) { return entity.combatBuildV117?.battleDaoV2Enabled === true; }
export function v2DaoEligibility(entity, dao) {
    if (entity.combatBuildV117?.mainDaoId === dao)
        return 'main';
    if (entity.combatBuildV117?.secondaryDaoId === dao)
        return 'secondary';
    return undefined;
}
export function canUseDaoActiveV2Runtime(entity, dao) {
    return !dao || entity.combatBuildV117?.mainDaoId === dao;
}
export function canLearnDaoPassiveV2Runtime(entity, dao) {
    return entity.combatBuildV117?.mainDaoId === dao || entity.combatBuildV117?.secondaryDaoId === dao;
}
export function hasLearnedPassiveV2(entity, id) { return Boolean(entity.combatBuildV117?.learnedDaoPassiveIdsV118?.includes(id)); }
function baseIntent(now) { return { id: 'swordIntent', stacks: 0, cap: 20, durationSeconds: 12, expiresAt: now, decayEverySeconds: 1, directActionCounter: 0 }; }
function baseSword(entity, now) {
    const eligible = canLearnDaoPassiveV2Runtime(entity, 'sword');
    const core = entity.combatBuildV117?.mainDaoId === 'sword' ? { swordQi: 0, swordQiCap: 5 } : undefined;
    const intent = eligible && entity.combatBuildV117?.learnedDaoPassiveIdsV118?.includes(SWORD_V2_PASSIVE_IDS.intent) ? baseIntent(now) : undefined;
    if (!core && !intent)
        return undefined;
    return { core, intent, basicActionCounter: 0, swordDamageBuffUntil: 0, swordDamageBuffPct: 0, swordDomainUntil: 0, overflowIntentReadyAt: 0 };
}
function genericStack(entity, dao, now) {
    if (!canLearnDaoPassiveV2Runtime(entity, dao) || !entity.combatBuildV117?.learnedDaoPassiveIdsV118?.includes(`passive.v2.${dao}.p1`))
        return undefined;
    return { id: `${dao}PassiveStack`, stacks: 0, cap: 20, durationSeconds: 12, expiresAt: now, decayEverySeconds: 1, actionCounter: 0 };
}
export function createBattleDaoRuntimeStateV2(entity, now = 0) {
    if (!entity.combatBuildV117?.battleDaoV2Enabled)
        return undefined;
    const main = entity.combatBuildV117.mainDaoId;
    return {
        schema: BATTLE_DAO_V2_RUNTIME_SCHEMA, mainDaoId: main, secondaryDaoId: entity.combatBuildV117.secondaryDaoId, sword: baseSword(entity, now),
        fist: { ...(main === 'fist' ? { core: createFistCoreStateV2() } : {}), ...(genericStack(entity, 'fist', now) ? { stack: genericStack(entity, 'fist', now) } : {}) },
        body: { ...(main === 'body' ? { core: createBodyCoreStateV2() } : {}), ...(genericStack(entity, 'body', now) ? { stack: genericStack(entity, 'body', now) } : {}) },
        spell: { ...(main === 'spell' ? { core: createSpellCoreStateV2() } : {}), ...(genericStack(entity, 'spell', now) ? { stack: genericStack(entity, 'spell', now) } : {}) },
        poison: { ...(main === 'poison' ? { core: createPoisonCoreStateV2() } : {}), ...(genericStack(entity, 'poison', now) ? { stack: genericStack(entity, 'poison', now) } : {}) },
        artifact: { ...(main === 'artifact' ? { core: createArtifactCoreStateV2() } : {}), ...(genericStack(entity, 'artifact', now) ? { stack: genericStack(entity, 'artifact', now) } : {}) },
        formation: { ...(main === 'formation' ? { core: createFormationCoreStateV2() } : {}), ...(genericStack(entity, 'formation', now) ? { stack: genericStack(entity, 'formation', now) } : {}) },
        mind: { ...(main === 'mind' ? { core: createMindCoreStateV2() } : {}), ...(genericStack(entity, 'mind', now) ? { stack: genericStack(entity, 'mind', now) } : {}) },
    };
}
function swordIntentTuning(entity) {
    const has = (id) => hasLearnedPassiveV2(entity, id);
    const p3 = has(SWORD_V2_PASSIVE_IDS.endure) ? lv(entity, SWORD_V2_PASSIVE_IDS.endure) : 0;
    const p5 = has(SWORD_V2_PASSIVE_IDS.limitless) ? lv(entity, SWORD_V2_PASSIVE_IDS.limitless) : 0;
    return {
        cap: 20 + (p5 ? Math.round(scale(p5, 2, 10)) : 0),
        duration: 12 + (p3 ? scale(p3, 2, 8) : 0),
        decayEvery: p3 ? scale(p3, 1, 2) : 1,
    };
}
function genericStackTuning(entity, dao) {
    const p3 = `passive.v2.${dao}.p3`;
    const p5 = `passive.v2.${dao}.p5`;
    const l3 = hasLearnedPassiveV2(entity, p3) ? lv(entity, p3) : 0;
    const l5 = hasLearnedPassiveV2(entity, p5) ? lv(entity, p5) : 0;
    return { cap: 20 + (l5 ? Math.round(scale(l5, 2, 10)) : 0), duration: 12 + (l3 ? scale(l3, 2, 8) : 0), decayEvery: l3 ? scale(l3, 1, 2) : 1 };
}
function syncGenericStack(entity, dao, now) {
    const holder = entity.battleDaoStateV2?.[dao];
    if (!holder)
        return;
    if (!holder.stack && canLearnDaoPassiveV2Runtime(entity, dao) && hasLearnedPassiveV2(entity, `passive.v2.${dao}.p1`))
        holder.stack = genericStack(entity, dao, now);
    const st = holder.stack;
    if (!st)
        return;
    const tune = genericStackTuning(entity, dao);
    st.cap = tune.cap;
    st.durationSeconds = tune.duration;
    st.decayEverySeconds = tune.decayEvery;
    st.stacks = Math.min(st.cap, Math.max(0, st.stacks));
    if (st.stacks <= 0) {
        st.stacks = 0;
        st.nextDecayAt = undefined;
        return;
    }
    if (now < st.expiresAt)
        return;
    let next = st.nextDecayAt ?? (st.expiresAt + st.decayEverySeconds);
    while (st.stacks > 0 && now + 1e-9 >= next) {
        st.stacks--;
        next += st.decayEverySeconds;
    }
    st.nextDecayAt = st.stacks > 0 ? next : undefined;
}
export function syncBattleDaoV2Timers(entity, now) {
    if (!battleDaoV2Enabled(entity))
        return;
    if (!entity.battleDaoStateV2)
        entity.battleDaoStateV2 = createBattleDaoRuntimeStateV2(entity, now);
    const s = entity.battleDaoStateV2?.sword;
    if (s) {
        if (s.swordDomainUntil > 0 && now >= s.swordDomainUntil) {
            s.swordDomainUntil = 0;
            if (s.core) {
                s.core.swordQiCap = 5;
                s.core.swordQi = Math.min(5, s.core.swordQi);
            }
        }
        if (!s.intent && canLearnDaoPassiveV2Runtime(entity, 'sword') && hasLearnedPassiveV2(entity, SWORD_V2_PASSIVE_IDS.intent))
            s.intent = baseIntent(now);
        const intent = s.intent;
        if (intent) {
            const tune = swordIntentTuning(entity);
            intent.cap = tune.cap;
            intent.durationSeconds = tune.duration;
            intent.decayEverySeconds = tune.decayEvery;
            intent.stacks = Math.min(intent.cap, intent.stacks);
            if (intent.stacks <= 0) {
                intent.stacks = 0;
                intent.nextDecayAt = undefined;
            }
            else if (now >= intent.expiresAt) {
                let next = intent.nextDecayAt ?? (intent.expiresAt + intent.decayEverySeconds);
                while (intent.stacks > 0 && now + 1e-9 >= next) {
                    intent.stacks--;
                    next += intent.decayEverySeconds;
                }
                intent.nextDecayAt = intent.stacks > 0 ? next : undefined;
            }
        }
    }
    const fistCore = entity.battleDaoStateV2?.fist?.core;
    if (fistCore) {
        const domainActive = (fistCore.fistDomainUntil ?? 0) > now;
        fistCore.fistForceCap = domainActive ? 7 : 5;
        if (!domainActive && (fistCore.fistDomainUntil ?? 0) > 0)
            fistCore.fistDomainUntil = 0;
        fistCore.fistForce = Math.min(fistCore.fistForceCap, Math.max(0, fistCore.fistForce));
    }
    for (const dao of ['fist', 'body', 'spell', 'poison', 'artifact', 'formation', 'mind'])
        syncGenericStack(entity, dao, now);
}
export function swordIntentBonusesV2(entity, now) {
    const out = { attackPct: 0, critChancePct: 0, heartChancePct: 0, armorPenPct: 0, directDamagePct: 0, critHeartDamagePct: 0, gaugeGainPct: 0 };
    if (!battleDaoV2Enabled(entity) || !canLearnDaoPassiveV2Runtime(entity, 'sword') || !hasLearnedPassiveV2(entity, SWORD_V2_PASSIVE_IDS.intent))
        return out;
    syncBattleDaoV2Timers(entity, now);
    const st = entity.battleDaoStateV2?.sword?.intent;
    if (!st || st.stacks <= 0)
        return out;
    const p1 = lv(entity, SWORD_V2_PASSIVE_IDS.intent);
    out.critChancePct = st.stacks * scale(p1, .20, .40);
    if (st.stacks >= 10)
        out.heartChancePct = scale(p1, 3, 6);
    if (st.stacks >= 20)
        out.armorPenPct = scale(p1, 4, 8);
    if (hasLearnedPassiveV2(entity, SWORD_V2_PASSIVE_IDS.majesty))
        out.directDamagePct += Math.floor(st.stacks / 10) * scale(lv(entity, SWORD_V2_PASSIVE_IDS.majesty), 1, 3);
    return out;
}
function refreshIntent(entity, now) {
    const st = entity.battleDaoStateV2?.sword?.intent;
    if (!st)
        return;
    const tune = swordIntentTuning(entity);
    st.cap = tune.cap;
    st.durationSeconds = tune.duration;
    st.decayEverySeconds = tune.decayEvery;
    st.expiresAt = now + st.durationSeconds;
    st.nextDecayAt = undefined;
}
function addIntent(entity, amount, now) {
    const st = entity.battleDaoStateV2?.sword?.intent;
    if (!st || amount <= 0)
        return 0;
    const before = st.stacks;
    st.stacks = Math.min(st.cap, st.stacks + Math.floor(amount));
    if (st.stacks > before)
        refreshIntent(entity, now);
    return st.stacks - before;
}
export function resolveSwordIntentAfterRootV2(entity, target, skill, action, now, chance) {
    const v2 = action.battleDaoV2;
    const sword = entity.battleDaoStateV2?.sword;
    const st = sword?.intent;
    const core = sword?.core;
    if (!v2 || !st || entity.combatBuildV117?.mainDaoId !== 'sword')
        return { gained: 0, refundedQi: 0, stacks: st?.stacks ?? 0 };
    const spent = Math.max(0, Math.floor(v2.swordQiSpent ?? 0));
    let gained = 0;
    if (spent >= 3)
        gained += addIntent(entity, 2, now);
    else if (spent >= 1)
        gained += addIntent(entity, 1, now);
    if (spent > 0 && hasLearnedPassiveV2(entity, SWORD_V2_PASSIVE_IDS.endure)) {
        refreshIntent(entity, now);
        if (spent >= 3) {
            const hold = scale(lv(entity, SWORD_V2_PASSIVE_IDS.endure), 1, 2.5);
            st.expiresAt += hold;
            st.nextDecayAt = undefined;
        }
    }
    if ((v2.swordQiOverflow ?? 0) > 0 && hasLearnedPassiveV2(entity, SWORD_V2_PASSIVE_IDS.nourish) && (sword.overflowIntentReadyAt ?? 0) <= now) {
        const level = lv(entity, SWORD_V2_PASSIVE_IDS.nourish);
        if (chance(scale(level, 40, 100))) {
            gained += addIntent(entity, 1, now);
            sword.overflowIntentReadyAt = now + scale(level, 8, 6);
        }
    }
    let refundedQi = 0;
    if (core && spent > 0 && core.swordQi < core.swordQiCap) {
        const causedBreak = !v2.targetBrokenBefore && Boolean(target?.breakDebuffUntil && target.breakDebuffUntil > now);
        const breakOrFinisher = skillDomainsV117(skill).some(x => x === 'Break' || x === 'Finisher' || x === 'PháThế');
        if (spent >= 2 && causedBreak && breakOrFinisher && hasLearnedPassiveV2(entity, SWORD_V2_PASSIVE_IDS.breakTruth)) {
            const pct = scale(lv(entity, SWORD_V2_PASSIVE_IDS.breakTruth), 25, 100);
            if (chance(pct))
                refundedQi = 1;
        }
        if (refundedQi <= 0 && spent <= 2 && hasLearnedPassiveV2(entity, SWORD_V2_PASSIVE_IDS.limitless)) {
            const pct = scale(lv(entity, SWORD_V2_PASSIVE_IDS.limitless), 8, 24);
            if (chance(pct))
                refundedQi = 1;
        }
        if (refundedQi > 0)
            core.swordQi = Math.min(core.swordQiCap, core.swordQi + refundedQi);
    }
    return { gained, refundedQi, stacks: st.stacks };
}
export function createRootActionV2(actor, skill, token) {
    const id = `${actor.id}:${skill.id}:${token}`;
    return { rootActionId: id, sourceActionId: id, sourceSkillId: skill.id, sourceTags: ['RootAction'], origin: 'skill', procDepth: 0, followUpBudget: 1, followUpsUsed: 0, generatedActionCounter: 0, damagingHitCount: 0, directDamagingHitCount: 0, heartHitCount: 0, critHitCount: 0, hpDamage: 0 };
}
export function claimDamagingFollowUpV2(action, origin) {
    const v2 = action.battleDaoV2;
    if (!v2 || v2.followUpsUsed >= v2.followUpBudget)
        return undefined;
    v2.followUpsUsed++;
    v2.generatedActionCounter++;
    const sourceActionId = `${v2.rootActionId}:followup:${v2.generatedActionCounter}`;
    return { rootActionId: v2.rootActionId, sourceActionId, sourceSkillId: v2.sourceSkillId, sourceTag: 'ProcHit', origin: origin.kind, ...(origin.kind === 'passive' ? { originPassiveId: origin.id } : { originIntrinsicId: origin.id }), generatedByEventId: v2.sourceActionId, procDepth: v2.procDepth + 1, followUpsUsed: v2.followUpsUsed, followUpBudget: v2.followUpBudget };
}
export function recordDamageOutcomeV2(action, sourceTag, outcome) {
    const v2 = action?.battleDaoV2;
    if (!v2 || !outcome.hit)
        return;
    v2.damagingHitCount++;
    if (sourceTag === 'ActiveHit' || sourceTag === 'Counter')
        v2.directDamagingHitCount++;
    if (outcome.heart)
        v2.heartHitCount++;
    if (outcome.crit)
        v2.critHitCount++;
    v2.hpDamage += Math.max(0, outcome.hpDamage);
}
export function prepareSwordCoreActionV2(entity, skill, action, now, target) {
    if (!battleDaoV2Enabled(entity) || entity.combatBuildV117?.mainDaoId !== 'sword' || skillRuntimeV117(skill).daoBinding !== 'sword')
        return;
    const sword = entity.battleDaoStateV2?.sword;
    if (!sword?.core)
        return;
    const qi = sword.core.swordQi;
    action.battleDaoV2.swordQiBefore = qi;
    action.battleDaoV2.targetBrokenBefore = Boolean(target?.breakDebuffUntil && target.breakDebuffUntil > now);
    const intent = sword.intent;
    action.battleDaoV2.swordIntentAtStart = intent?.stacks ?? 0;
    action.battleDaoV2.swordIntentCapAtStart = intent?.cap ?? 20;
    action.effectBonusPct += qi * 4;
    action.breakBonusPct += qi * 3;
    if (sword.swordDamageBuffUntil > now)
        action.effectBonusPct += sword.swordDamageBuffPct;
}
export function swordQiSpendBeforeActionV2(entity, skill, target, now = 0) {
    if (!battleDaoV2Enabled(entity) || entity.combatBuildV117?.mainDaoId !== 'sword' || skillRuntimeV117(skill).daoBinding !== 'sword')
        return 0;
    const sword = entity.battleDaoStateV2?.sword;
    const core = sword?.core;
    if (!core)
        return 0;
    const tier = entity.combatBuildV117?.skillPracticeTierV125?.[skill.id] ?? 0;
    const qi = core.swordQi;
    let wanted = 0;
    if (skill.id === 'skill.dao.sword.flow_slash' && qi >= 5)
        wanted = 2;
    else if (skill.id === 'skill.dao.sword.break_mark' && qi >= 3)
        wanted = Math.min(3, qi - 2);
    else if (skill.id === 'skill.dao.sword.chain') {
        if (tier >= 1000 && qi >= 5)
            wanted = 2;
        else if (tier >= 500 && qi >= 3)
            wanted = 1;
    }
    else if (skill.id === 'skill.dao.sword.counter' && qi >= 5)
        wanted = 1;
    else if (skill.id === 'skill.dao.sword.sever')
        wanted = tier >= 500 && target?.breakDebuffUntil && target.breakDebuffUntil > now ? 0 : (tier >= 1000 ? 3 : 2);
    else if (skill.id === 'skill.dao.sword.finisher')
        wanted = tier >= 1000 ? Math.min(5, qi) : Math.min(3, qi);
    else if (skill.id === 'skill.dao.sword.myriad' && tier >= 500 && qi >= 4)
        wanted = 2;
    else if (skill.id === 'skill.dao.sword.ultimate')
        wanted = Math.min(qi, 5);
    const spent = Math.min(qi, wanted);
    core.swordQi -= spent;
    return spent;
}
export function swordQiGenerateAfterActionV2(entity, skill, action) {
    if (!battleDaoV2Enabled(entity) || entity.combatBuildV117?.mainDaoId !== 'sword' || skillRuntimeV117(skill).daoBinding !== 'sword')
        return 0;
    const core = entity.battleDaoStateV2?.sword?.core;
    if (!core)
        return 0;
    const tier = entity.combatBuildV117?.skillPracticeTierV125?.[skill.id] ?? 0;
    const spent = action.battleDaoV2?.swordQiSpent ?? 0;
    let gain = 0;
    if (skill.id === 'skill.dao.sword.basic' && action.battleDaoV2?.damagingHitCount)
        gain = 1;
    else if (skill.id === 'skill.dao.sword.flow_slash' && spent <= 0)
        gain = 1 + (tier >= 100 && action.battleDaoV2?.heartHitCount ? 1 : 0);
    else if (skill.id === 'skill.dao.sword.nurture') {
        const before = action.battleDaoV2?.swordQiBefore ?? core.swordQi;
        gain = tier >= 1000 && before <= 1 ? Math.max(0, 5 - core.swordQi) : tier >= 250 ? 3 : 2;
    }
    else if (skill.id === 'skill.dao.sword.break_mark' && spent <= 0)
        gain = 1;
    else if (skill.id === 'skill.dao.sword.chain' && spent <= 0)
        gain = 1;
    else if (skill.id === 'skill.dao.sword.counter' && action.battleDaoV2?.damagingHitCount)
        gain = tier >= 500 ? 2 : 1;
    else if (skill.id === 'skill.dao.sword.myriad' && tier >= 250)
        gain = 3;
    if (skill.id === 'skill.dao.sword.basic' && tier >= 250 && action.battleDaoV2?.damagingHitCount && action.battleDaoV2.damagingHitCount >= 2)
        gain += 1;
    const sword = entity.battleDaoStateV2.sword;
    core.swordQiCap = sword.swordDomainUntil > 0 ? 7 : 5;
    if (sword.swordDomainUntil > 0)
        gain += 1;
    const before = core.swordQi;
    core.swordQi = Math.min(core.swordQiCap, core.swordQi + gain);
    action.battleDaoV2.swordQiOverflow = Math.max(0, before + gain - core.swordQiCap);
    return core.swordQi - before;
}
export function swordV2ActionTuning(entity, skill, target, action) {
    const out = { castMultiplier: 1, recoveryMultiplier: 1, cooldownOverride: undefined, extraEffectBonusPct: 0, extraBreakBonusPct: 0, extraArmorPenPct: 0, extraCritHeartDamagePct: 0, critHeartPowerMultiplier: 1 };
    if (!battleDaoV2Enabled(entity) || entity.combatBuildV117?.mainDaoId !== 'sword' || skillRuntimeV117(skill).daoBinding !== 'sword')
        return out;
    const tier = entity.combatBuildV117?.skillPracticeTierV125?.[skill.id] ?? 0;
    const qi = action?.battleDaoV2?.swordQiBefore ?? entity.battleDaoStateV2?.sword?.core?.swordQi ?? 0;
    if (skill.id === 'skill.dao.sword.nurture') {
        if (tier >= 750)
            out.castMultiplier = 1.1 / 1.5;
        else if (tier >= 100)
            out.castMultiplier = 1.35 / 1.5;
    }
    if (skill.id === 'skill.dao.sword.break_mark' && tier >= 750)
        out.castMultiplier = .6 / .8;
    if (skill.id === 'skill.dao.sword.sever' && tier >= 750)
        out.castMultiplier = .75 / 1;
    if (skill.id === 'skill.dao.sword.flow_slash' && tier >= 750 && qi >= 5)
        out.cooldownOverride = 2.4;
    if (skill.id === 'skill.dao.sword.chain' && tier >= 750)
        out.recoveryMultiplier = .7 / .9;
    if (skill.id === 'skill.dao.sword.counter' && tier >= 750)
        out.recoveryMultiplier = .5 / .7;
    if (skill.id === 'skill.dao.sword.finisher' && tier >= 750)
        out.recoveryMultiplier = .75 / 1;
    if (skill.id === 'skill.dao.sword.ultimate' && tier >= 750)
        out.recoveryMultiplier = 1.1 / 1.4;
    if (skill.id === 'skill.dao.sword.break_mark') {
        if (tier >= 100)
            out.extraBreakBonusPct += 20;
        if (tier >= 250 && !action?.battleDaoV2?.targetBrokenBefore)
            out.extraBreakBonusPct += 15;
    }
    if (skill.id === 'skill.dao.sword.sever' && tier >= 100)
        out.extraBreakBonusPct += 15;
    const spent = Math.max(0, Math.floor(action?.battleDaoV2?.swordQiSpent ?? 0));
    if (skill.id === 'skill.dao.sword.sever' && tier >= 1000 && qi >= 3) {
        out.extraBreakBonusPct += 35;
        out.extraArmorPenPct += 25;
    }
    if (skill.id === 'skill.dao.sword.finisher' && tier >= 250 && action?.battleDaoV2?.targetBrokenBefore)
        out.extraEffectBonusPct += 20;
    if (skill.id === 'skill.dao.sword.finisher' && tier >= 500 && spent >= 3)
        out.extraArmorPenPct += 15;
    if (skill.id === 'skill.dao.sword.finisher' && tier >= 1000 && spent >= 5)
        out.critHeartPowerMultiplier = 1.5;
    if (skill.id === 'skill.dao.sword.myriad' && tier >= 1000 && qi >= 4)
        out.extraBreakBonusPct += 20;
    const intent = entity.battleDaoStateV2?.sword?.intent;
    const intentStacks = intent?.stacks ?? 0;
    const atIntentCap = (action?.battleDaoV2?.swordIntentAtStart ?? 0) >= (action?.battleDaoV2?.swordIntentCapAtStart ?? Number.POSITIVE_INFINITY);
    const domains = skillDomainsV117(skill);
    const breakOrFinisher = domains.some(x => x === 'Break' || x === 'Finisher' || x === 'PháThế');
    if (spent > 0 && breakOrFinisher && hasLearnedPassiveV2(entity, SWORD_V2_PASSIVE_IDS.breakTruth)) {
        const level = lv(entity, SWORD_V2_PASSIVE_IDS.breakTruth);
        out.extraBreakBonusPct += spent * scale(level, 2, 4);
        out.extraArmorPenPct += spent * scale(level, .5, 1.25);
    }
    if (spent >= 3 && intentStacks >= 20 && action?.battleDaoV2?.targetBrokenBefore && hasLearnedPassiveV2(entity, SWORD_V2_PASSIVE_IDS.killingHeart)) {
        const level = lv(entity, SWORD_V2_PASSIVE_IDS.killingHeart);
        out.extraEffectBonusPct += scale(level, 8, 15);
        out.extraCritHeartDamagePct += scale(level, 10, 20);
    }
    if (spent >= 3 && hasLearnedPassiveV2(entity, SWORD_V2_PASSIVE_IDS.majesty))
        out.extraEffectBonusPct += scale(lv(entity, SWORD_V2_PASSIVE_IDS.majesty), 2, 5);
    if (atIntentCap && spent >= 2 && breakOrFinisher && hasLearnedPassiveV2(entity, SWORD_V2_PASSIVE_IDS.undyingIntent)) {
        const level = lv(entity, SWORD_V2_PASSIVE_IDS.undyingIntent);
        out.extraEffectBonusPct += scale(level, 5, 10);
        out.extraBreakBonusPct += scale(level, 4, 8);
    }
    return out;
}
export function swordV2CapstoneFollowUp(entity, skill, action) {
    if (!battleDaoV2Enabled(entity) || entity.combatBuildV117?.mainDaoId !== 'sword' || !hasLearnedPassiveV2(entity, SWORD_V2_PASSIVE_IDS.undyingIntent))
        return undefined;
    const v2 = action?.battleDaoV2;
    const spent = Math.max(0, Math.floor(v2?.swordQiSpent ?? 0));
    const atCap = (v2?.swordIntentAtStart ?? 0) >= (v2?.swordIntentCapAtStart ?? Number.POSITIVE_INFINITY);
    if (!atCap || spent <= 0)
        return undefined;
    const level = lv(entity, SWORD_V2_PASSIVE_IDS.undyingIntent);
    if (['skill.dao.sword.flow_slash', 'skill.dao.sword.chain', 'skill.dao.sword.counter'].includes(skill.id) && spent <= 2)
        return { id: 'passive.v2.sword.undying_intent.fast', coefficient: scale(level, .20, .30), breakDamagePct: 0, label: 'Ý Hóa Kiếm' };
    if (skill.id === 'skill.dao.sword.myriad')
        return { id: 'passive.v2.sword.undying_intent.myriad', coefficient: .62 * scale(level, .40, .70), breakDamagePct: 4, label: 'Vạn Kiếm · Ý Hóa' };
    return undefined;
}
function cloneDamage(effect, coefficient, breakPct) { return { ...effect, coefficient, ...(breakPct !== undefined ? { breakDamagePct: breakPct } : {}) }; }
export function swordV2EffectsForSkill(entity, skill, action, chance) {
    if (!battleDaoV2Enabled(entity) || entity.combatBuildV117?.mainDaoId !== 'sword' || skillRuntimeV117(skill).daoBinding !== 'sword')
        return skill.effects;
    const tier = entity.combatBuildV117?.skillPracticeTierV125?.[skill.id] ?? 0;
    const qi = action?.battleDaoV2?.swordQiBefore ?? entity.battleDaoStateV2?.sword?.core?.swordQi ?? 0;
    const damage = skill.effects.filter((e) => e.type === 'damage');
    const other = skill.effects.filter((e) => e.type !== 'damage');
    const d0 = damage[0];
    if (!d0)
        return skill.effects;
    if (skill.id === 'skill.dao.sword.basic') {
        const base = cloneDamage(d0, 1.0);
        let extra = [];
        const sword = entity.battleDaoStateV2.sword;
        sword.basicActionCounter++;
        if (tier >= 1000 && sword.basicActionCounter % 3 === 0)
            extra = [cloneDamage(d0, .75)];
        else if (tier >= 500 && qi >= 5)
            extra = [cloneDamage(d0, .65)];
        else if (tier >= 100 && (chance?.(15) ?? false))
            extra = [cloneDamage(d0, .55)];
        return [base, ...extra, ...other];
    }
    if (skill.id === 'skill.dao.sword.flow_slash') {
        const arr = [cloneDamage(d0, 1.55)];
        if (tier >= 1000)
            arr.push(cloneDamage(d0, .90));
        else if (tier >= 250 && qi >= 3)
            arr.push(cloneDamage(d0, tier >= 500 ? .60 : .35));
        return [...arr, ...other];
    }
    if (skill.id === 'skill.dao.sword.nurture')
        return [cloneDamage(d0, .45), ...other];
    if (skill.id === 'skill.dao.sword.break_mark')
        return [cloneDamage(d0, 1.35, d0.breakDamagePct ?? d0.stabilityDamage ?? 22), ...other];
    if (skill.id === 'skill.dao.sword.chain') {
        const count = tier >= 1000 && qi >= 5 ? 5 : tier >= 500 && qi >= 3 ? 4 : 3;
        const arr = [];
        for (let i = 0; i < count; i++) {
            let c = .72;
            if (i === 2 && tier >= 100)
                c *= 1.2;
            if (count === 5 && i === 4)
                c += 1.0;
            else if (count === 4 && i === 3)
                c = .60;
            arr.push(cloneDamage(d0, c));
        }
        return [...arr, ...other];
    }
    if (skill.id === 'skill.dao.sword.counter')
        return [cloneDamage(d0, 1.8 * (tier >= 100 ? 1.2 : 1)), ...other];
    if (skill.id === 'skill.dao.sword.sever') {
        let c = 2.2;
        const spent = 0;
        void spent;
        if (tier >= 250 && qi >= 2)
            c *= 1.2;
        if (tier >= 1000 && qi >= 3)
            c *= 1.4;
        return [cloneDamage(d0, c, d0.breakDamagePct ?? d0.stabilityDamage ?? 42), ...other];
    }
    if (skill.id === 'skill.dao.sword.finisher') {
        let c = 2.45;
        const spend = Math.min(qi, tier >= 1000 ? 5 : 3);
        if (tier >= 100)
            c *= 1 + spend * .05;
        return [cloneDamage(d0, c), ...other];
    }
    if (skill.id === 'skill.dao.sword.ultimate') {
        let c = tier >= 100 ? 7.2 : 6.8;
        const spend = Math.min(qi, 5);
        if (tier >= 250)
            c += spend * .15;
        const arr = [cloneDamage(d0, c, d0.breakDamagePct ?? d0.stabilityDamage ?? 70)];
        if (tier >= 500 && qi >= 5)
            arr.push(cloneDamage(d0, 1.8, 0));
        return [...arr, ...other];
    }
    return skill.effects;
}
export function swordV2ChannelProfile(entity, skill, action) {
    const out = { durationMultiplier: 1, hitCountOverride: undefined, lastHitMultiplier: 1 };
    if (!battleDaoV2Enabled(entity) || entity.combatBuildV117?.mainDaoId !== 'sword' || skill.id !== 'skill.dao.sword.myriad')
        return out;
    const tier = entity.combatBuildV117?.skillPracticeTierV125?.[skill.id] ?? 0;
    const qi = action?.battleDaoV2?.swordQiBefore ?? entity.battleDaoStateV2?.sword?.core?.swordQi ?? 0;
    if (tier >= 750)
        out.durationMultiplier = 2.6 / 3;
    if (tier >= 1000 && qi >= 4)
        out.hitCountOverride = 14;
    else if (tier >= 500 && qi >= 4)
        out.hitCountOverride = 8;
    if (tier >= 100)
        out.lastHitMultiplier = 1.5;
    return out;
}
const FIST_V2_PAYOFF_SKILLS = new Set([
    'skill.dao.fist.heavy',
    'skill.dao.fist.pressure',
    'skill.dao.fist.finisher',
    'skill.dao.fist.ultimate',
]);
export function prepareFistCoreActionV2(entity, target, skill, action, now = 0) {
    if (!battleDaoV2Enabled(entity) || entity.combatBuildV117?.mainDaoId !== 'fist' || skillRuntimeV117(skill).daoBinding !== 'fist')
        return 0;
    syncBattleDaoV2Timers(entity, now);
    const core = holderV2(entity, 'fist')?.core;
    const v2 = action?.battleDaoV2;
    if (!core || !v2)
        return 0;
    const tier = entity.combatBuildV117?.skillPracticeTierV125?.[skill.id] ?? 0;
    const before = Math.max(0, Math.floor(core.fistForce));
    v2.fistForceBefore = before;
    v2.fistForceCapAtStart = core.fistForceCap;
    v2.fistDomainActiveAtStart = (core.fistDomainUntil ?? 0) > now;
    v2.targetBrokenBefore = Boolean(target?.breakDebuffUntil && target.breakDebuffUntil > now);
    v2.targetCastingBefore = Boolean(target?.casting || target?.channeling);
    action.effectBonusPct += before * 3;
    action.breakBonusPct += before * 4;
    if ((core.fistDamageBuffUntil ?? 0) > now)
        action.effectBonusPct += Math.max(0, core.fistDamageBuffPct ?? 0);
    const heavyPayoff = FIST_V2_PAYOFF_SKILLS.has(skill.id) && before >= 5;
    if (heavyPayoff) {
        action.effectBonusPct += 35;
        action.breakBonusPct += 35;
        v2.fistHeavyPayoff = true;
    }
    let wanted = 0;
    if (skill.id === 'skill.dao.fist.heavy')
        wanted = before >= 5 ? 3 : 2;
    else if (skill.id === 'skill.dao.fist.shock' && tier >= 1000 && before >= 5)
        wanted = 2;
    else if (skill.id === 'skill.dao.fist.pressure' && before >= 5)
        wanted = tier >= 1000 ? 2 : 3;
    else if (skill.id === 'skill.dao.fist.finisher')
        wanted = Math.min(before, v2.fistDomainActiveAtStart ? 7 : 5);
    else if (skill.id === 'skill.dao.fist.ultimate')
        wanted = before;
    wanted = Math.max(0, Math.min(before, Math.floor(wanted)));
    if (wanted > 0) {
        core.fistForce = Math.max(0, before - wanted);
        v2.fistForceSpent = wanted;
    }
    return wanted;
}
export function fistV2ActionTuning(entity, skill, target, action) {
    const out = { castMultiplier: 1, recoveryMultiplier: 1, cooldownOverride: undefined, extraEffectBonusPct: 0, extraBreakBonusPct: 0, extraArmorPenPct: 0, critHeartPowerMultiplier: 1 };
    if (!battleDaoV2Enabled(entity) || entity.combatBuildV117?.mainDaoId !== 'fist' || skillRuntimeV117(skill).daoBinding !== 'fist')
        return out;
    const tier = entity.combatBuildV117?.skillPracticeTierV125?.[skill.id] ?? 0;
    const before = Math.max(0, Math.floor(action?.battleDaoV2?.fistForceBefore ?? entity.battleDaoStateV2?.fist?.core?.fistForce ?? 0));
    const spent = Math.max(0, Math.floor(action?.battleDaoV2?.fistForceSpent ?? 0));
    if (skill.id === 'skill.dao.fist.nurture') {
        if (tier >= 750)
            out.castMultiplier = 1.05 / 1.5;
        else if (tier >= 100)
            out.castMultiplier = 1.30 / 1.5;
    }
    if (skill.id === 'skill.dao.fist.triple' && tier >= 750 && before >= 5)
        out.cooldownOverride = 2.4;
    if (skill.id === 'skill.dao.fist.shock') {
        if (tier >= 750)
            out.recoveryMultiplier = .65 / .8;
        if (tier >= 100)
            out.extraBreakBonusPct += 20;
        if (tier >= 250 && !action?.battleDaoV2?.targetBrokenBefore)
            out.extraBreakBonusPct += 15;
    }
    if (skill.id === 'skill.dao.fist.heavy') {
        if (tier >= 750)
            out.castMultiplier = .75 / 1;
        if (tier >= 250 && spent >= 2)
            out.extraBreakBonusPct += 20;
    }
    if (skill.id === 'skill.dao.fist.counter' && tier >= 750)
        out.recoveryMultiplier = .50 / .7;
    if (skill.id === 'skill.dao.fist.chain_heavy' && tier >= 750)
        out.recoveryMultiplier = .70 / .9;
    if (skill.id === 'skill.dao.fist.pressure') {
        if (tier >= 750)
            out.castMultiplier = .70 / .9;
        if (tier >= 100)
            out.extraBreakBonusPct += 15;
        if (tier >= 250 && action?.battleDaoV2?.targetBrokenBefore)
            out.extraEffectBonusPct += 15;
    }
    if (skill.id === 'skill.dao.fist.finisher') {
        if (tier >= 750)
            out.recoveryMultiplier = .80 / 1.05;
        if (tier >= 250 && action?.battleDaoV2?.targetBrokenBefore)
            out.extraEffectBonusPct += 20;
        if (tier >= 500 && spent >= 4)
            out.extraArmorPenPct += 15;
        if (tier >= 1000 && spent >= 5)
            out.critHeartPowerMultiplier = 1.5;
    }
    if (skill.id === 'skill.dao.fist.ultimate' && tier >= 750)
        out.recoveryMultiplier = 1.10 / 1.4;
    return out;
}
export function fistV2EffectsForSkill(entity, skill, action, chance, baseEffects = skill.effects) {
    if (!battleDaoV2Enabled(entity) || entity.combatBuildV117?.mainDaoId !== 'fist' || skillRuntimeV117(skill).daoBinding !== 'fist')
        return baseEffects;
    const tier = entity.combatBuildV117?.skillPracticeTierV125?.[skill.id] ?? 0;
    const before = Math.max(0, Math.floor(action?.battleDaoV2?.fistForceBefore ?? entity.battleDaoStateV2?.fist?.core?.fistForce ?? 0));
    const spent = Math.max(0, Math.floor(action?.battleDaoV2?.fistForceSpent ?? 0));
    const damage = baseEffects.filter(e => e.type === 'damage');
    const other = baseEffects.filter(e => e.type !== 'damage');
    const d0 = damage[0];
    if (!d0)
        return baseEffects;
    const baseBreak = d0.breakDamagePct ?? d0.stabilityDamage ?? 0;
    if (skill.id === 'skill.dao.fist.basic') {
        const core = entity.battleDaoStateV2?.fist?.core;
        if (core)
            core.basicActionCounter = (core.basicActionCounter ?? 0) + 1;
        const third = Boolean(core && core.basicActionCounter % 3 === 0);
        const arr = [cloneDamage(d0, 1.0)];
        if (tier >= 1000 && third) {
            arr.push(cloneDamage(d0, .65), cloneDamage(d0, .65));
            action.battleDaoV2.fistBasicFollowUp = true;
        }
        else if (tier >= 500 && before >= 5 && third) {
            arr.push(cloneDamage(d0, .65));
            action.battleDaoV2.fistBasicFollowUp = true;
        }
        else if (tier >= 100 && (chance?.(20) ?? false)) {
            arr.push(cloneDamage(d0, .55));
            action.battleDaoV2.fistBasicFollowUp = true;
        }
        return [...arr, ...other];
    }
    if (skill.id === 'skill.dao.fist.triple') {
        if (tier >= 1000)
            return [cloneDamage(d0, .55), cloneDamage(d0, .55), cloneDamage(d0, .55), cloneDamage(d0, 1.25, baseBreak * 1.25), ...other];
        const arr = [cloneDamage(d0, .55), cloneDamage(d0, .55), cloneDamage(d0, tier >= 100 ? .55 * 1.2 : .55)];
        if (tier >= 250 && before >= 3)
            arr.push(cloneDamage(d0, tier >= 500 ? .70 : .40));
        return [...arr, ...other];
    }
    if (skill.id === 'skill.dao.fist.shock') {
        const extreme = tier >= 1000 && before >= 5 && spent >= 2;
        return [cloneDamage(d0, 1.65 * (extreme ? 1.4 : 1), baseBreak * (extreme ? 1.4 : 1)), ...other];
    }
    if (skill.id === 'skill.dao.fist.nurture')
        return [cloneDamage(d0, .35), ...other];
    if (skill.id === 'skill.dao.fist.heavy') {
        if (tier >= 1000)
            return [cloneDamage(d0, 2.65, baseBreak), cloneDamage(d0, 1.30, baseBreak * 1.35), ...other];
        const arr = [cloneDamage(d0, 2.65 * (tier >= 100 ? 1.15 : 1), baseBreak)];
        if (tier >= 500 && before >= 5 && spent >= 3)
            arr.push(cloneDamage(d0, .80));
        return [...arr, ...other];
    }
    if (skill.id === 'skill.dao.fist.counter') {
        const counterSucceeded = Boolean(action?.battleDaoV2?.targetCastingBefore);
        return [cloneDamage(d0, 1.75 * (tier >= 100 && counterSucceeded ? 1.2 : 1), baseBreak), ...other];
    }
    if (skill.id === 'skill.dao.fist.chain_heavy') {
        if (tier >= 1000)
            return [cloneDamage(d0, .85), cloneDamage(d0, .85), cloneDamage(d0, .85), cloneDamage(d0, .85), cloneDamage(d0, 1.25, baseBreak), ...other];
        const arr = [cloneDamage(d0, .85), cloneDamage(d0, .85), cloneDamage(d0, tier >= 100 ? .85 * 1.2 : .85, tier >= 250 && before >= 3 ? baseBreak * 1.2 : baseBreak)];
        if (tier >= 500 && before >= 5)
            arr.push(cloneDamage(d0, .75));
        return [...arr, ...other];
    }
    if (skill.id === 'skill.dao.fist.pressure') {
        const extreme = tier >= 1000 && before >= 5 && spent >= 2;
        return [cloneDamage(d0, 2.15, baseBreak * (extreme ? 1.5 : 1)), ...other];
    }
    if (skill.id === 'skill.dao.fist.finisher') {
        const c = 2.6 * (tier >= 100 ? (1 + spent * .05) : 1);
        return [cloneDamage(d0, c, baseBreak), ...other];
    }
    if (skill.id === 'skill.dao.fist.ultimate') {
        let c = tier >= 100 ? 7.0 : 6.4;
        if (tier >= 250)
            c += before * .12;
        const arr = [cloneDamage(d0, c, baseBreak)];
        if (tier >= 500 && before >= 5)
            arr.push(cloneDamage(d0, 1.60));
        return [...arr, ...other];
    }
    return baseEffects;
}
export function finishFistCoreActionV2(entity, skill, action, now = 0) {
    if (!battleDaoV2Enabled(entity) || entity.combatBuildV117?.mainDaoId !== 'fist' || skillRuntimeV117(skill).daoBinding !== 'fist')
        return { generated: 0, openedDomain: false };
    syncBattleDaoV2Timers(entity, now);
    const core = holderV2(entity, 'fist')?.core;
    const v2 = action?.battleDaoV2;
    if (!core || !v2)
        return { generated: 0, openedDomain: false };
    const tier = entity.combatBuildV117?.skillPracticeTierV125?.[skill.id] ?? 0;
    const landed = (v2.directDamagingHitCount ?? 0) > 0;
    const beforeGain = core.fistForce;
    let gain = 0;
    if (skill.id === 'skill.dao.fist.basic' && landed)
        gain = 1 + (tier >= 250 && v2.fistBasicFollowUp ? 1 : 0);
    else if (skill.id === 'skill.dao.fist.triple' && landed)
        gain = 1;
    else if (skill.id === 'skill.dao.fist.shock' && landed)
        gain = 1;
    else if (skill.id === 'skill.dao.fist.nurture') {
        const start = Math.max(0, Math.floor(v2.fistForceBefore ?? 0));
        if (tier >= 1000 && start <= 1)
            gain = Math.max(0, core.fistForceCap - core.fistForce);
        else
            gain = tier >= 250 ? 3 : 2;
    }
    else if (skill.id === 'skill.dao.fist.counter' && landed) {
        const counterSucceeded = Boolean(v2.targetCastingBefore);
        v2.fistCounterSucceeded = counterSucceeded;
        if (counterSucceeded)
            gain = tier >= 500 ? 3 : 2;
    }
    else if (skill.id === 'skill.dao.fist.chain_heavy' && landed)
        gain = 1;
    else if (skill.id === 'skill.dao.fist.pressure' && landed && (v2.fistForceSpent ?? 0) <= 0)
        gain = 1;
    const domainBonus = v2.fistDomainActiveAtStart && (landed || skill.id === 'skill.dao.fist.nurture') ? 1 : 0;
    const totalGain = gain + domainBonus;
    if (totalGain > 0)
        core.fistForce = Math.min(core.fistForceCap, core.fistForce + totalGain);
    if (skill.id === 'skill.dao.fist.chain_heavy' && tier >= 1000 && landed)
        core.fistForce = Math.max(2, core.fistForce);
    let openedDomain = false;
    if (skill.id === 'skill.dao.fist.ultimate' && tier >= 1000) {
        core.fistDomainUntil = Math.max(core.fistDomainUntil ?? 0, now + 4);
        core.fistForceCap = 7;
        openedDomain = true;
    }
    return { generated: Math.max(0, core.fistForce - beforeGain), requestedGain: totalGain, openedDomain, fistForce: core.fistForce, fistForceCap: core.fistForceCap, fistDomainUntil: core.fistDomainUntil ?? 0 };
}

export function swordV2GaugeMultiplier(entity, now) { return 1 + swordIntentBonusesV2(entity, now).gaugeGainPct / 100; }
export function swordV2DirectDamageMultiplier(entity, now) { return 1 + swordIntentBonusesV2(entity, now).directDamagePct / 100; }
export function swordV2CritHeartBonusPct(entity, now) { return swordIntentBonusesV2(entity, now).critHeartDamagePct; }
export function captureBattleDaoV2Carry(entity, now) {
    if (!battleDaoV2Enabled(entity) || !entity.battleDaoStateV2?.sword)
        return undefined;
    syncBattleDaoV2Timers(entity, now);
    const s = entity.battleDaoStateV2.sword;
    const intent = s.intent;
    return { schema: 'battle-dao.carry.v2', ...(s.core ? { swordQi: s.core.swordQi } : {}), ...(intent && intent.stacks > 0 ? { swordIntent: { stacks: intent.stacks, directActionCounter: intent.directActionCounter, remainingHoldSeconds: Math.max(0, intent.expiresAt - now), decayEverySeconds: intent.decayEverySeconds, ...(intent.nextDecayAt !== undefined ? { nextDecayInSeconds: Math.max(0, intent.nextDecayAt - now) } : {}) } } : {}) };
}
export function restoreBattleDaoV2Carry(entity, carry, now = 0) {
    if (!carry || !battleDaoV2Enabled(entity))
        return;
    syncBattleDaoV2Timers(entity, now);
    const s = entity.battleDaoStateV2?.sword;
    if (!s)
        return;
    if (s.core && carry.swordQi !== undefined)
        s.core.swordQi = clamp(carry.swordQi, 0, s.core.swordQiCap);
    if (s.intent && carry.swordIntent) {
        s.intent.stacks = clamp(Math.floor(carry.swordIntent.stacks), 0, s.intent.cap);
        s.intent.directActionCounter = Math.max(0, Math.floor(carry.swordIntent.directActionCounter));
        s.intent.expiresAt = now + Math.max(0, carry.swordIntent.remainingHoldSeconds);
        s.intent.decayEverySeconds = Math.max(.1, carry.swordIntent.decayEverySeconds);
        s.intent.nextDecayAt = carry.swordIntent.nextDecayInSeconds !== undefined ? now + Math.max(0, carry.swordIntent.nextDecayInSeconds) : undefined;
    }
}
/** Rebase V2 battle state from a finished fight to t=0 of the next Hunt monster.
 * Kill does not reset passive stacks; only remaining duration is carried.
 */
export function carryBattleDaoV2StateToNextMonsterV2(state, battleEndedAt) {
    if (!state)
        return undefined;
    const out = structuredClone(state);
    const sword = out.sword;
    if (sword) {
        if (sword.swordDomainUntil > 0) {
            const remaining = Math.max(0, sword.swordDomainUntil - battleEndedAt);
            sword.swordDomainUntil = remaining;
            if (remaining <= 0 && sword.core) {
                sword.core.swordQiCap = 5;
                sword.core.swordQi = Math.min(5, sword.core.swordQi);
            }
        }
        const intent = sword.intent;
        if (intent) {
            const hold = Math.max(0, intent.expiresAt - battleEndedAt);
            intent.expiresAt = hold;
            if (intent.nextDecayAt !== undefined)
                intent.nextDecayAt = Math.max(0, intent.nextDecayAt - battleEndedAt);
            if (intent.stacks <= 0) {
                intent.stacks = 0;
                intent.nextDecayAt = undefined;
            }
        }
    }
    for (const dao of ['fist', 'body', 'spell', 'poison', 'artifact', 'formation', 'mind']) {
        const holder = out[dao];
        const st = holder?.stack;
        if (st) {
            st.expiresAt = Math.max(0, st.expiresAt - battleEndedAt);
            if (st.nextDecayAt !== undefined)
                st.nextDecayAt = Math.max(0, st.nextDecayAt - battleEndedAt);
            if (st.stacks <= 0) {
                st.stacks = 0;
                st.nextDecayAt = undefined;
            }
        }
    }
    if (out.poison?.core) {
        out.poison.core.targetId = undefined;
        out.poison.core.poisonSeedStage = 0;
    }
    return out;
}
// === V79: remaining seven Bản Đạo V2 runtime ===
const REMAINING_V2_DAOS = ['fist', 'body', 'spell', 'poison', 'artifact', 'formation', 'mind'];
function holderV2(entity, dao) { return entity.battleDaoStateV2?.[dao]; }
function passiveIdV2(dao, n) { return `passive.v2.${dao}.p${n}`; }
function hasPassiveN(entity, dao, n) { return hasLearnedPassiveV2(entity, passiveIdV2(dao, n)); }
function passiveLevelN(entity, dao, n) { return hasPassiveN(entity, dao, n) ? lv(entity, passiveIdV2(dao, n)) : 0; }
function stackV2(entity, dao, now) { syncBattleDaoV2Timers(entity, now); return holderV2(entity, dao)?.stack; }
function refreshGenericStackV2(entity, dao, now) { const st = holderV2(entity, dao)?.stack; if (!st)
    return; const tune = genericStackTuning(entity, dao); st.cap = tune.cap; st.durationSeconds = tune.duration; st.decayEverySeconds = tune.decayEvery; st.expiresAt = now + st.durationSeconds; st.nextDecayAt = undefined; }
function addGenericStackV2(entity, dao, amount, now) {
    const st = stackV2(entity, dao, now);
    if (!st || amount <= 0)
        return 0;
    const before = st.stacks;
    st.stacks = Math.min(st.cap, st.stacks + Math.max(0, Math.floor(amount)));
    if (st.stacks > before)
        refreshGenericStackV2(entity, dao, now);
    return st.stacks - before;
}
export function fistPassiveDefensePctV2(entity, now) {
    if (!battleDaoV2Enabled(entity) || !canLearnDaoPassiveV2Runtime(entity, 'fist') || !hasPassiveN(entity, 'fist', 4))
        return 0;
    const st = stackV2(entity, 'fist', now);
    const stacks = st?.stacks ?? 0;
    if (stacks <= 0)
        return 0;
    return stacks * scale(passiveLevelN(entity, 'fist', 4), .15, .50);
}
export function remainingDaoPassiveBonusesV2(entity, now) {
    const out = { directDamagePct: 0, breakPct: 0, damageReductionPct: 0, spiritCostReductionPct: 0, recoveryReductionPct: 0, gaugeGainPct: 0, healShieldPct: 0, armorPenPct: 0 };
    if (!battleDaoV2Enabled(entity))
        return out;
    for (const dao of REMAINING_V2_DAOS) {
        if (!canLearnDaoPassiveV2Runtime(entity, dao) || !hasPassiveN(entity, dao, 1))
            continue;
        const st = stackV2(entity, dao, now);
        const stacks = st?.stacks ?? 0;
        if (stacks <= 0)
            continue;
        const p1 = passiveLevelN(entity, dao, 1);
        const groups = Math.floor(stacks / 10);
        const at20 = stacks >= 20;
        const atCap = Boolean(st && stacks >= st.cap);
        if (dao === 'fist') {
            if (stacks >= 10)
                out.breakPct += scale(p1, 5, 10);
            if (at20)
                out.directDamagePct += scale(p1, 8, 15);
            if (hasPassiveN(entity, dao, 6))
                out.breakPct += groups * scale(passiveLevelN(entity, dao, 6), 4, 12);
            if (at20 && hasPassiveN(entity, dao, 7))
                out.directDamagePct += scale(passiveLevelN(entity, dao, 7), 10, 35);
        }
        else if (dao === 'body') {
            out.healShieldPct += stacks * scale(p1, .4, 1);
            if (at20)
                out.damageReductionPct += scale(p1, 5, 12);
            if (hasPassiveN(entity, dao, 6))
                out.healShieldPct += groups * scale(passiveLevelN(entity, dao, 6), 4, 12);
            if (at20 && hasPassiveN(entity, dao, 7))
                out.damageReductionPct += scale(passiveLevelN(entity, dao, 7), 5, 15);
        }
        else if (dao === 'spell') {
            out.directDamagePct += stacks * scale(p1, .5, 1.5);
            if (stacks >= 10)
                out.spiritCostReductionPct += scale(p1, 5, 10);
            if (at20)
                out.recoveryReductionPct += scale(p1, 5, 15);
            if (hasPassiveN(entity, dao, 6))
                out.directDamagePct += groups * scale(passiveLevelN(entity, dao, 6), 4, 12);
            if (at20 && hasPassiveN(entity, dao, 7))
                out.spiritCostReductionPct += scale(passiveLevelN(entity, dao, 7), 4, 10);
        }
        else if (dao === 'poison') {
            if (stacks >= 10)
                out.directDamagePct += scale(p1, 5, 10);
            if (at20)
                out.armorPenPct += scale(p1, 8, 15);
            if (hasPassiveN(entity, dao, 6))
                out.directDamagePct += groups * scale(passiveLevelN(entity, dao, 6), 4, 12);
        }
        else if (dao === 'artifact') {
            out.gaugeGainPct += stacks * scale(p1, .4, 1);
            out.recoveryReductionPct += stacks * scale(p1, .4, .8);
            if (stacks >= 10)
                out.directDamagePct += scale(p1, 5, 10);
            if (at20)
                out.healShieldPct += scale(p1, 8, 15);
            if (hasPassiveN(entity, dao, 6))
                out.directDamagePct += groups * scale(passiveLevelN(entity, dao, 6), 4, 12);
            if (at20 && hasPassiveN(entity, dao, 7))
                out.recoveryReductionPct += scale(passiveLevelN(entity, dao, 7), 4, 12);
        }
        else if (dao === 'formation') {
            out.breakPct += stacks * scale(p1, .4, 1);
            if (stacks >= 10)
                out.directDamagePct += scale(p1, 5, 10);
            if (at20)
                out.recoveryReductionPct += scale(p1, 8, 15);
            if (hasPassiveN(entity, dao, 6))
                out.directDamagePct += groups * scale(passiveLevelN(entity, dao, 6), 4, 12);
            if (at20 && hasPassiveN(entity, dao, 7)) {
                out.breakPct += scale(passiveLevelN(entity, dao, 7), 8, 25);
                out.damageReductionPct += scale(passiveLevelN(entity, dao, 7), 4, 12);
            }
        }
        else if (dao === 'mind') {
            out.directDamagePct += stacks * scale(p1, .5, 1.5);
            if (at20)
                out.armorPenPct += scale(p1, 8, 15);
            if (hasPassiveN(entity, dao, 6))
                out.directDamagePct += groups * scale(passiveLevelN(entity, dao, 6), 4, 12);
            if (at20 && hasPassiveN(entity, dao, 7))
                out.armorPenPct += scale(passiveLevelN(entity, dao, 7), 5, 18);
        }
        if (atCap && hasPassiveN(entity, dao, 8)) {
            const l8 = passiveLevelN(entity, dao, 8);
            out.directDamagePct += scale(l8, 10, dao === 'body' ? 25 : 30);
            out.gaugeGainPct += scale(l8, 0, 20);
            // Quyền p8 refresh is event-owned: stat/damage reads must never extend Liên Kình by themselves.
            // Other Dao retain their historical behavior until their own migration slice.
            if (dao !== 'fist') {
                st.expiresAt = Math.max(st.expiresAt, now + scale(l8, 1, 2));
                st.nextDecayAt = undefined;
            }
        }
    }
    return out;
}
/**
 * V108 canonical Main-Dao output calibration. This coefficient is applied exactly once at the shared
 * CombatKernel V2 damage layer, so PvE/PvP/Boss all consume the same Dao identity tuning. V108 replaces
 * the stale V82 values after a role-aware global build audit (8 Dao, 5 elemental Sets, 66 Potential
 * allocations and seed-balanced round-robin duels). It never grants Secondary Dao Core/Active/Ultimate.
 */
// V129 progression-aware shared-kernel calibration. These anchors balance authored Dao
// identities at representative midgame (Dao Hanh 70) and endgame (Dao Hanh 100).
// This is NOT PvP-specific: the same multiplier is consumed by every CombatKernel V2 mode.
export const BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V129_MID = Object.freeze({
    sword: 1.65,
    fist: 1.10,
    body: 1.21,
    spell: 1.66,
    poison: 0.95,
    artifact: 1.15,
    formation: 1.95,
    mind: 2.55,
});
export const BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V129_ENDGAME = Object.freeze({
    sword: 1.45,
    fist: 0.84,
    body: 1.40,
    spell: 1.78,
    poison: 1.13,
    artifact: 1.45,
    formation: 1.60,
    mind: 2.65,
});
/** V108 export retained for save/tooling compatibility; runtime ownership moved to V129. */
export const BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V108 = BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V129_MID;
export function battleDaoV2MainDamageTuningV129(entity, main) {
    if (!main) return 1;
    const mid = BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V129_MID[main] ?? 1;
    const end = BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V129_ENDGAME[main] ?? mid;
    const raw = Number(entity.combatBuildV117?.daoHanhCurrentV129?.[main] ?? 70);
    const daoHanh = Math.max(0, Math.min(100, Number.isFinite(raw) ? raw : 70));
    const t = daoHanh <= 70 ? 0 : (daoHanh - 70) / 30;
    return mid + (end - mid) * t;
}
/** @deprecated Compatibility alias. Runtime calibration is owned by V129 progression-aware shared-kernel tuning. */
export const BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V82 = BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V108;
export function battleDaoV2OutgoingMultiplier(entity, target, now, sourceTag, skillId) {
    if (!battleDaoV2Enabled(entity))
        return 1;
    let pct = remainingDaoPassiveBonusesV2(entity, now).directDamagePct;
    const main = entity.combatBuildV117?.mainDaoId;
    if (main === 'body') {
        const n = holderV2(entity, 'body')?.core?.counterForce ?? 0;
        pct += Math.floor(n / 20) * 3;
    }
    if (main === 'spell') {
        const n = holderV2(entity, 'spell')?.core?.lawWheelForms?.length ?? 0;
        pct += n * 6;
    }
    if (main === 'poison') {
        const core = holderV2(entity, 'poison')?.core;
        if (core) {
            if (core.targetId !== target.id) {
                core.targetId = target.id;
                core.poisonSeedStage = 0;
            }
            pct += core.poisonSeedStage * 3;
            if (sourceTag === 'DoT')
                pct += core.poisonSeedStage * 8;
        }
        const st = stackV2(entity, 'poison', now);
        if (st?.stacks) {
            const p1 = passiveLevelN(entity, 'poison', 1);
            pct += st.stacks * scale(p1, .35, .75);
            if (st.stacks >= 20 && hasPassiveN(entity, 'poison', 7) && target.hp / Math.max(1, target.baseStats.maxHp) < .5)
                pct += scale(passiveLevelN(entity, 'poison', 7), 10, 35);
        }
    }
    if (main === 'artifact' && sourceTag === 'ActiveHit') {
        const n = holderV2(entity, 'artifact')?.core?.artifactSources ?? 1;
        pct += Math.max(0, n - 1) * 12;
    }
    if (main === 'formation') {
        const c = holderV2(entity, 'formation')?.core;
        if (c?.deployed)
            pct += Math.floor((c.nurture ?? 0) / 20) * 5;
    }
    const identityTuning = battleDaoV2MainDamageTuningV129(entity, main);
    return Math.max(0, 1 + pct / 100) * identityTuning;
}
export function battleDaoV2BreakMultiplier(entity, now, skillId) {
    if (!battleDaoV2Enabled(entity))
        return 1;
    let pct = remainingDaoPassiveBonusesV2(entity, now).breakPct;
    const main = entity.combatBuildV117?.mainDaoId;
    if (main === 'formation') {
        const c = holderV2(entity, 'formation')?.core;
        if (c?.deployed)
            pct += Math.floor((c.nurture ?? 0) / 20) * 5;
    }
    return 1 + Math.max(0, pct) / 100;
}
export function battleDaoV2IncomingDamageMultiplier(entity, now) {
    if (!battleDaoV2Enabled(entity))
        return 1;
    let pct = remainingDaoPassiveBonusesV2(entity, now).damageReductionPct;
    if (entity.combatBuildV117?.mainDaoId === 'body')
        pct += Math.floor((holderV2(entity, 'body')?.core?.counterForce ?? 0) / 20) * 2;
    return Math.max(.2, 1 - Math.min(80, pct) / 100);
}
export function battleDaoV2SpiritCostMultiplier(entity, skill, now) {
    if (!battleDaoV2Enabled(entity))
        return 1;
    let pct = remainingDaoPassiveBonusesV2(entity, now).spiritCostReductionPct;
    if (entity.combatBuildV117?.mainDaoId === 'spell' && skillRuntimeV117(skill).daoBinding === 'spell')
        pct += (holderV2(entity, 'spell')?.core?.lawWheelForms?.length ?? 0) * 5;
    return Math.max(.35, 1 - Math.min(65, pct) / 100);
}
export function battleDaoV2RecoveryMultiplier(entity, now) { return Math.max(.4, 1 - Math.min(60, remainingDaoPassiveBonusesV2(entity, now).recoveryReductionPct) / 100); }
export function battleDaoV2GaugeMultiplier(entity, now) { return 1 + remainingDaoPassiveBonusesV2(entity, now).gaugeGainPct / 100; }
export function battleDaoV2HealShieldMultiplier(entity, now) { return 1 + remainingDaoPassiveBonusesV2(entity, now).healShieldPct / 100; }
export function prepareRemainingDaoCoreActionV2(entity, target, skill, action, now) {
    if (!battleDaoV2Enabled(entity))
        return;
    const dao = skillRuntimeV117(skill).daoBinding;
    if (!dao || dao === 'sword' || entity.combatBuildV117?.mainDaoId !== dao)
        return;
    syncBattleDaoV2Timers(entity, now);
    const d = action.battleDaoV2?.daoData ?? (action.battleDaoV2 ? (action.battleDaoV2.daoData = {}) : {});
    const damaging = skillDomainsV117(skill).includes('Damage');
    const active = skillSlotClassV117(skill) === 'active';
    if (dao === 'fist') {
        // Q2: Quyền Thế is owned by prepareFistCoreActionV2/finishFistCoreActionV2.
        // Keep this branch mutation-free so generic Remaining-Dao handling cannot double-spend it.
        void d;
        void damaging;
        void active;
    }
    else if (dao === 'body') {
        const c = holderV2(entity, 'body')?.core;
        if (!c)
            return;
        d.counterForceBefore = c.counterForce;
        if (c.counterForce >= 100 && active) {
            action.effectBonusPct += 40;
            c.counterForce = Math.max(0, c.counterForce - 40);
            d.counterForceSpent = 40;
        }
    }
    else if (dao === 'spell') {
        const c = holderV2(entity, 'spell')?.core;
        if (!c)
            return;
        d.lawWheelBefore = c.lawWheelForms.length;
        if (c.lawWheelForms.length >= 3 && active && damaging) {
            action.effectBonusPct += 35;
            action.breakBonusPct += 20;
            c.lawWheelForms = c.lawWheelForms.slice(-1);
            d.lawWheelSpent = 2;
        }
    }
    else if (dao === 'poison') {
        const c = holderV2(entity, 'poison')?.core;
        if (!c)
            return;
        if (c.targetId !== target.id) {
            c.targetId = target.id;
            c.poisonSeedStage = 0;
        }
        d.poisonStageBefore = c.poisonSeedStage;
        if (skill.daoRuntimeV118?.signature === 'poisonConsume' && c.poisonSeedStage >= 4) {
            action.effectBonusPct += 50;
            d.poisonHeartConsume = true;
        }
    }
    else if (dao === 'artifact') {
        const c = holderV2(entity, 'artifact')?.core;
        if (!c)
            return;
        d.artifactSourcesBefore = c.artifactSources;
        if (skill.daoRuntimeV118?.signature === 'artifactCommand')
            action.effectBonusPct += Math.max(0, c.artifactSources - 1) * 12;
    }
    else if (dao === 'formation') {
        const c = holderV2(entity, 'formation')?.core;
        if (!c)
            return;
        d.formationNurtureBefore = c.nurture;
        d.formationIntegrityBefore = c.integrity;
        if (c.deployed && skill.daoRuntimeV118?.signature === 'formationActivate' && c.nurture >= 100) {
            action.effectBonusPct += 50;
            action.breakBonusPct += 50;
            c.integrity = Math.max(0, c.integrity - 25);
            d.formationGrand = true;
        }
    }
    action.recoveryMultiplier *= battleDaoV2RecoveryMultiplier(entity, now);
}
function rootStackGainV2(entity, dao, action, now, chance, eligible) {
    const st = holderV2(entity, dao)?.stack;
    if (!st || !eligible)
        return 0;
    let gain = 1;
    if (hasPassiveN(entity, dao, 2) && chance(scale(passiveLevelN(entity, dao, 2), dao === 'poison' ? 8 : 10, dao === 'poison' ? 25 : 30)))
        gain += 1;
    return addGenericStackV2(entity, dao, gain, now);
}
export function finishRemainingDaoActionV2(entity, target, skill, action, now, chance) {
    const out = { notices: [] };
    if (!battleDaoV2Enabled(entity))
        return out;
    const dao = skillRuntimeV117(skill).daoBinding;
    if (!dao || dao === 'sword')
        return out;
    syncBattleDaoV2Timers(entity, now);
    const main = entity.combatBuildV117?.mainDaoId === dao;
    const damaging = (action.battleDaoV2?.directDamagingHitCount ?? 0) > 0;
    const active = skillSlotClassV117(skill) === 'active';
    if (main && dao === 'fist') {
        // Q2: explicit per-skill Quyền Thế generation is finalized by finishFistCoreActionV2.
    }
    if (main && dao === 'spell') {
        const c = holderV2(entity, 'spell')?.core;
        if (c) {
            const form = skillRuntimeV117(skill).form;
            const bucket = form === 'channel' ? 'Dẫn Pháp' : form === 'cast' || form === 'charge' ? 'Cast' : 'Tốc Pháp';
            if (!c.lawWheelForms.includes(bucket)) {
                c.lawWheelForms.push(bucket);
                if (c.lawWheelForms.length > c.lawWheelCap)
                    c.lawWheelForms.shift();
                out.notices.push({ message: `${entity.name} hoàn thiện Pháp Luân: ${c.lawWheelForms.join(' · ')}`, data: { lawWheel: c.lawWheelForms.length } });
            }
        }
    }
    if (main && dao === 'artifact') {
        const c = holderV2(entity, 'artifact')?.core;
        if (c) {
            const sig = skill.daoRuntimeV118?.signature;
            if (sig === 'artifactDeploy')
                c.artifactSources = Math.min(c.artifactSourceCap, c.artifactSources + 1);
            else if (sig === 'artifactRecall')
                c.artifactSources = Math.max(1, c.artifactSources - 1);
            else if (sig === 'artifactMerge')
                c.artifactSources = 1;
            if (sig === 'artifactCommand' && damaging && c.artifactSources > 1) {
                const claim = claimDamagingFollowUpV2(action, { kind: 'intrinsic', id: 'intrinsic.v2.artifact.source_followup' });
                if (claim)
                    out.followUp = { kind: 'artifact', delay: .08, coefficient: (c.artifactSources - 1) * .20, breakDamagePct: 0, label: 'Khí Linh Truy Kích', claim };
            }
        }
    }
    if (main && dao === 'formation') {
        const c = holderV2(entity, 'formation')?.core;
        if (c) {
            const sig = skill.daoRuntimeV118?.signature;
            if (sig === 'formationDeploy') {
                c.deployed = true;
                c.nurture = 0;
                c.integrity = 100;
            }
            else if (sig === 'formationNourish' && c.deployed)
                c.nurture = Math.min(100, c.nurture + 30);
            else if (sig === 'formationFortify' && c.deployed)
                c.integrity = Math.min(100, c.integrity + 30);
            else if (sig === 'formationActivate' && c.deployed) {
                const spend = Math.min(c.nurture, skillSlotClassV117(skill) === 'ultimate' ? 80 : 35);
                c.nurture = Math.max(0, c.nurture - spend);
                if (c.integrity <= 0) {
                    c.deployed = false;
                    c.nurture = 0;
                }
            }
            else if (sig === 'formationBreak') {
                c.deployed = false;
                c.nurture = 0;
                c.integrity = 0;
            }
            out.notices.push({ message: `${entity.name} Chủ Trận: Dưỡng ${Math.round(c.nurture)}/100 · Bền ${Math.round(c.integrity)}/100.`, data: { formationNurture: c.nurture, formationIntegrity: c.integrity, formationDeployed: c.deployed } });
        }
    }
    if (main && dao === 'mind' && active) {
        const c = holderV2(entity, 'mind')?.core;
        if (c) {
            c.eligibleActiveCount++;
            c.snapshot = { sourceSkillId: skill.id, createdAt: now, payloadId: `${action.battleDaoV2?.rootActionId ?? skill.id}:snapshot`, procDepth: 0 };
            if (c.eligibleActiveCount >= c.echoEvery) {
                c.eligibleActiveCount = 0;
                const claim = claimDamagingFollowUpV2(action, { kind: 'intrinsic', id: 'intrinsic.v2.mind.echo' });
                if (claim)
                    out.followUp = { kind: 'mind', delay: .6, coefficient: Math.max(.1, (action.battleDaoV2?.hpDamage ?? 0) / Math.max(1, entity.baseStats.attack)) * c.echoCoefficient, breakDamagePct: 0, label: 'Niệm Ảnh', claim };
            }
        }
    }
    // Passive-stack mechanics are deliberately generic: a learned Secondary Dao passive must work at
    // 100% without requiring (or allowing) the Secondary Dao's Active skills. Core mechanics above remain
    // Main-only and skill-bound; the loop below observes the root action itself.
    for (const passiveDao of REMAINING_V2_DAOS) {
        if (passiveDao === 'body' || !canLearnDaoPassiveV2Runtime(entity, passiveDao) || !hasPassiveN(entity, passiveDao, 1))
            continue;
        if (passiveDao === 'fist') {
            rootStackGainV2(entity, 'fist', action, now, chance, damaging);
            const st = holderV2(entity, 'fist')?.stack;
            if (damaging && st && st.stacks >= st.cap && hasPassiveN(entity, 'fist', 8)) {
                const hold = scale(passiveLevelN(entity, 'fist', 8), 1, 2);
                st.expiresAt = Math.max(st.expiresAt, now + hold);
                st.nextDecayAt = undefined;
            }
        }
        else if (passiveDao === 'spell')
            rootStackGainV2(entity, 'spell', action, now, chance, skillStandardCostPctV117(skill) > 0 || skill.spiritCost > 0);
        else if (passiveDao === 'poison') {
            const st = holderV2(entity, 'poison')?.stack;
            if (st && damaging) {
                st.actionCounter++;
                let gain = 0;
                if (st.actionCounter >= 3) {
                    gain += Math.floor(st.actionCounter / 3);
                    st.actionCounter %= 3;
                }
                if (hasPassiveN(entity, 'poison', 2) && chance(scale(passiveLevelN(entity, 'poison', 2), 8, 25)))
                    gain += 1;
                if (gain > 0)
                    addGenericStackV2(entity, 'poison', gain, now);
            }
        }
        else if (passiveDao === 'artifact') {
            const st = holderV2(entity, 'artifact')?.stack;
            if (st) {
                st.actionCounter++;
                let gain = 0;
                if (st.actionCounter >= 3) {
                    gain += Math.floor(st.actionCounter / 3);
                    st.actionCounter %= 3;
                }
                if (hasPassiveN(entity, 'artifact', 2) && chance(scale(passiveLevelN(entity, 'artifact', 2), 10, 30)))
                    gain += 1;
                if (gain > 0)
                    addGenericStackV2(entity, 'artifact', gain, now);
            }
        }
        else if (passiveDao === 'formation') {
            const st = holderV2(entity, 'formation')?.stack;
            if (st) {
                const different = st.lastSkillId !== skill.id;
                st.lastSkillId = skill.id;
                if (different) {
                    let gain = 1;
                    if (hasPassiveN(entity, 'formation', 2) && chance(scale(passiveLevelN(entity, 'formation', 2), 10, 30)))
                        gain++;
                    addGenericStackV2(entity, 'formation', gain, now);
                }
            }
        }
        else if (passiveDao === 'mind') {
            const slot = skillSlotClassV117(skill);
            const eligible = slot === 'active' || slot === 'ultimate';
            if (eligible) {
                let gain = slot === 'ultimate' ? 2 : 1;
                if (hasPassiveN(entity, 'mind', 2) && chance(scale(passiveLevelN(entity, 'mind', 2), 10, 30)))
                    gain++;
                addGenericStackV2(entity, 'mind', gain, now);
            }
        }
    }
    return out;
}
export function onBattleDaoV2Mitigation(entity, eventBudget, mitigatedRatio, now) {
    if (!battleDaoV2Enabled(entity) || entity.combatBuildV117?.mainDaoId !== 'body')
        return 0;
    syncBattleDaoV2Timers(entity, now);
    const c = holderV2(entity, 'body')?.core;
    if (!c)
        return 0;
    const before = c.counterForce;
    const gain = eventBudget * Math.max(0, Math.min(1, mitigatedRatio)) * .8;
    c.counterForce = Math.min(c.counterForceCap, c.counterForce + gain);
    return c.counterForce - before;
}
export function onBattleDaoV2HpDamageTaken(entity, hpDamage, now, chance) {
    if (!battleDaoV2Enabled(entity) || hpDamage <= 0 || !canLearnDaoPassiveV2Runtime(entity, 'body') || !hasPassiveN(entity, 'body', 1))
        return 0;
    let gain = 1;
    if (hasPassiveN(entity, 'body', 2) && chance(scale(passiveLevelN(entity, 'body', 2), 10, 30)))
        gain++;
    return addGenericStackV2(entity, 'body', gain, now);
}
export function addPoisonSeedStageV2(entity, targetId, amount, now) {
    if (!battleDaoV2Enabled(entity) || entity.combatBuildV117?.mainDaoId !== 'poison')
        return 0;
    syncBattleDaoV2Timers(entity, now);
    const c = holderV2(entity, 'poison')?.core;
    if (!c)
        return 0;
    if (c.targetId !== targetId) {
        c.targetId = targetId;
        c.poisonSeedStage = 0;
    }
    const before = c.poisonSeedStage;
    c.poisonSeedStage = Math.min(c.poisonSeedCap, c.poisonSeedStage + Math.max(0, Math.floor(amount)));
    return c.poisonSeedStage - before;
}
export function consumePoisonSeedStageV2(entity, targetId, maxConsume, keepAfterHeart = 1) {
    const c = holderV2(entity, 'poison')?.core;
    if (!c || c.targetId !== targetId)
        return { consumed: 0, stageBefore: 0, heart: false };
    const before = c.poisonSeedStage;
    const heart = before >= c.poisonSeedCap;
    const consumed = Math.min(before, Math.max(0, Math.floor(maxConsume)));
    c.poisonSeedStage = heart ? Math.max(keepAfterHeart, before - consumed) : Math.max(0, before - consumed);
    return { consumed, stageBefore: before, heart };
}
export function v2ResourceProjection(entity, now) {
    syncBattleDaoV2Timers(entity, now);
    const s = entity.battleDaoStateV2;
    const out = {};
    if (!s)
        return out;
    if (s.sword?.core)
        out.swordQi = s.sword.core.swordQi;
    if (s.sword?.intent) {
        out.swordIntentV2 = s.sword.intent.stacks;
        out.swordIntentV2Cap = s.sword.intent.cap;
    }
    if (s.fist?.core) {
        out.fistForce = s.fist.core.fistForce;
        out.fistForceCap = s.fist.core.fistForceCap;
        if ((s.fist.core.fistDomainUntil ?? 0) > now)
            out.fistDomainUntil = s.fist.core.fistDomainUntil;
    }
    if (s.fist?.stack) {
        out.fistPassiveStack = s.fist.stack.stacks;
        out.fistPassiveStackCap = s.fist.stack.cap;
    }
    if (s.body?.core)
        out.counterForce = s.body.core.counterForce;
    if (s.body?.stack) {
        out.bodyPassiveStack = s.body.stack.stacks;
        out.bodyPassiveStackCap = s.body.stack.cap;
    }
    if (s.spell?.core)
        out.lawWheel = s.spell.core.lawWheelForms.length;
    if (s.spell?.stack) {
        out.spellPassiveStack = s.spell.stack.stacks;
        out.spellPassiveStackCap = s.spell.stack.cap;
    }
    if (s.poison?.core)
        out.poisonSeedStage = s.poison.core.poisonSeedStage;
    if (s.poison?.stack) {
        out.poisonPassiveStack = s.poison.stack.stacks;
        out.poisonPassiveStackCap = s.poison.stack.cap;
    }
    if (s.artifact?.core)
        out.artifactSourcesV2 = s.artifact.core.artifactSources;
    if (s.artifact?.stack) {
        out.artifactPassiveStack = s.artifact.stack.stacks;
        out.artifactPassiveStackCap = s.artifact.stack.cap;
    }
    if (s.formation?.core) {
        out.formationDeployedV2 = s.formation.core.deployed;
        out.formationNurtureV2 = s.formation.core.nurture;
        out.formationIntegrityV2 = s.formation.core.integrity;
    }
    if (s.formation?.stack) {
        out.formationPassiveStack = s.formation.stack.stacks;
        out.formationPassiveStackCap = s.formation.stack.cap;
    }
    if (s.mind?.core)
        out.mindEchoCounter = s.mind.core.eligibleActiveCount;
    if (s.mind?.stack) {
        out.mindPassiveStack = s.mind.stack.stacks;
        out.mindPassiveStackCap = s.mind.stack.cap;
    }
    return out;
}
//# sourceMappingURL=battle-dao-v2-runtime.js.map