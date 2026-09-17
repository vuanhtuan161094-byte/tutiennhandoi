# Combat Presentation Ownership V1

Status: active architecture contract for the Combat Readability slice.

## Data flow

`CombatKernel / endlessHunt model → Combat Presentation Model V1 → DOM renderer / Pixi presentation`

The presentation model may map backend-authored fields for display, but it must not decide battle outcomes, damage, save state, Boss rewards, or progression. Direct Boss challenge remains progression-only. Săn Ảo remains the economy settlement path.

## JavaScript ownership

- `modules/combat-presentation-architecture-v140.js`: canonical presentation model, presentation event adapter, actor/HUD extension registry.
- `modules/combat-dom-renderer-v1.js`: DOM application only. It consumes the canonical presentation model and transient visual state.
- `ui-combat-target-v1.js`: mount/unmount, scoped observation, transient visual-state detection, lazy renderer/tool loading only.
- `modules/hunt-combat-v2.js`: legacy Hunt composition + combat presentation driver. It is containment-locked: new Boss/challenge/farm presentation interpretation must not be added here.
- `modules/combat-presentation-runtime-v140.js`: Pixi/runtime presentation façade.

## CSS ownership

No new Combat CSS layer may be added without first consolidating an existing owner. Current ordered owners are:

1. `combat-v2.css` — legacy foundation.
2. `ui-combat-target-v1.css` — readability target/base overrides.
3. `ui-combat-polish-v2.css` — established readability polish.
4. `ui-combat-polish-v3.css` — legibility/status polish.
5. `ui-combat-polish-v4.css` — actor/support orbit polish.
6. `ui-combat-composition.css` — battlefield composition.
7. `ui-combat-visual-polish.css` — transient visual hierarchy.
8. `ui-combat-camera-polish.css` — camera, portrait compact geometry, Kiếm Ý/skill-rail clearances.
9. `ui-combat-information-v1.css` — final Boss information/state visibility and final active/prefight composition overrides.

`ui-combat-information-v1.css` remains the last CSS owner. Do not add `polish-v5` or another final override sheet. A future physical merge of camera + information owners is allowed only if exact declaration order is preserved and runtime visual proof is green; an `@import` aggregator is explicitly rejected because it adds a CSS loading waterfall without reducing the underlying cascade.

## Locked semantics

- Boss challenge does not directly mint Linh Thạch, equipment, or timed-farm settlement.
- Farm/reward copy must describe Săn Ảo / timed reward semantics.
- HP bar geometry consumes authoritative percentage/magnitude data; formatted K/M/B display strings are never reverse-parsed into numeric HP.
- Presentation modules must not call production mutation APIs or write save state.
