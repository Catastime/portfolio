"""Generate compressed JPEG previews for the Apartment in VR pages.

The work.04 sketchbook pages show previews from public/vroxel-apartment/preview/
while the click-to-zoom overlay loads the full images from
public/vroxel-apartment/. Re-run this whenever the source images change.

Usage: python scripts/generate_vroxel_previews.py
Deps: pillow
"""

import os

ROOT = os.path.join(os.path.dirname(__file__), '..', 'public', 'vroxel-apartment')
OUT_DIR = os.path.join(ROOT, 'preview')

WIDTH = 600  # page items display at <= ~350px; 600px covers 2x retina
GALLERY_WIDTH = 1200  # gallery images display at up to ~600px page width
QUALITY = 80
SUBSAMPLING = 0  # 4:4:4, keeps text crisp

# Preview name -> (source image, width), relative to public/vroxel-apartment/
SOURCES = {
    # AI concept images
    't1meout.jpg': ('Inspo (4).png', WIDTH),
    'grid.jpg': ('Inspo (3).png', WIDTH),
    'inspo-5.jpg': ('Inspo (5).png', WIDTH),
    # Reference image
    'takara.jpg': ('Inspo (1).jpg', WIDTH),
    # Digital material panoramas
    'gik.jpg': ('Inspo (1).png', WIDTH),
    'pinsel.jpg': ('Inspo (2).png', WIDTH),
    # Photograph
    'photo.jpg': ('Inspo (3).JPG', WIDTH),
    # Apartment renders — shown large in the side-scrolling gallery
    'render-012.jpg': ('VROXEL Apartment.012.png', GALLERY_WIDTH),
    'render-013.jpg': ('VROXEL Apartment.013.png', GALLERY_WIDTH),
    'render-014.jpg': ('VROXEL Apartment.014.png', GALLERY_WIDTH),
    'render-015.jpg': ('VROXEL Apartment.015.png', GALLERY_WIDTH),
}


def main():
    from PIL import Image

    os.makedirs(OUT_DIR, exist_ok=True)

    total = 0
    for name, (rel, width) in SOURCES.items():
        src = os.path.join(ROOT, rel)
        out = os.path.join(OUT_DIR, name)
        im = Image.open(src)
        if im.mode in ('RGBA', 'P'):
            im = im.convert('RGB')
        h = round(im.height * width / im.width)
        im = im.resize((width, h), Image.LANCZOS)
        im.save(out, 'JPEG', quality=QUALITY, optimize=True, subsampling=SUBSAMPLING)
        total += os.path.getsize(out)
        print(f'{name}: {width}x{h} from {rel}')

    print(f'{len(SOURCES)} previews written to {OUT_DIR}')
    print(f'total: {total / 1e6:.1f} MB')


if __name__ == '__main__':
    main()
