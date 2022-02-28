import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { ftGetBalance, TokenMetadata } from '../../services/ft-contract';
import { Pool } from '../../services/pool';
import { useTokenBalances } from '../../state/token';
import { useSwap } from '../../state/swap';
import {
  calculateExchangeRate,
  calculateFeeCharge,
  calculateFeePercent,
  calculateSmartRoutingPriceImpact,
  percent,
  percentLess,
  toPrecision,
  toReadableNumber,
  subtraction,
  calculatePriceImpact,
  ONLY_ZEROS,
  percentOf,
  multiply,
  divide,
  scientificNotationToString,
} from '../../utils/numbers';
import ReactDOMServer from 'react-dom/server';
import TokenAmount from '../forms/TokenAmount';
import SubmitButton from '../forms/SubmitButton';
import Alert from '../alert/Alert';
import { toRealSymbol } from '~utils/token';
import { FormattedMessage, useIntl } from 'react-intl';
import { FaAngleUp, FaAngleDown, FaExchangeAlt } from 'react-icons/fa';
import db from '~store/RefDatabase';
import {
  ButtonTextWrapper,
  GradientButton,
  OutlineButton,
  SolidButton,
  ConnectToNearBtn,
} from '~components/button/Button';
import { STABLE_TOKEN_IDS, wallet } from '~services/near';
import SwapFormWrap from '../forms/SwapFormWrap';
import SwapTip from '~components/forms/SwapTip';
import { WarnTriangle, ErrorTriangle } from '~components/icon/SwapRefresh';
import ReactModal from 'react-modal';
import Modal from 'react-modal';
import { Card } from '~components/card/Card';
import { isMobile, useMobile } from '~utils/device';
import { ModalClose } from '~components/icon';
import BigNumber from 'bignumber.js';
import {
  AutoRouterText,
  OneParallelRoute,
  RouterIcon,
  SmartRoute,
} from '~components/layout/SwapRoutes';
import QuestionMark, {
  QuestionMarkStaticForParaSwap,
} from '~components/farm/QuestionMark';

import ReactTooltip from 'react-tooltip';
import * as math from 'mathjs';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { EstimateSwapView, PoolMode, swap } from '~services/swap';
import { QuestionTip } from '~components/layout/TipWrapper';
import { Guide } from '~components/layout/Guide';
import { sortBy } from 'lodash';

const SWAP_IN_KEY = 'REF_FI_SWAP_IN';
const SWAP_OUT_KEY = 'REF_FI_SWAP_OUT';
const SWAP_SLIPPAGE_KEY = 'REF_FI_SLIPPAGE_VALUE';
export const SWAP_USE_NEAR_BALANCE_KEY = 'REF_FI_USE_NEAR_BALANCE_VALUE';
const TOKEN_URL_SEPARATOR = '|';

export function DoubleCheckModal(
  props: ReactModal.Props & {
    pools: Pool[];
    tokenIn: TokenMetadata;
    tokenOut: TokenMetadata;
    from: string;
    onSwap: (e?: any) => void;
    swapsTodo: EstimateSwapView[];
    priceImpactValue: string;
  }
) {
  const { pools, tokenIn, tokenOut, from, onSwap, priceImpactValue } = props;

  const [buttonLoading, setButtonLoading] = useState<boolean>(false);

  if (!pools || !from || !tokenIn || !tokenOut) return null;

  return (
    <Modal {...props}>
      <Card
        padding="p-6"
        bgcolor="bg-cardBg"
        className="text-white border border-gradientFromHover outline-none flex flex-col items-center"
        width="xs:w-80vw md:w-80vw lg:w-30vw"
      >
        <div
          className="ml-2 cursor-pointer p-1 self-end"
          onClick={props.onRequestClose}
        >
          <ModalClose />
        </div>

        <div className="pb-6">
          <ErrorTriangle expand />
        </div>

        <div className="text-base font-semibold">
          <FormattedMessage id="are_you_sure" defaultMessage="Are you sure" />?
        </div>

        <div className=" text-xs pt-4 flex-col flex items-center justify-center">
          <div>
            <FormattedMessage
              id="price_impact_is_about"
              defaultMessage="Price impact is about"
            />
          </div>
          <div className="pt-1">
            <span className="text-error">
              -{toPrecision(priceImpactValue, 2)}%
            </span>
            <span className="text-error">
              {' '}
              {`(${
                Number(priceImpactValue) < 0
                  ? '0'
                  : '-' +
                    toPrecision(
                      scientificNotationToString(
                        multiply(from, divide(priceImpactValue, '100'))
                      ),
                      3
                    )
              } ${toRealSymbol(tokenIn.symbol)})`}{' '}
            </span>
          </div>
        </div>
        <div className="text-xs pb-6 pt-1">
          <FormattedMessage
            id="make_sure_you_understand_what_you_do"
            defaultMessage="Make sure you understand what you do"
          />
          !
        </div>

        <div className="flex items-center pb-2">
          <OutlineButton
            onClick={props.onRequestClose}
            className="text-xs w-20 text-center mx-2 h-8"
            padding="px-4 py-1"
          >
            <FormattedMessage id="cancel" defaultMessage="Cancel" />
          </OutlineButton>
          <SolidButton
            onClick={(e) => {
              setButtonLoading(true);
              onSwap();
            }}
            className="text-xs w-32 text-center h-8"
            padding="px-4 py-1.5"
            loading={buttonLoading}
          >
            <ButtonTextWrapper
              loading={buttonLoading}
              Text={() => (
                <span>
                  <FormattedMessage id="yes_swap" defaultMessage="Yes, swap" />!
                </span>
              )}
            />
          </SolidButton>
        </div>
      </Card>
    </Modal>
  );
}

export function SwapDetail({
  title,
  value,
}: {
  title: string;
  value: string | JSX.Element;
}) {
  return (
    <section className="grid grid-cols-12 py-1 text-xs">
      <p className="text-primaryText text-left col-span-5">{title}</p>
      <p className="text-right text-white col-span-7">{value}</p>
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
        <span>{newValue}</span>
      </p>
    </section>
  );
}

export function SmartRoutesDetail({
  swapsTodo,
  tokenIn,
  tokenOut,
}: {
  swapsTodo: EstimateSwapView[];
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
}) {
  const tokenMid = useMemo(() => swapsTodo[1].token, [swapsTodo[1].token.id]);

  return (
    <section className="md:flex lg:flex py-1 text-xs items-center md:justify-between lg:justify-between">
      <div className="text-primaryText text-left ">
        <div className="inline-flex items-center">
          <RouterIcon />
          <AutoRouterText />
          <QuestionTip id="optimal_path_found_by_our_solution" width="w-56" />
        </div>
      </div>

      <div className="text-right text-white col-span-6 xs:mt-2">
        {<SmartRoute tokens={[tokenIn, tokenMid, tokenOut]} />}
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
    if (pools) {
      const partialAmounts = pools.map((pool) => {
        return math.bignumber(pool.partialAmountIn);
      });

      const ps: string[] = new Array(partialAmounts.length).fill('0');

      const sum =
        partialAmounts.length === 1
          ? partialAmounts[0]
          : math.sum(...partialAmounts);

      const sortedAmount = sortBy(partialAmounts, (p) => Number(p));

      for (let k = 0; k < sortedAmount.length - 1; k++) {
        let minIndex = -1;

        for (let j = 0; j < partialAmounts.length; j++) {
          if (partialAmounts[j].eq(sortedAmount[k])) {
            minIndex = j;
            break;
          }
        }
        const res = math
          .round(percent(partialAmounts[minIndex].toString(), sum))
          .toString();

        if (Number(res) === 0) {
          ps[minIndex] = '1';
        } else {
          ps[minIndex] = res;
        }
      }

      const finalPIndex = ps.indexOf('0');

      ps[finalPIndex] = subtraction(
        '100',
        ps.length === 1 ? Number(ps[0]) : math.sum(...ps.map((p) => Number(p)))
      ).toString();

      return ps;
    } else {
      return [];
    }
  }, [pools]);

  return (
    <section className="md:grid lg:grid grid-cols-12 py-1 text-xs">
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
  minAmountOut,
  isParallelSwap,
  fee,
  swapsTodo,
  priceImpact,
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
      <div className="flex justify-center">
        <div
          className="flex items-center text-white cursor-pointer"
          onClick={() => {
            setShowDetails(!showDetails);
          }}
        >
          <label className="mr-2">{getPriceImpactTipType(priceImpact)}</label>
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
          value={<span>{toPrecision(minAmountOutValue, 8)}</span>}
        />
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
          title={intl.formatMessage({ id: 'pool_fee' })}
          value={poolFeeDisplay}
        />

        {isParallelSwap && pools.length > 1 && (
          <ParallelSwapRoutesDetail
            tokenIn={tokenIn}
            tokenOut={tokenOut}
            pools={pools}
          />
        )}

        {!isParallelSwap && (
          <SmartRoutesDetail
            tokenIn={tokenIn}
            tokenOut={tokenOut}
            swapsTodo={swapsTodo}
          />
        )}
      </div>
    </div>
  );
}

export default function SwapCard(props: { allTokens: TokenMetadata[] }) {
  const { allTokens } = props;
  const [tokenIn, setTokenIn] = useState<TokenMetadata>();
  const [tokenInAmount, setTokenInAmount] = useState<string>('1');
  const [tokenOut, setTokenOut] = useState<TokenMetadata>();
  const [doubleCheckOpen, setDoubleCheckOpen] = useState<boolean>(false);

  const [useNearBalance, setUseNearBalance] = useState<boolean>(
    localStorage.getItem(SWAP_USE_NEAR_BALANCE_KEY) != 'false'
  );

  const [tokenInBalanceFromNear, setTokenInBalanceFromNear] =
    useState<string>();
  const [tokenOutBalanceFromNear, setTokenOutBalanceFromNear] =
    useState<string>();

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
  const [slippageTolerance, setSlippageTolerance] = useState<number>(
    Number(localStorage.getItem(SWAP_SLIPPAGE_KEY) || urlSlippageTolerance) ||
      0.5
  );
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
    if (useNearBalance) {
      if (tokenIn) {
        const tokenInId = tokenIn.id;
        if (tokenInId) {
          if (wallet.isSignedIn()) {
            ftGetBalance(tokenInId).then((available) =>
              setTokenInBalanceFromNear(
                toReadableNumber(tokenIn?.decimals, available)
              )
            );
          }
        }
      }
      if (tokenOut) {
        const tokenOutId = tokenOut.id;
        if (tokenOutId) {
          if (wallet.isSignedIn()) {
            ftGetBalance(tokenOutId).then((available) =>
              setTokenOutBalanceFromNear(
                toReadableNumber(tokenOut?.decimals, available)
              )
            );
          }
        }
      }
    }
  }, [tokenIn, tokenOut, useNearBalance]);

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
  });

  const priceImpactValueParallelSwap = useMemo(() => {
    if (!pools || !tokenOutAmount || !tokenInAmount) return '0';
    return calculatePriceImpact(pools, tokenIn, tokenOut, tokenInAmount);
  }, [swapsToDo]);

  const priceImpactValueSmartRouting = useMemo(() => {
    {
      if (!swapsToDo || !tokenInAmount || isParallelSwap) return '0';
      return calculateSmartRoutingPriceImpact(
        tokenInAmount,
        swapsToDo,
        tokenIn,
        swapsToDo[1].token,
        tokenOut
      );
    }
  }, [swapsToDo]);

  const PriceImpactValue = isParallelSwap
    ? priceImpactValueParallelSwap
    : priceImpactValueSmartRouting;

  const topBall = useRef<HTMLInputElement>();
  const bottomBall = useRef<HTMLInputElement>();
  const runSwapAnimation = function () {
    topBall.current.style.animation = 'rotation1 1s 0s ease-out 1';
    bottomBall.current.style.animation = 'rotation2 1s 0s ease-out 1';
    topBall.current.addEventListener('animationend', function () {
      topBall.current.style.animation = '';
    });
    bottomBall.current.addEventListener('animationend', function () {
      bottomBall.current.style.animation = '';
    });
  };

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
      <Guide
        bothStableToken={
          STABLE_TOKEN_IDS.includes(tokenIn?.id) &&
          STABLE_TOKEN_IDS.includes(tokenOut?.id)
        }
      ></Guide>
      <SwapTip
        bothStableToken={
          STABLE_TOKEN_IDS.includes(tokenIn?.id) &&
          STABLE_TOKEN_IDS.includes(tokenOut?.id)
        }
        tokenInId={tokenIn?.id}
        tokenOutId={tokenOut?.id}
      />
      <SwapFormWrap
        useNearBalance={useNearBalance.toString()}
        canSubmit={canSubmit}
        slippageTolerance={slippageTolerance}
        onChange={(slippage) => {
          setSlippageTolerance(slippage);
          localStorage.setItem(SWAP_SLIPPAGE_KEY, slippage?.toString());
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
            {wallet.isSignedIn() ? (
              <SubmitButton disabled={true} loading={showSwapLoading} />
            ) : (
              <div className="mt-4 w-full">
                <ConnectToNearBtn />
              </div>
            )}
          </div>
        }
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
            setTokenInBalanceFromNear(token.near.toString());
          }}
          text={intl.formatMessage({ id: 'from' })}
          useNearBalance={useNearBalance}
          onChangeAmount={(amount) => {
            setTokenInAmount(amount);
          }}
        />
        <div
          className="flex items-center justify-center border-t mt-12"
          style={{ borderColor: 'rgba(126, 138, 147, 0.3)' }}
        >
          <div
            className="relative flex items-center -mt-6 mb-4 w-11 h-11 border border-white border-opacity-40 rounded-full cursor-pointer bg-dark"
            onClick={() => {
              runSwapAnimation();
              setTokenIn(tokenOut);
              setTokenOut(tokenIn);
              setTokenInAmount(toPrecision('1', 6));
            }}
          >
            <div className="swap-wrap">
              <div className="top-ball" ref={topBall} id="top-ball" />
              <div className="bottom-ball" ref={bottomBall} id="bottom-ball" />
            </div>
          </div>
        </div>
        <TokenAmount
          amount={toPrecision(tokenOutAmount, 8)}
          total={tokenOutTotal}
          tokens={allTokens}
          selectedToken={tokenOut}
          balances={balances}
          text={intl.formatMessage({ id: 'to' })}
          useNearBalance={useNearBalance}
          onSelectToken={(token) => {
            localStorage.setItem(SWAP_OUT_KEY, token.id);
            history.replace(`#${tokenIn.id}${TOKEN_URL_SEPARATOR}${token.id}`);
            setTokenOut(token);
            setTokenOutBalanceFromNear(token.near.toString());
          }}
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
        style={{
          overlay: {
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
          },
          content: {
            outline: 'none',
            position: 'fixed',
            top: '50%',
          },
        }}
        pools={pools}
        tokenIn={tokenIn}
        tokenOut={tokenOut}
        from={tokenInAmount}
        onSwap={() => makeSwap(useNearBalance)}
        swapsTodo={swapsToDo}
        priceImpactValue={PriceImpactValue}
      />
    </>
  );
}
