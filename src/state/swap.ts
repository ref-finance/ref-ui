import { useEffect, useState } from 'react';
import { Pool } from '~services/pool';
import { TokenMetadata } from '~services/token';
import { estimateSwap, swap } from '../services/swap';

interface SwapOptions {
  tokenIn: TokenMetadata;
  tokenInAmount: string;
  tokenOut: TokenMetadata;
}

export const useSwap = ({ tokenIn, tokenInAmount, tokenOut }: SwapOptions) => {
  const [pool, setPool] = useState<Pool>();
  const [canSwap, setCanSwap] = useState<boolean>();
  const [tokenOutAmount, setTokenOutAmount] = useState<string>('');
  const [swapError, setSwapError] = useState<Error>();

  useEffect(() => {
    if (tokenIn && tokenOut && tokenInAmount) {
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
      poolId: pool.id,
      tokenIn,
      amountIn: tokenInAmount,
      tokenOut,
      minAmountOut: tokenOutAmount,
    });
  };

  if (pool) {
    console.log('OUT', tokenOutAmount);
    console.log('TO FEES', (pool.fee / 10000) * Number(tokenInAmount));
    console.log('MIN', Number(tokenOutAmount) * 0.001);
  }

  return { canSwap, tokenOutAmount, swapError, makeSwap };
};
