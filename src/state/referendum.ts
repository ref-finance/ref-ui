import Big from 'big.js';
import BigNumber from 'bignumber.js';
import React, { useEffect, useState } from 'react';
import {
  toReadableNumber,
  toPrecision,
  scientificNotationToString,
} from '../utils/numbers';

const minMultiplier = 10000;

export const useMultiplier = ({
  duration,
  maxMultiplier,
  maxDuration,
  amount,
  lockedAmount,
  curDuration,
}: {
  duration: number;
  maxMultiplier: number;
  maxDuration: number;
  amount: string;
  lockedAmount: string;
  curDuration: number;
}) => {
  try {
    const appenMultiplier = new Big(duration)
      .times(maxMultiplier - minMultiplier)
      .div(new Big(maxDuration).times(new Big(minMultiplier)))
      .plus(new Big(1));

    const Xappend = appenMultiplier.times(amount);

    const newDuration = duration > curDuration ? duration : curDuration;

    const multiplier = new Big(newDuration)
      .times(maxMultiplier - minMultiplier)
      .div(new Big(maxDuration).times(new Big(minMultiplier)))
      .plus(new Big(1));

    const X = multiplier.times(new Big(lockedAmount));

    const finalX = X.plus(Xappend);

    const finalMultiplier = finalX.div(
      new Big(lockedAmount).plus(new Big(amount))
    );

    const finalVeAmount = toPrecision(
      scientificNotationToString(finalX.toString()),
      0
    );

    const appendVeAmount = toPrecision(
      scientificNotationToString(Xappend.toString()),
      0
    );

    console.log(finalVeAmount, 'finalVeAmount');

    return {
      multiplier: finalMultiplier.toNumber(),
      finalAmount: toPrecision(
        toReadableNumber(24, finalVeAmount),
        2,
        false,
        false
      ),
      appendAmount: toPrecision(
        toReadableNumber(24, appendVeAmount),
        2,
        false,
        false
      ),
    };
  } catch (error) {}
  return {
    multiplier: 1,
    finalAmount: '0',
    appendedAmount: '0',
  };
};
