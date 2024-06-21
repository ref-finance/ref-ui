import { create } from 'zustand';

export const useOrderlyGuidePopStore = create((set, get: any) => ({
  hasGo: false,
  setHasGo: (hasGo) => set({ hasGo }),
  getHasGo: () => get().hasGo,
}));
