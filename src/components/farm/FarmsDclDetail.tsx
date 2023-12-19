import React, {
  useEffect,
  useState,
  useContext,
  useMemo,
  createContext,
} from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  ArrowLeftIcon,
  UpArrowIcon,
  BoostRightArrowIcon,
  BoostOptIcon,
  DclFarmIcon,
  LinkArrowIcon,
  NewTag,
  CalcIcon,
} from 'src/components/icon/FarmBoost';
import { RefreshIcon } from 'src/components/icon/swapV3';
import { useHistory } from 'react-router-dom';
import getConfig from '../../services/config';
import {
  FarmBoost,
  Seed,
  claimRewardBySeed_boost,
  BoostConfig,
  batch_stake_boost_nft,
  batch_unStake_boost_nft,
  IStakeInfo,
  UserSeedInfo,
} from 'src/services/farm';
import { WalletContext } from '../../utils/wallets-integration';
import {
  toPrecision,
  toReadableNumber,
  toInternationalCurrencySystem,
  formatWithCommas,
} from '../../utils/numbers';
import BigNumber from 'bignumber.js';
import {
  GradientButton,
  ButtonTextWrapper,
  OprationButton,
  ConnectToNearBtn,
} from 'src/components/button/Button';
import { toRealSymbol } from 'src/utils/token';

import QuestionMark from 'src/components/farm/QuestionMark';
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
  getEffectiveFarmList,
  sort_tokens_by_base,
  get_pool_name,
  openUrl,
} from 'src/services/commonV3';
import { list_liquidities, dcl_mft_balance_of } from '../../services/swapV3';
import { TokenMetadata } from 'src/services/ft-contract';
import CalcModelDcl from '../../components/farm/CalcModelDcl';
import { formatWithCommas_usd, formatPercentage } from './utils';
import moment from 'moment';
import Big from 'big.js';
import {
  constTransactionPage,
  useTranstionsExcuteDataStore,
} from '../../stores/transtionsExcuteData';
import CustomTooltip from '../customTooltip/customTooltip';
const { REF_VE_CONTRACT_ID, REF_UNI_V3_SWAP_CONTRACT_ID } = getConfig();
export default function FarmsDclDetail(props: {
  detailData: Seed;
  emptyDetailData: () => void;
  tokenPriceList: any;
  loveSeed: Seed;
  boostConfig: BoostConfig;
  user_data: Record<string, any>;
  user_data_loading: () => void;
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
  const [yp_percent, yp_farming_value, yp_unFarm_value] = useMemo(() => {
    if (!listLiquiditiesLoading) {
      const { farming_parts_value, can_farm_parts_value, un_farm_parts_value } =
        caculate_values();
      if (can_farm_parts_value.gt(0)) {
        const percent = farming_parts_value.div(can_farm_parts_value).mul(100);
        return [
          formatPercentage(percent.toFixed()),
          formatWithCommas_usd(farming_parts_value.toFixed()),
          formatWithCommas_usd(un_farm_parts_value.toFixed()),
        ];
      } else {
        return ['0%', '$0', '$0'];
      }
    } else {
      return ['0%', '$0', '$0'];
    }
  }, [
    listLiquiditiesLoading,
    listLiquidities_inFarimg.length,
    listLiquidities_unFarimg.length,
  ]);
  const transtionsExcuteDataStore = useTranstionsExcuteDataStore();

  const processTransactionPending = useTranstionsExcuteDataStore(
    (state) => state.processTransactionPending
  );
  const processTransactionSuccess = useTranstionsExcuteDataStore(
    (state) => state.processTransactionSuccess
  );
  const processTransactionError = useTranstionsExcuteDataStore(
    (state) => state.processTransactionError
  );

  const canStake = useMemo(() => {
    if (!listLiquiditiesLoading) {
      const { canStake } = get_stake_info();
      return canStake;
    }
    return false;
  }, [
    listLiquiditiesLoading,
    listLiquidities_inFarimg.length,
    listLiquidities_unFarimg.length,
  ]);
  const canUnStake = useMemo(() => {
    if (!listLiquiditiesLoading) {
      return listLiquidities_inFarimg.length;
    }
  }, [listLiquiditiesLoading, listLiquidities_inFarimg.length]);

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
        const another_seeds = get_another_seeds(
          liquidities_minted_in_another_seed
        );
        Object.values(another_seeds).forEach((another_seed_detail: any) => {
          const list_new = JSON.parse(JSON.stringify(list));
          const [seed_another, user_seed_amount_another] = another_seed_detail;
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
          // const { min_deposit } = detailData;
          liquidities_minted_in_another_seed.forEach(
            (liquidity: UserLiquidityInfo) => {
              const liquidity_another: UserLiquidityInfo =
                temp_farming_another_map[liquidity.lpt_id];
              // const v_liquidity = mint_liquidity(liquidity, detailData.seed_id);
              if (+liquidity_another?.part_farm_ratio > 0) {
                liquidity.status_in_other_seed = 'staked';
              }
              // if (new BigNumber(v_liquidity).isLessThan(min_deposit)) {
              //   liquidity.less_than_min_deposit = true;
              // }
            }
          );
        });
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
                // liquidity.less_than_min_deposit ||
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
    }
    if (!user_data_loading) {
      setListLiquiditiesLoading(false);
    }
  }
  function get_another_seeds(minted_liquidities: UserLiquidityInfo[]) {
    const target: any = {};
    minted_liquidities.forEach((liquidity_minted_in_another_seed) => {
      const { mft_id } = liquidity_minted_in_another_seed;
      const seed_id_another =
        REF_UNI_V3_SWAP_CONTRACT_ID + '@' + mft_id.slice(1);
      const { free_amount = '0', locked_amount = '0' } =
        user_seeds_map[seed_id_another] || {};
      const user_seed_amount_another = new BigNumber(free_amount)
        .plus(locked_amount)
        .toFixed();
      const seed_another: Seed = all_seeds.find((seed: Seed) => {
        return seed.seed_id == seed_id_another;
      });
      if (seed_another) {
        target[seed_another.seed_id] = [seed_another, user_seed_amount_another];
      }
    });
    return target;
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
            data-tooltip-id="boostFarmTipId"
            data-place="top"
            data-tooltip-html={result}
          >
            <div className="flex items-center justify-center">
              <BoostOptIcon className="mr-0.5"></BoostOptIcon>
              <FormattedMessage id="boost"></FormattedMessage>
            </div>
            <CustomTooltip id="boostFarmTipId" />
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
          data-tooltip-id={'rewardPerWeekId' + detailData?.farmList[0]?.farm_id}
          data-place="top"
          data-tooltip-html={getRewardsPerWeekTip()}
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
          <CustomTooltip
            id={'rewardPerWeekId' + detailData?.farmList[0]?.farm_id}
          />
        </div>
        <div
          className="text-white text-right"
          data-class="reactTip"
          data-tooltip-id={
            'rewardPerWeekId1' + detailData?.farmList[0]?.farm_id
          }
          data-place="top"
          data-tooltip-html={getRewardsPerWeekTip()}
        >
          <span>{totalPriceDisplay}</span>
          <CustomTooltip
            id={'rewardPerWeekId1' + detailData?.farmList[0]?.farm_id}
          />
        </div>
      </>
    );
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
  function get_liquidity_value(
    liquidity: UserLiquidityInfo,
    leftPoint?: number,
    rightPoint?: number
  ) {
    const { amount } = liquidity;
    const poolDetail = detailData.pool;
    const { token_x, token_y } = poolDetail;
    const v = get_total_value_by_liquidity_amount_dcl({
      left_point: leftPoint || liquidity.left_point,
      right_point: rightPoint || liquidity.right_point,
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
    const can_farm_liquidities = listLiquidities_inFarimg.concat(
      listLiquidities_unFarimg
    );
    // 能farm部分的的流动性的总价值
    let can_farm_parts_value = Big(0);
    can_farm_liquidities.forEach((l: UserLiquidityInfo) => {
      const l_v = get_range_part_value(l);
      can_farm_parts_value = can_farm_parts_value.plus(l_v || 0);
    });

    // unFarming 部分流动性的总价值（包含部分在farm中的那个NFT剩余的部分）
    let un_farm_parts_value = Big(0);
    listLiquidities_unFarimg.forEach((l: UserLiquidityInfo) => {
      const l_v = get_range_part_value(l);
      un_farm_parts_value = un_farm_parts_value.plus(l_v || 0);
    });
    const [part_farm_liquidity] = listLiquidities_inFarimg.filter(
      (l: UserLiquidityInfo) => {
        return Big(l.unfarm_part_amount || 0).gt(0);
      }
    );
    if (part_farm_liquidity) {
      const v = get_range_part_value(part_farm_liquidity);
      const un_farm_part_value = Big(100)
        .minus(part_farm_liquidity.part_farm_ratio)
        .div(100)
        .mul(v);
      un_farm_parts_value = un_farm_parts_value.plus(un_farm_part_value);
    }

    // farming 部分流动性的总价值
    const farming_parts_value = can_farm_parts_value.minus(un_farm_parts_value);
    return {
      can_farm_parts_value,
      un_farm_parts_value,
      farming_parts_value,
    };
  }
  function get_range_part_value(liquidity: UserLiquidityInfo) {
    const [left_point, right_point] = get_valid_range(
      liquidity,
      detailData.seed_id
    );
    const v = get_liquidity_value(liquidity, left_point, right_point);
    return v;
  }
  function batchStakeNFT() {
    set_nft_stake_loading(true);
    const { liquidities, total_v_liquidity, withdraw_amount } =
      get_stake_info();

    const transactionId = String(Date.now());
    const tokensName = tokens?.map((d) => d.symbol);

    processTransactionPending({
      transactionId,
      page: constTransactionPage.farm,
      data: {
        prefix: 'Stake',
        tokenGroup: tokens,
        suffix: ` ${tokensName} tokens (${yp_unFarm_value})`,
      },
    });
    batch_stake_boost_nft({
      liquidities,
      total_v_liquidity,
      withdraw_amount,
      seed_id: detailData.seed_id,
    })
      .then(({ response }) => {
        processTransactionSuccess({
          transactionResponse: response,
          transactionId,
        });
        set_nft_stake_loading(false);
      })
      .catch((e) => {
        processTransactionError({
          error: e,
          transactionId,
        });
        set_nft_stake_loading(false);
      });
  }

  function batchUnStakeNFT() {
    set_nft_unStake_loading(true);
    const unStake_info: IStakeInfo = get_unStake_info();
    const tokensName = tokens?.map((d) => d.symbol);
    const transactionId = String(Date.now());
    processTransactionPending({
      page: constTransactionPage.farm,
      data: {
        prefix: 'Unstake',
        tokenGroup: tokens,
        suffix: ` ${tokensName} tokens (${yp_farming_value})`,
      },
      transactionId,
    });
    // transtionsExcuteDataStore.setActionData({
    //   status: 'pending',
    //   transactionId: String(Date.now()),
    //   page: constTransactionPage.xref,
    //   data: {
    //     prefix: 'Unstake',
    //     tokenGroup: tokens,
    //     suffix: ` ${tokensName} tokens (${yp_farming_value})`,
    //   },
    // });
    batch_unStake_boost_nft(unStake_info)
      .then(({ response }) => {
        processTransactionSuccess({
          transactionResponse: response,
          transactionId,
        });
        set_nft_unStake_loading(false);
      })
      .catch((e) => {
        processTransactionError({
          error: e,
          transactionId,
        });
        set_nft_unStake_loading(false);
      });
  }

  function get_stake_info(): IStakeInfo {
    const { seed_id, min_deposit } = detailData;
    let total_v_liquidity = Big(0);
    let withdraw_amount = Big(0);
    const liquidities: UserLiquidityInfo[] = listLiquidities_unFarimg.concat(
      []
    );
    listLiquidities_unFarimg.forEach((l: UserLiquidityInfo) => {
      const v_liquidity = mint_liquidity(l, seed_id);
      total_v_liquidity = total_v_liquidity.plus(v_liquidity);
    });

    const [part_farm_liquidity] = listLiquidities_inFarimg.filter(
      (l: UserLiquidityInfo) => {
        return Big(l.unfarm_part_amount || 0).gt(0);
      }
    );
    if (part_farm_liquidity) {
      total_v_liquidity = total_v_liquidity.plus(
        part_farm_liquidity.unfarm_part_amount
      );
      liquidities.push(part_farm_liquidity);
    }
    if (total_v_liquidity.lt(min_deposit)) {
      if (part_farm_liquidity) {
        const v_liquidity = mint_liquidity(part_farm_liquidity, seed_id);
        withdraw_amount = new Big(v_liquidity).minus(
          part_farm_liquidity.unfarm_part_amount
        );
        total_v_liquidity = total_v_liquidity.plus(withdraw_amount);
      }
    }
    return {
      liquidities,
      total_v_liquidity: total_v_liquidity.toFixed(),
      withdraw_amount: withdraw_amount.toFixed(),
      canStake: total_v_liquidity.lt(min_deposit) || isEnded ? false : true,
    };
  }
  function get_unStake_info() {
    const { free_amount = '0', locked_amount = '0' } =
      user_seeds_map[detailData.seed_id] || {};
    const user_seed_amount = new BigNumber(free_amount)
      .plus(locked_amount)
      .toFixed();
    return {
      liquidities: listLiquidities_inFarimg,
      withdraw_amount: user_seed_amount,
      seed_id: detailData.seed_id,
    };
  }
  // get unavailable text
  function get_unavailable_text() {
    let tip = '';
    const { seed_id, min_deposit } = detailData;
    const { total_v_liquidity } = get_stake_info();
    for (let i = 0; i < listLiquidities_unavailable.length; i++) {
      const liquidity = listLiquidities_unavailable[i];
      const [left_point, right_point] = get_valid_range(liquidity, seed_id);
      const inrange = +right_point > +left_point;
      if (!inrange) {
        tip = intl.formatMessage({ id: 'your_price_range_tip' });
        break;
      } else if (liquidity.status_in_other_seed == 'staked') {
        tip = intl.formatMessage({ id: 'position_has_staked_tip' });
      }
    }

    if (listLiquidities_unavailable.length && !tip) {
      // too little to mint
      tip = 'The Liquidity amount is too little to mint';
    }
    if (!tip && Big(total_v_liquidity).gt(0)) {
      // min deposit
      const rate = new BigNumber(min_deposit).dividedBy(total_v_liquidity);
      let rate_display = rate.toFixed(1);
      if (rate.isGreaterThan(rate_display)) {
        rate_display = new BigNumber(rate_display).plus(0.1).toFixed();
      }
      // your liquidity
      tip =
        intl.formatMessage({ id: 'minimum_tip' }) +
        ' ' +
        `${rate_display}x` +
        ' ' +
        intl.formatMessage({ id: 'your_liquidity_3' });
    }
    return tip;
  }
  /** new end */
  const isEmpty = !canStake && !canUnStake;
  const stakeDisabled = !canStake || nft_stake_loading;

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
            <FormattedMessage id="Pool" />
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
            <FormattedMessage id="Pool" />
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
              data-tooltip-html={getAprTip()}
              data-tooltip-id={
                'aprId' + detailData.farmList[0].farm_id + 'your'
              }
              data-class="reactTip"
            >
              <span>{get_total_apr()}</span>
              <CustomTooltip
                id={'aprId' + detailData.farmList[0].farm_id + 'your'}
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
                data-tooltip-id="rewardRangeTipId"
                data-place="top"
                data-tooltip-html={rewardRangeTip()}
              >
                <QuestionMark></QuestionMark>
                <CustomTooltip id="rewardRangeTipId" />
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
              data-tooltip-id={'rewardPerWeekQId'}
              data-place="top"
              data-tooltip-html={valueOfRewardsTip()}
            >
              <QuestionMark></QuestionMark>
              <CustomTooltip id={'rewardPerWeekQId'} />
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
                data-tooltip-id="rewardRangeTipId2"
                data-place="top"
                data-tooltip-html={rewardRangeTip()}
              >
                <QuestionMark></QuestionMark>
                <CustomTooltip id="rewardRangeTipId2" />
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
              data-tooltip-id={'rewardPerWeekQId2'}
              data-place="top"
              data-tooltip-html={valueOfRewardsTip()}
            >
              <QuestionMark></QuestionMark>
              <CustomTooltip id={'rewardPerWeekQId2'} />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            {totalTvlPerWeekDisplay()}
          </div>
        </div>
      </div>
      {/* login area */}
      <AddLoginEntryBar></AddLoginEntryBar>
      {/* add liquidity entry bar */}
      <AddLiquidityEntryBar
        detailData={detailData}
        isEnded={isEnded}
        loading={listLiquiditiesLoading}
        inFarimg={listLiquidities_inFarimg}
        unFarimg={listLiquidities_unFarimg}
        unavailable={listLiquidities_unavailable}
      ></AddLiquidityEntryBar>
      <div
        className={`mt-4 ${
          !isSignedIn ||
          listLiquiditiesLoading ||
          (!listLiquiditiesLoading &&
            listLiquidities_inFarimg.length == 0 &&
            listLiquidities_unFarimg.length == 0)
            ? 'hidden'
            : ''
        }`}
      >
        {/* Your Farming Position */}
        <div
          className={`bg-cardBg rounded-2xl p-4 ${
            isEmpty && isEnded ? 'hidden' : ''
          }`}
        >
          <div className="border-b border-dclLineColor pt-1 pb-4 mb-4">
            <div className="flex items-center justify-between">
              <span className={'text-sm text-primaryText'}>
                Your Farming Position
              </span>
              <span
                className={`text-xl ${
                  isEmpty ? 'text-primaryText' : 'text-white'
                }`}
              >
                {yp_farming_value}
              </span>
            </div>
          </div>
          <div className="flex xsm:flex-col items-center justify-between">
            <div className="flex flex-col xsm:items-center">
              <div className="text-sm text-primaryText">
                <span
                  className={`text-white ${
                    isEmpty ? 'text-primaryText' : 'text-white'
                  }`}
                >
                  {yp_unFarm_value}
                </span>{' '}
                available to stake
              </div>
            </div>
            <div className="flex items-center xsm:w-full xsm:mt-6">
              {!isEnded && (
                <GradientButton
                  color="#fff"
                  disabled={stakeDisabled}
                  btnClassName={stakeDisabled ? 'cursor-not-allowed' : ''}
                  minWidth="6rem"
                  onClick={batchStakeNFT}
                  className={`h-8 px-4 text-center text-sm text-white focus:outline-none xsm:flex-grow ${
                    stakeDisabled ? 'opacity-40' : ''
                  }`}
                >
                  <ButtonTextWrapper
                    loading={nft_stake_loading}
                    Text={() => (
                      <FormattedMessage id="stake" defaultMessage="Stake" />
                    )}
                  />
                </GradientButton>
              )}

              {canUnStake ? (
                <OprationButton
                  color="#fff"
                  minWidth="6rem"
                  disabled={nft_unStake_loading ? true : false}
                  onClick={batchUnStakeNFT}
                  className={`batchUnStakeNFT flex items-center xsm:flex-grow justify-center h-8 px-4 ml-2 text-center text-sm text-white focus:outline-none font-semibold bg-bgGreyDefault hover:bg-bgGreyHover ${
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
              ) : null}
            </div>
          </div>
        </div>
        {/* unClaimed Rewards*/}
        <UserTotalUnClaimBlock
          detailData={detailData}
          tokenPriceList={tokenPriceList}
          user_seeds_map={user_seeds_map}
          user_unclaimed_token_meta_map={user_unclaimed_token_meta_map}
          user_unclaimed_map={user_unclaimed_map}
        ></UserTotalUnClaimBlock>
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
function AddLiquidityEntryBar(props: {
  loading: boolean;
  inFarimg: UserLiquidityInfo[];
  unFarimg: UserLiquidityInfo[];
  unavailable: UserLiquidityInfo[];
  detailData: Seed;
  isEnded: boolean;
}) {
  let tip: any;
  const { loading, inFarimg, unFarimg, unavailable, detailData, isEnded } =
    props;
  if (!loading && inFarimg.length == 0 && unFarimg.length == 0) {
    // if (unavailable.length == 0) {
    //   tip = <FormattedMessage id="add_lp_tokens_tip" />;
    // } else {
    //   tip =
    //     'The price range of your liquidity is out of reward range. Please add liquidity within reward range.';
    // }
    tip =
      "You don't have liquidity during the farm reward range, click 'Add Liquidity' to start farming.";
  }
  if (loading || !tip || isEnded) return null;
  return (
    <div
      className="rounded-lg overflow-hidden mt-8"
      style={{ backgroundColor: 'rgba(29, 41, 50, 0.5)' }}
    >
      <div className="w-full bg-gradientFrom h-1.5"></div>
      <div className="flex items-center justify-center pt-5 pb-3 px-3 xs:flex-col md:flex-col">
        <p className="text-sm text-white xs:mb-3 md:mb-3">{tip}</p>
        <GradientButton
          onClick={() => {
            const poolId = detailData.pool.pool_id;
            const params_str = get_pool_name(poolId);
            openUrl(`/addLiquidityV2#${params_str}`);
          }}
          color="#fff"
          minWidth="9rem"
          className={`flex-shrink-0 px-1 h-8 lg:ml-5 text-center text-sm text-white focus:outline-none font-semibold xsm:w-full `}
        >
          <FormattedMessage id="add_liquidity" defaultMessage="Add Liquidity" />
        </GradientButton>
      </div>
    </div>
  );
}
function UserTotalUnClaimBlock(props: {
  detailData: Seed;
  tokenPriceList: any;
  user_seeds_map: Record<string, UserSeedInfo>;
  user_unclaimed_token_meta_map: Record<string, any>;
  user_unclaimed_map: Record<string, any>;
  radio?: string | number;
}) {
  const {
    detailData,
    tokenPriceList,
    user_seeds_map,
    user_unclaimed_token_meta_map,
    user_unclaimed_map,
    radio,
  } = props;
  const [claimLoading, setClaimLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const { seed_id } = detailData;
  const { globalState } = useContext(WalletContext);
  const transtionsExcuteDataStore = useTranstionsExcuteDataStore();
  const isSignedIn = globalState.isSignedIn;
  const intl = useIntl();

  function claimReward() {
    if (claimLoading) return;
    setClaimLoading(true);
    const tokensNode = unclaimedRewardsData.list.map(
      ({ token, amount, preAmount }, i) => ({
        token: token,
        amount: preAmount || amount,
      })
    );

    transtionsExcuteDataStore.setActionData({
      status: 'pending',
      transactionId: String(Date.now()),
      page: constTransactionPage.farm,
      data: {
        transactionType: 'claimFee',
        tokens: tokensNode,
      },
    });
    claimRewardBySeed_boost(detailData.seed_id)
      .then(({ response }) => {
        transtionsExcuteDataStore.setActionData({
          status: 'success',
          transactionResponse: response,
          data: {
            transactionType: 'claimFee',
          },
        });
        transtionsExcuteDataStore.setActionStatus('resolved');
        setClaimLoading(false);
      })
      .catch((e) => {
        transtionsExcuteDataStore.setActionData({
          status: 'error',
          transactionError: {
            message: e.message,
            transactionId: e.transactionId,
          },
        });
        transtionsExcuteDataStore.setActionStatus('rejected');
        setClaimLoading(false);
      });
  }
  function getTotalUnclaimedRewards() {
    let totalPrice = 0;
    let resultTip = '';
    const tempFarms = {};

    detailData.farmList.forEach((farm: FarmBoost) => {
      tempFarms[farm.terms.reward_token] = true;
    });
    const isEnded = detailData.farmList[0].status == 'Ended';
    const unclaimed = user_unclaimed_map[seed_id] || {};
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
      if (radio) {
        const v = new BigNumber(amount).dividedBy(radio);
        if (new BigNumber('0').isEqualTo(v)) {
          beforeNum = '-';
        } else if (new BigNumber('0.001').isGreaterThan(v)) {
          beforeNum = '<0.001';
        } else {
          beforeNum = new BigNumber(v).toFixed(3, 1);
        }
      }
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
  const unclaimedRewardsData = useMemo(() => {
    return getTotalUnclaimedRewards();
  }, [user_unclaimed_map[seed_id]]);
  function switchDetailButton() {
    setShowDetail(!showDetail);
  }
  function valueOfRewardsTip() {
    const tip = intl.formatMessage({ id: 'farmRewardsCopy' });
    let result: string = `<div class="text-navHighLightText text-xs w-52 text-left">${tip}</div>`;
    return result;
  }
  return (
    <div
      className="bg-cardBg rounded-2xl p-5"
      style={{ backgroundColor: 'rgba(29, 41, 50, 0.5)' }}
    >
      <div className="flex items-center justify-between text-sm text-primaryText">
        <div className="flex items-center">
          <FormattedMessage id="unclaimed_rewards"></FormattedMessage>
          <div
            className="text-white text-right ml-1"
            data-class="reactTip"
            data-tooltip-id={'unclaimedRewardQIdx'}
            data-place="top"
            data-tooltip-html={valueOfRewardsTip()}
          >
            <QuestionMark></QuestionMark>
            <CustomTooltip id={'unclaimedRewardQIdx'} />
          </div>
        </div>

        <div
          className="text-white text-right"
          data-class="reactTip"
          data-tooltip-id={'unclaimedRewardId' + detailData.seed_id}
          data-place="top"
          data-tooltip-html={unclaimedRewardsData.tip}
        >
          <span className="text-xl text-white">
            {unclaimedRewardsData.worth}
          </span>
          <CustomTooltip id={'unclaimedRewardId' + detailData.seed_id} />
        </div>
      </div>
      {unclaimedRewardsData.showClaimButton ? (
        <div className="flex justify-between items-center mt-4">
          <div
            onClick={switchDetailButton}
            className={`flex items-center text-xs bg-lightBGreyColor bg-opacity-20 rounded-full px-4 py-0.5 cursor-pointer ${
              showDetail ? 'text-greenColor' : 'text-farmText'
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
            id={'btn-dcl-claim'}
            className="flex items-center justify-center bg-deepBlue hover:bg-deepBlueHover rounded-lg text-sm text-white h-8 w-20 cursor-pointer"
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
        className={`grid grid-cols-2 xs:grid-cols-1 md:grid-cols-1 gap-y-4 mt-4 pt-4 border-t border-borderGreyColor border-opacity-20 ${
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
                      <span className="text-sm text-primaryText">
                        {preAmount}
                      </span>
                      <span className="mx-3.5">
                        <BoostRightArrowIcon></BoostRightArrowIcon>
                      </span>
                      <span className={`text-sm text-white`}>{amount}</span>
                    </>
                  ) : (
                    <span className={`text-sm text-primaryText`}>{amount}</span>
                  )}
                </div>
              </div>
            );
          }
        )}
      </div>
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
