import React from 'react';
import { TokenMetadata } from '../../services/token';
import Icon from '../tokens/Icon';
import InputAmount from './InputAmount';
import SelectToken from './SelectToken';

interface TokenAmountProps {
  amount?: string;
  max?: string;
  tokens: TokenMetadata[];
  selectedToken: TokenMetadata;
  onSelectToken?: (token: TokenMetadata) => void;
  onChangeAmount?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function TokenAmount({
  amount,
  max,
  tokens,
  selectedToken,
  onSelectToken,
  onChangeAmount,
}: TokenAmountProps) {
  return (
    <fieldset className="relative grid grid-cols-12 align-center">
      <InputAmount
        className="col-span-11"
        name={selectedToken?.id}
        value={amount}
        onMax={max ? (input) => (input.value = max) : null}
        onChange={onChangeAmount}
      />
      <SelectToken
        tokens={tokens}
        selected={selectedToken && <Icon token={selectedToken} />}
        onSelect={onSelectToken}
      />
    </fieldset>
  );
}
