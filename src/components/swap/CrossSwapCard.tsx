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
import {
  unwrapNear,
  WRAP_NEAR_CONTRACT_ID,
  unwrapedNear,
  wnearMetadata,
  nearDeposit,
  nearWithdraw,
} from '../../services/wrap-near';
import { unWrapTokenId, wrapTokenId, DetailView_near_wnear } from './SwapCard';
import getConfig, { getExtraStablePoolConfig } from '../../services/config';
import { SWAP_MODE } from '../../pages/SwapPage';
import Big from 'big.js';
import { getMax } from '../../utils/numbers';
import { SkyWardModal } from '../layout/SwapDoubleCheck';
import { useWalletSelector } from '../../context/WalletSelectorContext';
import { CountdownTimer } from '../icon/SwapRefresh';
import { PopUpContainer } from '../icon/Info';
import { usePriceImpact, estimateValidator } from '../../state/swap';
import _ from 'lodash';
import { NEAR_WITHDRAW_KEY } from '../forms/WrapNear';

const SWAP_IN_KEY = 'REF_FI_SWAP_IN';
const SWAP_OUT_KEY = 'REF_FI_SWAP_OUT';
const SWAP_IN_KEY_SYMBOL = 'REF_FI_SWAP_IN_SYMBOL';
const SWAP_OUT_KEY_SYMBOL = 'REF_FI_SWAP_OUT_SYMBOL';
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
        isRevert ? tokenIn?.symbol : tokenOut?.symbol
      )} ≈ ${exchangeRageValue} ${toRealSymbol(
        isRevert ? tokenOut?.symbol : tokenIn?.symbol
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

export const GetPriceImpact = (
  value: string,
  tokenIn?: TokenMetadata,
  tokenInAmount?: string
) => {
  const textColor =
    Number(value) <= 1
      ? 'text-white xs:text-primaryText'
      : 1 < Number(value) && Number(value) <= 2
      ? 'text-warn'
      : 'text-error';

  const displayValue = scientificNotationToString(
    multiply(tokenInAmount, divide(value, '100'))
  );
  const tokenInInfo =
    Number(displayValue) <= 0
      ? ` / 0 ${toRealSymbol(tokenIn?.symbol)}`
      : ` / -${toInternationalCurrencySystemLongString(displayValue, 3)} ${
          tokenIn?.symbol
        }`;

  if (Number(value) < 0.01)
    return (
      <span className="text-white xs:text-primaryText">
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
    <span className={`${textColor} `}>
      {`-${toPrecision(value || '0', 2)}%`}
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

export default function CrossSwapCard(props: {
  allTokens: TokenMetadata[];
  tokenInAmount: string;
  setTokenInAmount: (amount: string) => void;
  globalWhiteListTokens: TokenMetadata[];
  swapTab?: JSX.Element;
}) {
  const { NEARXIDS, STNEARIDS } = getExtraStablePoolConfig();
  const { REF_TOKEN_ID } = getConfig();
  const {
    allTokens,
    tokenInAmount,
    swapTab,
    setTokenInAmount,
    globalWhiteListTokens,
  } = props;
  const [tokenIn, setTokenIn] = useState<TokenMetadata>();
  const [tokenOut, setTokenOut] = useState<TokenMetadata>();
  const [doubleCheckOpen, setDoubleCheckOpen] = useState<boolean>(false);
  const [showSkywardTip, setShowSkywardTip] = useState<boolean>(false);

  const [requested, setRequested] = useState<boolean>(false);
  const [poolError, setPoolError] = useState<string>('');
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [loadingTrigger, setLoadingTrigger] = useState<boolean>(true);
  const [loadingPause, setLoadingPause] = useState<boolean>(false);
  const [supportLedger, setSupportLedger] = useState(
    localStorage.getItem(SUPPORT_LEDGER_KEY) ? true : false
  );

  const [useNearBalance, setUseNearBalance] = useState<boolean>(true);
  const history = useHistory();

  const { accountId } = useWalletSelector();

  const [balanceInDone, setBalanceInDone] = useState<boolean>(false);
  const [balanceOutDone, setBalanceOutDone] = useState<boolean>(false);

  const [crossAllResults, setCrossAllResults] = useState<JSX.Element>(null);

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
  const [wrapOperation, setWrapOperation] = useState<boolean>(false);
  const skywardId =
    getConfig().networkId === 'mainnet'
      ? 'token.skyward.near'
      : 'skyward.fakes.testnet';

  const tokenPriceList = useTokenPriceList();

  useEffect(() => {
    let urlTokenInId = allTokens.find((t) => t.id && t.id === urlTokenIn)?.id;

    let urlTokenOutId = allTokens.find((t) => t.id && t.id === urlTokenOut)?.id;
    if (!urlTokenInId) {
      urlTokenInId = globalWhiteListTokens.find(
        (t) => t?.symbol && t?.symbol === urlTokenIn
      )?.id;
    }

    if (!urlTokenOutId) {
      urlTokenOutId = globalWhiteListTokens.find(
        (t) => t?.symbol && t?.symbol === urlTokenOut
      )?.id;
    }

    const [in_id, out_id] = getStorageTokenId();
    let rememberedIn = wrapTokenId(urlTokenInId) || in_id;
    let rememberedOut = wrapTokenId(urlTokenOutId) || out_id;
    if (rememberedIn == NEARXIDS[0]) {
      rememberedIn = REF_TOKEN_ID;
    }
    if (rememberedOut == NEARXIDS[0]) {
      rememberedOut = REF_TOKEN_ID;
    }
    if (allTokens) {
      let candTokenIn;
      if (urlTokenIn == 'near' || urlTokenIn == 'NEAR') {
        candTokenIn = unwrapedNear;
      } else if (urlTokenIn == WRAP_NEAR_CONTRACT_ID || urlTokenIn == 'wNEAR') {
        candTokenIn = wnearMetadata;
      } else if (rememberedIn == 'near') {
        candTokenIn = unwrapedNear;
      } else if (rememberedIn == WRAP_NEAR_CONTRACT_ID) {
        candTokenIn = wnearMetadata;
      } else {
        candTokenIn =
          allTokens.find((token) => token.id === rememberedIn) || allTokens[0];
      }
      setTokenIn(candTokenIn);
      let candTokenOut;
      if (urlTokenOut == 'near' || urlTokenOut == 'NEAR') {
        candTokenOut = unwrapedNear;
      } else if (
        urlTokenOut == WRAP_NEAR_CONTRACT_ID ||
        urlTokenOut == 'wNEAR'
      ) {
        candTokenOut = wnearMetadata;
      } else if (rememberedOut == 'near') {
        candTokenOut = unwrapedNear;
      } else if (rememberedOut == WRAP_NEAR_CONTRACT_ID) {
        candTokenOut = wnearMetadata;
      } else {
        candTokenOut =
          allTokens.find((token) => token.id === rememberedOut) || allTokens[1];
      }
      setTokenOut(candTokenOut);

      if (candTokenIn.id === skywardId || candTokenOut.id === skywardId) {
        setShowSkywardTip(true);
      }
    }
  }, [allTokens?.map((t) => t.id).join('-'), urlTokenIn, urlTokenOut]);

  function getStorageTokenId() {
    const in_key = localStorage.getItem(SWAP_IN_KEY);
    const in_key_symbol = localStorage.getItem(SWAP_IN_KEY_SYMBOL);
    const out_key = localStorage.getItem(SWAP_OUT_KEY);
    const out_key_symbol = localStorage.getItem(SWAP_OUT_KEY_SYMBOL);
    const result = [];
    if (in_key == WRAP_NEAR_CONTRACT_ID) {
      if (in_key_symbol == 'NEAR') {
        result.push('near');
      } else {
        result.push(WRAP_NEAR_CONTRACT_ID);
      }
    } else {
      result.push(in_key);
    }
    if (out_key == WRAP_NEAR_CONTRACT_ID) {
      if (out_key_symbol == 'NEAR') {
        result.push('near');
      } else {
        result.push(WRAP_NEAR_CONTRACT_ID);
      }
    } else {
      result.push(out_key);
    }
    return result;
  }

  useEffect(() => {
    if (!tokenIn || !tokenOut || !isSignedIn) return;
    const tokenInId = tokenIn.id;
    const tokenOutId = tokenOut.id;

    setBalanceInDone(false);
    setBalanceOutDone(false);

    ftGetBalance(
      tokenInId === WRAP_NEAR_CONTRACT_ID && tokenIn?.symbol == 'NEAR'
        ? 'NEAR'
        : tokenInId
    )
      .then((available: string) =>
        setTokenInBalanceFromNear(
          toReadableNumber(tokenIn?.decimals, available)
        )
      )
      .finally(() => setBalanceInDone(true));
    ftGetBalance(
      tokenOutId === WRAP_NEAR_CONTRACT_ID && tokenOut?.symbol == 'NEAR'
        ? 'NEAR'
        : tokenOutId
    )
      .then((available: string) =>
        setTokenOutBalanceFromNear(
          toReadableNumber(tokenOut?.decimals, available)
        )
      )
      .finally(() => setBalanceOutDone(true));
  }, [tokenIn, tokenOut, isSignedIn, nearBalance]);
  useEffect(() => {
    if (!tokenIn || !tokenOut) return;
    history.replace(
      `#${unWrapTokenId(tokenIn)}${TOKEN_URL_SEPARATOR}${unWrapTokenId(
        tokenOut
      )}`
    );
    localStorage.setItem(SWAP_IN_KEY_SYMBOL, tokenIn?.symbol);
    localStorage.setItem(SWAP_OUT_KEY_SYMBOL, tokenOut?.symbol);
    if (
      tokenIn &&
      tokenOut &&
      ((tokenIn?.symbol == 'NEAR' && tokenOut?.symbol == 'wNEAR') ||
        (tokenIn?.symbol == 'wNEAR' && tokenOut?.symbol == 'NEAR'))
    ) {
      setWrapOperation(true);
    } else {
      setWrapOperation(false);
    }
  }, [tokenIn?.id, tokenOut?.id, tokenIn?.symbol, tokenOut?.symbol]);

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
    setCrossQuoteDone,
  } = useCrossSwap({
    tokenIn: tokenIn,
    tokenInAmount,
    tokenOut: tokenOut,
    slippageTolerance,
    supportLedger,
    loadingTrigger,
    setLoadingTrigger,
    loadingPause,
    wrapOperation,
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
    setQuoteDone: setQuoteDoneV3,
  } = useSwapV3({
    tokenIn,
    tokenOut,
    tokenInAmount,
    slippageTolerance,
    swapMode: SWAP_MODE.NORMAL,
    loadingTrigger,
    wrapOperation,
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
    bestSwap === 'v3' && canSwapV3 ? priceImpactV3 : priceImpactValueRefV1;

  const makeBestSwap = () => {
    if (!selectTodos) return;

    if (selectTodos?.[0].pool === null) {
      makeSwapV3();
    } else
      swap({
        slippageTolerance,
        swapsToDo: selectTodos,
        tokenIn,
        amountIn: tokenInAmount,
        tokenOut,
        useNearBalance,
      }).catch(setSwapError);
  };

  const tokenInMax = tokenInBalanceFromNear || '0';

  const tokenOutMax = tokenOutBalanceFromNear || '0';

  const curMax =
    tokenIn?.id === WRAP_NEAR_CONTRACT_ID && tokenIn?.symbol == 'NEAR'
      ? Number(tokenInMax) <= 0.5
        ? '0'
        : String(Number(tokenInMax) - 0.5)
      : tokenInMax;

  const canSubmit =
    (wrapOperation ||
      ((canSwap || (!ONLY_ZEROS.test(tokenOutAmountV3) && canSwapV3)) &&
        isSignedIn &&
        !ONLY_ZEROS.test(curMax) &&
        !ONLY_ZEROS.test(tokenInAmount) &&
        quoteDoneV3 &&
        crossQuoteDone &&
        selectTodos &&
        !!selectReceive &&
        selectTodos.length > 0 &&
        selectTodos[selectTodos?.length - 1].outputToken === tokenOut?.id &&
        estimateValidator(
          selectTodos,
          tokenIn,
          toNonDivisibleNumber(tokenIn.decimals, tokenInAmount),
          tokenOut
        ))) &&
    new BigNumber(tokenInAmount).lte(new BigNumber(curMax));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (wrapOperation) {
      handleSubmit_wrap(event);
      return;
    }

    const ifDoubleCheck =
      new BigNumber(tokenInAmount).isLessThanOrEqualTo(
        new BigNumber(tokenInMax)
      ) &&
      Number(
        selectTodos?.[0]?.pool?.Dex === 'tri'
          ? priceImpactValueTri
          : bestSwapPriceImpact
      ) > 2;
    if (ifDoubleCheck) setDoubleCheckOpen(true);
    else makeBestSwap();
  };
  const handleSubmit_wrap = (e: any) => {
    e.preventDefault();

    sessionStorage.setItem(NEAR_WITHDRAW_KEY, '1');

    if (tokenIn?.symbol === 'NEAR') {
      setShowSwapLoading(true);
      return nearDeposit(tokenInAmount);
    } else {
      setShowSwapLoading(true);
      return nearWithdraw(tokenInAmount);
    }
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
    const swapsToDoRefV3 =
      swapError && canSwapV3
        ? swapsToDoV3
        : !swapErrorV3 &&
          canSwapV3 &&
          new Big(tokenOutAmountV3 || '0').gte(
            tokenOut?.id && swapsToDoRef && swapsToDoRef.length > 0
              ? getExpectedOutputFromActionsORIG(swapsToDoRef, tokenOut?.id)
              : 0
          )
        ? swapsToDoV3
        : swapsToDoRef;

    const todosValidator =
      !swapsToDoRefV3 ||
      swapsToDoRefV3?.length === 0 ||
      swapsToDoRefV3?.[swapsToDoRefV3?.length - 1]?.outputToken ===
        tokenOut?.id ||
      !swapsToDoTri ||
      swapsToDoTri?.length === 0 ||
      swapsToDoTri?.[0]?.outputToken === tokenOut?.id;

    if (
      quoteDoneV3 &&
      crossQuoteDone &&
      !wrapOperation &&
      // !loadingTrigger &&
      todosValidator
    ) {
      if (!canSwap && !canSwapV3) {
        setCrossAllResults(null);
        return;
      }
      try {
        setCrossAllResults(
          <CrossSwapAllResult
            refTodos={
              swapsToDoRefV3 &&
              swapsToDoRefV3.length > 0 &&
              swapsToDoRefV3?.[swapsToDoRefV3?.length - 1]?.outputToken ===
                tokenOut?.id
                ? swapsToDoRefV3
                : []
            }
            triTodos={
              swapError
                ? []
                : swapsToDoTri &&
                  swapsToDoTri.length > 0 &&
                  swapsToDoTri?.[0]?.outputToken === tokenOut?.id
                ? swapsToDoTri
                : []
            }
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
            feeRef={
              swapsToDoRefV3 && swapsToDoRefV3?.[0]?.pool === null
                ? bestFee / 100
                : refAvgFee
            }
            feeTri={triAvgFee}
            selectReceive={selectReceive}
            supportLedger={supportLedger}
          />
        );
      } catch (error) {
        // alert(error.message)

        return null;
      }
    }
  }, [
    selectReceive,
    bestSwap,
    quoteDoneV3,
    crossQuoteDone,
    loadingTrigger,
    slippageTolerance,
    loadingPause,
    loadingData,
    showSwapLoading,
    swapsToDoRef,
    swapsToDoTri,
    priceImpactV3,
    supportLedger,
    tokenOutAmount,
    tokenOutAmountV3,
    canSwapV3,
    canSwap,
  ]);

  useEffect(() => {
    if (!crossQuoteDone || !quoteDoneV3) {
      return;
    }
    if (swapError && swapErrorV3) {
      setPoolError(
        swapError?.message ? swapError?.message : swapErrorV3?.message
      );
    } else {
      setPoolError(null);
    }
  }, [crossQuoteDone, quoteDoneV3, swapError, swapErrorV3]);
  const NoPoolError = () => {
    return new Error(
      `${intl.formatMessage({
        id: 'no_pool_available_to_make_a_swap_from',
      })} ${tokenIn?.symbol} -> ${tokenOut?.symbol} ${intl.formatMessage({
        id: 'for_the_amount',
      })} ${tokenInAmount} ${intl.formatMessage({
        id: 'no_pool_eng_for_chinese',
      })}`
    );
  };
  return (
    <>
      <CrossSwapFormWrap
        supportLedger={supportLedger}
        crossSwap={true}
        setSupportLedger={setSupportLedger}
        useNearBalance={useNearBalance.toString()}
        canSubmit={canSubmit}
        wrapOperation={wrapOperation}
        slippageTolerance={slippageTolerance}
        onChange={(slippage) => {
          setSlippageTolerance(slippage);
          localStorage.setItem(SWAP_SLIPPAGE_KEY, slippage?.toString());
        }}
        swapTab={swapTab}
        requested={requested}
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
        title={
          balanceInDone &&
          tokenIn &&
          typeof tokenInBalanceFromNear !== 'undefined' &&
          (Number(getMax(tokenIn.id, tokenInBalanceFromNear || '0', tokenIn)) -
            Number(tokenInAmount || '0') <
            0 ||
            ONLY_ZEROS.test(tokenInBalanceFromNear))
            ? 'insufficient_balance'
            : 'swap'
        }
        selectTodos={selectTodos}
      >
        <TokenAmountV3
          tokenIn={tokenIn}
          max={tokenInMax}
          selectedToken={tokenIn}
          onChangeAmount={(amount) => {
            setTokenInAmount(amount);
          }}
          forCross
          total={tokenInMax}
          balances={balances}
          tokenPriceList={tokenPriceList}
          tokens={allTokens}
          allowWNEAR
          onSelectToken={(token) => {
            localStorage.setItem(SWAP_IN_KEY, token.id);
            setQuoteDoneV3(false);
            setCrossQuoteDone(false);

            setTokenIn(token);

            if (token.id === skywardId) {
              setShowSkywardTip(true);
            }
          }}
          amount={tokenInAmount}
          nearErrorTip={
            balanceInDone &&
            balanceOutDone &&
            tokenIn &&
            Number(getMax(tokenIn.id, tokenInMax || '0', tokenIn)) -
              Number(tokenInAmount || '0') <
              0 &&
            !ONLY_ZEROS.test(tokenInMax || '0') &&
            !ONLY_ZEROS.test(tokenInAmount || '0') &&
            tokenIn.id === WRAP_NEAR_CONTRACT_ID &&
            tokenIn?.symbol === 'NEAR' && (
              <div className="mb-2">
                <Alert
                  level="warn"
                  message={`${intl.formatMessage({
                    id: 'near_validation_error',
                  })} `}
                  extraClass="px-0 pb-3"
                />
              </div>
            )
          }
        />
        <div className={`flex items-center -my-2 justify-center`}>
          <SwapExchangeV1
            onChange={() => {
              setQuoteDoneV3(false);
              setCrossQuoteDone(false);
              setTokenIn(tokenOut);
              localStorage.setItem(SWAP_IN_KEY, tokenOut.id);
              setTokenOut(tokenIn);
              localStorage.setItem(SWAP_OUT_KEY, tokenIn.id);

              setTokenInAmount(toPrecision('1', 6));
              localStorage.setItem(SWAP_IN_KEY, tokenOut.id);
              localStorage.setItem(SWAP_OUT_KEY, tokenIn.id);
            }}
          />
        </div>

        <TokenAmountV3
          tokens={allTokens}
          tokenOut={tokenOut}
          selectedToken={tokenOut}
          forCross
          onSelectToken={(token) => {
            setQuoteDoneV3(false);
            setCrossQuoteDone(false);
            setTokenOut(token);
            localStorage.setItem(SWAP_OUT_KEY, token.id);

            if (token.id === skywardId) {
              setShowSkywardTip(true);
            }
          }}
          total={tokenOutMax}
          amount={
            wrapOperation
              ? tokenInAmount
              : !!selectReceive &&
                tokenIn &&
                tokenOut &&
                tokenIn.id !== tokenOut.id
              ? toPrecision(selectReceive, 8)
              : ''
          }
          allowWNEAR
          balances={balances}
          tokenPriceList={tokenPriceList}
          max={tokenOutMax}
        />
        {poolError ||
        !tokenIn ||
        !tokenOut ||
        tokenIn.id === tokenOut.id ||
        wrapOperation ||
        ONLY_ZEROS.test(tokenInAmount)
          ? null
          : crossAllResults}

        {poolError && tokenIn?.id !== tokenOut?.id ? (
          <div className="pb-2 relative -mb-5">
            <Alert level="warn" message={poolError} />
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
        priceImpactValue={
          selectTodos?.[0]?.pool?.Dex === 'tri'
            ? priceImpactValueTri
            : bestSwapPriceImpact || '0'
        }
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
