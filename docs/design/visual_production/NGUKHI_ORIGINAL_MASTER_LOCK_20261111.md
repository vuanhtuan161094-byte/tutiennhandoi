# ART-01 — NGỰ KHÍ ĐẠO: SOURCE IDENTITY LOCK & PRODUCTION GATES

Date: 2026-11-11
Project: **Tu Tiên Nhàn Dỗi** (not Tông Môn Bá Đạo)
Branch: `main`
Status: **SOURCE DESIGN ACCEPTED BY USER / EDITED MASTER DRAFT / RUNTIME NOT APPROVED**
Target: Godot 4.7.2, portrait 390×844
Source audit basis: user-uploaded images in 2026-11-11 conversation; binary originals are **not committed by this document**.

## 1. Source integrity (the unmodified originals)

| Role | Original conversation upload | Dimensions | SHA-256 |
| --- | --- | --- | --- |
| Original 12-pose Cast storyboard | image(5).png | 1448×1086, 4×3 tiles at 362×362 | `9e2e4900f31f9a918a026e377173e71c6d0b0d6a3338489c52923473dc8e5edb` |
| Original single frame close-up | image(6).png | 362×362 | `6b86443b59a2d7c1ebe4b92942b491a62ec6f6413b3d29939635b5ba70973dd5` |
| Original character-design reference | image(7).png | 1448×1086 | `4264de9a7f4b6b731bcd84446a3e816616fd23e02c42063a0283df966b490749` |

All three images have `alpha_min=alpha_max=255` (no actual transparent pixels). The 12-pose sheet and character sheet being RGBA PNG does **not** imply transparent assets.

The three source images and 12 unaltered extracted cells are delivered in the conversation artifact `TND_NguKhi_ART01_source_lock_20261111.zip`, including a review-only GIF and a machine-readable SHA-256/alpha audit. Since those bytes are not in this repository, their availability must not be assumed by CI or another editor without the original package.

## 2. Hard identity constraint — no substitution

Use **the exact heroine from the above originals** as the sole master reference. She is an adult, mature and elegant Ngự Khí female cultivator: same recognizable face (eyes, nose, lips), dark-brown layered long hair, violet/gold head ornament, proportions, torso silhouette, jewelry, purple-black-jade-white-gold high-detail Chinese xianxia fabric, split skirt and existing gold high heels.

Never produce unrelated AI-per-frame portraits and call them one animation. No re-interpretation as chibi/pixel or a different woman for this character without further user authorization. `godot/art/candidate_r7v2/ngukhi_tumi_animation_pilot/` is an older **candidate**, not proof that its character is identical to this locked source.

## 3. Authorized outfit delta ONLY

1. Remove all long dangling sleeves/loose fabric strips hanging from the upper arms, wrists and forearms, on both sides. Keep shoulder filigree, arm guards, bracelets and beautiful compact sleeve detail so elbow/wrist/finger actions remain legible.
2. Add refined **black fishnet stockings**, perspective-fitted to the two legs and integrated under the existing split skirt and gold high-heeled shoes. No leg geometry/pose redesign.

Do not remove the skirt's sophisticated silhouette, torso fabric, hair layers, face beauty, ornaments or material complexity to satisfy the two changes. Repair hidden pixels behind formerly attached sleeves as part of the editable master, not by deforming unrelated anatomy.

## 4. Asset topology and non-looping Cast

Prepare one true transparent RGBA identity master, then isolated coherent layers: rear hair, front hair, torso/pelvis, left upper/lower arm, right upper/lower arm, wrists, actual hand-seal variants, skirt front/back, shoes, ornaments, contact shadow, 3 tangible Ngự Khí treasures, and independent VFX. Standardize camera, source scale, art direction, color, bottom-center foot anchor and transparent canvas across all frames. Preserve a layered editable source in addition to exports.

Non-looping Cast: anticipation → real jointed hand seal → command → 3 artifacts release → recovery/idle. Use shoulder–elbow–wrist–hand articulation (not the rejected one-pivot swing). Each treasure is a separate object and each projectile trail/impact is independent of the character pixel layers. Sequence is **one-shot**, never a direct frame 12 → frame 1 loop. VFX impact must wait for authoritative damage/hit events; no local false damage or hit claim.

## 5. Validation gates

- Original sources remain bit-identical; modified master is a **new candidate**, not an overwrite of those files.
- RGBA has actual transparent outside-character pixels; background is not a baked white/gray border. Avoid destructive automatic chroma-key on fine hair and translucent fabric.
- Character silhouette, facial identity, waist/limb dimensions, stocking perspective and lace density are consistent. No added/missing fingers; no jewelry or skirt teleport across frames.
- Stable 390×844 runtime framing, fixed foot pivot, no crop at maximum sword/trail extents and no flicker between body, weapon and VFX.
- Produce individual frames, contact sheet, editable layer manifest, loop/non-loop metadata, GIF/MP4 motion review, WebP atlas, Godot SpriteFrames / preview, source provenance and SHA hashes.
- Follow `assets/_pipeline/` lifecycle `draft → candidate → approved → integrated → locked`. User approved the **original identity/style**, not the two-edit implementation or an animation candidate.
- Godot import/parse/test, `KIEM_TRA_GAME.cmd`, real 390×844 playback and explicit visual sign-off are mandatory before production integration/closure.

## 6. Scope / known exclusions

Only character visuals, combat sprite animation and presentation VFX are in scope. No edits to canonical JS combat, damage, cooldowns, RNG, state/save, economy or Dao balance. Do not touch existing `godot/art/approved/**` assets during this source-intake step.

**As of this record:** original image audit and review-only storyboard separation completed; sleeves removal, fishnet artwork, alpha-matting, jointed Cast, 3-actor VFX integration and real Godot 4.7.2 runtime QA remain **OPEN**. This record is not a claim of generated edited art or technical closure.
