import React from 'react';
import { toRealSymbol } from '~utils/token';
import { TokenMetadata } from '../../services/ft-contract';
import { toInternationalCurrencySystem } from '~utils/numbers';
import { toPrecision } from '../../utils/numbers';
import { SingleToken } from '../forms/SelectToken';

interface TokenProps {
  token: TokenMetadata;
  onClick: (token: TokenMetadata) => void;
  totalAmount?: string;
  sortBy?: string;
  price?: string;
  index?: number;
}

export default function Token({
  token,
  onClick,
  sortBy,
  price,
  index,
}: TokenProps) {
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
      style={{
        height: '56px',
      }}
    >
      <td
        className={`xs:text-xs text-sm pl-8  ${
          index === 0
            ? !price
              ? 'pt-6 pb-4'
              : 'pt-4 pb-2'
            : !price
            ? 'py-4'
            : 'py-2'
        }  cursor-pointer w-4/5 flex items-center`}
      >
        <SingleToken token={token} price={price} />
      </td>
      <td
        className={`${
          index === 0 ? 'pt-6 pb-4' : 'py-4'
        } xs:text-xs text-sm w-1/5 pr-10 text-right ${
          sortBy === 'near' ? 'text-white' : ''
        }`}
      >
        {displayBalance}
      </td>
    </tr>
  );
}
