import React, { useEffect, useMemo, useState, useContext } from 'react';
import { PortfolioData } from '../../pages/Portfolio';
import BigNumber from 'bignumber.js';
import {
  toRoundedReadableNumber,
  percent,
  toPrecision,
  toInternationalCurrencySystem,
  calculateFairShare,
  toReadableNumber,
  ONLY_ZEROS,
  calculateFeePercent,
  formatWithCommas,
} from '~utils/numbers';
export default function Tab() {
  const {
    activeTab,
    setActiveTab,
    YourLpValueV2,
    YourLpValueV1,
    lpValueV1Done,
    lpValueV2Done,
    v1LiquidityQuantity,
    v2LiquidityQuantity,
    v1LiquidityLoadingDone,
    v2LiquidityLoadingDone,
  } = useContext(PortfolioData);
  const [tabList, setTabList] = useState([
    { name: 'Your Positions', tag: 1, value: '$-', quantity: '-' },
    { name: 'Active Orders', tag: 2, value: '$-', quantity: '-' },
    { name: 'Your Farms', tag: 3, value: '$-', quantity: '-' },
  ]);
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
  useEffect(() => {
    tabList[0].value = total_liquidity_value;
    tabList[0].quantity = total_liquidity_quantity;
    const parse_tabList = JSON.parse(JSON.stringify(tabList));
    setTabList(parse_tabList);
  }, [total_liquidity_value, total_liquidity_quantity]);
  function switchTab(tag: number) {
    setActiveTab(tag);
  }
  function display_value(amount: string) {
    const amount_big = new BigNumber(amount);
    if (amount_big.isEqualTo('0')) {
      return '$0';
    } else if (amount_big.isLessThan('0.01')) {
      return '<$0.01';
    } else {
      return `$${toInternationalCurrencySystem(amount, 2)}`;
    }
  }
  return (
    <div className="flex items-center mt-10 mb-6 pl-6">
      {tabList.map(
        (tab: {
          name: string;
          tag: number;
          value: string;
          quantity: string;
        }) => {
          return (
            <div
              key={tab.name}
              className="flex flex-col items-start mr-10 cursor-pointer"
              onClick={() => {
                switchTab(tab.tag);
              }}
            >
              <div className="flex flex-col items-start">
                <div className="flex items-center">
                  <span
                    className={`text-sm  ${
                      tab.tag == activeTab ? 'text-white' : 'text-primaryText'
                    }`}
                  >
                    {tab.name}
                  </span>
                  <span
                    className={`bg-menuMoreBgColor rounded-md text-xs py-1 px-2  ml-1.5 ${
                      tab.tag == activeTab
                        ? 'text-white gotham_bold'
                        : 'text-primaryText'
                    }`}
                  >
                    {tab.quantity}
                  </span>
                </div>
                <span
                  className={`text-base ${
                    tab.tag == activeTab
                      ? 'text-white gotham_bold'
                      : 'text-primaryText'
                  }`}
                >
                  {tab.value}
                </span>
              </div>
              <div
                className={`rounded-2xl bg-senderHot mt-2.5 ${
                  tab.tag == activeTab ? 'visible' : 'invisible'
                }`}
                style={{ width: '90px', height: '3px' }}
              ></div>
            </div>
          );
        }
      )}
    </div>
  );
}
