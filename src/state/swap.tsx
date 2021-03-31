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
  const [tokenOutAmount, setTokenOutAmount] = useState<string>();

  useEffect(() => {
    if (tokenInId && tokenOutId && tokenInAmount) {
      estimateSwap({
        tokenInId,
        tokenOutId,
        amountIn: tokenInAmount,
      }).then(({ estimate, poolId }) => {
        setTokenOutAmount(estimate);
        setPoolId(poolId);
      });
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

  return { tokenOutAmount, makeSwap };
};
