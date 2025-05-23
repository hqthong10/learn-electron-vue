import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import windowStateKeeper from 'electron-window-state';
import axios from 'axios';
import store from './electron/app-store.ts';
import { SerialPort } from 'serialport';
import HID from 'node-hid'
import os from 'os'

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

const STORE_USER_KEY = 'wbnl-user';
const STORE_TOKEN_KEY = 'wbnl-token';
const domainWebServiceViewer = 'https://000.webinaris.co/apiv4/app/proxy/';
const domainWebServiceAdmin = 'https://app.webinaris.co/api/app/';

ipcMain.handle('getInfoUser', async () => {
    const user = store.get(STORE_USER_KEY);
    return user;
});

//
ipcMain.handle('setInfoUser', async (_, data) => {
    store.set(STORE_USER_KEY, data);
});

//
ipcMain.handle('getToken', async (_) => {
    const token = store.get(STORE_TOKEN_KEY);
    return token;
});

//
ipcMain.handle('setToken', async (_, token) => {
    store.set(STORE_TOKEN_KEY, token);
});

ipcMain.handle('logOut', async (_) => {
    store.delete(STORE_TOKEN_KEY);
    store.delete(STORE_USER_KEY);
});

ipcMain.handle('get-api', async (_, url, data, option?) => {
    const urlApi = path.join(domainWebServiceAdmin, url) + '?v=4&ENV=product';
    return callRequest('get', urlApi, data, option);
});

ipcMain.handle('post-api', async (_, url, data, option) => {
    const urlApi = path.join(domainWebServiceAdmin, url) + '?v=4&ENV=product';
    return callRequest('post', urlApi, data, option);
});

ipcMain.handle('login', async (_, email, password) => {
    const res = await callRequest('post', 'tungns/login/qver1_checkproviderlogin', { pvQV101: email, pvQV102: password });
    if (res.status === 'success' && res.elements?.FK100 > 0) {
        store.set(STORE_USER_KEY, res.elements);
        store.set(STORE_TOKEN_KEY, res.elements?.TOKEN || '');
    }
    return res;
});

async function callRequest(method: string, url: string, data: any, option?: any) {
    const urlApi = path.join('', url);
    let headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        // 'x-client-id': 'webinar-flutter',
        // 'x-client-token': '09881147f6b27b6eb626cf23efc53346d0920beebc4322b51e81bc76cecd4ebe',
        authorization: '',
        secret: '',
        IP: ''
    };

    const token = store.get(STORE_TOKEN_KEY);
    const user = store.get(STORE_USER_KEY);
    token && (headers['authorization'] = `Bearer ${token}`);
    option?.headers && (headers = { ...headers, ...option.headers });

    if (user && data['FK100'] == null) {
        data['FK100'] = user.FK100 || 0;
        data['LOGIN'] = user.QV101 || '';
    }

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

ipcMain.handle('get-list-serialport', async () => {
    try {
        const hid = HID.devices();
        const serialport = await SerialPort.list();
        return { hid, serialport };
    } catch(e){
        //
    }
});

ipcMain.handle('use-serialport', async (_, path: string) => {
    const serialPort = new SerialPort({
        path: path, //'/dev/tty.usbserial-1410', // hoặc COM3
        baudRate: 9600
    });
    // const port = new SerialPort({ path: '/dev/port', baudRate: 9600 });
    // const port = new SerialPort({
    //   // path: 'COM3', // hoặc '/dev/ttyUSB0' nếu dùng Linux
    //   // baudRate: 9600
    //    path: '/dev/tty-usbserial1',
    // baudRate: 57600,
    // })

    serialPort.on('open', () => {
        console.log(`Đã kết nối tới ${path}`)
    });

    serialPort.on('error', (err) => {
        console.error('Lỗi:', err.message)
    });

    serialPort.on('data', (data: any) => {
        const tag = data.toString().trim();
        console.log('RFID Tag:', tag);
        // Gửi tag về renderer nếu cần
        mainWindow?.webContents.send('rfid-tag', tag);
    });
});
