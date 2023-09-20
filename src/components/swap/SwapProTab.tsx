import React, { useContext, useEffect, useState } from 'react';
import { SwapProContext, SWAP_MODE } from '../../pages/SwapPage';
export default function ProTab() {
  const { proTab, setProTab, dcl_pool_id, swapMode } =
    useContext(SwapProContext);
  if (!dcl_pool_id || swapMode == SWAP_MODE.NORMAL) return null;
  return (
    <div className="inline-flex items-center justify-between border border-limitOrderFeeTiersBorderColor rounded-lg p-1">
      <div
        onClick={() => {
          setProTab('PRICE');
        }}
        className={`flex items-center justify-center px-4 py-0.5 rounded-md text-sm cursor-pointer ${
          proTab == 'PRICE' ? 'bg-proTabBgColor text-white' : 'text-primaryText'
        }`}
      >
        Price
      </div>
      <div
        onClick={() => {
          setProTab('ORDER');
        }}
        className={`flex items-center justify-center px-4 py-0.5 rounded-md text-sm cursor-pointer ${
          proTab == 'ORDER' ? 'bg-proTabBgColor text-white' : 'text-primaryText'
        }`}
      >
        Orders
      </div>
    </div>
  );
}
export type IProTab = 'PRICE' | 'ORDER';
