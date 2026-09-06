function alphaSuffix(index) {
    // index 0 => aa, 25 => az, 26 => ba, 675 => zz, 676 => aaa.
    let n = Math.max(0, Math.floor(index));
    let length = 2;
    let block = 26 ** length;
    while (n >= block) {
        n -= block;
        length += 1;
        block = 26 ** length;
    }
    const chars = new Array(length).fill('a');
    for (let i = length - 1; i >= 0; i--) {
        chars[i] = String.fromCharCode(97 + (n % 26));
        n = Math.floor(n / 26);
    }
    return chars.join('');
}
export function formatFiniteCompact(value, digits = 2) {
    if (!Number.isFinite(value))
        return value > 0 ? '∞' : value < 0 ? '-∞' : '0';
    const sign = value < 0 ? '-' : '';
    const n = Math.abs(value);
    if (n < 1_000)
        return `${sign}${n < 10 ? n.toFixed(digits) : n < 100 ? n.toFixed(1) : Math.round(n)}`.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
    const basic = [['K', 1e3], ['M', 1e6], ['B', 1e9], ['T', 1e12]];
    for (let i = basic.length - 1; i >= 0; i--) {
        const [suffix, scale] = basic[i];
        if (n >= scale && n < scale * 1000)
            return `${sign}${(n / scale).toFixed(digits).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1')}${suffix}`;
    }
    return formatLogMagnitude({ log10: Math.log10(n) }, digits, sign);
}
export function formatLogMagnitude(value, digits = 2, sign = '') {
    const log10 = Number(value.log10);
    if (!Number.isFinite(log10))
        return log10 === Infinity ? `${sign}∞` : '0';
    if (log10 < 0) {
        const finite = 10 ** log10;
        return `${sign}${finite.toFixed(Math.max(2, digits))}`;
    }
    if (log10 < 15) {
        return `${sign}${formatFiniteCompact(10 ** log10, digits)}`;
    }
    const group = Math.floor(log10 / 3);
    const groupStart = group * 3;
    const mantissa = 10 ** (log10 - groupStart);
    const suffix = alphaSuffix(Math.max(0, group - 5));
    return `${sign}${mantissa.toFixed(digits).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1')}${suffix}`;
}
export function multiplyLog10(log10, multiplier) {
    if (multiplier <= 0)
        return -Infinity;
    return log10 + Math.log10(multiplier);
}
export function ratioFromLogs(aLog10, bLog10, cap = 1e6) {
    const delta = aLog10 - bLog10;
    if (delta >= Math.log10(cap))
        return cap;
    if (delta <= -Math.log10(cap))
        return 1 / cap;
    return 10 ** delta;
}
//# sourceMappingURL=endless-number.js.map