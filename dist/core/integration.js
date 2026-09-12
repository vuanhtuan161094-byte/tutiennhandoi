function clamp(v, min = 0, max = 100) { return Math.max(min, Math.min(max, v)); }
export function integrationSummary(realm, injury, soul, dao, artifacts) {
    if (realm.maxRealmOrder < 34)
        return { awakened: false, body: 0, soul: 0, dao: 0, artifact: 0, harmony: 0, bottleneck: 'none' };
    const body = clamp(100 - Math.max(0, Number(injury) || 0));
    const soulScore = clamp((clamp(soul.strength / 3.2) + soul.purity + soul.stability) / 3);
    const main = dao.mainDaoId ? dao.known[dao.mainDaoId] : undefined;
    const daoScore = clamp((main?.depth ?? 0) * 0.78 + (main?.marks ?? 0) * 2.2 + (dao.domain.active ? 12 : 0));
    // V168 authority: legacy ArtifactState is compatibility/history only. Canonical Pháp Bảo/Chí Bảo
    // combat power is already applied through Collection before Integration, so old activeIds/items must
    // not become a second stat source here. Keep the historical no-active baseline for Integration balance.
    const artifactScore = 52;
    const entries = [['body', body], ['soul', soulScore], ['dao', daoScore], ['artifact', artifactScore]];
    const lowest = entries.reduce((a, b) => a[1] <= b[1] ? a : b);
    const avg = entries.reduce((s, x) => s + x[1], 0) / entries.length;
    // Harmony rewards balance: the weakest component matters as much as the average.
    const harmony = clamp(lowest[1] * 0.52 + avg * 0.48);
    return { awakened: true, body, soul: soulScore, dao: daoScore, artifact: artifactScore, harmony, bottleneck: lowest[0] };
}
export function applyIntegrationToEntity(entity, summary) {
    if (!summary.awakened)
        return entity;
    const h = summary.harmony / 100;
    const core = 1 + h * 0.10;
    const sustain = 1 + h * 0.08;
    return {
        ...entity,
        tags: [...new Set([...entity.tags, 'BodySoulDaoIntegration'])],
        stats: {
            ...entity.stats,
            maxHp: entity.stats.maxHp * sustain,
            maxSpirit: entity.stats.maxSpirit * sustain,
            attack: entity.stats.attack * core,
            defense: entity.stats.defense * core,
            resolve: entity.stats.resolve * (1 + h * 0.12),
            controlPower: entity.stats.controlPower * (1 + h * 0.06),
            accuracy: entity.stats.accuracy * (1 + h * 0.04),
        },
    };
}
//# sourceMappingURL=integration.js.map