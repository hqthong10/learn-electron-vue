import { defineStore } from "pinia";

interface IUser {
  data?: any;
  token?: string;
  time?: string;
  role?: 'ADMIN' | 'KTV'
}

export const useAuthStore = defineStore("auth", {
  state: (): IUser => ({
    token: null,
    data: null,
    time: null,
    role: 'KTV'
  }),
  actions: {
    async loadFromElectron() {
      const userInfo: IUser = await window.Api.getInfoUser();
      this.data = userInfo?.data || null;
      this.role = userInfo?.role || 'KTV';
      this.time = userInfo?.time || '';
      this.token = userInfo?.token || '';
    },
    async loginSuccess(userInfo: IUser) {
      this.data = userInfo?.data || null;
      this.role = userInfo?.role || 'KTV';
      this.time = userInfo?.time || '';
      this.token = userInfo?.token || '';
    },
    async logout() {
      this.token = null;
      this.data = null;
      this.role = null;
      this.time = null;
      await window.Api.logout();
    },
  },
});
