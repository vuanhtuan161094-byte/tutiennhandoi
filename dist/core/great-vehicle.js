const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, v));
export function greatVehicleSummary(realm, integration, dao, factions, lifeId) {
    if (realm.maxRealmOrder < 38)
        return { awakened: false, daoAuthority: 0, integration: 0, worldInfluence: 0, personalInfluence: 0, factionBonus: 0, domainScale: 0, bottleneck: 'none' };
    const main = dao.mainDaoId ? dao.known[dao.mainDaoId] : undefined;
    const daoAuthority = clamp((main?.depth ?? 0) * 0.72 + (main?.marks ?? 0) * 3.2 + (dao.domain.active ? 14 : 0));
    const integrationScore = clamp(integration.harmony);
    const membership = lifeId ? Object.values(factions.playerMemberships).find(m => m.lifeId === lifeId && m.active) : undefined;
    const faction = membership ? factions.factions[membership.factionId] : undefined;
    const stages = Math.max(0, realm.maxRealmOrder - 38);
    // Cá Nhân Chứng Đạo: world influence is earned primarily from realm + Dao + integration.
    // Faction is an optional accelerator, never the gate that decides whether Đại Thừa can mature.
    const personalInfluence = clamp(30 + stages * 11 + daoAuthority * 0.24 + integrationScore * 0.20);
    const factionBonus = faction ? Math.min(9, faction.prestige * 0.025 + membership.lifetimeContribution / 1400) : 0;
    const worldInfluence = clamp(personalInfluence + factionBonus);
    const domainScale = clamp(20 + stages * 12 + daoAuthority * 0.36 + integrationScore * 0.24 + personalInfluence * 0.06, 0, 100);
    const entries = [['dao', daoAuthority], ['integration', integrationScore], ['influence', worldInfluence]];
    const bottleneck = entries.reduce((a, b) => a[1] <= b[1] ? a : b)[0];
    return { awakened: true, daoAuthority, integration: integrationScore, worldInfluence, personalInfluence, factionBonus, domainScale, bottleneck };
}
export function applyGreatVehicleToEntity(entity, summary) {
    if (!summary.awakened)
        return entity;
    const a = summary.daoAuthority / 100;
    const s = summary.domainScale / 100;
    return {
        ...entity,
        tags: [...new Set([...entity.tags, 'GreatVehicle', 'ExpandedDaoDomain'])],
        stats: {
            ...entity.stats,
            maxSpirit: entity.stats.maxSpirit * (1 + s * 0.08),
            attack: entity.stats.attack * (1 + a * 0.07),
            defense: entity.stats.defense * (1 + s * 0.05),
            resolve: entity.stats.resolve * (1 + s * 0.10),
            controlPower: entity.stats.controlPower * (1 + a * 0.08),
            accuracy: entity.stats.accuracy * (1 + s * 0.04),
        },
    };
}
//# sourceMappingURL=great-vehicle.js.map