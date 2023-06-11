import { path } from 'animejs';
import React, { useEffect, useMemo, useState, useContext, useRef } from 'react';
import { FormattedMessage } from 'react-intl';
import { WalletContext } from '../../utils/wallets-integration';
import { useHistory } from 'react-router-dom';
import { Card } from '~components/card/Card';
import { isMobile } from '~utils/device';
import { ModalClose } from '~components/icon';
import { TokenMetadata } from '../../services/ft-contract';
import { SwitchButton, Slider } from '~components/icon/V3';
import {
  GradientButton,
  ButtonTextWrapper,
  ConnectToNearBtn,
} from '../../components/button/Button';
import { PoolSlippageSelectorV3 } from '~components/forms/SlippageSelector';
import Modal from 'react-modal';
import BigNumber from 'bignumber.js';
import {
  toPrecision,
  toReadableNumber,
  toNonDivisibleNumber,
  formatWithCommas,
  ONLY_ZEROS,
} from '~utils/numbers';
import {
  getPriceByPoint,
  CONSTANT_D,
  UserLiquidityInfo,
  getXAmount_per_point_by_Lx,
  getYAmount_per_point_by_Ly,
  sort_tokens_by_base,
  POINTRIGHTRANGE,
  getPointByPrice,
} from '../../services/commonV3';
import {
  PoolInfo,
  pointToPrice,
  priceToPoint,
  remove_liquidity,
} from '../../services/swapV3';
import _ from 'lodash';
import { REF_POOL_NAV_TAB_KEY } from './PoolTabV3';
import { useWalletSelector } from '~context/WalletSelectorContext';
import { getDclUserPoints } from '../../services/indexer';
import { SLOT_NUMBER } from '../../services/near';
import Big from 'big.js';
import { IntegerInputComponent } from '../../pages/poolsV3/AddYourLiquidityPageV3';

export type RemoveType = 'left' | 'right' | 'all';

export const RemovePoolV3 = (props: any) => {
  const {
    tokenMetadata_x_y,
    poolDetail,
    userLiquidity,
    tokenPriceList,
    isLegacy,
    listLiquidities,
    ...restProps
  }: {
    tokenMetadata_x_y: TokenMetadata[];
    poolDetail: PoolInfo;
    userLiquidity: UserLiquidityInfo;
    tokenPriceList: any;
    isLegacy?: boolean;
    restProps: any;
    listLiquidities: UserLiquidityInfo[];
  } = props;

  const [slippageTolerance, setSlippageTolerance] = useState<number>(0.5);
  const [tokenXAmount, setTokenXAmount] = useState('');
  const [tokenYAmount, setTokenYAmount] = useState('');

  const tokens = sort_tokens_by_base(tokenMetadata_x_y);
  const { decimals: token_y_decimals } = tokens[1];
  const { decimals: token_x_decimals } = tokens[0];
  console.log('poolDetail: ', poolDetail);

  console.log('tokenMetadata_x_y: ', tokenMetadata_x_y);

  //  all your liquidity amount
  const [liquidityAmount, setLiquidityAmount] = useState('');
  console.log('liquidityAmount: ', liquidityAmount);

  const [removeAmount, setRemoveAmount] = useState('');
  const [removeTokenXAmount, setRemoveTokenXAmount] = useState('');
  const [removeTokenYAmount, setRemoveTokenYAmount] = useState('');
  const [isInrange, setIsInrange] = useState<boolean>(true);
  const [removeLoading, setRemoveLoading] = useState<boolean>(false);
  const [rateDirection, setRateDirection] = useState<boolean>(true);
  const [removePercentAmount, setRemovePercentAmount] = useState<string>('100');
  const [removeType, setRemoveType] = useState<RemoveType>('left');

  const { accountId } = useWalletSelector();

  const BIN_SIZE = poolDetail.point_delta * SLOT_NUMBER;

  const [minPrice, setMinPrice] = useState<string>('');

  const [maxPrice, setMaxPrice] = useState<string>('');

  // left boundry point
  const [leftPoint, setLeftPoint] = useState<number>();

  // right boundry point
  const [rightPoint, setRightPoint] = useState<number>();

  const [binAmount, setBinAmount] = useState<string>('');

  const [maxBinAmount, setMaxBinAmount] = useState<string>();

  const [dclUserPoints, setDclUserPoints] = useState<any[]>();

  const [changeType, setChangeType] = useState<'min' | 'max'>();

  useEffect(() => {
    if (!dclUserPoints) return;

    const { point_delta } = poolDetail;

    const BIN_SIZE = point_delta * SLOT_NUMBER;

    const len = dclUserPoints.length;

    const left_point = dclUserPoints[0].point;
    console.log('left_point: ', left_point);

    const right_point = dclUserPoints[len - 1].point;
    console.log('right_point: ', right_point);

    setLeftPoint(left_point);

    setRightPoint(right_point + BIN_SIZE);

    const calcBinAmount = new Big(right_point)
      .plus(new Big(BIN_SIZE))
      .minus(left_point)
      .div(new Big(BIN_SIZE))
      .toFixed(0);

    console.log('calcBinAmount: ', calcBinAmount);

    setBinAmount(calcBinAmount);

    setMaxBinAmount(calcBinAmount);

    const { decimals: token_y_decimals } = tokens[1];
    const { decimals: token_x_decimals } = tokens[0];

    const decimalRate =
      Math.pow(10, token_y_decimals) / Math.pow(10, token_x_decimals);

    const minPrice = getPriceByPoint(left_point, decimalRate);

    const maxPrice = getPriceByPoint(right_point + BIN_SIZE, decimalRate);

    const displayMinPrice = toPrecision(minPrice, 8);

    const displayMaxPrice = toPrecision(maxPrice, 8);

    setMinPrice(displayMinPrice);
    setMaxPrice(displayMaxPrice);
  }, [dclUserPoints]);

  useEffect(() => {
    if (!poolDetail || !accountId) return;
    getDclUserPoints(poolDetail.pool_id, SLOT_NUMBER, accountId).then((res) => {
      setDclUserPoints(res);
    });
  }, [accountId]);

  useEffect(() => {
    if (removeType === 'all') {
      setRemovePercentAmount('100');
      setBinAmount(maxBinAmount);
    }
  }, [removeType]);

  useEffect(() => {
    if (removeType === 'all' || !poolDetail || !leftPoint || !rightPoint)
      return;

    const { point_delta, token_x, token_y } = poolDetail;

    if (removeType === 'left') {
      // set left price to left poin

      let decimalRate =
        Math.pow(10, token_y_decimals) / Math.pow(10, token_x_decimals);
      console.log('decimalRate11: ', decimalRate);

      const raw_left_price = getPriceByPoint(leftPoint, decimalRate);
      console.log('raw_left_price: ', raw_left_price);

      const left_price = toPrecision(raw_left_price, 8);
      console.log('left_price: ', left_price);

      const c_right_point = leftPoint + BIN_SIZE * Number(binAmount);

      console.log('c_right_point: ', c_right_point);

      const raw_right_price = getPriceByPoint(c_right_point, decimalRate);
      console.log('raw_right_price: ', raw_right_price);

      const text_right_point = getPointByPrice(
        point_delta,
        raw_right_price,
        1 / decimalRate
      );
      console.log('text_right_point: ', text_right_point);

      const right_price = toPrecision(raw_right_price, 8);

      setMaxPrice(right_price);

      const removePercent = new Big(c_right_point)
        .minus(leftPoint)
        .div(new Big(rightPoint).minus(leftPoint))
        .mul(100)
        .toFixed(0);
      console.log('removePercent: ', removePercent);

      setRemovePercentAmount(removePercent);

      setMinPrice(left_price);
    }
  }, [binAmount, poolDetail]);

  // const [removePercentList] = useState([0, 25, 50, 75, 100]);
  const { globalState } = useContext(WalletContext);
  const v3PoolRemoveRef = useRef(null);
  const sliderRef = useRef(null);
  const isSignedIn = globalState.isSignedIn;
  useEffect(() => {
    if (tokens && poolDetail && listLiquidities) {
      // const { current_point } = poolDetail;
      // const { left_point, right_point } = userLiquidity;
      // if (current_point >= left_point && right_point > current_point) {
      //   setIsInrange(true);
      // } else {
      //   setIsInrange(false);
      // }
      get_liquidity_x_y();
      getLiquidityAmount();
    }
  }, [tokens, userLiquidity, poolDetail, listLiquidities]);
  useEffect(() => {
    if (liquidityAmount) {
      changeRemoveAmount('100');
    }
  }, [liquidityAmount]);
  useEffect(() => {
    if (v3PoolRemoveRef.current) {
      v3PoolRemoveRef.current.style.backgroundSize = `${removePercentAmount}% 100%`;
    }
    if (sliderRef.current) {
      sliderRef.current.style.left = `${+removePercentAmount}%`;
      const marginLeft = -13 - (20 * +removePercentAmount) / 100;
      sliderRef.current.style.marginLeft = `${marginLeft}px`;
    }
  }, [removePercentAmount]);

  const step =
    !leftPoint || !rightPoint
      ? 'any'
      : new Big(100)
          .div(new Big(rightPoint).minus(new Big(leftPoint)).div(BIN_SIZE))
          .toFixed();

  function get_liquidity_x_y() {
    const [tokenX, tokenY] = tokenMetadata_x_y;

    const { tokenXAmount, tokenYAmount } = listLiquidities.reduce(
      (acc, userLiquidity) => {
        const { left_point, right_point, amount: L } = userLiquidity;
        const { current_point } = poolDetail;

        let curTokenXAmount = '0';
        let curTokenYAmount = '0';

        //  in range
        if (current_point >= left_point && right_point > current_point) {
          curTokenYAmount = getY(left_point, current_point, L, tokenY);
          curTokenXAmount = getX(current_point + 1, right_point, L, tokenX);
          const { amountx, amounty } = get_X_Y_In_CurrentPoint(
            tokenX,
            tokenY,
            L
          );

          return {
            tokenXAmount: new Big(acc.tokenXAmount)
              .plus(curTokenXAmount)
              .plus(amountx)
              .toFixed(),
            tokenYAmount: new Big(acc.tokenYAmount)
              .plus(curTokenYAmount)
              .plus(amounty)
              .toFixed(),
          };

          // setTokenXAmount(new BigNumber(tokenXAmount).plus(amountx).toFixed());
          // setTokenYAmount(new BigNumber(tokenYAmount).plus(amounty).toFixed());
        }
        // only y token
        if (current_point >= right_point) {
          curTokenYAmount = getY(left_point, right_point, L, tokenY);
          // setTokenYAmount(tokenYAmount);
          return {
            ...acc,
            tokenYAmount: new Big(acc.tokenYAmount)
              .plus(curTokenYAmount)
              .toFixed(),
          };
        }
        // only x token
        if (left_point > current_point) {
          curTokenXAmount = getX(left_point, right_point, L, tokenX);
          // setTokenXAmount(tokenXAmount);

          return {
            ...acc,
            tokenXAmount: new Big(acc.tokenXAmount)
              .plus(curTokenXAmount)
              .toFixed(),
          };
        }
      },
      {
        tokenXAmount: '0',
        tokenYAmount: '0',
      }
    );

    setTokenXAmount(tokenXAmount);
    setTokenYAmount(tokenYAmount);
  }

  // no change
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
      let total_price = tokenYTotalPrice.plus(tokenXTotalPrice);
      total_price = new BigNumber(removePercentAmount)
        .multipliedBy(total_price)
        .dividedBy(100);
      if (total_price.isEqualTo(0)) {
        return '$0';
      } else if (total_price.isLessThan('0.01')) {
        return '$<0.01';
      } else {
        return `$` + formatWithCommas(toPrecision(total_price.toFixed(), 2));
      }
    }
  }
  function getLiquidityAmount() {
    const liquidityAmountRaw = listLiquidities
      .reduce(
        (pre, cur) => {
          const { amount } = cur;

          return pre.plus(new Big(amount));
        },

        new Big(0)
      )
      .toFixed();

    console.log('liquidityAmountRaw: ', liquidityAmountRaw);

    setLiquidityAmount(liquidityAmountRaw);
  }

  function handlePriceToAppropriatePoint() {
    const { point_delta, token_x, token_y } = poolDetail;

    const { decimals: token_y_decimals } = tokens[1];
    const { decimals: token_x_decimals } = tokens[0];

    let decimalRate =
      Math.pow(10, token_y_decimals) / Math.pow(10, token_x_decimals);
    console.log('decimalRate: ', decimalRate);

    if (minPrice && changeType == 'min') {
      console.log('minPrice: ', minPrice);

      let c_point = getPointByPrice(point_delta, minPrice, 1 / decimalRate);
      console.log('c_point: ', c_point);
      console.log('leftPoint: ', leftPoint);

      if (c_point >= rightPoint) {
        c_point = rightPoint - BIN_SIZE;
      }
      if (c_point < leftPoint) {
        c_point = leftPoint;
      }

      if (
        !new Big(c_point)
          .minus(new Big(leftPoint))
          .div(BIN_SIZE || 1)
          .eq(0)
      ) {
        const new_point =
          Math.floor((c_point - leftPoint) / BIN_SIZE) * BIN_SIZE + leftPoint;

        console.log('new_point_min: ', new_point);

        const new_min_price = getPriceByPoint(new_point, decimalRate);
        console.log('new_min_price: ', new_min_price);

        setMinPrice(new_min_price);
      }

      //  formatted point
    }
    console.log('maxPrice: ', maxPrice);

    if (maxPrice && changeType == 'max') {
      console.log('maxPrice: ', maxPrice);

      let c_point = getPointByPrice(point_delta, maxPrice, 1 / decimalRate);
      console.log('right_point', rightPoint);
      console.log('c_point_max: ', c_point);
      if (c_point > rightPoint) {
        c_point = rightPoint;
      }
      if (c_point <= leftPoint) {
        c_point = leftPoint + BIN_SIZE;
      }

      if (
        new Big(c_point)
          .minus(new Big(leftPoint))
          .div(BIN_SIZE || 1)
          .eq(0)
      ) {
        return;
      } else {
        const new_point =
          Math.floor((c_point - leftPoint) / BIN_SIZE) * BIN_SIZE + leftPoint;

        console.log('new_point_max: ', new_point);

        const new_max_price = getPriceByPoint(new_point, decimalRate);
        console.log('new_max_price: ', new_max_price);
        setMaxPrice(new_max_price);
      }

      //  formatted point
    }
  }

  function priceToBinBoundry(amount: string) {}

  function displayLiquidityAmount() {
    if (liquidityAmount) {
      return toPrecision(liquidityAmount, 3);
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

  function getPoolFee() {
    if (poolDetail) {
      return poolDetail.fee / 10000;
    }
    return '';
  }
  function changeRemoveAmount(value: string) {
    setRemovePercentAmount(value);
    const amount = new BigNumber(liquidityAmount)
      .multipliedBy(value)
      .dividedBy(100)
      .toFixed(0, 1);

    setRemoveAmount(amount);
    getMinimumInfo(amount);

    if (!value || !maxBinAmount) {
      return;
    }

    const newBinAmount = new Big(value).div(100).mul(maxBinAmount).toFixed();

    setBinAmount(newBinAmount);
  }
  function getMinimumInfo(amount: string) {
    if (liquidityAmount) {
      const proportion = new BigNumber(amount || 0).dividedBy(liquidityAmount);
      setRemoveTokenXAmount(
        proportion.multipliedBy(tokenXAmount || '0').toFixed()
      );
      setRemoveTokenYAmount(
        proportion.multipliedBy(tokenYAmount || '0').toFixed()
      );
    }
  }
  function getMinTokenAmount() {
    const rate = 100 - slippageTolerance;
    const result: any = {};
    if (removeTokenXAmount) {
      const minX = new BigNumber(removeTokenXAmount || 0).multipliedBy(
        rate / 100
      );
      let displayX = '';
      if (minX.isEqualTo(0)) {
        displayX = '0';
      } else if (minX.isLessThan(0.001)) {
        displayX = '<0.001';
      } else {
        displayX = toPrecision(minX.toFixed(), 3);
      }
      result.minX = minX.toFixed();
      result.displayX = displayX;
    }
    if (removeTokenYAmount) {
      const minY = new BigNumber(removeTokenYAmount || 0).multipliedBy(
        rate / 100
      );
      let displayY = '';
      if (minY.isEqualTo(0)) {
        displayY = '0';
      } else if (minY.isLessThan(0.001)) {
        displayY = '<0.001';
      } else {
        displayY = toPrecision(minY.toFixed(), 3);
      }
      result.minY = minY.toFixed();
      result.displayY = displayY;
    }
    if (tokenPriceList && tokenMetadata_x_y) {
      const [tokenX, tokenY] = tokenMetadata_x_y;
      const priceX = tokenPriceList[tokenX.id]?.price || 0;
      const priceY = tokenPriceList[tokenY.id]?.price || 0;
      const tokenXTotalPrice = new BigNumber(result.minX || 0).multipliedBy(
        priceX
      );
      const tokenYTotalPrice = new BigNumber(result.minY || 0).multipliedBy(
        priceY
      );
      const total_price = tokenYTotalPrice.plus(tokenXTotalPrice);
      if (total_price.isEqualTo(0)) {
        result.minPrice = '$0';
      } else if (total_price.isLessThan('0.001')) {
        result.minPrice = '<$0.001';
      } else {
        result.minPrice = `$` + toPrecision(total_price.toFixed(), 3);
      }
    }
    return result;
  }

  function remove() {
    setRemoveLoading(true);
    const [tokenX, tokenY] = tokenMetadata_x_y;
    const { lpt_id, mft_id } = userLiquidity;

    sessionStorage.setItem(REF_POOL_NAV_TAB_KEY, '/yourliquidity');


    // replace to batch remove lp
    remove_liquidity({
      token_x: tokenX,
      token_y: tokenY,
      lpt_id,
      mft_id,
      amount: removeAmount,
      min_amount_x: toNonDivisibleNumber(tokenX.decimals, MINDATA.minX),
      min_amount_y: toNonDivisibleNumber(tokenY.decimals, MINDATA.minY),
      isLegacy,
    });
  }
  function switchRate() {
    setRateDirection(!rateDirection);
  }
  function getCurrentPrice(type: string) {
    if (poolDetail && tokenMetadata_x_y) {
      const { current_point } = poolDetail;
      const [tokenX, tokenY] = tokenMetadata_x_y;
      const rate =
        Math.pow(10, tokenX.decimals) / Math.pow(10, tokenY.decimals);
      let price = getPriceByPoint(current_point, rate);
      if (type == 'l') {
        price = new BigNumber('1').dividedBy(price).toFixed();
      }

      const price_big = new BigNumber(price);
      if (price_big.isLessThan('0.001')) {
        return '<0.001';
      } else {
        return toPrecision(price, 6);
      }
    }
  }
  function getTokenPrice(type: string) {
    if (tokenPriceList && tokenMetadata_x_y) {
      const [tokenX, tokenY] = tokenMetadata_x_y;
      if (type == 'l') {
        return tokenPriceList[tokenX.id]?.price || '-';
      }
      if (type == 'r') {
        return tokenPriceList[tokenY.id]?.price || '-';
      }
    }
    return '-';
  }
  const MINDATA: {
    minX: string;
    displayX: string;
    minY: string;
    displayY: string;
    minPrice: string;
  } = getMinTokenAmount();
  const isRemoveLiquidityDisabled = !(
    +removeAmount > 0 &&
    new BigNumber(removeAmount || 0).isLessThanOrEqualTo(liquidityAmount || 0)
  );

  return (
    <Modal {...restProps}>
      <Card
        style={{ maxHeight: '95vh', minWidth: '550px' }}
        className={`outline-none border border-gradientFrom border-opacity-50 overflow-auto xsm: p-5 xs:w-90vw md:w-90vw lg:w-40vw xl:w-30vw`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xl text-white">
            <FormattedMessage id="remove_liquidity"></FormattedMessage>
          </span>
          <div className="cursor-pointer" onClick={props.onRequestClose}>
            <ModalClose />
          </div>
        </div>
        <div className="flex items-center justify-between mt-6 flex-wrap">
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              <img
                src={tokens[0]?.icon}
                className="w-8 h-8 border border-greenColor rounded-full"
              ></img>
              <img
                src={tokens[1]?.icon}
                className="relative w-8 h-8 border border-greenColor rounded-full -ml-1.5"
              ></img>
            </div>
            <span className="text-white text-base font-bold ml-2.5">
              {tokens[0]?.symbol}/{tokens[1]?.symbol}
            </span>
          </div>
          <span className="text-white text-lg mb-2">{getLiquidityPrice()}</span>
        </div>

        <div className="mt-3 frcb ">
          <div className="text-primaryText text-xs">
            <FormattedMessage
              id="remove"
              defaultMessage={'Remove'}
            ></FormattedMessage>
          </div>
          <div className="frcs gap-2 text-xs text-primaryText">
            <div
              className={`p-2 border border-v3LiquidityRemoveBarColor  cursor-pointer rounded-lg
      ${removeType === 'left' ? 'bg-gradientFromHover text-black' : ''}
      
      `}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setRemoveType('left');
              }}
            >
              <FormattedMessage
                id="from_left"
                defaultMessage={'From left'}
              ></FormattedMessage>
            </div>

            <div
              className={`p-2 border border-v3LiquidityRemoveBarColor  cursor-pointer rounded-lg
      ${removeType === 'right' ? 'bg-gradientFromHover text-black' : ''}
      
      `}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setRemoveType('right');
              }}
            >
              <FormattedMessage
                id="from_right"
                defaultMessage={'From right'}
              ></FormattedMessage>
            </div>

            <div
              className={`p-2 border border-v3LiquidityRemoveBarColor  cursor-pointer rounded-lg
      ${removeType === 'all' ? 'bg-gradientFromHover text-black' : ''}
      
      `}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setRemoveType('all');
              }}
            >
              <FormattedMessage
                id="all"
                defaultMessage={'All'}
              ></FormattedMessage>
            </div>
          </div>
        </div>

        <div className={`my-3 ${liquidityAmount ? '' : 'hidden'}`}>
          {/* <div className="flex justify-between items-center mb-3 -mx-3">
            {removePercentList.map((p) => {
              return (
                <div
                  key={p}
                  className={`flex flex-col items-center ${
                    isLegacy ? 'cursor-not-allowed' : 'cursor-pointer'
                  }`}
                  onClick={() => {
                    if (isLegacy) return;
                    changeRemoveAmount(p.toString());
                  }}
                >
                  <span
                    className={`flex items-center justify-center text-xs text-primaryText w-11 py-1 border border-transparent hover:border-v3LiquidityRemoveBarColor rounded-lg ${
                      p == +removePercentAmount ? 'bg-black bg-opacity-20' : ''
                    }`}
                  >
                    {p}%
                  </span>
                  <label
                    style={{ height: '5px', width: '1px' }}
                    className="bg-primaryText mt-1"
                  ></label>
                </div>
              );
            })}
          </div> */}
          <input
            ref={v3PoolRemoveRef}
            onChange={(e) => {
              changeRemoveAmount(e.target.value);
            }}
            disabled={removeType === 'all' || isLegacy ? true : false}
            value={removePercentAmount}
            type="range"
            className={`w-full ${
              isLegacy ? 'pause cursor-not-allowed' : 'cursor-pointer'
            }`}
            style={{ backgroundSize: '100% 100%' }}
            min="0"
            max="100"
            step={step}
          />
          {/* <div
              className="flex items-center justify-center absolute top-5"
              style={{ marginLeft: '-33px', left: '100%' }}
              ref={sliderRef}
            >
              <Slider></Slider>
              <span className="absolute text-sm text-black top-2.5">
                {toPrecision(removePercentAmount.toString(), 0)}%
              </span>
            </div> */}
        </div>

        <div className="mb-3  text-base grid grid-cols-3 gap-2 w-full">
          {/* min price  */}

          <div className="frcs w-full border border-menuMoreBoxBorderColor py-2 px-3 rounded-xl col-span-1">
            <span className="text-xs min-w-max text-primaryText">
              <FormattedMessage
                id="min_price"
                defaultMessage={'Min Price'}
              ></FormattedMessage>
            </span>

            <input
              className={`ml-2 font-gothamBold ${
                removeType !== 'right' ? 'text-primaryText' : 'text-white'
              }`}
              min={0}
              max={maxPrice}
              value={minPrice}
              onChange={(e) => {
                const value = e.target.value;
                setChangeType('min');
                setMinPrice(value);
              }}
              inputMode="decimal"
              onBlur={() => {
                handlePriceToAppropriatePoint();
              }}
              disabled={removeType !== 'right'}
            ></input>
          </div>

          <div className="frcs w-full border border-menuMoreBoxBorderColor py-2 px-3 rounded-xl col-span-1">
            <span className="text-xs min-w-max text-primaryText">
              <FormattedMessage
                id="max_price"
                defaultMessage={'Max Price'}
              ></FormattedMessage>
            </span>
            <input
              className={`ml-2 font-gothamBold ${
                removeType !== 'left' ? 'text-primaryText' : 'text-white'
              }`}
              onChange={(e) => {
                const value = e.target.value;
                setChangeType('max');
                setMaxPrice(value);
              }}
              min={0}
              value={maxPrice}
              inputMode="decimal"
              onBlur={() => {
                handlePriceToAppropriatePoint();
              }}
            ></input>
          </div>

          <div className="frcs w-full border border-menuMoreBoxBorderColor py-2 px-3 rounded-xl col-span-1">
            <span className="text-xs  min-w-max text-primaryText">
              <FormattedMessage id="bin_amount" defaultMessage={'Bin Amount'} />
            </span>

            <IntegerInputComponent
              value={binAmount}
              className="ml-2"
              onChange={setBinAmount}
              disabled={removeType === 'all'}
            />
          </div>
        </div>

        <div>
          <PoolSlippageSelectorV3
            slippageTolerance={slippageTolerance}
            onChange={setSlippageTolerance}
            textColor="text-white"
          />
        </div>
        <div
          className="mt-6"
          style={{ border: '1px solid rgba(110, 124, 133, 0.2)' }}
        ></div>
        <div className="frcb mt-4">
          <span className="text-sm text-white">
            <FormattedMessage id="minimum_tokens_out"></FormattedMessage>
          </span>

          <div className="frcs gap-8">
            <div className="frcs gap-2 ">
              <img
                src={tokenMetadata_x_y && tokenMetadata_x_y[0].icon}
                className="w-5 h-5 border border-greenColor rounded-full"
              ></img>

              <span className="text-lg font-gothamBold text-white">
                {MINDATA.displayX || '-'}
              </span>
            </div>
            <div
              className="frcs gap-2 "
              style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.08)' }}
            >
              <img
                src={tokenMetadata_x_y && tokenMetadata_x_y[1].icon}
                className="w-5 h-5 border border-greenColor rounded-full"
              ></img>

              <span className="text-lg font-gothamBold text-white">
                {MINDATA.displayY || '-'}
              </span>
            </div>
          </div>
        </div>

        {isSignedIn ? (
          <GradientButton
            onClick={remove}
            color="#fff"
            disabled={removeLoading || isRemoveLiquidityDisabled}
            loading={removeLoading || isRemoveLiquidityDisabled}
            btnClassName={`${
              isRemoveLiquidityDisabled ? 'cursor-not-allowed' : ''
            }`}
            className={`mt-8 w-full h-14 text-center text-lg text-white focus:outline-none font-semibold`}
            backgroundImage="linear-gradient(180deg, #C0B1A3 0%, #92877D 100%)"
          >
            <ButtonTextWrapper
              loading={removeLoading}
              Text={() => <FormattedMessage id="remove" />}
            />
          </GradientButton>
        ) : (
          <div className="mt-10">
            <ConnectToNearBtn></ConnectToNearBtn>
          </div>
        )}
      </Card>
    </Modal>
  );
};
