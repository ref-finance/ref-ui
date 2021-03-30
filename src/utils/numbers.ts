import BN from 'bn.js';

export const sumBN = (...args: string[]): string => {
  return args
    .reduce((acc, n) => {
      return acc.add(new BN(n));
    }, new BN(0))
    .toString();
};
