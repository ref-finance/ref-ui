import * as React from 'react';

import { useEffect, useState } from 'react';
import './App.css';
import { ChartContainer } from './components/TVChartContainer/index';

import OrderBook, { OrderBookMobile } from './components/OrderBook';
import ChartHeader, {
  ChartHeaderDetail,
  ChartHeaderSecondRoute,
} from './components/ChartHeader';
import UserBoard from './components/UserBoard';

import {
  get_orderly_private_key_path,
  get_orderly_public_key_path,
} from './orderly/utils';
import AllOrderBoard from './components/AllOrders';
import { useWalletSelector } from '../../context/WalletSelectorContext';
import { REF_ORDERLY_ACCOUNT_VALID } from './components/UserBoard/index';

import { useLargeScreen, useClientMobile, isMobile } from '../../utils/device';

import MobileInfoBoard, {
  CurAsset,
  MobileChartBoard,
} from './components/MobileInfoBoard';

import { OrderlyUnderMaintainIcon } from './components/Common/Icons';
import { useOrderlyContext } from './orderly/OrderlyContext';
import { PerpOrSpot } from './utiles';
import { FormattedMessage } from 'react-intl';
import { NewUserTip } from './components/Common/NewUserTip';
import BlockOrderBookTip from './BlockOrderBookTip';
import { PerpOrderlyTip, PerpOrderlyTipMobile } from './components/PerpHeader';

function TradingBoard() {
  const isLarge = useLargeScreen();

  const { maintenance } = useOrderlyContext();

  if (maintenance === undefined) return null;

  return (
    <div className="w-full flex  pl-4 xs:hidden md:hidden relative">
      {maintenance && <OrderlyUnderMaintain></OrderlyUnderMaintain>}

      <div className="w-full flex flex-col" id="trading-orderly-board">
        <ChartHeader></ChartHeader>

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
            height: 'calc(52vh + 30px + 100vh - 680px + 90px)',
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
        <UserBoard maintenance={maintenance} />
      </div>
    </div>
  );
}

function MobileTradingBoard() {
  const { myPendingOrdersRefreshing, symbol, maintenance, allOrders } =
    useOrderlyContext();

  const [subOrderTab, setSubOrderTab] = useState<'open' | 'history'>('open');

  const [displayOrderCount, setDisplayOrderCount] = useState<number>();

  const [route, setRoute] = useState<'user_board' | 'chart'>('user_board');

  const [displayTab, setDisplayTab] = useState<'orders' | 'assets'>('orders');

  useEffect(() => {
    if (displayTab !== 'assets') {
      setSubOrderTab('open');
    }
  }, [displayTab]);

  React.useEffect(() => {
    if (maintenance) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }
  }, [maintenance]);

  if (maintenance === undefined) return null;

  return (
    <>
      {maintenance && <OrderlyUnderMaintain></OrderlyUnderMaintain>}

      <div className="w-95vw  mx-auto flex flex-col lg:hidden">
        {route === 'user_board' && (
          <ChartHeader route={route} setRoute={setRoute}></ChartHeader>
        )}
        {route == 'chart' && (
          <ChartHeaderSecondRoute route={route} setRoute={setRoute} />
        )}
        {route === 'chart' && <ChartHeaderDetail></ChartHeaderDetail>}
        {route === 'user_board' && (
          <MobileInfoBoard maintenance={maintenance} />
        )}
        {route === 'chart' && (
          <MobileChartBoard maintenance={maintenance}></MobileChartBoard>
        )}
      </div>

      {route == 'user_board' && (
        <>
          <div className="w-full mt-7 frcs border-b text-sm text-primaryText border-white border-opacity-20">
            <div
              className={`w-1/2 relative ${
                displayTab == 'orders' ? 'text-white' : ''
              } frcc pb-2`}
              onClick={() => {
                setDisplayTab('orders');
              }}
            >
              <FormattedMessage
                id="orders"
                defaultMessage={'Orders'}
              ></FormattedMessage>

              {displayOrderCount !== undefined && `(${displayOrderCount})`}

              {displayTab === 'orders' && (
                <div
                  className="w-full absolute -bottom-0.5 h-0.5 bg-gradientFromHover"
                  style={{
                    width: 'calc(100% - 40px)',
                  }}
                ></div>
              )}
            </div>

            <div
              className={`w-1/2 ${
                displayTab == 'assets' ? 'text-white' : ''
              } frcc pb-2 relative`}
              onClick={() => {
                setDisplayTab('assets');
              }}
            >
              <FormattedMessage
                id="assets"
                defaultMessage={'Assets'}
              ></FormattedMessage>
              <NewUserTip type="spot-mobile"></NewUserTip>

              {displayTab === 'assets' && (
                <div
                  style={{
                    width: 'calc(100% - 40px)',
                  }}
                  className="w-full absolute -bottom-0.5 h-0.5 bg-gradientFromHover"
                ></div>
              )}
            </div>
          </div>

          {displayTab === 'orders' && (
            <div className="w-full flex flex-col ">
              <AllOrderBoard
                subOrderTab={subOrderTab}
                setSubOrderTab={setSubOrderTab}
                maintenance={maintenance}
                setDisplayOrderCount={setDisplayOrderCount}
                displayOrderCount={displayOrderCount}
              />
            </div>
          )}

          {displayTab === 'assets' && <CurAsset></CurAsset>}
        </>
      )}

      {route === 'chart' && (
        <OrderBookMobile maintenance={maintenance}></OrderBookMobile>
      )}

      {route === 'chart' && (
        <div
          className="fixed z-50 text-base bottom-10 text-white w-95vw  bg-stableTab rounded-lg frcc py-2 font-gothamBold"
          onClick={() => {
            setRoute('user_board');
          }}
          style={{
            zIndex: '',
          }}
        >
          <FormattedMessage
            id="trade"
            defaultMessage={'Trade'}
          ></FormattedMessage>
        </div>
      )}
    </>
  );
}

export function OrderlyUnderMaintain() {
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
    <>
      <div className="mx-auto relative xs:bottom-6 bottom-9">
        {/* todo  */}
        {/* {!isMobile && <PerpOrderlyTip />} */}
        {!isMobile && <TradingBoard></TradingBoard>}

        {isMobile && <MobileTradingBoard></MobileTradingBoard>}
      </div>
      {/* todo  */}
      {/* {isMobile && <PerpOrderlyTipMobile></PerpOrderlyTipMobile>} */}
    </>
  );
}
export default function OrderBookSpot() {
  const disbaledWallet = ['okx-wallet'];
  const selectedWalletId = window.selector?.store?.getState()?.selectedWalletId;
  const isBlock = disbaledWallet.includes(selectedWalletId);
  if (isBlock) return <BlockOrderBookTip />;
  return <OrderlyTradingBoard />;
}
