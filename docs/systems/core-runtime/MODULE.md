# MODULE — CORE RUNTIME

Status: **CLOSED / LOCKED authority with LIVE compatibility surfaces**

## Purpose

Own the canonical JS runtime/save/gameplay execution model consumed by clients.

## Authority

- Canonical JS runtime/save/gameplay authority through V179 remains locked.
- Combat Backend V3 is CLOSED / LOCKED.
- Godot is a presentation/client unless a separately scoped parity-proven port is explicitly opened.

## Depends on

Low-level data/content contracts and save compatibility.

## Provides

- authoritative gameplay state;
- save/load state;
- action/session runtime;
- combat/runtime projections consumed by presentation.

## Must NOT own

Presentation layout, art direction or visual-only interaction state.

## Current submodules

| Submodule | State |
|---|---|
| Combat Backend V3 | CLOSED / LOCKED |
| Save compatibility | LIVE |
| Web/runtime transport | LIVE |
| Godot bridge | LIVE presentation bridge; audit per UI slice |

## Canonical docs

- `CURRENT_CHECKPOINT.md`
- `docs/runtime/COMBAT_BACKEND_V3_CLOSURE_20260924.md`
- `godot/docs/BACKEND_BRIDGE.md`

## Current action

Regression-only. Do not reopen for Combat UI reasons.
