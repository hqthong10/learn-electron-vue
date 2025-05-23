export {}
declare global {
    interface Window {
        Api: {
            login: (email: string, password: string) => any,
            logOut: () => any,
            getInfoUser: () => any,
            setInfoUser: (params: any) => any,
            getToken: () => any,
            setToken: (params: any) => any,
            getApi: (path: string, data: any, options?: any) => any,
            postApi: (path: string, data: any, options?: any) => any,
            getVersion: () => string,
            getDevices: () => any,
            connectCOM: (path: string) => any,
            connectHID: (device: any) => any,
            onCOM: (cb: (data: string) => void) => void,
            onHID: (cb: (data: string) => void) => void,
        }
    }
}
