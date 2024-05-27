import { create } from 'zustand';

export const introCurrentPageStore = create((set, get: any) => ({
  currentPage: 1,
  setCurrentPage: (currentPage) => set({ currentPage }),
  getCurrentPage: () => get().currentPage,
}));
