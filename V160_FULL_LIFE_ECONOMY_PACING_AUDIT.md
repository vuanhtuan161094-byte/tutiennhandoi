# V160 — FULL-LIFE ECONOMY & PACING AUDIT

**Date:** 2026-09-11  
**Branch:** `feature/v160-full-life-economy-pacing-simulation`  
**Baseline:** V140–V159 CLOSED / LOCKED.  
**Scope:** measurement/audit only; no gameplay-number rebalance is applied by V160.

## 1. What V160 measures

V160 reads existing production authorities instead of introducing another progression simulator:

- all 118 cultivation orders / 29 major milestones;
- authored Tu Vi requirements and 15-second production tick;
- Bế Quan current runtime contract;
- Công Pháp V127 flat Tu Vi contribution at diagnostic Lv100/Lv500/Lv1000 envelopes;
- Đan V146 cultivation shortcut and Herb/Yêu Đan source economy;
- all eight resource-PvE categories and their real first-clear/time-based farm contract;
- Bound Jade recurring acquisition budget;
- production Vạn Tượng manual banner, realm pool, orientation and fragment gates;
- Linh Căn V145 growth + every-100-level realm-tier Bản Nguyên gates;
- Luân Hồi tree/Fate shared RP budget and representative real reward outputs.

V160 does **not** claim to have fast-forwarded a fake player for hundreds of days. Where a calendar conversion is used, the assumption is printed explicitly.

## 2. Core pacing result

Authored baseline Tu Vi budget from order 0 through 116 is **1303.003 real days** before accelerators.

Phase split inherited from the production curve:

- Phàm Nhân → Độ Kiếp: **107.003 days**;
- Immortal foundation: **500 days**;
- Transcendent: **588 days**;
- Creation: **108 days**.

The longest single authored order is **Sáng Thế Chủ hậu kỳ (order 116): 46.44 days**.

Two sharp baseline jumps are flagged rather than silently smoothed:

- order 1 / Luyện Khí entry: **5.71×** the preceding order duration;
- order 10 / Trúc Cơ entry: **3.15×** the preceding order duration.

These are Phase-B playtest/rebalance candidates, not automatic defects.

## 3. Bế Quan finding

Production Bế Quan remains **3h/day** with the V140 bank contract. Current runtime grants an authored percentage of the current realm requirement as concrete Tu Vi; it is **not derived from the current accelerated Tu Vi/15s rate**.

Diagnostic steady-state totals:

- baseline only: **1303.003 days**;
- baseline + one full daily Bế Quan claim: **886.395 days**;
- baseline + daily Bế Quan + modeled max-supreme cultivation pills: **832.303 days**.

This means Bế Quan becomes relatively weaker as Công Pháp/Linh Căn flat/% rate sources grow. V160 does not silently change that contract. Phase B must explicitly decide whether the current relation is intended.

## 4. Công Pháp: theoretical power vs real acquisition

If every unlocked manual were magically available at the same progression level, the passive Tu Vi envelopes are:

- all unlocked manuals Lv100: **977.838 days** total;
- all unlocked manuals Lv500: **443.774 days**;
- all unlocked manuals max: **108.136 days**.

The max envelope creates >10× base-rate diagnostics from late Immortal+ orders, but V160 does **not** interpret this as an immediate nerf target because production acquisition strongly constrains it.

Production Vạn Tượng facts measured by deterministic live gacha calls:

- 8 category banners share the same Bound Jade economy;
- recurring Bound Jade equivalent: **222.857/day**, or **6240/28 days**;
- 100 pulls cost 14,400 Bound Jade = **64.62 days** if every recurring jade is spent on this one manual banner;
- 1000 pulls cost 144,000 = **646.15 days** under the same intentionally best-case assumption.

Representative target breaker manuals after 1000 production pulls:

- Phàm Nhân `manual.8`: **3808 / 7888** Lv1000 gate fragments; **8/10** gates affordable;
- Chân Tiên `manual.134`: **3668 / 14849**; **6/10** gates;
- Sáng Thế Chủ `manual.260`: **3696 / 23657**; **5/10** gates.

Conclusion: **do not nerf Công Pháp from the all-max envelope alone**. The real balance problem must consider fragment acquisition, generic strengthening materials, and the fact that the player has seven other banner families competing for the same currency.

## 5. Linh Căn acquisition finding

Linh Căn is a strong long-run accelerator but is not freely purchasable from Linh Tủy:

- Lv100: +**9.94%** base cultivation; cumulative nourishment **122,586**;
- Lv1000: +**45.576%**; cumulative nourishment **19,162,388**; **9** ascensions consumed;
- Lv10,000: +**101.856%**; cumulative nourishment **4,613,835,270**; **99** ascensions consumed.

Every 100-level gate requires the matching realm-tier Bản Nguyên. Virtual Hunt pity remains **1 Bản Nguyên / 500 kills**, with first-clear sources also realm-gated.

Conclusion: Linh Căn pacing must stay tied to Hunt/realm progression in Phase B; using only its displayed percentage would overstate real acceleration.

## 6. Luân Hồi scale finding

Production RP budget:

- tree max: **1,533,870 RP**;
- Fate unlocks: **310,000 RP**;
- combined shared budget: **1,843,870 RP**.

Representative repeat-life rewards at CP ratio 1:

- order 18: 420 RP;
- order 45: 3,900 RP;
- order 85: 29,250 RP;
- order 117: 84,500 RP;
- order 117 with max +25% RP-gain node: 105,625 RP.

A simple terminal-repeat reference is **19 terminal lives** for the tree alone. This is only a scale reference: records, RP-gain investment, passing choices and Fate spending change the real sequence.

Conclusion: full Luân Hồi acceleration is a multi-life progression problem and must not be injected into a first-life timing forecast. Exact optimization remains Phase E.

## 7. Other production economy confirmations

- Alchemy remains 11 families with only canonical Herb + Yêu Đan ingredient lanes.
- 800 Hunt Boss first-clears yield 240 same-major Yêu Đan through V146 authority.
- Săn Ảo uses real TTK settlement with a hard 0.25s/kill floor and does not mint Tu Vi.
- All 8 resource-PvE categories use CombatKernel V2 first-clear, then real time-based farming.
- Specific fragments remain Vạn Tượng-only; repeat guardian fights cannot bypass them.
- First Genesis Epoch economy remains bounded: first-clear core 64, first-epoch modeled core budget 148, residual farm about **2.897 days** at the production Sáng Thế source rate.

## 8. Evidence-backed Phase B priorities

1. **Bế Quan relation:** decide explicitly whether percentage-of-realm is desired or whether reward should scale with the current cultivation-rate authority. Do not patch from memory; change only after locking the intended contract.
2. **Luyện Khí jump:** test whether the 5.71× jump is a deliberate retention gate or an early-game stall.
3. **Trúc Cơ jump + onboarding:** evaluate the 3.15× jump together with the large system-unlock burst.
4. **Vạn Tượng spend model:** model realistic allocation across 8 banners. Current 64.62/646.15-day conversions are deliberately one-banner best cases.
5. **Công Pháp:** preserve strong Lv1000 payoff unless acquisition-adjusted data shows a real runaway. Do not nerf from theoretical max alone.
6. **Linh Căn:** preserve realm-tier Bản Nguyên gating; measure Hunt-linked growth against realm pacing.
7. **Luân Hồi:** defer exact multi-life optimization to the dedicated multi-life phase; only protect the 5% major-requirement cap and shared RP budget now.

No new system is justified by V160 findings.

## 9. V160 code/gates

Added:

- `dist/core/full-life-economy-pacing-v160.js`
- `dist/core/full-life-acquisition-v160.js`
- `dist/core/full-life-audit-summary-v160.js`
- `qa/tests/v160-full-life-economy-pacing-test.js`
- `qa/tests/v160-acquisition-economy-test.js`
- `qa/tests/v160-full-life-audit-closure-test.js`
- canonical workflow gates for all three V160 audit layers.

Validated implementation run before final documentation sync: canonical run **34540649913 — SUCCESS** on HEAD `44d8c958884a04bc2c642e9fa2ad861a1b6d9791`; both V160 gates present at that point passed, backend closure **90/90**, frontend closure **20/20**.

The reconciled closure gate is added after that implementation run. The final documentation-sync HEAD must pass the canonical workflow before V160 is formally considered CLOSED / LOCKED.
