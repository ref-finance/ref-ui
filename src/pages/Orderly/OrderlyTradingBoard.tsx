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
import { get_orderly_private_key_path, tradingKeyMap } from './orderly/utils';

Big.RM = 0;

function TradingBoard() {
  return (
    <div className="w-full flex  pl-4">
      <div className="w-4/5 flex flex-col">
        <div
          className="w-full flex"
          style={{
            height: '570px',
          }}
        >
          <div className="w-3/4 border p-4   border-boxBorder rounded-2xl bg-cardBg">
            <ChartHeader></ChartHeader>
            <ChartContainer />
          </div>

          <div className="w-1/4 mx-3">
            <OrderBook />
          </div>
        </div>
        <div className="mr-3 mt-3 h-full">
          <OrderBoard></OrderBoard>
        </div>
      </div>

      <div className="w-1/5">
        <UserBoard />
      </div>
    </div>
  );
}

function OrderlyTradingBoard() {
  window.onbeforeunload = () => {
    const priKeyPath = get_orderly_private_key_path();

    const pubKeyPath = get_orderly_private_key_path();

    tradingKeyMap.get(priKeyPath) &&
      localStorage.setItem(priKeyPath, tradingKeyMap.get(priKeyPath));

    tradingKeyMap.get(pubKeyPath) &&
      localStorage.setItem(pubKeyPath, tradingKeyMap.get(pubKeyPath));
  };

  window.onload = () => {
    const priKeyPath = get_orderly_private_key_path();

    const pubKeyPath = get_orderly_private_key_path();

    const priKey = localStorage.getItem(priKeyPath);

    const pubKey = localStorage.getItem(pubKeyPath);

    priKey && tradingKeyMap.set(priKeyPath, priKey);

    pubKey && tradingKeyMap.set(pubKeyPath, pubKey);
  };

  React.useEffect(() => {
    const el = document.getElementsByClassName('page-container')?.[0];
    if (el) {
      //@ts-ignore
      el.style.backgroundColor = 'rgb(19, 33, 42)';
    }
  }, []);

  return (
    <div>
      <TradingBoard></TradingBoard>

      <ToastContainer />
    </div>
  );
}

export default OrderlyTradingBoard;