import React from 'react';
import { WRAP_NEAR_CONTRACT_ID } from '~services/wrap-near';
import { TokenMetadata } from '../../services/ft-contract';
import Token from './Token';
import { TokenBalancesView } from '~services/token';
import { toReadableNumber } from '~utils/numbers';

interface TokenListProps {
  tokens: TokenMetadata[];
  onClick?: (token: TokenMetadata) => void;
  render?: (token: TokenMetadata) => React.ReactElement;
  calledBy?: string;
  balances?: TokenBalancesView;
}

export default function TokenList({
  tokens,
  onClick,
  render,
  calledBy,
  balances,
}: TokenListProps) {
  const balanceToAmount = (token: TokenMetadata) => {
    return Number(toReadableNumber(token.decimals, balances[token.id])) || 0;
  };

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

  const tokenElements = tokens.map((token) => (
    <div
      className="text-xs font-semibold"
      key={token.id}
      title={token.id}
      data-amount={balanceToAmount(token)}
    >
      <Token token={token} onClick={onClick} render={render} />
    </div>
  ));

  return <div className="divide-y">{tokenElements}</div>;
}
