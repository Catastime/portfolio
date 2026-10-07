import os
from PIL import Image

d = os.path.join(os.path.dirname(__file__), '..', 'public', 'master-thesis')

pairs = [
    ('polaroid-frame-sketch2.png',      'Cityhotel_Sketch.jpg',      'polaroid-composed-sketch.png'),
    ('polaroid-frame-concrete2.png',   'Cityhotel_Concrete.jpg',    'polaroid-composed-concrete.png'),
    ('polaroid-frame-scandi2.png',     'Cityhotel_Scandi.jpg',      'polaroid-composed-scandi.png'),
    ('polaroid-frame-bladerunner2.png','Cityhotel_Blade-Runner.jpg','polaroid-composed-bladerunner.png'),
]

def get_window(frame):
    W, H = frame.size
    px = frame.load()
    mid_y = int(H * 0.4)
    mid_x = int(W * 0.5)
    l = -1
    for x in range(W):
        if px[x, mid_y][3] < 20:
            l = x
            break
    r = -1
    seen = False
    for x in range(W - 1, -1, -1):
        a = px[x, mid_y][3]
        if a >= 20:
            seen = True
        elif seen:
            r = x
            break
    t = -1
    for y in range(H):
        if px[mid_x, y][3] < 20:
            t = y
            break
    b = -1
    seen2 = False
    for y in range(H - 1, -1, -1):
        a = px[mid_x, y][3]
        if a >= 20:
            seen2 = True
        elif seen2:
            b = y
            break
    return l, t, r - l + 1, b - t + 1

for frame_name, photo_name, out_name in pairs:
    frame = Image.open(os.path.join(d, frame_name)).convert('RGBA')
    photo = Image.open(os.path.join(d, photo_name)).convert('RGB')
    l, t, ww, wh = get_window(frame)
    print(f'{frame_name}: window {ww}x{wh} at {l},{t}')

    win_aspect = ww / wh
    sw, sh = photo.size
    if sw / sh > win_aspect:
        crop_w, crop_h = sh * win_aspect, sh
    else:
        crop_w, crop_h = sw, sw / win_aspect
    sx = (sw - crop_w) / 2
    sy = (sh - crop_h) / 2

    crop = photo.crop((int(sx), int(sy), int(sx + crop_w), int(sy + crop_h)))
    crop = crop.resize((ww, wh), Image.LANCZOS)

    out = Image.new('RGBA', frame.size, (0, 0, 0, 0))
    out.paste(crop, (l, t))
    out.alpha_composite(frame)
    out.save(os.path.join(d, out_name))
    print(f'  -> {out_name}')

print('done')
