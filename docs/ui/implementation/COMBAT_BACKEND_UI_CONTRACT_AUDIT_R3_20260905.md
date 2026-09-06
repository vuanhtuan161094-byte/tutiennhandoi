# Combat Backend → UI Contract Audit R3 — 2026-09-05

Baseline: V129 + Combat UI V2 R2. Backend gameplay semantics are not changed by this patch.

## 1. Authoritative combat signals already emitted by runtime

### Vital / actor state
- Player / enemy HP current, max and percent through `battleStart`, `damage`, `heal`, `death` events.
- Cast start, projectile, hit, dodge, heal, defeat presentation states.
- Skill identity and skill timing metadata on cast events.

### Phá Thế / Thế
- `breakDamagePct`.
- `poisePct` during pressure.
- `broken` / Thất Thế with defense reduction.
- Canonical rule: Thất Thế 5s, then Ổn Thế 3s; Boss receives 50% effectiveness of the normal defense reduction.
- The authored hunt replay stream can emit `pressure`, `broken`, `recovering`, `ready`.

### Buff / debuff / marks
- Status id, name, kind and duration are available to presentation.
- Mark events include stack count, max stack and consumed stacks.
- UI already has two status trays and overflow policy: four priority statuses per side, extras collapsed into `+N`.

### Dao resources / Ultimate
- Resource events carry `resourceId`, current, max and delta.
- Ultimate Gauge is a first-class resource with 0–100 state.
- Runtime supports multiple Dao-specific resource IDs, not one universal bar.
- Sword Intent has separate duration/detail metadata in the presentation bridge.

### Boss mechanics
- Boss mechanic status / Dị Tượng.
- Boss phase events.
- Counter-window open / success / failure.
- Enemy cast telegraph, including lethal danger metadata when authored.
- Boss visual states: idle / attack / cast / hit / phase2 / phase3 / defeat.

### Defense / sustain / damage
- Heal events.
- Shield gain and shield break events.
- Damage, crit, DoT/mark-burst classification.
- Battle summary includes total damage, received damage, top skill, DoT, Phá Thế count and mark-burst count.

## 2. Information that SHOULD be visible in the production Combat HUD

Priority A — always readable:
1. Player HP.
2. Player CN.
3. Boss HP.
4. Boss Phá Thế meter + state: pressure / THẤT THẾ / ỔN THẾ.
5. Learned active skill rotation + cooldown state; icons are read-only, never manual-cast buttons.
6. Current Dao resource(s) relevant to the selected Dao.
7. Ultimate Gauge / READY state.

Priority B — contextual, shown only when active:
1. Player buffs / shields / control immunity / healing state.
2. Boss debuffs / marks / DoT / exposed state.
3. Boss phase.
4. Boss telegraph and cast countdown.
5. Counter window.
6. Thất Thế burst countdown.
7. Spirit Beast / Confidant / Artifact trigger when it actually procs.

Priority C — inspectable, not permanently occupying battlefield:
1. Full combat log.
2. Damage composition.
3. Detailed mechanic descriptions.
4. Full skill coefficients / CN cost / cooldown / Phá Thế coefficient.
5. Battle summary.

## 3. Backend/presentation bridge gaps found

These are not reasons to redesign gameplay. They are data/presentation bridge issues to address after the HUD geometry is locked.

### GAP-CN-01 — current CN is not fully streamed to HUD
CombatKernel owns real Spirit/Chân Nguyên and spends/regenerates it. The current hunt presentation renders the initial CN as full and the hunt stream does not expose a continuous authoritative `spiritCurrent/spiritMax` state to the HUD. Therefore the current CN bar can look static despite real backend resource consumption.

Recommended fix: extend combat telemetry/presentation stream with current/max CN at cast/resource checkpoints. Do not calculate CN independently on the client.

### GAP-BREAK-02 — kernel-backed stream does not expose every recovery transition explicitly
The authored hunt replay stream emits `recovering` and `ready`. Kernel combat logs clearly contain the canonical Thất Thế rule, but the kernel→hunt mapper currently infers `broken` vs `pressure`; explicit `Ổn Thế` / `ready` transitions are not represented as strongly as the authored stream.

Recommended fix: expose break lifecycle events from authoritative combat state or synthesize them in the mapper strictly from canonical timestamps already produced by CombatKernel.

### GAP-SHIELD-03 — shield quantity is under-presented
Kernel shield events contain shield amount/total-shield information, while current HUD turns the event mostly into a generic Hộ Thể status chip. Production HUD should show a numeric shield cue when meaningful without creating another permanent large bar.

### GAP-STATUS-04 — generic status stack count is not consistently surfaced
Mark stacks are supported. Generic status events can carry stack data in CombatKernel logs, but the current mapper/UI does not consistently display stacks for ordinary statuses.

## 4. DEV inspection capability

The source already had a save-safe DEV Combat Sandbox behind `?dev=1`. It was not surfaced clearly enough in the UI workflow. R3 makes it an explicit QA tool.

Open:
`http://127.0.0.1:4173/?dev=1`

Then enter Phiêu Lưu / Săn Yêu and open the `DEV` drawer.

R3 capabilities:
- Switch among all 8 Main Dao builds using backend `devSandboxPreset`.
- Select realm and force a Boss test floor.
- Run one real backend fight and replay its real combat event stream.
- Player pose QA.
- Boss state QA.
- FX primitive QA.
- UI State Lab for deterministic visual inspection of:
  - neutral HUD,
  - Phá Thế pressure,
  - Thất Thế,
  - multiple buffs/debuffs/mark stacks,
  - boss phase 2 + dangerous telegraph,
  - Dao resource + Ultimate READY.

UI State Lab is presentation-only and clearly separated from backend-authoritative real combat. It never writes production save.

## 5. R3 UI correction included

The Auto Skill strip is restored in pre-fight. Only learned/real skills are visible; sealed/empty slots stay hidden. Tapping remains detail-only and never casts a skill.

## 6. Next production step

Use DEV to capture at least these cases for each Dao:
- pre-fight with learned skill strip,
- normal combat,
- Dao resource accumulation/spend,
- Ultimate READY,
- Phá Thế pressure,
- Thất Thế,
- buff/debuff-heavy state.

Once geometry is approved, implement the CN, break lifecycle, shield quantity and generic-stack bridge gaps above, then run real backend fights for all eight Daos as the acceptance gate.
