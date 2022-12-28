import React from 'react';
import Asset from '../components/portfolio/Asset';
import AssetChart from '../components/portfolio/AssetChart';
function Portfolio() {
  return (
    <div className="lg:w-4/5 mx-auto">
      <div className="flex items-center">
        <div className="flex items-center border border-cardBg rounded-2xl">
          <Asset></Asset>
          <AssetChart></AssetChart>
        </div>
      </div>
    </div>
  );
}

export default Portfolio;
// todo
// 未登录的情况下这个页面怎么展示
