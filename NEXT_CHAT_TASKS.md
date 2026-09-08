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

## 2. NEXT: V145 — LINH CĂN REDESIGN / REQUIREMENTS RESET

### Quyết định mới nhất của người dùng — 2026-09-08

Thiết kế V145 `Linh Căn × Ngũ Hành Closure` trước đây **đã bị hủy**. Không được dùng lại các yêu cầu đó làm canonical.

Những yêu cầu đã hủy gồm:

- không bắt buộc Linh Căn phải là 5 Hành Kim/Mộc/Thủy/Hỏa/Thổ;
- không bắt buộc skill `primaryRoot` phải là authority của Linh Căn;
- không bắt buộc Linh Căn tương tác với Boss Ngũ Hành;
- không bắt buộc Linh Căn tương tác/cộng hưởng với Set Trang Bị Ngũ Hành;
- không tạo lại thuộc tính Hành cho món trang bị V142;
- không bắt buộc Hunt phải thả loot theo Hành;
- không dùng Hành Ấn / Element Seal làm cầu nối cho thiết kế mới;
- không dùng tài liệu lịch sử `Thiết kế hệ Linh Căn.txt` làm canonical nếu nội dung còn dựa trên `8 Bản Đạo × 5 Hành`, Set 2/4/6 hoặc Hành Ấn.

Các module/field cũ có chữ element/root/Hành vẫn phải được audit trước khi sửa/xóa để bảo vệ save và regression, nhưng **sự tồn tại của code cũ không tự biến nó thành yêu cầu sản phẩm mới**.

### Mục tiêu sản phẩm mới

Thiết kế lại Linh Căn từ số 0 thành một subsystem độc lập, dễ hiểu và có vòng gameplay hoàn chỉnh:

`Nhận/khởi tạo Linh Căn → phát triển → kiếm đúng tài nguyên → nâng/đột phá → nhận hiệu quả rõ ràng → tiếp tục vòng dài hạn`.

Hệ mới phải:

- có một authority player-facing duy nhất;
- có progression rõ và đủ dài cho idle game;
- có tác dụng thật, nhưng không được tạo một lớp stat trùng với Trang Bị/Công Pháp/Đạo;
- mỗi material/currency có source và sink thật;
- không tạo dead currency, dead button hoặc effect chỉ để hiện UI/Combat Power;
- save cũ phải migrate/compat an toàn;
- frontend phải nói rõ người chơi nâng cái gì, cần gì, kiếm ở đâu và được gì;
- chỉ nối CombatKernel khi effect được thiết kế là combat effect; không ép mọi Linh Căn phải thành elemental damage mechanic.

### Phase A — Forensic audit live source

Audit các file Linh Căn hiện hữu và toàn consumer của chúng, tối thiểu:

- `dist/core/spiritual-root-progression-v131.js`;
- `dist/core/root-origin-combat-v132.js`;
- `dist/core/spiritual-root-milestones-v133.js`;
- `dist/core/build-foundation-v113.js`;
- `dist/core/five-element-combat-v117.js`;
- `dist/core/element-seal-v133.js`;
- `dist/core/character.js`;
- `dist/core/combat.js`;
- `dist/core/hunt-real-combat-v130.js`;
- `dist/core/session.js`;
- `dist/core/client-shell.js`;
- `dist/core/game-api.js`;
- `app.js` / standalone transport / save migration / QA liên quan.

Kết quả phải phân loại từng lane thành:

- **KEEP AS BASE** — cơ chế còn phù hợp để tái sử dụng;
- **MIGRATE** — dữ liệu/save cần chuyển sang model mới;
- **RETIRE** — gameplay/UI/runtime cũ không còn phù hợp;
- **COMPATIBILITY ONLY** — giữ inert để không phá save.

Không xóa trước khi biết consumer.

### Phase B — Chốt contract Linh Căn mới trước khi code gameplay

Phải chốt rõ:

1. Linh Căn là gì trong game và người chơi sở hữu bao nhiêu;
2. cách khởi tạo/nhận Linh Căn;
3. trục progression chính;
4. các mốc biến chất/đột phá nếu có;
5. hiệu quả chính của Linh Căn;
6. tài nguyên nâng cấp và nguồn kiếm;
7. phần nào mất/giữ qua Luân Hồi nếu có;
8. giới hạn/cap để không phá các subsystem khác;
9. UI flow;
10. migration từ V131/V132/V133.

Không tự lấy “5 Hành” làm câu trả lời mặc định cho bất kỳ mục nào ở trên.

### Phase C — Economy / source authority

Lập matrix thật:

`Chức năng → nguyên liệu → nguồn kiếm → sink → consumer`.

Gate phải fail nếu:

- chức năng cần material nhưng material không kiếm được;
- material được mint nhưng không có sink;
- cùng một resource bị nhiều subsystem mint vô chủ đích;
- progression dùng field legacy không còn player-facing;
- UI bảo người chơi đi kiếm ở một nguồn nhưng backend không thật sự mint ở đó.

### Phase D — Backend + Combat integration

- Chỉ thêm CombatKernel consumer nếu contract mới có combat effect.
- Không tạo resolver riêng chỉ cho Hunt/Boss/PvP.
- Stat bounded phải tuân thủ cap hiện hành.
- Không dùng Trang Bị Set/Hành, Boss Hành hoặc `primaryRoot` làm dependency mặc định.
- Không thêm power chỉ vào Combat Power telemetry.

### Phase E — Frontend + save cleanup

- UI chỉ hiển thị Linh Căn model mới.
- Player phải thấy level/progress, cost, nguồn kiếm và benefit trước khi bấm nâng.
- Field V131/V132/V133 cũ được migrate hoặc để compatibility inert tùy audit.
- Hành Ấn/Element Seal chỉ được retire nếu audit xác nhận không còn consumer cần thiết; không phục hồi nó làm gameplay mới.

### Phase F — QA closure

Targeted V145 QA phải cover contract mới sau khi contract được chốt, tối thiểu:

1. create/migration/save compatibility;
2. progression và milestone;
3. source/sink mọi material;
4. effect consumer thật;
5. no duplicate legacy authority;
6. UI transport/action;
7. cap/balance invariants;
8. regression V140/V141/V142/V143/V144.

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

> Tiếp tục Game Tu Tiên Nhàn Dỗi từ GitHub branch `feature/v142-equipment-hunt`. Đọc `CHAT_MOI_START_HERE.md`, `CURRENT_CHECKPOINT.md`, `NEXT_CHAT_TASKS.md` trước. Dùng current branch HEAD làm source of truth. V140–V144 đã CLOSED. V145 cũ `Linh Căn × Ngũ Hành` đã bị hủy; đang làm lại Linh Căn từ số 0. Không tự nối Linh Căn với 5 Hành, `primaryRoot`, Boss Ngũ Hành, Set Trang Bị hoặc Hành Ấn. Audit live source trước, chốt contract mới rồi hoàn thiện backend + frontend + save + source/sink + effect consumer + QA. Không để chức năng có mà không có nguyên liệu hoặc nguyên liệu có mà không có sink. Không merge `main`.
