import React, { useState } from 'react';
import Asset from '../components/portfolio/Asset';
import Tokens from '../components/portfolio/Tokens';
import AssetChart from '../components/portfolio/AssetChart';
import Tab from '../components/portfolio/Tab';
import Positions from '../components/portfolio/Positions';
import Farms from '../components/portfolio/Farms';
import Orders from '../components/portfolio/Orders';
function Portfolio() {
  const [activeTab, setActiveTab] = useState(1); // 1,2,3
  return (
    <div className="lg:w-5/6 xl:w-2/3 mx-auto">
      <div className="flex justify-between items-stretch">
        <div className="flex items-stretch border border-cardBg rounded-2xl flex-grow">
          <Asset></Asset>
          <AssetChart></AssetChart>
        </div>
        <div className="bg-black bg-opacity-10 rounded-2xl border border-cardBg ml-3">
          <Tokens></Tokens>
        </div>
      </div>
      <div>
        <Tab activeTab={activeTab} setActiveTab={setActiveTab}></Tab>
        <div className={`${activeTab == 1 ? '' : 'hidden'}`}>
          <Positions></Positions>
        </div>
        <div className={`${activeTab == 2 ? '' : 'hidden'}`}>
          <Orders></Orders>
        </div>
        <div className={`${activeTab == 3 ? '' : 'hidden'}`}>
          <Farms></Farms>
        </div>
      </div>
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
