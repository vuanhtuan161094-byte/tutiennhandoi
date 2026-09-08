# NEXT CHAT TASKS — GAME TU TIÊN NHÀN DỖI

**Date:** 2026-09-08  
**Canonical branch:** `feature/v142-equipment-hunt`  
**Gameplay/web version:** `1.40.0-alpha.24.0`

## 0. Quy tắc bắt buộc

1. Dùng **current branch HEAD** làm source of truth.
2. Đọc `CHAT_MOI_START_HERE.md` → `CURRENT_CHECKPOINT.md` → file này trước khi sửa.
3. Không dùng branch/handoff cũ làm canonical nếu mâu thuẫn current HEAD.
4. Không phục hồi mechanic đã retired chỉ vì old save/test/chat/file lịch sử còn nhắc tới.
5. Mỗi subsystem phải rà đủ backend + frontend + save + source/sink + consumer thật + targeted QA.
6. Không merge `main` nếu người dùng chưa yêu cầu.
7. Không tự bắt đầu subsystem kế tiếp khi người dùng chưa chọn.

## 1. Baseline đã khóa

- V140 Tu Luyện — CLOSED.
- V141 Săn Yêu × Tu Luyện — CLOSED.
- V142 Trang Bị × Hunt — CLOSED.
- V143 reward authority + Set Resonance — CLOSED.
- V144 legacy Công Pháp/Bí Thuật retirement — CLOSED.
- **V145 Linh Căn vô hạn + Căn Mạch + Căn Ngộ + combat core buff — CLOSED.**

Full V145 closure evidence nằm trong `CURRENT_CHECKPOINT.md`. Canonical run `34182230349` SUCCESS.

## 2. V145 — không mở lại nếu không có regression thật

Canonical V145:

- 1 Linh Căn/character;
- Lv1 → ∞;
- Lv1–1000: 10 band Phàm Căn → Cực Căn;
- >1000: `Vô Cực Căn · Chuyển N` vô hạn;
- mỗi 100 Lv Tiến Cấp → 1 Điểm Căn Mạch + 1 Căn Ngộ;
- Tu Vi + Công/HP/Phòng là các lane tăng dài hạn an toàn;
- utility cap-sensitive bounded;
- Linh Tủy = ordinary level-up resource;
- Bản Nguyên Linh Căn = Tiến Cấp resource, tiered theo đại cảnh;
- chưa lên đại cảnh N → không được drop/mint/combine ra Bản Nguyên bậc N;
- old five-element Linh Căn gameplay retired/migrated/compatibility-inert;
- Linh Căn không phụ thuộc `primaryRoot`, Boss element, Equipment Set hoặc Hành Ấn.

Ngũ Hành và các thuộc tính Băng/Lôi/Phong/Huyết/Độc/Ám/Quang/Hư Không được dành cho **Pháp Tắc** tương lai. **Lĩnh Vực** là hệ chí cao sau đó. Không nhét các hệ này trở lại V145.

## 3. Việc tiếp theo — chờ người dùng chọn

Nếu người dùng nói tiếp tục theo roadmap, đề xuất:

### V146 — Đan Dược

Audit source-first rồi production closure theo cùng tiêu chuẩn:

- gameplay loop thật;
- recipe/crafting/use progression rõ;
- nguyên liệu có source;
- mọi material/currency có sink;
- giới hạn sử dụng/buff rõ;
- không tạo Tu Vi/combat power trùng authority;
- save migration nếu có legacy;
- UI action path thật;
- targeted QA + full canonical QA.

Sau đó đề xuất:

- V147 Linh Thú;
- V148 Tri Kỷ;
- V149 Pháp Bảo;
- V150 Luân Hồi Production Closure;
- V151 Economy/source-authority toàn game.

Đây chỉ là roadmap đề xuất. Nếu user chọn hệ khác thì làm hệ user chọn.

## 4. Khi nào làm Pháp Tắc / Lĩnh Vực

Không code trong V146 mặc định.

Khi user chọn hệ chí cao:

- **Pháp Tắc** sở hữu Ngũ Hành + thuộc tính mở rộng và combat identity/khắc chế/build interaction.
- **Lĩnh Vực** mở ở progression chí cao tương ứng và dùng authority của hệ cao cấp đó.
- phải thiết kế mới source/sink/progression/caps trước khi code.

## 5. Câu mở đầu cho chat mới

> Tiếp tục Game Tu Tiên Nhàn Dỗi từ GitHub branch `feature/v142-equipment-hunt`. Đọc `CHAT_MOI_START_HERE.md`, `CURRENT_CHECKPOINT.md`, `NEXT_CHAT_TASKS.md`. Dùng current HEAD làm source of truth. V140–V145 đã CLOSED; V145 là Linh Căn vô hạn, không phải Ngũ Hành. Ngũ Hành/Băng/Lôi/Huyết/Ám... để dành cho Pháp Tắc tương lai, Lĩnh Vực ở progression chí cao. Không merge main. Chờ yêu cầu mới nhất của tôi rồi làm subsystem tiếp theo source-first, đủ backend/frontend/save/source-sink/consumer/QA.
