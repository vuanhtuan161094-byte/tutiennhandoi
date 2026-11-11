# ART-01B — Frame-anchored hybrid direction for Ngự Khí (2026-11-11)

**Project:** Tu Tiên Nhàn Dỗi only, Godot 4.7.2, portrait 390×844, main branch  
**HEAD observed before documentation:** `efc9dec810aeb821eae5118339e7e6d61d98a414`  
**Status:** TECHNICAL METHOD PILOT / NOT VISUALLY APPROVED / NO GAME RUNTIME CHANGE

## Decision after actual GIF review

**Primary body actions (Idle/Cast/Hit/Ultimate):** source-locked hand-authored **cel/SpriteFrames** animation, NOT a rigid multipart torso/shoulder rig. Existing high-detail heroine has complex semi-transparent chiffon, long hair, tiny jewelry and anatomically sensitive hand gestures: the prior ART-01A V2 rigid-body cutout produced visible shoulder sockets, passing arms through torso, detached wrists, duplicated seal hands, and AI facial drift.

**Secondary elements:** independent animated swords/mirror/control ring, impact/telegraph VFX, possibly restrained isolated hair strands or skirt tails with pivoted transforms. VFX is presentation-only and must respond to canonical skill/hit events; no invented combat events.

Godot documentation supports combining traditional AnimatedSprite2D cel animation with cutout components and particles:
- https://docs.godotengine.org/en/4.7/tutorials/2d/2d_sprite_animation.html
- https://docs.godotengine.org/en/stable/tutorials/animation/cutout_animation.html
- https://docs.godotengine.org/en/4.7/classes/class_spriteframes.html

## Concrete processed source pilot (binary delivery in conversation)

Artifact: `TND_ART01B_SourceLocked_Hybrid_Pilot_20261111.zip`

The pilot reads the **exact 1448×1086, 4×3 user-uploaded original 12-frame sheet**, sha256:
`9e2e4900f31f9a918a026e377173e71c6d0b0d6a3338489c52923473dc8e5edb`.

- 12 original source cels (each 362×362); **no fresh AI-generated face or per-frame anatomy redraw**
- deterministic pale-gray background candidate alpha matte (not final artist matte)
- source pixel sharpening and premultiplied-alpha 1.20× mobile preview (no invented pixel detail)
- fixed source foot pivot `(212,341)`, fixed viewport foot coordinate `(196,725)`, **no per-frame trimming/position drift**
- actual dark and light 390×844 GIF previews and a diagnostic green-anchor overlay GIF
- non-looping one-shot 12-frame Godot `AnimatedSprite2D/SpriteFrames` standalone *source-only* review scene `source_locked_stage.tscn` / `cast_locked.tres`; final gameplay loop is false
- source sheet, re-runnable Python pipeline and checksum/QA manifests included; ZIP CRC checked.

**The GIF preview is not a Godot runtime recording; it was exported by Pillow.** The source-only Godot scene is supplied in the ZIP, **not installed into this repository**, and Godot 4.7.2 import/parse/Stagehand checks were **NOT run** in this environment. Do not claim a runtime pass.

## Actual visual QA after inspecting the GIF

Source continuity and anchor stability are improved versus the rejected mechanical cutout V2, but ART-01B is **not a product-ready outfit/animation**. Blockers:

1. The unmodified original pose sheet still contains long hanging sleeve cloth; the requested shortened sleeves have **not** been propagated across all frames.
2. Black fishnet stockings are absent in the original sprite sequence; no false completed-costume claim.
3. Each cell is only 362×362. 1.2× display can be useful at compact game scale, but cannot recover genuinely fine facial or jewelry detail. Author a stable high-resolution original-identity pose master at >=1024px full figure source scale, then downsample to target; do NOT upscale/reinvent the face separately on every frame.
4. Some airborne swords, trails and translucent effects are baked into the source, with right-boundary crop on some poses. Redraw/export independent actor/VFX layers for final gameplay.
5. Color-distance matting leaves halos in fine hair/translucent fabric and requires manual mask cleanup; inspect over both light/dark.
6. Original AI storyboard has potential inherent pose/face variance. Using source pixels prevents NEW AI-identity changes but does not establish exact full-sequence facial parity.
7. This is a one-shot review reference only. Do not play frame 12 → frame 1 as the actual combat Cast loop.

## Production gate next

1. Approve ONE face/hairstyle/ornament/torso pose master from the actual original identity, do not substitute regenerated look-alikes.
2. Author **3–5 high-resolution, face-locked** upper-body key poses on a common full-figure canvas: ready → raise → seal → command → recover. On each pose keep exact foot/baseline, and verify hands and original face at 100% zoom.
3. Apply the only two approved outfit edits consistently across those key poses: remove trailing sleeve fabric and add black fishnet stockings. Separate hand/seal poses only where continuity survives inspection.
4. Only interpolate/redraw inbetweens after keyposes are accepted. Target game-scale visual sharpness before expanding to 12–24 frames. No fake super-resolution claims.
5. Export a nonlooping Cast with exact source/viewport foot anchors, a transparent atlas and SpriteFrames; props/VFX independently respond to canonical events.
6. Review full dark/light GIF and actual Godot 4.7.2 390×844 playback. User visual approval before `approved/integrated/locked`.

No canonical JS gameplay, SaveService, Combat outcomes, existing art under `godot/art/approved/**`, branches or merge were changed in this method pilot.
