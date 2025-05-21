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
            providerGet: (path: string, data: any, options?: any) => any,
            providerPost: (path: string, data: any, options?: any) => any,
            viewerGet: (path: string, data: any, options?: any) => any,
            viewerPost: (path: string, data: any, options?: any) => any,
            getVersion: () => string,
        }
    }
}
