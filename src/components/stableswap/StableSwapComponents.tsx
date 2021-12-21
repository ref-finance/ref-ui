import React, { useRef, useState } from 'react';
import { Pool } from '~services/pool';
import { Icon } from './StableTokenList';
import { FormattedMessage } from 'react-intl';
import { TokenMetadata } from '~services/ft-contract';
import { UnCheckedRadio, CheckedRadio, Radio } from '~components/icon';
import { useIntl } from 'react-intl';
import {
  FaAngleUp,
  FaAngleDown,
  FaExchangeAlt,
  FaServicestack,
} from 'react-icons/fa';
import { SwapDetail, SwapRateDetail } from '~components/swap/SwapCard';
import { toRealSymbol } from '~utils/token';
import { WarnTriangle, ErrorTriangle } from '~components/icon/SwapRefresh';

import {
  calculateExchangeRate,
  toPrecision,
  toReadableNumber,
  calcStableSwapPriceImpact,
} from '~utils/numbers';

const GetPriceImpact = (from: string, to: string) => {
  const value = calcStableSwapPriceImpact(from, to);

  const textColor =
    Number(value) <= 1
      ? 'text-greenLight'
      : 1 < Number(value) && Number(value) <= 2
      ? 'text-warn'
      : 'text-error';

  return Number(value) < 0.01 ? (
    <span className="text-greenLight">{'< -0.01%'}</span>
  ) : (
    <span className={`${textColor}`}>{`≈ -${toPrecision(value, 2)}%`}</span>
  );
};

const getPriceImpactTipType = (from: string, to: string) => {
  const value = calcStableSwapPriceImpact(from, to);

  const reault =
    1 < Number(value) && Number(value) <= 2 ? (
      <WarnTriangle></WarnTriangle>
    ) : Number(value) > 2 && Number(value) != Infinity ? (
      <ErrorTriangle></ErrorTriangle>
    ) : null;
  return reault;
};

export function TokensRadio({
  tokens,
  tokenIn,
  tokenOut,
  handleSwapFrom,
  handleSwapTo,
}: {
  tokens: TokenMetadata[];
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  handleSwapFrom: (id: string) => void;
  handleSwapTo: (id: string) => void;
}) {
  return (
    <div className="flex border-b border-primaryText border-opacity-30 px-8">
      <div className="text-white mr-24 flex-1">
        {tokens.map((token) => (
          <div className="flex my-4 items-center " key={token.id}>
            <Radio
              value={token.id}
              handleSelect={handleSwapFrom}
              checked={token.symbol === tokenIn.symbol}
            />
            <div
              className="cursor-pointer"
              onClick={() => {
                handleSwapFrom(token.id);
              }}
            >
              <Icon
                icon={token.icon}
                className="inline-block h-9 w-9 ml-4 mr-2 "
              />
              {token.symbol}
            </div>
          </div>
        ))}
      </div>
      <div className="text-white flex-1">
        {tokens.map((token) => (
          <div className="flex my-4 items-center" key={`second-${token.id}`}>
            <Radio
              value={token.id}
              handleSelect={handleSwapTo}
              checked={token.symbol === tokenOut.symbol}
            />
            <div
              className="cursor-pointer"
              onClick={() => {
                handleSwapTo(token.id);
              }}
            >
              <Icon
                icon={token.icon}
                className="inline-block h-9 w-9 ml-4 mr-2 cursor-pointer"
              />
              {token.symbol}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TokensRadioLeft({
  tokens,
  tokenIn,
  handleSwapFrom,
}: {
  tokens: TokenMetadata[];
  tokenIn: TokenMetadata;
  handleSwapFrom: (id: string) => void;
}) {
  return (
    <div className="flex justify-between">
      {tokens.map((token) => (
        <div className="flex my-4 items-center" key={token.id}>
          <Radio
            value={token.id}
            handleSelect={handleSwapFrom}
            checked={token.symbol === tokenIn.symbol}
          />
          <div
            className="cursor-pointer text-white flex flex-col ml-2"
            onClick={() => {
              handleSwapFrom(token.id);
            }}
          >
            <Icon icon={token.icon} className="h-7 w-7" />
            <label className="text-sm">{token.symbol}</label>
          </div>
        </div>
      ))}
    </div>
  );
}
export function TokensRadioRight({
  tokens,
  tokenOut,
  handleSwapTo,
}: {
  tokens: TokenMetadata[];
  tokenOut: TokenMetadata;
  handleSwapTo: (id: string) => void;
}) {
  return (
    <div className="flex justify-between">
      {tokens.map((token) => (
        <div className="flex my-4 items-center" key={`second-${token.id}`}>
          <Radio
            value={token.id}
            handleSelect={handleSwapTo}
            checked={token.symbol === tokenOut.symbol}
          />
          <div
            className="cursor-pointer text-white flex flex-col ml-2"
            onClick={() => {
              handleSwapTo(token.id);
            }}
          >
            <Icon icon={token.icon} className="h-7 w-7" />
            <label className="text-sm">{token.symbol}</label>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SwapAnimation({
  tokenOut,
  tokenIn,
  setTokenIn,
  setTokenOut,
  setTokenInAmount,
}: {
  tokenOut: TokenMetadata;
  tokenIn: TokenMetadata;
  setTokenIn: (token: TokenMetadata) => void;
  setTokenOut: (token: TokenMetadata) => void;
  setTokenInAmount: (amount: string) => void;
}) {
  const topBall = useRef<HTMLInputElement>();
  const bottomBall = useRef<HTMLInputElement>();
  const runSwapAnimation = function () {
    topBall.current.style.animation = 'rotation1 1s 0s ease-out 1';
    bottomBall.current.style.animation = 'rotation2 1s 0s ease-out 1';
    topBall.current.addEventListener('animationend', function () {
      topBall.current.style.animation = '';
    });
    bottomBall.current.addEventListener('animationend', function () {
      bottomBall.current.style.animation = '';
    });
  };
  return (
    <div className="w-24 xs:w-full md:w-full">
      <div
        className="flex items-center justify-center border-t mt-12"
        style={{ borderColor: 'rgba(126, 138, 147, 0.3)' }}
      >
        <div
          className="relative flex items-center -mt-6 mb-4 w-11 h-11 border border-white border-opacity-40 rounded-full cursor-pointer bg-dark"
          onClick={() => {
            runSwapAnimation();
            setTokenIn(tokenOut);
            setTokenOut(tokenIn);
            setTokenInAmount(toPrecision('1', 6));
          }}
        >
          <div className="swap-wrap">
            <div className="top-ball" ref={topBall} id="top-ball" />
            <div className="bottom-ball" ref={bottomBall} id="bottom-ball" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DetailView({
  pool,
  tokenIn,
  tokenOut,
  from,
  to,
  minAmountOut,
  canSwap,
  noFeeAmount,
}: {
  pool: Pool;
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  from: string;
  to: string;
  minAmountOut?: string;
  canSwap?: boolean;
  noFeeAmount?: string;
}) {
  const intl = useIntl();
  const [showDetails, setShowDetails] = useState<boolean>(false);

  if (!from || !to || !(Number(from) > 0) || !pool) return null;

  return (
    <div className="mt-4">
      <div
        className="flex justify-center"
        onClick={() => {
          setShowDetails(!showDetails);
        }}
      >
        <div className="flex items-center text-white cursor-pointer">
          <label className="mr-2">
            {noFeeAmount &&
              noFeeAmount !== '0' &&
              getPriceImpactTipType(from, noFeeAmount)}
          </label>
          <p className="block text-xs">
            <FormattedMessage id="details" defaultMessage="Details" />
          </p>
          <div className="pl-1 text-sm">
            {showDetails ? <FaAngleUp /> : <FaAngleDown />}
          </div>
        </div>
      </div>
      <div className={showDetails ? '' : 'hidden'}>
        <SwapDetail
          title={intl.formatMessage({ id: 'minimum_received' })}
          value={toPrecision(minAmountOut, 8, true)}
        />
        <SwapRateDetail
          title={intl.formatMessage({
            id: 'swap_rate_pre',
            defaultMessage: 'Swap rate ',
          })}
          subTitle={intl.formatMessage({
            id: 'including_fees',
            defaultMessage: '(including fees)',
          })}
          value={`1 ${toRealSymbol(tokenOut.symbol)} ≈ ${calculateExchangeRate(
            pool.fee,
            to,
            from
          )} ${toRealSymbol(tokenIn.symbol)}`}
          pool={pool}
          from={from}
          to={to}
          tokenIn={tokenIn}
          tokenOut={tokenOut}
        />
        <SwapDetail
          title={intl.formatMessage({
            id: 'price_impact',
            defaultMessage: 'Price Impact',
          })}
          value={
            !noFeeAmount || noFeeAmount === '0' || !canSwap
              ? '-'
              : GetPriceImpact(from, noFeeAmount)
          }
        />
      </div>
    </div>
  );
}
