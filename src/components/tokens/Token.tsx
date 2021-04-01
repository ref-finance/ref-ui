import React from 'react';
import { TokenMetadata } from '~services/token';
import Icon from './Icon';

interface TokenProps {
  token: TokenMetadata;
  onClick: (token: TokenMetadata) => void;
  render?: (token: TokenMetadata) => React.ReactElement;
}

export default function Token({ token, onClick, render }: TokenProps) {
  return (
    <section
      className="grid grid-cols-3 align-center py-2 w-full text-center hover:bg-gray-50 cursor-pointer"
      onClick={() => onClick(token)}
    >
      <Icon token={token} />
      <p>{token.symbol}</p>
      {render && render(token)}
    </section>
  );
}
