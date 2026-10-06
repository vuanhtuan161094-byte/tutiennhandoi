# Godot Combat Ngự Khí Animation Candidate — 2026-10-06

Status: **STATIC CANDIDATE — SOURCE CLIPS PROCESSED; WINDOWS GODOT GATE REQUIRED**

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
