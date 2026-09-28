"""Convert CFF-flavoured OTFs to glyf-flavoured TTFs.

reportlab cannot embed CFF outlines, so the Typekit OTFs need the same
CFF -> quadratic conversion that produced Epoch.ttf (see generate_cv_pdf.py).

Usage:
    python convert_otf_to_ttf.py <in.otf> <out.ttf> [max_err]

max_err is the cubic -> quadratic tolerance in units per em (default 1.0).
"""

import os
import sys

from fontTools.ttLib import TTFont, newTable
from fontTools.pens.ttGlyphPen import TTGlyphPen
from cu2qu.pens import Cu2QuPen


def convert(src, dst, max_err=1.0):
    font = TTFont(src)
    if "CFF " not in font:
        font.save(dst)
        return
    cff = font["CFF "].cff
    charstrings = cff[0].CharStrings
    glyph_order = font.getGlyphOrder()
    glyf = newTable("glyf")
    glyf.glyphOrder = glyph_order
    glyphs = {}
    for name in glyph_order:
        pen = TTGlyphPen(glyphs)
        cu2qu = Cu2QuPen(pen, max_err, reverse_direction=True)
        charstrings[name].draw(cu2qu)
        glyphs[name] = pen.glyph()
    glyf.glyphs = glyphs

    del font["CFF "]
    font["glyf"] = glyf
    font["loca"] = newTable("loca")
    font["head"].indexToLocFormat = 1
    # CFF maxp is version 0.5; TTF needs 1.0 (compile() recalcs the glyph maxima)
    maxp = font["maxp"]
    maxp.tableVersion = 0x00010000
    maxp.maxZones = 2
    maxp.maxTwilightPoints = 0
    maxp.maxStorage = 0
    maxp.maxFunctionDefs = 0
    maxp.maxInstructionDefs = 0
    maxp.maxStackElements = 0
    maxp.maxSizeOfInstructions = 0
    font.sfntVersion = "\x00\x01\x00\x00"  # OTTO -> trueType flavour

    # Typekit OTFs ship with stripped name tables; reportlab keys its font
    # cache on the internal name, so every face needs a unique one.
    stem = os.path.splitext(os.path.basename(dst))[0]
    name_table = font["name"]
    for nid in (1, 4, 6):
        name_table.setName(stem, nid, 3, 1, 0x409)  # Windows
        name_table.setName(stem, nid, 1, 0, 0)      # Macintosh
    name_table.setName("Regular", 2, 3, 1, 0x409)
    name_table.setName("Regular", 2, 1, 0, 0)

    font.save(dst)


if __name__ == "__main__":
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    err = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0
    convert(sys.argv[1], sys.argv[2], err)
    print("converted", sys.argv[1], "->", sys.argv[2])
