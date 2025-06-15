const { spawn } = require('child_process');
const WebSocket = require('ws');

const wsServer = new WebSocket.Server({ port: 9999 });
console.log('WebSocket server on ws://localhost:9999');

wsServer.on('connection', function connection(ws) {
  const ffmpeg = spawn('ffmpeg', [
    '-i', 'rtsp://your_camera_url',
    '-f', 'mpegts',
    '-codec:v', 'mpeg1video',
    '-r', '30',
    '-'
  ]);

  ffmpeg.stdout.on('data', (data) => {
    ws.send(data);
  });

  ffmpeg.stderr.on('data', (data) => {
    console.error('FFmpeg stderr:', data.toString());
  });

  ws.on('close', () => {
    ffmpeg.kill('SIGINT');
  });
});
