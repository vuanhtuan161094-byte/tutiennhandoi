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
M2C audit: `docs/runtime/MIND_DAO_M2C_CLOSURE_AUDIT_20260929.md`  
M3 audit: `docs/runtime/MIND_DAO_M3_CLOSURE_AUDIT_20260929.md`

### Closed subphases

- **M0 — CLOSED:** scope / contract / feature registry / fail-closed benchmark placeholder.
- **M1 — CLOSED:** Thần Ấn authority, Nhiễu/Bạo Ấn transactions, Observe progress, Phân Lưu, sanitized Niệm Ảnh, no recursion / no duplicate authority.
- **M2A — CLOSED:** all ten Mind skills have explicit five-stat families; no generic TT damage multiplier.
- **M2B — CLOSED:** passive P1–P8 architecture and ownership.
- **M2C — CLOSED:** all ten Mind mastery rows have runtime ownership for 100 / 250 / 500 / 750 / 1000 milestones through the Mind owner and narrow combat/decision seams.
- **M3 — CLOSED:** manual/shared CombatKernel V3, Auto/tactical, PvE/Boss, PvP, Hunt/offline, save/carry, Secondary Mind and locked Sword/Quyền consumer parity audited with a registered gate.

M2B runtime candidate:
`24c608f1764c9e5a34c65e5c66602e3e30d3a499`

M2C semantic-alignment candidate:
`17ec773bb057e7e6145bea10de91e532bff0efdf`

M3 parity proof commits:
- gate: `ee86e719c47d8f3f57f33ea95b676373224ea73c`;
- registration: `ee57079fe1f8f3f58cfb1d32d2b83d1e6ba99165`.

### M3 production locks

- production consumers converge on canonical CombatKernel V3 / `CombatEngine`; no second Mind mechanic engine was found;
- Auto/tactical layers choose actions but do not independently resolve Mind mechanics;
- PvP and Hunt authoritative matches use the compiled CombatKernel V3 path;
- Hunt carry forwards durable `battleDaoStateV2`; action-local Thần Ấn/Niệm Ảnh transaction state remains combat-owned;
- Secondary Mind remains the M2B passive-only Resolve-safe lane;
- Sword and Quyền stay locked regression dependencies;
- M3 changed no gameplay coefficient.

M3 closure limitation:
- no GitHub Actions run is claimed for the exact M3 proof commits at closure time;
- M3 is closed as production-path ownership/parity from audited source + registered guards, not as whole-feature FULL CLEAN evidence.

### M4 deterministic identity harness — OPEN

Harness candidate is installed:
- runner: `qa/benchmarks/mind-dao-m4-benchmark.js` (`dbc60388911a44ae94c7a11541ec903046c9f0ef`);
- harness contract gate: `qa/tests/mind-dao-m4-harness-contract-test.js` (`fba5f7875ddff86a46ca37221442dc4b2edeca9b`);
- manifest benchmark gate: `mind-dao-m4-harness-contract-test.js` (`94f7e73a497994137afff40917366e501ef8dceb`);
- launcher: `tools\web\RUN_MIND_M5_BENCHMARK.cmd` now executes the M4 harness (`73f0cb1fc367753ec24bbf399a7bad90d487aa9c`).

Harness matrix:
1. **Bạo Ấn** — normalized damage reference 100%, must perform real Bạo Ấn mark spends;
2. **Niệm Ảnh** — target 88–98% of Bạo Ấn with 15–30% real echo contribution, must produce real `mindSnapshot` replay damage;
3. **Nhiễu Thức** — target 75–90% of Bạo Ấn and highest real interference/control metric, must perform real Nhiễu mark spends.

Harness rules:
- 12 deterministic seeds × 180 seconds × 3 archetypes;
- 5 Active slots + Basic + Ultimate per profile;
- equal 300-point five-stat allocation budget;
- all 8 Mind passives Lv20 and all ten Mind mastery tiers 1000;
- any run with zero defining mechanic is rejected as `MIND_M4_INVALID_IDENTITY_RUN`;
- harness is diagnostic only and cannot auto-tune coefficients.

### Immediate next action — execute M4 baseline

Run `tools\web\RUN_MIND_M5_BENCHMARK.cmd --no-pause` in the repo and retain `qa\output\mind-m4-benchmark.json` plus the log as M4 evidence.

Until a successful identity-valid output exists:
- **M4 remains OPEN**;
- **M5 remains BLOCKED**;
- no coefficient tuning is authorized.

After M4 baseline:
- **M5:** minimal Mind-owned tuning only from valid deterministic evidence;
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