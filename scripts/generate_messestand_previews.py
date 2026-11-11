"""Generate landscape-cropped page tiles for the portrait booth photos.

The right page of work.05 shows all photos in a uniform 3x6 grid; the
three portrait photos (photo6-8) are center-cropped to the landscape
tile aspect for the page tiles, while the click-to-zoom overlay keeps
showing the full portrait image.
Re-run this whenever the source photos change.

Usage: python scripts/generate_messestand_previews.py
Deps: pillow
"""

import os

ROOT = os.path.join(os.path.dirname(__file__), '..', 'public', 'messestand')
OUT_DIR = os.path.join(ROOT, 'preview')

WIDTH = 600
HEIGHT = 338  # matches the landscape booth photos (600x337-340)
QUALITY = 80
SUBSAMPLING = 0  # 4:4:4, keeps text crisp

# Portrait photos cropped to the landscape tile aspect
SOURCES = ['photo6.JPG', 'photo7.JPG', 'photo8.JPG']


def main():
    from PIL import Image

    os.makedirs(OUT_DIR, exist_ok=True)

    for name in SOURCES:
        src = os.path.join(ROOT, name)
        out = os.path.join(OUT_DIR, os.path.splitext(name)[0] + '.jpg')
        im = Image.open(src)
        if im.mode in ('RGBA', 'P'):
            im = im.convert('RGB')
        if im.width != WIDTH:
            im = im.resize((WIDTH, round(im.height * WIDTH / im.width)), Image.LANCZOS)
        # Center-crop a WIDTH x HEIGHT band
        top = max(0, (im.height - HEIGHT) // 2)
        im = im.crop((0, top, WIDTH, top + HEIGHT))
        im.save(out, 'JPEG', quality=QUALITY, optimize=True, subsampling=SUBSAMPLING)
        print(f'{os.path.basename(out)}: {WIDTH}x{HEIGHT} from {name}')

    print(f'{len(SOURCES)} previews written to {OUT_DIR}')


if __name__ == '__main__':
    main()
