import { path } from 'animejs';
import React, { useEffect, useMemo, useState, useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { Card } from 'src/components/card/Card';
import { isMobile } from 'src/utils/device';
import { ModalClose } from 'src/components/icon';
import { BoxDarkBg, SideIcon } from 'src/components/icon/V3';
import {
  GradientButton,
  ButtonTextWrapper,
  ConnectToNearBtn,
} from '../../components/button/Button';

import { WalletContext } from 'src/utils/wallets-integration';
import { PoolSlippageSelectorV3 } from 'src/components/forms/SlippageSelector';
import Modal from 'react-modal';
import BigNumber from 'bignumber.js';
import {
  formatWithCommas,
  toPrecision,
  toReadableNumber,
  toNonDivisibleNumber,
} from 'src/utils/numbers';
import {
  CONSTANT_D,
  UserLiquidityInfo,
  sort_tokens_by_base,
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
import _ from 'lodash';
export const AddPoolV3 = (props: any) => {
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
  const [tokenXAmount, setTokenXAmount] = useState('');
  const [tokenYAmount, setTokenYAmount] = useState('');
  const [tokenXBalanceFromNear, setTokenXBalanceFromNear] = useState<string>();
  const [tokenYBalanceFromNear, setTokenYBalanceFromNear] = useState<string>();
  const [addLoading, setAddLoading] = useState<boolean>(false);
  const [onlyAddYToken, setOnlyAddYToken] = useState(false);
  const [onlyAddXToken, setOnlyAddXToken] = useState(false);
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const nearBalance = useDepositableBalance('NEAR');
  const cardWidth = isMobile() ? '90vw' : '30vw';
  useEffect(() => {
    if (userLiquidity && poolDetail) {
      const { current_point } = poolDetail;
      const { left_point, right_point } = userLiquidity;
      // can only add x token
      if (left_point > current_point) {
        setOnlyAddXToken(true);
        return;
      }
      // can only add y token
      if (right_point <= current_point || current_point == right_point - 1) {
        setOnlyAddYToken(true);
        return;
      }
    }
  }, [userLiquidity, poolDetail]);

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
  function append() {
    setAddLoading(true);
    const [tokenX, tokenY] = tokenMetadata_x_y;
    const { lpt_id, mft_id } = userLiquidity;
    append_liquidity({
      lpt_id,
      mft_id,
      amount_x: toNonDivisibleNumber(tokenX.decimals, tokenXAmount || '0'),
      amount_y: toNonDivisibleNumber(tokenY.decimals, tokenYAmount || '0'),
      token_x: tokenX,
      token_y: tokenY,
    });
  }
  function changeTokenXAmount(amount: string) {
    const { current_point } = poolDetail;
    const { left_point, right_point } = userLiquidity;
    setTokenXAmount(amount);
    if (!onlyAddXToken) {
      getTokenYAmountByCondition({
        amount,
        leftPoint: left_point,
        rightPoint: right_point,
        currentPoint: current_point,
      });
    }
  }
  function changeTokenYAmount(amount: string) {
    const { current_point } = poolDetail;
    const { left_point, right_point } = userLiquidity;
    setTokenYAmount(amount);
    if (!onlyAddYToken) {
      getTokenXAmountByCondition({
        amount,
        leftPoint: left_point,
        rightPoint: right_point,
        currentPoint: current_point,
      });
    }
  }
  function getButtonStatus() {
    if (!tokenMetadata_x_y) return {};
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
    } else {
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
  const { status: isAddLiquidityDisabled, not_enough_token } =
    getButtonStatus();
  const tokens = sort_tokens_by_base(tokenMetadata_x_y);
  return (
    <Modal {...restProps}>
      <Card
        style={{ maxHeight: '95vh' }}
        className="outline-none border border-gradientFrom border-opacity-50 overflow-auto xs:p-4 md:p-4 xs:w-90vw md:w-90vw lg:w-40vw xl:w-30vw"
      >
        <div className="flex items-center justify-between">
          <span className="text-xl text-white">
            <FormattedMessage id="add_liquidity"></FormattedMessage>
          </span>
          <div className="cursor-pointer" onClick={props.onRequestClose}>
            <ModalClose />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between my-6">
            <div className="flex items-center">
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
          </div>
          <OneSide
            show={
              (onlyAddYToken &&
                poolDetail?.current_point >= userLiquidity?.right_point) ||
              onlyAddXToken
                ? true
                : false
            }
          ></OneSide>
          {tokenMetadata_x_y && poolDetail && userLiquidity ? (
            <>
              <InputAmount
                token={tokenMetadata_x_y && tokenMetadata_x_y[0]}
                balance={tokenXBalanceFromNear}
                tokenPriceList={tokenPriceList}
                amount={tokenXAmount}
                changeAmount={changeTokenXAmount}
                hidden={onlyAddYToken ? true : false}
              ></InputAmount>
              <InputAmount
                token={tokenMetadata_x_y && tokenMetadata_x_y[1]}
                balance={tokenYBalanceFromNear}
                tokenPriceList={tokenPriceList}
                amount={tokenYAmount}
                changeAmount={changeTokenYAmount}
                hidden={onlyAddXToken ? true : false}
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

              {isSignedIn ? (
                <GradientButton
                  onClick={append}
                  color="#fff"
                  disabled={addLoading || isAddLiquidityDisabled}
                  loading={addLoading || isAddLiquidityDisabled}
                  btnClassName={`${
                    isAddLiquidityDisabled ? 'cursor-not-allowed' : ''
                  }`}
                  className={`mt-8 w-full h-14 text-center text-lg text-white focus:outline-none font-semibold`}
                  backgroundImage="linear-gradient(270deg, #7F43FF 0%, #00C6A2 97.06%)"
                >
                  <ButtonTextWrapper
                    loading={addLoading}
                    Text={() => <FormattedMessage id="add_liquidity" />}
                  />
                </GradientButton>
              ) : (
                <div className="mt-4">
                  <ConnectToNearBtn></ConnectToNearBtn>
                </div>
              )}
            </>
          ) : null}
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
              className="hover:text-white cursor-pointer underline"
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
