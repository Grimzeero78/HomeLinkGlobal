#!/usr/bin/env python3
"""HuntIn GLOBAL promo — frame composer (rebuilt after sandbox recycle).
Same structure/song as the delivered video: brand reveal -> dynamic-name splash
montage -> country feed -> local currency -> world map -> 22 languages ->
landlord CTA -> end card. UI shots are REAL screenshots from the real app."""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import os

UI = "/home/z/my-project/promo_global/ui"
A = "/home/z/my-project/promo_global/assets"
os.makedirs(A, exist_ok=True)
W, H = 1080, 1920
FB = "/usr/share/fonts/truetype/chinese/NotoSansSC-Bold.ttf"
FR = "/usr/share/fonts/truetype/chinese/NotoSansSC-Regular.ttf"

GREEN_D = (10, 40, 22)
GREEN_M = (18, 74, 42)
CREAM = (246, 243, 234)
ORANGE_L = (249, 115, 22)
WHITE = (255, 255, 255)
INK = (26, 38, 30)

def font(p, s): return ImageFont.truetype(p, s)

def gradient(w, h, top, bot):
    base = Image.new("RGB", (1, h))
    px = base.load()
    for y in range(h):
        r = y / (h - 1)
        px[0, y] = tuple(int(top[i] + (bot[i] - top[i]) * r) for i in range(3))
    return base.resize((w, h))

def bg_frame():
    """Deep-green brand background with soft glow."""
    im = gradient(W, H, GREEN_M, GREEN_D).convert("RGBA")
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    g = ImageDraw.Draw(glow)
    g.ellipse([W * 0.18, -H * 0.12, W * 0.82, H * 0.30], fill=(28, 116, 66, 110))
    glow = glow.filter(ImageFilter.GaussianBlur(120))
    return Image.alpha_composite(im, glow)

def rounded(im, r):
    mask = Image.new("L", im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, im.width - 1, im.height - 1], r, fill=255)
    out = Image.new("RGBA", im.size, (0, 0, 0, 0))
    out.paste(im, (0, 0), mask)
    return out

def phone_card(path, target_w=690, r=40):
    im = Image.open(path).convert("RGB")
    im = im.resize((target_w, int(im.height * target_w / im.width)), Image.LANCZOS)
    im = rounded(im, r)
    bd = ImageDraw.Draw(im)
    bd.rounded_rectangle([0, 0, im.width - 1, im.height - 1], r, outline=(255, 255, 255, 235), width=7)
    sh = Image.new("RGBA", (im.width + 120, im.height + 120), (0, 0, 0, 0))
    sm = Image.new("L", sh.size, 0)
    ImageDraw.Draw(sm).rounded_rectangle([60, 60, 60 + im.width, 60 + im.height], r, fill=110)
    sm = sm.filter(ImageFilter.GaussianBlur(26))
    sh = Image.composite(Image.new("RGBA", sh.size, (0, 0, 0, 255)), sh, sm)
    sh.paste(im, (60, 60), im)
    return sh

def wordmark(dr, cx, y, size, suffix=""):
    """HUNT(white) IN(orange) [suffix](white) centered; returns bottom y."""
    f = font(FB, size)
    parts = [("HUNT", WHITE), ("IN", ORANGE_L)] + ([(suffix, WHITE)] if suffix else [])
    total = sum(dr.textlength(t, font=f) for t, _ in parts)
    x = cx - total / 2
    for t, c in parts:
        dr.text((x, y), t, font=f, fill=c)
        x += dr.textlength(t, font=f)
    return y + f.getbbox("Hg")[3]

def pill(dr, cx, y, text, fsize=44):
    f = font(FB, fsize)
    tw = dr.textlength(text, font=f)
    pad, ph = 34, int(fsize * 1.9)
    x0, y0 = cx - tw / 2 - pad, y
    dr.rounded_rectangle([x0, y0, x0 + tw + 2 * pad, y0 + ph], ph / 2, fill=(255, 255, 255, 255))
    dr.text((cx - tw / 2, y0 + (ph - fsize * 1.18) / 2), text, font=f, fill=(14, 90, 51))
    return y0 + ph

def caption(text, sub=None):
    """Bottom caption bar over gradient — transparent overlay PNG for UI segs."""
    ov = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    for yy in range(int(H * 0.60), H):
        a = int(215 * min(1, (yy - H * 0.60) / (H * 0.22)))
        d.line([(0, yy), (W, yy)], fill=(8, 20, 12, a))
    fb = font(FB, 62)
    lines = text.split("\n")
    y = H - 330 - (len(lines) - 1) * 78 - (52 if sub else 0)
    for ln in lines:
        lw = d.textlength(ln, font=fb)
        d.text(((W - lw) / 2, y), ln, font=fb, fill=WHITE)
        y += 78
    if sub:
        fs = font(FR, 42)
        lw = d.textlength(sub, font=fs)
        d.text(((W - lw) / 2, y + 8), sub, font=fs, fill=(214, 232, 218))
    return ov

def ui_full(shot, cap=None, sub=None, card_w=760, cy=880):
    """UI screenshot as centered phone card on brand bg + optional caption."""
    im = bg_frame()
    card = phone_card(f"{UI}/{shot}.png", target_w=card_w)
    im.alpha_composite(card, (int((W - card.width) / 2), int(cy - card.height / 2)))
    if cap:
        im.alpha_composite(caption(cap, sub))
    return im.convert("RGB")

# ---------- S1: brand reveal — fanned world phones + wordmark ----------
s1 = bg_frame()
d = ImageDraw.Draw(s1)
c1 = phone_card(f"{UI}/home_KE.png", 560); c1 = c1.rotate(-7, expand=True, resample=Image.BICUBIC)
c2 = phone_card(f"{UI}/home_US.png", 560); c2 = c2.rotate(6, expand=True, resample=Image.BICUBIC)
c3 = phone_card(f"{UI}/home_IN.png", 560); c3 = c3.rotate(-1, expand=True, resample=Image.BICUBIC)
s1.alpha_composite(c1, (-150, 780)); s1.alpha_composite(c2, (W - c2.width + 150, 800)); s1.alpha_composite(c3, (int((W - c3.width) / 2), 640))
for yy in range(int(H * 0.55), H):
    a = int(225 * min(1, (yy - H * 0.55) / (H * 0.20)))
    d.line([(0, yy), (W, yy)], fill=(8, 20, 12, a))
y = wordmark(d, W / 2, 1180, 118)
fs = font(FB, 60)
t = "Find a house anywhere in the world"
d.text(((W - d.textlength(t, font=fs)) / 2, y + 46), t, font=fs, fill=CREAM)
fs2 = font(FR, 40)
t2 = "Real homes. Real landlords. Chat direct."
d.text(((W - d.textlength(t2, font=fs2)) / 2, y + 136), t2, font=fs2, fill=(190, 214, 196))
pill(d, W / 2, y + 250, "homelinkglobal.pages.dev", 40)
s1.convert("RGB").save(f"{A}/full_s1.png")

# ---------- S8: end card ----------
s8 = bg_frame()
d = ImageDraw.Draw(s8)
y = wordmark(d, W / 2, 620, 150)
fs = font(FB, 56)
t = "Post your house free. Reach the world."
d.text(((W - d.textlength(t, font=fs)) / 2, y + 60), t, font=fs, fill=CREAM)
pill(d, W / 2, y + 210, "homelinkglobal.pages.dev", 46)
fsm = font(FR, 30)
tm = "Music: Wallpaper — Kevin MacLeod (incompetech.com) · CC BY 4.0"
d.text(((W - d.textlength(tm, font=fsm)) / 2, H - 130), tm, font=fsm, fill=(150, 178, 158))
s8.convert("RGB").save(f"{A}/full_s8.png")

# ---------- UI segs with captions ----------
ui_full("home_KE", "Homes in your country first", "Kenya · Uganda · US · India — 191 countries", cy=900).save(f"{A}/full_s3.png")
ui_full("listing_in", "Prices in local currency", "KSh in Kenya · ₹ in India · ₦ in Nigeria — never USD", cy=900).save(f"{A}/full_s4.png")
ui_full("map_ke", "Every country on the map", "Zoom anywhere — exact pins, real photos", cy=900).save(f"{A}/full_s5.png")
ui_full("lang_picker", "22 languages — you choose", "App opens in English · change it in settings anytime", cy=900).save(f"{A}/full_s6.png")
ui_full("wizard", "Landlords: post free in 2 minutes", "Country, city, pin on the map, photos — done", cy=900).save(f"{A}/full_s7.png")

# splash montage stills: brand suffix zoom (center-cropped to 16:9-ish plates)
for cc in ["KE", "UG", "US", "IN", "GB", "AE"]:
    im = Image.open(f"{UI}/splash_{cc}.png").convert("RGB")
    im = im.resize((W, H), Image.LANCZOS)
    im.save(f"{A}/splash_{cc}.png")

print("FRAMES_OK", sorted(os.listdir(A)))
