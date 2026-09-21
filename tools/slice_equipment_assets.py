from __future__ import annotations

from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = ROOT / "assets" / "_pipeline" / "approved" / "equipment" / "source"
OUTPUT_ROOT = ROOT / "godot" / "art" / "approved" / "equipment" / "sliced"

ATTIRE_SOURCE = SOURCE_ROOT / "attire_sets_approved.png"
JEWELRY_SOURCE = SOURCE_ROOT / "jewelry_sets_approved.png"

ATTIRE_SETS = ("metal", "wood", "water", "fire", "earth")
ATTIRE_SLOTS = ("weapon", "head", "robe", "belt", "gloves", "boots")
JEWELRY_SETS = ("huyen_nguyen", "pha_gioi", "hu_khong", "tran_thu")
JEWELRY_SLOTS = ("necklace", "ring", "bracelet", "talisman")


def _cell_bounds(length: int, index: int, count: int) -> tuple[int, int]:
    return round(index * length / count), round((index + 1) * length / count)


def _export_grid(
    source: Path,
    rows: tuple[str, ...],
    cols: tuple[str, ...],
    category: str,
    divider_inset: int = 2,
) -> None:
    image = Image.open(source).convert("RGBA")
    width, height = image.size
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
            canvas.alpha_composite(
                crop,
                ((size - crop.width) // 2, (size - crop.height) // 2),
            )
            out = OUTPUT_ROOT / category / set_key / f"{slot}.webp"
            out.parent.mkdir(parents=True, exist_ok=True)
            canvas.save(out, "WEBP", lossless=True, method=4)


def main() -> None:
    if not ATTIRE_SOURCE.exists():
        raise FileNotFoundError(ATTIRE_SOURCE)
    if not JEWELRY_SOURCE.exists():
        raise FileNotFoundError(JEWELRY_SOURCE)
    _export_grid(ATTIRE_SOURCE, ATTIRE_SETS, ATTIRE_SLOTS, "attire")
    _export_grid(JEWELRY_SOURCE, JEWELRY_SETS, JEWELRY_SLOTS, "jewelry")
    count = len(list(OUTPUT_ROOT.rglob("*.webp")))
    if count != 46:
        raise RuntimeError(f"Expected 46 sliced assets, got {count}.")
    print(f"Exported {count} approved equipment assets to {OUTPUT_ROOT}")


if __name__ == "__main__":
    main()
