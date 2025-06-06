export {}
declare global {
    interface Window {
        Api: {
            login: (email: string, password: string) => any
            logout: () => any
            getInfoUser: () => any
            setInfoUser: (params: any) => any
            getSetting: () => any
            setSetting: (params: any) => any
            getApi: (path: string, data: any, options?: any) => any
            postApi: (path: string, data: any, options?: any) => any
            getRequest: (path: string, data: any, options?: any) => any
            postRequest: (path: string, data: any, options?: any) => any
            getVersion: () => string
            getDevices: () => any
            connectCOM: (path: string) => any
            connectHID: (device: any) => any
            onCOM: (cb: (data: string) => void) => void
            onHID: (cb: (data: string) => void) => void
            testCameraConnection: (config: CameraConfig) => Promise<ConnectionResult>
            captureSnapshot: (config: CameraConfig) => Promise<CaptureResult>
            saveImage: (imageData: string, filename: string) => Promise<SaveResult>
            getRtspUrl: (config: CameraConfig) => Promise<string>
        }
    }
}
