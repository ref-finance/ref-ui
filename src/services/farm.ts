import {
  refFarmFunctionCall,
  refFarmViewFunction,
  wallet,
  Transaction,
  executeFarmMultipleTransactions,
  refFarmBoostViewFunction,
  REF_FARM_BOOST_CONTRACT_ID,
  ONE_YOCTO_NEAR,
  REF_FI_CONTRACT_ID,
  near,
  refVeViewFunction,
  REF_FARM_CONTRACT_ID,
  refFarmBoostFunctionCall,
} from './near';
import {
  toPrecision,
  toReadableNumber,
  toNonDivisibleNumber,
} from '../utils/numbers';
import {
  LP_TOKEN_DECIMALS,
  LP_STABLE_TOKEN_DECIMALS,
  checkTokenNeedsStorageDeposit,
  FARM_STORAGE_BALANCE,
} from '../services/m-token';
import * as math from 'mathjs';
import {
  ftGetTokenMetadata,
  TokenMetadata,
  ftGetStorageBalance,
} from '../services/ft-contract';
import { PoolRPCView, currentTokensPrice } from '../services/api';
import { BigNumber } from 'bignumber.js';
import { getPoolsByIds, getTokenPriceList } from '../services/indexer';
import {
  storageDepositAction,
  STORAGE_TO_REGISTER_WITH_MFT,
} from '../services/creators/storage';
import getConfig from './config';
import {
  getCurrentWallet,
  SENDER_WALLET_SIGNEDIN_STATE_KEY,
  WalletContext,
} from '../utils/wallets-integration';

import { currentStorageBalanceOfFarm_boost } from '../services/account';
import { WRAP_NEAR_CONTRACT_ID, nearMetadata } from '../services/wrap-near';
import { utils } from 'near-api-js';
import { scientificNotationToString } from '../utils/numbers';
import Big from 'big.js';
import { nearWithdrawTransaction } from './wrap-near';
import { currentStorageBalanceOfVE } from './account';
import db, { TokenPrice, BoostSeeds, FarmDexie } from '../store/RefDatabase';
import { getMftTokenId } from '../utils/token';
import { useEffect, useContext, useState } from 'react';
import { getPoolIdBySeedId } from '../components/farm/FarmsHome';

const config = getConfig();
const { REF_VE_CONTRACT_ID } = config;
export const DEFAULT_PAGE_LIMIT = 300;
const STABLE_POOL_ID = getConfig().STABLE_POOL_ID;
const STABLE_POOL_IDS = getConfig().STABLE_POOL_IDS;
const STABLE_POOL_USN_ID = getConfig().STABLE_POOL_USN_ID;
const expand = 6;
export interface Farm {
  farm_id: string;
  farm_kind: string;
  farm_status: string;
  seed_id: string;
  reward_token: string;
  start_at: number;
  reward_per_session: number;
  session_interval: number;
  total_reward: number;
  cur_round: number;
  last_round: number;
  claimed_reward: number;
  unclaimed_reward: number;
  current_user_reward: number;
}

export interface FarmInfo extends Farm {
  pool: PoolRPCView;
  lpTokenId: string;
  rewardNumber: string;
  userStaked: string;
  rewardsPerWeek: string;
  userRewardsPerWeek: string;
  userUnclaimedReward: string;
  rewardToken: TokenMetadata;
  totalStaked: number;
  apr: string;
  tokenIds: string[];
  show?: boolean;
  seedAmount: string;
}

export const getSeeds = async ({
  page = 1,
  perPage = DEFAULT_PAGE_LIMIT,
}: {
  page?: number;
  perPage?: number;
}): Promise<Record<string, string>> => {
  const index = (page - 1) * perPage;
  const seedDatas = await refFarmViewFunction({
    methodName: 'list_seeds',
    args: { from_index: index, limit: perPage },
  });

  return seedDatas;
};

export const getStakedListByAccountId = async ({
  accountId = getCurrentWallet()?.wallet?.getAccountId(),
}) => {
  const [stakedList, v2StakedList] = await Promise.all([
    refFarmViewFunction({
      methodName: 'list_user_seeds',
      args: { account_id: accountId },
    }),
    list_farmer_seeds().then((res) => {
      Object.keys(res).forEach((seed) => {
        res[seed] = scientificNotationToString(
          new Big(res[seed]?.free_amount || 0)
            .plus(new Big(res[seed]?.locked_amount || 0))
            .toString()
        );
      });

      return res;
    }),
  ]);

  const finalStakeSeedList = new Array(
    ...new Set(Object.keys(stakedList).concat(Object.keys(v2StakedList)))
  );

  const finalStakeList = {};
  finalStakeSeedList.forEach((seed) => {
    finalStakeList[seed] = scientificNotationToString(
      new BigNumber(stakedList[seed] || 0)
        .plus(new BigNumber(v2StakedList[seed] || 0))
        .toString()
    );
  });

  return { finalStakeList, v2StakedList, stakedList };
};

export const get_list_user_seeds = async ({
  accountId = getCurrentWallet().wallet.getAccountId(),
}) => {
  const stakedList = await refFarmViewFunction({
    methodName: 'list_user_seeds',
    args: { account_id: accountId },
  });
  return stakedList;
};

export const getLPTokenId = (farm_id: string) => {
  return farm_id.slice(farm_id.indexOf('@') + 1, farm_id.lastIndexOf('#'));
};

export const getFarms = async ({
  page = 1,
  perPage = DEFAULT_PAGE_LIMIT,
  stakedList,
  rewardList,
  tokenPriceList,
  seeds,
}: {
  page?: number;
  perPage?: number;
  stakedList: Record<string, string>;
  rewardList: Record<string, string>;
  tokenPriceList: any;
  seeds: Record<string, string>;
}): Promise<FarmInfo[]> => {
  const index = (page - 1) * perPage;
  let farms: Farm[] = await refFarmViewFunction({
    methodName: 'list_farms',
    args: { from_index: index, limit: perPage },
  });
  // filter  unexpected farm data
  const blackFarmList = new Set(config.blackList || []);
  farms = farms.filter((item) => {
    const { farm_id } = item;
    const arr = farm_id.split('@');
    if (
      !blackFarmList.has(arr[1]) &&
      farm_id != 'exchange.ref-dev.testnet5#0' &&
      farm_id != 'exchange.ref-dev.testnet5#1'
    ) {
      return true;
    }
  });
  const pool_ids = farms.map((f) => {
    return getLPTokenId(f.farm_id);
  });

  let poolList: Record<string, PoolRPCView> = {};
  const pools = await getPoolsByIds({ pool_ids });
  if (pools) {
    poolList = pools.reduce(
      (obj: any, pool: any) => ({ ...obj, [pool.id]: pool }),
      {}
    );
  }
  const tasks = farms.map(async (f) => {
    const poolId = getLPTokenId(f.farm_id);
    const pool: PoolRPCView = poolList[poolId] || {
      id: Number(poolId),
      token_account_ids: ['', ''],
      token_symbols: ['', ''],
      amounts: ['', ''],
      total_fee: 0,
      shares_total_supply: '0',
      tvl: 0,
      token0_ref_price: '0',
      share: '0',
    };
    const fi: FarmInfo = await getFarmInfo(
      f,
      pool,
      stakedList[f.seed_id],
      tokenPriceList,
      rewardList[f.reward_token],
      seeds[f.seed_id],
      getLPTokenId(f.farm_id)
    );
    return fi;
  });

  return Promise.all(tasks);
};

export const getFarmInfo = async (
  farm: Farm,
  pool: PoolRPCView,
  staked: string,
  tokenPriceList: any,
  reward: string,
  seed: string,
  lpTokenId: string
): Promise<FarmInfo> => {
  const isSignedIn: boolean = getCurrentWallet()?.wallet?.isSignedIn();
  const { tvl, token_account_ids, id } = pool;
  if (new Set(STABLE_POOL_IDS || []).has(id?.toString())) {
    staked = toNonDivisibleNumber(expand, staked ?? '0');
    seed = toNonDivisibleNumber(expand, seed ?? '0');
    if (!pool.decimalsHandled) {
      pool.shares_total_supply = toNonDivisibleNumber(
        expand,
        pool.shares_total_supply
      );
      pool.decimalsHandled = true;
    }
  }

  const poolTvl = tvl;
  const poolSts = Number(
    toReadableNumber(LP_TOKEN_DECIMALS, pool.shares_total_supply)
  );
  const userStaked = toReadableNumber(LP_TOKEN_DECIMALS, staked ?? '0');
  const rewardToken = await ftGetTokenMetadata(farm.reward_token);
  const rewardTokenPrice = tokenPriceList
    ? tokenPriceList[rewardToken.id]?.price || 0
    : 0;
  const rewardNumber = toReadableNumber(rewardToken.decimals, reward) ?? '0';
  const seedAmount = seed ?? '0';
  const totalSeed = toReadableNumber(LP_TOKEN_DECIMALS, seedAmount);

  const rewardNumberPerWeek = math.round(
    math.evaluate(
      `(${farm.reward_per_session} / ${farm.session_interval}) * 604800`
    )
  );
  const rewardsPerWeek = new BigNumber(
    toReadableNumber(
      rewardToken.decimals,
      new BigNumber(rewardNumberPerWeek.toString()).toFixed()
    )
  ).toFixed(0);

  const userRewardNumberPerWeek =
    seedAmount !== '0'
      ? math.round(
          math.evaluate(
            `${rewardNumberPerWeek} * (${staked ?? 0} / ${seedAmount})`
          )
        )
      : 0;

  const userRewardsPerWeek = toReadableNumber(
    rewardToken.decimals,
    userRewardNumberPerWeek.toString()
  );

  let userUnclaimedRewardNumber: string =
    isSignedIn && staked && Number(staked) > 0
      ? await getUnclaimedReward(farm.farm_id)
      : '0';
  const userUnclaimedReward = toReadableNumber(
    rewardToken.decimals,
    userUnclaimedRewardNumber
  );

  const totalStaked =
    poolSts === 0
      ? 0
      : Number(
          toPrecision(((Number(totalSeed) * poolTvl) / poolSts).toString(), 1)
        );

  const apr =
    totalStaked === 0
      ? '0'
      : toPrecision(
          (
            (1 / totalStaked) *
            (Number(rewardsPerWeek) * Number(rewardTokenPrice)) *
            52 *
            100
          ).toString(),
          2
        );

  if (farm.farm_status === 'Created') farm.farm_status = 'Pending';
  return {
    ...farm,
    pool,
    lpTokenId,
    rewardNumber,
    userStaked,
    rewardsPerWeek,
    userRewardsPerWeek,
    userUnclaimedReward,
    rewardToken,
    totalStaked,
    apr,
    tokenIds: token_account_ids,
    seedAmount,
  };
};

export const getUnclaimedFarms = async ({
  page = 1,
  perPage = DEFAULT_PAGE_LIMIT,
  stakedList,
  rewardList,
  tokenPriceList,
  seeds,
}: {
  page?: number;
  perPage?: number;
  stakedList: Record<string, string>;
  rewardList: Record<string, string>;
  tokenPriceList: any;
  seeds: Record<string, string>;
}): Promise<FarmInfo[]> => {
  const isSignedIn = wallet.isSignedIn();
  let farms: FarmInfo[] = await getFarms({
    page,
    perPage,
    stakedList,
    rewardList,
    tokenPriceList,
    seeds,
  });
  await Promise.all(
    farms.map(async (farm: any, i: number) => {
      const current_user_reward = isSignedIn
        ? await getUnclaimedReward(farm.farm_id)
        : 0;
      farms[i].current_user_reward = current_user_reward;
    })
  );

  return farms.filter((farm) => {
    return Number(farm.current_user_reward) > 0;
  });
};

export const getFarmsBySeedId = async (seed_id: number): Promise<Farm[]> => {
  const farms: Farm[] = await refFarmViewFunction({
    methodName: 'list_farms_by_seed',
    args: { seed_id: seed_id },
  });

  return farms;
};

export const getFarm = async (id: number): Promise<Farm> => {
  return refFarmViewFunction({
    methodName: 'get_farm',
    args: { farm_id: id },
  });
};

export const getRewards = async ({
  accountId = getCurrentWallet()?.wallet?.getAccountId(),
}): Promise<any> => {
  return refFarmViewFunction({
    methodName: 'list_rewards',
    args: { account_id: accountId },
  });
};

export const getRewardByTokenId = async (
  token_id: string,
  accountId = getCurrentWallet()?.wallet?.getAccountId()
): Promise<any> => {
  return refFarmViewFunction({
    methodName: 'get_reward',
    args: { account_id: accountId, token_id: token_id },
  });
};

export const getUnclaimedReward = async (
  farm_id: string,
  accountId = getCurrentWallet()?.wallet?.getAccountId()
): Promise<any> => {
  return refFarmViewFunction({
    methodName: 'get_unclaimed_reward',
    args: { account_id: accountId, farm_id: farm_id },
  });
};

export const listRewards = async (
  accountId = getCurrentWallet()?.wallet?.getAccountId()
): Promise<any> => {
  return refFarmViewFunction({
    methodName: 'list_rewards',
    args: { account_id: accountId },
  });
};
// todo1
export const claimRewardByFarm = async (farm_id: string): Promise<any> => {
  // return refFarmFunctionCall({
  //   methodName: 'claim_reward_by_farm',
  //   args: { farm_id: farm_id },
  // });
  const transactions: Transaction[] = [];
  transactions.push({
    receiverId: config.REF_FARM_CONTRACT_ID,
    functionCalls: [
      {
        methodName: 'claim_reward_by_farm',
        args: { farm_id: farm_id },
      },
    ],
  });
  executeFarmMultipleTransactions(transactions);
};
// todo2
export const claimRewardBySeed = async (seed_id: string): Promise<any> => {
  // return refFarmFunctionCall({
  //   methodName: 'claim_reward_by_seed',
  //   args: { seed_id: seed_id },
  // });
  const transactions: Transaction[] = [];
  transactions.push({
    receiverId: config.REF_FARM_CONTRACT_ID,
    functionCalls: [
      {
        methodName: 'claim_reward_by_seed',
        args: { seed_id: seed_id },
      },
    ],
  });
  executeFarmMultipleTransactions(transactions);
};

export const getAllSinglePriceByTokenIds = async (
  token_ids: string
): Promise<any> => {
  return await currentTokensPrice(token_ids);
};

export const claimAndWithDrawReward = async (
  farmsData: any[]
): Promise<any> => {
  const token_ids: string[] = [];
  const transactions: Transaction[] = [];
  const ftBalanceListPromise: any[] = [];
  farmsData.forEach((farm) => {
    const { userUnclaimedReward, rewardToken } = farm;
    if (Number(userUnclaimedReward) > 0) {
      token_ids.push(rewardToken.id);
    }
  });
  token_ids.forEach((tokenId) => {
    ftBalanceListPromise.push(ftGetStorageBalance(tokenId));
  });
  const ftBalanceList = await Promise.all(ftBalanceListPromise);
  ftBalanceList.forEach((balance, index) => {
    if (!balance || balance.total === '0') {
      transactions.unshift({
        receiverId: token_ids[index],
        functionCalls: [
          storageDepositAction({
            registrationOnly: true,
            amount: STORAGE_TO_REGISTER_WITH_MFT,
          }),
        ],
      });
    }
  });
  if (farmsData.length > 1) {
    transactions.push({
      receiverId: config.REF_FARM_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'claim_and_withdraw_by_seed',
          args: { seed_id: farmsData[0]['seed_id'] },
        },
      ],
    });
  } else {
    transactions.push({
      receiverId: config.REF_FARM_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'claim_and_withdraw_by_farm',
          args: { farm_id: farmsData[0]['farm_id'], withdraw_all_tokens: true },
        },
      ],
    });
  }
  return executeFarmMultipleTransactions(transactions);
};
// boost farm related function start
export const list_seeds_info = async () => {
  return await refFarmBoostViewFunction({
    methodName: 'list_seeds_info',
  });
};
export const list_seed_farms = async (seed_id: string) => {
  return await refFarmBoostViewFunction({
    methodName: 'list_seed_farms',
    args: { seed_id },
  });
};
export const list_farmer_seeds = async () => {
  const accountId = getCurrentWallet().wallet.getAccountId();
  return await refFarmBoostViewFunction({
    methodName: 'list_farmer_seeds',
    args: { farmer_id: accountId },
  });
};
export const get_unclaimed_rewards = async (seed_id: string) => {
  const accountId = getCurrentWallet().wallet.getAccountId();
  return await refFarmBoostViewFunction({
    methodName: 'get_unclaimed_rewards',
    args: { farmer_id: accountId, seed_id: seed_id },
  });
};
export const get_config = async () => {
  return await refFarmBoostViewFunction({
    methodName: 'get_config',
  });
};
export const get_unWithDraw_rewards = async () => {
  const accountId = getCurrentWallet().wallet.getAccountId();
  return await refFarmBoostViewFunction({
    methodName: 'list_farmer_rewards',
    args: { farmer_id: accountId },
  });
};
export const stake_boost = async ({
  token_id,
  amount,
  msg = '',
}: StakeOptions) => {
  const transactions: Transaction[] = [
    {
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'mft_transfer_call',
          args: {
            receiver_id: REF_FARM_BOOST_CONTRACT_ID,
            token_id,
            amount,
            msg,
          },
          amount: ONE_YOCTO_NEAR,
          gas: '180000000000000',
        },
      ],
    },
  ];

  const neededStorage = await checkTokenNeedsStorageDeposit_boost();
  if (neededStorage) {
    transactions.unshift({
      receiverId: REF_FARM_BOOST_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: neededStorage })],
    });
  }

  return executeFarmMultipleTransactions(transactions);
};
export const unStake_boost = async ({
  seed_id,
  unlock_amount,
  withdraw_amount,
}: UnStakeOptions) => {
  const transactions: Transaction[] = [
    {
      receiverId: REF_FARM_BOOST_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'unlock_and_withdraw_seed',
          args: {
            seed_id: seed_id,
            unlock_amount,
            withdraw_amount,
          },
          amount: ONE_YOCTO_NEAR,
          gas: '200000000000000',
        },
      ],
    },
  ];

  const neededStorage = await checkTokenNeedsStorageDeposit_boost();
  if (neededStorage) {
    transactions.unshift({
      receiverId: REF_FARM_BOOST_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: neededStorage })],
    });
  }

  return executeFarmMultipleTransactions(transactions);
};
export const checkTokenNeedsStorageDeposit_boost = async () => {
  let storageNeeded;
  const balance = await currentStorageBalanceOfFarm_boost(
    getCurrentWallet().wallet.getAccountId()
  );

  if (!balance) {
    storageNeeded = '0.1';
  }
  return storageNeeded;
};

export const checkTokenNeedsStorageDeposit_ve = async () => {
  let storageNeeded;
  const balance = await currentStorageBalanceOfVE(
    getCurrentWallet().wallet.getAccountId()
  );

  if (!balance) {
    storageNeeded = '0.1';
  }
  return storageNeeded;
};

export const withdrawAllReward_boost = async (
  checkedList: Record<string, any>
) => {
  const transactions: Transaction[] = [];
  const token_id_list = Object.keys(checkedList);
  const ftBalancePromiseList: any[] = [];
  const functionCalls: any[] = [];

  token_id_list.forEach((token_id) => {
    const ftBalance = ftGetStorageBalance(token_id);
    ftBalancePromiseList.push(ftBalance);
    functionCalls.push({
      methodName: 'withdraw_reward',
      args: {
        token_id: token_id,
      },
      gas: '50000000000000',
    });
  });
  const resolvedBalanceList = await Promise.all(ftBalancePromiseList);
  resolvedBalanceList.forEach((ftBalance, index) => {
    if (!ftBalance) {
      transactions.unshift({
        receiverId: token_id_list[index],
        functionCalls: [
          storageDepositAction({
            registrationOnly: true,
            amount: STORAGE_TO_REGISTER_WITH_MFT,
          }),
        ],
      });
    }
  });

  transactions.push({
    receiverId: REF_FARM_BOOST_CONTRACT_ID,
    functionCalls,
  });
  if (Object.keys(checkedList).includes(WRAP_NEAR_CONTRACT_ID)) {
    sessionStorage.setItem('near_with_draw_source', 'farm_token');
    transactions.push(
      nearWithdrawTransaction(
        toReadableNumber(
          nearMetadata.decimals,
          checkedList[WRAP_NEAR_CONTRACT_ID].value
        )
      )
    );
  }
  return executeFarmMultipleTransactions(transactions);
};
// todo
// export const claimRewardBySeed_boost = async (
//   seed_id: string
// ): Promise<any> => {
//   // const transactions: Transaction[] = [];
//   // transactions.push({
//   //   receiverId: REF_FARM_BOOST_CONTRACT_ID,
//   //   functionCalls: [
//   //     {
//   //       methodName: 'claim_reward_by_seed',
//   //       args: { seed_id: seed_id },
//   //     },
//   //   ],
//   // });
//   // return executeFarmMultipleTransactions(transactions);
//   refFarmBoostFunctionCall({
//     methodName: 'claim_reward_by_seed',
//     args: { seed_id: seed_id },
//   });
// };
export const claimRewardBySeed_boost = async (
  seed_id: string
): Promise<any> => {
  return refFarmBoostFunctionCall({
    methodName: 'claim_reward_by_seed',
    args: { seed_id: seed_id },
  });
};
export const lock_free_seed = async ({
  seed_id,
  duration_sec,
  amount,
}: {
  seed_id: string;
  duration_sec: number;
  amount: string;
}): Promise<any> => {
  const transactions: Transaction[] = [];
  transactions.push({
    receiverId: REF_FARM_BOOST_CONTRACT_ID,
    functionCalls: [
      {
        methodName: 'lock_free_seed',
        args: { seed_id, duration_sec, amount },
        amount: ONE_YOCTO_NEAR,
      },
    ],
  });
  return executeFarmMultipleTransactions(transactions);
};
export const force_unlock = async ({
  seed_id,
  unlock_amount,
}: {
  seed_id: string;
  unlock_amount: string;
}): Promise<any> => {
  const transactions: Transaction[] = [];
  transactions.push({
    receiverId: REF_FARM_BOOST_CONTRACT_ID,
    functionCalls: [
      {
        methodName: 'force_unlock',
        args: { seed_id, unlock_amount },
        amount: ONE_YOCTO_NEAR,
      },
    ],
  });
  return executeFarmMultipleTransactions(transactions);
};
export const getServerTime = async () => {
  const result = await near.connection.provider
    .block({
      finality: 'final',
    })
    .catch(() => {
      return {
        header: {
          timestamp: new Date().getTime() * 100000,
        },
      };
    });
  const timestamp = result?.header?.timestamp;
  return timestamp;
};

export const love_stake = async ({ amount, msg = '' }: StakeOptions) => {
  const transactions: Transaction[] = [
    {
      receiverId: REF_VE_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'ft_transfer_call',
          args: {
            receiver_id: REF_FARM_BOOST_CONTRACT_ID,
            amount,
            msg,
          },
          amount: ONE_YOCTO_NEAR,
          gas: '180000000000000',
        },
      ],
    },
  ];

  const neededStorage = await checkTokenNeedsStorageDeposit_boost();
  if (neededStorage) {
    transactions.unshift({
      receiverId: REF_FARM_BOOST_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: neededStorage })],
    });
  }

  return executeFarmMultipleTransactions(transactions);
};
export const getBoostTokenPrices = async (): Promise<
  Record<string, TokenPrice>
> => {
  try {
    let tokenPrices: Record<string, TokenPrice> = {};
    const cacheData = await db.checkTokenPrices();
    if (cacheData) {
      const list: TokenPrice[] = await db.queryTokenPrices();
      list.forEach((price: TokenPrice) => {
        const { id, update_time, ...priceInfo } = price;
        tokenPrices[id] = priceInfo;
      });
      getBoostTokenPricesFromServer();
    } else {
      tokenPrices = await getBoostTokenPricesFromServer();
    }
    return tokenPrices;
  } catch (error) {
    console.log(error);
    return {};
  }
};
export const getBoostTokenPricesFromServer = async (): Promise<
  Record<string, TokenPrice>
> => {
  try {
    const tokenPrices: Record<string, TokenPrice> = await getTokenPriceList();
    await db.cacheTokenPrices(tokenPrices);
    return tokenPrices;
  } catch (error) {
    console.log(error);
    return {};
  }
};

export const getBoostSeeds = async (): Promise<{
  seeds: Seed[];
  farms: FarmBoost[][];
  pools: PoolRPCView[];
}> => {
  try {
    const seeds: Seed[] = [];
    const farms: FarmBoost[][] = [];
    const pools: PoolRPCView[] = [];
    const cacheData = await db.checkBoostSeeds();
    if (cacheData) {
      const list: BoostSeeds[] = await db.queryBoostSeeds();
      list.forEach((s: BoostSeeds) => {
        const { id, update_time, ...info } = s;
        const { seed, farmList, pool } = info;
        seeds.push(seed);
        farms.push(farmList);
        if (pool) {
          pools.push(pool);
        }
      });
      getBoostSeedsFromServer();
      return { seeds, farms, pools };
    } else {
      const result = await getBoostSeedsFromServer();
      return result;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
};
export const getBoostSeedsFromServer = async (): Promise<{
  seeds: Seed[];
  farms: FarmBoost[][];
  pools: PoolRPCView[];
}> => {
  try {
    // get all seeds
    const list_seeds = await list_seeds_info();
    // get all farms
    const farmsPromiseList: Promise<any>[] = [];
    const poolIds = new Set<string>();
    let pools: PoolRPCView[] = [];
    list_seeds.forEach((seed: Seed) => {
      const { seed_id } = seed;
      if (seed_id.indexOf('@') > -1) {
        const poolId = seed_id.substring(seed_id.indexOf('@') + 1);
        poolIds.add(poolId);
      }
      farmsPromiseList.push(list_seed_farms(seed_id));
    });
    const list_farms: FarmBoost[][] = await Promise.all(farmsPromiseList);
    let cacheFarms: FarmBoost[] = [];
    list_farms.forEach((arr: FarmBoost[]) => {
      cacheFarms = cacheFarms.concat(arr);
    });
    pools = await getPoolsByIds({ pool_ids: Array.from(poolIds) });
    // cache seeds farms pools
    const cacheSeedsFarmsPools: any[] = [];
    list_seeds.forEach((seed: Seed, index: number) => {
      let pool: PoolRPCView = null;
      if (seed.seed_id.indexOf('@') > -1) {
        const id = seed.seed_id.substring(seed.seed_id.indexOf('@') + 1);
        pool = pools.find((p: PoolRPCView) => {
          if (+p.id == +id) return true;
        });
      }
      cacheSeedsFarmsPools.push({
        id: seed.seed_id,
        seed,
        farmList: list_farms[index],
        pool,
      });
    });
    db.cacheBoostSeeds(cacheSeedsFarmsPools);
    return { seeds: list_seeds, farms: list_farms, pools };
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getVeSeedShare = async (): Promise<any> => {
  // REF_VE_CONTRACT_ID
  return await fetch(
    config.sodakiApiUrl + `/seed/v2.ref-finance.near@79/accounts`,
    {
      method: 'GET',
    }
  )
    .then((res) => res.json())
    .then((res) => {
      return res;
    })
    .catch(() => {
      return {};
    });
};
export interface Seed {
  min_deposit: string;
  min_locking_duration_sec: number;
  next_index: number;
  seed_decimal: number;
  seed_id: string;
  slash_rate: number;
  total_seed_amount: string;
  total_seed_power: string;
  farmList?: FarmBoost[];
  pool?: PoolRPCView;
  seedTvl?: string;
  hidden?: boolean;
  endedFarmsIsSplit?: boolean;
  base?: number;
}
export interface FarmBoostTerm {
  daily_reward: string;
  reward_token: string;
  start_at: number;
}
export interface FarmBoost {
  amount_of_beneficiary: string;
  claimed_reward: string;
  distributed_at: string;
  distributed_reward: string;
  farm_id: string;
  status: string;
  terms: FarmBoostTerm;
  total_reward: string;
  token_meta_data?: TokenMetadata;
  apr?: string;
  baseApr?: string;
}
interface StakeOptions {
  token_id?: string;
  amount: string;
  msg?: string;
}
interface UnStakeOptions {
  seed_id: string;
  unlock_amount: string;
  withdraw_amount: string;
}
export interface UserSeedInfo {
  boost_ratios: any;
  duration_sec: number;
  free_amount: string;
  locked_amount: string;
  unlock_timestamp: string;
  x_locked_amount: string;
}
export interface BoostConfig {
  affected_seeds: Record<string, number>;
  booster_decimal: number;
}
// boost farm related function end

// migrate related methods start
export const migrate_user_seed = async ({
  seed_id,
  amount,
  poolId,
  msg = '',
}: {
  seed_id: string;
  amount: string;
  poolId: string;
  msg?: string;
}) => {
  // unstake
  const transactions: Transaction[] = [
    {
      receiverId: REF_FARM_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'withdraw_seed',
          args: {
            seed_id: seed_id,
            amount,
            msg,
          },
          amount: ONE_YOCTO_NEAR,
          gas: '200000000000000',
        },
      ],
    },
  ];

  const neededStorage = await checkTokenNeedsStorageDeposit('farm');
  if (neededStorage) {
    transactions.unshift({
      receiverId: REF_FARM_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: FARM_STORAGE_BALANCE })],
    });
  }
  // stake
  const neededStorage_boost = await checkTokenNeedsStorageDeposit_boost();
  if (neededStorage_boost) {
    transactions.push({
      receiverId: REF_FARM_BOOST_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: neededStorage_boost })],
    });
  }
  transactions.push({
    receiverId: REF_FI_CONTRACT_ID,
    functionCalls: [
      {
        methodName: 'mft_transfer_call',
        args: {
          receiver_id: REF_FARM_BOOST_CONTRACT_ID,
          token_id: getMftTokenId(poolId),
          amount,
          msg: JSON.stringify('Free'),
        },
        amount: ONE_YOCTO_NEAR,
        gas: '180000000000000',
      },
    ],
  });
  return executeFarmMultipleTransactions(transactions);
};
export function useMigrate_user_data() {
  const [user_migrate_seeds, set_user_migrate_seeds] = useState([]);
  const [user_claimed_rewards, set_user_claimed_rewards] = useState({});
  const [seed_loading, set_seed_loading] = useState(true);
  const [rewards_loading, set_rewards_loading] = useState(true);
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  useEffect(() => {
    if (isSignedIn) {
      get_user_seeds();
      get_user_claimed_rewards();
    }
  }, []);
  async function get_user_seeds() {
    const userMigrateSeeds: MigrateSeed[] = [];
    const result_old: Record<string, string> = await get_list_user_seeds({});
    const result_new: Record<string, any> = await getBoostSeeds();
    const { seeds, pools, farms } = result_new;
    // filter no farm seed
    const new_list_seeds: any[] = [];
    farms.forEach((farmList: FarmBoost[], index: number) => {
      if (farmList?.length > 0) {
        new_list_seeds.push({
          ...seeds[index],
        });
      }
    });
    Object.keys(result_old).forEach((seedId: string) => {
      const poolId = getPoolIdBySeedId(seedId);
      const boostFarmHasSamePool = new_list_seeds.find((seed: Seed) => {
        const id = getPoolIdBySeedId(seed.seed_id);
        if (poolId == id) return true;
      });
      if (boostFarmHasSamePool) {
        // can migrate
        const pool = pools.find((p: PoolRPCView) => {
          if (p.id == +poolId) return true;
        });
        userMigrateSeeds.push({
          seed_id: seedId,
          amount: result_old[seedId],
          pool,
        });
      }
    });
    set_user_migrate_seeds(userMigrateSeeds);
    set_seed_loading(false);
  }
  async function get_user_claimed_rewards() {
    const rewards = await getRewards({});
    const tempMap = {};
    Object.entries(rewards).forEach((item) => {
      const [key, v] = item;
      if (v !== '0') {
        tempMap[key] = v;
      }
    });
    set_user_claimed_rewards(tempMap);
    set_rewards_loading(false);
  }
  return {
    user_migrate_seeds,
    seed_loading,
    user_claimed_rewards,
    rewards_loading,
  };
}
export interface MigrateSeed {
  seed_id: string;
  amount: string;
  pool: PoolRPCView;
}
// migrate related methods end
export const get_seed_info = async (seed_id: string): Promise<any> => {
  return refFarmViewFunction({
    methodName: 'get_seed_info',
    args: { seed_id },
  });
};
export const classificationOfCoins = {
  stablecoin: ['USDT.e', 'USDC', 'DAI', 'nUSDO', 'cUSD', 'USN'],
  near_ecosystem: [
    'REF',
    'STNEAR',
    'OCT',
    'AURORA',
    'SKYWARD',
    'xREF',
    'FLX',
    'OIN',
    'PARAS',
    'PULSE',
    'PXT',
    'MYRIA',
    'HAPI',
    'DBIO',
    '1MIL',
    '$META',
    'Cheddar',
    'ABR',
    'BANANA',
    'POTATO',
    'SHRM',
    'CUCUMBER',
    'USN',
  ],
  bridged_tokens: [
    'ETH',
    'WETH',
    'USDT.e',
    'USDC',
    'DAI',
    'OCT',
    'AURORA',
    'FLX',
    'OIN',
    'PULSE',
    'HAPI',
    'GTC',
    '1MIL',
    'LINK',
    'WBTC',
    'MRCH',
    'bHOME',
    'GWJ',
    'BAT',
    '1INCH',
    'CELO',
    'cUSD',
    'HBTC',
  ],
  gaming: ['PXT', 'sPXT', 'SHRM', 'GOLD', 'GEM', 'ELIXIR'],
  nft: ['PARAS', '1MIL'],
};
export const classificationOfCoins_key = [
  'stablecoin',
  'near_ecosystem',
  'bridged_tokens',
  'gaming',
  'nft',
];
export const incentiveLpTokenConfig = {};
export const defaultConfig = {
  '3364': '102',
  '1195': '101',
  '2800': '100',
  '79': '99',
  [STABLE_POOL_USN_ID]: '98',
  '2657': '97',
  '2691': '10',
  '3019': '9',
  '2799': '8',
  '2801': '7',
  '1207': '4',
  '4': '4',
  '1889': '2',
  [STABLE_POOL_ID]: '5',
  '3': '4',
  '2734': '4',
  '974': '4',
};

export const frontConfig = {
  '3020': '100',
  '3433': '99',
  '79': '98',
};
export const farmClassification = {
  near: [
    0, 1207, 1371, 1395, 2330, 2448, 2799, 3, 3019, 3097, 3474, 3514, 3515,
    3519, 377, 4, 974, 1195, 1923, 3448, 553, 79, 2691, 2800, 3020, 3433, 3612,
    2769,
  ],
  eth: [
    605, 1207, 2734, 1395, 1910, 2330, 2657, 2691, 2799, 2800, 3, 3020, 3433, 4,
    974, 3097,
  ],
};
export const frontConfigBoost = {
  '79': '100',
};
