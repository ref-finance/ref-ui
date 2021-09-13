import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Pool } from '../services/pool';
import { TokenMetadata } from '../services/ft-contract';
import { percentLess } from '../utils/numbers';
import { checkTransaction, estimateSwap, swap } from '../services/swap';
import { useHistory, useLocation } from 'react-router';

const ONLY_ZEROS = /^0*\.?0*$/;

interface SwapOptions {
  tokenIn: TokenMetadata;
  tokenInAmount: string;
  tokenOut: TokenMetadata;
  slippageTolerance: number;
}

export const useSwap = ({
  tokenIn,
  tokenInAmount,
  tokenOut,
  slippageTolerance,
}: SwapOptions) => {
  const [pool, setPool] = useState<Pool>();
  const [canSwap, setCanSwap] = useState<boolean>();
  const [tokenOutAmount, setTokenOutAmount] = useState<string>('');
  const [swapError, setSwapError] = useState<Error>();
  const [count, setCount] = useState(0);

  const { search } = useLocation();
  const history = useHistory();
  const txHash = new URLSearchParams(search).get('transactionHashes');

  const minAmountOut = tokenOutAmount
    ? percentLess(slippageTolerance, tokenOutAmount)
    : null;

  useEffect(() => {
    if (txHash) {
      checkTransaction(txHash)
        .then(({ transaction }) => {
          return (
            transaction?.actions[1]?.['FunctionCall']?.method_name ===
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
                className="text-primary font-semibold"
                href={`https://explorer.near.org/transactions/${txHash}`}
                target="_blank"
              >
                Swap successful. Click to view
              </a>
            );
          }
          history.replace('');
        });
    }
  }, []);

  useEffect(() => {
    setCanSwap(false);
    if (
      tokenIn &&
      tokenOut &&
      tokenInAmount &&
      !ONLY_ZEROS.test(tokenInAmount) &&
      tokenIn.id !== tokenOut.id
    ) {
      const nts = new Date().getTime().toString();
      setSwapError(null);
      estimateSwap({
        tokenIn,
        tokenOut,
        amountIn: tokenInAmount,
        ts: nts,
      })
        .then(({ estimate, pool, ts }) => {
          if (!estimate || !pool) throw '';
          if (nts === ts) {
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
    }
  }, [tokenIn, tokenOut, tokenInAmount]);

  useEffect(() => {
    if (count > 0) {
      if (
        tokenIn &&
        tokenOut &&
        tokenInAmount &&
        !ONLY_ZEROS.test(tokenInAmount) &&
        tokenIn.id !== tokenOut.id
      ) {
        const nts = new Date().getTime().toString();
        setSwapError(null);
        estimateSwap({
          tokenIn,
          tokenOut,
          amountIn: tokenInAmount,
          ts: nts,
        })
          .then(({ estimate, pool, ts }) => {
            if (!estimate || !pool) throw '';
            if (nts === ts) {
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
      }
    }
    const id = setInterval(() => {
      setCount(count + 1);
    }, 30000);
    return () => clearInterval(id);
  }, [count]);

  const makeSwap = () => {
    swap({
      pool,
      tokenIn,
      amountIn: tokenInAmount,
      tokenOut,
      minAmountOut,
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
