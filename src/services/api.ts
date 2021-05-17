import getConfig from './config';
import { wallet } from './near';
import { DEFAULT_PAGE_LIMIT } from './pool';

const config = getConfig();
const api_url = 'https://rest.nearapi.org/view';

const request = (
  contract_id: string,
  methodName: string,
  params: Object,
  method?: string
) => {
  const fetchOptions = {
    method: method || 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({
      rpc_node: config.nodeUrl,
      contract: contract_id,
      method: methodName,
      params: params,
    }),
  };
  return new Promise((resolve, reject) => {
    fetch(api_url, fetchOptions)
      .then((response) => response.json())
      .then((result) => {
        resolve(result);
      });
  });
};

export const get_pool_balance = async (pool_id: number, tokens: any[]) => {
  return await request(config.REF_FI_CONTRACT_ID, 'get_pools_shares', {
    account_id: wallet.getAccountId(),
    pool_id: pool_id,
  }).then((balance) => {
    return balance;
  });
};

export const get_pools = async (counter: number) => {
  return await fetch(api_url, {
    method: 'POST',
    body: JSON.stringify({
      rpc_node: config.nodeUrl,
      contract: config.REF_FI_CONTRACT_ID,
      method: 'get_pools',
      params: { from_index: counter, limit: DEFAULT_PAGE_LIMIT },
    }),
    headers: { 'Content-type': 'application/json; charset=UTF-8' },
  })
    .then((res) => res.json())
    .then((pools) => {
      pools.forEach((pool: any, i: number) => {
        pool.id = i + counter;
      });

      let promises = [];
      Object.keys(pools).map((pool_id) => {
        promises.push(
          Promise.resolve(
            get_pool_balance(
              Number(pool_id) + counter,
              pools[pool_id].token_account_ids
            )
          )
        );
      });
      return pools;
    });
};
