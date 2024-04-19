import React, { useState } from 'react';
import { TiArrowSortedUp } from '../reactIcons';
import { TokenMetadata } from '../../services/ft-contract';
import { TokenBalancesView } from 'src/services/token';
import { toReadableNumber } from '../../utils/numbers';
import Token from '../tokens/Token';
import { FormattedMessage } from 'react-intl';
import { SmallWallet } from '../icon/SmallWallet';
import { PinEmpty, PinSolid } from '../icon/Common';
import SelectTokenList from './SelectTokenList';

interface TokenListProps {
  tokens: TokenMetadata[];
  sortBy: string;
  currentSort: string;
  onSortChange?: (sortBy: string) => void;
  onClick?: (token: TokenMetadata) => void;
  balances?: TokenBalancesView;
  tokenPriceList: Record<string, any>;
  forCross?: boolean;
  showRiskTokens?: boolean;
}

export default function SelectTokenTable({
  tokens,
  sortBy,
  currentSort,
  onSortChange,
  onClick,
  balances,
  tokenPriceList,
  forCross,
  showRiskTokens,
}: TokenListProps) {
  return (
    tokens.length > 0 && (
      <div className="-mt-11">
        <table className="text-left w-full text-sm text-gray-400 table-auto">
          <div
            className="-top-6 z-30 text-primaryText flex justify-end "
            style={{ background: 'rgb(29, 41, 50)' }}
          >
            <tr className="font-normal">
              <th className={`font-normal pb-2 pr-6 w-min `}>
                <span
                  className="cursor-pointer flex justify-end items-center whitespace-nowrap"
                  onClick={() => onSortChange('near')}
                >
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
          </div>
          <div className="mt-2">
            {tokens
              .filter((token) => {
                if (!token) return false;
                if (showRiskTokens) {
                  return 'isRisk' in token && !token.isUserToken;
                } else {
                  return !('isRisk' in token) || token.isUserToken;
                }
              })
              .map((token, index) => (
                <SelectTokenList
                  index={index}
                  key={token.id + token.symbol}
                  onClick={onClick}
                  token={token}
                  price={tokenPriceList?.[token.id]?.price}
                  sortBy={sortBy}
                  forCross={forCross}
                  totalAmount={
                    balances
                      ? toReadableNumber(token.decimals, balances[token.id])
                      : ''
                  }
                />
              ))}
          </div>
        </table>
      </div>
    )
  );
}
