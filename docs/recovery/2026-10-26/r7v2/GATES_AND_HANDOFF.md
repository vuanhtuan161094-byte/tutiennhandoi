# Gates and handoff

## Source / remote identity

- Tested local source commit: `4288063181586441947519305f5b3818d60469ba`.
- Tested tree: `8bfb92459a03bdb710c7791f6599b3087c9e67f9`, exactly equal to the remote code commit tree.
- Latest remote code commit before docs: `0f3e0d12f45249afc8388196f6b2d7e5dde0414b`.
- Engine: Godot `4.7.2-stable (official)`; candidate art flag enabled only in isolated disposable QA.

## Results

| Gate | Result |
|---|---|
| Import/parse | PASS; new RGBA candidate imported in isolated checkout. |
| GdUnit | 93/93 PASS, including exact archetype binding. |
| Canonical bridge smoke | PASS. |
| P2 endgame Boss fixture smoke | PASS; realm 114/floor 21601, canonical encounter, result/aftermath asserted. |
| Bounded smoke | PASS. |
| Stagehand Home runtime | 50/50 PASS. |
| Stagehand Combat runtime | 28/28 PASS. |
| Home visual capture | 9/9 PASS. |
| Combat visual capture | 20/20 PASS. |
| 390×844 screenshot pixel validation | PASS for prefight and playback. |
| Boss identity / mapping | PASS; both frames show “Thủ Tầng · U Minh Xà”; only `serpent` maps to this art. |
| Actual-fight hash | Preserved: `7865a49ac6db07f1855541a3b0998f6f7fbef37cf0665e812a4e502fc2ed4880`. |

Pass means only these technical scenarios passed. It does not prove owner art approval, Android, every Dao, all outcomes, or complete/fun full-game loop.

## Publishing and protection

Each code milestone was applied as a GitHub fast-forward after refetching current `main`; expected SHA was checked and `force=false`. The latest tested local tree was compared to the code tree before update. Docs are a separate documentation-only milestone. No real saves or 45 WIP files were uploaded. If remote moves or a conflict appears, stop and rebuild from the new head; never force-push.

## Handoff

**Boss candidate milestone verified; R7 V2 remains active.** Next: R2-ASSET, then R3-ENDGAME and R4-VISUAL. Owner approval remains open for visual direction, baked-aura treatment, legal/source use of WIP/11 clips, and Auto semantics if no authoritative control exists. Core Balance and auxiliary-system work remain inactive.