# GODOT BACKEND BRIDGE V1

Status: ACTIVE MIGRATION BOUNDARY
Date: 2026-09-19

## Purpose

Godot is replacing the presentation/client layer without reopening the locked gameplay authorities.

The current web build does not expose a real network REST backend. Its `/api/*` contract is implemented inside `standalone-runtime.js` by intercepting browser `fetch`. Godot therefore cannot call the old web server directly for gameplay state.

`godot/backend/bridge_server.mjs` runs the same canonical `dist/core/*` runtime in Node and exposes a narrow localhost contract for Godot.

## Authority preserved

Bridge imports the existing canonical runtime:

- `buildRegistry()`
- `SimulationSession`
- `GameplayFacade`
- `createGameApplicationApi()`
- `buildWebClientViewPatch()`
- V140 real-time cultivation balance

No V160-V179 gameplay authority is reimplemented in GDScript.

## Home DTO

`GET http://127.0.0.1:4190/home`

Canonical inputs:

- `overview.life`
- `character-cultivation.v140`
- `getSpiritualRootV145()`
- `resource.spirit_stone`
- `shell.reincarnationCp`

Godot displays:

- player name
- current life number
- realm
- Tu Vi / required Tu Vi
- Tu Vi per 15 seconds
- ETA
- injury
- remaining lifespan
- spiritual-root grade
- Spirit Stone
- Reincarnation CP

## Mutation endpoints

`POST /action` currently permits only canonical Home actions:

- `retreatV140`
- `useCultivationPill`
- `ascendRealmV140`
- `tribulationV140`

The bridge persists its dev migration save under `godot/.runtime/`, which is gitignored.

## Migration rule

Presentation may move to Godot. Gameplay truth stays in the canonical JS runtime until a specific runtime slice is deliberately ported and parity-proven.
