export const toRealSymbol = (symbol: string) => {
  const blackList = ['nUSDO'];

  if (symbol === 'nWETH' || symbol === 'WETH') return 'wETH';
  if (blackList.includes(symbol)) return symbol;
  return symbol.charAt(0) === 'n' &&
    symbol.charAt(1) === symbol.charAt(1).toUpperCase()
    ? symbol.substring(1)
    : symbol;
};

export const getMftTokenId = (id: string) => {
  return ':' + id;
};
