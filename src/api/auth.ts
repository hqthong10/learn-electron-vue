import { adminPostApi } from "./index";
import MD5 from 'crypto-js/md5'
import { useAuthStore } from '@/stores/auth';

export const login = async (email: string, password: string) => {
  const rs = await window.Api.login(email, MD5(password).toString());
  return rs;
};

// Future<WebinarListResponse<N150Model>> checkPresLogin({
//     required String email,
//     required String password,
//     required int fk100,
//     bool? isRawPass = true,
//   }) async {
//     final form = {
//       'NV155': email,
//       'NV164': isRawPass == true
//           ? md5.convert(utf8.encode(password)).toString()
//           : password,
//       'FK100': fk100,
//       'TOKEN': '',
//       'ALIAS': '',
//       'LOGIN': email,
//       'forceNew': 1
//     };

//     final response = await post("v4/2021/n150/nver1_checkpreslogin", form);
//     return WebinarListResponse.fromJson(
//       response.data,
//       (json) => N150Model.fromJson(json as Map<String, dynamic>?),
//     );
//   }


export const logout = () => {
  return window.Api.logOut();
};

export const trackingAction = async (action: string) => {
  const authStore = useAuthStore();
  const version = window.Api.getVersion();
  const device = '';

  const rs = await adminPostApi("proxy/tungns/v1/2023/statistic/trackingActionProviderByMongodb", {
      "email": authStore.userInfo.QV101 || '',
      "fk100": authStore.userInfo.FK100 || 0,
      action,
      options: {
        type: authStore.userInfo.role || 'provider',
        name: `${authStore.userInfo.QV106} ${authStore.userInfo.QV107}`,
        version,
        device
      }
    }
  );

  return rs;
};
