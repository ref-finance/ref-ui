import * as React from 'react';

import { useEffect, useState } from 'react';

import './App.css';
import { ChartContainer } from './components/TVChartContainer/index';

import OrderBook from './components/OrderBook';
import ChartHeader, {
  ChartHeaderDetail,
  ChartHeaderSecondRoute,
} from './components/ChartHeader';

import ChartHeaderPerp from './components/ChartHeaderPerp';

import UserBoardPerp from './components/UserBoardPerp';

import {
  get_orderly_private_key_path,
  get_orderly_public_key_path,
} from './orderly/utils';
import AllOrderBoard from './components/AllOrders';
import { useWalletSelector } from '../../context/WalletSelectorContext';
import { REF_ORDERLY_ACCOUNT_VALID } from './components/UserBoard/index';
import RefreshModal from './components/TableWithTabs/RefreshModal';

import { useLargeScreen, useClientMobile, isMobile } from '../../utils/device';

import MobileInfoBoard, {
  CurAsset,
  MobileChartBoard,
} from './components/MobileInfoBoard';

import { OrderlyUnderMaintainIcon } from './components/Common/Icons';
import { PerpOrderlyTip, PerpOrderlyTipMobile } from './components/PerpHeader';
import { useOrderlyContext } from './orderly/OrderlyContext';
import { PerpOrSpot } from './utiles';
import { FormattedMessage, useIntl } from 'react-intl';
import { OrderBookMobile } from './components/OrderBook/index';
import {
  MobileliquidationList,
  REF_FI_ORDERLY_LIQUIDATION_UNREAD,
} from './components/UserBoardPerp/components/LiquidationHistory';
import { BsArrowRight } from '../../components/reactIcons';
import { openUrl } from 'src/services/commonV3';
import { usePerpData } from './components/UserBoardPerp/state';
import PositionsTable from './components/AllOrders/PositionsTable';
import { CheckBox } from './components/Common';
import { parseSymbol } from './components/RecentTrade';
import { NewUserTip } from './components/Common/NewUserTip';
import BlockOrderBookTip from './BlockOrderBookTip';

export const REF_ORDERLY_PERP_TIP_SIG = 'REF_ORDERLY_PERP_TIP_SIGN9';

function TradingBoard() {
  const isLarge = useLargeScreen();

  const { maintenance } = useOrderlyContext();

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
        <UserBoardPerp maintenance={maintenance} />
      </div>
    </div>
  );
}

function MobileTradingBoard() {
  const {
    myPendingOrdersRefreshing,
    symbol,
    maintenance,
    symbolType,
    setLiquidations,
    availableSymbols,
    tokenInfo,
    liquidations,
    allOrders,
  } = useOrderlyContext();

  const { newPositions } = usePerpData();

  const [route, setRoute] = useState<'user_board' | 'chart'>('user_board');

  const [displayTab, setDisplayTab] = useState<
    'orders' | 'assets' | 'liquidations' | 'positions'
  >('positions');

  const [showCurSymbol, setShowCurSymbol] = useState<boolean>(false);

  const [displayOrderCount, setDisplayOrderCount] = useState<number>();

  const storedUnRead = localStorage.getItem(REF_FI_ORDERLY_LIQUIDATION_UNREAD);

  const [unReadCount, setUnReadCount] = useState<number>(
    !storedUnRead ? 0 : Number(storedUnRead)
  );
  useEffect(() => {
    if (!liquidations.length) return;
    localStorage.setItem(
      REF_FI_ORDERLY_LIQUIDATION_UNREAD,

      (unReadCount + 1).toString()
    );
    setUnReadCount((c) => c + 1);
  }, [liquidations?.length, liquidations?.[0]?.timestamp]);

  React.useEffect(() => {
    if (maintenance) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }
  }, [maintenance]);

  const [subOrderTab, setSubOrderTab] = useState<'open' | 'history'>('open');

  const intl = useIntl();
  const openOrders = allOrders?.filter((o) => {
    return o.status === 'NEW' || o.status === 'PARTIAL_FILLED';
  });
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

        {/* operation board */}
      </div>

      {route == 'user_board' && (
        <>
          <div className="w-full mt-7 frcs border-b text-sm text-primaryText border-white border-opacity-20">
            <div
              className={`w-1/4 relative ${
                displayTab == 'positions' ? 'text-white' : ''
              } frcc pb-2`}
              onClick={() => {
                setDisplayTab('positions');
              }}
            >
              <FormattedMessage
                id="positions"
                defaultMessage={'Positions'}
              ></FormattedMessage>
              {!newPositions ||
              newPositions?.rows?.filter(
                (p) =>
                  p.position_qty !== 0 &&
                  (showCurSymbol ? p.symbol === symbol : true)
              ) === undefined
                ? '-'
                : `(${
                    newPositions?.rows?.filter(
                      (p) =>
                        p.position_qty !== 0 &&
                        (showCurSymbol ? p.symbol === symbol : true)
                    ).length
                  })`}

              {displayTab === 'positions' && (
                <div
                  className="w-full absolute -bottom-0.5 h-0.5 bg-gradientFromHover"
                  style={{
                    width: 'calc(100% - 20px)',
                  }}
                ></div>
              )}
            </div>

            <div
              className={`w-1/4 relative ${
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
                    width: 'calc(100% - 20px)',
                  }}
                ></div>
              )}
            </div>

            <div
              className={`w-1/4 ${
                displayTab == 'assets' ? 'text-white' : ''
              } frcc pb-2 relative`}
              onClick={() => {
                setDisplayTab('assets');
              }}
            >
              <NewUserTip type="perp-mobile"></NewUserTip>
              <FormattedMessage
                id="assets"
                defaultMessage={'Assets'}
              ></FormattedMessage>

              {displayTab === 'assets' && (
                <div
                  style={{
                    width: 'calc(100% - 20px)',
                  }}
                  className="w-full absolute -bottom-0.5 h-0.5 bg-gradientFromHover"
                ></div>
              )}
            </div>

            <div
              className={`w-1/4 ${
                displayTab == 'liquidations' ? 'text-white' : ''
              } frcc gap-1 pb-2 relative`}
              onClick={() => {
                setDisplayTab('liquidations');
              }}
            >
              <FormattedMessage
                id="liquidations"
                defaultMessage={'Liquidations'}
              ></FormattedMessage>

              {displayTab === 'liquidations' && (
                <div
                  style={{
                    width: 'calc(100% - 20px)',
                  }}
                  className="w-full absolute -bottom-0.5 h-0.5 bg-gradientFromHover"
                ></div>
              )}
            </div>
          </div>

          <div
            className="w-full flex flex-col  "
            style={{
              display: displayTab !== 'orders' ? 'none' : '',
            }}
          >
            <AllOrderBoard
              subOrderTab={subOrderTab}
              setSubOrderTab={setSubOrderTab}
              maintenance={maintenance}
              defaultOpen={true}
              setDisplayOrderCount={setDisplayOrderCount}
              displayOrderCount={displayOrderCount}
            />
          </div>

          {displayTab === 'positions' && (
            <div className="text-primaryText">
              <PositionsTable
                hidden={false}
                showCurSymbol={false}
                futureOrders={openOrders}
              />
            </div>
          )}

          {displayTab === 'assets' && <CurAsset></CurAsset>}

          {displayTab === 'liquidations' && (
            <MobileliquidationList
              unReadCount={unReadCount}
              setUnReadCount={setUnReadCount}
            ></MobileliquidationList>
          )}
          <div className="frcb w-full gap-2 px-3 border-t border-white text-white border-opacity-10">
            <button
              className="frcc w-full mt-4 py-2 rounded-lg border border-white border-opacity-10 gap-2"
              onClick={() => {
                openUrl('/orderly');
              }}
            >
              <FormattedMessage
                id="portfolio"
                defaultMessage={'Portfolio'}
              ></FormattedMessage>

              <BsArrowRight strokeWidth={1}></BsArrowRight>
            </button>

            {/* <LiquidationButton /> */}
          </div>
        </>
      )}

      {route === 'chart' && (
        <OrderBookMobile maintenance={maintenance}></OrderBookMobile>
      )}

      {route === 'chart' && (
        <div
          className="fixed text-base bottom-10 z-50 text-white w-95vw  bg-stableTab rounded-lg frcc py-2 font-gothamBold"
          onClick={() => {
            setRoute('user_board');
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

function OrderlyPerpetual() {
  const priKeyPath = get_orderly_private_key_path();

  const pubKeyPath = get_orderly_public_key_path();
  const { selector, accountId } = useWalletSelector();
  const { needRefresh, validAccountSig } = useOrderlyContext();

  const isMobile = useClientMobile();

  selector.on('signedOut', () => {
    // tradingKeyMap.clear();
    localStorage.removeItem(priKeyPath);
    localStorage.removeItem(pubKeyPath);

    localStorage.removeItem(REF_ORDERLY_ACCOUNT_VALID);
  });

  return (
    <>
      <div className="mx-auto xs:relative lg:relative xs:w-95vw lg:bottom-9 xs:bottom-6">
        {!isMobile && <PerpOrderlyTip />}

        {!isMobile && <TradingBoard></TradingBoard>}

        {isMobile && <MobileTradingBoard></MobileTradingBoard>}
      </div>

      {validAccountSig && (
        <RefreshModal isOpen={needRefresh} onClick={async () => {}} />
      )}

      {isMobile && <PerpOrderlyTipMobile></PerpOrderlyTipMobile>}
    </>
  );
}
export default function OrderBookPerp() {
  const disbaledWallet = ['okx-wallet'];
  const selectedWalletId = window.selector?.store?.getState()?.selectedWalletId;
  const isBlock = disbaledWallet.includes(selectedWalletId);
  if (isBlock) return <BlockOrderBookTip />;
  return <OrderlyPerpetual />;
}
