export const toRealSymbol = (symbol: string) => {
  if (symbol === 'nWETH' || symbol === 'WETH') return 'wETH';
  return symbol.charAt(0) === 'n' &&
    symbol.charAt(1) === symbol.charAt(1).toUpperCase()
    ? symbol.substring(1)
    : symbol;
};

export const getMftTokenId = (id: string) => {
  return ':' + id;
};
