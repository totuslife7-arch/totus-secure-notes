#!/usr/bin/env python3
"""Generate Play Console video for FOREGROUND_SERVICE_MEDIA_PLAYBACK (voice memo playback)."""

from __future__ import annotations

from pathlib import Path

import imageio.v3 as iio
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "assets" / "app store" / "videos"
OUT_PATH = OUT_DIR / "google-play-foreground-service-media-playback.mp4"

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
DANGER = (185, 28, 28)


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


def _status_bar(d):
    d.rectangle((0, 0, W, 72), fill=SURFACE)
    d.text((48, 28), "9:41", font=_font(28), fill=TEXT)


def _note_header(d, title: str):
    d.rectangle((0, 72, W, 200), fill=SURFACE)
    d.text((48, 100), title, font=_font(36, True), fill=TEXT)
    d.text((48, 148), "Encrypted note · voice memo attachment", font=_font(24), fill=TEXT_MUTED)


def _note_editor(recording: bool = False, has_attachment: bool = False) -> Image.Image:
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    _status_bar(d)
    _note_header(d, "Postpartum home visit")

    d.text((48, 230), "Patient stable. Weight logged manually.", font=_font(26), fill=TEXT2)

    # Voice memo recorder card
    _rounded(d, (40, 320, W - 40, 480), 12, SURFACE, outline=BORDER, width=1)
    if recording:
        _rounded(d, (60, 360, 220, 430), 10, DANGER)
        d.text((95, 378), "Stop", font=_font(28, True), fill=(255, 255, 255))
        d.text((250, 368), "0:18", font=_font(36, True), fill=TEXT)
        d.text((250, 410), "Recording…", font=_font(22), fill=TEXT_MUTED)
        for i in range(5):
            h = 10 + (i % 3) * 8
            d.rectangle((260 + i * 18, 440 - h, 268 + i * 18, 440), fill=PRIMARY)
    else:
        _rounded(d, (60, 360, 220, 430), 10, PRIMARY)
        d.text((78, 378), "Record", font=_font(28, True), fill=(255, 255, 255))
        d.text((250, 368), "0:00", font=_font(36, True), fill=TEXT)
        d.text((250, 410), "Voice memo (encrypted)", font=_font(22), fill=TEXT_MUTED)

    if has_attachment:
        _rounded(d, (40, 520, W - 40, 620), 12, SUCCESS_BG, outline=SUCCESS, width=2)
        d.text((60, 548), "voice_memo_2026-07-13.m4a", font=_font(26, True), fill=TEXT)
        d.text((60, 582), "Encrypted attachment saved to vault", font=_font(22), fill=SUCCESS)

    _rounded(d, (40, H - 160, W - 40, H - 80), 14, PRIMARY)
    d.text((W // 2 - 60, H - 132), "Save", font=_font(30, True), fill=(255, 255, 255))
    return img


def _attachment_viewer(playing: bool = False, progress: float = 0.35) -> Image.Image:
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    _status_bar(d)
    d.rectangle((0, 72, W, 160), fill=SURFACE)
    d.text((48, 100), "Close", font=_font(26, True), fill=PRIMARY)
    d.text((W // 2 - 180, 100), "voice_memo_2026-07-13.m4a", font=_font(24, True), fill=TEXT)
    d.text((W - 140, 100), "Delete", font=_font(26, True), fill=DANGER)

    d.text((W // 2 - 120, 420), "Voice memo", font=_font(32, True), fill=TEXT)
    label = "Pause" if playing else "Play"
    _rounded(d, (W // 2 - 100, 500, W // 2 + 100, 580), 14, PRIMARY)
    d.text((W // 2 - 50, 528), label, font=_font(30, True), fill=(255, 255, 255))

    if playing:
        dur = 18
        cur = int(dur * progress)
        d.text((W // 2 - 80, 610), f"{cur}s / {dur}s", font=_font(24), fill=TEXT_MUTED)
        bar_w = W - 160
        _rounded(d, (80, 660, 80 + bar_w, 680), 8, BORDER)
        fill_w = int(bar_w * progress)
        if fill_w > 0:
            _rounded(d, (80, 660, 80 + fill_w, 680), 8, PRIMARY)

    d.text(
        (W // 2 - 340, H - 200),
        "Viewed only inside Totus. Screen capture blocked while open.",
        font=_font(22),
        fill=TEXT_MUTED,
    )
    return img


def _disclosure() -> Image.Image:
    img = _note_editor(has_attachment=True).convert("RGBA")
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 130))
    img = Image.alpha_composite(img, overlay)
    d = ImageDraw.Draw(img)
    _rounded(d, (48, 380, W - 48, 1120), 24, SURFACE)
    d.text((80, 420), "Media playback service", font=_font(38, True), fill=TEXT)
    body = (
        "When you tap Play on an encrypted voice memo,\n"
        "Android may show a media playback notification\n"
        "so audio is not cut off if you briefly switch apps\n"
        "(for example, checking Maps between visits).\n\n"
        "• User must tap Play — never auto-starts\n"
        "• Pause / Close stops playback immediately\n"
        "• Audio stays encrypted on your device\n"
        "• Not used for music, ads, or streaming\n\n"
        "Microphone is separate — only when you tap Record."
    )
    d.multiline_text((80, 500), body, font=_font(26), fill=TEXT2, spacing=8)
    return img.convert("RGB")


def _notification_shade(playing: bool = True) -> Image.Image:
    img = _attachment_viewer(playing=playing, progress=0.55).convert("RGBA")
    shade = Image.new("RGBA", (W, 200), (255, 255, 255, 248))
    img.paste(shade, (0, 72), shade)
    d = ImageDraw.Draw(img)
    d.text((48, 100), "Totus Secure Notes", font=_font(26, True), fill=TEXT)
    d.text((48, 140), "Playing voice memo — tap to return to app", font=_font(24), fill=TEXT2)
    d.text((48, 178), "Foreground service · Media playback", font=_font(20), fill=TEXT_MUTED)
    return img.convert("RGB")


def _home_with_notification() -> Image.Image:
    img = Image.new("RGB", (W, H), (30, 30, 35))
    d = ImageDraw.Draw(img)
    _status_bar(d)
    d.text((W // 2 - 200, H // 2 - 40), "User briefly left app", font=_font(32, True), fill=(255, 255, 255))
    d.text((W // 2 - 280, H // 2 + 20), "Voice memo keeps playing via notification", font=_font(26), fill=(200, 200, 210))
    shade = Image.new("RGBA", (W, 200), (255, 255, 255, 248))
    img = img.convert("RGBA")
    img.paste(shade, (0, 72), shade)
    d = ImageDraw.Draw(img)
    d.text((48, 100), "Totus Secure Notes", font=_font(26, True), fill=TEXT)
    d.text((48, 140), "Playing voice memo — tap to return", font=_font(24), fill=TEXT2)
    d.text((48, 178), "Foreground service · Media playback", font=_font(20), fill=TEXT_MUTED)
    return img.convert("RGB")


def _title() -> Image.Image:
    img = Image.new("RGB", (W, H), PRIMARY)
    d = ImageDraw.Draw(img)
    d.text((W // 2 - 420, H // 2 - 100), "Media playback foreground service", font=_font(40, True), fill=(255, 255, 255))
    d.text((W // 2 - 380, H // 2 - 20), "Totus Secure Notes — voice memo demo", font=_font(30), fill=(219, 234, 254))
    d.text((W // 2 - 300, H // 2 + 40), "For Google Play review", font=_font(26), fill=(219, 234, 254))
    return img


def _end() -> Image.Image:
    img = _note_editor(has_attachment=True)
    d = ImageDraw.Draw(img)
    _rounded(d, (40, 680, W - 40, 820), 16, SUCCESS_BG, outline=SUCCESS, width=2)
    d.text((60, 720), "Playback stopped — viewer closed", font=_font(30, True), fill=SUCCESS)
    d.text((60, 768), "No background media when not playing", font=_font(24), fill=TEXT2)
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

    hold(_title(), 2.5)
    fade(_title(), _note_editor(), 0.5)
    hold(_note_editor(), 2.0)
    fade(_note_editor(), _note_editor(recording=True), 0.3)
    hold(_note_editor(recording=True), 2.5)
    fade(_note_editor(recording=True), _note_editor(has_attachment=True), 0.3)
    hold(_note_editor(has_attachment=True), 2.0)
    fade(_note_editor(has_attachment=True), _disclosure(), 0.4)
    hold(_disclosure(), 6.0)
    fade(_disclosure(), _attachment_viewer(playing=False), 0.4)
    hold(_attachment_viewer(playing=False), 2.0)
    fade(_attachment_viewer(playing=False), _attachment_viewer(playing=True, progress=0.2), 0.3)
    hold(_attachment_viewer(playing=True, progress=0.2), 2.0)
    fade(_attachment_viewer(playing=True), _notification_shade(), 0.3)
    hold(_notification_shade(), 4.0)
    fade(_notification_shade(), _home_with_notification(), 0.3)
    hold(_home_with_notification(), 3.0)
    fade(_home_with_notification(), _attachment_viewer(playing=True, progress=0.7), 0.3)
    hold(_attachment_viewer(playing=True, progress=0.7), 2.0)
    fade(_attachment_viewer(playing=True), _attachment_viewer(playing=False), 0.3)
    hold(_attachment_viewer(playing=False), 1.5)
    fade(_attachment_viewer(playing=False), _end(), 0.4)
    hold(_end(), 3.0)

    target = int(35 * FPS)
    while len(frames) < target:
        frames.append(frames[-1])
    frames = frames[:target]

    iio.imwrite(
        OUT_PATH,
        frames,
        fps=FPS,
        codec="libx264",
        pixelformat="yuv420p",
        ffmpeg_params=["-movflags", "+faststart"],
    )
    mb = OUT_PATH.stat().st_size / (1024 * 1024)
    print(f"Wrote {OUT_PATH} ({len(frames)/FPS:.1f}s, {mb:.2f} MB)")


if __name__ == "__main__":
    main()
