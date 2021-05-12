import React from 'react';
import { WRAP_NEAR_CONTRACT_ID } from '~services/wrap-near';
import { TokenMetadata } from '../../services/ft-contract';
import Token from './Token';

interface TokenListProps {
  tokens: TokenMetadata[];
  onClick?: (token: TokenMetadata) => void;
  render?: (token: TokenMetadata) => React.ReactElement;
}

export default function TokenList({ tokens, onClick, render }: TokenListProps) {
  const tokenElements = tokens.map((token) => (token.id != WRAP_NEAR_CONTRACT_ID &&
    <div className="text-xs font-semibold" key={token.id}>
      <Token token={token} onClick={onClick} render={render} />
    </div>
  ));

  return <div className="divide-y">{tokenElements}</div>;
}