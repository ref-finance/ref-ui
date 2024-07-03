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
export const DEFLATION_MARK = 'tknx.near';
