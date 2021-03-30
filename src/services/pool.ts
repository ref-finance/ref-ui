import { refFiViewFunction } from './near';

const DEFAULT_PAGE_LIMIT = 10;

export const getPools = (
  page: number = 1,
  perPage: number = DEFAULT_PAGE_LIMIT
) => {
  const index = (page - 1) * perPage;
  return refFiViewFunction({
    methodName: 'get_pools',
    args: { from_index: index, limit: perPage },
  });
};

interface GetPoolByTokens {
  tokenInId: string;
  tokenOutId: string;
}

export const getPoolByTokens = ({
  token1,
  token2,
  amountIn,
}: GetPoolByTokens) => {};
