import React, { useEffect, useState } from 'react';
import FormWrap from '../forms/FormWrap';
import TokenAmount from '../forms/TokenAmount';
import { TokenMetadata } from '../../services/ft-contract';
import { deposit } from '../../services/token';
import { useDepositableBalance } from '../../state/token';
import { toPrecision, toReadableNumber } from '../../utils/numbers';
import { nearMetadata, wrapNear } from '../../services/wrap-near';
import { wallet } from '../../services/near';

export default function Deposit({ tokens }: { tokens: TokenMetadata[] }) {
  const [amount, setAmount] = useState<string>();
  const [selectedToken, setSelectedToken] = useState<TokenMetadata>(
    nearMetadata
  );
  const [nearBalance, setNearBalance] = useState<string>();

  const depositable = useDepositableBalance(selectedToken?.id);
  const max =
    toReadableNumber(
      selectedToken?.decimals,
      selectedToken?.id === nearMetadata.id ? nearBalance : depositable
    ) || '0';

  useEffect(() => {
    wallet
      .account()
      .getAccountBalance()
      .then(({ available }) => setNearBalance(available));
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (selectedToken.id === nearMetadata.id) {
      return wrapNear(amount);
    }

    return deposit({
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
        <h2 className="text-center">
          You can deposit up to {toPrecision(max, 4, true)}{' '}
          {selectedToken.symbol}.
        </h2>
      )}
      <TokenAmount
        amount={amount}
        max={String(max)}
        tokens={tokens && [nearMetadata, ...tokens]}
        selectedToken={selectedToken}
        onSelectToken={setSelectedToken}
        onChangeAmount={setAmount}
      />
    </FormWrap>
  );
}
