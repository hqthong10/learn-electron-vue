import { defineStore } from "pinia";
import { IShowtime } from "@/types/showtime";

interface IRoom {
  roomId: string;
  showtime: IShowtime;
  b050: any;
}

export const useRoomStore = defineStore("room", {
  state: (): IRoom => ({
    roomId: "",
    showtime: null,
    b050: null,
  }),
  actions: {
    setShowtime(obj: IShowtime) {
      this.showtime = obj;
    }
  },
});
