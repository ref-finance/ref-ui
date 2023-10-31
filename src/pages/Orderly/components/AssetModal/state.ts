import React, { useEffect, useMemo, useState } from 'react';
import { TokenInfo, TokenMetadata } from '../../orderly/type';

import {
  useTokensBalances,
  useTokensOrderlyBalances,
} from '../UserBoard/state';

export interface OrderAsset {
  near: string;
  'in-order': string;
  available: string;

  tokenMeta: TokenMetadata;
}

export function useOrderAssets(
  tokenInfo: TokenInfo[] | undefined,
  freeCollateral: string,
  curHoldingOut
) {
  const tokens = tokenInfo
    ? tokenInfo.map((t) => ({
        id: t.token_account_id,
        decimals: t.decimals,
      }))
    : [];

  const balances = useTokensBalances(
    tokens,
    tokenInfo,
    null,
    freeCollateral,
    curHoldingOut
  );
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

export function useOrderlyPortfolioAssets(tokenInfo: TokenInfo[] | undefined) {
  const tokens = tokenInfo
    ? tokenInfo.map((t) => ({
        id: t.token_account_id,
        decimals: t.decimals,
      }))
    : [];

  const balances = useTokensOrderlyBalances(tokens, tokenInfo);

  const displayBalances = balances.map((b, i) => {
    return {
      near: b.wallet_balance,
      'in-order': Math.abs(b['in-order']).toString(),
      // 'in-order': ((parseFloat(b.wallet_balance) - b.holding > 0 ? parseFloat(b.wallet_balance) - b.holding : 0)).toString(),
      available: b.holding.toString(),
      tokenMeta: b.meta,
    };
  });

  return displayBalances;
}
