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
import { useTokenBalances, useDepositableBalance } from '../../state/token';
import { useSwap } from '../../state/swap';
import {
  calculateExchangeRate,
  calculateFeeCharge,
  calculateFeePercent,
  calculateSmartRoutingPriceImpact,
  toPrecision,
  toReadableNumber,
  ONLY_ZEROS,
  multiply,
  divide,
  scientificNotationToString,
  calculateSmartRoutesV2PriceImpact,
  separateRoutes,
  calcStableSwapPriceImpact,
  toInternationalCurrencySystemLongString,
} from '../../utils/numbers';
import ReactDOMServer from 'react-dom/server';
import TokenAmount from '../forms/TokenAmount';
import SubmitButton from '../forms/SubmitButton';
import Alert from '../alert/Alert';
import { toRealSymbol } from '../../utils/token';
import { FormattedMessage, useIntl } from 'react-intl';
import { FaAngleUp, FaAngleDown, FaExchangeAlt } from 'react-icons/fa';
import db from '../../store/RefDatabase';
import {
  ButtonTextWrapper,
  GradientButton,
  OutlineButton,
  SolidButton,
  ConnectToNearBtn,
} from '../../components/button/Button';
import {
  AllStableTokenIds,
  BTCIDS,
  BTC_STABLE_POOL_ID,
  CUSDIDS,
  LINEARIDS,
  LINEAR_POOL_ID,
  NEARXIDS,
  NEAX_POOL_ID,
  STABLE_POOL_TYPE,
  STABLE_TOKEN_IDS,
  STNEARIDS,
  STNEAR_POOL_ID,
  wallet,
} from '../../services/near';
import SwapFormWrap from '../forms/SwapFormWrap';
import SwapTip from '../../components/forms/SwapTip';
import { WarnTriangle, ErrorTriangle } from '../../components/icon/SwapRefresh';
import ReactModal from 'react-modal';
import Modal from 'react-modal';
import { Card } from '../../components/card/Card';
import { isMobile, useMobile } from '../../utils/device';
import { ModalClose } from '../../components/icon';
import BigNumber from 'bignumber.js';
import {
  AutoRouterText,
  OneParallelRoute,
  RouterIcon,
  SmartRouteV2,
} from '../../components/layout/SwapRoutes';

import { EstimateSwapView, PoolMode, swap } from '../../services/swap';
import { QuestionTip } from '../../components/layout/TipWrapper';
import { senderWallet, WalletContext } from '../../utils/sender-wallet';
import { SwapArrow, SwapExchange } from '../icon/Arrows';
import { getPoolAllocationPercents, percentLess } from '../../utils/numbers';
import { DoubleCheckModal } from '../../components/layout/SwapDoubleCheck';
import { getTokenPriceList } from '../../services/indexer';
import { SWAP_MODE } from '../../pages/SwapPage';
import { isStableToken, STABLE_TOKEN_USN_IDS } from '../../services/near';
import TokenReserves from '../stableswap/TokenReserves';
import { unwrapNear, WRAP_NEAR_CONTRACT_ID } from '../../services/wrap-near';
import getConfig, { getExtraStablePoolConfig } from '../../services/config';
import { SwapMinReceiveCheck } from '../icon/swapV3';
import { TokenAmountV3 } from '../forms/TokenAmount';

const SWAP_IN_KEY = 'REF_FI_SWAP_IN';
const SWAP_OUT_KEY = 'REF_FI_SWAP_OUT';

const SWAP_SLIPPAGE_KEY = 'REF_FI_SLIPPAGE_VALUE';

const SWAP_SLIPPAGE_KEY_STABLE = 'REF_FI_SLIPPAGE_VALUE_STABLE';

export const SWAP_USE_NEAR_BALANCE_KEY = 'REF_FI_USE_NEAR_BALANCE_VALUE';
const TOKEN_URL_SEPARATOR = '|';

const isSameClass = (token1: string, token2: string) => {
  const USDTokenList = new Array(
    ...new Set(STABLE_TOKEN_USN_IDS.concat(STABLE_TOKEN_IDS).concat(CUSDIDS))
  );

  const BTCTokenList = BTCIDS.map((id) => id);

  const NEARTokenList = new Array(
    ...new Set(STNEARIDS.concat(LINEARIDS).concat(NEARXIDS))
  ).map((id) => id);
  return (
    (USDTokenList.includes(token1) && USDTokenList.includes(token2)) ||
    (BTCTokenList.includes(token1) && BTCTokenList.includes(token2)) ||
    (NEARTokenList.includes(token1) && NEARTokenList.includes(token2))
  );
};

export const SUPPORT_LEDGER_KEY = 'REF_FI_SUPPORT_LEDGER';

export const unWrapTokenId = (id: string) => {
  if (id === WRAP_NEAR_CONTRACT_ID) {
    return 'near';
  } else return id;
};

export const wrapTokenId = (id: string) => {
  if (id === 'near') {
    return WRAP_NEAR_CONTRACT_ID;
  } else return id;
};

export function SwapDetail({
  title,
  value,
}: {
  title: string;
  value: string | JSX.Element;
}) {
  return (
    <section className="grid grid-cols-12 pt-1 pb-2 text-xs">
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
    <section className="grid grid-cols-12 py-1 text-xs">
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

export function SwapRate({
  value,
  from,
  to,
  tokenIn,
  tokenOut,
  fee,
  tokenPriceList,
}: {
  fee: number;
  value: string;
  from: string;
  to: string;
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  tokenPriceList?: any;
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

  const price =
    tokenPriceList?.[isRevert ? tokenIn.id : tokenOut.id]?.price || null;

  const displayPrice = !price ? null : (
    <span className="text-primaryText">{`($${toInternationalCurrencySystemLongString(
      price,
      2
    )})`}</span>
  );

  function switchSwapRate(e: React.MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
    e.preventDefault();
    setIsRevert(!isRevert);
  }

  return (
    <section className=" py-1 text-xs flex items-center">
      <p
        className="flex justify-end text-white cursor-pointer text-right mr-1"
        onClick={switchSwapRate}
      >
        <span className="mr-2" style={{ marginTop: '0.1rem' }}>
          <FaExchangeAlt color="#00C6A2" />
        </span>
        <span className="font-sans">{newValue}</span>
      </p>
      {displayPrice}
    </section>
  );
}

export function SmartRoutesV2Detail({
  swapsTodo,
}: {
  swapsTodo: EstimateSwapView[];
}) {
  const tokensPerRoute = swapsTodo
    .filter((swap) => swap.inputToken == swap.routeInputToken)
    .map((swap) => swap.tokens);

  const identicalRoutes = separateRoutes(
    swapsTodo,
    swapsTodo[swapsTodo.length - 1].outputToken
  );

  const pools = identicalRoutes.map((r) => r[0]).map((hub) => hub.pool);

  const percents = useMemo(() => {
    return getPoolAllocationPercents(pools);
  }, [identicalRoutes, pools]);

  return (
    <section
      className="md:flex px-2 lg:flex py-1 text-xs items-center md:justify-between lg:justify-between rounded-xl"
      style={{
        border: '1.2px solid rgba(145, 162, 174, 0.2)',
      }}
    >
      <div className="text-primaryText relative top-1 text-left self-start">
        <div className="inline-flex items-center">
          <RouterIcon />
          <AutoRouterText />
          <QuestionTip id="optimal_path_found_by_our_solution" width="w-56" />
        </div>
      </div>

      <div className="text-right text-white col-span-7 xs:mt-2 md:mt-2 self-start">
        {tokensPerRoute.map((tokens, index) => (
          <div key={index} className=" md:w-smartRoute lg:w-smartRoute">
            <div className="text-right text-white col-span-6 xs:mt-2 md:mt-2">
              {
                <SmartRouteV2
                  tokens={tokens}
                  p={percents[index]}
                  pools={identicalRoutes[index].map((hub) => hub.pool)}
                />
              }
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ParallelSwapRoutesDetail({
  pools,
  tokenIn,
  tokenOut,
}: {
  pools: Pool[];
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
}) {
  const percents = useMemo(() => {
    return getPoolAllocationPercents(pools);
  }, [pools]);

  return (
    <section
      className="md:grid lg:grid grid-cols-12 py-1 text-xs rounded-xl"
      style={{
        border: '1.2px solid rgba(145, 162, 174, 0.2)',
      }}
    >
      <div className="text-primaryText text-left col-span-5">
        <div className="inline-flex items-center">
          <RouterIcon />
          <AutoRouterText />
          <QuestionTip id="optimal_path_found_by_our_solution" width="w-56" />
        </div>
      </div>

      <div className="text-right text-white col-span-7 xs:mt-2 md:mt-2">
        {pools.map((pool, i) => {
          return (
            <div className="mb-2" key={pool.id}>
              <OneParallelRoute
                tokenIn={tokenIn}
                tokenOut={tokenOut}
                poolId={pool.id}
                p={percents[i]}
                fee={pool.fee}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function SmartRoutesDetail({
  swapsTodo,
}: {
  swapsTodo: EstimateSwapView[];
}) {
  return (
    <section
      className="md:flex lg:flex py-1 text-xs items-center md:justify-between lg:justify-between px-2 rounded-xl"
      style={{
        border: '1.2px solid rgba(145, 162, 174, 0.2)',
      }}
    >
      <div className="text-primaryText text-left ">
        <div className="inline-flex items-center">
          <RouterIcon />
          <AutoRouterText />
          <QuestionTip id="optimal_path_found_by_our_solution" width="w-56" />
        </div>
      </div>

      <div className="text-right text-white col-span-6 xs:mt-2">
        {
          <SmartRouteV2
            tokens={swapsTodo[0].tokens}
            p="100"
            pools={swapsTodo.map((swapTodo) => swapTodo.pool)}
          />
        }
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
  minAmountOut,
  isParallelSwap,
  fee,
  swapsTodo,
  priceImpact,
  swapMode,
  tokenPriceList,
}: {
  pools: Pool[];
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  from: string;
  to: string;
  minAmountOut: string;
  isParallelSwap?: boolean;
  fee?: number;
  swapsTodo?: EstimateSwapView[];
  priceImpact?: string;
  swapMode?: SWAP_MODE;
  tokenPriceList?: any;
}) {
  const intl = useIntl();
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const minAmountOutValue = useMemo(() => {
    if (!minAmountOut) return '0';
    else return toPrecision(minAmountOut, 8, true);
  }, [minAmountOut]);

  const exchangeRateValue = useMemo(() => {
    if (!from || ONLY_ZEROS.test(to)) return '-';
    else return calculateExchangeRate(fee, to, from);
  }, [to]);

  useEffect(() => {
    if (Number(priceImpact) > 1) {
      setShowDetails(true);
    }
  }, [priceImpact]);

  useEffect(() => {
    if (swapsTodo?.length > 1) {
      setShowDetails(true);
    }
  }, [swapsTodo]);

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
      <div className="flex items-center mb-1 justify-between text-white ">
        <SwapRate
          value={`1 ${toRealSymbol(
            tokenOut.symbol
          )} ≈ ${exchangeRateValue} ${toRealSymbol(tokenIn.symbol)}`}
          from={from}
          to={to}
          tokenIn={tokenIn}
          tokenOut={tokenOut}
          fee={fee}
          tokenPriceList={tokenPriceList}
        />

        <div
          className="pl-1 text-sm flex items-center cursor-pointer"
          onClick={() => {
            setShowDetails(!showDetails);
          }}
        >
          {showDetails ? null : (
            <span className="py-1 pl-1 pr-1.5 rounded-md flex items-center bg-opacity-20 bg-black mr-1.5">
              <SwapMinReceiveCheck />

              <span
                className=" text-white ml-1 relative top-0.5"
                style={{
                  fontSize: '13px',
                }}
              >
                {toPrecision(minAmountOutValue, 8)}
              </span>
            </span>
          )}

          <span>
            {showDetails ? (
              <FaAngleUp color="#91A2AE" />
            ) : (
              <FaAngleDown color="#91A2AE" />
            )}
          </span>
        </div>
      </div>
      <div className={showDetails ? '' : 'hidden'}>
        <SwapDetail
          title={intl.formatMessage({ id: 'minimum_received' })}
          value={<span>{toPrecision(minAmountOutValue, 8)}</span>}
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
          title={intl.formatMessage({ id: 'pool_fee' })}
          value={poolFeeDisplay}
        />

        {isParallelSwap && swapsTodo && swapsTodo.length > 1 && (
          <ParallelSwapRoutesDetail
            tokenIn={tokenIn}
            tokenOut={tokenOut}
            pools={pools}
          />
        )}

        {swapsTodo[0].status === PoolMode.SMART && (
          <SmartRoutesDetail swapsTodo={swapsTodo} />
        )}
        {!isParallelSwap &&
          swapsTodo.every((e) => e.status !== PoolMode.SMART) &&
          pools.length > 1 && <SmartRoutesV2Detail swapsTodo={swapsTodo} />}
      </div>
    </div>
  );
}

export default function SwapCard(props: {
  allTokens: TokenMetadata[];
  swapMode: SWAP_MODE;
  stablePools: Pool[];
  tokenInAmount: string;
  setTokenInAmount: (value: string) => void;
}) {
  const { NEARXIDS, STNEARIDS } = getExtraStablePoolConfig();
  const { REF_TOKEN_ID } = getConfig();
  // getConfig();
  const reserveTypeStorageKey = 'REF_FI_RESERVE_TYPE';

  const { allTokens, swapMode, stablePools, tokenInAmount, setTokenInAmount } =
    props;
  const [tokenIn, setTokenIn] = useState<TokenMetadata>();
  const [tokenOut, setTokenOut] = useState<TokenMetadata>();
  const [doubleCheckOpen, setDoubleCheckOpen] = useState<boolean>(false);

  const [reservesType, setReservesType] = useState<STABLE_POOL_TYPE>(
    STABLE_POOL_TYPE[localStorage.getItem(reserveTypeStorageKey)] ||
      STABLE_POOL_TYPE.USD
  );

  const [supportLedger, setSupportLedger] = useState(
    localStorage.getItem(SUPPORT_LEDGER_KEY) ? true : false
  );

  const [useNearBalance, setUseNearBalance] = useState<boolean>(true);

  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;

  const [tokenInBalanceFromNear, setTokenInBalanceFromNear] =
    useState<string>();
  const [tokenOutBalanceFromNear, setTokenOutBalanceFromNear] =
    useState<string>();

  const [reEstimateTrigger, setReEstimateTrigger] = useState(false);

  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [loadingTrigger, setLoadingTrigger] = useState<boolean>(true);
  const [loadingPause, setLoadingPause] = useState<boolean>(false);
  const [showSwapLoading, setShowSwapLoading] = useState<boolean>(false);

  const intl = useIntl();
  const location = useLocation();
  const history = useHistory();

  const balances = useTokenBalances();
  const [urlTokenIn, urlTokenOut, urlSlippageTolerance] = decodeURIComponent(
    location.hash.slice(1)
  ).split(TOKEN_URL_SEPARATOR);

  const nearBalance = useDepositableBalance('NEAR');

  const [slippageToleranceNormal, setSlippageToleranceNormal] =
    useState<number>(
      Number(localStorage.getItem(SWAP_SLIPPAGE_KEY) || urlSlippageTolerance) ||
        0.5
    );

  const [slippageToleranceStable, setSlippageToleranceStable] =
    useState<number>(
      Number(localStorage.getItem(SWAP_SLIPPAGE_KEY_STABLE)) || 0.5
    );

  const [tokenPriceList, setTokenPriceList] = useState<Record<string, any>>({});

  useEffect(() => {
    getTokenPriceList().then(setTokenPriceList);
  }, []);

  useEffect(() => {
    if (!tokenIn || !tokenOut) return;
    if (BTCIDS.includes(tokenIn.id) && BTCIDS.includes(tokenOut.id)) {
      setReservesType(STABLE_POOL_TYPE.BTC);
      localStorage.setItem(reserveTypeStorageKey, STABLE_POOL_TYPE.BTC);
    } else if (
      STNEARIDS.concat(LINEARIDS).concat(NEARXIDS).includes(tokenIn.id) &&
      STNEARIDS.concat(LINEARIDS).concat(NEARXIDS).includes(tokenOut.id)
    ) {
      setReservesType(STABLE_POOL_TYPE.NEAR);
      localStorage.setItem(reserveTypeStorageKey, STABLE_POOL_TYPE.NEAR);
    } else {
      setReservesType(STABLE_POOL_TYPE.USD);
      localStorage.setItem(reserveTypeStorageKey, STABLE_POOL_TYPE.USD);
    }
    // todo
    history.replace(`#${tokenIn.id}${TOKEN_URL_SEPARATOR}${tokenOut.id}`);

    localStorage.setItem(SWAP_IN_KEY, tokenIn.id);
    localStorage.setItem(SWAP_OUT_KEY, tokenOut.id);
  }, [tokenIn?.id, tokenOut?.id]);

  useEffect(() => {
    if (allTokens) {
      // todo
      let rememberedIn =
        wrapTokenId(urlTokenIn) || localStorage.getItem(SWAP_IN_KEY);
      let rememberedOut =
        wrapTokenId(urlTokenOut) || localStorage.getItem(SWAP_OUT_KEY);
      if (swapMode === SWAP_MODE.NORMAL) {
        if (rememberedIn == NEARXIDS[0]) {
          rememberedIn = REF_TOKEN_ID;
        }
        if (rememberedOut == NEARXIDS[0]) {
          rememberedOut = REF_TOKEN_ID;
        }
        const candTokenIn =
          allTokens.find((token) => token.id === rememberedIn) || allTokens[0];

        const candTokenOut =
          allTokens.find((token) => token.id === rememberedOut) || allTokens[1];
        setTokenIn(candTokenIn);
        setTokenOut(candTokenOut);

        if (
          tokenOut?.id === candTokenOut?.id &&
          tokenIn?.id === candTokenIn?.id
        )
          setReEstimateTrigger(!reEstimateTrigger);
      } else if (swapMode === SWAP_MODE.STABLE) {
        let candTokenIn: TokenMetadata;
        let candTokenOut: TokenMetadata;
        if (rememberedIn == NEARXIDS[0]) {
          rememberedIn = STNEARIDS[0];
        }
        if (rememberedOut == NEARXIDS[0]) {
          rememberedOut = STNEARIDS[0];
        }
        if (
          rememberedIn &&
          rememberedOut &&
          isSameClass(rememberedIn, rememberedOut)
        ) {
          candTokenIn = allTokens.find((token) => token.id === rememberedIn);
          candTokenOut = allTokens.find((token) => token.id === rememberedOut);
        } else {
          const USDTokenList = new Array(
            ...new Set(
              STABLE_TOKEN_USN_IDS.concat(STABLE_TOKEN_IDS).concat(CUSDIDS)
            )
          );

          candTokenIn = allTokens.find((token) => token.id === USDTokenList[0]);
          candTokenOut = allTokens.find(
            (token) => token.id === USDTokenList[1]
          );
          setTokenInAmount('1');
        }

        setTokenIn(candTokenIn);

        setTokenOut(candTokenOut);

        if (
          tokenOut?.id === candTokenOut?.id &&
          tokenIn?.id === candTokenIn?.id
        )
          setReEstimateTrigger(!reEstimateTrigger);
      }
    }
  }, [allTokens, swapMode]);

  useEffect(() => {
    if (useNearBalance) {
      if (tokenIn) {
        const tokenInId = tokenIn.id;
        if (tokenInId) {
          if (isSignedIn) {
            ftGetBalance(tokenInId).then((available: string) =>
              setTokenInBalanceFromNear(
                toReadableNumber(
                  tokenIn?.decimals,
                  tokenIn.id === WRAP_NEAR_CONTRACT_ID ? nearBalance : available
                )
              )
            );
          }
        }
      }
      if (tokenOut) {
        const tokenOutId = tokenOut.id;
        if (tokenOutId) {
          if (isSignedIn) {
            ftGetBalance(tokenOutId).then((available: string) =>
              setTokenOutBalanceFromNear(
                toReadableNumber(
                  tokenOut?.decimals,
                  tokenOut.id === WRAP_NEAR_CONTRACT_ID
                    ? nearBalance
                    : available
                )
              )
            );
          }
        }
      }
    }
  }, [tokenIn, tokenOut, useNearBalance, isSignedIn, nearBalance]);

  const slippageTolerance =
    swapMode === SWAP_MODE.NORMAL
      ? slippageToleranceNormal
      : slippageToleranceStable;

  const {
    canSwap,
    tokenOutAmount,
    minAmountOut,
    pools,
    swapError,
    makeSwap,
    avgFee,
    isParallelSwap,
    swapsToDo,
    setCanSwap,
  } = useSwap({
    tokenIn: tokenIn,
    tokenInAmount,
    tokenOut: tokenOut,
    slippageTolerance,
    setLoadingData,
    loadingTrigger,
    setLoadingTrigger,
    loadingData,
    loadingPause,
    swapMode,
    reEstimateTrigger,
    supportLedger,
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

  const tokenInMax = useNearBalance
    ? tokenInBalanceFromNear || '0'
    : toReadableNumber(tokenIn?.decimals, balances?.[tokenIn?.id]) || '0';
  const tokenOutTotal = useNearBalance
    ? tokenOutBalanceFromNear || '0'
    : toReadableNumber(tokenOut?.decimals, balances?.[tokenOut?.id]) || '0';
  const canSubmit = canSwap && (tokenInMax != '0' || !useNearBalance);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const ifDoubleCheck =
      new BigNumber(tokenInAmount).isLessThanOrEqualTo(
        new BigNumber(tokenInMax)
      ) && Number(PriceImpactValue) > 2;

    if (ifDoubleCheck) setDoubleCheckOpen(true);
    else makeSwap(useNearBalance);
  };

  return (
    <>
      <SwapFormWrap
        supportLedger={supportLedger}
        setSupportLedger={setSupportLedger}
        useNearBalance={useNearBalance.toString()}
        canSubmit={canSubmit}
        slippageTolerance={slippageTolerance}
        onChange={(slippage) => {
          swapMode === SWAP_MODE.NORMAL
            ? setSlippageToleranceNormal(slippage)
            : setSlippageToleranceStable(slippage);

          localStorage.setItem(
            swapMode === SWAP_MODE.NORMAL
              ? SWAP_SLIPPAGE_KEY
              : SWAP_SLIPPAGE_KEY_STABLE,
            slippage?.toString()
          );
        }}
        bindUseBalance={(useNearBalance) => {
          setUseNearBalance(useNearBalance);
          localStorage.setItem(
            SWAP_USE_NEAR_BALANCE_KEY,
            useNearBalance.toString()
          );
        }}
        showElseView={tokenInMax === '0' && !useNearBalance}
        elseView={
          <div className="flex justify-center">
            {isSignedIn ? (
              <SubmitButton disabled={true} loading={showSwapLoading} />
            ) : (
              <div className="mt-4 w-full">
                <ConnectToNearBtn />
              </div>
            )}
          </div>
        }
        swapMode={swapMode}
        onSubmit={handleSubmit}
        info={intl.formatMessage({ id: 'swapCopy' })}
        title={'swap'}
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
      >
        <TokenAmountV3
          forSwap
          swapMode={swapMode}
          amount={tokenInAmount}
          total={tokenInMax}
          max={tokenInMax}
          tokens={allTokens}
          selectedToken={tokenIn}
          balances={balances}
          onSelectToken={(token) => {
            localStorage.setItem(SWAP_IN_KEY, token.id);
            swapMode === SWAP_MODE.NORMAL &&
              history.replace(
                `#${unWrapTokenId(
                  token.id
                )}${TOKEN_URL_SEPARATOR}${unWrapTokenId(tokenOut.id)}`
              );
            setTokenIn(token);
            setCanSwap(false);
            setTokenInBalanceFromNear(token?.near?.toString());
          }}
          text={intl.formatMessage({ id: 'from' })}
          useNearBalance={useNearBalance}
          onChangeAmount={(amount) => {
            setTokenInAmount(amount);
          }}
          tokenPriceList={tokenPriceList}
          isError={tokenIn?.id === tokenOut?.id}
          postSelected={tokenOut}
          onSelectPost={(token) => {
            setTokenOut(token);
          }}
        />
        <div
          className="flex items-center justify-center border-t mt-12"
          style={{ borderColor: 'rgba(126, 138, 147, 0.3)' }}
        >
          <SwapExchange
            onChange={() => {
              setTokenIn(tokenOut);
              localStorage.setItem(SWAP_IN_KEY, tokenOut.id);
              setTokenOut(tokenIn);
              localStorage.setItem(SWAP_OUT_KEY, tokenIn.id);

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
        <TokenAmountV3
          forSwap
          swapMode={swapMode}
          amount={toPrecision(tokenOutAmount, 8)}
          total={tokenOutTotal}
          tokens={allTokens}
          selectedToken={tokenOut}
          balances={balances}
          preSelected={tokenIn}
          text={intl.formatMessage({ id: 'to' })}
          useNearBalance={useNearBalance}
          onSelectToken={(token) => {
            localStorage.setItem(SWAP_OUT_KEY, token.id);
            swapMode === SWAP_MODE.NORMAL &&
              history.replace(
                `#${unWrapTokenId(
                  tokenIn.id
                )}${TOKEN_URL_SEPARATOR}${unWrapTokenId(token.id)}`
              );
            setTokenOut(token);
            setCanSwap(false);
            setTokenOutBalanceFromNear(token?.near?.toString());
          }}
          isError={tokenIn?.id === tokenOut?.id}
          tokenPriceList={tokenPriceList}
        />
        <DetailView
          pools={pools}
          tokenIn={tokenIn}
          tokenOut={tokenOut}
          from={tokenInAmount}
          to={tokenOutAmount}
          minAmountOut={minAmountOut}
          isParallelSwap={isParallelSwap}
          fee={avgFee}
          swapsTodo={swapsToDo}
          priceImpact={PriceImpactValue}
          swapMode={swapMode}
          tokenPriceList={tokenPriceList}
        />
        {swapError ? (
          <div className="pb-2 relative -mb-5">
            <Alert level="warn" message={swapError.message} />
          </div>
        ) : null}
      </SwapFormWrap>
      <DoubleCheckModal
        isOpen={doubleCheckOpen}
        onRequestClose={() => {
          setDoubleCheckOpen(false);
          setShowSwapLoading(false);
          setLoadingPause(false);
        }}
        tokenIn={tokenIn}
        tokenOut={tokenOut}
        from={tokenInAmount}
        onSwap={() => makeSwap(useNearBalance)}
        priceImpactValue={PriceImpactValue}
      />
      {swapMode === SWAP_MODE.STABLE ? (
        <TokenReserves
          tokens={AllStableTokenIds.map((id) =>
            allTokens.find((token) => token.id === id)
          )
            .filter((token) => isStableToken(token.id))
            .filter((token) => {
              switch (reservesType) {
                case 'BTC':
                  return BTCIDS.includes(token.id);
                case 'USD':
                  return STABLE_TOKEN_IDS.concat(STABLE_TOKEN_USN_IDS)
                    .concat(CUSDIDS)
                    .map((id) => id.toString())
                    .includes(token.id);
                case 'NEAR':
                  return LINEARIDS.concat(STNEARIDS)
                    .concat(NEARXIDS)
                    .includes(token.id);
              }
            })}
          pools={stablePools.filter((p) => {
            switch (reservesType) {
              case 'BTC':
                return p.id.toString() === BTC_STABLE_POOL_ID;
              case 'NEAR':
                return (
                  p.id.toString() === STNEAR_POOL_ID ||
                  p.id.toString() === LINEAR_POOL_ID ||
                  p.id.toString() === NEAX_POOL_ID
                );
              case 'USD':
                return (
                  p.id.toString() !== BTC_STABLE_POOL_ID &&
                  p.id.toString() !== STNEAR_POOL_ID &&
                  p.id.toString() !== LINEAR_POOL_ID &&
                  p.id.toString() !== NEAX_POOL_ID
                );
            }
          })}
          type={reservesType}
          setType={setReservesType}
          swapPage
        />
      ) : null}
    </>
  );
}
