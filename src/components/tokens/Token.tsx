import React from 'react';
import { toRealSymbol } from '~utils/token';
import { TokenMetadata } from '../../services/ft-contract';
import { toInternationalCurrencySystem } from '~utils/numbers';
import { toPrecision } from '../../utils/numbers';

interface TokenProps {
  token: TokenMetadata;
  onClick: (token: TokenMetadata) => void;
  totalAmount?: string;
  sortBy?: string;
}

export default function Token({ token, onClick, sortBy }: TokenProps) {
  const { icon, symbol, id, near, ref, total } = token;

  const displayBalance =
    0 < Number(near) && Number(near) < 0.001
      ? '< 0.001'
      : toPrecision(String(near), 3);

  return (
    <tr
      key={id}
      className="hover:bg-black hover:bg-opacity-10"
      onClick={() => onClick && onClick(token)}
    >
      <td className="xs:text-xs text-sm pl-8 py-3 cursor-pointer w-4/5">
        {icon ? (
          <img
            className="h-6 w-6 mr-3 inline-block border rounded-full border-greenLight"
            src={icon}
            alt={toRealSymbol(symbol)}
          />
        ) : (
          <span className="h-6 w-6 mr-3"></span>
        )}
        <span className="inline-block text-white">{toRealSymbol(symbol)}</span>
      </td>
      <td
        className={`py-4 xs:text-xs text-sm w-1/5 pr-10 text-right ${
          sortBy === 'near' ? 'text-white' : ''
        }`}
      >
        {displayBalance}
      </td>
    </tr>
  );
}
