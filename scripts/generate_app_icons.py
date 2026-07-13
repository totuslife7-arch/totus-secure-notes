#!/usr/bin/env python3
"""Generate Expo app icons and splash assets from assets/images/TLS.png with a padlock overlay."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets" / "images"
SOURCE = ASSETS / "TLS.png"

ICON_SIZE = 1024
ANDROID_BG = "#E6F4FE"
FAVICON_SIZE = 48

# Keep artwork inside the adaptive-icon safe zone (~66% center circle).
CONTENT_SCALE = 0.76
CONTENT_ANCHOR = (0.5, 0.54)  # nudge down — source art sits a bit high


def _lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def _lerp_color(
    top: tuple[int, int, int],
    bottom: tuple[int, int, int],
    t: float,
) -> tuple[int, int, int]:
    return (
        int(_lerp(top[0], bottom[0], t)),
        int(_lerp(top[1], bottom[1], t)),
        int(_lerp(top[2], bottom[2], t)),
    )


def _vertical_gradient(size: tuple[int, int], top: tuple[int, int, int], bottom: tuple[int, int, int]) -> Image.Image:
    width, height = size
    grad = Image.new("RGBA", size)
    px = grad.load()
    for y in range(height):
        color = _lerp_color(top, bottom, y / max(height - 1, 1))
        for x in range(width):
            px[x, y] = (*color, 255)
    return grad


def _mask_from_draw(draw_fn, size: tuple[int, int]) -> Image.Image:
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw_fn(draw)
    return mask


def load_base(size: int = ICON_SIZE) -> Image.Image:
    src = Image.open(SOURCE).convert("RGBA")
    content_size = int(size * CONTENT_SCALE)
    src = ImageOps.fit(
        src,
        (content_size, content_size),
        method=Image.Resampling.LANCZOS,
        centering=(0.5, 0.5),
    )

    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    left = int(size * CONTENT_ANCHOR[0] - content_size / 2)
    top = int(size * CONTENT_ANCHOR[1] - content_size / 2)
    canvas.alpha_composite(src, (left, top))
    return canvas


def draw_metallic_padlock(
    canvas: Image.Image,
    *,
    center: tuple[float, float],
    scale: float,
) -> None:
    """Draw a larger, 3D silver padlock with highlights and depth."""
    overlay = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    cx, cy = center
    body_w = scale * 0.68
    body_h = scale * 0.78
    radius = scale * 0.11
    stroke = max(3, int(scale * 0.045))

    body_left = cx - body_w / 2
    body_top = cy - body_h * 0.02
    body_right = cx + body_w / 2
    body_bottom = body_top + body_h

    shackle_w = body_w * 0.82
    shackle_h = scale * 0.48
    shackle_thickness = max(6, int(scale * 0.13))
    shackle_left = cx - shackle_w / 2
    shackle_top = body_top - shackle_h * 0.95

    outline = (34, 44, 58, 255)
    silver_top = (236, 242, 248)
    silver_mid = (176, 188, 202)
    silver_bottom = (108, 120, 136)
    highlight = (255, 255, 255, 210)

    # Drop shadow
    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rounded_rectangle(
        [
            body_left + scale * 0.05,
            body_top + scale * 0.08,
            body_right + scale * 0.08,
            body_bottom + scale * 0.1,
        ],
        radius=radius,
        fill=(0, 0, 0, 95),
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=max(3, int(scale * 0.05))))
    canvas.alpha_composite(shadow)

    # Shackle outer tube
    shackle_box = [
        shackle_left - stroke,
        shackle_top - stroke,
        shackle_left + shackle_w + stroke,
        body_top + scale * 0.06,
    ]
    draw.arc(shackle_box, start=200, end=-20, fill=outline, width=stroke + 2)
    draw.arc(
        [
            shackle_left + stroke * 0.6,
            shackle_top + stroke * 0.6,
            shackle_left + shackle_w - stroke * 0.6,
            body_top + scale * 0.06 - stroke * 0.6,
        ],
        start=200,
        end=-20,
        fill=silver_mid,
        width=shackle_thickness,
    )

    # Shackle posts
    for x0, x1 in (
        (shackle_left, shackle_left + shackle_thickness),
        (shackle_left + shackle_w - shackle_thickness, shackle_left + shackle_w),
    ):
        draw.rounded_rectangle(
            [x0, shackle_top + shackle_h * 0.32, x1, body_top + scale * 0.03],
            radius=shackle_thickness // 2,
            fill=silver_mid,
            outline=outline,
            width=stroke,
        )

    # Body gradient fill via mask
    body_box = (int(body_left), int(body_top), int(body_right), int(body_bottom))
    body_mask = _mask_from_draw(
        lambda d: d.rounded_rectangle(body_box, radius=int(radius), fill=255),
        (canvas.width, canvas.height),
    )
    body_grad = _vertical_gradient((canvas.width, canvas.height), silver_top, silver_bottom)
    body_layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    body_layer.paste(body_grad, mask=body_mask)
    overlay.alpha_composite(body_layer)

    # Body rim + bevel
    draw.rounded_rectangle(body_box, radius=radius, outline=outline, width=stroke)
    draw.rounded_rectangle(
        [
            body_left + stroke * 0.8,
            body_top + stroke * 0.8,
            body_right - stroke * 0.4,
            body_bottom - stroke * 0.8,
        ],
        radius=max(2, radius - stroke),
        outline=(255, 255, 255, 120),
        width=max(2, stroke // 2),
    )

    # Specular highlight on body
    highlight_w = body_w * 0.34
    highlight_h = body_h * 0.22
    draw.ellipse(
        [
            cx - body_w * 0.28,
            body_top + body_h * 0.1,
            cx - body_w * 0.28 + highlight_w,
            body_top + body_h * 0.1 + highlight_h,
        ],
        fill=highlight,
    )
    draw.ellipse(
        [
            shackle_left + shackle_w * 0.18,
            shackle_top + shackle_h * 0.12,
            shackle_left + shackle_w * 0.18 + shackle_w * 0.28,
            shackle_top + shackle_h * 0.12 + shackle_h * 0.18,
        ],
        fill=(255, 255, 255, 170),
    )

    # Keyhole
    hole_r = scale * 0.075
    hole_cy = body_top + body_h * 0.43
    draw.ellipse(
        [cx - hole_r, hole_cy - hole_r, cx + hole_r, hole_cy + hole_r],
        fill=(24, 32, 44, 255),
        outline=(12, 18, 28, 255),
        width=max(2, stroke // 2),
    )
    slot_h = scale * 0.17
    slot_w = scale * 0.055
    draw.rounded_rectangle(
        [cx - slot_w / 2, hole_cy, cx + slot_w / 2, hole_cy + slot_h],
        radius=int(slot_w / 2),
        fill=(24, 32, 44, 255),
    )

    canvas.alpha_composite(overlay)


def compose_branded(size: int = ICON_SIZE, padlock_scale: float = 0.26) -> Image.Image:
    base = load_base(size)
    padlock_size = size * padlock_scale
    draw_metallic_padlock(base, center=(size / 2, size / 2), scale=padlock_size)
    return base


def to_opaque_white_bg(rgba: Image.Image) -> Image.Image:
    bg = Image.new("RGBA", rgba.size, (255, 255, 255, 255))
    bg.alpha_composite(rgba)
    return bg.convert("RGB")


def make_monochrome(rgba: Image.Image) -> Image.Image:
    """Single-color silhouette for Android themed icon."""
    gray = rgba.convert("L")
    alpha = rgba.split()[3]
    mono = Image.new("RGBA", rgba.size, (0, 0, 0, 0))
    pixels = mono.load()
    gray_px = gray.load()
    alpha_px = alpha.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            if alpha_px[x, y] < 32:
                continue
            if gray_px[x, y] < 245:
                pixels[x, y] = (15, 23, 42, min(255, alpha_px[x, y]))
    return mono


def make_background(size: int = ICON_SIZE) -> Image.Image:
    img = Image.new("RGB", (size, size), ANDROID_BG)
    draw = ImageDraw.Draw(img)
    for i in range(size // 2, 0, -4):
        alpha = int(18 * (1 - i / (size / 2)))
        color = (230, 244, 254 - min(20, alpha))
        draw.ellipse([size // 2 - i, size // 2 - i, size // 2 + i, size // 2 + i], fill=color)
    return img


def save_png(img: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, format="PNG", optimize=True)
    print(f"  wrote {path.relative_to(ROOT)} ({img.size[0]}x{img.size[1]})")


def main() -> None:
    if not SOURCE.exists():
        raise SystemExit(f"Missing source image: {SOURCE}")

    print(f"Using source: {SOURCE.relative_to(ROOT)}")
    branded = compose_branded(ICON_SIZE)

    outputs: list[tuple[str, Image.Image]] = [
        ("icon.png", to_opaque_white_bg(branded)),
        ("android-icon-foreground.png", branded.copy()),
        ("android-icon-background.png", make_background(ICON_SIZE)),
        ("android-icon-monochrome.png", make_monochrome(branded)),
        ("splash-icon.png", to_opaque_white_bg(compose_branded(ICON_SIZE, padlock_scale=0.3))),
        ("favicon.png", to_opaque_white_bg(branded).resize((FAVICON_SIZE, FAVICON_SIZE), Image.Resampling.LANCZOS)),
    ]

    print("Generating assets:")
    for name, image in outputs:
        save_png(image, ASSETS / name)

    print("Done.")


if __name__ == "__main__":
    main()
