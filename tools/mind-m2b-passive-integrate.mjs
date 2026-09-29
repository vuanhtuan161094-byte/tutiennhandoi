import fs from 'node:fs';

const read = path => fs.readFileSync(path,'utf8').replace(/\r\n/g,'\n');
const write = (path,text) => fs.writeFileSync(path,text);
function once(text,label,before,after){
  const count=text.split(before).length-1;
  if(count!==1) throw new Error(`${label}: expected once, found ${count}`);
  return text.replace(before,after);
}
function range(text,label,startMarker,endMarker,replacement){
  const start=text.indexOf(startMarker);
  if(start<0) throw new Error(`${label}: start missing`);
  if(text.indexOf(startMarker,start+startMarker.length)>=0) throw new Error(`${label}: start not unique`);
  const end=text.indexOf(endMarker,start+startMarker.length);
  if(end<0) throw new Error(`${label}: end missing`);
  return text.slice(0,start)+replacement+text.slice(end);
}

// ---------------------------------------------------------------------------
// 1) Canonical passive copy: remove the historical generic-DPS identity.
// ---------------------------------------------------------------------------
const contentPath='dist/content/mind-dao-v2.js';
let content=read(contentPath);
const passiveBlock=`export const mindPassivesV2 = [
    { id: 'passive.v2.mind.p1', dao: 'mind', name: "Niệm Lực Quyết", realm: 'mundane', summary: "Mở Niệm Lực; mỗi 10 tầng tăng hệ số Niệm Ảnh và hiệu lực khống chế của Main Mind, còn Secondary chỉ nhận Resolve.", lv1: "Mỗi 10 tầng: Niệm Ảnh +2 điểm %, hiệu lực khống chế +2%; Secondary Resolve +2%.", lv20: "Mỗi 10 tầng: Niệm Ảnh +4 điểm %, hiệu lực khống chế +5%; Secondary Resolve +5%." },
    { id: 'passive.v2.mind.p2', dao: 'mind', name: "Dưỡng Niệm Chân Kinh", realm: 'spirit', summary: "Mỗi sự kiện nhận Niệm Lực hợp lệ có tối đa một cơ hội nhận thêm +1 tầng.", lv1: "10% xác suất nhận thêm +1 Niệm Lực.", lv20: "30% xác suất nhận thêm +1 Niệm Lực." },
    { id: 'passive.v2.mind.p3', dao: 'mind', name: "Niệm Lực Trường Tồn", realm: 'mystic', summary: "Kéo dài thời gian giữ Niệm Lực và làm chậm nhịp rơi sau khi hết thời gian giữ.", lv1: "+2 giây thời gian giữ.", lv20: "+8 giây thời gian giữ; decay chậm tới 1 tầng / 2 giây." },
    { id: 'passive.v2.mind.p4', dao: 'mind', name: "Minh Tâm Chân Ý", realm: 'earth', summary: "Mỗi 10 Niệm Lực tăng Accuracy và Control Power cục bộ cho Main Mind; Secondary chỉ nhận Resolve.", lv1: "Mỗi 10 tầng: Accuracy +2%, Control Power +2%; Secondary Resolve +2%.", lv20: "Mỗi 10 tầng: Accuracy +6%, Control Power +6%; Secondary Resolve +6%." },
    { id: 'passive.v2.mind.p5', dao: 'mind', name: "Vạn Niệm Vô Cực", realm: 'heaven', summary: "Tăng giới hạn Niệm Lực nhưng không thay đổi cap Thần Ấn.", lv1: "+2 cap Niệm Lực.", lv20: "+10 cap Niệm Lực, đưa cap ứng viên từ 20 lên 30." },
    { id: 'passive.v2.mind.p6', dao: 'mind', name: "Thần Niệm Lăng Thiên", realm: 'immortal', summary: "Mỗi 10 Niệm Lực tăng Nhiễu mềm và hiệu quả Break của Niệm Ảnh cho Main Mind.", lv1: "Mỗi 10 tầng: Nhiễu +3%; Niệm Ảnh Break +2%.", lv20: "Mỗi 10 tầng: Nhiễu +7%; Niệm Ảnh Break +5%." },
    { id: 'passive.v2.mind.p7', dao: 'mind', name: "Nhất Niệm Phá Vọng", realm: 'extreme', summary: "Từ 20 Niệm Lực, direct packet của Main Mind được Xuyên Phòng cục bộ khi mục tiêu đang có Thần Ấn hoặc Nhiễu.", lv1: "+5% Xuyên Phòng cục bộ khi đủ điều kiện.", lv20: "+18% Xuyên Phòng cục bộ khi đủ điều kiện." },
    { id: 'passive.v2.mind.p8', dao: 'mind', name: "Niệm Lực Bất Diệt", realm: 'breaker', summary: "Ở cap Niệm Lực, Active hợp lệ refresh đỉnh theo sự kiện; Main tăng Niệm Ảnh/Nhiễu/control, Secondary chỉ nhận Resolve.", lv1: "Refresh đỉnh 1 giây; Niệm Ảnh +5 điểm %; Nhiễu/control +5%; Secondary Resolve +5%.", lv20: "Refresh đỉnh 2 giây; Niệm Ảnh +10 điểm %; Nhiễu/control +12%; Secondary Resolve +10%." },
];
`;
content=range(content,'replace passive production tree','export const mindPassivesV2 = [','export const mindSkillMasteryV2 =',passiveBlock+'export const mindSkillMasteryV2 =');
write(contentPath,content);

// ---------------------------------------------------------------------------
// 2) Mind-owned passive runtime.
// ---------------------------------------------------------------------------
const mindPath='dist/core/mind-dao-v2-runtime.js';
let mind=read(mindPath);
const passiveLevelMarker=`function mindPassiveLevel(entity, n) {
    return clampLevel(entity?.combatBuildV117?.passiveLevelsV125?.[mindPassiveId(n)] ?? 1);
}
`;
const passiveHelpers=`function mindPassiveLevel(entity, n) {
    return clampLevel(entity?.combatBuildV117?.passiveLevelsV125?.[mindPassiveId(n)] ?? 1);
}
function isSecondaryMind(entity) {
    return entity?.combatBuildV117?.battleDaoV2Enabled === true
        && entity?.combatBuildV117?.mainDaoId !== 'mind'
        && entity?.combatBuildV117?.secondaryDaoId === 'mind';
}
export function mindPassiveBonusesV2(entity, now = 0) {
    void now;
    const out = {
        echoCoefficientBonus: 0,
        accuracyPct: 0,
        controlPowerPct: 0,
        interferencePct: 0,
        echoBreakPct: 0,
        resolvePct: 0,
        conditionalArmorPenPct: 0,
    };
    if (entity?.combatBuildV117?.battleDaoV2Enabled !== true || !hasMindPassive(entity, 1))
        return out;
    const stack = entity.battleDaoStateV2?.mind?.stack;
    const stacks = Math.max(0, Math.floor(stack?.stacks ?? 0));
    if (!stack || stacks <= 0)
        return out;
    const groups = Math.floor(stacks / 10);
    const atCap = stacks >= Math.max(1, Math.floor(stack.cap ?? 20));
    if (isMainMind(entity)) {
        if (groups > 0) {
            const p1 = mindPassiveLevel(entity, 1);
            const p1Control = groups * scaleLevel(p1, 2, 5);
            out.echoCoefficientBonus += groups * scaleLevel(p1, .02, .04);
            out.controlPowerPct += p1Control;
            out.interferencePct += p1Control;
            if (hasMindPassive(entity, 4)) {
                const p4 = mindPassiveLevel(entity, 4);
                out.accuracyPct += groups * scaleLevel(p4, 2, 6);
                out.controlPowerPct += groups * scaleLevel(p4, 2, 6);
            }
            if (hasMindPassive(entity, 6)) {
                const p6 = mindPassiveLevel(entity, 6);
                out.interferencePct += groups * scaleLevel(p6, 3, 7);
                out.echoBreakPct += groups * scaleLevel(p6, 2, 5);
            }
        }
        if (stacks >= 20 && hasMindPassive(entity, 7))
            out.conditionalArmorPenPct = scaleLevel(mindPassiveLevel(entity, 7), 5, 18);
        if (atCap && hasMindPassive(entity, 8)) {
            const p8 = mindPassiveLevel(entity, 8);
            out.echoCoefficientBonus += scaleLevel(p8, .05, .10);
            const peakControl = scaleLevel(p8, 5, 12);
            out.controlPowerPct += peakControl;
            out.interferencePct += peakControl;
        }
    }
    else if (isSecondaryMind(entity)) {
        if (groups > 0) {
            out.resolvePct += groups * scaleLevel(mindPassiveLevel(entity, 1), 2, 5);
            if (hasMindPassive(entity, 4))
                out.resolvePct += groups * scaleLevel(mindPassiveLevel(entity, 4), 2, 6);
        }
        if (atCap && hasMindPassive(entity, 8))
            out.resolvePct += scaleLevel(mindPassiveLevel(entity, 8), 5, 10);
    }
    return out;
}
export function mindDirectArmorPenBonusV2(source, target, action, now = 0) {
    if (!isMainMind(source) || (action?.battleDaoV2?.procDepth ?? 0) !== 0)
        return 0;
    const bonus = mindPassiveBonusesV2(source, now).conditionalArmorPenPct;
    if (bonus <= 0)
        return 0;
    const pressured = mindMarkCountV2(target) > 0
        || Math.max(0, Number(target?.pendingSetFlagsV117?.mindRecoveryPenaltyPct ?? 0)) > 0
        || Math.max(0, Number(action?.battleDaoV2?.mindMarksBefore ?? 0)) > 0;
    return pressured ? bonus : 0;
}
`;
mind=once(mind,'insert Mind passive helpers',passiveLevelMarker,passiveHelpers);

mind=once(mind,'Nhiễu store + passive potency',`    const spent = consumeMindMarksV2(source, target, 3);
    if (action?.battleDaoV2)
        action.battleDaoV2.mindMarksSpent = spent.consumed;
    if (spent.consumed <= 0)
        return { consumed: 0, targetCastDelaySeconds: 0, mentalStaggerSeconds: 0 };
    let potencyPct = spent.consumed * 6;
    if (target?.tags?.includes('Boss'))
        potencyPct *= .5;`,`    const spent = consumeMindMarksV2(source, target, 3);
    if (action?.battleDaoV2) {
        action.battleDaoV2.mindMarksBefore = spent.before;
        action.battleDaoV2.mindMarksSpent = spent.consumed;
    }
    if (spent.consumed <= 0)
        return { consumed: 0, targetCastDelaySeconds: 0, mentalStaggerSeconds: 0 };
    const passive = mindPassiveBonusesV2(source, now);
    let potencyPct = spent.consumed * 6 * (1 + passive.interferencePct / 100);
    if (target?.tags?.includes('Boss'))
        potencyPct *= .5;`);

mind=once(mind,'consume store pre-spend pressure',`    const spent = consumeMindMarksV2(source, target, Math.min(MIND_V2_MARK_CAP, effect.maxConsume ?? MIND_V2_MARK_CAP));
    if (action?.battleDaoV2)
        action.battleDaoV2.mindMarksSpent = spent.consumed;`,`    const spent = consumeMindMarksV2(source, target, Math.min(MIND_V2_MARK_CAP, effect.maxConsume ?? MIND_V2_MARK_CAP));
    if (action?.battleDaoV2) {
        action.battleDaoV2.mindMarksBefore = spent.before;
        action.battleDaoV2.mindMarksSpent = spent.consumed;
    }`);

mind=once(mind,'echo coefficient consumes passive identity',`                coefficient: Math.min(.70, Math.max(0, Number(core.echoCoefficient ?? MIND_V2_BASE_ECHO_COEFFICIENT))),`,`                coefficient: Math.min(.70, Math.max(0, Number(core.echoCoefficient ?? MIND_V2_BASE_ECHO_COEFFICIENT) + mindPassiveBonusesV2(source, now).echoCoefficientBonus)),`);
write(mindPath,mind);

// ---------------------------------------------------------------------------
// 3) Retire generic Mind passive output + make Secondary p8 refresh event-owned.
// ---------------------------------------------------------------------------
const genericPath='dist/core/battle-dao-v2-runtime.js';
let generic=read(genericPath);
generic=once(generic,'retire generic Mind passive package',`        else if (dao === 'mind') {
            out.directDamagePct += stacks * scale(p1, .5, 1.5);
            if (at20)
                out.armorPenPct += scale(p1, 8, 15);
            if (hasPassiveN(entity, dao, 6))
                out.directDamagePct += groups * scale(passiveLevelN(entity, dao, 6), 4, 12);
            if (at20 && hasPassiveN(entity, dao, 7))
                out.armorPenPct += scale(passiveLevelN(entity, dao, 7), 5, 18);
        }
        if (atCap && hasPassiveN(entity, dao, 8)) {`,`        else if (dao === 'mind') {
            // M2B: Mind passive output is owned by mind-dao-v2-runtime.js.
            // Generic damage/Gauge/Armor-Pen bonuses are deliberately retired.
        }
        if (dao !== 'mind' && atCap && hasPassiveN(entity, dao, 8)) {`);

generic=once(generic,'Secondary Mind p8 event refresh',`        else if (passiveDao === 'mind') {
            const slot = skillSlotClassV117(skill);
            const eligible = slot === 'active' || slot === 'ultimate';
            if (eligible) {
                let gain = slot === 'ultimate' ? 2 : 1;
                if (hasPassiveN(entity, 'mind', 2) && chance(scale(passiveLevelN(entity, 'mind', 2), 10, 30)))
                    gain++;
                addGenericStackV2(entity, 'mind', gain, now);
            }
        }`,`        else if (passiveDao === 'mind') {
            const slot = skillSlotClassV117(skill);
            const eligible = slot === 'active' || slot === 'ultimate';
            if (eligible) {
                let gain = slot === 'ultimate' ? 2 : 1;
                if (hasPassiveN(entity, 'mind', 2) && chance(scale(passiveLevelN(entity, 'mind', 2), 10, 30)))
                    gain++;
                addGenericStackV2(entity, 'mind', gain, now);
                const st = holderV2(entity, 'mind')?.stack;
                if (st && st.stacks >= st.cap && hasPassiveN(entity, 'mind', 8)) {
                    const hold = scale(passiveLevelN(entity, 'mind', 8), 1, 2);
                    st.expiresAt = Math.max(st.expiresAt, now + hold);
                    st.nextDecayAt = undefined;
                }
            }
        }`);
write(genericPath,generic);

// ---------------------------------------------------------------------------
// 4) Canonical effectiveStats: Secondary Resolve + transient Main action stats.
// ---------------------------------------------------------------------------
const statsPath='dist/core/stats.js';
let stats=read(statsPath);
stats=once(stats,'extend battle runtime import',`import { fistPassiveDefensePctV2, swordIntentBonusesV2 } from './battle-dao-v2-runtime.js';`,`import { fistPassiveDefensePctV2, swordIntentBonusesV2, syncBattleDaoV2Timers } from './battle-dao-v2-runtime.js';
import { mindPassiveBonusesV2 } from './mind-dao-v2-runtime.js';`);
stats=once(stats,'materialize Mind stat lanes',`    const swordV2 = swordIntentBonusesV2(entity, now);
    const fistDefensePct = fistPassiveDefensePctV2(entity, now);`,`    syncBattleDaoV2Timers(entity, now);
    const swordV2 = swordIntentBonusesV2(entity, now);
    const fistDefensePct = fistPassiveDefensePctV2(entity, now);
    const mindV2 = mindPassiveBonusesV2(entity, now);
    const mindActionAccuracyPct = Math.max(0, Number(entity.pendingSetFlagsV117?.mindV2ActionAccuracyPct ?? 0));
    const mindActionControlPowerPct = Math.max(0, Number(entity.pendingSetFlagsV117?.mindV2ActionControlPowerPct ?? 0));`);
stats=once(stats,'apply action-local and Secondary stats',`        accuracy: entity.baseStats.accuracy * accuracyMul,
        actionSpeed: actionSpeedMultiplier(entity.baseStats.actionSpeed * actionSpeedMul),
        resolve: entity.baseStats.resolve * resolveMul,
        controlPower: entity.baseStats.controlPower * controlPowerMul,`,`        accuracy: entity.baseStats.accuracy * accuracyMul * (1 + mindActionAccuracyPct / 100),
        actionSpeed: actionSpeedMultiplier(entity.baseStats.actionSpeed * actionSpeedMul),
        resolve: entity.baseStats.resolve * resolveMul * (1 + mindV2.resolvePct / 100),
        controlPower: entity.baseStats.controlPower * controlPowerMul * (1 + mindActionControlPowerPct / 100),`);
write(statsPath,stats);

// ---------------------------------------------------------------------------
// 5) Combat wrapper: action-local Accuracy/Control, localized P7, P6 echo Break.
// ---------------------------------------------------------------------------
const combatPath='dist/core/combat.js';
let combat=read(combatPath);
combat=once(combat,'import passive helpers',`    mindMarkCountV2,
    mindGuardFiveStatMultiplierV2,
    mindObserveProgressV2,`,`    mindMarkCountV2,
    mindGuardFiveStatMultiplierV2,
    mindPassiveBonusesV2,
    mindDirectArmorPenBonusV2,
    mindObserveProgressV2,`);

const oldApply=`    applyDamage(source, target, ctx, now) {
        let authored = ctx;
        if (source?.combatBuildV117?.battleDaoV2Enabled === true && source?.combatBuildV117?.mainDaoId === 'mind' && ctx?.skillId && ctx.fiveStatScalingV5 === undefined) {
            const skill = this.registry.skill(ctx.skillId);
            if (skillRuntimeV117(skill).daoBinding === 'mind' && skill.fiveStatScalingV5) {
                authored = {
                    ...ctx,
                    fiveStatScalingV5: skill.fiveStatScalingV5,
                    fiveStatBaselineCoefficientV5: skill.fiveStatBaselineCoefficientV5,
                };
            }
        }
        return super.applyDamage(source, target, authored, now);
    }
`;
const newApply=`    applyDamage(source, target, ctx, now) {
        let authored = ctx;
        let mindSkill;
        if (source?.combatBuildV117?.battleDaoV2Enabled === true && source?.combatBuildV117?.mainDaoId === 'mind' && ctx?.skillId) {
            mindSkill = this.registry.skill(ctx.skillId);
            if (skillRuntimeV117(mindSkill).daoBinding === 'mind' && mindSkill.fiveStatScalingV5 && ctx.fiveStatScalingV5 === undefined) {
                authored = {
                    ...ctx,
                    fiveStatScalingV5: mindSkill.fiveStatScalingV5,
                    fiveStatBaselineCoefficientV5: mindSkill.fiveStatBaselineCoefficientV5,
                };
            }
        }
        const directMind = Boolean(mindSkill)
            && skillRuntimeV117(mindSkill).daoBinding === 'mind'
            && (authored.sourceTag === 'ActiveHit' || authored.sourceTag === 'Counter');
        if (!directMind)
            return super.applyDamage(source, target, authored, now);
        const passive = mindPassiveBonusesV2(source, now);
        const armorPen = mindDirectArmorPenBonusV2(source, target, authored.mindRootActionV2, now);
        if (armorPen > 0)
            authored = { ...authored, runtimeArmorPenBonusPct: Math.max(0, Number(authored.runtimeArmorPenBonusPct ?? 0)) + armorPen };
        source.pendingSetFlagsV117 ??= {};
        const hadAccuracy = Object.prototype.hasOwnProperty.call(source.pendingSetFlagsV117, 'mindV2ActionAccuracyPct');
        const previousAccuracy = source.pendingSetFlagsV117.mindV2ActionAccuracyPct;
        source.pendingSetFlagsV117.mindV2ActionAccuracyPct = passive.accuracyPct;
        try {
            return super.applyDamage(source, target, authored, now);
        }
        finally {
            if (hadAccuracy)
                source.pendingSetFlagsV117.mindV2ActionAccuracyPct = previousAccuracy;
            else
                delete source.pendingSetFlagsV117.mindV2ActionAccuracyPct;
        }
    }

    applyStatus(source, target, statusId, baseDuration, stacks, now, skillId) {
        let skill;
        try { skill = skillId ? this.registry.skill(skillId) : undefined; }
        catch { skill = undefined; }
        if (!isMainMindSkillV2(source, skill))
            return super.applyStatus(source, target, statusId, baseDuration, stacks, now, skillId);
        const passive = mindPassiveBonusesV2(source, now);
        source.pendingSetFlagsV117 ??= {};
        const hadControl = Object.prototype.hasOwnProperty.call(source.pendingSetFlagsV117, 'mindV2ActionControlPowerPct');
        const previousControl = source.pendingSetFlagsV117.mindV2ActionControlPowerPct;
        source.pendingSetFlagsV117.mindV2ActionControlPowerPct = passive.controlPowerPct;
        try {
            return super.applyStatus(source, target, statusId, baseDuration, stacks, now, skillId);
        }
        finally {
            if (hadControl)
                source.pendingSetFlagsV117.mindV2ActionControlPowerPct = previousControl;
            else
                delete source.pendingSetFlagsV117.mindV2ActionControlPowerPct;
        }
    }
`;
combat=once(combat,'action-local Mind stat wrapper',oldApply,newApply);

combat=once(combat,'attach root action to direct packet context',`        const ctx = super.damageContextFromEffect(source, effect, defaultSourceTag, skill, skillId, cooldownDamageBonusPct, runtimeAction);
        captureMindDamagePacketV2(source, skill, runtimeAction, ctx);`,`        const ctx = super.damageContextFromEffect(source, effect, defaultSourceTag, skill, skillId, cooldownDamageBonusPct, runtimeAction);
        if (isMainMindSkillV2(source, skill) && runtimeAction?.battleDaoV2)
            ctx.mindRootActionV2 = runtimeAction;
        captureMindDamagePacketV2(source, skill, runtimeAction, ctx);`);

combat=once(combat,'attach root action to consume packet',`            runtimeBreakBonusPct: Math.max(0, runtimeAction?.breakBonusPct ?? 0),
        };
        captureMindDamagePacketV2(source, skill, runtimeAction, ctx);`,`            runtimeBreakBonusPct: Math.max(0, runtimeAction?.breakBonusPct ?? 0),
            mindRootActionV2: runtimeAction,
        };
        captureMindDamagePacketV2(source, skill, runtimeAction, ctx);`);

combat=once(combat,'P6 echo Break effectiveness',`        const sourceSkill = this.registry.skill(follow.sourceSkillId);
        const echoCoefficient = Math.max(0, Math.min(.70, Number(follow.coefficient ?? 0)));
        let damage = 0;`,`        const sourceSkill = this.registry.skill(follow.sourceSkillId);
        const echoCoefficient = Math.max(0, Math.min(.70, Number(follow.coefficient ?? 0)));
        const echoBreakPct = mindPassiveBonusesV2(actor, now).echoBreakPct;
        let damage = 0;`);
combat=once(combat,'apply P6 echo Break',`                    breakDamagePct: Math.max(0, Number(packet.breakDamagePct ?? 0)) * echoCoefficient,`,`                    breakDamagePct: Math.max(0, Number(packet.breakDamagePct ?? 0)) * echoCoefficient * (1 + echoBreakPct / 100),`);
write(combatPath,combat);

// ---------------------------------------------------------------------------
// 6) Phase status: M2A is closed; M2B is the live implementation phase.
// ---------------------------------------------------------------------------
const contractPath='docs/runtime/MIND_DAO_PRODUCTION_CONTRACT_20260929.md';
let contract=read(contractPath);
contract=once(contract,'M2B contract status','Status: **M1 CLOSED / M2A OPEN — FIVE-STAT MIGRATION IN IMPLEMENTATION; PRODUCTION TUNING NOT AUTHORIZED**','Status: **M2A CLOSED / M2B OPEN — PASSIVE + MASTERY ARCHITECTURE IN IMPLEMENTATION; PRODUCTION TUNING NOT AUTHORIZED**');
write(contractPath,contract);

const contractTestPath='qa/tests/mind-dao-production-contract-test.js';
let contractTest=read(contractTestPath);
contractTest=once(contractTest,'M2B contract test status','assert.match(contract,/M1 CLOSED \\/ M2A OPEN/);','assert.match(contract,/M2A CLOSED \\/ M2B OPEN/);');
write(contractTestPath,contractTest);

console.log('MIND M2B PASSIVE GUARDED PATCH: APPLIED');
