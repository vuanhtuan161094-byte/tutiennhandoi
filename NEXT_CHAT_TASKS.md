# NEXT CHAT TASKS — GAME TU TIÊN NHÀN DỖI

**Date:** 2026-09-08  
**Canonical branch:** `feature/v142-equipment-hunt`  
**Gameplay/web version:** `1.40.0-alpha.24.0`

## 0. Quy tắc bắt buộc

1. Dùng current branch HEAD làm source of truth.
2. Đọc `CHAT_MOI_START_HERE.md` → `CURRENT_CHECKPOINT.md` → file này trước khi sửa.
3. Không dùng branch/handoff cũ làm canonical nếu mâu thuẫn current HEAD.
4. Không phục hồi mechanic đã retired chỉ vì old save/test/chat/file lịch sử còn nhắc tới.
5. Mỗi subsystem phải rà đủ backend + frontend + save + source/sink + consumer thật + targeted QA.
6. Không merge `main` nếu user chưa yêu cầu.
7. Không tự bắt đầu subsystem kế tiếp khi user chưa chọn.

## 1. Baseline đã khóa

- V140 Tu Luyện — CLOSED.
- V141 Săn Yêu × Tu Luyện — CLOSED.
- V142 Trang Bị × Hunt — CLOSED.
- V143 reward authority + Set Resonance — CLOSED.
- V144 legacy Công Pháp/Bí Thuật retirement — CLOSED.
- V145 Linh Căn vô hạn + Căn Mạch + Căn Ngộ + combat core buff — CLOSED.
- **V146 Đan Dược production closure — CLOSED.**

Canonical V146 closure source HEAD: `ddd2242c10c516be470dc21b879ea313b04b9ef0`.
Full canonical run: **`34224883992` — SUCCESS**.

## 2. V146 — không mở lại nếu không có regression thật

Canonical V146:

- authority player-facing: `alchemy.v146`;
- 11 họ Đan, 299 Đan Phương theo availability;
- 2 nguyên liệu Alchemy duy nhất: Linh Thảo + Yêu Đan theo đại cảnh;
- Dược Viên là source Linh Thảo;
- Săn Yêu/Săn Ảo là source Yêu Đan;
- realm-gating cứng cho material tier;
- Đan Đạo 9 bậc × 9 Chuyển;
- mastery theo 11 họ, max 1000;
- tối đa 4 lò;
- không research bằng alchemy essence, không Chuyên Tinh player-facing;
- V112 chỉ compatibility/migration, không production authority;
- migration deterministic/idempotent;
- Công Lực/Khí Huyết/Hộ Thể Đan là ba lane raw stat vĩnh viễn có quota đời;
- Tu Vi Đan exact-major, không ăn Tụ Linh V145;
- Trị Thương Đan không heal HP/CN combat;
- combat pill dùng shared buff authority, không resolver riêng.

## 3. Việc tiếp theo — chờ user chọn

Nếu user nói tiếp tục theo roadmap, module kế tiếp là:

### V147 — Linh Thú

Phải audit source-first và production closure theo cùng chuẩn:

- inventory/danh sách Linh Thú live hiện tại;
- progression level/star/bloodline hoặc mechanic tương đương đang thật sự tồn tại;
- nguồn Linh Thú và nguyên liệu nâng cấp;
- sink của mọi material/currency;
- stat passive lên nhân vật và trợ chiến active;
- consumer trong CombatKernel/shared combat path;
- save migration/legacy retirement nếu cần;
- API/action/read-model/UI path thật;
- offline/idle interaction nếu có;
- targeted QA + full canonical QA.

Không tự invent mechanic mới nếu source hiện tại đã có contract phù hợp; trước hết phải audit live authority và lỗ hổng source/sink/consumer.

Sau V147 roadmap đề xuất:

- V148 Tri Kỷ;
- V149 Pháp Bảo;
- V150 Luân Hồi Production Closure;
- V151 Economy/source-authority toàn game.

## 4. Pháp Tắc / Lĩnh Vực

Không code mặc định trong V147–V151 nếu user chưa chọn.

- Pháp Tắc tương lai sở hữu Ngũ Hành + Băng/Lôi/Phong/Huyết/Độc/Ám/Quang/Hư Không và combat identity/khắc chế/build interaction.
- Lĩnh Vực là subsystem chí cao sau đó.
- Không nhét elemental identity trở lại V145 Linh Căn.

## 5. Câu mở đầu cho chat mới

> Tiếp tục Game Tu Tiên Nhàn Dỗi từ GitHub branch `feature/v142-equipment-hunt`. Dùng current HEAD làm source of truth. V140–V146 đã CLOSED; V146 Đan Dược dùng `alchemy.v146`, chỉ có Linh Thảo + Yêu Đan làm nguyên liệu canonical. Không merge main. Chờ yêu cầu mới nhất của tôi rồi audit subsystem tiếp theo source-first, đủ backend/frontend/save/source-sink/consumer/QA.
