# CURRENT CHECKPOINT — FEATURE GAMEPLAY / V141 HUNT CLOSURE

**Date:** 2026-09-07  
**Branch:** `feature/reincarnation-cultivation-r3`  
**Gameplay/web version:** `1.40.0-alpha.24.0`  
**Status:** Săn Yêu × Tu Luyện V140 CLOSED / canonical QA PASS.  
**Rule:** use the current branch HEAD as source of truth; do not merge to `main` unless the user explicitly asks.

This branch sits on top of the V141 codebase-optimization baseline and preserves the V140 Tu Luyện contract. It also contains the current Luân Hồi V4/Mệnh Cách work and the completed Săn Yêu × Tu Luyện closure below. Old handoff text that says “audit Luân Hồi before coding” is superseded.

## 1. Tu Luyện V140 — CANONICAL / KEEP

- `dist/core/cultivation-v140.js` remains the cultivation authority.
- 118 realm orders: Phàm Nhân order 0 + 28 cultivation major realms from Luyện Khí through Sáng Thế Chủ.
- Realtime cultivation commits every 15 seconds.
- Minor realms auto-advance when full.
- Major transitions are deterministic `Thăng Cảnh`; Thiên Kiếp gates remain explicit.
- Bế Quan uses +3h bank/day, max 9h.
- Săn Yêu does not mint direct Tu Vi and therefore does not compete with or inflate the V140 cultivation clock.

Do not restore retired V140 cultivation clutter because legacy files/tests mention it: cultivation Căn Cơ/Tổn Căn, cultivation Kinh Mạch, Tạp Chất/Thanh Tịnh, Hấp Thu/Thông Lượng/Backlog/Luyện Hóa/Tinh Thuần pipeline, five cultivation methods, Thiêu Thọ, or old RNG realm-breakthrough preparation/quality/failure.

## 2. Luân Hồi V4 — CURRENT FEATURE WORK

The current branch already contains Luân Hồi V4 implementation work. Read live source before changing it, especially:

- `dist/core/reincarnation-progression-v1102.js`
- `dist/core/reincarnation-fate-build-v4.js`
- `dist/core/life.js`
- `dist/core/session.js`
- `qa/tests/reincarnation-fate-build-v4-test.js`
- `qa/tests/reincarnation-v4-gameplay-balance-test.js`

Direction remains module-by-module: do not pre-build speculative branches. Mệnh Cách is deterministic current-life build selection; RP is the Luân Hồi spend/progression currency. Exact live formulas in source override old chat notes.

## 3. Săn Yêu × Tu Luyện V140 — CLOSED

### Structure

- 28 Săn Yêu major-realm maps matching Luyện Khí → Sáng Thế Chủ.
- Each major realm has `8 vực × 100 tầng = 800 tầng`.
- Each floor is one real Boss challenge; victory opens the next floor.
- A cleared floor becomes a Săn Ảo farm floor.
- Five elemental Boss mechanic families remain authored: Wood / Fire / Earth / Metal / Water, each with readable counter lanes.

### Combat authority

- Real Boss fights use canonical CombatKernel V2.
- Săn Ảo settlement is O(1): one deterministic representative ordinary monster is resolved by CombatKernel V2 in simulation mode to establish TTK, then batch rewards are aggregated.
- Lightweight Săn Ảo preview is telemetry only; it reflects current `fateV4.damagePct` such as Chiến Mệnh while intentionally excluding `bossDamagePct` for ordinary/elite farm mobs.
- Generic Combat Power never declares Boss victory or directly mints farm kills.
- Preview and settlement now share the same hard lower bound of **0.25 real seconds/kill**. At the canonical 24h offline cap this is a theoretical maximum of **345,600 kills**, below `OFFLINE_HUNT_MAX_FIGHTS = 350,000`.

### Cultivation contract

- Săn Yêu grants **0 direct Tu Vi**.
- Hunt `cultivationPct = 0`; hidden hunt training growth remains disabled.
- Tu Luyện V140 continues at 100% while Săn Ảo runs.
- Hunt is therefore a resource/combat progression loop, not a second cultivation engine.
- Existing Tu Vi Đan drops remain indirect/bounded by the Alchemy major-realm usage cap; Hunt itself does not bypass the cultivation authority.

### Rewards

Current Săn Ảo reward loop includes:

- Linh Thạch;
- Yêu Đan / beast-core material;
- equipment rolls, with existing overflow handling;
- existing eligible Hunt/economy rewards consumed by live source.

Tài Mệnh's Linh Thạch modifier is consumed by actual Săn Ảo settlement. Reward depth scales smoothly across local floors 1→800; low-floor farming uses progression-gap efficiency rather than current Combat Power.

### Closure invariants

`qa/tests/v141-hunt-cultivation-closure-test.js` locks:

1. V140 118 orders map to exactly 28 Hunt major realms.
2. 800 floors per major realm.
3. effective Hunt difficulty does not reset at 100-floor zone boundaries.
4. reward profiles do not regress at zone boundaries.
5. Hunt never mints direct Tu Vi.
6. Săn Ảo preview reflects current-life generic Damage% but not Boss-only Damage%.
7. preview/settlement hard floor is 0.25s and a full 24h window stays under the Hunt safety ceiling.
8. actual Săn Ảo settlement uses representative CombatKernel V2 TTK.
9. Linh Thạch major-realm scaling is finite and hard-capped.

## 4. Canonical QA at final Hunt runtime/test closure

Runtime/test checkpoint: `0999ab37e0a97fc4938b9dd64995cdb9f922f78c`.
GitHub Actions run `34087201830` completed **SUCCESS** with:

- Codebase health scan: PASS.
- V140 cultivation core: PASS.
- V140 cultivation transport: PASS.
- V140 zero legacy: PASS.
- V141 Hunt × Cultivation closure: PASS.
- Backend fast gate: PASS.
- Frontend fast gate: PASS.
- Backend full closure: PASS.
- Frontend full closure: PASS.

Relevant final Hunt commits before this documentation refresh:

- `6bde82b291816cc5c570fd8094381b8dd0767a2a` — align Săn Ảo preview minimum TTK with canonical batch settlement.
- `003ec41b313ad306eb5c25e7886987ff1b4b907d` — document the 24h Hunt safety ceiling correctly.
- `0999ab37e0a97fc4938b9dd64995cdb9f922f78c` — lock closure invariants in V141 Hunt × Cultivation QA.

## 5. Next-chat rule

Start from current branch HEAD and read `CHAT_MOI_START_HERE.md` plus this file. **Do not re-open Săn Yêu design unless the user explicitly requests a change.** Continue the next requested gameplay module from live source while preserving the Hunt closure invariants above.
