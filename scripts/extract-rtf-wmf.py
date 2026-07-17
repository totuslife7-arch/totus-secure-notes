"""Extract WMF images embedded in RTF (\\wmetafile8) to .wmf files."""
from __future__ import annotations

import re
import sys
from pathlib import Path


def extract_wmf(rtf_path: Path, out_dir: Path) -> list[Path]:
    text = rtf_path.read_text(encoding="latin-1", errors="ignore")
    pattern = re.compile(
        r"\\wmetafile8[\s\S]*?\r?\n([\da-fA-F\r\n]+)\r?\n\}",
        re.MULTILINE,
    )
    out_dir.mkdir(parents=True, exist_ok=True)
    saved: list[Path] = []
    for i, match in enumerate(pattern.finditer(text), start=1):
        hex_blob = re.sub(r"\s+", "", match.group(1))
        if len(hex_blob) < 20:
            continue
        data = bytes.fromhex(hex_blob)
        out = out_dir / f"screenshot-{i:02d}.wmf"
        out.write_bytes(data)
        saved.append(out)
    return saved


def main() -> int:
    rtf = Path(sys.argv[1])
    out = Path(sys.argv[2])
    files = extract_wmf(rtf, out)
    print(f"Extracted {len(files)} WMF files to {out}")
    for f in files:
        print(f"  {f.name} ({f.stat().st_size} bytes)")
    return 0 if files else 1


if __name__ == "__main__":
    raise SystemExit(main())
