# TND Recovery long run — R2–R5

Ngày lập: 2026-10-26

Repo: `vuanhtuan161094-byte/tutiennhandoi`

Audit source baseline: `27545bcf5e24be495bb908658e7070c710f64cef`
Phạm vi: bảo toàn WIP, QA fixture endgame cô lập, review visual và audit combat UI. Đây không phải nghiệm thu owner.

## Tiếp quản nhanh

1. Đọc [run ledger](RUN_LEDGER.md), [quyết định và ranh giới](DECISIONS.md), rồi [roadmap chi tiết](07_ROADMAP_R2_R6.md).
2. R2: [báo cáo bảo toàn asset](R2_ASSET_PRESERVATION.md), [inventory 45 file](R2_WIP_FILE_INVENTORY.csv), [provenance 11 clip](R2_NGUKHI_CLIP_PROVENANCE.csv).
3. R3: [QA fixture realm 114 / Boss canonical](R3_ENDGAME_QA.md).
4. R4: [visual review](R4_VISUAL_REVIEW.md) và [evidence index](evidence/EVIDENCE_INDEX.md). Ảnh runtime là candidate chưa được owner duyệt.
5. R5: [combat UI và 8 Đạo](R5_COMBAT_UI_AUDIT.md).
6. R6: [backlog full-game closure](R6_BACKLOG.md).
7. Sau khi xem gates: [commit/gate report](COMMIT_AND_GATES.md).
8. Kiểm tra tính toàn vẹn tài liệu qua [manifest SHA-256](MANIFEST_SHA256.csv).

## Git handoff

- Tài liệu recovery đã được commit riêng lên `main` bằng fast-forward; remote ref được đọc lại sau push. SHA cuối cùng nằm trong câu trả lời bàn giao của phiên này.
- Code candidate nằm trên `codex/tnd-recovery-r2-r5-20261026`; không merge.
- Commit SHA đã kiểm chứng, remote HEAD sau handoff và link GitHub được ghi trong [commit/gate report](COMMIT_AND_GATES.md).
- Không stage/publish các asset nhị phân trong WIP. Quyền phân phối chưa xác minh.
- Không bật/chạy GitHub Actions. Các workflow được xác nhận là `workflow_dispatch`.

## Trạng thái

- R2 kiểm kê, hash và import QA: PASS trong clone C; quyền và nguồn clip: UNKNOWN.
- R3 QA fixture: PASS trong backend bridge cô lập và Godot Stagehand; đây không phải QA thiết bị người dùng.
- R4: visual candidate có screenshot thật; player silhouette đã được tách khỏi tactical lane bằng chỉnh layout hẹp; baseline vẫn NOT APPROVED.
- R5: mapping đủ tám phép chiếu và authority boundary đã kiểm; Auto toggle còn cần quyết định UX.
- R6: chỉ backlog/đề xuất, không có Core Balance hoặc auxiliary rework ACTIVE.

## Giới hạn clone cách ly

Mọi sửa đổi và kiểm thử Godot chạy trên clone độc lập ở C, với Node/Godot/Stagehand và save QA dùng một lần. Ổ E chỉ được đọc; các Godot/Node đang chạy trên E không bị đóng. Kết quả không xác nhận được cài đặt E, Android, quyền phân phối asset, chất lượng mọi thiết bị hay owner approval. Một lần chạy QA ban đầu vô tình chạm Node bridge ở E cổng 4192; health cho thấy `diagnosticMode=false` và `qaMode=false`, fixture bị từ chối, không có save nào đổi. Một lượt thử khác trên cổng 41930 dùng bridge state cũ và bị loại khỏi bằng chứng. Gate cuối dùng cổng cô lập mới 41945/41946.
