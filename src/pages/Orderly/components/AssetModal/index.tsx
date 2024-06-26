import Big from 'big.js';
import { orderBy as lodashOrderBy } from 'lodash';
import React, { useEffect, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import InfiniteScroll from 'react-infinite-scroll-component';
import { FormattedMessage, useIntl } from 'react-intl';
import Modal from 'react-modal';
import { IoClose } from '../../../../components/reactIcons';
import { MdArrowDropDown } from '../../../../components/reactIcons';
import { BiCopy } from '../../../../components/reactIcons';
import { NearTip } from '../../../../pages/AccountPage';
import getConfigV2 from '../../../../services/configV2';
import { isClientMobie, useClientMobile } from '../../../../utils/device';
import getConfig from '../../config';
import { depositOrderly } from '../../orderly/api';
import { withdrawOrderly } from '../../orderly/api';
import { getAssetHistory } from '../../orderly/off-chain-api';
import { useTokenInfo } from '../../orderly/state';
import { TokenInfo } from '../../orderly/type';
import { UserRecord } from '../../orderly/type';
import { getAccountName } from '../../orderly/utils';
import { digitWrapper, digitWrapperAsset } from '../../utiles';
import { useTokenMetaFromSymbol } from '../ChartHeader/state';
import {
  FirstPage,
  InOrderIcon,
  LastPage,
  NearIcon,
  NearWalletIcon,
  NextPage,
  OrderlyIconBalance,
  OrderlyLoading,
  OutLinkIcon,
  PrePage,
} from '../Common/Icons';
import { TipIconAsset } from '../Common/Icons';
import {
  DepositButton,
  DepositButtonMobile,
  FlexRow,
  WithdrawButton,
  WithdrawButtonMobile,
} from '../Common/index';
import { formatTimeDate } from '../OrderBoard/index';
import { AssetManagerModal } from '../UserBoard';
import {
  CollatteralToken,
  CollatteralTokenAvailableCell,
} from '../UserBoardPerp/components/HoverText';
import { usePerpData } from '../UserBoardPerp/state';
import { OrderAsset, useOrderAssets } from './state';
const configV2 = getConfigV2();
import CustomTooltip from 'src/components/customTooltip/customTooltip';
import { index } from 'mathjs';

function getTipAsset() {
  const intl = useIntl();
  return `<div class=" rounded-md w-60 text-primaryOrderly  text-xs  text-left">
    ${intl.formatMessage({
      id: 'the_all_data_orderly_tip',
      defaultMessage:
        'The data provided herein includes all assets and records in your account, not limited to those generated through REF.',
    })} 
  </div>`;
}

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
      <FormattedMessage id={text.toLowerCase()} defaultMessage={text} />
    </button>
  );
}

function AssetLine(
  props: OrderAsset & {
    tokenInfo: TokenInfo[] | undefined;
    freeCollateral: string;
    curHoldingOut;
  }
) {
  const [showManagerModal, setShowManagerModal] = useState<boolean>(false);
  const [type, setType] = useState<'deposit' | 'withdraw'>();
  const { freeCollateral, curHoldingOut } = props;
  const is_usdc = props.tokenMeta.id == configV2.ORDRRBOOK_COLLATTERAL_TOKEN;
  let usdcBalance = '-';
  let finalBalance = '-';
  if (is_usdc) {
    usdcBalance = curHoldingOut
      ? new Big(curHoldingOut.holding + curHoldingOut.pending_short).toFixed(2)
      : '-';

    if (curHoldingOut && freeCollateral !== '-') {
      const balance = new Big(
        curHoldingOut.holding + curHoldingOut.pending_short
      );
      if (balance.lt(freeCollateral)) {
        finalBalance = balance.toFixed(3);
      } else {
        finalBalance = Big(freeCollateral).toFixed(3);
      }
    }
  }
  return (
    <div
      className="grid grid-cols-8 xs:grid-cols-3 text-white py-4 pl-5 pr-1 first-letter:first-line:
    border-t  border-gray1
    "
    >
      <FlexRow className="col-span-2 xs:col-span-1">
        <img
          src={props.tokenMeta.icon}
          className="rounded-full flex-shrink-0 mr-2 w-7 h-7 border border-green-400"
          alt=""
        />
        <div className="flex flex-col">
          <div className="text-white flex items-center font-bold">
            {props.tokenMeta.symbol}
            {props?.tokenMeta?.id?.toLowerCase() === 'near' && <NearTip />}
            {is_usdc && <CollatteralToken d="right" />}
          </div>

          <div className="text-primaryOrderly xs:hidden text-xs">
            {getAccountName(props.tokenMeta.id)}
          </div>
        </div>
      </FlexRow>

      <FlexRow className="justify-self-end relative right-4" title={props.near}>
        {digitWrapperAsset(props.near, 3)}
      </FlexRow>

      <FlexRow
        className="col-span-2 xs:hidden justify-self-end relative right-12 xs:right-5"
        title={props['in-order']}
      >
        {digitWrapperAsset(props['in-order'], 3)}
      </FlexRow>

      <FlexRow
        className="relative justify-self-end right-8 xs:right-0"
        title={props.available}
      >
        {is_usdc ? (
          <CollatteralTokenAvailableCell
            finalBalance={finalBalance}
            usdcBalance={usdcBalance}
            freeCollateral={freeCollateral}
          />
        ) : (
          digitWrapperAsset(props.available, 3)
        )}
      </FlexRow>

      <FlexRow className="justify-center xs:hidden justify-self-center col-span-2">
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
          onClick={async (amount) => {
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
          freeCollateral={freeCollateral}
          curHoldingOut={curHoldingOut}
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
  const intl = useIntl();
  return (
    <>
      <div className="grid xs:hidden grid-cols-6 justify-items-end py-3 text-gray2 pl-5 ">
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
          {digitWrapperAsset(props.amount.toString(), 3)}
        </FlexRow>

        <FlexRow
          className="col-span-1 justify-self-end relative right-14"
          title={window.selectorAccountId}
        >
          {getAccountName(window.selectorAccountId)}
        </FlexRow>

        <div className="flex items-center relative right-8 justify-self-end">
          <a
            href={`${getConfig().explorerUrl}/txns/${props.tx_id}`}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="justify-center flex items-center justify-self-end whitespace-nowrap hover:underline text-txBlue"
          >
            {parseTxDisplay(props.tx_id)}
          </a>
          <CopyToClipboard text={props.tx_id}>
            <BiCopy className="ml-1 transform hover:opacity-80 cursor-pointer text-txBlue rotate-270" />
          </CopyToClipboard>
        </div>

        <FlexRow className="relative justify-self-end whitespace-nowrap ">
          {formatTimeDate(props.updated_time)}
        </FlexRow>

        <FlexRow
          className={`justify-center justify-self-center ${
            props.side === 'WITHDRAW'
              ? 'text-withdrawPurple3'
              : 'text-baseGreen'
          }`}
        >
          {props.side === 'WITHDRAW'
            ? intl.formatMessage({
                id: 'withdraw',
                defaultMessage: 'Withdraw',
              })
            : intl.formatMessage({
                id: 'deposit',
                defaultMessage: 'Deposit',
              })}
        </FlexRow>
      </div>

      <div className="w-full lg:hidden flex px-3 py-2 border-b border-menuMoreBgColor items-stretch justify-between">
        <div className="flex  flex-col">
          <FlexRow className="col-span-1 justify-self-start">
            <img
              src={tokenMeta?.icon}
              className="rounded-full mr-2 xs:border-none lg:border border-green-400"
              alt=""
              style={{
                width: '22px',
                height: '22px',
              }}
            />
            <div className="text-white ml-1 flex flex-col">
              {props.token}

              <span className="text-primaryText">
                from: {window.selectorAccountId}
              </span>
            </div>
          </FlexRow>

          <div className="text-primaryText mt-0.5 whitespace-nowrap">
            {formatTimeDate(props.updated_time)}
          </div>
        </div>

        <div className="flex flex-col items-end justify-between">
          <span
            className={`font-bold ${
              props.side === 'WITHDRAW' ? 'text-white' : 'text-sellRed'
            }  `}
          >
            {props.side === 'WITHDRAW' ? '-' : '+'}
            {digitWrapper(props.amount.toString(), 3)}
          </span>

          <div className="flex items-center justify-end relative ">
            <a
              href={`${getConfig().explorerUrl}/txns/${props.tx_id}`}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="justify-center flex items-center justify-self-end whitespace-nowrap hover:underline text-txBlue"
            >
              {/* {parseTxDisplay(props.tx_id)} */}
              <span className="text-primaryText">Tx</span>

              <span className="text-primaryText ml-2">
                <OutLinkIcon></OutLinkIcon>
              </span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export function AssetModal(props: Modal.Props & { curHoldingOut }) {
  const { onRequestClose, curHoldingOut } = props;

  const [tag, setTag] = useState<'asset' | 'records'>('asset');

  const [sortBy, setSortBy] = useState<'near' | 'in-order' | 'available'>(
    'available'
  );

  const [orderBy, OrderBy] = useState<'asc' | 'desc'>('desc');

  const tokenInfo = useTokenInfo();

  const { freeCollateral } = usePerpData();

  const displayBalances = useOrderAssets(
    tokenInfo,
    freeCollateral,
    curHoldingOut
  );

  const sortedBalances = lodashOrderBy(
    displayBalances,

    (b) => Number(b[sortBy]),
    ['desc']
  );
  const intl = useIntl();
  const [records, setRecords] = useState<UserRecord[]>();

  const DEFAULT_PAGE_SIZE = 10;

  const [recordsPerPage, setRecordsPerPage] = useState<number>(50);

  const [curPage, setCurPage] = useState<number>(1);

  const [total, setTotal] = useState<number>(0);

  const loading =
    (tag === 'records' ? records === undefined : sortedBalances.length == 0) ||
    !tokenInfo ||
    freeCollateral === '-';

  useEffect(() => {
    if (
      records === undefined ||
      (records &&
        DEFAULT_PAGE_SIZE * curPage > records.length &&
        records.length < total)
    ) {
      if (!window.selectorAccountId) return;

      const requestPage =
        Math.ceil((records?.length || 0) / recordsPerPage) + 1;

      getAssetHistory({
        accountId: window.selectorAccountId,
        HistoryParam: {
          page: requestPage,
          size: recordsPerPage,
        },
      }).then((res) => {
        if (!!res.success) {
          setRecords([...(records || []), ...res.data.rows]);
          setRecordsPerPage(res.data.meta.records_per_page);
          setTotal(res.data.meta.total);
        }
      });
    }
  }, [curPage, records]);

  const loadMore = () => {
    if (records?.length === total) {
      return;
    } else {
      if (!window.selectorAccountId) return;

      const requestPage =
        Math.ceil((records?.length || 0) / recordsPerPage) + 1;

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
  };

  const [operationType, setOperationType] = useState<'deposit' | 'withdraw'>();
  const [operationId, setOperationId] = useState<string>('near');

  const isMobile = useClientMobile();
  return (
    <Modal
      {...props}
      style={{
        content: isMobile
          ? {
              position: 'fixed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              top: 'none',
              bottom: '0px',
              left: '50%',
              transform: 'translate(-50%, -20px)',
              outline: 'none',
            }
          : {
              height: '620px',
              zIndex: 999,
              top: '15%',
              transform: 'translate(-50%, 0%)',
            },
      }}
    >
      <div
        className={`${
          isMobile ? '' : 'border border-assetsBorder'
        } rounded-2xl xs:rounded-none xs:rounded-t-2xl relative  lg:overflow-hidden lg:h-p620 xs:pb-8 lg:w-p869 xs:w-screen xs:fixed xs:bottom-0  bg-boxBorder text-sm text-primaryOrderly border xs:border-none `}
        style={{
          height: isMobile ? '77vh' : '',
        }}
      >
        <div className=" flex flex-col relative h-full lg:pb-10">
          <div className="flex bg-allOrderHeader relative xs:bg-none pt-4 px-5 pb-4  items-center  justify-between">
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
                {isMobile
                  ? intl.formatMessage({
                      id: 'assets',
                      defaultMessage: 'Assets',
                    })
                  : intl.formatMessage({
                      id: 'account_assets',
                      defaultMessage: 'Account Assets',
                    })}

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
                    ? 'text-primaryOrderly lg:ml-20 xs:ml-10 md:ml-10 cursor-pointer relative'
                    : 'lg:ml-20 xs:ml-10 md:ml-10 cursor-pointer relative'
                }
                onClick={() => {
                  setTag('records');
                }}
              >
                {intl.formatMessage({
                  id: 'records',
                  defaultMessage: 'Records',
                })}
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

              <div
                data-class="reactTip"
                data-tooltip-id={'mobile_tip_asset_orderly'}
                data-place={'bottom'}
                data-tooltip-html={`<div class=" rounded-md w-60 text-primaryOrderly  text-xs  text-left">
                ${intl.formatMessage({
                  id: 'the_all_data_orderly_tip',
                  defaultMessage:
                    'The data provided herein includes all assets and records in your account, not limited to those generated through REF.',
                })} 
              </div>`}
                className="lg:hidden absolute right-6 top-5"
              >
                <TipIconAsset></TipIconAsset>

                <CustomTooltip id={'mobile_tip_asset_orderly'} place="bottom" />
              </div>
            </div>

            <span
              className="cursor-pointer xs:hidden"
              onClick={(e: any) => {
                onRequestClose && onRequestClose(e);
              }}
            >
              <IoClose size={22} />
            </span>
          </div>
          {tag === 'asset' && (
            <div
              className={
                'grid grid-cols-8 xs:grid-cols-3 px-5  xs:pl-4 xs:pr-3 py-3 h-14'
              }
            >
              <div className="xs:col-span-1 col-span-2  text-center  inline-flex items-center justify-center justify-self-start">
                {isMobile
                  ? intl.formatMessage({
                      id: 'asset',
                      defaultMessage: 'Asset',
                    })
                  : intl.formatMessage({
                      id: 'tokens',
                      defaultMessage: 'Tokens',
                    })}
              </div>

              <div
                className={`flex flex-shrink-0 cursor-pointer relative items-center  justify-center
            ${sortBy === 'near' ? 'text-white' : 'text-primaryText'}
            `}
                onClick={() => {
                  setSortBy('near');
                }}
              >
                <NearWalletIcon></NearWalletIcon>

                <span className="ml-2">
                  {isMobile
                    ? intl.formatMessage({
                        id: 'wallet_up',
                        defaultMessage: 'Wallet',
                      })
                    : 'NEAR'}{' '}
                </span>

                <MdArrowDropDown
                  size={22}
                  color={sortBy === 'near' ? 'white' : '#7E8A93'}
                  className={`${
                    orderBy === 'asc' && sortBy === 'near'
                      ? 'transform rotate-180'
                      : ''
                  } `}
                ></MdArrowDropDown>
              </div>

              <div
                className={`col-span-2 xs:hidden relative cursor-pointer flex justify-self-center items-center ${
                  sortBy === 'in-order' ? 'text-white' : 'text-primaryText'
                }`}
                onClick={() => {
                  setSortBy('in-order');
                }}
              >
                <span className="absolute xs:hidden -left-6">
                  <OrderlyIconBalance></OrderlyIconBalance>
                </span>

                <span className=" ml-2 lg:hidden ">
                  <InOrderIcon></InOrderIcon>
                </span>

                <span className="xs:hidden">
                  {intl.formatMessage({
                    id: 'in_open_orders',
                    defaultMessage: 'In Open Orders',
                  })}
                </span>

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
                  sortBy === 'available' ? 'text-white' : 'text-primaryText'
                } cursor-pointer flex items-center justify-self-center xs:justify-self-end justify-center`}
                onClick={() => {
                  setSortBy('available');
                }}
              >
                <span className=" ml-2 lg:ml-0 lg:mr-2 ">
                  <OrderlyIconBalance></OrderlyIconBalance>
                </span>
                <span className="flex items-center xs:ml-2">
                  {intl.formatMessage({
                    id: 'available',
                    defaultMessage: 'Available',
                  })}
                </span>

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

              <div className="col-span-2 xs:hidden justify-self-center xs:justify-self-end flex items-center justify-center">
                <span>
                  {intl.formatMessage({
                    id: 'actions_orderly',
                    defaultMessage: 'Actions',
                  })}
                </span>
              </div>
            </div>
          )}
          {tag === 'records' && (
            <div className="grid xs:hidden border-b border-gray1 grid-cols-6 pl-5 pr-0 justify-items-center text-primaryOrderly py-3 h-14">
              <div className="col-span-1 text-center  inline-flex items-center justify-center justify-self-start">
                {intl.formatMessage({
                  id: 'token',
                  defaultMessage: 'Token',
                })}
              </div>

              <div
                className={`flex  relative items-center  right-14 justify-center
                `}
              >
                {intl.formatMessage({
                  id: 'amount',
                  defaultMessage: 'Amount',
                })}
              </div>

              <div
                className={`col-span-1  flex justify-items-center relative right-10  items-center `}
              >
                <span>
                  {intl.formatMessage({
                    id: 'source_address',
                    defaultMessage: 'Source Address',
                  })}
                </span>
              </div>

              <div className={` flex items-center relative  justify-center`}>
                <span>Tx</span>
              </div>

              <div className="flex items-center relative right-2  justify-self-end justify-center">
                <span>
                  {intl.formatMessage({
                    id: 'time',
                    defaultMessage: 'Time',
                  })}
                </span>
              </div>

              <div className="flex items-center justify-center">
                <span>
                  {intl.formatMessage({
                    id: 'action',
                    defaultMessage: 'Action',
                  })}
                </span>
              </div>
            </div>
          )}

          {loading && <OrderlyLoading></OrderlyLoading>}

          {tag === 'asset' && !loading && (
            <section
              className="max-h-full overflow-auto w-full xs:px-2"
              style={{
                maxHeight: '50vh',
              }}
            >
              {sortedBalances.map((b: OrderAsset, index) => {
                return (
                  <AssetLine
                    key={index}
                    tokenInfo={tokenInfo}
                    {...b}
                    freeCollateral={freeCollateral}
                    curHoldingOut={curHoldingOut}
                  />
                );
              })}
            </section>
          )}

          {tag === 'records' &&
            (isMobile && records && records.length > 0 ? (
              <section className="xs:overflow-auto" id="mobile-asset-body">
                <InfiniteScroll
                  next={loadMore}
                  hasMore={records.length < total}
                  dataLength={records.length}
                  loader={null}
                  scrollableTarget="mobile-asset-body"
                >
                  {records.map((r) => {
                    return (
                      <RecordLine
                        key={r.id + index}
                        {...r}
                        tokenInfo={tokenInfo}
                      />
                    );
                  })}
                </InfiniteScroll>
              </section>
            ) : (
              Math.ceil(total / DEFAULT_PAGE_SIZE) > 0 &&
              !loading &&
              records &&
              records
                ?.slice(
                  (curPage - 1) * DEFAULT_PAGE_SIZE,
                  curPage * DEFAULT_PAGE_SIZE
                )
                .map((r) => {
                  return (
                    <RecordLine
                      key={r.id + index + 1}
                      tokenInfo={tokenInfo}
                      {...r}
                    />
                  );
                })
            ))}

          {
            <div className="flex items-center border-t border-gray1 w-full xs:hidden bottom-0 absolute py-3 ">
              <div className=" xs:hidden flex  items-center left-2 relative bottom-0.5 ml-4 text-xs ">
                <TipIconAsset></TipIconAsset>

                <div className="ml-1">
                  {intl.formatMessage({
                    id: 'the_all_data_orderly_tip',
                    defaultMessage:
                      'The data provided herein includes all assets and records in your account, not limited to those generated through REF.',
                  })}
                </div>
              </div>
              {tag === 'records' && records && records.length > 0 && (
                <div className=" xs:hidden  absolute bottom-0 right-0 flex items-center px-2 mr-4 justify-end  py-3">
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

                  <span className="flex ml-2 items-center whitespace-nowrap text-primaryText">
                    {curPage}/{Math.ceil(total / DEFAULT_PAGE_SIZE)}
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
          }

          {tag === 'asset' && (
            <div
              className="flex absolute -bottom-2 lg:hidden mt-2 items-center w-95vw mx-auto"
              style={{
                left: '2.5vw',
              }}
            >
              <DepositButtonMobile
                onClick={() => {
                  setOperationType('deposit');
                }}
              ></DepositButtonMobile>

              <WithdrawButtonMobile
                onClick={() => {
                  setOperationType('withdraw');
                }}
              ></WithdrawButtonMobile>
              <AssetManagerModal
                isOpen={operationType === 'deposit'}
                onRequestClose={() => {
                  setOperationType(undefined);
                }}
                type={operationType}
                onClick={(amount: string, tokenId: string) => {
                  if (!tokenId) return;
                  return depositOrderly(tokenId, amount);
                }}
                tokenId={operationId}
                accountBalance={Number(
                  displayBalances.find(
                    (b) => b.tokenMeta.id.toLowerCase() === 'near'
                  )?.available || 0
                )}
                tokenInfo={tokenInfo}
                freeCollateral={freeCollateral}
                curHoldingOut={curHoldingOut}
              />

              <AssetManagerModal
                isOpen={operationType === 'withdraw'}
                onRequestClose={() => {
                  setOperationType(undefined);
                }}
                type={operationType}
                onClick={(amount: string, tokenId: string) => {
                  if (!tokenId) return;
                  return withdrawOrderly(tokenId, amount);
                }}
                tokenId={operationId}
                accountBalance={Number(
                  displayBalances.find(
                    (b) => b.tokenMeta.id.toLowerCase() === 'near'
                  )?.available || 0
                )}
                tokenInfo={tokenInfo}
                freeCollateral={freeCollateral}
                curHoldingOut={curHoldingOut}
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
