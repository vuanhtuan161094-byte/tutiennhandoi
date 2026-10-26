# Tử Mị Linh Chủ — Animation Pipeline Pilot

**Ngày:** 2026-10-26
**Trạng thái:** candidate pilot; chưa phải production approval
**Tested repository HEAD:** `56fb4ef70a97095fd7860c74ea76c1aba62da4bd`
**Viewport baseline:** Godot project viewport `390×844`

## Kết quả

Pilot A tạo một Cast loop từ Tử Mị Linh Chủ bằng các lớp PNG RGBA mới trong thư mục candidate. Bản trang phục hiện tại đã bỏ hai tà áo dài và các dải vải phụ; giữ thân áo gọn, váy chính có xẻ một bên và tay áo ngắn. Backplate, tay chuyển động, tinh thể và VFX nằm ở các lớp riêng. Một `AnimationPlayer` xoay tay tại vai; Godot xuất 12 frame PNG 320×480 ở 8 FPS, một atlas lossless WebP, `SpriteFrames`, GIF preview và AVI motion reference 3 giây.

Pilot **chưa đạt Cast gesture hoàn chỉnh**: tay vẫn mở trong toàn bộ loop, không có khớp khuỷu/cổ tay/ngón tay, chuyển động tay là một cung xoay vai. Vì vậy pha “kết ấn” mới chỉ được thể hiện bằng timing/VFX, chưa phải hình thế bàn tay. Đây là giới hạn đã biết, không được diễn giải thành animation chất lượng production.

Pilot B chưa chạy Wan2.2. Máy hiện tại không có ComfyUI, model weights, PyTorch/diffusers hay GPU runtime sẵn dùng. Để không ghi nhầm kết quả, ảnh B trong status sheet là **ảnh reference tĩnh của cùng thiết kế**, không phải video AI. Đã xuất AVI từ chính pilot A làm video chuyển động mẫu cho lần chạy trên máy GPU; AVI này cũng không phải kết quả Wan2.2.

## A — Rig 2D cutout

| Hạng mục | Kết quả |
|---|---|
| Nhân vật/ngoại hình | Tử Mị Linh Chủ, cùng mặt, tóc tím, pháp bảo và palette; bản candidate mới bỏ vạt áo dài |
| Layers | Backplate, một tay rời, cụm tinh thể, Cast VFX và treasure VFX riêng |
| Animation | 12 frame, 8 FPS, 1.5 giây; `AnimationPlayer` xoay một pivot vai và animate vị trí/phép xoay pháp bảo cùng energy VFX |
| Canvas/pivot | Frame 320×480; root và vùng chân cố định; frame bounds nằm trong canvas sau khi giảm scale |
| Godot resource | `cast_spriteframes.tres`; kiểm tra load, loop, 12 frame, 8 FPS và texture từng frame: PASS |
| Visual review | Chuyển động đọc được ở thumbnail; arm cutout chưa có khuỷu/cổ tay/ngón tay; một số chuyển pha còn cơ học |
| Budget tham khảo | Rig textures giải mã khoảng 11.3 MB RGBA; atlas giải mã khoảng 7.0 MiB; WebP atlas 151,094 bytes; GIF 281,502 bytes |

### Evidence

- [Runtime screenshot 390×844](../../../godot/art/candidate_r7v2/ngukhi_tumi_animation_pilot/evidence/runtime-a-390x844.png) — ảnh Godot thật, candidate.
- [12-frame contact sheet](../../../godot/art/candidate_r7v2/ngukhi_tumi_animation_pilot/evidence/cast-contact-sheet.png)
- [Loop preview GIF](../../../godot/art/candidate_r7v2/ngukhi_tumi_animation_pilot/evidence/cast-loop-preview.gif)
- [A/B status sheet 390×844](../../../godot/art/candidate_r7v2/ngukhi_tumi_animation_pilot/evidence/ab-status-layout-390x844.png) — B là reference tĩnh, không phải animation.
- [Godot motion-reference AVI](../../../godot/art/candidate_r7v2/ngukhi_tumi_animation_pilot/evidence/cast-motion-reference.avi) — 24 frame, 8 FPS, 3 giây; tạo từ A bằng Godot Movie Maker.
- [Metrics](../../../godot/art/candidate_r7v2/ngukhi_tumi_animation_pilot/metrics.json) and [SHA-256 manifest](../../../godot/art/candidate_r7v2/ngukhi_tumi_animation_pilot/SHA256SUMS.csv).
- [Layer manifest](../../../godot/art/candidate_r7v2/ngukhi_tumi_animation_pilot/layers/layer_manifest.json) records pixel dimensions, alpha counts, pivots and hashes.

All artwork and exports remain under `godot/art/candidate_r7v2/ngukhi_tumi_animation_pilot/`. No production character scene, gameplay, Combat V2/V3, renderer, save or production asset was changed by this pilot. Candidate artwork is generated/reference-guided raster work; it is not an editable PSD/ORA file and still needs art review for identity consistency, edge quality and licensing before promotion.

## B — Wan2.2 Animate

**Status: NOT RUN.** The available desktop has Godot 4.7.2 and bundled Python/Pillow, but no ComfyUI install, Wan2.2 14B weights, PyTorch/diffusers, `nvidia-smi`, or compatible local inference setup. No AI output is claimed. The Godot AVI above supplies a short Cast motion input for a future ComfyUI Move-mode experiment. See [WAN2_2_GPU_WORKFLOW.md](WAN2_2_GPU_WORKFLOW.md).

The AVI is a clean dark-stage animation of the current candidate A, not a human performer clip. Before inference, prepare the motion video at dimensions divisible by 16 and composite the transparent character reference on a neutral background if the workflow does not preserve alpha. Treat generated video as opaque until a real alpha/mask extraction is verified.

## Verification

- Godot 4.7.2 headless Movie Maker: **PASS**, 24 MJPEG frames at 390×844, 8 FPS, 3.0 seconds.
- AVI decoder check: **PASS**, all 24 JPEG payloads decode at 390×844.
- SpriteFrames check: **PASS**, animation `cast`, 12 textures, 8 FPS, looping.
- Pilot runtime capture: **PASS**, real Godot viewport screenshot and all 12 frame PNGs saved without clipping; static body foot baseline is identical at `y=419` in every export.
- Repository `KIEM_TRA_GAME.cmd` gate: **PASS**, GdUnit 105/105; bridge, isolated QA, bounded runtime, and Stagehand visual capture passed. The approved Home baseline remains **NOT APPROVED**. Godot emitted environment warnings about root certificate access and `user://logs`; they did not fail the gate.
- The first direct gate invocation failed before tests because its PowerShell process lacked `PSModulePath`; the repository wrapper/PowerShell 7 invocation was used, and the full gate then passed.

## Known limits and decision

This pilot validates that the current toolchain can produce a real, loadable Godot frame sequence and reusable `SpriteFrames` resource. It does not prove 10-skill scalability, final outfit approval, full-body deformation, semantic hand poses, combat hit timing, or Wan2.2 quality. Keep the candidate isolated. Do not promote or use it to replace Source A until the hand-pose gap, silhouette review and identity/art approval are closed.

Detailed references are in [RESEARCH_MATRIX.md](RESEARCH_MATRIX.md). The production path is in [EXPANSION_PLAN.md](EXPANSION_PLAN.md).
