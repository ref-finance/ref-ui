import { useEffect, useState } from 'react';
import { Pool } from '~services/pool';
import { TokenMetadata } from '~services/ft-contract';
import { percentLess } from '~utils/numbers';
import { estimateSwap, swap } from '../services/swap';

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
  const minAmountOut = tokenOutAmount
    ? String(percentLess(slippageTolerance, tokenOutAmount))
    : null;

  useEffect(() => {
    setCanSwap(false);
    console.log(tokenInAmount);
    if (tokenIn && tokenOut && tokenInAmount && tokenIn.id !== tokenOut.id) {
      setSwapError(null);
      estimateSwap({
        tokenIn,
        tokenOut,
        amountIn: tokenInAmount,
      })
        .then(({ estimate, pool }) => {
          if (!estimate || !pool) throw '';
          setCanSwap(true);
          setTokenOutAmount(estimate);
          setPool(pool);
        })
        .catch((err) => {
          setCanSwap(false);
          setTokenOutAmount('');
          setSwapError(err);
        });
    }
  }, [tokenIn, tokenOut, tokenInAmount]);

  const makeSwap = () => {
    swap({
      pool,
      tokenIn,
      amountIn: tokenInAmount,
      tokenOut,
      minAmountOut,
    });
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
