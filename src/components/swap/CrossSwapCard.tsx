import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useContext,
} from 'react';

// @ts-ignore
import { getExpectedOutputFromActionsORIG } from '../../services/smartRouteLogic';

import { useLocation, useHistory } from 'react-router-dom';
import { ftGetBalance, TokenMetadata } from '../../services/ft-contract';
import { Pool } from '../../services/pool';
import { useTokenBalances, useDepositableBalance } from '../../state/token';
import { useSwap, useCrossSwap, useSwapV3 } from '../../state/swap';
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
  toInternationalCurrencySystemLongString,
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
import {
  getPoolAllocationPercents,
  percentLess,
  toNonDivisibleNumber,
} from '../../utils/numbers';
import { DoubleCheckModal } from '../../components/layout/SwapDoubleCheck';
import { getTokenPriceList } from '../../services/indexer';
import {
  TokenCardOut,
  CrossSwapTokens,
  TokenAmountV3,
} from '../forms/TokenAmount';
import { CrossSwapFormWrap } from '../forms/SwapFormWrap';
import {
  TriIcon,
  RefIcon,
  WannaIconDark,
  SwapProIconLarge,
} from '../icon/DexIcon';
import { unwrapNear, WRAP_NEAR_CONTRACT_ID } from '../../services/wrap-near';
import { unWrapTokenId, wrapTokenId } from './SwapCard';
import getConfig, { getExtraStablePoolConfig } from '../../services/config';
import { SWAP_MODE } from '../../pages/SwapPage';
import Big from 'big.js';
import { PoolInfoV3 } from '../../services/swapV3';

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
        <span className="font-sans">{newValue}</span>
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

  const displayValue = scientificNotationToString(
    multiply(tokenInAmount, divide(value, '100'))
  );
  const tokenInInfo =
    Number(displayValue) <= 0
      ? ` / 0 ${toRealSymbol(tokenIn.symbol)}`
      : ` / -${toInternationalCurrencySystemLongString(displayValue, 3)} ${
          tokenIn.symbol
        }`;

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
    <span className={`${textColor} font-sans`}>
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

  if (ONLY_ZEROS.test(from) || !to || tokenIn.id === tokenOut.id) return null;

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
  swapTab?: JSX.Element;
}) {
  const { NEARXIDS, STNEARIDS } = getExtraStablePoolConfig();
  const { REF_TOKEN_ID } = getConfig();
  const { allTokens, tokenInAmount, setTokenInAmount, swapTab } = props;
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

  const nearBalance = useDepositableBalance('NEAR');

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
    let rememberedIn =
      wrapTokenId(urlTokenIn) || localStorage.getItem(SWAP_IN_KEY);
    let rememberedOut =
      wrapTokenId(urlTokenOut) || localStorage.getItem(SWAP_OUT_KEY);
    if (rememberedIn == NEARXIDS[0]) {
      rememberedIn = REF_TOKEN_ID;
    }
    if (rememberedOut == NEARXIDS[0]) {
      rememberedOut = REF_TOKEN_ID;
    }
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
      setTokenInBalanceFromNear(
        toReadableNumber(
          tokenIn?.decimals,
          tokenInId === WRAP_NEAR_CONTRACT_ID ? nearBalance : available
        )
      )
    );
    ftGetBalance(tokenOutId).then((available: string) =>
      setTokenOutBalanceFromNear(
        toReadableNumber(
          tokenOut?.decimals,
          tokenOutId === WRAP_NEAR_CONTRACT_ID ? nearBalance : available
        )
      )
    );
  }, [tokenIn, tokenOut, isSignedIn, nearBalance]);
  useEffect(() => {
    if (!tokenIn || !tokenOut) return;
    history.replace(`#${tokenIn.id}${TOKEN_URL_SEPARATOR}${tokenOut.id}`);
  }, [tokenIn?.id, tokenOut?.id]);

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

  const {
    makeSwap: makeSwapV3,
    tokenOutAmount: tokenOutAmountV3,
    minAmountOut: minAmountOutV3,
    bestFee,
    swapErrorV3,
    priceImpact: priceImpactV3,
    quoteDone: quoteDoneV3,
    canSwapPro: canSwapV3,
    bestPool: bestPoolV3,
  } = useSwapV3({
    tokenIn,
    tokenOut,
    tokenInAmount,
    slippageTolerance,
    swapMode: SWAP_MODE.NORMAL,
    loadingTrigger,
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
          swapsToDo[0].noFeeAmountOut,
          (
            Number(swapsToDo[0].pool.rates[tokenOut.id]) /
            Number(swapsToDo[0].pool.rates[tokenIn.id])
          ).toString()
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

  const bestSwap = new Big(tokenOutAmountV3 || '0').gt(tokenOutAmount || '0')
    ? 'v3'
    : 'v2';

  const bestSwapPriceImpact =
    bestSwap === 'v3' ? priceImpactV3 : PriceImpactValue;

  const makeBestSwap = () => {
    if (bestSwap === 'v3') {
      makeSwapV3();
    } else {
      makeSwap(useNearBalance);
    }
  };

  const displayTokenOutAmount = new Big(tokenOutAmountV3 || '0').gt(
    tokenOutAmount || '0'
  )
    ? tokenOutAmountV3
    : tokenOutAmount;

  const tokenInMax = tokenInBalanceFromNear || '0';

  const tokenOutMax = tokenOutBalanceFromNear || '0';

  const curMax =
    tokenIn?.id === WRAP_NEAR_CONTRACT_ID
      ? Number(tokenInMax) <= 0.5
        ? '0'
        : String(Number(tokenInMax) - 0.5)
      : tokenInMax;

  const canSubmit = requested
    ? (canSwap || (!ONLY_ZEROS.test(tokenOutAmountV3) && canSwapV3)) &&
      getCurrentWallet().wallet.isSignedIn() &&
      !ONLY_ZEROS.test(curMax) &&
      !ONLY_ZEROS.test(tokenInAmount) &&
      new BigNumber(tokenInAmount).lte(new BigNumber(curMax))
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
      ) && Number(bestSwapPriceImpact) > 2;
    if (ifDoubleCheck) setDoubleCheckOpen(true);
    else makeBestSwap();
  };

  const swapsToDoV3: EstimateSwapView[] = [
    {
      estimate: tokenOutAmountV3,
      pool: null,
      routeInputToken: tokenIn?.id,
      inputToken: tokenIn?.id,
      outputToken: tokenOut?.id,
      token: tokenIn,
      tokens: [tokenIn, tokenOut],
      totalInputAmount: toNonDivisibleNumber(tokenIn?.decimals, tokenInAmount),
    },
  ];

  const swapsToDoRefV3 = new Big(tokenOutAmountV3 || '0').lt(
    tokenOut?.id && swapsToDoRef && swapsToDoRef.length > 0
      ? getExpectedOutputFromActionsORIG(swapsToDoRef, tokenOut?.id)
      : 0
  )
    ? swapsToDoRef
    : swapsToDoV3;

  const showAllResults =
    swapsToDoRefV3 &&
    swapsToDoRefV3.length > 0 &&
    swapsToDoTri &&
    swapsToDoTri.length > 0 &&
    swapsToDoTri[0].inputToken === tokenIn.id &&
    swapsToDoTri[0].outputToken === tokenOut.id;

  const swapErrorCrossV3 = swapError && swapErrorV3;

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
        swapTab={swapTab}
        requested={requested}
        requestingTrigger={loadingTrigger && !requested}
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
            <div className="flex items-center  left-6 ">
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
            <div className="flex flex-col left-8">
              <div className="flex items-center">
                <FormattedMessage
                  id="swap_pro"
                  defaultMessage={'Swap Pro'}
                ></FormattedMessage>
                <span
                  className=" ml-3 h-3 flex items-center text-black bg-farmText rounded-md px-0.5 py-px"
                  style={{
                    fontSize: '10px',
                  }}
                >
                  <FormattedMessage id="beta" defaultMessage={'beta'} />
                </span>
              </div>
              <div className="flex items-center mt-5 mb-3">
                <SwapProIconLarge />
              </div>
            </div>
          )
        }
        reserves={
          !requested || swapErrorCrossV3 ? null : (
            <CrossSwapAllResult
              refTodos={swapsToDoRefV3}
              triTodos={swapsToDoTri}
              tokenInAmount={tokenInAmount}
              tokenOutId={tokenOut?.id}
              slippageTolerance={slippageTolerance}
              tokenOut={tokenOut}
              show={showAllResults}
            />
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
            history.replace(
              `#${unWrapTokenId(token.id)}${TOKEN_URL_SEPARATOR}${unWrapTokenId(
                tokenOut.id
              )}`
            );
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
                `#${unWrapTokenId(
                  tokenOut.id
                )}${TOKEN_URL_SEPARATOR}${unWrapTokenId(tokenIn.id)}`
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
            history.replace(
              `#${unWrapTokenId(
                tokenIn.id
              )}${TOKEN_URL_SEPARATOR}${unWrapTokenId(token.id)}`
            );
          }}
          balances={balances}
          tokenPriceList={tokenPriceList}
          hidden={requested}
          max={tokenOutMax}
        />

        <div className={requested && !swapErrorCrossV3 ? 'block' : 'hidden'}>
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
              amountOut={displayTokenOutAmount}
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
            to={displayTokenOutAmount}
            minAmountOut={bestSwap === 'v2' ? minAmountOut : minAmountOutV3}
            fee={bestSwap === 'v2' ? avgFee : bestFee / 100}
            swapsTodo={bestSwap === 'v2' ? swapsToDo : swapsToDoV3}
            priceImpact={bestSwapPriceImpact}
            showDetails={requested}
          />
        )}

        {swapErrorCrossV3 && requested ? (
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
        onSwap={() => makeBestSwap()}
        priceImpactValue={bestSwapPriceImpact || '0'}
      />
    </>
  );
}
