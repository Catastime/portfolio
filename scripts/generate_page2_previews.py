import os
from PIL import Image

d = os.path.join(os.path.dirname(__file__), '..', 'public', 'bachelor-thesis')
out = os.path.join(d, 'preview')
os.makedirs(out, exist_ok=True)

names = [
    'Blade-Runner-2049.jpg',
    'blade-runner-2049-2.jpg',
    'blade-runner-2049-3.jpg',
    'Tsukumo+Shop+Abram.jpg',
    'tokyo-1.jpg',
    'tokyo-2.jpg',
    'tokyo-3.jpg',
    'tokyo-4.jpg',
]

for n in names:
    im = Image.open(os.path.join(d, n)).convert('RGB')
    if im.width > 480:
        im = im.resize((480, int(im.height * 480 / im.width)), Image.LANCZOS)
    dest = os.path.join(out, n)
    im.save(dest, 'JPEG', quality=78, optimize=True)
    print(f'{n}: {os.path.getsize(os.path.join(d, n)) // 1024}KB -> {os.path.getsize(dest) // 1024}KB')

print('done')
