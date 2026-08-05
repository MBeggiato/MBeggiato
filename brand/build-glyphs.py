#!/usr/bin/env python3
"""Extracts Hack glyph outlines into brand/glyphs.json.

Authoring-time only. The card builders set every label as SVG path data because
GitHub renders README images in an isolated <img> context that blocks font
loading, and because the CI runner has no fonts installed. Shipping outlines
instead of a font also means the cards render identically on every platform.
"""

import json
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont

BRAND = Path(__file__).parent
FONTS = {
    "bold": "/usr/share/fonts/TTF/Hack-Bold.ttf",
    "regular": "/usr/share/fonts/TTF/Hack-Regular.ttf",
}
# Printable ASCII plus the few extras the cards use for separators and accents.
# Characters the font does not carry are skipped here and will raise a clear
# error at card build time rather than rendering as a gap.
EXTRA = "·—–•→★°äöüÄÖÜß"
CHARSET = [chr(c) for c in range(32, 127)] + list(EXTRA)

out = {"weights": {}}

for weight, path in FONTS.items():
    font = TTFont(path)
    cmap = font.getBestCmap()
    glyphs = font.getGlyphSet()

    if "upem" not in out:
        out["upem"] = font["head"].unitsPerEm
        out["xHeight"] = font["OS/2"].sxHeight
        out["capHeight"] = font["OS/2"].sCapHeight
        out["ascender"] = font["hhea"].ascent
        out["descender"] = font["hhea"].descent

    table = {}
    for char in CHARSET:
        code = ord(char)
        if code not in cmap:
            continue
        name = cmap[code]
        pen = SVGPathPen(glyphs, ntos=lambda v: f"{v:.0f}")
        glyphs[name].draw(pen)
        table[char] = {"d": pen.getCommands(), "aw": int(glyphs[name].width)}
    out["weights"][weight] = table

target = BRAND / "glyphs.json"
target.write_text(json.dumps(out, separators=(",", ":")))
size_kb = target.stat().st_size / 1024
print(f"glyphs.json geschrieben — {len(CHARSET)} Zeichen x {len(FONTS)} Schnitte, {size_kb:.1f} KB")
