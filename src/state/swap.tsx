import Big from 'big.js';
import BigNumber from 'bignumber.js';
import _ from 'lodash';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router';

import {
  failToast,
  getURLInfo,
  swapToast,
} from '../components/layout/transactionTipPopUp';
import {
  getErrorMessage,
  parsedArgs,
} from '../components/layout/transactionTipPopUp';
import { checkCrossSwapTransactions } from '../components/layout/transactionTipPopUp';
import {
  LimitOrderFailPopUp,
  LimitOrderPopUp,
} from '../components/layout/transactionTipPopUp';
import { parsedTransactionSuccessValue } from '../components/layout/transactionTipPopUp';
import { SUPPORT_LEDGER_KEY } from '../components/swap/SwapCard';
import { useWalletSelector } from '../context/WalletSelectorContext';
import { parseSymbol } from '../pages/Orderly/components/RecentTrade';
import { getAccountInformation } from '../pages/Orderly/orderly/off-chain-api';
import { useOrderlyContext } from '../pages/Orderly/orderly/OrderlyContext';
import { ClientInfo, Orders } from '../pages/Orderly/orderly/type';
import {
  ExchangeEstimate,
  SWAP_MODE,
  SWAP_TYPE,
  SwapMarket,
  SwapProContext,
} from '../pages/SwapPage';
import { hasTriPools } from '../services/aurora/aurora';
import { openUrl } from '../services/commonV3';
import getConfig from '../services/config';
import { ftGetTokenMetadata, TokenMetadata } from '../services/ft-contract';
import { isStablePool, POOL_TOKEN_REFRESH_INTERVAL } from '../services/near';
import { Pool, StablePool } from '../services/pool';
import {
  checkTransaction,
  estimateSwap,
  estimateSwapAurora,
  PoolMode,
  REF_FI_SWAP_SIGNAL,
} from '../services/swap';
import { EstimateSwapView, swap, swapFromServer } from '../services/swap';
import {
  get_pool,
  PoolInfo,
  quote,
  V3_POOL_FEE_LIST,
  V3_POOL_SPLITER,
  v3Swap,
} from '../services/swapV3';
import { pointToPrice } from '../services/swapV3';
import { get_pool_from_cache, getV3PoolId } from '../services/swapV3';
import { WRAP_NEAR_CONTRACT_ID } from '../services/wrap-near';
import db from '../store/RefDatabase';
import {
  calculateMarketPrice,
  percentLess,
  scientificNotationToString,
  separateRoutes,
  toNonDivisibleNumber,
  toReadableNumber,
} from '../utils/numbers';
import { getAllocationsLeastOne, toPrecision } from '../utils/numbers';
import { toRealSymbol } from '../utils/token';
import { getCurrentWallet, WalletContext } from '../utils/wallets-integration';
import { useIndexerStatus } from './pool';
import { useTokenPriceList } from './token';
import {
  IEstimateSwapServerView,
  getAvgFeeFromServer,
  getPriceImpactFromServer,
} from '../services/smartRouterFromServer';
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
  setShowSwapLoading?: (showSwapLoading: boolean) => void;
  stablePool?: StablePool;
  loadingPause?: boolean;
  setLoadingPause?: (pause: boolean) => void;
  swapMode?: SWAP_MODE;
  reEstimateTrigger?: boolean;
  setReEstimateTrigger?: (reEstimateTrigger: boolean) => void;
  supportLedger?: boolean;
  requestingTrigger?: boolean;
  setRequestingTrigger?: (requestingTrigger?: boolean) => void;
  wrapOperation?: boolean;
  reEstimatingPro?: boolean;
  tokenDeflationRateData?: Record<string, any>;
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
  reEstimateTrigger?: boolean;
}

const getTokenPriceListFromCache = async () => {
  return await db.queryTokenPrices();
};

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

    const order_id = parsed_ft_on_transfer_log?.data?.[0]?.order_id;

    const original_amount =
      parsed_ft_on_transfer_log?.data?.[0]?.original_amount;

    const original_deposit_amount =
      parsed_ft_on_transfer_log?.data?.[0]?.original_deposit_amount;

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
          : parsed_ft_on_transfer_log_swap?.data?.[0]?.amount_out;

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
          : parsed_ft_on_transfer_log_swap?.data?.[0]?.amount_out;

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
              (transaction?.actions[1]?.FunctionCall?.method_name ===
                'ft_transfer_call' ||
                transaction?.actions[0]?.FunctionCall?.method_name ===
                  'ft_transfer_call' ||
                transaction?.actions[0]?.FunctionCall?.method_name === 'swap' ||
                transaction?.actions[0]?.FunctionCall?.method_name ===
                  'near_deposit' ||
                transaction?.actions[0]?.FunctionCall?.method_name ===
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
  tokenOut: TokenMetadata,
  swapsToDoServer: IEstimateSwapServerView
) => {
  if (swapTodos?.[0]?.pool === null || !swapsToDoServer) return true;
  if (swapTodos) {
    const tokenInId = swapTodos[0]?.inputToken;
    const tokenOutId = swapTodos[swapTodos.length - 1]?.outputToken;
    if (
      tokenInId !== tokenIn.id ||
      tokenOutId !== tokenOut.id ||
      !BigNumber.sum(
        ...swapTodos.map((st) => st.partialAmountIn || 0)
      ).isEqualTo(parsedAmountIn) ||
      (!!localStorage.getItem(SUPPORT_LEDGER_KEY) && swapTodos?.length > 1)
    ) {
      return false;
    }
  }
  if (swapsToDoServer) {
    const { contract_in, contract_out, amount_in } = swapsToDoServer;
    if (
      contract_in !== tokenIn.id ||
      contract_out !== tokenOut.id ||
      !BigNumber(amount_in).isEqualTo(parsedAmountIn)
    ) {
      return false;
    }
  }

  return true;
};
// TODO 1
export const useSwap = ({
  tokenIn,
  tokenInAmount,
  setShowSwapLoading,
  tokenOut,
  slippageTolerance,
  loadingTrigger,
  setLoadingTrigger,
  loadingPause,
  reEstimateTrigger,
  supportLedger,
  tokenDeflationRateData,
}: SwapOptions) => {
  const [pool, setPool] = useState<Pool>();
  const [canSwap, setCanSwap] = useState<boolean>();
  const [estimateInOut, setEstimateInOut] = useState<string[]>([]);
  const [tokenOutAmount, setTokenOutAmount] = useState<string>('');
  const [swapError, setSwapError] = useState<Error>();
  const [swapsToDo, setSwapsToDo] = useState<EstimateSwapView[]>();
  const [swapsToDoServer, setSwapsToDoServer] =
    useState<IEstimateSwapServerView>();
  const [quoteDone, setQuoteDone] = useState<boolean>(false);

  const tokenPriceList = useTokenPriceList(loadingTrigger);

  const { enableTri } = useContext(SwapProContext);

  const [tag, setTag] = useState<any>();

  const [priceImpactValue, setPriceImpactValue] = useState<string>('0');

  const [avgFee, setAvgFee] = useState<number>(0);

  const [estimating, setEstimating] = useState<boolean>(false);

  const [count, setCount] = useState<number>(0);

  const minAmountOut = tokenOutAmount
    ? toPrecision(
        percentLess(
          slippageTolerance,
          toPrecision(tokenOutAmount, Math.min(tokenOut?.decimals ?? 8, 8))
        ),
        tokenOut?.decimals ?? 24
      )
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
    setEstimating(true);

    estimateSwap({
      tokenIn,
      tokenOut,
      amountIn: tokenInAmount,
      intl,
      supportLedger,
      loadingTrigger,
      slippage: slippageTolerance,
    })
      .then(async (estimateResult) => {
        if (estimateResult.source == 'server') {
          const { estimatesFromServer, poolsMap, tokensMap } = estimateResult;
          const { amount_out } = estimatesFromServer;
          const expectedOut = toReadableNumber(tokenOut.decimals, amount_out);
          setSwapError(null);
          setSwapsToDo(null);
          setTokenOutAmount(scientificNotationToString(expectedOut));
          setEstimateInOut([tokenInAmount, expectedOut]);
          setCanSwap(true);
          setQuoteDone(true);
          setSwapsToDoServer(estimatesFromServer);
          getAvgFeeFromServer({
            estimatesFromServer,
            setAvgFee,
            tokenInAmount,
            tokenIn,
            poolsMap,
          });
          const tokenPriceListForCal = !!tokenPriceList?.NEAR
            ? tokenPriceList
            : (await getTokenPriceListFromCache()).reduce(
                (acc, cur) => ({
                  ...acc,
                  [cur.id]: cur,
                }),
                {}
              );
          getPriceImpactFromServer({
            estimatesFromServer,
            tokenIn,
            tokenOut,
            tokenInAmount,
            tokenOutAmount: scientificNotationToString(expectedOut.toString()),
            tokenPriceList: tokenPriceListForCal,
            setPriceImpactValue,
            poolsMap,
            tokensMap,
          });
        } else if (estimateResult.source == 'script') {
          const { estimates: estimatesRes } = estimateResult;
          const estimates = estimatesRes.map((e) => ({
            ...e,
            partialAmountIn: e.pool.partialAmountIn,
          }));

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
            setSwapsToDoServer(null);

            const expectedOut = estimates.reduce(
              (acc, cur) =>
                acc.plus(
                  cur.outputToken === tokenOut.id ? cur.estimate || 0 : 0
                ),
              new Big(0)
            );
            const tokenPriceListForCal = !!tokenPriceList?.NEAR
              ? tokenPriceList
              : (await getTokenPriceListFromCache()).reduce(
                  (acc, cur) => ({
                    ...acc,
                    [cur.id]: cur,
                  }),
                  {}
                );

            const priceImpactValue = getPriceImpact({
              swapsToDo: estimates,
              tokenIn,
              tokenOut,
              tokenOutAmount: scientificNotationToString(
                expectedOut.toString()
              ),
              tokenInAmount,
              tokenPriceList: tokenPriceListForCal,
            });

            setPriceImpactValue(priceImpactValue);

            setTokenOutAmount(
              scientificNotationToString(expectedOut.toString())
            );
            setSwapsToDo(estimates);
            setEstimateInOut([tokenInAmount, expectedOut.toString()]);
            setCanSwap(true);
            setQuoteDone(true);
          }

          setPool(estimates[0].pool);
        }
      })
      .catch((err) => {
        setCanSwap(false);
        setTokenOutAmount('');
        setSwapError(err);
        setQuoteDone(true);
      })
      .finally(() => {
        setLoadingTrigger && setLoadingTrigger(false);
        setEstimating && setEstimating(false);
        setShowSwapLoading && setShowSwapLoading(false);
        setTag(`${tokenIn?.id}|${tokenOut?.id}|${tokenInAmount}`);
      });
  };

  useEffect(() => {
    if (
      tokenIn?.id &&
      tokenOut?.id &&
      tokenIn.id !== tokenOut.id &&
      Number(tokenInAmount || 0) > 0
    ) {
      getEstimate();
    } else if (ONLY_ZEROS.test(tokenInAmount || '0')) {
      setTokenOutAmount('0');
    }
  }, [
    tokenInAmount,
    reEstimateTrigger,
    tokenIn?.id,
    tokenOut?.id,
    supportLedger,
    enableTri,
    slippageTolerance,
  ]);
  useEffect(() => {
    if (
      loadingTrigger &&
      tokenIn?.id &&
      tokenOut?.id &&
      tokenIn.id !== tokenOut.id &&
      Number(tokenInAmount || 0) > 0
    ) {
      getEstimate();
    }
  }, [loadingTrigger]);
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
    if (swapsToDo) {
      swap({
        slippageTolerance,
        swapsToDo,
        tokenIn,
        amountIn: Big(tokenInAmount)
          .div(Big(1).minus(tokenDeflationRateData?.rate || 0))
          .toFixed(),
        tokenOut,
        swapMarket: 'ref',
      }).catch(setSwapError);
    } else if (swapsToDoServer) {
      swapFromServer({
        swapsToDoServer,
        tokenIn,
        amountIn: Big(tokenInAmount)
          .div(Big(1).minus(tokenDeflationRateData?.rate || 0))
          .toFixed(),
        tokenOut,
      }).catch(setSwapError);
    }
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
    tokenInAmount: swapsToDo
      ? toReadableNumber(
          tokenIn.decimals,
          swapsToDo
            .reduce(
              (acc, cur) => acc.plus(cur?.partialAmountIn || 0),
              new Big(0)
            )
            .toFixed()
        )
      : swapsToDoServer
      ? toReadableNumber(tokenIn.decimals, swapsToDoServer.amount_in || '0')
      : '1',

    pools: swapsToDo?.map((estimate) => estimate.pool),
    swapsToDo,
    isParallelSwap: swapsToDo?.every((e) => e.status === PoolMode.PARALLEL),
    quoteDone: quoteDone && !estimating,
    priceImpactValue: scientificNotationToString(
      new Big(priceImpactValue).minus(new Big((avgFee || 0) / 100)).toString()
    ),
    estimateInOut,
    swapsToDoServer,
    tag,
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
  reEstimateTrigger,
  setLoadingTrigger,
}: SwapV3Options) => {
  const [tokenOutAmount, setTokenOutAmount] = useState<string>('');

  const [tag, setTag] = useState<any>();

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

  const { enableTri } = useContext(SwapProContext);

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

    if (getConfig().DCL_POOL_BLACK_LIST.includes(pool_id)) return null;

    return quote({
      pool_ids: [pool_id],
      input_token: tokenIn,
      output_token: tokenOut,
      input_amount: tokenInAmount,
      tag: `${tokenIn.id}|${tokenOut.id}|${tokenInAmount}`,
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
  }, [bestFee, tokenIn?.id, tokenOut?.id, poolReFetch]);

  useEffect(() => {
    if (!tokenIn || !tokenOut || !tokenInAmount || wrapOperation) return;
    setQuoteDone(false);

    const storedPools = localStorage.getItem(REF_DCL_POOL_CACHE_KEY);

    if (!storedPools) {
      setQuoteDone(true);
      return;
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
        setTag(`${tokenIn?.id}|${tokenOut?.id}|${tokenInAmount}`);
      });
  }, [
    tokenIn?.id,
    tokenOut?.id,
    tokenInAmount,
    loadingTrigger,
    swapError?.message,
    enableTri,
    reEstimateTrigger,
  ]);

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
  }, [quoteDone, tokenOutAmount]);

  const swapsToDoV2: EstimateSwapView[] = [
    {
      estimate: tokenOutAmount,
      pool: null,
      routeInputToken: tokenIn?.id,
      inputToken: tokenIn?.id,
      outputToken: tokenOut?.id,
      token: tokenIn,
      tokens: [tokenIn, tokenOut],
      totalInputAmount: toNonDivisibleNumber(
        tokenIn?.decimals === null || tokenIn?.decimals === undefined
          ? 24
          : tokenIn.decimals,
        tokenInAmount
      ),
    },
  ];

  return {
    makeSwap,
    canSwap: getCanSwapCondition(),
    tokenOutAmount,
    tokenInAmount,
    canSwapPro: quoteDone && tagValidator(bestEstimate, tokenIn, tokenInAmount),
    priceImpact,
    minAmountOut: tokenOutAmount
      ? toPrecision(
          percentLess(
            slippageTolerance,
            toPrecision(tokenOutAmount, Math.min(tokenOut?.decimals ?? 8, 8))
          ),
          tokenOut?.decimals ?? 24
        )
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
    tag,
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

  const { fail: indexerFail } = useIndexerStatus();

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
          return;
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
      return;
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
          percents.every((p) => Number(p) === 0) &&
          !indexerFail
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
  }, [tokenIn?.id, tokenOut?.id, tokenPriceList, swapMode, indexerFail]);

  useEffect(() => {
    if (!poolToOrderCounts) return;

    const countValues = Object.values(poolToOrderCounts);

    const maxOrderIndex = countValues.findIndex(
      (c) =>
        c !== null &&
        c === _.maxBy(countValues, (o) => Number(o == null ? '-1' : o))
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
  reEstimateTrigger,
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
    setSwapError(null);
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
        if (localStorage.getItem(SUPPORT_LEDGER_KEY) && estimates?.length > 1) {
          return;
        }
        if (tokenInAmount && !ONLY_ZEROS.test(tokenInAmount)) {
          setTokenOutAmount(estimates[0].estimate);
          setSwapsToDo(estimates);
          setCanSwap(true);

          const priceImpact = getPriceImpact({
            swapsToDo: estimates,
            tokenIn,
            tokenOut,
            tokenInAmount,
            tokenOutAmount: estimates?.[0]?.estimate || '0',
            tokenPriceList,
          });

          const fee = getAvgFee(estimates);

          setPriceImpact(
            scientificNotationToString(
              new Big(priceImpact || 0)
                .minus(new Big(fee || 0).div(100))
                .toString()
            )
          );
        }

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
        setCrossQuoteDone(true);

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
  }, [[tokenIn?.id, tokenOut?.id].sort().join('-')]);

  useEffect(() => {
    if (ONLY_ZEROS.test(tokenInAmount)) {
      setCrossQuoteDone(false);
      return;
    }
    setCanSwap(false);
    setSwapError(null);

    setCrossQuoteDone(false);

    getEstimateCrossSwap(loadingTrigger);
  }, [loadingTrigger]);

  useEffect(() => {
    if (ONLY_ZEROS.test(tokenInAmount)) {
      setCrossQuoteDone(false);
      return;
    }
    setCanSwap(false);
    setSwapError(null);

    setCrossQuoteDone(false);
    getEstimateCrossSwap(false);
  }, [
    tokenInAmount,
    [tokenIn?.id, tokenOut?.id].join('-'),
    enableTri,
    reEstimateTrigger,
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
      swapMarket: 'tri',
    }).catch(setSwapError);
  };

  return {
    canSwap,
    tokenOutAmount: !!tokenOutAmount
      ? toPrecision(tokenOutAmount || '0', Math.min(tokenOut.decimals, 8))
      : '',
    minAmountOut,
    priceImpact,
    swapError,
    makeSwap,
    estimates: swapsToDo?.map((s) => ({
      ...s,
      contract: 'Trisolaris',
    })),
    quoteDone:
      !!swapError ||
      (crossQuoteDone &&
        (swapsToDo
          ? toNonDivisibleNumber(tokenIn.decimals, tokenInAmount) ===
            swapsToDo?.[0].totalInputAmount
          : true)),
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
  setShowSwapLoading,
  loadingPause,
  swapMode,
  reEstimateTrigger,
  supportLedger,
  loadingData,
  tokenDeflationRateData,
}: SwapOptions): ExchangeEstimate => {
  const {
    canSwap,
    minAmountOut,
    swapError,
    makeSwap: makeSwapV1,
    avgFee: fee,
    swapsToDo,
    quoteDone,
    priceImpactValue,
    tokenInAmount: tokenInAmountV1,
    estimateInOut,
    swapsToDoServer,
    tag,
  } = useSwap({
    tokenIn,
    tokenInAmount,
    tokenOut,
    slippageTolerance,
    setLoadingData,
    loadingTrigger,
    setLoadingTrigger,
    setShowSwapLoading,
    loadingData,
    loadingPause,
    swapMode,
    reEstimateTrigger,
    supportLedger,
    tokenDeflationRateData,
  });
  const [estimateInAmount, tokenOutAmount] = estimateInOut;
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
    tokenInAmount: tokenInAmountV2,
    tag: tagV3,
  } = useSwapV3({
    tokenIn,
    tokenOut,
    tokenInAmount,
    slippageTolerance,
    swapMode,
    loadingTrigger,
    swapError,
    setLoadingTrigger,
    reEstimateTrigger,
  });
  function validator() {
    if (tag && tagV3) {
      const [inId, outId, inAmount] = tag.split('|');
      const [dclInId, dclOutId, dclInAmount] = tagV3.split('|');
      return (
        inId == tokenIn?.id &&
        outId == tokenOut.id &&
        inAmount == tokenInAmount &&
        dclInId == tokenIn?.id &&
        dclOutId == tokenOut.id &&
        dclInAmount == tokenInAmount
      );
    }
    return false;
  }
  // TODO 2
  const quoteDoneRef = quoteDoneV2 && quoteDone && validator();
  if (!quoteDoneRef)
    return {
      quoteDone: false,
      canSwap: false,
      tokenInAmount,
      tokenIn,
      tokenOut,
      market: 'ref',
      tokenOutAmount: '0',
    };
  const bestSwap =
    new Big(tokenOutAmountV2 || '0').gte(tokenOutAmount || '0') &&
    canSwapV2 &&
    !swapErrorV2
      ? 'v2'
      : 'v1';
  if (bestSwap === 'v1') {
    if (swapsToDoServer) {
      swapsToDoServer.contract = 'Ref_Classic';
    }
    return {
      quoteDone: true,
      canSwap,
      makeSwap: makeSwapV1,
      estimates: swapsToDo?.map((s) => ({ ...s, contract: 'Ref_Classic' })),
      estimatesServer: swapsToDoServer ?? null,
      tokenOutAmount:
        !tokenOutAmount || swapError
          ? ''
          : toPrecision(
              tokenOutAmount || '0',
              Math.min(8, tokenOut?.decimals ?? 8)
            ),
      minAmountOut,
      fee,
      priceImpact: priceImpactValue,
      swapError,
      availableRoute: !swapError,
      tokenInAmount: tokenInAmountV1,
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
              Math.min(8, tokenOut?.decimals ?? 8)
            ),
      tokenInAmount: tokenInAmountV2,
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
  reEstimateTrigger,
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
        symbol.token_ids.includes(tokenOut.id) &&
        symbol.symbol.indexOf('SPOT') > -1
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
    reEstimateTrigger,
  ]);

  const makeSwap = () => {
    openUrl(`/orderbook/spot?side=${side}&orderType=Market`);
  };

  return {
    maker_fee: userInfo?.maker_fee_rate || 10,
    taker_fee: userInfo?.taker_fee_rate || 10,
    estimates: !estimate
      ? null
      : [
          {
            contract: 'Orderly',
            estimate,
            tokens: [tokenIn, tokenOut],
            outputToken: tokenOut?.id,
            inputToken: tokenIn?.id,
            pool: null,
            totalInputAmount: toNonDivisibleNumber(
              tokenIn?.decimals === null || tokenIn?.decimals === undefined
                ? 24
                : tokenIn.decimals,
              tokenInAmount
            ),
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
    tokenOutAmount: toPrecision(estimate, Math.min(8, tokenOut?.decimals ?? 8)),
    exchange_name: <div className="text-white">Orderly</div>,
  };
};

export const REF_FI_BEST_MARKET_ROUTE = 'REF_FI_BEST_MARKET_ROUTE';

export const useRefSwapPro = ({
  tokenIn,
  tokenInAmount,
  tokenOut,
  slippageTolerance,
  setLoadingData,
  loadingTrigger,
  setLoadingTrigger,
  setShowSwapLoading,
  loadingPause,
  reEstimateTrigger,
  supportLedger,
  loadingData,
  wrapOperation,
  setReEstimateTrigger,
  setQuoting,
  quoting,
  tokenDeflationRateData,
}: SwapOptions & {
  setQuoting: (quoting: boolean) => void;
  quoting: boolean;
}) => {
  const {
    setTrades,
    enableTri,
    setSelectMarket,
    forceEstimatePro,
    setForceEstimatePro,
    selectMarket,
    swapType,
  } = useContext(SwapProContext);
  // TODO 3
  const resRef = useRefSwap({
    tokenIn,
    tokenInAmount,
    tokenOut,
    slippageTolerance,
    setLoadingData,
    loadingTrigger,
    setLoadingTrigger,
    setShowSwapLoading,
    loadingPause,
    reEstimateTrigger,
    supportLedger,
    loadingData,
    tokenDeflationRateData,
  });

  resRef.hasTriPool =
    tokenIn &&
    tokenOut &&
    hasTriPools([
      tokenIn.id === WRAP_NEAR_CONTRACT_ID ? 'wNEAR' : tokenIn.symbol,
      tokenOut.id === WRAP_NEAR_CONTRACT_ID ? 'wNEAR' : tokenOut.symbol,
    ]);

  const resAurora = useCrossSwap({
    tokenIn,
    tokenInAmount,
    tokenOut,
    slippageTolerance,
    loadingTrigger,
    setLoadingTrigger,
    loadingPause,
    wrapOperation,
    reEstimateTrigger,
  });

  const resOrderly = useOrderlySwap({
    tokenIn,
    tokenInAmount,
    tokenOut,
    loadingTrigger,
    slippageTolerance,
    reEstimateTrigger,
  });

  useEffect(() => {
    if (tokenIn && tokenOut && tokenIn.id === tokenOut.id) {
      setSelectMarket('ref');
    }
  }, [tokenIn, tokenOut]);

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

      const tradeList = [resRef, resAurora];
      let resValid = true;

      resValid =
        resValid &&
        tokenIn?.id === localStorage.getItem('REF_FI_SWAP_IN') &&
        tokenOut?.id === localStorage.getItem('REF_FI_SWAP_OUT');

      resValid =
        resValid &&
        tradeList.every((t) => {
          return (
            !t?.availableRoute ||
            !t?.estimates ||
            t?.estimates?.[0]?.totalInputAmount ===
              toNonDivisibleNumber(tokenIn.decimals, tokenInAmount)
          );
        });

      resValid =
        (resValid &&
          (!resAurora?.availableRoute ||
            resAurora.tokenOutAmount ===
              toPrecision(
                resAurora.tokenOutAmount || '0',
                Math.min(tokenOut.decimals, 8)
              )) &&
          (!resRef?.availableRoute ||
            resRef.estimates?.[0]?.tokens?.[
              resRef.estimates?.[0]?.tokens.length - 1
            ]?.id === localStorage.getItem('REF_FI_SWAP_OUT'))) ||
        (resRef.estimatesServer && !resRef.estimates);

      if (!resValid) {
        setReEstimateTrigger(!reEstimateTrigger);
        return;
      }
      setTrades(trades);

      const bestMarket = Object.keys(trades).reduce((a, b) => {
        return new Big(
          trades[a].availableRoute ? trades[a].tokenOutAmount || '0' : '0'
        ).gt(trades[b].availableRoute ? trades[b].tokenOutAmount || '0' : '0')
          ? a
          : b;
      });

      sessionStorage.setItem(
        REF_FI_BEST_MARKET_ROUTE,
        trades[bestMarket].availableRoute === true ? bestMarket : 'ref'
      );

      if (
        sessionStorage.getItem('loadingTrigger') === 'true' &&
        !!selectMarket
      ) {
        setQuoting(false);

        return;
      }

      if (trades[bestMarket].availableRoute === true) {
        setSelectMarket(bestMarket as SwapMarket);
      } else {
        setSelectMarket('ref');
      }

      setQuoting(false);
    } else {
      !quoting && setQuoting(true);
      forceEstimatePro && setForceEstimatePro(false);
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
    quoting,
    JSON.stringify(resRef?.tokenOutAmount || {}),
    JSON.stringify(resAurora?.tokenOutAmount || {}),
    JSON.stringify(resOrderly?.tokenOutAmount || {}),

    JSON.stringify(resRef?.estimates || {}),
    JSON.stringify(resAurora?.estimates || {}),
    forceEstimatePro,
  ]);
};
