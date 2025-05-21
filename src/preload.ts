// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";
import { version } from '../package.json';

contextBridge.exposeInMainWorld("Api", {
login: (email: string, password: string) => ipcRenderer.invoke("login", email, password),

    logOut: () => ipcRenderer.invoke("logOut"),

    getInfoUser: () => ipcRenderer.invoke("getInfoUser"),
    
    setInfoUser: (params: any) => ipcRenderer.invoke("setInfoUser", params),
    
    getToken: () => ipcRenderer.invoke("getToken"),

    setToken: (params: any) => ipcRenderer.invoke("setToken", params),

    providerGet: (path: string, data: any, options?: any) => ipcRenderer.invoke("provider-get", path, data, options),

    providerPost: (path: string, data: any, options?: any) => ipcRenderer.invoke("provider-post", path, data, options),

    viewerGet: (path: string, data: any, options?: any) => ipcRenderer.invoke("viewer-get", path, data, options),

    viewerPost: (path: string, data: any, options?: any) => ipcRenderer.invoke("viewer-post", path, data, options),

    getSources: (params: any) => ipcRenderer.invoke("get-sources", params),

    getVersion: () => version,

});
