import React from 'react';
import { TokenMetadata } from '~services/token';
import Token from './Token';

interface TokenListProps {
  tokenIds: string[];
  render?: (token: TokenMetadata) => React.ReactElement;
}

export default function TokenList({ tokenIds, render }: TokenListProps) {
  const tokenElements = tokenIds.map((id) => (
    <li key={id}>
      <Token id={id} render={render} />
    </li>
  ));

  return <ul className="grid grid-cols-2">{tokenElements}</ul>;
}
