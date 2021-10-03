import React from 'react';
import { toRealSymbol } from '~utils/token';
import { TokenMetadata } from '../../services/ft-contract';
import { useDepositableBalance } from '~state/token';
import { toPrecision, toReadableNumber, toNonDivisibleNumber } from '~utils/numbers';

interface TokenProps {
  token: TokenMetadata;
  onClick: (token: TokenMetadata) => void;
  render?: (token: TokenMetadata) => React.ReactElement;
  totalAmount?: string;
}

export default function Token({
  token,
  onClick,
  render,
  totalAmount,
}: TokenProps) {
  const { icon, symbol, id, decimals } = token;
  const totalTokenAmount = toReadableNumber(
    decimals,
    useDepositableBalance(id)
  );
  
  const tokenAmount = toPrecision(totalTokenAmount, 6) || '0';
  return (
    <section
      className={`${
        onClick ? 'cursor-pointer' : ' '
      } flex justify-between align-center py-4 px-2 w-full text-center hover:bg-secondaryScale-100`}
      onClick={() => onClick && onClick(token)}
      title={
        totalAmount ? totalAmount : totalTokenAmount
      }
    >
      <div className="w-full text-left">
        <div
          className="flex items-center text-xs"
          style={{ lineHeight: 'unset' }}
        >
          {icon ? (
            <img
              className="h-6 w-6 mr-3"
              src={icon}
              alt={toRealSymbol(symbol)}
            />
          ) : (
            <div className="h-6 w-6 mr-3"></div>
          )}
          <div className="block">{toRealSymbol(symbol)}</div>
        </div>
      </div>
      {render ? render(token) : tokenAmount}
    </section>
  );
}
