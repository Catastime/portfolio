"""Generate public/CV.pdf — a two-page A4 render of spread 0.

Page 1: black paper, hole marks, introduction, statement.
Page 2: white paper, contact links (clickable), Anthrazit image, CV.

The layout mirrors src/App.tsx — if the spread changes, update the
positions/texts below and re-run:  python scripts/generate_cv_pdf.py

Dependencies: pip install pillow pypdf
"""
import os
from PIL import Image, ImageDraw, ImageFont
import pypdf
from pypdf.annotations import Link

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'public'))
W, H = 1240, 1754  # A4 @ 150dpi
PT = 595.276 / W   # px -> pdf points factor

PAPER = (207, 207, 207)
DARK = (46, 46, 46)
LIGHT = (119, 119, 119)
LINE = (150, 150, 150)

epoch = lambda s: ImageFont.truetype(os.path.join(ROOT, 'fonts', 'Epoch.otf'), s)

def page_bg(name, crop=20):
    # Crop the scan borders baked into the paper textures so the paper
    # tone runs flush to the page edge.
    im = Image.open(os.path.join(ROOT, 'textures', name)).convert('RGB')
    w, h = im.size
    im = im.crop((crop, crop, w - crop, h - crop))
    return im.resize((W, H), Image.LANCZOS)

def wrap(words, font, width):
    lines, cur = [], []
    for w in words:
        if font.getlength(' '.join(cur + [w])) <= width or not cur:
            cur.append(w)
        else:
            lines.append(cur); cur = [w]
    lines.append(cur)
    return lines

def draw_block(draw, x, y, width, text, font, fill, lh, mode='justify', ragged_last=True):
    lines = wrap(text.split(), font, width)
    for i, ln in enumerate(lines):
        is_last = i == len(lines) - 1
        if mode == 'right':
            draw.text((x + width - font.getlength(' '.join(ln)), y), ' '.join(ln), font=font, fill=fill)
        elif is_last and ragged_last:
            draw.text((x, y), ' '.join(ln), font=font, fill=fill)
        else:
            if len(ln) > 1:
                word_w = sum(font.getlength(w) for w in ln)
                gap = (width - word_w) / (len(ln) - 1)
                cx = x
                for w in ln:
                    draw.text((cx, y), w, font=font, fill=fill)
                    cx += font.getlength(w) + gap
            else:
                draw.text((x, y), ln[0], font=font, fill=fill)
        y += lh
    return y

# ---------------- Page 1 ----------------
page1 = page_bg('left_page-black.png')
d1 = ImageDraw.Draw(page1)
r = 9
for cx, cy in ((69, 296), (1171, 296), (69, 779), (1171, 779)):
    d1.ellipse((cx - r, cy - r, cx + r, cy + r), fill=PAPER)
d1.text((W // 2, 537), 'introduction', font=epoch(32), fill=PAPER, anchor='mm')
sx, sw = 17, W - 34
f_stmt = epoch(95)
sy = draw_block(d1, sx, 1017, sw, "I'M TIM MOEDEKER,", f_stmt, PAPER, 67, mode='right')
sy = draw_block(d1, sx, sy, sw, "AN ARCHITECT AND LECTURER BASED IN HANNOVER", f_stmt, PAPER, 67, mode='justify', ragged_last=False)
sy = draw_block(d1, sx, sy, sw, "WITH A PASSION FOR CUTTING EDGE TECHNOLOGIES OF THE DIGITAL WORLD AND, CONTRADICTORILY, ANALOGUE PHOTOGRAPHY.", f_stmt, PAPER, 67)

# ---------------- Page 2 ----------------
page2 = page_bg('right_page.png')
d2 = ImageDraw.Draw(page2)

# Contact field, top right — rects recorded for link annotations
f_contact = epoch(24)
contacts = [
    ('https://timmkr.space', 'https://timmkr.space'),
    ('tim.moedeker@gmail.com', 'mailto:tim.moedeker@gmail.com'),
    ('+49 177 9000982', 'tel:+491779000982'),
]
link_rects = []
cy = 35
for text, target in contacts:
    d2.text((W - 17, cy), text, font=f_contact, fill=DARK, anchor='ra')
    x0 = W - 17 - f_contact.getlength(text)
    link_rects.append((x0 * PT, (H - cy - 28) * PT, (W - 17) * PT, (H - cy + 4) * PT, target))
    cy += 34

img = Image.open(os.path.join(ROOT, 'tim', 'Atelier Anthrazit-039-breit-bw.jpg')).convert('RGB')
iw, ih = 1206, round(1206 / 2.0462)
img = img.resize((iw, ih), Image.LANCZOS)
ix, iy = 17, 245
page2.paste(img, (ix, iy))
inset = 42
for cx, cyy in ((ix + inset, iy + inset), (ix + iw - inset, iy + inset), (ix + inset, iy + ih - inset), (ix + iw - inset, iy + ih - inset)):
    d2.ellipse((cx - r, cyy - r, cx + r, cyy + r), fill=(29, 29, 29))

f_body = epoch(25)
f_sec = epoch(36)
lh_b = 35
x, width = 17, W - 34
y = 854

def section(name):
    global y
    d2.text((x, y), name, font=f_sec, fill=DARK)
    y += 44

def entry(head, date, desc):
    global y
    hw = f_body.getlength(head)
    dw = f_body.getlength(date) if date else 0
    d2.text((x, y), head, font=f_body, fill=DARK)
    if date:
        d2.line((x + hw + 10, y + 27, x + width - dw - 10, y + 27), fill=LINE, width=1)
        d2.text((x + width - dw, y), date, font=f_body, fill=DARK)
    y += lh_b
    if desc:
        y = draw_block(d2, x, y - 4, width, desc, f_body, LIGHT, lh_b) + 6

section('EDUCATION')
entry('M. Sc. Architecture, Leibniz University Hannover', '10.2021 - 01.2024',
       'Thesis on AI in architectural design, with a practical AI interface focused on accessibility.')
entry('B. Sc. Architecture, Leibniz University Hannover', '10.2017 - 01.2021',
       'Focus on conceptual, digital work in new formats such as VR and AR, deepened in the bachelor\'s thesis.')
section('EXPERIENCE')
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
section('SKILLS')
for s in ('Design & BIM: Rhinoceros, Revit, Archicad',
          'Visualization: V-Ray, D5, Unity, Photoshop, Illustrator, InDesign',
          'Other: Python, QGIS, 3D printing, large-format plotting, web/server hosting',
          'Languages: English (fluent)'):
    d2.text((x, y), s, font=f_body, fill=DARK)
    y += lh_b

print('CV ends at y =', y, 'of', H)

# ---------------- Save + links + two-page view ----------------
out = os.path.join(ROOT, 'CV.pdf')
page1.save(out, save_all=True, append_images=[page2], resolution=150.0)

reader = pypdf.PdfReader(out)
writer = pypdf.PdfWriter()
for p in reader.pages:
    writer.add_page(p)
for x0, y0, x1, y1, target in link_rects:
    writer.add_annotation(page_number=1, annotation=Link(rect=(x0, y0, x1, y1), url=target))
writer.set_page_layout('/TwoPageLeft')
with open(out, 'wb') as f:
    writer.write(f)
print('saved', out, 'with', len(link_rects), 'links')
