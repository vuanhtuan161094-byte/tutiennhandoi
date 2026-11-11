# ART-01 Ngự Khí — Layer Candidate v0.1 QA / Handoff

Date: 2026-11-11
Repo: vuanhtuan161094-byte/tutiennhandoi
Status: **CANDIDATE**, not visually approved / not installed / not locked
Viewport goal: Godot 4.7.2, 390×844

## Delivered actual assets outside repo

Conversation attachment: `TND_ART01_NguKhi_Rig_Candidate_v01.zip`

- ZIP SHA-256: `a6fe5de91ee6eaad3ee60f1c4efcc956f1e5a9b4c89bd2460e9ee2b53b3223a1`
- ZIP contents: 39 entries, roughly 8.75 MB compressed
- Actual split source PNG RGBA layers: **12 / 12**
- Full-body master: 562×1073 PNG RGBA with long arm fabric removed and black fishnet added (candidate, not exact-pixel copy of the user's original)
- Isolated pieces: 2 upper arms, 2 forearm/hand pieces, 2 hand-seal variants, 2 hair pieces, 3 distinct treasures
- Machine-readable `asset_manifest.json` containing part dimensions, original-source bboxes, hashes, approximate joint pivots, source provenance and remaining blockers
- Dark/light background master previews and a 12-layer contact sheet
- GIF: `preview/ART01_separate_props_preview.gif` independent visual props motion (Pillow, not Godot)
- GIF: `preview/ART01_arm_joint_motion_test.gif` isolated two-joint arm motion and hand-pose overlay (Pillow, not a joined character rig)
- Standalone Godot **source-only workbench** at `godot_drop_in/art/candidate_r7v2/visual_production/art01_ngukhi_layers_v01/art01_layer_workbench.tscn`, with 12 RGBA images and GDScript; not tested in Godot.

The binary package is a conversation delivery and **not yet stored in GitHub**. Reproduction on another machine requires downloading and copying the ZIP. This documentation cannot be used to claim files are present in the repository or Godot.

## QA evidence from source-processing tool

- 12/12 isolated layers are valid PNG RGBA; each has nonempty content and truly transparent background pixels.
- 12/12 SHA-256 values match `asset_manifest.json`.
- ZIP CRC: PASS across all 39 archive entries.
- Extracted layer masks were derived by connected-component grouping at alpha threshold 40, extending outline 2 pixels, suppressing alpha under 10; review hair edges, fabric transparency and any matte halos visually.
- The initial AI-edited candidate **does not prove exact original face/identity consistency**, even though overall palette and costume intent are similar.

## Blocking visual/game-production issues

1. Original arms remain embedded in the full-body master, despite separate arm sprites being provided; reconstruct an arm-free torso/hair backplate before overlaying moving arms.
2. Align isolated upper arm, forearm, wrist and finger-seal poses at a shared anchor; the two hand-seal cutouts are currently separate overlays, not connected wrist/finger IK.
3. Visual approval of face, eyes, lips, hair ornaments and body proportions against the three user originals is **required**; do not quietly accept AI identity drift.
4. Verify event-timed one-shot Cast with separate artifacts/trails/real hit cues; do not trigger damage on the visual prototype timer.
5. Import/parse Godot 4.7.2, run `KIEM_TRA_GAME.cmd`, capture actual 390×844 continuous animation and assess clipping, alignment and motion quality; not done in this assistant environment.

## Scope guard

No gameplay/backend JS, real combat outcomes, SaveService, cooldowns, economy or production `godot/art/approved/**` changed. The brief/registry is at `candidate`; final approval/promotion is explicitly pending.
