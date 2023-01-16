import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useContext,
} from 'react';
import { useHistory } from 'react-router';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  get_pool,
  get_pool_old_version,
  get_liquidity,
  get_liquidity_old_version,
  get_pool_marketdepth,
  get_pool_marketdepth_old_version,
  PoolInfo,
  remove_liquidity,
} from '../../services/swapV3';
import { ReturnIcon, SwitchButton } from '~components/icon/V3';
import {
  GradientButton,
  BorderButton,
  ButtonTextWrapper,
  OprationButton,
  ConnectToNearBtn,
} from '~components/button/Button';
import { RemovePoolV3 } from '~components/pool/RemovePoolV3';
import { AddPoolV3 } from '~components/pool/AddPoolV3';
import {
  formatWithCommas,
  toPrecision,
  toReadableNumber,
  toInternationalCurrencySystem,
  percentLess,
  calculateFairShare,
  toNonDivisibleNumber,
  percent,
  checkAllocations,
} from '~utils/numbers';
import { ftGetTokenMetadata } from '../../services/ft-contract';
import { TokenMetadata } from '../../services/ft-contract';
import { useTokens } from '../../state/token';
import {
  getPriceByPoint,
  CONSTANT_D,
  UserLiquidityInfo,
  useAddAndRemoveUrlHandle,
  getXAmount_per_point_by_Lx,
  getYAmount_per_point_by_Ly,
  drawChartData,
  TOKEN_LIST_FOR_RATE,
  pause_old_dcl_claim_tip,
} from '../../services/commonV3';
import BigNumber from 'bignumber.js';
import { getTokenPriceList } from '../../services/indexer';
import { getBoostTokenPrices } from '../../services/farm';
import { getLiquidity } from '~utils/pool';
import _ from 'lodash';
import { getURLInfo } from '../../components/layout/transactionTipPopUp';
import { BlueCircleLoading } from '../../components/layout/Loading';
import ReactTooltip from 'react-tooltip';
export default function YourLiquidityDetail(props: any) {
  const [poolDetail, setPoolDetail] = useState<PoolInfo>();
  const [tokenPriceList, setTokenPriceList] = useState<Record<string, any>>();
  const [userLiquidity, setUserLiquidity] = useState<UserLiquidityInfo>();
  const [tokenXAmount, setTokenXAmount] = useState('');
  const [tokenYAmount, setTokenYAmount] = useState('');
  const [isInrange, setIsInrange] = useState<boolean>(true);
  const [showRemoveBox, setShowRemoveBox] = useState<boolean>(false);
  const [showAddBox, setShowAddBox] = useState<boolean>(false);
  const [rateSort, setRateSort] = useState<boolean>(true);
  const [claimLoading, setClaimLoading] = useState<boolean>(false);
  const [chartLoading, setChartLoading] = useState<boolean>(true);
  const history = useHistory();
  // callBack handle
  useAddAndRemoveUrlHandle();
  const { id, status } = props.match.params || {};
  const paramsId = id || '';
  const is_old_dcl = status == '1';
  const [tokenXId, tokenYId, feeV, lId] = paramsId.split('@');
  const hashId = lId;
  const poolId = `${tokenXId}|${tokenYId}|${feeV}`;
  const [token_x, token_y, fee] = poolId.split('|');
  const tokenMetadata_x_y = useTokens([token_x, token_y]);
  const [depthData, setDepthData] = useState(null);
  const chartDom = useRef(null);
  useEffect(() => {
    if (tokenMetadata_x_y) {
      const [tokenX] = tokenMetadata_x_y;
      if (TOKEN_LIST_FOR_RATE.indexOf(tokenX.symbol) > -1) {
        setRateSort(false);
      } else {
        setRateSort(true);
      }
    }
  }, [tokenMetadata_x_y?.length]);
  useEffect(() => {
    getBoostTokenPrices().then(setTokenPriceList);
    if (poolId && hashId) {
      get_user_liquidity();
      get_pool_detail();
    }
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  }, []);
  useEffect(() => {
    if (userLiquidity && poolDetail && tokenMetadata_x_y) {
      const { current_point } = poolDetail;
      const { left_point, right_point } = userLiquidity;
      if (current_point >= left_point && right_point > current_point) {
        setIsInrange(true);
      } else {
        setIsInrange(false);
      }
      get_liquidity_x_y();
      getChartData();
    }
  }, [userLiquidity, poolDetail, tokenMetadata_x_y]);
  useEffect(() => {
    if (userLiquidity && poolDetail && tokenMetadata_x_y) {
      getChartData();
    }
  }, [rateSort]);
  async function getChartData() {
    const get_pool_marketdepth_fun = is_old_dcl
      ? get_pool_marketdepth_old_version
      : get_pool_marketdepth;
    const depthData = await get_pool_marketdepth_fun(poolDetail.pool_id);
    const { left_point, right_point } = userLiquidity;
    const [tokenX, tokenY] = tokenMetadata_x_y;
    drawChartData({
      depthData,
      left_point,
      right_point,
      token_x_decimals: tokenX.decimals,
      token_y_decimals: tokenY.decimals,
      chartDom,
      sort: rateSort,
    });
    setDepthData(depthData);
    setChartLoading(false);
  }
  async function get_pool_detail() {
    const token_x = poolId.split('|')[0];
    const get_pool_fun = is_old_dcl ? get_pool_old_version : get_pool;
    const detail = await get_pool_fun(poolId, token_x);
    if (detail) {
      setPoolDetail(detail);
    }
  }
  async function get_user_liquidity() {
    const lptId = poolId + '#' + hashId;
    const get_liquidity_fun = is_old_dcl
      ? get_liquidity_old_version
      : get_liquidity;
    const l = await get_liquidity_fun(lptId);
    if (l) {
      setUserLiquidity(l);
    }
  }
  function get_liquidity_x_y() {
    const [tokenX, tokenY] = tokenMetadata_x_y;
    const { left_point, right_point, amount: L } = userLiquidity;
    const { current_point } = poolDetail;
    //  in range
    if (current_point >= left_point && right_point > current_point) {
      const tokenYAmount = getY(left_point, current_point, L, tokenY);
      const tokenXAmount = getX(current_point + 1, right_point, L, tokenX);
      const { amountx, amounty } = get_X_Y_In_CurrentPoint(tokenX, tokenY, L);
      setTokenXAmount(new BigNumber(tokenXAmount).plus(amountx).toFixed());
      setTokenYAmount(new BigNumber(tokenYAmount).plus(amounty).toFixed());
    }
    // only y token
    if (current_point >= right_point) {
      const tokenYAmount = getY(left_point, right_point, L, tokenY);
      setTokenYAmount(tokenYAmount);
    }
    // only x token
    if (left_point > current_point) {
      const tokenXAmount = getX(left_point, right_point, L, tokenX);
      setTokenXAmount(tokenXAmount);
    }
  }
  function getLiquidityPrice() {
    if (tokenPriceList && tokenMetadata_x_y) {
      const [tokenX, tokenY] = tokenMetadata_x_y;
      const priceX = tokenPriceList[tokenX.id]?.price || 0;
      const priceY = tokenPriceList[tokenY.id]?.price || 0;
      const tokenYTotalPrice = new BigNumber(tokenYAmount || 0).multipliedBy(
        priceY
      );
      const tokenXTotalPrice = new BigNumber(tokenXAmount || 0).multipliedBy(
        priceX
      );
      const total_price =
        tokenYTotalPrice.plus(tokenXTotalPrice).toFixed() || '0';
      return `$` + formatWithCommas(toPrecision(total_price, 3));
    }

    return '$-';
  }
  function getY(
    leftPoint: number,
    rightPoint: number,
    L: string,
    token: TokenMetadata
  ) {
    const y = new BigNumber(L).multipliedBy(
      (Math.pow(Math.sqrt(CONSTANT_D), rightPoint) -
        Math.pow(Math.sqrt(CONSTANT_D), leftPoint)) /
        (Math.sqrt(CONSTANT_D) - 1)
    );
    const y_result = y.toFixed();
    return toReadableNumber(token.decimals, toPrecision(y_result, 0));
  }
  function getX(
    leftPoint: number,
    rightPoint: number,
    L: string,
    token: TokenMetadata
  ) {
    const x = new BigNumber(L)
      .multipliedBy(
        (Math.pow(Math.sqrt(CONSTANT_D), rightPoint - leftPoint) - 1) /
          (Math.pow(Math.sqrt(CONSTANT_D), rightPoint) -
            Math.pow(Math.sqrt(CONSTANT_D), rightPoint - 1))
      )
      .toFixed();
    return toReadableNumber(token.decimals, toPrecision(x, 0));
  }

  function get_X_Y_In_CurrentPoint(
    tokenX: TokenMetadata,
    tokenY: TokenMetadata,
    L: string
  ) {
    const { liquidity, liquidity_x, current_point } = poolDetail;
    const liquidity_y_big = new BigNumber(liquidity).minus(liquidity_x);
    let Ly = '0';
    let Lx = '0';
    // only remove y
    if (liquidity_y_big.isGreaterThanOrEqualTo(L)) {
      Ly = L;
    } else {
      // have x and y
      Ly = liquidity_y_big.toFixed();
      Lx = new BigNumber(L).minus(Ly).toFixed();
    }
    const amountX = getXAmount_per_point_by_Lx(Lx, current_point);
    const amountY = getYAmount_per_point_by_Ly(Ly, current_point);
    const amountX_read = toReadableNumber(
      tokenX.decimals,
      toPrecision(amountX, 0)
    );
    const amountY_read = toReadableNumber(
      tokenY.decimals,
      toPrecision(amountY, 0)
    );
    return { amountx: amountX_read, amounty: amountY_read };
  }

  function goYourLiquidityPage() {
    history.push('/yourliquidity');
  }
  function getTokenFeeAmount(p: string) {
    if (userLiquidity && tokenMetadata_x_y && tokenPriceList) {
      const [tokenX, tokenY] = tokenMetadata_x_y;
      const { unclaimed_fee_x, unclaimed_fee_y } = userLiquidity;
      const fee_x_amount = toReadableNumber(
        tokenX.decimals,
        unclaimed_fee_x || '0'
      );
      const fee_y_amount = toReadableNumber(
        tokenY.decimals,
        unclaimed_fee_y || '0'
      );
      if (p == 'l') {
        if (new BigNumber(fee_x_amount).isEqualTo('0')) {
          return '0';
        } else if (new BigNumber(fee_x_amount).isLessThan('0.001')) {
          return '<0.001';
        } else {
          return toPrecision(fee_x_amount, 3);
        }
      } else if (p == 'r') {
        if (new BigNumber(fee_y_amount).isEqualTo('0')) {
          return '0';
        } else if (new BigNumber(fee_y_amount).isLessThan('0.001')) {
          return '<0.001';
        } else {
          return toPrecision(fee_y_amount, 3);
        }
      } else if (p == 'p') {
        const tokenxSinglePrice = tokenPriceList[tokenX.id]?.price || '0';
        const tokenySinglePrice = tokenPriceList[tokenY.id]?.price || '0';
        const priceX = new BigNumber(fee_x_amount).multipliedBy(
          tokenxSinglePrice
        );
        const priceY = new BigNumber(fee_y_amount).multipliedBy(
          tokenySinglePrice
        );
        const totalPrice = priceX.plus(priceY);
        if (totalPrice.isEqualTo('0')) {
          return '$0';
        } else if (totalPrice.isLessThan('0.001')) {
          return '<$0.001';
        } else {
          return '$' + toPrecision(totalPrice.toFixed(), 3);
        }
      }
    }
  }
  function getRate(direction: string) {
    let value = '';
    if (tokenMetadata_x_y && userLiquidity && poolDetail) {
      const [tokenX, tokenY] = tokenMetadata_x_y;
      const { left_point, right_point } = userLiquidity;
      const { current_point } = poolDetail;
      const decimalRate =
        Math.pow(10, tokenX.decimals) / Math.pow(10, tokenY.decimals);
      const l_price = getPriceByPoint(left_point, decimalRate);
      const r_price = getPriceByPoint(right_point, decimalRate);
      const c_price = getPriceByPoint(current_point, decimalRate);
      if (rateSort) {
        if (direction == 'left') {
          value = toPrecision(l_price, 6);
        } else if (direction == 'right') {
          value = toPrecision(r_price, 6);
        } else if (direction == 'current') {
          value = toPrecision(c_price, 6);
        }
      } else {
        if (direction == 'left') {
          value = toPrecision(new BigNumber(1).dividedBy(r_price).toFixed(), 6);
        } else if (direction == 'right') {
          value = toPrecision(new BigNumber(1).dividedBy(l_price).toFixed(), 6);
        } else if (direction == 'current') {
          value = toPrecision(new BigNumber(1).dividedBy(c_price).toFixed(), 6);
        }
      }
    }
    const valueBig = new BigNumber(value);
    if (valueBig.isGreaterThan('100000')) {
      return new BigNumber(value).toExponential(3);
    } else {
      return value;
    }
  }
  function switchRateSort() {
    setRateSort(!rateSort);
  }
  function claimRewards() {
    if (!canClaim() || is_old_dcl) return;
    setClaimLoading(true);
    const [tokenX, tokenY] = tokenMetadata_x_y;
    remove_liquidity({
      token_x: tokenX,
      token_y: tokenY,
      lpt_id: userLiquidity.lpt_id,
      amount: '0',
      min_amount_x: '0',
      min_amount_y: '0',
      isLegacy: !!is_old_dcl,
    });
  }
  function canClaim() {
    if (userLiquidity) {
      const { unclaimed_fee_x, unclaimed_fee_y } = userLiquidity;
      if (+unclaimed_fee_x > 0 || +unclaimed_fee_y > 0) return true;
    }
    return false;
  }
  function displayTokenYAmount() {
    if (new BigNumber(tokenYAmount || '0').isEqualTo(0)) {
      return '0';
    } else if (new BigNumber(tokenYAmount).isLessThan(0.001)) {
      return '<0.001';
    } else {
      return toPrecision(tokenYAmount, 3);
    }
  }
  function displayTokenXAmount() {
    if (new BigNumber(tokenXAmount || '0').isEqualTo(0)) {
      return '0';
    } else if (new BigNumber(tokenXAmount).isLessThan(0.001)) {
      return '<0.001';
    } else {
      return toPrecision(tokenXAmount, 3);
    }
  }
  return (
    <div
      className={`m-auto lg:w-3/5 2xl:w-2/5 md:w-11/12 xs:w-11/12  xs:-mt-4 md:-mt-4`}
    >
      <div className="flex items-center text-v3SwapGray hover:text-white">
        <div
          className="flex items-center cursor-pointer"
          onClick={goYourLiquidityPage}
        >
          <ReturnIcon></ReturnIcon>
          <span className="text-sm ml-2.5">
            <FormattedMessage id="back" />
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center xs:flex-col md:flex-col xs:items-start md:items-start">
          <div className="flex items-center">
            <div className="flex items-center mr-2 flex-shrink-0">
              <img
                src={tokenMetadata_x_y && tokenMetadata_x_y[0].icon}
                className="w-8 h-8 border border-greenColor rounded-full"
              ></img>
              <img
                src={tokenMetadata_x_y && tokenMetadata_x_y[1].icon}
                className="relative w-8 h-8 border border-greenColor rounded-full -ml-1.5"
              ></img>
            </div>
            <span className="text-lg text-white">
              {tokenMetadata_x_y && tokenMetadata_x_y[0].symbol}/
              {tokenMetadata_x_y && tokenMetadata_x_y[1].symbol}
            </span>
          </div>
          <div className="flex items-center xs:mt-4 md:mt-4">
            <div className="flex items-center justify-center bg-cardBg rounded-2xl px-3 h-6 py-0.5 mx-2.5 xs:ml-0 md:ml-0">
              <span className="text-xs text-v3SwapGray mr-1.5 whitespace-nowrap">
                <FormattedMessage id="fee_Tiers" />
              </span>
              <span className="text-sm text-v3Blue">{+fee / 10000}%</span>
            </div>
            <div className="flex items-center justify-center bg-cardBg rounded-2xl px-3 h-6 py-0.5">
              <span
                className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mr-1.5 ${
                  isInrange ? 'bg-gradientFromHover' : 'bg-v3GarkWarningColor'
                }`}
              ></span>
              <span
                className={`text-xs whitespace-nowrap ${
                  isInrange
                    ? 'text-gradientFromHover'
                    : 'text-v3GarkWarningColor'
                }`}
              >
                {isInrange ? (
                  <FormattedMessage id="in_range" />
                ) : (
                  <FormattedMessage id="out_of_range" />
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between mt-8 items-stretch xs:flex-col md:flex-col xs:mt-5 md:mt-5">
        <div className="bg-cardBg rounded-xl p-5 w-1 flex-grow mr-3 xs:w-full md:w-full xs:mr-0 md:mr-0 xs:p-3 md:p-3">
          <div className="flex justify-between xs:w-full md:w-full">
            <div className="text-white text-base">
              <FormattedMessage id="your_liquidity" />
            </div>
            <div className="text-white text-sm">~{getLiquidityPrice()}</div>
          </div>
          <div className={`flex items-center justify-between mt-5`}>
            <div className="flex items-center">
              <img
                src={tokenMetadata_x_y && tokenMetadata_x_y[0].icon}
                className="w-7 h-7 border border-greenColor rounded-full"
              ></img>
              <span className="text-sm text-white ml-2">
                {tokenMetadata_x_y && tokenMetadata_x_y[0].symbol}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-white" title={tokenXAmount}>
                {displayTokenXAmount()}
              </span>
            </div>
          </div>
          <div className={`flex items-center justify-between mt-5`}>
            <div className="flex items-center">
              <img
                src={tokenMetadata_x_y && tokenMetadata_x_y[1].icon}
                className="w-7 h-7 border border-greenColor rounded-full"
              ></img>
              <span className="text-sm text-white ml-2">
                {tokenMetadata_x_y && tokenMetadata_x_y[1].symbol}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-white" title={tokenYAmount}>
                {displayTokenYAmount()}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-5">
            {is_old_dcl ? (
              <div className="flex flex-grow w-1 items-center justify-center bg-legacyButtonBgColor rounded-lg text-sm text-primaryText h-9 cursor-not-allowed mr-2.5">
                <FormattedMessage id="add" />
              </div>
            ) : (
              <GradientButton
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddBox(true);
                }}
                color="#fff"
                className={`flex-grow w-1 h-9 text-center text-sm text-white focus:outline-none mr-2.5`}
              >
                <FormattedMessage id="add"></FormattedMessage>
              </GradientButton>
            )}
            <OprationButton
              onClick={(e: any) => {
                e.stopPropagation();
                setShowRemoveBox(true);
              }}
              color="#fff"
              className={`flex-grow  w-1 h-9  items-center justify-center text-center text-sm text-white focus:outline-none font-semibold bg-bgGreyDefault hover:bg-bgGreyHover }`}
            >
              <FormattedMessage id="remove"></FormattedMessage>
            </OprationButton>
          </div>
        </div>
        <div className="bg-cardBg rounded-xl p-5 w-1 flex-grow xs:w-full md:w-full xs:mt-3 md:mt-3 xs:p-3 md:p-3">
          <div className="flex items-center justify-between text-white text-base flex-wrap">
            <span>
              <FormattedMessage id="unclaimed_fees" />
            </span>
            <span className="text-white text-base">
              {getTokenFeeAmount('p') || '$-'}
            </span>
          </div>
          <div className="flex items-center justify-between mt-5">
            <div className="flex items-center">
              <img
                src={tokenMetadata_x_y && tokenMetadata_x_y[0].icon}
                className="w-7 h-7 border border-greenColor rounded-full"
              ></img>
              <span className="text-sm text-white ml-2">
                {tokenMetadata_x_y && tokenMetadata_x_y[0].symbol}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-white">
                {getTokenFeeAmount('l') || '-'}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-5">
            <div className="flex items-center">
              <img
                src={tokenMetadata_x_y && tokenMetadata_x_y[1].icon}
                className="w-7 h-7 border border-greenColor rounded-full"
              ></img>
              <span className="text-sm text-white ml-2">
                {tokenMetadata_x_y && tokenMetadata_x_y[1].symbol}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-white">
                {getTokenFeeAmount('r') || '-'}
              </span>
            </div>
          </div>
          <div
            className="text-white text-right"
            data-class="reactTip"
            data-for="pause_v2_tip_3"
            data-place="top"
            data-html={true}
            data-tip={is_old_dcl ? pause_old_dcl_claim_tip() : ''}
          >
            <div
              className={`flex items-center justify-center h-9 rounded-lg text-sm px-2 py-1 mt-5 ${
                !canClaim() || is_old_dcl
                  ? 'bg-black bg-opacity-25 text-v3SwapGray cursor-not-allowed'
                  : 'bg-deepBlue hover:bg-deepBlueHover text-white cursor-pointer'
              }`}
              onClick={claimRewards}
            >
              <ButtonTextWrapper
                loading={claimLoading}
                Text={() => <FormattedMessage id="claim" />}
              />
            </div>
            <ReactTooltip
              id="pause_v2_tip_3"
              backgroundColor="#1D2932"
              border
              borderColor="#7e8a93"
              effect="solid"
            />
          </div>
        </div>
      </div>
      <div className="mt-3 bg-cardBg rounded-xl p-5 xs:p-3 md:p-3">
        <div className="flex items-center">
          <span className="text-sm text-white">
            <FormattedMessage id="price_range" />
          </span>
        </div>
        <div className="flex items-stretch justify-between mt-4">
          <div className="flex flex-col items-center  w-1 flex-grow bg-black bg-opacity-20 rounded-xl mr-3.5 px-3.5 py-5 xs:mr-1.5 md:mr-1.5">
            <span className="text-xs text-primaryText">
              <FormattedMessage id="min_price" />
            </span>
            <span className="text-white text-xl my-2 break-all">
              {getRate('left')}
            </span>
            <p className="text-xs text-primaryText text-center">
              <FormattedMessage id="your_position_will_be" /> 100%{' '}
              {rateSort
                ? tokenMetadata_x_y && tokenMetadata_x_y[0].symbol
                : tokenMetadata_x_y && tokenMetadata_x_y[1].symbol}{' '}
              <FormattedMessage id="at_this_price" />
            </p>
          </div>
          <div className="flex flex-col items-center  w-1 flex-grow  bg-black bg-opacity-20 rounded-xl  px-3.5 py-5">
            <span className="text-xs text-primaryText">
              <FormattedMessage id="max_price"></FormattedMessage>
            </span>
            <span className="text-white text-xl my-2 break-all">
              {getRate('right')}
            </span>
            <p className="text-xs text-primaryText text-center">
              <FormattedMessage id="your_position_will_be" /> 100%{' '}
              {rateSort
                ? tokenMetadata_x_y && tokenMetadata_x_y[1].symbol
                : tokenMetadata_x_y && tokenMetadata_x_y[0].symbol}{' '}
              <FormattedMessage id="at_this_price" />
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between flex-wrap bg-black bg-opacity-20 mt-2 rounded-xl px-3.5 py-3">
          <span className="text-xs text-primaryText">
            <FormattedMessage id="current_price"></FormattedMessage>
          </span>
          <span className="text-xl text-white break-all">
            {getRate('current')}
          </span>
          <div className="flex items-center">
            {rateSort ? (
              <span className="text-xs text-primaryText">
                {tokenMetadata_x_y && tokenMetadata_x_y[1].symbol}/
                {tokenMetadata_x_y && tokenMetadata_x_y[0].symbol}
              </span>
            ) : (
              <span className="text-xs text-primaryText">
                {tokenMetadata_x_y && tokenMetadata_x_y[0].symbol}/
                {tokenMetadata_x_y && tokenMetadata_x_y[1].symbol}
              </span>
            )}

            <SwitchButton
              className="cursor-pointer ml-1"
              onClick={switchRateSort}
            ></SwitchButton>
          </div>
        </div>
        {/* range chart area */}
        <div className="relative flex flex-col items-center justify-center my-10">
          <svg
            width="100%"
            height="230"
            className={`${chartLoading ? 'invisible' : 'visible'}`}
            ref={chartDom}
            style={{ color: 'rgba(91, 64, 255, 0.5)' }}
          >
            <g className="chart"></g>
            <g className="g" transform="translate(50,200)"></g>
            <g className="g2"></g>
            <g className="gLeftLine"></g>
            <g className="gRightLine"></g>
          </svg>
          {chartLoading ? (
            <BlueCircleLoading className="absolute"></BlueCircleLoading>
          ) : null}
        </div>
        {/* input range area */}
      </div>
      {showRemoveBox ? (
        <RemovePoolV3
          isOpen={showRemoveBox}
          onRequestClose={() => {
            setShowRemoveBox(false);
          }}
          tokenMetadata_x_y={tokenMetadata_x_y}
          poolDetail={poolDetail}
          tokenPriceList={tokenPriceList}
          userLiquidity={userLiquidity}
          isLegacy={is_old_dcl}
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
        ></RemovePoolV3>
      ) : null}
      <AddPoolV3
        isOpen={showAddBox}
        onRequestClose={() => {
          setShowAddBox(false);
        }}
        tokenMetadata_x_y={tokenMetadata_x_y}
        poolDetail={poolDetail}
        tokenPriceList={tokenPriceList}
        userLiquidity={userLiquidity}
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
      ></AddPoolV3>
    </div>
  );
}
