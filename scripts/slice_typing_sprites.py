import os
import glob
from PIL import Image
import numpy as np

# Find source file in D:\Downloads
matches = glob.glob(r"D:\Downloads\*Typing*.png")
if not matches:
    raise FileNotFoundError("Could not find Typing image in D:\\Downloads")

src_path = matches[0]
out_dir = r"d:\Desktop\Pandu\src\assets\official-chibi"
os.makedirs(out_dir, exist_ok=True)

print(f"Loading source image: {src_path}")
im = Image.open(src_path).convert("RGBA")
W, H = im.size
print(f"Image dimension: {W}x{H}")

cols = 4
cw = W // cols
ch = H

def clean_alpha_noise(im_cell, threshold=10):
    arr = np.array(im_cell)
    low_alpha = arr[:, :, 3] < threshold
    arr[low_alpha] = [0, 0, 0, 0]
    return Image.fromarray(arr)

saved_files = []
for c in range(cols):
    x1 = c * cw
    y1 = 0
    x2 = (c + 1) * cw
    y2 = ch
    cell = im.crop((x1, y1, x2, y2))
    cell = clean_alpha_noise(cell)
    
    out_name = f"typing_{c}.png"
    out_path = os.path.join(out_dir, out_name)
    cell.save(out_path, format="PNG", optimize=True)
    saved_files.append(out_path)
    print(f"Saved: {out_path} ({cell.size})")

print(f"\nSuccessfully sliced {len(saved_files)} typing frames into {out_dir}")
