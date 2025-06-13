import sys
import easyocr
from PIL import Image
import torch

# Load model
model = torch.hub.load('ultralytics/yolov5', 'custom', path='yolov5s.pt', force_reload=True)
reader = easyocr.Reader(['en'])

image_path = sys.argv[1]

# Detect license plate
results = model(image_path)
xyxy = results.pandas().xyxy[0]

# Assume first box is license plate
if not xyxy.empty:
    x1, y1, x2, y2 = map(int, xyxy.iloc[0][['xmin', 'ymin', 'xmax', 'ymax']])
    img = Image.open(image_path).crop((x1, y1, x2, y2))
    text = reader.readtext(img)
    plate = text[0][1] if text else 'Không nhận diện được'
    print(plate)
else:
    print('Không tìm thấy biển số')