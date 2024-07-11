import React, { useState, useEffect, useRef, useDebugValue } from 'react';
import { useOrderlyContext } from '../../orderly/OrderlyContext';
import { parseSymbol } from '../RecentTrade/index';
import { useInView } from 'react-intersection-observer';

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
  createOrder,
  getOrderByOrderId,
} from '../../orderly/off-chain-api';
import {
  Holding,
  ClientInfo,
  TokenInfo,
  TokenMetadata,
} from '../../orderly/type';
import { BuyButton, SellButton } from './Button';
import './index.css';
import Modal from 'react-modal';
import Big from 'big.js';
import {
  IoIosArrowDown,
  IoIosArrowUp,
  IoClose,
  MdArrowDropDown,
  FiSearch,
  MdKeyboardArrowDown,
} from '../../../../components/reactIcons';
import {
  CheckBox,
  ConnectWallet,
  ErrorTip,
  RegisterButton,
  WithdrawButton,
} from '../Common';

import {
  orderPopUp,
  DepositButton,
  ConfirmButton,
  QuestionMark,
} from '../Common/index';
import { useTokenBalance, useTokensBalances } from './state';
import {
  PerpOrSpot,
  digitWrapper,
  digitWrapperAsset,
  numberWithCommas,
} from '../../utiles';

import {
  NearIConSelectModal,
  OrderlyNetworkIcon,
  OutLinkIcon,
  PowerByOrderly,
  RefToOrderly,
  Agree,
  OrderlyLoading,
  OrderlyIconBalance,
  RefToOrderlyMobile,
  ArrowCurve,
} from '../Common/Icons';

import {
  is_orderly_key_announced,
  is_trading_key_set,
} from '../../orderly/on-chain-api';
import getConfig from '../../config';
import { useTokenMetaFromSymbol } from '../ChartHeader/state';
import { AssetModal } from '../AssetModal';
import { ButtonTextWrapper } from '../../../../components/button/Button';
import { FlexRow, orderEditPopUpFailure } from '../Common/index';
import { ONLY_ZEROS } from '../../../../utils/numbers';
import * as math from 'mathjs';
import {
  getSelectedWalletId,
  generateTradingKeyPair,
} from '../../orderly/utils';
import { useClientMobile, isMobile } from '../../../../utils/device';
import { QuestionTip } from '../../../../components/layout/TipWrapper';
import { FormattedMessage, useIntl } from 'react-intl';
import { REF_FI_SENDER_WALLET_ACCESS_KEY } from '../../orderly/utils';
import { useHistory } from 'react-router-dom';
import { usePerpData } from '../UserBoardPerp/state';
import { tickToPrecision } from '../UserBoardPerp/math';
import { DetailBox } from '../UserBoardPerp/components/DetailBox';
import { DepositTip } from '../UserBoardPerp/components/DepositTip';
import { NewUserTip } from '../Common/NewUserTip';
import { CollatteralTokenAvailableCell } from '../UserBoardPerp/components/HoverText';
import getConfigV2 from '../../../../services/configV2';
import { useOrderlyBalancesStore } from '../../../../stores/orderlyBalances';
const configV2 = getConfigV2();
import CustomTooltip from 'src/components/customTooltip/customTooltip';

function getTipFOK() {
  const intl = useIntl();
  return `<div class=" rounded-md w-p200 text-primaryOrderly  text-xs  text-left">
    ${intl.formatMessage({
      id: 'tip_fok',
      defaultMessage:
        'Fill-Or-Kill is an order to buy or sell that must be executed immediately in its entirety; otherwise, the entire order will be cancelled.',
    })} 
  </div>`;
}

function getTipPostOnly() {
  const intl = useIntl();
  return `<div class=" rounded-md w-p200 text-primaryOrderly  text-xs  text-left">

    ${intl.formatMessage({
      id: 'tip_post_only',
      defaultMessage:
        'Post Only ensures that traders can only place an order if it would be posted to the orderbook as a Maker order. An order which would be posted as a Taker order will be cancelled.',
    })}

  </div>`;
}

function getTipIoc() {
  const intl = useIntl();
  return `<div class=" rounded-md w-p200 text-primaryOrderly  text-xs  text-left">
  ${intl.formatMessage({
    id: 'tip_ioc',
    defaultMessage:
      'Immediate-Or-Cancel is an order to buy or sell that must be filled immediately. Any portion of an IOC order that cannot be filled will be cancelled.',
  })}
  </div>`;
}

export function validContract() {
  const selectedWalletId = getSelectedWalletId();

  if (selectedWalletId === 'sender') {
    const storedKey = localStorage.getItem(REF_FI_SENDER_WALLET_ACCESS_KEY);

    return (
      //@ts-ignore
      !!window?.near?.authData?.allKeys?.[getConfig().ORDERLY_ASSET_MANAGER] ||
      (storedKey &&
        JSON.parse(storedKey)?.allKeys?.[getConfig().ORDERLY_ASSET_MANAGER])
    );
  }

  if (selectedWalletId === 'neth') return true;

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

export function RegisterModal(
  props: Modal.Props & {
    orderlyRegistered: boolean;
    onConfirm: () => void;
    userExist: boolean;
  }
) {
  const { orderlyRegistered, onRequestClose, isOpen, onConfirm, userExist } =
    props;

  const intl = useIntl();

  const isMobile = useClientMobile();

  return (
    <Modal
      {...props}
      style={{
        content: {
          transform: isMobile
            ? 'translate(-50%, -27%)'
            : 'translate(-50%, -65%)',
        },
      }}
    >
      <div
        className={` rounded-2xl gradientBorderWrapperZ  border  bg-boxBorder text-sm text-white  `}
        style={{
          width: isMobile ? '100vw' : '460px',
        }}
      >
        <div className=" py-6 text-white text-sm flex flex-col px-6">
          {isMobile ? (
            <div className="frcc">
              <RefToOrderlyMobile></RefToOrderlyMobile>
            </div>
          ) : (
            <div className="flex px-4 items-center pb-4 justify-end">
              <span
                className={'cursor-pointer text-primaryText'}
                onClick={(e: any) => {
                  onRequestClose && onRequestClose(e);
                }}
              >
                <IoClose size={20} />
              </span>
            </div>
          )}

          {isMobile && (
            <div className="lg:px-6 font-gothamBold xs:font-bold text-white pb-5 text-center text-base xs:text-sm">
              {userExist
                ? intl.formatMessage({
                    id: 'connect_to_orderly_account',
                    defaultMessage:
                      "You need to (re)connect your Orderly account to use Ref's Orderbook.",
                  })
                : intl.formatMessage({
                    id: 'first_register_orderly_tip',
                    defaultMessage:
                      'Your wallet must first be registered with Orderly in order to use the Orderbook.',
                  })}
            </div>
          )}

          <div className="flex flex-col xs:h-48 xs:text-sm xs:text-primaryText xs:overflow-auto">
            <div>
              <FormattedMessage
                id="more_order_book_page_detail"
                values={{
                  br: <br />,
                }}
                defaultMessage={
                  'This Orderbook page is powered by Orderly Network, users are strongly encouraged to do their own research before connecting their wallet and/or placing any orders.{br} Ref Finance does not guarantee the security of the systems, smart contracts, and any funds deposited or sent to those systems and contracts.{br} Neither Ref Finance nor Orderly Network is responsible for any profit or loss of investment users made through this Orderbook page.'
                }
              />
            </div>

            <div className="py-5">
              {!orderlyRegistered && (
                <span className="mr-1">
                  {intl.formatMessage({
                    id: 'must_register_tip',
                    defaultMessage:
                      'Your wallet must be registered with Orderly to trade on their system.',
                  })}
                </span>
              )}{' '}
              {intl.formatMessage({
                id: 'learn_more_about',
                defaultMessage: 'Learn more about',
              })}
              <a
                className="underline text-primary ml-1"
                href="https://orderly.org/"
                target="_blank"
                rel="noopener noreferrer nofollow"
              >
                Orderly Network
              </a>
              {intl.formatMessage({
                id: 'learn_more_about_zh',
                defaultMessage: '.',
              })}
            </div>

            <div>
              {intl.formatMessage({
                id: 'by_click_confirm',
                defaultMessage:
                  'By clicking "Confirm", you confirm that you have comprehensively reviewed and comprehended the contents aforementioned',
              })}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <button
              type="button"
              className="bg-primaryGradient w-52 xs:w-full rounded-lg mt-5 text-white flex items-center justify-center py-2.5 text-base"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRequestClose && onRequestClose(e);

                onConfirm();
              }}
            >
              {intl.formatMessage({
                id: 'confirm',
                defaultMessage: 'Confirm',
              })}
            </button>
          </div>

          {isMobile && (
            <div className="text-sm  text-center text-white flex items-center lg:px-6 justify-center pb-8 py-3">
              {!userExist
                ? `* ${intl.formatMessage({
                    id: 'register_deposit_tip',
                    defaultMessage:
                      'Registering will require a storage deposit.',
                  })}`
                : `* ${intl.formatMessage({
                    id: 'increase_storage_deposit',
                    defaultMessage:
                      'You may need to increase the storage deposit on your Orderly account.',
                  })}`}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

function LearnMoreBox() {
  const intl = useIntl();
  return (
    <div className="absolute bottom-0 pb-6 right-28 cursor-default w-full">
      <div className="bg-cardBg  rounded-md text-primaryText border text-xs border-primaryText py-3 px-2.5">
        <FormattedMessage
          id="more_order_book_page_detail"
          values={{
            br: <br />,
          }}
          defaultMessage={
            'This Orderbook page is powered by Orderly Network, users are strongly encouraged to do their own research before connecting their wallet and/or placing any orders.{br} Ref Finance does not guarantee the security of the systems, smart contracts, and any funds deposited or sent to those systems and contracts.{br} Neither Ref Finance nor Orderly Network is responsible for any profit or loss of investment users made through this Orderbook page.'
          }
        />

        <br />

        {intl.formatMessage({
          id: 'learn_more_about',
          defaultMessage: 'Learn more about',
        })}
        <a
          href="https://orderly.org/"
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="inline underline cursor-pointer text-white ml-1"
        >
          Orderly Network
        </a>

        {intl.formatMessage({
          id: 'learn_more_about_zh',
          defaultMessage: '.',
        })}
      </div>
    </div>
  );
}

function UserBoardFoot() {
  const [hover, setHover] = useState<boolean>(false);

  const { accountId } = useWalletSelector();
  const intl = useIntl();

  return (
    <div
      className="flex flex-col text-primaryText left-1/2 transform -translate-x-1/2   absolute  bottom-0 text-13px"
      style={{
        zIndex: 91,
        width: '291px',
      }}
    >
      {!accountId && (
        <>
          <div>
            {intl.formatMessage({
              id: 'user_foot_tip',
              defaultMessage:
                '* This Orderbook page is a graphical user interface for trading on Orderly Network, and is provided as a convenience to users of Ref Finance.',
            })}
          </div>

          <div className={`underline relative   justify-self-start mb-5`}>
            <span
              className="cursor-pointer"
              onMouseEnter={() => {
                setHover(true);
              }}
              onMouseLeave={() => {
                setHover(false);
              }}
            >
              {intl.formatMessage({
                id: 'learn_more_orderly',
                defaultMessage: 'Learn more',
              })}
              .{hover && <LearnMoreBox />}
            </span>
          </div>
        </>
      )}

      <div className={`flex items-center justify-center  relative `}>
        <span className="text-primaryText  ">
          <FormattedMessage
            id="powered_by"
            defaultMessage={'Powered by'}
          ></FormattedMessage>
        </span>

        <div className="mx-2">
          <OrderlyNetworkIcon></OrderlyNetworkIcon>
        </div>

        <a
          href="https://docs.orderly.org/welcome-to-orderly/what-is-orderly-network"
          className="underline hover:text-white whitespace-nowrap"
          target="_blank"
          rel="noopener noreferrer nofollow"
        >
          <FormattedMessage
            id="risk"
            defaultMessage={'Risk'}
          ></FormattedMessage>
        </a>
      </div>
    </div>
  );
}

const symbolsArr = ['e', 'E', '+', '-'];

export function TextWrapper({
  className,
  value,
  bg,
  textC,
  bgOpacity,
}: {
  value: string;
  bg?: string;
  textC?: string;
  className?: string;
  bgOpacity?: string;
}) {
  return (
    <span
      className={`pt-0.5 ${
        className || ' px-1.5  '
      }  inline-flex items-center justify-center rounded-md ${
        bg || 'bg-primaryOrderly '
      } ${bgOpacity || 'bg-opacity-10'} ${textC || 'text-white'} `}
    >
      {value}
    </span>
  );
}

export const REF_ORDERLY_AGREE_CHECK = 'REF_ORDERLY_AGREE_CHECK';

export const REF_ORDERLY_ACCOUNT_VALID = 'REF_ORDERLY_ACCOUNT_VALID';

const REF_ORDERLY_LIMIT_ORDER_ADVANCE = 'REF_ORDERLY_LIMIT_ORDER_ADVANCE';

export default function UserBoard({ maintenance }: { maintenance: boolean }) {
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
    userExist,
    availableSymbols,
    holdings,
  } = useOrderlyContext();
  const orderlyBalancesStore: any = useOrderlyBalancesStore();
  const orderlyBalances = orderlyBalancesStore.getBalances();

  const { accountId, modal, selector } = useWalletSelector();

  const storedLimitOrderAdvance =
    sessionStorage.getItem(REF_ORDERLY_LIMIT_ORDER_ADVANCE) || '{}';

  const { freeCollateral, collateralTokenAvailableBalance } = usePerpData();

  const parsedAdvance = JSON.parse(storedLimitOrderAdvance);

  const [showLimitAdvance, setShowLimitAdvance] = useState<boolean>(
    parsedAdvance?.show || false
  );

  const [advanceLimitMode, setAdvanceLimitMode] = useState<
    'IOC' | 'FOK' | 'POST_ONLY'
  >(parsedAdvance?.advance);

  useEffect(() => {
    sessionStorage.setItem(
      REF_ORDERLY_LIMIT_ORDER_ADVANCE,

      JSON.stringify(
        advanceLimitMode
          ? {
              advance: advanceLimitMode,
              show: showLimitAdvance,
            }
          : {
              show: showLimitAdvance,
            }
      )
    );
  }, [showLimitAdvance, advanceLimitMode]);

  const [operationType, setOperationType] = useState<'deposit' | 'withdraw'>();

  const { symbolFrom, symbolTo } = parseSymbol(symbol);

  const sideUrl = new URLSearchParams(window.location.search).get('side');

  const orderTypeUrl = new URLSearchParams(window.location.search).get(
    'orderType'
  );

  const [side, setSide] = useState<'Buy' | 'Sell'>(
    (sideUrl as 'Buy' | 'Sell') || 'Buy'
  );

  const [orderType, setOrderType] = useState<'Market' | 'Limit'>(
    (orderTypeUrl as 'Market' | 'Limit') || 'Limit'
  );

  const symbolType = PerpOrSpot(symbol);

  const tokenIn = useTokenMetaFromSymbol(
    symbolFrom,
    tokenInfo,
    symbolType === 'SPOT'
  );

  const tokenOut = useTokenMetaFromSymbol(symbolTo, tokenInfo);

  const [operationId, setOperationId] = useState<string>(tokenIn?.id || '');

  const [inputValue, setInputValue] = useState<string>('');

  const [limitPrice, setLimitPrice] = useState<string>('');

  const [userInfo, setUserInfo] = useState<ClientInfo>();

  const [showAllAssets, setShowAllAssets] = useState<boolean>(false);

  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);

  const [agreeCheck, setAgreeCheck] = useState<boolean>(false);

  const [registerModalOpen, setRegisterModalOpen] = useState<boolean>(false);

  const submitDisable =
    !inputValue ||
    Number(inputValue) === 0 ||
    (orderType === 'Limit' && Number(limitPrice) <= 0) ||
    !userInfo;

  const inputLimitPriceRef = useRef<HTMLInputElement>(null);

  const inputAmountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!accountId || !validAccountSig) return;

    getAccountInformation({ accountId }).then((res) => {
      setUserInfo(res);
    });
  }, [accountId, validAccountSig]);

  const curHoldingIn = holdings?.find((h) => h.token === symbolFrom);

  const curHoldingOut = holdings?.find((h) => h.token === symbolTo);

  const tokenFromBalance = useTokenBalance(
    tokenIn?.id,
    JSON.stringify(orderlyBalances)
  );
  const tokenToBalance = useTokenBalance(
    tokenOut?.id,
    JSON.stringify(orderlyBalances)
  );

  const tokenInHolding = curHoldingIn
    ? toPrecision(
        new Big(curHoldingIn.holding + curHoldingIn.pending_short).toString(),
        Math.min(8, tokenIn?.decimals || 8),
        false
      )
    : balances && balances[symbolFrom]?.holding;

  const tokenOutHolding =
    tokenOut?.id == configV2.ORDRRBOOK_COLLATTERAL_TOKEN
      ? freeCollateral === '-'
        ? '0'
        : freeCollateral
      : curHoldingOut
      ? toPrecision(
          new Big(
            curHoldingOut.holding + curHoldingOut.pending_short
          ).toString(),
          Math.min(8, tokenOut?.decimals || 8),
          false
        )
      : balances && balances[symbolTo]?.holding;

  const usdcAvailableBalance = curHoldingOut
    ? new Big(curHoldingOut.holding + curHoldingOut.pending_short).toFixed(2)
    : '-';
  const fee =
    orderType === 'Limit'
      ? !userInfo || !limitPrice
        ? '-'
        : (userInfo.maker_fee_rate / 10000) *
          Number(limitPrice || 0) *
          Number(inputValue || 0)
      : !userInfo ||
        !orders ||
        !(side === 'Buy' ? orders.asks?.[0]?.[0] : orders?.bids?.[0]?.[0])
      ? '-'
      : (userInfo.taker_fee_rate / 10000) *
        Number(
          side === 'Buy' ? orders.asks?.[0]?.[0] : orders?.bids?.[0]?.[0] || 0
        ) *
        Number(inputValue || 0);

  const marketPrice = !orders
    ? 0
    : side === 'Buy'
    ? orders.asks?.[0]?.[0]
    : orders?.bids?.[0]?.[0];

  const reloadTotal = () => {
    if (orderType === 'Limit') {
      if (!limitPrice) {
        return '0';
      } else {
        return new Big(inputValue || 0)
          .times(new Big(Number(limitPrice || 0)))
          .toNumber()
          .toString();
      }
    } else {
      if (!marketPrice) {
        return '0';
      } else {
        return new Big(inputValue || 0)
          .times(new Big(Number(marketPrice || 0)))
          .toNumber()
          .toString();
      }
    }
  };

  const [total, setTotal] = useState<string>(reloadTotal());

  const [onTotalFocus, setOnTotalFocus] = useState<boolean>(false);

  useEffect(() => {
    setLimitPrice('');
    setTotal('');
    setInputValue('');
    setShowErrorTip(false);
  }, [symbol]);

  useEffect(() => {
    const total = reloadTotal();
    setTotal(total);
  }, [orderType]);

  useEffect(() => {
    if (onTotalFocus) return;

    const total = reloadTotal();
    setTotal(total);
  }, [marketPrice]);

  const handleSubmit = () => {
    if (!accountId) return;
    if (orderType === 'Market') {
      return createOrder({
        accountId,
        orderlyProps: {
          side: side === 'Buy' ? 'BUY' : 'SELL',
          symbol: symbol,
          order_type: 'MARKET',
          order_amount:
            side === 'Buy' ? parseFloat(new Big(total).toFixed(3, 0)) : '',
          order_quantity: side === 'Buy' ? '' : parseFloat(inputValue),
          broker_id: 'ref_dex',
        },
      }).then(async (res) => {
        if (res.success === false)
          return orderEditPopUpFailure({
            tip: res.message,
          });

        handlePendingOrderRefreshing();

        const order = await getOrderByOrderId({
          accountId,
          order_id: res.data.order_id,
        });

        return orderPopUp({
          orderType: 'Market',
          symbolName: symbol,
          side: side,
          size: parseFloat(inputValue).toString(),

          tokenIn: tokenIn,
          price: parseFloat(marketPrice?.toString() || '0' || '').toString(),
          timeStamp: res.timestamp,
          order,
        });
      });
    } else if (orderType === 'Limit') {
      return createOrder({
        accountId,
        orderlyProps: {
          side: side === 'Buy' ? 'BUY' : 'SELL',
          symbol: symbol,
          order_price: parseFloat(limitPrice),
          order_type:
            typeof advanceLimitMode !== 'undefined'
              ? advanceLimitMode
              : 'LIMIT',
          order_quantity: parseFloat(inputValue),
          broker_id: 'ref_dex',
        },
      }).then(async (res) => {
        if (res.success === false)
          return orderEditPopUpFailure({
            tip: res.message,
          });

        handlePendingOrderRefreshing();

        const order = await getOrderByOrderId({
          accountId,
          order_id: res.data.order_id,
        });

        return orderPopUp({
          orderType: 'Limit',
          symbolName: symbol,
          side: side,
          size: parseFloat(inputValue).toString(),

          tokenIn: tokenIn,
          price: parseFloat(limitPrice || '').toString(),

          timeStamp: res.timestamp,
          filled: order?.data?.status === 'FILLED',
          order: order.data,
        });
      });
    }
  };

  const [tradingKeySet, setTradingKeySet] = useState<boolean>(false);

  const [keyAnnounced, setKeyAnnounced] = useState<boolean>(false);

  const [showErrorTip, setShowErrorTip] = useState<boolean>(false);

  const [errorTipMsg, setErrorTipMsg] = useState<string>('');

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

  const isInsufficientBalance =
    side === 'Buy'
      ? new Big(total === '-' || !total ? '0' : total).gt(
          tokenOutHolding || '0'
        )
      : new Big(inputValue || '0').gt(tokenInHolding || '0');

  const loading =
    ((!!accountId && storageEnough === undefined) ||
      (!!storedValid && !validAccountSig)) &&
    !!accountId;

  const priceValidator = (price: string, size: string) => {
    const symbolInfo = availableSymbols?.find((s) => s.symbol === symbol);

    if (!symbolInfo) {
      return;
    }

    if (new Big(price || 0).lt(symbolInfo.quote_min)) {
      setShowErrorTip(true);
      setErrorTipMsg(
        `${intl.formatMessage({
          id: 'min_price_should_be_higher_than_or_equal_to',
          defaultMessage: 'Min price should be higher than or equal to',
        })} ${symbolInfo.quote_min}`
      );
      return;
    }

    if (new Big(price || 0).gt(symbolInfo.quote_max)) {
      setShowErrorTip(true);
      setErrorTipMsg(
        `${intl.formatMessage({
          id: 'price_should_be_lower_than_or_equal_to',
          defaultMessage: 'Price should be lower than or equal to',
        })} ${symbolInfo.quote_max}`
      );
      return;
    }

    if (
      new Big(new Big(price || 0).minus(new Big(symbolInfo.quote_min)))
        .mod(symbolInfo.quote_tick)
        .gt(0)
    ) {
      setShowErrorTip(true);
      setErrorTipMsg(
        `${intl.formatMessage({
          id: 'price_should_be_a_multiple_of',
          defaultMessage: 'Price should be a multiple of',
        })} ${symbolInfo.quote_tick}${intl.formatMessage({
          id: 'price_should_be_a_multiple_of_zh',
          defaultMessage: ' ',
        })}`
      );
      return;
    }

    if (
      new Big(price || 0).gt(
        new Big(orders.asks?.[0]?.[0] || 0).times(1 + symbolInfo.price_range)
      ) &&
      side === 'Buy'
    ) {
      setShowErrorTip(true);
      setErrorTipMsg(
        `${intl.formatMessage({
          id: 'price_should_be_lower_than_or_equal_to',
          defaultMessage: 'Price should be lower than or equal to',
        })} ${new Big(orders.asks?.[0]?.[0] || 0).times(
          1 + symbolInfo.price_range
        )}`
      );

      return;
    }

    if (
      new Big(price || 0).lt(
        new Big(orders.bids?.[0]?.[0] || 0).times(1 - symbolInfo.price_range)
      ) &&
      side === 'Sell'
    ) {
      setShowErrorTip(true);
      setErrorTipMsg(
        `${intl.formatMessage({
          id: 'price_should_be_greater_than_or_equal_to',
          defaultMessage: 'Price should be greater than or equal to',
        })} ${new Big(orders.bids?.[0]?.[0] || 0)
          .times(1 - symbolInfo.price_range)
          .toFixed(tickToPrecision(symbolInfo.quote_tick))}`
      );

      return;
    }

    if (
      price &&
      size &&
      new Big(price || 0).times(new Big(size || 0)).lt(symbolInfo.min_notional)
    ) {
      setShowErrorTip(true);
      setErrorTipMsg(
        `${intl.formatMessage({
          id: 'the_order_value_should_be_be_greater_than_or_equal_to',
          defaultMessage:
            'The order value should be be greater than or equal to',
        })} ${symbolInfo.min_notional}`
      );
      return;
    }

    return true;
  };

  const sizeValidator = (price: string, size: string) => {
    const symbolInfo = availableSymbols?.find((s) => s.symbol === symbol);

    if (!symbolInfo) {
      return;
    }

    // size validator

    if (new Big(size || 0).lt(symbolInfo.base_min)) {
      setShowErrorTip(true);
      setErrorTipMsg(
        `${
          side === 'Buy'
            ? intl.formatMessage({
                id: 'quantity_to_buy_should_be_greater_than_or_equal_to',
                defaultMessage:
                  'Quantity to buy should be greater than or equal to',
              })
            : intl.formatMessage({
                id: 'quantity_to_sell_should_be_greater_than_or_equal_to',
                defaultMessage:
                  'Quantity to sell should be greater than or equal to',
              })
        } ${symbolInfo.base_min}`
      );
      return;
    }

    if (new Big(size || 0).gt(symbolInfo.base_max)) {
      setShowErrorTip(true);
      setErrorTipMsg(
        `${
          side === 'Buy'
            ? intl.formatMessage({
                id: 'quantity_to_buy_should_be_less_than_or_equal_to',
                defaultMessage:
                  'Quantity to buy should be less than or equal to',
              })
            : intl.formatMessage({
                id: 'quantity_to_sell_should_be_less_than_or_equal_to',
                defaultMessage:
                  'Quantity to sell should be less than or equal to',
              })
        } ${symbolInfo.base_max}`
      );
      return;
    }

    if (
      new Big(new Big(size || 0).minus(new Big(symbolInfo.base_min)))
        .mod(symbolInfo.base_tick)
        .gt(0)
    ) {
      setShowErrorTip(true);
      setErrorTipMsg(
        `${intl.formatMessage({
          id: 'quantity_should_be_a_multiple_of',
          defaultMessage: 'Quantity should be a multiple of',
        })} ${symbolInfo.base_tick}${intl.formatMessage({
          id: 'quantity_should_be_a_multiple_of_zh',
          defaultMessage: ' ',
        })}`
      );
      return;
    }

    if (
      price &&
      size &&
      new Big(price || 0).times(new Big(size || 0)).lt(symbolInfo.min_notional)
    ) {
      setShowErrorTip(true);
      setErrorTipMsg(
        `${intl.formatMessage({
          id: 'the_order_value_should_be_be_greater_than_or_equal_to',
          defaultMessage:
            'The order value should be be greater than or equal to',
        })} ${symbolInfo.min_notional}`
      );
      return;
    }

    return true;
  };

  const priceAndSizeValidator = (
    price: string,
    size: string,
    source?: 'maxinput'
  ) => {
    const symbolInfo = availableSymbols?.find((s) => s.symbol === symbol);

    if (!symbolInfo || (ONLY_ZEROS.test(price) && ONLY_ZEROS.test(size))) {
      setShowErrorTip(false);
      setErrorTipMsg('');
      return;
    }

    let resPrice;
    let resSize;

    if (!ONLY_ZEROS.test(price)) {
      resPrice = priceValidator(price, size);
    } else {
      resPrice = true;
    }

    if (!ONLY_ZEROS.test(size)) {
      resSize = sizeValidator(price, size);
    } else {
      resSize = true;
    }

    if (typeof resSize === 'boolean' && !resSize && source) {
      setInputValue('0');
    }

    if (resPrice === true && resSize === true) {
      // price validator

      setShowErrorTip(false);
      setErrorTipMsg('');
    }
  };

  useEffect(() => {
    const marketPrice = !orders
      ? 0
      : side === 'Buy'
      ? orders.asks?.[0]?.[0]
      : orders?.bids?.[0]?.[0];

    if (typeof marketPrice === 'undefined') return;

    priceAndSizeValidator(
      orderType === 'Limit' ? limitPrice : marketPrice?.toString(),
      inputValue
    );
  }, [side, orderType, symbol, orders]);
  const isMobile = useClientMobile();
  const curSymbol = availableSymbols?.find((s) => s.symbol === symbol);

  useEffect(() => {
    setLimitPrice(bridgePrice);
    priceAndSizeValidator(bridgePrice, inputValue);

    if (!ONLY_ZEROS.test(bridgePrice) && !ONLY_ZEROS.test(inputValue)) {
      const total = new Big(bridgePrice || 0)
        .times(inputValue)
        .toNumber()
        .toString();
      setTotal(total);

      return;
    }

    if (
      !ONLY_ZEROS.test(total) &&
      !ONLY_ZEROS.test(bridgePrice) &&
      total !== '-' &&
      curSymbol
    ) {
      // change input value
      const qty = new Big(total || 0)
        .div(bridgePrice)
        .toFixed(tickToPrecision(curSymbol.base_tick));

      setInputValue(qty);

      priceAndSizeValidator(bridgePrice, qty);

      return;
    }
  }, [bridgePrice]);

  const validator =
    !accountId ||
    !storageEnough ||
    !tradingKeySet ||
    !keyAnnounced ||
    !validContract() ||
    maintenance;

  const intl = useIntl();

  return (
    <div
      className={`w-full relative flex flex-col   border-l border-b h-screen border-boxBorder bg-orderLineHover `}
      style={{
        minHeight: '775px',
        height: validator ? 'calc(100vh - 100px)' : '100%',
      }}
    >
      {/* not signed in wrapper */}
      {maintenance && (
        <div
          className="absolute  flex flex-col justify-center items-center h-full w-full top-0 left-0 "
          style={{
            background: 'rgba(0, 19, 32, 0.8)',
            backdropFilter: 'blur(5px)',
            zIndex: 89,
          }}
        ></div>
      )}

      {loading && !maintenance && (
        <div
          className="absolute  flex flex-col justify-center items-center h-full w-full top-0 left-0 "
          style={{
            background: 'rgba(0, 19, 32, 0.8)',
            backdropFilter: 'blur(5px)',
            zIndex: 89,
          }}
        >
          <OrderlyLoading></OrderlyLoading>
        </div>
      )}

      {validator && !loading && !maintenance && (
        <div
          className="absolute flex flex-col justify-center items-center h-full w-full top-0 left-0 "
          style={{
            background: 'rgba(0, 19, 32, 0.8)',
            backdropFilter: 'blur(5px)',
            zIndex: 50,
          }}
        >
          <RefToOrderly></RefToOrderly>

          {!accountId && (
            <ConnectWallet
              onClick={() => {
                modal.show();
              }}
            ></ConnectWallet>
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
              ></ConfirmButton>
            </div>
          )}

          {!!accountId &&
            validContract() &&
            (!storageEnough || !tradingKeySet || !keyAnnounced) && (
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
                isOpenMobile={isMobile && registerModalOpen}
                check={agreeCheck}
                storageEnough={!!storageEnough}
                spin={
                  (storageEnough && (!tradingKeySet || !keyAnnounced)) ||
                  agreeCheck
                }
              />
            )}
        </div>
      )}

      {/* balances board */}

      <div className="px-6 pt-3 w-full flex  bg-perpCardBg flex-col">
        <div className="text-sm text-white font-bold mb-4 text-left flex items-center justify-between">
          <span>
            {intl.formatMessage({ id: 'balances', defaultMessage: 'Balances' })}
          </span>
          <div className="inline-flex text-primaryOrderly justify-end ">
            <span
              className="text-sm py-1.5  px-3 rounded-lg bg-symbolHover hover:text-white cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
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

        <div className="grid grid-cols-4 text-sm text-primaryOrderly mb-2">
          <span className="col-span-2  justify-self-start">
            {' '}
            {intl.formatMessage({
              id: 'assets',
              defaultMessage: 'Assets',
            })}
          </span>

          <span className="justify-self-end flex items-center relative right-10">
            {' '}
            <NearIConSelectModal />{' '}
            <span className="ml-2 whitespace-nowrap">
              {intl.formatMessage({
                id: 'wallet_up',
                defaultMessage: 'Wallet',
              })}
            </span>{' '}
          </span>

          <span className="justify-self-end flex items-center">
            <OrderlyIconBalance />
            <span className="ml-2 whitespace-nowrap">
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

          <div
            className="justify-self-end relative right-10"
            title={tokenFromBalance}
          >
            {!!tokenFromBalance ? digitWrapperAsset(tokenFromBalance, 2) : '-'}
          </div>

          <div
            className="flex items-center justify-self-end"
            title={
              tokenInHolding !== undefined || tokenInHolding !== null
                ? scientificNotationToString(tokenInHolding?.toString() || '')
                : ''
            }
          >
            {tokenInHolding
              ? digitWrapperAsset(tokenInHolding.toString(), 2)
              : 0}
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

          <div
            className="justify-self-end relative right-10"
            title={tokenToBalance}
          >
            {!!tokenToBalance ? digitWrapperAsset(tokenToBalance, 2) : ''}
          </div>
          <CollatteralTokenAvailableCell
            finalBalance={collateralTokenAvailableBalance}
            usdcBalance={usdcAvailableBalance}
            freeCollateral={freeCollateral}
          />
        </div>

        <div className="frcb w-full gap-2 py-3 text-white">
          <button
            className="frcc w-1/2 py-2 relative rounded-lg border border-orderTypeBg gap-2"
            onClick={() => {
              setOperationType('deposit');
              setOperationId(tokenIn?.id || '');
            }}
          >
            <NewUserTip type="spot-pc"></NewUserTip>
            <FormattedMessage
              id="deposit"
              defaultMessage={'Deposit'}
            ></FormattedMessage>

            <span className="transform rotate-180">
              <ArrowCurve />
            </span>
          </button>

          <button
            className="frcc w-1/2 py-2 rounded-lg border border-orderTypeBg gap-2"
            onClick={() => {
              setOperationType('withdraw');
              setOperationId(tokenIn?.id || '');
            }}
          >
            <FormattedMessage
              id="withdraw"
              defaultMessage={'Withdraw'}
            ></FormattedMessage>

            <ArrowCurve />
          </button>
        </div>
      </div>

      {/* operations board */}
      <div className="flex flex-col w-full bg-orderLineHover pb-20">
        <div className="frcb   px-6  bg-orderLineHover py-2.5 pb-2 border-b border-t border-white border-opacity-10 text-primaryText ">
          <button
            className={`  w-1/2 frcc relative`}
            onClick={() => {
              setOrderType('Limit');
            }}
          >
            <span
              className={`text-sm font-gothamBold ${
                orderType === 'Limit' ? 'text-white ' : ''
              } `}
            >
              {intl.formatMessage({
                id: 'limit_orderly',
                defaultMessage: 'Limit',
              })}
            </span>

            {orderType === 'Limit' && (
              <div
                className={`w-full absolute -bottom-2 h-0.5  ${
                  side == 'Buy' ? 'bg-gradientFromHover' : 'bg-sellRed'
                }`}
              ></div>
            )}
          </button>

          <button
            className={`  w-1/2 frcc relative`}
            onClick={() => {
              setOrderType('Market');
            }}
          >
            <span
              className={`text-sm font-gothamBold ${
                orderType === 'Market' ? 'text-white ' : ''
              } `}
            >
              {intl.formatMessage({
                id: 'market',
                defaultMessage: 'Market',
              })}
            </span>

            {orderType === 'Market' && (
              <div
                className={`w-full absolute -bottom-2 h-0.5 ${
                  side == 'Buy' ? 'bg-gradientFromHover' : 'bg-sellRed'
                }`}
              ></div>
            )}
          </button>
        </div>

        {/* sell and buy button  */}
        <div className="flex px-6  items-center justify-center mt-6 pb-3">
          <BuyButton
            onClick={() => {
              setSide('Buy');
            }}
            select={side === 'Buy'}
          />

          <SellButton
            onClick={() => {
              setSide('Sell');
            }}
            select={side === 'Sell'}
          />
        </div>

        {/* input box */}

        {orderType === 'Limit' && (
          <div className="mx-6  text-primaryOrderly mt-3 text-sm  bg-perpCardBg rounded-xl border border-boxBorder p-3 py-1.5">
            <div className="flex items-center justify-between">
              <span>
                {intl.formatMessage({
                  id: 'price',
                  defaultMessage: 'Price',
                })}
              </span>

              <span>
                {symbolTo}/{symbolFrom}
              </span>
            </div>

            <div className="flex items-center mt-0.5 justify-between">
              <input
                type="number"
                step="any"
                ref={inputLimitPriceRef}
                onWheel={(e) =>
                  inputLimitPriceRef.current
                    ? inputLimitPriceRef.current?.blur()
                    : null
                }
                min={0}
                placeholder="0"
                className="text-white text-left ml-2 text-lg  w-full"
                value={limitPrice}
                onChange={(e) => {
                  const price = e.target.value;

                  priceAndSizeValidator(price, inputValue);

                  setLimitPrice(price);

                  if (ONLY_ZEROS.test(price)) {
                    setTotal('0');

                    return;
                  }

                  if (!ONLY_ZEROS.test(price) && !ONLY_ZEROS.test(inputValue)) {
                    const total = new Big(price || 0)
                      .times(inputValue)
                      .toNumber()
                      .toString();
                    setTotal(total);

                    return;
                  }

                  if (!ONLY_ZEROS.test(total) && !ONLY_ZEROS.test(price)) {
                    // change input value

                    const qty = new Big(total || 0)
                      .div(price)
                      .toFixed(tickToPrecision(curSymbol.base_tick));

                    setInputValue(qty);

                    priceAndSizeValidator(price, qty);

                    return;
                  }
                }}
                inputMode="decimal"
                onKeyDown={(e) =>
                  symbolsArr.includes(e.key) && e.preventDefault()
                }
              />
            </div>
          </div>
        )}
        {orderType === 'Market' && (
          <div className="mx-6  text-primaryOrderly rounded-xl border bg-orderLineHover border-menuMoreBoxBorderColor p-3 mt-3 text-sm flex items-center  justify-between">
            <span className="">
              {intl.formatMessage({
                id: 'price',
                defaultMessage: 'Price',
              })}
            </span>

            <span className="">
              {' '}
              {intl.formatMessage({
                id: 'market_price',
                defaultMessage: 'Market price',
              })}
            </span>
          </div>
        )}

        <div className="mx-6  text-primaryOrderly mt-3 bg-perpCardBg text-sm  rounded-xl border border-boxBorder p-3 py-1.5">
          <div className=" text-left flex items-center justify-between">
            <span>
              {intl.formatMessage({
                id: 'quantity',
                defaultMessage: 'Quantity',
              })}
            </span>

            <span className="">{symbolFrom}</span>
          </div>

          <div className="flex items-center mt-0.5">
            <input
              autoFocus
              inputMode="decimal"
              ref={inputAmountRef}
              onWheel={(e) =>
                inputAmountRef.current ? inputAmountRef.current.blur() : null
              }
              className="text-white ml-2 text-lg w-full"
              value={inputValue}
              placeholder="0"
              type="number"
              step="any"
              min={0}
              onChange={(e) => {
                const displayAmount = e.target.value;
                let price =
                  orderType === 'Limit'
                    ? limitPrice
                    : marketPrice?.toString() || '0';

                priceAndSizeValidator(
                  orderType === 'Limit'
                    ? limitPrice
                    : marketPrice?.toString() || '0',
                  e.target.value
                );

                setInputValue(e.target.value);

                if (ONLY_ZEROS.test(displayAmount)) {
                  setTotal('0');
                  return;
                }

                if (
                  !ONLY_ZEROS.test(price) &&
                  !ONLY_ZEROS.test(displayAmount)
                ) {
                  const total = new Big(price)
                    .times(displayAmount || '0')
                    .toNumber()
                    .toString();

                  setTotal(total);

                  return;
                } else if (
                  !ONLY_ZEROS.test(total) &&
                  ONLY_ZEROS.test(price) &&
                  orderType === 'Limit'
                ) {
                  price = new Big(total)
                    .div(new Big(displayAmount || 0))
                    .toNumber()
                    .toString();

                  setLimitPrice(price);

                  priceAndSizeValidator(price, displayAmount, 'maxinput');

                  return;
                }
              }}
              onKeyDown={(e) =>
                symbolsArr.includes(e.key) && e.preventDefault()
              }
            />

            <span
              className="bg-menuMoreBgColor rounded-md px-2 py-0.5 text-primaryText cursor-pointer hover:opacity-70"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                const symbolInfo = availableSymbols?.find(
                  (s) => s.symbol === symbol
                );

                if (!symbolInfo) {
                  return;
                }

                const maxAmount =
                  side === 'Sell'
                    ? tokenInHolding || 0
                    : new Big(tokenOutHolding || 0)
                        .div(
                          orderType === 'Market' ? marketPrice : limitPrice || 1
                        )
                        .toNumber();

                const displayAmount = new Big(maxAmount || 0)
                  .div(new Big(symbolInfo.base_tick))
                  .round(0, 0)
                  .times(new Big(symbolInfo.base_tick))
                  .toString();

                setInputValue(displayAmount);

                let price =
                  orderType == 'Market'
                    ? marketPrice?.toString() || '0'
                    : limitPrice;

                priceAndSizeValidator(price, displayAmount, 'maxinput');

                if (
                  !ONLY_ZEROS.test(price) &&
                  !ONLY_ZEROS.test(displayAmount)
                ) {
                  const total = new Big(price)
                    .times(displayAmount || '0')
                    .toNumber()
                    .toString();

                  setTotal(total);

                  return;
                } else if (
                  !ONLY_ZEROS.test(total) &&
                  ONLY_ZEROS.test(price) &&
                  orderType === 'Limit'
                ) {
                  price = new Big(total)
                    .div(new Big(displayAmount || 0))
                    .toNumber()
                    .toString();

                  setLimitPrice(price);

                  priceAndSizeValidator(price, displayAmount, 'maxinput');

                  return;
                }
              }}
            >
              Max
            </span>
          </div>
        </div>

        {/* limit order advance mode */}

        <div className="h-1 mx-6 border-b pt-3 border-white border-opacity-10"></div>

        <div className="text-primaryOrderly mx-6 px-4 py-0.5 mt-4 border border-inputV3BorderColor rounded-xl bg-perpCardBg frcb">
          <div className="frcs whitespace-nowrap">
            <span>
              {intl.formatMessage({
                id: 'total',
                defaultMessage: 'Total',
              })}
            </span>

            <span className="font-sans">&nbsp;{'≈'}</span>
          </div>

          <div className="frcs gap-2 py-1">
            <input
              type="number"
              step="any"
              inputMode="decimal"
              className="text-white text-right text-lg"
              value={total}
              min={0}
              onKeyDown={(e) =>
                symbolsArr.includes(e.key) && e.preventDefault()
              }
              onChange={(e) => {
                const value = e.target.value;

                setTotal(value);

                let qty = '';

                if (ONLY_ZEROS.test(value)) {
                  setInputValue('');
                  // return;
                }

                const price =
                  orderType === 'Limit'
                    ? limitPrice
                    : marketPrice?.toString() || '0';

                if (
                  orderType === 'Limit' &&
                  !ONLY_ZEROS.test(limitPrice) &&
                  !ONLY_ZEROS.test(value)
                ) {
                  qty = new Big(value)
                    .div(new Big(limitPrice))
                    .toFixed(tickToPrecision(curSymbol?.base_tick || 0.01));

                  setInputValue(qty);
                } else if (
                  orderType === 'Market' &&
                  !ONLY_ZEROS.test(marketPrice.toString()) &&
                  !ONLY_ZEROS.test(value)
                ) {
                  qty = new Big(value)
                    .div(new Big(marketPrice))
                    .toFixed(tickToPrecision(curSymbol?.base_tick || 0.01));
                }

                setInputValue(qty);

                priceAndSizeValidator(price, qty);
              }}
              onFocus={() => {
                setOnTotalFocus(true);
              }}
              onBlur={() => {
                setOnTotalFocus(false);
              }}
            />
            <span className="text-primaryText">USDC.e</span>
          </div>
        </div>

        <div className=" px-6  rounded-lg text-sm  pt-4 pb-2 relative z-10 ">
          <div className="flex items-center justify-between">
            <span className="text-primaryOrderly">
              {intl.formatMessage({
                id: 'taker_maker_fee',
                defaultMessage: 'Taker/Maker Fee',
              })}
            </span>

            <FlexRow className="text-white">
              <span className="">
                {Number((userInfo?.taker_fee_rate || 0) / 100).toFixed(2)}%
              </span>
              /
              <span className="">
                {Number((userInfo?.maker_fee_rate || 0) / 100).toFixed(2)}%
              </span>
            </FlexRow>
          </div>
        </div>

        {orderType === 'Limit' && (
          <div className="text-white text-sm mt-2 px-6 ">
            <div className="flex items-center justify-between">
              <span className="text-primaryOrderly">
                {' '}
                {intl.formatMessage({
                  id: 'advanced',
                  defaultMessage: 'Advanced',
                })}
              </span>

              <DetailBox
                setShow={setShowLimitAdvance}
                show={showLimitAdvance}
              ></DetailBox>
            </div>

            <div
              className={`flex mt-2 items-center justify-between ${
                showLimitAdvance ? '' : 'hidden'
              }`}
            >
              <div className="flex items-center">
                <CheckBox
                  check={advanceLimitMode === 'IOC'}
                  setCheck={() => {
                    if (advanceLimitMode === 'IOC') {
                      setAdvanceLimitMode(undefined);
                    } else {
                      setAdvanceLimitMode('IOC');
                    }
                  }}
                ></CheckBox>
                <span
                  className="ml-2 mr-1 cursor-pointer"
                  onClick={() => {
                    if (advanceLimitMode === 'IOC') {
                      setAdvanceLimitMode(undefined);
                    } else {
                      setAdvanceLimitMode('IOC');
                    }
                  }}
                >
                  IOC
                </span>

                <div
                  data-class="reactTip"
                  data-tooltip-id={'user_board_ioc'}
                  data-place={'top'}
                  data-tooltip-html={getTipIoc()}
                >
                  <QuestionMark></QuestionMark>

                  <CustomTooltip id={'user_board_ioc'} place="right" />
                </div>
              </div>
              <div className="flex items-center">
                <CheckBox
                  check={advanceLimitMode === 'FOK'}
                  setCheck={() => {
                    if (advanceLimitMode === 'FOK') {
                      setAdvanceLimitMode(undefined);
                    } else {
                      setAdvanceLimitMode('FOK');
                    }
                  }}
                ></CheckBox>
                <span
                  className="cursor-pointer ml-2 mr-1"
                  onClick={() => {
                    if (advanceLimitMode === 'FOK') {
                      setAdvanceLimitMode(undefined);
                    } else {
                      setAdvanceLimitMode('FOK');
                    }
                  }}
                >
                  FOK
                </span>

                <div
                  data-class="reactTip"
                  data-tooltip-id={'user_board_folk'}
                  data-place={'top'}
                  data-tooltip-html={getTipFOK()}
                >
                  <QuestionMark></QuestionMark>

                  <CustomTooltip id={'user_board_folk'} place="right" />
                </div>
              </div>
              <div className="flex items-center">
                <CheckBox
                  check={advanceLimitMode === 'POST_ONLY'}
                  setCheck={() => {
                    if (advanceLimitMode === 'POST_ONLY') {
                      setAdvanceLimitMode(undefined);
                    } else {
                      setAdvanceLimitMode('POST_ONLY');
                    }
                  }}
                ></CheckBox>
                <span
                  className="ml-2 mr-1 cursor-pointer"
                  onClick={() => {
                    if (advanceLimitMode === 'POST_ONLY') {
                      setAdvanceLimitMode(undefined);
                    } else {
                      setAdvanceLimitMode('POST_ONLY');
                    }
                  }}
                >
                  Post-only
                </span>

                <div
                  data-class="reactTip"
                  data-tooltip-id={'user_board_post_only'}
                  data-place={'top'}
                  data-tooltip-html={getTipPostOnly()}
                >
                  <QuestionMark></QuestionMark>

                  <CustomTooltip id={'user_board_post_only'} place="right" />
                </div>
              </div>
            </div>
          </div>
        )}

        {showErrorTip && (
          <ErrorTip
            className={'relative top-3 mx-6 mb-3 '}
            text={errorTipMsg}
          />
        )}

        <button
          className={`rounded-lg mx-6 ${
            side === 'Buy'
              ? 'bg-buyGradientGreen'
              : isInsufficientBalance
              ? 'bg-errorTip'
              : 'bg-sellGradientRed'
          } ${
            isInsufficientBalance && side === 'Sell'
              ? 'text-redwarningColor'
              : 'text-white'
          }   py-2.5 mt-4 mb-2 flex z-20 items-center justify-center text-base ${
            submitDisable || showErrorTip || isInsufficientBalance
              ? 'opacity-60 cursor-not-allowed'
              : ''
          } `}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // handleSubmit();

            setConfirmModalOpen(true);
          }}
          disabled={submitDisable || isInsufficientBalance || showErrorTip}
          type="button"
        >
          {isInsufficientBalance
            ? intl.formatMessage({
                id: 'insufficient_balance',
                defaultMessage: 'Insufficient Balance',
              })
            : intl.formatMessage({
                id: side.toLowerCase(),
                defaultMessage: side,
              })}
          {` ${isInsufficientBalance ? '' : symbolFrom}`}
        </button>

        {isInsufficientBalance && (
          <DepositTip
            onClick={() => {
              setOperationType('deposit');
              setOperationId(
                side === 'Buy' ? tokenOut?.id || '' : tokenIn?.id || ''
              );
            }}
            type="spot"
          />
        )}
      </div>

      <UserBoardFoot />

      {showAllAssets && (
        <AssetModal
          isOpen={showAllAssets}
          curHoldingOut={curHoldingOut}
          onRequestClose={() => {
            setShowAllAssets(false);
          }}
        />
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
        accountBalance={tokenInHolding || 0}
        tokenInfo={tokenInfo}
        freeCollateral={freeCollateral}
        curHoldingOut={curHoldingOut}
      />

      <ConfirmOrderModal
        isOpen={confirmModalOpen}
        onRequestClose={() => {
          setConfirmModalOpen(false);
        }}
        symbolFrom={symbolFrom}
        symbolTo={symbolTo}
        side={side}
        quantity={inputValue}
        price={
          orderType === 'Limit' ? limitPrice : marketPrice?.toString() || '0'
        }
        orderType={orderType}
        fee={fee}
        totalCost={ONLY_ZEROS.test(total) ? '-' : Number(total)}
        onClick={handleSubmit}
        userInfo={userInfo}
      ></ConfirmOrderModal>

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

export function UserBoardMobileSpot({ maintenance }: { maintenance: boolean }) {
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
    userExist,
    availableSymbols,
    holdings,
  } = useOrderlyContext();

  const { accountId, modal, selector } = useWalletSelector();

  const storedLimitOrderAdvance =
    sessionStorage.getItem(REF_ORDERLY_LIMIT_ORDER_ADVANCE) || '{}';

  const parsedAdvance = JSON.parse(storedLimitOrderAdvance);

  const [showLimitAdvance, setShowLimitAdvance] = useState<boolean>(
    parsedAdvance?.show || false
  );
  const { freeCollateral } = usePerpData();

  const [advanceLimitMode, setAdvanceLimitMode] = useState<
    'IOC' | 'FOK' | 'POST_ONLY'
  >(parsedAdvance?.advance);

  useEffect(() => {
    sessionStorage.setItem(
      REF_ORDERLY_LIMIT_ORDER_ADVANCE,

      JSON.stringify(
        advanceLimitMode
          ? {
              advance: advanceLimitMode,
              show: showLimitAdvance,
            }
          : {
              show: showLimitAdvance,
            }
      )
    );
  }, [showLimitAdvance, advanceLimitMode]);

  const [operationType, setOperationType] = useState<'deposit' | 'withdraw'>();

  const { symbolFrom, symbolTo } = parseSymbol(symbol);

  const sideUrl = new URLSearchParams(window.location.search).get('side');

  const orderTypeUrl = new URLSearchParams(window.location.search).get(
    'orderType'
  );

  const [side, setSide] = useState<'Buy' | 'Sell'>(
    (sideUrl as 'Buy' | 'Sell') || 'Buy'
  );

  const [orderType, setOrderType] = useState<'Market' | 'Limit'>(
    (orderTypeUrl as 'Market' | 'Limit') || 'Limit'
  );

  const history = useHistory();

  // const [holdings, setHoldings] = useState<Holding[]>();

  const tokenIn = useTokenMetaFromSymbol(symbolFrom, tokenInfo);

  const tokenOut = useTokenMetaFromSymbol(symbolTo, tokenInfo);

  const [operationId, setOperationId] = useState<string>(tokenIn?.id || '');

  const [inputValue, setInputValue] = useState<string>('');

  const [limitPrice, setLimitPrice] = useState<string>('');

  const [userInfo, setUserInfo] = useState<ClientInfo>();

  const [showAllAssets, setShowAllAssets] = useState<boolean>(false);

  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);

  const [agreeCheck, setAgreeCheck] = useState<boolean>(false);

  const [registerModalOpen, setRegisterModalOpen] = useState<boolean>(false);

  const submitDisable =
    !inputValue ||
    Number(inputValue) === 0 ||
    (orderType === 'Limit' && Number(limitPrice) <= 0) ||
    !userInfo;

  const inputLimitPriceRef = useRef<HTMLInputElement>(null);

  const inputAmountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!accountId || !validAccountSig) return;

    getAccountInformation({ accountId }).then((res) => {
      setUserInfo(res);
    });
  }, [accountId, validAccountSig]);

  const curHoldingIn = holdings?.find((h) => h.token === symbolFrom);

  const curHoldingOut = holdings?.find((h) => h.token === symbolTo);

  const tokenInHolding = curHoldingIn
    ? toPrecision(
        new Big(curHoldingIn.holding + curHoldingIn.pending_short).toString(),
        Math.min(8, tokenIn?.decimals || 8),
        false
      )
    : balances && balances[symbolFrom]?.holding;

  const tokenOutHolding =
    tokenOut?.id == configV2.ORDRRBOOK_COLLATTERAL_TOKEN
      ? freeCollateral === '-'
        ? '0'
        : freeCollateral
      : curHoldingOut
      ? toPrecision(
          new Big(
            curHoldingOut.holding + curHoldingOut.pending_short
          ).toString(),
          Math.min(8, tokenOut?.decimals || 8),
          false
        )
      : balances && balances[symbolTo]?.holding;

  const fee =
    orderType === 'Limit'
      ? !userInfo || !limitPrice
        ? '-'
        : (userInfo.maker_fee_rate / 10000) *
          Number(limitPrice || 0) *
          Number(inputValue || 0)
      : !userInfo ||
        !orders ||
        !(side === 'Buy' ? orders.asks?.[0]?.[0] : orders?.bids?.[0]?.[0])
      ? '-'
      : (userInfo.taker_fee_rate / 10000) *
        Number(
          side === 'Buy' ? orders.asks?.[0]?.[0] : orders?.bids?.[0]?.[0] || 0
        ) *
        Number(inputValue || 0);

  const marketPrice = !orders
    ? 0
    : side === 'Buy'
    ? orders.asks?.[0]?.[0]
    : orders?.bids?.[0]?.[0];

  const reloadTotal = () => {
    if (orderType === 'Limit') {
      if (!limitPrice) {
        return '0';
      } else {
        return new Big(inputValue || 0)
          .times(new Big(Number(limitPrice || 0)))
          .toNumber()
          .toString();
      }
    } else {
      if (!marketPrice) {
        return '0';
      } else {
        return new Big(inputValue || 0)
          .times(new Big(Number(marketPrice || 0)))
          .toNumber()
          .toString();
      }
    }
  };
  const [total, setTotal] = useState<string>(reloadTotal());

  const [onTotalFocus, setOnTotalFocus] = useState<boolean>(false);

  useEffect(() => {
    const total = reloadTotal();
    setTotal(total);
  }, [orderType]);

  useEffect(() => {
    if (onTotalFocus) return;

    const total = reloadTotal();
    setTotal(total);
  }, [marketPrice]);

  const handleSubmit = () => {
    if (!accountId) return;
    if (orderType === 'Market') {
      return createOrder({
        accountId,
        orderlyProps: {
          side: side === 'Buy' ? 'BUY' : 'SELL',
          symbol: symbol,
          order_type: 'MARKET',
          order_amount:
            side === 'Buy' ? parseFloat(new Big(total).toFixed(3, 0)) : '',
          order_quantity: side === 'Buy' ? '' : parseFloat(inputValue),
          broker_id: 'ref_dex',
        },
      }).then(async (res) => {
        if (res.success === false)
          return orderEditPopUpFailure({
            tip: res.message,
          });

        handlePendingOrderRefreshing();

        const order = await getOrderByOrderId({
          accountId,
          order_id: res.data.order_id,
        });

        return orderPopUp({
          orderType: 'Market',
          symbolName: symbol,
          side: side,
          size: parseFloat(inputValue).toString(),

          tokenIn: tokenIn,
          price: parseFloat(marketPrice?.toString() || '0' || '').toString(),
          timeStamp: res.timestamp,
          order,
        });
      });
    } else if (orderType === 'Limit') {
      return createOrder({
        accountId,
        orderlyProps: {
          side: side === 'Buy' ? 'BUY' : 'SELL',
          symbol: symbol,
          order_price: parseFloat(limitPrice),
          order_type:
            typeof advanceLimitMode !== 'undefined'
              ? advanceLimitMode
              : 'LIMIT',
          order_quantity: parseFloat(inputValue),
          broker_id: 'ref_dex',
        },
      }).then(async (res) => {
        if (res.success === false)
          return orderEditPopUpFailure({
            tip: res.message,
          });

        handlePendingOrderRefreshing();

        const order = await getOrderByOrderId({
          accountId,
          order_id: res.data.order_id,
        });

        return orderPopUp({
          orderType: 'Limit',
          symbolName: symbol,
          side: side,
          size: parseFloat(inputValue).toString(),

          tokenIn: tokenIn,
          price: parseFloat(limitPrice || '').toString(),

          timeStamp: res.timestamp,
          filled: order?.data?.status === 'FILLED',
          order: order.data,
        });
      });
    }
  };

  const [tradingKeySet, setTradingKeySet] = useState<boolean>(false);

  const [keyAnnounced, setKeyAnnounced] = useState<boolean>(false);

  const [showErrorTip, setShowErrorTip] = useState<boolean>(false);

  const [errorTipMsg, setErrorTipMsg] = useState<string>('');

  const storedValid = localStorage.getItem(REF_ORDERLY_ACCOUNT_VALID);

  useEffect(() => {
    if (!accountId || !storageEnough) return;
    console.log(
      'storedValidstoredValidstoredValidstoredValidstoredValid---spot',
      storedValid
    );
    if (!!storedValid) {
      setValidAccountSig(true);
      setKeyAnnounced(true);
      setTradingKeySet(true);

      return;
    }

    is_orderly_key_announced(accountId, true)
      .then(async (key_announce) => {
        console.log('search result key_announce_spot', key_announce);
        setKeyAnnounced(key_announce);
        if (!key_announce) {
          const res = await announceKey(accountId).then((res) => {
            console.log('set key_announce_spot as true');
            setKeyAnnounced(true);
          });
        } else return;
      })
      .then(() => {
        is_trading_key_set(accountId).then(async (trading_key_set) => {
          console.log('search result trading_announce_spot', trading_key_set);
          setTradingKeySet(trading_key_set);
          if (!trading_key_set) {
            await setTradingKey(accountId).then(() => {
              console.log('set trading_key_spot as true');
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

  const isInsufficientBalance =
    side === 'Buy'
      ? new Big(total === '-' || !total ? '0' : total).gt(
          tokenOutHolding || '0'
        ) || new Big(tokenOutHolding || 0).eq(0)
      : new Big(inputValue || '0').gt(tokenInHolding || '0');

  const loading =
    ((!!accountId && storageEnough === undefined) ||
      (!!storedValid && !validAccountSig)) &&
    !!accountId;

  const priceValidator = (price: string, size: string) => {
    const symbolInfo = availableSymbols?.find((s) => s.symbol === symbol);

    if (!symbolInfo) {
      return;
    }

    if (new Big(price || 0).lt(symbolInfo.quote_min)) {
      setShowErrorTip(true);
      setErrorTipMsg(
        `${intl.formatMessage({
          id: 'min_price_should_be_higher_than_or_equal_to',
          defaultMessage: 'Min price should be higher than or equal to',
        })} ${symbolInfo.quote_min}`
      );
      return;
    }

    if (new Big(price || 0).gt(symbolInfo.quote_max)) {
      setShowErrorTip(true);
      setErrorTipMsg(
        `${intl.formatMessage({
          id: 'price_should_be_lower_than_or_equal_to',
          defaultMessage: 'Price should be lower than or equal to',
        })} ${symbolInfo.quote_max}`
      );
      return;
    }

    if (
      new Big(new Big(price || 0).minus(new Big(symbolInfo.quote_min)))
        .mod(symbolInfo.quote_tick)
        .gt(0)
    ) {
      setShowErrorTip(true);
      setErrorTipMsg(
        `${intl.formatMessage({
          id: 'price_should_be_a_multiple_of',
          defaultMessage: 'Price should be a multiple of',
        })} ${symbolInfo.quote_tick}${intl.formatMessage({
          id: 'price_should_be_a_multiple_of_zh',
          defaultMessage: ' ',
        })}`
      );
      return;
    }

    if (
      new Big(price || 0).gt(
        new Big(orders.asks?.[0]?.[0] || 0).times(1 + symbolInfo.price_range)
      ) &&
      side === 'Buy'
    ) {
      setShowErrorTip(true);
      setErrorTipMsg(
        `${intl.formatMessage({
          id: 'price_should_be_lower_than_or_equal_to',
          defaultMessage: 'Price should be lower than or equal to',
        })} ${new Big(orders.asks?.[0]?.[0] || 0).times(
          1 + symbolInfo.price_range
        )}`
      );

      return;
    }

    if (
      new Big(price || 0).lt(
        new Big(orders.bids?.[0]?.[0] || 0).times(1 - symbolInfo.price_range)
      ) &&
      side === 'Sell'
    ) {
      setShowErrorTip(true);
      setErrorTipMsg(
        `${intl.formatMessage({
          id: 'price_should_be_greater_than_or_equal_to',
          defaultMessage: 'Price should be greater than or equal to',
        })} ${new Big(orders.bids?.[0]?.[0] || 0)
          .times(1 - symbolInfo.price_range)
          .toFixed(tickToPrecision(symbolInfo.quote_tick))}`
      );

      return;
    }

    if (
      price &&
      size &&
      new Big(price || 0).times(new Big(size || 0)).lt(symbolInfo.min_notional)
    ) {
      setShowErrorTip(true);
      setErrorTipMsg(
        `${intl.formatMessage({
          id: 'the_order_value_should_be_be_greater_than_or_equal_to',
          defaultMessage:
            'The order value should be be greater than or equal to',
        })} ${symbolInfo.min_notional}`
      );
      return;
    }

    return true;
  };

  const sizeValidator = (price: string, size: string) => {
    const symbolInfo = availableSymbols?.find((s) => s.symbol === symbol);

    if (!symbolInfo) {
      return;
    }

    // size validator

    if (new Big(size || 0).lt(symbolInfo.base_min)) {
      setShowErrorTip(true);
      setErrorTipMsg(
        `${
          side === 'Buy'
            ? intl.formatMessage({
                id: 'quantity_to_buy_should_be_greater_than_or_equal_to',
                defaultMessage:
                  'Quantity to buy should be greater than or equal to',
              })
            : intl.formatMessage({
                id: 'quantity_to_sell_should_be_greater_than_or_equal_to',
                defaultMessage:
                  'Quantity to sell should be greater than or equal to',
              })
        } ${symbolInfo.base_min}`
      );
      return;
    }

    if (new Big(size || 0).gt(symbolInfo.base_max)) {
      setShowErrorTip(true);
      setErrorTipMsg(
        `${
          side === 'Buy'
            ? intl.formatMessage({
                id: 'quantity_to_buy_should_be_less_than_or_equal_to',
                defaultMessage:
                  'Quantity to buy should be less than or equal to',
              })
            : intl.formatMessage({
                id: 'quantity_to_sell_should_be_less_than_or_equal_to',
                defaultMessage:
                  'Quantity to sell should be less than or equal to',
              })
        } ${symbolInfo.base_max}`
      );
      return;
    }

    if (
      new Big(new Big(size || 0).minus(new Big(symbolInfo.base_min)))
        .mod(symbolInfo.base_tick)
        .gt(0)
    ) {
      setShowErrorTip(true);
      setErrorTipMsg(
        `${intl.formatMessage({
          id: 'quantity_should_be_a_multiple_of',
          defaultMessage: 'Quantity should be a multiple of',
        })} ${symbolInfo.base_tick}${intl.formatMessage({
          id: 'quantity_should_be_a_multiple_of_zh',
          defaultMessage: ' ',
        })}`
      );
      return;
    }

    if (
      price &&
      size &&
      new Big(price || 0).times(new Big(size || 0)).lt(symbolInfo.min_notional)
    ) {
      setShowErrorTip(true);
      setErrorTipMsg(
        `${intl.formatMessage({
          id: 'the_order_value_should_be_be_greater_than_or_equal_to',
          defaultMessage:
            'The order value should be be greater than or equal to',
        })} ${symbolInfo.min_notional}`
      );
      return;
    }

    return true;
  };

  const priceAndSizeValidator = (
    price: string,
    size: string,
    source?: 'maxinput'
  ) => {
    const symbolInfo = availableSymbols?.find((s) => s.symbol === symbol);

    if (!symbolInfo || (ONLY_ZEROS.test(price) && ONLY_ZEROS.test(size))) {
      setShowErrorTip(false);
      setErrorTipMsg('');
      return;
    }

    let resPrice;
    let resSize;

    if (!ONLY_ZEROS.test(price)) {
      resPrice = priceValidator(price, size);
    } else {
      resPrice = true;
    }

    if (!ONLY_ZEROS.test(size)) {
      resSize = sizeValidator(price, size);
    } else {
      resSize = true;
    }

    if (typeof resSize === 'boolean' && !resSize && source) {
      setInputValue('0');
    }

    if (resPrice === true && resSize === true) {
      // price validator

      setShowErrorTip(false);
      setErrorTipMsg('');
    }
  };

  const curSymbol = availableSymbols?.find((s) => s.symbol === symbol);

  useEffect(() => {
    setLimitPrice(bridgePrice);
    priceAndSizeValidator(bridgePrice, inputValue);

    if (!ONLY_ZEROS.test(bridgePrice) && !ONLY_ZEROS.test(inputValue)) {
      const total = new Big(bridgePrice || 0)
        .times(inputValue)
        .toNumber()
        .toString();
      setTotal(total);

      return;
    }

    if (
      !ONLY_ZEROS.test(total) &&
      !ONLY_ZEROS.test(bridgePrice) &&
      total !== '-' &&
      curSymbol
    ) {
      // change input value
      const qty = new Big(total || 0)
        .div(bridgePrice)
        .toFixed(tickToPrecision(curSymbol.base_tick));
      setInputValue(qty);

      priceAndSizeValidator(bridgePrice, qty);

      return;
    }
  }, [bridgePrice]);

  useEffect(() => {
    const marketPrice = !orders
      ? 0
      : side === 'Buy'
      ? orders.asks?.[0]?.[0]
      : orders?.bids?.[0]?.[0];

    priceAndSizeValidator(
      orderType === 'Limit' ? limitPrice : marketPrice?.toString() || '0',
      inputValue
    );
  }, [side, orderType, symbol, orders]);
  useEffect(() => {
    setLimitPrice('');
    setTotal('');
    setInputValue('');
    setShowErrorTip(false);
  }, [symbol]);

  const validator =
    !accountId ||
    !storageEnough ||
    !tradingKeySet ||
    !keyAnnounced ||
    !validContract() ||
    maintenance;

  const intl = useIntl();

  return (
    <div className=" relative flex flex-col  ">
      {/* not signed in wrapper */}
      {maintenance && (
        <div
          className="absolute  flex flex-col justify-center items-center h-full w-full top-0 left-0 "
          style={{
            background: 'rgba(0, 19, 32, 0.8)',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)',
            zIndex: 89,
          }}
        ></div>
      )}

      {loading && !maintenance && (
        <div
          className="absolute  flex flex-col justify-center items-center h-full w-full top-0 left-0 "
          style={{
            background: 'rgba(0, 19, 32, 0.8)',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)',

            zIndex: 89,
          }}
        >
          <OrderlyLoading></OrderlyLoading>
        </div>
      )}

      {validator && !loading && !maintenance && (
        <div
          className="absolute  flex flex-col justify-center items-center h-full w-full top-0 left-0 "
          style={{
            background: 'rgba(0, 19, 32, 0.8)',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)',

            zIndex: 50,
          }}
        >
          <RefToOrderly></RefToOrderly>

          {!accountId && (
            <ConnectWallet
              onClick={() => {
                modal.show();
              }}
            ></ConnectWallet>
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
              ></ConfirmButton>
            </div>
          )}

          {!!accountId &&
            validContract() &&
            (!storageEnough || !tradingKeySet || !keyAnnounced) && (
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
                check={agreeCheck}
                storageEnough={!!storageEnough}
                spin={
                  (storageEnough && (!tradingKeySet || !keyAnnounced)) ||
                  agreeCheck
                }
              />
            )}
        </div>
      )}

      <div className="frcb px-2 pb-2 border-white border-opacity-10 text-primaryText ">
        <button
          className={`  w-1/2 frcc relative`}
          onClick={() => {
            setOrderType('Limit');
          }}
        >
          <span
            className={`text-sm font-gothamBold ${
              orderType === 'Limit' ? 'text-white' : ''
            } `}
          >
            {intl.formatMessage({
              id: 'limit_orderly',
              defaultMessage: 'Limit',
            })}
          </span>

          {orderType === 'Limit' && (
            <div className="w-full absolute -bottom-2 h-0.5 bg-gradientFromHover"></div>
          )}
        </button>

        <button
          className={`  w-1/2 frcc relative`}
          onClick={() => {
            setOrderType('Market');
          }}
        >
          <span
            className={`text-sm font-gothamBold ${
              orderType === 'Market' ? 'text-white ' : ''
            } `}
          >
            {intl.formatMessage({
              id: 'market',
              defaultMessage: 'Market',
            })}
          </span>

          {orderType === 'Market' && (
            <div className="w-full absolute -bottom-2 h-0.5 bg-gradientFromHover"></div>
          )}
        </button>
      </div>

      {/* sell and buy button  */}
      <div className="flex px-2 items-center justify-center mt-3">
        <BuyButton
          onClick={() => {
            setSide('Buy');
          }}
          select={side === 'Buy'}
        />

        <SellButton
          onClick={() => {
            setSide('Sell');
          }}
          select={side === 'Sell'}
        />
      </div>

      {/* input box */}

      {orderType === 'Limit' && (
        <div className="w-full text-primaryOrderly bg-perpCardBg mt-3 text-xs  rounded-xl border border-boxBorder p-1.5">
          <div className="flex items-center justify-between">
            <span>
              {intl.formatMessage({
                id: 'price',
                defaultMessage: 'Price',
              })}
            </span>

            <span>
              {symbolTo}/{symbolFrom}
            </span>
          </div>

          <div className="flex items-center mt-3 justify-between">
            <input
              type="number"
              step="any"
              ref={inputLimitPriceRef}
              onWheel={(e) =>
                inputLimitPriceRef.current
                  ? inputLimitPriceRef.current?.blur()
                  : null
              }
              min={0}
              placeholder="0"
              className="text-white text-left ml-2 text-lg w-full"
              value={limitPrice}
              onChange={(e) => {
                const price = e.target.value;

                priceAndSizeValidator(price, inputValue);

                setLimitPrice(price);

                if (ONLY_ZEROS.test(price)) {
                  setTotal('0');

                  return;
                }

                if (!ONLY_ZEROS.test(price) && !ONLY_ZEROS.test(inputValue)) {
                  const total = new Big(price || 0)
                    .times(inputValue)
                    .toNumber()
                    .toString();
                  setTotal(total);

                  return;
                }

                if (!ONLY_ZEROS.test(total) && !ONLY_ZEROS.test(price)) {
                  // change input value
                  const qty = new Big(total || 0)
                    .div(price)
                    .toFixed(tickToPrecision(curSymbol.base_tick));
                  setInputValue(qty);

                  priceAndSizeValidator(price, qty);

                  return;
                }
              }}
              inputMode="decimal"
              onKeyDown={(e) =>
                symbolsArr.includes(e.key) && e.preventDefault()
              }
            />
          </div>
        </div>
      )}
      {orderType === 'Market' && (
        <div className="w-full rounded-xl border border-boxBorder p-3 mt-3 text-sm flex items-center justify-between">
          <span className="text-primaryOrderly">
            {intl.formatMessage({
              id: 'price',
              defaultMessage: 'Price',
            })}
          </span>

          <span className="text-white">
            {' '}
            {intl.formatMessage({
              id: 'market_price',
              defaultMessage: 'Market price',
            })}
          </span>
        </div>
      )}

      <div className="w-full mt-3 text-primaryOrderly text-xs  bg-perpCardBg rounded-xl border border-boxBorder p-1.5">
        <div className="mb-2 text-left flex items-center justify-between">
          <span>
            {intl.formatMessage({
              id: 'quantity',
              defaultMessage: 'Quantity',
            })}
          </span>

          <span className="">{symbolFrom}</span>
        </div>

        <div className="flex items-center mt-2">
          <input
            inputMode="decimal"
            ref={inputAmountRef}
            onWheel={(e) =>
              inputAmountRef.current ? inputAmountRef.current.blur() : null
            }
            className="text-white ml-2 text-lg w-full"
            value={inputValue}
            placeholder="0"
            type="number"
            step="any"
            min={0}
            onChange={(e) => {
              const displayAmount = e.target.value;
              let price =
                orderType === 'Limit'
                  ? limitPrice
                  : marketPrice?.toString() || '0';

              priceAndSizeValidator(
                orderType === 'Limit'
                  ? limitPrice
                  : marketPrice?.toString() || '0',
                e.target.value
              );

              setInputValue(e.target.value);

              if (ONLY_ZEROS.test(displayAmount)) {
                setTotal('0');
                return;
              }

              if (!ONLY_ZEROS.test(price) && !ONLY_ZEROS.test(displayAmount)) {
                const total = new Big(price)
                  .times(displayAmount || '0')
                  .toNumber()
                  .toString();

                setTotal(total);

                return;
              } else if (
                !ONLY_ZEROS.test(total) &&
                ONLY_ZEROS.test(price) &&
                orderType === 'Limit'
              ) {
                price = new Big(total)
                  .div(new Big(displayAmount || 0))
                  .toNumber()
                  .toString();

                setLimitPrice(price);

                priceAndSizeValidator(price, displayAmount, 'maxinput');

                return;
              }
            }}
            onKeyDown={(e) => symbolsArr.includes(e.key) && e.preventDefault()}
          />

          <span
            className="bg-menuMoreBgColor rounded-md px-2 py-0.5 text-primaryText cursor-pointer hover:opacity-70"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              const symbolInfo = availableSymbols?.find(
                (s) => s.symbol === symbol
              );

              if (!symbolInfo) {
                return;
              }

              const maxAmount =
                side === 'Sell'
                  ? tokenInHolding || 0
                  : new Big(tokenOutHolding || 0)
                      .div(
                        orderType === 'Market' ? marketPrice : limitPrice || 1
                      )
                      .toNumber();

              const displayAmount = new Big(maxAmount || 0)
                .div(new Big(symbolInfo.base_tick))
                .round(0, 0)
                .times(new Big(symbolInfo.base_tick))
                .toString();

              setInputValue(displayAmount);

              let price =
                orderType == 'Market'
                  ? marketPrice?.toString() || '0'
                  : limitPrice;

              priceAndSizeValidator(price, displayAmount, 'maxinput');

              if (!ONLY_ZEROS.test(price) && !ONLY_ZEROS.test(displayAmount)) {
                const total = new Big(price)
                  .times(displayAmount || '0')
                  .toNumber()
                  .toString();

                setTotal(total);

                return;
              } else if (
                !ONLY_ZEROS.test(total) &&
                ONLY_ZEROS.test(price) &&
                orderType === 'Limit'
              ) {
                price = new Big(total)
                  .div(new Big(displayAmount || 0))
                  .toNumber()
                  .toString();

                setLimitPrice(price);

                priceAndSizeValidator(price, displayAmount, 'maxinput');

                return;
              }
            }}
          >
            Max
          </span>
        </div>
      </div>

      <div className="mt-2   text-sm px-0 relative z-10 pb-2 pt-3 border-t border-white border-opacity-10">
        <div className="text-primaryOrderly px-1.5 py-2 w-full border border-inputV3BorderColor rounded-xl bg-perpCardBg mr-2 flex flex-col">
          <div className="frcb">
            <span className="frcs">
              {intl.formatMessage({
                id: 'total',
                defaultMessage: 'Total',
              })}

              <span className="font-sans">&nbsp;{'≈'}</span>
            </span>

            <TextWrapper
              className="text-10px py-0 px-1"
              value={'USDC.e'}
              textC="text-primaryText"
            />
          </div>

          <div className="frcs gap-2">
            <input
              type="number"
              step="any"
              inputMode="decimal"
              className="text-white text-left text-lg ml-2"
              value={total}
              min={0}
              onKeyDown={(e) =>
                symbolsArr.includes(e.key) && e.preventDefault()
              }
              onChange={(e) => {
                const value = e.target.value;

                setTotal(value);

                let qty = '';

                if (ONLY_ZEROS.test(value)) {
                  setInputValue('');
                  // return;
                }

                const price =
                  orderType === 'Limit'
                    ? limitPrice
                    : marketPrice?.toString() || '0';

                if (
                  orderType === 'Limit' &&
                  !ONLY_ZEROS.test(limitPrice) &&
                  !ONLY_ZEROS.test(value)
                ) {
                  qty = new Big(value)
                    .div(new Big(limitPrice))
                    .toFixed(tickToPrecision(curSymbol?.base_tick || 0.01));

                  setInputValue(qty);
                } else if (
                  orderType === 'Market' &&
                  !ONLY_ZEROS.test(marketPrice.toString()) &&
                  !ONLY_ZEROS.test(value)
                ) {
                  qty = new Big(value)
                    .div(new Big(marketPrice))
                    .toFixed(tickToPrecision(curSymbol?.base_tick || 0.01));
                }

                setInputValue(qty);

                priceAndSizeValidator(price, qty);
              }}
              onFocus={() => {
                setOnTotalFocus(true);
              }}
              onBlur={() => {
                setOnTotalFocus(false);
              }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between pt-3">
          <span className="text-primaryOrderly ">
            {intl.formatMessage({
              id: 'Fees',
              defaultMessage: 'Fees',
            })}
          </span>

          <FlexRow className="">
            <span className="flex items-center mr-1.5 xs:mr-1">
              <span className=" mr-2 text-white xs:mr-1">
                {Number((userInfo?.taker_fee_rate || 0) / 100).toFixed(2)}%
              </span>
              <TextWrapper
                textC="text-primaryText "
                className="text-xs py-0 px-1"
                value={intl.formatMessage({
                  id: 'Taker',
                  defaultMessage: 'Taker',
                })}
              ></TextWrapper>
            </span>

            <span className="flex items-center">
              <span className=" mr-2 xs:mr-1 text-white">
                {Number((userInfo?.maker_fee_rate || 0) / 100).toFixed(2)}%
              </span>
              <TextWrapper
                textC="text-primaryText"
                value={intl.formatMessage({
                  id: 'Maker',
                  defaultMessage: 'Maker',
                })}
                className="text-xs py-0 px-1"
              ></TextWrapper>
            </span>
          </FlexRow>
        </div>
      </div>

      {showErrorTip && (
        <ErrorTip className={'relative top-0'} text={errorTipMsg} />
      )}

      {orderType === 'Limit' && (
        <div className="text-white text-sm ">
          <div className="flex items-center pt-2 justify-between">
            <span className="text-primaryOrderly">
              {' '}
              {intl.formatMessage({
                id: 'advanced',
                defaultMessage: 'Advanced',
              })}
            </span>

            <span
              className={`${
                showLimitAdvance ? 'text-white' : 'text-primaryOrderly'
              } cursor-pointer `}
              onClick={() => {
                setShowLimitAdvance(!showLimitAdvance);
              }}
            >
              {showLimitAdvance ? <IoIosArrowUp /> : <IoIosArrowDown />}
            </span>
          </div>

          <div
            className={`flex mt-2  flex-col gap-2 ${
              showLimitAdvance ? '' : 'hidden'
            }`}
          >
            <div className="flex items-center">
              <CheckBox
                check={advanceLimitMode === 'IOC'}
                setCheck={() => {
                  if (advanceLimitMode === 'IOC') {
                    setAdvanceLimitMode(undefined);
                  } else {
                    setAdvanceLimitMode('IOC');
                  }
                }}
              ></CheckBox>
              <span
                className="ml-2 mr-1 cursor-pointer"
                onClick={() => {
                  if (advanceLimitMode === 'IOC') {
                    setAdvanceLimitMode(undefined);
                  } else {
                    setAdvanceLimitMode('IOC');
                  }
                }}
              >
                IOC
              </span>

              <div
                data-class="reactTip"
                data-tooltip-id={'user_board_ioc'}
                data-place={'top'}
                data-tooltip-html={getTipIoc()}
              >
                <QuestionMark></QuestionMark>

                <CustomTooltip id={'user_board_ioc'} place="right" />
              </div>
            </div>
            <div className="flex items-center">
              <CheckBox
                check={advanceLimitMode === 'FOK'}
                setCheck={() => {
                  if (advanceLimitMode === 'FOK') {
                    setAdvanceLimitMode(undefined);
                  } else {
                    setAdvanceLimitMode('FOK');
                  }
                }}
              ></CheckBox>
              <span
                className="cursor-pointer ml-2 mr-1"
                onClick={() => {
                  if (advanceLimitMode === 'FOK') {
                    setAdvanceLimitMode(undefined);
                  } else {
                    setAdvanceLimitMode('FOK');
                  }
                }}
              >
                FOK
              </span>

              <div
                data-class="reactTip"
                data-tooltip-id={'user_board_folk'}
                data-place={'top'}
                data-tooltip-html={getTipFOK()}
              >
                <QuestionMark></QuestionMark>

                <CustomTooltip id={'user_board_folk'} place="right" />
              </div>
            </div>
            <div className="flex items-center">
              <CheckBox
                check={advanceLimitMode === 'POST_ONLY'}
                setCheck={() => {
                  if (advanceLimitMode === 'POST_ONLY') {
                    setAdvanceLimitMode(undefined);
                  } else {
                    setAdvanceLimitMode('POST_ONLY');
                  }
                }}
              ></CheckBox>
              <span
                className="ml-2 mr-1 cursor-pointer"
                onClick={() => {
                  if (advanceLimitMode === 'POST_ONLY') {
                    setAdvanceLimitMode(undefined);
                  } else {
                    setAdvanceLimitMode('POST_ONLY');
                  }
                }}
              >
                Post-only
              </span>

              <div
                data-class="reactTip"
                data-tooltip-id={'user_board_post_only'}
                data-place={'top'}
                data-tooltip-html={getTipPostOnly()}
              >
                <QuestionMark></QuestionMark>

                <CustomTooltip id={'user_board_post_only'} place="right" />
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        className={`rounded-lg ${
          side === 'Buy'
            ? 'bg-buyGradientGreen'
            : isInsufficientBalance
            ? 'bg-errorTip'
            : 'bg-sellGradientRed'
        } ${
          isInsufficientBalance && side === 'Sell'
            ? 'text-redwarningColor'
            : 'text-white'
        }   py-2.5 mt-4 bottom-3 mb-3 flex z-20 items-center justify-center text-base ${
          submitDisable || showErrorTip || isInsufficientBalance
            ? 'opacity-60 cursor-not-allowed'
            : ''
        } `}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // handleSubmit();

          setConfirmModalOpen(true);
        }}
        disabled={submitDisable || isInsufficientBalance || showErrorTip}
        type="button"
      >
        {isInsufficientBalance
          ? intl.formatMessage({
              id: 'insufficient_balance',
              defaultMessage: 'Insufficient Balance',
            })
          : intl.formatMessage({
              id: side.toLowerCase(),
              defaultMessage: side,
            })}
        {` ${isInsufficientBalance ? '' : symbolFrom}`}
      </button>

      {isInsufficientBalance && (
        <DepositTip
          onClick={() => {
            setOperationType('deposit');
            setOperationId(
              side === 'Buy' ? tokenOut?.id || '' : tokenIn?.id || ''
            );
          }}
          type="spot"
        />
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
        freeCollateral={freeCollateral}
        curHoldingOut={curHoldingOut}
      />

      {showAllAssets && (
        <AssetModal
          isOpen={showAllAssets}
          curHoldingOut={curHoldingOut}
          onRequestClose={() => {
            setShowAllAssets(false);
          }}
        />
      )}

      <ConfirmOrderModal
        isOpen={confirmModalOpen}
        onRequestClose={() => {
          setConfirmModalOpen(false);
        }}
        symbolFrom={symbolFrom}
        symbolTo={symbolTo}
        side={side}
        quantity={inputValue}
        price={
          orderType === 'Limit' ? limitPrice : marketPrice?.toString() || '0'
        }
        orderType={orderType}
        fee={fee}
        totalCost={ONLY_ZEROS.test(total) ? '-' : Number(total)}
        onClick={handleSubmit}
        userInfo={userInfo}
      ></ConfirmOrderModal>

      <RegisterModal
        isOpen={registerModalOpen}
        onRequestClose={() => {
          setRegisterModalOpen(false);
        }}
        orderlyRegistered={userExist}
        onConfirm={() => {
          setAgreeCheck(true);
        }}
        userExist={userExist}
      />
    </div>
  );
}

export function AssetManagerModal(
  props: Modal.Props & {
    type: 'deposit' | 'withdraw' | undefined;
    onClick: (amount: string, tokenId?: string) => Promise<void>;
    tokenId: string | undefined;
    accountBalance: number | string;
    walletBalance?: number | string;
    standAlone?: boolean;
    tokenInfo: TokenInfo[] | undefined;
    freeCollateral: string;
    curHoldingOut;
  }
) {
  const {
    onClick,
    walletBalance: walletBalanceProp,
    standAlone,
    onRequestClose,
    type,
    tokenId: tokenIdProp,
    accountBalance,
    tokenInfo,
    isOpen,
    freeCollateral,
    curHoldingOut,
  } = props;

  const [tokenId, setTokenId] = useState<string | undefined>(tokenIdProp);

  const isMobile = useClientMobile();

  useEffect(() => {
    setTokenId(tokenIdProp);
  }, [tokenIdProp]);

  const [showSelectToken, setShowSelectToken] = useState<boolean>(false);

  const [tokenMeta, setTokenMeta] = useState<any>();

  const [percentage, setPercentage] = useState<string>('0');

  const progressBarIndex = [0, 25, 50, 75, 100];

  const [hoverToken, setHoverToken] = useState<boolean>(false);

  const balances = useTokensBalances(
    tokenInfo?.map((token) => {
      return {
        id: token.token_account_id,
        decimals: token.decimals,
      };
    }) || [],
    tokenInfo,
    isOpen,
    freeCollateral,
    curHoldingOut
  );

  const walletBalance =
    balances?.find((b: any) => b.id.toLowerCase() === tokenId.toLowerCase())
      ?.wallet_balance ||
    walletBalanceProp ||
    '0';

  const displayAccountBalance =
    balances
      ?.find((b: any) => b.id.toLowerCase() === tokenId.toLowerCase())
      ?.holding?.toString() || '0';

  useEffect(() => {
    if (!tokenId) return;
    if (tokenId === 'near') {
      setTokenMeta(nearMetadata);
    } else
      getFTmetadata(tokenId).then((meta) => {
        setTokenMeta(meta);
      });
  }, [tokenId]);

  const [inputValue, setInputValue] = useState<string>();
  const ref = useRef<HTMLInputElement>(null);

  const rangeRef = useRef<HTMLInputElement>(null);
  const decimalPlaceLimit = Math.min(8, tokenMeta?.decimals || 8);

  const setAmountByShareFromBar = (sharePercent: string) => {
    setPercentage(sharePercent);

    const sharePercentOfValue = percentOfBigNumber(
      Number(sharePercent),
      type === 'deposit'
        ? tokenId.toLowerCase() === 'near'
          ? new Big(Number(walletBalance) < 0.5 ? 0.5 : walletBalance)
              .minus(0.5)
              .toFixed(24)
          : walletBalance
        : displayAccountBalance.toString(),
      decimalPlaceLimit || tokenMeta.decimals
    );

    if (
      new Big(sharePercentOfValue).gt(new Big(walletBalance)) &&
      type === 'deposit'
    ) {
      setInputValue('0');
      return;
    }

    if (Number(sharePercent) === 0) {
      setInputValue('');
    } else {
      setInputValue(sharePercentOfValue);
    }
  };

  const [buttonLoading, setButtonLoading] = useState(false);
  const intl = useIntl();
  useEffect(() => {
    if (tokenId && tokenMeta) {
      setAmountByShareFromBar(percentage);
    }
  }, [tokenId, tokenMeta]);

  useEffect(() => {
    if (rangeRef.current) {
      rangeRef.current.style.backgroundSize = `${percentage}% 100%`;
    }
  }, [percentage, rangeRef.current]);

  if (!tokenId || !tokenMeta) return null;

  function validation() {
    if (type === 'deposit') {
      if (
        tokenId.toLowerCase() === 'near' &&
        new Big(walletBalance || 0).minus(new Big(inputValue || '0')).lt(0.5) &&
        walletBalance !== ''
      ) {
        return false;
      }

      if (
        tokenId.toLowerCase() !== 'near' &&
        new Big(walletBalance || 0).minus(new Big(inputValue || '0')).lt(0)
      ) {
        return false;
      }
    }

    if (type === 'withdraw') {
      if (
        new Big(displayAccountBalance || 0)
          .minus(new Big(inputValue || '0'))
          .lt(0)
      ) {
        return false;
      }
    }

    return true;
  }

  return (
    <>
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
                left: '0px',
                transform: 'translate(-50%, -20px)',
                outline: 'none',
              }
            : {
                zIndex: 999,
              },
        }}
      >
        <div
          className={`  lg:w-p410  ${
            isMobile
              ? 'xs:w-screen xs:fixed xs:bottom-0 xs:left-0 rounded-t-2xl'
              : 'gradientBorderWrapperNoShadowForOrderly border rounded-2xl'
          }  bg-boxBorder text-sm text-primaryOrderly  `}
        >
          <div className="px-5 py-6 flex flex-col ">
            <div className="flex items-center pb-6 justify-between">
              <span className="text-white text-lg font-bold">
                {props.type === 'deposit'
                  ? intl.formatMessage({
                      id: 'deposit',
                      defaultMessage: 'Deposit',
                    })
                  : props.type === 'withdraw'
                  ? intl.formatMessage({
                      id: 'withdraw',
                      defaultMessage: 'Withdraw',
                    })
                  : ''}
              </span>

              <span
                className={isMobile ? 'hidden' : 'cursor-pointer '}
                onClick={(e: any) => {
                  onRequestClose && onRequestClose(e);
                }}
              >
                <IoClose size={20} />
              </span>
            </div>

            <div className="flex items-center pb-3 justify-between">
              <span className="flex items-center">
                <NearIConSelectModal />{' '}
                <span className="ml-2 whitespace-nowrap">
                  {intl.formatMessage({
                    id: 'wallet_up',
                    defaultMessage: 'Wallet',
                  })}
                </span>
              </span>

              <span title={walletBalance?.toString() || ''}>
                {!walletBalance
                  ? '-'
                  : digitWrapperAsset(walletBalance.toString() || '0', 3)}
              </span>
            </div>

            <div className="flex items-center pb-4 justify-between">
              <span className="flex items-center ">
                {' '}
                <OrderlyIconBalance />
                <span className="ml-2 whitespace-nowrap">
                  {intl.formatMessage({
                    id: 'available_orderly',
                    defaultMessage: 'Available',
                  })}
                </span>
              </span>

              <span title={displayAccountBalance?.toString() || ''}>
                {digitWrapperAsset(displayAccountBalance.toString(), 3)}
              </span>
            </div>

            <div className="flex mb-5 items-center border border-border2 w-full bg-black bg-opacity-10 rounded-2xl px-3 py-3">
              <input
                inputMode="decimal"
                ref={ref}
                onWheel={(e) => (ref.current ? ref.current.blur() : null)}
                className="text-white text-xl w-full"
                value={inputValue}
                type="number"
                placeholder="0.0"
                min={0}
                onInput={(e) => {
                  if (decimalPlaceLimit === undefined) return;

                  function limitDecimalPlaces(e: any) {
                    // 获取用户输入的数字
                    const value = e.target.value;

                    // 判断是否超过了8位小数

                    if (
                      value.includes('.') &&
                      value.split('.')[1].length > decimalPlaceLimit
                    ) {
                      // 截取前8位小数
                      e.target.value = value.slice(
                        0,
                        value.indexOf('.') + decimalPlaceLimit + 1
                      );
                    }
                  }

                  limitDecimalPlaces(e);
                }}
                onChange={(e) => {
                  const value = e.target.value;
                  setInputValue(e.target.value);

                  const percentage =
                    Number(
                      type === 'deposit' ? walletBalance : displayAccountBalance
                    ) > 0
                      ? percent(
                          value || '0',
                          type === 'deposit'
                            ? type === 'deposit' &&
                              tokenId.toLowerCase() === 'near'
                              ? new Big(
                                  Number(walletBalance) < 0.5
                                    ? 0.5
                                    : walletBalance || 0
                                )
                                  .minus(0.5)
                                  .toFixed(24)
                              : walletBalance.toString()
                            : displayAccountBalance.toString()
                        ).toString()
                      : '0';
                  setPercentage(
                    scientificNotationToString(
                      Number(percentage) > 100 ? '100' : percentage
                    )
                  );
                }}
                onKeyDown={(e) =>
                  symbolsArr.includes(e.key) && e.preventDefault()
                }
              />

              <div
                className="rounded-3xl p-1  hover:bg-symbolHover3 cursor-pointer flex flex-shrink-0 pr-2 items-center"
                style={{
                  background: hoverToken ? 'rgba(126, 138, 147, 0.1)' : '',
                }}
                onMouseEnter={() => {
                  setHoverToken(true);
                }}
                onMouseLeave={() => {
                  setHoverToken(false);
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowSelectToken(true);
                }}
              >
                <img
                  src={tokenMeta.icon}
                  className="rounded-full w-6 h-6 mr-2"
                  alt=""
                />
                <span className="text-white font-bold text-base">
                  {tokenMeta.symbol}
                </span>
                <MdKeyboardArrowDown size={20} />
              </div>
            </div>

            <div className="pb-8">
              <div className="flex items-center justify-between  px-1.5 ">
                {progressBarIndex.map((index, i) => {
                  return (
                    <div
                      className="flex flex-col items-center text-xs cursor-pointer w-4"
                      key={i}
                      onClick={() => {
                        setAmountByShareFromBar(index.toString());
                      }}
                    >
                      <span>{index}%</span>
                      <span>∣</span>
                    </div>
                  );
                })}
              </div>

              <div className="py-1 px-1 relative">
                <input
                  ref={rangeRef}
                  onChange={(e) => {
                    setAmountByShareFromBar(e.target.value);
                  }}
                  value={percentage}
                  type="range"
                  className={`w-full cursor-pointer deposit-bar remove-by-share-bar`}
                  min="0"
                  max="100"
                  step="any"
                  inputMode="decimal"
                  style={{
                    backgroundSize: `${percentage}% 100%`,
                  }}
                />

                <div
                  className={`rangeText rounded-lg absolute py-0.5 text-xs text-black font-bold text-center w-10`}
                  style={{
                    background: '#00C6A2',
                    left: `calc(${percentage}% - 40px * ${percentage} / 100)`,
                    position: 'absolute',
                    top: '20px',
                  }}
                >
                  {Number(percentage) > 0 && Number(percentage) < 1
                    ? 1
                    : Number(percentage) > 100
                    ? 100
                    : Math.floor(Number(percentage))}
                  %
                </div>
              </div>
            </div>
            {type === 'deposit' &&
              (!validation() || +percentage == 100) &&
              tokenId.toLowerCase() === 'near' && (
                <div className="text-warn text-center mb-2 text-xs xs:-mt-2 lg:whitespace-nowrap">
                  <FormattedMessage
                    id="near_locked_in_wallet_for_covering"
                    defaultMessage="0.5 NEAR locked in wallet for covering transaction fee"
                  />
                </div>
              )}

            <button
              className={`flex ${
                !validation() ||
                new Big(inputValue || 0).lte(0) ||
                buttonLoading
                  ? 'opacity-70 cursor-not-allowed'
                  : ''
              } items-center justify-center  font-bold text-base text-white py-2.5 rounded-lg bg-primaryGradient`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!inputValue) return;
                setButtonLoading(true);
                onClick(inputValue, tokenId);
              }}
              disabled={
                !validation() ||
                new Big(inputValue || 0).lte(0) ||
                buttonLoading
              }
            >
              <ButtonTextWrapper
                loading={buttonLoading}
                Text={() => (
                  <span>
                    {type === 'deposit'
                      ? intl.formatMessage({
                          id: 'deposit',
                          defaultMessage: 'Deposit',
                        })
                      : type === 'withdraw'
                      ? !validation()
                        ? intl.formatMessage({
                            id: 'insufficient_balance',
                            defaultMessage: 'Insufficient Balance',
                          })
                        : intl.formatMessage({
                            id: 'withdraw',
                            defaultMessage: 'Withdraw',
                          })
                      : ''}
                  </span>
                )}
              ></ButtonTextWrapper>
            </button>
          </div>
        </div>
      </Modal>

      <SelectTokenModal
        onSelect={setTokenId}
        isOpen={showSelectToken}
        onRequestClose={() => {
          setShowSelectToken(false);
        }}
        balances={balances}
        tokenInfo={props.tokenInfo}
        style={{
          overlay: {
            zIndex: 1000,
          },
        }}
        orderBy={type === 'deposit' ? 'wallet' : 'orderly'}
      />
    </>
  );
}

function SelectTokenModal(
  props: Modal.Props & {
    onSelect: (tokenId: string) => void;
    tokenInfo: TokenInfo[] | undefined;
    balances: any;
    orderBy: 'wallet' | 'orderly';
  }
) {
  const { onRequestClose, onSelect, tokenInfo, balances, orderBy } = props;

  const [sortOrderlyAccount, setSortOrderlyAccount] = useState<'asc' | 'desc'>(
    'desc'
  );

  const [sortNearBalance, setSortNearBalance] = useState<'asc' | 'desc'>(
    'desc'
  );

  const [searchValue, setSearchValue] = useState<string>('');

  const [sortByBalance, setSortByBalance] = useState<'wallet' | 'orderly'>(
    orderBy
  );
  const intl = useIntl();
  useEffect(() => {
    setSortByBalance(orderBy);
  }, [orderBy]);

  const sortingFunc = (a: any, b: any) => {
    if (sortByBalance === 'wallet' || sortByBalance === undefined) {
      if (sortNearBalance === undefined || sortNearBalance === 'desc') {
        return b.wallet_balance - a.wallet_balance;
      } else {
        return a.wallet_balance - b.wallet_balance;
      }
    } else {
      if (sortOrderlyAccount === undefined || sortOrderlyAccount === 'desc') {
        return b.holding - a.holding;
      } else {
        return a.holding - b.holding;
      }
    }
  };

  const filterFunc = (token: any) => {
    const id = token.id.toLowerCase();

    const name = token.name.toLowerCase();

    return (
      !searchValue ||
      id.includes(searchValue.toLowerCase()) ||
      name?.includes(searchValue.toLowerCase())
    );
  };

  const isMobile = useClientMobile();

  if (!tokenInfo) return null;

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
              left: '0px',
              transform: 'translate(-50%, -20px)',
              outline: 'none',
            }
          : {
              zIndex: 999,
            },
      }}
    >
      <div
        className={` ${
          isMobile
            ? 'rounded-t-2xl fixed w-screen bottom-0 left-0'
            : 'rounded-2xl gradientBorderWrapperNoShadowForOrderly border'
        }     bg-boxBorder text-sm text-primaryOrderly  `}
      >
        <div className=" py-6 text-primaryOrderly text-sm flex flex-col  lg:w-p400  lg:h-p560">
          <div className="flex px-4 items-center pb-6 justify-between">
            <span className="text-white text-lg font-bold">
              {intl.formatMessage({
                id: 'select_token_orderly',
                defaultMessage: 'Select Token',
              })}
            </span>

            <span
              className={isMobile ? 'hidden' : 'cursor-pointer '}
              onClick={(e: any) => {
                onRequestClose && onRequestClose(e);
              }}
            >
              <IoClose size={20} />
            </span>
          </div>
          <div className="w-full px-4">
            <div className="w-full  mb-4 pl-2 py-3 flex items-center rounded-lg bg-black bg-opacity-20 border border-border4">
              <span className="mr-2">
                <FiSearch className={!!searchValue ? 'text-white' : ''} />
              </span>

              <input
                type="text"
                className="w-full"
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                }}
                placeholder={intl.formatMessage({
                  id: 'search_token',
                  defaultMessage: 'Search Token',
                })}
              ></input>
            </div>
          </div>

          <div className="grid px-3  grid-cols-3">
            <div className="justify-self-start">
              {intl.formatMessage({
                id: 'assets',
                defaultMessage: 'Assets',
              })}
            </div>

            <div
              className="justify-self-center flex items-center cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (
                  sortNearBalance === 'asc' ||
                  sortNearBalance === undefined
                ) {
                  return;
                }

                setSortByBalance('wallet');
              }}
            >
              <NearIConSelectModal />

              <span className="ml-2 whitespace-nowrap">
                {intl.formatMessage({
                  id: 'wallet_up',
                  defaultMessage: 'Wallet',
                })}
              </span>

              <MdArrowDropDown
                size={22}
                className={`${
                  sortByBalance === 'wallet' && sortNearBalance === 'asc'
                    ? 'transform rotate-180 '
                    : ''
                } ${
                  sortByBalance === 'wallet' && sortNearBalance !== undefined
                    ? 'text-white'
                    : ''
                } cursor-pointer`}
              />
            </div>

            <div
              className="justify-self-end flex items-center cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (
                  sortOrderlyAccount === 'asc' ||
                  sortOrderlyAccount === undefined
                ) {
                  return;
                }

                setSortByBalance('orderly');
              }}
            >
              <OrderlyIconBalance />
              <span className="ml-2 ">
                {intl.formatMessage({
                  id: 'available_orderly',
                  defaultMessage: 'Available',
                })}
              </span>

              <MdArrowDropDown
                size={22}
                className={`${
                  sortByBalance === 'orderly' && sortOrderlyAccount === 'asc'
                    ? 'transform rotate-180 '
                    : ''
                } cursor-pointer ${
                  sortByBalance === 'orderly' &&
                  sortOrderlyAccount !== undefined
                    ? 'text-white'
                    : ''
                }`}
              />
            </div>
          </div>

          <div
            className="h-full overflow-auto"
            style={{
              height: isMobile ? 'calc(48px * 6)' : '',
            }}
          >
            {balances
              .filter(filterFunc)
              .sort(sortingFunc)
              .map((b: any) => {
                return (
                  <div
                    className="grid grid-cols-3 p-3 px-3 hover:bg-white hover:bg-opacity-5 text-white cursor-pointer"
                    onClick={(e: any) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onSelect(b.id);
                      onRequestClose && onRequestClose(e);
                    }}
                  >
                    <div className="flex items-center  justify-self-start">
                      <img
                        src={b.meta.icon}
                        alt=""
                        className="w-6 h-6 rounded-full flex-shrink-0"
                      />

                      <span className="ml-2 mr-1">
                        {tokenInfo.find((t: any) => t.token_account_id === b.id)
                          ?.token || ''}
                      </span>
                    </div>

                    <div
                      className="flex items-center justify-self-end relative right-6"
                      title={b.wallet_balance.toString()}
                    >
                      {digitWrapperAsset(b.wallet_balance.toString(), 2)}
                    </div>

                    <div
                      className="justify-self-end flex relative right-4 items-center"
                      title={b.holding.toString()}
                    >
                      {digitWrapperAsset(b.holding.toString(), 2)}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function ConfirmOrderModal(
  props: Modal.Props & {
    symbolFrom: string;
    symbolTo: string;
    side: 'Buy' | 'Sell';
    quantity: string;
    price: string;
    fee: '-' | number;
    totalCost: number | '-';
    onClick: () => Promise<any>;
    userInfo: ClientInfo;
    orderType: string;
  }
) {
  const {
    onRequestClose,
    symbolFrom,
    symbolTo,
    side,
    quantity,
    price,
    fee,
    totalCost,
    onClick,
    userInfo,
    orderType,
  } = props;

  const [loading, setLoading] = useState<boolean>(false);

  const isMobile = useClientMobile();
  const intl = useIntl();
  return (
    <Modal
      {...props}
      style={{
        content: {
          zIndex: 999,
        },
      }}
    >
      <div
        className={` rounded-2xl lg:w-96 xs:w-95vw ${
          isMobile ? '' : ' border border-gradientFrom border-opacity-30'
        }  bg-boxBorder text-sm text-primaryOrderly  `}
      >
        <div className="px-5 py-6 flex flex-col ">
          <div className="flex items-center pb-6 justify-between">
            <span className="text-white text-lg font-bold">
              {intl.formatMessage({
                id: 'confirm_order',
                defaultMessage: 'Confirm Order',
              })}
            </span>

            <span
              className="cursor-pointer "
              onClick={(e: any) => {
                onRequestClose && onRequestClose(e);
              }}
            >
              <IoClose size={20} />
            </span>
          </div>

          <div className="flex items-center mb-5 justify-between">
            <span>
              {orderType == 'Limit'
                ? intl.formatMessage({
                    id: 'limit_order',
                    defaultMessage: 'Limit Order',
                  })
                : 'Market Order'}
            </span>

            <span className="flex">
              <TextWrapper
                textC={side === 'Buy' ? 'text-buyGreen' : 'text-sellColorNew'}
                bg={side === 'Buy' ? 'bg-buyGreen' : 'bg-sellRed'}
                value={intl.formatMessage({
                  id: side.toLowerCase(),
                  defaultMessage: side,
                })}
              ></TextWrapper>
            </span>
          </div>

          <div className="flex items-center mb-5 justify-between">
            <span>
              {intl.formatMessage({
                id: 'qty.',
                defaultMessage: 'Qty.',
              })}
            </span>

            <span className="flex items-center">
              <span className="text-white mr-2">
                {numberWithCommas(quantity)}
              </span>

              <TextWrapper
                textC="text-primaryText"
                className="text-xs py-0 px-1"
                value={symbolFrom}
              ></TextWrapper>
            </span>
          </div>

          <div className="flex items-center mb-5 justify-between">
            <span>
              {intl.formatMessage({
                id: 'price',
                defaultMessage: 'Price',
              })}
            </span>

            <span className="flex items-center">
              <span className="text-white mr-2">{numberWithCommas(price)}</span>
              <TextWrapper
                textC="text-primaryText"
                className="text-xs py-0 px-1"
                value={`${symbolTo}/${symbolFrom}`}
              ></TextWrapper>
            </span>
          </div>

          <div className="flex items-center mb-5 justify-between">
            <span className="">
              {intl.formatMessage({
                id: 'total',
                defaultMessage: 'Total',
              })}
            </span>

            <span className="flex items-center">
              <span className=" mr-2 text-white">
                {totalCost === '-'
                  ? '-'
                  : digitWrapper(totalCost.toString(), 3)}
              </span>
              <TextWrapper
                textC="text-primaryText"
                value={`${symbolTo}`}
                className="text-xs py-0 px-1"
              ></TextWrapper>
            </span>
          </div>

          <div className="flex items-center mb-5 justify-between">
            <span className="">
              {' '}
              {intl.formatMessage({
                id: 'Fees',
                defaultMessage: 'Fees',
              })}
            </span>

            <FlexRow className="">
              <span className="flex items-center mr-3">
                <span className=" mr-2 text-white">
                  {Number((userInfo?.taker_fee_rate || 0) / 100).toFixed(2)}%
                </span>
                <TextWrapper
                  textC="text-primaryText"
                  value={intl.formatMessage({
                    id: 'Taker',
                    defaultMessage: 'Taker',
                  })}
                  className="text-xs py-0 px-1"
                ></TextWrapper>
              </span>

              <span className="flex items-center">
                <span className=" mr-2 text-white">
                  {Number((userInfo?.maker_fee_rate || 0) / 100).toFixed(2)}%
                </span>
                <TextWrapper
                  textC="text-primaryText"
                  value={intl.formatMessage({
                    id: 'Maker',
                    defaultMessage: 'Maker',
                  })}
                  className="text-xs py-0 px-1"
                ></TextWrapper>
              </span>
            </FlexRow>
          </div>

          <button
            className={`rounded-lg ${
              loading
                ? 'opacity-70 cursor-not-allowed bg-buttonGradientBgOpacity'
                : ''
            } flex items-center justify-center py-3 bg-buttonGradientBg hover:bg-buttonGradientBgOpacity text-base text-white font-bold`}
            onClick={(e: any) => {
              e.preventDefault();
              e.stopPropagation();

              setLoading(true);
              onClick().then(() => {
                setLoading(false);
                onRequestClose && onRequestClose(e);
              });
            }}
            disabled={loading}
          >
            <ButtonTextWrapper
              loading={loading}
              Text={() => {
                return (
                  <span>
                    {' '}
                    {intl.formatMessage({
                      id: 'confirm',
                      defaultMessage: 'Confirm',
                    })}
                  </span>
                );
              }}
            />
          </button>
        </div>
      </div>
    </Modal>
  );
}
