import { keyStores, Near } from 'near-api-js';
import db, { FarmDexie } from './store/RefDatabase';
import getConfig from './services/config';
import { TokenMetadata } from '~services/ft-contract';
import { Farm, Seed, FarmBoost } from '~services/farm';
import { PoolRPCView } from '~services/api';
import { STABLE_POOL_ID, STABLE_POOL_USN_ID } from './services/near';

const config = getConfig();

const MAX_PER_PAGE = 100;

const near = new Near({
  keyStore: new keyStores.InMemoryKeyStore(),
  headers: {},
  ...config,
});

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
const boostFarmView = ({
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
      account_id: config.REF_FARM_BOOST_CONTRACT_ID,
      method_name: methodName,
      args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
    })
    .then(({ result }) => JSON.parse(Buffer.from(result).toString()));
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
const get_list_seeds_info = async () => {
  return boostFarmView({
    methodName: 'list_seeds_info',
  });
};
const get_list_seed_farms = async (seed_id: string) => {
  return boostFarmView({
    methodName: 'list_seed_farms',
    args: { seed_id },
  });
};
const getBoostFarms = async () => {
  // get all seeds
  const list_seeds = await get_list_seeds_info();
  const promiseList: Promise<any>[] = [];
  list_seeds.forEach((seed: Seed) => {
    const { seed_id } = seed;
    promiseList.push(get_list_seed_farms(seed_id));
  });
  // get all farms
  const list_farm: FarmBoost[][] = await Promise.all(promiseList);
  return list_farm;
};
const cacheBoostFarmPools = async () => {
  const cacheData: FarmDexie[] = [];
  let all: FarmBoost[] = [];
  const allBoostFarms = await getBoostFarms();
  allBoostFarms.forEach((arr: FarmBoost[]) => {
    all = all.concat(arr);
  });
  all.forEach((farm: FarmBoost, index: number) => {
    const farm_id = farm.farm_id;
    cacheData.push({
      id: index.toString(),
      pool_id: farm_id.slice(
        farm_id.indexOf('@') + 1,
        farm_id.lastIndexOf('#')
      ),
      status: farm.status,
    });
  });
  await db.boostFarms.bulkPut(cacheData);
};

run();

async function run() {
  // cachePools();
  cacheTokens();
  cacheFarmPools();
  cacheBoostFarmPools();
}
