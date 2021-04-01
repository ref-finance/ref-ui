import BN from 'bn.js';

export const sumBN = (...args: string[]): string => {
  return args
    .reduce((acc, n) => {
      return acc.add(new BN(n));
    }, new BN(0))
    .toString();
};

export const toReadableNumber = (
  decimals: number,
  number: string = '0'
): string => {
  if (!decimals) return number;

  const numberAsArray = number.split('');
  numberAsArray.splice(-decimals, 0, '.');
  return numberAsArray
    .join('')
    .replace(/\.([1-9]*)0*$/, '.$1')
    .replace(/\.$/, '');
};

export const toNonDivisibleNumber = (
  decimals: number,
  number: string
): string => {
  if (!decimals) return number;
  const [left, right = ''] = number.split('.');

  return `${left}${right.slice(0, decimals).padEnd(decimals, '0')}`;
};
