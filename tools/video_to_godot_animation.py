from __future__ import annotations

import argparse
import hashlib
import json
import math
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageChops, ImageDraw, ImageStat


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_PIPELINE_ROOT = ROOT / "assets" / "_pipeline" / "video_animation"
DEFAULT_GODOT_ROOT = ROOT / "godot"


@dataclass(frozen=True)
class ProcessedFrame:
    image: Image.Image
    duration_frames: int
    sampled_index: int


@dataclass(frozen=True)
class PipelineConfig:
    fps: float
    key_color: tuple[int, int, int] | None
    key_tolerance: float
    key_feather: float
    despill: float
    alpha_threshold: int
    padding: int
    dedupe_threshold: float
    columns: int
    animation_name: str
    loop: bool
    pivot: str


def _run(cmd: list[str]) -> None:
    completed = subprocess.run(cmd, check=False)
    if completed.returncode != 0:
        raise RuntimeError(f"Command failed ({completed.returncode}): {' '.join(cmd)}")


def _resolve_ffmpeg(explicit: str | None) -> str:
    if explicit:
        candidate = Path(explicit)
        if candidate.is_file():
            return str(candidate)
        found = shutil.which(explicit)
        if found:
            return found
        raise FileNotFoundError(f"FFmpeg not found: {explicit}")

    found = shutil.which("ffmpeg")
    if found:
        return found

    try:
        import imageio_ffmpeg  # type: ignore

        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        pass

    raise FileNotFoundError(
        "FFmpeg is required. Install ffmpeg and add it to PATH, "
        "or install imageio-ffmpeg, or pass --ffmpeg <path>."
    )


def _resolve_ffprobe(ffmpeg_path: str) -> str | None:
    ffmpeg = Path(ffmpeg_path)
    sibling = ffmpeg.with_name("ffprobe.exe" if ffmpeg.suffix.lower() == ".exe" else "ffprobe")
    if sibling.is_file():
        return str(sibling)
    return shutil.which("ffprobe")


def _probe_video(ffprobe_path: str | None, source: Path) -> dict:
    if not ffprobe_path:
        return {}
    cmd = [
        ffprobe_path,
        "-v",
        "error",
        "-select_streams",
        "v:0",
        "-show_entries",
        "stream=width,height,avg_frame_rate,r_frame_rate:format=duration",
        "-of",
        "json",
        str(source),
    ]
    completed = subprocess.run(cmd, check=False, capture_output=True, text=True)
    if completed.returncode != 0:
        return {}
    try:
        return json.loads(completed.stdout or "{}")
    except json.JSONDecodeError:
        return {}


def _extract_frames(
    ffmpeg_path: str,
    source: Path,
    output_dir: Path,
    fps: float,
    start: float,
    end: float | None,
) -> list[Path]:
    output_dir.mkdir(parents=True, exist_ok=True)
    pattern = output_dir / "sample_%06d.png"
    cmd = [ffmpeg_path, "-hide_banner", "-loglevel", "error", "-y"]
    if start > 0:
        cmd += ["-ss", f"{start:.6f}"]
    cmd += ["-i", str(source)]
    if end is not None:
        duration = end - start
        if duration <= 0:
            raise ValueError("--end must be greater than --start")
        cmd += ["-t", f"{duration:.6f}"]
    cmd += [
        "-vf",
        f"fps={fps:.8f}",
        "-vsync",
        "vfr",
        str(pattern),
    ]
    _run(cmd)
    frames = sorted(output_dir.glob("sample_*.png"))
    if not frames:
        raise RuntimeError("FFmpeg produced no frames. Check --start/--end and source video.")
    return frames


def _parse_hex_color(value: str) -> tuple[int, int, int] | None:
    token = value.strip().lower()
    if token in {"none", "off", "disabled"}:
        return None
    if token == "auto":
        raise ValueError("auto color must be resolved from frames")
    if token.startswith("#"):
        token = token[1:]
    if len(token) != 6:
        raise ValueError("--key-color must be auto, none, or #RRGGBB")
    try:
        return tuple(int(token[i : i + 2], 16) for i in (0, 2, 4))  # type: ignore[return-value]
    except ValueError as exc:
        raise ValueError("--key-color must be auto, none, or #RRGGBB") from exc


def _border_pixels(image: Image.Image, stride: int = 8) -> Iterable[tuple[int, int, int]]:
    rgb = image.convert("RGB")
    width, height = rgb.size
    if width <= 0 or height <= 0:
        return
    xs = range(0, width, max(1, stride))
    ys = range(0, height, max(1, stride))
    for x in xs:
        yield rgb.getpixel((x, 0))
        yield rgb.getpixel((x, height - 1))
    for y in ys:
        yield rgb.getpixel((0, y))
        yield rgb.getpixel((width - 1, y))


def _estimate_key_color(frame_paths: list[Path]) -> tuple[int, int, int]:
    if not frame_paths:
        raise ValueError("Cannot estimate key color without frames.")
    indices = sorted({0, len(frame_paths) // 2, len(frame_paths) - 1})
    pixels: list[tuple[int, int, int]] = []
    for index in indices:
        image = Image.open(frame_paths[index])
        pixels.extend(_border_pixels(image, stride=max(2, min(image.size) // 80)))
    if not pixels:
        raise RuntimeError("Cannot sample border pixels for automatic chroma key.")

    # Dominant-border quantization is more robust than a plain average when the
    # subject briefly touches one edge.
    buckets: dict[tuple[int, int, int], list[tuple[int, int, int]]] = {}
    for r, g, b in pixels:
        bucket = (r // 16, g // 16, b // 16)
        buckets.setdefault(bucket, []).append((r, g, b))
    dominant = max(buckets.values(), key=len)
    count = len(dominant)
    return (
        round(sum(p[0] for p in dominant) / count),
        round(sum(p[1] for p in dominant) / count),
        round(sum(p[2] for p in dominant) / count),
    )


def _chroma_key(
    image: Image.Image,
    key_color: tuple[int, int, int] | None,
    tolerance: float,
    feather: float,
    despill: float,
) -> Image.Image:
    rgba = image.convert("RGBA")
    if key_color is None:
        return rgba

    kr, kg, kb = key_color
    tolerance = max(0.0, tolerance)
    feather = max(0.001, feather)
    despill = max(0.0, min(1.0, despill))

    if hasattr(rgba, "get_flattened_data"):
        pixels = list(rgba.get_flattened_data())
    else:
        pixels = list(rgba.getdata())
    out: list[tuple[int, int, int, int]] = []
    for r, g, b, original_alpha in pixels:
        distance = math.sqrt((r - kr) ** 2 + (g - kg) ** 2 + (b - kb) ** 2)
        if distance <= tolerance:
            alpha_scale = 0.0
        elif distance >= tolerance + feather:
            alpha_scale = 1.0
        else:
            alpha_scale = (distance - tolerance) / feather

        alpha = round(original_alpha * alpha_scale)
        if despill > 0 and alpha < original_alpha:
            edge_strength = (1.0 - alpha_scale) * despill
            neutral = round((r + g + b) / 3)
            r = round(r * (1 - edge_strength) + neutral * edge_strength)
            g = round(g * (1 - edge_strength) + neutral * edge_strength)
            b = round(b * (1 - edge_strength) + neutral * edge_strength)
        out.append((r, g, b, alpha))

    keyed = Image.new("RGBA", rgba.size)
    keyed.putdata(out)
    return keyed


def _opaque_bbox(image: Image.Image, alpha_threshold: int) -> tuple[int, int, int, int] | None:
    threshold = max(0, min(255, alpha_threshold))
    alpha = image.getchannel("A")
    mask = alpha.point(lambda value: 255 if value >= threshold else 0)
    return mask.getbbox()


def _union_bbox(
    bboxes: Iterable[tuple[int, int, int, int] | None],
    image_size: tuple[int, int],
    padding: int,
) -> tuple[int, int, int, int]:
    valid = [bbox for bbox in bboxes if bbox is not None]
    if not valid:
        raise RuntimeError(
            "No foreground remained after chroma key. Reduce --key-tolerance/--key-feather "
            "or pass --key-color none."
        )
    left = min(bbox[0] for bbox in valid)
    top = min(bbox[1] for bbox in valid)
    right = max(bbox[2] for bbox in valid)
    bottom = max(bbox[3] for bbox in valid)
    width, height = image_size
    pad = max(0, padding)
    return (
        max(0, left - pad),
        max(0, top - pad),
        min(width, right + pad),
        min(height, bottom + pad),
    )


def _difference_score(a: Image.Image, b: Image.Image) -> float:
    sample_size = (48, 48)
    aa = a.resize(sample_size, Image.Resampling.BILINEAR).convert("RGBA")
    bb = b.resize(sample_size, Image.Resampling.BILINEAR).convert("RGBA")
    diff = ImageChops.difference(aa, bb)
    means = ImageStat.Stat(diff).mean
    return sum(means) / len(means)


def _dedupe_frames(images: list[Image.Image], threshold: float) -> list[ProcessedFrame]:
    if not images:
        return []
    threshold = max(0.0, threshold)
    output: list[ProcessedFrame] = []
    for index, image in enumerate(images):
        if output and _difference_score(output[-1].image, image) <= threshold:
            previous = output[-1]
            output[-1] = ProcessedFrame(
                image=previous.image,
                duration_frames=previous.duration_frames + 1,
                sampled_index=previous.sampled_index,
            )
        else:
            output.append(ProcessedFrame(image=image, duration_frames=1, sampled_index=index))
    return output


def _choose_columns(frame_count: int, requested: int) -> int:
    if frame_count <= 0:
        return 1
    if requested > 0:
        return max(1, min(frame_count, requested))
    return max(1, math.ceil(math.sqrt(frame_count)))


def _build_atlas(
    frames: list[ProcessedFrame],
    columns: int,
) -> tuple[Image.Image, list[dict], tuple[int, int]]:
    if not frames:
        raise RuntimeError("No frames available for atlas.")
    frame_width, frame_height = frames[0].image.size
    if any(frame.image.size != (frame_width, frame_height) for frame in frames):
        raise RuntimeError("Stable-canvas invariant failed: processed frames have different sizes.")

    columns = _choose_columns(len(frames), columns)
    rows = math.ceil(len(frames) / columns)
    atlas = Image.new("RGBA", (columns * frame_width, rows * frame_height), (0, 0, 0, 0))
    metadata: list[dict] = []
    for index, frame in enumerate(frames):
        col = index % columns
        row = index // columns
        x = col * frame_width
        y = row * frame_height
        atlas.alpha_composite(frame.image, (x, y))
        metadata.append(
            {
                "index": index,
                "sampledIndex": frame.sampled_index,
                "durationFrames": frame.duration_frames,
                "rect": [x, y, frame_width, frame_height],
            }
        )
    return atlas, metadata, (columns, rows)


def _pivot_px(mode: str, frame_size: tuple[int, int]) -> tuple[float, float]:
    width, height = frame_size
    if mode == "bottom-center":
        return (width / 2.0, float(height))
    return (width / 2.0, height / 2.0)


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _write_spriteframes_tres(
    target: Path,
    atlas_res_path: str,
    frames: list[ProcessedFrame],
    frame_metadata: list[dict],
    fps: float,
    animation_name: str,
    loop: bool,
) -> None:
    lines = [
        f'[gd_resource type="SpriteFrames" load_steps={len(frames) + 2} format=3]',
        "",
        f'[ext_resource type="Texture2D" path="{atlas_res_path}" id="1_atlas"]',
        "",
    ]
    for index, meta in enumerate(frame_metadata):
        x, y, width, height = meta["rect"]
        lines += [
            f'[sub_resource type="AtlasTexture" id="AtlasTexture_{index}"]',
            'atlas = ExtResource("1_atlas")',
            f"region = Rect2({x}, {y}, {width}, {height})",
            "",
        ]

    safe_name = animation_name.replace('"', "")
    lines += [
        "[resource]",
        "animations = [{",
        '"frames": [',
    ]
    for index, frame in enumerate(frames):
        comma = "," if index < len(frames) - 1 else ""
        lines += [
            "{",
            f'"duration": {float(frame.duration_frames):.1f},',
            f'"texture": SubResource("AtlasTexture_{index}")',
            f"}}{comma}",
        ]
    lines += [
        "],",
        f'"loop": {"true" if loop else "false"},',
        f'"name": &"{safe_name}",',
        f'"speed": {float(fps):.6f}',
        "}]",
        "",
    ]
    target.write_text("\n".join(lines), encoding="utf-8")


def _res_to_path(godot_root: Path, res_dir: str) -> Path:
    normalized = res_dir.strip()
    if not normalized.startswith("res://"):
        raise ValueError("--install-res-dir must start with res://")
    parts = [part for part in normalized[len("res://") :].strip("/").split("/") if part]
    return godot_root.joinpath(*parts)


def _path_to_res(godot_root: Path, path: Path) -> str:
    root = godot_root.resolve()
    resolved = path.resolve()
    try:
        relative = resolved.relative_to(root)
    except ValueError as exc:
        raise ValueError(f"{path} is outside Godot project root {godot_root}") from exc
    return "res://" + relative.as_posix()


def _save_preview(frames: list[ProcessedFrame], output: Path, fps: float) -> None:
    if not frames:
        return
    images: list[Image.Image] = []
    durations: list[int] = []
    for frame in frames:
        images.append(frame.image)
        durations.append(max(1, round(1000 / fps * frame.duration_frames)))
    first, rest = images[0], images[1:]
    first.save(
        output,
        "WEBP",
        save_all=True,
        append_images=rest,
        duration=durations,
        loop=0,
        lossless=True,
        method=4,
    )


def _save_contact_sheet(frames: list[ProcessedFrame], output: Path, max_frames: int = 36) -> None:
    if not frames:
        return
    selected = frames[:max_frames]
    frame_width, frame_height = selected[0].image.size
    thumb_width = min(160, frame_width)
    thumb_height = max(1, round(frame_height * thumb_width / max(1, frame_width)))
    columns = min(6, len(selected))
    rows = math.ceil(len(selected) / columns)
    sheet = Image.new("RGBA", (columns * thumb_width, rows * thumb_height), (0, 0, 0, 0))
    for index, frame in enumerate(selected):
        thumb = frame.image.copy()
        thumb.thumbnail((thumb_width, thumb_height), Image.Resampling.LANCZOS)
        col = index % columns
        row = index // columns
        x = col * thumb_width + (thumb_width - thumb.width) // 2
        y = row * thumb_height + (thumb_height - thumb.height) // 2
        sheet.alpha_composite(thumb, (x, y))
    sheet.save(output, "WEBP", lossless=True, method=6)


def _process_sampled_frames(
    frame_paths: list[Path],
    output_dir: Path,
    config: PipelineConfig,
    source_path: Path,
    probe: dict,
    install_res_dir: str | None,
    godot_root: Path,
) -> dict:
    output_dir.mkdir(parents=True, exist_ok=True)
    frames_out = output_dir / "frames"
    if frames_out.exists():
        shutil.rmtree(frames_out)
    frames_out.mkdir(parents=True)

    first = Image.open(frame_paths[0]).convert("RGBA")
    source_size = first.size
    keyed: list[Image.Image] = []
    bboxes: list[tuple[int, int, int, int] | None] = []
    for path in frame_paths:
        image = Image.open(path).convert("RGBA")
        if image.size != source_size:
            raise RuntimeError("FFmpeg returned inconsistent frame sizes.")
        processed = _chroma_key(
            image,
            config.key_color,
            config.key_tolerance,
            config.key_feather,
            config.despill,
        )
        keyed.append(processed)
        bboxes.append(_opaque_bbox(processed, config.alpha_threshold))

    union = _union_bbox(bboxes, source_size, config.padding)
    stable = [image.crop(union) for image in keyed]
    deduped = _dedupe_frames(stable, config.dedupe_threshold)
    if not deduped:
        raise RuntimeError("No frames remained after processing.")

    for index, frame in enumerate(deduped):
        frame.image.save(frames_out / f"frame_{index:03d}.png", "PNG", optimize=True)

    atlas, frame_meta, grid = _build_atlas(deduped, config.columns)
    atlas_path = output_dir / "atlas.webp"
    atlas.save(atlas_path, "WEBP", lossless=True, method=6)
    preview_path = output_dir / "preview.webp"
    _save_preview(deduped, preview_path, config.fps)
    contact_path = output_dir / "contact_sheet.webp"
    _save_contact_sheet(deduped, contact_path)

    frame_size = deduped[0].image.size
    pivot = _pivot_px(config.pivot, frame_size)
    metadata = {
        "schema": "tutien-video-animation.v1",
        "source": str(source_path),
        "sourceProbe": probe,
        "sampleFps": config.fps,
        "sampledFrameCount": len(frame_paths),
        "uniqueFrameCount": len(deduped),
        "totalDurationFrames": sum(frame.duration_frames for frame in deduped),
        "keyColor": list(config.key_color) if config.key_color is not None else None,
        "keyTolerance": config.key_tolerance,
        "keyFeather": config.key_feather,
        "despill": config.despill,
        "alphaThreshold": config.alpha_threshold,
        "unionCrop": list(union),
        "padding": config.padding,
        "frameSize": list(frame_size),
        "pivotMode": config.pivot,
        "pivotPx": list(pivot),
        "atlas": {
            "file": atlas_path.name,
            "sha256": _sha256(atlas_path),
            "size": list(atlas.size),
            "columns": grid[0],
            "rows": grid[1],
        },
        "frames": frame_meta,
        "animation": {
            "name": config.animation_name,
            "loop": config.loop,
            "speedFps": config.fps,
        },
    }
    metadata_path = output_dir / "animation.json"
    metadata_path.write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding="utf-8")

    installed = None
    if install_res_dir:
        runtime_dir = _res_to_path(godot_root, install_res_dir)
        runtime_dir.mkdir(parents=True, exist_ok=True)
        runtime_atlas = runtime_dir / f"{config.animation_name}_atlas.webp"
        runtime_json = runtime_dir / f"{config.animation_name}.json"
        runtime_tres = runtime_dir / f"{config.animation_name}.tres"
        shutil.copy2(atlas_path, runtime_atlas)
        atlas_res_path = _path_to_res(godot_root, runtime_atlas)
        _write_spriteframes_tres(
            runtime_tres,
            atlas_res_path,
            deduped,
            frame_meta,
            config.fps,
            config.animation_name,
            config.loop,
        )
        installed = {
            "directory": str(runtime_dir),
            "atlas": str(runtime_atlas),
            "metadata": str(runtime_json),
            "spriteFrames": str(runtime_tres),
            "atlasResPath": atlas_res_path,
            "spriteFramesResPath": _path_to_res(godot_root, runtime_tres),
        }

    metadata["installedGodot"] = installed
    metadata_path.write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding="utf-8")
    if installed:
        shutil.copy2(metadata_path, Path(installed["metadata"]))
    return metadata


def _self_test() -> None:
    with tempfile.TemporaryDirectory(prefix="tutien-video-animation-selftest-") as raw_temp:
        temp = Path(raw_temp)
        sampled = temp / "sampled"
        sampled.mkdir()
        width, height = 96, 128
        key = (255, 0, 255)
        positions = [24, 24, 28, 32, 32, 36]
        for index, x in enumerate(positions):
            image = Image.new("RGB", (width, height), key)
            draw = ImageDraw.Draw(image)
            draw.ellipse((x, 34, x + 36, 104), fill=(230, 205, 180))
            draw.rectangle((x + 10, 20, x + 26, 60), fill=(90, 40, 20))
            image.save(sampled / f"sample_{index:06d}.png")

        frame_paths = sorted(sampled.glob("sample_*.png"))
        output = temp / "pipeline"
        godot_root = temp / "godot"
        godot_root.mkdir()
        config = PipelineConfig(
            fps=10.0,
            key_color=key,
            key_tolerance=25.0,
            key_feather=20.0,
            despill=0.25,
            alpha_threshold=8,
            padding=4,
            dedupe_threshold=0.4,
            columns=0,
            animation_name="self_test_idle",
            loop=True,
            pivot="bottom-center",
        )
        meta = _process_sampled_frames(
            frame_paths,
            output,
            config,
            source_path=Path("self-test.mp4"),
            probe={},
            install_res_dir="res://art/candidate/self_test",
            godot_root=godot_root,
        )

        assert meta["sampledFrameCount"] == 6
        assert 3 <= meta["uniqueFrameCount"] <= 5
        assert (output / "atlas.webp").is_file()
        assert (output / "animation.json").is_file()
        assert (output / "preview.webp").is_file()
        assert (output / "contact_sheet.webp").is_file()
        spriteframes = godot_root / "art" / "candidate" / "self_test" / "self_test_idle.tres"
        assert spriteframes.is_file()
        tres = spriteframes.read_text(encoding="utf-8")
        assert '[gd_resource type="SpriteFrames"' in tres
        assert 'res://art/candidate/self_test/self_test_idle_atlas.webp' in tres
        assert '"speed": 10.000000' in tres
        assert meta["pivotMode"] == "bottom-center"
        print("VIDEO TO GODOT ANIMATION SELF-TEST: PASS")
        print(f"Sampled 6 -> unique {meta['uniqueFrameCount']} frames")


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "Convert MP4/video animation into stable transparent frames, a lossless WebP atlas, "
            "metadata, preview, and optionally a Godot SpriteFrames .tres."
        )
    )
    parser.add_argument("video", nargs="?", type=Path, help="Source video (MP4/WebM/MOV/etc.).")
    parser.add_argument("--name", help="Animation name. Defaults to the source filename stem.")
    parser.add_argument("--start", type=float, default=0.0, help="Start time in seconds.")
    parser.add_argument("--end", type=float, help="End time in seconds.")
    parser.add_argument("--fps", type=float, default=10.0, help="Sample FPS. Recommended: 8-12.")
    parser.add_argument(
        "--key-color",
        default="auto",
        help="Chroma key: auto, none, or #RRGGBB. Auto estimates dominant border color.",
    )
    parser.add_argument("--key-tolerance", type=float, default=48.0)
    parser.add_argument("--key-feather", type=float, default=28.0)
    parser.add_argument("--despill", type=float, default=0.22, help="0..1 neutralize colored fringe.")
    parser.add_argument("--alpha-threshold", type=int, default=8)
    parser.add_argument("--padding", type=int, default=8, help="Transparent padding around union crop.")
    parser.add_argument(
        "--dedupe-threshold",
        type=float,
        default=0.35,
        help="Mean thumbnail difference; consecutive frames below this are duration-merged.",
    )
    parser.add_argument("--columns", type=int, default=0, help="Atlas columns; 0 = automatic square-ish grid.")
    parser.add_argument(
        "--pivot",
        choices=("center", "bottom-center"),
        default="center",
        help="Pivot metadata. Stable canvas itself prevents per-frame jitter.",
    )
    parser.add_argument("--no-loop", action="store_true", help="Generate non-looping SpriteFrames metadata.")
    parser.add_argument(
        "--output",
        type=Path,
        help="Pipeline output. Default: assets/_pipeline/video_animation/<name>",
    )
    parser.add_argument(
        "--install-res-dir",
        help=(
            "Optional Godot candidate destination, e.g. "
            "res://art/candidate/home/home_meditation_idle. "
            "Creates atlas + JSON + SpriteFrames .tres there."
        ),
    )
    parser.add_argument("--godot-root", type=Path, default=DEFAULT_GODOT_ROOT)
    parser.add_argument("--ffmpeg", help="Path/name of ffmpeg executable.")
    parser.add_argument("--self-test", action="store_true", help="Run deterministic synthetic pipeline test.")
    args = parser.parse_args()

    if args.self_test:
        _self_test()
        return

    if args.video is None:
        parser.error("video is required unless --self-test is used")
    source = args.video.resolve()
    if not source.is_file():
        raise FileNotFoundError(source)
    if args.fps <= 0 or args.fps > 60:
        raise ValueError("--fps must be > 0 and <= 60")
    if args.start < 0:
        raise ValueError("--start must be >= 0")
    if args.end is not None and args.end <= args.start:
        raise ValueError("--end must be greater than --start")

    name = args.name or source.stem
    animation_name = "".join(ch if ch.isalnum() or ch in "_-" else "_" for ch in name).strip("_")
    if not animation_name:
        raise ValueError("Animation name became empty after sanitization.")
    output = (args.output or (DEFAULT_PIPELINE_ROOT / animation_name)).resolve()

    ffmpeg = _resolve_ffmpeg(args.ffmpeg)
    ffprobe = _resolve_ffprobe(ffmpeg)
    probe = _probe_video(ffprobe, source)

    with tempfile.TemporaryDirectory(prefix="tutien-video-sample-") as temp_dir:
        sampled_dir = Path(temp_dir)
        frame_paths = _extract_frames(
            ffmpeg,
            source,
            sampled_dir,
            fps=args.fps,
            start=args.start,
            end=args.end,
        )
        key_color = (
            _estimate_key_color(frame_paths)
            if args.key_color.strip().lower() == "auto"
            else _parse_hex_color(args.key_color)
        )
        config = PipelineConfig(
            fps=args.fps,
            key_color=key_color,
            key_tolerance=args.key_tolerance,
            key_feather=args.key_feather,
            despill=args.despill,
            alpha_threshold=args.alpha_threshold,
            padding=args.padding,
            dedupe_threshold=args.dedupe_threshold,
            columns=args.columns,
            animation_name=animation_name,
            loop=not args.no_loop,
            pivot=args.pivot,
        )
        metadata = _process_sampled_frames(
            frame_paths,
            output,
            config,
            source_path=source,
            probe=probe,
            install_res_dir=args.install_res_dir,
            godot_root=args.godot_root.resolve(),
        )

    print("")
    print("VIDEO -> GODOT ANIMATION: OK")
    print(f"Source: {source}")
    print(f"Sampled: {metadata['sampledFrameCount']} frames @ {metadata['sampleFps']} FPS")
    print(f"Unique: {metadata['uniqueFrameCount']} frames")
    print(f"Stable frame: {metadata['frameSize'][0]}x{metadata['frameSize'][1]}")
    print(f"Key color: {metadata['keyColor']}")
    print(f"Pipeline: {output}")
    if metadata.get("installedGodot"):
        installed = metadata["installedGodot"]
        print(f"Godot SpriteFrames: {installed['spriteFramesResPath']}")
        print("Run KIEM_TRA_GAME.cmd after installing candidate resources.")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"[video_to_godot_animation] ERROR: {error}", file=sys.stderr)
        raise
