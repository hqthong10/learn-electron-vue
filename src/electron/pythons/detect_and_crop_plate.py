import easyocr
import cv2
import numpy as np
import base64
import json
import sys
import io

def read_base64_image(base64_string):
    try:
        img_data = base64.b64decode(base64_string)
        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img
    except Exception as e:
        return None
    
def detect_and_crop_to_json(base64_string):
    # image = cv2.imread(image_path)
    # if image is None:
    #     print(json.dumps({"error": f"Không đọc được ảnh: {image_path}"}))
    #     return

    image = read_base64_image(base64_string)
    if image is None:
        print(json.dumps({"error": "Không thể giải mã ảnh từ base64"}))
        return
    
    reader = easyocr.Reader(['en'])
    results = reader.readtext(image)
    
    # text_results = [res[1] for res in results]
    # print(json.dumps({"results": text_results}))

    output = []

    h, w = image.shape[:2]

    for bbox, text, confidence in results:
        if confidence < 0.4:
            continue

        pts = np.array(bbox).astype(int)
        x_min = max(0, min(pts[:, 0]))
        x_max = min(w, max(pts[:, 0]))
        y_min = max(0, min(pts[:, 1]))
        y_max = min(h, max(pts[:, 1]))

        cropped = image[y_min:y_max, x_min:x_max]

        # Encode cropped image to base64
        _, buffer = cv2.imencode('.jpg', cropped)
        img_base64 = base64.b64encode(buffer).decode('utf-8')

        output.append({
            "text": text,
            "confidence": round(confidence, 2),
            "bounding_box": bbox,
            "image_base64": img_base64
        })

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
