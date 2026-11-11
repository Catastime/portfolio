"""Generate compressed JPEG previews for the projects overlay grid.

The projects overlay (Dock > Projects) shows one preview per project:
the title-page image where a project has one, or a chosen image otherwise.
Previews live in public/projects-preview/ while the sketchbook keeps
loading the full images from their original folders.
Re-run this whenever a source image changes.

Usage: python scripts/generate_projects_previews.py
Deps: pillow
"""

import os

ROOT = os.path.join(os.path.dirname(__file__), '..', 'public')
OUT_DIR = os.path.join(ROOT, 'projects-preview')

WIDTH = 600  # grid columns are <= 288px; 600px covers 2x retina
QUALITY = 80
SUBSAMPLING = 0  # 4:4:4, keeps text crisp

# Preview name -> (source image, edge crop), relative to public/.
# crop: (left, top, right, bottom) trimmed from the final preview in
# pixels — cuts scan edges (white top strip, light right column).
SOURCES = {
    # CV — no title page, chosen image
    'cv.jpg': (os.path.join('tim', 'Atelier Anthrazit-039-bw.jpg'), None),
    # Work 01 — master thesis title page
    'work01.jpg': (os.path.join('master-thesis', 'thesis-starter-full-page.png'), (0, 5, 3, 0)),
    # Work 02 — bachelor thesis title page
    'work02.jpg': (os.path.join('bachelor-thesis', 'cover.png'), (0, 5, 3, 0)),
    # Work 03 — film photography, no title page, chosen image
    'work03.jpg': (os.path.join('photography', 'CopenhagenBl (2).jpg'), None),
    # Work 04 — Apartment in VR, title page image (starter)
    'work04.jpg': (os.path.join('vroxel-apartment', 'thesis-starter1.png'), (0, 5, 3, 0)),
}


def main():
    from PIL import Image

    os.makedirs(OUT_DIR, exist_ok=True)

    total = 0
    for name, (rel, crop) in SOURCES.items():
        src = os.path.join(ROOT, rel)
        out = os.path.join(OUT_DIR, name)
        im = Image.open(src)
        if im.mode in ('RGBA', 'P'):
            im = im.convert('RGB')
        h = round(im.height * WIDTH / im.width)
        im = im.resize((WIDTH, h), Image.LANCZOS)
        if crop:
            l, t, r, b = crop
            im = im.crop((l, t, im.width - r, im.height - b))
        im.save(out, 'JPEG', quality=QUALITY, optimize=True, subsampling=SUBSAMPLING)
        total += os.path.getsize(out)
        print(f'{name}: {im.width}x{im.height} from {rel}')

    print(f'{len(SOURCES)} previews written to {OUT_DIR}')
    print(f'total: {total / 1e6:.1f} MB')


if __name__ == '__main__':
    main()
