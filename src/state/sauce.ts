import React, { useState, useEffect, useContext } from 'react';
import { Pool, getStablePoolFromCache, parsePool } from '../services/pool';
import { usePool } from './pool';
import { useCanFarm, useFarmStake } from './farm';
import BigNumber from 'bignumber.js';
import { TokenMetadata, ftGetTokenMetadata } from '../services/ft-contract';

import { ALL_STABLE_POOL_IDS, NEARX_POOL_ID } from '../services/near';
import { getPoolsByIds, getPool } from '../services/indexer';
import { ftGetTokensMetadata } from '../services/ft-contract';

export interface PoolData {
  pool: Pool;
  shares: string;
  farmStake: string | number;
  farmCount: Number;
  userTotalShare: BigNumber;
  tokens: TokenMetadata[];
  poolTVL: number;
}

export const useStabelPoolData = (pool_id: string | number) => {
  const [pool, setPool] = useState<Pool>();
  const { shares, finalStakeList } = usePool(pool_id);
  const { farmCount, farmVersion } = useCanFarm(Number(pool_id));
  const farmStake = useFarmStake({
    poolId: Number(pool_id),
    stakeList: finalStakeList,
  });

  const [tokens, setTokens] = useState<TokenMetadata[]>();

  const [poolData, setPoolData] = useState<PoolData>();

  const userTotalShare = BigNumber.sum(shares, farmStake);

  const [poolTVL, setPoolTVL] = useState<number>();

  useEffect(() => {
    if (!pool) return;
    getPool(pool.id.toString()).then((res) => {
      setPoolTVL(res.tvl);
    });
  }, [pool]);

  useEffect(() => {
    getStablePoolFromCache(pool_id.toString()).then((res) => {
      setPool(res[0]);
    });
  }, []);

  useEffect(() => {
    if (!pool) return;
    Promise.all(pool.tokenIds.map((id) => ftGetTokenMetadata(id))).then(
      (res) => {
        setTokens(res);
      }
    );
  }, [pool]);

  useEffect(() => {
    if (!pool || !tokens) return;
    setPoolData({
      pool,
      shares,
      farmCount,
      farmStake,
      userTotalShare,
      tokens,
      poolTVL,
    });
  }, [pool, tokens, shares, farmStake, poolTVL]);

  return { poolData };
};

export const useAllStablePoolData = () => {
  const allData = ALL_STABLE_POOL_IDS.filter((id) => id !== NEARX_POOL_ID).map(
    (id) => useStabelPoolData(id)
  );

  return allData?.map((d) => d.poolData);
};

export const useAllStablePools = () => {
  const ids = ALL_STABLE_POOL_IDS.filter((id) => id !== NEARX_POOL_ID);
  const [stablePools, setStablePools] = useState<Pool[]>([]);
  useEffect(() => {
    getPoolsByIds({ pool_ids: ids })
      .then((res) => {
        const resPools = res.map((pool) => parsePool(pool));
        return resPools;
      })
      .then((resPools) => {
        return Promise.all(
          resPools.map(async (p) => {
            return {
              ...p,
              metas: await ftGetTokensMetadata(p.tokenIds),
            };
          })
        );
      })
      .then((res) => {
        setStablePools(res);
      });
  }, []);
  return stablePools;
};
