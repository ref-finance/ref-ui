import React, { useState } from 'react';
import { TokenMetadata } from '~services/token';
import { Pool } from '~services/pool';
import FormWrap from '~components/forms/FormWrap';
import TokenAmount from '~components/forms/TokenAmount';
import Alert from '~components/alert/Alert';
import { useRegisteredTokens, useTokenBalances } from '~state/token';
import { useSwap } from '../../state/swap';
import * as math from 'mathjs';
import {
  calculateExchangeRate,
  calculateFeeCharge,
  calculateFeePercent,
} from '~utils/numbers';
import Icon from '~components/tokens/Icon';

function DetailView({
  pool,
  from,
  to,
}: {
  pool: Pool;
  from: string;
  to: string;
}) {
  const [show, setShow] = useState<boolean>(false);
  if (!pool || !to || !from) return null;

  const feeCharge = calculateFeeCharge(pool.fee, from);
  const afterFeeCharge = math.evaluate(`${from} - ${feeCharge}`);

  if (!show)
    return (
      <>
        <a href="#" onClick={() => setShow(true)}>
          Details
        </a>
      </>
    );

  return (
    <>
      <a href="#" onClick={() => setShow(false)}>
        Close Details
      </a>
      <RateView pool={pool} from={from} to={to} />
      <p>Initial Trade Amount: {from}</p>
      <p>
        Trade Amount After fees: {afterFeeCharge} ({from} - {feeCharge})
      </p>
      <p>
        Estimated Trade Result: {to} ({afterFeeCharge} *{' '}
        {calculateExchangeRate(pool.fee, from, to)})
      </p>
    </>
  );
}

function FeeView({
  pool,
  amount,
  token,
}: {
  pool?: Pool;
  amount: string;
  token: TokenMetadata;
}) {
  if (!pool || !amount) return null;

  return (
    <p>
      <span className="font-semibold">Pool Fee: </span>
      {calculateFeePercent(pool.fee)}% ({calculateFeeCharge(pool.fee, amount)}{' '}
      <Icon className="inline" token={token} size="3" />)
    </p>
  );
}

function RateView({
  pool,
  from,
  to,
}: {
  pool?: Pool;
  from: string;
  to: string;
}) {
  if (!pool || !to) return null;
  return (
    <p>
      <span className="font-semibold">Swap Rate:</span>{' '}
      {calculateExchangeRate(pool.fee, from, to)}
    </p>
  );
}

function SlippageView({
  slippageTolerance,
  minAmountOut,
  onChange,
}: {
  slippageTolerance: number;
  minAmountOut: number;
  onChange: (slippage: number) => void;
}) {
  const validSlippages = [0.1, 0.5, 1];

  return (
    <>
      <fieldset className="flex items-center">
        <label className="font-semibold">Slippage Tolerance: </label>
        {validSlippages.map((slippage) => (
          <button
            className={`hover:bg-black hover:text-white rounded w-20 p-2 mx-2 ${
              slippage === slippageTolerance &&
              'bg-black text-white font-semibold'
            }`}
            type="button"
            onClick={() => onChange(slippage)}
          >
            {slippage}%
          </button>
        ))}
      </fieldset>
      {minAmountOut ? <p>{minAmountOut}</p> : null}
    </>
  );
}

export default function SwapCard() {
  const [tokenIn, setTokenIn] = useState<TokenMetadata>();
  const [tokenInAmount, setTokenInAmount] = useState<string>('');
  const [tokenOut, setTokenOut] = useState<TokenMetadata>();
  const [slippageTolerance, setSlippageTolerance] = useState<number>(0.5);

  const tokens = useRegisteredTokens();
  const balances = useTokenBalances();

  const {
    canSwap,
    tokenOutAmount,
    minAmountOut,
    pool,
    swapError,
    makeSwap,
  } = useSwap({
    tokenIn: tokenIn,
    tokenInAmount,
    tokenOut: tokenOut,
    slippageTolerance,
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    makeSwap();
  };

  return (
    <FormWrap title="Swap" canSubmit={canSwap} onSubmit={handleSubmit}>
      {swapError && <Alert level="error" message={swapError.message} />}
      <FeeView pool={pool} amount={tokenInAmount} token={tokenIn} />
      <TokenAmount
        amount={tokenInAmount}
        max={balances?.[tokenIn?.id]}
        tokens={tokens}
        selectedToken={tokenIn}
        balances={balances}
        onSelectToken={(token) => setTokenIn(token)}
        onChangeAmount={setTokenInAmount}
      />
      <TokenAmount
        amount={tokenOutAmount}
        tokens={tokens}
        selectedToken={tokenOut}
        balances={balances}
        onSelectToken={(token) => setTokenOut(token)}
      />
      <SlippageView
        slippageTolerance={slippageTolerance}
        minAmountOut={minAmountOut}
        onChange={setSlippageTolerance}
      />
      <DetailView pool={pool} from={tokenInAmount} to={tokenOutAmount} />
    </FormWrap>
  );
}
