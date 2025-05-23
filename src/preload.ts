// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";
import { version } from '../package.json';
import os from 'os';

contextBridge.exposeInMainWorld('platform', os.platform());

contextBridge.exposeInMainWorld("Api", {
    login: (email: string, password: string) => ipcRenderer.invoke("login", email, password),

    logOut: () => ipcRenderer.invoke("logOut"),

    getInfoUser: () => ipcRenderer.invoke("getInfoUser"),
    
    setInfoUser: (params: any) => ipcRenderer.invoke("setInfoUser", params),
    
    getToken: () => ipcRenderer.invoke("getToken"),

    setToken: (params: any) => ipcRenderer.invoke("setToken", params),

    getApi: (path: string, data: any, options?: any) => ipcRenderer.invoke("get-api", path, data, options),

    postApi: (path: string, data: any, options?: any) => ipcRenderer.invoke("post-api", path, data, options),

    getSources: (params: any) => ipcRenderer.invoke("get-sources", params),
    
    getVersion: () => version,

    getListSerialport: () => ipcRenderer.invoke("get-list-serialport"),

    useSerialport: (path: string) => ipcRenderer.invoke("use-serialport", path),

    onRFID: (callback: (data: string) => void) => {
        ipcRenderer.on('rfid-data', (_e, data) => callback(data))
    }
});
