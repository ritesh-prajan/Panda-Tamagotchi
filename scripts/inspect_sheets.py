import os
from PIL import Image

dirpath = r"d:\Desktop\Pandu\src\assets\official-chibi"
sheets = ["idle", "listening", "tea", "checklist", "tantrum", "celebration", "sleepy", "petting"]

html = ["<!DOCTYPE html><html><head><title>Pandu Sprites</title></head>",
        "<body style='background:#1e1e2e;color:#cdd6f4;font-family:sans-serif;padding:20px;'>",
        "<h1>Official Chibi Sprites - Frame Verification</h1>"]

for s in sheets:
    html.append(f"<h2>{s.upper()}</h2>")
    html.append("<div style='display:flex;flex-wrap:wrap;gap:12px;margin-bottom:20px;'>")
    matching = sorted([f for f in os.listdir(dirpath) if f.startswith(s + "_")], key=lambda x: int(x.split("_")[1].split(".")[0]))
    for m in matching:
        p = os.path.join(dirpath, m).replace("\\", "/")
        html.append(
            f"<div style='background:#181825;padding:8px;border-radius:8px;text-align:center;border:1px solid #313244;'>"
            f"<img src='{p}' width='150' height='150' style='background:repeating-conic-gradient(#313244 0% 25%, #45475a 0% 50%) 50% / 16px 16px;border-radius:6px;object-fit:contain;'><br>"
            f"<b style='color:#f38ba8;'>{m}</b>"
            f"</div>"
        )
    html.append("</div>")

html.append("</body></html>")

with open(r"d:\Desktop\Pandu\scripts\preview_frames.html", "w", encoding="utf-8") as f:
    f.write("\n".join(html))

print("Created scripts/preview_frames.html successfully.")
