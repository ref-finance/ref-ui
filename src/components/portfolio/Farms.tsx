import React, { useEffect, useMemo, useState, useContext } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { WalletContext } from '../../utils/wallets-integration';
import {
  list_farmer_seeds,
  get_unclaimed_rewards,
  Seed,
  FarmBoost,
  get_config,
  BoostConfig,
  UserSeedInfo,
  getBoostTokenPrices,
  getBoostSeeds,
  getVeSeedShare,
  getServerTime,
  claimRewardBySeed_boost,
  frontConfigBoost,
} from '../../services/farm';
import getConfig from '../../services/config';
import { PoolRPCView } from '../../services/api';
import {
  LP_TOKEN_DECIMALS,
  LP_STABLE_TOKEN_DECIMALS,
} from '../../services/m-token';
import {
  toPrecision,
  toReadableNumber,
  toInternationalCurrencySystem,
  formatWithCommas,
} from '../../utils/numbers';
import { ftGetTokenMetadata } from '../../services/ft-contract';
import { BigNumber } from 'bignumber.js';

import { TokenMetadata } from '../../services/ft-contract';
import { useTokens } from '~state/token';
import { getMftTokenId, toRealSymbol } from '~utils/token';
import { LOVE_TOKEN_DECIMAL } from '../../state/referendum';
import { get24hVolume } from '../../services/indexer';
import { isStablePool } from '~services/near';
import { mftGetBalance } from '~services/mft-contract';
import {
  GradientButton,
  ButtonTextWrapper,
  OprationButton,
} from '~components/button/Button';

const {
  STABLE_POOL_IDS,
  REF_VE_CONTRACT_ID,
  boostBlackList,
  FARM_BLACK_LIST_V2,
} = getConfig();
import { StakeModal, UnStakeModal } from '../../components/farm/FarmsDetail';

export default function Farms(props: any) {
  let [tokenPriceList, setTokenPriceList] = useState<any>({});
  let [farm_display_List, set_farm_display_List] = useState<any>([]);
  let [farm_display_ended_List, set_farm_display_ended_List] = useState<any>(
    []
  );
  let [boostConfig, setBoostConfig] = useState<BoostConfig>(null);
  let [loveSeed, setLoveSeed] = useState<Seed>(null);

  let [user_seeds_map, set_user_seeds_map] = useState<
    Record<string, UserSeedInfo>
  >({});
  const [user_unclaimed_map, set_user_unclaimed_map] = useState<
    Record<string, any>
  >({});
  const [user_unclaimed_token_meta_map, set_user_unclaimed_token_meta_map] =
    useState<Record<string, any>>({});
  const [maxLoveShareAmount, setMaxLoveShareAmount] = useState<string>('0');
  let [homePageLoading, setHomePageLoading] = useState(true);
  const [dayVolumeMap, setDayVolumeMap] = useState({});
  const [noData, setNoData] = useState(false);
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  useEffect(() => {
    init();
    getConfig();
    get_ve_seed_share();
  }, [isSignedIn]);
  async function init() {
    let list_seeds: Seed[];
    let list_farm: FarmBoost[][];
    let pools: PoolRPCView[];
    const result = await getBoostSeeds();
    await get_user_seeds_and_unClaimedRewards();
    const { seeds, farms, pools: cachePools } = result;
    list_seeds = seeds;
    list_farm = farms;
    pools = cachePools;
    // get Love seed
    list_seeds.find((seed: Seed) => {
      if (seed.seed_id == REF_VE_CONTRACT_ID) {
        loveSeed = seed;
        setLoveSeed(seed);
      }
    });
    // filter Love Seed
    list_seeds.filter((seed: Seed) => {
      if (seed.seed_id.indexOf('@') > -1) return true;
    });
    // filter black farms
    const temp_list_farm: FarmBoost[][] = [];
    list_farm.forEach((farmList: FarmBoost[]) => {
      let temp_farmList: FarmBoost[] = [];
      temp_farmList = farmList.filter((farm: FarmBoost) => {
        const id = farm?.farm_id?.split('@')[1];
        if (boostBlackList.indexOf(id) == -1) {
          return true;
        }
      });
      temp_list_farm.push(temp_farmList);
    });
    list_farm = temp_list_farm;
    // filter no farm seed
    const new_list_seeds: any[] = [];
    list_farm.forEach((farmList: FarmBoost[], index: number) => {
      if (farmList?.length > 0) {
        new_list_seeds.push({
          ...list_seeds[index],
          farmList,
        });
      }
    });

    list_seeds = new_list_seeds;
    // get all token prices
    const tokenPriceList = await getBoostTokenPrices();
    // get pool apr
    getAllPoolsDayVolume(list_seeds);
    setTokenPriceList(tokenPriceList);
    getFarmDataList({
      list_seeds,
      tokenPriceList,
      pools,
    });
  }
  async function getFarmDataList(initData: any) {
    const { list_seeds, tokenPriceList, pools } = initData;
    const promise_new_list_seeds = list_seeds.map(async (newSeed: Seed) => {
      const { seed_id, farmList, total_seed_amount, total_seed_power } =
        newSeed;
      const poolId = getPoolIdBySeedId(seed_id);
      const pool = pools.find((pool: PoolRPCView) => {
        if (pool.id == Number(poolId)) return true;
      });
      const { token_account_ids } = pool;
      const promise_token_meta_data: Promise<any>[] = [];
      token_account_ids.forEach(async (tokenId: string) => {
        promise_token_meta_data.push(ftGetTokenMetadata(tokenId));
      });
      pool.tokens_meta_data = await Promise.all(promise_token_meta_data);

      const promise_farm_meta_data = farmList.map(async (farm: FarmBoost) => {
        const tokenId = farm.terms.reward_token;
        const tokenMetadata = await ftGetTokenMetadata(tokenId);
        farm.token_meta_data = tokenMetadata;
        return farm;
      });
      await Promise.all(promise_farm_meta_data);
      // get seed tvl
      const { tvl, id, shares_total_supply } = pool;
      const DECIMALS = new Set(STABLE_POOL_IDS || []).has(id?.toString())
        ? LP_STABLE_TOKEN_DECIMALS
        : LP_TOKEN_DECIMALS;
      const seedTotalStakedAmount = toReadableNumber(
        DECIMALS,
        total_seed_amount
      );
      const seedTotalStakedPower = toReadableNumber(DECIMALS, total_seed_power);
      const poolShares = Number(
        toReadableNumber(DECIMALS, shares_total_supply)
      );
      const seedTvl =
        poolShares == 0
          ? 0
          : Number(
              toPrecision(
                ((Number(seedTotalStakedAmount) * tvl) / poolShares).toString(),
                2
              )
            );
      const seedPowerTvl =
        poolShares == 0
          ? 0
          : Number(
              toPrecision(
                ((Number(seedTotalStakedPower) * tvl) / poolShares).toString(),
                2
              )
            );
      // get apr per farm
      farmList.forEach((farm: FarmBoost) => {
        const { token_meta_data } = farm;
        const { daily_reward, reward_token } = farm.terms;
        const readableNumber = toReadableNumber(
          token_meta_data.decimals,
          daily_reward
        );
        const reward_token_price = Number(
          tokenPriceList[reward_token]?.price || 0
        );
        const apr =
          seedPowerTvl == 0
            ? 0
            : (Number(readableNumber) * 360 * reward_token_price) /
              seedPowerTvl;
        const baseApr =
          seedTvl == 0
            ? 0
            : (Number(readableNumber) * 360 * reward_token_price) / seedTvl;

        farm.apr = apr.toString();
        farm.baseApr = baseApr.toString();
      });
      newSeed.pool = pool;
      newSeed.seedTvl = seedTvl?.toString() || '0';
    });
    await Promise.all(promise_new_list_seeds);
    // split ended farms
    const ended_split_list_seeds: Seed[] = [];
    list_seeds.forEach((seed: Seed) => {
      const { farmList } = seed;
      const endedList = farmList.filter((farm: FarmBoost) => {
        if (farm.status == 'Ended') return true;
      });
      const noEndedList = farmList.filter((farm: FarmBoost) => {
        if (farm.status != 'Ended') return true;
      });
      if (endedList.length > 0 && noEndedList.length > 0) {
        seed.farmList = noEndedList;
        const endedSeed = JSON.parse(JSON.stringify(seed));
        endedSeed.farmList = endedList;
        endedSeed.endedFarmsIsSplit = true;
        ended_split_list_seeds.push(endedSeed);
      }
    });
    const total_list_seeds = list_seeds.concat(ended_split_list_seeds);
    farm_display_List = total_list_seeds;
    farm_display_ended_List = getAllEndedFarms();
    set_farm_display_List(farm_display_List);
    set_farm_display_ended_List(farm_display_ended_List);
    searchByCondition();
  }
  async function getAllPoolsDayVolume(list_seeds: Seed[]) {
    const tempMap = {};
    const poolIds: string[] = [];
    const seedIds: string[] = [];
    list_seeds.forEach((seed: Seed) => {
      seedIds.push(seed.seed_id);
    });
    seedIds.forEach((seedId: string) => {
      poolIds.push(seedId.split('@')[1]);
    });
    // get24hVolume
    const promisePoolIds = poolIds.map((poolId: string) => {
      return get24hVolume(poolId);
    });
    try {
      const resolvedResult = await Promise.all(promisePoolIds);
      poolIds.forEach((poolId: string, index: number) => {
        tempMap[poolId] = resolvedResult[index];
      });
      setDayVolumeMap(tempMap);
    } catch (error) {}
  }
  async function getConfig() {
    const config = await get_config();
    const data = config.booster_seeds[REF_VE_CONTRACT_ID];
    boostConfig = data;
    setBoostConfig(data);
  }
  async function get_user_seeds_and_unClaimedRewards() {
    if (isSignedIn) {
      // get user seeds
      const list_user_seeds = await list_farmer_seeds();
      user_seeds_map = list_user_seeds;
      set_user_seeds_map(list_user_seeds);
      // get user unclaimed rewards
      const userUncliamedRewards = {};
      const seed_ids = Object.keys(list_user_seeds);
      const request: Promise<any>[] = [];
      seed_ids.forEach((seed_id: string) => {
        request.push(get_unclaimed_rewards(seed_id));
      });
      const resolvedList = await Promise.all(request);
      resolvedList.forEach((rewards, index) => {
        if (rewards && Object.keys(rewards).length > 0) {
          userUncliamedRewards[seed_ids[index]] = rewards;
        }
      });
      set_user_unclaimed_map(userUncliamedRewards);
      // get user unclaimed token meta
      const unclaimed_token_meta_datas = {};
      const prom_rewards = Object.values(userUncliamedRewards).map(
        async (rewards) => {
          const tokens = Object.keys(rewards);
          const unclaimedTokens = tokens.map(async (tokenId: string) => {
            const tokenMetadata = await ftGetTokenMetadata(tokenId);
            return tokenMetadata;
          });
          const tempArr = await Promise.all(unclaimedTokens);
          tempArr.forEach((token: TokenMetadata) => {
            unclaimed_token_meta_datas[token.id] = token;
          });
        }
      );
      await Promise.all(prom_rewards);
      set_user_unclaimed_token_meta_map(unclaimed_token_meta_datas);
    }
  }
  async function get_ve_seed_share() {
    const result = await getVeSeedShare();
    const maxShareObj = result?.accounts?.accounts[0] || {};
    const amount = maxShareObj?.amount;
    if (amount) {
      const amountStr = new BigNumber(amount).toFixed().toString();
      // todo 现在是 用 ref-near替代，上mainnet后替代
      // const amountStr_readable = toReadableNumber(LOVE_TOKEN_DECIMAL, amountStr);
      const amountStr_readable = toReadableNumber(24, amountStr);
      setMaxLoveShareAmount(amountStr_readable);
    }
  }
  function getPoolIdBySeedId(seed_id: string) {
    if (seed_id.indexOf('@') > -1) {
      return seed_id.slice(seed_id.indexOf('@') + 1);
    }
    return '';
  }
  function getAllEndedFarms() {
    const allEndedFarms = farm_display_List.filter((seed: Seed) => {
      if (seed.farmList[0].status == 'Ended') return true;
    });
    return JSON.parse(JSON.stringify(allEndedFarms));
  }
  function searchByCondition() {
    farm_display_List = farm_display_List.sort();
    let noDataLive = true;
    const commonSeedFarms = mergeCommonSeedsFarms();
    // filter
    farm_display_List = farm_display_List.filter((seed: Seed) => {
      const { seed_id, farmList } = seed;
      const isEnd = farmList[0].status == 'Ended';
      const user_seed = user_seeds_map[seed_id];
      const userStaked = Object.keys(user_seed || {}).length > 0;
      let condition1;
      if (userStaked) {
        const commonSeedFarmList = commonSeedFarms[seed_id] || [];
        if (commonSeedFarmList.length == 2 && isEnd) {
          condition1 = false;
        } else {
          condition1 = true;
        }
      }
      if (condition1) {
        noDataLive = false;
        return true;
      }
    });
    // sort by tvl
    farm_display_List.sort((item1: Seed, item2: Seed) => {
      const item1PoolId = item1.pool.id;
      const item2PoolId = item2.pool.id;
      const item1Front = frontConfigBoost[item1PoolId];
      const item2Front = frontConfigBoost[item2PoolId];
      if (item1Front || item2Front) {
        return Number(item2Front || 0) - Number(item1Front || 0);
      }
      return Number(item2.seedTvl) - Number(item1.seedTvl);
    });
    setNoData(noDataLive);
    set_farm_display_List(farm_display_List);
    setHomePageLoading(false);
  }
  function mergeCommonSeedsFarms() {
    const tempMap = {};
    const list = JSON.parse(JSON.stringify(farm_display_List));
    list.forEach((seed: Seed) => {
      const { seed_id } = seed;
      tempMap[seed_id] = tempMap[seed_id] || [];
      tempMap[seed_id].push(seed);
    });
    return tempMap;
  }
  return (
    <div className="text-white">
      <div>
        <div className="grid grid-cols-12 pl-4 pr-8">
          <div className="col-span-2 text-sm text-v3LightGreyColor">Farms</div>
          <div className="col-span-2 text-sm text-v3LightGreyColor">
            Total Staked
          </div>
          <div className="col-span-1 text-sm text-v3LightGreyColor">APR</div>
          <div className="col-span-3 text-sm text-v3LightGreyColor">
            Farm weekly Rewards
          </div>
          <div className="col-span-2 text-sm text-v3LightGreyColor justify-self-end">
            Your Power
          </div>
          <div className="col-span-2 text-sm text-v3LightGreyColor justify-self-end">
            Unclaimed Rewards
          </div>
        </div>
        {farm_display_List.map((seed: Seed, index: number) => {
          return (
            <div key={seed.seed_id + index}>
              <FarmViewRow
                seed={seed}
                tokenPriceList={tokenPriceList}
                boostConfig={boostConfig}
                loveSeed={loveSeed}
                user_seeds_map={user_seeds_map}
                user_unclaimed_map={user_unclaimed_map}
                user_unclaimed_token_meta_map={user_unclaimed_token_meta_map}
                maxLoveShareAmount={maxLoveShareAmount}
                dayVolumeMap={dayVolumeMap}
              ></FarmViewRow>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FarmViewRow(props: {
  seed: Seed;
  tokenPriceList: Record<string, any>;
  boostConfig: BoostConfig;
  loveSeed: Seed;
  user_seeds_map: Record<string, UserSeedInfo>;
  user_unclaimed_map: Record<string, any>;
  user_unclaimed_token_meta_map: Record<string, any>;
  maxLoveShareAmount: string;
  dayVolumeMap: Record<string, string>;
}): any {
  const {
    seed,
    tokenPriceList,
    boostConfig,
    loveSeed,
    user_seeds_map,
    user_unclaimed_map,
    user_unclaimed_token_meta_map,
    maxLoveShareAmount,
    dayVolumeMap,
  } = props;
  const [yourApr, setYourApr] = useState('');
  const [dayVolume, setDayVolume] = useState('');
  const [yourTvl, setYourTvl] = useState('');
  const [stakeModalVisible, setStakeModalVisible] = useState(false);
  const [unStakeModalVisible, setUnStakeModalVisible] = useState(false);
  const [lpBalance, setLpBalance] = useState('');
  const [serverTime, setServerTime] = useState<number>();
  const { pool, seedTvl, seed_id, seed_decimal } = seed;
  const { token_account_ids, id } = pool;
  const {
    free_amount = '0',
    locked_amount = '0',
    x_locked_amount = '0',
    unlock_timestamp,
    duration_sec,
  } = user_seeds_map[seed_id] || {};
  const DECIMALS = isStablePool(id?.toString())
    ? LP_STABLE_TOKEN_DECIMALS
    : LP_TOKEN_DECIMALS;
  const freeAmount = toReadableNumber(DECIMALS, free_amount);

  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const tokens = sortTokens(useTokens(token_account_ids) || []);
  const [claimLoading, setClaimLoading] = useState(false);
  const [hover, setHover] = useState<boolean>(false);
  const [unclaimedRewardsData, setUnclaimedRewardsData] =
    useState<Record<string, any>>();
  useEffect(() => {
    get_server_time();
    getStakeBalance();
    getYourTvl();
    getTotalUnclaimedRewards();
  }, []);
  useEffect(() => {
    const yourApr = getYourApr();
    if (yourApr) {
      setYourApr(yourApr);
    }
  }, [boostConfig]);
  async function get_server_time() {
    const timestamp = await getServerTime();
    setServerTime(timestamp);
  }
  async function getStakeBalance() {
    if (isSignedIn) {
      const poolId = pool.id;
      const b = await mftGetBalance(getMftTokenId(poolId.toString()));
      if (new Set(STABLE_POOL_IDS || []).has(poolId?.toString())) {
        setLpBalance(toReadableNumber(LP_STABLE_TOKEN_DECIMALS, b));
      } else {
        setLpBalance(toReadableNumber(LP_TOKEN_DECIMALS, b));
      }
    }
  }
  function getYourTvl() {
    const { free_amount, locked_amount } = user_seeds_map[seed_id] || {};
    const yourLp = toReadableNumber(
      seed_decimal,
      new BigNumber(free_amount || 0).plus(locked_amount || 0).toFixed()
    );
    const { tvl, id, shares_total_supply } = pool;
    const DECIMALS = new Set(STABLE_POOL_IDS || []).has(id?.toString())
      ? LP_STABLE_TOKEN_DECIMALS
      : LP_TOKEN_DECIMALS;
    const poolShares = Number(toReadableNumber(DECIMALS, shares_total_supply));
    const yourTvl =
      poolShares == 0
        ? 0
        : Number(
            toPrecision(((Number(yourLp) * tvl) / poolShares).toString(), 2)
          );
    if (yourTvl) {
      setYourTvl(yourTvl.toString());
    }
  }
  function getYourApr() {
    if (!boostConfig) return '';
    const { affected_seeds } = boostConfig;
    const { seed_id } = seed;
    const user_seed = user_seeds_map[seed_id] || {};
    const love_user_seed = user_seeds_map[REF_VE_CONTRACT_ID];
    const base = affected_seeds[seed_id];
    const hasUserStaked = Object.keys(user_seed).length;
    const { free_amount } = love_user_seed || {};
    const userLoveAmount = toReadableNumber(LOVE_TOKEN_DECIMAL, free_amount);
    if (base && hasUserStaked) {
      let rate;
      if (+userLoveAmount < 1) {
        rate = '1';
      } else {
        rate = new BigNumber(1)
          .plus(Math.log(+userLoveAmount) / Math.log(base))
          .toFixed();
      }
      const apr = getActualTotalApr();
      let boostApr;
      if (apr) {
        boostApr = new BigNumber(apr).multipliedBy(rate);
      }
      if (boostApr && +boostApr > 0) {
        const r = +new BigNumber(boostApr).multipliedBy(100).toFixed();
        return toPrecision(r.toString(), 2) + '%';
      }
      return '';
    } else {
      return '';
    }
  }
  function getTotalApr() {
    let day24Volume = 0;
    day24Volume = +getPoolFeeApr(dayVolume);
    let apr = getActualTotalApr();
    if (apr == 0 && day24Volume == 0) {
      return '-';
    } else {
      apr = +new BigNumber(apr).multipliedBy(100).plus(day24Volume).toFixed();
      return toPrecision(apr.toString(), 2) + '%';
    }
  }
  function getPoolFeeApr(dayVolume: string) {
    let result = '0';
    if (dayVolume) {
      const { total_fee, tvl } = seed.pool;
      const revenu24h = (total_fee / 10000) * 0.8 * Number(dayVolume);
      if (tvl > 0 && revenu24h > 0) {
        const annualisedFeesPrct = ((revenu24h * 365) / tvl) * 100;
        const half_annualisedFeesPrct = annualisedFeesPrct / 2;
        result = toPrecision(half_annualisedFeesPrct.toString(), 2);
      }
    }
    return result;
  }
  function isPending() {
    let pending: boolean = true;
    const farms = seed.farmList;
    for (let i = 0; i < farms.length; i++) {
      if (farms[i].status != 'Created' && farms[i].status != 'Pending') {
        pending = false;
        break;
      }
    }
    return pending;
  }
  function getActualTotalApr() {
    const farms = seed.farmList;
    let apr = 0;
    const allPendingFarms = isPending();
    farms.forEach(function (item: FarmBoost) {
      const pendingFarm = item.status == 'Created' || item.status == 'Pending';
      if (allPendingFarms || (!allPendingFarms && !pendingFarm)) {
        apr = +new BigNumber(apr).plus(item.apr).toFixed();
      }
    });
    return apr;
  }
  function sortTokens(tokens: TokenMetadata[]) {
    tokens.sort((a: TokenMetadata, b: TokenMetadata) => {
      if (a.symbol === 'NEAR') return 1;
      if (b.symbol === 'NEAR') return -1;
      return 0;
    });
    return tokens;
  }
  function displayImgs() {
    const tokenList: any[] = [];
    (tokens || []).forEach((token: TokenMetadata) => {
      tokenList.push(
        <label
          key={token.id}
          className={`h-6 w-6 flex-shrink-0 rounded-full overflow-hidden border border-gradientFromHover bg-cardBg -ml-1.5`}
        >
          <img src={token.icon} className="w-full h-full"></img>
        </label>
      );
    });
    return tokenList;
  }

  function displaySymbols() {
    let result = '';
    pool.tokens_meta_data.forEach((token: TokenMetadata, index: number) => {
      const symbol = toRealSymbol(token.symbol);
      if (index == pool.tokens_meta_data.length - 1) {
        result += symbol;
      } else {
        result += symbol + '-';
      }
    });
    return result;
  }

  function getTotalStaked() {
    return Number(seedTvl) == 0
      ? '-'
      : `$${toInternationalCurrencySystem(seedTvl, 2)}`;
  }
  function getApr() {
    if (yourApr) {
      return yourApr;
    } else {
      return getTotalApr();
    }
  }
  function totalTvlPerWeekDisplay() {
    const farms = seed.farmList;
    const rewardTokenIconMap = {};
    let totalPrice = 0;
    farms.forEach((farm: FarmBoost) => {
      const { id, decimals, icon } = farm.token_meta_data;
      const { daily_reward } = farm.terms;
      rewardTokenIconMap[id] = icon;
      const tokenPrice = tokenPriceList[id]?.price;
      if (tokenPrice && tokenPrice != 'N/A') {
        const tokenAmount = toReadableNumber(decimals, daily_reward);
        totalPrice += +new BigNumber(tokenAmount)
          .multipliedBy(tokenPrice)
          .toFixed();
      }
    });
    totalPrice = +new BigNumber(totalPrice).multipliedBy(7).toFixed();
    const totalPriceDisplay =
      totalPrice == 0
        ? '-'
        : '$' + toInternationalCurrencySystem(totalPrice.toString(), 2);
    return (
      <div className="flex items-center">
        <div className="flex items-center">
          {Object.values(rewardTokenIconMap).map(
            (icon: string, index: number) => {
              return (
                <img
                  src={icon}
                  key={index}
                  className={`h-6 w-6 flex-shrink-0 rounded-full border border-greenColor ${
                    index != 0 ? '-ml-1.5' : ''
                  }`}
                ></img>
              );
            }
          )}
        </div>
        <span className="ml-2">{totalPriceDisplay}</span>
      </div>
    );
  }
  function showLpPower() {
    const power = getUserPower();
    const powerBig = new BigNumber(power);
    if (powerBig.isEqualTo(0)) {
      return <label className="opacity-50">{isSignedIn ? 0.0 : '-'}</label>;
    } else if (powerBig.isLessThan('0.001')) {
      return '<0.001';
    } else {
      return formatWithCommas(toPrecision(power, 3));
    }
  }
  function getUserPower() {
    if (REF_VE_CONTRACT_ID && !boostConfig) return '';
    let realRadio;
    const { affected_seeds = {} } = boostConfig || {};
    const { seed_id } = seed;
    const love_user_seed = user_seeds_map[REF_VE_CONTRACT_ID];
    const base = affected_seeds[seed_id];
    if (base && loveSeed) {
      const { free_amount = 0, locked_amount = 0 } = love_user_seed || {};
      const totalStakeLoveAmount = toReadableNumber(
        LOVE_TOKEN_DECIMAL,
        new BigNumber(free_amount).plus(locked_amount).toFixed()
      );
      if (+totalStakeLoveAmount > 0) {
        if (+totalStakeLoveAmount < 1) {
          realRadio = 1;
        } else {
          realRadio = new BigNumber(1)
            .plus(Math.log(+totalStakeLoveAmount) / Math.log(base))
            .toFixed();
        }
      }
    }
    const powerBig = new BigNumber(+(realRadio || 1))
      .multipliedBy(free_amount)
      .plus(x_locked_amount);
    const power = toReadableNumber(DECIMALS, powerBig.toFixed(0).toString());
    return power;
  }
  function getUserLpPercent() {
    let result = '(-%)';
    const { total_seed_power } = seed;
    const userPower = getUserPower();
    if (+total_seed_power && +userPower) {
      const totalAmount = toReadableNumber(DECIMALS, total_seed_power);
      const percent = new BigNumber(userPower)
        .dividedBy(totalAmount)
        .multipliedBy(100);
      if (percent.isLessThan('0.001')) {
        result = '(<0.001%)';
      } else {
        result = `(${toPrecision(percent.toFixed().toString(), 3)}%)`;
      }
    }
    return result;
  }
  function getYourPowerValue() {
    if (Number(yourTvl) == 0) {
      return '-';
    } else {
      return '~$' + toInternationalCurrencySystem(yourTvl, 2);
    }
  }
  function getTotalUnclaimedRewards() {
    let totalPrice = 0;
    const tempFarms = {};
    seed.farmList.forEach((farm: FarmBoost) => {
      tempFarms[farm.terms.reward_token] = true;
    });
    const unclaimed = user_unclaimed_map[seed_id] || {};
    const unClaimedTokenIds = Object.keys(unclaimed);
    unClaimedTokenIds?.forEach((tokenId: string) => {
      const token: TokenMetadata = user_unclaimed_token_meta_map[tokenId];
      if (token) {
        // total price
        const { id, decimals, icon } = token;
        const amount = toReadableNumber(decimals, unclaimed[id] || '0');
        const tokenPrice = tokenPriceList[id]?.price;
        if (tokenPrice && tokenPrice != 'N/A') {
          totalPrice += +amount * tokenPrice;
        }
      }
    });
    let res;
    if (totalPrice == 0) {
      res = {
        worth: <>{isSignedIn ? '$0' : '-'}</>,
        showClaimButton: false,
      };
    } else if (new BigNumber('0.01').isGreaterThan(totalPrice)) {
      res = {
        worth: '<$0.01',
        showClaimButton: true,
      };
    } else {
      res = {
        worth: `$${toInternationalCurrencySystem(totalPrice.toString(), 2)}`,
        showClaimButton: true,
      };
    }
    setUnclaimedRewardsData(res);
  }
  function openUnStakeModalVisible(unStakeType: string) {
    setUnStakeModalVisible(true);
  }
  function closeUnStakeModalVisible() {
    setUnStakeModalVisible(false);
  }
  function openStakeModalVisible(stakeType: string) {
    setStakeModalVisible(true);
  }
  function closeStakeModalVisible() {
    setStakeModalVisible(false);
  }
  function claimReward() {
    if (claimLoading) return;
    setClaimLoading(true);
    claimRewardBySeed_boost(seed.seed_id)
      .then(() => {
        window.location.reload();
      })
      .catch(() => {
        setClaimLoading(false);
      });
  }
  const isEnded = seed.farmList[0].status == 'Ended';
  const needForbidden =
    (FARM_BLACK_LIST_V2 || []).indexOf(pool.id.toString()) > -1;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="mt-2.5 border border-cardBg rounded-2xl overflow-hidden"
    >
      <div className="grid grid-cols-12 bg-positionLineBgColor h-14 pl-4 pr-8">
        <div className="flex items-center col-span-2">
          {displayImgs()}
          <span className="text-sm text-white gotham_bold ml-2.5">
            {displaySymbols()}
          </span>
        </div>
        <div className="flex items-center col-span-2">{getTotalStaked()}</div>
        <div className="flex items-center col-span-1">{getApr()}</div>
        <div className="flex items-center col-span-3">
          {totalTvlPerWeekDisplay()}
        </div>
        <div className="flex items-center col-span-2 justify-self-end">
          <div className="flex flex-col items-end">
            <span className="text-sm text-white">
              {showLpPower()}
              {getUserLpPercent()}
            </span>
            <span className="text-xs text-limitOrderInputColor mt-1.5">
              {getYourPowerValue()}
            </span>
          </div>
        </div>
        <div className="flex items-center col-span-2 justify-self-end">
          {unclaimedRewardsData?.worth}
        </div>
      </div>
      <div
        className={`items-center justify-end bg-positionLineHoverBgColor h-16 px-7 ${
          hover ? 'flex' : 'hidden'
        }`}
      >
        <GradientButton
          onClick={() => {
            openStakeModalVisible('free');
          }}
          color="#fff"
          disabled={needForbidden ? true : false}
          btnClassName={needForbidden ? 'cursor-not-allowed' : ''}
          minWidth="5rem"
          borderRadius="6px"
          className={`h-8 text-center text-sm text-white focus:outline-none ${
            needForbidden ? 'opacity-40' : ''
          } ${isEnded ? 'hidden' : ''}`}
        >
          <FormattedMessage id="stake"></FormattedMessage>
        </GradientButton>
        <OprationButton
          onClick={() => {
            openUnStakeModalVisible('free');
          }}
          color="#fff"
          minWidth="5rem"
          borderRadius="6px"
          className={`ml-2.5 flex items-center justify-center h-8 px-0.5 text-center text-sm text-white focus:outline-none font-semibold bg-bgGreyDefault hover:bg-bgGreyHover ${
            Number(freeAmount) > 0 ? '' : 'hidden'
          }`}
        >
          <FormattedMessage id="unstake" defaultMessage="Unstake" />
        </OprationButton>
        {unclaimedRewardsData?.showClaimButton ? (
          <div
            className="flex justify-between items-center ml-2.5"
            style={{ minWidth: '5rem' }}
          >
            <span
              className="flex items-center justify-center bg-deepBlue hover:bg-deepBlueHover rounded-md text-sm text-white h-8 w-20 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                claimReward();
              }}
            >
              <ButtonTextWrapper
                loading={claimLoading}
                Text={() => <FormattedMessage id="claim" />}
              />
            </span>
          </div>
        ) : null}
      </div>
      {stakeModalVisible ? (
        <StakeModal
          title="stake"
          isOpen={stakeModalVisible}
          detailData={seed}
          onRequestClose={closeStakeModalVisible}
          lpBalance={lpBalance}
          stakeType="free"
          serverTime={serverTime}
          tokenPriceList={tokenPriceList}
          loveSeed={loveSeed}
          boostConfig={boostConfig}
          user_seeds_map={user_seeds_map}
          user_unclaimed_map={user_unclaimed_map}
          user_unclaimed_token_meta_map={user_unclaimed_token_meta_map}
        ></StakeModal>
      ) : null}
      {unStakeModalVisible ? (
        <UnStakeModal
          title={'unstake'}
          isOpen={unStakeModalVisible}
          titleIcon={''}
          detailData={seed}
          onRequestClose={closeUnStakeModalVisible}
          unStakeType="free"
          serverTime={serverTime}
          tokenPriceList={tokenPriceList}
          user_seeds_map={user_seeds_map}
          user_unclaimed_map={user_unclaimed_map}
          user_unclaimed_token_meta_map={user_unclaimed_token_meta_map}
        ></UnStakeModal>
      ) : null}
    </div>
  );
}
