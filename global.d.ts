export {}
declare global {
    interface Window {
        Api: {
            getSources: (params: any) => any,
            pushRtmp: any,
            saveVideo: any,
            startFFmpeg: any,
            sendMediaToFFmpeg: any,
            endFFmpeg: any,
        }
    }
}
