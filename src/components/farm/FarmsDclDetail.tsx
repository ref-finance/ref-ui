import React, {
  useEffect,
  useRef,
  useState,
  useContext,
  useMemo,
  createContext,
} from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { isMobile } from '~utils/device';
import {
  ArrowLeftIcon,
  FreeIcon,
  LockIcon,
  LightningIcon,
  BigLightningIcon,
  GoldLevel1,
  GoldLevel2,
  GoldLevel3,
  GoldLevel4,
  CalcIcon,
  LockImgIcon,
  FreenWarningIcon,
  UpArrowIcon,
  BoostRightArrowIcon,
  BoostOptIcon,
  LightningBase64,
  LightningBase64Grey,
  DclFarmIcon,
  NFTIdIcon,
  CrossIconEmpty,
  CrossIconLittle,
  CrossIconMiddle,
  CrossIconLarge,
  CrossIconFull,
  LinkArrowIcon,
  NewTag,
} from '~components/icon/FarmBoost';
import { RefreshIcon } from '~components/icon/swapV3';
import { AddButtonIcon } from '~components/icon/V3';
import { useHistory, useLocation } from 'react-router-dom';
import getConfig from '../../services/config';
import { LinkIcon, ArrowDownHollow } from '~components/icon';
import {
  FarmBoost,
  Seed,
  getServerTime,
  stake_boost,
  get_config,
  unStake_boost,
  claimRewardBySeed_boost,
  lock_free_seed,
  force_unlock,
  BoostConfig,
  UserSeedInfo,
  getVeSeedShare,
  stake_boost_nft,
  unStake_boost_nft,
} from '~services/farm';
import { WalletContext } from '../../utils/wallets-integration';
import {
  toPrecision,
  toReadableNumber,
  toNonDivisibleNumber,
  toInternationalCurrencySystem,
  formatWithCommas,
  calculateFairShare,
} from '../../utils/numbers';
import BigNumber from 'bignumber.js';
import {
  GradientButton,
  ButtonTextWrapper,
  OprationButton,
  ConnectToNearBtn,
  SolidButton,
} from '~components/button/Button';
import Modal from 'react-modal';
import { usePool } from '~state/pool';
import { ModalClose, Calc } from '~components/icon';
import { addLiquidityToPool, Pool } from '~services/pool';
import {
  useWalletTokenBalances,
  useDepositableBalance,
} from '../../state/token';
import { WRAP_NEAR_CONTRACT_ID } from '~services/wrap-near';
import { useTokens, getDepositableBalance } from '~state/token';
import { scientificNotationToString, divide } from '../../utils/numbers';
import { BoostInputAmount } from '~components/forms/InputAmount';
import Alert from '~components/alert/Alert';
import { mftGetBalance } from '~services/mft-contract';
import { getMftTokenId, toRealSymbol } from '~utils/token';
import {
  LP_TOKEN_DECIMALS,
  LP_STABLE_TOKEN_DECIMALS,
} from '../../services/m-token';
import { Checkbox, CheckboxSelected } from '~components/icon';
import { CalcEle } from '~components/farm/CalcModelBooster';
import ReactTooltip from 'react-tooltip';
import QuestionMark from '~components/farm/QuestionMark';
import { ExternalLinkIcon } from '~components/icon/Risk';
import { FaAngleUp, FaAngleDown } from 'react-icons/fa';
import { useDayVolume } from '../../state/pool';
import { getPool } from '~services/indexer';
import CalcModelBooster from '~components/farm/CalcModelBooster';
import { get24hVolume } from '~services/indexer';
import { LOVE_TOKEN_DECIMAL } from '../../state/referendum';
import { VEARROW } from '../icon/Referendum';
import { isStablePool } from '../../services/near';
import {
  getPriceByPoint,
  UserLiquidityInfo,
  get_total_value_by_liquidity_amount_dcl,
  mint_liquidity,
  get_valid_range,
  allocation_rule_liquidities,
  TOKEN_LIST_FOR_RATE,
  get_matched_seeds_for_dcl_pool,
  get_all_seeds,
  displayNumberToAppropriateDecimals,
} from '~services/commonV3';
import {
  list_liquidities,
  get_pool,
  PoolInfo,
  remove_liquidity,
  get_liquidity,
  dcl_mft_balance_of,
} from '../../services/swapV3';
import { AddNewPoolV3 } from '~components/pool/AddNewPoolV3';
import { ftGetTokenMetadata, TokenMetadata } from '~services/ft-contract';
import moment from 'moment';
const ONLY_ZEROS = /^0*\.?0*$/;
const {
  STABLE_POOL_IDS,
  FARM_LOCK_SWITCH,
  REF_VE_CONTRACT_ID,
  FARM_BLACK_LIST_V2,
} = getConfig();
const FarmContext = createContext(null);
export default function FarmsDclDetail(props: {
  detailData: Seed;
  emptyDetailData: Function;
  tokenPriceList: any;
  loveSeed: Seed;
  boostConfig: BoostConfig;
  user_data: Record<string, any>;
  user_data_loading: Boolean;
  dayVolumeMap: Record<string, string>;
}) {
  const {
    detailData,
    emptyDetailData,
    tokenPriceList,
    loveSeed,
    boostConfig,
    user_data,
    user_data_loading,
    dayVolumeMap,
  } = props;
  const [listLiquidities, setListLiquidities] = useState<UserLiquidityInfo[]>(
    []
  );
  const [listLiquidities_inFarimg, set_listLiquidities_inFarimg] = useState<
    UserLiquidityInfo[]
  >([]);
  const [listLiquidities_unFarimg, set_listLiquidities_unFarimg] = useState<
    UserLiquidityInfo[]
  >([]);
  const [listLiquidities_unavailable, set_listLiquidities_unavailable] =
    useState<UserLiquidityInfo[]>([]);
  const [listLiquiditiesLoading, setListLiquiditiesLoading] = useState(true);
  const [rangeSort, setRangeSort] = useState(true);
  const [addLiquidityModalVisible, setAddLiquidityModalVisible] =
    useState(false);
  const [mft_balance_in_dcl_account, set_mft_balance_in_dcl_account] =
    useState('0');
  const [claimLoading, setClaimLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [betterSeed, setBetterSeed] = useState<Seed>();
  const [isNewSeed, setIsNewSeed] = useState<boolean>(false);
  const {
    user_seeds_map = {},
    user_unclaimed_map = {},
    user_unclaimed_token_meta_map = {},
  } = user_data;
  const history = useHistory();
  const intl = useIntl();
  const tokens = sortTokens(detailData.pool.tokens_meta_data);
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const rate_need_to_reverse_display = useMemo(() => {
    const { tokens_meta_data } = detailData.pool;
    if (tokens_meta_data) {
      const [tokenX] = tokens_meta_data;
      if (TOKEN_LIST_FOR_RATE.indexOf(tokenX.symbol) > -1) return true;
      return false;
    }
  }, [detailData]);
  useEffect(() => {
    get_farms_data();
  }, []);
  useEffect(() => {
    if (isSignedIn) {
      get_list_liquidities();
      get_mft_balance_of();
    }
  }, [isSignedIn, user_data_loading]);
  useEffect(() => {
    if (rate_need_to_reverse_display) {
      setRangeSort(false);
    }
  }, [rate_need_to_reverse_display]);
  const unclaimedRewardsData = useMemo(() => {
    return getTotalUnclaimedRewards();
  }, [user_unclaimed_map[detailData.seed_id]]);
  function getTotalUnclaimedRewards() {
    let totalPrice = 0;
    let resultTip = '';
    const tempFarms = {};

    detailData.farmList.forEach((farm: FarmBoost) => {
      tempFarms[farm.terms.reward_token] = true;
    });
    const isEnded = detailData.farmList[0].status == 'Ended';
    const unclaimed = user_unclaimed_map[detailData.seed_id] || {};
    const unClaimedTokenIds = Object.keys(unclaimed);
    const tokenList: any[] = [];
    unClaimedTokenIds?.forEach((tokenId: string) => {
      const token: TokenMetadata = user_unclaimed_token_meta_map[tokenId];
      // total price
      const { id, decimals, icon } = token;
      const amount = toReadableNumber(decimals, unclaimed[id] || '0');
      const tokenPrice = tokenPriceList[id]?.price;
      if (tokenPrice && tokenPrice != 'N/A') {
        totalPrice += +amount * tokenPrice;
      }
      // rewards number
      let displayNum = '';
      if (new BigNumber('0').isEqualTo(amount)) {
        displayNum = '-';
      } else if (new BigNumber('0.001').isGreaterThan(amount)) {
        displayNum = '<0.001';
      } else {
        displayNum = new BigNumber(amount).toFixed(3, 1);
      }
      // before boost number
      let beforeNum = '';
      // if (radio) { // Reserved comment
      //   const v = new BigNumber(amount).dividedBy(radio);
      //   if (new BigNumber('0').isEqualTo(v)) {
      //     beforeNum = '-';
      //   } else if (new BigNumber('0.001').isGreaterThan(v)) {
      //     beforeNum = '<0.001';
      //   } else {
      //     beforeNum = new BigNumber(v).toFixed(3, 1);
      //   }
      // }
      const tempTokenData = {
        token,
        amount: displayNum,
        preAmount: beforeNum,
      };
      tokenList.push(tempTokenData);
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
    if (totalPrice == 0) {
      return {
        worth: <label className="opacity-30">{isSignedIn ? '$0' : '-'}</label>,
        showClaimButton: false,
        tip: resultTip,
        list: tokenList,
      };
    } else if (new BigNumber('0.01').isGreaterThan(totalPrice)) {
      return {
        worth: '<$0.01',
        showClaimButton: true,
        tip: resultTip,
        list: tokenList,
      };
    } else {
      return {
        worth: `$${toInternationalCurrencySystem(totalPrice.toString(), 2)}`,
        showClaimButton: true,
        tip: resultTip,
        list: tokenList,
      };
    }
  }
  async function get_farms_data() {
    const all_seeds = await get_all_seeds();
    const matched_seeds = get_matched_seeds_for_dcl_pool({
      seeds: all_seeds,
      pool_id: detailData.pool.pool_id,
      sort: 'new',
    });
    const targetSeed = matched_seeds[0];
    if (matched_seeds.length > 1 && targetSeed.seed_id != detailData.seed_id) {
      setBetterSeed(targetSeed);
    }
    if (matched_seeds.length > 1 && targetSeed.seed_id == detailData.seed_id) {
      setIsNewSeed(true);
    }
  }
  async function get_mft_balance_of() {
    const { seed_decimal, seed_id } = detailData;
    const [contractId, temp_pool_id] = seed_id.split('@');
    const mft_id = `:${temp_pool_id}`;
    const balance = await dcl_mft_balance_of(mft_id);
    set_mft_balance_in_dcl_account(balance);
  }
  async function get_list_liquidities() {
    const list: UserLiquidityInfo[] = await list_liquidities();
    if (list.length > 0 && !user_data_loading) {
      const { free_amount = '0', locked_amount = '0' } =
        user_seeds_map[detailData.seed_id] || {};
      const user_seed_amount = new BigNumber(free_amount)
        .plus(locked_amount)
        .toFixed();
      const [temp_farming, temp_free, temp_unavailable] =
        allocation_rule_liquidities({
          list,
          user_seed_amount,
          seed: detailData,
        });
      const matched_liquidities = temp_farming
        .concat(temp_free)
        .concat(temp_unavailable);
      set_listLiquidities_inFarimg(temp_farming);
      set_listLiquidities_unFarimg(temp_free);
      set_listLiquidities_unavailable(temp_unavailable);
      setListLiquidities(matched_liquidities);
    }
    if (!user_data_loading) {
      setListLiquiditiesLoading(false);
    }
  }
  function sortTokens(tokens: TokenMetadata[]) {
    tokens.sort((a: TokenMetadata, b: TokenMetadata) => {
      if (a.symbol === 'NEAR') return 1;
      if (b.symbol === 'NEAR') return -1;
      return 0;
    });
    return tokens;
  }
  const goBacktoFarms = () => {
    history.replace('/v2farms');
    emptyDetailData();
  };
  const displaySymbols = () => {
    let result = '';
    detailData.pool.tokens_meta_data.forEach(
      (token: TokenMetadata, index: number) => {
        const symbol = toRealSymbol(token.symbol);
        if (index == detailData.pool.tokens_meta_data.length - 1) {
          result += symbol;
        } else {
          result += symbol + '-';
        }
      }
    );
    return result;
  };
  const displayImgs = () => {
    const tokenList: any[] = [];
    (tokens || []).forEach((token: TokenMetadata) => {
      tokenList.push(
        <label
          key={token.id}
          className={`h-11 w-11 xs:h-9 xs:w-9 md:h-9 md:w-9 rounded-full overflow-hidden border border-gradientFromHover bg-cardBg -ml-1.5`}
        >
          <img src={token.icon} className="w-full h-full"></img>
        </label>
      );
    });
    return tokenList;
  };
  const goPoolPage = () => {
    const poolId = detailData.pool.pool_id;
    window.open(`/poolV2/${poolId}`);
  };
  function isEnded() {
    const farms = detailData.farmList;
    return farms[0].status == 'Ended';
  }
  function getBoostMutil() {
    if (REF_VE_CONTRACT_ID && !boostConfig) return '';
    const { affected_seeds = {} } = boostConfig || {};
    const { seed_id } = detailData;
    const love_user_seed = user_seeds_map[REF_VE_CONTRACT_ID];
    const base = affected_seeds[seed_id];
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
        return result;
      }
      return '';
    }
    return '';
  }
  function getBoostDom() {
    if (REF_VE_CONTRACT_ID && !boostConfig) return '';
    const { affected_seeds = {} } = boostConfig || {};
    const { seed_id } = detailData;
    const base = affected_seeds[seed_id];
    if (base && loveSeed) {
      const tip = intl.formatMessage({ id: 'boostFarmTip' });
      const result: string = `<div class="text-navHighLightText text-xs w-52 text-left">${tip}</div>`;
      return (
        <div className="flex items-center justify-center ml-2 px-2 py-0.5 rounded-lg text-greyCircleColor text-xs border border-farmText">
          <div
            className="text-white text-right"
            data-class="reactTip"
            data-for="boostFarmTipId"
            data-place="top"
            data-html={true}
            data-tip={result}
          >
            <div className="flex items-center justify-center">
              <BoostOptIcon className="mr-0.5"></BoostOptIcon>
              <FormattedMessage id="boost"></FormattedMessage>
            </div>
            <ReactTooltip
              id="boostFarmTipId"
              backgroundColor="#1D2932"
              border
              borderColor="#7e8a93"
              effect="solid"
            />
          </div>
        </div>
      );
    }
  }
  function getTotalApr() {
    const farms = detailData.farmList;
    let apr = 0;
    const allPendingFarms = isPending();
    farms.forEach(function (item: FarmBoost) {
      const pendingFarm = item.status == 'Created' || item.status == 'Pending';
      if (allPendingFarms || (!allPendingFarms && !pendingFarm)) {
        apr = +new BigNumber(apr).plus(item.apr).toFixed();
      }
    });
    return apr * 100;
  }
  function isPending() {
    let pending: boolean = true;
    const farms = detailData.farmList;
    for (let i = 0; i < farms.length; i++) {
      if (farms[i].status != 'Created' && farms[i].status != 'Pending') {
        pending = false;
        break;
      }
    }
    return pending;
  }
  function getAprTip() {
    // isYour?: Boolean todo 暂时去掉
    const tempList = detailData.farmList;
    const lastList: any[] = [];
    const pending_farms: FarmBoost[] = [];
    const no_pending_farms: FarmBoost[] = [];
    let totalApr;
    const baseApr = getTotalApr();
    const txt = intl.formatMessage({ id: 'reward_apr' });
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
    totalApr = baseApr;
    // show last display string
    let result: string = '';
    result = `
    <div class="flex items-center justify-between ">
      <span class="text-xs text-navHighLightText mr-3">${txt}</span>
      <span class="text-sm text-white font-bold">${
        toPrecision(totalApr.toString(), 2) + '%'
      }</span>
    </div>
    `;
    lastList.forEach((item: any) => {
      const { rewardToken, apr: baseApr, pending, startTime } = item;
      const token = rewardToken;
      let itemHtml = '';
      let apr = baseApr;
      if (pending) {
        const startDate = moment.unix(startTime).format('YYYY-MM-DD');
        const txt = intl.formatMessage({ id: 'start' });
        itemHtml = `<div class="flex justify-between items-center h-8">
          <image class="w-5 h-5 rounded-full mr-7" style="filter: grayscale(100%)" src="${
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
          <image class="w-5 h-5 rounded-full mr-7" src="${token.icon}"/>
          <label class="text-xs text-navHighLightText">${
            (apr == 0 ? '-' : formatWithCommas(toPrecision(apr, 2))) + '%'
          }</label>
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
  function getRange() {
    const [contractId, temp_pool_id] = detailData.seed_id.split('@');
    const [fixRange, dcl_pool_id, left_point, right_point] =
      temp_pool_id.split('&');
    const [token_x_metadata, token_y_metadata] =
      detailData.pool.tokens_meta_data;
    const decimalRate =
      Math.pow(10, token_x_metadata.decimals) /
      Math.pow(10, token_y_metadata.decimals);
    let left_price = getPriceByPoint(+left_point, decimalRate);
    let right_price = getPriceByPoint(+right_point, decimalRate);
    if (!rangeSort) {
      const temp = left_price;
      left_price = new BigNumber(1).dividedBy(right_price).toFixed();
      right_price = new BigNumber(1).dividedBy(temp).toFixed();
    }
    const display_left_price = left_price;
    const display_right_price = right_price;
    return (
      <div className="flex items-center whitespace-nowrap xsm:flex-col xsm:items-end">
        <div className="flex items-center">
          <RefreshIcon
            className="cursor-pointer mr-1 lg:hidden"
            onClick={() => {
              setRangeSort(!rangeSort);
            }}
          ></RefreshIcon>
          <span className="text-xs text-farmText">
            1 {rangeSort ? token_x_metadata.symbol : token_y_metadata.symbol}=
          </span>
        </div>
        <div className="flex items-center xsm:mt-2.5">
          <span className="text-base text-white mx-2">
            {displayNumberToAppropriateDecimals(display_left_price)} ~{' '}
            {displayNumberToAppropriateDecimals(display_right_price)}
          </span>
          <span className="text-xs text-farmText">
            {rangeSort ? token_y_metadata.symbol : token_x_metadata.symbol}
          </span>
        </div>
      </div>
    );
  }
  function valueOfRewardsTip() {
    const tip = intl.formatMessage({ id: 'farmRewardsCopy' });
    let result: string = `<div class="text-navHighLightText text-xs w-52 text-left">${tip}</div>`;
    return result;
  }
  function getRewardsPerWeekTip() {
    const tempList: FarmBoost[] = detailData.farmList;
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
                      <div class="flex justify-between items-center w-full"><image class="w-5 h-5 rounded-full mr-7" style="filter: grayscale(100%)" src="${
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
                      <image class="w-5 h-5 rounded-full mr-7" src="${
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
  function get_total_staked() {
    if (+detailData.seedTvl == 0) {
      return '-';
    } else {
      return `$${toInternationalCurrencySystem(detailData.seedTvl, 2)}`;
    }
  }
  function get_total_apr() {
    let apr = getTotalApr();
    if (+apr == 0) {
      return '-';
    } else {
      return toPrecision(apr.toString(), 2) + '%';
    }
  }
  function totalTvlPerWeekDisplay() {
    const farms = detailData.farmList;
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
      <>
        <div
          className="text-white text-right"
          data-class="reactTip"
          data-for={'rewardPerWeekId' + detailData?.farmList[0]?.farm_id}
          data-place="top"
          data-html={true}
          data-tip={getRewardsPerWeekTip()}
        >
          <div className="flex items-center">
            {Object.values(rewardTokenIconMap).map(
              (icon: string, index: number) => {
                return (
                  <img
                    src={icon}
                    key={index}
                    className={`w-4 h-4 rounded-full border border-greenColor ${
                      index != 0 ? '-ml-1' : ''
                    }`}
                  ></img>
                );
              }
            )}
          </div>
          <ReactTooltip
            id={'rewardPerWeekId' + detailData?.farmList[0]?.farm_id}
            backgroundColor="#1D2932"
            border
            borderColor="#7e8a93"
            effect="solid"
          />
        </div>
        <div
          className="text-white text-right"
          data-class="reactTip"
          data-for={'rewardPerWeekId1' + detailData?.farmList[0]?.farm_id}
          data-place="top"
          data-html={true}
          data-tip={getRewardsPerWeekTip()}
        >
          <span>{totalPriceDisplay}</span>
          <ReactTooltip
            id={'rewardPerWeekId1' + detailData?.farmList[0]?.farm_id}
            backgroundColor="#1D2932"
            border
            borderColor="#7e8a93"
            effect="solid"
          />
        </div>
      </>
    );
  }
  function claimReward() {
    if (claimLoading) return;
    setClaimLoading(true);
    claimRewardBySeed_boost(detailData.seed_id)
      .then(() => {
        window.location.reload();
      })
      .catch((error) => {
        setClaimLoading(false);
        // setError(error);
      });
  }
  function rewardRangeTip() {
    // const tip = intl.formatMessage({ id: 'over_tip' });
    const tip = 'Farm reward within this range';
    let result: string = `<div class="text-farmText text-xs text-left">${tip}</div>`;
    return result;
  }
  function switchDetailButton() {
    setShowDetail(!showDetail);
  }
  function getBetterSeedSymbols() {
    let result = '';
    detailData.pool.tokens_meta_data.forEach(
      (token: TokenMetadata, index: number) => {
        const symbol = toRealSymbol(token.symbol);
        if (index == detailData.pool.tokens_meta_data.length - 1) {
          result += symbol;
        } else {
          result += symbol + '-';
        }
      }
    );
    return result;
  }
  function goBetterSeed() {
    const [contractId, temp_pool_id] = betterSeed.seed_id.split('@');
    const [fixRange, pool_id, left_point, right_point] =
      temp_pool_id.split('&');
    const mft_id = `${pool_id}&${left_point}&${right_point}`;
    window.open(`/v2farms/${mft_id}-r`);
  }
  function getFee() {
    const [tokenx, tokeny, fee] = detailData?.pool?.pool_id?.split('|') || '';
    return +fee / 10000 + '%';
  }
  const radio = getBoostMutil();
  const needForbidden =
    (FARM_BLACK_LIST_V2 || []).indexOf(detailData.pool.pool_id.toString()) > -1;
  return (
    <div className={`m-auto lg:w-700px md:w-5/6 xs:w-11/12  xs:-mt-4 md:-mt-4`}>
      <div className="flex items-center justify-between">
        <div className="breadCrumbs flex items-center text-farmText text-base hover:text-white">
          <ArrowLeftIcon onClick={goBacktoFarms} className="cursor-pointer" />
          <label className="cursor-pointer" onClick={goBacktoFarms}>
            <FormattedMessage id="farms" />
          </label>
        </div>
        <div
          className="flex items-center text-farmText hover:text-framBorder lg:hidden"
          onClick={goPoolPage}
        >
          <label className="mx-2 text-sm cursor-pointer">V2 Pool Detail</label>
          <LinkArrowIcon className="cursor-pointer"></LinkArrowIcon>
        </div>
      </div>
      <div
        className={`flex justify-between items-center mt-7 flex-wrap ${
          isEnded() || needForbidden ? 'farmEnded' : ''
        }`}
      >
        <div className="left flex items-center h-11 ml-3">
          <span className="flex mr-4 xs:mr-3 md:mr-3">{displayImgs()}</span>
          <div className="flex items-center xs:flex-col md:flex-col xs:items-start md:items-start">
            <div className="flex items-center">
              <span className="flex items-center text-white font-bold text-xl whitespace-nowrap xs:text-sm md:text-sm">
                {displaySymbols()}
              </span>
              <div className="flex items-center bg-cardBg rounded-md mx-3 px-2 py-1 xsm:hidden">
                <span className="text-xs text-v3SwapGray">
                  <FormattedMessage id="fee_Tiers"></FormattedMessage>
                </span>
                <span className="text-xs text-v3Blue gotham_bold ml-1">
                  {getFee()}
                </span>
              </div>
              <DclFarmIcon className="xsm:ml-2"></DclFarmIcon>
              {isEnded() ? (
                <span className="text-farmText text-sm ml-2 relative top-0.5 xs:top-0 md:xs-0">
                  <FormattedMessage id="ended_search"></FormattedMessage>
                </span>
              ) : null}
              {radio ? (
                <div
                  className={`rounded-lg text-xs  font-bold px-2 py-0.5 ml-2 ${
                    Object.keys(user_seeds_map[detailData.seed_id] || {}).length
                      ? 'bg-lightGreenColor text-black'
                      : 'text-farmText border border-farmText'
                  }`}
                >
                  {`x${toPrecision(radio.toString(), 2)}`}
                </div>
              ) : (
                getBoostDom()
              )}
              {isNewSeed ? (
                <NewTag className="ml-2 relative -top-0.5"></NewTag>
              ) : null}
            </div>
            <div className="flex items-center bg-cardBg rounded-md px-2 mt-1.5 py-0.5 lg:hidden">
              <span className="text-xs text-v3SwapGray">
                <FormattedMessage id="fee_Tiers"></FormattedMessage>
              </span>
              <span className="text-xs text-v3Blue gotham_bold ml-1">
                {getFee()}
              </span>
            </div>
          </div>
        </div>

        <div
          className="flex items-center text-farmText hover:text-framBorder xsm:hidden"
          onClick={goPoolPage}
        >
          <label className="mx-2 text-sm cursor-pointer">V2 Pool Detail</label>
          <LinkArrowIcon className="cursor-pointer"></LinkArrowIcon>
        </div>
      </div>
      {/* new Farm is coming Banner */}
      {betterSeed ? (
        <div className="flex items-center justify-center bg-dclBannerColor rounded-xl text-sm text-white px-4 py-1 mt-4 mb-3">
          <span>The current farm will be ended soon. </span>
          <a
            onClick={goBetterSeed}
            className="underline gotham_bold cursor-pointer mx-2"
          >
            {getBetterSeedSymbols()} New Farm
          </a>
          <span>is coming!</span>
          <NewTag className="ml-1.5"></NewTag>
        </div>
      ) : null}

      {/* baseData for PC*/}
      <div className="flex items-stretch justify-between mt-4 xsm:hidden">
        <div className="flex justify-between bg-cardBg rounded-2xl px-3.5 py-4 flex-grow w-1 mr-3.5">
          <div className="flex flex-col items-start justify-between text-sm text-farmText border-r border-v3BlueBorderColor pr-10">
            <span>
              <FormattedMessage id="apr"></FormattedMessage>
            </span>
            <div
              className={``}
              data-type="info"
              data-place="top"
              data-multiline={true}
              data-tip={getAprTip()}
              data-html={true}
              data-for={'aprId' + detailData.farmList[0].farm_id + 'your'}
              data-class="reactTip"
            >
              <span>{get_total_apr()}</span>
              <ReactTooltip
                id={'aprId' + detailData.farmList[0].farm_id + 'your'}
                backgroundColor="#1D2932"
                border
                borderColor="#7e8a93"
                effect="solid"
              />
            </div>
          </div>
          <div className="flex flex-col items-end justify-between">
            <div className="flex items-center text-sm text-farmText">
              <span>Reward Range</span>
              <div
                className="text-white text-right ml-1"
                data-class="reactTip"
                data-for="rewardRangeTipId"
                data-place="top"
                data-html={true}
                data-tip={rewardRangeTip()}
              >
                <QuestionMark></QuestionMark>
                <ReactTooltip
                  id="rewardRangeTipId"
                  backgroundColor="#1D2932"
                  border
                  borderColor="#7e8a93"
                  effect="solid"
                />
              </div>
            </div>
            <div className="flex items-center mt-3">
              <RefreshIcon
                className="cursor-pointer mr-1"
                onClick={() => {
                  setRangeSort(!rangeSort);
                }}
              ></RefreshIcon>
              {getRange()}
            </div>
          </div>
        </div>
        <div
          className="flex flex-col justify-between bg-cardBg rounded-2xl px-3.5 py-4"
          style={{ minWidth: '240px' }}
        >
          <div className="flex items-center text-sm text-farmText">
            <FormattedMessage id="rewards_per_week"></FormattedMessage>
            <div
              className="text-white text-right ml-1"
              data-class="reactTip"
              data-for={'rewardPerWeekQId'}
              data-place="top"
              data-html={true}
              data-tip={valueOfRewardsTip()}
            >
              <QuestionMark></QuestionMark>
              <ReactTooltip
                id={'rewardPerWeekQId'}
                backgroundColor="#1D2932"
                border
                borderColor="#7e8a93"
                effect="solid"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            {totalTvlPerWeekDisplay()}
          </div>
        </div>
      </div>
      {/* baseData for Mobile*/}
      <div className="p-4 bg-cardBg rounded-2xl lg:hidden mt-5">
        <div className="border-b border-dclLineColor pb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-farmText">
              <FormattedMessage id="apr"></FormattedMessage>
            </span>
            <span className="text-base text-white">{get_total_apr()}</span>
          </div>
        </div>
        <div className="border-b border-dclLineColor py-3">
          <div className="relative flex items-start justify-end">
            <div className="flex items-center absolute left-0">
              <span className="text-sm text-farmText">Reward Range</span>
              <div
                className="text-white text-right ml-1"
                data-class="reactTip"
                data-for="rewardRangeTipId2"
                data-place="top"
                data-html={true}
                data-tip={rewardRangeTip()}
              >
                <QuestionMark></QuestionMark>
                <ReactTooltip
                  id="rewardRangeTipId2"
                  backgroundColor="#1D2932"
                  border
                  borderColor="#7e8a93"
                  effect="solid"
                />
              </div>
            </div>
            {getRange()}
          </div>
        </div>
        <div className="pt-3">
          <div className="flex items-center text-sm text-farmText">
            <FormattedMessage id="rewards_per_week"></FormattedMessage>
            <div
              className="text-white text-right ml-1"
              data-class="reactTip"
              data-for={'rewardPerWeekQId2'}
              data-place="top"
              data-html={true}
              data-tip={valueOfRewardsTip()}
            >
              <QuestionMark></QuestionMark>
              <ReactTooltip
                id={'rewardPerWeekQId2'}
                backgroundColor="#1D2932"
                border
                borderColor="#7e8a93"
                effect="solid"
              />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            {totalTvlPerWeekDisplay()}
          </div>
        </div>
      </div>
      {/* login area */}
      <AddLoginEntryBar></AddLoginEntryBar>
      {/* unClaimed Rewards for PC */}
      <div
        className={`flex items-center justify-between my-7 p-4 bg-dclFarmBlueColor rounded-xl xsm:hidden ${
          user_seeds_map[detailData.seed_id] ? '' : 'hidden'
        }`}
      >
        <div className="flex items-center text-sm text-white">
          <FormattedMessage id="unclaimed_rewards"></FormattedMessage>
          <div
            className="text-white text-right ml-1"
            data-class="reactTip"
            data-for={'unclaimedRewardQIdx'}
            data-place="top"
            data-html={true}
            data-tip={valueOfRewardsTip()}
          >
            <QuestionMark></QuestionMark>
            <ReactTooltip
              id={'unclaimedRewardQIdx'}
              backgroundColor="#1D2932"
              border
              borderColor="#7e8a93"
              effect="solid"
            />
          </div>
        </div>
        <div className="flex items-center">
          <div
            className="text-white text-right"
            data-class="reactTip"
            data-for={'unclaimedRewardId' + detailData.seed_id}
            data-place="top"
            data-html={true}
            data-tip={unclaimedRewardsData.tip}
          >
            <span className="text-xl text-white">
              {unclaimedRewardsData.worth}
            </span>
            <ReactTooltip
              id={'unclaimedRewardId' + detailData.seed_id}
              backgroundColor="#1D2932"
              border
              borderColor="#7e8a93"
              effect="solid"
            />
          </div>
          <span
            className={`ml-3 flex items-center justify-center bg-deepBlue rounded-lg text-sm text-white h-8 w-20 cursor-pointer ${
              unclaimedRewardsData.showClaimButton
                ? 'hover:bg-deepBlueHover'
                : 'opacity-40 cursor-not-allowed'
            }`}
            onClick={(e) => {
              if (!unclaimedRewardsData.showClaimButton) return;
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
      </div>
      {/* unClaimed Rewards for Mobile */}
      <div className="bg-dclFarmBlueColor rounded-xl p-4 mt-4 lg:hidden">
        <div className="flex items-center justify-between text-sm text-white">
          <div className="flex items-center">
            <FormattedMessage id="unclaimed_rewards"></FormattedMessage>
            <div
              className="text-white text-right ml-1"
              data-class="reactTip"
              data-for={'unclaimedRewardQIdx'}
              data-place="top"
              data-html={true}
              data-tip={valueOfRewardsTip()}
            >
              <QuestionMark></QuestionMark>
              <ReactTooltip
                id={'unclaimedRewardQIdx'}
                backgroundColor="#1D2932"
                border
                borderColor="#7e8a93"
                effect="solid"
              />
            </div>
          </div>

          <div
            className="text-white text-right"
            data-class="reactTip"
            data-for={'unclaimedRewardId' + detailData.seed_id}
            data-place="top"
            data-html={true}
            data-tip={unclaimedRewardsData.tip}
          >
            <span className="text-xl text-white gotham_bold">
              {unclaimedRewardsData.worth}
            </span>
            <ReactTooltip
              id={'unclaimedRewardId' + detailData.seed_id}
              backgroundColor="#1D2932"
              border
              borderColor="#7e8a93"
              effect="solid"
            />
          </div>
        </div>
        {unclaimedRewardsData.showClaimButton ? (
          <div className="flex justify-between items-center mt-3">
            <div
              onClick={switchDetailButton}
              className={`flex items-center text-xs bg-lightBGreyColor bg-opacity-20 rounded-full px-4 py-0.5 cursor-pointer ${
                showDetail ? 'text-greenColor' : 'text-white'
              }`}
            >
              <FormattedMessage id="detail" />
              <UpArrowIcon
                className={`ml-1 transform ${
                  showDetail ? 'text-greenColor' : 'text-primaryText rotate-180'
                }`}
              ></UpArrowIcon>
            </div>
            <span
              className="flex items-center justify-center bg-deepBlue hover:bg-deepBlueHover rounded-lg text-sm text-white h-8 w-36 cursor-pointer"
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

        <div
          className={`grid grid-cols-1 gap-y-4 mt-4 pt-4 border-t border-borderGreyColor border-opacity-20 ${
            showDetail ? '' : 'hidden'
          }`}
        >
          {unclaimedRewardsData.list.map(
            (
              {
                token,
                amount,
                preAmount,
              }: { token: TokenMetadata; amount: string; preAmount: string },
              index: number
            ) => {
              return (
                <div
                  className="flex items-center xs:justify-between md:justify-between"
                  key={index}
                >
                  <div className="flex items-center w-28">
                    <img
                      className="w-5 h-5 rounded-full border border-greenColor"
                      src={token.icon}
                    ></img>
                    <span className="text-white text-sm ml-1.5">
                      {toRealSymbol(token.symbol)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    {preAmount ? (
                      <>
                        <span className="text-sm text-white">{preAmount}</span>
                        <span className="mx-3.5">
                          <BoostRightArrowIcon></BoostRightArrowIcon>
                        </span>
                        <span className={`text-sm text-white`}>{amount}</span>
                      </>
                    ) : (
                      <span className={`text-sm text-white`}>{amount}</span>
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
      {/* Your Position(s) */}
      <div className="mt-6">
        <div className="flex items-center justify-end mb-2.5">
          {/* <span className="text-sm text-primaryText">Your Position(s)</span> */}
          <div
            onClick={() => {
              setAddLiquidityModalVisible(true);
            }}
            className={`flex items-center text-sm text-primaryText p-1.5 cursor-pointer border border-v3HoverDarkBgColor hover:text-white hover:bg-dclButtonBgColor border-dashed rounded-lg ${
              listLiquidities.length > 0 ? '' : 'hidden'
            }`}
          >
            <AddButtonIcon className="mr-1.5"></AddButtonIcon>
            Add Position
          </div>
        </div>
        {listLiquidities.length == 0 && !listLiquiditiesLoading ? (
          <div className="rounded-lg overflow-hidden mt-2.5 bg-detailCardBg">
            <div className="w-full bg-gradientFrom h-1.5"></div>
            <div className="flex items-center justify-between p-3">
              <span className="text-sm text-white">
                You don't have any V2 Liquidity NFT for now, click 'Add
                Position' to start farming.
              </span>
              <GradientButton
                onClick={() => {
                  setAddLiquidityModalVisible(true);
                }}
                color="#fff"
                borderRadius="8px"
                className={`flex-shrink-0 px-4 h-9  text-center text-sm text-white ml-2`}
              >
                Add Position
              </GradientButton>
            </div>
          </div>
        ) : null}
        <FarmContext.Provider
          value={{
            detailData,
            tokenPriceList,
            tokens,
            needForbidden,
            mft_balance_in_dcl_account,
            rate_need_to_reverse_display,
          }}
        >
          {listLiquidities_inFarimg.length > 0 ? (
            <>
              <div className="text-sm text-primaryText mb-5 pl-3">
                Faming Position(s)
              </div>
              {listLiquidities_inFarimg.map((liquidity: UserLiquidityInfo) => {
                return <LiquidityLine liquidity={liquidity}></LiquidityLine>;
              })}
            </>
          ) : null}

          {listLiquidities_unFarimg.length > 0 ? (
            <>
              <div className="text-sm text-primaryText mb-5 mt-7 pl-3">
                Unfarming Position(s)
              </div>
              {listLiquidities_unFarimg.map((liquidity: UserLiquidityInfo) => {
                return <LiquidityLine liquidity={liquidity}></LiquidityLine>;
              })}{' '}
            </>
          ) : null}

          {listLiquidities_unavailable.length > 0 ? (
            <>
              <div className="text-sm text-primaryText mb-5 mt-7 pl-3">
                Unavailable Position(s)
              </div>
              {listLiquidities_unavailable.map(
                (liquidity: UserLiquidityInfo) => {
                  return <LiquidityLine liquidity={liquidity}></LiquidityLine>;
                }
              )}
            </>
          ) : null}
        </FarmContext.Provider>
      </div>
      {/* add liquidity modal */}
      <AddNewPoolV3
        isOpen={addLiquidityModalVisible}
        onRequestClose={() => {
          setAddLiquidityModalVisible(false);
        }}
        seed={detailData}
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
      ></AddNewPoolV3>
    </div>
  );
}

function LiquidityLine(props: { liquidity: UserLiquidityInfo }) {
  const { liquidity } = props;
  const {
    detailData,
    tokenPriceList,
    tokens,
    needForbidden,
    mft_balance_in_dcl_account,
    rate_need_to_reverse_display,
  } = useContext(FarmContext);
  const [nft_stake_loading, set_nft_stake_loading] = useState(false);
  const [nft_unStake_loading, set_nft_unStake_loading] = useState(false);
  const [hover, setHover] = useState(false);
  const [is_liquidity_staked_for_another_seed, is_too_little_can_not_stake] =
    useMemo(() => {
      if (!(liquidity && detailData)) return [false, false];
      const { mft_id } = liquidity;
      let is_liquidity_staked_for_another_seed = false;
      let is_too_little_can_not_stake = false;
      if (new BigNumber(liquidity.amount).isLessThan(detailData.min_deposit)) {
        is_too_little_can_not_stake = true;
      }
      if (mft_id) {
        const [contractId, temp_pool_id] = detailData.seed_id.split('@');
        const [fixRange_s, pool_id_s, left_point_s, right_point_s] =
          temp_pool_id.split('&');
        const [fixRange_l, pool_id_l, left_point_l, right_point_l] =
          liquidity.mft_id.split('&');
        if (left_point_s != left_point_l || right_point_s != right_point_l)
          is_liquidity_staked_for_another_seed = true;
      }
      return [
        is_liquidity_staked_for_another_seed,
        is_too_little_can_not_stake,
      ];
    }, [liquidity, detailData]);
  const liquidity_status_string: StatusType | string = useMemo(() => {
    if (!(liquidity && detailData)) return '';
    const { part_farm_ratio, mft_id } = liquidity;
    const [left_point, right_point] = get_valid_range(
      liquidity,
      detailData.seed_id
    );
    const inRange = right_point > left_point;
    let status: StatusType;
    if (part_farm_ratio == '100') {
      status = 'farming';
    } else if (
      !inRange ||
      is_liquidity_staked_for_another_seed ||
      is_too_little_can_not_stake
    ) {
      status = 'unavailable';
    } else if (part_farm_ratio == '0' || !mft_id) {
      status = 'unfarming';
    } else {
      status = 'partialfarming';
    }
    return status;
  }, [liquidity, detailData, is_liquidity_staked_for_another_seed]);
  const [liquidity_status_display, liquidity_operation_display]: any =
    useMemo(() => {
      if (!(liquidity && detailData && liquidity_status_string))
        return [null, []];
      const part_farm_ratio = liquidity.part_farm_ratio;
      let status;
      let operation: string[] = [];
      if (liquidity_status_string == 'farming') {
        status = (
          <span className="text-sm, text-dclFarmGreenColor">Farming</span>
        );
        operation = ['unstake'];
      } else if (liquidity_status_string == 'unavailable') {
        status = <span className="text-sm, text-primaryText">Unavailable</span>;
      } else if (liquidity_status_string == 'unfarming') {
        status = <span className="text-sm, text-primaryText">Unfarming</span>;
        operation = ['stake'];
      } else {
        const part_farm_ratio_big = new BigNumber(part_farm_ratio);
        let percent = '-%';
        if (part_farm_ratio_big.isLessThan(1)) {
          percent = '<1%';
        } else {
          percent = `${part_farm_ratio_big.toFixed(0, 1)}%`;
        }
        status = (
          <span className="text-sm, text-dclFarmYellowColor whitespace-nowrap">
            {percent} Partial Farming
          </span>
        );
        operation = ['stake', 'unstake'];
      }
      return [status, operation];
    }, [liquidity, detailData, liquidity_status_string]);
  function get_liquidity_value(liquidity: UserLiquidityInfo) {
    const { left_point, right_point, amount } = liquidity;
    const poolDetail = detailData.pool;
    const { token_x, token_y } = poolDetail;
    const v = get_total_value_by_liquidity_amount_dcl({
      left_point,
      right_point,
      poolDetail,
      amount,
      price_x_y: {
        [token_x]: tokenPriceList[token_x]?.price || '0',
        [token_y]: tokenPriceList[token_y]?.price || '0',
      },
      metadata_x_y: {
        [token_x]: tokens[0],
        [token_y]: tokens[1],
      },
    });
    return v;
  }
  function get_liquidity_value_display(liquidity: UserLiquidityInfo) {
    const v = get_liquidity_value(liquidity);
    const v_big = new BigNumber(v);
    if (v_big.isLessThan(0.01)) {
      return `<$0.01`;
    } else {
      return `$${formatWithCommas(toPrecision(v.toString(), 2))}`;
    }
  }
  function get_your_range(liquidity: UserLiquidityInfo, site: string) {
    const { left_point, right_point } = liquidity;
    const [token_x_metadata, token_y_metadata] =
      detailData.pool.tokens_meta_data;
    const [fixRange, dcl_pool_id, seed_left_point, seed_right_point] =
      detailData.seed_id.split('@')[1].split('&');
    const max_left_point = Math.max(+left_point, +seed_left_point);
    const min_right_point = Math.min(+right_point, +seed_right_point);
    let icon;
    let p;
    if (+min_right_point > +max_left_point) {
      const range_cross = new BigNumber(min_right_point).minus(max_left_point);
      const range_seed = new BigNumber(seed_right_point).minus(seed_left_point);
      const range_user = new BigNumber(right_point).minus(left_point);
      let range_denominator = range_seed;
      if (left_point <= seed_left_point && right_point >= seed_right_point) {
        range_denominator = range_user;
      }
      p = range_cross.dividedBy(range_denominator).multipliedBy(100);
      if (p.isLessThan(20)) {
        icon = (
          <CrossIconLittle num={site == 'mobile' ? '1' : '2'}></CrossIconLittle>
        );
      } else if (p.isLessThan(60)) {
        icon = (
          <CrossIconMiddle num={site == 'mobile' ? '1' : '2'}></CrossIconMiddle>
        );
      } else if (p.isLessThan(100)) {
        icon = (
          <CrossIconLarge num={site == 'mobile' ? '1' : '2'}></CrossIconLarge>
        );
      } else {
        icon = <CrossIconFull></CrossIconFull>;
      }
    } else {
      icon = <CrossIconEmpty></CrossIconEmpty>;
    }
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
    const display_left_price = left_price;
    const display_right_price = right_price;
    function rangeTip() {
      // const tip = intl.formatMessage({ id: 'farmRewardsCopy' });
      const tip =
        'The intersection of your price range and the farm reward range.';
      let result: string = `<div class="text-farmText text-xs w-52 text-left">${tip}</div>`;
      return result;
    }
    function displayP(p: BigNumber) {
      if (!p) return '0%';
      if (p.isLessThan(1)) {
        return '1%';
      } else {
        return p?.toFixed(0, 1) + '%';
      }
    }
    return (
      <div className="flex items-center">
        <span className="text-sm mr-1.5">
          {displayNumberToAppropriateDecimals(display_left_price)} ~{' '}
          {displayNumberToAppropriateDecimals(display_right_price)}
        </span>
        <div
          className="text-white text-right"
          data-class="reactTip"
          data-for={'rewardPerWeekQId'}
          data-place="top"
          data-html={true}
          data-tip={rangeTip()}
        >
          <span className="flex items-center text-xs text-primaryText">
            {icon}
            <label className="ml-1 xsm:hidden">{displayP(p)}</label>
          </span>
          <ReactTooltip
            id={'rewardPerWeekQId'}
            backgroundColor="#1D2932"
            border
            borderColor="#7e8a93"
            effect="solid"
          />
        </div>
      </div>
    );
  }
  function get_your_apr(liquidity: UserLiquidityInfo) {
    const { farmList, total_seed_amount, total_seed_power } = detailData;
    // principal
    const total_principal = get_liquidity_value(liquidity);
    // seed total rewards
    let total_rewards = '0';
    farmList.forEach((farm: FarmBoost) => {
      const { token_meta_data } = farm;
      const { daily_reward, reward_token } = farm.terms;
      const quantity = toReadableNumber(token_meta_data.decimals, daily_reward);
      const reward_token_price = Number(
        tokenPriceList[reward_token]?.price || 0
      );
      const cur_token_rewards = new BigNumber(quantity)
        .multipliedBy(reward_token_price)
        .multipliedBy(365);
      total_rewards = cur_token_rewards.plus(total_rewards).toFixed();
    });
    // lp percent
    let percent;
    const mint_amount = mint_liquidity(liquidity, detailData.seed_id);
    const part_farm_ratio = liquidity.part_farm_ratio;
    if (+part_farm_ratio == 100) {
      // full farming
      if (+total_seed_power > 0) {
        percent = new BigNumber(mint_amount).dividedBy(total_seed_power);
      }
    } else if (+part_farm_ratio > 0 && +part_farm_ratio < 100) {
      // partial Farming
      if (+total_seed_power > 0) {
        const partial_amount = new BigNumber(mint_amount)
          .multipliedBy(part_farm_ratio)
          .dividedBy(100);
        percent = partial_amount.dividedBy(total_seed_power);
      }
    } else {
      // unFarming, unavailable
      const temp_total = new BigNumber(total_seed_power || 0).plus(mint_amount);
      if (temp_total.isGreaterThan(0)) {
        percent = new BigNumber(mint_amount).dividedBy(temp_total);
      }
    }
    // profit
    let profit;
    if (percent) {
      profit = percent.multipliedBy(total_rewards);
    }

    // your apr
    if (profit) {
      if (+total_principal == 0) {
        return 0;
      }
      const your_apr = profit.dividedBy(total_principal).multipliedBy(100);
      if (your_apr.isEqualTo('0')) {
        return '0%';
      } else if (your_apr.isLessThan(0.01)) {
        return `<0.01%`;
      } else {
        return `${toPrecision(your_apr.toFixed(), 2)}%`;
      }
    } else {
      return '-';
    }
  }
  function stakeNFT(liquidity: UserLiquidityInfo) {
    set_nft_stake_loading(true);
    let finalAmount;
    const { mft_id, part_farm_ratio, unfarm_part_amount } = liquidity;
    const mint = !mft_id;
    const amount = mint_liquidity(liquidity, detailData.seed_id);
    if (mint || part_farm_ratio == '0') {
      finalAmount = amount;
    } else {
      finalAmount = unfarm_part_amount;
    }
    stake_boost_nft({
      lpt_id: liquidity.lpt_id,
      seed_id: detailData.seed_id,
      amount: finalAmount,
      mint,
    });
  }
  function unStakeNFT(liquidity: UserLiquidityInfo) {
    set_nft_unStake_loading(true);
    const amount = liquidity.v_liquidity;
    const mft_balance_big = new BigNumber(mft_balance_in_dcl_account);
    const amount_big = new BigNumber(amount);
    let finalAmount = '0';
    if (mft_balance_big.isEqualTo('0')) {
      finalAmount = amount;
    } else if (mft_balance_big.isGreaterThanOrEqualTo(amount)) {
      finalAmount = '0';
    } else {
      finalAmount = amount_big.minus(mft_balance_in_dcl_account).toFixed();
    }
    unStake_boost_nft({
      lpt_id: liquidity.lpt_id,
      seed_id: detailData.seed_id,
      unlock_amount: '0',
      withdraw_amount: finalAmount,
    });
  }
  function isEnded() {
    const farms = detailData.farmList;
    return farms[0].status == 'Ended';
  }
  function goYourLiquidityDetail(liquidity: UserLiquidityInfo) {
    const url_params = liquidity.lpt_id.replace(/\|/g, '@').replace(/#/g, '@');
    window.open(`/yoursLiquidityDetailV2/${url_params}`);
  }
  function unavailableTip() {
    let tip = 'Your price range is out of fix range';
    if (is_liquidity_staked_for_another_seed) {
      tip = 'This position has been staked in another farm';
    } else if (is_too_little_can_not_stake) {
      const rate = new BigNumber(detailData.min_deposit)
        .dividedBy(liquidity.amount)
        .toFixed(0, 1);
      tip = `The minimum staking amount is ${rate}x your liquidity `;
    }
    let result: string = `<div class="text-farmText text-xs text-left">${tip}</div>`;
    return result;
  }
  function apr_title() {
    if (
      liquidity_status_string == 'farming' ||
      liquidity_status_string == 'partialfarming'
    ) {
      return 'Your APR';
    } else {
      return 'Est. APR';
    }
  }
  const showStakeButton =
    !isEnded() && liquidity_operation_display.indexOf('stake') > -1;
  const showUnStakeButton = liquidity_operation_display.indexOf('unstake') > -1;
  return (
    <>
      {/* for PC */}
      <div
        className="relative xsm:hidden"
        key={liquidity.lpt_id}
        onMouseLeave={() => {
          setHover(false);
        }}
      >
        <div className="absolute -top-1.5 left-5 flex items-center justify-center">
          <NFTIdIcon className=""></NFTIdIcon>
          <span className="absolute gotham_bold text-xs text-white">
            NFT ID #{liquidity.lpt_id.split('#')[1]}
          </span>
        </div>
        <div className="bg-v3HoverDarkBgColor rounded-xl mb-5 overflow-hidden">
          <div
            onMouseOver={() => setHover(true)}
            className="grid grid-cols-5 pt-7 pb-3.5 px-6"
          >
            <div className="flex flex-col justify-between col-span-1 items-start">
              <span className="text-sm text-primaryText">Your Liquidity</span>
              <span
                className={`text-sm mt-2.5 ${
                  liquidity_status_string == 'unavailable'
                    ? 'text-primaryText'
                    : 'text-white'
                }`}
              >
                {get_liquidity_value_display(liquidity)}
              </span>
            </div>
            <div className="flex flex-col justify-between  col-span-2">
              <span className="text-sm text-primaryText">Your Price Range</span>
              <span
                className={`text-sm ${
                  liquidity_status_string == 'unavailable'
                    ? 'text-primaryText'
                    : 'text-white'
                }`}
              >
                {get_your_range(liquidity, 'pc')}
              </span>
            </div>
            <div className="flex flex-col justify-between col-span-1">
              <span className="text-sm text-primaryText">{apr_title()}</span>
              <span
                className={`text-sm ${
                  liquidity_status_string == 'unavailable'
                    ? 'text-primaryText'
                    : 'text-white'
                }`}
              >
                {get_your_apr(liquidity)}
              </span>
            </div>
            <div className="flex flex-col justify-between items-end col-span-1">
              <span className="text-sm text-primaryText">State</span>
              <div className={`flex items-center text-sm`}>
                {liquidity_status_display}
                {liquidity_status_string == 'unavailable' ? (
                  <div
                    className="text-white text-right ml-1"
                    data-class="reactTip"
                    data-for={`unavailableTipId_${liquidity.lpt_id}`}
                    data-place="top"
                    data-html={true}
                    data-tip={unavailableTip()}
                  >
                    <QuestionMark></QuestionMark>
                    <ReactTooltip
                      id={`unavailableTipId_${liquidity.lpt_id}`}
                      backgroundColor="#1D2932"
                      border
                      borderColor="#7e8a93"
                      effect="solid"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <div
            className={`flex items-center  justify-between bg-cardBg py-3 px-6 ${
              hover ? '' : 'hidden'
            } ${liquidity_status_string == 'unavailable' ? 'hidden' : ''}`}
          >
            <div
              onClick={() => {
                goYourLiquidityDetail(liquidity);
              }}
              className="flex items-center text-sm text-primaryText hover:text-white cursor-pointer"
            >
              <span className="mr-2">Liquidity Detail</span>
              <LinkArrowIcon className="cursor-pointer"></LinkArrowIcon>
            </div>
            <div className="flex items-center">
              <GradientButton
                onClick={() => {
                  stakeNFT(liquidity);
                }}
                color="#fff"
                disabled={needForbidden || nft_stake_loading ? true : false}
                btnClassName={needForbidden ? 'cursor-not-allowed' : ''}
                minWidth="6rem"
                className={`h-8 px-4 text-center text-sm text-white focus:outline-none ${
                  needForbidden || nft_stake_loading ? 'opacity-40' : ''
                } ${showStakeButton ? '' : 'hidden'}`}
              >
                <ButtonTextWrapper
                  loading={nft_stake_loading}
                  Text={() => (
                    <FormattedMessage id="stake" defaultMessage="Stake" />
                  )}
                />
              </GradientButton>
              <OprationButton
                onClick={() => {
                  unStakeNFT(liquidity);
                }}
                color="#fff"
                minWidth="6rem"
                disabled={nft_unStake_loading ? true : false}
                className={`flex items-center justify-center h-8 px-4 ml-2.5 text-center text-sm text-white focus:outline-none font-semibold bg-bgGreyDefault hover:bg-bgGreyHover ${
                  nft_unStake_loading ? 'opacity-40' : ''
                } ${showUnStakeButton ? '' : 'hidden'}`}
              >
                <ButtonTextWrapper
                  loading={nft_unStake_loading}
                  Text={() => (
                    <FormattedMessage id="unstake" defaultMessage="unstake" />
                  )}
                />
              </OprationButton>
            </div>
          </div>
        </div>
      </div>
      {/* for Mobile */}
      <div key={liquidity.lpt_id + 'm'} className="relative  mb-5 lg:hidden">
        <div className="bg-v3HoverDarkBgColor rounded-t-xl px-4 py-3">
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-primaryText">Your Liquidity</span>
            <span
              className={`text-sm ${
                liquidity_status_string == 'unavailable'
                  ? 'text-primaryText'
                  : 'text-white'
              }`}
            >
              {get_liquidity_value_display(liquidity)}
            </span>
          </div>
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-primaryText">Your Price Range</span>
            <span
              className={`text-sm ${
                liquidity_status_string == 'unavailable'
                  ? 'text-primaryText'
                  : 'text-white'
              }`}
            >
              {get_your_range(liquidity, 'mobile')}
            </span>
          </div>
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-primaryText">{apr_title()}</span>
            <span
              className={`text-sm ${
                liquidity_status_string == 'unavailable'
                  ? 'text-primaryText'
                  : 'text-white'
              }`}
            >
              {get_your_apr(liquidity)}
            </span>
          </div>
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-primaryText">State</span>
            <div className="flex items-center text-sm text-white">
              {liquidity_status_display}
              {liquidity_status_string == 'unavailable' ? (
                <div
                  className="text-white text-right ml-1"
                  data-class="reactTip"
                  data-for={`unavailableTipId_m_${liquidity.lpt_id}`}
                  data-place="top"
                  data-html={true}
                  data-tip={unavailableTip()}
                >
                  <QuestionMark></QuestionMark>
                  <ReactTooltip
                    id={`unavailableTipId_m_${liquidity.lpt_id}`}
                    backgroundColor="#1D2932"
                    border
                    borderColor="#7e8a93"
                    effect="solid"
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div
          className={`flex flex-col items-center justify-center rounded-b-xl bg-cardBg px-4 py-4`}
        >
          <div
            className={`flex items-center w-full ${
              liquidity_status_string == 'unavailable' ? 'hidden' : ''
            }`}
          >
            <GradientButton
              onClick={() => {
                stakeNFT(liquidity);
              }}
              color="#fff"
              disabled={needForbidden || nft_stake_loading ? true : false}
              btnClassName={needForbidden ? 'cursor-not-allowed' : ''}
              minWidth="6rem"
              className={`h-8 px-4 text-center text-sm text-white focus:outline-none ${
                showStakeButton && showUnStakeButton ? '' : 'w-full'
              } ${needForbidden || nft_stake_loading ? 'opacity-40' : ''} ${
                showStakeButton ? '' : 'hidden'
              }`}
            >
              <ButtonTextWrapper
                loading={nft_stake_loading}
                Text={() => (
                  <FormattedMessage id="stake" defaultMessage="Stake" />
                )}
              />
            </GradientButton>
            <OprationButton
              onClick={() => {
                unStakeNFT(liquidity);
              }}
              color="#fff"
              minWidth="6rem"
              disabled={nft_unStake_loading ? true : false}
              className={`flex items-center justify-center h-8 px-4 text-center text-sm text-white focus:outline-none font-semibold bg-bgGreyDefault hover:bg-bgGreyHover ${
                showStakeButton && showUnStakeButton ? 'ml-2.5' : 'w-full'
              } ${nft_unStake_loading ? 'opacity-40' : ''} ${
                showUnStakeButton ? '' : 'hidden'
              }`}
            >
              <ButtonTextWrapper
                loading={nft_unStake_loading}
                Text={() => (
                  <FormattedMessage id="unstake" defaultMessage="unstake" />
                )}
              />
            </OprationButton>
          </div>
          <p
            className={`flex items-center justify-between text-sm text-dclFarmYellowColor ${
              liquidity_status_string == 'unavailable' ? '' : 'hidden'
            }`}
          >
            Your price range is out of fix range
          </p>
          <div
            onClick={() => {
              goYourLiquidityDetail(liquidity);
            }}
            className="flex items-center text-sm text-primaryText hover:text-white cursor-pointer mt-4"
          >
            <span className="mr-2">Liquidity Detail</span>
            <LinkArrowIcon className="cursor-pointer"></LinkArrowIcon>
          </div>
        </div>
      </div>
    </>
  );
}
function AddLoginEntryBar() {
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  if (isSignedIn) return null;
  return (
    <div
      className="rounded-lg overflow-hidden mt-8"
      style={{ backgroundColor: 'rgba(29, 41, 50, 0.5)' }}
    >
      <div className="w-full bg-gradientFrom h-1.5"></div>
      <div className="pt-5 pb-3 px-3 w-80 m-auto">
        <ConnectToNearBtn></ConnectToNearBtn>
      </div>
    </div>
  );
}
type StatusType = 'farming' | 'unavailable' | 'unfarming' | 'partialfarming';
