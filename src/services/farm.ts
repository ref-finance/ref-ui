import {
  farmWallet,
  refFarmFunctionCall,
  refFarmViewFunction,
  wallet,
} from './near';
import { toPrecision, toReadableNumber } from '~utils/numbers';
import { LP_TOKEN_DECIMALS } from '~services/m-token';
import * as math from 'mathjs';
import { ftGetTokenMetadata, TokenMetadata } from '~services/ft-contract';
import {
  getPoolsByIdsFromIndexer,
  getTokenPriceList,
  PoolRPCView,
} from '~services/api';
import getConfig from '~services/config';
import { BigNumber } from 'bignumber.js';

export const DEFAULT_PAGE_LIMIT = 100;

export interface Seed {
  seed_id: string;
  amount: number;
}

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
  accountId = wallet.getAccountId(),
}): Promise<Record<string, string>> => {
  const stakedList = await refFarmViewFunction({
    methodName: 'list_user_seeds',
    args: { account_id: accountId },
  });

  return stakedList;
};

export const getFarms = async ({
  page = 1,
  perPage = DEFAULT_PAGE_LIMIT,
}: {
  page?: number;
  perPage?: number;
}): Promise<FarmInfo[]> => {
  const isSignedIn: boolean = wallet.isSignedIn();
  const index = (page - 1) * perPage;
  const farms: Farm[] = await refFarmViewFunction({
    methodName: 'list_farms',
    args: { from_index: index, limit: perPage },
  });

  let stakedList: Record<string, string> = isSignedIn
    ? await getStakedListByAccountId({})
    : {};

  let rewardList: Record<string, string> = isSignedIn
    ? await getRewards({})
    : {};

  const tokenPriceList = await getTokenPriceList();
  const refPrice = tokenPriceList[getConfig().REF_TOKEN_ID]?.price || 0;

  const seeds = await getSeeds({ page: page, perPage: perPage });

  const pool_ids = farms.map((f) => {
    return f.farm_id.slice(
      f.farm_id.indexOf('@') + 1,
      f.farm_id.lastIndexOf('#')
    );
  });
  let poolsList: Record<string, PoolRPCView> = {};
  const pools = await getPoolsByIdsFromIndexer(pool_ids);
  poolsList = pools.reduce(
    (obj: any, pool: any) => ({ ...obj, [pool.id]: pool }),
    {}
  );

  const tasks = farms.map(async (f) => {
    const lpTokenId = f.farm_id.slice(
      f.farm_id.indexOf('@') + 1,
      f.farm_id.lastIndexOf('#')
    );

    const { shares_total_supply, tvl, token_account_ids } =
      poolsList[lpTokenId];
    const poolTvl = tvl;
    const poolSts = Number(toReadableNumber(24, shares_total_supply));
    const userStaked = toReadableNumber(
      LP_TOKEN_DECIMALS,
      stakedList[f.seed_id] ?? '0'
    );
    const rewardToken = await ftGetTokenMetadata(f.reward_token);
    const rewardNumber =
      toReadableNumber(rewardToken.decimals, rewardList[f.reward_token]) ?? '0';
    const seedAmount = seeds[f.seed_id] ?? '0';
    const totalSeed =
      toReadableNumber(LP_TOKEN_DECIMALS, seeds[f.seed_id]) ?? '0';

    const rewardNumberPerWeek = math.round(
      math.evaluate(
        `(${f.reward_per_session} / ${f.session_interval}) * 604800`
      )
    );

    const rewardsPerWeek = toPrecision(
      toReadableNumber(
        rewardToken.decimals,
        new BigNumber(rewardNumberPerWeek.toString()).toFixed()
      ),
      4
    );

    const userRewardNumberPerWeek =
      seedAmount !== '0'
        ? math.round(
            math.evaluate(
              `${rewardNumberPerWeek} * (${
                stakedList[f.seed_id] ?? 0
              } / ${seedAmount})`
            )
          )
        : 0;
    const userRewardsPerWeek = toReadableNumber(
      rewardToken.decimals,
      userRewardNumberPerWeek.toString()
    );
    let userUnclaimedRewardNumber: string = isSignedIn
      ? await getUnclaimedReward(f.farm_id)
      : '0';

    const userUnclaimedReward = toPrecision(
      toReadableNumber(rewardToken.decimals, userUnclaimedRewardNumber),
      4
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
              (Number(rewardsPerWeek) * refPrice) *
              52 *
              100
            ).toString(),
            1
          );

    const fi: FarmInfo = {
      ...f,
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
    };
    return fi;
  });

  return Promise.all(tasks);
};

export const getUnclaimedFarms = async ({
  page = 1,
  perPage = DEFAULT_PAGE_LIMIT,
}: {
  page?: number;
  perPage?: number;
}): Promise<FarmInfo[]> => {
  const isSignedIn = farmWallet.isSignedIn();
  let farms: FarmInfo[] = await getFarms({ page, perPage });
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
  accountId = wallet.getAccountId(),
}): Promise<any> => {
  return refFarmViewFunction({
    methodName: 'list_rewards',
    args: { account_id: accountId },
  });
};

export const getRewardByTokenId = async (
  token_id: string,
  accountId = wallet.getAccountId()
): Promise<any> => {
  return refFarmViewFunction({
    methodName: 'get_reward',
    args: { account_id: accountId, token_id: token_id },
  });
};

export const getUnclaimedReward = async (
  farm_id: string,
  accountId = wallet.getAccountId()
): Promise<any> => {
  return refFarmViewFunction({
    methodName: 'get_unclaimed_reward',
    args: { account_id: accountId, farm_id: farm_id },
  });
};

export const listRewards = async (
  accountId = wallet.getAccountId()
): Promise<any> => {
  return refFarmViewFunction({
    methodName: 'list_rewards',
    args: { account_id: accountId },
  });
};

export const claimRewardByFarm = async (farm_id: string): Promise<any> => {
  return refFarmFunctionCall({
    methodName: 'claim_reward_by_farm',
    args: { farm_id: farm_id },
  });
};

export const claimRewardBySeed = async (seed_id: string): Promise<any> => {
  return refFarmFunctionCall({
    methodName: 'claim_reward_by_seed',
    args: { seed_id: seed_id },
  });
};
