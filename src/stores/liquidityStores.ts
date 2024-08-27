import { create } from 'zustand';

type IShadowRecordStore = {
  shadowRecords: any[];
  setShadowRecords: (p: any) => void;
};
export const useShadowRecordStore = create<IShadowRecordStore>(
  (set, get: any) => ({
    shadowRecords: [],
    setShadowRecords: (d: any) => set({ shadowRecords: d }),
  })
);

type IFarmerSeedsStore = {
  farmerSeeds: any;
  rawFarmerSeeds: any;
  setFarmerSeeds: (p: any) => void;
};
export const useFarmerSeedsStore = create<IFarmerSeedsStore>(
  (set, get: any) => ({
    farmerSeeds: {},
    rawFarmerSeeds: {},
    setFarmerSeeds: (d: any) => {
      const seeds = {};
      Object.entries(d).forEach(([key, value]) => {
        const poolId = key.split('@')?.[1];
        seeds[poolId] = value;
      });
      set({ rawFarmerSeeds: d, farmerSeeds: seeds });
    },
  })
);

type IStakeListStore = {
  stakeListV1: Record<string, string>;
  stakeListV2: Record<string, string>;
  stakeListAll: Record<string, string>;
  setStakeListTogether: (p: any) => void;
};
export const useStakeListStore = create<IStakeListStore>((set, get: any) => ({
  stakeListV1: null,
  stakeListV2: null,
  stakeListAll: null,
  setStakeListTogether: (d: any) => {
    const { stakeListV1, stakeListV2, stakeListAll } = d || {};
    const toUpdate: any = {};
    if (stakeListV1) {
      toUpdate.stakeListV1 = stakeListV1;
    }
    if (stakeListV2) {
      toUpdate.stakeListV2 = stakeListV2;
    }
    if (stakeListAll) {
      toUpdate.stakeListAll = stakeListAll;
    }
    set(toUpdate);
  },
}));
