import { path } from 'animejs';
import React, { useEffect, useMemo, useState, useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { Card } from '~components/card/Card';
import { isMobile } from '~utils/device';
import { ModalClose } from '~components/icon';
import {
  BoxDarkBg,
  SideIcon,
  AddButton,
  ReduceButton,
  InvalidIcon,
} from '~components/icon/V3';
import { ArrowDownV3 } from '~components/icon/swapV3';
import {
  GradientButton,
  ButtonTextWrapper,
  ConnectToNearBtn,
} from '../../components/button/Button';

import { WalletContext } from '~utils/wallets-integration';
import { PoolSlippageSelectorV3 } from '~components/forms/SlippageSelector';
import Modal from 'react-modal';
import BigNumber from 'bignumber.js';
import {
  formatWithCommas,
  toPrecision,
  toReadableNumber,
  toNonDivisibleNumber,
} from '~utils/numbers';
import {
  getPriceByPoint,
  getPointByPrice,
  CONSTANT_D,
  FEELIST,
  POINTDELTAMAP,
  DEFAULTSELECTEDFEE,
  POINTLEFTRANGE,
  POINTRIGHTRANGE,
  useAddAndRemoveUrlHandle,
  drawChartData,
  TOKEN_LIST_FOR_RATE,
} from '../../services/commonV3';
import {
  PoolInfo,
  add_liquidity,
  append_liquidity,
} from '../../services/swapV3';
import { toRealSymbol } from '../../utils/token';
import { WRAP_NEAR_CONTRACT_ID } from '../../services/wrap-near';
import { TokenMetadata, ftGetBalance } from '../../services/ft-contract';
import { useDepositableBalance } from '../../state/token';
import { Seed } from '~services/farm';
import _ from 'lodash';
export const AddNewPoolV3 = (props: any) => {
  const {
    tokenPriceList,
    seed,
    ...restProps
  }: {
    seed: Seed;
    tokenPriceList: any;
    restProps: any;
  } = props;
  const { pool: poolDetail, seed_id } = seed;
  const [contractId, temp_pool_id] = seed_id.split('@');
  const [fixRange, dcl_pool_id, temp_left_point, temp_right_point] =
    temp_pool_id.split('&');
  const seed_left_point = +temp_left_point;
  const seed_right_point = +temp_right_point;
  const tokenMetadata_x_y: TokenMetadata[] = poolDetail.tokens_meta_data;
  const [tokenXAmount, setTokenXAmount] = useState('');
  const [tokenYAmount, setTokenYAmount] = useState('');
  const [tokenXBalanceFromNear, setTokenXBalanceFromNear] = useState<string>();
  const [tokenYBalanceFromNear, setTokenYBalanceFromNear] = useState<string>();
  const [custom_left_point, setCustom_left_point] = useState(seed_left_point);
  const [custom_right_point, setCustom_right_point] =
    useState(seed_right_point);
  let [custom_left_price, setCustom_left_price] = useState('');
  let [custom_right_price, setCustom_right_price] = useState('');
  const [addLoading, setAddLoading] = useState<boolean>(false);
  const [onlyAddYToken, setOnlyAddYToken] = useState(false);
  const [onlyAddXToken, setOnlyAddXToken] = useState(false);
  const [invalidRange, setInvalidRange] = useState(false);
  const [leftInputStatus, setLeftInputStatus] = useState(false);
  const [rightInputStatus, setRightInputStatus] = useState(false);
  const [showCustomPointArea, setShowCustomPointArea] = useState(false);
  const [hover, setHover] = useState(false);
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const nearBalance = useDepositableBalance('NEAR');
  const cardWidth = isMobile() ? '90vw' : '500px';
  const rate_need_to_reverse_display = useMemo(() => {
    if (tokenMetadata_x_y) {
      const [tokenX] = tokenMetadata_x_y;
      if (TOKEN_LIST_FOR_RATE.indexOf(tokenX.symbol) > -1) return true;
      return false;
    }
  }, [tokenMetadata_x_y]);
  useEffect(() => {
    if (tokenMetadata_x_y && isSignedIn && nearBalance) {
      const [tokenX, tokenY] = tokenMetadata_x_y;
      ftGetBalance(tokenX.id).then((available: string) =>
        setTokenXBalanceFromNear(
          toReadableNumber(
            tokenX.decimals,
            tokenX.id === WRAP_NEAR_CONTRACT_ID ? nearBalance : available
          )
        )
      );
      ftGetBalance(tokenY.id).then((available: string) =>
        setTokenYBalanceFromNear(
          toReadableNumber(
            tokenY.decimals,
            tokenY.id === WRAP_NEAR_CONTRACT_ID ? nearBalance : available
          )
        )
      );
    }
  }, [tokenMetadata_x_y, isSignedIn, nearBalance]);
  useEffect(() => {
    pointChange({
      leftPoint: custom_left_point,
      rightPoint: custom_right_point,
      currentPoint: poolDetail.current_point,
    });
  }, [custom_left_point, custom_right_point]);
  function getTokenYAmountByCondition({
    amount,
    leftPoint,
    rightPoint,
    currentPoint,
  }: {
    amount: string;
    leftPoint: number;
    rightPoint: number;
    currentPoint: number;
  }) {
    const [tokenX, tokenY] = tokenMetadata_x_y;
    if (+amount == 0) {
      setTokenYAmount('');
    } else {
      // X-->L
      const L =
        +amount *
        ((Math.pow(Math.sqrt(CONSTANT_D), rightPoint) -
          Math.pow(Math.sqrt(CONSTANT_D), rightPoint - 1)) /
          (Math.pow(Math.sqrt(CONSTANT_D), rightPoint - currentPoint - 1) - 1));
      // L-->current Y
      const Yc = L * Math.pow(Math.sqrt(CONSTANT_D), currentPoint);
      // L--> Y
      const Y =
        L *
        ((Math.pow(Math.sqrt(CONSTANT_D), currentPoint) -
          Math.pow(Math.sqrt(CONSTANT_D), leftPoint)) /
          (Math.sqrt(CONSTANT_D) - 1));
      const decimalsRate =
        Math.pow(10, tokenX.decimals) / Math.pow(10, tokenY.decimals);

      const Y_result = (Y + Yc) * decimalsRate;

      setTokenYAmount(Y_result.toString());
    }
  }
  function getTokenXAmountByCondition({
    amount,
    leftPoint,
    rightPoint,
    currentPoint,
  }: {
    amount: string;
    leftPoint: number;
    rightPoint: number;
    currentPoint: number;
  }) {
    const [tokenX, tokenY] = tokenMetadata_x_y;
    if (+amount == 0) {
      setTokenXAmount('');
    } else {
      let L;
      // Yc-->L
      if (leftPoint == currentPoint) {
        L = +amount * (1 / Math.pow(Math.sqrt(CONSTANT_D), currentPoint));
      } else {
        // Y-->L
        L =
          +amount *
          ((Math.sqrt(CONSTANT_D) - 1) /
            (Math.pow(Math.sqrt(CONSTANT_D), currentPoint) -
              Math.pow(Math.sqrt(CONSTANT_D), leftPoint)));
      }
      const X =
        L *
        ((Math.pow(Math.sqrt(CONSTANT_D), rightPoint - currentPoint - 1) - 1) /
          (Math.pow(Math.sqrt(CONSTANT_D), rightPoint) -
            Math.pow(Math.sqrt(CONSTANT_D), rightPoint - 1)));
      const decimalsRate =
        Math.pow(10, tokenY.decimals) / Math.pow(10, tokenX.decimals);
      const X_result = X * decimalsRate;
      setTokenXAmount(X_result.toString());
    }
  }

  function addLiquidity() {
    setAddLoading(true);
    const [tokenX, tokenY] = tokenMetadata_x_y;
    const { pool_id } = poolDetail;
    add_liquidity({
      pool_id,
      left_point: custom_left_point,
      right_point: custom_right_point,
      amount_x: toNonDivisibleNumber(tokenX.decimals, tokenXAmount || '0'),
      amount_y: toNonDivisibleNumber(tokenY.decimals, tokenYAmount || '0'),
      token_x: tokenX,
      token_y: tokenY,
    });
  }
  function changeTokenXAmount(amount: string) {
    const { current_point } = poolDetail;
    setTokenXAmount(amount);
    if (!onlyAddXToken) {
      getTokenYAmountByCondition({
        amount,
        leftPoint: custom_left_point,
        rightPoint: custom_right_point,
        currentPoint: current_point,
      });
    }
  }
  function changeTokenYAmount(amount: string) {
    const { current_point } = poolDetail;
    setTokenYAmount(amount);
    if (!onlyAddYToken) {
      getTokenXAmountByCondition({
        amount,
        leftPoint: custom_left_point,
        rightPoint: custom_right_point,
        currentPoint: current_point,
      });
    }
  }
  function getButtonStatus() {
    const [tokenX, tokenY] = tokenMetadata_x_y;
    let condition;
    let not_enough_token;
    if (onlyAddXToken) {
      condition =
        +tokenXAmount > 0 &&
        new BigNumber(
          getMax(tokenX, tokenXBalanceFromNear)
        ).isGreaterThanOrEqualTo(tokenXAmount);
      if (+tokenXAmount > 0 && !condition) {
        not_enough_token = tokenX;
      }
    } else if (onlyAddYToken) {
      condition =
        +tokenYAmount > 0 &&
        new BigNumber(
          getMax(tokenY, tokenYBalanceFromNear)
        ).isGreaterThanOrEqualTo(tokenYAmount);
      if (+tokenYAmount > 0 && !condition) {
        not_enough_token = tokenY;
      }
    } else if (!invalidRange) {
      const condition_x =
        +tokenXAmount > 0 &&
        new BigNumber(
          getMax(tokenX, tokenXBalanceFromNear)
        ).isGreaterThanOrEqualTo(tokenXAmount);
      const condition_y =
        +tokenYAmount > 0 &&
        new BigNumber(
          getMax(tokenY, tokenYBalanceFromNear)
        ).isGreaterThanOrEqualTo(tokenYAmount);
      condition = condition_x && condition_y;
      if (+tokenXAmount > 0 && !condition_x) {
        not_enough_token = tokenX;
      } else if (+tokenYAmount > 0 && !condition_y) {
        not_enough_token = tokenY;
      }
    }
    return {
      status: !condition,
      not_enough_token,
    };
  }
  function getMax(token: TokenMetadata, balance: string) {
    return token.id !== WRAP_NEAR_CONTRACT_ID
      ? balance
      : Number(balance) <= 0.5
      ? '0'
      : String(Number(balance) - 0.5);
  }
  function addOneSlot(direction: string) {
    const { point_delta } = poolDetail;
    const l_p = custom_left_point + point_delta;
    const r_p = custom_right_point + point_delta;
    if (direction == 'l') {
      setCustom_left_point(
        Math.max(Math.min(POINTRIGHTRANGE, l_p), POINTLEFTRANGE)
      );
    } else if (direction == 'r') {
      const target_slot_r = Math.max(
        Math.min(POINTRIGHTRANGE, r_p),
        POINTLEFTRANGE
      );
      if (target_slot_r - custom_left_point >= POINTRIGHTRANGE) return;
      setCustom_right_point(target_slot_r);
    }
  }
  function reduceOneSlot(direction: string) {
    const { point_delta } = poolDetail;
    const l_p = custom_left_point - point_delta;
    const r_p = custom_right_point - point_delta;
    if (direction == 'l') {
      const target_slot_l = Math.max(
        Math.min(POINTRIGHTRANGE, l_p),
        POINTLEFTRANGE
      );
      if (custom_right_point - target_slot_l >= POINTRIGHTRANGE) return;
      setCustom_left_point(target_slot_l);
    } else if (direction == 'r') {
      setCustom_right_point(
        Math.max(Math.min(POINTRIGHTRANGE, r_p), POINTLEFTRANGE)
      );
    }
  }
  function handlePriceToAppropriatePoint() {
    const { point_delta, token_x, token_y } = poolDetail;
    const token_x_decimals = tokenMetadata_x_y[0].decimals;
    const token_y_decimals = tokenMetadata_x_y[1].decimals;
    const decimalRate =
      Math.pow(10, token_y_decimals) / Math.pow(10, token_x_decimals);
    if (custom_left_price) {
      const c_point = getPointByPrice(
        point_delta,
        custom_left_price,
        decimalRate
      );
      setCustom_left_price('');
      setCustom_left_point(c_point);
      if (custom_right_point - c_point >= POINTRIGHTRANGE) {
        const appropriate_r_point = POINTRIGHTRANGE + c_point - point_delta;
        setCustom_right_point(appropriate_r_point);
      }
    }
    if (custom_right_price) {
      const c_point = getPointByPrice(
        point_delta,
        custom_right_price,
        decimalRate
      );
      setCustom_right_price('');
      setCustom_right_point(c_point);
      if (c_point - custom_left_point >= POINTRIGHTRANGE) {
        const appropriate_l_point = c_point - POINTRIGHTRANGE + point_delta;
        setCustom_left_point(appropriate_l_point);
      }
    }
  }
  function getPriceByCustomPoint(point: number) {
    const token_x_decimals = tokenMetadata_x_y[0].decimals;
    const token_y_decimals = tokenMetadata_x_y[1].decimals;
    const decimalRate =
      Math.pow(10, token_x_decimals) / Math.pow(10, token_y_decimals);
    let price = getPriceByPoint(point, decimalRate);
    if (new BigNumber(price).isLessThan('0.00000001')) {
      return price;
    } else {
      return toPrecision(price.toString(), 8);
    }
  }
  function pointChange({
    leftPoint,
    rightPoint,
    currentPoint,
  }: {
    leftPoint: number;
    rightPoint: number;
    currentPoint: number;
  }) {
    setInvalidRange(false);
    setOnlyAddXToken(false);
    setOnlyAddYToken(false);
    // invalid point
    if (leftPoint >= rightPoint) {
      setInvalidRange(true);
      setTokenXAmount('');
      setTokenYAmount('');
      return;
    }
    // can only add x token
    if (leftPoint > currentPoint) {
      setOnlyAddXToken(true);
      setTokenYAmount('');
      return;
    }
    // can only add y token
    if (rightPoint <= currentPoint + 1) {
      setOnlyAddYToken(true);
      setTokenXAmount('');
      return;
    }
    if (tokenXAmount) {
      getTokenYAmountByCondition({
        amount: tokenXAmount,
        leftPoint,
        rightPoint,
        currentPoint,
      });
    } else if (tokenYAmount) {
      getTokenXAmountByCondition({
        amount: tokenYAmount,
        leftPoint,
        rightPoint,
        currentPoint,
      });
    }
  }
  function setSeedPointAsCustomPoint() {
    setCustom_left_point(seed_left_point);
    setCustom_right_point(seed_right_point);
  }
  function getRange(displayType?: 'seed' | 'custom') {
    const [contractId, temp_pool_id] = seed.seed_id.split('@');
    const [fixRange, dcl_pool_id, left_point, right_point] =
      temp_pool_id.split('&');
    const [token_x_metadata, token_y_metadata] = tokenMetadata_x_y;
    const decimalRate =
      Math.pow(10, token_x_metadata.decimals) /
      Math.pow(10, token_y_metadata.decimals);
    let target_left_point;
    let target_right_point;
    if (displayType == 'seed') {
      target_left_point = +left_point;
      target_right_point = +right_point;
    } else {
      target_left_point = custom_left_point;
      target_right_point = custom_right_point;
    }
    let left_price = getPriceByPoint(target_left_point, decimalRate);
    let right_price = getPriceByPoint(target_right_point, decimalRate);
    if (rate_need_to_reverse_display) {
      const temp = left_price;
      left_price = new BigNumber(1).dividedBy(right_price).toFixed();
      right_price = new BigNumber(1).dividedBy(temp).toFixed();
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
    if (displayType == 'seed') {
      return (
        <div className="flex items-center xsm:flex-col xsm:items-end whitespace-nowrap ml-1">
          <span>1 {token_x_metadata.symbol}=</span>
          <span className="flex items-center xsm:mt-2">
            <a
              className="underline mx-1 cursor-pointer"
              onClick={setSeedPointAsCustomPoint}
            >
              {display_left_price} ~ {display_right_price}
            </a>
            {token_y_metadata.symbol}
          </span>
        </div>
      );
    } else {
      return (
        <div className="relative flex items-center xsm:flex-col xsm:items-end whitespace-nowrap ml-1 text-sm text-primaryText">
          <span>1 {token_x_metadata.symbol}=</span>
          <div className="flex items-center xsm:mt-2">
            <span className="mx-1 text-base text-white gotham_bold">
              {display_left_price} ~ {display_right_price}
            </span>
            {token_y_metadata.symbol}
          </div>
        </div>
      );
    }
  }
  const { status: isAddLiquidityDisabled, not_enough_token } =
    getButtonStatus();
  return (
    <Modal {...restProps}>
      <Card
        style={{ maxHeight: '95vh', width: cardWidth }}
        className="outline-none border border-gradientFrom border-opacity-50 overflow-auto xs:p-4 md:p-4"
      >
        <div className="flex items-center justify-between">
          <span className="text-xl text-white gotham_bold">Add Position</span>
          <div className="cursor-pointer" onClick={props.onRequestClose}>
            <ModalClose />
          </div>
        </div>
        <div>
          {/* <div className="flex items-center justify-between my-6">
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
          </div> */}
          <div className="text-sm text-primaryText mt-6">Input Amount</div>
          <OneSide
            show={
              (onlyAddYToken &&
                poolDetail.current_point != custom_right_point - 1) ||
              onlyAddXToken
                ? true
                : false
            }
          ></OneSide>
          <InvalidRange show={invalidRange ? true : false}></InvalidRange>
          {/*  input area */}
          <div>
            <InputAmount
              token={tokenMetadata_x_y && tokenMetadata_x_y[0]}
              balance={tokenXBalanceFromNear}
              tokenPriceList={tokenPriceList}
              amount={tokenXAmount}
              changeAmount={changeTokenXAmount}
              hidden={onlyAddYToken || invalidRange ? true : false}
            ></InputAmount>
            <InputAmount
              token={tokenMetadata_x_y && tokenMetadata_x_y[1]}
              balance={tokenYBalanceFromNear}
              tokenPriceList={tokenPriceList}
              amount={tokenYAmount}
              changeAmount={changeTokenYAmount}
              hidden={onlyAddXToken || invalidRange ? true : false}
            ></InputAmount>
            {not_enough_token ? (
              <div className=" rounded-md mb-6 px-2 text-center text-sm mt-4">
                <label className="text-warnColor ">
                  <FormattedMessage id="oops" defaultMessage="Oops" />!
                </label>
                <label className="ml-2.5 text-warnColor ">
                  {not_enough_token.id == WRAP_NEAR_CONTRACT_ID ? (
                    <FormattedMessage id="near_validation_error" />
                  ) : (
                    <>
                      <FormattedMessage id="you_do_not_have_enough" />{' '}
                      {not_enough_token.symbol}
                    </>
                  )}
                </label>
              </div>
            ) : null}
          </div>
          {/* set price rage area */}
          <div className="">
            <div className="relative flex items-center justify-between xsm:justify-end xsm:items-start mt-6 mb-3.5">
              <div
                className="flex items-center text-sm cursor-pointer xsm:absolute xsm:left-0"
                onMouseOver={() => setHover(true)}
                onMouseLeave={() => {
                  setHover(false);
                }}
                onClick={() => {
                  setShowCustomPointArea(!showCustomPointArea);
                }}
              >
                <ArrowDownV3
                  className={`mr-2.5 hover:text-white ${
                    hover ? 'text-white' : 'text-primaryText'
                  } ${showCustomPointArea ? 'transform rotate-180' : ''}`}
                ></ArrowDownV3>
                <span
                  className={`${hover ? 'text-white' : 'text-primaryText'}`}
                >
                  Set Price Range
                </span>
              </div>
              {getRange('custom')}
            </div>
            <div className={showCustomPointArea ? '' : 'hidden'}>
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center bg-black bg-opacity-20 mr-6 rounded-xl p-2.5">
                  <span className="text-sm text-primaryText xs:text-xs md:text-xs mb-4">
                    <FormattedMessage
                      id="min_price"
                      defaultMessage="Min Price"
                    ></FormattedMessage>
                  </span>
                  <PointInputComponent
                    reduceOneSlot={() => {
                      reduceOneSlot('l');
                    }}
                    addOneSlot={() => {
                      addOneSlot('l');
                    }}
                    handlePriceToAppropriatePoint={
                      handlePriceToAppropriatePoint
                    }
                    customPrice={custom_left_price}
                    getPrice={() => getPriceByCustomPoint(custom_left_point)}
                    setCustomPrice={setCustom_left_price}
                    inputStatus={leftInputStatus}
                    setInputStatus={setLeftInputStatus}
                  ></PointInputComponent>
                </div>
                <div className="flex flex-col items-center bg-black bg-opacity-20 rounded-xl p-2.5">
                  <span className="text-sm text-primaryText xs:text-xs md:text-xs mb-4">
                    <FormattedMessage
                      id="max_price"
                      defaultMessage="Max Price"
                    ></FormattedMessage>
                  </span>
                  <PointInputComponent
                    reduceOneSlot={() => {
                      reduceOneSlot('r');
                    }}
                    addOneSlot={() => {
                      addOneSlot('r');
                    }}
                    handlePriceToAppropriatePoint={
                      handlePriceToAppropriatePoint
                    }
                    customPrice={custom_right_price}
                    getPrice={() => getPriceByCustomPoint(custom_right_point)}
                    setCustomPrice={setCustom_right_price}
                    inputStatus={rightInputStatus}
                    setInputStatus={setRightInputStatus}
                  ></PointInputComponent>
                </div>
              </div>
              <div className="relative flex items-center justify-center xsm:justify-end xsm:items-start text-sm text-primaryText mt-4">
                <span className="xsm:absolute xsm:left-0">Reward Range:</span>
                {getRange('seed')}
              </div>
            </div>
          </div>
          {/* Your Apr */}
          <div className="flex items-center justify-between my-7">
            <span className="text-sm text-primaryText">
              <FormattedMessage id="your_apr"></FormattedMessage>
            </span>
            <span className="text-base text-white gotham_bold">198.52%</span>
          </div>

          {/* button area */}
          {isSignedIn ? (
            <GradientButton
              onClick={addLiquidity}
              color="#fff"
              disabled={addLoading || isAddLiquidityDisabled}
              loading={addLoading || isAddLiquidityDisabled}
              btnClassName={`${
                isAddLiquidityDisabled ? 'cursor-not-allowed' : ''
              }`}
              className={`mt-8 w-full h-14 text-center text-lg text-white focus:outline-none font-semibold`}
            >
              <ButtonTextWrapper
                loading={addLoading}
                Text={() => <>Add Position</>}
              />
            </GradientButton>
          ) : (
            <div className="mt-4">
              <ConnectToNearBtn></ConnectToNearBtn>
            </div>
          )}
        </div>
      </Card>
    </Modal>
  );
};

function InputAmount({
  token,
  balance,
  tokenPriceList,
  changeAmount,
  amount,
  hidden,
}: {
  token: TokenMetadata;
  balance: string;
  tokenPriceList: Record<string, any>;
  changeAmount: any;
  amount: string;
  hidden: Boolean;
}) {
  const [inputPrice, setInputPrice] = useState('');
  useEffect(() => {
    if (tokenPriceList && amount) {
      const price = tokenPriceList[token.id]?.price || '';
      if (price) {
        setInputPrice(new BigNumber(price).multipliedBy(amount).toFixed());
      } else {
        setInputPrice('');
      }
    } else {
      setInputPrice('');
    }
  }, [amount, tokenPriceList?.length]);
  function getBalance() {
    let r = '0';
    if (token && balance) {
      r = formatWithCommas(toPrecision(balance.toString(), 3));
    }
    return r;
  }
  function showCurrentPrice() {
    if (inputPrice) {
      return '$' + formatWithCommas(toPrecision(inputPrice.toString(), 3));
    }
    return '$-';
  }
  const maxBalance =
    token?.id !== WRAP_NEAR_CONTRACT_ID
      ? balance
      : Number(balance) <= 0.5
      ? '0'
      : String(Number(balance) - 0.5);
  return (
    <div
      className={`bg-black bg-opacity-20 rounded-xl p-3 mt-3 ${
        hidden ? 'hidden' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <input
          type="number"
          placeholder="0.0"
          className="text-2xl text-white"
          value={amount}
          step="any"
          onChange={({ target }) => {
            changeAmount(target.value);
          }}
        />
        <span
          className={`text-base font-bold ml-5 whitespace-nowrap text-white`}
        >
          {toRealSymbol(token.symbol)}
        </span>
      </div>
      <div
        className={`flex items-center justify-between mt-2.5 ${
          token ? 'visible' : 'invisible'
        }`}
      >
        <span className="text-xs text-primaryText">{showCurrentPrice()}</span>
        <div className="flex items-center text-xs text-primaryText ml-1.5">
          <span title={balance}>
            <FormattedMessage id="balance" />:{' '}
            <span
              className="hover:text-white cursor-pointer"
              onClick={() => {
                changeAmount(maxBalance);
              }}
            >
              {getBalance()}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

function OneSide({ show }: { show: boolean }) {
  return (
    <div
      className={`items-center relative rounded-xl bg-black bg-opacity-20 py-2.5 px-6 mt-3 ${
        show ? 'flex' : 'hidden'
      }`}
      style={{ minHeight: '5rem' }}
    >
      <BoxDarkBg className="absolute top-0 right-0"></BoxDarkBg>
      <SideIcon className="mr-5 flex-shrink-0"></SideIcon>
      <div className="relative z-10 text-white text-sm">
        <FormattedMessage id="maket_price_outside_single_only_tip" />
      </div>
    </div>
  );
}
function InvalidRange({ show }: { show: boolean }) {
  return (
    <div
      className={`items-center relative rounded-xl bg-black bg-opacity-20 h-20 py-2.5 px-6 mt-3 ${
        show ? 'flex' : 'hidden'
      }`}
    >
      <BoxDarkBg className="absolute top-0 right-0"></BoxDarkBg>
      <InvalidIcon className="mr-5"></InvalidIcon>
      <div className="relative z-10 text-white text-sm">
        <FormattedMessage
          id="maket_price_outside_tip"
          defaultMessage="The maket price is outside your price range."
        ></FormattedMessage>
      </div>
    </div>
  );
}

function PointInputComponent({
  reduceOneSlot,
  addOneSlot,
  handlePriceToAppropriatePoint,
  customPrice,
  getPrice,
  setCustomPrice,
  inputStatus,
  setInputStatus,
}: any) {
  return (
    <div className="flex items-center justify-between">
      <div
        className="flex w-6 h-6  flex-shrink-0 items-center justify-center rounded-md hover:bg-v3BlackColor cursor-pointer"
        onClick={() => {
          reduceOneSlot('r');
        }}
      >
        <ReduceButton className="cursor-pointer"></ReduceButton>
      </div>
      <input
        type="number"
        placeholder="0.0"
        step="any"
        className="text-base mx-2 text-center text-white gotham_bold"
        onBlur={() => {
          handlePriceToAppropriatePoint();
          setInputStatus(false);
        }}
        value={inputStatus ? customPrice : getPrice()}
        onChange={({ target }) => {
          setInputStatus(true);
          const inputPrice = target.value;
          setCustomPrice(inputPrice);
        }}
      />
      <div
        className="flex w-6 h-6 flex-shrink-0 items-center justify-center rounded-md hover:bg-v3BlackColor cursor-pointer"
        onClick={() => {
          addOneSlot('r');
        }}
      >
        <AddButton className="cursor-pointer"></AddButton>
      </div>
    </div>
  );
}
