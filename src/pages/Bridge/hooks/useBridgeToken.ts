import { useCallback } from 'react';
import { TokenList } from '../config';
import { ethServices, nearServices } from '../services/contract';

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

  function getTokenBalance(
    chain: BridgeModel.BridgeSupportChain,
    token: BridgeModel.BridgeTokenMeta
  ) {
    return chain === 'ETH'
      ? ethServices.getBalance(token)
      : nearServices.getBalance(token);
  }

  return { filterTokens, getTokenBalance };
}
