# Wan2.2 Animate — GPU Workflow for Pilot B

**Status:** prepared, not executed. This document is a reproducible handoff for a compatible GPU workstation; it is not evidence of a generated Wan video.

## Inputs in this candidate

- Reference character artwork: `godot/art/candidate_r7v2/ngukhi_tumi_animation_pilot/source/tu-mi-simplified-outfit-v3.png` (1024×1536 RGBA, simplified outfit).
- Motion video: `godot/art/candidate_r7v2/ngukhi_tumi_animation_pilot/evidence/cast-motion-reference.avi` (Godot Movie Maker, MJPEG, 390×844, 24 frames, 8 FPS, 3 seconds).
- The motion video is rendered from the 2D rig pilot. It shows an arm sweep, not a performer, and currently lacks a hand-seal gesture.

## Environment required

Use an isolated ComfyUI install with a current version that includes the native **Wan2.2 Animate** workflow. The official guide lists the Wan2.2 Animate 14B diffusion model (FP8 or BF16), Wan2.1 VAE, CLIP Vision H, UMT5 XXL text encoder, and optional LightX2V I2V 14B 4-step LoRA. The workflow may require `ComfyUI-KJNodes` and `comfyui_controlnet_aux`. Use the official workflow template or search “Wan2.2 Animate” in the ComfyUI template library; do not use a JSON from an unverified mirror.

This pilot machine has no ComfyUI installation, Wan2.2 weights, PyTorch/diffusers environment, or GPU inference setup. Do not download multi-gigabyte model files into the game checkout. Check the current model/code licenses and hardware requirements on the official pages before using or redistributing them.

## Preparation

1. Keep the reference image and motion video as exact input copies; record SHA-256 for both. The reference PNG has alpha. If the template does not carry alpha/mask correctly, composite it over the same plain dark stage used by the pilot and treat output as opaque until verified.
2. The source AVI is portrait 390×844; the official Animate node requires video width and height to be multiples of 16. With FFmpeg on the GPU host, make a padded 384×848 working copy:

   ```powershell
   ffmpeg -i cast-motion-reference.avi -vf "scale=384:848:force_original_aspect_ratio=decrease,pad=384:848:(ow-iw)/2:(oh-ih)/2,setsar=1" -r 8 -t 3 -an -c:v libx264 -pix_fmt yuv420p cast-motion-reference-384x848.mp4
   ```

   Confirm the output is 384×848, silent, 8 FPS and approximately 3 seconds. Keep the original AVI unchanged. The resize/pad is a workflow-preparation step, not a runtime asset.

## ComfyUI steps

1. Open the official **Wan2.2 Animate** native workflow.
2. Use **Move** mode. This applies motion from the input video to the character in the reference image; **Mix** mode replaces a character in a source video and is not the selected experiment.
3. Connect the simplified outfit reference image and prepared Cast motion MP4 to the template's `LoadImage` and `LoadVideo` inputs.
4. Start with a small output resolution and the shortest required frame range that preserves the three action beats. The official guide notes video width/height must be multiples of 16 and that the workflow has a 77-frame extension segment; avoid enabling extensions for this short proof unless needed.
5. Run once and save the workflow JSON, ComfyUI version, model filenames/hashes, seed, resolution, frame count, VRAM use, elapsed time and output video. Keep credentials out of the workflow file and logs.
6. Review all frames for same face, hair, outfit silhouette, crystal shape, body scale, hand pose, temporal flicker and unwanted background changes. Do not call it successful if the model changes identity or invents extra robe tails.
7. If accepted, pass the AI output through the project's [video-to-Godot pipeline](../../tools/VIDEO_TO_GODOT_ANIMATION.md). Inspect the extracted alpha/mask, union crop, pivot, frame deduplication and loop. Then use `tools/animation_pilot/package_godot_frames.py` or the established converter to create a Godot resource.
8. RIFE is optional only after the generated pose sequence passes identity and gesture review. Interpolation may smooth timing but cannot add a missing seal pose.

## Acceptance record template

```text
ComfyUI version / commit:
Wan2.2 workflow template revision:
Model files and hashes:
GPU / VRAM:
Input reference SHA-256:
Input motion video SHA-256:
Mode: Move
Resolution / FPS / frame count:
Elapsed time / peak VRAM:
Identity consistency: PASS / FAIL / BLOCKED
Cast gesture phases: PASS / FAIL / BLOCKED
Background/alpha handling: PASS / FAIL / BLOCKED
Godot import / SpriteFrames: PASS / FAIL / BLOCKED
Reviewer and decision:
```

## Official references

- [ComfyUI Wan2.2 Animate workflow documentation](https://docs.comfy.org/tutorials/video/wan/wan2-2-animate)
- [ComfyUI official workflow template](https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_animate.json)
- [Wan-Video/Wan2.2 repository](https://github.com/Wan-Video/Wan2.2)
