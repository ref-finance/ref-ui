import React, { useState, useEffect, useContext } from 'react';
import { Pool, getStablePoolFromCache } from '../services/pool';
import { usePool } from './pool';
import { useCanFarm, useFarmStake } from './farm';
import BigNumber from 'bignumber.js';
import { formatePoolData } from '../pages/stable/StableSwapEntry';
import { TokenMetadata, ftGetTokenMetadata } from '../services/ft-contract';

import { getPool } from '~services/indexer';

export interface PoolData {
  pool: Pool;
  shares: string;
  farmStake: string | number;
  farmCount: Number;
  userTotalShare: BigNumber;
  stakeList: Record<string, string>;
  tokens: TokenMetadata[];
  poolTVL: number;
}

export const useStabelPoolData = (pool_id: string | number) => {
  const [pool, setPool] = useState<Pool>();
  const { shares, stakeList } = usePool(pool_id);
  const farmCount = useCanFarm(Number(pool_id));
  const farmStake = useFarmStake({
    poolId: Number(pool_id),
    stakeList,
  });

  const [tokens, setTokens] = useState<TokenMetadata[]>();

  const [poolData, setPoolData] = useState<PoolData>();

  const userTotalShare = BigNumber.sum(shares, farmStake);

  const [poolTVL, setPoolTVL] = useState<number>(0);

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
      stakeList,
      tokens,
      poolTVL,
    });
  }, [pool, tokens, shares, stakeList, farmStake, poolTVL]);

  return { poolData };
};
