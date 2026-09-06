import { categoryDisplayName } from './life.js';

// V141: Vạn Thế archive/projection DTO assembly is isolated from the facade shell.
export function buildMyriadLivesV141() {
        const meta = this.session.meta;
        const currentLife = this.session.currentLife;
        const currentState = this.session.state;
        const archives = meta.archives.slice().sort((a, b) => a.lifeNumber - b.lifeNumber);
        const rewardHistory = meta.reincarnationProgress?.rewardHistory ?? [];
        const rewardByLifeId = new Map(rewardHistory.map(reward => [reward.lifeId, reward]));
        const categoryKeys = ['cultivation', 'combat', 'exploration', 'profession', 'relationships', 'fate'];
        const safeRealmName = (realmId) => {
            try { return this.registry.realm(realmId).name; }
            catch { return realmId || 'Không rõ'; }
        };
        const categoryRows = (settlement) => categoryKeys.map(key => {
            const row = settlement?.categories?.[key] ?? { category: key, score: 0, reasons: [], uniqueMilestones: 0 };
            return { id: key, name: categoryDisplayName(key), score: Number(row.score ?? 0), uniqueMilestones: Number(row.uniqueMilestones ?? 0), reasons: [...(row.reasons ?? [])] };
        });
        const strongest = (rows) => rows.slice().sort((a, b) => b.score - a.score)[0];
        const weakest = (rows) => rows.slice().sort((a, b) => a.score - b.score)[0];
        const archiveDto = (archive, index) => {
            const categories = categoryRows(archive);
            const previous = index > 0 ? archives[index - 1] : undefined;
            const reward = rewardByLifeId.get(archive.lifeId);
            const previousCategories = previous ? Object.fromEntries(categoryRows(previous).map(row => [row.id, row.score])) : {};
            return {
                lifeNumber: archive.lifeNumber,
                lifeId: archive.lifeId,
                ageYears: Number(archive.ageAtDeathYears ?? 0),
                lifespanYears: Number(archive.lifespanYears ?? 0),
                realmId: archive.finalRealmId,
                realmName: safeRealmName(archive.finalRealmId),
                maxRealmOrder: Number(archive.maxRealmOrder ?? 0),
                causeOfDeath: archive.causeOfDeath ?? 'Không rõ',
                totalScore: Number(archive.totalScore ?? 0),
                grade: archive.grade ?? 'D',
                cpEarned: Number(archive.cpEarned ?? 0),
                cp: Number(archive.cpEarned ?? 0),
                mingJiGain: Number(archive.mingJiGain ?? 0),
                mingJi: Number(archive.mingJiGain ?? 0),
                talentPointGain: Number(archive.talentPointGain ?? 0),
                talentPoints: Number(archive.talentPointGain ?? 0),
                reincarnationLegacyXp: Number(archive.reincarnationLegacy?.xp ?? 0),
                reincarnationXp: Number(archive.reincarnationLegacy?.xp ?? 0),
                age: Number(archive.ageAtDeathYears ?? 0),
                cause: archive.causeOfDeath ?? 'Không rõ',
                reincarnationReward: reward ? {
                    reincarnationPoints: Number(reward.reincarnationPoints ?? 0),
                    permanentPotentialGain: Number(reward.permanentPotentialGain ?? 0),
                    energyCost: Number(reward.energyCost ?? 0),
                    depthTier: reward.depthTier,
                    depthStage: reward.depthStage,
                    offenseRatio: Number(reward.offenseRatio ?? 0),
                    survivalRatio: Number(reward.survivalRatio ?? 0),
                } : undefined,
                categories,
                strongestCategory: strongest(categories),
                weakestCategory: weakest(categories),
                deltaVsPrevious: previous ? {
                    totalScore: Number(archive.totalScore ?? 0) - Number(previous.totalScore ?? 0),
                    realmOrder: Number(archive.maxRealmOrder ?? 0) - Number(previous.maxRealmOrder ?? 0),
                    ageYears: Number(archive.ageAtDeathYears ?? 0) - Number(previous.ageAtDeathYears ?? 0),
                    categories: categories.map(row => ({ id: row.id, name: row.name, delta: row.score - Number(previousCategories[row.id] ?? 0) })),
                } : undefined,
                notableStats: { ...(archive.notableStats ?? {}) },
                legacy: archive.legacy?.summary,
                legacyDetail: archive.legacy ? { title: archive.legacy.title, summary: archive.legacy.summary, significance: Number(archive.legacy.significance ?? 0) } : undefined,
                chronicle: (archive.chronicle ?? []).map(entry => ({ ageYears: Number(entry.ageYears ?? 0), worldTimeYears: Number(entry.worldTimeYears ?? 0), text: entry.text, significance: Number(entry.significance ?? 0) })),
            };
        };
        const lives = archives.map(archiveDto);
        const settledCurrent = archives.find(archive => archive.lifeId === currentLife.lifeId);
        const projected = settledCurrent ?? this.session.previewCurrentLifeSettlement();
        const currentCategories = categoryRows(projected);
        const latest = archives.at(-1);
        const latestCategories = latest ? Object.fromEntries(categoryRows(latest).map(row => [row.id, row.score])) : {};
        const currentProjection = {
            lifeNumber: currentLife.lifeNumber,
            lifeId: currentLife.lifeId,
            settled: Boolean(settledCurrent),
            alive: Boolean(currentState.alive),
            ageYears: Number(currentState.ageYears ?? projected.ageAtDeathYears ?? 0),
            realmId: currentState.realm?.realmId ?? projected.finalRealmId,
            realmName: safeRealmName(currentState.realm?.realmId ?? projected.finalRealmId),
            maxRealmOrder: Number(currentState.realm?.maxRealmOrder ?? projected.maxRealmOrder ?? 0),
            totalScore: Number(projected.totalScore ?? 0),
            grade: projected.grade ?? 'D',
            categories: currentCategories,
            strongestCategory: strongest(currentCategories),
            weakestCategory: weakest(currentCategories),
            vsPreviousLife: latest && latest.lifeId !== currentLife.lifeId ? {
                lifeNumber: latest.lifeNumber,
                totalScoreDelta: Number(projected.totalScore ?? 0) - Number(latest.totalScore ?? 0),
                realmOrderDelta: Number(currentState.realm?.maxRealmOrder ?? projected.maxRealmOrder ?? 0) - Number(latest.maxRealmOrder ?? 0),
                categoryDeltas: currentCategories.map(row => ({ id: row.id, name: row.name, current: row.score, previous: Number(latestCategories[row.id] ?? 0), delta: row.score - Number(latestCategories[row.id] ?? 0) })),
            } : undefined,
        };
        const scoreRecord = lives.slice().sort((a, b) => b.totalScore - a.totalScore)[0];
        const realmRecord = lives.slice().sort((a, b) => b.maxRealmOrder - a.maxRealmOrder || b.totalScore - a.totalScore)[0];
        const longevityRecord = lives.slice().sort((a, b) => b.ageYears - a.ageYears)[0];
        const rewardRecord = lives.filter(life => life.reincarnationReward).sort((a, b) => (b.reincarnationReward?.permanentPotentialGain ?? 0) - (a.reincarnationReward?.permanentPotentialGain ?? 0) || (b.reincarnationReward?.reincarnationPoints ?? 0) - (a.reincarnationReward?.reincarnationPoints ?? 0))[0];
        const mingJiRecord = lives.slice().sort((a, b) => b.mingJiGain - a.mingJiGain)[0];
        const reincarnationLegacyRecord = lives.slice().sort((a, b) => b.reincarnationLegacyXp - a.reincarnationLegacyXp)[0];
        const categoryRecords = categoryKeys.map(key => {
            const ranked = lives.map(life => ({ lifeNumber: life.lifeNumber, score: life.categories.find(row => row.id === key)?.score ?? 0 })).sort((a, b) => b.score - a.score);
            return { id: key, name: categoryDisplayName(key), ...(ranked[0] ?? { lifeNumber: 0, score: 0 }) };
        });
        const comparisons = currentProjection.vsPreviousLife?.categoryDeltas ?? [];
        const improving = comparisons.filter(row => row.delta > 0).sort((a, b) => b.delta - a.delta);
        const declining = comparisons.filter(row => row.delta < 0).sort((a, b) => a.delta - b.delta);
        const insights = [];
        if (!archives.length)
            insights.push('Chưa có đời nào được kết toán; Vạn Thế sẽ bắt đầu lưu kỷ lục sau lần Luân Hồi đầu tiên.');
        else {
            if (currentProjection.totalScore > (scoreRecord?.totalScore ?? 0))
                insights.push(`Nếu kết đời ở trạng thái hiện tại, Đời ${currentLife.lifeNumber} đang vượt kỷ lục tổng điểm cũ ${currentProjection.totalScore - scoreRecord.totalScore} điểm.`);
            if (improving[0])
                insights.push(`${improving[0].name} đang tiến bộ rõ nhất so với Đời ${latest?.lifeNumber}: +${improving[0].delta} điểm.`);
            if (declining[0])
                insights.push(`${declining[0].name} đang hụt nhiều nhất so với Đời ${latest?.lifeNumber}: ${declining[0].delta} điểm.`);
            if (currentProjection.weakestCategory)
                insights.push(`Trục thấp nhất của đời hiện tại là ${currentProjection.weakestCategory.name} (${currentProjection.weakestCategory.score}); đây là nút thắt rõ nhất nếu muốn nâng điểm đời toàn diện.`);
        }
        return {
            schema: 'myriad-lives.v101',
            version: 'V101',
            rules: {
                source: 'LifeSettlement archive canonical',
                readOnly: true,
                currentProjectionIsPreview: !settledCurrent,
                noParallelHistory: true,
            },
            // Compatibility aliases kept for TextGameClient / old consumers.
            totalLives: archives.length,
            totalScore: Number(meta.totalLifeScore ?? archives.reduce((sum, archive) => sum + Number(archive.totalScore ?? 0), 0)),
            lifetimeCp: Number(meta.lifetimeCpEarned ?? 0),
            mingJi: Number(meta.mingJi ?? 0),
            reincarnation: this.session.reincarnationSummary(),
            summary: {
                completedLives: archives.length,
                currentLifeNumber: currentLife.lifeNumber,
                totalLifeScore: Number(meta.totalLifeScore ?? archives.reduce((sum, archive) => sum + Number(archive.totalScore ?? 0), 0)),
                lifetimeCpEarned: Number(meta.lifetimeCpEarned ?? 0),
                mingJi: Number(meta.mingJi ?? 0),
                reincarnation: this.session.reincarnationSummary(),
            },
            records: {
                bestScore: scoreRecord ? { lifeNumber: scoreRecord.lifeNumber, value: scoreRecord.totalScore, grade: scoreRecord.grade } : undefined,
                highestRealm: realmRecord ? { lifeNumber: realmRecord.lifeNumber, realmName: realmRecord.realmName, realmId: realmRecord.realmId, order: realmRecord.maxRealmOrder } : undefined,
                longestLife: longevityRecord ? { lifeNumber: longevityRecord.lifeNumber, ageYears: longevityRecord.ageYears } : undefined,
                bestReincarnationReward: rewardRecord ? { lifeNumber: rewardRecord.lifeNumber, permanentPotentialGain: rewardRecord.reincarnationReward.permanentPotentialGain, reincarnationPoints: rewardRecord.reincarnationReward.reincarnationPoints } : undefined,
                bestMingJi: mingJiRecord ? { lifeNumber: mingJiRecord.lifeNumber, value: mingJiRecord.mingJiGain } : undefined,
                bestReincarnation: reincarnationLegacyRecord ? { lifeNumber: reincarnationLegacyRecord.lifeNumber, value: reincarnationLegacyRecord.reincarnationLegacyXp } : undefined,
                categories: categoryRecords,
            },
            currentProjection,
            insights,
            lives,
        };
    
}
