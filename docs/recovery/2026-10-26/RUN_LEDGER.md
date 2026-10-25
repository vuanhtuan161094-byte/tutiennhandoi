# Run ledger — 2026-10-26

## Safety / checkout

- Starting main / tested base: `27545bcf5e24be495bb908658e7070c710f64cef`.
- Isolated checkout: clone under the Codex workspace on C; review branch `codex/tnd-recovery-r2-r5-20261026`.
- E: read-only. The clone was populated from GitHub/main and selected local candidate inputs; no launcher update/reset was run on E. Two existing Godot windows on E and its Node backend were left running.
- Candidate inputs remain untracked: 45 files / 51,293,254 bytes. No candidate art/video/source clip was staged.
- QA saves are synthetic, disposable files under the C clone’s `artifacts` directory. No user save was opened or edited.

## R2 asset checks

| Gate | Result | Evidence |
|---|---|---|
| Compare preserved file size + SHA-256 against prior inventory | PASS, 45/45 | No missing/mismatched rows; 51,293,254 total bytes |
| Candidate metadata/atlas/TRES validator | PASS, 11/11 clips | 405 SpriteFrames; atlas hashes, grid sizes, frame bounds and animation counts agree |
| Godot 4.7.2 actual resource load | PASS, 11/11 clips | All `.tres` resources loaded; atlas dimensions match declaration; visible and transparent pixels present; 0 failures |
| Rights and original source availability | UNKNOWN | Not represented as verified. Binary upload withheld. |

The Godot process printed a Windows root-certificate-store diagnostic, but returned exit 0 and completed all resource assertions. It does not change the image-loader assertions.

## R3 isolated QA

- Existing QA fixture API is available only when both `TUTIEN_GODOT_BRIDGE_DIAGNOSTIC=1` and `TUTIEN_GODOT_QA=1` are set.
- Added fixture `endgame-boss`: fresh disposable player, canonical Artifact setup, canonical realm transitions through order 114, then canonical first map floor `21601` in major realm 28.
- The QA fixture calls canonical `selectEndlessFloor`; the fight uses canonical `fightEndlessFloor` / CombatKernel V3. No combat result or resource is injected.
- P2 fixture smoke PASS on isolated cổng 41946 in the final gate: realm 114, floor 21601, Boss DTO, full `battle.end`, playback result/duration and post-battle high-realm/Hunt marker verified.
- Godot Stagehand PASS: 18/18 actions; Home, Character, endgame prefight/playback captured at 390×844. Screenshot export is runtime proof of route/rendering; realm/fight authority is asserted by bridge smoke.

## R4/R5 UI and tests

- Final full local gate PASS on isolated bridge ports 41945/41946: import/parse, GdUnit 92/92 across 20 suites, canonical bridge smoke, P2 endgame smoke, bounded Godot smoke, Home runtime 50/50, Home visual capture 9/9, Combat visual capture 20/20, endgame capture 18/18, and screenshot pixel validation.
- Canonical Combat visual scenario PASS: 20/20 Stagehand checks; screenshot pixels both 390×844.
- Moved tactical event lane into the right-lower battlefield at anchors `(0.52, 0.585, 0.97, 0.665)`. This keeps event/cast text away from the left player-art silhouette and above the lower HUD.
- Extended four-portrait viewport layout test to assert no lane/player-actor bounds intersection and no lane/lower-HUD intersection.
- GdUnit candidate gate: 92/92 tests / 20 suites PASS in the final full run.
- Home presentation preset selection no longer frees its emitting Button synchronously; it defers the list refresh. Final Home smoke passed 50/50 and the run log had no `Object locked` or `SCRIPT ERROR`.
- Candidate visual status remains NOT APPROVED. No aura, art direction, boss identity mapping or combat semantics were changed.

## Incident disclosure / test isolation

Before discovering that E’s local Node process owns port 4192, one Stagehand attempt launched the C client with its default port and reached that E service. Read-only `/health` confirmed `diagnosticMode=false`, `qaMode=false`; the QA fixture action was rejected and no state/save write was accepted. A later gate attempt on port 41930 reached stale test bridge state and was discarded. Final tests used fresh isolated ports 41945 (Godot/Stagehand) and 41946 (P2 bridge smoke); no QA result from a stale port is counted.
