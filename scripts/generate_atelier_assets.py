"""Generate processed assets for the Atelier Anthrazit pages.

logo.jpg is a black mark on a white background; the dark pages need the
inverse — a white mark on transparency. The inverted luminance becomes
the alpha channel, so anti-aliased edges are preserved.
The Artificial Artifacting exhibits (Done_01..Done_16, no 05 exists) are
heavy 4-5MB PNGs; the page grid shows 600px JPEG previews from preview/
while the click-to-zoom overlay loads the full PNGs.
Re-run this whenever a source image changes.

Usage: python scripts/generate_atelier_assets.py
Deps: pillow
"""

import os

ROOT = os.path.join(os.path.dirname(__file__), '..', 'public', 'atelier_anthrazit')
OUT_DIR = os.path.join(ROOT, 'preview')

WIDTH = 600  # grid tiles display at <= ~140px; 600px covers 2x retina
QUALITY = 80
SUBSAMPLING = 0  # 4:4:4, keeps text crisp

# Done exhibit numbers — 05 does not exist
DONE_NUMBERS = [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]


def main():
    from PIL import Image, ImageOps

    os.makedirs(OUT_DIR, exist_ok=True)

    # Logo — invert to a white mark on transparency
    im = Image.open(os.path.join(ROOT, 'logo.jpg')).convert('L')
    inv = ImageOps.invert(im)
    white = Image.new('L', im.size, 255)
    logo = Image.merge('RGBA', (white, white, white, inv))
    logo.save(os.path.join(ROOT, 'logo-white.png'))
    print(f'logo-white.png: {logo.size[0]}x{logo.size[1]} from logo.jpg')

    # Done exhibit previews
    for n in DONE_NUMBERS:
        name = f'ArtificialArtifacting_ImageLayout_330x425_Done_{n:02d}-1.png'
        im = Image.open(os.path.join(ROOT, name))
        if im.mode in ('RGBA', 'P'):
            im = im.convert('RGB')
        h = round(im.height * WIDTH / im.width)
        im = im.resize((WIDTH, h), Image.LANCZOS)
        out = os.path.join(OUT_DIR, f'done-{n:02d}.jpg')
        im.save(out, 'JPEG', quality=QUALITY, optimize=True, subsampling=SUBSAMPLING)
        print(f'done-{n:02d}.jpg: {WIDTH}x{h} from {name}')

    # Exhibition photo previews
    for name in ['IMG-20250901-WA0015.jpg', 'IMG-20250901-WA0016.jpg', 'IMG-20250901-WA0017.jpg']:
        im = Image.open(os.path.join(ROOT, name))
        if im.mode in ('RGBA', 'P'):
            im = im.convert('RGB')
        h = round(im.height * WIDTH / im.width)
        im = im.resize((WIDTH, h), Image.LANCZOS)
        out = os.path.join(OUT_DIR, name.replace('IMG-20250901-', '').replace('.jpg', '.jpg'))
        im.save(out, 'JPEG', quality=QUALITY, optimize=True, subsampling=SUBSAMPLING)
        print(f'{os.path.basename(out)}: {WIDTH}x{h} from {name}')

    print(f'{2 + len(DONE_NUMBERS) + 3} assets written')


if __name__ == '__main__':
    main()
