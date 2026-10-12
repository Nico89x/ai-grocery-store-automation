"""Downsize CC0 texture sources for locally bundled Three.js characters."""
from pathlib import Path
from PIL import Image

source = Path('work/makehuman')
output = Path('public/assets/humans')
output.mkdir(parents=True, exist_ok=True)
files = {
    'skin-light.jpg': ('skins/young_caucasian_male/young_lightskinned_male_diffuse.png', 1024),
    'skin-dark.jpg': ('skins/young_african_male/young_darkskinned_male_diffuse.png', 1024),
    'skin-female.jpg': ('skins/young_caucasian_female/young_lightskinned_female_diffuse.png', 1024),
    'jacket.jpg': ('clothes/male_casualsuit05/male_casualsuit05_diffuse.png', 1024),
    'female-tee.jpg': ('clothes/female_casualsuit01/female_casualsuit01_diffuse.png', 1024),
    'shoes.jpg': ('clothes/shoes01/shoes01_diffuse.png', 512),
    'short-hair.png': ('hair/short02/short02_diffuse.png', 512),
    'bob-hair.png': ('hair/bob01/bob01_diffuse.png', 512),
    'eyes.jpg': ('eyes/materials/brown_eye.png', 256),
}
for name, (original, size) in files.items():
    image = Image.open(source / original)
    image.thumbnail((size, size), Image.Resampling.LANCZOS)
    if name.endswith('.jpg'):
        image = image.convert('RGB')
        image.save(output / name, quality=86, optimize=True)
    else:
        image.save(output / name, optimize=True)
    print(name, (output / name).stat().st_size)
