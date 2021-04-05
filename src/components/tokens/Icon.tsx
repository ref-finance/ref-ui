import React from 'react';
import { TokenMetadata } from '../../services/ft-contract';

export default function Icon({
  token,
  className = '',
  size = 6,
}: {
  token: TokenMetadata;
  className?: string;
  size?: number | string;
}) {
  const icon =
    token.icon ||
    'https://fluxprotocol.eth.link/static/media/wrapped-near.8b3a5e4b.svg';
  return (
    <div className="flex items-center">
      <img className={`h-${size} w-${size} ${className}`} src={icon} />
      <p className="ml-2 hidden sm:block">{token.symbol}</p>
    </div>
  );
}
