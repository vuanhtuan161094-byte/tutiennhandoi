# 02 — GitHub và local audit

## Repository và GitHub

- Repository: `vuanhtuan161094-byte/tutiennhandoi`, remote `origin` → `https://github.com/vuanhtuan161094-byte/tutiennhandoi.git`.
- Local `main`, `origin/main` và GitHub default `main` cùng SHA `0919d8ce287e12c1add0e22b3840d1a898a9021e`; local ahead/behind = 0/0.
- Commit mới nhất được quan sát trên `main`: 07/10/2026, `docs(godot-combat): record persistent artifact runtime proof and visual debt`.
- Pull request: không có PR mở hoặc đóng được trả về trong kết quả audit.

| Nhánh GitHub | HEAD | Quan hệ với main | Phân loại |
|---|---|---:|---|
| `main` | `0919d8ce` | hiện hành | Nhánh sản phẩm |
| `codex/visual-review-9014d4c` | `9014d4c` | ahead 0, behind 1316 | Nhánh review cũ; không có commit cần merge |
| `__invalid_should_not_create` | `3fb4af3` | ahead 0, behind 1193 | Nhánh cũ/thử nghiệm tên nhánh; không có commit cần merge |
| `__noop__` | `f603582` | ahead 0, behind 1149 | Nhánh cũ/no-op; không có commit cần merge |

Không nhánh nào có nội dung ahead so với `main`; không nhánh nào bị xóa.

## Source local E:

Thư mục xác minh: `E:\0. 1. tu tien nhan roi\tutiennhandoi-clean`.

```text
## main...origin/main
 M XEM_TOAN_BO_NGUKHI.cmd
?? CAI_NGUKHI_V3_VA_TEST.cmd
?? CAI_VA_KIEM_TRA_NGUKHI_COMBAT.cmd
?? README_NGUKHI_COMBAT.txt
?? godot/art/candidate/           (38 file untracked)
?? v3_assets/                     (4 file untracked)
```

- 45 file untracked: 34 file V1 (11 JSON, 11 TRES, 11 atlas WebP, 1 manifest), 4 PNG V3 trong `godot/art/candidate/combat/ngukhi_v3`, 4 bản PNG trùng trong `v3_assets`, và 3 file README/script ở root.
- `XEM_TOAN_BO_NGUKHI.cmd` khác Git chỉ ở CRLF/LF: `git diff --ignore-space-at-eol --quiet` exit 0; không phát hiện đổi logic.
- Không có file staged. Local branch không ahead. WIP chưa được tích hợp vào GitHub `main`.
- Registry `godot/scripts/combat/combat_player_animation_registry.gd` tham chiếu V1 idle + 10 skill. Root manifest V1 hiện chỉ ghi `ngukhi_split`, `ngukhi_merge`, `ngukhi_suppress`, `ngukhi_ultimate`; 7 clip còn lại thiếu entry manifest dù có JSON/TRES/atlas và route registry.
- V3 PNG ở hai vị trí có SHA khớp từng cặp. Docs hiện hành ghi V3 full painted overlays đã retired khỏi runtime; không xóa candidate.

## Dữ liệu ignored và save

- `.tmp`: 10,706 file, khoảng 692.7 MB; nhận diện là Chrome profile/cache, không đọc nội dung và không sao chép.
- `.godot`: khoảng 2,049 entry/211.6 MB cache; `.tools`: 877 file/78.5 MB; `qa`: 413 file/16.7 MB; `artifacts`: 389 file/67.6 MB; `.local-sync-backup`: 7 file/~29 KB. Các mục này không tracked; lịch sử test trong đó không được coi là bằng chứng mới.
- `godot/.runtime` (chỉ metadata): `godot-bridge-save.json` 48,261 byte (22/09 +07), `qa-fixture-save.json` 39,020 byte (17/10 +07; file timestamp 16/10 UTC), hai log bridge. Không đọc nội dung, không hash, không sao chép hay chạy trên save gốc.
- `NGUKHI_VFX_V3_CANDIDATE.zip` ignored, 4,695,016 byte, 6 entry; được giữ nguyên.

## Bản clone dùng cho QA

`work/TND_RECOVERY_20261025/repo` được clone từ GitHub `main` tại đúng SHA trên, sau đó overlay đúng 1 tracked line-ending diff và 45 file untracked từ E để kiểm tra snapshot local. Không dùng git alternates; test không ghi ngược về E. GdUnit4 là dependency local ignored ở source, vì vậy clone ban đầu thiếu nó; lần bootstrap tự tải v6.2.1 bị môi trường chặn mạng. Sau đó đã sao chép dependency đã pin từ E vào clone, xác minh tag/commit, rồi chạy lại full gate PASS. Điều này là rào cản tái lập **fresh clone offline**, không phải lỗi game runtime.

Hai tiến trình Godot có sẵn từ E: được quan sát trước khi chạy gate và được để nguyên. Chỉ Godot/Stagehand do audit mở trong clone C: được chạy; các tiến trình của lượt test đã tự kết thúc. Source E vẫn ở trạng thái Git như trước.

## Bảo toàn

Không chạy `CHOI_GAME.cmd`, `DONG_BO_VA_TEST_GAME.cmd` hay lệnh sync/reset trên E. Không có commit/push/PR, xóa file, đổi quyền, ghi save, cài phần mềm, hoặc dọn dữ liệu. Xem [03 asset inventory](03_ASSET_INVENTORY.csv) và [05 runtime QA](05_RUNTIME_QA_REPORT.md) để biết phạm vi/hash.
