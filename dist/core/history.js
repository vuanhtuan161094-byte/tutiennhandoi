export function importanceOf(significance) {
    if (significance >= 70)
        return 'critical';
    if (significance >= 30)
        return 'major';
    if (significance >= 10)
        return 'notable';
    return 'log';
}
export class EventHistory {
    records = [];
    cloneEvent(event) {
        return { ...event, tags: [...event.tags], data: event.data ? { ...event.data } : undefined };
    }
    append(event) {
        this.records.push(this.cloneEvent(event));
    }
    appendMany(events) {
        for (const event of events)
            this.append(event);
    }
    clear() {
        this.records.length = 0;
    }
    all() {
        return this.records.map(event => this.cloneEvent(event));
    }
    size() {
        return this.records.length;
    }
    sliceFrom(start = 0) {
        const from = Math.max(0, Math.min(this.records.length, Math.floor(Number(start) || 0)));
        return this.records.slice(from).map(event => this.cloneEvent(event));
    }
    countTag(tag) {
        let count = 0;
        for (const event of this.records)
            if (event.tags.includes(tag))
                count += 1;
        return count;
    }
    countAnyTag(...tags) {
        const wanted = new Set(tags.filter(Boolean));
        if (wanted.size === 0)
            return 0;
        let count = 0;
        for (const event of this.records) {
            if (event.tags.some(tag => wanted.has(tag)))
                count += 1;
        }
        return count;
    }
    meaningful(minSignificance = 10) {
        return this.records.filter(event => event.significance >= minSignificance).map(event => this.cloneEvent(event));
    }
    top(limit = 12) {
        const n = Math.max(0, Math.floor(Number(limit) || 0));
        if (n <= 0 || this.records.length === 0)
            return [];
        const rank = (a, b) => b.significance - a.significance || a.worldTimeYears - b.worldTimeYears;
        // Journal only needs a tiny top-N window (normally 12). Keep a bounded
        // candidate list instead of cloning/sorting the complete lifetime log.
        const best = [];
        for (const event of this.records) {
            if (best.length < n) {
                best.push(event);
                best.sort(rank);
                continue;
            }
            if (rank(event, best[best.length - 1]) < 0) {
                best[best.length - 1] = event;
                best.sort(rank);
            }
        }
        best.sort((a, b) => a.worldTimeYears - b.worldTimeYears);
        return best.map(event => this.cloneEvent(event));
    }
}
//# sourceMappingURL=history.js.map