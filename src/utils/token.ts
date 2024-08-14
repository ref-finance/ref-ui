import { TokenMetadata } from '~src/services/ft-contract';

export const toRealSymbol = (symbol: string) => {
  if (!symbol) return '';
  const blackList = ['nUSDO', 'nKOK'];

  if (!symbol) return symbol;

  if (symbol === 'nWETH' || symbol === 'WETH') return 'wETH';
  if (blackList.includes(symbol)) return symbol;
  return symbol?.charAt(0) === 'n' &&
    symbol.charAt(1) === symbol.charAt(1).toUpperCase()
    ? symbol.substring(1)
    : symbol;
};

export const getMftTokenId = (id: string) => {
  return ':' + id;
};
export function isSuffix(mainStr, subStr) {
  return (
    mainStr.endsWith(subStr + '.testnet') || mainStr.endsWith(subStr + '.near')
  );
}
export function getImageMark(token: TokenMetadata, isRisk?: boolean) {
  const isTkn = isSuffix(token.id, 'tkn');
  const isTknx = isSuffix(token.id, 'tknx');
  const isMemeCooking = isSuffix(token.id, 'meme-cooking');
  if (isRisk || token.isRisk) {
    if (isTkn) return 'TKN';
    if (isTknx) return 'TKNX';
    // if (isMemeCooking) return 'MC';
  }
  return '';
}
export const DEFLATION_MARK = 'tknx.near';
