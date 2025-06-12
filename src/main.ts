import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import windowStateKeeper from 'electron-window-state';
import os from 'os'

import { setupIpcHandlers, windowAllClosed } from './electron/ipc-handler';
import { createAppMenu } from './electron/menu-bar';

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
            webSecurity: false,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindowState.manage(mainWindow);

    createAppMenu(mainWindow);

    // and load the index.html of the app.
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
        mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
    }

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    const platform = os.platform()
    console.log(platform);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    createWindow();

    setupIpcHandlers(mainWindow);
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    windowAllClosed();
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

let ffmpegProcess: any;
let wsServer: any;
let httpServer: any;
let currentStream:any = null;

// HTTP Server để serve static files
function startHttpServer() {
    const app = express();
    app.use(express.static(path.join(__dirname, 'public')));
    
    httpServer = app.listen(3000, () => {
        console.log('HTTP Server running on port 3000');
    });
}

function startWebSocketServer() {
    wsServer = new WebSocket.Server({ 
        port: 8081,
        perMessageDeflate: false
    });
    
    wsServer.on('connection', (ws, req) => {
        console.log('WebSocket client connected from:', req.connection.remoteAddress);
        
        ws.on('close', () => {
            console.log('WebSocket client disconnected');
        });
        
        ws.on('error', (err) => {
            console.error('WebSocket error:', err);
        });
    });
    
    console.log('WebSocket Server running on port 8081');
}

function startRTSPtoMPEG1(rtspUrl) {
    console.log('Starting RTSP to MPEG1 conversion:', rtspUrl);
    
    ffmpegProcess = spawn('ffmpeg', [
        '-i', rtspUrl,
        '-f', 'mpegts',
        '-codec:v', 'mpeg1video',
        '-codec:a', 'mp2',
        '-b:v', '1000k',
        '-b:a', '128k',
        '-r', '30',
        '-bf', '0',
        '-muxdelay', '0.001',
        '-fflags', 'nobuffer',
        '-flags', 'low_delay',
        '-strict', 'experimental',
        'http://localhost:8082/stream'
    ], {
        stdio: ['ignore', 'pipe', 'pipe']
    });

    ffmpegProcess.stdout.on('data', (data) => {
        // Broadcast to all connected WebSocket clients
        if (wsServer) {
            wsServer.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(data);
                }
            });
        }
    });

    ffmpegProcess.stderr.on('data', (data) => {
        console.log('FFmpeg stderr:', data.toString());
        if (mainWindow) {
            mainWindow.webContents.send('ffmpeg-log', data.toString());
        }
    });

    ffmpegProcess.on('close', (code) => {
        console.log(`FFmpeg process exited with code ${code}`);
        if (mainWindow) {
            mainWindow.webContents.send('streaming-stopped');
        }
    });

    ffmpegProcess.on('error', (err) => {
        console.error('FFmpeg error:', err);
        if (mainWindow) {
            mainWindow.webContents.send('streaming-error', err.message);
        }
    });
}

// Chuyển đổi RTSP thành Raw video stream (Ultra low latency)
function startRTSPtoRaw(rtspUrl) {
    console.log('Starting RTSP to Raw stream conversion:', rtspUrl);
    
    ffmpegProcess = spawn('ffmpeg', [
        '-rtsp_transport', 'tcp',
        '-i', rtspUrl,
        '-f', 'mpegts',
        '-codec:v', 'mpeg1video',
        '-s', '640x480',
        '-b:v', '800k',
        '-r', '25',
        '-bf', '0',
        '-g', '15',
        '-maxrate', '800k',
        '-bufsize', '800k',
        '-flags', 'low_delay',
        '-fflags', 'nobuffer',
        '-probesize', '32',
        '-analyzeduration', '0',
        'pipe:1'
    ], {
        stdio: ['ignore', 'pipe', 'pipe']
    });

    ffmpegProcess.stdout.on('data', (data) => {
        // Broadcast binary data to WebSocket clients
        if (wsServer) {
            wsServer.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    try {
                        client.send(data);
                    } catch (err) {
                        console.error('Error sending WebSocket data:', err);
                    }
                }
            });
        }
    });

    ffmpegProcess.stderr.on('data', (data) => {
        const log = data.toString();
        console.log('FFmpeg:', log);
        if (mainWindow) {
            mainWindow.webContents.send('ffmpeg-log', log);
        }
    });

    ffmpegProcess.on('close', (code) => {
        console.log(`FFmpeg process exited with code ${code}`);
        if (mainWindow) {
            mainWindow.webContents.send('streaming-stopped');
        }
    });

    ffmpegProcess.on('error', (err) => {
        console.error('FFmpeg error:', err);
        if (mainWindow) {
            mainWindow.webContents.send('streaming-error', err.message);
        }
    });
}

function stopRealTimeStream() {
    if (ffmpegProcess) {
        console.log('Stopping FFmpeg process');
        ffmpegProcess.kill('SIGTERM');
        ffmpegProcess = null;
    }
    
    if (wsServer) {
        console.log('Closing WebSocket server');
        wsServer.close();
        wsServer = null;
    }
    
    if (httpServer) {
        console.log('Closing HTTP server');
        httpServer.close();
        httpServer = null;
    }
    
    currentStream = null;
}

// IPC Handlers
ipcMain.handle('start-realtime-stream', async (event, { rtspUrl, mode = 'jsmpeg' }) => {
    try {
        if (!rtspUrl) {
            throw new Error('RTSP URL is required');
        }
        
        // Stop existing stream
        stopRealTimeStream();
        
        // Start servers
        startHttpServer();
        startWebSocketServer();
        
        // Start streaming based on mode
        if (mode === 'jsmpeg') {
            startRTSPtoMPEG1(rtspUrl);
        } else {
            startRTSPtoRaw(rtspUrl);
        }
        
        currentStream = { url: rtspUrl, mode };
        
        return { 
            success: true, 
            message: `Real-time streaming started (${mode})`,
            wsUrl: 'ws://localhost:8081'
        };
    } catch (error) {
        console.error('Error starting real-time stream:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('stop-realtime-stream', async () => {
    stopRealTimeStream();
    return { success: true, message: 'Real-time streaming stopped' };
});

ipcMain.handle('get-stream-status', async () => {
    return {
        active: currentStream !== null,
        stream: currentStream,
        clients: wsServer ? wsServer.clients.size : 0
    };
});