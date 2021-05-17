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
      .then((err) => {
        resolve(err);
      });
  });
};

export const get_pool_balance = async (pool_id: number) => {
  return await request(config.REF_FI_CONTRACT_ID, 'get_pool_shares', {
    "account_id": wallet.getAccountId(),
    "pool_id": pool_id
  });
};

export const get_pools = async (counter: number) => {
  return await request(config.REF_FI_CONTRACT_ID, 'get_pools', {
    from_index: counter,
    limit: DEFAULT_PAGE_LIMIT
  }).then((pools) => {
    pools.forEach((pool: any, i: number) => {
      pool.id = i + counter;
    });
    Object.keys(pools).map((pool_id,index) => {
      const pool_balance = get_pool_balance(Number(pool_id) + counter).then((pool_balance) => {
        pools[index].shares = pool_balance
      })
    });
    return pools;
  });
};
