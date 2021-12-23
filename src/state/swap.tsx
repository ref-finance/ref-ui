import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getPool, Pool, StablePool } from '../services/pool';

import { estimateSwap as estimateStableSwap } from '~services/stable-swap';

import { TokenMetadata } from '../services/ft-contract';
import { percentLess, toReadableNumber } from '../utils/numbers';
import { checkTransaction, estimateSwap, swap } from '../services/swap';

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
}: SwapOptions) => {
  const [pool, setPool] = useState<Pool>();
  const [canSwap, setCanSwap] = useState<boolean>();
  const [tokenOutAmount, setTokenOutAmount] = useState<string>('');
  const [swapError, setSwapError] = useState<Error>();

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

  useEffect(() => {
    setCanSwap(false);
    if (tokenIn && tokenOut && tokenIn.id !== tokenOut.id) {
      setSwapError(null);
      estimateSwap({
        tokenIn,
        tokenOut,
        amountIn: tokenInAmount,
        intl,
        setLoadingData,
        loadingTrigger,
        setLoadingTrigger,
      })
        .then(({ estimate, pool }) => {
          if (!estimate || !pool) throw '';
          if (tokenInAmount && !ONLY_ZEROS.test(tokenInAmount)) {
            setCanSwap(true);
            setTokenOutAmount(estimate);
            setPool(pool);
          }
        })
        .catch((err) => {
          setCanSwap(false);
          setTokenOutAmount('');
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
  }, [tokenIn, tokenOut, tokenInAmount, loadingTrigger]);

  useEffect(() => {
    let id: any = null;
    if (!loadingTrigger) {
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
  }, [count, loadingTrigger]);

  const makeSwap = (useNearBalance: boolean) => {
    swap({
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
            setTokenOutAmount(estimate);
            setPool(pool);
            setNoFeeAmount(dy);
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
  }, [tokenIn, tokenOut, tokenInAmount, loadingTrigger]);

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
