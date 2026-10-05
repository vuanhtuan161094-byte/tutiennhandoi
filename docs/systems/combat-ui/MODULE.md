# MODULE — COMBAT UI/UX V1

Status: **ACTIVE — GODOT-FIRST STATIC CANDIDATE / EXECUTABLE GATE PENDING**

Updated: 2026-10-05

## Purpose

Turn the locked combat systems into a readable, attractive, mobile-first battle experience.

The player must be able to see:
- who is fighting;
- current HP/CN/Ultimate/Break state;
- what skill is happening;
- what the enemy is preparing;
- what the Main Dao is currently building/spending;
- what Auto is trying to do;
- why a major combat moment happened.

## Authority

Gameplay truth:
- canonical JS Combat Backend + locked Dao runtimes.

Presentation references:
- `docs/ui/COMBAT_INFORMATION_CONTRACT_V1.md`
- `docs/ui/COMBAT_PRESENTATION_OWNERSHIP_V1.md`
- `docs/ui/COMBAT_READABILITY_HANDOFF_20260917.md`

Execution plan:
- `docs/ui/COMBAT_UI_UX_V1_PLAN_20261005.md`

## Depends on

- Combat Backend V3
- all 8 locked Main Dao
- Hunt activity model
- Boss/challenge model
- presentation bridge/projection
- asset pipeline

## Provides

- battlefield composition;
- player/enemy vital HUD;
- skill rail;
- Main Dao widget;
- telegraphs;
- combat feedback;
- Auto feedback;
- Boss combat presentation;
- VFX/camera/sound hooks after UX is stable.

## Must NOT own

- damage;
- hit/miss/outcome;
- skill availability truth;
- cooldown authority;
- resource mutation;
- Dao resource calculations;
- Boss reward logic;
- save schema;
- Core Balance.

## Phase state

| Phase | Scope | State |
|---|---|---|
| C0A | Source audit + architecture/data-contract design | **DESIGN COMPLETE** |
| C0B / GCombat-0 | Combat bridge/view-model implementation + tests | **GODOT RUNTIME GATE: PASS** |
| GCombat-1 | Godot-first playable Combat skeleton | **GODOT RUNTIME GATE: PASS; VISUAL CANDIDATE — NOT APPROVED** |
| C1 | Combat screen shell / battlefield geometry | PLANNED |
| C2 | Vital HUD | PLANNED |
| C3 | Skill rail | PLANNED |
| C4 | 8 Dao widgets | PLANNED |
| C5 | Combat feedback | PLANNED |
| C6 | Enemy/Boss telegraph | PLANNED |
| C7 | Auto Combat UX | PLANNED |
| C8 | Boss/prefight/detail UX | PLANNED |
| C9 | VFX/camera/animation/sound polish | PLANNED |

## Closure rule

No Combat UI slice is LOCKED without:
- technical gate;
- actual runtime evidence;
- screenshot at relevant mobile viewport(s);
- explicit user visual approval.

## Production presentation decision

Godot is the production Combat presentation owner.

The old web DOM/CSS/Pixi Combat surface is retained for compatibility, debugging and regression reference only. Do not port its geometry or styling into Godot.

Current production path:

`CombatKernel / Session → Godot Combat DTO/events → BackendBridge → CombatViewModel → CombatScreen / DaoWidget / SkillRail / VFX`

## Current next action

Windows `KIEM_TRA_GAME.cmd` exited 0 at implementation SHA `6d0a3a5d460f1e957d5a893ec69b07e5469d39c6` on 2026-10-05. Import/parse, 63 GdUnit tests, canonical bridge/P2 smoke, 50 Home and 27 Combat Stagehand steps passed. Actual Combat prefight/playback was captured at 390×844. Proof and changed-file inventory: `docs/ui/GODOT_COMBAT_RUNTIME_GATE_20261005.md`.

Next: user review of the Combat visual candidate, then the planned presentation phases. These runtime results do not approve visual design or close/lock Combat UI. Canonical Combat/Dao gameplay authority and approved visual baselines were not changed.

C0 audit: docs/ui/COMBAT_UI_C0_ARCHITECTURE_AUDIT_20261005.md.

Wireframe: docs/ui/COMBAT_UI_LAYOUT_WIREFRAME_V1_20261005.md.
