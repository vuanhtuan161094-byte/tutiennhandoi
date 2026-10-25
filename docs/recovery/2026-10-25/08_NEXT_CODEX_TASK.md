# 08 — Codex task tiếp theo đề xuất

## Tên

**Ngự Khí WIP intake + manifest completeness + visual acceptance prep**

## Mục tiêu

Đưa trạng thái Ngự Khí local-only thành một candidate có provenance và manifest đầy đủ trong workspace/branch cách ly, sau đó tạo bộ bằng chứng review để chủ dự án quyết định art. Đây là task chuẩn bị/visual, không mở lại gameplay.

## Prompt có thể dùng cho Codex

> Tiếp tục recovery Tu Tiên Nhàn Dỗi từ GitHub `main` SHA `0919d8ce287e12c1add0e22b3840d1a898a9021e` trong một branch/worktree riêng. Trước tiên inventory/compare 45 file WIP local: 34 V1 Ngự Khí (1 manifest + 11 JSON + 11 TRES + 11 atlas), 4 PNG candidate V3 trong `godot/art/candidate/combat/ngukhi_v3`, 4 PNG mirror trong `v3_assets`, cùng 3 README/script ở root. Không chỉnh source E: và không làm thao tác reset/clean/sync lên source gốc. Không thay backend, save, balance, fixture authority hoặc gameplay.
>
> Xác minh 11 IDs theo `godot/scripts/combat/combat_player_animation_registry.gd`; bổ sung/đề xuất manifest bao quát idle + 10 skill với SHA-256, kích thước, provenance, định dạng, runtime target. Giữ nguyên WIP và bản trùng. Xác minh vì sao 7 clip thiếu root-manifest entry và xử lý file nguồn `1000020031.mp4` được manifest trỏ tới nhưng không nằm trong bounded asset scan; không ghi “lost globally” nếu chưa tìm được toàn bộ nguồn.
>
> Chạy import/parse và targeted Stagehand Ngự Khí trên toolchain Godot 4.7.2/GdUnit4/Stagehand đã pin trong clone cách ly. Chụp 390×844 cùng canonical combat event và synthetic showcase; phân tách rõ gameplay proof với debug presentation. Đưa ra A/B visual proposal cho V1 baked-in aura/weapon và actor/HUD overlap; không tự chốt visual approval. Đảm bảo combat source/balance/save không đổi. Kết thúc bằng diff, checksum, test results, screenshots và câu hỏi owner cần quyết định. Không commit/push/PR cho tới khi quyền/provenance và phạm vi được xác nhận.

## Phạm vi và điều kiện hoàn tất

- **Ưu tiên:** P1 cho intake/manifest; P2 cho visual candidate.
- **Files:** candidate Ngự Khí manifests/assets, `combat_player_animation_registry.gd`, spec `docs/ui/GODOT_COMBAT_NGU_KHI_PERSISTENT_ACTORS_20261007.md`, test scenario Stagehand liên quan.
- **Dependencies:** owner xác nhận asset provenance/quyền dùng; pinned dependency tái lập được; fixture combat canonical.
- **Acceptance:** 11/11 clip có metadata/hash, registry → manifest → TRES/atlas khớp; no missing route; imported under 4.7.2; targeted gate pass; canonical gameplay capture và synthetic showcase có nhãn; diff không chạm JS gameplay/save/balance; owner có thể duyệt screenshot và danh sách asset trước bất kỳ merge/publish.
- **Cần quyết định:** (1) có đưa V1 và V3 candidate lên GitHub không; (2) V1 baked pink aura/weapon giữ, giảm hay thay; (3) video nguồn thiếu có thể bỏ khỏi provenance hay phải khôi phục.

Không bắt đầu bằng re-balance, không dọn asset trùng, và không coi pixel checks hoặc debug harness là visual approval.
