#!/usr/bin/env python3
"""Builds the mbx.sh wordmark and lockup as pure SVG paths.

The wordmark must not depend on an installed font: GitHub renders SVGs in an
isolated <img> context where external font loading is blocked, so every glyph is
baked into path data here.
"""

from pathlib import Path

from fontTools.misc.transform import Transform
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

BRAND = Path(__file__).parent
BOLD = "/usr/share/fonts/TTF/Hack-Bold.ttf"
REGULAR = "/usr/share/fonts/TTF/Hack-Regular.ttf"

X_HEIGHT_UNITS = 1120

# The mark's visual body is 28 units tall. Sizing the wordmark's x-height to 13
# keeps the lowercase mass optically level with the prompt inside the mark.
TARGET_X_HEIGHT = 13.0
SCALE = TARGET_X_HEIGHT / X_HEIGHT_UNITS

# Hack is monospaced, which leaves logo-hostile gaps between letters.
TRACKING = -118

# The period occupies a full monospace advance with wide side bearings, so
# without extra kerning the wordmark reads as "mbx . sh". These pull the dot
# tight against its neighbours. Applied before the given character.
PRE_KERN = {".": -330, "s": -330}

# "mbx" carries the name, ".sh" is the domain suffix and stays quieter.
SEGMENTS = [("mbx", BOLD, None), (".sh", REGULAR, 0.45)]


def layout():
    """Positions every glyph on one baseline, returning placement records."""
    placed = []
    pen_x = 0.0
    for text, font_path, opacity in SEGMENTS:
        font = TTFont(font_path)
        cmap = font.getBestCmap()
        glyphs = font.getGlyphSet()
        for char in text:
            pen_x += PRE_KERN.get(char, 0)
            placed.append(
                {
                    "glyphs": glyphs,
                    "name": cmap[ord(char)],
                    "x": pen_x,
                    "opacity": opacity,
                }
            )
            pen_x += glyphs[cmap[ord(char)]].width + TRACKING
    return placed


PLACED = layout()


def svg_path(item):
    """Font units are Y-up; the negative Y scale flips into SVG space."""
    transform = Transform(SCALE, 0, 0, -SCALE, item["x"] * SCALE, 0)
    pen = SVGPathPen(item["glyphs"], ntos=lambda v: f"{v:.2f}")
    item["glyphs"][item["name"]].draw(TransformPen(pen, transform))
    return pen.getCommands()


def ink_bounds():
    x0 = y0 = float("inf")
    x1 = y1 = float("-inf")
    for item in PLACED:
        bp = BoundsPen(item["glyphs"])
        item["glyphs"][item["name"]].draw(bp)
        if not bp.bounds:
            continue
        gx0, gy0, gx1, gy1 = bp.bounds
        x0 = min(x0, (gx0 + item["x"]) * SCALE)
        x1 = max(x1, (gx1 + item["x"]) * SCALE)
        y0 = min(y0, -gy1 * SCALE)
        y1 = max(y1, -gy0 * SCALE)
    return x0, y0, x1, y1


x0, y0, x1, y1 = ink_bounds()
word_w = x1 - x0
word_h = y1 - y0


def path_markup(indent="    "):
    out = []
    for item in PLACED:
        d = svg_path(item)
        if not d:
            continue
        fill = 'fill="currentColor"'
        if item["opacity"] is not None:
            fill += f' fill-opacity="{item["opacity"]}"'
        out.append(f'{indent}<path {fill} d="{d}"/>')
    return "\n".join(out)


GLYPHS = path_markup()

wordmark = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {word_w:.2f} {word_h:.2f}" width="{word_w:.2f}" height="{word_h:.2f}" fill="none" role="img" aria-label="mbx.sh">
  <g transform="translate({-x0:.2f} {-y0:.2f})">
{GLYPHS}
  </g>
</svg>
'''
(BRAND / "mbx-wordmark.svg").write_text(wordmark)

# --- Lockup: mark plus wordmark ---------------------------------------------
MARK = (BRAND / "mbx-mark.svg").read_text()
mark_inner = MARK.split(">", 1)[1].rsplit("</svg>", 1)[0].strip()
mark_inner = mark_inner.replace('id="mbx-prompt"', 'id="mbx-prompt-lockup"').replace(
    "url(#mbx-prompt)", "url(#mbx-prompt-lockup)"
)

MARK_BODY_LEFT = 2.0   # the mark's visual body inside its 32-unit box
MARK_BODY_RIGHT = 30.0
GAP = 8.0              # measured from the mark's body edge, not its bounding box
lock_h = 32.0

word_x = MARK_BODY_RIGHT + GAP - x0
lock_w = MARK_BODY_RIGHT + GAP + word_w + MARK_BODY_LEFT

# Two defensible baselines: centring the full ink box leaves the word looking a
# touch low because b and h have ascenders but nothing descends; centring the
# x-height band overcorrects. Splitting the difference reads level.
baseline_ink_centred = (lock_h - word_h) / 2 - y0
baseline_x_height_centred = (lock_h + TARGET_X_HEIGHT) / 2
word_y = (baseline_ink_centred + baseline_x_height_centred) / 2

lockup = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {lock_w:.2f} {lock_h:.2f}" width="{lock_w:.2f}" height="{lock_h:.2f}" fill="none" role="img" aria-label="mbx.sh">
  {mark_inner}
  <g transform="translate({word_x:.2f} {word_y:.2f})">
{GLYPHS}
  </g>
</svg>
'''
(BRAND / "mbx-lockup.svg").write_text(lockup)

print(f"mbx-wordmark.svg  {word_w:.2f} x {word_h:.2f}")
print(f"mbx-lockup.svg    {lock_w:.2f} x {lock_h:.2f}")
