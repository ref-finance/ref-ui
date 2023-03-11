import { FlexRow } from '../Common';
import {
  BalanceIcon,
  BookIcon,
  ChartIcon,
  MobileIconCloseUp,
  NearIConSelectModal,
  OrderlyIconBalance,
} from '../Common/Icons';

import { SlArrowUp } from 'react-icons/sl';
import { digitWrapper, digitWrapperAsset } from '../../utiles';
import { useTokenMetaFromSymbol } from '../ChartHeader/state';
import { useTokenBalance } from '../UserBoard/state';
import { DepositButton, WithdrawButton } from '../Common/index';
import {
  AssetManagerModal,
  REF_ORDERLY_ACCOUNT_VALID,
  REF_ORDERLY_AGREE_CHECK,
} from '../UserBoard/index';
import { ChartContainer } from '../TVChartContainer';
import OrderBook from '../OrderBook';
import { OrderlyLoading } from '../Common/Icons';

import React, { useState, useEffect, useRef, useDebugValue } from 'react';
import { useOrderlyContext } from '../../orderly/OrderlyContext';
import { parseSymbol } from '../RecentTrade/index';
import {
  nearMetadata,
  getFTmetadata,
  orderlyViewFunction,
  ftGetBalance,
  toPrecision,
  percent,
  scientificNotationToString,
  percentOfBigNumber,
} from '../../near';
import { useWalletSelector } from '../../../../context/WalletSelectorContext';
import { HiDownload } from 'react-icons/hi';
import {
  announceKey,
  depositFT,
  depositOrderly,
  setTradingKey,
  storageDeposit,
  withdrawOrderly,
} from '../../orderly/api';
import {
  getAccountInformation,
  getCurrentHolding,
  createOrder,
  getOrderByOrderId,
} from '../../orderly/off-chain-api';
import {
  Holding,
  ClientInfo,
  TokenInfo,
  TokenMetadata,
} from '../../orderly/type';
import { FaMinus, FaPlus } from 'react-icons/fa';
import Modal from 'react-modal';
import Big from 'big.js';
import { IoClose } from 'react-icons/io5';
import { MdArrowDropDown } from 'react-icons/md';
import {
  IoIosArrowForward,
  IoIosArrowDown,
  IoIosArrowUp,
} from 'react-icons/io';
import { CheckBox, ConnectWallet, ErrorTip, RegisterButton } from '../Common';

import { orderPopUp, ConfirmButton, QuestionMark } from '../Common/index';

import { FiSearch } from 'react-icons/fi';
import {
  OrderlyNetworkIcon,
  OutLinkIcon,
  PowerByOrderly,
  RefToOrderly,
  Agree,
} from '../Common/Icons';

import { MdKeyboardArrowDown } from 'react-icons/md';
import {
  is_orderly_key_announced,
  is_trading_key_set,
} from '../../orderly/on-chain-api';
import getConfig from '../../config';
import { AssetModal } from '../AssetModal';
import ReactTooltip from 'react-tooltip';
import { ButtonTextWrapper } from '~components/button/Button';
import { useAllSymbolInfo } from '../AllOrders/state';
import { ONLY_ZEROS } from '../../../../utils/numbers';
import * as math from 'mathjs';
import { NearWalletIcon } from '../Common/Icons';
import { getSelectedWalletId } from '../../orderly/utils';
import { BuyButton, SellButton } from '../UserBoard/Button';
import { MobileUserBoard } from '../UserBoard/index';
import AllOrderBoard from '../AllOrders';

export const MOBILE_TAB = 'REF_ORDERLY_MOBILE_TAB';

export const MOBILE_DISPLAY = 'REF_ORDERLY_MOBILE_DISPLAY';

function ChartBoard() {
  const { validAccountSig, ticker } = useOrderlyContext();

  return (
    <div className="h-full ">
      {ticker && (
        <div className="flex items-center text-xs mx-4 justify-between">
          <div className="flex items-center">
            <span className="text-primaryText mr-2">24h Vol</span>

            <span className="text-white">
              ${toPrecision(ticker.amount.toString(), 3, true)}
            </span>
          </div>

          <div className="flex items-center">
            <span className="text-primaryText">24h Range</span>

            <span className="text-white ml-2">
              {digitWrapper(ticker.low.toString(), 3)} -{' '}
              {digitWrapper(ticker.high.toString(), 3)}
            </span>
          </div>
        </div>
      )}
      <ChartContainer />
    </div>
  );
}

function CurAsset() {
  const {
    symbol,
    orders,
    tokenInfo,
    storageEnough,
    balances,
    setValidAccountSig,
    handlePendingOrderRefreshing,
    validAccountSig,
    myPendingOrdersRefreshing,
    bridgePrice,
  } = useOrderlyContext();
  const [holdings, setHoldings] = useState<Holding[]>();

  const { accountId } = useWalletSelector();

  useEffect(() => {
    if (!accountId) return;

    getCurrentHolding({ accountId }).then((res) => {
      setHoldings(res.data.holding);
    });
  }, [accountId, myPendingOrdersRefreshing, validAccountSig]);

  const { symbolFrom, symbolTo } = parseSymbol(symbol);

  const curHoldingIn = holdings?.find((h) => h.token === symbolFrom);

  const curHoldingOut = holdings?.find((h) => h.token === symbolTo);
  const [operationType, setOperationType] = useState<'deposit' | 'withdraw'>();

  const tokenInHolding = curHoldingIn
    ? curHoldingIn.holding + curHoldingIn.pending_short
    : balances && balances[symbolFrom]?.holding;

  const tokenOutHolding = curHoldingOut
    ? curHoldingOut.holding + curHoldingOut.pending_short
    : balances && balances[symbolTo]?.holding;

  const tokenIn = useTokenMetaFromSymbol(symbolFrom, tokenInfo);
  const [operationId, setOperationId] = useState<string>(tokenIn?.id || '');
  const [showAllAssets, setShowAllAssets] = useState<boolean>(false);

  const tokenOut = useTokenMetaFromSymbol(symbolTo, tokenInfo);

  const tokenFromBalance = useTokenBalance(
    tokenIn?.id,
    JSON.stringify(balances)
  );

  const tokenToBalance = useTokenBalance(
    tokenOut?.id,
    JSON.stringify(balances)
  );

  const allHoldings =
    holdings &&
    holdings.reduce((acc, cur, i) => {
      return acc + cur.holding + cur.pending_short;
    }, 0);

  const valid = !!accountId && (holdings === undefined || allHoldings > 0);

  return (
    <>
      {(!accountId || !validAccountSig) && (
        <div
          style={{
            minHeight: '35vh',
          }}
          className="flex flex-col text-center items-center justify-center text-primaryText"
        >
          Welcome!
          <br />
          Connect your wallet to start
        </div>
      )}

      {!!accountId && holdings && allHoldings === 0 && validAccountSig && (
        <div
          style={{
            minHeight: '35vh',
          }}
          className="flex flex-col items-center justify-center text-primaryText"
        >
          <span className="text-center">
            Deposit assets to begin your
            <br />
            trading journey.
          </span>

          <button
            className="flex items-center justify-center py-2 mt-2 px-8 text-white bg-primaryGradient rounded-lg"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOperationType('deposit');
              setOperationId(tokenIn?.id || '');
            }}
          >
            <span className="mr-2">Deposit</span>

            <HiDownload />
          </button>
        </div>
      )}
      {valid && validAccountSig && holdings && (
        <div
          className="w-full flex flex-col "
          style={{
            minHeight: '35vh',
          }}
        >
          <div className="text-sm text-white font-bold mb-4 text-left flex items-center justify-between">
            <div className="flex items-center">
              <DepositButton
                onClick={() => {
                  setOperationType('deposit');
                  setOperationId(tokenIn?.id || '');
                }}
              ></DepositButton>

              <WithdrawButton
                onClick={() => {
                  setOperationType('withdraw');
                  setOperationId(tokenIn?.id || '');
                }}
              ></WithdrawButton>
            </div>

            <span
              className="text-base font-normal text-gradientFromHover "
              onClick={() => {
                setShowAllAssets(true);
              }}
            >
              See all
            </span>
          </div>

          <div className="grid grid-cols-4 text-sm text-primaryOrderly mb-2">
            <span className="col-span-2  justify-self-start">Assets</span>

            <span className="justify-self-end flex items-center relative right-10">
              {' '}
              <NearIConSelectModal /> <span className="ml-2">Wallet</span>{' '}
            </span>

            <span className="justify-self-end flex items-center">
              <OrderlyIconBalance></OrderlyIconBalance>
              <span className="ml-2">Available</span>{' '}
            </span>
          </div>

          <div className="grid grid-cols-4 items-center mb-5 text-white text-sm justify-between">
            <div className="flex items-center justify-self-start col-span-2">
              <img
                src={tokenIn?.icon}
                alt=""
                className="rounded-full w-6 h-6 mr-2"
              />
              <span>{symbolFrom}</span>
            </div>

            <div className="justify-self-end relative right-10">
              {!!tokenFromBalance
                ? digitWrapperAsset(tokenFromBalance, 2)
                : '-'}
            </div>

            <div className="flex items-center justify-self-end">
              <span>
                {tokenInHolding
                  ? digitWrapperAsset(tokenInHolding.toString(), 2)
                  : 0}
              </span>
            </div>
          </div>

          <div className=" items-center text-white text-sm justify-between grid grid-cols-4">
            <div className="flex items-center justify-self-start col-span-2">
              <img
                src={tokenOut?.icon}
                className="rounded-full w-6 h-6 mr-2"
                alt=""
              />
              <span>{symbolTo}</span>
            </div>

            <div className="justify-self-end relative right-10">
              {!!tokenToBalance ? digitWrapperAsset(tokenToBalance, 2) : ''}
            </div>

            <div className="flex items-center justify-self-end">
              <span>
                {tokenOutHolding
                  ? digitWrapperAsset(tokenOutHolding.toString(), 2)
                  : 0}
              </span>
            </div>
          </div>
        </div>
      )}

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
        accountBalance={tokenInHolding || 0}
        tokenInfo={tokenInfo}
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
        accountBalance={tokenInHolding || 0}
        tokenInfo={tokenInfo}
      />
      {showAllAssets && (
        <AssetModal
          isOpen={showAllAssets}
          onRequestClose={() => {
            setShowAllAssets(false);
          }}
        ></AssetModal>
      )}
    </>
  );
}

function BookBoard() {
  return (
    <div
      className="w-full "
      style={{
        height: 'calc(52vh + 16px)',
      }}
    >
      <OrderBook />
    </div>
  );
}

function RegisterWrapper() {
  const {
    symbol,
    orders,
    tokenInfo,
    storageEnough,
    balances,
    setValidAccountSig,
    handlePendingOrderRefreshing,
    validAccountSig,
    myPendingOrdersRefreshing,
    bridgePrice,
  } = useOrderlyContext();

  const [tradingKeySet, setTradingKeySet] = useState<boolean>(false);
  const [agreeCheck, setAgreeCheck] = useState<boolean>(
    !!localStorage.getItem(REF_ORDERLY_AGREE_CHECK) || false
  );

  const { accountId } = useWalletSelector();

  const [keyAnnounced, setKeyAnnounced] = useState<boolean>(false);

  const storedValid = localStorage.getItem(REF_ORDERLY_ACCOUNT_VALID);

  const { userExist } = useOrderlyContext();

  const loading =
    (storageEnough === undefined && !!accountId) ||
    (!!storedValid && !validAccountSig);

  useEffect(() => {
    if (!accountId || !storageEnough || !agreeCheck) return;

    if (!!storedValid) {
      setValidAccountSig(true);
      setKeyAnnounced(true);
      setTradingKeySet(true);

      return;
    }

    is_orderly_key_announced(accountId)
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

  const [isOpen, setIsOpen] = useState<boolean>(true);

  useEffect(() => {
    if (!tradingKeySet || !keyAnnounced) return;

    localStorage.setItem(REF_ORDERLY_ACCOUNT_VALID, '1');

    handlePendingOrderRefreshing();

    setValidAccountSig(true);
    setIsOpen(false);
  }, [tradingKeySet, keyAnnounced]);

  function validContract() {
    const selectedWalletId = getSelectedWalletId();

    if (selectedWalletId === 'sender') {
      //@ts-ignore
      return !!window?.near?.authData?.allKeys?.[
        getConfig().ORDERLY_ASSET_MANAGER
      ];
    }

    const walletStoredContract = localStorage.getItem(
      'near-wallet-selector:contract'
    );

    if (!walletStoredContract) {
      return true;
    } else {
      const parsedContract = JSON.parse(walletStoredContract)?.contractId;

      if (
        parsedContract &&
        parsedContract !== getConfig().ORDERLY_ASSET_MANAGER
      ) {
        return false;
      }

      return true;
    }
  }

  const validator =
    !accountId ||
    !storageEnough ||
    !tradingKeySet ||
    !keyAnnounced ||
    !validContract();

  // if (!validator && loading) return null;

  if (!validator && !loading) return null;

  return (
    <>
      {!(!isOpen || !accountId) && (
        <Modal
          isOpen={true}
          onRequestClose={() => {
            setIsOpen(false);
          }}
          style={{
            overlay: {
              backgroundColor:
                !isOpen || !accountId ? 'transparent' : 'rgba(0,0,0,0.7)',
            },
            content: {
              position: 'fixed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              top: 'none',
              bottom: '0px',
              left: '50%',
              transform: 'translate(-50%, -30px)',
              outline: 'none',
            },
          }}
        >
          <div className=" rounded-t-2xl lg:w-p410 xs:w-screen gradientBorderWrapperNoShadowOrderly bg-boxBorder text-sm text-primaryOrderly  ">
            {loading && isOpen && (
              <div
                className="absolute  flex flex-col justify-center items-center h-full w-full top-0 left-0 "
                style={{
                  background: 'rgba(0, 19, 32, 0.8)',
                  backdropFilter: 'blur(5px)',
                  zIndex: 90,
                  minHeight: '200px',
                }}
              >
                <OrderlyLoading></OrderlyLoading>
              </div>
            )}

            {validator && !loading && (
              <div
                className="rounded-t-2xl   flex flex-col justify-center items-center h-full w-full px-5 py-4 "
                style={{
                  background: 'rgba(0, 19, 32, 0.8)',
                  backdropFilter: 'blur(5px)',
                  zIndex: 80,
                }}
              >
                <div
                  className={
                    !isOpen ? 'hidden' : 'flex items-center justify-center pt-2'
                  }
                >
                  {!(!accountId || !validContract()) && (
                    <RefToOrderly></RefToOrderly>
                  )}
                </div>
                {!!accountId &&
                  validContract() &&
                  (!storageEnough || !tradingKeySet || !keyAnnounced) &&
                  isOpen && (
                    <div className="text-white mb-4 px-8 text-sm text-start">
                      <div>
                        This orderbook page is a graphical user interface of
                        Orderly Network, that allows users to trade on the
                        convenience of its infrastructures.
                        <br />
                        {userExist
                          ? 'You are connecting to your orderly account now. '
                          : 'You are creating an orderly account now. '}
                        Learn more about
                        <span
                          className="underline ml-1 cursor-pointer"
                          onClick={() => {
                            window.open('https://orderly.network/', '_blank');
                          }}
                        >
                          Orderly Network
                        </span>
                      </div>
                      <div className="flex items-center justify-center  mt-2">
                        <div
                          className="mr-2 cursor-pointer"
                          onClick={() => {
                            if (!agreeCheck) {
                              localStorage.setItem(
                                REF_ORDERLY_AGREE_CHECK,
                                'true'
                              );
                            } else {
                              localStorage.removeItem(REF_ORDERLY_AGREE_CHECK);
                            }

                            setAgreeCheck(!agreeCheck);
                          }}
                        >
                          <Agree check={agreeCheck}></Agree>
                        </div>

                        <span>I agree</span>
                      </div>
                    </div>
                  )}
                {!accountId && (
                  <ConnectWallet
                    onClick={() => {
                      window.modal.show();
                      setIsOpen(false);
                    }}
                  ></ConnectWallet>
                )}

                {accountId && !validContract() && (
                  <div className="relative bottom-1 break-words inline-flex flex-col items-center">
                    <div
                      className={
                        !isOpen
                          ? 'hidden'
                          : 'text-base w-p200 pb-6 text-center text-white'
                      }
                    >
                      Using Orderbook request re-connect wallet
                    </div>
                    <ConfirmButton
                      onClick={async () => {
                        // window.modal.show();
                        const wallet = await window.selector.wallet();
                        await wallet.signOut();
                      }}
                    ></ConfirmButton>

                    <div
                      className={
                        !isOpen
                          ? 'hidden'
                          : 'flex items-center mt-2 justify-center'
                      }
                    >
                      <PowerByOrderly />
                    </div>
                  </div>
                )}

                {!!accountId &&
                  validContract() &&
                  (!storageEnough || !tradingKeySet || !keyAnnounced) && (
                    <RegisterButton
                      isOpenMobile={isOpen}
                      setIsOpenMobile={setIsOpen}
                      onClick={() => {
                        setIsOpen(true);

                        if (!accountId || storageEnough) return;
                        storageDeposit(accountId);
                      }}
                      check={agreeCheck}
                      storageEnough={!!storageEnough}
                      spin={
                        storageEnough &&
                        (!tradingKeySet || !keyAnnounced) &&
                        agreeCheck
                      }
                    />
                  )}
              </div>
            )}
          </div>
        </Modal>
      )}

      {(!isOpen || !accountId) && (
        <div
          className=" rounded-t-2xl lg:w-p410 xs:w-screen fixed bottom-8 left-0 gradientBorderWrapperNoShadowOrderly bg-boxBorder text-sm text-primaryOrderly  "
          style={{
            zIndex: 99,
          }}
        >
          {loading && isOpen && (
            <div
              className="absolute  flex flex-col justify-center items-center h-full w-full top-0 left-0 "
              style={{
                background: 'rgba(0, 19, 32, 0.8)',
                backdropFilter: 'blur(5px)',
                zIndex: 90,
                minHeight: '200px',
              }}
            >
              <OrderlyLoading></OrderlyLoading>
            </div>
          )}

          {validator && !loading && (
            <div
              className="rounded-t-2xl   flex flex-col justify-center items-center h-full w-full px-5 py-4 "
              style={{
                background: 'rgba(0, 19, 32, 0.8)',
                backdropFilter: 'blur(5px)',
                zIndex: 80,
              }}
            >
              <div
                className={
                  !isOpen ? 'hidden' : 'flex items-center justify-center pt-2'
                }
              >
                {!(!accountId || !validContract()) && (
                  <RefToOrderly></RefToOrderly>
                )}
              </div>
              {!!accountId &&
                validContract() &&
                (!storageEnough || !tradingKeySet || !keyAnnounced) &&
                isOpen && (
                  <div className="text-white mb-4 px-8 text-sm text-start">
                    <div>
                      This orderbook page is a graphical user interface of
                      Orderly Network, that allows users to trade on the
                      convenience of its infrastructures.
                      <br />
                      {userExist
                        ? 'You are connecting to your orderly account now. '
                        : 'You are creating an orderly account now. '}
                      Learn more about
                      <span
                        className="underline ml-1 cursor-pointer"
                        onClick={() => {
                          window.open('https://orderly.network/', '_blank');
                        }}
                      >
                        Orderly Network
                      </span>
                    </div>
                    <div className="flex items-center justify-center  mt-2">
                      <div
                        className="mr-2 cursor-pointer"
                        onClick={() => {
                          if (!agreeCheck) {
                            localStorage.setItem(
                              REF_ORDERLY_AGREE_CHECK,
                              'true'
                            );
                          } else {
                            localStorage.removeItem(REF_ORDERLY_AGREE_CHECK);
                          }

                          setAgreeCheck(!agreeCheck);
                        }}
                      >
                        <Agree check={agreeCheck}></Agree>
                      </div>

                      <span>I agree</span>
                    </div>
                  </div>
                )}
              {!accountId && (
                <ConnectWallet
                  onClick={() => {
                    window.modal.show();
                    setIsOpen(false);
                  }}
                ></ConnectWallet>
              )}

              {accountId && !validContract() && (
                <div className="relative bottom-1 break-words inline-flex flex-col items-center">
                  <div
                    className={
                      !isOpen
                        ? 'hidden'
                        : 'text-base w-p200 pb-6 text-center text-white'
                    }
                  >
                    Using Orderbook request re-connect wallet
                  </div>
                  <ConfirmButton
                    onClick={async () => {
                      // window.modal.show();
                      const wallet = await window.selector.wallet();
                      await wallet.signOut();
                    }}
                  ></ConfirmButton>

                  <div
                    className={
                      !isOpen
                        ? 'hidden'
                        : 'flex items-center mt-2 justify-center'
                    }
                  >
                    <PowerByOrderly />
                  </div>
                </div>
              )}

              {!!accountId &&
                validContract() &&
                (!storageEnough || !tradingKeySet || !keyAnnounced) && (
                  <RegisterButton
                    isOpenMobile={false}
                    setIsOpenMobile={setIsOpen}
                    onClick={() => {
                      setIsOpen(true);

                      if (!accountId || storageEnough) return;
                      storageDeposit(accountId);
                    }}
                    check={agreeCheck}
                    storageEnough={!!storageEnough}
                    spin={
                      storageEnough &&
                      (!tradingKeySet || !keyAnnounced) &&
                      agreeCheck
                    }
                  />
                )}
            </div>
          )}
        </div>
      )}
    </>
  );
}

function UserBoardWrapper() {
  const [showWrapper, setShowWrapper] = useState<boolean>(false);
  const [side, setSide] = useState<'Buy' | 'Sell'>('Buy');

  const [showButton, setShowButton] = useState<boolean>(true);

  useEffect(() => {
    const element = document.body;
    let prevState = element.classList.contains('ReactModal__Body--open');
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        const { target } = mutation;

        if (mutation.attributeName === 'class') {
          //@ts-ignore
          const currentState = mutation.target.classList.contains(
            'ReactModal__Body--open'
          );
          if (prevState !== currentState) {
            prevState = currentState;
            if (currentState) {
              setShowButton(false);
            } else {
              setShowButton(true);
            }
          }
        }
      });
    });

    observer.observe(element, {
      attributes: true,
    });
  }, []);

  return (
    <>
      <div
        className={
          !showButton
            ? 'hidden'
            : 'w-screen left-0 rounded-t-2xl bg-boxBorder gradientBorderWrapperNoShadowOrderly fixed  bottom-0'
        }
        style={{
          zIndex: 99,
        }}
      >
        <div className="flex items-center px-4 rounded-t-2xl bg-boxBorder pb-12 pt-5 w-full justify-center  ">
          <BuyButton
            onClick={() => {
              setSide('Buy');
              setShowWrapper(true);
            }}
            select
            mobile
          />

          <SellButton
            onClick={() => {
              setSide('Sell');
              setShowWrapper(true);
            }}
            select
            mobile
          />
        </div>
      </div>

      <Modal
        isOpen={showWrapper}
        onRequestClose={() => {
          setShowWrapper(false);
        }}
        style={{
          content: {
            position: 'fixed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            top: 'none',
            bottom: '0px',
            left: '50%',
            transform: 'translate(-50%, -30px)',
            outline: 'none',
          },
        }}
      >
        <div className=" rounded-t-2xl lg:w-p410 xs:w-screen bg-boxBorder text-sm text-primaryOrderly  ">
          <MobileUserBoard
            setShowWrapper={setShowWrapper}
            side={side}
            setSide={setSide}
          />
        </div>
      </Modal>
    </>
  );
}

export default function () {
  const storedTab = sessionStorage.getItem(MOBILE_TAB) as any;

  const [tab, setTab] = useState<'balance' | 'chart' | 'book'>(
    storedTab || 'chart'
  );

  const { validAccountSig, ticker } = useOrderlyContext();

  const storedDisplay = sessionStorage.getItem(MOBILE_DISPLAY) as any;

  const [showDisplay, setShowDisplay] = useState<boolean>(
    storedDisplay === 'false' ? false : true
  );

  const handleSetTab = (tab: any) => {
    setTab(tab);

    sessionStorage.setItem(MOBILE_TAB, tab);
  };

  const handleSetDisplay = (display: boolean) => {
    setShowDisplay(display);

    sessionStorage.setItem(MOBILE_DISPLAY, display.toString());
  };

  return (
    <>
      <div className={tab === 'balance' && showDisplay ? '' : 'hidden'}>
        <CurAsset></CurAsset>
      </div>

      <div className={tab === 'chart' && showDisplay ? '' : 'hidden'}>
        <ChartBoard></ChartBoard>
      </div>

      <div className={tab === 'book' && showDisplay ? '' : 'hidden'}>
        <BookBoard></BookBoard>
      </div>

      <div className="w-full mx-auto flex mt-2 h-9 items-stretch">
        <div className="flex items-center text-13px font-bold text-primaryText w-full rounded-lg bg-darkBg2 p-0.5 mr-2">
          <FlexRow
            className={`w-1/3 justify-center rounded-lg py-2 ${
              tab === 'balance' && showDisplay ? 'bg-selectBg text-white' : ''
            }`}
            onClick={(e) => {
              if (!showDisplay) return;

              handleSetTab('balance');
            }}
          >
            <BalanceIcon></BalanceIcon>
            <span className="ml-1">Balance</span>
          </FlexRow>

          <FlexRow
            className={`w-1/3 py-2 justify-center rounded-lg ${
              tab === 'chart' && showDisplay ? 'bg-selectBg text-white' : ''
            }`}
            onClick={() => {
              if (!showDisplay) return;

              handleSetTab('chart');
            }}
          >
            <ChartIcon></ChartIcon>
            <span className="ml-1">Chart</span>
          </FlexRow>

          <FlexRow
            className={`rounded-lg justify-center w-1/3 py-2 ${
              tab === 'book' && showDisplay ? 'bg-selectBg text-white' : ''
            }`}
            onClick={() => {
              if (!showDisplay) return;

              handleSetTab('book');
            }}
          >
            <BookIcon></BookIcon>
            <span className="ml-1">Book</span>
          </FlexRow>
        </div>

        <div
          className={`rounded-lg flex-shrink-0 flex ${
            !showDisplay ? 'bg-gradientFrom' : 'bg-darkBg2'
          }  w-10 items-center justify-center`}
        >
          <span
            className={`text-white ${
              !showDisplay ? 'transform rotate-180' : ''
            } `}
            onClick={() => {
              handleSetDisplay(!showDisplay);
            }}
          >
            {/* <SlArrowUp></SlArrowUp> */}
            <MobileIconCloseUp></MobileIconCloseUp>
          </span>
        </div>
      </div>
      {!validAccountSig && <RegisterWrapper></RegisterWrapper>}
      {validAccountSig && <UserBoardWrapper />}
    </>
  );
}
