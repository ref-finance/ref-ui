import React, { useEffect, useMemo, useState, useContext } from 'react';
import {
  toPrecision,
  formatWithCommas,
  toInternationalCurrencySystem,
} from '~utils/numbers';
import BigNumber from 'bignumber.js';
import { ArrowRightIcon } from '../../components/icon/V3';
export function ArrowJump(props: any) {
  const [hover, setHover] = useState(false);
  const { clickEvent, extraClass } = props;
  return (
    <div
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
      onClick={clickEvent}
      className={`flex items-center justify-center border border-primaryText border-opacity-30 rounded-md w-4 h-4 bg-cardBg cursor-pointer ${extraClass}`}
    >
      <ArrowRightIcon
        className={`${hover ? 'text-white' : 'text-primaryText'}`}
      ></ArrowRightIcon>
    </div>
  );
}
export function display_number(amount: string) {
  const amount_big = new BigNumber(amount);
  if (amount_big.isEqualTo('0')) {
    return '0';
  } else if (amount_big.isLessThan('0.01')) {
    return '<0.01';
  } else {
    return formatWithCommas(toPrecision(amount, 2));
  }
}
export function display_percentage(amount: string) {
  const amount_big = new BigNumber(amount);
  if (amount_big.isEqualTo('0')) {
    return '0';
  } else if (amount_big.isLessThan('1')) {
    return '<1';
  } else {
    return toPrecision(amount, 0);
  }
}
export function display_value(amount: string) {
  const amount_big = new BigNumber(amount);
  if (amount_big.isEqualTo('0')) {
    return '$0';
  } else if (amount_big.isLessThan('0.01')) {
    return '<$0.01';
  } else {
    return `$${toInternationalCurrencySystem(amount, 2)}`;
  }
}
export function display_value_withCommas(amount: string) {
  const amount_big = new BigNumber(amount);
  if (amount_big.isEqualTo('0')) {
    return '$0';
  } else if (amount_big.isLessThan('0.01')) {
    return '<$0.01';
  } else {
    return `$${formatWithCommas(toPrecision(amount, 2))}`;
  }
}
