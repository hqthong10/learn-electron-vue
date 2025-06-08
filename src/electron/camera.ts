import ffmpegPath from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';

const OUTPUT_PATH = path.join(__dirname, '..', '..', 'snapshot.jpg');

// Chụp 1 frame từ RTSP stream
export function captureFromRTSP(rtspUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .setFfmpegPath(ffmpegPath || 'ffmpeg')
      .input(rtspUrl)
      .inputOptions(['-rtsp_transport', 'tcp']) // ổn định hơn udp
      .outputOptions(['-frames:v 1']) // chỉ lấy 1 khung hình
      .output(OUTPUT_PATH)
      .on('end', () => resolve(OUTPUT_PATH))
      .on('error', reject)
      .run();
  });
}