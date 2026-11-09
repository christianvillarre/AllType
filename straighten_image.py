from PIL import Image, ImageOps, ImageEnhance

source = r"C:\Users\mcvdi\Downloads\alltypejpgs\IMG_2529(1).jpg"
destination = r"D:\Coding\All-Type\IMG_2529_straightened.jpg"

image = Image.open(source).convert("RGB")
# Corners of the printed photograph, in the phone image.
quad = (241, 108, 247, 1808, 1201, 1762, 1221, 155)
image = image.transform((1000, 1650), Image.Transform.QUAD, quad, Image.Resampling.BICUBIC)
image = image.transpose(Image.Transpose.ROTATE_90)
image = ImageEnhance.Contrast(image).enhance(1.05)
image.save(destination, quality=95, subsampling=0)
print(destination)
