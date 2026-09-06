export const WORKSHOP_PRODUCTION_SCHEMA_V12328 = 'workshop-production.v12328';
function emptyGear() { return { claw: 0, armor: 0, charm: 0 }; }
export function ensureWorkshopProductionV12328(state) {
    const host = state;
    const w = host.workshopV12328 ?? (host.workshopV12328 = { schema: WORKSHOP_PRODUCTION_SCHEMA_V12328, petGear: {}, forgeQueues: [], forgeSerial: 0 });
    w.schema = WORKSHOP_PRODUCTION_SCHEMA_V12328;
    w.petGear ??= {};
    w.forgeQueues ??= [];
    w.forgeSerial = Math.max(0, Math.floor(w.forgeSerial ?? 0));
    return w;
}
export function cloneWorkshopProductionV12328(value) {
    if (!value)
        return undefined;
    return { schema: WORKSHOP_PRODUCTION_SCHEMA_V12328, petGear: Object.fromEntries(Object.entries(value.petGear ?? {}).map(([id, g]) => [id, { claw: Math.max(0, Math.floor(g?.claw ?? 0)), armor: Math.max(0, Math.floor(g?.armor ?? 0)), charm: Math.max(0, Math.floor(g?.charm ?? 0)) }])), forgeQueues: (value.forgeQueues ?? []).map((q) => ({ ...q, selections: (q.selections ?? []).map((x) => ({ ...x })), reserved: (q.reserved ?? []).map((x) => ({ ...x })) })), forgeSerial: Math.max(0, Math.floor(value.forgeSerial ?? 0)) };
}
export function petGearProgressV12328(state, petId) {
    const w = ensureWorkshopProductionV12328(state);
    return w.petGear[petId] ?? (w.petGear[petId] = emptyGear());
}
export function petGearLimitV12328(state) { const lv = state.cave.facilities.find(x => x.id === 'beast')?.level ?? 1; return Math.min(20, 4 + lv * 2); }
export function petGearUpgradeCostV12328(level) { return Math.max(8, 12 + Math.max(0, Math.floor(level)) * 6); }
export function upgradePetGearV12328(_state, _petId, _slot) {
    throw new Error('Trang Bị Linh Thú đã được hoàn nguyên ở V86. Linh Thú nay chỉ dùng Cấp + Huyết Mạch để tránh chồng tầng progression.');
}
export function petGearCombatMultiplierV12328(_state, _petId) { return 1; }
export function workshopProductionSummaryV12328(state) {
    const w = ensureWorkshopProductionV12328(state);
    return { schema: WORKSHOP_PRODUCTION_SCHEMA_V12328, petGearRetiredV86: true, petGearRefunded: Boolean(state.spiritBeastV86Migrated), petGearLimit: 0, petGear: {}, forgeQueues: w.forgeQueues.map(q => ({ ...q, selections: q.selections.map(x => ({ ...x })), reserved: q.reserved.map(x => ({ ...x })) })), forgeSlots: forgeQueueSlotsV12328(state) };
}
export function forgeQueueSlotsV12328(state) { const lv = state.cave.facilities.find(x => x.id === 'forge')?.level ?? 1; return Math.min(4, 1 + Math.floor((lv - 1) / 3)); }
export function reserveForgeQueueV12328(state, inventory, recipe, realSeconds, nowUnixMs = Date.now(), selections = []) { const w = ensureWorkshopProductionV12328(state), slots = forgeQueueSlotsV12328(state); if (w.forgeQueues.length >= slots)
    throw new Error(`Luyện Khí đang đầy hàng chờ (${w.forgeQueues.length}/${slots}).`); const selected = new Map(selections.map(x => [x.requirementId, x.resourceId])); const available = { ...inventory }; const chosen = [], reserved = []; for (const req of recipe.ingredients) {
    const wanted = selected.get(req.id);
    const options = wanted ? req.options.filter(x => x.resourceId === wanted) : [...req.options].sort((a, b) => (b.qualityModifier ?? 0) - (a.qualityModifier ?? 0));
    const option = options.find(x => (available[x.resourceId] ?? 0) >= x.quantity);
    if (!option)
        throw new Error(`Thiếu nguyên liệu: ${req.name}.`);
    chosen.push({ requirementId: req.id, resourceId: option.resourceId });
    reserved.push({ resourceId: option.resourceId, quantity: option.quantity });
    available[option.resourceId] = (available[option.resourceId] ?? 0) - option.quantity;
} for (const r of reserved)
    inventory[r.resourceId] = (inventory[r.resourceId] ?? 0) - r.quantity; const job = { id: `forge.v2328.${++w.forgeSerial}`, recipeId: recipe.id, startedAtUnixMs: nowUnixMs, completesAtUnixMs: nowUnixMs + Math.max(1, realSeconds) * 1000, durationRealSeconds: Math.max(1, realSeconds), selections: chosen, reserved }; w.forgeQueues.push(job); return { ...job, selections: job.selections.map(x => ({ ...x })), reserved: job.reserved.map(x => ({ ...x })) }; }
export function readyForgeQueuesV12328(state, nowUnixMs = Date.now()) { const w = ensureWorkshopProductionV12328(state); return w.forgeQueues.filter(q => q.completesAtUnixMs <= nowUnixMs).map(q => ({ ...q, selections: q.selections.map(x => ({ ...x })), reserved: q.reserved.map(x => ({ ...x })) })); }
export function removeForgeQueueV12328(state, id) { const w = ensureWorkshopProductionV12328(state); w.forgeQueues = w.forgeQueues.filter(q => q.id !== id); }
//# sourceMappingURL=workshop-production-v12328.js.map