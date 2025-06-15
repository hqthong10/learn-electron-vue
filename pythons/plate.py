import easyocr
import cv2
import numpy as np
import base64
import json
import sys
import re

# Regex định dạng biển số xe Việt Nam
PLATE_REGEX =  re.compile(r'\d{2}[A-Z]{1,2}[- ]?\d{3,5}(\.\d{2})?')

def read_base64_image(base64_string):
    try:
        img_data = base64.b64decode(base64_string)
        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img
    except Exception:
        return None

def is_valid_vn_plate(text):
    return bool(PLATE_REGEX.search(text.replace(" ", "").upper()))

def detect_and_crop_to_json(base64_string):
    image = read_base64_image(base64_string)
    if image is None:
        print(json.dumps({"error": "Không thể giải mã ảnh từ base64"}))
        return

    try:
        reader = easyocr.Reader(['vi', 'en'])
    except Exception as e:
        print(json.dumps({"error": f"Model loading failed: {str(e)}"}))
        sys.exit(1)

    results = reader.readtext(image)
    output = []

    h, w = image.shape[:2]

    for bbox, text, confidence in results:
        print(f"OCR result: '{text}' with confidence {confidence}")
        if confidence < 0.4:
            continue

        text_clean = text.replace(" ", "").upper()
        if not is_valid_vn_plate(text_clean):
            continue

        pts = np.array(bbox).astype(int)
        x_min = max(0, min(pts[:, 0]))
        x_max = min(w, max(pts[:, 0]))
        y_min = max(0, min(pts[:, 1]))
        y_max = min(h, max(pts[:, 1]))

        cropped = image[y_min:y_max, x_min:x_max]
        _, buffer = cv2.imencode('.jpg', cropped)
        img_base64 = base64.b64encode(buffer).decode('utf-8')

        output.append({
            "text": text_clean,
            "confidence": round(float(confidence), 2),
            "bounding_box": [[int(x), int(y)] for x, y in bbox],
            "image_base64": img_base64
        })

    if not output:
        print(json.dumps({"error": "Không phát hiện biển số hợp lệ"}))
    else:
        print(json.dumps(output, ensure_ascii=False))

def main():
    input_data = sys.stdin.read()
    try:
        payload = json.loads(input_data)
        base64_image = payload.get('image')
        if not base64_image:
            print(json.dumps({"error": "No image provided"}))
            return

        detect_and_crop_to_json(base64_image.split(',')[-1])
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
