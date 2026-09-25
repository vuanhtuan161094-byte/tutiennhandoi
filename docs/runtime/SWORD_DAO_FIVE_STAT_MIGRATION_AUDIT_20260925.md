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

with the existing CDR cap **66.67%**. Existing chain safety stays unchanged: 5 continuous seconds breaks control and grants 3 seconds Bất Khuất. Pressure remains per control group and grows by +1 on an applied control attempt.

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
