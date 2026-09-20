#!/usr/bin/env python3
"""Build the global media catalog consumed by the viewer."""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBLIC_MEDIA = ROOT / "public" / "media"
OUT = ROOT / "public" / "data" / "media.json"

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"}
VIDEO_EXTENSIONS = {".mp4", ".webm", ".mov", ".m4v"}
DOCUMENT_EXTENSIONS = {".pdf", ".doc", ".docx", ".xls", ".xlsx", ".vcf"}


def classify(path):
    suffix = path.suffix.lower()
    if suffix in IMAGE_EXTENSIONS:
        return "image"
    if suffix in VIDEO_EXTENSIONS:
        return "video"
    if suffix in DOCUMENT_EXTENSIONS:
        return "document"
    return None


def main():
    PUBLIC_MEDIA.mkdir(parents=True, exist_ok=True)
    items = []
    for path in sorted(PUBLIC_MEDIA.rglob("*")):
        if not path.is_file():
            continue
        kind = classify(path)
        if not kind:
            continue
        items.append({"id": path.relative_to(PUBLIC_MEDIA).as_posix(), "path": path.relative_to(PUBLIC_MEDIA).as_posix(), "type": kind})
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"items": items}, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"media.json: {len(items)} files")


if __name__ == "__main__":
    main()