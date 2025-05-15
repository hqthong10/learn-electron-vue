export {}
declare global {
    interface Window {
        Api: {
            getInfoUser: (params: any) => any,
            setInfoUser: (params: any) => any,
            getToken: (params: any) => any,
            setToken: (params: any) => any,
            postApi: (params: any) => any,
            getApi: (params: any) => any,
        }
    }
}
