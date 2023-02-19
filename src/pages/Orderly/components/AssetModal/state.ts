import React, { useEffect, useState } from 'react';
import { TokenInfo, TokenMetadata } from '../../orderly/type';
import { useTokensBalances } from '../UserBoard/state';

export interface OrderAsset {
  near: string;
  'in-order': string;
  available: string;

  tokenMeta: TokenMetadata;
}

export function useOrderAssets(tokenInfo: TokenInfo[] | undefined) {
  const tokens = tokenInfo
    ? tokenInfo.map(t => ({
        id: t.token_account_id,
        decimals: t.decimals,
      }))
    : [];

  const balances = useTokensBalances(tokens, tokenInfo);

  const displayBalances = balances.map((b, i) => {
    return {
      near: b.wallet_balance,
      'in-order': Math.abs(b['in-order']).toString(),
      available: b.holding.toString(),
      tokenMeta: b.meta,
    };
  });

  return displayBalances;
}
