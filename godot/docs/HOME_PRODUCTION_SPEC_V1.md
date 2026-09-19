# GODOT HOME PRODUCTION SPEC V1

Status: IMPLEMENTED CANDIDATE — runtime screenshot proof required
Date: 2026-09-19
Viewport: 390 x 844

## Product goal

Home answers five questions immediately:
1. Current realm.
2. Current Tu Vi progress.
3. Current cultivation rate and ETA.
4. Whether a progression-critical action is available.
5. Where the player can go next.

Everything else uses progressive disclosure.

## Persistent information

Always visible:
- current realm;
- current life number;
- Tu Vi current / required;
- Tu Vi rate per 15 seconds;
- ETA;
- Spirit Stone;
- Reincarnation CP;
- progression-critical CTA only when canonical backend exposes it.

Not permanently visible:
- character name;
- spiritual root details;
- age/lifespan;
- injury;
- active technique;
- build score;
- strongest/bottleneck axes;
- cultivation source breakdown;
- raw backend identifiers/debug fields.

## Progressive disclosure

Tap realm:
- current-life identity;
- spiritual root;
- technique;
- age/lifespan;
- injury when present;
- interpreted build information.

Tap Tu Vi:
- current / required;
- rate;
- ETA;
- retreat bank/cap/reward when unlocked;
- cultivation rate sources;
- canonical activity hints.

Tap Bế Quan:
- choose authored 1h / 3h / 6h / 9h options;
- unavailable until canonical retreat.enabled is true.

## Composition

Visual priority:
1. world + centered cultivator;
2. realm identity;
3. cultivation progression;
4. contextual actions;
5. navigation.

Centered cultivator:
- dedicated Home asset;
- no combat pose;
- no right-edge composition;
- aura shares cultivator center;
- subtle breathing/aura/spark motion.

## Architecture

Main scene is orchestration only:

- HomeStage: background, cultivator, aura, atmospheric motion.
- HomeHUD: realm/resources/Tu Vi/context CTA/quick actions.
- HomeOverlay: identity, cultivation, retreat sheets.
- HomeNav: six-system bottom navigation.
- HomeViewModel: raw bridge DTO -> presentation model.
- BackendBridge: transport only.

Data path:

Canonical JS Runtime -> Godot Bridge -> HomeViewModel -> Home components

No gameplay calculation belongs in the Home presentation scripts.

## Acceptance gates

- character is centered and not cropped;
- aura is centered on the character;
- canonical bridge is ONLINE;
- no raw/debug backend fields on Home;
- no fake always-visible cultivation CTA;
- Bế Quan visibility follows canonical authority;
- realm and Tu Vi details open by click;
- persistent Home has at most three visual HUD clusters;
- production icon assets replace Unicode prototype controls;
- actual Godot runtime screenshot is reviewed before status becomes CLOSED.
