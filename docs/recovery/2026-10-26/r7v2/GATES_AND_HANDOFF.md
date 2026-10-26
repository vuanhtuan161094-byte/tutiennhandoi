# Gates and handoff

## Source / remote identity

- Published and verified on remote `main`: Boss/UI candidate commit `7d4ed24971c08fddd67575da316a3450adcc6bf1`, parent `bbf2565fec54aa841292c194390f6a748e90e0b1`, tree `7e23fdd9bbb0741aa62cbceb5cb5f8a8047e0f6f`. The source was tested in an isolated checkout based on `4288063181586441947519305f5b3818d60469ba` plus the allowlisted changes; only the reviewed seven-path diff was published.
- Verified code baseline: local source commit `4288063181586441947519305f5b3818d60469ba`, tree `8bfb92459a03bdb710c7791f6599b3087c9e67f9`; this tree exactly matched remote code commit `0f3e0d12f45249afc8388196f6b2d7e5dde0414b` before the icon candidate changes.
- Latest full verifier ran in isolated QA checkout `C:\Users\Admin\Documents\Codex\TND_R7V2_QA_BOSS_PREVIEW_20261026` with local candidate source changes and disposable bridge saves; no real save was used. Candidate icon test toggles its opt-in flag itself; full verifier ran with the global icon candidate flag off.
- Engine: Godot `4.7.2-stable (official)`; candidate art flag enabled only in isolated disposable QA.

## Results

| Gate | Result |
|---|---|
| Import/parse | PASS; new RGBA candidate imported in isolated checkout. |
| GdUnit | 94/94 PASS, including exact archetype binding, Ngự Khí icon candidate gating, and result panel safe-area assertions at four portrait viewports. |
| Canonical bridge smoke | PASS. |
| P2 endgame Boss fixture smoke | PASS; realm 114/floor 21601, canonical encounter, result/aftermath asserted. |
| Bounded smoke | PASS. |
| Stagehand Home runtime | 50/50 PASS. |
| Stagehand Combat runtime | 28/28 PASS. |
| Home visual capture | 9/9 PASS. |
| Combat visual capture | 20/20 PASS. |
| 390×844 screenshot pixel validation | PASS for prefight and playback. |
| Candidate icon Stagehand capture | PASS, 20/20 steps with Boss and icon flags enabled in the isolated QA checkout. |
| Candidate icon screenshot pixel validation | PASS for both 390×844 frames; images retained local-only because existing player art rights are not verified. |
| Endgame visual route | Stagehand 21/21 PASS from Home through canonical fixture, Challenge, playback, result, and return. Observed canonical outcome: defeat. |
| Endgame screenshot pixel validation | PASS for prefight, playback, and completed 390×844 result frames; screenshots remain local-only because player art distribution rights are unresolved. |
| Boss identity / mapping | U Minh Xà maps only to `serpent`; Vô Diện Yêu maps only to `demon`, both behind `TUTIEN_R7V2_BOSS_ART_CANDIDATE=1`. |
| Result readability | PASS for the four tested portrait sizes: result panel remains on-screen and does not overlap either actor silhouette. Runtime screenshot confirms the 390×844 case. |
| Actual-fight hash | Preserved: `7865a49ac6db07f1855541a3b0998f6f7fbef37cf0665e812a4e502fc2ed4880`. |

Pass means only these technical scenarios passed. The full verifier used the candidate icon flag off; a separate Stagehand capture enabled both candidate flags and passed. It does not prove owner art approval, Android, every Dao, all outcomes, or complete/fun full-game loop.

## Publishing and protection

Earlier code milestones were applied as GitHub fast-forwards after refetching current `main`. This code/art commit changed only the new generated Boss candidate/metadata, Boss archetype mapping, result-panel presentation, focused tests, and R7 V2 capture scenario. The exact expected-head update used `force=false`; remote `main` was fetched afterward and matched `7d4ed24971c08fddd67575da316a3450adcc6bf1`. No real saves, WIP packs, videos, or production assets were included. The documentation follow-up is a separate fast-forward based on that commit.

## Reproduce the isolated endgame visual route

From the repository root in PowerShell, with the pinned Stagehand and Godot tools available:

```powershell
$out = Join-Path (Get-Location) ('artifacts\r7v2-endgame-boss-' + [guid]::NewGuid().ToString('N'))
$godot = if ([string]::IsNullOrWhiteSpace($env:GODOT_BIN)) { 'godot' } else { $env:GODOT_BIN }
New-Item -ItemType Directory -Force -Path $out | Out-Null
$env:TUTIEN_GODOT_QA = '1'
$env:TUTIEN_GODOT_BRIDGE_DIAGNOSTIC = '1'
$env:TUTIEN_GODOT_BRIDGE_SAVE = Join-Path $out 'endgame-disposable-save.json'
$env:TUTIEN_R7V2_BOSS_ART_CANDIDATE = '1'
$env:TUTIEN_R7V2_NGUKHI_ICON_CANDIDATE = '1'
& '.tools\godot\stagehand\godot-stagehand.exe' run 'godot\tests\stagehand\r7v2_endgame_boss_visual_capture.json' --out-dir $out --godot-bin $godot
```

The save path is disposable and stays under `artifacts`; do not point it at a real profile. The captured loss is the observed canonical outcome, not an injected result.

## Latest source gate — Boss danger telegraph

**Candidate source SHA:** `69a49c6b8add53f8e363717e312656c4ae07bf59` · **tree:** `fce587e869992575a957f9608a9dab6e2fa9faaf`.

| Gate | Result | Scope / note |
|---|---|---|
| Godot import | PASS | Official Godot 4.7.2 import in isolated checkout. |
| Direct GDScript parse checks | PASS | All five changed GDScript/test scripts parsed. |
| Focused GdUnit | PASS, 15/15 | Combat view-model and Boss telegraph behavior. Test run exited 0; Godot then emitted a sandbox logging warning because it could not open `user://logs/godot.log`. |
| Canonical event projection assertion | PASS | Boss danger metadata and adjusted cast time reached the presentation event. |
| Bounded headless runtime smoke | PASS | External bridge mode; no real save used. |
| Actual headed Stagehand runtime | PASS, 15/15 | 390×844 disposable realm-114 Boss route; marker appears and expires at cast completion, then result appears. |
| Screenshot pixel validation | PASS, 3/3 | Active, cleared, and result PNGs; hashes and local paths in [runtime evidence](RUNTIME_VISUAL_EVIDENCE_INDEX.md). |
| `Verify-GodotLocal.ps1 -SkipVisual` | BLOCKED | Import completed. Editor parse could not write `C:\Users\Admin\AppData\Roaming\Godot\editor_settings-4.7.tres` under the current sandbox, so the broader verifier did not complete and is not a PASS for this SHA. |

The runtime log had no `SCRIPT ERROR`; it retained the CA-store warning and the existing `main.tscn` invalid-UID text-path fallback. The screenshots contain existing player art with unclear redistribution rights, so they stay local. This slice changes presentation only: no gameplay authority, coefficients, rewards, or save schema.

## Handoff

R7 V2 remains active. Continue with R2-ASSET, then R3-ENDGAME and R4-VISUAL. R5 has one verified Boss telegraph slice; the complete eight-Dao/Auto/combat-feedback work remains open. Warm Snow footage was sampled at 30:51–31:07 and AFK Journey at 15:15–15:18; the short samples do not prove attack-cycle or audio timing. Owner approval remains open for visual direction, baked-aura treatment, lawful use of WIP/11 clips, and Auto semantics if no authoritative control exists. Core Balance and auxiliary-system work remain inactive.
