import { defineStore } from "pinia";

interface IUser {
  token: string;
  userInfo: any;
  role: 'provider' | 'moderator'
}

export const useAuthStore = defineStore("auth", {
  state: (): IUser => ({
    token: "",
    userInfo: null,
    role: 'provider'
  }),
  actions: {
    async loadFromElectron() {
      this.token = await window.Api.getToken();
      this.userInfo = await window.Api.getInfoUser();
      this.role = this.userInfo?.role || 'provider';
    },
    async loginSuccess(token: string, user: any) {
      this.token = token;
      this.userInfo = user;
    },
    async logout() {
      this.token = null;
      this.userInfo = null;
      await window.Api.logOut();
    },
  },
});
