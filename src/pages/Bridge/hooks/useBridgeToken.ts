import { useCallback, useMemo } from 'react';
import { TokenList } from '../config';

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

  return { tokens, filterTokens, getTokenBySymbol };
}
