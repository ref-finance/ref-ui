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
import { ArrowDownBlack } from '../icon/Arrows';
import { toRealSymbol } from '~utils/token';
import { FormattedMessage, useIntl } from 'react-intl';
import { FaExchangeAlt } from 'react-icons/fa';
import db from '~store/RefDatabase';

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

function SwapRateDetail({
  title,
  value,
  pool,
  from,
  to,
  tokenIn,
  tokenOut,
}: {
  title: string;
  value: string;
  pool: Pool;
  from: string;
  to: string;
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
}) {
  const [newValue, setNewValue] = useState<string>('');
  const [isRevert, setIsRevert] = useState<boolean>(false);

  useEffect(() => {
    setNewValue(value);
  }, [value]);

  useEffect(() => {
    setNewValue(
      `${calculateExchangeRate(
        pool.fee,
        isRevert ? to : from,
        isRevert ? from : to
      )} ${toRealSymbol(
        isRevert ? tokenIn.symbol : tokenOut.symbol
      )} per ${toRealSymbol(isRevert ? tokenOut.symbol : tokenIn.symbol)}`
    );
  }, [isRevert]);

  function switchSwapRate() {
    setIsRevert(!isRevert);
  }

  return (
    <section className="grid grid-cols-2 py-1">
      <p className="opacity-80">{title}</p>
      <p
        className="text-right font-semibold cursor-pointer"
        onClick={switchSwapRate}
      >
        <span className="float-right xs:w-2/3">{newValue}</span>
        <span className="float-right mr-2 xs:mr-0 mt-1 text-sm">
          <FaExchangeAlt></FaExchangeAlt>
        </span>
      </p>
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
  const intl = useIntl();

  if (!pool || !from || !to) return null;

  return (
    <>
      <SwapDetail
        title={intl.formatMessage({ id: 'minimum_received' })}
        value={toPrecision(minAmountOut, 8, true)}
      />
      <SwapRateDetail
        title={intl.formatMessage({ id: 'swap_rate' })}
        value={`${calculateExchangeRate(pool.fee, from, to)} ${toRealSymbol(
          tokenOut.symbol
        )} per ${toRealSymbol(tokenIn.symbol)}`}
        pool={pool}
        from={from}
        to={to}
        tokenIn={tokenIn}
        tokenOut={tokenOut}
      />
      <SwapDetail
        title={intl.formatMessage({ id: 'pool_fee' })}
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
  const [tokenInAmount, setTokenInAmount] = useState<string>('1');
  const [tokenOut, setTokenOut] = useState<TokenMetadata>();
  const [slippageTolerance, setSlippageTolerance] = useState<number>(0.5);
  const [disableTokenInput, setDisableTokenInput] = useState<boolean>();
  const [cached, setCached] = useState<boolean>();

  const intl = useIntl();
  const location = useLocation();
  const history = useHistory();

  const balances = useTokenBalances();

  useEffect(() => {
    const [urlTokenIn, urlTokenOut, urlSlippageTolerance] = decodeURIComponent(
      location.hash.slice(1)
    ).split(TOKEN_URL_SEPARATOR);
    const rememberedIn = urlTokenIn || localStorage.getItem(SWAP_IN_KEY);
    const rememberedOut = urlTokenOut || localStorage.getItem(SWAP_OUT_KEY);
    const rememberedSlippageTolerance =
      slippageTolerance ||
      urlSlippageTolerance ||
      localStorage.getItem(SWAP_SLIPPAGE_KEY);

    setSlippageTolerance(Number(rememberedSlippageTolerance));

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

  useEffect(() => {
    const [urlTokenIn, urlTokenOut] = decodeURIComponent(
      location.hash.slice(1)
    ).split(TOKEN_URL_SEPARATOR);
    const rememberedIn = urlTokenIn || localStorage.getItem(SWAP_IN_KEY);
    const rememberedOut = urlTokenOut || localStorage.getItem(SWAP_OUT_KEY);
    db.checkPoolsByTokens(rememberedIn, rememberedOut).then((cached) => {
      if (!cached) {
        if (Number(tokenInAmount) === 0 || swapError != null) {
          setDisableTokenInput(false);
        } else {
          setDisableTokenInput(!canSwap);
        }
      } else {
        setDisableTokenInput(false);
      }
      setTimeout(() => {
        document.getElementById('inputAmount').focus();
      }, 100);
    });
  }, [canSwap, swapError]);

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
            <FormattedMessage
              id="deposit_to_swap"
              defaultMessage="Deposit to swap"
            />
          </button>
        </div>
      }
      onSubmit={handleSubmit}
      info={intl.formatMessage({ id: 'swapCopy' })}
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
        text={intl.formatMessage({ id: 'from' })}
        disabled={disableTokenInput}
        onChangeAmount={(amount) => {
          setTokenInAmount(amount);
        }}
      />
      <div className="flex items-center justify-center">
        <div
          className="inline-block mt-4 mb-4 cursor-pointer"
          onClick={() => {
            setTokenIn(tokenOut);
            setTokenOut(tokenIn);
            setTokenInAmount(toPrecision('1', 6));
          }}
        >
          <ArrowDownBlack />
        </div>
      </div>
      <TokenAmount
        amount={toPrecision(tokenOutAmount, 8)}
        total={tokenOutTotal}
        tokens={allTokens}
        selectedToken={tokenOut}
        balances={balances}
        text={intl.formatMessage({ id: 'to' })}
        onSelectToken={(token) => {
          localStorage.setItem(SWAP_OUT_KEY, token.id);
          history.replace(`#${tokenIn.id}${TOKEN_URL_SEPARATOR}${token.id}`);
          setTokenOut(token);
        }}
      />
      <SlippageSelector
        slippageTolerance={slippageTolerance}
        onChange={(slippage) => {
          setSlippageTolerance(slippage);
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
