import fs from 'node:fs';

function read(path){ return fs.readFileSync(path,'utf8').replace(/\r\n/g,'\n'); }
function write(path,text){ fs.writeFileSync(path,text); }
function replaceExact(text,label,before,after){
  const count=text.split(before).length-1;
  if(count!==1) throw new Error(`${label}: expected exactly once, found ${count}`);
  return text.replace(before,after);
}
function replaceRange(text,label,startMarker,endMarker,replacement){
  const start=text.indexOf(startMarker);
  if(start<0) throw new Error(`${label}: start marker missing`);
  const end=text.indexOf(endMarker,start+startMarker.length);
  if(end<0) throw new Error(`${label}: end marker missing`);
  return text.slice(0,start)+replacement+text.slice(end);
}

{
  const path='docs/runtime/MIND_DAO_PRODUCTION_CONTRACT_20260929.md';
  let text=read(path);
  text=replaceExact(text,'contract status',
    'Status: **M0 / M1A OPEN — SCOPE + RUNTIME SEAM AUDIT LOCKED; PRODUCTION TUNING NOT AUTHORIZED**',
    'Status: **M1 CLOSED / M2 OPEN — RUNTIME AUTHORITY LOCKED; FIVE-STAT + SKILL/PASSIVE ARCHITECTURE OPEN; PRODUCTION TUNING NOT AUTHORIZED**');
  text=replaceExact(text,'M1 phase row',
`### M1 — Runtime correctness / ownership
- V2-owned Thần Ấn interference;
- canonical sanitized Niệm Ảnh snapshot;
- event-owned Niệm Lực refresh;
- target-mark projection/Auto conditions;
- channel/deploy completion semantics;
- no recursion / no duplicate authority.`,
`### M1 — Runtime correctness / ownership — CLOSED 2026-09-29
- V2-owned Thần Ấn interference — CLOSED;
- canonical sanitized Niệm Ảnh snapshot — CLOSED;
- event-owned Niệm Lực refresh — CLOSED;
- target-mark projection/Auto conditions — CLOSED;
- channel/deploy completion semantics — CLOSED;
- no recursion / no duplicate authority — CLOSED.

Closure record: \`docs/runtime/MIND_DAO_M1_CLOSURE_20260929.md\`.  
Exact M1 gameplay SHA: \`c3ffe4226df2d41e4398d301c01fc0aedfb2b40f\`.

M1 does **not** accept the old generic p1/p6/p7/p8 damage/Armor Pen/Gauge package as final Thần Niệm identity. Final skill/passive ownership is deliberately carried into M2, exactly as defined below.`);
  write(path,text);
}

{
  const path='qa/tests/mind-dao-production-contract-test.js';
  let text=read(path);
  text=replaceExact(text,'status assertion',
    "assert.match(contract,/M0 \\/ M1A OPEN/);",
    "assert.match(contract,/M1 CLOSED \\/ M2 OPEN/);");
  text=replaceExact(text,'runtime blocker assertions',
`assert.match(contract,/Nhiễu ownership is bypassed under V2/);
assert.match(contract,/Auto Burst gates on the wrong semantic/);
assert.match(contract,/Niệm Ảnh runtime does not match the authored snapshot contract/);
assert.match(contract,/five-stat migration is not done/);
assert.match(contract,/Niệm Lực p8 refresh is still read-owned/);`,
`assert.match(contract,/Nhiễu ownership is bypassed under V2/);
assert.match(contract,/Auto Burst gates on the wrong semantic/);
assert.match(contract,/Niệm Ảnh runtime does not match the authored snapshot contract/);
assert.match(contract,/five-stat migration is not done/);
assert.match(contract,/Niệm Lực p8 refresh is still read-owned/);
assert.match(contract,/M1 — Runtime correctness \/ ownership — CLOSED 2026-09-29/);
assert.match(contract,/Exact M1 gameplay SHA: \\`c3ffe4226df2d41e4398d301c01fc0aedfb2b40f\\`/);`);
  write(path,text);
}

{
  const path='CURRENT_CHECKPOINT.md';
  let text=read(path);
  const insertMarker='## Full-game backend audit debt — intentionally separate from feature closure';
  const section=`## Thần Niệm Dao Production — M1 CLOSED / M2 OPEN (2026-09-29)\n\n- Canonical contract: \`docs/runtime/MIND_DAO_PRODUCTION_CONTRACT_20260929.md\`.\n- M1 closure record: \`docs/runtime/MIND_DAO_M1_CLOSURE_20260929.md\`.\n- Exact M1 gameplay SHA: \`c3ffe4226df2d41e4398d301c01fc0aedfb2b40f\`.\n- M1 runtime ownership now locks:\n  - target-local Thần Ấn, hard cap 5;\n  - resolved-root spend for Nhiễu/Bạo Ấn/Ultimate conversion;\n  - Observe progressive marks from resolved channel ticks only;\n  - Phân Lưu 5s state with every-third subsequent eligible Active bonus;\n  - Niệm Ảnh sanitized damage/heal/shield/Break snapshot, shared follow-up budget, no recursion;\n  - Ultimate excluded from ordinary 3-Active echo cadence/snapshot creation;\n  - p8 Niệm Lực refresh is action-event-owned, not read-owned;\n  - \`mindEchoCounter\` retired from player-facing V2 projection.\n- M1 closure run \`36517449276\` PASS: four targeted Mind correctness gates + Sword F6 harness smoke + Fist counter runtime smoke; guarded patch and commit/push also PASS.\n- The existing generic Mind p1/p6/p7/p8 damage/Armor Pen/Gauge package is **not accepted as final identity**. Its specialization belongs to M2.\n- Production tuning and deterministic benchmark remain forbidden until later phases. Feature \`dao-mind\` stays \`closureReady:false\`.\n\n`;
  if(!text.includes(section.trim())) text=text.replace(insertMarker,section+insertMarker);
  text=replaceRange(text,'immediate next action',
    '## Immediate next action — Thần Niệm Dao',
    '## Historical checkpoint preservation',
`## Immediate next action — Thần Niệm Dao M2\n\n1. Start **M2 — Five-stat migration + skill/passive architecture** only; do not tune coefficients against benchmark yet.\n2. Add explicit five-stat families per skill under the locked rule: CL direct-damage anchor; TT control/Accuracy/Resolve authority; TPH only explicit tempo/chase; TP only explicit defensive/shield contribution; LL capacity only. No global TT-to-damage multiplier.\n3. Replace/retire the generic Mind p1/p6/p7/p8 all-skill damage/Gauge behavior with authored Mind-local echo/interference/control semantics. Preserve Secondary Mind as passive-only and prevent Main Core/Active leakage.\n4. Keep M1 authority byte-stable unless an M2 migration test proves a required seam change. Preserve Combat V3, Sword, Quyền and Ngũ Hành Equipment Retirement locks.\n5. After M2 structural/runtime gates pass, move to M3 parity; deterministic identity benchmark remains blocked until M4.\n\n`);
  write(path,text);
}

const closure=`# THẦN NIỆM DAO — M1 RUNTIME AUTHORITY CLOSURE — 2026-09-29\n\nStatus: **M1 CLOSED / M2 OPEN**  \nFeature: \`dao-mind\`  \nBranch: \`main\`  \nExact M1 gameplay SHA: \`c3ffe4226df2d41e4398d301c01fc0aedfb2b40f\`\n\n## Scope closed\n\nM1 closes runtime correctness and ownership only. It does not authorize five-stat tuning, passive identity tuning, parity closure, benchmark tuning, or feature closure.\n\nClosed authority seams:\n- Thần Ấn is target-local, capped at 5, Main-Mind V2 owned.\n- Nhiễu Thần Chỉ consumes 1–3 marks exactly once at resolved root and routes hard mental stagger through the canonical control API.\n- Bạo Ấn and Ultimate mark conversion use the actual target mark store and cannot double-consume.\n- Tịch Niệm Quan Tâm awards its +3 marks progressively from resolved channel ticks using \`floor(3 * resolvedTicks / totalTicks)\`; interrupted channels keep only earned progress.\n- Vạn Niệm Phân Lưu opens a 5s combat state; its Deploy root does not count toward its own every-third-Active bonus.\n- Niệm Ảnh stores a sanitized procDepth-0 snapshot and replays only whitelisted damage/heal/shield/Break packets through the shared follow-up budget. It does not replay marks, resource transactions, Gauge, deploy state, DoT scheduling, control transactions, or recursive echo generation.\n- Ultimate does not advance ordinary Niệm Ảnh cadence and does not replace the normal snapshot.\n- Niệm Lực p8 peak refresh is event-owned on an eligible root action; stat/damage reads no longer extend the Mind timer.\n- \`mindEchoCounter\` is no longer exposed as a player-facing V2 resource projection.\n- Auto spender gates were already corrected to use target Thần Ấn, with zero-mark Burst/Interfere blocked from fallback.\n\n## Ownership shape\n\n\`dist/core/combat.js\` is the narrow Thần Niệm authority wrapper over frozen \`combat-m1-base.js\`. This isolates M1 Mind seams without reopening Sword/Fist or unrelated combat behavior. The generic remaining-Dao runtime is mutation-free for Main-Mind Core ownership.\n\n## Verification evidence\n\nGuarded closure run: \`36517449276\` — **SUCCESS**.\n\nPassed targeted Mind gates:\n- \`mind-dao-m1-seal-transaction-test.js\`;\n- \`mind-dao-m1-authority-test.js\`;\n- \`mind-dao-production-contract-test.js\`;\n- \`mind-dao-skill-form-contract-test.js\`.\n\nPassed locked regression smoke:\n- \`sword-dao-f6-harness-contract-test.js\`;\n- \`fist-dao-counter-runtime-test.js\`.\n\nThe guarded patch, syntax checks, test gates, commit and push all completed successfully before \`c3ffe422...\` became \`main\`.\n\n## Explicitly deferred to M2+\n\nM1 does not accept the current generic Mind p1/p6/p7/p8 damage/Armor Pen/Gauge package as final Thần Niệm identity. The production contract explicitly leaves final skill/passive architecture to M2.\n\nM2 must:\n- add explicit five-stat families without a global TT damage multiplier;\n- move Mind passive value toward echo/interference/control/Resolve semantics;\n- preserve Secondary passive-only behavior and prevent Main Core/Active leakage.\n\nM3 remains parity, M4 deterministic harness, M5 minimal tuning, M6 scoped closure. Until M6, \`dao-mind\` remains \`closureReady:false\`.\n`;
fs.writeFileSync('docs/runtime/MIND_DAO_M1_CLOSURE_20260929.md',closure);
console.log('MIND M1 CLOSURE DOC PATCH: APPLIED');