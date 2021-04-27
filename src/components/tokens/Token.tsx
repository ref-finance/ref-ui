import React from 'react';
import { TokenMetadata } from '../../services/ft-contract';
import Icon from './Icon';

interface TokenProps {
  token: TokenMetadata;
  onClick: (token: TokenMetadata) => void;
  render?: (token: TokenMetadata) => React.ReactElement;
}

export default function Token({ token, onClick, render }: TokenProps) {
  const { icon, symbol } = token;
  return (
    <section
      className={`${
        onClick ? 'cursor-pointer' : ' '
      } flex justify-between align-center py-4 px-2 w-full text-center hover:bg-secondaryScale-100`}
      onClick={() => onClick && onClick(token)}
    >
      <div className="w-32">
        <div
          className="flex items-center text-xs"
          style={{ lineHeight: 'unset' }}
        >
          {icon ? (
            <img className="h-6 w-6 mr-3" src={icon} alt={symbol} />
          ) : (
            <div className="h-6 w-6 mr-3"></div>
          )}
          <p className="hidden sm:block">{symbol}</p>
        </div>
      </div>
      {render && render(token)}
    </section>
  );
}