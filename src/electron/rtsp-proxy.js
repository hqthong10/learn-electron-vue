const { spawn } = require('child_process');
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 9999 });
console.log('✅ RTSP WebSocket server at ws://localhost:9999');

wss.on('connection', (ws) => {
  const ffmpeg = spawn('ffmpeg', [
    '-rtsp_transport', 'tcp',
    '-i', 'rtsp://your_camera_url',
    '-f', 'mpegts',
    '-codec:v', 'mpeg1video',
    '-r', '25',
    '-'
  ]);

  ffmpeg.stdout.on('data', (data) => ws.send(data));
  ffmpeg.stderr.on('data', () => {}); // Suppress logs
  ws.on('close', () => ffmpeg.kill('SIGINT'));
});
