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
import { SwapExchangeV3 } from '../../components/icon';
import {
  ftGetBalance,
  TokenMetadata,
  REF_META_DATA,
} from '../../services/ft-contract';
import { useDepositableBalance, useTokenPriceList } from '../../state/token';
import {
  useSwap,
  useSwapV3,
  useLimitOrder,
  useSwapPopUp,
} from '../../state/swap';
import {
  calculateExchangeRate,
  calculateFeeCharge,
  calculateFeePercent,
  toPrecision,
  toReadableNumber,
  ONLY_ZEROS,
  scientificNotationToString,
} from '../../utils/numbers';

import { InsufficientButton } from '../forms/SubmitButton';
import Alert from '../alert/Alert';
import { FormattedMessage, useIntl } from 'react-intl';
import { ConnectToNearBtnSwap } from '../button/Button';

import SwapFormWrap from '../forms/SwapFormWrap';

import {
  isMobile,
  useClientMobile,
  useMobile,
  isClientMobie,
} from '../../utils/device';
import BigNumber from 'bignumber.js';

import { toNonDivisibleNumber } from '../../utils/numbers';

import { SWAP_MODE, SWAP_MODE_KEY } from '../../pages/SwapPage';
import { USD_CLASS_STABLE_TOKEN_IDS } from '../../services/near';
import { WRAP_NEAR_CONTRACT_ID, unwrapedNear } from '../../services/wrap-near';
import getConfig, { getExtraStablePoolConfig } from '../../services/config';
import {
  TokenAmountV3,
  TokenCardIn,
  LimitOrderRateSetBox,
} from '../forms/TokenAmount';
import Big from 'big.js';
import { Slider } from '../icon/Info';
import {
  regularizedPoint,
  regularizedPrice,
  feeToPointDelta,
} from '../../services/swapV3';
import { DoubleCheckModalLimit } from '../layout/SwapDoubleCheck';
import {
  toInternationalCurrencySystemLongString,
  toRoundedReadableNumber,
  toInternationalCurrencySystem,
} from '../../utils/numbers';
import {
  pointToPrice,
  priceToPoint,
  v3Swap,
  create_pool,
} from '../../services/swapV3';
import {
  V3_POOL_FEE_LIST,
  getV3PoolId,
  V3_POOL_SPLITER,
} from '../../services/swapV3';
import { SkyWardModal } from '../layout/SwapDoubleCheck';

import { MdOutlineRefresh } from '../reactIcons';
import { getMax } from '../../utils/numbers';

import { SelectedIcon } from '../icon/swapV3';

import { PoolInfo, get_pool_from_cache } from '../../services/swapV3';
import { nearMetadata } from '../../services/wrap-near';
import { useWalletSelector } from '../../context/WalletSelectorContext';
import { InfoIcon } from 'src/components/icon/Common';
import {
  constTransactionPage,
  useTranstionsExcuteDataStore,
} from 'src/stores/transtionsExcuteData';
import getConfigV2 from '../../services/configV2';
const configV2 = getConfigV2();

const SWAP_IN_KEY = 'REF_FI_SWAP_IN';
const SWAP_OUT_KEY = 'REF_FI_SWAP_OUT';
const SWAP_IN_KEY_SYMBOL = 'REF_FI_SWAP_IN_SYMBOL';
const SWAP_OUT_KEY_SYMBOL = 'REF_FI_SWAP_OUT_SYMBOL';

const SWAP_SLIPPAGE_KEY_LIMIT = 'REF_FI_SLIPPAGE_VALUE_LIMIT';

export const SWAP_USE_NEAR_BALANCE_KEY = 'REF_FI_USE_NEAR_BALANCE_VALUE';
const TOKEN_URL_SEPARATOR = '|';

export const LimitOrderTriggerContext = createContext(null);

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

function DetailViewLimit({
  setV3Pool,
  v3Pool,
  poolPercents,
  tokenIn,
  tokenOut,
  tokenPriceList,
  setFeeTiersShowFull,
  feeTiersShowFull,
  everyPoolTvl,
}: {
  v3Pool: string;
  setV3Pool: (p: string) => void;
  poolPercents: {
    [key: string]: string;
  };
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  tokenPriceList: Record<string, any>;
  setFeeTiersShowFull: (v: boolean) => void;
  feeTiersShowFull: boolean;
  everyPoolTvl: {
    [key: string]: string;
  };
}) {
  const isMobile = useClientMobile();
  const [hoverSlider, setHoverSlider] = useState(false);
  const [mobileShowFees, setMobileShowFees] = useState(false);

  function SelectPercent({ fee, poolId }: { fee?: number; poolId?: string }) {
    const id = poolId ? poolId : getV3PoolId(tokenIn.id, tokenOut.id, fee);
    const count = poolPercents?.[id];
    return (
      <span
        className="py-1 xs:py-0 xs:px-0.5 px-2.5 text-v3SwapGray bg-black bg-opacity-20 text-xs inline-flex items-center rounded-xl whitespace-nowrap"
        style={{
          fontSize: isClientMobie() ? '11px' : '',
        }}
      >
        <span className="mr-1">
          {!tokenPriceList
            ? '-'
            : !count
            ? '-'
            : `${poolPercents?.[id] || '0'}%`}
        </span>
        {!count ? (
          <FormattedMessage id="no_pool" defaultMessage={'No Pool'} />
        ) : (
          <FormattedMessage id="select" defaultMessage={'select'} />
        )}
      </span>
    );
  }

  function SelectTvl({
    fee,
    poolId,
    className,
  }: {
    fee?: number;
    poolId?: string;
    className?: string;
  }) {
    const id = poolId ? poolId : getV3PoolId(tokenIn.id, tokenOut.id, fee);

    const [PoolDetails, setPoolDetails] = useState<PoolInfo>();

    useEffect(() => {
      get_pool_from_cache(id).then(setPoolDetails);
    }, []);

    function displayTvl() {
      const tvl = everyPoolTvl?.[id] || '0';
      if (!tokenPriceList) {
        return '-';
      } else if (!tvl || +tvl == 0) {
        return '$0';
      } else if (+tvl < 1) {
        return '<$1';
      } else {
        return `$${toInternationalCurrencySystem(tvl.toString(), 0)}`;
      }
    }

    function displayTvlAndNoPool() {
      if (everyPoolTvl?.[id] == null) {
        return <span>No pool</span>;
      } else {
        return (
          <>
            <span className="mr-1.5 xsm:mr-0 xsm:hidden select-none">TVL</span>
            {displayTvl()}
          </>
        );
      }
    }

    return (
      <div
        className={`transform scale-90 inline-flex items-center text-xs whitespace-nowrap select-none ${className}`}
      >
        {displayTvlAndNoPool()}
      </div>
    );
  }

  function isAllFeesNoPools() {
    const target = V3_POOL_FEE_LIST.find((fee) => {
      const pool_id = getV3PoolId(tokenIn.id, tokenOut.id, fee);
      if (everyPoolTvl?.[pool_id] !== null) return true;
    });
    if (target) {
      return false;
    } else {
      return true;
    }
  }

  if (!(tokenIn && tokenOut)) return null;
  return (
    <>
      <div
        className={`relative border border-limitOrderFeeTiersBorderColor flex flex-col rounded-xl p-2.5 xs:p-2 xs:px-1 ${
          feeTiersShowFull ? 'w-full' : ''
        } ${mobileShowFees ? 'feeBoxGradientBorder' : ''}`}
        onMouseLeave={() => {
          if (!isMobile) {
            setHoverSlider(false);
            setFeeTiersShowFull(false);
          }
        }}
      >
        <div className="">
          <div className="flex items-center justify-between ">
            <span className="text-xs text-primaryText whitespace-nowrap mr-1.5 select-none">
              <FormattedMessage id="fee_tiers" defaultMessage={'Fee Tiers'} />
            </span>
            <div className={'flex items-center gap-1'}>
              <InfoIcon
                id={'infoIcon'}
                tooltipNode={
                  <div style={{ maxWidth: 220 }}>
                    <div>
                      Please note: when the order is filled by instant swap, you
                      will be a liquidity taker.
                    </div>
                    <div>
                      {' '}
                      Meanwhile, no fee will be charged when you are a liquidity
                      maker.
                    </div>
                  </div>
                }
              />

              <button
                onMouseEnter={(e) => {
                  if (!isMobile) {
                    setHoverSlider(true);
                    setFeeTiersShowFull(true);
                  }
                }}
                className={`p-0.5 rounded-md ${
                  feeTiersShowFull || hoverSlider || mobileShowFees
                    ? 'bg-selectTokenV3BgColor'
                    : ''
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (isMobile) {
                    setMobileShowFees(!mobileShowFees);
                  }
                }}
              >
                <Slider shrink showSlip={feeTiersShowFull || hoverSlider} />
              </button>
            </div>
          </div>
          <div
            className={`flex items-center mt-2 ${
              feeTiersShowFull ? 'hidden' : ''
            }`}
          >
            {isAllFeesNoPools() ? (
              <span className="text-sm text-limitOrderInputColor">
                Unavailable
              </span>
            ) : (
              <>
                <span className="whitespace-nowrap text-sm text-primaryText mr-1 select-none">
                  {toPrecision(
                    calculateFeePercent(
                      Number(v3Pool?.split(V3_POOL_SPLITER)[2] || 2000) / 100
                    ).toString(),
                    2
                  )}
                  %
                </span>
                <SelectTvl
                  poolId={v3Pool}
                  className="text-limitOrderInputColor"
                />
              </>
            )}
          </div>
        </div>

        {!feeTiersShowFull ? null : (
          <div className="w-full grid grid-cols-4 gap-x-1 mt-1.5">
            {V3_POOL_FEE_LIST.map((fee, i) => {
              const pool_id = getV3PoolId(tokenIn.id, tokenOut.id, fee);
              const feePercent = toPrecision(
                calculateFeePercent(fee / 100).toString(),
                2
              );
              const isNoPool = everyPoolTvl?.[pool_id] == null;
              return (
                <button
                  key={i + '-' + pool_id}
                  className={`relative rounded-xl ${
                    v3Pool === pool_id && !isNoPool
                      ? 'bg-feeBoxSelectedBg'
                      : isNoPool
                      ? 'border border-commonTokenBorderColor cursor-not-allowed'
                      : 'bg-selectTokenV3BgColor'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!isNoPool) {
                      setV3Pool(pool_id);
                      setHoverSlider(false);
                      setFeeTiersShowFull(false);
                    }
                  }}
                >
                  <div className={`flex-col flex items-start p-2`}>
                    <span
                      className={`text-sm ${
                        isNoPool
                          ? 'text-primaryText text-opacity-60'
                          : 'text-white'
                      }`}
                    >
                      {feePercent}%
                    </span>
                    <SelectTvl
                      fee={fee}
                      className={`text-primaryText ${
                        isNoPool ? 'text-opacity-60' : ''
                      } `}
                    />
                  </div>
                  {v3Pool === pool_id && !isNoPool ? (
                    <SelectedIcon className="absolute right-0 top-0"></SelectedIcon>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div
        className={`absolute z-10 w-full grid grid-cols-4 gap-x-1  rounded-lg text-white mt-1.5 p-1.5 border border-v3GreyColor  bg-feeBoxBgColor lg:hidden ${
          mobileShowFees ? '' : 'hidden'
        }`}
        style={{ boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.25)', top: '71px' }}
      >
        <ArrowToIcon
          className="absolute right-12"
          style={{ top: '-7px' }}
        ></ArrowToIcon>
        {V3_POOL_FEE_LIST.map((fee, i) => {
          const pool_id = getV3PoolId(tokenIn.id, tokenOut.id, fee);
          const feePercent = toPrecision(
            calculateFeePercent(fee / 100).toString(),
            2
          );
          const isNoPool = everyPoolTvl?.[pool_id] == null;
          return (
            <button
              key={i + '-' + pool_id}
              className={`relative bg-feeSubBoxBgColor rounded-xl ${
                v3Pool === pool_id && !isNoPool
                  ? 'bg-opacity-100'
                  : isNoPool
                  ? 'border border-commonTokenBorderColor cursor-not-allowed bg-opacity-0'
                  : 'bg-opacity-30'
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isNoPool) {
                  setV3Pool(pool_id);
                  setMobileShowFees(false);
                }
              }}
            >
              <div className={`flex-col flex items-start p-1`}>
                <span
                  className={`text-sm ${
                    isNoPool ? 'text-primaryText text-opacity-60' : 'text-white'
                  }`}
                >
                  {feePercent}%
                </span>
                <SelectTvl
                  fee={fee}
                  className={`text-primaryText ${
                    isNoPool ? 'text-opacity-60' : ''
                  } `}
                />
              </div>
              {v3Pool === pool_id && !isNoPool ? (
                <SelectedIcon className="absolute right-0 top-0"></SelectedIcon>
              ) : null}
            </button>
          );
        })}
      </div>
    </>
  );
}

function ArrowToIcon(props: any) {
  return (
    <img
      {...props}
      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAHCAYAAAA8sqwkAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyVpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQ4IDc5LjE2NDAzNiwgMjAxOS8wOC8xMy0wMTowNjo1NyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIxLjAgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OTg4MkE0RkQ2ODI5MTFFREE3MkJEQzEyMDI5MUE2OEUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OTg4MkE0RkU2ODI5MTFFREE3MkJEQzEyMDI5MUE2OEUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo5ODgyQTRGQjY4MjkxMUVEQTcyQkRDMTIwMjkxQTY4RSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo5ODgyQTRGQzY4MjkxMUVEQTcyQkRDMTIwMjkxQTY4RSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PmhvIccAAAD+SURBVHjaYmRgYOAGYkYRERHGN2/eMIAAkM3w9+9fpvfv3/9ngIB/QAxmMwExi4CAAAtQMQuIDcSsXIKCory8IsIgNhAzg2igGjCbEUiAJBh5eHiYvnz5wmDp4V/CwsJWCjLtz59fPcd3bOyGmg7GIN38IJ2/fv1isXD3KwUqLvny5SsDkM/AwcFhJaWkwvzk7s1TUJuYQIQQyCnmbr5FrKzshSDF//79Y/j//z/D799/gJo4LSXllZme3rt1GmgAM7OoqLSinq1TOSsrWyZMMQzANHFycVpIKigx/fn67SajrU/of2CIMHz79h1FMTJgYmIC2sTOwMbGxgAQYADlWluUPx6KyQAAAABJRU5ErkJggg=="
    ></img>
  );
}

function NoLimitPoolCard() {
  return (
    <div className="relative  text-sm mt-6 xsm:mt-8 text-center text-warn z-50">
      <span className="self-center">
        <label className="">
          <FormattedMessage id="oops" defaultMessage="Oops" />!
        </label>
      </span>

      <span className="self-center ml-1">
        <FormattedMessage
          id="the_pool_not_exist"
          defaultMessage={'The pool does not exist'}
        />
        .
      </span>
    </div>
  );
}

export default function LimitOrderCard(props: {
  allTokens: TokenMetadata[];
  swapMode: SWAP_MODE;
  tokenInAmount: string;
  setTokenInAmount: (value: string) => void;
  swapTab?: JSX.Element;
  globalWhiteListTokens: TokenMetadata[];
  limitTokenTrigger?: boolean;
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  setTokenIn: (value: TokenMetadata) => void;
  setTokenOut: (value: TokenMetadata) => void;
}) {
  const { NEARXIDS, STNEARIDS } = getExtraStablePoolConfig();
  const { REF_TOKEN_ID } = getConfig();

  const [diff, setDiff] = useState<string>('');

  const [selectedV3LimitPool, setSelectedV3LimitPool] = useState<string>('');

  const {
    allTokens,
    swapMode,
    tokenInAmount,
    setTokenInAmount,
    swapTab,
    tokenIn,
    tokenOut,
    setTokenIn,
    setTokenOut,
    globalWhiteListTokens,
    limitTokenTrigger,
  } = props;

  const [doubleCheckOpenLimit, setDoubleCheckOpenLimit] =
    useState<boolean>(false);

  const [curOrderPrice, setCurOrderPrice] = useState<string>('');

  const [LimitAmountOutRate, setLimitAmountOutRate] = useState<string>('');

  const [limitAmountOut, setLimitAmountOut] = useState<string>('');

  const useNearBalance = true;

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

  const [limitSwapTrigger, setLimiSwapTrigger] = useState<boolean>(false);
  const [showSkywardTip, setShowSkywardTip] = useState<boolean>(false);
  const [wrapLoading, setWrapLoading] = useState<boolean>(false);

  const [balanceInDone, setBalanceInDone] = useState<boolean>(false);
  const [balanceOutDone, setBalanceOutDone] = useState<boolean>(false);
  const [limitLockedTokenOutTrigger, setLimitLockedTokenOutTrigger] =
    useState<boolean>(false);

  const intl = useIntl();
  const location = useLocation();
  const history = useHistory();

  const [displayDetailView, setDisplayDetailView] = useState<JSX.Element>();

  const [urlTokenIn, urlTokenOut, urlSlippageTolerance] = decodeURIComponent(
    location.hash.slice(1)
  ).split(TOKEN_URL_SEPARATOR);

  const nearBalance = useDepositableBalance('NEAR');

  const [slippageToleranceLimit, setSlippageToleranceLimit] = useState<number>(
    Number(localStorage.getItem(SWAP_SLIPPAGE_KEY_LIMIT)) || 0.5
  );
  const [feeTiersShowFull, setFeeTiersShowFull] = useState<boolean>(false);
  const [hasLockedRate, setHasLockedRate] = useState(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const tokenPriceList = useTokenPriceList();
  const processTransactionPending = useTranstionsExcuteDataStore(
    (state) => state.processTransactionPending
  );
  const processTransactionSuccess = useTranstionsExcuteDataStore(
    (state) => state.processTransactionSuccess
  );
  const processTransactionError = useTranstionsExcuteDataStore(
    (state) => state.processTransactionError
  );

  const skywardId =
    getConfig().networkId === 'mainnet'
      ? 'token.skyward.near'
      : 'skyward.fakes.testnet';

  const usdcId =
    getConfig().networkId === 'mainnet'
      ? 'a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near'
      : 'usdc.fakes.testnet';

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
        candTokenIn = unwrapedNear;
      } else if (rememberedIn == 'near') {
        candTokenIn = unwrapedNear;
      } else if (rememberedIn == WRAP_NEAR_CONTRACT_ID) {
        candTokenIn = unwrapedNear;
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
        candTokenOut = unwrapedNear;
      } else if (rememberedOut == 'near') {
        candTokenOut = unwrapedNear;
      } else if (rememberedOut == WRAP_NEAR_CONTRACT_ID) {
        candTokenOut = unwrapedNear;
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
    if (limitTokenTrigger === undefined || swapMode !== SWAP_MODE.LIMIT) return;

    setTokenIn({
      ...nearMetadata,
      id: WRAP_NEAR_CONTRACT_ID,
    });

    setTokenOut(allTokens.find((token) => token.id === usdcId));
  }, [limitTokenTrigger, swapMode]);

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
      slippageValue: slippageToleranceLimit,
      setSlippageValue: setSlippageToleranceLimit,
      slippageKey: SWAP_SLIPPAGE_KEY_LIMIT,
    };
  };

  const onChangeSlippage = (slippage: number) => {
    const { slippageValue, setSlippageValue, slippageKey } =
      getSlippageTolerance();

    setSlippageValue(slippage);

    localStorage.setItem(slippageKey, slippage.toString());
  };

  const slippageTolerance = getSlippageTolerance().slippageValue;

  useSwapPopUp();

  const {
    poolPercents,
    fee: mostPoolFeeLimit,
    mostPoolDetail,
    quoteDone: quoteDoneLimit,
    everyPoolTvl,
  } = useLimitOrder({
    tokenIn,
    tokenOut,
    swapMode,
    selectedV3LimitPool,
    setSelectedV3LimitPool,
    loadingTrigger: limitSwapTrigger,
    tokenPriceList,
  });

  useEffect(() => {
    if (!mostPoolDetail) setCurOrderPrice(null);
    if (!mostPoolDetail || !tokenIn || !tokenOut || !quoteDoneLimit) {
      return;
    }
    const { token_x, token_y } = mostPoolDetail;
    if (
      (token_x !== tokenIn.id && token_x !== tokenOut.id) ||
      (token_y !== tokenIn.id && token_y !== tokenOut.id)
    ) {
      return;
    }
    const curPoint =
      tokenIn.id === mostPoolDetail.token_x
        ? mostPoolDetail.current_point
        : mostPoolDetail.current_point * -1;

    const reguPoint = regularizedPoint(curPoint, mostPoolDetail.fee);

    const price = pointToPrice({
      tokenA: tokenIn,
      tokenB: tokenOut,
      point:
        curPoint === reguPoint
          ? reguPoint
          : reguPoint + feeToPointDelta(mostPoolDetail.fee),
    });
    const priceKeep = toPrecision(price, 8) === curOrderPrice;

    const regularizedRate = toPrecision(
      regularizedPrice(
        LimitAmountOutRate,
        tokenIn,
        tokenOut,
        mostPoolDetail.fee
      ),
      8,
      false,
      false
    );

    const displayRate = ONLY_ZEROS.test(regularizedRate) ? '' : regularizedRate;

    setLimitAmountOutRate(
      priceKeep ? displayRate || toPrecision(price, 8) : toPrecision(price, 8)
    );

    setCurOrderPrice(
      priceKeep ? curOrderPrice || toPrecision(price, 8) : toPrecision(price, 8)
    );

    const amountOut_original = scientificNotationToString(
      new Big(priceKeep ? displayRate || price || 0 : price)
        .times(tokenInAmount || 0)
        .toString()
    );
    let amountOut;
    const minValue = '0.00000001';
    if (new BigNumber(amountOut_original).isGreaterThanOrEqualTo(minValue)) {
      amountOut = toPrecision(amountOut_original, 8, false, false);
    } else {
      amountOut = amountOut_original;
    }

    if (!limitLockedTokenOutTrigger) {
      setLimitAmountOut(ONLY_ZEROS.test(amountOut) ? '' : amountOut);
    }
  }, [mostPoolDetail, tokenIn, tokenOut, tokenInAmount, quoteDoneLimit]);

  const LimitChangeAmountOut = (
    amount: string,
    noNeedChangeInputAmount?: boolean
  ) => {
    const curAmount = toPrecision(amount, 8, false, false);

    if (hasLockedRate && !noNeedChangeInputAmount) {
      if (LimitAmountOutRate) {
        const inValue = new Big(curAmount || '0')
          .div(LimitAmountOutRate)
          .toString();
        setTokenInAmount(toPrecision(inValue, 8, false, false));
        setLimitLockedTokenOutTrigger(true);
      }
    } else {
      if (tokenInAmount && !ONLY_ZEROS.test(tokenInAmount)) {
        setLimitAmountOutRate(
          toPrecision(
            scientificNotationToString(
              new Big(curAmount || '0').div(tokenInAmount || 1).toString()
            ),
            8
          )
        );
      }
    }
    setLimitAmountOut(curAmount);
  };
  const onChangeLimitRate = (r: string) => {
    const curR = toPrecision(r, 8, false, false);

    const displayCurR = curR;

    setLimitAmountOutRate(displayCurR);

    const curAmountOut = scientificNotationToString(
      new Big(displayCurR || 0).times(tokenInAmount || 0).toString()
    );

    setLimitAmountOut(
      ONLY_ZEROS.test(curAmountOut)
        ? ''
        : toPrecision(curAmountOut, 8, false, false)
    );
  };

  const limitSwap = async () => {
    const transactionId = String(Date.now());
    try {
      setShowSwapLoading(true);
      processTransactionPending({
        page: constTransactionPage.swap,
        transactionId,
        data: {
          tokens: [
            {
              token: tokenIn,
              amount: tokenInAmount,
            },
            {
              symbol: '>',
            },
            {
              token: tokenOut,
              amount: limitAmountOut,
            },
          ],
        },
      });
      const swapRes = await v3Swap({
        swapInfo: {
          tokenA: tokenIn,
          tokenB: tokenOut,
          amountA: tokenInAmount,
          amountB: limitAmountOut,
        },
        LimitOrderWithSwap: {
          pool_id: selectedV3LimitPool,
        },
      });
      setShowSwapLoading(false);
      setDoubleCheckOpenLimit(false);
      processTransactionSuccess({
        transactionResponse: swapRes?.response,
        transactionId,
      });
    } catch (e) {
      setShowSwapLoading(false);
      // setDoubleCheckOpenLimit(false);
      processTransactionError({
        error: e,
        transactionId,
      });
    }
  };

  const tokenInMax = tokenInBalanceFromNear || '0';

  const tokenOutTotal = tokenOutBalanceFromNear || '0';
  const isInValidLimitIn =
    tokenIn &&
    Number(tokenInAmount) > 0 &&
    ONLY_ZEROS.test(toNonDivisibleNumber(tokenIn.decimals, tokenInAmount));

  function satisfyCondition2() {
    return (
      new Big(tokenInAmount || '0').gt('0') &&
      new Big(tokenInMax || '0').gt('0') &&
      new Big(tokenInAmount || '0').lte(tokenInMax || '0') &&
      configV2.WHITE_LIST_DCL_POOL_IDS_IN_LIMIT_ORDERS.includes(
        selectedV3LimitPool
      )
    );
  }

  const canSubmit = satisfyCondition2();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    setDoubleCheckOpenLimit(true);
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
        quoteDoneLimit={quoteDoneLimit}
        useNearBalance={useNearBalance.toString()}
        canSubmit={canSubmit}
        swapTab={swapTab}
        mostPoolDetail={mostPoolDetail}
        slippageTolerance={slippageTolerance}
        onChange={onChangeSlippage}
        showElseView={isInsufficientBalance}
        elseView={
          <div className="flex justify-center">
            {isSignedIn ? (
              isInsufficientBalance ? (
                <InsufficientButton divClassName="h-12 mt-6 w-full" />
              ) : (
                <div className="mt-4 w-full">
                  <ConnectToNearBtnSwap />
                </div>
              )
            ) : null}
          </div>
        }
        swapMode={swapMode}
        onSubmit={handleSubmit}
        info={intl.formatMessage({ id: 'swapCopy' })}
        title={'create_order'}
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
          limitOrderDisable={!mostPoolDetail || !quoteDoneLimit}
          onSelectToken={(token) => {
            localStorage.setItem(SWAP_IN_KEY, token.id);
            setTokenIn(token);

            if (token.id === skywardId) {
              setShowSkywardTip(true);
            }
          }}
          text={intl.formatMessage({ id: 'sell' })}
          useNearBalance={useNearBalance}
          onChangeAmount={(v) => {
            setLimitLockedTokenOutTrigger(false);
            setTokenInAmount(v);
          }}
          tokenPriceList={tokenPriceList}
          isError={tokenIn?.id === tokenOut?.id}
          postSelected={tokenOut}
          onSelectPost={(token) => {
            setTokenOut(token);
          }}
          allowWNEAR={false}
          nearErrorTip={
            !!curOrderPrice &&
            quoteDoneLimit &&
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
          <SwapExchangeV3
            tokenIn={tokenIn}
            tokenOut={tokenOut}
            rate={LimitAmountOutRate}
            fee={mostPoolDetail?.fee}
            onChange={() => {
              setTokenIn(tokenOut);
              localStorage.setItem(SWAP_IN_KEY, tokenOut.id);
              setTokenOut(tokenIn);
              localStorage.setItem(SWAP_OUT_KEY, tokenIn.id);

              setTokenInAmount(toPrecision('1', 6));
              localStorage.setItem(SWAP_IN_KEY, tokenOut.id);
              localStorage.setItem(SWAP_OUT_KEY, tokenIn.id);
            }}
            triggerFetch={() => setLimiSwapTrigger(!limitSwapTrigger)}
            curPrice={curOrderPrice}
            setRate={onChangeLimitRate}
          />
        </div>
        <LimitOrderTriggerContext.Provider
          value={{
            triggerFetch: () => {
              setLimiSwapTrigger(!limitSwapTrigger);
            },
            detail: {
              showDetails,
            },
          }}
        >
          <TokenAmountV3
            forSwap
            isOut
            swapMode={swapMode}
            amount={!limitAmountOut ? '0' : limitAmountOut}
            total={tokenOutTotal}
            tokens={allTokens}
            selectedToken={tokenOut}
            preSelected={tokenIn}
            onSelectPre={(token: TokenMetadata) => setTokenIn(token)}
            onChangeAmount={mostPoolDetail && LimitChangeAmountOut}
            onBlur={(newRate: string) => {
              const newAmountOut = new Big(newRate)
                .times(tokenInAmount || 0)
                .toString();
              LimitChangeAmountOut(
                scientificNotationToString(newAmountOut),
                true
              );
            }}
            tokenIn={tokenIn}
            tokenOut={tokenOut}
            limitFee={mostPoolDetail?.fee}
            limitOrderDisable={
              !mostPoolDetail || !quoteDoneLimit || isInValidLimitIn
            }
            setDiff={setDiff}
            forLimitOrder
            text={intl.formatMessage({ id: 'buy' })}
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
            curRate={LimitAmountOutRate}
            onChangeRate={onChangeLimitRate}
            marketPriceLimitOrder={!curOrderPrice ? null : curOrderPrice}
            ExtraElement={
              <MdOutlineRefresh
                size={18}
                className={`text-primaryText cursor-pointer  ${
                  !quoteDoneLimit ? 'rotateInfinite' : ''
                } `}
                onClick={() => {
                  setLimiSwapTrigger(!limitSwapTrigger);
                }}
              />
            }
            allowWNEAR={false}
          />
          <div
            className="relative flex items-stretch justify-between mt-2.5"
            style={{ zIndex: '71' }}
          >
            <LimitOrderRateSetBox
              tokenIn={tokenIn}
              tokenOut={tokenOut}
              limitFee={mostPoolDetail?.fee}
              setDiff={setDiff}
              curRate={LimitAmountOutRate}
              onChangeRate={onChangeLimitRate}
              marketPriceLimitOrder={!curOrderPrice ? null : curOrderPrice}
              fee={mostPoolDetail?.fee}
              triggerFetch={() => setLimiSwapTrigger(!limitSwapTrigger)}
              curPrice={isInValidLimitIn ? '' : curOrderPrice}
              setRate={onChangeLimitRate}
              hidden={feeTiersShowFull ? true : false}
              hasLockedRate={hasLockedRate}
              setHasLockedRate={setHasLockedRate}
            />
            <DetailViewLimit
              tokenIn={tokenIn}
              tokenOut={tokenOut}
              poolPercents={poolPercents}
              everyPoolTvl={everyPoolTvl}
              v3Pool={selectedV3LimitPool}
              setV3Pool={setSelectedV3LimitPool}
              tokenPriceList={tokenPriceList}
              setFeeTiersShowFull={setFeeTiersShowFull}
              feeTiersShowFull={feeTiersShowFull}
            />
          </div>
          <div className="text-sm text-limitOrderInputColor text-center mt-2.5 px-3">
            <FormattedMessage id="limitTip"></FormattedMessage>
          </div>
        </LimitOrderTriggerContext.Provider>

        {quoteDoneLimit && !mostPoolDetail && <NoLimitPoolCard />}

        {quoteDoneLimit && !mostPoolDetail
          ? null
          : isInValidLimitIn && (
              <div className="pb-2 relative ">
                <Alert
                  level="warn"
                  message={`${tokenInAmount} ${intl.formatMessage({
                    id: 'is_not_a_valid_swap_amount',
                  })}`}
                />
              </div>
            )}
      </SwapFormWrap>

      <DoubleCheckModalLimit
        isOpen={doubleCheckOpenLimit}
        onRequestClose={() => {
          setDoubleCheckOpenLimit(false);
        }}
        selectedPool={selectedV3LimitPool}
        tokenIn={tokenIn}
        tokenOut={tokenOut}
        tokenInAmount={tokenInAmount}
        tokenOutAmount={limitAmountOut}
        rate={LimitAmountOutRate}
        from={tokenInAmount}
        onSwap={() => limitSwap()}
        rateDiff={diff}
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
