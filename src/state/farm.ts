import React, { useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import { canFarm, canFarmV1, canFarmV2 } from '../services/pool';
import db from '../store/RefDatabase';
import {
  get_shadow_records,
  getStakedListByAccountId,
  list_farmer_seeds,
} from 'src/services/farm';
import {
  useFarmerSeedsStore,
  useShadowRecordStore,
  useStakeListStore,
} from 'src/stores/liquidityStores';
import { wallet } from 'src/services/near';

export const checkFarmStake = ({
  poolId,
  stakeList,
}: {
  poolId: number;
  stakeList: Record<string, string>;
}) => {
  let farmStake: string | number = '0';

  const seedIdList: string[] = Object.keys(stakeList);
  let tempFarmStake: string | number = '0';
  seedIdList.forEach((seed) => {
    const id = Number(seed.split('@')[1]);
    if (id == poolId) {
      tempFarmStake = BigNumber.sum(farmStake, stakeList[seed]).valueOf();
    }
  });

  return tempFarmStake;
};

export const useFarmStake = ({
  poolId,
  stakeList,
}: {
  poolId: number;
  stakeList: Record<string, string>;
}) => {
  const [farmStake, setFarmStake] = useState<string | number>('0');

  useEffect(() => {
    const seedIdList: string[] = Object.keys(stakeList);
    let tempFarmStake: string | number = '0';
    seedIdList.forEach((seed) => {
      const id = Number(seed.split('@')[1]);
      if (id == poolId) {
        tempFarmStake = BigNumber.sum(farmStake, stakeList[seed]).valueOf();
      }
    });
    setFarmStake(tempFarmStake);
  }, [stakeList]);

  return farmStake;
};

export const useCanFarm = (poolId: number) => {
  const [farmCount, setFarmCount] = useState<Number>(0);
  const [farmVersion, setFarmVersion] = useState<string>('');

  useEffect(() => {
    canFarm(poolId).then(({ count, version }) => {
      setFarmCount(count);
      setFarmVersion(version);
    });
  }, [poolId]);

  return { farmCount, farmVersion };
};

export const useCanFarmV1 = (poolId: number, withEnded?: boolean) => {
  const [farmCount, setFarmCount] = useState<number>(0);
  const [farmVersion, setFarmVersion] = useState<string>('');
  const [endedFarmCount, setEndedFarmCount] = useState<number>(0);

  useEffect(() => {
    canFarmV1(poolId, withEnded).then(({ count, version, endedCount }) => {
      setFarmCount(count);
      setFarmVersion(version);
      setEndedFarmCount(endedCount);
    });
  }, [poolId]);

  return { farmCount, farmVersion, endedFarmCount };
};

export const useCanFarmV2 = (poolId: number, withEnded?: boolean) => {
  const [farmCount, setFarmCount] = useState<number>(0);

  const [endedFarmCount, setEndedFarmCount] = useState<number>(0);

  const [farmVersion, setFarmVersion] = useState<string>('');

  useEffect(() => {
    canFarmV2(poolId, withEnded).then(({ count, version, endedCount }) => {
      setFarmCount(count);
      setFarmVersion(version);
      setEndedFarmCount(endedCount);
    });
  }, [poolId]);

  return { farmCount, farmVersion, endedFarmCount };
};

export const useAllFarms = () => {
  const [v1Farm, setV1Farm] = useState<any>();
  const [v2Farm, setV2Farm] = useState<any>();

  const getAllFarms = async (version: 'v1' | 'v2') => {
    if (version === 'v1') {
      return await db.queryFarms();
    } else if (version === 'v2') {
      return await db.queryBoostFarms();
    }
  };

  useEffect(() => {
    getAllFarms('v1').then(setV1Farm);
    getAllFarms('v2').then(setV2Farm);
  }, []);

  return {
    v1Farm,
    v2Farm,
  };
};

export const useShadowRecord = (poolId) => {
  const setShadowRecords = useShadowRecordStore(
    (state) => state.setShadowRecords
  );
  const shadowRecords = useShadowRecordStore((state) => state.shadowRecords);

  useEffect(() => {
    get_shadow_records().then((res) => {
      setShadowRecords(res);
    });
  }, []);

  return { shadowRecords, poolShadowRecord: shadowRecords[poolId] };
};

export const useFarmerSeeds = () => {
  const setFarmerSeeds = useFarmerSeedsStore((state) => state.setFarmerSeeds);
  const farmerSeeds = useFarmerSeedsStore((state) => state.farmerSeeds);

  useEffect(() => {
    list_farmer_seeds().then((res) => {
      setFarmerSeeds(res);
    });
  }, []);

  return { farmerSeeds };
};

export const useSetStakeList = () => {
  const isSignedIn = wallet.isSignedIn();
  const setStakeListTogether = useStakeListStore(
    (state) => state.setStakeListTogether
  );

  useEffect(() => {
    if (isSignedIn) {
      getStakedListByAccountId({})
        .then(({ stakedList, finalStakeList, v2StakedList }) => {
          setStakeListTogether({
            stakeListV1: stakedList,
            stakeListV2: v2StakedList,
            stakeListAll: finalStakeList,
          });
        })
        .catch((e) => {});
    }
  }, [isSignedIn]);
};
