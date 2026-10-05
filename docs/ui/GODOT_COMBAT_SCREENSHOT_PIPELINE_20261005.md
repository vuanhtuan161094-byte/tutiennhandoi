# Combat screenshot pipeline evidence — 2026-10-05

**COMBAT SCREENSHOT PIPELINE: PASS**

GCombat-2 and GCombat-3: **RUNTIME PASS — VISUAL CANDIDATE**. GCombat-4 **NOT STARTED**. No visual approval, CLOSED/LOCKED claim or baseline promotion.

## Identity and cause

Opening main: `967ef1500e9fd788894fbab2310f1d4ccb59652d`. Clean tested implementation: `75f737adee63f400e8b1df7f856b6543f11755ce`; later documentation commits do not replace this exact-SHA proof.

The archived 15:37–15:38 Windows run reported 35/35 PASS but all five PNGs were entirely RGBA `(0,0,0,0)`. The two 390×844 files were only 1370 bytes with one sampled color and zero alpha. Transparent images appear black in some external viewers. These are allocated empty render images, not actual visible UI.

The proven pipeline defect was `_capture_ready_image`: it accepted any non-null, non-zero-size texture image after `process_frame`. It neither synchronized completed rendering nor inspected content. Encoding that allocated transparent image produced a valid PNG and a false PASS. The old report used the real Intel OpenGL windowed renderer, so headless mode was not the cause of that recorded run.

Rerunning the unchanged scenario produced valid PNGs, and minimizing a real window did not reproduce the empty readback. Old logs do not establish the precise GPU/window timing trigger; do not claim proof that the scene was hidden, minimized, a wrong SubViewport, or a particular driver fault. The dimension-only false acceptance is confirmed by real archived files and source. Copies/negative validation: `qa/output/blank-capture-evidence/`; unchanged rerun: `qa/output/capture-before-fix/`.

## Fix and scope

- Project patch to pinned Stagehand `core/screenshot_capture.gd`: reject headless/disabled rendering, await two process frames for layout, force a synchronous real root-window draw before GPU readback, and inspect alpha-weighted brightness/variation. Retry at most the configured frame budget; fail with pixel metrics if no valid content appears. No unbounded render-signal wait or long stabilization sleep.
- `tools/godot/Test-VisualScreenshot.ps1`: decode the actual exported PNG, enforce 390×844, sample every fourth pixel, reject transparent/black/uniform frames, and write `pixel-validation.json`. The mandatory gate calls this after Stagehand; a PNG existence check is insufficient.
- Conservative content thresholds: at least eight sampled colors, brightness range >5.1/255, and >25.5/255 brightness in at least 0.2% of samples. Alpha multiplies brightness, so RGB hidden under alpha zero cannot pass. Corrupt/empty PNGs fail decoding. These checks are not visual design approval.
- Two in-memory negative unit tests cover empty, black, transparent (including hidden nonzero RGB), and flat frames. No synthetic PNG is exported as runtime evidence. Archived real blank PNGs and wrong-dimension requests were rejected; real runtime PNGs were accepted.
- Combat visual scenario exports only prefight/playback 390×844, waits for scene visibility, changed canonical Boss HP and no early result overlay. Existing four-size layout assertions remain. Auxiliary screenshots are milestone/major-layout diagnostics only; 412×915 is not mandatory.
- An unrelated existing structural race was exposed by the full gate: the Luyện Khí fixture has no selected Main Dao, so the canonical meter list is empty and the widget intentionally hides. The scenario formerly demanded visibility, sometimes passing before DTO bind. It now waits for the unselected projection and asserts that fake meters are not shown. No gameplay or presentation source was changed to satisfy it.

Source/test files changed: `godot/addons/stagehand/core/screenshot_capture.gd`, `godot/tests/unit/screenshot_content_test.gd`, `godot/tests/stagehand/combat_visual_capture.json`, `godot/tests/stagehand/combat_runtime_smoke.json`, `tools/godot/Test-VisualScreenshot.ps1`, `tools/godot/Verify-GodotLocal.ps1`. Checkpoint/module and this record are metadata. CLI toolchain versions/checksums are unchanged; the addon helper patch is project-local.

## Actual verification

- Targeted real Combat capture: 20/20 PASS before additional scene/HP/result assertions; final full-gate capture 23/23 PASS.
- Negative pixel validation: archived transparent files FAIL as required; wrong dimensions FAIL as required.
- GdUnit screenshot validator: 2/2 PASS; full GdUnit 68/68, zero suite errors/failures/skips/orphans.
- Canonical bridge/P2 and bounded Godot runtime PASS.
- Stagehand Home 50/50; Combat 28/28; Home candidate 9/9; Combat candidate 23/23 PASS.
- `KIEM_TRA_GAME.cmd`: **exit 0**, full output `qa/output/capture-full-gate2.log`. The first run failed on the structural race described above and was corrected, not ignored.

| Export | Dimensions | Bytes | Sampled opaque pixels | Sampled colors | Brightness range | Result |
|---|---|---:|---:|---:|---:|---|
| prefight | 390×844 | 29377 | 20678/20678 | 343 | 203/255 | PASS |
| playback | 390×844 | 30080 | 20678/20678 | 330 | 203/255 | PASS |

Both final files were opened and inspected: header/Boss HP/Break, actors, Player HUD, Ngự Khí, five Active slots and Basic/Auto/Ultimate are visible. Playback shows a real Boss cast/progress, changed Boss HP, Khí Linh 2/3, Auto highlight and Ultimate 6/100, without an early result overlay.

Exact files:

`E:\0. 1. tu tien nhan roi\tutiennhandoi-clean\artifacts\godot-tools\stagehand-combat-visual\screenshots\combat-prefight-390x844.png`

`E:\0. 1. tu tien nhan roi\tutiennhandoi-clean\artifacts\godot-tools\stagehand-combat-visual\screenshots\combat-playback-390x844.png`

Pixel report: `artifacts/godot-tools/stagehand-combat-visual/pixel-validation.json`. Tested HEAD: `artifacts/godot-tools/verified-head.txt`.

Gameplay authority modified: **NO**. Combat scene/routing, CombatKernel, damage/AI/cooldown/selection/resource authority, all eight Dao, tuning/rewards/save schema and art/VFX were untouched. Ordinary save hash remains `7893E5CB59864CEC72CA5C9E5BBF712F8D161B9A5F9BB67F72D986BBC06826A7`.

Reproduce on Windows:

```powershell
Set-Location 'E:\0. 1. tu tien nhan roi\tutiennhandoi-clean'
$env:GODOT_BIN = 'E:\Godot_v4.7.2-stable_win64_console.exe'
.\KIEM_TRA_GAME.cmd
```
