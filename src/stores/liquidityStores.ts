import { create } from 'zustand';

type IShadowRecordStore = {
  shadowRecords: any[];
  setShadowRecords: (p: any) => void;
};
export const useShadowRecord = create<IShadowRecordStore>((set, get: any) => ({
  shadowRecords: [],
  setShadowRecords: (d: any) => set({ shadowRecords: d }),
}));
