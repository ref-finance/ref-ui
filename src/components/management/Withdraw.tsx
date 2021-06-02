import React, { useState } from 'react';
import FormWrap from '../forms/FormWrap';
import TokenAmount from '../forms/TokenAmount';
import { TokenMetadata } from '../../services/ft-contract';
import { withdraw } from '../../services/token';
import { useTokenBalances } from '../../state/token';
import { toReadableNumber } from '../../utils/numbers';
import { unwrapNear, WRAP_NEAR_CONTRACT_ID } from '../../services/wrap-near';
import copy from '../../utils/copy';

export default function Withdraw({ tokens }: { tokens: TokenMetadata[] }) {
  const balances = useTokenBalances();

  const [amount, setAmount] = useState<string>('');
  const [selectedToken, setSelectedToken] = useState<TokenMetadata>(
    tokens.find((token) => token.id === WRAP_NEAR_CONTRACT_ID) || tokens[0]
  );

  const info =
    selectedToken?.id === WRAP_NEAR_CONTRACT_ID
      ? copy.nearWithdraw
      : copy.withdraw;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (selectedToken.id === WRAP_NEAR_CONTRACT_ID) {
      return unwrapNear(amount);
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
      info={info}
    >
      <TokenAmount
        amount={amount}
        max={toReadableNumber(
          selectedToken?.decimals,
          balances?.[selectedToken?.id] || '0'
        )}
        total={toReadableNumber(
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
