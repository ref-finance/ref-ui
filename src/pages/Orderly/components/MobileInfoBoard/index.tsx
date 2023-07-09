import { NearIConSelectModal, OrderlyIconBalance } from '../Common/Icons';

import { digitWrapper, digitWrapperAsset } from '../../utiles';
import { useTokenMetaFromSymbol } from '../ChartHeader/state';
import { useTokenBalance } from '../UserBoard/state';
import { DepositButton, WithdrawButton } from '../Common/index';
import {
  AssetManagerModal,
  REF_ORDERLY_ACCOUNT_VALID,
  REF_ORDERLY_AGREE_CHECK,
  UserBoardMobileSpot,
} from '../UserBoard/index';
import { ChartContainer } from '../TVChartContainer';
import OrderBook, { OrderBookShrink } from '../OrderBook';
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

import { ConfirmButton, QuestionMark } from '../Common/index';

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
import AllOrderBoard from '../AllOrders';
import { isMobile } from '../../../../utils/device';
import { FormattedMessage, useIntl } from 'react-intl';
import { PerpOrderlyTipMobile } from '../PerpHeader';

export const MOBILE_TAB = 'REF_ORDERLY_MOBILE_TAB';

export const MOBILE_DISPLAY = 'REF_ORDERLY_MOBILE_DISPLAY';

export function MobileChartBoard({ maintenance }: { maintenance: boolean }) {
  return (
    <div className="h-full ">
      <ChartContainer maintenance={maintenance} />
    </div>
  );
}

export function CurAsset() {
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

  const tokenOut = useTokenMetaFromSymbol(symbolTo, tokenInfo);

  const [operationId, setOperationId] = useState<string>(tokenIn?.id || '');
  const [showAllAssets, setShowAllAssets] = useState<boolean>(false);

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
  const intl = useIntl();
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
          <FormattedMessage id={'welcome'} defaultMessage={'Welcome'} />!
          <br />
          <FormattedMessage
            id={'welcome_mobile'}
            defaultMessage={'Connect your wallet to start'}
          />
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
            <FormattedMessage
              id={'deposit_assets_to_begin_your_trading_journey'}
              defaultMessage={
                'Deposit assets to begin your {br} trading journey.'
              }
              values={{ br: <br /> }}
            ></FormattedMessage>
          </span>

          <button
            className="flex items-center justify-center py-2 mt-2 px-8 text-white bg-primaryGradient rounded-lg"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOperationType('deposit');
              setOperationId(tokenOut?.id || '');
            }}
          >
            <span className="mr-2">
              {intl.formatMessage({
                id: 'deposit',
                defaultMessage: 'Deposit',
              })}
            </span>

            <HiDownload />
          </button>
        </div>
      )}
      {valid && validAccountSig && holdings && (
        <div
          className="w-full flex flex-col pt-5"
          style={{
            minHeight: '35vh',
          }}
        >
          <div className="grid grid-cols-4 text-sm text-primaryOrderly mb-2">
            <span className="col-span-2  justify-self-start">
              {intl.formatMessage({
                id: 'assets',
                defaultMessage: 'Assets',
              })}
            </span>

            <span className="justify-self-end flex items-center relative right-10">
              {' '}
              <NearIConSelectModal />{' '}
              <span className="ml-2">
                {intl.formatMessage({
                  id: 'wallet_up',
                  defaultMessage: 'Wallet',
                })}
              </span>{' '}
            </span>

            <span className="justify-self-end flex items-center">
              <OrderlyIconBalance></OrderlyIconBalance>
              <span className="ml-2">
                {intl.formatMessage({
                  id: 'available_orderly',
                  defaultMessage: 'Available',
                })}
              </span>{' '}
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

          <div className="text-sm text-white font-bold pt-4 text-left frcb">
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
              {intl.formatMessage({
                id: 'see_all',
                defaultMessage: 'See all',
              })}
            </span>
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

function BookBoard({ maintenance }: { maintenance: boolean }) {
  return (
    <div
      className=" flex-shrink-0 mr-4"
      style={{
        width: 'calc(40% - 20px)',
      }}
    >
      <OrderBookShrink maintenance={maintenance} />
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
  const [agreeCheck, setAgreeCheck] = useState<boolean>(false);

  const { accountId } = useWalletSelector();

  const [keyAnnounced, setKeyAnnounced] = useState<boolean>(false);

  const storedValid = localStorage.getItem(REF_ORDERLY_ACCOUNT_VALID);

  const { userExist } = useOrderlyContext();

  const loading =
    (storageEnough === undefined && !!accountId) ||
    (!!storedValid && !validAccountSig);

  useEffect(() => {
    if (!accountId || !storageEnough) return;

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
    if (userExist) {
      localStorage.removeItem(REF_ORDERLY_AGREE_CHECK);
    }

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
                className="rounded-t-2xl   flex flex-col justify-center items-center h-full w-full px-5 py-4 xs:pb-2"
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

                        window.location.reload();
                      }}
                    ></ConfirmButton>
                  </div>
                )}

                {!!accountId &&
                  validContract() &&
                  (!storageEnough || !tradingKeySet || !keyAnnounced) && (
                    <RegisterButton
                      isOpenMobile={isOpen}
                      setIsOpenMobile={setIsOpen}
                      onClick={() => {
                        if (!accountId || storageEnough) return;

                        if (!userExist) {
                          localStorage.setItem(REF_ORDERLY_AGREE_CHECK, 'true');
                        }

                        storageDeposit(accountId);
                      }}
                      setCheck={setAgreeCheck}
                      check={(isMobile() && storageEnough) || agreeCheck}
                      storageEnough={!!storageEnough}
                      spin={
                        (storageEnough && (!tradingKeySet || !keyAnnounced)) ||
                        agreeCheck
                      }
                      userExist={userExist}
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
                    setCheck={setAgreeCheck}
                    onClick={() => {
                      setIsOpen(true);
                    }}
                    check={agreeCheck}
                    storageEnough={!!storageEnough}
                    spin={
                      storageEnough &&
                      (!tradingKeySet || !keyAnnounced) &&
                      agreeCheck
                    }
                    userExist={userExist}
                  />
                )}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default function ({ maintenance }: { maintenance: boolean }) {
  const storedTab = sessionStorage.getItem(MOBILE_TAB) as any;

  const [tab, setTab] = useState<'balance' | 'chart' | 'book'>(
    storedTab || 'chart'
  );

  const { validAccountSig, ticker } = useOrderlyContext();

  const storedDisplay = sessionStorage.getItem(MOBILE_DISPLAY) as any;

  const [showDisplay, setShowDisplay] = useState<boolean>(
    storedDisplay === 'false' ? false : true
  );

  const handleSetDisplay = (display: boolean) => {
    setShowDisplay(display);

    sessionStorage.setItem(MOBILE_DISPLAY, display.toString());
  };
  const intl = useIntl();
  return (
    <>
      {/* <div className={tab === 'balance' && showDisplay ? '' : 'hidden'}>
        <CurAsset></CurAsset>
      </div>

      <div className={tab === 'chart' && showDisplay ? '' : 'hidden'}>
        <ChartBoard maintenance={maintenance}></ChartBoard>
      </div> */}

      <div className="w-full flex">
        <BookBoard maintenance={maintenance} />

        <UserBoardMobileSpot maintenance={maintenance}></UserBoardMobileSpot>
      </div>

      {!validAccountSig && <RegisterWrapper></RegisterWrapper>}
      {/* {validAccountSig && <UserBoardWrapper />} */}
    </>
  );
}
