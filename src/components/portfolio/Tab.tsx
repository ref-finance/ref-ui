import React, { useEffect, useMemo, useState, useContext } from 'react';
export default function Tab(props: any) {
  const { activeTab, setActiveTab } = props;
  const tabList = [
    { name: 'Your Positions', tag: 1 },
    { name: 'Active Orders', tag: 2 },
    { name: 'Your Farms', tag: 3 },
  ];
  function switchTab(tag: number) {
    setActiveTab(tag);
  }
  return (
    <div className="flex items-center mt-10 mb-6">
      {tabList.map((tab: { name: string; tag: number }) => {
        return (
          <div
            key={tab.name}
            className="flex flex-col items-center mx-6 cursor-pointer"
            onClick={() => {
              switchTab(tab.tag);
            }}
          >
            <span
              className={`text-base  ${
                tab.tag == activeTab
                  ? 'text-white gotham_bold'
                  : 'text-primaryText'
              }`}
            >
              {tab.name}
            </span>
            <div
              className={`rounded-2xl bg-senderHot mt-2.5 ${
                tab.tag == activeTab ? 'visible' : 'invisible'
              }`}
              style={{ width: '90px', height: '3px' }}
            ></div>
          </div>
        );
      })}
    </div>
  );
}
