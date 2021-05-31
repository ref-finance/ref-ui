import { useEffect, useState } from 'react';
import { calculateFairShare, percentLess, toPrecision } from '../utils/numbers';
import {
  DEFAULT_PAGE_LIMIT,
  getPoolDetails,
  getPools,
  getSharesInPool,
  Pool,
  PoolDetails,
  removeLiquidityFromPool,
} from '../services/pool';

import { useWhitelistTokens } from './token';
import { debounce } from 'lodash';

export const usePool = (id: number | string) => {
  const [pool, setPool] = useState<PoolDetails>();
  const [shares, setShares] = useState<string>();

  useEffect(() => {
    getPoolDetails(Number(id)).then(setPool);
    getSharesInPool(Number(id)).then(setShares);
  }, []);

  return { pool, shares };
};

export const usePools = (props: {
  tokenName?: string;
  sortBy?: string;
  order?: string;
  useIndexerData?: boolean;
}) => {
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [pools, setPools] = useState<Pool[]>([]);

  const tokens = useWhitelistTokens();
  const tokenIds = tokens?.map((t) => t.id);

  const nextPage = () => setPage((page) => page + 1);

  function _loadPools(accumulate = true) {
    getPools({
      page,
      tokenName: props.tokenName,
      column: props.sortBy,
      order: props.order,
      useIndexerData: props.useIndexerData,
    }).then((pools) => {
      setHasMore(pools.length === DEFAULT_PAGE_LIMIT);
      setPools((currentPools) =>
        pools.reduce<Pool[]>(
          (acc: Pool[], pool) => {
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
          },
          accumulate ? currentPools.slice() : []
        )
      );
    });
  }

  const loadPools = debounce(_loadPools, 500);

  useEffect(() => {
    loadPools(false);
  }, [props.tokenName]);

  useEffect(() => {
    loadPools(false);
  }, [props.sortBy, props.order]);

  useEffect(() => {
    loadPools();
  }, [page]);

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