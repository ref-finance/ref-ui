import * as React from 'react';
import './App.css';
import {
  TVChartContainer,
  ChartContainer,
} from './components/TVChartContainer/index';
import { ToastContainer } from 'react-toastify';

import OrderBook from './components/OrderBook';
import ChartHeader from './components/ChartHeader';
import UserBoard from './components/UserBoard';
import OrderBoard from './components/OrderBoard';

import Big from 'big.js';
import {
  get_orderly_private_key_path,
  tradingKeyMap,
  get_orderly_public_key_path,
} from './orderly/utils';
import AllOrderBoard from './components/AllOrders';
import { useWalletSelector } from '../../context/WalletSelectorContext';
import { REF_ORDERLY_ACCOUNT_VALID } from './components/UserBoard/index';
import { useLargeScreen, useClientMobile } from '../../utils/device';

import MobileInfoBoard from './components/MobileInfoBoard';

function TradingBoard() {
  const isLarge = useLargeScreen();

  return (
    <div className="w-full flex  pl-4 xs:hidden md:hidden">
      <div className="w-full flex flex-col" id="trading-orderly-board">
        <div
          className="w-full flex"
          style={{
            height: 'calc(52vh + 70px)',
          }}
        >
          <div className="w-full border p-4   border-boxBorder rounded-2xl bg-black bg-opacity-10">
            <ChartHeader></ChartHeader>
            <ChartContainer />
          </div>
          {!isLarge && (
            <div className="w-80 flex-shrink-0 mx-3">
              <OrderBook />
            </div>
          )}
        </div>
        <div className={`${isLarge ? '' : 'mr-3'} mt-3 h-full`}>
          <AllOrderBoard></AllOrderBoard>
        </div>
      </div>

      {isLarge && (
        <div
          className="w-80 flex-shrink-0 flex flex-col mx-3"
          style={{
            height: 'calc(100vh - 100px)',
          }}
        >
          <OrderBook />
        </div>
      )}
      <div
        className=" flex-shrink-0"
        style={{
          width: '340px',
        }}
      >
        <UserBoard />
      </div>
    </div>
  );
}

function MobileTradingBoard() {
  return (
    <>
      <div className="w-95vw  mx-auto flex flex-col lg:hidden">
        <ChartHeader></ChartHeader>

        {/* info board */}

        <MobileInfoBoard />

        {/* operation board */}
      </div>

      <div className="w-full flex flex-col lg:hidden">
        <AllOrderBoard />
      </div>
    </>
  );
}

function OrderlyTradingBoard() {
  const priKeyPath = get_orderly_private_key_path();

  const pubKeyPath = get_orderly_public_key_path();
  const { selector, accountId } = useWalletSelector();

  const isMobile = useClientMobile();

  selector.on('signedOut', () => {
    // tradingKeyMap.clear();
    localStorage.removeItem(priKeyPath);
    localStorage.removeItem(pubKeyPath);

    localStorage.removeItem(REF_ORDERLY_ACCOUNT_VALID);
  });

  return (
    <div className="mx-auto xs:relative xs:bottom-6">
      {!isMobile && <TradingBoard></TradingBoard>}

      {isMobile && <MobileTradingBoard></MobileTradingBoard>}
    </div>
  );
}

export default OrderlyTradingBoard;
