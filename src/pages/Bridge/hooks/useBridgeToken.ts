import { useToken } from 'wagmi';
import { TokenList } from '../config';

export default function useBridgeToken() {
  const tokens = TokenList;
  function filterTokens(chain: BridgeModel.BridgeSupportChain, text: string) {
    return tokens
      .filter((item) => {
        const _address =
          chain === 'ETH' ? item.ethereum_address : item.near_address;
        return (
          item.symbol.toLowerCase().includes(text.toLowerCase()) ||
          item.name.toLowerCase().includes(text.toLowerCase()) ||
          _address.toLowerCase().includes(text.toLowerCase())
        );
      })
      .map((item) => transformTokenMeta(item, chain));
  }

  function transformTokenMeta(
    token: typeof TokenList[number],
    chain: BridgeModel.BridgeSupportChain
  ): BridgeModel.BridgeTokenMeta {
    return {
      chain,
      symbol: token.symbol,
      name: token.name,
      decimals: token.decimals,
      icon: token.icon,
      address: chain === 'ETH' ? token.ethereum_address : token.near_address,
    };
  }

  return { filterTokens };
}
