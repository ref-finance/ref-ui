import React, { useEffect, useRef, useState, useContext, useMemo } from 'react';
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
} from '~components/icon/FarmBoost';
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
} from '~services/farm';
import { WalletContext } from '../../utils/wallets-integration';
import {
  toPrecision,
  toReadableNumber,
  toNonDivisibleNumber,
  toInternationalCurrencySystem,
  percent,
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
import moment from 'moment';
const ONLY_ZEROS = /^0*\.?0*$/;
const {
  STABLE_POOL_IDS,
  FARM_LOCK_SWITCH,
  REF_VE_CONTRACT_ID,
  FARM_BLACK_LIST_V2,
} = getConfig();
export default function FarmsDetail(props: {
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
  const {
    user_seeds_map = {},
    user_unclaimed_map = {},
    user_unclaimed_token_meta_map = {},
  } = user_data;
  const history = useHistory();
  const intl = useIntl();
  const pool = detailData.pool;
  const { token_account_ids } = pool;
  const tokens = useTokens(token_account_ids) || [];
  const goBacktoFarms = () => {
    history.replace('/v2farms');
    emptyDetailData();
  };
  const displaySymbols = () => {
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
    const poolId = pool.id;
    window.open(`/pool/${poolId}`);
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
  const radio = getBoostMutil();
  const needForbidden =
    (FARM_BLACK_LIST_V2 || []).indexOf(pool.id.toString()) > -1;
  return (
    <div className={`m-auto lg:w-580px md:w-5/6 xs:w-11/12  xs:-mt-4 md:-mt-4`}>
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
            <FormattedMessage id="get_lp_token"></FormattedMessage>
          </label>
          <LinkIcon></LinkIcon>
        </div>
      </div>
      <StakeContainer
        detailData={detailData}
        tokenPriceList={tokenPriceList}
        loveSeed={loveSeed}
        boostConfig={boostConfig}
        user_seeds_map={user_seeds_map}
        user_unclaimed_map={user_unclaimed_map}
        user_unclaimed_token_meta_map={user_unclaimed_token_meta_map}
        user_data_loading={user_data_loading}
        radio={radio}
        dayVolumeMap={dayVolumeMap}
      ></StakeContainer>
    </div>
  );
}
function StakeContainer(props: {
  detailData: Seed;
  tokenPriceList: any;
  loveSeed: Seed;
  boostConfig: BoostConfig;
  user_seeds_map: Record<string, UserSeedInfo>;
  user_unclaimed_token_meta_map: Record<string, any>;
  user_unclaimed_map: Record<string, any>;
  radio: string | number;
  user_data_loading: Boolean;
  dayVolumeMap: Record<string, string>;
}) {
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const [lpBalance, setLpBalance] = useState('');
  const [showAddLiquidityEntry, setShowAddLiquidityEntry] = useState(false);
  const [calcVisible, setCalcVisible] = useState(false);
  const [dayVolume, setDayVolume] = useState('');
  const [maxLoveShareAmount, setMaxLoveShareAmount] = useState<string>('0');
  const [yourApr, setYourApr] = useState('');
  const [yourActualAprRate, setYourActualAprRate] = useState('1');
  const {
    detailData,
    tokenPriceList,
    loveSeed,
    boostConfig,
    user_seeds_map,
    user_unclaimed_map,
    user_unclaimed_token_meta_map,
    radio,
    user_data_loading,
    dayVolumeMap,
  } = props;
  const pool = detailData.pool;
  const intl = useIntl();
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
  useEffect(() => {
    getPoolFee();
    get_ve_seed_share();
  }, []);
  async function get_ve_seed_share() {
    const result = await getVeSeedShare();
    const maxShareObj = result?.accounts?.accounts[0] || {};
    const amount = maxShareObj?.amount;
    if (amount) {
      const amountStr = new BigNumber(amount).toFixed().toString();
      // const amountStr_readable = toReadableNumber(LOVE_TOKEN_DECIMAL, amountStr);
      const amountStr_readable = toReadableNumber(24, amountStr);
      setMaxLoveShareAmount(amountStr_readable);
    }
  }
  useEffect(() => {
    getStakeBalance();
  }, [Object.keys(user_seeds_map).length, user_data_loading]);
  useEffect(() => {
    const yourApr = getYourApr();
    if (yourApr) {
      setYourApr(yourApr);
    }
  }, [boostConfig, user_seeds_map]);
  async function getPoolFee() {
    const feeCache = dayVolumeMap && dayVolumeMap[pool.id];
    if (feeCache) {
      setDayVolume(feeCache);
    } else {
      const fee = await get24hVolume(pool.id.toString());
      setDayVolume(fee);
    }
  }
  const getStakeBalance = async () => {
    if (!isSignedIn) {
      setShowAddLiquidityEntry(false);
    } else {
      const poolId = pool.id;
      const b = await mftGetBalance(getMftTokenId(poolId.toString()));
      if (new Set(STABLE_POOL_IDS || []).has(poolId?.toString())) {
        setLpBalance(toReadableNumber(LP_STABLE_TOKEN_DECIMALS, b));
      } else {
        setLpBalance(toReadableNumber(LP_TOKEN_DECIMALS, b));
      }
      const isEnded = detailData.farmList[0].status == 'Ended';
      if (isEnded) {
        setShowAddLiquidityEntry(false);
      } else {
        const userSeed = user_seeds_map[detailData.seed_id];
        setShowAddLiquidityEntry(!Number(b) && !userSeed && !user_data_loading);
      }
    }
  };
  function getTotalApr(containPoolFee: boolean = true) {
    let day24Volume = 0;
    if (containPoolFee) {
      day24Volume = +getPoolFeeApr(dayVolume);
    }
    let apr = getActualTotalApr();
    if (apr == 0 && day24Volume == 0) {
      return '-';
    } else {
      apr = +new BigNumber(apr).multipliedBy(100).plus(day24Volume).toFixed();
      return toPrecision(apr.toString(), 2) + '%';
    }
  }
  function getActualTotalApr() {
    const farms = detailData.farmList;
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
  function getActualTotalBaseApr() {
    const farms = detailData.farmList;
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
  function getPoolFeeApr(dayVolume: string) {
    let result = '0';
    if (dayVolume) {
      const { total_fee, tvl } = detailData.pool;
      const revenu24h = (total_fee / 10000) * 0.8 * Number(dayVolume);
      if (tvl > 0 && revenu24h > 0) {
        const annualisedFeesPrct = ((revenu24h * 365) / tvl) * 100;
        result = toPrecision(annualisedFeesPrct.toString(), 2);
      }
    }
    return result;
  }
  function getAprTip(isYour?: Boolean) {
    const tempList = detailData.farmList;
    const lastList: any[] = [];
    const pending_farms: FarmBoost[] = [];
    const no_pending_farms: FarmBoost[] = [];
    const day24Volume = getPoolFeeApr(dayVolume);
    let totalApr;
    const baseApr = getTotalApr(false);
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
    if (isYour) {
      totalApr = yourApr;
    } else {
      totalApr = baseApr;
    }
    // show last display string
    let result: string = '';
    result = `
    <div class="flex items-center justify-between">
      <span class="text-xs text-navHighLightText mr-3">${txt1}</span>
      <span class="text-sm text-white font-bold">${
        +day24Volume > 0 ? day24Volume + '%' : '-'
      }</span>
    </div>
    <div class="flex justify-end text-white text-sm font-bold ">+</div>
    <div class="flex items-center justify-between ">
      <span class="text-xs text-navHighLightText mr-3">${txt2}</span>
      <span class="text-sm text-white font-bold">${totalApr}</span>
    </div>
    `;
    if (isYour) {
      const displayYourActualAprRate = new BigNumber(yourActualAprRate).toFixed(
        2
      );
      result += `<div class="flex items-center justify-end text-xs text-farmText">
      (${baseApr}<span class="flex items-center ${
        +displayYourActualAprRate == 1 ? 'text-farmText' : 'text-senderHot'
      } text-xs ml-0.5">x${displayYourActualAprRate}<img src="${
        +displayYourActualAprRate == 1
          ? LightningBase64Grey()
          : LightningBase64()
      }"/></span>)
    </div>`;
    }

    lastList.forEach((item: any) => {
      const { rewardToken, apr: baseApr, pending, startTime } = item;
      const token = rewardToken;
      let itemHtml = '';
      let apr = baseApr;
      if (isYour && yourApr && yourActualAprRate) {
        apr = new BigNumber(apr).multipliedBy(yourActualAprRate).toFixed();
      }
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
  function isEnded() {
    const farms = detailData.farmList;
    return farms[0].status == 'Ended';
  }
  function getAprUpperLimit() {
    if (!boostConfig || !maxLoveShareAmount || +maxLoveShareAmount == 0)
      return '';
    const { affected_seeds } = boostConfig;
    const { seed_id } = detailData;
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
          <label className="mx-0.5">～</label>
          {toPrecision(r.toString(), 2) + '%'}
        </span>
      );
    }
    return '';
  }
  function valueOfRewardsTip() {
    const tip = intl.formatMessage({ id: 'farmRewardsCopy' });
    let result: string = `<div class="text-navHighLightText text-xs w-52 text-left">${tip}</div>`;
    return result;
  }
  function getYourApr() {
    if (!boostConfig) return '';
    const { affected_seeds } = boostConfig;
    const { seed_id } = detailData;
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
  function getAprTitleTip() {
    const yourAprTip = intl.formatMessage({ id: 'your_apr' });
    const rangeAprTip = intl.formatMessage({ id: 'range_apr' });
    let result: string = '';
    if (yourApr) {
      result = `<div class="flex items-center text-navHighLightText text-xs  text-left">
      <span class="text-white">${yourAprTip} / </span> &nbsp;${rangeAprTip} 
    </div>`;
    } else {
      result = `<div class="flex items-center text-navHighLightText text-xs  text-left">
      ${rangeAprTip} 
    </div>`;
    }
    return result;
  }
  const aprUpLimit = getAprUpperLimit();
  const mobile = isMobile();
  const needForbidden =
    (FARM_BLACK_LIST_V2 || []).indexOf(pool.id.toString()) > -1;

  return (
    <div className="mt-5">
      <div
        className={`poolbaseInfo flex items-center xs:flex-col md:flex-col justify-between ${
          isEnded() || needForbidden ? 'farmEnded' : ''
        }`}
      >
        <div
          className="flex flex-col items-start justify-between bg-cardBg rounded-lg py-3.5 px-5 flex-grow mr-3.5 xs:mr-0 md:mr-0  xs:w-full md:w-full"
          style={{ height: '90px' }}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-farmText text-sm">
              <FormattedMessage id="total_staked"></FormattedMessage>
            </span>
            {yourApr && !mobile ? null : (
              <span className={`flex items-center`}>
                <CalcIcon
                  onClick={(e: any) => {
                    e.stopPropagation();
                    setCalcVisible(true);
                  }}
                  className="text-farmText mr-1.5 cursor-pointer hover:text-greenColor"
                />
                <div className="flex items-center">
                  <label className="text-farmText text-sm">
                    <FormattedMessage id="apr"></FormattedMessage>
                  </label>
                  <div
                    className="text-white text-right ml-1"
                    data-class="reactTip"
                    data-for={'yourAprTipId_m'}
                    data-place="top"
                    data-html={true}
                    data-tip={getAprTitleTip()}
                  >
                    <QuestionMark></QuestionMark>
                    <ReactTooltip
                      id={'yourAprTipId_m'}
                      backgroundColor="#1D2932"
                      border
                      borderColor="#7e8a93"
                      effect="solid"
                    />
                  </div>
                </div>
              </span>
            )}
          </div>
          <div className={`flex items-start mt-1 justify-between w-full`}>
            <span className="text-white text-base">
              {`${
                Number(detailData.seedTvl) == 0
                  ? '-'
                  : `$${toInternationalCurrencySystem(detailData.seedTvl, 2)}`
              }`}
            </span>
            {yourApr && !mobile ? null : (
              <div
                className={`text-xl text-white`}
                data-type="info"
                data-place="top"
                data-multiline={true}
                data-tip={getAprTip(yourApr ? true : false)}
                data-html={true}
                data-for={'aprId' + detailData.farmList[0].farm_id}
                data-class="reactTip"
              >
                <span
                  className={`flex items-center flex-wrap justify-center text-white text-base text-right`}
                >
                  {' '}
                  {yourApr ? (
                    <div className="flex flex-col items-end justify-center">
                      <label className="text-white">{yourApr}</label>
                      <span className="text-sm text-primaryText">
                        ({getTotalApr()}
                        {aprUpLimit})
                      </span>
                    </div>
                  ) : (
                    <>
                      <label
                        className={`${aprUpLimit ? 'text-xs' : 'text-base'}`}
                      >
                        {getTotalApr()}
                      </label>
                      {aprUpLimit}
                    </>
                  )}
                </span>
                <ReactTooltip
                  id={'aprId' + detailData.farmList[0].farm_id}
                  backgroundColor="#1D2932"
                  border
                  borderColor="#7e8a93"
                  effect="solid"
                />
              </div>
            )}
          </div>
        </div>
        {yourApr && !mobile ? (
          <div
            className="flex flex-col items-start justify-between bg-cardBg rounded-lg py-3.5 px-5 flex-grow mr-3.5 xs:mr-0 md:mr-0  xs:w-full md:w-full"
            style={{ height: '90px' }}
          >
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center">
                <label className="text-farmText text-sm">
                  <FormattedMessage id="apr"></FormattedMessage>
                </label>
                <div
                  className="text-white text-right ml-1"
                  data-class="reactTip"
                  data-for={'yourAprTipId'}
                  data-place="top"
                  data-html={true}
                  data-tip={getAprTitleTip()}
                >
                  <QuestionMark></QuestionMark>
                  <ReactTooltip
                    id={'yourAprTipId'}
                    backgroundColor="#1D2932"
                    border
                    borderColor="#7e8a93"
                    effect="solid"
                  />
                </div>
              </div>
              <CalcIcon
                onClick={(e: any) => {
                  e.stopPropagation();
                  setCalcVisible(true);
                }}
                className="text-farmText mr-1.5 cursor-pointer hover:text-greenColor"
              />
            </div>
            <div className="flex justify-between items-end w-full">
              <div
                className={`text-xl text-white`}
                data-type="info"
                data-place="top"
                data-multiline={true}
                data-tip={getAprTip(true)}
                data-html={true}
                data-for={'aprId' + detailData.farmList[0].farm_id + 'your'}
                data-class="reactTip"
              >
                <span
                  className={`flex items-center flex-wrap justify-center text-white text-base text-right`}
                >
                  <label className={`text-base`}>{yourApr}</label>
                </span>
                <ReactTooltip
                  id={'aprId' + detailData.farmList[0].farm_id + 'your'}
                  backgroundColor="#1D2932"
                  border
                  borderColor="#7e8a93"
                  effect="solid"
                />
              </div>
              <div
                className={`text-xl text-white`}
                data-type="info"
                data-place="top"
                data-multiline={true}
                data-tip={getAprTip()}
                data-html={true}
                data-for={'aprId' + detailData.farmList[0].farm_id}
                data-class="reactTip"
              >
                <span
                  className={`flex items-center flex-wrap justify-center text-farmText text-xs text-right relative -top-0.5`}
                >
                  <label className={'text-xs'}>{getTotalApr()}</label>
                  {aprUpLimit}
                </span>
                <ReactTooltip
                  id={'aprId' + detailData.farmList[0].farm_id}
                  backgroundColor="#1D2932"
                  border
                  borderColor="#7e8a93"
                  effect="solid"
                />
              </div>
            </div>
          </div>
        ) : null}

        <div
          className="flex flex-col items-start  justify-between bg-cardBg rounded-lg py-3.5 px-5 flex-grow xs:mt-4 md:mt-4 xs:w-full md:w-full"
          style={{ height: '90px' }}
        >
          <div className="flex items-center text-farmText text-sm">
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
          <div className="flex items-center justify-between text-white text-base w-full">
            {totalTvlPerWeekDisplay()}
          </div>
        </div>
      </div>
      <AddLoginEntryBar></AddLoginEntryBar>
      <AddLiquidityEntryBar
        detailData={detailData}
        showAddLiquidityEntry={showAddLiquidityEntry}
      ></AddLiquidityEntryBar>
      <UserStakeBlock
        detailData={detailData}
        tokenPriceList={tokenPriceList}
        lpBalance={lpBalance}
        loveSeed={loveSeed}
        boostConfig={boostConfig}
        user_seeds_map={user_seeds_map}
        user_unclaimed_map={user_unclaimed_map}
        user_unclaimed_token_meta_map={user_unclaimed_token_meta_map}
        user_data_loading={user_data_loading}
        radio={radio}
      ></UserStakeBlock>
      <UserTotalUnClaimBlock
        detailData={detailData}
        tokenPriceList={tokenPriceList}
        user_seeds_map={user_seeds_map}
        user_unclaimed_map={user_unclaimed_map}
        user_unclaimed_token_meta_map={user_unclaimed_token_meta_map}
        radio={radio}
      ></UserTotalUnClaimBlock>
      {calcVisible ? (
        <CalcModelBooster
          isOpen={calcVisible}
          onRequestClose={(e) => {
            e.stopPropagation();
            setCalcVisible(false);
          }}
          seed={detailData}
          tokenPriceList={tokenPriceList}
          loveSeed={loveSeed}
          boostConfig={boostConfig}
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
function AddLiquidityEntryBar(props: {
  detailData: Seed;
  showAddLiquidityEntry: any;
}) {
  const { detailData, showAddLiquidityEntry } = props;
  const [addLiquidityModalVisible, setAddLiquidityModalVisible] =
    useState(false);
  const poolA = detailData.pool;
  const poolId = poolA.id;
  const { pool } = usePool(poolId);
  const tokens = useTokens(pool?.tokenIds);
  const history = useHistory();
  let addLiquidityButtonLoading;
  function openAddLiquidityModal() {
    if (isStablePool(poolId)) {
      if (poolA.token_account_ids?.length > 2) {
        localStorage.setItem('REF_STABLE_SWAP_TAB_VALUE', 'add_liquidity');
      } else {
        const key = `REF_STABLE_SWAP_TAB_VALUE_${poolId}`;
        localStorage.setItem(key, 'add_liquidity');
      }
      history.push(`/sauce/${poolId}`);
    } else {
      setAddLiquidityModalVisible(true);
    }
  }
  if (!(tokens && tokens.length > 0 && pool)) {
    addLiquidityButtonLoading = true;
  } else {
    addLiquidityButtonLoading = false;
  }
  if (!showAddLiquidityEntry) return null;
  return (
    <div
      className="rounded-lg overflow-hidden mt-8"
      style={{ backgroundColor: 'rgba(29, 41, 50, 0.5)' }}
    >
      <div className="w-full bg-gradientFrom h-1.5"></div>
      <div className="flex items-center justify-center pt-5 pb-3 px-3 xs:flex-col md:flex-col">
        <p className="text-sm text-white xs:mb-3 md:mb-3">
          <FormattedMessage id="add_lp_tokens_tip" />
        </p>
        <GradientButton
          onClick={openAddLiquidityModal}
          color="#fff"
          loading={addLiquidityButtonLoading}
          minWidth="9rem"
          className={`flex-shrink-0 px-1 h-8 ml-5 text-center text-sm text-white focus:outline-none font-semibold `}
        >
          <ButtonTextWrapper
            loading={addLiquidityButtonLoading}
            Text={() => (
              <FormattedMessage
                id="add_liquidity"
                defaultMessage="Add Liquidity"
              />
            )}
          />
        </GradientButton>
      </div>
      {addLiquidityModalVisible ? (
        <AddLiquidityModal
          title="add_liquidity"
          isOpen={addLiquidityModalVisible}
          onRequestClose={() => {
            setAddLiquidityModalVisible(false);
          }}
          tokens={tokens}
          pool={pool}
        ></AddLiquidityModal>
      ) : null}
    </div>
  );
}
function AddLiquidityModal(props: any) {
  const { pool, tokens } = props;
  return (
    <CommonModal {...props}>
      <AddLiquidity pool={pool} tokens={tokens} />
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
        {props.subChildren ? (
          <div style={{ width: cardWidth }}>{props.subChildren}</div>
        ) : null}
      </div>
    </Modal>
  );
}

function DetailIcons({ tokens }: { tokens: TokenMetadata[] }) {
  return (
    <div className="flex items-center">
      {tokens.map((token, index) => {
        return token.icon ? (
          <img
            src={token.icon}
            className={`w-6 h-6 rounded-full border border-gradientFrom bg-cardBg ${
              index != 0 ? '-ml-1' : ''
            }`}
            alt=""
          />
        ) : (
          <div
            className={`w-6 h-6 rounded-full border border-gradientFrom bg-cardBg ${
              index != 0 ? '-ml-1' : ''
            }`}
          ></div>
        );
      })}
    </div>
  );
}

function DetailSymbol({
  tokens,
  id,
}: {
  tokens: TokenMetadata[];
  id: string | number;
}) {
  return (
    <div className="text-sm text-white flex items-center">
      <span className="pl-2">
        {tokens.map((token) => toRealSymbol(token.symbol)).join('-')}
      </span>

      <span
        className="cursor-pointer pl-2 py-0.5 text-gradientFrom"
        onClick={() => window.open(`/pool/${id}`, '_blank')}
      >
        <ExternalLinkIcon />
      </span>
    </div>
  );
}

function PoolDetailCard({
  tokens,
  pool,
}: {
  tokens: TokenMetadata[];
  pool: Pool;
}) {
  const [showDetail, setShowDetail] = useState(false);

  const [poolTVL, setPoolTVl] = useState<string>('');
  const h24Volume = useDayVolume(pool.id.toString());

  useEffect(() => {
    getPool(pool.id.toString()).then((pool) => {
      setPoolTVl(pool.tvl.toString());
    });
  }, []);

  const DetailRow = ({
    value,
    valueTitle,
    title,
  }: {
    value: JSX.Element | string;
    valueTitle?: string;
    title: JSX.Element | string;
  }) => {
    return (
      <div className="flex items-center justify-between pt-4">
        <div className="text-farmText">{title}</div>
        <div className="text-white" title={valueTitle}>
          {value}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-cardBg rounded-2xl p-6 text-xs w-full right-0">
      <div className="detail-header flex items-center justify-between">
        <div className="flex items-center">
          <DetailIcons tokens={tokens} />
          <DetailSymbol tokens={tokens} id={pool.id} />
        </div>
        <div
          className="cursor-pointer text-gradientFrom flex items-center"
          onClick={() => setShowDetail(!showDetail)}
        >
          <span>
            <FormattedMessage id="pool_stats" defaultMessage="Pool Stats" />
          </span>
          <span>
            <div className="pl-1">
              {showDetail ? <FaAngleUp /> : <FaAngleDown />}
            </div>
          </span>
        </div>
      </div>
      {!showDetail ? null : (
        <>
          {' '}
          <DetailRow
            title={
              <FormattedMessage
                id="TVL"
                defaultMessage={'TVL'}
              ></FormattedMessage>
            }
            value={`$${toInternationalCurrencySystem(poolTVL || '0', 2)}`}
            valueTitle={poolTVL}
          />
          <DetailRow
            title={toRealSymbol(tokens[0].symbol)}
            value={toInternationalCurrencySystem(
              toReadableNumber(tokens[0].decimals, pool.supplies[tokens[0].id]),
              2
            )}
            valueTitle={toReadableNumber(
              tokens[0].decimals,
              pool.supplies[tokens[0].id]
            )}
          />
          <DetailRow
            title={toRealSymbol(tokens[1].symbol)}
            value={toInternationalCurrencySystem(
              toReadableNumber(tokens[1].decimals, pool.supplies[tokens[1].id]),
              2
            )}
            valueTitle={toReadableNumber(
              tokens[1].decimals,
              pool.supplies[tokens[1].id]
            )}
          />
          <DetailRow
            title={
              <FormattedMessage id="h24_volume" defaultMessage="24h volume" />
            }
            value={
              h24Volume ? toInternationalCurrencySystem(h24Volume, 2) : '-'
            }
            valueTitle={h24Volume || ''}
          />
          <DetailRow
            title={
              <FormattedMessage
                id="Fee"
                defaultMessage="Fee"
              ></FormattedMessage>
            }
            value={`${pool.fee / 100}%`}
          />
        </>
      )}
    </div>
  );
}

function AddLiquidity(props: { pool: Pool; tokens: TokenMetadata[] }) {
  const { pool, tokens } = props;
  const [firstTokenAmount, setFirstTokenAmount] = useState<string>('');
  const [secondTokenAmount, setSecondTokenAmount] = useState<string>('');
  const [messageId, setMessageId] = useState<string>('add_liquidity');
  const [defaultMessage, setDefaultMessage] = useState<string>('Add Liquidity');
  const balances = useWalletTokenBalances(tokens.map((token) => token.id));

  const nearBalance = useDepositableBalance('NEAR');

  const [error, setError] = useState<Error>();
  const intl = useIntl();
  const [canSubmit, setCanSubmit] = useState<boolean>(false);
  const [canDeposit, setCanDeposit] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const [preShare, setPreShare] = useState(null);
  const [modal, setModal] = useState(null);

  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;

  // if (!balances) return null;

  balances && (balances[WRAP_NEAR_CONTRACT_ID] = nearBalance);

  const changeFirstTokenAmount = (amount: string) => {
    setError(null);
    if (Object.values(pool.supplies).every((s) => s === '0')) {
      setFirstTokenAmount(amount);
      const zero = new BigNumber('0');
      if (
        zero.isLessThan(secondTokenAmount || '0') &&
        zero.isLessThan(amount || '0')
      ) {
        setPreShare(1);
      } else {
        setPreShare(null);
      }
      try {
        validate({
          firstAmount: amount,
          secondAmount: secondTokenAmount,
        });
      } catch (error) {
        setError(error);
      }
    } else {
      const fairShares = calculateFairShare({
        shareOf: pool.shareSupply,
        contribution: toNonDivisibleNumber(tokens[0].decimals, amount),
        totalContribution: pool.supplies[tokens[0].id],
      });
      let secondAmount = '';
      if (amount) {
        secondAmount = toReadableNumber(
          tokens[1].decimals,
          calculateFairShare({
            shareOf: pool.supplies[tokens[1].id],
            contribution: fairShares,
            totalContribution: pool.shareSupply,
          })
        );
      }
      setFirstTokenAmount(amount);
      setSecondTokenAmount(secondAmount);
      setPreShare(toReadableNumber(24, fairShares));
      try {
        validate({
          firstAmount: amount,
          secondAmount,
        });
      } catch (error) {
        setError(error);
      }
    }
  };

  const changeSecondTokenAmount = (amount: string) => {
    setError(null);
    if (Object.values(pool.supplies).every((s) => s === '0')) {
      setSecondTokenAmount(amount);
      const zero = new BigNumber('0');
      if (
        zero.isLessThan(firstTokenAmount || '0') &&
        zero.isLessThan(amount || '0')
      ) {
        setPreShare(1);
      } else {
        setPreShare(null);
      }
      try {
        validate({
          firstAmount: firstTokenAmount,
          secondAmount: amount,
        });
      } catch (error) {
        setError(error);
      }
    } else {
      const fairShares = calculateFairShare({
        shareOf: pool.shareSupply,
        contribution: toNonDivisibleNumber(tokens[1].decimals, amount),
        totalContribution: pool.supplies[tokens[1].id],
      });
      let firstAmount = '';
      if (amount) {
        firstAmount = toReadableNumber(
          tokens[0].decimals,
          calculateFairShare({
            shareOf: pool.supplies[tokens[0].id],
            contribution: fairShares,
            totalContribution: pool.shareSupply,
          })
        );
      }
      setSecondTokenAmount(amount);
      setFirstTokenAmount(firstAmount);
      setPreShare(toReadableNumber(24, fairShares));
      try {
        validate({
          firstAmount,
          secondAmount: amount,
        });
      } catch (error) {
        setError(error);
      }
    }
  };

  function validate({
    firstAmount,
    secondAmount,
  }: {
    firstAmount: string;
    secondAmount: string;
  }) {
    const firstTokenAmountBN = new BigNumber(firstAmount.toString());
    const firstTokenBalanceBN = new BigNumber(
      getMax(
        tokens[0].id,
        toReadableNumber(tokens[0].decimals, balances[tokens[0].id])
      )
    );
    const secondTokenAmountBN = new BigNumber(secondAmount.toString());
    const secondTokenBalanceBN = new BigNumber(
      getMax(
        tokens[1].id,
        toReadableNumber(tokens[1].decimals, balances[tokens[1].id])
      )
    );

    setCanSubmit(false);
    setCanDeposit(false);
    if (firstTokenAmountBN.isGreaterThan(firstTokenBalanceBN)) {
      setCanDeposit(true);
      const { id, decimals } = tokens[0];
      const modalData: any = {
        token: tokens[0],
        action: 'deposit',
      };
      getDepositableBalance(id, decimals).then((nearBalance) => {
        modalData.max = nearBalance;
        setModal(Object.assign({}, modalData));
      });
      setModal(modalData);

      return;
    }

    if (secondTokenAmountBN.isGreaterThan(secondTokenBalanceBN)) {
      setCanDeposit(true);
      // setMessageId('deposit_to_add_liquidity');
      // setDefaultMessage('Deposit to Add Liquidity');
      const { id, decimals } = tokens[1];
      const modalData: any = {
        token: tokens[1],
        action: 'deposit',
      };
      getDepositableBalance(id, decimals).then((nearBalance) => {
        modalData.max = nearBalance;
        setModal(Object.assign({}, modalData));
      });
      setModal(modalData);
      return;
    }

    if (ONLY_ZEROS.test(firstAmount)) {
      setCanSubmit(false);
      setMessageId('add_liquidity');
      setDefaultMessage('Add Liquidity');
      return;
    }

    if (ONLY_ZEROS.test(secondAmount)) {
      setCanSubmit(false);
      setMessageId('add_liquidity');
      setDefaultMessage('Add Liquidity');
      return;
    }

    if (!tokens[0]) {
      throw new Error(
        `${tokens[0].id} ${intl.formatMessage({
          id: 'is_not_exist',
        })}`
      );
    }

    if (!tokens[1]) {
      throw new Error(
        `${tokens[1].id} ${intl.formatMessage({
          id: 'is_not_exist',
        })}`
      );
    }

    setCanSubmit(true);
    setMessageId('add_liquidity');
    setDefaultMessage('Add Liquidity');
  }

  function submit() {
    return addLiquidityToPool({
      id: pool.id,
      tokenAmounts: [
        { token: tokens[0], amount: firstTokenAmount },
        { token: tokens[1], amount: secondTokenAmount },
      ],
    });
  }

  const ButtonRender = () => {
    if (!isSignedIn) {
      return <ConnectToNearBtn />;
    }

    const handleClick = async () => {
      if (canSubmit) {
        setButtonLoading(true);
        submit();
      }
    };
    return (
      <SolidButton
        disabled={!canSubmit || canDeposit}
        className="focus:outline-none  w-full text-lg"
        onClick={handleClick}
        loading={buttonLoading}
        padding={'p-4'}
      >
        <div className="flex items-center justify-center w-full m-auto">
          <div>
            <ButtonTextWrapper
              loading={buttonLoading}
              Text={() => (
                <FormattedMessage
                  id={messageId}
                  defaultMessage={defaultMessage}
                />
              )}
            />
          </div>
        </div>
      </SolidButton>
    );
  };

  const shareDisplay = () => {
    let result = '';
    let percentShare = '';
    let displayPercentShare = '';
    if (preShare && new BigNumber('0').isLessThan(preShare)) {
      const myShareBig = new BigNumber(preShare);
      if (myShareBig.isLessThan('0.001')) {
        result = '<0.001';
      } else {
        result = `${myShareBig.toFixed(3)}`;
      }
    } else {
      result = '-';
    }

    if (result !== '-') {
      percentShare = `${percent(
        preShare,
        scientificNotationToString(
          new BigNumber(toReadableNumber(24, pool.shareSupply))
            .plus(new BigNumber(preShare))
            .toString()
        )
      )}`;

      if (Number(percentShare) > 0 && Number(percentShare) < 0.01) {
        displayPercentShare = '< 0.01%';
      } else {
        displayPercentShare = `${toPrecision(percentShare, 2)}%`;
      }
    }

    return {
      lpTokens: result,
      shareDisplay: displayPercentShare,
    };
  };

  const getMax = function (id: string, amount: string) {
    return id !== WRAP_NEAR_CONTRACT_ID
      ? amount
      : Number(amount) <= 0.5
      ? '0'
      : String(Number(amount) - 0.5);
  };
  const shareMessage = shareDisplay();

  return (
    <>
      <div className="text-white outline-none ">
        <div className="mt-8">
          <div className="flex justify-end items-center text-sm text-right mb-1.5 text-farmText">
            <FormattedMessage id="balance" defaultMessage="Balance" />
            {':'}
            <span
              className="ml-1"
              title={toReadableNumber(
                tokens[0].decimals,
                balances?.[tokens[0].id]
              )}
            >
              {toPrecision(
                toReadableNumber(tokens[0].decimals, balances?.[tokens[0].id]),
                2,
                true
              )}
            </span>
          </div>
          <div className="flex items-center">
            <BoostInputAmount
              className="w-full border border-transparent rounded"
              max={getMax(
                tokens[0].id,
                toReadableNumber(tokens[0].decimals, balances?.[tokens[0].id])
              )}
              onChangeAmount={changeFirstTokenAmount}
              value={firstTokenAmount}
              tokenSymbol={toRealSymbol(tokens[0].symbol)}
            />
          </div>
        </div>

        <div className="my-8">
          <div className="flex justify-end items-center text-sm text-right mb-1.5 text-farmText">
            <FormattedMessage id="balance" defaultMessage="Balance" />
            {':'}
            <span
              className="ml-1"
              title={toReadableNumber(
                tokens[1].decimals,
                balances?.[tokens[1].id]
              )}
            >
              {toPrecision(
                toReadableNumber(tokens[1].decimals, balances?.[tokens[1].id]),
                2,
                true
              )}
            </span>
          </div>
          <div className="flex items-center ">
            <BoostInputAmount
              className="w-full border border-transparent rounded"
              max={getMax(
                tokens[1].id,
                toReadableNumber(tokens[1].decimals, balances?.[tokens[1].id])
              )}
              onChangeAmount={changeSecondTokenAmount}
              value={secondTokenAmount}
              tokenSymbol={toRealSymbol(tokens[1].symbol)}
            />
          </div>
        </div>
        {error ? (
          <div className="flex justify-center mb-8 ">
            <Alert level="warn" message={error.message} />
          </div>
        ) : null}
        <div className=" text-farmText text-sm mt-6 mb-4  px-2 rounded-lg">
          <div className="flex items-center justify-between">
            <label>
              <FormattedMessage id="lp_tokens" defaultMessage={'LP tokens'} />
            </label>
            <span className="text-white text-sm">
              {shareMessage?.lpTokens || '-'}
            </span>
          </div>
          <div className="flex items-center justify-between pt-4">
            <label>
              <FormattedMessage id="Share" defaultMessage="Share" />
            </label>
            <span className="text-white text-sm">
              {shareMessage?.shareDisplay || '-'}
            </span>
          </div>
        </div>

        {canDeposit ? (
          <div className=" rounded-md mb-6 px-4 text-center xs:px-2  text-base">
            <label className="text-warnColor ">
              <FormattedMessage id="oops" defaultMessage="Oops" />!
            </label>
            <label className="ml-2.5 text-warnColor ">
              <FormattedMessage id="you_do_not_have_enough" />{' '}
              {toRealSymbol(modal?.token?.symbol)}.
            </label>
          </div>
        ) : null}

        <ButtonRender />
      </div>
      <div
        className="absolute pb-20 w-full right-0"
        style={{
          top: '102%',
          height: '300px',
        }}
      >
        <PoolDetailCard tokens={tokens} pool={pool} />
      </div>
    </>
  );
}
function UserTotalUnClaimBlock(props: {
  detailData: Seed;
  tokenPriceList: any;
  user_seeds_map: Record<string, UserSeedInfo>;
  user_unclaimed_token_meta_map: Record<string, any>;
  user_unclaimed_map: Record<string, any>;
  radio: string | number;
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
  const isSignedIn = globalState.isSignedIn;
  const intl = useIntl();
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
function UserStakeBlock(props: {
  detailData: Seed;
  tokenPriceList: any;
  lpBalance: string;
  loveSeed: Seed;
  boostConfig: BoostConfig;
  user_seeds_map: Record<string, UserSeedInfo>;
  user_unclaimed_token_meta_map: Record<string, any>;
  user_unclaimed_map: Record<string, any>;
  user_data_loading: Boolean;
  radio: string | number;
}) {
  const {
    detailData,
    tokenPriceList,
    lpBalance,
    loveSeed,
    boostConfig,
    user_seeds_map,
    user_unclaimed_token_meta_map,
    user_unclaimed_map,
    user_data_loading,
    radio,
  } = props;
  const [stakeModalVisible, setStakeModalVisible] = useState(false);
  const [unStakeModalVisible, setUnStakeModalVisible] = useState(false);
  const [stakeType, setStakeType] = useState('');
  const [unStakeType, setUnStakeType] = useState('');
  const [serverTime, setServerTime] = useState<number>();
  const [yourTvl, setYourTvl] = useState('');
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const { pool, min_locking_duration_sec, slash_rate, seed_id, seed_decimal } =
    detailData;
  const {
    free_amount = '0',
    locked_amount = '0',
    x_locked_amount = '0',
    unlock_timestamp,
    duration_sec,
  } = user_seeds_map[seed_id] || {};
  const { shares_total_supply, tvl } = pool;
  const unClaimedTokens = useTokens(
    Object.keys(user_unclaimed_map[seed_id] || {})
  );
  const DECIMALS = new Set(STABLE_POOL_IDS || []).has(pool.id?.toString())
    ? LP_STABLE_TOKEN_DECIMALS
    : LP_TOKEN_DECIMALS;

  const userTotalStake = toReadableNumber(
    DECIMALS,
    new BigNumber(free_amount).plus(locked_amount).toFixed()
  );
  const totalPower = toReadableNumber(
    DECIMALS,
    new BigNumber(free_amount).plus(x_locked_amount).toFixed()
  );
  const freeAmount = toReadableNumber(DECIMALS, free_amount);
  const lockAmount = toReadableNumber(DECIMALS, locked_amount);
  const xlocked_amount = toReadableNumber(DECIMALS, x_locked_amount);
  const slashRate = slash_rate / 10000;
  const intl = useIntl();
  useEffect(() => {
    get_server_time();
  }, []);
  useEffect(() => {
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
  }, [Object.keys(user_seeds_map || {})]);

  const get_server_time = async () => {
    const timestamp = await getServerTime();
    setServerTime(timestamp);
  };
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
    const { total_seed_power } = detailData;
    const userPower = getUserPower();
    if (+total_seed_power && !user_data_loading && +userPower) {
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
  function showLpWorth() {
    const poolLpAmount = Number(
      toReadableNumber(DECIMALS, shares_total_supply)
    );
    const userLpAmount = Number(userTotalStake);
    if (poolLpAmount == 0 || userLpAmount == 0) {
      return <label className="opacity-30">{isSignedIn ? '$0' : '-'}</label>;
    } else {
      const userLpWorth = ((userLpAmount * tvl) / poolLpAmount).toString();
      const userLpWorthBigNumber = new BigNumber(userLpWorth);
      if (userLpWorthBigNumber.isEqualTo(0)) {
        return '$0';
      } else if (userLpWorthBigNumber.isLessThan(0.001)) {
        return '<$0.001';
      } else {
        return '$' + toPrecision(userLpWorth, 3);
      }
    }
  }
  function displayLpBalance() {
    if (lpBalance) {
      return toPrecision(lpBalance || '0', 3);
    }
  }
  function closeStakeModalVisible() {
    setStakeType('');
    setStakeModalVisible(false);
  }
  function closeUnStakeModalVisible() {
    setUnStakeType('');
    setUnStakeModalVisible(false);
  }
  function openStakeModalVisible(stakeType: string) {
    setStakeType(stakeType);
    setStakeModalVisible(true);
  }
  function openUnStakeModalVisible(unStakeType: string) {
    setUnStakeType(unStakeType);
    setUnStakeModalVisible(true);
  }
  function displayRewards(stakeType: string) {
    let percent: number;
    if (stakeType == 'free') {
      percent = Number(freeAmount) / Number(totalPower);
    } else {
      percent = Number(xlocked_amount) / Number(totalPower);
    }
    let totalPrice = 0;
    unClaimedTokens?.forEach((token: TokenMetadata) => {
      const { id, decimals } = token;
      const amount = toReadableNumber(decimals, user_unclaimed_map[id] || '0');
      const tokenPrice = tokenPriceList[id]?.price;
      if (tokenPrice && tokenPrice != 'N/A') {
        totalPrice += +amount * tokenPrice;
      }
    });
    totalPrice = totalPrice * percent;
    if (totalPrice == 0) {
      return '$0';
    } else if (new BigNumber('0.01').isGreaterThan(totalPrice)) {
      return '<$0.01';
    } else {
      return `$${toInternationalCurrencySystem(totalPrice.toString(), 2)}`;
    }
  }
  function displayLp(lp: string) {
    if (new BigNumber(lp).isLessThan('0.001')) {
      return '<0.001';
    } else {
      return toPrecision(lp, 3);
    }
  }
  function displayBooster() {
    const rate = new BigNumber(xlocked_amount).dividedBy(lockAmount).toFixed();
    return toPrecision(rate.toString(), 2);
  }
  function displayDuration() {
    const durationData: {
      pecent: number;
      dom: string;
    } = displayLockDuration();
    if (!durationData) return null;
    return (
      <div className="flex items-center">
        <div
          className="rounded-lg bg-darkBg overflow-hidden"
          style={{ width: '150px', height: '4px' }}
        >
          <div
            className={`rounded-2xl h-full ${
              durationData.pecent >= 0.8 ? 'bg-greenColor' : 'bg-bgGreyDefault'
            }`}
            style={{ width: durationData.pecent * 100 + '%' }}
          ></div>
        </div>
        <div className="flex items-center">
          <div
            className="text-white text-right ml-1"
            data-class="reactTip"
            data-for="duration_start_end_id"
            data-place="top"
            data-html={true}
            data-tip={durationData.dom}
          >
            <QuestionMark></QuestionMark>
            <ReactTooltip
              id="duration_start_end_id"
              backgroundColor="#1D2932"
              border
              borderColor="#7e8a93"
              effect="solid"
            />
          </div>
        </div>
      </div>
    );
  }
  const displayLockDuration = (): {
    pecent: number;
    dom: string;
  } => {
    if (serverTime && unlock_timestamp) {
      const month = duration_sec / 2592000;
      // get reset time
      let restTime_sec = 0;
      if (+unlock_timestamp > serverTime) {
        restTime_sec = new BigNumber(unlock_timestamp)
          .minus(serverTime)
          .dividedBy(1000000000)
          .toNumber();
      }
      const pecent = 1 - restTime_sec / duration_sec;
      // get start~end
      const end_sec = +unlock_timestamp / 1000000000;
      const begin_sec = end_sec - duration_sec;
      const startDate = new Date(begin_sec * 1000).toString();
      const endDate = new Date(end_sec * 1000).toString();
      const startArr = startDate.split(' ');
      const endArr = endDate.split(' ');
      const startDisplay = `${startArr[2]} ${startArr[1]}, ${startArr[3]}`;
      const endDisplay = `${endArr[2]} ${endArr[1]}, ${endArr[3]}`;
      const hm = endArr[4].substring(0, 5);
      const dom = `<div class="flex flex-col items-start">
          <span class="text-farmText text-xs">${toPrecision(
            (pecent * 100).toString(),
            3
          )} % of ${month} months</span>
          <span class="text-farmText text-xs mt-1">${hm} ${startDisplay} - ${endDisplay}</span>
      </div>`;
      return {
        dom,
        pecent,
      };
    }
  };
  function getExitFee() {
    let result = '0';
    if (+unlock_timestamp > serverTime) {
      const restTime_sec = new BigNumber(unlock_timestamp)
        .minus(serverTime)
        .dividedBy(1000000000)
        .toNumber();
      const slashAmount =
        (restTime_sec / duration_sec) * slashRate * Number(lockAmount);
      if (new BigNumber(slashAmount).isLessThan(0.001)) {
        result = '< 0.001';
      } else {
        result = `${toPrecision(slashAmount.toString(), 3)}`;
      }
    }
    return result;
  }
  function getExitFeeTip() {
    const txt = intl.formatMessage({ id: 'exit_fee_tip' });
    return `<div class="w-54 text-left">
        <span class="text-farmText text-xs">
          ${txt}
        </span>
    </div>`;
  }
  function getPowerTip() {
    if (REF_VE_CONTRACT_ID && !boostConfig) return '';
    const { affected_seeds = {} } = boostConfig || {};
    const { seed_id } = detailData;
    const base = affected_seeds[seed_id];
    const tip = intl.formatMessage({
      id: base ? 'farm_has_boost_tip' : 'farm_no_boost_tip',
    });
    let result: string = `<div class="text-navHighLightText text-xs w-52 text-left">${tip}</div>`;
    return result;
  }
  function getPowerDetail() {
    if (REF_VE_CONTRACT_ID && !boostConfig) return '';
    const { affected_seeds = {} } = boostConfig || {};
    const { seed_id } = detailData;
    const base = affected_seeds[seed_id];
    if (base) {
      const freeAmount = toReadableNumber(DECIMALS, free_amount);
      const isBoost = radio && user_seeds_map[detailData.seed_id];
      if (isBoost) {
        return `<div class="flex items-center justify-start text-xs">
        <span class="text-farmText">${toPrecision(
          freeAmount,
          3
        )}</span> <span class="ml-1 flex items-center text-senderHot">x${radio}<img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTkiIHZpZXdCb3g9IjAgMCAxOCAxOSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgZmlsdGVyPSJ1cmwoI2ZpbHRlcjBfZl8xOTI4XzMwKSI+CjxjaXJjbGUgY3g9IjkuMzg0NjciIGN5PSI5LjQ2MTA5IiByPSI0LjYxNTM4IiBmaWxsPSIjMDBGRkQxIiBmaWxsLW9wYWNpdHk9IjAuNCIvPgo8L2c+CjxwYXRoIGQ9Ik05LjY2NDE2IDMuMDA0N0M5LjgxNzg0IDMuMDQ0NyA5Ljg0MjMxIDMuMzA5NDQgOS44NDUyNSAzLjgyODQ1TDkuODQ2MjMgNi44MTAxNUM5Ljg0NjIzIDcuMDM0ODkgOS44NDYyMyA3LjE0NzI3IDkuOTE3NjkgNy4yMTY3OEM5Ljk3NzM5IDcuMjczOTIgMTAuMDY3NCA3LjI4NDQgMTAuMjI5OSA3LjI4NjNIMTEuMzc2MkMxMi44NzM4IDcuMjg2MyAxMy42MjE2IDcuMjg2MyAxMy45MDQ1IDcuNzU5NkMxNC4xODg0IDguMjMyOSAxMy44MTg0IDguODY2MTkgMTMuMDc4NCAxMC4xMzE4TDEwLjc2MTQgMTQuMTAwMUMxMC4zOTQ0IDE0LjcyODYgMTAuMjEwNCAxNS4wNDI5IDEwLjAyODMgMTQuOTk1M0M5Ljg0NjIzIDE0Ljk0OTYgOS44NDYyMyAxNC41ODg2IDkuODQ2MjMgMTMuODY1OFYxMS4xOTA4QzkuODQ2MjMgMTAuOTY2IDkuODQ2MjMgMTAuODUzNyA5Ljc3NDc3IDEwLjc4NDJDOS43MDMzMiAxMC43MTQ2IDkuNTg3ODEgMTAuNzE0NiA5LjM1NjgxIDEwLjcxNDZINy44NDQ0OUM2LjY1OTExIDEwLjcwODkgNi4wMzk1IDEwLjY2MjMgNS43ODc5NCAxMC4yNDEzQzUuNTA0MDcgOS43NjgwMyA1Ljg3NDA4IDkuMTM0NzUgNi42MTQwOCA3Ljg2OTEyTDguOTMxMDEgMy45MDA4M0M5LjI5ODA4IDMuMjcyMyA5LjQ4MjEgMi45NTcwOCA5LjY2NDE2IDMuMDA0N1oiIGZpbGw9IiMwMEZGRDEiLz4KPGRlZnM+CjxmaWx0ZXIgaWQ9ImZpbHRlcjBfZl8xOTI4XzMwIiB4PSIwLjc2OTI4NyIgeT0iMC44NDU3MDMiIHdpZHRoPSIxNy4yMzA3IiBoZWlnaHQ9IjE3LjIzMDUiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KPGZlRmxvb2QgZmxvb2Qtb3BhY2l0eT0iMCIgcmVzdWx0PSJCYWNrZ3JvdW5kSW1hZ2VGaXgiLz4KPGZlQmxlbmQgbW9kZT0ibm9ybWFsIiBpbj0iU291cmNlR3JhcGhpYyIgaW4yPSJCYWNrZ3JvdW5kSW1hZ2VGaXgiIHJlc3VsdD0ic2hhcGUiLz4KPGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iMiIgcmVzdWx0PSJlZmZlY3QxX2ZvcmVncm91bmRCbHVyXzE5MjhfMzAiLz4KPC9maWx0ZXI+CjwvZGVmcz4KPC9zdmc+"/></span>
    </div>`;
      } else {
        return `<div class="flex items-center justify-start text-xs">
        <span class="text-farmText">${toPrecision(
          freeAmount,
          3
        )}</span> <span class="ml-1 flex items-center text-farmText">x1<img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTkiIHZpZXdCb3g9IjAgMCAxOCAxOSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgZmlsdGVyPSJ1cmwoI2ZpbHRlcjBfZl8xOTI4XzMwKSI+CjxjaXJjbGUgY3g9IjkuMzg0NjciIGN5PSI5LjQ2MTA5IiByPSI0LjYxNTM4IiBmaWxsPSIjNzM4MThCIiBmaWxsLW9wYWNpdHk9IjAuNCIvPgo8L2c+CjxwYXRoIGQ9Ik05LjY2NDE2IDMuMDA0N0M5LjgxNzg0IDMuMDQ0NyA5Ljg0MjMxIDMuMzA5NDQgOS44NDUyNSAzLjgyODQ1TDkuODQ2MjMgNi44MTAxNUM5Ljg0NjIzIDcuMDM0ODkgOS44NDYyMyA3LjE0NzI3IDkuOTE3NjkgNy4yMTY3OEM5Ljk3NzM5IDcuMjczOTIgMTAuMDY3NCA3LjI4NDQgMTAuMjI5OSA3LjI4NjNIMTEuMzc2MkMxMi44NzM4IDcuMjg2MyAxMy42MjE2IDcuMjg2MyAxMy45MDQ1IDcuNzU5NkMxNC4xODg0IDguMjMyOSAxMy44MTg0IDguODY2MTkgMTMuMDc4NCAxMC4xMzE4TDEwLjc2MTQgMTQuMTAwMUMxMC4zOTQ0IDE0LjcyODYgMTAuMjEwNCAxNS4wNDI5IDEwLjAyODMgMTQuOTk1M0M5Ljg0NjIzIDE0Ljk0OTYgOS44NDYyMyAxNC41ODg2IDkuODQ2MjMgMTMuODY1OFYxMS4xOTA4QzkuODQ2MjMgMTAuOTY2IDkuODQ2MjMgMTAuODUzNyA5Ljc3NDc3IDEwLjc4NDJDOS43MDMzMiAxMC43MTQ2IDkuNTg3ODEgMTAuNzE0NiA5LjM1NjgxIDEwLjcxNDZINy44NDQ0OUM2LjY1OTExIDEwLjcwODkgNi4wMzk1IDEwLjY2MjMgNS43ODc5NCAxMC4yNDEzQzUuNTA0MDcgOS43NjgwMyA1Ljg3NDA4IDkuMTM0NzUgNi42MTQwOCA3Ljg2OTEyTDguOTMxMDEgMy45MDA4M0M5LjI5ODA4IDMuMjcyMyA5LjQ4MjEgMi45NTcwOCA5LjY2NDE2IDMuMDA0N1oiIGZpbGw9IiM3MzgxOEIiLz4KPGRlZnM+CjxmaWx0ZXIgaWQ9ImZpbHRlcjBfZl8xOTI4XzMwIiB4PSIwLjc2OTI4NyIgeT0iMC44NDU3MDMiIHdpZHRoPSIxNy4yMzA3IiBoZWlnaHQ9IjE3LjIzMDUiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KPGZlRmxvb2QgZmxvb2Qtb3BhY2l0eT0iMCIgcmVzdWx0PSJCYWNrZ3JvdW5kSW1hZ2VGaXgiLz4KPGZlQmxlbmQgbW9kZT0ibm9ybWFsIiBpbj0iU291cmNlR3JhcGhpYyIgaW4yPSJCYWNrZ3JvdW5kSW1hZ2VGaXgiIHJlc3VsdD0ic2hhcGUiLz4KPGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iMiIgcmVzdWx0PSJlZmZlY3QxX2ZvcmVncm91bmRCbHVyXzE5MjhfMzAiLz4KPC9maWx0ZXI+CjwvZGVmcz4KPC9zdmc+"/></span>
    </div>`;
      }
    }
    return '';
  }
  const isEnded = detailData.farmList[0].status == 'Ended';
  const needForbidden =
    (FARM_BLACK_LIST_V2 || []).indexOf(pool.id.toString()) > -1;
  return (
    <div className="bg-cardBg rounded-2xl p-5 mt-5">
      <div className="flex justify-between items-center text-sm text-primaryText">
        <div className="flex items-center">
          <FormattedMessage id="your_power" />
          <div
            className="text-white text-right ml-1"
            data-class="reactTip"
            data-for="powerTipId"
            data-place="top"
            data-html={true}
            data-tip={getPowerTip()}
          >
            <QuestionMark></QuestionMark>
            <ReactTooltip
              id="powerTipId"
              backgroundColor="#1D2932"
              border
              borderColor="#7e8a93"
              effect="solid"
            />
          </div>
        </div>
        <div className="flex items-center text-xl text-white">
          <div
            data-class="reactTip"
            data-for="powerDetailId"
            data-place="top"
            data-html={true}
            data-tip={getPowerDetail()}
          >
            <div className="flex items-center">
              <span>{showLpPower()}</span>
              <span className="text-sm text-primaryText ml-1.5">
                {getUserLpPercent()}
              </span>
            </div>

            <ReactTooltip
              id="powerDetailId"
              backgroundColor="#1D2932"
              border
              borderColor="#7e8a93"
              effect="solid"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-primaryText">
          <FormattedMessage id="value"></FormattedMessage>
        </span>
        <span className="text-base text-white">
          {Number(yourTvl) == 0
            ? '-'
            : '$' + toInternationalCurrencySystem(yourTvl, 2)}
        </span>
      </div>
      <div
        className={`stakeEntryArea ${
          !isSignedIn || (isEnded && Number(freeAmount) == 0) ? 'hidden' : ''
        }`}
      >
        <div className="pt-5 mt-5  border-t  border-borderGreyColor border-opacity-20">
          {min_locking_duration_sec == 0 || FARM_LOCK_SWITCH == 0 ? (
            <div className="flex justify-between items-center xs:flex-col md:flex-col">
              {isEnded ? null : (
                <div className="flex justify-start flex-wrap text-farmText text-sm xs:mb-3 md:mb-3">
                  <label className="text-white mx-1">
                    {displayLpBalance()}
                  </label>{' '}
                  <FormattedMessage id="available_to_stake" />
                </div>
              )}
              <div className="flex justify-end flex-grow">
                <GradientButton
                  onClick={() => {
                    openStakeModalVisible('free');
                  }}
                  color="#fff"
                  disabled={needForbidden ? true : false}
                  className={`w-36 h-8 text-center text-sm text-white focus:outline-none mr-3 ${
                    needForbidden ? 'opacity-40 cursor-not-allowed' : ''
                  } ${isEnded ? 'hidden' : ''}`}
                >
                  <FormattedMessage id="stake"></FormattedMessage>
                </GradientButton>
                <OprationButton
                  onClick={() => {
                    openUnStakeModalVisible('free');
                  }}
                  color="#fff"
                  minWidth="9rem"
                  className={`flex items-center justify-center min-w-36 h-8 px-0.5 text-center text-sm text-white focus:outline-none font-semibold bg-bgGreyDefault hover:bg-bgGreyHover ${
                    Number(freeAmount) > 0 ? '' : 'hidden'
                  }`}
                >
                  <FormattedMessage id="unstake" defaultMessage="Unstake" />
                </OprationButton>
              </div>
            </div>
          ) : (
            <>
              {isEnded ? null : (
                <div className="flex flex-wrap justify-start text-farmText text-sm mb-4">
                  <FormattedMessage id="you_have" />{' '}
                  <label className="text-white mx-1">
                    {displayLpBalance()}
                  </label>{' '}
                  <FormattedMessage id="available_to_stake" />
                </div>
              )}
              <div className="flex items-start justify-between">
                <div className="freeBox rounded-lg bg-boostBg w-1 flex-grow mr-3 px-3.5 pt-5">
                  <div className="center">
                    {Number(freeAmount) > 0 ? (
                      <>
                        <CommonLine title="lp_tokens">
                          <span className="text-white text-sm">
                            {displayLp(freeAmount)}
                          </span>
                        </CommonLine>
                        <CommonLine title="Rewards">
                          <span className="text-white text-sm">
                            {displayRewards('free')}
                          </span>
                        </CommonLine>
                        <CommonLine title="stake_for">
                          <span className="text-white text-sm">
                            <FormattedMessage id="free" />
                          </span>
                        </CommonLine>
                        <div className="flex justify-end">
                          <span
                            onClick={() => {
                              openStakeModalVisible('freeToLock');
                            }}
                            className={`text-greenColor text-sm cursor-pointer ${
                              isEnded ? 'hidden' : ''
                            }`}
                          >
                            <FormattedMessage id="change_to_lock" /> {'>'}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="freeEmpty flex flex-col items-center mb-12">
                        <span className="my-8">
                          <FreeIcon></FreeIcon>
                        </span>
                        <span className="text-sm text-primaryText">
                          <FormattedMessage id="unstaked_anytime_no_booster" />
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="my-3">
                    {Number(freeAmount) > 0 ? (
                      <div
                        className={`flex ${
                          isEnded ? 'justify-center' : 'justify-between'
                        }`}
                      >
                        <GradientButton
                          onClick={() => {
                            openStakeModalVisible('free');
                          }}
                          color="#fff"
                          className={`w-1/2 h-8 text-center text-sm text-white focus:outline-none mr-3 ${
                            isEnded ? 'hidden' : ''
                          }`}
                        >
                          <FormattedMessage id="stake"></FormattedMessage>
                        </GradientButton>
                        <OprationButton
                          onClick={() => {
                            openUnStakeModalVisible('free');
                          }}
                          color="#fff"
                          className={`flex items-center justify-center w-1/2 h-8 text-center text-sm text-white focus:outline-none font-semibold bg-bgGreyDefault hover:bg-bgGreyHover`}
                        >
                          <FormattedMessage
                            id="unstake"
                            defaultMessage="Unstake"
                          />
                        </OprationButton>
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <GradientButton
                          onClick={() => {
                            openStakeModalVisible('free');
                          }}
                          color="#fff"
                          className={`w-1/2 h-8 text-center text-sm text-white focus:outline-none mr-3 ${
                            isEnded ? 'hidden' : ''
                          }`}
                        >
                          <FormattedMessage id="stake"></FormattedMessage>
                        </GradientButton>
                      </div>
                    )}
                  </div>
                </div>
                <div className="lockBox rounded-lg bg-boostBg w-1 flex-grow px-3.5">
                  <div className="flex items-center justify-center bg-lockTitleBg h-6 text-white text-sm rounded-b-lg w-40 mx-auto mb-3">
                    <FormattedMessage id="locking_stake" />
                  </div>
                  <div className="center">
                    {Number(lockAmount) > 0 ? (
                      <div>
                        <CommonLine title="lp_tokens">
                          <span className="text-white text-sm">
                            {displayLp(lockAmount)}
                          </span>
                        </CommonLine>
                        <CommonLine title="Rewards">
                          <span className="text-white text-sm">
                            {displayRewards('lock')}
                          </span>
                        </CommonLine>
                        <CommonLine title="booster">
                          <div
                            title={new BigNumber(xlocked_amount)
                              .dividedBy(lockAmount)
                              .toFixed()}
                            className="flex items-center text-white text-sm"
                          >
                            x{displayBooster()} <LightningIcon></LightningIcon>
                          </div>
                        </CommonLine>
                        <CommonLine title="stake_for">
                          <div className="flex flex-col items-center text-white text-sm">
                            {displayDuration()}
                          </div>
                        </CommonLine>
                        <CommonLine title="exit_fee">
                          <div className="flex items-center text-white text-sm">
                            {getExitFee()} <FormattedMessage id="lp_tokens" />
                            <div
                              className="text-white text-right ml-1"
                              data-class="reactTip"
                              data-for="exitfeeId"
                              data-place="top"
                              data-html={true}
                              data-tip={getExitFeeTip()}
                            >
                              <QuestionMark></QuestionMark>
                              <ReactTooltip
                                id="exitfeeId"
                                backgroundColor="#1D2932"
                                border
                                borderColor="#7e8a93"
                                effect="solid"
                              />
                            </div>
                          </div>
                        </CommonLine>
                      </div>
                    ) : (
                      <div className="lockEmpty flex flex-col items-center">
                        <div className="flex items-center justify-center my-6">
                          <LockIcon></LockIcon>
                        </div>
                        <p className="text-primaryText text-sm text-center">
                          <FormattedMessage id="lock_your_lp_tokens_with_booster" />
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="my-3">
                    {Number(lockAmount) > 0 ? (
                      <div className="flex items-center justify-center ">
                        <GradientButton
                          onClick={() => {
                            openStakeModalVisible('lock');
                          }}
                          color="#fff"
                          className={`w-1/2 h-8 text-center text-sm text-white focus:outline-none mr-3 ${
                            isEnded ? 'hidden' : ''
                          }`}
                        >
                          <FormattedMessage id="stake"></FormattedMessage>
                        </GradientButton>
                        <OprationButton
                          onClick={() => {
                            openUnStakeModalVisible('lock');
                          }}
                          color="#fff"
                          className={`flex items-center justify-center w-36 h-8 text-center text-base text-white focus:outline-none font-semibold bg-bgGreyDefault hover:bg-bgGreyHover`}
                        >
                          <LockImgIcon></LockImgIcon>
                          <FormattedMessage
                            id="unlock"
                            defaultMessage="Unlock"
                          />
                        </OprationButton>
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <GradientButton
                          onClick={() => {
                            openStakeModalVisible('lock');
                          }}
                          color="#fff"
                          className={`w-1/2 h-8 text-center text-sm text-white focus:outline-none mr-3 ${
                            isEnded ? 'hidden' : ''
                          }`}
                        >
                          <FormattedMessage id="stake"></FormattedMessage>
                        </GradientButton>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {stakeModalVisible ? (
        <StakeModal
          title="stake"
          isOpen={stakeModalVisible}
          detailData={detailData}
          onRequestClose={closeStakeModalVisible}
          lpBalance={lpBalance}
          stakeType={stakeType}
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
          title={unStakeType == 'free' ? 'unstake' : 'unlock'}
          isOpen={unStakeModalVisible}
          titleIcon={unStakeType == 'free' ? '' : <LockImgIcon />}
          detailData={detailData}
          onRequestClose={closeUnStakeModalVisible}
          unStakeType={unStakeType}
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
function StakeModal(props: {
  title: string;
  isOpen: boolean;
  detailData: Seed;
  onRequestClose: Function;
  lpBalance: string;
  stakeType: string;
  serverTime: number;
  tokenPriceList: any;
  loveSeed: Seed;
  boostConfig: BoostConfig;
  user_seeds_map: Record<string, UserSeedInfo>;
  user_unclaimed_token_meta_map: Record<string, any>;
  user_unclaimed_map: Record<string, any>;
}) {
  const {
    title,
    isOpen,
    onRequestClose,
    detailData,
    lpBalance,
    stakeType,
    serverTime,
    tokenPriceList,
    loveSeed,
    boostConfig,
    user_seeds_map,
    user_unclaimed_token_meta_map,
    user_unclaimed_map,
  } = props;
  const {
    pool,
    min_locking_duration_sec,
    total_seed_amount,
    total_seed_power,
    min_deposit,
    seed_id,
  } = detailData;
  const DECIMALS = new Set(STABLE_POOL_IDS || []).has(pool.id?.toString())
    ? LP_STABLE_TOKEN_DECIMALS
    : LP_TOKEN_DECIMALS;

  const {
    free_amount = '0',
    locked_amount = '0',
    x_locked_amount = '0',
    unlock_timestamp,
    duration_sec,
  } = user_seeds_map[seed_id] || {};
  const freeAmount = toReadableNumber(DECIMALS, free_amount);
  const lockedAmount = toReadableNumber(DECIMALS, locked_amount);
  const [amount, setAmount] = useState(
    stakeType == 'freeToLock' ? freeAmount : ''
  );
  const [stakeLoading, setStakeLoading] = useState(false);
  const [amountAvailableCheck, setAmountAvailableCheck] = useState(true);
  const [lockDataList, setLockDataList] = useState<Lock[]>([]);
  const [selectedLockData, setSelectedLockData] = useState<Lock>(null);
  const [selectedLockPrice, setSelectedLockPrice] = useState('');
  const [acceptSlashPolicy, setAcceptSlashPolicy] = useState<boolean>(false);
  const [showCalc, setShowCalc] = useState(false);
  const [ROI, setROI] = useState('');
  const [estimatedRewards, setEstimatedRewards] = useState<any[]>();
  const intl = useIntl();
  useEffect(() => {
    if (stakeType !== 'free') {
      const goldList = [
        <GoldLevel1></GoldLevel1>,
        <GoldLevel2></GoldLevel2>,
        <GoldLevel3></GoldLevel3>,
        <GoldLevel4></GoldLevel4>,
      ];
      const lockable_duration_month = [1, 3, 6, 12];
      const lockable_duration_second = lockable_duration_month.map(
        (duration: number, index: number) => {
          return {
            second: duration * 2592000,
            month: duration,
            icon: goldList[index],
          };
        }
      );
      let restTime_sec = 0;
      const user_seed = user_seeds_map[seed_id];
      if (user_seed.unlock_timestamp) {
        restTime_sec = new BigNumber(user_seed.unlock_timestamp)
          .minus(serverTime)
          .dividedBy(1000000000)
          .toNumber();
      }
      get_config().then((config) => {
        const list: any = [];
        const { maximum_locking_duration_sec, max_locking_multiplier } = config;
        lockable_duration_second.forEach(
          (item: { second: number; month: number; icon: any }, index) => {
            if (
              item.second >= Math.max(min_locking_duration_sec, restTime_sec) &&
              item.second <= maximum_locking_duration_sec
            ) {
              const locking_multiplier =
                ((max_locking_multiplier - 10000) * item.second) /
                (maximum_locking_duration_sec * 10000);
              list.push({
                ...item,
                multiplier: locking_multiplier,
              });
            }
          }
        );
        setLockDataList(list);
        setSelectedLockData(list[0]);
      });
    }
  }, [stakeType]);
  useEffect(() => {
    getSelectedLockRewardsData();
  }, [amount, selectedLockData]);
  const displaySymbols = () => {
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
  };
  const displayImgs = () => {
    const tokenList: any[] = [];
    (pool.tokens_meta_data || []).forEach(
      (token: TokenMetadata, index: number) => {
        tokenList.push(
          <label
            key={token.id}
            className={`h-8 w-8 rounded-full overflow-hidden border border-gradientFromHover bg-cardBg ${
              index != 0 ? '-ml-1.5' : ''
            }`}
          >
            <img src={token.icon} className="w-full h-full"></img>
          </label>
        );
      }
    );
    return tokenList;
  };
  function getSelectedLockRewardsData() {
    if (
      !(
        Number(amount) > 0 &&
        stakeType != 'free' &&
        min_locking_duration_sec > 0 &&
        FARM_LOCK_SWITCH != 0 &&
        selectedLockData
      )
    ) {
      setSelectedLockPrice('$ -');
      setROI('- %');
      const tempTokenMap = {};
      detailData.farmList.forEach((farm: FarmBoost) => {
        const token = farm.token_meta_data;
        tempTokenMap[token.id] = token;
      });
      setEstimatedRewards(Object.values(tempTokenMap));
      return;
    }
    // get total rewards price per day
    const DECIMALS = new Set(STABLE_POOL_IDS || []).has(pool.id?.toString())
      ? LP_STABLE_TOKEN_DECIMALS
      : LP_TOKEN_DECIMALS;
    const totalSeedAmountPower = toReadableNumber(DECIMALS, total_seed_power);
    const x_amount = new BigNumber(
      selectedLockData.multiplier + 1
    ).multipliedBy(amount);
    const totalStakePower = new BigNumber(x_amount)
      .plus(totalSeedAmountPower)
      .toString();
    const day = selectedLockData.month * 30;
    const farms = detailData.farmList;
    let totalPrice = 0;
    let tokenList: any[] = [];
    farms.forEach((farm: FarmBoost) => {
      const token = farm.token_meta_data;
      const { id, decimals } = token;
      const { daily_reward } = farm.terms;
      const dailyReward = toReadableNumber(decimals, daily_reward);
      const perDayAndLp = new BigNumber(dailyReward).dividedBy(
        new BigNumber(totalStakePower)
      );
      let rewardTokenNum;
      if (perDayAndLp.isEqualTo('0')) {
        rewardTokenNum = new BigNumber(dailyReward).multipliedBy(day).toFixed();
      } else {
        rewardTokenNum = perDayAndLp
          .multipliedBy(day)
          .multipliedBy(x_amount)
          .toFixed();
      }
      const priceData = tokenPriceList[id]?.price;
      let tokenPrice = '0';
      if (priceData) {
        tokenPrice = new BigNumber(rewardTokenNum)
          .multipliedBy(priceData)
          .toString();
      }
      totalPrice += Number(tokenPrice);
      tokenList.push({
        ...token,
        num: rewardTokenNum,
      });
    });
    // get total display price
    const lastPrice = totalPrice;
    let display = '';
    if (new BigNumber('0').isEqualTo(lastPrice)) {
      display = '$ -';
    } else if (new BigNumber('0.001').isGreaterThan(lastPrice)) {
      display = '<$ 0.001';
    } else {
      display = `$${toInternationalCurrencySystem(lastPrice.toString(), 3)}`;
    }
    setSelectedLockPrice(display);
    // get total display number / remove repeated rewards
    const tokenMap = {};
    tokenList.forEach((token: TokenMetadata & { num: string }) => {
      const curToken = tokenMap[token.id];
      if (curToken) {
        curToken.num = Number(curToken.num) + Number(token.num);
      } else {
        tokenMap[token.id] = token;
      }
    });
    tokenList = Object.values(tokenMap);
    setEstimatedRewards(tokenList);
    // get ROI
    const { shares_total_supply, tvl } = pool;
    const totalShares = Number(toReadableNumber(DECIMALS, shares_total_supply));
    const shareUsd = new BigNumber(amount)
      .multipliedBy(tvl)
      .dividedBy(totalShares)
      .toFixed();
    let aprActual = new BigNumber(totalPrice)
      .dividedBy(shareUsd)
      .multipliedBy(100);
    let aprDisplay;
    if (new BigNumber('0.001').isGreaterThan(aprActual)) {
      aprDisplay = '<0.001%';
    } else {
      aprDisplay = aprActual.toFixed(3, 1) + '%';
    }
    setROI(aprDisplay);
  }
  function displayNum(num: string) {
    if (!num) return '-';
    let resultRewardTokenNum;
    if (new BigNumber('0.001').isGreaterThan(num)) {
      resultRewardTokenNum = '<0.001';
    } else {
      resultRewardTokenNum = toInternationalCurrencySystem(num.toString(), 3);
    }
    return resultRewardTokenNum;
  }
  function changeAmount(value: string) {
    setAmount(value);
    // check
    const curValue = toNonDivisibleNumber(DECIMALS, value);
    if (value && new BigNumber(curValue).isLessThan(min_deposit)) {
      setAmountAvailableCheck(false);
    } else {
      setAmountAvailableCheck(true);
    }
  }
  function operationStake() {
    setStakeLoading(true);
    if (stakeType == 'freeToLock') {
      lock_free_seed({
        seed_id: detailData.seed_id,
        amount: toNonDivisibleNumber(DECIMALS, amount),
        duration_sec: selectedLockData.second,
      });
    } else {
      let msg = '';
      if (
        stakeType == 'free' ||
        min_locking_duration_sec == 0 ||
        FARM_LOCK_SWITCH == 0
      ) {
        msg = JSON.stringify('Free');
      } else if (stakeType == 'lock') {
        msg = JSON.stringify({
          Lock: {
            duration_sec: selectedLockData.second,
          },
        });
      }
      stake_boost({
        token_id: getMftTokenId(pool.id.toString()),
        amount: toNonDivisibleNumber(DECIMALS, amount),
        msg,
      });
    }
  }
  function getMultiplier(muti: number) {
    if (muti) {
      return Number(toPrecision(muti.toString(), 2)) + 1;
    }
    return '';
  }
  function getFinalUnLockTime() {
    if (!selectedLockData) return '';
    if (serverTime) {
      const temp_timestamp =
        serverTime / 1000000 + selectedLockData.second * 1000;
      const endLineArr = (new Date(temp_timestamp).toString() || '').split(' ');
      return `${endLineArr[2]} ${endLineArr[1]}, ${endLineArr[3]}`;
    }
    return '';
  }
  function FinalMuti() {
    if (!selectedLockData) return '';
    let preMuti = '0';
    if (+locked_amount) {
      preMuti = new BigNumber(x_locked_amount)
        .dividedBy(locked_amount)
        .toFixed();
    }
    const pre_x_locked_amount = toReadableNumber(DECIMALS, x_locked_amount);
    const pre_locked_amount = toReadableNumber(DECIMALS, locked_amount);
    const curMuti = selectedLockData.multiplier + 1;
    if (+curMuti > +preMuti) {
      return toPrecision(curMuti.toString(), 2);
    } else {
      const cur_x_locked_amount = new BigNumber(amount || 0).multipliedBy(
        curMuti
      );
      const k = cur_x_locked_amount.toFixed();

      const total_x_locked_amount =
        cur_x_locked_amount.plus(pre_x_locked_amount);
      const y = total_x_locked_amount.toFixed();

      const total_locked_amount = new BigNumber(pre_locked_amount).plus(
        +amount || 0
      );
      const z = total_locked_amount.toFixed();

      const final_x = total_x_locked_amount
        .dividedBy(total_locked_amount)
        .toFixed();
      return final_x;
      // return toPrecision(final_x.toString(), 2);
    }
  }
  function appendTip() {
    const tip = intl.formatMessage({ id: 'appendTip' });
    let result: string = `<div class="text-navHighLightText text-xs w-52 text-left">${tip}</div>`;
    return result;
  }
  const finalMuti = FinalMuti();
  const isDisabled =
    !amount ||
    !amountAvailableCheck ||
    new BigNumber(amount).isLessThanOrEqualTo(0) ||
    (stakeType !== 'freeToLock' &&
      new BigNumber(amount).isGreaterThan(lpBalance)) ||
    (stakeType == 'freeToLock' &&
      new BigNumber(amount).isGreaterThan(freeAmount)) ||
    (stakeType !== 'free' &&
      min_locking_duration_sec > 0 &&
      FARM_LOCK_SWITCH != 0 &&
      !acceptSlashPolicy);
  return (
    <CommonModal title={title} isOpen={isOpen} onRequestClose={onRequestClose}>
      <div className="flex justify-between items-center mt-6">
        <div className="flex items-center">
          <span className="flex">{displayImgs()}</span>
          <span className="flex items-center cursor-pointer text-white font-bold text-base ml-4 xs:text-sm md:text-sm">
            {displaySymbols()}
          </span>
        </div>
        <div className="text-farmText text-sm">
          {stakeType == 'freeToLock'
            ? toPrecision(freeAmount, 6)
            : toPrecision(lpBalance, 6)}
        </div>
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
              changeAmount(stakeType == 'freeToLock' ? freeAmount : lpBalance);
            }}
            className={`text-xs text-farmText px-1.5 py-0.5 rounded-lg border cursor-pointer hover:text-greenColor hover:border-greenColor ${
              amount == (stakeType == 'freeToLock' ? freeAmount : lpBalance)
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
              toReadableNumber(DECIMALS, min_deposit)
            }
          />
        </div>
      )}
      {stakeType == 'free' ||
      min_locking_duration_sec == 0 ||
      FARM_LOCK_SWITCH == 0 ? null : (
        <div className="boostArea">
          <div className="flex justify-between items-center mb-1.5 mt-5">
            <p className="text-farmText text-sm">
              <FormattedMessage id="estimated_rewards" />
            </p>
          </div>
          <div>
            <div className="relative bg-black bg-opacity-20 rounded-lg px-6 pb-14 pt-10">
              <div className="absolute text-farmText text-sm top-3 left-6">
                <FormattedMessage id="booster"></FormattedMessage>
              </div>
              <div
                className={`flex items-center justify-center ${
                  lockDataList.length == 1 ? 'mb-6' : 'mb-8'
                }`}
                style={{ height: '120px' }}
              >
                <div className="text-white mr-10">{selectedLockData?.icon}</div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center">
                    <span className="text-white text-3xl ml-2">
                      x{getMultiplier(selectedLockData?.multiplier)}
                    </span>
                    <BigLightningIcon></BigLightningIcon>
                  </div>
                  <span className="text-white text-lg">
                    <FormattedMessage id="Rewards"></FormattedMessage>
                  </span>
                </div>
              </div>
              {lockDataList.length == 1 ? null : (
                <>
                  <div className="flex items-center text-farmText text-sm mb-5">
                    <FormattedMessage id="stake_for"></FormattedMessage>
                    <div
                      className={`text-white text-right ml-1 ${
                        Number(locked_amount) > 0 ? '' : 'hidden'
                      }`}
                      data-class="reactTip"
                      data-for={'durationId'}
                      data-place="top"
                      data-html={true}
                      data-tip={appendTip()}
                    >
                      <QuestionMark></QuestionMark>
                      <ReactTooltip
                        id={'durationId'}
                        backgroundColor="#1D2932"
                        border
                        borderColor="#7e8a93"
                        effect="solid"
                      />
                    </div>
                  </div>
                  <div className="flex items-center px-4">
                    {lockDataList.map((item: Lock, index: number) => {
                      return (
                        <div
                          key={index}
                          className={`flex items-center  mb-16 relative ${
                            index == 0
                              ? 'w-0'
                              : lockDataList.length == 2
                              ? 'w-full'
                              : 'w-1/' + (lockDataList.length - 1)
                          }`}
                        >
                          <div
                            style={{ height: '5px' }}
                            className={`rounded-lg w-full  ${
                              selectedLockData?.month >= item.month
                                ? 'bg-greenColor'
                                : 'bg-darkBg'
                            }`}
                          ></div>
                          <div
                            className={`absolute right-0 flex flex-col items-center transform translate-x-1/2 z-10`}
                          >
                            <label
                              className={`text-white text-sm h-5 whitespace-nowrap ${
                                selectedLockData?.month == item.month
                                  ? 'invisible'
                                  : 'invisible'
                              }`}
                            >
                              {selectedLockPrice}
                            </label>
                            <span
                              onClick={() => {
                                setSelectedLockData(item);
                              }}
                              style={{ width: '21px', height: '21px' }}
                              className={`rounded-full my-2 cursor-pointer ${
                                selectedLockData?.month >= item.month
                                  ? 'bg-greenColor'
                                  : 'bg-darkBg'
                              } `}
                            ></span>
                            <label
                              className={`text-sm whitespace-nowrap ${
                                selectedLockData?.month == item.month
                                  ? 'text-white'
                                  : 'text-farmText'
                              }`}
                            >
                              {item.month} M
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
              <div className="flex flex-col w-full">
                {lockDataList.length == 1 ? (
                  <div
                    className={`flex justify-between items-center w-full mb-3.5`}
                  >
                    <div className="flex items-center">
                      <span className="text-farmText text-sm">
                        <FormattedMessage id="stake_for"></FormattedMessage>
                      </span>
                      <div
                        className={`text-white text-right ml-1 ${
                          Number(locked_amount) > 0 ? '' : 'hidden'
                        }`}
                        data-class="reactTip"
                        data-for={'durationId'}
                        data-place="top"
                        data-html={true}
                        data-tip={appendTip()}
                      >
                        <QuestionMark></QuestionMark>
                        <ReactTooltip
                          id={'durationId'}
                          backgroundColor="#1D2932"
                          border
                          borderColor="#7e8a93"
                          effect="solid"
                        />
                      </div>
                    </div>
                    <span className="text-white text-sm">
                      {selectedLockData?.month || '-'} M
                    </span>
                  </div>
                ) : null}
                <div className="flex justify-between items-center w-full">
                  <span className="text-farmText text-sm">
                    <FormattedMessage id="cur_apr"></FormattedMessage>
                  </span>
                  <span className="text-white text-sm">{ROI}</span>
                </div>
                <div className="flex justify-between items-center w-full mt-3.5">
                  <span className="text-farmText text-sm">
                    <FormattedMessage id="value_rewards_token" />
                  </span>
                  <span className="text-white text-sm">
                    {selectedLockPrice}
                  </span>
                </div>
                <div className="flex flex-col items-start w-full mt-3.5">
                  <span className="text-farmText text-sm">
                    <FormattedMessage id="reward_token"></FormattedMessage>
                  </span>
                  <div className="grid grid-cols-3 gap-2 mt-3 w-full">
                    {(estimatedRewards || []).map((item: any) => {
                      return (
                        <div className="flex items-center" key={item.symbol}>
                          <img
                            className="w-6 h-6 xs:w-5 xs:h-5 md:w-5 md:h-5 rounded-full border border-gradientFromHover"
                            src={item.icon}
                          ></img>
                          <label className="ml-2 text-sm text-farmText">
                            {displayNum(item.num)}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className="">
              {Number(lockedAmount) == 0 ? (
                <div className="flex justify-between items-center mt-3.5">
                  <span className="text-farmText text-sm">
                    <FormattedMessage id="end_locking_period"></FormattedMessage>
                  </span>
                  <span className="text-white text-sm">
                    {getFinalUnLockTime()}
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mt-3.5">
                    <span className="text-farmText text-sm">
                      <FormattedMessage id="final_booster" />
                    </span>
                    <span
                      title={finalMuti}
                      className="flex items-center text-white text-sm"
                    >
                      x{toPrecision(finalMuti.toString(), 2)}{' '}
                      <LightningIcon></LightningIcon>
                    </span>
                  </div>
                  <div
                    className={`text-center p-3 border border-greenColor rounded-lg text-sm text-white mt-5 ${
                      Number(amount) > 0 ? '' : 'hidden'
                    }`}
                  >
                    <FormattedMessage id="existing_amount" />{' '}
                    <span className="text-greenColor">
                      {toPrecision(lockedAmount, 3)}
                    </span>{' '}
                    + <FormattedMessage id="append_amount" />{' '}
                    <span className="text-greenColor">
                      {toPrecision(amount, 3)}
                    </span>{' '}
                    <FormattedMessage id="will_be_able_to_unstaked_after" />{' '}
                    <span className="text-greenColor">
                      {getFinalUnLockTime()}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="mt-5">
        <GradientButton
          onClick={operationStake}
          color="#fff"
          disabled={stakeLoading || isDisabled}
          loading={stakeLoading || isDisabled}
          btnClassName={`${isDisabled ? 'cursor-not-allowed' : ''}`}
          className={`w-full h-14 text-center text-lg text-white focus:outline-none font-semibold`}
        >
          <ButtonTextWrapper
            loading={stakeLoading}
            Text={() => <FormattedMessage id="stake" />}
          />
        </GradientButton>
      </div>
      {stakeType == 'free' ? (
        <div className="flex flex-col items-center justify-center mt-5">
          <div
            className="flex items-center justify-center mb-4 cursor-pointer"
            onClick={() => {
              setShowCalc(!showCalc);
            }}
          >
            <Calc></Calc>
            <label className="text-sm text-farmText ml-3 mr-4  cursor-pointer">
              <FormattedMessage id="calculate_roi"></FormattedMessage>
            </label>
            <label
              className={
                'text-farmText cursor-pointer ' +
                (showCalc ? 'transform rotate-180' : '')
              }
            >
              <ArrowDownHollow></ArrowDownHollow>
            </label>
          </div>
          <div className={'w-full ' + (showCalc ? 'block' : 'hidden')}>
            <CalcEle
              seed={detailData}
              tokenPriceList={tokenPriceList}
              lpTokenNumAmount={amount}
              loveSeed={loveSeed}
              boostConfig={boostConfig}
              user_seeds_map={user_seeds_map}
              user_unclaimed_map={user_unclaimed_map}
              user_unclaimed_token_meta_map={user_unclaimed_token_meta_map}
            ></CalcEle>
          </div>
        </div>
      ) : null}
      {stakeType == 'free' ||
      min_locking_duration_sec == 0 ||
      FARM_LOCK_SWITCH == 0 ? null : (
        <div className={`flex items-center justify-start mt-4`}>
          <div className="flex items-start">
            <span
              className="mr-3 cursor-pointer mt-1"
              onClick={() => {
                setAcceptSlashPolicy(!acceptSlashPolicy);
              }}
            >
              {acceptSlashPolicy ? (
                <CheckboxSelected></CheckboxSelected>
              ) : (
                <Checkbox></Checkbox>
              )}
            </span>
            <div className="flex flex-col">
              <label className="text-white text-sm">
                <FormattedMessage id="accept_pay_slash_tip"></FormattedMessage>
              </label>
              <p className="text-xs text-primaryText mt-1">
                <FormattedMessage id="slash_policy_content" />
              </p>
            </div>
          </div>
        </div>
      )}
    </CommonModal>
  );
}

function UnStakeModal(props: {
  title: string;
  isOpen: boolean;
  detailData: Seed;
  unStakeType: string;
  onRequestClose: Function;
  serverTime: number;
  tokenPriceList: any;
  titleIcon?: any;
  user_seeds_map: Record<string, UserSeedInfo>;
  user_unclaimed_token_meta_map: Record<string, any>;
  user_unclaimed_map: Record<string, any>;
}) {
  const {
    title,
    titleIcon,
    isOpen,
    onRequestClose,
    detailData,
    unStakeType,
    serverTime,
    tokenPriceList,
    user_seeds_map,
    user_unclaimed_token_meta_map,
    user_unclaimed_map,
  } = props;
  const [amount, setAmount] = useState('');
  const [unStakeLoading, setUnStakeLoading] = useState(false);
  const [acceptSlashPolicy, setAcceptSlashPolicy] = useState<boolean>(false);
  const { pool, seed_id, slash_rate } = detailData;
  const {
    free_amount = '0',
    locked_amount = '0',
    x_locked_amount = '0',
    unlock_timestamp,
    duration_sec,
  } = user_seeds_map[seed_id] || {};
  const DECIMALS = new Set(STABLE_POOL_IDS || []).has(pool.id?.toString())
    ? LP_STABLE_TOKEN_DECIMALS
    : LP_TOKEN_DECIMALS;
  const lpBalance =
    unStakeType == 'free'
      ? toReadableNumber(DECIMALS, free_amount)
      : toReadableNumber(DECIMALS, locked_amount);
  const lockStatus = new BigNumber(unlock_timestamp).isLessThan(serverTime);
  const slashRate = slash_rate / 10000;
  const intl = useIntl();

  function changeAmount(value: string) {
    setAmount(value);
  }
  function operationUnStake() {
    setUnStakeLoading(true);
    if (unStakeType == 'free') {
      unStake_boost({
        seed_id: seed_id,
        unlock_amount: '0',
        withdraw_amount: toNonDivisibleNumber(DECIMALS, amount),
      });
    } else if (lockStatus) {
      unStake_boost({
        seed_id: seed_id,
        unlock_amount: toNonDivisibleNumber(DECIMALS, amount),
        withdraw_amount: '0',
      });
    } else {
      force_unlock({
        seed_id: seed_id,
        unlock_amount: toNonDivisibleNumber(DECIMALS, amount),
      });
    }
  }
  function displayStatus() {
    if (lockStatus) {
      return (
        <span className="text-white text-sm">
          <FormattedMessage id="expired" />
        </span>
      );
    } else {
      return (
        <span className="flex items-center text-warnColor text-sm">
          <FormattedMessage id="not_expired" />
        </span>
      );
    }
  }
  function displayDate() {
    const endLineArr = (
      new Date(+unlock_timestamp / 1000000).toString() || ''
    ).split(' ');
    return `${endLineArr[2]} ${endLineArr[1]}, ${endLineArr[3]}`;
  }
  function getSlashAmount() {
    let result = '0';
    if (+unlock_timestamp > serverTime) {
      const restTime_sec = new BigNumber(unlock_timestamp)
        .minus(serverTime)
        .dividedBy(1000000000)
        .toNumber();
      const slashAmount =
        (restTime_sec / duration_sec) * slashRate * Number(amount);
      if (new BigNumber(slashAmount).isLessThan(0.001)) {
        result = '< 0.001';
      } else {
        result = `${toPrecision(slashAmount.toString(), 3)}`;
      }
    }
    return result;
  }
  function showSlashTip() {
    const tip = intl.formatMessage({ id: 'slash_tip' });
    let result: string = `<div class="text-navHighLightText text-xs w-52 text-left">${tip}</div>`;
    return result;
  }
  function getSubChildren() {
    return (
      <div className="flex items-center justify-center mt-2.5">
        <FreenWarningIcon className="mr-1.5 flex-shrink-0"></FreenWarningIcon>
        <span className="text-sm text-farmText">
          <FormattedMessage id="unstakeTip" />
        </span>
      </div>
    );
  }
  const isDisabled =
    !amount ||
    new BigNumber(amount).isLessThanOrEqualTo(0) ||
    new BigNumber(amount).isGreaterThan(lpBalance) ||
    (unStakeType !== 'free' && !lockStatus && !acceptSlashPolicy);

  return (
    <CommonModal
      titleIcon={titleIcon ? titleIcon : null}
      title={title}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      subChildren={getSubChildren()}
    >
      <div className="flex flex-col mt-4 bg-black bg-opacity-20 rounded-lg p-4">
        <div className="flex justify-end items-center mb-3">
          <span className="text-farmText text-sm">
            <FormattedMessage id="lp_token"></FormattedMessage>:{' '}
            {toPrecision(lpBalance, 6)}
          </span>
        </div>
        <div className="flex justify-between items-center">
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
                changeAmount(lpBalance);
              }}
              className={`text-xs text-farmText px-1.5 py-0.5 rounded-lg border cursor-pointer hover:text-greenColor hover:border-greenColor ${
                amount == lpBalance
                  ? 'bg-black bg-opacity-20 border-black border-opacity-20'
                  : 'border-maxBorderColor'
              }`}
            >
              Max
            </span>
          </div>
        </div>
      </div>
      <UnClaimBox
        detailData={detailData}
        tokenPriceList={tokenPriceList}
        user_seeds_map={user_seeds_map}
        user_unclaimed_map={user_unclaimed_map}
        user_unclaimed_token_meta_map={user_unclaimed_token_meta_map}
      ></UnClaimBox>
      {unStakeType == 'free' ? null : (
        <div className="mt-4">
          <div className="flex justify-between items-center w-full mb-4">
            <span className="text-farmText text-sm">
              <FormattedMessage id="status" />
            </span>
            {displayStatus()}
          </div>
          <div className="flex justify-between items-center w-full">
            <span className="text-farmText text-sm">
              <FormattedMessage id="end_locking_period" />
            </span>
            <span className="text-white text-sm">{displayDate()}</span>
          </div>
        </div>
      )}
      {detailData.endedFarmsIsSplit && unStakeType == 'free' ? (
        <div className="flex items-center justify-center text-center rounded-lg border border-greenColor text-sm text-white p-3 mt-5">
          <FormattedMessage id="endedFarmsUnstakeTip" />
        </div>
      ) : null}
      <div className="mt-5">
        <GradientButton
          onClick={operationUnStake}
          color="#fff"
          disabled={unStakeLoading || isDisabled}
          loading={unStakeLoading || isDisabled}
          btnClassName={`${isDisabled ? 'cursor-not-allowed' : ''}`}
          className={`w-full h-14 text-center text-lg text-white focus:outline-none font-semibold`}
        >
          <ButtonTextWrapper
            loading={unStakeLoading}
            Text={() => <FormattedMessage id={title} />}
          />
        </GradientButton>
      </div>
      {unStakeType == 'free' ||
      lockStatus ||
      (!lockStatus && Number(amount) == 0) ? null : (
        <div className="flex items-center w-full justify-between rounded-md border border-warnColor bg-black bg-opacity-20 py-4 px-3 mt-4">
          <div className="flex items-center">
            <span
              className="mr-2.5 cursor-pointer"
              onClick={() => {
                setAcceptSlashPolicy(!acceptSlashPolicy);
              }}
            >
              {acceptSlashPolicy ? (
                <CheckboxSelected></CheckboxSelected>
              ) : (
                <Checkbox></Checkbox>
              )}
            </span>
            <span className="text-sm text-warnColor">
              <FormattedMessage id="i_will_pay" /> {getSlashAmount()}{' '}
              <FormattedMessage id="lp_token_slash" />
            </span>
          </div>
          <div
            className="text-white text-right ml-1"
            data-class="reactTip"
            data-for={'slashTipId' + seed_id}
            data-place="top"
            data-html={true}
            data-tip={showSlashTip()}
          >
            <QuestionMark></QuestionMark>
            <ReactTooltip
              id={'slashTipId' + seed_id}
              backgroundColor="#1D2932"
              border
              borderColor="#7e8a93"
              effect="solid"
            />
          </div>
        </div>
      )}
    </CommonModal>
  );
}
function CommonLine(props: any) {
  const { title, ...rest } = props;
  return (
    <div {...rest} className={`flex items-center justify-between mb-3`}>
      <span className="text-farmText text-sm">
        <FormattedMessage id={title}></FormattedMessage>
      </span>
      {props.children}
    </div>
  );
}
function UnClaimBox(props: {
  detailData: Seed;
  tokenPriceList: any;
  user_seeds_map: Record<string, UserSeedInfo>;
  user_unclaimed_token_meta_map: Record<string, any>;
  user_unclaimed_map: Record<string, any>;
}) {
  const [showClaim, setShowClaim] = useState(false);
  const {
    detailData,
    tokenPriceList,
    user_seeds_map,
    user_unclaimed_token_meta_map,
    user_unclaimed_map,
  } = props;
  const { seed_id } = detailData;
  const unclaimed = user_unclaimed_map[seed_id] || {};
  const unclaimedkeys = Object.keys(unclaimed);
  function switchShowClaim() {
    setShowClaim(!showClaim);
  }
  const displayTotalPrice = () => {
    let totalPrice = 0;
    unclaimedkeys.forEach((rewardId: string) => {
      const token = user_unclaimed_token_meta_map[rewardId];
      const { id, decimals } = token;
      const amount = toReadableNumber(decimals, unclaimed[rewardId]);
      const tokenPrice = tokenPriceList[id]?.price;
      if (tokenPrice && tokenPrice != 'N/A') {
        totalPrice += +amount * tokenPrice;
      }
    });
    let result = '';
    if (new BigNumber(0).isEqualTo(totalPrice)) {
      result = '-';
    } else if (new BigNumber('0.01').isGreaterThan(totalPrice)) {
      result = '<$0.01';
    } else {
      result = `$${toInternationalCurrencySystem(totalPrice.toString(), 2)}`;
    }
    return result;
  };
  const displayTokenNumber = (rewardId: string) => {
    const meta = user_unclaimed_token_meta_map[rewardId];
    const { decimals } = meta;
    const amount = toReadableNumber(decimals, unclaimed[rewardId]);
    const curUserUnclaimedReward = new BigNumber(amount).toString();
    if (
      !curUserUnclaimedReward ||
      new BigNumber('0').isEqualTo(curUserUnclaimedReward)
    ) {
      return '-';
    } else if (new BigNumber('0.001').isGreaterThan(curUserUnclaimedReward)) {
      return '<0.001';
    } else {
      return formatWithCommas(
        new BigNumber(curUserUnclaimedReward).toFixed(3, 1)
      );
    }
  };
  if (unclaimedkeys.length == 0) return null;
  return (
    <div className="mt-7 xs:mt-4 md:mt-4">
      <div
        className="flex items-center justify-center cursor-pointer"
        onClick={switchShowClaim}
      >
        <label className="text-sm text-white ml-3 mr-4 cursor-pointer">
          <FormattedMessage id="rewards_claimed"></FormattedMessage>
        </label>
        <label
          className={
            'text-white cursor-pointer ' +
            (showClaim ? 'transform rotate-180' : '')
          }
        >
          <ArrowDownHollow></ArrowDownHollow>
        </label>
      </div>
      <div
        className={
          'rounded bg-black bg-opacity-20 p-5 mt-3.5 ' +
          (showClaim ? 'block' : 'hidden')
        }
      >
        <p className="flex justify-between items-center">
          <label className="text-sm text-farmText">
            <FormattedMessage id="value_rewards_token"></FormattedMessage>
          </label>
          <label className="text-sm text-farmText text-right">
            {displayTotalPrice()}
          </label>
        </p>
        <div className="flex flex-col mt-4">
          <label className="text-sm text-farmText">
            <FormattedMessage id="reward_token"></FormattedMessage>
          </label>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {unclaimedkeys.map((rewardId: string, index: number) => {
              return (
                <span className="flex items-center" key={index}>
                  <img
                    src={user_unclaimed_token_meta_map[rewardId]?.icon}
                    className="w-6 h-6 xs:w-5 xs:h-5 md:w-5 md:h-5 rounded-full border border-gradientFromHover"
                  ></img>{' '}
                  <label className="text-sm text-farmText ml-2.5">
                    {displayTokenNumber(rewardId)}
                  </label>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

interface Lock {
  second: number;
  month: number;
  icon: any;
  multiplier: number;
}
