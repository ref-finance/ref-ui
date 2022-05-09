import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useContext,
} from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { ftGetBalance, TokenMetadata } from '../../services/ft-contract';
import { Pool } from '../../services/pool';
import { useTokenBalances } from '../../state/token';
import { useSwap, useCrossSwap } from '../../state/swap';
import {
  calculateExchangeRate,
  calculateFeeCharge,
  calculateFeePercent,
  calculateSmartRoutingPriceImpact,
  percent,
  toPrecision,
  toReadableNumber,
  subtraction,
  calculatePriceImpact,
  ONLY_ZEROS,
  percentOf,
  multiply,
  divide,
  scientificNotationToString,
  calculateSmartRoutesV2PriceImpact,
  separateRoutes,
  calcStableSwapPriceImpact,
} from '../../utils/numbers';
import ReactDOMServer from 'react-dom/server';
import TokenAmount, {
  HalfAndMaxAmount,
  TokenCardIn,
} from '../forms/TokenAmount';
import SubmitButton from '../forms/SubmitButton';
import Alert from '../alert/Alert';
import { toRealSymbol } from '../../utils/token';
import { FormattedMessage, useIntl } from 'react-intl';
import { FaAngleUp, FaAngleDown, FaExchangeAlt } from 'react-icons/fa';

import { WarnTriangle, ErrorTriangle } from '../../components/icon/SwapRefresh';

import BigNumber from 'bignumber.js';
import {
  AutoRouterText,
  CrossSwapAllResult,
  CrossSwapRoute,
  OneParallelRoute,
  RouterIcon,
  SmartRouteV2,
} from '../../components/layout/SwapRoutes';

import { EstimateSwapView, PoolMode, swap } from '../../services/swap';
import { QuestionTip } from '../../components/layout/TipWrapper';
import {
  senderWallet,
  WalletContext,
  getCurrentWallet,
} from '../../utils/sender-wallet';
import { SwapArrow, SwapExchange, ExchangeArrow } from '../icon/Arrows';
import { getPoolAllocationPercents, percentLess } from '../../utils/numbers';
import { DoubleCheckModal } from '../../components/layout/SwapDoubleCheck';
import { getTokenPriceList } from '../../services/indexer';
import { TokenCardOut, CrossSwapTokens } from '../forms/TokenAmount';
import { CrossSwapFormWrap } from '../forms/SwapFormWrap';
import { TriIcon, RefIcon, WannaIconDark } from '../icon/DexIcon';

const SWAP_IN_KEY = 'REF_FI_SWAP_IN';
const SWAP_OUT_KEY = 'REF_FI_SWAP_OUT';
const SWAP_SLIPPAGE_KEY = 'REF_FI_SLIPPAGE_VALUE';
export const SWAP_USE_NEAR_BALANCE_KEY = 'REF_FI_USE_NEAR_BALANCE_VALUE';
const TOKEN_URL_SEPARATOR = '|';
export const SUPPORT_LEDGER_KEY = 'REF_FI_SUPPORT_LEDGER';

export function SwapDetail({
  title,
  value,
}: {
  title: string;
  value: string | JSX.Element;
}) {
  return (
    <section className="grid grid-cols-12 py-2 text-xs">
      <p className="text-primaryText text-left col-span-6">{title}</p>
      <p className="text-right text-white col-span-6">{value}</p>
    </section>
  );
}

export function SwapRateDetail({
  title,
  value,
  subTitle,
  from,
  to,
  tokenIn,
  tokenOut,
  fee,
}: {
  fee: number;
  title: string;
  value: string;
  from: string;
  to: string;
  subTitle?: string;
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
}) {
  const [newValue, setNewValue] = useState<string>('');
  const [isRevert, setIsRevert] = useState<boolean>(false);

  const exchangeRageValue = useMemo(() => {
    const fromNow = isRevert ? from : to;
    const toNow = isRevert ? to : from;
    if (ONLY_ZEROS.test(fromNow)) return '-';

    return calculateExchangeRate(fee, fromNow, toNow);
  }, [isRevert, to]);

  useEffect(() => {
    setNewValue(value);
  }, [value]);

  useEffect(() => {
    setNewValue(
      `1 ${toRealSymbol(
        isRevert ? tokenIn.symbol : tokenOut.symbol
      )} ≈ ${exchangeRageValue} ${toRealSymbol(
        isRevert ? tokenOut.symbol : tokenIn.symbol
      )}`
    );
  }, [isRevert, exchangeRageValue]);

  function switchSwapRate() {
    setIsRevert(!isRevert);
  }

  return (
    <section className="grid grid-cols-12 py-2 text-xs">
      <p className="text-primaryText text-left flex xs:flex-col md:flex-col col-span-4 whitespace-nowrap">
        <label className="mr-1">{title}</label>
        {subTitle ? <label>{subTitle}</label> : null}
      </p>
      <p
        className="flex justify-end text-white cursor-pointer text-right col-span-8"
        onClick={switchSwapRate}
      >
        <span className="mr-2" style={{ marginTop: '0.1rem' }}>
          <FaExchangeAlt color="#00C6A2" />
        </span>
        <span>{newValue}</span>
      </p>
    </section>
  );
}

function CrossSwapRoutesDetail({
  swapsTodo,
  tokenOut,
}: {
  swapsTodo: EstimateSwapView[];
  tokenOut: TokenMetadata;
}) {
  const routes = separateRoutes(swapsTodo, tokenOut.id);
  const pools = routes?.map((todo) => todo[0].pool);

  const percents = useMemo(() => {
    try {
      return getPoolAllocationPercents(pools);
    } catch (error) {
      return [];
    }
  }, [pools]);

  return (
    <section className="md:grid lg:grid grid-cols-12 py-2 text-xs">
      <div className="text-primaryText text-left col-span-5">
        <div className="inline-flex items-center">
          <RouterIcon />
          <AutoRouterText />
          <QuestionTip id="optimal_path_found_by_our_solution" width="w-56" />
        </div>
      </div>

      <div className="text-right text-white col-span-7 xs:mt-2 md:mt-2">
        {routes?.map((route, i) => {
          return (
            <div
              key={i}
              className="mb-5 md:w-smartRoute lg:w-smartRoute flex items-center relative"
            >
              <div className="text-right text-white w-full col-span-6 xs:mt-2 md:mt-2">
                <CrossSwapRoute route={route} p={percents[i]} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export const GetPriceImpact = (
  value: string,
  tokenIn?: TokenMetadata,
  tokenInAmount?: string
) => {
  const textColor =
    Number(value) <= 1
      ? 'text-greenLight'
      : 1 < Number(value) && Number(value) <= 2
      ? 'text-warn'
      : 'text-error';

  const displayValue = toPrecision(
    scientificNotationToString(multiply(tokenInAmount, divide(value, '100'))),
    3
  );

  const tokenInInfo =
    Number(displayValue) <= 0
      ? ` / 0 ${toRealSymbol(tokenIn.symbol)}`
      : ` / -${displayValue} ${tokenIn.symbol}`;

  if (Number(value) < 0.01)
    return (
      <span className="text-greenLight">
        {`< -0.01%`}
        {tokenInInfo}
      </span>
    );

  if (Number(value) > 1000)
    return (
      <span className="text-error">
        {`< -1000%`}
        {tokenInInfo}
      </span>
    );

  return (
    <span className={`${textColor}`}>
      {`≈ -${toPrecision(value, 2)}%`}
      {tokenInInfo}
    </span>
  );
};

export const getPriceImpactTipType = (value: string) => {
  const reault =
    1 < Number(value) && Number(value) <= 2 ? (
      <WarnTriangle></WarnTriangle>
    ) : Number(value) > 2 && Number(value) != Infinity ? (
      <ErrorTriangle></ErrorTriangle>
    ) : null;
  return reault;
};

export const PriceImpactWarning = ({ value }: { value: string }) => {
  return (
    <span className="">
      <span className="rounded-full bg-acccountTab text-error px-2 py-0.5">
        <FormattedMessage
          id="more_expensive_than_best_rate_zh_cn"
          defaultMessage=" "
        />{' '}
        {Number(value) > 1000 ? '> 1000' : toPrecision(value, 2)}
        {'% '}
        <FormattedMessage
          id="more_expensive_than_best_rate_en"
          defaultMessage=" "
        />
      </span>
    </span>
  );
};

function DetailView({
  pools,
  tokenIn,
  tokenOut,
  from,
  to,
  fee,
  swapsTodo,
  priceImpact,
  showDetails = true,
}: {
  pools: Pool[];
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  from: string;
  to: string;
  minAmountOut: string;
  fee?: number;
  swapsTodo?: EstimateSwapView[];
  priceImpact?: string;
  showDetails?: boolean;
}) {
  const intl = useIntl();

  const exchangeRateValue = useMemo(() => {
    if (!from || ONLY_ZEROS.test(to)) return '-';
    else return calculateExchangeRate(fee, to, from);
  }, [to]);

  const priceImpactDisplay = useMemo(() => {
    if (!priceImpact || !tokenIn || !from) return null;
    return GetPriceImpact(priceImpact, tokenIn, from);
  }, [to, priceImpact]);

  const poolFeeDisplay = useMemo(() => {
    if (!fee || !from || !tokenIn) return null;

    return `${toPrecision(
      calculateFeePercent(fee).toString(),
      2
    )}% / ${calculateFeeCharge(fee, from)} ${toRealSymbol(tokenIn.symbol)}`;
  }, [to]);

  if (!pools || ONLY_ZEROS.test(from) || !to || tokenIn.id === tokenOut.id)
    return null;

  return (
    <div className="mt-8">
      <div className={showDetails ? '' : 'hidden'}>
        <SwapRateDetail
          title={intl.formatMessage({ id: 'swap_rate' })}
          value={`1 ${toRealSymbol(
            tokenOut.symbol
          )} ≈ ${exchangeRateValue} ${toRealSymbol(tokenIn.symbol)}`}
          from={from}
          to={to}
          tokenIn={tokenIn}
          tokenOut={tokenOut}
          fee={fee}
        />
        {Number(priceImpact) > 2 && (
          <div className="py-1 text-xs text-right">
            <PriceImpactWarning value={priceImpact} />
          </div>
        )}
        <SwapDetail
          title={intl.formatMessage({ id: 'price_impact' })}
          value={!to || to === '0' ? '-' : priceImpactDisplay}
        />
        <SwapDetail
          title={intl.formatMessage({
            id: 'pool_fee_cross_swap',
            defaultMessage: 'Pool/Cross-chain fee',
          })}
          value={poolFeeDisplay}
        />

        <CrossSwapRoutesDetail swapsTodo={swapsTodo} tokenOut={tokenOut} />
      </div>
    </div>
  );
}

export default function CrossSwapCard(props: {
  allTokens: TokenMetadata[];
  tokenInAmount: string;
  setTokenInAmount: (amount: string) => void;
}) {
  const { allTokens, tokenInAmount, setTokenInAmount } = props;
  const [tokenIn, setTokenIn] = useState<TokenMetadata>();
  const [tokenOut, setTokenOut] = useState<TokenMetadata>();
  const [doubleCheckOpen, setDoubleCheckOpen] = useState<boolean>(false);

  const [requested, setRequested] = useState<boolean>(false);

  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [loadingTrigger, setLoadingTrigger] = useState<boolean>(false);
  const [loadingPause, setLoadingPause] = useState<boolean>(false);
  const [supportLedger, setSupportLedger] = useState(
    localStorage.getItem(SUPPORT_LEDGER_KEY) ? true : false
  );

  const [useNearBalance, setUseNearBalance] = useState<boolean>(true);
  const history = useHistory();

  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;

  const [tokenInBalanceFromNear, setTokenInBalanceFromNear] =
    useState<string>();

  const [tokenOutBalanceFromNear, setTokenOutBalanceFromNear] =
    useState<string>();

  const [showSwapLoading, setShowSwapLoading] = useState<boolean>(false);

  const intl = useIntl();
  const location = useLocation();

  const balances = useTokenBalances();
  const [urlTokenIn, urlTokenOut, urlSlippageTolerance] = decodeURIComponent(
    location.hash.slice(1)
  ).split(TOKEN_URL_SEPARATOR);
  const [slippageTolerance, setSlippageTolerance] = useState<number>(
    Number(localStorage.getItem(SWAP_SLIPPAGE_KEY) || urlSlippageTolerance) ||
      0.5
  );
  const [tokenPriceList, setTokenPriceList] = useState<Record<string, any>>({});

  useEffect(() => {
    getTokenPriceList().then(setTokenPriceList);
  }, []);

  useEffect(() => {
    const rememberedIn = urlTokenIn || localStorage.getItem(SWAP_IN_KEY);
    const rememberedOut = urlTokenOut || localStorage.getItem(SWAP_OUT_KEY);

    if (allTokens) {
      setTokenIn(
        allTokens.find((token) => token.id === rememberedIn) || allTokens[0]
      );
      setTokenOut(
        allTokens.find((token) => token.id === rememberedOut) || allTokens[1]
      );
    }
  }, [allTokens]);

  useEffect(() => {
    if (!tokenIn || !tokenOut || !isSignedIn) return;
    const tokenInId = tokenIn.id;
    const tokenOutId = tokenOut.id;
    ftGetBalance(tokenInId).then((available: string) =>
      setTokenInBalanceFromNear(toReadableNumber(tokenIn?.decimals, available))
    );
    ftGetBalance(tokenOutId).then((available: string) =>
      setTokenOutBalanceFromNear(
        toReadableNumber(tokenOut?.decimals, available)
      )
    );
  }, [tokenIn, tokenOut, isSignedIn]);

  const {
    tokenOutAmount,
    minAmountOut,
    pools,
    swapError,
    makeSwap,
    avgFee,
    swapsToDo,
    canSwap,
    setSwapError,
    swapsToDoRef,
    swapsToDoTri,
  } = useCrossSwap({
    tokenIn: tokenIn,
    tokenInAmount,
    tokenOut: tokenOut,
    slippageTolerance,
    supportLedger,
    requested,
    setRequested,
    loadingTrigger,
    setLoadingTrigger,
    loadingPause,
  });

  const priceImpactValueSmartRouting = useMemo(() => {
    try {
      if (swapsToDo?.length === 2 && swapsToDo[0].status === PoolMode.SMART) {
        return calculateSmartRoutingPriceImpact(
          tokenInAmount,
          swapsToDo,
          tokenIn,
          swapsToDo[1].token,
          tokenOut
        );
      } else if (
        swapsToDo?.length === 1 &&
        swapsToDo[0].status === PoolMode.STABLE
      ) {
        return calcStableSwapPriceImpact(
          toReadableNumber(tokenIn.decimals, swapsToDo[0].totalInputAmount),
          swapsToDo[0].noFeeAmountOut
        );
      } else return '0';
    } catch {
      return '0';
    }
  }, [tokenOutAmount, swapsToDo]);

  const priceImpactValueSmartRoutingV2 = useMemo(() => {
    try {
      const pi = calculateSmartRoutesV2PriceImpact(swapsToDo, tokenOut.id);

      return pi;
    } catch {
      return '0';
    }
  }, [tokenOutAmount, swapsToDo]);

  let PriceImpactValue: string = '0';

  try {
    if (
      swapsToDo[0].status === PoolMode.SMART ||
      swapsToDo[0].status === PoolMode.STABLE
    ) {
      PriceImpactValue = priceImpactValueSmartRouting;
    } else {
      PriceImpactValue = priceImpactValueSmartRoutingV2;
    }
  } catch (error) {
    PriceImpactValue = '0';
  }

  const tokenInMax = tokenInBalanceFromNear || '0';

  const tokenOutMax = tokenOutBalanceFromNear || '0';

  const canSubmit = requested
    ? canSwap &&
      getCurrentWallet().wallet.isSignedIn() &&
      !ONLY_ZEROS.test(tokenInMax) &&
      !ONLY_ZEROS.test(tokenInAmount) &&
      new BigNumber(tokenInAmount).lte(new BigNumber(tokenInMax))
    : tokenIn?.id !== tokenOut?.id &&
      !loadingTrigger &&
      !ONLY_ZEROS.test(tokenInAmount);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!requested) {
      setLoadingTrigger(true);
      setLoadingPause(false);
      return;
    }
    const ifDoubleCheck =
      new BigNumber(tokenInAmount).isLessThanOrEqualTo(
        new BigNumber(tokenInMax)
      ) && Number(PriceImpactValue) > 2;
    if (ifDoubleCheck) setDoubleCheckOpen(true);
    else makeSwap(useNearBalance);
  };

  const showAllResults =
    swapsToDoRef &&
    swapsToDoRef.length > 0 &&
    swapsToDoTri &&
    swapsToDoTri.length > 0;

  return (
    <>
      <CrossSwapFormWrap
        supportLedger={supportLedger}
        crossSwap={true}
        setSupportLedger={setSupportLedger}
        useNearBalance={useNearBalance.toString()}
        canSubmit={canSubmit}
        slippageTolerance={slippageTolerance}
        onChange={(slippage) => {
          setSlippageTolerance(slippage);
          localStorage.setItem(SWAP_SLIPPAGE_KEY, slippage?.toString());
        }}
        requested={requested}
        requestingTrigger={loadingTrigger && !requested}
        bindUseBalance={(useNearBalance) => {
          setUseNearBalance(useNearBalance);
          localStorage.setItem(
            SWAP_USE_NEAR_BALANCE_KEY,
            useNearBalance.toString()
          );
        }}
        loading={{
          loadingData,
          setLoadingData,
          loadingTrigger,
          setLoadingTrigger,
          loadingPause,
          setLoadingPause,
          showSwapLoading,
          setShowSwapLoading,
        }}
        tokensTitle={
          requested ? (
            <div className="flex items-center  absolute left-6 ">
              <span
                className="text-white text-xl pr-2 px-0.5 cursor-pointer"
                onClick={() => {
                  setRequested(false);
                  setSwapError(null);
                  setLoadingTrigger(false);
                }}
              >
                {'<'}
              </span>

              <span className="mx-1">{toRealSymbol(tokenIn?.symbol)}</span>
              <ExchangeArrow />
              <span className="mx-1">{toRealSymbol(tokenOut?.symbol)}</span>
            </div>
          ) : (
            <div className="flex items-center absolute left-8">
              <RefIcon lightTrigger={true} />

              <TriIcon lightTrigger={true} />

              <WannaIconDark />
            </div>
          )
        }
        showElseView={tokenInMax === '0' && !useNearBalance}
        elseView={<SubmitButton disabled={true} loading={showSwapLoading} />}
        onSubmit={handleSubmit}
        info={intl.formatMessage({ id: 'swapCopy' })}
        title={requested ? 'Confirm' : 'Request_for_Quote'}
        showAllResults={showAllResults}
      >
        <TokenCardIn
          tokenIn={tokenIn}
          max={tokenInMax}
          onChangeAmount={(amount) => {
            setTokenInAmount(amount);
          }}
          balances={balances}
          tokenPriceList={tokenPriceList}
          tokens={allTokens}
          onSelectToken={(token) => {
            localStorage.setItem(SWAP_IN_KEY, token.id);
            setTokenIn(token);
            history.replace(`#${token.id}${TOKEN_URL_SEPARATOR}${tokenOut.id}`);
          }}
          amount={tokenInAmount}
          hidden={requested}
        />
        <div
          className={`flex items-center justify-center border-t mt-12 ${
            requested ? 'hidden' : 'block'
          }`}
          style={{ borderColor: 'rgba(126, 138, 147, 0.3)' }}
        >
          <SwapExchange
            onChange={() => {
              setTokenIn(tokenOut);
              setTokenOut(tokenIn);
              setTokenInAmount(toPrecision('1', 6));
              localStorage.setItem(SWAP_IN_KEY, tokenOut.id);
              localStorage.setItem(SWAP_OUT_KEY, tokenIn.id);
              history.replace(
                `#${tokenOut.id}${TOKEN_URL_SEPARATOR}${tokenIn.id}`
              );
            }}
          />
        </div>

        <TokenCardOut
          tokens={allTokens}
          tokenOut={tokenOut}
          onSelectToken={(token) => {
            setTokenOut(token);
            localStorage.setItem(SWAP_OUT_KEY, token.id);
            history.replace(`#${tokenIn.id}${TOKEN_URL_SEPARATOR}${token.id}`);
          }}
          balances={balances}
          tokenPriceList={tokenPriceList}
          hidden={requested}
          max={tokenOutMax}
        />

        <div className={requested && !swapError ? 'block' : 'hidden'}>
          <div className="text-sm text-primaryText pb-2">
            <FormattedMessage
              id="minimum_received"
              defaultMessage="Minimum received"
            />
          </div>

          {!requested ? null : (
            <CrossSwapTokens
              tokenIn={tokenIn}
              tokenOut={tokenOut}
              tokenPriceList={tokenPriceList}
              amountIn={tokenInAmount}
              amountOut={tokenOutAmount}
              slippageTolerance={slippageTolerance}
            />
          )}
        </div>
        {!requested ? null : (
          <DetailView
            pools={pools}
            tokenIn={tokenIn}
            tokenOut={tokenOut}
            from={tokenInAmount}
            to={tokenOutAmount}
            minAmountOut={minAmountOut}
            fee={avgFee}
            swapsTodo={swapsToDo}
            priceImpact={PriceImpactValue}
            showDetails={requested}
          />
        )}

        {swapError ? (
          <div className="pb-2 relative -mb-5">
            <Alert level="warn" message={swapError.message} />
          </div>
        ) : null}
      </CrossSwapFormWrap>

      <DoubleCheckModal
        isOpen={doubleCheckOpen}
        onRequestClose={() => {
          setDoubleCheckOpen(false);
          setShowSwapLoading(false);
        }}
        tokenIn={tokenIn}
        tokenOut={tokenOut}
        from={tokenInAmount}
        onSwap={() => makeSwap(useNearBalance)}
        priceImpactValue={PriceImpactValue}
      />
      {!requested || swapError ? null : (
        <CrossSwapAllResult
          refTodos={swapsToDoRef}
          triTodos={swapsToDoTri}
          // crossTodos={swapsToDo}
          tokenInAmount={tokenInAmount}
          tokenOutId={tokenOut?.id}
          slippageTolerance={slippageTolerance}
          tokenOut={tokenOut}
          tokenOutAmount={tokenOutAmount}
          show={showAllResults}
        />
      )}
    </>
  );
}
