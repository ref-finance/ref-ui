import React, { useEffect, useState } from 'react';
import { useOrderlyContext } from '../../orderly/OrderlyContext';

import { FlexRow, FlexRowBetween } from '../Common';
import 'react-circular-progressbar/dist/styles.css';
import {
  MobileFilter,
} from '../Common/Icons';
import Table from './Table';

import { useAllSymbolInfo } from './state';

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

function TableWithTabs({ table }: { table: PortfolioTable }) {

  const [mobileFilterOpen, setMobileFilterOpen] = useState<
    'open' | 'history' | undefined
  >(undefined);
  const [data, setData] = useState<any>([])
  const [total, setTotal] = useState(0);

  const isMobile = useClientMobile();

  const [tab, setTab] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setPage(1);
    table.tabs[tab].getData && callGetData();
  }, [tab]);

  useEffect(() => {
    table.tabs[tab].getData && callGetData();
  }, [page]);

  const callGetData = async () => {
    const { data } = await table.tabs[tab].getData({ page });

    setData(data.rows || []);
    setTotal(data.meta?.total || 0);
    setLoading(false);
  }

  const intl = useIntl();

  const [mobileFilterSize, setMobileFilterSize] = useState<number>(0);

  return (
    <>
      <div
        className="w-full relative mt-10 xs:mt-5 lg:rounded-2xl shadow-sm  xs:bg-mobileOrderListBg md:border-none xs:border-none  text-primaryOrderly text-sm lg:bg-black  lg:bg-opacity-10 pb-4"
        style={{
          minHeight: isMobile ? '' : 'calc(100vh - 680px)',
        }}
      >
        <span className="text-white gotham_bold text-lg px-5">{table.title}</span>
        <FlexRowBetween className="pb-3 xs:mb-5 xs:bg-mobileOrderListTab py-3 rounded-t-2xl xs:px-0 xs:py-0 px-5 mt-0 border-white border-opacity-10">
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
                  className={`justify-center xs:py-3 xs:px-5 ${
                    tab === index
                      ? 'xs:bg-mobileOrderListBg'
                      : 'xs:bg-mobileOrderListTab'
                  } cursor-pointer`}
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

                    {tab === index && !isMobile && (
                      <div className="h-0.5 bg-gradientFromHover rounded-lg w-full absolute -bottom-5 left-0"></div>
                    )}
                  </span>
                </FlexRow>
              ))}
            </FlexRow>
            
            {table.tabs[tab].rightComp && table.tabs[tab].rightComp}
          </FlexRowBetween>

          <FlexRow className={'lg:hidden'}>
            <div
              className="flex relative items-center justify-center pr-5"
              onClick={() => {
                // todo
                tab === 0
                  ? setMobileFilterOpen('open')
                  : setMobileFilterOpen('history');
              }}
            >
              <MobileFilter></MobileFilter>
              {mobileFilterSize > 0 && (
                <div className="absolute  -bottom-1 right-3 text-10px w-3 h-3 rounded-full flex items-center justify-center font-bold text-black bg-gradientFrom">
                  {mobileFilterSize}
                </div>
              )}
            </div>
          </FlexRow>
        </FlexRowBetween>

        <div className="w-full rounded-2xl bg-cardBg py-5">
          <Table
            data={data || []}
            loading={loading}
            tableKey={table.tabs[tab].id}
            columns={table.tabs[tab].columns}
            tableRowType={table.tabs[tab].tableRowType}
            total={total}
            page={page}
            setPage={setPage}
            pagination={!table.tabs[tab].pagination ? table.tabs[tab].pagination : true}
          />
        </div>
      </div>
    </>
  );
}
export default TableWithTabs;
