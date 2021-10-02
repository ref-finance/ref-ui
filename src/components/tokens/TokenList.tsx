import React from 'react';
import { TokenMetadata } from '../../services/ft-contract';
import Token from './Token';
import { TokenBalancesView } from '~services/token';
import { toReadableNumber } from '~utils/numbers';

interface TokenListProps {
  tokens: TokenMetadata[];
  onClick?: (token: TokenMetadata) => void;
  render?: (token: TokenMetadata) => React.ReactElement;
  balances?: TokenBalancesView;
}

export default function TokenList({
  tokens,
  onClick,
  render,
  balances,
}: TokenListProps) {
  const balanceToAmount = (token: TokenMetadata) => {
    return balances
      ? Number(toReadableNumber(token.decimals, balances[token.id])) || 0
      : 0;
  };

  if (balances) {
    tokens.sort((a, b) => {
      const aAmount = balanceToAmount(a);
      const bAmount = balanceToAmount(b);
      if (aAmount > bAmount) {
        return -1;
      } else {
        return 1;
      }
      return 0;
    });
  }

  const tokenElements = tokens.map((token) => (
    <div
      className="text-xs font-semibold"
      key={token.id}
      data-amount={balanceToAmount(token)}
    >
      <Token
        token={token}
        onClick={onClick}
        render={render}
        totalAmount={
          balances ? toReadableNumber(token.decimals, balances[token.id]) : ''
        }
      />
    </div>
  ));

  return <div className="divide-y">{tokenElements}</div>;
}
