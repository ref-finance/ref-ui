import React, { useEffect, useState } from 'react';
import { FaArrowsAltV, FaRegQuestionCircle} from 'react-icons/fa';
import ReactTooltip from 'react-tooltip';
import { TokenMetadata } from '../../services/ft-contract';
import { Pool } from '../../services/pool';
import FormWrap from '../../components/forms/FormWrap';
import TokenAmount from '../../components/forms/TokenAmount';
import Alert from '../../components/alert/Alert';
import { useWhitelistTokens, useTokenBalances } from '../../state/token';
import { useSwap } from '../../state/swap';
import {
  calculateExchangeRate,
  calculateFeeCharge,
  calculateFeePercent,
  toPrecision,
  toReadableNumber,
} from '../../utils/numbers';
import Loading from '../../components/layout/Loading';
import { wallet } from '../../services/near';
import copy from '../../utils/copy';

function SwapDetail({ title, value }: { title: string; value: string }) {
  return (
    <section className="grid grid-cols-2 py-1">
      <p className="opacity-80">{title}</p>
      <p className="text-right font-semibold">{value}</p>
    </section>
  );
}

function DetailView({
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
  minAmountOut: string;
}) {
  if (!pool || !from || !to) return null;

  return (
    <>
      <SwapDetail
        title="Minimum received"
        value={toPrecision(minAmountOut, 4, true)}
      />
      <SwapDetail
        title="Swap Rate"
        value={`${calculateExchangeRate(pool.fee, from, to)} ${
          tokenIn.symbol
        } per ${tokenOut.symbol}`}
      />
      <SwapDetail
        title="Pool Fee"
        value={`${calculateFeePercent(pool.fee)}% (${calculateFeeCharge(
          pool.fee,
          from
        )})`}
      />
    </>
  );
}

function SlippageSelector({
  slippageTolerance,
  onChange,
}: {
  slippageTolerance: number;
  minAmountOut: string;
  onChange: (slippage: number) => void;
}) {
  const validSlippages = [0.1, 0.5, 1];

  return (
    <>
      <fieldset className="flex items-center mb-4">
        <label className="font-semibold text-center">Slippage: </label>
        <div>
          <FaRegQuestionCircle 
            data-type="dark" 
            data-place="bottom"
            data-multiline={true} 
            data-tip={copy.slippageCopy} 
            className="text-med ml-2 text-left"
          />
          <ReactTooltip />
        </div>
        {validSlippages.map((slippage) => (
          <button
            className={`hover:bg-buttonBg hover:text-buttonText rounded w-full p-2 mx-2 ${
              slippage === slippageTolerance &&
              'bg-buttonBg text-buttonText font-semibold'
            }`}
            type="button"
            onClick={() => onChange(slippage)}
          >
            {slippage}%
          </button>
        ))}
      </fieldset>
    </>
  );
}

export default function SwapCard() {
  const [tokenIn, setTokenIn] = useState<TokenMetadata>();
  const [tokenInAmount, setTokenInAmount] = useState<string>('');
  const [tokenOut, setTokenOut] = useState<TokenMetadata>();
  const [slippageTolerance, setSlippageTolerance] = useState<number>(0.5);

  const allTokens = useWhitelistTokens();
  const balances = useTokenBalances();

  useEffect(() => {
    const rememberedIn = localStorage.getItem('REF_FI_SWAP_IN');
    const rememberedOut = localStorage.getItem('REF_FI_SWAP_OUT');
    if (allTokens) {
      setTokenIn(
        allTokens.find((token) => token.id === rememberedIn) || allTokens[0]
      );
      setTokenOut(
        allTokens.find((token) => token.id === rememberedOut) || allTokens[1]
      );
    }
  }, [allTokens]);

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

  if (!allTokens) return <Loading />;

  const title =
    wallet.isSignedIn() &&
    tokenIn &&
    (!balances?.[tokenIn.id] || balances?.[tokenIn.id] === '0')
      ? 'Make a deposit to swap'
      : 'Swap';

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    makeSwap();
  };

  return (
    <FormWrap title={title} canSubmit={canSwap} onSubmit={handleSubmit}>
      {swapError && <Alert level="error" message={swapError.message} />}
      <TokenAmount
        amount={tokenInAmount}
        max={
          toReadableNumber(tokenIn?.decimals, balances?.[tokenIn?.id]) || '0'
        }
        tokens={allTokens}
        selectedToken={tokenIn}
        balances={balances}
        onSelectToken={(token) => {
          localStorage.setItem('REF_FI_SWAP_IN', token.id);
          setTokenIn(token);
        }}
        onChangeAmount={setTokenInAmount}
      />
      <FaArrowsAltV
        className="h-6 m-auto cursor-pointer"
        onClick={() => {
          setTokenIn(tokenOut);
          setTokenOut(tokenIn);
          setTokenInAmount(toPrecision(tokenOutAmount, 6));
        }}
      />
      <TokenAmount
        amount={toPrecision(tokenOutAmount, 6)}
        tokens={allTokens}
        selectedToken={tokenOut}
        balances={balances}
        onSelectToken={(token) => {
          localStorage.setItem('REF_FI_SWAP_OUT', token.id);
          setTokenOut(token);
        }}
      />
      <SlippageSelector
        slippageTolerance={slippageTolerance}
        minAmountOut={minAmountOut}
        onChange={setSlippageTolerance}
      />
      <DetailView
        pool={pool}
        tokenIn={tokenIn}
        tokenOut={tokenOut}
        from={tokenInAmount}
        to={tokenOutAmount}
        minAmountOut={minAmountOut}
      />
    </FormWrap>
    
  );
}
