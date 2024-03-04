import React, { useState, useEffect, useRef } from 'react';
import Big from 'big.js';
import { MdArrowDropDown } from '../../../../components/reactIcons';
import 'react-circular-progressbar/dist/styles.css';
import { validContract } from '../UserBoard';
import TableHeader from './TableHeader';
import { FutureTableFormCells } from './FuturesControls';
import { OrderlyLoading } from '../Common/Icons';
import { TextWrapper } from '../UserBoard';
import { formatTimeDate } from '../OrderBoard';
import { getOrderTrades } from '../../orderly/off-chain-api';
import {
  MyOrder,
  PortfolioTableColumns,
  OrderTrade,
  MarkPrice,
} from '../../orderly/type';
import { numberWithCommas } from '../../utiles';
import { scientificNotationToString } from '../../../../utils/numbers';
import { useWalletSelector } from '../../../../context/WalletSelectorContext';
import { useIntl } from 'react-intl';
import _ from 'lodash';

function OrderLine({
  order,
  columns,
  tableRowType,
  handleOpenClosing,
  page,
  futureOrders,
  markPrices,
}: {
  order: any;
  columns: PortfolioTableColumns[];
  tableRowType: string;
  handleOpenClosing?: (
    closingQuantity: number,
    closingPrice: number | 'Market',
    row: any
  ) => void;
  page: number;
  futureOrders?: MyOrder[];
  markPrices: MarkPrice[];
}) {
  const gridCol = columns.reduce(
    (acc, column) => acc + (column.colSpan ? column.colSpan : 1),
    0
  );
  const intl = useIntl();
  const { accountId } = useWalletSelector();

  const [closingQuantity, setClosingQuantity] = useState(
    Math.abs(order.position_qty)
  );
  const [closingPrice, setClosingPrice] = useState<'Market' | string>('Market');
  const [open, setOpen] = useState<boolean>(false);
  const [showFloatingBox, setShowFloatingBox] = useState(false);
  const [isFocus, setIsFocus] = useState<string>('');
  const [openFilledDetail, setOpenFilledDetail] = useState<boolean>(false);
  const [orderTradesHistory, setOrderTradesHistory] = useState<OrderTrade[]>();

  useEffect(() => {
    setOpenFilledDetail(false);
    setOrderTradesHistory(null);
  }, [page]);

  async function openTrades() {
    if (!!orderTradesHistory) {
      setOpenFilledDetail(!openFilledDetail);
      return;
    }
    if (!accountId) return;

    const res = await getOrderTrades({
      accountId,
      order_id: order.order_id,
    });
    if (!res.success) {
      return;
    }

    setOrderTradesHistory(res.data.rows);
    setOpenFilledDetail(!openFilledDetail);
  }

  return (
    <>
      <tr
        className={`table-fixed grid ${
          tableRowType === 'card'
            ? ' m-5 px-3 gap-2 rounded-xl bg-portfolioOrderCardColor hover:bg-portfolioBgColor'
            : ' gap-4 px-5 hover:bg-portfolioBgColor lg:border-t border-white border-opacity-10'
        } ${tableRowType === 'small' ? 'text-xs' : ''}`}
        style={{
          gridTemplateColumns: `repeat(${gridCol}, minmax(0, 1fr))`,
        }}
      >
        {columns.map((column, i) =>
          !column.customRender ? (
            <td
              key={`${column.key}-${i}`}
              className={`col-span-${
                column.colSpan ? column.colSpan : 1
              } flex items-center py-5 relative ${'break-words'}`}
            >
              <div
                className={`
                  flex items-center ${
                    column.textColor !== undefined
                      ? column.textColor
                      : 'text-white'
                  }
                  ${
                    column.render({ ...order }) === '-'
                      ? ' w-full text-center justify-center'
                      : ''
                  }
                  ${
                    column.key === '@price' || column.key === 'avg_price'
                      ? 'break-all'
                      : ''
                  }
                `}
              >
                {column.render({ ...order })}
              </div>
              {column.key === 'status' &&
                tableRowType === 'card' &&
                order.executed !== null &&
                order.executed > 0 && (
                  <div
                    className={`cursor-pointer  rounded-md  ml-2 ${
                      openFilledDetail ? 'bg-light1' : 'bg-symbolHover3'
                    }  w-5 h-5 flex items-center justify-center`}
                    onClick={() => {
                      openTrades();
                    }}
                  >
                    <div className="transform scale-95">
                      <MdArrowDropDown
                        size={22}
                        color={
                          openFilledDetail ? '#FFFFFF' : '#limitOrderInputColor'
                        }
                        className={`${
                          openFilledDetail ? 'transform rotate-180' : ''
                        } `}
                      />
                    </div>
                  </div>
                )}
            </td>
          ) : (
            <FutureTableFormCells
              key={`table-form-${order.symbol}`}
              position_qty={order.position_qty}
              mark_price={order.mark_price}
              closingQuantity={closingQuantity}
              setClosingQuantity={setClosingQuantity}
              closingPrice={closingPrice}
              setClosingPrice={setClosingPrice}
              open={open}
              setOpen={setOpen}
              handleOpenClosing={handleOpenClosing}
              row={order}
              showFloatingBox={showFloatingBox}
              setShowFloatingBox={setShowFloatingBox}
              isFocus={isFocus}
              setIsFocus={setIsFocus}
              futureOrders={futureOrders}
              markPrices={markPrices}
            />
          )
        )}
        {tableRowType === 'card' && openFilledDetail && (
          <td style={{ gridColumn: `span ${gridCol} / span ${gridCol}` }}>
            <table
              className={`table-fixed text-right flex-col items-end w-8/12`}
              // @ts-ignore
              align="right"
            >
              <thead
                className={`w-full text-xs grid-cols-6 justify-items-start  border-white mt-2 pb-3 pt-1 border-opacity-10  `}
              >
                <tr className="w-full">
                  <td className="">
                    {intl.formatMessage({
                      id: 'qty',
                      defaultMessage: 'Qty',
                    })}
                  </td>

                  <td className="">
                    {intl.formatMessage({
                      id: 'price',
                      defaultMessage: 'Price',
                    })}
                  </td>

                  <td className="">
                    {intl.formatMessage({
                      id: 'total',
                      defaultMessage: 'Total',
                    })}
                  </td>

                  <td className="">
                    <div className="flex items-center justify-end">
                      {intl.formatMessage({
                        id: 'fee_orderly',
                        defaultMessage: 'Fee',
                      })}
                      <TextWrapper
                        value={order.fee_asset}
                        className="ml-2 text-xs py-0 px-1"
                        textC="text-primaryText"
                      />
                    </div>
                  </td>

                  <td className="text-right pr-6" align="right" colSpan={2}>
                    {intl.formatMessage({
                      id: 'time',
                      defaultMessage: 'Time',
                    })}
                  </td>
                </tr>
              </thead>
              <tbody className="w-full">
                {orderTradesHistory.map((trade) => (
                  <tr
                    key={order.order_id + '_' + trade.id}
                    className="text-white  pb-2 "
                    style={{
                      height: '30px',
                    }}
                  >
                    <td className="font-nunito">
                      {numberWithCommas(trade.executed_quantity)}
                    </td>
                    <td className="font-nunito">
                      {numberWithCommas(trade.executed_price)}
                    </td>
                    <td className="font-nunito">
                      {numberWithCommas(
                        new Big(trade.executed_quantity || '0')
                          .times(new Big(trade.executed_price || '0'))
                          .toNumber()
                      )}
                    </td>
                    <td className="font-nunito">
                      {scientificNotationToString(trade.fee.toString())}
                    </td>

                    <td
                      className=" pr-6 py-3 font-nunito text-primaryOrderly "
                      align="right"
                      colSpan={2}
                    >
                      {formatTimeDate(trade.executed_timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </td>
        )}
      </tr>
    </>
  );
}

function Table({
  data,
  columns,
  loading,
  tableKey,
  defaultSort,
  total,
  page,
  tab,
  setPage,
  tableRowType,
  tableRowEmpty,
  tableTopComponent,
  pagination = true,
  mobileHeader,
  mobileRender,
  mobileRenderCustom,
  orderType,
  handleOpenClosing,
  futureOrders,
  markPrices,
  lastPrices,
  unrealMode,
}: {
  data: MyOrder[];
  loading: boolean;
  tableKey: string;
  defaultSort?: string | string[];
  columns: PortfolioTableColumns[];
  total: number;
  tab: number;
  page: number;
  setPage: (page: number) => void;
  tableRowType: string;
  tableRowEmpty?: string;
  tableTopComponent: JSX.Element;
  pagination: boolean;
  orderType?: number;
  mobileHeader: any;
  mobileRender: (row: any, secondData: any) => any;
  mobileRenderCustom?: boolean;
  handleOpenClosing?: (
    closingQuantity: number,
    closingPrice: number | 'Market',
    row: any
  ) => void;
  futureOrders?: MyOrder[];
  markPrices: MarkPrice[];
  lastPrices: {
    symbol: string;
    close: number;
  }[];
  unrealMode: 'mark_price' | 'last_price';
}) {
  const { accountId } = useWalletSelector();

  const [sort, setSort] = useState<[string | string[], 'asc' | 'dsc']>([
    defaultSort ? defaultSort : '',
    loading ? undefined : 'dsc',
  ]);

  useEffect(() => {
    defaultSort &&
      setSort([defaultSort ? defaultSort : '', loading ? undefined : 'dsc']);
  }, [tab]);

  const [customTotal, setCustomTotal] = useState<number | null>(null);

  const sortingFunc = (a: MyOrder, b: MyOrder) => {
    if (!Array.isArray(sort[0])) {
      if (sort[1] === 'asc') {
        return a[sort[0]] - b[sort[0]];
      } else {
        return b[sort[0]] - a[sort[0]];
      }
    } else {
      if (sort[0][0] === 'position_qty') {
        const c = a[sort[0][0]] * a[sort[0][1]];
        const d = b[sort[0][0]] * b[sort[0][1]];

        if (sort[1] === 'asc') {
          return c - d;
        } else {
          return d - c;
        }
      }

      if (sort[0][0] === 'symbol') {
        const priceA =
          unrealMode === 'mark_price'
            ? markPrices?.find((i) => i.symbol === a[sort[0][0]])?.price || 0
            : lastPrices?.find((i) => i.symbol === a[sort[0][0]])?.close || 0;
        const priceB =
          unrealMode === 'mark_price'
            ? markPrices?.find((i) => i.symbol === b[sort[0][0]])?.price || 0
            : lastPrices?.find((i) => i.symbol === b[sort[0][0]])?.close || 0;
        const c =
          a[sort[0][2]] >= 0
            ? (priceA - a[sort[0][1]]) * a[sort[0][2]]
            : (a[sort[0][1]] - priceA) * a[sort[0][2]] * -1;
        const d =
          b[sort[0][2]] >= 0
            ? (priceB - b[sort[0][1]]) * b[sort[0][2]]
            : (b[sort[0][1]] - priceB) * b[sort[0][2]] * -1;

        if (sort[1] === 'asc') {
          return c - d;
        } else {
          return d - c;
        }
      }
    }
  };

  const filterFunc = (order: any, index: number) => {
    let a = true;
    if (orderType === 1) {
      a = !order.symbol.includes('PERP');
    } else if (orderType === 2) {
      a = order.symbol.includes('PERP');
    }

    let b = true;
    if (tableKey === 'futures') {
      b = order.position_qty > 0 || order.position_qty < 0;
    }

    let c = true;

    return a && b && c;
  };

  const pagingFunc = (order: MyOrder, index: number) => {
    let a = true;
    if (orderType === 1) {
      a = index >= (page - 1) * 10 && index < page * 10;
    } else if (orderType === 2) {
      a = index >= (page - 1) * 10 && index < page * 10;
    }

    return a;
  };

  // useEffect(() => {
  //   if (orderType > 0) {
  //     setCustomTotal(data.filter(filterFunc).length);
  //   } else {
  //     setCustomTotal(null);
  //   }
  // }, [data]);

  const intl = useIntl();

  const gridCol = columns.reduce(
    (acc, column) => acc + (column.colSpan ? column.colSpan : 1),
    0
  );

  return (
    <>
      {/*pc view*/}
      <div className="w-full hidden md:block lg:block">
        {tableTopComponent}
        <table className="table-fixed w-full">
          {/* Header */}
          <thead
            className={`w-full xs:hidden table table-fixed  pl-5 pr-4 py-2 border-white border-opacity-10`}
          >
            <tr
              className={`w-full ${
                tableRowType === 'card'
                  ? `pl-8 ${tableKey === 'history' ? 'pr-10' : 'pr-12'}`
                  : 'px-5'
              } table-fixed grid gap-4`}
              style={{
                gridTemplateColumns: `repeat(${gridCol}, minmax(0, 1fr))`,
              }}
            >
              {columns.map((column, i) =>
                !column.customRender ? (
                  <TableHeader
                    key={`column-${i}`}
                    column={column}
                    loading={loading}
                    sort={sort}
                    setSort={setSort}
                  />
                ) : (
                  <React.Fragment key={`${tableKey}-form-header`}>
                    {column.headerRender()}
                  </React.Fragment>
                )
              )}
            </tr>
          </thead>
          <tbody className=" block flex-col" id="all-orders-body-open">
            {accountId && validContract() && loading ? (
              <tr
                className={`w-full relative mt-10 mb-4 px-5 table-fixed grid grid-cols-${gridCol} gap-4`}
                style={{ zIndex: 1 }}
              >
                <td className={`col-span-${gridCol} text-center`}>
                  <OrderlyLoading />
                </td>
              </tr>
            ) : data.filter(filterFunc).length === 0 ? (
              <tr
                className={`w-full mt-20 mb-4 px-5 table-fixed grid grid-cols-${gridCol} gap-4`}
              >
                <td
                  className={`col-span-${gridCol} text-center flex items-center justify-center flex-col text-primaryText`}
                >
                  <svg
                    className="mb-4"
                    width="53"
                    height="53"
                    viewBox="0 0 53 53"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g opacity="0.2">
                      <path
                        d="M52.8741 30.5661L46.2458 5.71241C46.0465 5.02172 45.6284 4.41438 45.0544 3.98162C44.4803 3.54887 43.7814 3.31407 43.0625 3.3125H9.9375C8.46344 3.3125 7.155 4.29962 6.75419 5.71241L0.125875 30.5661C0.0428979 30.8598 0.000545957 31.1635 0 31.4688L0 43.0625C0 44.8196 0.697989 46.5047 1.94042 47.7471C3.18285 48.9895 4.86794 49.6875 6.625 49.6875H46.375C48.1321 49.6875 49.8172 48.9895 51.0596 47.7471C52.302 46.5047 53 44.8196 53 43.0625V31.4688C53 31.1706 52.9586 30.8675 52.8741 30.5661ZM49.6875 43.0625C49.6875 44.8877 48.2002 46.375 46.375 46.375H6.625C4.79816 46.375 3.3125 44.8877 3.3125 43.0625V31.4688L9.93916 6.62334H43.0592L49.6875 31.4688V43.0625Z"
                        fill="#7E8A93"
                      />
                      <path
                        d="M39.3228 9.9375H13.6775C12.9272 9.9375 12.2696 10.4427 12.0759 11.1681L6.37008 31.0431C6.30488 31.2883 6.29688 31.5452 6.3467 31.794C6.39653 32.0428 6.50285 32.2768 6.65745 32.478C6.81206 32.6792 7.01082 32.8421 7.2384 32.9543C7.46598 33.0665 7.71629 33.1249 7.97002 33.125H15.5358L17.9324 37.9198C18.2082 38.4698 18.6316 38.9322 19.1551 39.2554C19.6787 39.5786 20.2818 39.7499 20.8971 39.75H32.1032C33.3587 39.75 34.5031 39.0411 35.0663 37.9198L37.4629 33.125H45.0286C45.2827 33.1252 45.5334 33.067 45.7613 32.9548C45.9893 32.8426 46.1883 32.6795 46.3432 32.4781C46.498 32.2767 46.6044 32.0424 46.6542 31.7932C46.704 31.5441 46.6958 31.2869 46.6302 31.0414L40.9244 11.1664C40.8302 10.8137 40.6221 10.502 40.3325 10.2798C40.0429 10.0575 39.6879 9.93719 39.3228 9.9375ZM40.2156 29.8125H37.4629C36.2008 29.8125 35.0663 30.5114 34.4998 31.6427L32.1032 36.4375H20.8971L18.5005 31.6427C18.2269 31.0912 17.8043 30.6275 17.2806 30.304C16.7569 29.9805 16.153 29.8103 15.5374 29.8125H8.83458L13.6775 11.5938H39.3228L44.1657 29.8125H40.2156Z"
                        fill="#7E8A93"
                      />
                    </g>
                  </svg>

                  <span className="opacity-20">
                    {intl.formatMessage({
                      id: tableRowEmpty ? tableRowEmpty : 'its_empty',
                      defaultMessage: 'It’s empty',
                    })}
                  </span>
                </td>
              </tr>
            ) : (
              data
                .filter(filterFunc)
                .sort(sortingFunc)
                .map((order, i) => {
                  return (
                    <OrderLine
                      key={`${tableKey}-order-${i}`}
                      order={order}
                      handleOpenClosing={handleOpenClosing}
                      columns={columns}
                      tableRowType={tableRowType}
                      page={page}
                      futureOrders={futureOrders || []}
                      markPrices={markPrices}
                    />
                  );
                })
            )}
          </tbody>
        </table>
      </div>
      {/*mobile view*/}
      <div className="w-full md:hidden lg:hidden">
        {!loading && (
          <div className={'flex justify-end mb-2'}>{mobileHeader}</div>
        )}
        {accountId && validContract() && loading ? (
          <div className="w-full relative mt-10 mb-4 px-5 gap-4">
            <div className="text-center">
              <OrderlyLoading />
            </div>
          </div>
        ) : data.filter(filterFunc).length === 0 ? (
          <div className="w-full mb-4 px-5 gap-4">
            <div className="text-center mt-20 flex flex-col justify-center items-center">
              <svg
                className="mb-4"
                width="53"
                height="53"
                viewBox="0 0 53 53"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g opacity="0.5">
                  <path
                    d="M52.8741 30.5661L46.2458 5.71241C46.0465 5.02172 45.6284 4.41438 45.0544 3.98162C44.4803 3.54887 43.7814 3.31407 43.0625 3.3125H9.9375C8.46344 3.3125 7.155 4.29962 6.75419 5.71241L0.125875 30.5661C0.0428979 30.8598 0.000545957 31.1635 0 31.4688L0 43.0625C0 44.8196 0.697989 46.5047 1.94042 47.7471C3.18285 48.9895 4.86794 49.6875 6.625 49.6875H46.375C48.1321 49.6875 49.8172 48.9895 51.0596 47.7471C52.302 46.5047 53 44.8196 53 43.0625V31.4688C53 31.1706 52.9586 30.8675 52.8741 30.5661ZM49.6875 43.0625C49.6875 44.8877 48.2002 46.375 46.375 46.375H6.625C4.79816 46.375 3.3125 44.8877 3.3125 43.0625V31.4688L9.93916 6.62334H43.0592L49.6875 31.4688V43.0625Z"
                    fill="#7E8A93"
                  />
                  <path
                    d="M39.3228 9.9375H13.6775C12.9272 9.9375 12.2696 10.4427 12.0759 11.1681L6.37008 31.0431C6.30488 31.2883 6.29688 31.5452 6.3467 31.794C6.39653 32.0428 6.50285 32.2768 6.65745 32.478C6.81206 32.6792 7.01082 32.8421 7.2384 32.9543C7.46598 33.0665 7.71629 33.1249 7.97002 33.125H15.5358L17.9324 37.9198C18.2082 38.4698 18.6316 38.9322 19.1551 39.2554C19.6787 39.5786 20.2818 39.7499 20.8971 39.75H32.1032C33.3587 39.75 34.5031 39.0411 35.0663 37.9198L37.4629 33.125H45.0286C45.2827 33.1252 45.5334 33.067 45.7613 32.9548C45.9893 32.8426 46.1883 32.6795 46.3432 32.4781C46.498 32.2767 46.6044 32.0424 46.6542 31.7932C46.704 31.5441 46.6958 31.2869 46.6302 31.0414L40.9244 11.1664C40.8302 10.8137 40.6221 10.502 40.3325 10.2798C40.0429 10.0575 39.6879 9.93719 39.3228 9.9375ZM40.2156 29.8125H37.4629C36.2008 29.8125 35.0663 30.5114 34.4998 31.6427L32.1032 36.4375H20.8971L18.5005 31.6427C18.2269 31.0912 17.8043 30.6275 17.2806 30.304C16.7569 29.9805 16.153 29.8103 15.5374 29.8125H8.83458L13.6775 11.5938H39.3228L44.1657 29.8125H40.2156Z"
                    fill="#7E8A93"
                  />
                </g>
              </svg>

              <span className="opacity-50">
                {intl.formatMessage({
                  id: tableRowEmpty ? tableRowEmpty : 'its_empty',
                  defaultMessage: 'It’s empty',
                })}
              </span>
            </div>
          </div>
        ) : (
          <>
            {!mobileRenderCustom &&
              data
                .filter(filterFunc)
                .sort(sortingFunc)
                .map((order) => mobileRender && mobileRender(order, null))}
            {mobileRenderCustom &&
              mobileRender(
                data.sort(sortingFunc).filter(filterFunc),
                futureOrders
              )}
          </>
        )}
      </div>

      {/* Pagination */}
      {!loading && data.filter(filterFunc).length > 0 && pagination && (
        <div className="flex justify-center mt-5">
          <div className="flex items-center">
            {/* Back to first page */}
            <div
              onClick={() => {
                page > 1 && setPage(1);
              }}
              className={page > 1 ? 'cursor-pointer' : ''}
            >
              <svg
                className="mx-1"
                width="10"
                height="13"
                viewBox="0 0 10 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g opacity={page > 1 ? '1' : '0.3'}>
                  <path
                    d="M2.77733 5.77071C2.35628 6.16574 2.35628 6.83426 2.77733 7.22928L6.31579 10.5491C6.95436 11.1482 8 10.6954 8 9.81976L8 3.18023C8 2.30462 6.95436 1.85185 6.31579 2.45095L2.77733 5.77071Z"
                    fill="#7E8A93"
                  />
                  <path
                    d="M1 3V10"
                    stroke="#7E8A93"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              </svg>
            </div>

            {/* Back */}
            <div
              onClick={() => {
                page > 1 && setPage(page - 1);
              }}
              className={page > 1 ? 'cursor-pointer' : ''}
            >
              <svg
                className="mx-1"
                width="6"
                height="9"
                viewBox="0 0 6 9"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  opacity={page > 1 ? '1' : '0.3'}
                  d="M0.777329 3.77071C0.356276 4.16574 0.356276 4.83426 0.777328 5.22928L4.31579 8.54905C4.95436 9.14816 6 8.69538 6 7.81976L6 1.18023C6 0.304619 4.95436 -0.148155 4.31579 0.450951L0.777329 3.77071Z"
                  fill="#7E8A93"
                />
              </svg>
            </div>

            <span>
              {(page - 1) * 10 + 1}-
              {(customTotal ? customTotal : total) > page * 10
                ? page * 10
                : customTotal
                ? customTotal
                : total}{' '}
              of {customTotal ? customTotal : total}
            </span>

            {/* Next */}
            <div
              onClick={() => {
                page < Math.ceil((customTotal ? customTotal : total) / 10) &&
                  setPage(page + 1);
              }}
              className={
                page < Math.ceil((customTotal ? customTotal : total) / 10)
                  ? 'cursor-pointer'
                  : ''
              }
            >
              <svg
                className="mx-1"
                width="6"
                height="9"
                viewBox="0 0 6 9"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  opacity={
                    page < Math.ceil((customTotal ? customTotal : total) / 10)
                      ? '1'
                      : '0.3'
                  }
                  d="M5.22267 3.77071C5.64372 4.16574 5.64372 4.83426 5.22267 5.22928L1.68421 8.54905C1.04564 9.14816 -4.6751e-07 8.69538 -4.29236e-07 7.81976L-1.39013e-07 1.18023C-1.00738e-07 0.304619 1.04564 -0.148155 1.68421 0.450951L5.22267 3.77071Z"
                  fill="#7E8A93"
                />
              </svg>
            </div>

            {/* Last page */}
            <div
              onClick={() => {
                page < Math.ceil((customTotal ? customTotal : total) / 10) &&
                  setPage(Math.ceil((customTotal ? customTotal : total) / 10));
              }}
              className={
                page < Math.ceil((customTotal ? customTotal : total) / 10)
                  ? 'cursor-pointer'
                  : ''
              }
            >
              <svg
                className="mx-1"
                width="10"
                height="13"
                viewBox="0 0 10 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g
                  opacity={
                    page < Math.ceil((customTotal ? customTotal : total) / 10)
                      ? '1'
                      : '0.3'
                  }
                >
                  <path
                    d="M7.22267 5.77071C7.64372 6.16574 7.64372 6.83426 7.22267 7.22928L3.68421 10.5491C3.04564 11.1482 2 10.6954 2 9.81976L2 3.18023C2 2.30462 3.04564 1.85185 3.68421 2.45095L7.22267 5.77071Z"
                    fill="#7E8A93"
                  />
                  <path
                    d="M9 3V10"
                    stroke="#7E8A93"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
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
