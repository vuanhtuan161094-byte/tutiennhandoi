# CHAT MỚI — START HERE

Source of truth là **current HEAD** của branch:

`feature/v142-equipment-hunt`

Đọc theo thứ tự:

1. `CHAT_MOI_START_HERE.md`
2. `CURRENT_CHECKPOINT.md`
3. `NEXT_CHAT_TASKS.md`
4. live source của subsystem đang làm

Không dùng branch `feature/reincarnation-cultivation-r3`, handoff V141 cũ, chat cũ hoặc file lịch sử làm source of truth nếu mâu thuẫn với current branch HEAD.

## Trạng thái đã khóa

- Gameplay/web version: `1.40.0-alpha.24.0`.
- V140 Tu Luyện: CLOSED / canonical.
- V141 Săn Yêu × Tu Luyện: CLOSED.
- V142 Trang Bị × Hunt: CLOSED.
- V143 Hunt reward authority + Set Resonance: CLOSED.
- V144 retirement Công Pháp/Bí Thuật legacy V103/V119: CLOSED / canonical QA PASS.
- Công Pháp V127 (`dist/core/manual-progression-v127.js`) là hệ Công Pháp progression duy nhất.
- Không merge `main` nếu người dùng chưa yêu cầu.

## Những invariant không được phá

### Tu Luyện

- 118 realm orders: Phàm Nhân + 28 đại cảnh Luyện Khí → Sáng Thế Chủ.
- tick 15 giây, auto tiểu cảnh, deterministic Thăng Cảnh / explicit Thiên Kiếp.
- Bế Quan +3h bank/ngày, cap 9h.
- Săn Yêu không cấp Tu Vi trực tiếp; Tu Luyện chạy song song 100%.
- Không phục hồi Căn Cơ/Tổn Căn, Kinh Mạch, Tạp Chất/Thanh Tịnh, absorption/backlog/refining cũ, five cultivation methods, Thiêu Thọ hoặc RNG đại cảnh cũ.

### Săn Yêu

- 28 major-realm maps.
- 8 Vực × 100 tầng = 800 tầng/đại cảnh.
- mỗi tầng 1 Boss thật; thắng mới mở tầng kế.
- tầng đã clear trở thành Săn Ảo.
- Boss thật + representative Săn Ảo TTK đều dựa trên CombatKernel V2.
- Combat Power chỉ telemetry, không tự quyết định thắng hoặc mint kill.
- minimum TTK 0.25s/kill.
- Boss/difficulty authority lấy trần Boss cao nhất rồi scale xuống; không bảo đảm người chơi cùng cảnh phải clear hết 800 tầng.

### Trang Bị

- identity: Slot + `equipmentRankIndex` + Enhancement + Affixes + optional SetId.
- legacy Grade/Quality/Tier/Gem/Đạo Văn không phải progression axis V142.
- +15 là cap V142.
- 50 mảnh cùng bậc → 1 món; 3 mảnh bậc dưới → 1 mảnh bậc trên; 3 món cùng slot+bậc → main +1 bậc.
- raw stat trang bị theo curve dài hạn/infinite; Chân Nguyên và utility không được nổ theo cùng raw curve.
- 5 Ngũ Hành attire Sets + 4 jewelry Sets; Tàn Ấn + Set Resonance là live.

### Công Pháp

- V127 là authority duy nhất: 29 realm stages × 9 archetypes = 261 Công Pháp, max Lv1000.
- V103/V119 manual mastery/equip/study/Hunt fragment/combat source đã retired.
- các save field cũ chỉ được tồn tại inert compatibility, không được tạo reward/progression/combat power.
- Battle Đạo V2 vẫn live và realm-driven.

## Việc tiếp theo đã được người dùng chọn: V145 — LINH CĂN × NGŨ HÀNH CLOSURE

Không hỏi lại hướng chung. Bắt đầu bằng audit live source của Linh Căn/Ngũ Hành rồi đóng thành **một authority duy nhất**.

Mục tiêu V145:

1. xác định chính xác những module/field/UI/runtime nào đang đại diện Linh Căn, Ngũ Hành, Hành Ấn/Element Seal hoặc hệ tương tự;
2. phân loại: live canonical / compatibility inert / duplicate legacy;
3. chốt progression 5 Hành Kim–Mộc–Thủy–Hỏa–Thổ và nguồn nguyên liệu thật;
4. giữ Hunt chỉ cho loot Linh Căn nào có chủ đích; không để chức năng có nhưng không có nguồn nguyên liệu;
5. nối stat/effect Linh Căn vào CombatKernel thật, không display-only;
6. kiểm tra elemental interaction với Battle Đạo, Set, Boss Ngũ Hành và skill `primaryRoot` hiện tại;
7. dùng cap/soft-cap hợp lý cho stat utility, không cho Linh Căn phá balance raw-stat/infinite progression;
8. dọn backend + frontend + save + economy/content + tests của lane legacy nếu trùng;
9. thêm targeted V145 QA rồi chạy canonical V140 workflow đầy đủ;
10. chỉ gọi V145 CLOSED sau khi full canonical QA SUCCESS.

## Working rule

Làm module-by-module, source-first. Khi chạm một hệ phải rà đủ backend + frontend + save + resource source/sink + CombatKernel consumer + tests. Không re-audit toàn game từ đầu và không mở lại các closure trước nếu V145 không thật sự cần integration change.
