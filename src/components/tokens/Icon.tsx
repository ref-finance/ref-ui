import React from 'react';
import { toRealSymbol } from '../../utils/token';
import { TokenMetadata } from '../../services/ft-contract';
import { ArrowDownWhite } from '../../components/icon';
import { ArrowDownGreen } from '../icon/Arrows';

export default function Icon({
  className = '',
  token,
  label = true,
  size = 6,
  showArrow = true,
  hover,
}: {
  className?: string;
  token: TokenMetadata;
  label?: boolean;
  size?: number | string;
  showArrow?: boolean;
  hover?: boolean;
}) {
  return (
    <div
      className={`flex items-center text-lg text-white   rounded-full ${
        hover ? 'pl-4 bg-black bg-opacity-20 cursor-pointer' : ''
      }`}
      style={{ lineHeight: 'unset' }}
    >
      {label && <p className="block text-sm">{toRealSymbol(token.symbol)}</p>}
      {showArrow && (
        <div className="pl-2 xs:pl-1 text-xs">
          {hover ? <ArrowDownGreen /> : <ArrowDownWhite />}
        </div>
      )}
      <img
        key={token.id}
        className="ml-2 xs:ml-1 h-9 w-9 xs:h-7 xs:w-7 border rounded-full border-greenLight"
        src={token.icon}
      />
    </div>
  );
}

export function IconLeft({
  className = '',
  token,
  label = true,
  size = 6,
  showArrow = true,
  hover,
}: {
  className?: string;
  token: TokenMetadata;
  label?: boolean;
  size?: number | string;
  showArrow?: boolean;
  hover?: boolean;
}) {
  return (
    <div
      className={`flex items-center text-lg text-white   rounded-full flex-shrink-0 ${
        hover ? 'pr-4 bg-black bg-opacity-20 cursor-pointer' : ''
      }`}
      style={{ lineHeight: 'unset' }}
    >
      <img
        key={token.id}
        className="mr-2 xs:ml-0 xs:mr-1 xs:relative xs:right-1 h-11 w-11 xs:h-7 xs:w-7 border rounded-full border-greenLight"
        src={token.icon}
      />
      {label && (
        <p className="block text-lg xs:text-sm">{toRealSymbol(token.symbol)}</p>
      )}
      {showArrow && (
        <div className="pl-2 xs:pl-1 text-xs">
          {hover ? <ArrowDownGreen /> : <ArrowDownWhite />}
        </div>
      )}
    </div>
  );
}
