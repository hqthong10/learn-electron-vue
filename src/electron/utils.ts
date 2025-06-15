import { app } from 'electron';
import path from 'node:path';
import * as fs from 'node:fs';
import os from 'os';

export function getSavePath(fileName: string) {
    const platformSaveDir = app.getPath('videos'); // có thể là 'documents', 'desktop', etc.
    const savePath = path.join(platformSaveDir, 'MyApp', fileName); // tạo thư mục con trong Videos

    // Đảm bảo thư mục tồn tại
    const saveDir = path.dirname(savePath);
    if (!fs.existsSync(saveDir)) {
        fs.mkdirSync(saveDir, { recursive: true });
    }

    return savePath;
}

export function getFfmpegPath() {
    if (app.isPackaged) {
        // In packaged app
        return path.join(process.resourcesPath, 'ffmpeg-static', 'ffmpeg');
    } else {
        // In development
        return require('ffmpeg-static');
    }
}

export function getPythonPath() {
    if (app.isPackaged) {
        // In packaged app
        return path.join(process.resourcesPath, 'dist', 'app');
    } else {
        // In development
        const isWin = os.platform() === 'win32';
        const venvPath = path.join(__dirname, '../..', 'pythonenv');
        const pythonExecutable = isWin ? path.join(venvPath, 'Scripts', 'python.exe') : path.join(venvPath, 'bin', 'python3');
        return pythonExecutable;
    }
}

export function getPythonFile(name: string) {
    if (app.isPackaged) {   
        if (os.platform() === 'win32') {
            return path.join(process.resourcesPath, `${name}.exe`);
        } else {
            return path.join(process.resourcesPath, `${name}`);
        }
    } else {
        return `pythons/${name}.py`;
    }
}
