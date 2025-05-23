import { postApi } from "./index";
import MD5 from 'crypto-js/md5'
import { useAuthStore } from '@/stores/auth';

export const login = async (email: string, password: string) => {
  const rs = await window.Api.login(email, MD5(password).toString());
  return rs;
};

export const logout = () => {
  return window.Api.logOut();
};
