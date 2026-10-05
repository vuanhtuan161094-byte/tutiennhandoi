# Production Combat HUD / Skill Rail Windows proof — 2026-10-05

**GCombat-2 RUNTIME PASS — VISUAL CANDIDATE**

**GCombat-3 RUNTIME PASS — VISUAL CANDIDATE**

GCombat-0 and GCombat-1 remain PASS. GCombat-4 has not been opened. No visual approval, baseline promotion or Combat UI closure is claimed.

## Candidate and command

- Opening main: `6cd29d9e57f718de25147f0606a3e0bec1e595dd`.
- Tested clean implementation SHA: `7e820641ff56d15d2d18439fb091e828ea167b58`.
- Implementation commits: `7c0ee614041f5e83b1084b3dbe3d5737a09fad12` (rail), `2efae057c32c15e1c225741bf27d5b1011259edf` (HUD/reference), `7e820641ff56d15d2d18439fb091e828ea167b58` (tests/capture).
- Godot `4.7.2.stable.official.ed1daf0bf`, GdUnit4 6.2.1, Stagehand 0.4.1; vendored tooling unchanged.
- `KIEM_TRA_GAME.cmd` exit **0**. Full output: `qa/output/production-full3.log`.
- Candidate identity: `artifacts/godot-tools/verified-head.txt`.
- This record/checkpoint commit is documentation only and does not replace the tested implementation SHA.

```powershell
Set-Location 'E:\0. 1. tu tien nhan roi\tutiennhandoi-clean'
$env:GODOT_BIN = 'E:\Godot_v4.7.2-stable_win64_console.exe'
.\KIEM_TRA_GAME.cmd
```

## Gates

| Gate | Actual result |
|---|---|
| Resource import / project-context parse | PASS |
| GdUnit | 66/66; 15/15 suites; zero failures/errors/skips/orphans |
| Canonical bridge | PASS; existing eight Dao projection/authority checks retained |
| Isolated P2 fixtures | PASS; canonical Artifact full loadout and real Boss fight added |
| Bounded Godot runtime | PASS |
| Stagehand Home runtime | 50/50 PASS |
| Stagehand Combat runtime | 27/27 PASS |
| Home candidate capture | 9/9 PASS |
| Canonical Combat / four viewport capture | 35/35 PASS |

New GdUnit coverage checks geometry at all four portrait sizes (battlefield >=55%, five Active positions in one row and within viewport, utility row/gauge visible), Tactical Lane priority/duration, exported cooldown rendering, read-only slots, Auto selection and player-only resource updates. Existing HP/poll preservation, battle.end result gating, encounter cursor isolation, replay deduplication and Dao projection regressions still pass.

The real-window capture uses standard Tab/Space navigation through the actual Challenge and Back Buttons. Synthetic mouse clicks were unreliable in this Windows windowed session; no button signal or battle result is invoked directly. The separate 27-step headless Combat scenario retains real mouse-click navigation checks.

## Presentation delivered

- Thin 44px Back/header, compact Boss identity/level/BOSS/HP/Break; no fabricated status icons.
- Battlefield dominates the portrait composition; upper-right enemy, lower-left player, one centered Tactical Lane.
- Player HP and smaller cyan CN; Ultimate numeric gauge appears once in its rail position.
- Tactical priority: exported Boss telegraph > counter/interrupt > Break > Dao payoff > normal cast. Cast progress uses exported castTime only.
- Compact Ngự Khí: three source orb positions, canonical source count, Khí Cảm stack/cap and exported active flags. No all-eight-Dao redesign.
- Five fixed read-only Active slots, Basic left, Auto center, Ultimate right. Ultimate icon is 54px versus 44px (22.7% larger). Thin gold Auto selection, replaceable temporary sigils, honest empty slots.
- DTO icon path, cooldown/blocked/cast/channel state pathways are rendered without local gameplay clocks or availability formulas.

## Actual reference and limits

QA F9 prepares an isolated canonical Artifact reference: real realm transition APIs to order 102, canonical specialization/learning/loadout/Auto APIs, seven canonical skills, then the ordinary `fightEndlessFloor` action. No HP/stat/resource/gauge/outcome is fabricated, no CLOSED Dao tuning is changed, and no gameplay result is forced to win.

The inspected playback shows a real dangerous Boss cast/progress, changing Boss HP, Khí Linh 1→2, gold Auto selection and Ultimate 6/100. The passive cap is the actual canonical 22 in this reference, not a copied mockup cap of 20.

Current transport does not export complete live cooldown/readiness/cast/channel snapshots, an Artifact Merge-ready flag, or a CN consumption timeline. The production adapter still supplies neutral cooldown 0 / idle / AUTO defaults. State rendering is covered by contract tests; the real capture does not prove a live 4.3s countdown or Merge-ready badge. CN shows the canonical snapshot value until exported live values exist. The UI does not reconstruct these from costs, authored cooldowns, source-count thresholds or combat formulas. Actor art/VFX/animation remain placeholders as scoped.

Canonical JS gameplay, balance, all eight CLOSED Dao runtimes, rewards and save schema were untouched. QA fixtures use isolated saves. The ordinary Godot save hash remained `7893E5CB59864CEC72CA5C9E5BBF712F8D161B9A5F9BB67F72D986BBC06826A7`.

## Exact artifacts

Base: `E:\0. 1. tu tien nhan roi\tutiennhandoi-clean\artifacts\godot-tools\stagehand-combat-visual\screenshots\`

- `combat-prefight-390x844.png`
- `combat-playback-390x844.png`
- `combat-prefight-360x800.png`
- `combat-prefight-412x915.png`
- `combat-prefight-430x932.png`

All five captures were inspected for HUD/rail visibility and clipping. JSON/JUnit/RPC evidence resides in the corresponding `stagehand-combat-visual`, `stagehand-runtime/home`, `stagehand-runtime/combat` and `stagehand-visual` folders. GdUnit report: `godot/reports/report_39/`.

## Changed-file inventory

New production files under `godot/scripts/combat/`: `combat_style.gd`, `combat_skill_slot.gd`, `combat_boss_hud.gd`, `combat_player_hud.gd`, `combat_tactical_lane.gd`.

Modified production files: `godot/scripts/combat/combat_screen.gd`, `combat_skill_rail.gd`, `combat_dao_widget.gd`; `godot/scripts/models/combat_view_model.gd`; `godot/scripts/main/main.gd`; `godot/backend/bridge_server.mjs` (QA-only reference path).

Modified verification files: `godot/backend/bridge_p2_fixture_smoke.mjs`, `godot/tests/unit/combat_view_model_test.gd`, `godot/tests/stagehand/combat_visual_capture.json`.

Documentation: this new proof record, `CURRENT_CHECKPOINT.md`, `docs/systems/combat-ui/MODULE.md`.
