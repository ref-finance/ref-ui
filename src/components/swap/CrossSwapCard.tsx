import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useContext,
  createContext,
} from 'react';

// @ts-ignore
import { getExpectedOutputFromActionsORIG } from '../../services/smartRouteLogic';

import { useLocation, useHistory } from 'react-router-dom';
import { ftGetBalance, TokenMetadata } from '../../services/ft-contract';
import { Pool } from '../../services/pool';
import {
  useTokenBalances,
  useDepositableBalance,
  useTokenPriceList,
} from '../../state/token';
import {
  useSwap,
  useCrossSwap,
  useSwapV3,
  useCrossSwapPopUp,
} from '../../state/swap';
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
} from '../../utils/wallets-integration';
import {
  SwapArrow,
  SwapExchange,
  ExchangeArrow,
  SwapExchangeV1,
} from '../icon/Arrows';
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
import { getMax } from '../../utils/numbers';
import { SkyWardModal } from '../layout/SwapDoubleCheck';
import { useWalletSelector } from '../../context/WalletSelectorContext';
import { CountdownTimer } from '../icon/SwapRefresh';
import { PopUpContainer } from '../icon/Info';
import { usePriceImpact } from '../../state/swap';

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
  value,
  from,
  to,
  tokenIn,
  tokenOut,
}: {
  value: string;
  from: string;
  to: string;
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
}) {
  const [newValue, setNewValue] = useState<string>('');
  const [isRevert, setIsRevert] = useState<boolean>(false);

  const exchangeRageValue = useMemo(() => {
    const fromNow = isRevert ? from : to;
    const toNow = isRevert ? to : from;
    if (ONLY_ZEROS.test(fromNow)) return '-';

    return calculateExchangeRate(0, fromNow, toNow);
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
    <div className="flex justify-end text-white " onClick={switchSwapRate}>
      <span className="mr-2" style={{ marginTop: '0.1rem' }}>
        <FaExchangeAlt color="#00C6A2" />
      </span>
      <span className="font-sans">{newValue}</span>
    </div>
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
    else return calculateExchangeRate(0, to, from);
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
    <div className={showDetails ? '' : 'hidden'}>
      <SwapRateDetail
        value={`1 ${toRealSymbol(
          tokenOut.symbol
        )} ≈ ${exchangeRateValue} ${toRealSymbol(tokenIn.symbol)}`}
        from={from}
        to={to}
        tokenIn={tokenIn}
        tokenOut={tokenOut}
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
  const [showSkywardTip, setShowSkywardTip] = useState<boolean>(false);

  const [requested, setRequested] = useState<boolean>(false);

  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [loadingTrigger, setLoadingTrigger] = useState<boolean>(true);
  const [loadingPause, setLoadingPause] = useState<boolean>(false);
  const [supportLedger, setSupportLedger] = useState(
    localStorage.getItem(SUPPORT_LEDGER_KEY) ? true : false
  );

  const [useNearBalance, setUseNearBalance] = useState<boolean>(true);
  const history = useHistory();

  const { accountId } = useWalletSelector();

  const [crossAllResults, setCrossAllResults] = useState(null);

  const isSignedIn = !!accountId;

  const nearBalance = useDepositableBalance('NEAR');

  const [tokenInBalanceFromNear, setTokenInBalanceFromNear] =
    useState<string>();

  const [tokenOutBalanceFromNear, setTokenOutBalanceFromNear] =
    useState<string>();

  const [showSwapLoading, setShowSwapLoading] = useState<boolean>(false);

  const [selectTodos, setSelectTodos] = useState<EstimateSwapView[]>();
  const [selectReceive, setSelectReceive] = useState<string>('');

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
  const skywardId =
    getConfig().networkId === 'mainnet'
      ? 'token.skyward.near'
      : 'skyward.fakes.testnet';

  const tokenPriceList = useTokenPriceList();

  useEffect(() => {
    const urlTokenInId = allTokens.find(
      (t) => t.symbol && t.symbol === urlTokenIn
    )?.id;
    const urlTokenOutId = allTokens.find(
      (t) => t.symbol && t.symbol === urlTokenOut
    )?.id;
    let rememberedIn =
      wrapTokenId(urlTokenInId) || localStorage.getItem(SWAP_IN_KEY);
    let rememberedOut =
      wrapTokenId(urlTokenOutId) || localStorage.getItem(SWAP_OUT_KEY);
    if (rememberedIn == NEARXIDS[0]) {
      rememberedIn = REF_TOKEN_ID;
    }
    if (rememberedOut == NEARXIDS[0]) {
      rememberedOut = REF_TOKEN_ID;
    }
    if (allTokens) {
      const candTokenIn =
        allTokens.find((token) => token.id === rememberedIn) || allTokens[0];

      setTokenIn(candTokenIn);

      const candTokenOut =
        allTokens.find((token) => token.id === rememberedOut) || allTokens[1];

      setTokenOut(candTokenOut);

      if (candTokenIn.id === skywardId || candTokenOut.id === skywardId) {
        setShowSkywardTip(true);
      }
    }
  }, [allTokens?.map((t) => t.id).join('-')]);

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
  }, [tokenIn?.id, tokenOut?.id, isSignedIn, nearBalance]);
  useEffect(() => {
    if (!tokenIn || !tokenOut) return;
    history.replace(
      `#${tokenIn.symbol}${TOKEN_URL_SEPARATOR}${tokenOut.symbol}`
    );
  }, [tokenIn?.id, tokenOut?.id]);

  const {
    tokenOutAmount,
    minAmountOut,
    pools,
    swapError,
    avgFee,
    swapsToDo,
    canSwap,
    setSwapError,
    swapsToDoRef,
    swapsToDoTri,
    crossQuoteDone,
    refAmountOut,
    refAvgFee,
    triAvgFee,
  } = useCrossSwap({
    tokenIn: tokenIn,
    tokenInAmount,
    tokenOut: tokenOut,
    slippageTolerance,
    supportLedger,
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

  const bestSwap = new Big(tokenOutAmountV3 || '0').gt(tokenOutAmount || '0')
    ? 'v3'
    : 'v2';
  useCrossSwapPopUp(bestSwap);

  const priceImpactValueRefV1 = usePriceImpact({
    swapsToDo: swapsToDoRef,
    tokenIn,
    tokenOut,
    tokenInAmount,
    tokenOutAmount: refAmountOut,
  });

  const priceImpactValueTri = usePriceImpact({
    swapsToDo: swapsToDoTri,
    tokenIn,
    tokenOut,
    tokenInAmount,
    tokenOutAmount: swapsToDoTri?.[0]?.estimate || '0',
  });

  const bestSwapPriceImpact =
    bestSwap === 'v3' ? priceImpactV3 : priceImpactValueRefV1;

  const makeBestSwap = () => {
    if (bestSwap === 'v3') {
      makeSwapV3();
    } else if (!!selectTodos) {
      swap({
        slippageTolerance,
        swapsToDo: selectTodos,
        tokenIn,
        amountIn: tokenInAmount,
        tokenOut,
        useNearBalance,
      }).catch(setSwapError);
    }
  };

  const tokenInMax = tokenInBalanceFromNear || '0';

  const tokenOutMax = tokenOutBalanceFromNear || '0';

  const curMax =
    tokenIn?.id === WRAP_NEAR_CONTRACT_ID
      ? Number(tokenInMax) <= 0.5
        ? '0'
        : String(Number(tokenInMax) - 0.5)
      : tokenInMax;

  const canSubmit =
    (canSwap || (!ONLY_ZEROS.test(tokenOutAmountV3) && canSwapV3)) &&
    isSignedIn &&
    !ONLY_ZEROS.test(curMax) &&
    !ONLY_ZEROS.test(tokenInAmount) &&
    new BigNumber(tokenInAmount).lte(new BigNumber(curMax));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

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

  const swapsToDoRefV3 =
    !swapErrorV3 &&
    new Big(tokenOutAmountV3 || '0').gte(
      tokenOut?.id && swapsToDoRef && swapsToDoRef.length > 0
        ? getExpectedOutputFromActionsORIG(swapsToDoRef, tokenOut?.id)
        : 0
    )
      ? swapsToDoV3
      : swapsToDoRef;

  useEffect(() => {
    if (quoteDoneV3 && crossQuoteDone) {
      setSelectTodos(swapsToDoRefV3);
    }
  }, [quoteDoneV3, crossQuoteDone]);

  const LoadingRefresh = (
    <div
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        if (loadingPause) {
          setLoadingPause(false);
          setLoadingTrigger(true);
          setLoadingData(true);
        } else {
          setLoadingPause(true);
          setLoadingTrigger(false);
        }
      }}
      className="mr-2 cursor-pointer"
    >
      <CountdownTimer
        loadingTrigger={loadingTrigger}
        loadingPause={loadingPause}
      />
    </div>
  );

  useEffect(() => {
    if (quoteDoneV3 && crossQuoteDone) {
      setCrossAllResults(
        <CrossSwapAllResult
          refTodos={swapsToDoRefV3}
          triTodos={swapsToDoTri}
          tokenInAmount={tokenInAmount}
          tokenOutId={tokenOut?.id}
          slippageTolerance={slippageTolerance}
          tokenOut={tokenOut}
          LoadingRefresh={LoadingRefresh}
          selectTodos={selectTodos}
          setSelectTodos={setSelectTodos}
          tokenIn={tokenIn}
          tokenPriceList={tokenPriceList}
          setSelectReceive={setSelectReceive}
          priceImpactRef={bestSwapPriceImpact}
          priceImpactTri={priceImpactValueTri}
          feeRef={bestSwap === 'v3' ? bestFee / 100 : refAvgFee}
          feeTri={triAvgFee}
          selectReceive={selectReceive}
        />
      );
    }
  }, [
    selectTodos,
    quoteDoneV3,
    crossQuoteDone,
    loadingTrigger,
    slippageTolerance,
    loadingPause,
    loadingData,
    swapsToDoRef,
    swapsToDoTri,
  ]);

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
          <div className="flex justify-center items-center mb-6">
            <SwapProIconLarge />
          </div>
        }
        showElseView={tokenInMax === '0' && !useNearBalance}
        elseView={<SubmitButton disabled={true} loading={showSwapLoading} />}
        onSubmit={handleSubmit}
        info={intl.formatMessage({ id: 'swapCopy' })}
        title={'swap'}
      >
        <TokenAmountV3
          tokenIn={tokenIn}
          max={tokenInMax}
          selectedToken={tokenIn}
          onChangeAmount={(amount) => {
            setTokenInAmount(amount);
          }}
          total={tokenInMax}
          balances={balances}
          tokenPriceList={tokenPriceList}
          tokens={allTokens}
          onSelectToken={(token) => {
            localStorage.setItem(SWAP_IN_KEY, token.id);
            setTokenIn(token);
            history.replace(
              `#${token.symbol}${TOKEN_URL_SEPARATOR}${tokenOut.symbol}`
            );

            if (token.id === skywardId) {
              setShowSkywardTip(true);
            }
          }}
          amount={tokenInAmount}
        />
        <div className={`flex items-center -my-2 justify-center`}>
          <SwapExchangeV1
            onChange={() => {
              setTokenIn(tokenOut);
              localStorage.setItem(SWAP_IN_KEY, tokenOut.id);
              setTokenOut(tokenIn);
              localStorage.setItem(SWAP_OUT_KEY, tokenIn.id);

              setTokenInAmount(toPrecision('1', 6));
              localStorage.setItem(SWAP_IN_KEY, tokenOut.id);
              localStorage.setItem(SWAP_OUT_KEY, tokenIn.id);
              history.replace(
                `#${tokenOut.symbol}${TOKEN_URL_SEPARATOR}${tokenIn.symbol}`
              );
            }}
          />
        </div>

        <TokenAmountV3
          tokens={allTokens}
          tokenOut={tokenOut}
          selectedToken={tokenOut}
          onSelectToken={(token) => {
            setTokenOut(token);
            localStorage.setItem(SWAP_OUT_KEY, token.id);
            history.replace(
              `#${tokenIn.symbol}${TOKEN_URL_SEPARATOR}${token.symbol}`
            );

            if (token.id === skywardId) {
              setShowSkywardTip(true);
            }
          }}
          total={tokenOutMax}
          amount={
            !!selectReceive && tokenIn && tokenOut && tokenIn.id !== tokenOut.id
              ? toPrecision(selectReceive, 8)
              : ''
          }
          balances={balances}
          tokenPriceList={tokenPriceList}
          max={tokenOutMax}
        />
        {swapErrorCrossV3 || !tokenIn || !tokenOut || tokenIn.id === tokenOut.id
          ? null
          : crossAllResults}

        {/* 
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
        /> */}

        {swapErrorCrossV3 ? (
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

      <SkyWardModal
        onRequestClose={() => {
          setShowSkywardTip(false);
        }}
        isOpen={showSkywardTip}
      />
    </>
  );
}
