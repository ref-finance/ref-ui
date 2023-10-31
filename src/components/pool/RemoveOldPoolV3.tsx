import { path } from 'animejs';
import React, { useEffect, useMemo, useState, useContext, useRef } from 'react';
import { FormattedMessage } from 'react-intl';
import { WalletContext } from '../../utils/wallets-integration';
import { useHistory } from 'react-router-dom';
import { Card } from 'src/components/card/Card';
import { isMobile } from '~utils/device';
import { ModalClose } from 'src/components/icon';
import { TokenMetadata } from '../../services/ft-contract';
import { SwitchButton, Slider } from 'src/components/icon/V3';
import {
  GradientButton,
  ButtonTextWrapper,
  ConnectToNearBtn,
} from '../../components/button/Button';
import { PoolSlippageSelectorV3 } from 'src/components/forms/SlippageSelector';
import Modal from 'react-modal';
import BigNumber from 'bignumber.js';
import {
  toPrecision,
  toReadableNumber,
  toNonDivisibleNumber,
  formatWithCommas,
} from 'src/utils/numbers';
import {
  getPriceByPoint,
  CONSTANT_D,
  UserLiquidityInfo,
  getXAmount_per_point_by_Lx,
  getYAmount_per_point_by_Ly,
  sort_tokens_by_base,
} from '../../services/commonV3';
import { PoolInfo, remove_liquidity } from '../../services/swapV3';
import _ from 'lodash';
import { REF_POOL_NAV_TAB_KEY } from './PoolTabV3';
export const RemoveOldPoolV3 = (props: any) => {
  const {
    tokenMetadata_x_y,
    poolDetail,
    userLiquidity,
    tokenPriceList,
    isLegacy,
    ...restProps
  }: {
    tokenMetadata_x_y: TokenMetadata[];
    poolDetail: PoolInfo;
    userLiquidity: UserLiquidityInfo;
    tokenPriceList: any;
    isLegacy?: boolean;
    restProps: any;
  } = props;
  const [slippageTolerance, setSlippageTolerance] = useState<number>(0.5);
  const [tokenXAmount, setTokenXAmount] = useState('');
  const [tokenYAmount, setTokenYAmount] = useState('');
  const [liquidityAmount, setLiquidityAmount] = useState('');
  const [removeAmount, setRemoveAmount] = useState('');
  const [removeTokenXAmount, setRemoveTokenXAmount] = useState('');
  const [removeTokenYAmount, setRemoveTokenYAmount] = useState('');
  const [isInrange, setIsInrange] = useState<boolean>(true);
  const [removeLoading, setRemoveLoading] = useState<boolean>(false);
  const [rateDirection, setRateDirection] = useState<boolean>(true);
  const [removePercentAmount, setRemovePercentAmount] = useState<string>('100');
  const [removePercentList] = useState([0, 25, 50, 75, 100]);
  const { globalState } = useContext(WalletContext);
  const v3PoolRemoveRef = useRef(null);
  const sliderRef = useRef(null);
  const isSignedIn = globalState.isSignedIn;
  useEffect(() => {
    if (tokenMetadata_x_y && userLiquidity && poolDetail) {
      const { current_point } = poolDetail;
      const { left_point, right_point } = userLiquidity;
      if (current_point >= left_point && right_point > current_point) {
        setIsInrange(true);
      } else {
        setIsInrange(false);
      }
      get_liquidity_x_y();
      getLiquidityAmount();
    }
  }, [tokenMetadata_x_y, userLiquidity, poolDetail]);
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
    const { amount } = userLiquidity;
    setLiquidityAmount(amount);
  }

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
  const tokens = sort_tokens_by_base(tokenMetadata_x_y);
  return (
    <Modal {...restProps}>
      <Card
        style={{ maxHeight: '95vh' }}
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
        <div
          className={`mt-10 xsm:mt-6 mb-20 xsm:mb-16 ${
            liquidityAmount ? '' : 'hidden'
          }`}
        >
          <div className="flex justify-between items-center mb-3 -mx-3">
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
          </div>
          <div className={`relative flex flex-col`}>
            <input
              ref={v3PoolRemoveRef}
              onChange={(e) => {
                changeRemoveAmount(e.target.value);
              }}
              disabled={isLegacy ? true : false}
              value={removePercentAmount}
              type="range"
              className={`w-full ${
                isLegacy ? 'pause cursor-not-allowed' : 'cursor-pointer'
              }`}
              style={{ backgroundSize: '100% 100%' }}
              min="0"
              max="100"
              step="any"
            />
            <div
              className="flex items-center justify-center absolute top-5"
              style={{ marginLeft: '-33px', left: '100%' }}
              ref={sliderRef}
            >
              <Slider></Slider>
              <span className="absolute text-sm text-black top-2.5">
                {toPrecision(removePercentAmount.toString(), 0)}%
              </span>
            </div>
          </div>
        </div>
        <div>
          <PoolSlippageSelectorV3
            slippageTolerance={slippageTolerance}
            onChange={setSlippageTolerance}
          />
        </div>
        <div
          className="mt-6"
          style={{ border: '1px solid rgba(110, 124, 133, 0.2)' }}
        ></div>
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-farmText">
            <FormattedMessage id="minimum_tokens_out"></FormattedMessage>
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col justify-center items-center mt-6 w-1 flex-grow">
            <span className="text-xl font-bold text-white">
              {MINDATA.displayX || '-'}
            </span>
            <div className="flex items-center mt-2.5">
              <img
                src={tokenMetadata_x_y && tokenMetadata_x_y[0].icon}
                className="w-5 h-5 border border-greenColor rounded-full"
              ></img>
              <span className="text-sm text-farmText ml-1">
                {tokenMetadata_x_y && tokenMetadata_x_y[0].symbol}
              </span>
            </div>
          </div>
          <div
            className="flex flex-col justify-center items-center mt-6 w-1 flex-grow"
            style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.08)' }}
          >
            <span className="text-xl font-bold text-white">
              {MINDATA.displayY || '-'}
            </span>
            <div className="flex items-center mt-2.5">
              <img
                src={tokenMetadata_x_y && tokenMetadata_x_y[1].icon}
                className="w-5 h-5 border border-greenColor rounded-full"
              ></img>
              <span className="text-sm text-farmText ml-1">
                {tokenMetadata_x_y && tokenMetadata_x_y[1].symbol}
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
            backgroundImage="linear-gradient(270deg, #7F43FF 0%, #00C6A2 97.06%)"
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
