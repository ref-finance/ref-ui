import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { toast } from 'react-toastify';
import { getPool, Pool, StablePool, getStablePool } from '../services/pool';
import BigNumber from 'bignumber.js';
import {
  estimateSwap as estimateStableSwap,
  EstimateSwapView,
} from '../services/stable-swap';

import { TokenMetadata } from '../services/ft-contract';
import {
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

import { getCurrentWallet, WalletContext } from '../utils/sender-wallet';
import {
  POOL_TOKEN_REFRESH_INTERVAL,
  STABLE_TOKEN_IDS,
  STABLE_POOL_ID,
} from '../services/near';

import {
  getExpectedOutputFromActions,
  getAverageFeeForRoutes,
  //@ts-ignore
} from '../services/smartRouteLogic';
import {
  failToast,
  getURLInfo,
  swapToast,
} from '../components/layout/transactionTipPopUp';
import { SWAP_MODE } from '../pages/SwapPage';
import { getErrorMessage } from '../components/layout/transactionTipPopUp';
import { checkTransactionStatus } from '../services/swap';
import {
  parsedTransactionSuccessValue,
  checkCrossSwapTransactions,
} from '../components/layout/transactionTipPopUp';
import {
  getLimitOrderRangeCountAndPool,
  get_pool,
  PoolInfoV3,
  quote,
  v3Swap,
  V3_POOL_FEE_LIST,
  V3_POOL_SPLITER,
} from '~services/swapV3';
import { pointToPrice, get_pointorder_range } from '../services/swapV3';
import _, { toArray } from 'lodash';
import Big from 'big.js';
import { getV3PoolId } from '../services/swapV3';
import { checkAllocations } from '../utils/numbers';
import conformsTo from 'lodash';

const ONLY_ZEROS = /^0*\.?0*$/;

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
  requested?: boolean;
  setRequested?: (requested?: boolean) => void;
  setRequestingTrigger?: (requestingTrigger?: boolean) => void;
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
}

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
  const [avgFee, setAvgFee] = useState<number>(0);

  const history = useHistory();
  const [count, setCount] = useState<number>(0);

  const { txHash, pathname, errorType } = getURLInfo();

  const minAmountOut = tokenOutAmount
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

  useEffect(() => {
    if (txHash && getCurrentWallet().wallet.isSignedIn()) {
      checkTransaction(txHash)
        .then((res: any) => {
          const transactionErrorType = getErrorMessage(res);

          const transaction = res.transaction;

          return {
            isSwap:
              transaction?.actions[1]?.['FunctionCall']?.method_name ===
                'ft_transfer_call' ||
              transaction?.actions[0]?.['FunctionCall']?.method_name ===
                'ft_transfer_call' ||
              transaction?.actions[0]?.['FunctionCall']?.method_name ===
                'swap' ||
              transaction?.actions[0]?.['FunctionCall']?.method_name ===
                'near_withdraw',
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

  const getEstimate = () => {
    setCanSwap(false);
    setQuoteDone(false);

    if (tokenIn && tokenOut && tokenIn.id !== tokenOut.id) {
      setSwapError(null);
      if (!tokenInAmount || ONLY_ZEROS.test(tokenInAmount)) {
        setTokenOutAmount('0');
        return;
      }

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
        .then(async (estimates) => {
          if (!estimates) throw '';
          if (tokenInAmount && !ONLY_ZEROS.test(tokenInAmount)) {
            setAverageFee(estimates);

            if (!loadingTrigger) {
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
    getEstimate();
  }, [
    loadingTrigger,
    loadingPause,
    tokenIn,
    tokenOut,
    tokenInAmount,
    reEstimateTrigger,
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
}: SwapV3Options) => {
  const [tokenOutAmount, setTokenOutAmount] = useState<string>('');

  const [bestPool, setBestPool] = useState<PoolInfoV3>();

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
      })} ${tokenIn.symbol} -> ${tokenOut.symbol} ${intl.formatMessage({
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

    const tagInfo = bestEstimate?.tag?.split('-');

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
    tokenOut: TokenMetadata
  ) => {
    const pool_id = getV3PoolId(tokenIn.id, tokenOut.id, fee);

    return quote({
      pool_ids: [pool_id],
      input_token: tokenIn,
      output_token: tokenOut,
      input_amount: tokenInAmount,
      tag: `${tokenIn.id}-${fee}-${tokenInAmount}`,
    }).catch((e) => null);
  };

  const bestFee = Number(bestEstimate?.tag?.split('-')?.[1]);

  useEffect(() => {
    if (!bestFee) return;

    get_pool(getV3PoolId(tokenIn.id, tokenOut.id, bestFee), tokenIn.id).then(
      setBestPool
    );
  }, [bestFee, tokenIn, tokenOut, poolReFetch]);

  useEffect(() => {
    if (!tokenIn || !tokenOut || !tokenInAmount) return;

    setQuoteDone(false);

    Promise.all(fees.map((fee) => getQuote(fee, tokenIn, tokenOut)))
      .then((res) => {
        if (!loadingTrigger) {
          setEstimates(res);

          const bestEstimate =
            res && res?.some((e) => !!e)
              ? _.maxBy(res, (e) => Number(!e.tag ? -1 : e.amount))
              : null;

          setBestEstimate(bestEstimate);

          if (
            bestEstimate &&
            !loadingTrigger &&
            (tagValidator(bestEstimate, tokenIn, tokenInAmount) ||
              res?.every((e) => e.tag === null))
          ) {
            setTokenOutAmount(
              toReadableNumber(tokenOut.decimals, bestEstimate.amount)
            );
          }
        }
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {
        setQuoteDone(true);
        setPoolReFetch(!poolReFetch);
      });
  }, [tokenIn, tokenOut, tokenInAmount, loadingTrigger]);

  const makeSwap = () => {
    if (!tagValidator(bestEstimate, tokenIn, tokenInAmount)) return;

    v3Swap({
      Swap: {
        pool_ids: [getV3PoolId(tokenIn.id, tokenOut.id, bestFee)],
        min_output_amount: toReadableNumber(
          tokenOut.decimals,
          percentLess(slippageTolerance, bestEstimate.amount)
        ),
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
      const curPrice = pointToPrice({
        tokenA: tokenIn,
        tokenB: tokenOut,
        point: bestPool.current_point,
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

  return {
    makeSwap,
    canSwap:
      (quoteDone && tagValidator(bestEstimate, tokenIn, tokenInAmount)) ||
      swapMode !== SWAP_MODE.NORMAL,
    tokenOutAmount,
    priceImpact: displayPriceImpact,
    minAmountOut: tokenOutAmount
      ? percentLess(slippageTolerance, tokenOutAmount)
      : null,
    quoteDone:
      quoteDone &&
      (tagValidator(bestEstimate, tokenIn, tokenInAmount) ||
        estimates?.every((e) => e.tag === null)),
    bestFee,
    bestPool,
    swapErrorV3:
      bestEstimate && ONLY_ZEROS.test(bestEstimate.amount)
        ? NoPoolError()
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
}: {
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  swapMode: SWAP_MODE;
  selectedV3LimitPool: string;
  setSelectedV3LimitPool?: (pool: string) => void;
  loadingTrigger?: boolean;
}) => {
  const notLimitMode = swapMode !== SWAP_MODE.LIMIT;

  const [quoteDone, setQuoteDone] = useState<boolean>(false);

  const [pools, setPools] = useState<(PoolInfoV3 | null)[]>();

  const [mostPoolDetail, setMostPoolDetail] = useState<PoolInfoV3>();

  const [poolToOrderCounts, setPoolToOrderCounts] = useState<{
    [key: string]: string | null;
  }>();

  useEffect(() => {
    if (!selectedV3LimitPool || loadingTrigger) return;
    setQuoteDone(false);

    get_pool(selectedV3LimitPool, tokenIn.id)
      .then(setMostPoolDetail)
      .catch((e) => {
        console.log(e);
        setMostPoolDetail(null);
      })
      .finally(() => {
        setQuoteDone(true);
      });
  }, [selectedV3LimitPool, loadingTrigger]);

  useEffect(() => {
    if (notLimitMode || !tokenIn || !tokenOut) {
      return null;
    }

    // setMostPoolDetail(null);

    Promise.all(
      V3_POOL_FEE_LIST.map((fee) =>
        get_pool(getV3PoolId(tokenIn.id, tokenOut.id, fee), tokenIn.id)
      )
    )
      .then((res) => {
        setPools(res);

        const counts = res?.map((r) =>
          r?.liquidity ? Number(r?.liquidity) : 0
        );
        const sumOfCounts = _.sum(counts);

        const percents =
          sumOfCounts === 0
            ? ['0', '0', '0', '0']
            : checkAllocations(
                '100',
                counts.map((c) => ((c / sumOfCounts) * 100).toFixed())
              );

        const percensNew = percents.map((p, i) => (!!res[i] ? p : null));

        const toCounts = percensNew.reduce((acc, cur, index) => {
          return {
            ...acc,
            [getV3PoolId(tokenIn.id, tokenOut.id, V3_POOL_FEE_LIST[index])]:
              cur,
          };
        }, {});

        setPoolToOrderCounts(toCounts);
      })
      .catch((e) => {
        console.log(e);

        const allPoolsForThisPair = V3_POOL_FEE_LIST.map((fee) =>
          getV3PoolId(tokenIn.id, tokenOut.id, fee)
        );
        setSelectedV3LimitPool(allPoolsForThisPair[2]);
      });
  }, [tokenIn, tokenOut, loadingTrigger]);

  useEffect(() => {
    if (!poolToOrderCounts) return null;

    const countValues = Object.values(poolToOrderCounts);

    const maxOrderIndex = countValues.findIndex(
      (c) => c && c === _.maxBy(countValues, (o) => Number(o || 0))
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
    tokenOut?.id,
    tokenIn?.id,
  ]);

  return {
    poolPercents: notLimitMode ? null : poolToOrderCounts,
    fee: !selectedV3LimitPool
      ? null
      : Number(selectedV3LimitPool.split(V3_POOL_SPLITER)[2]),
    mostPoolDetail,
    quoteDone,
    idToPools: pools,
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
    if (txHash && getCurrentWallet().wallet.isSignedIn()) {
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
  setRequested,
  loadingTrigger,
  setLoadingTrigger,
  loadingPause,
  requested,
}: SwapOptions) => {
  const [pool, setPool] = useState<Pool>();
  const [canSwap, setCanSwap] = useState<boolean>();
  const [tokenOutAmount, setTokenOutAmount] = useState<string>('');
  const [swapError, setSwapError] = useState<Error>();
  const [swapsToDo, setSwapsToDo] = useState<EstimateSwapView[]>();

  const [swapsToDoRef, setSwapsToDoRef] = useState<EstimateSwapView[]>();

  const [swapsToDoTri, setSwapsToDoTri] = useState<EstimateSwapView[]>();

  const [avgFee, setAvgFee] = useState<number>(0);

  const history = useHistory();

  const [count, setCount] = useState<number>(0);
  const refreshTime = Number(POOL_TOKEN_REFRESH_INTERVAL) * 1000;

  const { txHash, pathname, errorType, txHashes } = getURLInfo();

  const minAmountOut = tokenOutAmount
    ? percentLess(slippageTolerance, tokenOutAmount)
    : null;

  const { globalState } = useContext(WalletContext);

  const isSignedIn = globalState.isSignedIn;

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

  useEffect(() => {
    if (txHashes && txHashes.length > 0 && isSignedIn) {
      checkCrossSwapTransactions(txHashes).then(
        (res: { status: boolean; hash: string; errorType?: string }) => {
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

  const getEstimateCrossSwap = () => {
    setCanSwap(false);
    setSwapError(null);

    estimateSwap({
      tokenIn,
      tokenOut,
      amountIn: tokenInAmount,
      intl,
      loadingTrigger: loadingTrigger && !loadingPause,
      supportLedger,
      swapPro: true,
      setSwapsToDoRef,
      setSwapsToDoTri,
    })
      .then(async (estimates) => {
        if (tokenInAmount && !ONLY_ZEROS.test(tokenInAmount)) {
          setAverageFee(estimates);

          setSwapsToDo(estimates);
          setCanSwap(true);
        }

        setPool(estimates[0].pool);
      })
      .catch((err) => {
        setCanSwap(false);
        setTokenOutAmount('');
        setSwapError(err);
        console.error(err);
      })
      .finally(() => {
        loadingTrigger && !requested && setRequested(true);
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
    if (loadingTrigger || requested) getEstimateCrossSwap();
  }, [loadingTrigger, supportLedger]);

  useEffect(() => {
    if (!requested) return;
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
  }, [count, loadingTrigger, loadingPause, requested]);

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
    setSwapError,
    swapsToDoRef,
    swapsToDoTri,
  };
};
