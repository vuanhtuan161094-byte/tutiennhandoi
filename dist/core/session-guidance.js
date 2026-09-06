import { normalizeGuidanceAutomationPolicy, recordGuidanceDecision, recommendGuidanceWorkerAssignments } from './guidance.js';

// V141: AI guidance execution loop is isolated from the central session state container.
export function runSessionGuidanceV141(maxWorldYears = 20, maxDecisions = 20) {
        if (!this.stateValue.alive)
            throw new Error('Current life has ended');
        if (!this.stateValue.guidance.enabled)
            throw new Error('Định Hướng AI chưa được bật');
        const startYear = this.stateValue.worldTimeYears;
        const horizon = Math.max(0, maxWorldYears);
        const stepCap = Math.max(1, Math.floor(maxDecisions));
        const steps = [];
        const workerAssignments = [];
        const automation = normalizeGuidanceAutomationPolicy(this.stateValue.guidance.automationPolicy);
        let lastActionSignature = '';
        let consecutiveSameAction = 0;
        const initialMajorEvent = this.availableContentEvents(1)[0];
        if (automation.wakeOnContentEvent && initialMajorEvent && initialMajorEvent.priority >= 90) {
            return { elapsedYears: 0, decisions: 0, wakeReason: 'majorEvent', workerAssignments: [], steps: [], state: this.state };
        }
        for (const recommendation of recommendGuidanceWorkerAssignments(this.stateValue, this.stateValue.guidance, this.world)) {
            try {
                this.assignDungeon(recommendation.workerId, recommendation.dungeonId, recommendation.floor);
                const dungeon = this.world.dungeons[recommendation.dungeonId];
                const summary = `${recommendation.workerId} → ${dungeon.name} tầng ${recommendation.floor}`;
                workerAssignments.push(summary);
                recordGuidanceDecision(this.stateValue.guidance, this.stateValue.worldTimeYears, {
                    action: { type: 'activity', request: { type: 'dungeon', dungeonId: recommendation.dungeonId, floor: recommendation.floor, durationYears: 0 } },
                    score: recommendation.score,
                    summary: `Phân công ${summary}.`,
                    reasons: [recommendation.reason], blockers: [],
                });
            }
            catch {
                // Assignment recommendation can become stale only if state was modified externally between preview and run.
            }
        }
        let wakeReason = 'maxDecisions';
        for (let index = 0; index < stepCap; index++) {
            if (!this.stateValue.alive) {
                wakeReason = 'lifeEnd';
                break;
            }
            const elapsed = this.stateValue.worldTimeYears - startYear;
            if (elapsed >= horizon - 1e-9) {
                wakeReason = 'horizonComplete';
                break;
            }
            const decision = this.previewGuidance();
            const chosen = decision.chosen;
            const signature = JSON.stringify(chosen.action);
            if (signature === lastActionSignature)
                consecutiveSameAction += 1;
            else {
                lastActionSignature = signature;
                consecutiveSameAction = 1;
            }
            if (consecutiveSameAction > automation.maxConsecutiveSameAction) {
                wakeReason = 'policyStop';
                break;
            }
            const beforeAvailableIds = new Set(this.availableContentEvents(6).filter(event => event.priority >= 80).map(event => event.id));
            const beforeYear = this.stateValue.worldTimeYears;
            const beforeHistoryCount = this.historyValue.size();
            let resultSummary = '';
            let forcedWake;
            if (chosen.blockers.length > 0) {
                resultSummary = `AI dừng: ${chosen.blockers.join(' ')}`;
                recordGuidanceDecision(this.stateValue.guidance, this.stateValue.worldTimeYears, chosen);
                steps.push({ index, worldYearBefore: beforeYear, worldYearAfter: beforeYear, decision, resultSummary, significantEvents: [] });
                wakeReason = chosen.blockers.includes('automationSafety') ? 'policyStop' : 'blocked';
                break;
            }
            if (chosen.action.type === 'none') {
                resultSummary = chosen.summary;
                recordGuidanceDecision(this.stateValue.guidance, this.stateValue.worldTimeYears, chosen);
                steps.push({ index, worldYearBefore: beforeYear, worldYearAfter: beforeYear, decision, resultSummary, significantEvents: [] });
                wakeReason = 'noAction';
                break;
            }
            try {
                const remainingHorizon = Math.max(0, horizon - (this.stateValue.worldTimeYears - startYear));
                switch (chosen.action.type) {
                    case 'activity': {
                        const request = { ...chosen.action.request, durationYears: Math.min(chosen.action.request.durationYears, remainingHorizon) };
                        if (request.durationYears <= 1e-9) {
                            forcedWake = 'horizonComplete';
                            resultSummary = 'Đã chạm giới hạn thời gian Định Hướng.';
                            break;
                        }
                        const report = this.execute(request);
                        resultSummary = report.summaryLines.join(' ');
                        if (report.stopReason === 'combatDefeat')
                            forcedWake = 'combatDefeat';
                        if (!this.stateValue.alive)
                            forcedWake = 'lifeEnd';
                        break;
                    }
                    case 'retreat': {
                        const report = this.instantRetreatV140(chosen.action.realHours ?? 3);
                        resultSummary = report.event?.message ?? `Bế Quan · Tu Vi +${report.gained.toFixed(0)}.`;
                        break;
                    }
                    case 'ascendRealm': {
                        const report = this.ascendRealmV140();
                        resultSummary = report.event?.message ?? 'Thăng Cảnh thành công.';
                        forcedWake = 'ascension';
                        break;
                    }
                    case 'tribulation': {
                        const report = this.attemptHeavenlyTribulation();
                        resultSummary = report?.event?.message ?? 'Thiên Kiếp đã được xử lý.';
                        forcedWake = 'tribulation';
                        break;
                    }
                    case 'challengeDungeon': {
                        const report = this.challengeDungeonFloor(chosen.action.dungeonId, chosen.action.floor);
                        resultSummary = `${report.guardianName}: ${report.won ? 'thắng' : 'thua'} sau ${report.battleDuration.toFixed(1)}s${report.firstClear ? ' · FIRST CLEAR' : ''}.`;
                        if (!report.won)
                            forcedWake = 'combatDefeat';
                        else if (report.firstClear)
                            forcedWake = 'majorEvent';
                        break;
                    }
                    case 'craft': {
                        const report = this.craftProfession(chosen.action.recipeId, chosen.action.quantity);
                        resultSummary = `${this.registry.professionRecipe(chosen.action.recipeId).name}: ${report.result.successes}/${report.result.attempts} thành công.`;
                        if (report.result.unlockedRecipeIds.length > 0)
                            forcedWake = 'majorEvent';
                        break;
                    }
                    case 'marketSell': {
                        const report = this.sellMarketResource(chosen.action.marketId, chosen.action.resourceId, chosen.action.quantity);
                        resultSummary = `Bán ${report.transaction.quantity} đơn vị, nhận ${report.transaction.totalSpiritStones} Linh Thạch.`;
                        break;
                    }
                    case 'marketBuy': {
                        const report = this.buyMarketResource(chosen.action.marketId, chosen.action.resourceId, chosen.action.quantity);
                        resultSummary = `Mua ${report.transaction.quantity} đơn vị, tiêu ${report.transaction.totalSpiritStones} Linh Thạch.`;
                        break;
                    }
                    case 'factionContribute': {
                        const report = this.contributeToFaction(chosen.action.resourceId, chosen.action.quantity);
                        resultSummary = `Cống hiến ${report.quantity} ${report.resourceId}; công đức +${report.meritGained.toFixed(0)}.`;
                        break;
                    }
                }
            }
            catch (error) {
                resultSummary = `AI dừng vì action không còn hợp lệ: ${error instanceof Error ? error.message : String(error)}`;
                forcedWake = 'blocked';
            }
            recordGuidanceDecision(this.stateValue.guidance, beforeYear, chosen);
            const newHistory = this.historyValue.sliceFrom(beforeHistoryCount);
            const significantEvents = newHistory.filter(event => event.significance >= 20).map(event => event.message).slice(0, 5);
            if (!forcedWake && automation.wakeOnContentEvent) {
                const newly = this.availableContentEvents(6).find(event => event.priority >= 80 && !beforeAvailableIds.has(event.id));
                if (newly) {
                    significantEvents.unshift(`Cơ duyên mới: ${newly.title}`);
                    forcedWake = 'majorEvent';
                }
            }
            steps.push({ index, worldYearBefore: beforeYear, worldYearAfter: this.stateValue.worldTimeYears, decision, resultSummary, significantEvents });
            if (!forcedWake && this.stateValue.guidance.stopOnMajorEvent && newHistory.some(event => event.significance >= 30))
                forcedWake = 'majorEvent';
            if (forcedWake) {
                wakeReason = forcedWake;
                break;
            }
            if (this.stateValue.worldTimeYears - startYear >= horizon - 1e-9) {
                wakeReason = 'horizonComplete';
                break;
            }
        }
        if (steps.length >= stepCap && wakeReason === 'maxDecisions')
            wakeReason = 'maxDecisions';
        return { elapsedYears: this.stateValue.worldTimeYears - startYear, decisions: steps.length, wakeReason, workerAssignments, steps, state: this.state };
    
}
