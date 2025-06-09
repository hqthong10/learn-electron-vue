import { BrowserWindow, dialog, ipcMain } from 'electron';
import fs, { writeFileSync } from 'node:fs';
import axios from 'axios';
import store from './store';
import { SerialPort } from 'serialport';
import HID from 'node-hid';
import { API_URL, STORE_SETTING_KEY, STORE_USER_KEY } from './constants';
import callRequest from './api';
import path from 'node:path';
import { captureFromRTSP } from './camera';
import { connectToCamera, getRTSPUrl } from './onvif-camera';

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
        const res = await callRequest('post', 'supplier/v2/q100s/login', { QV108: phone, QV105: password });
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

    ipcMain.handle('get-devices', async () => {
        try {
            const hid = await HID.devicesAsync();
            const com = await SerialPort.list();
            return { hid, com };
        } catch (e) {
            console.log(e);
            return { hid: [], com: [] };
        }
    });

    ipcMain.handle('connect-com', async (_, path: string) => {
        const serialPort = new SerialPort({
            path: path,
            baudRate: 9600
        });

        serialPort.on('open', () => {
            console.log(`Đã kết nối tới ${path}`);
        });

        serialPort.on('error', (err) => {
            console.error('Lỗi:', err.message);
        });

        serialPort.on('data', (data: any) => {
            const tag = data.toString().trim();
            console.log('COM Tag:', tag);
            // Gửi tag về renderer nếu cần
            mainWindow?.webContents.send('com-tag', tag);
        });
    });

    ipcMain.handle('connect-hid', async (_, device: any) => {
        try {
            const deviceHid = new HID.HID(device.vendorId, device.productId);

            deviceHid.on('data', (data) => {
                console.log('Received from HID device:', data);
                mainWindow?.webContents.send('hid-data', data);
            });

            deviceHid.on('error', (err) => {
                console.error('HID Error:', err);
            });
            return true;
        } catch (err) {
            console.error('Error connecting to HID device:', err);
        }
    });

    ipcMain.handle('test-connect-cam-hik', async (event, cameraConfig) => {
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

    ipcMain.handle('get-rtsp-url', async (event, cameraConfig) => {
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
    ipcMain.handle('connect-cam-rtsp', async (event, config) => {
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
            const outputPath = path.join(__dirname, 'screenshots', `capture_${Date.now()}.jpg`);

            // Ensure screenshots directory exists
            const screenshotsDir = path.join(__dirname, 'screenshots');
            if (!fs.existsSync(screenshotsDir)) {
                fs.mkdirSync(screenshotsDir, { recursive: true });
            }

            const imgPath = await captureFromRTSP(rtspUrl, outputPath);
            return imgPath; // trả về đường dẫn ảnh
        } catch (err) {
            console.error('Chụp ảnh thất bại:', err);
            return null;
        }
    });

    ipcMain.handle('get-rtsp-url-onvif', async (_, config: any) => {
        try {
            console.log('gogogo');
            const {ip, username, password} = config;
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

    
}
