## start
- node: 22
- npm i
- npm start

# python3
- Tạo virtual environment
python3 -m venv pythonenv

- Kích hoạt virtual environment
source pythonenv/bin/activate

- upgrade pip
pip install --upgrade pip

- cài thư viện
pip install easyocr pyinstaller

- thoát virtual environment
deactivate

# Tạo executable cho tất cả file .py
pyinstaller --onefile --windowed src/python-utils/detect_plate.py
find . -name "*.py" -maxdepth 1 -exec sh -c 'pyinstaller --onefile --name "$(basename "{}" .py)" "{}"' \;

#
Nhận diện biển số	OpenALPR, Plate Recognizer, hoặc AI nội bộ


2. USB (USB HID hoặc USB generic)
- Dùng node-hid nếu là USB HID (như barcode scanner).
- Dùng usb nếu là thiết bị USB không theo chuẩn HID.

## path electron app
app.getPath('userData'): File ảnh dùng trong app
app.getPath('pictures'): Người dùng cần dễ tìm
app.getPath('temp'): Tệp tạm / test	

# device
- camera hkvision DS-2CD1121G2-LIU
- usb reader

# account 0777444444