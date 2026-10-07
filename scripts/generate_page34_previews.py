import os
from PIL import Image

d = os.path.join(os.path.dirname(__file__), '..', 'public', 'bachelor-thesis')
out = os.path.join(d, 'preview')
os.makedirs(out, exist_ok=True)

names = [
    'SP1.png',
    'sp5.png',
    'swiss-pavilion-außen.jpg',
    'swiss-pavilion-innen1.jpg',
    'Analyse.jpg',
    'M75_2809.jpg',
    'M75_2815.jpg',
    'M75_2822.jpg',
    'M75_2824.jpg',
    'unity-poster.jpg',
]

for n in names:
    im = Image.open(os.path.join(d, n)).convert('RGB')
    if im.width > 600:
        im = im.resize((600, int(im.height * 600 / im.width)), Image.LANCZOS)
    dest = os.path.join(out, n.replace('.png', '.jpg'))
    im.save(dest, 'JPEG', quality=82, optimize=True)
    print(f'{n}: {os.path.getsize(os.path.join(d, n)) // 1024}KB -> {os.path.getsize(dest) // 1024}KB')

print('done')
