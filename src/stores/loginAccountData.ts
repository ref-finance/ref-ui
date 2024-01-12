import { create } from 'zustand';

import type { WalletSelector, AccountState } from '@near-wallet-selector/core';

type ILoginAccountDataStore = {
  accounts: Array<AccountState>;
  accountId: string | null;
  isLedger: boolean;
  getAccountId: () => any;
  getAccounts: () => any;
  getIsLedger: () => any;
  setAccountId: (p: any) => any;
  setAccounts: (p: any) => any;
  setIsLedger: (p: any) => any;
};
export const useLoginAccountDataStore = create<ILoginAccountDataStore>(
  (set, get: any) => ({
    accountId: '',
    accounts: [],
    isLedger: false,
    getAccountId: () => get().accountId,
    setAccountId: (accountId) => set({ accountId }),
    getAccounts: () => get().accounts,
    setAccounts: (accounts) => set({ accounts }),
    getIsLedger: () => get().isLedger,
    setIsLedger: (isLedger) => set({ isLedger }),
  })
);

type IWalletStore = {
  wallet: any;
  setWallet: (p: any) => any;
  removeWallet: (p: any) => any;
};
export const useWalletStore = create<IWalletStore>((set) => ({
  wallet: null,
  setWallet: (data) => set({ wallet: data }),
  removeWallet: () => set({ wallet: null }),
}));
