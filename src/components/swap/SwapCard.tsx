import React, { useState } from 'react';
import { TokenMetadata } from '~services/token';
import { Pool } from '~services/pool';
import FormWrap from '~components/forms/FormWrap';
import TokenAmount from '~components/forms/TokenAmount';
import Alert from '~components/alert/Alert';
import { useRegisteredTokens, useTokenBalances } from '~state/token';
import { useSwap } from '../../state/swap';
import {
  calculateExchangeRate,
  calculateFeeCharge,
  convertToPercentDecimal,
} from '~utils/numbers';

function FeeChargeView({ pool, amount }: { pool?: Pool; amount: string }) {
  if (!pool) return null;

  return (
    <p>
      - {calculateFeeCharge(pool.fee, amount)} (at{' '}
      {convertToPercentDecimal(pool.fee)}
      %)
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
  if (!pool) return null;
  return <p>{calculateExchangeRate(pool.fee, from, to)}</p>;
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
            className={`hover:bg-black hover:text-white rounded p-2 ${
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
      <TokenAmount
        amount={tokenInAmount}
        max={balances?.[tokenIn?.id]}
        tokens={tokens}
        selectedToken={tokenIn}
        onSelectToken={(token) => setTokenIn(token)}
        onChangeAmount={setTokenInAmount}
      />
      <FeeChargeView pool={pool} amount={tokenInAmount} />
      <TokenAmount
        amount={tokenOutAmount}
        tokens={tokens}
        selectedToken={tokenOut}
        onSelectToken={(token) => setTokenOut(token)}
      />
      <RateView pool={pool} from={tokenInAmount} to={tokenOutAmount} />
      <SlippageView
        slippageTolerance={slippageTolerance}
        minAmountOut={minAmountOut}
        onChange={setSlippageTolerance}
      />
    </FormWrap>
  );
}
