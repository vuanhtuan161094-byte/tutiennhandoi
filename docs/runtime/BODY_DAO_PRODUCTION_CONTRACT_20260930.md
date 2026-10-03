# BODY DAO PRODUCTION CONTRACT — 2026-09-30

Status: **CLOSED / LOCKED**
Feature id: `dao-body`
Workflow: `docs/runtime/DAO_PRODUCTION_WORKFLOW_V3_20260926.md`
Closure record: `docs/runtime/BODY_DAO_PRODUCTION_CLOSURE_20261003.md`
Verified closure SHA: `dbb823404afbe7c82811a3b7700eacc12dd8d265`

## 1. Identity

**Thể Đạo = Chịu → Hóa → Phản**, with an optional **Huyết–Công** branch.

Main Body has two deliberate combat loops:

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
- resource spending remains visible in combat state/projection;
- reaching 100 represents **Chân Thân Viên Mãn** and empowers one chosen Body cash-out rather than creating a permanent hold-resource multiplier.

The existing `counterForce` save/runtime field is retained for compatibility and remains the storage key for `Phản Thế`.

## 4. Huyết Khí migration

The historical `bodyPassiveStack` / `Huyết Khí` meter is legacy compatibility data only for Main Body.

Compatibility requirements:

- existing passive IDs `passive.v2.body.p1` … `p8` remain stable;
- save/content identity remains readable;
- live passive effects are authored around successful mitigation, defensive/counter windows and intentional `Phản Thế` spending;
- old HP-loss-driven stack gain is removed from Main Body authority;
- player-facing content must not claim that the retired stack still grants production combat bonuses.

## 5. Ten production skills

Skill IDs remain stable. `skill.dao.body.elephant` is retained as the save/loadout-compatible ID while its production role is re-authored from the redundant heavy strike into Huyết–Công.

| Skill | Production role | Resource intent |
| --- | --- | --- |
| `skill.dao.body.basic` | Thiết Cốt Khai Bi — reliable filler/body strike | no forced spend |
| `skill.dao.body.guard` | Kim Cang Hộ Thể — proactive guard | creates a mitigation window |
| `skill.dao.body.transform` | Hóa Kình Tán Lực — reaction/counter setup | successful defense converts pressure |
| `skill.dao.body.immovable` | Bất Động Như Sơn — committed defensive channel | real channel mitigation + shield payoff |
| `skill.dao.body.counter` | Chấn Cốt Phản Kình — counter cash-out | medium `Phản Thế` spend |
| `skill.dao.body.elephant` | **Nhiên Huyết Chấn Thân** — Huyết–Công activation | pays HP; never generates `Phản Thế` from that payment |
| `skill.dao.body.break` | Cương Thân Phá Kình — Break cash-out | controlled `Phản Thế` spend |
| `skill.dao.body.recover` | Quy Nguyên Luyện Thể — emergency recovery | trades offense resource for survival |
| `skill.dao.body.finisher` | Băng Sơn Chấn Thể — primary burst cash-out | high/all `Phản Thế` spend |
| `skill.dao.body.ultimate` | Vạn Kiếp Bất Diệt Chân Thân — survival/counter domain | rescue window, never absolute immortality |

No new skill slot or second resource is introduced.

## 6. B6 Huyết–Công contract — Nhiên Huyết Chấn Thân

Accepted B6 production values:

- production ID remains `skill.dao.body.elephant`;
- cooldown: **12s**;
- activation cost: **10% Max HP** paid directly by the actor;
- cost cannot reduce HP below 1;
- below **35% current HP**, activation is suppressed and pays no HP;
- successful activation opens **Huyết Bạo** for **6s**;
- while Huyết Bạo is active, outgoing **Body-skill damage** gains **+20%**;
- activation itself has no direct damage packet;
- self-paid HP bypasses incoming-damage hooks: no `Phản Thế`, no mitigation event, no get-hit passive reward;
- normal cooldown owns recast cadence; the buff does not stack multiplicatively.

Player-facing Auto presets:

- **Thận trọng (`cautious`)** — open at **≥85% HP**;
- **Cân bằng (`balanced`)** — open at **≥75% HP**, default;
- **Liều mạng (`aggressive`)** — open at **≥65% HP**.

Auto staging:

- first activation may be a healthy opener when the selected HP threshold is met;
- second and later activations additionally require **`Phản Thế ≥20`**;
- this repeat gate proves a real pressure/conversion cycle and does not itself spend `Phản Thế`;
- before Huyết Bạo, normal defensive staging may take priority;
- while Huyết Bạo is active and HP is **≥45%**, routine Guard/Bất Động/non-emergency Ultimate are suppressed so the paid 6s window remains offensive;
- below **45%**, emergency recovery/defense immediately regains authority;
- when Nhiên Huyết is equipped, routine Break is staged immediately after the opener;
- the **35% hard safety floor** cannot be lowered by presets;
- Auto cannot reopen Nhiên Huyết while Huyết Bạo is active.

### Accepted B6 evidence — 2026-10-02

Final 3×3 matrix used **12 seeds × 180s** against the same B5 pressure target.

- **Thủ–Phản:** all three Auto rows are mechanically identical as required; **36/36 identity-valid and 36/36 survived full duration**. Baseline mean DPS **218.593**, mean final HP **59.25%**.
- **Huyết–Công / cautious:** defining Huyết–Công mechanics execute in **12/12** after separating identity correctness from survival; one survival warning at seed `65119`. Mean DPS **248.801**, mean final HP **41.21%**, mean activations **1.0**.
- **Huyết–Công / balanced:** defining mechanics execute in **12/12**; the same seed `65119` is the one survival warning. Mean DPS **248.689**, mean final HP **47.70%**, mean activations **2.083**.
- **Huyết–Công / aggressive:** **12/12 identity-valid and 12/12 survived**. Mean DPS **250.436**, mean final HP **58.69%**, mean activations **5.417**.
- **Hybrid cautious/balanced/aggressive:** **36/36 identity-valid and 36/36 survived**. Mean DPS **219.988 / 206.335 / 208.276** respectively.

The two Huyết–Công warnings are the same pressure seed and occur only after the build has already performed a real Nhiên Huyết activation, paid HP and dealt damage inside Huyết Bạo. They remain visible as **survival/balance evidence**, but are not classified as missing-mechanic correctness failures. A voluntary-HP-risk playstyle is not required to survive every deterministic pressure seed in order to prove that its identity executes correctly.

The B6 harness records identity validity and survival separately. It also captures canonical `combatMaxHp(player.stats)` before CombatKernel V3 runs; compact `battle.finalState` is not used as an HP-authority source.

**B6 is accepted. No additional B6 coefficient/Auto tuning is authorized before B7 closure.** Cross-build/global balance remains deferred to the all-eight-Dao balance phase.

## 7. B6 Bất Động repair

Accepted behavior:

- while actively channeling `skill.dao.body.immovable`, incoming damage is reduced by **25%**;
- the reduction exists only during the channel and ends when the channel ends or is interrupted;
- production shield payoff remains unchanged;
- channel duration is not shortened by a Body-specific hidden mastery override;
- shield amount is not secretly increased by a content-only promise.

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

Damage-bearing Body skills expose explicit `fiveStatScalingV5` metadata. Nhiên Huyết is a utility activation and does not carry fake direct-damage scaling.

Current damage weight families:

- Basic: `power 1.40 + body 1.40`, baseline `2.80`;
- Transform: `body 1.20 + agility 0.80 + sense 0.80`, baseline `2.80`;
- Counter: `power 1.20 + body 1.20 + sense 0.80`, baseline `3.20`;
- Break: `power 1.20 + body 0.80 + sense 1.20`, baseline `3.20`;
- Finisher: `power 1.40 + body 1.20 + sense 1.00`, baseline `3.60`.

## 9. Defensive effect policy

Body defensive skills use bounded HP-linked effects where the shared engine supports them. Thể Phách therefore matters through actual HP/shield/heal materialization rather than a Body-only hidden shield stat.

Bất Động channel mitigation is temporary action-state authority, not an always-on Body damage-reduction multiplier.

## 10. Passive and mastery ownership

The eight stable passive IDs are re-authored to the live production runtime:

1. **p1 Huyết Khí Quyết** — successful mitigation adds a fixed conversion bonus; no raw HP-loss farming.
2. **p2 Dưỡng Huyết Chân Kinh** — improves meaningful mitigation → `Phản Thế` conversion.
3. **p3 Huyết Khí Trường Tồn** — extends the successful-defense guard window.
4. **p4 Thiết Cốt Chân Ý** — empowers payoff skills only inside that guard window.
5. **p5 Huyết Hải Vô Cực** — improves Ultimate-gauge gain at high `Phản Thế`; it does not raise resource cap.
6. **p6 Khí Huyết Quy Nguyên** — improves Recover only from actual `Phản Thế` spend.
7. **p7 Bất Khuất Chân Thể** — adds bounded DR only during the proven guard window.
8. **p8 Huyết Khí Bất Diệt** — an actual cash-out opens a short offensive cycle; ordinary incoming damage cannot maintain it.

The ten stable mastery rows remain for content/save/UI compatibility. Unsupported historical Body-specific milestone promises are retired from player-facing content. Production authority remains the shared skill-practice system plus `body-dao.runtime.production.v1`; a future Body-specific mastery extension must first exist in runtime and benchmark evidence before content may advertise it.

## 11. Auto intent

Canonical Body Auto intent:

1. react to real enemy casts/threats with an eligible reaction;
2. emergency recovery at low HP when sufficient `Phản Thế` exists;
3. cash high `Phản Thế` into meaningful Broken/payoff windows;
4. establish routine defense before a Huyết Bạo window when pressure justifies it;
5. open Nhiên Huyết according to the selected preset; first opener is healthy, repeats require `Phản Thế ≥20`;
6. while Huyết Bạo is active and HP is **≥45%**, preserve the paid offensive window;
7. below **45%**, emergency survival regains authority;
8. Basic remains filler; Ultimate is reserved for meaningful survival state rather than full-HP dumping.

Godot exposes the selector under **Nhân vật → Hồ Sơ Tu Hành → Kỹ Năng → AUTO THỂ ĐẠO** and writes the selection back to canonical combat Auto state.

## 12. Production parity required for final lock

Body closure includes:

- CombatKernel V3 / CombatEngine;
- PvE/Boss;
- PvP snapshot/replay;
- Auto/tactical rotation;
- Hunt/offline representative combat;
- save/restore compatibility;
- five-stat materialization/provenance;
- locked Sword/Fist regressions where shared seams are touched.

Targeted B0–B6 correctness/parity evidence was already accepted before B7. The former **B7 CLOSURE CANDIDATE** state was promoted after the user's clean Windows checkout ran `DONG_BO_VA_TEST_FEATURE.cmd dao-body` at exact SHA `dbb823404afbe7c82811a3b7700eacc12dd8d265` and reported **FEATURE FULL CLEAN + SCOPED CLOSURE: PASS** with **V140 BACKEND FEATURE DAO-BODY: 23/23 PASS**. Full-game backend closure remains a separate audit.

## 13. Identity benchmark interpretation

B5 remains regression evidence for:

- **Phản Kình** — mitigation → `Phản Thế` → counter cash-out;
- **Bất Động** — completed defensive channel under real pressure;
- **Phá Kình** — generated/spent `Phản Thế`, Broken and payoff execution.

B6 adds:

- **Huyết–Công** — real Nhiên Huyết activation, HP payment and damage during Huyết Bạo;
- **Hybrid** — both Huyết–Công evidence and a real mitigation → `Phản Thế` cash-out/counter cycle with completed Bất Động.

Identity correctness and survival are both recorded, but they are not the same assertion. Thủ–Phản, whose identity is defensive, must survive the full pressure window. Risk-bearing Huyết–Công/Hybrid runs keep survival as explicit balance evidence while identity validity proves the defining mechanic actually executed.

No arbitrary DPS/survival target band is used to manufacture a PASS.

## 14. Deferred systems

Deferred until the all-eight-Dao global balance pass:

- Tri Kỷ;
- Linh Thú;
- Pháp Bảo / Chí Bảo collection balance;
- Equipment balance;
- Alchemy balance;
- Economy;
- Reincarnation/global collection balance.

Do not tune any deferred system to make Body green.

## 15. Production phases

- **B0 — Contract / scope:** CLOSED.
- **B1 — Five-stat + Auto + defensive effect authority:** CLOSED.
- **B2 — Huyết Khí passive runtime retirement/re-authoring:** CLOSED; stale player-facing content removed in B7.
- **B3 — Correctness + resource transaction:** PASS / CLOSED.
- **B4 — Consumer parity:** PASS / CLOSED.
- **B5 — identity-valid deterministic benchmark:** PASS / CLOSED; all three baseline identities valid.
- **B6 — evidence-driven redesign/tune:** ACCEPTED / CLOSED; final 3×3 evidence recorded above.
- **B7 — content debt + manifest + exact-SHA feature closure:** **PASS / CLOSED**.

`closureReady` remains `true` for registered scoped regression checks. Body Dao Production V1 is now **CLOSED / LOCKED** on exact verified gameplay/closure SHA `dbb823404afbe7c82811a3b7700eacc12dd8d265`. Later documentation/metadata commits do not replace that verified gameplay SHA. Reopen Body only for a proven regression or explicit user instruction.