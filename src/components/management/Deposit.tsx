import React, { useState } from 'react';
import FormWrap from '../forms/FormWrap';
import TokenAmount from '../forms/TokenAmount';
import { deposit, TokenMetadata } from '../../services/token';
import { useDepositableBalance } from '../../state/token';
import { toReadableNumber } from '~utils/numbers';

export default function Deposit({ tokens }: { tokens: TokenMetadata[] }) {
  const [amount, setAmount] = useState<string>();
  const [selectedToken, setSelectedToken] = useState<TokenMetadata>();

  const depositable = useDepositableBalance(selectedToken?.id);
  const max = toReadableNumber(selectedToken?.decimals, depositable) || 0;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    deposit({
      token: selectedToken,
      amount,
    });
  };

  return (
    <FormWrap
      buttonText="Deposit"
      canSubmit={!!amount && !!selectedToken}
      onSubmit={handleSubmit}
    >
      {selectedToken && (
        <h2>
          You can deposit up to {max} {selectedToken.symbol}
        </h2>
      )}
      <TokenAmount
        amount={amount}
        max={String(max)}
        tokens={tokens}
        selectedToken={selectedToken}
        onSelectToken={setSelectedToken}
        onChangeAmount={setAmount}
      />
    </FormWrap>
  );
}
