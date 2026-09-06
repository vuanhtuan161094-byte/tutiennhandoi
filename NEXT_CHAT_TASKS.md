# NEXT CHAT TASKS — GAME TU TIÊN NHÀN DỖI

**Canonical package:** `TU_TIEN_V140_CULTIVATION_V2_CLEAN`
**Version:** `1.40.0-alpha.24.0`
**Date:** 2026-09-06

## 0. Quy tắc bắt buộc khi mở chat mới

1. Dùng source trong ZIP này làm **source of truth duy nhất**.
2. Đọc theo thứ tự:
   - `CHAT_MOI_START_HERE.md`
   - `CURRENT_CHECKPOINT.md`
   - `V140_CULTIVATION_CLOSURE_REPORT.md`
   - `docs/CULTIVATION_V140_BALANCE.csv`
   - `docs/PROJECT_STRUCTURE.md`
3. Không phục hồi mechanic Tu Luyện V129 chỉ vì memory/chat/test/tài liệu cũ nhắc tới.
4. Không thêm một hệ mới chỉ để giải quyết một vấn đề mà hệ hiện tại đã có thể xử lý.
5. Khi sửa hệ nào: audit backend + frontend + save + content + economy + test cùng lúc; không sửa riêng UI.
6. Sau mỗi hệ phải có: source-of-truth rõ, zero-zombie scan, targeted test và regression liên quan.

## 1. A. Tu Luyện Cốt Lõi — CLOSED / KHÔNG THIẾT KẾ LẠI

V140 đã khóa:

- 118 tiểu cảnh / 29 đại cảnh tới Sáng Thế Chủ.
- Một nguồn canonical: `dist/core/cultivation-v140.js`.
- `Tu Vi nền -> target time -> required Tu Vi`.
- Base Tu Vi không giảm khi lên cảnh.
- Tự Tu commit số nguyên mỗi 15 giây.
- Tiểu cảnh tự thăng khi đầy Tu Vi.
- Đại cảnh dùng `Thăng Cảnh` deterministic.
- Orders 41–45 là cửa Thiên Kiếp riêng, không auto-skip.
- Bế Quan +3h bank/ngày, tối đa 9h; reward theo % requirement rồi quy ra số Tu Vi thực.
- Nguồn Tu Vi phải có provenance: base + flat cụ thể + % base hiếm.
- Thương Thế là trạng thái tổn thương cultivation duy nhất; không làm giảm Tự Tu, nhưng thương nặng có thể chặn Bế Quan/Thăng Cảnh.
- Thọ Nguyên / Đạo Suy giữ là life-cycle systems riêng.

Đã xóa khỏi production và **không được phục hồi**:

- Căn Cơ / Tổn Căn.
- Kinh Mạch cultivation.
- Tạp Chất / Độ Thanh Tịnh.
- Hấp Thu / Thông Lượng / Backlog / Luyện Hóa / Tinh Thuần pipeline.
- 5 phương thức Tu Luyện.
- Thiêu Thọ.
- Phá Cảnh RNG / Preparation / quality / failure engine.
- Phá Cảnh Đan.
- giảm Tu Vi requirement của cảnh giới.
- late-game realm catalyst.

Các từ "breakthrough" thuộc **Linh Căn / Pháp Bảo / Thể Chất** nếu là nâng phẩm riêng của hệ đó không đồng nghĩa với Phá Cảnh cảnh giới và không được xóa nhầm.

## 2. Việc tiếp theo — B. LUÂN HỒI

### Mục tiêu

Không code ngay. Trước tiên phải audit toàn bộ Luân Hồi trong source V140 để xác định hệ đang quá phức tạp, quá mỏng hay trùng vai trò với hệ khác.

### Audit phải trả lời đủ

1. Điều kiện kết thúc một đời / Tọa Hóa hiện tại.
2. Điều kiện first-clear hoặc các gate còn tồn tại.
3. Điểm Luân Hồi kiếm từ đâu, công thức bao nhiêu.
4. Cây Luân Hồi hiện có bao nhiêu node, từng node làm gì, cost curve thế nào.
5. Node nào vừa được V140 đổi khỏi Phá Cảnh/Kinh Mạch/Tạp Chất và consumer thật của chúng ở đâu.
6. Tiềm Năng vĩnh viễn còn tác dụng gì và có trùng với Tiềm Năng đời hiện tại không.
7. Mệnh Thai đời mới: roll/chọn gì, tác động gameplay thật ra sao.
8. Kế thừa qua đời mới: giữ gì, mất gì, phần nào gây snowball.
9. Vạn Thế / lịch sử các đời có gameplay hay chỉ read-model.
10. Luân Hồi tác động tới Tu Vi V140 bằng **flat hay % base**, budget tổng hiện tại bao nhiêu.
11. Luân Hồi tác động tới Thọ Nguyên / Đạo Suy / Thiên Kiếp / offline / Bế Quan ra sao.
12. UI Luân Hồi hiện cho người chơi quyết định gì thực sự.
13. Những field/node/reward nào tồn tại nhưng không có consumer.
14. Có hệ nào trùng với Công Pháp, Huyết Mạch, Thể Chất, Linh Căn, Mệnh Cách hoặc Thành Tựu không.

### Đầu ra thiết kế B

Làm theo đúng mẫu:

`HIỆN TRẠNG -> GAMEPLAY LOOP -> KEEP -> XÓA/GỘP -> CẢI TIẾN -> BALANCE -> UI -> FINAL DESIGN`

Mỗi mechanic phải được kết luận một trong:

- `KEEP`
- `DEEPEN`
- `SIMPLIFY`
- `MERGE/REMOVE`

Chỉ sau khi người dùng chốt B mới code.

## 3. Sau Luân Hồi

Tiếp tục audit từng hệ, không làm đồng thời nhiều hệ:

1. Nhân vật / các stat nền còn lại.
2. Đạo + kỹ năng.
3. Công Pháp.
4. Tâm Pháp.
5. Trang Bị.
6. Linh Căn / Ngũ Hành / Căn Nguyên.
7. Huyết Mạch.
8. Thể Chất.
9. Pháp Bảo / Chí Bảo.
10. Linh Thú.
11. Tri Kỷ.
12. Phân Thân.
13. Săn Yêu.
14. Boss / Phó Bản / Bí Cảnh.
15. Đan Dược / Dược Viên.
16. Động Phủ.
17. Economy / Phường Thị / Gacha.
18. PvP.
19. Tông Môn.
20. NPC / Nhân Duyên / Gia đình.
21. Thế giới / bản đồ / sự kiện.
22. UI/UX tổng thể sau khi gameplay systems ổn định hơn.

## 4. Quy tắc economy Tu Vi cho các hệ sau

Khi audit Công Pháp / Pháp Bảo / Linh Căn / Đan / Luân Hồi / hoạt động:

- Permanent bonus thông thường: **số Tu Vi cụ thể**.
- Designer có thể author số đó từ một % budget của Tu Vi nền target realm, nhưng player thấy số cụ thể.
- Flat bonus không tự scale theo cảnh giới hiện tại.
- % Tu Vi nền chỉ dành cho effect hiếm như tăng sao, set, milestone lớn, Chí Bảo hoặc Luân Hồi đặc biệt.
- Reward tức thời từ Đan/Event/Activity có thể author theo `TIME_EQUIVALENT` hoặc `% requirement`, sau đó runtime đổi ra số Tu Vi thực.
- Mỗi hệ phải có budget riêng để tổng nguồn Tu Vi không nổ theo số lượng hệ thống.

## 5. QA canonical hiện tại

Các gate V140 cần giữ xanh:

```bash
node qa/tests/v140-cultivation-core-test.js
node qa/tests/v140-cultivation-transport-test.js
node qa/tests/v140-zero-legacy-test.js
node qa/runners/v140-backend-gates.js fast
node qa/runners/v140-frontend-gates.js fast
node qa/runners/v140-backend-gates.js closure
node qa/runners/v140-frontend-gates.js closure
```

Closure đã ghi nhận tại thời điểm đóng gói:

- Cultivation core: 11/11 PASS.
- Transport/API: 4/4 PASS.
- Zero legacy: 4466/4466 PASS.
- Backend closure: 47/47 PASS.
- Frontend closure: 19/19 PASS.
- PvP balance: 8/8 PASS.
- ES-module syntax: 204/204 PASS.

## 6. Câu mở đầu đề nghị cho chat mới

> Tiếp tục Game Tu Tiên Nhàn Dỗi từ ZIP này. Đọc `CHAT_MOI_START_HERE.md`, `CURRENT_CHECKPOINT.md` và `NEXT_CHAT_TASKS.md` trước. V140 Tu Luyện V2 đã CLOSED, không phục hồi mechanic V129. Bây giờ audit chi tiết **B. Luân Hồi** từ source thật theo mẫu HIỆN TRẠNG → KEEP/XÓA/GỘP → CẢI TIẾN → FINAL DESIGN. Chưa code cho tới khi tôi chốt thiết kế.
