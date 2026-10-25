# 06 — UI/UX visual audit

## Căn cứ

Tất cả ảnh runtime được chụp bằng Godot 4.7.2 ở 390×844. Nhóm `runtime/` là Home/Character/combat thật trong test clone; `ngukhi/debug-fixtures/` và `ngukhi/ten-skill-source-speed/` là debug showcase **tổng hợp cho presentation**, không gameplay authority. PNG V3 dưới `references/` là ảnh asset nguồn, không runtime. Pixel-validation PASS chỉ xác nhận khung có nội dung/kích thước hợp lệ, không xác nhận đẹp hay được duyệt.

| Mục | Bằng chứng và quan sát | Severity | Đánh giá |
|---|---|---|---|
| Visual identity | [Home](evidence/runtime/home-390x844.png), [Character](evidence/runtime/character-390x844.png): núi/sương, kiến trúc, meditating/standing character, khung ngọc và màu teal/gold tạo nhận diện tu tiên nhất quán | Thấp | Nhận diện rõ; đây là đánh giá snapshot, không phải visual approval |
| Home | Screenshot cho thấy realm, tiến độ tu vi, Đột Phá và điều hướng chính; Home smoke 50/50 và visual 9/9. Nhân vật chiếm phần lớn màn, progress bar dễ tìm | P2 | Chữ mô tả và nav phụ nhỏ/tương phản thấp; các lối Pháp Bảo/Linh Thú/Bản Đồ/Tông Môn đang dim/disabled theo smoke |
| Character | [Character runtime](evidence/runtime/character-390x844.png): art đứng lớn, slot trang bị hai bên, realm/stats/điểm tăng/Kho đồ/Thuộc Tính/Hồ Sơ đều hiện; route UI qua 5/5 | P2 | Tên slot và số liệu nhỏ; icon/slot chủ yếu là glyph tối, độ đọc nhanh trên máy nhỏ còn yếu. UI live nhưng screenshot không kiểm tra mọi nút/panel |
| Hunt/Boss prefight | [Prefight](evidence/runtime/combat-prefight-390x844.png): boss HP, cấp/label, khu vực/tầng, nút challenge, player HP/resource và skill rail đều hiện | P1 | Boss là silhouette outline mảnh, art player đè lên panel HP thấp; frame trước trận hiển thị tên boss khác playback. Không capture màn chọn Hunt/Bí Cảnh |
| Combat playback | [Playback](evidence/runtime/combat-playback-390x844.png): canonical event chạy, boss HP giảm; slot skill/auto và resource cập nhật; overlay hit/telegraph có mặt | P1 | Battlefield và hit feedback khó đọc ở thời điểm chụp; silhouette địch nhạt, character tràn xuống/che một phần HUD. Không có evidence đủ để đánh giá hit timing dài hạn |
| Ngự Khí actor | Idle/guard/merge/ultimate ở `ngukhi/debug-fixtures/`; đủ 10 skill ở `ngukhi/ten-skill-source-speed/`. 34/34 bước và completion banner chứng minh harness phát đủ các clip | P2 | Pháp bảo bay/actor chuyển pose thấy được. Aura và vũ khí hồng baked-in xung đột màu với các Khí Linh cyan/gold; figure/hiệu ứng che player strip; một số skill phụ kiện lấn đường nhìn của enemy. VFX contact-only không thay thế camera/audio feedback |
| Animation quality | 1 frame cho mỗi skill và trạng thái cố định; các banner tiến từ 01/10 đến 10/10 | — | **NOT SCORED** về độ mượt, frame pacing hay chuyển động tự nhiên: không có video/quay FPS. Không suy ra “mượt” từ ảnh |
| Aftermath/result | Không có capture hoặc assertion tới result | P1 evidence gap | Không thể kết luận giao diện thắng/thua, phần thưởng, reset actor hoặc vòng tiếp theo |
| Responsive | View chính 390×844; unit test có safe-area/390-width checks | P2 evidence gap | Chưa capture 360×800 hay 430×932; không kết luận responsive ở hai kích thước đó |

## V1 so với V3: chưa đủ căn cứ kết luận đẹp hơn

Tài liệu hiện hành ghi V3 full painted overlays đã retired khỏi runtime; runtime mới dùng persistent actors và V1 animation. Lượt này xác nhận được V1 route và đủ 10 clip trong **synthetic showcase**, đồng thời capture một trận canonical dùng Ngự Khí. V3 chỉ có 4 PNG candidate nguồn được lưu dưới `references/v3-candidate-art/`, không có capture Godot của V3 ở cùng scene, viewport, thời gian và gameplay event. Vì vậy kết luận đúng là **chưa thể xếp hạng visual V1/V3**. Tích hợp hiện tại tốt hơn về mặt kiến trúc/runtime evidence, nhưng V1 đang có xung đột baked-in đã thấy trực tiếp.

## Điểm UX theo góc người chơi

- Combat có thông tin chiến thuật hiện ra, nhưng quan hệ “ai ra chiêu → pháp bảo bay đâu → trúng ai” chưa đọc rõ trong ảnh thật.
- Internal Ngự Khí resource có ba nguồn/flag và kỹ năng trên HUD; screenshot debug minh họa cập nhật số khí. Đây không thay cho assert state gameplay ở cả merge enter/exit/defeat.
- Character art có sức hút thị giác và dễ nhận ra, nhưng stats/trang bị nhỏ khi thu về mobile viewport.
- Không có âm thanh/video/FPS được ghi nên phần nhịp chiến đấu, âm thanh impact, camera shake, độ mượt và hiệu năng dài hạn là **NOT REVIEWED**.

## Đề nghị xử lý

Ưu tiên xác nhận boss/HP ở prefight và playback, giảm occlusion ở player HP, tăng độ đọc enemy silhouette/impact, rồi mới xin duyệt visual. Xin chủ dự án quyết định có giữ baked-in aura/weapon V1 hay cần tách/bớt hiệu ứng. Không mở backend để giải quyết vấn đề hình ảnh.
