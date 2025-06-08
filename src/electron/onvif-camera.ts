// src/main/services/onvif-camera.ts
import { Cam } from 'onvif';

export function connectToCamera(
  hostname: string,
  username: string,
  password: string
): Promise<Cam> {
  return new Promise((resolve, reject) => {
    new Cam(
      {
        hostname,
        username,
        password,
        port: 80, // cổng ONVIF mặc định
      },
      function (err: any) {
        if (err) return reject(err);
        resolve(this as Cam);
      }
    );
  });
}

// Lấy RTSP URL từ profile video
export async function getRTSPUrl(cam: Cam): Promise<string | null> {
  const profiles = await new Promise<any[]>((resolve, reject) => {
    cam.getProfiles((err: any, profiles: any[]) => {
      if (err) reject(err);
      else resolve(profiles);
    });
  });

  const profile = profiles[0]; // chọn profile đầu tiên

  const streamUri = await new Promise<string>((resolve, reject) => {
    cam.getStreamUri({ profileToken: profile.token }, (err: any, stream: any) => {
      if (err) reject(err);
      else resolve(stream.uri);
    });
  });

  return streamUri;
}
