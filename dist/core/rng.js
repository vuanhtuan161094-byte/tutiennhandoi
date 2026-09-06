/** Deterministic xorshift32 RNG. Same seed => same battle. */
export class SeededRng {
    state;
    constructor(seed) {
        this.state = (seed | 0) || 0x6d2b79f5;
    }
    nextUint32() {
        let x = this.state | 0;
        x ^= x << 13;
        x ^= x >>> 17;
        x ^= x << 5;
        this.state = x | 0;
        return x >>> 0;
    }
    next() {
        return this.nextUint32() / 0x100000000;
    }
    chance(pct) {
        if (pct <= 0)
            return false;
        if (pct >= 100)
            return true;
        return this.next() * 100 < pct;
    }
}
//# sourceMappingURL=rng.js.map