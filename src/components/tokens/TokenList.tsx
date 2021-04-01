import React from 'react';
import { TokenMetadata } from '~services/token';
import Token from './Token';

interface TokenListProps {
  tokens: TokenMetadata[];
  onClick?: (token: TokenMetadata) => void;
  render?: (token: TokenMetadata) => React.ReactElement;
}

export default function TokenList({ tokens, onClick, render }: TokenListProps) {
  const tokenElements = tokens.map((token) => (
    <li className="text-lg"key={token.id}>
      <Token token={token} onClick={onClick} render={render} />
    </li>
  ));

  return <ul>{tokenElements}</ul>;
}
