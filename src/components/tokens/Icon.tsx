import React from 'react';
import { toRealSymbol } from '~utils/token';
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
  return (
    <div className="flex items-center text-xs" style={{ lineHeight: 'unset' }}>
      {label && <p className="block">{toRealSymbol(token.symbol)}</p>}
    </div>
  );
}
