#!/usr/bin/env python3
"""Generate Google Play background-location disclosure walkthrough video (MP4)."""

from __future__ import annotations

import subprocess
from pathlib import Path

import imageio.v3 as iio
import imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "assets" / "app store" / "videos"
OUT_PATH = OUT_DIR / "google-play-background-location-walkthrough.mp4"

W, H = 1080, 1920
FPS = 24

# Theme
BG = (245, 247, 251)
SURFACE = (255, 255, 255)
PRIMARY = (37, 99, 235)
TEXT = (17, 24, 39)
TEXT2 = (55, 65, 81)
TEXT_MUTED = (107, 114, 128)
SUCCESS = (4, 120, 87)
SUCCESS_BG = (236, 253, 245)
BORDER = (229, 231, 235)
ANDROID_GREEN = (26, 115, 232)


def _font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    paths = (
        ["C:/Windows/Fonts/segoeuib.ttf", "C:/Windows/Fonts/arialbd.ttf"]
        if bold
        else ["C:/Windows/Fonts/segoeui.ttf", "C:/Windows/Fonts/arial.ttf"]
    )
    for p in paths:
        if Path(p).exists():
            return ImageFont.truetype(p, size=size)
    return ImageFont.load_default()


def _rounded(draw: ImageDraw.ImageDraw, xy: tuple, r: int, fill, outline=None, width=0):
    draw.rounded_rectangle(xy, radius=r, fill=fill, outline=outline, width=width)


def _base_trips() -> Image.Image:
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, W, 72), fill=SURFACE)
    d.text((48, 28), "9:41", font=_font(28), fill=TEXT)
    d.rectangle((0, 72, W, 200), fill=SURFACE)
    d.text((48, 100), "Trips", font=_font(44, True), fill=TEXT)
    d.text((48, 152), "GPS mileage & visit stops", font=_font(26), fill=TEXT_MUTED)

    stops = [
        ("1", "742 Evergreen Terrace", "09:15"),
        ("2", "Springfield Community Clinic", "10:40"),
    ]
    y = 240
    for num, addr, time in stops:
        _rounded(d, (40, y, W - 40, y + 100), 14, SURFACE, outline=BORDER, width=1)
        _rounded(d, (60, y + 28, 100, y + 72), 20, (219, 234, 254))
        d.text((78, y + 34), num, font=_font(28, True), fill=PRIMARY)
        d.text((120, y + 24), addr, font=_font(26, True), fill=TEXT)
        d.text((120, y + 60), time, font=_font(22), fill=TEXT_MUTED)
        y += 116

    # Start GPS Trip button
    _rounded(d, (40, H - 380, W - 40, H - 290), 18, PRIMARY)
    d.text((W // 2 - 200, H - 352), "Start GPS Trip", font=_font(34, True), fill=(255, 255, 255))
    d.text((W // 2 - 280, H - 420), "Record mileage for reimbursement logs", font=_font(24), fill=TEXT_MUTED)
    return img


def _frame_title() -> Image.Image:
    img = Image.new("RGB", (W, H), PRIMARY)
    d = ImageDraw.Draw(img)
    d.text((W // 2 - 380, H // 2 - 120), "Totus Secure Notes", font=_font(52, True), fill=(255, 255, 255))
    d.text((W // 2 - 420, H // 2 - 40), "Background location walkthrough", font=_font(36), fill=(219, 234, 254))
    d.text((W // 2 - 340, H // 2 + 40), "For Google Play review", font=_font(28), fill=(219, 234, 254))
    return img


def _frame_disclosure() -> Image.Image:
    """Prominent in-app disclosure BEFORE system prompt."""
    img = _base_trips().convert("RGBA")
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 140))
    img = Image.alpha_composite(img, overlay)
    d = ImageDraw.Draw(img)

    _rounded(d, (48, 420, W - 48, 1180), 24, SURFACE)
    d.text((80, 460), "Background location", font=_font(40, True), fill=TEXT)
    d.text((80, 520), "Totus Secure Notes", font=_font(28, True), fill=PRIMARY)

    body = (
        "When you tap Start GPS Trip, this app records your location\n"
        "in the background so mileage continues if you switch apps\n"
        "(for example, during phone calls or navigation).\n\n"
        "• Used ONLY while a trip you started is recording\n"
        "• NOT used for ads or analytics\n"
        "• Trip data stays encrypted on your device\n"
        "• You can decline and still use notes & templates\n\n"
        "Allow Totus Secure Notes to record trip mileage for\n"
        "patient visit reimbursement."
    )
    d.multiline_text((80, 580), body, font=_font(26), fill=TEXT2, spacing=8)

    _rounded(d, (80, 1060, W - 80, 1140), 14, PRIMARY)
    d.text((W // 2 - 200, 1082), "Continue to Start Trip", font=_font(30, True), fill=(255, 255, 255))
    return img.convert("RGB")


def _frame_tap_highlight(progress: float) -> Image.Image:
    img = _base_trips()
    d = ImageDraw.Draw(img)
    pulse = int(8 + 6 * abs((progress % 1) - 0.5) * 2)
    _rounded(d, (40 - pulse, H - 380 - pulse, W - 40 + pulse, H - 290 + pulse), 18 + pulse, None, outline=PRIMARY, width=4)
    if progress > 0.5:
        d.text((W // 2 - 80, H - 500), "Tap", font=_font(32, True), fill=PRIMARY)
    return img


def _frame_android_permission() -> Image.Image:
    img = _base_trips().convert("RGBA")
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 100))
    img = Image.alpha_composite(img, overlay)
    d = ImageDraw.Draw(img)

    # Android 12+ style permission sheet
    _rounded(d, (60, 520, W - 60, 1320), 28, SURFACE)
    d.ellipse((W // 2 - 48, 560, W // 2 + 48, 656), fill=(219, 234, 254))
    d.text((W // 2 - 18, 590), "📍", font=_font(40))
    d.text((W // 2 - 320, 680), "Allow Totus Secure Notes to access", font=_font(28, True), fill=TEXT)
    d.text((W // 2 - 280, 720), "this device's location?", font=_font(28, True), fill=TEXT)

    perm_body = (
        "Totus Secure Notes records trip mileage between\n"
        "patient visits for reimbursement logs.\n\n"
        "While using the app\n"
        "Only this time\n"
        "● Allow all the time  ← background"
    )
    d.multiline_text((100, 780), perm_body, font=_font(26), fill=TEXT2, spacing=6)
    d.text((100, 920), "● Allow all the time", font=_font(28, True), fill=ANDROID_GREEN)

    _rounded(d, (100, 1180, W - 100, 1260), 14, ANDROID_GREEN)
    d.text((W // 2 - 100, 1202), "Allow", font=_font(30, True), fill=(255, 255, 255))
    return img.convert("RGB")


def _frame_recording() -> Image.Image:
    img = _base_trips()
    d = ImageDraw.Draw(img)
    _rounded(d, (40, 220, W - 40, 340), 16, SUCCESS_BG, outline=SUCCESS, width=3)
    d.text((60, 248), "● GPS recording — background ON", font=_font(30, True), fill=SUCCESS)
    d.text((60, 292), "4.2 km · recording while you use other apps", font=_font(26), fill=TEXT)

    _rounded(d, (40, H - 380, W - 40, H - 290), 18, (185, 28, 28))
    d.text((W // 2 - 160, H - 352), "End GPS Trip", font=_font(34, True), fill=(255, 255, 255))
    return img


def _frame_end() -> Image.Image:
    img = _base_trips()
    d = ImageDraw.Draw(img)
    _rounded(d, (40, 220, W - 40, 340), 16, SURFACE, outline=BORDER, width=1)
    d.text((60, 260), "Trip saved — 12.4 km", font=_font(32, True), fill=TEXT)
    d.text((60, 302), "Background location stopped", font=_font(26), fill=SUCCESS)
    d.text((60, H - 200), "Recording ends when you tap End Trip or vault locks.", font=_font(24), fill=TEXT_MUTED)
    return img


def _hold(frames: list, img: Image.Image, seconds: float):
    n = int(seconds * FPS)
    rgb = img.convert("RGB")
    frames.extend([rgb] * n)


def _crossfade(frames: list, a: Image.Image, b: Image.Image, seconds: float):
    n = max(1, int(seconds * FPS))
    a_rgb = a.convert("RGB")
    b_rgb = b.convert("RGB")
    for i in range(n):
        t = i / max(n - 1, 1)
        blended = Image.blend(a_rgb, b_rgb, t)
        frames.append(blended)


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    frames: list[Image.Image] = []

    title = _frame_title()
    trips = _base_trips()
    disclosure = _frame_disclosure()
    permission = _frame_android_permission()
    recording = _frame_recording()
    ended = _frame_end()

    _hold(frames, title, 2.5)
    _crossfade(frames, title, trips, 0.5)
    _hold(frames, trips, 2.0)
    _crossfade(frames, trips, disclosure, 0.4)
    _hold(frames, disclosure, 7.0)  # prominent disclosure — key for Play review

    # Tap animation
    tap_frames = int(2.0 * FPS)
    for i in range(tap_frames):
        frames.append(_frame_tap_highlight(i / tap_frames))

    _crossfade(frames, disclosure, permission, 0.4)
    _hold(frames, permission, 5.0)
    _crossfade(frames, permission, recording, 0.4)
    _hold(frames, recording, 4.0)
    _crossfade(frames, recording, ended, 0.4)
    _hold(frames, ended, 3.0)

    # Pad to ~30s if short
    target = int(30 * FPS)
    while len(frames) < target:
        frames.append(frames[-1])
    frames = frames[:target]

    print(f"Encoding {len(frames)} frames @ {FPS}fps -> {OUT_PATH}")
    iio.imwrite(
        OUT_PATH,
        [f for f in frames],
        fps=FPS,
        codec="libx264",
        pixelformat="yuv420p",
        ffmpeg_params=["-movflags", "+faststart"],
    )

    mb = OUT_PATH.stat().st_size / (1024 * 1024)
    print(f"Done: {OUT_PATH} ({mb:.2f} MB, ~{len(frames)/FPS:.1f}s)")


if __name__ == "__main__":
    main()
