import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { getPool, Pool, StablePool, getStablePool } from '../services/pool';
import { estimateSwap as estimateStableSwap } from '../services/stable-swap';

import { TokenMetadata, ftGetTokenMetadata } from '../services/ft-contract';
import {
  calculateSmartRoutingPriceImpact,
  percentLess,
  scientificNotationToString,
  toNonDivisibleNumber,
  toReadableNumber,
} from '../utils/numbers';

import {
  checkTransaction,
  estimateSwap,
  PoolMode,
  swap,
} from '../services/swap';

import { swap as stableSwap } from '../services/stable-swap';

import { useHistory, useLocation } from 'react-router';
import getConfig from '~services/config';
import { FormattedMessage, useIntl } from 'react-intl';

import { getCurrentWallet, WalletContext } from '../utils/wallets-integration';
import {
  POOL_TOKEN_REFRESH_INTERVAL,
  STABLE_TOKEN_IDS,
  STABLE_POOL_ID,
} from '../services/near';

import {
  getExpectedOutputFromActions,
  getAverageFeeForRoutes,
  getExpectedOutputFromActionsORIG,
  //@ts-ignore
} from '../services/smartRouteLogic';
import {
  failToast,
  getURLInfo,
  swapToast,
} from '../components/layout/transactionTipPopUp';
import { SWAP_MODE } from '../pages/SwapPage';
import {
  getErrorMessage,
  parsedArgs,
} from '../components/layout/transactionTipPopUp';
import { checkTransactionStatus, EstimateSwapView } from '../services/swap';
import { checkCrossSwapTransactions } from '../components/layout/transactionTipPopUp';
import {
  getLimitOrderRangeCountAndPool,
  get_pool,
  PoolInfo,
  quote,
  v3Swap,
  V3_POOL_FEE_LIST,
  V3_POOL_SPLITER,
} from '../services/swapV3';
import {
  pointToPrice,
  get_pointorder_range,
  find_order,
} from '../services/swapV3';
import _, { toArray } from 'lodash';
import {
  getV3PoolId,
  get_pool_from_cache,
  BLACK_POOL,
} from '../services/swapV3';
import {
  checkAllocations,
  toPrecision,
  getAllocationsLeastOne,
} from '../utils/numbers';
import conformsTo from 'lodash';
import {
  LimitOrderFailPopUp,
  LimitOrderPopUp,
} from '../components/layout/transactionTipPopUp';
import { toRealSymbol } from '../utils/token';
import { useTokenPriceList } from './token';
import Big from 'big.js';
import BigNumber from 'bignumber.js';
import { parsedTransactionSuccessValue } from '../components/layout/transactionTipPopUp';
import { SUPPORT_LEDGER_KEY } from '../components/swap/SwapCard';
import {
  calcStableSwapPriceImpact,
  calculateSmartRoutesV2PriceImpact,
} from '../utils/numbers';
const ONLY_ZEROS = /^0*\.?0*$/;

export const REF_DCL_POOL_CACHE_KEY = 'REF_DCL_POOL_CACHE_VALUE';

interface SwapOptions {
  tokenIn: TokenMetadata;
  tokenInAmount: string;
  tokenOut: TokenMetadata;
  slippageTolerance: number;
  setLoadingData?: (loading: boolean) => void;
  loadingData?: boolean;
  loadingTrigger?: boolean;
  setLoadingTrigger?: (loadingTrigger: boolean) => void;
  stablePool?: StablePool;
  loadingPause?: boolean;
  setLoadingPause?: (pause: boolean) => void;
  swapMode?: SWAP_MODE;
  reEstimateTrigger?: boolean;
  supportLedger?: boolean;
  requestingTrigger?: boolean;
  setRequestingTrigger?: (requestingTrigger?: boolean) => void;
  wrapOperation?: boolean;
}

interface SwapV3Options {
  tokenIn: TokenMetadata;
  tokenInAmount: string;
  tokenOut: TokenMetadata;
  slippageTolerance: number;
  setLoadingData?: (loading: boolean) => void;
  loadingData?: boolean;
  loadingTrigger?: boolean;
  setLoadingTrigger?: (loadingTrigger: boolean) => void;
  loadingPause?: boolean;
  setLoadingPause?: (pause: boolean) => void;
  swapMode?: SWAP_MODE;
  wrapOperation?: boolean;
  swapError?: Error;
}

export const useSwapPopUp = (stopOnCross?: boolean) => {
  const { txHash, pathname, errorType } = getURLInfo();
  const history = useHistory();

  const parseLimitOrderPopUp = async (res: any) => {
    const byNeth =
      res?.transaction?.actions?.[0]?.FunctionCall?.method_name === 'execute';

    const ft_resolved_id =
      res?.receipts?.findIndex((r: any) =>
        r?.receipt?.Action?.actions?.some(
          (a: any) => a?.FunctionCall?.method_name === 'ft_resolve_transfer'
        )
      ) + (byNeth ? 1 : 0);

    const ft_on_transfer_id =
      res?.receipts?.findIndex((r: any) =>
        r?.receipt?.Action?.actions?.some(
          (a: any) => a?.FunctionCall?.method_name === 'ft_on_transfer'
        )
      ) + (byNeth ? 1 : 0);

    const ft_transfer_call_args = parsedArgs(
      byNeth
        ? res?.receipts?.[0]?.receipt?.Action?.actions?.[0]?.FunctionCall?.args
        : res?.transaction?.actions?.[0]?.FunctionCall?.args || ''
    );

    const parsedInputArgs = JSON.parse(ft_transfer_call_args || '');

    const LimitOrderWithSwap = JSON.parse(
      parsedInputArgs?.msg || '{}'
    )?.LimitOrderWithSwap;

    if (!LimitOrderWithSwap) {
      return false;
    }

    const ft_resolved_tx_outcome =
      res?.receipts_outcome?.[ft_resolved_id]?.outcome;

    const parsedValue = JSON.parse(
      parsedTransactionSuccessValue(ft_resolved_tx_outcome) || ''
    );

    const isFailed = ONLY_ZEROS.test(parsedValue || 0);

    if (isFailed) {
      LimitOrderFailPopUp(txHash);
      return true;
    }

    const ft_on_transfer_logs =
      res?.receipts_outcome?.[ft_on_transfer_id]?.outcome?.logs;

    const ft_on_transfer_log =
      ft_on_transfer_logs?.[ft_on_transfer_logs?.length - 1];

    const idx = ft_on_transfer_log?.indexOf('{');

    const parsed_ft_on_transfer_log = JSON.parse(
      ft_on_transfer_log.slice(idx) || ''
    );

    const order_id = parsed_ft_on_transfer_log?.['data']?.[0]?.['order_id'];

    const original_amount =
      parsed_ft_on_transfer_log?.['data']?.[0]?.['original_amount'];

    const original_deposit_amount =
      parsed_ft_on_transfer_log?.['data']?.[0]?.['original_deposit_amount'];

    const { point, pool_id, buy_token } = LimitOrderWithSwap;

    const ids = pool_id.split(V3_POOL_SPLITER).splice(0, 2);

    const sell_token_id = ids.find((t: string) => t !== buy_token);

    const sellToken = await ftGetTokenMetadata(sell_token_id);

    const ft_on_transfer_log_swap = ft_on_transfer_logs?.[0];

    const idx_swap = ft_on_transfer_log?.indexOf('{');

    const parsed_ft_on_transfer_log_swap = JSON.parse(
      ft_on_transfer_log_swap.slice(idx_swap) || ''
    );

    if (!!order_id) {
      // const buyAmount = parsed_ft_on_transfer_log_swap?.['data']?.[0]?.['amount_out'];

      const limitOrderAmount =
        Number(toReadableNumber(sellToken.decimals, original_amount || '0')) <
        0.01
          ? '< 0.01'
          : toPrecision(
              toReadableNumber(sellToken.decimals, original_amount || '0'),
              2
            );

      const swapAmount = toReadableNumber(
        sellToken.decimals,
        scientificNotationToString(
          new Big(original_deposit_amount || '0')
            .minus(original_amount || '0')
            .toString()
        )
      );

      let swapAmountOut =
        Number(swapAmount) == 0
          ? '0'
          : parsed_ft_on_transfer_log_swap?.['data']?.[0]?.['amount_out'];

      const buyToken = await ftGetTokenMetadata(buy_token);

      swapAmountOut = toReadableNumber(buyToken.decimals, swapAmountOut);

      LimitOrderPopUp({
        tokenSymbol: toRealSymbol(sellToken.symbol),
        swapAmount:
          Number(swapAmount) > 0 && Number(swapAmount) < 0.01
            ? '< 0.01'
            : toPrecision(swapAmount, 2, false, false),
        limitOrderAmount,
        tokenOutSymbol: toRealSymbol(buyToken.symbol),

        txHash,
        swapAmountOut:
          Number(swapAmountOut) > 0 && Number(swapAmountOut) < 0.01
            ? '< 0.01'
            : toPrecision(swapAmountOut, 2, false, false),
      });
    } else {
      const swapAmount = toReadableNumber(sellToken.decimals, parsedValue);

      let swapAmountOut =
        Number(swapAmount) == 0
          ? '0'
          : parsed_ft_on_transfer_log_swap?.['data']?.[0]?.['amount_out'];

      const buyToken = await ftGetTokenMetadata(buy_token);

      swapAmountOut = toReadableNumber(buyToken.decimals, swapAmountOut);

      // all swap
      LimitOrderPopUp({
        tokenSymbol: toRealSymbol(sellToken.symbol),
        swapAmount:
          Number(swapAmount) < 0.01
            ? '< 0.01'
            : toPrecision(swapAmount, 2, false, false),
        limitOrderAmount: null,
        txHash,
        tokenOutSymbol: toRealSymbol(buyToken.symbol),
        swapAmountOut:
          Number(swapAmountOut) > 0 && Number(swapAmountOut) < 0.01
            ? '< 0.01'
            : toPrecision(swapAmountOut, 2, false, false),
      });
    }

    // success pop up

    return true;

    // find ft_resolve_on tx
  };

  useEffect(() => {
    if (stopOnCross) return;
    if (txHash && getCurrentWallet().wallet.isSignedIn()) {
      checkTransaction(txHash)
        .then(async (res: any) => {
          const isLimitOrder = await parseLimitOrderPopUp(res);

          const transactionErrorType = getErrorMessage(res);
          const byNeth =
            res?.transaction?.actions?.[0]?.FunctionCall?.method_name ===
            'execute';

          const transaction = res.transaction;
          const isSwapNeth =
            res?.receipts?.[0]?.receipt?.Action?.actions?.[0]?.FunctionCall
              ?.method_name === 'ft_transfer_call' ||
            res?.receipts?.[0]?.receipt?.Action?.actions?.[0]?.FunctionCall
              ?.method_name === 'near_withdraw';
          return {
            isSwap:
              (transaction?.actions[1]?.['FunctionCall']?.method_name ===
                'ft_transfer_call' ||
                transaction?.actions[0]?.['FunctionCall']?.method_name ===
                  'ft_transfer_call' ||
                transaction?.actions[0]?.['FunctionCall']?.method_name ===
                  'swap' ||
                transaction?.actions[0]?.['FunctionCall']?.method_name ===
                  'near_deposit' ||
                transaction?.actions[0]?.['FunctionCall']?.method_name ===
                  'near_withdraw' ||
                (isSwapNeth && byNeth)) &&
              !isLimitOrder,
            transactionErrorType,
          };
        })
        .then(({ isSwap, transactionErrorType }) => {
          if (isSwap) {
            !transactionErrorType && !errorType && swapToast(txHash);
            transactionErrorType && failToast(txHash, transactionErrorType);
          }
          history.replace(pathname);
        });
    }
  }, [txHash, stopOnCross]);
};

export const useCrossSwapPopUp = (bestSwap: 'v2' | 'v3') => {
  const { txHash, pathname, errorType, txHashes } = getURLInfo();
  const history = useHistory();

  const { globalState } = useContext(WalletContext);

  const isSignedIn = globalState.isSignedIn;

  useSwapPopUp(bestSwap === 'v2');

  useEffect(() => {
    if (txHashes && txHashes.length > 0 && isSignedIn && bestSwap === 'v2') {
      checkCrossSwapTransactions(txHashes).then(
        async (res: { status: boolean; hash: string; errorType?: string }) => {
          const { status, hash, errorType } = res;

          if (errorType || !status) {
            failToast(hash, errorType);
          } else {
            swapToast(hash);
          }
        }
      );
      history.replace(pathname);
    }
  }, [txHashes, bestSwap]);
};
export const estimateValidator = (
  swapTodos: EstimateSwapView[],
  tokenIn: TokenMetadata,
  parsedAmountIn: string,
  tokenOut: TokenMetadata
) => {
  const tokenInId = swapTodos[0]?.inputToken;
  const tokenOutId = swapTodos[swapTodos.length - 1]?.outputToken;

  if (swapTodos && swapTodos?.[0]?.pool === null) return true;

  if (
    tokenInId !== tokenIn.id ||
    tokenOutId !== tokenOut.id ||
    !BigNumber.sum(
      ...swapTodos.map((st) => st.pool.partialAmountIn || 0)
    ).isEqualTo(parsedAmountIn)
  ) {
    return false;
  }
  return true;
};
export const useSwap = ({
  tokenIn,
  tokenInAmount,
  tokenOut,
  slippageTolerance,
  setLoadingData,
  loadingData,
  loadingTrigger,
  setLoadingTrigger,
  loadingPause,
  swapMode,
  reEstimateTrigger,
  supportLedger,
}: SwapOptions) => {
  const [pool, setPool] = useState<Pool>();
  const [canSwap, setCanSwap] = useState<boolean>();
  const [tokenOutAmount, setTokenOutAmount] = useState<string>('');
  const [swapError, setSwapError] = useState<Error>();
  const [swapsToDo, setSwapsToDo] = useState<EstimateSwapView[]>();
  const [quoteDone, setQuoteDone] = useState<boolean>(false);

  const [forceEstimate, setForceEstimate] = useState<boolean>(false);

  const [avgFee, setAvgFee] = useState<number>(0);

  const [estimating, setEstimating] = useState<boolean>(false);

  const { pathname, txHash, errorType } = getURLInfo();

  const history = useHistory();
  const [count, setCount] = useState<number>(0);

  let minAmountOut = tokenOutAmount
    ? percentLess(slippageTolerance, tokenOutAmount)
    : null;
  const refreshTime = Number(POOL_TOKEN_REFRESH_INTERVAL) * 1000;
  const intl = useIntl();

  const setAverageFee = (estimates: EstimateSwapView[]) => {
    const estimate = estimates[0];

    let avgFee: number = 0;
    if (estimates.length === 1) {
      avgFee = estimates[0].pool.fee;
    } else if (
      estimate.status === PoolMode.SMART ||
      estimate.status === PoolMode.STABLE
    ) {
      avgFee = estimates.reduce((pre, cur) => pre + cur.pool.fee, 0);
    } else {
      avgFee = getAverageFeeForRoutes(
        estimate.allRoutes,
        estimate.allNodeRoutes,
        estimate.totalInputAmount
      );
    }
    setAvgFee(avgFee);
  };

  const getEstimate = () => {
    setCanSwap(false);
    setQuoteDone(false);

    if (tokenIn && tokenOut && tokenIn.id !== tokenOut.id) {
      setSwapError(null);
      if (!tokenInAmount || ONLY_ZEROS.test(tokenInAmount)) {
        setTokenOutAmount('0');
        return;
      }
      setEstimating(true);
      estimateSwap({
        tokenIn,
        tokenOut,
        amountIn: tokenInAmount,
        intl,
        setLoadingData,
        loadingTrigger: loadingTrigger && !loadingPause,
        swapMode,
        supportLedger,
      })
        .then(async ({ estimates, tag }) => {
          if (!estimates) throw '';
          if (
            localStorage.getItem(SUPPORT_LEDGER_KEY) &&
            estimates?.length > 1
          ) {
            return;
          }

          if (tokenInAmount && !ONLY_ZEROS.test(tokenInAmount)) {
            setAverageFee(estimates);

            setSwapError(null);
            const expectedOut = (
              await getExpectedOutputFromActions(
                estimates,
                tokenOut.id,
                slippageTolerance
              )
            ).toString();
            setTokenOutAmount(expectedOut);
            setSwapsToDo(estimates);
            setCanSwap(true);
          }

          setPool(estimates[0].pool);
        })
        .catch((err) => {
          if (!loadingTrigger) {
            setCanSwap(false);
            setTokenOutAmount('');
            setSwapError(err);
          }
        })
        .finally(() => {
          setLoadingTrigger(false);
          setQuoteDone(true);
          setForceEstimate(false);
          setLoadingTrigger(false);
          setEstimating(false);
        });
    } else if (
      tokenIn &&
      tokenOut &&
      !tokenInAmount &&
      ONLY_ZEROS.test(tokenInAmount) &&
      tokenIn.id !== tokenOut.id
    ) {
      setTokenOutAmount('0');
    }
  };

  useEffect(() => {
    const valRes =
      !swapError &&
      swapsToDo &&
      tokenIn &&
      tokenOut &&
      estimateValidator(
        swapsToDo,
        tokenIn,
        toNonDivisibleNumber(tokenIn?.decimals || 24, tokenInAmount),
        tokenOut
      );
    if (estimating && swapsToDo && !forceEstimate) return;

    if (valRes && !loadingTrigger && !forceEstimate) return;

    getEstimate();
  }, [
    loadingTrigger,
    loadingPause,
    tokenIn,
    tokenOut,
    tokenInAmount,
    reEstimateTrigger,
    supportLedger,
    forceEstimate,
  ]);

  useEffect(() => {
    const valRes =
      swapsToDo &&
      tokenIn &&
      tokenOut &&
      estimateValidator(
        swapsToDo,
        tokenIn,
        toNonDivisibleNumber(tokenIn?.decimals || 24, tokenInAmount),
        tokenOut
      );

    if (estimating && swapsToDo && !forceEstimate) return;

    if (((valRes && !loadingTrigger) || swapError) && !forceEstimate) return;
    getEstimate();
  }, [estimating]);

  useEffect(() => {
    // setEstimating(false);
    setForceEstimate(true);
  }, [
    tokenIn?.id,
    tokenOut?.id,
    tokenIn?.symbol,
    tokenOut?.symbol,
    supportLedger,
    swapMode,
  ]);

  useEffect(() => {
    let id: any = null;
    if (!loadingTrigger && !loadingPause) {
      id = setInterval(() => {
        setLoadingTrigger(true);
        setCount(count + 1);
      }, refreshTime);
    } else {
      clearInterval(id);
    }
    return () => {
      clearInterval(id);
    };
  }, [count, loadingTrigger, loadingPause]);

  const makeSwap = (useNearBalance: boolean) => {
    swap({
      slippageTolerance,
      swapsToDo,
      tokenIn,
      amountIn: tokenInAmount,
      tokenOut,
      useNearBalance,
    }).catch(setSwapError);
  };
  return {
    canSwap,
    tokenOutAmount,
    minAmountOut,
    pool,
    setCanSwap,
    swapError,
    makeSwap,
    avgFee,
    pools: swapsToDo?.map((estimate) => estimate.pool),
    swapsToDo,
    isParallelSwap: swapsToDo?.every((e) => e.status === PoolMode.PARALLEL),
    isSmartRouteV2Swap: swapsToDo?.every((e) => e.status !== PoolMode.SMART),
    quoteDone,
  };
};
export const useSwapV3 = ({
  tokenIn,
  tokenInAmount,
  tokenOut,
  slippageTolerance,
  swapMode,
  loadingTrigger,
  wrapOperation,
  swapError,
  setLoadingTrigger,
}: SwapV3Options) => {
  const [tokenOutAmount, setTokenOutAmount] = useState<string>('');

  const [bestPool, setBestPool] = useState<PoolInfo>();

  const [quoteDone, setQuoteDone] = useState<boolean>(false);

  const [poolReFetch, setPoolReFetch] = useState<boolean>(false);

  const [bestEstimate, setBestEstimate] =
    useState<{ amount: string; tag: string }>();

  const [estimates, setEstimates] =
    useState<{ amount: string; tag: string }[]>();

  const [displayPriceImpact, setDisplayPriceImpact] = useState<string>('');

  const intl = useIntl();

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

  const fees = V3_POOL_FEE_LIST;

  const tagValidator = (
    bestEstimate: { amount: string; tag: string },
    tokenIn: TokenMetadata,
    tokenInAmount: string
  ) => {
    if (!bestEstimate) return false;

    const tagInfo = bestEstimate?.tag?.split('|');

    return (
      !!bestEstimate &&
      !!bestEstimate?.tag &&
      tagInfo?.[0] === tokenIn?.id &&
      tagInfo?.[2] === tokenInAmount
    );
  };

  const getQuote = async (
    fee: number,
    tokenIn: TokenMetadata,
    tokenOut: TokenMetadata,
    allDCLPools: PoolInfo[]
  ) => {
    const pool_id = getV3PoolId(tokenIn.id, tokenOut.id, fee);

    const foundPool = allDCLPools.find((p) => p.pool_id === pool_id);

    const validator =
      foundPool &&
      Number(foundPool?.total_x || 0) + Number(foundPool?.total_y || 0) > 0;

    if (!validator) return null;

    if (foundPool && foundPool.state === 'Paused') return null;

    // return null;

    return quote({
      pool_ids: [pool_id],
      input_token: tokenIn,
      output_token: tokenOut,
      input_amount: tokenInAmount,
      tag: `${tokenIn.id}|${fee}|${tokenInAmount}`,
    }).catch((e) => null);
  };

  const bestFee = bestEstimate?.tag?.split('|')?.[1]
    ? Number(bestEstimate?.tag?.split('|')?.[1])
    : null;

  useEffect(() => {
    if (!bestFee || wrapOperation) return;

    get_pool_from_cache(
      getV3PoolId(tokenIn.id, tokenOut.id, bestFee),
      tokenIn.id
    )
      .then(setBestPool)
      .finally(() => {});
  }, [bestFee, tokenIn, tokenOut, poolReFetch]);

  useEffect(() => {
    if (!tokenIn || !tokenOut || !tokenInAmount || wrapOperation) return;

    setQuoteDone(false);

    const storedPools = localStorage.getItem(REF_DCL_POOL_CACHE_KEY);

    if (!storedPools) return null;

    const allDCLPools = JSON.parse(
      localStorage.getItem(REF_DCL_POOL_CACHE_KEY)
    );

    Promise.all(
      fees.map((fee) => getQuote(fee, tokenIn, tokenOut, allDCLPools))
    )
      .then((res) => {
        if (!loadingTrigger || swapError?.message) {
          setEstimates(res);

          const bestEstimate =
            res && res?.some((e) => !!e)
              ? _.maxBy(res, (e) => Number(!e?.tag ? -1 : e.amount))
              : null;

          setBestEstimate(bestEstimate);

          if (
            bestEstimate &&
            !loadingTrigger &&
            (tagValidator(bestEstimate, tokenIn, tokenInAmount) ||
              res?.every((e) => !e || e?.tag === null))
          ) {
            setTokenOutAmount(
              toReadableNumber(tokenOut?.decimals || 24, bestEstimate.amount)
            );
          }
        }
      })
      .catch((e) => {})
      .finally(() => {
        setQuoteDone(true);
        setPoolReFetch(!poolReFetch);
        setLoadingTrigger && setLoadingTrigger(false);
      });
  }, [tokenIn, tokenOut, tokenInAmount, loadingTrigger, swapError?.message]);

  const makeSwap = () => {
    if (!tagValidator(bestEstimate, tokenIn, tokenInAmount)) return;

    v3Swap({
      Swap: {
        pool_ids: [getV3PoolId(tokenIn.id, tokenOut.id, bestFee)],
        min_output_amount: percentLess(slippageTolerance, bestEstimate.amount),
      },
      swapInfo: {
        tokenA: tokenIn,
        tokenB: tokenOut,
        amountA: tokenInAmount,
        amountB: toReadableNumber(tokenOut.decimals, bestEstimate.amount),
      },
    });
  };

  const priceImpact = useMemo(() => {
    try {
      const curPoint =
        tokenIn.id === bestPool.token_x
          ? bestPool.current_point
          : -1 * bestPool.current_point;

      const curPrice = pointToPrice({
        tokenA: tokenIn,
        tokenB: tokenOut,
        point: curPoint,
      });

      const newPrice = new Big(tokenInAmount).div(tokenOutAmount).toNumber();

      const pi = new Big(newPrice)
        .minus(new Big(1).div(curPrice))
        .div(newPrice)
        .times(100)
        .minus(bestFee / 10000)
        .toString();

      return scientificNotationToString(pi);
    } catch (error) {
      return '0';
    }
  }, [tokenOutAmount, bestPool, tokenIn, tokenOut, estimates]);
  useEffect(() => {
    if (!quoteDone) return;
    setDisplayPriceImpact(priceImpact || '0');
  }, [
    poolReFetch,
    tokenOutAmount,
    bestEstimate?.tag,
    bestEstimate?.amount,
    bestEstimate,
    estimates,
    quoteDone,
    priceImpact,
  ]);
  function getCanSwapCondition() {
    const condition1 =
      quoteDone &&
      bestEstimate &&
      !ONLY_ZEROS.test(bestEstimate.amount) &&
      tagValidator(bestEstimate, tokenIn, tokenInAmount);
    const condition2 = swapMode !== SWAP_MODE.NORMAL;
    return condition1 || condition2;
  }
  return {
    makeSwap,
    // canSwap:
    //   (quoteDone &&  tagValidator(bestEstimate, tokenIn, tokenInAmount)) ||
    //   swapMode !== SWAP_MODE.NORMAL,
    canSwap: getCanSwapCondition(),
    tokenOutAmount,
    canSwapPro: quoteDone && tagValidator(bestEstimate, tokenIn, tokenInAmount),
    priceImpact: displayPriceImpact,
    minAmountOut: tokenOutAmount
      ? percentLess(slippageTolerance, tokenOutAmount)
      : null,
    quoteDone:
      quoteDone &&
      (tagValidator(bestEstimate, tokenIn, tokenInAmount) ||
        estimates?.every((e) => !e || e?.tag === null)),
    bestFee,
    bestPool,
    setQuoteDone,
    swapErrorV3: (
      quoteDone && !bestEstimate
        ? true
        : bestEstimate && ONLY_ZEROS.test(bestEstimate.amount)
    )
      ? tokenIn && tokenOut && NoPoolError()
      : null,
  };
};

export const useLimitOrder = ({
  tokenIn,
  swapMode,
  tokenOut,
  selectedV3LimitPool,
  setSelectedV3LimitPool,
  loadingTrigger,
  tokenPriceList,
}: {
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  swapMode: SWAP_MODE;
  selectedV3LimitPool: string;
  setSelectedV3LimitPool?: (pool: string) => void;
  loadingTrigger?: boolean;
  tokenPriceList: Record<string, any>;
}) => {
  const price_x = tokenPriceList?.[tokenIn?.id]?.price;

  const price_y = tokenPriceList?.[tokenOut?.id]?.price;

  const notLimitMode = swapMode !== SWAP_MODE.LIMIT;

  const [quoteDone, setQuoteDone] = useState<boolean>(false);

  const [pools, setPools] = useState<(PoolInfo | null)[]>();

  const [mostPoolDetail, setMostPoolDetail] = useState<PoolInfo>();

  const [poolToOrderCounts, setPoolToOrderCounts] = useState<{
    [key: string]: string | null;
  }>();
  const [everyPoolTvl, setEveryPoolTvl] =
    useState<{ [key: string]: string | null }>();
  useEffect(() => {
    if (!selectedV3LimitPool) return;
    setQuoteDone(false);
    get_pool(selectedV3LimitPool, tokenIn.id)
      .then((res) => {
        if (res.state === 'Paused') {
          setMostPoolDetail(null);
          return null;
        }
        setMostPoolDetail(res);
      })
      .catch((e) => {
        console.error('fetch pool error', e);

        setMostPoolDetail(null);
      })
      .finally(() => {
        setQuoteDone(true);
      });
  }, [selectedV3LimitPool, loadingTrigger, swapMode]);

  useEffect(() => {
    if (notLimitMode || !tokenIn || !tokenOut) {
      return null;
    }
    Promise.all(
      V3_POOL_FEE_LIST.map((fee) =>
        get_pool(getV3PoolId(tokenIn.id, tokenOut.id, fee), tokenIn.id)
      )
    )
      .then((res) => {
        setPools(res);

        const counts = res?.map((r: PoolInfo) => {
          if (!r) return 0;
          const tokenX = r.token_x === tokenIn.id ? tokenIn : tokenOut;
          const tokenY = r.token_y === tokenOut.id ? tokenOut : tokenIn;

          const priceX = r.token_x === tokenIn.id ? price_x : price_y;
          const priceY = r.token_y === tokenOut.id ? price_y : price_x;
          const { total_x, total_y, total_fee_x_charged, total_fee_y_charged } =
            r;
          const totalX = new BigNumber(total_x)
            .minus(total_fee_x_charged)
            .toFixed();
          const totalY = new BigNumber(total_y)
            .minus(total_fee_y_charged)
            .toFixed();
          const tvlx = new Big(toReadableNumber(tokenX.decimals, totalX))
            .times(priceX || '0')
            .toNumber();

          const tvly = new Big(toReadableNumber(tokenY.decimals, totalY))
            .times(priceY || '0')
            .toNumber();

          return tvlx + tvly;
        });

        const sumOfCounts = _.sum(counts);

        const rawPercents =
          sumOfCounts === 0
            ? ['0', '0', '0', '0']
            : counts.map((c) =>
                scientificNotationToString(((c / sumOfCounts) * 100).toString())
              );

        const nonZeroIndexes: number[] = [];

        rawPercents.forEach((p, index) => {
          if (Number(p) > 0) {
            nonZeroIndexes.push(index);
          }
        });

        const nonZeroPercents = rawPercents.filter((r) => Number(r) > 0);

        const checkedNonZero = getAllocationsLeastOne(nonZeroPercents);

        const finalPercents = rawPercents.map((p, index) => {
          if (nonZeroIndexes.includes(index)) {
            const newP = checkedNonZero[nonZeroIndexes.indexOf(index)];
            return newP;
          }
          return p;
        });

        const percents =
          sumOfCounts === 0 ? ['0', '0', '0', '0'] : finalPercents;

        const percensNew = percents.map((p, i) => (!!res[i] ? p : null));

        const toCounts = percensNew.reduce((acc, cur, index) => {
          return {
            ...acc,
            [getV3PoolId(tokenIn.id, tokenOut.id, V3_POOL_FEE_LIST[index])]:
              cur,
          };
        }, {});

        if (
          res?.some(
            (r) => !!r && (Number(r?.total_x) > 0 || Number(r?.total_y) > 0)
          ) &&
          percents.every((p) => Number(p) === 0)
        )
          return;
        const temp = {};
        Object.keys(toCounts).forEach((pool_id: string, index) => {
          temp[pool_id] = toCounts[pool_id] ? counts[index] : null;
        });
        setEveryPoolTvl(temp);
        setPoolToOrderCounts(toCounts);
      })
      .catch((e) => {
        console.log(e);

        const allPoolsForThisPair = V3_POOL_FEE_LIST.map((fee) =>
          getV3PoolId(tokenIn.id, tokenOut.id, fee)
        );
        setSelectedV3LimitPool(allPoolsForThisPair[2]);
      });
  }, [tokenIn?.id, tokenOut?.id, tokenPriceList, swapMode]);

  useEffect(() => {
    if (!poolToOrderCounts) return null;

    const countValues = Object.values(poolToOrderCounts);

    const maxOrderIndex = countValues.findIndex(
      (c) => !!c && c === _.maxBy(countValues, (o) => Number(o || 0))
    );
    const allPoolsForThisPair = V3_POOL_FEE_LIST.map((fee) =>
      getV3PoolId(tokenIn.id, tokenOut.id, fee)
    );

    if (countValues.every((v) => v === countValues[0])) {
      setSelectedV3LimitPool(allPoolsForThisPair[2]);
    } else {
      setSelectedV3LimitPool(
        allPoolsForThisPair[maxOrderIndex === -1 ? 2 : maxOrderIndex]
      );
    }
  }, [
    Object.keys(poolToOrderCounts || {}).join('-'),
    Object.values(poolToOrderCounts || {}).join('-'),
    tokenPriceList,
    swapMode,
  ]);

  return {
    poolPercents: notLimitMode ? null : poolToOrderCounts,
    fee: !selectedV3LimitPool
      ? null
      : Number(selectedV3LimitPool.split(V3_POOL_SPLITER)[2]),
    mostPoolDetail,
    quoteDone,
    idToPools: pools,
    setQuoteDone,
    everyPoolTvl,
  };
};

export const useStableSwap = ({
  tokenIn,
  tokenInAmount,
  tokenOut,
  slippageTolerance,
  loadingTrigger,
  setLoadingTrigger,
  stablePool,
}: SwapOptions) => {
  const [pool, setPool] = useState<Pool>();
  const [canSwap, setCanSwap] = useState<boolean>();
  const [tokenOutAmount, setTokenOutAmount] = useState<string>('');
  const [swapError, setSwapError] = useState<Error>();
  const [noFeeAmount, setNoFeeAmount] = useState<string>('');
  const [tokenInAmountMemo, setTokenInAmountMemo] = useState<string>('');
  const history = useHistory();

  const { txHash, pathname, errorType } = getURLInfo();

  const minAmountOut = tokenOutAmount
    ? percentLess(slippageTolerance, tokenOutAmount)
    : null;

  const intl = useIntl();

  const getEstimate = () => {
    setCanSwap(false);
    if (tokenIn && tokenOut && tokenIn.id !== tokenOut.id) {
      setSwapError(null);

      estimateStableSwap({
        tokenIn,
        tokenOut,
        amountIn: tokenInAmount,
        intl,
        loadingTrigger,
        setLoadingTrigger,
        StablePoolInfo: stablePool,
        setCanSwap,
      })
        .then(({ estimate, pool, dy }) => {
          if (!estimate || !pool) throw '';
          if (tokenInAmount && !ONLY_ZEROS.test(tokenInAmount)) {
            setCanSwap(true);
            if (!loadingTrigger) {
              setNoFeeAmount(dy);
              setTokenOutAmount(estimate);
            }
            setPool(pool);
          }
        })
        .catch((err) => {
          setCanSwap(false);
          setTokenOutAmount('');
          setNoFeeAmount('');
          setSwapError(err);
        });
    } else if (
      tokenIn &&
      tokenOut &&
      !tokenInAmount &&
      ONLY_ZEROS.test(tokenInAmount) &&
      tokenIn.id !== tokenOut.id
    ) {
      setTokenOutAmount('0');
    }
  };

  useEffect(() => {
    if (txHash && getCurrentWallet()?.wallet?.isSignedIn()) {
      checkTransaction(txHash)
        .then((res: any) => {
          const slippageErrorPattern = /ERR_MIN_AMOUNT|slippage error/i;

          const isSlippageError = res.receipts_outcome.some((outcome: any) => {
            return slippageErrorPattern.test(
              outcome?.outcome?.status?.Failure?.ActionError?.kind
                ?.FunctionCallError?.ExecutionError
            );
          });

          const transaction = res.transaction;
          return {
            isSwap:
              transaction?.actions[1]?.['FunctionCall']?.method_name ===
                'ft_transfer_call' ||
              transaction?.actions[0]?.['FunctionCall']?.method_name ===
                'ft_transfer_call' ||
              transaction?.actions[0]?.['FunctionCall']?.method_name === 'swap',
            isSlippageError,
          };
        })
        .then(({ isSwap, isSlippageError }) => {
          if (isSwap) {
            !isSlippageError && !errorType && swapToast(txHash);
            isSlippageError && failToast(txHash, 'Slippage Violation');
          }
          history.replace(pathname);
        });
    }
  }, [txHash]);

  useEffect(() => {
    setTokenInAmountMemo(tokenInAmount);
    if (loadingTrigger && !ONLY_ZEROS.test(tokenInAmountMemo)) return;

    getEstimate();
  }, [tokenIn, tokenOut, tokenInAmount]);

  useEffect(() => {
    getEstimate();
  }, [loadingTrigger]);

  const makeSwap = (useNearBalance: boolean) => {
    stableSwap({
      pool,
      tokenIn,
      amountIn: tokenInAmount,
      tokenOut,
      minAmountOut,
      useNearBalance,
    }).catch(setSwapError);
  };

  return {
    canSwap,
    tokenOutAmount,
    minAmountOut,
    pool,
    swapError,
    makeSwap,
    noFeeAmount,
  };
};

export const useCrossSwap = ({
  tokenIn,
  tokenInAmount,
  tokenOut,
  slippageTolerance,
  supportLedger,
  loadingTrigger,
  setLoadingTrigger,
  loadingPause,
  wrapOperation,
}: SwapOptions) => {
  const [pool, setPool] = useState<Pool>();
  const [canSwap, setCanSwap] = useState<boolean>();
  const [tokenOutAmount, setTokenOutAmount] = useState<string>('');
  const [swapError, setSwapError] = useState<Error>();
  const [swapsToDo, setSwapsToDo] = useState<EstimateSwapView[]>();

  const [crossQuoteDone, setCrossQuoteDone] = useState<boolean>(false);

  const [swapsToDoRef, setSwapsToDoRef] = useState<EstimateSwapView[]>();

  const [swapsToDoTri, setSwapsToDoTri] = useState<EstimateSwapView[]>();

  const [avgFee, setAvgFee] = useState<number>(0);

  const [count, setCount] = useState<number>(0);
  const refreshTime = Number(POOL_TOKEN_REFRESH_INTERVAL) * 1000;

  const minAmountOut = tokenOutAmount
    ? percentLess(slippageTolerance, tokenOutAmount)
    : null;

  const intl = useIntl();

  const getAvgFee = (estimates: EstimateSwapView[]) => {
    let avgFee: number = 0;

    try {
      const estimate = estimates[0];
      if (estimates.length === 1) {
        avgFee = estimates[0].pool.fee;
      } else if (
        estimate.status === PoolMode.SMART ||
        estimate.status === PoolMode.STABLE
      ) {
        avgFee = estimates.reduce((pre, cur) => pre + cur.pool.fee, 0);
      } else {
        avgFee = getAverageFeeForRoutes(
          estimate.allRoutes,
          estimate.allNodeRoutes,
          estimate.totalInputAmount
        );
      }
    } catch (error) {}

    return avgFee;
  };

  const setAverageFee = (estimates: EstimateSwapView[]) => {
    if (!estimates || estimates.length === 0) return;

    const avgFee = getAvgFee(estimates);
    setAvgFee(avgFee);
  };

  const getEstimateCrossSwap = (proGetCachePool?: boolean) => {
    if (wrapOperation) {
      setLoadingTrigger(false);
      setCanSwap(true);
      return;
    }
    if (!tokenIn || !tokenOut || tokenIn?.id === tokenOut?.id) return;

    estimateSwap({
      tokenIn,
      tokenOut,
      amountIn: tokenInAmount,
      intl,
      loadingTrigger: loadingTrigger && !loadingPause,
      proGetCachePool,
      supportLedger,
      swapPro: true,
      setSwapsToDoRef,
      setSwapsToDoTri,
    })
      .then(({ estimates }) => {
        if (localStorage.getItem(SUPPORT_LEDGER_KEY) && estimates?.length > 1) {
          return;
        }
        if (tokenInAmount && !ONLY_ZEROS.test(tokenInAmount)) {
          setAverageFee(estimates);

          setSwapsToDo(estimates);
          setCanSwap(true);
        }

        setPool(estimates[0].pool);
        setCrossQuoteDone(true);
        setLoadingTrigger(false);
      })
      .catch((err) => {
        setCanSwap(false);
        setTokenOutAmount('');
        setSwapError(err);
        setCrossQuoteDone(true);
        setLoadingTrigger(false);
        // setSwapsToDoRef([]);
        // setSwapsToDoTri([])
      })
      .finally(() => {
        setLoadingTrigger(false);
      });
  };

  useEffect(() => {
    if (!swapsToDo) return;
    getExpectedOutputFromActions(
      swapsToDo,
      tokenOut.id,
      slippageTolerance
    ).then((res: any) => setTokenOutAmount(res.toString()));
  }, [swapsToDo, slippageTolerance]);

  useEffect(() => {
    if (ONLY_ZEROS.test(tokenInAmount)) {
      setCrossQuoteDone(false);
      return;
    }
    setCanSwap(false);
    setSwapError(null);

    setCrossQuoteDone(false);

    getEstimateCrossSwap(true);
  }, [
    [tokenIn?.id, tokenOut?.id].sort().join('-'),
    // tokenIn,
    // tokenOut,
  ]);

  useEffect(() => {
    if (ONLY_ZEROS.test(tokenInAmount)) {
      setCrossQuoteDone(false);
      return;
    }
    setCanSwap(false);
    setSwapError(null);

    setCrossQuoteDone(false);

    getEstimateCrossSwap(loadingTrigger);
  }, [
    loadingTrigger,
    // tokenIn,
    // tokenOut,
  ]);

  useEffect(() => {
    if (ONLY_ZEROS.test(tokenInAmount)) {
      setCrossQuoteDone(false);
      return;
    }
    setCanSwap(false);
    setSwapError(null);

    setCrossQuoteDone(false);
    getEstimateCrossSwap(false);
  }, [supportLedger, tokenInAmount, [tokenIn?.id, tokenOut?.id].join('-')]);

  useEffect(() => {
    let id: any = null;
    if (!loadingTrigger && !loadingPause) {
      id = setInterval(() => {
        setLoadingTrigger(true);
        setCount(count + 1);
      }, refreshTime);
    } else {
      clearInterval(id);
    }
    return () => {
      clearInterval(id);
    };
  }, [count, loadingTrigger, loadingPause]);

  return {
    canSwap,
    tokenOutAmount,
    minAmountOut,
    pool,
    setCanSwap,
    swapError,
    avgFee,
    pools: swapsToDo?.map((estimate) => estimate.pool),
    swapsToDo,
    setSwapError,
    swapsToDoRef,
    swapsToDoTri,
    crossQuoteDone,
    refAmountOut:
      tokenOut && swapsToDoRef && !wrapOperation
        ? getExpectedOutputFromActionsORIG(swapsToDoRef, tokenOut.id)
        : '',
    refAvgFee: swapsToDoRef && !wrapOperation ? getAvgFee(swapsToDoRef) : 0,
    triAvgFee: swapsToDoTri && !wrapOperation ? getAvgFee(swapsToDoTri) : 0,
    setCrossQuoteDone,
  };
};

export const usePriceImpact = ({
  swapsToDo,
  tokenIn,
  tokenOut,
  tokenInAmount,
  tokenOutAmount,
}: {
  swapsToDo: EstimateSwapView[];
  tokenInAmount: string;
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  tokenOutAmount: string;
}) => {
  let PriceImpactValue: string = '0';

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

  return PriceImpactValue;
};
