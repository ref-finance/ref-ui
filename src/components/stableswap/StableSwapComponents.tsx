import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pool } from 'src/services/pool';
import { Icon } from './StableTokenList';
import { FormattedMessage } from 'react-intl';
import { TokenMetadata } from 'src/services/ft-contract';
import { UnCheckedRadio, CheckedRadio, Radio } from 'src/components/icon';
import { useIntl } from 'react-intl';
import { FaAngleUp, FaAngleDown } from '../reactIcons';
import {
  PriceImpactWarning,
  SwapDetail,
  SwapRateDetail,
} from 'src/components/swap/SwapCard';
import { toRealSymbol } from 'src/utils/token';
import { WarnTriangle, ErrorTriangle } from 'src/components/icon/SwapRefresh';
import { StableSwapExchangePC, SwapExchange } from '../icon/Arrows';
import { isMobile, useMobile } from '../../utils/device';

import {
  calculateExchangeRate,
  toPrecision,
  scientificNotationToString,
  divide,
  multiply,
} from 'src/utils/numbers';

const GetPriceImpact = (
  value: string,
  tokenIn: TokenMetadata,
  tokenInAmount: string
) => {
  const displayValue = toPrecision(
    scientificNotationToString(multiply(tokenInAmount, divide(value, '100'))),
    3
  );

  const textColor =
    Number(value) <= 1
      ? 'text-greenLight'
      : 1 < Number(value) && Number(value) <= 2
      ? 'text-warn'
      : 'text-error';

  const tokenInInfo =
    Number(displayValue) <= 0
      ? ` / 0 ${toRealSymbol(tokenIn.symbol)}`
      : ` / -${displayValue} ${toRealSymbol(tokenIn.symbol)}`;

  return (
    <>
      {Number(value) < 0.01 ? (
        <span className="text-greenLight">
          {'< -0.01%'}
          {tokenInInfo}
        </span>
      ) : (
        <span className={`${textColor} font-sans`}>
          {`≈ -${toPrecision(value, 2)}%`}
          {tokenInInfo}
        </span>
      )}
    </>
  );
};

const getPriceImpactTipType = (value: string) => {
  // const value = calcStableSwapPriceImpact(from, to);

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
  const isMobileDevice = useMobile();

  return (
    <div className="w-24 xs:w-full md:w-full">
      <div
        className="flex items-center justify-center border-t mt-12"
        style={{ borderColor: 'rgba(126, 138, 147, 0.3)' }}
      >
        {isMobileDevice ? (
          <SwapExchange
            onChange={() => {
              setTokenIn(tokenOut);
              setTokenOut(tokenIn);
              setTokenInAmount(toPrecision('1', 6));
            }}
          />
        ) : (
          <StableSwapExchangePC
            onChange={() => {
              setTokenIn(tokenOut);
              setTokenOut(tokenIn);
              setTokenInAmount(toPrecision('1', 6));
            }}
          />
        )}
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
  priceImpactValue,
}: {
  pool: Pool;
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  from: string;
  to: string;
  minAmountOut?: string;
  canSwap?: boolean;
  noFeeAmount?: string;
  priceImpactValue?: string;
}) {
  const intl = useIntl();
  const [showDetails, setShowDetails] = useState<boolean>(false);

  useEffect(() => {
    if (Number(priceImpactValue) > 1) {
      setShowDetails(true);
    }
  }, [priceImpactValue]);

  if (!from || !to || !(Number(from) > 0) || !pool) return null;

  return (
    <div className="mt-4">
      <div className="flex justify-center">
        <div
          className="flex items-center text-white cursor-pointer"
          onClick={() => {
            setShowDetails(!showDetails);
          }}
        >
          <label className="mr-2">
            {noFeeAmount &&
              noFeeAmount !== '0' &&
              getPriceImpactTipType(priceImpactValue)}
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
          fee={pool.fee}
          from={from}
          to={to}
          tokenIn={tokenIn}
          tokenOut={tokenOut}
        />
        {Number(priceImpactValue) > 2 && (
          <div className="py-1 text-xs text-right">
            <PriceImpactWarning value={priceImpactValue} />
          </div>
        )}
        <SwapDetail
          title={intl.formatMessage({
            id: 'price_impact',
            defaultMessage: 'Price Impact',
          })}
          value={
            !noFeeAmount || noFeeAmount === '0'
              ? '-'
              : GetPriceImpact(priceImpactValue, tokenIn, from)
          }
        />
      </div>
    </div>
  );
}
