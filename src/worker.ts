import { keyStores, Near } from 'near-api-js';
import db, { FarmDexie } from './store/RefDatabase';
import getConfig from './services/config';
import { TokenMetadata } from '~services/ft-contract';
import { Farm } from '~services/farm';
import { PoolRPCView } from '~services/api';

const config = getConfig();

const MAX_PER_PAGE = 100;

const near = new Near({
  keyStore: new keyStores.InMemoryKeyStore(),
  headers: {},
  ...config,
});

const view = ({
  methodName,
  args = {},
}: {
  methodName: string;
  args?: object;
}) => {
  return near.connection.provider
    .query({
      request_type: 'call_function',
      finality: 'final',
      account_id: config.REF_FI_CONTRACT_ID,
      method_name: methodName,
      args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
    })
    .then(({ result }) => JSON.parse(Buffer.from(result).toString()));
};

const farmView = ({
  methodName,
  args = {},
}: {
  methodName: string;
  args?: object;
}) => {
  return near.connection.provider
    .query({
      request_type: 'call_function',
      finality: 'final',
      account_id: config.REF_FARM_CONTRACT_ID,
      method_name: methodName,
      args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
    })
    .then(({ result }) => JSON.parse(Buffer.from(result).toString()));
};

const getTotalPools = () => {
  return view({ methodName: 'get_number_of_pools' });
};

const getPools = (page: number) => {
  const index = (page - 1) * MAX_PER_PAGE;

  return view({
    methodName: 'get_pools',
    args: { from_index: index, limit: MAX_PER_PAGE },
  });
};

const getTokens = async () => {
  return await fetch(config.indexerUrl + '/list-token', {
    method: 'GET',
    headers: { 'Content-type': 'application/json; charset=UTF-8' },
  })
    .then((res) => res.json())
    .then((tokens) => {
      return tokens;
    });
};

const getFarms = (page: number) => {
  const MAX_PER_PAGE = 150;
  const index = (page - 1) * MAX_PER_PAGE;

  return farmView({
    methodName: 'list_farms',
    args: { from_index: index, limit: MAX_PER_PAGE },
  });
};

export const isNotStablePool = (pool: PoolRPCView) => {
  return pool.amounts.length < 3;
};

const cachePools = async () => {
  const totalPools = await getTotalPools();
  const pages = Math.ceil(totalPools / MAX_PER_PAGE);
  for (let page = 1; page <= pages; page++) {
    const pools = await getPools(page);
    const filtered_pools = pools.filter(isNotStablePool);
    await db.pools.bulkPut(
      filtered_pools.map(
        (
          pool: {
            token_account_ids: any[];
            amounts: any[];
            total_fee: any;
            shares_total_supply: any;
          },
          i: number
        ) => ({
          id: (page - 1) * MAX_PER_PAGE + i,
          token1Id: pool.token_account_ids[0],
          token2Id: pool.token_account_ids[1],
          token1Supply: pool.amounts[0],
          token2Supply: pool.amounts[1],
          fee: pool.total_fee,
          shares: pool.shares_total_supply,
        })
      )
    );
  }
};

const cacheTokens = async () => {
  const tokens = await getTokens();
  const tokenArr = Object.keys(tokens).map((key) => ({
    id: key,
    icon: tokens[key].icon,
    decimals: tokens[key].decimals,
    name: tokens[key].name,
    symbol: tokens[key].symbol,
  }));
  await db.tokens.bulkPut(
    tokenArr.map((token: TokenMetadata) => ({
      id: token.id,
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
      icon: token.icon,
    }))
  );
};

const cacheFarmPools = async () => {
  const farms: Farm[] = await getFarms(1);
  const farmsArr = Object.keys(farms).map((key) => ({
    id: key,
    pool_id: farms[Number(key)].farm_id.slice(
      farms[Number(key)].farm_id.indexOf('@') + 1,
      farms[Number(key)].farm_id.lastIndexOf('#')
    ),
    status: farms[Number(key)].farm_status,
  }));
  await db.farms.bulkPut(
    farmsArr.map((farm: FarmDexie) => ({
      id: farm.id,
      pool_id: farm.pool_id,
      status: farm.status,
    }))
  );
};

run();

async function run() {
  // cachePools();
  cacheTokens();
  cacheFarmPools();
}
