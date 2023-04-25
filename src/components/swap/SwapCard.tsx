import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useContext,
  createContext,
} from 'react';

import { useWalletSelector } from '~context/WalletSelectorContext';

import { useLocation, useHistory } from 'react-router-dom';
import {
  ftGetBalance,
  TokenMetadata,
  REF_META_DATA,
} from '../../services/ft-contract';
import { useDepositableBalance, useTokenPriceList } from '../../state/token';
import {
  useSwapPopUp,
  useRefSwapPro,
  useCrossSwapPopUp,
} from '../../state/swap';
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

import BigNumber from 'bignumber.js';
import {
  AutoRouterText,
  RouterIcon,
  SwapRoute,
  SwapRouteMoreThan2,
  TradeRouteModal,
} from '../layout/SwapRoutes';

import { QuestionTip } from '../layout/TipWrapper';
import { SwapExchange } from '../icon/Arrows';
import { getPoolAllocationPercents } from '../../utils/numbers';
import { DoubleCheckModal } from '../layout/SwapDoubleCheck';
import {
  ExchangeEstimate,
  SWAP_MODE,
  SWAP_TYPE,
  SwapProContext,
} from '../../pages/SwapPage';
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
import { CountdownTimer } from '~components/icon';
import { TextWrapper } from '~pages/Orderly/components/UserBoard';
import { SwapMarket } from '../../pages/SwapPage';
import { REF_FI_SWAP_SIGNAL } from '~services/swap';
import { numberWithCommas } from '~pages/Orderly/utiles';
import { isMobile } from '~utils/device';

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
        return numberWithCommas(math.floor(result, 4).toString());
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

export function AutoRouter({ trade }: { trade: ExchangeEstimate }) {
  const { estimates, tokenIn, tokenOut, market } = trade;

  const { swapType } = useContext(SwapProContext);

  if (!estimates) return null;

  const identicalRoutes = separateRoutes(
    estimates,
    estimates[estimates.length - 1].outputToken
  );

  const pools = identicalRoutes.map((r) => r[0]).map((hub) => hub.pool);

  const percents = useMemo(() => {
    try {
      return getPoolAllocationPercents(pools);
    } catch (error) {
      if (identicalRoutes.length === 0) return ['100'];
      else return identicalRoutes.map((r) => r[0].percent);
    }
  }, [identicalRoutes, pools]);

  const [showRouteDetail, setShowRouteDetail] = useState<boolean>(false);

  return (
    <section className="frcb py-1 w-full text-xs  rounded-xl ">
      {swapType === SWAP_TYPE.LITE ? (
        <div className="text-primaryText  relative  text-left self-start">
          <div className="frcs">
            <span className="xsm:hidden">
              <RouterIcon />
            </span>
            <div className="frcs">
              <AutoRouterText />
              <QuestionTip
                style={{ maxWidth: '14rem' }}
                id="optimal_path_found_by_our_solution"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-xs text-primaryText self-start">
          <FormattedMessage
            id="your_trade_route"
            defaultMessage={'Your trade route'}
          ></FormattedMessage>
        </div>
      )}

      <div
        className=" text-white cursor-pointer "
        onClick={() => {
          if (isMobile()) {
            if (swapType === SWAP_TYPE.LITE) {
              setShowRouteDetail(true);
            } else {
              document
                .querySelector('#swap_pro_trade_route')
                .scrollIntoView(true);
            }
          } else {
            setShowRouteDetail(true);
          }
        }}
      >
        {trade.estimates.length > 2 ? (
          <SwapRouteMoreThan2 trade={trade} market={market} />
        ) : (
          identicalRoutes.map((route, index) => (
            <SwapRoute
              tokenIn={tokenIn}
              tokenOut={tokenOut}
              route={route}
              p={percents[index]}
              market={market}
              key={index}
            />
          ))
        )}
      </div>
      <TradeRouteModal
        trade={trade}
        isOpen={showRouteDetail}
        onRequestClose={() => {
          setShowRouteDetail(false);
        }}
      />
    </section>
  );
}

export const GetPriceImpact = (
  value: string,
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
function DetailView({
  trade,
  show,
  tokenIn,
  tokenOut,
}: {
  trade: ExchangeEstimate;
  show: boolean;
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
}) {
  const intl = useIntl();
  const minAmountOutValue = useMemo(() => {
    try {
      return toPrecision(trade.minAmountOut, 8, true);
    } catch (error) {
      return '0';
    }
  }, [trade]);
  const priceImpactDisplay = useMemo(() => {
    try {
      return GetPriceImpact(trade.priceImpact, trade.tokenInAmount);
    } catch (error) {
      return null;
    }
  }, [trade]);

  const priceImpactDisplayFun = useCallback(
    (infoStyle?: string) => {
      try {
        return GetPriceImpact(
          trade.priceImpact,
          trade.tokenInAmount,
          infoStyle
        );
      } catch (error) {
        return null;
      }
    },
    [trade]
  );

  const poolFeeDisplay = useMemo(() => {
    try {
      return `${toPrecision(
        calculateFeePercent(trade.fee).toString(),
        2
      )}% / ${calculateFeeCharge(
        trade.fee,
        trade.tokenInAmount
      )} ${toRealSymbol(trade.tokenIn.symbol)}`;
    } catch (error) {
      return null;
    }
  }, [trade]);

  if (!trade) return null;

  if (trade.market === 'orderly') {
    return (
      <>
        <div className=" border-menuMoreBoxBorderColor rounded-xl px-2.5 py-3 mb-3  frcb">
          <span className="text-primaryText text-xs">
            {intl.formatMessage({
              id: 'Fees',
              defaultMessage: 'Fees',
            })}
          </span>

          <div className="frcs">
            <span className="flex items-center mr-1.5">
              <span className=" mr-2 text-xs text-white">
                {Number((trade.taker_fee || 0) / 100).toFixed(2)}%
              </span>
              <TextWrapper
                textC="text-primaryText "
                className="text-xs py-0 px-1"
                value={intl.formatMessage({
                  id: 'Taker',
                  defaultMessage: 'Taker',
                })}
              />
            </span>

            <span className="flex items-center">
              <span className=" text-xs mr-2 text-white">
                {Number((trade?.maker_fee || 0) / 100).toFixed(2)}%
              </span>
              <TextWrapper
                textC="text-primaryText"
                value={intl.formatMessage({
                  id: 'Maker',
                  defaultMessage: 'Maker',
                })}
                className="text-xs py-0 px-1"
              />
            </span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div
        className={`${
          !show ? 'hidden' : ''
        } border border-menuMoreBoxBorderColor rounded-xl px-2.5 py-3 mb-3 `}
      >
        <SwapDetail
          title={intl.formatMessage({ id: 'price_impact' })}
          value={
            !trade.tokenOutAmount || trade.tokenOutAmount === '0' ? (
              '-'
            ) : (
              <>
                {priceImpactDisplay}
                <span
                  className="text-primaryText"
                  style={{ marginLeft: '3px' }}
                >
                  {trade.tokenIn.symbol}
                </span>
              </>
            )
          }
        />
        <SwapDetail
          title={intl.formatMessage({ id: 'pool_fee' })}
          value={poolFeeDisplay}
        />

        <SwapDetail
          title={intl.formatMessage({ id: 'minimum_received' })}
          value={<span>{toPrecision(minAmountOutValue, 6)}</span>}
          color="text-white"
        />

        <AutoRouter trade={trade} />
      </div>
      {Number(trade.priceImpact) > 2 &&
      !trade?.swapError &&
      tokenIn?.id !== tokenOut?.id ? (
        <div className="flex items-center justify-between xsm:flex-col bg-lightReBgColor border border-warnRedColor  mb-4 rounded-xl p-3  text-sm text-redwarningColor">
          <span className="xsm:mb-0.5">
            <FormattedMessage id="price_impact_warning"></FormattedMessage>
          </span>
          <div className="flex items-center">
            <span>{priceImpactDisplayFun('gotham_bold')}</span>
            <span className="ml-1">{trade.tokenIn.symbol}</span>
          </div>
        </div>
      ) : null}
    </>
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

  const [useNearBalance] = useState<boolean>(true);

  const { accountId } = useWalletSelector();

  const isSignedIn = !!accountId;

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

  const { selectMarket, trades, enableTri } = useContext(SwapProContext);

  const selectTrade = trades?.[selectMarket];

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
  const getSlippageTolerance = () => {
    return {
      slippageValue: slippageToleranceNormal,
      setSlippageValue: setSlippageToleranceNormal,
      slippageKey: SWAP_SLIPPAGE_KEY,
    };
  };

  const [quoting, setQuoting] = useState<boolean>(true);

  const onChangeSlippage = (slippage: number) => {
    const { setSlippageValue, slippageKey } = getSlippageTolerance();
    setSlippageValue(slippage);
    localStorage.setItem(slippageKey, slippage.toString());
  };

  const slippageTolerance = getSlippageTolerance().slippageValue;

  useSwapPopUp();

  useCrossSwapPopUp();

  useRefSwapPro({
    tokenIn,
    tokenInAmount,
    tokenOut,
    slippageTolerance,
    setLoadingData,
    loadingTrigger,
    setLoadingTrigger,
    loadingPause,
    reEstimateTrigger,
    supportLedger,
    loadingData,
    wrapOperation,
    setQuoting,
    setReEstimateTrigger,
    quoting,
  });

  useEffect(() => {
    if (swapMode == 'normal') {
      setLoadingTrigger(true);
    }
  }, [swapMode]);

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

  const tokenInMax = tokenInBalanceFromNear || '0';

  const tokenOutTotal = tokenOutBalanceFromNear || '0';

  function satisfyCondition1() {
    return (
      selectTrade &&
      selectTrade.quoteDone &&
      selectTrade.canSwap &&
      !loadingTrigger &&
      !quoting
    );
  }
  function satisfyCondition2() {
    return (
      new Big(tokenInAmount || '0').gt('0') &&
      new Big(tokenInMax || '0').gt('0') &&
      new Big(tokenInAmount || '0').lte(tokenInMax || '0')
    );
  }

  function satisfyCondition3() {
    return (
      selectTrade &&
      !selectTrade.swapError &&
      tokenIn &&
      tokenOut &&
      tokenIn.id !== tokenOut.id
    );
  }

  function satisfyShowDetailViewCondition() {
    const hideCondition2 =
      !selectTrade || selectTrade?.swapError || !selectTrade.availableRoute;
    const hideCondition3 = wrapOperation;
    const hideCondition4 = new Big(tokenInAmount || '0').lte('0');
    const hideCondition5 = tokenIn?.id == tokenOut?.id;
    const hideConditionFinal =
      hideCondition2 || hideCondition3 || hideCondition4 || hideCondition5;

    return !hideConditionFinal;
  }

  const canSubmit =
    selectMarket === 'orderly' ||
    (satisfyCondition1() && satisfyCondition2() && satisfyCondition3());

  const canWrap = wrapButtonCheck();

  const canShowDetailView = satisfyShowDetailViewCondition();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const ifDoubleCheck =
      new BigNumber(tokenInAmount || 0).isLessThanOrEqualTo(
        new BigNumber(tokenInMax || 0)
      ) && Number(selectTrade?.priceImpact || 0) > 2;

    if (ifDoubleCheck) setDoubleCheckOpen(true);
    else selectTrade && selectTrade.makeSwap();
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
        setReEstimateTrigger={setReEstimateTrigger}
        elseView={
          <div className="frsc">
            {isSignedIn ? (
              !isInsufficientBalance ? (
                <SubmitButton
                  onClick={handleSubmit_wrap}
                  disabled={!canWrap || wrapLoading}
                  loading={wrapLoading}
                />
              ) : (
                <InsufficientButton divClassName="h-12 mt-2 w-full"></InsufficientButton>
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
        isInsufficient={isInsufficientBalance && selectMarket !== 'orderly'}
      >
        <TokenAmountV3
          forSwap
          forCross={enableTri}
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

            if (token.id === skywardId) {
              setShowSkywardTip(true);
            }
          }}
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
          allowWNEAR={true}
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
        <SwapExchange
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

        <TokenAmountV3
          forSwap
          isOut
          swapMode={swapMode}
          amount={
            wrapOperation
              ? tokenInAmount
              : tokenIn?.id === tokenOut?.id
              ? ''
              : selectTrade?.tokenOutAmount || ''
          }
          forCross={enableTri}
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
            if (token.id === skywardId) {
              setShowSkywardTip(true);
            }
          }}
          isError={tokenIn?.id === tokenOut?.id}
          tokenPriceList={tokenPriceList}
          allowWNEAR={true}
        />
        {canShowDetailView && (
          <div className="frcb text-white mt-4">
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
                to={selectTrade?.tokenOutAmount || ''}
                tokenIn={tokenIn}
                tokenOut={tokenOut}
                fee={selectTrade?.fee || 0}
                tokenPriceList={tokenPriceList}
              />
            </div>

            {selectMarket !== 'orderly' && (
              <div
                className="text-sm flex items-center cursor-pointer mb-1"
                onClick={() => {
                  setShowDetails(!showDetails);
                }}
              >
                {getPriceImpactTipType(selectTrade.priceImpact)}
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
            )}
          </div>
        )}

        <div className="mt-4">
          <DetailView
            show={canShowDetailView && showDetails}
            trade={selectTrade}
            tokenIn={tokenIn}
            tokenOut={tokenOut}
          />
        </div>

        {wrapOperation ? (
          <DetailView_near_wnear
            tokenIn={tokenIn}
            tokenOut={tokenOut}
            minAmountOut={tokenInAmount}
            from={tokenInAmount}
            to={tokenInAmount}
          />
        ) : null}

        {selectTrade?.swapError &&
        !wrapOperation &&
        Number(tokenInAmount || '0') > 0 &&
        tokenIn?.id !== tokenOut?.id ? (
          <div className="pb-2 relative ">
            <Alert level="warn" message={selectTrade?.swapError.message} />
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
        onSwap={() => selectTrade && selectTrade.makeSwap()}
        priceImpactValue={selectTrade?.priceImpact || '0'}
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
