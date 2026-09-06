# Combat HUD Architecture V3 — 2026-09-05

## Mục tiêu
Khóa kiến trúc bố cục combat mobile theo nguyên tắc: **world-space dành cho actor/FX; screen-space dành cho telemetry gameplay cần đọc ổn định**. Canonical visual gate là 390×844.

## Các vùng HUD cố định
1. **Z0 — Navigation/context:** thoát combat, tầng/khu vực, tài nguyên ngoài combat chỉ ở staging.
2. **Z1 — Boss Core HUD:** tên + HP + Phase + Phá Thế. Buff/debuff Boss nằm ngay dưới, tối đa 4 icon ưu tiên + `+N`.
3. **Z2 — Battlefield:** player, Boss, projectile, impact, damage/heal number, actor state FX. Không chứa card thông tin dài.
4. **Z3 — Player Core HUD:** tên + HP + CN. Buff/debuff player là icon/duration row cố định.
5. **Z4 — Dao/Ultimate resources:** meter riêng Bản Đạo + Tuyệt Kỹ nằm ngay trên Auto Skill timeline.
6. **Z5 — Auto Skill timeline:** toàn bộ skill thật đã load có thể xuất hiện; slot rỗng không hiện; icon là monitor cooldown/READY/proc, không phải manual cast.
7. **Z6 — Event ticker:** 1 dòng trong active combat; full log mở khi chạm.

## State contract
### Pre-fight
- Có player/Boss, Boss Core, Player Core, skill timeline preview, Dao/Ultimate meter và đúng 1 CTA `Khiêu Chiến Boss`.
- Không có combat ticker/secondary extension HUD.

### Active combat
- CTA biến mất hoàn toàn.
- Currency ngoài combat ẩn.
- Boss HP + Phá Thế + Phase luôn ổn định ở top HUD.
- Telegraph là strip mảnh dưới Boss HUD.
- Player HP/CN, status, Dao/Ultimate meter, skill timeline và ticker ở vùng đáy cố định.

### Field / Săn Ảo
- Dùng cùng grammar active combat, nhưng mode control Săn Ảo không được hiểu nhầm thành manual skill auto toggle.

## Information priority
### Tier 1 — luôn hiện khi relevant
Boss HP, Phá Thế, Phase, Player HP, CN, resource Bản Đạo, Ultimate gauge, auto-skill cooldown/rotation.

### Tier 2 — chỉ khi có
Telegraph, Thất Thế/Ổn Thế, shield, buff/debuff, Ấn/stack, counter window, phase mechanic.

### Tier 3 — detail/debug
Raw event, full log, damage breakdown, status detail, mechanic explanation.

## DEV Combat State Matrix
DEV `?dev=1` có state matrix presentation-only:
- Player: HP/CN đầy, low HP, Shield, 5 Buff, 5 Debuff, 50% Dao resource, Ultimate 100.
- Boss: Normal, Phá Thế 70, Thất Thế, Ổn Thế, Phase II, Phase III, cast thường, đại sát, 5 Debuff, Ấn 6 stack, counter window.
- Stress: Low HP + nhiều status + Phá Thế cao + Ultimate ready + P3 + đại sát cùng lúc.

Synthetic state không thay kết quả backend. `Đánh 1 trận` / `Replay trận cuối` vẫn dùng combat events production.

## Backend/UI truth đang được giữ
- Phá Thế lifecycle `pressure -> broken -> recovering -> ready`.
- CN snapshot từ CombatKernel cast event.
- Ultimate gauge và resource riêng 8 Đạo qua event bridge.
- Boss phase + counter-window từ combat events thật.
- Status actor tách khỏi boss mechanic intrinsic.

## Asset blocker còn lại
Background Mộc hiện tại có instructional text baked-in ở đầu ảnh. CSS đang crop/zoom để tránh lộ trong gameplay, nhưng production art về sau nên thay bằng background sạch chữ. Không cần render asset mới trước khi layout V3 được visual-verify trên thiết bị thật.

## QA
- `ui-combat-fixed-hud-v3-test.js`: 36/36 PASS.
- Backward/backend HUD R3 test: 59/59 PASS.
- Frontend FAST: 7/7 PASS.
- JS syntax PASS; CSS braces balanced.

## Visual gate còn thiếu
Cần screenshot/video thật ở 390×844 cho ít nhất:
1. Pre-fight Huyền Tiên với đủ skill.
2. Active combat normal.
3. Phá Thế 70 / Thất Thế.
4. Full HUD stress DEV.
5. Một Đạo có nhiều meter (Trận hoặc Kiếm) và một Đạo khác để xác nhận scale.
