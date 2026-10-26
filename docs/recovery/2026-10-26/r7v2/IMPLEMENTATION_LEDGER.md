# Implementation ledger

## Remote code milestones

| Remote main SHA | Tree SHA | Change | Evidence |
|---|---|---|---|
| `4f6712726c5f20de766df6999447cbd9c9b71618` | `a519d3147f7e99cbbffa1c91b5ae27fcc9375f87` | Original Boss candidate/hit feedback (initial Wood Guardian candidate). | Full gate on equivalent local tree; not owner-approved. |
| `6c581878e839a707d1943db4868d0b85a57375db` | `a66073079390ca7486e47297ff965579d2d61b32` | Fix prefight Boss preview to match the next canonical encounter; add contract guard. | Node contract 7/7; fight hash stayed `7865a49ac6db07f1855541a3b0998f6f7fbef37cf0665e812a4e502fc2ed4880`. |
| `0f3e0d12f45249afc8388196f6b2d7e5dde0414b` | `8bfb92459a03bdb710c7791f6599b3087c9e67f9` | Add original U Minh Xà PNG; map exact `serpent` only; mark Wood Guardian unmapped. | Full verifier on local source `4288063181586441947519305f5b3818d60469ba`; exact tree match. |
| `3df9eba5a0966b73c3b20c53c90fa2e39488410e` | `e93f07371c3f2c8f64677d9f7614213380564cbe` | Add 10 original, opt-in Ngự Khí skill-symbol SVG candidates, exact-ID HUD resolver, focused test, and updated evidence/report. | Full verifier 94/94 plus candidate-flag-on Stagehand capture 20/20 and pixel validation; candidate remains unapproved. |
| `7d4ed24971c08fddd67575da316a3450adcc6bf1` | `7e23fdd9bbb0741aa62cbceb5cb5f8a8047e0f6f` | Add original Vô Diện Yêu art for the exact `demon` archetype; move result display clear of actor silhouettes; retain an endgame visual capture scenario. | Full verifier 94/94; endgame Stagehand 21/21; three-frame pixel validation; no gameplay/save changes. |
| `69a49c6b8add53f8e363717e312656c4ae07bf59` | `fce587e869992575a957f9608a9dab6e2fa9faaf` | Add event-timed player target telegraph and severity lane for canonical Boss danger casts. | Focused GdUnit 15/15; actual 390×844 Stagehand 15/15; pixel validation 3/3; full verifier blocked by roaming editor-settings write permission. |

## Ngự Khí icon candidate slice

- Added 10 original SVG skill symbols and an SHA-256/size manifest under `godot/art/candidate_r7v2/ngukhi_icons/`; exact skill IDs are mapped only while `TUTIEN_R7V2_NGUKHI_ICON_CANDIDATE=1` is set.
- `godot/scripts/combat/combat_skill_slot.gd` selects these icons for exact artifact skill IDs; fallback and approved art paths remain unchanged when the flag is off. `godot/tests/unit/combat_skill_candidate_icons_test.gd` checks gating, mapping, and non-Ngụ Khí fallback.
- Runtime evidence: actual 390×844 prefight/playback capture with both Boss and icon candidate flags enabled; Stagehand 20/20 and screenshot pixel validation PASS. Local-only images contain existing player art with unknown redistribution rights.
- Full isolated verifier passed with candidate flag off: GdUnit 94/94, canonical bridge/P2 fixture/bounded smoke, Home 50/50, Combat 28/28, Home capture 9/9, Combat capture 20/20, screenshot pixel gate PASS. No coefficients, canonical outcomes/rewards, save schema, or authority changed.

## Vô Diện Boss and result UI candidate slice

- Generated original `vo_dien_yeu_boss.png`, 1060×1484 RGBA, 2,547,816 bytes, SHA-256 `5D4DD1DB4BD563393EB6B51AB1AB9ADB71F4FFF53F102671E242A702957ACF13`; adjacent `SHA256SUMS.csv` records the bytes and digest. It maps only to archetype `demon`, opt-in through `TUTIEN_R7V2_BOSS_ART_CANDIDATE=1`.
- Added `godot/tests/stagehand/r7v2_endgame_boss_visual_capture.json` to reproduce the isolated canonical endgame route. Actual Godot 4.7.2 run passed 21/21 steps from Home through Challenge, playback, result, and return. The observed result is a canonical loss; no victory was forced.
- Moved `CombatResult` to a framed lower-right panel. The four-portrait-viewport GdUnit test now asserts that the result panel stays within the viewport and intersects neither actor.
- Full verifier on the final implementation: PASS, GdUnit 94/94; Home 50/50; Combat 28/28; captures 9/9 and 20/20; screenshot pixel validation PASS. Separate endgame screenshots also pass pixel validation. All uses disposable isolated QA files; no real save, combat coefficients, rewards, or authority changed.
- Runtime screenshots are local-only because they show existing player art whose distribution rights are unresolved. Paths/hashes are in `RUNTIME_VISUAL_EVIDENCE_INDEX.md`.
- Remote verification: commit `7d4ed24971c08fddd67575da316a3450adcc6bf1` is present on `main`; the documentation follow-up is based on that head.

All three remote changes used current-head checks and expected-SHA fast-forward ref updates with `force=false`.

## Boss danger telegraph — source commit `69a49c6b8add53f8e363717e312656c4ae07bf59`

- `godot/scripts/combat/combat_threat_telegraph.gd` draws a severity-colored marker at the player actor and expires it using the adjusted `castTime` carried by the canonical Boss cast event.
- `godot/scripts/combat/combat_player_actor.gd` owns the marker; `godot/scripts/combat/combat_screen.gd` invokes it only for an enemy cast with `bossTelegraph=true` targeting the player and clears it at battle start/end. `godot/scripts/combat/combat_tactical_lane.gd` shows the provided danger label and cast progress.
- `godot/tests/unit/combat_view_model_test.gd` covers lethal metadata, progress/expiry, and ordinary enemy casts. `godot/tests/stagehand/r7v2_boss_telegraph_capture.json` reproduces a disposable canonical Boss fight and captures active, cleared, and result states.
- Evidence: focused GdUnit 15/15; Node canonical event projection assertion passed; direct Godot parse checks passed for all five changed GDScript/test files; bounded headless smoke passed; official Godot 4.7.2 Stagehand 15/15; screenshot pixel validation 3/3. The broader `Verify-GodotLocal.ps1 -SkipVisual` run was blocked after import because Godot could not write `C:\Users\Admin\AppData\Roaming\Godot\editor_settings-4.7.tres`; it is not a PASS for this SHA.
- Changed paths are limited to the three combat presentation scripts, the new telegraph script, the focused unit test, and the Stagehand scenario above. No backend gameplay, combat coefficients, authority, reward settlement, save schema, or production art changed.

## Changed paths across code slice

- `dist/core/session.js`: read-only preview uses upcoming Boss seed.
- `qa/fixtures/combat-visual-metadata-baseline.json`, `qa/tests/combat-visual-metadata-contract-test.js`: baseline result hash and preview identity contract.
- `godot/art/candidate_r7v2/um_minh_xa/{README.md,um_minh_xa_boss.png}`: original candidate/provenance.
- `godot/art/candidate_r7v2/wood_guardian/README.md`: unmapped status.
- `godot/scripts/combat/combat_actor_placeholder.gd`, `godot/tests/unit/combat_view_model_test.gd`: archetype gate and test.
- `godot/art/candidate_r7v2/ngukhi_icons/*.svg`, `SHA256SUMS.csv`, `README.md`: original opt-in Ngự Khí skill-symbol candidates and manifest.
- `godot/scripts/combat/combat_skill_slot.gd`, `godot/tests/unit/combat_skill_candidate_icons_test.gd`: exact-ID candidate selection and candidate contract test.
- `godot/art/candidate_r7v2/vo_dien_yeu/{README.md,SHA256SUMS.csv,vo_dien_yeu_boss.png}`: original generated Boss candidate and manifest.
- `godot/scripts/combat/combat_actor_placeholder.gd`, `godot/scripts/combat/combat_screen.gd`, `godot/tests/unit/combat_view_model_test.gd`: exact demon mapping and safe result panel layout assertions.
- `godot/tests/stagehand/r7v2_endgame_boss_visual_capture.json`: disposable endgame visual capture path.

No combat coefficients, canonical outcomes/rewards, save schema, or offline settlement were changed in follow-up commits. The initial P1 commit was also limited to presentation and its test. Rollback: disable `TUTIEN_R7V2_BOSS_ART_CANDIDATE`; a later rollback should be a normal forward revert, never a force push.
