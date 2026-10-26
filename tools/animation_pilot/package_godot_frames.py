from __future__ import annotations

import csv
import hashlib
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageChops, ImageStat

ROOT = Path(__file__).resolve().parents[2]
PILOT = ROOT / "godot" / "art" / "candidate_r7v2" / "ngukhi_tumi_animation_pilot"
FRAME_DIR = PILOT / "frames"
EVIDENCE = PILOT / "evidence"
FPS = 8
COUNT = 12
FRAME_SIZE = (320, 480)
COLS = 4
ROWS = 3
ATLAS_PATH = PILOT / "cast_atlas.webp"
TRES_PATH = PILOT / "cast_spriteframes.tres"


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def load_frames() -> list[Image.Image]:
    paths = [FRAME_DIR / f"frame_{index:02d}.png" for index in range(COUNT)]
    missing = [str(path) for path in paths if not path.is_file()]
    if missing:
        raise FileNotFoundError("missing Godot-rendered frames: " + ", ".join(missing))
    frames = [Image.open(path).convert("RGBA") for path in paths]
    wrong_sizes = [(index, frame.size) for index, frame in enumerate(frames) if frame.size != FRAME_SIZE]
    if wrong_sizes:
        raise RuntimeError(f"unstable canvas sizes: {wrong_sizes}")
    if len({frame.tobytes() for frame in frames}) != COUNT:
        raise RuntimeError("duplicate frame images found; refusing to package a fake loop")
    return frames


def alpha_bbox(image: Image.Image, threshold: int = 16):
    alpha = image.getchannel("A").point(lambda value: 255 if value >= threshold else 0)
    return alpha.getbbox()


def write_spriteframes() -> None:
    atlas_lines = [
        f'[gd_resource type="SpriteFrames" load_steps={COUNT + 2} format=3]',
        "",
        f'[ext_resource type="Texture2D" path="res://art/candidate_r7v2/ngukhi_tumi_animation_pilot/cast_atlas.webp" id="1_atlas"]',
        "",
    ]
    frame_meta = []
    for index in range(COUNT):
        x = (index % COLS) * FRAME_SIZE[0]
        y = (index // COLS) * FRAME_SIZE[1]
        frame_meta.append((x, y))
        atlas_lines += [
            f'[sub_resource type="AtlasTexture" id="AtlasTexture_{index}"]',
            'atlas = ExtResource("1_atlas")',
            f"region = Rect2({x}, {y}, {FRAME_SIZE[0]}, {FRAME_SIZE[1]})",
            "",
        ]
    atlas_lines += [
        "[resource]",
        "animations = [{",
        '"frames": [',
    ]
    for index in range(COUNT):
        comma = "," if index < COUNT - 1 else ""
        atlas_lines += [
            "{",
            '"duration": 1.0,',
            f'"texture": SubResource("AtlasTexture_{index}")',
            f"}}{comma}",
        ]
    atlas_lines += [
        "],",
        '"loop": true,',
        '"name": &"cast",',
        f'"speed": {float(FPS):.6f}',
        "}]",
        "",
    ]
    TRES_PATH.write_text("\n".join(atlas_lines), encoding="utf-8")


def make_contact_sheet(frames: list[Image.Image]) -> None:
    thumb_w, thumb_h = 160, 240
    gutter, header = 16, 32
    image = Image.new("RGB", (COLS * (thumb_w + gutter) + gutter, ROWS * (thumb_h + header + gutter) + gutter), (18, 14, 31))
    draw = ImageDraw.Draw(image)
    for index, frame in enumerate(frames):
        x = gutter + (index % COLS) * (thumb_w + gutter)
        y = gutter + (index // COLS) * (thumb_h + header + gutter)
        plate = Image.new("RGBA", frame.size, (24, 18, 38, 255))
        plate.alpha_composite(frame)
        image.paste(plate.convert("RGB").resize((thumb_w, thumb_h), Image.Resampling.LANCZOS), (x, y + header))
        draw.text((x, y + 7), f"{index:02d}  {index / FPS:.3f}s", fill=(225, 211, 243))
    image.save(EVIDENCE / "cast-contact-sheet.png", optimize=True)


def make_ab_status(frames: list[Image.Image]) -> None:
    width, height = 390, 844
    canvas = Image.new("RGB", (width, height), (18, 14, 31))
    draw = ImageDraw.Draw(canvas)
    draw.line((195, 0, 195, height), fill=(73, 60, 91), width=1)
    font_path = Path("C:/Windows/Fonts/arial.ttf")
    try:
        title_font = ImageFont.truetype(str(font_path), 16)
        body_font = ImageFont.truetype(str(font_path), 12)
    except OSError:
        title_font = ImageFont.load_default()
        body_font = ImageFont.load_default()

    draw.text((18, 20), "A  /  2D RIG", font=title_font, fill=(235, 216, 255))
    draw.text((211, 20), "B  /  WAN2.2", font=title_font, fill=(235, 216, 255))

    a_frame = Image.new("RGBA", frames[7].size, (22, 16, 38, 255))
    a_frame.alpha_composite(frames[7])
    a_frame.thumbnail((185, 450), Image.Resampling.LANCZOS)
    canvas.paste(a_frame.convert("RGB"), ((195 - a_frame.width) // 2, 125))

    source = Image.open(PILOT / "source" / "tu-mi-simplified-outfit-v3.png").convert("RGBA")
    source = Image.new("RGBA", source.size, (22, 16, 38, 255)) if source.getchannel("A").getextrema() == (255, 255) else source
    if source.getchannel("A").getextrema() != (255, 255):
        plate = Image.new("RGBA", source.size, (22, 16, 38, 255))
        plate.alpha_composite(source)
        source = plate
    source.thumbnail((185, 450), Image.Resampling.LANCZOS)
    canvas.paste(source.convert("RGB"), (195 + (195 - source.width) // 2, 125))

    draw.text((14, 608), "12-frame Cast render", font=body_font, fill=(194, 182, 215))
    draw.text((14, 630), "PNG + SpriteFrames", font=body_font, fill=(194, 182, 215))
    draw.text((207, 580), "STATIC REFERENCE", font=body_font, fill=(244, 190, 113))
    draw.text((207, 606), "NOT AI VIDEO OUTPUT", font=body_font, fill=(249, 152, 152))
    draw.text((207, 632), "Wan2.2 not run:", font=body_font, fill=(194, 182, 215))
    draw.text((207, 652), "GPU + models unavailable", font=body_font, fill=(194, 182, 215))
    draw.text((17, 810), "LAYOUT / STATUS PROOF · B IS NOT AN ANIMATION", font=body_font, fill=(143, 133, 162))
    canvas.save(EVIDENCE / "ab-status-layout-390x844.png", optimize=True)


def main() -> None:
    EVIDENCE.mkdir(parents=True, exist_ok=True)
    frames = load_frames()
    atlas = Image.new("RGBA", (COLS * FRAME_SIZE[0], ROWS * FRAME_SIZE[1]), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        atlas.paste(frame, ((index % COLS) * FRAME_SIZE[0], (index // COLS) * FRAME_SIZE[1]))
    atlas.save(ATLAS_PATH, "WEBP", lossless=True, quality=100, method=6)
    write_spriteframes()

    gif_frames = []
    for frame in frames:
        plate = Image.new("RGBA", frame.size, (22, 16, 38, 255))
        plate.alpha_composite(frame)
        gif_frames.append(plate.convert("RGB").quantize(colors=255, method=Image.Quantize.MEDIANCUT))
    gif_frames[0].save(
        EVIDENCE / "cast-loop-preview.gif",
        save_all=True,
        append_images=gif_frames[1:],
        duration=round(1000 / FPS),
        loop=0,
        disposal=2,
        optimize=True,
    )
    make_contact_sheet(frames)
    make_ab_status(frames)

    bboxes = [alpha_bbox(frame) for frame in frames]
    pixel_deltas = []
    for previous, current in zip(frames, frames[1:]):
        difference = ImageChops.difference(previous, current)
        pixel_deltas.append(sum(ImageStat.Stat(difference.convert("RGB")).mean) / 3.0)

    # The feet belong to the static backplate. Check the central lower-body crop
    # separately so the moving sleeve cannot make a changing root baseline.
    baseline_values = []
    for frame in frames:
        alpha = frame.getchannel("A").crop((105, 400, 290, 480))
        box = alpha.point(lambda value: 255 if value >= 16 else 0).getbbox()
        baseline_values.append(None if box is None else 400 + box[3] - 1)

    decoded_layer_bytes = 0
    for path in (PILOT / "layers" / "tu-mi-body-backplate.png", PILOT / "layers" / "tu-mi-left-arm.png", PILOT / "layers" / "tu-mi-crystal-treasure.png"):
        image = Image.open(path)
        decoded_layer_bytes += image.width * image.height * 4

    metrics = {
        "status": "candidate",
        "godot_version": "4.7.2.stable.official.ed1daf0bf",
        "viewport_px": [390, 844],
        "frame_size_px": list(FRAME_SIZE),
        "fps": FPS,
        "frame_count": len(frames),
        "duration_seconds": len(frames) / FPS,
        "unique_frame_count": len({frame.tobytes() for frame in frames}),
        "alpha_bboxes_threshold_16": bboxes,
        "frame_pair_mean_abs_rgb_delta_0_to_255": pixel_deltas,
        "static_body_foot_roi_bottom_y": baseline_values,
        "foot_baseline_stable": len(set(baseline_values)) == 1,
        "rig_layers_decoded_rgba_bytes": decoded_layer_bytes,
        "sprite_atlas_decoded_rgba_bytes": ATLAS_PATH.stat().st_size * 0 + (COLS * FRAME_SIZE[0] * ROWS * FRAME_SIZE[1] * 4),
        "atlas_file_bytes": ATLAS_PATH.stat().st_size,
        "motion_reference_video_available": (EVIDENCE / "cast-motion-reference.avi").is_file(),
        "motion_reference_video_path": "evidence/cast-motion-reference.avi",
        "motion_reference_video_fps": FPS,
        "motion_reference_video_frames": 24,
        "motion_reference_video_duration_seconds": 24 / FPS,
        "wan22_generated_video": False,
        "notes": [
            "Frame PNGs were captured from the Godot rig scene at fixed 8 fps.",
            "The motion-reference AVI is a Godot render of candidate A, not performer footage or Wan-generated output.",
            "B remains workflow-only because Wan2.2 model weights, ComfyUI runtime, and a compatible GPU are unavailable locally.",
            "Character pose and foot baseline are held by the same rig root; the hand arm is a separate rotated cutout.",
        ],
    }
    (PILOT / "metrics.json").write_text(json.dumps(metrics, ensure_ascii=False, indent=2), encoding="utf-8")

    files = sorted(
        path for path in PILOT.rglob("*")
        if path.is_file() and path.name not in {
            "SHA256SUMS.csv", "capture.stdout.log", "capture.stderr.log",
            "motion.stdout.log", "motion.stderr.log",
        }
        and path.suffix != ".import"
        and ".godot" not in path.parts
    )
    with (PILOT / "SHA256SUMS.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(["path", "bytes", "sha256"])
        for path in files:
            writer.writerow([
                path.relative_to(ROOT).as_posix(),
                path.stat().st_size,
                sha256(path),
            ])
    print(json.dumps(metrics, ensure_ascii=False, indent=2))
    print(f"PNG_SEQUENCE={len(frames)} ATLAS={ATLAS_PATH.stat().st_size} GIF={(EVIDENCE / 'cast-loop-preview.gif').stat().st_size} SHA_ENTRIES={len(files)}")


if __name__ == "__main__":
    main()
