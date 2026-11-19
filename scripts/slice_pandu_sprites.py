import os
from PIL import Image
import numpy as np
from collections import deque

SRC_DIR = r"D:\Downloads\Pandu images"
OUT_DIR = r"D:\Desktop\Pandu\src\assets\official-chibi"

os.makedirs(OUT_DIR, exist_ok=True)

def clean_hand_from_frame(arr):
    # Remove human hand from petting frame while preserving ears and fur
    h, w, _ = arr.shape
    is_skin = (
        (arr[:, :, 3] > 30) &
        (arr[:, :, 0] > 180) &
        (arr[:, :, 1] > 140) &
        (arr[:, :, 2] > 120) &
        ((arr[:, :, 0].astype(int) - arr[:, :, 2].astype(int)) > 30)
    )
    is_skin[150:, :] = False

    q = deque()
    hand_mask = np.zeros((h, w), dtype=bool)
    ys, xs = np.where(is_skin)
    for y, x in zip(ys, xs):
        hand_mask[y, x] = True
        q.append((x, y))

    while q:
        x, y = q.popleft()
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < 150 and not hand_mask[ny, nx]:
                p = arr[ny, nx]
                if p[3] > 20:
                    is_white_fur = (
                        (p[0] > 235) and (p[1] > 225) and (p[2] > 225) and
                        (abs(int(p[0]) - int(p[2])) < 20)
                    )
                    is_left_ear = (nx < 150) and (ny > 50)
                    is_right_ear = (nx > 370) and (ny > 80)
                    if not is_white_fur and not is_left_ear and not is_right_ear:
                        hand_mask[ny, nx] = True
                        q.append((nx, ny))

    cleaned = arr.copy()
    cleaned[hand_mask] = [0, 0, 0, 0]
    return cleaned

def clean_alpha_noise(im, threshold=12):
    arr = np.array(im)
    low_alpha = arr[:, :, 3] < threshold
    arr[low_alpha] = [0, 0, 0, 0]
    return Image.fromarray(arr)

def slice_grid(filename, prefix, cols, rows, remove_hand=False):
    filepath = os.path.join(SRC_DIR, filename)
    im = Image.open(filepath)
    cw = im.width / cols
    ch = im.height / rows

    print(f"Slicing {filename} ({im.width}x{im.height}) -> {cols}x{rows}...")
    frames = []
    idx = 0
    for r in range(rows):
        for c in range(cols):
            x1 = int(round(c * cw))
            y1 = int(round(r * ch))
            x2 = int(round((c + 1) * cw))
            y2 = int(round((r + 1) * ch))
            cell = im.crop((x1, y1, x2, y2))
            
            # Clean alpha noise
            cell = clean_alpha_noise(cell)

            if remove_hand:
                arr = np.array(cell)
                arr = clean_hand_from_frame(arr)
                cell = Image.fromarray(arr)

            out_name = f"{prefix}_{idx}.png"
            out_path = os.path.join(OUT_DIR, out_name)
            cell.save(out_path, format="PNG", optimize=True)
            frames.append(out_name)
            idx += 1
            print(f"  Saved {out_name} (size: {cell.size})")

    return frames

def main():
    manifest = {}

    # 1. Idle (4 keys)
    manifest["idle"] = slice_grid("IDLE.png", "idle", 4, 1)

    # 2. Listening (4 keys)
    manifest["listening"] = slice_grid("Panda Listening Reaction Sprite Sheet.png", "listening", 4, 1)

    # 3. Tea Break (6 keys)
    manifest["tea"] = slice_grid("Cozy Panda Tea Break Sticker Sheet.png", "tea", 3, 2)

    # 4. Checklist (6 keys)
    manifest["checklist"] = slice_grid("Pandu Panda Checklist Sticker Sheet.png", "checklist", 3, 2)

    # 5. Tantrum (6 keys)
    manifest["tantrum"] = slice_grid("Chibi Panda Tantrum Sticker Sheet.png", "tantrum", 3, 2)

    # 6. Celebration (8 keys)
    manifest["celebration"] = slice_grid("Pandu Panda Celebration Sprite Sheet.png", "celebration", 4, 2)

    # 7. Sleepy (6 keys)
    manifest["sleepy"] = slice_grid("Kawaii Panda Sleepy Sticker Sprite Sheet.png", "sleepy", 3, 2)

    # 8. Petting (6 keys, remove hand)
    manifest["petting"] = slice_grid("Kawaii Panda Petting Sticker Sheet.png", "petting", 3, 2, remove_hand=True)

    print("\n--- ALL SPRITES SLICED SUCCESSFULLY! ---")
    print(f"Total categories: {len(manifest)}")
    total_frames = sum(len(v) for v in manifest.values())
    print(f"Total frames: {total_frames}")

if __name__ == "__main__":
    main()
