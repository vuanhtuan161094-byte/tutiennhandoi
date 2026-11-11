# ART-01C — Five dynamic Ngự Khí keypose concepts and visual QA (2026-11-11)

Repository: `vuanhtuan161094-byte/tutiennhandoi` — branch `main`
Godot goal: 4.7.2, portrait 390×844
Status: **CONCEPT / NOT APPROVED / NOT GAME READY**

## Delivered out-of-repo candidate
Conversation archive: `TND_ART01C_5_KEYPOSE_REVIEW_20261111.zip`
ZIP SHA-256: `7cc5c2457bb1d1a93f6fc67cc49a1fe98b87c90cc996155968dbe4fbaaffd7e3` (12 archive entries, CRC test clean).
Five RGBA PNG sources + three original identity references + dark/light comparative contact sheets + manifest and README. Output PNGs preserve the actual generated pixels; contact sheets only scale to fit for side-by-side inspection.

| Pose | Artistic purpose | Source dimensions | Production decision |
| --- | --- | --- | --- |
| 01 READY | grounded resting stance | 1086×1448 | concept only |
| 02 CROSS STEP | stepping forward/cross-step with upper-body cast | 1086×1448 | concept only |
| 03 SEAL | lowering center of gravity, wide leg stance, two-hand seal | 1086×1448 | concept only |
| 04 COMMAND | forward lunge, weight transfer, arm release | 1086×1448 | concept only |
| 05 FOLLOW THROUGH | low recovery/crouch, bent front knee and extended rear leg | 1190×1322 | concept only |

## Actual visual comparison against user's original

Strengths: real leg pose differences, fabric follow-through and several readable combat silhouettes, superior dynamic intent to prior arm-only keyposes.

**Blocking flaws (not accepted):**
- **Identity drift:** the generated face/eye geometry, crown, makeup and hair silhouette differ from the accepted 2026-11-11 original character; consistency also varies between the five generated poses.
- **Clothing drift:** front bodice construction, dress/corset detailing, waist filigree and hem patterns change between poses; this is not one character's identical costume.
- **VFX baked:** magic mirrors and purple trails are inside generated PNGs; cannot be independently event-synced to real Combat.
- **Source matte artifacts:** transparent PNG pixels exist, but light/dark proof displays colored edge residues requiring cleanup around hair/props.
- **Foot anchoring not validated:** contact sheet is a **layout**, not a fixed-world-space animation. Different foot placements are intentional; actual planted-foot coordinates and stable actor root must be authored and tested, not inferred from alpha bbox.
- **Not yet an animation:** no inbetween frame continuity or actual Godot runtime import/Stagehand/390×844 movement proof.

**Decision:** Keep the five images as **pose studies only**, do not call them approved keyposes, do not generate inbetweens from them unchanged, and do not promote `assets/_pipeline` registry to approved/integrated/locked. Next art step is an image edit from a single pixel-locked original identity master for each target stance, with neutral body raster/no attached VFX, then actual multi-pose visual review at full resolution and mobile scale. Only after identity/costume consistency and foot anchors pass should it become a sprite animation.

No gameplay/SaveService/backend, `godot/art/approved/**` or source Godot production files changed. Generated binaries are delivered via conversation ZIP only, not committed to this repository.
