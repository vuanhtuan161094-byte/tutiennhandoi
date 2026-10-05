# Godot Combat Visual Shell — 2026-10-05

Status: **RUNTIME PASS — VISUAL CANDIDATE; NOT APPROVED / CLOSED / LOCKED**.
GCombat-4: **NOT STARTED**. Gameplay authority modified: **NO**.

## Candidate identity

- Opening main: `04c6e5c1315c40b0990f0769823bc9e2f6782b6e` (fetched/pulled, clean).
- Clean implementation tested by `KIEM_TRA_GAME.cmd`: `22eb0a785d4f77d0c3b67573ff844c841a6e06e8`.
- Subsequent documentation commits do not replace that tested implementation identity.
- No visual baseline was approved or promoted.

## Presentation changes

- `combat_battlefield_shell.gd`: static native gradient, layered ridges, distant gate, fog, perspective ground formation and soft edge vignette. No imported assets, shaders, particles, timers or frame loop.
- `combat_actor_placeholder.gd`: replaceable robed player and larger generic beast silhouettes with cyan/jade/red edges and contact shadows. These are illustrative placeholders, not final character art or a claim to represent the canonical monster species.
- `combat_screen.gd`: composes those two surfaces into the existing dominant battlefield; actors remain lower-left / upper-right. Navigation, challenge, event dispatch, HP handling and result guards are unchanged.
- `combat_boss_hud.gd`, `combat_player_hud.gd`, `combat_style.gd`: compact transparent HUD strips, bronze dividers, hierarchy and thinner HP bars. Smaller Break/CN remain subordinate; no invented status icons or duplicate Ult gauge.
- `combat_tactical_lane.gd`: subdued prefight caption and compact priority-sensitive strip. Danger color/progress still comes from exported boss telegraph/cast duration; priority/lifetime logic is unchanged.
- `combat_skill_slot.gd`: consistent temporary engraved line glyphs, dark plates and selected gold underline. Exactly five Active slots plus Basic/AUTO/Ult; 44px ordinary / 54px Ult (22.7% larger). Raw cooldown/readiness/channel/cast and the sole numeric Ult gauge are unchanged.
- `combat_dao_widget.gd`: compact canonical orb count text. Khí Cảm and flags still use actual projection. No all-Dao widget work.

No bridge/VM/backend, AI, reward, tuning, persistence, GCombat-4, sound/music, animation or production VFX changed. The existing capture scenario/tooling was reused unchanged. No new screenshot framework or auxiliary Combat viewport PNG was added.

## Windows validation

Godot 4.7.2 stable, pinned GdUnit 6.2.1 / Stagehand 0.4.1.

| Check | Result |
| --- | --- |
| Targeted Combat GdUnit | 10/10, exit 0 |
| Project import / parse | PASS |
| Full GdUnit | 68/68, 16 suites, 0 errors/failures/skips/orphans |
| Four portrait geometry contracts | PASS within Combat unit suite |
| Canonical bridge / isolated P2 fixture / bounded runtime | PASS |
| Home structural | 50/50 |
| Combat structural | 28/28 |
| Home capture (existing mandatory gate) | 9/9 |
| Combat capture | 23/23 |
| Two exported Combat PNGs | 390×844, pixel validation PASS, inspected |
| `KIEM_TRA_GAME.cmd` | PASS, exit 0 on clean implementation SHA above |

The first full-gate attempt timed out waiting for Tactical to leave prefight after native Tab/Space activation. The unchanged full-gate rerun on the same clean SHA passed. This is recorded as an intermittent capture/input failure; its exact trigger is unproven. No timeout was increased, scenario changed or product workaround added. Failure report/log are retained in ignored `qa/output/shell-capture-first-gate-failure.json` / `shell-full-gate-first.log`; passing log is `qa/output/shell-full-gate.log`.

Ordinary save `godot/.runtime/godot-bridge-save.json` remained SHA256 `7893E5CB59864CEC72CA5C9E5BBF712F8D161B9A5F9BB67F72D986BBC06826A7`; test fixture saves are isolated.

## Actual runtime artifacts

Exactly two Combat PNGs from the full gate:

- `artifacts/godot-tools/stagehand-combat-visual/screenshots/combat-prefight-390x844.png` — 55,793 bytes, 639 sampled colors.
- `artifacts/godot-tools/stagehand-combat-visual/screenshots/combat-playback-390x844.png` — 56,103 bytes, 647 sampled colors.

Both are opaque/non-flat and have sampled brightness range 203; report: `artifacts/godot-tools/stagehand-combat-visual/pixel-validation.json`. Tested HEAD: `artifacts/godot-tools/verified-head.txt`.

Playback shows an actual dangerous cast, selected second active, canonical 2/3 sources and Ult 6/100. Prefight shows canonical 1/3 sources. Current transport does not export a complete live cooldown/channel/readiness/CN timeline; this shell does not fabricate those values. Actor identity and environment remain replaceable placeholders. These are runtime candidates for user visual review, not approved production assets.

Re-run from repo root on Windows:

```powershell
$env:GODOT_BIN='E:\Godot_v4.7.2-stable_win64_console.exe'
cmd /c 'KIEM_TRA_GAME.cmd < NUL'
```
