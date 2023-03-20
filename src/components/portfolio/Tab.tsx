import React, { useEffect, useMemo, useState, useContext } from 'react';
import { PortfolioData } from '../../pages/Portfolio';
import BigNumber from 'bignumber.js';
import {
  display_value,
  useTotalOrderData,
  useTotalFarmData,
  useTotalLiquidityData,
} from './Tool';
import { FormattedMessage, useIntl } from 'react-intl';
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

    dcl_farms_value_done,
    classic_farms_value_done,
    dcl_farms_value,
    classic_farms_value,
    all_farms_quanity,
    all_farms_Loading_done,

    active_order_value_done,
    active_order_Loading_done,
    active_order_quanity,
    active_order_value,
  } = useContext(PortfolioData);
  const [tabList, setTabList] = useState([
    { name: '', id: 'active_orders', tag: '1', value: '$-', quantity: '-' },
    { name: '', id: 'your_liquidity_2', tag: '2', value: '$-', quantity: '-' },
    { name: '', id: 'yield_farming', tag: '3', value: '$-', quantity: '-' },
  ]);
  const { total_liquidity_value, total_liquidity_quantity } =
    useTotalLiquidityData({
      YourLpValueV1,
      YourLpValueV2,
      lpValueV1Done,
      lpValueV2Done,
      v1LiquidityQuantity,
      v2LiquidityQuantity,
      v1LiquidityLoadingDone,
      v2LiquidityLoadingDone,
    });
  const { total_active_orders_value, total_active_orders_quanity } =
    useTotalOrderData({
      active_order_value_done,
      active_order_Loading_done,
      active_order_quanity,
      active_order_value,
    });
  const { total_farms_value, total_farms_quantity } = useTotalFarmData({
    dcl_farms_value,
    classic_farms_value,
    dcl_farms_value_done,
    classic_farms_value_done,
    all_farms_Loading_done,
    all_farms_quanity,
  });

  useEffect(() => {
    tabList[0].value = total_active_orders_value;
    tabList[0].quantity = total_active_orders_quanity;
    tabList[1].value = total_liquidity_value;
    tabList[1].quantity = total_liquidity_quantity;
    tabList[2].value = total_farms_value;
    tabList[2].quantity = total_farms_quantity;
    const parse_tabList = JSON.parse(JSON.stringify(tabList));
    setTabList(parse_tabList);
  }, [
    total_farms_value,
    total_farms_quantity,
    total_liquidity_value,
    total_liquidity_quantity,
    total_active_orders_value,
    total_active_orders_quanity,
  ]);
  function switchTab(tag: string) {
    setActiveTab(tag);
  }
  return (
    <div className="flex items-center mt-10  pl-6">
      {tabList.map(
        (
          tab: {
            name: string;
            tag: string;
            value: string;
            quantity: string;
            id: string;
          },
          index
        ) => {
          return (
            <div
              key={`${tab.tag}_${index}`}
              className={`flex flex-col items-start cursor-pointer ${
                index != tabList.length - 1 ? 'mr-20' : ''
              }`}
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
                    {tab.name || <FormattedMessage id={tab.id} />}
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
