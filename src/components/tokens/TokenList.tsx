import React from 'react';
import { TokenMetadata } from '~services/token';
import Token from './Token';

interface TokenListProps {
  tokenIds: string[];
  onClick?: (id: string) => void;
  render?: (token: TokenMetadata) => React.ReactElement;
}

export default function TokenList({
  tokenIds,
  onClick,
  render,
}: TokenListProps) {
  const tokenElements = tokenIds.map((id) => (
    <li key={id}>
      <Token id={id} onClick={onClick} render={render} />
    </li>
  ));

  return <ul>{tokenElements}</ul>;
}
