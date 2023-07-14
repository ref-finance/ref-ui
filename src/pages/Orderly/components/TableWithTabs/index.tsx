import React, { useEffect, useState } from 'react';
import { useOrderlyContext } from '../../orderly/OrderlyContext';

import { FlexRow, FlexRowBetween } from '../Common';
import 'react-circular-progressbar/dist/styles.css';
import {
  MobileFilter,
} from '../Common/Icons';
import Table from './Table';

import { useTokenInfo } from '../../orderly/state';
import { OrderAsset, useOrderlyPortfolioAssets } from '../AssetModal/state';

import {
  PortfolioTable
} from '../../orderly/type';
import {
  useClientMobile
} from '../../../../utils/device';

import { useIntl } from 'react-intl';
import _ from 'lodash';

export function SymbolWrapper({ symbol }: { symbol: string }) {
  return (
    <span className="text-v3SwapGray bg-menuMoreBgColor rounded px-2 text-10px">
      {symbol}
    </span>
  );
}

function TableWithTabs({ table, maintenance }: { table: PortfolioTable, maintenance: boolean }) {
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

  const nonOrderlyTokenInfo = useTokenInfo();
  const displayBalances: OrderAsset[] = useOrderlyPortfolioAssets(nonOrderlyTokenInfo);

  const { getData, id } = table.tabs[tab];

  useEffect(() => {
    setPage(1);
    getData && callGetData();
  }, [tab]);

  useEffect(() => {
    getData && callGetData();
  }, [page]);

  useEffect(() => {
    (getData && id === 'spot') && callGetData();
  }, [nonOrderlyTokenInfo]);

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
                    className={`px-5
                      ${tab === index
                        ? 'text-white relative'
                        : 'text-primaryOrderly relative'
                    }`}
                  >
                    {intl.formatMessage({
                      id: tableTab.id,
                      defaultMessage: tableTab.default,
                    })}

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

          {table.tabs[tab].filter && (
            <FlexRow className={'md:hidden lg:hidden'}>
              <div
                className="flex relative items-center justify-center pr-5"
                onClick={() => {
                  // todo
                  tab === 0
                    ? setMobileFilterOpen('open')
                    : setMobileFilterOpen('history');
                }}
              >
                <MobileFilter />
                {mobileFilterSize > 0 && (
                  <div className="absolute  -bottom-1 right-3 text-10px w-3 h-3 rounded-full flex items-center justify-center font-bold text-black bg-gradientFrom">
                    {mobileFilterSize}
                  </div>
                )}
              </div>
            </FlexRow>
          )}
        </FlexRowBetween>

        <div
          className={`flex items-center bg-acccountTab rounded-lg p-1 md:hidden lg:hidden`}
        >
          {table.tabs.map((tableTab, index) => (
            <label
              key={tableTab.id}
              onClick={() => {
                setLoading(true);
                setData([]);
                setTab(index);
              }}
              className={`flex items-center justify-center w-1/2 h-10 flex-grow text-base rounded-md  ${
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

        <div className="w-full rounded-2xl md:bg-cardBg lg:bg-cardBg py-5">
          <Table
            data={data || []}
            loading={loading}
            tableKey={table.tabs[tab].id}
            columns={table.tabs[tab].columns}
            tableRowType={table.tabs[tab].tableRowType}
            tableRowEmpty={table.tabs[tab].tableRowEmpty}
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
