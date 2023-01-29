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
import { TokenMetadata } from '../../services/ft-contract';
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
  useEffect(() => {
    if (isSignedIn) {
      get_list_liquidities();
      get_mft_balance_of();
    }
  }, [isSignedIn, user_data_loading]);
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
      const { free_amount, locked_amount } =
        user_seeds_map[detailData.seed_id] || {};
      const user_seed_amount = new BigNumber(free_amount)
        .plus(locked_amount)
        .toFixed();
      const [temp_farming, temp_free, temp_unavailable] =
        allocation_rule_liquidities({
          list,
          user_seed_amount,
          seed_id: detailData.seed_id,
        });
      const matched_liquidities = temp_farming
        .concat(temp_free)
        .concat(temp_unavailable);
      set_listLiquidities_inFarimg(temp_farming);
      set_listLiquidities_unFarimg(temp_free);
      set_listLiquidities_unavailable(temp_unavailable);
      setListLiquidities(matched_liquidities);
      setListLiquiditiesLoading(false);
      console.log(
        'temp_farming_final temp_farming_final temp_farming_final',
        temp_farming
      );
      console.log(
        'temp_free temp_free temp_free temp_free temp_free',
        temp_free
      );
      console.log(
        'temp_unavailable temp_unavailable temp_unavailable temp_unavailable',
        temp_unavailable
      );
      console.log(
        'liquidity liquidity liquidity liquidity',
        matched_liquidities
      );
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
      left_price = new BigNumber(1).dividedBy(left_price).toFixed();
      right_price = new BigNumber(1).dividedBy(right_price).toFixed();
    }
    let display_left_price;
    let display_right_price;
    const valueBig_l = new BigNumber(left_price);
    if (valueBig_l.isGreaterThan('100000')) {
      display_left_price = new BigNumber(left_price).toExponential(3);
    } else {
      display_left_price = toPrecision(left_price, 6);
    }
    const valueBig_r = new BigNumber(right_price);
    if (valueBig_r.isGreaterThan('100000')) {
      display_right_price = new BigNumber(right_price).toExponential(3);
    } else {
      display_right_price = toPrecision(right_price, 6);
    }
    // todo 稳定货币汇率展示问题
    return (
      <div className="flex items-center whitespace-nowrap">
        <span className="text-xs text-farmText">
          1 {rangeSort ? token_x_metadata.symbol : token_y_metadata.symbol}
        </span>
        <span className="text-base text-white mx-2">
          {display_left_price} ~ {display_right_price}
        </span>
        <span className="text-xs text-farmText">
          {rangeSort ? token_y_metadata.symbol : token_x_metadata.symbol}
        </span>
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
  const radio = getBoostMutil();
  const needForbidden =
    (FARM_BLACK_LIST_V2 || []).indexOf(detailData.pool.pool_id.toString()) > -1;
  return (
    <div className={`m-auto lg:w-760px md:w-5/6 xs:w-11/12  xs:-mt-4 md:-mt-4`}>
      <div className="breadCrumbs flex items-center text-farmText text-base hover:text-white">
        <ArrowLeftIcon onClick={goBacktoFarms} className="cursor-pointer" />
        <label className="cursor-pointer" onClick={goBacktoFarms}>
          <FormattedMessage id="farms" />
        </label>
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
              <div className="flex items-center bg-cardBg rounded-md mx-3 px-2 py-1">
                <span className="text-xs text-v3SwapGray">
                  <FormattedMessage id="fee_Tiers"></FormattedMessage>
                </span>
                <span className="text-xs text-v3Blue gotham_bold ml-1">
                  0.2%
                </span>
              </div>
              <DclFarmIcon></DclFarmIcon>
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
            </div>
            <div className="flex items-center lg:hidden" onClick={goPoolPage}>
              <label className="mr-1 text-xs text-greenColor">
                <FormattedMessage id="get_lp_token"></FormattedMessage>
              </label>
              <VEARROW className="text-greenColor"></VEARROW>
            </div>
          </div>
        </div>

        <div
          className="flex items-center xs:hidden md:hidden"
          onClick={goPoolPage}
        >
          <label className="mx-2 text-sm text-primaryText hover:text-framBorder cursor-pointer">
            V2 Pool Detail
          </label>
          <LinkIcon></LinkIcon>
        </div>
      </div>
      {/* baseData */}
      <div className="flex items-stretch justify-between mt-4">
        <div className="flex flex-col justify-between bg-cardBg rounded-2xl px-3.5 py-4 flex-grow w-1">
          <div className="flex items-center justify-between text-sm text-farmText">
            <span>
              <FormattedMessage id="total_staked"></FormattedMessage>
            </span>
            <span>
              <FormattedMessage id="apr"></FormattedMessage>
            </span>
          </div>
          <div className="flex items-center justify-between text-base text-white mt-4">
            <span>{get_total_staked()}</span>
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
        </div>
        <div className="flex flex-col justify-between bg-cardBg rounded-2xl px-3.5 py-4 mx-3">
          <div className="flex items-center justify-between text-sm text-farmText">
            <span>Reward Range</span>
            <RefreshIcon
              className="cursor-pointer"
              onClick={() => {
                setRangeSort(!rangeSort);
              }}
            ></RefreshIcon>
          </div>
          <div className="text-sm text-farmText">{getRange()}</div>
        </div>
        <div className="flex flex-col justify-between bg-cardBg rounded-2xl px-3.5 py-4 flex-grow w-1">
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
          <div className="flex items-center justify-between text-base text-white">
            {totalTvlPerWeekDisplay()}
          </div>
        </div>
      </div>
      {/* unClaimed Rewards */}
      <div className="flex items-center justify-between my-7 p-4 bg-dclFarmBlueColor rounded-xl">
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
      {/* Your position(s) */}
      <div className="mt-6">
        <div className="flex items-center justify-end mb-2.5">
          {/* <span className="text-sm text-primaryText">Your position(s)</span> */}
          <div
            onClick={() => {
              setAddLiquidityModalVisible(true);
            }}
            className={`flex items-center text-sm text-primaryText p-1.5 cursor-pointer border border-v3HoverDarkBgColor border-dashed rounded-lg ${
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
          }}
        >
          {listLiquidities_inFarimg.length > 0 ? (
            <>
              <div className="text-sm text-primaryText mb-5 pl-3">
                Faming position(s)
              </div>
              {listLiquidities_inFarimg.map((liquidity: UserLiquidityInfo) => {
                return <LiquidityLine liquidity={liquidity}></LiquidityLine>;
              })}
            </>
          ) : null}

          {listLiquidities_unFarimg.length > 0 ? (
            <>
              <div className="text-sm text-primaryText mb-5 mt-7 pl-3">
                Unfarming position(s)
              </div>
              {listLiquidities_unFarimg.map((liquidity: UserLiquidityInfo) => {
                return <LiquidityLine liquidity={liquidity}></LiquidityLine>;
              })}{' '}
            </>
          ) : null}

          {listLiquidities_unavailable.length > 0 ? (
            <>
              <div className="text-sm text-primaryText mb-5 mt-7 pl-3">
                Unavailable position(s)
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
  } = useContext(FarmContext);
  const [nft_stake_loading, set_nft_stake_loading] = useState(false);
  const [nft_unStake_loading, set_nft_unStake_loading] = useState(false);
  const [liquidity_status, liquidity_operation]: any = useMemo(() => {
    return display_liquidity_status(liquidity);
  }, [liquidity, detailData]);
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
    return `$${formatWithCommas(toPrecision(v.toString(), 3))}`;
  }
  function get_liquidity_status(liquidity: UserLiquidityInfo) {
    const { mft_id } = liquidity;
    const [max_left_point, min_right_point] = get_valid_range(
      liquidity,
      detailData.seed_id
    );
    if (mft_id) {
      return 1;
    } else if (min_right_point > max_left_point) {
      return 2;
    } else {
      return 3;
    }
  }
  function display_liquidity_status(liquidity: UserLiquidityInfo) {
    const part_farm_ratio = liquidity.part_farm_ratio;
    const { mft_id } = liquidity;
    const [left_point, right_point] = get_valid_range(
      liquidity,
      detailData.seed_id
    );
    const inRange = right_point > left_point;
    let status;
    let operation: string[] = [];
    if (part_farm_ratio == '100') {
      status = <span className="text-sm, text-dclFarmGreenColor">Farming</span>;
      operation = ['unstake'];
    } else if (!inRange) {
      status = <span className="text-sm, text-primaryText">Unavailable</span>;
    } else if (part_farm_ratio == '0' || !mft_id) {
      status = <span className="text-sm, text-primaryText">Unfarming</span>;
      operation = ['stake'];
    } else {
      const part_farm_ratio_big = new BigNumber(part_farm_ratio);
      let percent = '-%';
      if (part_farm_ratio_big.isLessThan(1)) {
        percent = '<1%';
      } else {
        percent = `${part_farm_ratio_big.toFixed(0)}%`;
      }
      status = (
        <span className="text-sm, text-dclFarmYellowColor">
          {percent} Partial Farming
        </span>
      );
      operation = ['stake', 'unstake'];
    }
    return [status, operation];
  }
  function get_your_range(liquidity: UserLiquidityInfo) {
    const { left_point, right_point } = liquidity;
    const [token_x_metadata, token_y_metadata] =
      detailData.pool.tokens_meta_data;
    const [fixRange, dcl_pool_id, seed_left_point, seed_right_point] =
      detailData.seed_id.split('@')[1].split('&');
    const max_left_point = Math.max(+left_point, +seed_left_point);
    const min_right_point = Math.min(+right_point, +seed_right_point);
    let icon;
    if (+min_right_point > +max_left_point) {
      const range_cross = new BigNumber(min_right_point).minus(max_left_point);
      const range_seed = new BigNumber(seed_right_point).minus(seed_left_point);
      const p = range_cross.dividedBy(range_seed).multipliedBy(100);
      if (p.isLessThan(20)) {
        icon = <CrossIconLittle></CrossIconLittle>;
      } else if (p.isLessThan(60)) {
        icon = <CrossIconMiddle></CrossIconMiddle>;
      } else if (p.isLessThan(100)) {
        icon = <CrossIconFull></CrossIconFull>;
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
    let display_left_price;
    let display_right_price;
    const valueBig_l = new BigNumber(left_price);
    if (valueBig_l.isGreaterThan('100000')) {
      display_left_price = new BigNumber(left_price).toExponential(3);
    } else {
      display_left_price = toPrecision(left_price, 6);
    }
    const valueBig_r = new BigNumber(right_price);
    if (valueBig_r.isGreaterThan('100000')) {
      display_right_price = new BigNumber(right_price).toExponential(3);
    } else {
      display_right_price = toPrecision(right_price, 6);
    }

    return (
      <div className="flex items-center">
        <span className="text-sm text-white mr-1.5">
          {display_left_price} ~ ${display_right_price}
        </span>
        {icon}
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
    if (liquidity.mft_id) {
      // farming
      percent = new BigNumber(mint_amount).dividedBy(total_seed_power);
    } else {
      const temp_total = new BigNumber(total_seed_power).plus(mint_amount);
      percent = new BigNumber(mint_amount).dividedBy(temp_total);
    }
    // profit
    const profit = percent.multipliedBy(total_rewards);

    // your apr
    const your_apr = profit.dividedBy(total_principal).multipliedBy(100);
    if (your_apr.isEqualTo('0')) {
      return '0%';
    } else if (your_apr.isLessThan(0.01)) {
      return `<0.01%`;
    } else {
      return `${toPrecision(your_apr.toFixed(), 2)}%`;
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
  const showStakeButton =
    !isEnded() && liquidity_operation.indexOf('stake') > -1;
  const showUnStakeButton = liquidity_operation.indexOf('unstake') > -1;
  return (
    <div className="relative" key={liquidity.lpt_id}>
      <div className="absolute -top-1.5 left-5 flex items-center justify-center">
        <NFTIdIcon className=""></NFTIdIcon>
        <span className="absolute gotham_bold text-xs text-white">
          NFT ID #{liquidity.lpt_id.split('#')[1]}
        </span>
      </div>
      <div className="bg-v3HoverDarkBgColor rounded-xl mb-5 overflow-hidden">
        <div className="grid grid-cols-5 pt-7 pb-3.5 px-6">
          <div className="flex flex-col justify-between col-span-1 items-start">
            <span className="text-sm text-primaryText">Your Liquidity</span>
            <span className="text-sm text-white mt-2.5">
              {get_liquidity_value_display(liquidity)}
            </span>
          </div>
          <div className="flex flex-col justify-between  col-span-2">
            <span className="text-sm text-primaryText">Your Price Range</span>
            <span className="text-sm text-white">
              {get_your_range(liquidity)}
            </span>
          </div>
          <div className="flex flex-col justify-between col-span-1">
            <span className="text-sm text-primaryText">Your APR</span>
            <span className="text-sm text-white">
              {get_your_apr(liquidity)}
            </span>
          </div>
          <div className="flex flex-col justify-between items-end col-span-1">
            <span className="text-sm text-primaryText">State</span>
            <span className="text-sm text-white">{liquidity_status}</span>
          </div>
        </div>
        <div
          className={`flex items-center justify-end bg-cardBg py-3 px-6 ${
            get_liquidity_status(liquidity) == 3 ? 'hidden' : ''
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
  );
}
