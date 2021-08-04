export const toRealSymbol = (symbol: string) => {
  return symbol.charAt(0) === 'n' &&
    symbol.charAt(1) === symbol.charAt(1).toUpperCase()
    ? symbol.substring(1)
    : symbol;
};
