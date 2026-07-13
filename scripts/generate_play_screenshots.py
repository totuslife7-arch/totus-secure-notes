#!/usr/bin/env python3
"""Generate Google Play phone screenshots (1080x1920, 9:16)."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "assets" / "app store" / "screenshots"
ICON = ROOT / "assets" / "app store" / "source-1024.png"
if not ICON.exists():
    ICON = ROOT / "assets" / "images" / "icon.png"

W, H = 1080, 1920  # 9:16, meets 1080px min for promotion

# Theme
BG = (245, 247, 251)
SURFACE = (255, 255, 255)
SURFACE2 = (229, 231, 235)
PRIMARY = (37, 99, 235)
PRIMARY_LIGHT = (219, 234, 254)
TEXT = (17, 24, 39)
TEXT2 = (55, 65, 81)
TEXT_MUTED = (107, 114, 128)
SUCCESS = (4, 120, 87)
SUCCESS_BG = (236, 253, 245)
BORDER = (229, 231, 235)
FLAG = (217, 119, 6)


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


def _new_canvas() -> tuple[Image.Image, ImageDraw.ImageDraw]:
    img = Image.new("RGB", (W, H), BG)
    return img, ImageDraw.Draw(img)


def _status_bar(draw: ImageDraw.ImageDraw):
    draw.rectangle((0, 0, W, 72), fill=SURFACE)
    draw.text((48, 28), "9:41", font=_font(28), fill=TEXT)
    # signal dots
    for i, h in enumerate((12, 18, 24, 30)):
        draw.rounded_rectangle((920 + i * 14, 48 - h, 928 + i * 14, 48), radius=2, fill=TEXT)


def _tab_bar(draw: ImageDraw.ImageDraw, active: str = "Notes"):
    y = H - 120
    draw.rectangle((0, y, W, H), fill=SURFACE)
    draw.line((0, y, W, y), fill=BORDER, width=2)
    tabs = [("Notes", "📝"), ("Templates", "📋"), ("Trips", "🚗"), ("Settings", "⚙")]
    slot = W // len(tabs)
    for i, (name, emoji) in enumerate(tabs):
        cx = i * slot + slot // 2
        color = PRIMARY if name == active else TEXT_MUTED
        draw.text((cx - 18, y + 18), emoji, font=_font(32), fill=color)
        draw.text((cx - 44, y + 62), name, font=_font(22), fill=color)


def _header(draw: ImageDraw.ImageDraw, title: str, subtitle: str | None = None):
    draw.rectangle((0, 72, W, 200), fill=SURFACE)
    draw.text((48, 100), title, font=_font(44, True), fill=TEXT)
    if subtitle:
        draw.text((48, 152), subtitle, font=_font(26), fill=TEXT_MUTED)


def _caption_strip(img: Image.Image, text: str) -> Image.Image:
    """Top promo caption for Play Store context."""
    strip_h = 100
    out = Image.new("RGB", (W, H), BG)
    grad = Image.new("RGB", (W, strip_h), PRIMARY)
    out.paste(grad, (0, 0))
    d = ImageDraw.Draw(out)
    d.text((48, 32), text, font=_font(34, True), fill=(255, 255, 255))
    content = img.crop((0, 0, W, H - strip_h))
    out.paste(content, (0, strip_h))
    return out


def shot_notes():
    img, d = _new_canvas()
    _status_bar(d)
    _header(d, "Notes", "Encrypted on your device")
    _tab_bar(d, "Notes")

    cards = [
        ("Postpartum visit — Day 3", "Follow-up: weight check · Flagged", "Today, 8:42 AM", True),
        ("Home visit — Smith residence", "Vitals stable · Reminder tomorrow", "Yesterday", False),
        ("Psychosocial assessment draft", "Open tasks: 2", "Jul 9", False),
    ]
    y = 230
    for title, sub, time, flagged in cards:
        _rounded(d, (40, y, W - 40, y + 160), 20, SURFACE, outline=BORDER, width=1)
        if flagged:
            _rounded(d, (60, y + 24, 148, y + 52), 8, (254, 243, 199))
            d.text((72, y + 26), "Flagged", font=_font(20, True), fill=FLAG)
        d.text((60, y + 56), title, font=_font(30, True), fill=TEXT)
        d.text((60, y + 96), sub, font=_font(24), fill=TEXT2)
        d.text((60, y + 128), time, font=_font(22), fill=TEXT_MUTED)
        y += 180

    _rounded(d, (W - 140, H - 260, W - 60, H - 180), 40, PRIMARY)
    d.text((W - 118, H - 242), "+", font=_font(48, True), fill=(255, 255, 255))

    return _caption_strip(img, "Encrypted notes — local vault, no cloud account")


def shot_postpartum():
    img, d = _new_canvas()
    _status_bar(d)
    draw_back = d
    draw_back.rectangle((0, 72, W, 160), fill=SURFACE)
    draw_back.text((48, 108), "← Postpartum Nursing", font=_font(36, True), fill=TEXT)
    _tab_bar(d, "Templates")

    fields = [
        ("Mother — vitals", "BP 118/72 · HR 78 · Temp 36.8°C"),
        ("Newborn — birth weight", "3.42 kg (7 lb 8 oz)"),
        ("Today's weight", "3.18 kg — enter manually"),
        ("Feeding / output", "Breastfeeding q2–3h · 6 wet diapers"),
        ("Assessment notes", "Healing well. Education provided re: signs of infection."),
    ]
    y = 200
    for label, value in fields:
        _rounded(d, (40, y, W - 40, y + 130), 16, SURFACE, outline=BORDER, width=1)
        d.text((60, y + 20), label, font=_font(24, True), fill=PRIMARY)
        d.text((60, y + 58), value, font=_font(26), fill=TEXT)
        y += 148

    _rounded(d, (40, H - 300, W - 40, H - 220), 14, PRIMARY)
    d.text((W // 2 - 200, H - 278), "Copy for Plexia / EMR", font=_font(28, True), fill=(255, 255, 255))

    return _caption_strip(img, "Postpartum template — copy into your EMR")


def shot_templates():
    img, d = _new_canvas()
    _status_bar(d)
    _header(d, "Templates", "Clinical forms & briefcase")
    _tab_bar(d, "Templates")

    _rounded(d, (40, 220, W - 40, 310), 14, PRIMARY_LIGHT)
    d.text((60, 244), "Template Studio", font=_font(30, True), fill=PRIMARY)
    d.text((60, 282), "Paste a clinic form · AI or quick parse", font=_font(24), fill=TEXT2)

    d.text((48, 340), "Clinical forms", font=_font(32, True), fill=TEXT)
    _rounded(d, (40, 370, W - 40, 500), 18, SURFACE, outline=PRIMARY, width=3)
    d.text((60, 400), "★ Postpartum Nursing", font=_font(34, True), fill=TEXT)
    d.text((60, 448), "Manual weight fields · Plexia-safe copy", font=_font(26), fill=TEXT2)

    d.text((48, 530), "Built-in briefcase", font=_font(32, True), fill=TEXT)
    builtins = ["Home Visit Nursing", "Wound Care", "Psychosocial Assessment"]
    y = 570
    for name in builtins:
        _rounded(d, (40, y, W - 40, y + 72), 12, SURFACE, outline=BORDER, width=1)
        d.text((60, y + 22), name, font=_font(26), fill=TEXT)
        y += 86

    return _caption_strip(img, "Templates — Postpartum & nursing briefcase")


def shot_trips():
    img, d = _new_canvas()
    _status_bar(d)
    _header(d, "Trips", "GPS mileage & visit stops")
    _tab_bar(d, "Trips")

    _rounded(d, (40, 220, W - 40, 340), 16, SUCCESS_BG, outline=SUCCESS, width=2)
    d.text((60, 248), "● GPS recording", font=_font(30, True), fill=SUCCESS)
    d.text((60, 292), "12.4 km today · 6 stops", font=_font(28), fill=TEXT)

    stops = [
        ("1", "742 Evergreen Terrace", "09:15"),
        ("2", "Springfield Community Clinic", "10:40"),
        ("3", "22 Maple Ave — home visit", "13:05"),
        ("4", "Return to base", "16:30"),
    ]
    y = 370
    for num, addr, time in stops:
        _rounded(d, (40, y, W - 40, y + 100), 14, SURFACE, outline=BORDER, width=1)
        _rounded(d, (60, y + 28, 100, y + 72), 20, PRIMARY_LIGHT)
        d.text((78, y + 34), num, font=_font(28, True), fill=PRIMARY)
        d.text((120, y + 24), addr, font=_font(26, True), fill=TEXT)
        d.text((120, y + 60), time, font=_font(22), fill=TEXT_MUTED)
        y += 116

    _rounded(d, (40, H - 360, (W - 50) // 2 + 30, H - 270), 14, PRIMARY)
    d.text((70, H - 332), "Plan route (Pro)", font=_font(24, True), fill=(255, 255, 255))
    _rounded(d, (W // 2 + 10, H - 360, W - 40, H - 270), 14, SURFACE, outline=PRIMARY, width=2)
    d.text((W // 2 + 36, H - 332), "Open in Google Maps", font=_font(24, True), fill=PRIMARY)

    return _caption_strip(img, "Trip planner — GPS mileage & multi-stop maps")


def shot_template_ai():
    img, d = _new_canvas()
    _status_bar(d)
    draw_back = d
    draw_back.rectangle((0, 72, W, 160), fill=SURFACE)
    draw_back.text((48, 108), "← Template Studio", font=_font(36, True), fill=TEXT)
    _tab_bar(d, "Templates")

    d.text((48, 190), "Paste your clinic form", font=_font(34, True), fill=TEXT)
    _rounded(d, (40, 240, W - 40, 520), 16, SURFACE, outline=BORDER, width=1)
    sample = (
        "PATIENT VISIT FORM\n"
        "BP: ___  HR: ___  Temp: ___\n"
        "Assessment: ________________\n"
        "Plan / follow-up: ___________"
    )
    d.multiline_text((60, 270), sample, font=_font(26), fill=TEXT_MUTED, spacing=12)

    _rounded(d, (40, 560, W - 40, 640), 14, PRIMARY)
    d.text((W // 2 - 180, 586), "AI assist (on-device)", font=_font(30, True), fill=(255, 255, 255))
    _rounded(d, (40, 660, W - 40, 740), 14, SURFACE, outline=PRIMARY, width=2)
    d.text((W // 2 - 130, 686), "Quick parse", font=_font(30, True), fill=PRIMARY)

    _rounded(d, (40, 780, W - 40, 900), 14, SUCCESS_BG, outline=SUCCESS, width=1)
    d.text((60, 810), "✓ AI draft ready — review before save", font=_font(26, True), fill=SUCCESS)
    d.text((60, 852), "SmolLM2 runs on your phone · ~240 MB model", font=_font(22), fill=TEXT2)

    return _caption_strip(img, "Template AI — on-device, you review every field")


def shot_security():
    img, d = _new_canvas()
    _status_bar(d)
    _header(d, "Settings", "Security & desktop sync")
    _tab_bar(d, "Settings")

    d.text((48, 220), "Three-layer encryption", font=_font(32, True), fill=TEXT)
    _rounded(d, (40, 270, W - 40, 430), 16, SURFACE, outline=BORDER, width=1)
    layers = [
        "① Argon2id password → key",
        "② Hardware-backed session key",
        "③ Envelope encryption + HMAC export",
    ]
    ly = 300
    for line in layers:
        d.text((60, ly), line, font=_font(26), fill=TEXT2)
        ly += 42

    d.text((48, 460), "Sync to desktop", font=_font(32, True), fill=TEXT)
    _rounded(d, (40, 510, W - 40, 700), 16, PRIMARY_LIGHT, outline=PRIMARY, width=1)
    steps = (
        "1. Export encrypted .totus bundle\n"
        "2. Transfer to PC / Mac / Linux\n"
        "3. Open totus--notes.web.app/vault\n"
        "4. Unlock & copy notes (read-only)"
    )
    d.multiline_text((60, 540), steps, font=_font(26), fill=TEXT, spacing=10)

    _rounded(d, (40, 740, W - 40, 820), 14, PRIMARY)
    d.text((W // 2 - 210, 768), "Export for desktop viewer", font=_font(28, True), fill=(255, 255, 255))

    _rounded(d, (40, 850, W - 40, 930), 14, SURFACE, outline=BORDER, width=1)
    d.text((60, 878), "🔒 Biometric unlock · Auto-lock · Audit log", font=_font(26), fill=TEXT2)

    return _caption_strip(img, "Security & desktop vault — encrypted export")


SHOTS = [
    ("01-notes-vault.png", shot_notes),
    ("02-postpartum-template.png", shot_postpartum),
    ("03-templates-gallery.png", shot_templates),
    ("04-trip-planner.png", shot_trips),
    ("05-template-ai.png", shot_template_ai),
    ("06-security-desktop.png", shot_security),
]


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for filename, fn in SHOTS:
        path = OUT_DIR / filename
        img = fn()
        img.save(path, format="PNG", optimize=True)
        kb = path.stat().st_size / 1024
        print(f"{filename}: {W}x{H}, {kb:.1f} KB")
    print(f"Wrote {len(SHOTS)} screenshots to {OUT_DIR}")


if __name__ == "__main__":
    main()
