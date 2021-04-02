import React, { useState } from 'react';
import FormWrap from '../forms/FormWrap';
import TokenAmount from '../forms/TokenAmount';
import { deposit, registerToken, TokenMetadata } from '../../services/token';
import { useDepositableBalance, useNeedToPayStorage } from '../../state/token';
import { toReadableNumber } from '~utils/numbers';

export default function Deposit({ tokens }: { tokens: TokenMetadata[] }) {
  const [amount, setAmount] = useState<string>();
  const [selectedToken, setSelectedToken] = useState<TokenMetadata>();

  const depositable = useDepositableBalance(selectedToken?.id);
  const max = toReadableNumber(selectedToken?.decimals, depositable) || 0;

  const needsToPayStorage = useNeedToPayStorage(selectedToken?.id);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (needsToPayStorage) return registerToken(selectedToken.id);

    deposit({
      token: selectedToken,
      amount,
    });
  };

  const title =
    selectedToken && needsToPayStorage
      ? 'Add storage to deposit token'
      : 'Deposit';

  return (
    <FormWrap
      buttonText={title}
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
      {needsToPayStorage &&
        'To deposit tokens you may need to first add storage.'}
    </FormWrap>
  );
}
