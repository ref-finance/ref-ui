import React, { useState, useEffect } from 'react';
import { TokenInfo, TokenMetadata } from '../../orderly/type';
import { getFTmetadata } from '../../near';

export function useTokenMetaFromSymbol(
  symbol: string,
  tokenInfo: TokenInfo[] | undefined,
  symbolTypeOn?: boolean
) {
  const [tokenMetadata, setTokenMetadata] = useState<TokenMetadata>();

  useEffect(() => {
    if (!symbol || !tokenInfo) return;

    if (typeof symbolTypeOn === 'boolean' && symbolTypeOn === false) {
      return;
    }

    const token =
      tokenInfo &&
      tokenInfo.find((t) =>
        symbol === 'BTC'
          ? t.token === 'WBTC'
          : t.token.toLowerCase() === symbol.toLowerCase()
      );

    if (!token?.token_account_id) return;

    getFTmetadata(token.token_account_id).then((t) => {
      setTokenMetadata({
        ...t,
        ...token,
      });
    });
  }, [symbol, tokenInfo, symbolTypeOn]);

  return tokenMetadata;
}

export function useBatchTokenMetaFromSymbols(
  symbols: string[] | null,
  tokenInfo: TokenInfo[] | undefined
) {
  const [tokenMetadata, setTokenMetadata] = useState<TokenMetadata[]>([]);

  useEffect(() => {
    if (!symbols || !tokenInfo) return;

    const tokens =
      tokenInfo && tokenInfo.filter((t) => symbols.includes(t.token));

    if (!tokens) return;

    Promise.all(
      tokens.map((t, i) =>
        getFTmetadata(t.token_account_id).then((meta) => {
          return {
            ...meta,
            ...t,
            symbol: tokens[i].token,
          };
        })
      )
    ).then((res) => {
      setTokenMetadata(res);
    });
  }, [symbols?.join('|'), tokenInfo]);

  return tokenMetadata.reduce((acc, cur) => {
    if (cur) {
      acc[cur.symbol] = cur;
    }
    return acc;
  }, {} as { [key: string]: TokenMetadata });
}
