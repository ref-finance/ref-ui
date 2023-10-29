import React from 'react';
import { Pool } from 'src/services/pool';
import { toReadableNumber } from './numbers';
import Big from 'big.js';
import { TokenMetadata } from 'src/services/ft-contract';

export const getLiquidity = (
  pool: Pool,
  tokenIn: TokenMetadata,
  tokenOut: TokenMetadata
) => {
  const amount1 = toReadableNumber(tokenIn.decimals, pool.supplies[tokenIn.id]);
  const amount2 = toReadableNumber(
    tokenOut.decimals,
    pool.supplies[tokenOut.id]
  );

  const lp = new Big(amount1).times(new Big(amount2));

  return Number(lp);
};
