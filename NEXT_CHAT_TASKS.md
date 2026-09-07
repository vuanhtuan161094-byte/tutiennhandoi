# NEXT CHAT TASKS — GAME TU TIÊN NHÀN DỖI

**Date:** 2026-09-07  
**Canonical branch:** `feature/reincarnation-cultivation-r3`  
**Gameplay/web version:** `1.40.0-alpha.24.0`

## 0. Quy tắc bắt buộc

1. Dùng **current branch HEAD** làm source of truth.
2. Đọc `CHAT_MOI_START_HERE.md` rồi `CURRENT_CHECKPOINT.md` trước.
3. Không dùng kế hoạch V141 cũ để kết luận Luân Hồi chưa được code; branch hiện tại đã có Luân Hồi V4 work.
4. Không phục hồi mechanic Tu Luyện đã bị V140 loại bỏ chỉ vì file/test cũ nhắc tới.
5. Làm từng chức năng theo yêu cầu mới nhất của người dùng; không tự vẽ sẵn hàng loạt nhánh/hệ chưa được thiết kế.
6. Khi sửa một hệ, kiểm tra consumer backend + frontend + save + economy/content + test liên quan.
7. Không merge `main` nếu người dùng chưa yêu cầu.

## 1. Tu Luyện V140 — CLOSED

Giữ nguyên canonical hiện tại:

- 118 realm orders.
- Phàm Nhân order 0 + 28 đại cảnh tu luyện Luyện Khí → Sáng Thế Chủ.
- tick 15 giây.
- auto tiểu cảnh.
- deterministic Thăng Cảnh / explicit Thiên Kiếp gate.
- Bế Quan +3h bank/ngày, cap 9h.

Không tái tạo pipeline cultivation cũ.

## 2. Luân Hồi V4 — CURRENT FEATURE WORK

Luân Hồi V4 đã có implementation trên branch. Khi người dùng tiếp tục phần này, đọc live source trước, đặc biệt:

- `dist/core/reincarnation-progression-v1102.js`
- `dist/core/reincarnation-fate-build-v4.js`
- `dist/core/life.js`
- `dist/core/session.js`
- `qa/tests/reincarnation-fate-build-v4-test.js`
- `qa/tests/reincarnation-v4-gameplay-balance-test.js`

Nguyên tắc hiện tại:

- xây theo từng module thực tế, không dựng trước 7 nhánh speculative;
- Mệnh Cách là lựa chọn build deterministic cho đời hiện tại, không gacha/reroll;
- RP là currency tiến triển/spend của Luân Hồi V4;
- exact values/formulas phải lấy từ source hiện tại, không lấy từ chat cũ nếu source đã thay đổi.

## 3. Săn Yêu × Tu Luyện V140 — CLOSED / KHÔNG RE-AUDIT

### Gameplay đã khóa

- 28 major maps.
- 800 tầng/major (`8 vực × 100`).
- mỗi tầng một Boss thật.
- Boss thắng → mở tầng kế → tầng vừa qua thành Săn Ảo.
- Boss thật dùng CombatKernel V2.
- Săn Ảo settlement dùng representative CombatKernel V2 để lấy TTK rồi aggregate batch O(1).
- preview Săn Ảo là telemetry nhẹ nhưng đã phản ánh generic Damage% hiện tại như Chiến Mệnh.
- Boss-only Damage% không tăng farm mob thường.
- Hunt không cấp Tu Vi trực tiếp.
- Tu Luyện V140 chạy 100% song song.
- reward chính: Linh Thạch, Yêu Đan/beast-core, trang bị và các Hunt loot hợp lệ đang có trong source.
- Tài Mệnh tác động Linh Thạch Săn Ảo thật.
- difficulty và reward không reset/regress ở biên 100 tầng.

### QA authority

`qa/tests/v141-hunt-cultivation-closure-test.js`

Hunt closure code checkpoint:

`0e93a012bfb8c580726744f854a8004b7358261b`

GitHub Actions run:

`34087108557` — PASS

Đã PASS:

- codebase health;
- V140 cultivation core;
- V140 cultivation transport;
- V140 zero legacy;
- V141 Hunt × Cultivation closure;
- backend fast;
- frontend fast;
- backend full closure;
- frontend full closure.

Không sửa lại Săn Yêu chỉ để “tối ưu thêm” nếu không có yêu cầu mới hoặc integration mới thực sự cần.

## 4. Việc tiếp theo trong chat mới

Không có một danh sách cứng phải làm tuần tự. Hỏi/đọc yêu cầu mới nhất của người dùng rồi tiếp tục đúng subsystem đó từ source thật.

Nếu người dùng muốn tiếp tục Luân Hồi/Mệnh Cách, làm tiếp V4 hiện tại. Nếu người dùng chuyển sang Linh Căn, Công Pháp, Đan, Pháp Bảo, Linh Thú, Economy... thì audit đúng subsystem đó và chỉ khi integration thực sự liên quan mới mở lại Hunt/Tu Luyện.

## 5. QA sau mỗi thay đổi

Tối thiểu chạy targeted test của subsystem + canonical V140/Hunt regressions liên quan. Workflow `.github/workflows/v140-ci.yml` hiện chạy trên `feature/**` và có full backend/frontend closure cho feature branches.

Câu mở đầu gợi ý cho chat mới:

> Tiếp tục Game Tu Tiên Nhàn Dỗi từ branch `feature/reincarnation-cultivation-r3`. Đọc `CHAT_MOI_START_HERE.md`, `CURRENT_CHECKPOINT.md`, `NEXT_CHAT_TASKS.md` trước. Săn Yêu × Tu Luyện V140 đã CLOSED/PASS; không audit lại trừ khi có integration mới. Dùng current branch HEAD làm source of truth và tiếp tục subsystem tôi yêu cầu tiếp theo.
