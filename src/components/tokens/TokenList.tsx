import React from 'react';
import { TokenMetadata } from '../../services/ft-contract';
import Token from './Token';

interface TokenListProps {
  tokens: TokenMetadata[];
  onClick?: (token: TokenMetadata) => void;
  render?: (token: TokenMetadata) => React.ReactElement;
}

export default function TokenList({ tokens, onClick, render }: TokenListProps) {
  const tokenElements = tokens.map((token) => (
    <div className="text-xs font-semibold" key={token.id}>
      <Token token={token} onClick={onClick} render={render} />
    </div>
  ));

  return <div className="divide-y">{tokenElements}</div>;
}