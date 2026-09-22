# Godot Combat presentation tooling

## Selected runtime helper

Combat presentation uses a pinned runtime subset of **Saltmire Juice 1.1.0**:

- upstream: `saltmire/saltmire-juice`
- commit: `258dbf25f3a131ae0960374b3a7c6c0b4d417ee9`
- license: MIT
- vendored path: `godot/addons/saltmire_juice/`

The integration is deliberately small. The project uses the addon for:

- trauma-based Camera2D shake;
- hit flash;
- scale punch;
- pooled floating damage numbers.

Combat code must call these effects through
`res://scripts/combat/combat_feedback.gd` rather than coupling screens or
actors directly to the third-party API.

## Deliberately not used

`Juice.hitstop()` is not part of the Combat adapter. It changes
`Engine.time_scale`, while canonical Combat authority still runs in the
external locked JavaScript runtime. Freezing only Godot could let the authority
advance while presentation is paused.

If impact pause is required later, implement a presentation-local pause for
specific actor/animation nodes, driven by the Combat event/view-model layer.

## Tools evaluated but not integrated

- Phantom Camera: useful general camera system, but excessive for the planned
  fixed portrait battlefield and creates another camera ownership layer.
- GODOT-VFX-LIBRARY: broad production VFX library, but substantially larger than
  the current requirement. Re-evaluate only when authored skill/Dao VFX are the
  active slice.
- Juicee / Sparkle Lite: visual feedback authoring systems. Their additional
  editor/runtime abstraction is not needed while Combat events remain
  backend-authored and presentation-only.
- third-party combat/hitbox frameworks: rejected because damage, hit outcome,
  skill triggers and Combat stats remain V168 runtime authority.

Godot built-ins remain canonical for actor animation: AnimationPlayer /
AnimationTree, Tween, GPUParticles2D and canvas_item shaders.
