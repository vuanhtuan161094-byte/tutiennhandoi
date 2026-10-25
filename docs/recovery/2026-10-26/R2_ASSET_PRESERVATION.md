# R2 — bảo toàn WIP, provenance và asset runtime

## Kết quả kiểm kê

- Đã đối chiếu 45 file WIP được giữ trong clone C với inventory nguồn: 45/45 tồn tại, kích thước và SHA-256 khớp; tổng `51,293,254` byte.
- Có 11 clip metadata `.json`, 11 `.tres`, 11 atlas `.webp`; thêm root `manifest.json`, 8 PNG (4 candidate + 4 mirror), 2 `.cmd`, 1 `.txt`.
- 4 cặp PNG ở `godot/art/candidate/combat/ngukhi_v3/` và `v3_assets/` có cùng hash theo từng cặp; đó là mirror trùng byte, không phải 8 artwork độc lập.
- Rights/provenance nguồn: UNKNOWN. Không đưa WIP binaries, MP4, PNG, atlas, helper executable, save hay local secrets lên GitHub.

## 11 clip Ngự Khí

`basic`, `deploy`, `guard`, `idle`, `merge`, `recall`, `split`, `strike`, `suppress`, `sync`, `ultimate`.

Validator đọc JSON, kiểm tra schema `tutien-video-animation.v1`, source SHA đã khai báo, atlas SHA thật, frame rectangles, dimensions/grid, số frame và tham chiếu SpriteFrames `.tres`. Kết quả: 11 clip, 405 frame, 0 lỗi. Godot 4.7.2 tải thực tế đủ 11 `SpriteFrames`, đọc đúng atlas dimensions, phát hiện pixel nhìn thấy và pixel alpha trong mọi atlas.

Root manifest hiện liệt kê 4 clip (`split`, `merge`, `suppress`, `ultimate`), còn 7 clip WIP nằm ngoài manifest đó. Không tự sửa hoặc ghi đè root manifest ở vòng này.

## Provenance và quyền

File metadata khai báo source filename và source SHA cho từng clip. 11 file nguồn MP4 không thuộc bộ 45 file đã giữ. Một filename probe có giới hạn cho `1000020031.mp4` không tìm được match trong scope đã quét; việc này không chứng minh file không tồn tại ở nơi khác. Mười source còn lại cũng chưa được xác minh vị trí đầy đủ. Không có license/permission evidence trong repo.

Do đó status của mọi source/clip và 4 PNG candidate: `UNKNOWN`. Hash kiểm chứng tính toàn vẹn, không cấp quyền sử dụng hay phân phối.

## File/runtime gaps

- WIP là các clip hiệu ứng/ngự khí; không thay thế source character rig, idle/walk nhân vật hoặc Boss animation.
- 45 WIP chưa được owner duyệt, chưa allowlist vào renderer/gameplay production, và chưa được xác nhận platform/import performance trên Android.
- `MANIFEST_SHA256.csv` của R2 là metadata local-only. Không commit binaries khi quyền chưa rõ.

Chi tiết hash từng file: [R2_WIP_FILE_INVENTORY.csv](R2_WIP_FILE_INVENTORY.csv). Source/atlas mapping: [R2_NGUKHI_CLIP_PROVENANCE.csv](R2_NGUKHI_CLIP_PROVENANCE.csv). Runtime screenshots local-only: [Evidence index](evidence/EVIDENCE_INDEX.md).
