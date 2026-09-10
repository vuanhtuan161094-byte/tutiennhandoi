# NEXT CHAT TASKS — GAME TU TIÊN NHÀN DỖI

**Date:** 2026-09-10  
**Canonical branch:** `feature/v159-economy-pacing-endgame-variety`  
**Gameplay/web version:** `1.40.0-alpha.24.0`

## 0. Quy tắc bắt buộc

1. Dùng current feature-branch HEAD làm source of truth.
2. Đọc `CHAT_MOI_START_HERE.md` → `CURRENT_CHECKPOINT.md` → file này trước khi sửa.
3. Không dùng `main`, branch cũ, chat cũ hoặc handoff cũ làm canonical nếu mâu thuẫn current HEAD.
4. Không phục hồi mechanic đã retired chỉ vì compatibility code/test cũ còn tồn tại.
5. Không merge `main` nếu user chưa yêu cầu rõ.
6. Không tự đặt tên V160 hoặc tự mở subsystem mới khi user chưa chọn ưu tiên.

## 1. Baseline đã khóa

V140–V158 CLOSED / LOCKED.

Mốc V158 cuối:
- branch `feature/v158-full-gameplay-integration`;
- exact HEAD `63f43800cabeca54c97ffa1c0d46d8558d0d9e6d`;
- canonical QA `34470829575` — SUCCESS.

## 2. V159 hiện tại

Branch: `feature/v159-economy-pacing-endgame-variety`.

Implementation HEAD trước đồng bộ tài liệu: `0e208ba126ecf9452116af7b7c4358f3363979a3`.
Canonical QA: `34478194159` — SUCCESS.

Branch V159 đang đúng 8 commit ahead V158, 0 behind.

V159 đã:

- tạo pacing ledger cho toàn progression 0→117 bằng target time canonical hiện có;
- giữ rõ đây là baseline Tu Vi budget, không phải lời hứa thời gian hoàn thành thực tế;
- xác nhận 18 Immortal+ major stage đều có dungeon 5 tầng + first-clear reward + time-based farm;
- chia nhịp Immortal+ thành 5 cadence identity thay vì một template refinement duy nhất;
- expose existing manifestation / Phá Cực / Genesis Epoch qua public gameplay dispatch;
- nối Phá Cực và Khai Kỷ Nguyên vào journey UI thật;
- giữ một shared gameplay/combat authority, không tạo CombatEngine/CombatKernel thứ hai;
- xác nhận player journey production through realm order 117 không còn provisional Immortal+ milestone.

## 3. QA gate hiện tại

Canonical run `34478194159` trên HEAD `0e208ba...` đã PASS toàn bộ:

- V140–V158 gates;
- V159 Economy pacing and endgame variety;
- Backend fast;
- Frontend fast;
- Backend closure;
- Frontend closure.

Sau commit đồng bộ tài liệu, phải kiểm tra canonical QA của exact new HEAD trước khi gọi V159 **CLOSED / LOCKED** chính thức.

## 4. Việc tiếp theo

Chưa có V160 canonical.

Không tự phát minh roadmap mới. Khi user yêu cầu tiếp tục, trước hết xác nhận exact current HEAD/QA rồi thực hiện đúng ưu tiên mới nhất của user.

Nếu tiếp tục theo mục tiêu gameplay hiện tại, các câu hỏi còn mở đáng audit gồm:

- pacing/economy thực tế có choke point hay trivialization ở đâu khi tính các accelerator thật;
- Trúc Cơ cần onboarding/hierarchy thế nào để không mở quá nhiều hệ một lúc;
- Immortal+ sau V159 đã có cadence khác nhau nhưng mức độ khác biệt gameplay thực chiến còn đủ hay chưa;
- technical debt compatibility cũ chỉ cleanup khi có task riêng, không hồi sinh mechanic legacy.
