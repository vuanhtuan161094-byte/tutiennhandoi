from __future__ import annotations

import argparse
import struct
from io import BytesIO
from pathlib import Path

from PIL import Image


def mjpeg_frames(data: bytes):
    if data[:4] != b"RIFF" or data[8:12] != b"AVI ":
        raise ValueError("not a RIFF AVI file")

    def chunks(start: int, end: int):
        offset = start
        while offset + 8 <= end:
            chunk_id = data[offset : offset + 4]
            chunk_size = struct.unpack_from("<I", data, offset + 4)[0]
            payload = offset + 8
            chunk_end = payload + chunk_size
            if chunk_end > end:
                raise ValueError(f"truncated AVI chunk {chunk_id!r}")
            if chunk_id == b"LIST":
                list_type = data[payload : payload + 4]
                if list_type == b"movi":
                    yield from chunks(payload + 4, chunk_end)
            elif chunk_id in {b"00dc", b"00db"}:
                yield data[payload:chunk_end]
            offset = chunk_end + (chunk_size & 1)

    yield from chunks(12, len(data))


def main() -> None:
    parser = argparse.ArgumentParser(description="Validate the Godot MJPEG motion-reference AVI.")
    parser.add_argument("avi", type=Path)
    parser.add_argument("--frames", type=int, default=24)
    parser.add_argument("--width", type=int, default=390)
    parser.add_argument("--height", type=int, default=844)
    args = parser.parse_args()

    data = args.avi.read_bytes()
    frames = list(mjpeg_frames(data))
    if len(frames) != args.frames:
        raise SystemExit(f"frame count mismatch: expected {args.frames}, got {len(frames)}")
    for index, encoded in enumerate(frames):
        with Image.open(BytesIO(encoded)) as image:
            if image.format != "JPEG" or image.size != (args.width, args.height):
                raise SystemExit(f"invalid frame {index}: {image.format} {image.size}")
            image.verify()
    print(f"MOTION_AVI_PASS frames={len(frames)} size={args.width}x{args.height} bytes={len(data)} codec=MJPEG")


if __name__ == "__main__":
    main()
