# CURRENT CHECKPOINT — FEATURE GAMEPLAY / V144 CLOSED

**Date:** 2026-09-08  
**Branch:** `feature/v142-equipment-hunt`  
**Gameplay/web version:** `1.40.0-alpha.24.0`  
**Status:** V142 Equipment × Hunt + V143 reward authority + V144 Công Pháp legacy retirement **CLOSED / canonical QA PASS**. V145 is **REDESIGN / NOT CLOSED**.  
**Rule:** use current branch HEAD as source of truth. Do not merge to `main` unless the user explicitly asks.

## 1. Tu Luyện V140 — CANONICAL / KEEP

- `dist/core/cultivation-v140.js` is the cultivation authority.
- 118 realm orders: Phàm Nhân order 0 + 28 cultivation major realms from Luyện Khí through Sáng Thế Chủ.
- Realtime cultivation commits every 15 seconds.
- Minor realms auto-advance when full.
- Major transitions are deterministic `Thăng Cảnh`; Thiên Kiếp gates remain explicit.
- Bế Quan grants +3h bank/day, max 9h.
- Săn Yêu grants 0 direct Tu Vi; Tu Luyện continues independently at 100%.
- Do not restore retired cultivation clutter: cultivation Căn Cơ/Tổn Căn, Kinh Mạch, Tạp Chất/Thanh Tịnh, old absorption/backlog/refining pipeline, five cultivation methods, Thiêu Thọ, or RNG major-realm breakthrough preparation.

## 2. Luân Hồi V4 — KEEP LIVE SOURCE

Read live source before changing:

- `dist/core/reincarnation-progression-v1102.js`
- `dist/core/reincarnation-fate-build-v4.js`
- `dist/core/life.js`
- `dist/core/session.js`

Mệnh Cách is deterministic current-life build selection. RP is Luân Hồi progression/spend currency. Live formulas override historical chat notes.

## 3. Săn Yêu × Tu Luyện — CLOSED FOUNDATION

- 28 major-realm Hunt maps matching Luyện Khí → Sáng Thế Chủ.
- Each major realm: 8 Vực × 100 tầng = 800 floors.
- One real Boss challenge per floor; clear unlocks next floor.
- Cleared floors become Săn Ảo farm floors.
- Real Boss uses CombatKernel V2.
- Săn Ảo uses deterministic representative CombatKernel V2 TTK then O(1) batch settlement.
- Combat Power is telemetry; it does not declare Boss victory or directly mint farm kills.
- Minimum real TTK is 0.25 s/kill, keeping 24h below the 350,000-fight safety ceiling.
- Hunt remains a resource/combat loop, never a second Tu Vi engine.
- Boss/difficulty progression uses the strongest Boss as authority and scales downward; same-realm players are not guaranteed to clear every floor.

## 4. Equipment V142 / V143 — CURRENT AUTHORITY

Current equipment progression is the V142 ranked-item architecture, not legacy Tier/Grade/Quality progression.

- Canonical item identity: Slot + `equipmentRankIndex` + Enhancement + Affixes + optional Set identity.
- Legacy `grade` is compatibility-only and must not become a progression axis again.
- Equipment Realm Rank follows cultivation major-realm progression and supports post-apex endless progression.
- Rank progression/fusion, ranked crafting, Hunt fragment settlement and dedicated equipment dungeon conversion are live.
- V142 still contains five attire Set definitions named/identified Metal/Wood/Water/Fire/Earth plus four jewelry Sets. These are existing Set/stat packages; **they do not make individual equipment items an elemental progression axis and they are not a dependency for the redesigned V145 Linh Căn**.
- V143 Set Resonance is an endless fragment sink. Endless growth must stay on safe raw/bounded stat lanes and must not break combat caps.
- V142 enhancement cap is +15.
- 50 same-rank fragments craft one item; 3 lower-rank fragments refine to one next-rank fragment; 3 same-slot/same-rank items merge the main item upward.
- Raw equipment stats can scale aggressively for infinite-game progression; Chân Nguyên and utility stats must not use the same explosive raw curve.

Hunt reward source authority after V143 cleanup:

- Hunt may provide Linh Thạch, general Hunt/economy materials, equipment progression fragments, rare eligible treasure, bounded pills, rare Bản Mệnh Tinh Huyết and the currently-live V131 Linh Căn materials.
- Existing V131 Linh Căn Hunt materials are subject to V145 redesign; their current existence does not force the new Linh Căn contract to keep elemental loot.
- Hunt no longer directly mints Bùa Chống Tụt, Ngọc Chuyển Cường Hóa, Huyết Tinh, Thể Phách Tinh Hoa or Hộ Huyết Phù; those belong to specialized progression sources.
- `qa/tests/v143-hunt-reward-authority-test.js` locks this separation.

## 5. Công Pháp V144 — SINGLE LIVE MANUAL PROGRESSION

`dist/core/manual-progression-v127.js` is the only live Công Pháp progression authority.

Canonical V127 contract:

- 29 realm stages including Phàm Nhân.
- 9 authored manual archetypes per stage = 261 Công Pháp.
- max Lv1000 per Công Pháp.
- 10 progression/advance gates.
- learned Công Pháp can contribute together according to V127 rules.

V144 retired the duplicate V103/V119 manual gameplay lane:

- removed `dist/core/technique-progression-v103.js` and its source map;
- retired `resource.technique_insight` / Bí Thuật Tàn Trang as Hunt/manual progression;
- removed Hunt legacy technique fragment and complete-manual minting;
- retired old 0–100 technique mastery progression as a power source;
- retired old manual equip/study/restore/player-facing APIs;
- retired manual-driven Hành Ấn selection, including the stale client snapshot surface;
- retired dungeon mastery gains for the dead manual system;
- removed V103/V119 manual stats/triggers/passives from live character combat and stat provenance;
- kept `technique-runtime-v119.js` only as a neutral compatibility boundary because combat modules still import its helper API;
- retained authored skill elemental identity such as `primaryRoot` damage coefficients as existing combat content; this is **not** a requirement for redesigned V145 Linh Căn;
- Battle Đạo V2 remains live and realm-driven; do not reintroduce legacy manual gates for Battle Đạo skills/passives.

Old save fields such as `knownTechniqueIds`, `techniqueMastery`, `activeTechniqueId`, `equippedTechniqueIds`, `techniqueFragments` and `restoredTechniqueIds` may remain as inert compatibility data until a later save-schema migration. They must not mint rewards, expose progression, or add combat power.

V144 closure regression: `qa/tests/v144-technique-v103-retirement-test.js`.

Primary retirement commit: `cd4be634842d05f9185c6c5c8782fcb29ccc6fd2` (`feat(v144): retire V103 V119 manual progression`).
Final source closure commit: `5f49003b0324059929a5181ff1ff8f10d595b053` (`fix(v144): close technique retirement cleanup`).

## 6. Balance closure caused by retiring legacy manual combat

Removing V103/V119 combat power changed the shared CombatKernel balance envelope, so V144 recalibrates the live systems rather than restoring dead manual bonuses:

- Hỏa Set immortal-grade curve adjusted minimally to keep the five live elemental-named Sets inside the existing 15% aggregate role envelope.
- Battle Đạo V2 representative Dao Hanh 70 shared-kernel coefficients recalibrated; no PvP-only or Boss-only tuning was introduced.
- `qa/tests/v129-global-build-balance-test.js` passes with all eight Main Đạo inside the canonical 35–65% representative round-robin envelope.

## 7. V144 CANONICAL QA — PASS / LOCKED

Normal `V140 Canonical QA` run `34147222773` completed **SUCCESS** on commit `1e2ee21085fb5c98df62f4f5593cd8eeb160e03e`.

PASS gates:

- Codebase health scan;
- V140 cultivation core;
- V140 cultivation transport;
- V140 zero legacy;
- V141 Hunt × Cultivation closure;
- V142 Equipment × Hunt;
- backend fast gate;
- frontend fast gate;
- backend closure;
- frontend closure.

The temporary V144 patch/finalization workflows were removed. V144 is closed. Do not reopen V103/V119 manual gameplay because obsolete tests, old saves or historical content mention it; only compatibility data may remain inert until a later explicit migration.

## 8. NEXT WORK — V145 LINH CĂN REDESIGN / REQUIREMENTS RESET

The user reset V145 requirements on **2026-09-08**. The previous `Linh Căn × Ngũ Hành Closure` plan is cancelled and must not be revived from chat history, historical design files or legacy code.

Cancelled as mandatory V145 requirements:

- exactly five Hành Kim/Mộc/Thủy/Hỏa/Thổ;
- skill `primaryRoot` as Linh Căn authority;
- Linh Căn × Boss Ngũ Hành matchup;
- Linh Căn × Equipment Set resonance;
- adding elemental attributes/progression back to V142 items;
- Hunt elemental material/drop matrix;
- Hành Ấn / Element Seal as a bridge;
- historical `8 Bản Đạo × 5 Hành` and Set 2/4/6 Linh Căn design.

V145 starts again from a source-first audit, then a new product contract must be locked **before gameplay code is changed**.

Mandatory redesign questions:

- what a Linh Căn is in this game and how many the player owns;
- acquisition/initialization;
- primary progression axis and long-term ceiling;
- milestone/breakthrough structure;
- concrete benefit/effect without duplicating Trang Bị/Công Pháp/Battle Đạo;
- upgrade materials, sources and sinks;
- Luân Hồi persistence/reset behavior if relevant;
- caps/balance boundaries;
- player-facing UI flow;
- migration/compatibility for V131/V132/V133 data.

Closure conditions after the new contract is approved:

- exactly one live player-facing Linh Căn progression authority;
- every consumed material has a live source and every minted progression material has a sink;
- no dead currency, dead button or display-only power;
- backend/frontend/save/economy/consumer are consistent;
- any legacy Hành/Element Seal/root fields not used by the new contract are migrated, retired or compatibility-inert based on actual consumer audit;
- targeted V145 tests PASS;
- normal full V140 Canonical QA SUCCESS before marking V145 CLOSED.

Detailed execution plan is in `NEXT_CHAT_TASKS.md`.
