import React, { useState } from 'react';
import FormWrap from '../forms/FormWrap';
import TokenAmount from '../forms/TokenAmount';
import { TokenMetadata } from '../../services/ft-contract';
import { withdraw } from '../../services/token';
import { useTokenBalances } from '../../state/token';
import { toReadableNumber } from '../../utils/numbers';
import { unwrapNear, WRAP_NEAR_CONTRACT_ID } from '../../services/wrap-near';

export default function Withdraw({ tokens }: { tokens: TokenMetadata[] }) {
  const balances = useTokenBalances();

  const [amount, setAmount] = useState<string>();
  const [selectedToken, setSelectedToken] = useState<TokenMetadata>(
    tokens.find((token) => token.id === WRAP_NEAR_CONTRACT_ID)
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (selectedToken.id === WRAP_NEAR_CONTRACT_ID) {
      unwrapNear(amount);
    }

    return withdraw({
      token: selectedToken,
      amount,
    });
  };

  return (
    <FormWrap
      buttonText="Withdraw"
      canSubmit={!!amount && !!selectedToken}
      onSubmit={handleSubmit}
    >
      <TokenAmount
        amount={amount}
        max={toReadableNumber(
          selectedToken?.decimals,
          balances?.[selectedToken?.id] || '0'
        )}
        tokens={tokens}
        selectedToken={selectedToken}
        balances={balances}
        onSelectToken={setSelectedToken}
        onChangeAmount={setAmount}
      />
    </FormWrap>
  );
}
