from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
PILOT = ROOT / "godot" / "art" / "candidate_r7v2" / "ngukhi_tumi_animation_pilot"
SOURCE = PILOT / "source"
OUT = PILOT / "layers"
OUT.mkdir(parents=True, exist_ok=True)

BACKPLATE = SOURCE / "tu-mi-simplified-backplate-v3.png"
ARM = SOURCE / "tu-mi-cast-arm-v3.png"
PROP_SOURCE = SOURCE / "tu-mi-simplified-outfit-v3.png"
PROP_ROI = (770, 0, 1024, 310)
BODY_SOCKET = (425, 285)
# The arm-only source is centered independently by image generation. The
# shoulder cap sits here on its full 1024x1536 source canvas; packaging maps it
# to BODY_SOCKET and derives the Sprite2D offset for the trimmed crop.
ARM_PIVOT_CANVAS = (820, 100)
ARM_HAND_TIP_CANVAS = (83, 1400)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def threshold_bbox(image: Image.Image, threshold: int = 16):
    alpha = image.convert("RGBA").getchannel("A")
    return alpha.point(lambda value: 255 if value >= threshold else 0).getbbox()


def clean_soft_alpha(image: Image.Image, zero_below: int = 3) -> Image.Image:
    image = image.convert("RGBA")
    alpha = image.getchannel("A").point(lambda value: 0 if value < zero_below else value)
    image.putalpha(alpha)
    return image


def trim_with_padding(image: Image.Image, threshold: int = 16, padding: int = 4):
    bbox = threshold_bbox(image, threshold)
    if bbox is None:
        raise RuntimeError("layer has no visible pixels")
    left, top, right, bottom = bbox
    left = max(0, left - padding)
    top = max(0, top - padding)
    right = min(image.width, right + padding)
    bottom = min(image.height, bottom + padding)
    return image.crop((left, top, right, bottom)), (left, top)


backplate = Image.open(BACKPLATE).convert("RGBA")
if backplate.size != (1024, 1536):
    raise RuntimeError(f"unexpected backplate canvas: {backplate.size}")
prop_source = Image.open(PROP_SOURCE).convert("RGBA")
if prop_source.size != (1024, 1536):
    raise RuntimeError(f"unexpected prop source canvas: {prop_source.size}")
prop_full = clean_soft_alpha(prop_source.crop(PROP_ROI))
prop_layer, prop_origin = trim_with_padding(prop_full, threshold=16, padding=6)
prop_path = OUT / "tu-mi-crystal-treasure.png"
prop_layer.save(prop_path, optimize=True)

body = clean_soft_alpha(backplate)
body_path = OUT / "tu-mi-body-backplate.png"
body.save(body_path, optimize=True)

arm_source = clean_soft_alpha(Image.open(ARM).convert("RGBA"))
arm_layer, arm_origin = trim_with_padding(arm_source, threshold=16, padding=8)
arm_path = OUT / "tu-mi-left-arm.png"
arm_layer.save(arm_path, optimize=True)

manifest = {
    "status": "candidate",
    "source_art": str(SOURCE.relative_to(ROOT)).replace("\\", "/"),
    "method": "ImageGen reference-guided cutout art; deterministic RGBA crop/mask packaging with Pillow",
    "canvas_px": {"width": 1024, "height": 1536},
    "body_socket_px": {"x": BODY_SOCKET[0], "y": BODY_SOCKET[1]},
    "arm_asset_crop_origin_px": {"x": arm_origin[0], "y": arm_origin[1]},
    "arm_pivot_in_full_asset_px": {"x": ARM_PIVOT_CANVAS[0], "y": ARM_PIVOT_CANVAS[1]},
    "arm_pivot_in_cropped_asset_px": {
        "x": ARM_PIVOT_CANVAS[0] - arm_origin[0],
        "y": ARM_PIVOT_CANVAS[1] - arm_origin[1],
    },
    "arm_sprite_scale": 0.4,
    "arm_sprite_position_in_rig_px": {
        "x": -((ARM_PIVOT_CANVAS[0] - arm_origin[0]) - arm_layer.width / 2) * 0.4,
        "y": -((ARM_PIVOT_CANVAS[1] - arm_origin[1]) - arm_layer.height / 2) * 0.4,
    },
    "arm_hand_tip_in_sprite_local_px": {
        "x": (ARM_HAND_TIP_CANVAS[0] - arm_origin[0]) - arm_layer.width / 2,
        "y": (ARM_HAND_TIP_CANVAS[1] - arm_origin[1]) - arm_layer.height / 2,
    },
    "prop_crop_origin_px": {"x": prop_origin[0] + PROP_ROI[0], "y": prop_origin[1] + PROP_ROI[1]},
    "layers": [],
    "occlusion_review": {
        "body": "AI-generated simplified-outfit backplate with the screen-left relaxed/casting arm removed at its shoulder socket; crystals were not present in this source layer.",
        "left_arm": "separate short-sleeve shoulder-to-fingertip RGBA layer; single pivot; no elbow/wrist/finger articulation.",
        "treasure": "three floating crystal blades are isolated from the body and animated as an independent layer.",
        "vfx": "kept as a Godot procedural node, never baked into body or prop textures.",
    },
}
for name, path in [("body_backplate", body_path), ("left_arm", arm_path), ("crystal_treasure", prop_path)]:
    image = Image.open(path).convert("RGBA")
    alpha = image.getchannel("A")
    histogram = alpha.histogram()
    manifest["layers"].append({
        "name": name,
        "path": str(path.relative_to(ROOT)).replace("\\", "/"),
        "sha256": sha256(path),
        "bytes": path.stat().st_size,
        "width": image.width,
        "height": image.height,
        "alpha_zero_pixels": histogram[0],
        "alpha_1_254_pixels": sum(histogram[1:255]),
        "alpha_255_pixels": histogram[255],
        "alpha_bbox_threshold_16": threshold_bbox(image, 16),
    })
(PILOT / "layers" / "layer_manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps(manifest, ensure_ascii=False, indent=2))
