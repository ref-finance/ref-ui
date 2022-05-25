import React, { useEffect, useRef, useState, useContext, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import SelectUi from '~components/farm/SelectUi';
import {
  CalcIcon,
  UpArrowIcon,
  ArrowDownIcon,
  SearchIcon,
} from '~components/icon/FarmBoost';
import {
  GradientButton,
  ButtonTextWrapper,
  ConnectToNearButton,
} from '~components/button/Button';
import {
  Checkbox,
  CheckboxSelected,
  NoDataIcon,
  ArrowDown,
} from '~components/icon';
import QuestionMark from '~components/farm/QuestionMark';
import ReactTooltip from 'react-tooltip';
import CalcModelBooster from '~components/farm/CalcModelBooster';
import {
  classificationOfCoins_key,
  farmClassification,
  list_seeds_info,
  list_seed_farms,
  list_farmer_seeds,
  get_unclaimed_rewards,
  get_unWithDraw_rewards,
  Seed,
  FarmBoost,
  withdrawAllReward_boost,
  claimRewardBySeed_boost,
} from '~services/farm';
import { getTokenPriceList } from '~services/indexer';
import { getCurrentWallet, WalletContext } from '../../utils/sender-wallet';
import getConfig from '../../services/config';
import { PoolRPCView } from '../../services/api';
import { getPoolsByIds } from '../../services/indexer';
import {
  LP_TOKEN_DECIMALS,
  LP_STABLE_TOKEN_DECIMALS,
} from '../../services/m-token';
import {
  toPrecision,
  toReadableNumber,
  toNonDivisibleNumber,
  toInternationalCurrencySystem,
  formatWithCommas,
} from '../../utils/numbers';
import { ftGetTokenMetadata } from '../../services/ft-contract';
import { BigNumber } from 'bignumber.js';
import { useTokens } from '~state/token';
import { toRealSymbol } from '~utils/token';
import { isMobile } from '~utils/device';
import moment from 'moment';
import { useHistory, useLocation } from 'react-router-dom';
import Alert from '~components/alert/Alert';
import Loading, { BeatLoading } from '~components/layout/Loading';
import { TokenMetadata } from '../../services/ft-contract';
import { getPrice } from '~services/xref';
const { STABLE_POOL_IDS, REF_TOKEN_ID, XREF_TOKEN_ID } = getConfig();
const DECIMALS_XREF_REF_TRANSTER = 8;
export default function FarmsHome(props: any) {
  let [user_unWithdraw_rewards, set_user_unWithdraw_rewards] = useState<
    Record<string, string>
  >({});
  let [tokenPriceList, setTokenPriceList] = useState<any>({});
  let [farm_display_List, set_farm_display_List] = useState<any>([]);
  const [
    farm_classification_display_list,
    set_farm_classification_display_list,
  ] = useState({});
  let [farm_display_ended_List, set_farm_display_ended_List] = useState<any>(
    []
  );

  const [showEndedFarmList, setShowEndedFarmList] = useState(
    localStorage.getItem('endedfarmShow') == '1' ? true : false
  );
  let [homePageLoading, setHomePageLoading] = useState(
    getUrlParams() ? false : true
  );
  const intl = useIntl();
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const [noData, setNoData] = useState(false);
  const [count, setCount] = useState(0);
  const searchRef = useRef(null);
  const refreshTime = 120000;
  const sortList = {
    tvl: intl.formatMessage({ id: 'tvl' }),
    apr: intl.formatMessage({ id: 'apr' }),
  };
  const statusList = {
    live: intl.formatMessage({ id: 'all_farm' }),
    my: intl.formatMessage({ id: 'my_farms' }),
  };
  const coinList = { all: intl.formatMessage({ id: 'allOption' }) };
  classificationOfCoins_key.forEach((key) => {
    coinList[key] = intl.formatMessage({ id: key });
  });
  const farmV2Status: string = localStorage.getItem('farmV2Status');
  let [sort, setSort] = useState('tvl');
  let [status, setStatus] = useState(
    !isSignedIn && farmV2Status == 'my' ? 'live' : farmV2Status || 'live'
  );
  const [keyWords, setKeyWords] = useState('');
  const searchData = { sort, status, keyWords };
  const { getDetailData } = props;
  const location = useLocation();
  const history = useHistory();
  /** search area options end **/
  useEffect(() => {
    init();
    get_user_unWithDraw_rewards();
  }, [isSignedIn]);

  useEffect(() => {
    if (count > 0) {
      init();
    }
    const intervalId = setInterval(() => {
      setCount(count + 1);
    }, refreshTime);
    return () => {
      clearInterval(intervalId);
    };
  }, [count]);
  useEffect(() => {
    let search = false;
    const searchParams = new URLSearchParams(location.search);
    const sort_from_url = searchParams.get('sort');
    const status_from_url = searchParams.get('status');
    if (sort_from_url && sort_from_url !== sort) {
      setSort(sort_from_url);
      searchData.sort = sort_from_url;
      search = true;
    }
    if (status_from_url && status_from_url !== status) {
      setStatus(status_from_url);
      searchData.status = status_from_url;
      search = true;
    }
    if (search) {
      searchByCondition();
    }
  }, [location.search]);
  async function init() {
    // get all seeds
    const list_seeds = await list_seeds_info();
    const promiseList: Promise<any>[] = [];
    list_seeds.forEach((seed: Seed) => {
      const { seed_id } = seed;
      promiseList.push(list_seed_farms(seed_id));
    });
    // get all farms
    const list_farm: FarmBoost[] = await Promise.all(promiseList);
    // get all pools and prices
    const priceAndPool = await getPricesAndPools(list_seeds);
    const [tokenPriceList, pools] = priceAndPool;
    // get user seeds
    let list_user_seeds = {};
    if (isSignedIn) {
      list_user_seeds = await list_farmer_seeds();
    }
    setTokenPriceList(tokenPriceList);
    /** get xref price start */
    const xrefPrice = await getPrice();
    const xrefToRefRate = toReadableNumber(
      DECIMALS_XREF_REF_TRANSTER,
      xrefPrice
    );
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
    /** get xref price end */
    getFarmDataList({
      list_seeds,
      list_farm,
      tokenPriceList,
      pools,
      list_user_seeds,
    });
  }
  async function getFarmDataList(initData: any) {
    const { list_seeds, list_farm, tokenPriceList, pools, list_user_seeds } =
      initData;
    const new_list_seeds: any[] = [];
    list_farm.forEach((farmList: FarmBoost[], index: number) => {
      if (farmList?.length > 0) {
        new_list_seeds.push({
          ...list_seeds[index],
          farmList,
        });
      }
    });
    const promise_new_list_seeds = new_list_seeds.map(async (newSeed: Seed) => {
      const { seed_id, farmList, total_seed_amount } = newSeed;
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
      const poolShares = Number(
        toReadableNumber(DECIMALS, shares_total_supply)
      );
      const seedTvl =
        poolShares == 0
          ? 0
          : Number(
              toPrecision(
                ((Number(seedTotalStakedAmount) * tvl) / poolShares).toString(),
                1
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
          seedTvl == 0
            ? 0
            : (Number(readableNumber) * 360 * reward_token_price) / seedTvl;
        // farm.apr = toPrecision(apr.toString(), 2);
        farm.apr = apr.toString();
      });
      const user_seed = list_user_seeds[seed_id];
      let unclaimed;
      if (user_seed) {
        unclaimed = await get_unclaimed_rewards(seed_id);
      }
      let unclaimed_token_meta_datas = {};
      if (unclaimed) {
        const tokens = Object.keys(unclaimed);
        const unclaimedTokens = tokens.map(async (tokenId: string) => {
          const tokenMetadata = await ftGetTokenMetadata(tokenId);
          return tokenMetadata;
        });
        const tempArr = await Promise.all(unclaimedTokens);
        tempArr.forEach((token: TokenMetadata) => {
          unclaimed_token_meta_datas[token.id] = token;
        });
      }
      newSeed.pool = pool;
      newSeed.user_seed = user_seed || {};
      newSeed.unclaimed = unclaimed || {};
      newSeed.unclaimed_token_meta_datas = unclaimed_token_meta_datas;
      newSeed.seedTvl = seedTvl?.toString() || '0';
    });
    await Promise.all(promise_new_list_seeds);
    // split ended farms
    const ended_split_list_seeds: Seed[] = [];
    new_list_seeds.forEach((seed: Seed) => {
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
    const total_list_seeds = new_list_seeds.concat(ended_split_list_seeds);
    farm_display_List = total_list_seeds;
    farm_display_ended_List = getAllEndedFarms();
    set_farm_display_List(farm_display_List);
    set_farm_display_ended_List(farm_display_ended_List);
    getSpecialSeed({ tokenPriceList, farm_display_List });
    searchByCondition();
  }
  function getSpecialSeed({
    tokenPriceList,
    farm_display_List,
  }: {
    tokenPriceList: any;
    farm_display_List: Seed[];
  }) {
    const paramStr = getUrlParams() || '';
    if (paramStr) {
      const idArr = paramStr.split('-');
      const poolId = idArr[0];
      const farmsStatus = idArr[1];
      const targetFarms = farm_display_List.find((seed: Seed) => {
        const { seed_id, farmList } = seed;
        const status = farmList[0].status;
        const id = getPoolIdBySeedId(seed_id);
        if (farmsStatus == 'r' && status != 'Ended' && poolId == id)
          return true;
        if (farmsStatus == 'e' && status == 'Ended' && poolId == id)
          return true;
      });
      if (!targetFarms) {
        history.replace('/farmsBoost');
      } else {
        getDetailData(targetFarms, tokenPriceList);
      }
    }
  }
  function getAllEndedFarms() {
    const allEndedFarms = farm_display_List.filter((seed: Seed) => {
      if (seed.farmList[0].status == 'Ended') return true;
    });
    return JSON.parse(JSON.stringify(allEndedFarms));
  }
  function getUrlParams() {
    const pathArr = window.location.pathname.split('/');
    const id = pathArr[2] || '';
    return id;
  }
  async function get_user_unWithDraw_rewards() {
    if (isSignedIn) {
      const userRewardList = await get_unWithDraw_rewards();
      set_user_unWithdraw_rewards(userRewardList);
    }
  }
  async function getPricesAndPools(list_seeds: Record<string, any>) {
    let pool_ids = list_seeds.map((seed: Seed) => {
      const { seed_id } = seed;
      return getPoolIdBySeedId(seed_id);
    });
    pool_ids = Array.from(new Set(pool_ids)).sort();
    const cachePriceMapStr = localStorage.getItem('priceMap');
    const cachePoolListStr = localStorage.getItem('poolList');
    let result;
    if (cachePriceMapStr && cachePriceMapStr) {
      const cachePoolList = JSON.parse(cachePoolListStr);
      const cachePriceMap = JSON.parse(cachePriceMapStr);
      const cachePoolIds: string | number[] = [];
      cachePoolList.forEach((pool: any) => {
        cachePoolIds.push(pool.id);
      });
      const cachePoolIdStr = cachePoolIds.sort().join('');
      const pool_ids_Str = pool_ids.join('');
      if (cachePoolIdStr == pool_ids_Str) {
        result = [cachePriceMap, cachePoolList];
        getPricesAndPoolsFromServer(pool_ids);
      } else {
        result = await getPricesAndPoolsFromServer(pool_ids);
      }
    } else {
      result = await getPricesAndPoolsFromServer(pool_ids);
    }
    return result;
  }
  async function getPricesAndPoolsFromServer(pool_ids: string[]) {
    const requestList = [getTokenPriceList(), getPoolsByIds({ pool_ids })];
    const result = await Promise.all(requestList);
    const [tokenPriceList, pools] = result;
    localStorage.setItem('priceMap', JSON.stringify(tokenPriceList));
    localStorage.setItem('poolList', JSON.stringify(pools));
    return result;
  }
  function changeSort(sortKey: any) {
    searchData.sort = sortKey;
    setSort(sortKey);
    searchByCondition();
  }
  function changeStatus(statusSelectOption: string) {
    localStorage.setItem('farmV2Status', statusSelectOption);
    setStatus(statusSelectOption);
    searchData.status = statusSelectOption;
    searchByCondition();
  }
  function searchByCondition() {
    farm_display_List = farm_display_List.sort();
    farm_display_ended_List = farm_display_ended_List.sort();
    let noDataEnd = true,
      noDataLive = true,
      noData = true;
    farm_display_List.length && (noData = true);
    const commonSeedFarms = mergeCommonSeedsFarms();
    const { status, keyWords, sort } = searchData;
    // filter
    farm_display_List.forEach((seed: Seed) => {
      const { user_seed, pool, seed_id, farmList, unclaimed } = seed;
      const isEnd = farmList[0].status == 'Ended';
      const userStaked = Object.keys(user_seed).length > 0;
      const userUnclaimed = Object.keys(unclaimed).length > 0;
      const { token_symbols } = pool;
      let condition1, condition2;
      if (status == 'my') {
        if (userStaked) {
          const commonSeedFarmList = commonSeedFarms[seed_id] || [];
          if (commonSeedFarmList.length == 2 && isEnd) {
            condition1 = false;
          } else {
            condition1 = true;
          }
        }
      } else if (status == 'live') {
        condition1 = !isEnd;
      }
      if (keyWords) {
        for (let i = 0; i < token_symbols.length; i++) {
          if (
            token_symbols[i].toLowerCase().indexOf(keyWords.toLowerCase()) > -1
          ) {
            condition2 = true;
            break;
          } else {
            condition2 = false;
          }
        }
      } else {
        condition2 = true;
      }
      if (condition1 && condition2) {
        seed.hidden = false;
        noDataLive = false;
      } else {
        seed.hidden = true;
      }
    });
    farm_display_ended_List.forEach((seed: Seed) => {
      const { pool } = seed;
      const { token_symbols } = pool;
      let condition = true;
      if (keyWords) {
        for (let i = 0; i < token_symbols.length; i++) {
          if (
            token_symbols[i].toLowerCase().indexOf(keyWords.toLowerCase()) > -1
          ) {
            condition = true;
            break;
          } else {
            condition = false;
          }
        }
      }
      if (condition) {
        seed.hidden = false;
        noDataEnd = false;
      } else {
        seed.hidden = true;
      }
    });
    // sort
    if (sort == 'apr') {
      farm_display_List.sort((item1: Seed, item2: Seed) => {
        const item1Apr = getTotalAprForSeed(JSON.parse(JSON.stringify(item1)));
        const item2Apr = getTotalAprForSeed(JSON.parse(JSON.stringify(item2)));
        return Number(item2Apr) - Number(item1Apr);
      });
      farm_display_ended_List.sort((item1: Seed, item2: Seed) => {
        const item1Apr = getTotalAprForSeed(JSON.parse(JSON.stringify(item1)));
        const item2Apr = getTotalAprForSeed(JSON.parse(JSON.stringify(item2)));
        return Number(item2Apr) - Number(item1Apr);
      });
    } else if (sort == 'tvl') {
      farm_display_List.sort((item1: Seed, item2: Seed) => {
        return Number(item2.seedTvl) - Number(item1.seedTvl);
      });
      farm_display_ended_List.sort((item1: Seed, item2: Seed) => {
        return Number(item2.seedTvl) - Number(item1.seedTvl);
      });
    }
    // classify
    const specified_display_classification = {};
    Object.keys(farmClassification).forEach((key: string) => {
      specified_display_classification[key] = [];
    });
    specified_display_classification['otherPool'] = [];
    farm_display_List.forEach((seed: Seed) => {
      const poolId = seed.pool.id;
      const farmClassificationTitle = Object.keys(farmClassification);
      let findout = false;
      for (let i = 0; i < farmClassificationTitle.length; i++) {
        const key = farmClassificationTitle[i];
        const poolIds = farmClassification[key];
        if (poolIds.indexOf(poolId) > -1) {
          specified_display_classification[key].push(seed);
          findout = true;
          break;
        }
      }
      if (!findout) {
        specified_display_classification['otherPool'].push(seed);
      }
    });
    if (status == 'live') {
      setNoData(noDataEnd && noDataLive);
    } else {
      setNoData(noDataLive);
    }
    setHomePageLoading(false);
    set_farm_display_List(farm_display_List);
    set_farm_display_ended_List(Array.from(farm_display_ended_List));
    set_farm_classification_display_list(specified_display_classification);
    if (keyWords) {
      setShowEndedFarmList(true);
    } else {
      setShowEndedFarmList(
        localStorage.getItem('endedfarmShow') == '1' ? true : false
      );
    }
  }
  function getTotalAprForSeed(seed: Seed) {
    const farms = seed.farmList;
    let apr = 0;
    const allPendingFarms = isPending(seed);
    farms.forEach(function (item: FarmBoost) {
      const pendingFarm = item.status == 'Created' || item.status == 'Pending';
      if (allPendingFarms || (!allPendingFarms && !pendingFarm)) {
        apr += Number(item.apr);
      }
    });
    return apr;
  }
  function isPending(seed: Seed) {
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
  function switchEndedFarmListDisplayStatus() {
    const current = !showEndedFarmList;
    localStorage.setItem('endedfarmShow', current ? '1' : '0');
    setShowEndedFarmList(current);
  }
  function searchByKeyWords(value: string) {
    setKeyWords(value);
    searchData.keyWords = value;
    searchByCondition();
  }
  function getFarmVisibleLength() {
    const list = farm_display_ended_List.filter((seed: Seed) => {
      if (!seed.hidden) return true;
    });
    return list.length;
  }
  const endFarmLength = useMemo(() => {
    return getFarmVisibleLength();
  }, [farm_display_ended_List]);
  const isMobileSite = isMobile();
  return (
    <div
      className={`relative lg:w-1/3 xs:w-full md:w-full xs:px-5 md:px-5 m-auto ${
        getUrlParams() ? 'hidden' : ''
      }`}
      style={{ minWidth: isMobileSite ? 'auto' : '31rem' }}
    >
      <div className="title flex justify-between items-center text-3xl text-white mb-5 xs:-mt-4 md:-mt-4">
        <FormattedMessage id="farms"></FormattedMessage>
        <div className="flex items-center justify-between h-7 rounded-2xl bg-farmSbg p-0.5">
          <span
            onClick={() => {
              history.push('/farms');
            }}
            className="flex items-center justify-center text-sm text-farmText cursor-pointer px-2 h-full  rounded-2xl"
          >
            V1-Legacy
          </span>
          <span className="flex items-center justify-center rounded-2xl text-sm text-chartBg cursor-pointer px-3 h-full bg-farmSearch">
            V2-New
          </span>
        </div>
      </div>
      {user_unWithdraw_rewards &&
      Object.keys(user_unWithdraw_rewards).length > 0 ? (
        <WithDrawBox
          userRewardList={user_unWithdraw_rewards}
          tokenPriceList={tokenPriceList}
          farmDisplayList={farm_display_List}
        ></WithDrawBox>
      ) : null}
      <div className="searchArea">
        <div className="flex items-center justify-between px-4 h-8 py-1 bg-searchBgColor rounded-lg mb-3.5">
          <input
            ref={searchRef}
            type="text"
            className="h-full text-sm text-white"
            onWheel={() => searchRef.current.blur()}
            onChange={({ target }) => searchByKeyWords(target.value)}
            placeholder="Search farms by token..."
          ></input>
          <SearchIcon></SearchIcon>
        </div>
        <div className="flex justify-between items-center mb-7">
          <div className="flex justify-between items-center w-56 rounded-xl bg-cardBg p-1">
            {Object.keys(statusList).map((item: string) => {
              return (
                <span
                  onClick={() => {
                    changeStatus(item);
                  }}
                  key={item}
                  className={`flex flex-grow w-12 justify-center items-center h-8 rounded-lg text-sm cursor-pointer ${
                    status == item
                      ? 'bg-farmV2TabColor text-white'
                      : 'bg-cardBg text-primaryText'
                  }`}
                >
                  {statusList[item]}
                </span>
              );
            })}
          </div>
          <div className="flex items-center">
            <label className="text-farmText text-xs mr-2 whitespace-nowrap">
              <FormattedMessage id="sort_by" defaultMessage="Sort by" />
            </label>
            {Object.keys(sortList).map((item, index) => {
              const value = sortList[item];
              return (
                <div
                  className={`flex items-center justify-between rounded-lg text-primaryText px-3 py-0.5 ml-2 cursor-pointer text-xs ${
                    sort == item ? 'bg-cardBg' : 'opacity-50'
                  }`}
                  key={index}
                  onClick={() => {
                    changeSort(item);
                  }}
                >
                  {value}
                  <span className="ml-1.5">
                    <ArrowDown></ArrowDown>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {homePageLoading && !getUrlParams() ? (
        <Loading></Loading>
      ) : (
        <div className="farmListArea">
          {noData ? (
            <div className="flex flex-col w-full justify-center items-center mt-20 xs:mt-8 md:mt-8">
              <NoDataIcon />
              <span className="text-farmText text-base mt-4 text-center w-48">
                <FormattedMessage id="no_result"></FormattedMessage>
              </span>
            </div>
          ) : null}
          {Object.keys(farm_classification_display_list).map(
            (classificationTitle: string) => {
              const classification_farm_list =
                farm_classification_display_list[classificationTitle];
              let isNoData = true;
              for (let i = 0; i < classification_farm_list.length; i++) {
                const seed = classification_farm_list[i];
                if (!seed.hidden) {
                  isNoData = false;
                  break;
                }
              }
              if (isNoData) return null;
              return (
                <div key={classificationTitle} className="mt-10">
                  <p className="text-white text-lg mb-4">
                    <FormattedMessage
                      id={classificationTitle}
                    ></FormattedMessage>
                  </p>
                  {classification_farm_list.map((seed: Seed, index: number) => {
                    return (
                      <div
                        key={seed.seed_id + index}
                        className={seed.hidden ? 'hidden' : ''}
                      >
                        <FarmView
                          seed={seed}
                          tokenPriceList={tokenPriceList}
                          getDetailData={getDetailData}
                        ></FarmView>
                      </div>
                    );
                  })}
                </div>
              );
            }
          )}
          <div
            className={`mt-10 ${
              endFarmLength > 0 && showEndedFarmList && status == 'live'
                ? ''
                : 'hidden'
            }`}
          >
            <p className="text-white text-lg mb-4">
              <FormattedMessage id="endedPool"></FormattedMessage>
            </p>
            {farm_display_ended_List.map((seed: Seed, index: number) => {
              return (
                <div
                  key={seed.seed_id + index}
                  className={seed.hidden ? 'hidden' : ''}
                >
                  <FarmView
                    seed={seed}
                    tokenPriceList={tokenPriceList}
                    getDetailData={getDetailData}
                  ></FarmView>
                </div>
              );
            })}
          </div>
          {endFarmLength > 0 && status == 'live' ? (
            <div
              onClick={switchEndedFarmListDisplayStatus}
              className="flex items-center text-xs text-farmText cursor-pointer"
            >
              <ArrowDownIcon
                className={showEndedFarmList ? 'transform rotate-180' : ''}
              ></ArrowDownIcon>
              <a className="text-xs text-greenColor mx-1">
                {showEndedFarmList ? 'Hidden' : 'Show'}
              </a>
              the {endFarmLength} ended farms
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
function FarmView(props: {
  seed: Seed;
  tokenPriceList: Record<string, any>;
  getDetailData: any;
}) {
  const { seed, tokenPriceList, getDetailData } = props;
  const { pool, seedTvl, total_seed_amount, user_seed } = seed;
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const [claimLoading, setClaimLoading] = useState(false);
  const [calcVisible, setCalcVisible] = useState(false);
  const [error, setError] = useState<Error>();
  const tokens = seed.pool.tokens_meta_data;
  const unClaimedTokens = useTokens(Object.keys(seed.unclaimed || {}));
  const history = useHistory();
  const intl = useIntl();

  function getTotalApr() {
    const farms = seed.farmList;
    let apr = 0;
    const allPendingFarms = isPending();
    farms.forEach(function (item: FarmBoost) {
      const pendingFarm = item.status == 'Created' || item.status == 'Pending';
      if (allPendingFarms || (!allPendingFarms && !pendingFarm)) {
        apr = +new BigNumber(apr).plus(item.apr).toFixed();
      }
    });
    if (apr == 0) {
      return '-';
    } else {
      apr = +new BigNumber(apr).multipliedBy(100).toFixed();
      return toPrecision(apr.toString(), 2) + '%';
    }
  }
  function getAllRewardsSymbols() {
    const tempMap = {};
    seed.farmList.forEach((farm: FarmBoost) => {
      const { token_meta_data } = farm;
      const { icon, id } = token_meta_data;
      tempMap[id] = icon;
    });
    return Object.entries(tempMap);
  }
  function getTotalUnclaimedRewards() {
    let totalPrice = 0;
    unClaimedTokens?.forEach((token: TokenMetadata) => {
      const { id, decimals } = token;
      const amount = toReadableNumber(decimals, seed.unclaimed[id] || '0');
      const tokenPrice = tokenPriceList[id].price;
      if (tokenPrice && tokenPrice != 'N/A') {
        totalPrice += +amount * tokenPrice;
      }
    });
    if (totalPrice == 0) {
      return '-';
    } else if (new BigNumber('0.01').isGreaterThan(totalPrice)) {
      return '<$0.01';
    } else {
      return `$${toInternationalCurrencySystem(totalPrice.toString(), 2)}`;
    }
  }
  function getAprTip() {
    const tempList = seed.farmList;
    const lastList: any[] = [];
    const pending_farms: FarmBoost[] = [];
    const no_pending_farms: FarmBoost[] = [];
    tempList.forEach((farm: FarmBoost) => {
      if (farm.status == 'Created') {
        pending_farms.push(farm);
      } else {
        no_pending_farms.push(farm);
      }
    });
    if (pending_farms.length > 0) {
      pending_farms.forEach((farm: FarmBoost) => {
        lastList.push({
          rewardToken: farm.token_meta_data,
          apr: farm.apr,
          startTime: farm.terms.start_at,
          pending: true,
        });
      });
    }
    if (no_pending_farms.length > 0) {
      const mergedFarms = mergeCommonRewardsFarms(
        JSON.parse(JSON.stringify(no_pending_farms))
      );
      mergedFarms.forEach((farm: FarmBoost) => {
        lastList.push({
          rewardToken: farm.token_meta_data,
          apr: new BigNumber(farm.apr || 0)
            .multipliedBy(100)
            .toFixed()
            .toString(),
        });
      });
    }
    // show last display string
    let result: string = '';
    lastList.forEach((item: any) => {
      const { rewardToken, apr, pending, startTime } = item;
      const token = rewardToken;
      let itemHtml = '';
      if (pending) {
        const startDate = moment.unix(startTime).format('YYYY-MM-DD');
        const txt = intl.formatMessage({ id: 'start' });
        itemHtml = `<div class="flex justify-between items-center h-8">
          <img class="w-5 h-5 rounded-full mr-7" style="filter: grayscale(100%)" src="${
            token.icon
          }"/>
          <div class="flex flex-col items-end">
            <label class="text-xs text-farmText">${
              (apr == 0 ? '-' : formatWithCommas(toPrecision(apr, 2))) + '%'
            }</label>
            <label class="text-xs text-farmText">${txt}: ${startDate}</label>
          </div>
      </div>`;
      } else {
        itemHtml = `<div class="flex justify-between items-center h-8">
          <img class="w-5 h-5 rounded-full mr-7" src="${token.icon}"/>
          <label class="text-xs text-navHighLightText">${
            (apr == 0 ? '-' : formatWithCommas(toPrecision(apr, 2))) + '%'
          }</label>
      </div>`;
      }
      result += itemHtml;
    });
    return result;
  }
  function getUnClaimTip() {
    let resultTip = '';
    const { farmList, unclaimed_token_meta_datas } = seed;
    const tokens = Object.values(unclaimed_token_meta_datas);
    const tempFarms = {};
    farmList.forEach((farm: FarmBoost) => {
      tempFarms[farm.terms.reward_token] = true;
    });
    tokens?.forEach((token: TokenMetadata) => {
      // total price
      const { id, decimals, icon } = token;
      const amount = toReadableNumber(decimals, seed.unclaimed[id] || '0');
      // rewards number
      let displayNum = '';
      if (new BigNumber('0').isEqualTo(amount)) {
        displayNum = '-';
      } else if (new BigNumber('0.001').isGreaterThan(amount)) {
        displayNum = '<0.001';
      } else {
        displayNum = new BigNumber(amount).toFixed(3, 1);
      }
      const txt = intl.formatMessage({ id: 'ended_search' });
      const itemHtml = `<div class="flex justify-between items-center h-8 active">
          <img class="w-5 h-5 rounded-full mr-7" src="${icon}"/>
            <div class="flex flex-col items-end text-xs text-navHighLightText">
            ${formatWithCommas(displayNum)}
            ${
              tempFarms[id]
                ? ''
                : `<span class="text-farmText text-xs">${txt}</span>`
            }
          </div>
        </div>`;
      resultTip += itemHtml;
    });
    return resultTip;
  }
  function getRewardsPerWeekTip() {
    const tempList: FarmBoost[] = seed.farmList;
    const lastList: any[] = [];
    const pending_farms: FarmBoost[] = [];
    const no_pending_farms: FarmBoost[] = [];
    tempList.forEach((farm: FarmBoost) => {
      if (farm.status == 'Created') {
        pending_farms.push(farm);
      } else {
        no_pending_farms.push(farm);
      }
    });
    if (pending_farms.length > 0) {
      pending_farms.forEach((farm: FarmBoost) => {
        const { decimals } = farm.token_meta_data;
        const weekAmount = toReadableNumber(
          decimals,
          new BigNumber(farm.terms.daily_reward).multipliedBy(7).toFixed()
        );
        lastList.push({
          commonRewardToken: farm.token_meta_data,
          commonRewardTotalRewardsPerWeek: weekAmount,
          startTime: farm.terms.start_at,
          pending: true,
        });
      });
    }
    if (no_pending_farms.length > 0) {
      const mergedFarms = mergeCommonRewardsFarms(
        JSON.parse(JSON.stringify(no_pending_farms))
      );
      mergedFarms.forEach((farm: FarmBoost) => {
        const { decimals } = farm.token_meta_data;
        const weekAmount = toReadableNumber(
          decimals,
          new BigNumber(farm.terms.daily_reward).multipliedBy(7).toFixed()
        );
        lastList.push({
          commonRewardToken: farm.token_meta_data,
          commonRewardTotalRewardsPerWeek: weekAmount,
        });
      });
    }
    // show last display string
    const rewards_week_txt = intl.formatMessage({ id: 'rewards_week' });
    let result: string = `<div class="text-sm text-farmText pt-1">${rewards_week_txt}</div>`;
    let itemHtml: string = '';
    lastList.forEach((item: any) => {
      const {
        commonRewardToken,
        commonRewardTotalRewardsPerWeek,
        pending,
        startTime,
      } = item;
      const token = commonRewardToken;
      const txt = intl.formatMessage({ id: 'start' });
      if (pending) {
        itemHtml = `<div class="flex flex-col items-end my-2">
                      <div class="flex justify-between items-center w-full"><img class="w-5 h-5 rounded-full mr-7" style="filter: grayscale(100%)" src="${
                        token.icon
                      }"/>
                      <label class="text-xs text-farmText">${formatWithCommas(
                        commonRewardTotalRewardsPerWeek
                      )}</label>
                      </div>
                      <label class="text-xs text-farmText mt-0.5">${txt}: ${moment
          .unix(startTime)
          .format('YYYY-MM-DD')}</label>
                    </div>`;
      } else {
        itemHtml = `<div class="flex justify-between items-center h-8 my-2">
                      <img class="w-5 h-5 rounded-full mr-7" src="${
                        token.icon
                      }"/>
                      <label class="text-xs text-navHighLightText">${formatWithCommas(
                        commonRewardTotalRewardsPerWeek
                      )}</label>
                    </div>`;
      }

      result += itemHtml;
    });
    return result;
  }
  function mergeCommonRewardsFarms(farms: FarmBoost[]) {
    const tempMap = {};
    farms.forEach((farm: FarmBoost) => {
      const { reward_token, daily_reward } = farm.terms;
      let preMergedfarms: FarmBoost = tempMap[reward_token];
      if (preMergedfarms) {
        preMergedfarms.apr = new BigNumber(preMergedfarms.apr || 0)
          .plus(farm.apr)
          .toFixed()
          .toString();
        preMergedfarms.terms.daily_reward = new BigNumber(
          preMergedfarms.terms.daily_reward
        )
          .plus(daily_reward)
          .toFixed();
      } else {
        tempMap[reward_token] = farm;
      }
    });
    return Object.values(tempMap);
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
  function isEnded() {
    const farms = seed.farmList;
    return farms[0].status == 'Ended';
  }
  function haveUnclaimedReward() {
    if (Object.keys(seed.unclaimed).length > 0) return true;
  }
  function goFarmDetailPage(seed: Seed) {
    getDetailData(seed, tokenPriceList);
    const poolId = getPoolIdBySeedId(seed.seed_id);
    const status = seed.farmList[0].status == 'Ended' ? 'e' : 'r';
    history.replace(`/farmsBoost/${poolId}-${status}`);
  }
  function claimReward() {
    if (claimLoading) return;
    setClaimLoading(true);
    claimRewardBySeed_boost(seed.seed_id)
      .then(() => {
        window.location.reload();
      })
      .catch((error) => {
        setClaimLoading(false);
        setError(error);
      });
  }
  return (
    <>
      <div
        onClick={() => {
          goFarmDetailPage(seed);
        }}
        className={`relative bg-cardBg rounded-2xl cursor-pointer overflow-hidden mb-3 border border-cardBg hover:border-greenColor ${
          isEnded() ? 'farmEnded' : ''
        }
      `}
      >
        {isPending() ? (
          <div className="farmStatus pending status-bar">
            <FormattedMessage id="comimg" defaultMessage="COMING" />
          </div>
        ) : null}
        <div className="baseInfo pt-4 pl-6 pr-4 pb-3.5">
          <div className="flex justify-between xs:flex-col md:flex-col">
            <div className="left flex items-center h-11">
              <span className="flex">
                {tokens.map((token, index) => {
                  return (
                    <label
                      key={token.id}
                      className={`h-8 w-8 rounded-full overflow-hidden border border-gradientFromHover bg-cardBg ${
                        index != 0 ? '-ml-1.5' : ''
                      }`}
                    >
                      <img src={token.icon} className="w-full h-full"></img>
                    </label>
                  );
                })}
              </span>
              <span className="flex items-center cursor-pointer text-white font-bold text-lg ml-4 xs:text-sm md:text-sm">
                {tokens.map((token, index) => {
                  const hLine = index === tokens.length - 1 ? '' : '-';
                  return `${toRealSymbol(token.symbol)}${hLine}`;
                })}
              </span>
              <div
                className="text-white text-right"
                data-class="reactTip"
                data-for={'rewardPerWeekId' + seed?.farmList[0]?.farm_id}
                data-place="top"
                data-html={true}
                data-tip={getRewardsPerWeekTip()}
              >
                <span className="flex hover:bg-black hover:bg-opacity-20 px-1 py-0.5 rounded-full ml-2.5">
                  {getAllRewardsSymbols().map(
                    ([id, icon]: [string, string], index) => {
                      return (
                        <img
                          key={id}
                          src={icon}
                          className={`h-3.5 w-3.5 rounded-full border border-gradientFromHover ${
                            index != 0 ? '-ml-1' : ''
                          }`}
                        ></img>
                      );
                    }
                  )}
                </span>
                <ReactTooltip
                  id={'rewardPerWeekId' + seed?.farmList[0]?.farm_id}
                  backgroundColor="#1D2932"
                  border
                  borderColor="#7e8a93"
                  effect="solid"
                />
              </div>
            </div>
            {haveUnclaimedReward() ? (
              <div className="right flex items-center">
                <div
                  className="text-xl text-white"
                  data-type="info"
                  data-place="top"
                  data-multiline={true}
                  data-tip={getUnClaimTip()}
                  data-html={true}
                  data-for={'unclaimedId' + seed.farmList[0].farm_id}
                  data-class="reactTip"
                >
                  <span className="flex items-center bg-black bg-opacity-20 rounded-l-lg text-sm text-greenColor h-8 px-3">
                    {getTotalUnclaimedRewards()}
                  </span>
                  <ReactTooltip
                    id={'unclaimedId' + seed.farmList[0].farm_id}
                    backgroundColor="#1D2932"
                    border
                    borderColor="#7e8a93"
                    effect="solid"
                  />
                </div>
                <span
                  className="flex items-center justify-center bg-deepBlue rounded-r-lg text-sm text-white h-8 w-20 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    claimReward();
                  }}
                >
                  <ButtonTextWrapper
                    loading={claimLoading}
                    Text={() => <FormattedMessage id={'claim'} />}
                  />
                </span>
              </div>
            ) : null}
          </div>
          <div className="flex items-center justify-between mt-4 xs:flex-col md:flex-col">
            <span className="flex items-center xs:w-full md:w-full xs:flex-row md:flex-row xs:justify-between md:justify-between">
              <label className="text-farmText text-sm mr-3">
                <FormattedMessage id="total_staked"></FormattedMessage>
              </label>
              <label className="text-white text-base">
                {`${
                  Number(seed.seedTvl) == 0
                    ? '-'
                    : `$${toInternationalCurrencySystem(seed.seedTvl, 2)}`
                }`}
              </label>
            </span>
            <div className="flex items-center xs:w-full md:w-full xs:flex-row md:flex-row xs:justify-between md:justify-between">
              <span className="flex items-center mr-3">
                <CalcIcon
                  onClick={(e: any) => {
                    e.stopPropagation();
                    setCalcVisible(true);
                  }}
                  className="mr-1.5 cursor-pointer"
                />
                <label className="text-farmText text-sm">
                  <FormattedMessage id="apr"></FormattedMessage>
                </label>
              </span>
              <div
                className="text-xl text-white"
                data-type="info"
                data-place="top"
                data-multiline={true}
                data-tip={getAprTip()}
                data-html={true}
                data-for={'aprId' + seed.farmList[0].farm_id}
                data-class="reactTip"
              >
                <span className="text-white text-base relative -top-0.5">
                  {getTotalApr()}
                </span>
                <ReactTooltip
                  id={'aprId' + seed.farmList[0].farm_id}
                  backgroundColor="#1D2932"
                  border
                  borderColor="#7e8a93"
                  effect="solid"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="w-1/3 xs:w-full md:w-full flex m-auto justify-center">
          {error ? <Alert level="warn" message={error.message} /> : null}
        </div>
      </div>
      {calcVisible ? (
        <CalcModelBooster
          isOpen={calcVisible}
          onRequestClose={(e) => {
            e.stopPropagation();
            setCalcVisible(false);
          }}
          seed={seed}
          tokenPriceList={tokenPriceList}
          style={{
            overlay: {
              backdropFilter: 'blur(15px)',
              WebkitBackdropFilter: 'blur(15px)',
            },
            content: {
              outline: 'none',
              transform: 'translate(-50%, -50%)',
            },
          }}
        />
      ) : null}
    </>
  );
}

function WithDrawBox(props: {
  userRewardList: any;
  tokenPriceList: any;
  farmDisplayList: Seed[];
}) {
  const { userRewardList, tokenPriceList, farmDisplayList } = props;
  const actualRewardList = {};
  Object.entries(userRewardList).forEach(([key, value]) => {
    if (Number(value) > 0) {
      actualRewardList[key] = value;
    }
  });
  const [rewardList, setRewardList] = useState([]);
  const [checkedList, setCheckedList] = useState<Record<string, any>>({});
  const [selectAll, setSelectAll] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState<boolean>(false);
  const [yourReward, setYourReward] = useState('-');
  const rewardRef = useRef(null);
  const intl = useIntl();
  const withdrawNumber = 5;
  useEffect(() => {
    const tempList = Object.keys(actualRewardList).map(async (key: string) => {
      const rewardToken = await ftGetTokenMetadata(key);
      const price = tokenPriceList[key]?.price;
      return {
        tokenId: key,
        rewardToken,
        price,
        number: actualRewardList[key],
      };
    });
    Promise.all(tempList).then((list) => {
      list.forEach((item: any) => {
        rewardList[item.tokenId] = item;
      });
      setRewardList(rewardList);
    });
    if (
      actualRewardList &&
      tokenPriceList &&
      Object.keys(tokenPriceList).length > 0 &&
      farmDisplayList &&
      farmDisplayList.length > 0
    ) {
      getTotalUnWithdrawRewardsPrice();
    }
  }, [actualRewardList, tokenPriceList, farmDisplayList]);
  function valueOfWithDrawLimitTip() {
    const tip = intl.formatMessage({ id: 'over_tip' });
    let result: string = `<div class="text-navHighLightText text-xs w-52 text-left">${tip}</div>`;
    return result;
  }
  function switchDetailStatus() {
    setShowDetail(!showDetail);
  }
  function displaySinglePrice(price: string) {
    let displayPrice = '$-';
    if (price && price != 'N/A') {
      if (new BigNumber('0.01').isGreaterThan(price)) {
        displayPrice = '<$0.01';
      } else {
        displayPrice = `$${toInternationalCurrencySystem(price.toString(), 2)}`;
      }
    }
    return displayPrice;
  }
  function displayTotalPrice(item: any) {
    const { rewardToken, number, price } = item;
    let resultTotalPrice = '0';
    if (price && price != 'N/A') {
      const totalPrice = new BigNumber(price).multipliedBy(
        toReadableNumber(rewardToken.decimals, number)
      );
      if (new BigNumber('0.01').isGreaterThan(totalPrice)) {
        resultTotalPrice = '<$0.01';
      } else {
        resultTotalPrice = `$${toInternationalCurrencySystem(
          totalPrice.toString(),
          2
        )}`;
      }
    }
    return resultTotalPrice;
  }
  function displayWithDrawTokenNumber(item: any) {
    const { rewardToken, number } = item;
    const tokenNumber = toReadableNumber(rewardToken.decimals, number);
    let resultDisplay = '';
    if (new BigNumber('0.001').isGreaterThan(tokenNumber)) {
      resultDisplay = '<0.001';
    } else {
      resultDisplay = formatWithCommas(
        new BigNumber(tokenNumber).toFixed(3, 1).toString()
      );
    }
    return resultDisplay;
  }
  function clickCheckBox(tokenId: string) {
    if (checkedList[tokenId]) {
      delete checkedList[tokenId];
      if (selectAll) {
        setSelectAll(false);
      }
    } else if (Object.keys(checkedList).length < withdrawNumber) {
      checkedList[tokenId] = { value: rewardList[tokenId].number };
      if (
        Object.keys(checkedList).length ==
        Math.min(withdrawNumber, Object.keys(rewardList).length)
      ) {
        setSelectAll(true);
      }
    }
    setCheckedList(JSON.parse(JSON.stringify(checkedList)));
  }
  function clickAllCheckBox() {
    const status = !selectAll;
    const checkedList = {};
    if (status) {
      const allAtOneTime = Object.entries(rewardList).slice(0, withdrawNumber);
      allAtOneTime.forEach(([key, value]) => {
        checkedList[key] = value.number;
      });
    }
    setCheckedList(checkedList);
    setSelectAll(status);
    rewardRef.current.scrollTop = 0;
  }
  async function doWithDraw() {
    setWithdrawLoading(true);
    withdrawAllReward_boost(checkedList);
  }
  function getTotalUnWithdrawRewardsPrice() {
    const rewardTokenList = {};
    farmDisplayList.forEach((seed: Seed, index: number) => {
      seed.farmList.forEach((farm: FarmBoost) => {
        const { token_meta_data } = farm;
        rewardTokenList[token_meta_data.id] = token_meta_data;
      });
    });
    let totalUnWithDraw = 0;
    Object.entries(actualRewardList).forEach((arr: [string, string]) => {
      const [key, v] = arr;
      const singlePrice = tokenPriceList[key].price;
      const token = rewardTokenList[key];
      const number: any = toReadableNumber(token.decimals, v);
      if (singlePrice && singlePrice != 'N/A') {
        totalUnWithDraw = BigNumber.sum(
          singlePrice * number,
          totalUnWithDraw
        ).toNumber();
      }
    });
    if (totalUnWithDraw > 0) {
      let totalUnWithDrawV = toInternationalCurrencySystem(
        totalUnWithDraw.toString(),
        2
      );
      if (Number(totalUnWithDrawV) == 0) {
        totalUnWithDrawV = '<$0.01';
      } else {
        totalUnWithDrawV = `$${totalUnWithDrawV}`;
      }
      setYourReward(totalUnWithDrawV);
    }
  }
  return (
    <div className="flex flex-col relative rounded-xl overflow-hidden mb-3.5">
      <div className="relative">
        <div className="snakeBase64Div" style={{ height: '56px' }}></div>
        <div className="absolute w-full h-full flex justify-between top-0 left-0 px-5">
          <div className="flex flex-col items-center">
            <span className="text-white text-xs bg-greenColor rounded-b-lg px-3 py-0.5">
              <label className="text-black text-xs font-bold">
                <FormattedMessage id="claimed_Rewards"></FormattedMessage>
              </label>
            </span>
            <label className="text-white text-lg font-bold mt-1">
              {yourReward}
            </label>
          </div>
          <div
            onClick={switchDetailStatus}
            className="flex items-center text-white text-xs border border-gradientFromHover rounded-xl cursor-pointer h-6 px-4 select-none bg-black bg-opacity-20 mt-6"
          >
            <FormattedMessage id="details" />
            <UpArrowIcon
              className={`ml-2 transform ${
                showDetail ? 'rotate-0' : 'rotate-180'
              }`}
            />
          </div>
        </div>
      </div>
      <div className={`bg-cardBg ${showDetail ? '' : 'hidden'}`}>
        <div
          className={`bg-farmV2WithDrawBg pl-3 pr-6 max-h-96 overflow-auto pt-5`}
          ref={rewardRef}
        >
          {Object.values(rewardList).map((item) => {
            return (
              <div
                className="flex justify-between py-3.5 select-none"
                key={item.tokenId}
              >
                <div className="flex items-center text-sm text-white">
                  <div
                    className="mr-3 cursor-pointer"
                    onClick={() => {
                      clickCheckBox(item.tokenId);
                    }}
                  >
                    {checkedList[item.tokenId] ? (
                      <CheckboxSelected></CheckboxSelected>
                    ) : (
                      <Checkbox></Checkbox>
                    )}
                  </div>
                  <img
                    src={item.rewardToken.icon}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <div className="flex flex-col">
                    <label className="text-sm text-white">
                      {toRealSymbol(item.rewardToken.symbol)}
                    </label>
                    <label className="text-primaryText text-xs">
                      {displaySinglePrice(item.price)}
                    </label>
                  </div>
                </div>
                <div className="flex flex-col text-right">
                  <label className="text-sm text-white">
                    {displayWithDrawTokenNumber(item)}
                  </label>
                  <label className="text-primaryText text-xs">
                    {displayTotalPrice(item)}
                  </label>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between items-center pt-4 pb-3 bg-farmV2WithDrawBg pl-3 pr-6 select-none">
          <div className="flex items-center text-primaryText">
            <label className="mr-3 cursor-pointer" onClick={clickAllCheckBox}>
              {selectAll ? (
                <CheckboxSelected></CheckboxSelected>
              ) : (
                <Checkbox></Checkbox>
              )}
            </label>
            {Object.keys(rewardList).length > withdrawNumber ? (
              <div className="flex items-center ">
                <label className="mr-1 text-xs">
                  <FormattedMessage id="all_5_v2" />
                </label>
                <div
                  className="text-white text-right ml-1"
                  data-class="reactTip"
                  data-for="selectAllId"
                  data-place="top"
                  data-html={true}
                  data-tip={valueOfWithDrawLimitTip()}
                >
                  <QuestionMark></QuestionMark>
                  <ReactTooltip
                    id="selectAllId"
                    backgroundColor="#1D2932"
                    border
                    borderColor="#7e8a93"
                    effect="solid"
                  />
                </div>
              </div>
            ) : (
              <label className="text-xs">
                <FormattedMessage id="all" />
              </label>
            )}
          </div>
          <div className="flex justify-center items-center">
            <GradientButton
              color="#fff"
              className={`w-36 h-9 text-center text-base text-white focus:outline-none font-semibold ${
                Object.keys(checkedList).length == 0 ? 'opacity-40' : ''
              }`}
              onClick={doWithDraw}
              disabled={Object.keys(checkedList).length == 0}
              btnClassName={
                Object.keys(checkedList).length == 0 ? 'cursor-not-allowed' : ''
              }
              loading={withdrawLoading}
            >
              <div>
                <ButtonTextWrapper
                  loading={withdrawLoading}
                  Text={() => (
                    <FormattedMessage id="withdraw" defaultMessage="Withdraw" />
                  )}
                />
              </div>
            </GradientButton>
          </div>
        </div>
        <div className="bg-farmV2WithDrawBg py-3">
          <div className="flex items-center justify-between border border-greenColor rounded-lg mx-3 px-3.5 py-3 bg-black bg-opacity-20">
            <span className="text-white text-sm">
              <FormattedMessage id="how_to_earn_more"></FormattedMessage>
            </span>
            <div className="flex items-center">
              <span className="flex items-center text-xs text-primaryText mr-2">
                <label className="flex items-center justify-center w-4 h-4 rounded-full text-white bg-greenColor mr-1.5">
                  1
                </label>{' '}
                <FormattedMessage id="withdraw" /> {'>>'}
              </span>
              <span className="flex items-center text-xs text-primaryText mr-2">
                <label className="flex items-center justify-center w-4 h-4 rounded-full text-white bg-greenColor mr-1.5">
                  2
                </label>{' '}
                <FormattedMessage id="add_liquidity" /> {'>>'}
              </span>
              <span className="flex items-center text-xs text-primaryText">
                <label className="flex items-center justify-center w-4 h-4 rounded-full text-white bg-greenColor mr-1.5">
                  3
                </label>
                <FormattedMessage id="stake" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
const getPoolIdBySeedId = (seed_id: string) => {
  return seed_id.slice(seed_id.indexOf('@') + 1);
};
