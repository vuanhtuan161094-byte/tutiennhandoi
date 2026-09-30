# BODY DAO PRODUCTION CONTRACT — 2026-09-30

Status: **OPEN / B0 CONTRACT LOCKED**
Feature id: `dao-body`
Workflow: `docs/runtime/DAO_PRODUCTION_WORKFLOW_V3_20260926.md`

## 1. Identity

**Thể Đạo = Chịu → Hóa → Phản.**

The player does not become strong merely because HP was lost. The Body identity is deliberate pressure conversion:

1. **Chịu** — enter a defensive/counter window intentionally;
2. **Hóa** — real mitigated/blocked pressure becomes `Phản Thế`;
3. **Phản** — choose whether to cash `Phản Thế` into counter damage, Break, emergency recovery, or a finishing blow.

The intended feel is an active bruiser/counter Dao, not a passive HP sponge.

## 2. Anti-goals

Body production must not:

- reward raw HP loss as its primary engine;
- maintain two competing short-cycle meters that both mean “I got hit”;
- obtain free permanent damage merely by sitting at resource cap;
- auto-spam counters when no real threat/cast window exists;
- duplicate Thể Phách authority through hidden generic multipliers;
- create practical immortality through shield/heal loops;
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
- the live passive effects are re-authored around successful mitigation, counter execution, defensive-channel completion and intentional `Phản Thế` spending;
- old HP-loss-driven stack gain is removed from Main Body authority before correctness closure.

Until that runtime migration lands, Body remains OPEN and cannot be marked closure-ready.

## 5. Ten production skills

Skill IDs remain stable.

| Skill | Production role | Resource intent |
| --- | --- | --- |
| `skill.dao.body.basic` | Thiết Cốt Khai Bi — reliable filler/heavy body strike | no forced spend |
| `skill.dao.body.guard` | Kim Cang Hộ Thể — proactive guard | creates a mitigation window |
| `skill.dao.body.transform` | Hóa Kình Tán Lực — reaction/counter setup | successful defense converts pressure |
| `skill.dao.body.immovable` | Bất Động Như Sơn — committed defensive channel | high mitigation, loses offensive tempo |
| `skill.dao.body.counter` | Chấn Cốt Phản Kình — counter cash-out | medium `Phản Thế` spend |
| `skill.dao.body.elephant` | Long Tượng Trấn Thể — independent heavy strike | stable damage, low resource dependence |
| `skill.dao.body.break` | Cương Thân Phá Kình — Break cash-out | controlled `Phản Thế` spend |
| `skill.dao.body.recover` | Quy Nguyên Luyện Thể — emergency recovery | trades offense resource for survival |
| `skill.dao.body.finisher` | Băng Sơn Chấn Thể — primary burst cash-out | high/all `Phản Thế` spend |
| `skill.dao.body.ultimate` | Vạn Kiếp Bất Diệt Chân Thân — survival/counter domain | rescue window, never absolute immortality |

No new skill slot or second resource is introduced.

## 6. Five-stat ownership

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

Damage-bearing Body skills must expose explicit `fiveStatScalingV5` metadata. Baseline coefficients normalize equal-stat characters rather than creating free total power.

Initial authored weight families for B1 (structural baseline, **not final balance evidence**):

- Basic: `power 1.40 + body 1.40`, baseline `2.80`;
- Transform: `body 1.20 + agility 0.80 + sense 0.80`, baseline `2.80`;
- Counter: `power 1.20 + body 1.20 + sense 0.80`, baseline `3.20`;
- Elephant: `power 1.50 + body 1.50`, baseline `3.00`;
- Break: `power 1.20 + body 0.80 + sense 1.20`, baseline `3.20`;
- Finisher: `power 1.40 + body 1.20 + sense 1.00`, baseline `3.60`.

Defensive-only actions derive their survival value through actual HP/shield/heal/stat materialization; they do not receive fake damage scaling solely to satisfy a metadata gate.

## 7. Defensive effect policy

Flat launch-era shield numbers are not a suitable long-term Body authority.

B1 should move Body defensive skills toward bounded HP-linked effects where the shared engine already supports them, while retaining global shield caps. This lets Thể Phách matter naturally without inventing a Body-only shield stat.

Any numerical values introduced in B1 are provisional correctness baselines. Benchmark tuning happens only after parity and identity evidence.

## 8. Passive ownership after Huyết Khí retirement

The eight stable passive IDs will be repurposed as follows:

1. **Huyết Khí Quyết** — successful mitigation grants a small Body passive payoff; no raw HP-loss farming.
2. **Dưỡng Huyết Chân Kinh** — improves conversion of meaningful mitigation into `Phản Thế`.
3. **Huyết Khí Trường Tồn** — preserves a short successful-defense window, not a generic decaying “got hit” meter.
4. **Thiết Cốt Chân Ý** — strengthens guarded/counter execution, not passive always-on defense stacking.
5. **Huyết Hải Vô Cực** — rewards reaching a deliberate high-resource state without increasing the 0–100 resource cap.
6. **Khí Huyết Quy Nguyên** — improves recovery only when `Phản Thế` is intentionally spent.
7. **Bất Khuất Chân Thể** — limited defensive payoff during a proven guard/channel/counter window.
8. **Huyết Khí Bất Diệt** — capstone for successful Chịu→Hóa→Phản cycles; must not be maintained by ordinary incoming damage alone.

Exact coefficients are deferred to identity-valid benchmark tuning.

## 9. Auto intent

Canonical Body Auto priority:

1. react to an enemy cast/threat with the counter/mitigation tool that can actually answer it;
2. emergency recovery at low HP only when sufficient `Phản Thế` exists;
3. establish Guard/Immovable when survival pressure justifies the lost tempo;
4. cash high `Phản Thế` with Finisher into a Broken target;
5. cash moderate `Phản Thế` with Break into a non-Broken target;
6. counter spender only in a real casting/counter window;
7. Heavy/Basic are normal filler;
8. Ultimate is held for a meaningful survival window, not dumped at full HP.

Auto must not use `transform` or `counter` as unconditional filler.

## 10. Production parity required before benchmark

Body must prove the same gameplay authority through:

- CombatKernel V3 / CombatEngine;
- PvE/Boss;
- PvP snapshot/replay;
- Auto/tactical rotation;
- Hunt/offline representative combat;
- save/restore of compatible Body state;
- five-stat materialization/provenance;
- locked Sword/Fist regressions where shared counter/Break seams are touched.

## 11. Identity-valid benchmark plan

At least three deterministic profiles:

### A. Phản Kình
Must execute:
- enemy threat/cast windows;
- successful defensive conversion;
- `Phản Thế` generation > 0;
- counter cash-out > 0;
- successful counter identity event > 0.

### B. Bất Động
Must execute:
- defensive channel completion > 0;
- meaningful mitigated pressure > 0;
- survival benefit without permanent invulnerability;
- `Phản Thế` generation from real pressure > 0.

### C. Phá Kình
Must execute:
- `Phản Thế` generation > 0;
- controlled spend > 0;
- Break / Broken event > 0;
- finisher or heavy payoff after the intended setup.

A run with zero defining-mechanic count is invalid regardless of DPS.

## 12. Deferred systems

Deferred until the all-eight-Dao global balance pass:

- Tri Kỷ;
- Linh Thú;
- Pháp Bảo / Chí Bảo collection balance;
- Equipment balance;
- Alchemy balance;
- Economy;
- Reincarnation/global collection balance.

Do not tune any of these to make Body green.

## 13. Production phases

- **B0 — Contract / scope:** this document + feature manifest OPEN.
- **B1 — Five-stat + Auto + defensive effect authority.**
- **B2 — Huyết Khí passive runtime retirement/re-authoring.**
- **B3 — Correctness + resource transaction gates.**
- **B4 — Consumer parity.**
- **B5 — identity-valid deterministic benchmark.**
- **B6 — minimal tune if evidence requires it.**
- **B7 — FULL CLEAN + exact-SHA feature closure + lock.**

`closureReady` must remain `false` through B0–B6.
