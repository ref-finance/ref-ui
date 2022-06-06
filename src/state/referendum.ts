import Big from 'big.js';
import BigNumber from 'bignumber.js';
import React, { useEffect, useState } from 'react';

const minMultiplier = 10000;

export const useMultiplier = ({
  duration,
  maxMultiplier,
  maxDuration,
}: {
  duration: number;
  maxMultiplier: number;
  maxDuration: number;
}) => {
  const [multiplier, setMultiplier] = useState<number>();

  useEffect(() => {
    const res = new Big(duration)
      .times(maxMultiplier - minMultiplier)
      .div(new Big(maxDuration).times(new Big(minMultiplier)))
      .plus(new Big(1));

    setMultiplier(res.toNumber());
  }, [maxMultiplier, duration]);

  return multiplier;
};
