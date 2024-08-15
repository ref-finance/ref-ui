import { TOKENS, EVMConfig } from './../config';

const tokens = TOKENS.reduce((acc, token) => {
  acc[token.symbol] = token;
  return acc;
}, {} as Record<string, BridgeModel.BridgeTokenMeta>);

export function getChainMainToken(chain: BridgeModel.BridgeSupportChain) {
  if (chain === 'NEAR') return tokens.NEAR;
  const mainTokenSymbol = EVMConfig.chains.find((v) =>
    v.label.toLowerCase().startsWith(chain.toLowerCase())
  )?.token;
  console.log('mainTokenSymbol', mainTokenSymbol);
  return tokens[mainTokenSymbol];
}

export function getTokenMeta(symbol: string) {
  return tokens[symbol];
}

export function getTokenAddress(
  symbol: string,
  chain?: BridgeModel.BridgeSupportChain
) {
  return tokens[symbol]?.addresses[chain || 'NEAR'];
}

export function getTokenByAddress(
  address: string,
  chain?: BridgeModel.BridgeSupportChain
) {
  return Object.values(tokens).find(
    (token) =>
      token.addresses[chain || 'NEAR']?.toLowerCase() === address.toLowerCase()
  );
}
