import React, { useCallback, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import _ from 'lodash';
import {
  RegisterModal,
  validContract,
  REF_ORDERLY_ACCOUNT_VALID,
  REF_ORDERLY_AGREE_CHECK,
} from '../UserBoard';
import { useOrderlyContext } from '../../orderly/OrderlyContext';
import {
  ConnectWallet,
  ConnectWalletPorfolio,
  RegisterButton,
} from '../Common';
import { useWalletSelector } from '../../../../context/WalletSelectorContext';
import { ConfirmButton } from '../Common/index';

import {
  is_orderly_key_announced,
  is_trading_key_set,
} from '../../orderly/on-chain-api';
import { announceKey, setTradingKey, storageDeposit } from '../../orderly/api';

import Table from './Table';
import { FlexRow, FlexRowBetween } from '../Common';
import { MobileFilter } from '../Common/Icons';
import { OrderAsset } from '../AssetModal/state';
import { useMarketlist } from '../../orderly/constantWjsx';

import { MarkPrice, MyOrder, PortfolioTable } from '../../orderly/type';
import { useClientMobile } from '../../../../utils/device';

import 'react-circular-progressbar/dist/styles.css';
import { CONST_ACKNOWLEDGE_WALLET_RISK } from 'src/constants/constLocalStorage';
import { WalletRiskCheckBoxModal } from 'src/context/modal-ui/components/WalletOptions/WalletRiskCheckBox';

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
  setRefOnly,
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
  // validAccountSig,
  futureOrders,
  markPrices,
  lastPrices,
  unrealMode,
  orderPageNum,
  setOrderPageNum,
}: // tradingKeySet,
// setTradingKeySet,
// keyAnnounced,
// setKeyAnnounced,
{
  table: PortfolioTable;
  maintenance: boolean;
  refOnly?: boolean;
  setRefOnly?: (item: boolean) => void;
  orderType?: number;
  setOrderType?: (item: number) => void;
  chooseMarketSymbol?: string;
  setChooseMarketSymbol?: (item: string) => void;
  chooseOrderSide?: 'both_side' | 'BUY' | 'SELL';
  setChooseOrderSide?: (item: 'both_side' | 'BUY' | 'SELL') => void;
  chooseOrderStatus?: 'all' | 'Cancelled' | 'filled' | 'Rejected';
  setChooseOrderStatus?: (
    item: 'all' | 'Cancelled' | 'filled' | 'Rejected'
  ) => void;
  chooseOrderType?: 'all' | 'limit' | 'market';
  setChooseOrderType?: (item: 'all' | 'limit' | 'market') => void;
  newPositions?: any;
  displayBalances: OrderAsset[];
  triggerBalanceBasedData?: number;
  triggerPositionBasedData?: number;
  setMobileFilterOpen?: (item: number) => void;
  handleOpenClosing?: (
    closingQuantity: number,
    closingPrice: number | 'Market',
    row: any
  ) => void;
  validAccountSig?: boolean;
  futureOrders?: MyOrder[];
  markPrices: MarkPrice[];
  lastPrices?: {
    symbol: string;
    close: number;
  }[];
  unrealMode?: 'mark_price' | 'last_price';
  tradingKeySet: boolean;
  setTradingKeySet: (item: boolean) => void;
  keyAnnounced: boolean;
  setKeyAnnounced: (item: boolean) => void;
  orderPageNum?: number;
  setOrderPageNum?: any;
}) {
  const intl = useIntl();
  const { marketList } = useMarketlist();

  const [agreeCheck, setAgreeCheck] = useState<boolean>(false);

  const [tradingKeySet, setTradingKeySet] = useState<boolean>(false);
  const [keyAnnounced, setKeyAnnounced] = useState<boolean>(false);
  // const [agreeCheck, setAgreeCheck] = useState<boolean>(false);
  const [showWalletRisk, setShowWalletRisk] = useState<boolean>(false);
  const handleWalletModalOpen = () => {
    const isAcknowledgeWalletRisk = localStorage.getItem(
      CONST_ACKNOWLEDGE_WALLET_RISK
    );
    if (!isAcknowledgeWalletRisk) {
      setShowWalletRisk(true);
    } else {
      modal.show();
    }
  };
  const handleAcknowledgeClick = (status) => {
    if (status === true) {
      setShowWalletRisk(false);
      localStorage.setItem(CONST_ACKNOWLEDGE_WALLET_RISK, '1');
      modal.show();
    }
  };

  useEffect(() => {
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.style.background =
        'linear-gradient(180deg, #15222B 0%, #001320 100%)';
    }

    // Clean up function to remove the background style when the component dismounts
    return () => {
      if (rootElement) {
        rootElement.style.background = '';
      }
    };
  }, []);

  const {
    storageEnough,
    setValidAccountSig,
    myPendingOrdersRefreshing,
    handlePendingOrderRefreshing,
    validAccountSig,
    userExist,
  } = useOrderlyContext();

  const { accountId, modal } = useWalletSelector();
  const [registerModalOpen, setRegisterModalOpen] = useState<boolean>(false);
  const [openOrderCount, setOpenOrderCount] = useState<number>(0);

  const storedValid = localStorage.getItem(REF_ORDERLY_ACCOUNT_VALID);

  useEffect(() => {
    if (!accountId || !storageEnough) return;

    if (!!storedValid) {
      setValidAccountSig(true);
      setKeyAnnounced(true);
      setTradingKeySet(true);

      return;
    }

    if (localStorage.getItem('temp_on_checking_key_announce')) {
      return;
    } else {
      localStorage.setItem('temp_on_checking_key_announce', '1');
    }

    is_orderly_key_announced(accountId, true)
      .then(async (key_announce) => {
        localStorage.removeItem('temp_on_checking_key_announce');

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

  const [data, setData] = useState<any>([]);
  const [total, setTotal] = useState(0);

  const isMobile = useClientMobile();

  const [tab, setTab] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  const {
    getData,
    id,
    setFilteredData,
    filteredData,
    setFilteredPaginateData,
  } = table.tabs[tab];

  const validator =
    !accountId ||
    !storageEnough ||
    !tradingKeySet ||
    !keyAnnounced ||
    !validContract() ||
    maintenance;

  const handleOrderTypeChange = (t) => {
    if (!setFilteredPaginateData) return;
    let orderRows = [];
    if (t === 0) {
      setFilteredPaginateData(filteredData?.data?.meta);
    } else {
      // if (filteredData?.data?.rows?.length) {
      //   if (t === 1) {
      //     orderRows = filteredData?.data?.rows?.filter(
      //       (d) => !d.symbol.includes('PERP')
      //     );
      //   } else if (t === 2) {
      //     orderRows = filteredData?.data?.rows?.filter((d) =>
      //       d.symbol.includes('PERP')
      //     );
      //   }
      // }
      //
      // setFilteredPaginateData((d) => ({
      //   ...d,
      //   total: orderRows.length,
      // }));
    }
  };

  useEffect(() => {
    if (!(validator && !maintenance && !validAccountSig)) {
      setPage(1);
      setOrderPageNum && setOrderPageNum(1);
      setRefOnly && setRefOnly(false);
      setOrderType && setOrderType(0);
      setChooseMarketSymbol && setChooseMarketSymbol('all_markets');
      setChooseOrderSide && setChooseOrderSide('both_side');
      setChooseOrderStatus && setChooseOrderStatus('all');
      setChooseOrderType && setChooseOrderType('all');
      getData && callGetData();
    }
  }, [tab]);

  useEffect(() => {
    getData && callGetData(orderPageNum);
  }, [orderPageNum, validAccountSig, myPendingOrdersRefreshing]);

  useEffect(() => {
    if (orderType === 0 && (id === 'open_orders' || id === 'history')) {
      if (!(validator && !maintenance && !validAccountSig)) {
        // setLoading(true);
        // setData([]);
        // callGetData();
      }
    }
    setPage(1);
    setOrderPageNum && setOrderPageNum(1);
  }, [orderType]);

  useEffect(() => {
    if (getData && (id === 'open_orders' || id === 'history')) {
      callGetData(1);
    }
    setPage(1);
    setOrderPageNum && setOrderPageNum(1);
  }, [
    refOnly,
    orderType,
    chooseMarketSymbol,
    chooseOrderSide,
    chooseOrderStatus,
    chooseOrderType,
  ]);

  useEffect(() => {
    if (id === 'spot' && !data?.length) {
      setData(displayBalances);
    }
  }, [JSON.stringify(displayBalances)]);

  useEffect(() => {
    if (id === 'futures') {
      setData(newPositions?.rows);
    }
  }, [newPositions?.length]);

  // useEffect(() => {
  //   if (
  //     getData &&
  //     (id === 'deposit' || id === 'withdraw' || id === 'settlements')
  //   ) {
  //     callGetData();
  //   }
  // }, [triggerBalanceBasedData]);
  //
  // useEffect(() => {
  //   if (getData && (id === 'open_orders' || id === 'history')) {
  //     callGetData();
  //   }
  // }, [triggerPositionBasedData, triggerBalanceBasedData]);

  useEffect(() => {
    if (data.length > 1 && data.length < 10 && id === 'open_orders') {
      const currentScrollPosition = window.scrollY || window.pageYOffset;
      const newScrollPosition = currentScrollPosition - 100;

      window.scroll({
        top: newScrollPosition,
        left: 0,
        behavior: 'auto',
      });
    }
    handleOrderTypeChange(orderType);
  }, [data]);

  const callGetData = async (forcePage?: number) => {
    if (!(validator && !maintenance && !validAccountSig)) {
      setLoading(true);
      const res = await getData({ page: forcePage || page });
      forcePage && setPage(forcePage);

      if (!res && id === 'spot') {
        setData(displayBalances);
        setLoading(false);
        return;
      }

      setFilteredData && setFilteredData(res);

      setData(res.data?.rows || []);
      setTotal(res.data?.meta?.total || 0);
      if (id === 'open_orders' && tab === 0)
        setOpenOrderCount(res.data?.meta?.total || 0);
      setLoading(false);
    }
  };
  return (
    <>
      <div className="w-full relative mt-10 xs:mt-5 lg:rounded-2xl shadow-sm text-primaryOrderly text-sm lg:bg-opacity-10 pb-4">
        <span className="text-white gotham_bold text-lg px-5 hidden md:block lg:block">
          {table.title}
        </span>
        <FlexRowBetween className="pb-3 py-3 rounded-t-2xl px-5 mt-0 border-white border-opacity-10 hidden md:flex lg:flex">
          <FlexRowBetween className={`w-full min-h-8 `}>
            <FlexRow>
              {table.tabs.map((tableTab, index) => (
                <FlexRow
                  key={tableTab.id}
                  onClick={() => {
                    if (tab !== index) {
                      if (!(validator && !maintenance && !validAccountSig)) {
                        setLoading(true);
                        setData([]);
                      }
                      setTab(index);
                    }
                  }}
                  className={`justify-center cursor-pointer`}
                >
                  <span
                    className={`px-5 gotham_bold
                      ${
                        tab === index
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
                      <div
                        className="h-0.5 bg-gradientFromHover rounded-lg w-full absolute -bottom-5 left-0"
                        style={{ zIndex: 100 }}
                      />
                    )}
                  </span>
                </FlexRow>
              ))}
            </FlexRow>

            <div className="hidden md:block lg:block">
              {table.tabs[tab].rightComp &&
                table.tabs[tab].rightComp(
                  !(validator && !maintenance && !validAccountSig)
                )}
            </div>
          </FlexRowBetween>
        </FlexRowBetween>

        <div className="md:hidden lg:hidden px-3 flex">
          <div
            className={`relative border flex items-center bg-acccountTab p-1 rounded-lg ${
              table.tabs[tab].filter ? 'w-11/12 inline-flex' : 'w-full'
            }`}
            style={{ borderColor: 'rgba(145, 162, 174, 0.20)' }}
          >
            {table.tabs.map((tableTab, index) => (
              <label
                key={tableTab.id}
                onClick={() => {
                  if (tab !== index) {
                    if (!(validator && !maintenance && !validAccountSig)) {
                      setLoading(true);
                      setData([]);
                    }
                    setTab(index);
                  }
                }}
                className={`flex items-center justify-center w-1/${
                  table.tabs.length
                } py-1 flex-grow text-sm rounded-md  ${
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
                  {tableTab.id === 'open_orders' &&
                    openOrderCount > 0 &&
                    ` (${openOrderCount})`}
                </span>
              </label>
            ))}
          </div>

          {!(validator && !maintenance && !validAccountSig) &&
            table.tabs[tab].filter && (
              <FlexRow
                className={
                  'md:hidden lg:hidden inline-flex w-1/12 justify-center'
                }
                onClick={() => setMobileFilterOpen(tab + 1)}
              >
                <div className="flex items-center justify-center relative">
                  <MobileFilter />
                  {Number(refOnly) +
                    Number(chooseMarketSymbol !== 'all_markets') +
                    Number(chooseOrderSide !== 'both_side') +
                    Number(chooseOrderType !== 'all') +
                    Number(chooseOrderStatus !== 'all') >
                    0 && (
                    <div
                      className="text-cardBg rounded-full bg-gradientFromHover text-center absolute flex justify-center items-center -bottom-1 -right-1"
                      style={{
                        width: '13px',
                        height: '13px',
                        fontSize: '10px',
                      }}
                    >
                      {Number(refOnly) +
                        Number(chooseMarketSymbol !== 'all_markets') +
                        Number(chooseOrderSide !== 'both_side') +
                        Number(chooseOrderType !== 'all') +
                        Number(chooseOrderStatus !== 'all')}
                    </div>
                  )}
                </div>
              </FlexRow>
            )}
        </div>

        <div
          className={`w-full rounded-2xl md:bg-portfolioCardBg lg:bg-portfolioCardBg py-5 md:py-0 lg:py-0`}
        >
          {table.tabs[tab].filter &&
            (refOnly ||
              chooseMarketSymbol !== 'all_markets' ||
              chooseOrderSide !== 'both_side' ||
              chooseOrderType !== 'all' ||
              chooseOrderStatus !== 'all') && (
              <div
                className={
                  'flex md:hidden lg:hidden px-3 pb-1 w-full items-start justify-between flex-wrap'
                }
              >
                <div
                  className={
                    'flex md:hidden lg:hidden px-3 pb-1 w-full items-start justify-between flex-wrap'
                  }
                >
                  <div
                    className="ml-auto flex justify-start items-center flex-wrap"
                    style={{ flex: '0 0 15%' }}
                  >
                    <div className="p-2 flex items-center">
                      {intl.formatMessage({
                        id: 'filter',
                        defaultMessage: 'Filter',
                      })}
                      :
                    </div>
                  </div>
                  <div
                    className="ml-auto flex justify-end flex-wrap"
                    style={{ flex: '0 0 80%' }}
                  >
                    {refOnly && (
                      <div className="flex items-center p-2">
                        {intl.formatMessage({
                          id: 'ref_order',
                          defaultMessage: 'Order on REf',
                        })}
                        <div
                          className="ml-1.5 cursor-pointer"
                          onClick={() => setRefOnly(false)}
                        >
                          <OffFilterIcon />
                        </div>
                      </div>
                    )}
                    {chooseMarketSymbol !== 'all_markets' && (
                      <div className="flex items-center p-2">
                        {
                          marketList.find(
                            (m) => m.textId === chooseMarketSymbol
                          )?.textNoColor
                        }
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
                    {chooseOrderSide !== 'both_side' && (
                      <div className="flex items-center capitalize p-2">
                        {chooseOrderSide}
                        <div
                          className="ml-1.5 cursor-pointer"
                          onClick={() => setChooseOrderSide('both_side')}
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
                </div>
              </div>
            )}
          <div className="relative md:py-5 lg:py-5 md:min-h-80 lg:min-h-80">
            {validator && !maintenance && !validAccountSig && (
              <div
                className="absolute flex flex-col md:justify-center lg:justify-center items-center h-full w-full top-0 left-0 "
                style={{
                  background: 'rgba(0, 19, 32, 0.8)',
                  backdropFilter: 'blur(5px)',
                  zIndex: 50,
                }}
              >
                {/*
                  <div className="hidden md:block lg:block">
                    <RefToOrderly />
                  </div>
                */}
                {!accountId && (
                  <div className="w-half md:w-full lg:w-full flex justify-center flex-col items-center">
                    <div className="md:hidden lg:hidden text-center mb-6">
                      <p>Welcome!</p>
                      <p>Connect your wallet to start</p>
                    </div>

                    <ConnectWalletPorfolio onClick={handleWalletModalOpen} />

                    <WalletRiskCheckBoxModal
                      isOpen={showWalletRisk}
                      setCheckedStatus={handleAcknowledgeClick}
                      onClose={() => setShowWalletRisk(false)}
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

                {!!accountId && !validAccountSig && !storedValid && (
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
            <Table
              data={data || []}
              loading={loading}
              tab={tab}
              tableKey={table.tabs[tab].id}
              defaultSort={table.tabs[tab].defaultSort}
              columns={table.tabs[tab].columns}
              tableRowType={table.tabs[tab].tableRowType}
              tableRowEmpty={table.tabs[tab].tableRowEmpty}
              tableTopComponent={table.tabs[tab].tableTopComponent}
              mobileHeader={table.tabs[tab].mobileHeader}
              mobileRender={table.tabs[tab].mobileRender}
              mobileRenderCustom={table.tabs[tab].mobileRenderCustom}
              total={total}
              page={page}
              setPage={setPage}
              pagination={
                !table.tabs[tab].pagination ? table.tabs[tab].pagination : true
              }
              orderType={orderType}
              handleOpenClosing={handleOpenClosing}
              futureOrders={futureOrders}
              markPrices={markPrices}
              lastPrices={lastPrices}
              unrealMode={unrealMode}
            />

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
        </div>
      </div>
    </>
  );
}

export function TableWithOutTabs({
  table,
  maintenance,
  refOnly,
  setRefOnly,
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
  // validAccountSig,
  futureOrders,
  markPrices,
  lastPrices,
  unrealMode,
  showCurSymbol,
}: // tradingKeySet,
// setTradingKeySet,
// keyAnnounced,
// setKeyAnnounced,
{
  table: PortfolioTable;
  maintenance: boolean;
  refOnly?: boolean;
  showCurSymbol: boolean;
  setRefOnly?: (item: boolean) => void;
  orderType?: number;
  setOrderType?: (item: number) => void;
  chooseMarketSymbol?: string;
  setChooseMarketSymbol?: (item: string) => void;
  chooseOrderSide?: 'both_side' | 'BUY' | 'SELL';
  setChooseOrderSide?: (item: 'both_side' | 'BUY' | 'SELL') => void;
  chooseOrderStatus?: 'all' | 'Cancelled' | 'filled' | 'Rejected';
  setChooseOrderStatus?: (
    item: 'all' | 'Cancelled' | 'filled' | 'Rejected'
  ) => void;
  chooseOrderType?: 'all' | 'limit' | 'market';
  setChooseOrderType?: (item: 'all' | 'limit' | 'market') => void;
  newPositions?: any;
  displayBalances: OrderAsset[];
  triggerBalanceBasedData?: number;
  triggerPositionBasedData?: number;
  setMobileFilterOpen?: (item: number) => void;
  handleOpenClosing?: (
    closingQuantity: number,
    closingPrice: number | 'Market',
    row: any
  ) => void;
  validAccountSig?: boolean;
  futureOrders?: MyOrder[];
  markPrices: MarkPrice[];
  lastPrices?: {
    symbol: string;
    close: number;
  }[];
  unrealMode?: 'mark_price' | 'last_price';
  tradingKeySet: boolean;
  setTradingKeySet: (item: boolean) => void;
  keyAnnounced: boolean;
  setKeyAnnounced: (item: boolean) => void;
}) {
  const {
    storageEnough,
    setValidAccountSig,
    handlePendingOrderRefreshing,
    validAccountSig,
    userExist,
    symbol,
  } = useOrderlyContext();
  const [total, setTotal] = useState(0);
  const isMobile = useClientMobile();
  const [tab, setTab] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const filterFunc = useCallback(
    (row: any) => {
      if (!showCurSymbol) return true;
      else {
        return row.symbol === symbol;
      }
    },
    [showCurSymbol, symbol]
  );

  const data = (newPositions?.rows || []).filter(filterFunc);

  return (
    <Table
      data={data || []}
      loading={loading}
      tab={tab}
      tableKey={table.tabs[tab].id}
      defaultSort={table.tabs[tab].defaultSort}
      columns={table.tabs[tab].columns}
      tableRowType={table.tabs[tab].tableRowType}
      tableRowEmpty={table.tabs[tab].tableRowEmpty}
      tableTopComponent={table.tabs[tab].tableTopComponent}
      mobileHeader={table.tabs[tab].mobileHeader}
      mobileRender={table.tabs[tab].mobileRender}
      mobileRenderCustom={table.tabs[tab].mobileRenderCustom}
      total={total}
      page={page}
      setPage={setPage}
      pagination={
        !table.tabs[tab].pagination ? table.tabs[tab].pagination : true
      }
      orderType={orderType}
      handleOpenClosing={handleOpenClosing}
      futureOrders={futureOrders}
      markPrices={markPrices}
      lastPrices={lastPrices}
      unrealMode={unrealMode}
    />
  );
}

const OffFilterIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="8" cy="8" r="8" fill="#182935" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.14765 6.32208C4.85476 6.02918 4.85476 5.55431 5.14765 5.26142C5.44054 4.96852 5.91542 4.96852 6.20831 5.26142L7.99289 7.046L9.77748 5.26142C10.0704 4.96852 10.5452 4.96852 10.8381 5.26142C11.131 5.55431 11.131 6.02918 10.8381 6.32208L9.05355 8.10666L10.7037 9.7568C10.9966 10.0497 10.9966 10.5246 10.7037 10.8175C10.4108 11.1104 9.93593 11.1104 9.64303 10.8175L7.99289 9.16732L6.34276 10.8175C6.04986 11.1104 5.57499 11.1104 5.2821 10.8175C4.9892 10.5246 4.9892 10.0497 5.2821 9.7568L6.93223 8.10666L5.14765 6.32208Z"
      fill="#7E8A93"
    />
  </svg>
);

export default TableWithTabs;
