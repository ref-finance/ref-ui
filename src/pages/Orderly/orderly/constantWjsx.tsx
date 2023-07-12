import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import {
  PriceFloatUpIcon
} from '~components/icon/Common';
import { getPortfolioAllOrders, getFundingFee, getPortfolioAssetHistory, getPortfolioPosition } from '../orderly/off-chain-api';
import { TextWrapper } from '../components/UserBoard';
import { PortfolioTable } from './type';
import { useDEXLogoRender } from './customRenderHook';
import { openUrl } from '../../../services/commonV3';
import { useWalletSelector } from '../../../context/WalletSelectorContext';
import { useOrderlyContext } from '../orderly/OrderlyContext';
import { formatTimeDate, shortenAddress, getAccountName } from './utils';
import { digitWrapperAsset } from '../utiles';
import { useTokenInfo } from './state';
import { useAllSymbolInfo } from '../components/TableWithTabs/state';
import { OrderAsset, useOrderAssets } from '../components/AssetModal/state';
import { useBatchTokenMetaFromSymbols } from '../components/ChartHeader/state';
import { NearTip } from '../../../pages/AccountPage';
import { parseSymbol } from '../components/RecentTrade';
import { Images } from '../../../components/stableswap/CommonComp';
import ProgressBar from '../components/TableWithTabs/ProgressBar';
import {
  AllMarketIcon
} from '../components/Common/Icons';

// Portfolio Table
export const usePortableOrderlyTable = () => {
  const intl = useIntl();
  const { tokenInfo } = useOrderlyContext();
  const { accountId } = useWalletSelector();
  const availableSymbols = useAllSymbolInfo();
  const { renderLogo } =  useDEXLogoRender();
  const nonOrderlyTokenInfo = useTokenInfo();

  const OpenbookBtn = () => (
    <button
      className="text-white py-1 px-2 relative bg-buyGradientGreen rounded-lg text-white font-bold flex items-center justify-center"
      onClick={() => {
        openUrl('/orderbook');
      }}
    >
      <span style={{ marginRight: 5 }}>Orderbook</span>
      <PriceFloatUpIcon />
    </button>
  );

  const SettlePnlBtn = () => (
    <button
      className="text-white py-1 px-2 relative bg-buyGradientGreen rounded-lg text-white font-bold flex items-center justify-center"
      onClick={() => {}}
    >
      <span>Settle Pnl</span>
    </button>
  );


  const allTokenSymbols = [
    ...new Set(
      !availableSymbols
        ? []
        : availableSymbols.flatMap((s) => {
            const { symbolFrom, symbolTo } = parseSymbol(s.symbol);

            return [symbolFrom, symbolTo];
          })
    ),
  ];

  const allTokens = useBatchTokenMetaFromSymbols(
    allTokenSymbols.length > 0 ? allTokenSymbols : null,
    tokenInfo
  );

  const generateMarketList = () => {
    if (!availableSymbols || !allTokens) return [];
    const marketList = [
      {
        text: (
          <div className="flex items-center p-0.5 pr-4 my-0.5">
            <span className="text-white">
              {intl.formatMessage({
                id: 'all_instrument',
                defaultMessage: 'All Instrument',
              })}
            </span>
          </div>
        ),
        withSymbol: (
          <div className="flex items-center p-0.5 pr-4 my-0.5">
            <div className="mr-2 ml-1 text-white text-sm ">
              <AllMarketIcon />
            </div>
            <span className="text-white">
              {intl.formatMessage({
                id: 'all_instrument',
                defaultMessage: 'All Instrument',
              })}
            </span>
          </div>
        ),
        textId: 'all_markets',
      },
    ];

    availableSymbols
      .sort((a, b) => (a.symbol > b.symbol ? 1 : -1))
      .forEach((symbol) => {
        const { symbolFrom, symbolTo } = parseSymbol(symbol.symbol);
        const fromToken = allTokens[symbolFrom];

        const symbolRender = (
          <div className="flex items-center p-0.5 pr-4 text-white text-sm my-0.5">
            <img
              src={fromToken?.icon}
              alt=""
              className="rounded-full xs:hidden md:hidden flex-shrink-0 w-5 h-5 mr-2.5"
            />

            <Images
              tokens={[fromToken, allTokens[symbolTo]]}
              size="5"
              className="lg:hidden"
              borderStyle="border-gradientFrom"
            />

            <span className="xs:text-white xs:ml-2 xs:font-bold">
              {symbolFrom}
            </span>

            <span className="text-primaryOrderly xs:text-white xs:font-bold">
              /{symbolTo}
            </span>
          </div>
        );

        const textRender = (
          <div className="flex items-center p-0.5 pr-4 text-white text-sm my-0.5">
            <span className="xs:text-white xs:ml-2 xs:font-bold">
              {symbolFrom}
            </span>

            <span className="text-primaryOrderly xs:text-white xs:font-bold">
              /{symbolTo}
            </span>
          </div>
        );

        marketList.push({
          text: textRender,
          withSymbol: symbolRender,
          textId: symbol.symbol,
        });
      });

    return marketList;
  };

  const marketList = generateMarketList();

  const ordersTable: PortfolioTable = {
    title: 'Orders',
    tabs: [
      // getOrders
      {
        id: 'open_orders',
        default: 'Open Orders',
        rightComp: <OpenbookBtn />,
        tableRowType: 'card',
        getData: ({page}: {page: number}) => getPortfolioAllOrders({ accountId, OrderProps: { page, status: 'INCOMPLETE' } }),
        columns: [
          {
            key: 'instrument',
            colSpan: 2,
            header: 'Instrument',
            render: ({ symbol }) => (
              <div className="flex items-center ">{marketList.find((m) => m.textId === symbol)?.withSymbol}</div>
            )
          },
          { key: 'type', header: 'Type', render: ({ type }) => <span className='capitalize'>{type}</span> },
          {
            key: 'Side',
            header: 'Side',
            render: ({ side }) => (
              <TextWrapper
                className="px-2 text-sm"
                value={intl.formatMessage({
                  id: side.toLowerCase(),
                  defaultMessage: side,
                })}
                bg={side === 'BUY' ? 'bg-buyGreen' : 'bg-sellRed'}
                textC={side === 'BUY' ? 'text-buyGreen' : 'text-sellColorNew'}
              />
            )
          },
          {
            key: 'filled_qty',
            header: 'Fill / Qty',
            colSpan: 2,
            render: ({ executed, quantity, side }) => (
              <div>
                <span className={`text-sm ${side === 'BUY' ? 'text-buyGreen' : 'text-sellColorNew'}`}>{`${executed} / ${quantity}`}</span>
                <ProgressBar value={executed} total={quantity} color={side === 'BUY' ? '#00D6AF' : '#E14B8A'} />
              </div>
            )
          },
          { key: 'price', header: 'Price', render: ({ price }) => price.toFixed(4) || '-'  },
          { key: 'avg_price', header: 'Avg.Price', render: ({ average_executed_price }) => average_executed_price?.toFixed(0) || '-' },
          { key: 'est_total', header: 'Est.Total', render: ({ price, quantity}) => (price * quantity).toFixed(0)},
          {
            key: 'created_orderly',
            header: 'Created',
            type: 'dateTime',
            colSpan: 2,
            textColor: '',
            extras: ['sort'],
            render: ({ created_time }) => formatTimeDate(created_time)
          },
          { key: 'dex', header: 'Dex', render: ({ broker_name }) => renderLogo(broker_name) }
        ]
      },
      {
        id: 'history',
        default: 'History',
        rightComp: <OpenbookBtn />,
        tableRowType: 'card',
        getData: ({page}: {page: number}) => getPortfolioAllOrders({ accountId, OrderProps: { page, status: 'COMPLETED' } }),
        columns: [
          {
            key: 'instrument',
            colSpan: 2,
            header: 'Instrument',
            render: ({ symbol }) => (
              <div className="flex items-center ">{marketList.find((m) => m.textId === symbol)?.withSymbol}</div>
            )
          },
          { key: 'type', header: 'Type', render: ({ type }) => <span className='capitalize'>{type}</span> },
          {
            key: 'Side',
            header: 'Side',
            render: ({ side }) => (
              
              <TextWrapper
                className="px-2 text-sm"
                value={intl.formatMessage({
                  id: side.toLowerCase(),
                  defaultMessage: side,
                })}
                bg={side === 'BUY' ? 'bg-buyGreen' : 'bg-sellRed'}
                textC={side === 'BUY' ? 'text-buyGreen' : 'text-sellColorNew'}
              />
            )
          },
          {
            key: 'filled_qty',
            header: 'Fill / Qty',
            colSpan: 2,
            render: ({ executed, quantity, side }) => (
              <div>
                <span className={`text-sm ${side === 'BUY' ? 'text-buyGreen' : 'text-sellColorNew'}`}>{`${executed} / ${quantity}`}</span>
                <ProgressBar value={executed} total={quantity} color={side === 'BUY' ? '#00D6AF' : '#E14B8A'} />
              </div>
            )
          },
          { key: 'price', header: '@Price', render: ({ price }) => price?.toFixed(4) || '-'  },
          { key: 'avg_price', header: 'Avg.Price', render: ({ average_executed_price }) => average_executed_price?.toFixed(0) || '-' },
          { key: 'est_total', header: 'Est.Total', render: ({ price, average_executed_price, quantity}) => ((price || average_executed_price) * quantity).toFixed(0)},
          {
            key: 'created_orderly',
            header: 'Created',
            type: 'dateTime',
            colSpan: 2,
            textColor: '',
            extras: ['sort'],
            render: ({ created_time }) => formatTimeDate(created_time)
          },
          { key: 'dex', header: 'Dex', render: ({ broker_name }) => renderLogo(broker_name) }
        ]
      },
    ]
  }

  const displayBalances: OrderAsset[] = useOrderAssets(nonOrderlyTokenInfo);

  const assetsTables: PortfolioTable = {
    title: 'Assets',
    tabs: [
      {
        id: 'spot',
        default: 'Spot',
        pagination: false,
        getData: async () => {

          return {
            data: { rows: displayBalances }}
        },
        columns: [
          {
            key: 'token',
            header: 'Token',
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
            key: 'amount',
            header: 'Near',
            icon: '',
            headerType: 'Dynamic',
            extras: ['sort'],
            colSpan: 2,
            render: ({ near }) => digitWrapperAsset(near, 3)
          },
          {
            key: 'in_open_orders',
            header: 'In Open Order',
            icon: '',
            extras: ['sort'],
            render: (row) => digitWrapperAsset(row['in-order'], 3)
          },
          {
            key: 'available',
            header: 'Available',
            icon: '', 
            extras: ['sort'],
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
        columns: [
          {
            key: 'instrument',
            colSpan: 2,
            header: 'Instrument',
            render: ({ symbol }) => (
              <div className="flex items-center ">{marketList.find((m) => m.textId === symbol)?.text}</div>
            )
          },
          { key: 'avg_open', header: 'Avg. Open', extras: ['sort'], render: ({ average_open_price }) => average_open_price?.toFixed(3) || '-' },
          { key: 'mark_orderly', header: 'Mark', extras: ['sort'], render: ({ mark_price }) => mark_price?.toFixed(3) || '-' },
          { key: 'liq_price', header: 'Liq. Price', extras: ['sort'], render: ({ est_liq_price }) => est_liq_price?.toFixed(3) || '-' },
          { key: 'unreal_pnl', header: 'Unreal. PnL', extras: ['sort'], render: ({ mark_price, average_open_price, position_qty }) =>  ((mark_price - average_open_price) *  position_qty)?.toFixed(3) || '-' },
          { key: 'daily_real', header: 'Daily Real', extras: ['sort'], render: ({ pnl_24_h }) => pnl_24_h?.toFixed(3) || '-' },
          { key: 'unsettled_pnl', header: 'Unsettled PnL', extras: ['sort'], render: ({ unsettled_pnl }) => <span className="text-buyGreen">{unsettled_pnl?.toFixed(3) || '-'}</span> },
          { key: 'notional', header: 'Notional', extras: ['sort'], render: ({ average_open_price, position_qty }) => (position_qty * average_open_price)?.toFixed(3) || '-' },
          {
            key: 'qty.',
            header: 'Qty.', 
            render: ({ position_qty }) => (
              <div
                className="px-2 text-sm text-buyGreen"
                style={{
                  borderRadius: '6px',
                  border: '1px solid #1D2932',
                  backgroundColor: 'rgba(0, 0, 0, 0.10)'
                }}
              >
                {position_qty?.toFixed(0) || '-' }
              </div>
            )},
          // { key: 'price', header: 'Price', render: ({ average_open_price }) => average_open_price?.toFixed(3) || '-' },
        ]
      },
    ]
  }


  const recordsTable: PortfolioTable = {
    title: 'Records',
    tabs: [
      {
        id: 'deposit',
        default: 'Deposit',
        getData: ({page}: {page: number}) => getPortfolioAssetHistory({ accountId, page, side: 'DEPOSIT' }),
        columns: [
          {
            key: 'token',
            header: 'Token',
            render: ({ token }) => (
              <div className="flex items-center ">{token}</div>
            )
          },
          { key: 'amount', textColor: '', header: 'Amount', render: ({ amount }) => amount },
          { key: 'source_address', header: 'Source Address', render: ({ user_id }) => user_id },
          { key: 'txid', header: 'TxID', colSpan: 2, type: 'link', render: ({ tx_id }) => shortenAddress(tx_id) },
          {
            key: 'time',
            header: 'Time',
            type: 'dateTime',
            colSpan: 2,
            textColor: '',
            extras: ['sort'],
            render: ({ created_time }) => formatTimeDate(created_time)
          },
        ]
      },
      {
        id: 'withdraw',
        default: 'Withdraw',
        getData: ({page}: {page: number}) => getPortfolioAssetHistory({ accountId, page, side: 'WITHDRAW' }),
        columns: [
          {
            key: 'token',
            header: 'Token',
            render: ({ token }) => (
              <div className="flex items-center ">{token}</div>
            )
          },
          { key: 'amount', textColor: '', header: 'Amount', render: ({ amount }) => amount },
          { key: 'source_address', header: 'Source Address', render: ({ user_id }) => user_id },
          { key: 'txid', header: 'TxID', colSpan: 2, type: 'link', render: ({ tx_id }) => shortenAddress(tx_id) },
          {
            key: 'time',
            header: 'Time',
            type: 'dateTime',
            colSpan: 2,
            textColor: '',
            extras: ['sort'],
            render: ({ created_time }) => formatTimeDate(created_time)
          },
        ]
      },
      // records - funding fee
      {
        id: 'funding_fee',
        default: 'Funding Fee',
        getData: ({page}: {page: number}) => getFundingFee({ accountId, page }),
        columns: [
          {
            key: 'instrument',
            colSpan: 2,
            header: 'Instrument',
            render: ({ symbol }) => (
              <div className="flex items-center ">{marketList.find((m) => m.textId === symbol)?.withSymbol}</div>
            )
          },
          {
            key: 'funding_annual_rate',
            header: 'Funding Rate / Annual Rate',
            colSpan: 2,
            render: ({ funding_rate }) => `${funding_rate.toFixed(6)}%/${(Math.ceil(funding_rate * 3 * 365 * 100 * 100) / 100).toFixed(2)}%`
          },
          { key: 'status', header: 'Status', render: ({ status }) => status },
          { key: 'type', header: 'Type', render: ({ payment_type }) => payment_type },
          {
            key: 'funding_fee',
            header: 'Funding Fee',
            colSpan: 2,
            render: ({ funding_fee }) => (
              <>
                <span className={funding_fee > 0 ? 'text-buyGreen' : 'text-sellColorNew'}>
                  {funding_fee > 0 ? '+' : ''}{funding_fee.toFixed(4)}
                </span>
                &nbsp;USDC
              </>
            ) 
          },
          {
            key: 'created',
            header: 'Created',
            type: 'dateTime',
            colSpan: 2,
            textColor: '',
            extras: ['sort'],
            render: ({ created_time }) => formatTimeDate(created_time)
          },
        ]
      },
    ]
    }

  return {
    ordersTable,
    assetsTables,
    recordsTable
  }
}
