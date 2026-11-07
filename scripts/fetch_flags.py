#!/usr/bin/env python3
"""Fetch 4x3 SVG flags (MIT, lipis/flag-icons) for every country in world.js.
Self-hosting keeps CSP img-src 'self' — no third-party, works on Windows
(where emoji flags render as bare 'KE' letters)."""
import re, os, pathlib, concurrent.futures, urllib.request

ROOT = pathlib.Path('/home/z/my-project/HuntInGlobal')
OUT = ROOT / 'public' / 'flags'
OUT.mkdir(parents=True, exist_ok=True)

src = (ROOT / 'public' / 'js' / 'world.js').read_text(encoding='utf-8')
codes = sorted(set(m.group(1) for m in re.finditer(r"'([A-Z]{2})','[^']*','[^']*'", src)))
print('ISO2 codes found:', len(codes))

UA = {'User-Agent': 'Mozilla/5.0 (flag-fetch for self-hosted HuntIn)'}
BASE = 'https://raw.githubusercontent.com/lipis/flag-icons/main/flags/4x3/{}.svg'

def grab(cc):
    dest = OUT / f'{cc.lower()}.svg'
    if dest.exists() and dest.stat().st_size > 100:
        return cc, 'cached'
    try:
        req = urllib.request.Request(BASE.format(cc.lower()), headers=UA)
        data = urllib.request.urlopen(req, timeout=25).read()
        if len(data) < 60 or b'<svg' not in data:
            return cc, f'BAD ({len(data)}b)'
        dest.write_bytes(data)
        return cc, 'ok'
    except Exception as e:
        return cc, f'ERR {e}'

bad = []
with concurrent.futures.ThreadPoolExecutor(max_workers=12) as ex:
    for cc, st in ex.map(grab, codes):
        if st not in ('ok', 'cached'):
            bad.append((cc, st))

total = sum(f.stat().st_size for f in OUT.glob('*.svg'))
print('downloaded:', len(list(OUT.glob('*.svg'))), 'files,', round(total / 1024), 'KB total')
print('failures:', bad if bad else 'none')
