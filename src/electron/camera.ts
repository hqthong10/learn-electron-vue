import ffmpeg from 'fluent-ffmpeg';
import { getFfmpegPath } from './utils';

// Chụp 1 frame từ RTSP stream
export function captureFromRTSP(rtspUrl: string, outputPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .setFfmpegPath(getFfmpegPath() || 'ffmpeg')
      .input(rtspUrl)
      .inputOptions(['-rtsp_transport', 'tcp', '-analyzeduration', '1000000', '-probesize', '1000000'])
      .outputOptions(['-frames:v 1', '-q:v', '2']) // chỉ lấy 1 khung hình
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', reject)
      .run();
  });
}
