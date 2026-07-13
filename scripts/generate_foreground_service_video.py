#!/usr/bin/env python3
"""Generate Play Console video for FOREGROUND_SERVICE_LOCATION (GPS trip + notification)."""

from __future__ import annotations

from pathlib import Path

import imageio.v3 as iio
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "assets" / "app store" / "videos"
OUT_PATH = OUT_DIR / "google-play-foreground-service-location.mp4"

W, H = 1080, 1920
FPS = 24

BG = (245, 247, 251)
SURFACE = (255, 255, 255)
PRIMARY = (37, 99, 235)
TEXT = (17, 24, 39)
TEXT2 = (55, 65, 81)
TEXT_MUTED = (107, 114, 128)
SUCCESS = (4, 120, 87)
SUCCESS_BG = (236, 253, 245)
BORDER = (229, 231, 235)


def _font(size: int, bold: bool = False):
    paths = (
        ["C:/Windows/Fonts/segoeuib.ttf", "C:/Windows/Fonts/arialbd.ttf"]
        if bold
        else ["C:/Windows/Fonts/segoeui.ttf", "C:/Windows/Fonts/arial.ttf"]
    )
    for p in paths:
        if Path(p).exists():
            return ImageFont.truetype(p, size=size)
    return ImageFont.load_default()


def _rounded(d, xy, r, fill, outline=None, width=0):
    d.rounded_rectangle(xy, radius=r, fill=fill, outline=outline, width=width)


def _trips_screen(recording: bool = False, show_maps_btn: bool = False) -> Image.Image:
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, W, 72), fill=SURFACE)
    d.text((48, 28), "9:41", font=_font(28), fill=TEXT)
    d.rectangle((0, 72, W, 200), fill=SURFACE)
    d.text((48, 100), "Trips", font=_font(44, True), fill=TEXT)
    d.text((48, 152), "Visit-day route & GPS mileage", font=_font(26), fill=TEXT_MUTED)

    stops = [("1", "742 Evergreen Terrace"), ("2", "Springfield Clinic"), ("3", "22 Maple Ave")]
    y = 240
    for num, addr in stops:
        _rounded(d, (40, y, W - 40, y + 90), 14, SURFACE, outline=BORDER, width=1)
        _rounded(d, (60, y + 22, 100, y + 66), 18, (219, 234, 254))
        d.text((78, y + 28), num, font=_font(26, True), fill=PRIMARY)
        d.text((120, y + 30), addr, font=_font(26, True), fill=TEXT)
        y += 106

    if recording:
        _rounded(d, (40, 560, W - 40, 660), 16, SUCCESS_BG, outline=SUCCESS, width=3)
        d.text((60, 590), "● GPS recording — foreground service active", font=_font(28, True), fill=SUCCESS)
        d.text((60, 630), "Visible notification while you use other apps", font=_font(24), fill=TEXT2)
        _rounded(d, (40, H - 300, W - 40, H - 220), 16, (185, 28, 28))
        d.text((W // 2 - 150, H - 272), "End GPS Trip", font=_font(32, True), fill=(255, 255, 255))
    else:
        _rounded(d, (40, H - 380, W - 40, H - 290), 18, PRIMARY)
        d.text((W // 2 - 200, H - 352), "Start GPS Trip", font=_font(34, True), fill=(255, 255, 255))

    if show_maps_btn:
        _rounded(d, (40, H - 500, W - 40, H - 420), 14, SURFACE, outline=PRIMARY, width=2)
        d.text((W // 2 - 260, H - 472), "Open multi-stop route in Google Maps", font=_font(28, True), fill=PRIMARY)

    return img


def _notification_shade() -> Image.Image:
    img = _trips_screen(recording=True).convert("RGBA")
    # notification shade overlay
    shade = Image.new("RGBA", (W, 180), (255, 255, 255, 245))
    img.paste(shade, (0, 72), shade)
    d = ImageDraw.Draw(img)
    d.text((48, 100), "Totus Secure Notes", font=_font(26, True), fill=TEXT)
    d.text((48, 140), "Recording trip mileage — tap to return to app", font=_font(24), fill=TEXT2)
    d.text((48, 175), "Foreground service · Location", font=_font(20), fill=TEXT_MUTED)
    return img.convert("RGB")


def _disclosure() -> Image.Image:
    img = _trips_screen().convert("RGBA")
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 130))
    img = Image.alpha_composite(img, overlay)
    d = ImageDraw.Draw(img)
    _rounded(d, (48, 400, W - 48, 1100), 24, SURFACE)
    d.text((80, 440), "Foreground location service", font=_font(38, True), fill=TEXT)
    body = (
        "When you start GPS Trip, Android shows a persistent\n"
        "notification while mileage is recorded in the background.\n\n"
        "• User must tap Start GPS Trip\n"
        "• Used for visit-day mileage reimbursement logs\n"
        "• Stops when you tap End GPS Trip\n"
        "• Not used for ads or tracking when idle\n\n"
        "You may open your stop list in Google Maps for\n"
        "turn-by-turn directions — mileage stays in Totus."
    )
    d.multiline_text((80, 520), body, font=_font(26), fill=TEXT2, spacing=8)
    return img.convert("RGB")


def _title() -> Image.Image:
    img = Image.new("RGB", (W, H), PRIMARY)
    d = ImageDraw.Draw(img)
    d.text((W // 2 - 420, H // 2 - 100), "Foreground service location", font=_font(44, True), fill=(255, 255, 255))
    d.text((W // 2 - 380, H // 2 - 20), "Totus Secure Notes — GPS trip demo", font=_font(30), fill=(219, 234, 254))
    return img


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    frames = []

    def hold(img, sec):
        rgb = img.convert("RGB")
        frames.extend([rgb] * int(sec * FPS))

    def fade(a, b, sec):
        n = max(1, int(sec * FPS))
        ar, br = a.convert("RGB"), b.convert("RGB")
        for i in range(n):
            frames.append(Image.blend(ar, br, i / max(n - 1, 1)))

    hold(_title(), 2)
    fade(_title(), _trips_screen(), 0.5)
    hold(_trips_screen(show_maps_btn=True), 3)
    fade(_trips_screen(), _disclosure(), 0.4)
    hold(_disclosure(), 6)
    fade(_disclosure(), _trips_screen(recording=True), 0.4)
    hold(_trips_screen(recording=True), 3)
    fade(_trips_screen(recording=True), _notification_shade(), 0.3)
    hold(_notification_shade(), 5)
    fade(_notification_shade(), _trips_screen(recording=True, show_maps_btn=True), 0.3)
    hold(_trips_screen(recording=True, show_maps_btn=True), 4)
    fade(_trips_screen(recording=True), _trips_screen(), 0.4)
    hold(_trips_screen(), 2)

    target = int(30 * FPS)
    while len(frames) < target:
        frames.append(frames[-1])
    frames = frames[:target]

    iio.imwrite(OUT_PATH, frames, fps=FPS, codec="libx264", pixelformat="yuv420p", ffmpeg_params=["-movflags", "+faststart"])
    print(f"Wrote {OUT_PATH} ({len(frames)/FPS:.1f}s, {OUT_PATH.stat().st_size/1024/1024:.2f} MB)")


if __name__ == "__main__":
    main()
