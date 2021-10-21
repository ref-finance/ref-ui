import React from 'react';
import { toRealSymbol } from '~utils/token';
import { TokenMetadata } from '../../services/ft-contract';
import { ArrowDownWhite } from '~components/icon';

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
    <div
      className="flex items-center text-lg text-white"
      style={{ lineHeight: 'unset' }}
    >
      {label && <p className="block text-sm">{toRealSymbol(token.symbol)}</p>}
      <div className="pl-2 text-xs">
        <ArrowDownWhite />
      </div>
      <img
        key={token.id}
        className="ml-2 h-9 w-9 border rounded-full border-greenLight"
        src={token.icon}
      />
    </div>
  );
}
