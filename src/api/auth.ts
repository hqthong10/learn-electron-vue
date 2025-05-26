import { postApi } from "./index";
import MD5 from 'crypto-js/md5'
import { useAuthStore } from '@/stores/auth';

export const login = async (phone: string, password: string) => {
  return await window.Api.login(phone, MD5(password).toString());
};

export const logout = () => {
  return window.Api.logOut();
};
