import { viewerGetApi } from './index';
import { useAuthStore } from '@/stores/auth';

export const listoftabb050cat = async ({ forceNew = false, FB050 = 0, FC150 = '', SHOWTIME = '', PARTNERID = '', ALIAS = '', mode  = '', SUBKEY = '' }: any) => {
    const authStore = useAuthStore();
    const form: any = {
        forceNew: forceNew == true ? 1 : 0,
        FB050: FB050,
        FC150: FC150,
        SHOWTIME: SHOWTIME,
        FK100: authStore.userInfo.FK100 || 0,
        LOGIN: authStore.userInfo.FK100.QV101 ?? '',
        TOKEN: authStore.token ?? '',
        PARTNERID,
        ALIAS,
        mode 
    }
    if(SUBKEY?.length > 0) {
        form.SUBKEY = SUBKEY;
    }
    const rs = await viewerGetApi('v4/2021/b050/livebver1_listoftabb050cat',  form);
    return rs;
};
