import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getPool, Pool } from '../services/pool';
import { TokenMetadata } from '../services/ft-contract';
import { percentLess, toReadableNumber } from '../utils/numbers';
import { checkTransaction, estimateSwap, swap } from '../services/swap';
import { useHistory, useLocation } from 'react-router';
import getConfig from '~services/config';
import { FormattedMessage, useIntl } from 'react-intl';
import { CloseIcon } from '~components/icon/Actions';
import db from '../store/RefDatabase';

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
  const refreshTime = 10000;

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
}: {
  tokenIn: TokenMetadata;
  tokenInAmount: string;
  tokenOut: TokenMetadata;
  slippageTolerance: number;
}) => {
  const [pool, setPool] = useState<Pool>();
  const [tokenOutAmount, setTokenOutAmount] = useState<string>('0');
  const [canSwap, setCanSwap] = useState<boolean>(false);

  useEffect(() => {
    getPool(10).then(setPool);
  }, []);

  useEffect(() => {
    if (!pool) return;
    const in_balance = toReadableNumber(
      tokenIn.decimals,
      pool.supplies[tokenIn.id]
    );
    const out_balance = toReadableNumber(
      tokenOut.decimals,
      pool.supplies[tokenOut.id]
    );

    const newTokenOutAmount = (
      (Number(tokenInAmount) * Number(out_balance)) /
      (Number(tokenInAmount) + Number(in_balance))
    ).toString();

    setTokenOutAmount(newTokenOutAmount);
    if (Number(newTokenOutAmount)) setCanSwap(true);
  }, [pool, tokenInAmount, tokenIn, tokenOut]);

  const minAmountOut = percentLess(slippageTolerance, tokenOutAmount);

  return {
    pool,
    tokenOutAmount,
    minAmountOut,
    canSwap,
  };
};
