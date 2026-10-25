# R3 — QA fixture endgame cô lập

## Fixture

Thêm `endgame-boss` vào allowlist `diagnosticFixture`, chỉ hoạt động nếu bridge bật cả `TUTIEN_GODOT_BRIDGE_DIAGNOSTIC=1` và `TUTIEN_GODOT_QA=1`. Fixture tạo fresh disposable state, gọi setup canonical Ngự Khí hiện có, dùng `applyRealmTransitionV140(..., 'diagnostic')` đến realm order 114, lấy floor bắt đầu canonical `21601`, rồi chọn qua `session.selectEndlessFloor`.

Fixture không sửa code gameplay, không gán thắng/thua, không tự cấp HP/damage/economy/resource và không ghi vào save thật. HTTP bridge chỉ ghi file được truyền qua `TUTIEN_GODOT_BRIDGE_SAVE`; mọi test cung cấp save dùng một lần trong clone C.

## Chứng cứ

- `bridge_p2_fixture_smoke.mjs`: PASS trên port 41931. Assert realm `114`, floor `21601`, `gradeId=boss`, Combat snapshot mode `playback`, battle duration > 0, `battle.end`, result/clear boolean, aftermath vẫn realm 114 và fixture marker đúng.
- Godot Stagehand visual candidate: 18/18 bước PASS trên Godot 4.7.2. F10 fixture vào route Combat, Challenge thực, event cursor cập nhật và screenshot prefight/playback xuất được ở 390×844.
- Full local gate kết quả cuối và commit SHA: [COMMIT_AND_GATES.md](COMMIT_AND_GATES.md).

## Giới hạn

Đây là test fixture xác định trong backend/desktop Godot clone. Nó không chứng minh mobile/Android, save upgrade thật, độ khó/cân bằng endgame, content lore, hay rằng test account của người chơi đạt realm này. Test chỉ kiểm tra battle được resolve theo CombatKernel V3; kết quả thắng hay thua do kernel quyết định, không ép thành PASS thắng Boss.
