import React from 'react';
import { toRoundedReadableNumber } from '../../utils/numbers';
import { TokenMetadata } from '../../services/ft-contract';
import { TokenBalancesView } from '../../services/token';
import Icon from '../tokens/Icon';
import InputAmount from './InputAmount';
import SelectToken from './SelectToken';
import { FaAngleDown } from 'react-icons/fa';

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
    <fieldset className="bg-inputBg relative grid grid-cols-12 rounded-lg p-2 align-center my-2">
      <InputAmount
        className="col-span-9"
        name={selectedToken?.id}
        max={max}
        value={amount}
        onChangeAmount={onChangeAmount}
      />
      <SelectToken
        tokens={tokens}
        render={balances ? render : null}
        selected={
          selectedToken && (
            <div className="flex items-center justify-end">
              <Icon token={selectedToken} />
              {tokens.length > 1 && (
                <FaAngleDown className="stroke-current text-inputText block ml-1" />
              )}
            </div>
          )
        }
        onSelect={onSelectToken}
      />
    </fieldset>
  );
}
