import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  getPool,
  Pool,
  StablePool,
  getStablePool,
  addLiquidityToPool,
} from '../services/pool';
import { estimateSwap as estimateStableSwap } from '../services/stable-swap';

import db from '../store/RefDatabase';

import { TokenMetadata, ftGetTokenMetadata } from '../services/ft-contract';
import {
  calculateMarketPrice,
  calculateSmartRoutingPriceImpact,
  percentLess,
  scientificNotationToString,
  separateRoutes,
  toNonDivisibleNumber,
  toReadableNumber,
} from '../utils/numbers';

import {
  checkTransaction,
  estimateSwap,
  estimateSwapAurora,
  estimateSwapFlow,
  PoolMode,
  REF_FI_SWAP_SIGNAL,
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
  isStablePool,
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
import {
  ExchangeEstimate,
  SWAP_MODE,
  SWAP_TYPE,
  SwapMarket,
  SwapProContext,
  TradeEstimates,
} from '../pages/SwapPage';
import {
  getErrorMessage,
  parsedArgs,
} from '../components/layout/transactionTipPopUp';
import {
  checkTransactionStatus,
  EstimateSwapView,
  swap,
} from '../services/swap';
import { checkCrossSwapTransactions } from '../components/layout/transactionTipPopUp';
import {
  getLimitOrderRangeCountAndPool,
  get_pool,
  PoolInfo,
  quote,
  v3Swap,
  V3_POOL_FEE_LIST,
  V3_POOL_SPLITER,
  cacheAllDCLPools,
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
import {
  calcStableSwapPriceImpact,
  calculateSmartRoutesV2PriceImpact,
} from '../utils/numbers';
import {
  OrderlyContext,
  useOrderlyContext,
} from '~pages/Orderly/orderly/OrderlyContext';
import { useWalletSelector } from '~context/WalletSelectorContext';
import { getAccountInformation } from '~pages/Orderly/orderly/off-chain-api';
import { ClientInfo, Orders } from '~pages/Orderly/orderly/type';
import { parseSymbol } from '~pages/Orderly/components/RecentTrade';
import { getTopPoolsIndexer, getTopPoolsIndexerRaw } from '../services/indexer';
import { SUPPORT_LEDGER_KEY } from '../components/swap/SwapCard';
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
  reEstimatingPro?: boolean;
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
  reEstimatingPro?: boolean;
}

export const useSwapPopUp = () => {
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

  const swapSig = localStorage.getItem(REF_FI_SWAP_SIGNAL);
  useEffect(() => {
    if (swapSig === 'tri') return;
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
  }, [txHash]);
};

export const useCrossSwapPopUp = () => {
  const { pathname, txHashes } = getURLInfo();
  const history = useHistory();

  const { globalState } = useContext(WalletContext);

  const isSignedIn = globalState.isSignedIn;

  const swapSig = localStorage.getItem(REF_FI_SWAP_SIGNAL);

  useEffect(() => {
    if (txHashes && txHashes.length > 0 && isSignedIn && swapSig === 'tri') {
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
  }, [txHashes]);
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
    !BigNumber.sum(...swapTodos.map((st) => st.partialAmountIn || 0)).isEqualTo(
      parsedAmountIn
    ) ||
    (!!localStorage.getItem(SUPPORT_LEDGER_KEY) && swapTodos?.length > 1)
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
  loadingTrigger,
  setLoadingTrigger,
  loadingPause,
  reEstimateTrigger,
  supportLedger,
}: SwapOptions) => {
  const [pool, setPool] = useState<Pool>();
  const [canSwap, setCanSwap] = useState<boolean>();

  const [tokenOutAmount, setTokenOutAmount] = useState<string>('');
  const [swapError, setSwapError] = useState<Error>();
  const [swapsToDo, setSwapsToDo] = useState<EstimateSwapView[]>();
  const [quoteDone, setQuoteDone] = useState<boolean>(false);

  const tokenPriceList = useTokenPriceList(loadingTrigger);

  const [forceEstimate, setForceEstimate] = useState<boolean>(false);

  const [priceImpactValue, setPriceImpactValue] = useState<string>('0');

  const [avgFee, setAvgFee] = useState<number>(0);

  const [estimating, setEstimating] = useState<boolean>(false);

  const [count, setCount] = useState<number>(0);

  let minAmountOut = tokenOutAmount
    ? percentLess(slippageTolerance, tokenOutAmount)
    : null;
  const refreshTime = Number(POOL_TOKEN_REFRESH_INTERVAL) * 1000;
  const intl = useIntl();

  const setAverageFee = (estimates: EstimateSwapView[]) => {
    let avgFee: number = 0;

    try {
      const routes = separateRoutes(estimates, tokenOut.id);

      routes.forEach((route) => {
        const allocation = new Big(route[0].partialAmountIn).div(
          new Big(toNonDivisibleNumber(tokenIn.decimals, tokenInAmount))
        );

        const routeFee = route.reduce(
          (acc, cur) => {
            return acc.plus(new Big(cur.pool.fee));
          },

          new Big(0)
        );

        avgFee += allocation.mul(routeFee).toNumber();
      });
    } catch (error) {}

    setAvgFee(avgFee);
  };

  const getEstimate = async () => {
    setCanSwap(false);
    setQuoteDone(false);

    if (tokenIn && tokenOut && tokenIn.id !== tokenOut.id) {
      if (!tokenInAmount || ONLY_ZEROS.test(tokenInAmount)) {
        setTokenOutAmount('0');
        setSwapsToDo(null);

        return;
      }
      setEstimating(true);

      console.log('real estimate ');

      estimateSwap({
        tokenIn,
        tokenOut,
        amountIn: tokenInAmount,
        intl,
        supportLedger,
        loadingTrigger,
      })
        .then(async ({ estimates: estimatesRes }) => {
          const estimates = estimatesRes.map((e) => ({
            ...e,
            partialAmountIn: e.pool.partialAmountIn,
          }));

          if (!estimates) throw '';

          if (
            localStorage.getItem(SUPPORT_LEDGER_KEY) &&
            estimates?.length > 1
          ) {
            setForceEstimate(false);
            setQuoteDone(false);
            return;
          }

          if (tokenInAmount && !ONLY_ZEROS.test(tokenInAmount)) {
            setAverageFee(estimates);
            setSwapError(null);

            const expectedOut = estimates.reduce(
              (acc, cur) =>
                acc.plus(
                  cur.outputToken === tokenOut.id ? cur.estimate || 0 : 0
                ),
              new Big(0)
            );

            const priceImpactValue = getPriceImpact({
              swapsToDo: estimates,
              tokenIn,
              tokenOut,
              tokenOutAmount: scientificNotationToString(
                expectedOut.toString()
              ),
              tokenInAmount,
              tokenPriceList,
            });

            setPriceImpactValue(priceImpactValue);

            setTokenOutAmount(
              scientificNotationToString(expectedOut.toString())
            );
            setSwapsToDo(estimates);
            setCanSwap(true);
            setQuoteDone(true);
          }

          setPool(estimates[0].pool);
        })
        .catch((err) => {
          console.log('error1111: ', err);
          // if (!loadingTrigger) {
          setCanSwap(false);
          setTokenOutAmount('');
          setSwapError(err);
          setQuoteDone(true);

          // }
        })
        .finally(() => {
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
    console.log('valRes: ', valRes);

    if (valRes && !loadingTrigger && !forceEstimate) {
      return;
    }

    getEstimate();
  }, [
    loadingTrigger,
    loadingPause,
    tokenIn,
    tokenOut,
    tokenInAmount,
    reEstimateTrigger,

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
    setForceEstimate(true);
  }, [
    tokenIn?.id,
    tokenOut?.id,
    tokenIn?.symbol,
    tokenOut?.symbol,
    supportLedger,
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

  const makeSwap = () => {
    swap({
      slippageTolerance,
      swapsToDo,
      tokenIn,
      amountIn: tokenInAmount,
      tokenOut,
      swapMarket: 'ref',
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
    quoteDone,
    priceImpactValue: scientificNotationToString(
      new Big(priceImpactValue).minus(new Big((avgFee || 0) / 100)).toString()
    ),
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
  console.log('tokenOutAmountv2v2: ', tokenOutAmount);

  const [bestPool, setBestPool] = useState<PoolInfo>();

  const [quoteDone, setQuoteDone] = useState<boolean>(false);

  const [poolReFetch, setPoolReFetch] = useState<boolean>(false);

  const [bestEstimate, setBestEstimate] =
    useState<{ amount: string; tag: string }>();

  const [estimates, setEstimates] =
    useState<{ amount: string; tag: string }[]>();

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
      .then((bestPool) => {
        setBestPool(bestPool);
      })
      .finally(() => {});
  }, [bestFee, tokenIn, tokenOut, poolReFetch]);

  useEffect(() => {
    if (!tokenIn || !tokenOut || !tokenInAmount || wrapOperation) return;

    setQuoteDone(false);

    console.log('tokenintrigger');

    const storedPools = localStorage.getItem(REF_DCL_POOL_CACHE_KEY);

    if (!storedPools) {
      setQuoteDone(true);
      return null;
    }

    const allDCLPools = JSON.parse(
      localStorage.getItem(REF_DCL_POOL_CACHE_KEY)
    );

    Promise.all(
      fees.map((fee) => getQuote(fee, tokenIn, tokenOut, allDCLPools))
    )
      .then((res) => {
        setEstimates(res);

        const bestEstimate =
          res && res?.some((e) => !!e)
            ? _.maxBy(res, (e) => Number(!e?.tag ? -1 : e.amount))
            : null;

        console.log(
          'bestEstimate: ',
          bestEstimate,
          tagValidator(bestEstimate, tokenIn, tokenInAmount)
        );

        setBestEstimate(bestEstimate);

        if (
          bestEstimate &&
          (tagValidator(bestEstimate, tokenIn, tokenInAmount) ||
            res?.every((e) => !e || e?.tag === null))
        ) {
          setTokenOutAmount(
            toReadableNumber(tokenOut?.decimals || 24, bestEstimate.amount)
          );

          return;
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

  function getCanSwapCondition() {
    const condition1 =
      quoteDone &&
      bestEstimate &&
      !ONLY_ZEROS.test(bestEstimate.amount) &&
      tagValidator(bestEstimate, tokenIn, tokenInAmount);
    return condition1;
  }

  const getPriceImpact = () => {
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
  };

  const priceImpact = useMemo(() => {
    try {
      return getPriceImpact();
    } catch (error) {
      return '0';
    }
  }, [quoteDone]);

  const swapsToDoV2: EstimateSwapView[] = [
    {
      estimate: tokenOutAmount,
      pool: null,
      routeInputToken: tokenIn?.id,
      inputToken: tokenIn?.id,
      outputToken: tokenOut?.id,
      token: tokenIn,
      tokens: [tokenIn, tokenOut],
      totalInputAmount: toNonDivisibleNumber(tokenIn?.decimals, tokenInAmount),
    },
  ];

  console.log(tokenInAmount, 'tokenInAmount 111', swapsToDoV2);

  return {
    makeSwap,
    canSwap: getCanSwapCondition(),
    tokenOutAmount,
    canSwapPro: quoteDone && tagValidator(bestEstimate, tokenIn, tokenInAmount),
    priceImpact: priceImpact,
    minAmountOut: tokenOutAmount
      ? percentLess(slippageTolerance, tokenOutAmount)
      : null,
    swapsToDoV2,
    quoteDone:
      quoteDone &&
      (tagValidator(bestEstimate, tokenIn, tokenInAmount) ||
        !estimates ||
        estimates?.every((e) => !e || e?.tag === null)),
    bestFee: bestFee === null ? null : bestFee / 100,
    fee: bestFee === null ? null : bestFee / 100,
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

export const useCrossSwap = ({
  tokenIn,
  tokenInAmount,
  tokenOut,
  slippageTolerance,
  loadingTrigger,
  setLoadingTrigger,
  loadingPause,
  wrapOperation,
}: SwapOptions): ExchangeEstimate => {
  const { enableTri, swapType } = useContext(SwapProContext);

  const [canSwap, setCanSwap] = useState<boolean>();
  const [tokenOutAmount, setTokenOutAmount] = useState<string>('');
  const [swapError, setSwapError] = useState<Error>();
  const [swapsToDo, setSwapsToDo] = useState<EstimateSwapView[]>();
  const tokenPriceList = useTokenPriceList(loadingTrigger);
  const [crossQuoteDone, setCrossQuoteDone] = useState<boolean>(false);

  const [priceImpact, setPriceImpact] = useState<string>('0');

  const [count, setCount] = useState<number>(0);
  const refreshTime = Number(POOL_TOKEN_REFRESH_INTERVAL) * 1000;

  const minAmountOut = tokenOutAmount
    ? percentLess(slippageTolerance, tokenOutAmount)
    : null;

  const intl = useIntl();

  const getAvgFee = (estimates: EstimateSwapView[]) => {
    let avgFee: number = 0;

    try {
      avgFee = estimates[0].pool.fee;
    } catch (error) {}

    return avgFee;
  };

  const getEstimateCrossSwap = (proGetCachePool?: boolean) => {
    if (wrapOperation || !enableTri) {
      setLoadingTrigger(false);
      setCanSwap(true);
      return;
    }
    if (!tokenIn || !tokenOut || tokenIn?.id === tokenOut?.id) return;

    console.log('real estimate aurora');

    estimateSwapAurora({
      tokenIn,
      tokenOut,
      amountIn: tokenInAmount,
      intl,
      loadingTrigger: loadingTrigger && !loadingPause,
      proGetCachePool,
      swapPro: true,
    })
      .then(({ estimates: estimatesRes }) => {
        const estimates = estimatesRes.map((e) => ({
          ...e,
          partialAmountIn: e.pool.partialAmountIn,
          totalInputAmount: e.pool.partialAmountIn,
        }));
        if (tokenInAmount && !ONLY_ZEROS.test(tokenInAmount)) {
          setTokenOutAmount(estimates[0].estimate);
          setSwapsToDo(estimates);
          setCanSwap(true);

          const priceImpact = getPriceImpact({
            swapsToDo: swapsToDo,
            tokenIn,
            tokenOut,
            tokenInAmount,
            tokenOutAmount: swapsToDo?.[0]?.estimate || '0',
            tokenPriceList,
          });

          setPriceImpact(priceImpact);
        }

        setCrossQuoteDone(true);
        setLoadingTrigger(false);
      })
      .catch((err) => {
        setCanSwap(false);
        setTokenOutAmount('');
        setSwapError(err);
        setCrossQuoteDone(true);
        setLoadingTrigger(false);
      })
      .finally(() => {
        setLoadingTrigger(false);
      });
  };

  useEffect(() => {
    if (ONLY_ZEROS.test(tokenInAmount)) {
      setCrossQuoteDone(false);
      return;
    }
    setCanSwap(false);
    setSwapError(null);

    setCrossQuoteDone(false);

    getEstimateCrossSwap(true);
  }, [[tokenIn?.id, tokenOut?.id].sort().join('-'), enableTri]);

  useEffect(() => {
    if (ONLY_ZEROS.test(tokenInAmount)) {
      setCrossQuoteDone(false);
      return;
    }
    setCanSwap(false);
    setSwapError(null);

    setCrossQuoteDone(false);

    getEstimateCrossSwap(loadingTrigger);
  }, [loadingTrigger, enableTri]);

  useEffect(() => {
    if (ONLY_ZEROS.test(tokenInAmount)) {
      setCrossQuoteDone(false);
      return;
    }
    setCanSwap(false);
    setSwapError(null);

    setCrossQuoteDone(false);
    getEstimateCrossSwap(false);
  }, [tokenInAmount, [tokenIn?.id, tokenOut?.id].join('-'), enableTri]);

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

  const makeSwap = () => {
    swap({
      slippageTolerance,
      swapsToDo,
      tokenIn,
      amountIn: tokenInAmount,
      tokenOut,
      swapMarket: 'tri',
    }).catch(setSwapError);
  };

  return {
    canSwap,
    tokenOutAmount: !!tokenOutAmount
      ? toPrecision(tokenOutAmount || '0', Math.min(tokenOut.decimals, 8))
      : '',
    minAmountOut,
    priceImpact: scientificNotationToString(
      new Big(priceImpact || 0)
        .minus(new Big(getAvgFee(swapsToDo || [])).div(100))
        .toString()
    ),
    swapError,
    makeSwap,
    estimates: swapsToDo?.map((s) => ({
      ...s,
      contract: 'Trisolaris',
    })),
    quoteDone: crossQuoteDone,
    fee: swapsToDo && !wrapOperation ? getAvgFee(swapsToDo) : 0,
    availableRoute: enableTri && !swapError && swapType === SWAP_TYPE.Pro,
    tokenInAmount,
    tokenIn,
    tokenOut,
    market: 'tri',
    exchange_name: (
      <div className="text-white flex flex-col items-start">
        <span
          style={{
            position: 'relative',
            top: '3px',
          }}
        >
          Trisolaris
        </span>

        <span
          style={{
            fontSize: '13px',
            position: 'relative',
            bottom: '3px',
          }}
          className="text-primaryText"
        >
          Aurora
        </span>
      </div>
    ),
  };
};

export const getPriceImpact = ({
  swapsToDo,
  tokenIn,
  tokenOut,
  tokenInAmount,
  tokenOutAmount,
  tokenPriceList,
}: {
  swapsToDo: EstimateSwapView[];
  tokenInAmount: string;
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  tokenOutAmount: string;
  tokenPriceList: any;
}) => {
  try {
    const newPrice = new Big(tokenInAmount || '0').div(
      new Big(tokenOutAmount || '1')
    );

    const routes = separateRoutes(swapsToDo, tokenOut.id);
    const priceImpactForRoutes = routes.map((swapsToDo) => {
      let oldPrice: Big;

      const priceIn = tokenPriceList[tokenIn.id]?.price;
      const priceOut = tokenPriceList[tokenOut.id]?.price;

      if (!!priceIn && !!priceOut) {
        oldPrice = new Big(priceOut).div(new Big(priceIn));
        console.log(
          'oldPrice: ',
          oldPrice.toString(),
          newPrice.toString(),
          priceOut,
          priceIn
        );
        return newPrice.lt(oldPrice)
          ? '0'
          : newPrice.minus(oldPrice).div(newPrice).times(100).abs().toFixed();
      }

      const pools = swapsToDo.map((s) => s?.pool);

      oldPrice = pools.reduce((acc, pool, i) => {
        const curRate = isStablePool(pool.id)
          ? new Big(pool.rates[swapsToDo[i].outputToken]).div(
              new Big(pool.rates[swapsToDo[i].inputToken])
            )
          : new Big(
              scientificNotationToString(
                calculateMarketPrice(
                  pool,
                  swapsToDo[0].tokens[i],
                  swapsToDo[0].tokens[i + 1]
                ).toString()
              )
            );

        return acc.mul(curRate);
      }, new Big(1));

      return newPrice.lt(oldPrice)
        ? '0'
        : newPrice.minus(oldPrice).div(newPrice).times(100).abs().toFixed();
    });

    console.log('priceImpactForRoutes: ', priceImpactForRoutes);

    const rawRes = priceImpactForRoutes.reduce(
      (pre, cur, i) => {
        return pre.plus(
          new Big(routes[i][0].partialAmountIn)
            .div(new Big(toNonDivisibleNumber(tokenIn.decimals, tokenInAmount)))
            .mul(cur)
        );
      },

      new Big(0)
    );

    return scientificNotationToString(rawRes.toString());
  } catch (error) {
    return '0';
  }
};

export const useRefSwap = ({
  tokenIn,
  tokenInAmount,
  tokenOut,
  slippageTolerance,
  setLoadingData,
  loadingTrigger,
  setLoadingTrigger,
  loadingPause,
  swapMode,
  reEstimateTrigger,
  supportLedger,
  loadingData,
  reEstimatingPro,
}: SwapOptions): ExchangeEstimate => {
  const {
    canSwap,
    tokenOutAmount,
    minAmountOut,
    swapError,
    makeSwap: makeSwapV1,
    avgFee: fee,
    swapsToDo,
    quoteDone,
    priceImpactValue,
  } = useSwap({
    tokenIn,
    tokenInAmount,
    tokenOut,
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
    makeSwap: makeSwapV2,
    tokenOutAmount: tokenOutAmountV2,
    minAmountOut: minAmountOutV2,
    fee: feeV2,
    swapsToDoV2,
    priceImpact: priceImpactV2,
    quoteDone: quoteDoneV2,
    canSwap: canSwapV2,
    swapErrorV3: swapErrorV2,
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

  const quoteDoneRef = quoteDoneV2 && quoteDone;

  if (!quoteDoneRef)
    return {
      quoteDone: false,
      canSwap: false,
      tokenInAmount,
      tokenIn,
      tokenOut,
      market: 'ref',
    };

  const bestSwap =
    new Big(tokenOutAmountV2 || '0').gte(tokenOutAmount || '0') &&
    canSwapV2 &&
    !swapErrorV2
      ? 'v2'
      : 'v1';

  if (bestSwap === 'v1') {
    return {
      quoteDone: true,
      canSwap: canSwap,
      makeSwap: makeSwapV1,
      estimates: swapsToDo?.map((s) => ({ ...s, contract: 'Ref_Classic' })),
      tokenOutAmount:
        !tokenOutAmount || swapError
          ? ''
          : toPrecision(
              tokenOutAmount || '0',
              Math.min(8, tokenOut?.decimals || 8)
            ),
      minAmountOut: minAmountOut,
      fee: fee,
      priceImpact: priceImpactValue,
      swapError,
      availableRoute: !swapError,
      tokenInAmount,
      tokenIn,
      tokenOut,
      market: 'ref',
      exchange_name: <div className="text-white">Ref</div>,
    };
  }
  if (bestSwap === 'v2') {
    return {
      quoteDone: true,
      canSwap: canSwapV2,
      makeSwap: makeSwapV2,
      estimates: swapsToDoV2?.map((s) => ({
        ...s,
        contract: 'Ref_DCL',
      })),

      tokenOutAmount:
        !tokenOutAmountV2 || swapErrorV2
          ? ''
          : toPrecision(
              tokenOutAmountV2 || '0',
              Math.min(8, tokenOut?.decimals || 8)
            ),
      tokenInAmount,
      minAmountOut: minAmountOutV2,
      fee: feeV2,
      priceImpact: priceImpactV2,
      swapError: swapErrorV2,
      availableRoute: !swapErrorV2,
      tokenIn,
      tokenOut,
      market: 'ref',
      exchange_name: <div className="text-white">Ref</div>,
    };
  }
};

export const useOrderlySwap = ({
  tokenIn,
  tokenOut,
  tokenInAmount,
  loadingTrigger,
}: SwapOptions): ExchangeEstimate => {
  const [estimate, setEstimate] = useState<string>();

  const { swapType } = useContext(SwapProContext);

  const [orderlyQuoteDone, setOrderlyQuoteDone] = useState<boolean>(false);

  const { accountId } = useWalletSelector();

  const [side, setCurSide] = useState<'Sell' | 'Buy'>();

  const {
    tokenInfo,
    availableSymbols,
    systemAvailable,
    symbol,
    orders,
    setSymbol,
  } = useOrderlyContext();

  const [userInfo, setUserInfo] = useState<ClientInfo>();

  const calculatePrice = (
    side: 'Sell' | 'Buy',
    orders: Orders,
    tokenInAmount: string | number
  ) => {
    const asks = (side === 'Buy' ? orders?.asks : orders?.bids) || [];

    if (asks.length == 0) {
      setCanSwap(false);
      setEstimate('');
      setOrderlyQuoteDone(true);
      return 0;
    }

    let totalPrice = 0;
    let totalAmount = 0;

    if (side === 'Sell') {
      for (let i = 0; i < asks.length; i++) {
        const [price, quantity] = asks[i];
        if (totalAmount + quantity <= Number(tokenInAmount)) {
          totalPrice += price * quantity;
          totalAmount += quantity;
        } else {
          const remainingQuantity = Number(tokenInAmount) - totalAmount;
          totalPrice += price * remainingQuantity;
          totalAmount += remainingQuantity;
          break;
        }
      }
    }

    if (side === 'Buy') {
      for (let i = 0; i < asks.length; i++) {
        const [price, quantity] = asks[i];
        if (totalAmount + price * quantity <= Number(tokenInAmount)) {
          totalPrice += quantity;
          totalAmount += price * quantity;
        } else {
          const remainingQuantity = Number(tokenInAmount) - totalAmount;
          totalPrice += remainingQuantity / price;
          totalAmount += remainingQuantity;
          break;
        }
      }
    }

    return totalPrice;
  };

  const getAmountByAsksAndBids = async (
    amount: number,
    tokenInProp: TokenMetadata,
    tokenOutProp: TokenMetadata,
    loadingTrigger?: boolean
  ) => {
    const tokenIn =
      tokenInProp.symbol === 'NEAR'
        ? {
            ...tokenInProp,
            id: 'near',
          }
        : tokenInProp;

    const tokenOut =
      tokenOutProp.symbol === 'NEAR'
        ? {
            ...tokenOutProp,
            id: 'near',
          }
        : tokenOutProp;

    const availableSymbolsWithTokens = availableSymbols?.map((symbol) => {
      const { symbolFrom, symbolTo } = parseSymbol(symbol.symbol);

      return {
        ...symbol,
        token_ids: [
          tokenInfo?.find((token) => token.token === symbolFrom)
            ?.token_account_id,
          tokenInfo?.find((token) => token.token === symbolTo)
            ?.token_account_id,
        ],
      };
    });

    const canSwapSymbol = availableSymbolsWithTokens?.find((symbol) => {
      return (
        symbol.token_ids.includes(tokenIn.id) &&
        symbol.token_ids.includes(tokenOut.id)
      );
    });

    const side = (
      canSwapSymbol?.token_ids[0] === tokenIn.id ? 'Sell' : 'Buy'
    ) as 'Sell' | 'Buy';

    if (!availableSymbols || !canSwapSymbol || !canSwapSymbol?.token_ids) {
      setCanSwap(false);
      setEstimate('0');

      setOrderlyQuoteDone(true);
      setCurSide(side);

      return;
    }

    if (canSwapSymbol.symbol !== symbol || !orders) {
      // setReEstimate(!reEstimate);
      setCurSide(side);

      setSymbol(canSwapSymbol.symbol);

      return;
    }

    if (canSwapSymbol.symbol === symbol) {
      const calcRes = calculatePrice(side, orders, tokenInAmount);

      if (calcRes > 0) {
        setEstimate(
          scientificNotationToString(
            percentLess(
              (userInfo?.taker_fee_rate || 10) / 100,

              calcRes
            ).toString()
          )
        );

        setOrderlyQuoteDone(true);
        setCurSide(side);
        setCanSwap(true);
      }
    }
  };

  useEffect(() => {
    if (!accountId) return;

    getAccountInformation({ accountId }).then((res) => {
      setUserInfo(res);
    });
  }, [accountId]);

  const history = useHistory();

  const [canSwap, setCanSwap] = useState<boolean>(false);

  const availableSymbolsWithTokens =
    symbol &&
    availableSymbols?.map((symbol) => {
      const { symbolFrom, symbolTo } = parseSymbol(symbol.symbol);

      return {
        ...symbol,
        token_ids: [
          tokenInfo?.find((token) => token.token === symbolFrom)
            ?.token_account_id,
          tokenInfo?.find((token) => token.token === symbolTo)
            ?.token_account_id,
        ],
      };
    });

  const canSwapSymbol = availableSymbolsWithTokens?.find((symbol) => {
    return (
      symbol.token_ids.includes(
        tokenIn?.symbol === 'NEAR' ? 'near' : tokenIn?.id
      ) &&
      symbol.token_ids.includes(
        tokenOut?.symbol === 'NEAR' ? 'near' : tokenOut?.id
      )
    );
  });

  const pairExist =
    tokenIn &&
    tokenOut &&
    tokenIn.id !== tokenOut.id &&
    symbol &&
    !!tokenInfo?.find(
      (token) =>
        token.token_account_id ===
        (tokenIn.symbol === 'NEAR' ? 'near' : tokenIn?.id)
    ) &&
    !!tokenInfo?.find(
      (token) =>
        token.token_account_id ===
        (tokenOut.symbol === 'NEAR' ? 'near' : tokenOut?.id)
    ) &&
    canSwapSymbol;

  useEffect(() => {
    if (!tokenIn || !tokenOut || !pairExist) return;

    setOrderlyQuoteDone(false);
    setCanSwap(false);

    getAmountByAsksAndBids(Number(tokenInAmount), tokenIn, tokenOut);
  }, [
    loadingTrigger,
    JSON.stringify(tokenInfo || ''),
    JSON.stringify(availableSymbols || ''),
    tokenIn?.id,
    tokenOut?.id,
    tokenInAmount,
    pairExist,
  ]);

  const makeSwap = () => {
    history.push('/orderbook', {
      side,
      orderType: 'Market',
    });
  };

  console.log('orderly quote done', !pairExist || orderlyQuoteDone);

  return {
    maker_fee: userInfo?.maker_fee_rate || 10,
    taker_fee: userInfo?.taker_fee_rate || 10,
    estimates: !estimate
      ? null
      : [
          {
            contract: 'Orderly',
            estimate: estimate,
            tokens: [tokenIn, tokenOut],
            outputToken: tokenOut?.id,
            inputToken: tokenIn?.id,
            pool: null,
          },
        ],
    makeSwap,
    quoteDone: !pairExist || orderlyQuoteDone,
    canSwap,
    tokenInAmount,
    tokenIn,
    tokenOut,
    market: 'orderly',
    availableRoute:
      swapType === SWAP_TYPE.Pro &&
      !!systemAvailable &&
      !!pairExist &&
      !!canSwap,
    swapError: null,
    tokenOutAmount: toPrecision(estimate, Math.min(8, tokenOut?.decimals || 8)),
    exchange_name: <div className="text-white">Orderbook</div>,
  };
};

export const useRefSwapPro = ({
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
}: SwapOptions & {
  setQuoting: (quoting: boolean) => void;
}) => {
  const {
    setTrades,
    enableTri,
    trades,
    setSelectMarket,
    selectMarket,
    swapType,
  } = useContext(SwapProContext);

  const [changeString, setChangeString] = useState<string>();

  const resRef = useRefSwap({
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
  });

  const resAurora = useCrossSwap({
    tokenIn,
    tokenInAmount,
    tokenOut,
    slippageTolerance,
    loadingTrigger,
    setLoadingTrigger,
    loadingPause,
    wrapOperation,
  });

  const resOrderly = useOrderlySwap({
    tokenIn,
    tokenInAmount,
    tokenOut,
    loadingTrigger,
    slippageTolerance,
  });

  useEffect(() => {
    if (
      resRef.quoteDone &&
      (!enableTri || resAurora.quoteDone) &&
      resOrderly.quoteDone
    ) {
      const trades = {
        ['ref']: resRef,
        ['tri']: resAurora,
        ['orderly']: resOrderly,
      };

      setTrades(trades);
      console.log('trades: ', trades);

      if (
        toNonDivisibleNumber(tokenIn.decimals, tokenInAmount) !==
        resRef.estimates[0].totalInputAmount
      )
        alert(
          'tokenInAmount: ' +
            tokenInAmount +
            ' estimates: ' +
            resRef.estimates[0].totalInputAmount
        );

      const curString = `${tokenIn.id}-${tokenOut.id}-${tokenInAmount}-${swapType}-${supportLedger}`;

      if (changeString === curString) {
        setQuoting(false);

        return;
      } else {
        setChangeString(curString);
      }

      const bestMarket = Object.keys(trades).reduce((a, b) =>
        new Big(
          trades[a].availableRoute ? trades[a].tokenOutAmount || '0' : '0'
        ).gt(trades[b].availableRoute ? trades[b].tokenOutAmount || '0' : '0')
          ? a
          : b
      );

      if (trades[bestMarket].availableRoute === true) {
        setSelectMarket(bestMarket as SwapMarket);
      } else {
        setSelectMarket('ref');
      }

      setQuoting(false);
    } else {
      setQuoting(true);
    }
  }, [
    resRef.quoteDone,
    enableTri,
    resAurora.quoteDone,
    resOrderly.quoteDone,
    slippageTolerance,
    swapType,
    supportLedger,
    tokenInAmount,
    resRef?.tokenOutAmount,
    resAurora?.tokenOutAmount,
  ]);
};
