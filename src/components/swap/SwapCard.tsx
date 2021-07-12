import React, { useEffect, useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { TokenMetadata } from '../../services/ft-contract';
import { Pool } from '../../services/pool';
import { useTokenBalances } from '../../state/token';
import { useSwap } from '../../state/swap';
import {
  calculateExchangeRate,
  calculateFeeCharge,
  calculateFeePercent,
  toPrecision,
  toReadableNumber,
} from '../../utils/numbers';
import FormWrap from '../forms/FormWrap';
import TokenAmount from '../forms/TokenAmount';
import Alert from '../alert/Alert';
import SlippageSelector from '../forms/SlippageSelector';
import copy from '../../utils/copy';
import { ArrowDownBlack } from '../icon/Arrows';

const SWAP_IN_KEY = 'REF_FI_SWAP_IN';
const SWAP_OUT_KEY = 'REF_FI_SWAP_OUT';
const SWAP_SLIPPAGE_KEY = 'REF_FI_SLIPPAGE_VALUE';
const TOKEN_URL_SEPARATOR = '|';

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
          tokenOut.symbol
        } per ${tokenIn.symbol}`}
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

export default function SwapCard(props: { allTokens: TokenMetadata[] }) {
  const { allTokens } = props;
  const [tokenIn, setTokenIn] = useState<TokenMetadata>();
  const [tokenInAmount, setTokenInAmount] = useState<string>('');
  const [tokenOut, setTokenOut] = useState<TokenMetadata>();
  const [slippageTolerance, setSlippageTolerance] = useState<number>(0.5);

  const location = useLocation();
  const history = useHistory();

  const balances = useTokenBalances();

  useEffect(() => {
    const [urlTokenIn, urlTokenOut, urlSlippageTolerance] = decodeURIComponent(
      location.hash.slice(1)
    ).split(TOKEN_URL_SEPARATOR);
    const rememberedIn = urlTokenIn || localStorage.getItem(SWAP_IN_KEY);
    const rememberedOut = urlTokenOut || localStorage.getItem(SWAP_OUT_KEY);
    const rememberedSlippageTolerance = urlSlippageTolerance || localStorage.getItem(SWAP_SLIPPAGE_KEY);
    setSlippageTolerance(Number(rememberedSlippageTolerance))

    if (allTokens) {
      setTokenIn(
        allTokens.find((token) => token.id === rememberedIn) || allTokens[0]
      );
      setTokenOut(
        allTokens.find((token) => token.id === rememberedOut) || allTokens[1]
      );
    }
  }, [allTokens]);

  const { canSwap, tokenOutAmount, minAmountOut, pool, swapError, makeSwap } =
    useSwap({
      tokenIn: tokenIn,
      tokenInAmount,
      tokenOut: tokenOut,
      slippageTolerance,
    });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    makeSwap();
  };

  const tokenInMax =
    toReadableNumber(tokenIn?.decimals, balances?.[tokenIn?.id]) || '0';
  const tokenOutTotal =
    toReadableNumber(tokenOut?.decimals, balances?.[tokenOut?.id]) || '0';

  return (
    <FormWrap canSubmit={canSwap} onSubmit={handleSubmit} info={copy.swap}>
      <div className="pb-2">
        {swapError && <Alert level="error" message={swapError.message} />}
      </div>
      <TokenAmount
        amount={tokenInAmount}
        total={tokenInMax}
        max={tokenInMax}
        tokens={allTokens}
        selectedToken={tokenIn}
        balances={balances}
        onSelectToken={(token) => {
          localStorage.setItem(SWAP_IN_KEY, token.id);
          history.replace(`#${token.id}${TOKEN_URL_SEPARATOR}${tokenOut.id}`);
          setTokenIn(token);
        }}
        text="From"
        onChangeAmount={setTokenInAmount}
      />
      <div
        className="flex items-center justify-center"
        onClick={() => {
          setTokenIn(tokenOut);
          setTokenOut(tokenIn);
          setTokenInAmount(toPrecision(tokenOutAmount, 6));
        }}
      >
        <div className="inline-block mt-4 mb-4 cursor-pointer">
          <ArrowDownBlack />
        </div>
      </div>
      <TokenAmount
        amount={toPrecision(tokenOutAmount, 6)}
        total={tokenOutTotal}
        tokens={allTokens}
        selectedToken={tokenOut}
        balances={balances}
        text="To"
        onSelectToken={(token) => {
          localStorage.setItem(SWAP_OUT_KEY, token.id);
          history.replace(`#${tokenIn.id}${TOKEN_URL_SEPARATOR}${token.id}`);
          setTokenOut(token);
        }}
      />
      <SlippageSelector
        slippageTolerance={slippageTolerance}
        onChange={(slippage) => {
          setSlippageTolerance(slippage)
          localStorage.setItem(SWAP_SLIPPAGE_KEY, slippage.toString());
        }}
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
