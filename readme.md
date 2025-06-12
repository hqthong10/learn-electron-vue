Đọc thẻ	nfc-pcsc hoặc serialport
Capture camera	HTML5 MediaStream API
Nhận diện biển số	OpenALPR, Plate Recognizer, hoặc AI nội bộ

# Các cách kết nối thiết bị bên ngoài trong Electron
1. Cổng Serial (COM / RS232 / USB-to-COM)
Dùng thư viện serialport

npm install serialport

// main.js
const { SerialPort } = require('serialport');

const port = new SerialPort({
  path: 'COM3',
  baudRate: 9600,
});

port.on('data', (data) => {
  console.log('Received:', data.toString());
});

2. USB (USB HID hoặc USB generic)
- Dùng node-hid nếu là USB HID (như barcode scanner).
- Dùng usb nếu là thiết bị USB không theo chuẩn HID.

npm install node-hid

// main.js
const HID = require('node-hid');
const devices = HID.devices();

console.log(devices);

const device = new HID.HID(vid, pid);
device.on('data', (data) => {
  console.log('Received:', data);
});

3. Máy in (Printer)
Dùng node-printer hoặc printer

npm install printer

const printer = require('printer');

printer.printDirect({
  data: 'Hello world!',
  printer: 'Printer_Name',
  type: 'RAW',
  success: () => console.log('printed'),
  error: (err) => console.error(err),
});


Cam DS-2CD1121G2-LIU

app.getPath('userData'): File ảnh dùng trong app
app.getPath('pictures'): Người dùng cần dễ tìm
app.getPath('temp'): Tệp tạm / test	