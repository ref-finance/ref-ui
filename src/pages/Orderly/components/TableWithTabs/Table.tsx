import React, { useState } from 'react';

import { parseSymbol } from '../RecentTrade';
import 'react-circular-progressbar/dist/styles.css';
import {
  MyOrder,
  TokenMetadata,
  PortfolioTableColumns
} from '../../orderly/type';
import {
  OrderlyLoading
} from '../Common/Icons';
import TableHeader from './TableHeader';

import { useIntl } from 'react-intl';
import _ from 'lodash';

function OrderLine({
  order,
  columns,
  tableRowType
}: {
  order: MyOrder;
  columns: PortfolioTableColumns[];
  tableRowType: string;
}) {

  const [openEditQuantity, setOpenEditQuantity] = useState<boolean>(false);

  const [openEditPrice, setOpenEditPrice] = useState<boolean>(false);

  const [isCancelled, setIsCancelled] = useState<boolean>(false);


  function getVerticalAlign() {
    const el = document.querySelector(`#order-line-${order.order_id}`);
    if (!el) return;
    if (openEditQuantity || openEditPrice) {
      return 'baseline';
    }
  }

  if (isCancelled) return null;

  const gridCol = columns.reduce((acc, column) => acc + (column.colSpan ? column.colSpan : 1), 0);

  return (
    <>
      <tr
        className={`table-fixed grid grid-cols-${gridCol} ${tableRowType === 'card' ? ' m-2 px-3 gap-2 rounded-xl' : ' gap-4 px-5 lg:border-t border-white border-opacity-10'}`}
        style={{
          verticalAlign: getVerticalAlign(),
          backgroundColor: tableRowType === 'card' ? '#7E8A931A' : ''
        }}
      >
          {columns.map((column, i) => (
            <td
              key={column.key}
              className={`col-span-${column.colSpan ? column.colSpan : 1} flex items-center py-5 pr-2 relative`}
            >
              <div className={`flex items-center ${column.textColor !== undefined ? column.textColor : 'text-white'}`}>
                {column.render({ ...order })}
              </div>
            </td>
          ))}
        
      </tr>
    </>
  );
}

function Table({
  data,
  columns,
  loading,
  tableKey,
  total,
  page,
  setPage,
  tableRowType,
  pagination = true
}: {
  data: MyOrder[];
  loading: boolean;
  tableKey: string;
  columns: PortfolioTableColumns[];
  total: number;
  page: number;
  setPage: (page: number) => void;
  tableRowType: string;
  pagination: boolean;
}) {

  const [chooseSide, setChooseSide] = useState<'Both' | 'Buy' | 'Sell'>('Both');

  const [sort, setSort] = useState<[string, 'asc' | 'dsc']>([ '', loading ? undefined : 'dsc' ]);

  const sortingFunc = (a: MyOrder, b: MyOrder) => {
    if (sort[1] === 'asc') {
      return a[sort[0]] - b[sort[0]];
    } else {
      return b[sort[0]] - a[sort[0]];
    }
  };

  const filterFunc = (order: MyOrder) => {
    const a =
      chooseSide === 'Both' ||
      order.side.toLowerCase() === chooseSide.toLowerCase();

    return a;
  };

  const intl = useIntl();

  const gridCol = columns.reduce((acc, column) => acc + (column.colSpan ? column.colSpan : 1), 0);

  return (
    <>

      <table className="table-fixed w-full">
        {/* Header */}
        <thead
          className={`w-full xs:hidden table table-fixed  pl-5 pr-4 py-2 border-white border-opacity-10`}
          style={{
            width: 'calc(100% - 9px)',
          }}
        >
          <tr className={`w-full px-5 table-fixed grid grid-cols-${gridCol} gap-4`}>

            {columns.map((column, i) => (
              <TableHeader
                key={column.key}
                column={column}
                loading={loading}
                sort={sort}
                setSort={setSort}
              />
            ))}
          </tr>
        </thead>
        <tbody
          className=" block overflow-auto  flex-col "
          id="all-orders-body-open"
        >
          {loading ? (
            <tr className={`w-full mt-10 mb-4 px-5 table-fixed grid grid-cols-${gridCol} gap-4`}>
              <td className={`col-span-${gridCol} text-center`}>
                <OrderlyLoading />
              </td>
            </tr>
          ) : data.filter(filterFunc).length === 0 ? (
            <tr className={`w-full mt-10 mb-4 px-5 table-fixed grid grid-cols-${gridCol} gap-4`}>
              <td className={`col-span-${gridCol} text-center`}>
                {intl.formatMessage({
                  id: 'no_orders_found',
                  defaultMessage: 'No orders found',
                })}
              </td>
            </tr>
          ) : (
            data
              .sort(sortingFunc)
              .filter(filterFunc)
              .map((order, i) => {
                return (
                  <OrderLine
                    order={order}
                    key={`${tableKey}-order-${i}`}
                    columns={columns}
                    tableRowType={tableRowType}
                  />
                );
              })
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {(!loading && data.filter(filterFunc).length > 0 && pagination) && (
        <div className="flex justify-center mt-5">
          <div className="flex items-center">

            {/* Back to first page */}
            <div
              onClick={() => {
                page > 1 && setPage(1)
              }}
              className={page > 1 ? 'cursor-pointer' : ''}
            >
              <svg className="mx-1" width="10" height="13" viewBox="0 0 10 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g opacity={page > 1 ? '1' : '0.3'}>
                  <path d="M2.77733 5.77071C2.35628 6.16574 2.35628 6.83426 2.77733 7.22928L6.31579 10.5491C6.95436 11.1482 8 10.6954 8 9.81976L8 3.18023C8 2.30462 6.95436 1.85185 6.31579 2.45095L2.77733 5.77071Z" fill="#7E8A93"/>
                  <path d="M1 3V10" stroke="#7E8A93" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
              </svg>
            </div>

            {/* Back */}
            <div
              onClick={() => {
                page > 1 && setPage(page - 1)
              }}
              className={page > 1 ? 'cursor-pointer' : ''}
            >
              <svg className="mx-1" width="6" height="9" viewBox="0 0 6 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path opacity={page > 1 ? '1' : '0.3'} d="M0.777329 3.77071C0.356276 4.16574 0.356276 4.83426 0.777328 5.22928L4.31579 8.54905C4.95436 9.14816 6 8.69538 6 7.81976L6 1.18023C6 0.304619 4.95436 -0.148155 4.31579 0.450951L0.777329 3.77071Z" fill="#7E8A93"/>
              </svg>
            </div>

            <span>{((page - 1) * 10) + 1}-{((total > page * 10) ? page * 10 : total)} of {total}</span>

            {/* Next */}
            <div
              onClick={() => {
                page < Math.ceil(total / 10) && setPage(page + 1)
              }}
              className={page < Math.ceil(total / 10) ? 'cursor-pointer' : ''}
            >
              <svg className="mx-1" width="6" height="9" viewBox="0 0 6 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path opacity={page < Math.ceil(total / 10) ? '1' : '0.3'} d="M5.22267 3.77071C5.64372 4.16574 5.64372 4.83426 5.22267 5.22928L1.68421 8.54905C1.04564 9.14816 -4.6751e-07 8.69538 -4.29236e-07 7.81976L-1.39013e-07 1.18023C-1.00738e-07 0.304619 1.04564 -0.148155 1.68421 0.450951L5.22267 3.77071Z" fill="#7E8A93"/>
              </svg>
            </div>

            {/* Last page */}
            <div
              onClick={() => {
                page < Math.ceil(total / 10) && setPage(Math.ceil(total / 10))
              }}
              className={page < Math.ceil(total / 10) ? 'cursor-pointer' : ''}
            >
              <svg className="mx-1"  width="10" height="13" viewBox="0 0 10 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g opacity={page < Math.ceil(total / 10) ? '1' : '0.3'}>
                  <path d="M7.22267 5.77071C7.64372 6.16574 7.64372 6.83426 7.22267 7.22928L3.68421 10.5491C3.04564 11.1482 2 10.6954 2 9.81976L2 3.18023C2 2.30462 3.04564 1.85185 3.68421 2.45095L7.22267 5.77071Z" fill="#7E8A93"/>
                  <path d="M9 3V10" stroke="#7E8A93" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
              </svg>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Table;