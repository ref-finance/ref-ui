import Big from 'big.js';
import {
  toNonDivisibleNumber,
  scientificNotationToString,
} from '../utils/numbers';
import { TokenMetadata, ftGetTokenMetadata } from './ft-contract';
import {
  getRefPoolsByToken1ORToken2,
  getAllStablePoolsFromCache,
} from './pool';
export interface IEstimateSwapServerView {
  amount_in: string;
  amount_out: string;
  contract_in: string;
  contract_out: string;
  routes: IServerRoute[];
  contract?: string;
}
export interface IServerRoute {
  amount_in: string;
  min_amount_out: string;
  pools: IServerPool[];
  tokens?: TokenMetadata[];
}
export interface IServerPool {
  amount_in: string;
  min_amount_out: string;
  pool_id: string | number;
  token_in: string;
  token_out: string;
}

export const estimateSwapFromServer = async ({
  tokenIn,
  tokenOut,
  amountIn,
  slippage,
  supportLedger,
}) => {
  const env = process.env.REACT_APP_NEAR_ENV;
  const domain =
    env === 'pub-testnet'
      ? 'smartroutertest.refburrow.top'
      : 'smartrouter.refburrow.top';
  const resultFromServer = await fetch(
    `https://${domain}/findPath?amountIn=${amountIn}&tokenIn=${
      tokenIn.id
    }&tokenOut=${tokenOut.id}&pathDeep=${
      supportLedger ? 1 : 3
    }&slippage=${slippage}`
  ).then((res) => res.json());
  return resultFromServer;
};

export async function getAvgFeeFromServer({
  estimatesFromServer,
  setAvgFee,
  tokenInAmount,
  tokenIn,
}: {
  tokenInAmount: string;
  tokenIn: TokenMetadata;
  estimatesFromServer: IEstimateSwapServerView;
  setAvgFee: (fee: number) => void;
}) {
  let avgFee: number = 0;
  const { routes } = estimatesFromServer;
  const poolsMap = await getUsedPools(routes);
  routes.forEach((route) => {
    const { amount_in, pools } = route;
    const allocation = new Big(amount_in).div(
      new Big(toNonDivisibleNumber(tokenIn.decimals, tokenInAmount))
    );
    const routeFee = pools.reduce((acc, cur) => {
      return acc.plus(poolsMap[cur.pool_id]?.fee || 0);
    }, new Big(0));
    avgFee += allocation.mul(routeFee).toNumber();
  });
  setAvgFee(avgFee);
}
async function getUsedPools(routes: IServerRoute[]) {
  const { topPools, stablePools } = await getAllPools();
  const pools = {};
  routes.forEach((route) => {
    route.pools.forEach((cur) => {
      let p;
      p = topPools.find((p) => +p.id === +cur.pool_id);
      if (!p) {
        p = stablePools.find((p) => +p.id === +cur.pool_id);
      }
      if (p) {
        pools[p.id] = p;
      }
    });
  });
  return pools;
}
export async function getTokensOfRoute(route: IServerRoute) {
  const tokenIds = route.pools.reduce((acc, cur, index) => {
    if (index == 0) {
      acc.push(cur.token_in, cur.token_out);
    } else {
      acc.push(cur.token_out);
    }
    return acc;
  }, []);
  const pending = tokenIds.map((tokenId) => ftGetTokenMetadata(tokenId));
  const tokens = await Promise.all(pending);
  return tokens;
}
export async function getAllPools() {
  const pools = await getRefPoolsByToken1ORToken2();
  const { allStablePools } = await getAllStablePoolsFromCache();
  return {
    topPools: pools,
    stablePools: allStablePools,
  };
}
export function getPriceImpactFromServer({
  estimatesFromServer,
  tokenIn,
  tokenOut,
  tokenInAmount,
  tokenOutAmount,
  tokenPriceList,
  setPriceImpactValue,
}: {
  estimatesFromServer: IEstimateSwapServerView;
  tokenInAmount: string;
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  tokenOutAmount: string;
  tokenPriceList: any;
  setPriceImpactValue: (impact: string) => void;
}) {
  try {
    const newPrice = new Big(tokenInAmount || '0').div(
      new Big(tokenOutAmount || '1')
    );
    const { routes } = estimatesFromServer;
    const priceImpactForRoutes = routes.map(() => {
      let oldPrice: Big;

      const priceIn = tokenPriceList[tokenIn.id]?.price;
      const priceOut = tokenPriceList[tokenOut.id]?.price;

      if (!!priceIn && !!priceOut) {
        oldPrice = new Big(priceOut).div(new Big(priceIn));

        return newPrice.lt(oldPrice)
          ? '0'
          : newPrice.minus(oldPrice).div(newPrice).times(100).abs().toFixed();
      }
      return '0';
    });
    const rawRes = priceImpactForRoutes.reduce(
      (pre, cur, i) => {
        return pre.plus(
          new Big(routes[i].amount_in)
            .div(new Big(toNonDivisibleNumber(tokenIn.decimals, tokenInAmount)))
            .mul(cur)
        );
      },

      new Big(0)
    );

    return setPriceImpactValue(scientificNotationToString(rawRes.toString()));
  } catch (error) {
    return setPriceImpactValue('0');
  }
}
