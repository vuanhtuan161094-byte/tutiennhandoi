# Tu Tiên Nhàn Dỗi — Godot Client

Godot 4.7.2 is the active presentation migration target.

## Run

1. Update the repository with `CAP_NHAT_GAME_LOCAL.cmd` or use `00_CHOI_GAME_GODOT_LOCAL.cmd`.
2. Open `godot/project.godot` in Godot 4.7.2.
3. Run the project at the canonical portrait viewport 390×844.

## Authority boundary

The canonical JavaScript runtime under `dist/` remains gameplay/save authority through the locked V160–V179 contracts.

Godot currently owns presentation/transport slices for:
- Home / Tu Luyện;
- Character;
- Kho Đồ / Trang Bị candidate flows.

It must not invent gameplay values that are not exposed by the canonical bridge.

## Canonical bridge

`BackendBridge` launches:

`node godot/backend/bridge_server.mjs 4192`

The bridge version is `godot-bridge.v2`. It serves canonical Home and Character/Equipment DTOs and dispatches an allowlisted set of actions back into the existing JS runtime. The migration save is local under `godot/.runtime/` and is ignored by Git.

See `godot/docs/BACKEND_BRIDGE.md`.

## Verification

Run:

`VERIFY_GODOT_LOCAL.cmd`

Required order is import → parse → GdUnit4 → bridge smoke → bounded runtime smoke → Stagehand structural smoke → visual capture/diff.

A static source review is never a Godot runtime PASS.
