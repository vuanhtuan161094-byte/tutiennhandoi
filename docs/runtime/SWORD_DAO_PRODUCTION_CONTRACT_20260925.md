# SWORD DAO PRODUCTION CONTRACT — 2026-09-25

Status: **A–E CLOSED / LOCKED · F OPEN FOR 5-STAT MIGRATION**

Repository: `vuanhtuan161094-byte/tutiennhandoi`  
Branch: `main`

This document freezes the Sword design decisions agreed on 2026-09-25 so later chats/agents do not reconstruct them from memory.

## 1. Scope

Implementation order:

A. Sword production contract: fixed Chân Nguyên, Nộ, Kiếm Khí generation/spend.  
B. Kiếm Ý + 8 passives.  
C. Skill mastery / identity cleanup.  
D. Auto-AI / finisher windows.  
E. Targeted QA guards.

**F — 5-stat migration is a separate later slice.** Do not partially fake 5-stat scaling inside Sword before F.

The current locked Combat Backend V3 boundary remains intact. This work is a new gameplay/balance slice explicitly requested by the user.

## 2. Five base stats — design lock, runtime migration deferred to F

The future combat foundation remains exactly five primary stats:

- **Công Lực (CL):** primary offensive power source. Does not automatically grant Crit/Crit Damage.
- **Thể Phách (TP):** +20 HP and +1 Defense per point.
- **Thân Pháp (TPH):** +1 Mobility per point. Does not globally increase Action Speed.
- **Linh Lực (LL):** +1 Max Chân Nguyên per point. Does not automatically grant regen/CDR/efficiency.
- **Thần Thức (TT):** +1 Accuracy, +1 Control, +1 Resolve per point.

No sixth primary stat. No Physical/Magic split. No hidden Realm damage multiplier. No generic rule requiring hybrid skill scaling weights to sum to 3.

F6-tuned Sword scaling after the first production benchmark:

- Thanh Minh: 2.70 CL
- Lưu Quang: 1.35 CL + 1.55 TPH
- Tàng Phong: 1.50 CL
- Phá Vọng: 1.60 CL + 2.00 TT
- Liên Kiếm: 1.00 CL + 1.85 TPH
- Hồi Phong: 1.20 CL + 1.50 TPH
- Đoạn Cương: 3.00 CL
- Quyết Sinh: 2.10 CL + 2.00 TT
- Vạn Kiếm: 1.60 CL + 8.00 TT
- Đoạn Thiên: 2.10 CL + 2.00 TT

F6 rationale: the first 12-seed CombatKernel V3 run measured Lưu Quang at 76.76% and Ngự Kiếm at 53.08% of Trọng Trảm. A fixed-budget allocation sweep showed that reallocating back into CL could only reach 89.02% for Lưu Quang and 65.02% for Ngự Kiếm, so the old hybrid coefficients did not make TPH/TT specialization viable. The F6 tune therefore increases only the hybrid skill weights instead of granting TPH global Action Speed or TT a hidden global damage rule.

## 3. Sword resources

Sword has only two Dao-specific resources:

### Kiếm Khí

- Normal cap: **5**.
- Temporary Kiếm Vực cap: **7** only during high-realm Sword Domain evolution.
- Do not permanently raise the cap above 5.
- Kiếm Khí is short-term rotation fuel.

### Kiếm Ý

Longer combat-state progression:

- 0–9: **Tụ Ý**
- 10–19: **Ngưng Ý**
- 20+: **Kiếm Tâm**
- At current cap + Kiếm Ý Bất Diệt: **Ý Hóa Kiếm**

New generation rule replaces the old “every 3 direct actions +1” rule:

- spend 1–2 Kiếm Khí in one root action → **+1 Kiếm Ý**
- spend >=3 Kiếm Khí in one root action → **+2 Kiếm Ý**

Hội Tâm may remain a secondary interaction only if bounded; it must not recreate the old fast-build runaway.

Overflow conversion from Dưỡng Ý Chân Kinh:
- overflowed Kiếm Khí may convert to +1 Kiếm Ý;
- at most once per root action;
- internal cooldown scales **8s → 6s** from passive Lv1 → Lv20.

## 4. Chân Nguyên contract for Sword

Sword uses fixed authored Chân Nguyên costs. Cost must not scale with player Max CN.

Baseline candidate combat regeneration used for balancing: **2 CN/s**. This global number is not hard-locked until other Dao are tested.

Fixed costs:

| Skill | CN |
|---|---:|
| Thanh Minh Kiếm Thức | 0 |
| Lưu Quang Nhất Trảm | 3 |
| Tàng Phong Dưỡng Kiếm | 0 |
| Phá Vọng Kiếm Ấn | 5 |
| Lưu Quang Liên Kiếm | 5 |
| Hồi Phong Thủ Kiếm | 3 |
| Đoạn Cương Phá Thế | 8 |
| Nhất Kiếm Quyết Sinh | 9 |
| Vạn Kiếm Quy Tông | 12 |
| Thái Hư Nhất Kiếm · Đoạn Thiên | 0 CN + 100 Nộ |

Ultimate never requires CN.

## 5. Nộ / Ultimate Gauge contract

Per-skill authored generation:

| Skill | Nộ |
|---|---:|
| Thanh Minh | +4 |
| Lưu Quang | +3 |
| Tàng Phong | +8 |
| Phá Vọng | +5 |
| Liên Kiếm | +4 |
| Hồi Phong | +3 |
| Đoạn Cương | +6 |
| Quyết Sinh | +5 |
| Vạn Kiếm | +15 |
| Ultimate | +0; costs 100 |

Do not use one generic Active = +6 rule for Sword.

## 6. Kiếm Khí generation / spend rules

- **Thanh Minh:** successful damaging Basic → +1.
- **Lưu Quang:** if below 5, +1. If cast while at 5, spend 2 for Kiếm Khí Trảm / enhanced payoff.
- **Tàng Phong:** +2; mastery >=250 → +3; Cực Ý starting at 0–1 may end at 5.
- **Phá Vọng:** at 0–2 Qi, +1. At 3/4/5, spend 1/2/3 respectively, intentionally leaving 2 Qi.
- **Liên Kiếm:** below 3, +1; at 3–4 spend 1 for hit 4; at 5 spend 2 for hit 4+5 at high mastery.
- **Hồi Phong:** successful Counter generates Qi. At mastery >=500 the gain is **+2**, not +3. If full, the action may spend 1 for the counter follow-up before generation so overflow is not wasted.
- **Đoạn Cương:** spend 2; Cực Ý may spend 3. High mastery may waive spend against an already Broken target as authored.
- **Quyết Sinh:** spend available Qi up to 3; Cực Ý may spend up to 5.
- **Vạn Kiếm:** high mastery enhanced form spends 2 at start when enough Qi is available.
- **Đoạn Thiên:** spend up to 5.

No infinite refund loop. Refunds occur only after the root spend and are bounded to once/root.

## 7. Eight Sword passives — locked target

### Kiếm Ý Quyết
- Spending Qi is the primary way to build Kiếm Ý.
- Per Intent Crit: **+0.20% → +0.40%**
- At 10 Intent: **+3% → +6% Hội Tâm**
- At 20 Intent: **+4% → +8% Armor Pen**

### Dưỡng Ý Chân Kinh
- Overflow Qi → +1 Intent with chance **40% → 100%**
- max once/root
- internal cooldown **8s → 6s**

### Kiếm Ý Trường Tồn
- duration +2s → +8s
- decay from 1 stack/s to 1 stack/2s
- a real Qi spend refreshes Intent duration
- spend >=3 pauses decay for **1s → 2.5s**

### Phá Vọng Chân Ý
For Break/Finisher root actions:
- each Qi spent: **+2% → +4% Break**
- each Qi spent: **+0.5% → +1.25% action-local Armor Pen**
- if that action itself causes Thất Thế after spending >=2 Qi: refund 1 Qi with **25% → 100%** chance, once/root

### Kiếm Tâm Vô Cực
- Intent cap +2 → +10
- spend 1–2 Qi: **8% → 24%** chance to refund 1 Qi after action, once/root

### Kiếm Uy Lăng Thiên
- every 10 Intent: Sword direct damage **+1% → +3%**
- spend >=3 Qi: extra eligible effect **+2% → +5%**

### Kiếm Tâm Sát Ý
Requires Intent >=20, target Thất Thế, and spend >=3:
- damage **+8% → +15%**
- Crit/Heart damage **+10% → +20%**

### Kiếm Ý Bất Diệt
Only at current Intent cap:
- small/fast spender: bounded Ý Kiếm follow-up **20% → 30%**
- heavy spender: **+5% → +10% damage**, **+4% → +8% Break**
- Vạn Kiếm: one additional bounded Ý Kiếm wave equal to **0.4 → 0.7** normal wave

Remove the old generic capstone package “+30% direct damage +20% Gauge gain”.

## 8. Kiếm Tâm / Ý Hóa Kiếm presentation-mechanic rule

At 20 Intent, Sword enters Kiếm Tâm. Do **not** blindly add the same 15–30% projectile to every spender.

Each skill gets its own expression:
- Lưu Quang: sword-image follow-up
- Phá Vọng: Intent folds into Break
- Liên Kiếm: final hit becomes Ý Kiếm
- Quyết Sinh: Intent collapses into the single killing slash
- Vạn Kiếm: additional finite sword-wave; Cực Ý channel is 14 hits with the authored final hit at 150%
- Ultimate: finishing Ý Kiếm only under its complete condition

Generated follow-ups must use the existing followUpBudget/procDepth boundary and may not recursively generate resources/procs.

## 9. Mastery cleanup

Keep the current five mastery milestones 100/250/500/750/1000, with these corrections:

- Hồi Phong >=500: +2 Qi, not +3.
- Vạn Kiếm enhanced spend starts at high mastery with enough Qi; do not require permanent cap changes.
- Ultimate Cực Ý no longer grants Thái Hư Kiếm Vực by itself.
- Thái Hư Kiếm Vực is reserved for a later high-realm Sword evolution.
- Generic Practice packages must not be allowed to make every skill simultaneously cheaper/faster/stronger in a way that erases authored identity; full cleanup of shared Practice growth may be a separate cross-Dao migration.

## 10. Auto combat rules

Game is auto combat. No per-cast player prompt to select Qi spend.

Core policy:
- low Qi → prefer generator / Tàng Phong
- target not Broken → prefer Break setup
- Broken + high Qi → prioritize signature finisher
- Nộ 100 does not always mean immediate Ultimate; Sword may hold up to **4s** to build a stronger window, then must cast
- if Broken target is low HP, Quyết Sinh has priority over Ultimate
- against a healthy boss, complete Ultimate may take priority
- AI must not hold indefinitely

Because current AI rules allow max 2 AND conditions, use one bounded composite Sword condition/state when implementation needs more than two facts.

## 11. Active slot progression

Keep current progressive Active slots. Do not run all 8 Actives simultaneously.

- Trúc Cơ: 1
- Kim Đan: 2
- Hợp Thể: 3
- Nhân Tiên: 4
- Huyền Tiên+: 5

A character may learn all Sword Actives but only equipped Active slots enter combat. This is a build-defining constraint.

## 12. Highlight identity

Sword must remain visually/gameplay distinct:

- Lưu Quang: frequent micro-highlight / fast afterimages
- Kiếm Tâm: visible state transformation
- Vạn Kiếm Quy Tông: spectacle / sword rain
- Nhất Kiếm Quyết Sinh: signature kill moment; one concentrated slash
- Đoạn Thiên: battlefield-level climax / future Sword Domain opening

Do not balance away these identities merely to equalize single-skill coefficients.

## 13. Stress-test targets

For full 5-slot endgame auto rotation, target relative sustained output:
- Trọng Trảm: 100%
- Lưu Quang: roughly 90–95%; conditional Counter windows may reach ~100%
- Ngự Kiếm: roughly 85–92% raw sustained in exchange for TT utility/accuracy/resolve/control and channel identity

Resource target:
- Sword Qi generated and spent should remain close over long fights
- no permanent starvation
- no full-cap dead resource
- heavy build may have meaningful 0-Qi downtime after large spend
- Ultimate cadence should remain comparable across Sword builds after authored Gauge gains

## 14. Deferred F — 5-stat migration

Do not implement partially during A–E.

F will explicitly migrate:
- Potential from old 3 axes to CL/TP/TPH/LL/TT using a one-time full refund of old allocations
- primary-stat storage/provenance
- skill power formula and per-skill scaling
- Defense contest
- Mobility vs Accuracy dodge authority
- Control vs Resolve authority
- UI/read models
- save migration/refund for old Potential allocations
- PvE/PvP parity and new QA

After F, rerun Sword balance using production runtime rather than design simulator before starting full production conversion of the other seven Dao.

## 15. Verification

A–E closure evidence:

- exact verified SHA: `ba54c9e05af69347a898ac35c9d57838efc803b3`;
- user-local Mode 5 FULL CLEAN: **30/30 steps PASS**;
- Backend Fast: **31/31 PASS**;
- Frontend Fast: **20/20 PASS**;
- deterministic browser playtest: **4/4 PASS**;
- strict browser summary + visual proof: PASS;
- exact-SHA evidence: YES; working tree dirty: false.

A–E are therefore **CLOSED / LOCKED**. F is a separate migration slice. Current F audit and unresolved gameplay decisions are recorded in `docs/runtime/SWORD_DAO_FIVE_STAT_MIGRATION_AUDIT_20260925.md`.


## 16. F migration rules locked on 2026-09-25

- Old 3-axis current-life and permanent Potential: **full refund** into unspent; no automatic mapping.
- New allocation ids: `power/body/agility/spirit/sense` = CL/TP/TPH/LL/TT.
- Old shared Potential resonance/35% soft-cap multiplier: **retired**.
- Dodge authority: existing Mobility-vs-Accuracy contest (2–65% base) + authored direct Dodge combined to a **75% final cap**, with existing dodge pressure.
- Control authority: existing Control-vs-Resolve contest `0.35 + 1.30 × contest`, then current Control Duration Reduction (cap 66.67%); Control Pressure is per group and resets to 0 after **8s** without same-group control; 5s chain-break + 3s Bất Khuất unchanged.
- Defense remains `A/(A+D)` with Armor Pen applied to Defense.


## 17. F executable candidate notes

- F1: five-axis Potential + one-time full refund implemented.
- F2: five-axis derived stats/provenance + primary `primaryStatsV5` snapshot implemented.
- F3: all 10 Sword skills carry exact contract scaling; legacy coefficients are normalization/shape weights only so mastery extra hits retain their authored relative value.
- F4: Defense keeps `A/(A+D)`; Dodge uses Mobility↔Accuracy; Control uses Control↔Resolve; Control Pressure resets after 8s idle in the same group.
- F5 targeted guard is wired into Backend Fast.
- F remains **QA PENDING** until the exact current candidate passes user-local gates.
