# CURRENT CHECKPOINT — V145 CLOSED

**Date:** 2026-09-08  
**Branch:** `feature/v142-equipment-hunt`  
**Gameplay/web version:** `1.40.0-alpha.24.0`  
**Status:** V140–V145 **CLOSED / canonical QA PASS**.  
**Rule:** current branch HEAD is source of truth. **Do not merge `main`** unless the user explicitly asks.

## 1. Closed baseline

- **V140 — Tu Luyện:** CLOSED.
- **V141 — Săn Yêu × Tu Luyện:** CLOSED.
- **V142 — Trang Bị × Hunt:** CLOSED.
- **V143 — Hunt reward authority + Set Resonance:** CLOSED.
- **V144 — retirement Công Pháp/Bí Thuật legacy V103/V119:** CLOSED.
- **V145 — Linh Căn vô hạn + Căn Mạch + Căn Ngộ + combat core buff:** CLOSED.

Do not reopen a closed subsystem because old chat, historical files, old save fields or retired tests still mention an older design. Reopen only for a real regression or an explicit new user requirement.

## 2. V145 Linh Căn — canonical contract

### Identity and progression

- One canonical Linh Căn progression per character.
- Linh Căn is **not** a Kim/Mộc/Thủy/Hỏa/Thổ system.
- Level progression is **Lv1 → ∞**, no hard level cap and no prestige/reset loop inside Linh Căn.
- Lv1–1000 retains the ten bands:
  - Phàm Căn
  - Linh Căn
  - Huyền Căn
  - Địa Căn
  - Thiên Căn
  - Chân Căn
  - Đạo Căn
  - Tiên Căn
  - Thần Căn
  - Cực Căn
- Above Lv1000: `Vô Cực Căn · Chuyển N`, one Chuyển per 100 levels, indefinitely.
- Every 100 levels is a Tiến Cấp gate.
- Each successful Tiến Cấp grants:
  - 1 Điểm Căn Mạch;
  - 1 pending Căn Ngộ choice.

### Core effects

V145 owns two safe infinite lanes:

1. **Tụ Linh / Tu Vi efficiency** — diminishing but unbounded growth, applied at canonical Tu Luyện authority; it does not multiply arbitrary instant Tu Vi rewards.
2. **Combat core stats** — Công + HP + Phòng grow indefinitely with diminishing curves.

Unsafe utility stats remain bounded. Do not make CDR, DR, max Chân Nguyên, Phá Thế, Crit utility or similar cap-sensitive stats linearly infinite.

### Căn Mạch

Four branches are live:

- **Tụ Linh Mạch** — Tu Vi, Linh Tủy, Bế Quan/progression support.
- **Chiến Linh Mạch** — Công plus bounded offensive utility.
- **Huyền Thể Mạch** — HP/Phòng plus bounded defensive utility.
- **Linh Hải Mạch** — Chân Nguyên/resource efficiency plus bounded recovery/CDR.

Điểm Căn Mạch are earned by Linh Căn Tiến Cấp, not a separate farm currency.

### Căn Ngộ

Each Tiến Cấp creates one Căn Ngộ choice from the canonical pool. Repeatable Căn Ngộ uses diminishing growth; safe raw-stat lanes can continue indefinitely while utility lanes remain bounded.

Current canonical identities include:

- Nhất Khí Quán Thể — Công;
- Thiên Sinh Linh Thể — HP;
- Huyền Giáp Nội Sinh — Phòng;
- Linh Hải Vô Nhai — Chân Nguyên bounded;
- Thiên Địa Đồng Tức — Tu Luyện;
- Đạo Cơ Viên Dung — balanced Công/HP/Phòng.

## 3. V145 resource source/sink authority

Only two live V145 progression materials are required:

### Linh Tủy

- Sink: ordinary Linh Căn nourishment/level-up.
- Primary live source: Săn Ảo batch settlement.
- Source scales with live progression and remains O(1) for large idle batches.
- Tụ Linh Mạch can improve Linh Tủy income only through its bounded reward lane.

### Bản Nguyên Linh Căn

- Sink: every 100-level Linh Căn Tiến Cấp.
- Bản Nguyên is **tiered by cultivation major realm**.
- A Bản Nguyên tier does not become obtainable until the character has reached the matching major realm tier.
- Boss First Clear in an unlocked realm grants the matching Bản Nguyên tier.
- Săn Ảo uses the deterministic 500-kill origin meter only for a Bản Nguyên tier already unlocked by character realm.
- 3 lower-tier Bản Nguyên may combine into 1 next-tier Bản Nguyên, but the destination tier must already be unlocked by character realm.
- Therefore the player cannot pre-farm or pre-combine Bản Nguyên above the reached realm.

This is a hard progression invariant: **chưa lên đại cảnh tương ứng → không được mint/tạo Bản Nguyên Linh Căn bậc đó bằng bất kỳ live player-facing path nào.**

## 4. V145 migration / retirement

V145 replaces the old elemental Linh Căn player-facing authority.

Retired from Linh Căn gameplay:

- five independent metal/wood/water/fire/earth root progression tracks;
- root focus as Linh Căn authority;
- elemental quality progression/materials;
- 30 Căn Nguyên elemental combat traits;
- target-origin farming/pity loop;
- elemental Linh Căn milestones;
- Linh Căn-driven Hành resource generation/payoff;
- Linh Căn dependency on skill `primaryRoot`;
- Linh Căn × Boss elemental matchup;
- Linh Căn × Equipment Set resonance;
- manual Hành Ấn / Element Seal as Linh Căn gameplay.

Legacy five-root data may remain only as compatibility/migration input where required. Old elemental Linh Căn combat hooks no longer contribute live skill combat power.

Migration is deterministic and one-time. Old elemental investment is converted/refunded into the V145 model; migration must not repeatedly mint resources on reload.

## 5. V145 UI / API authority

Player-facing Linh Căn UI is the V145 infinite progression surface. It exposes:

- current level and band/`Vô Cực Căn · Chuyển N`;
- Tu Vi and combat benefits;
- Linh Tủy owned / next level cost;
- Tiến Cấp gate and correct Bản Nguyên tier;
- whether the required realm tier is unlocked;
- Căn Mạch branches and unspent points;
- pending Căn Ngộ choices;
- nourishment, ascension, Căn Mạch, Căn Ngộ and Bản Nguyên combine actions.

Old V131 root focus/origin/quality actions are not the live player-facing Linh Căn API.

## 6. Separation from future Pháp Tắc / Lĩnh Vực

User direction is locked conceptually but **not implemented in V145**:

- Ngũ Hành Kim/Mộc/Thủy/Hỏa/Thổ and extended attributes such as Băng, Lôi, Phong, Huyết, Độc, Ám, Quang, Hư Không belong to a future independent **Pháp Tắc** subsystem.
- **Lĩnh Vực** is a later high-realm subsystem built on/around high-level laws, not part of V145 Linh Căn.
- Do not push elemental identity back into Linh Căn merely because legacy combat content or V142 Set names still use elements.

## 7. Existing closed-system invariants still active

### Tu Luyện V140

- 118 realm orders: Phàm Nhân + 28 major cultivation realms.
- 15-second realtime tick.
- minor realm auto-advance; deterministic major Thăng Cảnh / explicit Thiên Kiếp gates.
- Bế Quan +3h bank/day, cap 9h.
- Săn Yêu never directly mints Tu Vi; Tu Luyện runs independently at 100%.

### Hunt V141+

- 28 major-realm maps.
- 8 Vực × 100 floors = 800 floors per major realm.
- one real Boss per floor; clear unlocks next floor.
- cleared floors become Săn Ảo.
- real Boss and representative virtual-farm TTK use shared CombatKernel V2.
- Combat Power is telemetry, not victory authority.

### Equipment V142/V143

- canonical item identity: Slot + `equipmentRankIndex` + Enhancement + Affixes + optional Set identity.
- V142 enhancement cap +15.
- V142 elemental-named Sets remain existing stat packages only; they are not a Linh Căn dependency.
- V143 Set Resonance remains the endless fragment sink with safe stat lanes.

### Công Pháp V144

- `dist/core/manual-progression-v127.js` is the only live Công Pháp progression authority.
- 29 realm stages × 9 archetypes = 261 manuals, max Lv1000.
- V103/V119 manual progression/combat authority remains retired.

## 8. Balance closure after elemental Linh Căn retirement

Removing old V131–V133 elemental Linh Căn combat hooks changed the representative 8-Đạo round-robin envelope. V145 recalibrated only the shared V129 midgame Main-Đạo coefficient table; no PvP-only, Boss-only or Linh Căn-specific combat resolver was introduced.

Canonical V129 midgame coefficients after closure:

- sword 1.65
- fist 1.10
- body 1.21
- spell 1.66
- poison 0.95
- artifact 1.15
- formation 1.95
- mind 2.55

The V129 global-build-balance, power-budget and combat-parity gates pass with this shared-kernel calibration.

## 9. V145 canonical QA — PASS / LOCKED

Canonical source candidate includes runtime source commit:

`e33c5d91b1ce697779089139eb535fe1e0ed64ec` — `fix(v145): rebalance Dao after elemental root retirement`.

Full `V140 Canonical QA` run:

**`34182230349` — SUCCESS**

PASS includes:

- codebase health scan;
- V140 cultivation core + transport + zero legacy;
- V141 Hunt × Cultivation closure;
- V142 Equipment × Hunt gate including V143/V144 regressions;
- V145 infinite Spiritual Root core;
- V145 source/sink runtime;
- V145 realm-gated Bản Nguyên;
- V145 UI transport;
- backend fast gate;
- frontend fast gate;
- backend closure;
- frontend closure.

**V145 is CLOSED.** Do not reopen the old Linh Căn × Ngũ Hành design.

## 10. Next work

No next subsystem is automatically authorized. Proposed sequence remains:

- V146 Đan Dược;
- V147 Linh Thú;
- V148 Tri Kỷ;
- V149 Pháp Bảo;
- V150 Luân Hồi Production Closure;
- V151 whole-game economy/source-authority closure.

Future Pháp Tắc / Lĩnh Vực should be designed when the user chooses the appropriate high-realm progression work; they are not part of V146 by default.
