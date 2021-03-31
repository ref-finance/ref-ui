import React from 'react';
import { TokenMetadata } from '~services/token';
import { useToken } from '~state/token';
import Icon from './Icon';

interface TokenProps {
  id: string;
  onClick: (id: string) => void;
  render?: (token: TokenMetadata) => React.ReactElement;
}

export default function Token({ id, onClick, render }: TokenProps) {
  const token = useToken(id);
  // TODO: loading screen
  if (!token) return null;

  return (
    <section
      className="grid grid-cols-3 align-center py-2"
      onClick={() => onClick(id)}
    >
      <Icon token={token} />
      <p>{token.symbol}</p>
      {render && render(token)}
    </section>
  );
}
