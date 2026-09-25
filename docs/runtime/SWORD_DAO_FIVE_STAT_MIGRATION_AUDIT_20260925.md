# SWORD DAO F — FIVE-STAT MIGRATION AUDIT — 2026-09-25

Status: **OPEN / F RULES LOCKED / EXECUTABLE MIGRATION ACTIVE**

Repository: `vuanhtuan161094-byte/tutiennhandoi`  
Branch: `main`  
Parent closure: Sword A–E exact verified SHA `ba54c9e05af69347a898ac35c9d57838efc803b3`

## 1. Locked target

The Sword production contract freezes exactly five primary stats:

- Công Lực (CL): primary offensive source.
- Thể Phách (TP): +20 HP and +1 Defense per point.
- Thân Pháp (TPH): +1 Mobility per point; no global Action Speed.
- Linh Lực (LL): +1 Max Chân Nguyên per point; no automatic regen/CDR/efficiency.
- Thần Thức (TT): +1 Accuracy, +1 Control, +1 Resolve per point.

No sixth primary stat, no Physical/Magic split, no hidden Realm damage multiplier, and no generic requirement that hybrid skill weights sum to 3.

## 2. Current production authority that F must migrate

### Potential storage

Current live core Potential remains three axes: `power / body / defense`.

- `createLifeCorePotentialState()`, permanent Potential, spending and cloning all use those three keys.
- `applyCorePotentialStats()` currently maps:
  - power -> +1 Attack;
  - body -> +1 Physique -> +20 Max HP;
  - defense -> +3 Defense;
  - total allocations also feed the existing soft-cap Resonance multiplier.
- Current restore canonicalization also validates and spends the permanent three-axis budget in `power -> body -> defense` order.

### Damage / Defense

Locked combat currently resolves authored damage from `attack × coefficient` and uses the Defense factor:

`A / (A + effectiveDefense)`

with Armor Pen applied to Defense first.

### Dodge

For `locked-v1` production combat, Dodge is currently a direct authored `dodgeChancePct` roll. Mobility-vs-Accuracy is explicitly marked deprecated and is not used by the production CombatEngine.

### Control

For `locked-v1` production combat, Control-vs-Resolve is currently not a duration contest. Control duration is reduced only by the target's `controlDurationReductionPct` plus the existing chain/immunity rules.

A legacy/non-locked path still contains an older Control-vs-Resolve contest, but it is not current production authority and therefore cannot be silently promoted as the F formula without an explicit design lock.

## 3. Non-blocking implementation decisions

These are technical and may be chosen during implementation without changing gameplay intent:

- stable internal ids for the five primary axes;
- provenance object shape;
- compatibility aliases during restore;
- migration helper/module placement;
- QA fixture names and transport field names.

## 4. Locked F migration rules

### F-R1 — Old save migration: full refund

For both current-life and permanent Potential:

- old `power/body/defense` allocations are never auto-mapped into the five new axes;
- preserve the total earned budget;
- refund every previously spent point into `unspent`;
- initialize all five new allocations to 0;
- preserve current-life awarded realm milestones;
- mark migrated state with five-axis version metadata so the refund happens once.

Canonical five allocation ids:

- `power` = Công Lực (CL)
- `body` = Thể Phách (TP)
- `agility` = Thân Pháp (TPH)
- `spirit` = Linh Lực (LL)
- `sense` = Thần Thức (TT)

The old shared Potential resonance / 35% soft-cap multiplier is retired. One point contributes only its authored axis effect.

### F-R2 — Mobility vs Accuracy Dodge authority

Promote the existing repository contest shape instead of inventing a new curve.

Base contest:

`ratio = max(1, Mobility) / max(1, Accuracy)`

`centered = ratio - 1`

`baseDodge = clamp(15 + 50 * centered / (1 + abs(centered)) - pressurePenalty, 2, 65)`

where `pressurePenalty = min(35, dodgePressure * 7)`.

Authored direct Dodge bonuses remain valid and combine into the remaining room up to a final **75% hard cap**:

`finalDodge = combineBoundedPct(baseDodge, directDodgeChancePct, 75)`.

Existing anti-streak pressure remains: successful Dodge adds 1 pressure; a failed Dodge check reduces pressure by 0.65 (floor 0).

Hội Tâm and Tất Trúng semantics remain unchanged: Hội Tâm bypasses Dodge; Tất Trúng skips the Dodge check.

### F-R3 — Control vs Resolve authority

Promote the existing repository Control contest to production locked combat.

`effectiveResolve = Resolve * (1 + controlPressure * 0.35)`

`contest = Control / max(1, Control + effectiveResolve)`

`contestMultiplier = 0.35 + 1.30 * contest`

Thus equal Control/Resolve gives ×1.00 duration, the bounded contest approaches ×0.35 at extreme disadvantage and ×1.65 at extreme advantage.

Then apply authored Control Duration Reduction:

`finalDuration = baseDuration * contestMultiplier * (1 - CDR / 100)`

with the existing CDR cap **66.67%**. Existing chain safety stays unchanged: 5 continuous seconds breaks control and grants 3 seconds Bất Khuất. Pressure remains per control group and grows by +1 on an applied control attempt. If the same control group has not been applied for **8 seconds**, its pressure resets to 0 before the next contest.

## 5. Defense status

No separate blocker is required yet for Defense if the user chooses to preserve the already-locked `A/(A+D)` mitigation curve and only changes how the five primary stats feed offensive power and Defense. If a different Defense contest is intended, it must be explicitly locked before F changes CombatKernel behavior.

## 6. F implementation order

1. F1 — five-axis Potential state + restore migration/refund + provenance.
2. F2 — derive CL/TP/TPH/LL/TT into combat stats and UI/read models.
3. F3 — Sword per-skill five-stat scaling.
4. F4 — Defense / Dodge / Control authorities.
5. F5 — PvE/PvP/save parity + targeted F QA + Backend Fast.
6. F6 — production Sword balance rerun on the migrated runtime.
7. Exact candidate Full Clean before F closure.

Do not convert the other seven Dao until F closes and Sword is rebalanced on production runtime.


## 7. Implementation status

Implemented candidate commits:

- F1 five-axis Potential state: `c0be270af7d523eb03924cabf4e3b1bd1cfbe390`
- F1 restore/session wiring: `a9346c92035ab53a56a95465ee538907587c91cf`
- F2 provenance and contest helpers: `4f1123bf0bc0b6b9db68eb6d12c713dce5e1f7b0`
- F2 locked CombatEngine contest authority: `bd3dc46eb4b158a48dbe4e7cb004d2c5dee4b47a`
- F targeted gate: `b7a38af683fcb4583a3c0bf7c83a79d0807b37bf`
- Control Pressure 8s reset: `12128ded9daf868654dbb3c1cc16d05f4145af0d`
- F3 exact Sword five-stat scaling: `6f96aaae591b8c12c37adc00f1daf1c8a3d2758b`
- Shared five-stat power helper: `a54f5bc581a1af505ae19b7a032c1032252ca2c4`
- F3/F4 regression guards: `0eee3de5b541f01b5c9a6c3aed01a90ff1a8cef4`
- V170-compatible Potential lifetime authority fix: `5407610ade61ab269cbb4dd3ef890fb55d2c21ec`
- Anti-forgery migration guard: `ec1c4de66227d23eb76c80b49b2e651921857d5d`

Current status: **F1–F4 IMPLEMENTED / F5 TARGETED QA WIRED / LOCAL QA PENDING**.


## 8. F5 combat-consumer parity audit — 2026-09-25

Static audit covered Dungeon, Hunt, Boss, PvP, virtual/offline Hunt, legacy combatants, and player stat composition.

- Player composition synchronizes legacy static CL/TP/TPH/LL into the five-stat snapshot after the final stat layer; TT is not reconstructed from direct Accuracy.
- Runtime Attack buffs/debuffs keep their historical whole-skill damage effect for five-stat Sword skills, without converting Mobility/Accuracy modifiers into TPH/TT.
- Legacy/NPC combatants receive one five-stat snapshot at combat instantiation.
- Hunt V130 telemetry and Săn Ảo preview read F hybrid scaling; Attack-only V77 preview is compatibility-only.
- PvP rating scaling preserves `primaryStatsV5`; PvP snapshots and encounter compilation preserve it by structured clone.
- Dungeon first-clear, Hunt Boss and Săn Ảo/offline settlement resolve through CombatKernel V3 in production.
- Boss V2 authoring does not independently mutate player five-stat authority; `offline.js` does not rescale combat stats.

Static conclusion: no additional Dungeon/Boss/offline balance-coefficient changes are justified before F6 runtime evidence. Status remains **QA PENDING**.
