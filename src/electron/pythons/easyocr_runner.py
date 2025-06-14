import sys
import easyocr
import base64
from PIL import Image
import numpy as np
import io
import json

reader = easyocr.Reader(['en'])

def read_image_from_base64(base64_str):
    image_data = base64.b64decode(base64_str)
    image = Image.open(io.BytesIO(image_data)).convert('RGB')
    return np.array(image)

def main():
    input_data = sys.stdin.read()
    try:
        payload = json.loads(input_data)
        base64_image = payload.get('image')
        if not base64_image:
            print(json.dumps({"error": "No image provided"}))
            return

        image = read_image_from_base64(base64_image.split(',')[-1])
        results = reader.readtext(image)
        text_results = [res[1] for res in results]
        print(json.dumps({"results": text_results}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
