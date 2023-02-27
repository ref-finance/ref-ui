import React, { useState, createContext, useEffect } from 'react';
import Asset from '../components/portfolio/Asset';
import Tokens from '../components/portfolio/Tokens';
import AssetChart from '../components/portfolio/AssetChart';
import Tab from '../components/portfolio/Tab';
import Positions from '../components/portfolio/Positions';
import Farms from '../components/portfolio/Farms';
import Orders from '../components/portfolio/Orders';
import Navigation from '../components/portfolio/Navigation';
import Banner from '../components/portfolio/Banner';
import { useHistory } from 'react-router';
import {
  REF_FI_LP_VALUE_COUNT,
  REF_FI_LP_V2_VALUE,
} from '../pages/poolsV3/YourLiquidityPageV3';
export const PortfolioData = createContext(null);
function Portfolio() {
  const clearState = () => {
    sessionStorage.removeItem(REF_FI_LP_VALUE_COUNT);
    sessionStorage.removeItem(REF_FI_LP_V2_VALUE);
  };
  window.onbeforeunload = clearState;
  const historyYourLP = useHistory();
  useEffect(() => {
    clearState();
  }, [historyYourLP.location.pathname]);
  const [activeTab, setActiveTab] = useState(2); // 1,2,3
  const [YourLpValueV2, setYourLpValueV2] = useState('0');
  const [YourLpValueV1, setYourLpValueV1] = useState('0');
  const [lpValueV1Done, setLpValueV1Done] = useState(false);
  const [lpValueV2Done, setLpValueV2Done] = useState(false);
  const [v1LiquidityQuantity, setV1LiquidityQuantity] = useState('0');
  const [v2LiquidityQuantity, setV2LiquidityQuantity] = useState('0');
  const [v2LiquidityLoadingDone, setV2LiquidityLoadingDone] = useState(false);
  const [v1LiquidityLoadingDone, setV1LiquidityLoadingDone] = useState(false);

  const [classic_farms_value, set_classic_farms_value] = useState('0');
  const [dcl_farms_value, set_dcl_farms_value] = useState('0');
  const [classic_farms_value_done, set_classic_farms_value_done] =
    useState(false);
  const [dcl_farms_value_done, set_dcl_farms_value_done] = useState(false);
  const [all_farms_Loading_done, set_all_farms_Loading_done] = useState(false);
  const [all_farms_quanity, set_all_farms_quanity] = useState('0');

  const [active_order_value_done, set_active_order_value_done] =
    useState(false);
  const [active_order_Loading_done, set_active_order_Loading_done] =
    useState(false);
  const [active_order_value, set_active_order_value] = useState(false);
  const [active_order_quanity, set_active_order_quanity] = useState('0');

  return (
    <div className="flex items-stretch justify-between w-full h-full">
      <PortfolioData.Provider
        value={{
          activeTab,
          setActiveTab,

          YourLpValueV1,
          YourLpValueV2,
          lpValueV1Done,
          lpValueV2Done,
          v1LiquidityQuantity,
          v2LiquidityQuantity,
          v2LiquidityLoadingDone,
          v1LiquidityLoadingDone,
          setYourLpValueV1,
          setYourLpValueV2,
          setLpValueV1Done,
          setLpValueV2Done,
          setV1LiquidityQuantity,
          setV2LiquidityQuantity,
          setV1LiquidityLoadingDone,
          setV2LiquidityLoadingDone,

          classic_farms_value,
          dcl_farms_value,
          all_farms_quanity,
          classic_farms_value_done,
          dcl_farms_value_done,
          all_farms_Loading_done,
          set_dcl_farms_value_done,
          set_classic_farms_value_done,
          set_dcl_farms_value,
          set_classic_farms_value,
          set_all_farms_quanity,
          set_all_farms_Loading_done,

          active_order_quanity,
          active_order_value,
          active_order_value_done,
          active_order_Loading_done,
          set_active_order_value_done,
          set_active_order_Loading_done,
          set_active_order_quanity,
          set_active_order_value,
        }}
      >
        {/* Navigation */}
        <div style={{ width: '280px' }} className="pl-5 py-4 pr-4">
          <Navigation></Navigation>
        </div>
        {/* content */}
        <div className="flex-grow border-l border-r border-boxBorder">
          <Banner></Banner>
          <div className="flex justify-between items-stretch">
            {/* <Asset></Asset> */}
            <AssetChart></AssetChart>
          </div>
          <div>
            <Tab></Tab>
            <div className={`${activeTab == 1 ? '' : 'hidden'}`}>
              <Orders></Orders>
            </div>
            <div className={`${activeTab == 2 ? '' : 'hidden'}`}>
              <Positions></Positions>
            </div>
            <div className={`${activeTab == 3 ? '' : 'hidden'}`}>
              <Farms></Farms>
            </div>
          </div>
        </div>
        {/* tokens table */}
        <div style={{ minWidth: '330px' }}>
          <Tokens></Tokens>
        </div>
      </PortfolioData.Provider>
    </div>
  );
}

export default Portfolio;
// todo
// 未登录的情况下这个页面怎么展示
// 3个tab下面没有数据怎么展示-----加载中状态怎么展示
// 3个tab下 空数据怎么展示
// chart 表底部的数据怎么展示（月，周）
//  hover上去的数据怎么展示， 需要填充背景色
// 整体布局，当超宽屏幕时 应该居中处理
