import { create } from 'zustand';

export const useUserBlackAssetStore = create((set, get: any) => ({
  hasBlackAsset: false,
  setHasBlackAsset: (status) => set({ hasBlackAsset: status }),
  getHasBlackAsset: () => get().hasBlackAsset,
}));
