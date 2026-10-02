# BODY DAO PRODUCTION CONTRACT — 2026-09-30

Status: **OPEN / B6 TUNING**
Feature id: `dao-body`
Workflow: `docs/runtime/DAO_PRODUCTION_WORKFLOW_V3_20260926.md`

## 1. Identity

**Thể Đạo = Chịu → Hóa → Phản**, with an optional **Huyết–Công** branch.

The player does not become strong merely because HP was lost. Main Body has two deliberate combat loops:

1. **Thủ–Phản** — enter a defensive/counter window, convert real mitigated pressure into `Phản Thế`, then cash it into counter damage, Break, recovery or a finishing blow.
2. **Huyết–Công** — intentionally pay a bounded portion of Max HP to open a short offensive window, then use Body skills aggressively before resetting through Guard/Recover/Bất Động.

Self-paid HP is an explicit cost. It is not incoming damage and must never generate `Phản Thế`, Huyết Khí/get-hit rewards or other damage-taken procs.

## 2. Anti-goals

Body production must not:

- reward raw HP loss as its primary engine;
- maintain two competing short-cycle meters that both mean “I got hit”;
- obtain free permanent damage merely by sitting at resource cap;
- auto-spam counters when no real threat/cast window exists;
- duplicate Thể Phách authority through hidden generic multipliers;
- create practical immortality through shield/heal loops;
- allow self-paid HP from Huyết–Công to farm `Phản Thế` or get-hit effects;
- allow Nhiên Huyết to self-kill the actor;
- depend on Tri Kỷ, Linh Thú, Pháp Bảo/Chí Bảo, Equipment balance or other global systems for feature closure.

## 3. Core resource — Phản Thế

`Phản Thế` is the only Main-Body short-cycle resource.

- range: **0–100**;
- gain source: actual pressure that was meaningfully mitigated/blocked by Body defensive play;
- no gain from synthetic self-damage or simply losing HP without mitigation;
- resource spending must remain visible in combat state/projection;
- reaching 100 represents **Chân Thân Viên Mãn** and empowers one chosen Body action rather than creating an unrelated permanent multiplier.

The existing `counterForce` save/runtime field is retained for compatibility and remains the storage key for `Phản Thế` during this production slice.

## 4. Huyết Khí migration

The historical `bodyPassiveStack` / `Huyết Khí` meter is **legacy design debt** for Main Body and must not remain a second live “get hit → become stronger” meter at closure.

Compatibility requirements:

- existing passive IDs `passive.v2.body.p1` … `p8` remain stable;
- save/content identity remains readable;
- live passive effects are authored around successful mitigation, counter execution, defensive-channel completion and intentional `Phản Thế` spending;
- old HP-loss-driven stack gain is removed from Main Body authority.

## 5. Ten production skills

Skill IDs remain stable. `skill.dao.body.elephant` is intentionally retained as the save/loadout-compatible ID while its production role is re-authored from the redundant independent heavy strike into Huyết–Công.

| Skill | Production role | Resource intent |
| --- | --- | --- |
| `skill.dao.body.basic` | Thiết Cốt Khai Bi — reliable filler/body strike | no forced spend |
| `skill.dao.body.guard` | Kim Cang Hộ Thể — proactive guard | creates a mitigation window |
| `skill.dao.body.transform` | Hóa Kình Tán Lực — reaction/counter setup | successful defense converts pressure |
| `skill.dao.body.immovable` | Bất Động Như Sơn — committed defensive channel | loses offensive tempo for real channel mitigation + shield payoff |
| `skill.dao.body.counter` | Chấn Cốt Phản Kình — counter cash-out | medium `Phản Thế` spend |
| `skill.dao.body.elephant` | **Nhiên Huyết Chấn Thân** — Huyết–Công activation | pays HP; never generates `Phản Thế` from that payment |
| `skill.dao.body.break` | Cương Thân Phá Kình — Break cash-out | controlled `Phản Thế` spend |
| `skill.dao.body.recover` | Quy Nguyên Luyện Thể — emergency recovery | trades offense resource for survival |
| `skill.dao.body.finisher` | Băng Sơn Chấn Thể — primary burst cash-out | high/all `Phản Thế` spend |
| `skill.dao.body.ultimate` | Vạn Kiếp Bất Diệt Chân Thân — survival/counter domain | rescue window, never absolute immortality |

No new skill slot or second resource is introduced.

## 6. B6 Huyết–Công contract — Nhiên Huyết Chấn Thân

Initial B6 candidate values are deliberately local and benchmarkable:

- production ID remains `skill.dao.body.elephant`;
- active name: **Nhiên Huyết Chấn Thân**;
- cooldown: **12s**;
- activation cost: **10% Max HP** paid directly by the actor;
- the cost must never reduce HP below 1;
- below **35% current HP**, activation is suppressed and pays no HP;
- successful activation opens **Huyết Bạo** for **6s**;
- while Huyết Bạo is active, outgoing **Body-skill damage** gains **+20%**;
- the activation itself has no direct damage packet;
- self-paid HP bypasses incoming-damage hooks: no `Phản Thế`, no body mitigation event, no get-hit passive reward;
- recasting may refresh the window only through the normal skill cooldown; it must not stack multiplicatively.

Player-facing Auto is selectable and changes the HP appetite for automatically opening Nhiên Huyết:

- **Thận trọng (`cautious`)** — activate at **≥85% HP**;
- **Cân bằng (`balanced`)** — activate at **≥75% HP** and is the default;
- **Liều mạng (`aggressive`)** — activate at **≥65% HP**.

Auto staging rule:

- the **first** Nhiên Huyết activation may open as a deliberate healthy opener when the selected HP threshold is satisfied;
- from the **second activation onward**, Auto additionally requires **`Phản Thế ≥20`** before paying HP again;
- this repeat gate does not spend `Phản Thế` by itself; it only proves the character has completed a real pressure/conversion cycle before another voluntary HP payment;
- before Huyết Bạo opens, routine Guard/Bất Động may still stage ahead of the voluntary sacrifice;
- while **Huyết Bạo is already active** and current HP is **≥45%**, Auto suppresses routine Guard, Bất Động and the non-emergency Ultimate so the paid 6s window is actually spent on offense;
- once HP falls below **45%**, the offense lock ends immediately and normal emergency recovery/defense may take over;
- when Nhiên Huyết is equipped, routine Break is staged immediately after the Huyết Bạo opener so it cannot consume the same payoff opportunity first.

The **35% hard safety floor is independent of the preset** and may not be lowered by Auto configuration. Auto also may not reopen Nhiên Huyết while Huyết Bạo is already active. The selected preset is stored in the character combat Auto profile so the current Godot save/restore path preserves the selection.

Evidence history:

- the first aggressive candidate at `55%` produced one death, so the first tune moved **55% → 60%**;
- the first 2026-10-02 3×3 B6 rerun at `60%` showed `blood/aggressive` averaging **7.833** activations but only **244.74 DPS**, effectively the same as `blood/balanced` at **244.45 DPS**, while aggressive still had **2/12 deaths**;
- the same rerun showed `blood/cautious` and `hybrid/cautious` at **0 activations in 12/12 runs**, because the `85% HP + Phản Thế ≥20` conjunction could miss the first usable window entirely;
- the next candidate therefore changed Auto staging to **healthy first opener → repeat requires Phản Thế**, and raised aggressive from **60% → 65%**, without changing HP cost, duration or damage coefficient;
- the next 3×3 rerun fixed Cautious identity execution: `blood/cautious` and `hybrid/cautious` both became **12/12 valid**, while `blood/balanced` and both Hybrid Balanced/Aggressive were also **12/12 valid**;
- however `blood/aggressive` remained only **11/12 valid** with one death at seed `65197`; it averaged **5.0** Nhiên Huyết activations and **248.99 DPS** versus Balanced **2.417** activations and **248.916 DPS**. The extra HP payments therefore still bought almost no net DPS;
- inspection of Auto priority showed why: at the lower post-payment HP used by Aggressive, Guard/Bất Động/non-emergency Ultimate could immediately consume the paid Huyết Bạo window. The next candidate changes this **behavior only** by protecting the 6s offense window above the 45% emergency band. HP cost remains **10%**, damage bonus remains **+20%**, duration remains **6s**, and Aggressive remains **65%** until rerun evidence says otherwise.

The B6 harness also had two reporting defects:

1. the original summary divided final HP by `body × 100`, while synthetic combat actually used canonical `combatMaxHp` authority;
2. the first correction attempted `combatMaxHp(state.baseStats)`, but compact `battle.finalState` does not retain `baseStats`, causing the denominator to fall back to `1` and producing impossible values such as `284387%` HP.

B6 evidence must therefore capture `combatMaxHp(player.stats)` **before** CombatKernel V3 runs and pass that exact denominator into the summary. This is a benchmark-reporting correction, not a gameplay HP change.

These values are B6 candidates, not final balance evidence. A new identity-valid Huyết–Công/Hybrid benchmark is required before B7 closure.

## 7. B6 Bất Động repair

B6 ablation evidence showed Bất Động had a real survival effect but the defensive payoff was weak relative to its lost offensive tempo. The first repair changes only the missing defensive identity lever:

- while the actor is actively channeling `skill.dao.body.immovable`, incoming damage is reduced by **25%**;
- the reduction exists only during the channel and ends immediately when the channel ends or is interrupted;
- the existing production shield payoff remains unchanged;
- channel duration is **not** shortened in this repair;
- shield amount is **not** increased in this repair.

This keeps B6 evidence interpretable: one defensive lever changes before any further numerical tuning.

## 8. Five-stat ownership

Canonical axes:

- `power` = Công Lực (CL)
- `body` = Thể Phách (TP)
- `agility` = Thân Pháp (TPH)
- `spirit` = Linh Lực (LL)
- `sense` = Thần Thức (TT)

Body production ownership:

- **TP** owns endurance, HP-linked shields/recovery and the physical part of Body damage;
- **CL** owns heavy/counter/finisher damage;
- **TPH** participates in reaction/counter tempo, never as a hidden universal damage multiplier;
- **LL** participates in defensive sustain/recovery efficiency;
- **TT** participates in Break/counter precision and deliberate cash-out skills.

Damage-bearing Body skills expose explicit `fiveStatScalingV5` metadata. Nhiên Huyết itself is a utility activation and does not need fake direct-damage five-stat scaling.

Current authored damage weight families remain:

- Basic: `power 1.40 + body 1.40`, baseline `2.80`;
- Transform: `body 1.20 + agility 0.80 + sense 0.80`, baseline `2.80`;
- Counter: `power 1.20 + body 1.20 + sense 0.80`, baseline `3.20`;
- Break: `power 1.20 + body 0.80 + sense 1.20`, baseline `3.20`;
- Finisher: `power 1.40 + body 1.20 + sense 1.00`, baseline `3.60`.

## 9. Defensive effect policy

Body defensive skills use bounded HP-linked effects where the shared engine supports them. Thể Phách therefore matters through actual HP/shield/heal materialization rather than a Body-only hidden shield stat.

Bất Động channel mitigation is temporary action-state authority, not an always-on Body damage-reduction multiplier.

## 10. Passive ownership after Huyết Khí retirement

The eight stable passive IDs are owned as follows:

1. **Huyết Khí Quyết** — successful mitigation grants a small Body passive payoff; no raw HP-loss farming.
2. **Dưỡng Huyết Chân Kinh** — improves conversion of meaningful mitigation into `Phản Thế`.
3. **Huyết Khí Trường Tồn** — preserves a short successful-defense window, not a generic decaying “got hit” meter.
4. **Thiết Cốt Chân Ý** — strengthens guarded/counter execution, not passive always-on defense stacking.
5. **Huyết Hải Vô Cực** — rewards reaching a deliberate high-resource state without increasing the 0–100 resource cap.
6. **Khí Huyết Quy Nguyên** — improves recovery only when `Phản Thế` is intentionally spent.
7. **Bất Khuất Chân Thể** — limited defensive payoff during a proven guard/channel/counter window.
8. **Huyết Khí Bất Diệt** — capstone for successful Chịu→Hóa→Phản cycles; ordinary incoming damage alone cannot maintain it.

Nhiên Huyết is an Active decision, not a passive auto-drain mechanic.

## 11. Auto intent

Canonical Body Auto priority:

1. react to an enemy cast/threat with the counter/mitigation tool that can actually answer it;
2. emergency recovery at low HP only when sufficient `Phản Thế` exists;
3. cash high `Phản Thế` with Finisher into a Broken target;
4. before Huyết Bạo opens, establish routine Guard/Immovable when survival pressure justifies the lost tempo;
5. if HP satisfies the selected **Thận trọng / Cân bằng / Liều mạng** threshold and Nhiên Huyết is ready, open Huyết Bạo; the first opener does not require pre-banked `Phản Thế`, repeats require **≥20**;
6. while Huyết Bạo is active and HP is **≥45%**, keep the paid window offensive: routine Guard/Bất Động/non-emergency Ultimate are suppressed, while offensive payoff/reaction skills continue normally;
7. below **45%**, emergency survival regains authority immediately;
8. when Nhiên Huyết is equipped, routine Break is the immediate payoff after the opener; without Huyết–Công equipped, Break keeps its normal moderate-`Phản Thế` role;
9. counter spender remains tied to a real casting/counter window;
10. Basic is normal filler;
11. Ultimate is otherwise held for a meaningful survival window, not dumped at full HP.

The preset changes Nhiên Huyết Auto aggression through the opener HP threshold. The live-window offense lock is shared by all presets because it is part of Huyết–Công identity, not a separate preset coefficient. Auto must not use Nhiên Huyết below the **35% hard safety floor** or while its blood-rush window is already active.

Godot exposes the selector under **Nhân vật → Hồ Sơ Tu Hành → Kỹ Năng → AUTO THỂ ĐẠO**. The UI action must update canonical character Auto state rather than maintaining a presentation-only toggle.

## 12. Production parity required before closure

Body must prove the same gameplay authority through:

- CombatKernel V3 / CombatEngine;
- PvE/Boss;
- PvP snapshot/replay;
- Auto/tactical rotation;
- Hunt/offline representative combat;
- save/restore of compatible Body state;
- five-stat materialization/provenance;
- locked Sword/Fist regressions where shared counter/Break seams are touched.

## 13. Identity-valid benchmark plan

Existing B5 identities remain useful regression evidence:

### A. Phản Kình
Must execute real mitigation, `Phản Thế` generation, counter cash-out and successful Counter hits.

### B. Bất Động
Must complete the defensive channel, take real pressure and show measurable survival value without practical invulnerability.

### C. Phá Kình
Must generate/spend `Phản Thế`, create Broken and execute a payoff in the intended window.

B6 adds:

### D. Huyết–Công
Must execute Nhiên Huyết activations with real HP payment, maintain zero self-cost `Phản Thế` gain, and convert the 6s window into measurable offensive output without collapsing survival.

### E. Hybrid
Must use both a real defensive conversion/cash-out cycle and at least one Nhiên Huyết window. A build that only spams one side is not valid Hybrid evidence.

The B6 benchmark should also compare the selectable Auto thresholds so the aggressive preset cannot pass merely by burning more HP without meaningful offensive gain.

Benchmark survival percentages must use the same canonical Max HP authority as combat runtime. A benchmark-only denominator or a compact final-state fallback is invalid evidence.

Any run with zero defining-mechanic count is invalid regardless of DPS.

## 14. Deferred systems

Deferred until the all-eight-Dao global balance pass:

- Tri Kỷ;
- Linh Thú;
- Pháp Bảo / Chí Bảo collection balance;
- Equipment balance;
- Alchemy balance;
- Economy;
- Reincarnation/global collection balance.

Do not tune any of these to make Body green.

## 15. Production phases

- **B0 — Contract / scope:** CLOSED.
- **B1 — Five-stat + Auto + defensive effect authority:** source + targeted evidence present.
- **B2 — Huyết Khí passive runtime retirement/re-authoring:** source + targeted evidence present.
- **B3 — Correctness + resource transaction gates:** PASS on exact local candidate evidence.
- **B4 — Consumer parity:** PASS on exact local candidate evidence.
- **B5 — identity-valid deterministic benchmark:** baseline identity evidence recorded by user; all three profiles valid.
- **B6 — evidence-driven redesign/tune:** **OPEN** — Bất Động repair + Huyết–Công branch + selectable Auto presets.
- **B7 — FULL CLEAN + exact-SHA feature closure + lock:** BLOCKED until B6 correctness/parity/identity evidence passes.

`closureReady` remains `false` through B6.
