import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { TokenMetadata } from '~services/ft-contract';
import { getPortfolioAllOrders, getFundingFee, getPortfolioAssetHistory, getPortfolioPosition, getPortfolioSettlements } from '../orderly/off-chain-api';
import { TextWrapper } from '../components/UserBoard';
import { PortfolioTable } from './type';
import { useDEXLogoRender } from './customRenderHook';
import { useOrderlyContext } from '../orderly/OrderlyContext';
import { formatTimeDate, shortenAddress, getAccountName } from './utils';
import { digitWrapperAsset } from '../utiles';
import { useAllSymbolInfo } from '../components/TableWithTabs/state';
import { useBatchTokenMetaFromSymbols } from '../components/ChartHeader/state';
import { parseSymbol } from '../components/RecentTrade';
import ProgressBar from '../components/TableWithTabs/ProgressBar';
import OrdersFilters from '../components/TableWithTabs/OrdersFilters';
import { FutureMobileView, FutureTopComponent } from '../components/TableWithTabs/FuturesControls';
import { AllMarketIcon } from '../components/Common/Icons';
import { 
  DepositButtonMobile,
  WithdrawButtonMobile
} from '../components/Common';
import { getCurrentWallet } from '../../../utils/wallets-integration';
import { useWalletSelector } from '../../../context/WalletSelectorContext';
import { NearTip } from '../../../pages/AccountPage';
import getConfig from '../../../services/config';
import { Checkbox, CheckboxSelected, ArrowGrey } from '../../../components/icon';

const OrderlyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M15.6822 10.24C14.7134 13.568 11.6407 16 8 16C4.35928 16 1.28658 13.568 0.317827 10.24H5.283C5.92862 11.0218 6.90538 11.5201 7.99852 11.5201C9.09165 11.5201 10.0684 11.0218 10.714 10.24H15.6822ZM15.84 9.59998H11.1348C11.3801 9.11996 11.5185 8.57619 11.5185 8.0001C11.5185 7.42387 11.3801 6.87998 11.1346 6.39989H15.8399C15.9449 6.9169 16 7.45201 16 8C16 8.54794 15.9449 9.08301 15.84 9.59998ZM4.86227 9.59998C4.61691 9.11996 4.47852 8.57619 4.47852 8.0001C4.47852 7.42387 4.61698 6.87998 4.86244 6.39989H0.160052C0.0550964 6.9169 0 7.45201 0 8C0 8.54794 0.0550867 9.08301 0.160024 9.59998H4.86227ZM1.59946 3.19994C1.02876 3.95971 0.590194 4.8244 0.317867 5.75989H5.28328C5.9289 4.97825 6.90554 4.4801 7.99852 4.4801C9.09149 4.4801 10.0681 4.97825 10.7138 5.75989H15.6821C15.4098 4.8244 14.9712 3.95971 14.4005 3.19994H1.59946ZM13.8657 2.55994H2.13431C3.59533 0.985349 5.68259 0 8 0C10.3174 0 12.4047 0.985349 13.8657 2.55994Z" fill="#7E8A93"/>
  </svg>
)

const CopyToClipboard = ({ tx_id }: { tx_id: string }) => (
  <a className="cursor-pointer" onClick={() => navigator.clipboard.writeText(tx_id)}>
    <svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block ml-1">
      <rect x="1" y="3" width="7" height="8" rx="2" stroke="#5285DF"/>
      <path d="M2.72754 3.27246L2.72754 3C2.72754 1.89543 3.62297 1 4.72754 1H7.99941C9.10398 1 9.99941 1.89543 9.99941 3V7.36288C9.99941 8.36692 9.18548 9.18085 8.18144 9.18085V9.18085" stroke="#5285DF"/>
    </svg>
  </a>
)

// Portfolio Table
export const usePortableOrderlyTable = ({
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
  setSettlePnlModalOpen
}: {
  refOnly: boolean;
  setRefOnly: (item: boolean) => void;
  orderType: number;
  setOrderType: (item: number) => void;
  chooseMarketSymbol: string;
  setChooseMarketSymbol: (item: string) => void;
  chooseOrderSide: 'all_side' | 'BUY' | 'SELL';
  setChooseOrderSide: (item: 'all_side' | 'BUY' | 'SELL') => void;
  setOperationType: (item: 'deposit' | 'withdraw') => void;
  setOperationId: (item: string) => void;
  chooseOrderStatus: 'all' | 'Cancelled' | 'filled' | 'Rejected';
  chooseOrderType: 'all' | 'limit' | 'market';
  tokenIn: TokenMetadata;
  setSettlePnlModalOpen: (item: boolean) => void
}) => {
  const intl = useIntl();
  const { accountId } = useWalletSelector();
  const { renderLogo } =  useDEXLogoRender();
  const { wallet } = getCurrentWallet();
  const [showMarketSelector, setShowMarketSelector] = useState<boolean>(false);
  const [showSideSelector, setShowSideSelector] = useState<boolean>(false);
  const { marketList, allTokens } = useMarketlist();

  const OpenbookBtn = () => (
    <div className="flex items-center">
      <span className="flex items-center mr-2">
        <label className="cursor-pointer mr-1" onClick={() => setRefOnly(!refOnly)}>
          {refOnly ? <CheckboxSelected /> :<Checkbox />}
        </label>
        {intl.formatMessage({
          id: 'ref_order_only',
          defaultMessage: 'Order on REF only',
        })}
      </span>
    </div>
  );

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
        mobileRender: ({ symbol, side, created_time, price, average_executed_price, quantity, executed, broker_name }) => (
          <div
            className={`m-2 p-3 gap-2 rounded-xl`}
            style={{ backgroundColor: '#7E8A931A' }}
          >
            <div className="w-8/12 inline-block">
              <div className={`p-0.5 my-0.5 flex`}>
                <div className={`px-2 pt-0.5 text-sm mr-2 inline-flex items-center justify-center rounded-md gotham_bold text-dark5 ${side === 'BUY' ? 'bg-greenLight' : 'bg-redLight'}`}>
                  {intl.formatMessage({
                    id: side?.toLowerCase(),
                    defaultMessage: side,
                  })}
                </div>
                <div className="flex items-center ">{marketList.find((m) => m.textId === symbol)?.withSymbol}</div>
              </div>
            </div>
            <div className="w-4/12 inline-block text-right">
              <div className={`p-0.5 text-xs my-1 flex justify-end items-center`}>
                <span className="mr-1">
                  {(executed / quantity * 100).toFixed(0)}% filled
                </span>
                <div
                  className="flex justify-end items-center"
                  style={{
                    border: `1.4px dashed ${side === 'BUY' ? '#62C340' : '#FF6A8E'}`,
                    borderRadius: '50%',
                    height: '12px',
                    width: '12px',
                  }}
                >
                  <div
                    style={{
                      backgroundColor: side === 'BUY' ? '#62C340' : '#FF6A8E',
                      marginRight: (executed / quantity * 100) === 100 ? '1px' : '2px',
                      height: '8px',
                      width: (executed / quantity * 100) === 0 ? 0 
                        : (executed / quantity * 100) > 0 && (executed / quantity * 100) < 100 ? '4px'
                        : '8px',
                      borderRadius: (executed / quantity * 100) === 0 ? 0 
                      : (executed / quantity * 100) > 0 && (executed / quantity * 100) < 100 ? '0 50% 50% 0'
                      : '50%',
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="w-8/12 inline-block">
              <div className={`p-0.5 text-xs my-1 text-white`}>
                <span>
                  {quantity}
                  <span className="text-10px p-1 text-gray2 mx-1" style={{ borderRadius: '4px', backgroundColor: 'rgba(126, 138, 147, 0.15)' }}>
                    NEAR
                  </span>
                  * {price?.toFixed(2) || average_executed_price?.toFixed(2)}
                  <span className="text-10px p-1 text-gray2 mx-1" style={{ borderRadius: '4px', backgroundColor: 'rgba(126, 138, 147, 0.15)' }}>
                    USDC
                  </span>
                </span>
              </div>
            </div>
            <div className="w-4/12 inline-block text-right">
              <span>
                Total&nbsp;
                <span className="text-white gotham_bold">{(quantity * (price || average_executed_price)).toFixed(1)}</span>
              </span>
            </div>
            <div className="w-8/12 inline-block">
              <div className={`p-0.5 text-xs my-1`}>
                <span>{formatTimeDate(created_time)}</span>
              </div>
            </div>
            <div className="w-4/12 inline-block text-right">
              <div className={`p-0.5 text-xs my-1 flex justify-end items-center`}>
                from {broker_name.split(' DEX')[0]}
              </div>
            </div>
          </div>
        ),
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
          />
        ),
        filter: true,
        getData: ({page}: {page: number}) => {
          return getPortfolioAllOrders({
            accountId,
            OrderProps: {
              page,
              // @ts-ignore
              status: chooseOrderStatus === 'all' ? 'INCOMPLETE' : chooseOrderStatus.toUpperCase(),
              broker_id: refOnly ? 'ref_dex' : '',
              symbol: chooseMarketSymbol === 'all_markets' ? '' : chooseMarketSymbol,
              // @ts-ignore
              side: chooseOrderSide === 'all_side' || chooseOrderSide === 'all' ? '' : chooseOrderSide.toUpperCase(),
              order_type: chooseOrderType === 'all' ? '' : chooseOrderType.toUpperCase()
            } 
          })
        },
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
            key: 'fill_qty',
            header: 'Fill / Qty',
            colSpan: 2,
            render: ({ executed, quantity, side }) => (
              <div>
                <span className={`text-sm ${side === 'BUY' ? 'text-buyGreen' : 'text-sellColorNew'}`}>{`${executed} / ${quantity}`}</span>
                <ProgressBar value={executed} total={quantity} color={side === 'BUY' ? '#00D6AF' : '#E14B8A'} />
              </div>
            )
          },
          { key: '@price', header: '@Price', render: ({ price, symbol }) => price?.toFixed((symbol.includes('BTC') || symbol.includes('ETH')) ? 2 : 4) || '-'  },
          { key: 'avg_price', header: 'Avg.Price', render: ({ average_executed_price, symbol }) => average_executed_price?.toFixed((symbol.includes('BTC') || symbol.includes('ETH')) ? 2 : 4) || '-' },
          { key: 'est_total', header: 'Est.Total', render: ({ price, average_executed_price, quantity, symbol }) => ((price || average_executed_price) * quantity)?.toFixed((symbol.includes('BTC') || symbol.includes('ETH')) ? 2 : 4)},
          {
            key: 'create',
            header: 'Create',
            type: 'dateTime',
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
        mobileRender: ({ symbol, side, created_time, price, average_executed_price, quantity, executed, broker_name }) => (
          <div
            className={`m-2 p-3 gap-2 rounded-xl`}
            style={{ backgroundColor: '#7E8A931A' }}
          >
            <div className="w-8/12 inline-block">
              <div className={`p-0.5 my-0.5 flex`}>
                <div className={`px-2 pt-0.5 text-sm mr-2 inline-flex items-center justify-center rounded-md gotham_bold text-dark5 ${side === 'BUY' ? 'bg-greenLight' : 'bg-redLight'}`}>
                  {intl.formatMessage({
                    id: side?.toLowerCase(),
                    defaultMessage: side,
                  })}
                </div>
                <div className="flex items-center ">{marketList.find((m) => m.textId === symbol)?.withSymbol}</div>
              </div>
            </div>
            <div className="w-4/12 inline-block text-right">
              <div className={`p-0.5 text-xs my-1 flex justify-end items-center`}>
                <span className="mr-1">
                  {(executed / quantity * 100).toFixed(0)}% filled
                </span>
                <div
                  className="flex justify-end items-center"
                  style={{
                    border: `1.4px dashed ${side === 'BUY' ? '#62C340' : '#FF6A8E'}`,
                    borderRadius: '50%',
                    height: '12px',
                    width: '12px',
                  }}
                >
                  <div
                    style={{
                      backgroundColor: side === 'BUY' ? '#62C340' : '#FF6A8E',
                      marginRight: (executed / quantity * 100) === 100 ? '1px' : '2px',
                      height: '8px',
                      width: (executed / quantity * 100) === 0 ? 0 
                        : (executed / quantity * 100) > 0 && (executed / quantity * 100) < 100 ? '4px'
                        : '8px',
                      borderRadius: (executed / quantity * 100) === 0 ? 0 
                      : (executed / quantity * 100) > 0 && (executed / quantity * 100) < 100 ? '0 50% 50% 0'
                      : '50%',
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="w-8/12 inline-block">
              <div className={`p-0.5 text-xs my-1 text-white`}>
                <span>
                  {quantity}
                  <span className="text-10px p-1 text-gray2 mx-1" style={{ borderRadius: '4px', backgroundColor: 'rgba(126, 138, 147, 0.15)' }}>
                    NEAR
                  </span>
                  * {price?.toFixed(2) || average_executed_price?.toFixed(2)}
                  <span className="text-10px p-1 text-gray2 mx-1" style={{ borderRadius: '4px', backgroundColor: 'rgba(126, 138, 147, 0.15)' }}>
                    USDC
                  </span>
                </span>
              </div>
            </div>
            <div className="w-4/12 inline-block text-right">
              <span>
                Total&nbsp;
                <span className="text-white gotham_bold">{(quantity * (price || average_executed_price)).toFixed(1)}</span>
              </span>
            </div>
            <div className="w-8/12 inline-block">
              <div className={`p-0.5 text-xs my-1`}>
                <span>{formatTimeDate(created_time)}</span>
              </div>
            </div>
            <div className="w-4/12 inline-block text-right">
              <div className={`p-0.5 text-xs my-1 flex justify-end items-center`}>
                from {broker_name.split(' DEX')[0]}
              </div>
            </div>
          </div>
        ),
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
          />
        ),
        filter: true,
        getData: ({page}: {page: number}) => {
          return getPortfolioAllOrders({
            accountId,
            OrderProps: {
              page,
              // @ts-ignore
              status: chooseOrderStatus === 'all' ? 'COMPLETED' : chooseOrderStatus.toUpperCase(),
              broker_id: refOnly ? 'ref_dex' : '',
              symbol: chooseMarketSymbol === 'all_markets' ? '' : chooseMarketSymbol,
              // @ts-ignore
              side: chooseOrderSide === 'all_side' || chooseOrderSide === 'all' ? '' : chooseOrderSide.toUpperCase(),
              order_type: chooseOrderType === 'all' ? '' : chooseOrderType.toUpperCase()
            } 
          })
        },
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
          { key: 'type', header: 'Type', render: ({ type }) => <span className='capitalize'>{type}</span> },
          {
            key: 'fill_qty',
            header: 'Fill / Qty',
            colSpan: 2,
            render: ({ executed, quantity, side }) => (
              <div>
                <span className={`text-sm ${side === 'BUY' ? 'text-buyGreen' : 'text-sellColorNew'}`}>{`${executed} / ${quantity}`}</span>
                <ProgressBar value={executed} total={quantity} color={side === 'BUY' ? '#00D6AF' : '#E14B8A'} />
              </div>
            )
          },
          { key: '@price', header: '@Price', render: ({ price, symbol }) => price?.toFixed((symbol.includes('BTC') || symbol.includes('ETH')) ? 2 : 4) || '-'  },
          { key: 'avg_price', header: 'Avg.Price', render: ({ average_executed_price, symbol }) => average_executed_price?.toFixed((symbol.includes('BTC') || symbol.includes('ETH')) ? 2 : 4) || '-' },
          { key: 'est_total', header: 'Est.Total', render: ({ price, average_executed_price, quantity, symbol }) => ((price || average_executed_price) * quantity)?.toFixed((symbol.includes('BTC') || symbol.includes('ETH')) ? 2 : 4)},
          { key: 'status', header: 'Status', render: ({ status }) =>  status },
          {
            key: 'create',
            header: 'Created',
            type: 'dateTime',
            textColor: '',
            extras: ['sort'],
            render: ({ created_time }) => formatTimeDate(created_time)
          },
          { key: 'dex', header: 'Dex', render: ({ broker_name }) => renderLogo(broker_name) }
        ]
      },
    ]
  }

  const assetsTables: PortfolioTable = {
    title: 'Assets',
    tabs: [
      {
        id: 'spot',
        default: 'Spot',
        pagination: false,
        getData: async () => false,
        rightComp: <SpotTransactionBtn />,
        mobileRenderCustom: true,
        mobileRender: (rows) => (
          <>
            <table className="table-fixed w-full">
              <thead className={`w-full table table-fixed py-2 border-white border-opacity-10`}>
                <tr className={`w-full  table-fixed grid grid-cols-3 gap-4 px-3`}>
                  {['assets', 'Wallet', 'available_orderly'].map((key, i) => (
                    <th className={`col-span-1 pb-2${i === 2 ? ' text-right' : ' text-left'}`}>
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
                  <tr className="table-fixed grid grid-cols-3 gap-4 lg:border-t border-white border-opacity-10 text-white">
                    <td className="col-span-1 flex py-2 relative">
                      <div className="flex items-center">
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
                    </td>
                    <td className="col-span-1 py-2">
                      {digitWrapperAsset(near, 3)}
                    </td>
                    <td className="col-span-1 text-right py-2">
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
            key: 'near',
            header: 'Near',
            icon: (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M6 0C2.68629 0 0 2.68629 0 6V10C0 13.3137 2.68629 16 6 16H10C13.3137 16 16 13.3137 16 10V6C16 2.68629 13.3137 0 10 0H6ZM5.25169 10.1382V5.40912L10.9917 11.2454C11.7358 12.0019 13.1774 11.5514 13.1774 10.5624V4.85282C13.1774 3.85671 11.7184 3.4103 10.9811 4.18081L9.21454 6.84695L9.46222 7.05901L11.6913 5.44625V9.9813L5.95127 4.14508C5.20724 3.38857 3.76562 3.83906 3.76562 4.82807V10.667C3.76562 11.6232 5.12751 12.0909 5.8992 11.3996L7.97615 8.54347L7.72847 8.33141L5.25169 10.1382Z" fill="#7E8A93"/>
              </svg>
            ),
            headerType: 'Dynamic',
            extras: ['sort'],
            colSpan: 2,
            render: ({ near }) => digitWrapperAsset(near, 3)
          },
          {
            key: 'in_open_orders',
            header: 'In Open Order',
            icon: <OrderlyIcon />,
            extras: ['sort'],
            render: (row) => digitWrapperAsset(row['in-order'], 3)
          },
          {
            key: 'available',
            header: 'Available',
            icon: <OrderlyIcon />,
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
        tableTopComponent: <FutureTopComponent />,
        mobileRenderCustom: true,
        mobileRender: (rows) => (
          <FutureMobileView
            rows={rows}
            marketList={marketList}
          >
            <SettlePnlBtn />
          </FutureMobileView>
        ),
        columns: [
          {
            key: 'instrument',
            header: 'Instrument',
            render: ({ symbol }) => (
              <div className="flex items-center ">{marketList.find((m) => m.textId === symbol)?.text}</div>
            )
          },
          {
            key: 'qty.',
            header: 'Qty.',
            extras: ['sort'],
            render: ({ position_qty }) => (
              <div className="px-2 text-sm text-buyGreen">
                {position_qty?.toFixed(4) || '-' }
              </div>
            )},
          { key: 'avg_open', header: 'Avg. Open', extras: ['sort'], render: ({ average_open_price }) => average_open_price?.toFixed(3) || '-' },
          { key: 'mark_orderly', header: 'Mark', extras: ['sort'], render: ({ mark_price }) => mark_price?.toFixed(3) || '-' },
          { key: 'liq_price', header: 'Liq. Price', extras: ['sort'], render: ({ est_liq_price }) => est_liq_price?.toFixed(3) || '-' },
          {
            key: 'unreal_pnl',
            header: 'Unreal. PnL',
            headerType: 'dashed',
            extras: ['radio'],
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
            render: ({ mark_price, average_open_price, position_qty }) =>  ((mark_price - average_open_price) *  position_qty)?.toFixed(3) || '-'
          },
          { key: 'daily_real', header: 'Daily Real', extras: ['sort'], render: ({ pnl_24_h }) => pnl_24_h?.toFixed(3) || '-' },
          { key: 'notional', header: 'Notional', extras: ['sort'], render: ({ average_open_price, position_qty }) => (position_qty * average_open_price)?.toFixed(0) || '-' },
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
          { key: 'price', header: 'Price', render: ({ average_open_price }) => average_open_price?.toFixed(3) || '-' },
          { key: '', header: '', render: () => 'close'},
        ]
      }
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
              <div className="flex items-center p-0.5 pr-4 text-white text-sm my-0.5">
                <img
                  src={allTokens[token]?.icon}
                  alt=""
                  className="rounded-full flex-shrink-0 w-5 h-5 mr-0.5 md:mr-2.5 lg:mr-2.5"
                />

                <span className="xs:text-white xs:ml-2 xs:font-bold">
                  {allTokens[token]?.symbol}
                </span>
              </div>
            </div>
            <div className="w-1/2 inline-block">
              <div className={`p-0.5 my-0.5`}>
                from <span className="text-white">{getAccountName(wallet.getAccountId())}</span>
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
              <div className="flex items-center p-0.5 pr-4 text-white text-sm my-0.5">
                <img
                  src={allTokens[token]?.icon}
                  alt=""
                  className="rounded-full flex-shrink-0 w-5 h-5 mr-0.5 md:mr-2.5 lg:mr-2.5"
                />

                <span className="xs:text-white xs:ml-2 xs:font-bold">
                  {allTokens[token]?.symbol}
                </span>
              </div>
            )
          },
          { key: 'amount', textColor: '', header: 'Amount', render: ({ amount }) => amount },
          { key: 'source_address', header: 'Source Address', render: () => getAccountName(wallet.getAccountId()) },
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
              <div className="flex items-center p-0.5 pr-4 text-white text-sm my-0.5">
                <img
                  src={allTokens[token]?.icon}
                  alt=""
                  className="rounded-full flex-shrink-0 w-5 h-5 mr-0.5 md:mr-2.5 lg:mr-2.5"
                />

                <span className="xs:text-white xs:ml-2 xs:font-bold">
                  {allTokens[token]?.symbol}
                </span>
              </div>
            </div>
            <div className="w-1/2 inline-block">
              <div className={`p-0.5 my-0.5`}>
                from <span className="text-white">{getAccountName(wallet.getAccountId())}</span>
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
              <div className="flex items-center p-0.5 pr-4 text-white text-sm my-0.5">
                <img
                  src={allTokens[token]?.icon}
                  alt=""
                  className="rounded-full flex-shrink-0 w-5 h-5 mr-0.5 md:mr-2.5 lg:mr-2.5"
                />

                <span className="xs:text-white xs:ml-2 xs:font-bold">
                  {allTokens[token]?.symbol}
                </span>
              </div>
            )
          },
          { key: 'amount', textColor: '', header: 'Amount', render: ({ amount }) => amount },
          { key: 'source_address', header: 'Source Address', render: () => getAccountName(wallet.getAccountId()) },
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
        id: 'settlements',
        default: 'Settlements',
        getData: ({page}: {page: number}) => getPortfolioSettlements({ accountId, page }),
        tableRowEmpty: 'no_records_found',
        mobileRender: ({ old_balance, new_balance, settled_time, settled_amount }) => (
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
              <div className={`p-0.5 text-sm my-0.5 flex items-center justify-end`}>
                <span className="text-white">
                  {old_balance ? `${old_balance?.toFixed(4)}` : '-'}
                </span>
                <div className="mx-1">
                  <ArrowGrey />
                </div>
                <span className="text-white">
                  {new_balance ? `${new_balance?.toFixed(4)}` : '-'}
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
                <span className={`${settled_amount > 0 ? 'text-buyGreen' : 'text-sellColorNew'}`}>
                  {settled_amount > 0 ? '+' : ''}{settled_amount || '-'}
                </span>
                <span className="text-white">&nbsp;USDC</span>
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
            suffix: <div className="text-[10px] p-0.5 ml-1" style={{ borderRadius: '4px', backgroundColor: 'rgba(126, 138, 147, 0.15)' }}>USDC</div>,
            colSpan: 2,
            render: ({ old_balance, new_balance }) => (
              <div className={`flex items-center`}>
                <span className={`${old_balance ? 'text-white' : ''}`}>
                  {old_balance ? `${old_balance?.toFixed(4)}` : '-'}
                </span>
                <div className="mx-1">
                  <ArrowGrey />
                </div>
                <span className={`${new_balance ? 'text-white' : ''}`}>
                  {new_balance ? `${new_balance?.toFixed(4)}` : '-'}
                </span>
              </div>
            )
          },
          {
            key: 'settled_amount',
            header: 'Settled Amount',
            suffix: <div className="text-[10px] p-0.5 ml-1" style={{ borderRadius: '4px', backgroundColor: 'rgba(126, 138, 147, 0.15)' }}>USDC</div>,
            colSpan: 2,
            render: ({ settled_amount }) => (
              <span className={`${settled_amount > 0 ? 'text-buyGreen' : 'text-sellColorNew'}`}>
                {settled_amount > 0 ? '+' : ''}{settled_amount || '-'}
              </span>
            )
          },
          {
            key: 'time',
            header: 'Time',
            type: 'dateTime',
            textColor: '',
            render: ({ settled_time }) => formatTimeDate(settled_time)
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
                  {funding_fee > 0 ? '+' : ''}{funding_fee?.toFixed(4)}
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
            colSpan: 3,
            render: ({ funding_rate }) => {
              const annualBase = ((funding_rate * 3 * 365 * 100 * 100) / 100).toFixed(4);
              const last = parseInt(annualBase.substr(annualBase.length - 2, 1));
              const negative = (funding_rate < 0);
              const annual = ((last < 5 && negative) || (last > 4 && !negative)) ? (Math.floor(funding_rate * 3 * 365 * 100 * 100) / 100)?.toFixed(2) : (Math.ceil(funding_rate * 3 * 365 * 100 * 100) / 100)?.toFixed(2);

              return `${(funding_rate * 100).toFixed(6)}%/${annual}%`
            }
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
                <span className={funding_fee < 0 ? 'text-buyGreen' : 'text-sellColorNew'}>
                  {funding_fee < 0 ? '+' : ''}{(funding_fee * -1)}
                  <span className="text-white">&nbsp;USDC</span>
                </span>
              </>
            ) 
          },
          {
            key: 'time',
            header: 'Created',
            type: 'dateTime',
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

export const useMarketlist = () => {
  const { tokenInfo } = useOrderlyContext();
  const availableSymbols = useAllSymbolInfo();
  const intl = useIntl();

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
        textNoColor: (
          <div className="flex items-center p-0.5 pr-4 my-0.5">
            <span>
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
        if (!symbol.symbol.includes('PERP')) {
          const { symbolFrom, symbolTo } = parseSymbol(symbol.symbol);
          const fromToken = allTokens[symbolFrom];
  
          const symbolRender = (
            <div className="flex items-center p-0.5 pr-4 text-white text-sm my-0.5">
              <img
                src={fromToken?.icon}
                alt=""
                className="rounded-full flex-shrink-0 w-5 h-5 mr-0.5 md:mr-2.5 lg:mr-2.5"
              />
  
              <span className="xs:text-white xs:ml-2 xs:font-bold">
                {symbolFrom} / {symbolTo}
              </span>
            </div>
          );
  
          const textRender = (
            <div className="flex items-center p-0.5 pr-4 text-white text-sm my-0.5">
              <span className="xs:text-white xs:ml-2 xs:font-bold">
                {symbolFrom} / {symbolTo}
              </span>
            </div>
          );
  
          const textNoColorRender = (
            <div className="flex items-center p-0.5 pr-4 text-sm my-0.5">
              <span className="xs:ml-2 xs:font-bold">
                {symbolFrom} / {symbolTo}
              </span>
            </div>
          );
  
          marketList.push({
            text: textRender,
            withSymbol: symbolRender,
            textNoColor: textNoColorRender,
            textId: symbol.symbol,
          });
        } else {
          const { symbolFrom } = parseSymbol(symbol.symbol);
          const toToken = allTokens[symbolFrom];

          const symbolRender = (
            <div className="flex items-center p-0.5 pr-4 text-white text-sm my-0.5">
              <img
                src={toToken?.icon}
                alt=""
                className="rounded-full flex-shrink-0 w-5 h-5 mr-0.5 md:mr-2.5 lg:mr-2.5"
              />

              <span className="xs:text-white xs:ml-2 xs:font-bold">
                {symbolFrom} PERP
              </span>
            </div>
          );

          const textRender = (
            <div className="flex items-center p-0.5 pr-4 text-white text-sm my-0.5">
              <span className="xs:text-white xs:ml-2 xs:font-bold">
                {symbolFrom} PERP
              </span>
            </div>
          );

          const textNoColorRender = (
            <div className="flex items-center p-0.5 pr-4 text-sm my-0.5">
              <span className="xs:ml-2 xs:font-bold">
                {symbolFrom} PERP
              </span>
            </div>
          );

          marketList.push({
            text: textRender,
            withSymbol: symbolRender,
            textNoColor: textNoColorRender,
            textId: symbol.symbol,
          });
        }
      });

    return marketList;
  };

  const marketList = generateMarketList();

  return {
    marketList,
    allTokens
  }
}