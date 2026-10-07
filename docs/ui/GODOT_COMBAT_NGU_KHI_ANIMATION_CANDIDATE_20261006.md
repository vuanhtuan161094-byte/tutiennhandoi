# Godot Combat Ngự Khí Animation Candidate — 2026-10-06

Status: **USER-APPROVED NGỰ KHÍ V1 ANIMATION SET — RUNTIME INTEGRATION/POLISH STILL OPEN**

Scope is presentation-only. Canonical JS combat, Dao gameplay, damage, cooldown, AI, RNG, save schema and Hunt authority are unchanged.

## Runtime contract

Ngự Khí player animation is selected only from authoritative Combat presentation data:

`skill.cast.start.skillId -> CombatScreen -> CombatPlayerActor -> exact animation registry entry`.

No local skill timing, hit outcome, resource mutation or gameplay decision is introduced. Missing candidate resources or an unknown Dao/skill fail safely to the existing native player placeholder.

The player returns to the Ngự Khí idle loop after a non-loop skill animation finishes. A later authoritative `skill.cast.start` may replace the currently playing presentation animation.

## Candidate asset root

`res://art/candidate/combat/ngukhi_v1/`

These assets remain candidate art until real Godot 390×844 review and explicit user approval. They must not be promoted into `art/approved` by this slice.

## Source clip mapping

| Runtime animation | Canonical skill | Source clip |
| --- | --- | --- |
| ngukhi_idle | combat idle | 1000020024.mp4 opening segment |
| ngukhi_basic | Ngự Khí Linh Chỉ | 1000020024.mp4 |
| ngukhi_deploy | Phân Khí Thành Binh | 1000020025.mp4 |
| ngukhi_guard | Huyền Kính Hộ Chủ | 1000020026.mp4 |
| ngukhi_strike | Phá Không Ngự Kích | 1000020028.mp4 |
| ngukhi_sync | Bách Khí Đồng Minh | 1000020029.mp4 |
| ngukhi_recall | Quy Khí Hồi Nguyên | 1000020030.mp4 |
| ngukhi_split | Phân Quang Ngự Khí | 1000020031.mp4 |
| ngukhi_merge | Hợp Khí Quy Nhất | 1000020032.mp4 |
| ngukhi_suppress | Vạn Bảo Trấn Không | 1000020040.mp4 |
| ngukhi_ultimate | Chư Thiên Vạn Bảo Triều Tông | 1000020041.mp4 |

Processing follows the repository video-to-Godot conventions: 8 FPS sampling, chroma cleanup, one stable union canvas per animation, lossless WebP atlas, SpriteFrames resource, bottom-aligned runtime placement. Skill clips are accelerated only as presentation playback; canonical combat time remains backend-owned.

## Code owners

- `godot/scripts/combat/combat_player_animation_registry.gd` — exact Ngự Khí animation routing.
- `godot/scripts/combat/combat_player_actor.gd` — candidate AnimatedSprite2D + safe native fallback.
- `godot/scripts/combat/combat_screen.gd` — consumes authoritative player cast events.
- `godot/tests/unit/combat_player_actor_test.gd` — registry coverage and fallback safety.

## Required closure proof

After the binary candidate atlases/SpriteFrames are installed under the candidate root:

1. full Godot import;
2. parse-check changed scripts;
3. targeted GdUnit;
4. `KIEM_TRA_GAME.cmd`;
5. actual 390×844 prefight/playback screenshot/video review;
6. explicit user visual approval.

Until those steps pass, this slice is not runtime PASS, not visually approved and not locked.


## Full animation recording / review harness

For visual review of the complete Ngự Khí animation set, use:

`XEM_TOAN_BO_NGUKHI.cmd`

The launcher imports the locally installed candidate resources and opens the dedicated 390×844 review scene. The review scene uses the real `CombatScreen` and `CombatPlayerActor`, then plays:

`Idle 3s -> Basic -> 8 Active -> Ultimate`

Each authored SpriteFrames sequence is forced to **1× review speed** so every generated frame can be inspected. This speed override exists only in the debug showcase; production Combat continues to use the registry `speed_scale` values.

Controls:
- Space / Enter: start or replay;
- Esc: close.

The screen labels the current skill and ordinal. The showcase does not simulate damage, cooldowns, resources, AI, RNG or any other gameplay authority.


## User decision — 2026-10-07

The user explicitly closed the content-selection pass for the full Ngự Khí V1 animation set, including skills 08–10 without requiring another Grok generation pass.

Locked product decision for the next slice:
- keep Idle + all 10 combat skill source animations;
- do not regenerate clips merely because outfit coverage changes between animations; that variation is intentional;
- no further Grok work is required before Combat integration/polish;
- next priority is a complete Ngự Khí combat vertical slice in Godot: normalize actor presentation, connect skill motion to target-facing VFX/impact feedback, then review real combat before scaling the pipeline to the other seven Dao.

This is **user approval of the animation content set**, not yet a technical/runtime LOCKED claim for the full Combat slice.


## Ngự Khí combat vertical-slice integration candidate — 2026-10-07

Implementation opened after the user approved all 11 Ngự Khí V1 animations.

Presentation-only changes:
- conservative per-animation visual scale calibration so source-video framing changes do not make the fighter visibly jump in size;
- stable player launch/body anchors;
- exact canonical Ngự Khí skill IDs map to procedural cyan travel / self / impact VFX;
- `skill.cast.start` starts the authored body animation;
- authoritative `skill.travel` starts outbound visual travel when present;
- authoritative `combat.damage` / `combat.dot` creates target impact at the actual backend event time;
- authoritative heal/shield/artifact-source changes can create compact self-side VFX;
- authoritative Break creates stronger target feedback.

No local damage, hit/miss, cooldown, resource or combat timing is invented. Missing skill IDs fail closed; the current active skill is used only as a presentation fallback when an event omits its skill id.

This is a static implementation candidate until the Windows Godot gate and real 390×844 playback are rerun.


## Windows gate — 2026-10-07

User ran the current `main` through `KIEM_TRA_GAME.cmd` after commit `159f242f84b693d98939b92291068052ccd3b81a`.

Observed result supplied from the Windows console:
- Combat visual capture completed;
- both exported Combat screenshots validated at 390×844;
- pixel validation: PASS;
- `GODOT LOCAL VERIFICATION: PASS`;
- root script reported `[PASS] Godot verification completed.`

This closes the **technical gate** for the current Ngự Khí integration candidate. It does **not** approve the final Combat visual baseline yet; the gate output still reports `Baseline status: NOT APPROVED`.

Next required proof: record one real production-speed Ngự Khí battle showing body animation + outbound VFX + target impact timing for visual review.


## Ngự Khí VFX V2 art direction — 2026-10-07

The first procedural prototype was rejected visually because too many skills reduced to the same cyan streak. It remains useful only as proof of event wiring.

V2 replaces that visual language with **skill-specific compositions**:
- actual three-artifact silhouettes (astrolabe / flying blade / crescent);
- rotating cultivation seals and rune ticks;
- orbit / split / recall / merge choreography;
- barrier geometry for Guard;
- descending suppression seal for Vạn Bảo Trấn Không;
- multi-ring seal + artifact rain + layered shockwaves for the Ultimate;
- only a restrained trail/afterimage behind moving artifacts, never a generic beam as the primary readable effect.

A curated subset of `haowg/GODOT-VFX-LIBRARY` is vendored under
`godot/third_party/godot_vfx_library_curated/` under its MIT license. Only
self-contained texture-free 2D particle scenes are used, so the project does
not enable the upstream plugin or introduce gameplay ownership.

External research references retained for later asset polish:
- OpenGameArt `2D Spell Effects` — CC0, transparent PNG layers;
- OpenGameArt `Auras` — CC0, 512×512 / 60-frame aura sources;
- OpenGameArt `4 summoning circles` — CC0 vector magic circles;
- Kenney Particle Pack — CC0, 80 particle textures.

The current V2 deliberately uses the MIT Godot-native subset first because it
is directly auditable in source, fits Godot 4.x, and avoids importing
unreviewed binary art. The existing `XEM_TOAN_BO_NGUKHI.cmd` showcase now
also triggers review-only VFX phases so the full 10-skill visual vocabulary can
be inspected in one run.


## Ngự Khí VFX V3 static candidate — 2026-10-07

User rejected V2 as still too flat/debug-like and explicitly opened a V3 art pass.

V3 visual doctrine:
- exactly **3 core artifacts** remain the readable Ngự Khí resource identity;
- combat skills may manifest many temporary projected weapons: sword, dao, spear, wheel and spirit needle silhouettes;
- projected weapons are presentation-only and do not create extra backend artifact sources;
- projection density escalates by skill tier: Basic 4, Deploy 9, Guard 6, Strike 10, Sync 12, Recall 8, Split 12, Merge 16, Suppress 18, Ultimate 32;
- major skills may layer candidate painted textures over procedural motion, while missing candidate art safely falls back to V2 rendering;
- gameplay timing, damage, hit/miss, cooldown, resource ownership and RNG remain canonical-JS owned.

Optional V3 candidate art root:

`res://art/candidate/combat/ngukhi_v3/`

Expected files:
- `deploy_vortex.png`
- `guard_barrier.png`
- `suppress_seal.png`
- `ultimate_barrage.png`

The binaries are intentionally not committed with the source candidate. The review harness reports whether the V3 pack is present and otherwise continues with the V2 fallback.

This is a **static candidate only** until the V3 asset pack is installed, imported, `KIEM_TRA_GAME.cmd` is green, and actual 390×844 runtime video is reviewed and explicitly approved by the user.
