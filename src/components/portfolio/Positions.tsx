import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useHistory } from 'react-router';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  list_liquidities,
  get_pool,
  PoolInfo,
  remove_liquidity,
  get_liquidity,
} from '../../services/swapV3';
import { ColorsBox, ColorsBoxCenter, AddButtonIcon } from '~components/icon/V3';
import {
  GradientButton,
  BorderButton,
  ButtonTextWrapper,
} from '~components/button/Button';
import {
  toPrecision,
  toReadableNumber,
  formatWithCommas,
  toInternationalCurrencySystem,
} from '~utils/numbers';
import { TokenMetadata } from '../../services/ft-contract';
import { useTokens } from '../../state/token';
import {
  getPriceByPoint,
  CONSTANT_D,
  UserLiquidityInfo,
  useAddAndRemoveUrlHandle,
  getXAmount_per_point_by_Lx,
  getYAmount_per_point_by_Ly,
  TOKEN_LIST_FOR_RATE,
} from '../../services/commonV3';
import BigNumber from 'bignumber.js';
import { getBoostTokenPrices } from '../../services/farm';
import { RemovePoolV3 } from '~components/pool/RemovePoolV3';
import { AddPoolV3 } from '~components/pool/AddPoolV3';
import {
  MyOrderCircle,
  MyOrderMask,
  MyOrderMask2,
} from '~components/icon/swapV3';
import {
  WalletContext,
  getCurrentWallet,
} from '../../utils/wallets-integration';
import { ConnectToNearBtnSwap } from '../../components/button/Button';
import {
  YourLiquidityV1,
  StakeListContext,
} from '../../components/pool/YourLiquidityV1';
import { TriangleIcon, LinkIcon } from '../../components/icon/Portfolio';
import { PoolRPCView } from '~services/api';
import { Index } from 'mathjs';
import { isStablePool } from '../../services/near';
import { getStablePoolDecimal } from '~pages/stable/StableSwapEntry';
import { LP_TOKEN_DECIMALS } from '~services/m-token';
import { getVEPoolId } from '../../pages/ReferendumPage';

export default function Positions(props: any) {
  const [listLiquidities, setListLiquidities] = useState<UserLiquidityInfo[]>(
    []
  );
  const [listLiquiditiesLoading, setListLiquiditiesLoading] = useState(true);
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const [YourLpValueV2, setYourLpValueV2] = useState('0');

  const [YourLpValueV1, setYourLpValueV1] = useState('0');

  const [lpValueV1Done, setLpValueV1Done] = useState(false);

  const [lpValueV2Done, setLpValueV2Done] = useState(false);
  useEffect(() => {
    if (isSignedIn) {
      get_list_liquidities();
    }
  }, [isSignedIn]);
  // callBack handle todo
  useAddAndRemoveUrlHandle();
  async function get_list_liquidities() {
    const list: UserLiquidityInfo[] = await list_liquidities();
    if (list.length > 0) {
      list.sort((item1: UserLiquidityInfo, item2: UserLiquidityInfo) => {
        const item1_hashId = +item1.lpt_id.split('#')[1];
        const item2_hashId = +item2.lpt_id.split('#')[1];
        return item1_hashId - item2_hashId;
      });
      setListLiquidities(list);
    }
    setListLiquiditiesLoading(false);
  }
  return (
    <div className="text-white">
      <div>
        {!isSignedIn || listLiquidities?.length == 0 ? (
          <NoLiquidity text="V2"></NoLiquidity>
        ) : (
          <>
            <div className="grid grid-cols-positionContainer gap-x-2">
              <span className="text-sm text-primaryText  justify-self-center">
                NFT No.
              </span>
              <span className="text-sm text-primaryText ">Pools</span>
              <span className="text-sm text-primaryText ">Fee Tiers</span>
              <span className="text-sm text-primaryText ">Price Range</span>
              <span className="text-sm text-primaryText justify-self-start">
                State
              </span>
              <span className="text-sm text-primaryText  justify-self-end">
                Your Liquidity
              </span>
              <span className="text-sm text-primaryText  justify-self-center">
                Unclaimed Fees
              </span>
            </div>
            {listLiquidities.map(
              (liquidity: UserLiquidityInfo, index: number) => {
                return (
                  <div key={index}>
                    <UserLiquidityLine
                      liquidity={liquidity}
                    ></UserLiquidityLine>
                  </div>
                );
              }
            )}
          </>
        )}
      </div>
      <YourLiquidityV1 pageType="2"></YourLiquidityV1>
    </div>
  );
}

function UserLiquidityLine({ liquidity }: { liquidity: UserLiquidityInfo }) {
  const [poolDetail, setPoolDetail] = useState<PoolInfo>();
  const [liquidityDetail, setLiquidityDetail] = useState<UserLiquidityInfo>();
  const [hover, setHover] = useState<boolean>(false);
  const [isInrange, setIsInrange] = useState<boolean>(true);
  const [your_liquidity, setYour_liquidity] = useState('');
  const [tokenPriceList, setTokenPriceList] = useState<Record<string, any>>();
  const [claimLoading, setClaimLoading] = useState<boolean>(false);
  const [showRemoveBox, setShowRemoveBox] = useState<boolean>(false);
  const [showAddBox, setShowAddBox] = useState<boolean>(false);

  const {
    lpt_id,
    owner_id,
    pool_id,
    left_point,
    right_point,
    amount: L,
    unclaimed_fee_x,
    unclaimed_fee_y,
  } = liquidity;
  const [token_x, token_y, fee] = pool_id.split('|');
  const tokenMetadata_x_y = useTokens([token_x, token_y]);
  const rate_need_to_reverse_display = useMemo(() => {
    if (tokenMetadata_x_y) {
      const [tokenX] = tokenMetadata_x_y;
      if (TOKEN_LIST_FOR_RATE.indexOf(tokenX.symbol) > -1) return true;
      return false;
    }
  }, [tokenMetadata_x_y?.length]);

  const history = useHistory();
  useEffect(() => {
    get_pool_detail();
    getBoostTokenPrices().then(setTokenPriceList);
    getLiquidityDetail();
  }, []);
  useEffect(() => {
    if (tokenMetadata_x_y && poolDetail && tokenPriceList) {
      const { current_point } = poolDetail;
      get_your_liquidity(current_point);
    }
  }, [poolDetail, tokenMetadata_x_y, tokenPriceList]);
  async function get_pool_detail() {
    const detail = await get_pool(pool_id, token_x);
    if (detail) {
      const { current_point } = detail;
      if (current_point >= left_point && right_point > current_point) {
        setIsInrange(true);
      } else {
        setIsInrange(false);
      }
      setPoolDetail(detail);
    }
  }
  async function getLiquidityDetail() {
    const l = await get_liquidity(lpt_id);
    if (l) {
      setLiquidityDetail(l);
    }
  }
  function getRate(direction: string) {
    let value = '';
    if (tokenMetadata_x_y) {
      const [tokenX, tokenY] = tokenMetadata_x_y;
      const decimalRate =
        Math.pow(10, tokenX.decimals) / Math.pow(10, tokenY.decimals);
      if (direction == 'left') {
        value = getPriceByPoint(left_point, decimalRate);
      } else if (direction == 'right') {
        value = getPriceByPoint(right_point, decimalRate);
      }
      if (rate_need_to_reverse_display && +value !== 0) {
        value = new BigNumber(1).dividedBy(value).toFixed();
      }
      value = toPrecision(value, 6);
    }
    const valueBig = new BigNumber(value);
    if (valueBig.isGreaterThan('100000')) {
      return new BigNumber(value).toExponential(3);
    } else {
      return value;
    }
  }
  function getLpt_id() {
    return lpt_id.split('#')[1];
  }
  function get_your_liquidity(current_point: number) {
    const [tokenX, tokenY] = tokenMetadata_x_y;
    const priceX = tokenPriceList[tokenX.id]?.price || 0;
    const priceY = tokenPriceList[tokenY.id]?.price || 0;
    //  in range
    if (current_point >= left_point && right_point > current_point) {
      let tokenYAmount = getY(left_point, current_point, L, tokenY) || 0;
      let tokenXAmount = getX(current_point + 1, right_point, L, tokenX) || 0;
      const { amountx, amounty } = get_X_Y_In_CurrentPoint(tokenX, tokenY, L);
      tokenXAmount = new BigNumber(tokenXAmount).plus(amountx).toFixed();
      tokenYAmount = new BigNumber(tokenYAmount).plus(amounty).toFixed();
      const tokenYTotalPrice = new BigNumber(tokenYAmount).multipliedBy(priceY);
      const tokenXTotalPrice = new BigNumber(tokenXAmount).multipliedBy(priceX);
      const total_price = tokenYTotalPrice.plus(tokenXTotalPrice).toFixed();
      setYour_liquidity(formatWithCommas(toPrecision(total_price, 3)));
    }
    // only y token
    if (current_point >= right_point) {
      const tokenYAmount = getY(left_point, right_point, L, tokenY);
      const tokenYTotalPrice = new BigNumber(tokenYAmount).multipliedBy(priceY);
      const total_price = tokenYTotalPrice.toFixed();
      setYour_liquidity(formatWithCommas(toPrecision(total_price, 3)));
    }
    // only x token
    if (left_point > current_point) {
      const tokenXAmount = getX(left_point, right_point, L, tokenX);
      const tokenXTotalPrice = new BigNumber(tokenXAmount).multipliedBy(priceX);
      const total_price = tokenXTotalPrice.toFixed();
      setYour_liquidity(formatWithCommas(toPrecision(total_price, 3)));
    }
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
  function claimRewards(e: any) {
    e.stopPropagation();
    if (!canClaim()) return;
    setClaimLoading(true);
    const [tokenX, tokenY] = tokenMetadata_x_y;
    remove_liquidity({
      token_x: tokenX,
      token_y: tokenY,
      lpt_id,
      amount: '0',
      min_amount_x: '0',
      min_amount_y: '0',
    });
  }
  function goYourLiquidityDetailPage() {
    const id = lpt_id.replace(/\|/g, '@').replace('#', '@');
    history.push(`/yoursLiquidityDetailV2/${id}`);
  }
  function getTokenFeeAmount(p: string) {
    if (liquidityDetail && tokenMetadata_x_y && tokenPriceList) {
      const [tokenX, tokenY] = tokenMetadata_x_y;
      const { unclaimed_fee_x, unclaimed_fee_y } = liquidityDetail;
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
  function canClaim() {
    if (liquidityDetail) {
      const { unclaimed_fee_x, unclaimed_fee_y } = liquidityDetail;
      if (+unclaimed_fee_x > 0 || +unclaimed_fee_y > 0) return true;
    }
    return false;
  }
  function getRateMapTokens() {
    if (tokenMetadata_x_y) {
      const [tokenX, tokenY] = tokenMetadata_x_y;
      if (rate_need_to_reverse_display) {
        return `${tokenX.symbol}/${tokenY.symbol}`;
      } else {
        return `${tokenY.symbol}/${tokenX.symbol}`;
      }
    }
  }
  function mobile_ReferenceToken(direction: string) {
    if (tokenMetadata_x_y) {
      const [tokenX, tokenY] = tokenMetadata_x_y;
      if (direction == 'left') {
        if (rate_need_to_reverse_display) {
          return tokenY.symbol;
        } else {
          return tokenX.symbol;
        }
      } else if (direction == 'right') {
        if (rate_need_to_reverse_display) {
          return tokenX.symbol;
        } else {
          return tokenY.symbol;
        }
      }
    }
  }
  return (
    <div
      className="mt-3.5"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* for PC */}
      <div className="relative flex flex-col items-center xs:hidden md:hidden">
        <div className="w-full rounded-2xl overflow-hidden border border-cardBg">
          <div
            className={`relative py-5 cursor-pointer bg-positionLineBgColor`}
            onClick={goYourLiquidityDetailPage}
          >
            <div className="grid grid-cols-positionContainer gap-x-2">
              <span className=" justify-self-center flex items-center">
                #{getLpt_id()}
              </span>
              <div className=" flex items-center">
                <div className="flex items-center flex-shrink-0">
                  <img
                    src={tokenMetadata_x_y && tokenMetadata_x_y[0].icon}
                    className="w-7 h-7 border border-greenColor rounded-full"
                  ></img>
                  <img
                    src={tokenMetadata_x_y && tokenMetadata_x_y[1].icon}
                    className="relative -ml-1.5 w-7 h-7 border border-greenColor rounded-full"
                  ></img>
                </div>
                <span className="text-white font-bold ml-2.5 text-sm gotham_bold">
                  {tokenMetadata_x_y && tokenMetadata_x_y[0]['symbol']}/
                  {tokenMetadata_x_y && tokenMetadata_x_y[1]['symbol']}
                </span>
              </div>
              <span className=" flex items-center text-sm text-v3Blue">
                {+fee / 10000}%
              </span>
              <div className=" flex items-center">
                <span className="text-v3SwapGray text-xs mr-1.5">
                  <FormattedMessage
                    id="min"
                    defaultMessage="Min"
                  ></FormattedMessage>
                </span>
                <span className="text-white text-sm overflow-hidden whitespace-nowrap overflow-ellipsis gotham_bold">
                  {getRate(rate_need_to_reverse_display ? 'right' : 'left')}
                </span>
                <label className="text-v3SwapGray text-xs mx-2">-</label>
                <span className="text-v3SwapGray text-xs mr-1.5">
                  <FormattedMessage
                    id="max"
                    defaultMessage="Max"
                  ></FormattedMessage>
                </span>
                <span className="text-white text-sm overflow-hidden whitespace-nowrap overflow-ellipsis gotham_bold">
                  {getRate(rate_need_to_reverse_display ? 'left' : 'right')}
                </span>
                <span className="text-v3SwapGray text-xs ml-1.5 mr-3">
                  {getRateMapTokens()}
                </span>
              </div>
              <div className=" justify-self-start flex items-center justify-center bg-selectTokenV3BgColor rounded-md px-2.5 h-6 py-0.5">
                <span
                  className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mr-1.5 ${
                    isInrange ? 'bg-gradientFromHover' : 'bg-v3GarkWarningColor'
                  }`}
                ></span>
                <span
                  className={`whitespace-nowrap text-xs ${
                    isInrange
                      ? 'text-gradientFromHover'
                      : 'text-v3GarkWarningColor'
                  }`}
                >
                  {isInrange ? (
                    <FormattedMessage id="in_range"></FormattedMessage>
                  ) : (
                    <FormattedMessage id="out_of_range"></FormattedMessage>
                  )}
                </span>
              </div>
              <span className=" justify-self-end flex items-center">
                ${your_liquidity || '-'}
              </span>
              <div className=" flex items-center justify-self-center">
                <img
                  src={tokenMetadata_x_y && tokenMetadata_x_y[0].icon}
                  className="w-5 h-5 border border-greenColor rounded-full mr-1"
                ></img>
                <span className="text-sm text-white mr-3 gotham_bold">
                  {getTokenFeeAmount('l') || '-'}
                </span>
                <img
                  src={tokenMetadata_x_y && tokenMetadata_x_y[1].icon}
                  className="w-5 h-5 border border-greenColor rounded-full mr-1"
                ></img>
                <span className="text-sm text-white gotham_bold">
                  {getTokenFeeAmount('r') || '-'}
                </span>
              </div>
            </div>
          </div>
          <div
            className={`items-center justify-end p-4 bg-positionLineHoverBgColor ${
              hover ? 'flex' : 'hidden'
            }`}
          >
            <div className="flex items-center justify-center">
              <GradientButton
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddBox(true);
                }}
                color="#fff"
                minWidth="120px"
                borderRadius="8px"
                className={`px-3 h-8 text-center text-sm text-white gotham_bold focus:outline-none`}
              >
                <FormattedMessage id="add" />
              </GradientButton>
              <BorderButton
                onClick={(e) => {
                  e.stopPropagation();
                  setShowRemoveBox(true);
                }}
                rounded="rounded-lg"
                px="px-0"
                py="py-1"
                style={{ minWidth: '120px' }}
                className="flex-grow  gotham_bold text-sm text-greenColor h-8 mx-2.5"
              >
                <FormattedMessage id="remove" />
              </BorderButton>
              <div
                className={`flex items-center justify-center  rounded-lg text-sm h-8 px-2 py-1 gotham_bold ${
                  !canClaim()
                    ? 'bg-black bg-opacity-25 text-v3SwapGray cursor-not-allowed'
                    : 'bg-deepBlue hover:bg-deepBlueHover text-white cursor-pointer'
                }`}
                style={{ minWidth: '120px' }}
                onClick={claimRewards}
              >
                <ButtonTextWrapper
                  loading={claimLoading}
                  Text={() => <FormattedMessage id="claim" />}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* for Mobile */}
      <div className="lg:hidden">
        <div
          className={`relative cursor-pointer bg-cardBg rounded -xl overflow-hidden`}
          onClick={goYourLiquidityDetailPage}
        >
          <div className="flex flex-col items-center justify-between w-full bg-orderMobileTop px-3 pb-3">
            <div className="flex items-center justify-center">
              <ColorsBox svgId="paint0_linear_124_7158"></ColorsBox>
              <span className="absolute text-white text-xs">
                ID #{getLpt_id()}
              </span>
            </div>
            <div className="flex items-center justify-between w-full mt-1.5">
              <div className="flex items-center">
                <div className="flex items-center flex-shrink-0">
                  <img
                    src={tokenMetadata_x_y && tokenMetadata_x_y[0].icon}
                    className="w-7 h-7 border border-greenColor rounded-full"
                  ></img>
                  <img
                    src={tokenMetadata_x_y && tokenMetadata_x_y[1].icon}
                    className="relative -ml-1.5 w-7 h-7 border border-greenColor rounded-full"
                  ></img>
                </div>
                <span className="text-white text-sm ml-1.5">
                  {tokenMetadata_x_y && tokenMetadata_x_y[0]['symbol']}/
                  {tokenMetadata_x_y && tokenMetadata_x_y[1]['symbol']}
                </span>
              </div>
              <div className="flex items-center justify-center bg-black bg-opacity-25 rounded-2xl px-3 h-6 py-0.5">
                <span
                  className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mr-1.5 ${
                    isInrange ? 'bg-gradientFromHover' : 'bg-v3GarkWarningColor'
                  }`}
                ></span>
                <span
                  className={`whitespace-nowrap text-xs ${
                    isInrange
                      ? 'text-gradientFromHover'
                      : 'text-v3GarkWarningColor'
                  }`}
                >
                  {isInrange ? (
                    <FormattedMessage id="in_range"></FormattedMessage>
                  ) : (
                    <FormattedMessage id="out_of_range"></FormattedMessage>
                  )}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col p-3">
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-v3SwapGray">
                <FormattedMessage id="fee_Tiers" />
              </span>
              <span className="text-sm text-white">{+fee / 10000}%</span>
            </div>
            <div className="flex items-center justify-between mt-4">
              <span className="text-v3SwapGray text-xs">
                <FormattedMessage id="min_price" /> (1{' '}
                {mobile_ReferenceToken('left')})
              </span>
              <span className="text-white text-sm">
                {getRate(rate_need_to_reverse_display ? 'right' : 'left')}&nbsp;
                {mobile_ReferenceToken('right')}
              </span>
            </div>
            <div className="flex items-center justify-between mt-4">
              <span className="text-v3SwapGray text-xs">
                <FormattedMessage id="max_price" /> (1{' '}
                {mobile_ReferenceToken('left')})
              </span>
              <span className="text-white text-sm">
                {getRate(rate_need_to_reverse_display ? 'left' : 'right')}&nbsp;
                {mobile_ReferenceToken('right')}
              </span>
            </div>
            <div className="flex items-start justify-between mt-4">
              <span className="text-v3SwapGray text-xs">
                <FormattedMessage id="unclaimed_fees" />
              </span>
              <span className="text-white text-sm"></span>
              <div className="flex flex-col justify-end text-white text-sm">
                <div className="flex items-center">
                  <img
                    src={tokenMetadata_x_y && tokenMetadata_x_y[0].icon}
                    className="w-5 h-5 border border-greenColor rounded-full mr-1"
                  ></img>
                  <span className="text-sm text-white mr-3">
                    {getTokenFeeAmount('l') || '-'}
                  </span>
                  <img
                    src={tokenMetadata_x_y && tokenMetadata_x_y[1].icon}
                    className="w-5 h-5 border border-greenColor rounded-full mr-1"
                  ></img>
                  <span className="text-sm text-white">
                    {getTokenFeeAmount('r') || '-'}
                  </span>
                </div>
                <div className="flex items-center justify-end mt-2">
                  <div
                    className={`flex items-center justify-center  rounded-lg text-sm px-2 py-1 ${
                      !canClaim()
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
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-searchBgColor rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-v3SwapGray">
              <FormattedMessage id="your_liquidity" />
            </span>
            <span className="text-sm text-white">${your_liquidity || '-'}</span>
          </div>
          <div className="flex items-center justify-between mt-3.5">
            <GradientButton
              onClick={(e) => {
                e.stopPropagation();
                setShowAddBox(true);
              }}
              color="#fff"
              className={`w-1 flex-grow h-8 text-center text-sm text-white focus:outline-none mr-3`}
            >
              <FormattedMessage id="add" />
            </GradientButton>
            <BorderButton
              onClick={(e) => {
                e.stopPropagation();
                setShowRemoveBox(true);
              }}
              rounded="rounded-md"
              px="px-0"
              py="py-1"
              className="w-1 flex-grow  text-sm text-greenColor h-8"
            >
              <FormattedMessage id="remove" />
            </BorderButton>
          </div>
        </div>
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
          userLiquidity={liquidityDetail}
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
        userLiquidity={liquidityDetail}
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
function NoLiquidity({
  text,
  className,
}: {
  text?: string;
  className?: string;
}) {
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  return (
    <div
      className={`w-full rounded-xl overflow-hidden h-48 relative text-white font-normal  flex items-center justify-center ${
        className || ''
      }`}
      style={{
        background: 'rgb(26,36,43)',
      }}
    >
      <div className="flex items-center flex-col relative text-center z-10 mx-auto">
        <span className="mb-4">
          <MyOrderCircle />
        </span>

        <span className="text-white text-base">
          Your {text} liquidity positions will appear here.
        </span>
        {isSignedIn ? null : (
          <div className="mt-5 w-72">
            <ConnectToNearBtnSwap />
          </div>
        )}
      </div>

      <MyOrderMask />
      <MyOrderMask2 />
    </div>
  );
}

export function LiquidityContainerStyle2() {
  const {
    listLiquiditiesLoading,
    listLiquidities,
    checkedStatus,
    error,
    count,
    isClientMobile,
    v1Farm,
    v2Farm,
    tvls,
    tokensMeta,
    lptAmount,
    lpCount,
    setLpValueV1Done,
    setYourLpValueV1,
    generalAddLiquidity,
    setGeneralAddLiquidity,
    vePool,
    pools,
    stablePools,
    batchTotalShares,
    batchStableShares,
    batchTotalSharesSimplePools,
    batchShares,
    stakeList,
    v2StakeList,
    finalStakeList,
  } = useContext(StakeListContext);
  const simplePoolsFinal = useMemo(() => {
    const activeSimplePools: PoolRPCView[] = pools.filter(
      (p: PoolRPCView, i: number) => {
        return batchTotalSharesSimplePools[i] !== 0 && p.id !== vePool?.id;
      }
    );
    return activeSimplePools;
  }, [pools, batchTotalSharesSimplePools]);
  const stablePoolsFinal: PoolRPCView[] = useMemo(() => {
    const activeStablePools = stablePools.filter(
      (p: PoolRPCView, i: number) => {
        return batchTotalShares[i] !== 0;
      }
    );
    return activeStablePools;
  }, [stablePools, batchTotalShares]);
  const vePoolFinal: PoolRPCView = vePool;
  console.log('111111111-simplePoolsFinal', simplePoolsFinal);
  console.log('111111111-stablePoolsFinal', stablePoolsFinal);
  console.log('111111111-vePoolFinal', vePoolFinal);
  console.log('111111111-finalStakeList', finalStakeList);
  console.log('2222222222-pools', pools);
  console.log(
    '2222222222-batchTotalSharesSimplePools',
    batchTotalSharesSimplePools
  );
  console.log('2222222222-batchTotalShares', batchTotalShares);
  console.log('2222222222-batchShares', batchShares);
  console.log('2222222222-batchStableShares', batchStableShares);

  return (
    <div>
      {vePool ? (
        <YourClassicLiquidityLine pool={vePool}></YourClassicLiquidityLine>
      ) : null}
      {stablePoolsFinal.map((pool: PoolRPCView) => {
        return (
          <YourClassicLiquidityLine pool={pool}></YourClassicLiquidityLine>
        );
      })}
      {simplePoolsFinal.map((pool: PoolRPCView) => {
        return (
          <YourClassicLiquidityLine pool={pool}></YourClassicLiquidityLine>
        );
      })}
    </div>
  );
}

function YourClassicLiquidityLine(props: any) {
  const {
    listLiquiditiesLoading,
    listLiquidities,
    checkedStatus,
    error,
    count,
    vePool,
    isClientMobile,
    v1Farm,
    v2Farm,
    tvls,
    tokensMeta,
    lptAmount,
    lpCount,
    setLpValueV1Done,
    setYourLpValueV1,
    pools,
    stablePools,
    generalAddLiquidity,
    setGeneralAddLiquidity,

    batchTotalShares,
    batchStableShares,
    batchTotalSharesSimplePools,
    batchShares,
    stakeList,
    v2StakeList,
    finalStakeList,
  } = useContext(StakeListContext);
  const { pool } = props;
  const { token_account_ids, id: poolId } = pool;
  const tokens = token_account_ids.map((id: number) => tokensMeta[id]) || [];
  const decimals = isStablePool(poolId)
    ? getStablePoolDecimal(poolId)
    : LP_TOKEN_DECIMALS;
  // todo token 需要排序
  const Images = tokens.map((token: TokenMetadata) => {
    const { icon, id } = token;
    if (icon)
      return (
        <img
          key={id}
          className={
            'inline-block h-8 w-8 rounded-full border border-gradientFromHover -ml-1 '
          }
          src={icon}
        />
      );
    return (
      <div
        key={id}
        className={
          'inline-block h-8 w-8 rounded-full bg-cardBg border border-gradientFromHover -ml-1'
        }
      ></div>
    );
  });
  const Symbols = tokens.map((token: TokenMetadata, index: number) => {
    const { symbol } = token;
    if (index == tokens.length - 1) {
      return <>{symbol}</>;
    } else {
      return <>{symbol}/</>;
    }
  });
  // get lp amount in farm
  const lp_in_farm = useMemo(() => {
    let inFarmAmount = '0';
    Object.keys(finalStakeList).find((seed_id: string) => {
      const pool_id = seed_id.split('@')[1];
      if (+poolId == +pool_id) {
        const amount = finalStakeList[seed_id];
        inFarmAmount = new BigNumber(amount).shiftedBy(-decimals).toFixed();
        return true;
      }
    });
    return inFarmAmount;
  }, [finalStakeList]);
  // get lp amount in vote
  const lp_in_vote = useMemo(() => {
    let lpInVote = '0';
    if (+pool.id == vePool?.id) {
      lpInVote = lptAmount;
    }
    return new BigNumber(lpInVote).shiftedBy(-24).toFixed();
  }, [pool, lptAmount]);
  // get lp amount in pool && total lp (pool + farm) && user lp percent
  const [lp_in_pool, lp_total, user_lp_percent] = useMemo(() => {
    const { id, shares_total_supply } = pool;
    const is_stable_pool = isStablePool(id);
    let amount_in_pool = '0';
    let total_amount = '0';
    if (is_stable_pool) {
      const i = stablePools.findIndex((p: PoolRPCView) => p.id === pool.id);
      amount_in_pool = batchStableShares?.[i];
      total_amount = batchTotalShares?.[i];
    } else {
      const i = pools.findIndex((p: PoolRPCView) => p.id === pool.id);
      amount_in_pool = batchShares?.[i];
      total_amount = batchTotalSharesSimplePools?.[i];
    }
    const read_amount_in_pool = new BigNumber(amount_in_pool)
      .shiftedBy(-decimals)
      .toFixed();
    const read_total_amount = new BigNumber(total_amount)
      .shiftedBy(-decimals)
      .plus(lp_in_vote);
    const read_shareSupply = new BigNumber(
      shares_total_supply || '0'
    ).shiftedBy(-decimals);
    let percent = '0';
    if (
      read_shareSupply.isGreaterThan(0) &&
      read_total_amount.isGreaterThan(0)
    ) {
      percent = read_total_amount.dividedBy(read_shareSupply).toFixed();
    }
    return [read_amount_in_pool, read_total_amount.toFixed(), percent];
  }, [
    batchShares,
    batchStableShares,
    batchTotalSharesSimplePools,
    batchTotalShares,
    lp_in_vote,
  ]);
  // get total lp value
  const lp_total_value = useMemo(() => {
    const { id, tvl, shares_total_supply } = pool;
    const pool_tvl = tvls?.[id] || tvl || 0;
    if (+shares_total_supply > 0) {
      const read_total_supply = new BigNumber(shares_total_supply).shiftedBy(
        -decimals
      );
      const single_lp_value = new BigNumber(pool_tvl).dividedBy(
        read_total_supply
      );
      return new BigNumber(single_lp_value || 0)
        .multipliedBy(lp_total || 0)
        .toFixed();
    }
    return '0';
  }, [lp_total, tvls]);
  function display_number(amount: string) {
    const amount_big = new BigNumber(amount);
    if (amount_big.isEqualTo('0')) {
      return '0';
    } else if (amount_big.isLessThan('0.01')) {
      return '<0.01';
    } else {
      return toPrecision(amount, 2);
    }
  }
  function display_value(amount: string) {
    const amount_big = new BigNumber(amount);
    if (amount_big.isEqualTo('0')) {
      return '$0';
    } else if (amount_big.isLessThan('0.01')) {
      return '<$0.01';
    } else {
      return `$${toInternationalCurrencySystem(amount, 2)}`;
    }
  }
  function display_percent(percent: string) {
    const p = new BigNumber(percent).multipliedBy(100);
    if (p.isEqualTo(0)) {
      return '0%';
    } else if (p.isLessThan(0.01)) {
      return '<0.01%';
    } else {
      return toPrecision(p.toFixed(), 2) + '%';
    }
  }
  return (
    <div className="rounded-xl mt-3 bg-portfolioBgColor px-5 pb-4">
      <div className="flex items-center justify-between h-14">
        <div className="flex items-center">
          <div className="flex items-center">{Images}</div>
          <span className="text-sm text-white gotham_bold mx-2.5">
            {Symbols}
          </span>
          <span className="text-sm text-v3SwapGray px-1.5 rounded-md bg-selectTokenV3BgColor mr-1.5">
            Classic
          </span>
          <span
            className="flex items-center justify-center h-5 w-5 rounded-md bg-selectTokenV3BgColor cursor-pointer text-primaryText hover:text-white"
            onClick={() => {
              window.open(`/pool/${pool.id}`);
            }}
          >
            <LinkIcon></LinkIcon>
          </span>
        </div>
        <div className="flex items-center">
          <span className="text-sm text-white gotham_bold mr-5">
            {display_value(lp_total_value)}
          </span>
          <div className="flex items-center justify-center border border-primaryText border-opacity-10 rounded-md w-6 h-6 cursor-pointer">
            <TriangleIcon></TriangleIcon>
          </div>
        </div>
      </div>
      <div>
        <p className="text-sm text-v3SwapGray ml-2">Your Position</p>
        <div className="bg-primaryText rounded-xl px-3.5 py-5 bg-opacity-10 mt-3">
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm text-v3SwapGray">
              Your Liquidity (USD value)
            </span>
            <span className="text-sm text-white">
              {display_value(lp_total_value)}
            </span>
          </div>
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm text-v3SwapGray">
              Your LP Tokens(Shares)
            </span>
            <span className="text-sm text-white">
              {display_number(lp_total)} ({display_percent(user_lp_percent)})
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-v3SwapGray">Usage</span>
            <div className="flex items-center text-sm text-white">
              <div
                className={`flex items-center pl-3.5 ${
                  +lp_in_vote > 0 || +lp_in_pool > 0
                    ? 'border-r border-orderTypeBg pr-3.5'
                    : ''
                } ${+lp_in_farm > 0 ? '' : 'hidden'}`}
              >
                {display_number(lp_in_farm)} in{' '}
                <span className="flex items-center">
                  <label className="underline cursor-pointer mx-1">Farm</label>{' '}
                  <LinkIcon className="cursor-pointer text-primaryText hover:text-white"></LinkIcon>
                </span>
              </div>
              <div
                className={`flex items-center pl-3.5 ${
                  +lp_in_pool > 0 ? 'pr-3.5 border-r border-orderTypeBg' : ''
                } ${+lp_in_vote > 0 ? '' : 'hidden'}`}
              >
                {display_number(lp_in_vote)} locked in{' '}
                <span className="flex items-center">
                  <label className="underline cursor-pointer mx-1">DAO</label>{' '}
                  <LinkIcon className="cursor-pointer text-primaryText hover:text-white"></LinkIcon>
                </span>
              </div>
              <div
                className={`flex items-center pl-3.5 ${
                  +lp_in_pool > 0 ? '' : 'hidden'
                }`}
              >
                {display_number(lp_in_pool)} Holding
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
