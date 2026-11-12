# ART-01E — Three-keypose motion QA and next production route

Date: 2026-11-12
Repo: `vuanhtuan161094-byte/tutiennhandoi`, `main`
Godot goal: 4.7.2, portrait 390×844
**Status: MOTION REJECTED — NOT READY FOR GIF APPROVAL OR GODOT IMPORT**

## Approved asset remains untouched
- Exact source: `ngự_khí_đạo_nữ_vương_tử_kim.png`, user visually approved as an adult front-facing Ngự Khí heroine on 2026-11-12.
- 1086×1448 RGBA
- SHA-256 `082709eeab1d759fc2c2e0c3695a93afcb9185e345f989fe69f677430137ae65`
- This approval is ONLY for the static master look; it did not approve the ART-01A/B/C/D/E motion tests.
- File remains available through the chat artifact `TND_ART01E_master_motion_brief_20261112.zip`; the PNG binary has **not** been uploaded to GitHub in this docs-only commit.

## Actual trial and inspection
1. Tried generating alternate full-body 3-pose images with image generation. **Rejected:** changed face, dark-hair styling, gold headdress, bodice and skirt; one output was an infographic masquerading as a sprite/Godot delivery, not an animation.
2. Built a deterministic original-master-pixel warped 3-pose/25-frame motion experiment. Checked a side-by-side 390×844 contact sheet. **Rejected:** large displacement caused heel/shoe and skirt distortions; limbs did not actually form the required anatomically correct two-handed seal. Source-pixel face stability does NOT make the motion acceptable.
3. Therefore, this turn produced **no approved keypose sequence, no valid Cast GIF and no new Godot resources**. The technical trial is useful only as negative QA evidence.

## Next viable technical path
Test *reference-image-to-video* motion generation using the approved unchanged master, with fixed frontal camera and explicit target movement. A source video is **candidate intake only**, not a finished game asset. Request approximately 2.4 seconds READY → actual planted-foot STEP/weight transfer → connected two-hand SEAL. No photorealistic restyling, costume change, camera cut, VFX baked into character body, or extra hands.

Once the video passes manual facial/limb/frame continuity QA, use the existing repo canonical tool:
`tools/video_to_godot_animation.py` as instructed by `docs/tools/VIDEO_TO_GODOT_ANIMATION.md`; extract consistent RGBA frames, common stable canvas and foot anchor, atlas + SpriteFrames; import and verify Godot 4.7.2 with 390×844 screenshot and actual playback.

## Delivered handoff
Conversation ZIP `TND_ART01E_master_motion_brief_20261112.zip` includes the bit-identical approved master, `ANIMATION_BRIEF.md`, target-anchor visual guide, `QA_STATUS.json`, and rejected-test identity/warp comparison images for internal QA. It contains **no approved animation**.

No `godot/art/approved/**`, authoritative gameplay, SaveService, combat timing, cooldowns, VFX integrations, branches or merges changed. Asset registry's static master entry remains approved; the executable animation remains unapproved.
