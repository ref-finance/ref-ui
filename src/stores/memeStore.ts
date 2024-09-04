import { create } from 'zustand';

interface IMemeStore {
  getCheckInLoading: () => boolean;
  setCheckInLoading: (checkInLoading: boolean) => void;
}
export const useMemeStore = create<IMemeStore>((set: any, get: any) => ({
  checkInLoading: false,
  getCheckInLoading: () => get().checkInLoading,
  setCheckInLoading: (checkInLoading: boolean) => set({ checkInLoading }),
}));
