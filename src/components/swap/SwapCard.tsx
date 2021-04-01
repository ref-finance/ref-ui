import React, { useState } from 'react';
import FormWrap from '~components/forms/FormWrap';
import TokenAmount from '~components/forms/TokenAmount';
import Alert from '~components/alert/Alert';
import { TokenMetadata } from '~services/token';
import { useRegisteredTokens, useTokenBalances } from '~state/token';
import { useSwap } from '../../state/swap';

export default function SwapCard() {
  const [tokenIn, setTokenIn] = useState<TokenMetadata>();
  const [tokenInAmount, setTokenInAmount] = useState<string>('');
  const [tokenOut, setTokenOut] = useState<TokenMetadata>();

  const tokens = useRegisteredTokens();
  const balances = useTokenBalances();

  const { canSwap, tokenOutAmount, swapError, makeSwap } = useSwap({
    tokenIn: tokenIn,
    tokenInAmount,
    tokenOut: tokenOut,
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    makeSwap();
  };

  return (
    <FormWrap title="Swap" canSubmit={canSwap} onSubmit={handleSubmit}>
      {swapError && <Alert level="error" message={swapError.message} />}
      <TokenAmount
        amount={tokenInAmount}
        max={balances?.[tokenIn?.id]}
        tokens={tokens}
        selectedToken={tokenIn}
        onSelectToken={(token) => setTokenIn(token)}
        onChangeAmount={setTokenInAmount}
      />
      <TokenAmount
        amount={tokenOutAmount}
        tokens={tokens}
        selectedToken={tokenOut}
        onSelectToken={(token) => setTokenOut(token)}
      />
    </FormWrap>
  );
}
