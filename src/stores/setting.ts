import { defineStore } from 'pinia';

export const useSettingStore = defineStore('setting', {
    state: () => ({
        camera: [] as ICameraIP[]
    }),
    actions: {
        setCame(cam: any) {
            this.camera = cam;
        },
        updateCame(cam: any) {
            this.camera = cam;
        },
        removeCamera(name: string) {
            this.camera = this.camera.filter((m: any) => m.name !== name);
        },
    }
});
