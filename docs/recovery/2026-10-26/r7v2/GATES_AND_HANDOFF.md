# Gates and handoff

## Source / remote identity

- Published and verified on `main`: commit `3df9eba5a0966b73c3b20c53c90fa2e39488410e`, parent `353c1c2863eeed47b0b5cd198a32e1b57a85aae0`, tree `e93f07371c3f2c8f64677d9f7614213380564cbe`.
- Verified code baseline: local source commit `4288063181586441947519305f5b3818d60469ba`, tree `8bfb92459a03bdb710c7791f6599b3087c9e67f9`; this tree exactly matched remote code commit `0f3e0d12f45249afc8388196f6b2d7e5dde0414b` before the icon candidate changes.
- Latest full verifier ran in isolated QA checkout `C:\Users\Admin\Documents\Codex\TND_R7V2_QA_BOSS_PREVIEW_20261026` with local candidate source changes and disposable bridge saves; no real save was used. Candidate icon test toggles its opt-in flag itself; full verifier ran with the global icon candidate flag off.
- Engine: Godot `4.7.2-stable (official)`; candidate art flag enabled only in isolated disposable QA.

## Results

| Gate | Result |
|---|---|
| Import/parse | PASS; new RGBA candidate imported in isolated checkout. |
| GdUnit | 94/94 PASS, including exact archetype binding and Ngự Khí icon candidate flag/mapping/fallback. |
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
| Boss identity / mapping | PASS; both frames show “Thủ Tầng · U Minh Xà”; only `serpent` maps to this art. |
| Actual-fight hash | Preserved: `7865a49ac6db07f1855541a3b0998f6f7fbef37cf0665e812a4e502fc2ed4880`. |

Pass means only these technical scenarios passed. The full verifier used the candidate icon flag off; a separate Stagehand capture enabled both candidate flags and passed. It does not prove owner art approval, Android, every Dao, all outcomes, or complete/fun full-game loop.

## Publishing and protection

Earlier code milestones were applied as GitHub fast-forwards after refetching current `main`. This candidate slice contains only the UI icon resolver, its focused test, original SVG icons/manifest, and report updates. Before publishing, compare the assembled local tree with one built from the latest remote tree and the allowlisted paths, then refetch main and update with expected SHA plus `force=false`. No real saves or 45 WIP files are in the allowed path set. If remote moves or a conflict appears, stop and rebuild from the new head; never force-push.

## Handoff

**Boss art and opt-in Ngự Khí icon candidate slices verified; R7 V2 remains active.** Next: R2-ASSET, then R3-ENDGAME and R4-VISUAL. Owner approval remains open for visual direction, baked-aura treatment, legal/source use of WIP/11 clips, and Auto semantics if no authoritative control exists. Core Balance and auxiliary-system work remain inactive.
