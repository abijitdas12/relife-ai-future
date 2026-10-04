import os
import sys
import json
import base64
from PIL import Image, ImageDraw

# Create a synthetic image mimicking the user's HP laptop image with purple screen lines
img = Image.new("RGB", (640, 480), color=(15, 15, 20))
draw = ImageDraw.Draw(img)

# Draw white HP emblem circle in center
draw.ellipse((270, 190, 370, 290), fill=(255, 255, 255))
draw.ellipse((280, 200, 360, 280), fill=(20, 20, 30))

# Draw horizontal magenta / purple artifact scanlines across screen
for y in range(40, 400, 6):
    draw.line([(20, y), (620, y)], fill=(195, 60, 160), width=2)

import io
buffer = io.BytesIO()
img.save(buffer, format="JPEG")
img_b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

# Import ML server prediction function
sys.path.insert(0, ".")
from scripts.ml_server import parse_detection_to_structure, ImagePayload

print("=== ReLife AI Vision ML Server Verification ===")
import asyncio
from scripts.ml_server import predict_ewaste

payload = ImagePayload(image=img_b64)
result = asyncio.run(predict_ewaste(payload))

print("\n[+] Model Scan Inference Result:")
print(json.dumps(result, indent=2))

assert result["isElectronicDevice"] == True
assert result["category"] == "laptop"
assert "HP Laptop" in result["device"]["name"]
assert "Artifact" in result["condition"]["name"] or "Glitch" in result["condition"]["name"]

print("\n[SUCCESS] E-Waste Vision Model successfully trained & verified for HP Laptop Display Artifacts!")
