# Roadmap chi tiết R2–R6

Quy ước status: `DONE-LOCAL` nghĩa là có bằng chứng trong clone C, chưa phải owner acceptance; `BLOCKED-DECISION` chờ quyết định; `PLANNED` chưa triển khai. P1 cao nhất. Không task nào tự bật Core Balance/auxiliary rework.

| ID / ưu tiên | Mục tiêu / owner | Files / hiện trạng và bằng chứng | Hành động / phụ thuộc | Nghiệm thu và gate | Asset/save risk | Quyết định cần chủ sở hữu |
|---|---|---|---|---|---|---|
| **R1-HANDOFF / P0 — COMPLETE** | Handoff nguồn sự thật; owner: Docs/Git | `docs/recovery/2026-10-26/**`; branch/HEAD và gate ở `COMMIT_AND_GATES.md` | Docs commit riêng `main`; code candidate riêng review branch; fast-forward push và remote ref/file read-back | GitHub có đủ docs; `main` và candidate refs được đọc lại; commit SHA/URL ghi trong commit/gate report và handoff | Không stage binaries, save hoặc secrets | Không |
| **R2-ASSET / P1 — DONE-LOCAL, RIGHTS UNKNOWN** | Bảo toàn 45 WIP, 11 clip, provenance/manifest/runtime gaps; owner: Asset pipeline | `godot/art/candidate/combat/ngukhi_v1/**`, `ngukhi_v3/**`, `v3_assets/**`; 45/45 hash match; 11 atlas/TRES import pass. Rights/source MP4 UNKNOWN | Giữ binaries local; duy trì CSV hash/provenance; tìm original sources/permission trong scope được phép; Android perf/atlas test sau khi quyền được xác nhận | Inventory/hash 45/45; 11 SpriteFrames/405 frames load; source IDs và atlas hashes đối chiếu; file gốc truy được; owner permission documented; không drift root manifest | Rất cao: game art chưa rõ quyền; Không dùng save | Phê duyệt nguồn/quyền sử dụng và có cho phép runtime allowlist hay không |
| **R3-ENDGAME / P1 — PASS ISOLATED QA** | Test high-realm Boss, full battle/aftermath; owner: QA bridge + Combat | `godot/backend/bridge_server.mjs`, `bridge_p2_fixture_smoke.mjs`, `main.gd`; fixture realm114/floor21601, battle.end và aftermath PASS | Duy trì fixture chỉ diagnostic+QA; nếu thêm coverage thì dùng save path unique disposable; không seed player save | P2 fixture smoke PASS; CombatKernel V3 playback result/duration/end event; aftermath realm/Hunt marker; Godot runtime Stagehand route smoke; save nằm trong clone C | Không ghi user save; mọi setup là synthetic canonical transitions. Không tuyên bố pass thắng Boss nếu kernel thua | Không cho fixture. Chọn fixture result policy chỉ khi scope mở rộng |
| **R4-VISUAL / P1 — VISUAL CANDIDATE** | Review Home/Character/Combat/Ngự Khí; owner: UI/visual | `combat_screen.gd`, `combat_view_model_test.gd`; local screenshots ở evidence index. Tactical banner từng che player; lane chuyển sang vùng phải-dưới | Review ảnh trên device; xác minh encounter identity; giữ baked aura; chạy screenshot comparison sau khi owner chọn baseline | Screenshot real Godot; 390×844 pixels; lane không intersect player/lower HUD ở 360×800,390×844,412×915,430×932; user approval cho baseline | Artwork/source rights UNKNOWN; không upload screenshot/asset trước khi rights rõ; không lưu save thật | Owner duyệt screenshot candidate, baseline và direction aura/art; hiện NOT APPROVED |
| **R5-COMBAT-UI / P1 — AUDIT COMPLETE / UX DECISION OPEN** | 8 Dao widgets, feedback/telegraph, Auto; owner: Combat UI | `combat_presentation.mjs`, `combat_dao_widget.gd`, `combat_skill_rail.gd`, `combat_tactical_lane.gd`; bridge smoke cover 8 DTO; GdUnit priority/cooldown | Chưa thêm interaction. Sau khi định nghĩa Auto, source state/action từ canonical DTO, rồi test cả 8 Dao fixture; sửa boss identity sau khi trace encounter ID | DTO-only meter/flags, source entity không mutate; owner chỉ rõ semantics/authority Auto; telegraph progress bằng cast duration; fixture/UI test theo Dao | Không đổi combat stats/authority, art hay real save | Auto là AI rotation hay Auto hunt? Có cần user toggle/action không? |
| **R6-GAME-COMPLETION / P2 — PLANNED** | Mở lại hệ phụ theo quyết định riêng; owner: product/system owners | `docs/recovery/2026-10-25/04_GAMEPLAY_SYSTEM_STATUS.md`, historical roadmap, current QA | Trước mỗi hệ: mở decision record, scope module owner, dependencies/test closure, data/save plan; ưu tiên closure hệ đang chạy trước auxiliary | Module acceptance, tests/runtime QA/physical QA theo scope; game-wide matrix không còn blocker untracked | Cao: economy/save/progression compatibility | Mỗi subsystem có quyết định riêng. Core Balance/auxiliary rework mặc định INACTIVE |

## Subtask acceptance detail

### R2

- Catalog file path/hash/kind/source filename/source SHA/clip frame metadata/pivot-license status; phân biệt VERIFIED/UNKNOWN.
- Không nhận “hash pass” là quyền pass; không nhận import pass là nhân vật playable.
- Cần original MP4/permission và rig/pivot/direction mapping trước production integration.

### R3

- Chỉ dùng QA fixture API allowlist khi cả diagnostic và QA env bật; save riêng từng run.
- Assert action/encounter snapshot, event stream, terminal `battle.end`, result duration/settlement, then home readback.
- Thêm device/long-run test trong clone không đồng nghĩa physical Android QA.

### R4

- Home/Character/Combat/Ngự Khí candidate có ảnh gốc local, screen and viewport metadata, SHA.
- User approval là điều kiện để ghi approved baseline hoặc đổi baked aura/art direction.
- Boss identity mismatch cần mapping canonical `monsterId` và playback snapshot theo encounter.

### R5

- Mỗi resource/flag phải có owner (player/target/field), source DTO và event cập nhật.
- Không vẽ resource derived ở UI; Body legacy meter phải ẩn; mind target marks không reset bởi projection khác.
- Auto control/UI cần API contract, không chỉ label fixed.
