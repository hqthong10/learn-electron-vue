import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import windowStateKeeper from 'electron-window-state';
import axios from 'axios';
import store from './electron/store';
import { SerialPort } from 'serialport';
import HID from 'node-hid'
import os from 'os'
import { writeFileSync } from 'node:fs';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
    app.quit();
}

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
    const mainWindowState = windowStateKeeper({
        defaultWidth: 1000,
        defaultHeight: 800
    });

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: mainWindowState.width,
        height: mainWindowState.height,
        x: mainWindowState.x,
        y: mainWindowState.y,
        webPreferences: {
            nodeIntegration: false,
            // contextIsolation: true, // false = Để dùng mediaDevices trực tiếp

            sandbox: false,
            devTools: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindowState.manage(mainWindow);

    // and load the index.html of the app.
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
        mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
    }

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    // SerialPort.list().then((ports) => {
    //     console.log('Available ports:', ports);
    // });

    let grantedDeviceThroughPermHandler: any;

    mainWindow.webContents.session.on('select-usb-device', (event, details, callback) => {
        // Add events to handle devices being added or removed before the callback on
        // `select-usb-device` is called.
        mainWindow.webContents.session.on('usb-device-added', (event, device) => {
            console.log('usb-device-added FIRED WITH', device);
            // Optionally update details.deviceList
        });

        mainWindow.webContents.session.on('usb-device-removed', (event, device) => {
            console.log('usb-device-removed FIRED WITH', device);
            // Optionally update details.deviceList
        });

        event.preventDefault();
        if (details.deviceList && details.deviceList.length > 0) {
            const deviceToReturn = details.deviceList.find((device) => {
                return !grantedDeviceThroughPermHandler || device.deviceId !== grantedDeviceThroughPermHandler.deviceId;
            });
            if (deviceToReturn) {
                callback(deviceToReturn.deviceId);
            } else {
                callback();
            }
        }
    });

    mainWindow.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
        if (permission === 'usb' && details.securityOrigin === 'file:///') {
            return true;
        }
    });

    mainWindow.webContents.session.setDevicePermissionHandler((details) => {
        if (details.deviceType === 'usb' && details.origin === 'file://') {
            if (!grantedDeviceThroughPermHandler) {
                grantedDeviceThroughPermHandler = details.device;
                return true;
            } else {
                return false;
            }
        }
    });

    mainWindow.webContents.session.setUSBProtectedClassesHandler((details) => {
        return details.protectedClasses.filter((usbClass) => {
            // Exclude classes except for audio classes
            return usbClass.indexOf('audio') === -1;
        });
    });

    const platform = os.platform()
    console.log(platform);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

const STORE_USER_KEY = 'nmh-user';
const API_URL = 'https://api.vhomesolution.com/';

ipcMain.handle('get-info-user', async () => {
    const user = store.get(STORE_USER_KEY);
    return user;
});

//
ipcMain.handle('set-info-user', async (_, data) => {
    store.set(STORE_USER_KEY, data);
});

ipcMain.handle('logout', async () => {
    store.delete(STORE_USER_KEY);
});

ipcMain.handle('get-api', async (_, url, data, option?) => {
    return callRequest('get', url, data, option);
});

ipcMain.handle('post-api', async (_, url, data, option) => {
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
        }
        store.set(STORE_USER_KEY, userData);
        return userData;
    }
    return null;
});

async function callRequest(method: string, url: string, data: any, option?: any) {
    const urlApi = path.join(API_URL, url);
    let headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        authorization: ''
    };

    const userInfo = store.get(STORE_USER_KEY);
    const user = userInfo?.data || {};
    const token = userInfo?.token || '';
    token && (headers['authorization'] = `Bearer ${token}`);
    option?.headers && (headers = { ...headers, ...option.headers });

    // if (user && data['FK100'] == null) {
    //     data['FK100'] = user.FK100 || 0;
    //     data['LOGIN'] = user.QV101 || '';
    // }

    try {
        const response = await axios({
            method,
            url: urlApi,
            data: data,
            headers
        });
        return response.data;
    } catch (err) {
        console.log(err);
        return { code: 400, status: 'error', message: 'Bad Request' };
    }
}

ipcMain.handle('get-devices', async () => {
    try {
        const hid = await HID.devicesAsync();
        const com = await SerialPort.list();
        return { hid, com };
    } catch(e){
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
        console.log(`Đã kết nối tới ${path}`)
    });

    serialPort.on('error', (err) => {
        console.error('Lỗi:', err.message)
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
            console.log('Received from HID device:', data)
            mainWindow?.webContents.send('hid-data', data);
        })

        deviceHid.on('error', (err) => {
            console.error('HID Error:', err)
        })
        return true;
    } catch (err) {
        console.error('Error connecting to HID device:', err)
    }
    
});

// IPC handlers for camera operations
ipcMain.handle('test-camera-connection', async (event, cameraConfig) => {
  try {
    const { ip, username, password, port } = cameraConfig
    const auth = Buffer.from(`${username}:${password}`).toString('base64')
    
    const response = await axios.get(`http://${ip}:${port}/ISAPI/System/deviceInfo`, {
      headers: {
        'Authorization': `Basic ${auth}`
      },
      timeout: 5000
    })
    
    return { success: true, data: response.data }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Không thể kết nối camera'
    }
  }
})

ipcMain.handle('capture-snapshot', async (event, cameraConfig) => {
  try {
    const { ip, username, password, port } = cameraConfig
    const auth = Buffer.from(`${username}:${password}`).toString('base64')
    
    const response = await axios({
      method: 'GET',
      url: `http://${ip}:${port}/ISAPI/Streaming/channels/101/picture`,
      headers: {
        'Authorization': `Basic ${auth}`
      },
      responseType: 'arraybuffer',
      timeout: 10000
    })
    
    // Convert to base64
    const base64Image = Buffer.from(response.data).toString('base64')
    
    return { 
      success: true, 
      image: `data:image/jpeg;base64,${base64Image}`,
      timestamp: new Date().toISOString()
    }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Không thể chụp ảnh'
    }
  }
})

ipcMain.handle('save-image', async (event, { imageData, filename }) => {
  try {
    const { filePath } = await dialog.showSaveDialog({
      defaultPath: filename,
      filters: [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png'] }
      ]
    })
    
    if (filePath) {
      // Remove data URL prefix
      const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '')
      writeFileSync(filePath, base64Data, 'base64')
      return { success: true, filePath }
    }
    
    return { success: false, error: 'Người dùng hủy lưu file' }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('get-rtsp-url', async (event, cameraConfig) => {
  const { ip, username, password, port } = cameraConfig
  return `rtsp://${username}:${password}@${ip}:554/Streaming/Channels/101`
})