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
import { OrderAsset, useOrderlyPortfolioAssets } from '../components/AssetModal/state';
import { useBatchTokenMetaFromSymbols } from '../components/ChartHeader/state';
import { NearTip } from '../../../pages/AccountPage';
import { parseSymbol } from '../components/RecentTrade';
import { Images } from '../../../components/stableswap/CommonComp';
import ProgressBar from '../components/TableWithTabs/ProgressBar';
import {
  AllMarketIcon
} from '../components/Common/Icons';
import getConfig from '../../../services/config';

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
              className="rounded-full flex-shrink-0 w-5 h-5 mr-0.5 md:mr-2.5"
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
        tableRowEmpty: 'no_orders_found',
        filter: true,
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
                  id: side?.toLowerCase(),
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
        tableRowEmpty: 'no_orders_found',
        filter: true,
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
                  id: side?.toLowerCase(),
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

  const displayBalances: OrderAsset[] = useOrderlyPortfolioAssets(nonOrderlyTokenInfo);

  const assetsTables: PortfolioTable = {
    title: 'Assets',
    tabs: [
      {
        id: 'spot',
        default: 'Spot',
        pagination: false,
        getData: async () => {

          return false
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
        tableRowEmpty: 'no_records_found',
        mobileRender: ({ token, created_time, tx_id, amount, user_id }) => (
          <div
            className={`m-2 p-3 gap-2 rounded-xl`}
            style={{ backgroundColor: '#7E8A931A' }}
          >
            <div className="w-full inline-block text-white">
              <div className="font-bold">{token}</div>
            </div>
            <div className="w-1/2 inline-block">
              <div className={`p-0.5 my-0.5`}>
                from <span className="text-white">{user_id}</span>
              </div>
              <div className={`p-0.5 text-sm my-0.5`}>
                <span>{formatTimeDate(created_time)}</span>
              </div>
            </div>
            <div className="w-1/2 inline-block text-right">
              <div className={`p-0.5 my-0.5`}>
                to&nbsp;
                <span className="text-txBlue">
                  <a
                    href={`${getConfig().nearExplorerUrl}/transactions/${tx_id}`}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                  >
                    {shortenAddress(tx_id)}
                  </a>
                  <a onClick={() => navigator.clipboard.writeText(tx_id)}>
                    <svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block ml-1">
                      <rect x="1" y="3" width="7" height="8" rx="2" stroke="#5285DF"/>
                      <path d="M2.72754 3.27246L2.72754 3C2.72754 1.89543 3.62297 1 4.72754 1H7.99941C9.10398 1 9.99941 1.89543 9.99941 3V7.36288C9.99941 8.36692 9.18548 9.18085 8.18144 9.18085V9.18085" stroke="#5285DF"/>
                    </svg>
                  </a>
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
              <div className="flex items-center ">{token}</div>
            )
          },
          { key: 'amount', textColor: '', header: 'Amount', render: ({ amount }) => amount },
          { key: 'source_address', header: 'Source Address', render: ({ user_id }) => user_id },
          {
            key: 'txid',
            header: 'TxID',
            colSpan: 2,
            type: 'link',
            render: ({ tx_id }) => (
              <a
                href={`${getConfig().nearExplorerUrl}/transactions/${tx_id}`}
                className="text-txBlue"
                target="_blank"
                rel="noopener noreferrer nofollow"
              >
                {shortenAddress(tx_id, 8)}
              </a> 
            )
          },
          {
            key: 'time',
            header: 'Time',
            type: 'dateTime',
            colSpan: 2,
            textColor: '',
            render: ({ created_time }) => formatTimeDate(created_time)
          },
        ]
      },
      {
        id: 'withdraw',
        default: 'Withdraw',
        getData: ({page}: {page: number}) => getPortfolioAssetHistory({ accountId, page, side: 'WITHDRAW' }),
        tableRowEmpty: 'no_records_found',
        mobileRender: ({ token, created_time, tx_id, amount, user_id }) => (
          <div
            className={`m-2 p-3 gap-2 rounded-xl`}
            style={{ backgroundColor: '#7E8A931A' }}
          >
            <div className="w-full inline-block text-white">
              <div className="font-bold">{token}</div>
            </div>
            <div className="w-1/2 inline-block">
              <div className={`p-0.5 my-0.5`}>
                from <span className="text-white">{user_id}</span>
              </div>
              <div className={`p-0.5 text-sm my-0.5`}>
                <span>{formatTimeDate(created_time)}</span>
              </div>
            </div>
            <div className="w-1/2 inline-block text-right">
              <div className={`p-0.5 my-0.5`}>
                to&nbsp;
                <span className="text-txBlue">
                  <a
                    href={`${getConfig().nearExplorerUrl}/transactions/${tx_id}`}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                  >
                    {shortenAddress(tx_id)}
                  </a>
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
              <div className="flex items-center ">{token}</div>
            )
          },
          { key: 'amount', textColor: '', header: 'Amount', render: ({ amount }) => amount },
          { key: 'source_address', header: 'Source Address', render: ({ user_id }) => user_id },
          {
            key: 'txid',
            header: 'TxID',
            colSpan: 2,
            type: 'link',
            render: ({ tx_id }) => (
              <a
                href={`${getConfig().nearExplorerUrl}/transactions/${tx_id}`}
                className="text-txBlue"
                target="_blank"
                rel="noopener noreferrer nofollow"
              >
                {shortenAddress(tx_id, 8)}
              </a> 
            )
          },
          {
            key: 'time',
            header: 'Time',
            type: 'dateTime',
            colSpan: 2,
            textColor: '',
            render: ({ created_time }) => formatTimeDate(created_time)
          },
        ]
      },
      // records - funding fee
      {
        id: 'funding_fee',
        default: 'Funding Fee',
        mobileKey: 'funding',
        getData: ({page}: {page: number}) => getFundingFee({ accountId, page }),
        tableRowEmpty: 'no_records_found',
        mobileRender: ({ symbol, funding_fee, created_time, status }) => (
          <div
            className={`m-2 p-3 gap-2 rounded-xl`}
            style={{ backgroundColor: '#7E8A931A' }}
          >
            <div className="w-4/12 inline-block">
              <div className="font-bold">{marketList.find((m) => m.textId === symbol)?.withSymbol}</div>
              <div className={`p-0.5 text-sm my-0.5`}>
                <span>{status}</span>
              </div>
            </div>
            <div className="w-8/12 inline-block text-right">
              <div className={`p-0.5 text-sm my-0.5 text-white`}>
                <span className={funding_fee > 0 ? 'text-buyGreen' : 'text-sellColorNew'}>
                  {funding_fee > 0 ? '+' : ''}{funding_fee.toFixed(4)}
                </span>
                &nbsp;USDC
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
            mobileHeaderKey: 'funding',
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
