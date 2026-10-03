# CURRENT CHECKPOINT

This file is the compact source of truth for a new chat. Current `main` and live production code/tests outrank older conversation memory.

## Operating state

- Repository: `vuanhtuan161094-byte/tutiennhandoi`.
- Branch: `main` only.
- Required flow: refresh `main` → read `AGENTS.md` + this checkpoint + `docs/DEVELOPMENT_PROTOCOL.md` → read the active workflow/spec → search → narrow → patch → targeted proof → active gate → scoped closure.
- Main Dao workflow: `docs/runtime/DAO_PRODUCTION_WORKFLOW_V3_20260926.md`.
- Canonical launchers: `DONG_BO_VA_TEST_GAME.cmd` and `DONG_BO_VA_TEST_FEATURE.cmd <feature-id>`.
- GitHub Actions is manual-only. Normal final backend feature verification is local FULL CLEAN + registered scoped closure.
- Never reopen a `CLOSED / LOCKED` system without a proven regression or explicit user instruction.
- Canonical JS runtime/save/gameplay authority through V179 remains locked; Godot is presentation/client unless a separately scoped parity-proven port is opened.

## CLOSED / LOCKED systems

### Combat Backend V3
- Record: `docs/runtime/COMBAT_BACKEND_V3_CLOSURE_20260924.md`.
- Verified runtime SHA: `00f944feeebe99778beec0c1d727060e47dfc5ec`.

### Sword Dao Production V1
- Contract: `docs/runtime/SWORD_DAO_PRODUCTION_CONTRACT_20260925.md`.
- Final verified gameplay SHA: `edf479ff465c262d105020d96dc23a31ba7b66c1`.
- Regression-only during later Dao work.

### Fist / Quyền Dao Production V1
- Contract: `docs/runtime/FIST_DAO_PRODUCTION_CONTRACT_20260926.md`.
- Exact scoped closure evidence: `7c8b777c7f5a527e8871ab783bc64a9add4e94dd`.
- Regression-only during later Dao work.

### Body / Thể Dao Production V1
- Contract: `docs/runtime/BODY_DAO_PRODUCTION_CONTRACT_20260930.md`.
- Closure record: `docs/runtime/BODY_DAO_PRODUCTION_CLOSURE_20261003.md`.
- Exact verified gameplay/closure SHA: `dbb823404afbe7c82811a3b7700eacc12dd8d265`.
- Final local evidence: `DONG_BO_VA_TEST_FEATURE.cmd dao-body` → **FEATURE FULL CLEAN + SCOPED CLOSURE: PASS**.
- Scoped backend result: **V140 BACKEND FEATURE DAO-BODY: 23/23 PASS**.
- Locked identity: **Chịu → Hóa → Phản**, optional **Huyết–Công**; sole short-cycle resource `Phản Thế` stored in `counterForce`.
- Historical Main-Body Huyết Khí combat authority remains retired.
- Tri Kỷ, Linh Thú, Pháp Bảo/Chí Bảo balance, Equipment balance, Alchemy balance, Economy and Reincarnation/global collection balance remain deferred and were not tuned for Body closure.
- Later docs/metadata commits do not replace the verified gameplay SHA above.
- Regression-only unless a proven Body regression or explicit user instruction reopens it.

### Ngũ Hành Equipment Retirement
- Record: `docs/runtime/NGU_HANH_EQUIPMENT_RETIREMENT_20260927.md`.
- Exact closure SHA: `39781155b11b1c48edce11fb141cd204a71df71c`.
- Do not restore equipment Gems/Sets/elemental-affix combat authority during Dao work.

## Dao Production Workflow V3 — ACTIVE / LOCKED

- Feature manifests: `qa/runners/feature-closure-manifest.js`.
- Final feature closure: `DONG_BO_VA_TEST_FEATURE.cmd <feature-id>`.
- New/open Dao stays `closureReady:false` until correctness, parity, identity-valid benchmark evidence and required regressions are complete.
- Whole-game closure remains a separate audit; do not retune unrelated deferred systems just to make a scoped Dao green.

## Linh Căn authority — LIVE V145

Only Linh Căn V145 is current gameplay authority:
`Lv Linh Căn → Linh Tủy → mỗi 100 Lv Tiến Cấp → Điểm Căn Mạch + Căn Ngộ → Cực Căn → Vô Cực Căn / Chuyển`.

Locks:
- Linh Tủy from Hunt;
- Bản Nguyên Linh Căn used for Tiến Cấp;
- deterministic/pity sources, not roulette upgrading;
- V131/V132/V133 remain LEGACY / FROZEN COMPATIBILITY while save/regression dependencies remain.

Reincarnation carry patch: `e3a3e4f0391944597925a99ad94e178ce3288129`; `dist/core/life.js` deep-clones `spiritualRootV145` into the new life. Regression test: `qa/tests/v145-spiritual-root-reincarnation-test.js`.

## Luân Hồi terminology

- **Mệnh Lộ** = Tu Mệnh / Chiến Mệnh / Thể Mệnh / Tài Mệnh / Nhàn Mệnh.
- **Mệnh Thai** = new-life selection.
- **Mệnh Cách** = identity/property inside Mệnh Thai.
- **Linh Căn** = V145 permanent progression.
- Preserve current IDs/API/save keys when only display terminology changes.

## Repository cleanup rule

Delete only when there is no caller/save/regression dependency and a newer authority replaces the old one. Otherwise retain explicit LEGACY / FROZEN / COMPATIBILITY semantics. Do not delete tests merely because their filename contains `migration`; live manifests/contracts decide retention.

## Thần Niệm Dao — ACTIVE

Feature id: `dao-mind`  
Feature manifest: **`closureReady:false`**  
Design target: `docs/runtime/MIND_DAO_PRODUCTION_SPEC_V1_20260929.md`  
Production contract: `docs/runtime/MIND_DAO_PRODUCTION_CONTRACT_20260929.md`  
Audits: `docs/runtime/MIND_DAO_M2B_CLOSURE_AUDIT_20260929.md`, `MIND_DAO_M2C_CLOSURE_AUDIT_20260929.md`, `MIND_DAO_M3_CLOSURE_AUDIT_20260929.md`.

Closed: M0, M1, M2A, M2B, M2C, M3.

### M4 deterministic identity harness — OPEN

- Runner: `qa/benchmarks/mind-dao-m4-benchmark.js`.
- Contract gate: `qa/tests/mind-dao-m4-harness-contract-test.js`.
- Launcher: `tools\web\RUN_MIND_M5_BENCHMARK.cmd --no-pause`.
- Matrix: Bạo Ấn / Niệm Ảnh / Nhiễu Thức; 12 seeds × 180s × 3 archetypes; equal 300-point five-stat budget; identity-invalid runs are rejected.
- Harness is diagnostic only and cannot auto-tune coefficients.

Immediate Mind action: run the M4 baseline locally and retain `qa\output\mind-m4-benchmark.json` plus log. Until identity-valid output exists: M4 OPEN, M5 BLOCKED, M6 BLOCKED, no Mind coefficient tuning.

After M4: M5 minimal Mind-owned tuning only from valid evidence; M6 FULL CLEAN + `DONG_BO_VA_TEST_FEATURE.cmd dao-mind` + dated closure record + lock.

## Full-game audit debt

Whole-game backend/frontend closure is separate from scoped Dao closure. Deferred/global balance debt must be classified rather than opportunistically patched. In particular, do not use full-game audit failures as permission to rebalance Tri Kỷ, Linh Thú, Artifact/Relic, Equipment, Alchemy, Economy, Reincarnation or Collection while closing an unrelated Dao.

## Godot / UI

- Godot target: 4.7.2 stable; primary viewport 390×844.
- Home = seated meditation; Character = standing.
- Godot remains presentation/client against locked JS gameplay authority unless a separate parity-proven port is opened.
- Godot executable work requires `KIEM_TRA_GAME.cmd`; UI-visible work requires actual runtime evidence and explicit user visual approval.

## Source-of-truth rule for the next chat

Do not reconstruct gameplay from older chat messages. Refresh `main`, read this checkpoint, then read the current workflow/spec and live source/tests. If `main` has advanced beyond any SHA recorded here, the newer `main` is authoritative.