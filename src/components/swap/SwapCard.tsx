import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useContext,
  createContext,
} from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import {
  ftGetBalance,
  TokenMetadata,
  REF_META_DATA,
} from '../../services/ft-contract';
import { Pool } from '../../services/pool';
import { useDepositableBalance, useTokenPriceList } from '../../state/token';
import { useSwap, useSwapV3, useSwapPopUp } from '../../state/swap';
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
} from '../../utils/numbers';
import SubmitButton, { InsufficientButton } from '../forms/SubmitButton';
import Alert from '../alert/Alert';
import { toRealSymbol } from '../../utils/token';
import { FormattedMessage, useIntl } from 'react-intl';
import { FaAngleUp, FaAngleDown, FaExchangeAlt } from 'react-icons/fa';
import { ConnectToNearBtnSwap } from '../button/Button';

import SwapFormWrap from '../forms/SwapFormWrap';
import { CountdownTimer } from '../icon/SwapRefresh';
import { useMobile } from '../../utils/device';
import BigNumber from 'bignumber.js';
import {
  AutoRouterText,
  RouterIcon,
  NormalSwapRoute,
  RouteDCLDetail,
} from '../layout/SwapRoutes';

import { EstimateSwapView, PoolMode, swap } from '../../services/swap';
import { QuestionTip } from '../layout/TipWrapper';
import { WalletContext } from '../../utils/wallets-integration';
import { SwapExchangeV1 } from '../icon/Arrows';
import { getPoolAllocationPercents } from '../../utils/numbers';
import { DoubleCheckModal } from '../layout/SwapDoubleCheck';
import { SWAP_MODE, SWAP_MODE_KEY } from '../../pages/SwapPage';
import { USD_CLASS_STABLE_TOKEN_IDS } from '../../services/near';
import {
  WRAP_NEAR_CONTRACT_ID,
  unwrapedNear,
  nearDeposit,
  nearWithdraw,
  wnearMetadata,
} from '../../services/wrap-near';
import getConfig, { getExtraStablePoolConfig } from '../../services/config';
import { TokenAmountV3 } from '../forms/TokenAmount';
import Big from 'big.js';

import { toInternationalCurrencySystemLongString } from '../../utils/numbers';

import { SkyWardModal } from '../layout/SwapDoubleCheck';
import {
  NEAR_CLASS_STABLE_TOKEN_IDS,
  BTC_CLASS_STABLE_TOKEN_IDS,
} from '../../services/near';

import { getMax } from '../../utils/numbers';

import { YellowTipIcon, RedTipIcon, SelectedIcon } from '../icon/swapV3';
import * as math from 'mathjs';
import { NEAR_WITHDRAW_KEY } from '../forms/WrapNear';

const SWAP_IN_KEY = 'REF_FI_SWAP_IN';
const SWAP_OUT_KEY = 'REF_FI_SWAP_OUT';
const SWAP_IN_KEY_SYMBOL = 'REF_FI_SWAP_IN_SYMBOL';
const SWAP_OUT_KEY_SYMBOL = 'REF_FI_SWAP_OUT_SYMBOL';

const SWAP_SLIPPAGE_KEY = 'REF_FI_SLIPPAGE_VALUE';

export const SWAP_USE_NEAR_BALANCE_KEY = 'REF_FI_USE_NEAR_BALANCE_VALUE';
const TOKEN_URL_SEPARATOR = '|';

export const LimitOrderTriggerContext = createContext(null);

export const isSameStableClass = (token1: string, token2: string) => {
  const USDTokenList = USD_CLASS_STABLE_TOKEN_IDS;

  const BTCTokenList = BTC_CLASS_STABLE_TOKEN_IDS;

  const NEARTokenList = NEAR_CLASS_STABLE_TOKEN_IDS;
  return (
    (USDTokenList.includes(token1) && USDTokenList.includes(token2)) ||
    (BTCTokenList.includes(token1) && BTCTokenList.includes(token2)) ||
    (NEARTokenList.includes(token1) && NEARTokenList.includes(token2))
  );
};

export const SUPPORT_LEDGER_KEY = 'REF_FI_SUPPORT_LEDGER';

export const unWrapTokenId = (token: TokenMetadata) => {
  if (token.id === WRAP_NEAR_CONTRACT_ID && token.symbol == 'NEAR') {
    return 'near';
  } else return token.id;
};

export const wrapTokenId = (id: string) => {
  if (id === 'near') {
    return WRAP_NEAR_CONTRACT_ID;
  } else return id;
};

export function SwapDetail({
  title,
  value,
  color,
}: {
  title: string;
  value: string | JSX.Element;
  color?: string;
}) {
  return (
    <section
      className={`flex items-center justify-between pt-1 pb-2 text-xs ${
        color || 'text-primaryText'
      }`}
    >
      <p className="text-left">{title}</p>
      <p className="text-right">{value}</p>
    </section>
  );
}

export function SwapRateDetail({
  title,
  subTitle,
  from,
  to,
  tokenIn,
  tokenOut,
  fee,
}: {
  fee: number;
  title: string;
  from: string;
  to: string;
  subTitle?: string;
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
}) {
  const [isRevert, setIsRevert] = useState<boolean>(false);

  const exchangeRageValue = useMemo(() => {
    const fromNow = isRevert ? from : to;
    const toNow = isRevert ? to : from;
    if (ONLY_ZEROS.test(fromNow)) return '-';

    return calculateExchangeRate(fee, fromNow, toNow);
  }, [isRevert, to]);

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
        <span>
          1 {toRealSymbol(isRevert ? tokenIn.symbol : tokenOut.symbol)}{' '}
          <label className="arial_font">≈</label> {exchangeRageValue}{' '}
          {toRealSymbol(isRevert ? tokenOut.symbol : tokenIn.symbol)}
        </span>
      </p>
    </section>
  );
}

export function SwapRate({
  from,
  to,
  tokenIn,
  tokenOut,
  fee,
  tokenPriceList,
}: {
  fee: number;
  from: string;
  to: string;
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  tokenPriceList?: any;
}) {
  const [isRevert, setIsRevert] = useState<boolean>(false);
  const [hover, setHover] = useState(false);
  const price =
    tokenPriceList?.[isRevert ? tokenIn.id : tokenOut.id]?.price || null;

  const displayPrice = !price ? null : (
    <>(${toInternationalCurrencySystemLongString(price, 2)})</>
  );
  const exchangeRageValue = useMemo(() => {
    const fromNow = isRevert ? from : to;
    const toNow = isRevert ? to : from;
    if (ONLY_ZEROS.test(fromNow)) return '-';
    try {
      const result = math.evaluate(`${toNow} / ${fromNow}`);
      if (new BigNumber(result).isLessThan('0.0001')) {
        return '<0.0001';
      } else {
        return math.floor(result, 4);
      }
    } catch (error) {}
  }, [isRevert, to]);

  function switchSwapRate(e: React.MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
    e.preventDefault();
    setIsRevert(!isRevert);
  }

  return (
    <section className=" py-1 text-xs flex items-center">
      <p
        className="flex items-center text-white cursor-pointer text-right mr-1"
        onClick={switchSwapRate}
        onMouseEnter={() => {
          setHover(true);
        }}
        onMouseLeave={() => {
          setHover(false);
        }}
      >
        <span className={`text-white ${hover ? 'opacity-100' : 'opacity-60'}`}>
          {`1 ${toRealSymbol(isRevert ? tokenIn.symbol : tokenOut.symbol)}`}
          <span className={`mx-1 text-primaryText`}>{displayPrice}</span>
          <label className="arial_font">≈</label> {exchangeRageValue}&nbsp;
          {toRealSymbol(isRevert ? tokenOut.symbol : tokenIn.symbol)}
        </span>
      </p>
    </section>
  );
}

export function SmartRoutesV2Detail({
  swapsTodo,
  tokenIn,
  tokenOut,
}: {
  swapsTodo: EstimateSwapView[];
  tokenIn?: TokenMetadata;
  tokenOut?: TokenMetadata;
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
    <section className="flex justify-between py-1 text-xs items-center rounded-xl xsm:flex-col xsm:items-start">
      <div className="text-primaryText relative lg:top-1 text-left self-start">
        <div className="flex items-center">
          <span className="xsm:hidden">
            <RouterIcon />
          </span>
          <div className="flex items-center">
            <AutoRouterText />
            <QuestionTip
              style={{ maxWidth: '14rem' }}
              id="optimal_path_found_by_our_solution"
            />
          </div>
        </div>
      </div>

      <div className="text-right text-white flex-grow xsm:mt-2.5 xsm:w-full">
        {identicalRoutes.map((route, index) => (
          <div key={index}>
            <NormalSwapRoute
              tokenIn={tokenIn}
              tokenOut={tokenOut}
              route={route}
              p={percents[index]}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export const GetPriceImpact = (
  value: string,
  tokenIn?: TokenMetadata,
  tokenInAmount?: string,
  infoStyle?: string
) => {
  const textColor =
    Number(value) <= 1
      ? 'text-primaryText'
      : 1 < Number(value) && Number(value) <= 2
      ? 'text-warn'
      : 'text-redwarningColor';

  const displayValue = scientificNotationToString(
    multiply(tokenInAmount, divide(value, '100'))
  );

  const tokenInInfo =
    Number(displayValue) <= 0
      ? ` / 0`
      : ` / -${toInternationalCurrencySystemLongString(displayValue, 3)}`;

  if (Number(value) < 0.01)
    return (
      <span className="text-primaryText">
        {`< -0.01%`}
        {tokenInInfo}
      </span>
    );

  if (Number(value) > 1000)
    return (
      <span className="text-redwarningColor">
        {`< -1000%`}
        {tokenInInfo}
      </span>
    );

  return (
    <span className={`${textColor} ${infoStyle}`}>
      {`-${toPrecision(value, 2)}%`}
      {tokenInInfo}
    </span>
  );
};

export const getPriceImpactTipType = (value: string) => {
  const reault =
    1 < Number(value) && Number(value) <= 2 ? (
      <YellowTipIcon></YellowTipIcon>
    ) : Number(value) > 2 && Number(value) != Infinity ? (
      <RedTipIcon></RedTipIcon>
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

export function DetailView_near_wnear({
  tokenIn,
  tokenOut,
  minAmountOut,
  from,
  to,
}: {
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  minAmountOut: string;
  from: string;
  to: string;
}) {
  const intl = useIntl();
  const [showDetails, setShowDetails] = useState<boolean>(false);
  return (
    <div className="my-4">
      <div className="flex justify-center">
        <div
          className="flex items-center text-white cursor-pointer"
          onClick={() => {
            setShowDetails(!showDetails);
          }}
        >
          <p className="block text-xs">
            <FormattedMessage id="details" defaultMessage="Details" />
          </p>
          <div className="pl-1 text-sm">
            {showDetails ? <FaAngleUp /> : <FaAngleDown />}
          </div>
        </div>
      </div>
      <div className={showDetails ? '' : 'hidden'}>
        <SwapDetail
          title={intl.formatMessage({ id: 'minimum_received' })}
          value={<span>{toPrecision((minAmountOut || 0).toString(), 6)}</span>}
        />
        <SwapRateDetail
          title={intl.formatMessage({ id: 'swap_rate' })}
          from={from}
          to={to}
          tokenIn={tokenIn}
          tokenOut={tokenOut}
          fee={0}
        />
        <SwapDetail
          title={intl.formatMessage({ id: 'price_impact' })}
          value={'-'}
        />
        <SwapDetail
          title={intl.formatMessage({ id: 'pool_fee' })}
          value={'-'}
        />
      </div>
    </div>
  );
}
function DetailViewV2({
  pools,
  tokenIn,
  tokenOut,
  from,
  to,
  minAmountOut,
  fee,
  swapsTodo,
  priceImpact,
  showDetails,
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
  tokenInAmount?: string;
  showDetails?: boolean;
}) {
  const intl = useIntl();
  const isMobile = useMobile();
  const minAmountOutValue = useMemo(() => {
    if (!minAmountOut) return '0';
    else return toPrecision(minAmountOut, 8, true);
  }, [minAmountOut]);
  const priceImpactDisplay = useMemo(() => {
    if (!priceImpact || !tokenIn || !from) return null;
    return GetPriceImpact(priceImpact, tokenIn, from);
  }, [to, priceImpact]);

  const priceImpactDisplayFun = useCallback(
    (infoStyle?: string) => {
      if (!priceImpact || !tokenIn || !from) return null;
      return GetPriceImpact(priceImpact, tokenIn, from, infoStyle);
    },
    [[to, priceImpact]]
  );

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
    <div>
      <div
        className={`border border-menuMoreBoxBorderColor rounded-xl px-2.5 py-3 mb-3 ${
          showDetails ? '' : 'hidden'
        }`}
      >
        <div className="">
          <SwapDetail
            title={intl.formatMessage({ id: 'price_impact' })}
            value={
              !to || to === '0' ? (
                '-'
              ) : (
                <>
                  {priceImpactDisplay}
                  <span
                    className="text-primaryText"
                    style={{ marginLeft: '3px' }}
                  >
                    {tokenIn.symbol}
                  </span>
                </>
              )
            }
          />
        </div>
        <SwapDetail
          title={intl.formatMessage({ id: 'pool_fee' })}
          value={poolFeeDisplay}
        />

        <SwapDetail
          title={intl.formatMessage({ id: 'minimum_received' })}
          value={<span>{toPrecision(minAmountOutValue, 6)}</span>}
          color="text-white"
        />

        <SmartRoutesV2Detail
          swapsTodo={swapsTodo}
          tokenIn={tokenIn}
          tokenOut={tokenOut}
        />
      </div>
      {Number(priceImpact) > 2 ? (
        <div className="flex items-center justify-between xsm:flex-col bg-lightReBgColor border border-warnRedColor  mb-4 rounded-xl p-3  text-sm text-redwarningColor">
          <span className="xsm:mb-0.5">
            <FormattedMessage id="price_impact_warning"></FormattedMessage>
          </span>
          <div className="flex items-center">
            <span>
              {!to || to === '0' ? '-' : priceImpactDisplayFun('gotham_bold')}
            </span>
            <span className="ml-1">{tokenIn.symbol}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DetailViewV3({
  tokenIn,
  tokenOut,
  from,
  to,
  minAmountOut,
  fee,
  priceImpact,
  showDetails,
}: {
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  from: string;
  to: string;
  minAmountOut: string;
  fee?: number;
  priceImpact?: string;
  showDetails: boolean;
}) {
  const intl = useIntl();
  const minAmountOutValue = useMemo(() => {
    if (!minAmountOut) return '0';
    else return toPrecision(minAmountOut, 8, true);
  }, [minAmountOut]);
  const priceImpactDisplay = useMemo(() => {
    if (!priceImpact || !tokenIn || !from) return null;
    return GetPriceImpact(priceImpact, tokenIn, from);
  }, [priceImpact]);
  const priceImpactDisplayFun = useCallback(
    (infoStyle?: string) => {
      if (!priceImpact || !tokenIn || !from) return null;
      return GetPriceImpact(priceImpact, tokenIn, from, infoStyle);
    },
    [[priceImpact]]
  );

  const poolFeeDisplay = useMemo(() => {
    if (!fee || !from || !tokenIn) return null;

    return `${toPrecision(
      calculateFeePercent(fee).toString(),
      2
    )}% / ${calculateFeeCharge(fee, from)} ${toRealSymbol(tokenIn.symbol)}`;
  }, [to]);

  if (ONLY_ZEROS.test(from) || !to || tokenIn.id === tokenOut.id) return null;

  return (
    <div>
      <div
        className={`border border-menuMoreBoxBorderColor rounded-xl px-2.5 py-3 mb-3 ${
          showDetails ? '' : 'hidden'
        }`}
      >
        <div className="">
          <SwapDetail
            title={intl.formatMessage({ id: 'price_impact' })}
            value={
              !to || to === '0' ? (
                '-'
              ) : (
                <>
                  {priceImpactDisplay}
                  <span
                    className="text-primaryText"
                    style={{ marginLeft: '3px' }}
                  >
                    {tokenIn.symbol}
                  </span>
                </>
              )
            }
          />
        </div>
        <SwapDetail
          title={intl.formatMessage({ id: 'pool_fee' })}
          value={poolFeeDisplay}
        />

        <SwapDetail
          title={intl.formatMessage({ id: 'minimum_received' })}
          value={<span>{toPrecision(minAmountOutValue, 6)}</span>}
          color="text-white"
        />
        <RouteDCLDetail bestFee={fee} tokenIn={tokenIn} tokenOut={tokenOut} />
      </div>
      {Number(priceImpact) > 2 ? (
        <div className="flex items-center xsm:flex-col justify-between border bg-bg-lightReBgColor border-warnRedColor mb-4  rounded-xl p-3 text-sm text-redwarningColor">
          <span className="mb-0.5">
            <FormattedMessage id="price_impact_warning"></FormattedMessage>
          </span>
          <div className="flex items-center">
            <span>
              {!to || to === '0' ? '-' : priceImpactDisplayFun('gotham_bold')}
            </span>
            <span className="ml-1">{tokenIn.symbol}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function SwapCard(props: {
  allTokens: TokenMetadata[];
  swapMode: SWAP_MODE;
  tokenInAmount: string;
  setTokenInAmount: (value: string) => void;
  swapTab?: JSX.Element;
  globalWhiteListTokens: TokenMetadata[];
  setTokenIn: (value: TokenMetadata) => void;
  tokenIn: TokenMetadata;
  setTokenOut: (value: TokenMetadata) => void;
  tokenOut: TokenMetadata;
}) {
  const { NEARXIDS, STNEARIDS } = getExtraStablePoolConfig();
  const { REF_TOKEN_ID } = getConfig();
  const [poolError, setPoolError] = useState<string>(null);

  const {
    allTokens,
    tokenIn,
    tokenOut,
    setTokenIn,
    setTokenOut,
    swapMode,
    tokenInAmount,
    setTokenInAmount,
    swapTab,
    globalWhiteListTokens,
  } = props;

  const [doubleCheckOpen, setDoubleCheckOpen] = useState<boolean>(false);

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

  const [showSkywardTip, setShowSkywardTip] = useState<boolean>(false);
  const [wrapOperation, setWrapOperation] = useState<boolean>(false);
  const [wrapLoading, setWrapLoading] = useState<boolean>(false);

  const [balanceInDone, setBalanceInDone] = useState<boolean>(false);
  const [balanceOutDone, setBalanceOutDone] = useState<boolean>(false);

  const intl = useIntl();
  const location = useLocation();
  const history = useHistory();

  const [displayTokenOutAmount, setDisplayTokenOutAmount] =
    useState<string>('');

  const [displayPriceImpact, setDisplayPriceImpact] = useState<string>('');

  const [displayDetailView, setDisplayDetailView] = useState<JSX.Element>();

  const [urlTokenIn, urlTokenOut, urlSlippageTolerance] = decodeURIComponent(
    location.hash.slice(1)
  ).split(TOKEN_URL_SEPARATOR);

  const nearBalance = useDepositableBalance('NEAR');

  const [slippageToleranceNormal, setSlippageToleranceNormal] =
    useState<number>(
      Number(localStorage.getItem(SWAP_SLIPPAGE_KEY) || urlSlippageTolerance) ||
        0.5
    );

  const [showDetails, setShowDetails] = useState<boolean>(false);

  const tokenPriceList = useTokenPriceList();

  const skywardId =
    getConfig().networkId === 'mainnet'
      ? 'token.skyward.near'
      : 'skyward.fakes.testnet';

  useEffect(() => {
    if (!tokenIn || !tokenOut) return;

    history.replace(
      `#${unWrapTokenId(tokenIn)}${TOKEN_URL_SEPARATOR}${unWrapTokenId(
        tokenOut
      )}`
    );

    localStorage.setItem(SWAP_IN_KEY, tokenIn.id);
    localStorage.setItem(SWAP_OUT_KEY, tokenOut.id);
    localStorage.setItem(SWAP_IN_KEY_SYMBOL, tokenIn.symbol);
    localStorage.setItem(SWAP_OUT_KEY_SYMBOL, tokenOut.symbol);
  }, [tokenIn?.id, tokenOut?.id, tokenIn?.symbol, tokenOut?.symbol]);

  useEffect(() => {
    if (allTokens) {
      const [in_id, out_id] = getStorageTokenId();
      let urlTokenInId = allTokens.find((t) => t.id && t.id === urlTokenIn)?.id;

      let urlTokenOutId = allTokens.find(
        (t) => t.id && t.id === urlTokenOut
      )?.id;

      if (!urlTokenInId) {
        urlTokenInId = globalWhiteListTokens.find(
          (t) => t.symbol && t.symbol === urlTokenIn
        )?.id;
      }

      if (!urlTokenOutId) {
        urlTokenOutId = globalWhiteListTokens.find(
          (t) => t.symbol && t.symbol === urlTokenOut
        )?.id;
      }
      let rememberedIn = wrapTokenId(urlTokenInId) || in_id;
      let rememberedOut = wrapTokenId(urlTokenOutId) || out_id;

      if (rememberedIn == NEARXIDS[0]) {
        rememberedIn = REF_TOKEN_ID;
      }
      if (rememberedOut == NEARXIDS[0]) {
        rememberedOut = REF_TOKEN_ID;
      }
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
          allTokens.find((token) => {
            return token.id === rememberedIn;
          }) || unwrapedNear;
      }
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
          allTokens.find((token) => {
            return token.id === rememberedOut;
          }) || REF_META_DATA;
      }
      if (candTokenIn.id === skywardId || candTokenOut.id === skywardId) {
        setShowSkywardTip(true);
      }

      setTokenIn(candTokenIn);
      setTokenOut(candTokenOut);

      if (tokenOut?.id === candTokenOut?.id && tokenIn?.id === candTokenIn?.id)
        setReEstimateTrigger(!reEstimateTrigger);
    }
  }, [
    allTokens?.map((t) => t.id).join('-'),
    swapMode,
    urlTokenIn,
    urlTokenOut,
  ]);

  useEffect(() => {
    if (tokenIn) {
      const tokenInId = tokenIn.id;
      if (tokenInId) {
        if (isSignedIn) {
          setBalanceInDone(false);
          ftGetBalance(
            tokenIn.id === WRAP_NEAR_CONTRACT_ID && tokenIn.symbol == 'NEAR'
              ? 'NEAR'
              : tokenIn.id
          )
            .then((available: string) =>
              setTokenInBalanceFromNear(
                toReadableNumber(tokenIn?.decimals, available)
              )
            )
            .finally(() => {
              setBalanceInDone(true);
            });
        }
      }
    }
    if (tokenOut) {
      const tokenOutId = tokenOut.id;
      if (tokenOutId) {
        if (isSignedIn) {
          setBalanceOutDone(false);
          ftGetBalance(
            tokenOut.id === WRAP_NEAR_CONTRACT_ID && tokenOut.symbol == 'NEAR'
              ? 'NEAR'
              : tokenOut.id
          )
            .then((available: string) =>
              setTokenOutBalanceFromNear(
                toReadableNumber(tokenOut?.decimals, available)
              )
            )
            .finally(() => {
              setBalanceOutDone(true);
            });
        }
      }
    }
    if (
      tokenIn &&
      tokenOut &&
      ((tokenIn.symbol == 'NEAR' && tokenOut.symbol == 'wNEAR') ||
        (tokenIn.symbol == 'wNEAR' && tokenOut.symbol == 'NEAR'))
    ) {
      setWrapOperation(true);
    } else {
      setWrapOperation(false);
    }
  }, [tokenIn, tokenOut, useNearBalance, isSignedIn, nearBalance]);
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
  const getSlippageTolerance = (swapMode: SWAP_MODE) => {
    switch (swapMode) {
      case SWAP_MODE.NORMAL:
        return {
          slippageValue: slippageToleranceNormal,
          setSlippageValue: setSlippageToleranceNormal,
          slippageKey: SWAP_SLIPPAGE_KEY,
        };

      default:
        return {
          slippageValue: slippageToleranceNormal,
          setSlippageValue: setSlippageToleranceNormal,
          slippageKey: SWAP_SLIPPAGE_KEY,
        };
    }
  };

  const onChangeSlippage = (slippage: number) => {
    const { slippageValue, setSlippageValue, slippageKey } =
      getSlippageTolerance(swapMode);

    setSlippageValue(slippage);

    localStorage.setItem(slippageKey, slippage.toString());
  };

  const slippageTolerance = getSlippageTolerance(swapMode).slippageValue;

  useSwapPopUp();

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
    quoteDone,
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

  const {
    makeSwap: makeSwapV3,
    tokenOutAmount: tokenOutAmountV3,
    minAmountOut: minAmountOutV3,
    bestFee,
    priceImpact: priceImpactV3,
    quoteDone: quoteDoneV3,
    canSwap: canSwapV3,
    swapErrorV3,
  } = useSwapV3({
    tokenIn,
    tokenOut,
    tokenInAmount,
    slippageTolerance,
    swapMode,
    loadingTrigger,
    swapError,
    setLoadingTrigger,
  });

  const bestSwap =
    new Big(tokenOutAmountV3 || '0').gte(tokenOutAmount || '0') && canSwapV3
      ? 'v3'
      : 'v2';

  useEffect(() => {
    if (quoteDone && quoteDoneV3) {
      if (poolError) {
        setDisplayTokenOutAmount('');
        return;
      }

      const displayTokenOutAmount =
        swapMode === SWAP_MODE.NORMAL &&
        new Big(tokenOutAmountV3 || '0').gte(tokenOutAmount || '0') &&
        canSwapV3
          ? tokenOutAmountV3
          : tokenOutAmount;

      setDisplayTokenOutAmount(toPrecision(displayTokenOutAmount, 8));
    }
  }, [
    quoteDone,
    quoteDoneV3,
    tokenOutAmountV3,
    tokenOutAmount,
    poolError,
    swapMode,
  ]);
  useEffect(() => {
    if (swapMode == 'normal') {
      setLoadingTrigger(true);
    }
  }, [swapMode]);
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
  function wrapButtonCheck() {
    if (!wrapOperation) return false;
    if (
      !(
        +tokenInAmount > 0 &&
        new BigNumber(tokenInAmount).isLessThanOrEqualTo(tokenInMax)
      )
    )
      return false;
    if (tokenIn?.symbol == 'NEAR') {
      if (
        !new BigNumber(tokenInAmount).plus(0.5).isLessThanOrEqualTo(tokenInMax)
      )
        return false;
    }
    return true;
  }

  useEffect(() => {
    if (quoteDone && quoteDoneV3) {
      const bestSwapPriceImpact =
        bestSwap === 'v3' && canSwapV3 ? priceImpactV3 : PriceImpactValue;

      setDisplayPriceImpact(bestSwapPriceImpact);
    }
  }, [
    priceImpactV3,
    PriceImpactValue,
    quoteDone,
    quoteDoneV3,
    bestSwap,
    canSwapV3,
  ]);

  const makeBestSwap = () => {
    if (bestSwap === 'v3') {
      makeSwapV3();
    } else {
      makeSwap(useNearBalance);
    }
  };

  const DetailView = useMemo(() => {
    if (!quoteDone || !quoteDoneV3) return null;

    return (
      <>
        <div className="mt-3 mb-3">
          <div className="flex flex-wrap items-center justify-between text-white ">
            <div className="flex items-center mb-1">
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
              <SwapRate
                from={tokenInAmount}
                to={bestSwap === 'v2' ? tokenOutAmount : tokenOutAmountV3}
                tokenIn={tokenIn}
                tokenOut={tokenOut}
                fee={bestSwap === 'v2' ? avgFee : bestFee / 100}
                tokenPriceList={tokenPriceList}
              />
            </div>

            <div
              className="text-sm flex items-center cursor-pointer mb-1"
              onClick={() => {
                setShowDetails(!showDetails);
              }}
            >
              {getPriceImpactTipType(displayPriceImpact)}
              <span className="text-xs text-primaryText mx-1.5">
                <FormattedMessage id="details" />
              </span>
              <span>
                {showDetails ? (
                  <FaAngleUp color="#ffffff" size={16} />
                ) : (
                  <FaAngleDown color="#7E8A93" size={16} />
                )}
              </span>
            </div>
          </div>
        </div>
        {bestSwap === 'v2' ? (
          <DetailViewV2
            pools={pools}
            tokenIn={tokenIn}
            tokenOut={tokenOut}
            from={tokenInAmount}
            to={tokenOutAmount}
            minAmountOut={minAmountOut}
            isParallelSwap={isParallelSwap}
            fee={avgFee}
            swapsTodo={swapsToDo}
            priceImpact={displayPriceImpact}
            showDetails={showDetails}
          />
        ) : (
          <DetailViewV3
            tokenIn={tokenIn}
            tokenOut={tokenOut}
            from={tokenInAmount}
            to={tokenOutAmountV3}
            minAmountOut={minAmountOutV3}
            fee={bestFee / 100}
            priceImpact={displayPriceImpact}
            showDetails={showDetails}
          />
        )}
      </>
    );
  }, [
    displayTokenOutAmount,
    swapMode,
    tokenIn,
    tokenOut,
    slippageTolerance,
    minAmountOut,
    minAmountOutV3,
    swapsToDo,
    displayPriceImpact,
    bestFee,
    avgFee,
    tokenOutAmount,
    tokenOutAmountV3,
    tokenPriceList,
    loadingTrigger,
    loadingPause,
    showDetails,
    quoteDone,
    quoteDoneV3,
  ]);

  useEffect(() => {
    if (quoteDone && quoteDoneV3) {
      setDisplayDetailView(DetailView);
    }
  }, [quoteDone, quoteDoneV3, DetailView]);

  const tokenInMax = tokenInBalanceFromNear || '0';

  const tokenOutTotal = tokenOutBalanceFromNear || '0';

  function satisfyCondition1() {
    return quoteDone && quoteDoneV3 && (canSwap || canSwapV3);
  }
  function satisfyCondition2() {
    return (
      new Big(tokenInAmount || '0').gt('0') &&
      new Big(tokenInMax || '0').gt('0') &&
      new Big(tokenInAmount || '0').lte(tokenInMax || '0')
    );
  }

  function satisfyShowDetailViewCondition() {
    const hideCondition1 = swapMode == SWAP_MODE.LIMIT;
    // const hideCondition2 = swapMode !== SWAP_MODE.LIMIT && !(canSwap || canSwapV3);
    const hideCondition2 = swapMode !== SWAP_MODE.LIMIT && poolError;
    const hideCondition3 = wrapOperation;
    const hideCondition4 = new Big(tokenInAmount || '0').lte('0');
    const hideCondition5 = tokenIn?.id == tokenOut?.id;
    const hideConditionFinall =
      hideCondition1 ||
      hideCondition2 ||
      hideCondition3 ||
      hideCondition4 ||
      hideCondition5;
    return !hideConditionFinall;
  }

  const canSubmit = satisfyCondition1() && satisfyCondition2();

  const canWrap = wrapButtonCheck();

  const canShowDetailView = satisfyShowDetailViewCondition();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const ifDoubleCheck =
      new BigNumber(tokenInAmount || 0).isLessThanOrEqualTo(
        new BigNumber(tokenInMax || 0)
      ) && Number(displayPriceImpact) > 2;

    if (ifDoubleCheck) setDoubleCheckOpen(true);
    else makeBestSwap();
  };
  const handleSubmit_wrap = (e: any) => {
    e.preventDefault();

    sessionStorage.setItem(NEAR_WITHDRAW_KEY, '1');

    if (tokenIn?.symbol === 'NEAR') {
      setWrapLoading(true);
      return nearDeposit(tokenInAmount);
    } else {
      setWrapLoading(true);
      return nearWithdraw(tokenInAmount);
    }
  };

  function judgeBalance() {
    const condition1 = tokenIn && balanceInDone && balanceOutDone;
    return (
      condition1 &&
      (Number(getMax(tokenIn.id, tokenInMax || '0', tokenIn)) -
        Number(tokenInAmount || '0') <
        0 ||
        ONLY_ZEROS.test(tokenInMax))
    );
  }
  const isInsufficientBalance = judgeBalance();
  useEffect(() => {
    if (!quoteDone || !quoteDoneV3) {
      return;
    }
    if (swapError && swapErrorV3) {
      setPoolError(
        swapError?.message ? swapError?.message : swapErrorV3?.message
      );
    } else {
      setPoolError(null);
    }
  }, [quoteDone, quoteDoneV3, swapError, swapErrorV3]);
  return (
    <>
      <SwapFormWrap
        supportLedger={supportLedger}
        setSupportLedger={setSupportLedger}
        useNearBalance={useNearBalance.toString()}
        canSubmit={canSubmit}
        swapTab={swapTab}
        slippageTolerance={slippageTolerance}
        onChange={onChangeSlippage}
        showElseView={wrapOperation}
        elseView={
          <div className="flex justify-center">
            {isSignedIn ? (
              !isInsufficientBalance ? (
                <SubmitButton
                  onClick={handleSubmit_wrap}
                  disabled={!canWrap || wrapLoading}
                  loading={wrapLoading}
                />
              ) : (
                <InsufficientButton divClassName="h-12 mt-6 w-full"></InsufficientButton>
              )
            ) : (
              <div className="mt-4 w-full">
                <ConnectToNearBtnSwap />
              </div>
            )}
          </div>
        }
        swapMode={swapMode}
        onSubmit={handleSubmit}
        info={intl.formatMessage({ id: 'swapCopy' })}
        title={swapMode === SWAP_MODE.LIMIT ? 'create_order' : 'swap'}
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
        isInsufficient={isInsufficientBalance}
      >
        <TokenAmountV3
          forSwap
          swapMode={swapMode}
          amount={tokenInAmount}
          total={tokenInMax}
          max={tokenInMax}
          tokens={allTokens}
          tokenIn={tokenIn}
          tokenOut={tokenOut}
          selectedToken={tokenIn}
          onSelectToken={(token) => {
            localStorage.setItem(SWAP_IN_KEY, token.id);
            setTokenIn(token);
            setCanSwap(false);

            if (token.id === skywardId) {
              setShowSkywardTip(true);
            }
          }}
          text={
            swapMode === SWAP_MODE.LIMIT
              ? intl.formatMessage({ id: 'sell' })
              : ''
          }
          useNearBalance={useNearBalance}
          onChangeAmount={(v) => {
            setTokenInAmount(v);
          }}
          tokenPriceList={tokenPriceList}
          isError={tokenIn?.id === tokenOut?.id}
          postSelected={tokenOut}
          onSelectPost={(token) => {
            setTokenOut(token);
          }}
          allowWNEAR={swapMode === SWAP_MODE.LIMIT ? false : true}
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
            tokenIn.symbol === 'NEAR' && (
              <Alert
                level="warn"
                message={`${intl.formatMessage({
                  id: 'near_validation_error',
                })} `}
                extraClass="px-0 pb-3"
              />
            )
          }
        />
        <div className={`flex items-center -my-2.5 justify-center`}>
          <SwapExchangeV1
            onChange={() => {
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
          forSwap
          isOut
          swapMode={swapMode}
          amount={wrapOperation ? tokenInAmount : displayTokenOutAmount}
          total={tokenOutTotal}
          tokens={allTokens}
          selectedToken={tokenOut}
          preSelected={tokenIn}
          onSelectPre={(token: TokenMetadata) => setTokenIn(token)}
          tokenIn={tokenIn}
          tokenOut={tokenOut}
          useNearBalance={useNearBalance}
          onSelectToken={(token) => {
            localStorage.setItem(SWAP_OUT_KEY, token.id);
            setTokenOut(token);
            setCanSwap(false);
            if (token.id === skywardId) {
              setShowSkywardTip(true);
            }
          }}
          isError={tokenIn?.id === tokenOut?.id}
          tokenPriceList={tokenPriceList}
          allowWNEAR={swapMode === SWAP_MODE.LIMIT ? false : true}
        />

        {canShowDetailView ? (
          <div className="mt-4">{displayDetailView}</div>
        ) : (
          <div className="mt-4"></div>
        )}

        {wrapOperation ? (
          <DetailView_near_wnear
            tokenIn={tokenIn}
            tokenOut={tokenOut}
            minAmountOut={tokenInAmount}
            from={tokenInAmount}
            to={tokenInAmount}
          />
        ) : null}

        {poolError && !wrapOperation && Number(tokenInAmount || '0') > 0 ? (
          <div className="pb-2 relative ">
            <Alert level="warn" message={poolError} />
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
        onSwap={() => makeBestSwap()}
        priceImpactValue={displayPriceImpact || '0'}
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
