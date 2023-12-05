import { useCallback, useMemo } from 'react';
import { TokenList } from '../config';
import { ethServices, nearServices } from '../services/contract';
import { chain } from 'lodash';

export default function useBridgeToken() {
  const tokens = useMemo(
    () =>
      TokenList.filter((item) => item.addresses.ETH || item.symbol === 'ETH'),
    []
  );
  const filterTokens = useCallback(
    (chain: BridgeModel.BridgeSupportChain, text: string) => {
      return tokens.filter((item) => {
        return (
          item.symbol.toLowerCase().includes(text.toLowerCase()) ||
          item.name.toLowerCase().includes(text.toLowerCase()) ||
          item.addresses[chain].toLowerCase().includes(text.toLowerCase())
        );
      });
    },
    [tokens]
  );

  function getTokenBySymbol(symbol: string) {
    return tokens.find((item) => item.symbol === symbol);
  }

  function getTokenBalance(
    chain: BridgeModel.BridgeSupportChain,
    token: BridgeModel.BridgeTokenMeta
  ) {
    return chain === 'ETH'
      ? ethServices.getBalance(token)
      : nearServices.getBalance(token);
  }

  return { filterTokens, getTokenBySymbol, getTokenBalance };
}
