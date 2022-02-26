import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { getPool, Pool, StablePool } from '../services/pool';
import BigNumber from 'bignumber.js';
import {
  estimateSwap as estimateStableSwap,
  EstimateSwapView,
} from '~services/stable-swap';

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

import { swap as stableSwap } from '~services/stable-swap';

import { useHistory, useLocation } from 'react-router';
import getConfig from '~services/config';
import { FormattedMessage, useIntl } from 'react-intl';
import { CloseIcon } from '~components/icon/Actions';
import db from '../store/RefDatabase';
import { POOL_TOKEN_REFRESH_INTERVAL } from '~services/near';

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
}: SwapOptions) => {
  const [pool, setPool] = useState<Pool>();
  const [canSwap, setCanSwap] = useState<boolean>();
  const [tokenOutAmount, setTokenOutAmount] = useState<string>('');
  const [swapError, setSwapError] = useState<Error>();
  const [swapsToDo, setSwapsToDo] = useState<EstimateSwapView[]>();

  const [avgFee, setAvgFee] = useState<number>(0);
  const { search } = useLocation();
  const history = useHistory();
  const [count, setCount] = useState<number>(0);
  const txHashes = new URLSearchParams(search)
    .get('transactionHashes')
    ?.split(',');

  const txHash = txHashes
    ? txHashes.length > 1
      ? txHashes[1]
      : txHashes[0]
    : '';

  const minAmountOut = tokenOutAmount
    ? percentLess(slippageTolerance, tokenOutAmount)
    : null;
  const refreshTime = Number(POOL_TOKEN_REFRESH_INTERVAL) * 1000;

  const intl = useIntl();

  function sumFunction(total: number, num: number) {
    return total + num;
  }

  const setAverageFee = (estimates: EstimateSwapView[]) => {
    const medFee = estimates.map((s2d) => {
      const fee = s2d.pool.fee;
      const numerator = Number(
        toReadableNumber(tokenIn.decimals, s2d.pool.partialAmountIn)
      );
      const weight = numerator / Number(tokenInAmount);

      return fee * weight;
    });
    const avgFee = medFee.reduce(sumFunction, 0);
    setAvgFee(avgFee);
  };

  useEffect(() => {
    if (txHash) {
      checkTransaction(txHash)
        .then(({ transaction }) => {
          return (
            transaction?.actions[1]?.['FunctionCall']?.method_name ===
              'ft_transfer_call' ||
            transaction?.actions[0]?.['FunctionCall']?.method_name ===
              'ft_transfer_call' ||
            transaction?.actions[0]?.['FunctionCall']?.method_name === 'swap' ||
            transaction?.actions[0]?.['FunctionCall']?.method_name ===
              'near_withdraw'
          );
        })
        .then((isSwap) => {
          if (isSwap) {
            toast(
              <a
                className="text-white"
                href={`${getConfig().explorerUrl}/transactions/${txHash}`}
                target="_blank"
              >
                <FormattedMessage
                  id="swap_successful_click_to_view"
                  defaultMessage="Swap successful. Click to view"
                />
              </a>,
              {
                autoClose: 8000,
                closeOnClick: true,
                hideProgressBar: false,
                closeButton: <CloseIcon />,
                progressStyle: {
                  background: '#00FFD1',
                  borderRadius: '8px',
                },
                style: {
                  background: '#1D2932',
                  boxShadow: '0px 0px 10px 10px rgba(0, 0, 0, 0.15)',
                  borderRadius: '8px',
                },
              }
            );
          }
          history.replace('');
        });
    }
  }, [txHash]);

  const getEstimate = () => {
    setCanSwap(false);

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
      })
        .then((estimates) => {
          if (!estimates) throw '';

          const isParallelSwap = estimates.every(
            (e) => e.status === PoolMode.PARALLEL
          );

          if (isParallelSwap) {
            if (tokenInAmount && !ONLY_ZEROS.test(tokenInAmount)) {
              setCanSwap(true);
              setAverageFee(estimates);
              const estimate = estimates.reduce((pre, cur) => {
                return scientificNotationToString(
                  BigNumber.sum(pre, cur.estimate).toString()
                );
              }, '0');
              if (!loadingTrigger) {
                setTokenOutAmount(estimate);
                setSwapsToDo(estimates);
              }
            }
          } else {
            if (tokenInAmount && !ONLY_ZEROS.test(tokenInAmount)) {
              setCanSwap(true);

              setAvgFee(
                Number(estimates[0].pool.fee) + Number(estimates[1].pool.fee)
              );
              if (!loadingTrigger) {
                setTokenOutAmount(estimates[1].estimate);
                setSwapsToDo(estimates);
              }
            }
          }
          setPool(estimates[0].pool);
        })
        .catch((err) => {
          setCanSwap(false);
          setTokenOutAmount('');
          setSwapError(err);
        })
        .finally(() => setLoadingTrigger(false));
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
  }, [loadingTrigger, loadingPause, tokenIn, tokenOut, tokenInAmount]);

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
    swapError,
    makeSwap,
    avgFee,
    pools: swapsToDo?.map((estimate) => estimate.pool),
    swapsToDo,
    isParallelSwap: swapsToDo?.every((e) => e.status === PoolMode.PARALLEL),
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
  const { search } = useLocation();
  const history = useHistory();
  const txHashes = new URLSearchParams(search)
    .get('transactionHashes')
    ?.split(',');

  const txHash = txHashes
    ? txHashes.length > 1
      ? txHashes[1]
      : txHashes[0]
    : '';

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
    if (txHash) {
      checkTransaction(txHash)
        .then(({ transaction }) => {
          return (
            transaction?.actions[1]?.['FunctionCall']?.method_name ===
              'ft_transfer_call' ||
            transaction?.actions[0]?.['FunctionCall']?.method_name ===
              'ft_transfer_call' ||
            transaction?.actions[0]?.['FunctionCall']?.method_name === 'swap' ||
            transaction?.actions[0]?.['FunctionCall']?.method_name ===
              'near_withdraw'
          );
        })
        .then((isSwap) => {
          if (isSwap) {
            toast(
              <a
                className="text-white"
                href={`${getConfig().explorerUrl}/transactions/${txHash}`}
                target="_blank"
              >
                <FormattedMessage
                  id="swap_successful_click_to_view"
                  defaultMessage="Swap successful. Click to view"
                />
              </a>,
              {
                autoClose: 8000,
                closeOnClick: true,
                hideProgressBar: false,
                closeButton: <CloseIcon />,
                progressStyle: {
                  background: '#00FFD1',
                  borderRadius: '8px',
                },
                style: {
                  background: '#1D2932',
                  boxShadow: '0px 0px 10px 10px rgba(0, 0, 0, 0.15)',
                  borderRadius: '8px',
                },
              }
            );
          }
          history.replace('/stableswap');
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
