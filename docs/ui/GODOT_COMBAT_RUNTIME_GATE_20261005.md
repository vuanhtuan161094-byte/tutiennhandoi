# Godot Combat Windows runtime proof — 2026-10-05

GCombat-0/C0B and GCombat-1 playable skeleton: **GODOT RUNTIME GATE: PASS**.

Visual: **VISUAL CANDIDATE — NOT APPROVED**. This is not Combat UI closure or approval of later C1–C9 work.

## Exact candidate and command

- Live opening `main`: `406af6e06972510be148135b9d1a2bb1f6601e53` (fast-forwarded from local `43f10efd1406ecde843808a4d8a8e5cc092097ba`).
- Verified implementation SHA: `6d0a3a5d460f1e957d5a893ec69b07e5469d39c6`.
- Windows Godot: `4.7.2.stable.official.ed1daf0bf`, pinned GdUnit4 6.2.1 and Stagehand 0.4.1.
- Canonical command: `KIEM_TRA_GAME.cmd`; automated invocation redirected stdin from NUL for its final pause. Exit code: **0**.
- Full output: `qa/output/godot-gate-candidate3.log`.
- Gate writes the tested HEAD to `artifacts/godot-tools/verified-head.txt`; later metadata commits do not replace the implementation proof above.

PowerShell reproduction from this checkout:

```powershell
Set-Location 'E:\0. 1. tu tien nhan roi\tutiennhandoi-clean'
$env:GODOT_BIN = 'E:\Godot_v4.7.2-stable_win64_console.exe'
.\KIEM_TRA_GAME.cmd
```

## Actual results

| Gate | Result |
|---|---|
| Resource import + project-context parse | PASS |
| GdUnit4 | 63/63, 15/15 suites; zero failures/errors/orphans |
| Canonical bridge smoke | PASS; real V140 ascension, canonical Boss fight, progression-only/no direct loot, cursor idempotence, save/restart |
| Isolated P2 fixture smoke | PASS; retired equipment Set engraving rejected |
| Bounded Godot smoke | PASS |
| Stagehand Home | 50/50 PASS |
| Stagehand Combat | 27/27 PASS |
| Home candidate capture | 9/9 PASS |
| Actual canonical Combat candidate capture | 20/20 PASS |

Combat structural proof starts from an isolated Phàm Nhân save, confirms the realm lock, prepares QA ascension readiness, invokes real `ascendRealmV140`, opens Combat at Luyện Khí, obtains the canonical DTO, invokes `fightEndlessFloor`, observes event-driven Tactical Lane changes, returns Home, confirms polling stopped, reenters Combat and refreshes its cursor/snapshot, then opens Character and returns Home. QA preparation is not an injected Combat result.

GdUnit regressions additionally cover poll-preserved event HP/result, canonical `battle.end` gating, event deduplication/reset, and independent encounter cursors. Bridge smoke checks all eight Dao projections against the locked runtime factory without mutating callers, including Body's single counterForce meter, Artifact's initial level 1, target ownership and Spell readiness/form forwarding. These are projection checks, not eight full visual approvals or a new full-game backend audit.

## Real failures corrected

1. Windows PowerShell inherited Core module paths and could not resolve `Get-FileHash`. Launcher now prefers native Windows PowerShell modules.
2. P2 QA fixtures attempted retired Ngũ Hành equipment Set grants/engraving. Fixtures now use ordinary canonical equipment and assert retirement rejection.
3. Godot verification used the ordinary persisted player save. All Godot gate processes now use disposable saves and restore inherited environment settings, making Home's realm gate deterministic and keeping QA ascension away from the player save. Ordinary save hash matched its pre-test backup after verification.
4. Repeated playback snapshots reset event-driven HP/resources and hid the finished result. Same-encounter polls now preserve playback UI; leaving the route resets presentation for fresh reentry. Result display requires canonical `battle.end`.
5. Encounter IDs/cursors could carry across transactions. IDs include the transaction serial; the bridge cursor resets per encounter and in-flight Combat polling is cancelled on route exit.
6. Initial Dao projections defaulted to zero when no initial state was exported; numeric Hunt transport dropped Dao flags/form/caps. The adapter now projects a cloned canonical factory state and forwards actual V3 resource projection events, including nonnumeric fields. Skills show read-only AUTO rather than claiming universal readiness.
7. New Stagehand reentry assertions raced asynchronous input processing. The scenario now waits for both route transitions before checking polling and subsequent navigation.

No `dist/`, gameplay core, balance data, locked Dao closure record, or approved visual baseline changed. Godot does not decide damage, outcome, rewards, cooldowns or resource mutations. CN/cooldown live detail beyond available exports remains subsequent presentation work; the skeleton does not reconstruct those authorities.

## Artifacts and visual review

- `artifacts/godot-tools/parse-check.log`
- `artifacts/godot-tools/stagehand-runtime/home/{report.json,junit.xml,rpc-trace.json,godot.log}`
- `artifacts/godot-tools/stagehand-runtime/combat/{report.json,junit.xml,rpc-trace.json,godot.log}`
- `artifacts/godot-tools/stagehand-visual/screenshots/home-390x844.png`
- `artifacts/godot-tools/stagehand-combat-visual/screenshots/combat-prefight-390x844.png`
- `artifacts/godot-tools/stagehand-combat-visual/screenshots/combat-playback-390x844.png`
- GdUnit XML/HTML: numbered reports under `godot/reports/`.

Both actual Combat screenshots were inspected at 390×844: header, enemy HUD, upper enemy/lower player battlefield, Tactical Lane, player HUD, Dao panel, skill rail and action/status band fit the viewport. Actors remain skeleton placeholders; no production art/VFX/animation was added. No baseline was approved or refreshed. Runtime blockers: none; visual approval remains with the user.

## Changed files

- `KIEM_TRA_GAME.cmd`
- `tools/godot/Verify-GodotLocal.ps1`
- `godot/backend/bridge_server.mjs`
- `godot/backend/bridge_p2_fixture_smoke.mjs`
- `godot/backend/bridge_smoke.mjs`
- `godot/backend/combat_presentation.mjs`
- `godot/scripts/core/backend_bridge.gd`
- `godot/scripts/combat/combat_screen.gd`
- `godot/scripts/combat/combat_dao_widget.gd`
- `godot/tests/unit/combat_view_model_test.gd`
- `godot/tests/stagehand/home_runtime_smoke.json`
- `godot/tests/stagehand/combat_runtime_smoke.json`
- `godot/tests/stagehand/combat_visual_capture.json`
- `CURRENT_CHECKPOINT.md`
- `docs/systems/combat-ui/MODULE.md`
- this runtime proof record.
