# CURRENT CHECKPOINT — V160 FULL-LIFE ECONOMY & PACING AUDIT

**Date:** 2026-09-11  
**Canonical branch:** `feature/v160-full-life-economy-pacing-simulation`  
**Gameplay/web version:** `1.40.0-alpha.24.0`  
**Baseline:** V140–V159 CLOSED / LOCKED.  
**Main:** intentionally untouched at `6c9f462efe6a87725d61845809e82474df6c58e9`.  
**Rule:** current feature-branch HEAD is source of truth. Never merge `main` unless the user explicitly asks.

## V160 purpose

V160 is **measurement/audit**, not a blind rebalance and not a second gameplay architecture. It reads production authorities to reconcile full-life Tu Vi pacing with acquisition constraints.

Coverage:

- 118 realm orders / 29 major milestones;
- 15s cultivation tick;
- current 3h/day Bế Quan runtime;
- Công Pháp V127 Tu Vi envelopes + production Vạn Tượng fragment acquisition;
- Alchemy V146 cultivation pills, Herb and Yêu Đan sources;
- 8 Resource-PvE categories;
- Bound Jade recurring economy;
- Linh Căn V145 nourishment + realm-tier Bản Nguyên gates;
- Luân Hồi tree/Fate shared RP scale.

## Key measured results

- authored baseline Tu Vi budget: **1303.003 days**;
- baseline + daily Bế Quan steady envelope: **886.395 days**;
- baseline + daily Bế Quan + modeled max-supreme Tu Vi pills: **832.303 days**;
- all-unlocked Công Pháp diagnostic envelopes: Lv100 **977.838d**, Lv500 **443.774d**, max **108.136d**;
- sharp authored duration jumps: order 1 **5.71×**, order 10 **3.15×**;
- recurring Bound Jade: **6240 / 28d = 222.857/day**, equivalent to **43.33 discounted pulls / 28d**;
- 1000 pulls on one manual banner = **646.15 days** of all recurring Bound Jade under a deliberately best-case one-banner assumption;
- Sáng Thế target breaker manual after 1000 production pulls: **3696 / 23657** fragments, only **5/10** gates affordable;
- Linh Căn Lv1000: +**45.576%** base cultivation, **19,162,388** cumulative nourishment, **9** ascensions;
- Linh Căn Lv10,000: +**101.856%**, **4,613,835,270** cumulative nourishment, **99** ascensions;
- virtual-Hunt Bản Nguyên pity: **500 kills**;
- Luân Hồi tree max **1,533,870 RP** + Fate **310,000 RP** = **1,843,870 RP** shared budget;
- order117 repeat reference **84,500 RP**, or **105,625 RP** with max +25% RP-gain node;
- simple tree-only terminal-repeat scale reference: **19 lives**.

## Findings locked for next phase

1. Do **not** nerf Công Pháp based on the theoretical max envelope; production acquisition strongly constrains it.
2. Current Bế Quan grants authored % of current-realm requirement rather than scaling from the accelerated Tu Vi rate. This relation needs an explicit Phase-B design decision before any change.
3. Luyện Khí and Trúc Cơ baseline duration jumps need player-journey review; Trúc Cơ must be evaluated together with onboarding density.
4. Linh Căn remains Hunt/realm-gated and must not be modeled as a free percent accelerator.
5. Luân Hồi is inherently multi-life; exact optimization belongs to the dedicated multi-life phase.
6. Vạn Tượng realistic pacing must account for competition across all 8 banners, not one-banner-only spend.

Detailed evidence: `V160_FULL_LIFE_ECONOMY_PACING_AUDIT.md`.

## V160 files/gates

- `dist/core/full-life-economy-pacing-v160.js`
- `dist/core/full-life-acquisition-v160.js`
- `dist/core/full-life-audit-summary-v160.js`
- `qa/tests/v160-full-life-economy-pacing-test.js`
- `qa/tests/v160-acquisition-economy-test.js`
- `qa/tests/v160-full-life-audit-closure-test.js`

Canonical run **34540649913** on implementation HEAD `44d8c958884a04bc2c642e9fa2ad861a1b6d9791` was SUCCESS: V160 pacing PASS, V160 acquisition PASS, backend closure 90/90, frontend closure 20/20.

The final documentation-sync HEAD must also pass canonical QA before V160 is treated as formally CLOSED / LOCKED.

## Next phase

After exact final V160 HEAD is green, proceed to **Phase B — evidence-backed Economy & Pacing fixes**. No new gameplay system is authorized by this checkpoint. Do not merge main.
