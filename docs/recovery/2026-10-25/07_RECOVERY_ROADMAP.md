# 07 — Roadmap khôi phục chi tiết

**Authority:** GitHub `main` fetched 26/10/2026 tại `0919d8ce287e12c1add0e22b3840d1a898a9021e`; test snapshot local tại cùng HEAD + local WIP overlay. Không có P0 game blocker được tái hiện. Priority code dưới đây xếp theo recovery order; `CLOSED/LOCKED` systems không tự chuyển sang ACTIVE.

## R1-HANDOFF — Báo cáo và evidence index có nguồn thống nhất

- **Mục tiêu:** Bàn giao audit, module status, asset inventory, QA, visual audit, roadmap và next task lên `docs/recovery/2026-10-25/` để phiên Codex sau có thể tiếp quản.
- **Module owner:** Recovery / repository documentation.
- **File liên quan:** 10 tài liệu audit (01–08, CSV asset, SHA manifest), `README.md`, `evidence/EVIDENCE_INDEX.md`.
- **Vấn đề và bằng chứng:** Báo cáo và thư mục evidence (index cùng 40 evidence artifact local) chỉ nằm trong local output; main hiện không có checkpoint recovery thống nhất. Một số evidence là ảnh/art local chưa có quyền phân phối xác nhận.
- **Hành động:** Fetch main; dùng clean checkout C:; scan secret/PII; giữ trạng thái PASS/BLOCKED; chỉ commit báo cáo/index; giữ binary evidence local nếu provenance/license chưa rõ; commit/push fast-forward và xác minh remote SHA.
- **Phụ thuộc:** Remote main không đổi hoặc fast-forward được; quyền push; local report/evidence manifest.
- **Ưu tiên:** R1 / P1 cho khả năng tiếp quản; tài liệu-only.
- **Tiêu chí nghiệm thu:** `README.md` liên kết đủ 10 tài liệu; ghi audit date, tested SHA, GitHub HEAD và giới hạn clone; evidence index có local path + SHA cho mọi evidence không upload; remote main chứa commit tài liệu; diff chỉ có đúng báo cáo và index.
- **Test/gate bắt buộc:** `git fetch`; verify clean checkout and HEAD; scan credential/PII; `git diff --check`; kiểm tra file tree và link; push không force; đọc lại remote main và các file sau push. Không chạy Godot gate trong handoff này.
- **Rủi ro asset/save:** Không commit binary, screenshot, save, local logs có thể chứa dữ liệu nhạy cảm hoặc art chưa duyệt. Không đụng `E:\`.
- **Quyết định người dùng:** Chỉ cần duyệt bổ sung screenshot/binary về sau nếu quyền phân phối được xác minh; không ảnh hưởng handoff tài liệu.

## R2-ASSET — Bảo toàn 45 WIP Ngự Khí, provenance và manifest

- **Mục tiêu:** Biết chính xác WIP nào được giữ, nguồn/quyền sử dụng, các 11 clip có đủ route/metadata và asset runtime nào còn thiếu.
- **Module owner:** Ngự Khí Dao / Godot asset pipeline; repository maintainer chịu trách nhiệm intake.
- **File liên quan:** `godot/art/candidate/combat/ngukhi_v1/**`, `godot/art/candidate/combat/ngukhi_v3/**`, `v3_assets/**`, `godot/scripts/combat/combat_player_animation_registry.gd`, `docs/ui/GODOT_COMBAT_NGU_KHI_PERSISTENT_ACTORS_20261007.md`, helper/readme untracked ở root.
- **Vấn đề và bằng chứng:** 34 file V1 untracked (idle + 10 skill); manifest root chỉ liệt kê 4/11; 4 V3 PNG xuất hiện ở hai vị trí; 3 helper/readme untracked; sibling asset stores có bản trùng; `1000020031.mp4` được manifest tham chiếu nhưng vắng trong bounded scan.
- **Hành động:** Lập provenance/rights matrix; đối chiếu registry → JSON/TRES/atlas; bổ sung hash/size/source/license/state cho idle và 10 skill; phân loại từng V3 PNG là archive/reference/runtime; giữ nguyên bản trùng; tìm nguồn video trong các vị trí được phép hoặc ghi rõ missing trong provenance. Không xóa/di chuyển asset gốc.
- **Phụ thuộc:** Chủ dự án xác nhận quyền dùng/provenance và việc nào được đưa vào Git; access tới đúng nguồn video nếu cần.
- **Ưu tiên:** R2 / P1 trước khi asset package được phát hành.
- **Tiêu chí nghiệm thu:** 11/11 clip khớp registry, resource ID và atlas; manifest có checksum/provenance/license; import không báo missing; report nêu rõ V3 retired/candidate; exact untracked list được bảo toàn; không có source/save/runtime gameplay diff.
- **Test/gate bắt buộc:** Godot 4.7.2 import + parse; targeted asset/registry validation; Stagehand showcase/runtime capture; xác minh `git diff --stat` chỉ asset/manifest/docs được duyệt.
- **Rủi ro asset/save:** Không upload asset có quyền phân phối chưa rõ; không xóa duplicate; không dùng/chỉnh save thật; không package `.runtime` hoặc `.tmp`.
- **Quyết định người dùng:** Chọn V1, V3, hoặc cả hai vào repository; xác nhận art licensing/provenance; quyết định xử lý nguồn `1000020031.mp4`.

## R3-ENDGAME — High-realm, Boss combat hoàn chỉnh và aftermath

- **Mục tiêu:** Kiểm chứng high-realm gameplay, Boss, resource/skill/Merge/Ultimate, defeat/victory result và state reset bằng cơ chế QA được repo hỗ trợ.
- **Module owner:** Core Runtime / Progression / World Activities / QA; Godot presentation chịu trách nhiệm capture.
- **File liên quan:** `godot/backend/bridge_p2_fixture_smoke.mjs`, `godot/tests/stagehand/combat_visual_capture.json`, `godot/tests/stagehand/combat_runtime_smoke.json`, `qa/tests/v129-endgame-continuity-structural-test.js`, `qa/tests/v171-endgame-runtime-authority-test.js`, bridge/fixture setup do repo chỉ định.
- **Vấn đề và bằng chứng:** Canonical combat QA hiện là Luyện Khí, Phàm Vực tầng 1; test chờ HP giảm rồi assert chưa có result sớm. Không có Godot playable high-realm save fixture được chỉ định. Node structural tests hiện có không phải UI/endgame session. Boss caption ở prefight khác playback.
- **Hành động:** Trước hết tìm fixture/setup chính thức; nếu repo hỗ trợ tạo QA-only state, tạo bản mới trong clone/test profile và lưu rõ provenance; nếu không, yêu cầu owner cung cấp/duyệt fixture. Assert current boss/map/HP, skill events, resource source count, Merge flag, Ultimate, boss defeat/result, reward settlement/reset và save isolation.
- **Phụ thuộc:** Một QA fixture/high-realm state được phép; canonical bridge hoạt động; Godot 4.7.2 và Node toolchain pin.
- **Ưu tiên:** R3 / P1 cho verification playability; hiện `BLOCKED — NO AUTHORIZED TEST STATE` đối với high-realm/result.
- **Tiêu chí nghiệm thu:** Không dùng save thật; repeatable QA setup; end-to-end trace khớp backend event; result UI và reward/reset assertion pass; boss identity nhất quán; test state bị giới hạn trong profile clone.
- **Test/gate bắt buộc:** Targeted Node authority tests; P2 fixture smoke; Stagehand combat scenario có victory/defeat; Godot full local gate sau bất kỳ client thay đổi nào; lặp lại persistence/restart chỉ trên clone.
- **Rủi ro asset/save:** Tuyệt đối không sao chép/ghi lên player save; không hạ HP hoặc sửa backend để ép result; không công bố save fixture nếu có dữ liệu người chơi.
- **Quyết định người dùng:** Nếu fixture hợp lệ không tồn tại, owner duyệt cơ chế tạo test state QA; owner duyệt phạm vi high-realm content cần thử.

## R4-VISUAL — Review visual thật, HUD overlap và baked aura

- **Mục tiêu:** Đánh giá Home/Character/Combat/Ngự Khí trên runtime capture/video có quyền sử dụng; giảm occlusion và xử lý art direction sau owner review.
- **Module owner:** Presentation / Combat UI-UX / art pipeline.
- **File liên quan:** `godot/scripts/combat/combat_screen.gd`, ArtifactActor/ArtifactActorGroup/ArtifactCombatDirector files trong `godot/scripts/combat/`, registry `combat_player_animation_registry.gd`, approved/candidate art directories, Stagehand capture scenarios.
- **Vấn đề và bằng chứng:** Screenshot combat thật cho thấy player art che một phần player HUD; boss là outline nhạt; V1 có aura/vũ khí hồng baked-in lẫn với cyan/gold Khí Linh. Không có V3 runtime capture cùng điều kiện, không có video/FPS; không thể kết luận V1 đẹp hơn V3.
- **Hành động:** Tạo proposal A/B chỉ sau quyết định art direction; capture cùng canonical event, 390×844 và thêm 360×800/430×932 nếu hỗ trợ; dùng video capture đã có sẵn/được duyệt; giảm art occlusion, cải thiện silhouette, travel/impact clarity, camera/audio feedback chỉ trong presentation layer.
- **Phụ thuộc:** R2 provenance; R3 authorized fight fixture; quyền dùng/capture assets; quyết định owner về baked effects.
- **Ưu tiên:** R4 / P2.
- **Tiêu chí nghiệm thu:** Enemy, actor, hit direction và impact đọc được; player HP/resource không bị che; Merge/Ultimate có feedback; frame/video có nhãn runtime vs synthetic; owner duyệt snapshot trước visual lock.
- **Test/gate bắt buộc:** Godot 4.7.2 import/parse, Stagehand 390×844 screenshots, geometry checks và pixel validation; Android/device QA nếu yêu cầu mobile approval. Pixel PASS không thay visual approval.
- **Rủi ro asset/save:** Không thay asset chưa duyệt; không upload ảnh nếu quyền phân phối chưa rõ; không ghi save/gameplay data.
- **Quyết định người dùng:** Giữ, giảm hay tách aura/vũ khí V1; chọn baseline art; có cho dùng/công bố ảnh/video runtime không.

## R5-COMBAT-UI — 8 Dao widgets, feedback, telegraph và Auto UX

- **Mục tiêu:** Tiếp tục Combat UI/UX V1 trên các authority Dao đã khóa; hoàn thiện C4+ mà không tạo gameplay authority mới ở client.
- **Module owner:** Godot presentation / Combat UI-UX.
- **File liên quan:** `docs/systems/combat-ui/MODULE.md`, `godot/scripts/combat/combat_screen.gd`, các DaoWidget/skill rail/VFX scripts trong `godot/scripts/combat/`, tương ứng `godot/tests/stagehand/` và unit tests.
- **Vấn đề và bằng chứng:** GCombat-2/3, C1–C3 runtime pass nhưng visual candidate; C4 8 Dao widgets, C5 feedback, C6 enemy/boss telegraph, C7 Auto Combat UX, C8 prefight/detail, C9 VFX/camera/sound polish còn planned.
- **Hành động:** Thực hiện từng slice nhỏ; widget chỉ render DTO canonical; biểu đạt resource/skill readiness; tách telegraph, hit/impact, auto state, prefight details; giữ combat calculation ở JS backend; không suy luận quyền lực trong Godot.
- **Phụ thuộc:** R3 canonical combat fixture và R4 owner visual direction; backend/8 Dao contracts CLOSED/LOCKED.
- **Ưu tiên:** R5 / P2.
- **Tiêu chí nghiệm thu:** 8 Dao widget hiển thị đúng trạng thái authoritative; screen reader/readability test; no duplicate resource calculation/client state; screenshot runtime at 390×844; Home/Combat regression gate pass; user visual approval trước khi lock.
- **Test/gate bắt buộc:** Targeted GdUnit; Stagehand scenario per slice; full `KIEM_TRA_GAME.cmd` flow trong clone khi slice chạm runtime; no visual baseline change without explicit owner approval.
- **Rủi ro asset/save:** Asset mới chỉ sau review provenance; save compatibility không đổi; không retune Combat Backend V3 hoặc Dao coefficients.
- **Quyết định người dùng:** Duyệt mục tiêu UX/baseline từng slice; xác nhận widget nào ưu tiên; không tự kích hoạt balance work.

## R6-GAME-COMPLETION — Audit hệ phụ theo quyết định riêng

- **Mục tiêu:** Khi owner mở một scope riêng, audit toàn game và theo dõi whole-game closure mà không opportunistically thay đổi hệ đã khóa/deferred.
- **Module owner:** Per-system owner được chỉ định bởi chủ dự án; Recovery lead điều phối.
- **File liên quan:** `GAME_MASTER_MAP.md`, `CURRENT_CHECKPOINT.md`, `docs/systems/INDEX.md`, từng `docs/systems/*/MODULE.md`, module-specific contracts/tests/runtime sources.
- **Vấn đề và bằng chứng:** Equipment rework planned; Pháp Bảo/Chí Bảo collection deferred; Tri Kỷ/Linh Thú deferred; Công Pháp/Phân Thân/Luân Hồi/Dungeon/endgame có audit debt; global economy balance deferred. Đây không phải bằng chứng các hệ thống cần được kích hoạt ngay.
- **Hành động:** Chỉ chọn một module sau owner decision; trace live callers, IDs, save/migration contract, test manifest và acceptance criteria; đóng scope qua quy trình module; cập nhật checkpoint/master map sau nghiệm thu.
- **Phụ thuộc:** R3 runtime fixture khi module cần; owner quyết định scope; evidence và regression của module.
- **Ưu tiên:** R6 / P3; không ACTIVE trước quyết định.
- **Tiêu chí nghiệm thu:** Scope/authority rõ; legacy/save compatibility được giữ; test/closure evidence có SHA; cập nhật docs; module status chỉ đổi theo accepted closure.
- **Test/gate bắt buộc:** Module-specific regression + V140/feature closure workflow được repo chỉ định; không thay thế bằng visual screenshot; no full-game closure claim khi chỉ có scoped pass.
- **Rủi ro asset/save:** Bảo toàn saves/legacy IDs; không xóa code/asset có caller; không khôi phục Ngũ Hành Gem/Set authority; không cân bằng economy phụ trợ.
- **Quyết định người dùng:** Chọn module tiếp theo và mở scope cụ thể. Core Balance và mọi auxiliary rework tiếp tục DEFERRED cho tới quyết định riêng.

## Thứ tự thực hiện và trạng thái khóa

1. R1-HANDOFF: tài liệu-only handoff, xác minh remote commit.
2. R2-ASSET: preserve và provenance cho 45 WIP; không phát hành asset nếu chưa duyệt.
3. R3-ENDGAME: tìm fixture chính thức; nếu thiếu thì dừng ở `BLOCKED — NO AUTHORIZED TEST STATE`.
4. R4-VISUAL: owner review trước mọi art/HUD change.
5. R5-COMBAT-UI: C4–C9 theo slices, canonical DTO only.
6. R6-GAME-COMPLETION: chỉ từng hệ phụ sau quyết định owner.

Combat Backend V3, 8 Main Dao, canonical JS/save authority và Ngũ Hành equipment retirement phải giữ CLOSED/LOCKED. Core Balance, global economy balance, auxiliary rework và deferred collections không được đưa sang ACTIVE trong roadmap này.
