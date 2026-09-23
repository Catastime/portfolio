"""Generate public/CV.pdf — a two-page A4 PDF of spread 0, vector text.

Page 1: black paper, hole marks, introduction, statement.
Page 2: white paper, contact links (clickable), Anthrazit image, CV.

The layout mirrors src/App.tsx — if the spread changes, update the
positions/texts below and re-run:  python scripts/generate_cv_pdf.py

All writing is embedded as vector outlines (sharp at any zoom, selectable,
searchable). Paper textures and the photo stay raster images, which suits
them. The text uses scripts/Epoch.ttf — a TrueType conversion of
public/fonts/Epoch.otf, because reportlab cannot embed CFF outlines.
Regenerate it only if the font changes (one-off, needs fontTools + cu2qu):

    from fontTools.ttLib import TTFont, newTable
    from fontTools.pens.ttGlyphPen import TTGlyphPen
    from cu2qu.pens import Cu2QuPen

Dependencies: pip install pillow reportlab pypdf
"""
import os
from io import BytesIO
from PIL import Image
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
import pypdf

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', 'public'))
W, H = 1240, 1754          # A4 design space
PW, PH = A4                # 595.276 x 841.89 pt
PT = PW / W                # design px -> pt
ASC = 701 / 1000           # Epoch ascent / em (from hhea)

pdfmetrics.registerFont(TTFont('Epoch', os.path.join(HERE, 'Epoch.ttf')))

PAPER = (207 / 255, 207 / 255, 207 / 255)
DARK = (46 / 255, 46 / 255, 46 / 255)
LIGHT = (119 / 255, 119 / 255, 119 / 255)
LINE = (150 / 255, 150 / 255, 150 / 255)

def X(dx):
    return dx * PT

def YB(dy, size):
    # design top-y + font size -> pdf baseline (PIL drew from the ascender top)
    return PH - (dy + size * ASC) * PT

def sw(text, size):
    return pdfmetrics.stringWidth(text, 'Epoch', size * PT)

def prep_texture(name, crop=20, width=1500):
    # Crop the scan borders baked into the paper textures so the paper tone
    # runs flush to the page edge; JPEG keeps the PDF weight sane.
    im = Image.open(os.path.join(ROOT, 'textures', name)).convert('RGB')
    w, h = im.size
    im = im.crop((crop, crop, w - crop, h - crop))
    im = im.resize((width, round(width * H / W)), Image.LANCZOS)
    buf = BytesIO()
    im.save(buf, 'JPEG', quality=88)
    buf.seek(0)
    return buf

def wrap(words, size, width):
    lines, cur = [], []
    for w in words:
        if sw(' '.join(cur + [w]), size) <= width or not cur:
            cur.append(w)
        else:
            lines.append(cur); cur = [w]
    lines.append(cur)
    return lines

def draw_block(c, dx, dy, width, text, size, fill, lh, mode='justify', ragged_last=True):
    wpt = width * PT
    c.setFillColor(fill)
    c.setFont('Epoch', size * PT)
    lines = wrap(text.split(), size, wpt)
    for i, ln in enumerate(lines):
        last = i == len(lines) - 1
        if mode == 'right':
            line = ' '.join(ln)
            c.drawString(X(dx) + wpt - sw(line, size), YB(dy, size), line)
        elif last and ragged_last:
            c.drawString(X(dx), YB(dy, size), ' '.join(ln))
        else:
            if len(ln) > 1:
                word_w = sum(sw(w, size) for w in ln)
                gap = (wpt - word_w) / (len(ln) - 1)
                cx = X(dx)
                for w in ln:
                    c.drawString(cx, YB(dy, size), w)
                    cx += sw(w, size) + gap
            else:
                c.drawString(X(dx), YB(dy, size), ln[0])
        dy += lh
    return dy

out = os.path.join(ROOT, 'CV.pdf')
c = canvas.Canvas(out, pagesize=A4)

# ---------------- Page 1 ----------------
c.drawImage(ImageReader(prep_texture('left_page-black.png')), 0, 0, PW, PH)
c.setFillColor(PAPER)
r = 9 * PT
for cx, cy in ((69, 296), (1171, 296), (69, 779), (1171, 779)):
    c.circle(X(cx), PH - cy * PT, r, stroke=0, fill=1)
c.setFont('Epoch', 32 * PT)
c.drawCentredString(X(W // 2), PH - (537 + 32 * ASC / 2) * PT, 'introduction')
sy = draw_block(c, 17, 1017, W - 34, "I'M TIM MOEDEKER,", 95, PAPER, 67, mode='right')
sy = draw_block(c, 17, sy, W - 34, "AN ARCHITECT AND LECTURER BASED IN HANNOVER", 95, PAPER, 67, mode='justify', ragged_last=False)
sy = draw_block(c, 17, sy, W - 34, "WITH A PASSION FOR CUTTING EDGE TECHNOLOGIES OF THE DIGITAL WORLD AND, CONTRADICTORILY, ANALOGUE PHOTOGRAPHY.", 95, PAPER, 67)

# ---------------- Page 2 ----------------
c.showPage()
c.drawImage(ImageReader(prep_texture('right_page.png')), 0, 0, PW, PH)

# Contact field, top right — clickable
contacts = [
    ('https://timmkr.space', 'https://timmkr.space'),
    ('tim.moedeker@gmail.com', 'mailto:tim.moedeker@gmail.com'),
    ('+49 177 9000982', 'tel:+491779000982'),
]
cy = 35
for text, target in contacts:
    c.setFillColor(DARK)
    c.setFont('Epoch', 24 * PT)
    c.drawRightString(X(W - 17), YB(cy, 24), text)
    x0 = W - 17 - sw(text, 24) / PT
    c.linkURL(target, (X(x0), (H - cy - 28) * PT, X(W - 17), (H - cy + 4) * PT))
    cy += 34

img = Image.open(os.path.join(ROOT, 'tim', 'Atelier Anthrazit-039-breit-bw.jpg')).convert('RGB')
iw_d = 1206
ih_d = round(iw_d / 2.0462)
img = img.resize((1600, round(1600 / 2.0462)), Image.LANCZOS)
buf = BytesIO()
img.save(buf, 'JPEG', quality=88)
buf.seek(0)
ix, iy = 17, 245
c.drawImage(ImageReader(buf), X(ix), PH - (iy + ih_d) * PT, X(iw_d), X(ih_d))
c.setFillColor((29 / 255, 29 / 255, 29 / 255))
inset = 42
for cx, cyy in ((ix + inset, iy + inset), (ix + iw_d - inset, iy + inset), (ix + inset, iy + ih_d - inset), (ix + iw_d - inset, iy + ih_d - inset)):
    c.circle(X(cx), PH - cyy * PT, r, stroke=0, fill=1)

# CV — section gaps mirror the web CV: 1em above EDUCATION, 1.8em between
y = 854 + 26

def section(name, gap=45):
    global y
    y += gap
    c.setFillColor(DARK)
    c.setFont('Epoch', 36 * PT)
    c.drawString(X(17), YB(y, 36), name)
    y += 44

def entry(head, date, desc):
    global y
    c.setFillColor(DARK)
    c.setFont('Epoch', 25 * PT)
    hw = sw(head, 25)
    dw = sw(date, 25) if date else 0
    c.drawString(X(17), YB(y, 25), head)
    if date:
        c.setStrokeColor(LINE)
        c.setLineWidth(PT)
        c.line(X(17) + hw + 10 * PT, PH - (y + 27) * PT, X(17) + (W - 34) * PT - dw - 10 * PT, PH - (y + 27) * PT)
        c.drawRightString(X(17) + (W - 34) * PT, YB(y, 25), date)
    y += 35
    if desc:
        y = draw_block(c, 17, y - 4, W - 34, desc, 25, LIGHT, 35) + 6

section('EDUCATION', gap=0)
entry('M. Sc. Architecture, Leibniz University Hannover', '10.2021 - 01.2024',
       'Thesis on AI in architectural design, with a practical AI interface focused on accessibility.')
entry('B. Sc. Architecture, Leibniz University Hannover', '10.2017 - 01.2021',
       'Focus on conceptual, digital work in new formats such as VR and AR, deepened in the bachelor\'s thesis.')
section('EXPERIENCE', gap=45)
entry('Architectural Designer, Mosaik Architekt:innen Hannover', '10.2024 - today',
       'Competitions for public-sector clients, some currently being realized.')
entry('Lecturer, Institute of Digital Methods in Architecture, Leibniz University Hannover', '04.2024 - today',
       'Teaching "Digital Simulation", researching open-source AI in architecture.')
entry('Guest Lecturer, Digital Design Unit, TU Darmstadt', '05.2025',
       'Weekend Arduino seminar; students built sensor-based musical instruments.')
entry('Architectural Intern, Design & Concept, Angelis & Partner', '04.2021 - 10.2021',
       'Design and concept work on competitions.')
entry('Student Assistant - IT, Faculty of Architecture & Landscape, Leibniz University Hannover', '01.2018 - 01.2025',
       'IT support for teaching staff and students.')
section('SKILLS', gap=45)
c.setFillColor(DARK)
c.setFont('Epoch', 25 * PT)
for s in ('Design & BIM: Rhinoceros, Revit, Archicad',
          'Visualization: V-Ray, D5, Unity, Photoshop, Illustrator, InDesign',
          'Other: Python, QGIS, 3D printing, large-format plotting, web/server hosting',
          'Languages: German (mother tongue), English (fluent)'):
    c.drawString(X(17), YB(y, 25), s)
    y += 35

print('CV ends at y =', y, 'of', H)
c.showPage()
c.save()

# Two-page side-by-side view
reader = pypdf.PdfReader(out)
writer = pypdf.PdfWriter()
for p in reader.pages:
    writer.add_page(p)
writer.set_page_layout('/TwoPageLeft')
with open(out, 'wb') as f:
    writer.write(f)
print('saved', out)
