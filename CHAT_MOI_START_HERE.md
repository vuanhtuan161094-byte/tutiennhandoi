# CHAT MỚI — START HERE

Source of truth là **current HEAD** của branch:

`feature/v142-equipment-hunt`

Đọc theo thứ tự:

1. `CHAT_MOI_START_HERE.md`
2. `CURRENT_CHECKPOINT.md`
3. `NEXT_CHAT_TASKS.md`
4. live source của subsystem đang làm

Không dùng chat cũ, file lịch sử hoặc branch cũ làm source of truth nếu mâu thuẫn current branch HEAD.

## Trạng thái đã khóa

- Gameplay/web version: `1.40.0-alpha.24.0`.
- V140 Tu Luyện — CLOSED.
- V141 Săn Yêu × Tu Luyện — CLOSED.
- V142 Trang Bị × Hunt — CLOSED.
- V143 reward authority + Set Resonance — CLOSED.
- V144 legacy Công Pháp/Bí Thuật retirement — CLOSED.
- **V145 Linh Căn vô hạn + Căn Mạch + Căn Ngộ + combat core buff — CLOSED / canonical QA PASS.**
- V127 Công Pháp là manual progression duy nhất.
- Battle Đạo V2 vẫn live.
- **Không merge `main`** nếu user chưa yêu cầu.

V145 canonical full QA: run `34182230349` SUCCESS.

## V145 Linh Căn — phải nhớ đúng

- Chỉ có một progression Linh Căn canonical/character.
- Linh Căn **không phải Ngũ Hành**.
- Lv1 → ∞.
- Lv1–1000 dùng 10 band Phàm Căn → Cực Căn.
- Sau Lv1000 là `Vô Cực Căn · Chuyển N`, mỗi 100 Lv một Chuyển vô hạn.
- Mỗi 100 Lv có Tiến Cấp.
- Mỗi Tiến Cấp nhận 1 Điểm Căn Mạch + 1 Căn Ngộ.
- Căn Mạch: Tụ Linh / Chiến Linh / Huyền Thể / Linh Hải.
- Tu Vi + Công/HP/Phòng có diminishing unbounded growth.
- CDR/DR/Chân Nguyên/utility cap-sensitive phải bounded.
- Linh Tủy dùng để lên Lv thường và có source thật từ Săn Ảo.
- Bản Nguyên Linh Căn dùng cho Tiến Cấp và chia tier theo đại cảnh.
- **Chưa đạt đại cảnh N thì không được drop/mint/combine thành Bản Nguyên bậc N.**
- Boss First Clear và Săn Ảo chỉ cấp Bản Nguyên của tier đã được cảnh giới mở.
- Old five-element Linh Căn V131–V133 không còn player-facing combat authority; chỉ migration/compatibility nếu cần.
- Không nối V145 Linh Căn trở lại `primaryRoot`, Boss Ngũ Hành, Equipment Set hoặc Hành Ấn.

Chi tiết đầy đủ ở `CURRENT_CHECKPOINT.md`.

## Pháp Tắc / Lĩnh Vực — future, không phải V145

User đã định hướng:

- hệ **Pháp Tắc** tương lai sẽ xoay quanh Kim/Mộc/Thủy/Hỏa/Thổ và thuộc tính mở rộng như Băng, Lôi, Phong, Huyết, Độc, Ám, Quang, Hư Không...;
- **Lĩnh Vực** là subsystem chí cao tương ứng về sau.

Không tự code hai hệ này trong subsystem hiện tại nếu user chưa chọn.

## Invariant game vẫn giữ

- Tu Luyện: 15s tick, Săn Yêu không trực tiếp mint Tu Vi, Bế Quan bank canonical.
- Hunt: 28 major maps, 800 tầng/major realm, một Boss thật/tầng, cleared floor → Săn Ảo, shared CombatKernel V2.
- Trang Bị V142: Slot + Rank + Enhancement + Affixes + optional Set; +15 cap; elemental-named Sets không biến item/Linh Căn thành elemental progression.
- Công Pháp V127 là authority duy nhất; V103/V119 manual progression đã retired.
- Không để chức năng cần nguyên liệu mà không có nguồn; không mint nguyên liệu mà không có sink.

## Việc tiếp theo

Không tự bắt đầu module kế tiếp. Chờ yêu cầu mới nhất của user.

Roadmap đề xuất nếu user muốn đi tiếp tuần tự:

V146 Đan Dược → V147 Linh Thú → V148 Tri Kỷ → V149 Pháp Bảo → V150 Luân Hồi Production Closure → V151 Economy/source-authority toàn game.

Mỗi module: source-first → contract → backend/frontend/save/source-sink/consumer → targeted QA → full canonical QA.
