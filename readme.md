## start
- node: 22
- npm i
- npm start

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