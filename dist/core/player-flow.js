import { cloneContentEventRuntimeState, createContentEventRuntimeState } from './content-events.js';
export function createFirstLifeStoryState(completedBeatIds = [], path) {
    return { completedBeatIds: [...new Set(completedBeatIds)], path };
}
export function createPlayerFlowState() {
    return { firstLifeStory: createFirstLifeStoryState(), contentEvents: createContentEventRuntimeState() };
}
export function clonePlayerFlowState(state) {
    if (!state)
        return createPlayerFlowState();
    const anchor = Number(state.offlineLastResolvedUnixMsV169);
    return {
        offlineRoutine: state.offlineRoutine
            ? {
                ...state.offlineRoutine,
                request: { ...state.offlineRoutine.request },
            }
            : undefined,
        ...(Number.isFinite(anchor) && anchor >= 0 ? { offlineLastResolvedUnixMsV169: anchor } : {}),
        firstLifeStory: createFirstLifeStoryState(state.firstLifeStory?.completedBeatIds ?? [], state.firstLifeStory?.path),
        contentEvents: cloneContentEventRuntimeState(state.contentEvents),
    };
}
export function hasFirstLifeBeat(state, beatId) {
    return Boolean(state?.firstLifeStory?.completedBeatIds.includes(beatId));
}
export function completeFirstLifeBeat(state, beatId) {
    if (!state.firstLifeStory.completedBeatIds.includes(beatId))
        state.firstLifeStory.completedBeatIds.push(beatId);
}
//# sourceMappingURL=player-flow.js.map