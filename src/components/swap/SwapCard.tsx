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
  toRoundedReadableNumber,
} from '../../utils/numbers';
import FormWrap from '../forms/FormWrap';
import TokenAmount from '../forms/TokenAmount';
import Alert from '../alert/Alert';
import SlippageSelector from '../forms/SlippageSelector';
import copy from '../../utils/copy';
<<<<<<< HEAD
import Icon from '~components/tokens/Icon';
=======
import { ArrowDownBlack } from '../icon/Arrows';
>>>>>>> feat/new-ui

const SWAP_IN_KEY = 'REF_FI_SWAP_IN';
const SWAP_OUT_KEY = 'REF_FI_SWAP_OUT';
const TOKEN_URL_SEPARATOR = '|';

function SwapDetail({
  title,
  value,
}: {
  title: string;
  value: string | React.ReactElement;
}) {
  return (
    <section className="grid grid-cols-2 py-1">
      <p className="opacity-80 self-center">{title}</p>
      <div className="text-right font-semibold">{value}</div>
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
      <SwapDetail
        title="Pool Liquidity"
        value={
          <div>
            <div className="flex items-center justify-end">
              <p className="mr-2">
                {toRoundedReadableNumber({
                  decimals: tokenIn.decimals,
                  number: pool.supplies[tokenIn.id],
                })}
              </p>
              <Icon token={tokenIn} label={false} />
            </div>
            <div className="flex items-center justify-end">
              <p className="mr-2">
                {toRoundedReadableNumber({
                  decimals: tokenOut.decimals,
                  number: pool.supplies[tokenOut.id],
                })}
              </p>
              <Icon token={tokenOut} label={false} />
            </div>
          </div>
        }
      />
    </>
  );
}

<<<<<<< HEAD
export default function SwapCard() {
  const location = useLocation();
  const history = useHistory();

  const [urlTokenIn, urlTokenOut] = location.hash
    .slice(1)
    .split(TOKEN_URL_SEPARATOR);

=======
export default function SwapCard(props: { allTokens: TokenMetadata[] }) {
  const { allTokens } = props;
>>>>>>> feat/new-ui
  const [tokenIn, setTokenIn] = useState<TokenMetadata>();
  const [tokenInAmount, setTokenInAmount] = useState<string>('');
  const [tokenOut, setTokenOut] = useState<TokenMetadata>();
  const [slippageTolerance, setSlippageTolerance] = useState<number>(0.5);

<<<<<<< HEAD
  const allTokens = useWhitelistTokens(
    urlTokenIn && urlTokenOut ? [urlTokenIn, urlTokenOut] : []
  );
=======
  const location = useLocation();
  const history = useHistory();

>>>>>>> feat/new-ui
  const balances = useTokenBalances();

  useEffect(() => {
    const rememberedIn = urlTokenIn || localStorage.getItem(SWAP_IN_KEY);
    const rememberedOut = urlTokenOut || localStorage.getItem(SWAP_OUT_KEY);

    if (allTokens) {
      setTokenIn(
        allTokens.find((token) => token.id === rememberedIn) || allTokens[0]
      );
      setTokenOut(
<<<<<<< HEAD
        allTokens.find((token) => token.id === rememberedOut) || allTokens[1]
=======
        allTokens.find((token) => token.symbol === rememberedOut) ||
        allTokens[1]
>>>>>>> feat/new-ui
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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    makeSwap();
  };

  const tokenInMax =
    toReadableNumber(tokenIn?.decimals, balances?.[tokenIn?.id]) || '0';
  const tokenOutTotal =
    toReadableNumber(tokenOut?.decimals, balances?.[tokenOut?.id]) || '0';

  return (
    <FormWrap
      canSubmit={canSwap}
      showElseView={tokenInMax === '0'}
      elseView={
        <div className="flex justify-center">
          <button
            className={`rounded-full text-xs text-white px-3 py-1.5 focus:outline-none font-semibold bg-greenLight`}
            onClick={() => {
              history.push(`/deposit/${tokenIn.id}`);
            }}
          >
            Deposit to Swap
          </button>
        </div>
      }
      onSubmit={handleSubmit}
      info={copy.swap}
    >
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
