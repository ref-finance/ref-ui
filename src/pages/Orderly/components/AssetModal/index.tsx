import React, { useEffect, useState } from 'react';

import Modal from 'react-modal';

import { IoClose } from 'react-icons/io5';
import { useTokenInfo } from '../../orderly/state';
import {
  NearIcon,
  NearWalletIcon,
  FirstPage,
  PrePage,
  NextPage,
  LastPage,
} from '../Common/Icons';
import { MdArrowDropDown, MdArrowDropUp } from 'react-icons/md';
import { OrderAsset, useOrderAssets } from './state';
import { FlexRow } from '../Common/index';
import { digitWrapper } from '../../utiles';
import { AssetManagerModal } from '../UserBoard';
import { depositOrderly } from '../../orderly/api';
import { withdrawOrderly } from '../../orderly/api';
import { TokenInfo } from '../../orderly/type';
import Big from 'big.js';

import { UserRecord } from '../../orderly/type';

import { orderBy as lodashOrderBy } from 'lodash';
import { getAccountName } from '../../orderly/utils';
import { useTokenMetaFromSymbol } from '../ChartHeader/state';
import { formatTimeDate } from '../OrderBoard/index';
import { getAssetHistory } from '../../orderly/off-chain-api';
import getConfig from '../../config';

import { TbCopy } from 'react-icons/tb';
import CopyToClipboard from 'react-copy-to-clipboard';

function parseTxDisplay(tx: string) {
  return tx.slice(0, 5) + '...' + tx.slice(-5);
}

function AssetButton({
  text,
  onClick,
  forbid,
  className,
}: {
  text: 'Deposit' | 'Withdraw';
  onClick: () => void;
  forbid?: boolean;
  className?: string;
}) {
  return (
    <button
      className={`${className} px-2 py-1.5 text-white ${
        forbid ? 'cursor-not-allowed' : ''
      } rounded-lg ${
        text === 'Deposit' ? 'bg-buyGradientGreen' : 'bg-withdrawPurple2'
      } ${forbid ? 'opacity-30' : ''} `}
      disabled={forbid}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
    >
      {text}
    </button>
  );
}

function AssetLine(
  props: OrderAsset & {
    tokenInfo: TokenInfo[] | undefined;
  }
) {
  const [showManagerModal, setShowManagerModal] = useState<boolean>(false);

  const [type, setType] = useState<'deposit' | 'withdraw'>();

  return (
    <div
      className="grid grid-cols-8 text-white py-4 pl-5 pr-1 first-letter:first-line:
    border-t  border-gray1
    "
    >
      <FlexRow className="col-span-2 ">
        <img
          src={props.tokenMeta.icon}
          className="rounded-full mr-2 w-7 h-7 border border-green-400"
          alt=""
        />
        <div className="flex flex-col ">
          <div className="text-white font-bold">{props.tokenMeta.symbol}</div>

          <div className="text-primaryOrderly text-xs">
            {getAccountName(props.tokenMeta.id)}
          </div>
        </div>
      </FlexRow>

      <FlexRow className="justify-self-end relative right-4">
        {digitWrapper(props.near, 3)}
      </FlexRow>

      <FlexRow className="col-span-2 justify-self-end relative right-12">
        {digitWrapper(props['in-order'], 3)}
      </FlexRow>

      <FlexRow className="relative justify-self-end right-8">
        {digitWrapper(props.available, 3)}
      </FlexRow>

      <FlexRow className="justify-center justify-self-center col-span-2">
        <AssetButton
          text="Deposit"
          onClick={() => {
            setType('deposit');
            setShowManagerModal(true);
          }}
          forbid={new Big(props.near).lte(0)}
          className="mr-2"
        />

        <AssetButton
          text="Withdraw"
          onClick={() => {
            setType('withdraw');
            setShowManagerModal(true);
          }}
          forbid={new Big(props.available).lte(0)}
        ></AssetButton>
      </FlexRow>

      {showManagerModal && type && (
        <AssetManagerModal
          tokenId={props.tokenMeta.id}
          isOpen={showManagerModal}
          onRequestClose={() => {
            setShowManagerModal(false);
          }}
          onClick={(amount) => {
            if (!window.selectorAccountId) return;

            if (type === 'deposit') {
              depositOrderly(props.tokenMeta.id, amount);
            } else if (type === 'withdraw') {
              withdrawOrderly(props.tokenMeta.id, amount);
            }
          }}
          type={type}
          walletBalance={props.near}
          accountBalance={Number(props.available)}
          tokenInfo={props.tokenInfo}
        ></AssetManagerModal>
      )}
    </div>
  );
}

function RecordLine(
  props: UserRecord & {
    tokenInfo: TokenInfo[] | undefined;
  }
) {
  const tokenMeta = useTokenMetaFromSymbol(props.token, props.tokenInfo);

  return (
    <div className="grid grid-cols-6 justify-items-end py-3 text-gray2 pl-5 ">
      <FlexRow className="col-span-1 justify-self-start">
        <img
          src={tokenMeta?.icon}
          className="rounded-full mr-2  border border-green-400"
          alt=""
          style={{
            width: '22px',
            height: '22px',
          }}
        />
        <div className="">{props.token}</div>
      </FlexRow>

      <FlexRow className="justify-self-end relative  right-24">
        {digitWrapper(props.amount.toString(), 3)}
      </FlexRow>

      <FlexRow className="col-span-1 justify-self-end relative right-14">
        {window.selectorAccountId}
      </FlexRow>

      <div className="flex items-center relative right-8 justify-self-end">
        <a
          href={`${getConfig().explorerUrl}/txns/${props.tx_id}`}
          target="_blank"
          className="justify-center flex items-center justify-self-end whitespace-nowrap hover:underline text-txBlue"
          rel="noreferrer"
        >
          {parseTxDisplay(props.tx_id)}
        </a>
        <CopyToClipboard text={props.tx_id}>
          <TbCopy className="ml-1 transform hover:opacity-80 cursor-pointer text-txBlue rotate-270" />
        </CopyToClipboard>
      </div>

      <FlexRow className="relative justify-self-end whitespace-nowrap ">
        {formatTimeDate(props.updated_time)}
      </FlexRow>

      <FlexRow
        className={`justify-center justify-self-center ${
          props.side === 'WITHDRAW' ? 'text-withdrawPurple3' : 'text-baseGreen'
        }`}
      >
        {props.side === 'WITHDRAW' ? 'Withdraw' : 'Deposit'}
      </FlexRow>
    </div>
  );
}

export function AssetModal(props: Modal.Props) {
  const { onRequestClose } = props;

  const [tag, setTag] = useState<'asset' | 'records'>('asset');

  const [sortBy, setSortBy] = useState<'near' | 'in-order' | 'available'>(
    'available'
  );

  const [orderBy, OrderBy] = useState<'asc' | 'desc'>('desc');

  const tokenInfo = useTokenInfo();

  const displayBalances = useOrderAssets(tokenInfo);

  const sortedBalances = lodashOrderBy(displayBalances, [sortBy], [orderBy]);

  const [records, setRecords] = useState<UserRecord[]>();

  const DEFAULT_PAGE_SIZE = 10;

  const [recordsPerPage, setRecordsPerPage] = useState<number>(25);

  const [curPage, setCurPage] = useState<number>(1);

  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    if (
      records === undefined ||
      (DEFAULT_PAGE_SIZE * curPage > records.length && records.length < total)
    ) {
      if (!window.selectorAccountId) return;

      const requestPage = Math.ceil(records?.length || 0 / recordsPerPage) + 1;

      getAssetHistory({
        accountId: window.selectorAccountId,
        HistoryParam: {
          page: requestPage,
        },
      }).then((res) => {
        if (!!res.success) {
          setRecords([...(records || []), ...res.data.rows]);
          setRecordsPerPage(res.data.meta.records_per_page);
          setTotal(res.data.meta.total);
        }
      });
    }
  }, [curPage]);

  return (
    <Modal {...props}>
      <div className=" rounded-2xl overflow-hidden lg:w-p869 xs:w-95vw gradientBorderWrapperNoShadow bg-boxBorder text-sm text-primaryOrderly border ">
        <div className=" flex flex-col ">
          <div className="flex bg-allOrderHeader pt-4 px-5 pb-4  items-center  justify-between">
            <div className="text-white  text-base font-bold">
              <span
                className={
                  tag !== 'asset'
                    ? 'text-primaryOrderly cursor-pointer relative'
                    : 'cursor-pointer relative'
                }
                onClick={() => {
                  setTag('asset');
                }}
              >
                Account Assets
                {tag === 'asset' && (
                  <div
                    className="w-full absolute  rounded-xl bg-greenLight "
                    style={{
                      height: '3px',
                      bottom: '-20px',
                    }}
                  ></div>
                )}
              </span>

              <span
                className={
                  tag !== 'records'
                    ? 'text-primaryOrderly ml-20 cursor-pointer relative'
                    : 'ml-20 cursor-pointer relative'
                }
                onClick={() => {
                  setTag('records');
                }}
              >
                Records
                {tag === 'records' && (
                  <div
                    className="w-full absolute left-0 rounded-xl  bg-greenLight "
                    style={{
                      height: '3px',
                      bottom: '-20px',
                    }}
                  ></div>
                )}
              </span>
            </div>

            <span
              className="cursor-pointer "
              onClick={(e: any) => {
                onRequestClose && onRequestClose(e);
              }}
            >
              <IoClose size={22} />
            </span>
          </div>
          {tag === 'asset' && (
            <div className="grid grid-cols-8 px-5  py-3 h-14">
              <div className="col-span-2 text-center  inline-flex items-center justify-center justify-self-start">
                Tokens
              </div>

              <div
                className={`flex cursor-pointer relative items-center  justify-center
            ${sortBy === 'near' ? 'white' : '#7E8A93'}
            `}
                onClick={() => {
                  setSortBy('near');
                  OrderBy(orderBy === 'desc' ? 'asc' : 'desc');
                }}
              >
                <NearWalletIcon></NearWalletIcon>

                <span className="ml-2">NEAR</span>

                <MdArrowDropDown
                  size={22}
                  color={sortBy === 'near' ? 'white' : '#7E8A93'}
                  className={`${
                    orderBy === 'asc' && sortBy === 'near'
                      ? 'transform rotate-180'
                      : ''
                  } `}
                ></MdArrowDropDown>

                <div
                  className="border-b absolute border-gray1 transform rotate-90 "
                  style={{
                    width: '18px',
                    right: '-10px',
                  }}
                ></div>
              </div>

              <div
                className={`col-span-2 cursor-pointer flex justify-self-center items-center ${
                  sortBy === 'in-order' ? 'white' : '#7E8A93'
                }`}
                onClick={() => {
                  setSortBy('in-order');
                  OrderBy(orderBy === 'desc' ? 'asc' : 'desc');
                }}
              >
                <span>Balance: in Order</span>

                <MdArrowDropDown
                  size={22}
                  color={sortBy === 'in-order' ? 'white' : '#7E8A93'}
                  className={`${
                    orderBy === 'asc' && sortBy === 'in-order'
                      ? 'transform rotate-180'
                      : ''
                  } `}
                ></MdArrowDropDown>
              </div>

              <div
                className={`${
                  sortBy === 'available' ? 'white' : '#7E8A93'
                } cursor-pointer flex items-center justify-self-center justify-center`}
                onClick={() => {
                  setSortBy('available');
                  OrderBy(orderBy === 'desc' ? 'asc' : 'desc');
                }}
              >
                <span>Available</span>

                <MdArrowDropDown
                  size={22}
                  color={sortBy === 'available' ? 'white' : '#7E8A93'}
                  className={`${
                    orderBy === 'asc' && sortBy === 'available'
                      ? 'transform rotate-180'
                      : ''
                  } `}
                ></MdArrowDropDown>
              </div>

              <div className="col-span-2 justify-self-center">
                <span>Actions</span>
              </div>
            </div>
          )}
          {tag === 'records' && (
            <div className="grid border-b border-gray1 grid-cols-6 pl-5 pr-0 justify-items-center text-primaryOrderly py-3 h-14">
              <div className="col-span-1 text-center  inline-flex items-center justify-center justify-self-start">
                Token
              </div>

              <div
                className={`flex  relative items-center  right-14 justify-center
                `}
              >
                Amount
              </div>

              <div
                className={`col-span-1  flex justify-items-center relative right-10  items-center `}
              >
                <span>Source Address</span>
              </div>

              <div className={` flex items-center relative  justify-center`}>
                <span>TxID</span>
              </div>

              <div className="flex items-center relative right-2  justify-self-end justify-center">
                <span>Time</span>
              </div>

              <div className="flex items-center justify-center">
                <span>Action</span>
              </div>
            </div>
          )}

          {tokenInfo &&
            (tag === 'asset' ? (
              <section className="max-h-96 overflow-auto w-full">
                {sortedBalances.map((b: OrderAsset) => {
                  return <AssetLine tokenInfo={tokenInfo} {...b} />;
                })}
              </section>
            ) : (
              records &&
              records
                ?.slice(
                  (curPage - 1) * DEFAULT_PAGE_SIZE,
                  curPage * DEFAULT_PAGE_SIZE
                )
                .map((r) => {
                  return <RecordLine tokenInfo={tokenInfo} {...r} />;
                })
            ))}

          {tag === 'records' && (
            <div className="border-t flex items-center px-5 mr-4 justify-end border-gray1 py-3">
              <span
                className="cursor-pointer"
                onClick={() => {
                  setCurPage(1);
                }}
              >
                <FirstPage></FirstPage>
              </span>

              <span
                className="ml-2 cursor-pointer"
                onClick={() => {
                  if (curPage > 1) {
                    setCurPage(curPage - 1);
                  }
                }}
              >
                <PrePage></PrePage>
              </span>

              <span
                className="ml-2 cursor-pointer"
                onClick={() => {
                  if (curPage * DEFAULT_PAGE_SIZE >= total) {
                    return;
                  }

                  setCurPage(curPage + 1);
                }}
              >
                <NextPage></NextPage>
              </span>

              <span
                className="mx-2 cursor-pointer"
                onClick={() => {
                  setCurPage(Math.ceil(total / DEFAULT_PAGE_SIZE));
                }}
              >
                <LastPage></LastPage>
              </span>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
