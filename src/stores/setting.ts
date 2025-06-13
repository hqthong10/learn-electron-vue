import { defineStore } from 'pinia';

export const useSettingStore = defineStore('setting', {
    state: () => ({
        cameras: [] as ICamera[]
    }),
    actions: {
        setCameras(cams: ICamera[]) {
            this.cameras = cams;
        },

        updateCamera(cam: ICamera) {
            const camidx = this.cameras.findIndex((item: ICamera) => item.name === cam.name);
            if (camidx >= 0) {
                this.cameras[camidx] = { ...this.cameras[camidx], ...cam };
            }
        },

        addCamera(cam: ICamera) {
            this.cameras.push(cam);
        },

        removeCamera(name: string) {
            this.cameras = this.cameras.filter((m: any) => m.name !== name);
        }
    }
});
