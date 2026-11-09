from PIL import Image, ImageEnhance, ImageFilter, ImageOps

source = r'C:\Users\mcvdi\Downloads\alltypejpgs\IMG_2588(1).jpg'
output = r'D:\Coding\All-Type\IMG_2588_faithful.png'

im = Image.open(source).convert('RGB')
# The four corners follow the photographed print, inset to remove the paper.
photo = im.transform(
    (1110, 1860), Image.Transform.QUAD,
    (61, 81, 138, 2035, 1217, 1948, 1209, 102),
    resample=Image.Resampling.BICUBIC,
)
photo = photo.transpose(Image.Transpose.ROTATE_90)
# Tone and color adjustments use only the captured pixels.
photo = ImageOps.autocontrast(photo, cutoff=0.6, preserve_tone=True)
photo = ImageEnhance.Brightness(photo).enhance(1.10)
photo = ImageEnhance.Contrast(photo).enhance(1.06)
photo = ImageEnhance.Color(photo).enhance(0.92)
photo = photo.filter(ImageFilter.UnsharpMask(radius=1.1, percent=85, threshold=4))
photo.save(output, optimize=True)
print(output, photo.size)
