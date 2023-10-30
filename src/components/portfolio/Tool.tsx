import React, { useEffect, useMemo, useState, useContext } from 'react';
import {
  toPrecision,
  formatWithCommas,
  toInternationalCurrencySystem,
  toInternationalCurrencySystemNature,
  toInternationalCurrencySystemLongString,
} from 'src/utils/numbers';
import BigNumber from 'bignumber.js';
import { ArrowRightIcon } from '../../components/icon/V3';
import { ArrowRIcon, WavyLine, CircleBg } from '../icon/Portfolio';
import { TriangleIcon } from '../../components/icon/Portfolio';
import { getCurrentWallet } from '../../utils/wallets-integration';
import { isMobile } from 'src/utils/device';
import { FormattedMessage, useIntl } from 'react-intl';
const is_mobile = isMobile();
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
        set_switch_off();
      }}
      onMouseEnter={() => {
        if (!is_mobile) {
          setHover(true);
        }
      }}
      onMouseLeave={() => {
        if (!is_mobile) {
          setHover(false);
        }
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
      style={{ height: is_mobile ? '100px' : '226px' }}
    >
      <span className="text-sm text-primaryText relative z-10 xsm:-top-3">
        {text}
      </span>
      <div className="absolute left-0 right-0 top-0 bottom-0 xsm:hidden">
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
export function display_number_ordinary(amount: string) {
  const amount_big = new BigNumber(amount);
  if (amount_big.isEqualTo('0')) {
    return '0';
  } else if (amount_big.isLessThan('0.01')) {
    return '<0.01';
  } else {
    return toPrecision(amount, 2);
  }
}
export function display_number_internationalCurrencySystemNature(
  amount: string
) {
  const amount_big = new BigNumber(amount);
  if (amount_big.isEqualTo('0')) {
    return '0';
  } else if (amount_big.isLessThan('0.01')) {
    return '<0.01';
  } else {
    return toInternationalCurrencySystemNature(amount, 2);
  }
}
export function display_number_internationalCurrencySystemLongString(
  amount: string
) {
  const amount_big = new BigNumber(amount);
  if (amount_big.isEqualTo('0')) {
    return '0';
  } else if (amount_big.isLessThan('0.01')) {
    return '<0.01';
  } else {
    return toInternationalCurrencySystemLongString(amount, 2);
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
export function display_percentage_2(amount: string) {
  const accountId = getCurrentWallet()?.wallet?.getAccountId();
  if (!accountId) return '-';
  const amount_big = new BigNumber(amount);
  if (amount_big.isEqualTo('0')) {
    return '0';
  } else if (amount_big.isLessThan('0.01')) {
    return '<0.01';
  } else {
    return toPrecision(amount, 2);
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

export function useTotalOrderData({
  active_order_value_done,
  active_order_Loading_done,
  active_order_quanity,
  active_order_value,
}: {
  active_order_value_done: boolean;
  active_order_Loading_done: boolean;
  active_order_quanity: string;
  active_order_value: string;
}) {
  const total_active_orders_value = useMemo(() => {
    let total_value = '$-';
    if (active_order_value_done) {
      total_value = display_value(active_order_value);
    }
    return total_value;
  }, [active_order_value_done, active_order_value]);

  const total_active_orders_quanity = useMemo(() => {
    let total_quantity = '-';
    if (active_order_Loading_done) {
      total_quantity = active_order_quanity;
    }
    return total_quantity;
  }, [active_order_Loading_done, active_order_quanity]);
  return {
    total_active_orders_value,
    total_active_orders_quanity,
  };
}

export function useTotalFarmData({
  dcl_farms_value,
  classic_farms_value,
  dcl_farms_value_done,
  classic_farms_value_done,
  all_farms_Loading_done,
  all_farms_quanity,
}: {
  dcl_farms_value: string;
  classic_farms_value: string;
  dcl_farms_value_done: boolean;
  classic_farms_value_done: boolean;
  all_farms_Loading_done: boolean;
  all_farms_quanity: string;
}) {
  const total_farms_value = useMemo(() => {
    let total_value = '$-';
    if (dcl_farms_value_done && classic_farms_value_done) {
      total_value = display_value(
        new BigNumber(classic_farms_value).plus(dcl_farms_value).toFixed()
      );
    }
    return total_value;
  }, [
    dcl_farms_value,
    classic_farms_value,
    dcl_farms_value_done,
    classic_farms_value_done,
  ]);
  const total_farms_quantity = useMemo(() => {
    let total_quantity = '-';
    if (all_farms_Loading_done) {
      total_quantity = all_farms_quanity;
    }
    return total_quantity;
  }, [all_farms_Loading_done, all_farms_quanity]);
  return {
    total_farms_value,
    total_farms_quantity,
  };
}
export function useTotalLiquidityData({
  YourLpValueV1,
  YourLpValueV2,
  lpValueV1Done,
  lpValueV2Done,
  v1LiquidityQuantity,
  v2LiquidityQuantity,
  v1LiquidityLoadingDone,
  v2LiquidityLoadingDone,
}: {
  YourLpValueV1: string;
  YourLpValueV2: string;
  lpValueV1Done: boolean;
  lpValueV2Done: boolean;
  v1LiquidityQuantity: string;
  v2LiquidityQuantity: string;
  v1LiquidityLoadingDone: boolean;
  v2LiquidityLoadingDone: boolean;
}) {
  const total_liquidity_value = useMemo(() => {
    let total_value = '$-';
    if (lpValueV1Done && lpValueV2Done) {
      total_value = display_value(
        new BigNumber(YourLpValueV1 || 0).plus(YourLpValueV2 || 0).toFixed()
      );
    }
    return total_value;
  }, [YourLpValueV1, YourLpValueV2, lpValueV1Done, lpValueV2Done]);
  const total_liquidity_quantity = useMemo(() => {
    let total_quantity = '-';
    if (v1LiquidityLoadingDone && v2LiquidityLoadingDone) {
      total_quantity = new BigNumber(v1LiquidityQuantity || 0)
        .plus(v2LiquidityQuantity || 0)
        .toFixed();
    }
    return total_quantity;
  }, [
    v1LiquidityQuantity,
    v2LiquidityQuantity,
    v1LiquidityLoadingDone,
    v2LiquidityLoadingDone,
  ]);
  return {
    total_liquidity_value,
    total_liquidity_quantity,
  };
}

export function getAccountId() {
  const accountId = getCurrentWallet()?.wallet?.getAccountId();
  const env_map = {
    testnet: ['testnet', 'pub-testnet'],
    near: ['', 'production', 'mainnet'],
  };
  if (accountId) {
    const account_suffix = accountId.split('.')[1];
    const env_keys = env_map[account_suffix];
    if (account_suffix && env_keys) {
      const real_env = process.env.REACT_APP_NEAR_ENV || '';
      if (env_keys?.indexOf(real_env) == -1) return '';
    }
  }
  return accountId;
}
