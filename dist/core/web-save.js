export function createWebClientSave(api, nowUnixMs = Date.now(), runtime, visual) {
    return { clientSaveVersion: 1, client: 'tutien-web', savedAtUnixMs: nowUnixMs, game: structuredClone(api.exportSave()), ...(runtime ? { runtime: structuredClone(runtime) } : {}), ...(visual ? { visual: structuredClone(visual) } : {}) };
}
export function parseWebClientSave(value) {
    if (!value || typeof value !== 'object')
        throw new Error('Save web không phải object.');
    const candidate = value;
    if (candidate.clientSaveVersion !== 1 || candidate.client !== 'tutien-web' || !Number.isFinite(candidate.savedAtUnixMs) || !candidate.game)
        throw new Error('Save web không đúng định dạng tutien-web v1.');
    return structuredClone(candidate);
}
//# sourceMappingURL=web-save.js.map