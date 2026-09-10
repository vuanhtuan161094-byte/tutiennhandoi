# CURRENT CHECKPOINT — V159 ECONOMY / PACING / ENDGAME VARIETY

**Date:** 2026-09-10  
**Canonical branch:** `feature/v159-economy-pacing-endgame-variety`  
**Gameplay/web version:** `1.40.0-alpha.24.0`  
**Baseline:** V140–V158 CLOSED / LOCKED.  
**V159 implementation HEAD validated:** `0e208ba126ecf9452116af7b7c4358f3363979a3`  
**V159 canonical QA run:** `34478194159` — SUCCESS.  
**Main:** intentionally untouched at `6c9f462efe6a87725d61845809e82474df6c58e9`.  
**Rule:** current feature-branch HEAD is source of truth. Never merge `main` unless the user explicitly asks.

## 1. Closed baseline

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
- V154 — exactly six Lục Đạo Phân Thân.
- V155 — Skills / Tâm Pháp authority.
- V156 — Động Phủ.
- V157 — Endgame continuity.
- V158 — Full Gameplay Integration / Player Journey.

Do not reopen a closed subsystem because of stale chat, old compatibility fields or obsolete handoff files. Reopen only for a real regression or an explicit new requirement.

## 2. V159 scope actually implemented

V159 does not add another progression architecture. It measures the existing progression baseline and makes the Immortal+ cadence more action-oriented using existing authorities.

### Pacing ledger

- `CULTIVATION_REALMS_V140` remains the authority.
- Exactly 118 realm entries are covered: orders 0–116 have positive baseline target time; order 117 is terminal Sáng Thế Chủ with target time 0.
- The V159 report splits baseline Tu Vi time into Mortal→Độ Kiếp, Immortal foundation, transcendent, creation and total baseline buckets.
- These numbers are a **baseline Tu Vi budget**, not a promise of real calendar completion time; Linh Căn, Công Pháp, Luân Hồi, Bế Quan and other accelerators remain separate modifiers.

### Immortal+ variety

All 18 Immortal+ major stages keep real five-floor dungeons, first-clear resource bursts and time-based farm output. Their player-facing cadence is grouped into five distinct identities rather than one repeated generic refinement label:

`immortal-foundation → law-refinement → limit-break → cosmic-refinement → genesis-cycle`

### Real endgame actions

- Cực Hạn exposes the existing **Phá Cực** authority only at the real boundary.
- Sáng Thế Chủ final gate requires real creation metrics plus Genesis resources before **Khai Kỷ Nguyên**.
- Genesis Epoch is repeatable and partially resets creation metrics while preserving bounded/log-scaled epoch authority; it is not a one-click permanent max.
- Sáng Thế Nguyên Hải supplies both the refinement currency and the mandatory epoch token.
- Public gameplay dispatch exposes existing manifestation / Phá Cực / Genesis Epoch actions without constructing a second CombatEngine or CombatKernel.
- Journey UI mounts real Phá Cực / Khai Kỷ Nguyên controls through the existing `/api/action` + `perform` transport and persists returned state.
- Immortal+ player-journey milestones are no longer marked provisional through realm order 117.

## 3. V159 implementation chain from V158

V159 is exactly 8 commits ahead of V158 and 0 behind. The implementation sequence is:

1. expose canonical endgame actions through gameplay dispatch;
2. make Immortal+ cadence action-oriented;
3. add V159 economy/pacing/endgame-variety gate;
4. wire the V159 gate into canonical CI;
5. align the terminal gate with Genesis Epoch canonical behavior;
6. make Phá Cực and Genesis Epoch clickable in the journey UI;
7. mount the endgame journey UI bridge;
8. lock production journey UI reachability.

## 4. QA evidence

Exact implementation HEAD: `0e208ba126ecf9452116af7b7c4358f3363979a3`  
Canonical run: `34478194159` — **SUCCESS**.

Observed on that exact SHA:

- V140–V158 canonical gates: PASS.
- V159 Economy pacing and endgame variety: PASS.
- Backend fast gate: PASS.
- Frontend fast gate: PASS.
- Backend closure: PASS.
- Frontend closure: PASS.

The final documentation-sync HEAD must also pass canonical QA before V159 is treated as formally CLOSED / LOCKED.

## 5. Known remaining design questions

- Trúc Cơ still unlocks many long-term systems close together; this is primarily an onboarding/UI hierarchy issue.
- V159 improves Immortal+ cadence and action reachability but does not claim that all economy values have been globally rebalanced by a real-time full-life simulation.
- Do not invent V160 automatically. The next implementation scope must follow the user's next explicit priority.

## 6. Next-session rule

Start from `feature/v159-economy-pacing-endgame-variety`, confirm the exact current branch HEAD is green, then treat that branch as canonical. `main` remains intentionally untouched.