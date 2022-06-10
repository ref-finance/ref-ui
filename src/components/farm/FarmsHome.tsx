import React, { useEffect, useRef, useState, useContext, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import SelectUi from '~components/farm/SelectUi';
import {
  CalcIcon,
  UpArrowIcon,
  ArrowDownIcon,
  SearchIcon,
  BoostOptIcon,
  NearOptIcon,
  EthOptIcon,
  OthersOptIcon,
  YoursOptIcon,
  BannerBgLeft,
  BannerBgRight,
  BoostBannerLogo,
  Flight,
  LoveIcon,
  LoveTokenIcon,
  BoostRightArrowIcon,
} from '~components/icon/FarmBoost';
import {
  GradientButton,
  ButtonTextWrapper,
  GreenConnectToNearBtn,
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
  get_config,
  BoostConfig,
  love_stake,
  UserSeedInfo,
  unStake_boost,
  frontConfigBoost,
  defaultConfigBoost,
} from '~services/farm';
import { getLoveAmount } from '~services/referendum';
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
import { TokenMetadata, REF_META_DATA } from '../../services/ft-contract';
import { getPrice } from '~services/xref';
import { get24hVolume } from '~services/indexer';
import {
  getURLInfo,
  usnBuyAndSellToast,
  swapToast,
} from '../layout/transactionTipPopUp';
import { checkTransaction } from '../../services/stable-swap';
import Modal from 'react-modal';
import { ModalClose } from '~components/icon';
import { LockPopUp, getPoolId, AccountInfo } from '../../pages/ReferendumPage';
import { wnearMetadata } from '../../services/wrap-near';
import { usePoolShare } from '../../state/pool';
import { useAccountInfo, LOVE_TOKEN_DECIMAL } from '../../state/referendum';

const { STABLE_POOL_IDS, REF_TOKEN_ID, XREF_TOKEN_ID, REF_VE_CONTRACT_ID } =
  getConfig();
// todo 先写死后处理
// const REF_VE_CONTRACT_ID = 'dev-20220606062724-24132123771050';
const DECIMALS_XREF_REF_TRANSTER = 8;
export default function FarmsHome(props: any) {
  let [user_unWithdraw_rewards, set_user_unWithdraw_rewards] = useState<
    Record<string, string>
  >({});
  let [tokenPriceList, setTokenPriceList] = useState<any>({});
  let [farm_display_List, set_farm_display_List] = useState<any>([]);
  let [farm_display_ended_List, set_farm_display_ended_List] = useState<any>(
    []
  );

  const { globalState } = useContext(WalletContext);

  const isSignedIn = globalState.isSignedIn;

  const [popUp, setPopUp] = useState(false);

  const { txHash, pathname, errorType } = getURLInfo();

  useEffect(() => {
    if (txHash && isSignedIn && popUp) {
      checkTransaction(txHash)
        .then((res: any) => {
          const slippageErrorPattern = /ERR_MIN_AMOUNT|slippage error/i;

          const isSlippageError = res.receipts_outcome.some((outcome: any) => {
            return slippageErrorPattern.test(
              outcome?.outcome?.status?.Failure?.ActionError?.kind
                ?.FunctionCallError?.ExecutionError
            );
          });
          const transaction = res.transaction;
          const methodName =
            transaction?.actions[0]?.['FunctionCall']?.method_name;
          return {
            isUSN: methodName == 'buy' || methodName == 'sell',
            isSlippageError,
            isNearWithdraw: methodName == 'near_withdraw',
            isNearDeposit: methodName == 'near_deposit',
          };
        })
        .then(({ isUSN, isSlippageError, isNearWithdraw, isNearDeposit }) => {
          if (isUSN || isNearWithdraw || isNearDeposit) {
            isUSN &&
              !isSlippageError &&
              !errorType &&
              usnBuyAndSellToast(txHash);
            (isNearWithdraw || isNearDeposit) &&
              !errorType &&
              swapToast(txHash);
            window.history.replaceState(
              {},
              '',
              window.location.origin + pathname
            );
          }
        });
    }
  }, [txHash, isSignedIn, popUp]);

  const [showEndedFarmList, setShowEndedFarmList] = useState(
    localStorage.getItem('endedfarmShow') == '1' ? true : false
  );
  let [homePageLoading, setHomePageLoading] = useState(true);
  const intl = useIntl();

  const [noData, setNoData] = useState(false);
  const [count, setCount] = useState(0);
  const [dayVolumeMap, setDayVolumeMap] = useState({});
  const searchRef = useRef(null);
  const refreshTime = 120000;
  const sortList = {
    tvl: intl.formatMessage({ id: 'tvl' }),
    apr: intl.formatMessage({ id: 'apr' }),
  };
  const statusList = {
    live: {
      txt: intl.formatMessage({ id: 'all' }),
    },
    boost: {
      txt: intl.formatMessage({ id: 'boost' }),
      icon: <BoostOptIcon></BoostOptIcon>,
    },
    near: {
      txt: intl.formatMessage({ id: 'near' }),
      icon: <NearOptIcon></NearOptIcon>,
    },
    eth: {
      txt: intl.formatMessage({ id: 'eth' }),
      icon: <EthOptIcon></EthOptIcon>,
    },
    others: {
      txt: intl.formatMessage({ id: 'others' }),
      icon: <OthersOptIcon></OthersOptIcon>,
    },
    my: {
      txt: intl.formatMessage({ id: 'yours' }),
      icon: <YoursOptIcon></YoursOptIcon>,
    },
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
  const [loveTokenBalance, setLoveTokenBalance] = useState<string>('0');
  let [loveSeed, setLoveSeed] = useState<Seed>(null);
  let [boostConfig, setBoostConfig] = useState<BoostConfig>(null);

  const [loveStakeModalVisible, setLoveStakeModalVisible] = useState(false);
  const [loveUnStakeModalVisible, setLoveUnStakeModalVisible] = useState(false);
  const [showLoveTokenModalVisible, setShowLoveTokenModalVisible] =
    useState(false);
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
  async function getConfig() {
    const config = await get_config();
    const data = config.booster_seeds[REF_VE_CONTRACT_ID];
    boostConfig = data;
    setBoostConfig(data);
  }
  async function init() {
    console.log('开始了');
    let loveTokenSeedInfo: Seed;
    // get all seeds
    let list_seeds = await list_seeds_info();
    console.log('list_seed 获取到了');
    const promiseList: Promise<any>[] = [];
    list_seeds.forEach((seed: Seed) => {
      const { seed_id } = seed;
      promiseList.push(list_seed_farms(seed_id));
      if (seed_id == REF_VE_CONTRACT_ID) {
        loveTokenSeedInfo = seed;
      }
    });
    // get all farms
    const list_farm: FarmBoost[][] = await Promise.all(promiseList);
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
    console.log('list_farm 获取到了');
    // get all pools and prices
    const priceAndPool = await getPricesAndPools(list_seeds);
    console.log('price 和 pool 获取到了');
    const [tokenPriceList, pools] = priceAndPool;
    // get user seeds
    let list_user_seeds = {};
    if (isSignedIn) {
      list_user_seeds = await list_farmer_seeds();
      if (list_user_seeds[REF_VE_CONTRACT_ID]) {
        loveTokenSeedInfo.user_seed = list_user_seeds[REF_VE_CONTRACT_ID];
      }
    }
    loveSeed = loveTokenSeedInfo;
    setLoveSeed(loveTokenSeedInfo);
    console.log('list_farmer_seeds 获取到了');
    // get boost seed Config
    await getConfig();
    console.log('getConfig 获取到了');

    // get LoveToken balance
    if (isSignedIn) {
      const loveBalance = await getLoveAmount();
      setLoveTokenBalance(toReadableNumber(LOVE_TOKEN_DECIMAL, loveBalance));
    }
    console.log('love Token balance 获取到了');
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
    console.log('xref 获取到了');
    getAllPoolsDayVolume(list_seeds);
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
    const { list_seeds, tokenPriceList, pools, list_user_seeds } = initData;
    const promise_new_list_seeds = list_seeds.map(async (newSeed: Seed) => {
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
        console.log('get_unclaimed_rewards 获取到了');
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
    // for detail page data
    getSpecialSeed({
      tokenPriceList,
      farm_display_List,
      loveSeed,
      boostConfig,
    });
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
  function getSpecialSeed({
    tokenPriceList,
    farm_display_List,
    loveSeed,
    boostConfig,
  }: {
    tokenPriceList: any;
    farm_display_List: Seed[];
    loveSeed: Seed;
    boostConfig: BoostConfig;
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
        getDetailData({
          detailData: targetFarms,
          tokenPriceList,
          loveSeed,
          boostConfig,
        });
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
    let pool_ids: string[] = [];
    list_seeds.forEach((seed: Seed) => {
      const { seed_id } = seed;
      pool_ids.push(getPoolIdBySeedId(seed_id));
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
      } else if (status == 'boost' && boostConfig) {
        const affected_seeds_keys = Object.keys(boostConfig.affected_seeds);
        if (affected_seeds_keys.indexOf(seed_id) > -1 && !isEnd) {
          condition1 = true;
        } else {
          condition1 = false;
        }
      } else if (status == 'near') {
        if (
          farmClassification['near'].indexOf(+getPoolIdBySeedId(seed_id)) >
            -1 &&
          !isEnd
        ) {
          condition1 = true;
        } else {
          condition1 = false;
        }
      } else if (status == 'eth') {
        if (
          farmClassification['eth'].indexOf(+getPoolIdBySeedId(seed_id)) > -1 &&
          !isEnd
        ) {
          condition1 = true;
        } else {
          condition1 = false;
        }
      } else if (status == 'others') {
        // others
        const affected_seeds_keys = Object.keys(
          boostConfig?.affected_seeds || []
        );
        const isNotBoost = affected_seeds_keys.indexOf(seed_id) == -1;
        const isNotNear =
          farmClassification['near'].indexOf(+getPoolIdBySeedId(seed_id)) == -1;
        const isNotEth =
          farmClassification['eth'].indexOf(+getPoolIdBySeedId(seed_id)) == -1;
        if (isNotBoost && isNotNear && isNotEth && !isEnd) {
          condition1 = true;
        } else {
          condition1 = false;
        }
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
      const { pool, seed_id } = seed;
      const { token_symbols } = pool;
      let condition1;
      if (status == 'boost' && boostConfig) {
        const affected_seeds_keys = Object.keys(boostConfig.affected_seeds);
        if (affected_seeds_keys.indexOf(seed_id) > -1) {
          condition1 = true;
        } else {
          condition1 = false;
        }
      } else if (status == 'near') {
        if (
          farmClassification['near'].indexOf(+getPoolIdBySeedId(seed_id)) > -1
        ) {
          condition1 = true;
        } else {
          condition1 = false;
        }
      } else if (status == 'eth') {
        if (
          farmClassification['eth'].indexOf(+getPoolIdBySeedId(seed_id)) > -1
        ) {
          condition1 = true;
        } else {
          condition1 = false;
        }
      } else if (status == 'others') {
        // others
        const affected_seeds_keys = Object.keys(
          boostConfig?.affected_seeds || []
        );
        const isNotBoost = affected_seeds_keys.indexOf(seed_id) == -1;
        const isNotNear =
          farmClassification['near'].indexOf(+getPoolIdBySeedId(seed_id)) == -1;
        const isNotEth =
          farmClassification['eth'].indexOf(+getPoolIdBySeedId(seed_id)) == -1;
        if (isNotBoost && isNotNear && isNotEth) {
          condition1 = true;
        } else {
          condition1 = false;
        }
      }
      let condition2 = true;
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
      }
      if (condition2 && condition1) {
        seed.hidden = false;
        noDataEnd = false;
      } else {
        seed.hidden = true;
      }
    });
    // sort
    if (sort == 'apr') {
      farm_display_List.sort((item1: Seed, item2: Seed) => {
        const item1PoolId = item1.pool.id;
        const item2PoolId = item2.pool.id;
        const item1Front = frontConfigBoost[item1PoolId];
        const item2Front = frontConfigBoost[item2PoolId];
        const item1Default = defaultConfigBoost[item1PoolId];
        const item2Default = defaultConfigBoost[item2PoolId];
        if (item1Front || item2Front) {
          return Number(item2Front || 0) - Number(item1Front || 0);
        }
        if (item1Default || item2Default) {
          return Number(item2Default || 0) - Number(item1Default || 0);
        }
        const item1Apr = getTotalAprForSeed(JSON.parse(JSON.stringify(item1)));
        const item2Apr = getTotalAprForSeed(JSON.parse(JSON.stringify(item2)));
        return Number(item2Apr) - Number(item1Apr);
      });
      farm_display_ended_List.sort((item1: Seed, item2: Seed) => {
        const item1PoolId = item1.pool.id;
        const item2PoolId = item2.pool.id;
        const item1Front = frontConfigBoost[item1PoolId];
        const item2Front = frontConfigBoost[item2PoolId];
        const item1Default = defaultConfigBoost[item1PoolId];
        const item2Default = defaultConfigBoost[item2PoolId];
        if (item1Front || item2Front) {
          return Number(item2Front || 0) - Number(item1Front || 0);
        }
        if (item1Default || item2Default) {
          return Number(item2Default || 0) - Number(item1Default || 0);
        }
        const item1Apr = getTotalAprForSeed(JSON.parse(JSON.stringify(item1)));
        const item2Apr = getTotalAprForSeed(JSON.parse(JSON.stringify(item2)));
        return Number(item2Apr) - Number(item1Apr);
      });
    } else if (sort == 'tvl') {
      farm_display_List.sort((item1: Seed, item2: Seed) => {
        const item1PoolId = item1.pool.id;
        const item2PoolId = item2.pool.id;
        const item1Front = frontConfigBoost[item1PoolId];
        const item2Front = frontConfigBoost[item2PoolId];
        const item1Default = defaultConfigBoost[item1PoolId];
        const item2Default = defaultConfigBoost[item2PoolId];
        if (item1Front || item2Front) {
          return Number(item2Front || 0) - Number(item1Front || 0);
        }
        if (item1Default || item2Default) {
          return Number(item2Default || 0) - Number(item1Default || 0);
        }
        return Number(item2.seedTvl) - Number(item1.seedTvl);
      });
      farm_display_ended_List.sort((item1: Seed, item2: Seed) => {
        const item1PoolId = item1.pool.id;
        const item2PoolId = item2.pool.id;
        const item1Front = frontConfigBoost[item1PoolId];
        const item2Front = frontConfigBoost[item2PoolId];
        const item1Default = defaultConfigBoost[item1PoolId];
        const item2Default = defaultConfigBoost[item2PoolId];
        if (item1Front || item2Front) {
          return Number(item2Front || 0) - Number(item1Front || 0);
        }
        if (item1Default || item2Default) {
          return Number(item2Default || 0) - Number(item1Default || 0);
        }
        return Number(item2.seedTvl) - Number(item1.seedTvl);
      });
    }
    if (status == 'my') {
      setNoData(noDataLive);
    } else {
      setNoData(noDataEnd && noDataLive);
    }
    setHomePageLoading(false);
    setPopUp(true);
    set_farm_display_List(farm_display_List);
    set_farm_display_ended_List(Array.from(farm_display_ended_List));
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
        apr = +new BigNumber(item.apr).plus(apr).toFixed();
      }
    });

    // get pool fee apy
    const poolApy = dayVolumeMap[seed.pool.id];
    if (poolApy) {
      apr = +new BigNumber(poolApy).plus(apr).toFixed();
    }
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
  function getLoveBalance() {
    if (!loveTokenBalance || +loveTokenBalance == 0) {
      return isSignedIn ? <label className="opacity-50">0.000</label> : '-';
    } else if (new BigNumber(loveTokenBalance).isLessThan(0.001)) {
      return '<0.001';
    } else {
      return toPrecision(loveTokenBalance, 3);
    }
  }
  function getLoveUserStaked() {
    let loveStakedAmount = '0';
    if (loveSeed.user_seed) {
      // user has staked
      const { free_amount, locked_amount } = loveSeed.user_seed;
      const totalAmount = new BigNumber(free_amount)
        .plus(locked_amount)
        .toFixed();
      loveStakedAmount = toReadableNumber(LOVE_TOKEN_DECIMAL, totalAmount);
    }
    if (!loveStakedAmount || +loveStakedAmount == 0) {
      return '-';
    } else if (new BigNumber(loveStakedAmount).isLessThan(0.001)) {
      return '<0.001';
    } else {
      return toPrecision(loveStakedAmount, 3);
    }
  }
  const endFarmLength = useMemo(() => {
    return getFarmVisibleLength();
  }, [farm_display_ended_List]);
  const isMobileSite = isMobile();
  return (
    <div className={`${getUrlParams() ? 'hidden' : ''}`}>
      <div
        className="relative flex items-center justify-center mb-5"
        style={{
          backgroundImage:
            'linear-gradient(270deg, #001320 0%, #1D2932 95.06%)',
        }}
      >
        <span className="absolute left-0 top-0 h-full overflow-hidden">
          <BannerBgLeft />
        </span>
        <div className="flex justify-between items-center lg:w-2/3 xs:w-full md:w-full pt-5 pb-3">
          <div className="lg:w-2/5 md:w-1/2">
            <div className="title flex justify-between items-center text-3xl text-white xs:-mt-4 md:-mt-4">
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
          </div>
          <div style={{ zoom: 0.5 }}>
            <BoostBannerLogo></BoostBannerLogo>
          </div>
        </div>
        <span className="absolute right-0 top-0 h-full overflow-hidden">
          <BannerBgRight />
        </span>
      </div>
      <div className="searchArea m-auto lg:w-2/3 xs:w-full md:w-full flex justify-between items-center mb-11">
        <div className="flex justify-between items-center">
          {Object.keys(statusList).map((item: string) => {
            return (
              <span
                onClick={() => {
                  changeStatus(item);
                }}
                key={item}
                className={`flex flex-grow justify-center items-center h-9 px-3 rounded-lg text-sm cursor-pointer ${
                  status == item
                    ? 'bg-farmV2TabColor text-white'
                    : 'text-farmText'
                }`}
              >
                <label className={`mr-1 ${status == item ? '' : 'opacity-40'}`}>
                  {statusList[item].icon}
                </label>
                {statusList[item].txt}
              </span>
            );
          })}
        </div>
        <div className="flex items-center">
          <div
            className="flex items-center justify-between px-4 h-9 py-1 bg-searchBgColor rounded-lg mr-5"
            style={{
              border: keyWords ? '1px solid rgba(115, 129, 139, 0.5)' : '',
            }}
          >
            <input
              ref={searchRef}
              type="text"
              className="h-full text-sm text-white mr-3 w-48"
              onWheel={() => searchRef.current.blur()}
              onChange={({ target }) => searchByKeyWords(target.value)}
              placeholder="Search farms by token..."
            ></input>
            <span
              className={`${
                keyWords ? 'text-lightGreenColor' : 'text-farmText'
              }`}
            >
              <SearchIcon></SearchIcon>
            </span>
          </div>
          <label className="text-farmText text-xs mr-2 whitespace-nowrap">
            <FormattedMessage id="sort_by" defaultMessage="Sort by" />
          </label>
          {Object.keys(sortList).map((item, index) => {
            const value = sortList[item];
            return (
              <div
                className={`flex items-center justify-between rounded-lg text-primaryText px-3 py-0.5 ml-2 cursor-pointer hover:bg-cardBg text-xs ${
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
      {homePageLoading && getUrlParams() ? null : homePageLoading ? (
        <Loading></Loading>
      ) : (
        <>
          {noData ? (
            <div className="flex flex-col w-full justify-center items-center mt-20 xs:mt-8 md:mt-8">
              <NoDataIcon />
              <span className="text-farmText text-base mt-4 text-center w-48">
                <FormattedMessage id="no_result"></FormattedMessage>
              </span>
            </div>
          ) : null}
          {/* boost start */}
          {!loveSeed ? null : (
            <div
              className={`grid grid-cols-2 xs:grid-cols-1 2xl:grid-cols-3 gap-x-5 gap-y-9 m-auto lg:w-2/3 xs:w-full md:w-full mb-9 ${
                status != 'boost' || noData ? 'hidden' : ''
              }`}
            >
              <div
                className="flex justify-between col-span-2 rounded-2xl"
                style={{
                  backgroundImage:
                    'linear-gradient(90deg, #7C47FD 0%, #34177C 100%)',
                }}
              >
                <div className="flex flex-col justify-between pl-14 pb-16 pt-4">
                  <span className="text-senderHot text-3xl">Farm Booster</span>
                  <div className="flex justify-center items-center">
                    <div className="relative flex items-center justify-center mr-1.5">
                      <span
                        className="ball flex items-center justify-center bg-lightGreenColor text-sm text-priceBoardColor rounded-full"
                        style={{ width: '22px', height: '22px' }}
                      >
                        1
                      </span>
                      <span
                        onClick={() => {
                          setShowLoveTokenModalVisible(true);
                        }}
                        className="absolute flex items-center justify-center text-sm text-lightGreenColor border border-lightGreenColor rounded-lg top-8 whitespace-nowrap px-5 py-1 cursor-pointer"
                      >
                        Get LOVE
                      </span>
                    </div>
                    <div className="line w-32 h-px bg-lightGreenColor"></div>
                    <div className="relative flex items-center justify-center mx-1.5">
                      <span
                        className="ball flex items-center justify-center bg-lightGreenColor text-sm text-priceBoardColor rounded-full"
                        style={{ width: '22px', height: '22px' }}
                      >
                        2
                      </span>
                      <span
                        onClick={() => {
                          setLoveStakeModalVisible(true);
                        }}
                        className="absolute flex items-center justify-center text-sm text-lightGreenColor border border-lightGreenColor rounded-lg top-8 whitespace-nowrap px-5 py-1 cursor-pointer"
                      >
                        Stake LOVE
                      </span>
                    </div>
                    <div className="line w-32 h-px bg-lightGreenColor"></div>
                    <div className="relative flex items-center justify-center ml-1.5">
                      <span
                        className="ball flex items-center justify-center bg-lightGreenColor text-sm text-priceBoardColor rounded-full"
                        style={{ width: '22px', height: '22px' }}
                      >
                        3
                      </span>
                      <span className="absolute flex items-center justify-center text-sm text-white rounded-lg top-8 whitespace-nowrap px-5 py-1">
                        Get farm boost
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <Flight></Flight>
                </div>
              </div>
              <div
                className="relative flex flex-col items-center justify-between rounded-2xl p-4 pb-6"
                style={{
                  backgroundImage:
                    'linear-gradient(90deg, #7C47FD 0%, #34177C 100%)',
                }}
              >
                <span className="absolute -top-5">
                  <LoveIcon></LoveIcon>
                </span>
                <span className="text-white text-2xl mt-6">Love</span>
                <div className="flex justify-between items-center w-full">
                  <div className="flex flex-col items-center stakeBox w-2 flex-grow mx-1.5">
                    <span className="text-white opacity-50 text-sm">
                      Available to stake
                    </span>
                    <span className="text-white text-lg my-1">
                      {getLoveBalance()}
                    </span>
                    {!isSignedIn ? null : isSignedIn &&
                      +loveTokenBalance == 0 ? (
                      <div
                        onClick={() => {
                          setShowLoveTokenModalVisible(true);
                        }}
                        className="flex items-center justify-center cursor-pointer text-sm text-white bg-veGradient p-px rounded-lg w-full overflow-hidden"
                      >
                        <div
                          style={{
                            backgroundImage:
                              'linear-gradient(90deg, rgb(124, 71, 253) 0%, rgba(52,23,124,0.6) 100%)',
                          }}
                          className="flex items-center justify-center w-full h-full rounded-lg"
                        >
                          <div className="h-full w-full py-1 rounded-lg flex items-center justify-center bg-black bg-opacity-20">
                            <FormattedMessage id="get_love"></FormattedMessage>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          setLoveStakeModalVisible(true);
                        }}
                        className="flex items-center justify-center cursor-pointer text-sm text-black bg-lightGreenColor rounded-lg w-full py-1"
                      >
                        <FormattedMessage id="stake"></FormattedMessage>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-center  unstakeBox w-2 flex-grow mx-1.5">
                    <span className="text-white opacity-50 text-sm">
                      You staked
                    </span>
                    <span className="text-white text-lg my-1">
                      {getLoveUserStaked()}
                    </span>
                    {!isSignedIn ? null : (
                      <div
                        onClick={() => {
                          setLoveUnStakeModalVisible(true);
                        }}
                        className="flex items-center justify-center cursor-pointer text-sm text-white bg-veGradient p-px rounded-lg w-full overflow-hidden"
                      >
                        <div
                          style={{
                            backgroundImage:
                              'linear-gradient(90deg, rgb(124, 71, 253) 0%, rgba(52,23,124,0.5) 100%)',
                          }}
                          className="flex items-center justify-center w-full h-full rounded-lg"
                        >
                          <div className="h-full w-full py-1 rounded-lg flex items-center justify-center bg-black bg-opacity-20">
                            <FormattedMessage id="unstake"></FormattedMessage>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {!isSignedIn ? (
                  <GreenConnectToNearBtn></GreenConnectToNearBtn>
                ) : null}
              </div>
            </div>
          )}

          {showLoveTokenModalVisible ? (
            <GetLoveTokenModal
              isOpen={showLoveTokenModalVisible}
              onRequestClose={() => {
                setShowLoveTokenModalVisible(false);
              }}
            ></GetLoveTokenModal>
          ) : null}

          {loveStakeModalVisible ? (
            <LoveStakeModal
              isOpen={loveStakeModalVisible}
              onRequestClose={() => {
                setLoveStakeModalVisible(false);
              }}
              title="stakeLove"
              loveTokenBalance={loveTokenBalance}
              loveSeed={loveSeed}
              boostConfig={boostConfig}
              farm_display_List={farm_display_List}
            ></LoveStakeModal>
          ) : null}
          {loveUnStakeModalVisible ? (
            <LoveUnStakeModal
              isOpen={loveUnStakeModalVisible}
              onRequestClose={() => {
                setLoveUnStakeModalVisible(false);
              }}
              title="unstakeLove"
              loveSeed={loveSeed}
              boostConfig={boostConfig}
              farm_display_List={farm_display_List}
            ></LoveUnStakeModal>
          ) : null}

          {/* boost end */}
          <div className="farmListArea grid grid-cols-2 xs:grid-cols-1 2xl:grid-cols-3 gap-x-5 gap-y-9 m-auto lg:w-2/3 xs:w-full md:w-full">
            {farm_display_List.map((seed: Seed, index: number) => {
              return (
                <div
                  key={seed.seed_id + index}
                  className={seed.hidden ? 'hidden' : ''}
                >
                  <FarmView
                    seed={seed}
                    tokenPriceList={tokenPriceList}
                    getDetailData={getDetailData}
                    dayVolumeMap={dayVolumeMap}
                    boostConfig={boostConfig}
                    loveSeed={loveSeed}
                  ></FarmView>
                </div>
              );
            })}
          </div>
          <div
            className={`${
              endFarmLength > 0 && showEndedFarmList && status != 'my'
                ? ''
                : 'hidden'
            }`}
          >
            <p className="text-xl m-auto lg:w-2/3 xs:w-full md:w-full text-farmText mt-5 mb-6">
              <FormattedMessage id="endedFarms"></FormattedMessage>
            </p>
            <div className="farmListArea grid grid-cols-2 xs:grid-cols-1 2xl:grid-cols-3 gap-x-5 gap-y-9 m-auto lg:w-2/3 xs:w-full md:w-full">
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
                      dayVolumeMap={dayVolumeMap}
                      boostConfig={boostConfig}
                      loveSeed={loveSeed}
                    ></FarmView>
                  </div>
                );
              })}
            </div>
          </div>
          {endFarmLength > 0 && status != 'my' ? (
            <div
              onClick={switchEndedFarmListDisplayStatus}
              className="flex items-center justify-center text-xs text-farmText cursor-pointer"
              style={{
                maxWidth: '220px',
                margin: '0 auto',
                marginTop: '20px',
              }}
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
        </>
      )}
    </div>
  );
}
function GetLoveTokenModal(props: { isOpen: boolean; onRequestClose: any }) {
  const { isOpen, onRequestClose } = props;
  const REF_NEAR_TOKENS = [REF_META_DATA, wnearMetadata];
  const id = getPoolId();
  const lpShare = usePoolShare(id);
  const { accountInfo } = useAccountInfo();
  return (
    <LockPopUp
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      tokens={REF_NEAR_TOKENS}
      lpShare={lpShare}
      accountInfo={accountInfo}
      title="get_love"
    />
  );
}
function LoveStakeModal(props: {
  loveTokenBalance: string;
  loveSeed: Seed;
  isOpen: boolean;
  onRequestClose: any;
  title: string;
  boostConfig: BoostConfig;
  farm_display_List: Seed[];
}) {
  const {
    loveTokenBalance,
    loveSeed,
    boostConfig,
    farm_display_List,
    ...reset
  } = props;
  const [amount, setAmount] = useState('');
  const [loveStakeLoading, setLoveStakeLoading] = useState(false);
  const [amountAvailableCheck, setAmountAvailableCheck] = useState(true);
  const [affectSeeds, setAffectSeeds] = useState<Seed[]>(null);
  const { affected_seeds } = boostConfig;
  const intl = useIntl();
  useEffect(() => {
    const affected_seeds_list: Seed[] = [];
    const affected_seeds_values = Object.entries(affected_seeds);
    affected_seeds_values.forEach((itemArr) => {
      const affect_seed_id = itemArr[0];
      const affect_seed_base = itemArr[1];
      let temp = farm_display_List.filter((seed: Seed) => {
        if (seed.seed_id == affect_seed_id) return true;
      });
      if (temp) {
        const s = JSON.parse(JSON.stringify(temp[0]));
        s.base = affect_seed_base;
        affected_seeds_list.push(s);
      }
    });
    setAffectSeeds(affected_seeds_list);
  }, []);
  function changeAmount(value: string) {
    setAmount(value);
    // check
    const curValue = toNonDivisibleNumber(LOVE_TOKEN_DECIMAL, value);
    if (value && new BigNumber(curValue).isLessThan(loveSeed.min_deposit)) {
      setAmountAvailableCheck(false);
    } else {
      setAmountAvailableCheck(true);
    }
  }
  function loveStake() {
    setLoveStakeLoading(true);
    love_stake({
      amount: toNonDivisibleNumber(LOVE_TOKEN_DECIMAL, amount),
      msg: JSON.stringify('Free'),
    });
  }
  function displaySymbols(pool: PoolRPCView) {
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
  function getCurrentMutiple(base: number) {
    const { free_amount = 0, locked_amount = 0 } = loveSeed.user_seed || {};
    const lastTotalAmount = toReadableNumber(
      LOVE_TOKEN_DECIMAL,
      new BigNumber(free_amount).plus(locked_amount).toFixed()
    );
    if (+amount > 0) {
      const totalAmount = new BigNumber(lastTotalAmount).plus(amount).toFixed();
      const result = new BigNumber(1)
        .plus(Math.log(+totalAmount) / Math.log(base))
        .toFixed();
      return `x${toPrecision(result.toString(), 3)}`;
    } else if (+lastTotalAmount > 0) {
      const result = new BigNumber(1)
        .plus(Math.log(+lastTotalAmount) / Math.log(base))
        .toFixed();
      return `x${toPrecision(result.toString(), 3)}`;
    } else {
      return '-';
    }
  }
  const isDisabled =
    !amount ||
    !amountAvailableCheck ||
    new BigNumber(amount).isLessThanOrEqualTo(0) ||
    new BigNumber(amount).isGreaterThan(loveTokenBalance);
  return (
    <CommonModal {...reset}>
      <div className="flex justify-between items-center mt-6">
        <span className="flex items-center text-base text-white font-bold">
          <LoveTokenIcon className="mr-2.5"></LoveTokenIcon> LOVE
        </span>
        <span className="text-sm text-white">
          {toPrecision(loveTokenBalance, 6)}
        </span>
      </div>
      <div className="flex justify-between items-center h-14 px-3 mt-4 bg-black bg-opacity-20 rounded-lg">
        <input
          type="number"
          placeholder="0.0"
          value={amount}
          onChange={({ target }) => changeAmount(target.value)}
          className="text-white text-lg focus:outline-non appearance-none leading-tight"
        ></input>
        <div className="flex items-center ml-2">
          <span
            onClick={() => {
              changeAmount(loveTokenBalance);
            }}
            className={`text-xs text-farmText px-1.5 py-0.5 rounded-lg border cursor-pointer hover:text-greenColor hover:border-greenColor ${
              amount == loveTokenBalance
                ? 'bg-black bg-opacity-20 border-black border-opacity-20'
                : 'border-maxBorderColor'
            }`}
          >
            Max
          </span>
        </div>
      </div>
      {amountAvailableCheck ? null : (
        <div className="flex justify-center mt-2">
          <Alert
            level="warn"
            message={
              intl.formatMessage({ id: 'more_than_seed' }) +
              toReadableNumber(LOVE_TOKEN_DECIMAL, loveSeed.min_deposit)
            }
          />
        </div>
      )}
      <div className="flex items-center justify-between mt-6 mb-4">
        <span className="text-sm text-farmText">Boost farm</span>
        <span className="text-sm text-farmText">Boost</span>
      </div>
      {affectSeeds &&
        affectSeeds.map((seed: Seed) => {
          return (
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center">
                <span className="text-white text-sm">
                  {displaySymbols(seed.pool)}
                </span>
                {Object.keys(seed.user_seed).length > 0 ? (
                  <span className="ml-3 text-sm text-lightGreenColor bg-black bg-opacity-20 rounded-lg px-1.5 py-1">
                    Your farm
                  </span>
                ) : null}
              </div>
              <span
                className={`text-base ${
                  Object.keys(seed.user_seed).length > 0
                    ? 'text-lightGreenColor'
                    : 'text-farmText'
                }`}
              >
                {getCurrentMutiple(seed.base)}
              </span>
            </div>
          );
        })}
      <GradientButton
        onClick={loveStake}
        color="#fff"
        disabled={loveStakeLoading || isDisabled}
        loading={loveStakeLoading || isDisabled}
        btnClassName={`${isDisabled ? 'cursor-not-allowed' : ''}`}
        className={`mt-8 w-full h-14 text-center text-lg text-white focus:outline-none font-semibold`}
        backgroundImage="linear-gradient(270deg, #7F43FF 0%, #00C6A2 97.06%)"
      >
        <ButtonTextWrapper
          loading={loveStakeLoading}
          Text={() => <FormattedMessage id="stake" />}
        />
      </GradientButton>
    </CommonModal>
  );
}
function LoveUnStakeModal(props: {
  loveSeed: Seed;
  isOpen: boolean;
  onRequestClose: any;
  title: string;
  boostConfig: BoostConfig;
  farm_display_List: Seed[];
}) {
  const { loveSeed, boostConfig, farm_display_List, ...reset } = props;
  const [amount, setAmount] = useState('');
  const [loveTokenBalance, setLoveTokenBalance] = useState('0');
  const [loveUnStakeLoading, setLoveUnStakeLoading] = useState(false);
  const [yourAffectSeeds, setYourAffectSeeds] = useState<Seed[]>(null);
  const { affected_seeds } = boostConfig;
  const intl = useIntl();
  useEffect(() => {
    // get affect seeds
    const affected_seeds_list: Seed[] = [];
    const affected_seeds_values = Object.entries(affected_seeds);
    affected_seeds_values.forEach((itemArr) => {
      const affect_seed_id = itemArr[0];
      const affect_seed_base = itemArr[1];
      let temp = farm_display_List.filter((seed: Seed) => {
        const userHasStaked = Object.keys(seed.user_seed).length > 0;
        if (seed.seed_id == affect_seed_id && userHasStaked) return true;
      });
      if (temp && temp.length > 0) {
        const s = JSON.parse(JSON.stringify(temp[0]));
        s.base = affect_seed_base;
        affected_seeds_list.push(s);
      }
    });
    setYourAffectSeeds(affected_seeds_list);
    // get user staked love Token balance
    if (loveSeed.user_seed) {
      // user has staked
      const { free_amount, locked_amount } = loveSeed.user_seed;
      const totalAmount = new BigNumber(free_amount)
        .plus(locked_amount)
        .toFixed();
      const loveStakedAmount = toReadableNumber(
        LOVE_TOKEN_DECIMAL,
        totalAmount
      );
      setLoveTokenBalance(loveStakedAmount);
    }
  }, []);
  function changeAmount(value: string) {
    setAmount(value);
  }
  function loveUnstake() {
    setLoveUnStakeLoading(true);
    unStake_boost({
      seed_id: REF_VE_CONTRACT_ID,
      unlock_amount: '0',
      withdraw_amount: toNonDivisibleNumber(LOVE_TOKEN_DECIMAL, amount),
    });
  }
  function displaySymbols(pool: PoolRPCView) {
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
  function getCurrentMutiple(base: number) {
    let init_radio;
    let current_radio;
    if (loveTokenBalance && +loveTokenBalance > 0) {
      init_radio = new BigNumber(1)
        .plus(Math.log(+loveTokenBalance) / Math.log(base))
        .toFixed();
    }
    if (!loveTokenBalance || +loveTokenBalance == 0) {
      return <span className="text-sm text-farmText">-</span>;
    } else if (+amount == 0) {
      return (
        <span className="text-sm text-farmText">
          x{toPrecision(init_radio.toString(), 3)}
        </span>
      );
    } else if (+amount > 0) {
      if (+amount >= +loveTokenBalance) {
        current_radio = 1;
      } else {
        const remain = new BigNumber(loveTokenBalance).minus(amount).toFixed();
        current_radio = new BigNumber(1)
          .plus(Math.log(+remain) / Math.log(base))
          .toFixed();
      }
      return (
        <div className="flex items-center">
          <span className="text-sm text-farmText">
            x{toPrecision(init_radio.toString(), 3)}
          </span>
          <span className="mx-3.5">
            <BoostRightArrowIcon></BoostRightArrowIcon>
          </span>
          <span className="text-sm text-white">
            x{toPrecision(current_radio.toString(), 3)}
          </span>
        </div>
      );
    }

    if (+amount > 0) {
      const result = Math.log(+amount) / Math.log(base);
      return `x${toPrecision(result.toString(), 3)}`;
    } else {
      return '-';
    }
  }
  const isDisabled =
    !amount ||
    new BigNumber(amount).isLessThanOrEqualTo(0) ||
    new BigNumber(amount).isGreaterThan(loveTokenBalance);
  return (
    <CommonModal {...reset}>
      <div className="flex justify-between items-center mt-6">
        <span className="flex items-center text-base text-white font-bold">
          <LoveTokenIcon className="mr-2.5"></LoveTokenIcon> LOVE
        </span>
        <span className="text-sm text-white">
          {toPrecision(loveTokenBalance, 6)}
        </span>
      </div>
      <div className="flex justify-between items-center h-14 px-3 mt-4 bg-black bg-opacity-20 rounded-lg">
        <input
          type="number"
          placeholder="0.0"
          value={amount}
          onChange={({ target }) => changeAmount(target.value)}
          className="text-white text-lg focus:outline-non appearance-none leading-tight"
        ></input>
        <div className="flex items-center ml-2">
          <span
            onClick={() => {
              changeAmount(loveTokenBalance);
            }}
            className={`text-xs text-farmText px-1.5 py-0.5 rounded-lg border cursor-pointer hover:text-greenColor hover:border-greenColor ${
              amount == loveTokenBalance
                ? 'bg-black bg-opacity-20 border-black border-opacity-20'
                : 'border-maxBorderColor'
            }`}
          >
            Max
          </span>
        </div>
      </div>
      {yourAffectSeeds ? (
        <>
          <div className="flex items-center justify-between mt-6 mb-4">
            <span className="text-sm text-farmText">Your boost farm</span>
            <span className="text-sm text-farmText">Boost</span>
          </div>
          {yourAffectSeeds.map((seed: Seed) => {
            return (
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center">
                  <span className="text-white text-sm">
                    {displaySymbols(seed.pool)}
                  </span>
                </div>
                {getCurrentMutiple(seed.base)}
              </div>
            );
          })}
        </>
      ) : null}

      <GradientButton
        onClick={loveUnstake}
        color="#fff"
        disabled={loveUnStakeLoading || isDisabled}
        loading={loveUnStakeLoading || isDisabled}
        btnClassName={`${isDisabled ? 'cursor-not-allowed' : ''}`}
        className={`mt-8 w-full h-14 text-center text-lg text-white focus:outline-none font-semibold`}
        backgroundImage="linear-gradient(270deg, #7F43FF 0%, #00C6A2 97.06%)"
      >
        <ButtonTextWrapper
          loading={loveUnStakeLoading}
          Text={() => <FormattedMessage id="unstake" />}
        />
      </GradientButton>
    </CommonModal>
  );
}
function CommonModal(props: any) {
  const { isOpen, onRequestClose, title, titleIcon } = props;
  const cardWidth = isMobile() ? '90vw' : '30vw';
  const cardHeight = isMobile() ? '90vh' : '80vh';

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        overlay: {
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          overflow: 'auto',
        },
        content: {
          outline: 'none',
          transform:
            title.trim() === 'add_liquidity' && !isMobile()
              ? 'translate(-50%, -70%)'
              : 'translate(-50%, -50%)',
        },
      }}
    >
      <div className="flex flex-col">
        <div
          className="px-5 xs:px-3 md:px-3 py-6 rounded-2xl bg-cardBg overflow-auto"
          style={{
            width: cardWidth,
            maxHeight: cardHeight,
            border: '1px solid rgba(0, 198, 162, 0.5)',
          }}
        >
          <div className="title flex items-center justify-between">
            <div className="flex items-center">
              {titleIcon ? titleIcon : null}
              <label className="text-white text-xl">
                <FormattedMessage id={title}></FormattedMessage>
              </label>
            </div>
            <ModalClose className="cursor-pointer" onClick={onRequestClose} />
          </div>
          {props.children}
        </div>
      </div>
    </Modal>
  );
}
function FarmView(props: {
  seed: Seed;
  tokenPriceList: Record<string, any>;
  getDetailData: any;
  dayVolumeMap: Record<string, any>;
  boostConfig: BoostConfig;
  loveSeed: Seed;
}) {
  const {
    seed,
    tokenPriceList,
    getDetailData,
    dayVolumeMap,
    boostConfig,
    loveSeed,
  } = props;
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

  function getTotalApr(containPoolFee: boolean = true) {
    const farms = seed.farmList;
    let apr = 0;
    const allPendingFarms = isPending();
    farms.forEach(function (item: FarmBoost) {
      const pendingFarm = item.status == 'Created' || item.status == 'Pending';
      if (allPendingFarms || (!allPendingFarms && !pendingFarm)) {
        apr = +new BigNumber(apr).plus(item.apr).toFixed();
      }
    });
    let dayVolume = 0;
    if (containPoolFee) {
      dayVolume = +getPoolFeeApr(dayVolumeMap[seed.pool.id]);
    }
    if (apr == 0 && dayVolume == 0) {
      return '-';
    } else {
      apr = +new BigNumber(apr).multipliedBy(100).plus(dayVolume).toFixed();
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
    return totalPriceDisplay;
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
    const dayVolume = getPoolFeeApr(dayVolumeMap[seed.pool.id]);
    const totalApr = getTotalApr(false);
    const txt1 = intl.formatMessage({ id: 'pool_fee_apr' });
    const txt2 = intl.formatMessage({ id: 'reward_apr' });
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
          apr: new BigNumber(farm.apr || 0)
            .multipliedBy(100)
            .toFixed()
            .toString(),
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
    result = `
    <div class="flex items-center justify-between">
      <span class="text-xs text-navHighLightText mr-3">${txt1}</span>
      <span class="text-sm text-white font-bold">${
        +dayVolume > 0 ? dayVolume + '%' : '-'
      }</span>
    </div>
    <div class="flex justify-end text-white text-sm font-bold ">+</div>
    <div class="flex items-center justify-between ">
      <span class="text-xs text-navHighLightText mr-3">${txt2}</span>
      <span class="text-sm text-white font-bold">${totalApr}</span>
    </div>
    `;
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
  function getPoolFeeApr(dayVolume: string) {
    let result = '0';
    if (dayVolume) {
      const { total_fee, tvl } = seed.pool;
      const revenu24h = (total_fee / 10000) * 0.8 * Number(dayVolume);
      if (tvl > 0 && revenu24h > 0) {
        const annualisedFeesPrct = ((revenu24h * 365) / tvl) * 100;
        result = toPrecision(annualisedFeesPrct.toString(), 2);
      }
    }
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
    const isEnded = farmList[0].status == 'Ended';
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
              !isEnded && !tempFarms[id]
                ? `<span class="text-farmText text-xs">${txt}</span>`
                : ''
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
    getDetailData({
      detailData: seed,
      tokenPriceList,
      loveSeed,
      boostConfig,
    });
    const poolId = getPoolIdBySeedId(seed.seed_id);
    const status = seed.farmList[0].status == 'Ended' ? 'e' : 'r';
    history.replace(`/farmsBoost/${poolId}-${status}`);
  }
  function claimReward() {
    if (claimLoading) return;
    setClaimLoading(true);
    claimRewardBySeed_boost(seed.seed_id)
      .then(() => {
        // window.location.reload();
      })
      .catch((error) => {
        setClaimLoading(false);
        setError(error);
      });
  }
  function getBoostMutil() {
    if (!boostConfig) return '';
    const { affected_seeds } = boostConfig;
    const { seed_id, user_seed } = seed;
    const base = affected_seeds[seed_id];
    const hasUserStaked = Object.keys(user_seed).length;
    if (base && hasUserStaked && loveSeed) {
      const { free_amount = 0, locked_amount = 0 } = loveSeed.user_seed || {};
      const totalStakeLoveAmount = toReadableNumber(
        LOVE_TOKEN_DECIMAL,
        new BigNumber(free_amount).plus(locked_amount).toFixed()
      );
      const result = new BigNumber(1)
        .plus(Math.log(+totalStakeLoveAmount) / Math.log(base))
        .toFixed();
      return `x${toPrecision(result.toString(), 3)}`;
    }
    return '';
  }
  const seedToBeBoostStr = getBoostMutil();
  return (
    <>
      <div
        onClick={() => {
          goFarmDetailPage(seed);
        }}
        className={`relative rounded-2xl cursor-pointer bg-cardBg hover:shadow-blue ${
          isEnded() ? 'farmEnded' : ''
        }
      `}
      >
        <div className="flex absolute -top-3.5 z-10 justify-center w-full">
          {tokens.map((token, index) => {
            return (
              <label
                key={token.id}
                style={{
                  border: '4px solid #374958',
                }}
                className={`h-9 w-9 rounded-full overflow-hidden bg-cardBg ${
                  index != 0 ? '-ml-1' : ''
                }`}
              >
                <img src={token.icon} className="w-full h-full"></img>
              </label>
            );
          })}
        </div>
        {seedToBeBoostStr ? (
          <div className="absolute flex items-center justify-center top-3 right-4 z-10 px-2 py-0.5 bg-lightGreenColor text-xs text-black rounded-lg font-bold">
            {seedToBeBoostStr}
          </div>
        ) : null}
        <div className="boxInfo">
          <div className="relative flex flex-col items-center bg-boosBoxColor px-5 rounded-t-2xl overflow-hidden">
            <div className="flex items-center cursor-pointer text-white font-bold text-xl xs:text-sm md:text-sm mt-7">
              {tokens.map((token, index) => {
                const hLine = index === tokens.length - 1 ? '' : '-';
                return `${toRealSymbol(token.symbol)}${hLine}`;
              })}
            </div>
            <div
              className="text-white text-right"
              data-class="reactTip"
              data-for={'rewardPerWeekId' + seed?.farmList[0]?.farm_id}
              data-place="top"
              data-html={true}
              data-tip={getRewardsPerWeekTip()}
            >
              <div className="flex items-center bg-black bg-opacity-20 rounded-full p-0.5  my-4">
                <span className="flex hover:bg-black hover:bg-opacity-20 rounded-full">
                  {getAllRewardsSymbols().map(
                    ([id, icon]: [string, string], index) => {
                      return (
                        <img
                          key={id}
                          src={icon}
                          className={`h-4 w-4 rounded-full border border-gradientFromHover ${
                            index != 0 ? '-ml-1' : ''
                          }`}
                        ></img>
                      );
                    }
                  )}
                </span>
                <span className="text-farmText text-sm mx-1.5">
                  {totalTvlPerWeekDisplay()}/<FormattedMessage id="week" />
                </span>
              </div>
              <ReactTooltip
                id={'rewardPerWeekId' + seed?.farmList[0]?.farm_id}
                backgroundColor="#1D2932"
                border
                borderColor="#7e8a93"
                effect="solid"
              />
            </div>
            <div className="flex items-center justify-between">
              {error ? <Alert level="warn" message={error.message} /> : null}
            </div>
            {isPending() ? (
              <div className="farmStatus pending status-bar">
                <FormattedMessage id="comimg" defaultMessage="COMING" />
              </div>
            ) : null}
          </div>
          <div className="flex items-center justify-between px-5 py-4 h-24">
            <div className="flex flex-col items-center">
              <label className="text-farmText text-sm">
                <FormattedMessage id="total_staked"></FormattedMessage>
              </label>
              <label className="text-white text-base mt-1.5">
                {`${
                  Number(seed.seedTvl) == 0
                    ? '-'
                    : `$${toInternationalCurrencySystem(seed.seedTvl, 2)}`
                }`}
              </label>
            </div>
            <div className="flex flex-col items-center">
              <span className="flex items-center">
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
                <span className="text-white text-base mt-1.5">
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
            {haveUnclaimedReward() ? (
              <div className="flex flex-col items-center">
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
                  <div className="bg-black bg-opacity-20 rounded-lg p-1">
                    <div>
                      <span className="flex items-center text-sm text-white py-1 justify-center">
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
                      className="flex items-center justify-center bg-deepBlue rounded-lg text-sm text-white h-7 w-16 cursor-pointer"
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
                </div>
              </div>
            ) : null}
          </div>
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
          boostConfig={boostConfig}
          loveSeed={loveSeed}
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
  const [yourReward, setYourReward] = useState('-');
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
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

  function switchDetailStatus() {
    setWithdrawModalVisible(true);
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
  function closeWithDrawBox() {
    setWithdrawModalVisible(false);
  }
  return (
    <div className="rounded-xl overflow-hidden mb-3.5 mt-5">
      <div className="relative bg-veGradient px-5" style={{ height: '68px' }}>
        <span className="text-white text-xs bg-senderHot rounded-b-lg px-3 py-0.5">
          <label className="text-black text-xs font-bold">
            <FormattedMessage id="claimed_Rewards"></FormattedMessage>
          </label>
        </span>
        <div className="flex items-center justify-between mt-2">
          <label className="text-white text-xl font-bold">{yourReward}</label>
          <div
            onClick={switchDetailStatus}
            className="flex items-center text-white text-xs cursor-pointer"
          >
            <FormattedMessage id="details" />
            <UpArrowIcon className={`ml-2 transform rotate-180`} />
          </div>
        </div>
      </div>
      <WithDrawModal
        userRewardList={userRewardList}
        tokenPriceList={tokenPriceList}
        farmDisplayList={farmDisplayList}
        isOpen={withdrawModalVisible}
        onRequestClose={closeWithDrawBox}
      ></WithDrawModal>
    </div>
  );
}
function WithDrawModal(props: {
  userRewardList: any;
  tokenPriceList: any;
  farmDisplayList: Seed[];
  isOpen: boolean;
  onRequestClose: any;
}) {
  const {
    userRewardList,
    tokenPriceList,
    farmDisplayList,
    isOpen,
    onRequestClose,
  } = props;
  const actualRewardList = {};
  Object.entries(userRewardList).forEach(([key, value]) => {
    if (Number(value) > 0) {
      actualRewardList[key] = value;
    }
  });
  const [rewardList, setRewardList] = useState([]);
  const [checkedList, setCheckedList] = useState<Record<string, any>>({});
  const [selectAll, setSelectAll] = useState(false);
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
  const cardWidth = isMobile() ? '90vw' : '30vw';
  const cardHeight = isMobile() ? '90vh' : '80vh';
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        overlay: {
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          overflow: 'auto',
        },
        content: {
          outline: 'none',
          transform: 'translate(-50%, -50%)',
        },
      }}
    >
      <div className="flex flex-col">
        <div className="flex flex-col">
          <div
            className="rounded-2xl bg-cardBg overflow-auto"
            style={{
              width: cardWidth,
              maxHeight: cardHeight,
              border: '1px solid rgba(0, 198, 162, 0.5)',
            }}
          >
            <div className="bg-veGradient" style={{ height: '68px' }}>
              <div className="relative px-5 pt-3">
                <div className="flex justify-end">
                  <ModalClose
                    className="cursor-pointer"
                    fillColor="#fff"
                    onClick={onRequestClose}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 px-2">
                  <span className="text-white text-lg font-bold">
                    <FormattedMessage id="claimed_Rewards"></FormattedMessage>
                  </span>
                  <span className="text-white text-xl font-bold">
                    {yourReward}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <div
                className={`pl-3 pr-6 max-h-96 overflow-auto pt-5 px-5 xs:px-3 md:px-3`}
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
                  <label
                    className="mr-3 cursor-pointer"
                    onClick={clickAllCheckBox}
                  >
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
                      Object.keys(checkedList).length == 0
                        ? 'cursor-not-allowed'
                        : ''
                    }
                    loading={withdrawLoading}
                    backgroundImage="linear-gradient(270deg, #7F43FF 0%, #00C6A2 97.06%)"
                  >
                    <div>
                      <ButtonTextWrapper
                        loading={withdrawLoading}
                        Text={() => (
                          <FormattedMessage
                            id="withdraw"
                            defaultMessage="Withdraw"
                          />
                        )}
                      />
                    </div>
                  </GradientButton>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center bg-cardBg justify-between rounded-lg mt-3 px-3.5 py-3">
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
    </Modal>
  );
}
const getPoolIdBySeedId = (seed_id: string) => {
  return seed_id.slice(seed_id.indexOf('@') + 1);
};
