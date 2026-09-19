# godot/AGENTS.md — Godot 4.7.2 Development Contract

This file governs all work under `godot/**`.

Engine target: **Godot 4.7.2 stable, GDScript**.

The locked canonical JS runtime remains gameplay authority during migration unless the user explicitly opens a parity-proven porting slice.

## 1. Mandatory reading

Before any Godot code / scene / UI / asset integration:

1. read root `AGENTS.md`;
2. read `CURRENT_CHECKPOINT.md`;
3. read `docs/DEVELOPMENT_PROTOCOL.md`;
4. read this file;
5. load the skill(s) mapped below;
6. inspect only the exact Godot source and canonical backend contract needed.

## 2. Skill activation map

Always for executable Godot changes:
- `/skills/godot-headless-workflow/SKILL.md`
- `/skills/godot-debugging/SKILL.md`

UI / HUD / menus / responsive layout:
- `/skills/godot-ui/SKILL.md`
- `/skills/godot-architecture/SKILL.md`

Scene decomposition / refactor / signal boundaries:
- `/skills/godot-architecture/SKILL.md`
- `/skills/godot-code-review/SKILL.md`

Tween / transitions / character idle / UI motion:
- `/skills/godot-animation/SKILL.md`

Particles / aura / mist / shaders / visual effects:
- `/skills/godot-shaders-vfx/SKILL.md`

Bug / parser / runtime / import / export problem:
- `/skills/godot-debugging/SKILL.md`
- `/skills/godot-code-review/SKILL.md` when a structural cause is plausible.

## 3. Architecture rules

Prefer:
- scene composition over one giant script;
- signals for cross-component events;
- ViewModel / adapter boundaries between canonical backend DTO and presentation;
- Containers / anchors / size flags for UI layout;
- reusable Theme / component scenes over repeated per-node style overrides;
- presentation-only Godot code while JS runtime remains authority.

Avoid:
- gameplay calculations inside HUD scripts;
- raw bridge DTO reads scattered across UI;
- hardcoded absolute layout everywhere when Container/anchor composition is appropriate;
- direct production use of placeholder/debug art;
- giant `main.gd` builders;
- silently inventing Godot APIs, node paths, UIDs, or addon methods.

## 4. Godot verification gate

No Godot executable change may be called complete without local proof.

Required order:

`import -> parse-check -> targeted test -> bounded smoke -> visual proof when UI-visible`

Minimum commands, from the Godot project directory, when the executable is available on PATH:

```text
godot --headless --path . --import
godot --headless --check-only --script res://<changed-script>.gd
godot --headless --path . --quit-after 300
```

For bridge/runtime migration changes, also run the project bridge smoke.

For UI-visible work:
- use the actual Godot runtime at **390x844**;
- inspect runtime errors before visual review;
- candidate is not visually approved until the user approves the actual runtime screenshot;
- visual regression automation should be used once Stagehand is installed and locked for this project.

## 5. Scene and resource safety

- never edit `.godot/**`;
- never fabricate `uid://` values;
- preserve path-based resource references when hand-editing text scenes;
- run a full import after adding/removing assets/scenes;
- generated `*.import` and script UID sidecars are local engine artifacts unless deliberately tracked by project policy.

## 6. UI production rules

For production UI:
- information architecture before decoration;
- backend decides availability/state; UI renders it;
- always-visible information must justify permanent screen space;
- details use progressive disclosure;
- hero/world composition must be evaluated in the real portrait runtime;
- mockup is a visual target, not implementation proof;
- do not iterate by random pixel nudging without comparing against the locked target.

## 7. Completion language

Do not say `done`, `fixed`, `PASS`, or equivalent from static inspection alone.

Use:
- `static candidate` before validation;
- `runtime candidate` after import/parse/smoke;
- `visual candidate` after actual screenshot evidence;
- `approved` only after explicit user visual approval.
