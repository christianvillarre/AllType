from pathlib import Path
from PIL import Image, ImageOps, ImageEnhance, ImageFilter

source = Path(r"C:\Users\mcvdi\Downloads\alltypejpgs")
output = Path("restored_photos")
output.mkdir(exist_ok=True)

# Coordinates follow the four printed-image corners in the photographed sheets.
photos = [
    ("IMG_2598(1).jpg", "stop_sign_repair_restored.jpg",
     (338, 128, 1310, 220, 1322, 1530, 293, 1572), (1360, 1020)),
    ("IMG_2599.jpg", "stop_sign_restored.jpg",
     (0, 248, 1397, 292, 1434, 1730, 0, 1850), (1510, 1380)),
]

for src, dst, (tlx, tly, trx, try_, brx, bry, blx, bly), size in photos:
    im = Image.open(source / src).convert("RGB")
    # PIL QUAD order: upper-left, lower-left, lower-right, upper-right.
    quad = (tlx, tly, blx, bly, brx, bry, trx, try_)
    im = im.transform(size, Image.Transform.QUAD, quad, resample=Image.Resampling.BICUBIC)
    im = im.transpose(Image.Transpose.ROTATE_90)
    im = ImageOps.autocontrast(im, cutoff=0.4, preserve_tone=True)
    im = ImageEnhance.Color(im).enhance(1.06)
    im = im.filter(ImageFilter.UnsharpMask(radius=1.4, percent=95, threshold=3))
    im.save(output / dst, quality=94, subsampling=0)
    print((output / dst).resolve())
