// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";
import { version } from '../package.json';
import os from 'os';

export type CameraConfig = {
  ip: string
  port: number
  username: string
  password: string
}

export type CaptureResult = {
  success: boolean
  image?: string
  timestamp?: string
  error?: string
}

export type ConnectionResult = {
  success: boolean
  data?: any
  error?: string
}

export type SaveResult = {
  success: boolean
  filePath?: string
  error?: string
}

contextBridge.exposeInMainWorld('platform', os.platform());

contextBridge.exposeInMainWorld("Api", {
    login: (phone: string, password: string) => ipcRenderer.invoke("login", phone, password),

    logOut: () => ipcRenderer.invoke("logout"),

    getInfoUser: () => ipcRenderer.invoke("get-info-user"),
    
    setInfoUser: (params: any) => ipcRenderer.invoke("set-info-user", params),

    getApi: (path: string, data: any, options?: any) => ipcRenderer.invoke("get-api", path, data, options),

    postApi: (path: string, data: any, options?: any) => ipcRenderer.invoke("post-api", path, data, options),
    
    getVersion: () => version,

    getDevices: () => ipcRenderer.invoke("get-devices"),

    connectCOM: (path: string) => ipcRenderer.invoke("connect-com", path),

    connectHID: (data: any) => ipcRenderer.invoke("connect-hid", data),
    
    onCOM: (callback: (data: string) => void) => {
        ipcRenderer.on('com-data', (_e, data) => callback(data))
    },

    onHID: (callback: (data: any) => void) => {
        ipcRenderer.on('hid-data', (_e, data) => callback(data))
    },

    testCameraConnection: (config: CameraConfig): Promise<ConnectionResult> => ipcRenderer.invoke('test-camera-connection', config),
  
  captureSnapshot: (config: CameraConfig): Promise<CaptureResult> => ipcRenderer.invoke('capture-snapshot', config),
  
  saveImage: (imageData: string, filename: string): Promise<SaveResult> =>  ipcRenderer.invoke('save-image', { imageData, filename }),
  
  getRtspUrl: (config: CameraConfig): Promise<string> => ipcRenderer.invoke('get-rtsp-url', config)
});
