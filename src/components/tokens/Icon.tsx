import React from 'react';
import { TokenMetadata } from '../../services/ft-contract';

export default function Icon({
  className = '',
  token,
  label = true,
  size = 6,
}: {
  className?: string;
  token: TokenMetadata;
  label?: boolean;
  size?: number | string;
}) {
  const icon =
    token.icon ||
    'https://fluxprotocol.eth.link/static/media/wrapped-near.8b3a5e4b.svg';
  return (
    <div className="flex items-center">
      <img className={`h-${size} w-${size} ${className}`} src={icon} />
      {label && <p className="ml-2 hidden sm:block">{token.symbol}</p>}
    </div>
  );
}
