# MODULE — COMBAT UI/UX V1

Status: **ACTIVE — GCOMBAT-2/3 RUNTIME PASS / VISUAL CANDIDATE — NOT APPROVED**

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
| GCombat-2 | Production HUD / Tactical Lane / compact Ngự Khí reference | **RUNTIME PASS — VISUAL CANDIDATE** |
| GCombat-3 | Production read-only Auto skill rail | **RUNTIME PASS — VISUAL CANDIDATE** |
| C1 | Combat screen shell / battlefield geometry | **RUNTIME PASS; VISUAL CANDIDATE** |
| C2 | Vital HUD | **RUNTIME PASS; VISUAL CANDIDATE** |
| C3 | Skill rail | **RUNTIME PASS; VISUAL CANDIDATE** |
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

Windows `KIEM_TRA_GAME.cmd` exited 0 on the clean production HUD/rail implementation SHA `7e820641ff56d15d2d18439fb091e828ea167b58` on 2026-10-05. Import/parse, 66 GdUnit tests, canonical bridge/P2 smoke, 50 Home and 27 Combat Stagehand steps passed. Home capture passed 9/9; actual canonical Combat capture passed 35/35. Prefight/playback at 390×844 and prefight at 360×800, 412×915 and 430×932 were captured and inspected. Proof, source inventory and transport limitations: `docs/ui/GODOT_COMBAT_PRODUCTION_HUD_RAIL_GATE_20261005.md`. Later documentation commits do not replace this implementation proof.

Next: user review of GCombat-2/3 visual candidates. GCombat-0 and GCombat-1 remain PASS. GCombat-4 has not been opened; the compact Ngự Khí reference does not complete all eight Dao widgets. These runtime results do not approve visual design or close/lock Combat UI. Canonical Combat/Dao gameplay authority and approved visual baselines were not changed.

C0 audit: docs/ui/COMBAT_UI_C0_ARCHITECTURE_AUDIT_20261005.md.

Wireframe: docs/ui/COMBAT_UI_LAYOUT_WIREFRAME_V1_20261005.md.
