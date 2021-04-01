import { useEffect, useState } from 'react';
import { estimateSwap, swap } from '../services/swap';

interface SwapOptions {
  tokenInId: string;
  tokenInAmount: string;
  tokenOutId: string;
}

export const useSwap = ({
  tokenInId,
  tokenInAmount,
  tokenOutId,
}: SwapOptions) => {
  const [poolId, setPoolId] = useState<number>();
  const [canSwap, setCanSwap] = useState<boolean>();
  const [tokenOutAmount, setTokenOutAmount] = useState<string>();

  useEffect(() => {
    if (tokenInId && tokenOutId && tokenInAmount) {
      estimateSwap({
        tokenInId,
        tokenOutId,
        amountIn: tokenInAmount,
      })
        .then(({ estimate, poolId }) => {
          setCanSwap(true);
          setTokenOutAmount(estimate);
          setPoolId(poolId);
        })
        .catch(() => setCanSwap(false));
    }
  }, [tokenInId, tokenOutId, tokenInAmount]);

  const makeSwap = () => {
    swap({
      poolId,
      tokenInId,
      amountIn: tokenInAmount,
      tokenOutId,
      minAmountOut: tokenOutAmount,
    });
  };

  return { canSwap, tokenOutAmount, makeSwap };
};
