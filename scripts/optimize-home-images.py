"""Build display-sized WebP copies of the images used on the homepage."""

from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1] / "images"
OUTPUT = ROOT / "optimized"
OUTPUT.mkdir(exist_ok=True)

IMAGES = {
    "Alltype_HP2.jpg": 1600,
    "Alltype_HP3.jpg": 1600,
    "stock9.jpeg": 1100,
    "roofing1.jpeg": 1200,
    "commercial_construction.jpeg": 1200,
    "emergency_response.jpeg": 1200,
    "renovation.png": 1200,
    "storm_recovery.jpeg": 1200,
    "stock5.jpeg": 1000,
    "stock6.jpeg": 1000,
    "20260729_134656.jpg": 900,
    "20260729_132651.JPG": 900,
    "20260729_133123.JPG": 900,
    "20260729_134146.JPG": 900,
}

for filename, max_width in IMAGES.items():
    source = ROOT / filename
    target = OUTPUT / (Path(filename).stem.lower() + ".webp")
    with Image.open(source) as original:
        image = ImageOps.exif_transpose(original).convert("RGB")
        if image.width > max_width:
            image.thumbnail((max_width, max_width * 3), Image.Resampling.LANCZOS)
        image.save(target, "WEBP", quality=78, method=6)
    print(f"{filename}: {source.stat().st_size // 1024} KiB -> {target.stat().st_size // 1024} KiB")
