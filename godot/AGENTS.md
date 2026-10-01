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

### 2.1 Source-video animation intake — LOCKED

For **Home / Tu luyện / Character** animation work, a user-provided MP4/WebM/MOV is **source material only**, not a runtime video asset.

When the user says phrases such as `đưa hoạt ảnh vào`, `đẩy hoạt ảnh vào`, `thêm animation`, `đưa video này vào Home/Tu luyện/Character`, or an equivalent instruction, the default interpretation is locked to this workflow unless the user explicitly asks for real video playback:

`source video -> tools/video_to_godot_animation.py -> transparent stable-canvas frames -> WebP atlas -> SpriteFrames .tres -> existing animation registry -> AnimatedSprite2D`

Mandatory rules:
- read `docs/tools/VIDEO_TO_GODOT_ANIMATION.md` before processing source video;
- use `TAO_ANIMATION_TU_VIDEO.cmd` / `tools/video_to_godot_animation.py`; do not invent a parallel conversion path when the canonical tool can handle the source;
- do **not** add `VideoStreamPlayer`, ship the MP4 as the character loop, or build a separate video-playback subsystem for these animations;
- preserve stable union crop and a stable canvas so the subject does not jump between frames;
- chroma-key/despill/matte cleanup belongs in the asset pipeline, not in gameplay code;
- use the existing `HomeAnimationRegistry` + `meditation_hero.gd` path for Home and `CharacterAnimationRegistry` + `standing_hero.gd` for Character;
- keep animation presentation-only. It must not alter cultivation EXP, realm progression, stats, combat, save authority, or canonical JS gameplay timing;
- classify by pose/semantic role rather than filename: seated/meditation cultivation belongs to Home cultivation; relaxed/idle/low-pose activity belongs to Home rest; standing character presentation belongs to Character, unless the user explicitly assigns a different role;
- match the nearest production preset conventions for FPS, frame width, bottom anchoring, looping/restart semantics and lazy loading instead of choosing new values ad hoc;
- source videos and pipeline previews are not runtime proof. After resource integration run import + `KIEM_TRA_GAME.cmd`, inspect the real 390x844 runtime, then request user visual approval before calling the asset locked.

If an older chat description conflicts with the live registries/tool/docs, live `main` wins.

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

## 5. Stagehand / GdUnit4 tooling

Pinned toolchain:
- Stagehand `v0.4.1`, addon vendored under `godot/addons/stagehand`;
- GdUnit4 `v6.2.1`, installed locally by `powershell -NoProfile -ExecutionPolicy Bypass -File tools/godot/Setup-GodotTooling.ps1`;
- exact versions/checksums live in `tools/godot/TOOLING_LOCK.json`.

For any executable Godot change, use:
- `KIEM_TRA_GAME.cmd` as the normal local gate;
- `/skills/godot-stagehand/SKILL.md` for Stagehand scenario / selector / screenshot work.

The gate performs:
1. project import;
2. parse-check of project scripts;
3. GdUnit4;
4. canonical bridge smoke;
5. bounded Godot runtime smoke;
6. Stagehand structural runtime smoke;
7. visual capture or visual regression.

Visual rule:
- before a user-approved baseline exists, verification captures a deterministic 390x844 candidate only;
- only explicit user approval may promote that candidate with `powershell -NoProfile -ExecutionPolicy Bypass -File tools/godot/Approve-HomeBaseline.ps1 -ConfirmApproved`;
- once a committed baseline exists, verification runs Stagehand screenshot diff automatically;
- never refresh a golden baseline merely to make a failing diff green.

## 6. Scene and resource safety

- never edit `.godot/**`;
- never fabricate `uid://` values;
- preserve path-based resource references when hand-editing text scenes;
- run a full import after adding/removing assets/scenes;
- generated `*.import` and script UID sidecars are local engine artifacts unless deliberately tracked by project policy.

## 7. UI production rules

For production UI:
- information architecture before decoration;
- backend decides availability/state; UI renders it;
- always-visible information must justify permanent screen space;
- details use progressive disclosure;
- hero/world composition must be evaluated in the real portrait runtime;
- mockup is a visual target, not implementation proof;
- do not iterate by random pixel nudging without comparing against the locked target.

## 8. Completion language

Do not say `done`, `fixed`, `PASS`, or equivalent from static inspection alone.

Use:
- `static candidate` before validation;
- `runtime candidate` after import/parse/smoke;
- `visual candidate` after actual screenshot evidence;
- `approved` only after explicit user visual approval.
