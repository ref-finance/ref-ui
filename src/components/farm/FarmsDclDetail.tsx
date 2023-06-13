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
  UpArrowIcon,
  BoostRightArrowIcon,
  BoostOptIcon,
  DclFarmIcon,
  NFTIdIcon,
  LinkArrowIcon,
  NewTag,
  CalcIcon,
} from '~components/icon/FarmBoost';
import { RefreshIcon } from '~components/icon/swapV3';
import { AddButtonIcon } from '~components/icon/V3';
import { useHistory, useLocation } from 'react-router-dom';
import getConfig from '../../services/config';
import { LinkIcon, ArrowDownHollow } from '~components/icon';
import {
  FarmBoost,
  Seed,
  claimRewardBySeed_boost,
  BoostConfig,
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
} from '~components/button/Button';
import { getMftTokenId, toRealSymbol } from '~utils/token';
import ReactTooltip from 'react-tooltip';
import QuestionMark from '~components/farm/QuestionMark';
import { LOVE_TOKEN_DECIMAL } from '../../state/referendum';
import {
  getPriceByPoint,
  UserLiquidityInfo,
  get_total_value_by_liquidity_amount_dcl,
  mint_liquidity,
  get_valid_range,
  allocation_rule_liquidities,
  TOKEN_LIST_FOR_RATE,
  get_matched_seeds_for_dcl_pool,
  displayNumberToAppropriateDecimals,
  get_intersection_radio,
  get_intersection_icon_by_radio,
  getEffectiveFarmList,
  sort_tokens_by_base,
  get_pool_name,
  openUrl,
} from '~services/commonV3';
import { list_liquidities, dcl_mft_balance_of } from '../../services/swapV3';
import { AddNewPoolV3 } from '~components/pool/AddNewPoolV3';
import { ftGetTokenMetadata, TokenMetadata } from '~services/ft-contract';
import CalcModelDcl from '../../components/farm/CalcModelDcl';
import { formatWithCommas_usd, formatPercentage } from './utils';
import moment from 'moment';
import Big from 'big.js';
const ONLY_ZEROS = /^0*\.?0*$/;
const { REF_VE_CONTRACT_ID, REF_UNI_V3_SWAP_CONTRACT_ID } = getConfig();
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
  all_seeds: Seed[];
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
    all_seeds,
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
  const [mft_balance_in_dcl_account, set_mft_balance_in_dcl_account] =
    useState('0');
  const [claimLoading, setClaimLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [betterSeed, setBetterSeed] = useState<Seed>();
  const [isNewSeed, setIsNewSeed] = useState<boolean>(false);
  const [seedDclCalcVisible, setSeedDclCalcVisible] = useState(false);
  const [nft_stake_loading, set_nft_stake_loading] = useState(false);
  const [nft_unStake_loading, set_nft_unStake_loading] = useState(false);
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
  const isEnded = useMemo(() => {
    if (detailData?.farmList) {
      const farms = detailData.farmList;
      return farms[0].status == 'Ended';
    }
    return false;
  }, [detailData]);
  useEffect(() => {
    get_farms_data();
  }, [all_seeds]);
  useEffect(() => {
    if (isSignedIn) {
      get_list_liquidities();
      get_mft_balance_of();
    }
  }, [isSignedIn, user_data_loading, all_seeds]);
  useEffect(() => {
    if (rate_need_to_reverse_display) {
      setRangeSort(false);
    }
  }, [rate_need_to_reverse_display]);
  const unclaimedRewardsData = useMemo(() => {
    return getTotalUnclaimedRewards();
  }, [user_unclaimed_map[detailData.seed_id]]);
  console.log('99999999999', listLiquidities_inFarimg);
  console.log('listLiquiditiesLoading', listLiquiditiesLoading);
  const [yp_percent, yp_canFarm_value, yp_unFarm_value] = useMemo(() => {
    if (!listLiquiditiesLoading) {
      const { total_value, can_farm_parts_value, un_farm_parts_value } = caculate_values();
      if (total_value.gt(0)) {
        const percent = can_farm_parts_value.div(total_value).mul(100);
        return [formatPercentage(percent.toFixed()),  formatWithCommas_usd(can_farm_parts_value.toFixed()), formatWithCommas_usd(un_farm_parts_value.toFixed())]
      } else {
        return ['0%', '$0', '$0']
      }
    } else {
      return ['0%', '$0', '$0']
    }
  }, [listLiquiditiesLoading, listLiquidities_inFarimg.length, listLiquidities_unFarimg.length])
  function getTotalUnclaimedRewards() {
    let totalPrice = 0;
    let resultTip = '';
    const tempFarms = {};

    detailData.farmList.forEach((farm: FarmBoost) => {
      tempFarms[farm.terms.reward_token] = true;
    });
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
    if (list.length > 0 && !user_data_loading && all_seeds.length > 0) {
      let temp_unavailable_final: UserLiquidityInfo[] = [];
      let temp_free_final: UserLiquidityInfo[] = [];
      let temp_farming_final: UserLiquidityInfo[] = [];
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
      temp_unavailable_final = temp_unavailable;
      temp_free_final = temp_free;
      temp_farming_final = temp_farming;
      const liquidities_minted_in_another_seed = temp_unavailable.filter(
        (liquidity: UserLiquidityInfo) => {
          const { mft_id } = liquidity;
          const { seed_id } = detailData;
          if (mft_id) {
            const [contractId, temp_pool_id] = seed_id.split('@');
            const [fixRange_s, pool_id_s, left_point_s, right_point_s] =
              temp_pool_id.split('&');
            const [fixRange_l, pool_id_l, left_point_l, right_point_l] =
              mft_id.split('&');
            return (
              left_point_s != left_point_l || right_point_s != right_point_l
            );
          }
        }
      );
      if (liquidities_minted_in_another_seed.length > 0) {
        const liquidity_another = liquidities_minted_in_another_seed[0];
        const { mft_id } = liquidity_another;
        const list_new = JSON.parse(JSON.stringify(list));
        const seed_id_another =
          REF_UNI_V3_SWAP_CONTRACT_ID + '@' + mft_id.slice(1);
        const { free_amount = '0', locked_amount = '0' } =
          user_seeds_map[seed_id_another] || {};
        const user_seed_amount_another = new BigNumber(free_amount)
          .plus(locked_amount)
          .toFixed();
        const seed_another = all_seeds.find((seed: Seed) => {
          return seed.seed_id == seed_id_another;
        });
        if (seed_another) {
          const [
            temp_farming_another,
            temp_free_another,
            temp_unavailable_another,
          ] = allocation_rule_liquidities({
            list: list_new,
            user_seed_amount: user_seed_amount_another,
            seed: seed_another,
          });
          const temp_farming_another_map = {};
          temp_farming_another.forEach((liquidity: UserLiquidityInfo) => {
            temp_farming_another_map[liquidity.lpt_id] = liquidity;
          });
          const { min_deposit } = detailData;
          liquidities_minted_in_another_seed.forEach(
            (liquidity: UserLiquidityInfo) => {
              const liquidity_another: UserLiquidityInfo =
                temp_farming_another_map[liquidity.lpt_id];
              const v_liquidity = mint_liquidity(liquidity, detailData.seed_id);
              if (+liquidity_another?.part_farm_ratio > 0) {
                liquidity.status_in_other_seed = 'staked';
              }
              if (new BigNumber(v_liquidity).isLessThan(min_deposit)) {
                liquidity.less_than_min_deposit = true;
              }
            }
          );
        }
        const temp_unavailable_new: UserLiquidityInfo[] = [];
        const frees_extra = temp_unavailable.filter(
          (liquidity: UserLiquidityInfo) => {
            const [left_point, right_point] = get_valid_range(
              liquidity,
              detailData.seed_id
            );
            const inRange = right_point > left_point;
            const { amount, mft_id } = liquidity;
            const amount_is_little = new BigNumber(amount).isLessThan(1000000);
            if (
              !(
                liquidity.status_in_other_seed == 'staked' ||
                liquidity.less_than_min_deposit ||
                !inRange ||
                (!mft_id && amount_is_little)
              )
            )
              return true;
            temp_unavailable_new.push(liquidity);
          }
        );
        temp_free_final = temp_free.concat(frees_extra);
        temp_unavailable_final = temp_unavailable_new;
      }
      const matched_liquidities = temp_farming_final
        .concat(temp_free_final)
        .concat(temp_unavailable_final);
      set_listLiquidities_inFarimg(temp_farming_final);
      set_listLiquidities_unFarimg(temp_free_final);
      set_listLiquidities_unavailable(temp_unavailable_final);
      setListLiquidities(matched_liquidities);
      console.log('temp_farming_final, temp_unavailable_final, temp_free_final', temp_farming_final, temp_unavailable_final, temp_free_final);
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
    const tokens_sort = sort_tokens_by_base(detailData.pool.tokens_meta_data);
    let result = '';
    tokens_sort.forEach((token: TokenMetadata, index: number) => {
      const symbol = toRealSymbol(token.symbol);
      if (index == detailData.pool.tokens_meta_data.length - 1) {
        result += symbol;
      } else {
        result += symbol + '-';
      }
    });
    return result;
  };
  const displayImgs = () => {
    const tokenList: any[] = [];
    const tokens_sort = sort_tokens_by_base(tokens || []);
    tokens_sort.forEach((token: TokenMetadata) => {
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
    const params_str = get_pool_name(poolId);
    openUrl(`/poolV2/${params_str}`);
  };
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
      if (pending) {
        itemHtml = `<div class="flex flex-col items-end my-2">
                      <div class="flex justify-between items-center w-full"><image class="w-5 h-5 rounded-full mr-7" style="filter: grayscale(100%)" src="${
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
                      <image class="w-5 h-5 rounded-full mr-7" src="${
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
    const effectiveFarms = getEffectiveFarmList(farms);
    farms.forEach((farm: FarmBoost) => {
      const { id, icon } = farm.token_meta_data;
      rewardTokenIconMap[id] = icon;
    });
    effectiveFarms.forEach((farm: FarmBoost) => {
      const { id, decimals } = farm.token_meta_data;
      const { daily_reward } = farm.terms;
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
      // .then(() => {
      //   window.location.reload();
      // })
      .catch((error) => {
        setClaimLoading(false);
        // setError(error);
      });
  }
  function rewardRangeTip() {
    const tip = intl.formatMessage({ id: 'reward_range_tip' });
    let result: string = `<div class="text-farmText text-xs text-left">${tip}</div>`;
    return result;
  }
  function switchDetailButton() {
    setShowDetail(!showDetail);
  }
  function getBetterSeedSymbols() {
    let result = '';
    const tokens = sort_tokens_by_base(detailData.pool.tokens_meta_data);
    tokens.forEach((token: TokenMetadata, index: number) => {
      const symbol = toRealSymbol(token.symbol);
      if (index == detailData.pool.tokens_meta_data.length - 1) {
        result += symbol;
      } else {
        result += symbol + '-';
      }
    });
    return result;
  }
  function goBetterSeed() {
    const [contractId, temp_pool_id] = betterSeed.seed_id.split('@');
    const [fixRange, pool_id, left_point, right_point] =
      temp_pool_id.split('&');
    const mft_id = `${get_pool_name(pool_id)}[${left_point}-${right_point}]`;
    openUrl(`/v2farms/${mft_id}-r`);
  }
  function getFee() {
    const [tokenx, tokeny, fee] = detailData?.pool?.pool_id?.split('|') || '';
    return +fee / 10000 + '%';
  }
  function get_liquidity_value(liquidity: UserLiquidityInfo, leftPoint?:number, rightPoint?:number) {
    const { amount } = liquidity;
    const poolDetail = detailData.pool;
    const { token_x, token_y } = poolDetail;
    const v = get_total_value_by_liquidity_amount_dcl({
      left_point:leftPoint || liquidity.left_point,
      right_point:rightPoint || liquidity.right_point,
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
  const radio = getBoostMutil();
  /** new start */
  function caculate_values() {
    const can_farm_liquidities = listLiquidities_inFarimg.concat(listLiquidities_unFarimg);
    // 可以farm的所有流动性的总价值
    let total_value = Big(0);
    can_farm_liquidities.forEach((l:UserLiquidityInfo) => {
      const l_v = get_liquidity_value(l);
      total_value = total_value.plus(l_v || 0);
    })
    // 能farm部分的的流动性的总价值
    let can_farm_parts_value = Big(0);
    can_farm_liquidities.forEach((l:UserLiquidityInfo) => {
      const [left_point, right_point] = get_valid_range(l,detailData.seed_id);
      const l_v = get_liquidity_value(l, left_point, right_point);
      can_farm_parts_value = can_farm_parts_value.plus(l_v || 0);
    })
    // unFarming 部分流动性的总价值（包含部分在farm中的那个NFT剩余的部分）
    let un_farm_parts_value = Big(0);
    listLiquidities_unFarimg.forEach((l:UserLiquidityInfo) => {
        const l_v = get_liquidity_value(l);
        un_farm_parts_value = un_farm_parts_value.plus(l_v || 0);
    })
    const [ part_farm_liquidity ] = listLiquidities_inFarimg.filter((l:UserLiquidityInfo) => {
      return Big(l.part_farm_ratio || 0).gt(0);
    })
    if (part_farm_liquidity) {
      const [left_point, right_point] = get_valid_range(part_farm_liquidity,detailData.seed_id);
      const v = get_liquidity_value(part_farm_liquidity, left_point, right_point);
      const un_farm_part_value = Big(100).minus(part_farm_liquidity.part_farm_ratio).div(100).mul(v)
      un_farm_parts_value = un_farm_parts_value.plus(un_farm_part_value);
    }
    return {
      total_value,
      can_farm_parts_value,
      un_farm_parts_value,
    }
  }
  /** new end */
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
          <label className="mx-2 text-sm cursor-pointer">
            <FormattedMessage id="dcl_pool_detail" />
          </label>
          <LinkArrowIcon className="cursor-pointer"></LinkArrowIcon>
        </div>
      </div>
      <div
        className={`flex justify-between items-center mt-7 flex-wrap ${
          isEnded ? 'farmEnded' : ''
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
              <div className="flex items-center bg-dclIconBgColor rounded-md xsm:ml-2 px-1 py-0.5">
                <DclFarmIcon></DclFarmIcon>
                <label className="text-xs text-white ml-1 dclIcon">DCL</label>
              </div>
              {isEnded ? (
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
          <label className="mx-2 text-sm cursor-pointer">
            <FormattedMessage id="dcl_pool_detail" />
          </label>
          <LinkArrowIcon className="cursor-pointer"></LinkArrowIcon>
        </div>
      </div>
      {/* new Farm is coming Banner */}
      {betterSeed ? (
        <div className="flex items-center justify-center bg-dclBannerColor rounded-xl text-sm text-white px-4 py-1 mt-4 mb-3">
          <div className="flex items-center flex-wrap">
            <span>
              {isEnded ? (
                <FormattedMessage id="farm_ended_tip" />
              ) : (
                <FormattedMessage id="farm_will_ended_tip" />
              )}
            </span>
            <a
              onClick={goBetterSeed}
              className="underline gotham_bold cursor-pointer mx-2 xsm:ml-0"
            >
              {getBetterSeedSymbols()} <FormattedMessage id="new_farm" />
            </a>
            <span>
              <FormattedMessage id="is_coming" />!
            </span>
          </div>
          <NewTag className="ml-1.5"></NewTag>
        </div>
      ) : null}
      {/* baseData for PC*/}
      <div className="flex items-stretch justify-between mt-4 xsm:hidden">
        <div className="flex justify-between bg-cardBg rounded-2xl px-3.5 py-4 flex-grow w-1 mr-3.5">
          <div className="flex flex-col items-start justify-between text-sm text-farmText border-r border-v3BlueBorderColor pr-10">
            <div className="flex items-center">
              <FormattedMessage id="apr"></FormattedMessage>
              <CalcIcon
                onClick={(e: any) => {
                  e.stopPropagation();
                  setSeedDclCalcVisible(true);
                }}
                className="text-farmText ml-1.5 cursor-pointer hover:text-greenColor"
              />
            </div>
            <div
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
              <span>
                <FormattedMessage id="reward_range" />
              </span>
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
            <div className="flex items-center text-sm text-farmText">
              <FormattedMessage id="apr"></FormattedMessage>
              <CalcIcon
                onClick={(e: any) => {
                  e.stopPropagation();
                  setSeedDclCalcVisible(true);
                }}
                className="text-farmText ml-1.5 cursor-pointer hover:text-greenColor"
              />
            </div>
            <span className="text-base text-white">{get_total_apr()}</span>
          </div>
        </div>
        <div className="border-b border-dclLineColor py-3">
          <div className="relative flex items-start justify-end">
            <div className="flex items-center absolute left-0">
              <span className="text-sm text-farmText">
                <FormattedMessage id="reward_range" />
              </span>
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
      {/* Your Farming Position */}
      <div className='bg-cardBg rounded-2xl p-4 mt-4'>
        <div className='border-b border-dclLineColor pt-1 pb-4 mb-4'>
          <div className='flex items-center justify-between'>
              <span className='text-sm text-primaryText'>Your Farming Position</span>
              <span className='text-white text-xl'>{yp_canFarm_value}</span>
          </div>
          <div className='flex items-center justify-end text-primaryText mt-2'>{yp_percent} of your total liquidity</div>
        </div>
        <div className='flex items-center justify-between'>
          <div className='text-sm text-primaryText'><span className='text-white'>{yp_unFarm_value}</span> available to stake</div>
          <div className='flex items-center'>
            <GradientButton 
              color="#fff" 
              disabled={nft_stake_loading}
              btnClassName={nft_stake_loading ? 'cursor-not-allowed': ''} 
              minWidth="6rem"
              className={`h-8 px-4 text-center text-sm text-white focus:outline-none ${nft_stake_loading? 'opacity-40': ''
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
                color="#fff"
                minWidth="6rem"
                disabled={nft_unStake_loading ? true : false}
                className={`flex items-center justify-center h-8 px-4 ml-2 text-center text-sm text-white focus:outline-none font-semibold bg-bgGreyDefault hover:bg-bgGreyHover ${
                  nft_unStake_loading ? 'opacity-40' : ''
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
        </div>
      </div>
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
            <span className="text-base text-white">
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
      <div
        className={`bg-dclFarmBlueColor rounded-xl p-4 mt-4 lg:hidden ${
          user_seeds_map[detailData.seed_id] ? '' : 'hidden'
        }`}
      >
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
            <span className="text-base text-white gotham_bold">
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
      {/* caculator */}
      {seedDclCalcVisible ? (
        <CalcModelDcl
          isOpen={seedDclCalcVisible}
          onRequestClose={(e) => {
            e.stopPropagation();
            setSeedDclCalcVisible(false);
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
        />
      ) : null}
    </div>
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