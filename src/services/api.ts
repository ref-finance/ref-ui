import getConfig from './config';
import { wallet } from './near';
import { toPrecision } from '~utils/numbers';
import { BigNumber } from 'bignumber.js';
import moment from 'moment';

const config = getConfig();
const api_url = 'https://rest.nearapi.org/view';

export interface RefPrice {
  price: string;
}

export interface PoolRPCView {
  id: number;
  token_account_ids: string[];
  token_symbols: string[];
  amounts: string[];
  total_fee: number;
  shares_total_supply: string;
  tvl: number;
  token0_ref_price: string;
  share: string;
}

export const parsePoolView = (pool: any): PoolRPCView => ({
  id: Number(pool.id),
  token_account_ids: pool.token_account_ids,
  token_symbols: pool.token_symbols,
  amounts: pool.amounts,
  total_fee: pool.total_fee,
  shares_total_supply: pool.shares_total_supply,
  tvl: Number(toPrecision(pool.tvl, 2)),
  token0_ref_price: pool.token0_ref_price,
  share: pool.share,
});

export const getPoolBalance = async (pool_id: number) => {
  return await fetch(api_url, {
    method: 'POST',
    body: JSON.stringify({
      rpc_node: config.nodeUrl,
      contract: config.REF_FI_CONTRACT_ID,
      method: 'get_pool_shares',
      params: { account_id: wallet.getAccountId(), pool_id: pool_id },
    }),
    headers: { 'Content-type': 'application/json; charset=UTF-8' },
  })
    .then((res) => res.text())
    .then((balance) => {
      return new BigNumber(balance.toString()).toFixed();
    });
};

export const getPoolsBalances = async (pool_ids: number[]) => {
  return await Promise.all(
    pool_ids.map(async (pool_id) => await getPoolBalance(Number(pool_id)))
  );
};

export const getPools = async (counter: number) => {
  return await fetch(api_url, {
    method: 'POST',
    body: JSON.stringify({
      rpc_node: config.nodeUrl,
      contract: config.REF_FI_CONTRACT_ID,
      method: 'get_pools',
      params: { from_index: counter, limit: 300 },
    }),
    headers: { 'Content-type': 'application/json; charset=UTF-8' },
  })
    .then((res) => res.json())
    .then((pools) => {
      pools.forEach(async (pool: any, i: number) => {
        pool.id = i + counter;
        const pool_balance = await getPoolBalance(Number(pool.id) + counter);
        if (Number(pool_balance) > 0) {
          pools[i].share = pool_balance;
        }
      });
      return pools;
    });
};

export const getUserWalletTokens = async (): Promise<any> => {
  return await fetch(
    config.helperUrl + '/account/' + wallet.getAccountId() + '/likelyTokens',
    {
      method: 'GET',
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
    }
  )
    .then((res) => res.json())
    .then((tokens) => {
      return tokens;
    });
};

export const getCurrentUnixTime = async (): Promise<any> => {
  return await fetch(config.indexerUrl + '/timestamp', {
    method: 'GET',
    headers: { 'Content-type': 'application/json; charset=UTF-8' },
  })
    .then((res) => res.json())
    .then((ts) => {
      return ts.ts;
    })
    .catch(() => {
      return moment().unix();
    });
};

export const currentRefPrice = async (): Promise<any> => {
  return await fetch(
    config.indexerUrl + '/get-token-price?token_id=token.v2.ref-finance.near',
    {
      method: 'GET',
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
    }
  )
    .then((res) => res.json())
    .then((priceBody) => {
      return priceBody.price;
    })
    .catch(() => {
      return '-';
    });
};

export const currentTokensPrice = async (ids: string): Promise<any> => {
  return await fetch(
    config.indexerUrl + '/list-token-price-by-ids?ids=' + ids,
    {
      method: 'GET',
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
    }
  )
    .then((res) => res.json())
    .then((priceBody) => {
      return priceBody;
    })
    .catch(() => {
      return [];
    });
};
