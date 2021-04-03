import React from 'react';
import { TokenMetadata } from '~/services/ft-contract';

export default function Icon({
  token,
  className = '',
  size = 6,
}: {
  token: TokenMetadata;
  className?: string;
  size?: number | string;
}) {
  return (
    <img className={`h-${size} w-${size} ${className}`} src={token.icon} />
  );
}
