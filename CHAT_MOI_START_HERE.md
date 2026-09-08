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

- identity món: Slot + `equipmentRankIndex` + Enhancement + Affixes + optional SetId.
- legacy Grade/Quality/Tier/Gem/Đạo Văn không phải progression axis V142.
- +15 là cap V142.
- 50 mảnh cùng bậc → 1 món; 3 mảnh bậc dưới → 1 mảnh bậc trên; 3 món cùng slot+bậc → main +1 bậc.
- raw stat trang bị theo curve dài hạn/infinite; Chân Nguyên và utility không được nổ theo cùng raw curve.
- live V142 vẫn có 5 attire Set mang identity/name Metal/Wood/Water/Fire/Earth và 4 jewelry Sets; đây là Set/stat package đã khóa của V142, **không phải lý do để Linh Căn V145 phải dùng Ngũ Hành và không được biến món trang bị thành một elemental progression axis mới**.
- Tàn Ấn + Set Resonance là live.

### Công Pháp

- V127 là authority duy nhất: 29 realm stages × 9 archetypes = 261 Công Pháp, max Lv1000.
- V103/V119 manual mastery/equip/study/Hunt fragment/combat source đã retired.
- các save field cũ chỉ được tồn tại inert compatibility, không được tạo reward/progression/combat power.
- Battle Đạo V2 vẫn live và realm-driven.

## Việc tiếp theo đã được người dùng chọn: V145 — LINH CĂN REDESIGN

**Requirements reset ngày 2026-09-08:** thiết kế `Linh Căn × Ngũ Hành Closure` trước đây đã hủy. Không được phục hồi nó từ chat cũ, file lịch sử hoặc code legacy.

Không mặc định bất kỳ điều nào sau đây là yêu cầu V145:

- 5 Hành Kim/Mộc/Thủy/Hỏa/Thổ;
- skill `primaryRoot` là Linh Căn authority;
- Boss Ngũ Hành;
- cộng hưởng Linh Căn × Set Trang Bị;
- loot Hunt theo Hành;
- Hành Ấn / Element Seal làm cầu nối;
- `8 Bản Đạo × 5 Hành` hoặc Set 2/4/6 trong file thiết kế Linh Căn lịch sử.

Mục tiêu mới là audit live source, phân loại thứ gì giữ/migrate/retire/compatibility, rồi **chốt contract Linh Căn mới từ số 0 trước khi code gameplay V145**.

Contract mới phải làm rõ: sở hữu Linh Căn thế nào, progression, milestone/đột phá, effect, nguyên liệu, source/sink, Luân Hồi interaction nếu có, caps, UI và migration. Linh Căn chỉ nối CombatKernel nếu effect mới thực sự là combat effect.

Sau khi contract được chốt mới hoàn thiện backend + frontend + save + economy/source-sink + consumer + targeted QA + full canonical QA. Chỉ gọi V145 CLOSED sau khi full canonical QA SUCCESS.

## Working rule

Làm module-by-module, source-first. Khi chạm một hệ phải rà đủ backend + frontend + save + resource source/sink + consumer thật + tests. Không re-audit toàn game từ đầu và không mở lại các closure trước nếu V145 không thật sự cần integration change.
