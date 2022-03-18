import React, { useState } from 'react';
import { TiArrowSortedUp } from 'react-icons/ti';
import { TokenMetadata } from '../../services/ft-contract';
import { TokenBalancesView } from '~services/token';
import { toReadableNumber } from '../../utils/numbers';
import Token from '../../components/tokens/Token';
import { FormattedMessage } from 'react-intl';
import { SmallWallet } from '../icon/SmallWallet';

interface TokenListProps {
  tokens: TokenMetadata[];
  sortBy: string;
  currentSort: string;
  onSortChange?: (sortBy: string) => void;
  onClick?: (token: TokenMetadata) => void;
  balances?: TokenBalancesView;
  tokenPriceList: Record<string, any>;
}

export default function Table({
  tokens,
  sortBy,
  currentSort,
  onSortChange,
  onClick,
  balances,
  tokenPriceList,
}: TokenListProps) {
  return (
    tokens.length > 0 && (
      <table className="text-left w-full text-sm text-gray-400 mt-10 table-auto">
        <thead
          className="sticky -top-6 z-30 text-primaryText"
          style={{ background: 'rgb(29, 41, 50)' }}
        >
          <tr className="font-normal border-b border-gray-500 border-opacity-30">
            <th
              className={`font-normal w-2/5 pb-2 pl-8  ${
                sortBy === 'asset' ? 'text-greenLight' : ''
              }`}
            >
              <span className="">
                <FormattedMessage id="asset_label" defaultMessage="Asset" />
              </span>
            </th>
            <th className={`font-normal pb-2 pr-9 w-1/5 `}>
              <span
                className="cursor-pointer flex justify-end items-center whitespace-nowrap"
                onClick={() => onSortChange('near')}
              >
                <span className="self-start">
                  <SmallWallet forSelectToken />
                </span>
                <span className="ml-1">
                  <FormattedMessage id="balance" />
                </span>
                <TiArrowSortedUp
                  className={`inline-block cursor-pointer ${
                    sortBy === 'near' && currentSort === 'down'
                      ? 'transform rotate-180'
                      : ''
                  }`}
                />
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {tokens.filter(Boolean).map((token, index) => (
            <Token
              index={index}
              key={token.id}
              token={token}
              onClick={onClick}
              price={tokenPriceList[token.id]?.price}
              // render={render}
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
