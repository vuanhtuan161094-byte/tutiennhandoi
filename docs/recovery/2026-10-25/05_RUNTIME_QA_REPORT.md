# 05 — Runtime QA report

## Môi trường và cách ly

- Codex chạy Local desktop trên Windows 10 x64 (build 19045); profile được quan sát là `C:\Users\Admin`. Godot **4.7.2.stable.official.ed1daf0bf**, Node 24.19.0, PowerShell và Git có sẵn; Godot không nằm trên PATH nên dùng binary 4.7.2 cụ thể, copy để chạy từ C:. Máy có 8 GB RAM/8 CPU, GPU Intel Iris Plus/OpenGL 3.3; RAM trống ban đầu khoảng 1.3 GB. Dung lượng trống ban đầu: C: ~16 GB, E: ~45.9 GB, D: ~136 GB; clone/cache/evidence ở C:, E: chỉ đọc.
- OBS/FFmpeg không có sẵn. Không cài phần mềm.
- Workspace thử nghiệm: `work/TND_RECOVERY_20261025/repo`; riêng toolchain, profile, temp, saves QA và outputs nằm dưới `work/TND_RECOVERY_20261025` hoặc `outputs/TND_RECOVERY_AUDIT_20261025` trên C:.
- Clone bắt đầu ở GitHub main SHA `0919d8ce287e12c1add0e22b3840d1a898a9021e`; đã overlay đúng diff E: hiện có để thử snapshot local (1 line-ending diff + 45 untracked). Không có `.git/objects/info/alternates`. User save không được sao chép/đọc; runtime QA dùng file save mới trong clone `artifacts/godot-tools`.
- Stagehand v0.4.1 (SHA-256 `38bcb425588756d50dec7eed97d4307b545ab635ec9183363fe7bf4eef4eb657`) và GdUnit4 v6.2.1 commit `08ffc7c65b61b1b2edd545616061a99973c13ce1` khớp lock. Godot console/GUI binary copy được hash với binary gốc.

## Câu lệnh và kết quả

**Working directory:** `work/TND_RECOVERY_20261025/repo`.<br>
**Lệnh gate:** `tools/godot/Verify-GodotLocal.ps1 -GodotBin <workspace>\toolchain\Godot_v4.7.2-stable_win64.exe` (tham số truyền dưới dạng literal path, profile/cache/save đã cách ly).<br>
**Kết quả/exit của verifier:** `0` — gate ghi `GODOT LOCAL VERIFICATION: PASS`; toàn bộ bước gọi child đều qua `Assert-Exit`, không phát sinh throw. Host shell session chạy bất đồng bộ nên exit code riêng của wrapper không được lưu lại. Log: [godot-local-gate-retry.log](evidence/reports/logs/godot-local-gate-retry.log).

| Bước | Kết quả mới | Bằng chứng |
|---|---|---|
| Godot version / import | PASS, import tới 100% | Gate log; Godot 4.7.2 |
| Parse | PASS; có warning UID fallback | `evidence/reports/logs/parse-check.log` |
| GdUnit4 | **92/92**, 20/20 suites; 0 error/failure/flaky/skipped/orphan | `evidence/reports/stagehand/gdunit-results.xml`; full gate log |
| Canonical bridge smoke | PASS; bridge v2 online, unlock/retreat/restart persistence assertion chạy | Full gate log |
| P2 QA fixture smoke | PASS; inventory, Ling Quang x2/x3/x4, ascend, tribulation preview; 9 inventory rows; blocker Vạn Đạo Thiên Mạc tầng 5 được giữ | Full gate log |
| Bounded Godot smoke | PASS | Full gate log |
| Stagehand Home runtime smoke | **50/50** | [home-runtime.json](evidence/reports/stagehand/home-runtime.json) |
| Stagehand Combat runtime smoke | **28/28** | [combat-runtime.json](evidence/reports/stagehand/combat-runtime.json) |
| Home visual capture | **9/9**, 390×844 | [home-visual.json](evidence/reports/stagehand/home-visual.json), PNG trong `evidence/runtime/` |
| Combat visual capture | **20/20**, 390×844; boss HP đổi, không có result sớm; pixel validation PASS | [combat-visual.json](evidence/reports/stagehand/combat-visual.json), `combat-pixel-validation.json` |
| Character capture bổ sung | **5/5**, 390×844 | [character-visual.json](evidence/reports/stagehand/character-visual.json) |
| Ngự Khí debug fixtures | **23/23** | [ngukhi-debug-showcase.json](evidence/reports/stagehand/ngukhi-debug-showcase.json) |
| Đủ 10 skill source-speed | **34/34**; 10/10 banner và frame; đến `HOÀN TẤT · IDLE + 10 SKILL` | [ngukhi-all-ten-source-speed.json](evidence/reports/stagehand/ngukhi-all-ten-source-speed.json) |

## Khởi động và chơi được tới đâu

Godot mở GUI thật ở 390×844. Home chạy, bridge hiển thị ONLINE; Stagehand mở Character; kịch bản combat nhấn F9 để nạp full loadout Ngự Khí từ QA bridge, xác nhận skill canonical ở slot 5, bấm Challenge, chờ canonical combat cursor và assert HP boss giảm trước khi chụp playback. Đây là gameplay playback thật đi qua bridge trong môi trường QA cách ly, không phải ảnh dựng.

**High-realm/endgame runtime: `BLOCKED — NO AUTHORIZED TEST STATE`.** Kịch bản Godot F9 mở bridge fixture Luyện Khí ở Phàm Vực tầng 1, không phải state endgame. Có Node structural tests như `qa/tests/v129-endgame-continuity-structural-test.js` và `qa/tests/v171-endgame-runtime-authority-test.js`, nhưng chúng không phải Godot UI/playable save fixture và không nằm trong các bước gate đã chạy. Không tìm thấy Godot endgame save fixture được chỉ định trong phạm vi test đã rà; không tạo hoặc chỉnh state để giả lập.

**Result/aftermath:** chưa xác minh. Kịch bản combat hiện tại chỉ chụp hit/playback rồi assert chưa có result sớm; boss còn khoảng 6.91K HP và scenario kết thúc trước defeat. Không sửa fixture hay save để ép result.

## Cảnh báo và nguyên nhân

- Lần gate đầu dừng trước test vì clone sạch thiếu dependency GdUnit ignored; bootstrap GitHub bị môi trường mạng chặn. Đã khôi phục bằng bản dependency đã pin sẵn trên E: sang clone, xác minh lock, rồi full gate pass. Không sửa project source.
- Godot log báo `Failed to read the root certificate store` trong bounded smoke. Điều này thuộc máy/runtime; smoke vẫn pass. Kiểm tra HTTPS bên ngoài chưa được xác minh.
- Godot báo `invalid UID uid://bsh5focu076g3`, fallback sang path `res://scripts/main/main.gd`; parse/import/runtime vẫn pass. Nên dọn UID khi có nhiệm vụ source riêng.
- Viewport pre-fight hiển thị `Thanh Nha Yeu Lang`, còn playback sau canonical challenge là `U Minh Xà`. Scenario không assert tên boss ở cả hai frame; ghi nhận như discrepancy cần điều tra, chưa đủ để kết luận backend sai.
- Gate kết thúc; mọi tiến trình do lượt audit tạo ở C: đã thoát. Hai tiến trình Godot cũ ở E: được để nguyên.

## Video, responsive, aftermath

Không có video; không có encoder quay video cài sẵn và policy yêu cầu không cài. Thay vào đó có chuỗi PNG kèm timestamp local/UTC+07 ở [EVIDENCE_TIMELINE.csv](evidence/EVIDENCE_TIMELINE.csv). 21 ảnh là capture Godot, bao gồm Home, Character, prefight, playback, idle 1/2/3, guard, merge, Đại Khí Linh, ultimate và đủ 10 skill frames. Result screen chưa capture. Không có PNG responsive riêng 360×800 hoặc 430×932. FPS/pacing dài hạn và độ mượt không được chấm bằng ảnh tĩnh.
