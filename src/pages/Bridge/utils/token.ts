import { BridgeTokenList } from './../config';

const TOKENS = BridgeTokenList.reduce((acc, token) => {
  acc[token.symbol] = token;
  return acc;
}, {} as Record<string, BridgeModel.BridgeTokenMeta>);

export function getTokenMeta(symbol: string) {
  return TOKENS[symbol];
}

export function getTokenAddress(
  symbol: string,
  chain?: BridgeModel.BridgeSupportChain
) {
  return TOKENS[symbol]?.addresses[chain || 'NEAR'];
}

export function getTokenByAddress(
  address: string,
  chain?: BridgeModel.BridgeSupportChain
) {
  return Object.values(TOKENS).find(
    (token) =>
      token.addresses[chain || 'NEAR']?.toLowerCase() === address.toLowerCase()
  );
}
