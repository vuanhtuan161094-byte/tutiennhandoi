# SWORD DAO F — FIVE-STAT MIGRATION AUDIT — 2026-09-25

Status: **OPEN / DESIGN DECISIONS REQUIRED BEFORE EXECUTABLE MIGRATION**

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

## 4. Gameplay decisions still missing — BLOCKERS

### F-B1 — Old save migration/refund

The contract requires save migration/refund but does not define how old `power/body/defense` allocations become five-axis allocations.

A production rule must explicitly choose one policy, for both current-life and permanent Potential:

- full refund: preserve `lifetimeEarned`, set all five allocations to 0, move every previously spent point back to `unspent`; or
- authored mapping: define exact point-for-point mapping from each old axis into CL/TP/TPH/LL/TT.

No mapping is currently authorized.

### F-B2 — Mobility vs Accuracy Dodge authority

The target says TPH grants Mobility and TT grants Accuracy, and F must migrate the Dodge authority, but no production formula/caps/floor are locked.

Required lock: exact function from attacker Accuracy and defender Mobility to Dodge/Hit chance, including min/max bounds and interaction with direct `dodgeChancePct` bonuses.

### F-B3 — Control vs Resolve authority

The target says TT grants both Control and Resolve, and F must migrate Control-vs-Resolve, but no production formula is locked.

Required lock: exact effect of source Control vs target Resolve on control duration/chance, including bounds and interaction with `controlDurationReductionPct`, chain break and immunity.

## 5. Defense status

No separate blocker is required yet for Defense if the user chooses to preserve the already-locked `A/(A+D)` mitigation curve and only changes how the five primary stats feed offensive power and Defense. If a different Defense contest is intended, it must be explicitly locked before F changes CombatKernel behavior.

## 6. F implementation order after blockers are locked

1. F1 — five-axis Potential state + restore migration/refund + provenance.
2. F2 — derive CL/TP/TPH/LL/TT into combat stats and UI/read models.
3. F3 — Sword per-skill five-stat scaling.
4. F4 — Defense / Dodge / Control authorities.
5. F5 — PvE/PvP/save parity + targeted F QA + Backend Fast.
6. F6 — production Sword balance rerun on the migrated runtime.
7. Exact candidate Full Clean before F closure.

Do not convert the other seven Dao until F closes and Sword is rebalanced on production runtime.
