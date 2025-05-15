// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";

interface IRequest {
    path: string;
    params: any;
}

contextBridge.exposeInMainWorld("Api", {
    getInfoUser: () => ipcRenderer.invoke("getInfoUser"),
    
    setInfoUser: (params: any) => ipcRenderer.invoke("setInfoUser", params),
    
    getToken: () => ipcRenderer.invoke("getToken"),

    setToken: (params: any) => ipcRenderer.invoke("setToken", params),

    postApi: (params: IRequest) => ipcRenderer.invoke("postApi", params),

    getApi: (params: IRequest) => ipcRenderer.invoke("getApi", params),
});
