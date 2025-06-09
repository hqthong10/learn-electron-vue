import ffmpegPath from 'ffmpeg-static';
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


// let ffmpeg_args = [
//         '-rtsp_transport', 'tcp',
//         '-y', '-i', sessions[sessionId].rtsplink,
//         '-re', '-i', 'static/mp3/18BanNhacKhongLoiTuyenChon.mp3',

//         // Watermark ở góc phải
//         '-i', 'static/imgs/logo-with-txt.png',
//         '-filter_complex', "[0:v]scale=1280:trunc(ow/a/2)*2[scaled]; [2:v]scale=128:-1[scaledimg]; [scaled][scaledimg]overlay=main_w-overlay_w-5:5,format=yuv420p[outv]",

//         // Watermark ở giữa khung hình
//         // '-i', 'static/imgs/whitex3-20.png',
//         // '-filter_complex', "[0:v]scale=1280:trunc(ow/a/2)*2[scaled]; [2:v]scale=618:-1[scaledimg]; [scaled][scaledimg]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2,format=yuv420p[outv]", // center

//         // '-filter_complex', "[0:v]scale=1280:trunc(ow/a/2)*2,format=yuv420p[outv]",
//         '-c:v', 'libx264',
//         '-c:a', 'aac',
//         '-strict', '-2',
//         '-b:a', '128k',
//         '-b:v', '1920k',
//         '-tune', 'zerolatency',
//         '-preset', 'veryfast',
//         '-g', '30', '-r', '30',
//         '-map', '[outv]',
//         '-map', '1:a',
//         '-threads', '2',
//         '-f', 'flv',
//         sessions[sessionId].rtmplink,

//     ].concat();
