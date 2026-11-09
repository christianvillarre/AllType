from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter

source = Path(r'C:\Users\mcvdi\Downloads\alltypejpgs')
output = Path(r'C:\Users\mcvdi\.codex\visualizations\2026\11\06\01a1b27e-9b4c-7f33-9c45-20021b2b7e0d')
output.mkdir(parents=True, exist_ok=True)

photos = [
    ('IMG_2564(1).jpg', (150, 520, 1395, 510, 1455, 1480, 145, 1560)),
    ('IMG_2565(1).jpg', (100, 540, 1400, 540, 1440, 1525, 80, 1530)),
]
for filename, quad in photos:
    im = Image.open(source / filename).convert('RGB')
    # Pillow QUAD ordering: top left, bottom left, bottom right, top right.
    tlx, tly, trx, try_, brx, bry, blx, bly = quad
    width = round(((trx-tlx)**2 + (try_-tly)**2)**0.5)
    height = round(((blx-tlx)**2 + (bly-tly)**2)**0.5)
    crop = im.transform((width, height), Image.Transform.QUAD,
                        (tlx,tly, blx,bly, brx,bry, trx,try_),
                        resample=Image.Resampling.BICUBIC)
    crop = crop.transpose(Image.Transpose.ROTATE_270)
    crop = ImageEnhance.Contrast(crop).enhance(1.06)
    crop = crop.filter(ImageFilter.UnsharpMask(radius=1.2, percent=85, threshold=4))
    dest = output / (filename.split('(')[0].split('.')[0] + '_straightened.jpg')
    crop.save(dest, quality=95, subsampling=0)
    print(dest)
