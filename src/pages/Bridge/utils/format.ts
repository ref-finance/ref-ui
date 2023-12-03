import Big from 'big.js';

export function formatSortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatBalance(balance: string | undefined, decimals = 18) {
  if (!balance) return '0';
  return new Big(balance).div(10 ** decimals).toFixed();
}

export function formatDisplayBalance(
  balance: string | undefined,
  decimals = 18
) {
  if (!balance) return '0';
  return new Big(balance)
    .div(10 ** decimals)
    .round(4)
    .toString();
}
