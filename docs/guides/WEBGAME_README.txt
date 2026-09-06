TU TIEN NHAN ROI - V129 STAT ARCHITECTURE V2 WIP
Version: 1.39.0-alpha.23.78

MOT CODEBASE, BA SURFACE:
1) Android / Termux: chay START_GAME_ANDROID.sh.
2) Windows desktop: double-click CHOI_WEB_GAME.cmd (hoac START_WEBGAME_WINDOWS.bat). Launcher dung Node.js lam local static server va tu mo trinh duyet. Khong can Python.
3) Linux/macOS/Termux: chay START_WEBGAME_LAN.sh, sau do mo dia chi launcher hien thi.
4) Web tren dien thoai: dien thoai va may host cung Wi-Fi, mo dia chi LAN do launcher/server cung cap. Hoac upload toan bo thu muc nay vao document-root cua mot static web host HTTPS.

LUU Y:
- Game la static web/PWA; gameplay API chay local trong browser qua standalone-runtime.js, khong can Node backend. Tren Windows, Node.js chi duoc dung de serve file qua localhost (giong launcher ban cu); Python khong can.
- Save nam trong trinh duyet cua tung origin. Khac domain/port se la save storage khac; dung Xuat save / Nhap save de chuyen.
- PWA co service worker. Sau khi update version, nen reload mot lan de cache shell moi active.
- Mobile web target: viewport 390-430 CSS px, touch-first, safe-area iPhone/Android.
- Desktop web target: 1280x720 tro len; combat giu cung logic va renderer, UI mo rong theo viewport.


V128 FUNCTIONAL CLOSURE:
- 6 Lục Đạo Phân Thân có Đạo Hạnh Lv1-50 và Phàm Ấn -> Ngũ Chuyển.
- 8 Đạo Văn authored chạy thật qua EquipmentPower -> CombatKernel.
- Ngũ Hành Ngọc Lv1-5 dùng Ngũ Hành Ngọc Phôi từ phân giải trang bị.
- Phù Trận Các nằm trong Luyện Khí/Động Phủ; dùng ProfessionEngine hiện hữu.
- Nhân Duyên hiển thị chi phí, cooldown, lý do khóa và delta quan hệ sau action.
- Save schema vẫn là 44.


V127 PROGRESSION / CÔNG PHÁP / LUÂN HỒI PRODUCTION CLOSURE:
- Hoa Than -> Do Kiep: major breakthrough gan voi dungeon/mechanic da co; khong con chi du Tu Vi la qua.
- Nhan Tien -> Sang The Chu: stage dungeon first-clear + stat/refinement gate + 1 vat lieu hiem cua chinh stage khi qua dai canh gioi.
- Phan Than tiep tuc farm tang da first-clear; Main Body van la chu the mo tien do.
- PvE/PvP dung duy nhat CombatKernel V2. PvP khong gioi han tran; chi gioi han 5 tran thang/ngay nhan 8 Ngoc Khoa/tran.
- Gacha va hoat dong khong bi gioi han luot; gioi han nam o nguon thuong.
- Chi Nam production da phu toan duong Pham -> Sang The Chu.
- Save schema canonical V127 la 44; save V126/legacy duoc migrate khi load.
- Tu Vi commit 15 giay; 261 Cong Phap = 29 dai canh × 9 bo × 1000 tang.
- Hai Cay Luan Hoi co 29 nhanh × 50 cap, tong 1.578.620 diem.
- Phan Than hard-cap 6 Luc Dao; Ho Phap toi da 2 clone.
- Nhan Tien+ dung Dao Suy/Suy Kiep; offline cap chi gioi han reward, khong gioi han dong ho Tho Nguyen/Dao Suy.
