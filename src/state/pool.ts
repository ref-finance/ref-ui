import { useEffect, useState } from 'react';
import { getPoolDetails, getPools, getSharesInPool, Pool, PoolDetails } from '~services/pool';

export const usePool = (id: number | string) => {
  const [pool, setPool] = useState<PoolDetails>();
  const [shares, setShares] = useState<string>();

  useEffect(() => {
    getPoolDetails(Number(id)).then(setPool);
    getSharesInPool(Number(id)).then(setShares);
  }, []);

  return { pool, shares };
};

export const usePools = () => {
  const [pools, setPools] = useState<Pool[]>();

  useEffect(() => {
    getPools().then(setPools);
  }, []);

  return pools;
}