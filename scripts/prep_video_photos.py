#!/usr/bin/env python3
"""Compress promo2 house photos into data URLs for VIDEO-ONLY local demo listings.
Photos never touch the live site: they go into the local wrangler D1 only."""
import base64, io, json, sys
from PIL import Image

SRC = "/home/z/my-project/promo2/photos"
OUT = "/tmp/video_photos.json"

# 8 listings x 3 photos (+2 spare) — reuse the real house photos from the KE promo shoot
PICK = [
    # 1 Nairobi apartment
    ["urls_q1_1.jpg", "urls_q1_4.jpg", "urls_q1_6.jpg"],
    # 2 Austin studio
    ["urls_q2_3.jpeg", "urls_q2_5.jpg", "urls_q3_5.jpg"],
    # 3 Mumbai 2BHK
    ["urls_q1_2.jpeg", "urls_q1_3.jpeg", "urls_q1_5.jpeg"],
    # 4 Kampala family home
    ["urls_q2_1.jpg", "urls_q2_2.jpg", "urls_q4_2.jpg"],
    # 5 London 1-bed
    ["urls_q3_2.jpg", "urls_q4_1.jpg", "urls_q4_5.jpg"],
    # 6 Dubai marina studio
    ["urls_q1_7.jpg", "urls_q2_6.jpg", "urls_q3_5.jpg"],
    # 7 Lagos self-contained
    ["urls_q4_5.jpg", "urls_q2_3.jpeg", "urls_q1_4.jpg"],
    # 8 Berlin altbau
    ["urls_q2_2.jpg", "urls_q3_2.jpg", "urls_q1_6.jpg"],
]

out = {}
for i, group in enumerate(PICK):
    for j, name in enumerate(group):
        im = Image.open(f"{SRC}/{name}").convert("RGB")
        w, h = im.size
        if w > 900:
            im = im.resize((900, int(h * 900 / w)), Image.LANCZOS)
        buf = io.BytesIO()
        im.save(buf, "JPEG", quality=76, optimize=True)
        b = buf.getvalue()
        if len(b) > 140000:  # API cap is 150KB for listing photos
            buf = io.BytesIO()
            im.save(buf, "JPEG", quality=62, optimize=True)
            b = buf.getvalue()
        out[f"l{i+1}_p{j+1}"] = "data:image/jpeg;base64," + base64.b64encode(b).decode()

json.dump(out, open(OUT, "w"))
sizes = {k: len(v) // 1024 for k, v in out.items()}
print("photos:", len(out), "| max KB:", max(sizes.values()))
sys.exit(0 if len(out) == 24 else 1)
