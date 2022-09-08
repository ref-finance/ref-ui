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
  list_liquidities,
  get_pool,
  PoolInfo,
  remove_liquidity,
  get_liquidity,
} from '../../services/swapV3';
import { ReturnIcon, SwitchButton } from '~components/icon/V3';
import {
  GradientButton,
  BorderButton,
  ButtonTextWrapper,
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
  getPointByPrice,
  CONSTANT_D,
  FEELIST,
  POINTDELTAMAP,
  DEFAULTSELECTEDFEE,
  POINTLEFTRANGE,
  POINTRIGHTRANGE,
  UserLiquidityInfo,
} from '../../services/commonV3';
import BigNumber from 'bignumber.js';
import { getTokenPriceList } from '../../services/indexer';
import { getBoostTokenPrices } from '../../services/farm';
import { getLiquidity } from '~utils/pool';
import _ from 'lodash';
import { getURLInfo } from '../../components/layout/transactionTipPopUp';
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
  const history = useHistory();
  const hashId = location.hash?.split('#')[1];
  const poolId = (props.match.params?.poolId || '').replace(/@/g, '|');
  const [token_x, token_y, fee] = poolId.split('|');
  const tokenMetadata_x_y = useTokens([token_x, token_y]);
  const { txHash } = getURLInfo();
  useEffect(() => {
    if (txHash) {
      history.replace(location.pathname);
    }
  }, [txHash]);
  useEffect(() => {
    getBoostTokenPrices().then(setTokenPriceList);
    if (poolId && hashId) {
      get_user_liquidity();
      get_pool_detail();
    }
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
    }
  }, [userLiquidity, poolDetail, tokenMetadata_x_y]);
  async function get_pool_detail() {
    const token_x = poolId.split('|')[0];
    const detail = await get_pool(poolId, token_x);
    if (detail) {
      setPoolDetail(detail);
    }
  }
  async function get_user_liquidity() {
    const lptId = poolId + '#' + hashId;
    const l = await get_liquidity(lptId);
    if (l) {
      setUserLiquidity(l);
    }
  }
  function get_liquidity_x_y() {
    debugger;
    const [tokenX, tokenY] = tokenMetadata_x_y;
    const { left_point, right_point, amount: L } = userLiquidity;
    const { current_point } = poolDetail;
    //  in range
    if (current_point >= left_point && right_point > current_point) {
      const tokenYAmount = getY(left_point, current_point, L, tokenY);
      const tokenXAmount = getX(current_point, right_point, L, tokenX);
      setTokenXAmount(tokenXAmount);
      setTokenYAmount(tokenYAmount);
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
      return `$` + toPrecision(total_price, 3);
    }
    return '$-';
  }
  function getLiquidityAmount() {
    if (!(tokenMetadata_x_y && userLiquidity)) return '';
    const [tokenX, tokenY] = tokenMetadata_x_y;
    const { amount } = userLiquidity;
    const decimals = _.min([tokenX.decimals, tokenY.decimals]);
    return toPrecision(toReadableNumber(decimals, amount), 3);
  }
  function getY(
    leftPoint: number,
    rightPoint: number,
    L: string,
    token: TokenMetadata
  ) {
    const y = new BigNumber(L)
      .multipliedBy(
        (Math.pow(Math.sqrt(CONSTANT_D), rightPoint) -
          Math.pow(Math.sqrt(CONSTANT_D), leftPoint)) /
          (Math.sqrt(CONSTANT_D) - 1)
      )
      .toFixed();
    return toReadableNumber(token.decimals, toPrecision(y, 0));
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
  function goYourLiquidityPage() {
    history.push('/yoursLiquidity');
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
    return value;
  }
  function switchRateSort() {
    setRateSort(!rateSort);
  }
  function claimRewards() {
    if (!canClaim()) return;
    setClaimLoading(true);
    const [tokenX, tokenY] = tokenMetadata_x_y;
    remove_liquidity({
      token_x: tokenX,
      token_y: tokenY,
      lpt_id: userLiquidity.lpt_id,
      amount: '0',
      min_amount_x: '0',
      min_amount_y: '0',
    });
  }
  function canClaim() {
    if (userLiquidity) {
      const { unclaimed_fee_x, unclaimed_fee_y } = userLiquidity;
      if (+unclaimed_fee_x > 0 || +unclaimed_fee_y > 0) return true;
    }
    return false;
  }
  return (
    <div className={`m-auto lg:w-2/5 md:w-5/6 xs:w-11/12  xs:-mt-4 md:-mt-4`}>
      <div className="flex items-center text-v3SwapGray hover:text-white">
        <div
          className="flex items-center cursor-pointer"
          onClick={goYourLiquidityPage}
        >
          <ReturnIcon></ReturnIcon>
          <span className="text-sm ml-2.5">Back</span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center">
          <div className="flex items-center mr-2">
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
          <div className="flex items-center justify-center bg-black bg-opacity-25 rounded-2xl px-3 h-6 py-0.5 mx-2.5">
            <span className="text-xs text-v3SwapGray mr-1.5">Fee Tiers</span>
            <span className="text-sm text-v3Blue">{fee / 10000}%</span>
          </div>
          <div className="flex items-center justify-center bg-black bg-opacity-25 rounded-2xl px-3 h-6 py-0.5">
            <span
              className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mr-1.5 ${
                isInrange ? 'bg-gradientFromHover' : 'bg-v3GarkWarningColor'
              }`}
            ></span>
            <span
              className={`text-xs ${
                isInrange ? 'text-gradientFromHover' : 'text-v3GarkWarningColor'
              }`}
            >
              {isInrange ? 'In range' : 'Out of range'}
            </span>
          </div>
        </div>
        <div className="flex items-center">
          <GradientButton
            onClick={(e) => {
              e.stopPropagation();
              setShowAddBox(true);
            }}
            color="#fff"
            className={`w-20 h-8 text-center text-sm text-white focus:outline-none mr-2.5`}
          >
            Add
          </GradientButton>
          <BorderButton
            onClick={(e) => {
              e.stopPropagation();
              setShowRemoveBox(true);
            }}
            rounded="rounded-md"
            px="px-0"
            py="py-1"
            className="flex-grow  w-20 text-sm text-greenColor"
          >
            Remove
          </BorderButton>
        </div>
      </div>
      <div className="flex justify-between mt-8 items-stretch">
        <div className="bg-cardBg rounded-xl p-5 w-1 flex-grow mr-3">
          <div className="text-white text-base">Your Liquidity</div>
          <div className="flex items-center justify-between mt-3.5">
            <span className="text-white text-xl">{getLiquidityAmount()}</span>
            <span className="text-v3SwapGray text-sm">
              ~{getLiquidityPrice()}
            </span>
          </div>
          <div
            className={`flex items-center justify-between mt-5 ${
              tokenXAmount ? '' : 'hidden'
            }`}
          >
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
                {toPrecision(tokenXAmount, 3)}
              </span>
            </div>
          </div>
          <div
            className={`flex items-center justify-between mt-5 ${
              tokenYAmount ? '' : 'hidden'
            }`}
          >
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
                {toPrecision(tokenYAmount, 3)}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-cardBg rounded-xl p-5 w-1 flex-grow">
          <div className="flex items-center justify-between text-white text-base">
            <span>Unclaimed Fees</span>
            <div
              className={`flex items-center justify-center  rounded-lg text-sm h-8 w-20 ${
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
          <div className="flex items-center mt-3.5">
            <span className="text-white text-xl">
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
        </div>
      </div>
      <div className="mt-2.5 bg-cardBg rounded-xl p-5">
        <div className="flex items-center">
          <span className="text-sm text-white">Price Range</span>
        </div>
        <div className="flex items-stretch justify-between mt-4">
          <div className="flex flex-col items-center  bg-black bg-opacity-20 rounded-xl mr-3.5 px-3.5 py-5">
            <span className="text-xs text-primaryText">Min Price</span>
            <span className="text-white text-xl my-2">{getRate('left')}</span>
            <p className="text-xs text-primaryText text-center">
              Your position will be 100%{' '}
              {rateSort
                ? tokenMetadata_x_y && tokenMetadata_x_y[0].symbol
                : tokenMetadata_x_y && tokenMetadata_x_y[1].symbol}{' '}
              at this price
            </p>
          </div>
          <div className="flex flex-col items-center  bg-black bg-opacity-20 rounded-xl  px-3.5 py-5">
            <span className="text-xs text-primaryText">Max Price</span>
            <span className="text-white text-xl my-2">{getRate('right')}</span>
            <p className="text-xs text-primaryText text-center">
              Your position will be 100%{' '}
              {rateSort
                ? tokenMetadata_x_y && tokenMetadata_x_y[1].symbol
                : tokenMetadata_x_y && tokenMetadata_x_y[0].symbol}{' '}
              at this price
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between bg-black bg-opacity-20 mt-2 rounded-xl px-3.5 py-3">
          <span className="text-xs text-primaryText">Current Price</span>
          <span className="text-xl text-white">{getRate('current')}</span>
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
      </div>
      <RemovePoolV3
        isOpen={showRemoveBox}
        onRequestClose={() => {
          setShowRemoveBox(false);
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
      ></RemovePoolV3>
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
