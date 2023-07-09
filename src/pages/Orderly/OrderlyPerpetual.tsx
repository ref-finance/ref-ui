import * as React from 'react';
import './App.css';
import { ChartContainer } from './components/TVChartContainer/index';

import OrderBook from './components/OrderBook';
import ChartHeader from './components/ChartHeader';

import ChartHeaderPerp from './components/ChartHeaderPerp';

import UserBoardPerp from './components/UserBoardPerp';

import {
  get_orderly_private_key_path,
  get_orderly_public_key_path,
} from './orderly/utils';
import AllOrderBoard from './components/AllOrders';
import { useWalletSelector } from '../../context/WalletSelectorContext';
import { REF_ORDERLY_ACCOUNT_VALID } from './components/UserBoard/index';

import { useLargeScreen, useClientMobile, isMobile } from '../../utils/device';

import MobileInfoBoard from './components/MobileInfoBoard';

import { OrderlyUnderMaintainIcon } from './components/Common/Icons';
import { getOrderlySystemInfo } from './orderly/off-chain-api';
import { PerpOrderlyTip, PerpOrderlyTipMobile } from './components/PerpHeader';

function TradingBoard() {
  const isLarge = useLargeScreen();

  const [maintenance, setMaintenance] = React.useState<boolean>(undefined);

  React.useEffect(() => {
    getOrderlySystemInfo().then((res) => {
      if (res.data.status === 2) {
        setMaintenance(true);
      } else {
        setMaintenance(false);
      }
    });
  }, []);

  if (maintenance === undefined) return null;

  return (
    <div className="w-full flex  pl-4 xs:hidden md:hidden relative">
      {maintenance && <OrderlyUnderMaintain></OrderlyUnderMaintain>}

      <div className="w-full flex flex-col" id="trading-orderly-board">
        <ChartHeaderPerp maintenance={maintenance}></ChartHeaderPerp>

        <div
          className="w-full flex"
          style={{
            height: 'calc(52vh + 30px)',
          }}
        >
          <div className="w-full border p-4   border-boxBorder rounded-2xl bg-black bg-opacity-10">
            <ChartContainer maintenance={maintenance} />
          </div>
          {!isLarge && (
            <div className="w-80 flex-shrink-0 mx-3">
              <OrderBook maintenance={maintenance} />
            </div>
          )}
        </div>
        <div className={`${isLarge ? '' : 'mr-3'} mt-3 h-full`}>
          <AllOrderBoard maintenance={maintenance}></AllOrderBoard>
        </div>
      </div>

      {isLarge && (
        <div
          className="w-80 flex-shrink-0 flex flex-col mx-3"
          style={{
            height: 'calc(100vh - 100px)',
          }}
        >
          <OrderBook maintenance={maintenance} />
        </div>
      )}
      <div
        className=" flex-shrink-0"
        style={{
          width: '340px',
        }}
      >
        <UserBoardPerp maintenance={maintenance} />
      </div>
    </div>
  );
}

function MobileTradingBoard() {
  const [maintenance, setMaintenance] = React.useState<boolean>(undefined);

  React.useEffect(() => {
    getOrderlySystemInfo().then((res) => {
      if (res.data.status === 2) {
        setMaintenance(true);
      } else {
        setMaintenance(false);
      }
    });
  }, []);

  React.useEffect(() => {
    if (maintenance) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    }
  }, [maintenance]);

  if (maintenance === undefined) return null;

  return (
    <div>
      {maintenance && <OrderlyUnderMaintain></OrderlyUnderMaintain>}

      <div className="w-95vw  mx-auto flex flex-col lg:hidden">
        <ChartHeader maintenance={maintenance}></ChartHeader>

        {/* info board */}

        <MobileInfoBoard maintenance={maintenance} />

        {/* operation board */}
      </div>

      <div className="w-full flex flex-col lg:hidden">
        <AllOrderBoard maintenance={maintenance} />
      </div>
    </div>
  );
}

function OrderlyUnderMaintain() {
  return (
    <div
      className="absolute xs:fixed w-screen h-full  left-0 flex items-center justify-center"
      style={{
        background: 'rgba(0, 19, 32, 0.6)',
        zIndex: 90,
        backdropFilter: isMobile() ? 'blur(5px)' : '',
        WebkitBackdropFilter: isMobile() ? 'blur(5px)' : '',
      }}
    >
      <OrderlyUnderMaintainIcon></OrderlyUnderMaintainIcon>
    </div>
  );
}

export function OrderlyPerpetual() {
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
    <>
      <div className="mx-auto xs:relative xs:bottom-6">
        {!isMobile && <PerpOrderlyTip />}

        {!isMobile && <TradingBoard></TradingBoard>}

        {isMobile && <MobileTradingBoard></MobileTradingBoard>}
      </div>

      {isMobile && <PerpOrderlyTipMobile></PerpOrderlyTipMobile>}
    </>
  );
}
