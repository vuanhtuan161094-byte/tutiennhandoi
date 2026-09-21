from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / "godot" / "art" / "approved" / "equipment" / "sliced"
DEFAULT_ATLAS_OUTPUT = ROOT / "godot" / "art" / "approved" / "equipment" / "atlases"

ATTIRE_SETS = ("metal", "wood", "water", "fire", "earth")
ATTIRE_SLOTS = ("weapon", "head", "robe", "belt", "gloves", "boots")
JEWELRY_SETS = ("huyen_nguyen", "pha_gioi", "hu_khong", "tran_thu")
JEWELRY_SLOTS = ("necklace", "ring", "bracelet", "talisman")


def _cell_bounds(length: int, index: int, count: int) -> tuple[int, int]:
    return round(index * length / count), round((index + 1) * length / count)


def _slice_grid(
    source: Path,
    rows: tuple[str, ...],
    cols: tuple[str, ...],
    category: str,
    output_root: Path,
    divider_inset: int = 2,
) -> int:
    image = Image.open(source).convert("RGBA")
    width, height = image.size
    written = 0
    for row_index, set_key in enumerate(rows):
        y0, y1 = _cell_bounds(height, row_index, len(rows))
        for col_index, slot in enumerate(cols):
            x0, x1 = _cell_bounds(width, col_index, len(cols))
            crop = image.crop((
                x0 + divider_inset,
                y0 + divider_inset,
                x1 - divider_inset,
                y1 - divider_inset,
            ))
            size = max(crop.size)
            canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
            canvas.alpha_composite(crop, ((size - crop.width) // 2, (size - crop.height) // 2))
            out = output_root / category / set_key / f"{slot}.webp"
            out.parent.mkdir(parents=True, exist_ok=True)
            canvas.save(out, "WEBP", lossless=True, method=4)
            written += 1
    return written


def _build_runtime_atlas(
    source: Path,
    cols: int,
    rows: int,
    cell_size: int,
    output: Path,
    divider_inset: int = 2,
) -> None:
    image = Image.open(source).convert("RGBA")
    width, height = image.size
    atlas = Image.new("RGBA", (cols * cell_size, rows * cell_size), (0, 0, 0, 0))
    for row in range(rows):
        y0, y1 = _cell_bounds(height, row, rows)
        for col in range(cols):
            x0, x1 = _cell_bounds(width, col, cols)
            crop = image.crop((
                x0 + divider_inset,
                y0 + divider_inset,
                x1 - divider_inset,
                y1 - divider_inset,
            ))
            crop.thumbnail((cell_size - 8, cell_size - 8), Image.Resampling.LANCZOS)
            x = col * cell_size + (cell_size - crop.width) // 2
            y = row * cell_size + (cell_size - crop.height) // 2
            atlas.alpha_composite(crop, (x, y))
    output.parent.mkdir(parents=True, exist_ok=True)
    atlas.save(output, "WEBP", lossless=True, method=6)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Slice the two user-approved equipment sheets without redrawing them."
    )
    parser.add_argument("--attire", required=True, type=Path, help="Approved 5x6 attire sheet.")
    parser.add_argument("--jewelry", required=True, type=Path, help="Approved 4x4 jewelry sheet.")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT, help="46-file output root.")
    parser.add_argument(
        "--atlas-output",
        type=Path,
        default=DEFAULT_ATLAS_OUTPUT,
        help="Runtime atlas output root.",
    )
    args = parser.parse_args()

    if not args.attire.is_file():
        raise FileNotFoundError(args.attire)
    if not args.jewelry.is_file():
        raise FileNotFoundError(args.jewelry)

    written = 0
    written += _slice_grid(args.attire, ATTIRE_SETS, ATTIRE_SLOTS, "attire", args.output)
    written += _slice_grid(args.jewelry, JEWELRY_SETS, JEWELRY_SLOTS, "jewelry", args.output)
    if written != 46:
        raise RuntimeError(f"Expected 46 sliced assets, got {written}.")

    _build_runtime_atlas(
        args.attire,
        cols=6,
        rows=5,
        cell_size=160,
        output=args.atlas_output / "attire_sets_v1.webp",
    )
    _build_runtime_atlas(
        args.jewelry,
        cols=4,
        rows=4,
        cell_size=200,
        output=args.atlas_output / "jewelry_sets_v1.webp",
    )

    print(f"Exported {written} approved item assets to {args.output}")
    print(f"Runtime atlases written to {args.atlas_output}")


if __name__ == "__main__":
    main()
