import fs from 'node:fs';

const path = 'dist/core/battle-dao-v2-runtime.js';
let text = fs.readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

function replaceExact(label, before, after) {
  const count = text.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly once, found ${count}`);
  text = text.replace(before, after);
}

function replaceRange(label, startMarker, endMarker, replacement) {
  const start = text.indexOf(startMarker);
  if (start < 0) throw new Error(`${label}: start marker missing`);
  if (text.indexOf(startMarker, start + startMarker.length) >= 0) throw new Error(`${label}: start marker not unique`);
  const end = text.indexOf(endMarker, start + startMarker.length);
  if (end < 0) throw new Error(`${label}: end marker missing`);
  text = text.slice(0, start) + replacement + text.slice(end);
}

replaceExact(
  'mind p8 read-owned refresh',
`            if (dao !== 'fist') {
                st.expiresAt = Math.max(st.expiresAt, now + scale(l8, 1, 2));
                st.nextDecayAt = undefined;
            }`,
`            if (dao !== 'fist' && dao !== 'mind') {
                st.expiresAt = Math.max(st.expiresAt, now + scale(l8, 1, 2));
                st.nextDecayAt = undefined;
            }`,
);

replaceRange(
  'retire old fake Mind core branch',
  "    if (main && dao === 'mind' && active) {",
  "    // Passive-stack mechanics are deliberately generic:",
`    if (main && dao === 'mind') {
        // M1 authority: CombatEngine wrapper owns Thần Ấn / Niệm Ảnh / Phân Lưu.
        // Keep the generic runtime mutation-free here so there is exactly one Main-Mind core owner.
    }
    `,
);

replaceExact(
  'hide internal mind cadence projection',
`    if (s.mind?.core)
        out.mindEchoCounter = s.mind.core.eligibleActiveCount;`,
`    if (s.mind?.core && (s.mind.core.flowUntil ?? 0) > now)
        out.mindFlowUntil = s.mind.core.flowUntil;`,
);

fs.writeFileSync(path, text);
console.log('MIND M1 GUARDED RUNTIME PATCH: APPLIED');