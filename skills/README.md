# Project-local Godot Agent Skills

These skills are vendored into this repository so AI coding agents working on the Godot migration have a stable, project-local reference.

Upstream:
- repository: `vl4dt/godot-skills`
- pinned commit: `1ae280d35f2cc3931d4d8eb63f4bac82d6acf4a0`
- license: MIT
- upstream compatibility: Godot 4.x, including Godot 4.7

Vendored core set:
- `godot-ui`
- `godot-architecture`
- `godot-headless-workflow`
- `godot-code-review`
- `godot-animation`
- `godot-shaders-vfx`
- `godot-debugging`

## Project rule

Do not treat these files as optional reading for Godot work.

Use `godot/AGENTS.md` to determine which skill files are mandatory for the current task.

The project-specific contract wins when it is stricter than the upstream skill guidance:
current user instruction -> root `AGENTS.md` / `CURRENT_CHECKPOINT.md` -> `godot/AGENTS.md` -> relevant skill -> general upstream advice.

## Updating the vendored snapshot

Never silently track upstream `main`.

When updating:
1. select an explicit upstream commit;
2. review the diff in the relevant skills;
3. replace the vendored files;
4. update the pinned SHA in this file;
5. run the Godot verification gate before relying on new guidance.
