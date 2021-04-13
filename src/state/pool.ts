import { useEffect, useState } from 'react';
import {
  DEFAULT_PAGE_LIMIT,
  getPoolDetails,
  getPools,
  getSharesInPool,
  Pool,
  PoolDetails,
} from '../services/pool';

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
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [pools, setPools] = useState<Pool[]>();

  const nextPage = () => setPage((page) => page + 1);

  useEffect(() => {
    getPools(page).then((pools) => {
      setHasMore(pools.length === DEFAULT_PAGE_LIMIT);
      setPools((currentPools) =>
        pools.reduce<Pool[]>((acc: Pool[], pool) => {
          if (
            acc.some(
              (p) =>
                p.fee === pool.fee &&
                p.tokenIds.includes(pool.tokenIds[0]) &&
                p.tokenIds.includes(pool.tokenIds[1]) &&
                p.shareSupply === pool.shareSupply
            )
          )
            return acc;
          acc.push(pool);
          return acc;
        }, currentPools || [])
      );
    });
  }, [page]);

  return {
    pools,
    hasMore,
    nextPage,
  };
};
