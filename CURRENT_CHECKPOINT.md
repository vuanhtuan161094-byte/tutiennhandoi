# CURRENT CHECKPOINT

This file is the compact source of truth for a new chat. Current `main` and live production code/tests outrank older conversation memory.

## Operating state

- Repository: `vuanhtuan161094-byte/tutiennhandoi`.
- Branch: `main` only.
- Required flow: refresh `main` → read `AGENTS.md` + this checkpoint + `docs/DEVELOPMENT_PROTOCOL.md` → read the active workflow/spec → search → narrow → patch → targeted proof → active gate → scoped closure.
- Main Dao work uses `docs/runtime/DAO_PRODUCTION_WORKFLOW_V3_20260926.md`.
- Canonical launchers: `DONG_BO_VA_TEST_GAME.cmd` and `DONG_BO_VA_TEST_FEATURE.cmd <feature-id>`.
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
- Obsolete Phase-1 retirement doc and dedicated Ngũ Hành/DAO launchers were removed during repository cleanup.

## Linh Căn authority — LIVE V145

Only **Linh Căn V145** is current gameplay authority:

`Lv Linh Căn → Linh Tủy → mỗi 100 Lv Tiến Cấp → Điểm Căn Mạch + Căn Ngộ → Cực Căn → Vô Cực Căn / Chuyển`

Current four Căn Mạch:
- Tụ Linh Mạch;
- Chiến Linh Mạch;
- Huyền Thể Mạch;
- Linh Hải Mạch.

Resource/source locks:
- Linh Tủy comes from Hunt;
- Bản Nguyên Linh Căn is used for Tiến Cấp;
- Boss first-clear and Hunt use deterministic/pity sources, not roulette root upgrading.

Legacy root systems V131/V132/V133 are **LEGACY / FROZEN COMPATIBILITY**, not live Linh Căn gameplay. Do not delete them while save/regression dependencies such as `rootLevelsV133` or `activeRootOriginIdsV132` remain.

## Luân Hồi terminology / authority

Current player-facing loop:

`Tọa Hóa → Thí Luyện → Điểm Luân Hồi/Tiềm Năng → Cây Luân Hồi → Mệnh Thai đời mới`

Terminology lock:
- **Mệnh Lộ** = five branches Tu Mệnh / Chiến Mệnh / Thể Mệnh / Tài Mệnh / Nhàn Mệnh;
- **Mệnh Thai** = new-life selection during reincarnation;
- **Mệnh Cách** = identity/property inside Mệnh Thai;
- **Linh Căn** = V145 permanent progression.

Keep current IDs/API/save keys when only display terminology changes.

### Linh Căn V145 reincarnation carry fix — PATCHED IN SOURCE

Bug was confirmed: `buildReincarnatedState()` created a fresh character via `createCharacterSystemState()`, which initialized a new V145 root and did not carry `previous.character.spiritualRootV145`.

Functional patch commit:
`e3a3e4f0391944597925a99ad94e178ce3288129`

Current implementation:
- `dist/core/life-runtime-core.js` preserves the previous monolithic life/reincarnation implementation unchanged;
- canonical `dist/core/life.js` is a thin boundary that delegates to the core and then deep-clones `previous.character.spiritualRootV145` with `cloneSpiritualRootStateV145()` into the reincarnated character;
- regression test added: `qa/tests/v145-spiritual-root-reincarnation-test.js`;
- the test checks full V145 carry plus reference separation so the new life cannot mutate the previous-life V145 object by aliasing.

Verification distinction:
- source patch: **COMMITTED**;
- regression test: **REGISTERED** in canonical local-CI preflight;
- test execution in the connector session: **NOT CLAIMED**;
- exact-SHA CI status for the functional patch: no reported status checks at checkpoint update time.

## Repository cleanup state

Cleanup principle:
- delete only when there is no caller/save compatibility/regression-gate dependency and a newer authority replaces it;
- otherwise keep runtime under explicit LEGACY / FROZEN / COMPATIBILITY semantics.

Confirmed removed from current `main`:
- `docs/runtime/NGUHANH_EQUIPMENT_RETIREMENT_PHASE1_20260927.md`;
- `DONG_BO_VA_TEST_NGU_HANH.cmd`;
- `DONG_BO_VA_TEST_NGU_HANH_RETIRE.cmd`;
- `DONG_BO_VA_TEST_DAO.cmd`;
- obsolete migration/audit/plan artifacts previously identified during Sword/Quyền/Combat cleanup where no dependency remained.

Local CI cleanup:
- historical `qa/local/run-local-ci-pre-nguhanh-retirement.mjs` was removed;
- its implementation is retained under neutral name `qa/local/run-local-ci-core.mjs`;
- canonical entry remains `qa/local/run-local-ci.mjs` and runs required compatibility preflights before loading the core runner.

Do not delete tests merely because their filename contains `migration`; live gates/contracts still decide retention.

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

M2B runtime candidate: `24c608f1764c9e5a34c65e5c66602e3e30d3a499`  
M2C semantic-alignment candidate: `17ec773bb057e7e6145bea10de91e532bff0efdf`

M3 parity proof commits:
- gate: `ee86e719c47d8f3f57f33ea95b676373224ea73c`;
- registration: `ee57079fe1f8f3f58cfb1d32d2b83d1e6ba99165`.

### M3 production locks

- production consumers converge on canonical CombatKernel V3 / `CombatEngine`; no second Mind mechanic engine was found;
- Auto/tactical layers choose actions but do not independently resolve Mind mechanics;
- PvP and Hunt authoritative matches use the compiled CombatKernel V3 path;
- Hunt carries durable `battleDaoStateV2`; action-local Thần Ấn/Niệm Ảnh transaction state remains combat-owned;
- Secondary Mind remains the M2B passive-only Resolve-safe lane;
- Sword and Quyền stay locked regression dependencies;
- M3 changed no gameplay coefficient.

M3 closure limitation:
- no GitHub Actions run is claimed for the exact M3 proof commits at closure time;
- M3 is closed as production-path ownership/parity from audited source + registered guards, not as whole-feature FULL CLEAN evidence.

### M4 deterministic identity harness — OPEN

Harness candidate is installed:
- runner: `qa/benchmarks/mind-dao-m4-benchmark.js`;
- harness contract gate: `qa/tests/mind-dao-m4-harness-contract-test.js`;
- launcher: `tools\web\RUN_MIND_M5_BENCHMARK.cmd --no-pause`.

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

### Immediate Mind action — execute M4 baseline locally

Run `tools\web\RUN_MIND_M5_BENCHMARK.cmd --no-pause` and retain `qa\output\mind-m4-benchmark.json` plus the log as M4 evidence.

Until a successful identity-valid output exists:
- **M4 remains OPEN**;
- **M5 remains BLOCKED**;
- **M6 remains BLOCKED**;
- no Mind coefficient tuning is authorized.

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

Do not reconstruct gameplay from older chat messages. Refresh `main`, read this checkpoint, then read the current workflow/spec and live source/tests. If `main` has advanced beyond any SHA recorded here, the newer `main` is authoritative.
