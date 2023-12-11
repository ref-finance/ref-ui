import { create } from 'zustand';

export const useOrderlyBalancesStore = create((set, get: any) => ({
  balances: [],
  setBalances: (balances) => set({ balances }),
  getBalances: () => get().balances,
}));
