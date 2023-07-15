import React, { useEffect, useState } from 'react';

import { FlexRow, FlexRowBetween } from '../Common';
import 'react-circular-progressbar/dist/styles.css';
import { MobileFilter } from '../Common/Icons';
import Table from './Table';

import { OrderAsset } from '../AssetModal/state';

import { PortfolioTable } from '../../orderly/type';
import { useClientMobile } from '../../../../utils/device';

import { useIntl } from 'react-intl';
import _ from 'lodash';

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
  displayBalances
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
  displayBalances: OrderAsset[];
}) {
  const intl = useIntl();

  const [mobileFilterOpen, setMobileFilterOpen] = useState<
    'open' | 'history' | undefined
  >(undefined);
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
    getData && callGetData();
  }, [tab]);

  useEffect(() => {
    getData && callGetData();
  }, [page]);

  useEffect(() => {
    if (getData && (id === 'open_orders' || id === 'history')) {
      callGetData();
    }
  }, [refOnly, orderType, chooseMarketSymbol, chooseOrderSide]);

  useEffect(() => {
    if (getData && (id === 'spot')) {
      callGetData();
    }
  }, [displayBalances]);

  const callGetData = async () => {
    const { data } = await getData({ page });

    if (!data && id === 'spot') {
      setData(displayBalances);
      setLoading(false);
      return
    }

    setData(data.rows || []);
    setTotal(data.meta?.total || 0);
    setLoading(false);
  }

  const [mobileFilterSize, setMobileFilterSize] = useState<number>(0);

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
                    setLoading(true);
                    setData([]);
                    setTab(index);
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
            className={`flex items-center bg-acccountTab p-1 rounded-lg ${table.tabs[tab].filter ? 'w-11/12 inline-flex' : ''}`}
          >
            {table.tabs.map((tableTab, index) => (
              <label
                key={tableTab.id}
                onClick={() => {
                  setLoading(true);
                  setData([]);
                  setTab(index);
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
                onClick={() => {
                  // todo
                  tab === 0
                    ? setMobileFilterOpen('open')
                    : setMobileFilterOpen('history');
                }}
              >
                <MobileFilter />
                {mobileFilterSize > 0 && (
                  <div className="absolute  -bottom-1 right-3 text-10px w-3 h-3 rounded-full flex items-center justify-center gotham_bold text-black bg-gradientFrom">
                    {mobileFilterSize}
                  </div>
                )}
              </div>
            </FlexRow>
          )}
        </div>


        <div className="w-full rounded-2xl md:bg-cardBg lg:bg-cardBg py-5">
          <Table
            data={data || []}
            loading={loading}
            tableKey={table.tabs[tab].id}
            columns={table.tabs[tab].columns}
            tableRowType={table.tabs[tab].tableRowType}
            tableRowEmpty={table.tabs[tab].tableRowEmpty}
            tableTopComponent={table.tabs[tab].tableTopComponent}
            mobileRender={table.tabs[tab].mobileRender}
            total={total}
            page={page}
            setPage={setPage}
            maintenance={maintenance}
            pagination={!table.tabs[tab].pagination ? table.tabs[tab].pagination : true}
          />
        </div>
      </div>
    </>
  );
}
export default TableWithTabs;
