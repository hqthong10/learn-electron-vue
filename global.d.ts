import { ElectronApi } from "./src/preload";
import { overloading } from '@/utils/overlay-loading';

declare global {
    interface Window {
        Api: ElectronApi
    }

    const $overloading: typeof overloading;
}

export {}