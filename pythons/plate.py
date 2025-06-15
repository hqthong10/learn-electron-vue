import easyocr
import cv2
import numpy as np
import base64
import json
import sys
import re

# Regex linh hoạt, không dùng capture group
PLATE_REGEX = re.compile(r'\d{2}[A-Z]{1,2}[-]?\d{5,7}')

def read_base64_image(base64_string):
    try:
        img_data = base64.b64decode(base64_string)
        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img
    except Exception:
        return None

def normalize_text(text):
    replacements = {
        " ": "", "]": ".", "—": "-", "–": "-", "‘": "", "’": "", "'": "",
        "I": "1", "l": "1"
    }
    for k, v in replacements.items():
        text = text.replace(k, v)
    text = text.upper()
    if text.endswith('.') and not re.search(r'\.\d{2}$', text):
        text = text[:-1]  # bỏ dấu chấm sai ở cuối
    return text

def format_plate(text):
    text = text.replace('.', '')
    if len(text) == 9:
        return text[:5] + ' ' + text[5:8] + '.' + text[8:]
    elif len(text) == 8:
        return text[:5] + ' ' + text[5:]
    return text

def merge_ocr_lines(results):
    merged = []
    used = set()
    for i in range(len(results)):
        if i in used or results[i][2] < 0.4:
            continue
        bbox1, text1, conf1 = results[i]
        y1 = np.mean([pt[1] for pt in bbox1])
        merged_text = normalize_text(text1)
        all_pts = bbox1.copy()
        used.add(i)

        for j in range(i + 1, len(results)):
            if j in used or results[j][2] < 0.4:
                continue
            bbox2, text2, conf2 = results[j]
            y2 = np.mean([pt[1] for pt in bbox2])
            if abs(y1 - y2) < 60:
                merged_text += normalize_text(text2)
                all_pts += bbox2
                used.add(j)

        merged.append((merged_text, all_pts))
    return merged

def detect_and_crop_to_json(base64_string):
    image = read_base64_image(base64_string)
    if image is None:
        print(json.dumps({"error": "Không thể giải mã ảnh từ base64"}))
        return

    reader = easyocr.Reader(['vi', 'en'], download_enabled=False)
    results = reader.readtext(image)

    h, w = image.shape[:2]
    merged_results = merge_ocr_lines(results)

    output = []
    for text, pts in merged_results:
        print(f"[DEBUG] Merged text: {text}")
        match = re.search(PLATE_REGEX, text)
        if not match:
            continue

        raw_plate = match.group()
        formatted_plate = format_plate(raw_plate)

        pts = np.array(pts).astype(int)
        x_min = max(0, min(pts[:, 0]))
        x_max = min(w, max(pts[:, 0]))
        y_min = max(0, min(pts[:, 1]))
        y_max = min(h, max(pts[:, 1]))

        cropped = image[y_min:y_max, x_min:x_max]
        _, buffer = cv2.imencode('.jpg', cropped)
        img_base64 = base64.b64encode(buffer).decode('utf-8')

        output.append({
            "text": formatted_plate,
            "confidence": None,
            "bounding_box": [[int(x), int(y)] for x, y in pts],
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
