import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import _ from 'lodash';

import 'react-circular-progressbar/dist/styles.css';
import AssetAndFutureTable from './AssetAndFutureTable';
import { FlexRow, FlexRowBetween, DepositButtonMobile, WithdrawButtonMobile } from '../Common';
import { FutureMobileView, FutureTopComponent, FutureTableFormHeaders } from '../TableWithTabs/FuturesControls';
import { OrderAsset } from '../AssetModal/state';
import { usePerpData } from '../UserBoardPerp/state';
import { parseSymbol } from '../RecentTrade';
import { useTokenMetaFromSymbol } from '../ChartHeader/state';
import { useMarketlist } from '../../orderly/constantWjsx';

import { PortfolioTable } from '../../orderly/type';
import { useOrderlyContext } from '../../orderly/OrderlyContext';
import { getPortfolioPosition } from '../../orderly/off-chain-api';
import { getAccountName } from '../../orderly/utils';
import { digitWrapperAsset } from '../../utiles';
import { useClientMobile } from '../../../../utils/device';
import { NearTip } from '../../../../pages/AccountPage';
import { useWalletSelector } from '../../../../context/WalletSelectorContext';

export function SymbolWrapper({ symbol }: { symbol: string }) {
  return (
    <span className="text-v3SwapGray bg-menuMoreBgColor rounded px-2 text-10px">
      {symbol}
    </span>
  );
}

function AssetsAndFuture({
  maintenance,
  displayBalances,
  newPositions,
  handleOpenClosing,
  validAccountSig,
  setOperationType,
  setOperationId,
  setSettlePnlModalOpen
} : {
  maintenance: boolean;
  newPositions?: any;
  displayBalances: OrderAsset[];
  setOperationType: (item: 'deposit' | 'withdraw') => void;
  setOperationId: (item: string) => void;
  setSettlePnlModalOpen: (item: boolean) => void;
  handleOpenClosing: (closingQuantity: number, closingPrice: number | 'Market', row: any) => void;
  validAccountSig: boolean;
}) {
  const intl = useIntl();
  const { marketList } = useMarketlist();
  const { accountId } = useWalletSelector();
  const {
    tokenInfo,
    symbol,
  } = useOrderlyContext();
  const {
    markPrices,
    lastPrices
  } = usePerpData();
  
  const [data, setData] = useState<any>([])
  const [total, setTotal] = useState(0);

  const isMobile = useClientMobile();

  const [tab, setTab] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [unrealMode, setUnrealMode] = useState<'mark_price' | 'last_price'>('mark_price');

  const { symbolFrom } = parseSymbol(symbol);
  const tokenIn = useTokenMetaFromSymbol(symbolFrom, tokenInfo);

  const SpotTransactionBtn = () => (
    <>
      <div className="flex items-center">
        <button
          className="text-white py-1 px-2 mr-2 relative bg-buyGradientGreen rounded-lg text-white font-bold flex items-center justify-center"
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
          className="text-white py-1 px-2 relative bg-withdrawPurple2 rounded-lg text-white font-bold flex items-center justify-center"
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


  const SettlePnlBtn = () => (
    <button
      className="text-white py-1 px-2 relative bg-buyGradientGreen rounded-lg text-white font-bold flex items-center justify-center"
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

  const table: PortfolioTable = {
    title: 'Assets',
    tabs: [
      {
        id: 'spot',
        default: 'Spot',
        pagination: false,
        getData: async () => false,
        rightComp: <SpotTransactionBtn />,
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
            )
          },
          {
            key: 'near',
            header: 'Near',
            icon: (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M6 0C2.68629 0 0 2.68629 0 6V10C0 13.3137 2.68629 16 6 16H10C13.3137 16 16 13.3137 16 10V6C16 2.68629 13.3137 0 10 0H6ZM5.25169 10.1382V5.40912L10.9917 11.2454C11.7358 12.0019 13.1774 11.5514 13.1774 10.5624V4.85282C13.1774 3.85671 11.7184 3.4103 10.9811 4.18081L9.21454 6.84695L9.46222 7.05901L11.6913 5.44625V9.9813L5.95127 4.14508C5.20724 3.38857 3.76562 3.83906 3.76562 4.82807V10.667C3.76562 11.6232 5.12751 12.0909 5.8992 11.3996L7.97615 8.54347L7.72847 8.33141L5.25169 10.1382Z" fill="#7E8A93"/>
              </svg>
            ),
            sortKey: 'near',
            extras: ['sort'],
            colSpan: 2,
            render: ({ near }) => digitWrapperAsset(near, 3)
          },
          {
            key: 'in_open_orders',
            header: 'In Open Order',
            icon: <OrderlyIcon />,
            extras: ['sort'],
            sortKey: 'in-order',
            render: (row) => digitWrapperAsset(row['in-order'], 3)
          },
          {
            key: 'available',
            header: 'Available',
            icon: <OrderlyIcon />,
            extras: ['sort'],
            sortKey: 'available',
            render: ({ available }) => digitWrapperAsset(available, 3)
          }
        ]
      },
      {
        id: 'futures',
        default: 'Futures',
        rightComp: <SettlePnlBtn />,
        pagination: false,
        getData: () => getPortfolioPosition({ accountId }),
        tableTopComponent: <FutureTopComponent />,
        columns: [
          {
            key: 'instrument',
            header: 'Instrument',
            colSpan: 2,
            render: ({ symbol }) => (
              <div className="flex items-center ">{marketList.find((m) => m.textId === symbol)?.text}</div>
            )
          },
          {
            key: 'qty.',
            header: 'Qty.',
            extras: ['sort'],
            sortKey: 'position_qty',
            render: ({ position_qty }) => (
              <div className={`pr-2 text-sm ${position_qty >= 0 ? 'text-buyGreen' : 'text-sellColorNew'}`}>
                {position_qty?.toFixed(4) || '-' }
              </div>
            )},
          { key: 'avg_open',  header: 'Avg. Open', extras: ['sort'], sortKey: 'average_open_price', render: ({ average_open_price }) => average_open_price?.toFixed(3) || '-' },
          {
            key: 'mark_orderly',
            header: 'Mark',
            colSpan: 2,
            extras: ['sort'],
            sortKey: 'mark_price',
            render: ({ symbol }) => (
              <div className={`pr-2 text-sm ${markPrices.find((i) => i.symbol === symbol)?.price >= 0 ? 'text-buyGreen' : 'text-sellColorNew'}`}>
                {markPrices.find((i) => i.symbol === symbol)?.price.toFixed(3) || '-' }
              </div>
            )
          },
          {
            key: 'liq_price',
            header: 'Liq. Price',
            extras: ['sort'],
            sortKey: 'est_liq_price',
            render: ({ est_liq_price }) => (
              <div className={`pr-2 text-sm text-warn`}>
                {est_liq_price ? est_liq_price.toFixed(1) : '-'}
              </div>
            )
          },
          {
            key: 'unreal_pnl',
            header: 'Unreal. PnL',
            headerType: 'dashed',
            extras: ['radio'],
            select: unrealMode,
            setSelect: setUnrealMode,
            list: [
              {
                text: intl.formatMessage({ id: 'mark_price' }),
                textId: 'mark_price'
              },
              {
                text: intl.formatMessage({ id: 'last_price' }),
                textId: 'last_price'
              }
            ],
            render: ({ symbol, average_open_price, position_qty }) => {
              const price = unrealMode === 'mark_price' ? markPrices.find((i) => i.symbol === symbol)?.price : lastPrices.find((i) => i.symbol === symbol)?.low;

              return (
                <div className={`pr-2 text-sm ${(price - average_open_price) *  position_qty >= 0  ? 'text-buyGreen' : 'text-sellColorNew'}`}>
                  {((price - average_open_price) *  position_qty)?.toFixed(2) || '-' }
                </div>
              )
            }
          },
          {
            key: 'daily_real',
            header: 'Daily Real',
            extras: ['sort'],
            sortKey: 'pnl_24_h',
            render: ({ pnl_24_h }) => (
              <div className={`pr-2 text-sm ${pnl_24_h >= 0 ? 'text-buyGreen' : 'text-sellColorNew'}`}>
                {pnl_24_h?.toFixed(3) || '-' || '-' }
              </div>
            )
          },
          {
            key: 'notional',
            header: 'Notional',
            extras: ['sort'],
            sortKey: ['position_qty', 'average_open_price'],
            render: ({ average_open_price, position_qty }) => (position_qty * average_open_price)?.toFixed(2) || '-' 
          },
          {
            key: 'qty.',
            header: 'Qty.',
            colSpan: 3,
            customRender: true,
            headerRender: () => <FutureTableFormHeaders />
          }
        ]
      }
    ]
  }

  const { getData, id } = table.tabs[tab];

  useEffect(() => {
    setPage(1);
    getData && callGetData();
  }, [tab]);

  useEffect(() => {
    getData && callGetData();
  }, [page, validAccountSig]);

  useEffect(() => {
    if (getData && (id === 'spot')) {
      callGetData();
    }
  }, [JSON.stringify(displayBalances)]);

  useEffect(() => {
    if (getData && (id === 'futures')) {
      setData(newPositions.rows);
    }
  }, [JSON.stringify(newPositions)]);

  const callGetData = async () => {
    const { data } = await getData({ page });

    if (!data && id === 'spot') {
      setData(displayBalances);
      setLoading(false);
      return
    }

    setData(data?.rows || []);
    setTotal(data.meta?.total || 0);
    setLoading(false);
  }

  return (
    <>
      <div
        className="w-full relative mt-10 xs:mt-5 lg:rounded-2xl shadow-sm text-primaryOrderly text-sm lg:bg-black lg:bg-opacity-10 pb-4"
        style={{
          minHeight: isMobile ? '' : 'calc(100vh - 680px)',
        }}
      >
        <span className="text-white gotham_bold text-lg px-5 hidden md:block lg:block">Assets</span>
        <FlexRowBetween className="pb-3 py-3 rounded-t-2xl px-5 mt-0 border-white border-opacity-10 hidden md:flex lg:flex">
          <FlexRowBetween className={`w-full min-h-8 `}>
            <FlexRow>
              {table.tabs.map((tableTab, index) => (
                <FlexRow
                  key={tableTab.id}
                  onClick={() => {
                    if (tab !== index) {
                      setLoading(true);
                      setData([]);
                      setTab(index);
                    }
                  }}
                  className={`justify-center cursor-pointer`}
                >
                  <span
                    className={`px-5 gotham_bold
                      ${tab === index
                        ? 'text-white relative'
                        : 'text-primaryOrderly relative'
                    }`}
                  >
                    <b>
                      {intl.formatMessage({
                        id: tableTab.id,
                        defaultMessage: tableTab.default,
                      })}
                    </b>

                    {tab === index && (
                      <div className="h-0.5 bg-gradientFromHover rounded-lg w-full absolute -bottom-5 left-0"></div>
                    )}
                  </span>
                </FlexRow>
              ))}
            </FlexRow>
            
            <div className="hidden md:block lg:block">
              {(table.tabs[tab].rightComp) && table.tabs[tab].rightComp}
            </div>
          </FlexRowBetween>
        </FlexRowBetween>

        <div className="w-full rounded-2xl md:bg-cardBg lg:bg-cardBg py-5">
          <AssetAndFutureTable
            key={table.tabs[tab].id}
            data={data || []}
            loading={loading}
            tableKey={table.tabs[tab].id}
            columns={table.tabs[tab].columns}
            tableRowType={table.tabs[tab].tableRowType}
            tableRowEmpty={table.tabs[tab].tableRowEmpty}
            tableTopComponent={table.tabs[tab].tableTopComponent}
            maintenance={maintenance}
            handleOpenClosing={handleOpenClosing}
          />
        </div>
      </div>
    </>
  );
}

export default AssetsAndFuture;

const OrderlyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M15.6822 10.24C14.7134 13.568 11.6407 16 8 16C4.35928 16 1.28658 13.568 0.317827 10.24H5.283C5.92862 11.0218 6.90538 11.5201 7.99852 11.5201C9.09165 11.5201 10.0684 11.0218 10.714 10.24H15.6822ZM15.84 9.59998H11.1348C11.3801 9.11996 11.5185 8.57619 11.5185 8.0001C11.5185 7.42387 11.3801 6.87998 11.1346 6.39989H15.8399C15.9449 6.9169 16 7.45201 16 8C16 8.54794 15.9449 9.08301 15.84 9.59998ZM4.86227 9.59998C4.61691 9.11996 4.47852 8.57619 4.47852 8.0001C4.47852 7.42387 4.61698 6.87998 4.86244 6.39989H0.160052C0.0550964 6.9169 0 7.45201 0 8C0 8.54794 0.0550867 9.08301 0.160024 9.59998H4.86227ZM1.59946 3.19994C1.02876 3.95971 0.590194 4.8244 0.317867 5.75989H5.28328C5.9289 4.97825 6.90554 4.4801 7.99852 4.4801C9.09149 4.4801 10.0681 4.97825 10.7138 5.75989H15.6821C15.4098 4.8244 14.9712 3.95971 14.4005 3.19994H1.59946ZM13.8657 2.55994H2.13431C3.59533 0.985349 5.68259 0 8 0C10.3174 0 12.4047 0.985349 13.8657 2.55994Z" fill="#7E8A93"/>
  </svg>
)