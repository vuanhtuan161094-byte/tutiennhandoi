import { CombatEngine } from './combat.js';
import { prepareBossGameplayV2 } from './boss-gameplay-v2.js';
import { analyzeBattle } from './combat-analytics.js';
const CRITICAL = new Set([
    'boss.phase_entered',
    'boss.counter_opened',
    'boss.counter_succeeded',
    'boss.counter_failed',
    'entity.defeated',
    'battle.ended',
]);
const ACTION = new Set([
    'action.cast_started',
    'action.resolved',
    'hit.missed',
    'hit.heart',
    'hit.critical',
    'damage.applied',
    'heal.applied',
    'shield.applied',
    'shield.absorbed',
    'shield.broken',
    'break.changed',
    'trigger.fired',
]);

function importanceFor(type) {
    return CRITICAL.has(type) ? 'CRITICAL' : ACTION.has(type) ? 'ACTION' : 'DETAIL';
}

function typedName(log) {
    if (log.type === 'battleStart') return 'battle.started';
    if (log.type === 'castStart') return 'action.cast_started';
    if (log.type === 'skillResolve') return 'action.resolved';
    if (log.type === 'dodge') return 'hit.missed';
    if (log.type === 'heart') return 'hit.heart';
    if (log.type === 'crit') return 'hit.critical';
    if (log.type === 'damage') return 'damage.applied';
    if (log.type === 'heal') return 'heal.applied';
    if (log.type === 'shieldBreak') return 'shield.broken';
    if (log.type === 'shield') return typeof log.data?.absorbed === 'number' ? 'shield.absorbed' : 'shield.applied';
    if (log.type === 'status') return log.data?.immune === true ? 'status.resisted' : 'status.applied';
    if (log.type === 'info' && typeof log.data?.removed === 'number') return 'status.removed';
    if (log.type === 'resource') return 'resource.changed';
    if (log.type === 'break') return 'break.changed';
    if (log.type === 'phase') return 'boss.phase_entered';
    if (log.type === 'counterWindow') {
        if (log.data?.opens === true) return 'boss.counter_opened';
        if (log.data?.success === true) return 'boss.counter_succeeded';
        if (log.data?.failure === true) return 'boss.counter_failed';
        return 'boss.counter_progressed';
    }
    if (log.type === 'trigger') return 'trigger.fired';
    if (log.type === 'death') return 'entity.defeated';
    if (log.type === 'battleEnd') return 'battle.ended';
    if (log.type === 'channel') return 'action.channel_changed';
    if (log.type === 'reaction') return 'effect.reaction';
    if (log.type === 'mark') return 'effect.mark_changed';
    return 'combat.info';
}

function animationTagFor(log, type, registry) {
    if (type === 'entity.defeated') return 'death';
    if (type === 'heal.applied') return 'heal';
    if (type === 'shield.applied' || type === 'shield.absorbed') return 'shield';
    if (type === 'shield.broken') return 'shield_break';
    if (type === 'break.changed' && log.data?.broken === true) return 'break';
    if (type === 'hit.missed') return 'dodge';
    if (type.startsWith('boss.counter_')) return 'boss_counter';
    if (type === 'boss.phase_entered') return 'boss_phase';
    const skillId = log.skillId;
    if (!skillId || !registry?.skills?.has(skillId)) return undefined;
    const skill = registry.skill(skillId);
    const tags = new Set(skill.tags ?? []);
    if (skill.channel) return 'channel';
    if (tags.has('BossUltimate')) return 'boss_ultimate';
    if (tags.has('Heal') || tags.has('Sustain')) return 'heal';
    if (tags.has('Shield') || tags.has('Guard')) return 'shield';
    if (tags.has('Sword')) return tags.has('Heavy') || tags.has('Finisher') ? 'sword_finisher' : 'sword_slash';
    if (tags.has('Heavy')) return 'melee_heavy';
    if (tags.has('Spell')) return 'ranged_spell';
    if (tags.has('Basic')) return 'melee_light';
    return 'skill';
}

function isRetiredPlayerFacingResource(log) {
    return log.type === 'resource'
        && log.data?.artifactRuntime === 'artifact.v88'
        && log.data?.artifactEvent === 'baoQi';
}

function sanitizePlayerFacingData(data) {
    const clean = structuredClone(data ?? {});
    // V150 retired Bảo Khí as a live player resource. Artifact trigger/cooldown
    // events remain valid, but their compatibility-only Bảo Khí bookkeeping
    // must never enter the typed Godot-facing contract.
    delete clean.baoQi;
    delete clean.baoQiMax;
    delete clean.baoQiCost;
    delete clean.baoQiGain;
    return clean;
}

function countByActor(events, type) {
    const out = {};
    for (const event of events) {
        if (event.type !== type || !event.actorId) continue;
        out[event.actorId] = (out[event.actorId] ?? 0) + 1;
    }
    return out;
}

function castCounts(events) {
    const byActor = {};
    for (const event of events) {
        if (event.type !== 'action.cast_started' || !event.actorId || !event.skillId) continue;
        const actor = byActor[event.actorId] ??= {};
        actor[event.skillId] = (actor[event.skillId] ?? 0) + 1;
    }
    return byActor;
}

function numericActorMap(analytics, field) {
    return Object.fromEntries(Object.entries(analytics.combatants).map(([id, row]) => [id, Number(row[field] ?? 0)]));
}

/**
 * Final typed adapter shared by V2 now and V3 later.
 * Raw human-readable logs remain compatibility/debug only and are not required
 * by this contract.
 */
export function buildCombatResultV1(input) {
    const { battle, registry } = input;
    if (!battle)
        throw new Error('CombatResultV1 requires a battle');
    const maxDuration = Number(input.maxDuration ?? battle.duration);
    const actionSeq = {};
    const activeAction = {};
    const events = [];

    for (let index = 0; index < battle.logs.length; index += 1) {
        const log = battle.logs[index];
        if (isRetiredPlayerFacingResource(log))
            continue;
        const type = typedName(log);
        let actionId;
        if (log.type === 'castStart' && log.actorId) {
            const seq = (actionSeq[log.actorId] ?? 0) + 1;
            actionSeq[log.actorId] = seq;
            actionId = `${log.actorId}.action.${seq}`;
            activeAction[log.actorId] = { id: actionId, skillId: log.skillId };
        }
        else if (log.actorId && log.skillId && activeAction[log.actorId]?.skillId === log.skillId) {
            actionId = activeAction[log.actorId].id;
        }

        const data = sanitizePlayerFacingData(log.data);
        const event = {
            schema: 'combat-event.v1',
            id: `combat-event.v1.${index}`,
            sequence: index,
            time: Number(log.time ?? 0),
            type,
            importance: importanceFor(type),
            actorId: log.actorId,
            targetId: log.targetId,
            skillId: log.skillId,
            actionId,
            animationTag: animationTagFor(log, type, registry),
            data,
            message: String(log.message ?? ''),
        };
        if (type === 'action.cast_started') {
            event.startedAt = event.time;
            event.resolvedAt = event.time + Math.max(0, Number(data.castTime ?? 0));
            event.impactAt = event.resolvedAt;
        }
        else if (type === 'action.resolved') {
            event.resolvedAt = event.time;
            event.impactAt = event.time;
        }
        else if (['damage.applied', 'heal.applied', 'shield.applied', 'shield.absorbed', 'shield.broken', 'hit.missed', 'hit.heart', 'hit.critical', 'break.changed'].includes(type)) {
            event.impactAt = event.time;
        }
        events.push(event);
    }

    const analytics = analyzeBattle(battle);
    const phases = events.filter(event => event.type === 'boss.phase_entered').map(event => ({
        time: event.time,
        actorId: event.actorId,
        targetId: event.targetId,
        phaseId: String(event.data.phaseId ?? ''),
        phaseName: String(event.data.phaseName ?? ''),
        hpPct: Number(event.data.hpPct ?? 0),
    }));
    const counters = events.filter(event => event.type.startsWith('boss.counter_')).map(event => ({
        time: event.time,
        type: event.type,
        actorId: event.actorId,
        targetId: event.targetId,
        skillId: event.skillId,
        counterWindowId: String(event.data.counterWindowId ?? ''),
        counterWindowName: String(event.data.counterWindowName ?? ''),
        progress: Number(event.data.progress ?? 0),
        required: Number(event.data.required ?? 0),
    }));

    const livingCount = Object.values(battle.finalState ?? {}).filter(state => state?.alive === true).length;
    const timedOut = Boolean(battle.draw)
        && livingCount > 1
        && Number.isFinite(maxDuration)
        && Number(battle.duration) >= maxDuration - 1e-9;
    const outcome = battle.draw ? (timedOut ? 'timeout' : 'draw') : 'victory';
    const result = {
        schema: 'combat-result.v1',
        engineVersion: String(input.engineVersion ?? 'combat.v2'),
        seed: Number(battle.seed) >>> 0,
        outcome,
        duration: Number(battle.duration ?? 0),
        maxDuration,
        timedOut,
        draw: Boolean(battle.draw),
        winnerId: battle.winnerId,
        loserId: battle.loserId,
        finalState: structuredClone(battle.finalState ?? {}),
        events,
        summary: {
            castCountsByActor: castCounts(events),
            damageByActor: numericActorMap(analytics, 'damageDealt'),
            damageBySkillByActor: Object.fromEntries(Object.entries(analytics.combatants).map(([id, row]) => [id, { ...(row.damageBySkill ?? {}) }])),
            healingByActor: numericActorMap(analytics, 'healingDone'),
            healingBySkillByActor: Object.fromEntries(Object.entries(analytics.combatants).map(([id, row]) => [id, { ...(row.healingBySkill ?? {}) }])),
            shieldAbsorbedByActor: numericActorMap(analytics, 'shieldAbsorbed'),
            dodgesByActor: numericActorMap(analytics, 'dodges'),
            critEventsByActor: numericActorMap(analytics, 'critEvents'),
            heartEventsByActor: countByActor(events, 'hit.heart'),
            phaseTransitions: phases,
            counterWindows: counters,
        },
        replay: {
            engineVersion: String(input.engineVersion ?? 'combat.v2'),
            seed: Number(battle.seed) >>> 0,
        },
    };

    const ended = events.findLast?.(event => event.type === 'battle.ended')
        ?? [...events].reverse().find(event => event.type === 'battle.ended');
    if (ended) {
        ended.data = {
            ...ended.data,
            outcome: result.outcome,
            winnerId: result.winnerId,
            loserId: result.loserId,
            draw: result.draw,
            timedOut: result.timedOut,
            duration: result.duration,
        };
    }
    return result;
}

export class CombatKernelV2 {
    run(input) {
        const entities = input.entities.map(entity => prepareBossGameplayV2(entity));
        const engine = new CombatEngine(input.registry, input.seed, entities);
        const maxDuration = input.maxDuration ?? 120;
        const battle = engine.run(maxDuration);
        const combatResult = buildCombatResultV1({
            battle,
            registry: input.registry,
            maxDuration,
            engineVersion: 'combat.v2',
        });
        return {
            mode: input.mode,
            battle,
            combatResult,
            presentationPolicy: input.mode === 'realtime' ? 'timeline-1to1' : 'none',
        };
    }
}
export function runCombatKernelV2(input) {
    return new CombatKernelV2().run(input);
}
/** Stable mechanics projection used by parity gates. Mode/presentation metadata is intentionally excluded. */
export function combatKernelMechanicsProjectionV2(result) {
    return {
        seed: result.seed,
        duration: result.duration,
        winnerId: result.winnerId,
        loserId: result.loserId,
        draw: result.draw,
        logs: result.logs,
        finalState: result.finalState,
    };
}
//# sourceMappingURL=combat-kernel-v2.js.map