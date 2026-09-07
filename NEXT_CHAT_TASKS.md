# NEXT CHAT TASKS — GAME TU TIÊN NHÀN DỖI

**Date:** 2026-09-08  
**Canonical branch:** `feature/v142-equipment-hunt`  
**Gameplay/web version:** `1.40.0-alpha.24.0`

## 0. Quy tắc bắt buộc

1. Dùng **current branch HEAD** làm source of truth.
2. Đọc `CHAT_MOI_START_HERE.md` → `CURRENT_CHECKPOINT.md` → file này trước khi sửa.
3. Không dùng branch/handoff cũ `feature/reincarnation-cultivation-r3` làm canonical.
4. Không phục hồi mechanic đã retired chỉ vì test, save field, file lịch sử hoặc chat cũ còn nhắc tới.
5. Làm từng subsystem theo yêu cầu mới nhất của người dùng.
6. Mỗi subsystem phải rà đủ backend + frontend + save + resource source/sink + CombatKernel consumer + targeted QA.
7. Không merge `main` nếu người dùng chưa yêu cầu.
8. Không gọi CLOSED nếu canonical full QA chưa SUCCESS.

## 1. Baseline đã khóa — giữ nguyên

- V140 Tu Luyện: CLOSED.
- V141 Săn Yêu × Tu Luyện: CLOSED.
- V142 Trang Bị × Hunt: CLOSED.
- V143 reward authority + Set Resonance: CLOSED.
- V144 Công Pháp legacy retirement: CLOSED.
- Công Pháp V127 là manual progression duy nhất.
- Battle Đạo V2 vẫn live.

Chi tiết authoritative nằm trong `CURRENT_CHECKPOINT.md`.

## 2. NEXT: V145 — LINH CĂN × NGŨ HÀNH CLOSURE

### Mục tiêu sản phẩm

Biến Linh Căn thành một hệ progression có gameplay rõ, có nguồn nguyên liệu thật, có tác dụng combat thật và không chồng lane legacy.

### Phase A — Forensic audit live source

Tìm toàn bộ reference liên quan:

- Linh Căn / Spiritual Root;
- Kim, Mộc, Thủy, Hỏa, Thổ;
- `primaryRoot` / elemental damage identity;
- Hành Ấn / Element Seal và các field/runtime cũ còn sót;
- material Chất Hành / Căn Nguyên hoặc tên live tương ứng;
- Hunt drop/pity;
- stat provenance;
- UI/client snapshot/gameplay read model;
- save migration/compatibility.

Kết quả audit phải chia thành:

- **LIVE CANONICAL**;
- **COMPATIBILITY INERT**;
- **DUPLICATE/LEGACY TO RETIRE**.

Không xóa trước khi biết consumer.

### Phase B — Chốt một authority Linh Căn duy nhất

Yêu cầu tối thiểu:

- 5 Hành Kim/Mộc/Thủy/Hỏa/Thổ;
- progression rõ ràng, không thêm Grade/Star phụ nếu không cần;
- mỗi tài nguyên tiêu hao phải có ít nhất một nguồn kiếm live;
- nguồn Hunt phải là intentional elemental loot, không biến Hunt thành kho của mọi subsystem;
- source/sink cân xứng cho game dài hạn/infinite;
- không để dead currency hoặc nút không thể dùng.

### Phase C — CombatKernel integration

Linh Căn phải có effect thật trong shared CombatKernel:

- elemental affinity/damage/defense hoặc mechanic canonical được source xác nhận;
- tương tác với skill `primaryRoot`;
- tương tác với 5 Boss Ngũ Hành;
- tương tác với Set Trang Bị Ngũ Hành;
- không tạo PvP-only/Boss-only resolver riêng;
- utility stats phải bounded/soft-capped;
- raw infinite growth nếu có phải đi lane an toàn và không phá Chân Nguyên/CDR/Crit/Né/DR caps.

Không chấp nhận effect chỉ hiện trên UI hoặc chỉ tính trong Combat Power.

### Phase D — Economy / source authority

Lập matrix thực tế:

`Chức năng → nguyên liệu → nguồn kiếm → sink → consumer`

Gate phải fail nếu:

- chức năng cần material nhưng material không kiếm được;
- material được mint nhưng không có sink;
- Hunt mint nhầm resource đã có dungeon/source chuyên dụng;
- progression dùng một field legacy không còn player-facing.

### Phase E — UI + save cleanup

- UI chỉ hiển thị hệ Linh Căn live.
- xóa/ẩn Hành Ấn/Element Seal cũ nếu audit xác nhận duplicate retired.
- save field cũ có thể giữ inert nếu migration phá save, nhưng không được tạo sức mạnh/reward/progression.
- gameplay read model không import mutation authority chỉ để render.

### Phase F — QA closure

Tạo targeted V145 test tối thiểu cho:

1. 5 Hành + progression authority;
2. source/sink nguyên liệu;
3. Hunt elemental drop/pity;
4. no duplicate legacy lane;
5. CombatKernel live consumer;
6. Set × Linh Căn × Boss interaction;
7. save compatibility;
8. UI transport;
9. stat caps/soft-cap;
10. regression V140/V141/V142/V143/V144.

Sau targeted PASS, chạy `.github/workflows/v140-ci.yml` full canonical gate. Chỉ khi full SUCCESS mới ghi V145 CLOSED vào `CURRENT_CHECKPOINT.md`.

## 3. Sau V145

Nếu không có yêu cầu chen ngang, thứ tự đề xuất:

- V146 Đan Dược;
- V147 Linh Thú;
- V148 Tri Kỷ;
- V149 Pháp Bảo;
- V150 Luân Hồi Production Closure;
- V151 Economy/source-authority toàn game;
- sau đó mới khóa backend gameplay lớn và chuyển mạnh sang UI/UX production.

Đây là thứ tự đề xuất, không được tự làm sang module kế tiếp trước khi người dùng đồng ý hoặc V145 đã đóng.

## 4. Câu mở đầu để người dùng paste vào chat mới

> Tiếp tục Game Tu Tiên Nhàn Dỗi từ GitHub branch `feature/v142-equipment-hunt`. Đọc `CHAT_MOI_START_HERE.md`, `CURRENT_CHECKPOINT.md`, `NEXT_CHAT_TASKS.md` trước. Dùng current branch HEAD làm source of truth, không dùng handoff/chat cũ nếu mâu thuẫn. V140–V144 đã CLOSED; không re-audit lại trừ khi V145 cần integration. Bắt đầu V145 — Linh Căn × Ngũ Hành closure: audit live source trước, rồi hoàn thiện authority, progression, nguyên liệu/source-sink, CombatKernel, UI/save và QA. Không được để chức năng có mà không có nguyên liệu hoặc nguyên liệu có mà không có sink. Không merge `main`.
