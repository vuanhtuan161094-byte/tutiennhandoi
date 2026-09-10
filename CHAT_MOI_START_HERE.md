# CHAT MỚI — START HERE

Source of truth hiện tại là **current HEAD** của branch:

`feature/v159-economy-pacing-endgame-variety`

Đọc theo thứ tự:

1. `CHAT_MOI_START_HERE.md`
2. `CURRENT_CHECKPOINT.md`
3. `NEXT_CHAT_TASKS.md`
4. live source của subsystem/task đang làm

Không dùng chat cũ, file lịch sử, `main` hoặc branch cũ làm source of truth nếu mâu thuẫn current feature-branch HEAD.

## Trạng thái canonical

- Gameplay/web version: `1.40.0-alpha.24.0`.
- V140–V158: CLOSED / LOCKED.
- V159 Economy / Pacing / Endgame Variety: implementation đã có trên branch hiện tại; implementation HEAD `0e208ba126ecf9452116af7b7c4358f3363979a3` đã qua canonical QA run `34478194159` — SUCCESS.
- `main` vẫn cố ý chưa merge và đang ở `6c9f462efe6a87725d61845809e82474df6c58e9`.
- Không merge `main` nếu user chưa yêu cầu rõ.

## Canonical player loop đã khóa

`Tu Luyện → Farm → Nuôi Build → Công Phá → Luân Hồi`

Các invariant quan trọng:

- Tu Luyện commit Tu Vi theo tick 15 giây; Bế Quan quota 3 giờ/ngày theo canonical hiện tại.
- Săn Yêu không trực tiếp mint Tu Vi; Tu Luyện vẫn chạy độc lập khi farm.
- Specialized content dùng first-clear CombatKernel V2 rồi mới mở time-based farm.
- Công Pháp authority duy nhất tiếp tục tích lũy xuyên cảnh giới; không phục hồi legacy authority đã retire.
- Roster canonical: 8 Linh Thú, 8 Tri Kỷ, 12 Pháp Bảo, 8 Chí Bảo.
- Động Phủ có 8 facilities.
- Phân Thân production authority đúng 6 Lục Đạo.
- Độ Kiếp phải vượt gate Thiên Kiếp Cổ Trường trước khi Dẫn Thiên Kiếp.
- Sáng Thế Chủ là terminal major milestone; endgame tiếp tục qua Genesis Epoch, không bịa đại cảnh kế tiếp.

## V159 — nội dung đang canonical trên branch

V159 đo baseline pacing của toàn ladder và giảm tính lặp ở Immortal+ bằng 5 cadence identity:

`immortal-foundation → law-refinement → limit-break → cosmic-refinement → genesis-cycle`

V159 giữ 18 Immortal+ major stages với dungeon 5 tầng thật và nguồn tài nguyên thật; đồng thời nối các action endgame đã tồn tại vào gameplay/UI thật:

- manifestation;
- Phá Cực;
- Khai Kỷ Nguyên / Genesis Epoch.

UI dùng transport `/api/action` với `action:'perform'`, không tạo resolver/combat engine thứ hai.

## Quy tắc tiếp tục

1. Xác nhận current branch HEAD + canonical QA trước khi sửa.
2. Không mở lại V140–V158 nếu không có regression thật hoặc yêu cầu mới.
3. Không coi file handoff cũ là authority nếu khác current source.
4. Không tự đặt tên V160 hoặc tự thêm system mới; chờ ưu tiên tiếp theo của user.
5. Mọi task mới vẫn phải audit đủ backend/frontend/save/source-sink/consumer/QA khi có liên quan.
