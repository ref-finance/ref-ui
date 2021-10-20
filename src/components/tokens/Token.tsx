import React from 'react';
import { toRealSymbol } from '~utils/token';
import { TokenMetadata } from '../../services/ft-contract';
import { useDepositableBalance, useTokenBalances } from '~state/token';
import {
  toPrecision,
  toReadableNumber,
  toNonDivisibleNumber,
  toRoundedReadableNumber,
} from '~utils/numbers';
import { AiOutlineConsoleSql } from 'react-icons/ai';

interface TokenProps {
  token: TokenMetadata;
  onClick: (token: TokenMetadata) => void;
  render?: (token: TokenMetadata) => React.ReactElement;
  totalAmount?: string;
  sortBy?: string;
}

export default function Token({
  token,
  onClick,
  render,
  totalAmount,
  sortBy,
}: TokenProps) {
  const { icon, symbol, id, decimals } = token;
  const totalTokenAmount = toReadableNumber(
    decimals,
    useDepositableBalance(id)
  );

  const tokenAmount = toPrecision(totalTokenAmount, 3) || '0';
  return (
    <tr
      key={id}
      className="hover:bg-black hover:bg-opacity-10"
      onClick={() => onClick && onClick(token)}
      title={totalAmount ? totalAmount : totalTokenAmount}
    >
      <td className="text-sm pl-6 py-5">
        {icon ? (
          <img
            className="h-6 w-6 mr-3 inline-block"
            src={icon}
            alt={toRealSymbol(symbol)}
          />
        ) : (
          <span className="h-6 w-6 mr-3"></span>
        )}
        <span className="inline-block text-white">{toRealSymbol(symbol)}</span>
      </td>
      <td className={`py-4 ${sortBy === 'near' ? 'text-white' : ''}`}>
        {tokenAmount}
      </td>
      <td className={`py-4 ${sortBy === 'ref' ? 'text-white' : ''}`}>
        {render(token)}
      </td>
      <td className={`pr-6 py-4 ${sortBy === 'total' ? 'text-white' : ''}`}>
        {Number(render(token)) + Number(tokenAmount)}
      </td>
    </tr>
  );
}
