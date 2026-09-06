function combatant(map, id) {
    return map[id] ??= {
        entityId: id,
        damageDealt: 0,
        healingDone: 0,
        shieldAbsorbed: 0,
        dodges: 0,
        critEvents: 0,
        controlApplications: 0,
        damageBySkill: {},
        healingBySkill: {},
    };
}
export function analyzeBattle(result) {
    const combatants = {};
    for (const id of Object.keys(result.finalState))
        combatant(combatants, id);
    for (const log of result.logs) {
        if (log.type === 'damage' && log.actorId) {
            const value = Number(log.data?.damage ?? 0);
            const actor = combatant(combatants, log.actorId);
            actor.damageDealt += value;
            if (log.skillId)
                actor.damageBySkill[log.skillId] = (actor.damageBySkill[log.skillId] ?? 0) + value;
        }
        if (log.type === 'heal' && log.actorId) {
            const value = Number(log.data?.heal ?? 0);
            const actor = combatant(combatants, log.actorId);
            actor.healingDone += value;
            if (log.skillId)
                actor.healingBySkill[log.skillId] = (actor.healingBySkill[log.skillId] ?? 0) + value;
        }
        if (log.type === 'shield' && log.targetId && typeof log.data?.absorbed === 'number') {
            combatant(combatants, log.targetId).shieldAbsorbed += log.data.absorbed;
        }
        if (log.type === 'dodge' && log.targetId)
            combatant(combatants, log.targetId).dodges += 1;
        if (log.type === 'crit' && log.actorId)
            combatant(combatants, log.actorId).critEvents += 1;
        if (log.type === 'status' && log.actorId && typeof log.data?.duration === 'number') {
            combatant(combatants, log.actorId).controlApplications += 1;
        }
    }
    return { duration: result.duration, winnerId: result.winnerId, combatants };
}
export function topDamageSkill(analytics, entityId) {
    const entries = Object.entries(analytics.combatants[entityId]?.damageBySkill ?? {});
    if (!entries.length)
        return { damage: 0 };
    const [skillId, damage] = entries.sort((a, b) => b[1] - a[1])[0];
    return { skillId, damage };
}
//# sourceMappingURL=combat-analytics.js.map