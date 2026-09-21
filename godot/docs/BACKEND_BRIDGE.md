# GODOT BACKEND BRIDGE

Status: ACTIVE MIGRATION BOUNDARY

## Purpose

Godot replaces presentation incrementally while the locked JavaScript runtime remains gameplay/save authority.

`godot/backend/bridge_server.mjs` starts the same canonical `dist/core/*` runtime in Node and exposes a narrow localhost contract. Godot does not reimplement locked gameplay formulas in GDScript.

## Runtime

Godot launches the bridge on:

`http://127.0.0.1:4192`

Bridge version:

`godot-bridge.v2`

The bridge default port may differ when run directly; `BackendBridge` explicitly passes 4192.

## Current presentation DTOs

- `/home` → Home/Tu Luyện presentation state.
- `/character` → Character, equipment inventory, equipment-system resources and selected-item detail.

ViewModels normalize bridge DTOs before presentation code consumes them.

## Actions

`POST /action` accepts only actions explicitly allowlisted in `bridge_server.mjs`. These calls dispatch into canonical runtime APIs, including cultivation/retreat, Character progression and current V142 equipment operations.

Godot UI must render backend-authored availability/cost/result state; it must not duplicate gameplay rules.

## Persistence

Migration save data lives under `godot/.runtime/`, which is gitignored.

## Verification

Bridge changes require the bridge smoke inside `VERIFY_GODOT_LOCAL.cmd` before runtime completion can be claimed.
