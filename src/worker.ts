import { keyStores, Near } from 'near-api-js';
import db, { FarmDexie, TokenPrice } from './store/RefDatabase';
import { TokenMetadata } from 'src/services/ft-contract';
import { Farm, Seed, FarmBoost } from 'src/services/farm';
import { PoolRPCView } from 'src/services/api';
import { BigNumber } from 'bignumber.js';
import { PoolInfo } from './services/swapV3';
import { getAuthenticationHeaders } from './services/signature';

let config: any = {};
onmessage = (event) => {
  if (event?.data?.config) {
    config = event?.data?.config;
    runWorker();
  }
};

const runWorker = () => {
  const {
    REF_TOKEN_ID,
    XREF_TOKEN_ID,
    REF_FARM_BOOST_CONTRACT_ID,
    REF_UNI_V3_SWAP_CONTRACT_ID,
    DCL_POOL_BLACK_LIST,
    REF_FI_CONTRACT_ID,
  } = config;

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
  const getTokens = async () => {
    return await fetch(config.indexerUrl + '/list-token', {
      method: 'GET',
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
        ...getAuthenticationHeaders('/list-token'),
      },
    })
      .then((res) => res.json())
      .then((tokens) => {
        return tokens;
      });
  };

  const getFarms = (page: number) => {
    const MAX_PER_PAGE = 300;
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
  /***boost start***/
  const contractView = ({
    methodName,
    args = {},
    contract,
  }: {
    methodName: string;
    args?: object;
    contract: string;
  }) => {
    return near.connection.provider
      .query({
        request_type: 'call_function',
        finality: 'final',
        account_id: contract,
        method_name: methodName,
        args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
      })
      .then(({ result }: any) => JSON.parse(Buffer.from(result).toString()));
  };
  const get_list_seeds_info = async () => {
    return contractView({
      methodName: 'list_seeds_info',
      contract: REF_FARM_BOOST_CONTRACT_ID,
    });
  };

  const listPools = async () => {
    const res = await contractView({
      methodName: 'list_pools',
      contract: REF_UNI_V3_SWAP_CONTRACT_ID,
    });

    return res.filter((p: any) => !DCL_POOL_BLACK_LIST.includes(p.pool_id));
  };

  const getPrice = async () => {
    return contractView({
      methodName: 'get_virtual_price',
      contract: XREF_TOKEN_ID,
    }).catch(() => {
      return '0';
    });
  };
  const get_list_seed_farms = async (seed_id: string) => {
    return contractView({
      methodName: 'list_seed_farms',
      args: { seed_id },
      contract: REF_FARM_BOOST_CONTRACT_ID,
    });
  };
  const getPoolsByIds = async (pool_ids: string[]): Promise<PoolRPCView[]> => {
    const ids = pool_ids.join('|');
    if (!ids) return [];
    return fetch(config.indexerUrl + '/list-pools-by-ids?ids=' + ids, {
      method: 'GET',
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
        ...getAuthenticationHeaders('/list-pools-by-ids'),
      },
    })
      .then((res) => res.json())
      .then((pools) => {
        return pools;
      })
      .catch(() => {
        return [];
      });
  };
  const toReadableNumber = (decimals: number, number: string = '0'): string => {
    if (!decimals) return number;

    const wholeStr = number.substring(0, number.length - decimals) || '0';
    const fractionStr = number
      .substring(number.length - decimals)
      .padStart(decimals, '0')
      .substring(0, decimals);

    return `${wholeStr}.${fractionStr}`.replace(/\.?0+$/, '');
  };
  async function getXrefPrice(tokenPriceList: Record<string, any>) {
    const xrefPrice = await getPrice();
    const xrefToRefRate = toReadableNumber(8, xrefPrice);
    const keyList: any = Object.keys(tokenPriceList);
    for (let i = 0; i < keyList.length; i++) {
      const tokenPrice = tokenPriceList[keyList[i]];
      if (keyList[i] == REF_TOKEN_ID) {
        const price = new BigNumber(xrefToRefRate)
          .multipliedBy(tokenPrice.price || 0)
          .toFixed();
        tokenPriceList[XREF_TOKEN_ID] = {
          price,
          symbol: 'xREF',
          decimal: tokenPrice.decimal,
        };
        break;
      }
    }
    return tokenPriceList;
  }
  const cacheBoost_Seed_Farms_Pools = async () => {
    // get all seeds
    let list_seeds = await get_list_seeds_info();
    // not the classic and dcl seeds would be filtered
    list_seeds = list_seeds.filter((seed: Seed) => {
      const contract_id = seed.seed_id.split('@')?.[0];
      return (
        contract_id == REF_UNI_V3_SWAP_CONTRACT_ID ||
        contract_id == REF_FI_CONTRACT_ID
      );
    });
    // get all farms
    const farmsPromiseList: Promise<any>[] = [];
    // get all dcl pools
    const dcl_all_pools: PoolInfo[] = await listPools();
    const poolIds = new Set<string>();
    const dcl_poolIds = new Set<string>();
    let pools: any[] = [];
    list_seeds.forEach((seed: Seed) => {
      const { seed_id } = seed;
      // seed type: [commonSeed, loveSeed, dclSeed]
      const [contractId, tempPoolId] = seed_id.split('@');
      if (tempPoolId && contractId !== REF_UNI_V3_SWAP_CONTRACT_ID) {
        poolIds.add(tempPoolId);
      } else if (tempPoolId && contractId == REF_UNI_V3_SWAP_CONTRACT_ID) {
        const [fixRange, dcl_pool_id, left_point, right_point] =
          tempPoolId.split('&');
        dcl_poolIds.add(dcl_pool_id);
      }
      farmsPromiseList.push(get_list_seed_farms(seed_id));
    });
    const list_farms: FarmBoost[][] = await Promise.all(farmsPromiseList);
    let cacheFarms: FarmBoost[] = [];
    list_farms.forEach((arr: FarmBoost[]) => {
      cacheFarms = cacheFarms.concat(arr);
    });
    pools = await getPoolsByIds(Array.from(poolIds));
    // cache farms
    const cacheFarmsData: FarmDexie[] = [];
    cacheFarms.forEach((farm: FarmBoost, index: number) => {
      const farm_id = farm.farm_id;
      cacheFarmsData.push({
        id: index.toString(),
        pool_id: farm_id.slice(
          farm_id.indexOf('@') + 1,
          farm_id.lastIndexOf('#')
        ),
        status: farm.status,
      });
    });
    db.boostFarms.bulkPut(cacheFarmsData);
    // cache seeds farms pools
    const cacheSeedsFarmsPools: any[] = [];
    list_seeds.forEach((seed: Seed, index: number) => {
      let pool: any = null;
      const [contractId, tempPoolId] = seed.seed_id.split('@');
      if (tempPoolId) {
        if (contractId == REF_UNI_V3_SWAP_CONTRACT_ID) {
          const [fixRange, dcl_pool_id, left_point, right_point] =
            tempPoolId.split('&');
          pool = dcl_all_pools.find((p: PoolInfo) => {
            if (p.pool_id == dcl_pool_id) return true;
          });
        } else {
          const id = tempPoolId;
          pool = pools.find((p: any) => {
            if (+p.id == +id) return true;
          });
        }
      }
      cacheSeedsFarmsPools.push({
        id: seed.seed_id,
        seed,
        farmList: list_farms[index],
        pool,
      });
    });
    db.cacheBoostSeeds(cacheSeedsFarmsPools);
  };
  const cacheTokenPrices = async (): Promise<any> => {
    const res = await fetch(config.indexerUrl + '/list-token-price', {
      method: 'GET',
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
        ...getAuthenticationHeaders('/list-token-price'),
      },
    });
    const tokenPriceList = await res.json();
    db.cacheTokenPrices(tokenPriceList);
  };

  cacheTokens();
  cacheFarmPools();
  cacheBoost_Seed_Farms_Pools();
  cacheTokenPrices();
};
