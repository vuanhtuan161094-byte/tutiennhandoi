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

Ngự Khí animation intake has a narrow static candidate at `9e7fd49a7dc25fb481647186b4477df254965c25`: 1 Idle + 10 canonical skill routes are wired from authoritative player cast events into a presentation-only animated player actor with native fallback. Processed binary atlases/SpriteFrames are not yet committed/installed on `main`; Windows import + `KIEM_TRA_GAME.cmd` + real 390×844 review are still required. This does **not** open/close full GCombat-4 or approve production art. Record: `docs/ui/GODOT_COMBAT_NGU_KHI_ANIMATION_CANDIDATE_20261006.md`.

Combat Asset Architecture **PASS** (2026-10-06): 28 canonical biome names → **8 master biome families** + generic fallback; zone is intensity metadata, primaryElement is info metadata, neither selects map assets. Six enemy archetypes + generic; 80 registry skill icon entries across 8 Dao. Resolver integrated through native placeholders. Exact clean runtime SHA `b1f0b3c678b49b413a5d80f480c5ad11e3f79928`; `KIEM_TRA_GAME.cmd` exit 0, GdUnit 76/76, targeted 18/18, Node mapping contract PASS, gameplay/RNG regression 6/6, bridge/P2/bounded, Home 50/50, Combat 28/28, Combat capture 23/23 + pixels PASS. Proof: `docs/ui/GODOT_COMBAT_BIOME_FAMILY_ARCHITECTURE_20261006.md`. **Background / Monster / Skill icon production art NOT STARTED; GCombat-4 NOT STARTED**.

Combat Visual Metadata Contract **IMPLEMENTED / PASS** (2026-10-06): canonical environment and actual selected monster archetype forwarded through DTO/VM, no client inference, save migration or RNG/gameplay change. Clean SHA `54b1a422691de2f337c650162fd5f0b935b0906b`; targeted 6/6, deterministic 480 generators / 12 V3 fights, GdUnit 70/70, bridge/P2/bounded and Stagehand Home 50/50 / Combat 28/28, `KIEM_TRA_GAME.cmd -SkipVisual` exit 0. No new screenshot/asset pass. Proof: `docs/ui/GODOT_COMBAT_VISUAL_METADATA_CONTRACT_20261006.md`. GCombat-4 and asset integration **NOT STARTED**.

Latest visual shell gate: clean SHA `22eb0a785d4f77d0c3b67573ff844c841a6e06e8`, `KIEM_TRA_GAME.cmd` exit 0; 68 GdUnit, bridge/P2/bounded smoke, Home 50/50, Combat 28/28, Home capture 9/9, Combat capture 23/23 and both primary PNG pixel checks PASS. Static native atmosphere, replaceable silhouettes, compact HUD/Tactical and temporary engraved skill glyphs; gameplay unchanged. Proof: `docs/ui/GODOT_COMBAT_VISUAL_SHELL_20261005.md`. Visual candidate only; GCombat-4 NOT STARTED.

Latest screenshot pipeline gate: clean SHA `75f737adee63f400e8b1df7f856b6543f11755ce`, `KIEM_TRA_GAME.cmd` exit 0; 68 GdUnit tests, bridge/P2, Home 50/50, Combat 28/28, Home capture 9/9 and Combat capture 23/23 PASS. Both exported 390×844 PNGs pass dimensions/alpha/brightness/variance checks. Root-capture barrier and rejection of transparent/black/flat frames: `docs/ui/GODOT_COMBAT_SCREENSHOT_PIPELINE_20261005.md`.

Normal visual authority is 390×844 prefight/playback only. Four-size geometry remains structural; auxiliary 360×800 / 430×932 PNGs are milestone or major-layout diagnostics, with no mandatory 412×915 PNG. GCombat-2/3 remain visual candidates, GCombat-4 NOT STARTED. No screenshot was approved as a baseline.

Windows `KIEM_TRA_GAME.cmd` exited 0 on the clean production HUD/rail implementation SHA `7e820641ff56d15d2d18439fb091e828ea167b58` on 2026-10-05. Import/parse, 66 GdUnit tests, canonical bridge/P2 smoke, 50 Home and 27 Combat Stagehand steps passed. Home capture passed 9/9; actual canonical Combat capture passed 35/35. Prefight/playback at 390×844 and prefight at 360×800, 412×915 and 430×932 were captured and inspected. Proof, source inventory and transport limitations: `docs/ui/GODOT_COMBAT_PRODUCTION_HUD_RAIL_GATE_20261005.md`. Later documentation commits do not replace this implementation proof.

Next: user review of GCombat-2/3 visual candidates. GCombat-0 and GCombat-1 remain PASS. GCombat-4 has not been opened; the compact Ngự Khí reference does not complete all eight Dao widgets. These runtime results do not approve visual design or close/lock Combat UI. Canonical Combat/Dao gameplay authority and approved visual baselines were not changed.

C0 audit: docs/ui/COMBAT_UI_C0_ARCHITECTURE_AUDIT_20261005.md.

Wireframe: docs/ui/COMBAT_UI_LAYOUT_WIREFRAME_V1_20261005.md.
