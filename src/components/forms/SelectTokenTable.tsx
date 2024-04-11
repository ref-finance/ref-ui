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
      <div>
        {tokens
          .filter(
            (token) =>
              !!token &&
              ((showRiskTokens && 'isRisk' in token) ||
                (!showRiskTokens && !('isRisk' in token)))
          )
          .map((token, index) => (
            <SelectTokenList
              index={index}
              key={token.id + token.symbol}
              onClick={onClick}
              token={token}
              price={tokenPriceList?.[token.id]?.price}
              sortBy={sortBy}
              forCross={forCross}
              isRisk={showRiskTokens}
              totalAmount={
                balances
                  ? toReadableNumber(token.decimals, balances[token.id])
                  : ''
              }
            />
          ))}
      </div>
    )
  );
}
