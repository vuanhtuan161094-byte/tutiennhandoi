# NEXT CHAT TASKS — GAME TU TIÊN NHÀN DỖI

**Date:** 2026-09-11  
**Canonical branch:** `feature/v160-full-life-economy-pacing-simulation`  
**Gameplay/web version:** `1.40.0-alpha.24.0`

## Rules

1. Current feature-branch HEAD is source of truth.
2. Read `CHAT_MOI_START_HERE.md` → `CURRENT_CHECKPOINT.md` → `V160_FULL_LIFE_ECONOMY_PACING_AUDIT.md` → this file.
3. V140–V159 are CLOSED / LOCKED. Do not reopen them without a real regression or explicit new requirement.
4. Do not restore retired mechanics because compatibility code/history still mentions them.
5. Do not merge `main` unless explicitly instructed.
6. Do not add new systems during Phase B; fix only evidence-backed economy/pacing issues.

## Current V160 closure state

V160 added production-authority full-life measurement for cultivation pacing, manual acquisition, Linh Căn acquisition and Luân Hồi scale.

Implementation evidence already green:

- canonical run `34540649913` — SUCCESS on `44d8c958884a04bc2c642e9fa2ad861a1b6d9791`;
- V160 pacing PASS;
- V160 acquisition PASS;
- backend closure 90/90;
- frontend closure 20/20.

A reconciled V160 closure gate has now been added. Confirm the exact current branch HEAD canonical run is SUCCESS before treating V160 as formally CLOSED / LOCKED.

## Phase B — next work after V160 green

Work in this order:

### B1. Bế Quan contract decision/audit

Current production behavior: 3h/day, reward is authored % of current-realm required Tu Vi, not a calculation from current accelerated Tu Vi/15s.

Before changing anything, compare the intended gameplay contract against this live behavior. If the intended contract remains percentage-based, leave V140 untouched. If an explicit new requirement says rate-based, change it with migration/provenance/tests rather than a hidden multiplier.

### B2. Early/mid pacing cliff audit

Investigate the two measured duration jumps:

- order 1 / Luyện Khí: 5.71×;
- order 10 / Trúc Cơ: 3.15×.

For Luyện Khí, validate the jump against first Săn Yêu / first-clear / idle-farm engagement.
For Trúc Cơ, evaluate timing together with the density of unlocked systems; do not solve onboarding by randomly reducing every number.

### B3. Realistic Vạn Tượng spending model

Current one-banner best case is intentionally unrealistic. Build a player-spend model across 8 banners with at least:

- focused manual build;
- balanced collection build;
- combat-first build.

Measure manual gate progress and collection starvation under the same recurring Bound Jade budget.

### B4. Acquisition-adjusted Công Pháp pacing

Feed realistic manual ownership/progression back into Tu Vi pacing. Only then decide whether any manual effect or fragment cost needs tuning. Preserve the strong Lv1000 payoff unless acquisition-adjusted data proves a real runaway.

### B5. Linh Căn Hunt-linked pacing

Measure nourishment + Bản Nguyên acquisition against actual realm/Hunt advancement. Preserve the every-100-level realm-tier gate. Look specifically for deadlocks or trivial maxing.

### B6. Economy/source-sink review

Use the V160 measurements to audit resource stockpile/deadlock across manual, heart, artifact, relic, pet, companion, bloodline and physique categories. Do not invent a currency to fix a source/sink problem unless existing authorities cannot solve it.

## After Phase B

Continue the already approved sequence:

- Phase C — Endgame gameplay variety;
- Phase D — Build/combat balance;
- Phase E — Luân Hồi multi-life;
- Phase F — Code/performance cleanup;
- Phase G — UI/UX Production;
- Phase H — VFX/art;
- Phase I — final player QA / release candidate.

Do not skip directly to UI while Phase-B progression changes can still affect unlock/pacing hierarchy.
