import { useEffect, useState } from 'react';
import { get_shadow_records, list_farmer_seeds } from 'src/services/farm';
import { isStablePool, NEARX_POOL_ID } from 'src/services/near';
import { getStablePoolDecimal } from 'src/pages/stable/StableSwapEntry';
import {
  scientificNotationToString,
  toReadableNumber,
} from 'src/utils/numbers';
import { BigNumber } from 'bignumber.js';
import getConfigV2 from 'src/services/configV2';
import {
  useFarmerSeedsStore,
  useShadowRecordStore,
  useStakeListStore,
} from 'src/stores/liquidityStores';
import { useFarmStake } from 'src/state/farm';
const configV2 = getConfigV2();

export type INewPool = any;

// todo: get rid of shares dep
export const useNewPoolData = ({ pool, shares }) => {
  const shadowRecords = useShadowRecordStore((state) => state.shadowRecords);
  const farmerSeeds = useFarmerSeedsStore((state) => state.farmerSeeds);
  const [newPool, setNewPool] = useState<INewPool>();
  const isShadowPool = configV2.SUPPORT_SHADOW_POOL_IDS.includes(
    pool.id?.toString()
  );

  useEffect(() => {
    updatePool();
  }, [pool]);

  // todo: pool mutated key and value update here
  const updatePool = () => {
    const pool2 = JSON.parse(JSON.stringify(pool));
    const poolSeed = farmerSeeds?.[pool2.id];
    pool2.raw = {
      farmerSeeds: poolSeed,
    };
    pool2.farmShare = poolSeed
      ? new BigNumber(poolSeed.free_amount)
          .plus(poolSeed.shadow_amount)
          .toFixed()
      : shares;

    const { availableShare, availableShareNonDivisible } =
      getPoolAvailableShare({
        pool: pool2,
        shadowRecords,
        shares,
      });
    pool2.availableShare = availableShare;
    pool2.availableShareNonDivisible = availableShareNonDivisible;
    setNewPool(pool2);
  };

  return { shadowRecords, farmerSeeds, newPool };
};

export const getPoolAvailableShare = ({ pool, shadowRecords, shares }) => {
  const decimal = isStablePool(pool.id) ? getStablePoolDecimal(pool.id) : 24;
  const sharesToken = toReadableNumber(
    decimal,
    scientificNotationToString(shares)
  );
  const isShadowPool = configV2.SUPPORT_SHADOW_POOL_IDS.includes(
    pool.id?.toString()
  );
  let availableShare = '';
  let availableShareNonDivisible = '';

  if (isShadowPool) {
    const { shadow_in_farm, shadow_in_burrow } =
      shadowRecords?.[Number(pool.id)] || {};
    const highestUsed = BigNumber.maximum((shadow_in_farm||0), (shadow_in_burrow||0));

    availableShareNonDivisible = new BigNumber(shares)
      .minus(highestUsed)
      .toFixed();
    availableShare = toReadableNumber(
      decimal,
      scientificNotationToString(availableShareNonDivisible)
    );
  } else {
    availableShare = sharesToken;
    availableShareNonDivisible = shares;
  }

  return { availableShare, availableShareNonDivisible };
};

export const useFarmStakeAmount = ({ poolId, farmVersion = 'v2' }) => {
  const v2StakeList = useStakeListStore((state) => state.stakeListV2);
  const stakeList = useStakeListStore((state) => state.stakeListV1);
  if (!v2StakeList) {
    console.error(`${poolId} without v2StakeL`);
    return null;
  }

  const isShadowPool = configV2.SUPPORT_SHADOW_POOL_IDS.includes(
    poolId?.toString()
  );

  const farmStakeV1 = stakeList && useFarmStake({ poolId, stakeList });
  const farmStakeV2 =
    v2StakeList && useFarmStake({ poolId, stakeList: v2StakeList });
  const shadowRecords = useShadowRecordStore((state) => state.shadowRecords);
  const farmerSeeds = useFarmerSeedsStore((state) => state.farmerSeeds);
  const poolSeed = farmerSeeds[poolId];

  const { shadow_in_farm } = shadowRecords?.[Number(poolId)] || {};

  let farmStakeAmount: string | number = 0;
  if (isShadowPool) {
    farmStakeAmount = poolSeed
      ? new BigNumber(poolSeed.free_amount)
          .plus(poolSeed.shadow_amount)
          .toFixed()
      : shadow_in_farm || '0';
  } else {
    switch (farmVersion) {
      case 'v1':
        farmStakeAmount = farmStakeV1;
        break;
      case 'v2':
        farmStakeAmount = farmStakeV2 || '0';
        break;
    }
  }

  return farmStakeAmount;
};
