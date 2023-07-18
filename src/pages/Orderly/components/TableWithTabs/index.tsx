import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import _ from 'lodash';

import 'react-circular-progressbar/dist/styles.css';
import Table from './Table';
import { FlexRow, FlexRowBetween } from '../Common';
import { MobileFilter } from '../Common/Icons';
import { OrderAsset } from '../AssetModal/state';
import { useMarketlist } from '../../orderly/constantWjsx';

import { PortfolioTable } from '../../orderly/type';
import { useClientMobile } from '../../../../utils/device';

export function SymbolWrapper({ symbol }: { symbol: string }) {
  return (
    <span className="text-v3SwapGray bg-menuMoreBgColor rounded px-2 text-10px">
      {symbol}
    </span>
  );
}

function TableWithTabs({
  table,
  maintenance,
  refOnly,
  orderType,
  setOrderType,
  chooseMarketSymbol,
  setChooseMarketSymbol,
  chooseOrderSide,
  setChooseOrderSide,
  chooseOrderStatus,
  setChooseOrderStatus,
  chooseOrderType,
  setChooseOrderType,
  displayBalances,
  newPositions,
  triggerBalanceBasedData,
  triggerPositionBasedData,
  setMobileFilterOpen,
  handleOpenClosing,
  validAccountSig
} : {
  table: PortfolioTable;
  maintenance: boolean;
  refOnly?: boolean;
  orderType?: number;
  setOrderType?: (item: number) => void;
  chooseMarketSymbol?: string;
  setChooseMarketSymbol?: (item: string) => void;
  chooseOrderSide?: 'all_side' | 'BUY' | 'SELL';
  setChooseOrderSide?: (item: 'all_side' | 'BUY' | 'SELL') => void;
  chooseOrderStatus?: 'all' | 'Cancelled' | 'filled' | 'Rejected';
  setChooseOrderStatus?: (item: 'all' | 'Cancelled' | 'filled' | 'Rejected') => void;
  chooseOrderType?: 'all' | 'limit' | 'market';
  setChooseOrderType?: (item: 'all' | 'limit' | 'market') => void;
  newPositions?: any;
  displayBalances: OrderAsset[];
  triggerBalanceBasedData?: number;
  triggerPositionBasedData?: number;
  setMobileFilterOpen?: (item: number) => void;
  handleOpenClosing?: (closingQuantity: number, closingPrice: number | 'Market', row: any) => void;
  validAccountSig: boolean;
}) {
  const intl = useIntl();
  const { marketList } = useMarketlist();
  
  const [data, setData] = useState<any>([])
  const [total, setTotal] = useState(0);

  const isMobile = useClientMobile();

  const [tab, setTab] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  const { getData, id } = table.tabs[tab];

  useEffect(() => {
    setPage(1);
    setOrderType && setOrderType(0);
    setChooseMarketSymbol && setChooseMarketSymbol('all_markets');
    setChooseOrderSide && setChooseOrderSide('all_side');
    setChooseOrderStatus && setChooseOrderStatus('all');
    setChooseOrderType && setChooseOrderType('all');
    getData && callGetData();
  }, [tab]);

  useEffect(() => {
    getData && callGetData();
  }, [page, validAccountSig]);

  useEffect(() => {
    if (orderType === 0 && (id === 'open_orders' || id === 'history')) {
      setLoading(true);
      setData([]);
      callGetData();
    }
    setPage(1);
  }, [orderType]);

  useEffect(() => {
    if (getData && (id === 'open_orders' || id === 'history')) {
      callGetData();
    }
  }, [refOnly, orderType, chooseMarketSymbol, chooseOrderSide, chooseOrderStatus, chooseOrderType]);

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

  useEffect(() => {
    if (getData && (id === 'deposit' || id === 'withdraw' || id === 'settlements')) {
      callGetData();
    }
  }, [triggerBalanceBasedData]);

  useEffect(() => {
    if (getData && (id === 'open_orders' || id === 'history')) {
      callGetData();
    }
  }, [triggerPositionBasedData, triggerBalanceBasedData]);

  const callGetData = async () => {
    const { data } = await getData({ page });

    if (!data && id === 'spot') {
      setData(displayBalances);
      setLoading(false);
      return
    }

    if (id === 'futures') {
      setData(newPositions.rows);
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
        <span className="text-white gotham_bold text-lg px-5 hidden md:block lg:block">{table.title}</span>
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

        <div className="md:hidden lg:hidden">
          <div
            className={`relative flex items-center bg-acccountTab p-1 rounded-lg ${table.tabs[tab].filter ? 'w-11/12 inline-flex' : ''}`}
          >
            {table.tabs.map((tableTab, index) => (
              <label
                key={tableTab.id}
                onClick={() => {
                  if (tab !== index) {
                    setLoading(true);
                    setData([]);
                    setTab(index);
                  }
                }}
                className={`flex items-center justify-center w-1/2 py-1 flex-grow text-sm rounded-md  ${
                  tab === index
                    ? 'text-white bg-acccountBlock'
                    : 'text-primaryText'
                }`}
              >
                <span className="hidden md:block lg:block">
                  {intl.formatMessage({
                    id: tableTab.id,
                    defaultMessage: tableTab.default,
                  })}
                </span>
                <span className="md:hidden lg:hidden">
                  {intl.formatMessage({
                    id: tableTab.mobileKey ? tableTab.mobileKey : tableTab.id,
                    defaultMessage: tableTab.default,
                  })}
                </span>
              </label>
            ))}
          </div>

          {table.tabs[tab].filter && (
            <FlexRow className={'md:hidden lg:hidden inline-flex w-1/12 justify-center'}>
              <div
                className="flex relative items-center justify-center"
                onClick={() => setMobileFilterOpen(tab + 1)}
              >
                <MobileFilter />
              </div>
            </FlexRow>
          )}
        </div>
    


        <div className="w-full rounded-2xl md:bg-cardBg lg:bg-cardBg py-5">
          {(table.tabs[tab].filter && (chooseMarketSymbol !== 'all_markets' || chooseOrderSide !== 'all_side' || chooseOrderType !== 'all' || chooseOrderStatus !== 'all')) && (
            <FlexRow className={'md:hidden lg:hidden px-3 pb-1 inline-flex w-full justify-between'}>
              <div className="p-2" style={{ flex: '0 0 100px' }}>
                {intl.formatMessage({
                  id: 'filter',
                  defaultMessage: 'Filter',
                })}
              </div>
              <div className="ml-auto flex items-center justify-between">
                {chooseMarketSymbol !== 'all_markets' && (
                  <div className="flex items-center p-2">
                    {marketList.find((m) => m.textId === chooseMarketSymbol)?.textNoColor}
                    <div
                      className="ml-1.5 cursor-pointer"
                      onClick={() => setChooseMarketSymbol('all_markets')}
                    >
                      <OffFilterIcon />
                    </div>
                  </div>
                )}
                {chooseOrderType !== 'all' && (
                  <div className="flex items-center capitalize p-2">
                    {chooseOrderType}
                    <div
                      className="ml-1.5 cursor-pointer"
                      onClick={() => setChooseOrderType('all')}
                    >
                      <OffFilterIcon />
                    </div>
                  </div>
                )}
                {chooseOrderSide !== 'all_side' && (
                  <div className="flex items-center capitalize p-2">
                    {chooseOrderSide}
                    <div
                      className="ml-1.5 cursor-pointer"
                      onClick={() => setChooseOrderSide('all_side')}
                    >
                      <OffFilterIcon />
                    </div>
                  </div>
                )}
                {chooseOrderStatus !== 'all' && (
                  <div className="flex items-center capitalize p-2">
                    {chooseOrderStatus?.toLowerCase().replace('_', ' ')}
                    <div
                      className="ml-1.5 cursor-pointer"
                      onClick={() => setChooseOrderStatus('all')}
                    >
                      <OffFilterIcon />
                    </div>
                  </div>
                )}
              </div>
            </FlexRow>
          )}
          <Table
            data={data || []}
            loading={loading}
            tableKey={table.tabs[tab].id}
            columns={table.tabs[tab].columns}
            tableRowType={table.tabs[tab].tableRowType}
            tableRowEmpty={table.tabs[tab].tableRowEmpty}
            tableTopComponent={table.tabs[tab].tableTopComponent}
            mobileRender={table.tabs[tab].mobileRender}
            mobileRenderCustom={table.tabs[tab].mobileRenderCustom}
            total={total}
            page={page}
            setPage={setPage}
            maintenance={maintenance}
            pagination={!table.tabs[tab].pagination ? table.tabs[tab].pagination : true}
            orderType={orderType}
            handleOpenClosing={handleOpenClosing}
          />
        </div>
      </div>
    </>
  );
}

const OffFilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="8" fill="#182935"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M5.14765 6.32208C4.85476 6.02918 4.85476 5.55431 5.14765 5.26142C5.44054 4.96852 5.91542 4.96852 6.20831 5.26142L7.99289 7.046L9.77748 5.26142C10.0704 4.96852 10.5452 4.96852 10.8381 5.26142C11.131 5.55431 11.131 6.02918 10.8381 6.32208L9.05355 8.10666L10.7037 9.7568C10.9966 10.0497 10.9966 10.5246 10.7037 10.8175C10.4108 11.1104 9.93593 11.1104 9.64303 10.8175L7.99289 9.16732L6.34276 10.8175C6.04986 11.1104 5.57499 11.1104 5.2821 10.8175C4.9892 10.5246 4.9892 10.0497 5.2821 9.7568L6.93223 8.10666L5.14765 6.32208Z" fill="#7E8A93"/>
  </svg>
)


export default TableWithTabs;
