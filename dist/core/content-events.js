export function createContentEventRuntimeState() {
    return { completedEventIds: [], choicesByEventId: {} };
}
export function cloneContentEventRuntimeState(state) {
    return {
        completedEventIds: [...new Set(state?.completedEventIds ?? [])],
        choicesByEventId: { ...(state?.choicesByEventId ?? {}) },
    };
}
//# sourceMappingURL=content-events.js.map