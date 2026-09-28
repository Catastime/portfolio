"""Generate public/CV.pdf — a two-page A4 PDF of spread 0, vector text.

Page 1: black paper, hole marks, introduction, statement.
Page 2: white paper, contact links (clickable), Anthrazit image, CV.

The layout mirrors src/App.tsx — if the spread changes, update the
positions/texts below and re-run:  python scripts/generate_cv_pdf.py

All writing is embedded as vector outlines (sharp at any zoom, selectable,
searchable). Paper textures and the photo stay raster images, which suits
them. The text mirrors the web typefaces (Typekit): the statement and
introduction label use t26-carbon, the CV section names / dates /
descriptions / skill lists use Automate, the CV roles use Tosh B. The
Typekit OTFs are CFF-flavoured; scripts/convert_otf_to_ttf.py converts
them to TTF (reportlab cannot embed CFF outlines). Re-run it only when
the kit or the type map changes.

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

# Typekit faces (TTF conversions, see convert_otf_to_ttf.py) with their
# hhea ascent per em — the baseline offset differs per font, mirroring
# how the browser places each face's baseline.
FACES = {
    # (file, hhea ascent/em, hhea descent/em)
    'Carbon':        ('Carbon-400.ttf',   0.801, 0.200),  # introduction label
    'Carbon-Bold':   ('Carbon-700.ttf',   0.801, 0.200),  # statement
    'Automate':      ('Automate-400.ttf', 1.034, 0.317),  # contacts, section names, dates
    'Automate-Light': ('Automate-300.ttf', 1.034, 0.317),  # descriptions, skill lists
    'ToshB':         ('ToshB-400.ttf',    1.382, 0.598),  # CV roles
}
for name, (fn, _, _) in FACES.items():
    pdfmetrics.registerFont(TTFont(name, os.path.join(HERE, fn)))
ASC = {name: a for name, (_, a, _) in FACES.items()}
DESC = {name: d for name, (_, _, d) in FACES.items()}

PAPER = (207 / 255, 207 / 255, 207 / 255)
DARK = (46 / 255, 46 / 255, 46 / 255)
LIGHT = (119 / 255, 119 / 255, 119 / 255)
LINE = (150 / 255, 150 / 255, 150 / 255)

def X(dx):
    return dx * PT

def YB(dy, size, font='Automate', lh=None):
    # design top-y + font size -> pdf baseline. With lh (the CSS line box
    # height) this mirrors the browser: half-leading centers the font box
    # in the line box, then the baseline sits ascent below its top.
    a = ASC[font]
    if lh is None:
        return PH - (dy + size * a) * PT
    half = (lh - size * (a + DESC[font])) / 2
    return PH - (dy + half + size * a) * PT

def sw(text, size, font='Automate'):
    return pdfmetrics.stringWidth(text, font, size * PT)

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

def wrap(words, size, width, font='Automate'):
    lines, cur = [], []
    for w in words:
        if sw(' '.join(cur + [w]), size, font) <= width or not cur:
            cur.append(w)
        else:
            lines.append(cur); cur = [w]
    lines.append(cur)
    return lines

def draw_block(c, dx, dy, width, text, size, fill, lh, mode='justify', ragged_last=True, slack=0.0, font='Automate'):
    wpt = width * PT
    c.setFillColor(fill)
    c.setFont(font, size * PT)
    # Browsers round glyph advances ~0.8% narrower than the raw metrics;
    # slack widens only the wrap decision so breaks match the website.
    lines = wrap(text.split(), size, wpt + slack * PT, font)
    for i, ln in enumerate(lines):
        last = i == len(lines) - 1
        if mode == 'right':
            line = ' '.join(ln)
            c.drawString(X(dx) + wpt - sw(line, size, font), YB(dy, size, font, lh), line)
        elif last and ragged_last:
            c.drawString(X(dx), YB(dy, size, font, lh), ' '.join(ln))
        else:
            if len(ln) > 1:
                word_w = sum(sw(w, size, font) for w in ln)
                gap = (wpt - word_w) / (len(ln) - 1)
                cx = X(dx)
                for w in ln:
                    c.drawString(cx, YB(dy, size, font, lh), w)
                    cx += sw(w, size, font) + gap
            else:
                c.drawString(X(dx), YB(dy, size, font, lh), ln[0])
        dy += lh
    return dy

out = os.path.join(ROOT, 'CV.pdf')
c = canvas.Canvas(out, pagesize=A4)

# ---------------- Page 1 ----------------
c.drawImage(ImageReader(prep_texture('left_page-black.png')), 0, 0, PW, PH)
c.setFillColor(PAPER)
r = 1754 * 0.0102 / 2 * PT  # hole radius = --hole-size (1.02% of page height) / 2
for cx, cy in ((59.6, 287.8), (1180.5, 287.8), (59.6, 787.7), (1180.5, 787.7)):
    c.circle(X(cx), PH - cy * PT, r, stroke=0, fill=1)
# Frame around the hole marks — matches the website (1px, 15% opacity)
# Box = holes item: x:-4, y:10, w:108, h:37 of the content area
c.setStrokeColor(PAPER)
c.setStrokeAlpha(0.15)
c.setLineWidth(PT)
c.rect(X(17.4), PH - 829.7 * PT, 1205.3 * PT, (829.7 - 245.6) * PT, stroke=1, fill=0)
c.setStrokeAlpha(1)
c.setFont('Carbon', 27 * PT)  # 1rem x page-scale, measured on the web
c.drawCentredString(X(W // 2), PH - 537.7 * PT, 'introduction')
# Statement — explicit line breaks, matching the website authored breaks
STATEMENT = [
    ("I'M TIM MOEDEKER,", 'right'),
    ('AN M.SC.ARCHITECTURE', 'justify'),
    ('AND LECTURER BASED', 'justify'),
    ('IN HANNOVER', 'left'),
    ('WITH A PASSION FOR', 'justify'),
    ('CUTTING EDGE', 'justify'),
    ('TECHNOLOGIES OF THE', 'justify'),
    ('DIGITAL WORLD AND,', 'justify'),
    ('CONTRADICTORILY,', 'justify'),
    ('ANALOGUE PHOTOGRAPHY.', 'last'),
]
sy = 1017.4
for line, mode in STATEMENT:
    if mode == 'right':
        sy = draw_block(c, 17.4, sy, 1205.3, line, 96.2, PAPER, 67.3, mode='right', font='Carbon-Bold')
    elif mode == 'justify':
        sy = draw_block(c, 17.4, sy, 1205.3, line, 96.2, PAPER, 67.3, mode='justify', ragged_last=False, font='Carbon-Bold')
    else:
        sy = draw_block(c, 17.4, sy, 1205.3, line, 96.2, PAPER, 67.3, font='Carbon-Bold')

# ---------------- Page 2 ----------------
c.showPage()
c.drawImage(ImageReader(prep_texture('right_page.png')), 0, 0, PW, PH)

# Contact field, top right — clickable
contacts = [
    ('https://timmkr.space', 'https://timmkr.space'),
    ('tim.moedeker@gmail.com', 'mailto:tim.moedeker@gmail.com'),
    ('+49 177 9000982', 'tel:+491779000982'),
]
cy = 35.1  # y 2% of page height (corner text sits at stack level)
for text, target in contacts:
    c.setFillColor(DARK)
    c.setFont('Automate', 20.2 * PT)  # 0.75rem x page-scale
    c.drawRightString(X(W - 17.4), YB(cy, 20.2, 'Automate'), text)
    x0 = W - 17.4 - sw(text, 20.2, 'Automate') / PT
    c.linkURL(target, (X(x0), (H - cy - 24) * PT, X(W - 17.4), (H - cy + 4) * PT))
    cy += 40.3  # 2.3% of page height between corner lines

img = Image.open(os.path.join(ROOT, 'tim', 'Atelier Anthrazit-039-breit-bw.jpg')).convert('RGB')
iw_d = 1205.3  # 108% of the 90% content box
ih_d = round(iw_d / 2.0462)
img = img.resize((1600, round(1600 / 2.0462)), Image.LANCZOS)
buf = BytesIO()
img.save(buf, 'JPEG', quality=88)
buf.seek(0)
ix, iy = 17.4, 245.6  # x -4%, y 10% of content
c.drawImage(ImageReader(buf), X(ix), PH - (iy + ih_d) * PT, X(iw_d), X(ih_d))
c.setFillColor((29 / 255, 29 / 255, 29 / 255))
inset = 42.2  # 3.5cqw of the image box
for cx, cyy in ((ix + inset, iy + inset), (ix + iw_d - inset, iy + inset), (ix + inset, iy + ih_d - inset), (ix + iw_d - inset, iy + ih_d - inset)):
    c.circle(X(cx), PH - cyy * PT, r, stroke=0, fill=1)

# CV — every metric mirrors the web CV: font = 0.88rem x page-scale,
# em = 23.94 design px (23.12 measured at 0.85rem, scaled to 0.88).
EM = 23.94
y = 839.4 + EM  # y 47.6% of content + 1em first-section margin

def section(name, gap=1.4 * EM):
    global y
    y += gap
    c.setFillColor(DARK)
    c.setFont('Automate', 1.5 * EM * PT)
    c.drawString(X(17.4), YB(y, 1.5 * EM, 'Automate', 1.65 * EM), name)
    y += 1.65 * EM  # section-name line box: line-height 1.1 x 1.5em

def entry(head, date, desc):
    global y
    c.setFillColor(DARK)
    c.setFont('ToshB', EM * PT)
    c.drawString(X(17.4), YB(y, EM, 'ToshB', 1.4 * EM), head)
    if date:
        c.setFont('Automate', EM * PT)
        c.drawRightString(X(17.4) + 1205.3 * PT, YB(y, EM, 'Automate', 1.4 * EM), date)
    y += 1.4 * EM  # .cv-head line box (line-height 1.4)
    if desc:
        y = draw_block(c, 17.4, y - 0.2 * EM, 1205.3, desc, EM, LIGHT, 1.4 * EM, font='Automate-Light') + 0.4 * EM  # desc margin-top -0.2em, .cv-entry margin-bottom 0.4em

section('EDUCATION', gap=0)
entry('M. Sc. Architecture, Leibniz University Hannover', '10.2021 - 01.2024',
       'Thesis on AI in architectural design, focused on practicality and accessibility.')
entry('B. Sc. Architecture, Leibniz University Hannover', '10.2017 - 01.2021',
       'Focus on conceptual, digital work in new formats such as VR and AR.')
section('EXPERIENCE')
entry('Architectural Designer, Mosaik Architekt:innen Hannover', '10.2024 - today',
       'Competitions for public-sector clients, agentic automations and some IT.')
entry('Lecturer, Institute of Digital Methods in Architecture, Leibniz University Hannover', '04.2024 - today',
       'Teaching "Digital Simulation", researching open-source AI in architecture.')
entry('Guest Lecturer, Digital Design Unit, TU Darmstadt', '05.2025',
       'Weekend Arduino seminar; students built sensor-based musical instruments.')
entry('Architectural Intern, Design & Concept, Angelis & Partner', '04.2021 - 10.2021',
       'Design and concept work on competitions.')
entry('Student Assistant, Faculty of Architecture & Landscape, Leibniz University Hannover', '01.2018 - 01.2025',
       'IT support for teaching staff and students.')
section('SKILLS')
c.setFillColor(DARK)
for s in ('Design & BIM: Rhinoceros, Revit, Archicad',
          'Visualization: V-Ray, D5, Unity, Photoshop, Illustrator, InDesign',
          'Other: Python, QGIS, 3D printing, large-format plotting, web/server hosting',
          'Languages: German (mother tongue), English (fluent)'):
    # Web split: label (before the colon) in Tosh B, list in Automate Light
    # at 0.65 opacity (LIGHT). Both are inline in one .cv-head line, so they
    # share the Tosh B strut baseline.
    ci = s.index(':')
    label, rest = s[:ci + 1], s[ci + 1:]
    c.setFillColor(DARK)
    c.setFont('ToshB', EM * PT)
    c.drawString(X(17.4), YB(y, EM, 'ToshB', 1.4 * EM), label)
    c.setFillColor(LIGHT)
    c.setFont('Automate-Light', EM * PT)
    c.drawString(X(17.4) + sw(label, EM, 'ToshB'), YB(y, EM, 'ToshB', 1.4 * EM), rest)
    y += 1.4 * EM + 0.15 * EM  # skills entries: margin-bottom 0.15em

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
