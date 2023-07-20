import React, { useState, useEffect, useRef } from 'react';

import 'react-circular-progressbar/dist/styles.css';
import {
  RegisterModal,
  validContract,
  REF_ORDERLY_ACCOUNT_VALID,
  REF_ORDERLY_AGREE_CHECK,
} from '../UserBoard';
import { FutureTableFormCells } from './FuturesControls';
import { MyOrder, PortfolioTableColumns } from '../../orderly/type';
import { useOrderlyContext } from '../../orderly/OrderlyContext';
import { RefToOrderly, OrderlyLoading } from '../Common/Icons';
import TableHeader from './TableHeader';
import { useWalletSelector } from '../../../../context/WalletSelectorContext';
import { CheckBox, ConnectWallet, ErrorTip, RegisterButton } from '../Common';

import { ConfirmButton } from '../Common/index';

import {
  is_orderly_key_announced,
  is_trading_key_set,
} from '../../orderly/on-chain-api';
import { announceKey, setTradingKey, storageDeposit } from '../../orderly/api';
import { useIntl } from 'react-intl';
import _, { set } from 'lodash';

function OrderLine({
  order,
  columns,
  tableRowType,
  handleOpenClosing
}: {
  order: any;
  columns: PortfolioTableColumns[];
  tableRowType: string;
  handleOpenClosing?: (closingQuantity: number, closingPrice: number | 'Market', row: any) => void;
}) {
  const gridCol = columns.reduce(
    (acc, column) => acc + (column.colSpan ? column.colSpan : 1),
    0
  );

  const [closingQuantity, setClosingQuantity] = useState(Math.abs(order.position_qty));
  const [closingPrice, setClosingPrice] = useState<'Market' | number>('Market');
  const [open, setOpen] = useState<boolean>(false);
  const [showFloatingBox, setShowFloatingBox] = useState(true);
  const [isFocus, setIsFocus] = useState<string>('');


  return (
    <>
      <tr
        className={`table-fixed grid ${
          tableRowType === 'card'
            ? ' m-2 px-3 gap-4 rounded-xl'
            : ' gap-4 px-5 lg:border-t border-white border-opacity-10'
        } ${tableRowType === 'small' ? 'text-xs' : ''}`}
        style={{
          backgroundColor: tableRowType === 'card' ? '#7E8A931A' : '',
          gridTemplateColumns: `repeat(${gridCol}, minmax(0, 1fr))`
        }}
      >
        {columns.map((column, i) => !column.customRender ? (
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
                `}
            >
              {column.render({ ...order })}
            </div>
          </td>
        ): (
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
          />
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
  tableRowEmpty,
  tableTopComponent,
  pagination = true,
  mobileRender,
  mobileRenderCustom,
  orderType,
  mobileFooter,
  maintenance,
  handleOpenClosing
}: {
  data: MyOrder[];
  loading: boolean;
  tableKey: string;
  columns: PortfolioTableColumns[];
  total: number;
  page: number;
  setPage: (page: number) => void;
  tableRowType: string;
  tableRowEmpty?: string;
  tableTopComponent: JSX.Element;
  pagination: boolean;
  orderType?: number;
  mobileRender: (row: any) => any;
  mobileRenderCustom?: boolean;
  mobileFooter?: JSX.Element;
  maintenance: boolean;
  handleOpenClosing?: (closingQuantity: number, closingPrice: number | 'Market', row: any) => void;
}) {
  const {
    storageEnough,
    setValidAccountSig,
    handlePendingOrderRefreshing,
    userExist,
    validAccountSig,
  } = useOrderlyContext();
  const { accountId, modal } = useWalletSelector()

  const [sort, setSort] = useState<[string | string[], 'asc' | 'dsc']>([
    '',
    loading ? undefined : 'dsc',
  ]);

  const [tradingKeySet, setTradingKeySet] = useState<boolean>(false);
  const [keyAnnounced, setKeyAnnounced] = useState<boolean>(false);
  const [agreeCheck, setAgreeCheck] = useState<boolean>(false);
  const [registerModalOpen, setRegisterModalOpen] = useState<boolean>(false);
  const [customTotal, setCustomTotal] = useState<number | null>(null);

  const storedValid = localStorage.getItem(REF_ORDERLY_ACCOUNT_VALID);

  useEffect(() => {
    if (!accountId || !storageEnough) return;

    if (!!storedValid) {
      setValidAccountSig(true);
      setKeyAnnounced(true);
      setTradingKeySet(true);

      return;
    }

    is_orderly_key_announced(accountId, true)
      .then(async (key_announce) => {
        setKeyAnnounced(key_announce);
        if (!key_announce) {
          const res = await announceKey(accountId).then((res) => {
            setKeyAnnounced(true);
          });
        } else return;
      })
      .then(() => {
        is_trading_key_set(accountId).then(async (trading_key_set) => {
          setTradingKeySet(trading_key_set);
          if (!trading_key_set) {
            await setTradingKey(accountId).then(() => {
              setTradingKeySet(true);
            });
          }
        });
      })
      .catch((e) => {
        setKeyAnnounced(false);
        setTradingKeySet(false);
        setValidAccountSig(false);

        localStorage.removeItem(REF_ORDERLY_ACCOUNT_VALID);
      });
  }, [accountId, storageEnough, agreeCheck]);

  useEffect(() => {
    if (!tradingKeySet || !keyAnnounced) return;

    localStorage.setItem(REF_ORDERLY_ACCOUNT_VALID, '1');
    if (userExist) {
      localStorage.removeItem(REF_ORDERLY_AGREE_CHECK);
    }

    handlePendingOrderRefreshing();

    setValidAccountSig(true);
  }, [tradingKeySet, keyAnnounced]);

  const sortingFunc = (a: MyOrder, b: MyOrder) => {
    if (!Array.isArray(sort[0])) {
      if (sort[1] === 'asc') {
        return a[sort[0]] - b[sort[0]];
      } else {
        return b[sort[0]] - a[sort[0]];
      }
    } else {
      const c = a[sort[0][0]] * a[sort[0][1]];
      const d = b[sort[0][0]] * b[sort[0][1]];

      if (sort[1] === 'asc') {
        return c - d;
      } else {
        return d - c;
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

    return a && b;
  };

  const pagingFunc = (order: MyOrder, index: number) => {
    let a = true;
    if (orderType === 1) {
      a = (index >= ((page - 1) * 10) && index < (page * 10));
    } else if (orderType === 2) {
      a = (index >= ((page - 1) * 10) && index < (page * 10));;
    }

    return a;
  };

  useEffect(() => {
    if (orderType > 0) {
      setCustomTotal(data.filter(filterFunc).length);
    } else {
      setCustomTotal(null);
    }
  }, [data])

  const intl = useIntl();

  const validator =
    !accountId ||
    !storageEnough ||
    !tradingKeySet ||
    !keyAnnounced ||
    !validContract() ||
    maintenance;

  const gridCol = columns.reduce(
    (acc, column) => acc + (column.colSpan ? column.colSpan : 1),
    0
  );

  return (
    <div className="relative">
      {validator && !maintenance && !validAccountSig && (
        <div
          className="absolute flex flex-col justify-center items-center h-full w-full top-0 left-0 "
          style={{
            background: 'rgba(0, 19, 32, 0.8)',
            backdropFilter: 'blur(5px)',
            zIndex: 50,
          }}
        >
          <div className="hidden md:block lg:block">
            <RefToOrderly />
          </div>

          {!accountId && (
            <div className="w-half md:w-full lg:w-full flex justify-center flex-col items-center">
              <div className="md:hidden lg:hidden text-center mb-6">
                <p>Welcome!</p>
                <p>Connect your wallet to start</p>
              </div>

              <ConnectWallet
                onClick={() => {
                  modal.show();
                }}
              />
            </div>
          )}

          {accountId && !validContract() && (
            <div className="relative bottom-1 break-words inline-flex flex-col items-center">
              <div className="text-base w-p200 pb-6 text-center text-white">
                Using Orderbook request re-connect wallet
              </div>
              <ConfirmButton
                onClick={async () => {
                  // window.modal.show();
                  const wallet = await window.selector.wallet();

                  await wallet.signOut();

                  window.location.reload();
                }}
              />
            </div>
          )}

          {!!accountId &&
            validContract() &&
            (!storageEnough || !tradingKeySet || !keyAnnounced) && (
              <div className="w-half md:w-full lg:w-full flex justify-center flex-col items-center">
                <div className="md:hidden lg:hidden text-center mb-6">
                  <p>Welcome!</p>
                  <p>Connect your orderly account to start</p>
                </div>
                <RegisterButton
                  userExist={userExist}
                  onClick={() => {
                    if (!agreeCheck) {
                      setRegisterModalOpen(true);

                      return;
                    }
                    if (!accountId || storageEnough) return;

                    if (!userExist) {
                      localStorage.setItem(REF_ORDERLY_AGREE_CHECK, 'true');
                    }

                    storageDeposit(accountId);
                  }}
                  setCheck={setAgreeCheck}
                  check={agreeCheck}
                  storageEnough={!!storageEnough}
                  spin={
                    (storageEnough && (!tradingKeySet || !keyAnnounced)) ||
                    agreeCheck
                  }
                  onPortfolio
                />
              </div>
            )}
        </div>
      )}
      <div className="w-full hidden md:block lg:block">
        {tableTopComponent}
        <table className="table-fixed w-full">
          {/* Header */}
          <thead
            className={`w-full xs:hidden table table-fixed  pl-5 pr-4 py-2 border-white border-opacity-10`}
          >
            <tr
              className={`w-full px-5 table-fixed grid gap-4`}
              style={{
                gridTemplateColumns: `repeat(${gridCol}, minmax(0, 1fr))`
              }}
            >
              {columns.map((column, i) => !column.customRender ? (
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
              ))}
            </tr>
          </thead>
          <tbody
            className=" block flex-col "
            id="all-orders-body-open"
          >
            {accountId && validContract() && loading ? (
              <tr
                className={`w-full relative mt-10 mb-4 px-5 table-fixed grid grid-cols-${gridCol} gap-4`}
                style={{ zIndex: 1 }}
              >
                <td className={`col-span-${gridCol} text-center`}>
                  <OrderlyLoading />
                </td>
              </tr>
            ) : data.filter(filterFunc).filter(pagingFunc).length === 0 ? (
              <tr
                className={`w-full mt-10 mb-4 px-5 table-fixed grid grid-cols-${gridCol} gap-4`}
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
                .filter(pagingFunc)
                .sort(sortingFunc)
                .map((order, i) => {
                  return (
                    <OrderLine
                      key={`${tableKey}-order-${i}`}
                      order={order}
                      handleOpenClosing={handleOpenClosing}
                      columns={columns}
                      tableRowType={tableRowType}
                    />
                  );
                })
            )}
          </tbody>
        </table>
      </div>
      <div className="w-full md:hidden lg:hidden">
        {accountId && validContract() && loading ? (
          <div className="w-full relative mt-10 mb-4 px-5 gap-4">
            <div className="text-center">
              <OrderlyLoading />
            </div>
          </div>
        ) : data.filter(filterFunc).filter(pagingFunc).length === 0 ? (
          <div className="w-full mt-10 mb-4 px-5 gap-4">
            <div className="text-center">
              {intl.formatMessage({
                id: 'no_orders_found',
                defaultMessage: 'No orders found',
              })}
            </div>
          </div>
        ) : (
          <>
            {!mobileRenderCustom &&
              data
                .filter(filterFunc)
                .filter(pagingFunc)
                .sort(sortingFunc)
                .map((order) => mobileRender && mobileRender(order))}
            {mobileRenderCustom &&
              mobileRender(data.sort(sortingFunc).filter(filterFunc))}
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
              {(page - 1) * 10 + 1}-{(customTotal ? customTotal : total) > page * 10 ? page * 10 : (customTotal ? customTotal : total)} of{' '}
              {(customTotal ? customTotal : total)}
            </span>

            {/* Next */}
            <div
              onClick={() => {
                page < Math.ceil((customTotal ? customTotal : total) / 10) && setPage(page + 1);
              }}
              className={page < Math.ceil((customTotal ? customTotal : total) / 10) ? 'cursor-pointer' : ''}
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
                  opacity={page < Math.ceil((customTotal ? customTotal : total) / 10) ? '1' : '0.3'}
                  d="M5.22267 3.77071C5.64372 4.16574 5.64372 4.83426 5.22267 5.22928L1.68421 8.54905C1.04564 9.14816 -4.6751e-07 8.69538 -4.29236e-07 7.81976L-1.39013e-07 1.18023C-1.00738e-07 0.304619 1.04564 -0.148155 1.68421 0.450951L5.22267 3.77071Z"
                  fill="#7E8A93"
                />
              </svg>
            </div>

            {/* Last page */}
            <div
              onClick={() => {
                page < Math.ceil((customTotal ? customTotal : total) / 10) && setPage(Math.ceil((customTotal ? customTotal : total) / 10));
              }}
              className={page < Math.ceil((customTotal ? customTotal : total) / 10) ? 'cursor-pointer' : ''}
            >
              <svg
                className="mx-1"
                width="10"
                height="13"
                viewBox="0 0 10 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g opacity={page < Math.ceil((customTotal ? customTotal : total) / 10) ? '1' : '0.3'}>
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

      <RegisterModal
        isOpen={registerModalOpen}
        onRequestClose={() => {
          setRegisterModalOpen(false);
        }}
        userExist={userExist}
        orderlyRegistered={userExist}
        onConfirm={() => {
          setAgreeCheck(true);
        }}
      />
    </div>
  );
}

export default Table;
