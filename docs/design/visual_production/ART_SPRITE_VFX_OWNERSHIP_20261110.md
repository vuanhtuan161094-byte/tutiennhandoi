# Tu Tiên Nhàn Dỗi — Character / Combat Sprite / VFX Production

Date: 2026-11-10
Status: ACTIVE ART WORKSTREAM — no new production artwork approved by this document
Repository: vuanhtuan161094-byte/tutiennhandoi
Starting main HEAD checked: `46fcd83ca6e2465710347d4b71711a5f465cdca3`

## Owner directive

User assigned ChatGPT direct responsibility for all **character artwork**, **combat sprites/animation** and **combat/character VFX** in this project. This workstream is specifically for *Tu Tiên Nhàn Dỗi*, not *Tông Môn Bá Đạo*. It owns the visual deliverables and their Godot presentation integration, not combat rules or save data.

Execution must produce real viewable image/sprite/VFX assets and runnable previews; documentation is a supporting output, not a substitute for art.

## Visual target / art source of truth

1. Preserve the already established **Ngự Khí female artwork** and **Home meditation** visual family, instead of reinventing character proportions/styles in each asset batch.
2. Main female cultivators may be mature, elegant, sensual, confident and detailed, with deliberate silhouettes. Match each character's Dao identity; no juvenile sexualization. Retain a consistent character face, hair, costume structure and palette across frames.
3. Character identity and readability beat ornament count. Simplified Tử Mị costume V3 is a *candidate*, not an automatic master approval.
4. Home/meditation and character-profile motion may use the existing video→stable-frame→WebP atlas→SpriteFrames workflow when it achieves better natural motion and controlled visual consistency. Combat action uses authored sprite keyposes/cutout animation with separate props and VFX where event synchronization requires it.
5. Neither one beautiful static image nor a PASS test substitutes for review of an actual continuous combat animation at 390×844.

## Production inventory and concrete next steps

**Existing inputs to reuse before drawing new replacements:**
- `godot/art/approved/home/animation_v3/` and `godot/art/approved/character/animation_v2/` with existing SpriteFrames and registries.
- `godot/art/candidate_r7v2/ngukhi_tumi_animation_pilot/`: 12-frame 8 FPS one-shoulder-pivot Cast at 320×480, separate crystal and VFX layers; not a final hand-seal animation.
- Ngự Khí V1 1 Idle + 10 skill clip references from the local preservation report; original binary WIP rights and availability still require verification.
- Existing Boss candidates U Minh Xà, Vô Diện Yêu, Wood Guardian and ten skill icon candidates.
- `docs/ui/GODOT_COMBAT_NGU_KHI_PERSISTENT_ACTORS_20261007.md` for persistent-source choreography; do not reintroduce baked full-screen painted overlays.

**Work packages, in execution order:**
1. **ART-01 — Ngự Khí master & combat Cast proof.** Inspect actual existing Ngự Khí/Home imagery. Select a single approved visual identity; prepare a clean transparent character master, a consistent pose/part source, and an articulated Cast with anticipation, hand seal, command, release and recovery. Independently animate treasure actors and hit/VFX. Supply frame sheet, sprite sequence, actual looping preview and mobile Godot playback.
2. **ART-02 — Ngự Khí full action library.** Build reusable base idle/hit/victory movement and ten skill-distinct actions, not recolored copies; event-timed VFX, anticipation, trails, contact, impacts, result feedback. Extend the existing registry instead of creating a second gameplay state machine.
3. **ART-03 — Remaining seven Dao.** Kiếm, Quyền, Thể, Thần Niệm, Pháp, Độc, Trận. For each: one visual identity; readable idle/basic/cast/ultimate/hit; unique palette, pose signature, projectile/prop/impact grammar; one real runtime review.
4. **ART-04 — Enemies and bosses.** Establish shared monster silhouette categories and Boss-specific variants/telegraph/impact/hit-reaction animations; rework current static candidates where necessary.
5. **ART-05 — Home/Character cast, polish, and asset scalability.** Reuse the accepted identity and restore natural meditating/rest motion; maintain shared atlas packing, alpha cleanup, pivot, lazy-load and device memory budgets.

## Batch creation policy

- Never generate ten unrelated images and call them an animation. Each batch begins with one locked reference master and full-body scale/camera/pivot guide; source poses/parts/frames must share identity.
- Always separate **body**, **prop/weapon**, **VFX**, **shadow/telegraph** wherever the actual effect requires independent positions/event timing. For a deliberate Home loop, stable pre-rendered frame sequences are acceptable.
- Output candidate packages as master PNG, isolated RGBA layers or authored frame PNGs, contact sheet, animated GIF/MP4 preview, atlas + SpriteFrames, manifest of sizes/fps/loop/foot pivot, rights/provenance, and a real Godot 390×844 screenshot/video when runnable.
- Minimum animation QA: fixed framing and foot baseline; no transient costume/face swaps; no missing/extra limbs; no alpha/transparency holes; no clipping at maximum prop extents; smooth transitions, clean first/last loop seam where looping is intended.
- A screenshot can approve art direction but not motion timing. Tests can prove loadability but not beauty/game feel.
- Keep each piece in candidate until the user approves actual appearance and motion; promote only through existing `assets/_pipeline/` and repo Godot gates.

## Technology and integration boundary

Godot target: **4.7.2**, portrait **390×844**. Existing Godot animation, 2D rig, AnimationPlayer, SpriteFrames, GPUParticles2D/CPU particles and compatible shaders are available; choose per effect rather than one compulsory technique. Relevant local skills: `skills/godot-animation/SKILL.md` and `skills/godot-shaders-vfx/SKILL.md`.

No damage, cooldown, RNG, skill outcome, enemy AI, Dao topology, persistence, save schema or canonical JS authority changes as part of art. VFX listens to canonical combat events and responds; it never computes combat outcomes.

Use `KIEM_TRA_GAME.cmd` after integration. The assistant's connected GitHub view does **not** by itself prove a local Godot run; explicitly record unavailable local/device verification and ask for a runtime visual review instead of claiming PASS. Avoid overwriting the owner's original artwork, local WIP and approved visuals.

## Handoff snapshot (2026-11-10)

- Verified GitHub main HEAD at start: `46fcd83ca6e2465710347d4b71711a5f465cdca3`; no later art commits observed as of this handoff.
- Existing Tử Mị candidate: technically generated/loaded; 1-pivot shoulder sweep lacks elbow/wrist/finger gesture; Wan comparison was not run.
- Eight-Dao backend is closed, while complete eight-Dao production combat art/action coverage is not established.
- This document records ownership and execution order, **not** a newly generated asset, a newly run Godot QA, a user visual approval, or a closure claim.
