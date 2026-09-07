# CURRENT CHECKPOINT — FEATURE GAMEPLAY / V141 HUNT CLOSURE

**Date:** 2026-09-07  
**Branch:** `feature/reincarnation-cultivation-r3`  
**Gameplay/web version:** `1.40.0-alpha.24.0`  
**Status:** PASS on canonical QA.  
**Rule:** use the current branch HEAD as source of truth; do not merge to `main` unless the user explicitly asks.

This branch sits on top of the V141 codebase-optimization baseline and preserves the V140 Tu Luyện contract. It also contains the current Luân Hồi V4 work and the completed Săn Yêu × Tu Luyện closure described below. Older V141 handoff text that says “audit Luân Hồi before coding” is superseded on this branch.

## 1. Tu Luyện V140 — CANONICAL / KEEP

- `dist/core/cultivation-v140.js` remains the single cultivation authority.
- 118 realm orders: Phàm Nhân order 0 + 28 cultivation major realms from Luyện Khí through Sáng Thế Chủ.
- Realtime cultivation commits every 15 seconds.
- Minor realms auto-advance when full.
- Major transitions are deterministic `Thăng Cảnh`; Thiên Kiếp gates remain explicit.
- Bế Quan uses +3h bank/day, max 9h.
- Săn Yêu does not mint direct Tu Vi and therefore does not compete with or inflate the V140 cultivation clock.

Do not restore the retired V140 cultivation clutter just because legacy files/tests mention it: cultivation Căn Cơ/Tổn Căn, cultivation Kinh Mạch, Tạp Chất/Thanh Tịnh, Hấp Thu/Thông Lượng/Backlog/Luyện Hóa/Tinh Thuần pipeline, five cultivation methods, Thiêu Thọ, or the old RNG realm-breakthrough preparation/quality/failure pipeline.

## 2. Luân Hồi V4 — CURRENT FEATURE WORK

The current branch already contains Luân Hồi V4 implementation work. Do not revert to the old instruction “audit first, no code”. Read the live source before changing it, especially:

- `dist/core/reincarnation-progression-v1102.js`
- `dist/core/reincarnation-fate-build-v4.js`
- `dist/core/life.js`
- `dist/core/session.js`
- `qa/tests/reincarnation-fate-build-v4-test.js`
- `qa/tests/reincarnation-v4-gameplay-balance-test.js`

Current direction remains module-by-module: do not pre-build seven speculative branches. Mệnh Cách is deterministic current-life build selection; RP is the Luân Hồi spend/progression currency in the V4 work. Exact live formulas in source override old chat notes.

## 3. Săn Yêu × Tu Luyện V140 — CLOSED

Săn Yêu is now closed as a gameplay subsystem for the current scope.

### Structure

- 28 Săn Yêu major-realm maps, matching the 28 cultivation major realms Luyện Khí → Sáng Thế Chủ.
- Each major realm has `8 vực × 100 tầng = 800 tầng`.
- Each floor is one real Boss challenge; victory opens the next floor.
- A cleared floor becomes a Săn Ảo farm floor.
- Five elemental Boss mechanic families remain authored: Wood / Fire / Earth / Metal / Water, each exposing readable counter lanes.

### Combat authority

- Real Boss fights use canonical CombatKernel V2.
- Săn Ảo settlement is O(1): one deterministic representative ordinary monster is resolved with CombatKernel V2 in simulation mode to establish real TTK, then the batch reward is aggregated.
- The lightweight Săn Ảo preview is telemetry only. V141 closure fixed it so current `fateV4.damagePct` (e.g. Chiến Mệnh) affects preview throughput, while `bossDamagePct` intentionally does not affect ordinary Săn Ảo mobs.
- Generic Combat Power never directly declares farm kills or Boss victory.

### Cultivation contract

- Săn Yêu grants **0 direct Tu Vi**.
- Hunt `cultivationPct = 0` and hidden hunt training growth remains disabled.
- Tu Luyện V140 continues at 100% while Săn Ảo runs.
- Therefore Hunt is a resource/combat progression loop, not a second cultivation engine.

### Rewards

Current Săn Ảo reward loop includes:

- Linh Thạch;
- Yêu Đan / beast-core material;
- equipment rolls, with overflow converted to equipment essence;
- existing eligible Hunt/economy rewards consumed by the live source.

Tài Mệnh's Linh Thạch modifier is consumed by actual Săn Ảo settlement. Reward depth scales smoothly across local floors 1→800; low-floor farming uses progression-gap efficiency rather than current Combat Power.

### Closure invariants

`qa/tests/v141-hunt-cultivation-closure-test.js` locks:

1. V140 118 orders map to exactly 28 Hunt major realms.
2. 800 floors per major realm.
3. effective Hunt difficulty does not reset at 100-floor zone boundaries.
4. reward profiles do not regress at zone boundaries.
5. Hunt never mints direct Tu Vi.
6. Săn Ảo preview reflects current-life generic Damage% but not Boss-only Damage%.
7. actual Săn Ảo settlement uses representative CombatKernel V2 TTK.
8. Linh Thạch major-realm scaling is finite and hard-capped.

## 4. Canonical QA at Hunt closure

The Hunt closure code checkpoint `0e93a012bfb8c580726744f854a8004b7358261b` passed GitHub Actions run `34087108557` with:

- Codebase health scan: PASS.
- V140 cultivation core: PASS.
- V140 cultivation transport: PASS.
- V140 zero legacy: PASS.
- V141 Hunt × Cultivation closure: PASS.
- Backend fast gate: PASS.
- Frontend fast gate: PASS.
- Backend full closure: PASS.
- Frontend full closure: PASS.

The CI workflow now runs canonical QA on `feature/**` branches and runs full backend/frontend closure on feature branches as well.

## 5. Next-chat rule

Start from current branch HEAD and read `CHAT_MOI_START_HERE.md` plus this file. Do not re-open Săn Yêu design unless the user explicitly requests a change. Continue the next requested gameplay module from live source, preserving the Săn Yêu closure invariants above.
