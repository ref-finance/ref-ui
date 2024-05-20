import React, { useEffect, useRef, useState, useContext, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import SelectBox from '../../components/farm/SelectBox';
import {
  CalcIcon,
  ArrowDownIcon,
  SearchIcon,
  BoostOptIcon,
  NearOptIcon,
  EthOptIcon,
  OthersOptIcon,
  Flight,
  LoveIcon,
  LoveTokenIcon,
  BoostRightArrowIcon,
  DirectionButton,
  BoostLoveIcon,
  WarningIcon,
  LightningBase64,
  LightningBase64Grey,
  BoostFarmBannerImg,
  BoostFarmNoDataIcon,
  BoostDotIcon,
  NewTag,
  NewIcon,
  ForbiddonIcon,
  StableOption,
  MemeOptIcon,
} from '../../components/icon/FarmBoost';
import {
  GradientButton,
  ButtonTextWrapper,
  GreenConnectToNearBtn,
} from '../../components/button/Button';
import {
  Checkbox,
  CheckboxSelected,
  NoDataIcon,
  SortIcon,
} from '../../components/icon';
import QuestionMark from '../../components/farm/QuestionMark';
import CalcModelBooster from '../../components/farm/CalcModelBooster';
import CalcModelDcl from '../../components/farm/CalcModelDcl';
import {
  classificationOfCoins_key,
  getFarmClassification,
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
  getBoostTokenPrices,
  getBoostSeeds,
  useMigrate_user_data,
  getVeSeedShare,
  list_seeds_info,
} from '../../services/farm';
import { getLoveAmount } from '../../services/referendum';
import { WalletContext } from '../../utils/wallets-integration';
import getConfig from '../../services/config';
import { PoolRPCView } from '../../services/api';
import {
  toPrecision,
  toReadableNumber,
  toNonDivisibleNumber,
  toInternationalCurrencySystem,
  formatWithCommas,
} from '../../utils/numbers';
import { ftGetTokenMetadata } from '../../services/ft-contract';
import { BigNumber } from 'bignumber.js';
import { useTokens } from '../../state/token';
import { toRealSymbol } from '../../utils/token';
import { isMobile } from '../../utils/device';
import moment from 'moment';
import { useHistory, useLocation } from 'react-router-dom';
import Alert from '../../components/alert/Alert';
import Loading, { BeatLoading } from '../../components/layout/Loading';
import { TokenMetadata, REF_META_DATA } from '../../services/ft-contract';
import { get24hVolumes, getPoolsByIds } from '../../services/indexer';
import Modal from 'react-modal';
import { ModalClose } from '../../components/icon';
import { LockPopUp, getVEPoolId } from '../../pages/ReferendumPage';
import { wnearMetadata, unwrapedNear } from '../../services/wrap-near';
import { usePoolShare, useYourliquidity } from '../../state/pool';
import { useAccountInfo, LOVE_TOKEN_DECIMAL } from '../../state/referendum';
import { VEARROW } from '../icon/Referendum';
import Countdown, { zeroPad } from 'react-countdown';
import { MoreButtonIcon } from '../../components/icon/Common';
import getConfigV2 from '../../services/configV2';

import _ from 'lodash';
import { PoolInfo } from 'src/services/swapV3';
import {
  getPriceByPoint,
  get_total_value_by_liquidity_amount_dcl,
  get_matched_seeds_for_dcl_pool,
  TOKEN_LIST_FOR_RATE,
  displayNumberToAppropriateDecimals,
  getEffectiveFarmList,
  sort_tokens_by_base,
  get_pool_id,
  get_pool_name,
  openUrl,
} from '../../services/commonV3';
import CustomTooltip from 'src/components/customTooltip/customTooltip';
import LPTip from './LPTip';

const {
  REF_VE_CONTRACT_ID,
  FARM_BLACK_LIST_V2,
  boostBlackList,
  REF_UNI_V3_SWAP_CONTRACT_ID,
} = getConfig();
export default function FarmsHome(props: any) {
  const {
    getDetailData,
    getDetailData_user_data,
    getDetailData_boost_config,
    getDayVolumeMap,
  } = props;
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
  const { user_migrate_seeds, seed_loading, user_claimed_rewards } =
    useMigrate_user_data();

  const [showEndedFarmList, setShowEndedFarmList] = useState(
    localStorage.getItem('endedfarmShow') == '1' ? true : false
  );
  let [homePageLoading, setHomePageLoading] = useState(true);
  const intl = useIntl();

  const [noData, setNoData] = useState(false);
  const [count, setCount] = useState(0);
  const [dayVolumeMap, setDayVolumeMap] = useState({});
  const searchRef = useRef(null);
  const refreshTime = 300000;
  const sortList = {
    // tvl: intl.formatMessage({ id: 'tvl' }),
    // apr: intl.formatMessage({ id: 'apr' }),
    tvl: 'TVL',
    apr: 'APR',
  };
  const coinList = { all: intl.formatMessage({ id: 'allOption' }) };
  classificationOfCoins_key.forEach((key) => {
    coinList[key] = intl.formatMessage({ id: key });
  });
  const [loveTokenBalance, setLoveTokenBalance] = useState<string>('0');
  const [loveTokeStaked, setLoveTokeStaked] = useState('0');
  let [loveSeed, setLoveSeed] = useState<Seed>(null);
  let [boostConfig, setBoostConfig] = useState<BoostConfig>(null);

  const [loveStakeModalVisible, setLoveStakeModalVisible] = useState(false);
  const [loveUnStakeModalVisible, setLoveUnStakeModalVisible] = useState(false);
  const [showLoveTokenModalVisible, setShowLoveTokenModalVisible] =
    useState(false);
  let [user_seeds_map, set_user_seeds_map] = useState<
    Record<string, UserSeedInfo>
  >({});
  const [user_unclaimed_map, set_user_unclaimed_map] = useState<
    Record<string, any>
  >({});
  const [user_unclaimed_token_meta_map, set_user_unclaimed_token_meta_map] =
    useState<Record<string, any>>({});
  const [globalConfigLoading, setGlobalConfigLoading] = useState<boolean>(true);
  const [userDataLoading, setUserDataLoading] = useState<boolean>(true);
  const [boostInstructions, setBoostInstructions] = useState<boolean>(false);
  const [maxLoveShareAmount, setMaxLoveShareAmount] = useState<string>('0');
  const local_storage_tab = localStorage.getItem('BOOST_FARM_RAB');
  const history = useHistory();
  const [farmTypeList, setFarmTypeList] = useState([
    { id: 'all', label: 'all' },
    { id: 'dcl', label: 'dcl_farms' },
    { id: 'classic', label: 'classic_farms' },
  ]);
  const [filterTypeList, setFilterTypeList] = useState([
    { id: 'all', label: 'all' },
    {
      id: 'boost',
      name: 'Boost',
      icon: <BoostOptIcon></BoostOptIcon>,
      hidden: REF_VE_CONTRACT_ID ? false : true,
    },
    { id: 'near', name: 'NEAR', icon: <NearOptIcon></NearOptIcon> },
    { id: 'stable', name: 'Stable', icon: <StableOption></StableOption> },
    { id: 'eth', name: 'ETH', icon: <EthOptIcon></EthOptIcon> },
    { id: 'meme', name: 'Meme', icon: <MemeOptIcon></MemeOptIcon> },
    { id: 'new', name: 'New', icon: <NewIcon></NewIcon> },
    { id: 'others', name: 'Others', icon: <OthersOptIcon></OthersOptIcon> },
  ]);
  const [sort, setSort] = useState('apr');
  const [keyWords, setKeyWords] = useState('');
  const [farmTab, setFarmTab] = useState(
    localStorage.getItem('BOOST_FARM_TAB') || 'all'
  ); // all、yours
  const [farm_type_selectedId, set_farm_type_selectedId] = useState('all');
  const [filter_type_selectedId, set_filter_type_selectedId] = useState('all');
  const [has_dcl_farms_in_display_list, set_has_dcl_farms_in_display_list] =
    useState(true);
  const [your_seeds_quantity, set_your_seeds_quantity] = useState('-');

  /** search area options end **/
  useEffect(() => {
    init();
    getConfig();
    get_user_unWithDraw_rewards();
    get_user_seeds_and_unClaimedRewards();
    getLoveTokenBalance();
    get_ve_seed_share();
  }, [isSignedIn]);
  useEffect(() => {
    if (count > 0) {
      init();
      get_user_seeds_and_unClaimedRewards();
    }
    const intervalId = setInterval(() => {
      setCount(count + 1);
    }, refreshTime);
    return () => {
      clearInterval(intervalId);
    };
  }, [count]);
  useEffect(() => {
    searchByCondition();
  }, [farm_type_selectedId, filter_type_selectedId, keyWords, farmTab]);
  useEffect(() => {
    sortFarms();
  }, [sort]);
  useEffect(() => {
    if (farm_display_List?.length > 0) {
      getYourFarmsQuantity();
    }
  }, [farm_display_List]);
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
  async function getLoveTokenBalance() {
    // get LoveToken balance
    if (isSignedIn && REF_VE_CONTRACT_ID) {
      const loveBalance = await getLoveAmount();
      setLoveTokenBalance(toReadableNumber(LOVE_TOKEN_DECIMAL, loveBalance));
    }
  }
  async function getConfig() {
    const config = await get_config();
    const data = config.booster_seeds[REF_VE_CONTRACT_ID];
    boostConfig = data;
    setBoostConfig(data);
    setGlobalConfigLoading(false);
    searchByCondition();
    // for detail page
    getDetailData_boost_config(data);
  }
  async function init() {
    let list_seeds: Seed[];
    let list_farm: FarmBoost[][];
    let pools: PoolRPCView[];
    const result = await getBoostSeeds();
    const { seeds: seeds_from_cache, farms, pools: cachePools } = result;
    // replace cache seeds with server seeds due to apr display
    let seeds: Seed[] = [];
    const seeds_from_server = await list_seeds_info();
    const seeds_from_server_map = {};
    seeds_from_server.forEach((s: Seed) => {
      seeds_from_server_map[s.seed_id] = s;
    });
    seeds_from_cache.forEach((s: Seed) => {
      if (seeds_from_server_map[s.seed_id]) {
        seeds.push(seeds_from_server_map[s.seed_id]);
      }
    });
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
    setTokenPriceList(tokenPriceList);
    // get pool apr
    getAllPoolsDayVolume(list_seeds);
    getFarmDataList({
      list_seeds,
      list_farm,
      tokenPriceList,
      pools,
    });
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
      setUserDataLoading(false);
      // for detail page
      getDetailData_user_data({
        user_seeds_map: list_user_seeds,
        user_unclaimed_token_meta_map: unclaimed_token_meta_datas,
        user_unclaimed_map: userUncliamedRewards,
      });
      searchByCondition();
    }
  }
  async function getFarmDataList(initData: any) {
    const { list_seeds, tokenPriceList, pools } = initData;
    const promise_new_list_seeds = list_seeds.map(async (newSeed: Seed) => {
      const {
        seed_id,
        farmList,
        total_seed_amount,
        total_seed_power,
        seed_decimal,
      } = newSeed;
      const [contractId, temp_pool_id] = seed_id.split('@');
      let is_dcl_pool = false;
      if (contractId == REF_UNI_V3_SWAP_CONTRACT_ID) {
        is_dcl_pool = true;
      }
      const poolId = getPoolIdBySeedId(seed_id);
      const pool = pools.find((pool: PoolRPCView & PoolInfo) => {
        if (is_dcl_pool) {
          if (pool.pool_id == poolId) return true;
        } else {
          if (+pool.id == +poolId) return true;
        }
      });
      let token_ids: string[] = [];
      if (is_dcl_pool) {
        const [token_x, token_y, fee] = poolId.split('|');
        token_ids.push(token_x, token_y);
      } else {
        const { token_account_ids } = pool;
        token_ids = token_account_ids;
      }
      const promise_token_meta_data: Promise<any>[] = [];
      token_ids.forEach(async (tokenId: string) => {
        promise_token_meta_data.push(ftGetTokenMetadata(tokenId));
      });
      const tokens_meta_data = await Promise.all(promise_token_meta_data);
      pool.tokens_meta_data = tokens_meta_data;
      const promise_farm_meta_data = farmList.map(async (farm: FarmBoost) => {
        const tokenId = farm.terms.reward_token;
        const tokenMetadata = await ftGetTokenMetadata(tokenId);
        farm.token_meta_data = tokenMetadata;
        return farm;
      });
      await Promise.all(promise_farm_meta_data);
      // get seed tvl
      const DECIMALS = seed_decimal;
      const seedTotalStakedAmount = toReadableNumber(
        DECIMALS,
        total_seed_amount
      );
      let single_lp_value = '0';
      if (is_dcl_pool) {
        const [fixRange, dcl_pool_id, left_point, right_point] =
          temp_pool_id.split('&');
        const [token_x, token_y] = dcl_pool_id.split('|');
        const [token_x_meta, token_y_meta] = tokens_meta_data;
        const price_x = tokenPriceList[token_x]?.price || '0';
        const price_y = tokenPriceList[token_y]?.price || '0';
        const temp_valid = +right_point - +left_point;
        const range_square = Math.pow(temp_valid, 2);
        const amount = new BigNumber(Math.pow(10, 12))
          .dividedBy(range_square)
          .toFixed();
        single_lp_value = get_total_value_by_liquidity_amount_dcl({
          left_point: +left_point,
          right_point: +right_point,
          amount,
          poolDetail: pool,
          price_x_y: { [token_x]: price_x, [token_y]: price_y },
          metadata_x_y: { [token_x]: token_x_meta, [token_y]: token_y_meta },
        });
      } else {
        const { tvl, id, shares_total_supply } = pool;
        const poolShares = Number(
          toReadableNumber(DECIMALS, shares_total_supply)
        );
        if (poolShares == 0) {
          single_lp_value = '0';
        } else {
          single_lp_value = (tvl / poolShares).toString();
        }
      }
      const seedTotalStakedPower = toReadableNumber(DECIMALS, total_seed_power);
      const seedTvl = new BigNumber(seedTotalStakedAmount)
        .multipliedBy(single_lp_value)
        .toFixed();
      const seedPowerTvl = new BigNumber(seedTotalStakedPower)
        .multipliedBy(single_lp_value)
        .toFixed();
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
          +seedPowerTvl == 0
            ? '0'
            : new BigNumber(readableNumber)
                .multipliedBy(365)
                .multipliedBy(reward_token_price)
                .dividedBy(seedPowerTvl)
                .toFixed();
        const baseApr =
          +seedTvl == 0
            ? '0'
            : new BigNumber(readableNumber)
                .multipliedBy(365)
                .multipliedBy(reward_token_price)
                .dividedBy(seedTvl)
                .toFixed();

        farm.apr = apr;
        farm.baseApr = baseApr;
      });
      newSeed.pool = pool;
      newSeed.seedTvl = seedTvl || '0';
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
    });
    searchByCondition('main');
  }
  async function getAllPoolsDayVolume(list_seeds: Seed[]) {
    const tempMap = {};
    const poolIds: string[] = [];
    const seedIds: string[] = [];
    list_seeds.forEach((seed: Seed) => {
      seedIds.push(seed.seed_id);
    });
    seedIds.forEach((seedId: string) => {
      const [contractId, temp_pool_id] = seedId.split('@');
      if (contractId !== REF_UNI_V3_SWAP_CONTRACT_ID) {
        poolIds.push(temp_pool_id);
      }
    });
    // get24hVolume
    try {
      const resolvedResult = await get24hVolumes(poolIds);
      poolIds.forEach((poolId: string, index: number) => {
        tempMap[poolId] = resolvedResult[index];
      });
      setDayVolumeMap(tempMap);
      // for detail page
      getDayVolumeMap(tempMap);
    } catch (error) {}
  }
  function getSpecialSeed({
    tokenPriceList,
    farm_display_List,
    loveSeed,
  }: {
    tokenPriceList: any;
    farm_display_List: Seed[];
    loveSeed: Seed;
  }) {
    const paramStr = getUrlParams() || '';
    if (paramStr) {
      let is_dcl_pool = false;
      const idArr = [
        paramStr.slice(0, paramStr.length - 2),
        paramStr.slice(-1),
      ];
      const mft_id = decodeURIComponent(idArr[0]);
      const farmsStatus = idArr[1];
      if (mft_id.split('|').length > 1) {
        is_dcl_pool = true;
      }
      const targetFarms = farm_display_List.find((seed: Seed) => {
        const { seed_id, farmList } = seed;
        const status = farmList[0].status;
        const id = getPoolIdBySeedId(seed_id);
        if (is_dcl_pool) {
          const [contractId, temp_pool_id] = seed_id.split('@');
          if (contractId == REF_UNI_V3_SWAP_CONTRACT_ID) {
            const [fixRange, pool_id, left_point, right_point] =
              temp_pool_id.split('&');
            const temp = `${pool_id}&${left_point}&${right_point}`;
            if (farmsStatus == 'r' && status != 'Ended' && mft_id == temp)
              return true;
            if (farmsStatus == 'e' && status == 'Ended' && mft_id == temp)
              return true;
          }
        } else {
          if (farmsStatus == 'r' && status != 'Ended' && mft_id == id)
            return true;
          if (farmsStatus == 'e' && status == 'Ended' && mft_id == id)
            return true;
        }
      });
      if (!targetFarms) {
        history.replace('/v2farms');
      } else {
        getDetailData({
          detailData: targetFarms,
          tokenPriceList,
          loveSeed,
          all_seeds: farm_display_List,
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
    try {
      // http://localhost:1234/v2farms/USDC<>NEAR@2000[406600-408600]-r new link
      // phoenix-bonds.near|wrap.near|2000&3080&4040-r
      const pathArr = location.pathname.split('/');
      const layer1 = decodeURIComponent(pathArr[2] || '');
      if (layer1) {
        if (layer1.indexOf('<>') > -1 || layer1.indexOf('|') > -1) {
          // dcl link
          if (layer1.indexOf('<>') == -1) {
            // compatible with old link
            const [tokena_id, tokenb_id, fee_p_s] = layer1.split('|');
            const [fee_p, status] = fee_p_s.split('-');
            const [fee, lp, rp] = fee_p.split('&');
            const replace_str = `${get_pool_name(
              `${tokena_id}|${tokenb_id}|${fee}`
            )}[${lp}-${rp}]-${status}`;
            location.replace(`/v2farms/${replace_str}`);
            return layer1;
          }
          const layer2 = layer1.split('[');
          const pool_id = get_pool_id(layer2[0]);
          const point_str = layer2[1].substring(0, layer2[1].length - 3);
          const status = layer2[1].substring(layer2[1].length - 1);
          const p_arr = split_point_string(point_str);
          const [lp, rp] = p_arr;
          return `${pool_id}&${lp}&${rp}-${status}`;
        } else {
          // classic link
          return layer1;
        }
      }
    } catch (error) {
      return '';
    }

    return '';
  }
  function split_point_string(str: string) {
    const arr = Array.from(str);
    let index;
    for (let i = 0; i < arr.length; i++) {
      if (str[i] == '-' && i !== 0) {
        index = i;
        break;
      }
    }
    return [str.slice(0, index), str.slice(index + 1)];
  }
  async function get_user_unWithDraw_rewards() {
    if (isSignedIn) {
      const userRewardList = await get_unWithDraw_rewards();
      set_user_unWithdraw_rewards(userRewardList);
    }
  }
  function changeSort(sortKey: any) {
    setSort(sortKey);
  }
  function getYourFarmsQuantity() {
    const yourSeeds: Seed[] = [];
    // filter out yours
    farm_display_List.forEach((seed: Seed) => {
      const { seed_id, farmList } = seed;
      const isEnd = farmList[0].status == 'Ended';
      const user_seed = user_seeds_map[seed_id];
      const userStaked = Object.keys(user_seed || {}).length > 0;
      let condition;
      const commonSeedFarms = mergeCommonSeedsFarms();
      if (userStaked) {
        const commonSeedFarmList = commonSeedFarms[seed_id] || [];
        if (commonSeedFarmList.length == 2 && isEnd) {
          condition = false;
        } else {
          condition = true;
        }
      }
      if (condition) {
        yourSeeds.push(seed);
      }
    });
    set_your_seeds_quantity(yourSeeds.length.toString());
  }
  function searchByCondition(from?: string) {
    farm_display_List = farm_display_List.sort();
    farm_display_ended_List = farm_display_ended_List.sort();
    let noDataEnd = true,
      noDataLive = true;
    const commonSeedFarms = mergeCommonSeedsFarms();
    const farmClassification = getFarmClassification();
    // filter
    farm_display_List.forEach((seed: Seed) => {
      const { pool, seed_id, farmList } = seed;
      const isEnd = farmList[0].status == 'Ended';
      const user_seed = user_seeds_map[seed_id];
      const userStaked = Object.keys(user_seed || {}).length > 0;
      const { tokens_meta_data } = pool;
      const token_symbols: string[] = [];
      tokens_meta_data.forEach((token: TokenMetadata) => {
        token_symbols.push(token.symbol);
      });
      const [contractId] = seed_id.split('@');
      let condition1, condition2, condition3, condition4;
      const is_dcl_farm = contractId == REF_UNI_V3_SWAP_CONTRACT_ID;
      // farm status
      if (isEnd) {
        condition4 = false;
      } else {
        condition4 = true;
      }
      // farm_type
      if (farmTab == 'yours') {
        condition3 = true;
        condition4 = true;
      } else if (farm_type_selectedId == 'all') {
        condition3 = true;
      } else if (farm_type_selectedId == 'dcl') {
        if (is_dcl_farm) {
          condition3 = true;
        } else {
          condition3 = false;
        }
      } else if (farm_type_selectedId == 'classic') {
        if (!is_dcl_farm) {
          condition3 = true;
        } else {
          condition3 = false;
        }
      }
      // filter_type
      if (farmTab == 'yours') {
        if (userStaked) {
          const commonSeedFarmList = commonSeedFarms[seed_id] || [];
          if (commonSeedFarmList.length == 2 && isEnd) {
            condition1 = false;
          } else {
            condition1 = true;
          }
        }
      } else if (filter_type_selectedId == 'all') {
        condition1 = true;
      } else if (filter_type_selectedId == 'boost' && boostConfig) {
        const affected_seeds_keys = Object.keys(boostConfig.affected_seeds);
        if (affected_seeds_keys.indexOf(seed_id) > -1) {
          condition1 = true;
        } else {
          condition1 = false;
        }
      } else if (filter_type_selectedId == 'near') {
        if (farmClassification.near.indexOf(getPoolIdBySeedId(seed_id)) > -1) {
          condition1 = true;
        } else {
          condition1 = false;
        }
      } else if (filter_type_selectedId == 'eth') {
        if (farmClassification.eth.indexOf(getPoolIdBySeedId(seed_id)) > -1) {
          condition1 = true;
        } else {
          condition3 = false;
        }
      } else if (filter_type_selectedId == 'stable') {
        if (
          farmClassification.stable.indexOf(getPoolIdBySeedId(seed_id)) > -1
        ) {
          condition1 = true;
        } else {
          condition3 = false;
        }
      } else if (filter_type_selectedId == 'meme') {
        if (farmClassification.meme.indexOf(getPoolIdBySeedId(seed_id)) > -1) {
          condition1 = true;
        } else {
          condition3 = false;
        }
      } else if (filter_type_selectedId == 'others') {
        // others
        const isNotNear =
          farmClassification.near.indexOf(getPoolIdBySeedId(seed_id)) == -1;
        const isNotEth =
          farmClassification.eth.indexOf(getPoolIdBySeedId(seed_id)) == -1;
        const isNotStable =
          farmClassification.stable.indexOf(getPoolIdBySeedId(seed_id)) == -1;
        const isNotMeme =
          farmClassification.meme.indexOf(getPoolIdBySeedId(seed_id)) == -1;
        if (isNotNear && isNotEth && isNotStable && isNotMeme) {
          condition1 = true;
        } else {
          condition1 = false;
        }
      } else if (filter_type_selectedId == 'new') {
        if (!is_dcl_farm) {
          // in month
          const m = isInMonth(seed);
          if (m) {
            condition1 = true;
          } else {
            condition1 = false;
          }
        } else {
          // new dcl
          condition1 = false;
          const matched_seeds = get_matched_seeds_for_dcl_pool({
            seeds: farm_display_List,
            pool_id: pool.pool_id,
            sort: 'new',
          });
          if (matched_seeds.length > 1) {
            const latestSeed = matched_seeds[0];
            if (latestSeed.seed_id == seed.seed_id) {
              condition1 = true;
            }
          } else if (!condition1) {
            // in month
            const m = isInMonth(seed);
            if (m) {
              condition1 = true;
            } else {
              condition1 = false;
            }
          }
        }
      }
      // key words
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
      if (condition1 && condition2 && condition3 && condition4) {
        seed.hidden = false;
        noDataLive = false;
      } else {
        seed.hidden = true;
      }
    });
    farm_display_ended_List.forEach((seed: Seed) => {
      const { pool, seed_id } = seed;
      const { tokens_meta_data } = pool;
      const token_symbols: string[] = [];
      tokens_meta_data.forEach((token: TokenMetadata) => {
        token_symbols.push(token.symbol);
      });
      const [contractId] = seed_id.split('@');
      const is_dcl_farm = contractId == REF_UNI_V3_SWAP_CONTRACT_ID;
      let condition1, condition3;
      let condition2 = true;
      // farm_type
      if (farm_type_selectedId == 'all') {
        condition3 = true;
      } else if (farm_type_selectedId == 'dcl') {
        if (is_dcl_farm) {
          condition3 = true;
        } else {
          condition3 = false;
        }
      } else if (farm_type_selectedId == 'classic') {
        if (!is_dcl_farm) {
          condition3 = true;
        } else {
          condition3 = false;
        }
      }
      // filter_type
      if (filter_type_selectedId == 'all') {
        condition1 = true;
      } else if (filter_type_selectedId == 'boost' && boostConfig) {
        const affected_seeds_keys = Object.keys(boostConfig.affected_seeds);
        if (affected_seeds_keys.indexOf(seed_id) > -1) {
          condition1 = true;
        } else {
          condition1 = false;
        }
      } else if (filter_type_selectedId == 'near') {
        if (farmClassification.near.indexOf(getPoolIdBySeedId(seed_id)) > -1) {
          condition1 = true;
        } else {
          condition1 = false;
        }
      } else if (filter_type_selectedId == 'eth') {
        if (farmClassification.eth.indexOf(getPoolIdBySeedId(seed_id)) > -1) {
          condition1 = true;
        } else {
          condition1 = false;
        }
      } else if (filter_type_selectedId == 'stable') {
        if (
          farmClassification.stable.indexOf(getPoolIdBySeedId(seed_id)) > -1
        ) {
          condition1 = true;
        } else {
          condition1 = false;
        }
      } else if (filter_type_selectedId == 'meme') {
        if (farmClassification.meme.indexOf(getPoolIdBySeedId(seed_id)) > -1) {
          condition1 = true;
        } else {
          condition1 = false;
        }
      } else if (filter_type_selectedId == 'others') {
        const isNotNear =
          farmClassification.near.indexOf(getPoolIdBySeedId(seed_id)) == -1;
        const isNotEth =
          farmClassification.eth.indexOf(getPoolIdBySeedId(seed_id)) == -1;
        const isNotStable =
          farmClassification.stable.indexOf(getPoolIdBySeedId(seed_id)) == -1;
        const isNotMeme =
          farmClassification.stable.indexOf(getPoolIdBySeedId(seed_id)) == -1;
        if (isNotNear && isNotEth && isNotStable && isNotMeme) {
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
      }
      if (condition1 && condition2 && condition3) {
        seed.hidden = false;
        noDataEnd = false;
      } else {
        seed.hidden = true;
      }
    });
    // displayed dcl farms
    const dcl_farms = farm_display_List.filter((seed: Seed) => {
      const { seed_id, hidden } = seed;
      const [contractId] = seed_id.split('@');
      const is_dcl_farm = contractId == REF_UNI_V3_SWAP_CONTRACT_ID;
      return is_dcl_farm && !hidden;
    });
    if (farmTab == 'yours') {
      setNoData(noDataLive);
    } else {
      setNoData(noDataEnd && noDataLive);
    }
    if (from == 'main') {
      setHomePageLoading(false);
    }
    // sort
    if (dcl_farms.length > 0) {
      set_has_dcl_farms_in_display_list(true);
      sortFarms('apr');
      setSort('apr');
    } else {
      sortFarms(sort);
      set_has_dcl_farms_in_display_list(false);
    }
    if (keyWords) {
      setShowEndedFarmList(true);
    } else {
      setShowEndedFarmList(
        localStorage.getItem('endedfarmShow') == '1' ? true : false
      );
    }
  }
  function sortFarms(s?: string) {
    const sort_v = s || sort;
    if (sort_v == 'apr') {
      farm_display_List.sort((item1: Seed, item2: Seed) => {
        const item1PoolId = item1.pool.id || item1.pool.pool_id;
        const item2PoolId = item2.pool.id || item2.pool.pool_id;
        const item1Front = frontConfigBoost[item1PoolId];
        const item2Front = frontConfigBoost[item2PoolId];
        if (item1Front || item2Front) {
          return Number(item2Front || 0) - Number(item1Front || 0);
        }
        const item1Apr = getTotalAprForSeed(JSON.parse(JSON.stringify(item1)));
        const item2Apr = getTotalAprForSeed(JSON.parse(JSON.stringify(item2)));
        return Number(item2Apr) - Number(item1Apr);
      });
      farm_display_ended_List.sort((item1: Seed, item2: Seed) => {
        const item1PoolId = item1.pool.id || item1.pool.pool_id;
        const item2PoolId = item2.pool.id || item2.pool.pool_id;
        const item1Front = frontConfigBoost[item1PoolId];
        const item2Front = frontConfigBoost[item2PoolId];
        if (item1Front || item2Front) {
          return Number(item2Front || 0) - Number(item1Front || 0);
        }
        const item1Apr = getTotalAprForSeed(JSON.parse(JSON.stringify(item1)));
        const item2Apr = getTotalAprForSeed(JSON.parse(JSON.stringify(item2)));
        return Number(item2Apr) - Number(item1Apr);
      });
    } else if (sort_v == 'tvl') {
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
      farm_display_ended_List.sort((item1: Seed, item2: Seed) => {
        const item1PoolId = item1.pool.id;
        const item2PoolId = item2.pool.id;
        const item1Front = frontConfigBoost[item1PoolId];
        const item2Front = frontConfigBoost[item2PoolId];
        if (item1Front || item2Front) {
          return Number(item2Front || 0) - Number(item1Front || 0);
        }
        return Number(item2.seedTvl) - Number(item1.seedTvl);
      });
    }
    set_farm_display_List(farm_display_List);
    set_farm_display_ended_List(Array.from(farm_display_ended_List));
  }
  function isEnded(seed: Seed) {
    const farms = seed.farmList;
    return farms[0].status == 'Ended';
  }

  function isInMonth(seed: Seed) {
    const endedStatus = isEnded(seed);
    if (endedStatus) return false;
    const farmList = seed.farmList;
    const result = farmList.find((farm: FarmBoost) => {
      const start_at = farm?.terms?.start_at;
      if (start_at == 0) return true;
      const one_month_seconds = 15 * 24 * 60 * 60;
      const currentA = new Date().getTime();
      const compareB = new BigNumber(start_at)
        .plus(one_month_seconds)
        .multipliedBy(1000);
      const compareResult = compareB.minus(currentA);
      if (compareResult.isGreaterThan(0)) {
        return true;
      }
    });
    if (result) return true;
    return false;
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
    const poolApy = getPoolFeeApr(dayVolumeMap[seed.pool.id], seed);
    if (poolApy) {
      apr = +new BigNumber(poolApy)
        .plus(new BigNumber(apr || 0).multipliedBy(100).toFixed())
        .toFixed();
    }
    return apr;
  }
  function getPoolFeeApr(dayVolume: string, seed: Seed) {
    let result = '0';
    if (dayVolume) {
      const { total_fee, tvl } = seed.pool;
      const revenu24h = (total_fee / 10000) * 0.8 * Number(dayVolume);
      if (tvl > 0 && revenu24h > 0) {
        const annualisedFeesPrct = ((revenu24h * 365) / tvl) * 100;
        const half_annualisedFeesPrct = annualisedFeesPrct;
        result = toPrecision(half_annualisedFeesPrct.toString(), 2);
      }
    }
    return result;
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
    const love_user_seed = user_seeds_map[REF_VE_CONTRACT_ID];
    if (love_user_seed) {
      // user has staked
      const { free_amount, locked_amount } = love_user_seed;
      const totalAmount = new BigNumber(free_amount)
        .plus(locked_amount)
        .toFixed();
      loveStakedAmount = toReadableNumber(LOVE_TOKEN_DECIMAL, totalAmount);
      setLoveTokeStaked(loveStakedAmount);
    }
    if (!loveStakedAmount || +loveStakedAmount == 0) {
      return isSignedIn ? <label className="opacity-50">0.000</label> : '-';
    } else if (new BigNumber(loveStakedAmount).isLessThan(0.001)) {
      return '<0.001';
    } else {
      return toPrecision(loveStakedAmount, 3);
    }
  }
  function switchStatus() {
    setBoostInstructions(!boostInstructions);
  }
  function LoveBox(props: any) {
    const { inside } = props;
    const noLoveRelatedAmount =
      isSignedIn && +loveTokenBalance == 0 && +loveTokeStaked == 0;
    return (
      <div
        className={`relative flex flex-col items-center justify-between rounded-2xl p-4 pb-6 ${
          inside
            ? 'xs:hidden md:hidden 2xl:hidden flex-grow ml-5 pr-2 lg:pl-8 xl:pl-16'
            : 'lg:hidden xl:hidden 2xl:flex'
        }`}
        style={{
          backgroundImage: inside
            ? ''
            : 'linear-gradient(90deg, #7C47FD 0%, #34177C 100%)',
        }}
      >
        <span className="absolute -top-5">
          <LoveIcon
            linear0={inside ? 'paint0_linear_1477_3' : ''}
            linear1={inside ? 'paint1_linear_1477_3' : ''}
            linear2={inside ? 'path-3-outside-1_1477_3' : ''}
          ></LoveIcon>
        </span>
        <div
          className={`flex items-center text-white text-2xl ${
            inside ? 'mt-4 mb-2' : 'mt-6'
          }`}
        >
          <FormattedMessage id="love" />
          <LoveMask />
        </div>
        <div className="flex justify-between items-center w-full">
          <div className="flex flex-col items-center stakeBox w-2 flex-grow mx-1.5">
            <span className="text-white opacity-50 text-sm whitespace-nowrap">
              <FormattedMessage id="Available_to_stake" />
            </span>
            <span className="text-white text-lg my-1 whitespace-nowrap">
              {getLoveBalance()}
            </span>
            {!isSignedIn ? null : isSignedIn && +loveTokenBalance == 0 ? (
              <div
                onClick={() => {
                  setShowLoveTokenModalVisible(true);
                }}
                className={`flex items-center justify-center h-full w-full cursor-pointer text-sm text-white border border-greenColor p-px py-1 rounded-lg hover:bg-black hover:bg-opacity-20 ${
                  noLoveRelatedAmount ? 'hidden' : ''
                }`}
              >
                <FormattedMessage id="get_love"></FormattedMessage>
                <VEARROW className="ml-1"></VEARROW>
              </div>
            ) : (
              <div
                onClick={() => {
                  setLoveStakeModalVisible(true);
                }}
                className="flex items-center justify-center cursor-pointer text-sm text-black bg-darkGreenColor hover:bg-lightGreenColor rounded-lg w-full py-1 border border-greenColor border-opacity-0"
              >
                <FormattedMessage id="stake"></FormattedMessage>
              </div>
            )}
          </div>
          <div className="flex flex-col items-center  unstakeBox w-2 flex-grow mx-1.5">
            <span className="text-white opacity-50 text-sm whitespace-nowrap">
              <FormattedMessage id="you_staked" />
            </span>
            <span className="text-white text-lg my-1">
              {getLoveUserStaked()}
            </span>
            {!isSignedIn ? null : (
              <div
                onClick={() => {
                  setLoveUnStakeModalVisible(true);
                }}
                className={`flex items-center whitespace-nowrap justify-center h-full min-w-full cursor-pointer text-sm text-white border border-greenColor px-px py-1 rounded-lg hover:bg-black hover:bg-opacity-20 ${
                  noLoveRelatedAmount ? 'hidden' : ''
                }`}
              >
                <FormattedMessage id="unstake"></FormattedMessage>
              </div>
            )}
          </div>
        </div>
        {!isSignedIn ? (
          <GreenConnectToNearBtn className="w-full"></GreenConnectToNearBtn>
        ) : null}
        {noLoveRelatedAmount ? (
          <div
            onClick={() => {
              setShowLoveTokenModalVisible(true);
            }}
            className="flex items-center justify-center w-full cursor-pointer text-sm text-white border border-greenColor p-px py-1 rounded-lg hover:bg-black hover:bg-opacity-20"
          >
            <FormattedMessage id="get_love"></FormattedMessage>{' '}
            <VEARROW className="ml-1"></VEARROW>
          </div>
        ) : null}
      </div>
    );
  }
  const endFarmLength = useMemo(() => {
    return getFarmVisibleLength();
  }, [farm_display_ended_List]);
  function switchFarmTab(tab: string) {
    setFarmTab(tab);
    localStorage.setItem('BOOST_FARM_TAB', tab);
    if (tab == 'yours') {
      set_farm_type_selectedId('all');
      set_filter_type_selectedId('all');
    }
  }
  const showMigrateEntry = !seed_loading && user_migrate_seeds.length > 0;
  const isMobileSite = isMobile();
  return (
    <div className={`lg:-mt-6 ${getUrlParams() ? 'hidden' : ''}`}>
      <div
        className="relative flex items-center justify-center mb-5 xs:mb-3 md:mb-3 xs:flex-col md:flex-col xs:bg-cardBg md:bg-cardBg"
        style={{
          height: isMobileSite ? '' : '265px',
          backgroundImage: isMobileSite
            ? ''
            : 'linear-gradient(180deg, #001320 0%, #0C2427 100%)',
        }}
      >
        <div className="relative h-full  flex justify-between items-start lg:w-5/6 xl:w-2/3 xs:w-full md:w-full pt-5 pb-3 xs:pb-0 md:pb-0">
          <div className="lg:w-2/5 md:w-1/2 xs:w-full xs:px-3 md:px-3 xs:pt-2 md:pt-2">
            <div className="title flex justify-between items-center text-3xl text-white xs:-mt-4 md:-mt-4 pl-2 mb-4">
              <FormattedMessage id="farms"></FormattedMessage>
            </div>
            <WithDrawBox
              userRewardList={user_unWithdraw_rewards}
              tokenPriceList={tokenPriceList}
              farmDisplayList={farm_display_List}
            ></WithDrawBox>
            {Object.keys(user_claimed_rewards).length > 0 ||
            showMigrateEntry ? (
              <div className="flex items-center justify-start text-sm text-primaryText mt-3 xs:mt-0 md:mt-0 xs:mb-2 md:mb-2">
                <WarningIcon className="mr-1.5 flex-shrink-0" />
                {/* <span
                  dangerouslySetInnerHTML={{
                    __html: intl.formatMessage({ id: 'has_rewards_tip_in_v2' }),
                  }}
                ></span> */}
                <span>
                  <FormattedMessage id="legacy_tip" />{' '}
                  <a
                    onClick={() => {
                      openUrl('/farms');
                    }}
                    className="text-sm text-greenColor cursor-pointer underline ml-1 hover:text-senderHot"
                  >
                    {' '}
                    <FormattedMessage id="legacy_farms" />
                  </a>
                  .
                </span>
              </div>
            ) : null}
            <div className="lg:absolute lg:bottom-5 flex items-center xsm:mb-1">
              <div
                className={`text-white text-lg gotham_bold ml-2 mr-16 xsm:mr-10 cursor-pointer ${
                  farmTab == 'all' ? '' : 'text-opacity-50'
                }`}
                onClick={() => {
                  switchFarmTab('all');
                }}
              >
                <FormattedMessage id="all_farms" />
              </div>
              <div
                onClick={() => {
                  switchFarmTab('yours');
                }}
                className={`flex items-center text-white text-lg gotham_bold cursor-pointer ${
                  farmTab == 'yours' ? '' : 'text-opacity-50'
                }`}
              >
                <FormattedMessage id="your_farms_2" />
                <span
                  className={`flex items-center justify-center h-5 px-2 rounded-t-lg rounded-br-lg bg-senderHot text-black text-sm gotham_bold ml-1.5 ${
                    farmTab == 'yours' ? '' : 'opacity-30'
                  }`}
                >
                  {isSignedIn ? your_seeds_quantity : '-'}
                </span>
              </div>
            </div>
          </div>
          <div className="absolute right-0 -bottom-2 xs:hidden md:hidden">
            <BoostFarmBannerImg style={{ width: '517px' }}></BoostFarmBannerImg>
          </div>
        </div>
        {/* for mobile search area */}
        <div className="flex items-center justify-between w-full mt-2 lg:hidden px-3 mb-3">
          <div
            className={`flex items-center justify-between px-4 h-9 py-1 xsm:w-full bg-farmSbg rounded-lg bg-opacity-50 ${
              keyWords ? 'border border-borderLightBlueColor' : ''
            }`}
          >
            <input
              ref={searchRef}
              type="text"
              className="h-full text-sm text-white mr-3 w-40 xsm:w-full placeholder-white placeholder-opacity-40"
              onWheel={() => searchRef.current.blur()}
              onChange={({ target }) => searchByKeyWords(target.value)}
              placeholder={intl.formatMessage({ id: 'search_farms' })}
            ></input>
            <span
              className={`${
                keyWords ? 'text-lightGreenColor' : 'text-farmText'
              }`}
            >
              <SearchIcon></SearchIcon>
            </span>
          </div>
          <div className={`flex items-center ml-3`}>
            <label className="text-farmText text-xs mr-2 whitespace-nowrap xs:hidden md:hidden">
              <FormattedMessage id="sort_by" defaultMessage="Sort by" />
            </label>
            <span className="text-farmText">
              <SortIcon></SortIcon>
            </span>
            <div className="flex items-center rounded-lg p-1 h-9">
              {Object.keys(sortList).map((item, index) => {
                const value = sortList[item];
                const disabled = has_dcl_farms_in_display_list && item == 'tvl';
                return (
                  <div
                    className={`flex items-center justify-between rounded-lg px-1.5 h-full py-0.5 cursor-pointer text-xs ${
                      sort == item ? 'text-white' : 'text-farmText'
                    } ${disabled ? 'text-opacity-50' : ''}`}
                    key={index}
                    onClick={() => {
                      if (disabled) return;
                      changeSort(item);
                    }}
                  >
                    {value}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="searchArea m-auto lg:w-5/6 xl:w-2/3 xs:w-full md:w-full flex justify-between flex-wrap items-center mb-6 xs:mb-4 md:mb-4 xs:flex-col md:flex-col xs:px-3 md:px-3">
          <div className="flex items-center xsm:justify-between xsm:w-full xsm:mb-6">
            <SelectBox
              list={farmTypeList}
              width={isMobileSite ? 'w-44' : 'w-56'}
              disabled={farmTab == 'yours'}
              containerClass="lg:mr-2.5 xsm:mr-1"
              type={`${isMobileSite ? 'farm_2' : 'farm_type'}`}
              selectedId={farm_type_selectedId}
              setSelectedId={set_farm_type_selectedId}
            ></SelectBox>
            <SelectBox
              list={filterTypeList}
              width={isMobileSite ? 'w-40' : 'w-44'}
              type="filter"
              disabled={farmTab == 'yours'}
              selectedId={filter_type_selectedId}
              setSelectedId={set_filter_type_selectedId}
            ></SelectBox>
          </div>
          <div className="flex items-center  justify-between mb-5 xs:hidden md:hidden">
            <div className={`flex items-center mr-2.5`}>
              <label className="text-farmText text-xs mr-1 whitespace-nowrap">
                <FormattedMessage id="sort_by" defaultMessage="Sort by" />:
              </label>
              {Object.keys(sortList).map((item, index) => {
                const value = sortList[item];
                const disabled = has_dcl_farms_in_display_list && item == 'tvl';
                return (
                  <div
                    className={`flex items-center justify-between rounded-lg h-9  px-3 py-0.5 ml-1 text-xs ${
                      sort == item ? 'bg-cardBg text-white' : 'text-farmText'
                    } ${
                      disabled
                        ? 'text-opacity-50 cursor-not-allowed'
                        : 'hover:bg-cardBg cursor-pointer'
                    }`}
                    key={index}
                    onClick={() => {
                      if (disabled) return;
                      changeSort(item);
                    }}
                  >
                    {value}
                  </div>
                );
              })}
            </div>
            <div
              className={`flex items-center justify-between px-4 h-9 py-1 bg-searchBgColor rounded-lg ${
                keyWords ? 'border border-borderLightBlueColor' : ''
              }`}
            >
              <input
                ref={searchRef}
                type="text"
                className="h-full text-sm text-white mr-3 w-40 xs:w-32 md:w-32 placeholder-white placeholder-opacity-40"
                onWheel={() => searchRef.current.blur()}
                onChange={({ target }) => searchByKeyWords(target.value)}
                placeholder={intl.formatMessage({
                  id: 'search_farms_by_token',
                })}
              ></input>
              <span
                className={`${
                  keyWords ? 'text-lightGreenColor' : 'text-farmText'
                }`}
              >
                <SearchIcon></SearchIcon>
              </span>
            </div>
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
                  {((filter_type_selectedId == 'boost' ||
                    filter_type_selectedId == 'others') &&
                    globalConfigLoading) ||
                  (farmTab == 'yours' && isSignedIn && userDataLoading) ? (
                    'Loading ...'
                  ) : (
                    <FormattedMessage id="no_result"></FormattedMessage>
                  )}
                </span>
              </div>
            ) : null}
            {/* boost start */}
            {!loveSeed ? null : (
              <div
                className={`grid grid-cols-2 xs:grid-cols-1 md:grid-cols-1 2xl:grid-cols-3 gap-x-5 gap-y-9 xs:gap-x-0 md:gap-x-0  m-auto lg:w-5/6 xl:w-2/3 xs:w-full md:w-full xs:px-3 md:px-3 mb-9 ${
                  filter_type_selectedId != 'boost' || noData ? 'hidden' : ''
                }`}
              >
                <div className="col-span-2 xs:col-span-1 md:col-span-1">
                  <div className="flex items-center justify-between lg:hidden">
                    <span className="text-2xl text-white font-bold">
                      Booster
                    </span>
                    <span className="flex items-center" onClick={switchStatus}>
                      <label
                        className={`text-farmText text-sm mr-2 ${
                          boostInstructions ? 'hidden' : ''
                        }`}
                      >
                        <FormattedMessage id="how_to_get" />
                      </label>
                      <DirectionButton
                        className={
                          boostInstructions ? '' : 'transform rotate-180'
                        }
                      ></DirectionButton>
                    </span>
                  </div>
                  <div
                    className={`flex justify-between xs:h-auto md:h-auto h-full rounded-2xl xs:justify-center bg-cardBg md:justify-center xs:mt-3 md:mt-3 ${
                      !boostInstructions && isMobileSite ? 'hidden' : ''
                    }`}
                  >
                    <div className="flex flex-col justify-between  items-center lg:items-start pl-16 pb-14 pt-5 xs:pl-0 md:pl-0">
                      <span
                        className="text-white xs:hidden md:hidden transform -translate-x-9"
                        style={{ fontSize: '32px' }}
                      >
                        <FormattedMessage id="booster" />
                      </span>
                      <div className="flex justify-center items-center">
                        <div className="relative flex items-center justify-center mr-1.5">
                          <span
                            className="ball flex items-center justify-center bg-greyCircleColor text-sm text-priceBoardColor rounded-full"
                            style={{ width: '22px', height: '22px' }}
                          >
                            1
                          </span>
                          <span
                            onClick={() => {
                              setShowLoveTokenModalVisible(true);
                            }}
                            className="absolute xs:-left-8 md:-left-8 flex items-center justify-center text-sm xs:text-xs md:text-xs  text-greenColor border border-greenColor bg-mengColor bg-opacity-50 hover:bg-black rounded-lg top-8 whitespace-nowrap px-2 py-1 cursor-pointer"
                          >
                            <FormattedMessage id="get_love" />{' '}
                            <VEARROW className="ml-1"></VEARROW>
                          </span>
                        </div>
                        <div className="line w-32 h-px bg-white bg-opacity-20 xs:w-24 md:w-24"></div>
                        <div className="relative flex items-center justify-center mx-1.5">
                          <span
                            className="ball flex items-center justify-center bg-greyCircleColor text-sm text-priceBoardColor rounded-full"
                            style={{ width: '22px', height: '22px' }}
                          >
                            2
                          </span>
                          <span
                            onClick={() => {
                              setLoveStakeModalVisible(true);
                            }}
                            className="absolute xs:-left-8 md:-left-8 flex items-center justify-center text-sm xs:text-xs md:text-xs text-greenColor border border-greenColor bg-mengColor bg-opacity-50 hover:bg-black rounded-lg top-8 whitespace-nowrap px-2 py-1 cursor-pointer"
                          >
                            <FormattedMessage id="stakeLove" />
                          </span>
                        </div>
                        <div className="line w-32 h-px bg-white bg-opacity-20 xs:w-24 md:w-24"></div>
                        <div className="relative flex items-center justify-center ml-1.5">
                          <span
                            className="ball flex items-center justify-center bg-greyCircleColor text-sm text-priceBoardColor rounded-full"
                            style={{ width: '22px', height: '22px' }}
                          >
                            3
                          </span>
                          <span className="absolute flex items-center justify-center text-sm xs:text-xs md:text-xs text-greyCircleColor rounded-lg top-8 whitespace-nowrap px-5 py-1 xs:-left-15 md:-left-15">
                            <FormattedMessage id="get_booster" />
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="xs:hidden md:hidden lg:hidden xl:hidden 2xl:block">
                      <Flight></Flight>
                    </div>
                    <LoveBox inside={true}></LoveBox>
                  </div>
                </div>
                <LoveBox inside={false}></LoveBox>
              </div>
            )}
            {REF_VE_CONTRACT_ID ? (
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
                user_seeds_map={user_seeds_map}
                user_unclaimed_map={user_unclaimed_map}
                user_unclaimed_token_meta_map={user_unclaimed_token_meta_map}
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
                user_seeds_map={user_seeds_map}
                user_unclaimed_map={user_unclaimed_map}
                user_unclaimed_token_meta_map={user_unclaimed_token_meta_map}
              ></LoveUnStakeModal>
            ) : null}
            {/* boost end */}
            <div className="farmListArea grid grid-cols-2 xs:grid-cols-1 md:grid-cols-1 2xl:grid-cols-3 gap-x-5 gap-y-9 m-auto lg:w-5/6 xl:w-2/3 xs:px-3 md:px-3 xs:w-full md:w-full">
              {farm_display_List.map((seed: Seed, index: number) => {
                return (
                  <div
                    key={seed.seed_id + index}
                    className={seed.hidden ? 'hidden' : ''}
                  >
                    <FarmView
                      seed={seed}
                      all_seeds={farm_display_List}
                      tokenPriceList={tokenPriceList}
                      getDetailData={getDetailData}
                      dayVolumeMap={dayVolumeMap}
                      boostConfig={boostConfig}
                      loveSeed={loveSeed}
                      user_seeds_map={user_seeds_map}
                      user_unclaimed_map={user_unclaimed_map}
                      user_unclaimed_token_meta_map={
                        user_unclaimed_token_meta_map
                      }
                      maxLoveShareAmount={maxLoveShareAmount}
                    ></FarmView>
                  </div>
                );
              })}
            </div>
            <div
              className={`${
                endFarmLength > 0 && farmTab != 'yours' ? '' : 'hidden'
              }`}
            >
              <div
                className={`flex items-center ${
                  showEndedFarmList ? 'justify-between' : 'justify-end'
                } m-auto lg:w-5/6 xl:w-2/3 xs:w-full md:w-full my-10 xs:my-8 md:my-8 xs:px-3 md:px-3 xs:flex-col md:flex-col`}
              >
                <div
                  onClick={switchEndedFarmListDisplayStatus}
                  className="flex items-center justify-center text-xs text-farmText cursor-pointer lg:hidden"
                >
                  <ArrowDownIcon
                    className={showEndedFarmList ? 'transform rotate-180' : ''}
                  ></ArrowDownIcon>
                  <a className="text-xs text-greenColor mx-1">
                    {showEndedFarmList ? 'Hidden' : 'Show'}
                  </a>
                  <FormattedMessage id="ended_farms" />
                </div>
                <p
                  className={`text-xl text-farmText xs:mt-5 md:mt-5 ${
                    showEndedFarmList ? '' : 'hidden'
                  }`}
                >
                  <FormattedMessage id="ended_Farms"></FormattedMessage>
                </p>
                <div
                  onClick={switchEndedFarmListDisplayStatus}
                  className="flex items-center justify-center text-xs text-farmText cursor-pointer xs:hidden md:hidden"
                >
                  <ArrowDownIcon
                    className={showEndedFarmList ? 'transform rotate-180' : ''}
                  ></ArrowDownIcon>
                  <a className="text-xs text-greenColor mx-1">
                    {showEndedFarmList ? 'Hidden' : 'Show'}
                  </a>
                  <FormattedMessage id="ended_farms" />
                </div>
              </div>
              <div
                className={`farmListArea grid grid-cols-2 xs:grid-cols-1 md:grid-cols-1 2xl:grid-cols-3 gap-x-5 gap-y-9 m-auto lg:w-5/6 xl:w-2/3 xs:w-full md:w-full xs:px-3 md:px-3 ${
                  showEndedFarmList ? '' : 'hidden'
                }`}
              >
                {farm_display_ended_List.map((seed: Seed, index: number) => {
                  return (
                    <div
                      key={seed.seed_id + index}
                      className={seed.hidden ? 'hidden' : ''}
                    >
                      <FarmView
                        seed={seed}
                        all_seeds={farm_display_List}
                        tokenPriceList={tokenPriceList}
                        getDetailData={getDetailData}
                        dayVolumeMap={dayVolumeMap}
                        boostConfig={boostConfig}
                        loveSeed={loveSeed}
                        user_seeds_map={user_seeds_map}
                        user_unclaimed_map={user_unclaimed_map}
                        user_unclaimed_token_meta_map={
                          user_unclaimed_token_meta_map
                        }
                        maxLoveShareAmount={maxLoveShareAmount}
                      ></FarmView>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
function GetLoveTokenModal(props: { isOpen: boolean; onRequestClose: any }) {
  const { isOpen, onRequestClose } = props;
  const REF_NEAR_TOKENS = [REF_META_DATA, unwrapedNear];
  const id = getVEPoolId();
  const lpShare = usePoolShare(id);
  const { accountInfo } = useAccountInfo();
  const { farmStakeV1, farmStakeV2 } = useYourliquidity(Number(getVEPoolId()));
  return (
    <LockPopUp
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      tokens={REF_NEAR_TOKENS}
      lpShare={lpShare}
      accountInfo={accountInfo}
      title="get_love"
      farmStakeV1={farmStakeV1}
      farmStakeV2={farmStakeV2}
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
  user_seeds_map: Record<string, UserSeedInfo>;
  user_unclaimed_token_meta_map: Record<string, any>;
  user_unclaimed_map: Record<string, any>;
}) {
  const {
    loveTokenBalance,
    loveSeed,
    boostConfig,
    farm_display_List,
    user_seeds_map,
    user_unclaimed_token_meta_map,
    user_unclaimed_map,
    ...reset
  } = props;
  const [amount, setAmount] = useState('');
  const [loveStakeLoading, setLoveStakeLoading] = useState(false);
  const [amountAvailableCheck, setAmountAvailableCheck] = useState(true);
  const [affectSeeds, setAffectSeeds] = useState<Seed[]>(null);
  const { affected_seeds } = boostConfig;
  const intl = useIntl();
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
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
    const love_user_seed = user_seeds_map[REF_VE_CONTRACT_ID];
    const { free_amount = 0, locked_amount = 0 } = love_user_seed || {};
    const lastTotalAmount = toReadableNumber(
      LOVE_TOKEN_DECIMAL,
      new BigNumber(free_amount).plus(locked_amount).toFixed()
    );
    if (+amount > 0) {
      const totalAmount = new BigNumber(lastTotalAmount).plus(amount).toFixed();
      let result;
      if (+totalAmount < 1) {
        result = 1;
      } else {
        result = new BigNumber(1)
          .plus(Math.log(+totalAmount) / Math.log(base))
          .toFixed(2);
      }
      return `x${toPrecision(result.toString(), 2)}`;
    } else if (+lastTotalAmount > 0) {
      let result;
      if (+lastTotalAmount < 1) {
        result = 1;
      } else {
        result = new BigNumber(1)
          .plus(Math.log(+lastTotalAmount) / Math.log(base))
          .toFixed(2);
      }
      return `x${toPrecision(result.toString(), 2)}`;
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
        <div className="flex items-center text-base text-white font-bold">
          <LoveTokenIcon className="mr-2.5"></LoveTokenIcon> LOVE
          <LoveMask />
        </div>
        <span className="text-sm text-white">
          {toPrecision(loveTokenBalance, 6)}
        </span>
      </div>
      <div className="flex justify-between items-center h-14 px-3 mt-4 bg-black bg-opacity-20 rounded-lg">
        <input
          type="number"
          placeholder="0.0"
          value={amount}
          inputMode="decimal"
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
        <span className="text-sm text-farmText">
          <FormattedMessage id="boosted_farms" />
        </span>
        <span className="text-sm text-farmText">
          <FormattedMessage id="boost" />
        </span>
      </div>
      {affectSeeds &&
        affectSeeds.map((seed: Seed) => {
          const user_seed = user_seeds_map[seed.seed_id] || {};
          return (
            <div
              className="flex items-center justify-between mb-2.5"
              key={seed.seed_id}
            >
              <div className="flex items-center">
                <span className="text-white text-sm">
                  {displaySymbols(seed.pool)}
                </span>
                {Object.keys(user_seed).length > 0 ? (
                  <span className="ml-3 text-sm text-lightGreenColor bg-black bg-opacity-20 rounded-lg px-1.5 py-1">
                    <FormattedMessage id="your_farm" />
                  </span>
                ) : null}
              </div>
              <div
                className={`flex items-center text-base ${
                  Object.keys(user_seed).length > 0
                    ? 'text-lightGreenColor'
                    : 'text-farmText'
                }`}
              >
                {Object.keys(user_seed).length > 0 ? (
                  <BoostLoveIcon></BoostLoveIcon>
                ) : null}
                {getCurrentMutiple(seed.base)}
              </div>
            </div>
          );
        })}
      {isSignedIn ? (
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
      ) : (
        <GreenConnectToNearBtn className="h-9 mt-8 text-base w-full"></GreenConnectToNearBtn>
      )}
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
  user_seeds_map: Record<string, UserSeedInfo>;
  user_unclaimed_token_meta_map: Record<string, any>;
  user_unclaimed_map: Record<string, any>;
}) {
  const {
    loveSeed,
    boostConfig,
    farm_display_List,
    user_seeds_map,
    user_unclaimed_token_meta_map,
    user_unclaimed_map,
    ...reset
  } = props;
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
        const user_seed = user_seeds_map[seed.seed_id] || {};
        const userHasStaked = Object.keys(user_seed).length > 0;
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
    const love_user_seed = user_seeds_map[REF_VE_CONTRACT_ID];
    if (love_user_seed) {
      // user has staked
      const { free_amount, locked_amount } = love_user_seed || {};
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
      if (+loveTokenBalance < 1) {
        init_radio = 1;
      } else {
        init_radio = new BigNumber(1)
          .plus(Math.log(+loveTokenBalance) / Math.log(base))
          .toFixed(2);
      }
    }
    if (!loveTokenBalance || +loveTokenBalance == 0) {
      return <span className="text-sm text-farmText">-</span>;
    } else if (+amount == 0) {
      return (
        <span className="text-sm text-farmText">
          x{toPrecision(init_radio.toString(), 2)}
        </span>
      );
    } else if (+amount > 0) {
      if (+amount >= +loveTokenBalance) {
        current_radio = 1;
      } else {
        const remain = new BigNumber(loveTokenBalance).minus(amount).toFixed();
        if (+remain < 1) {
          current_radio = 1;
        } else {
          current_radio = new BigNumber(1)
            .plus(Math.log(+remain) / Math.log(base))
            .toFixed(2);
        }
      }
      return (
        <div className="flex items-center">
          <span className="text-sm text-farmText">
            x{toPrecision(init_radio.toString(), 2)}
          </span>
          <span className="mx-3.5">
            <BoostRightArrowIcon></BoostRightArrowIcon>
          </span>
          <span className="text-sm text-white">
            x{toPrecision(current_radio.toString(), 2)}
          </span>
        </div>
      );
    }
  }
  const isDisabled =
    !amount ||
    new BigNumber(amount).isLessThanOrEqualTo(0) ||
    new BigNumber(amount).isGreaterThan(loveTokenBalance);
  return (
    <CommonModal {...reset}>
      <div className="flex justify-between items-center mt-6">
        <div className="flex items-center text-base text-white font-bold">
          <LoveTokenIcon className="mr-2.5"></LoveTokenIcon>{' '}
          <FormattedMessage id="love" />
          <LoveMask />
        </div>
        <span className="text-sm text-white">
          {toPrecision(loveTokenBalance, 6)}
        </span>
      </div>
      <div className="flex justify-between items-center h-14 px-3 mt-4 bg-black bg-opacity-20 rounded-lg">
        <input
          type="number"
          placeholder="0.0"
          value={amount}
          inputMode="decimal"
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
      {yourAffectSeeds && yourAffectSeeds.length ? (
        <>
          <div className="flex items-center justify-between mt-6 mb-4">
            <span className="text-sm text-farmText">
              <FormattedMessage id="your_boosted_farms" />
            </span>
            <span className="text-sm text-farmText">
              <FormattedMessage id="boost" />
            </span>
          </div>
          {yourAffectSeeds.map((seed: Seed) => {
            return (
              <div
                className="flex items-center justify-between mb-2.5"
                key={seed.seed_id}
              >
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
          transform: 'translate(-50%, -50%)',
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
  all_seeds?: Seed[];
  tokenPriceList: Record<string, any>;
  getDetailData: any;
  dayVolumeMap: Record<string, any>;
  boostConfig: BoostConfig;
  loveSeed: Seed;
  user_seeds_map: Record<string, UserSeedInfo>;
  user_unclaimed_map: Record<string, any>;
  user_unclaimed_token_meta_map: Record<string, any>;
  maxLoveShareAmount: string;
}) {
  const {
    seed,
    tokenPriceList,
    getDetailData,
    dayVolumeMap,
    boostConfig,
    loveSeed,
    user_seeds_map,
    user_unclaimed_map,
    user_unclaimed_token_meta_map,
    maxLoveShareAmount,
    all_seeds,
  } = props;
  const { pool, seedTvl, total_seed_amount, seed_id, farmList, seed_decimal } =
    seed;
  const [contractId, temp_pool_id] = seed_id.split('@');
  let is_dcl_pool = false;
  if (contractId == REF_UNI_V3_SWAP_CONTRACT_ID) {
    is_dcl_pool = true;
  }
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const [claimLoading, setClaimLoading] = useState(false);
  const [calcVisible, setCalcVisible] = useState(false);
  const [dclCalcVisible, setDclCalcVisible] = useState(false);
  const [error, setError] = useState<Error>();
  const [aprSwitchStatus, setAprSwitchStatus] = useState('1');
  const [lpSwitchStatus, setLpSwitchStatus] = useState('1');
  const [yourApr, setYourApr] = useState('');
  const [yourActualAprRate, setYourActualAprRate] = useState('1');
  const tokens = sortTokens(seed.pool.tokens_meta_data);
  const unClaimedTokens = useTokens(
    Object.keys(user_unclaimed_map[seed_id] || {})
  );
  const history = useHistory();
  const intl = useIntl();
  const rate_need_to_reverse_display = useMemo(() => {
    const { tokens_meta_data } = seed.pool;
    if (tokens_meta_data) {
      const [tokenX] = tokens_meta_data;
      if (TOKEN_LIST_FOR_RATE.indexOf(tokenX.symbol) > -1) return true;
      return false;
    }
  }, [seed]);
  useEffect(() => {
    const yourApr = getYourApr();
    if (yourApr) {
      setYourApr(yourApr);
    }
  }, [boostConfig, user_seeds_map]);
  function sortTokens(tokens: TokenMetadata[]) {
    tokens.sort((a: TokenMetadata, b: TokenMetadata) => {
      if (a.symbol === 'NEAR') return 1;
      if (b.symbol === 'NEAR') return -1;
      return 0;
    });
    return tokens;
  }
  function getTotalApr(containPoolFee: boolean = true) {
    let dayVolume = 0;
    if (containPoolFee) {
      dayVolume = +getPoolFeeApr(dayVolumeMap[seed.pool.id]);
    }
    let apr = getActualTotalApr();
    if (new BigNumber(apr).isEqualTo(0) && dayVolume == 0) {
      return '-';
    } else {
      const temp = new BigNumber(apr).multipliedBy(100).plus(dayVolume);
      if (temp.isLessThan(0.01)) {
        return '<0.01%';
      } else {
        return toPrecision(temp.toFixed(), 2) + '%';
      }
    }
  }
  function getActualTotalApr() {
    const farms = seed.farmList;
    let apr = '0';
    const allPendingFarms = isPending();
    farms.forEach(function (item: FarmBoost) {
      const pendingFarm = item.status == 'Created' || item.status == 'Pending';
      if (allPendingFarms || (!allPendingFarms && !pendingFarm)) {
        apr = new BigNumber(apr).plus(item.apr).toFixed();
      }
    });
    return apr;
  }
  function getActualTotalBaseApr() {
    const farms = seed.farmList;
    let apr = 0;
    const allPendingFarms = isPending();
    farms.forEach(function (item: FarmBoost) {
      const pendingFarm = item.status == 'Created' || item.status == 'Pending';
      if (allPendingFarms || (!allPendingFarms && !pendingFarm)) {
        apr = +new BigNumber(apr).plus(item.baseApr).toFixed();
      }
    });
    return apr;
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
    const effectiveFarms = getEffectiveFarmList(farms);
    effectiveFarms.forEach((farm: FarmBoost) => {
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
      const num = (user_unclaimed_map[seed.seed_id] || {})[id];
      const amount = toReadableNumber(decimals, num || '0');
      const tokenPrice = tokenPriceList[id]?.price;
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
    const [contractId, temp_mft_id] = seed.seed_id.split('@');
    let totalApr;
    const baseAPR = getTotalApr(false);
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
    if (yourApr && +aprSwitchStatus == 1) {
      totalApr = yourApr;
    } else {
      totalApr = baseAPR;
    }
    // show last display string
    let result: string = '';
    const pool_fee_apr_dom =
      contractId != REF_UNI_V3_SWAP_CONTRACT_ID
        ? `<div class="flex items-center justify-between">
    <span class="text-xs text-navHighLightText mr-3">${txt1}</span>
    <span class="text-sm text-white font-bold">${
      +dayVolume > 0 ? dayVolume + '%' : '-'
    }</span>
  </div><div class="flex justify-end text-white text-sm font-bold ">+</div>`
        : '';
    result = `
    ${pool_fee_apr_dom} 
    <div class="flex items-center justify-between ">
      <span class="text-xs text-navHighLightText mr-3">${txt2}</span>
      <span class="text-sm text-white font-bold">${totalApr}</span>
    </div>
    `;
    if (yourApr && +aprSwitchStatus == 1) {
      const displayYourActualAprRate = new BigNumber(yourActualAprRate).toFixed(
        2
      );
      result += `<div class="flex items-center justify-end text-xs text-farmText">
        (${baseAPR}<span class="flex items-center ${
        +displayYourActualAprRate == 1 ? 'text-farmText' : 'text-senderHot'
      } text-xs ml-0.5">x${displayYourActualAprRate}<img src="${
        +displayYourActualAprRate == 1
          ? LightningBase64Grey()
          : LightningBase64()
      }"/></span>)
      </div>`;
    }
    function display_apr(apr: string) {
      const apr_big = new BigNumber(apr || 0);
      if (apr_big.isEqualTo(0)) {
        return '-';
      } else if (apr_big.isLessThan(0.01)) {
        return '<0.01%';
      } else {
        return formatWithCommas(toPrecision(apr, 2)) + '%';
      }
    }
    lastList.forEach((item: any) => {
      const { rewardToken, apr: baseApr, pending, startTime } = item;
      const token = rewardToken;
      let itemHtml = '';
      let apr = baseApr;
      if (yourApr && +aprSwitchStatus == 1 && yourActualAprRate) {
        apr = new BigNumber(apr).multipliedBy(yourActualAprRate).toFixed();
      }
      if (pending) {
        const startDate = moment.unix(startTime).format('YYYY-MM-DD');
        const txt = intl.formatMessage({ id: 'start' });
        itemHtml = `<div class="flex justify-between items-center h-8">
          <img class="w-5 h-5 rounded-full mr-7" style="filter: grayscale(100%)" src="${
            token.icon
          }"/>
          <div class="flex flex-col items-end">
            <label class="text-xs text-farmText">${display_apr(apr)}</label>
            <label class="text-xs text-farmText ${
              +startTime == 0 ? 'hidden' : ''
            }">${txt}: ${startDate}</label>
            <label class="text-xs text-farmText mt-0.5 ${
              +startTime == 0 ? '' : 'hidden'
            }">Pending</label>
          </div>
      </div>`;
      } else {
        itemHtml = `<div class="flex justify-between items-center h-8">
          <img class="w-5 h-5 rounded-full mr-7" src="${token.icon}"/>
          <label class="text-xs text-navHighLightText">${display_apr(
            apr
          )}</label>
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
        const half_annualisedFeesPrct = annualisedFeesPrct;
        result = toPrecision(half_annualisedFeesPrct.toString(), 2);
      }
    }
    return result;
  }
  function getUnClaimTip() {
    let resultTip = '';
    const { farmList, seed_id } = seed;
    const unclaimedMap = user_unclaimed_map[seed_id] || {};
    const tokenIds = Object.keys(unclaimedMap);
    const tempFarms = {};
    farmList.forEach((farm: FarmBoost) => {
      tempFarms[farm.terms.reward_token] = true;
    });
    const isEnded = farmList[0].status == 'Ended';
    tokenIds?.forEach((tokenId: string) => {
      const token: TokenMetadata = user_unclaimed_token_meta_map[tokenId] || {};
      // total price
      const { id, decimals, icon } = token;
      const amount = toReadableNumber(decimals, unclaimedMap[id] || '0');
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
    function display_number(value: string | number) {
      if (!value) return value;
      const [whole, decimals] = value.toString().split('.');
      const whole_format = formatWithCommas(whole);
      if (+whole < 1 && decimals) {
        return whole_format + '.' + decimals;
      } else {
        return whole_format;
      }
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
                      <label class="text-xs text-farmText">${display_number(
                        commonRewardTotalRewardsPerWeek
                      )}</label>
                      </div>

                      <label class="text-xs text-farmText mt-0.5 ${
                        +startTime == 0 ? 'hidden' : ''
                      }">${txt}: ${moment
          .unix(startTime)
          .format('YYYY-MM-DD')}</label>
                      <label class="text-xs text-farmText mt-0.5 ${
                        +startTime == 0 ? '' : 'hidden'
                      }">Pending</label>
                    </div>`;
      } else {
        itemHtml = `<div class="flex justify-between items-center h-8 my-2">
                      <img class="w-5 h-5 rounded-full mr-7" src="${
                        token.icon
                      }"/>
                      <label class="text-xs text-navHighLightText">${display_number(
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
    if (user_unclaimed_map[seed.seed_id]) return true;
  }
  function goFarmDetailPage(seed: Seed) {
    getDetailData({
      detailData: seed,
      tokenPriceList,
      loveSeed,
      all_seeds,
    });
    const poolId = getPoolIdBySeedId(seed.seed_id);
    const status = seed.farmList[0].status == 'Ended' ? 'e' : 'r';
    let mft_id = poolId;
    if (is_dcl_pool) {
      const [contractId, temp_pool_id] = seed.seed_id.split('@');
      const [fixRange, pool_id, left_point, right_point] =
        temp_pool_id.split('&');
      mft_id = `${get_pool_name(pool_id)}[${left_point}-${right_point}]`;
    }
    history.replace(`/v2farms/${mft_id}-${status}`);
  }
  function claimReward() {
    if (claimLoading) return;
    setClaimLoading(true);
    claimRewardBySeed_boost(seed.seed_id)
      // .then(() => {
      //   window.location.reload();
      // })
      .catch((error) => {
        setClaimLoading(false);
        setError(error);
      });
  }
  function getBoostMutil() {
    if (REF_VE_CONTRACT_ID && !boostConfig) return '';
    const { affected_seeds = {} } = boostConfig || {};
    const { seed_id } = seed;
    const user_seed = user_seeds_map[seed_id] || {};
    const love_user_seed = user_seeds_map[REF_VE_CONTRACT_ID];
    const base = affected_seeds[seed_id];
    const hasUserStaked = Object.keys(user_seed).length;
    if (base && loveSeed) {
      const { free_amount = 0, locked_amount = 0 } = love_user_seed || {};
      const totalStakeLoveAmount = toReadableNumber(
        LOVE_TOKEN_DECIMAL,
        new BigNumber(free_amount).plus(locked_amount).toFixed()
      );
      if (+totalStakeLoveAmount > 0) {
        let result;
        if (+totalStakeLoveAmount < 1) {
          result = 1;
        } else {
          result = new BigNumber(1)
            .plus(Math.log(+totalStakeLoveAmount) / Math.log(base))
            .toFixed(2);
        }
        return (
          <div
            className={`absolute top-3 right-4 z-10 flex items-center justify-center px-2 py-0.5  text-xs  rounded-lg font-bold ${
              hasUserStaked
                ? 'bg-lightGreenColor text-black'
                : 'text-farmText border border-farmText'
            }`}
          >
            {`x${toPrecision(result.toString(), 2)}`}
          </div>
        );
      }
      const tip = intl.formatMessage({ id: 'boostFarmTip' });
      const result: string = `<div class="text-navHighLightText text-xs w-52 text-left">${tip}</div>`;
      return (
        <div className="absolute flex items-center justify-center top-3 right-4 z-10 px-2 py-0.5 rounded-lg text-greyCircleColor text-xs border border-farmText">
          <div
            className="text-white text-right"
            data-class="reactTip"
            data-tooltip-id="boostFarmTipId"
            data-place="top"
            data-tooltip-html={result}
          >
            <div className="flex items-center justify-center">
              <BoostOptIcon></BoostOptIcon>
              <FormattedMessage id="boost"></FormattedMessage>
            </div>
            <CustomTooltip id="boostFarmTipId" />
          </div>
        </div>
      );
    }
    return '';
  }
  function getAprUpperLimit() {
    if (!boostConfig || !maxLoveShareAmount || +maxLoveShareAmount == 0)
      return '';
    const { affected_seeds } = boostConfig;
    const { seed_id } = seed;
    const base = affected_seeds[seed_id];
    let rate;
    if (+maxLoveShareAmount < 1) {
      rate = 1;
    } else {
      rate = new BigNumber(1)
        .plus(Math.log(+maxLoveShareAmount) / Math.log(base))
        .toFixed(2);
    }
    const apr = getActualTotalApr();
    let boostApr;
    if (apr) {
      boostApr = new BigNumber(apr).multipliedBy(rate);
    }
    if (boostApr && +boostApr > 0) {
      const r = +new BigNumber(boostApr).multipliedBy(100).toFixed();
      return (
        <span>
          <label className="mx-0.5">~</label>
          <label className="gotham_bold">
            {toPrecision(r.toString(), 2) + '%'}
          </label>
        </span>
      );
    }
    return '';
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
      setYourActualAprRate(rate);
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
  function switchApr(e: any) {
    e.stopPropagation();
    if (+aprSwitchStatus == 1) {
      setAprSwitchStatus('2');
    } else {
      setAprSwitchStatus('1');
    }
  }
  const renderer = (countdown: any) => {
    if (countdown.completed) {
      return null;
    } else {
      return (
        <div style={{ width: '85px' }} className="whitespace-nowrap">
          {countdown.days ? countdown.days + 'd: ' : ''}
          {zeroPad(countdown.hours)}
          {'h'}: {zeroPad(countdown.minutes)}
          {'m'}
          {countdown.days ? '' : ': ' + zeroPad(countdown.seconds) + 's'}
        </div>
      );
    }
  };
  function getStartTime() {
    let start_at: any[] = [];
    const farmList = seed.farmList;
    farmList.forEach(function (item) {
      start_at.push(item.terms.start_at);
    });
    start_at = _.sortBy(start_at);
    start_at = start_at.filter(function (val) {
      return val != '0';
    });
    return start_at[0];
  }
  function isInMonth() {
    const endedStatus = isEnded();
    if (endedStatus) return false;
    const result = farmList.find((farm: FarmBoost) => {
      const start_at = farm?.terms?.start_at;
      if (start_at == 0) return true;
      const one_month_seconds = 15 * 24 * 60 * 60;
      const currentA = new Date().getTime();
      const compareB = new BigNumber(start_at)
        .plus(one_month_seconds)
        .multipliedBy(1000);
      const compareResult = compareB.minus(currentA);
      if (compareResult.isGreaterThan(0)) {
        return true;
      }
    });
    if (result) return true;
    return false;
  }
  function status_is_new_or_will_end() {
    let status = '';
    if (is_dcl_pool && !isEnded()) {
      const matched_seeds = get_matched_seeds_for_dcl_pool({
        seeds: all_seeds,
        pool_id: pool.pool_id,
        sort: 'new',
      });
      if (matched_seeds.length > 1) {
        const latestSeed = matched_seeds[0];
        if (latestSeed.seed_id == seed.seed_id) {
          status = 'new';
        } else {
          status = 'will end';
        }
      }
    }
    return status;
  }
  function showNewTag() {
    if (is_dcl_pool) {
      const status = status_is_new_or_will_end();
      if (status == 'new' || (!status && isInMonth())) {
        return true;
      }
    } else {
      return isInMonth();
    }
  }
  function getForbiddenTip() {
    const tip = intl.formatMessage({ id: 'farm_stop_tip' });
    let result: string = `<div class="text-navHighLightText text-xs text-left">${tip}</div>`;
    return result;
  }
  function getRange() {
    const [fixRange, dcl_pool_id, left_point, right_point] =
      temp_pool_id.split('&');
    const [token_x_metadata, token_y_metadata] = pool.tokens_meta_data;
    const decimalRate =
      Math.pow(10, token_x_metadata.decimals) /
      Math.pow(10, token_y_metadata.decimals);
    let left_price = getPriceByPoint(+left_point, decimalRate);
    let right_price = getPriceByPoint(+right_point, decimalRate);
    if (rate_need_to_reverse_display) {
      const temp = left_price;
      left_price = new BigNumber(1).dividedBy(right_price).toFixed();
      right_price = new BigNumber(1).dividedBy(temp).toFixed();
    }
    const display_left_price = displayNumberToAppropriateDecimals(left_price);
    const display_right_price = displayNumberToAppropriateDecimals(right_price);

    return (
      <div className="flex items-center">
        <span className="text-base text-white">
          {display_left_price} ~ {display_right_price}
        </span>
        <span className="text-sm text-farmText ml-2">
          {rate_need_to_reverse_display ? (
            <>
              {token_x_metadata.symbol}/{token_y_metadata.symbol}
            </>
          ) : (
            <>
              {token_y_metadata.symbol}/{token_x_metadata.symbol}
            </>
          )}
        </span>
      </div>
    );
  }
  const isHaveUnclaimedReward = haveUnclaimedReward();
  const aprUpLimit = getAprUpperLimit();
  const needForbidden =
    (FARM_BLACK_LIST_V2 || []).indexOf(
      pool.id?.toString() || pool.pool_id?.toString()
    ) > -1;
  const tokens_sort: TokenMetadata[] = sort_tokens_by_base(tokens);
  const is_mobile = isMobile();
  const configV2 = getConfigV2();
  const is_support_lp = configV2.SUPPORT_SHADOW_POOL_IDS.includes(
    pool?.id?.toString()
  );
  return (
    <>
      <div
        onClick={() => {
          goFarmDetailPage(seed);
        }}
        className={`relative rounded-2xl cursor-pointer bg-cardBg ${
          is_mobile ? 'outline-none taphight' : 'hover:shadow-blue'
        } ${isEnded() || needForbidden ? 'farmEnded' : ''}
      `}
      >
        <div className="flex absolute -top-5 z-10 justify-center w-full">
          {tokens_sort.map((token, index) => {
            return (
              <label
                key={token.id}
                style={{
                  border: '4px solid #374958',
                }}
                className={`h-9 w-9 rounded-full box-content overflow-hidden bg-cardBg ${
                  index != 0 ? '-ml-1' : ''
                }`}
              >
                <img src={token.icon} className="w-full h-full"></img>
              </label>
            );
          })}
        </div>
        {getBoostMutil()}
        <div className="boxInfo">
          <div className="relative flex flex-col items-center  px-5 rounded-t-2xl overflow-hidden bg-boostUpBoxBg">
            <div
              className={`flex items-center cursor-pointer text-white font-bold text-xl mt-9`}
            >
              {/* link for looking into */}
              <a href={`javascript:void(${'/pool/' + pool.id})`}>
                {tokens_sort.map((token, index) => {
                  const hLine = index === tokens.length - 1 ? '' : '-';
                  return `${toRealSymbol(token.symbol)}${hLine}`;
                })}
              </a>
            </div>
            <div
              className={`text-white text-right my-4`}
              data-class="reactTip"
              data-tooltip-id={'rewardPerWeekId' + seed?.farmList[0]?.farm_id}
              data-place="top"
              data-tooltip-html={getRewardsPerWeekTip()}
            >
              <div className="flex items-center bg-black bg-opacity-20 rounded-full p-0.5">
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
            </div>

            <div className="flex items-center justify-between">
              {error ? <Alert level="warn" message={error.message} /> : null}
            </div>
            <div className="flex flex-col absolute left-2.5 top-2">
              {isPending() ? (
                <div className="flex flex-col text-purpleColor text-xs bg-lightPurpleColor rounded-lg px-2 py-0.5">
                  <FormattedMessage id="comimg" defaultMessage="COMING" />
                  <Countdown
                    date={moment.unix(getStartTime()).valueOf()}
                    renderer={renderer}
                  />
                </div>
              ) : null}
              {showNewTag() ? <NewTag></NewTag> : null}
              {status_is_new_or_will_end() == 'will end' ? (
                <span className="text-xs text-redwarningColor bg-lightReBgColor rounded-3xl px-1.5 py-1">
                  <FormattedMessage id="ending_soon" />
                </span>
              ) : null}
            </div>
            {needForbidden ? (
              <div className="flex flex-col absolute left-3.5 top-3 z-50">
                <div
                  className="text-xl text-white"
                  data-type="info"
                  data-place="top"
                  data-multiline={true}
                  data-tip={getForbiddenTip()}
                  data-html={true}
                  data-tooltip-id={'forbiddenTip' + seed.farmList[0].farm_id}
                  data-class="reactTip"
                >
                  <ForbiddonIcon></ForbiddonIcon>
                  <CustomTooltip
                    id={'forbiddenTip' + seed.farmList[0].farm_id}
                  />
                </div>
              </div>
            ) : null}
          </div>
          {is_dcl_pool ? (
            <div className="flex flex-col items-center justify-between px-5 py-3 h-28">
              <div className="flex items-center justify-between w-full">
                <span className="text-sm text-farmText">
                  <FormattedMessage id="range" />
                </span>
                <span>{getRange()}</span>
              </div>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center text-sm text-farmText">
                  <FormattedMessage id="apr" />
                </div>
                <div className="flex items-center">
                  <div
                    data-type="info"
                    data-place="top"
                    data-multiline={true}
                    data-tip={getAprTip()}
                    data-html={true}
                    data-tooltip-id={'aprId_dcl' + seed.farmList[0].farm_id}
                    data-class="reactTip"
                  >
                    <div
                      className={`text-sm ${
                        getTotalApr() == '-'
                          ? 'text-farmText'
                          : 'text-white gotham_bold'
                      }`}
                    >
                      {getTotalApr()}
                    </div>
                    <CustomTooltip
                      id={'aprId_dcl' + seed.farmList[0].farm_id}
                    />
                  </div>
                  <CalcIcon
                    onClick={(e: any) => {
                      e.stopPropagation();
                      setDclCalcVisible(true);
                    }}
                    className="text-farmText ml-1.5 cursor-pointer hover:text-greenColor"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between w-full">
                <span className="text-sm text-farmText">
                  <FormattedMessage id="to_claim" />
                </span>
                {isHaveUnclaimedReward ? (
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div
                      className="text-xl text-white"
                      data-type="info"
                      data-place="top"
                      data-multiline={true}
                      data-tip={getUnClaimTip()}
                      data-html={true}
                      data-tooltip-id={'unclaimedId' + seed.farmList[0].farm_id}
                      data-class="reactTip"
                    >
                      <div
                        className="flex items-center justify-center bg-deepBlue hover:bg-deepBlueHover rounded-lg text-sm text-white h-7 cursor-pointer"
                        style={{ minWidth: '4.6rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          claimReward();
                        }}
                      >
                        <ButtonTextWrapper
                          loading={claimLoading}
                          Text={() => <>{getTotalUnclaimedRewards()}</>}
                        />
                      </div>
                      <CustomTooltip
                        id={'unclaimedId' + seed.farmList[0].farm_id}
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-farmText">-</span>
                )}
              </div>
            </div>
          ) : null}
          {!is_dcl_pool ? (
            <div className="flex flex-col items-center justify-between px-5 py-3 h-28">
              <div className="flex items-center justify-between w-full">
                <span className="text-sm text-farmText">
                  <FormattedMessage id="total_staked"></FormattedMessage>
                </span>
                <span className="text-white">
                  {Number(seed.seedTvl) == 0
                    ? '-'
                    : `$${toInternationalCurrencySystem(seed.seedTvl, 2)}`}
                </span>
              </div>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center text-sm text-farmText">
                  {yourApr ? (
                    <div
                      data-type="info"
                      data-place="right"
                      data-multiline={true}
                      // data-tip={isMobile() ? '': getRangeAprTip()}
                      data-tip={''}
                      data-html={true}
                      data-tooltip-id={'aprRangeId' + seed.farmList[0].farm_id}
                      data-class="reactTip"
                    >
                      <label
                        onClick={switchApr}
                        className={`text-sm cursor-pointer ${
                          +aprSwitchStatus == 1 ? 'text-white' : 'text-farmText'
                        }`}
                      >
                        <FormattedMessage id="your" />
                      </label>
                      <label className="text-farmText text-sm">/</label>
                      <label
                        onClick={switchApr}
                        className={`text-sm cursor-pointer ${
                          +aprSwitchStatus == 1 ? 'text-farmText' : 'text-white'
                        }`}
                      >
                        <FormattedMessage id="max_apr" />
                      </label>
                      <CustomTooltip
                        id={'aprRangeId' + seed.farmList[0].farm_id}
                      />
                    </div>
                  ) : (
                    <label className="text-farmText text-sm cursor-pointer">
                      <FormattedMessage id="apr" />
                    </label>
                  )}
                </div>
                <div className="flex items-center">
                  <div
                    className="text-xl text-white"
                    data-type="info"
                    data-place="top"
                    data-multiline={true}
                    data-tooltip-html={getAprTip()}
                    data-tooltip-id={'aprId' + seed.farmList[0].farm_id}
                    data-class="reactTip"
                  >
                    <span
                      className={`flex items-center flex-wrap justify-center text-white text-base`}
                    >
                      {yourApr && +aprSwitchStatus == 1 ? (
                        <label className="text-sm gotham_bold">{yourApr}</label>
                      ) : (
                        <>
                          <label
                            className={`gotham_bold ${
                              aprUpLimit ? 'text-xs' : 'text-sm'
                            }`}
                          >
                            {getTotalApr()}
                          </label>
                          {aprUpLimit}
                        </>
                      )}
                    </span>
                    <CustomTooltip id={'aprId' + seed.farmList[0].farm_id} />
                  </div>
                  {is_support_lp ? <LPTip seed_id={seed.seed_id} /> : null}

                  <CalcIcon
                    onClick={(e: any) => {
                      e.stopPropagation();
                      setCalcVisible(true);
                    }}
                    className="text-farmText ml-1.5 cursor-pointer hover:text-greenColor"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between w-full">
                <span className="text-sm text-farmText">
                  <FormattedMessage id="to_claim" />
                </span>
                {isHaveUnclaimedReward ? (
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div
                      className="text-xl text-white"
                      data-type="info"
                      data-place="top"
                      data-multiline={true}
                      data-tip={getUnClaimTip()}
                      data-html={true}
                      data-tooltip-id={'unclaimedId' + seed.farmList[0].farm_id}
                      data-class="reactTip"
                    >
                      <div
                        className="flex items-center justify-center bg-deepBlue hover:bg-deepBlueHover rounded-lg text-sm text-white h-7 cursor-pointer"
                        style={{ width: '4.6rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          claimReward();
                        }}
                      >
                        <ButtonTextWrapper
                          loading={claimLoading}
                          Text={() => <>{getTotalUnclaimedRewards()}</>}
                        />
                      </div>
                      <CustomTooltip
                        id={'unclaimedId' + seed.farmList[0].farm_id}
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-farmText">-</span>
                )}
              </div>
            </div>
          ) : null}
        </div>
        <CustomTooltip id={'rewardPerWeekId' + seed?.farmList[0]?.farm_id} />
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
          user_seeds_map={user_seeds_map}
          user_unclaimed_map={user_unclaimed_map}
          user_unclaimed_token_meta_map={user_unclaimed_token_meta_map}
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
      {dclCalcVisible ? (
        <CalcModelDcl
          isOpen={dclCalcVisible}
          onRequestClose={(e) => {
            e.stopPropagation();
            setDclCalcVisible(false);
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
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const actualRewardList = {};
  const maxLength = 10;
  Object.entries(userRewardList).forEach(([key, value]) => {
    if (Number(value) > 0) {
      actualRewardList[key] = value;
    }
  });
  const [rewardList, setRewardList] = useState([]);
  const [yourReward, setYourReward] = useState('-');
  const [isOpen, setIsOpen] = useState(false);
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
      const singlePrice = tokenPriceList[key]?.price;
      const token = rewardTokenList[key];
      if (token) {
        const number: any = toReadableNumber(token.decimals, v);
        if (singlePrice && singlePrice != 'N/A') {
          totalUnWithDraw = BigNumber.sum(
            singlePrice * number,
            totalUnWithDraw
          ).toNumber();
        }
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
    } else {
      isSignedIn ? setYourReward('$0.00') : '';
    }
  }
  return (
    <div
      className={`relative rounded-2xl mb-3.5 z-50 ${
        isOpen ? 'shadow-withDrawColor' : ''
      }`}
      onMouseOver={() => {
        if (isMobile()) return;
        setIsOpen(true);
      }}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div
        className={`relative bg-veGradient px-5 overflow-hidden pb-2.5 ${
          isOpen ? 'rounded-t-xl' : 'rounded-xl'
        }`}
        style={{ minHeight: '72px' }}
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        <span
          className="absolute top-0 left-5 text-white text-xs bg-senderHot rounded-b-lg px-3 py-0.5 whitespace-nowrap"
          style={{ boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}
        >
          <label className="text-black text-xs font-bold">
            <FormattedMessage id="claimed_Rewards"></FormattedMessage>
          </label>
        </span>
        <div className={`relative z-10 flex mt-7 justify-between items-end`}>
          <div className="flex flex-col">
            <label className="text-white text-xl font-bold">{yourReward}</label>
            {Object.values(rewardList).length > 0 ? (
              <div className="flex items-center mt-1.5">
                {Object.values(rewardList)
                  .slice(0, maxLength)
                  .map((reward: any, index: number) => {
                    return (
                      <img
                        key={index}
                        src={reward.rewardToken.icon}
                        className={`w-5 h-5 rounded-full  bg-cardBg border border-greenColor ${
                          index > 0 ? '-ml-1' : ''
                        }`}
                      ></img>
                    );
                  })}
                {Object.values(rewardList).length > maxLength ? (
                  <div className="flex items-center justify-center w-5 h-5 rounded-full  bg-cardBg border border-greenColor -ml-1">
                    <MoreButtonIcon
                      className="text-greenColor"
                      style={{ zoom: 0.8 }}
                    ></MoreButtonIcon>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
          {!isSignedIn ? (
            <GreenConnectToNearBtn className="w-52"></GreenConnectToNearBtn>
          ) : (
            <div className="flex justify-between items-center">
              <div
                className={`text-sm border rounded-md cursor-pointer py-1.5 px-4 ${
                  isOpen ? 'invisible' : ''
                } ${
                  Object.values(rewardList).length > 0
                    ? 'bg-otherGreenColor border-otherGreenColor text-black'
                    : 'bg-purpleColorF border-white text-white'
                }`}
              >
                <FormattedMessage id="withdraw"></FormattedMessage>
              </div>
            </div>
          )}
        </div>
        <BoostDotIcon
          className={`absolute right-5 ${
            Object.values(rewardList).length > 0 ? 'top-1.5' : 'top-0'
          }`}
        ></BoostDotIcon>
      </div>
      <WithDrawb
        isOpen={isOpen}
        userRewardList={userRewardList}
        tokenPriceList={tokenPriceList}
        farmDisplayList={farmDisplayList}
      ></WithDrawb>
    </div>
  );
}
function WithDrawb(props: {
  userRewardList: any;
  tokenPriceList: any;
  farmDisplayList: Seed[];
  isOpen: Boolean;
}) {
  const { userRewardList, tokenPriceList, farmDisplayList, isOpen } = props;
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
  const [yourReward, setYourReward] = useState('$0');
  const rewardRef = useRef(null);
  const intl = useIntl();
  const withdrawNumber = 4;
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
        checkedList[key] = { value: value.number };
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
      const singlePrice = tokenPriceList[key]?.price;
      const token = rewardTokenList[key];
      if (token) {
        const number: any = toReadableNumber(token.decimals, v);
        if (singlePrice && singlePrice != 'N/A') {
          totalUnWithDraw = BigNumber.sum(
            singlePrice * number,
            totalUnWithDraw
          ).toNumber();
        }
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
  const cardHeight = isMobile() ? '90vh' : '80vh';
  return (
    <div
      // xs:absolute md:absolute xs:shadow-withDrawColor md:shadow-withDrawColor
      className={`rounded-b-2xl bg-darkBlackColor overflow-auto w-full ${
        isOpen ? '' : 'hidden'
      }`}
      style={{
        maxHeight: cardHeight,
        border: '1px solid rgba(0, 198, 162, 0.5)',
      }}
    >
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
        {Object.values(rewardList).length == 0 ? (
          <div className="flex flex-col items-center justify-center py-6">
            <BoostFarmNoDataIcon></BoostFarmNoDataIcon>
            <p className="text-sm text-white opacity-50 mt-3">
              <FormattedMessage
                id="no_claimed_rewards_yet"
                defaultMessage="No claimed rewards yet"
              ></FormattedMessage>
            </p>
          </div>
        ) : null}
      </div>
      <div
        className={`flex justify-between items-center pt-4 pb-3 pl-3 pr-6 select-none ${
          Object.values(rewardList).length == 0 ? 'hidden' : ''
        }`}
      >
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
                <FormattedMessage id="all_4_v2" />
              </label>
              <div
                className="text-white text-right ml-1"
                data-class="reactTip"
                data-tooltip-id="selectAllId"
                data-place="top"
                data-tooltip-html={valueOfWithDrawLimitTip()}
              >
                <QuestionMark></QuestionMark>
                <CustomTooltip id="selectAllId" />
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
            backgroundImage="linear-gradient(270deg, #7F43FF 0%, #00C6A2 97.06%)"
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
      <div className="flex flex-col items-start bg-cardBg justify-between rounded-b-lg mt-3 px-3.5 py-3">
        <span className="text-white text-sm">
          <FormattedMessage id="how_to_earn_more"></FormattedMessage>
        </span>
        <div className="flex items-center flex-wrap mt-2">
          <span className="flex items-center text-xs text-primaryText mr-2 mb-1">
            <label className="flex items-center justify-center w-4 h-4 rounded-full text-white bg-greenColor mr-1.5">
              1
            </label>{' '}
            <FormattedMessage id="withdraw" /> {'>>'}
          </span>
          <span className="flex items-center text-xs text-primaryText mr-2 mb-1">
            <label className="flex items-center justify-center w-4 h-4 rounded-full text-white bg-greenColor mr-1.5">
              2
            </label>{' '}
            <FormattedMessage id="add_liquidity" /> {'>>'}
          </span>
          <span className="flex items-center text-xs text-primaryText mb-1">
            <label className="flex items-center justify-center w-4 h-4 rounded-full text-white bg-greenColor mr-1.5">
              3
            </label>
            <FormattedMessage id="stake" />
          </span>
        </div>
      </div>
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
  const [yourReward, setYourReward] = useState('$0');
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
      const singlePrice = tokenPriceList[key]?.price;
      const token = rewardTokenList[key];
      if (token) {
        const number: any = toReadableNumber(token.decimals, v);
        if (singlePrice && singlePrice != 'N/A') {
          totalUnWithDraw = BigNumber.sum(
            singlePrice * number,
            totalUnWithDraw
          ).toNumber();
        }
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
            <div
              className="relative"
              style={{
                background:
                  'linear-gradient(270deg, #7F43FF 0%, #00C6A2 97.06%)',
              }}
            >
              <BoostDotIcon className="absolute right-5"></BoostDotIcon>
              <div className="relative z-10 px-5 py-3">
                <div className="flex flex-col items-start px-2">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-white text-lg">
                      <FormattedMessage id="claimed_Rewards"></FormattedMessage>
                    </span>
                    <ModalClose
                      className="cursor-pointer"
                      fillColor="#fff"
                      onClick={onRequestClose}
                    />
                  </div>
                  <span className="text-white text-xl font-bold mt-1">
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
                {Object.values(rewardList).length == 0 ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <BoostFarmNoDataIcon></BoostFarmNoDataIcon>
                    <p className="text-sm text-white opacity-50 mt-3">
                      <FormattedMessage
                        id="no_claimed_rewards_yet"
                        defaultMessage="No claimed rewards yet"
                      ></FormattedMessage>
                    </p>
                  </div>
                ) : null}
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
                        <FormattedMessage id="all_4_v2" />
                      </label>
                      <div
                        className="text-white text-right ml-1"
                        data-class="reactTip"
                        data-tooltip-id="selectAllId"
                        data-place="top"
                        data-html={true}
                        data-tip={valueOfWithDrawLimitTip()}
                      >
                        <QuestionMark></QuestionMark>
                        <CustomTooltip id="selectAllId" />
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
        <div className="flex flex-col items-start bg-cardBg justify-between rounded-lg mt-3 px-3.5 py-3">
          <span className="text-white text-sm">
            <FormattedMessage id="how_to_earn_more"></FormattedMessage>
          </span>
          <div className="flex items-center flex-wrap mt-2">
            <span className="flex items-center text-xs text-primaryText mr-2 mb-1">
              <label className="flex items-center justify-center w-4 h-4 rounded-full text-white bg-greenColor mr-1.5">
                1
              </label>{' '}
              <FormattedMessage id="withdraw" /> {'>>'}
            </span>
            <span className="flex items-center text-xs text-primaryText mr-2 mb-1">
              <label className="flex items-center justify-center w-4 h-4 rounded-full text-white bg-greenColor mr-1.5">
                2
              </label>{' '}
              <FormattedMessage id="add_liquidity" /> {'>>'}
            </span>
            <span className="flex items-center text-xs text-primaryText mb-1">
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
export const getPoolIdBySeedId = (seed_id: string) => {
  const [contractId, temp_pool_id] = seed_id.split('@');
  if (temp_pool_id) {
    if (contractId == REF_UNI_V3_SWAP_CONTRACT_ID) {
      const [fixRange, dcl_pool_id, left_point, right_point] =
        temp_pool_id.split('&');
      return dcl_pool_id;
    } else {
      return temp_pool_id;
    }
  }
  return '';
};

function LoveMask() {
  const intl = useIntl();
  const loveTip = () => {
    return `<div class="text-xs text-navHighLightText w-64">
    ${intl.formatMessage({ id: 'loveTip' })}
  </div>`;
  };
  return (
    <div
      className="ml-2"
      data-class="reactTip"
      data-tooltip-id="loveTipId"
      data-place="top"
      data-tooltip-html={loveTip()}
    >
      <QuestionMark></QuestionMark>
      <CustomTooltip id="loveTipId" />
    </div>
  );
}
