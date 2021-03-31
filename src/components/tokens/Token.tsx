import React from 'react';
import { TokenMetadata } from '~services/token';
import { useToken } from '~state/token';
import Icon from './Icon';

interface TokenProps {
  id: string;
  render?: (token: TokenMetadata) => React.ReactElement;
}

export default function Token({ id, render }: TokenProps) {
  const token = useToken(id);
  // TODO: loading screen
  if (!token) return null;

  return (
    <section className="max-w-sm leading-loose rounded overflow-hidden shadow-lg px-12 py-3">
      <Icon className="align-center m-auto" token={token} size="12" />
      <p>
        <span className="font-black">Name:</span> {token.name}
      </p>
      <p>
        <span className="font-black">Symbol:</span> {token.symbol}
      </p>
      {render && render(token)}
    </section>
  );
}
