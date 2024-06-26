import React, { createContext, useEffect, useContext, useState } from 'react';
import { useIntl } from 'react-intl';
import { isMobile } from '../../../../utils/device';

import TableWithTabs, { TableWithOutTabs } from '../TableWithTabs';

import { ClosingModal } from '../TableWithTabs/FuturesControls';

import {
  useMarketlist,
  usePortableOrderlyTablePositions,
} from '../../../../pages/Orderly/orderly/constantWjsx';

import {
  createOrder,
  getOrderByOrderId,
  getOrderTrades,
  getPortfolioAllOrders,
} from '../../orderly/off-chain-api';
import { FlexRow, orderEditPopUpFailure } from '../../components/Common';
import { orderPopUp } from '../../components/Common/index';

import { usePerpData } from '../../components/UserBoardPerp/state';

import { useTokenMetaFromSymbol } from '../ChartHeader/state';

import { parseSymbol } from '../RecentTrade';

import { useTokenInfo } from '../../../../pages/Orderly/orderly/state';

import {
  OrderAsset,
  useOrderlyPortfolioAssets,
} from '../../components/AssetModal/state';

import { useOrderlyContext } from '../../orderly/OrderlyContext';
import { Holding, MyOrder, OrderTrade } from '../../orderly/type';
import { WalletContext } from '../../../../utils/wallets-integration';
import { useWalletSelector } from '../../../../context/WalletSelectorContext';
export const PortfolioOrderlyData = createContext(null);
const is_mobile = isMobile();

function PositionsTable({
  hidden,
  showCurSymbol,
  futureOrders,
}: {
  hidden: boolean;
  showCurSymbol: boolean;
  futureOrders: MyOrder[];
}) {
  const intl = useIntl();
  const { marketList, allTokens } = useMarketlist();
  const { globalState } = useContext(WalletContext);
  const { accountId } = useWalletSelector();
  const {
    tokenInfo,
    balances,
    symbol,
    handlePendingOrderRefreshing,
    validAccountSig,
    holdings,
    myPendingOrdersRefreshing,
  } = useOrderlyContext();
  const isSignedIn = globalState.isSignedIn;
  // for connect wallet
  const [tradingKeySet, setTradingKeySet] = useState<boolean>(false);
  const [keyAnnounced, setKeyAnnounced] = useState<boolean>(false);
  // ^for connect wallet
  const [refOnly, setRefOnly] = useState<boolean>(false);
  const [orderType, setOrderType] = useState<number>(0);
  const [chooseMarketSymbol, setChooseMarketSymbol] =
    useState<string>('all_markets');
  const [chooseOrderSide, setChooseOrderSide] = useState<
    'both_side' | 'BUY' | 'SELL'
  >('both_side');

  const [chooseOrderStatus, setChooseOrderStatus] = useState<
    'all' | 'Cancelled' | 'filled' | 'Rejected'
  >('all');
  const [chooseOrderType, setChooseOrderType] = useState<
    'all' | 'limit' | 'market'
  >('all');

  const [selectedOrder, setSelectedOrder] = useState<MyOrder>();
  const [showMobileOrderDetail, setShowMobileOrderDetail] =
    useState<boolean>(false);
  const [orderTradesHistory, setOrderTradesHistory] = useState<OrderTrade[]>();

  // const [holdings, setHoldings] = useState<Holding[]>();
  const [operationType, setOperationType] = useState<'deposit' | 'withdraw'>();
  const { symbolFrom } = parseSymbol(symbol);

  const tokenIn = useTokenMetaFromSymbol(symbolFrom, tokenInfo);
  const [operationId, setOperationId] = useState<string>(tokenIn?.id || '');

  const nonOrderlyTokenInfo = useTokenInfo();
  const displayBalances: OrderAsset[] =
    useOrderlyPortfolioAssets(nonOrderlyTokenInfo);

  async function openTrades(order: MyOrder) {
    setSelectedOrder(order);

    if (showMobileOrderDetail) {
      setShowMobileOrderDetail(!showMobileOrderDetail);
      return;
    }
    if (!accountId) return;

    if (order.executed !== null && order.executed > 0) {
      const res = await getOrderTrades({
        accountId,
        order_id: order.order_id,
      });
      if (!res.success) {
        return;
      }

      setOrderTradesHistory(res.data.rows);
    }

    setShowMobileOrderDetail(!showMobileOrderDetail);
  }
  const [unrealMode, setUnrealMode] = useState<'mark_price' | 'last_price'>(
    'mark_price'
  );

  const {
    newPositions,
    markPrices,
    lastPrices,
    totalEst,
    triggerBalanceBasedData,
    triggerPositionBasedData,
    totalAvailable,
    freeCollateral,
    portfolioUnsettle,
    totalPortfoliouPnl,
    totalDailyReal,
    totalNotional,
  } = usePerpData({ displayBalances, markMode: unrealMode === 'mark_price' });

  // closing order
  const [closeOrderOpen, setCloseOrderOpen] = useState<boolean>(false);
  const [closeOrderPrice, setCloseOrderPrice] = useState<number | 'Market'>(
    'Market'
  );
  const [closeOrderQuantity, setCloseOrderQuantity] = useState<number>(0);
  const [closeOrderRow, setCloseOrderRow] = useState<any>({});

  const handleOpenClosing = (
    closingQuantity: number,
    closingPrice: number | 'Market',
    row: any
  ) => {
    setCloseOrderOpen(true);
    setCloseOrderRow(row);
    setCloseOrderPrice(closingPrice);
    setCloseOrderQuantity(closingQuantity);
  };

  // settle pnl
  const [settlePnlModalOpen, setSettlePnlModalOpen] = useState<boolean>(false);

  const { assetsTables } = usePortableOrderlyTablePositions({
    unrealMode,
    setUnrealMode,
    refOnly,
    setRefOnly,
    orderType,
    setOrderType,
    chooseMarketSymbol,
    setChooseMarketSymbol,
    chooseOrderSide,
    setChooseOrderSide,
    setOperationType,
    setOperationId,
    tokenIn,
    setSettlePnlModalOpen,
    chooseOrderStatus,
    chooseOrderType,
    handleOpenClosing,
    openTrades,
    markPrices,
    lastPrices,
    portfolioUnsettle,
    totalPortfoliouPnl,
    totalDailyReal: totalDailyReal?.toString() || '-',
    totalNotional,
    newPositions,
    showCurSymbol,
  });

  const handleCloseOrder = async () => {
    if (!accountId) return;
    return createOrder({
      accountId,
      orderlyProps: {
        side: closeOrderRow.position_qty < 0 ? 'BUY' : 'SELL',
        symbol: closeOrderRow.symbol,
        order_type: closeOrderPrice === 'Market' ? 'MARKET' : 'LIMIT',
        order_quantity: closeOrderQuantity,
        broker_id: 'ref_dex',
        order_price: closeOrderPrice === 'Market' ? '' : closeOrderPrice,
      },
    }).then(async (res) => {
      if (res.success === false)
        return orderEditPopUpFailure({
          tip: res.message,
        });

      handlePendingOrderRefreshing();

      const order = await getOrderByOrderId({
        accountId,
        order_id: res.data.order_id,
      });

      return orderPopUp({
        orderType: closeOrderPrice === 'Market' ? 'Market' : 'Limit',
        symbolName: closeOrderRow.symbol,
        side: closeOrderRow.position_qty < 0 ? 'Buy' : 'Sell',
        size: closeOrderQuantity.toString(),
        tokenIn: tokenIn,
        price: parseFloat(
          order.data.price || order.data.average_executed_price
        ).toString(),
        timeStamp: res.timestamp,
        filled: order?.data?.status === 'FILLED',
        order,
      });
    });
  };

  // const getFutureOrders = async () => {
  //   const { data } = await getPortfolioAllOrders({
  //     accountId,
  //     OrderProps: {
  //       page: 1,
  //       size: 500,
  //       status: 'INCOMPLETE',
  //     },
  //   });
  //   const filterOrders: MyOrder[] = data?.rows?.filter((order: MyOrder) =>
  //     order.symbol.includes('PERP')
  //   );

  //   setFutureOrders(filterOrders);
  // };

  // useEffect(() => {
  //   getFutureOrders();
  // }, [myPendingOrdersRefreshing, triggerPositionBasedData]);

  // const [futureOrders, setFutureOrders] = useState<MyOrder[]>([]);

  if (hidden) return null;

  return (
    <PortfolioOrderlyData.Provider
      value={{
        isSignedIn,
        accountId,
        is_mobile,
      }}
    >
      <div className="flex items-stretch justify-between md:pb-0 lg:pb-0 w-full h-full ">
        {/* content */}
        <div className="hidden md:block lg:block">
          <TableWithOutTabs
            table={assetsTables}
            maintenance={false}
            displayBalances={displayBalances}
            newPositions={newPositions}
            validAccountSig={validAccountSig}
            handleOpenClosing={handleOpenClosing}
            futureOrders={futureOrders}
            markPrices={markPrices}
            lastPrices={lastPrices}
            unrealMode={unrealMode}
            tradingKeySet={tradingKeySet}
            setTradingKeySet={setTradingKeySet}
            keyAnnounced={keyAnnounced}
            setKeyAnnounced={setKeyAnnounced}
            showCurSymbol={showCurSymbol}
          />
        </div>

        <div className="md:hidden w-full lg:hidden">
          <TableWithOutTabs
            table={assetsTables}
            maintenance={false}
            displayBalances={displayBalances}
            newPositions={newPositions}
            validAccountSig={validAccountSig}
            handleOpenClosing={handleOpenClosing}
            futureOrders={futureOrders}
            markPrices={markPrices}
            unrealMode={unrealMode}
            lastPrices={lastPrices}
            tradingKeySet={tradingKeySet}
            setTradingKeySet={setTradingKeySet}
            keyAnnounced={keyAnnounced}
            setKeyAnnounced={setKeyAnnounced}
            showCurSymbol={showCurSymbol}
          />
        </div>
      </div>

      <ClosingModal
        isOpen={closeOrderOpen}
        onRequestClose={() => {
          setCloseOrderOpen(false);
        }}
        onClick={handleCloseOrder}
        row={closeOrderRow}
        closingPrice={closeOrderPrice}
        closingQuantity={closeOrderQuantity}
        marketList={marketList}
      />
    </PortfolioOrderlyData.Provider>
  );
}

export default PositionsTable;
