# ART-01 — Visual QA, animation skills, and tutorial-derived corrections

Date: 2026-11-10
Repository: `vuanhtuan161094-byte/tutiennhandoi`
Main HEAD checked before this note: `6f7af84b11e91f66d0e756e4b361b592af0876d4`
Status: **REJECT current generated sheet for game production; preserve as concept/motion study**

## Reviewed inputs and boundaries

1. Conversation-attached/generated character concept: `bảng_thiết_kế_nhân_vật_ngự_khí_đạo.png`.
2. Conversation-attached/generated Cast sheet: `bộ_sprite_ngự_khí_dao_tung_kiếm.png`.
3. Existing repository Tử Mị candidate rig (`godot/art/candidate_r7v2/ngukhi_tumi_animation_pilot/`), ART-01 VFX candidate (`godot/art/candidate_r7v2/visual_production/art01_ngukhi_vfx/`), `godot/AGENTS.md`, and the existing video-to-Godot workflow.

The new conversation image files are **not committed as production assets**. The prior Tử Mị rig and existing ART-01 code are different authored sources; do not claim the new generated artwork has been rigged or integrated already.

## Concrete inspection of newly generated images

- Both the concept sheet and the 12-frame Cast sheet have **RGB**, not RGBA; Cast sheet is **1448×1086**, made of **4 columns × 3 rows**, each cell **362×362**. It is **not a transparent asset**.
- 12 poses exist and the full-length heroine is appealing as a *concept*: adult, black/violet/gold xianxia, elaborate styling. The concept sheet also has ornamental multilingual text; that must not become runtime texture/UI.
- **Identity drift:** facial expression/details, fingers, jewelry, sleeves, hair strands and cut of the skirt do not remain pixel-consistent. This must be tested by a real running preview rather than assumed from a clean contact sheet.
- **Gesture:** hands begin joining at poses 4–5, then the command gesture changes too abruptly around poses 5–6. The right-arm action lacks a deliberate elbow/wrist/finger plan.
- **Embedded effects:** spell circle, glowing trails and flying swords share the same raster cells as the body. The rightmost sword/trail in poses 9–10 runs into the crop boundary; a game projectile must be a separate object.
- **Loop:** this is a *one-shot cast*, not an idle loop. Pose 12 should enter idle via animation event/transition rather than auto-loop pose 12→1.
- **Background:** plain pastel/gray background is baked into every tile. Do not call it a transparent sprite sheet.
- **Scale:** detailed ornamentation and long translucent sleeves lose readability at mobile combat scale; retain the design's mature/beautiful visual identity while simplifying silhouette and separate effects.
- **Pipeline:** 12 grid cells do not equal 12 viable runtime frames. The standalone earlier Tử Mị rig also remains a shoulder-only pilot with an open palm and no articulated seal. Neither is production ready.

## Relevant project-local skills studied

- [`skills/godot-animation/SKILL.md`](../../../skills/godot-animation/SKILL.md): pose-to-pose `AnimationPlayer`, nonloop one-shots, presentation-only states, `AnimationTree` if shared state blending becomes necessary.
- [`skills/godot-shaders-vfx/SKILL.md`](../../../skills/godot-shaders-vfx/SKILL.md): `canvas_item` shader and `GPUParticles2D`, color accents, trail/impact layering, avoiding opaque VFX covering the heroine. Verify snippets against the exact Godot 4.7.2 renderer before copying.
- [`skills/godot-stagehand/SKILL.md`](../../../skills/godot-stagehand/SKILL.md): actual 390×844 gameplay capture, animation playback, input sequence and performance checks.
- [`docs/tools/VIDEO_TO_GODOT_ANIMATION.md`](../../tools/VIDEO_TO_GODOT_ANIMATION.md): stable union crop, bottom-center pivot, alpha/despill, deduped frames and correct `SpriteFrames` durations. Continue using this for Home/meditation/video-derived art.

## External verified learning material

Public descriptions, chapter indexes and written guides were inspected. **Do not claim full audiovisual viewing of video frames**, which was unavailable in this session.

1. [Alan Becker — 12 Principles of Animation](https://www.youtube.com/watch?v=uDqjIdI4bF4): **anticipation** (2:07), **pose-to-pose** (6:33), **follow-through** (9:14), **slow in/out** (11:17), **arcs** (12:57), **timing** (16:11), **appeal** (21:38). Apply to summon → seal → command → release → settle, not evenly spaced unrelated poses.
2. [Winged Canvas — How to Animate in Krita for Beginners](https://www.youtube.com/watch?v=oXMCmiT_wxA): timeline (2:22), onion skins (3:23), FPS (8:42), export (10:18). Use for inspecting silhouettes/key-poses and correcting inbetweens.
3. [Godot official cutout animation guide](https://docs.godotengine.org/en/stable/tutorials/animation/cutout_animation.html), [Godot Skeleton2D guide](https://docs.godotengine.org/en/stable/tutorials/animation/2d_skeletons.html), and [Skeleton2D demo](https://github.com/godotengine/godot-demo-projects/tree/master/2d/skeleton). Rig shoulder→elbow→wrist→hand, then secondary hair/cloth layers; keep a real textured art source instead of stretching limbs with hard seams.
4. [GDQuest — Juicing up your game attacks](https://www.gdquest.com/library/juicy_attack/): layered timing/effects, anticipation, impacts and audio cues, adapted to 2D Godot.
5. [Le Lu — Godot 4 Projectiles VFX](https://www.youtube.com/watch?v=74XywaLGO5Q): projectile head (1:10), trail (18:33), sparks (28:13), dynamic trail (33:30). **Original video uses 3D demonstrations**, so translate effect principles to 2D rather than copying 3D implementation.
6. [Le Lu — Godot 4 Hit and Impact Effects](https://www.youtube.com/watch?v=GeParYI2J6I): impact (0:50), sparks (7:01), synchronized contact (14:21). Also a 3D demo; only take visual-timing principles for 2D.
7. [Krita animation manual](https://docs.krita.org/en/user_manual/animation.html): transparent animation layers, frame-by-frame keyframes, onion skin, and sprite export fundamentals.

## Revised production technique — specific next implementation

**A. Art master** (not a design-poster export)
- A single full-body 3/4 adult heroine, clean RGBA, same face/hair/jewelry/major costume silhouettes. Transparent master, same view, no text.
- Split independent layered PSD/ORA or RGBA files: rear hair, front hair, torso, upper/lower right arm, wrist, hand-seal variants, fabric, belt ornaments, shoes/shadow, three treasures. Heal the pixels hidden behind joints.
- Avoid extra hanging fabrics that obscure hand seals. Choose violet/gold identity deliberately; do not let the prompt silently swap the original mature xianxia style.

**B. One-shot Cast (not an idle loop)**
- 0–2 anticipation and slight turn; 3–4 joined hands/real seal; 5–6 command and preparation; 7–8 projectile releases; 9–10 follow-through/hair/cloth; 11 return to ready pose.
- Author transitions with ease, arcs and overlap. For a 12-frame preview, 8–12 FPS can be tried; actual timing must be approved by watching motion, not assigned purely by the number of frames.
- Separate body/props/VFX when packaging into Godot. Never count an AI 12-pose image as completed animation without runtime/playback evidence.

**C. Combat VFX**
- Three independently positioned flying swords or physical-looking jade/gold treasure actors with a bright core/edge, controlled glow and readable silhouette.
- Pre-release sigil at hand, a short acceleration trail per projectile, impact flash+sparks+ring at authoritative hit time, post-hit particles; don't emit a false hit on a miss.
- Current ART-01 Godot VFX loops as **preview choreography**, not a production event-timed implementation. Do not connect its local timer to combat truth.

**D. Gates**
- Reject unmasked RGB sprites, tile crop/edge clipping, inconsistent center/foot baseline, wrong hand articulation, duplicated key poses and leaking alpha.
- Reproduce on real Godot 4.7.2, load the same existing `CombatScreen` 390×844, capture continuous playback and key frames, confirm no hidden HUD, no flicker/clipping, canonical skill start and hit cues, and record FPS/texture budget.
- Only then promote to `approved` through `assets/_pipeline/`, after explicit user visual acceptance. No gameplay/save changes.

## Disposition

- **Concept art:** retained as reference for color, adult face, costume and overall silhouette, not as atlas input.
- **12-frame RGB contact sheet:** **REJECT as production SpriteFrames input**; useful as a pose storyboard only.
- **Existing ART-01 VFX Godot code:** candidate only and awaiting 4.7.2 import/parse/actual visual review.
- **Next meaningful deliverable:** actual transparent multi-layer master + one-shot Cast with clean 12+ frame export and moving preview using the same identity; then independent 3-sword event-timed VFX.
