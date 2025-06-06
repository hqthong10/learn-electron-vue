import { app } from 'electron';
import path from 'node:path';
import * as fs from 'node:fs';

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

