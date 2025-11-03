## start
- B1: use node 22
- B2: npm i
- B3: khởi tạo môi trường python
    npm run init:mac:python or npm run init:win:python
- B4: download trước thư viện cho python
    python3 pythons/test.py
- B5: npm start

# python3
- Tạo virtual environment
python3 -m venv pythonenv

- Kích hoạt virtual environment
mac: source pythonenv/bin/activate
win: pythonenv\Scripts\activate

- upgrade pip
pip install --upgrade pip

- cài thư viện
pip install easyocr pyinstaller opencv-python-headless numpy

- thoát virtual environment
deactivate

- tạo executable cho python
pyinstaller --onefile pythons/plate.py
<!-- find . -name "*.py" -maxdepth 1 -exec sh -c 'pyinstaller --onefile --name "$(basename "{}" .py)" "{}"' \; -->


## path electron app
app.getPath('userData'): File ảnh dùng trong app
app.getPath('pictures'): Người dùng cần dễ tìm
app.getPath('temp'): Tệp tạm / test	

# USB (USB HID hoặc USB generic)
- Dùng node-hid nếu là USB HID (như barcode scanner).
- Dùng usb nếu là thiết bị USB không theo chuẩn HID.

# device use
- camera hkvision DS-2CD1121G2-LIU
- usb reader

# account 0777444444