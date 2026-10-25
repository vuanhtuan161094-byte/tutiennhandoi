# 04 — Trạng thái hệ thống gameplay

Trạng thái dưới đây ghép `CURRENT_CHECKPOINT.md`, `GAME_MASTER_MAP.md`, module authority/live source và bằng chứng mới. `LIVE` không đồng nghĩa toàn game đã đóng; closure từng module và whole-game closure là hai việc khác nhau.

| Hệ thống | Trạng thái | Authority / bằng chứng | Phạm vi còn thiếu hoặc giới hạn |
|---|---|---|---|
| Core JS runtime, save, offline progression | CLOSED/LOCKED authority; các compatibility surfaces LIVE | Checkpoint V179; bridge v2 smoke xác nhận unlock, retreat bank, restart giữ Tu Vi; QA save cách ly | Không đọc save người chơi. Whole-game closure riêng |
| Tu Luyện, Cảnh Giới, Bế Quan, Đột Phá/Độ Kiếp | LIVE | Module progression; P2 QA fixture smoke cho ascend và tribulation preview, blocker vẫn còn đúng | Không review chuỗi progression endgame dài |
| Linh Căn | LIVE V145 | V145 là authority hiện tại; QA fixture smoke xác nhận route dữ liệu có sẵn | V131–V133 là LEGACY/FROZEN compatibility; không thiết kế lại |
| Luân Hồi / Mệnh Lộ / Mệnh Thai / Mệnh Cách | LIVE / mixed | Checkpoint quy định thuật ngữ, save keys và carry `spiritualRootV145` | Audit sâu continuity/nhánh mệnh trước khi redesign |
| Công Pháp / Tâm Pháp | LIVE / audit needed trước redesign | Module progression yêu cầu theo đường manual progression + combat consumer | Chưa chạy journey proof trong đợt này |
| Phân Thân | AUDIT NEEDED | Module progression yêu cầu trace caller trước redesign/removal | Không suy ra từ việc có source |
| Combat Backend V3 | CLOSED/LOCKED | Closure record exact runtime SHA `00f944feeebe99778beec0c1d727060e47dfc5ec`; 92-test gate mới pass | Không mở lại balance trong recovery |
| 8 Main Dao | CLOSED/LOCKED | Checkpoint và feature manifests; cả 8 feature IDs hiển thị `READY`; closures exact-SHA bên dưới | Đây là backend closure; không đồng nghĩa 8 UI widget/art đã hoàn tất |
| Character build / 5 stat chính | LIVE / REWORK PLANNED | CL, TP, TPH, LL, TT là 5 stat live và khóa | Trang bị có rework planned; authority combat của Ngũ Hành Gem/Set đã retired |
| Pháp Bảo / Chí Bảo collection | DEFERRED / REWORK PLANNED | Module character-build tách collection khỏi Ngự Khí Dao nội bộ | Không đưa collection thành resource Ngự Khí |
| Tri Kỷ / Linh Thú | DEFERRED / REWORK PLANNED | Module social-companion | Chưa là mục tiêu runtime của gate |
| Hunt / Săn Yêu, Boss | LIVE | Module world-activities; gate có canonical boss challenge và HP giảm sau khi bắt đầu playback | Chưa test hết hoạt động/chặng thưởng; high-realm Godot state và result/aftermath `BLOCKED — NO AUTHORIZED TEST STATE` |
| Bí Cảnh / Dungeon, Động Phủ, endgame continuity | LIVE / audit needed hoặc mixed | Module world-activities yêu cầu audit trước redesign | Chưa chạy route dungeon/endgame; không dùng làm lý do retune backend |
| Currency, inventory, alchemy, hunt settlement | LIVE / audit theo submodule | Module economy; P2 fixture smoke có inventory và settlement fixtures | Global economy balance DEFERRED, không chạy mô phỏng cân bằng |
| Home / Character presentation | LIVE; trước đây có visual approval/lock | Snapshot 390×844 mới: Home 9/9, Character 5/5 | Capture mới không tạo baseline hoặc approval mới |
| Combat presentation / UI | ACTIVE; visual candidate, NOT APPROVED | Godot gate Home 50/50, Combat 28/28; capture combat 20/20 + pixel checks | C4+ Dao widgets, feedback, boss telegraph, auto UX, VFX/camera/audio polish còn planned |
| Ngự Khí presentation | VISUAL CANDIDATE | Runtime implementation SHA `4f78097d0cb55a95a69040abbc8391475c0b2e90`; 3 persistent source actors/Great Artifact, Merge projection theo flag; V1 clips hiện chạy trong debug harness | Full 10-clip run là synthetic presentation, không chứng minh gameplay state machine end-to-end |

## 8 Main Dao: closure map

| Đạo | Trạng thái | Exact gameplay/closure SHA theo checkpoint | Nhận xét presentation từ audit |
|---|---|---|---|
| Kiếm | CLOSED/LOCKED | `edf479ff465c262d105020d96dc23a31ba7b66c1` | Có asset/registry combat chung; không review riêng đủ skill visual |
| Quyền | CLOSED/LOCKED | `7c8b777c7f5a527e8871ab783bc64a9add4e94dd` | UI còn cần 8 Dao widgets theo roadmap C4 |
| Thể | CLOSED/LOCKED | `dbb823404afbe7c82811a3b7700eacc12dd8d265` | UI còn cần 8 Dao widgets theo roadmap C4 |
| Thần Niệm | CLOSED/LOCKED | `d69b33c80b874fb28471855324afbdf95712b730` | UI còn cần 8 Dao widgets theo roadmap C4 |
| Pháp | CLOSED/LOCKED | `d1573bdf046a734c7493a4a3f45aaedc5faf4805` | UI còn cần 8 Dao widgets theo roadmap C4 |
| Độc | CLOSED/LOCKED | `f2da1808772ab2396f310d2082b0ff91fe55807f` | UI còn cần 8 Dao widgets theo roadmap C4 |
| Trận | CLOSED/LOCKED | `43f10efd1406ecde843808a4d8a8e5cc092097ba` | UI còn cần 8 Dao widgets theo roadmap C4 |
| Ngự Khí | CLOSED/LOCKED | `43f10efd1406ecde843808a4d8a8e5cc092097ba` | Internal resource Phân/Ngự/Hợp-Thu; V1 11 clip WIP local. Pháp Bảo/Chí Bảo collection vẫn là module riêng |

Các SHA closure thuộc lịch sử nghiệm thu đã ghi trong checkpoint; gate mới trong audit kiểm tra regression/runtime hiện tại, không tuyên bố tái-closure từng Dao hay mở Core Balance. Runtime presentation chưa đổi gameplay/save/balance authority. Combat backend và các Dao đang LOCKED; mở lại chỉ khi có regression chứng minh được hoặc chủ dự án chủ động yêu cầu.
