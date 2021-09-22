export const toRealSymbol = (symbol: string) => {
  console.log(symbol);
  if (symbol === 'nWETH') return 'wETH';
  return symbol.charAt(0) === 'n' &&
    symbol.charAt(1) === symbol.charAt(1).toUpperCase()
    ? symbol.substring(1)
    : symbol;
};

export const getMftTokenId = (id: string) => {
  return ':' + id;
};
