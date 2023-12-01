import { useCallback } from 'react';
import { TokenList } from '../config';

export default function useBridgeToken() {
  const tokens = TokenList;
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

  return { filterTokens };
}
