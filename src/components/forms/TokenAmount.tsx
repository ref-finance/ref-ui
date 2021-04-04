import React from 'react';
import { toRoundedReadableNumber } from '../../utils/numbers';
import { TokenMetadata } from '../../services/ft-contract';
import { TokenBalancesView } from '../../services/token';
import Icon from '../tokens/Icon';
import InputAmount from './InputAmount';
import SelectToken from './SelectToken';

interface TokenAmountProps {
  amount?: string;
  max?: string;
  tokens: TokenMetadata[];
  selectedToken: TokenMetadata;
  balances?: TokenBalancesView;
  onMax?: (input: HTMLInputElement) => void;
  onSelectToken?: (token: TokenMetadata) => void;
  onChangeAmount?: (amount: string) => void;
}

export default function TokenAmount({
  amount,
  max,
  tokens,
  selectedToken,
  balances,
  onSelectToken,
  onChangeAmount,
}: TokenAmountProps) {
  const render = (token: TokenMetadata) => (
    <p>
      {toRoundedReadableNumber({
        decimals: token.decimals,
        number: balances[token.id],
      })}
    </p>
  );

  return (
    <fieldset className="relative grid grid-cols-12 align-center">
      <InputAmount
        className="col-span-11"
        name={selectedToken?.id}
        max={max}
        value={amount}
        onChangeAmount={onChangeAmount}
      />
      <SelectToken
        tokens={tokens}
        render={balances ? render : null}
        selected={selectedToken && <Icon token={selectedToken} />}
        onSelect={onSelectToken}
      />
    </fieldset>
  );
}
