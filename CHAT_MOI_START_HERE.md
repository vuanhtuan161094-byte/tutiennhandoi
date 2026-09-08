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
- V143 Hunt reward authority + Set Resonance — CLOSED.
- V144 Công Pháp/Bí Thuật legacy retirement — CLOSED.
- V145 Linh Căn vô hạn + Căn Mạch + Căn Ngộ + combat core buff — CLOSED.
- **V146 Đan Dược production closure — CLOSED candidate / full canonical QA đã PASS trên code candidate; final HEAD phải tiếp tục giữ gate xanh.**
- V127 Công Pháp là manual progression duy nhất.
- Battle Đạo V2 vẫn live.
- **Không merge `main`** nếu user chưa yêu cầu.

V146 integration candidate QA: run `34224646763` SUCCESS, gồm V146 production closure + backend/frontend closure.

## V146 Đan Dược — phải nhớ đúng

Canonical player-facing Alchemy là `alchemy.v146`, không phải `alchemy.v1.12`.

### Nội dung

Có 11 họ Đan:

1. Tu Vi Đan
2. Trị Thương Đan
3. Công Lực Đan
4. Khí Huyết Đan
5. Hộ Thể Đan
6. Chiến Ý Đan
7. Kim Cương Đan
8. Tụ Nguyên Đan
9. Bạo Huyết Cấm Đan
10. Thọ Nguyên Đan
11. Tĩnh Suy Đan

Có 29 mốc recipe: Phàm Nhân + 28 đại cảnh. Tổng cộng **299 Đan Phương** theo availability thật.

### Chỉ 2 nguyên liệu Alchemy V146

- `Linh Thảo · <đại cảnh>`
  - source canonical: Dược Viên;
  - mỗi đại cảnh có 1 Linh Chủng khởi nguyên để không tạo deadlock “cần Linh Thảo mới trồng được Linh Thảo”;
  - sau đó 1 Linh Thảo dùng làm giống;
  - sản lượng Thành Thục/Lâu Năm/Cổ Linh = 4/5/7.
- `Yêu Đan · <đại cảnh>`
  - source canonical: Săn Yêu/Săn Ảo;
  - Săn Ảo deterministic O(1), có meter lưu phần dư;
  - 800 Boss First Clear/đại cảnh cho tổng 240 Yêu Đan đúng đại cảnh;
  - không mint trên đại cảnh nhân vật chưa đạt.

Không phục hồi lại Huyết Yêu Đan/Ngũ Hành Yêu Đan/ore/Thiên Tài Địa Bảo làm nguyên liệu Đan V146. Các material V111 cũ có thể vẫn tồn tại trong economy khác với sink riêng; chúng không còn là Alchemy authority.

### Đan Đạo / crafting

- Giữ nghề Đan Đạo 9 đại bậc × 9 Chuyển = 81 bước.
- Đan Phương **tự mở** khi đủ cảnh giới + Đan Đạo; không còn research/lĩnh ngộ bằng `resource.alchemy_essence`.
- Mastery dùng chung theo **11 họ Đan**, không tách 299 mastery.
- Mastery tối đa 1000.
- Không còn Specialization/Chuyên Tinh player-facing.
- Cực phẩm không bao giờ 100%; Mastery1000 + Đan Đạo cao có target quality 5% Hạ / 15% Trung / 50% Thượng / 30% Cực.
- Tối đa **4 lò**.
- Batch thường: 1/10/100; Bạo Huyết/Thọ Nguyên/Tĩnh Suy: 1/10.
- Craft mới chỉ tiêu `resource.alchemy.v146.herb.*` và `resource.alchemy.v146.demon_core.*`, chỉ tạo `resource.pill.alchemy.v146.*`.

### Đan bồi dưỡng vĩnh viễn

Ba họ sau tăng **raw stat vĩnh viễn qua Luân Hồi**:

- Công Lực Đan → Công;
- Khí Huyết Đan → HP;
- Hộ Thể Đan → Phòng.

Quota: tối đa **3 viên / họ / đại cảnh / mỗi đời**. Luân Hồi mở lại quota nhưng raw stat đã hấp thu không mất.

`daoPower`, `daoBody`, `daoDefense` đã retired khỏi production. Legacy pill của ba họ này chỉ là migration input sang ba họ live ở trên.

### Các invariant khác

- Tu Vi Đan: 10 viên/đại cảnh, exact-major V146, không ăn multiplier Tụ Linh V145.
- Trị Thương Đan chỉ giảm Thương Thế; không hồi HP/CN combat.
- Tĩnh Suy Đan chỉ có ý nghĩa từ Nhân Tiên trở lên; Suy Kiếp vẫn là mechanic chính.
- Thọ Nguyên Đan vẫn bounded theo lifespan cơ sở của đời.
- Combat buff/Cấm Đan dùng một active-buff authority; không tạo resolver combat riêng.

## V146 migration / compatibility

`dist/core/alchemy-v112.js` còn tồn tại vì save compatibility và một số helper cũ, **không còn là production/player-facing authority**.

V146 closure có:

- `dist/core/alchemy-v146.js` — canonical pill/material/effect contract;
- `dist/core/alchemy-hunt-v146.js` — Hunt → Yêu Đan;
- `dist/core/alchemy-production-v146.js` — Dược Viên/crafting/mastery/queue/migration;
- `dist/core/alchemy-session-bridge-v146.js` — compatibility facade cho method/action tên cũ;
- `modules/alchemy-v146-ui-bridge.js` — retire wording/lĩnh ngộ/Chuyên Tinh V112 trên UI;
- `qa/tests/v146-alchemy-core-test.js`;
- `qa/tests/v146-alchemy-source-runtime-test.js`;
- `qa/tests/v146-alchemy-closure-test.js`.

Legacy handling:

- mẻ V112 đang dở được hoàn nguyên nguyên liệu rồi queue cũ bị retire;
- Dược Viên V112 đang trồng được hoàn nguyên seed trước khi retire;
- `resource.alchemy_essence` được chuyển sang Linh Thảo V146 và bị xóa khỏi live research loop;
- pill V112 được map sang pill V146 khi có mapping an toàn;
- API/action name V112/V85 có thể còn vì compatibility, nhưng read-model/runtime canonical trả `alchemy.v146`.

## V145 Linh Căn — vẫn khóa

- Một Linh Căn/character, không phải Ngũ Hành.
- Lv1 → ∞; mỗi 100 Lv Tiến Cấp.
- Căn Mạch + Căn Ngộ.
- Tu Vi + Công/HP/Phòng là safe long-run lanes; utility cap-sensitive bounded.
- Linh Tủy và Bản Nguyên Linh Căn có source/sink, Bản Nguyên bị realm-gate cứng.
- Ngũ Hành/thuộc tính để dành cho Pháp Tắc tương lai; Lĩnh Vực là subsystem chí cao sau đó.

## Invariant toàn game

- Tu Luyện: 15s tick; Săn Yêu không trực tiếp mint Tu Vi; Bế Quan bank canonical.
- Hunt: 28 major maps, 800 tầng/major, một Boss thật/tầng, cleared floor → Săn Ảo, shared CombatKernel V2.
- Trang Bị: Slot + Rank + Enhancement + Affixes + optional Set; +15 cap; Set Resonance là sink dài hạn.
- Công Pháp: `dist/core/manual-progression-v127.js` là authority duy nhất.
- **Không để chức năng cần nguyên liệu mà không có nguồn; không mint nguyên liệu mà không có sink.**

## Việc tiếp theo

Không tự bắt đầu module kế tiếp nếu user chưa yêu cầu.

Roadmap hiện tại:

V147 Linh Thú → V148 Tri Kỷ → V149 Pháp Bảo → V150 Luân Hồi Production Closure → V151 Economy/source-authority toàn game.

Mỗi module: source-first → contract → backend/frontend/save/source-sink/consumer → targeted QA → full canonical QA.
