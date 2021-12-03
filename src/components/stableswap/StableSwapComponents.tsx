import React, { useRef, useState } from 'react';
import { Pool } from '~services/pool';
import { Icon } from './StableTokenList';
import { FormattedMessage } from 'react-intl';
import { TokenMetadata } from '~services/ft-contract';
import { UnCheckedRadio, CheckedRadio, Radio } from '~components/icon';
import { useIntl } from 'react-intl';
import { FaAngleUp, FaAngleDown, FaExchangeAlt } from 'react-icons/fa';
import { SwapDetail, SwapRateDetail } from '~components/swap/SwapCard';
import { toRealSymbol } from '~utils/token';
import {
  calculateExchangeRate,
  toPrecision,
  toReadableNumber,
} from '~utils/numbers';

// stable swap radio list
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
          <div className="flex my-4 items-center" key={token.id}>
            <Radio
              value={token.id}
              handleSelect={handleSwapFrom}
              checked={token.symbol === tokenIn.symbol}
            />

            <Icon
              icon={token.icon}
              className="inline-block h-9 w-9 ml-4 mr-2"
            />
            <label>{token.symbol}</label>
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
            <Icon
              icon={token.icon}
              className="inline-block h-9 w-9 ml-4 mr-2"
            />
            <label>{token.symbol}</label>
          </div>
        ))}
      </div>
    </div>
  );
}

//swap animation
export function SwapAnimation({
  tokenOut,
  tokenIn,
  setTokenIn,
  setTokenOut,
}: {
  tokenOut: TokenMetadata;
  tokenIn: TokenMetadata;
  setTokenIn: (token: TokenMetadata) => void;
  setTokenOut: (token: TokenMetadata) => void;
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
    <div className=" w-24">
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
}: {
  pool: Pool;
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  from: string;
  to: string;
  minAmountOut?: string;
}) {
  const intl = useIntl();
  const [showDetails, setShowDetails] = useState<boolean>(false);

  if (!from || !to || !pool) return null;
  return (
    <div className="mt-4">
      <div
        className="flex justify-center"
        onClick={() => {
          setShowDetails(!showDetails);
        }}
      >
        <div className="flex items-center text-white cursor-pointer">
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
          title={intl.formatMessage({
            id: 'price_impact',
            defaultMessage: 'Price Impact',
          })}
          value="-"
        />
        <SwapRateDetail
          title={intl.formatMessage({
            id: 'swap_rate_including_fee',
            defaultMessage: 'Swap rate (including fees)',
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
          title={intl.formatMessage({ id: 'minimum_received' })}
          value={toPrecision(minAmountOut, 8, true)}
        />
      </div>
    </div>
  );
}
