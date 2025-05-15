import { app, BrowserWindow, desktopCapturer, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import windowStateKeeper from 'electron-window-state';
import * as fs from 'fs';
import Store from 'electron-store';


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const store = new Store() as any;

const createWindow = () => {
  const mainWindowState = windowStateKeeper({
    defaultWidth: 1000,
    defaultHeight: 800
  });

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: mainWindowState.width,
    height: mainWindowState.height,
    x: mainWindowState.x,
    y: mainWindowState.y,
    webPreferences: {
      nodeIntegration: false,
      // contextIsolation: true, // false = Để dùng mediaDevices trực tiếp
      
      sandbox: false,
      devTools: true,
      preload: path.join(__dirname, 'preload.js'),
    },
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

ipcMain.handle('getInfoUser', async (event) => {
  const user = store.get('myapp-user');  
  return user;
});

//
ipcMain.handle('setInfoUser', async (event, data) => {
  store.set('myapp-user', data);
});

//
ipcMain.handle('getToken', async (event) => {
  const token = store.get('myapp-token');  
  return token;
});

//
ipcMain.handle('setToken', async (event, token) => {
  store.set('myapp-token', token);
});

const API_BASE = '';
function getAuthHeader() {
  const token = store.get('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

ipcMain.handle('postApi', async (_, options) => {
  const res = await fetch(`${API_BASE}/${options.path}`, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options.params)
  });

  const data = await res.json();
  if (res.ok && data.token) {
    store.set('token', data.token);
  }

  return { ok: res.ok, data };
});

ipcMain.handle('getApi', async (_, options) => {
  const res = await fetch(`${API_BASE}/${options.path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
  });

  return {
    ok: res.ok,
    data: await res.json()
  };
});