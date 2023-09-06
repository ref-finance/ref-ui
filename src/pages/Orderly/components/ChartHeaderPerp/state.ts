import React, { useState, useEffect } from 'react';
import { TokenInfo, TokenMetadata } from '../../orderly/type';
import { getFTmetadata } from '../../near';
import { useRefSwap } from '../../../../state/swap';
import { WRAP_NEAR_CONTRACT_ID } from '../../../../services/wrap-near';
import { ExchangeEstimate, SWAP_MODE } from '../../../SwapPage';

export function useTokenMetaFromSymbol(
  symbol: string,
  tokenInfo: TokenInfo[] | undefined
) {
  const [tokenMetadata, setTokenMetadata] = useState<TokenMetadata>();

  useEffect(() => {
    if (!symbol || !tokenInfo) return;

    const token =
      tokenInfo &&
      tokenInfo.find((t) =>
        symbol === 'BTC' ? t.token === 'WBTC' : t.token === symbol
      );

    if (!token?.token_account_id) return;

    getFTmetadata(token.token_account_id).then((t) => {
      setTokenMetadata({
        ...t,
        ...token,
      });
    });
  }, [symbol, tokenInfo]);

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
      tokenInfo &&
      tokenInfo.filter(
        (t) =>
          symbols.includes(t.token) ||
          (symbols.includes('BTC') && t.token === 'WBTC')
      );

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

export function useRefQuery({
  tokenIn,
  tokenOut,
}: {
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
}) {
  const [res, setRes] = useState<ExchangeEstimate>();

  const RefSwapRes = useRefSwap({
    tokenIn: {
      ...tokenIn,
      id:
        tokenIn?.id?.toLowerCase() === 'near'
          ? WRAP_NEAR_CONTRACT_ID
          : tokenIn?.id,
    },
    tokenOut,
    tokenInAmount: '1',
    supportLedger: true,
    slippageTolerance: 0.1,
    loadingTrigger: false,
    reEstimateTrigger: false,
    swapMode: SWAP_MODE.NORMAL,
    loadingPause: false,
  });

  useEffect(() => {
    setRes(RefSwapRes);
  }, [RefSwapRes.quoteDone]);

  return res;
}
