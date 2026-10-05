# MODULE — COMBAT UI/UX V1

Status: **ACTIVE — C0A DESIGN COMPLETE / C0B IMPLEMENTATION NEXT**

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
| C0B | Combat bridge/view-model implementation + tests | **NEXT — requires executable gate** |
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

## Current next action

Implement **C0B** when the executable Godot/bridge gate is available. C1–C4 logical layout is already specified and must not be implemented by guessing around the missing combat DTO.

C0 audit: docs/ui/COMBAT_UI_C0_ARCHITECTURE_AUDIT_20261005.md.

Wireframe: docs/ui/COMBAT_UI_LAYOUT_WIREFRAME_V1_20261005.md.
