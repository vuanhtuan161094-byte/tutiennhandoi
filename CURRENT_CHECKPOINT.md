# CURRENT CHECKPOINT — V158 FULL GAMEPLAY INTEGRATION CLOSED

**Date:** 2026-09-10  
**Branch:** `feature/v158-full-gameplay-integration`  
**Gameplay/web version:** `1.40.0-alpha.24.0`  
**Status:** V140–V158 **CLOSED / LOCKED** once the exact current checkpoint HEAD passes canonical QA.  
**Implementation HEAD validated:** `501f5f7d4a72678b094e7080eb458a022301d6f4`  
**Implementation QA run:** `34470627889` — **SUCCESS**  
**Main:** intentionally **not merged / untouched**.  
**Rule:** current branch source is truth. Do not merge `main` unless the user explicitly asks.

## 1. Closed baseline

V140–V157 remain closed exactly as recorded by the previous checkpoint. V158 adds a cross-system player-journey closure; it does not rebuild those systems or create a second gameplay architecture.

- V140 — Tu Luyện / Bế Quan.
- V141 — Săn Yêu × Tu Luyện.
- V142–V143 — Trang Bị × Hunt + Set Resonance.
- V144 — legacy technique retirement.
- V145 — Linh Căn.
- V146 — Đan Dược.
- V147 — Linh Thú.
- V148 — Tri Kỷ.
- V149–V151 — Pháp Bảo / no-Bảo-Khí / Chí Bảo.
- V152 — Công Pháp.
- V153 — Luân Hồi.
- V154 — six-Lục-Đạo Phân Thân authority.
- V155 — Skills / Tâm Pháp authority.
- V156 — Động Phủ.
- V157 — Endgame continuity.
- **V158 — Full Gameplay Integration / Player Journey: CLOSED.**

Do not reopen a closed system because of old chat text, old save compatibility fields or historical tests. Reopen only for a real regression or a new explicit requirement.

## 2. V158 canonical player loop

The player-facing loop is now explicitly locked as:

`Tu Luyện → Farm → Nuôi Build → Công Phá → Luân Hồi`

The guide exposes 16 distinct player-facing systems. Every system must explain:

- purpose;
- what the player does;
- what it costs;
- what it gives;
- where its source/reward comes from.

The progression guide spans all **29 major milestones** from Phàm Nhân through Sáng Thế Chủ and remains verified through realm order **117**.

## 3. V158 findings fixed

### Hunt/Tu Vi contradiction

The old player-facing guide incorrectly said Săn Yêu directly granted Tu Vi. V141 production authority already forbids this.

V158 now states:

- Săn Yêu gives Linh Thạch, Yêu Đan and loot/materials;
- Săn Yêu does **not** mint Tu Vi directly;
- Tu Luyện continues independently at **100%** while hunting/farming.

### Stale Luân Hồi “Thí Luyện” copy

The old guide still described `kết toán → thí luyện → chốt reward`, although the current lifecycle no longer requires a fake trial/min-age/min-realm/first-clear gate.

V158 player-facing lifecycle is:

`xem reward dự kiến → Tọa Hóa → kết toán → chọn kế thừa → mở đời kế`

Luân Hồi uses actual life achievements and Reincarnation Energy / CP rules. No fake mandatory Thí Luyện step is presented to the player.

### Độ Kiếp guidance ordering

The old smart guide could recommend **Dẫn Thiên Kiếp** while the mandatory matching floor in **Thiên Kiếp Cổ Trường** was not yet first-cleared, producing an action guaranteed to be blocked.

V158 now orders this correctly:

1. If Tu Vi is full but the mandatory Luyện Kiếp gate is missing, the primary task is `tribulation-prep` and routes to the required dungeon first-clear.
2. Only after that gate is ready does the guide offer **Dẫn Thiên Kiếp**.

### Duplicate stage-content recommendation

The smart session loop could add the same `stage-content` recommendation from both progression and content-loop surfaces. V158 deduplicates this so the player sees one actionable task instead of repeated guidance.

## 4. Cross-system journey invariants

The permanent V158 integration gate verifies:

- 5-step core loop and 16 unique player-facing systems;
- all 29 major progression milestones through order 117;
- unlock coherence at Phàm Nhân, Luyện Khí, Trúc Cơ, Tử Phủ, Kim Đan, Nguyên Anh and Hóa Thần;
- Hunt never claims direct Tu Vi and explicitly coexists with 100% Tu Luyện;
- Luân Hồi has no resurrected min-age/min-realm/first-clear fake gate;
- specialized resource content uses **CombatKernel V2 first-clear → real time-based farm**;
- repeat guardian combat cannot spam progression materials or bypass gacha-specific fragments;
- all **261 Công Pháp** remain Lv1–1000 with ten 100-level gates and no Action Speed/hidden Chân Nguyên package;
- roster remains **8 Linh Thú + 8 Tri Kỷ + 12 Pháp Bảo + 8 Chí Bảo**;
- fresh Động Phủ has exactly **8 facilities**;
- production Phân Thân authority remains exactly **6 Lục Đạo**;
- blocked Độ Kiếp guidance resolves Luyện Kiếp before offering real tribulation;
- smart guidance has no duplicate task ids/stage-content duplication;
- Immortal+ contains **18 explicit four-order stages**, each with a five-floor content objective;
- Sáng Thế Chủ is the terminal major milestone rather than a fake next realm.

## 5. V158 test philosophy

V158 does **not** fabricate a compressed “played 500 hours” simulation and call that production PASS.

Instead:

- the V158 gate checks the cross-system journey, unlocks, contracts and player-facing guidance;
- the same canonical workflow also runs the existing real production gates for cultivation, Hunt, equipment, Linh Căn, alchemy, confidants, artifacts, relics, Công Pháp, Luân Hồi, Phân Thân, Động Phủ and endgame;
- CombatKernel V2 remains the shared real combat authority;
- source/sink and first-clear/farm behavior remain tested in their production subsystem gates.

This is the canonical meaning of “full gameplay integration” for V158.

## 6. Canonical journey by phase

- **Phàm Nhân:** Tu Luyện begins; Linh Căn and origin/core-stat foundations are available.
- **Luyện Khí:** Săn Yêu, Phó Bản, loot/equipment and social gameplay create the first `fight → first-clear → farm → upgrade` loop while Tu Luyện continues in parallel.
- **Trúc Cơ:** player chooses Đạo identity; Skills/Tâm Pháp, Đan, Động Phủ, Collection/Gacha and Luân Hồi/meta tools open.
- **Tử Phủ / Kim Đan:** faction layer becomes available; asynchronous Đấu Pháp opens at Kim Đan as a build benchmark.
- **Nguyên Anh:** Thần Hồn and exactly six Lục Đạo Phân Thân turn already-cleared content into parallel/offline farm capacity.
- **Hóa Thần → Đại Thừa:** Đạo Ý/Đạo Vực and stage-specific build objectives become more important; Hợp Thể checks body–soul–dao–artifact balance rather than only one power number.
- **Độ Kiếp:** unique hard cadence break; matching Thiên Kiếp Cổ Trường floor must be first-cleared before the real Heavenly Tribulation.
- **Nhân Tiên → Vĩnh Sinh:** named Immortal+ refinements and five-floor stage dungeons accompany the continuing realm climb.
- **Sáng Thế Chủ:** reaches orders 114–117; terminal Sáng Thế content feeds the Genesis Epoch endgame loop.

Across the whole journey, learned Công Pháp remain active, build systems layer onto shared CombatEntity/CombatKernel, one active Chí Bảo changes a combat law, Động Phủ improves long-term efficiency, and Luân Hồi converts the achievements of one life into persistent advantages for later lives.

## 7. Known design risk — not a closure regression

The strongest remaining design risk is the **Immortal+ ladder from Nhân Tiên through Vĩnh Sinh**.

Source currently gives 18 named major stages with escalating fantasy identity, but much of the mechanical cadence follows the same template: improve stage metrics + clear a five-floor dungeon. This is valid production content and V158 does not rewrite it, but it risks feeling like renamed/reskinned repetition compared with the more varied Mortal→Độ Kiếp journey.

This should be treated as a future game-design/pacing improvement, not as a reason to reopen V140–V158.

A second UX risk is Trúc Cơ: many long-term systems unlock together. The systems are individually valid, but onboarding/hierarchy may need simplification during UI/UX production.

## 8. Known technical debt — cleanup later

A stale compatibility API surface still exists around `runReincarnationTrialV2` in facade/API code while the current player-facing lifecycle no longer uses a mandatory reincarnation trial. Current app flow does not use this as the normal Luân Hồi path.

Do not reintroduce trial gameplay merely to justify that legacy surface. Retire or reconcile it during a dedicated code-cleanup phase.

## 9. QA evidence

Implementation exact HEAD: `501f5f7d4a72678b094e7080eb458a022301d6f4`  
Canonical run: `34470627889` — **SUCCESS**.

Observed on that exact implementation SHA:

- V140–V157 canonical gates: PASS.
- **V158 Full player journey integration: PASS.**
- Backend fast: PASS.
- Frontend fast: PASS.
- Backend closure: PASS.
- Frontend closure: PASS.

The exact current checkpoint/documentation HEAD must also have a SUCCESS canonical workflow run. If that final run is not SUCCESS, V158 is not considered locked regardless of this file title.

## 10. V158 changed files

- `dist/core/player-experience-v105.js` — corrected Hunt/Luân Hồi player truth, tribulation guidance ordering and duplicate task guidance.
- `qa/tests/v158-player-journey-integration-test.js` — cross-system player-journey gate.
- `.github/workflows/v140-ci.yml` — V158 canonical gate.
- `CURRENT_CHECKPOINT.md` — this closure record.

No second gameplay resolver, duplicate progression system or fake accelerated farm simulator was added.

## 11. Next-session rule

Start from `feature/v158-full-gameplay-integration` after confirming the exact checkpoint HEAD is green. Treat V140–V158 as CLOSED. Do not reopen closed systems without a real regression or explicit new user requirement. Do not merge `main` unless explicitly instructed.