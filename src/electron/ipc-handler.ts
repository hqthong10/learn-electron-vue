import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import fs, { writeFileSync } from 'node:fs';
import { spawn, execFile } from 'child_process';
import axios from 'axios';
import store from './store';
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { HID, devicesAsync } from 'node-hid';
import { API_URL, STORE_SETTING_KEY, STORE_USER_KEY } from './constants';
import callRequest from './api';
import path from 'node:path';
import { captureFromRTSP } from './camera';
import { connectToCamera, getRTSPUrl } from './onvif-camera';
import { getPythonPath } from './utils';

let mainWindow: BrowserWindow;

export const windowAllClosed = () => {
    //
};

export function setupIpcHandlers(_mainWindow: BrowserWindow) {
    mainWindow = _mainWindow;

    //
    ipcMain.handle('get-infouser', async () => {
        const user = store.get(STORE_USER_KEY);
        return user;
    });

    //
    ipcMain.handle('set-infouser', async (_, data) => {
        store.set(STORE_USER_KEY, data);
    });

    //
    ipcMain.handle('get-setting', async () => {
        return store.get(STORE_SETTING_KEY);
    });

    //
    ipcMain.handle('set-setting', async (_, data) => {
        return store.set(STORE_SETTING_KEY, data);
    });

    //
    ipcMain.handle('logout', async () => {
        return store.delete(STORE_USER_KEY);
    });

    //
    ipcMain.handle('get-api', async (_, url, data, option?) => {
        return callRequest('get', path.join(API_URL, url), data, option);
    });

    ipcMain.handle('post-api', async (_, url, data, option) => {
        return callRequest('post', path.join(API_URL, url), data, option);
    });

    ipcMain.handle('request-api-get', async (_, url, data, option) => {
        return callRequest('get', url, data, option);
    });

    ipcMain.handle('request-api-post', async (_, url, data, option) => {
        return callRequest('post', url, data, option);
    });

    ipcMain.handle('login', async (_, phone, password) => {
        const res = await callRequest('post', path.join(API_URL, 'supplier/v2/q100s/login'), { QV108: phone, QV105: password });
        if (res.status === 'success' && res.elements?.PQ100 > 0) {
            const token = res.elements?.TOKEN || '';
            const userData = {
                data: res.elements,
                token: token,
                time: new Date().getTime(),
                role: 'KTV'
            };
            store.set(STORE_USER_KEY, userData);
            return userData;
        }
        return null;
    });

    ipcMain.handle('save-image', async (event, { imageData, filename }) => {
        try {
            const { filePath } = await dialog.showSaveDialog({
                defaultPath: filename,
                filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png'] }]
            });

            if (filePath) {
                // Remove data URL prefix
                const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
                writeFileSync(filePath, base64Data, 'base64');
                return { success: true, filePath };
            }

            return { success: false, error: 'Người dùng hủy lưu file' };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('get-com-devices', async () => {
        try {
            const ports = await SerialPort.list();
            // console.log('Available serial ports:', ports);
            return ports.filter((port) => port.manufacturer?.includes('FTDI') || port.manufacturer?.includes('Silicon Labs') || port.productId?.includes('USB'));
        } catch (e) {
            console.log(e);
            return [];
        }
    });

    ipcMain.handle('connect-com', async (_, device: any) => {
        try {
            const rfidPort = new SerialPort({
                path: device.path,
                baudRate: 9600
            });

            const rfidParser = rfidPort.pipe(new ReadlineParser({ delimiter: '\r\n' }));

            rfidParser.on('data', async (cardId: string) => {
                console.log('RFID Card detected:', cardId.trim());
                mainWindow?.webContents.send('rfid-data', cardId.trim());
            });

            rfidPort.on('error', (err) => {
                console.error('RFID Reader error:', err);
            });

            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    });

    ipcMain.handle('get-hid-devices', async () => {
        try {
            const hids = await devicesAsync();
            // console.log('Available hids:', hids);
            return hids.filter((d: any) => d.manufacturer.toLowerCase().includes('rfid') && [0, 1].includes(d.interface));
        } catch (e) {
            console.log(e);
            return [];
        }
    });

    ipcMain.handle('connect-hid', async (_, device: any) => {
        try {
            console.log(device);
            const deviceHid = new HID(device.vendorId, device.productId);
            // let deviceHid = new HID(device.path);

            deviceHid.on('data', (data) => {
                console.log('Received from HID device:', data);
                mainWindow?.webContents.send('hid-data', data);
            });

            deviceHid.on('error', (err) => {
                console.error('HID Error:', err);
                deviceHid.close();
            });
            return true;
        } catch (err) {
            console.error('Error connecting to HID device:', err);
            return false;
        }
    });

    ipcMain.handle('cam-hik-connect', async (event, cameraConfig) => {
        try {
            const { ip, username, password, port } = cameraConfig;
            const auth = Buffer.from(`${username}:${password}`).toString('base64');

            const response = await axios.get(`http://${ip}:${port}/ISAPI/System/deviceInfo`, {
                headers: {
                    Authorization: `Basic ${auth}`
                },
                timeout: 5000
            });

            return { success: true, data: response.data };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Không thể kết nối camera'
            };
        }
    });

    ipcMain.handle('cam-hik-capture', async (event, cameraConfig) => {
        try {
            const { ip, username, password, port } = cameraConfig;
            const auth = Buffer.from(`${username}:${password}`).toString('base64');

            const response = await axios({
                method: 'GET',
                url: `http://${ip}:${port}/ISAPI/Streaming/channels/101/picture`,
                headers: {
                    Authorization: `Basic ${auth}`
                },
                responseType: 'arraybuffer',
                timeout: 10000
            });

            // Convert to base64
            const base64Image = Buffer.from(response.data).toString('base64');

            return {
                success: true,
                image: `data:image/jpeg;base64,${base64Image}`,
                timestamp: new Date().toISOString()
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Không thể chụp ảnh'
            };
        }
    });

    ipcMain.handle('cam-rtsp-url', async (event, cameraConfig) => {
        // rtsplink: 'rtsp://viewer:FB1D2631C12FE8F7@117.3.2.18:554',
        // rtsplink: 'rtsp://viewer:FB1D2631C12FE8F7@14.241.131.216:553',
        // rtsplink: 'rtsp://viewer:FB1D2631C12FE8F7EE8951663A8A108@14.241.245.161:554',
        // rtsplink: 'rtsp://viewer:FB1D2631C12FE8F7EE8951663A8A108@115.78.11.232:554',
        // rtsplink: 'rtsp://viewer:FB1D2631C12FE8F7EE8951663A8A108@113.176.112.174:554',
        const { ip, username, password, port } = cameraConfig;
        // return `rtsp://${username}:${password}@${ip}:${port}/Streaming/Channels/101`;
        return `rtsp://${username}:${password}@${ip}:${port}`;
    });

    // Handle camera connection and streaming
    ipcMain.handle('cam-rtsp-connect', async (event, config) => {
        try {
            const { ip, username, password, port = 554, channel = 1 } = config;

            // const rtspUrl = `rtsp://${username}:${password}@${ip}:${port}/Streaming/Channels/${channel}01`;
            const rtspUrl = `rtsp://${username}:${password}@${ip}:${port}`;

            return { success: true, rtspUrl };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('cam-rtsp-capture', async (_, rtspUrl: string) => {
        try {
            const outputPath = path.join(app.getPath('userData'), `images/capture_${Date.now()}.jpg`);

            // Ensure screenshots directory exists
            const screenshotsDir = path.join(app.getPath('userData'), 'images');
            if (!fs.existsSync(screenshotsDir)) {
                fs.mkdirSync(screenshotsDir, { recursive: true });
            }

            const imgPath = await captureFromRTSP(rtspUrl, outputPath);

            return { imgPath };
        } catch (err) {
            console.error('Chụp ảnh thất bại:', err);
            return null;
        }
    });

    ipcMain.handle('cam-onvif-url', async (_, config: any) => {
        try {
            console.log('gogogo');
            const { ip, username, password } = config;
            const cam = await connectToCamera(ip, username, password);
            console.log('gogogo cam', cam);
            const rtspUrl = await getRTSPUrl(cam);
            console.log('gogogo rtspUrl', rtspUrl);
            return rtspUrl;
        } catch (err) {
            console.error('Kết nối ONVIF thất bại:', err);
            return null;
        }
    });

    ipcMain.handle('detect-image', async (event, obj) => {
        return new Promise((resolve) => {
            // const py = spawn(getPythonPath(), ['src/electron/pythons/easyocr_runner.py']);
            // let result = '';
            // py.stdout.on('data', data => result += data.toString());
            // py.stderr.on('data', data => console.error('[PYTHON ERROR]', data.toString()));
            // py.on('close', () => resolve(result.trim()));

            // py.stdin.write(JSON.stringify({ image: obj.base64 }))
            // py.stdin.end()

            // use imagePath
            // execFile(getPythonPath(), ['src/electron/pythons/detect_and_crop_plate.py', obj.imgPath], (error: any, stdout: any, stderr: any) => {
            //     if (error) return resolve(null);
            //     try {
            //         const result = JSON.parse(stdout);
            //         resolve(result);
            //     } catch (e) {
            //         console.log('error', stdout)
            //         resolve(null);
            //     }
            // });

            // use image base64
            const py = spawn(getPythonPath(), ['src/electron/pythons/detect_and_crop_plate.py']);
            // const py = spawn(getPythonPath(), ['src/electron/pythons/easyocr_runner.py']);

            let result = '';
            let error = '';

            py.stdout.on('data', (data) => (result += data.toString()));
            py.stderr.on('data', (data) => (error += data.toString()));
            // py.on('close', (code) => {
            //     if (code !== 0 || error) {
            //         console.log(error, code);
            //         return resolve(null);
            //     }
            //     try {
            //         resolve(JSON.parse(result));
            //     } catch (e) {
            //         console.log(result);
            //         resolve(result)
            //     }
            // });
            py.on('close', () => resolve(result.trim()));

            // Gửi base64 qua stdin
            py.stdin.write(JSON.stringify({ image: obj.base64 }));
            py.stdin.end();
        });
    });
}
