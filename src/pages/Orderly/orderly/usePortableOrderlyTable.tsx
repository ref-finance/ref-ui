import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { TokenMetadata } from 'src/services/ft-contract';
import {
  getPortfolioAllOrders,
  getFundingFee,
  getPortfolioAssetHistory,
  getPortfolioPosition,
  getPortfolioSettlements,
} from '../orderly/off-chain-api';
import { TextWrapper } from '../components/UserBoard';
import { PortfolioTable, MyOrder, MarkPrice } from './type';
import { useDEXLogoRender } from './customRenderHook';
import { useOrderlyContext } from '../orderly/OrderlyContext';
import { formatTimeDate, shortenAddress, getAccountName } from './utils';
import { useLeverage } from './state';
import { digitWrapperAsset } from '../utiles';
import { useBatchTokenMetaFromSymbols } from '../components/ChartHeader/state';
import { parseSymbol } from '../components/RecentTrade';
import ProgressBar from '../components/TableWithTabs/ProgressBar';
import OrdersFilters from '../components/TableWithTabs/OrdersFilters';
import {
  FutureMobileView,
  FutureTopComponent,
  FutureTableFormHeaders,
  FutureMobileViewPerpPage,
} from '../components/TableWithTabs/FuturesControls';
import { AllMarketIcon } from '../components/Common/Icons';
import {
  DepositButtonMobile,
  WithdrawButtonMobile,
} from '../components/Common';
import { ONLY_ZEROS } from '../../../utils/numbers';
import { getCurrentWallet } from '../../../utils/wallets-integration';
import { useWalletSelector } from '../../../context/WalletSelectorContext';
import { NearTip } from '../../../pages/AccountPage';
import getConfig from '../../../services/config';
import { Images } from '../../../components/stableswap/CommonComp';
import {
  Checkbox,
  CheckboxSelected,
  ArrowGrey,
} from '../../../components/icon';
import Big from 'big.js';


// Portfolio Table TODOXX
export const usePortableOrderlyTable = ({
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
  chooseOrderStatus,
  chooseOrderType,
  setOperationType,
  setOperationId,
  tokenIn,
  setSettlePnlModalOpen,
  handleOpenClosing,
  openTrades,
  markPrices,
  lastPrices,
  portfolioUnsettle,
  totalPortfoliouPnl,
  totalDailyReal,
  totalNotional,
  newPositions,
  orderPageNum,
  orderTotalPage,
  setOrderPageNum,
}: {
  unrealMode: 'mark_price' | 'last_price';
  setUnrealMode: (input: 'mark_price' | 'last_price') => void;
  refOnly: boolean;
  setRefOnly: (item: boolean) => void;
  orderType: number;
  setOrderType: (item: number) => void;
  chooseMarketSymbol: string;
  setChooseMarketSymbol: (item: string) => void;
  chooseOrderSide: 'both_side' | 'BUY' | 'SELL';
  setChooseOrderSide: (item: 'both_side' | 'BUY' | 'SELL') => void;
  setOperationType: (item: 'deposit' | 'withdraw') => void;
  setOperationId: (item: string) => void;
  chooseOrderStatus: 'all' | 'Cancelled' | 'filled' | 'Rejected';
  chooseOrderType: 'all' | 'limit' | 'market';
  tokenIn: TokenMetadata;
  setSettlePnlModalOpen: (item: boolean) => void;
  handleOpenClosing: (
    closingQuantity: number,
    closingPrice: number | 'Market',
    row: any
  ) => void;
  openTrades: (order: MyOrder) => void;
  markPrices: MarkPrice[];
  lastPrices: {
    symbol: string;
    close: number;
  }[];
  portfolioUnsettle: string;
  totalPortfoliouPnl: string;
  totalDailyReal: string;
  totalNotional: string;
  newPositions: any;
  orderPageNum: number;
  orderTotalPage: number;
  setOrderPageNum: (page: number) => void;
}) => {
  const intl = useIntl();
  const { accountId } = useWalletSelector();
  const { wallet } = getCurrentWallet();
  const [showMarketSelector, setShowMarketSelector] = useState<boolean>(false);
  const [showSideSelector, setShowSideSelector] = useState<boolean>(false);
  const { marketList, allTokens } = useMarketlist();
  const { curLeverage } = useLeverage();

  const OpenbookBtn = ({ usable }: { usable: boolean }) => (
    <div className="flex items-center">
      <span className="flex items-center mr-2">
        <label
          className={`mr-1 ${
            usable ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'
          }`}
          onClick={() => usable && setRefOnly(!refOnly)}
        >
          {refOnly ? <CheckboxSelected /> : <Checkbox />}
        </label>
        {intl.formatMessage({
          id: 'ref_order_only',
          defaultMessage: 'Order on REF only',
        })}
      </span>
    </div>
  );

  const SpotTransactionBtn = ({ usable }: { usable: boolean }) => (
    <>
      <div className="flex items-center">
        <button
          disabled={!usable}
          className="text-white py-1 px-2 mr-2 relative bg-buyGradientGreen rounded-lg text-white font-bold flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={() => {
            setOperationType('deposit');
            setOperationId(tokenIn?.id || '');
          }}
        >
          {intl.formatMessage({
            id: 'deposit',
            defaultMessage: 'Deposit',
          })}
        </button>
        <button
          disabled={!usable}
          className="text-white py-1 px-2 relative bg-withdrawPurple2 rounded-lg text-white font-bold flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={() => {
            setOperationType('withdraw');
            setOperationId(tokenIn?.id || '');
          }}
        >
          {intl.formatMessage({
            id: 'withdraw',
            defaultMessage: 'Withdraw',
          })}
        </button>
      </div>
    </>
  );

  const SettlePnlBtn = ({ usable }: { usable: boolean }) => (
    <button
      disabled={!usable || ONLY_ZEROS.test(portfolioUnsettle)}
      className="text-white py-1 px-2 relative bg-buyGradientGreen rounded-lg text-white font-bold flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
      onClick={() => setSettlePnlModalOpen(true)}
    >
      <span>
        {intl.formatMessage({
          id: 'settle_pnl',
          defaultMessage: 'Settle PnL',
        })}
      </span>
    </button>
  );

  const ordersTable: PortfolioTable = {
    title: intl.formatMessage({
      id: 'orders',
      defaultMessage: 'Orders',
    }),
    tabs: [
      // getOrders
      {
        id: 'open_orders',
        default: 'Open Orders',
        rightComp: (usable: boolean) => <OpenbookBtn usable={usable} />,
        tableRowType: 'card',
        tableRowEmpty: 'no_orders_found',
        mobileRender: (order) => {
          const {
            symbol,
            side,
            created_time,
            price,
            average_executed_price,
            quantity,
            executed,
            broker_name,
          } = order;

          return (
            <div
              className={`m-2 p-3 gap-2 rounded-xl`}
              style={{ backgroundColor: '#7E8A931A' }}
              onClick={() => openTrades && openTrades(order)}
            >
              <div className="w-8/12 inline-block">
                <div className={`p-0.5 my-0.5 flex items-center`}>
                  <div
                    className={`px-2 pt-0.5 text-sm mr-2 inline-flex items-center justify-center rounded-md gotham_bold text-dark5 ${
                      side === 'BUY' ? 'bg-greenLight' : 'bg-redLight'
                    }`}
                  >
                    {intl.formatMessage({
                      id: side?.toLowerCase(),
                      defaultMessage: side,
                    })}
                  </div>
                  <div className="flex items-center ">
                    {marketList.find((m) => m.textId === symbol)?.withSymbol}
                  </div>
                </div>
              </div>
              <div className="w-4/12 inline-block text-right">
                <div
                  className={`p-0.5 text-xs my-1 flex justify-end items-center`}
                >
                  <span className="mr-1">
                    {parseFloat(
                      new Big(
                        (executed / (quantity || executed)) * 100
                      ).toFixed(2)
                    )}
                    % filled
                  </span>

                  <div className="flex justify-end items-center relative">
                    <div
                      className="flex items-center relative ml-1.5 justify-center border border-dashed rounded-full border-portfolioGreenColor"
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
                        <CircularProgressbar
                          styles={buildStyles({
                            pathColor: side === 'BUY' ? '#62C340' : '#FF6A8E',
                            strokeLinecap: 'butt',
                            trailColor: 'transparent',
                          })}
                          background={false}
                          strokeWidth={50}
                          value={executed || 0}
                          maxValue={quantity}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-8/12 inline-block">
                <div className={`p-0.5 text-xs my-1 text-white`}>
                  <span>
                    {quantity || executed}
                    <span
                      className="text-10px p-1 text-gray2 mx-1"
                      style={{
                        borderRadius: '4px',
                        backgroundColor: 'rgba(126, 138, 147, 0.15)',
                      }}
                    >
                      {parseSymbol(symbol).symbolFrom}
                    </span>
                    * {price?.toFixed(2) || average_executed_price?.toFixed(2)}
                    <span
                      className="text-10px p-1 text-gray2 mx-1"
                      style={{
                        borderRadius: '4px',
                        backgroundColor: 'rgba(126, 138, 147, 0.15)',
                      }}
                    >
                      USDC.e
                    </span>
                  </span>
                </div>
              </div>
              <div className="w-4/12 inline-block text-right">
                <span>
                  Total&nbsp;
                  <span className="text-white gotham_bold">
                    {(quantity * (price || average_executed_price)).toFixed(1)}
                  </span>
                </span>
              </div>
              <div className="w-8/12 inline-block">
                <div className={`p-0.5 text-xs my-1`}>
                  <span>{formatTimeDate(created_time)}</span>
                </div>
              </div>
              <div className="w-4/12 inline-block text-right">
                <div
                  className={`p-0.5 text-xs my-1 flex justify-end items-center`}
                >
                  {broker_name ? `from ${broker_name.replace('DEX', '')}` : ''}
                </div>
              </div>
            </div>
          );
        },
        tableTopComponent: (
          <OrdersFilters
            orderType={orderType}
            setOrderType={setOrderType}
            chooseMarketSymbol={chooseMarketSymbol}
            setChooseMarketSymbol={setChooseMarketSymbol}
            chooseOrderSide={chooseOrderSide}
            setChooseOrderSide={setChooseOrderSide}
            showMarketSelector={showMarketSelector}
            setShowMarketSelector={setShowMarketSelector}
            showSideSelector={showSideSelector}
            setShowSideSelector={setShowSideSelector}
            marketList={marketList}
            orderPageNum={orderPageNum}
            setOrderPageNum={setOrderPageNum}
            orderTotalPage={orderTotalPage}
          />
        ),
        filter: true,
        getData: () => {
          return getPortfolioAllOrders({
            accountId,
            OrderProps: {
              page: orderPageNum || 1,
              size: 10,
              // @ts-ignore
              status:
                chooseOrderStatus === 'all'
                  ? 'INCOMPLETE'
                  : chooseOrderStatus.toUpperCase(),
              broker_id: refOnly ? 'ref_dex' : '',
              symbol:
                chooseMarketSymbol === 'all_markets' ? '' : chooseMarketSymbol,
              // @ts-ignore
              side:
                chooseOrderSide === 'both_side'
                  ? ''
                  : chooseOrderSide.toUpperCase(),
              order_type:
                chooseOrderType === 'all' ? '' : chooseOrderType.toUpperCase(),
            },
          });
        },
        defaultSort: 'created_time',
        pagination: false,
        columns: [
          {
            key: 'instrument',
            colSpan: 4,
            header: 'Instrument',
            render: ({ symbol }) => (
              <div className="flex items-center ">
                {marketList.find((m) => m.textId === symbol)?.withSymbol}
              </div>
            ),
          },
          {
            key: 'type',
            colSpan: 2,
            header: 'Type',
            render: ({ type }) => (
              <span className="capitalize">
                {intl.formatMessage({
                  id: type.toLocaleLowerCase(),
                  defaultMessage: type.toLocaleLowerCase(),
                })}
              </span>
            ),
          },
          {
            key: 'Side',
            header: 'Side',
            colSpan: 2,
            render: ({ side }) => (
              <TextWrapper
                className="px-2 text-sm"
                value={intl.formatMessage({
                  id: side?.toLowerCase(),
                  defaultMessage: side,
                })}
                bg={side === 'BUY' ? 'bg-buyGreen' : 'bg-sellRed'}
                textC={side === 'BUY' ? 'text-buyGreen' : 'text-sellColorNew'}
              />
            ),
          },
          {
            key: 'fill_qty',
            header: 'Fill / Qty',
            colSpan: 3,
            render: ({ executed, quantity, side }) => (
              <div>
                <span
                  className={`text-sm ${
                    side === 'BUY' ? 'text-buyGreen' : 'text-sellColorNew'
                  }`}
                >{`${executed} / ${quantity || executed}`}</span>
                <ProgressBar
                  value={executed}
                  total={quantity}
                  color={side === 'BUY' ? '#00D6AF' : '#E14B8A'}
                />
              </div>
            ),
          },
          {
            key: '@price',
            colSpan: 2,
            header: '@Price',
            render: ({ price, symbol }) =>
              price?.toFixed(
                symbol.includes('BTC') || symbol.includes('ETH') ? 2 : 4
              ) || '-',
          },
          {
            key: 'avg_price',
            colSpan: 2,
            header: 'Avg.Price',
            render: ({ average_executed_price, symbol }) =>
              average_executed_price?.toFixed(
                symbol.includes('BTC') || symbol.includes('ETH') ? 2 : 4
              ) || '-',
          },
          {
            key: 'est_total',
            colSpan: 2,
            header: 'Est.Total',
            render: ({ price, average_executed_price, quantity, symbol }) =>
              ((price || average_executed_price) * quantity)?.toFixed(
                symbol.includes('BTC') || symbol.includes('ETH') ? 2 : 4
              ),
          },
          {
            key: 'create',
            header: 'Create',
            type: 'dateTime',
            colSpan: 3,
            textColor: '',
            extras: ['sort'],
            sortKey: 'created_time',
            render: ({ created_time }) => formatTimeDate(created_time),
          },
          {
            key: 'dex',
            header: 'Dex',
            render: ({ broker_name }) => (
              <span className="relative right-2">
                {broker_name.replace('DEX', '')}
              </span>
            ),
          },
        ],
      },
      {
        id: 'history',
        default: 'History',
        rightComp: (usable: boolean) => <OpenbookBtn usable={usable} />,
        tableRowType: 'card',
        tableRowEmpty: 'no_orders_found',
        mobileRender: (order) => {
          const {
            symbol,
            side,
            created_time,
            price,
            average_executed_price,
            quantity,
            executed,
            broker_name,
            status,
          } = order;

          return (
            <div
              className={`m-2 p-3 gap-2 rounded-xl`}
              style={{ backgroundColor: '#7E8A931A' }}
              onClick={() => openTrades && openTrades(order)}
            >
              <div className="w-8/12 inline-block">
                <div className={`p-0.5 my-0.5 flex items-center`}>
                  <div
                    className={`px-2 pt-0.5 text-sm mr-2 inline-flex items-center justify-center rounded-md gotham_bold text-dark5 ${
                      side === 'BUY' ? 'bg-greenLight' : 'bg-redLight'
                    }`}
                  >
                    {intl.formatMessage({
                      id: side?.toLowerCase(),
                      defaultMessage: side,
                    })}
                  </div>
                  <div className="flex items-center ">
                    {marketList.find((m) => m.textId === symbol)?.withSymbol}
                  </div>
                </div>
              </div>
              <div className="w-4/12 inline-block text-right">
                <div
                  className={`p-0.5 text-xs my-1 flex justify-end items-center`}
                >
                  <span className="mr-1">
                    {parseFloat(
                      new Big(
                        (executed / (quantity || executed)) * 100
                      ).toFixed(2)
                    )}
                    % filled
                  </span>

                  <div className="flex justify-end items-center relative">
                    <div
                      className={`flex items-center relative ml-1.5 justify-center items-center 
                      border border-dashed rounded-full 
                      ${
                        side === 'BUY'
                          ? ' border-portfolioGreenColor'
                          : 'border-sellRed'
                      }`}
                      style={{
                        height: '14px',
                        width: '14px',
                      }}
                    >
                      <div
                        className=""
                        style={{
                          height: '8px',
                          width: '8px',
                          position: 'absolute',
                          right: '2px',
                          top: '2px',
                        }}
                      >
                        <CircularProgressbar
                          styles={buildStyles({
                            pathColor: side === 'BUY' ? '#62C340' : '#FF6A8E',
                            strokeLinecap: 'butt',
                            trailColor: 'transparent',
                          })}
                          background={false}
                          strokeWidth={50}
                          value={
                            !quantity && status === 'CANCELLED'
                              ? 0
                              : executed || 0
                          }
                          maxValue={quantity || executed}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-8/12 inline-block">
                <div className={`p-0.5 text-xs my-1 text-white`}>
                  <span>
                    {quantity || executed}
                    <span
                      className="text-10px p-1 text-gray2 mx-1"
                      style={{
                        borderRadius: '4px',
                        backgroundColor: 'rgba(126, 138, 147, 0.15)',
                      }}
                    >
                      {parseSymbol(symbol).symbolFrom}
                    </span>
                    * {price?.toFixed(2) || average_executed_price?.toFixed(2)}
                    <span
                      className="text-10px p-1 text-gray2 mx-1"
                      style={{
                        borderRadius: '4px',
                        backgroundColor: 'rgba(126, 138, 147, 0.15)',
                      }}
                    >
                      USDC.e
                    </span>
                  </span>
                </div>
              </div>
              <div className="w-4/12 inline-block text-right">
                <span>
                  Total&nbsp;
                  <span className="text-white gotham_bold">
                    {(quantity * (price || average_executed_price)).toFixed(1)}
                  </span>
                </span>
              </div>
              <div className="w-8/12 inline-block">
                <div className={`p-0.5 text-xs my-1`}>
                  <span>{formatTimeDate(created_time)}</span>
                </div>
              </div>
              <div className="w-4/12 inline-block text-right">
                <div
                  className={`p-0.5 text-xs my-1 flex justify-end items-center`}
                >
                  {broker_name ? `from ${broker_name.replace('DEX', '')}` : ''}
                </div>
              </div>
            </div>
          );
        },
        tableTopComponent: (
          <OrdersFilters
            orderType={orderType}
            setOrderType={setOrderType}
            chooseMarketSymbol={chooseMarketSymbol}
            setChooseMarketSymbol={setChooseMarketSymbol}
            chooseOrderSide={chooseOrderSide}
            setChooseOrderSide={setChooseOrderSide}
            showMarketSelector={showMarketSelector}
            setShowMarketSelector={setShowMarketSelector}
            showSideSelector={showSideSelector}
            setShowSideSelector={setShowSideSelector}
            marketList={marketList}
            orderPageNum={orderPageNum}
            setOrderPageNum={setOrderPageNum}
            orderTotalPage={orderTotalPage}
          />
        ),
        filter: true,
        getData: () => {
          return getPortfolioAllOrders({
            accountId,
            OrderProps: {
              page: orderPageNum || 1,
              size: 10,
              // @ts-ignore
              status:
                chooseOrderStatus === 'all'
                  ? 'COMPLETED'
                  : chooseOrderStatus.toUpperCase(),
              broker_id: refOnly ? 'ref_dex' : '',
              symbol:
                chooseMarketSymbol === 'all_markets' ? '' : chooseMarketSymbol,
              // @ts-ignore
              side:
                chooseOrderSide === 'both_side'
                  ? ''
                  : chooseOrderSide.toUpperCase(),
              order_type:
                chooseOrderType === 'all' ? '' : chooseOrderType.toUpperCase(),
            },
          });
        },
        defaultSort: 'created_time',
        pagination: false,
        columns: [
          {
            key: 'instrument',
            colSpan: 4,
            header: 'Instrument',
            render: ({ symbol }) => (
              <div className="flex items-center ">
                {marketList.find((m) => m.textId === symbol)?.withSymbol}
              </div>
            ),
          },
          {
            key: 'Side',
            header: 'Side',
            colSpan: 2,
            render: ({ side }) => (
              <TextWrapper
                className="px-2 text-sm"
                value={intl.formatMessage({
                  id: side?.toLowerCase(),
                  defaultMessage: side,
                })}
                bg={side === 'BUY' ? 'bg-buyGreen' : 'bg-sellRed'}
                textC={side === 'BUY' ? 'text-buyGreen' : 'text-sellColorNew'}
              />
            ),
          },
          {
            key: 'type',
            colSpan: 3,
            header: 'Type',
            render: ({ type }) => (
              <span className="capitalize">
                {intl.formatMessage({
                  id: type.toLocaleLowerCase(),
                  defaultMessage: type.toLocaleLowerCase(),
                })}
              </span>
            ),
          },
          {
            key: 'fill_qty',
            header: 'Fill / Qty',
            colSpan: 4,
            render: ({ executed, quantity, side, status }) => (
              <div>
                <span
                  className={`text-sm ${
                    side === 'BUY' ? 'text-buyGreen' : 'text-sellColorNew'
                  }`}
                >{`${executed} / ${quantity || executed}`}</span>
                <ProgressBar
                  value={!quantity && status === 'CANCELLED' ? 0 : executed}
                  total={quantity || executed}
                  color={side === 'BUY' ? '#00D6AF' : '#E14B8A'}
                />
              </div>
            ),
          },
          {
            key: '@price',
            colSpan: 3,
            header: '@Price',
            render: ({ price, average_executed_price, symbol }) =>
              (price || average_executed_price)?.toPrecision(
                (price || average_executed_price).toString().split('.')[0]
                  .length +
                  (symbol.includes('ETH') || symbol.includes('BTC') ? 2 : 4)
              ) || '-',
          },
          {
            key: 'avg_price',
            colSpan: 3,
            header: 'Avg.Price',
            render: ({ average_executed_price, symbol }) =>
              average_executed_price?.toPrecision(
                average_executed_price.toString().split('.')[0].length +
                  (symbol.includes('ETH') || symbol.includes('BTC') ? 2 : 4)
              ) || '-',
          },
          {
            key: 'est_total',
            colSpan: 3,
            header: 'Est.Total',
            render: ({ price, average_executed_price, quantity, executed }) =>
              Math.floor(
                (price || average_executed_price) * (quantity || executed)
              )?.toFixed(0),
          },
          {
            key: 'status',
            colSpan: 4,
            header: 'Status',
            render: ({ status }) => (
              <span className="capitalize">{status.toLocaleLowerCase()}</span>
            ),
          },
          {
            key: 'create',
            header: 'Created',
            type: 'dateTime',
            colSpan: 4,
            textColor: '',
            extras: ['sort'],
            sortKey: 'created_time',
            render: ({ created_time }) => formatTimeDate(created_time),
          },
          {
            key: 'dex',
            colSpan: 2,
            header: 'Dex',
            render: ({ broker_name }) => (
              <span className="relative ">
                {broker_name.replace('DEX', '')}
              </span>
            ),
          },
        ],
      },
    ],
  };

  const assetsTables: PortfolioTable = {
    title: intl.formatMessage({
      id: 'assets',
      defaultMessage: 'Assets',
    }),
    tabs: [
      {
        id: 'spot',
        default: 'Spot',
        pagination: false,
        getData: async () => false,
        rightComp: (usable: boolean) => <SpotTransactionBtn usable={usable} />,
        mobileRenderCustom: true,
        mobileRender: (rows) => (
          <>
            <table className="table-fixed w-full">
              <thead
                className={`w-full table table-fixed py-2 border-white border-opacity-10`}
              >
                <tr
                  className={`w-full  table-fixed grid grid-cols-6 gap-4 px-3`}
                >
                  {['assets', 'wallet', 'available_orderly'].map((key, i) => (
                    <th
                      className={`col-span-2 pb-2${
                        i === 2 ? ' text-right' : ' text-left'
                      }${i === 1 ? ' pl-5' : ''}`}
                    >
                      {intl.formatMessage({
                        id: key,
                        defaultMessage: key,
                      })}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className=" block overflow-auto flex-col px-3">
                {rows.map(({ tokenMeta, near, available }: any) => (
                  <tr className="table-fixed grid grid-cols-6 gap-4 lg:border-t border-white border-opacity-10 text-white">
                    <td className="col-span-2 flex py-2 relative">
                      <div className="flex items-center">
                        <img
                          src={tokenMeta.icon}
                          className="rounded-full flex-shrink-0 mr-2 w-7 h-7 border border-green-400"
                          alt=""
                        />
                        <div className="flex flex-col">
                          <div className="text-white flex items-center font-bold">
                            {tokenMeta.symbol}
                            {tokenMeta?.id?.toLowerCase() === 'near' && (
                              <NearTip />
                            )}
                          </div>

                          <div className="text-primaryOrderly xs:hidden text-xs">
                            {getAccountName(tokenMeta.id)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="col-span-2 pl-5 py-2 flex items-center">
                      {digitWrapperAsset(near, 3)}
                    </td>
                    <td className="col-span-2 text-right py-2 flex items-center justify-end">
                      {digitWrapperAsset(available, 3)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between align-center px-3 mt-5">
              <DepositButtonMobile
                onClick={() => {
                  setOperationType('deposit');
                  setOperationId(tokenIn?.id || '');
                }}
              />
              <WithdrawButtonMobile
                onClick={() => {
                  setOperationType('withdraw');
                  setOperationId(tokenIn?.id || '');
                }}
              />
            </div>
          </>
        ),
        defaultSort: 'available',
        columns: [
          {
            key: 'token',
            header: 'Token',
            colSpan: 2,
            render: ({ tokenMeta }) => (
              <div className="flex items-center ">
                <img
                  src={tokenMeta.icon}
                  className="rounded-full flex-shrink-0 mr-2 w-7 h-7 border border-green-400"
                  alt=""
                />
                <div className="flex flex-col  ">
                  <div className="text-white flex items-center font-bold">
                    {tokenMeta.symbol}
                    {tokenMeta?.id?.toLowerCase() === 'near' && <NearTip />}
                  </div>

                  <div className="text-primaryOrderly xs:hidden text-xs">
                    {getAccountName(tokenMeta.id)}
                  </div>
                </div>
              </div>
            ),
          },
          {
            key: 'near',
            header: 'Near',
            icon: (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6 0C2.68629 0 0 2.68629 0 6V10C0 13.3137 2.68629 16 6 16H10C13.3137 16 16 13.3137 16 10V6C16 2.68629 13.3137 0 10 0H6ZM5.25169 10.1382V5.40912L10.9917 11.2454C11.7358 12.0019 13.1774 11.5514 13.1774 10.5624V4.85282C13.1774 3.85671 11.7184 3.4103 10.9811 4.18081L9.21454 6.84695L9.46222 7.05901L11.6913 5.44625V9.9813L5.95127 4.14508C5.20724 3.38857 3.76562 3.83906 3.76562 4.82807V10.667C3.76562 11.6232 5.12751 12.0909 5.8992 11.3996L7.97615 8.54347L7.72847 8.33141L5.25169 10.1382Z"
                  fill="#7E8A93"
                />
              </svg>
            ),
            sortKey: 'near',
            extras: ['sort'],
            colSpan: 2,
            render: ({ near }) => digitWrapperAsset(near, 3),
          },
          {
            key: 'in_open_orders',
            header: 'In Open Order',
            icon: <OrderlyIcon />,
            extras: ['sort'],
            sortKey: 'in-order',
            render: (row) => digitWrapperAsset(row['in-order'], 3),
          },
          {
            key: 'available',
            header: 'Available',
            icon: <OrderlyIcon />,
            extras: ['sort'],
            sortKey: 'available',
            render: ({ available }) => digitWrapperAsset(available, 3),
          },
        ],
      },
      {
        id: 'futures',
        default: 'Futures',
        rightComp: (usable: boolean) => <SettlePnlBtn usable={usable} />,
        pagination: false,
        getData: () => getPortfolioPosition({ accountId }),
        tableTopComponent: (
          <FutureTopComponent
            totalPortfoliouPnl={totalPortfoliouPnl}
            totalDailyReal={totalDailyReal}
            totalNotional={totalNotional}
            portfolioUnsettle={portfolioUnsettle}
          />
        ),
        mobileRenderCustom: true,
        tableRowType: 'small',
        mobileRender: (rows, futureOrders) => (
          <FutureMobileView
            rows={rows}
            marketList={marketList}
            handleOpenClosing={handleOpenClosing}
            unrealMode={unrealMode}
            setUnrealMode={setUnrealMode}
            futureOrders={futureOrders}
            markPrices={markPrices}
            lastPrices={lastPrices}
            totalPortfoliouPnl={totalPortfoliouPnl}
            totalDailyReal={totalDailyReal}
            totalNotional={totalNotional}
            portfolioUnsettle={portfolioUnsettle}
            newPositions={newPositions}
          >
            <SettlePnlBtn usable={true} />
          </FutureMobileView>
        ),
        defaultSort: ['symbol', 'average_open_price', 'position_qty'],
        columns: [
          {
            key: 'instrument',
            header: 'Instrument',
            colSpan: 3,
            render: ({ symbol }) => (
              <div className="flex items-center ">
                {marketList.find((m) => m.textId === symbol)?.text}
              </div>
            ),
          },
          {
            key: 'qty.',
            header: 'Qty.',
            extras: ['sort'],
            colSpan: 3,
            sortKey: 'position_qty',
            render: ({ position_qty }) => (
              <div
                className={`pr-2 ${
                  position_qty >= 0 ? 'text-buyGreen' : 'text-sellColorNew'
                }`}
              >
                {position_qty || '-'}
              </div>
            ),
          },
          {
            key: 'avg_open',
            colSpan: 3,
            header: 'Avg. Open',
            extras: ['sort'],
            sortKey: 'average_open_price',
            render: ({ average_open_price }) =>
              average_open_price?.toFixed(3) || '-',
          },
          {
            key: 'mark_orderly',
            header: 'Mark',
            colSpan: 4,
            extras: ['sort'],
            sortKey: 'mark_price',
            render: ({ symbol }) => (
              <div className={`pr-2 text-white`}>
                {markPrices
                  ?.find((i) => i.symbol === symbol)
                  ?.price.toFixed(3) || '-'}
              </div>
            ),
          },
          {
            key: 'liq_price',
            header: 'Liq. Price',
            extras: ['sort'],
            colSpan: 3,
            sortKey: 'display_est_liq_price',
            render: ({ display_est_liq_price, symbol }) => {
              // get mark price for this symbol
              const markPrice = markPrices?.find(
                (i) => i.symbol === symbol
              )?.price;

              return (
                <div className={`pr-2 text-warn`}>
                  {markPrice && display_est_liq_price > markPrice * 10 && symbol
                    ? '-'
                    : display_est_liq_price
                    ? display_est_liq_price.toFixed(3)
                    : '-'}
                </div>
              );
            },
          },
          {
            key: 'unreal_pnl',
            header: 'Unreal. PnL',
            headerType: 'dashed',
            extras: ['radio', 'sort'],
            colSpan: 3,
            select: unrealMode,
            setSelect: setUnrealMode,
            sortKey: ['symbol', 'average_open_price', 'position_qty'],
            list: [
              {
                text: intl.formatMessage({ id: 'mark_price' }),
                textId: 'mark_price',
              },
              {
                text: intl.formatMessage({ id: 'last_price' }),
                textId: 'last_price',
              },
            ],
            render: ({ symbol, average_open_price, position_qty }) => {
              const price =
                unrealMode === 'mark_price'
                  ? markPrices?.find((i) => i.symbol === symbol)?.price
                  : lastPrices.find((i) => i.symbol === symbol)?.close;
              const unreal =
                position_qty >= 0
                  ? (price - average_open_price) * position_qty
                  : (average_open_price - price) * position_qty * -1;
              const percentage =
                position_qty >= 0
                  ? ((average_open_price - price) /
                      (average_open_price / curLeverage)) *
                    -100
                  : ((average_open_price - price) /
                      (average_open_price / curLeverage)) *
                    100;
              const percentageParse = percentage.toPrecision(
                percentage.toString().split('.')[0].length + 2
              );
              const percentageTrue = percentageParse.substring(
                0,
                percentageParse.length -
                  (percentageParse.charAt(0) === '-' ? 2 : 1)
              );

              return (
                <div
                  className={`pr-2 ${
                    unreal >= 0 ? 'text-buyGreen' : 'text-sellColorNew'
                  }`}
                >
                  {unreal?.toFixed(2) || '-'} <br />({percentageTrue}%)
                </div>
              );
            },
          },
          {
            key: 'daily_real',
            header: 'Daily Real',
            extras: ['sort'],
            sortKey: 'pnl_24_h',
            colSpan: 3,
            render: ({ pnl_24_h }) => (
              <div className={`pr-2 text-white`}>
                {pnl_24_h?.toFixed(3) || '-' || '-'}
              </div>
            ),
          },
          {
            key: 'notional',
            header: 'Notional',
            colSpan: 3,
            extras: ['sort'],
            sortKey: ['position_qty', 'average_open_price'],
            render: ({ symbol, position_qty }) => {
              return (
                Math.abs(
                  markPrices?.find((i) => i.symbol === symbol)?.price *
                    position_qty
                )?.toFixed(2) || '-'
              );
            },
          },
          {
            key: 'qty.',
            header: 'Qty.',
            colSpan: 9,
            customRender: true,
            headerRender: () => <FutureTableFormHeaders />,
          },
        ],
      },
    ],
  };

  const recordsTable: PortfolioTable = {
    title: intl.formatMessage({
      id: 'records',
      defaultMessage: 'Records',
    }),
    tabs: [
      {
        id: 'deposit',
        default: 'Deposit',
        getData: ({ page }: { page: number }) =>
          getPortfolioAssetHistory({ accountId, page, side: 'DEPOSIT' }),
        tableRowEmpty: 'no_records_found',
        mobileRender: ({ token, created_time, tx_id, amount, user_id }) => (
          <div
            className={`m-2 p-3 gap-2 rounded-xl`}
            style={{ backgroundColor: '#7E8A931A' }}
          >
            <div className="w-full inline-block text-white">
              <div className="flex items-center p-0.5 pl-0 pr-4 text-white text-sm my-0.5">
                <img
                  src={allTokens[token]?.icon}
                  alt=""
                  className="rounded-full flex-shrink-0 w-5 h-5 mr-0.5 md:mr-2.5 lg:mr-2.5"
                />

                <span className="xs:text-white  xs:font-bold">
                  {allTokens[token]?.symbol}
                </span>
              </div>
            </div>
            <div className="w-1/2 inline-block">
              <div className={`p-0.5 my-0.5`}>
                {intl.formatMessage({
                  id: 'address',
                  defaultMessage: 'Address',
                })}
                &nbsp;
                <span className="text-white">
                  {getAccountName(wallet.getAccountId())}
                </span>
              </div>
              <div className={`p-0.5 text-sm my-0.5`}>
                <span>{formatTimeDate(created_time)}</span>
              </div>
            </div>
            <div className="w-1/2 inline-block text-right">
              <div className={`p-0.5 my-0.5`}>
                {intl.formatMessage({
                  id: 'txid',
                  defaultMessage: 'TxID',
                })}
                &nbsp;
                <span className="text-txBlue">
                  <a
                    href={`${
                      getConfig().nearExplorerUrl
                    }/transactions/${tx_id}`}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                  >
                    {shortenAddress(tx_id)}
                  </a>
                  <CopyToClipboard tx_id={tx_id} />
                </span>
              </div>
              <div className={`p-0.5 text-sm my-0.5 text-white`}>
                Total <span className="text-white">{amount}</span>
              </div>
            </div>
          </div>
        ),
        columns: [
          {
            key: 'token',
            header: 'Token',
            render: ({ token }) => (
              <div className="flex items-center p-0.5 pl-0 pr-4 text-white text-sm my-0.5">
                <img
                  src={allTokens[token]?.icon}
                  alt=""
                  className="rounded-full flex-shrink-0 w-5 h-5 mr-0.5 md:mr-2.5 lg:mr-2.5"
                />

                <span className="xs:text-white  xs:font-bold">
                  {allTokens[token]?.symbol}
                </span>
              </div>
            ),
          },
          {
            key: 'amount',
            textColor: '',
            header: 'Amount',
            render: ({ amount }) => amount,
          },
          {
            key: 'source_address',
            header: 'Source Address',
            render: () => getAccountName(wallet.getAccountId()),
          },
          {
            key: 'txid',
            header: 'TxID',
            colSpan: 2,
            type: 'link',
            render: ({ tx_id }) => (
              <>
                <a
                  href={`${getConfig().nearExplorerUrl}/transactions/${tx_id}`}
                  className="text-txBlue"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                >
                  {shortenAddress(tx_id, 8)}
                </a>
                <CopyToClipboard tx_id={tx_id} />
              </>
            ),
          },
          {
            key: 'time',
            header: 'Time',
            type: 'dateTime',
            colSpan: 2,
            textColor: '',
            render: ({ created_time }) => formatTimeDate(created_time),
          },
        ],
      },
      {
        id: 'withdraw',
        default: 'Withdraw',
        getData: ({ page }: { page: number }) =>
          getPortfolioAssetHistory({ accountId, page, side: 'WITHDRAW' }),
        tableRowEmpty: 'no_records_found',
        mobileRender: ({ token, created_time, tx_id, amount, user_id }) => (
          <div
            className={`m-2 p-3 gap-2 rounded-xl`}
            style={{ backgroundColor: '#7E8A931A' }}
          >
            <div className="w-full inline-block text-white">
              <div className="flex items-center p-0.5 pl-0 pr-4 text-white text-sm my-0.5">
                <img
                  src={allTokens[token]?.icon}
                  alt=""
                  className="rounded-full flex-shrink-0 w-5 h-5 mr-0.5 md:mr-2.5 lg:mr-2.5"
                />

                <span className="xs:text-white  xs:font-bold">
                  {allTokens[token]?.symbol}
                </span>
              </div>
            </div>
            <div className="w-1/2 inline-block">
              <div className={`p-0.5 my-0.5`}>
                {intl.formatMessage({
                  id: 'address',
                  defaultMessage: 'Address',
                })}
                &nbsp;
                <span className="text-white">
                  {getAccountName(wallet.getAccountId())}
                </span>
              </div>
              <div className={`p-0.5 text-sm my-0.5`}>
                <span>{formatTimeDate(created_time)}</span>
              </div>
            </div>
            <div className="w-1/2 inline-block text-right">
              <div className={`p-0.5 my-0.5`}>
                {intl.formatMessage({
                  id: 'txid',
                  defaultMessage: 'TxID',
                })}
                &nbsp;
                <span className="text-txBlue">
                  <a
                    href={`${
                      getConfig().nearExplorerUrl
                    }/transactions/${tx_id}`}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                  >
                    {shortenAddress(tx_id)}
                  </a>
                  <CopyToClipboard tx_id={tx_id} />
                </span>
              </div>
              <div className={`p-0.5 text-sm my-0.5 text-white`}>
                Total <span className="text-white">{amount}</span>
              </div>
            </div>
          </div>
        ),
        columns: [
          {
            key: 'token',
            header: 'Token',
            render: ({ token }) => (
              <div className="flex items-center p-0.5 pl-0 pr-4 text-white text-sm my-0.5">
                <img
                  src={allTokens[token]?.icon}
                  alt=""
                  className="rounded-full flex-shrink-0 w-5 h-5 mr-0.5 md:mr-2.5 lg:mr-2.5"
                />

                <span className="xs:text-white  xs:font-bold">
                  {allTokens[token]?.symbol}
                </span>
              </div>
            ),
          },
          {
            key: 'amount',
            textColor: '',
            header: 'Amount',
            render: ({ amount }) => amount,
          },
          {
            key: 'source_address',
            header: 'Source Address',
            render: () => getAccountName(wallet.getAccountId()),
          },
          {
            key: 'txid',
            header: 'TxID',
            colSpan: 2,
            type: 'link',
            render: ({ tx_id }) => (
              <>
                <a
                  href={`${getConfig().nearExplorerUrl}/transactions/${tx_id}`}
                  className="text-txBlue"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                >
                  {shortenAddress(tx_id, 8)}
                </a>
                <CopyToClipboard tx_id={tx_id} />
              </>
            ),
          },
          {
            key: 'time',
            header: 'Time',
            type: 'dateTime',
            colSpan: 2,
            textColor: '',
            render: ({ created_time }) => formatTimeDate(created_time),
          },
        ],
      },
      {
        id: 'settlements',
        default: 'Settlements',
        getData: ({ page }: { page: number }) =>
          getPortfolioSettlements({ accountId, page }),
        tableRowEmpty: 'no_records_found',
        mobileRender: ({
          old_balance,
          new_balance,
          settled_time,
          settled_amount,
        }) => (
          <div
            className={`m-2 p-3 gap-2 rounded-xl`}
            style={{ backgroundColor: '#7E8A931A' }}
          >
            <div className="w-1/2 inline-block">
              <div className={`p-0.5 text-sm my-0.5`}>
                <span>
                  {intl.formatMessage({
                    id: 'settled_balance',
                    defaultMessage: 'Settled Balance',
                  })}
                </span>
              </div>
            </div>
            <div className="w-1/2 inline-block text-right">
              <div
                className={`p-0.5 text-sm my-0.5 flex items-center justify-end`}
              >
                <span className="text-white">
                  {typeof new_balance === 'number'
                    ? `${old_balance?.toFixed(4)}`
                    : '-'}
                </span>
                <div className="mx-1">
                  <ArrowGrey />
                </div>
                <span className="text-white">
                  {typeof new_balance === 'number'
                    ? `${new_balance?.toFixed(4)}`
                    : '-'}
                </span>
              </div>
            </div>
            <div className="w-1/2 inline-block">
              <div className={`p-0.5 text-sm my-0.5`}>
                <span>
                  {intl.formatMessage({
                    id: 'settled_amount',
                    defaultMessage: 'Settled Amount',
                  })}
                </span>
              </div>
            </div>
            <div className="w-1/2 inline-block text-right">
              <div className={`p-0.5 text-sm my-0.5`}>
                <span
                  className={`${
                    settled_amount === 0
                      ? 'text-white'
                      : settled_amount > 0
                      ? 'text-buyGreen'
                      : 'text-sellColorNew'
                  }`}
                >
                  {settled_amount >= 0 ? '+' : ''}
                  {settled_amount}
                </span>
                <span className="text-white">&nbsp;USDC.e</span>
              </div>
            </div>
            <div className="w-1/2 inline-block">
              <div className={`p-0.5 text-sm my-0.5`}>
                <span>
                  {intl.formatMessage({
                    id: 'time',
                    defaultMessage: 'Time',
                  })}
                </span>
              </div>
            </div>
            <div className="w-1/2 inline-block text-right">
              <div className={`p-0.5 text-sm my-0.5`}>
                <span>{formatTimeDate(settled_time)}</span>
              </div>
            </div>
          </div>
        ),
        columns: [
          {
            key: 'settled_balance',
            header: 'Settled Balance',
            suffix: (
              <div
                className="text-[10px] px-1.5 py-0.5 ml-1 rounded-md"
                style={{ backgroundColor: 'rgba(126, 138, 147, 0.15)' }}
              >
                USDC.e
              </div>
            ),
            colSpan: 2,
            render: ({ old_balance, new_balance }) => (
              <div className={`flex items-center`}>
                <span className={`${old_balance ? 'text-white' : ''}`}>
                  {typeof new_balance === 'number'
                    ? `${old_balance?.toFixed(4)}`
                    : '-'}
                </span>
                <div className="mx-1">
                  <ArrowGrey />
                </div>
                <span className={`${new_balance ? 'text-white' : ''}`}>
                  {typeof new_balance === 'number'
                    ? `${new_balance?.toFixed(4)}`
                    : '-'}
                </span>
              </div>
            ),
          },
          {
            key: 'settled_amount',
            header: 'Settled Amount',
            suffix: (
              <div
                className="text-[10px] px-1.5 py-0.5 ml-1 rounded-md"
                style={{ backgroundColor: 'rgba(126, 138, 147, 0.15)' }}
              >
                USDC.e
              </div>
            ),
            colSpan: 2,
            render: ({ settled_amount }) => (
              <span
                className={`${
                  settled_amount === 0
                    ? 'text-white'
                    : settled_amount > 0
                    ? 'text-buyGreen'
                    : 'text-sellColorNew'
                }`}
              >
                {settled_amount >= 0 ? '+' : ''}
                {settled_amount}
              </span>
            ),
          },
          {
            key: 'time',
            header: 'Time',
            type: 'dateTime',
            textColor: '',
            render: ({ settled_time }) => formatTimeDate(settled_time),
          },
        ],
      },
      // records - funding fee
      {
        id: 'funding_fee',
        default: 'Funding Fee',
        mobileKey: 'funding',
        getData: ({ page }: { page: number }) =>
          getFundingFee({ accountId, page }),
        tableRowEmpty: 'no_records_found',
        mobileRender: ({ symbol, funding_fee, created_time, status }) => (
          <div
            className={`m-2 p-3 gap-2 rounded-xl`}
            style={{ backgroundColor: '#7E8A931A' }}
          >
            <div className="w-1/2 inline-block">
              <div className="font-bold">
                {marketList.find((m) => m.textId === symbol)?.withSymbol}
              </div>
              <div className={`p-0.5 text-sm my-0.5`}>
                <span>{status}</span>
              </div>
            </div>
            <div className="w-1/2 inline-block text-right">
              <div className={`p-0.5 text-sm my-0.5 text-white`}>
                <span
                  className={
                    funding_fee < 0 ? 'text-buyGreen' : 'text-sellColorNew'
                  }
                >
                  {funding_fee < 0 ? '+' : ''}
                  {(funding_fee * -1).toFixed(4)}
                </span>
                &nbsp;USDC.e
              </div>
              <div className={`p-0.5 text-sm my-0.5`}>
                <span>{formatTimeDate(created_time)}</span>
              </div>
            </div>
          </div>
        ),
        columns: [
          {
            key: 'instrument',
            colSpan: 2,
            header: 'Instrument',
            render: ({ symbol }) => (
              <div className="flex items-center ">
                {marketList.find((m) => m.textId === symbol)?.withSymbol}
              </div>
            ),
          },
          {
            key: 'funding_annual_rate',
            header: 'Funding Rate / Annual Rate',
            colSpan: 3,
            render: ({ funding_rate }) => {
              const annual = (funding_rate * 3 * 365 * 100 * 100) / 100;
              const annualParse = annual.toPrecision(
                annual.toString().split('.')[0].length + 3
              );
              const annualTrue = annualParse.substring(
                0,
                annualParse.length - (annualParse.charAt(0) === '-' ? 2 : 1)
              );

              return `${(funding_rate * 100).toFixed(6)}%/${annualTrue}%`;
            },
          },
          { key: 'status', header: 'Status', render: ({ status }) => status },
          {
            key: 'type',
            header: 'Type',
            render: ({ payment_type }) => payment_type,
          },
          {
            key: 'funding_fee',
            header: 'Funding Fee',
            mobileHeaderKey: 'funding',
            colSpan: 2,
            render: ({ funding_fee }) => (
              <>
                <span
                  className={
                    funding_fee < 0 ? 'text-buyGreen' : 'text-sellColorNew'
                  }
                >
                  {funding_fee < 0 ? '+' : ''}
                  {funding_fee * -1}
                  <span className="text-white">&nbsp;USDC.e</span>
                </span>
              </>
            ),
          },
          {
            key: 'time',
            header: 'Created',
            type: 'dateTime',
            textColor: '',
            render: ({ created_time }) => formatTimeDate(created_time),
          },
        ],
      },
    ],
  };

  return {
    ordersTable,
    assetsTables,
    recordsTable,
  };
};