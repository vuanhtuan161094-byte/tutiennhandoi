# CURRENT CHECKPOINT

This file is the compact source of truth for a new chat. Current `main` and live production code/tests outrank older conversation memory.

## Operating state

- Repository: `vuanhtuan161094-byte/tutiennhandoi`.
- Branch: `main` only.
- Required flow: refresh `main` → read `AGENTS.md` + this checkpoint + `docs/DEVELOPMENT_PROTOCOL.md` → read the active workflow/spec → search → narrow → patch → targeted proof → active gate → scoped closure.
- Main Dao work uses `docs/runtime/DAO_PRODUCTION_WORKFLOW_V3_20260926.md`.
- GitHub Actions push automation is manual-only; normal final verification is local FULL CLEAN + registered feature-scoped closure.
- Never reopen a `CLOSED / LOCKED` system without a proven regression or explicit user instruction.
- Canonical JS runtime/save/gameplay authority through V179 remains locked; Godot is presentation/client unless a separately scoped parity-proven port is opened.

## Locked parent systems

### Combat Backend V3 — CLOSED / LOCKED

- Verified runtime SHA: `00f944feeebe99778beec0c1d727060e47dfc5ec`.
- Record: `docs/runtime/COMBAT_BACKEND_V3_CLOSURE_20260924.md`.

### Sword Dao Production V1 — CLOSED / LOCKED

- Contract: `docs/runtime/SWORD_DAO_PRODUCTION_CONTRACT_20260925.md`.
- Final verified gameplay SHA: `edf479ff465c262d105020d96dc23a31ba7b66c1`.
- Sword is regression-only during Mind work.

### Fist / Quyền Dao Production V1 — CLOSED / LOCKED

- Contract: `docs/runtime/FIST_DAO_PRODUCTION_CONTRACT_20260926.md`.
- Final gameplay candidate: `35e028b17c6560784483e8d0f89e4dd2d8593228`.
- Exact scoped closure evidence: `7c8b777c7f5a527e8871ab783bc64a9add4e94dd`.
- Quyền is regression-only during Mind work.

### Dao Production Workflow V3 — ACTIVE / LOCKED

- Canonical workflow: `docs/runtime/DAO_PRODUCTION_WORKFLOW_V3_20260926.md`.
- Feature manifests: `qa/runners/feature-closure-manifest.js`.
- Final feature closure command: `DONG_BO_VA_TEST_FEATURE.cmd <feature-id>`.
- New/open Dao stays `closureReady:false` until correctness, parity, identity-valid benchmark, target bands and required regressions are complete.

### Ngũ Hành Equipment Retirement — CLOSED / LOCKED

- Record: `docs/runtime/NGU_HANH_EQUIPMENT_RETIREMENT_20260927.md`.
- Exact closure SHA: `39781155b11b1c48edce11fb141cd204a71df71c`.
- Do not restore equipment Gems/Sets/elemental-affix combat authority during Dao work.

## Thần Niệm Dao — ACTIVE

Feature id: `dao-mind`  
Feature manifest: **`closureReady:false`**  
Design target: `docs/runtime/MIND_DAO_PRODUCTION_SPEC_V1_20260929.md`  
Production contract: `docs/runtime/MIND_DAO_PRODUCTION_CONTRACT_20260929.md`  
M2B audit: `docs/runtime/MIND_DAO_M2B_CLOSURE_AUDIT_20260929.md`

### Closed subphases

- **M0 — CLOSED:** scope / contract / feature registry / fail-closed benchmark placeholder.
- **M1 — CLOSED:** Thần Ấn authority, Nhiễu/Bạo Ấn transactions, Observe progress, Phân Lưu, sanitized Niệm Ảnh, no recursion / no duplicate authority.
- **M2A — CLOSED:** all ten Mind skills have explicit five-stat families; no generic TT damage multiplier.
- **M2B — CLOSED:** passive P1–P8 architecture and ownership.

M2B runtime candidate:
`24c608f1764c9e5a34c65e5c66602e3e30d3a499`

Guarded M2B workflow:
- run `36519206674` — SUCCESS;
- Mind M2B + M2A + M1 targeted gates PASS;
- locked Sword smoke PASS;
- locked Quyền smoke PASS.

M2B production locks:
- `mind-dao-v2-runtime.js` owns Mind passive output;
- Main Mind gets localized echo/control/Accuracy/Nhiễu/echo-Break/conditional Armor Pen lanes;
- Secondary Mind gets the explicit Resolve-safe lane only;
- generic Mind Skill Damage/Gauge/Armor-Pen package is retired;
- P8 peak refresh is event-owned, not passive/stat-read-owned;
- P7 Armor Pen is Main-Mind, procDepth-0 and pressure-gated.

### Immediate next action — M2C Mastery architecture

Audit all ten `mindSkillMasteryV2` rows against `MIND_DAO_PRODUCTION_SPEC_V1_20260929.md` and live runtime.

For each 100 / 250 / 500 / 750 / 1000 milestone:
1. classify ownership: numeric, root behavior, snapshot/echo, Thần Ấn transaction, Niệm Lực event, control/Break, or timing;
2. prove whether runtime already implements it;
3. implement only missing authored behavior through the Mind owner;
4. add narrow regression tests;
5. preserve one root transaction, shared follow-up budget, procDepth non-recursion and canonical control/boss rules;
6. do **not** balance/tune coefficients in M2C.

After M2C:
- **M3:** Auto/manual/PvE/PvP/Hunt/save/carry/Secondary-passive parity;
- **M4:** replace blocked benchmark launcher with identity-valid deterministic harness;
- **M5:** minimal Mind-owned tuning only after valid baseline;
- **M6:** FULL CLEAN + `DONG_BO_VA_TEST_FEATURE.cmd dao-mind` + dated closure record + lock.

## Full-game audit debt — separate from Mind feature closure

Historical full backend audit last reported 137/141 PASS. Deferred cross-system failures remain:
- `reincarnation-v4-gameplay-balance-test.js`;
- `v121-balance-production-test.js`;
- `v129-global-build-balance-test.js`;
- `v149-artifact-v129-balance-test.js`.

Do not retune these unrelated systems merely to make `dao-mind` green.

## Godot / UI state

- Godot target: 4.7.2 stable; primary viewport 390×844.
- Home = seated meditation; Character = standing.
- Godot remains presentation/client against locked JS gameplay authority unless a separate runtime port is opened.
- Godot executable work requires `KIEM_TRA_GAME.cmd`; UI-visible work needs actual runtime evidence and explicit user visual approval.
- Historical closed web UI slices remain locked.

## Source-of-truth rule for the next chat

Do not reconstruct Thần Niệm state from older chat messages. Refresh `main`, read this checkpoint, then read the current Mind contract/spec and live source/tests. If `main` has advanced beyond the SHA recorded here, the newer `main` is authoritative.
