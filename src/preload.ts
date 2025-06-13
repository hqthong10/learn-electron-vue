// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';
import { version } from '../package.json';
import os from 'os';

export type CameraConfig = {
    ip: string;
    port: number;
    username: string;
    password: string;
};

export type CaptureResult = {
    success: boolean;
    image?: string;
    timestamp?: string;
    error?: string;
};

export type ConnectionResult = {
    success: boolean;
    data?: any;
    error?: string;
};

export type SaveResult = {
    success: boolean;
    filePath?: string;
    error?: string;
};

const electronApi = {
    version: () => version,
    platform: () => os.platform(),

    // auth
    login: (phone: string, password: string) => ipcRenderer.invoke('login', phone, password),
    logout: () => ipcRenderer.invoke('logout'),

    // electron-store
    getInfoUser: () => ipcRenderer.invoke('get-infouser'),
    setInfoUser: (params: any) => ipcRenderer.invoke('set-infouser', params),
    getSetting: () => ipcRenderer.invoke('get-setting'),
    setSetting: (params: any) => ipcRenderer.invoke('set-setting', params),

    // call api request
    getApi: (path: string, data: any, options?: any) => ipcRenderer.invoke('get-api', path, data, options),
    postApi: (path: string, data: any, options?: any) => ipcRenderer.invoke('post-api', path, data, options),
    getRequest: (path: string, data: any, options?: any) => ipcRenderer.invoke('request-api-get', path, data, options),
    postRequest: (path: string, data: any, options?: any) => ipcRenderer.invoke('request-api-post', path, data, options),

    // image
    saveImage: (imageData: string, filename: string): Promise<SaveResult> => ipcRenderer.invoke('save-image', { imageData, filename }),

    // serialport
    getComDevices: () => ipcRenderer.invoke('get-com-devices'),

    // node-hid
    getHidDevices: () => ipcRenderer.invoke('get-hid-devices'),
    connectHID: (data: any) => ipcRenderer.invoke('connect-hid', data),
    onHID: (callback: (data: any) => void) => {
        ipcRenderer.on('hid-data', (_e, data) => callback(data));
    },

    // camera hik
    camHikConnect: (config: CameraConfig): Promise<ConnectionResult> => ipcRenderer.invoke('cam-hik-connect', config),
    camHikCapture: (config: CameraConfig): Promise<CaptureResult> => ipcRenderer.invoke('cam-hik-capture', config),

    // camera rtsp
    camRtspUrl: (config: CameraConfig): Promise<string> => ipcRenderer.invoke('cam-rtsp-url', config),
    camRtspConnect: (config: CameraConfig): Promise<string> => ipcRenderer.invoke('cam-rtsp-connect', config),
    camRtspCapture: (rtspUrl: string) => ipcRenderer.invoke('cam-rtsp-capture', rtspUrl),

    // onvif
    getRtspUrlOnvif: (config: any) => ipcRenderer.invoke('get-rtsp-url-onvif', config),

    //
    processImage: (imagePath: string) => ipcRenderer.invoke('process-image', imagePath),

}

contextBridge.exposeInMainWorld('Api', electronApi);

export type ElectronApi = typeof electronApi;
