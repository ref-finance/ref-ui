import React, { useState } from 'react';
import { TiArrowSortedUp } from '../reactIcons';
import { TokenMetadata } from '../../services/ft-contract';
import { TokenBalancesView } from 'src/services/token';
import { toReadableNumber } from '../../utils/numbers';
import Token from '../../components/tokens/Token';
import { FormattedMessage } from 'react-intl';
import { SmallWallet } from '../icon/SmallWallet';
import { PinEmpty, PinSolid } from '../icon/Common';

interface TokenListProps {
  tokens: TokenMetadata[];
  sortBy: string;
  currentSort: string;
  onSortChange?: (sortBy: string) => void;
  onClick?: (token: TokenMetadata) => void;
  balances?: TokenBalancesView;
  tokenPriceList: Record<string, any>;
  forCross?: boolean;
}

export default function Table({
  tokens,
  sortBy,
  currentSort,
  onSortChange,
  onClick,
  balances,
  tokenPriceList,
  forCross,
}: TokenListProps) {
  return (
    tokens.length > 0 && (
      <table className="text-left w-full text-sm text-gray-400 mt-5 table-auto">
        {/* sticky */}
        <div
          className="-top-6 z-30 text-primaryText"
          style={{ background: 'rgb(29, 41, 50)' }}
        >
          <tr className="font-normal border-b border-gray-500 border-opacity-30">
            <th
              className={`font-normal w-3/5 pb-2 pl-8 xsm:pl-5  ${
                sortBy === 'asset' ? 'text-greenLight' : ''
              }`}
            >
              <span className="">
                {forCross ? (
                  <FormattedMessage id="Token" defaultMessage="Token" />
                ) : (
                  <FormattedMessage id="asset_label" defaultMessage="Asset" />
                )}
              </span>
            </th>
            <th
              className={
                !forCross ? 'hidden' : 'pb-2 w-1/5 font-normal relative right-6'
              }
            >
              <span>
                <FormattedMessage id="support" defaultMessage="Support" />
              </span>
            </th>

            <th className={`font-normal pb-2 pr-6 w-1/5 `}>
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
        <div>
          {tokens
            .filter((token) => !!token)
            .map((token, index) => (
              <Token
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
    )
  );
}
