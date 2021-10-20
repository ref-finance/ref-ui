import React, { useState } from 'react';
import { TiArrowSortedUp } from 'react-icons/ti';
import { TokenMetadata } from '../../services/ft-contract';
import { TokenBalancesView } from '~services/token';
import { toReadableNumber } from '~utils/numbers';
import Token from '~components/tokens/Token';

interface TokenListProps {
  tokens: TokenMetadata[];
  onClick?: (token: TokenMetadata) => void;
  render?: (token: TokenMetadata) => React.ReactElement;
  balances?: TokenBalancesView;
}

type TokenData = TokenMetadata & {
  asset: string;
  near: number;
  ref: number;
  total: number;
};

function sort(a: any, b: any) {
  if (typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b);
  } else if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  } else {
    return a;
  }
}

export default function Table({
  tokens,
  onClick,
  render,
  balances,
}: TokenListProps) {
  const [currentSort, setSort] = useState<string>('down');
  const [sortBy, setSortBy] = useState<string>('near');

  const sortTypes: { [key: string]: any } = {
    up: {
      class: 'sort-up',
      fn: (a: any, b: any) => sort(a[sortBy], b[sortBy]),
    },
    down: {
      class: 'sort-down',
      fn: (a: any, b: any) => sort(b[sortBy], a[sortBy]),
    },
    default: {
      class: 'sort',
      fn: (a: any, b: any) => a,
    },
  };

  const onSortChange = (sortBy: string) => {
    setSortBy(sortBy);
    let nextSort;

    if (currentSort === 'down') nextSort = 'up';
    else if (currentSort === 'up') nextSort = 'down';
    setSort(nextSort);
  };

  const sortedData = [...tokens].sort(sortTypes[currentSort].fn);

  return (
    tokens.length > 0 && (
      <table className="text-left w-full text-sm text-gray-400 mt-10 table-auto">
        <thead>
          <tr className="font-normal border-b border-gray-500 border-opacity-30">
            <th
              className={`font-normal pb-2 pl-6  ${
                sortBy === 'asset' ? 'text-greenLight' : ''
              }`}
            >
              Asset
              <TiArrowSortedUp
                onClick={() => onSortChange('asset')}
                className={`inline-block cursor-pointer ${
                  sortBy === 'asset' && currentSort === 'down'
                    ? 'transform rotate-180'
                    : ''
                }`}
              />
            </th>
            <th
              className={`font-normal pb-2  ${
                sortBy === 'near' ? 'text-greenLight' : ''
              }`}
            >
              Near Account
              <TiArrowSortedUp
                onClick={() => onSortChange('near')}
                className={`inline-block cursor-pointer ${
                  sortBy === 'near' && currentSort === 'down'
                    ? 'transform rotate-180'
                    : ''
                }`}
              />
            </th>
            <th
              className={`font-normal pb-2  ${
                sortBy === 'ref' ? 'text-greenLight' : ''
              }`}
            >
              Ref Account
              <TiArrowSortedUp
                onClick={() => onSortChange('ref')}
                className={`inline-block cursor-pointer ${
                  sortBy === 'ref' && currentSort === 'down'
                    ? 'transform rotate-180'
                    : ''
                }`}
              />
            </th>
            <th
              className={`font-normal pb-2 pr-6 ${
                sortBy === 'total' ? 'text-greenLight' : ''
              }`}
            >
              Total
              <TiArrowSortedUp
                onClick={() => onSortChange('total')}
                className={`inline-block cursor-pointer ${
                  sortBy === 'total' && currentSort === 'down'
                    ? 'transform rotate-180'
                    : ''
                }`}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((token) => (
            <Token
              key={token.id}
              token={token}
              onClick={onClick}
              render={render}
              sortBy={sortBy}
              totalAmount={
                balances
                  ? toReadableNumber(token.decimals, balances[token.id])
                  : ''
              }
            />
          ))}
        </tbody>
      </table>
    )
  );
}
