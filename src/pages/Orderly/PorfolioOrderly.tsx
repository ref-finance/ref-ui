import React, { createContext, useEffect, useContext, useState } from 'react';
import Big from 'big.js';
import ReactTooltip from 'react-tooltip';
import _ from 'lodash';
import { useIntl } from 'react-intl';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { isMobile } from '~utils/device';
import { executeMultipleTransactions } from '~services/near';
import { numberWithCommas } from './utiles';
import { toPrecision } from './near';
import TableWithTabs from './components/TableWithTabs';
import SettlePnlModal from './components/TableWithTabs/SettlePnlModal';
import { MobileFilterModal } from './components/TableWithTabs/OrdersFilters';
import { ClosingModal } from './components/TableWithTabs/FuturesControls';
import { MobileHistoryOrderDetail } from './components/AllOrders';
import { formatTimeDate } from './components/OrderBoard';
import { usePortableOrderlyTable, useMarketlist } from './orderly/constantWjsx';
import {
  getOrderlySystemInfo,
  getCurrentHolding,
  createOrder,
  getOrderByOrderId,
  getOrderTrades
} from './orderly/off-chain-api';
import { OrderlyUnderMaintain } from './OrderlyTradingBoard';
import { FlexRow, orderEditPopUpFailure } from './components/Common';
import { orderPopUp } from './components/Common/index';
import { AssetManagerModal, TextWrapper } from './components/UserBoard';
import Navigation, {
  NavigationMobile,
} from '../../components/portfolio/Navigation';
import QuestionMark from '../../components/farm/QuestionMark';
import { WarningIcon } from '../../components/icon';
import { usePerpData } from './components/UserBoardPerp/state';
import { useTokenMetaFromSymbol } from './components/ChartHeader/state';
import { parseSymbol } from './components/RecentTrade';
import { useTokenInfo } from './orderly/state';
import {
  OrderAsset,
  useOrderlyPortfolioAssets,
} from './components/AssetModal/state';
import {
  depositOrderly,
  withdrawOrderly,
  perpSettlementTx,
} from './orderly/api';
import { useOrderlyContext } from './orderly/OrderlyContext';
import { Holding, MyOrder, OrderTrade } from './orderly/type';

import { WalletContext } from '../../utils/wallets-integration';
import { useWalletSelector } from '../../context/WalletSelectorContext';
export const PortfolioOrderlyData = createContext(null);
const is_mobile = isMobile();

function PortfolioOrderly() {
  const intl = useIntl();
  const { marketList, allTokens } = useMarketlist();
  const { globalState } = useContext(WalletContext);
  const { accountId } = useWalletSelector();
  const {
    tokenInfo,
    balances,
    symbol,
    myPendingOrdersRefreshing,
    handlePendingOrderRefreshing,
    validAccountSig,
  } = useOrderlyContext();
  const isSignedIn = globalState.isSignedIn;
  const [maintenance, setMaintenance] = useState<boolean>(undefined);
  const [tab, setTab] = useState<number>(0);
  const [refOnly, setRefOnly] = useState<boolean>(false);
  const [orderType, setOrderType] = useState<number>(0);
  const [chooseMarketSymbol, setChooseMarketSymbol] =
    useState<string>('all_markets');
  const [chooseOrderSide, setChooseOrderSide] = useState<
    'all_side' | 'BUY' | 'SELL'
  >('all_side');

  const [chooseOrderStatus, setChooseOrderStatus] = useState<
    'all' | 'Cancelled' | 'filled' | 'Rejected'
  >('all');
  const [chooseOrderType, setChooseOrderType] = useState<
    'all' | 'limit' | 'market'
  >('all');

  const [mobileFilterOpen, setMobileFilterOpen] = useState<number>(0);
  const [selectedOrder, setSelectedOrder] = useState<MyOrder>();
  const [showMobileOrderDetail, setShowMobileOrderDetail] =
    useState<boolean>(false);
    const [orderTradesHistory, setOrderTradesHistory] = useState<OrderTrade[]>();

  const [holdings, setHoldings] = useState<Holding[]>();
  const [operationType, setOperationType] = useState<'deposit' | 'withdraw'>();
  const { symbolFrom } = parseSymbol(symbol);

  const tokenIn = useTokenMetaFromSymbol(symbolFrom, tokenInfo);
  const [operationId, setOperationId] = useState<string>(tokenIn?.id || '');

  const curHoldingIn = holdings?.find((h) => h.token === symbolFrom);
  const tokenInHolding = curHoldingIn
    ? toPrecision(
        new Big(curHoldingIn.holding + curHoldingIn.pending_short).toString(),
        Math.min(8, tokenIn?.decimals || 8),
        false
      )
    : balances && balances[symbolFrom]?.holding;

  const nonOrderlyTokenInfo = useTokenInfo();
  const displayBalances: OrderAsset[] =
    useOrderlyPortfolioAssets(nonOrderlyTokenInfo);

  async function openTrades(order: MyOrder) {
    setSelectedOrder(order);

    if (!!orderTradesHistory) {
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

  const {
    newPositions,
    markPrices,
    totalEst,
    triggerBalanceBasedData,
    triggerPositionBasedData,
    totalAvailable,
    freeCollateral
  } = usePerpData({ displayBalances });

  // closing order
  const [closeOrderOpen, setCloseOrderOpen] = useState<boolean>(false);
  const [closeOrderPrice, setCloseOrderPrice] = useState<number | 'Market'>('Market');
  const [closeOrderQuantity, setCloseOrderQuantity] = useState<number>(0);
  const [closeOrderRow, setCloseOrderRow] = useState<any>({});
  const [totalEstFinal, setTotalEstFinal] = useState<string>('0');

  const handleOpenClosing = (closingQuantity: number, closingPrice: number | 'Market', row: any) => {
    setCloseOrderOpen(true);
    setCloseOrderRow(row);
    setCloseOrderPrice(closingPrice);
    setCloseOrderQuantity(closingQuantity);
  }

  // settle pnl
  const [settlePnlModalOpen, setSettlePnlModalOpen] = useState<boolean>(false);

  const { ordersTable, assetsTables, recordsTable } = usePortableOrderlyTable({
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
    openTrades
  });

  const handleSettlePnl = async () => {
    if (!accountId) return;

    return executeMultipleTransactions([await perpSettlementTx()]);
  };

  const handleCloseOrder = async () => {
    if (!accountId) return;
    return createOrder({
      accountId,
      orderlyProps: {
        side: closeOrderRow.position_qty < 0 ? 'BUY' : 'SELL',
        symbol: closeOrderRow.symbol,
        order_type:
        closeOrderPrice === 'Market'
            ? 'MARKET'
            : 'LIMIT',
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

  useEffect(() => {
    getOrderlySystemInfo().then((res) => {
      if (res.data.status === 2) {
        setMaintenance(true);
      } else {
        setMaintenance(false);
      }
    });
  }, []);

  const getTotalEst = async () => {
    // Call the memoizedTotalEst function to get the calculated value
    const totalEstimate = await totalEst();
    setTotalEstFinal(totalEstimate);
    console.log('Total Estimate:', totalEstimate);
    // Do something with the calculated value (e.g., update state or render on the UI)
  };

  useEffect(() => {
    getTotalEst();
  }, [newPositions, markPrices, displayBalances]);

  useEffect(() => {
    if (!accountId || !validAccountSig) return;

    getCurrentHolding({ accountId }).then((res) => {
      setHoldings(res.data.holding);
    });
  }, [accountId, myPendingOrdersRefreshing, validAccountSig]);

  if (maintenance === undefined) return null;

  const mobileTables = [assetsTables, ordersTable, recordsTable];

  return (
    <PortfolioOrderlyData.Provider
      value={{
        isSignedIn,
        accountId,
        is_mobile,
      }}
    >
      {maintenance && <OrderlyUnderMaintain />}
      <div className="flex items-stretch justify-between w-full h-full lg:-mt-12">
        {/* Navigation */}
        <div
          style={{ width: '280px' }}
          className="pl-5 py-4 pr-4 flex-shrink-0 hidden md:block lg:block"
        >
          <Navigation></Navigation>
        </div>
        {/* content */}
        <div className="flex-grow border-l border-r border-boxBorder md:pt-9 lg:pt-9">
          <div className="md:px-2.5 lg:px-5 3xl:max-w-1280px m-auto">
            <div className="w-full grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 md:bg-cardBg lg:bg-cardBg px-3 py-4 rounded-xl">
              {/* getCurrentHolding */}
              <div className="col-span-2 mb-3">
                <div className="flex items-center">
                  <span className="text-sm text-primaryText flex items-center">
                    Total Est. Value
                    <div
                      className="text-white text-right ml-1"
                      data-class="reactTip"
                      data-for="selectAllId"
                      data-place="bottom"
                      data-html={true}
                      data-tip={`
                        <div class="text-navHighLightText text-xs text-left w-64 xsm:w-52">
                          ${intl.formatMessage({
                            id: 'portfolio_total_est_tip',
                            defaultMessage: 'Portfolio value in USD.'
                          })}
                        </div>
                      `}
                    >
                      <QuestionMark />
                      <ReactTooltip
                        id="selectAllId"
                        backgroundColor="#1D2932"
                        border
                        borderColor="#7e8a93"
                        effect="solid"
                      />
                    </div>
                  </span>
                </div>
                <div className="text-2xl gotham_bold text-white mt-1 flex items-center">
                  ${totalEstFinal}
                  <div className="ml-3 flex items-center hidden md:flex lg:flex flex-wrap">
                    {displayBalances.map(({ tokenMeta, available }) => parseFloat(available) > 0 && (
                      <div key={tokenMeta.id} className="flex items-center text-white text-sm -ml-1">
                        <img
                          src={allTokens[tokenMeta.symbol]?.icon}
                          alt=""
                          className="rounded-full flex-shrink-0 w-4 h-4"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-span-2 mb-3">
                <div className="flex items-center">
                  <span className="text-sm text-primaryText">Available</span>
                </div>
                <span className="text-xl gotham_bold text-white mt-1 flex items-center">
                  ${totalAvailable}
                  <div className="ml-3 items-center hidden md:flex lg:flex flex-wrap">
                    {displayBalances.map(({ tokenMeta, available }) => parseFloat(available) > 0 && (
                      <div key={tokenMeta.id} className="flex items-center text-white text-sm -ml-1">
                        <img
                          src={allTokens[tokenMeta.symbol]?.icon}
                          alt=""
                          className="rounded-full flex-shrink-0 w-4 h-4"
                        />
                      </div>
                    ))}
                  </div>
                </span>
              </div>
            </div>

            <div className="hidden md:block lg:block">
              <TableWithTabs
                table={ordersTable}
                maintenance={maintenance}
                refOnly={refOnly}
                orderType={orderType}
                setOrderType={setOrderType}
                chooseMarketSymbol={chooseMarketSymbol}
                setChooseMarketSymbol={setChooseMarketSymbol}
                chooseOrderSide={chooseOrderSide}
                setChooseOrderSide={setChooseOrderSide}
                displayBalances={displayBalances}
                triggerBalanceBasedData={triggerBalanceBasedData}
                triggerPositionBasedData={triggerPositionBasedData}
                validAccountSig={validAccountSig}
              />
              <TableWithTabs
                table={assetsTables}
                maintenance={maintenance}
                displayBalances={displayBalances}
                newPositions={newPositions}
                validAccountSig={validAccountSig}
                handleOpenClosing={handleOpenClosing}
              />
              <TableWithTabs
                table={recordsTable}
                maintenance={maintenance}
                displayBalances={displayBalances}
                triggerBalanceBasedData={triggerBalanceBasedData}
                validAccountSig={validAccountSig}
              />
              <span className="text-xs text-primaryOrderly flex items-center">
                <div className="ml-5 mr-1">
                  <WarningIcon />
                </div>
                {intl.formatMessage({
                  id: 'orderly_portfolio_table_tips',
                  defaultMessage:
                    'The data provided herein includes all assets and records in your account, not limited to those generated through REF.',
                })}
              </span>
            </div>

            <div className="md:hidden lg:hidden">

              <div className="w-full frcs border-b gotham_bold text-primaryText border-white border-opacity-20">

                {mobileTables.map((table, index) => (
                  <div
                    key={table.title}
                    onClick={() => {
                      setTab(index);
                    }}
                    className={`w-1/3 relative ${
                      tab === index ? 'text-white' : ''
                    } frcc pb-2`}
                  >
                    {table.title}

                    {tab === index  && <div className="w-full absolute -bottom-0.5 h-0.5 bg-gradientFromHover" /> }
                  </div>
                ))}
              </div>

              {tab === 0 && (
                <TableWithTabs
                  table={assetsTables}
                  maintenance={maintenance}
                  displayBalances={displayBalances}
                  newPositions={newPositions}
                  validAccountSig={validAccountSig}
                  handleOpenClosing={handleOpenClosing}
                />
              )}
              {tab === 1 && (
                <TableWithTabs
                  table={ordersTable}
                  maintenance={maintenance}
                  refOnly={refOnly}
                  setRefOnly={setRefOnly}
                  orderType={orderType}
                  setOrderType={setOrderType}
                  chooseMarketSymbol={chooseMarketSymbol}
                  setChooseMarketSymbol={setChooseMarketSymbol}
                  chooseOrderSide={chooseOrderSide}
                  setChooseOrderSide={setChooseOrderSide}
                  chooseOrderStatus={chooseOrderStatus}
                  setChooseOrderStatus={setChooseOrderStatus}
                  setChooseOrderType={setChooseOrderType}
                  chooseOrderType={chooseOrderType}
                  displayBalances={displayBalances}
                  triggerBalanceBasedData={triggerBalanceBasedData}
                  triggerPositionBasedData={triggerPositionBasedData}
                  setMobileFilterOpen={setMobileFilterOpen}
                  validAccountSig={validAccountSig}
                />
              )}
              {tab === 2 && (
                <TableWithTabs
                  table={recordsTable}
                  maintenance={maintenance}
                  displayBalances={displayBalances}
                  triggerBalanceBasedData={triggerBalanceBasedData}
                  validAccountSig={validAccountSig}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="md:hidden lg:hidden">
        <NavigationMobile />
      </div>

      <SettlePnlModal
        isOpen={settlePnlModalOpen}
        onRequestClose={() => {
          setSettlePnlModalOpen(false);
        }}
        onClick={handleSettlePnl}
      />

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

      <AssetManagerModal
        isOpen={operationType === 'deposit'}
        onRequestClose={() => {
          setOperationType(undefined);
        }}
        type={operationType}
        onClick={(amount: string, tokenId: string) => {
          if (!tokenId) return;
          return depositOrderly(tokenId, amount);
        }}
        tokenId={operationId}
        accountBalance={tokenInHolding || 0}
        tokenInfo={tokenInfo}
        freeCollateral={freeCollateral}
      />

      <AssetManagerModal
        isOpen={operationType === 'withdraw'}
        onRequestClose={() => {
          setOperationType(undefined);
        }}
        type={operationType}
        onClick={(amount: string, tokenId: string) => {
          if (!tokenId) return;
          return withdrawOrderly(tokenId, amount);
        }}
        tokenId={operationId}
        accountBalance={tokenInHolding || 0}
        tokenInfo={tokenInfo}
        freeCollateral={freeCollateral}
      />

      <MobileFilterModal
        isOpen={mobileFilterOpen !== 0}
        refOnly={refOnly}
        setRefOnly={setRefOnly}
        tab={mobileFilterOpen}
        onRequestClose={() => setMobileFilterOpen(0)}
        curInstrument={
          chooseMarketSymbol === 'all_markets'
            ? 'All'
            : marketList.find((m) => m.textId === chooseMarketSymbol)?.text
        }
        curSymbol={chooseMarketSymbol ? chooseMarketSymbol : ''}
        setSide={setChooseOrderSide}
        curSide={chooseOrderSide}
        setInstrument={(value: string) => {
          setChooseMarketSymbol(value);
        }}
        setStatus={setChooseOrderStatus}
        curStatus={chooseOrderStatus}
        setType={setChooseOrderType}
        curType={chooseOrderType}
      />


      {showMobileOrderDetail && (
        <MobileHistoryOrderDetail
          isOpen={showMobileOrderDetail}
          onRequestClose={() => {
            setShowMobileOrderDetail(false);
          }}
          order={selectedOrder}
          symbol={selectedOrder.symbol}
          orderTradesHistory={orderTradesHistory}
          titleList={[
            intl.formatMessage({
              id: 'instrument',
              defaultMessage: 'Instrument',
            }),
            intl.formatMessage({
              id: 'Side',
              defaultMessage: 'Side',
            }),
            intl.formatMessage({
              id: 'type',
              defaultMessage: 'Type',
            }),
            intl.formatMessage({
              id: 'filled_qty',
              defaultMessage: 'Filled / Qty',
            }),
            intl.formatMessage({
              id: 'price',
              defaultMessage: 'Price',
            }),
            intl.formatMessage({
              id: 'avg_price',
              defaultMessage: 'Avg.Price',
            }),
            intl.formatMessage({
              id: 'total',
              defaultMessage: 'Total',
            }),
            intl.formatMessage({
              id: 'create_time',
              defaultMessage: 'Create Time',
            }),
            intl.formatMessage({
              id: 'status',
              defaultMessage: 'Status',
            }),
          ]}
          valueList={[
            marketList.find((m) => m.textId === selectedOrder.symbol)?.text,
            <TextWrapper
              className="px-2 text-sm"
              value={intl.formatMessage({
                id: selectedOrder.side.toLowerCase(),
                defaultMessage: selectedOrder.side,
              })}
              bg={selectedOrder.side === 'BUY' ? 'bg-buyGreen' : 'bg-sellRed'}
              textC={
                selectedOrder.side === 'BUY' ? 'text-buyGreen' : 'text-sellColorNew'
              }
            />,
            <FlexRow className="">
              <span className={`text-white capitalize `}>
                {selectedOrder.type === 'LIMIT'
                  ? intl.formatMessage({
                      id: 'limit_orderly',
                      defaultMessage: 'Limit',
                    })
                  : selectedOrder.type === 'MARKET'
                  ? intl.formatMessage({
                      id: 'market',
                      defaultMessage: 'Market',
                    })
                  : selectedOrder.type === 'POST_ONLY'
                  ? 'Post Only'
                  : selectedOrder.type}
              </span>

              <div
                className={
                  selectedOrder.type === 'MARKET'
                    ? 'hidden'
                    : 'flex items-center relative ml-1.5 justify-center border border-dashed rounded-full border-portfolioGreenColor '
                }
                style={{
                  height: '14px',
                  width: '14px',
                }}
              >
                <div
                  className=""
                  style={{
                    height: '9px',
                    width: '9px',
                  }}
                >
                  {selectedOrder.type !== 'MARKET' && (
                    <CircularProgressbar
                      styles={buildStyles({
                        pathColor: '#62C340',
                        strokeLinecap: 'butt',
                        trailColor: 'transparent',
                      })}
                      background={false}
                      strokeWidth={50}
                      value={selectedOrder.executed || 0}
                      maxValue={selectedOrder.quantity}
                    />
                  )}
                </div>
              </div>
            </FlexRow>,
            <FlexRow className="col-span-1  ">
              <span className="font-nunito">
                {numberWithCommas(selectedOrder.executed)}
              </span>

              <span className="mx-1 ">/</span>

              <span className="text-white font-nunito">
                {numberWithCommas(selectedOrder.quantity || selectedOrder.executed)}
              </span>
            </FlexRow>,
            <span className="font-nunito">
              {selectedOrder.price || selectedOrder.average_executed_price
                ? numberWithCommas(selectedOrder.price || selectedOrder.average_executed_price)
                : '-'}
            </span>,
            selectedOrder.average_executed_price === null ? (
              '-'
            ) : (
              <span className="font-nunito">
                {numberWithCommas(selectedOrder.average_executed_price)}
              </span>
            ),
            <span className="font-nunito">
              {numberWithCommas(
                new Big(selectedOrder.quantity || selectedOrder.executed || '0')
                  .times(
                    new Big(selectedOrder.average_executed_price || selectedOrder.price || '0')
                  )
                  .toNumber()
              )}
            </span>,
            <span className="font-nunito">
              {formatTimeDate(selectedOrder.created_time)}
            </span>,

            <span className="capitalize">
              {intl.formatMessage({
                id: _.upperFirst(selectedOrder.status.toLowerCase()),
                defaultMessage: _.upperFirst(selectedOrder.status.toLowerCase()),
              })}
            </span>,
          ]}
        />
      )}
    </PortfolioOrderlyData.Provider>
  );
}

export default PortfolioOrderly;
