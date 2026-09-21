"""Generate compressed JPEG previews for the master thesis pages.

The MORE overlay grid shows previews from public/master-thesis/pages-preview/
while the zoomed view loads the full PNG from public/master-thesis/pages/.
Re-run this whenever the pages in public/master-thesis/pages change.

Usage: python scripts/generate_thesis_previews.py
Deps: pillow
"""

import glob
import os
import re

ROOT = os.path.join(os.path.dirname(__file__), '..', 'public', 'master-thesis')
SRC_DIR = os.path.join(ROOT, 'pages')
OUT_DIR = os.path.join(ROOT, 'pages-preview')

WIDTH = 600  # grid columns are <= 288px; 600px covers 2x retina
QUALITY = 80
SUBSAMPLING = 0  # 4:4:4, keeps text crisp


def main():
    from PIL import Image

    os.makedirs(OUT_DIR, exist_ok=True)

    files = glob.glob(os.path.join(SRC_DIR, '*.png'))
    files.sort(key=lambda f: int(re.search(r'(\d+)', os.path.basename(f)).group(1)))
    if not files:
        raise SystemExit(f'No PNGs found in {SRC_DIR}')

    total = 0
    for f in files:
        name = os.path.splitext(os.path.basename(f))[0] + '.jpg'
        out = os.path.join(OUT_DIR, name)
        im = Image.open(f)
        if im.mode in ('RGBA', 'P'):
            im = im.convert('RGB')
        h = round(im.height * WIDTH / im.width)
        im = im.resize((WIDTH, h), Image.LANCZOS)
        im.save(out, 'JPEG', quality=QUALITY, optimize=True, subsampling=SUBSAMPLING)
        total += os.path.getsize(out)

    print(f'{len(files)} previews written to {OUT_DIR}')
    print(f'total: {total / 1e6:.1f} MB')


if __name__ == '__main__':
    main()
