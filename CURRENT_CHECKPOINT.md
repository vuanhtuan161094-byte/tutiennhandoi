# CURRENT CHECKPOINT — V157 FAST CLOSURE

**Date:** 2026-09-10  
**Branch:** `feature/v152-v157-fast-closure`  
**Gameplay/web version:** `1.40.0-alpha.24.0`  
**Status:** V140–V157 **CLOSED / LOCKED** once the exact current checkpoint HEAD passes canonical QA.  
**Implementation HEAD validated:** `15da841d6b0570c8d564facb5ab322f6d63d802e`  
**Implementation QA run:** `34467563471` — **SUCCESS**  
**Main:** intentionally **not merged / untouched**.  
**Rule:** current branch source is truth. Do not merge `main` unless the user explicitly asks.

## 1. Closed baseline

- V140 — Tu Luyện: CLOSED.
- V141 — Săn Yêu × Tu Luyện: CLOSED.
- V142 — Trang Bị × Hunt: CLOSED.
- V143 — Hunt reward authority + Set Resonance: CLOSED.
- V144 — Công Pháp/Bí Thuật legacy retirement: CLOSED.
- V145 — Linh Căn infinite progression: CLOSED.
- V146 — Đan Dược production closure: CLOSED.
- V147 — Linh Thú progression/economy/combat: CLOSED.
- V148 — Tri Kỷ progression/economy/combat + V129 cross-build balance: CLOSED.
- V149 — Pháp Bảo progression/economy/combat/combo + V129 cross-build balance: CLOSED.
- V150 — Bảo Khí removed from production Pháp Bảo/Chí Bảo combat: CLOSED.
- V151 — Chí Bảo one-slot combat-law rebuild + all-eight production combat QA: CLOSED.
- **V152 — Công Pháp contract correction and regression lock: CLOSED.**
- **V153 — Luân Hồi current production contract: CLOSED.**
- **V154 — six-Lục-Đạo Phân Thân authority: CLOSED.**
- **V155 — current Skills/Tâm Pháp authority and major-system runtime contract: CLOSED.**
- **V156 — Động Phủ production + standalone transport: CLOSED.**
- **V157 — Endgame progression continuity to Sáng Thế Chủ/Genesis Epoch: CLOSED.**

Không mở lại hệ đã CLOSED vì chat cũ, save cũ, test lịch sử hoặc compatibility field còn tồn tại. Chỉ mở lại khi có regression thật hoặc user đổi yêu cầu.

## 2. V152 Công Pháp lock

Canonical Công Pháp remains:

- 29 realm groups × 9 manuals = **261 Công Pháp**.
- Every manual has **Lv1–1000** and 10 hundred-level advancement gates.
- All learned manuals remain effective; there is no equip/current-realm filter.
- Every manual contributes authored Tu Vi plus combat stats.
- Công Pháp does **not** grant breakthrough-requirement reduction.
- Công Pháp does **not** grant Action Speed or a hidden Chân Nguyên/max-spirit package.

V152 fixes the contradictory precision manual:

- `Thiên Cơ Bộ Pháp` changed from **Né + Tốc Độ Hành Động** to **Né + Chính Xác**.
- Stat line changed from `actionSpeedPct` to bounded direct `accuracyPct`.
- The obsolete `actionSpeedPct` Công Pháp strength weight was removed.
- `accuracyPct` reaches the real production combat consumer through `collection-progression-v12316.js`.

Permanent V152 gates assert:

- all 261 manuals declare `noActionSpeed=true` and `noSpirit=true`;
- no manual stat line can contain `actionSpeedPct`, `maxSpiritPct` or `spiritFlat`;
- Thiên Cơ Bộ Pháp keeps Dodge + Accuracy identity;
- the full manual package may have bounded Accuracy but must still have zero Action Speed;
- Phá Thế and Khiên manual stats continue to alter real CombatKernel V2 behavior.

## 3. V153 Luân Hồi lock

V153 does not rebuild the already-working Luân Hồi implementation. Existing production authority is retained and now runs explicitly in canonical CI.

Locked invariants include:

- Tu Luyện and Công Pháp trees remain separate authored progression domains.
- Tu Luyện R3 has **12 independent nodes**, each with 20 ranks.
- Công Pháp tree has **13 authored nodes**.
- `cultivation.majorBreakthroughRequirementReductionPct` is capped at **5%** at the validated max tree.
- retired Tu Luyện modifier lanes remain retired instead of being silently restored.
- Luân Hồi combat memories continue to use real CombatEntity/CombatEngine consumers rather than a hidden global total-damage scalar.
- cost invariant tests remain part of the canonical gate.

## 4. V154 Phân Thân lock

Production Phân Thân authority is exactly **6**, corresponding to Lục Đạo:

1. Thiên Đạo
2. Nhân Đạo
3. A Tu La Đạo
4. Súc Sinh Đạo
5. Ngạ Quỷ Đạo
6. Địa Ngục Đạo

Legacy parallel-worker capacity is not production Phân Thân authority. Save migration/compatibility cannot increase the canonical six-clone cap.

## 5. V155 Skills / Tâm Pháp lock

V155 is a regression closure, not another skill-system rewrite.

- Current skill runtime remains on the shared CombatEngine / CombatKernel V2 architecture.
- V129 Đạo Tính branch identities remain materially distinct at full progression.
- Tâm Pháp keeps full authored main/secondary passive ownership; secondary is not silently reduced to a legacy partial coefficient.
- Old V103 technique progression remains retired by the earlier V144 closure and must not be restored as a parallel player-facing authority.
- Current major-system audit remains a permanent V155 CI gate.

## 6. V156 Động Phủ lock

Canonical Động Phủ remains the existing production implementation with **8 facilities**.

The permanent gate verifies real consumers, including:

- Tàng Kinh Các lowering actual Công Pháp/Tâm Pháp strengthening cost;
- Tri Kỷ Các lowering actual intimacy strengthening cost;
- Huyết Trì and Luyện Thể Thất lowering their real mutation spends;
- Luyện Bảo Các retaining actual refinement discount behavior;
- Linh Thú Viên, Đan Phòng and Luyện Khí retaining production consumers;
- facility upgrades mutating real levels and spending canonical currencies;
- standalone transport rehydrating facility state and effects.

No duplicate Động Phủ system was added.

## 7. V157 Endgame lock

Endgame remains continuous on the V140 canonical realm progression.

Validated structural continuity:

- order 34 → 117 contains exactly **83 one-step transitions**;
- orders 41 → 46 contain exactly **5 Thiên Kiếp transitions**;
- canonical actions reach **Sáng Thế Chủ order 117**;
- Thiên Kiếp retry path does not restore legacy realm-RNG breakthrough logic;
- Sáng Thế Chủ can create the first **Genesis Epoch** through the canonical action.

V157 therefore closes continuity only; it does not invent a parallel endgame progression system.

## 8. V149–V151 locks retained

- Canonical Pháp Bảo equip: `collectionV12316.activeArtifactIds`.
- Canonical Chí Bảo equip: `collectionV12316.economyV12325.activeRelicId`.
- Chí Bảo active limit: **1** and active relic must be owned.
- Roster remains **12 Pháp Bảo + 8 Chí Bảo**.
- Production Pháp Bảo/Chí Bảo has **no Bảo Khí**.
- Pháp Bảo activation is trigger/condition + cooldown/once-per-battle + shared CombatEngine effect.
- Bảo Hồn remains infinite raw-only Công Lực / Thể Phách / Phòng Ngự progression for Pháp Bảo.
- Chí Bảo remains finite Lv1–100 / Bảo Giai I–V one-slot combat-law progression.
- Legacy `state.artifacts` has no production combat authority.

Do not restore Bảo Khí, multi-relic simultaneous activation, unowned active-id authority, stat-only Chí Bảo behavior or a second artifact combat resolver.

## 9. Canonical QA evidence

Implementation exact HEAD: `15da841d6b0570c8d564facb5ab322f6d63d802e`  
Canonical run: `34467563471` — **SUCCESS**.

Observed on that exact implementation SHA:

- V140–V151 pre-existing canonical steps: PASS.
- V152 Công Pháp contract: PASS.
- V153 Luân Hồi contract: PASS.
- V154 Phân Thân authority: PASS.
- V155 Skills/Tâm Pháp authority: PASS.
- V156 Động Phủ production + transport: PASS.
- V157 Endgame continuity: PASS.
- Backend fast: PASS.
- Frontend fast: PASS.
- Backend closure: PASS.
- Frontend closure: PASS.

The exact current checkpoint/documentation HEAD must also have a SUCCESS canonical workflow run. If that final run is not SUCCESS, V152–V157 are not considered locked regardless of this file title.

## 10. Changed files in V152–V157 fast closure

- `dist/core/manual-progression-v127.js` — removes Công Pháp Action Speed and replaces Thiên Cơ Bộ Pháp with Dodge + Accuracy.
- `qa/tests/v127-manual-progression-test.js` — permanent V152 no-speed/no-spirit and precision-manual invariants.
- `qa/tests/v129-stat-architecture-test.js` — bounded Accuracy allowed; Action Speed still hard-zero for Công Pháp.
- `.github/workflows/v140-ci.yml` — explicit V152→V157 gates using existing production tests.
- `CURRENT_CHECKPOINT.md` — this closure record.

No new adapter layer, test subsystem or parallel gameplay resolver was created.

## 11. Next-session rule

Start from `feature/v152-v157-fast-closure` after confirming its exact HEAD is green. Treat V140–V157 as CLOSED. Do not reopen closed systems without a real regression or a new explicit user requirement. Do not merge `main` unless explicitly instructed.