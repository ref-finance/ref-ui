import React, { useState } from 'react';
import FormWrap from '~components/forms/FormWrap';
import TokenAmount from '~components/forms/TokenAmount';
import InputAmount from '~components/forms/InputAmount';
import SelectToken from '~components/forms/SelectToken';
import Icon from '~components/tokens/Icon';
import { TokenMetadata } from '~services/token';
import { useRegisteredTokens, useTokenBalances } from '~state/token';
import { useSwap } from '../../state/swap';

export default function SwapCard() {
  const [tokenIn, setTokenIn] = useState<TokenMetadata>();
  const [tokenInAmount, setTokenInAmount] = useState<string>();
  const [tokenOut, setTokenOut] = useState<TokenMetadata>();

  const tokens = useRegisteredTokens();
  const balances = useTokenBalances();

  const { canSwap, tokenOutAmount, makeSwap } = useSwap({
    tokenInId: tokenIn?.id,
    tokenInAmount,
    tokenOutId: tokenOut?.id,
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    makeSwap();
  };

  return (
    <FormWrap title="Swap" canSubmit={canSwap} onSubmit={handleSubmit}>
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
