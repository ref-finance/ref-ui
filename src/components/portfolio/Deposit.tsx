import React, { useState } from 'react';
import FormWrap from '../forms/FormWrap';
import TokenAmount from '../forms/TokenAmount';
import { deposit, TokenMetadata } from '../../services/token';
import { useDepositableBalance } from '../../state/token';

export default function Deposit({ tokens }: { tokens: TokenMetadata[] }) {
  const [amount, setAmount] = useState<string>();
  const [selectedToken, setSelectedToken] = useState<TokenMetadata>();

  const depositable = useDepositableBalance(selectedToken?.id);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    deposit({
      tokenId: selectedToken.id,
      amount,
    });
  };

  return (
    <FormWrap title="Deposit" onSubmit={handleSubmit}>
      <TokenAmount
        amount={amount}
        max={depositable}
        tokens={tokens}
        selectedToken={selectedToken}
        onSelectToken={setSelectedToken}
        onChangeAmount={setAmount}
      />
    </FormWrap>
  );
}
