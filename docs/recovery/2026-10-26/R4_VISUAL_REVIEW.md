# R4 — visual review Home / Character / Combat / Ngự Khí

## Evidence source

Sáu screenshot là Godot 4.7.2 thật, Stagehand 0.4.1, viewport 390×844. Danh mục, SHA-256 và trạng thái local-only: [EVIDENCE_INDEX.md](evidence/EVIDENCE_INDEX.md). Chúng không được commit vì game art hiện chưa có bằng chứng quyền phân phối.

## Findings và thay đổi presentation

1. **Home / Character:** các frame xác nhận Home và Character render trong build thật, character artwork hiện hữu và aura được bake trong hình. Chưa đánh giá quyền hay sửa art/aura.
2. **Combat / Ngự Khí:** Artifact/Ngự Khí DTO có 5 skill active, basic, ultimate, 3 nguồn Khí Linh; Stagehand xác nhận screen và playback hoạt động. Prefight player-art và nút Challenge không còn chồng lên nhau.
3. **Tactical lane:** trước khi sửa, banner telegraph/cast che lên thân nhân vật ở portrait. Đã chuyển lane sang phần phải-dưới của battlefield (`0.52, 0.585, 0.97, 0.665`); screenshot sau sửa không cắt silhouette player và vẫn nằm trên lower HUD. Thêm assertion hình học cho 4 portrait viewport.
4. **Boss identity:** tên Boss prefight và tên Boss playback khác nhau trong capture. Chưa tìm thấy đủ bằng chứng để kết luận label nào sai; cần đối chiếu encounter id/monster canonical trước khi sửa.
5. **Baked aura:** giữ nguyên. Không xóa aura hoặc tạo direction thay thế.

## Trạng thái phê duyệt

Ảnh hiện là visual candidate để chủ sở hữu xem. Không có baseline được phê duyệt; không gọi candidate là approved. Không thay đổi art direction, art/asset gốc, palette hoặc aura.
