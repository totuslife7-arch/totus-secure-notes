#!/usr/bin/env python3
"""Generate Google Play feature graphic (1024x500)."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "assets" / "app store"
ICON = OUT_DIR / "source-1024.png"
if not ICON.exists():
    ICON = ROOT / "assets" / "images" / "icon.png"

WIDTH, HEIGHT = 1024, 500
OUT_PATH = OUT_DIR / "google-play-feature-graphic-1024x500.png"

# Brand palette
BG_TOP = (230, 244, 254)      # #E6F4FE
BG_BOTTOM = (245, 247, 251)   # #f5f7fb
PRIMARY = (37, 99, 235)        # #2563eb
TEXT_DARK = (17, 24, 39)       # #111827
TEXT_MID = (55, 65, 81)        # #374151
ACCENT_GREEN = (4, 120, 87)      # #047857


def _gradient(size: tuple[int, int]) -> Image.Image:
    w, h = size
    img = Image.new("RGB", size)
    px = img.load()
    for y in range(h):
        t = y / max(h - 1, 1)
        r = int(BG_TOP[0] + (BG_BOTTOM[0] - BG_TOP[0]) * t)
        g = int(BG_TOP[1] + (BG_BOTTOM[1] - BG_TOP[1]) * t)
        b = int(BG_TOP[2] + (BG_BOTTOM[2] - BG_TOP[2]) * t)
        for x in range(w):
            px[x, y] = (r, g, b)
    return img


def _load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = []
    if bold:
        candidates = [
            "C:/Windows/Fonts/segoeuib.ttf",
            "C:/Windows/Fonts/arialbd.ttf",
            "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        ]
    else:
        candidates = [
            "C:/Windows/Fonts/segoeui.ttf",
            "C:/Windows/Fonts/arial.ttf",
            "/System/Library/Fonts/Supplemental/Arial.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        ]
    for path in candidates:
        p = Path(path)
        if p.exists():
            return ImageFont.truetype(str(p), size=size)
    return ImageFont.load_default()


def _rounded_panel(size: tuple[int, int], radius: int, fill: tuple[int, int, int, int]) -> Image.Image:
    w, h = size
    panel = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(panel)
    draw.rounded_rectangle((0, 0, w - 1, h - 1), radius=radius, fill=fill)
    return panel


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    canvas = _gradient((WIDTH, HEIGHT)).convert("RGBA")

    # Soft decorative circles
    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    odraw = ImageDraw.Draw(overlay)
    odraw.ellipse((720, -80, 1120, 320), fill=(*PRIMARY, 18))
    odraw.ellipse((-60, 280, 280, 620), fill=(*ACCENT_GREEN, 14))
    overlay = overlay.filter(ImageFilter.GaussianBlur(8))
    canvas = Image.alpha_composite(canvas, overlay)

    draw = ImageDraw.Draw(canvas)

    # Left icon with subtle shadow
    icon_size = 300
    icon = Image.open(ICON).convert("RGBA")
    icon = ImageOps.fit(icon, (icon_size, icon_size), Image.Resampling.LANCZOS)
    shadow = Image.new("RGBA", (icon_size + 40, icon_size + 40), (0, 0, 0, 0))
    sh_draw = ImageDraw.Draw(shadow)
    sh_draw.ellipse((12, 18, icon_size + 20, icon_size + 26), fill=(0, 0, 0, 45))
    shadow = shadow.filter(ImageFilter.GaussianBlur(12))
    icon_x, icon_y = 56, (HEIGHT - icon_size) // 2
    canvas.alpha_composite(shadow, (icon_x - 8, icon_y + 6))
    canvas.alpha_composite(icon, (icon_x, icon_y))

    # Text block
    title_font = _load_font(52, bold=True)
    subtitle_font = _load_font(24, bold=False)
    bullet_font = _load_font(21, bold=False)
    tag_font = _load_font(17, bold=True)

    text_x = 390
    draw.text((text_x, 58), "Totus Secure Notes", font=title_font, fill=TEXT_DARK)
    draw.text(
        (text_x, 122),
        "Encrypted local notes for nurses & field care",
        font=subtitle_font,
        fill=TEXT_MID,
    )

    # Accent underline
    draw.rounded_rectangle((text_x, 162, text_x + 220, 168), radius=3, fill=PRIMARY)

    bullets = [
        "AES-256 vault on your device — no cloud account",
        "Postpartum & clinical templates · Copy for Plexia / EMR",
        "GPS trip mileage · Google Maps multi-stop routes",
        "Template AI on-device (Pro) · Desktop vault export",
    ]

    y = 188
    for line in bullets:
        draw.ellipse((text_x, y + 8, text_x + 10, y + 18), fill=PRIMARY)
        draw.text((text_x + 22, y), line, font=bullet_font, fill=TEXT_DARK)
        y += 44

    # Bottom trust chips
    chip_y = 418
    chips = ["Local-first", "Biometric unlock", "Productivity tool"]
    chip_x = text_x
    for label in chips:
        chip_font = tag_font
        bbox = draw.textbbox((0, 0), label, font=chip_font)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        pad_x, pad_y = 14, 8
        chip_w = tw + pad_x * 2
        chip_h = th + pad_y * 2
        chip = _rounded_panel((chip_w, chip_h), 14, (*PRIMARY, 28))
        canvas.alpha_composite(chip, (chip_x, chip_y))
        draw.text((chip_x + pad_x, chip_y + pad_y - 2), label, font=chip_font, fill=PRIMARY)
        chip_x += chip_w + 12

    # Small padlock hint line
    draw.text(
        (text_x, 468),
        "Your data stays on your phone. You control what leaves via export.",
        font=_load_font(15),
        fill=TEXT_MID,
    )

    final = canvas.convert("RGB")
    final.save(OUT_PATH, format="PNG", optimize=True)
    kb = OUT_PATH.stat().st_size / 1024
    print(f"Wrote {OUT_PATH} ({WIDTH}x{HEIGHT}, {kb:.1f} KB)")


if __name__ == "__main__":
    main()
