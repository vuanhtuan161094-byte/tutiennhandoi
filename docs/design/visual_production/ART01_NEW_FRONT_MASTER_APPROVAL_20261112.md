# ART-01 — Front-facing Ngự Khí static master approved (2026-11-12)

Repository: `vuanhtuan161094-byte/tutiennhandoi`
Branch: `main`
Approval scope: **STATIC VISUAL IDENTITY ONLY**
Game: Godot 4.7.2, portrait 390×844.

## Approved exact image

- Current conversation PNG: `ngự_khí_đạo_nữ_vương_tử_kim.png`
- PNG dimensions: **1086×1448**, color mode **RGBA**, nonempty alpha transparency present.
- Exact SHA-256: `082709eeab1d759fc2c2e0c3695a93afcb9185e345f989fe69f677430137ae65`.
- The user approved this specific new front-facing heroine with "Okm đẹp lắm t ok" on **2026-11-12**, after rejecting previous art/animation loops.
- **The image is not present as a binary in the repository in this commit.** Another editor/agent must obtain the exact source PNG from conversation attachment; compare SHA before use. Never silently substitute a similarly named/generated image.

## Preserve identity and silhouette

The new master, not the earlier 3/4 pose sheet, is the current source of truth for new animation. Adult Chinese xianxia rendering, long dark-brown layered hair, violet-and-gold crown/head jewelry, black/purple/lavender/jade-white bodice and slit chiffon skirt with gold ornamentation, fishnet stockings, gold high-heeled sandals, frontal camera.

### User approval boundaries

- User approved the **look of the still image** only.
- **Animation, frame-to-frame facial consistency, foot anchors, true alpha-edge cleanup and in-game scale remain UNAPPROVED.**
- The new approved master must **not** convert earlier rejected ART01A rig/ART01C AI poster/ART01D near-static wave animation into accepted production.
- No source Binary, SpriteFrames, Godot runtime/GdUnit/Stagehand QA has been performed for this new master.
- The `approved` pipeline entry means user-approved art choice; it is **not** `integrated` or `locked`.

## Next authorized gate: ART-01E 3-keypose motion proof

1. Inspect face, ankle, hair, skirt alpha matte on dark/light; correct alpha fringing as a technical operation only, without modifying approved face/style.
2. Work from the **same** approved full-resolution body reference. Develop **three sequential** key poses (Ready → one short stepping/weight transfer → Hand Seal); no unrelated pose generation and no standstill ripple posing as locomotion.
3. Source is full-res; all output frames share one canvas, consistent character scale and 3/4-independent **frontal** camera.
4. Explicit floor anchors: planted sole, stepping foot target, character root. Check foot sliding, leg length, knees, hips, head position, dress/hair silhouettes and all hands. Static one-to-one pixel identity can be preserved where anatomy is not moving.
5. Show *real* 390×844 GIF from actual assets on both dark/light backgrounds, ideally video and 100% crop overlays; inspect frame-by-frame before offering it.
6. If visual continuity fails, reject the candidate immediately; don't promote source frames or generate 24 further inbetweens from it.
7. Later ART-01F Cast one-shot: Anticipation → short step → hand seal → command → recover. Prop actors and VFX separate, driven by canonical combat cues. Godot runtime QA needed before integration.

No combat/backend, SaveService, game art in `godot/art/approved/**`, branches or merges changed.
