import { app } from 'electron';
import path from 'node:path';
import * as fs from 'fs';

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

export const getGPUUsage = async () => {
    // try {
    //     // Try to get NVIDIA GPU usage if available
    //     import nvidia from 'node-nvidia-ml';
    //     await nvidia.init();
    //     const deviceCount = await nvidia.deviceGetCount();

    //     if (deviceCount > 0) {
    //         const device = await nvidia.deviceGetHandleByIndex(0);
    //         const utilization = await nvidia.deviceGetUtilizationRates(device);
    //         return utilization.gpu;
    //     }
    // } catch (error) {
    //     // NVIDIA ML not available or no NVIDIA GPU
    // }

    // Mock GPU usage for demonstration
    return Math.round(Math.random() * 40 + 20); // 20-60% range
};
