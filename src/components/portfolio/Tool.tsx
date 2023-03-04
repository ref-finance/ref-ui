import React, { useEffect, useMemo, useState, useContext } from 'react';
import {
  toPrecision,
  formatWithCommas,
  toInternationalCurrencySystem,
} from '~utils/numbers';
import BigNumber from 'bignumber.js';
import { ArrowRightIcon } from '../../components/icon/V3';
import { ArrowRIcon, WavyLine, CircleBg } from '../icon/Portfolio';
import { TriangleIcon } from '../../components/icon/Portfolio';
import { getCurrentWallet } from '../../utils/wallets-integration';
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
export function ArrowJumpLarge(props: any) {
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
      className={`flex items-center justify-center border border-primaryText border-opacity-30 rounded-md w-6 h-6 bg-cardBg cursor-pointer ${extraClass}`}
    >
      <ArrowRIcon
        className={`${hover ? 'text-white' : 'text-primaryText'}`}
      ></ArrowRIcon>
    </div>
  );
}

export function UpDownButton(props: any) {
  const { set_switch_off, switch_off } = props;
  const [hover, setHover] = useState<boolean>(false);
  return (
    <div
      onClick={() => {
        set_switch_off(!switch_off);
      }}
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
      className={`flex items-center justify-center rounded-md w-6 h-6 cursor-pointer ${
        switch_off
          ? hover
            ? 'bg-portfolioGreyColor'
            : 'border border-primaryText border-opacity-10'
          : 'bg-portfolioGreyColor'
      }`}
    >
      <TriangleIcon
        className={`${
          switch_off
            ? hover
              ? 'text-white'
              : 'text-limitOrderInputColor'
            : 'text-white transform rotate-180'
        }`}
      ></TriangleIcon>
    </div>
  );
}
export function NoDataCard({ text }: { text: string }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{ height: '226px' }}
    >
      <span className="text-sm text-primaryText relative z-10">{text}</span>
      <div className="absolute left-0 right-0 top-0 bottom-0 ">
        <WavyLine className="absolute bottom-0 left-0"></WavyLine>
        <CircleBg className="absolute right-0 top-0"></CircleBg>
      </div>
    </div>
  );
}
export function display_number_withCommas(amount: string) {
  const amount_big = new BigNumber(amount);
  if (amount_big.isEqualTo('0')) {
    return '0';
  } else if (amount_big.isLessThan('0.01')) {
    return '<0.01';
  } else {
    return formatWithCommas(toPrecision(amount, 2));
  }
}
export function display_number(amount: string) {
  const amount_big = new BigNumber(amount);
  if (amount_big.isEqualTo('0')) {
    return '0';
  } else if (amount_big.isLessThan('0.01')) {
    return '<0.01';
  } else {
    return toInternationalCurrencySystem(amount, 2);
  }
}
export function display_percentage(amount: string) {
  const accountId = getCurrentWallet()?.wallet?.getAccountId();
  if (!accountId) return '-';
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
  const accountId = getCurrentWallet()?.wallet?.getAccountId();
  if (!accountId) return '$-';
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
  const accountId = getCurrentWallet()?.wallet?.getAccountId();
  if (!accountId) return '$-';
  const amount_big = new BigNumber(amount);
  if (amount_big.isEqualTo('0')) {
    return '$0';
  } else if (amount_big.isLessThan('0.01')) {
    return '<$0.01';
  } else {
    return `$${formatWithCommas(toPrecision(amount, 2))}`;
  }
}
