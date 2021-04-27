import { useEffect, useState } from 'react';
import { calculateFairShare, percentLess, toPrecision } from '../utils/numbers';
import {
  getPoolDetails,
  getPools,
  getSharesInPool,
  Pool,
  PoolDetails,
  removeLiquidityFromPool,
} from '../services/pool';
import { useWhitelistTokens } from './token';

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

  const tokens = useWhitelistTokens();
  const tokenIds = tokens?.map((t) => t.id);

  const nextPage = () => setPage((page) => page + 1);

  useEffect(() => {
    getPools(page).then((pools) => {
      setHasMore(pools.length > 0);
      setPools((currentPools) =>
        pools
          .reduce<Pool[]>((acc: Pool[], pool) => {
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
          .filter(
            (pool) =>
              tokenIds?.includes(pool.tokenIds[0]) &&
              tokenIds?.includes(pool.tokenIds[1])
          )
      );
    });
  }, [page, tokens]);

  return {
    pools,
    hasMore,
    nextPage,
  };
};

export const useRemoveLiquidity = ({
  pool,
  shares,
  slippageTolerance,
}: {
  pool: Pool;
  shares: string;
  slippageTolerance: number;
}) => {
  console.log(shares);
  const minimumAmounts = Object.entries(pool.supplies).reduce<{
    [tokenId: string]: string;
  }>((acc, [tokenId, totalSupply]) => {
    acc[tokenId] = toPrecision(
      percentLess(
        slippageTolerance,
        calculateFairShare({
          shareOf: totalSupply,
          contribution: shares,
          totalContribution: pool.shareSupply,
        })
      ),
      0
    );
    return acc;
  }, {});

  const removeLiquidity = () => {
    return removeLiquidityFromPool({
      id: pool.id,
      shares,
      minimumAmounts,
    });
  };

  return {
    removeLiquidity,
    minimumAmounts,
  };
};
