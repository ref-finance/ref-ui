import { path } from 'animejs';
import React, { useEffect, useMemo, useState, useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { WalletContext } from '../../utils/wallets-integration';
import { useHistory } from 'react-router-dom';
import { Card } from '~components/card/Card';
import { isMobile } from '~utils/device';
import { ModalClose } from '~components/icon';
import { TokenMetadata } from '../../services/ft-contract';
import { SwitchButton } from '~components/icon/V3';
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
} from '~utils/numbers';
import {
  getPriceByPoint,
  CONSTANT_D,
  UserLiquidityInfo,
} from '../../services/commonV3';
import { PoolInfo, remove_liquidity } from '../../services/swapV3';
import _ from 'lodash';
export const RemovePoolV3 = (props: any) => {
  const {
    tokenMetadata_x_y,
    poolDetail,
    userLiquidity,
    tokenPriceList,
    ...restProps
  }: {
    tokenMetadata_x_y: TokenMetadata[];
    poolDetail: PoolInfo;
    userLiquidity: UserLiquidityInfo;
    tokenPriceList: any;
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
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const cardWidth = isMobile() ? '90vw' : '30vw';
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
  function get_liquidity_x_y() {
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
      const total_price = tokenYTotalPrice.plus(tokenXTotalPrice);
      if (total_price.isEqualTo(0)) {
        return '$0';
      } else if (total_price.isLessThan('0.001')) {
        return '$<0.001';
      } else {
        return `$` + toPrecision(total_price.toFixed(), 3);
      }
    }
  }
  function getLiquidityAmount() {
    const [tokenX, tokenY] = tokenMetadata_x_y;
    const { amount } = userLiquidity;
    const decimals = _.min([tokenX.decimals, tokenY.decimals]);
    setLiquidityAmount(toReadableNumber(decimals, amount));
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
  function getPoolFee() {
    if (poolDetail) {
      return poolDetail.fee / 10000;
    }
    return '';
  }
  function changeRemoveAmount(amount: string) {
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
    const decimals = _.min([tokenX.decimals, tokenY.decimals]);
    remove_liquidity({
      token_x: tokenX,
      token_y: tokenY,
      lpt_id: userLiquidity.lpt_id,
      amount: toNonDivisibleNumber(decimals, removeAmount),
      min_amount_x: toNonDivisibleNumber(tokenX.decimals, MINDATA.minX),
      min_amount_y: toNonDivisibleNumber(tokenY.decimals, MINDATA.minY),
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
        style={{ width: cardWidth, maxHeight: '95vh' }}
        className="outline-none border border-gradientFrom border-opacity-50 overflow-auto xs:p-4 md:p-4"
      >
        <div className="flex items-center justify-between">
          <span className="text-xl text-white">
            <FormattedMessage id="remove_liquidity"></FormattedMessage>
          </span>
          <div className="cursor-pointer" onClick={props.onRequestClose}>
            <ModalClose />
          </div>
        </div>
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center">
            <div className="flex items-center">
              <img
                src={tokenMetadata_x_y && tokenMetadata_x_y[0].icon}
                className="w-8 h-8 border border-greenColor rounded-full"
              ></img>
              <img
                src={tokenMetadata_x_y && tokenMetadata_x_y[1].icon}
                className="relative w-8 h-8 border border-greenColor rounded-full -ml-1.5"
              ></img>
            </div>
            <span className="text-white text-base font-bold ml-2.5">
              {tokenMetadata_x_y && tokenMetadata_x_y[0].symbol}/
              {tokenMetadata_x_y && tokenMetadata_x_y[1].symbol}
            </span>
          </div>
          <span className="text-white text-lg">{displayLiquidityAmount()}</span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center">
            <div className="flex items-center justify-center bg-black bg-opacity-25 rounded-2xl px-3 h-6 py-0.5">
              <span className="text-xs text-v3SwapGray mr-1.5">Fee Tiers</span>
              <span className="text-sm text-v3Blue">{getPoolFee()}%</span>
            </div>
            <div className="flex items-center justify-center bg-black bg-opacity-25 rounded-2xl px-3 h-6 py-0.5 ml-2.5">
              <span
                className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mr-1.5 ${
                  isInrange ? 'bg-gradientFromHover' : 'bg-v3GarkWarningColor'
                }`}
              ></span>
              <span
                className={`text-xs ${
                  isInrange
                    ? 'text-gradientFromHover'
                    : 'text-v3GarkWarningColor'
                }`}
              >
                {isInrange ? 'In range' : 'Out of range'}
              </span>
            </div>
          </div>
          <span className="text-sm text-v3SwapGray">
            ~{getLiquidityPrice()}
          </span>
        </div>
        <div className="flex items-center mt-4">
          <div
            onClick={switchRate}
            className="flex items-center justify-center rounded-full bg-black bg-opacity-25 w-4 h-4 cursor-pointer mr-1.5"
          >
            <SwitchButton></SwitchButton>
          </div>
          <div
            className={`text-white text-sm ${rateDirection ? '' : 'hidden'}`}
          >
            1 {tokenMetadata_x_y && tokenMetadata_x_y[0].symbol}{' '}
            <span style={{ color: '#91a2ae' }}>(${getTokenPrice('l')})</span> ={' '}
            {getCurrentPrice('r')}
            {tokenMetadata_x_y && tokenMetadata_x_y[1].symbol}
          </div>
          <div
            className={`text-white text-sm ${rateDirection ? 'hidden' : ''}`}
          >
            1 {tokenMetadata_x_y && tokenMetadata_x_y[1].symbol}{' '}
            <span style={{ color: '#91a2ae' }}>(${getTokenPrice('r')})</span> ={' '}
            {getCurrentPrice('l')}
            {tokenMetadata_x_y && tokenMetadata_x_y[0].symbol}
          </div>
        </div>
        <div className="flex justify-between items-center h-14 px-3 mt-5 bg-black bg-opacity-20 rounded-lg">
          <input
            type="number"
            placeholder="0.0"
            value={removeAmount}
            onChange={({ target }) => changeRemoveAmount(target.value)}
            className="text-white text-lg focus:outline-non appearance-none leading-tight"
          ></input>
          <div className="flex items-center ml-2">
            <span
              onClick={() => {
                changeRemoveAmount(liquidityAmount);
              }}
              className={`text-xs text-farmText px-1.5 py-0.5 rounded-lg border cursor-pointer hover:text-greenColor hover:border-greenColor ${
                removeAmount == liquidityAmount
                  ? 'bg-black bg-opacity-20 border-black border-opacity-20'
                  : 'border-maxBorderColor'
              }`}
            >
              Max
            </span>
          </div>
        </div>
        <div className="mt-5">
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
          <span className="text-sm text-v3SwapGray">
            ~{MINDATA.minPrice || '$-'}
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
          <ConnectToNearBtn></ConnectToNearBtn>
        )}
      </Card>
    </Modal>
  );
};
